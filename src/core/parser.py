import re
import xml.etree.ElementTree as ET

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
                         'border' : [map(float, coordinate[:-2].split(',')) for coordinate in coordinates]}]
    
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
            new_park['coordinate'] = columns[11:13]
            
            polygons = re.findall(r'\(([^()]+)\)', columns[10])
            coordinates = [[[float(number)
                             for number in coordinate.split()]
                            for coordinate in polygon.split(',')]
                           for polygon in polygons]

            new_park['borders'] = coordinates
            parks += [new_park]
    return parks
