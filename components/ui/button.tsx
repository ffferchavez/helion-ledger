import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-tight transition-[transform,box-shadow,filter,background-color] disabled:pointer-events-none disabled:opacity-50 disabled:translate-y-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "border border-white/30 bg-[linear-gradient(135deg,#f8fafc_0%,#cbd5e1_35%,#8ab4ff_70%,#e2e8f0_100%)] text-slate-900 shadow-[0_12px_30px_-18px_rgba(94,163,255,0.9),0_0_0_1px_rgba(255,255,255,0.4)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:brightness-95",
        destructive:
          "border border-rose-400/40 bg-[linear-gradient(135deg,#ff94a9_0%,#ff5c77_60%,#ff7d8e_100%)] text-white shadow-[0_12px_30px_-18px_rgba(255,92,119,0.8)] hover:brightness-110",
        outline:
          "border border-border bg-background/60 text-foreground hover:border-ring/40 hover:bg-muted/40",
        secondary:
          "bg-muted/50 text-foreground hover:bg-muted/70",
        ghost:
          "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
        link: "text-sky-300 underline-offset-4 hover:text-sky-200 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
