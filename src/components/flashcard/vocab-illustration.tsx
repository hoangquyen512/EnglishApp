import type { ReactElement, ReactNode } from "react";

interface VocabIllustrationProps {
  imageKey: string;
  className?: string;
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-hidden="true">
      <rect width="320" height="180" rx="16" fill="#f4eee6" />
      <rect x="8" y="8" width="304" height="164" rx="12" fill="#fffdf9" />
      {children}
    </svg>
  );
}

function InvoiceArt() {
  return (
    <Frame>
      <rect x="96" y="28" width="128" height="124" rx="6" fill="#fff" stroke="#c2410c" strokeWidth="2" />
      <rect x="112" y="44" width="96" height="8" rx="2" fill="#1f3a5f" />
      <rect x="112" y="62" width="72" height="6" rx="2" fill="#e8dfd4" />
      <rect x="112" y="76" width="80" height="6" rx="2" fill="#e8dfd4" />
      <rect x="112" y="104" width="96" height="1" fill="#e8dfd4" />
      <rect x="160" y="116" width="48" height="10" rx="2" fill="#c2410c" />
      <circle cx="70" cy="130" r="18" fill="#f7fee7" stroke="#3f6212" strokeWidth="2" />
      <path d="M62 130 l6 6 12-14" fill="none" stroke="#3f6212" strokeWidth="3" />
    </Frame>
  );
}

function ApplicantArt() {
  return (
    <Frame>
      <circle cx="160" cy="64" r="22" fill="#f4eee6" stroke="#3d322b" strokeWidth="2" />
      <path d="M124 128c8-24 24-36 36-36s28 12 36 36" fill="#1f3a5f" />
      <rect x="210" y="48" width="70" height="88" rx="6" fill="#fff" stroke="#c2410c" strokeWidth="2" />
      <rect x="222" y="62" width="46" height="6" fill="#e8dfd4" />
      <rect x="222" y="76" width="38" height="6" fill="#e8dfd4" />
      <rect x="222" y="90" width="46" height="6" fill="#e8dfd4" />
    </Frame>
  );
}

function DeadlineArt() {
  return (
    <Frame>
      <rect x="108" y="36" width="104" height="108" rx="10" fill="#fff" stroke="#1f3a5f" strokeWidth="2" />
      <rect x="108" y="36" width="104" height="24" rx="10" fill="#c2410c" />
      <circle cx="160" cy="96" r="28" fill="#faf6f1" stroke="#3d322b" strokeWidth="2" />
      <line x1="160" y1="96" x2="160" y2="76" stroke="#c2410c" strokeWidth="3" strokeLinecap="round" />
      <line x1="160" y1="96" x2="178" y2="104" stroke="#1f3a5f" strokeWidth="3" strokeLinecap="round" />
    </Frame>
  );
}

function ConferenceArt() {
  return (
    <Frame>
      <rect x="40" y="108" width="240" height="12" rx="2" fill="#e8dfd4" />
      <rect x="70" y="86" width="36" height="22" rx="4" fill="#1f3a5f" />
      <rect x="118" y="86" width="36" height="22" rx="4" fill="#1f3a5f" />
      <rect x="166" y="86" width="36" height="22" rx="4" fill="#1f3a5f" />
      <rect x="214" y="86" width="36" height="22" rx="4" fill="#1f3a5f" />
      <rect x="132" y="40" width="56" height="28" rx="4" fill="#c2410c" />
      <polygon points="160,68 152,86 168,86" fill="#c2410c" />
    </Frame>
  );
}

function ShipmentArt() {
  return (
    <Frame>
      <rect x="70" y="70" width="90" height="70" rx="4" fill="#c2410c" />
      <rect x="160" y="86" width="80" height="54" rx="4" fill="#9a3412" />
      <path d="M70 92h90M160 104h80" stroke="#faf6f1" strokeWidth="2" />
      <rect x="210" y="48" width="50" height="28" fill="#1f3a5f" />
      <polygon points="210,48 260,48 248,36 222,36" fill="#3d322b" />
    </Frame>
  );
}

function BudgetArt() {
  return (
    <Frame>
      <rect x="70" y="110" width="28" height="36" fill="#e8dfd4" />
      <rect x="110" y="88" width="28" height="58" fill="#1f3a5f" />
      <rect x="150" y="64" width="28" height="82" fill="#c2410c" />
      <rect x="190" y="78" width="28" height="68" fill="#3f6212" />
      <rect x="230" y="96" width="28" height="50" fill="#e8dfd4" />
      <path d="M78 56h170" stroke="#3d322b" strokeWidth="2" />
    </Frame>
  );
}

