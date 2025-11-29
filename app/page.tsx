"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import { getPromptsForPack } from "../lib/prompts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- CONFIGURACIÓN DE LOS PLANES (precios actualizados) ---
const PLANS = [
  {
    id: "basic",
    name: "Starter Pack",
    price: 9.99,
    originalPrice: 12.99,
    photos: 40,
    features: ["45 min de generación", "1 atuendo a elegir", "Resolución estándar"],
    highlight: false
  },
  {
    id: "standard",
    name: "Pro Pack",
    price: 14.99,
    originalPrice: 19.99,
    photos: 60,
    features: ["30 min de generación", "Elección de 2 atuendos", "Resolución estándar"],
    highlight: true,
    tag: "🧡 El más elegido"
  },
  {
    id: "executive",
    name: "Ultra Pack",
    price: 24.99,
    originalPrice: 34.99,
    photos: 100,
    features: ["15 min de generación", "Todos los atuendos", "Resolución mejorada"],
    highlight: false,
    tag: "+ Mejor valor"
  }
];

// --- NUEVAS CATEGORÍAS DE ESTILO ---
const STYLE_CATEGORIES = [
  { key: "Professional", label: "💼 LinkedIn" },
  { key: "Dating", label: "❤️ Citas" },
  { key: "Social", label: "🤳 Historias/Social" },
  { key: "Lifestyle", label: "✈️ Viajes" },
];

