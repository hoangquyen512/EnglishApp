import { artFor, type MotifId } from '../data/art'

type PhraseArtProps = {
  phraseId: string
  label: string
}

export function PhraseArt({ phraseId, label }: PhraseArtProps) {
  const art = artFor(phraseId)
  return (
    <svg
      className="phrase-art"
      viewBox="0 0 320 200"
      role="img"
      aria-label={label}
    >
      <rect width="320" height="200" rx="22" fill={art.bg} />
      <ellipse cx="250" cy="36" rx="70" ry="28" fill="#fff" opacity="0.28" />
      <path d="M0 148h320v52H0z" fill={art.accent} opacity="0.12" />
      {renderMotif(art.motif, art.accent)}
    </svg>
  )
}

function renderMotif(motif: MotifId, accent: string) {
  switch (motif) {
    case 'wave':
      return (
        <g>
          <Person x={92} shirt={accent} wave />
          <Person x={176} shirt="#3d6b4f" />
        </g>
      )
    case 'handshake':
      return (
        <g>
          <Person x={88} shirt={accent} />
          <Person x={180} shirt="#2f5d50" />
          <rect x="132" y="118" width="56" height="14" rx="7" fill="#e8c4a0" />
        </g>
      )
    case 'nametag':
      return (
        <g>
          <Person x={118} shirt={accent} />
          <rect x="148" y="92" width="52" height="28" rx="6" fill="#fffaf1" stroke={accent} />
          <text x="174" y="110" textAnchor="middle" fontSize="11" fill={accent}>
            LINH
          </text>
        </g>
      )
    case 'vietnam':
      return (
        <g>
          <circle cx="160" cy="96" r="46" fill="#da251d" />
          <polygon points="160,64 168,88 194,88 173,104 181,128 160,112 139,128 147,104 126,88 152,88" fill="#ffd400" />
        </g>
      )
    case 'replay':
      return <Ear accent={accent} />
    case 'shy':
      return <Person x={132} shirt={accent} shy />
    case 'chat':
      return (
        <g>
          <Bubble x={70} y={48} w={90} h={44} />
          <Bubble x={168} y={78} w={80} h={38} />
          <Person x={128} shirt={accent} />
        </g>
      )
    case 'later':
      return (
        <g>
          <Person x={128} shirt={accent} wave />
          <text x="250" y="64" fontSize="28" fill={accent}>
            👋
          </text>
        </g>
      )
    case 'menu':
      return <Card x={110} y={42} accent={accent} lines={4} />
    case 'latte':
      return <Cup x={136} y={58} accent={accent} iced />
    case 'takeaway':
      return <Cup x={136} y={50} accent={accent} lid />
    case 'sweet':
      return (
        <g>
          <Cup x={118} y={62} accent={accent} />
          <circle cx="210" cy="78" r="16" fill="#f4b4c4" />
          <circle cx="226" cy="98" r="10" fill="#f7d08a" />
        </g>
      )
    case 'sugar':
      return (
        <g>
          <rect x="118" y="70" width="84" height="64" rx="10" fill="#fffaf1" stroke={accent} />
          <text x="160" y="108" textAnchor="middle" fontSize="18" fill={accent}>
            Aa
          </text>
        </g>
      )
    case 'oat':
      return (
        <g>
          <ellipse cx="160" cy="118" rx="54" ry="22" fill="#fffaf1" />
          <ellipse cx="148" cy="86" rx="18" ry="28" fill="#d8b56a" />
          <ellipse cx="172" cy="90" rx="16" ry="24" fill="#c9a24e" />
        </g>
      )
    case 'price':
      return <Tag accent={accent} label="$" />
    case 'paycard':
      return (
        <g>
          <rect x="86" y="70" width="148" height="88" rx="14" fill={accent} />
          <rect x="86" y="92" width="148" height="18" fill="#1c1915" opacity="0.25" />
          <rect x="104" y="128" width="54" height="10" rx="5" fill="#fffaf1" opacity="0.7" />
        </g>
      )
    case 'table':
      return (
        <g>
          <ellipse cx="160" cy="128" rx="86" ry="18" fill={accent} opacity="0.25" />
          <rect x="70" y="108" width="180" height="14" rx="6" fill={accent} />
          <circle cx="118" cy="86" r="14" fill="#fffaf1" />
          <circle cx="202" cy="86" r="14" fill="#fffaf1" />
        </g>
      )
    case 'chef':
      return (
        <g>
          <Person x={132} shirt="#fffaf1" hat />
          <rect x="126" y="58" width="68" height="22" rx="8" fill="#fffaf1" stroke={accent} />
        </g>
      )
    case 'allergy':
      return (
        <g>
          <ellipse cx="160" cy="100" rx="36" ry="28" fill="#d4a574" />
          <text x="210" y="80" fontSize="36" fill="#9b2c2c">
            !
          </text>
        </g>
      )
    case 'chicken':
      return (
        <g>
          <ellipse cx="160" cy="112" rx="50" ry="22" fill="#c45c26" />
          <circle cx="126" cy="86" r="18" fill="#e8a04a" />
          <rect x="150" y="78" width="44" height="16" rx="8" fill="#8b5a2b" />
        </g>
      )
    case 'water':
      return (
        <g>
          <rect x="132" y="54" width="56" height="92" rx="12" fill="#9fd4e6" />
          <rect x="140" y="86" width="40" height="50" rx="8" fill="#2b6cb0" opacity="0.35" />
        </g>
      )
    case 'wrongdish':
      return (
        <g>
          <circle cx="160" cy="100" r="46" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M140 80l40 40M180 80l-40 40" stroke="#9b2c2c" strokeWidth="6" />
        </g>
      )
    case 'bill':
      return <Card x={104} y={48} accent={accent} lines={3} wide />
    case 'split':
      return (
        <g>
          <Card x={70} y={58} accent={accent} lines={2} />
          <Card x={170} y={58} accent={accent} lines={2} />
        </g>
      )
    case 'browse':
      return (
        <g>
          <Person x={128} shirt={accent} />
          <rect x="214" y="62" width="36" height="70" rx="6" fill="#fffaf1" stroke={accent} />
        </g>
      )
    case 'size':
      return (
        <g>
          <path d="M110 70h40l12 70H98z" fill={accent} />
          <path d="M168 58h52l16 82h-84z" fill={accent} opacity="0.55" />
        </g>
      )
    case 'fitting':
      return (
        <g>
          <rect x="118" y="40" width="84" height="120" rx="8" fill="#fffaf1" stroke={accent} />
          <Person x={124} shirt={accent} />
        </g>
      )
    case 'cost':
      return <Tag accent={accent} label="?" />
    case 'sale':
      return <Tag accent={accent} label="%" />
    case 'take':
      return (
        <g>
          <Person x={100} shirt={accent} />
          <rect x="196" y="86" width="48" height="48" rx="8" fill="#c45c26" />
        </g>
      )
    case 'returns':
      return (
        <g>
          <rect x="118" y="62" width="84" height="70" rx="10" fill="#fffaf1" stroke={accent} />
          <path d="M150 118c20-28 40-8 20 8" fill="none" stroke={accent} strokeWidth="5" />
        </g>
      )
    case 'bag':
      return (
        <g>
          <path d="M112 86h96l-10 70H122z" fill={accent} />
          <path d="M138 86c0-22 44-22 44 0" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'station':
      return (
        <g>
          <rect x="70" y="70" width="180" height="70" rx="8" fill={accent} />
          <rect x="88" y="86" width="36" height="28" fill="#fffaf1" />
          <rect x="142" y="86" width="36" height="28" fill="#fffaf1" />
          <rect x="196" y="86" width="36" height="28" fill="#fffaf1" />
        </g>
      )
    case 'museum':
      return (
        <g>
          <rect x="70" y="96" width="180" height="50" fill={accent} />
          <polygon points="160,40 250,96 70,96" fill={accent} />
          <rect x="100" y="110" width="18" height="36" fill="#fffaf1" />
          <rect x="151" y="110" width="18" height="36" fill="#fffaf1" />
          <rect x="202" y="110" width="18" height="36" fill="#fffaf1" />
        </g>
      )
    case 'walk':
      return <Person x={132} shirt={accent} walk />
    case 'turn':
      return (
        <g>
          <path d="M80 130h90V70" fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round" />
          <polygon points="170,54 196,76 156,76" fill={accent} />
        </g>
      )
    case 'timer':
      return (
        <g>
          <circle cx="160" cy="100" r="44" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <path d="M160 100V68M160 100h24" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        </g>
      )
    case 'bus':
      return (
        <g>
          <rect x="64" y="74" width="192" height="70" rx="16" fill={accent} />
          <rect x="80" y="88" width="44" height="28" fill="#fffaf1" />
          <rect x="138" y="88" width="44" height="28" fill="#fffaf1" />
          <circle cx="108" cy="150" r="12" fill="#211c16" />
          <circle cx="210" cy="150" r="12" fill="#211c16" />
        </g>
      )
    case 'lost':
      return (
        <g>
          <Person x={128} shirt={accent} shy />
          <text x="230" y="80" fontSize="32" fill={accent}>
            ?
          </text>
        </g>
      )
    case 'map':
      return (
        <g>
          <rect x="78" y="48" width="164" height="112" rx="12" fill="#fffaf1" stroke={accent} />
          <path d="M100 80h120M90 110h140M110 140h80" stroke={accent} strokeWidth="4" />
          <circle cx="168" cy="110" r="8" fill="#c45c26" />
        </g>
      )
    case 'checkin':
      return (
        <g>
          <rect x="60" y="78" width="200" height="64" rx="10" fill={accent} />
          <Person x={86} shirt="#fffaf1" />
          <rect x="188" y="92" width="54" height="36" rx="6" fill="#fffaf1" />
        </g>
      )
    case 'clock':
      return (
        <g>
          <circle cx="160" cy="100" r="46" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <text x="160" y="108" textAnchor="middle" fontSize="18" fill={accent}>
            14:00
          </text>
        </g>
      )
    case 'breakfast':
      return (
        <g>
          <ellipse cx="160" cy="108" rx="58" ry="20" fill="#fffaf1" />
          <ellipse cx="148" cy="96" rx="22" ry="14" fill="#f4c36a" />
          <circle cx="186" cy="98" r="10" fill="#c45c26" />
        </g>
      )
    case 'wifi':
      return (
        <g>
          <path
            d="M90 120c38-40 102-40 140 0M112 136c24-24 72-24 96 0M148 154c8-8 16-8 24 0"
            fill="none"
            stroke={accent}
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>
      )
    case 'towel':
      return (
        <g>
          <rect x="96" y="58" width="128" height="88" rx="12" fill="#fffaf1" />
          <rect x="108" y="70" width="104" height="64" rx="8" fill={accent} opacity="0.2" />
        </g>
      )
    case 'ac':
      return (
        <g>
          <rect x="70" y="62" width="180" height="70" rx="12" fill="#fffaf1" stroke={accent} />
          <path d="M90 150c20-16 40 16 60 0s40 16 60 0 40 16 60 0" fill="none" stroke={accent} strokeWidth="5" />
        </g>
      )
    case 'luggage':
      return (
        <g>
          <rect x="118" y="70" width="84" height="80" rx="10" fill={accent} />
          <rect x="136" y="48" width="48" height="22" rx="8" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'wakeup':
      return (
        <g>
          <circle cx="160" cy="104" r="44" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <path d="M160 104V72M160 104h26" stroke={accent} strokeWidth="6" />
          <path d="M110 58l18 14M210 58l-18 14" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'unwell':
      return <Person x={132} shirt={accent} sick />
    case 'fever':
      return (
        <g>
          <Person x={118} shirt={accent} sick />
          <rect x="214" y="70" width="14" height="56" rx="7" fill="#9b2c2c" />
        </g>
      )
    case 'twodays':
      return (
        <g>
          <Card x={70} y={54} accent={accent} lines={2} />
          <Card x={170} y={54} accent={accent} lines={2} />
        </g>
      )
    case 'doctor':
      return (
        <g>
          <Person x={132} shirt="#fffaf1" />
          <path d="M150 96h20v-16h16v16h16v16h-16v16h-16v-16h-20z" fill="#a33b2b" />
        </g>
      )
    case 'rx':
      return (
        <g>
          <rect x="96" y="54" width="128" height="100" rx="12" fill="#fffaf1" stroke={accent} />
          <text x="160" y="114" textAnchor="middle" fontSize="32" fill={accent}>
            Rx
          </text>
        </g>
      )
    case 'pills':
      return (
        <g>
          <rect x="92" y="86" width="56" height="28" rx="14" fill={accent} />
          <rect x="172" y="86" width="56" height="28" rx="14" fill="#fffaf1" stroke={accent} />
        </g>
      )
    case 'insurance':
      return (
        <g>
          <path d="M160 48l70 28v44c0 36-70 56-70 56s-70-20-70-56V76z" fill={accent} />
          <path d="M136 104l16 16 32-32" fill="none" stroke="#fffaf1" strokeWidth="8" />
        </g>
      )
    case 'appoint':
      return (
        <g>
          <rect x="90" y="54" width="140" height="108" rx="12" fill="#fffaf1" stroke={accent} />
          <rect x="90" y="54" width="140" height="28" fill={accent} />
          <circle cx="130" cy="116" r="8" fill={accent} />
          <circle cx="168" cy="116" r="8" fill={accent} />
        </g>
      )
    case 'meeting':
      return (
        <g>
          <Person x={70} shirt={accent} />
          <Person x={132} shirt="#2f5d50" />
          <Person x={194} shirt="#c45c26" />
        </g>
      )
    case 'email':
      return (
        <g>
          <rect x="78" y="64" width="164" height="88" rx="12" fill="#fffaf1" stroke={accent} />
          <path d="M78 76l82 48 82-48" fill="none" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'late':
      return (
        <g>
          <Person x={88} shirt={accent} walk />
          <circle cx="220" cy="86" r="32" fill="#fffaf1" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'slow':
      return (
        <g>
          <Person x={132} shirt={accent} />
          <path d="M70 70h60" stroke={accent} strokeWidth="6" />
          <path d="M70 86h40" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'check':
      return (
        <g>
          <circle cx="160" cy="100" r="46" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <path d="M138 102l16 16 30-34" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'deadline':
      return (
        <g>
          <rect x="90" y="54" width="140" height="108" rx="12" fill="#fffaf1" stroke={accent} />
          <text x="160" y="118" textAnchor="middle" fontSize="20" fill={accent}>
            FRI
          </text>
        </g>
      )
    case 'dayoff':
      return (
        <g>
          <rect x="86" y="86" width="148" height="40" rx="12" fill={accent} />
          <circle cx="130" cy="78" r="16" fill="#f4c36a" />
        </g>
      )
    case 'thanks':
      return (
        <g>
          <Person x={132} shirt={accent} wave />
          <path d="M230 70l10 20 22 2-16 16 4 22-20-12-20 12 4-22-16-16 22-2z" fill="#c45c26" />
        </g>
      )
    case 'sister':
      return (
        <g>
          <Person x={88} shirt={accent} />
          <Person x={176} shirt="#c45c26" />
        </g>
      )
    case 'home':
      return (
        <g>
          <polygon points="160,46 250,110 70,110" fill={accent} />
          <rect x="96" y="110" width="128" height="54" fill="#fffaf1" stroke={accent} />
        </g>
      )
    case 'weekend':
      return (
        <g>
          <circle cx="96" cy="70" r="20" fill="#f4c36a" />
          <Person x={132} shirt={accent} walk />
        </g>
      )
    case 'dinner':
      return (
        <g>
          <ellipse cx="160" cy="118" rx="70" ry="18" fill={accent} opacity="0.2" />
          <circle cx="160" cy="96" r="28" fill="#fffaf1" stroke={accent} />
        </g>
      )
    case 'miss':
      return (
        <g>
          <path d="M100 110c0-24 28-36 44-16 16-20 44-8 44 16 0 32-44 48-44 48s-44-16-44-48z" fill="#c45c26" />
        </g>
      )
    case 'gift':
      return (
        <g>
          <rect x="110" y="86" width="100" height="70" rx="8" fill={accent} />
          <rect x="150" y="86" width="20" height="70" fill="#fffaf1" />
          <rect x="110" y="110" width="100" height="16" fill="#fffaf1" />
        </g>
      )
    case 'plusfriend':
      return (
        <g>
          <Person x={88} shirt={accent} />
          <circle cx="220" cy="96" r="28" fill="#fffaf1" stroke={accent} strokeWidth="6" />
          <path d="M220 82v28M206 96h28" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'regards':
      return (
        <g>
          <Person x={132} shirt={accent} wave />
          <path d="M70 64c30 0 30 20 60 20" fill="none" stroke={accent} strokeWidth="5" />
        </g>
      )
    case 'callme':
      return <Phone accent={accent} />
    case 'ask':
      return (
        <g>
          <Phone accent={accent} />
          <text x="236" y="78" fontSize="28" fill={accent}>
            ?
          </text>
        </g>
      )
    case 'signal':
      return (
        <g>
          <Phone accent={accent} />
          <rect x="230" y="118" width="10" height="16" fill={accent} opacity="0.3" />
          <rect x="246" y="104" width="10" height="30" fill={accent} opacity="0.55" />
          <rect x="262" y="88" width="10" height="46" fill={accent} />
        </g>
      )
    case 'callback':
      return (
        <g>
          <Phone accent={accent} />
          <path d="M236 86c16 0 28 12 28 28" fill="none" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'voicemail':
      return (
        <g>
          <Bubble x={78} y={58} w={164} h={70} />
          <text x="160" y="100" textAnchor="middle" fontSize="16" fill={accent}>
            Hello...
          </text>
        </g>
      )
    case 'wrongnum':
      return (
        <g>
          <Phone accent={accent} />
          <path d="M230 70l36 36M266 70l-36 36" stroke="#9b2c2c" strokeWidth="8" />
        </g>
      )
    case 'textpin':
      return (
        <g>
          <Phone accent={accent} />
          <circle cx="246" cy="96" r="16" fill="#c45c26" />
        </g>
      )
    case 'busy':
      return (
        <g>
          <Person x={88} shirt={accent} />
          <Phone x={196} accent="#2b6cb0" />
        </g>
      )
    case 'airline':
      return <Plane accent={accent} />
    case 'window':
      return (
        <g>
          <rect x="96" y="40" width="128" height="120" rx="16" fill="#9fd4e6" />
          <Plane accent={accent} small />
        </g>
      )
    case 'scale':
      return (
        <g>
          <rect x="86" y="120" width="148" height="18" rx="6" fill={accent} />
          <rect x="148" y="54" width="24" height="66" fill={accent} />
          <rect x="118" y="86" width="84" height="20" fill="#fffaf1" />
        </g>
      )
    case 'gate':
      return (
        <g>
          <rect x="70" y="48" width="180" height="100" rx="12" fill={accent} />
          <text x="160" y="110" textAnchor="middle" fontSize="28" fill="#fffaf1">
            A12
          </text>
        </g>
      )
    case 'delay':
      return (
        <g>
          <Plane accent={accent} />
          <circle cx="246" cy="70" r="22" fill="#c45c26" />
        </g>
      )
    case 'boarding':
      return (
        <g>
          <Card x={96} y={48} accent={accent} lines={3} wide />
          <path d="M70 70l36 36M106 70l-36 36" stroke="#9b2c2c" strokeWidth="6" />
        </g>
      )
    case 'plug':
      return (
        <g>
          <rect x="130" y="58" width="60" height="80" rx="10" fill="#fffaf1" stroke={accent} />
          <rect x="146" y="74" width="10" height="22" fill={accent} />
          <rect x="164" y="74" width="10" height="22" fill={accent} />
        </g>
      )
    case 'carousel':
      return (
        <g>
          <rect x="54" y="96" width="212" height="28" rx="8" fill={accent} />
          <rect x="80" y="70" width="48" height="36" rx="6" fill="#8b5a2b" />
          <rect x="150" y="64" width="48" height="42" rx="6" fill="#3f4f6a" />
        </g>
      )
    case 'police':
      return (
        <g>
          <rect x="70" y="78" width="180" height="64" rx="10" fill={accent} />
          <rect x="70" y="78" width="180" height="16" fill="#2b6cb0" />
        </g>
      )
    case 'ambulance':
      return (
        <g>
          <rect x="60" y="78" width="200" height="64" rx="12" fill="#fffaf1" stroke={accent} />
          <path d="M150 90h20v-16h16v16h16v16h-16v16h-16v-16h-20z" fill="#a33b2b" />
        </g>
      )
    case 'stolen':
      return (
        <g>
          <path d="M112 86h96l-10 70H122z" fill={accent} />
          <path d="M230 70l36 36M266 70l-36 36" stroke="#9b2c2c" strokeWidth="8" />
        </g>
      )
    case 'passport':
      return (
        <g>
          <rect x="110" y="48" width="100" height="120" rx="10" fill="#1f4e79" />
          <circle cx="160" cy="96" r="18" fill="#d4b45a" />
        </g>
      )
    case 'hospital':
      return (
        <g>
          <rect x="86" y="70" width="148" height="86" fill="#fffaf1" stroke={accent} />
          <path d="M150 88h20v-16h16v16h16v16h-16v16h-16v-16h-20z" fill="#a33b2b" />
        </g>
      )
    case 'tourist':
      return (
        <g>
          <Person x={132} shirt={accent} />
          <ellipse cx="160" cy="58" rx="36" ry="10" fill="#8b5a2b" />
        </g>
      )
    case 'borrow':
      return (
        <g>
          <Person x={80} shirt={accent} />
          <Phone x={188} accent="#2b6cb0" />
        </g>
      )
    case 'embassy':
      return (
        <g>
          <rect x="70" y="86" width="180" height="60" fill={accent} />
          <polygon points="160,40 250,86 70,86" fill={accent} />
          <rect x="148" y="104" width="24" height="42" fill="#fffaf1" />
        </g>
      )
  }
}

function Person({
  x,
  shirt,
  wave,
  shy,
  walk,
  hat,
  sick,
}: {
  x: number
  shirt: string
  wave?: boolean
  shy?: boolean
  walk?: boolean
  hat?: boolean
  sick?: boolean
}) {
  return (
    <g transform={`translate(${x} 54)`}>
      <circle cx="32" cy="22" r="16" fill="#e8c4a0" />
      {hat ? <rect x="14" y="-4" width="36" height="12" rx="6" fill="#fffaf1" /> : null}
      <rect x="12" y="40" width="40" height="46" rx="12" fill={shirt} />
      <rect x="4" y="48" width="14" height="30" rx="7" fill="#e8c4a0" transform={wave ? 'rotate(-28 11 50)' : undefined} />
      <rect x="46" y="48" width="14" height="30" rx="7" fill="#e8c4a0" />
      {walk ? <rect x="18" y="84" width="12" height="28" rx="6" fill="#3f4f6a" /> : null}
      {walk ? <rect x="34" y="84" width="12" height="24" rx="6" fill="#3f4f6a" /> : null}
      {shy ? <circle cx="32" cy="26" r="3" fill="#d97b7b" /> : null}
      {sick ? <path d="M24 28h16" stroke="#7a3b3b" strokeWidth="3" /> : null}
    </g>
  )
}

function Cup({
  x,
  y,
  accent,
  iced,
  lid,
}: {
  x: number
  y: number
  accent: string
  iced?: boolean
  lid?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lid ? <rect x="8" y="0" width="56" height="12" rx="6" fill={accent} /> : null}
      <path d="M12 14h48l-8 78H20z" fill={accent} />
      <path d="M60 28h14v28c0 10-8 14-14 10" fill="none" stroke={accent} strokeWidth="6" />
      {iced ? <rect x="24" y="36" width="10" height="16" fill="#fffaf1" opacity="0.5" /> : null}
    </g>
  )
}

function Card({
  x,
  y,
  accent,
  lines,
  wide,
}: {
  x: number
  y: number
  accent: string
  lines: number
  wide?: boolean
}) {
  const w = wide ? 140 : 80
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="108" rx="10" fill="#fffaf1" stroke={accent} />
      {Array.from({ length: lines }, (_, index) => (
        <rect key={index} x="12" y={20 + index * 18} width={w - 24} height="8" rx="4" fill={accent} opacity="0.35" />
      ))}
    </g>
  )
}

function Tag({ accent, label }: { accent: string; label: string }) {
  return (
    <g>
      <rect x="110" y="70" width="100" height="64" rx="12" fill={accent} />
      <text x="160" y="112" textAnchor="middle" fontSize="28" fill="#fffaf1">
        {label}
      </text>
    </g>
  )
}

function Bubble({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} rx="16" fill="#fffaf1" />
}

function Ear({ accent }: { accent: string }) {
  return (
    <g>
      <ellipse cx="150" cy="100" rx="28" ry="36" fill="#e8c4a0" />
      <ellipse cx="158" cy="100" rx="12" ry="16" fill={accent} opacity="0.35" />
      <path d="M196 78c24 12 24 32 0 44" fill="none" stroke={accent} strokeWidth="6" />
    </g>
  )
}

function Phone({ accent, x = 124 }: { accent: string; x?: number }) {
  return (
    <g transform={`translate(${x} 46)`}>
      <rect width="72" height="120" rx="14" fill={accent} />
      <rect x="8" y="16" width="56" height="78" rx="6" fill="#fffaf1" />
    </g>
  )
}

function Plane({ accent, small }: { accent: string; small?: boolean }) {
  const s = small ? 0.7 : 1
  return (
    <g transform={`translate(70 70) scale(${s})`}>
      <path d="M10 70h150l40-20v20l-20 16H10z" fill={accent} />
      <path d="M70 70l-20-40h24l36 40" fill={accent} />
    </g>
  )
}
