import { useEffect, useState } from "react";
import { readProfileAvatar, type Profile } from "../../data/profileRepository";

interface ProfileAvatarProps {
  profile: Profile | null;
  className?: string;
}

function initialsOf(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const second = parts.length > 1 ? parts[1]?.charAt(0) ?? "" : "";
  return `${first}${second}`.toUpperCase();
}

export function ProfileAvatar({ profile, className = "" }: ProfileAvatarProps) {
  const [url, setUrl] = useState<string | null>(null);
  const profileId = profile?.id ?? null;
  const hasAvatar = profile?.hasAvatar ?? false;

  useEffect(() => {
    if (!profileId || !hasAvatar) {
      setUrl(null);
      return;
    }
    let cancelled = false;
    readProfileAvatar(profileId)
      .then((dataUrl) => {
        if (!cancelled) setUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [profileId, hasAvatar]);

  if (url) {
    return <img data-profile-avatar src={url} alt="" className={`object-cover ${className}`} />;
  }

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center bg-teal/15 font-semibold text-teal-strong ${className}`}
    >
      {profile ? initialsOf(profile.displayName) : "…"}
    </span>
  );
}
