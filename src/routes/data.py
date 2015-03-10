from flask import Blueprint, jsonify

# Registers a blueprint with a name 'data' and prefix '/data'
data = Blueprint('data', __name__, url_prefix='/data')

def construct_data(region_info):
    # Handles /data path. Open http://127.0.0.1:5000/data to see results
    @data.route('/')
    def data_main():
        return '{text: \'hello world\'}'

    # Handles /data/<something>. Open http://127.0.0.1:5000/data/blahblah
    # to see results.
    # in this case argument <id> is passed to the variable id of the function.
    @data.route('/<id>')
    def data_request(id):
        return '{text: \'hello world,' + id + '\'}'

    @data.route('/regions')
    def data_regions():
        return jsonify(results=region_info)