/**
 * BookingCalendar - Line-art illustration of a scheduling calendar
 * Inspired by SavvyCal's illustration style
 */
export function BookingCalendar() {
  return (
    <svg
      className="h-full w-full"
      fill="none"
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Calendar frame */}
      <g stroke="#E85D48" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        {/* Main calendar body */}
        <rect height="220" rx="12" width="240" x="40" y="60" />

        {/* Calendar header */}
        <path d="M40 110 L280 110" />

        {/* Binding rings */}
        <circle cx="80" cy="60" r="8" />
        <circle cx="160" cy="60" r="8" />
        <circle cx="240" cy="60" r="8" />

        {/* Month/year text placeholder */}
        <path d="M60 85 L120 85" opacity="0.5" strokeWidth="3" />
      </g>

      {/* Calendar grid */}
      <g stroke="#E85D48" strokeLinecap="round" strokeWidth="2">
        {/* Vertical lines */}
        <path d="M80 110 L80 270" opacity="0.2" />
        <path d="M120 110 L120 270" opacity="0.2" />
        <path d="M160 110 L160 270" opacity="0.2" />
        <path d="M200 110 L200 270" opacity="0.2" />
        <path d="M240 110 L240 270" opacity="0.2" />

        {/* Horizontal lines */}
        <path d="M40 150 L280 150" opacity="0.2" />
        <path d="M40 190 L280 190" opacity="0.2" />
        <path d="M40 230 L280 230" opacity="0.2" />
      </g>

      {/* Booked dates - checkmarks */}
      <g
        fill="none"
        stroke="#E85D48"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.5"
      >
        <path d="M55 135 L62 142 L75 125" />
        <path d="M135 135 L142 142 L155 125" />
        <path d="M215 175 L222 182 L235 165" />
      </g>

      {/* Highlighted date (today/selected) */}
      <g>
        <rect fill="#E85D48" height="30" opacity="0.15" rx="4" width="35" x="162.5" y="195" />
        <circle cx="180" cy="210" fill="#E85D48" r="3" />
      </g>

      {/* Clock icon (scheduling time) */}
      <g stroke="#E85D48" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        <circle cx="240" cy="240" r="25" />
        <path d="M240 220 L240 240 L255 240" />
      </g>

      {/* Floating elements around calendar */}
      <g stroke="#E85D48" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        {/* Notification bell */}
        <path d="M280 120 C280 125 285 130 290 130 C295 130 300 125 300 120 L300 110 C300 105 295 100 290 100 C285 100 280 105 280 110 Z" />
        <path d="M285 130 C285 135 295 135 295 130" />
        <circle cx="290" cy="95" r="3" />

        {/* Star (favorite/featured) */}
        <path d="M30 140 L33 150 L43 150 L35 156 L38 166 L30 160 L22 166 L25 156 L17 150 L27 150 Z" />
      </g>

      {/* Sparkle effects (success/confirmation) */}
      <g fill="#E85D48" opacity="0.3">
        <path d="M25 200 L26 206 L31 205 L26 208 L27 214 L25 209 L23 214 L24 208 L19 205 L24 206 Z" />
        <path d="M295 180 L296 184 L300 183 L296 186 L297 190 L295 187 L293 190 L294 186 L290 183 L294 184 Z" />
        <path d="M270 90 L271 94 L275 93 L271 96 L272 100 L270 97 L268 100 L269 96 L265 93 L269 94 Z" />
      </g>

      {/* Arrow (booking flow) */}
      <g stroke="#E85D48" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        <path d="M290 200 L310 220" />
        <path d="M305 215 L310 220 L305 225" />
      </g>
    </svg>
  );
}
