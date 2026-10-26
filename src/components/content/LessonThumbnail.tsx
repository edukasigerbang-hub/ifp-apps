import { useEffect, useState } from "react";
import type { CatalogLessonEntry } from "../../content/catalog";
import { bundledCoverUrl, imageMediaTypeOf } from "../../content/lessonCovers";
import { subjectLabel } from "../../content/subjectLabel";
import { readAsset } from "../../data/contentRepository";

interface LessonThumbnailProps {
  entry: CatalogLessonEntry;
  className?: string;
}

export function LessonThumbnail({ entry, className = "" }: LessonThumbnailProps) {
  const [url, setUrl] = useState<string | null>(() =>
    entry.source === "bundled" ? bundledCoverUrl(entry.packageId, entry.coverAsset) : null
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (entry.source !== "managed" || !entry.coverAsset) return;
    let cancelled = false;
    let objectUrl: string | null = null;
    readAsset(entry.packageId, entry.version, entry.coverAsset)
      .then((bytes) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(
          new Blob([new Uint8Array(bytes)], { type: imageMediaTypeOf(entry.coverAsset!) })
        );
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [entry.packageId, entry.version, entry.coverAsset, entry.source]);

  const fallbackLabel = subjectLabel(entry.subjects[0] ?? "").slice(0, 2);

  return (
    <div className={`overflow-hidden bg-teal/10 ${className}`}>
      {url && !failed ? (
        <img
          data-lesson-thumb
          src={url}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center text-lg font-semibold text-teal-strong"
        >
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
