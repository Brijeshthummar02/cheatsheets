import { useLanguage } from '../context/LanguageContext';

const s = (n) => (n === 1 ? '' : 's');

/* UI strings of the chapter reader. Hinglish only overrides what actually differs. */
const en = {
  chapter: 'Chapter',
  chapters: 'Chapters',
  chapterOf: (n, total) => `Chapter ${n} of ${total}`,
  position: (n, total) => `${n} / ${total}`,
  chapterCount: (total) => `${total} chapter${s(total)}`,
  conceptCount: (n) => `${n} concept${s(n)}`,
  browseChapters: 'Browse chapters',
  sidebarLabel: 'Chapter navigation',
  prev: 'Prev',
  next: 'Next',
  prevChapter: 'Previous chapter',
  nextChapter: 'Next chapter',
  firstChapter: 'This is the first chapter.',
  flowComplete: 'You completed this flow.',
  controlsLabel: 'Chapter controls',
  endNavLabel: 'Previous and next chapter',
  empty: 'No concepts in this chapter yet.',
  loading: 'Loading chapter…',
  loadFailed: 'Unable to load cheatsheet',
  noChapters: 'No chapters found',
  noChaptersHint: 'This cheatsheet has no chapters yet.',
  retry: 'Retry',
  goHome: 'Go home',
  fallbackNotice: "This chapter isn't translated to Hinglish yet — showing English.",
  switchToEnglish: 'Switch to English',
  redirected: "That chapter doesn't exist — showing the first chapter.",
  concept: 'Concept',
  keyPoints: (n) => `${n} key point${s(n)}`,
  codeSnippet: 'Code Snippet',
  codeFor: (name) => `Code snippet: ${name}`,
  quickNotes: 'Quick Notes',
  copy: 'Copy',
  copied: 'Copied',
  copyFailed: "Couldn't copy",
  copyCodeFor: (name) => ` code for ${name}`,
  linkTo: (name) => `Link to ${name}`,
};

const hi = {
  ...en,
  browseChapters: 'Chapters dekho',
  prev: 'Pichla',
  next: 'Agla',
  prevChapter: 'Pichla chapter',
  nextChapter: 'Agla chapter',
  firstChapter: 'Yeh pehla chapter hai.',
  flowComplete: 'Aapne yeh flow poora kar liya.',
  empty: 'Is chapter mein abhi koi concept nahi hai.',
  loading: 'Chapter load ho raha hai…',
  loadFailed: 'Cheatsheet load nahi hui',
  noChapters: 'Koi chapter nahi mila',
  noChaptersHint: 'Is cheatsheet mein abhi chapters nahi hain.',
  retry: 'Retry karo',
  goHome: 'Home jao',
  redirected: 'Woh chapter nahi mila — pehla chapter dikha rahe hain.',
  keyPoints: (n) => `${n} zaroori point${s(n)}`,
  codeSnippet: 'Code Example',
  codeFor: (name) => `Code example: ${name}`,
  quickNotes: 'Zaroori Baatein',
  copy: 'Copy karo',
  copied: 'Copy ho gaya',
  copyFailed: 'Copy nahi hua',
  copyCodeFor: (name) => ` — ${name} ka code`,
  linkTo: (name) => `${name} ka link`,
};

const COPY = { en, hi };

export function useReaderCopy() {
  const { language } = useLanguage();
  return COPY[language] ?? en;
}