function EmployeeArt() {
  return (
    <Frame>
      <circle cx="110" cy="70" r="18" fill="#f4eee6" stroke="#3d322b" strokeWidth="2" />
      <path d="M84 124c6-20 16-30 26-30s20 10 26 30" fill="#1f3a5f" />
      <circle cx="210" cy="70" r="18" fill="#f4eee6" stroke="#3d322b" strokeWidth="2" />
      <path d="M184 124c6-20 16-30 26-30s20 10 26 30" fill="#c2410c" />
      <rect x="148" y="40" width="24" height="88" rx="4" fill="#e8dfd4" />
    </Frame>
  );
}

function ReservationArt() {
  return (
    <Frame>
      <rect x="86" y="40" width="148" height="100" rx="10" fill="#fff" stroke="#1f3a5f" strokeWidth="2" />
      <rect x="108" y="58" width="104" height="14" rx="4" fill="#c2410c" />
      <rect x="108" y="84" width="64" height="10" rx="2" fill="#e8dfd4" />
      <rect x="108" y="104" width="80" height="10" rx="2" fill="#e8dfd4" />
      <circle cx="210" cy="112" r="10" fill="#f7fee7" stroke="#3f6212" strokeWidth="2" />
    </Frame>
  );
}

function InventoryArt() {
  return (
    <Frame>
      <rect x="64" y="96" width="52" height="44" fill="#c2410c" />
      <rect x="122" y="72" width="52" height="68" fill="#9a3412" />
      <rect x="180" y="50" width="52" height="90" fill="#1f3a5f" />
      <rect x="238" y="84" width="40" height="56" fill="#e8dfd4" />
      <path d="M64 96h52M122 72h52M180 50h52" stroke="#faf6f1" strokeWidth="2" />
    </Frame>
  );
}

function MemoArt() {
  return (
    <Frame>
      <rect x="92" y="32" width="136" height="116" rx="4" fill="#fff7ed" stroke="#c2410c" strokeWidth="2" />
      <rect x="112" y="54" width="96" height="8" fill="#1f3a5f" />
      <rect x="112" y="74" width="80" height="6" fill="#e8dfd4" />
      <rect x="112" y="90" width="88" height="6" fill="#e8dfd4" />
      <rect x="112" y="106" width="72" height="6" fill="#e8dfd4" />
      <polygon points="200,32 228,32 228,60" fill="#c2410c" />
    </Frame>
  );
}

function HeadquartersArt() {
  return (
    <Frame>
      <rect x="70" y="70" width="70" height="76" fill="#1f3a5f" />
      <rect x="150" y="40" width="56" height="106" fill="#c2410c" />
      <rect x="216" y="82" width="50" height="64" fill="#3d322b" />
      <rect x="84" y="86" width="12" height="16" fill="#faf6f1" />
      <rect x="108" y="86" width="12" height="16" fill="#faf6f1" />
      <rect x="164" y="56" width="12" height="16" fill="#faf6f1" />
      <rect x="184" y="56" width="12" height="16" fill="#faf6f1" />
    </Frame>
  );
}

function ItineraryArt() {
  return (
    <Frame>
      <rect x="70" y="40" width="120" height="108" rx="6" fill="#fff" stroke="#1f3a5f" strokeWidth="2" />
      <rect x="86" y="56" width="88" height="8" fill="#c2410c" />
      <rect x="86" y="76" width="70" height="6" fill="#e8dfd4" />
      <rect x="86" y="92" width="70" height="6" fill="#e8dfd4" />
      <rect x="86" y="108" width="54" height="6" fill="#e8dfd4" />
      <circle cx="230" cy="86" r="32" fill="#f4eee6" stroke="#c2410c" strokeWidth="3" />
      <path d="M230 86 l14 -10" stroke="#1f3a5f" strokeWidth="3" />
    </Frame>
  );
}

function OccupancyArt() {
  return (
    <Frame>
      <rect x="60" y="70" width="200" height="70" rx="8" fill="#1f3a5f" />
      <rect x="78" y="86" width="28" height="36" fill="#faf6f1" />
      <rect x="118" y="86" width="28" height="36" fill="#c2410c" />
      <rect x="158" y="86" width="28" height="36" fill="#faf6f1" />
      <rect x="198" y="86" width="28" height="36" fill="#c2410c" />
      <polygon points="60,70 160,36 260,70" fill="#9a3412" />
    </Frame>
  );
}

function ComplimentaryArt() {
  return (
    <Frame>
      <ellipse cx="160" cy="118" rx="70" ry="18" fill="#e8dfd4" />
      <path d="M110 110c10-40 30-56 50-56s40 16 50 56" fill="#fff" stroke="#c2410c" strokeWidth="2" />
      <circle cx="160" cy="70" r="10" fill="#3f6212" />
      <rect x="210" y="48" width="46" height="28" rx="6" fill="#c2410c" />
      <text x="233" y="67" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Georgia">
        FREE
      </text>
    </Frame>
  );
}

