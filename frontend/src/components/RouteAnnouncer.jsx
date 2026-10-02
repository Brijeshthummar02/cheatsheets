import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const POLL_MS = 50;
const MAX_WAIT_MS = 3000;
const TITLE_GRACE_MS = 400;

/**
 * Single-page apps don't reload, so assistive tech never learns the page changed.
 * After each user navigation (not the first load, not a redirect) this moves focus to <main id="main-content">
 * and announces the new document title through a polite live region.
 */
const RouteAnnouncer = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  const previousPath = useRef(pathname);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (previousPath.current === pathname) return undefined;
    previousPath.current = pathname;
    // /java -> /java/basics style redirects use `replace`; they are not something the user did,
    // so they must not pull focus away from the skip link on first load.
    if (navigationType === 'REPLACE') return undefined;

    const titleBefore = document.title;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const main = document.getElementById('main-content');
      const waited = Date.now() - startedAt;
      const titleReady = document.title !== titleBefore || waited >= TITLE_GRACE_MS;
      if (main && titleReady) {
        clearInterval(timer);
        main.focus({ preventScroll: true });
        setMessage(document.title);
      } else if (waited >= MAX_WAIT_MS) {
        clearInterval(timer);
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [pathname, navigationType]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
};

export default RouteAnnouncer;
