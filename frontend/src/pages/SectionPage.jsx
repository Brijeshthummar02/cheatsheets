import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BookOpenText, ChevronLeft, ChevronRight, Menu, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import NavigationSidebar from '../components/NavigationSidebar';
import SearchDialog from '../components/SearchDialog';
import VirtualizedConceptList from '../components/VirtualizedConceptList';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { apiClient, endpoints, getErrorMessage } from '../lib/api';

const metadataCache = new Map();
const sectionCache = new Map();

const SECTION_THEME = {
  java: {
    color: '#2C687B',
    label: 'Java Flow',
  },
  springboot: {
    color: '#72BAA9',
    label: 'Spring Boot Flow',
  },
  dsa: {
    color: '#6E1A37',
    label: 'DSA Flow',
  },
  git: {
    color: '#AE2448',
    label: 'Git Flow',
  },
};

const SectionPage = memo(({ type }) => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { language, isHinglish } = useLanguage();

  const [metadata, setMetadata] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingSection, setLoadingSection] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const langParam = isHinglish ? '?lang=hi' : '';

  const themeMeta = useMemo(() => SECTION_THEME[type] || SECTION_THEME.java, [type]);

  const fetchMetadata = useCallback(async () => {
    const cacheKey = `meta_${type}_${language}`;

    if (metadataCache.has(cacheKey)) {
      const cachedData = metadataCache.get(cacheKey);
      setMetadata(cachedData);
      setLoadingMeta(false);
      return cachedData;
    }

    try {
      const response = await apiClient.get(endpoints.cheatsheetSections(type) + langParam);
      metadataCache.set(cacheKey, response.data);
      setMetadata(response.data);
      setLoadingMeta(false);
      return response.data;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      setLoadingMeta(false);
      toast.error(message);
      return null;
    }
  }, [type, language, langParam]);

  const fetchSection = useCallback(
    async (targetSectionId) => {
      const cacheKey = `section_${type}_${targetSectionId}_${language}`;

      if (sectionCache.has(cacheKey)) {
        setSectionData(sectionCache.get(cacheKey));
        setLoadingSection(false);
        return;
      }

      try {
        setLoadingSection(true);
        const response = await apiClient.get(endpoints.cheatsheetSection(type, targetSectionId) + langParam);
        sectionCache.set(cacheKey, response.data);
        setSectionData(response.data);
        setLoadingSection(false);
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        setLoadingSection(false);
        toast.error(message);
      }
    },
    [type, language, langParam],
  );

  useEffect(() => {
    setLoadingMeta(true);
    setError(null);
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (!metadata?.sections || metadata.sections.length === 0) {
      return;
    }

    if (!sectionId) {
      navigate(`/${type}/${metadata.sections[0].id}`, { replace: true });
      return;
    }

    const sectionExists = metadata.sections.some((section) => section.id === sectionId);

    if (!sectionExists) {
      navigate(`/${type}/${metadata.sections[0].id}`, { replace: true });
      return;
    }

    fetchSection(sectionId);
  }, [metadata, sectionId, type, navigate, fetchSection]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentIndex = useMemo(() => {
    if (!metadata?.sections || !sectionId) {
      return -1;
    }

    return metadata.sections.findIndex((section) => section.id === sectionId);
  }, [metadata, sectionId]);

  const prevSection = useMemo(() => {
    if (!metadata?.sections || currentIndex <= 0) {
      return null;
    }

    return metadata.sections[currentIndex - 1];
  }, [metadata, currentIndex]);

  const nextSection = useMemo(() => {
    if (!metadata?.sections || currentIndex < 0 || currentIndex >= metadata.sections.length - 1) {
      return null;
    }

    return metadata.sections[currentIndex + 1];
  }, [metadata, currentIndex]);

  const handleSearchSelect = useCallback(
    (result) => {
      if (result.cheatsheet !== type) {
        navigate(`/${result.cheatsheet}/${result.section_id}`);
      } else {
        navigate(`/${type}/${result.section_id}`);
      }

      setSearchOpen(false);
    },
    [type, navigate],
  );

  if (loadingMeta) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-11 w-full rounded-xl" />
            ))}
          </div>
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-52 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface-card w-full max-w-lg p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {isHinglish ? 'Cheatsheet load nahi hui' : 'Unable to load cheatsheet'}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => window.location.reload()} className="rounded-xl">
              {isHinglish ? 'Retry karo' : 'Retry'}
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="rounded-xl">
              {isHinglish ? 'Home jao' : 'Go Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface-card w-full max-w-lg p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">
            {isHinglish ? 'Cheatsheet nahi mili' : 'Cheatsheet not found'}
          </h2>
          <Button onClick={() => navigate('/')} className="mt-5 rounded-xl">
            {isHinglish ? 'Home jao' : 'Go Home'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-10">
      <Header 
        heightClass="h-[72px] items-center" 
        title={metadata.title} 
        subtitle={themeMeta.label}
        autoHideOnScroll={true}
      >
        <Button
          data-testid="search-btn"
          variant="outline"
          onClick={() => setSearchOpen(true)}
          className="hidden h-10 rounded-xl border-border/70 bg-card/70 px-4 text-xs font-semibold md:inline-flex"
        >
          <Search className="h-4 w-4" />
          {isHinglish ? 'Search' : 'Search'}
          <span className="ml-1 text-[10px] text-foreground/55">Ctrl+K</span>
        </Button>

        <Button
          data-testid="mobile-search-btn"
          variant="outline"
          size="icon"
          onClick={() => setSearchOpen(true)}
          className="h-10 w-10 rounded-xl border-border/70 bg-card/70 md:hidden"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          data-testid="mobile-menu-btn"
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen((open) => !open)}
          className="h-10 w-10 rounded-xl border-border/70 bg-card/70 md:hidden"
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </Header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
        <button
          type="button"
          className={`fixed inset-0 z-30 bg-[#30364F]/28 transition-opacity duration-200 md:hidden ${
            sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setSidebarOpen(false);
            }
          }}
          tabIndex={sidebarOpen ? 0 : -1}
          aria-label="Close navigation menu"
          aria-hidden={!sidebarOpen}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[290px_1fr]">
          <aside
            className={`fixed bottom-0 left-0 top-[72px] z-40 w-[86%] max-w-[320px] overflow-y-auto bg-background p-4 transition-transform duration-200 md:static md:z-0 md:w-auto md:max-w-none md:overflow-visible md:translate-x-0 md:bg-transparent md:p-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            <div className="surface-card h-full p-3 md:h-auto md:p-4">
              <NavigationSidebar
                sections={metadata.sections || []}
                activeSection={sectionId}
                cheatsheetType={type}
                themeColor={themeMeta.color}
                onNavigate={() => setSidebarOpen(false)}
              />
            </div>
          </aside>

          <main id="main-content" role="main" className="space-y-6">
            {loadingSection ? (
              <div className="space-y-5">
                <Skeleton className="h-12 w-72 rounded-xl" />
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-56 w-full rounded-2xl" />
                ))}
              </div>
            ) : sectionData?.section ? (
              <>
                <section className="reading-shell p-5 sm:p-7">
                  <div className="mb-7 flex flex-col gap-4 border-b border-border/65 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2">
                      <span className="chapter-pill" style={{ background: `${themeMeta.color}15`, color: themeMeta.color }}>
                        <BookOpenText className="h-3.5 w-3.5" />
                        {isHinglish ? 'Current Chapter' : 'Current Chapter'}
                      </span>

                      <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                        {sectionData.section.title}
                      </h2>

                      <p className="text-sm text-foreground/68">
                        {isHinglish
                          ? `${sectionData.section.concepts?.length || 0} concepts in this chapter.`
                          : `${sectionData.section.concepts?.length || 0} concepts in this chapter.`}
                      </p>
                    </div>

                    <div
                      className="inline-flex max-w-max items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
                      style={{
                        borderColor: `${themeMeta.color}35`,
                        color: themeMeta.color,
                        background: `${themeMeta.color}10`,
                      }}
                    >
                      <span>{currentIndex + 1}</span>
                      <span>/</span>
                      <span>{metadata.sections.length}</span>
                    </div>
                  </div>

                  <VirtualizedConceptList
                    concepts={sectionData.section.concepts || []}
                    themeColor={themeMeta.color}
                    type={type}
                  />
                </section>

                <nav className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-label="Section navigation">
                  {prevSection ? (
                    <Link
                      to={`/${type}/${prevSection.id}`}
                      className="surface-card focus-ring group block p-4 transition-all duration-200 hover:border-border"
                    >
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
                        {isHinglish ? 'Previous Chapter' : 'Previous Chapter'}
                      </p>
                      <div className="flex items-center gap-2 text-foreground/82 group-hover:text-foreground">
                        <ChevronLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">{prevSection.title}</span>
                      </div>
                    </Link>
                  ) : (
                    <div className="surface-card p-4 text-xs text-foreground/50">
                      {isHinglish ? 'This is the first chapter.' : 'This is the first chapter.'}
                    </div>
                  )}

                  {nextSection ? (
                    <Link
                      to={`/${type}/${nextSection.id}`}
                      className="surface-card focus-ring group block p-4 text-right transition-all duration-200 hover:border-border"
                    >
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-foreground/55">
                        {isHinglish ? 'Next Chapter' : 'Next Chapter'}
                      </p>
                      <div className="flex items-center justify-end gap-2 text-foreground/82 group-hover:text-foreground">
                        <span className="text-sm font-medium">{nextSection.title}</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  ) : (
                    <div className="surface-card p-4 text-right text-xs text-foreground/50">
                      {isHinglish ? 'You completed this flow.' : 'You completed this flow.'}
                    </div>
                  )}
                </nav>
              </>
            ) : (
              <div className="surface-card p-8 text-center">
                <p className="text-sm text-foreground/65">{isHinglish ? 'Section nahi mili' : 'Section not found'}</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSelectResult={handleSearchSelect} />
    </div>
  );
});

SectionPage.displayName = 'SectionPage';

export default SectionPage;
