import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    atOptions?: {
      key: string;
      format: string;
      height: number;
      width: number;
      params: Record<string, unknown>;
    };
  }
}

const AdsterraBanner468 = () => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptSrc = 'https://www.highperformanceformat.com/8f22c87a3250b93122bacf39eb4d56af/invoke.js';
    
    // Check if script already exists to avoid duplication
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (adRef.current && !existingScript) {
      // Set atOptions on window
      window.atOptions = {
        key: '8f22c87a3250b93122bacf39eb4d56af',
        format: 'iframe',
        height: 60,
        width: 468,
        params: {}
      };

      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      
      adRef.current.appendChild(script);
    }

    return () => {
      // Cleanup if necessary (usually scripts manage themselves)
    };
  }, []);

  return (
    <div 
      className="adsterra-banner-468-container flex justify-center w-full my-4 overflow-x-auto"
      style={{ minHeight: '60px' }}
    >
      <div 
        ref={adRef} 
        style={{ width: '468px', height: '60px' }} 
        className="flex-shrink-0"
      >
        {/* Ad will be injected here */}
      </div>
    </div>
  );
};

export default AdsterraBanner468;
