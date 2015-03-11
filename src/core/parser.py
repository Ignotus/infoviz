import re
import xml.etree.ElementTree as ET
import dbf

def parse_region_data(file_name):
    # [{'region' : id, 'border' : [[x1, y1], [x2, y2], ..]}]
    regions = []
    with open(file_name, 'r') as f:
        f.readline()
        for line in f:
            # Skipping total immigrants & town columns
            lexemes = filter(None, re.compile(r'(\d+),\d+,[^,]+,"([^"]+)"\n').split(line))
            if len(lexemes) <= 1:
                continue

            coordinates = ET.fromstring(lexemes[1])[0][0][0].text.split(' ')
            regions += [{'region' : int(lexemes[0]),
                         'border' : [map(float, coordinate[:-2].split(',')[::-1]) for coordinate in coordinates]}]
    
    return regions

def parse_park_data(file_name):
    parks = []
    with open(file_name, 'r') as f:
        f.readline()
        for line in f:
            columns = line.split(';')
            if len(columns) < 13:
                continue

            new_park = {}
            new_park['name'] = columns[5][1:-1]
            new_park['coordinate'] = [float(num) for num in columns[11:13]][::-1]
            # TODO: Change to the correct one
            new_park['type'] = 'green'
            new_park['subtype'] = 'park'
            
            polygons = re.findall(r'\(([^()]+)\)', columns[10])
            coordinates = [[[float(number)
                             for number in coordinate.split()][::-1]
                            for coordinate in polygon.split(',')]
                           for polygon in polygons]

            new_park['borders'] = coordinates
            parks += [new_park]
    return parks

def parse_building_function_data(file_name):
    db = dbf.Table(file_name)
    db.open()
    db_entries = list()
    for entry in db:
	info = {}
	info['streetname'] = entry['straatnaam']
	info['housenumber'] = entry['huisnummer']
	info['functioncode'] = entry['klasse3_id']
	info['functiondescription'] = entry['klasse3']
	info['neighbourhood'] = entry['buurt']
	db_entries += [info]
    db.close()
    return db_entries

def parse_sport_fields_data(file_name):
    sport_fields = []
    with open(file_name, 'r') as f:
        f.readline()
        for line in f:
            columns = line.split(';')
            if len(columns) < 15:
                continue

            new_field = {}
            new_field['name'] = columns[3][1:-1]
            new_field['type'] = 'sport'
            new_field['subtype'] = columns[4][1:-1]
            new_field['coordinate'] = [float(num) for num in columns[13:15]][::-1]
            # TODO: We have addresses here, map to regions with it

            sport_fields += [new_field]

    return sport_fields

