import { useState, useEffect } from "react";
import { isOnline, addNetworkListeners, getNetworkInfo } from "@/lib/native-features";

export function useNetworkStatus() {
  const [online, setOnline] = useState(isOnline());
  const [networkInfo, setNetworkInfo] = useState(getNetworkInfo());

  useEffect(() => {
    const cleanup = addNetworkListeners(
      () => {
        setOnline(true);
        setNetworkInfo(getNetworkInfo());
      },
      () => {
        setOnline(false);
        setNetworkInfo(getNetworkInfo());
      }
    );

    return cleanup;
  }, []);

  return {
    online,
    networkInfo,
  };
}



