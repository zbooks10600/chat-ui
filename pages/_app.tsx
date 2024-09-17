import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useEffect } from 'react';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import '@/styles/globals.css';
import { getDatabase, importData, inspectImportedData } from '@/src/database';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initDB = async () => {
        try {
          const db = await getDatabase();
          console.log('Database initialized:', db);
          await importData();
          console.log('Data import completed');
          await inspectImportedData(db);
        } catch (error) {
          console.error('Error initializing database or importing data:', error);
        }
      };

      initDB();
    }
  }, []);

  return (
    <div className={inter.className}>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(App);