import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'; // Use v14-appRouter if Next.js version is < 15
import { ThemeProvider, CssBaseline } from '@mui/material';
import AppLayout from '@/components/AppLayout';
import { theme } from '@/config/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The CacheProvider intercepts MUI's styles on the server and moves them to the <head> */}
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kicks off an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <AppLayout>
              {children}
            </AppLayout>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}