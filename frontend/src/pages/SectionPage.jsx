import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import ChapterBar from '../components/ChapterBar';
import ChapterSheet from '../components/ChapterSheet';
import ConceptCard from '../components/ConceptCard';
import NavigationSidebar from '../components/NavigationSidebar';
import ReaderBottomBar from '../components/ReaderBottomBar';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { useReaderCopy } from '../components/readerCopy';
import { useApiResource } from '../components/useApiResource';
import { useLanguage } from '../context/LanguageContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { endpoints, getErrorMessage } from '../lib/api';
import { getTopic } from '../lib/topics';
import '../styles/reader.css';

const ChapterSkeleton = ({ title, label }) => (
  <div className="space-y-5">
    <h1 className="sr-only">{title}</h1>
    <p role="status" className="sr-only">
      {label}
    </p>
    {/* Fades in after 150ms: a chapter that loads faster than that never flashes a skeleton. */}
    <div aria-hidden="true" className="animate-fadeIn space-y-5 opacity-0 [animation-delay:150ms]">
      <Skeleton className="h-36 w-full rounded-2xl" />
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} className="h-56 w-full rounded-2xl" />
      ))}
    </div>
  </div>
);

/** Error / empty state, rendered inside the page chrome so Header and navigation stay available. */
const StatusCard = ({ title, message, onRetry }) => {
  const t = useReaderCopy();

  return (
    <div className="surface-card p-6 text-center sm:p-10" role="alert">
      <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-prose text-muted-foreground">{message}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {onRetry && <Button onClick={onRetry}>{t.retry}</Button>}
        <Button asChild variant="outline">
          <Link to="/">{t.goHome}</Link>
        </Button>
      </div>
    </div>
  );
};

const ChapterHeader = ({ topic, section, index, total }) => {
  const t = useReaderCopy();
  const concepts = section.concepts?.length ?? 0;

  return (
    <div className="reading-shell space-y-3 p-4 sm:p-6">
      <p className="eyebrow" style={{ color: topic.ink }}>
        {t.chapter} {index + 1} · {topic.flowLabel}
      </p>
      <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{section.title}</h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <span>{t.conceptCount(concepts)}</span>
        <span className="chapter-pill" style={{ background: `${topic.color}1F`, color: topic.ink }}>
          {t.position(index + 1, total)}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <div className="h-full rounded-full" style={{ width: `${((index + 1) / total) * 100}%`, background: topic.color }} />
      </div>
    </div>
  );
};

const StepLink = ({ to, label, title, align }) => {
  const right = align === 'right';
  const Icon = right ? ChevronRight : ChevronLeft;

  return (
    <Link to={to} className={`surface-card hover-float focus-ring block min-h-tap p-4 ${right ? 'text-right' : ''}`}>
      <p className="eyebrow">{label}</p>
      <span className={`mt-1 flex items-center gap-2 font-semibold text-foreground ${right ? 'flex-row-reverse' : ''}`}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0">{title}</span>
      </span>
    </Link>
  );
};

