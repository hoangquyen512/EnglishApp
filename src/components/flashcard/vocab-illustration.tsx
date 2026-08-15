import { publicUrl } from "../../lib/public-url";
import { resolveVocabArt } from "../../features/vocabulary/art";

export function artSrc(imageKey: string, topic?: string | null): string {
  if (imageKey.startsWith("http") || imageKey.startsWith("data:")) {
    return imageKey;
  }
  const resolved = imageKey.startsWith("/")
    ? imageKey
    : resolveVocabArt({
        imageKey,
        word: imageKey,
        topic: topic ?? (imageKey.startsWith("topic-") ? imageKey.slice("topic-".length) : null),
      });
  return publicUrl(resolved);
}

export function preloadVocabArts(keys: string[]): void {
  if (typeof Image === "undefined") {
    return;
  }
  for (const key of keys) {
    const img = new Image();
    img.src = artSrc(key);
  }
}

interface VocabIllustrationProps {
  imageKey: string;
  topic?: string | null;
  className?: string;
}

export function VocabIllustration({ imageKey, topic, className = "" }: VocabIllustrationProps) {
  const primary = artSrc(imageKey, topic);
  const fallback = publicUrl("/illustrations/fam-1.jpg");
  return (
    <div className={`bg-cream ring-1 ring-line ${className}`}>
      <img
        src={primary}
        alt=""
        className="block h-auto w-full object-contain"
        onError={(event) => {
          if (event.currentTarget.dataset.fallback === "1") {
            return;
          }
          event.currentTarget.dataset.fallback = "1";
          event.currentTarget.src = fallback;
        }}
      />
    </div>
  );
}
