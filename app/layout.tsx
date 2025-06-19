// app/layout.tsx (App Router)
import './globals.css'
import { Fredoka } from 'next/font/google';
import { AuthProvider } from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata = {
  title: 'Ultimate Tic Tac Toe',
  description: 'A modern take on the classic game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
