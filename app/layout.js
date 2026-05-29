import { Inter } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: 'Bicicleteada · Seguimiento en Tiempo Real',
  description: 'Sistema de seguimiento GPS en tiempo real para circuitos de ciclismo. Visualiza las rutas y la posición de los participantes.',
  keywords: 'ciclismo, bicicleta, GPS, tiempo real, mapa, seguimiento',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  );
}
