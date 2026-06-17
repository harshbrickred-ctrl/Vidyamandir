import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "default" && "border-transparent bg-emerald-900 text-white",
        variant === "secondary" && "border-transparent bg-stone-100 text-stone-700",
        variant === "destructive" && "border-transparent bg-red-600 text-white",
        variant === "outline" && "border-stone-200 text-stone-700",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