export default function Home() {
  const { user } = useUser();
  const [isLoaded, setIsLoaded] = useState(false);

  // VISTAS
  const [view, setView] = useState<"home" | "upload" | "studio" | "gallery">("home");

  // Estados Lógicos
  const [trainingId, setTrainingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [weightsUrl, setWeightsUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [zipUrl, setZipUrl] = useState<string>("");

  // Negocio
  const [credits, setCredits] = useState<number>(0);
  const [gender, setGender] = useState<"man" | "woman">("woman");
  const [selectedStyle, setSelectedStyle] = useState<string>("Professional"); // ESTADO DE ESTILO
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);

  // --- FUNCIONES DE BASE DE DATOS Y CARGA ---

  const loadGallery = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/my-images');
      const data = await res.json();
      if (data.images) setGalleryImages(data.images);
    } catch (error) { console.error("Error cargando galería:", error); }
  };

  const fetchCredits = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/get-credits');
      if (!res.ok) throw new Error("API falló al leer créditos");
      const data = await res.json();
      setCredits(data.credits);
    } catch (e) {
      setCredits(0);
    }
  };

  // 1. CARGA INICIAL Y POLLING
  useEffect(() => {
    setIsLoaded(true);
    let intervalId: NodeJS.Timeout;

    async function loadDataAndSetupPolling() {
      if (!user) return;

      await fetchCredits();

      try {
        const { data: model } = await supabase
          .from('predictions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'succeeded')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if ((model as any)?.model_version) {
          setWeightsUrl((model as any).model_version);
        }
      } catch (e) {
        // si no hay modelo, no pasa nada
      }

      loadGallery();

      intervalId = setInterval(() => {
        fetchCredits();
      }, 10000);
    }

    loadDataAndSetupPolling();
    return () => { if (intervalId) clearInterval(intervalId); };

  }, [user]);

  // --- FUNCIONES LÓGICAS (Upload, Train, etc) ---

  // FIX DE TYPESCRIPT: Usamos useCallback para envolver la función asíncrona de carga
  const handleFileUpload: React.ChangeEventHandler<HTMLInputElement> = useCallback(async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) return alert("Inicia sesión antes de subir fotos");
    setIsUploading(true);
    setUploadProgress("Comprimiendo...");
    try {
      const files = Array.from(e.target.files);
      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      setUploadProgress("Subiendo...");
      const fileName = `${user.id}-${Date.now()}.zip`;
      const { error } = await supabase.storage.from('training_files').upload(fileName, zipBlob, { contentType: 'application/zip' });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('training_files').getPublicUrl(fileName);
      setZipUrl(urlData.publicUrl);
      setUploadProgress("✅ Fotos Listas");
    } catch (error: any) { alert("Error: " + (error?.message || String(error))); } finally { setIsUploading(false); }
  }, [user]);

  const startTraining = async () => {
    if (!zipUrl) return alert("Sube fotos primero");
    setStatus("starting");
    try {
      const res = await fetch("/api/train", { method: "POST", body: JSON.stringify({ zipUrl }), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setTrainingId(data.id); setStatus(data.status);
    } catch (error: any) { alert("Error: " + (error?.message || String(error))); setStatus("idle"); }
  };

  const checkStatus = async () => {
    if (!trainingId) return;
    try {
      const res = await fetch("/api/status", { method: "POST", body: JSON.stringify({ trainingId }), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      setStatus(data.status);
      if (data.weights) { setWeightsUrl(data.weights); setView("studio"); alert("¡Modelo Listo!"); }
    } catch (error) { console.error(error); }
  };

  const buyPlan = async (plan: typeof PLANS[0]) => {
    const confirm = window.confirm(`Ir a pago de $${plan.price} USD?`);
    if (!confirm) return;
    try {
      const res = await fetch("/api/buy-credits", { method: "POST", body: JSON.stringify({ packSize: plan.photos }), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.success) {
        setCredits(data.newCredits); setShowPayModal(false);
        // Lógica inteligente post-compra
        if (weightsUrl) setView("studio");
        else if (zipUrl) startTraining();
        else setView("upload");
      } else {
        alert("Pago no completado.");
      }
    } catch (e) { alert("Error en el pago"); }
  };

  const generatePhotos = async () => {
    if (credits <= 0) { setShowPayModal(true); return; }
    const amount = 1;
    setIsGeneratingBatch(true);

    const prompts = getPromptsForPack(gender, amount, selectedStyle);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: JSON.stringify({ prompt: prompts[0], weightsUrl }), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImages(prev => [data.imageUrl, ...prev]);
        setCredits(data.remainingCredits);
        loadGallery();
      }
    } catch (e) { console.error(e); }
    setIsGeneratingBatch(false);
  };

  const handleCreateClick = () => {
    if (credits > 0) {
      if (weightsUrl) {
        setView("studio");
      } else {
        setView("upload");
      }
    } else {
      setShowPayModal(true);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-white" aria-hidden />;

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900 selection:bg-orange-100 selection:text-orange-900">

      {/* HEADER BLANCO LIMPIO */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
          <div className="w-8 h-8 bg-[#ff5a1f] rounded-full flex items-center justify-center font-bold text-white text-sm">A</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">GlowShot.ai</h1>
        </div>

        <div className="flex gap-4 items-center">
          <SignedIn>
            {/* MENÚ DE NAVEGACIÓN SIMPLE */}
            <nav className="hidden md:flex gap-6 mr-4 text-sm font-medium text-gray-600" aria-label="Main navigation">
              <button onClick={() => setView("home")} className={`hover:text-[#ff5a1f] ${view === 'home' ? 'text-[#ff5a1f]' : ''}`}>Inicio</button>
              <button onClick={() => setView("studio")} className={`hover:text-[#ff5a1f] ${view === 'studio' ? 'text-[#ff5a1f]' : ''}`}>Estudio</button>
              <button onClick={() => setView("gallery")} className={`hover:text-[#ff5a1f] ${view === 'gallery' ? 'text-[#ff5a1f]' : ''}`}>Mis Retratos</button>
            </nav>

            {/* Créditos ahora visibles y actualizados vía Polling */}
            {credits > 0 && <div className="bg-orange-50 text-orange-700 px-4 py-1.5 rounded-full text-sm font-bold border border-orange-100 mr-2" aria-live="polite">📸 {credits} Créditos</div>}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal"><button className="bg-[#ff5a1f] text-white px-5 py-2 rounded-full font-bold hover:bg-[#e04f1b] transition">Comenzar</button></SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="pb-20">
        <SignedOut>
          {/* --- LANDING PAGE MEJORADA --- */}
          <section className="max-w-7xl mx-auto px-6 pt-20 text-center">
            <div className="inline-block bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">✨ La empresa Nº1 en fotografía de retratos AI</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-gray-900">Tu mejor versión en <span className="text-[#ff5a1f]">fotos IA</span></h2>
                <p className="text-gray-600 text-lg mb-8">Generá headshots profesionales, fotos para Tinder o contenido social en minutos. Subís tus selfies y recibís packs listos para usar.</p>
                <div className="flex gap-3 justify-center">
                  <SignInButton mode="modal">
                    <button className="bg-[#ff5a1f] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#e04f1b] shadow-lg">Crear mis fotos IA</button>
                  </SignInButton>
                  <a href="#pricing" className="px-6 py-4 rounded-full border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Ver planes</a>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto opacity-80">
                  <img src="https://source.unsplash.com/random/200x300?portrait,smile" alt="Ejemplo 1" className="w-full h-36 object-cover rounded-lg" />
                  <img src="https://source.unsplash.com/random/200x300?portrait,stylish" alt="Ejemplo 2" className="w-full h-36 object-cover rounded-lg" />
                  <img src="https://source.unsplash.com/random/200x300?portrait,modern" alt="Ejemplo 3" className="w-full h-36 object-cover rounded-lg" />
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100" id="pricing" aria-labelledby="pricing-heading">
                <h3 id="pricing-heading" className="text-xl font-bold mb-4">Planes diseñados para todos</h3>

                <div className="space-y-4">
                  {PLANS.map(plan => (
                    <div key={plan.id} className={`relative rounded-2xl p-6 border ${plan.highlight ? 'border-orange-300 bg-orange-50/40 shadow-lg' : 'border-gray-200 bg-white'}`}>
                      {plan.tag && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#ff5a1f] text-white px-3 py-1 rounded-full text-xs font-bold">{plan.tag}</div>}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-lg font-bold">{plan.name}</h4>
                          <p className="text-sm text-gray-500">{plan.photos} fotos</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-extrabold">${plan.price.toFixed(2)}</div>
                          <div className="text-sm text-gray-400 line-through">${plan.originalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                      <ul className="text-sm text-gray-600 mb-4 space-y-2">
                        {plan.features.map((f, i) => (<li key={i} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>))}
                      </ul>
                      <div className="flex gap-2">
                        <SignInButton mode="modal">
                          <button onClick={() => { /* usuario iniciará sesión y podrá comprar en modal principal */ }} className={`w-full py-3 rounded-lg font-bold ${plan.highlight ? 'bg-[#ff5a1f] text-white' : 'bg-gray-100 text-gray-900'}`}>Seleccionar</button>
                        </SignInButton>
                        <button onClick={() => alert('Demo: este botón abriría detalles del plan')} className="px-4 py-3 rounded-lg border border-gray-200 text-sm">Detalles</button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 mt-4">Paga una vez. Sin suscripciones (también tenés planes mensuales si preferís)</p>
              </div>
            </div>

            <div className="mt-20 grid grid-cols-2 md:grid-cols-6 gap-4 px-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-gray-100">
                  <img src={`https://source.unsplash.com/random/500x750?portrait,business&sig=${i}`} alt={`Muestra ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        </SignedOut>

        <SignedIn>

          {/* VISTA 1: DASHBOARD HOME */}
          {view === "home" && (
            <div className="max-w-5xl mx-auto px-6 pt-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-8 border-b border-gray-200 mb-10">
                  <button className="pb-3 border-b-2 border-[#ff5a1f] text-[#ff5a1f] font-bold px-2">Headshots</button>
                  <button className="pb-3 border-b-2 border-transparent text-gray-400 font-medium px-2">Teams</button>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Bienvenido al estudio, {user?.firstName}</h2>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto">Genera retratos profesionales en minutos.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-32">
                {[10,11,12,13].map(i => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-100">
                    <img src={`https://source.unsplash.com/random/500x500?portrait,professional&sig=${i}`} alt={`Ejemplo ${i}`} className="w-full h-full object-cover opacity-80" />
                  </div>
                ))}
              </div>

              <div className="fixed bottom-10 left-0 right-0 flex justify-center z-40">
                <button onClick={handleCreateClick} className="bg-[#ff5a1f] hover:bg-[#e04f1b] text-white text-lg font-bold px-10 py-4 rounded-full transition transform hover:scale-105 shadow-xl shadow-orange-200/50">
                  {weightsUrl ? "✨ Ir al Estudio (Generar)" : "Crear Headshots +"}
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: SUBIDA (UPLOAD) */}
          {view === "upload" && (
            <div className="max-w-2xl mx-auto px-6 pt-10 text-center">
              <button onClick={() => setView("home")} className="mb-6 text-gray-500 hover:text-black">← Cancelar</button>
              <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl">
                <h2 className="text-3xl font-bold mb-2">Sube tus fotos</h2>
                <p className="text-gray-500 mb-8">Selecciona 6-10 selfies claras.</p>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 bg-gray-50 hover:bg-white hover:border-[#ff5a1f] transition cursor-pointer relative group">
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading || !!zipUrl} aria-label="Subir fotos" />
                  <div className="text-gray-400 group-hover:text-[#ff5a1f] transition font-medium">
                    {isUploading ? "Subiendo..." : zipUrl ? "✅ Fotos Listas" : "Arrastra o haz clic aquí"}
                  </div>
                </div>
                {zipUrl && !trainingId && (<button onClick={startTraining} className="w-full mt-6 bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition">Iniciar Entrenamiento</button>)}
                {trainingId && (<div className="mt-6 bg-orange-50 p-6 rounded-xl border border-orange-100"><p className="font-bold text-orange-800">Entrenando IA...</p><p className="text-sm text-gray-600">Estado: {status}</p><button onClick={checkStatus} className="text-xs underline mt-2">Verificar</button></div>)}
              </div>
            </div>
          )}

          {/* VISTA 3: ESTUDIO (GENERADOR) */}
          {view === "studio" && (
            <div className="max-w-4xl mx-auto px-6 pt-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Estudio de IA</h2>
                <button onClick={() => setView("home")} className="text-sm text-gray-500">Volver</button>
              </div>

              {!weightsUrl ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                  <h3 className="text-xl font-bold mb-4">No tienes un modelo activo</h3>
                  <button onClick={() => setView("upload")} className="bg-black text-white px-6 py-3 rounded-xl font-bold">Entrenar Modelo</button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 p-8 md:p-12 text-center">
                  <h3 className="text-gray-500 font-medium mb-8">Genera nuevas fotos profesionales.</h3>

                  {/* Selector de Estilo */}
                  <div className="flex justify-center flex-wrap gap-3 mb-8 max-w-xl mx-auto">
                    {STYLE_CATEGORIES.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedStyle(cat.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedStyle === cat.key ? 'bg-[#ff5a1f] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        aria-pressed={selectedStyle === cat.key}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 max-w-md mx-auto mb-8">
                    <button onClick={() => setGender("woman")} className={`flex-1 py-3 px-6 rounded-lg font-bold transition shadow-sm ${gender === 'woman' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>👩 Mujer</button>
                    <button onClick={() => setGender("man")} className={`flex-1 py-3 px-6 rounded-lg font-bold transition shadow-sm ${gender === 'man' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>👨 Hombre</button>
                  </div>
                  <button onClick={generatePhotos} disabled={isGeneratingBatch} className="w-full max-w-md bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-orange-200 transition disabled:opacity-70">
                    {isGeneratingBatch ? "Generando..." : credits > 0 ? "✨ Generar Foto (1 crédito)" : "🔒 Comprar Créditos"}
                  </button>

                  {/* Resultados de la sesión actual */}
                  {generatedImages.length > 0 && (
                    <div className="mt-10 pt-10 border-t border-gray-100">
                      <h4 className="text-left font-bold mb-4">Resultados recientes:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {generatedImages.map((img, i) => (<div key={i} className="rounded-xl overflow-hidden border border-gray-200"><img src={img} alt={`Generada ${i}`} className="w-full" /></div>))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VISTA 4: GALERÍA (EL PANEL) */}
          {view === "gallery" && (
            <div className="max-w-6xl mx-auto px-6 pt-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Mis Retratos</h2>
                <span className="text-gray-500">{galleryImages.length} fotos</span>
              </div>

              {galleryImages.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-gray-500 text-lg mb-4">Aún no has generado ninguna foto.</p>
                  <button onClick={() => setView("home")} className="text-[#ff5a1f] font-bold">Ir a crear →</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {galleryImages.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
                      <img src={item.image_url} alt={item.alt || "Retrato generado"} className="w-full h-auto object-cover aspect-[2/3]" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"></div>
                      <a href={item.image_url} download target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 bg-white text-black p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-gray-100 scale-90 hover:scale-100" aria-label="Descargar imagen">
                        ⬇️
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </SignedIn>
      </main>

      {/* --- MODAL DE PAGOS --- */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-5xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowPayModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black text-xl font-bold">✕</button>
            <div className="text-center mb-10"><h2 className="text-3xl font-bold mb-2">Elige tu paquete</h2><p className="text-gray-500">Paga una vez. Sin suscripciones.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map((plan) => (
                <div key={plan.id} className={`relative rounded-2xl p-8 border flex flex-col ${plan.highlight ? 'border-orange-500 shadow-xl ring-1 ring-orange-500 bg-orange-50/10' : 'border-gray-200 bg-white'}`}>
                  {plan.tag && (<div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#ff5a1f] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{plan.tag}</div>)}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-2 mb-6"><span className="text-4xl md:text-5xl font-extrabold text-gray-900">${plan.price.toFixed(2)}</span><span className="text-gray-400 line-through mb-1.5 text-lg">${plan.originalPrice.toFixed(2)}</span></div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((f, i) => (<li key={i} className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500">✓</span> {f}</li>))}
                  </ul>
                  <button onClick={() => buyPlan(plan)} className={`w-full py-4 rounded-xl font-bold transition ${plan.highlight ? 'bg-[#ff5a1f] text-white hover:bg-[#e04f1b]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>Seleccionar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
