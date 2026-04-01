import { useEffect } from 'react';

const PopunderAd = () => {
  useEffect(() => {
    const scriptSrc = 'https://pl29015975.profitablecpmratenetwork.com/73/7d/2f/737d2f041ba74a76dcd05146131d7269.js';
    
    // Check if script already exists to avoid duplication
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup not strictly necessary for this type of script
    };
  }, []);

  return null; // This component has no UI
};

export default PopunderAd;
