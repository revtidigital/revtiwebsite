import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-7xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">404</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The admin page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
