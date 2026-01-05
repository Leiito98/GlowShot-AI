"use client";

type UploadViewProps = {
  onBack: () => void;
  uploadedImages: string[];
  isUploading: boolean;
  uploadProgress: string;
  onFileChange: React.ChangeEventHandler<HTMLInputElement>;
  onStartTraining: () => void;
  trainingId: string | null;
  status: string;
  onCheckStatus: () => void;
};

export function UploadView({
  onBack,
  uploadedImages,
  isUploading,
  uploadProgress,
  onFileChange,
  onStartTraining,
  trainingId,
  status,
  onCheckStatus,
}: UploadViewProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 text-center">
      <button onClick={onBack} className="mb-6 text-gray-500 hover:text-black">
        ← Cancelar
      </button>

      <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Sube tus fotos</h2>
        <p className="text-gray-500 mb-2">Selecciona 6-10 selfies claras.</p>
        {uploadProgress && (
          <p className="text-sm text-gray-500 mb-4">{uploadProgress}</p>
        )}

        {/* Dropzone */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 bg-gray-50 hover:bg-white hover:border-[#ff5a1f] transition cursor-pointer relative group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="text-gray-400 group-hover:text-[#ff5a1f] transition font-medium">
            {isUploading ? "Subiendo..." : "Arrastra o haz clic aquí"}
          </div>
        </div>

        {/* Previews */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {uploadedImages.map((url, i) => (
              <img
                key={i}
                src={url}
                className="rounded-xl object-cover w-full h-32 border"
              />
            ))}
          </div>
        )}

        {/* BOTÓN ENTRENAR */}
        {uploadedImages.length >= 5 && !trainingId && (
          <button
            onClick={onStartTraining}
            className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition"
          >
            Iniciar Entrenamiento
          </button>
        )}

        {/* Estado Entrenamiento */}
        {trainingId && (
          <div className="mt-6 bg-orange-50 p-6 rounded-xl border border-orange-100">
            <p className="font-bold text-orange-800">Entrenando IA...</p>
            <p className="text-sm text-gray-600">Estado: {status}</p>
            <button
              onClick={onCheckStatus}
              className="text-xs underline mt-2"
            >
              Verificar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
