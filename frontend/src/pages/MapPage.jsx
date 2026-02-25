import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import L from "leaflet";

// ================= ICONS =================

const hospitalIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4320/4320337.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30]
});


const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// ================= UTILS =================

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

// ================= COMPONENT =================

function MapPage() {

  const [position, setPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPosition([lat, lon]);
        fetchHospitals(lat, lon);
      },
      () => alert("Location access denied")
    );
  }, []);

  const fetchHospitals = async (lat, lon) => {

    const query = `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:1500,${lat},${lon});
  node["amenity"="clinic"](around:1500,${lat},${lon});
);
out body;
>;
out skel qt;
`;

    const url = "https://overpass.kumi.systems/api/interpreter";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query
      });

      if (!res.ok) return;

      const data = await res.json();
      setHospitals(data?.elements?.filter(h => h.lat && h.lon) || []);

    } catch (err) {
      console.error(err);
    }
  };

  if (!position)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Getting your location...
      </div>
    );

  const filteredHospitals = hospitals.filter(h =>
    (h.tags?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#f4f7f6]">

      {/* ================= SIDEBAR ================= */}

      <div className="md:w-80 w-full bg-white p-5 border-r overflow-y-auto">

        <h2 className="text-xl font-semibold text-green-900 mb-4">
          Nearby Hospitals
        </h2>

        <input
          type="text"
          placeholder="Search hospital..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg"
        />

        <div className="space-y-3">

          {filteredHospitals.map((h) => {
            const dist = getDistance(
              position[0],
              position[1],
              h.lat,
              h.lon
            );

            return (
              <div
                key={h.id}
                onClick={() =>
                  window.location.href =
                    `/book?hospitalName=${h.tags?.name || "Hospital"}`
                }
                className="bg-gray-50 p-3 rounded-lg shadow cursor-pointer hover:shadow-md"
              >
                <p className="font-medium">
                  {h.tags?.name || "Hospital"}
                </p>

                <p className="text-xs text-gray-500">
                  {dist} km away
                </p>
              </div>
            );
          })}

        </div>

      </div>

      {/* ================= MAP ================= */}

      <div className="flex-1 p-4">

        <div className="h-full w-full rounded-xl overflow-hidden shadow">

          <MapContainer
            center={position}
            zoom={13}
            className="h-full w-full"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* USER */}
            <Marker position={position} icon={userIcon}>
              <Popup>You are here</Popup>
            </Marker>

            {/* HOSPITALS */}
            {hospitals.map((h) => (
              <div key={h.id}>

                {/* PULSE RING */}
                <CircleMarker
                  center={[h.lat, h.lon]}
                  radius={25}
                  pathOptions={{ color: "#22c55e" }}
                  className="pulse-marker"
                />

                <Marker
                  position={[h.lat, h.lon]}
                  icon={hospitalIcon}
                >
                  <Popup>

                    <b>{h.tags?.name || "Hospital"}</b>
                    <br />

                    <button
                      onClick={() =>
                        window.location.href =
                          `/book?hospitalName=${h.tags?.name || "Hospital"}`
                      }
                      className="mt-2 bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Book Appointment
                    </button>

                  </Popup>
                </Marker>

              </div>
            ))}

          </MapContainer>

        </div>

      </div>

      {/* ================= PULSE CSS ================= */}
      <style>{`
        .pulse-marker {
          animation: pulse 2s infinite;
          fill-opacity: 0.2;
        }

        @keyframes pulse {
          0% { r: 10; opacity: 0.9; }
          70% { r: 25; opacity: 0; }
          100% { r: 10; opacity: 0; }
        }
      `}</style>

    </div>
  );
}

export default MapPage;
