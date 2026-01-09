// app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/app/lib/supabase";
import { getPromptsForPack } from "@/lib/prompts";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { UploadView } from "@/app/components/views/UploadView";
import { DashboardView } from "@/app/components/views/DashboardView";
import { PayModal } from "@/app/components/modals/PayModal";
import {
  ToastStack,
  ToastMessage,
  ToastType,
} from "@/app/components/ui/ToastStack";

import { Plan, PlanId } from "@/app/config/plans";
import {
  UXGender,
  AgeRange,
  HairColor,
  HairLength,
  HairStyle,
  Ethnicity,
  BodyType,
  Attire,
  Background,
} from "@/app/types/studio";

type DashboardMode = "upload" | "dashboard";
type PayMethod = "mercadopago" | "payu" | "usdt";

const TRAIN_COST = 40;

export default function DashboardClient() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(false);

  // Vista interna del dashboard
  const [mode, setMode] = useState<DashboardMode>("dashboard");

  // Plan / preferencias
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);
  const [hasCompletedPreferences, setHasCompletedPreferences] = useState(false);

  // Entrenamiento
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [trainingBlockedReason, setTrainingBlockedReason] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [weightsUrl, setWeightsUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);

  // Preferencias de estudio
  const [gender, setGender] = useState<UXGender>("woman");
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // Modal pagos
  const [showPayModal, setShowPayModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<Plan | null>(null);

  const [ageRange, setAgeRange] = useState<AgeRange>("25_29");
  const [hairColor, setHairColor] = useState<HairColor>("black");
  const [hairLength, setHairLength] = useState<HairLength>("short");
  const [hairStyle, setHairStyle] = useState<HairStyle>("straight");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("hispanic");
  const [bodyType, setBodyType] = useState<BodyType>("athletic");
  const [attires, setAttires] = useState<Attire[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);

  // ---------- TOASTS ----------
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Leer créditos ---
  const fetchCredits = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    try {
      const res = await fetch("/api/get-credits");
      if (!res.ok) throw new Error("API falló al leer créditos");
      const data = await res.json();
      const c = Number(data.credits || 0);
      setCredits(c);
      return c;
    } catch {
      setCredits(0);
      return 0;
    }
  }, [user]);

  // --- Cargar galería (por si luego la usás acá) ---
  const loadGallery = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/my-images");
      const data = await res.json();
      if (data.images) setGalleryImages(data.images);
    } catch (error) {
      console.error("Error cargando galería:", error);
    }
  }, [user]);

  // ✅ abrir modal métodos (opcionalmente con plan preseleccionado)
  const openPayModal = useCallback((plan?: Plan) => {
    if (plan) setPendingPlan(plan);
    else setPendingPlan(null);
    setShowPayModal(true);
  }, []);

  // ✅ si vuelve de MP con ?paid=1 mostramos toast y refrescamos créditos
  useEffect(() => {
    if (!user) return;

    const paid = searchParams.get("paid");
    if (paid !== "1") return;

    pushToast("✅ Compra exitosa. Acreditando créditos…", "success");

    let tries = 0;
    const t = setInterval(async () => {
      tries += 1;
      await fetchCredits();

      if (tries >= 6) {
        clearInterval(t);
        router.replace("/dashboard");
      }
    }, 1500);

    return () => clearInterval(t);
  }, [searchParams, user, fetchCredits, pushToast, router]);

  // Carga inicial y polling
  useEffect(() => {
    setIsLoaded(true);
    let intervalId: NodeJS.Timeout | undefined;

    if (typeof window !== "undefined") {
      const savedPlan = window.localStorage.getItem("plan_id") as PlanId | null;
      if (savedPlan) setCurrentPlan(savedPlan);

      const savedPrefs = window.localStorage.getItem("hasCompletedPreferences");
      if (savedPrefs === "1") setHasCompletedPreferences(true);
    }

    async function init() {
      if (!user) return;

      await fetchCredits();
      await loadGallery();

      // Revisar si ya tiene un modelo entrenado
      try {
        const { data: model } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (model?.lora_url) {
          setWeightsUrl(model.lora_url);
          setHasCompletedPreferences(true);
        }
      } catch (e) {
        console.error(e);
      }

      intervalId = setInterval(() => {
        fetchCredits();
      }, 10000);
    }

    init();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [user, fetchCredits, loadGallery]);

  // --- Subida de fotos ---
  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    async (e) => {
      if (!e.target.files || e.target.files.length === 0) return;
      if (!user) {
        pushToast("Inicia sesión antes de subir fotos.", "warning");
        return;
      }

      setIsUploading(true);
      setUploadProgress("Subiendo fotos...");

      try {
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        for (const file of files) {
          const filePath = `training/${user.id}/${Date.now()}-${file.name}`;

          const { error } = await supabase.storage
            .from("training_files")
            .upload(filePath, file, { contentType: file.type });

          if (error) throw error;

          const { data: publicData } = supabase.storage
            .from("training_files")
            .getPublicUrl(filePath);

          newUrls.push(publicData.publicUrl);
        }

        setUploadedImages((prev) => [...prev, ...newUrls]);
        setUploadProgress("✅ Fotos listas");
        pushToast("Fotos cargadas correctamente. Ya podés entrenar.", "success");
      } catch (error: any) {
        pushToast("Error al subir fotos. Inténtalo de nuevo.", "error");
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    },
    [user, pushToast]
  );

  // --- Comprar plan (MercadoPago Checkout Pro) ---
  const buyPlanMP = async (plan: Plan) => {
    pushToast(`Procesando compra de ${plan.name}...`, "info");

    try {
      const res = await fetch("/api/mp/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();

      if (!res.ok || !data?.checkoutUrl) {
        console.error("Error mp create-checkout:", data);
        pushToast(
          data?.error || "No se pudo iniciar el pago con MercadoPago.",
          "error"
        );
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      pushToast("Error iniciando el pago con MercadoPago.", "error");
    }
  };

  // --- Iniciar entrenamiento ---
  const startTraining = async () => {
    setTrainingBlockedReason(null);

    if (uploadedImages.length < 1) {
      pushToast("Debes subir al menos 6 fotos para entrenar tu modelo.", "warning");
      return;
    }

    // ✅ chequeo créditos (usa el valor real recién leído)
    const c = await fetchCredits();
    if (c < TRAIN_COST) {
      pushToast(
        "Créditos insuficientes para entrenar tu modelo. Comprá un pack para continuar.",
        "warning"
      );
      openPayModal();
      return;
    }

    setStatus("starting");

    try {
      pushToast("Iniciando entrenamiento de tu modelo...", "info");

      const res = await fetch("/api/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploadedImages }),
      });

      const data = await res.json().catch(() => ({}));

      // 402: créditos insuficientes (server-side)
      if (res.status === 402) {
        pushToast("Créditos insuficientes. Comprá un pack para entrenar.", "warning");
        openPayModal();
        setStatus("idle");
        return;
      }

      // 503: replicate bloqueado / caído
      if (res.status === 503) {
        setTrainingBlockedReason(
          data?.blockedReason ||
            "En estos momentos no podemos entrenar tu modelo. En instantes será resuelto."
        );
        pushToast("⚠️ Entrenamiento no disponible momentáneamente.", "warning");
        setStatus("idle");
        return;
      }

      if (!res.ok) {
        const msg = String(data?.message || data?.error || "No se pudo iniciar el entrenamiento.");
        pushToast(msg, "error");
        setStatus("idle");
        return;
      }

      if (!data?.id) {
        pushToast("Respuesta inválida del entrenamiento. Inténtalo de nuevo.", "error");
        setStatus("idle");
        return;
      }

      setTrainingId(String(data.id));
      setStatus(String(data.status || "starting"));

      // si el server devolvió remainingCredits, actualizamos
      if (typeof data?.remainingCredits === "number") {
        setCredits(Number(data.remainingCredits));
      } else {
        // sino refrescamos
        fetchCredits();
      }
    } catch (error: any) {
      pushToast("Error al iniciar el entrenamiento.", "error");
      console.error(error);
      setStatus("idle");
    }
  };

  // --- Chequear estado ---
  const checkStatus = async () => {
    if (!trainingId) return;
  
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainingId }),
      });
  
      const data = await res.json();
  
      // ✅ NO setear "processing" como fallback (eso es solo UI)
      // Si no viene status, dejamos el que ya teníamos
      if (data?.status) setStatus(String(data.status));
  
      if (data?.status === "completed" && data?.weights) {
        setWeightsUrl(String(data.weights));
  
        if (data.trigger) localStorage.setItem("trigger_word", String(data.trigger));
  
        setMode("dashboard");
        pushToast("Tu modelo Flux está listo. ¡Ya puedes generar fotos! ✨", "success");
      }
    } catch (error) {
      console.error("Error checkStatus:", error);
      pushToast("No se pudo actualizar el estado del entrenamiento.", "error");
    }
  };

  // --- Generar foto ---
  const generatePhotos = async () => {
    // ✅ bloquea si no hay créditos
    const c = await fetchCredits();
    if (c <= 0) {
      pushToast("No tenés créditos. Comprá un pack para seguir generando.", "warning");
      openPayModal();
      return;
    }

    setIsGeneratingBatch(true);

    const effectiveGender: "man" | "woman" =
      gender === "non_binary" ? "woman" : gender;

    const prompts = getPromptsForPack(effectiveGender, 1, selectedStyle);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[0],
          weightsUrl,
          trainingId,
          selections: {
            gender,
            ageRange,
            hairColor,
            hairLength,
            hairStyle,
            ethnicity,
            bodyType,
            attires,
            backgrounds,
            styleCategory: selectedStyle,
          },
        }),
      });

      const data = await res.json();

      if (data.imageUrl) {
        setGeneratedImages((prev) => [data.imageUrl, ...prev]);
        if (typeof data.remainingCredits === "number") {
          setCredits(Number(data.remainingCredits));
        } else {
          fetchCredits();
        }
        pushToast("Foto generada correctamente ✅", "success");
      } else if (data.error) {
        pushToast(String(data.error), "error");
      }
    } catch (e) {
      console.error(e);
      pushToast("Error al generar la foto. Inténtalo nuevamente.", "error");
    }

    setIsGeneratingBatch(false);
  };

  // --- Terminar wizard inicial ---
  const handleFinishSetup = async () => {
    try {
      if (user) {
        await fetch("/api/save-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            gender,
            ageRange,
            hairColor,
            hairLength,
            hairStyle,
            ethnicity,
            bodyType,
          }),
        });
      }
    } catch (e) {
      console.error("Error guardando preferencias:", e);
    }

    setHasCompletedPreferences(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hasCompletedPreferences", "1");
    }
    setMode("upload");
  };

  if (!isLoaded) return <div className="min-h-screen bg-white" aria-hidden />;

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <HeaderBar credits={credits} />

      <main className="pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <SignedOut>
            <div className="mt-10 text-center text-sm text-gray-500">
              Necesitás iniciar sesión para ver el dashboard.
            </div>
          </SignedOut>

          <SignedIn>
            {mode === "upload" ? (
              <UploadView
                onBack={() => setMode("dashboard")}
                uploadedImages={uploadedImages}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onFileChange={handleFileUpload}
                onStartTraining={startTraining}
                trainingId={trainingId}
                status={status}
                onCheckStatus={checkStatus}
                credits={credits}
                trainCost={TRAIN_COST}
                onNeedCredits={() => {
                  openPayModal();
                  pushToast(
                    "Créditos insuficientes. Elegí un método de pago para continuar.",
                    "warning"
                  );
                }}
                trainingBlockedReason={trainingBlockedReason}
              />
            ) : (
              <DashboardView
                weightsUrl={weightsUrl}
                credits={credits}
                gender={gender}
                setGender={setGender}
                ageRange={ageRange}
                setAgeRange={setAgeRange}
                hairColor={hairColor}
                setHairColor={setHairColor}
                hairLength={hairLength}
                setHairLength={setHairLength}
                hairStyle={hairStyle}
                setHairStyle={setHairStyle}
                ethnicity={ethnicity}
                setEthnicity={setEthnicity}
                bodyType={bodyType}
                setBodyType={setBodyType}
                attires={attires}
                setAttires={setAttires}
                backgrounds={backgrounds}
                setBackgrounds={setBackgrounds}
                selectedStyle={selectedStyle}
                setSelectedStyle={setSelectedStyle}
                generatedImages={generatedImages}
                isGeneratingBatch={isGeneratingBatch}
                onGenerate={generatePhotos}
                onBack={() => setMode("upload")}
                showFullSetup={!hasCompletedPreferences && !weightsUrl}
                planId={currentPlan}
                onFinishSetup={handleFinishSetup}
                notify={pushToast}
                onBuyCredits={() => openPayModal()}
              />
            )}
          </SignedIn>
        </div>
      </main>

        {/* ✅ Modal métodos de pago (usa PayModal que me pasaste: onSelectMethod) */}
        <PayModal
            isOpen={showPayModal}
            onClose={() => setShowPayModal(false)}
            onSelect={({ plan, method }) => {
                if (method === "mercadopago") {
                setShowPayModal(false);
                buyPlanMP(plan);
                return;
                }
                if (method === "payu") {
                pushToast("PayU: lo conectamos en el próximo paso.", "info");
                return;
                }
                pushToast("USDT: lo conectamos en el próximo paso.", "info");
            }}
        />

      <ToastStack toasts={toasts} onClose={closeToast} />
    </div>
  );
}
