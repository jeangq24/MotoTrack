import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://moto-track-seven.vercel.app'), // Replace with actual domain when launched
  title: {
    default: 'MotoTrack | Historial de Servicios para Conductores',
    template: '%s | MotoTrack'
  },
  description: 'App financiera gratis para registrar domicilios, envíos, y calcular ganancias libres diarias de conductores de moto.',
  keywords: ['mototrack', 'conductores', 'domiciliarios', 'finanzas personales', 'registro de carreras', 'rappi', 'uber moto', 'gastos de moto'],
  authors: [{ name: 'JGDev', url: 'https://www.linkedin.com/in/jeangarzon/' }],
  creator: 'JGDev',
  publisher: 'MotoTrack',
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://moto-track-seven.vercel.app',
    title: 'MotoTrack — El copiloto financiero para motos',
    description: 'Registra tus servicios, controla gasolina y obtén tu ganancia neta en menos de 3 toques.',
    siteName: 'MotoTrack',
    images: [{
      // Add an empty placeholder image array or link your brand logo here when ready
      url: '/icon-512.png',
      width: 512,
      height: 512,
      alt: 'MotoTrack Logo'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MotoTrack | Historial y Finanzas de Moto',
    description: 'La app gratuita y rápida para llevar cuentas de tus domicilios y carreras.',
    images: ['/logo_mototrack.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MotoTrack',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.className}>
      <body className="bg-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