const SectionPage = ({ type }) => {
  const { sectionId } = useParams();
  const navigate = useNavigate();
  const { isHinglish, setLanguage } = useLanguage();
  const t = useReaderCopy();
  const topic = getTopic(type);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [chaptersOpen, setChaptersOpen] = useState(false);
  const openerRef = useRef(null);
  const openChapters = () => {
    openerRef.current = document.activeElement;
    setChaptersOpen(true);
  };

  const langQuery = isHinglish ? '?lang=hi' : '';
  const meta = useApiResource(endpoints.cheatsheetSections(type) + langQuery);
  const sections = meta.data?.sections;
  const hasSection = (list) => Boolean(sectionId) && Boolean(list?.some((section) => section.id === sectionId));
  const inLanguage = hasSection(sections);

  // Hinglish covers fewer chapters than English. Keep the reader's place by showing the English chapter.
  const lookupEnglish = isHinglish && Boolean(sections) && Boolean(sectionId) && !inLanguage;
  const englishMeta = useApiResource(lookupEnglish ? endpoints.cheatsheetSections(type) : null);
  const englishFallback = lookupEnglish && hasSection(englishMeta.data?.sections);

  const navSections = englishFallback ? englishMeta.data.sections : sections;
  const chapterUrl = sectionId && (inLanguage || englishFallback)
    ? endpoints.cheatsheetSection(type, sectionId) + (inLanguage ? langQuery : '')
    : null;
  const chapter = useApiResource(chapterUrl);
  const section = chapter.data?.section;

  // Unknown chapter (or bare /topic): go to chapter 1, and say so when the user asked for something specific.
  const missing = Boolean(sections?.length) && !inLanguage && (!sectionId || !isHinglish || (englishMeta.data && !englishFallback));
  const firstId = sections?.[0]?.id;
  useEffect(() => {
    if (!missing) return;
    if (sectionId) toast(t.redirected, { id: 'chapter-redirect' });
    navigate(`/${type}/${firstId}`, { replace: true });
  }, [missing, sectionId, type, firstId, navigate, t]);

  useDocumentTitle(section ? `${section.title} · ${topic.shortTitle}` : topic.title);

  const failed = [meta, englishMeta, chapter].filter((request) => request.error);
  const retry = () => failed.forEach((request) => request.retry());

  const index = navSections ? navSections.findIndex((item) => item.id === sectionId) : -1;
  const total = navSections?.length ?? 0;
  const prev = index > 0 ? navSections[index - 1] : null;
  const next = index >= 0 && index < total - 1 ? navSections[index + 1] : null;
  const navReady = index >= 0;
  const ready = navReady && Boolean(section);
  const concepts = section?.concepts ?? [];

  let body;
  if (failed.length > 0) {
    body = <StatusCard title={t.loadFailed} message={getErrorMessage(failed[0].error)} onRetry={retry} />;
  } else if (sections && sections.length === 0) {
    body = <StatusCard title={t.noChapters} message={t.noChaptersHint} />;
  } else if (!ready) {
    body = <ChapterSkeleton title={topic.title} label={t.loading} />;
  } else {
    body = (
      <>
        <ChapterHeader topic={topic} section={section} index={index} total={total} />

        {englishFallback && (
          <div className="flex flex-col gap-3 rounded-2xl border border-info/40 bg-info/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2.5 text-sm leading-6 text-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
              {t.fallbackNotice}
            </p>
            <Button size="sm" variant="outline" className="shrink-0" onClick={() => setLanguage('en')}>
              {t.switchToEnglish}
            </Button>
          </div>
        )}

        {concepts.length === 0 ? (
          <div className="surface-card p-6 text-center text-muted-foreground sm:p-10">{t.empty}</div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {concepts.map((concept, i) => (
              <ConceptCard key={`${sectionId}-${i}`} concept={concept} index={i} type={type} />
            ))}
          </div>
        )}

        <nav aria-label={t.endNavLabel} className="grid gap-3 sm:grid-cols-2">
          {prev ? (
            <StepLink to={`/${type}/${prev.id}`} label={t.prevChapter} title={prev.title} align="left" />
          ) : (
            <p className="surface-card p-4 text-sm text-muted-foreground">{t.firstChapter}</p>
          )}
          {next ? (
            <StepLink to={`/${type}/${next.id}`} label={t.nextChapter} title={next.title} align="right" />
          ) : (
            <p className="surface-card p-4 text-sm text-muted-foreground sm:text-right">{t.flowComplete}</p>
          )}
        </nav>
      </>
    );
  }

  return (
    <div className="relative">
      <Header title={topic.title} autoHideOnScroll />

      {!isDesktop && navReady && (
        <ChapterBar type={type} index={index} total={total} title={navSections[index].title} onOpen={openChapters} />
      )}

      <div className="page-container py-5 sm:py-6 lg:py-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8">
          {isDesktop &&
            (navSections ? (
              <aside aria-label={t.sidebarLabel} className="sticky-sidebar surface-card no-print p-2">
                <NavigationSidebar sections={navSections} activeSection={sectionId} cheatsheetType={type} />
              </aside>
            ) : (
              <div aria-hidden="true" className="surface-card h-96 p-3">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ))}

          <main id="main-content" tabIndex={-1} className="min-w-0 space-y-5 outline-hidden sm:space-y-6">
            {body}
          </main>
        </div>
      </div>

      {!isDesktop && navReady && (
        <>
          <ReaderBottomBar type={type} prev={prev} next={next} onOpenChapters={openChapters} />
          <ChapterSheet
            open={chaptersOpen}
            onOpenChange={setChaptersOpen}
            sections={navSections}
            activeSection={sectionId}
            type={type}
            openerRef={openerRef}
          />
        </>
      )}
    </div>
  );
};

export default SectionPage;
