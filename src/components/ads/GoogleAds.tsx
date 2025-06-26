import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface GoogleAdsProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  className?: string;
}

export function GoogleAds({ adSlot, adFormat = 'auto', className = '' }: GoogleAdsProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with your AdSense Publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// Interstitial Ad Component
export function InterstitialAd() {
  const showInterstitial = () => {
    if (typeof window !== 'undefined' && window.adsbygoogle) {
      window.adsbygoogle.push({
        params: {
          google_ad_client: "ca-pub-YOUR_PUBLISHER_ID", // Replace with your AdSense Publisher ID
          enable_page_level_ads: true
        }
      });
    }
  };

  useEffect(() => {
    // Show interstitial ad after component mounts
    const timer = setTimeout(() => {
      showInterstitial();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return null; // Interstitial ads don't render visible content
}

// Rewarded Ad Component
export function RewardedAd({ onReward }: { onReward: () => void }) {
  const showRewardedAd = () => {
    // This is a placeholder for rewarded ad implementation
    // In a real implementation, you would integrate with Google AdMob or similar
    console.log('Showing rewarded ad...');
    
    // Simulate ad completion and reward
    setTimeout(() => {
      onReward();
    }, 3000);
  };

  return (
    <button
      onClick={showRewardedAd}
      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Watch Ad for 3 Free Tokens
    </button>
  );
}