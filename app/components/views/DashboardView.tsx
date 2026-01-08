"use client";

import { useState } from "react";

import {
  STYLE_CATEGORIES,
  ATTIRE_OPTIONS,
  BACKGROUND_OPTIONS,
  AGE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_LENGTH_OPTIONS,
  HAIR_STYLE_OPTIONS,
  ETHNICITY_OPTIONS,
  BODY_TYPE_OPTIONS,
} from "@/app/config/studio";

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

import { PlanId } from "@/app/config/plans";

export type ToastType = "warning" | "info" | "success" | "error";

type DashboardViewProps = {
  weightsUrl: string | null;
  credits: number;

  gender: UXGender;
  setGender: (g: UXGender) => void;
  ageRange: AgeRange;
  setAgeRange: (v: AgeRange) => void;
  hairColor: HairColor;
  setHairColor: (v: HairColor) => void;
  hairLength: HairLength;
  setHairLength: (v: HairLength) => void;
  hairStyle: HairStyle;
  setHairStyle: (v: HairStyle) => void;
  ethnicity: Ethnicity;
  setEthnicity: (v: Ethnicity) => void;
  bodyType: BodyType;
  setBodyType: (v: BodyType) => void;

  attires: Attire[];
  setAttires: (v: Attire[]) => void;
  backgrounds: Background[];
  setBackgrounds: (v: Background[]) => void;

  selectedStyle: string;
  setSelectedStyle: (s: string) => void;

  generatedImages: string[];
  isGeneratingBatch: boolean;
  onGenerate: () => void;
  onBack: () => void;

  showFullSetup: boolean;
  planId: PlanId | null;
  onFinishSetup: () => void;

  notify: (message: string, type?: ToastType) => void;
  onBuyCredits: () => void;
};

// ---------- HELPERS PLAN ----------

function getMaxSlots(planId: PlanId | null, total: number) {
  if (planId === "basic") return Math.min(1, total);
  if (planId === "standard") return Math.min(2, total);
  if (planId === "executive") return total;
  return total;
}

function getPlanLabel(planId: PlanId | null) {
  if (planId === "basic") return "Básico";
  if (planId === "standard") return "Estándar";
  if (planId === "executive") return "Ejecutivo";
  return "actual";
}

function buildLimitMessage(
  kind: "attires" | "backgrounds",
  max: number,
  planId: PlanId | null
) {
  const label = getPlanLabel(planId);
  const word = kind === "attires" ? "atuendo(s)" : "fondo(s)";

  if (planId === "basic") {
    return `Tu plan ${label} permite solo ${max} ${word}. Actualizá al plan Estándar o Ejecutivo para desbloquear más opciones.`;
  }

  if (planId === "standard") {
    return `Tu plan ${label} permite hasta ${max} ${word}. Actualizá al plan Ejecutivo para desbloquear todos.`;
  }

  return `Con tu plan solo podés elegir hasta ${max} ${word}.`;
}

