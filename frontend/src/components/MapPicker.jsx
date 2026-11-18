import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Centre par défaut : Dakar
const DEFAULT_CENTER = [14.6937, -17.4441];

const PIN_STYLE = {
  radius: 11,
  color: '#fff',
  weight: 3,
  fillColor: '#44512F',
  fillOpacity: 1,
};
const HALO_STYLE = {
  radius: 22,
  color: '#44512F',
  weight: 1.5,
  fillColor: '#44512F',
  fillOpacity: 0.15,
};

/**
 * Carte Leaflet en lecture seule : affiche un point (GPS ou adresse
 * localisée) avec recentrage automatique. Tuiles Carto (données
 * OpenStreetMap), sans clé API.
 */
export default function MapPicker({ position, className = '' }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !ref.current) return;
    const el = ref.current;
    const map = L.map(el, {
      center: position ? [position.lat, position.lng] : DEFAULT_CENTER,
      zoom: position ? 16 : 12,
      scrollWheelZoom: true,
    });
    // Tuiles Esri World Street Map (données OSM enrichies) — gratuites,
    // sans clé API : OSM bloque les apps (403) et Carto exige une clé.
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, OpenStreetMap',
    }).addTo(map);

    const place = (lat, lng) => {
      if (markerRef.current) {
        markerRef.current.pin.setLatLng([lat, lng]);
        markerRef.current.halo.setLatLng([lat, lng]);
      } else {
        const halo = L.circleMarker([lat, lng], HALO_STYLE).addTo(map);
        const pin = L.circleMarker([lat, lng], PIN_STYLE).addTo(map);
        markerRef.current = { pin, halo };
      }
    };

    if (position) place(position.lat, position.lng);
    mapRef.current = { map, place };
    // La taille du conteneur peut se stabiliser après le montage.
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // La position change (GPS / recherche d'adresse) → recentrer.
  useEffect(() => {
    if (!mapRef.current || !position) return;
    mapRef.current.place(position.lat, position.lng);
    mapRef.current.map.setView([position.lat, position.lng], Math.max(mapRef.current.map.getZoom(), 15));
  }, [position]);

  return <div ref={ref} className={className} style={{ minHeight: '100%' }} />;
}
