import {useState} from 'react';
import type {CoverImage} from './Cover';

export function ProductGallery({images, alt}: {images: CoverImage[]; alt: string}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;
  const main = images[Math.min(active, images.length - 1)];
  return (
    <div className="fiche-cover-wrap">
      <img className="fiche-cover" src={main.url} alt={alt} />
      {images.length > 1 ? (
        <div className="fiche-thumbs">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              aria-label={`Image ${i + 1}`}
              className={`fiche-thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              style={{backgroundImage: `url(${img.url})`, backgroundSize: 'cover', backgroundPosition: 'center'}}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
