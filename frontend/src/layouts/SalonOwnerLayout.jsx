import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  FaBars,
  FaCalendarAlt,
  FaChartPie,
  FaChevronLeft,
  FaChevronRight,
  FaCut,
  FaSignOutAlt,
  FaTimes,
  FaUserTie,
  FaUsers,
  FaStore,
  FaCog,
} from "react-icons/fa";

const menuItems = [
  {
    label: "Dashboard",
    path: "/salon-owner/dashboard",
    icon: FaChartPie,
  },
  {
    label: "My Salon",
    path: "/salon-owner/salon",
    icon: FaStore,
  },
  {
    label: "Services",
    path: "/salon-owner/services",
    icon: FaCut,
  },
  {
    label: "Staff",
    path: "/salon-owner/staff",
    icon: FaUsers,
  },
  {
    label: "Appointments",
    path: "/salon-owner/appointments",
    icon: FaCalendarAlt,
  },
];

const SalonOwnerLayout = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/salon-owner/login", {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6f7fb] text-slate-900">

      {/* =========================================================
          MOBILE OVERLAY
      ========================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* =========================================================
          SIDEBAR
      ========================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen flex-col
          overflow-hidden
          border-r border-slate-800/80
          bg-[#080c19]
          text-white
          shadow-[20px_0_60px_rgba(2,6,23,0.12)]
          transition-all duration-300 ease-in-out

          ${collapsed ? "lg:w-[88px]" : "lg:w-[276px]"}

          w-[292px]

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* =======================================================
            SIDEBAR BACKGROUND EFFECTS
        ======================================================== */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-600/[0.08] blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-purple-600/[0.08] blur-3xl" />

          <div className="absolute left-0 right-0 top-1/2 h-64 bg-gradient-to-b from-transparent via-fuchsia-500/[0.025] to-transparent" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

        </div>

        {/* =======================================================
            LOGO / BRAND
        ======================================================== */}

        <div
          className={`
            relative z-10 flex h-[82px] shrink-0
            items-center border-b border-white/[0.07]
            ${collapsed ? "justify-center px-3" : "justify-between px-5"}
          `}
        >

          <div
            className={`
              flex min-w-0 items-center
              ${collapsed ? "justify-center" : "gap-3"}
            `}
          >

            {/* Logo */}
            <div className="relative shrink-0">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_10px_28px_rgba(217,70,239,0.28)]">

                <FaCut className="text-[17px]" />

              </div>

              <div className="absolute -inset-1 -z-10 rounded-2xl bg-fuchsia-500/20 blur-md" />

            </div>

            {!collapsed && (
              <div className="min-w-0">

                <h1 className="truncate text-[17px] font-black tracking-tight text-white">
                  SalonPro
                </h1>

                <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Owner Dashboard
                </p>

              </div>
            )}

          </div>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-white/[0.07] hover:text-white lg:hidden"
          >
            <FaTimes />
          </button>

        </div>

        {/* =======================================================
            SIDEBAR MENU
        ======================================================== */}

        <nav className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">

          {!collapsed && (
            <div className="mb-4 flex items-center gap-3 px-3">

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Management
              </span>

              <span className="h-px flex-1 bg-white/[0.06]" />

            </div>
          )}

          <div className="space-y-1.5">

            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    group relative flex min-h-[50px] items-center
                    rounded-2xl
                    transition-all duration-300

                    ${
                      collapsed
                        ? "justify-center px-2"
                        : "gap-3 px-3.5"
                    }

                    ${
                      isActive
                        ? "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 text-white shadow-[0_10px_28px_rgba(217,70,239,0.20)]"
                        : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                    }
                  `}
                >

                  {({ isActive }) => (
                    <>
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
                      )}

                      {/* Icon container */}
                      <span
                        className={`
                          relative flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl
                          transition-all duration-300

                          ${
                            isActive
                              ? "bg-white/15 text-white shadow-inner"
                              : "bg-white/[0.035] text-slate-400 group-hover:bg-white/[0.07] group-hover:text-white"
                          }
                        `}
                      >
                        <Icon className="text-[15px]" />
                      </span>

                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">
                            {item.label}
                          </span>

                          {isActive && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}

          </div>

        </nav>

        {/* =======================================================
            SIDEBAR BOTTOM
        ======================================================== */}

        <div className="relative z-10 shrink-0 border-t border-white/[0.07] p-3">

          {/* Account mini card */}
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.035] p-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-xs font-black text-white">
                SO
              </div>

              <div className="min-w-0 flex-1">

                <p className="truncate text-xs font-bold text-white">
                  Salon Owner
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  Owner Account
                </p>

              </div>

              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />

            </div>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`
              group flex min-h-[50px] w-full
              items-center rounded-2xl
              text-sm font-semibold
              text-red-400
              transition-all duration-300
              hover:bg-red-500/[0.08]
              hover:text-red-300

              ${
                collapsed
                  ? "justify-center px-2"
                  : "gap-3 px-3.5"
              }
            `}
          >

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/[0.06] transition-all group-hover:bg-red-500/10">

              <FaSignOutAlt className="text-sm" />

            </span>

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* =========================================================
          MAIN APPLICATION AREA
      ========================================================== */}

      <div
        className={`
          min-h-screen min-w-0
          transition-[padding] duration-300
          ${collapsed ? "lg:pl-[88px]" : "lg:pl-[276px]"}
        `}
      >

        {/* =======================================================
            TOPBAR
        ======================================================== */}

        <header className="sticky top-0 z-30 h-[74px] border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">

          <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-7 xl:px-9">

            {/* ===================================================
                LEFT TOPBAR
            ==================================================== */}

            <div className="flex min-w-0 items-center gap-3">

              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
              >
                <FaBars className="text-sm" />
              </button>

              {/* Desktop collapse */}
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={
                  collapsed
                    ? "Expand sidebar"
                    : "Collapse sidebar"
                }
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:flex"
              >
                {collapsed ? (
                  <FaChevronRight className="text-xs" />
                ) : (
                  <FaChevronLeft className="text-xs" />
                )}
              </button>

              {/* Heading */}
              <div className="min-w-0">

                <p className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">
                  Salon Management
                </p>

                <h2 className="truncate text-sm font-black tracking-tight text-slate-900 sm:text-base">
                  Owner Workspace
                </h2>

              </div>

            </div>

            {/* ===================================================
                RIGHT TOPBAR
            ==================================================== */}

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">

              {/* Status */}
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 md:flex">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.6)]" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Online
                </span>

              </div>

              {/* Divider */}
              <div className="hidden h-7 w-px bg-slate-200 md:block" />

              {/* Profile */}
              <div className="flex items-center gap-2.5">

                <div className="hidden text-right sm:block">

                  <p className="text-xs font-bold text-slate-800 sm:text-sm">
                    Salon Owner
                  </p>

                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    Owner Account
                  </p>

                </div>

                <div className="relative">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-xs font-black text-white shadow-[0_7px_20px_rgba(217,70,239,0.2)] sm:h-11 sm:w-11 sm:rounded-2xl">
                    SO
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />

                </div>

              </div>

            </div>

          </div>

        </header>

        {/* =======================================================
            PAGE CONTENT
        ======================================================== */}

        <main className="min-w-0 p-3 sm:p-5 md:p-6 lg:p-7 xl:p-8">

          <div className="mx-auto w-full max-w-[1600px] min-w-0">

            <Outlet />

          </div>

        </main>

      </div>

    </div>
  );
};

export default SalonOwnerLayout;