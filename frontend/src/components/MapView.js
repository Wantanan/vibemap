import React, { useState } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY } from '../api/api';
import './MapView.css';

const mapContainerStyle = { width: '100%', height: '500px', borderRadius: '16px' };

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
};

export default function MapView({ places }) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [selected, setSelected] = useState(null);

  const defaultCenter = { lat: 13.7563, lng: 100.5018 };
  const mapCenter = places && places.length > 0 && places[0].location
    ? { lat: places[0].location.lat, lng: places[0].location.lng }
    : defaultCenter;

  if (loadError) return <div className="mapview-error"><p>Failed to load map. Check your API key.</p></div>;
  if (!isLoaded) return <div className="mapview-loading"><p>Loading map...</p></div>;

  return (
    <div className="mapview-wrap">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={14}
        options={mapOptions}
      >
        {places && places.map((place, i) => (
          place.location && (
            <Marker
              key={place.place_id || i}
              position={{ lat: place.location.lat, lng: place.location.lng }}
              onClick={() => setSelected(place)}
            />
          )
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.location.lat, lng: selected.location.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="map-info-window">
              <h3 className="map-info-name">{selected.name}</h3>
              <p className="map-info-address">📍 {selected.address}</p>
              {selected.rating > 0 && <p className="map-info-rating">⭐ {selected.rating}</p>}
              {selected.vibe_match && (
                <span className="map-info-vibe">✨ Vibe Match {selected.vibe_match}%</span>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {places && places.length > 0 && (
        <div className="pin-list">
          {places.map((place, i) => (
            <button
              key={place.place_id || i}
              className={`pin-item ${selected?.place_id === place.place_id ? 'active' : ''}`}
              onClick={() => setSelected(place)}
            >
              <div className="pin-num">{i + 1}</div>
              <div className="pin-info">
                <div className="pin-name">{place.name}</div>
                <div className="pin-address">{place.address}</div>
              </div>
              {place.vibe_match && <div className="pin-vibe">✨ {place.vibe_match}%</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}