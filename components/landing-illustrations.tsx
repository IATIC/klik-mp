export function BuildingSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="25" y="60" width="110" height="70" rx="4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M5 65 L80 10 L155 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M25 60 L25 130" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M135 60 L135 130" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="60" y="85" width="40" height="45" rx="3" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="80" cy="107" r="3" fill="currentColor" />
      <path d="M80 85 L80 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 88 L92 95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ScaleSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect x="40" y="102" width="60" height="10" rx="4" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="70" y1="102" x2="70" y2="25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="15" y1="35" x2="125" y2="35" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="70" cy="32" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M15 35 L15 55 Q15 62 25 62 L40 62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M125 35 L125 55 Q125 62 115 62 L100 62" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="62" x2="28" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="112" y1="62" x2="112" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M23 65 L33 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M107 65 L117 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PlantSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 130 Q45 90 50 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 100 Q25 85 30 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 100 Q75 85 70 65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 80 Q30 70 33 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M50 80 Q70 70 67 55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="50" cy="40" rx="16" ry="22" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      <line x1="50" y1="18" x2="50" y2="5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 8 L50 2 L56 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="40" y1="28" x2="38" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="35" x2="63" y2="28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="50" x2="37" y2="48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HandshakeSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 70 Q25 30 50 35 Q60 36 65 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M125 70 Q115 30 90 35 Q80 36 75 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M45 50 Q55 25 70 30 Q85 25 95 50" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 55 L65 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 55 L75 45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 82 Q40 65 55 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 82 Q100 65 85 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
