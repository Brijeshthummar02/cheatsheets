import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-java';
import { Button } from './ui/button';

const ConceptCard = memo(({ concept, themeColor }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);
  const conceptId = concept.name.toLowerCase().replace(/\s+/g, '-');

  const copyCode = useCallback(() => {
    if (!concept.code) {
      return;
    }

    navigator.clipboard.writeText(concept.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [concept.code]);

  useEffect(() => {
    if (codeRef.current && concept.code) {
      Prism.highlightElement(codeRef.current);
    }
  }, [concept.code]);

  return (
    <article
      data-testid={`concept-${conceptId}`}
      id={conceptId}
      aria-labelledby={`heading-${conceptId}`}
      className="concept-card surface-card code-block-card p-5 md:p-7"
      style={{
        borderColor: `${themeColor}66`,
        boxShadow: `0 18px 36px -30px ${themeColor}66`,
      }}
    >
      <div className="space-y-4">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">Concept</p>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ background: `${themeColor}1A`, color: themeColor }}
            >
              {concept.keyPoints?.length || 0} key points
            </span>
          </div>

          <h3
            id={`heading-${conceptId}`}
            className="font-heading text-xl font-semibold leading-tight md:text-2xl"
            style={{ color: themeColor }}
          >
            {concept.name}
          </h3>

          <p className="text-sm leading-relaxed text-foreground/78 md:text-[15px]">{concept.explanation}</p>
        </header>

        {concept.code && (
          <figure className="group relative" role="figure" aria-label={`Code example for ${concept.name}`}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-foreground/58">Code Snippet</p>
              <Button
                data-testid="copy-code-btn"
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="h-8 rounded-lg border-border/70 bg-background/70 px-2 text-xs"
                aria-label={copied ? 'Code copied to clipboard' : `Copy ${concept.name} code to clipboard`}
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#2C687B]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>

            <pre
              className="code-snippet-frame overflow-x-auto p-4 md:p-5"
              role="region"
              aria-label="Code snippet"
              style={{
                borderColor: `${themeColor}75`,
                boxShadow: `0 14px 26px -22px ${themeColor}55`,
              }}
            >
              <code ref={codeRef} className="language-java font-code text-xs md:text-sm">
                {concept.code}
              </code>
            </pre>
          </figure>
        )}

        {concept.keyPoints && concept.keyPoints.length > 0 && (
          <aside className="space-y-2.5" aria-label="Key points to remember">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/55">Quick Notes</h4>
            <ul className="space-y-2">
              {concept.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground/76">
                  <span
                    className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: themeColor }}
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
});

ConceptCard.displayName = 'ConceptCard';

export default ConceptCard;
