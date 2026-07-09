import React from "react";
import { getSettings } from "@/actions/settings";
import { getNavigationByName } from "@/actions/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: {
      default: settings.site_name || "Revti CMS",
      template: `%s | ${settings.site_name || "Revti CMS"}`,
    },
    description: settings.site_description || "A modern website built with Revti CMS",
  };
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const mainMenu = await getNavigationByName("main");
  const footerMenu = await getNavigationByName("footer");

  const mainNavItems = mainMenu?.items || [];
  const footerNavItems = footerMenu?.items || [];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">{settings.site_name}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {mainNavItems.map((item: any) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target}
                className="text-sm font-medium hover:text-indigo-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-500/25"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {settings.footer_text || `© ${new Date().getFullYear()} ${settings.site_name}. All rights reserved.`}
          </p>
          <div className="flex gap-4">
            {footerNavItems.map((item: any) => (
              <Link
                key={item.id}
                href={item.url}
                target={item.target}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
