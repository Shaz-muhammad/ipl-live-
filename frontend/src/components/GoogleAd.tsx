import { useEffect } from 'react';

// Extend the Window interface to include adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdProps {
  adSlot: string;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAd = ({ adSlot, className = "", style = {} }: GoogleAdProps) => {
  useEffect(() => {
    try {
      // Check if AdSense script is loaded and component is mounted
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense Error:", error);
    }
  }, []);

  return (
    <div 
      className={`google-ad-container ${className}`} 
      style={{ 
        margin: '16px 0', 
        textAlign: 'center', 
        width: '100%', 
        overflow: 'hidden',
        ...style 
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-4465426091216254"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};

export default GoogleAd;
