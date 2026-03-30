import { useEffect, useRef } from "react";
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
  const adRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (!adRef.current) return;

        const width = adRef.current.offsetWidth;
        if (width === 0) {
          console.warn("AdSense skipped: container width is 0");
          return;
        }

        if (typeof window !== "undefined") {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className ?? ""}`}
      style={{
        display: "block",
        width: "100%",
        minWidth: "320px",
        minHeight: "90px",
        ...style,
      }}
      data-ad-client="ca-pub-4465426091216254"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
};

export default GoogleAdSense;
