import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { DialogOverlay } from "@/components/ui/dialog"

/*
 * Edge-anchored panel built on the Radix dialog, so it gets a real focus trap, Escape to close,
 * scroll lock, focus return and `aria-modal` — unlike a CSS-translated <aside>.
 * Because it is only mounted while open, its links are never reachable by keyboard when closed.
 *
 *   <Sheet open onOpenChange>
 *     <SheetContent side="bottom" aria-describedby={undefined}>
 *       <SheetHeader><SheetTitle>Chapters</SheetTitle></SheetHeader>
 *       <div className="min-h-0 flex-1 overflow-y-auto">…</div>
 *     </SheetContent>
 *   </Sheet>
 *
 * side: "bottom" (mobile default, rounded top, max 85dvh) | "left" | "right".
 */
const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close

const SIDE_CLASSES = {
  bottom:
    "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  left:
    "inset-y-0 left-0 h-dvh w-[88%] max-w-sm border-r data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right:
    "inset-y-0 right-0 h-dvh w-[88%] max-w-sm border-l data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
}

const SheetContent = React.forwardRef(({ side = "bottom", className, children, hideClose = false, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col gap-3 border-border/70 bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-overlay duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
        SIDE_CLASSES[side],
        className
      )}
      {...props}>
      {side === "bottom" && (
        <div className="mx-auto -mt-1 h-1.5 w-10 shrink-0 rounded-full bg-border" aria-hidden="true" />
      )}
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-2 top-2 inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground/70 transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
          <X className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex shrink-0 flex-col space-y-1 pr-12 text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn("font-heading text-lg font-semibold leading-snug", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription }
