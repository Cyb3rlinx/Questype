import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Archetype — The Unwritten Road',
    template: '%s · Archetype',
  },
  description:
    'Step into an interactive fantasy story. Discover the archetypes, strengths and motivations revealed by your choices.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
