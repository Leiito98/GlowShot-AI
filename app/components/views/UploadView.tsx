// app/components/views/UploadView.tsx
"use client";

import React, { useState } from "react";

type UploadViewProps = {
  onBack: () => void;
  uploadedImages: string[];
  isUploading: boolean;
  uploadProgress: string;
  onFileChange: React.ChangeEventHandler<HTMLInputElement>;
  onStartTraining: () => void;
  trainingId: string | null;
  status: string;
  onCheckStatus: () => Promise<void> | void; // <-- permite async

  // créditos del usuario
  credits: number;

  // costo del entrenamiento
  trainCost?: number;

  // abrir modal de compra de créditos
  onNeedCredits?: () => void;

  // bloqueo por backend
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
  const hasMinPhotos = uploadedImages.length >= 8;
  const hasEnoughCredits = credits >= trainCost;
  const missingCredits = Math.max(0, trainCost - credits);

  // UI local: “Processing…” solo al apretar actualizar estado
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // puede iniciar entrenamiento real
  const canStartTraining =
    hasMinPhotos &&
    !trainingId &&
    !isUploading &&
    !trainingBlockedReason &&
    hasEnoughCredits;

  const handleStartClick = () => {
    if (trainingBlockedReason) return;

    if (!hasEnoughCredits) {
      onNeedCredits?.();
      return;
    }

    if (!hasMinPhotos || isUploading || trainingId) return;

    onStartTraining();
  };

  // botón deshabilitado (excepto compra de créditos)
  const isButtonDisabled =
    !hasMinPhotos || isUploading || !!trainingId || !!trainingBlockedReason;

  const buttonLabel = trainingBlockedReason
    ? "Entrenamiento no disponible"
    : !hasMinPhotos
    ? "Subí al menos 6 fotos"
    : hasEnoughCredits
    ? "Iniciar entrenamiento de mi modelo"
    : "Comprar créditos para entrenar";

  // 👇 cursor SOLO para entrenar o comprar
  const showPointerCursor =
    buttonLabel === "Iniciar entrenamiento de mi modelo" ||
    buttonLabel === "Comprar créditos para entrenar";

  // Mostrar “Processing…” solo en UI mientras chequea
  const statusLabel = isCheckingStatus ? "Processing..." : status;

  const handleCheckStatusClick = async () => {
    try {
      setIsCheckingStatus(true);
      await onCheckStatus?.();
    } finally {
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 pt-10 text-center">
      {/* Volver */}
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

        {/* Bloqueo backend */}
        {trainingBlockedReason && (
          <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-left">
            <p className="font-bold text-orange-900 mb-1">
              En estos momentos no podemos entrenar tu modelo
            </p>
            <p className="text-sm text-orange-900/80">
              {trainingBlockedReason}
            </p>
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

        {/* BOTÓN */}
        {!trainingId && (
          <>
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

            {!hasMinPhotos && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-left">
                <p className="font-bold text-gray-900 mb-1">
                  Subí al menos 6 fotos
                </p>
                <p className="text-sm text-gray-600">
                  Con {uploadedImages.length} foto(s) no alcanza para entrenar.
                </p>
              </div>
            )}

            <button
              onClick={handleStartClick}
              disabled={isButtonDisabled}
              className={`
                w-full mt-6 bg-black text-white py-3.5 md:py-4 rounded-xl
                font-bold text-base md:text-lg transition hover:bg-gray-800
                ${showPointerCursor ? "cursor-pointer" : "cursor-not-allowed"}
                disabled:opacity-60
              `}
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

        {/* Estado entrenamiento */}
        {trainingId && (
          <div className="mt-6 bg-orange-50 p-6 rounded-xl border border-orange-100 text-left">
            <p className="font-bold text-orange-800 mb-1">
              Tu modelo se está entrenando 🔄
            </p>
            <p className="text-sm text-gray-700 mb-2">
              ID de entrenamiento:{" "}
              <span className="font-mono text-xs break-all">{trainingId}</span>
            </p>

            <p className="text-sm text-gray-600">
              Estado actual:{" "}
              <span className="font-medium text-gray-800">{statusLabel}</span>
            </p>

            <button
              onClick={handleCheckStatusClick}
              disabled={isCheckingStatus}
              className={`text-xs mt-3 inline-flex items-center gap-1 underline
                ${
                  isCheckingStatus
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-orange-700 hover:text-orange-900 cursor-pointer"
                }`}
            >
              {isCheckingStatus ? "Actualizando..." : "Actualizar estado"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
