import Image from "next/image";
import { cn } from "@/lib/utils";

type LoadingCamperProps = {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
};

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

export function LoadingCamper({ size = "md", text, className = "" }: LoadingCamperProps) {
  const dimension = sizeMap[size];
  const haloSize = dimension + 56;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: haloSize, height: haloSize }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF5200]/25 via-transparent to-[#FF5200]/25 opacity-70 blur-xl" />
        <div className="absolute inset-1 rounded-full border border-neutral-200/70" />
        <div className="absolute inset-5 rounded-full border border-[#FF5200]/30" />
        <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#FF5200] shadow-[0_0_12px_rgba(255,82,0,0.8)]" />
        </div>
        <div className="relative animate-[bounce_2.4s_ease-in-out_infinite]">
          <Image alt="Loading" height={dimension} priority src="/loading.svg" width={dimension} />
        </div>
      </div>
      {text && (
        <p className="font-medium text-neutral-600 text-sm tracking-[0.25em]">
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingCamperSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div className="h-32 border border-neutral-200 bg-white" key={i}>
            <div className="flex h-full items-center justify-center">
              <LoadingCamper size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
