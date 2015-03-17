from flask import Blueprint, render_template

# Registers a blueprint with a name citymap and prefix /citymap
citymap = Blueprint('citymap', __name__, url_prefix='/citymap')

def construct_citymap():
    # Handles /citymap path . Open http://127.0.0.1:5000/citymap to
    # see results
    @citymap.route('/')
    def citymap_main():
        # Renders citymap.html and pass an argument id to the render
        # in the citymap.html you can read it and process it
        return render_template('citymap.html')
