"use client";

import { useState, useEffect, useTransition } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { getMedia, uploadMedia, deleteMedia } from "@/actions/media";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { formatFileSize, formatDate } from "@/utils/format";
import { Upload, Trash2, Search, Image as ImageIcon, File as FileIcon, Loader2, Copy, Check } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  altText: string | null;
  createdAt: Date;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadMedia();
  }, [search]);

  async function loadMedia() {
    const res = await getMedia({ limit: 100, search });
    setMedia(res.data as any[]);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("altText", files[i].name.split(".")[0]);
      await uploadMedia(formData);
    }
    setUploading(false);
    loadMedia();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await deleteMedia(deleteId);
    if (res.success) {
      setDeleteId(null);
      loadMedia();
    }
  }

  function handleCopy(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <PageHeader title="Media Library" description="Upload and manage your assets.">
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/25 cursor-pointer disabled:opacity-50">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading..." : "Upload Files"}
          <input type="file" onChange={handleFileChange} multiple className="hidden" accept="image/*,application/pdf" />
        </label>
      </PageHeader>

      {/* Search & Toolbar */}
      <div className="mb-6 flex gap-4 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {media.map((item) => {
          const isImage = item.mimeType.startsWith("image/");
          return (
            <div key={item.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all">
              <div className="aspect-square bg-slate-50 dark:bg-slate-950 relative flex items-center justify-center border-b border-slate-100 dark:border-slate-800/50">
                {isImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={item.url}
                      alt={item.altText || item.fileName}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <FileIcon className="w-12 h-12 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(item.id, item.url)}
                    className="p-2 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors shadow text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate" title={item.fileName}>
                  {item.fileName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatFileSize(item.fileSize)} • {formatDate(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {media.length === 0 && (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="font-semibold">No media files found</p>
          <p className="text-sm mt-1">Upload images or files to get started.</p>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete File"
        description="Are you sure you want to delete this file from storage? This cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
