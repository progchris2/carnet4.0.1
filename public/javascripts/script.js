  function initMap() {

    var uluru = {lat: 48.86, lng: 2.35};
    var map = new google.maps.Map(document.getElementById('map'), {
      zoom: 10,
      center: uluru
    });

    var lattitude= document.getElementsByClassName("rdv-lat");
    var longitude= document.getElementsByClassName("rdv-lon");

    for (var i = 0; i < lattitude.length; i++) {

      var marker = new google.maps.Marker({
        position: {lat : parseFloat(lattitude[i].value), lng: parseFloat(longitude[i].value)},
        map: map
      });
    }

    var input = document.getElementById('adress_map_rdv');
    var options = {
      types: ['geocode']
    };
    autocomplete = new google.maps.places.Autocomplete(input, options);
    }
