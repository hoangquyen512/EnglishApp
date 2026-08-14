import { publicUrl } from "../../lib/public-url";

const TOPIC_FALLBACK: Record<string, string> = {
  "topic-travel": "itinerary",
  "topic-food": "complimentary",
  "topic-office": "memo",
  "topic-family": "reservation",
};

export function artSrc(imageKey: string): string {
  if (imageKey.startsWith("http") || imageKey.startsWith("data:")) {
    return imageKey;
  }
  if (imageKey.startsWith("/")) {
    return publicUrl(imageKey);
  }
  const file = TOPIC_FALLBACK[imageKey] ?? imageKey;
  return publicUrl(`/arts/${file}.jpg`);
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
  className?: string;
}

export function VocabIllustration({ imageKey, className = "" }: VocabIllustrationProps) {
  const src = artSrc(imageKey);
  return (
    <div className={`bg-cream ring-1 ring-line ${className}`}>
      <img src={src} alt="" className="block h-auto w-full object-contain" />
    </div>
  );
}
