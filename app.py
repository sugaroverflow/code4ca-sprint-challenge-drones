"""
Code for Canada 2018 Fellowship
Sprint Challenge: Transport Canada
Drones Team
"""

from flask import Flask, render_template
from flask_googlemaps import GoogleMaps
from flask_googlemaps import Map
import numpy as np
import pandas as pd
import config

app = Flask(__name__, template_folder=".")
# you can set key as config
app.config['GOOGLEMAPS_KEY'] = config.api_key

# Initialize the extension
GoogleMaps(app)

@app.route("/")
def mapview():
    # creating a map in the view
    myfirstmap = Map(
        identifier="myfirstmap",
        lat=37.4419,
        lng=-122.1419,
        markers=[
          {
             'icon': 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
             'lat': 37.4419,
             'lng': -122.1419,
             'infobox': "<b>Hello World</b>"
          },
          {
             'icon': 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
             'lat': 37.4300,
             'lng': -122.1400,
             'infobox': "<b>Hello World from other place</b>"
          }
        ]
    )
    return render_template('templates/index.html', myfirstmap=myfirstmap)

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
    get_data()
    app.run(debug=True)
