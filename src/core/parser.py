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
            regions += [{'region' : lexemes[0],
                         'border' : [coordinate[:-2].split(',') for coordinate in coordinates]}]
    
    return regions