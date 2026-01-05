"use client";

type GalleryItem = {
  id: string | number;
  image_url: string;
};

type GalleryViewProps = {
  images: GalleryItem[];
  onBackToHome: () => void;
};

export function GalleryView({ images, onBackToHome }: GalleryViewProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Mis Retratos</h2>
        <span className="text-gray-500">{images.length} fotos</span>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
          <p className="text-gray-500 text-lg mb-4">
            Aún no generaste fotos.
          </p>
          <button
            onClick={onBackToHome}
            className="text-[#ff5a1f] font-bold"
          >
            Crear →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((item) => (
            <div
              key={item.id}
              className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image_url}
                className="w-full object-cover aspect-[2/3]"
              />
              <a
                href={item.image_url}
                download
                target="_blank"
                className="absolute bottom-3 right-3 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100"
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
