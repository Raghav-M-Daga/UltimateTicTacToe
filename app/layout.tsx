// app/layout.tsx (App Router)
import './globals.css'
import { Fredoka } from 'next/font/google';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '700'] });

export const metadata = {
  title: 'Tic Tac Toe',
  description: 'Stylish X and O game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fredoka.className}>{children}</body>
    </html>
  );
}
