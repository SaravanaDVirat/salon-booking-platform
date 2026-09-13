import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarClock,
  Layers3,
  LogOut,
  Menu,
  Scissors,
  Search,
  Star,
  UserCog,
  Users,
  Toolbox,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const storedAdmin = sessionStorage.getItem("adminUser");

  let adminData = {};

  try {
    adminData = storedAdmin ? JSON.parse(storedAdmin) : {};
  } catch {
    adminData = {};
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: BarChart3,
    },
    {
      name: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
    {
      name: "Salons",
      path: "/admin/salons",
      icon: Scissors,
    },
    {
      name: "Salon Owners",
      path: "/admin/owners",
      icon: UserCog,
    },
    {
      name: "Staff",
      path: "/admin/staff",
      icon: Users,
    },
    {
      name: "Services",
      path: "/admin/services",
      icon: Toolbox,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Layers3,
    },
    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: CalendarClock,
    },
    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
    },
  ];

  const adminName =
    adminData?.name ||
    adminData?.email ||
    "Administrator";

  const adminInitial =
    String(adminName).charAt(0).toUpperCase() || "A";

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [location.pathname]);
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminData");

    setSidebarOpen(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell min-h-screen w-full overflow-x-hidden bg-[#f4f7fb] text-slate-900">

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="
            fixed inset-0 z-[40]
            bg-slate-950/50
            backdrop-blur-[2px]
            lg:hidden
          "
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={[
          "fixed left-0 top-0 z-[50] h-dvh",

          "w-[min(88vw,360px)]",

          "lg:w-[280px]",

          
          "border-r border-slate-800/70",
          "bg-[#0a1020]",
          "text-white",
          "shadow-[0_30px_80px_rgba(12,18,32,0.35)]",

         
          "transition-transform duration-300 ease-out",

         
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden">

        
          <div
            className="
              pointer-events-none
              absolute inset-0
              bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_28%)]
            "
          />

          <div className="relative z-10 flex h-full min-h-0 flex-col">

          
            <div
              className="
                flex shrink-0 items-center justify-between
                border-b border-white/10
                px-4 py-4
                sm:px-5 sm:py-5
              "
            >
              <div className="flex min-w-0 items-center gap-3">

                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-violet-500
                    via-purple-500
                    to-fuchsia-500
                    shadow-[0_16px_35px_rgba(168,85,247,0.45)]
                    sm:h-12 sm:w-12
                  "
                >
                  <Scissors
                    size={23}
                    className="text-white"
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      m-0
                      truncate
                      text-[1.45rem]
                      font-black
                      leading-none
                      tracking-[-0.08em]
                      text-white
                      sm:text-[1.6rem]
                    "
                  >
                    Saloni<span className="text-violet-200">que</span>
                  </h2>

                  <p
                    className="
                      mt-1
                      text-[0.56rem]
                      font-bold
                      uppercase
                      tracking-[0.22em]
                      text-slate-300
                    "
                  >
                    Admin
                  </p>
                </div>
              </div>

             
              <button
                type="button"
                aria-label="Close sidebar"
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  text-slate-300
                  transition
                  hover:border-violet-400/60
                  hover:text-white
                  lg:hidden
                "
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} strokeWidth={2.2} />
              </button>
            </div>

            
            <div className="shrink-0 px-4 pb-2 pt-5 sm:px-5">
              <p
                className="
                  text-[0.64rem]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-slate-400
                "
              >
                Main Menu
              </p>
            </div>

           
            <nav
              className="
                relative z-10
                min-h-0
                flex-1
                overflow-y-auto
                overflow-x-hidden
                overscroll-contain
                px-3
                pb-4
                [scrollbar-width:thin]
              "
            >
              <div className="space-y-1.5">

                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        [
                          "group flex w-full items-center gap-3 rounded-2xl px-3 py-3",
                          "text-sm font-semibold",
                          "transition-all duration-200",
                          "active:scale-[0.98]",

                          isActive
                            ? [
                                "bg-gradient-to-r",
                                "from-violet-500/20",
                                "to-fuchsia-500/10",
                                "text-white",
                                "ring-1 ring-violet-400/30",
                                "shadow-[0_12px_30px_rgba(139,92,246,0.18)]",
                              ].join(" ")
                            : [
                                "text-slate-300",
                                "hover:bg-white/5",
                                "hover:text-white",
                              ].join(" "),
                        ].join(" ")
                      }
                    >
                      <span
                        className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl
                          border border-white/10
                          bg-white/5
                          text-slate-200
                          transition
                          group-hover:border-violet-400/50
                          group-hover:text-violet-200
                        "
                      >
                        <Icon size={18} strokeWidth={2.1} />
                      </span>

                      <span className="min-w-0 truncate">
                        {item.name}
                      </span>
                    </NavLink>
                  );
                })}

              </div>
            </nav>

          
            <div
              className="
                relative z-10
                shrink-0
                border-t border-white/10
                bg-[#0a1020]/95
                p-3
                sm:p-4
              "
            >
              <div
                className="
                  mb-3
                  flex items-center gap-3
                  rounded-2xl
                  border border-white/10
                  bg-white/5
                  px-3 py-3
                "
              >
                <div
                  className="
                    flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500/25
                    to-fuchsia-500/20
                    text-sm font-bold
                    text-violet-200
                    ring-1 ring-violet-300/25
                  "
                >
                  {adminInitial}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {adminName}
                  </p>

                  <p
                    className="
                      truncate
                      text-[0.6rem]
                      font-medium
                      uppercase
                      tracking-[0.16em]
                      text-slate-400
                    "
                  >
                    Platform Admin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex w-full
                  items-center justify-center gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-600
                  px-4 py-3
                  text-sm font-bold text-white
                  shadow-[0_16px_30px_rgba(168,85,247,0.3)]
                  transition
                  hover:brightness-110
                  active:scale-[0.98]
                "
              >
                <LogOut size={17} strokeWidth={2.1} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen w-full min-w-0 lg:pl-[280px]">

        <header
          className="
            fixed left-0 right-0 top-0 z-[30]
            border-b border-slate-200/80
            bg-white/95
            backdrop-blur-xl
            lg:left-[280px]
          "
        >
          <div
            className="
              mx-auto
              flex min-h-[72px] w-full
              items-center
              gap-2
              px-3 py-3
              sm:px-5
              md:px-6
              lg:px-7
              xl:px-8
              2xl:px-10
            "
          >

           
            <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">


              <button
                type="button"
                aria-label="Open sidebar"
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-700
                  shadow-sm
                  transition
                  hover:border-violet-300
                  hover:text-violet-600
                  sm:h-11 sm:w-11
                  lg:hidden
                "
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} strokeWidth={2.2} />
              </button>

              <div className="hidden min-w-0 md:block">
                <p
                  className="
                    text-[0.62rem]
                    font-bold
                    uppercase
                    tracking-[0.22em]
                    text-slate-500
                    lg:text-[0.68rem]
                  "
                >
                  Overview
                </p>

                <h1
                  className="
                    m-0 mt-0.5
                    truncate
                    text-lg
                    font-black
                    leading-tight
                    tracking-[-0.05em]
                    text-slate-900
                    lg:text-xl
                  "
                >
                  Administration
                </h1>
              </div>
            </div>

         
            <div className="hidden min-w-0 flex-1 md:flex md:justify-center md:px-3 lg:px-5 xl:px-8">
              <div
                className="
                  flex w-full
                  max-w-[520px]
                  items-center gap-3
                  rounded-2xl
                  border border-slate-200
                  bg-slate-50
                  px-3 py-2.5
                  shadow-inner shadow-slate-200/50
                  transition
                  focus-within:border-violet-300
                  focus-within:bg-white
                  focus-within:ring-2
                  focus-within:ring-violet-100
                "
              >
                <Search
                  size={17}
                  className="shrink-0 text-slate-400"
                  strokeWidth={2.2}
                />

                <input
                  type="text"
                  placeholder="Search dashboard"
                  className="
                    min-w-0 w-full
                    border-0
                    bg-transparent
                    text-sm
                    text-slate-700
                    outline-none
                    placeholder:text-slate-400
                    focus:outline-none
                    focus:ring-0
                  "
                />
              </div>
            </div>

          
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">

            
              <button
                type="button"
                aria-label="Notifications"
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  border border-slate-200
                  bg-white
                  text-slate-600
                  shadow-sm
                  transition
                  hover:border-violet-300
                  hover:text-violet-600
                  sm:h-11 sm:w-11
                "
              >
                <Bell size={18} strokeWidth={2.2} />
              </button>

            
              <div
                className="
                  flex items-center gap-2
                  rounded-2xl
                  border border-slate-200
                  bg-white
                  px-2 py-2
                  shadow-sm
                  sm:gap-3 sm:px-2.5
                "
              >
                <div
                  className="
                    flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-gradient-to-br
                    from-violet-500
                    to-fuchsia-500
                    text-sm font-bold
                    text-white
                    sm:h-10 sm:w-10
                  "
                >
                  {adminInitial}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p
                    className="
                      max-w-[120px]
                      truncate
                      text-sm
                      font-bold
                      text-slate-800
                      lg:max-w-[150px]
                    "
                  >
                    {adminName}
                  </p>

                  <p
                    className="
                      text-[0.6rem]
                      font-medium
                      uppercase
                      tracking-[0.14em]
                      text-slate-500
                    "
                  >
                    Admin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

       
        <div
          className="
            min-h-screen
            w-full
            min-w-0
            px-3
            pb-6
            pt-[92px]
            sm:px-5
            sm:pt-[96px]
            md:px-6
            lg:px-7
            lg:pt-[96px]
            xl:px-8
            2xl:px-10
          "
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;