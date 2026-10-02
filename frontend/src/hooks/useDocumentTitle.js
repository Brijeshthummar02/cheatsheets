import { useEffect } from 'react';

const SITE = 'Cheatsheets';
const DEFAULT_TITLE = "Developer's Code Cheatsheet Hub";

/**
 * Give every route a distinct <title> (WCAG 2.4.2) — screen readers announce it on navigation.
 *   useDocumentTitle('Collections · Java')  ->  "Collections · Java · Cheatsheets"
 *   useDocumentTitle()                      ->  "Developer's Code Cheatsheet Hub"
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : DEFAULT_TITLE;
  }, [title]);
}

export default useDocumentTitle;
