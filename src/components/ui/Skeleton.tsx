import { clsx } from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ className, variant = "rect" }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-imperial-carbon/60 rounded-lg",
        variant === "text" && "h-4 rounded",
        variant === "circle" && "rounded-full",
        className
      )}
    />
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="card-imperial overflow-hidden">
      <Skeleton className="aspect-video rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-3/4 rounded" />
        <Skeleton className="h-2 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function NotebookCardSkeleton() {
  return (
    <div className="card-imperial p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-14 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3 rounded" />
          <Skeleton className="h-2 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}
