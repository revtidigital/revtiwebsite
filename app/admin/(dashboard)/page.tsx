import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { FileText, Files, Image, Users, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatRelativeTime } from "@/utils/format";
import { POST_STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/utils/cn";
import type { PostStatus } from "@prisma/client";

async function getStats() {
  const [postsCount, pagesCount, mediaCount, usersCount, recentPosts] = await Promise.all([
    prisma.post.count(),
    prisma.page.count(),
    prisma.media.count(),
    prisma.user.count(),
    prisma.post.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } }, category: { select: { name: true } } },
    }),
  ]);

  return { postsCount, pagesCount, mediaCount, usersCount, recentPosts };
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const { postsCount, pagesCount, mediaCount, usersCount, recentPosts } = await getStats();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${session?.user?.name?.split(" ")[0] || "Admin"}`}
        description="Here's what's happening with your content today."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Posts" value={postsCount} icon={FileText} />
        <StatCard title="Total Pages" value={pagesCount} icon={Files} />
        <StatCard title="Media Files" value={mediaCount} icon={Image} />
        <StatCard title="Users" value={usersCount} icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Posts</h2>
            <Link
              href="/admin/posts"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentPosts.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No posts yet. Create your first post!
              </div>
            ) : (
              recentPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/admin/posts/${post.id}/edit`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {post.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {post.author.name} • {formatRelativeTime(post.createdAt)}
                    </p>
                  </div>
                  <span className={cn(
                    "ml-4 px-2.5 py-1 rounded-full text-xs font-medium",
                    POST_STATUS_COLORS[post.status as PostStatus]
                  )}>
                    {post.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "New Post", href: "/admin/posts/new", icon: FileText, color: "from-indigo-500 to-blue-500" },
              { label: "New Page", href: "/admin/pages/new", icon: Files, color: "from-purple-500 to-pink-500" },
              { label: "Upload Media", href: "/admin/media", icon: Image, color: "from-emerald-500 to-teal-500" },
              { label: "Add User", href: "/admin/users/new", icon: Users, color: "from-amber-500 to-orange-500" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.color} shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {action.label}
                </span>
                <Plus className="w-4 h-4 text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
