// app/marketing/privacidad/page.tsx
import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/marketing"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Volver al inicio
          </Link>
          <span className="text-lg font-semibold">
            GlowShot<span className="text-orange-500">.ai</span>
          </span>
        </header>

        <article className="prose prose-sm sm:prose lg:prose-lg max-w-none">
          <h1>Política de Privacidad de GlowShot AI</h1>
          <p>
            <strong>Última actualización:</strong> 1 de abril de 2026
          </p>

          <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
{`# Política de Privacidad de GlowShot AI

Última actualización: 1 de enero de 2026

En GlowShot AI respetamos tu privacidad y nos comprometemos a proteger tus datos personales.  
Esta Política de Privacidad explica qué información recopilamos, cómo la utilizamos y qué opciones tienes sobre su tratamiento.

Al utilizar nuestro sitio web y nuestros servicios de generación de retratos con IA (el “Servicio”), aceptas las prácticas descritas en esta Política.

## 1. Datos que recopilamos

Podemos recopilar las siguientes categorías de datos:

### 1.1 Datos de cuenta e identificación

- Nombre, correo electrónico u otros datos proporcionados a través de proveedores de autenticación.
- Identificador interno de usuario generado por nuestras bases de datos.

### 1.2 Imágenes y contenido

- Fotografías que subes para entrenar el modelo (“Imágenes de origen”).
- Imágenes generadas por la IA a partir de tus fotos.
- Metadatos técnicos asociados (por ejemplo, fechas de creación, identificadores de entrenamiento).

### 1.3 Datos de uso

- Información sobre cómo utilizas el Servicio (páginas visitadas, botones pulsados, fechas y horas).
- Registros técnicos (logs) para seguridad y diagnóstico (dirección IP, tipo de dispositivo, navegador, etc.).

### 1.4 Datos de pago

- No almacenamos directamente los datos completos de tu tarjeta de crédito.  
  Los pagos se procesan mediante proveedores de pagos externos (por ejemplo, Paddle), que actúan como responsables del tratamiento de esos datos.  
- Podemos recibir información limitada relacionada con el pago: estado de la transacción, importe, moneda, identificador del pedido y, a veces, el país de facturación.

## 2. Para qué utilizamos tus datos

Utilizamos tus datos personales para:

1. **Prestar el Servicio**  
   - Crear y gestionar tu cuenta.  
   - Entrenar modelos de IA personalizados con tus Imágenes de origen.  
   - Generar y mostrar Imágenes generadas.  

2. **Mejorar el producto y la experiencia de usuario**  
   - Analizar patrones de uso de forma agregada y anónima cuando sea posible.  
   - Corregir errores y optimizar el rendimiento.

3. **Facturación y contabilidad**  
   - Procesar pagos y gestionar créditos o paquetes.  
   - Cumplir nuestras obligaciones legales y fiscales.

4. **Seguridad y prevención de abuso**  
   - Detectar y prevenir fraudes, usos ilegales o violaciones de estos Términos y de esta Política.

5. **Comunicaciones**  
   - Enviarte correos relacionados con el funcionamiento del Servicio (confirmaciones, avisos importantes, cambios relevantes, soporte).  
   - Ocasionalmente, enviarte novedades sobre funciones o promociones, siempre respetando las normas de comunicaciones comerciales aplicables.

## 3. Bases legales para el tratamiento

Dependiendo de tu ubicación, tratamos tus datos personales sobre la base de:

- La ejecución de un contrato (prestación del Servicio que has solicitado).  
- Nuestro interés legítimo en mejorar y proteger el Servicio.  
- El cumplimiento de obligaciones legales (por ejemplo, registros contables).  
- Tu consentimiento, cuando resulte necesario (por ejemplo, para ciertas comunicaciones de marketing).

## 4. Proveedores y terceros

Para prestar el Servicio utilizamos proveedores externos que pueden tratar tus datos en nuestro nombre (“encargados del tratamiento”), tales como:

- **Proveedores de autenticación** (Clerk) para registro e inicio de sesión.
- **Proveedores de infraestructura y base de datos** (Supabase) para almacenar información de usuarios, créditos, imágenes y modelos.
- **Proveedores de IA** (Replicate) para el entrenamiento y la generación de imágenes mediante modelos de IA.
- **Proveedores de pago** (Paddle) para procesar pagos y gestionar facturación.
- **Servicios de analítica o monitorización**, si los utilizamos (herramientas de métricas o rendimiento).

Estos proveedores solo tienen acceso a los datos necesarios para realizar sus funciones y están obligados a protegerlos conforme a contratos y la legislación aplicable.

En algunos casos, dichos proveedores pueden estar ubicados en otros países. Tomaremos medidas razonables para garantizar que exista un nivel adecuado de protección de datos.

## 5. Conservación de los datos

Conservamos tus datos personales durante el tiempo necesario para:

- Prestar el Servicio y gestionar tu cuenta.  
- Cumplir nuestras obligaciones legales (obligaciones fiscales y contables).  
- Resolver disputas y hacer cumplir nuestros acuerdos.

Puedes solicitar la eliminación de tu cuenta y de tus datos personales, como se explica en la sección 7, sujeto a las limitaciones legales que puedan obligarnos a conservar cierta información durante más tiempo.

## 6. Seguridad

Tomamos medidas técnicas y organizativas razonables para proteger tus datos personales frente a accesos no autorizados, pérdida, destrucción o alteración.

Sin embargo, ningún sistema es completamente seguro. No podemos garantizar una seguridad absoluta, pero nos comprometemos a actuar con diligencia y a notificar incidentes de seguridad relevantes cuando la ley así lo exija.

## 7. Tus derechos

Dependiendo de tu ubicación y de la legislación aplicable, puedes tener los siguientes derechos:

- Acceder a los datos personales que tenemos sobre ti.
- Rectificar datos inexactos o incompletos.
- Solicitar la eliminación de tus datos (“derecho al olvido”), cuando sea legalmente posible.
- Oponerte a determinados tratamientos o solicitar su limitación.
- Solicitar la portabilidad de tus datos en un formato estructurado y legible.
- Retirar tu consentimiento cuando el tratamiento se base en él.

Para ejercer tus derechos, puedes escribirnos al correo indicado en la sección 9. Es posible que te pidamos información adicional para verificar tu identidad antes de responder.

## 8. Cookies y tecnologías similares

Podemos utilizar cookies u otras tecnologías de seguimiento para:

- Recordar tus preferencias de sesión.  
- Mejorar la experiencia de navegación.  
- Recopilar estadísticas de uso de forma agregada.

En la medida en que la legislación lo requiera, te mostraremos un aviso de cookies donde podrás aceptar o rechazar determinadas categorías.

## 9. Contacto

Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos, puedes contactarnos en:

**Email de soporte y privacidad:** tekkioar@gmail.com

Intentaremos responder a tus solicitudes en un plazo razonable y de acuerdo con la normativa aplicable.

## 10. Cambios en esta Política

Podemos actualizar esta Política de Privacidad de vez en cuando para reflejar cambios en el Servicio, en la normativa o en nuestros procesos internos.

Cuando los cambios sean relevantes, intentaremos notificarlo de forma clara en el sitio web o por correo electrónico.  
El uso continuado del Servicio tras la publicación de la nueva versión implicará la aceptación de la Política actualizada.
`}
          </pre>
        </article>
      </div>
    </main>
  );
}
