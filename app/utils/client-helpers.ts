// ARCHIVO: app/utils/client-helpers.ts

import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";

// --- CLIENTES COMPARTIDOS Y CONSTANTES ---
// Solo el cliente ANON se exporta aquí, la lógica ADMIN va al backend
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const PLANS = [
  { id: "basic", name: "Básico", price: 12, originalPrice: 35, photos: 40, features: ["45 min de generación", "1 atuendo a elegir", "Resolución estándar"], highlight: false },
  { id: "standard", name: "Estándar", price: 15, originalPrice: 45, photos: 60, features: ["30 min de generación", "Elección de 2 atuendos", "Resolución estándar"], highlight: true, tag: "🧡 83% elige esto" },
  { id: "executive", name: "Ejecutivo", price: 25, originalPrice: 75, photos: 100, features: ["15 min de generación", "Todos los atuendos", "Resolución mejorada"], highlight: false, tag: "+ Mejor valor" }
];

export const STYLE_CATEGORIES = [
  { key: "Professional", label: "💼 LinkedIn" },
  { key: "Dating", label: "❤️ Citas" },
  { key: "Social", label: "🤳 Historias/Social" },
  { key: "Lifestyle", label: "✈️ Viajes" },
];

// --- FUNCIONES DE BASE DE DATOS Y LÓGICA DE NEGOCIO ---

// El core de la lógica de carga de datos del usuario
export const loadModelStatus = async (user: any, supabaseClient: any) => {
    const { data: model } = await supabaseClient
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    return model;
};


// FUNCIÓN PARA CARGA DE ARCHIVOS
export const handleFileUploadLogic = async (files: FileList | null, user: any, setUploadProgress: (s: string) => void, setIsUploading: (b: boolean) => void, setZipUrl: (s: string) => void) => {
    if (!files || files.length === 0 || !user) return;
    setIsUploading(true);
    setUploadProgress("Comprimiendo...");
    try {
        const zip = new JSZip();
        Array.from(files).forEach((file) => zip.file(file.name, file));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setUploadProgress("Subiendo...");
        const fileName = `${user?.id}-${Date.now()}.zip`;
        const { error } = await supabase.storage.from('training_files').upload(fileName, zipBlob, { contentType: 'application/zip' });
        if (error) throw error;
        const { data: urlData } = supabase.storage.from('training_files').getPublicUrl(fileName);
        setZipUrl(urlData.publicUrl);
        setUploadProgress("✅ Fotos Listas");
    } catch (error: any) { alert("Error: " + error.message); } finally { setIsUploading(false); }
};

// ... Puedes mover startTraining, checkStatus, buyPlan, generatePhotos aquí y exportarlos si quieres un código más limpio, 
// pero los mantendremos en los componentes por ahora para que sea más fácil de seguir.