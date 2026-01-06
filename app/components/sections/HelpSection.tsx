"use client";

export function HelpSection() {
  return (
    <section
      id="help"
      className="max-w-4xl mx-auto mb-24 px-4 text-center"
    >
      <div className="rounded-3xl bg-white/90 border border-gray-100 shadow-[0_18px_60px_rgba(0,0,0,0.06)] px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          ¿Necesitás ayuda con GlowShot?
        </h2>

        <p className="text-gray-600 mb-5 max-w-2xl mx-auto text-sm md:text-base">
          Si tenés dudas sobre cómo subir tus fotos, entrenar el modelo
          o elegir el plan correcto, escribinos y te respondemos lo antes
          posible.
        </p>

        <button
          className="bg-gray-900 text-white rounded-full px-6 py-2.5 text-sm font-semibold hover:bg-black transition"
          onClick={() =>
            alert(
              "Más adelante acá conectamos un formulario o un chat 😉"
            )
          }
        >
          Contactar soporte
        </button>
      </div>
    </section>
  );
}
