import { useEffect, useState } from 'react';
import { getSupplierBanner } from '../data/mockSupplierDb';

export default function SupplierAdBanner() {
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    getSupplierBanner().then(setBanner);
  }, []);

  if (!banner) return null;

  if (!banner.message && !banner.imageUrl) {
    return (
      <div className="ad-banner empty">
        <span>ما في إعلانات هلّق، ترقّبوا إعلانات قريبًا.</span>
      </div>
    );
  }

  return (
    <div className="ad-banner">
      {banner.imageUrl && <img src={banner.imageUrl} alt="" />}
      <span>{banner.message}</span>
      {banner.ctaLabel && banner.ctaUrl && (
        <a href={banner.ctaUrl} target="_blank" rel="noreferrer" className="cta">{banner.ctaLabel}</a>
      )}
    </div>
  );
}
