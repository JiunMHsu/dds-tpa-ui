document.addEventListener('DOMContentLoaded', function () {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWVsaXNwIiwiYSI6ImNtMGZwbWg1dTEzajEyaW4zYzB2dGo5YzcifQ.67pRGcVLHmjrFSVzz3Hh9A';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-58.4370894, -34.6075682], // Coordenadas de Buenos Aires
    zoom: 13,
  });
  var marker;
  var polygon;
  function searchLocation() {
    var location = document.getElementById('search').value;
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${mapboxgl.accessToken}&country=AR`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.features.length > 0) {
          var feature = data.features[0];
          var lat = feature.center[1];
          var lon = feature.center[0];
          map.setCenter([lon, lat]);
          map.setZoom(14);

          // Eliminar el marcador anterior si existe
          if (marker) {
            marker.remove();
          }

          // Eliminar el polígono anterior si existe
          if (polygon) {
            map.removeLayer('polygon');
            map.removeSource('polygon');
          }

          // Verificar si es una dirección específica o una ciudad
          if (feature.place_type.includes('address')) {
            // Agregar un nuevo marcador en la ubicación encontrada
            marker = new mapboxgl.Marker().setLngLat([lon, lat]).addTo(map);
          } else if (feature.place_type.includes('place')) {
            // Dibujar un polígono alrededor de la ciudad
            fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${mapboxgl.accessToken}&country=AR&types=place`
            )
              .then((response) => response.json())
              .then((data) => {
                if (data.features.length > 0) {
                  var cityFeature = data.features[0];
                  if (
                    cityFeature.geometry.type === 'Polygon' ||
                    cityFeature.geometry.type === 'MultiPolygon'
                  ) {
                    map.addSource('polygon', {
                      type: 'geojson',
                      data: cityFeature.geometry,
                    });

                    map.addLayer({
                      id: 'polygon',
                      type: 'line',
                      source: 'polygon',
                      layout: {},
                      paint: {
                        'line-color': '#FF0000',
                        'line-width': 3,
                      },
                    });
                  } else {
                    alert(
                      'No se encontraron límites de la ciudad para dibujar el polígono.'
                    );
                  }
                }
              })
              .catch((error) => console.error('Error:', error));
          }
        } else {
          alert('Ubicación no encontrada');
        }
      })
      .catch((error) => console.error('Error:', error));
  }
});
