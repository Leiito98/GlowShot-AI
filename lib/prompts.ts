// ============================================================================
// lib/prompts.ts — versión optimizada para trabajar con `selections`
// ============================================================================
//
// Estos prompts NO definen:
//   - género
//   - edad
//   - etnia
//   - outfit
//   - fondo
//
// Eso lo aporta el backend usando `selections`.
//
// Aquí sólo definimos:
//   - estilo visual
//   - intención emocional
//   - atmósfera
//   - narrativa estética
//
// Todos usan {trigger} para activar el LoRA correctamente.
// ============================================================================

export const PROMPT_COLLECTION = {
  woman: {
    // ----------------------------------------------------------------------
    // 💼 LINKEDIN / PROFESIONAL
    // ----------------------------------------------------------------------
    Professional: [
      "{trigger}, professional portrait photography, confident expression, subtle cinematic tone, crisp detail, realistic skin texture, ultra sharp, editorial headshot aesthetic",
      "{trigger}, leadership portrait, clean composition, calm presence, refined corporate vibe, natural light feel, premium professional photography look",
      "{trigger}, authentic executive portrait, composed posture, subtle depth of field, modern studio aesthetic, elegant and intelligent visual tone",
      "{trigger}, polished headshot, balanced soft lighting, focused expression, premium corporate portrait style, lifelike cinematic rendering",
      "{trigger}, high-end editorial headshot, confident yet approachable mood, fine-art portrait realism, professional photographic atmosphere",
      "{trigger}, modern corporate portrait, refined minimalist tone, quiet confidence, premium portrait session aesthetic",
      "{trigger}, executive headshot session, composed and professional visual language, natural expression, elegant fine-detail realism"
    ],

    // ----------------------------------------------------------------------
    // ❤️ CITAS / TINDER
    // ----------------------------------------------------------------------
    Dating: [
      "{trigger}, warm and inviting portrait, natural charm, intimate candid feeling, soft emotional glow, authentic storytelling vibe",
      "{trigger}, relaxed lifestyle portrait, subtle romantic tone, gentle light atmosphere, approachable expression, natural warmth",
      "{trigger}, cinematic romantic portrait, dreamy mood, soft emotional ambience, expressive presence, modern dating profile aesthetic",
      "{trigger}, spontaneous candid portrait, gentle smile energy, natural feel, visually appealing emotional tone",
      "{trigger}, serene and attractive portrait, calm presence, cinematic warmth, subtle depth and character",
      "{trigger}, modern romantic portrait, emotionally engaging expression, soft glow, authentic personality vibe",
      "{trigger}, natural dating profile style portrait, honest emotional tone, intimate yet elegant aesthetic"
    ],

    // ----------------------------------------------------------------------
    // ✈️ LIFESTYLE / VIAJES
    // ----------------------------------------------------------------------
    Lifestyle: [
      "{trigger}, cinematic lifestyle photography, sense of place and story, travel mood, immersive atmosphere, expressive portrait narrative",
      "{trigger}, aspirational lifestyle portrait, visually rich composition, natural adventure aesthetic, subtle cinematic storytelling",
      "{trigger}, elegant lifestyle scene, relaxed expression, refined visual tone, artistic travel-inspired mood",
      "{trigger}, experiential lifestyle portrait, emotional sense of space, visual storytelling focus, cinematic documentary feel",
      "{trigger}, artistic lifestyle photography, moment-in-motion feeling, grounded natural tone",
      "{trigger}, calm reflective lifestyle portrait, contemplative atmosphere, emotionally grounded visual style",
      "{trigger}, premium lifestyle portrait session, immersive environment tone, expressive narrative realism"
    ],

    // ----------------------------------------------------------------------
    // 🤳 SOCIAL / INSTAGRAM
    // ----------------------------------------------------------------------
    Social: [
      "{trigger}, modern social-style portrait, aesthetic visual tone, expressive personality focus, stylish cinematic presence",
      "{trigger}, artistic portrait vibe, contemporary creative energy, soft editorial mood, visually engaging composition",
      "{trigger}, aesthetic portrait session, subtle expressive tone, polished modern social media look",
      "{trigger}, expressive creative portrait, stylized atmosphere, cinematic texture, bold visual identity",
      "{trigger}, visually striking portrait, artistic balance of mood and expression, refined creative tone",
      "{trigger}, editorial-inspired creative portrait, intimate modern vibe, personality-driven composition",
      "{trigger}, premium creator-style portrait, polished yet artistic, emotional visual character"
    ]
  },

  man: {
    // ----------------------------------------------------------------------
    // 💼 LINKEDIN / PROFESIONAL
    // ----------------------------------------------------------------------
    Professional: [
      "{trigger}, professional portrait photography, confident and composed presence, cinematic clarity, ultra sharp editorial headshot aesthetic",
      "{trigger}, executive portrait tone, focused expression, refined corporate visual language, premium headshot realism",
      "{trigger}, authentic leadership portrait, controlled calm posture, modern professional studio tone",
      "{trigger}, polished corporate headshot, lifelike fine-detail realism, balanced natural light aesthetic",
      "{trigger}, high-end business portrait session, confident yet approachable, cinematic fine-art tone",
      "{trigger}, sophisticated executive portrait, refined visual atmosphere, professional photography depth",
      "{trigger}, premium editorial corporate portrait, timeless professional mood, elegant realism"
    ],

    // ----------------------------------------------------------------------
    // ❤️ CITAS / TINDER
    // ----------------------------------------------------------------------
    Dating: [
      "{trigger}, warm cinematic portrait, natural charisma, relaxed emotional tone, soft expressive presence",
      "{trigger}, candid lifestyle portrait, approachable confidence, authentic and modern dating profile style",
      "{trigger}, cinematic romantic mood portrait, subtle emotional depth, visually engaging warmth",
      "{trigger}, casual yet confident portrait, natural presence, expressive connection-focused tone",
      "{trigger}, intimate relaxed portrait vibe, soft mood and emotional authenticity",
      "{trigger}, modern dating portrait aesthetic, honest expression, inviting emotional tone",
      "{trigger}, refined candid portrait, natural energy, cinematic lifestyle warmth"
    ],

    // ----------------------------------------------------------------------
    // ✈️ LIFESTYLE / VIAJES
    // ----------------------------------------------------------------------
    Lifestyle: [
      "{trigger}, cinematic lifestyle photography, sense of exploration and story, immersive visual narrative",
      "{trigger}, aspirational lifestyle portrait, grounded natural tone, expressive portrait-in-environment look",
      "{trigger}, artistic lifestyle scene, balanced emotional presence, cinematic documentary atmosphere",
      "{trigger}, reflective lifestyle portrait, emotional sense of place, subtle cinematic realism",
      "{trigger}, travel-inspired lifestyle portrait, narrative visual tone, refined storytelling aesthetic",
      "{trigger}, calm experiential portrait, grounded mood, expressive lifestyle presence",
      "{trigger}, premium lifestyle portrait session, immersive environment-driven mood"
    ],

    // ----------------------------------------------------------------------
    // 🤳 SOCIAL / INSTAGRAM
    // ----------------------------------------------------------------------
    Social: [
      "{trigger}, bold creative portrait aesthetic, expressive personality-driven visual style",
      "{trigger}, cinematic artistic portrait, strong presence, refined contemporary mood",
      "{trigger}, modern creator-style portrait, aesthetic editorial tone, minimal yet impactful vibe",
      "{trigger}, expressive creative portrait composition, visually stylized cinematic texture",
      "{trigger}, striking artistic portrait, emotional personality emphasis, polished creative realism",
      "{trigger}, editorial-inspired modern portrait, subtle dramatic tone, creative visual identity",
      "{trigger}, premium creator portrait session, cinematic creative energy, refined artistic presence"
    ]
  }
};

// ============================================================================
// Selección de prompts para generación
// ============================================================================

export function getPromptsForPack(
  gender: "man" | "woman",
  count: number,
  style: string
) {
  const source =
    PROMPT_COLLECTION[gender][style as keyof typeof PROMPT_COLLECTION["woman"]];

  let finalSource = source;
  while (finalSource.length < count) {
    finalSource = finalSource.concat(source);
  }

  const shuffled = [...finalSource].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
