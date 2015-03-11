from flask import Blueprint, jsonify

# Registers a blueprint with a name 'data' and prefix '/data'
data = Blueprint('data', __name__, url_prefix='/data')

def construct_data(region_info, places_data):
    supported_types = ['green', 'sport']

    # Handles /data path. Open http://127.0.0.1:5000/data to see results
    @data.route('/')
    def data_main():
        return 'Khto ne skache toi...'

    # TODO: Cache it
    @data.route('/regions')
    def data_regions():
        return jsonify(results=region_info)

    @data.route('/regions/<int:region>')
    def data_region(region):
        region_data = {}

        places = [place for place in places_data if place['region'] == region]

        region_data['place_frequencies'] =\
            {t : len([place for place in places if place['type'] == t]) for t in supported_types}

        return jsonify(results=region_data)
            

    # TODO: Cache it
    @data.route('/objects/types')
    def data_object_types():
        return jsonify(results=supported_types)

    # TODO: Cache it
    @data.route('/objects/all')
    def data_object_all():
        return jsonify(results=places_data)

    # TODO: Cache it
    @data.route('/objects/by_type/<object_type>')
    def data_objects_by_type(object_type):
        objects = [place for place in places_data if place['type'] == object_type]
        return jsonify(results=objects)

    # TODO: Cache it
    @data.route('/objects/by_region/<int:region>')
    def data_region_objects(region):
        objects = [place for place in places_data if place['region'] == region]
        return jsonify(results=objects)

    # TODO: Cache it
    @data.route('/objects/by_region/<int:region>/by_type/<object_type>')
    def data_region_objects_by_type(region, object_type):
        objects = [place for place in places_data if place['region'] == region and place['type'] == object_type]
        return jsonify(results=objects)