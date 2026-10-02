import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * 44px tall, 16px text on touch (anything smaller makes iOS Safari zoom the page on focus),
 * and a 3:1 outline (`border-input`) so the field boundary is visible.
 * Always give it a label: <label>, aria-label or aria-labelledby.
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive fine:text-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
