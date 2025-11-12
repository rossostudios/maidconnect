/**
 * CleanHome - Line-art illustration of a clean, happy home
 * Inspired by SavvyCal's illustration style
 */
export function CleanHome() {
  return (
    <svg
      className="h-full w-full"
      fill="none"
      viewBox="0 0 320 320"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* House structure */}
      <g stroke="neutral-500" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        {/* Roof */}
        <path d="M60 140 L160 60 L260 140" />

        {/* House body */}
        <path d="M80 140 L80 260 L240 260 L240 140" />

        {/* Door */}
        <rect height="80" rx="4" width="50" x="135" y="180" />
        <circle cx="170" cy="220" fill="neutral-500" r="3" />

        {/* Windows */}
        <rect height="50" rx="4" width="50" x="100" y="160" />
        <path d="M125 160 L125 210 M100 185 L150 185" />

        <rect height="50" rx="4" width="50" x="170" y="160" />
        <path d="M195 160 L195 210 M170 185 L220 185" />
      </g>

      {/* Chimney with sparkles (clean air) */}
      <g stroke="neutral-500" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        <path d="M200 100 L200 70 L230 70 L230 120" />
      </g>

      {/* Sparkles around house */}
      <g fill="neutral-500" opacity="0.4">
        {/* Top left sparkle */}
        <path d="M40 120 L42 130 L50 128 L42 132 L44 142 L40 134 L36 142 L38 132 L30 128 L38 130 Z" />

        {/* Top right sparkle */}
        <path d="M280 100 L282 110 L290 108 L282 112 L284 122 L280 114 L276 122 L278 112 L270 108 L278 110 Z" />

        {/* Small sparkle - left */}
        <path d="M50 200 L51 206 L56 205 L51 208 L52 214 L50 209 L48 214 L49 208 L44 205 L49 206 Z" />

        {/* Small sparkle - right */}
        <path d="M270 200 L271 206 L276 205 L271 208 L272 214 L270 209 L268 214 L269 208 L264 205 L269 206 Z" />
      </g>

      {/* Garden with flowers */}
      <g stroke="neutral-500" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5">
        {/* Flower 1 */}
        <circle cx="50" cy="270" r="6" />
        <path d="M50 264 L50 280" />
        <path d="M48 276 L44 278 M52 276 L56 278" />

        {/* Flower 2 */}
        <circle cx="30" cy="275" r="5" />
        <path d="M30 270 L30 285" />
        <path d="M28 281 L25 283 M32 281 L35 283" />

        {/* Flower 3 */}
        <circle cx="270" cy="275" r="5" />
        <path d="M270 270 L270 285" />
        <path d="M268 281 L265 283 M272 281 L275 283" />

        {/* Flower 4 */}
        <circle cx="290" cy="270" r="6" />
        <path d="M290 264 L290 280" />
        <path d="M288 276 L284 278 M292 276 L296 278" />
      </g>

      {/* Ground line */}
      <g
        opacity="0.3"
        stroke="neutral-500"
        strokeDasharray="8 8"
        strokeLinecap="round"
        strokeWidth="2"
      >
        <path d="M10 290 L310 290" />
      </g>

      {/* Heart above house (love for clean home) */}
      <g fill="neutral-500" opacity="0.3">
        <path d="M160 40 C160 35 155 30 150 30 C145 30 142 33 140 36 C138 33 135 30 130 30 C125 30 120 35 120 40 C120 48 140 60 140 60 C140 60 160 48 160 40 Z" />
      </g>
    </svg>
  );
}
