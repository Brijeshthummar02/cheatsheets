import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Toaster } from 'sonner';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const SectionPage = lazy(() => import('./pages/SectionPage'));

// Smooth loading fallback component with fade animation
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-4 soft-in">
    <div className="text-center space-y-4">
      <div className="mx-auto h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <p className="text-sm md:text-base text-foreground/70 tracking-wide">Loading chapter...</p>
    </div>
  </div>
);

// Scroll restoration component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({
      top: 0,
      behavior: 'instant' // Use instant for faster perceived navigation
    });
  }, [pathname]);

  return null;
};

// Page transition wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      {children}
    </div>
  );
};

const OpenSourceFooter = () => (
  <footer className="mt-auto border-t border-border/55 bg-background/80 px-4 py-5 backdrop-blur-sm">
    <div className="mx-auto flex max-w-7xl justify-center">
      <div className="flex items-center gap-3 rounded-full border border-border/75 bg-background/90 px-4 py-2 text-xs shadow-lg">
        <span className="font-medium text-foreground/85">Built with ❤️ for open source devs</span>
        <a
          href="https://github.com/Brijeshthummar02/cheatsheets"
          target="_blank"
          rel="noreferrer"
          aria-label="Open GitHub repository"
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/80 px-3 py-1 font-semibold text-foreground/80 transition-colors hover:bg-muted/70 hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          Star this repo
        </a>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="App min-h-screen flex flex-col">
          <div className="site-aura" aria-hidden="true" />

          {/* Scroll restoration */}
          <ScrollToTop />

          {/* Skip link for keyboard accessibility */}
          <a href="#main-content" className="skip-link focus-ring">
            Skip to main content
          </a>

          <main className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={
                  <PageWrapper>
                    <HomePage />
                  </PageWrapper>
                } />

                {/* Java cheatsheet routes */}
                <Route path="/java" element={
                  <PageWrapper>
                    <SectionPage type="java" />
                  </PageWrapper>
                } />
                <Route path="/java/:sectionId" element={
                  <PageWrapper>
                    <SectionPage type="java" />
                  </PageWrapper>
                } />

                {/* Spring Boot cheatsheet routes */}
                <Route path="/springboot" element={
                  <PageWrapper>
                    <SectionPage type="springboot" />
                  </PageWrapper>
                } />
                <Route path="/springboot/:sectionId" element={
                  <PageWrapper>
                    <SectionPage type="springboot" />
                  </PageWrapper>
                } />

                {/* DSA cheatsheet routes */}
                <Route path="/dsa" element={
                  <PageWrapper>
                    <SectionPage type="dsa" />
                  </PageWrapper>
                } />
                <Route path="/dsa/:sectionId" element={
                  <PageWrapper>
                    <SectionPage type="dsa" />
                  </PageWrapper>
                } />

                {/* Git & GitHub cheatsheet routes */}
                <Route path="/git" element={
                  <PageWrapper>
                    <SectionPage type="git" />
                  </PageWrapper>
                } />
                <Route path="/git/:sectionId" element={
                  <PageWrapper>
                    <SectionPage type="git" />
                  </PageWrapper>
                } />
              </Routes>
            </Suspense>
          </main>

          <OpenSourceFooter />
        </div>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            borderRadius: '0.9rem',
            boxShadow: '0 18px 32px -26px rgba(48, 54, 79, 0.6)',
          },
          className: 'font-body',
        }}
      />
    </LanguageProvider>
  );
}

export default App;