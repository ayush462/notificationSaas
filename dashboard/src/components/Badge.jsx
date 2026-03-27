import { cn } from "../lib/utils";

const variants = {
  default: "bg-neutral-100 text-ink border border-surface-border",
  success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border border-amber-200",
  danger: "bg-red-50 text-red-800 border border-red-200",
  info: "bg-neutral-900 text-white border border-neutral-900"
};

export default function Badge({ children, variant = "default", className }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
