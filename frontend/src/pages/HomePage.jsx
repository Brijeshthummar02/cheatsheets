import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Compass, Workflow } from 'lucide-react';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { TOPICS, TOPIC_IDS } from '../lib/topics';
import { useChapterCounts, getChapterCount } from '../hooks/useChapterCounts';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import '../styles/home.css';

/** Per-topic card copy. Title, colours, icon and path come from lib/topics.js. */
const TOPIC_COPY = {
  java: {
    summary: 'Master OOP, collections, streams, and architecture-ready Java patterns.',
    summaryHi: 'OOP, collections, streams, aur architecture-ready Java patterns master karo.',
    points: [
      { en: 'Core syntax and memory model', hi: 'Core syntax aur memory model' },
      { en: 'Collections and stream fluency', hi: 'Collections aur stream fluency' },
      { en: 'Exceptions to production patterns', hi: 'Exceptions se production patterns' },
    ],
  },
  springboot: {
    summary: 'Build modern backend APIs with confidence, structure, and deployment clarity.',
    summaryHi: 'Modern backend APIs confidence aur clean structure ke saath banao.',
    points: [
      { en: 'Annotation-driven design', hi: 'Annotation-driven design' },
      { en: 'REST, validation, and security', hi: 'REST, validation, aur security' },
      { en: 'JPA, tests, and deployment habits', hi: 'JPA, tests, aur deployment habits' },
    ],
  },
  dsa: {
    summary: 'Train problem-solving patterns for interviews and real-world optimization work.',
    summaryHi: 'Interview aur real optimization ke liye problem-solving patterns train karo.',
    points: [
      { en: 'Data structures with intuition', hi: 'Data structures with intuition' },
      { en: 'Algorithm complexity mastery', hi: 'Algorithm complexity mastery' },
      { en: 'Pattern-first interview prep', hi: 'Pattern-first interview prep' },
    ],
  },
  git: {
    summary: 'Ship cleaner code with branching clarity, collaboration, and recovery confidence.',
    summaryHi: 'Branching clarity aur recovery confidence ke saath cleaner code ship karo.',
    points: [
      { en: 'Branching and rebase workflows', hi: 'Branching aur rebase workflows' },
      { en: 'PR and review discipline', hi: 'PR aur review discipline' },
      { en: 'Debug and recover safely', hi: 'Debug aur recover safely' },
    ],
  },
};

const STEPS = [
  {
    title: 'Pick a Domain',
    description: 'Java, Spring, DSA, or Git.',
    descriptionHi: 'Java, Spring, DSA ya Git.',
  },
  {
    title: 'Read in Sequence',
    description: 'Clarity-first breakdown in every chapter.',
    descriptionHi: 'Har chapter me clarity-first breakdown.',
  },
  {
    title: 'Copy and Apply',
    description: 'Direct implementation from code blocks.',
    descriptionHi: 'Code blocks se direct implementation.',
  },
];

const METHODS = [
  {
    icon: Compass,
    topicId: 'java',
    title: 'Locate',
    description: 'Pick the chapter that solves the task in front of you.',
    descriptionHi: 'Chapter choose karo jo abhi ka kaam solve kare.',
  },
  {
    icon: BookOpenCheck,
    topicId: 'springboot',
    title: 'Absorb',
    description: 'Read concept, code, and key points in one guided rhythm.',
    descriptionHi: 'Concept + code + key points ko ek flow me padho.',
  },
  {
    icon: Workflow,
    topicId: 'git',
    title: 'Execute',
    description: 'Search, copy, and ship implementation at velocity.',
    descriptionHi: 'Search, copy, aur implementation ko fast lane me le jao.',
  },
];

