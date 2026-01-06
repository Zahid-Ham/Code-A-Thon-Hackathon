// Complex Cockpit SVG Path
// This represents a futuristic, angular window frame
export const COCKPIT_PATH =
  "M0,0 L0,1080 L1920,1080 L1920,0 L0,0 M150,150 L300,100 L1620,100 L1770,150 L1770,800 L1600,980 L320,980 L150,800 L150,150 Z";

// We will use a more React-friendly SVG stricture in the component, but this logic helps define the "Cutout"
// Ideally: A fullscreen div with a border-image or a massive SVG stroke that covers the edges.
// Better approach: SVG with 'mask' or simply filled paths for the frame parts.

export const CockpitFrame = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none z-30"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    {/* Dark Frame - The Window Frame */}
    <path
      d="M0,0 L100,0 L100,100 L0,100 L0,0 Z M15,15 L85,15 L90,25 L90,75 L85,85 L15,85 L10,75 L10,25 Z"
      fill="#050a10"
      fillRule="evenodd"
    />

    {/* Glass Reflection Tint */}
    <path
      d="M15,15 L85,15 L90,25 L90,75 L85,85 L15,85 L10,75 L10,25 Z"
      fill="url(#glassGradient)"
      opacity="0.1"
    />

    {/* HUD Lines - Decoration on the glass */}
    <path
      d="M48,50 L52,50 M50,48 L50,52"
      stroke="cyan"
      strokeWidth="0.1"
      opacity="0.5"
    />
    <path
      d="M30,30 L35,30 L32,35 Z"
      stroke="cyan"
      strokeWidth="0.1"
      fill="none"
      opacity="0.3"
    />
    <path
      d="M70,30 L65,30 L68,35 Z"
      stroke="cyan"
      strokeWidth="0.1"
      fill="none"
      opacity="0.3"
    />

    <defs>
      <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#87ceeb" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="100%" stopColor="#87ceeb" stopOpacity="0.2" />
      </linearGradient>
    </defs>
  </svg>
);
