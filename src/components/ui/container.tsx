import { cn } from "@/lib/utils";

type ContainerProps = React.PropsWithChildren<{
  className?: string;
}>;

export function Container({ className, children }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[1320px] px-5 sm:px-8 lg:px-12 xl:px-16", className)}>
      {children}
    </div>
  );
}
