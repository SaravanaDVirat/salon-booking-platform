import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarCheck2,
  Layers3,
  RefreshCcw,
  Scissors,
  Star,
  TrendingUp,
  Users,
  UserRoundCheck,
} from "lucide-react";
import api from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/dashboard");
      setStats(response.data?.data || response.data || {});
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const safeStats = stats || {
    totalCustomers: 0,
    totalSalonOwners: 0,
    totalSalons: 0,
    totalAppointments: 0,
    totalStaff: 0,
    totalServices: 0,
    totalCategories: 0,
    totalReviews: 0,
    totalUsers: 0,
    activeSalons: 0,
    inactiveSalons: 0,
  };

  const cards = [
    { title: "Total Customers", value: safeStats.totalCustomers, change: "+12.4%", gradient: "from-violet-500 to-purple-600", icon: Users },
    { title: "Salon Owners", value: safeStats.totalSalonOwners, change: "+8.1%", gradient: "from-cyan-500 to-blue-600", icon: UserRoundCheck },
    { title: "Total Salons", value: safeStats.totalSalons, change: "+5.3%", gradient: "from-fuchsia-500 to-pink-600", icon: Scissors },
    { title: "Appointments", value: safeStats.totalAppointments, change: "+18.2%", gradient: "from-emerald-500 to-teal-600", icon: CalendarCheck2 },
    { title: "Staff Members", value: safeStats.totalStaff, change: "+9.7%", gradient: "from-amber-500 to-orange-600", icon: Users },
    { title: "Services", value: safeStats.totalServices, change: "+6.8%", gradient: "from-rose-500 to-red-600", icon: Activity },
    { title: "Categories", value: safeStats.totalCategories, change: "+4.1%", gradient: "from-indigo-500 to-violet-600", icon: Layers3 },
    { title: "Reviews", value: safeStats.totalReviews, change: "+21.0%", gradient: "from-yellow-500 to-amber-600", icon: Star },
  ];

  const progressPercent = safeStats.totalSalons > 0 ? (safeStats.activeSalons / safeStats.totalSalons) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.06)]">
          <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-10 w-52 animate-pulse rounded-2xl bg-slate-200" />
          <div className="mt-3 h-5 w-80 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-[26px] border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="max-w-md rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(239,68,68,0.08)]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <Activity size={28} strokeWidth={2.2} />
          </div>
          <h3 className="text-2xl font-black tracking-[-0.06em] text-slate-900">Unable to load dashboard</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={fetchDashboardStats}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5"
          >
            <RefreshCcw size={16} strokeWidth={2.2} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-[#0a1020] via-[#141d34] to-[#261b45] p-6 text-white shadow-[0_30px_80px_rgba(15,23,42,0.2)] sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.28em] text-violet-200 uppercase">
              Overview
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.08em] text-white sm:text-4xl lg:text-5xl">
              Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Here&apos;s what&apos;s happening across your salon platform right now.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardStats}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:border-violet-300/60 hover:bg-white/10"
          >
            <RefreshCcw size={16} strokeWidth={2.2} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="group rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(124,58,237,0.12)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient}`}>
                  <Icon size={22} className="text-white" strokeWidth={2.2} />
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.14em] text-emerald-600 uppercase">
                  Live
                </span>
              </div>

              <div className="mt-8">
                <p className="text-[2.1rem] font-black tracking-[-0.08em] text-slate-900">
                  {card.value}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <TrendingUp size={14} className="text-emerald-500" strokeWidth={2.5} />
                  <span className="text-xs font-bold text-emerald-600">{card.change}</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.05em] text-slate-900">Salon Status</h3>
              <p className="mt-1 text-sm text-slate-500">Current platform salon activity</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Scissors size={22} strokeWidth={2.1} />
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-slate-700">Active Salons</span>
                </div>
                <strong className="text-lg font-black text-slate-900">{safeStats.activeSalons}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Operational rate</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="text-sm font-semibold text-slate-700">Inactive Salons</span>
                </div>
                <strong className="text-lg font-black text-slate-900">{safeStats.inactiveSalons}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.05em] text-slate-900">Platform Summary</h3>
              <p className="mt-1 text-sm text-slate-500">Overall system statistics</p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Activity size={22} strokeWidth={2.1} />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {[
              ["Total Users", safeStats.totalUsers],
              ["Total Salons", safeStats.totalSalons],
              ["Total Staff", safeStats.totalStaff],
              ["Total Appointments", safeStats.totalAppointments],
              ["Total Reviews", safeStats.totalReviews],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">{label}</span>
                <strong className="text-base font-black text-slate-900">{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.05em] text-slate-900">Performance</h3>
              <p className="mt-1 text-sm text-slate-500">This month growth</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight size={14} strokeWidth={2.6} />
              +24.8%
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {[
              ["Bookings", 82],
              ["Revenue", 67],
              ["Retention", 74],
            ].map(([label, value], index) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>{label}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={[
                      "h-full rounded-full",
                      index === 0 && "bg-gradient-to-r from-violet-500 to-purple-500",
                      index === 1 && "bg-gradient-to-r from-cyan-500 to-blue-500",
                      index === 2 && "bg-gradient-to-r from-emerald-500 to-teal-500",
                    ].join(" ")}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black tracking-[-0.05em] text-slate-900">Quick Notes</h3>
              <p className="mt-1 text-sm text-slate-500">Operational highlights</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Star size={20} strokeWidth={2.2} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "New salon partners onboarded this week.",
              "Customer satisfaction score remains above target.",
              "Staff scheduling is balanced across all locations.",
            ].map((note) => (
              <div key={note} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-violet-500" />
                <p className="text-sm leading-6 text-slate-600">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;