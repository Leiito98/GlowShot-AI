"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";

import { supabase } from "@/app/lib/supabase";
import { getPromptsForPack } from "@/lib/prompts";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { HomeView } from "@/app/components/views/HomeView";
import { UploadView } from "@/app/components/views/UploadView";
import { StudioView } from "@/app/components/views/StudioView";
import { GalleryView } from "@/app/components/views/GalleryView";
import { PayModal } from "@/app/components/modals/PayModal";

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

type View = "home" | "upload" | "studio" | "gallery";

// ---------- TOASTS GLOBALES ----------

type ToastType = "warning" | "info" | "success" | "error";

type ToastMessage = {
  id: number;
  type: ToastType;
  message: string;
};

function getToastStyles(type: ToastType) {
  switch (type) {
    case "success":
      return {
        container: "bg-emerald-50 border-emerald-300",
        iconBg: "bg-emerald-100",
        icon: "✔",
        text: "text-emerald-900",
      };
    case "info":
      return {
        container: "bg-blue-50 border-blue-300",
        iconBg: "bg-blue-100",
        icon: "ℹ",
        text: "text-blue-900",
      };
    case "error":
      return {
        container: "bg-red-50 border-red-300",
        iconBg: "bg-red-100",
        icon: "✖",
        text: "text-red-900",
      };
    case "warning":
    default:
      return {
        container: "bg-orange-50 border-orange-300",
        iconBg: "bg-orange-100",
        icon: "⚠",
        text: "text-orange-900",
      };
  }
}

