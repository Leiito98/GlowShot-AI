// ARCHIVO: lib/prompts.ts

// --- COLECCIÓN DE PROMPTS CATEGORIZADOS ---
// Usaremos esta estructura: PROMPT_COLLECTION[genero][categoria]
export const PROMPT_COLLECTION = {
  woman: {
      // --- LINKEDIN / CV / PROFESIONAL (Focus: Confianza, Limpieza) ---
      Professional: [
          "OHWX woman, wearing a tailored navy blazer, white blouse, modern office setting, professional headshot, confident posture, soft studio lighting, 8k, photorealistic",
          "OHWX woman, black turtleneck, leaning against a neutral grey wall, deep shadows, serious expression, creative director style, sharp focus",
          "OHWX woman, smart casual knit sweater, smiling candidly, working on a clean laptop, bright modern coworking space, natural daylight, high detail",
          "OHWX woman, speaking at a conference podium, blurred audience in background, wearing an elegant silk top, leadership portrait, strong eye contact",
          "OHWX woman, crisp white shirt, minimalist background, arms crossed, clean professional headshot, detailed skin texture",
          "OHWX woman, doctor's coat, hospital corridor, warm, trustworthy smile, bright lighting, medical professional",
          "OHWX woman, law firm setting, grey suit, holding a legal pad, authoritative, professional photography",
          "OHWX woman, financial advisor style, pinstripe blazer, wall street background (out of focus), intense focus",
          "OHWX woman, engineer style, wearing safety glasses, holding a tablet, industrial background (blurred), technical confidence",
      ],
      // --- CITAS / TINDER (Focus: Atractivo, Autenticidad, Luz Dorada) ---
      Dating: [
          "OHWX woman, candid portrait, laughing naturally, golden hour sunlight, outdoor cafe setting, holding a wine glass, soft bokeh background, hyper-realistic, dating profile shot",
          "OHWX woman, cozy Sunday morning, oversized knit sweater, holding coffee mug, soft window light, relaxed and authentic vibe, high quality candid shot",
          "OHWX woman, evening makeup, rooftop bar at sunset, city lights bokeh, black slip dress, sophisticated dating profile photo",
          "OHWX woman, playing with a golden retriever dog in a park, smiling, casual denim jeans and tee, wholesome and approachable",
          "OHWX woman, ice skating rink, winter scarf and coat, candid laughter, romantic winter date scene",
          "OHWX woman, sitting on a pier, sunset over the lake, contemplative gaze, wearing a knit beanie, artistic profile",
          "OHWX woman, cooking in a modern kitchen, flour on nose, genuine laugh, warm home lighting, attractive homebody vibe",
          "OHWX woman, reading a book in bed, messy bun, soft natural light, cozy lifestyle shot, dating profile picture",
          "OHWX woman, holding a cocktail in a dimly lit, stylish restaurant, elegant evening wear, direct eye contact",
      ],
      // --- VIAJES / LIFESTYLE (Focus: Experiencias, Aventura, Escenario) ---
      Lifestyle: [
          "OHWX woman, in Santorini Greece, white buildings and blue sea background, wearing a sun hat and linen dress, bright sunlight, travel blogger aesthetic",
          "OHWX woman, walking through a crowded market in Marrakesh, vibrant colors, boho style dress, cinematic travel photography",
          "OHWX woman, on a yacht deck, holding a glass of champagne, turquoise ocean background, luxury travel lifestyle, sunny day",
          "OHWX woman, wearing a trench coat in Paris, blurred Eiffel Tower background, candid shot while walking, stylish european vibe",
          "OHWX woman, hiking in the Swiss Alps, looking back at the camera, wearing professional hiking gear, rugged mountain background",
          "OHWX woman, standing in a lavender field at sunset, flowing summer dress, soft pastel colors, dreamy travel photo",
          "OHWX woman, near a tropical waterfall, wearing a simple bikini, jungle background, natural beauty, adventurous spirit",
          "OHWX woman, drinking coffee in front of a landmark (e.g., Colosseum), wearing sunglasses, candid street shot",
      ],
      // --- SOCIAL / INSTAGRAM (Focus: Estética, Moda, Tendencia) ---
      Social: [
          "OHWX woman, streetwear fashion, standing in front of a graffiti wall, urban neon lighting, intense look, social media aesthetic",
          "OHWX woman, close up beauty shot, studio lighting, detailed eye makeup, perfect skin texture, high fashion portrait",
          "OHWX woman, mirror selfie style (but high quality), clean minimalist bathroom, showcasing outfit, fashion influence",
          "OHWX woman, holding a vinyl record, music store background, cozy sweater, hipster aesthetic, soft focus",
          "OHWX woman, at a music festival, neon lights reflecting on face, energetic dance pose, festival outfit, social media post",
          "OHWX woman, black and white portrait, dramatic shadow play across the face, artistic moody studio shot",
          "OHWX woman, sitting on the steps of a brownstone building, city life background, candid street photography, soft focus",
          "OHWX woman, holding a camera, taking a picture of the view, artsy aesthetic, candid moment",
          "OHWX woman, aesthetic flatlay, holding a flower, wearing rings, perfect manicure, soft white background",
      ]
  },
  man: {
      // --- LINKEDIN / CV / PROFESIONAL ---
      Professional: [
          "OHWX man, wearing a tailored charcoal suit, white shirt, modern glass office background, confident expression, professional headshot, sharp focus, 8k",
          "OHWX man, wearing a black knit turtleneck, leaning against a clean white wall, studio lighting, serious and intellectual look, creative professional",
          "OHWX man, crisp blue button-down shirt, rolled sleeves, arms crossed, bright open-plan office setting, friendly tech vibe",
          "OHWX man, speaking at a corporate event, blurred conference room background, professional suit, authoritative leadership pose",
          "OHWX man, smart casual grey sweater and glasses, holding a tablet, modern coffee shop working environment, trustworthy consultant",
          "OHWX man, doctor's coat, hospital environment, warm smile, professional and clean lighting",
          "OHWX man, lawyer style, dark suit, law library background, intelligent and trustworthy, serious eye contact",
          "OHWX man, real estate agent, standing in front of a luxury modern home, wearing a blazer, welcoming and successful appearance",
          "OHWX man, software developer, multiple monitors background, code reflection on face (subtle), intense focus, casual tech wear",
      ],
      // --- CITAS / TINDER ---
      Dating: [
          "OHWX man, golden hour portrait in a park, smiling confidently, wearing a fitted white linen shirt, blurred green background, high quality dating profile shot",
          "OHWX man, sitting at a sidewalk cafe, holding a coffee cup, soft daylight, wearing a stylish beige sweater, approachable dating profile picture",
          "OHWX man, at a rooftop bar at night, city lights bokeh background, holding a cocktail, leather jacket, cool and social vibe",
          "OHWX man, playing acoustic guitar on a rustic wooden porch, relaxed and artistic vibe, simple t-shirt and jeans",
          "OHWX man, cooking in a modern kitchen, genuine smile, wearing a simple t-shirt, warm home lighting, attractive domestic shot",
          "OHWX man, standing by the ocean at sunset, wind in hair, wearing a casual jacket, deep and thoughtful gaze",
          "OHWX man, holding a glass of red wine, fireplace background, winter cabin setting, cozy romantic profile",
          "OHWX man, bowling alley or arcade background, laughing candidly, wearing a simple t-shirt, fun and active dating profile",
          "OHWX man, mirror selfie (high quality), modern minimalist gym, wearing workout gear, fit and healthy look",
      ],
      // --- VIAJES / LIFESTYLE ---
      Lifestyle: [
          "OHWX man, standing in front of the Eiffel Tower, wearing a simple jacket, cloudy Parisian day, candid street photo, travel aesthetic",
          "OHWX man, hiking in the mountains, wearing a technical jacket, looking at a vast mountain range, adventurous travel photography",
          "OHWX man, exploring a Japanese street at night, neon signs reflection, stylish streetwear, urban explorer vibe",
          "OHWX man, on a yacht, wearing white linen shorts and an open shirt, blue ocean background, luxury travel lifestyle",
          "OHWX man, drinking espresso in a sunny Italian piazza, wearing sunglasses and light blazer, relaxed european summer",
          "OHWX man, walking on the Great Wall of China, wind in hair, looking towards the landscape, epic travel shot",
          "OHWX man, riding a bicycle through a sunny vineyard, casual button-down shirt, rural european travel",
          "OHWX man, standing by a vintage car on a coastal road, sunglasses on, jacket over shoulder, timeless travel style",
          "OHWX man, in a snowy landscape, wearing a heavy winter parka, looking up at the northern lights, scenic view",
      ],
      // --- SOCIAL / INSTAGRAM ---
      Social: [
          "OHWX man, close up detailed portrait, neutral grey background, dramatic shadow on half face, cinematic studio lighting",
          "OHWX man, stylish streetwear, sitting on concrete steps, urban background (blurred), fashion photography style",
          "OHWX man, at a music festival, sunset lighting, smiling broadly, vibrant festival atmosphere, social media post",
          "OHWX man, mirror selfie (high quality), modern gym locker room, showing off workout gear, fitness influencer",
          "OHWX man, holding a vinyl record, focused on the album art, music store setting, soft lighting, creative aesthetic",
          "OHWX man, neon light portrait, blue and pink hues on face, leather jacket, edgy futuristic style",
          "OHWX man, black and white portrait, deep shadows, serious expression, artistic composition",
          "OHWX man, sitting at a bar, holding an expensive cocktail, laughing candidly, socialite vibe",
          "OHWX man, walking dog in a city park, motion blur in the background, candid street style",
      ]
  }
};

// --- FUNCIÓN QUE USA EL ESTILO (LA QUE NECESITAS EN page.tsx) ---
export function getPromptsForPack(gender: "man" | "woman", count: number, style: string) {
  // 1. Obtiene el array de prompts basado en género y estilo
  const source = PROMPT_COLLECTION[gender][style as keyof typeof PROMPT_COLLECTION["woman"]];

  // 2. Si hay menos prompts que los que se piden, los repite (para llegar a 40 o 100)
  let finalSource = source;
  while (finalSource.length < count) {
      finalSource = finalSource.concat(source);
  }
  
  // 3. Mezcla y saca la cantidad pedida
  const shuffled = [...finalSource].sort(() => 0.5 - Math.random());
  
  // Aseguramos que la cantidad de prompts sea igual a 'count'
  return shuffled.slice(0, count);
}