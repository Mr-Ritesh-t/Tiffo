import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not appearing
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/**
 * Click handler to update marker position
 */
function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng);
    },
  });
  return null;
}

/**
 * Component to center map on coordinates
 */
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

const LocationPicker = ({ initialPos, onLocationChange }) => {
  const [position, setPosition] = useState(initialPos || { lat: 18.5204, lng: 73.8567 }); // Default to Pune
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleMapClick = (latlng) => {
    setPosition(latlng);
    onLocationChange(latlng);
  };

  const handleGetCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          onLocationChange(newPos);
          setGettingLocation(false);
        },
        (err) => {
          console.error('Error getting location:', err);
          alert('Could not get your location. Please check permissions.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  return (
    <div className="location-picker-container">
      <div className="location-picker-header">
        <button 
          type="button" 
          className="ui-btn ui-btn-sm ui-btn-secondary"
          onClick={handleGetCurrentLocation}
          disabled={gettingLocation}
        >
          <span className="icon">{gettingLocation ? 'sync' : 'my_location'}</span>
          {gettingLocation ? 'Detecting...' : 'Detect My Location'}
        </button>
        <div className="coords-display">
          <span>Lat: {position.lat.toFixed(4)}</span>
          <span>Lng: {position.lng.toFixed(4)}</span>
        </div>
      </div>

      <div className="map-view-wrapper" style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapClickHandler onClick={handleMapClick} />
          <RecenterMap position={position} />
        </MapContainer>
      </div>
      <p className="picker-hint">
        <span className="icon">info</span>
        Click on the map to pin your exact mess location.
      </p>

      <style>{`
        .location-picker-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }
        .location-picker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .coords-display {
          font-family: monospace;
          font-size: 11px;
          color: var(--gray-500);
          display: flex;
          gap: 12px;
          background: var(--gray-50);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .picker-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--gray-500);
          margin: 0;
        }
        .picker-hint .icon {
          font-size: 14px !important;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default LocationPicker;
