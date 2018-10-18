
var map, infoWindow;

function initMap() {
  var myLatLng = {lat: 56.1304, lng: -106.3468};
  infoWindow = new google.maps.InfoWindow;

  map = new google.maps.Map(document.getElementById('myMap'), {
    zoom: 4,
    center: myLatLng,
    fullscreenControl: false,
    streetViewControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
      style: google.maps.ZoomControlStyle.SMALL,
    },
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN,
      mapTypeIds: ['roadmap', 'satellite', 'terrain'],
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    },
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });


  // Style markers
  map.data.setStyle(function(feature) {
      var color = 'FF0000';
      var symbol = '%E2%80%A2';  // dot

      return /** @type {google.maps.Data.StyleOptions} */ {
          visible: feature.getProperty('active'),
          icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 1,
              strokeColor:"rgb(213, 35, 32)"
          },
      };
  });
  // Draw Circles
  map.data.addListener('addfeature', function (o) {
      drawCircleOverlays(map, o.feature);
  });

  // Create the DIV to hold the control and call the GeolocationControl()
  var geolocationDiv = document.getElementById('geolocate-button');
  if (geolocationDiv) {
    var geolocationControl = new GeolocationControl(geolocationDiv, map);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(geolocationDiv);
  }
  // Back button
  var backButtonDiv = document.getElementById('back-button');
  if (backButtonDiv) {
    var backButtonControl = new BackButtonControl(backButtonDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(backButtonDiv);
  }

  // Help button
  var helpButtonDiv = document.getElementById('help-button');
  if (helpButtonDiv) {
    var helpButtonControl = new HelpButtonControl(helpButtonDiv, map);
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(helpButtonDiv);
  }

  // Create the search box and link it to the UI element.
  var input = document.getElementById('search-input');
  if (input) {
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    initAutocomplete(input, searchBox, map);
  }

  map.data.loadGeoJson('static/data/data-smaller.json');
}

function drawCircleOverlays(map, feature) {
  var circle = new google.maps.Circle({
    map: map,
    radius: 8046, // 5 miles in meters
    fillColor: "rgb(213, 35, 32)",
    fillOpacity: 0.50,
    strokeWeight: 2,
    strokeColor: "#F7FC4F"
  });

  var placeholderMarker = new google.maps.Marker({
      position: feature.getGeometry().get(),
      visible: false,
      map: map,
  });

  circle.bindTo('center', placeholderMarker, 'position');
  google.maps.event.addListener(circle, 'click', function(ev){
    addInfoWindowToCircle(feature, circle);

  });
}

/**
 * [addInfoWindowToPoint description]
 * @param {[type]} event [description]
 */
function addInfoWindowToCircle(feature, circle) {
  var airport_name = feature.getProperty('airport_name');
  var airport_type = feature.getProperty('airport_type');

  airport_type = renameAirportTypes(airport_type);
  var contentString =
    '<div id="content">'+
      '<p class="modal-header">' + airport_name + '</p>'+
      '<p>' + airport_type + '</p>'+
      '<div class="modal-content">'+
        '<p><a>More' + '</a></p>'+
        '<p><a>Request Permission' + '</a></p>'+
      '</div>'+
      '</div>';

  infoWindow.setContent("<div class='infoWindow'>"+contentString+"</div>");
  infoWindow.setPosition(circle.getCenter());
  infoWindow.open(map);
}

function renameAirportTypes(airport_type) {
  var airport_type_string = '';
  switch(airport_type) {
    case 'small_airport':
      airport_type_string = 'Small Airport';
      break;
    case 'medium_airport':
      airport_type_string = 'Medium Airport';
      break;
    case 'large_airport':
      airport_type_string = 'Large Airport';
      break;
    case 'heliport':
      airport_type_string = 'Heliport';
      break;
    default:
      airport_type_string = 'Unidentified Airspace';
  }
  return airport_type_string;
}

function GeolocationControl(controlDiv, map) {
    var controlUI = document.createElement('div');
    controlUI.style.cursor = 'pointer';
    controlUI.title = 'Click to geolocate';

    // Setup the click event listeners to geolocate user
    google.maps.event.addDomListener(controlUI, 'click', geolocate);
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      // Create a marker and center map on user location
      marker = new google.maps.Marker({
        position: pos,
        draggable: true,
        animation: google.maps.Animation.DROP,
        map: map
      });
      map.setCenter(pos);
    });
  }
}

function BackButtonControl(controlDiv, map) {
  var controlUI = document.createElement('div');
  controlUI.style.cursor = 'pointer';
  controlUI.title = 'Click to navigate back';
  controlDiv.appendChild(controlUI);
  // Setup the click event listeners: go back.
  controlUI.addEventListener('click', function() {
    window.location.href = "#";
  });
}

function HelpButtonControl(controlDiv, map) {
  // console.log("in the constructor");
  var controlUI = document.createElement('div');
  controlUI.style.cursor = 'pointer';
  controlUI.title = 'Click for help';
  controlDiv.appendChild(controlUI);
}



/**
 * [handleLocationError description]
 * @param  {[type]} browserHasGeolocation [description]
 * @param  {[type]} infoWindow            [description]
 * @param  {[type]} pos                   [description]
 * @return {[type]}                       [description]
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

function initAutocomplete(input, searchBox, map) {
  searchBox.addListener('places_changed', function () {
      var places = searchBox.getPlaces();
      if (places.length == 0) {
          return;
      }
      var markers = [];
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function (place) {
          if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
          } else {
              bounds.extend(place.geometry.location);
          }
          var pinColor = "51C43B";
          var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor);
          // Create a marker for each place.
          var marker = new google.maps.Marker({
            map: map,
            title: place.name,
            position: place.geometry.location,
            icon: pinImage,
          });

          markers.push(marker);
      });
      map.fitBounds(bounds);
  });
}


