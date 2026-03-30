import { useEffect, useRef } from "react";

declare global {
  interface Window {
    atOptions?: unknown;
  }
}

export default function AdsterraBanner() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Prevent duplicate ads
    adRef.current.innerHTML = "";

    const script1 = document.createElement("script");
    script1.type = "text/javascript";
    script1.innerHTML = `
      window.atOptions = {
        key: "8f22c87a3250b93122bacf39eb4d56af",
        format: "iframe",
        height: 60,
        width: 468,
        params: {}
      };
    `;

    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src = "https://www.highperformanceformat.com/8f22c87a3250b93122bacf39eb4d56af/invoke.js";
    script2.async = true;

    adRef.current.appendChild(script1);
    adRef.current.appendChild(script2);
  }, []);

  return (
    <div
      ref={adRef}
      className="flex justify-center items-center my-4 min-h-[60px]"
    />
  );
}
