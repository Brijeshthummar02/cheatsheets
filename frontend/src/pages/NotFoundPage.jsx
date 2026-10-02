import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Header from '../components/Header';
import { Button } from '../components/ui/button';
import { TOPICS } from '../lib/topics';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const NotFoundPage = () => {
  useDocumentTitle('Page not found');

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="page-container flex-1 py-12 outline-hidden md:py-20">
        <div className="surface-card soft-in mx-auto max-w-2xl p-6 text-center sm:p-10">
          <p className="eyebrow">Error 404</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground sm:text-4xl">Page not found</h1>
          <p className="mx-auto mt-3 max-w-prose text-base text-foreground/80">
            That page doesn&apos;t exist or has moved. Head back home or jump straight into a cheatsheet.
          </p>

          <Button asChild size="lg" className="mt-6">
            <Link to="/">
              <Home aria-hidden="true" />
              Go home
            </Link>
          </Button>

          <nav aria-label="Cheatsheets" className="mt-8">
            <ul className="flex flex-wrap justify-center gap-2">
              {Object.values(TOPICS).map(({ id, path, shortTitle, icon: Icon, ink }) => (
                <li key={id}>
                  <Link
                    to={path}
                    className="focus-ring inline-flex min-h-tap items-center gap-2 rounded-full border border-border/70 bg-card/80 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted/70"
                  >
                    <Icon className="h-4 w-4" style={{ color: ink }} aria-hidden="true" />
                    {shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
