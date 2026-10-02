import React, { useRef } from 'react';
import NavigationSidebar from './NavigationSidebar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { useReaderCopy } from './readerCopy';
import { getTopic } from '../lib/topics';

/** Phone/tablet chapter picker: a bottom sheet (focus trap, Esc, overlay close and scroll lock come from Radix). */
const ChapterSheet = ({ open, onOpenChange, sections, activeSection, type, openerRef }) => {
  const t = useReaderCopy();
  const topic = getTopic(type);
  const navigated = useRef(false);

  // Dismissing (Esc, overlay, close button) hands focus back to whatever opened the sheet. Picking a
  // chapter doesn't: the route announcer moves focus to <main> for the new page instead.
  const handleCloseAutoFocus = (event) => {
    event.preventDefault();
    if (!navigated.current) openerRef?.current?.focus();
    navigated.current = false;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85dvh]" onCloseAutoFocus={handleCloseAutoFocus}>
        <SheetHeader>
          <SheetTitle>{t.chapters}</SheetTitle>
          <SheetDescription>
            {topic.flowLabel} · {t.chapterCount(sections.length)}
          </SheetDescription>
        </SheetHeader>
        <div className="-mx-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2">
          <NavigationSidebar
            sections={sections}
            activeSection={activeSection}
            cheatsheetType={type}
            onNavigate={() => {
              navigated.current = true;
              onOpenChange(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChapterSheet;
