// app/components/views/UploadView.tsx
"use client";

import React from "react";

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

  // ✅ créditos disponibles del usuario
  credits: number;

  // ✅ costo de entrenamiento (default 40)
  trainCost?: number;

  // ✅ abrir modal de pagos / aviso de créditos insuficientes
  onNeedCredits?: () => void;

  // ✅ si el backend detecta que Replicate está sin saldo / caído
  trainingBlockedReason?: string | null;
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
  credits,
  trainCost = 40,
  onNeedCredits,
  trainingBlockedReason = null,
}: UploadViewProps) {
  const hasMinPhotos = uploadedImages.length >= 5;
  const hasEnoughCredits = credits >= trainCost;

  const missingCredits = Math.max(0, trainCost - credits);

  // ✅ Puede arrancar entrenamiento (cuando el botón debe iniciar training real)
  const canStartTraining =
    hasMinPhotos &&
    !trainingId &&
    !isUploading &&
    !trainingBlockedReason &&
    hasEnoughCredits;

  const handleStartClick = () => {
    // Bloqueado por backend → no hacemos nada
    if (trainingBlockedReason) return;

    // Si falta créditos → abrimos modal
    if (!hasEnoughCredits) {
      onNeedCredits?.();
      return;
    }

    // Si falta fotos / está subiendo / ya hay training → no hacemos nada
    if (!hasMinPhotos || isUploading || trainingId) return;

    onStartTraining();
  };

  // ✅ Deshabilitamos por casos donde NO corresponde click:
  // - falta mínimo de fotos
  // - está subiendo
  // - ya hay training
  // - backend bloqueó
  // ⚠️ Si NO hay créditos, lo dejamos habilitado para abrir el modal (onNeedCredits)
  const isButtonDisabled =
    !hasMinPhotos || isUploading || !!trainingId || !!trainingBlockedReason;

  const buttonLabel = trainingBlockedReason
    ? "Entrenamiento no disponible"
    : !hasMinPhotos
    ? "Subí al menos 5 fotos"
    : hasEnoughCredits
    ? "Iniciar entrenamiento de mi modelo"
    : "Comprar créditos para entrenar";

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 text-center">
      {/* Volver al dashboard */}
      <button
        onClick={onBack}
        className="mb-6 text-sm text-gray-500 hover:text-black cursor-pointer"
      >
        ← Volver al dashboard
      </button>

      <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Subí tus fotos</h2>
        <p className="text-gray-500 mb-2">
          Usá entre <span className="font-semibold">6 y 10 selfies claras</span>{" "}
          donde se vea bien tu cara.
        </p>

        {/* Créditos */}
        <div className="mt-2 mb-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
            <span className="font-semibold">Créditos:</span> {credits}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-orange-900">
            <span className="font-semibold">Costo de entrenamiento:</span>{" "}
            {trainCost}
          </span>
        </div>

        {uploadProgress && (
          <p className="text-sm text-gray-500 mb-4">{uploadProgress}</p>
        )}

        {/* Aviso si el entrenamiento está bloqueado por backend */}
        {trainingBlockedReason && (
          <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-left">
            <p className="font-bold text-orange-900 mb-1">
              En estos momentos no podemos entrenar tu modelo
            </p>
            <p className="text-sm text-orange-900/80">{trainingBlockedReason}</p>
          </div>
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
        {!trainingId && (
          <>
            {/* Si ya tiene 5 fotos pero no alcanza créditos */}
            {hasMinPhotos && !hasEnoughCredits && !trainingBlockedReason && (
              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-left">
                <p className="font-bold text-orange-900 mb-1">
                  Créditos insuficientes
                </p>
                <p className="text-sm text-orange-900/80">
                  Te faltan{" "}
                  <span className="font-semibold">{missingCredits}</span>{" "}
                  créditos para entrenar tu modelo.
                </p>
              </div>
            )}

            {/* Si aún no tiene el mínimo */}
            {!hasMinPhotos && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left">
                <p className="font-bold text-gray-900 mb-1">
                  Subí al menos 5 fotos
                </p>
                <p className="text-sm text-gray-600">
                  Con {uploadedImages.length} foto(s) no alcanza para entrenar.
                </p>
              </div>
            )}

            <button
              onClick={handleStartClick}
              disabled={isButtonDisabled}
              className="w-full mt-6 bg-black text-white py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {buttonLabel}
            </button>

            {canStartTraining && (
              <p className="mt-3 text-xs text-gray-500">
                El entrenamiento puede tardar varios minutos. Te avisamos cuando
                esté listo.
              </p>
            )}
          </>
        )}

        {/* Estado Entrenamiento */}
        {trainingId && (
          <div className="mt-6 bg-orange-50 p-6 rounded-xl border border-orange-100 text-left">
            <p className="font-bold text-orange-800 mb-1">
              Tu modelo se está entrenando 🔄
            </p>
            <p className="text-sm text-gray-700 mb-2">
              ID de entrenamiento:{" "}
              <span className="font-mono text-xs break-all">{trainingId}</span>
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
