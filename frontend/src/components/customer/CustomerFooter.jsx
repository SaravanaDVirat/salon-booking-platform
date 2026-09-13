import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaXTwitter,
} from "react-icons/fa6";

const CustomerFooter = () => {
  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-slate-950 text-white">

      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-1">

            <button
              onClick={scrollTop}
              className="flex items-center gap-2"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-black">
                L
              </div>

              <span className="text-2xl font-black tracking-[0.18em]">
                LUMORA
              </span>
            </button>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Your Beauty. Your Time. Your Place.
              Discover premium salons, beauty services
              and trusted stylists in one beautiful platform.
            </p>

            <div className="mt-6 flex gap-3">

              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-violet-600 hover:text-white">
                <FaInstagram />
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-violet-600 hover:text-white">
                <FaFacebookF />
              </button>

              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-violet-600 hover:text-white">
                <FaXTwitter />
              </button>

            </div>

          </div>

          {/* PLATFORM */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Platform
            </h3>

            <div className="space-y-3 text-sm text-slate-400">
              <button className="block hover:text-white">
                Discover Salons
              </button>

              <button className="block hover:text-white">
                Services
              </button>

              <button className="block hover:text-white">
                How It Works
              </button>
            </div>
          </div>

          {/* CUSTOMER */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Customer
            </h3>

            <div className="space-y-3 text-sm text-slate-400">
              <button className="block hover:text-white">
                My Appointments
              </button>

              <button className="block hover:text-white">
                Booking History
              </button>

              <button className="block hover:text-white">
                Help & Support
              </button>
            </div>
          </div>

          {/* BUSINESS */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Business
            </h3>

            <div className="space-y-3 text-sm text-slate-400">
              <button className="block hover:text-white">
                Become a Salon Partner
              </button>

              <button className="block hover:text-white">
                Partner Login
              </button>

              <button className="block hover:text-white">
                Business Support
              </button>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-7">

          <div className="flex flex-col gap-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © 2026 LUMORA. All rights reserved.
            </p>

            <div className="flex gap-5">
              <button className="hover:text-white">
                Privacy
              </button>

              <button className="hover:text-white">
                Terms
              </button>
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default CustomerFooter;