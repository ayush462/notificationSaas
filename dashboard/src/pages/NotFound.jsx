import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center animate-fade-in">
        <p className="text-8xl font-extrabold text-neutral-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-ink tracking-tight">Page not found</h1>
        <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist or has been moved.</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/" className="btn btn-primary gap-2">
            <Home className="h-4 w-4" /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn btn-secondary gap-2">
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
