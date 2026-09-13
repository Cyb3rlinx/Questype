'use client';

import { useEffect, useRef } from 'react';

const HERO_VIDEO_URL = '/media/hero/hero-background.mp4';

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

export function HeroBackground({ alt }: { alt: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const prefersReducedData =
      (navigator as NavigatorWithConnection).connection?.saveData === true;

    if (prefersReducedMotion || prefersReducedData) return;

    const video = videoRef.current;
    if (!video) return;

    video.poster =
      imageRef.current?.currentSrc || '/images/hero-lighthouse.webp';
    video.src = HERO_VIDEO_URL;
    video.load();
    void video.play().catch(() => {
      // The poster remains a complete fallback if autoplay is unavailable.
    });

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  return (
    <div className="hero-media">
      {/* oxlint-disable-next-line next/no-img-element -- The responsive poster must remain pixel-aligned with the native background video. */}
      <img
        ref={imageRef}
        className="hero-landscape"
        src="/images/hero-lighthouse.webp"
        srcSet="/images/hero-lighthouse-sm.webp 900w, /images/hero-lighthouse.webp 1672w"
        sizes="100vw"
        width={1672}
        height={941}
        alt={alt}
        fetchPriority="high"
      />
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={(event) => event.currentTarget.classList.add('is-ready')}
        onError={(event) => event.currentTarget.classList.remove('is-ready')}
      />
    </div>
  );
}
