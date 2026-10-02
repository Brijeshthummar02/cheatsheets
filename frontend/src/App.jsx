import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from './context/LanguageContext';
import RouteAnnouncer from './components/RouteAnnouncer';
import SiteFooter from './components/SiteFooter';
import { TOPICS } from './lib/topics';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const SectionPage = lazy(() => import('./pages/SectionPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div role="status" className="soft-in flex min-h-[60dvh] flex-1 items-center justify-center px-4">
    <div className="space-y-4 text-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-hidden="true" />
      <p className="text-sm tracking-wide text-foreground/75 md:text-base">Loading...</p>
      <span className="sr-only">Loading page</span>
    </div>
  </div>
);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Keyed on the first path segment only: moving between chapters of one topic keeps the page
// mounted (no skeleton flash, sidebar state kept); moving between topics replays the transition.
const PageWrapper = ({ children }) => {
  const { pathname } = useLocation();
  const section = pathname.split('/')[1] || '/';

  return (
    <div key={section} className="page-transition flex flex-1 flex-col">
      {children}
    </div>
  );
};

const page = (element) => <PageWrapper>{element}</PageWrapper>;

const toasterStyle = {
  '--normal-bg': 'hsl(var(--card))',
  '--normal-border': 'hsl(var(--border))',
  '--normal-text': 'hsl(var(--foreground))',
  '--border-radius': '0.75rem',
  fontFamily: "'Manrope', sans-serif",
};

// Keeps toasts clear of the sticky header (and the notch) so they never cover its controls.
const toastOffset = 'calc(var(--header-h) + env(safe-area-inset-top) + 0.5rem)';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, '') || undefined}>
        <div className="App flex min-h-dvh flex-col">
          <div className="site-aura" aria-hidden="true" />
          <a href="#main-content" className="skip-link focus-ring">
            Skip to main content
          </a>
          <ScrollToTop />
          <RouteAnnouncer />

          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={page(<HomePage />)} />
              {Object.values(TOPICS).map(({ id, path }) => (
                <Route key={id} path={`${path}/:sectionId?`} element={page(<SectionPage type={id} />)} />
              ))}
              <Route path="*" element={page(<NotFoundPage />)} />
            </Routes>
          </Suspense>

          <SiteFooter />
        </div>
      </BrowserRouter>

      <Toaster
        position="top-center"
        offset={toastOffset}
        mobileOffset={toastOffset}
        closeButton
        visibleToasts={2}
        style={toasterStyle}
        toastOptions={{ className: 'shadow-overlay' }}
      />
    </LanguageProvider>
  );
}

export default App;