export function DashboardView({
  weightsUrl,
  credits,
  gender,
  setGender,
  ageRange,
  setAgeRange,
  hairColor,
  setHairColor,
  hairLength,
  setHairLength,
  hairStyle,
  setHairStyle,
  ethnicity,
  setEthnicity,
  bodyType,
  setBodyType,
  attires,
  setAttires,
  backgrounds,
  setBackgrounds,
  selectedStyle,
  setSelectedStyle,
  generatedImages,
  isGeneratingBatch,
  onGenerate,
  onBack,
  showFullSetup,
  planId,
  onFinishSetup,
  notify,
  onBuyCredits,
}: DashboardViewProps) {
  // -------------------- WIZARD PREVIO --------------------
  const [setupStep, setSetupStep] = useState(0);

  const wizardSteps = [
    // 0 - Sexo
    (
      <section key="gender" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es tu sexo?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 max-w-md mx-auto">
          Esto nos ayuda a generar fotos que se parezcan realmente a vos.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <button
            onClick={() => setGender("man")}
            className={`cursor-pointer py-4 px-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border ${
              gender === "man"
                ? "bg-orange-100 text-orange-700 border-orange-400"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>♂</span> <span>Hombre</span>
          </button>
          <button
            onClick={() => setGender("woman")}
            className={`cursor-pointer py-4 px-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border ${
              gender === "woman"
                ? "bg-orange-100 text-orange-700 border-orange-400"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>♀</span> <span>Mujer</span>
          </button>
          <button
            onClick={() => setGender("non_binary")}
            className={`cursor-pointer py-4 px-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 border ${
              gender === "non_binary"
                ? "bg-orange-100 text-orange-700 border-orange-400"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span>⚧</span> <span>No binario</span>
          </button>
        </div>
      </section>
    ),

    // 1 - Edad
    (
      <section key="age" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuántos años tenés?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 max-w-md mx-auto">
          Usamos esto para ajustar rasgos de forma sutil.
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          {AGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setAgeRange(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border ${
                ageRange === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),

    // 2 - Color de pelo
    (
      <section key="hairColor" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es tu color de pelo?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 max-w-md mx-auto">
          Si tu color exacto no está, elegí el más parecido.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {HAIR_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setHairColor(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-2xl text-sm font-medium border text-left ${
                hairColor === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),

    // 3 - Longitud de pelo
    (
      <section key="hairLength" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es la longitud de tu pelo?
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {HAIR_LENGTH_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setHairLength(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border ${
                hairLength === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),

    // 4 - Tipo de cabello
    (
      <section key="hairStyle" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es tu tipo de cabello?
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {HAIR_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setHairStyle(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border ${
                hairStyle === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),

    // 5 - Etnia
    (
      <section key="ethnicity" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es tu etnia?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {ETHNICITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setEthnicity(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-2xl text-sm font-medium border text-left ${
                ethnicity === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),

    // 6 - Tipo de cuerpo
    (
      <section key="bodyType" className="space-y-6">
        <h2 className="text-3xl font-bold text-center mb-2">
          ¿Cuál es tu tipo de cuerpo?
        </h2>
        <div className="flex flex-wrap gap-2 justify-center">
          {BODY_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setBodyType(opt.id)}
              className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium border ${
                bodyType === opt.id
                  ? "bg-orange-100 text-orange-800 border-orange-400"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    ),
  ];

  const wizardStepsCount = wizardSteps.length;
  const isLastStep = setupStep === wizardStepsCount - 1;
  const progressPct = ((setupStep + 1) / wizardStepsCount) * 100;

  const goNext = () => {
    if (isLastStep) {
      onFinishSetup();
    } else {
      setSetupStep((s) => Math.min(s + 1, wizardStepsCount - 1));
    }
  };

  const goPrev = () => {
    setSetupStep((s) => Math.max(s - 1, 0));
  };

  // Si ES primera vez y NO hay modelo => solo wizard
  if (showFullSetup && !weightsUrl) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Configurá tu perfil ✨</h2>
        </div>

        <div className="bg-white rounded-3xl shadow p-8 md:p-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goPrev}
              disabled={setupStep === 0}
              className={`text-sm ${
                setupStep === 0
                  ? "text-gray-300 cursor-default"
                  : "text-gray-500 hover:text-gray-800 cursor-pointer"
              }`}
            >
              ← Volver
            </button>
            <span className="text-xs text-gray-400">
              Paso {setupStep + 1} de {wizardStepsCount}
            </span>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
            <div
              className="h-full bg-[#ff5a1f] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {wizardSteps[setupStep]}

          <div className="flex justify-end mt-8">
            <button
              onClick={goNext}
              className="bg-[#ff5a1f] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#e04f1b] transition cursor-pointer"
            >
              {isLastStep ? "Continuar a subir fotos" : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------- ESTUDIO NORMAL --------------------
  const totalAttires = ATTIRE_OPTIONS.length;
  const totalBackgrounds = BACKGROUND_OPTIONS.length;

  const maxAttires = getMaxSlots(planId, totalAttires);
  const maxBackgrounds = getMaxSlots(planId, totalBackgrounds);

  const toggleAttire = (id: Attire) => {
    if (attires.includes(id)) {
      setAttires(attires.filter((a) => a !== id));
      return;
    }

    if (maxAttires === 1) {
      setAttires([id]);
      return;
    }

    if (attires.length >= maxAttires) {
      const msg = buildLimitMessage("attires", maxAttires, planId);
      notify(msg, "warning");
      return;
    }

    setAttires([...attires, id]);
  };

  const toggleBackground = (id: Background) => {
    if (backgrounds.includes(id)) {
      setBackgrounds(backgrounds.filter((b) => b !== id));
      return;
    }

    if (maxBackgrounds === 1) {
      setBackgrounds([id]);
      return;
    }

    if (backgrounds.length >= maxBackgrounds) {
      const msg = buildLimitMessage("backgrounds", maxBackgrounds, planId);
      notify(msg, "warning");
      return;
    }

    setBackgrounds([...backgrounds, id]);
  };

  const visibleAttireOptions = ATTIRE_OPTIONS;
  const visibleBackgroundOptions = BACKGROUND_OPTIONS;

  const handleGenerateClick = () => {
    if (credits <= 0) {
      notify(
        "No tenés créditos suficientes. Comprá un pack para seguir generando retratos.",
        "warning"
      );
      onBuyCredits();
      return;
    }

    if (attires.length === 0) {
      notify("Seleccioná al menos un atuendo para generar tus fotos.", "info");
      return;
    }

    if (backgrounds.length === 0) {
      notify("Seleccioná al menos un fondo para generar tus fotos.", "info");
      return;
    }
    onGenerate();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dashboard</h2>
      </div>

      {!weightsUrl ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <h3 className="text-xl font-bold mb-4">
            Aún no tenés un modelo entrenado
          </h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Subí tus selfies para entrenar tu modelo y empezar a generar
            retratos profesionales.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
          >
            Subir mis fotos
            <span>→</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow p-8 md:p-12">
          <h3 className="text-gray-500 font-medium mb-8 text-center">
            Elegí estilos, atuendos y fondos para tus nuevas fotos
            profesionales.
          </h3>

          {/* Estilo general */}
          <div className="flex justify-center flex-wrap gap-3 mb-10 max-w-xl mx-auto">
            {STYLE_CATEGORIES.map((cat) => (
              <button
                role="button"
                key={cat.key}
                onClick={() => setSelectedStyle(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer ${
                  selectedStyle === cat.key
                    ? "bg-[#ff5a1f] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-8 max-w-2xl mx-auto">
            {/* Atuendos */}
            <section>
              <h4 className="font-semibold mb-1">Seleccioná tus atuendos</h4>
              <p className="text-xs text-gray-400 mb-3">
                Con tu plan podés elegir hasta {maxAttires} atuendo(s).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {visibleAttireOptions.map((opt) => {
                  const isSelected = attires.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleAttire(opt.id)}
                      className={`p-4 rounded-2xl border text-left text-sm cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-semibold mb-1">{opt.label}</div>
                      <div className="text-xs text-gray-500">
                        {opt.helper}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Fondos */}
            <section>
              <h4 className="font-semibold mb-1">Seleccioná tus fondos</h4>
              <p className="text-xs text-gray-400 mb-3">
                Con tu plan podés elegir hasta {maxBackgrounds} fondo(s).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {visibleBackgroundOptions.map((opt) => {
                  const isSelected = backgrounds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleBackground(opt.id)}
                      className={`p-4 rounded-2xl border text-left text-sm cursor-pointer active:scale-[0.98] ${
                        isSelected
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-semibold mb-1">{opt.label}</div>
                      <div className="text-xs text-gray-500">
                        {opt.helper}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Generar */}
          <div className="mt-10 text-center">
            <button
              onClick={handleGenerateClick}
              disabled={isGeneratingBatch}
              className="w-full max-w-md bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 transition cursor-pointer disabled:opacity-70 mx-auto"
            >
              {isGeneratingBatch
                ? "Generando..."
                : credits > 0
                ? "✨ Generar foto (1 crédito)"
                : "Comprar créditos"}
            </button>
          </div>

          {/* Resultados */}
          {generatedImages.length > 0 && (
            <div className="mt-10 pt-10 border-t border-gray-100">
              <h4 className="text-left font-bold mb-4">
                Resultados recientes:
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {generatedImages.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img src={img} alt={`Generada ${i + 1}`} className="w-full" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
