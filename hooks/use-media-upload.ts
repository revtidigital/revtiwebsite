"use client";

import { useState, useCallback } from "react";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const upload = useCallback(async (file: File): Promise<UploadResult | null> => {
    setState({ isUploading: true, progress: 0, error: null });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      setState({ isUploading: false, progress: 100, error: null });
      const result = await response.json();
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setState({ isUploading: false, progress: 0, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isUploading: false, progress: 0, error: null });
  }, []);

  return { ...state, upload, reset };
}
