"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { FaExpand, FaArrowLeft, FaDirections } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const containerStyle = {
  width: "100%",
  height: "200px",
  borderRadius: "0.75rem",
};

const fullScreenStyle = {
  width: "100%",
  height: "100vh",
  position: "fixed" as const,
  top: 0,
  left: 0,
  zIndex: 9999,
};

// Haversine formula to calculate distance between two lat/lng points in km
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface MapSectionProps {
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export default function MapSection({ onFullscreenChange }: MapSectionProps = {}) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestHubIdx, setNearestHubIdx] = useState<number | null>(null);

  // Dynamic hubs state
  const [hubs, setHubs] = useState<{ id: string; name: string; lat: number; lng: number }[]>([]);
  const [loadingHubs, setLoadingHubs] = useState(true);

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log('User location:', pos.coords.latitude, pos.coords.longitude, 'Accuracy:', pos.coords.accuracy);
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.error("Error getting user location:", err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch hubs from Supabase
  useEffect(() => {
    const fetchHubs = async () => {
      setLoadingHubs(true);
      const { data, error } = await supabase.from("recycling_hubs").select("id, name, lat, lng");
      if (error) {
        console.error("Error fetching hubs:", error.message);
      } else {
        setHubs(data || []);
      }
      setLoadingHubs(false);
    };
    fetchHubs();
  }, []);

  // Find nearest hub when userLocation changes
  useEffect(() => {
    if (!userLocation || hubs.length === 0) return;
    let minDist = Infinity;
    let minIdx = 0;
    hubs.forEach((hub, idx) => {
      const dist = Math.sqrt(
        Math.pow(hub.lat - userLocation.lat, 2) + Math.pow(hub.lng - userLocation.lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        minIdx = idx;
      }
    });
    setNearestHubIdx(minIdx);
  }, [userLocation, hubs]);

  // Center: user's location if available, else nearest hub, else first hub
  const center = userLocation || (nearestHubIdx !== null && hubs[nearestHubIdx]) || hubs[0];

  // Fit bounds to all hubs and user location when full screen
  useEffect(() => {
    if (isFullScreen && mapRef.current && hubs.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      hubs.forEach(hub => bounds.extend({ lat: hub.lat, lng: hub.lng }));
      if (userLocation) bounds.extend(userLocation);
      mapRef.current.fitBounds(bounds, 100); // 100px padding
    }
  }, [isFullScreen, isLoaded, userLocation, hubs]);

  // Add Escape key support to exit full-screen
  useEffect(() => {
    if (!isFullScreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullScreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen]);

  // Notify parent component when fullscreen state changes
  useEffect(() => {
    if (onFullscreenChange) {
      onFullscreenChange(isFullScreen);
    }
  }, [isFullScreen, onFullscreenChange]);

  const onLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    if (isFullScreen && hubs.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      hubs.forEach(hub => bounds.extend({ lat: hub.lat, lng: hub.lng }));
      if (userLocation) bounds.extend(userLocation);
      map.fitBounds(bounds, 100);
    }
  };

  // Calculate distances to hubs
  const hubsWithDistance = userLocation
    ? hubs.map(hub => ({
      ...hub,
      distance: getDistanceKm(userLocation.lat, userLocation.lng, hub.lat, hub.lng)
    }))
    : hubs.map(hub => ({ ...hub, distance: null }));
  const sortedHubs = hubsWithDistance.sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  const [showList, setShowList] = useState(false);

  const MapComponent = () => (
    <GoogleMap
      mapContainerStyle={isFullScreen ? fullScreenStyle : containerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      options={{
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "off" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#a7f3d0" }],
          },
        ],
        disableDefaultUI: false,
        fullscreenControl: false,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: true,
      }}
    >
      {/* User location marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          label={{ text: "You", color: "#2563eb", fontWeight: "bold", fontSize: "14px" }}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: { width: 40, height: 40 } as any,
          }}
        />
      )}
      {/* Recycling hub markers */}
      {hubs.map((hub, idx) => (
        <Marker
          key={hub.id}
          position={{ lat: hub.lat, lng: hub.lng }}
          label={{ text: hub.name, color: idx === nearestHubIdx ? "#ea580c" : "#16a34a", fontWeight: "bold", fontSize: "14px" }}
          icon={{
            url: idx === nearestHubIdx
              ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
              : "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: { width: 40, height: 40 } as any,
          }}
        />
      ))}
    </GoogleMap>
  );

  return (
    <div className="relative">
      {/* Only show the small map if not in full screen */}
      {!isFullScreen && (
        <div className="w-full h-52 rounded-xl border border-green-200 shadow-inner overflow-hidden">
          {loadingHubs ? (
            <div className="flex flex-col items-center justify-center h-full">
              <span className="text-green-700 font-semibold">Loading map...</span>
            </div>
          ) : (
            <>
              <MapComponent />
              <button
                onClick={() => setIsFullScreen(true)}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Open full screen map"
              >
                <FaExpand className="text-green-600" />
              </button>
            </>
          )}
        </div>
      )}
      {/* List of hubs with distance (toggleable) - Only show when not in fullscreen */}
      {!isFullScreen && (
        <div className="mt-4">
          <button
            onClick={() => setShowList(v => !v)}
            className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition mb-2"
          >
            {showList ? "Hide List of Hubs" : "Show List of Hubs"}
          </button>
          {showList && (
            <div className="bg-white/80 rounded-xl shadow p-4 border border-green-100 mt-2">
              <h3 className="text-lg font-bold text-green-700 mb-2">Recycling Hubs Near You</h3>
              <ul className="divide-y divide-green-100">
                {sortedHubs.map(hub => (
                  <li key={hub.id} className="py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-green-700">{hub.name}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${hub.lat},${hub.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Get Directions"
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <FaDirections size={18} />
                      </a>
                    </div>
                    <span className="text-gray-600 text-sm">
                      {hub.distance !== null ? `${hub.distance.toFixed(2)} km` : "-"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm">
          <div className="relative w-full h-full">
            <MapComponent />
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 left-4 z-[10000] bg-white/90 hover:bg-white p-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-110"
              title="Back to normal view"
            >
              <FaArrowLeft className="w-6 h-6 text-green-600" />
              <span className="text-green-700 font-semibold">Back</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
} 