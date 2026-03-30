import { useEffect } from "react";
import type { CSSProperties } from "react";

declare global {
  interface Window {
    adsbygoogle: Record<string, never>[];
  }
}

type GoogleAdSenseProps = {
  adSlot: string;
  className?: string;
  style?: CSSProperties;
};

const GoogleAdSense = ({
  adSlot,
  className,
  style,
}: GoogleAdSenseProps) => {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block", ...style }}
      data-ad-client="ca-pub-4465426091216254"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default GoogleAdSense;
