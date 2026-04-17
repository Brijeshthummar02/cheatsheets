import React, { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Binary,
  BookOpenCheck,
  Code2,
  Compass,
  GitBranch,
  Layers3,
  Workflow,
} from 'lucide-react';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';

const TopicIcon = memo(({ iconPath, Icon, color }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src={iconPath}
        alt=""
        onError={() => setImgFailed(true)}
        className="h-7 w-7 object-contain"
        loading="lazy"
      />
    );
  }

  return <Icon className="h-7 w-7" style={{ color }} aria-hidden="true" />;
});

TopicIcon.displayName = 'TopicIcon';

const JourneyCard = memo(({ card, delayMs, isHinglish, onOpen }) => {
  return (
    <article
      className="surface-card hover-float soft-in dashboard-topic-card relative overflow-hidden p-5 sm:p-6"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full opacity-45"
        style={{ background: `radial-gradient(circle, ${card.color}42 0%, transparent 72%)` }}
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-28 w-28 rounded-full opacity-35"
        style={{ background: `radial-gradient(circle, ${card.color}35 0%, transparent 74%)` }}
      />

      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              background: `${card.color}14`,
              borderColor: `${card.color}55`,
            }}
          >
            <TopicIcon iconPath={card.iconPath} Icon={card.icon} color={card.color} />
          </div>

          <span
            className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{
              background: `${card.color}13`,
              borderColor: `${card.color}4A`,
              color: card.color,
            }}
          >
            {isHinglish ? card.chaptersHi : card.chapters}
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">{card.title}</h2>
          <p className="text-sm leading-relaxed text-foreground/70">
            {isHinglish ? card.summaryHi : card.summary}
          </p>
        </div>

        <ul className="space-y-2 text-sm text-foreground/76">
          {card.points.map((point) => (
            <li key={point.en} className="flex items-start gap-2">
              <span className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ background: card.color }} />
              <span>{isHinglish ? point.hi : point.en}</span>
            </li>
          ))}
        </ul>

        <Button
          onClick={() => onOpen(card.path)}
          className="chapter-cta mt-auto h-12 rounded-xl text-sm font-semibold"
          style={{
            '--chapter-color': card.color,
            color: '#FFF6F6',
          }}
        >
          {isHinglish ? 'Chapter Start karo' : 'Start Chapter'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
});

JourneyCard.displayName = 'JourneyCard';

