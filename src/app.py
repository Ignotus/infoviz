from flask import Flask, render_template, redirect, url_for
from flask_assets import Environment, Bundle

try:
    from flask.ext.cors import CORS # The typical way to import flask-cors
except ImportError:
    # Path hack allows examples to be run without installation.
    import os
    parentdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.sys.path.insert(0, parentdir)
    from flask.ext.cors import CORS

from random import uniform

from core.configuration import init
import core.parser as parser
import core.data_manip as data_manip
import core.cache as cache

# Import blueprint modules
route_modules = ['data', 'citymap']
for module in route_modules:
    exec('from routes.%s import *' % (module))

app = Flask(__name__)


cache.init_app(app, config={'CACHE_TYPE': 'simple'})

cors = CORS(app, allow_headers='Content-Type')

# Init the flask application by parameters
init(app)

# Route / will redirect users to the citymap_main function
# from the citymap blueprint
@app.route('/')
def main():
    return redirect(url_for("citymap.citymap_main"))

# Achtung! Run the app from the directory src to make it works
region_info = parser.parse_region_data('../data/polygon-info.csv')

parser.parse_average_price_data('../data/average-housing-price.csv', region_info)

park_data = parser.parse_park_data('../data/green-areas-and-parks.csv')
park_data = data_manip.add_postcode_for_places(region_info, park_data)

sport_data = parser.parse_sport_fields_data('../data/open-sport-fields.csv')
sport_data = data_manip.add_postcode_for_places(region_info, sport_data)

# function_data = parser.parse_building_function_data('../data/FUNCTIEKAART_region.dbf')
# postcode_data = parser.parse_postcode_data('../data/postcode_NH.csv')
__category_mapping, categories = parser.parse_category_mapping('../data/matching.csv')
# functional_dataset = data_manip.create_building_function_dataset(function_data, postcode_data, category_mapping)
functional_dataset = parser.parse_functional_building_data('../data/func_data.csv')

places_data = park_data + sport_data + functional_dataset

def calc_green_stat(index):
    park_area = sum([place['area'] for place in park_data if place['region'] == region_info[index]['region']])
    return [park_area / region_info[index]['area'], park_area]

def calc_sport_stat(index):
    tmp = len([place for place in sport_data if place['region'] == region_info[index]['region']])
    return [((10 ** 5) * tmp) / region_info[index]['area'], tmp]

def split_data(index):
        all_places = [place for place in functional_dataset if place['region'] == region_info[index]['region']]
        res = {}
        for cat in categories:
            tr = len([place for place in all_places if place['type'] == cat])
            res[cat] =  ((10 ** 5 * tr) / region_info[index]['area'], tr)
        return res

categories.append('non-leisure')
categories.append('green')

maxcat = {}

index = 0
for region in region_info:
    fd = split_data(index)
    for cat in categories:
        if cat in fd:
            #print region, cat, fd[cat][0]
            region_info[index][cat] = fd[cat][0]
            region_info[index][cat + "_real"] = fd[cat][1]
        if cat == 'sport':
            sport = calc_sport_stat(index)
            if 'sport' in region_info[index]:
                region_info[index]['sport'] += sport[0]
            	region_info[index][cat + "_real"] += sport[1]
            else:
                region_info[index]['sport'] = sport[0] 
            	region_info[index][cat + "_real"] = sport[1]
        elif cat == 'green':
            green = calc_green_stat(index)
            region_info[index]['green'] = green[0]
            region_info[index]['green_real'] = green[1]
        if cat not in maxcat or region_info[index][cat] > maxcat[cat]:
	    maxcat[cat] = region_info[index][cat]

    index += 1

for region in region_info:
    for cat in categories:
        region[cat] = (region[cat]/maxcat[cat])*100

#print region_info#, places_data, categories
construct_data(region_info = region_info, places_data = places_data, supported_types=categories)
construct_citymap()

# Registers flask modules (called Blueprints)
app.register_blueprint(data)
app.register_blueprint(citymap)

assets = Environment(app)

js_main = Bundle("js/main.js", "js/main.js",
                 filters="jsmin", output="gen/min.js")

assets.register("js_main", js_main)

if __name__ == '__main__':
    # Run the app
    app.run(host='0.0.0.0', port=10052)
