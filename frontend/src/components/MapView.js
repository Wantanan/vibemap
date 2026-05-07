import React, { useState, useEffect, useRef } from 'react';
import './MapView.css';

export default function MapView({ places }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [mapError, setMapError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setMapError('Google Maps API key is missing. Check your .env file.');
      return;
    }
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapLoaded && places && places.length > 0) {
      initMap();
    }
  }, [mapLoaded, places]);

  const loadGoogleMaps = () => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.onload = () => setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    script.onerror = () => setMapError('Failed to load Google Maps. Check your API key.');
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const validPlaces = places.filter(p => p.location?.lat && p.location?.lng);
    if (validPlaces.length === 0) {
      setMapError('No location data available for these places.');
      return;
    }

    const center = {
      lat: validPlaces[0].location.lat,
      lng: validPlaces[0].location.lng
    };

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    validPlaces.forEach((place, i) => {
      const marker = new window.google.maps.Marker({
        position: { lat: place.location.lat, lng: place.location.lng },
        map,
        title: place.name,
        label: {
          text: `${i + 1}`,
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold'
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3aada8',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
          scale: 18
        }
      });

      const infoContent = `
        <div style="max-width:220px;padding:8px;font-family:sans-serif">
          <h3 style="font-size:14px;font-weight:600;color:#3aada8;margin:0 0 4px">
            ${place.name}
          </h3>
          <p style="font-size:12px;color:#666;margin:0 0 4px">
            📍 ${place.address || ''}
          </p>
          ${place.rating > 0 ? `
            <p style="font-size:12px;color:#f5a623;margin:0 0 4px">
              ⭐ ${place.rating}
            </p>` : ''}
          ${place.vibe_match ? `
            <span style="background:#0f6e56;color:#fff;padding:2px 8px;
              border-radius:10px;font-size:11px;font-weight:600">
              ✨ Vibe Match ${place.vibe_match}%
            </span>` : ''}
          ${place.open_now !== null ? `
            <p style="font-size:11px;margin:4px 0 0;
              color:${place.open_now ? '#0f6e56' : '#a32d2d'}">
              ${place.open_now ? '● Open Now' : '● Closed'}
            </p>` : ''}
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent
      });

      marker.addListener('click', () => {
        setSelected(place);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  };

  if (mapError) {
    return (
      <div className="mapview-error">
        <p>⚠️ {mapError}</p>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div className="mapview-loading">
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="mapview-wrap">
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '500px',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      />

      {places && places.length > 0 && (
        <div className="pin-list">
          {places.filter(p => p.location).map((place, i) => (
            <button
              key={place.place_id || i}
              className={`pin-item ${selected?.place_id === place.place_id ? 'active' : ''}`}
              onClick={() => {
                setSelected(place);
                if (mapInstanceRef.current && place.location) {
                  mapInstanceRef.current.panTo({
                    lat: place.location.lat,
                    lng: place.location.lng
                  });
                  mapInstanceRef.current.setZoom(16);
                }
              }}
            >
              <div className="pin-num">{i + 1}</div>
              <div className="pin-info">
                <div className="pin-name">{place.name}</div>
                <div className="pin-address">{place.address}</div>
              </div>
              {place.vibe_match && (
                <div className="pin-vibe">✨ {place.vibe_match}%</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}