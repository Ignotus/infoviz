from flask import Flask, render_template, redirect, url_for
from core.configuration import init 

# Import blueprint modules
route_modules = ['data', 'citymap']
for module in route_modules:
    exec('from routes.%s import %s' % (module, module))

app = Flask(__name__)

# Init the flask application by parameters
init(app)

# Route / will redirect users to the citymap_main function
# from the citymap blueprint
@app.route('/')
def main():
  return redirect(url_for("citymap.citymap_main"))

# Registers flask modules (called Blueprints)
modules = [data, citymap]
for module in modules:
  app.register_blueprint(module)

if __name__ == '__main__':
  # Run the app
  app.run()
