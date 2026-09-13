import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaBagShopping,
  FaBolt,
  FaCheck,
  FaChevronRight,
  FaClock,
  FaMagnifyingGlass,
  FaScissors,
  FaSpa,
  FaStar,
  FaTag,
} from "react-icons/fa6";

import { getCustomerSalonServices } from "../../services/customerSalonService";

const SalonServices = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getCustomerSalonServices(salonId);

        setServices(response?.services || []);
      } catch (err) {
        console.error("Salon Services Error:", err);

        setError(
          err?.response?.data?.message ||
            "Unable to load salon services"
        );
      } finally {
        setLoading(false);
      }
    };

    if (salonId) {
      loadServices();
    }
  }, [salonId]);

  /* =========================================================
     UNIQUE CATEGORIES
  ========================================================= */
  const categories = useMemo(() => {
    const categoryNames = services
      .map((service) => service.category?.name)
      .filter(Boolean);

    return ["ALL", ...new Set(categoryNames)];
  }, [services]);

  /* =========================================================
     SEARCH + CATEGORY FILTER
  ========================================================= */
  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return services.filter((service) => {
      const matchesSearch =
        !keyword ||
        service.name?.toLowerCase().includes(keyword) ||
        service.description?.toLowerCase().includes(keyword) ||
        service.category?.name?.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" ||
        service.category?.name === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [services, search, selectedCategory]);

  /* =========================================================
     SERVICE ICON
  ========================================================= */
  const getServiceIcon = (categoryName = "") => {
    const category = categoryName.toLowerCase();

    if (category.includes("spa")) {
      return <FaSpa />;
    }

    if (
      category.includes("hair") ||
      category.includes("nail")
    ) {
      return <FaScissors />;
    }

    return <FaStar />;
  };

  /* =========================================================
     SELECT SERVICE
  ========================================================= */
  const handleSelectService = (service) => {
    setSelectedService(service);
  };

  /* =========================================================
     CONTINUE
  ========================================================= */
  const handleContinue = () => {
    if (!selectedService) return;

    navigate(
      `/salons/${salonId}/services/${selectedService._id}/staff`,
      {
        state: {
          service: selectedService,
        },
      }
    );
  };

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#faf7fb] text-[#291f2a]">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative isolate overflow-hidden border-b border-[#eee5ee] bg-gradient-to-br from-[#fffafd] via-[#fbf5fb] to-[#f3e9f3]">

        {/* Background Glow */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-64 w-64 rounded-full bg-[#8d4f83]/15 blur-3xl sm:h-80 sm:w-80" />

        <div className="pointer-events-none absolute -bottom-32 -left-28 h-72 w-72 rounded-full bg-[#d9b6d3]/30 blur-3xl sm:h-96 sm:w-96" />

        <div className="pointer-events-none absolute left-[35%] top-20 hidden h-40 w-40 rounded-full bg-white/60 blur-3xl lg:block" />

        <div className="relative mx-auto w-full max-w-[1500px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">

          {/* =================================================
              BACK BUTTON
          ================================================== */}
          <div className="pt-5 sm:pt-7 lg:pt-8">

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                group
                inline-flex
                max-w-full
                items-center
                gap-2
                rounded-full
                border
                border-[#e7dce7]
                bg-white/85
                px-3.5
                py-2.5
                text-xs
                font-bold
                text-[#625462]
                shadow-[0_8px_30px_rgba(75,40,70,0.06)]
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-[#8d4f83]/30
                hover:bg-[#8d4f83]/5
                hover:text-[#743d6c]
                focus:outline-none
                focus:ring-4
                focus:ring-[#8d4f83]/10
                sm:px-4
                sm:text-sm
              "
            >
              <FaArrowLeft className="shrink-0 text-[10px] transition-transform duration-300 group-hover:-translate-x-0.5 sm:text-xs" />
              <span className="break-words">
                Back to salons
              </span>
            </button>

          </div>

          {/* =================================================
              HERO CONTENT
          ================================================== */}
          <div className="
            grid
            min-w-0
            gap-8
            py-9
            sm:py-11
            md:py-12
            lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]
            lg:items-end
            lg:gap-12
            lg:py-16
            xl:gap-16
            xl:py-20
          ">

            {/* LEFT */}
            <div className="min-w-0">

              {/* Badge */}
              <div className="
                mb-5
                inline-flex
                max-w-full
                items-center
                gap-2
                rounded-full
                border
                border-[#eaddea]
                bg-white/80
                px-3.5
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#8d4f83]
                shadow-[0_8px_30px_rgba(80,40,75,0.06)]
                backdrop-blur-xl
                sm:px-4
                sm:text-xs
                sm:tracking-[0.18em]
              ">
                <FaScissors className="shrink-0" />
                <span className="break-words">
                  Beauty Services
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="
                max-w-full
                break-words
                text-[clamp(2rem,9vw,4.75rem)]
                font-black
                leading-[0.98]
                tracking-[-0.045em]
                text-[#241c25]
              ">
                Choose your
                <span className="mt-1 block break-words text-[#8d4f83] sm:mt-2">
                  perfect treatment.
                </span>
              </h1>

              {/* Description */}
              <p className="
                mt-5
                max-w-2xl
                break-words
                text-sm
                leading-6
                text-[#766b77]
                sm:mt-6
                sm:text-base
                sm:leading-7
                lg:text-[17px]
              ">
                Explore premium beauty services available
                at this salon. Pick the treatment that
                fits your style and continue to choose
                your preferred stylist.
              </p>

              {/* Small stats */}
              <div className="
                mt-6
                flex
                max-w-full
                flex-wrap
                items-center
                gap-2.5
                sm:mt-7
                sm:gap-3
              ">

                <div className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/80
                  bg-white/70
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-[#756875]
                  shadow-sm
                  backdrop-blur
                  sm:px-3.5
                  sm:text-xs
                ">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.10)]" />
                  Active services
                </div>

                <div className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/80
                  bg-white/70
                  px-3
                  py-2
                  text-[10px]
                  font-bold
                  text-[#756875]
                  shadow-sm
                  backdrop-blur
                  sm:px-3.5
                  sm:text-xs
                ">
                  <FaBolt className="text-[#8d4f83]" />
                  Easy booking
                </div>

              </div>

            </div>

            {/* =================================================
                SUMMARY CARD
            ================================================== */}
            <div className="
              min-w-0
              rounded-[1.75rem]
              border
              border-white/90
              bg-white/75
              p-4
              shadow-[0_25px_70px_rgba(91,48,85,0.12)]
              backdrop-blur-2xl
              sm:rounded-[2rem]
              sm:p-6
              lg:p-6
            ">

              <div className="
                flex
                min-w-0
                items-center
                justify-between
                gap-4
              ">

                <div className="min-w-0">

                  <p className="
                    break-words
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-[#958995]
                    sm:text-xs
                    sm:tracking-wider
                  ">
                    Available Services
                  </p>

                  <p className="
                    mt-1
                    text-3xl
                    font-black
                    leading-none
                    tracking-tight
                    text-[#291f2a]
                    sm:text-4xl
                  ">
                    {services.length}
                  </p>

                </div>

                <div className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[#eadfea]
                  bg-gradient-to-br
                  from-[#8d4f83]/15
                  to-[#d9b6d3]/20
                  text-lg
                  text-[#8d4f83]
                  shadow-inner
                  sm:h-14
                  sm:w-14
                  sm:text-xl
                ">
                  <FaBagShopping />
                </div>

              </div>

              <div className="
                mt-5
                flex
                min-w-0
                items-center
                gap-2
                rounded-xl
                bg-[#f8f3f8]
                px-3
                py-2.5
                text-[10px]
                font-bold
                text-[#716572]
                sm:text-xs
              ">
                <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_0_4px_rgba(34,197,94,0.08)]" />
                <span className="break-words">
                  Active services only
                </span>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <section className="relative min-w-0 pb-32 pt-6 sm:pb-32 sm:pt-8 lg:pb-36">

        <div className="
          relative
          mx-auto
          w-full
          max-w-[1500px]
          min-w-0
          px-4
          sm:px-6
          md:px-8
          lg:px-10
          xl:px-12
        ">

          {/* =================================================
              SEARCH + CATEGORY
          ================================================== */}
          <div className="
            relative
            z-10
            min-w-0
            rounded-[1.5rem]
            border
            border-[#eadfea]
            bg-white/90
            p-2.5
            shadow-[0_20px_60px_rgba(75,40,70,0.09)]
            backdrop-blur-xl
            sm:rounded-[1.75rem]
            sm:p-3
            lg:p-4
          ">

            <div className="
              flex
              min-w-0
              flex-col
              gap-3
              lg:gap-4
            ">

              {/* Search */}
              <div className="relative min-w-0 w-full">

                <FaMagnifyingGlass className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-sm
                  text-[#a79ba7]
                " />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search hair, spa, nails, facial..."
                  className="
                    h-12
                    w-full
                    min-w-0
                    rounded-2xl
                    border
                    border-[#eee5ee]
                    bg-[#fbf9fc]
                    pl-11
                    pr-4
                    text-sm
                    font-medium
                    text-[#312731]
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-[#aaa0aa]
                    hover:border-[#dfd0de]
                    hover:bg-white
                    focus:border-[#8d4f83]/40
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#8d4f83]/10
                    sm:h-13
                  "
                />

              </div>

              {/* Categories */}
              <div className="
                flex
                min-w-0
                max-w-full
                gap-2
                overflow-x-auto
                pb-1
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                lg:gap-2.5
              ">

                {categories.map((category) => {

                  const active =
                    selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        setSelectedCategory(category)
                      }
                      className={`
                        shrink-0
                        rounded-xl
                        border
                        px-3.5
                        py-2.5
                        text-[11px]
                        font-black
                        transition-all
                        duration-300
                        focus:outline-none
                        focus:ring-4
                        focus:ring-[#8d4f83]/10
                        sm:px-4
                        sm:py-3
                        sm:text-xs
                        ${
                          active
                            ? "border-[#8d4f83] bg-[#8d4f83] text-white shadow-[0_8px_25px_rgba(141,79,131,0.22)]"
                            : "border-transparent bg-[#f7f2f7] text-[#756b75] hover:border-[#e5d7e4] hover:bg-[#eee4ed] hover:text-[#6e3c66]"
                        }
                      `}
                    >
                      {category === "ALL"
                        ? "All Services"
                        : category}
                    </button>
                  );
                })}

              </div>

            </div>
          </div>

          {/* =================================================
              RESULT HEADER
          ================================================== */}
          {!loading && !error && (
            <div className="
              flex
              min-w-0
              flex-col
              gap-2
              pt-8
              sm:flex-row
              sm:items-end
              sm:justify-between
            ">

              <div className="min-w-0">

                <p className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-[#9c909d]
                  sm:text-xs
                ">
                  Explore treatments
                </p>

                <h2 className="
                  mt-1
                  max-w-full
                  break-words
                  text-[clamp(1.5rem,5vw,2.35rem)]
                  font-black
                  leading-tight
                  tracking-tight
                  text-[#291f2a]
                ">
                  Find your perfect service
                </h2>

              </div>

              <div className="
                shrink-0
                self-start
                rounded-full
                border
                border-[#eadfea]
                bg-white
                px-3.5
                py-2
                text-xs
                font-bold
                text-[#796d79]
                shadow-sm
                sm:self-auto
              ">
                {filteredServices.length} service
                {filteredServices.length !== 1 ? "s" : ""}
              </div>

            </div>
          )}

          {/* =================================================
              LOADING
          ================================================== */}
          {loading && (
            <div className="
              grid
              min-w-0
              gap-5
              pt-8
              sm:grid-cols-2
              xl:grid-cols-3
            ">

              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="
                    min-w-0
                    animate-pulse
                    overflow-hidden
                    rounded-[1.75rem]
                    border
                    border-[#eee7ef]
                    bg-white
                    shadow-[0_12px_40px_rgba(80,45,75,0.05)]
                  "
                >

                  <div className="
                    h-36
                    bg-gradient-to-br
                    from-[#eee8ef]
                    to-[#f7f2f7]
                    sm:h-40
                  " />

                  <div className="space-y-4 p-5 sm:p-6">

                    <div className="h-5 w-2/3 rounded-lg bg-[#eee8ef]" />

                    <div className="h-4 w-full rounded-lg bg-[#f3eef3]" />

                    <div className="h-4 w-4/5 rounded-lg bg-[#f3eef3]" />

                    <div className="h-12 rounded-2xl bg-[#eee8ef]" />

                  </div>
                </div>
              ))}

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================== */}
          {!loading && error && (
            <div className="
              mx-auto
              mt-10
              max-w-xl
              rounded-[2rem]
              border
              border-red-100
              bg-white
              p-6
              text-center
              shadow-[0_20px_60px_rgba(100,30,30,0.08)]
              sm:p-8
            ">

              <div className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-lg
                font-black
                text-red-500
                ring-8
                ring-red-50/50
              ">
                !
              </div>

              <h3 className="
                mt-5
                break-words
                text-lg
                font-black
                text-red-900
                sm:text-xl
              ">
                Unable to load services
              </h3>

              <p className="
                mt-2
                break-words
                text-sm
                leading-6
                text-red-700
              ">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="
                  mt-6
                  rounded-xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  shadow-lg
                  shadow-red-600/20
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-red-700
                  hover:shadow-xl
                  focus:outline-none
                  focus:ring-4
                  focus:ring-red-200
                "
              >
                Try Again
              </button>

            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================== */}
          {!loading &&
            !error &&
            filteredServices.length === 0 && (
              <div className="
                mt-10
                min-w-0
                rounded-[2rem]
                border
                border-[#eadfea]
                bg-white
                px-5
                py-14
                text-center
                shadow-[0_18px_50px_rgba(75,40,70,0.06)]
                sm:py-16
              ">

                <div className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#8d4f83]/10
                  to-[#d9b6d3]/20
                  text-xl
                  text-[#8d4f83]
                  shadow-inner
                ">
                  <FaMagnifyingGlass />
                </div>

                <h3 className="
                  mt-5
                  break-words
                  text-xl
                  font-black
                  leading-tight
                  text-[#2c222d]
                  sm:text-2xl
                ">
                  No services found
                </h3>

                <p className="
                  mx-auto
                  mt-2
                  max-w-md
                  break-words
                  text-sm
                  leading-6
                  text-[#817681]
                ">
                  Try another service name or select a
                  different category.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("ALL");
                  }}
                  className="
                    mt-6
                    rounded-xl
                    bg-[#8d4f83]
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-[#8d4f83]/20
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#763f6d]
                    hover:shadow-xl
                    focus:outline-none
                    focus:ring-4
                    focus:ring-[#8d4f83]/15
                  "
                >
                  Clear Filters
                </button>

              </div>
            )}

          {/* =================================================
              SERVICE GRID
          ================================================== */}
          {!loading &&
            !error &&
            filteredServices.length > 0 && (
              <div className="
                grid
                min-w-0
                gap-5
                pt-6
                sm:gap-6
                sm:pt-7
                md:grid-cols-2
                xl:grid-cols-3
              ">

                {filteredServices.map((service) => {

                  const isSelected =
                    selectedService?._id === service._id;

                  return (
                    <article
                      key={service._id}
                      className={`
                        group
                        relative
                        min-w-0
                        overflow-hidden
                        rounded-[1.75rem]
                        border
                        bg-white
                        transition-all
                        duration-500
                        ${
                          isSelected
                            ? "border-[#8d4f83]/50 shadow-[0_25px_70px_rgba(141,79,131,0.18)]"
                            : "border-[#eee7ef] shadow-[0_14px_45px_rgba(80,45,75,0.055)] hover:-translate-y-1.5 hover:border-[#d9c2d6] hover:shadow-[0_25px_65px_rgba(80,45,75,0.12)]"
                        }
                      `}
                    >

                      {/* =======================================
                          DECORATIVE TOP
                      ======================================== */}
                      <div className="
                        relative
                        h-36
                        overflow-hidden
                        bg-gradient-to-br
                        from-[#704069]
                        via-[#8d4f83]
                        to-[#d5b3d0]
                        sm:h-40
                      ">

                        {/* Glow */}
                        <div className="
                          pointer-events-none
                          absolute
                          -right-10
                          -top-16
                          h-44
                          w-44
                          rounded-full
                          bg-white/10
                          blur-sm
                          transition-transform
                          duration-700
                          group-hover:scale-125
                        " />

                        <div className="
                          pointer-events-none
                          absolute
                          -bottom-20
                          -left-10
                          h-44
                          w-44
                          rounded-full
                          bg-black/10
                          blur-sm
                          transition-transform
                          duration-700
                          group-hover:scale-125
                        " />

                        <div className="
                          pointer-events-none
                          absolute
                          left-1/2
                          top-1/2
                          h-24
                          w-24
                          -translate-x-1/2
                          -translate-y-1/2
                          rounded-full
                          bg-white/5
                          blur-2xl
                        " />

                        {/* Icon */}
                        <div className="
                          absolute
                          left-5
                          top-5
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-2xl
                          border
                          border-white/20
                          bg-white/15
                          text-lg
                          text-white
                          shadow-lg
                          backdrop-blur-xl
                          transition-all
                          duration-300
                          group-hover:scale-105
                          group-hover:bg-white/20
                          sm:h-12
                          sm:w-12
                          sm:text-xl
                        ">
                          {getServiceIcon(
                            service.category?.name
                          )}
                        </div>

                        {/* Available */}
                        <div className="
                          absolute
                          right-4
                          top-5
                          max-w-[calc(100%-90px)]
                          rounded-full
                          border
                          border-white/20
                          bg-white/15
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-black
                          uppercase
                          tracking-wider
                          text-white
                          shadow-lg
                          backdrop-blur-xl
                          sm:right-5
                          sm:px-3
                          sm:text-[10px]
                        ">
                          Available
                        </div>

                        {/* Category */}
                        <div className="
                          absolute
                          bottom-5
                          left-5
                          right-5
                          min-w-0
                        ">

                          <p className="
                            max-w-full
                            break-words
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.15em]
                            text-white/75
                            sm:text-[10px]
                            sm:tracking-[0.16em]
                          ">
                            {service.category?.name ||
                              "Beauty Service"}
                          </p>

                        </div>

                      </div>

                      {/* =======================================
                          CONTENT
                      ======================================== */}
                      <div className="min-w-0 p-5 sm:p-6">

                        {/* Title */}
                        <div className="
                          flex
                          min-w-0
                          items-start
                          gap-3
                        ">

                          <h3 className="
                            min-w-0
                            flex-1
                            break-words
                            text-[17px]
                            font-black
                            leading-[1.2]
                            tracking-tight
                            text-[#2b222c]
                            sm:text-lg
                          ">
                            {service.name}
                          </h3>

                          {isSelected && (
                            <div className="
                              flex
                              h-7
                              w-7
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[#8d4f83]
                              text-xs
                              text-white
                              shadow-lg
                              shadow-[#8d4f83]/20
                            ">
                              <FaCheck />
                            </div>
                          )}

                        </div>

                        {/* Description */}
                        <p className="
                          mt-3
                          min-h-[72px]
                          break-words
                          text-sm
                          leading-6
                          text-[#817581]
                        ">
                          {service.description ||
                            "Premium beauty treatment tailored to your needs."}
                        </p>

                        {/* Divider */}
                        <div className="
                          mt-5
                          border-t
                          border-[#f0e9f0]
                          pt-4
                        ">

                          <div className="
                            flex
                            min-w-0
                            items-center
                            justify-between
                            gap-4
                          ">

                            {/* Duration */}
                            <div className="
                              flex
                              min-w-0
                              items-center
                              gap-2.5
                            ">

                              <div className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#8d4f83]/10
                                text-sm
                                text-[#8d4f83]
                              ">
                                <FaClock />
                              </div>

                              <div className="min-w-0">

                                <p className="
                                  text-[9px]
                                  font-black
                                  uppercase
                                  tracking-wider
                                  text-[#a197a2]
                                  sm:text-[10px]
                                ">
                                  Duration
                                </p>

                                <p className="
                                  mt-0.5
                                  break-words
                                  text-sm
                                  font-black
                                  text-[#342934]
                                ">
                                  {service.duration} min
                                </p>

                              </div>

                            </div>

                            {/* Price */}
                            <div className="min-w-0 text-right">

                              <p className="
                                text-[9px]
                                font-black
                                uppercase
                                tracking-wider
                                text-[#a197a2]
                                sm:text-[10px]
                              ">
                                Starting at
                              </p>

                              <p className="
                                mt-0.5
                                break-words
                                text-lg
                                font-black
                                leading-tight
                                text-[#8d4f83]
                                sm:text-xl
                              ">
                                ₹
                                {Number(
                                  service.price || 0
                                ).toLocaleString("en-IN")}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          onClick={() =>
                            handleSelectService(service)
                          }
                          className={`
                            group/button
                            mt-5
                            flex
                            h-12
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            px-4
                            text-xs
                            font-black
                            transition-all
                            duration-300
                            focus:outline-none
                            focus:ring-4
                            focus:ring-[#8d4f83]/10
                            sm:text-sm
                            ${
                              isSelected
                                ? "bg-[#8d4f83] text-white shadow-[0_10px_30px_rgba(141,79,131,0.22)]"
                                : "bg-[#f7f1f7] text-[#713e68] hover:-translate-y-0.5 hover:bg-[#8d4f83] hover:text-white hover:shadow-[0_10px_30px_rgba(141,79,131,0.20)]"
                            }
                          `}
                        >

                          <span>
                            {isSelected
                              ? "Selected"
                              : "Select Service"}
                          </span>

                          <FaChevronRight className="
                            shrink-0
                            text-[10px]
                            transition-transform
                            duration-300
                            group-hover/button:translate-x-0.5
                            sm:text-xs
                          " />

                        </button>

                      </div>

                      {/* Selected Glow */}
                      {isSelected && (
                        <div className="
                          pointer-events-none
                          absolute
                          inset-x-0
                          bottom-0
                          h-1
                          bg-gradient-to-r
                          from-[#8d4f83]
                          via-[#c28aba]
                          to-[#8d4f83]
                        " />
                      )}

                    </article>
                  );
                })}

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          MOBILE / DESKTOP BOOKING BAR
      ====================================================== */}
      {selectedService && (
        <div className="
          fixed
          bottom-0
          left-0
          right-0
          z-40
          border-t
          border-[#e9dce8]
          bg-white/95
          shadow-[0_-20px_60px_rgba(60,30,55,0.14)]
          backdrop-blur-2xl
        ">

          <div className="
            mx-auto
            flex
            w-full
            max-w-[1500px]
            min-w-0
            flex-col
            gap-3
            px-4
            py-3
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:gap-5
            sm:px-6
            sm:py-4
            md:px-8
            lg:px-10
            xl:px-12
          ">

            {/* Selected Service */}
            <div className="
              flex
              min-w-0
              flex-1
              items-center
              gap-3
            ">

              <div className="
                hidden
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#8d4f83]/10
                text-[#8d4f83]
                sm:flex
                sm:h-12
                sm:w-12
              ">
                <FaCheck />
              </div>

              <div className="min-w-0 flex-1">

                <p className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-[#a096a1]
                  sm:text-[10px]
                  sm:tracking-[0.16em]
                ">
                  Selected service
                </p>

                <div className="
                  mt-0.5
                  flex
                  min-w-0
                  items-center
                  gap-2
                ">

                  <h4 className="
                    min-w-0
                    flex-1
                    break-words
                    text-xs
                    font-black
                    leading-tight
                    text-[#2d232e]
                    sm:text-base
                  ">
                    {selectedService.name}
                  </h4>

                  <span className="
                    hidden
                    shrink-0
                    text-sm
                    text-[#a097a1]
                    sm:inline
                  ">
                    •
                  </span>

                  <span className="
                    shrink-0
                    text-xs
                    font-black
                    text-[#8d4f83]
                    sm:text-sm
                  ">
                    ₹
                    {Number(
                      selectedService.price || 0
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

            </div>

            {/* Continue */}
            <button
              type="button"
              onClick={handleContinue}
              className="
                flex
                h-11
                w-full
                shrink-0
                items-center
                justify-center
                gap-2.5
                rounded-2xl
                bg-[#8d4f83]
                px-5
                text-xs
                font-black
                text-white
                shadow-[0_10px_30px_rgba(141,79,131,0.22)]
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#763f6d]
                hover:shadow-[0_15px_40px_rgba(141,79,131,0.28)]
                focus:outline-none
                focus:ring-4
                focus:ring-[#8d4f83]/15
                sm:h-12
                sm:w-auto
                sm:min-w-[190px]
                sm:px-6
                sm:text-sm
              "
            >
              <span className="whitespace-nowrap">
                Continue to Stylist
              </span>
              <FaArrowRight className="shrink-0" />
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default SalonServices;