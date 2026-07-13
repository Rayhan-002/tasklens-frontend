'use client';

import { AnnotationImage } from '@/types';
import { resolveMediaUrl } from '@/lib/api';

interface Props {
  images: AnnotationImage[];
  selectedId: number | null;
  uploading: boolean;
  onSelect: (image: AnnotationImage) => void;
  onUpload: (file: File) => void;
  onDelete: (id: number) => void;
}

export default function ImageList({ images, selectedId, uploading, onSelect, onUpload, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Upload dropzone */}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 px-3 py-4 text-sm text-zinc-400 transition hover:border-indigo-500/50 hover:text-zinc-300">
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <>
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs">Uploading…</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-xs">Upload image</span>
          </>
        )}
      </label>

      {/* List */}
      <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: '580px' }}>
        {images.length === 0 ? (
          <p className="py-10 text-center text-xs text-zinc-600">No images yet</p>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(img)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(img); }}
              className={`group flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-left transition ${
                selectedId === img.id
                  ? 'border-indigo-500/60 bg-indigo-500/10'
                  : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveMediaUrl(img.file)}
                alt={img.filename}
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-zinc-300">{img.filename}</p>
                <p className="text-xs text-zinc-600">{img.polygons.length} annotation{img.polygons.length !== 1 ? 's' : ''}</p>
              </div>
              {/* Delete */}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                className="shrink-0 rounded p-1 text-zinc-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                aria-label="Delete image"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
