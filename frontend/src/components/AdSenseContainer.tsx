import { useEffect } from "react";

interface AdSenseProps {
  client?: string;
  slot: string;
  format?: "auto" | "fluid" | "rectangle";
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseContainer({
  client = "YOUR_ADSENSE_ID",
  slot,
  format = "auto",
  style = { display: "block" },
  className = "",
}: AdSenseProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
