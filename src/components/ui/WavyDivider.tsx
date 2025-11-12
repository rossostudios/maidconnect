type WavyDividerProps = {
  /** Background color of the section above the wave */
  topColor?: string;
  /** Background color of the section below the wave */
  bottomColor?: string;
  /** Flip the wave vertically */
  flip?: boolean;
  /** Custom className for additional styling */
  className?: string;
};

/**
 * WavyDivider - A decorative SVG wave divider between sections
 * Inspired by SavvyCal's design aesthetic
 *
 * Usage:
 * <WavyDivider topColor="bg-[neutral-50]" bottomColor="neutral-900" />
 */
export function WavyDivider({
  topColor = "bg-[neutral-50]",
  bottomColor = "neutral-50",
  flip = false,
  className = "",
}: WavyDividerProps) {
  return (
    <div className={`relative w-full ${className}`} style={{ height: "80px" }}>
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        style={{
          transform: flip ? "scaleY(-1)" : "none",
        }}
        viewBox="0 0 1440 80"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top section background */}
        <path d="M0,0 L1440,0 L1440,80 L0,80 Z" fill={topColor} />

        {/* Smooth wave path */}
        <path
          d="M0,48 C240,16 480,16 720,48 C960,80 1200,80 1440,48 L1440,80 L0,80 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
}

/**
 * WavyDividerTall - A taller version for more dramatic section transitions
 */
export function WavyDividerTall({
  topColor = "bg-[neutral-50]",
  bottomColor = "neutral-50",
  flip = false,
  className = "",
}: WavyDividerProps) {
  return (
    <div className={`relative w-full ${className}`} style={{ height: "120px" }}>
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        style={{
          transform: flip ? "scaleY(-1)" : "none",
        }}
        viewBox="0 0 1440 120"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top section background */}
        <path d="M0,0 L1440,0 L1440,120 L0,120 Z" fill={topColor} />

        {/* Smooth wave path - more dramatic curve */}
        <path
          d="M0,72 C360,24 720,24 1080,72 C1260,96 1350,96 1440,72 L1440,120 L0,120 Z"
          fill={bottomColor}
        />
      </svg>
    </div>
  );
}
