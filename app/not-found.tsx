import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-slate-950">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6">
          <FileQuestion className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <p className="text-5xl font-bold text-slate-900 dark:text-white mb-2">404</p>
        <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Page not found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
