// app/api/generate/route.js
import { NextResponse } from "next/server";
import Replicate from "replicate";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🧱 Helper: construir descripción a partir de las selecciones tipo Aragon,
// con lenguaje más natural y fotográfico.
function buildSelectionDescription(selections) {
  if (!selections) return "";

  // 👇 Soportamos tanto singular (attire/background) como arrays (attires/backgrounds)
  const {
    gender,
    ageRange,
    hairColor,
    hairLength,
    hairStyle,
    ethnicity,
    bodyType,
    attire: singleAttire,
    background: singleBackground,
    attires,
    backgrounds,
    styleCategory,
  } = selections;

  const attire =
    singleAttire ||
    (Array.isArray(attires) && attires.length > 0 ? attires[0] : undefined);
  const background =
    singleBackground ||
    (Array.isArray(backgrounds) && backgrounds.length > 0
      ? backgrounds[0]
      : undefined);

  // --- MAPEOS A FRASES MÁS NATURALES ---

  const ageMap = {
    "18_20": "in their late teens",
    "21_24": "in their early twenties",
    "25_29": "in their mid to late twenties",
    "30_40": "in their thirties",
    "41_50": "in their forties",
    "51_65": "in their fifties or early sixties",
    "65_plus": "in their late sixties or older",
  };

  const genderMap = {
    man: "man",
    woman: "woman",
    non_binary: "non-binary person",
  };

  const ethnicityMap = {
    white: "with white / caucasian features",
    black: "with black / african descent features",
    east_asian: "with east asian features",
    hispanic: "with hispanic / latino features",
    middle_eastern: "with middle eastern / north african features",
    multiracial: "with mixed or multiracial features",
    pacific_islander: "with pacific islander features",
    southeast_asian: "with south east asian features",
    south_asian: "with south asian features",
    other: "with mixed or hard-to-place ethnicity",
  };

  const hairColorMap = {
    brown: "brown",
    black: "black",
    blonde: "blonde",
    gray: "gray",
    auburn: "auburn",
    red: "red",
    white: "white",
    other: "dyed",
    bald: "bald",
  };

  const hairLengthMap = {
    bald: "bald",
    buzz: "very short buzz cut",
    short: "short length",
    medium: "medium length",
    long: "long length",
  };

  const hairStyleMap = {
    straight: "straight",
    wavy: "wavy",
    curly: "curly",
    locs: "dreadlocks",
  };

  const bodyMap = {
    slim: "a slim build",
    regular: "an average build",
    athletic: "an athletic build",
    medium_large: "a medium-large build",
    large: "a large build",
    plus_size: "a plus-size build",
  };

  // 🔥 Atuendo más explícito
  const attireMap = {
    business_formal:
      "a dark formal suit with dress shirt and tie, polished corporate look",
    business_casual:
      "a blazer with an open-collar shirt, no tie, slightly relaxed but still professional",
    smart_casual:
      "a well-fitted shirt or lightweight sweater, no suit jacket and no tie, elegant but informal",
  };

  // Fondos adaptados al estilo
  function getBackgroundPhrase(background, styleCategory) {
    const professional = {
      city: "a city background with soft depth of field (professional headshot look)",
      nature: "a natural outdoor background with soft cinematic blur",
      office: "a bright modern office background with subtle bokeh",
      studio: "a professional clean studio background",
    };

    const dating = {
      city: "an urban city scene where the environment remains visible and recognizable",
      nature: "a natural outdoor setting where the surroundings add to the mood",
      office: "an indoor setting with environmental context visible",
      studio: "a cozy indoor environment with soft natural ambience",
    };

    const lifestyle = {
      city: "a lifestyle urban environment that contributes to the story of the image",
      nature: "a scenic outdoor environment as a key visual element",
      office: "a real work or creative environment with visible surroundings",
      studio: "a lifestyle indoor setting that feels natural and lived-in",
    };

    const social = {
      city: "a stylized city environment with partial depth of field",
      nature: "an outdoor environment with balanced background detail",
      office: "an aesthetic indoor setting with soft but readable background",
      studio: "a creative studio environment with modern visual mood",
    };

    const maps = {
      Professional: professional,
      Dating: dating,
      Lifestyle: lifestyle,
      Social: social,
    };

    return background && styleCategory && maps[styleCategory]?.[background]
      ? maps[styleCategory][background]
      : "";
  }

  const styleMap = {
    Professional: "framed as a professional LinkedIn-style headshot",
    Dating: "framed as a modern dating app profile photo",
    Social: "framed as a polished social media portrait",
    Lifestyle: "framed as a cinematic lifestyle portrait",
  };

  // --- CONSTRUCCIÓN DE FRASES ---

  const subjectBits = [];
  if (gender && genderMap[gender]) subjectBits.push(genderMap[gender]);
  if (ageRange && ageMap[ageRange]) subjectBits.unshift(ageMap[ageRange]);

  let subjectPhrase = subjectBits.length ? subjectBits.join(" ") : "";

  let ethnicityPhrase =
    ethnicity && ethnicityMap[ethnicity] ? ethnicityMap[ethnicity] : "";

  let hairPhrase = "";
  if (hairColor === "bald" || hairLength === "bald") {
    hairPhrase = "bald head";
  } else {
    const hairBits = [];
    if (hairColor && hairColorMap[hairColor]) hairBits.push(hairColorMap[hairColor]);
    if (hairLength && hairLengthMap[hairLength]) hairBits.push(hairLengthMap[hairLength]);
    if (hairStyle && hairStyleMap[hairStyle]) hairBits.push(hairStyleMap[hairStyle]);
    if (hairBits.length) hairPhrase = hairBits.join(" ") + " hair";
  }

  let bodyPhrase =
    bodyType && bodyMap[bodyType] ? bodyMap[bodyType] : "";

  let attirePhrase =
    attire && attireMap[attire] ? attireMap[attire] : "";

  let backgroundPhrase = getBackgroundPhrase(background, styleCategory);

  let stylePhrase =
    styleCategory && styleMap[styleCategory] ? styleMap[styleCategory] : "";

  const segments = [];
  if (subjectPhrase) segments.push(subjectPhrase);
  if (ethnicityPhrase) segments.push(ethnicityPhrase);
  if (hairPhrase) segments.push(`with ${hairPhrase}`);
  if (bodyPhrase) segments.push(`and ${bodyPhrase}`);
  if (attirePhrase) segments.push(`dressed in ${attirePhrase}`);
  if (backgroundPhrase) segments.push(`set against ${backgroundPhrase}`);
  if (stylePhrase) segments.push(stylePhrase);

  if (!segments.length) return "";
  return segments.join(", ");
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { prompt, trainingId, selections } = body;

    console.log("=== GENERANDO PARA:", userId, "===");

    // 0️⃣ Leer perfil guardado del usuario (rasgos base)
    const { data: profileRow } = await supabaseAdmin
      .from("user_profile")
      .select(
        "gender, age_range, hair_color, hair_length, hair_style, ethnicity, body_type"
      )
      .eq("user_id", userId)
      .maybeSingle();

    // Mezclamos: LOS RASGOS FÍSICOS SIEMPRE VIENEN DE LA DB si existen.
    // Del cliente solo confiamos en atuendo / fondo / styleCategory.
    const mergedSelections = {
      gender:    profileRow?.gender      ?? selections?.gender,
      ageRange:  profileRow?.age_range   ?? selections?.ageRange,
      hairColor: profileRow?.hair_color  ?? selections?.hairColor,
      hairLength:profileRow?.hair_length ?? selections?.hairLength,
      hairStyle: profileRow?.hair_style  ?? selections?.hairStyle,
      ethnicity: profileRow?.ethnicity   ?? selections?.ethnicity,
      bodyType:  profileRow?.body_type   ?? selections?.bodyType,

      // Estas sí las dejamos al front porque son “configuración de la sesión”
      attire:       selections?.attire       ?? null,
      background:   selections?.background   ?? null,
      styleCategory:selections?.styleCategory ?? "Professional",
    };

    console.log("[generate] mergedSelections:", mergedSelections);

    // 1️⃣ Verificar créditos
    const { data: creditData } = await supabaseAdmin
      .from("user_credits")
      .select("credits")
      .eq("user_id", userId)
      .single();

    if (!creditData || creditData.credits < 1) {
      return NextResponse.json(
        { error: "No tienes créditos." },
        { status: 403 }
      );
    }

    // 2️⃣ Obtener LoRA (.tar) desde DB
    const { data: lastModel } = await supabaseAdmin
      .from("predictions")
      .select("lora_url")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastModel?.lora_url) {
      return NextResponse.json(
        { error: "No se encontró LoRA entrenado para este usuario." },
        { status: 400 }
      );
    }

    const loraWeights = lastModel.lora_url;
    console.log("🎯 LoRA TAR usado:", loraWeights);

    // 3️⃣ Obtener trigger_word
    let triggerWord = null;

    if (trainingId) {
      const { data: pred } = await supabaseAdmin
        .from("predictions")
        .select("trigger_word")
        .eq("training_id", trainingId)
        .eq("user_id", userId)
        .single();

      triggerWord = pred?.trigger_word || null;
    }

    if (!triggerWord) {
      const { data: lastPred } = await supabaseAdmin
        .from("predictions")
        .select("trigger_word")
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      triggerWord = lastPred?.trigger_word || "tok_user";
    }

    console.log("🧬 Trigger detectado:", triggerWord);

    // 4️⃣ Prompt base + descripción desde mergedSelections
    const basePrompt =
      prompt && prompt.length
        ? prompt
        : "Ultra detailed portrait of {trigger}, photorealistic, 4k soft lighting";

    const selectionDescription = buildSelectionDescription(mergedSelections);

    const mergedPrompt = selectionDescription
      ? `${basePrompt}, ${selectionDescription}`
      : basePrompt;

    const finalPrompt = mergedPrompt.replaceAll("{trigger}", triggerWord);

    console.log("📝 Prompt final:", finalPrompt);

    // 5️⃣ INPUT REAL PARA FLUX
    const input = {
      prompt: finalPrompt,
      lora_weights: loraWeights,
      lora_scale: 0.9,
      num_outputs: 1,
      guidance: 3,
      num_inference_steps: 28,
      aspect_ratio: "1:1",
      megapixels: "1",
      output_format: "png",
      go_fast: true,
    };

    console.log("🚀 Ejecutando flux-dev-lora...");

    const output = await replicate.run("black-forest-labs/flux-dev-lora", {
      input,
    });

    const tempUrl =
      Array.isArray(output)
        ? output[0]
        : output?.images
        ? output.images[0]
        : output;

    console.log("⬇️ Descargando imagen generada:", tempUrl);

    const res = await fetch(tempUrl);
    const buffer = Buffer.from(await res.arrayBuffer());

    const fileName = `${userId}/${Date.now()}.png`;

    await supabaseAdmin.storage
      .from("generated_images")
      .upload(fileName, buffer, {
        contentType: "image/png",
      });

    const { data: publicData } = supabaseAdmin.storage
      .from("generated_images")
      .getPublicUrl(fileName);

    const finalImageUrl = publicData.publicUrl;

    // Registrar y descontar créditos
    await supabaseAdmin.from("generated_images").insert({
      user_id: userId,
      image_url: finalImageUrl,
    });

    await supabaseAdmin
      .from("user_credits")
      .update({ credits: creditData.credits - 1 })
      .eq("user_id", userId);

    return NextResponse.json({
      imageUrl: finalImageUrl,
      remainingCredits: creditData.credits - 1,
    });
  } catch (error) {
    console.error("❌ ERROR GENERATE:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
