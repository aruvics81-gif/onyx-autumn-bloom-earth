import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "outline" | "paper";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; static?: boolean }
>(function Button({ className, variant = "primary", static: isStatic, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 text-sm font-medium transition-[transform,background-color,color,opacity] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
        !isStatic && "active:not-disabled:scale-[0.96]",
        variant === "primary" && "bg-ochre text-cream hover:bg-ochre-dark",
        variant === "ghost" && "bg-transparent text-ink hover:bg-ink/5",
        variant === "outline" && "border border-border bg-transparent text-ink hover:bg-paper-3/40",
        variant === "paper" && "bg-cream text-ink shadow-sm hover:bg-paper-2",
        className,
      )}
      {...props}
    />
  );
});
