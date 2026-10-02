import React, { memo } from 'react';
import CodeBlock from './CodeBlock';
import { useReaderCopy } from './readerCopy';
import { getTopic } from '../lib/topics';

/** Slug used for `data-testid` (kept stable for tests). */
const testSlug = (name) => name.toLowerCase().replace(/\s+/g, '-');

/** URL-safe slug for the element id; the index keeps ids unique when concept names repeat. */
const idSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-|-$/g, '');

const ConceptCard = memo(({ concept, index, type }) => {
  const t = useReaderCopy();
  const topic = getTopic(type);
  const id = `${idSlug(concept.name) || 'concept'}-${index + 1}`;
  const keyPoints = concept.keyPoints ?? [];

  return (
    <article
      id={id}
      data-testid={`concept-${testSlug(concept.name)}`}
      aria-labelledby={`${id}-title`}
      className="concept-card surface-card space-y-4 p-4 sm:p-6 lg:p-7"
      style={{ borderColor: `${topic.color}66` }}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow" style={{ color: topic.ink }}>
            {t.concept} {index + 1}
          </p>
          <p className="text-xs font-medium text-muted-foreground">{t.keyPoints(keyPoints.length)}</p>
        </div>

        <div className="group/title flex items-start justify-between gap-2">
          <h2
            id={`${id}-title`}
            className="min-w-0 wrap-break-word font-heading text-lg font-semibold leading-snug sm:text-xl lg:text-2xl"
            style={{ color: topic.ink }}
          >
            {concept.name}
          </h2>
          <a
            href={`#${id}`}
            aria-label={t.linkTo(concept.name)}
            className="focus-ring -my-1 inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg font-heading text-lg font-semibold text-muted-foreground transition-opacity hover:text-foreground coarse:-my-2 coarse:h-11 coarse:min-w-tap fine:opacity-0 fine:group-hover/title:opacity-100 fine:focus-visible:opacity-100"
          >
            <span aria-hidden="true">#</span>
          </a>
        </div>

        <p className="max-w-[70ch] text-base leading-7 text-foreground/85">{concept.explanation}</p>
      </div>

      {concept.code && <CodeBlock code={concept.code} name={concept.name} baseLanguage={topic.language} />}

      {keyPoints.length > 0 && (
        <div className="space-y-2">
          <h3 className="eyebrow">{t.quickNotes}</h3>
          <ul className="max-w-[70ch] space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-6 text-foreground/85 sm:text-base sm:leading-7">
                <span
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: topic.color }}
                  aria-hidden="true"
                />
                <span className="min-w-0">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
});

ConceptCard.displayName = 'ConceptCard';

export default ConceptCard;
