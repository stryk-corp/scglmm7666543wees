import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-border/80 bg-background/50 px-3.5 py-2 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-border focus:bg-background/85 focus:border-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted/40 read-only:focus:ring-0",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
