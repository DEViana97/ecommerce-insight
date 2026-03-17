import type { Metadata } from 'next';
import StyledComponentsRegistry from '../styles/StyledComponentsRegistry';
import ThemeProvider from '../components/ThemeProvider';
import QueryProvider from '../components/QueryProvider';
import AuthBootstrap from '../components/AuthBootstrap';

export const metadata: Metadata = {
  title: 'E-commerce Insight | Analytics Dashboard',
  description: 'Professional e-commerce analytics dashboard for monitoring sales, conversions, and revenue metrics.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry>
          <QueryProvider>
            <ThemeProvider>
              <AuthBootstrap />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
