interface CoverArtProps {
  url: string | null;
  className?: string;
}

export function CoverArt({ url, className = "" }: CoverArtProps) {
  return (
    <div className={`overflow-hidden bg-teal/10 ${className}`}>
      {url ? (
        <img
          data-cover-art
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className="block h-full w-full bg-teal/10" />
      )}
    </div>
  );
}
