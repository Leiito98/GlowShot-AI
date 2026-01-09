"use client";

type MyPicturesItem = {
  id: string | number;
  image_url: string;
};

type MyPicturesViewProps = {
  images: MyPicturesItem[];
  onBackToHome: () => void;
};

export function MyPicturesView({ images, onBackToHome }: MyPicturesViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Mis retratos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Galería de todas las fotos generadas con tu modelo.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="hidden sm:inline">
            {images.length} foto{images.length === 1 ? "" : "s"}
          </span>

          <button
            onClick={onBackToHome}
            className="px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium hover:bg-gray-50 cursor-pointer"
          >
            ← Volver
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {images.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-gray-500 text-lg mb-2">
            Aún no generaste fotos.
          </p>

          <p className="text-gray-400 text-sm mb-5 max-w-md mx-auto">
            Cuando generes tus primeros retratos en el Dashboard,
            aparecerán automáticamente en esta galería.
          </p>

          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1 text-[#ff5a1f] font-bold hover:underline"
          >
            Ir al Dashboard →
          </button>
        </div>
      ) : (
        /* GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image_url}
                className="w-full object-cover aspect-[2/3]"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "/placeholder-image.png";
                }}
              />

              {/* Download */}
              <a
                href={item.image_url}
                download
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition"
              >
                ⬇️
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
