"use client";

import { cn } from "@/lib/utils";

type AnimatedMarqueeProps = {
  text: string;
  className?: string;
  speed?: number; // Duration in seconds for one complete scroll
};

export function AnimatedMarquee({ text, className, speed = 12 }: AnimatedMarqueeProps) {
  // Repeat the text multiple times to ensure seamless scrolling
  const repeatedText = new Array(12).fill(text).join("   •   ");

  return (
    <div
      className={cn(
        "relative z-10 overflow-hidden bg-white/90 py-2.5 shadow-sm backdrop-blur-sm sm:py-3",
        className
      )}
    >
      <div
        className="flex whitespace-nowrap will-change-transform"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        <span className="font-[family-name:var(--font-cinzel)] font-semibold text-red-700 text-xl tracking-[0.06em] sm:text-2xl lg:text-3xl">
          {repeatedText}
        </span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