const JourneyCard = memo(({ topic, copy, count, isHinglish, delayMs }) => {
  const Icon = topic.icon;

  return (
    <article
      className="surface-card hover-float soft-in journey-card relative flex h-full cursor-pointer flex-col gap-4 p-4 sm:p-6"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {/* Decorative glows, clipped to the card's rounded corners. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className="absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-45"
          style={{ background: `radial-gradient(circle, ${topic.color}42 0%, transparent 72%)` }}
        />
        <div
          className="absolute -left-16 bottom-0 h-28 w-28 rounded-full opacity-35"
          style={{ background: `radial-gradient(circle, ${topic.color}35 0%, transparent 74%)` }}
        />
      </div>

      <div className="relative flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border sm:h-14 sm:w-14"
          style={{ background: `${topic.color}1F`, borderColor: `${topic.color}55` }}
        >
          <Icon className="h-7 w-7" style={{ color: topic.ink }} aria-hidden="true" />
        </div>

        <span
          className="min-w-22 rounded-full border px-3 py-1 text-center text-xs font-semibold uppercase tracking-[0.08em]"
          style={{ background: `${topic.color}1F`, borderColor: `${topic.color}66`, color: topic.ink }}
        >
          {count === null ? 'Chapters' : `${count} Chapters`}
        </span>
      </div>

      <div className="relative space-y-2">
        <h3 className="font-heading text-xl font-semibold text-foreground">{topic.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isHinglish ? copy.summaryHi : copy.summary}
        </p>
      </div>

      <ul className="relative space-y-2 text-sm leading-snug text-foreground/80">
        {copy.points.map((point) => (
          <li key={point.en} className="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: topic.color }}
            />
            <span className="min-w-0">{isHinglish ? point.hi : point.en}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        variant="ghost"
        className="chapter-cta mt-auto w-full after:absolute after:inset-0 after:rounded-[inherit] active:transform-none"
        style={{ '--chapter-color': topic.ink }}
      >
        <Link to={topic.path}>
          {isHinglish ? 'Chapter Start karo' : 'Start Chapter'}
          <ArrowRight aria-hidden="true" />
          <span className="sr-only">: {topic.title}</span>
        </Link>
      </Button>
    </article>
  );
});

JourneyCard.displayName = 'JourneyCard';

const HomePage = memo(() => {
  const { isHinglish, language } = useLanguage();
  const counts = useChapterCounts();
  useDocumentTitle();

  const topics = useMemo(() => TOPIC_IDS.map((id) => TOPICS[id]), []);

  return (
    <div className="relative pb-16 md:pb-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="noise-overlay" />
      </div>

      <Header />

      <main id="main-content" tabIndex={-1} className="page-container relative pt-6 outline-hidden sm:pt-8 md:pt-12">
        <section aria-labelledby="hero-title" className="surface-card soft-in relative p-4 sm:p-8 lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <div className="ambient-grid absolute inset-0" />
            <div className="absolute -left-20 top-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-secondary/30 blur-3xl" />
          </div>

          <div className="relative grid gap-6 sm:gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4 sm:space-y-5">
              <span className="chapter-pill">Developer Narrative Experience</span>

              <h1
                id="hero-title"
                className="font-heading text-[1.625rem] font-bold leading-[1.15] text-foreground min-[360px]:text-[1.75rem] min-[390px]:text-3xl sm:text-4xl xl:text-5xl"
              >
                Learn in Chapters,
                <span className="block bg-linear-to-r/srgb from-primary via-accent to-info bg-clip-text text-transparent">
                  Ship with Confidence.
                </span>
              </h1>

              <p className="max-w-[60ch] text-base leading-relaxed text-foreground/80">
                {isHinglish
                  ? 'Yeh app ab sirf cheatsheet list nahi hai. Yeh ek guided story hai jahan har section tumhe context deta hai, code deta hai, aur next step clear karta hai.'
                  : 'This is no longer a plain cheatsheet list. It is a guided story where each section gives context, code, and a clear next move.'}
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to={TOPICS.java.path}>
                    Start Learning Flow
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to={TOPICS.git.path}>Open Git Playbook</Link>
                </Button>
              </div>
            </div>

            <aside className="dashboard-pane relative p-4 sm:p-5 lg:p-7">
              <ol className="story-steps" aria-label="How it works">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="story-step">
                    <span className="story-step__num" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="font-heading text-base font-semibold leading-snug text-foreground lg:text-2xl lg:leading-tight">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isHinglish ? step.descriptionHi : step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </aside>
          </div>
        </section>

        <section aria-labelledby="journeys-title" className="mt-10 md:mt-14">
          <div className="mb-5 space-y-1 md:mb-6">
            <h2 id="journeys-title" className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              Choose Your Learning Journey
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">All paths are designed as narrative flows.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
            {topics.map((topic, index) => (
              <JourneyCard
                key={topic.id}
                topic={topic}
                copy={TOPIC_COPY[topic.id]}
                count={getChapterCount(counts, topic.id, language)}
                isHinglish={isHinglish}
                delayMs={80 + index * 60}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="rhythm-title" className="mt-10 md:mt-14">
          <h2 id="rhythm-title" className="mb-5 font-heading text-2xl font-bold text-foreground sm:text-3xl md:mb-6">
            {isHinglish ? 'Ek simple rhythm' : 'A simple rhythm'}
          </h2>

          <div className="grid gap-4 sm:gap-5 md:grid-cols-3">
            {METHODS.map(({ icon: Icon, topicId, title, description, descriptionHi }) => {
              const topic = TOPICS[topicId];
              return (
                <article key={title} className="surface-card p-4 sm:p-6">
                  <div
                    className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ background: `${topic.color}22` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: topic.ink }} aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {isHinglish ? descriptionHi : description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
