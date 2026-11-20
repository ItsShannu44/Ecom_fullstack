import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import Header from '@/components/Header';

export const metadata = { title: 'MiniStore', description: 'Full-stack store' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}