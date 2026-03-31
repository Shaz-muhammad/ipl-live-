import { useEffect, useRef } from "react";

/**
 * SocialBarAd Component
 * Globally loads the Adsterra Social Bar ad script.
 * No visible JSX. Mounted once in App.tsx.
 */
const SocialBarAd = () => {
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Adsterra Social Bar Script URL
    const scriptUrl = "https://pl29015977.profitablecpmratenetwork.com/af/6d/d1/af6dd17e5e3fb98fbaa4b108a6ac83cb.js";

    // Check if script already exists to avoid duplication
    if (!scriptLoadedRef.current) {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      
      // Append script to document
      document.body.appendChild(script);
      scriptLoadedRef.current = true;
      
      console.log("SocialBarAd script injected.");

      // Cleanup not needed for a global ad script that runs once per session.
    }
  }, []);

  // Social bar doesn't require a visible container; it's managed by the script globally.
  return null;
};

export default SocialBarAd;
