'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import NavBar from '@/components/shared/NavBar';
import ImageList from '@/components/annotation/ImageList';
import { AnnotationImage, Polygon } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

// react-konva requires the DOM — disable SSR for the canvas component
const AnnotationCanvas = dynamic(
  () => import('@/components/annotation/AnnotationCanvas'),
  { ssr: false }
);

export default function AnnotatePage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, hydrate } = useAuthStore();
  const [images, setImages] = useState<AnnotationImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<AnnotationImage | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  // Fetch images once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .get<AnnotationImage[]>('/annotations/images/')
      .then((res) => {
        setImages(res.data);
        if (res.data.length > 0) setSelectedImage(res.data[0]);
      })
      .catch(() => toast.error('Failed to load images'));
  }, [isAuthenticated]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await api.post<AnnotationImage>('/annotations/images/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImages((prev) => [res.data, ...prev]);
      setSelectedImage(res.data);
      toast.success('Image uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (id: number) => {
    const remaining = images.filter((img) => img.id !== id);
    try {
      await api.delete(`/annotations/images/${id}/`);
      setImages(remaining);
      setSelectedImage((prev) =>
        prev?.id === id ? (remaining[0] ?? null) : prev
      );
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    }
  };

  const handlePolygonSaved = (polygon: Polygon) => {
    const patchImage = (img: AnnotationImage): AnnotationImage =>
      img.id === polygon.image
        ? { ...img, polygons: [...img.polygons, polygon] }
        : img;
    setImages((prev) => prev.map(patchImage));
    setSelectedImage((prev) => (prev ? patchImage(prev) : prev));
  };

  const handlePolygonDeleted = (polygonId: number) => {
    const patchImage = (img: AnnotationImage): AnnotationImage => ({
      ...img,
      polygons: img.polygons.filter((p) => p.id !== polygonId),
    });
    setImages((prev) => prev.map(patchImage));
    setSelectedImage((prev) => (prev ? patchImage(prev) : prev));
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-100">Annotation Tool</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Upload images and draw polygon annotations
          </p>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '280px 1fr' }}>
          {/* Left: image list */}
          <ImageList
            images={images}
            selectedId={selectedImage?.id ?? null}
            uploading={uploading}
            onSelect={setSelectedImage}
            onUpload={handleUpload}
            onDelete={handleDeleteImage}
          />

          {/* Right: annotation canvas */}
          {selectedImage ? (
            <AnnotationCanvas
              image={selectedImage}
              onPolygonSaved={handlePolygonSaved}
              onPolygonDeleted={handlePolygonDeleted}
            />
          ) : (
            <div className="flex min-h-[460px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40">
              <p className="text-sm text-zinc-600">Upload an image to start annotating</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

