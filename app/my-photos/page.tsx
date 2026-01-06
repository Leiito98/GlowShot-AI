// app/myphotos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { MyPicturesView } from "@/app/components/views/MyPicturesView";

type MyPicturesItem = {
  id: string | number;
  image_url: string;
};

export default function MyPhotosPage() {
  const { user } = useUser();
  const [images, setImages] = useState<MyPicturesItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    if (!user) return;

    const load = async () => {
      try {
        const res = await fetch("/api/my-images");
        const data = await res.json();
        if (data.images) setImages(data.images);
      } catch (e) {
        console.error("Error cargando galería:", e);
      }
    };

    load();
  }, [user]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" aria-hidden />;
  }

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <HeaderBar />

      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <SignedOut>
            <div className="mt-10 text-center text-sm text-gray-500">
              Necesitás iniciar sesión para ver tus fotos.
            </div>
          </SignedOut>

          <SignedIn>
            <MyPicturesView
              images={images}
              onBackToHome={() => {
                // si querés, redirigís a /dashboard
                window.location.href = "/dashboard";
              }}
            />
          </SignedIn>
        </div>
      </main>
    </div>
  );
}
