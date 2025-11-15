import Image from "next/image";

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

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="animate-pulse">
        <Image
          alt="Loading"
          className="opacity-80"
          height={dimension}
          priority
          src="/loading.svg"
          width={dimension}
        />
      </div>
      {text && <p className="font-medium text-neutral-600 text-sm tracking-tight">{text}</p>}
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
