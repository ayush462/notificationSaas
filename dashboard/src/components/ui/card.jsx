import { cn } from "../../lib/utils";
export function Card({ className, ...props }) { return <div className={cn("card", className)} {...props} />; }
