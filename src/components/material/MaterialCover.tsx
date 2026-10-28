import { useEffect, useState } from "react";
import {
  getCatalogCover,
  getInstalledCover,
  type CatalogQuery
} from "../../data/materialRepository";

export type MaterialCoverSource =
  | { kind: "catalog"; materialId: string; version: string; query: CatalogQuery }
  | { kind: "installed"; materialId: string };

// Cache di tingkat modul: kartu yang dirender ulang (ganti filter, tab) tidak
// memicu unduhan cover lagi.
const coverCache = new Map<string, Promise<string | null>>();

function cacheKey(source: MaterialCoverSource) {
  return `${source.kind}:${source.materialId}@${source.kind === "catalog" ? source.version : ""}`;
}

function requestCover(source: MaterialCoverSource): Promise<string | null> {
  if (source.kind === "installed") {
    return getInstalledCover(source.materialId);
  }
  return getCatalogCover({
    materialId: source.materialId,
    version: source.version,
    query: source.query
  });
}

function loadCover(source: MaterialCoverSource): Promise<string | null> {
  const key = cacheKey(source);
  const existing = coverCache.get(key);
  if (existing) {
    return existing;
  }
  const pending = requestCover(source).catch(() => null);
  coverCache.set(key, pending);
  return pending;
}

interface MaterialCoverProps {
  source: MaterialCoverSource;
  fallbackLabel: string;
  className?: string;
}

export function MaterialCover({ source, fallbackLabel, className = "" }: MaterialCoverProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadCover(source).then((value) => {
      if (!cancelled) {
        setUrl(value);
      }
    });
    return () => {
      cancelled = true;
    };
    // Identitas stabil `source` adalah cacheKey; objeknya dibangun ulang tiap render.
  }, [cacheKey(source)]);

  const initials = fallbackLabel.slice(0, 2);

  return (
    <div className={`overflow-hidden rounded-control bg-teal/10 ${className}`}>
      {url && !failed ? (
        <img
          data-material-cover
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
          data-material-cover-missing
          className="flex h-full w-full items-center justify-center text-lg font-semibold text-teal-strong"
        >
          {initials}
        </div>
      )}
    </div>
  );
}
