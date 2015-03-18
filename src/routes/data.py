from flask import Blueprint, jsonify
from core.cache import cache

# Registers a blueprint with a name 'data' and prefix '/data'
data = Blueprint('data', __name__, url_prefix='/data')

def construct_data(region_info, places_data, supported_types):
    #supported_types = ['green', 'sport']

    # Handles /data path. Open http://127.0.0.1:5000/data to see results
    @data.route('/')
    def data_main():
        return 'Khto ne skache toi... ? Windows users :P ?'

    @data.route('/regions')
    @cache.memoize(100)
    def data_regions():
        return jsonify(results=region_info)

    @data.route('/regions/stat')
    @cache.memoize(100)
    def data_region_stat():
        stat = []
        for region in region_info:
            new_node = {'region': region['region']}

            new_node['place_frequencies'] =\
                [{'key': t, 'value': region[t]} for t in supported_types]

            stat += [new_node]

        return jsonify(results=stat)

    @data.route('/regions/stat/<int:region>')
    @cache.memoize(100)
    def data_region(region):
        region_data = {}

        places = [place for place in places_data if place['region'] == region]

        region_data['place_frequencies'] =\
            [{'key': t, 'value': len([place for place in places if place['type'] == t])} for t in supported_types]

        return jsonify(results=region_data)
            

    @data.route('/objects/types')
    def data_object_types():
        return jsonify(results=supported_types)

    @data.route('/objects/all')
    @cache.memoize(100)
    def data_object_all():
        return jsonify(results=places_data)

    @data.route('/objects/by_type/<object_type>')
    @cache.memoize(100)
    def data_objects_by_type(object_type):
        objects = [place for place in places_data if place['type'] == object_type]
        return jsonify(results=objects)

    @data.route('/objects/by_region/<int:region>')
    @cache.memoize(100)
    def data_region_objects(region):
        objects = [place for place in places_data if place['region'] == region]
        return jsonify(results=objects)

    @data.route('/objects/by_region/<int:region>/by_type/<object_type>')
    @cache.memoize(100)
    def data_region_objects_by_type(region, object_type):
        objects = [place for place in places_data if place['region'] == region and place['type'] == object_type]
        return jsonify(results=objects)