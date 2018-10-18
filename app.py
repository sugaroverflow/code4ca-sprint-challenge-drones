"""
Code for Canada 2018 Fellowship
Sprint Challenge: Transport Canada
Drones Team
"""

import os
import json
import sys
from flask import Flask, render_template
from flask_googlemaps import GoogleMaps
from flask_googlemaps import Map
import pandas as pd
import numpy as np
is_prod = os.environ.get('IS_HEROKU', None)

# Create a new instance of the Flask class.
app = Flask(__name__, template_folder=".")

# Set API key based on environment.
import config
app.config['GOOGLEMAPS_KEY'] = config.api_key

# Initialize the extension.
GoogleMaps(app)

# map the URL / to the function mapview()
@app.route("/map")
def mapview():
    # initialize
    get_data()
    # creating a map in the view
    gmap = Map(
        identifier="myMap",
        lat=56.1304,
        lng=-106.3468,
    )
    # Uses a Flask function to render the home.html template
    return render_template('templates/home.html', myMap=gmap)

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
    # subset of columns
    cols = ['id_x', 'type_x', 'latitude_deg', 'longitude_deg', 'length_ft', 'width_ft', 'surface', 'frequency_mhz']
    merged_sub = merged_full[cols]
    # rename some columns
    merged_sub = merged_sub.rename(
      columns={
        'id_x':'airport_id',
        'type_x':'airport_type',
        'latitude_deg':'airport_long',
        'longitude_deg':'airport_lat',
        'length_ft':'runway_len',
        'width_ft':'runway_wdt',
        'surface':'runway_surface',
        'frequency_mhz':'radio_freq'
      }
    )
    # save to csv
    merged_sub.to_csv('data/sprint-data.csv', encoding='utf-8', index=False)

    # save to json
    json_result_string = merged_sub.to_json(
        orient='records',
        double_precision=12,
        date_format='iso'
    )
    constructGeoJson(json_result_string)


def constructGeoJson(json_result_string):
    '''
    for le googlemaps API
    '''
    json_result = json.loads(json_result_string)

    geojson = {
        'type': 'FeatureCollection',
        'features': []
    }

    for record in json_result:
        geojson['features'].append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'icon': '../img/map-icon-test.jpg',
                'coordinates': [record['airport_lat'], record['airport_long']]
            },
            'properties': {
              'airport_id': record['airport_id'],
              'airport_type': record['airport_type'],
              'airport_lat': record['airport_lat'],
              'airport_long': record['airport_long'],
              'runway_len': record['runway_len'],
              'runway_wdt': record['runway_wdt'],
              'runway_surface': record['runway_surface'],
              'radio_freq': record['radio_freq']
            }
        })

    with open('static/data/dataset.json', 'w') as f:
        f.write(json.dumps(geojson, indent=2))

if __name__ == "__main__":

    # get_data()
    # We use run() to run our app on a local server.
    app.run(debug=True)