export default function Home() {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  // Vistas
  const [view, setView] = useState<View>("home");

  // Plan / preferencias
  const [currentPlan, setCurrentPlan] = useState<PlanId | null>(null);
  const [hasCompletedPreferences, setHasCompletedPreferences] =
    useState(false);

  // Estados Lógicos
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [weightsUrl, setWeightsUrl] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [credits, setCredits] = useState<number>(0);

  // Studio prefs
  const [gender, setGender] = useState<UXGender>("woman");
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional");
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);

  const [ageRange, setAgeRange] = useState<AgeRange>("25_29");
  const [hairColor, setHairColor] = useState<HairColor>("black");
  const [hairLength, setHairLength] = useState<HairLength>("short");
  const [hairStyle, setHairStyle] = useState<HairStyle>("straight");
  const [ethnicity, setEthnicity] = useState<Ethnicity>("hispanic");
  const [bodyType, setBodyType] = useState<BodyType>("athletic");
  const [attires, setAttires] = useState<Attire[]>([]);
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);

  // ---------- TOAST STATE GLOBAL ----------
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    const toast: ToastMessage = { id, type, message };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const closeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Cargar galería ---
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

    // leer plan + prefs desde localStorage
    if (typeof window !== "undefined") {
      const savedPlan = window.localStorage.getItem("plan_id") as
        | PlanId
        | null;
      if (savedPlan) setCurrentPlan(savedPlan);

      const savedPrefs = window.localStorage.getItem(
        "hasCompletedPreferences"
      );
      if (savedPrefs === "1") {
        setHasCompletedPreferences(true);
      }
    }

    async function init() {
      if (!user) return;

      await fetchCredits();
      loadGallery();

      // Revisar si tiene un modelo entrenado anteriormente
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
          // si ya viene con modelo, asumimos que ya configuró antes
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
          pushToast("Fotos cargadas correctamente. Ya podés entrenar.", "success");
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
      pushToast("Debes subir al menos 5 fotos para entrenar tu modelo.", "warning");
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

        setView("studio");
        pushToast("Tu modelo Flux está listo. ¡Ya puedes generar fotos! ✨", "success");
      }
    } catch (error) {
      console.error("Error checkStatus:", error);
      pushToast("No se pudo actualizar el estado del entrenamiento.", "error");
    }
  };

  // --- Comprar plan ---
  const buyPlan = async (plan: Plan) => {
    pushToast(
      `Procesando compra de ${plan.name} por $${plan.price} USD...`,
      "info"
    );

    try {
      const res = await fetch("/api/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packSize: plan.photos,
          planId: plan.id,   // 👈 IMPORTANTE
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCredits(data.newCredits);
        setShowPayModal(false);

        setCurrentPlan(plan.id);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("plan_id", plan.id);
        }

        pushToast(
          `¡${plan.name} activado! Se acreditaron ${plan.photos} créditos a tu cuenta.`,
          "success"
        );

        if (data.success) {
          setCredits(data.newCredits);
          setShowPayModal(false);
  
          setCurrentPlan(plan.id);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("plan_id", plan.id);
          }
  
          // 👇 nuevo flujo
          if (!hasCompletedPreferences) {
            // primero configuramos rasgos
            setView("studio");
          } else if (weightsUrl) {
            // ya tiene modelo
            setView("studio");
          } else if (uploadedImages.length > 0) {
            // ya subió fotos antes, arrancamos entrenamiento
            startTraining();
          } else {
            // caso clásico: todavía no subió fotos
            setView("upload");
          }
        }
      } else {
        pushToast(
          data.error || "No se pudo procesar el pago. Inténtalo de nuevo.",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      pushToast(
        "Ocurrió un error de red al procesar el pago. Inténtalo más tarde.",
        "error"
      );
    }
  };


  // --- Generar foto ---
  const generatePhotos = async () => {
    if (credits <= 0) {
      setShowPayModal(true);
      // el toast de "sin créditos" lo dispara StudioView antes de llamar a esto
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
        loadGallery();
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
      // si hay usuario logueado, guardamos sus rasgos
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
      // si falla igual dejamos seguir, pero ya lo ves en consola
    }

    setHasCompletedPreferences(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hasCompletedPreferences", "1");
    }
    setView("upload");
  };


  // --- Click CTA principal ---
  const handleCreateClick = () => {
    if (credits > 0) {
      if (!hasCompletedPreferences) {
        setView("studio");
      } else if (weightsUrl) {
        setView("studio");
      } else {
        setView("upload");
      }
    } else {
      setShowPayModal(true);
      pushToast(
        "Necesitas créditos para empezar. Elige un paquete para continuar.",
        "info"
      );
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen bg-white" aria-hidden />;
  }

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <HeaderBar view={view} setView={setView} credits={credits} />

      <main className="pb-20">
        <SignedOut>
          {/* Landing para usuarios no logueados */}
          <HomeView onCreateClick={() => {}} />
        </SignedOut>

        <SignedIn>
          {view === "home" && <HomeView onCreateClick={handleCreateClick} />}

          {view === "upload" && (
            <UploadView
              onBack={() => setView("home")}
              uploadedImages={uploadedImages}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onFileChange={handleFileUpload}
              onStartTraining={startTraining}
              trainingId={trainingId}
              status={status}
              onCheckStatus={checkStatus}
            />
          )}

          {view === "studio" && (
            <StudioView
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
              onBack={() => setView("home")}
              showFullSetup={!hasCompletedPreferences && !weightsUrl}
              planId={currentPlan}
              onFinishSetup={handleFinishSetup}
              notify={pushToast}
            />
          )}

          {view === "gallery" && (
            <GalleryView
              images={galleryImages}
              onBackToHome={() => setView("home")}
            />
          )}
        </SignedIn>
      </main>

      <PayModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        onSelectPlan={buyPlan}
      />

      {/* TOAST STACK GLOBAL */}
      {toasts.length > 0 && (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => {
            const styles = getToastStyles(t.type);
            return (
              <div
                key={t.id}
                className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg ${styles.container}`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm ${styles.iconBg} ${styles.text}`}
                >
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${styles.text}`}>
                    {t.message}
                  </p>
                </div>
                <button
                  onClick={() => closeToast(t.id)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
