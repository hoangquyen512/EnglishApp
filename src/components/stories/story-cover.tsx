import { useState } from "react";
import {
  demoStoryCoverUrl,
  FALLBACK_STORY_COVER,
  isLegacyStoryCoverUrl,
} from "../../features/stories/cover-url";
import { publicUrl } from "../../lib/public-url";

interface StoryCoverProps {
  coverUrl: string;
  slug?: string | null;
  className?: string;
}

export function StoryCover({ coverUrl, slug, className }: StoryCoverProps) {
  const [failed, setFailed] = useState(false);
  const canonical = slug ? demoStoryCoverUrl(slug) : FALLBACK_STORY_COVER;
  const resolved =
    failed || isLegacyStoryCoverUrl(coverUrl)
      ? canonical
      : coverUrl || canonical;

  return (
    <img
      className={className}
      src={publicUrl(resolved)}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
