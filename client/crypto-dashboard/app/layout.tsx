import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../src/context/AuthContext';

export const metadata: Metadata = {
  title: 'Coinly | Crypto market dashboard',
  description: 'Track crypto prices, compare market trends, and keep an eye on the assets you care about.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}