export default function Footer() {
    return (
      <footer className="mt-20 border-t border-white/10 bg-neutral-900/90 text-gray-200">
        
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/blog" className="hover:text-white">Blog</a></li>
              <li><a href="/reviews" className="hover:text-white">Reseñas</a></li>
              <li><a href="/pricing" className="hover:text-white">Precios</a></li>
              <li><a href="/contact" className="hover:text-white">Contacto</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/refund-policy" className="hover:text-white">Política de reembolso</a></li>
              <li><a href="/security-policy" className="hover:text-white">Política de seguridad</a></li>
              <li><a href="/terms" className="hover:text-white">Condiciones de uso</a></li>
              <li><a href="marketing/privacidad/" className="hover:text-white">Política de privacidad</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Actualizaciones</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/changelog" className="hover:text-white">Registro de cambios</a></li>
              <li><a href="/breaking-changes" className="hover:text-white">Cambios críticos</a></li>
              <li><a href="/status" className="hover:text-white">Página de estado</a></li>
            </ul>
          </div>
  
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="sections/HelpSection" className="hover:text-white">Centro de ayuda</a></li>
              <li><a href="/faq" className="hover:text-white">Preguntas frecuentes</a></li>
              <li><a href="/support" className="hover:text-white">Soporte técnico</a></li>
            </ul>
          </div>
  
        </div>
  
        {/* Divider Line */}
        <div className="border-t border-white/10"></div>
  
        {/* COPYRIGHT SECTION */}
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm flex flex-col md:flex-row justify-between gap-2">
  
          <span className="text-gray-400">
            Copyright © 2025 AuraShot AI — Todos los derechos reservados.
          </span>
  
          <span className="text-gray-300">
            <a href="marketing/terminos/" className="hover:text-white underline">
              Términos y Condiciones
            </a>
            {" "} & {" "}
            <a href="marketing/privacidad/" className="hover:text-white underline">
              Política de privacidad
            </a>
          </span>
  
        </div>
  
      </footer>
    );
  }
  