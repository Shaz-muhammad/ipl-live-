import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, string>;
    };
  }
}

const AdsterraBanner = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    adRef.current.innerHTML = "";

    window.atOptions = {
      key: "8f22c87a3250b93122bacf39eb4d56af",
      format: "iframe",
      height: 60,
      width: 468,
      params: {},
    };

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://www.highperformanceformat.com/8f22c87a3250b93122bacf39eb4d56af/invoke.js";
    script.async = true;

    adRef.current.appendChild(script);
  }, []);

  return <div ref={adRef} className="my-4 flex min-h-[60px] justify-center" />;
};

export default AdsterraBanner;
