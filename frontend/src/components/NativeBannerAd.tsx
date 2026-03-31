import { useEffect, useRef } from "react";

/**
 * NativeBannerAd Component
 * Renders an Adsterra Native Banner ad dynamically.
 * Follows React best practices for script injection and cleanup.
 */
const NativeBannerAd = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Container ID from the provided ad snippet
    const containerId = "container-f6ceb718de91429d8729ddc61b2ce8c5";
    
    // Check if script already exists in the document to prevent duplication
    const scriptUrl = "https://pl29023906.profitablecpmratenetwork.com/f6ceb718de91429d8729ddc61b2ce8c5/invoke.js";
    
    if (!scriptLoadedRef.current) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.setAttribute("data-cfasync", "false");
      
      // Append script to document
      document.body.appendChild(script);
      scriptLoadedRef.current = true;

      // Optional: Cleanup function to remove script on unmount
      // Note: Some ad networks might not like scripts being removed/re-added frequently
      return () => {
        // Only remove if we want to completely clean up. 
        // For ads, usually we keep it once loaded unless it causes issues.
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center my-8 w-full overflow-hidden">
      <div 
        id="container-f6ceb718de91429d8729ddc61b2ce8c5" 
        ref={adContainerRef}
        className="min-h-[250px] w-full flex justify-center items-center bg-white/5 rounded-xl border border-white/10"
      >
        {/* Adsterra will inject the ad content here */}
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest absolute">Advertisement</p>
      </div>
    </div>
  );
};

export default NativeBannerAd;
