import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Centre par défaut : Dakar
const DEFAULT_CENTER = [14.6937, -17.4441];

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:#44512F;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);transform:rotate(-45deg);margin-left:-11px;margin-top:-22px"></div>',
  iconSize: [0, 0],
});

/**
 * Carte Leaflet cliquable : un clic (ou un glisser du marqueur) place la
 * position exacte et appelle onPick(lat, lng). Tuiles OpenStreetMap,
 * aucune clé API requise.
 */
export default function MapPicker({ position, onPick, className = '' }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onPickRef = useRef(onPick);
  useEffect(() => { onPickRef.current = onPick; }, [onPick]);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;
    const map = L.map(ref.current, {
      center: position ? [position.lat, position.lng] : DEFAULT_CENTER,
      zoom: position ? 16 : 12,
      scrollWheelZoom: true,
    });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const place = (lat, lng) => {
      if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      else {
        markerRef.current = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const p = markerRef.current.getLatLng();
          onPickRef.current(p.lat, p.lng);
        });
      }
    };

    map.on('click', (e) => {
      place(e.latlng.lat, e.latlng.lng);
      onPickRef.current(e.latlng.lat, e.latlng.lng);
    });

    if (position) place(position.lat, position.lng);
    mapRef.current = { map, place };
    // Leaflet mesure la taille au montage : recalcule après l'affichage.
    setTimeout(() => map.invalidateSize(), 150);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La position change depuis l'extérieur (GPS / recherche) → recentrer.
  useEffect(() => {
    if (!mapRef.current || !position) return;
    mapRef.current.place(position.lat, position.lng);
    mapRef.current.map.setView([position.lat, position.lng], Math.max(mapRef.current.map.getZoom(), 15));
  }, [position]);

  return <div ref={ref} className={className} style={{ minHeight: '100%' }} />;
}
