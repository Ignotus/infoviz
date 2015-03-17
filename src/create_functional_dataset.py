import unicodecsv
import core.parser as parser
import core.data_manip as data_manip

function_data = parser.parse_building_function_data('../data/FUNCTIEKAART_region.dbf')
postcode_data = parser.parse_postcode_data('../data/postcode_NH.csv')
category_mapping, categories = parser.parse_category_mapping('../data/matching.csv')
functional_dataset = data_manip.create_building_function_dataset(function_data, postcode_data, category_mapping)

l = []
for row in functional_dataset:
    # print row['coordinates']
    # print row['type']
    # print row['subtype']
    # print row['name']
    # print row['region']
    l.append([row['coordinates'][0][0], row['coordinates'][0][1], row['type'], row['subtype'], row['name'], row['region']])

with open('../data/func_data.csv', 'w') as fp:
    a = unicodecsv.writer(fp, delimiter=';', encoding='utf-8')
    for row in l:
        print row
        a.writerow(row)


def read_functional_dataset():
    a = unicodecsv.reader(fp, delimiter=';', encoding='utf-8')
