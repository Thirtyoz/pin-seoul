interface HomeLoadingProps {
  theme: "light" | "dark";
  count?: number;
}

export function HomeLoading({ theme, count = 5 }: HomeLoadingProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full rounded-xl p-3 flex items-center gap-3 border ${
            theme === "dark"
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Skeleton image */}
          <div className={`w-14 h-14 rounded-xl flex-shrink-0 animate-pulse ${
            theme === "dark" ? "bg-slate-700" : "bg-gray-200"
          }`} />

          {/* Skeleton text */}
          <div className="flex-1 space-y-2">
            <div className={`h-4 rounded animate-pulse ${
              theme === "dark" ? "bg-slate-700" : "bg-gray-200"
            }`} style={{ width: '70%' }} />
            <div className={`h-3 rounded animate-pulse ${
              theme === "dark" ? "bg-slate-700" : "bg-gray-200"
            }`} style={{ width: '90%' }} />
            <div className="flex gap-2">
              <div className={`h-5 w-14 rounded animate-pulse ${
                theme === "dark" ? "bg-slate-700" : "bg-gray-200"
              }`} />
              <div className={`h-5 w-20 rounded animate-pulse ${
                theme === "dark" ? "bg-slate-700" : "bg-gray-200"
              }`} />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
