import { useState, useEffect } from "react";
import { isGeolocationSupported, getCurrentLocation } from "@/lib/native-features";

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = isGeolocationSupported();

  const getLocation = async () => {
    if (!supported) {
      setError("Geolocation not supported");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentLocation();
      if (position) {
        setLocation(position);
      } else {
        setError("Could not get location");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    supported,
    getLocation,
  };
}



