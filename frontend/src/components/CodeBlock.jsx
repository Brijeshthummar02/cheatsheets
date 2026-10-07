import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-properties';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-hcl';
import 'prismjs/components/prism-nginx';
import { Button } from './ui/button';
import { useReaderCopy } from './readerCopy';

const COMMENT_LINE = /^(\/\/|#|\/\*|\*|<!--)/;
const COPIED_MS = 1800;

// DevOps snippets mix shell with config formats. A snippet is only treated as one of these formats when
// every unindented, non-comment line looks like it; a single shell command line keeps it as bash.
const FORMATS = [
  ['yaml', /^([\w.-]+:(\s|$)|---|\.\.\.|- )/],
  ['docker', /^(FROM|ARG|RUN|CMD|ENTRYPOINT|COPY|ADD|ENV|WORKDIR|USER|EXPOSE|HEALTHCHECK|LABEL|VOLUME|SHELL|STOPSIGNAL|ONBUILD)\s/],
  ['hcl', /^(\}|[a-z_]+(\s+"[^"]*")*\s*\{.*|[a-z_]+\s+=\s.*)$/],
  ['nginx', /^(\}|[a-z_]+.*\{|[a-z_]+\s[^;]*;)$/],
];
const FORMAT_START = {
  hcl: /^(terraform|provider|resource|variable|module|data|output|locals)\b/,
  nginx: /^(server|http|upstream|events|stream|map|limit_req_zone|proxy_cache_path|log_format)\b/,
};

function detectShellFormat(code) {
  const lines = code.split('\n').filter((line) => line.trim() && !/^\s/.test(line) && !COMMENT_LINE.test(line));
  if (lines.length === 0) return null;
  const match = FORMATS.find(([name, pattern]) => lines.every((line) => pattern.test(line)) && (!FORMAT_START[name] || FORMAT_START[name].test(lines[0])));
  return match?.[0] ?? null;
}

/**
 * Picks the Prism grammar. Topics declare a base language (bash for Git and DevOps, java otherwise);
 * Spring Boot also ships pom.xml / application.properties / yaml snippets, which are recognised by their
 * first real line. A snippet that opens with `#` comments but isn't config is shell (mvn, docker, ...).
 * Shell topics also pick up pure YAML / Dockerfile / HCL / nginx snippets (see FORMATS).
 */
export function detectLanguage(code, baseLanguage) {
  if (baseLanguage === 'bash') return detectShellFormat(code) ?? 'bash';
  if (baseLanguage !== 'java') return baseLanguage;

  const lines = code.split('\n').map((line) => line.trim()).filter(Boolean);
  const first = lines.find((line) => !COMMENT_LINE.test(line)) ?? '';
  const looksLikeConfig = !lines.some((line) => /[;{]$/.test(line));

  if (first.startsWith('<')) return 'markup';
  if (looksLikeConfig && /^[\w.-]+(\[\d*\])?\s*=/.test(first)) return 'properties';
  if (looksLikeConfig && /^[\w.-]+:(\s|$)/.test(first)) return 'yaml';
  if (lines[0]?.startsWith('#')) return 'bash';
  return 'java';
}

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** Highlighted HTML string. Pure (no DOM), so React keeps ownership of every node it renders. */
function highlight(code, language) {
  const grammar = Prism.languages[language];
  return grammar ? Prism.highlight(code, grammar, language) : escapeHtml(code);
}

/** Clipboard API where available, otherwise a hidden textarea + execCommand (insecure contexts). */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const previouslyFocused = document.activeElement;
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
      previouslyFocused?.focus?.({ preventScroll: true });
    }
  }
}

const CodeBlock = memo(({ code, name, baseLanguage = 'java' }) => {
  const t = useReaderCopy();
  const [status, setStatus] = useState('idle'); // idle | copied | failed
  const timer = useRef(0);

  const language = useMemo(() => detectLanguage(code, baseLanguage), [code, baseLanguage]);
  const html = useMemo(() => highlight(code, language), [code, language]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyText(code);
    clearTimeout(timer.current);
    setStatus(ok ? 'copied' : 'failed');
    timer.current = setTimeout(() => setStatus('idle'), COPIED_MS);
  };

  const label = status === 'copied' ? t.copied : status === 'failed' ? t.copyFailed : t.copy;
  const Icon = status === 'copied' ? Check : Copy;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="eyebrow">{t.codeSnippet}</p>
        <Button data-testid="copy-code-btn" variant="outline" size="sm" onClick={handleCopy}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
          <span className="sr-only">{t.copyCodeFor(name)}</span>
        </Button>
        <span role="status" aria-live="polite" className="sr-only">
          {status === 'idle' ? '' : label}
        </span>
      </div>

      {/* A scrolling code block must be reachable by keyboard, hence tabIndex. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <pre tabIndex={0} aria-label={t.codeFor(name)} className={`language-${language} min-w-0 max-w-full overflow-x-auto p-4 sm:p-5`}>
        <code className={`language-${language} font-code text-xs sm:text-sm`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

export default CodeBlock;
