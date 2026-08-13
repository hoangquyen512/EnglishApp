const TOPIC_FALLBACK: Record<string, string> = {
  "topic-travel": "itinerary",
  "topic-food": "complimentary",
  "topic-office": "memo",
  "topic-family": "reservation",
};

interface VocabIllustrationProps {
  imageKey: string;
  className?: string;
}

export function VocabIllustration({ imageKey, className = "" }: VocabIllustrationProps) {
  const file = TOPIC_FALLBACK[imageKey] ?? imageKey;
  return (
    <div className={`bg-cream ring-1 ring-line ${className}`}>
      <img src={`/arts/${file}.jpg`} alt="" className="block h-auto w-full object-contain" />
    </div>
  );
}
