import { artFor, type MotifId } from '../data/art'

type PhraseArtProps = {
  phraseId: string
  label: string
}

export function PhraseArt({ phraseId, label }: PhraseArtProps) {
  const art = artFor(phraseId)
  return (
    <svg className="phrase-art" viewBox="0 0 320 250" role="img" aria-label={label}>
      <rect width="320" height="250" rx="22" fill={art.bg} />
      <circle cx="268" cy="28" r="36" fill="#fff" opacity="0.22" />
      <circle cx="40" cy="18" r="22" fill="#fff" opacity="0.16" />
      <path d="M0 168h320v34H0z" fill={art.accent} opacity="0.1" />
      <g transform="translate(0 -6)">{renderMotif(art.motif, art.accent)}</g>
      <rect x="12" y="196" width="296" height="42" rx="14" fill="#fffaf1" />
      <text x="34" y="224" fontSize="22">
        {art.emoji}
      </text>
      <text
        x="68"
        y="223"
        fontSize="15"
        fontFamily="Source Sans 3, Segoe UI, sans-serif"
        fontWeight="700"
        fill="#211c16"
      >
        {art.caption}
      </text>
    </svg>
  )
}

function renderMotif(motif: MotifId, accent: string) {
  switch (motif) {
    case 'wave':
      return (
        <g>
          <Buddy x={70} shirt={accent} pose="wave" />
          <Buddy x={176} shirt="#2f5d50" hair="#5a3a22" />
        </g>
      )
    case 'handshake':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="handOut" />
          <Buddy x={196} shirt="#2f5d50" hair="#2a1c12" pose="handOut" flip />
          <ellipse cx="160" cy="118" rx="34" ry="16" fill="#e8c4a0" stroke="#c9a07a" strokeWidth="3" />
          <ellipse cx="148" cy="116" rx="16" ry="12" fill="#f0c8a0" />
          <ellipse cx="172" cy="116" rx="16" ry="12" fill="#e0b48c" />
        </g>
      )
    case 'nametag':
      return (
        <g>
          <Buddy x={118} shirt={accent} pose="point" />
          <rect x="196" y="78" width="70" height="36" rx="8" fill="#fffaf1" stroke={accent} strokeWidth="3" />
          <text x="231" y="102" textAnchor="middle" fontSize="14" fontWeight="700" fill={accent}>
            LINH
          </text>
        </g>
      )
    case 'vietnam':
      return (
        <g>
          <Buddy x={48} shirt="#fffaf1" />
          <circle cx="214" cy="96" r="52" fill="#da251d" />
          <polygon
            points="214,58 223,86 253,86 229,104 238,132 214,114 190,132 199,104 175,86 205,86"
            fill="#ffd400"
          />
        </g>
      )
    case 'replay':
      return (
        <g>
          <Buddy x={48} shirt={accent} mood="think" />
          <ellipse cx="214" cy="96" rx="34" ry="42" fill="#e8c4a0" />
          <ellipse cx="222" cy="96" rx="14" ry="18" fill="#fffaf1" />
          <path d="M252 70c28 14 28 38 0 52" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        </g>
      )
    case 'shy':
      return (
        <g>
          <Buddy x={86} shirt={accent} mood="sorry" pose="sorry" />
          <rect x="196" y="78" width="70" height="54" rx="8" fill="#fffaf1" stroke={accent} strokeWidth="3" />
          <text x="231" y="112" textAnchor="middle" fontSize="18" fill={accent}>
            ABC
          </text>
        </g>
      )
    case 'chat':
      return (
        <g>
          <Buddy x={48} shirt={accent} pose="wave" />
          <Buddy x={176} shirt="#2f5d50" hair="#5a3a22" pose="wave" flip />
          <Bubble x={118} y={36} text="Hi!" />
        </g>
      )
    case 'later':
      return (
        <g>
          <Buddy x={70} shirt={accent} pose="wave" />
          <path d="M200 150c28-40 56-40 84 0" fill="none" stroke={accent} strokeWidth="6" />
          <circle cx="250" cy="70" r="16" fill="#f4c36a" />
        </g>
      )
    case 'menu':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="point" />
          <MenuCard x={176} y={40} accent={accent} />
        </g>
      )
    case 'latte':
      return (
        <g>
          <Buddy x={36} shirt={accent} pose="hold" />
          <Cup x={188} y={58} accent={accent} iced />
        </g>
      )
    case 'takeaway':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="hold" />
          <Cup x={188} y={48} accent={accent} lid />
        </g>
      )
    case 'sweet':
      return (
        <g>
          <Cup x={78} y={58} accent={accent} />
          <circle cx="210" cy="78" r="20" fill="#f4b4c4" />
          <circle cx="232" cy="104" r="14" fill="#f7d08a" />
          <text x="210" y="86" textAnchor="middle" fontSize="16">
            🍬
          </text>
        </g>
      )
    case 'sugar':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="point" />
          <rect x="188" y="70" width="80" height="70" rx="12" fill="#fffaf1" stroke={accent} strokeWidth="3" />
          <text x="228" y="114" textAnchor="middle" fontSize="22" fill={accent}>
            Aa
          </text>
        </g>
      )
    case 'oat':
      return (
        <g>
          <ellipse cx="160" cy="132" rx="70" ry="22" fill="#fffaf1" />
          <ellipse cx="140" cy="88" rx="22" ry="34" fill="#d8b56a" />
          <ellipse cx="172" cy="92" rx="20" ry="30" fill="#c9a24e" />
          <ellipse cx="198" cy="100" rx="16" ry="24" fill="#e2c57a" />
        </g>
      )
    case 'price':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="point" />
          <PriceTag x={188} y={70} accent={accent} label="$ ?" />
        </g>
      )
    case 'paycard':
      return (
        <g>
          <Buddy x={36} shirt="#fffaf1" pose="hold" />
          <rect x="176" y={72} width="116" height="72" rx="12" fill={accent} />
          <rect x="176" y="90" width="116" height="16" fill="#1c1915" opacity="0.25" />
          <rect x="190" y="118" width="48" height="10" rx="5" fill="#fffaf1" opacity="0.8" />
        </g>
      )
    case 'table':
      return (
        <g>
          <Buddy x={36} shirt={accent} />
          <Buddy x={196} shirt="#2f5d50" hair="#5a3a22" />
          <ellipse cx="160" cy="150" rx="96" ry="16" fill={accent} opacity="0.25" />
          <rect x="64" y="132" width="192" height="14" rx="6" fill={accent} />
        </g>
      )
    case 'chef':
      return (
        <g>
          <Buddy x={118} shirt="#fffaf1" hat mood="happy" pose="point" />
        </g>
      )
    case 'allergy':
      return (
        <g>
          <ellipse cx="118" cy="104" rx="40" ry="30" fill="#d4a574" />
          <ellipse cx="108" cy="96" rx="8" ry="6" fill="#8b5a2b" />
          <text x="200" y="100" fontSize="54" fill="#9b2c2c">
            !
          </text>
        </g>
      )
    case 'chicken':
      return (
        <g>
          <ellipse cx="168" cy="128" rx="70" ry="22" fill="#fffaf1" />
          <ellipse cx="150" cy="108" rx="46" ry="20" fill="#c45c26" />
          <circle cx="118" cy="88" r="20" fill="#e8a04a" />
          <rect x="168" y="78" width="48" height="16" rx="8" fill="#8b5a2b" />
        </g>
      )
    case 'water':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="hold" />
          <rect x="196" y="52" width="52" height="96" rx="12" fill="#9fd4e6" />
          <rect x="204" y="88" width="36" height="50" rx="8" fill="#2b6cb0" opacity="0.4" />
        </g>
      )
    case 'wrongdish':
      return (
        <g>
          <circle cx="160" cy="100" r="50" fill="#fffaf1" stroke={accent} strokeWidth="5" />
          <path d="M138 78l44 44M182 78l-44 44" stroke="#9b2c2c" strokeWidth="8" strokeLinecap="round" />
        </g>
      )
    case 'bill':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="point" />
          <MenuCard x={176} y={40} accent={accent} bill />
        </g>
      )
    case 'split':
      return (
        <g>
          <MenuCard x={48} y={48} accent={accent} bill />
          <MenuCard x={176} y={48} accent={accent} bill />
        </g>
      )
    case 'browse':
      return (
        <g>
          <Buddy x={70} shirt={accent} pose="wave" />
          <rect x="196" y="48" width="52" height="100" rx="8" fill="#fffaf1" stroke={accent} strokeWidth="3" />
          <path d="M206 70h32M206 90h32M206 110h24" stroke={accent} strokeWidth="4" />
        </g>
      )
    case 'size':
      return (
        <g>
          <path d="M86 60h50l16 90H70z" fill={accent} />
          <path d="M168 44h64l20 106h-84z" fill={accent} opacity="0.5" />
          <text x="108" y="150" fontSize="14" fill={accent}>
            S
          </text>
          <text x="196" y="164" fontSize="14" fill={accent}>
            M
          </text>
        </g>
      )
    case 'fitting':
      return (
        <g>
          <rect x="96" y="28" width="128" height="140" rx="10" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <Buddy x={112} shirt={accent} />
        </g>
      )
    case 'cost':
      return <PriceTag x={110} y={70} accent={accent} label="$ ?" />
    case 'sale':
      return <PriceTag x={110} y={70} accent={accent} label="-30%" />
    case 'take':
      return (
        <g>
          <Buddy x={48} shirt={accent} pose="hold" />
          <path d="M196 86h70l-8 56h-54z" fill={accent} />
          <path d="M214 86c0-18 34-18 34 0" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'returns':
      return (
        <g>
          <rect x="96" y="54" width="128" height="90" rx="12" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M130 118c28-36 64-8 36 16" fill="none" stroke={accent} strokeWidth="7" />
        </g>
      )
    case 'bag':
      return (
        <g>
          <path d="M104 80h112l-12 78H116z" fill={accent} />
          <path d="M136 80c0-28 48-28 48 0" fill="none" stroke={accent} strokeWidth="10" />
        </g>
      )
    case 'station':
      return (
        <g>
          <rect x="48" y="64" width="224" height="80" rx="10" fill={accent} />
          <rect x="68" y="82" width="44" height="32" fill="#fffaf1" />
          <rect x="138" y="82" width="44" height="32" fill="#fffaf1" />
          <rect x="208" y="82" width="44" height="32" fill="#fffaf1" />
          <text x="160" y="58" textAnchor="middle" fontSize="16" fill={accent}>
            STATION
          </text>
        </g>
      )
    case 'museum':
      return (
        <g>
          <polygon points="160,28 270,88 50,88" fill={accent} />
          <rect x="62" y="88" width="196" height="60" fill={accent} />
          <rect x="88" y="102" width="20" height="46" fill="#fffaf1" />
          <rect x="150" y="102" width="20" height="46" fill="#fffaf1" />
          <rect x="212" y="102" width="20" height="46" fill="#fffaf1" />
        </g>
      )
    case 'walk':
      return (
        <g>
          <Buddy x={118} shirt={accent} pose="walk" />
          <path d="M48 150h224" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'turn':
      return (
        <g>
          <path d="M64 140h110V58" fill="none" stroke={accent} strokeWidth="14" strokeLinecap="round" />
          <polygon points="174,36 208,64 154,64" fill={accent} />
          <Buddy x={200} shirt="#c45c26" pose="walk" />
        </g>
      )
    case 'timer':
      return (
        <g>
          <circle cx="160" cy="96" r="50" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <path d="M160 96V56M160 96h28" stroke={accent} strokeWidth="7" strokeLinecap="round" />
        </g>
      )
    case 'bus':
      return (
        <g>
          <rect x="40" y="68" width="240" height="78" rx="18" fill={accent} />
          <rect x="58" y="82" width="52" height="32" fill="#fffaf1" />
          <rect x="124" y="82" width="52" height="32" fill="#fffaf1" />
          <rect x="190" y="82" width="52" height="32" fill="#fffaf1" />
          <circle cx="96" cy="154" r="14" fill="#211c16" />
          <circle cx="224" cy="154" r="14" fill="#211c16" />
        </g>
      )
    case 'lost':
      return (
        <g>
          <Buddy x={86} shirt={accent} mood="think" pose="sorry" />
          <text x="220" y="96" fontSize="56" fill={accent}>
            ?
          </text>
        </g>
      )
    case 'map':
      return (
        <g>
          <rect x="58" y="36" width="204" height="128" rx="14" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M84 70h156M70 104h176M96 136h120" stroke={accent} strokeWidth="5" />
          <circle cx="168" cy="104" r="10" fill="#c45c26" />
        </g>
      )
    case 'checkin':
      return (
        <g>
          <rect x="36" y="78" width="248" height="70" rx="12" fill={accent} />
          <Buddy x={52} shirt="#fffaf1" />
          <rect x="196" y="94" width="70" height="40" rx="8" fill="#fffaf1" />
        </g>
      )
    case 'clock':
      return (
        <g>
          <circle cx="160" cy="96" r="52" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <text x="160" y="104" textAnchor="middle" fontSize="20" fontWeight="700" fill={accent}>
            14:00
          </text>
        </g>
      )
    case 'breakfast':
      return (
        <g>
          <ellipse cx="160" cy="124" rx="78" ry="22" fill="#fffaf1" />
          <ellipse cx="138" cy="104" rx="28" ry="16" fill="#f4c36a" />
          <circle cx="186" cy="106" r="12" fill="#c45c26" />
          <rect x="206" y="96" width="28" height="10" rx="4" fill="#8b5a2b" />
        </g>
      )
    case 'wifi':
      return (
        <g>
          <path
            d="M80 118c44-48 116-48 160 0M104 136c28-28 84-28 112 0M140 154c12-10 28-10 40 0"
            fill="none"
            stroke={accent}
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
      )
    case 'towel':
      return (
        <g>
          <rect x="78" y="48" width="164" height="108" rx="14" fill="#fffaf1" />
          <rect x="94" y="64" width="132" height="76" rx="10" fill={accent} opacity="0.2" />
        </g>
      )
    case 'ac':
      return (
        <g>
          <rect x="48" y="48" width="224" height="72" rx="12" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M64 148c24-18 48 18 72 0s48 18 72 0 48 18 72 0" fill="none" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'luggage':
      return (
        <g>
          <rect x="112" y="64" width="96" height="90" rx="12" fill={accent} />
          <rect x="132" y="40" width="56" height="24" rx="10" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'wakeup':
      return (
        <g>
          <circle cx="160" cy="100" r="50" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <text x="160" y="108" textAnchor="middle" fontSize="20" fontWeight="700" fill={accent}>
            6:00
          </text>
          <path d="M104 52l18 16M216 52l-18 16" stroke={accent} strokeWidth="6" />
        </g>
      )
    case 'unwell':
      return <Buddy x={118} shirt={accent} mood="sick" pose="sorry" />
    case 'fever':
      return (
        <g>
          <Buddy x={70} shirt={accent} mood="sick" pose="sorry" />
          <rect x="214" y="58" width="16" height="70" rx="8" fill="#9b2c2c" />
          <circle cx="222" cy="136" r="12" fill="#9b2c2c" />
        </g>
      )
    case 'twodays':
      return (
        <g>
          <Calendar x={48} y={40} accent={accent} day="1" />
          <Calendar x={176} y={40} accent={accent} day="2" />
        </g>
      )
    case 'doctor':
      return (
        <g>
          <Buddy x={118} shirt="#fffaf1" />
          <path d="M148 92h24v-18h18v18h18v18h-18v18h-18v-18h-24z" fill="#a33b2b" />
        </g>
      )
    case 'rx':
      return (
        <g>
          <rect x="86" y="40" width="148" height="120" rx="14" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <text x="160" y="112" textAnchor="middle" fontSize="36" fontWeight="700" fill={accent}>
            Rx
          </text>
        </g>
      )
    case 'pills':
      return (
        <g>
          <rect x="70" y="86" width="70" height="32" rx="16" fill={accent} />
          <rect x="180" y="86" width="70" height="32" rx="16" fill="#fffaf1" stroke={accent} strokeWidth="4" />
        </g>
      )
    case 'insurance':
      return (
        <g>
          <path d="M160 36l78 32v48c0 40-78 62-78 62s-78-22-78-62V68z" fill={accent} />
          <path d="M132 104l20 20 40-40" fill="none" stroke="#fffaf1" strokeWidth="9" />
        </g>
      )
    case 'appoint':
      return <Calendar x={96} y={36} accent={accent} day="MAI" wide />
    case 'meeting':
      return (
        <g>
          <Buddy x={28} shirt={accent} />
          <Buddy x={118} shirt="#2f5d50" hair="#5a3a22" />
          <Buddy x={208} shirt="#c45c26" hair="#2a1c12" />
        </g>
      )
    case 'email':
      return (
        <g>
          <rect x="58" y="56" width="204" height="100" rx="14" fill="#fffaf1" stroke={accent} strokeWidth="5" />
          <path d="M58 70l102 54 102-54" fill="none" stroke={accent} strokeWidth="7" />
        </g>
      )
    case 'late':
      return (
        <g>
          <Buddy x={48} shirt={accent} pose="walk" />
          <circle cx="226" cy="86" r="36" fill="#fffaf1" stroke={accent} strokeWidth="6" />
          <text x="226" y="94" textAnchor="middle" fontSize="16" fill={accent}>
            +5
          </text>
        </g>
      )
    case 'slow':
      return (
        <g>
          <Buddy x={70} shirt={accent} mood="think" />
          <path d="M196 70h70M196 94h50M196 118h36" stroke={accent} strokeWidth="8" strokeLinecap="round" />
        </g>
      )
    case 'check':
      return (
        <g>
          <circle cx="160" cy="96" r="52" fill="#fffaf1" stroke={accent} strokeWidth="8" />
          <path d="M134 98l20 20 36-40" fill="none" stroke={accent} strokeWidth="9" />
        </g>
      )
    case 'deadline':
      return <Calendar x={96} y={36} accent={accent} day="FRI" wide />
    case 'dayoff':
      return (
        <g>
          <circle cx="86" cy="64" r="22" fill="#f4c36a" />
          <rect x="70" y="100" width="180" height="40" rx="14" fill={accent} />
          <Buddy x={118} shirt="#fffaf1" pose="wave" />
        </g>
      )
    case 'thanks':
      return (
        <g>
          <Buddy x={86} shirt={accent} pose="wave" />
          <path d="M230 64l12 24 26 2-20 18 6 26-24-14-24 14 6-26-20-18 26-2z" fill="#c45c26" />
        </g>
      )
    case 'sister':
      return (
        <g>
          <Buddy x={48} shirt={accent} hair="#3a2a1a" />
          <Buddy x={176} shirt="#c45c26" hair="#7a4b8a" />
        </g>
      )
    case 'home':
      return (
        <g>
          <polygon points="160,32 268,108 52,108" fill={accent} />
          <rect x="84" y="108" width="152" height="52" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <rect x="144" y="120" width="32" height="40" fill={accent} />
        </g>
      )
    case 'weekend':
      return (
        <g>
          <circle cx="72" cy="58" r="22" fill="#f4c36a" />
          <Buddy x={118} shirt={accent} pose="walk" />
        </g>
      )
    case 'dinner':
      return (
        <g>
          <Buddy x={36} shirt={accent} />
          <Buddy x={196} shirt="#2f5d50" hair="#5a3a22" />
          <ellipse cx="160" cy="150" rx="80" ry="14" fill={accent} opacity="0.2" />
          <circle cx="160" cy="118" r="22" fill="#fffaf1" stroke={accent} strokeWidth="4" />
        </g>
      )
    case 'miss':
      return (
        <g>
          <path d="M96 108c0-28 32-42 50-18 18-24 50-10 50 18 0 36-50 56-50 56s-50-20-50-56z" fill="#c45c26" />
        </g>
      )
    case 'gift':
      return (
        <g>
          <rect x="100" y="80" width="120" height="78" rx="10" fill={accent} />
          <rect x="148" y="80" width="24" height="78" fill="#fffaf1" />
          <rect x="100" y="106" width="120" height="18" fill="#fffaf1" />
        </g>
      )
    case 'plusfriend':
      return (
        <g>
          <Buddy x={48} shirt={accent} />
          <circle cx="226" cy="96" r="32" fill="#fffaf1" stroke={accent} strokeWidth="6" />
          <path d="M226 80v32M210 96h32" stroke={accent} strokeWidth="7" />
        </g>
      )
    case 'regards':
      return (
        <g>
          <Buddy x={118} shirt={accent} pose="wave" />
        </g>
      )
    case 'callme':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="hold" />
          <Phone x={196} accent="#2b6cb0" />
        </g>
      )
    case 'ask':
      return (
        <g>
          <Phone x={90} accent={accent} />
          <text x="220" y="100" fontSize="48" fill={accent}>
            ?
          </text>
        </g>
      )
    case 'signal':
      return (
        <g>
          <Phone x={70} accent={accent} />
          <rect x="196" y="118" width="14" height="20" fill={accent} opacity="0.3" />
          <rect x="218" y="100" width="14" height="38" fill={accent} opacity="0.55" />
          <rect x="240" y="78" width="14" height="60" fill={accent} />
        </g>
      )
    case 'callback':
      return (
        <g>
          <Phone x={70} accent={accent} />
          <path d="M196 78c28 0 48 20 48 44" fill="none" stroke={accent} strokeWidth="8" />
        </g>
      )
    case 'voicemail':
      return <Bubble x={70} y={58} text="Hello..." wide />
    case 'wrongnum':
      return (
        <g>
          <Phone x={70} accent={accent} />
          <path d="M196 64l48 48M244 64l-48 48" stroke="#9b2c2c" strokeWidth="10" />
        </g>
      )
    case 'textpin':
      return (
        <g>
          <Phone x={70} accent={accent} />
          <circle cx="230" cy="96" r="20" fill="#c45c26" />
        </g>
      )
    case 'busy':
      return (
        <g>
          <Buddy x={40} shirt={accent} />
          <Phone x={196} accent="#2b6cb0" />
        </g>
      )
    case 'airline':
      return <Plane accent={accent} />
    case 'window':
      return (
        <g>
          <rect x="78" y="28" width="164" height="136" rx="18" fill="#8ec8e6" />
          <circle cx="70" cy="48" r="16" fill="#f4c36a" />
          <Plane accent={accent} small />
        </g>
      )
    case 'scale':
      return (
        <g>
          <rect x="70" y="128" width="180" height="20" rx="6" fill={accent} />
          <rect x="148" y="48" width="24" height="80" fill={accent} />
          <rect x="110" y="88" width="100" height="24" fill="#fffaf1" />
          <text x="160" y="106" textAnchor="middle" fontSize="14" fill={accent}>
            KG
          </text>
        </g>
      )
    case 'gate':
      return (
        <g>
          <rect x="56" y="40" width="208" height="112" rx="14" fill={accent} />
          <text x="160" y="108" textAnchor="middle" fontSize="36" fill="#fffaf1" fontWeight="700">
            GATE A12
          </text>
        </g>
      )
    case 'delay':
      return (
        <g>
          <Plane accent={accent} />
          <circle cx="250" cy="58" r="24" fill="#c45c26" />
          <text x="250" y="66" textAnchor="middle" fontSize="16" fill="#fffaf1">
            +1h
          </text>
        </g>
      )
    case 'boarding':
      return (
        <g>
          <MenuCard x={88} y={36} accent={accent} bill />
          <path d="M48 56l40 40M88 56L48 96" stroke="#9b2c2c" strokeWidth="8" />
        </g>
      )
    case 'plug':
      return (
        <g>
          <rect x="122" y="48" width="76" height="100" rx="12" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <rect x="140" y="68" width="12" height="28" fill={accent} />
          <rect x="168" y="68" width="12" height="28" fill={accent} />
        </g>
      )
    case 'carousel':
      return (
        <g>
          <rect x="36" y="104" width="248" height="28" rx="8" fill={accent} />
          <rect x="64" y="64" width="56" height="48" rx="8" fill="#8b5a2b" />
          <rect x="140" y="56" width="56" height="56" rx="8" fill="#3f4f6a" />
          <rect x="216" y="70" width="48" height="42" rx="8" fill="#c45c26" />
        </g>
      )
    case 'police':
      return (
        <g>
          <rect x="48" y="78" width="224" height="70" rx="12" fill={accent} />
          <rect x="48" y="78" width="224" height="18" fill="#2b6cb0" />
          <circle cx="160" cy="70" r="10" fill="#f4c36a" />
        </g>
      )
    case 'ambulance':
      return (
        <g>
          <rect x="40" y="74" width="240" height="72" rx="14" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M148 88h24v-18h18v18h18v18h-18v18h-18v-18h-24z" fill="#a33b2b" />
          <circle cx="96" cy="154" r="14" fill="#211c16" />
          <circle cx="224" cy="154" r="14" fill="#211c16" />
        </g>
      )
    case 'stolen':
      return (
        <g>
          <path d="M104 80h112l-12 78H116z" fill={accent} />
          <path d="M220 52l44 44M264 52l-44 44" stroke="#9b2c2c" strokeWidth="10" />
        </g>
      )
    case 'passport':
      return (
        <g>
          <rect x="108" y="36" width="104" height="132" rx="12" fill="#1f4e79" />
          <circle cx="160" cy="88" r="20" fill="#d4b45a" />
          <rect x="124" y="122" width="72" height="10" rx="4" fill="#fffaf1" opacity="0.5" />
        </g>
      )
    case 'hospital':
      return (
        <g>
          <rect x="70" y="64" width="180" height="96" fill="#fffaf1" stroke={accent} strokeWidth="4" />
          <path d="M148 80h24v-18h18v18h18v18h-18v18h-18v-18h-24z" fill="#a33b2b" />
        </g>
      )
    case 'tourist':
      return (
        <g>
          <Buddy x={118} shirt={accent} hat />
          <rect x="214" y="100" width="40" height="50" rx="6" fill="#8b5a2b" />
        </g>
      )
    case 'borrow':
      return (
        <g>
          <Buddy x={40} shirt={accent} pose="hold" />
          <Phone x={196} accent="#2b6cb0" />
        </g>
      )
    case 'embassy':
      return (
        <g>
          <polygon points="160,28 270,88 50,88" fill={accent} />
          <rect x="62" y="88" width="196" height="64" fill={accent} />
          <rect x="144" y="104" width="32" height="48" fill="#fffaf1" />
        </g>
      )
  }
}

function Buddy({
  x,
  shirt,
  hair = '#3a2a1a',
  pose = 'stand',
  mood = 'happy',
  flip,
  hat,
}: {
  x: number
  shirt: string
  hair?: string
  pose?: 'stand' | 'wave' | 'point' | 'walk' | 'hold' | 'handOut' | 'sorry'
  mood?: 'happy' | 'sorry' | 'sick' | 'think'
  flip?: boolean
  hat?: boolean
}) {
  const mouth =
    mood === 'sorry' || mood === 'sick' ? 'M26 34c8 6 16 0 16-2' : mood === 'think' ? 'M28 36h16' : 'M26 32c8 10 20 10 28 0'
  return (
    <g transform={`translate(${x} 28) ${flip ? 'scale(-1.08,1.08) translate(-88,0)' : 'scale(1.08)'}`}>
      <circle cx="40" cy="28" r="22" fill="#f0c8a0" />
      <ellipse cx="40" cy="14" rx="22" ry="11" fill={hair} />
      {hat ? <ellipse cx="40" cy="10" rx="26" ry="9" fill="#8b5a2b" /> : null}
      <circle cx="32" cy="28" r="5" fill="#fffaf1" />
      <circle cx="48" cy="28" r="5" fill="#fffaf1" />
      <circle cx="33" cy="29" r="2.6" fill="#211c16" />
      <circle cx="49" cy="29" r="2.6" fill="#211c16" />
      <path d={mouth} fill="none" stroke="#7a3b3b" strokeWidth="2.8" strokeLinecap="round" />
      {mood === 'sick' ? <path d="M24 24l8 4M48 24l-8 4" stroke="#7a3b3b" strokeWidth="2" /> : null}
      <rect x="20" y="48" width="40" height="52" rx="14" fill={shirt} />
      <rect
        x={pose === 'wave' ? -2 : pose === 'point' || pose === 'hold' || pose === 'handOut' ? 52 : 8}
        y={pose === 'wave' ? 28 : 56}
        width="14"
        height={pose === 'wave' ? 36 : 32}
        rx="7"
        fill="#f0c8a0"
        transform={pose === 'wave' ? 'rotate(-32 5 40)' : undefined}
      />
      <rect
        x={pose === 'handOut' ? 58 : 58}
        y="56"
        width="14"
        height="32"
        rx="7"
        fill="#f0c8a0"
        opacity={pose === 'wave' ? 1 : 1}
      />
      <rect x="26" y="98" width="12" height="28" rx="6" fill="#3f4f6a" />
      <rect
        x="42"
        y={pose === 'walk' ? 102 : 98}
        width="12"
        height={pose === 'walk' ? 24 : 28}
        rx="6"
        fill="#3f4f6a"
      />
    </g>
  )
}

function Bubble({ x, y, text, wide }: { x: number; y: number; text: string; wide?: boolean }) {
  const w = wide ? 180 : 86
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="48" rx="16" fill="#fffaf1" />
      <text x={w / 2} y="30" textAnchor="middle" fontSize="16" fontWeight="700" fill="#211c16">
        {text}
      </text>
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
      {lid ? <rect x="6" y="0" width="68" height="14" rx="7" fill={accent} /> : null}
      <path d="M14 16h56l-10 86H24z" fill={accent} />
      <path d="M70 34h16v30c0 12-8 16-16 12" fill="none" stroke={accent} strokeWidth="7" />
      {iced ? <rect x="28" y="40" width="12" height="20" fill="#fffaf1" opacity="0.55" /> : null}
      <path d="M30 8c6-10 18-10 24 0" fill="none" stroke={accent} strokeWidth="4" opacity={lid ? 0 : 1} />
    </g>
  )
}

