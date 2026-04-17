import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NavigationSidebarItem = memo(({ section, index, isActive, cheatsheetType, themeColor, onNavigate }) => {
  return (
    <Link
      to={`/${cheatsheetType}/${section.id}`}
      data-testid={`sidebar-${section.id}`}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`focus-ring hover-float group relative block rounded-xl border px-3.5 py-3 text-sm transition-all duration-200 ${
        isActive
          ? 'border-transparent bg-card text-foreground shadow-[0_14px_24px_-24px_rgba(48,54,79,0.75)]'
          : 'border-border/60 bg-background/75 text-foreground/72 hover:border-border hover:bg-card hover:text-foreground'
      }`}
      style={
        isActive
          ? {
              borderColor: `${themeColor}55`,
              boxShadow: `inset 2px 0 0 ${themeColor}, 0 14px 24px -24px rgba(48,54,79,0.75)`,
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-[1px] inline-flex min-w-7 items-center justify-center rounded-md px-1 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
          style={{
            background: isActive ? `${themeColor}22` : 'hsl(var(--muted))',
            color: isActive ? themeColor : 'hsl(var(--foreground) / 0.72)',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <span className="leading-snug">{section.title}</span>
      </div>
    </Link>
  );
});

NavigationSidebarItem.displayName = 'NavigationSidebarItem';

const NavigationSidebar = memo(({ sections, activeSection, cheatsheetType, themeColor, onNavigate }) => {
  const { isHinglish } = useLanguage();

  return (
    <div className="sticky-sidebar pr-1">
      <nav className="space-y-3" aria-label="Cheatsheet sections">
        <div className="surface-card p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/55">
            {isHinglish ? 'Reading Rail' : 'Reading Rail'}
          </p>
          <h3 className="mt-1 font-heading text-base font-semibold text-foreground">
            {isHinglish ? 'Chapter Navigation' : 'Chapter Navigation'}
          </h3>
        </div>

        <div className="space-y-2">
          {sections.map((section, index) => (
            <NavigationSidebarItem
              key={section.id}
              section={section}
              index={index}
              isActive={activeSection === section.id}
              cheatsheetType={cheatsheetType}
              themeColor={themeColor}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>
    </div>
  );
});

NavigationSidebar.displayName = 'NavigationSidebar';

export default NavigationSidebar;
