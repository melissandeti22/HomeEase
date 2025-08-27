import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ResidentLocationMap = () => {
  useEffect(() => {
    const map = L.map('map').setView([-1.286389, 36.817223], 13); // Default to Nairobi

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
          L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup('You are here')
            .openPopup();
        },
        () => {
          alert('Could not get your location');
        }
      );
    } else {
      alert('Geolocation not supported by your browser');
    }
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Share Your Location</h2>
      <div id="map" style={{ height: '400px', width: '100%' }}></div>
    </div>
  );
};

export default ResidentLocationMap;
