import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// A CSS marker avoids Leaflet's default image assets, which bundlers do not resolve.
const marker = L.divIcon({ className: 'event-map-pin', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 28] });

export default function EventMap({ latitude, longitude, label }) {
  const container = useRef(null);
  useEffect(() => {
    const map = L.map(container.current, { scrollWheelZoom: false }).setView([latitude, longitude], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    L.marker([latitude, longitude], { icon: marker, title: label, keyboard: false }).addTo(map);
    return () => map.remove();
  }, [latitude, longitude, label]);
  return <div className="event-map" ref={container} role="region" aria-label={`Map showing ${label}`} />;
}
