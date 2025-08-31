import { ArrowLeft, GraduationCap, Home } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-br to-blue-50 from-slate-50">
      <div className="space-y-8 w-full max-w-2xl text-center">
        {/* Logo/Brand Section */}
        <div>
          <div className="inline-flex gap-3 items-center mb-4">
            <div className="flex justify-center items-center w-12 h-12 bg-cyan-500 rounded-xl">
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
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-xl shadow-md hover:bg-cyan-600 hover:shadow-lg transition-all duration-200 min-w-[160px]"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>

          <Link
            to={-1}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all duration-200 min-w-[160px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous Page
          </Link>
        </div>
      </div>
    </div>
  );
}