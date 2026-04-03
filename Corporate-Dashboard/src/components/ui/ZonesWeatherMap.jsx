import React from 'react';
import { Circle, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { CITY_COORDINATES } from '../../data/indianCities';

const claimTypeColors = {
  rain: '#00C896',
  heat: '#EF4444',
  flood: '#3B82F6',
  strike: '#F59E0B',
  default: '#94A3B8'
};

const getCircleColor = (typeRaw) => claimTypeColors[typeRaw] || claimTypeColors.default;

const ZonesWeatherMap = ({ events = [] }) => {
  const points = events
    .map((event) => {
      const city = CITY_COORDINATES[event.zone?.toLowerCase()];
      if (!city) return null;
      return {
        ...event,
        lat: city.lat,
        lng: city.lng,
        color: getCircleColor(event.typeRaw)
      };
    })
    .filter(Boolean);

  return (
    <div className="h-[280px] rounded-xl overflow-hidden border border-[#ffffff12] bg-[#0A0F1C]">
      <MapContainer
        center={[22.5, 79.5]}
        zoom={5}
        minZoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {points.map((point) => (
          <Circle
            key={`${point.id}-${point.zone}`}
            center={[point.lat, point.lng]}
            radius={Math.max(12000, point.claims * 130)}
            pathOptions={{
              color: point.color,
              fillColor: point.color,
              fillOpacity: 0.28,
              weight: 2
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div className="text-xs">
                <div className="font-semibold">{point.zone}</div>
                <div>{point.type}</div>
                <div>{point.claims} claims</div>
                <div>{point.weatherSummary || 'Weather loading...'}</div>
              </div>
            </Tooltip>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
};

export default ZonesWeatherMap;
