// app/config/studio.ts
import {
    AgeRange,
    HairColor,
    HairLength,
    HairStyle,
    Ethnicity,
    BodyType,
    Attire,
    Background,
  } from "@/app/types/studio";
  
  export const STYLE_CATEGORIES = [
    { key: "Professional", label: "💼 LinkedIn" },
    { key: "Dating", label: "❤️ Citas" },
    { key: "Social", label: "🤳 Historias/Social" },
    { key: "Lifestyle", label: "✈️ Viajes" },
  ];
  
  export const AGE_OPTIONS: { id: AgeRange; label: string }[] = [
    { id: "18_20", label: "18–20" },
    { id: "21_24", label: "21–24" },
    { id: "25_29", label: "25–29" },
    { id: "30_40", label: "30–40" },
    { id: "41_50", label: "41–50" },
    { id: "51_65", label: "51–65" },
    { id: "65_plus", label: "65+" },
  ];
  
  export const HAIR_COLOR_OPTIONS: { id: HairColor; label: string }[] = [
    { id: "brown", label: "Marrón" },
    { id: "black", label: "Negro" },
    { id: "blonde", label: "Rubia" },
    { id: "gray", label: "Gris" },
    { id: "auburn", label: "Auburn" },
    { id: "red", label: "Rojo" },
    { id: "white", label: "Blanco" },
    { id: "other", label: "Otros" },
    { id: "bald", label: "Calvo" },
  ];
  
  export const HAIR_LENGTH_OPTIONS: { id: HairLength; label: string }[] = [
    { id: "bald", label: "Calvo" },
    { id: "buzz", label: "Buzz Cut" },
    { id: "short", label: "Corto" },
    { id: "medium", label: "Longitud media" },
    { id: "long", label: "Largo" },
  ];
  
  export const HAIR_STYLE_OPTIONS: { id: HairStyle; label: string }[] = [
    { id: "straight", label: "Recto" },
    { id: "wavy", label: "Ondulado" },
    { id: "curly", label: "Rizado" },
    { id: "locs", label: "Rastas" },
  ];
  
  export const ETHNICITY_OPTIONS: { id: Ethnicity; label: string }[] = [
    { id: "white", label: "Blanco / Caucásico" },
    { id: "black", label: "Negro/de ascendencia africana" },
    { id: "east_asian", label: "Asia oriental o central" },
    { id: "hispanic", label: "Hispano, latino, origen español" },
    { id: "middle_eastern", label: "Oriente Medio, norte de África o árabe" },
    { id: "multiracial", label: "Multiracial" },
    { id: "pacific_islander", label: "Nativo de Hawai u otras islas del Pacífico" },
    { id: "southeast_asian", label: "Sudeste asiático (vietnamita, camboyano, etc.)" },
    { id: "south_asian", label: "Sur de Asia (indio, pakistaní, etc.)" },
    { id: "other", label: "Otros" },
  ];
  
  export const BODY_TYPE_OPTIONS: { id: BodyType; label: string }[] = [
    { id: "slim", label: "Slim" },
    { id: "regular", label: "Regular" },
    { id: "athletic", label: "Atlético" },
    { id: "medium_large", label: "Mediano grande" },
    { id: "large", label: "Grande" },
    { id: "plus_size", label: "Tallas grandes" },
  ];
  
  export const ATTIRE_OPTIONS: { id: Attire; label: string; helper: string }[] = [
    {
      id: "business_formal",
      label: "Profesional Empresarial",
      helper: "Camisas y trajes formales con corbatas",
    },
    {
      id: "business_casual",
      label: "Business Casual",
      helper: "Blazers y camisas de manga larga",
    },
    {
      id: "smart_casual",
      label: "Elegante e informal",
      helper: "Suéteres y camisas cómodas",
    },
  ];
  
  export const BACKGROUND_OPTIONS: { id: Background; label: string; helper: string }[] = [
    { id: "city", label: "Ciudad", helper: "Vibrantes calles urbanas" },
    { id: "nature", label: "Naturaleza", helper: "Parques al aire libre o calles arboladas" },
    { id: "office", label: "Oficina", helper: "Oficina corporativa luminosa y minimalista" },
    { id: "studio", label: "Estudio", helper: "Estudio fotográfico profesional" },
  ];
  