function MenuCard({ x, y, accent, bill }: { x: number; y: number; accent: string; bill?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="100" height="120" rx="12" fill="#fffaf1" stroke={accent} strokeWidth="3" />
      <rect x="14" y="18" width="72" height="10" rx="5" fill={accent} opacity="0.35" />
      <rect x="14" y="40" width="72" height="10" rx="5" fill={accent} opacity="0.35" />
      <rect x="14" y="62" width="56" height="10" rx="5" fill={accent} opacity="0.35" />
      {bill ? (
        <text x="50" y="104" textAnchor="middle" fontSize="16" fill={accent} fontWeight="700">
          BILL
        </text>
      ) : null}
    </g>
  )
}

function PriceTag({ x, y, accent, label }: { x: number; y: number; accent: string; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="110" height="70" rx="14" fill={accent} />
      <text x="55" y="44" textAnchor="middle" fontSize="22" fill="#fffaf1" fontWeight="700">
        {label}
      </text>
    </g>
  )
}

function Calendar({
  x,
  y,
  accent,
  day,
  wide,
}: {
  x: number
  y: number
  accent: string
  day: string
  wide?: boolean
}) {
  const w = wide ? 128 : 96
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height="120" rx="14" fill="#fffaf1" stroke={accent} strokeWidth="4" />
      <rect width={w} height="32" fill={accent} />
      <text x={w / 2} y="80" textAnchor="middle" fontSize="22" fill={accent} fontWeight="700">
        {day}
      </text>
    </g>
  )
}

function Phone({ x, accent }: { x: number; accent: string }) {
  return (
    <g transform={`translate(${x} 40)`}>
      <rect width="72" height="120" rx="14" fill={accent} />
      <rect x="8" y="16" width="56" height="78" rx="6" fill="#fffaf1" />
    </g>
  )
}

function Plane({ accent, small }: { accent: string; small?: boolean }) {
  const s = small ? 0.72 : 1
  return (
    <g transform={`translate(48 64) scale(${s})`}>
      <path d="M8 74h170l46-24v24l-24 18H8z" fill={accent} />
      <path d="M78 74L52 28h28l40 46" fill={accent} />
    </g>
  )
}
