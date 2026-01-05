// app/config/plans.ts
export type Plan = {
    id: "basic" | "standard" | "executive";
    name: string;
    price: number;
    originalPrice: number;
    photos: number;
    features: string[];
    highlight: boolean;
    tag?: string;
  };
  
  export type PlanId = Plan["id"];

  export const PLANS: Plan[] = [
    {
      id: "basic",
      name: "Starter Pack",
      price: 9.99,
      originalPrice: 12.99,
      photos: 40,
      features: ["45 min de generación", "1 atuendo a elegir", "1 fondo a elegir", "Resolución estándar"],
      highlight: false,
    },
    {
      id: "standard",
      name: "Pro Pack",
      price: 14.99,
      originalPrice: 19.99,
      photos: 60,
      features: ["30 min de generación", "Elección de 2 atuendos", "Elección de 2 fondos", "Resolución estándar"],
      highlight: true,
      tag: "🧡 El más elegido",
    },
    {
      id: "executive",
      name: "Ultra Pack",
      price: 24.99,
      originalPrice: 34.99,
      photos: 100,
      features: ["15 min de generación", "Todos los atuendos","Todos los fondos", "Resolución mejorada"],
      highlight: false,
      tag: "+ Mejor valor",
    },
  ];
  