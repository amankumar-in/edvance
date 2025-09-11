import { Button } from "@radix-ui/themes";
import { ArrowLeft, GraduationCap, Home } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br from-[--brand-blue-light] to-[--brand-purple-light]">
      <div className="space-y-8 w-full max-w-2xl text-center">
        {/* Logo/Brand Section */}
        <div>
          <div className="inline-flex gap-3 items-center mb-4">
            <div className="flex justify-center items-center w-12 h-12 rounded-xl bg-[--accent-9]">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800">EdVance</span>
          </div>
        </div>

        {/* Error Content */}
        <div>
          <div className="mb-2 text-8xl font-bold select-none text-slate-400">
            404
          </div>
          <h1 className="mb-3 text-3xl font-bold text-slate-800">
            Lost in Space
          </h1>
          <p className="mx-auto max-w-md text-lg leading-relaxed text-slate-600">
            Oops! The page you're looking for doesn't exist.
            You might have taken a wrong turn.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 justify-center items-center sm:flex-row">
          <Button asChild size="4">
            <Link
              to="/"
            >
              <Home size={20} />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild size="4" variant="outline" color="gray">
            <Link
              to={-1}
            >
              <ArrowLeft size={20} />
              Previous Page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}