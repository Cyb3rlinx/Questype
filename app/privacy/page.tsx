'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { SiteHeader, SiteFooter } from '@/components/journey/chrome';
import { requestJson } from '@/lib/client-api';
import { useLocale } from '@/components/i18n-provider';
export default function PrivacyPage() {
  const { locale } = useLocale();
  const es = locale === 'es';
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function remove() {
    setBusy(true);
    try {
      await requestJson('/api/session', 'DELETE');
      router.push('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <>
      <SiteHeader compact />
      <main id="main" className="privacy-page page-width">
        <ShieldCheck size={34} strokeWidth={1} />
        <span className="eyebrow">{es ? 'TU HISTORIA TE PERTENECE' : 'YOUR STORY BELONGS TO YOU'}</span>
        <h1>
          {es ? 'Privacidad y' : 'Privacy &'}<br />
          <em>{es ? 'tus decisiones.' : 'your choices.'}</em>
        </h1>
        <section>
          <h2>{es ? 'Un lugar privado para explorar' : 'A private place to explore'}</h2>
          <p>
            {es ? 'Tu nombre opcional, la representación de tu personaje, las elecciones de la historia y los resultados se guardan para que puedas continuar tu viaje. No se requiere cuenta, correo electrónico ni información de contacto.' : 'Your optional name, character representation, story choices and results are saved so you can continue your journey. No account, email address or contact information is required.'}
          </p>
          <h2>{es ? 'Regresar a tu viaje' : 'Returning to your journey'}</h2>
          <p>
            {es ? 'Una cookie privada del navegador te permite volver al progreso y los resultados guardados. Si borras esa cookie o cambias de navegador, perderás el acceso a este viaje anónimo. Tus elecciones se guardan en el servidor.' : 'A private browser cookie lets you return to saved progress and results. Clearing that cookie or switching browsers removes access to this anonymous journey. Your choices are stored on the server, not in browser storage.'}
          </p>
          <h2>{es ? 'Compartir es tu decisión' : 'Sharing is your choice'}</h2>
          <p>
            {es ? 'Un enlace compartido incluye el título de tu personaje, los arquetipos que selecciones y una breve reflexión. Tu nombre queda fuera a menos que decidas incluirlo. Las elecciones originales y los patrones privados bajo presión nunca forman parte del resultado compartido. Puedes revocar el enlace desde la página de resultados.' : 'A share link includes your character title, the archetypes you select and a short reflection. Your name is left out unless you choose to include it. Raw choices and private pressure patterns are never part of a shared result. You can revoke the link from the result page.'}
          </p>
          <h2>{es ? 'Una herramienta para reflexionar' : 'A tool for reflection'}</h2>
          <p>
            {es ? 'Tu resultado proviene del modelo determinista de puntuación de la historia y de una interpretación seleccionada. Está diseñado para la reflexión personal y el entretenimiento; no ofrece diagnósticos psicológicos ni médicos. Ningún servicio externo de IA recibe tus respuestas en esta versión.' : 'Your result comes from the story’s deterministic scoring model and a curated interpretation. It is designed for self-reflection and entertainment and does not provide psychological or medical diagnosis. No external AI service receives your answers in this version.'}
          </p>
          <h2>{es ? 'Un nuevo comienzo' : 'A fresh start'}</h2>
          <p>
            {es ? 'Elimina todos los viajes y resultados guardados para este navegador. También se borrarán sus enlaces compartidos. Los informes y tarjetas descargados permanecerán donde los hayas guardado.' : 'Delete all journeys and results saved for this browser. This also removes their share links. Downloaded reports and cards remain wherever you saved them.'}
          </p>
          <button
            className="button button-outline"
            onClick={() => setOpen(true)}
          >
            <Trash2 size={16} />
            {es ? 'Eliminar los datos de mi viaje' : 'Delete my journey data'}
          </button>
        </section>
      </main>
      <SiteFooter />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="story-dialog">
          <AlertDialogTitle className="dialog-heading">
            {es ? '¿Dejar atrás estas historias?' : 'Leave these stories behind?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {es ? 'Se eliminarán todos los viajes, resultados y enlaces compartidos de este navegador. Esta acción no se puede deshacer.' : 'All journeys, results and share links for this browser will be deleted. This cannot be undone.'}
          </AlertDialogDescription>
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <AlertDialogCancel className="button button-outline">
              {es ? 'Conservar mis historias' : 'Keep my stories'}
            </AlertDialogCancel>
            <button
              className="button button-gold"
              disabled={busy}
              onClick={remove}
            >
              {busy ? (es ? 'Eliminando…' : 'Deleting…') : (es ? 'Eliminar mis datos' : 'Delete my data')}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
