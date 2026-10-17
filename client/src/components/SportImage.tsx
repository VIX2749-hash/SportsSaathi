import React, { useState } from 'react';
import { getSportImage, createSvgPlaceholder } from '../utils/sportsImages';

interface SportImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackTitle?: string;
}

export const SportImage: React.FC<SportImageProps> = ({
  src,
  alt = '',
  category,
  fallbackTitle,
  className = '',
  ...rest
}) => {
  // Check if initial src is missing or a known dead URL
  const sanitizeInitialSrc = (url?: string) => {
    if (!url || url.includes('1531415074868-036b1c5d53ec') || url.includes('1517649763962-0c623266ddc0')) {
      return getSportImage(category, fallbackTitle || alt);
    }
    return url;
  };

  const [imgSrc, setImgSrc] = useState<string>(sanitizeInitialSrc(src));
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // Fallback 1: Curated verified Unsplash sport photo
      const fallbackUrl = getSportImage(category, fallbackTitle || alt);
      if (imgSrc !== fallbackUrl) {
        setImgSrc(fallbackUrl);
      } else {
        // Fallback 2: Offline SVG vector placeholder
        setImgSrc(createSvgPlaceholder(fallbackTitle || alt, category));
      }
    } else {
      // Fallback 2: Offline SVG vector placeholder
      setImgSrc(createSvgPlaceholder(fallbackTitle || alt, category));
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading="lazy"
      {...rest}
    />
  );
};
