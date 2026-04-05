/*
 * DESIGN: Industrial Brutalism + Organic Contrast
 * - Matches site-wide design: near-black base, neon lime accent
 * - Barlow Condensed headings, DM Sans body
 * - Left-split layout with brand panel + right login form
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Lock, Leaf, ArrowRight } from "lucide-react";

export default function OwnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      toast.success("Welcome back, Rene.");
      setLocation("/owner/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Invalid credentials. Try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex">
      {/* ─── Left brand panel ─────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#111111] border-r border-white/5 p-12">
        {/* Logo */}
        <div>
          <span
            className="text-[#B5E61D] font-bold tracking-widest text-[0.6rem] uppercase block"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Rene's
          </span>
          <span
            className="text-white font-black uppercase tracking-tight text-2xl leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Outdoor Maintenance
          </span>
        </div>

        {/* Center content */}
        <div>
          <span className="rule-lime mb-6 block" />
          <p
            className="text-[#B5E61D] text-xs font-bold uppercase tracking-widest mb-3"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Owner Portal
          </p>
          <h2
            className="text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-black uppercase text-white mb-6"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Your Business.<br />
            <span className="text-[#B5E61D]">Your Dashboard.</span>
          </h2>
          <p
            className="text-white/50 leading-relaxed max-w-sm"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            View incoming bookings, confirm appointments, track job statuses,
            and stay on top of your schedule — all in one place.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: "View Bookings", sub: "See all customer requests" },
              { label: "Update Status", sub: "Confirm, complete, cancel" },
              { label: "Contact Info", sub: "Phone & email per booking" },
              { label: "Job Notes", sub: "Customer instructions" },
            ].map((item) => (
              <div key={item.label} className="border-l-2 border-[#B5E61D]/30 pl-4">
                <p
                  className="text-white font-bold uppercase text-sm"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-white/40 text-xs"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          © {new Date().getFullYear()} Rene's Outdoor Maintenance · Houston, TX
        </p>
      </div>

      {/* ─── Right login form ──────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden text-center">
          <span
            className="text-[#B5E61D] font-bold tracking-widest text-[0.6rem] uppercase block"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Rene's
          </span>
          <span
            className="text-white font-black uppercase tracking-tight text-xl leading-none"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            Outdoor Maintenance
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#B5E61D] flex items-center justify-center">
                <Lock size={18} className="text-[#0D0D0D]" />
              </div>
              <p
                className="text-[#B5E61D] text-xs font-bold uppercase tracking-widest"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Owner Access
              </p>
            </div>
            <h1
              className="text-[clamp(2.2rem,5vw,3rem)] leading-none font-black uppercase text-white mb-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Sign In
            </h1>
            <p
              className="text-white/50 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Enter your credentials to access your appointment dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-white/70 text-xs font-bold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 text-white placeholder-white/30 focus:border-[#B5E61D] focus:outline-none transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-white/70 text-xs font-bold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-white/10 text-white placeholder-white/30 focus:border-[#B5E61D] focus:outline-none transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#B5E61D] text-[#0D0D0D] font-black text-sm uppercase tracking-widest px-6 py-4 hover:bg-[#C8F020] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <a
              href="/"
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              ← Back to public site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
