import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowRight,
  FaArrowTrendUp,
  FaBars,
  FaCalendarCheck,
  FaChevronDown,
  FaCircleCheck,
  FaClock,
  FaFacebookF,
  FaGem,
  FaGoogle,
  FaInstagram,
  FaLocationDot,
  FaMagnifyingGlass,
  FaRegHeart,
  FaScissors,
  FaShieldHalved,
  FaSpa,
  FaStar,
  FaStore,
  FaUser,
  FaUserCheck,
  FaUserTie,
  FaXmark,
  FaYoutube,
} from "react-icons/fa6";

const CustomerHome = () => {
  const navigate = useNavigate();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [loginMenu, setLoginMenu] = useState(false);
  const [registerMenu, setRegisterMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleCustomerFeature = (target = "/salons") => {
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const user = sessionStorage.getItem("user");

  setMobileMenu(false);
  setLoginMenu(false);
  setRegisterMenu(false);

  if (!token || role !== "CUSTOMER" || !user) {
    navigate("/customer/login", {
      state: {
        from: target,
      },
    });

    return;
  }

  navigate(target);
};
  const categories = [
    {
      name: "Hair Styling",
      count: "320+ salons",
      icon: <FaScissors />,
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Facial & Skin",
      count: "280+ salons",
      icon: <FaSpa />,
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Nail Care",
      count: "190+ salons",
      icon: <FaGem />,
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Spa & Wellness",
      count: "150+ salons",
      icon: <FaSpa />,
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Makeup",
      count: "210+ salons",
      icon: <FaStar />,
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Men's Grooming",
      count: "240+ salons",
      icon: <FaUserTie />,
      image:
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const featuredSalons = [
    {
      name: "The Velvet Studio",
      location: "T. Nagar, Chennai",
      rating: "4.9",
      reviews: "248",
      price: "₹499",
      tag: "Luxury Pick",
      image:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Aura Beauty Lounge",
      location: "Anna Nagar, Chennai",
      rating: "4.8",
      reviews: "186",
      price: "₹399",
      tag: "Top Rated",
      image:
        "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=85",
    },
    {
      name: "Maison Hair & Spa",
      location: "Adyar, Chennai",
      rating: "4.9",
      reviews: "312",
      price: "₹599",
      tag: "Editor's Choice",
      image:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=85",
    },
  ];

  const treatments = [
    {
      name: "Signature Haircut",
      category: "Hair",
      duration: "45 min",
      price: "₹499",
      oldPrice: "₹699",
      image:
        "https://images.unsplash.com/photo-1622288432450-277d0fef5ed9?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Glow Facial",
      category: "Facial",
      duration: "60 min",
      price: "₹899",
      oldPrice: "₹1,199",
      image:
        "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Luxury Manicure",
      category: "Nails",
      duration: "50 min",
      price: "₹699",
      oldPrice: "₹899",
      image:
        "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Relaxing Spa",
      category: "Wellness",
      duration: "90 min",
      price: "₹1,299",
      oldPrice: "₹1,699",
      image:
        "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const testimonials = [
    {
      name: "Ananya R.",
      role: "Verified Customer",
      text: "Finding a good salon used to take so much time. LUMORA made the entire process incredibly simple. I found a beautiful salon and booked my appointment in minutes.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Karthik S.",
      role: "Verified Customer",
      text: "I love that I can actually choose the stylist, see the service details and check availability before booking. The experience feels premium from start to finish.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Priya M.",
      role: "Verified Customer",
      text: "The salon discovery experience is amazing. Clean interface, genuine reviews and no unnecessary calls. Exactly what a modern beauty platform should feel like.",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80",
    },
  ];

  const faqs = [
    {
      question: "What is LUMORA?",
      answer:
        "LUMORA is a modern salon and beauty booking platform that helps customers discover salons, explore services, choose their preferred stylist and book appointments online.",
    },
    {
      question: "Can I choose a specific stylist?",
      answer:
        "Yes. When a salon provides stylist availability, you can select your preferred staff member while booking your service.",
    },
    {
      question: "Can I book different services at different salons?",
      answer:
        "Absolutely. You can explore multiple salons and choose the salon that best matches your preferred service, price, location and availability.",
    },
    {
      question: "How do I manage my appointments?",
      answer:
        "After signing in as a customer, you can view your upcoming and previous appointments, check appointment details and manage eligible bookings.",
    },
    {
      question: "Can salon owners register on LUMORA?",
      answer:
        "Yes. Salon owners can create a dedicated salon-owner account and manage their salons, services, staff and appointments through the platform.",
    },
  ];

  const scrollToSection = (id) => {
    setMobileMenu(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fcfafc] text-slate-900">
      {/* =========================================================
          TOP ANNOUNCEMENT
      ========================================================== */}
      <div className="bg-[#211326] px-4 py-2.5 text-center text-[11px] font-bold tracking-[0.18em] text-white sm:text-xs">
        <span className="mr-2 hidden sm:inline">✦</span>
        BEAUTY EXPERIENCES, CURATED FOR YOU
        <span className="mx-2 text-fuchsia-300">•</span>
        DISCOVER. CHOOSE. BOOK.
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================== */}
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-14">
          {/* Logo */}
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#251329] text-white shadow-lg shadow-purple-950/10 transition-transform duration-300 group-hover:rotate-3">
              <span className="font-serif text-2xl italic">L</span>

              <span className="absolute right-[7px] top-[7px] text-[8px] text-fuchsia-300">
                ✦
              </span>
            </div>

            <div className="text-left">
              <div className="font-serif text-[23px] font-black tracking-[0.13em] text-[#251329]">
                LUMORA
              </div>

              <div className="-mt-1 text-[8px] font-bold tracking-[0.28em] text-slate-400">
                BEAUTY • BOOKING
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="text-sm font-bold text-[#251329]"
            >
              Home
            </button>

            <button
              onClick={() => handleCustomerFeature("/salons")}
              className="text-sm font-semibold text-slate-500 transition hover:text-[#251329]"
            >
              Discover Salons
            </button>

            <button
              onClick={() => handleCustomerFeature("/salons")}
              className="text-sm font-semibold text-slate-500 transition hover:text-[#251329]"
            >
              Services
            </button>

            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-semibold text-slate-500 transition hover:text-[#251329]"
            >
              How It Works
            </button>

            <button
              onClick={() => scrollToSection("about")}
              className="text-sm font-semibold text-slate-500 transition hover:text-[#251329]"
            >
              About
            </button>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden items-center gap-2 sm:flex">
            <div className="relative">
              <button
                onClick={() => {
                  setLoginMenu(!loginMenu);
                  setRegisterMenu(false);
                }}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Login

                <FaChevronDown
                  className={`text-[10px] transition-transform ${
                    loginMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {loginMenu && (
                <div className="absolute right-0 top-12 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Sign in as
                  </p>

                  <button
                    onClick={() => navigate("/customer/login")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-purple-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <FaUser />
                    </span>

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Customer
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Book beauty appointments
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/salon-owner/login")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-rose-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                      <FaStore />
                    </span>

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Salon Owner
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Manage your salon
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => navigate("/admin/login")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-100"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <FaShieldHalved />
                    </span>

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Administrator
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Platform administration
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setRegisterMenu(!registerMenu);
                  setLoginMenu(false);
                }}
                className="flex items-center gap-2 rounded-xl bg-[#251329] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-950/10 transition hover:-translate-y-0.5 hover:bg-[#351c3d]"
              >
                Get Started

                <FaArrowRight className="text-xs" />
              </button>

              {registerMenu && (
                <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-900/10">
                  <p className="px-3 pb-2 pt-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                    Create account
                  </p>

                  <button
                    onClick={() => navigate("/customer/register")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-purple-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                      <FaUser />
                    </span>

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Customer Account
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Start booking today
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      navigate("/salon-owner/register")
                    }
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-rose-50"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                      <FaStore />
                    </span>

                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        Salon Owner Account
                      </span>

                      <span className="text-[11px] text-slate-400">
                        Grow your beauty business
                      </span>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 sm:hidden"
          >
            {mobileMenu ? <FaXmark /> : <FaBars />}
          </button>
        </div>

        {/* =====================================================
            MOBILE NAVIGATION
        ====================================================== */}
        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 sm:hidden">
            <div className="space-y-1">
              <button
                onClick={() => {
                  setMobileMenu(false);

                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-[#251329]"
              >
                Home
              </button>

              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Discover Salons
              </button>

              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Services
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                How It Works
              </button>

              <button
                onClick={() => scrollToSection("about")}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                About
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-4">
              <button
                onClick={() => navigate("/customer/login")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
              >
                Customer Login
              </button>

              <button
                onClick={() => navigate("/salon-owner/login")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
              >
                Salon Owner Login
              </button>

              <button
                onClick={() => navigate("/admin/login")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700"
              >
                Admin Login
              </button>

              <button
                onClick={() => navigate("/customer/register")}
                className="rounded-xl bg-[#251329] px-4 py-3 text-sm font-bold text-white"
              >
                Register as Customer
              </button>

              <button
                onClick={() => navigate("/salon-owner/register")}
                className="rounded-xl bg-rose-100 px-4 py-3 text-sm font-bold text-rose-800"
              >
                Register as Salon Owner
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================
          HERO
      ========================================================== */}
      <main>
        <section className="relative overflow-hidden bg-[#f8f2f7]">
          <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl" />

          <div className="pointer-events-none absolute right-[-100px] top-20 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-rose-200/20 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] w-full max-w-[1500px] items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24 xl:px-14">
            {/* Hero Content */}
            <div className="relative z-10 max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-white/70 px-3.5 py-2 text-[10px] font-black tracking-[0.18em] text-purple-800 shadow-sm backdrop-blur sm:text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  ✦
                </span>

                BEAUTY, REDEFINED
              </div>

              <h1 className="max-w-4xl font-serif text-[44px] font-black leading-[0.98] tracking-[-0.035em] text-[#251329] sm:text-6xl md:text-7xl lg:text-[74px] xl:text-[88px]">
                Find your perfect salon.

                <span className="mt-2 block bg-gradient-to-r from-[#7c3aed] via-[#c026d3] to-[#be185d] bg-clip-text text-transparent">
                  Book your perfect moment.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Discover exceptional salons, explore treatments you’ll love,
                choose your preferred stylist and reserve your next beauty
                experience — all in one beautiful place.
              </p>

              {/* Search Box */}
              <div className="mt-9 rounded-[24px] border border-white bg-white p-2 shadow-[0_25px_70px_rgba(37,19,41,0.12)] sm:rounded-[28px] sm:p-2.5">
                <div className="grid gap-2 md:grid-cols-[1fr_0.7fr_auto]">
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl px-3 py-3.5 sm:px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                      <FaMagnifyingGlass />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Discover
                      </p>

                      <input
                        type="text"
                        placeholder="Salon, service or treatment"
                        className="mt-0.5 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border-t border-slate-100 px-3 py-3.5 md:border-l md:border-t-0 sm:px-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                      <FaLocationDot />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                        Location
                      </p>

                      <input
                        type="text"
                        placeholder="Chennai"
                        className="mt-0.5 w-full min-w-0 bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleCustomerFeature("/salons")}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#251329] px-6 py-4 text-sm font-black text-white transition hover:bg-[#3a1d42] md:px-7"
                  >
                    Search

                    <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-2">
                  <FaCircleCheck className="text-emerald-500" />
                  Verified salons
                </span>

                <span className="flex items-center gap-2">
                  <FaCircleCheck className="text-emerald-500" />
                  Real-time availability
                </span>

                <span className="flex items-center gap-2">
                  <FaCircleCheck className="text-emerald-500" />
                  Easy booking
                </span>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mx-auto w-full max-w-[620px] lg:ml-auto">
              <div className="absolute -inset-4 rounded-[45px] bg-gradient-to-br from-purple-300/30 via-transparent to-rose-300/30 blur-2xl" />

              <div className="relative overflow-hidden rounded-[36px] border-[7px] border-white bg-white shadow-[0_35px_100px_rgba(45,20,50,0.2)] sm:rounded-[44px]">
                <img
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=90"
                  alt="Luxury salon"
                  className="h-[430px] w-full object-cover sm:h-[550px] lg:h-[590px]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#211326]/60 via-transparent to-transparent" />

                {/* Rating Floating Card */}
                <div className="absolute left-4 top-4 rounded-2xl border border-white/50 bg-white/90 p-3 shadow-xl backdrop-blur-xl sm:left-6 sm:top-6 sm:p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                      <FaStar />
                    </div>

                    <div>
                      <div className="text-sm font-black text-slate-900">
                        4.9/5
                      </div>

                      <div className="text-[10px] font-semibold text-slate-400">
                        Customer rating
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-auto sm:w-[310px] sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-purple-600">
                        Trending this week
                      </p>

                      <h3 className="mt-1 font-serif text-xl font-black text-[#251329]">
                        Signature Hair Studio
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <FaRegHeart />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <FaLocationDot className="text-rose-500" />
                      Chennai
                    </span>

                    <span className="flex items-center gap-1">
                      <FaStar className="text-amber-400" />
                      4.9
                    </span>
                  </div>

                  <button
                    onClick={() => handleCustomerFeature("/salons")}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#251329] py-3 text-xs font-black text-white"
                  >
                    Explore salon
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              {/* Floating Availability */}
              <div className="absolute -right-3 top-1/3 hidden rounded-2xl border border-white bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:block xl:-right-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <FaCalendarCheck />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Availability
                    </p>

                    <p className="mt-0.5 text-sm font-black text-slate-800">
                      12 slots today
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            TRUST STATS
        ========================================================== */}
        <section className="border-b border-slate-100 bg-white">
          <div className="mx-auto grid max-w-[1350px] grid-cols-2 divide-x divide-y divide-slate-100 px-4 py-7 sm:grid-cols-4 sm:divide-y-0 sm:px-6 lg:px-10">
            {[
              ["500+", "Partner salons"],
              ["10K+", "Appointments booked"],
              ["4.9/5", "Average rating"],
              ["98%", "Happy customers"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="px-4 py-3 text-center sm:px-6 lg:px-10"
              >
                <p className="font-serif text-2xl font-black text-[#251329] sm:text-3xl">
                  {value}
                </p>

                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================
            CATEGORIES
        ========================================================== */}
        <section
          id="categories"
          className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 sm:text-xs">
                  <span className="h-px w-7 bg-purple-500" />
                  Explore by category
                </div>

                <h2 className="max-w-2xl font-serif text-4xl font-black tracking-tight text-[#251329] sm:text-5xl">
                  Everything beauty,
                  <span className="text-purple-600">
                    {" "}
                    beautifully curated.
                  </span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  From everyday grooming to indulgent self-care, discover
                  treatments designed around the way you want to feel.
                </p>
              </div>

              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="group flex w-fit items-center gap-2 text-sm font-black text-[#251329]"
              >
                View all categories

                <FaArrowRight className="transition group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => handleCustomerFeature("/salons")}
                  className="group relative h-[230px] overflow-hidden rounded-[24px] text-left shadow-sm sm:h-[270px]"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b0d20] via-[#1b0d20]/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-purple-700 shadow-lg backdrop-blur">
                      {category.icon}
                    </div>

                    <h3 className="font-serif text-lg font-black text-white sm:text-xl">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-[10px] font-bold text-white/65 sm:text-xs">
                      {category.count}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            FEATURED SALONS
        ========================================================== */}
        <section className="bg-[#f8f4f8] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 sm:text-xs">
                  <span className="h-px w-7 bg-rose-500" />
                  Handpicked for you
                </div>

                <h2 className="font-serif text-4xl font-black tracking-tight text-[#251329] sm:text-5xl">
                  Beautiful places.
                  <span className="block text-rose-600">
                    Exceptional experiences.
                  </span>
                </h2>
              </div>

              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="group flex w-fit items-center gap-2 text-sm font-black text-[#251329]"
              >
                Explore all salons

                <FaArrowRight className="transition group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featuredSalons.map((salon) => (
                <article
                  key={salon.name}
                  className="group overflow-hidden rounded-[28px] border border-white bg-white shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(37,19,41,0.12)]"
                >
                  <div className="relative h-[270px] overflow-hidden">
                    <img
                      src={salon.image}
                      alt={salon.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#251329]">
                      {salon.tag}
                    </div>

                    <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white">
                      <FaRegHeart />
                    </button>

                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-800">
                        <FaStar className="text-amber-400" />
                        {salon.rating}
                      </div>

                      <span className="text-xs font-semibold text-white/90">
                        {salon.reviews} reviews
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl font-black text-[#251329]">
                          {salon.name}
                        </h3>

                        <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <FaLocationDot className="text-rose-500" />
                          {salon.location}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          Services from
                        </p>

                        <p className="mt-1 font-serif text-xl font-black text-[#251329]">
                          {salon.price}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Open today
                      </div>

                      <button
                        onClick={() => handleCustomerFeature("/salons")}
                        className="flex items-center gap-2 text-xs font-black text-[#251329]"
                      >
                        View salon
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            TREATMENTS
        ========================================================== */}
        <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 sm:text-xs">
                <span className="h-px w-7 bg-purple-500" />
                Popular treatments
                <span className="h-px w-7 bg-purple-500" />
              </div>

              <h2 className="font-serif text-4xl font-black tracking-tight text-[#251329] sm:text-5xl">
                Treat yourself to something special.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                Discover highly-loved treatments from salons customers keep
                coming back to.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {treatments.map((item) => (
                <article
                  key={item.name}
                  className="group overflow-hidden rounded-[25px] border border-slate-100 bg-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 backdrop-blur">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-xl font-black text-[#251329]">
                      {item.name}
                    </h3>

                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <FaClock />
                      {item.duration}
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <span className="font-serif text-xl font-black text-[#251329]">
                          {item.price}
                        </span>

                        <span className="ml-2 text-xs font-semibold text-slate-400 line-through">
                          {item.oldPrice}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCustomerFeature("/salons")}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 transition hover:bg-[#251329] hover:text-white"
                      >
                        <FaArrowRight className="text-xs" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            WHY LUMORA
        ========================================================== */}
        <section
          id="about"
          className="scroll-mt-24 overflow-hidden bg-[#251329] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-10 xl:px-14"
        >
          <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300 sm:text-xs">
                <span className="h-px w-7 bg-fuchsia-300" />
                Why LUMORA
              </div>

              <h2 className="max-w-xl font-serif text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Beauty booking,
                <span className="block text-fuchsia-300">
                  without the guesswork.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                We believe booking a beauty appointment should feel as
                effortless as the experience itself. LUMORA brings salons,
                services, stylists and availability together in one seamless
                experience.
              </p>

              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="mt-8 flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#251329] transition hover:-translate-y-0.5"
              >
                Start exploring
                <FaArrowRight />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: <FaShieldHalved />,
                  title: "Verified salons",
                  text: "Discover trusted beauty businesses with detailed profiles and transparent information.",
                },
                {
                  icon: <FaCalendarCheck />,
                  title: "Easy booking",
                  text: "Choose your service, stylist, date and available time slot without unnecessary calls.",
                },
                {
                  icon: <FaUserCheck />,
                  title: "Choose your stylist",
                  text: "When available, select the professional you feel most comfortable booking with.",
                },
                {
                  icon: <FaArrowTrendUp />,
                  title: "Better discovery",
                  text: "Compare salons, services, ratings and experiences before making your decision.",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[25px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur transition hover:bg-white/[0.1]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-fuchsia-300">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 font-serif text-xl font-black">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/50">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================== */}
        <section
          id="how-it-works"
          className="scroll-mt-24 bg-[#faf7fa] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14"
        >
          <div className="mx-auto max-w-[1300px]">
            <div className="text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 sm:text-xs">
                <span className="h-px w-7 bg-rose-500" />
                Simple by design
                <span className="h-px w-7 bg-rose-500" />
              </div>

              <h2 className="font-serif text-4xl font-black text-[#251329] sm:text-5xl">
                Your next beauty moment is three steps away.
              </h2>
            </div>

            <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
              <div className="absolute left-[18%] right-[18%] top-12 hidden h-px bg-gradient-to-r from-purple-200 via-rose-200 to-purple-200 md:block" />

              {[
                {
                  number: "01",
                  icon: <FaMagnifyingGlass />,
                  title: "Discover",
                  text: "Search salons, explore services and find the beauty experience that matches you.",
                },
                {
                  number: "02",
                  icon: <FaUserCheck />,
                  title: "Choose",
                  text: "Compare ratings, treatments, prices and available stylists before deciding.",
                },
                {
                  number: "03",
                  icon: <FaCalendarCheck />,
                  title: "Book",
                  text: "Pick your date and available time slot, then confirm your appointment in moments.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="relative z-10 text-center"
                >
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#faf7fa] bg-[#251329] text-2xl text-white shadow-xl shadow-purple-950/10">
                    {step.icon}
                  </div>

                  <p className="mt-5 text-[10px] font-black tracking-[0.2em] text-purple-600">
                    STEP {step.number}
                  </p>

                  <h3 className="mt-2 font-serif text-2xl font-black text-[#251329]">
                    {step.title}
                  </h3>

                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            TESTIMONIALS
        ========================================================== */}
        <section className="bg-white px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 sm:text-xs">
                  <span className="h-px w-7 bg-purple-500" />
                  Loved by customers
                </div>

                <h2 className="font-serif text-4xl font-black text-[#251329] sm:text-5xl">
                  Real experiences.
                  <span className="block text-purple-600">
                    Real confidence.
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                <FaStar className="text-amber-400" />
                4.9 average rating from verified customers
              </div>
            </div>

            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {testimonials.map((review) => (
                <article
                  key={review.name}
                  className="rounded-[28px] border border-slate-100 bg-[#fcfafc] p-6 sm:p-8"
                >
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="text-xs" />
                    ))}
                  </div>

                  <p className="mt-6 font-serif text-lg font-bold leading-8 text-[#251329]">
                    “{review.text}”
                  </p>

                  <div className="mt-7 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <img
                      src={review.image}
                      alt={review.name}
                      className="h-11 w-11 rounded-full object-cover"
                    />

                    <div>
                      <p className="text-sm font-black text-slate-800">
                        {review.name}
                      </p>

                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {review.role}
                      </p>
                    </div>

                    <FaCircleCheck className="ml-auto text-sm text-emerald-500" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================
            SALON OWNER CTA
        ========================================================== */}
        <section className="px-4 py-8 sm:px-6 lg:px-10 xl:px-14">
          <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[35px] bg-gradient-to-br from-[#3a1d42] via-[#251329] to-[#170c1c] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />

            <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-purple-500/20 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300 sm:text-xs">
                  <FaStore />
                  For salon owners
                </div>

                <h2 className="max-w-3xl font-serif text-4xl font-black leading-tight sm:text-5xl">
                  Your salon deserves to be discovered.
                </h2>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
                  Join LUMORA and bring your salon, services, staff and
                  appointments into one modern platform built to help beauty
                  businesses grow.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  {[
                    "Manage your salon",
                    "Manage services",
                    "Manage staff",
                    "Track appointments",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold text-white/70"
                    >
                      <FaCircleCheck className="text-fuchsia-300" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate("/salon-owner/register")}
                className="flex items-center justify-center gap-3 rounded-2xl bg-white px-7 py-4 text-sm font-black text-[#251329] shadow-xl transition hover:-translate-y-1"
              >
                Register your salon
                <FaArrowRight />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================
            FAQ
        ========================================================== */}
        <section className="bg-[#faf7fa] px-4 py-20 sm:px-6 sm:py-24 lg:px-10 xl:px-14">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 sm:text-xs">
                <span className="h-px w-7 bg-purple-500" />
                Frequently asked
              </div>

              <h2 className="font-serif text-4xl font-black leading-tight text-[#251329] sm:text-5xl">
                Questions,
                <span className="block text-purple-600">
                  answered.
                </span>
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500">
                Everything you need to know before your first LUMORA booking.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className={`overflow-hidden rounded-2xl border transition ${
                      isOpen
                        ? "border-purple-200 bg-white shadow-sm"
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setOpenFaq(isOpen ? -1 : index)
                      }
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                    >
                      <span className="text-sm font-black text-[#251329] sm:text-base">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "bg-purple-100 text-purple-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FaChevronDown
                          className={`text-xs transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                        <p className="border-t border-slate-100 pt-4 text-sm leading-7 text-slate-500">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================
            FINAL CTA
        ========================================================== */}
        <section className="relative overflow-hidden bg-[#f8eef7] px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#251329] text-xl text-white shadow-xl">
              ✦
            </div>

            <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-purple-700 sm:text-xs">
              Your next chapter starts here
            </p>

            <h2 className="mt-4 font-serif text-4xl font-black tracking-tight text-[#251329] sm:text-6xl">
              Ready for your next
              <span className="block text-purple-600">
                beauty moment?
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
              Find a salon you love, choose a treatment that feels right and
              book your next appointment with confidence.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => handleCustomerFeature("/salons")}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#251329] px-7 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#3a1d42]"
              >
                Explore salons
                <FaArrowRight />
              </button>

              <button
                onClick={() => navigate("/customer/register")}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-black text-[#251329] transition hover:-translate-y-1"
              >
                Create free account
                <FaUser />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER
      ========================================================== */}
      <footer className="bg-[#171018] px-4 pb-8 pt-14 text-white sm:px-6 lg:px-10 xl:px-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#251329]">
                  <span className="font-serif text-2xl italic">
                    L
                  </span>
                </div>

                <div>
                  <div className="font-serif text-2xl font-black tracking-[0.13em]">
                    LUMORA
                  </div>

                  <div className="text-[8px] font-bold tracking-[0.28em] text-white/30">
                    BEAUTY • BOOKING
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/45">
                A modern beauty discovery and booking experience designed to
                help you find salons, discover treatments and book moments
                worth remembering.
              </p>

              <div className="mt-6 flex items-center gap-2">
                {[FaInstagram, FaFacebookF, FaYoutube, FaGoogle].map(
                  (Icon, index) => (
                    <button
                      key={index}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs text-white/60 transition hover:bg-white hover:text-[#251329]"
                    >
                      <Icon />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Discover */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                Discover
              </h3>

              <div className="mt-5 space-y-3">
                {[
                  "Find a Salon",
                  "Popular Services",
                  "Top Rated Salons",
                  "Beauty Categories",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      handleCustomerFeature("/salons")
                    }
                    className="block text-left text-sm font-semibold text-white/45 transition hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* For Business */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                For Business
              </h3>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() =>
                    navigate("/salon-owner/register")
                  }
                  className="block text-sm font-semibold text-white/45 transition hover:text-white"
                >
                  Register your salon
                </button>

                <button
                  onClick={() => navigate("/salon-owner/login")}
                  className="block text-sm font-semibold text-white/45 transition hover:text-white"
                >
                  Salon Owner Login
                </button>

                <button
                  onClick={() => navigate("/admin/login")}
                  className="block text-sm font-semibold text-white/45 transition hover:text-white"
                >
                  Admin Login
                </button>

                <button className="block text-sm font-semibold text-white/45 transition hover:text-white">
                  Business Support
                </button>
              </div>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-white">
                Company
              </h3>

              <div className="mt-5 space-y-3">
                <button
                  onClick={() => scrollToSection("about")}
                  className="block text-sm font-semibold text-white/45 transition hover:text-white"
                >
                  About LUMORA
                </button>

                <button className="block text-sm font-semibold text-white/45 transition hover:text-white">
                  Contact
                </button>

                <button className="block text-sm font-semibold text-white/45 transition hover:text-white">
                  Privacy Policy
                </button>

                <button className="block text-sm font-semibold text-white/45 transition hover:text-white">
                  Terms & Conditions
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 text-[11px] font-semibold text-white/30 sm:flex-row">
            <p>© 2026 LUMORA. All rights reserved.</p>

            <div className="flex flex-wrap gap-4">
              <span>Made for modern beauty experiences</span>
              <span>•</span>
              <span>
                Your Beauty. Your Time. Your Place.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;