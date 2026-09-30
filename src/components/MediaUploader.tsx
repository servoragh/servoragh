"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export interface UploadedMedia {
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO" | "DOCUMENT";
  fileName: string;
  fileSize?: number;
  thumbnailUrl?: string;
}

interface MediaUploaderProps {
  value: UploadedMedia[];
  onChange: (media: UploadedMedia[]) => void;
  maxImages?: number;
  maxVideoSeconds?: number; // default 30
  maxSizeMB?: number;       // default 15 per file
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

type FileState = {
  id: string;
  name: string;
  type: string;
  size: number;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
  result?: UploadedMedia;
  previewUrl?: string;
};

export function MediaUploader({
  value,
  onChange,
  maxImages = 6,
  maxVideoSeconds = 30,
  maxSizeMB = 15,
}: MediaUploaderProps) {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateFile(id: string, patch: Partial<FileState>) {
    setFileStates((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  async function processFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    const imageCount = value.filter((m) => m.mediaType === "IMAGE").length;
    const videoCount = value.filter((m) => m.mediaType === "VIDEO").length;

    for (const file of arr) {
      const id = `${Date.now()}-${Math.random()}`;
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const isDoc = file.type === "application/pdf";

      // Validate count
      if (isImage && imageCount >= maxImages) {
        setFileStates((prev) => [
          ...prev,
          { id, name: file.name, type: file.type, size: file.size, status: "error", progress: 0, error: `Max ${maxImages} images allowed.` },
        ]);
        continue;
      }
      if (isVideo && videoCount >= 1) {
        setFileStates((prev) => [
          ...prev,
          { id, name: file.name, type: file.type, size: file.size, status: "error", progress: 0, error: "Only 1 video allowed." },
        ]);
        continue;
      }

      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFileStates((prev) => [
          ...prev,
          { id, name: file.name, type: file.type, size: file.size, status: "error", progress: 0, error: `File too large (max ${maxSizeMB}MB).` },
        ]);
        continue;
      }

      // Validate video duration
      if (isVideo) {
        const duration = await getVideoDuration(file);
        if (duration > maxVideoSeconds) {
          setFileStates((prev) => [
            ...prev,
            { id, name: file.name, type: file.type, size: file.size, status: "error", progress: 0, error: `Video must be under ${maxVideoSeconds}s (yours: ${Math.round(duration)}s).` },
          ]);
          continue;
        }
      }

      // Build preview URL for images
      const previewUrl = isImage ? URL.createObjectURL(file) : undefined;

      // Add to state as uploading
      setFileStates((prev) => [
        ...prev,
        { id, name: file.name, type: file.type, size: file.size, status: "uploading", progress: 10, previewUrl },
      ]);

      // Upload via XHR so we can track real progress
      try {
        const url = await uploadWithProgress(file, (pct) => {
          updateFile(id, { progress: pct });
        });

        let mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" = "IMAGE";
        if (isVideo) mediaType = "VIDEO";
        else if (isDoc) mediaType = "DOCUMENT";

        const uploaded: UploadedMedia = {
          mediaUrl: url,
          mediaType,
          fileName: file.name,
          fileSize: file.size,
        };

        updateFile(id, { status: "done", progress: 100, result: uploaded });
        onChange([...value, uploaded]);
      } catch (err: any) {
        updateFile(id, { status: "error", progress: 0, error: err.message || "Upload failed." });
      }
    }
  }

  function getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
    });
  }

  function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 90) + 5);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.url) resolve(data.url);
          else reject(new Error("Upload failed."));
        } else {
          reject(new Error("Upload failed."));
        }
      };

      xhr.onerror = () => reject(new Error("Network error."));
      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    });
  }

  function removeUploaded(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function removeFileState(id: string) {
    setFileStates((prev) => prev.filter((f) => f.id !== id));
  }

  const pendingStates = fileStates.filter((f) => f.status !== "done");

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
          dragOver
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
            : "border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/60 hover:border-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
        <Upload className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
        <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
          Drop photos, a video, or PDF here
        </p>
        <p className="text-[10px] text-stone-400 mt-0.5">
          Up to {maxImages} photos · 1 video (max {maxVideoSeconds}s) · Max {maxSizeMB}MB each
        </p>
      </div>

      {/* Uploaded media thumbnails */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((m, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700 aspect-square bg-stone-100 dark:bg-stone-800">
              {m.mediaType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.mediaUrl} alt={m.fileName} className="w-full h-full object-cover" />
              ) : m.mediaType === "VIDEO" ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Video className="w-6 h-6 text-purple-400" />
                  <span className="text-[10px] text-stone-400 truncate px-1">{m.fileName}</span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <FileText className="w-6 h-6 text-amber-400" />
                  <span className="text-[10px] text-stone-400 truncate px-1">{m.fileName}</span>
                </div>
              )}
              {/* Hover overlay with remove */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button type="button" onClick={(e) => { e.stopPropagation(); removeUploaded(i); }}
                  className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Type badge */}
              <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                m.mediaType === "VIDEO" ? "bg-purple-600 text-white" : m.mediaType === "DOCUMENT" ? "bg-amber-600 text-white" : "bg-emerald-600 text-white"
              }`}>
                {m.mediaType === "IMAGE" ? "IMG" : m.mediaType}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* In-progress and error states */}
      {pendingStates.length > 0 && (
        <div className="space-y-2">
          {pendingStates.map((f) => (
            <div key={f.id} className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs ${
              f.status === "error"
                ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40"
                : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800"
            }`}>
              {f.status === "uploading" ? (
                <Loader2 className="w-4 h-4 text-emerald-500 shrink-0 animate-spin" />
              ) : f.status === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-stone-700 dark:text-stone-300">{f.name}</p>
                {f.status === "uploading" && (
                  <div className="mt-1 h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === "error" && (
                  <p className="text-red-600 dark:text-red-400 text-[10px]">{f.error}</p>
                )}
                {f.status === "uploading" && (
                  <p className="text-stone-400 text-[10px]">{formatBytes(f.size)} · Uploading {f.progress}%</p>
                )}
              </div>
              <button type="button" onClick={() => removeFileState(f.id)}
                className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 flex items-center justify-center shrink-0">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