function AuthorizeArt() {
  return (
    <Frame>
      <rect x="90" y="44" width="140" height="96" rx="8" fill="#fff" stroke="#1f3a5f" strokeWidth="2" />
      <rect x="108" y="64" width="104" height="10" fill="#e8dfd4" />
      <rect x="108" y="84" width="80" height="8" fill="#e8dfd4" />
      <path d="M128 122c10-16 24-16 34 0" fill="none" stroke="#c2410c" strokeWidth="3" />
      <circle cx="210" cy="118" r="14" fill="#f7fee7" stroke="#3f6212" strokeWidth="2" />
      <path d="M204 118 l5 5 10-12" fill="none" stroke="#3f6212" strokeWidth="3" />
    </Frame>
  );
}

function BrochureArt() {
  return (
    <Frame>
      <rect x="78" y="40" width="76" height="108" rx="4" fill="#c2410c" />
      <rect x="154" y="40" width="76" height="108" rx="4" fill="#fff" stroke="#1f3a5f" strokeWidth="2" />
      <rect x="94" y="56" width="44" height="8" fill="#faf6f1" />
      <rect x="170" y="56" width="44" height="8" fill="#e8dfd4" />
      <rect x="170" y="74" width="36" height="6" fill="#e8dfd4" />
      <circle cx="192" cy="110" r="16" fill="#f4eee6" />
    </Frame>
  );
}

function TopicTravelArt() {
  return (
    <Frame>
      <rect x="70" y="90" width="180" height="40" rx="8" fill="#1f3a5f" />
      <circle cx="100" cy="132" r="14" fill="#3d322b" />
      <circle cx="220" cy="132" r="14" fill="#3d322b" />
      <polygon points="90,90 130,50 170,90" fill="#c2410c" />
    </Frame>
  );
}

function TopicFoodArt() {
  return (
    <Frame>
      <ellipse cx="160" cy="110" rx="60" ry="16" fill="#e8dfd4" />
      <circle cx="160" cy="88" r="34" fill="#c2410c" />
      <path d="M160 54c8 12 8 20 0 28c-8-8-8-16 0-28z" fill="#3f6212" />
    </Frame>
  );
}

function TopicOfficeArt() {
  return (
    <Frame>
      <rect x="86" y="50" width="148" height="88" rx="6" fill="#1f3a5f" />
      <rect x="100" y="64" width="120" height="60" fill="#faf6f1" />
      <rect x="148" y="138" width="24" height="12" fill="#3d322b" />
    </Frame>
  );
}

function TopicFamilyArt() {
  return (
    <Frame>
      <circle cx="130" cy="70" r="16" fill="#f4eee6" stroke="#3d322b" strokeWidth="2" />
      <circle cx="190" cy="70" r="16" fill="#f4eee6" stroke="#3d322b" strokeWidth="2" />
      <circle cx="160" cy="108" r="12" fill="#f4eee6" stroke="#c2410c" strokeWidth="2" />
      <path d="M108 128c8-18 16-26 22-26s14 8 22 26" fill="#1f3a5f" />
      <path d="M168 128c8-18 16-26 22-26s14 8 22 26" fill="#c2410c" />
    </Frame>
  );
}

function FallbackArt() {
  return (
    <Frame>
      <rect x="110" y="44" width="100" height="92" rx="8" fill="#fff" stroke="#c2410c" strokeWidth="2" />
      <circle cx="160" cy="90" r="18" fill="#f4eee6" />
      <rect x="132" y="116" width="56" height="8" rx="2" fill="#e8dfd4" />
    </Frame>
  );
}

const ART: Record<string, () => ReactElement> = {
  invoice: InvoiceArt,
  applicant: ApplicantArt,
  deadline: DeadlineArt,
  conference: ConferenceArt,
  shipment: ShipmentArt,
  budget: BudgetArt,
  employee: EmployeeArt,
  reservation: ReservationArt,
  inventory: InventoryArt,
  memo: MemoArt,
  headquarters: HeadquartersArt,
  itinerary: ItineraryArt,
  occupancy: OccupancyArt,
  complimentary: ComplimentaryArt,
  authorize: AuthorizeArt,
  brochure: BrochureArt,
  "topic-travel": TopicTravelArt,
  "topic-food": TopicFoodArt,
  "topic-office": TopicOfficeArt,
  "topic-family": TopicFamilyArt,
};

export function VocabIllustration({ imageKey, className = "" }: VocabIllustrationProps) {
  const Art = ART[imageKey] ?? FallbackArt;
  return (
    <div className={`overflow-hidden rounded-[16px] ${className}`}>
      <Art />
    </div>
  );
}
