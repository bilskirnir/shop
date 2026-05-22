import {useCallback, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {universeAccentStyle} from '~/lib/universeAccent';
import type {HomeSlide} from '~/lib/homeSlides';

const AUTOPLAY_MS = 7000;
const SWIPE_THRESHOLD = 45;
const COVER_CLASSES = ['hs-c0', 'hs-c1', 'hs-c2'];

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function UniverseSlider({slides}: {slides: HomeSlide[]}) {
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const reduced = useRef(false);

  const go = useCallback(
    (k: number) => {
      if (n === 0) return;
      setIndex(((k % n) + n) % n);
    },
    [n],
  );

  // Autoplay (sauf reduced-motion). Redémarre à chaque changement d'index.
  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (reduced.current || n <= 1) return;
    const t = setTimeout(() => go(index + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [index, n, go]);

  // Swipe
  const down = useRef(false);
  const startX = useRef(0);
  const deltaX = useRef(0);
  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    down.current = true;
    startX.current = e.clientX;
    deltaX.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (down.current) deltaX.current = e.clientX - startX.current;
  };
  const onPointerUp = () => {
    if (down.current && Math.abs(deltaX.current) > SWIPE_THRESHOLD) {
      go(index + (deltaX.current < 0 ? 1 : -1));
    }
    down.current = false;
  };

  if (n === 0) {
    return (
      <section className="hs-slider" aria-label="Univers Bilskirnir">
        <div className="hs-content" style={{position: 'relative', bottom: 0}}>
          <p className="hs-lore">Le catalogue arrive bientôt.</p>
        </div>
      </section>
    );
  }

  const active = slides[index];

  return (
    <section
      className="hs-slider"
      aria-roledescription="carrousel"
      aria-label="Univers Bilskirnir"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (down.current = false)}
    >
      <div
        className="hs-track"
        style={{transform: `translateX(-${index * 100}%)`}}
      >
        {slides.map((slide, i) => {
          const isStack = slide.covers.length > 1;
          return (
            <div
              key={slide.key}
              className={`hs-slide${isStack ? ' hs-stack' : ''}${
                i === index ? ' is-active' : ''
              }`}
              style={universeAccentStyle(slide.accent)}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${i + 1} / ${n} — ${slide.title}`}
              aria-hidden={i === index ? undefined : true}
            >
              {slide.heroImage ? (
                <img
                  className="hs-bg-img"
                  src={slide.heroImage.url}
                  alt=""
                  aria-hidden="true"
                />
              ) : (
                <div className="hs-bg" />
              )}
              <div className="hs-tint" />
              <div className="hs-scrim" />
              <div className="hs-fog" />

              <div className="hs-stage">
                {/* Couvertures dimensionnées par home.css (hauteur), pas via
                    Cover (qui force width:100% pour les grilles → géant ici). */}
                {isStack ? (
                  slide.covers.map((cover, c) => (
                    <img
                      key={cover.url}
                      className={`hs-cov ${COVER_CLASSES[c] ?? ''}`}
                      src={cover.url}
                      alt={cover.altText ?? ''}
                    />
                  ))
                ) : (
                  <img
                    className="hs-cov is-single"
                    src={slide.covers[0].url}
                    alt={slide.covers[0].altText ?? ''}
                  />
                )}
              </div>

              <div className="hs-content">
                <span className="hs-pill">{slide.kicker}</span>
                <h2 className="hs-title">{slide.title}</h2>
                {slide.lore ? <p className="hs-lore">{slide.lore}</p> : null}
                <div className="hs-cta">
                  <Link className="hs-btn hs-btn-fill" to={slide.primary.href}>
                    {slide.primary.label}
                  </Link>
                  {slide.secondary ? (
                    <Link className="hs-btn hs-btn-ghost" to={slide.secondary.href}>
                      {slide.secondary.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contrôles mobile : nom de l'univers actif + points */}
      <div className="hs-mobile-ctrl">
        <div className="hs-seltag">{active.title}</div>
        <div className="hs-dots" role="tablist" aria-label="Choisir un univers">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={`hs-dot${i === index ? ' is-active' : ''}`}
              aria-label={slide.title}
              aria-selected={i === index}
              role="tab"
              onClick={() => go(i)}
            />
          ))}
        </div>
      </div>

      {/* Contrôles desktop : flèches + compteur + sélecteur */}
      <div className="hs-desktop-ctrl">
        <button
          type="button"
          className="hs-arrow hs-arrow-l"
          aria-label="Univers précédent"
          onClick={() => go(index - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="hs-arrow hs-arrow-r"
          aria-label="Univers suivant"
          onClick={() => go(index + 1)}
        >
          ›
        </button>
        <div className="hs-counter" aria-hidden="true">
          <b>{String(index + 1).padStart(2, '0')}</b> / {String(n).padStart(2, '0')}
        </div>
        <div className="hs-selector">
          {slides.map((slide, i) => (
            <button
              key={slide.key}
              type="button"
              className={`hs-pick${i === index ? ' is-active' : ''}`}
              onClick={() => go(i)}
            >
              <div className="hs-pick-tag">{slide.kicker}</div>
              <div className="hs-pick-name">{slide.title}</div>
              <div className="hs-progress" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
