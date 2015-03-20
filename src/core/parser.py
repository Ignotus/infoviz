import re
import xml.etree.ElementTree as ET
import dbf
import csv
import codecs
from pyproj import Proj
from shapely.geometry import shape

pa = Proj("+proj=aea +lat_1=52.16 +lat_2=52.25 +lat_0=52.2 +lon_0=4.74")

def area(polygons):
    lon, lat = zip(*polygons)
    x, y = pa(lon, lat)
    cop = {"type": "Polygon", "coordinates": [zip(x, y)]}
    return float("{0:.2f}".format(float(shape(cop).area)))

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
            borders = [map(float, coordinate[:-2].split(',')[::-1]) for coordinate in coordinates]

            regions += [{'region' : int(lexemes[0]),
                         'border' : borders,
                         'area' : area(borders)}]
    
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
            new_park['area'] = float("{0:.2f}".format(float(columns[9])))
            
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
        info['id'] = entry['zaak_id']
        info['name'] = entry['zaaknaam']
        info['streetname'] = entry['straatnaam'].strip().lower()
        info['housenumber'] = entry['huisnummer']
        info['functioncode'] = entry['klasse3_id'].strip()
        info['subtype'] = entry['klasse3'].strip()
        #info['neighbourhood'] = entry['buurt'].strip()
        db_entries += [info]
    db.close()
    return db_entries

def parse_postcode_data(file_name):

    def utf_8_encoder(unicode_csv_data):
        for line in unicode_csv_data:
            yield line.encode('utf-8')
  
    result = list()
    with codecs.open(file_name, 'rb', "utf-8") as csvfile:
        reader = csv.reader(utf_8_encoder(csvfile), delimiter=';', quotechar='"')
        for row in reader:
            if row[9].strip() in ['Amsterdam', 'Amsterdam Zuidoost', 'Amsterdam-Duivendrecht', 'Amstelveen'] and row[8].strip() != "Postbus":
                info = {}
                info['streetname'] = unicode(row[8], 'utf-8').strip().lower()
                info['postcode'] = row[3]
                info['minnumber'] = int(row[5])
                info['maxnumber'] = int(row[6])
                info['numberorder'] = row[7]
                info['coordinates'] = [row[15:17]]
                result.append(info)
    return result

def parse_functional_building_data(file_name):

    def utf_8_encoder(unicode_csv_data):
        for line in unicode_csv_data:
            yield line.encode('utf-8')

    result = list()
    with codecs.open(file_name, 'rb', "utf-8") as csvfile:
        reader = csv.reader(utf_8_encoder(csvfile), delimiter=';', quotechar='"')
        for row in reader:
            info = {}
            info['coordinate'] = [float(coord) for coord in row[0:2]]
            info['type'] = unicode(row[2], 'utf-8')
            info['subtype'] = unicode(row[3], 'utf-8')
            info['name'] = unicode(row[4], 'utf-8')
            info['region'] = int(row[5])
            result.append(info)
    return result

def parse_category_mapping(file_name):
    result = {}
    categories = []
    with open(file_name, 'rb') as csvfile:
        reader = csv.reader(csvfile, delimiter=';')
        for row in reader:
            result[row[0]] = row[1]
            if row[1] not in categories:
                categories.append(row[1])
    return result, categories


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

def parse_average_price_data(file_name, region_info):
    region_data = {}
    with open(file_name, 'r') as f:
        f.readline()
        for line in f:
            columns = line.split(',')
            postcode = int(columns[0])
            new_item = {
                'avgPrice' : int(columns[1]),
                'avgSurfaceArea' : int(columns[2]),
                'avgPricePerSquareMeter' : int(columns[3])
            }

            region_data[postcode] = new_item

    for region in region_info:
        postcode = region['region']
        if postcode in region_data:
            region.update(region_data[postcode])
