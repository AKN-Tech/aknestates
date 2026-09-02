import { RouterProvider, useRouter } from '@/lib/router';
import { SavedProvider } from '@/lib/saved-context';
import { AdminAuthProvider } from '@/lib/admin-auth';
import { SettingsProvider } from '@/lib/settings-context';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { HomePage } from '@/pages/HomePage';
import { BuyPage } from '@/pages/BuyPage';
import { RentPage } from '@/pages/RentPage';
import { SellPage } from '@/pages/SellPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { SavedPage } from '@/pages/SavedPage';
import { ContactPage } from '@/pages/ContactPage';
import { AdminRoute } from '@/pages/admin/AdminRoute';

function PublicPages() {
  const { route } = useRouter();

  switch (route.name) {
    case 'home':
      return <HomePage />;
    case 'buy':
      return <BuyPage />;
    case 'rent':
      return <RentPage />;
    case 'sell':
      return <SellPage />;
    case 'calculator':
      return <CalculatorPage />;
    case 'saved':
      return <SavedPage />;
    case 'contact':
      return <ContactPage />;
    default:
      return <HomePage />;
  }
}

function AppContent() {
  const { route } = useRouter();

  // Admin route has its own full-screen layout — no public header/footer
  if (route.name === 'admin') {
    return <AdminRoute />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream-100">
      <Header />
      <main className="flex-1">
        <PublicPages />
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AdminAuthProvider>
        <SettingsProvider>
          <SavedProvider>
            <AppContent />
          </SavedProvider>
        </SettingsProvider>
      </AdminAuthProvider>
    </RouterProvider>
  );
}

export default App;
