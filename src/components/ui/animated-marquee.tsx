"use client";

import { cn } from "@/lib/utils";

type AnimatedMarqueeProps = {
  text: string;
  className?: string;
  speed?: number; // Duration in seconds for one complete scroll
};

export function AnimatedMarquee({ text, className, speed = 20 }: AnimatedMarqueeProps) {
  // Repeat the text multiple times to ensure seamless scrolling
  const repeatedText = new Array(10).fill(text).join("   •   ");

  return (
    <div className={cn("relative z-10 overflow-hidden bg-[var(--red)] py-3", className)}>
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        <span className="font-[family-name:var(--font-cinzel)] font-semibold text-2xl text-white tracking-[0.08em] sm:text-3xl">
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
