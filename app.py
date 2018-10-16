"""
Code for Canada 2018 Fellowship
Sprint Challenge: Transport Canada
Drones Team
"""

import os
from flask import Flask, render_template
from flask_googlemaps import GoogleMaps
from flask_googlemaps import Map
import pandas as pd
is_prod = os.environ.get('IS_HEROKU', None)

# Create a new instance of the Flask class.
app = Flask(__name__, template_folder=".")

# Set API key based on environment.
if is_prod:
  app.config['GOOGLEMAPS_KEY'] = os.environ['api_key']
else:
  import config
  app.config['GOOGLEMAPS_KEY'] = config.api_key

# Initialize the extension.
GoogleMaps(app)

# map the URL / to the function mapview()
@app.route("/")
def mapview():
    # creating a map in the view
    gmap = Map(
        identifier="theMap",
        lat=56.1304,
        lng=-106.3468,
    )
    # Read the data from the csv.
    data = pd.read_csv('data/merged-data.csv')

    # Uses a Flask function to render the home.html template
    return render_template('templates/home.html', theMap=gmap)

def get_data():
    '''
    Read the airports, runway, and frequency CSV files
    and merge the data into one csv, including only the
    columns of data that we need.
    '''
    data = pd.read_csv("data/airports.csv")
    data_runways = pd.read_csv("data/runways.csv")
    data_freq = pd.read_csv("data/airport-frequencies.csv")
    # filter airport data by Canada & !closed airports
    data = data[(data.iso_country == 'CA') & (data.type != 'closed')]
    # get airport codes
    ap_codes =  data[['id']]
    # only a subset of the columns
    ap_sub = data[['id', 'type', 'name', 'latitude_deg', 'longitude_deg']]
    rw_sub = data_runways[['id', 'airport_ref', 'length_ft', 'width_ft', 'surface']]
    frq_sub = data_freq[['airport_ref', 'type', 'frequency_mhz']]
    # attempt to merge airports and runways
    merged_inner = pd.merge(left=ap_sub,right=rw_sub, left_on='id', right_on='airport_ref')
    # merge with frequencies
    merged_full = pd.merge(left=merged_inner, right=frq_sub, left_on='id_x', right_on='airport_ref')
    # save to a file
    merged_full.to_csv('data/sprint-data.csv', encoding='utf-8', index=False)

if __name__ == "__main__":
    # Initialize the geocoder.

    get_data()
    # We use run() to run our app on a local server.
    app.run(debug=True)
