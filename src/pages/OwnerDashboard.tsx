/*
 * DESIGN: Industrial Brutalism + Organic Contrast
 * Owner Dashboard — full appointment management
 * - Stats bar: total / pending / confirmed / completed
 * - Status filter tabs
 * - Rich appointment cards with expand/collapse
 * - Quick-action call & email buttons
 * - Status update buttons
 * - Matches site-wide: #0D0D0D base, #B5E61D lime accent, Barlow Condensed headings
 */
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  LogOut,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  ClipboardList,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Scissors,
  Leaf,
  Droplets,
  Flower2,
  FileText,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────
type Status = "pending" | "confirmed" | "completed" | "cancelled";
type FilterTab = "all" | Status;

// ─── Helpers ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  confirmed: {
    label: "Confirmed",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  completed: {
    label: "Completed",
    bg: "bg-[#B5E61D]/15",
    text: "text-[#B5E61D]",
    dot: "bg-[#B5E61D]",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/15",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

const SERVICE_LABELS: Record<string, string> = {
  maintenance: "Yard Maintenance",
  cleanup: "Yard Cleaning",
  mulch: "Lay Mulch",
  gardening: "Gardening",
  powerwash: "Power Wash",
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  maintenance: <Scissors size={13} />,
  cleanup: <Leaf size={13} />,
  mulch: <Flower2 size={13} />,
  gardening: <Leaf size={13} />,
  powerwash: <Droplets size={13} />,
};

function serviceLabel(id: string) {
  return SERVICE_LABELS[id] ?? id;
}

function formatDate(date: Date | null | undefined) {
  if (!date) return "No date set";
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string | null | undefined) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── Status Badge ─────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-widest ${cfg.bg} ${cfg.text}`}
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border px-6 py-5 ${
        accent
          ? "bg-[#B5E61D] border-[#B5E61D]"
          : "bg-[#1A1A1A] border-white/5"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-widest mb-1 ${
          accent ? "text-[#0D0D0D]/60" : "text-white/40"
        }`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {label}
      </p>
      <p
        className={`text-4xl font-black leading-none ${
          accent ? "text-[#0D0D0D]" : "text-white"
        }`}
        style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Appointment Card ─────────────────────────────────────
function AppointmentCard({
  apt,
  expanded,
  onToggle,
  onStatusChange,
  updating,
}: {
  apt: any;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: number, status: Status) => void;
  updating: boolean;
}) {
  const dateStr = formatDate(apt.preferredDate);
  const timeStr = formatTime(apt.preferredTime);

  return (
    <div
      className={`bg-[#111111] border transition-all duration-200 ${
        expanded ? "border-[#B5E61D]/40" : "border-white/5 hover:border-white/15"
      }`}
    >
      {/* ─ Summary row ─ */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
      >
        {/* Status dot */}
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            STATUS_CONFIG[apt.status as Status]?.dot ?? "bg-gray-400"
          }`}
        />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <p
            className="text-white font-black uppercase text-base leading-none truncate"
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {apt.customerName}
          </p>
          <p
            className="text-white/40 text-xs mt-0.5 truncate"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {dateStr}
            {timeStr && <> &middot; {timeStr}</>}
            {" · "}
            {apt.services.map(serviceLabel).join(", ")}
          </p>
        </div>

        {/* Badge + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={apt.status as Status} />
          <ChevronDown
            size={18}
            className={`text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ─ Expanded details ─ */}
      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-6">
          {/* Contact + schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p
                className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Phone
              </p>
              <a
                href={`tel:${apt.customerPhone}`}
                className="flex items-center gap-1.5 text-white hover:text-[#B5E61D] transition-colors text-sm font-medium"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Phone size={13} className="text-[#B5E61D] shrink-0" />
                {apt.customerPhone}
              </a>
            </div>

            <div>
              <p
                className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Email
              </p>
              <a
                href={`mailto:${apt.customerEmail}`}
                className="flex items-center gap-1.5 text-white hover:text-[#B5E61D] transition-colors text-sm font-medium truncate"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Mail size={13} className="text-[#B5E61D] shrink-0" />
                {apt.customerEmail}
              </a>
            </div>

            <div>
              <p
                className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Date & Time
              </p>
              <div
                className="flex items-center gap-1.5 text-white text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <Calendar size={13} className="text-[#B5E61D] shrink-0" />
                {dateStr}
                {timeStr && (
                  <>
                    <Clock size={13} className="text-[#B5E61D] shrink-0 ml-1" />
                    {timeStr}
                  </>
                )}
              </div>
            </div>

            <div>
              <p
                className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-1.5"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Address
              </p>
              <div
                className="flex items-start gap-1.5 text-white text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <MapPin size={13} className="text-[#B5E61D] shrink-0 mt-0.5" />
                <span className="leading-snug">{apt.serviceAddress}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <p
              className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Services Requested
            </p>
            <div className="flex flex-wrap gap-2">
              {apt.services.map((svc: string) => (
                <span
                  key={svc}
                  className="inline-flex items-center gap-1.5 bg-[#B5E61D]/10 border border-[#B5E61D]/20 text-[#B5E61D] px-3 py-1 text-xs font-bold uppercase tracking-wide"
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {SERVICE_ICONS[svc] ?? <Scissors size={13} />}
                  {serviceLabel(svc)}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          {apt.notes && (
            <div>
              <p
                className="text-white/40 text-[0.65rem] font-bold uppercase tracking-widest mb-2"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Customer Notes
              </p>
              <div className="bg-[#1A1A1A] border border-white/5 px-4 py-3 flex gap-2">
                <FileText size={14} className="text-white/30 shrink-0 mt-0.5" />
                <p
                  className="text-white/70 text-sm leading-relaxed"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {apt.notes}
                </p>
              </div>
            </div>
          )}

          {/* Quick actions + status update */}
          <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Quick contact buttons */}
            <div className="flex gap-2">
              <a
                href={`tel:${apt.customerPhone}`}
                className="inline-flex items-center gap-1.5 bg-[#1A1A1A] border border-white/10 text-white/70 hover:text-white hover:border-[#B5E61D]/40 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Phone size={13} className="text-[#B5E61D]" />
                Call
              </a>
              <a
                href={`mailto:${apt.customerEmail}`}
                className="inline-flex items-center gap-1.5 bg-[#1A1A1A] border border-white/10 text-white/70 hover:text-white hover:border-[#B5E61D]/40 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                <Mail size={13} className="text-[#B5E61D]" />
                Email
              </a>
            </div>

            {/* Status buttons */}
            <div className="flex flex-wrap gap-2">
              {(["pending", "confirmed", "completed", "cancelled"] as Status[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => onStatusChange(apt.id, status)}
                    disabled={updating || apt.status === status}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all disabled:cursor-not-allowed ${
                      apt.status === status
                        ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} border border-current/30`
                        : "bg-[#1A1A1A] border border-white/10 text-white/50 hover:text-white hover:border-white/30"
                    }`}
                    style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                  >
                    {updating && apt.status !== status ? (
                      <Loader2 size={12} className="animate-spin inline" />
                    ) : (
                      STATUS_CONFIG[status].label
                    )}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Submitted at */}
          <p
            className="text-white/20 text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Submitted{" "}
            {new Date(apt.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────
export default function OwnerDashboard() {
  const [, setLocation] = useLocation();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  const { data: session } = trpc.admin.me.useQuery();

  useEffect(() => {
    if (session === null) {
      setLocation("/owner");
    }
  }, [session, setLocation]);

  const { data: appointments = [], isLoading, refetch } = trpc.appointments.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated.");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update status. Try again.");
    },
  });

  const logoutMutation = trpc.admin.logout.useMutation({
    onSuccess: () => setLocation("/owner"),
  });

  const handleStatusChange = (id: number, status: Status) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 size={28} className="text-[#B5E61D] animate-spin" />
      </div>
    );
  }

  if (session === null) return null;

  // ─ Derived stats
  const counts = {
    all: appointments.length,
    pending: appointments.filter((a: any) => a.status === "pending").length,
    confirmed: appointments.filter((a: any) => a.status === "confirmed").length,
    completed: appointments.filter((a: any) => a.status === "completed").length,
    cancelled: appointments.filter((a: any) => a.status === "cancelled").length,
  };

  const filtered =
    filter === "all"
      ? appointments
      : appointments.filter((a: any) => a.status === filter);

  // Sort: pending first, then by date desc
  const sorted = [...filtered].sort((a: any, b: any) => {
    const order: Record<Status, number> = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 };
    const statusDiff = order[a.status as Status] - order[b.status as Status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "confirmed", label: `Confirmed (${counts.confirmed})` },
    { key: "completed", label: `Completed (${counts.completed})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* ─── Sticky header ─────────────────────────────────── */}
      <header className="bg-[#111111] border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand */}
          <div>
            <span
              className="text-[#B5E61D] font-bold tracking-widest text-[0.55rem] uppercase block leading-none"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Rene's Outdoor Maintenance
            </span>
            <h1
              className="text-white font-black uppercase text-xl leading-none"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Owner Portal
            </h1>
          </div>

          {/* Right: email + logout */}
          <div className="flex items-center gap-4">
            <p
              className="text-white/30 text-xs hidden sm:block"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {session.email}
            </p>
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="inline-flex items-center gap-2 border border-white/10 text-white/60 hover:text-white hover:border-white/30 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* ─── Stats row ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="rule-lime block" style={{ width: "2rem" }} />
            <p
              className="text-[#B5E61D] text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Overview
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Bookings" value={counts.all} accent />
            <StatCard label="Pending" value={counts.pending} />
            <StatCard label="Confirmed" value={counts.confirmed} />
            <StatCard label="Completed" value={counts.completed} />
          </div>
        </div>

        {/* ─── Filter tabs ────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <span className="rule-lime block" style={{ width: "2rem" }} />
            <p
              className="text-[#B5E61D] text-xs font-bold uppercase tracking-widest"
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              Appointments
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                  filter === tab.key
                    ? "bg-[#B5E61D] text-[#0D0D0D]"
                    : "bg-[#1A1A1A] border border-white/10 text-white/50 hover:text-white hover:border-white/30"
                }`}
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ─── Appointment list ─ */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="text-[#B5E61D] animate-spin" />
            </div>
          ) : sorted.length > 0 ? (
            <div className="space-y-3">
              {sorted.map((apt: any) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  expanded={expandedId === apt.id}
                  onToggle={() =>
                    setExpandedId(expandedId === apt.id ? null : apt.id)
                  }
                  onStatusChange={handleStatusChange}
                  updating={updateStatusMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111111] border border-white/5 py-16 text-center">
              <ClipboardList size={32} className="text-white/20 mx-auto mb-3" />
              <p
                className="text-white/40 font-bold uppercase tracking-wide"
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {filter === "all"
                  ? "No appointments yet"
                  : `No ${filter} appointments`}
              </p>
              <p
                className="text-white/20 text-sm mt-1"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {filter === "all"
                  ? "Bookings will show up here when customers submit requests."
                  : "Switch to a different filter to see other appointments."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
