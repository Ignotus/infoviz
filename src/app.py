from flask import Flask, render_template, redirect, url_for
from random import uniform

from core.configuration import init
import core.parser as parser
import core.data_manip as data_manip

# Import blueprint modules
route_modules = ['data', 'citymap']
for module in route_modules:
    exec('from routes.%s import *' % (module))

app = Flask(__name__)

# Init the flask application by parameters
init(app)

# Route / will redirect users to the citymap_main function
# from the citymap blueprint
@app.route('/')
def main():
    return redirect(url_for("citymap.citymap_main"))

# Achtung! Run the app from the directory src to make it works
region_info = parser.parse_region_data('../data/polygon-info.csv')
for i in range(len(region_info)):
    region_info[i]['leisure_score'] = uniform(0, 1)
    region_info[i]['cultural_score'] = uniform(0, 1)
    region_info[i]['green_score'] = uniform(0, 1)
    region_info[i]['culinary_score'] = uniform(0, 1)
    region_info[i]['sport_score'] = uniform(0, 1)
    region_info[i]['relaxation_score'] = uniform(0, 1)
    region_info[i]['spiritual_score'] = uniform(0, 1)
    region_info[i]['activity_score'] =uniform(0, 1)

park_data = parser.parse_park_data('../data/green-areas-and-parks.csv')

park_data = data_manip.add_postcode_for_places(region_info, park_data)

#print(park_data)

construct_data(region_info = region_info)
construct_citymap()

# Registers flask modules (called Blueprints)
app.register_blueprint(data)
app.register_blueprint(citymap)

if __name__ == '__main__':
    # Run the app
    app.run()
