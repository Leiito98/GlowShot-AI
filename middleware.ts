import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Mantenemos el matcher por si quieres usarlo en el futuro, 
// pero no forzaremos la redirección aquí para la API.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Protege el dashboard si quieres
  // '/api(.*)',    // COMENTADO: Dejamos que la API maneje su propia seguridad
]);

export default clerkMiddleware(async (auth, req) => {
  // Eliminamos la línea (await auth()).protect();
  // Al hacer esto, el middleware pasa la sesión a la API, 
  // pero si no hay usuario, NO redirige ni bloquea.
  // Dejamos que route.js lance el error 401 si es necesario.
  
  // Solo logueamos para ver que pasa (opcional)
  // console.log("Middleware pasando:", req.url);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};