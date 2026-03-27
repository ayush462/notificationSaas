import { cn } from "../../lib/utils";
export default function Button({ className, ...props }) {
  return <button className={cn("rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500", className)} {...props} />;
}
