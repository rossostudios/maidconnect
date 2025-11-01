/**
 * Etta Icon - Intercom-style rounded square speech bubble with smile
 * Matches Intercom's clean, modern aesthetic
 */

interface EttaIconProps {
  className?: string;
  size?: number;
}

export function EttaIcon({ className, size = 32 }: EttaIconProps) {
  return (
    <svg
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rounded square speech bubble - Intercom style */}
      <rect fill="currentColor" height="24" rx="8" width="24" x="4" y="4" />

      {/* Smile - just the curved mouth */}
      <path
        d="M11 17C11 17 13.5 20 16 20C18.5 20 21 17 21 17"
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
