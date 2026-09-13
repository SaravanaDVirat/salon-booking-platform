import React, { useState } from "react";
import {
  FaBars,
  FaXmark,
  FaHouse,
  FaStore,
  FaCalendarCheck,
  FaUser,
  FaRightFromBracket,
  FaChevronDown,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const CustomerHeader = () => {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  const userData = sessionStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const userName = user?.name || "Customer";

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");

    setProfileMenu(false);
    setMobileMenu(false);

    navigate("/", { replace: true });
  };

  const goHome = () => {
    setMobileMenu(false);
    navigate("/");
  };

  const goSalons = () => {
    setMobileMenu(false);
    navigate("/salons");
  };

  const goAppointments = () => {
    setMobileMenu(false);
    navigate("/customer/appointments");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">

      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <button
          onClick={goHome}
          className="group flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-700 to-fuchsia-600 text-xl font-bold text-white shadow-lg shadow-violet-200">
            L
          </div>

          <div className="text-left">
            <div className="text-xl font-black tracking-[0.18em] text-slate-900">
              LUMORA
            </div>

            <div className="hidden text-[9px] font-semibold tracking-[0.22em] text-slate-400 sm:block">
              BEAUTY • TIME • PLACE
            </div>
          </div>
        </button>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-2 lg:flex">

          <button
            onClick={goHome}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
          >
            <FaHouse />
            Home
          </button>

          <button
            onClick={goSalons}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
          >
            <FaStore />
            Discover Salons
          </button>

          <button
            onClick={goAppointments}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
          >
            <FaCalendarCheck />
            My Appointments
          </button>

        </nav>

        {/* DESKTOP PROFILE */}
        <div className="relative hidden lg:block">

          <button
            onClick={() => setProfileMenu((prev) => !prev)}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:border-violet-200 hover:bg-violet-50"
          >

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <FaUser />
            </div>

            <div className="max-w-[140px] text-left">
              <p className="truncate text-sm font-bold text-slate-800">
                {userName}
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Customer
              </p>
            </div>

            <FaChevronDown className="text-xs text-slate-400" />

          </button>

          {profileMenu && (
            <div className="absolute right-0 top-[58px] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">

              <button
                onClick={goAppointments}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700"
              >
                <FaCalendarCheck />
                My Appointments
              </button>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <FaRightFromBracket />
                Logout
              </button>

            </div>
          )}

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenu((prev) => !prev)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
        >
          {mobileMenu ? <FaXmark /> : <FaBars />}
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 shadow-xl lg:hidden">

          <div className="mx-auto max-w-[1440px] space-y-2">

            <button
              onClick={goHome}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"
            >
              <FaHouse />
              Home
            </button>

            <button
              onClick={goSalons}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"
            >
              <FaStore />
              Discover Salons
            </button>

            <button
              onClick={goAppointments}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700"
            >
              <FaCalendarCheck />
              My Appointments
            </button>

            <div className="my-2 border-t border-slate-100" />

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                <FaUser />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {userName}
                </p>

                <p className="text-xs text-slate-400">
                  Customer
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <FaRightFromBracket />
              Logout
            </button>

          </div>

        </div>
      )}

    </header>
  );
};

export default CustomerHeader;