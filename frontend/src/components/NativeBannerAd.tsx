import { useEffect, useRef } from 'react';

export function NativeBannerAd() {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('NativeBannerAd component mounted');
    const containerId = 'container-f6ceb718de91429d8729ddc61b2ce8c5';
    const scriptSrc = 'https://pl29023906.profitablecpmratenetwork.com/f6ceb718de91429d8729ddc61b2ce8c5/invoke.js';

    // Check if script already exists to prevent duplicate loading
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    
    if (!existingScript) {
      console.log('Injecting Adsterra script...');
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      document.body.appendChild(script);
    } else {
      console.log('Adsterra script already exists, skipping injection');
    }

    return () => {
      console.log('NativeBannerAd component unmounted');
      // Optional: Cleanup script if needed, but usually ads scripts are fine to stay
    };
  }, []);

  return (
    <div 
      ref={adRef}
      className="native-banner-ad-container"
      style={{ 
        margin: '16px 0', 
        textAlign: 'center',
        width: '100%',
        minHeight: '100px', // Ensure space is reserved
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div id="container-f6ceb718de91429d8729ddc61b2ce8c5"></div>
    </div>
  );
}
