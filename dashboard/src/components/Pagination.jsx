import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ total, limit, offset, onChange }) {
  if (!total || total <= 0) return null;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  if (totalPages <= 1) return null;

  function goTo(page) {
    const clamped = Math.max(1, Math.min(page, totalPages));
    onChange((clamped - 1) * limit);
  }

  // Build visible page numbers with ellipsis
  const pages = [];
  const maxVisible = 7;
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const showStart = Math.min(offset + 1, total);
  const showEnd = Math.min(offset + limit, total);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-ink-muted tabular-nums">
        Showing {showStart}–{showEnd} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => goTo(currentPage - 1)}
          className="btn btn-secondary !p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="px-2 text-xs text-ink-subtle select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goTo(p)}
              className={`btn !px-3 !py-1.5 text-xs font-medium ${
                p === currentPage
                  ? "bg-ink text-white hover:bg-neutral-800"
                  : "btn-secondary"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => goTo(currentPage + 1)}
          className="btn btn-secondary !p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
