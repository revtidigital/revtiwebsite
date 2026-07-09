export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mb-2" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-96" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-6" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32 mb-6" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