const HomePage = memo(() => {
  const navigate = useNavigate();
  const { isHinglish } = useLanguage();

  const cards = useMemo(
    () => [
      {
        id: 'java',
        title: 'Java Foundation',
        summary: 'Master OOP, collections, streams, and architecture-ready Java patterns.',
        summaryHi: 'OOP, collections, streams, aur architecture-ready Java patterns master karo.',
        chapters: '18 Chapters',
        chaptersHi: '18 Chapters',
        path: '/java',
        color: '#2C687B',
        iconPath: '/icons/flaticon/java.png',
        icon: Code2,
        points: [
          { en: 'Core syntax and memory model', hi: 'Core syntax aur memory model' },
          { en: 'Collections and stream fluency', hi: 'Collections aur stream fluency' },
          { en: 'Exceptions to production patterns', hi: 'Exceptions se production patterns' },
        ],
      },
      {
        id: 'springboot',
        title: 'Spring Boot Flow',
        summary: 'Build modern backend APIs with confidence, structure, and deployment clarity.',
        summaryHi: 'Modern backend APIs confidence aur clean structure ke saath banao.',
        chapters: '20 Chapters',
        chaptersHi: '20 Chapters',
        path: '/springboot',
        color: '#72BAA9',
        iconPath: '/icons/flaticon/springboot.png',
        icon: Layers3,
        points: [
          { en: 'Annotation-driven design', hi: 'Annotation-driven design' },
          { en: 'REST, validation, and security', hi: 'REST, validation, aur security' },
          { en: 'JPA, tests, and deployment habits', hi: 'JPA, tests, aur deployment habits' },
        ],
      },
      {
        id: 'dsa',
        title: 'DSA Strategy',
        summary: 'Train problem-solving patterns for interviews and real-world optimization work.',
        summaryHi: 'Interview aur real optimization ke liye problem-solving patterns train karo.',
        chapters: '24 Chapters',
        chaptersHi: '24 Chapters',
        path: '/dsa',
        color: '#6E1A37',
        iconPath: '/icons/flaticon/dsa.png',
        icon: Binary,
        points: [
          { en: 'Data structures with intuition', hi: 'Data structures with intuition' },
          { en: 'Algorithm complexity mastery', hi: 'Algorithm complexity mastery' },
          { en: 'Pattern-first interview prep', hi: 'Pattern-first interview prep' },
        ],
      },
      {
        id: 'git',
        title: 'Git Execution',
        summary: 'Ship cleaner code with branching clarity, collaboration, and recovery confidence.',
        summaryHi: 'Branching clarity aur recovery confidence ke saath cleaner code ship karo.',
        chapters: '16 Chapters',
        chaptersHi: '16 Chapters',
        path: '/git',
        color: '#AE2448',
        iconPath: '/icons/flaticon/git.png',
        icon: GitBranch,
        points: [
          { en: 'Branching and rebase workflows', hi: 'Branching aur rebase workflows' },
          { en: 'PR and review discipline', hi: 'PR aur review discipline' },
          { en: 'Debug and recover safely', hi: 'Debug aur recover safely' },
        ],
      },
    ],
    [],
  );

  const methodCards = useMemo(
    () => [
      {
        icon: Compass,
        title: isHinglish ? 'Locate' : 'Locate',
        description: isHinglish ? 'Chapter choose karo jo abhi ka kaam solve kare.' : 'Pick the chapter that solves the task in front of you.',
        color: '#2C687B',
      },
      {
        icon: BookOpenCheck,
        title: isHinglish ? 'Absorb' : 'Absorb',
        description: isHinglish ? 'Concept + code + key points ko ek flow me padho.' : 'Read concept, code, and key points in one guided rhythm.',
        color: '#72BAA9',
      },
      {
        icon: Workflow,
        title: isHinglish ? 'Execute' : 'Execute',
        description: isHinglish ? 'Search, copy, aur implementation ko fast lane me le jao.' : 'Search, copy, and ship implementation at velocity.',
        color: '#AE2448',
      },
    ],
    [isHinglish],
  );

  return (
    <div className="relative min-h-screen overflow-hidden pb-14 md:pb-20">
      <div className="noise-overlay" />

      <Header showJumpToJava={true} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6 md:pt-12">
        <section className="ambient-grid surface-card relative overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute -left-20 top-16 h-44 w-44 rounded-full bg-[#DB1A1A]/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-44 w-44 rounded-full bg-[#72BAA9]/20 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-5">
              <span className="chapter-pill">
                {isHinglish ? 'Developer Narrative Experience' : 'Developer Narrative Experience'}
              </span>

              <h1 className="font-heading text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                {isHinglish ? 'Learn in Chapters,' : 'Learn in Chapters,'}
                <span className="block bg-gradient-to-r from-[#DB1A1A] via-[#AE2448] to-[#2C687B] bg-clip-text text-transparent">
                  {isHinglish ? 'Ship with Confidence.' : 'Ship with Confidence.'}
                </span>
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-foreground/72 sm:text-base">
                {isHinglish
                  ? 'Yeh app ab sirf cheatsheet list nahi hai. Yeh ek guided story hai jahan har section tumhe context deta hai, code deta hai, aur next step clear karta hai.'
                  : 'This is no longer a plain cheatsheet list. It is a guided story where each section gives context, code, and a clear next move.'}
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Button
                  className="h-11 rounded-xl px-5 text-sm font-semibold"
                  onClick={() => navigate('/java')}
                  style={{ background: 'linear-gradient(130deg, #DB1A1A 0%, #AE2448 100%)', color: '#FFF6F6' }}
                >
                  {isHinglish ? 'Start Learning Flow' : 'Start Learning Flow'}
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border/70 bg-card/75 px-5 text-sm"
                  onClick={() => navigate('/git')}
                >
                  {isHinglish ? 'Open Git Playbook' : 'Open Git Playbook'}
                </Button>
              </div>
            </div>

            <aside className="dashboard-pane relative overflow-hidden p-6 sm:p-7">
              <div className="story-line absolute left-7 top-8 h-[calc(100%-4rem)] w-[3px] rounded-full" />
              <div className="relative space-y-6 pl-7">
                <div className="dashboard-step">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/55">01</p>
                  <p className="mt-1 font-heading text-[1.8rem] font-semibold leading-none text-foreground">{isHinglish ? 'Pick a Domain' : 'Pick a Domain'}</p>
                  <p className="mt-2 text-sm text-foreground/68">{isHinglish ? 'Java, Spring, DSA ya Git.' : 'Java, Spring, DSA, or Git.'}</p>
                </div>
                <div className="dashboard-step">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/55">02</p>
                  <p className="mt-1 font-heading text-[1.8rem] font-semibold leading-none text-foreground">{isHinglish ? 'Read in Sequence' : 'Read in Sequence'}</p>
                  <p className="mt-2 text-sm text-foreground/68">{isHinglish ? 'Har chapter me clarity-first breakdown.' : 'Clarity-first breakdown in every chapter.'}</p>
                </div>
                <div className="dashboard-step">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground/55">03</p>
                  <p className="mt-1 font-heading text-[1.8rem] font-semibold leading-none text-foreground">{isHinglish ? 'Copy and Apply' : 'Copy and Apply'}</p>
                  <p className="mt-2 text-sm text-foreground/68">{isHinglish ? 'Code blocks se direct implementation.' : 'Direct implementation from code blocks.'}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-10 md:mt-12">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
              {isHinglish ? 'Choose Your Learning Journey' : 'Choose Your Learning Journey'}
            </h2>
            <p className="hidden text-sm text-foreground/60 md:block">
              {isHinglish ? 'All paths designed as narrative flows.' : 'All paths are designed as narrative flows.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, index) => (
              <JourneyCard
                key={card.id}
                card={card}
                delayMs={index * 45}
                isHinglish={isHinglish}
                onOpen={(path) => navigate(path)}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 pb-4 md:mt-12 md:grid-cols-3">
          {methodCards.map(({ icon: Icon, title, description, color }) => (
            <article key={title} className="surface-card hover-float p-5">
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: `${color}22` }}
              >
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-foreground/70">{description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
});

HomePage.displayName = 'HomePage';

export default HomePage;
