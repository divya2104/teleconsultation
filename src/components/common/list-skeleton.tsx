import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-border pb-5">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[--radius-lg] border border-border bg-surface p-4"
          >
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-20 rounded-[--radius-md]" />
          </div>
        ))}
      </div>
    </div>
  );
}
