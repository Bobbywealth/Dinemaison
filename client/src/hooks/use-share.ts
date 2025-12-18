import { useState } from "react";
import { isShareSupported, shareContent } from "@/lib/native-features";

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);
  const supported = isShareSupported();

  const share = async (data: {
    title?: string;
    text?: string;
    url?: string;
  }): Promise<boolean> => {
    if (!supported) return false;

    setIsSharing(true);
    try {
      const result = await shareContent(data);
      return result;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    share,
    isSharing,
    supported,
  };
}

