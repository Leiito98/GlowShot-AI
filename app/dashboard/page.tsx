// app/dashboard/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

import { useState, useEffect, useCallback } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

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
// Solo para el Header (coincide con el type View del HeaderBar)
type HeaderView = "home" | "upload" | "dashboard" | "mypictures";

// ✅ Debe coincidir con tu PayModal nuevo (onSelectMethod)
type PayMethod = "mercadopago" | "payu" | "usdt";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // Vista interna del dashboard
  const [mode, setMode] = useState<DashboardMode>("dashboard");

  // Vista para el Header (para poder usar el mismo HeaderBar en todas las rutas)
  const [headerView, setHeaderView] = useState<HeaderView>("dashboard");

  const handleHeaderSetView = (v: HeaderView) => {
    setHeaderView(v);
    if (v === "home") router.push("/");
    if (v === "dashboard") router.push("/dashboard");
    if (v === "mypictures") router.push("/my-photos");
    // "upload" no es ruta directa; se maneja dentro de este componente
  };

  // Plan / preferencias
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);
  const [hasCompletedPreferences, setHasCompletedPreferences] =
    useState(false);

  // Entrenamiento
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [weightsUrl, setWeightsUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);

  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "standard" | "executive" | null
  >(null);

  // Preferencias de estudio
  const [gender, setGender] = useState<UXGender>("woman");
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  // Esta galería no se usa acá, pero la dejamos por si luego la necesitás
  const [galleryImages, setGalleryImages] = useState<any[]>([]);

  // ✅ modal métodos
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

  const pushToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const searchParams = useSearchParams();

  useEffect(() => {
    const paid = searchParams.get("paid");
    if (paid === "1") {
      pushToast("✅ Compra exitosa. En breve se acreditan tus créditos.", "success");
      // refrescamos créditos por si el webhook ya acreditó
      fetchCredits();
      // opcional: limpiar query
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  

  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Cargar galería (por si luego la usás acá) ---
  const loadGallery = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/my-images");
      const data = await res.json();
      if (data.images) setGalleryImages(data.images);
    } catch (error) {
      console.error("Error cargando galería:", error);
    }
  };

  // --- Leer créditos ---
  const fetchCredits = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/get-credits");
      if (!res.ok) throw new Error("API falló al leer créditos");
      const data = await res.json();
      setCredits(data.credits);
    } catch {
      setCredits(0);
    }
  };

  // Carga inicial y polling
  useEffect(() => {
    setIsLoaded(true);
    let intervalId: NodeJS.Timeout;

    // Cargar plan y preferencias desde localStorage
    if (typeof window !== "undefined") {
      const savedPlan = window.localStorage.getItem("plan_id") as PlanId | null;
      if (savedPlan) setCurrentPlan(savedPlan);

      const savedPrefs = window.localStorage.getItem("hasCompletedPreferences");
      if (savedPrefs === "1") {
        setHasCompletedPreferences(true);
      }
    }

    async function init() {
      if (!user) return;

      await fetchCredits();
      loadGallery();

      // Revisar si ya tiene un modelo entrenado
      try {
        const { data: model } = await supabase
          .from("predictions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

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
  }, [user]);

  // --- Subida de fotos ---
  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
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
          pushToast(
            "Fotos cargadas correctamente. Ya podés entrenar.",
            "success"
          );
        } catch (error: any) {
          pushToast("Error al subir fotos. Inténtalo de nuevo.", "error");
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      },
      [user]
    );

  // --- Iniciar entrenamiento ---
  const startTraining = async () => {
    if (uploadedImages.length < 5) {
      pushToast(
        "Debes subir al menos 5 fotos para entrenar tu modelo.",
        "warning"
      );
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

      const data = await res.json();
      setTrainingId(data.id);
      setStatus(data.status);
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
      setStatus(data.status);

      if (data.status === "completed" && data.weights) {
        setWeightsUrl(data.weights);

        if (data.trigger) {
          localStorage.setItem("trigger_word", data.trigger);
        }

        setMode("dashboard");
        pushToast(
          "Tu modelo Flux está listo. ¡Ya puedes generar fotos! ✨",
          "success"
        );
      }
    } catch (error) {
      console.error("Error checkStatus:", error);
      pushToast(
        "No se pudo actualizar el estado del entrenamiento.",
        "error"
      );
    }
  };

  // --- Comprar plan (MercadoPago Checkout Pro) ---
  const buyPlanMP = async (plan: Plan) => {
    setSelectedPlan(plan.id as "basic" | "standard" | "executive");
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

      // Redirect a MercadoPago
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error(err);
      pushToast("Error iniciando el pago con MercadoPago.", "error");
    }
  };

  // ✅ Abrir modal métodos (desde “Comprar créditos”)
  const openPaymentMethods = (plan?: Plan) => {
    if (plan) setPendingPlan(plan);
    setShowPayModal(true);
  };

  // --- Generar foto ---
  const generatePhotos = async () => {
    if (credits <= 0) {
      // no hay créditos -> abrir modal métodos (sin plan preseleccionado)
      setPendingPlan(null);
      setShowPayModal(true);
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
        setCredits(data.remainingCredits);
        pushToast("Foto generada correctamente ✅", "success");
      } else if (data.error) {
        pushToast(data.error, "error");
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

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" aria-hidden />;
  }

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
                // ✅ ahora solo abre el modal de métodos
                onBuyCredits={() => openPaymentMethods()}
              />
            )}
          </SignedIn>
        </div>
      </main>

      {/* ✅ Modal métodos de pago */}
      <PayModal
        isOpen={showPayModal}
        onClose={() => {
          setShowPayModal(false);
          setPendingPlan(null);
        }}
        onSelectMethod={(method: PayMethod) => {
          // Si no había plan preseleccionado (ej: entró por "Comprar créditos"),
          // podés llevarlo a la sección pricing del dashboard o mostrar otro modal de planes.
          if (!pendingPlan) {
            if (method === "mercadopago") {
              pushToast("Elegí un plan para continuar con MercadoPago.", "info");
            } else if (method === "payu") {
              pushToast("Elegí un plan para continuar con PayU.", "info");
            } else {
              pushToast("Elegí un plan para continuar con USDT.", "info");
            }
            setShowPayModal(false);
            return;
          }

          if (method === "mercadopago") {
            setShowPayModal(false);
            buyPlanMP(pendingPlan);
            return;
          }

          if (method === "payu") {
            pushToast("PayU: lo conectamos en el próximo paso.", "info");
            // luego: buyPlanPayU(pendingPlan)
            return;
          }

          if (method === "usdt") {
            pushToast("USDT: lo conectamos en el próximo paso.", "info");
            // luego: flujo USDT
            return;
          }
        }}
      />

      <ToastStack toasts={toasts} onClose={closeToast} />
    </div>
  );
}
