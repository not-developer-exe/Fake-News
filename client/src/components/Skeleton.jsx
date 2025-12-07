export function Skeleton({ className }) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-zinc-800 rounded ${className}`} />
    );
  }
  
  export function HistorySkeleton() {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 bg-white/50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-lg">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }