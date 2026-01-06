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
      {/* Volver al dashboard */}
      <button
        onClick={onBack}
        className="mb-6 text-sm text-gray-500 hover:text-black"
      >
        ← Volver al dashboard
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Subí tus fotos</h2>
        <p className="text-gray-500 mb-2">
          Usá entre <span className="font-semibold">6 y 10 selfies claras</span>{" "}
          donde se vea bien tu cara.
        </p>

        {uploadProgress && (
          <p className="text-sm text-gray-500 mb-4">{uploadProgress}</p>
        )}

        {/* Dropzone */}
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 md:p-12 bg-gray-50 hover:bg-white hover:border-[#ff5a1f] transition cursor-pointer relative group">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          <div className="text-gray-400 group-hover:text-[#ff5a1f] transition font-medium text-sm md:text-base">
            {isUploading
              ? "Subiendo tus fotos..."
              : "Arrastrá tus fotos o hacé clic para seleccionarlas"}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Formatos aceptados: JPG, PNG, HEIC
          </p>
        </div>

        {/* Previews */}
        {uploadedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            {uploadedImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Selfie ${i + 1}`}
                className="rounded-xl object-cover w-full h-28 md:h-32 border border-gray-200"
              />
            ))}
          </div>
        )}

        {/* BOTÓN ENTRENAR */}
        {uploadedImages.length >= 5 && !trainingId && (
          <button
            onClick={onStartTraining}
            disabled={isUploading}
            className="w-full mt-6 bg-black text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Iniciar entrenamiento de mi modelo
          </button>
        )}

        {/* Estado Entrenamiento */}
        {trainingId && (
          <div className="mt-6 bg-orange-50 p-6 rounded-xl border border-orange-100 text-left">
            <p className="font-bold text-orange-800 mb-1">
              Tu modelo se está entrenando 🔄
            </p>
            <p className="text-sm text-gray-700 mb-2">
              ID de entrenamiento:{" "}
              <span className="font-mono text-xs break-all">
                {trainingId}
              </span>
            </p>
            <p className="text-sm text-gray-600">Estado actual: {status}</p>
            <button
              onClick={onCheckStatus}
              className="text-xs mt-3 inline-flex items-center gap-1 text-orange-700 hover:text-orange-900 underline"
            >
              Actualizar estado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
