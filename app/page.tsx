"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";

import { supabase } from "@/app/lib/supabase";
import { getPromptsForPack } from "@/lib/prompts";
import PaddleBootstrap from "@/app/components/payments/PaddleBootstrap";

import { HeaderBar } from "@/app/components/layout/HeaderBar";
import { HomeView } from "@/app/components/views/HomeView";
import { UploadView } from "@/app/components/views/UploadView";
import { StudioView } from "@/app/components/views/StudioView";
import { GalleryView } from "@/app/components/views/GalleryView";
import { PayModal } from "@/app/components/modals/PayModal";

import { Plan, PlanId, PLANS } from "@/app/config/plans";
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
  const [selectedPlan, setSelectedPlan] = useState< "basic" | "standard" | "executive" | null>(null);


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

    // scroll suave para anchors (#pricing, #help)
    if (typeof window !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth";
    }

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

        setView("studio");
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

  // --- Comprar plan ---
  // --- Comprar plan (ahora SOLO inicia el checkout de Paddle) ---
  // --- Comprar plan ---
  const buyPlan = async (plan: Plan) => {
    pushToast(
      `Procesando compra de ${plan.name}...`,
      "info"
    );

    try {
      const res = await fetch("/api/paddle/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id, // "basic" | "standard" | "executive"
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.transactionId) {
        console.error("Error create-checkout:", data);
        pushToast(
          data?.error || "No se pudo iniciar el pago con Paddle.",
          "error"
        );
        return;
      }

      // 👇 Abrimos el overlay de Paddle en esta misma página
      // @ts-ignore
      if (window.Paddle) {
        // @ts-ignore
        window.Paddle.Checkout.open({
          transactionId: data.transactionId,
          // opcional: puedes sobreescribir settings acá también
          settings: {
            displayMode: "overlay",
            theme: "light",
            locale: "es",
          },
        });
      } else {
        console.error("Paddle JS no está disponible en window.");
        pushToast(
          "No se pudo cargar el checkout de Paddle. Recarga la página e inténtalo de nuevo.",
          "error"
        );
      }
    } catch (err) {
      console.error(err);
      pushToast("Error iniciando el pago con Paddle.", "error");
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
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 via-white to-orange-50 text-gray-900 selection:bg-orange-100 selection:text-orange-900">
      <PaddleBootstrap />
      <HeaderBar view={view} setView={setView} credits={credits} />

      <main className="pb-20">
        {/* contenedor central para que no se vea tan "vacío" */}
        <div className="max-w-6xl mx-auto px-4">
          <SignedOut>
            {/* Landing para usuarios no logueados */}
            <section className="mt-10 mb-12">
              <div className="rounded-3xl bg-white/80 shadow-[0_18px_60px_rgba(0,0,0,0.08)] p-6 md:p-10 border border-orange-50">
                <p className="text-xs font-semibold text-orange-500 mb-2 uppercase">
                  Nuevo · GlowShot AI
                </p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  Fotos profesionales de estudio{" "}
                  <span className="text-orange-500">en minutos</span>, no en
                  días.
                </h1>
                <p className="text-sm md:text-base text-gray-600 max-w-2xl mb-5">
                  Entrená tu propio modelo con tus fotos y obtené retratos
                  listos para LinkedIn, CV, Instagram o apps de citas sin salir
                  de casa.
                </p>
                <HomeView onCreateClick={() => {}} />
              </div>
            </section>
          </SignedOut>

          <SignedIn>
            {view === "home" && (
              <section className="mt-10 mb-8">
                <HomeView onCreateClick={handleCreateClick} />
              </section>
            )}

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
        </div>
      </main>

      {/* =====================  SECCIÓN DE PRECIOS  ===================== */}
      <section id="pricing" className="max-w-6xl mx-auto mt-4 mb-20 px-4">

        {/* RECUADRO NEGRO CONTENEDOR */}
        <div className="rounded-3xl bg-neutral-800/85 text-white px-6 sm:px-10 py-10 sm:py-12 shadow-[0_40px_140px_rgba(0,0,0,0.4)]">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Planes y precios</h2>
            <p className="text-gray-300 mt-2">
              Elegí el paquete ideal para tus retratos profesionales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ================= BASICO ================= */}
            <div
              className="
                group relative overflow-hidden cursor-pointer
                rounded-2xl p-6
                bg-white text-gray-900 border
                shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                transition duration-300
                hover:-translate-y-1 hover:scale-[1.02]
                hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
                hover:bg-gray-100
              "
            >
              {/* BRILLO */}
              <div className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              " />

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Básico</h3>
                <p className="text-sm text-gray-500 mb-3">Ideal para empezar</p>

                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold">$12</span>
                  <span className="text-gray-400 line-through">$35</span>
                </div>

                <ul className="text-sm text-gray-700 space-y-2 mb-4">
                  <li>📸 40 fotos</li>
                  <li>⚡ 45 min de generación</li>
                  <li>👕 1 atuendo</li>
                  <li>🏙 1 fondo</li>
                  <li>🖼 Resolución estándar</li>
                </ul>

                <button
                  onClick={() => buyPlan(PLANS[0])}
                  className="w-full bg-orange-500 text-black rounded-full py-2 font-semibold hover:bg-orange-400 transition"
                >
                  Seleccionar
                </button>
              </div>
            </div>

            {/* ================= ESTÁNDAR ================= */}
            <div
              className="
                group relative overflow-hidden cursor-pointer
                rounded-2xl p-6 pt-10
                bg-white text-gray-900
                border-2 border-orange-400
                shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                transition duration-300
                hover:-translate-y-1 hover:scale-[1.02]
                hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
                hover:bg-gray-100
              "
            >

              {/* BRILLO */}
              <div className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              " />

              {/* BADGE */}
              <div className="absolute top-4 right-4 bg-orange-500 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                Más elegido
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Estándar</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Mejor relación calidad / precio
                </p>

                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold">$15</span>
                  <span className="text-gray-400 line-through">$45</span>
                </div>

                <ul className="text-sm text-gray-700 space-y-2 mb-4">
                  <li>📸 60 fotos</li>
                  <li>⚡ 30 min de generación</li>
                  <li>👕 2 atuendos</li>
                  <li>🏙 2 fondos</li>
                  <li>🖼 Resolución mejorada</li>
                </ul>

                <button
                  onClick={() => buyPlan(PLANS[1])}
                  className="w-full bg-orange-500 text-black rounded-full py-2 font-semibold hover:bg-orange-400 transition"
                >
                  Seleccionar
                </button>
              </div>
            </div>

            {/* ================= EJECUTIVO ================= */}
            <div
              className="
                group relative overflow-hidden cursor-pointer
                rounded-2xl p-6
                bg-white text-gray-900
                border
                shadow-[0_18px_60px_rgba(0,0,0,0.35)]
                transition duration-300
                hover:-translate-y-1 hover:scale-[1.02]
                hover:shadow-[0_26px_90px_rgba(0,0,0,0.55)]
                hover:bg-gray-100
              "
            >

              {/* BRILLO */}
              <div className="
                pointer-events-none
                absolute inset-0
                bg-gradient-to-r from-transparent via-white/40 to-transparent
                opacity-0 -translate-x-full
                transition duration-700
                group-hover:opacity-100 group-hover:translate-x-full
              " />

              <div className="absolute top-4 right-4 bg-orange-500 text-black text-[11px] font-semibold px-3 py-1 rounded-full shadow-md">
                Mejor valor
              </div>

              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-1">Ejecutivo</h3>
                <p className="text-sm text-gray-500 mb-3">Máxima calidad</p>

                <div className="flex items-end gap-2 mb-3">
                  <span className="text-3xl font-bold">$25</span>
                  <span className="text-gray-400 line-through">$75</span>
                </div>

                <ul className="text-sm text-gray-700 space-y-2 mb-4">
                  <li>📸 100 fotos</li>
                  <li>⚡ 15 min de generación</li>
                  <li>👕 Todos los atuendos</li>
                  <li>🏙 Todos los fondos</li>
                  <li>🖼 Resolución superior</li>
                </ul>

                <button
                  onClick={() => buyPlan(PLANS[2])}
                  className="w-full bg-orange-500 text-black rounded-full py-2 font-semibold hover:bg-orange-400 transition"
                >
                  Seleccionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* =====================  SECCIÓN AYUDA  ===================== */}
      <section
        id="help"
        className="max-w-4xl mx-auto mb-24 px-4 text-center"
      >
        <div className="rounded-3xl bg-white/90 border border-gray-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] px-6 py-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            ¿Necesitás ayuda con GlowShot?
          </h2>

          <p className="text-gray-600 mb-5 max-w-2xl mx-auto text-sm md:text-base">
            Si tenés dudas sobre cómo subir tus fotos, entrenar el modelo o
            elegir el plan correcto, escribinos y te respondemos lo antes
            posible.
          </p>

          <button
            className="bg-gray-900 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-black transition"
            onClick={() =>
              alert("Más adelante acá conectamos un formulario o un chat 😉")
            }
          >
            Contactar soporte
          </button>
        </div>
      </section>

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
