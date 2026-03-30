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
  const adRef = useRef<HTMLDivElement | null>(null);

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
    script.async = true;
    script.src =
      "https://www.highperformanceformat.com/8f22c87a3250b93122bacf39eb4d56af/invoke.js";

    adRef.current.appendChild(script);
  }, []);

  return (
    <div className="my-4 flex w-full justify-center">
      <div
        ref={adRef}
        className="min-h-[60px] min-w-[468px] max-w-full overflow-hidden"
      />
    </div>
  );
};

export default AdsterraBanner;
