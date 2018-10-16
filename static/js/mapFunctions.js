var map;

function initMap() {
  console.log("YO initialize le map!");

  var myLatLng = {lat: 56.1304, lng: -106.3468};

  var map = new google.maps.Map(document.getElementById('theMap'), {
    zoom: 4,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Hello World!'
  });
}

