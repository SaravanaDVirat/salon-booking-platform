import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome6,
} from "@expo/vector-icons";

import {
  getCustomerRole,
  getCustomerToken,
  getCustomerUser,
} from "../../services/CustomerAuthService";

const PRIMARY = "#251329";
const PRIMARY_DARK = "#171018";
const PURPLE = "#7c3aed";
const ROSE = "#be185d";
const BG = "#fcfafc";
const MUTED = "#64748b";

const CustomerHome = () => {
  const { width } = useWindowDimensions();

  const scrollRef = useRef(null);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [loginMenu, setLoginMenu] = useState(false);
  const [registerMenu, setRegisterMenu] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(false);

  const isSmallPhone = width < 380;
  const isTablet = width >= 768;

  const categories = [
    {
      name: "Hair Styling",
      count: "320+ salons",
      icon: "content-cut",
      image:
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Facial & Skin",
      count: "280+ salons",
      icon: "spa",
      image:
        "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Nail Care",
      count: "190+ salons",
      icon: "diamond-stone",
      image:
        "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Spa & Wellness",
      count: "150+ salons",
      icon: "spa",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Makeup",
      count: "210+ salons",
      icon: "star",
      image:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=85",
    },
    {
      name: "Men's Grooming",
      count: "240+ salons",
      icon: "account-tie",
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
      text:
        "Finding a good salon used to take so much time. LUMORA made the entire process incredibly simple. I found a beautiful salon and booked my appointment in minutes.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Karthik S.",
      role: "Verified Customer",
      text:
        "I love that I can actually choose the stylist, see the service details and check availability before booking. The experience feels premium from start to finish.",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Priya M.",
      role: "Verified Customer",
      text:
        "The salon discovery experience is amazing. Clean interface, genuine reviews and no unnecessary calls. Exactly what a modern beauty platform should feel like.",
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

  const trustStats = [
    ["500+", "Partner salons"],
    ["10K+", "Appointments booked"],
    ["4.9/5", "Average rating"],
    ["98%", "Happy customers"],
  ];

  const scrollToSection = (section) => {
    setMobileMenu(false);

    const positions = {
      top: 0,
      categories: 900,
      about: 2500,
      howItWorks: 3300,
    };

    scrollRef.current?.scrollTo({
      y: positions[section] || 0,
      animated: true,
    });
  };

  const handleCustomerFeature = async (
    target = "/customer/salons"
  ) => {
    try {
      setCheckingAuth(true);

      const [token, role, user] = await Promise.all([
        getCustomerToken(),
        getCustomerRole(),
        getCustomerUser(),
      ]);

      setMobileMenu(false);
      setLoginMenu(false);
      setRegisterMenu(false);

      if (!token || role !== "CUSTOMER" || !user) {
        router.push({
          pathname: "/customer/login",
          params: {
            from: target,
          },
        });

        return;
      }

      router.push(target);
    } catch (error) {
      router.push({
        pathname: "/customer/login",
        params: {
          from: target,
        },
      });
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSearch = () => {
    handleCustomerFeature("/customer/salons");
  };

  const goCustomerLogin = () => {
    setMobileMenu(false);
    setLoginMenu(false);
    router.push("/customer/login");
  };

  const goCustomerRegister = () => {
    setMobileMenu(false);
    setRegisterMenu(false);
    router.push("/customer/register");
  };

  const renderStars = () => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name="star"
          size={11}
          color="#fbbf24"
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
      />

      <View style={styles.screen}>
        {/* =====================================================
            TOP ANNOUNCEMENT
        ====================================================== */}

        <View style={styles.announcement}>
          <Text style={styles.announcementText}>
            ✦ BEAUTY EXPERIENCES, CURATED FOR YOU
          </Text>

          <Text style={styles.announcementDot}>•</Text>

          <Text style={styles.announcementText}>
            DISCOVER. CHOOSE. BOOK.
          </Text>
        </View>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Pressable
              style={styles.logoButton}
              onPress={() => scrollToSection("top")}
            >
              <View style={styles.logoBox}>
                <Text style={styles.logoLetter}>L</Text>

                <Text style={styles.logoSparkle}>✦</Text>
              </View>

              <View style={styles.logoTextWrapper}>
                <Text style={styles.logoName}>LUMORA</Text>

                <Text style={styles.logoTagline}>
                  BEAUTY • BOOKING
                </Text>
              </View>
            </Pressable>

            {/* Desktop / Tablet Navigation */}

            {width >= 850 ? (
              <View style={styles.desktopNav}>
                <Pressable
                  onPress={() => scrollToSection("top")}
                  style={styles.navButton}
                >
                  <Text style={[styles.navText, styles.activeNavText]}>
                    Home
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    handleCustomerFeature("/customer/salons")
                  }
                  style={styles.navButton}
                >
                  <Text style={styles.navText}>
                    Discover Salons
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    handleCustomerFeature("/customer/salons")
                  }
                  style={styles.navButton}
                >
                  <Text style={styles.navText}>
                    Services
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => scrollToSection("howItWorks")}
                  style={styles.navButton}
                >
                  <Text style={styles.navText}>
                    How It Works
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => scrollToSection("about")}
                  style={styles.navButton}
                >
                  <Text style={styles.navText}>
                    About
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Desktop Auth */}

            {width >= 600 ? (
              <View style={styles.headerAuth}>
                <View style={styles.dropdownWrapper}>
                  <Pressable
                    onPress={() => {
                      setLoginMenu((prev) => !prev);
                      setRegisterMenu(false);
                    }}
                    style={styles.loginButton}
                  >
                    <Text style={styles.loginButtonText}>
                      Login
                    </Text>

                    <Ionicons
                      name={
                        loginMenu
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={12}
                      color="#475569"
                    />
                  </Pressable>

                  {loginMenu ? (
                    <View style={styles.dropdown}>
                      <Text style={styles.dropdownTitle}>
                        SIGN IN AS
                      </Text>

                      <Pressable
                        onPress={goCustomerLogin}
                        style={styles.dropdownItem}
                      >
                        <View
                          style={[
                            styles.dropdownIcon,
                            {
                              backgroundColor: "#ede9fe",
                            },
                          ]}
                        >
                          <Ionicons
                            name="person"
                            size={17}
                            color="#6d28d9"
                          />
                        </View>

                        <View style={styles.dropdownContent}>
                          <Text style={styles.dropdownMainText}>
                            Customer
                          </Text>

                          <Text style={styles.dropdownSubText}>
                            Book beauty appointments
                          </Text>
                        </View>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          router.push("/salon-owner/login")
                        }
                        style={styles.dropdownItem}
                      >
                        <View
                          style={[
                            styles.dropdownIcon,
                            {
                              backgroundColor: "#ffe4e6",
                            },
                          ]}
                        >
                          <Ionicons
                            name="storefront"
                            size={17}
                            color="#be123c"
                          />
                        </View>

                        <View style={styles.dropdownContent}>
                          <Text style={styles.dropdownMainText}>
                            Salon Owner
                          </Text>

                          <Text style={styles.dropdownSubText}>
                            Manage your salon
                          </Text>
                        </View>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          router.push("/admin/login")
                        }
                        style={styles.dropdownItem}
                      >
                        <View
                          style={[
                            styles.dropdownIcon,
                            {
                              backgroundColor: "#f1f5f9",
                            },
                          ]}
                        >
                          <Ionicons
                            name="shield-checkmark"
                            size={17}
                            color="#475569"
                          />
                        </View>

                        <View style={styles.dropdownContent}>
                          <Text style={styles.dropdownMainText}>
                            Administrator
                          </Text>

                          <Text style={styles.dropdownSubText}>
                            Platform administration
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  ) : null}
                </View>

                <View style={styles.dropdownWrapper}>
                  <Pressable
                    onPress={() => {
                      setRegisterMenu((prev) => !prev);
                      setLoginMenu(false);
                    }}
                    style={styles.getStartedButton}
                  >
                    <Text style={styles.getStartedText}>
                      Get Started
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={15}
                      color="#ffffff"
                    />
                  </Pressable>

                  {registerMenu ? (
                    <View style={styles.dropdown}>
                      <Text style={styles.dropdownTitle}>
                        CREATE ACCOUNT
                      </Text>

                      <Pressable
                        onPress={goCustomerRegister}
                        style={styles.dropdownItem}
                      >
                        <View
                          style={[
                            styles.dropdownIcon,
                            {
                              backgroundColor: "#ede9fe",
                            },
                          ]}
                        >
                          <Ionicons
                            name="person-add"
                            size={17}
                            color="#6d28d9"
                          />
                        </View>

                        <View style={styles.dropdownContent}>
                          <Text style={styles.dropdownMainText}>
                            Customer Account
                          </Text>

                          <Text style={styles.dropdownSubText}>
                            Start booking today
                          </Text>
                        </View>
                      </Pressable>

                      <Pressable
                        onPress={() =>
                          router.push("/salon-owner/register")
                        }
                        style={styles.dropdownItem}
                      >
                        <View
                          style={[
                            styles.dropdownIcon,
                            {
                              backgroundColor: "#ffe4e6",
                            },
                          ]}
                        >
                          <Ionicons
                            name="storefront"
                            size={17}
                            color="#be123c"
                          />
                        </View>

                        <View style={styles.dropdownContent}>
                          <Text style={styles.dropdownMainText}>
                            Salon Owner Account
                          </Text>

                          <Text style={styles.dropdownSubText}>
                            Grow your beauty business
                          </Text>
                        </View>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setMobileMenu((prev) => !prev)}
                style={styles.mobileMenuButton}
              >
                <Ionicons
                  name={mobileMenu ? "close" : "menu"}
                  size={23}
                  color="#1e293b"
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {mobileMenu ? (
          <View style={styles.mobileMenu}>
            <Pressable
              onPress={() => scrollToSection("top")}
              style={styles.mobileNavItem}
            >
              <Ionicons
                name="home-outline"
                size={18}
                color={PRIMARY}
              />

              <Text style={styles.mobileNavText}>Home</Text>
            </Pressable>

            <Pressable
              onPress={() =>
                handleCustomerFeature("/customer/salons")
              }
              style={styles.mobileNavItem}
            >
              <Ionicons
                name="storefront-outline"
                size={18}
                color="#64748b"
              />

              <Text style={styles.mobileNavText}>
                Discover Salons
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                handleCustomerFeature("/customer/salons")
              }
              style={styles.mobileNavItem}
            >
              <Ionicons
                name="sparkles-outline"
                size={18}
                color="#64748b"
              />

              <Text style={styles.mobileNavText}>
                Services
              </Text>
            </Pressable>

            <Pressable
              onPress={() => scrollToSection("howItWorks")}
              style={styles.mobileNavItem}
            >
              <Ionicons
                name="list-outline"
                size={18}
                color="#64748b"
              />

              <Text style={styles.mobileNavText}>
                How It Works
              </Text>
            </Pressable>

            <Pressable
              onPress={() => scrollToSection("about")}
              style={styles.mobileNavItem}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color="#64748b"
              />

              <Text style={styles.mobileNavText}>About</Text>
            </Pressable>

            <View style={styles.mobileAuthDivider} />

            <Pressable
              onPress={goCustomerLogin}
              style={styles.mobileOutlineButton}
            >
              <Text style={styles.mobileOutlineButtonText}>
                Customer Login
              </Text>
            </Pressable>

            <Pressable
              onPress={() =>
                router.push("/salon-owner/login")
              }
              style={styles.mobileOutlineButton}
            >
              <Text style={styles.mobileOutlineButtonText}>
                Salon Owner Login
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push("/admin/login")}
              style={styles.mobileOutlineButton}
            >
              <Text style={styles.mobileOutlineButtonText}>
                Admin Login
              </Text>
            </Pressable>

            <Pressable
              onPress={goCustomerRegister}
              style={styles.mobilePrimaryButton}
            >
              <Text style={styles.mobilePrimaryButtonText}>
                Register as Customer
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color="#ffffff"
              />
            </Pressable>

            <Pressable
              onPress={() =>
                router.push("/salon-owner/register")
              }
              style={styles.mobileSalonButton}
            >
              <Text style={styles.mobileSalonButtonText}>
                Register as Salon Owner
              </Text>
            </Pressable>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* =====================================================
              HERO
          ====================================================== */}

          <View style={styles.hero}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View
              style={[
                styles.heroInner,
                isTablet && styles.heroInnerTablet,
              ]}
            >
              {/* Hero Content */}

              <View
                style={[
                  styles.heroContent,
                  isTablet && styles.heroContentTablet,
                ]}
              >
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeIcon}>
                    <Text style={styles.heroBadgeSparkle}>
                      ✦
                    </Text>
                  </View>

                  <Text style={styles.heroBadgeText}>
                    BEAUTY, REDEFINED
                  </Text>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    isSmallPhone && styles.heroTitleSmall,
                    isTablet && styles.heroTitleTablet,
                  ]}
                >
                  Find your perfect salon.
                </Text>

                <Text
                  style={[
                    styles.heroTitleAccent,
                    isSmallPhone &&
                      styles.heroTitleAccentSmall,
                    isTablet &&
                      styles.heroTitleAccentTablet,
                  ]}
                >
                  Book your perfect moment.
                </Text>

                <Text
                  style={[
                    styles.heroDescription,
                    isTablet &&
                      styles.heroDescriptionTablet,
                  ]}
                >
                  Discover exceptional salons, explore
                  treatments you’ll love, choose your preferred
                  stylist and reserve your next beauty
                  experience — all in one beautiful place.
                </Text>

                {/* Search */}

                <View style={styles.searchCard}>
                  <View style={styles.searchRow}>
                    <View style={styles.searchField}>
                      <View style={styles.searchIconBox}>
                        <Ionicons
                          name="search"
                          size={18}
                          color="#6d28d9"
                        />
                      </View>

                      <View style={styles.searchInputContainer}>
                        <Text style={styles.searchLabel}>
                          DISCOVER
                        </Text>

                        <TextInput
                          value={searchText}
                          onChangeText={setSearchText}
                          placeholder="Salon, service or treatment"
                          placeholderTextColor="#94a3b8"
                          style={styles.searchInput}
                        />
                      </View>
                    </View>

                    <View style={styles.searchField}>
                      <View style={styles.locationIconBox}>
                        <Ionicons
                          name="location"
                          size={18}
                          color="#be123c"
                        />
                      </View>

                      <View style={styles.searchInputContainer}>
                        <Text style={styles.searchLabel}>
                          LOCATION
                        </Text>

                        <TextInput
                          value={locationText}
                          onChangeText={setLocationText}
                          placeholder="Chennai"
                          placeholderTextColor="#94a3b8"
                          style={styles.searchInput}
                        />
                      </View>
                    </View>

                    <Pressable
                      onPress={handleSearch}
                      style={({ pressed }) => [
                        styles.searchButton,
                        pressed &&
                          styles.searchButtonPressed,
                      ]}
                      disabled={checkingAuth}
                    >
                      {checkingAuth ? (
                        <ActivityIndicator
                          size="small"
                          color="#ffffff"
                        />
                      ) : (
                        <>
                          <Text style={styles.searchButtonText}>
                            Search
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={15}
                            color="#ffffff"
                          />
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>

                <View style={styles.heroChecks}>
                  <View style={styles.heroCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#10b981"
                    />

                    <Text style={styles.heroCheckText}>
                      Verified salons
                    </Text>
                  </View>

                  <View style={styles.heroCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#10b981"
                    />

                    <Text style={styles.heroCheckText}>
                      Real-time availability
                    </Text>
                  </View>

                  <View style={styles.heroCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#10b981"
                    />

                    <Text style={styles.heroCheckText}>
                      Easy booking
                    </Text>
                  </View>
                </View>
              </View>

              {/* Hero Image */}

              <View
                style={[
                  styles.heroVisual,
                  isTablet && styles.heroVisualTablet,
                ]}
              >
                <View style={styles.heroImageGlow} />

                <View style={styles.heroImageFrame}>
                  <Image
                    source={{
                      uri:
                        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=90",
                    }}
                    style={[
                      styles.heroImage,
                      isSmallPhone &&
                        styles.heroImageSmall,
                      isTablet &&
                        styles.heroImageTablet,
                    ]}
                  />

                  <View style={styles.heroImageOverlay} />

                  {/* Rating */}

                  <View style={styles.ratingFloating}>
                    <View style={styles.ratingIcon}>
                      <Ionicons
                        name="star"
                        size={17}
                        color="#f59e0b"
                      />
                    </View>

                    <View>
                      <Text style={styles.ratingValue}>
                        4.9/5
                      </Text>

                      <Text style={styles.ratingLabel}>
                        Customer rating
                      </Text>
                    </View>
                  </View>

                  {/* Booking Card */}

                  <View style={styles.bookingFloating}>
                    <View style={styles.bookingTopRow}>
                      <View style={styles.bookingTitleWrapper}>
                        <Text style={styles.bookingEyebrow}>
                          TRENDING THIS WEEK
                        </Text>

                        <Text style={styles.bookingTitle}>
                          Signature Hair Studio
                        </Text>
                      </View>

                      <View style={styles.heartButton}>
                        <Ionicons
                          name="heart-outline"
                          size={18}
                          color="#64748b"
                        />
                      </View>
                    </View>

                    <View style={styles.bookingMeta}>
                      <View style={styles.bookingMetaItem}>
                        <Ionicons
                          name="location"
                          size={12}
                          color="#f43f5e"
                        />

                        <Text style={styles.bookingMetaText}>
                          Chennai
                        </Text>
                      </View>

                      <View style={styles.bookingMetaItem}>
                        <Ionicons
                          name="star"
                          size={12}
                          color="#fbbf24"
                        />

                        <Text style={styles.bookingMetaText}>
                          4.9
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() =>
                        handleCustomerFeature(
                          "/customer/salons"
                        )
                      }
                      style={styles.exploreSalonButton}
                    >
                      <Text
                        style={styles.exploreSalonText}
                      >
                        Explore salon
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#ffffff"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Availability */}

                {width >= 500 ? (
                  <View style={styles.availabilityFloating}>
                    <View style={styles.availabilityIcon}>
                      <Ionicons
                        name="calendar"
                        size={19}
                        color="#059669"
                      />
                    </View>

                    <View>
                      <Text
                        style={styles.availabilityLabel}
                      >
                        AVAILABILITY
                      </Text>

                      <Text
                        style={styles.availabilityValue}
                      >
                        12 slots today
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* =====================================================
              TRUST STATS
          ====================================================== */}

          <View style={styles.statsSection}>
            <View
              style={[
                styles.statsGrid,
                isTablet && styles.statsGridTablet,
              ]}
            >
              {trustStats.map(([value, label]) => (
                <View
                  key={label}
                  style={styles.statItem}
                >
                  <Text style={styles.statValue}>
                    {value}
                  </Text>

                  <Text style={styles.statLabel}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* =====================================================
              CATEGORIES
          ====================================================== */}

          <View style={styles.sectionWhite}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <View style={styles.sectionEyebrow}>
                    <View
                      style={[
                        styles.sectionLine,
                        {
                          backgroundColor: "#8b5cf6",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.sectionEyebrowText,
                        {
                          color: "#6d28d9",
                        },
                      ]}
                    >
                      EXPLORE BY CATEGORY
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Everything beauty,
                  </Text>

                  <Text
                    style={[
                      styles.sectionTitleAccent,
                      {
                        color: "#7c3aed",
                      },
                    ]}
                  >
                    beautifully curated.
                  </Text>

                  <Text style={styles.sectionDescription}>
                    From everyday grooming to indulgent
                    self-care, discover treatments designed
                    around the way you want to feel.
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    handleCustomerFeature(
                      "/customer/salons"
                    )
                  }
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>
                    View all categories
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={PRIMARY}
                  />
                </Pressable>
              </View>

              <View
                style={[
                  styles.categoriesGrid,
                  isTablet &&
                    styles.categoriesGridTablet,
                ]}
              >
                {categories.map((category) => (
                  <Pressable
                    key={category.name}
                    onPress={() =>
                      handleCustomerFeature(
                        "/customer/salons"
                      )
                    }
                    style={({ pressed }) => [
                      styles.categoryCard,
                      isTablet &&
                        styles.categoryCardTablet,
                      pressed &&
                        styles.categoryCardPressed,
                    ]}
                  >
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                    />

                    <View style={styles.categoryOverlay} />

                    <View style={styles.categoryContent}>
                      <View style={styles.categoryIcon}>
                        <MaterialCommunityIcons
                          name={category.icon}
                          size={18}
                          color="#6d28d9"
                        />
                      </View>

                      <Text style={styles.categoryName}>
                        {category.name}
                      </Text>

                      <Text style={styles.categoryCount}>
                        {category.count}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              FEATURED SALONS
          ====================================================== */}

          <View style={styles.sectionSoft}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <View style={styles.sectionEyebrow}>
                    <View
                      style={[
                        styles.sectionLine,
                        {
                          backgroundColor: "#f43f5e",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.sectionEyebrowText,
                        {
                          color: "#e11d48",
                        },
                      ]}
                    >
                      HANDPICKED FOR YOU
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Beautiful places.
                  </Text>

                  <Text
                    style={[
                      styles.sectionTitleAccent,
                      {
                        color: "#e11d48",
                      },
                    ]}
                  >
                    Exceptional experiences.
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    handleCustomerFeature(
                      "/customer/salons"
                    )
                  }
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>
                    Explore all salons
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={PRIMARY}
                  />
                </Pressable>
              </View>

              <View style={styles.salonsList}>
                {featuredSalons.map((salon) => (
                  <View
                    key={salon.name}
                    style={[
                      styles.salonCard,
                      isTablet && styles.salonCardTablet,
                    ]}
                  >
                    <View style={styles.salonImageWrapper}>
                      <Image
                        source={{ uri: salon.image }}
                        style={styles.salonImage}
                      />

                      <View
                        style={styles.salonImageOverlay}
                      />

                      <View style={styles.salonTag}>
                        <Text style={styles.salonTagText}>
                          {salon.tag}
                        </Text>
                      </View>

                      <Pressable
                        style={styles.salonHeart}
                      >
                        <Ionicons
                          name="heart-outline"
                          size={18}
                          color="#475569"
                        />
                      </Pressable>

                      <View style={styles.salonRating}>
                        <Ionicons
                          name="star"
                          size={12}
                          color="#fbbf24"
                        />

                        <Text style={styles.salonRatingText}>
                          {salon.rating}
                        </Text>
                      </View>

                      <Text style={styles.salonReviews}>
                        {salon.reviews} reviews
                      </Text>
                    </View>

                    <View style={styles.salonBody}>
                      <View style={styles.salonTitleRow}>
                        <View style={styles.salonTitleWrapper}>
                          <Text style={styles.salonName}>
                            {salon.name}
                          </Text>

                          <View style={styles.salonLocation}>
                            <Ionicons
                              name="location"
                              size={13}
                              color="#f43f5e"
                            />

                            <Text
                              style={
                                styles.salonLocationText
                              }
                              numberOfLines={1}
                            >
                              {salon.location}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.salonPrice}>
                          <Text style={styles.priceLabel}>
                            SERVICES FROM
                          </Text>

                          <Text style={styles.priceValue}>
                            {salon.price}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.salonBottom}>
                        <View style={styles.openToday}>
                          <View style={styles.openDot} />

                          <Text style={styles.openText}>
                            Open today
                          </Text>
                        </View>

                        <Pressable
                          onPress={() =>
                            handleCustomerFeature(
                              "/customer/salons"
                            )
                          }
                          style={styles.viewSalonButton}
                        >
                          <Text style={styles.viewSalonText}>
                            View salon
                          </Text>

                          <Ionicons
                            name="arrow-forward"
                            size={14}
                            color={PRIMARY}
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              TREATMENTS
          ====================================================== */}

          <View style={styles.sectionWhite}>
            <View style={styles.sectionContainer}>
              <View style={styles.centerHeader}>
                <View style={styles.centerEyebrow}>
                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor: "#8b5cf6",
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.sectionEyebrowText,
                      {
                        color: "#6d28d9",
                      },
                    ]}
                  >
                    POPULAR TREATMENTS
                  </Text>

                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor: "#8b5cf6",
                      },
                    ]}
                  />
                </View>

                <Text style={styles.centerTitle}>
                  Treat yourself to something special.
                </Text>

                <Text style={styles.centerDescription}>
                  Discover highly-loved treatments from salons
                  customers keep coming back to.
                </Text>
              </View>

              <View
                style={[
                  styles.treatmentsGrid,
                  isTablet && styles.treatmentsGridTablet,
                ]}
              >
                {treatments.map((item) => (
                  <View
                    key={item.name}
                    style={[
                      styles.treatmentCard,
                      isTablet &&
                        styles.treatmentCardTablet,
                    ]}
                  >
                    <View style={styles.treatmentImageWrapper}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.treatmentImage}
                      />

                      <View style={styles.treatmentCategory}>
                        <Text
                          style={
                            styles.treatmentCategoryText
                          }
                        >
                          {item.category}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.treatmentBody}>
                      <Text style={styles.treatmentName}>
                        {item.name}
                      </Text>

                      <View style={styles.treatmentDuration}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color="#94a3b8"
                        />

                        <Text
                          style={
                            styles.treatmentDurationText
                          }
                        >
                          {item.duration}
                        </Text>
                      </View>

                      <View style={styles.treatmentBottom}>
                        <View style={styles.treatmentPrices}>
                          <Text style={styles.treatmentPrice}>
                            {item.price}
                          </Text>

                          <Text
                            style={
                              styles.treatmentOldPrice
                            }
                          >
                            {item.oldPrice}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() =>
                            handleCustomerFeature(
                              "/customer/salons"
                            )
                          }
                          style={styles.treatmentArrow}
                        >
                          <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#6d28d9"
                          />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              WHY LUMORA
          ====================================================== */}

          <View
            style={styles.whySection}
            nativeID="about"
          >
            <View
              style={[
                styles.whyInner,
                isTablet && styles.whyInnerTablet,
              ]}
            >
              <View style={styles.whyContent}>
                <View style={styles.darkEyebrow}>
                  <View style={styles.darkLine} />

                  <Text style={styles.darkEyebrowText}>
                    WHY LUMORA
                  </Text>
                </View>

                <Text style={styles.whyTitle}>
                  Beauty booking,
                </Text>

                <Text style={styles.whyTitleAccent}>
                  without the guesswork.
                </Text>

                <Text style={styles.whyDescription}>
                  We believe booking a beauty appointment
                  should feel as effortless as the experience
                  itself. LUMORA brings salons, services,
                  stylists and availability together in one
                  seamless experience.
                </Text>

                <Pressable
                  onPress={() =>
                    handleCustomerFeature(
                      "/customer/salons"
                    )
                  }
                  style={styles.startExploringButton}
                >
                  <Text
                    style={styles.startExploringText}
                  >
                    Start exploring
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={PRIMARY}
                  />
                </Pressable>
              </View>

              <View
                style={[
                  styles.featuresGrid,
                  isTablet && styles.featuresGridTablet,
                ]}
              >
                {[
                  {
                    icon: "shield-checkmark-outline",
                    title: "Verified salons",
                    text:
                      "Discover trusted beauty businesses with detailed profiles and transparent information.",
                  },
                  {
                    icon: "calendar-outline",
                    title: "Easy booking",
                    text:
                      "Choose your service, stylist, date and available time slot without unnecessary calls.",
                  },
                  {
                    icon: "person-outline",
                    title: "Choose your stylist",
                    text:
                      "When available, select the professional you feel most comfortable booking with.",
                  },
                  {
                    icon: "trending-up-outline",
                    title: "Better discovery",
                    text:
                      "Compare salons, services, ratings and experiences before making your decision.",
                  },
                ].map((feature) => (
                  <View
                    key={feature.title}
                    style={styles.featureCard}
                  >
                    <View style={styles.featureIcon}>
                      <Ionicons
                        name={feature.icon}
                        size={21}
                        color="#f0abcf"
                      />
                    </View>

                    <Text style={styles.featureTitle}>
                      {feature.title}
                    </Text>

                    <Text style={styles.featureText}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              HOW IT WORKS
          ====================================================== */}

          <View style={styles.howSection}>
            <View style={styles.sectionContainer}>
              <View style={styles.centerHeader}>
                <View style={styles.centerEyebrow}>
                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor: "#f43f5e",
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.sectionEyebrowText,
                      {
                        color: "#e11d48",
                      },
                    ]}
                  >
                    SIMPLE BY DESIGN
                  </Text>

                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor: "#f43f5e",
                      },
                    ]}
                  />
                </View>

                <Text style={styles.centerTitle}>
                  Your next beauty moment is three steps away.
                </Text>
              </View>

              <View
                style={[
                  styles.stepsGrid,
                  isTablet && styles.stepsGridTablet,
                ]}
              >
                {[
                  {
                    number: "01",
                    icon: "search",
                    title: "Discover",
                    text:
                      "Search salons, explore services and find the beauty experience that matches you.",
                  },
                  {
                    number: "02",
                    icon: "person-check-outline",
                    title: "Choose",
                    text:
                      "Compare ratings, treatments, prices and available stylists before deciding.",
                  },
                  {
                    number: "03",
                    icon: "calendar-check-outline",
                    title: "Book",
                    text:
                      "Pick your date and available time slot, then confirm your appointment in moments.",
                  },
                ].map((step) => (
                  <View
                    key={step.number}
                    style={styles.stepCard}
                  >
                    <View style={styles.stepCircle}>
                      <Ionicons
                        name={step.icon}
                        size={27}
                        color="#ffffff"
                      />
                    </View>

                    <Text style={styles.stepNumber}>
                      STEP {step.number}
                    </Text>

                    <Text style={styles.stepTitle}>
                      {step.title}
                    </Text>

                    <Text style={styles.stepText}>
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              TESTIMONIALS
          ====================================================== */}

          <View style={styles.sectionWhite}>
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderText}>
                  <View style={styles.sectionEyebrow}>
                    <View
                      style={[
                        styles.sectionLine,
                        {
                          backgroundColor: "#8b5cf6",
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.sectionEyebrowText,
                        {
                          color: "#6d28d9",
                        },
                      ]}
                    >
                      LOVED BY CUSTOMERS
                    </Text>
                  </View>

                  <Text style={styles.sectionTitle}>
                    Real experiences.
                  </Text>

                  <Text
                    style={[
                      styles.sectionTitleAccent,
                      {
                        color: "#7c3aed",
                      },
                    ]}
                  >
                    Real confidence.
                  </Text>
                </View>

                <View style={styles.averageRating}>
                  <Ionicons
                    name="star"
                    size={15}
                    color="#fbbf24"
                  />

                  <Text style={styles.averageRatingText}>
                    4.9 average rating from verified customers
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.testimonialsGrid,
                  isTablet &&
                    styles.testimonialsGridTablet,
                ]}
              >
                {testimonials.map((review) => (
                  <View
                    key={review.name}
                    style={styles.testimonialCard}
                  >
                    {renderStars()}

                    <Text style={styles.testimonialText}>
                      “{review.text}”
                    </Text>

                    <View style={styles.testimonialBottom}>
                      <Image
                        source={{ uri: review.image }}
                        style={styles.testimonialImage}
                      />

                      <View style={styles.testimonialUser}>
                        <Text style={styles.testimonialName}>
                          {review.name}
                        </Text>

                        <Text style={styles.testimonialRole}>
                          {review.role}
                        </Text>
                      </View>

                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color="#10b981"
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* =====================================================
              SALON OWNER CTA
          ====================================================== */}

          <View style={styles.ownerCtaWrapper}>
            <View style={styles.ownerCta}>
              <View style={styles.ownerGlowOne} />
              <View style={styles.ownerGlowTwo} />

              <View
                style={[
                  styles.ownerCtaInner,
                  isTablet && styles.ownerCtaInnerTablet,
                ]}
              >
                <View style={styles.ownerContent}>
                  <View style={styles.ownerEyebrow}>
                    <Ionicons
                      name="storefront-outline"
                      size={14}
                      color="#f0abcf"
                    />

                    <Text style={styles.ownerEyebrowText}>
                      FOR SALON OWNERS
                    </Text>
                  </View>

                  <Text style={styles.ownerTitle}>
                    Your salon deserves to be discovered.
                  </Text>

                  <Text style={styles.ownerDescription}>
                    Join LUMORA and bring your salon, services,
                    staff and appointments into one modern
                    platform built to help beauty businesses
                    grow.
                  </Text>

                  <View style={styles.ownerPills}>
                    {[
                      "Manage your salon",
                      "Manage services",
                      "Manage staff",
                      "Track appointments",
                    ].map((item) => (
                      <View
                        key={item}
                        style={styles.ownerPill}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color="#f0abcf"
                        />

                        <Text style={styles.ownerPillText}>
                          {item}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    router.push("/salon-owner/register")
                  }
                  style={styles.registerSalonButton}
                >
                  <Text
                    style={styles.registerSalonText}
                  >
                    Register your salon
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={PRIMARY}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* =====================================================
              FAQ
          ====================================================== */}

          <View style={styles.faqSection}>
            <View
              style={[
                styles.faqInner,
                isTablet && styles.faqInnerTablet,
              ]}
            >
              <View style={styles.faqIntro}>
                <View style={styles.sectionEyebrow}>
                  <View
                    style={[
                      styles.sectionLine,
                      {
                        backgroundColor: "#8b5cf6",
                      },
                    ]}
                  />

                  <Text
                    style={[
                      styles.sectionEyebrowText,
                      {
                        color: "#6d28d9",
                      },
                    ]}
                  >
                    FREQUENTLY ASKED
                  </Text>
                </View>

                <Text style={styles.faqTitle}>
                  Questions,
                </Text>

                <Text style={styles.faqTitleAccent}>
                  answered.
                </Text>

                <Text style={styles.faqDescription}>
                  Everything you need to know before your first
                  LUMORA booking.
                </Text>
              </View>

              <View style={styles.faqList}>
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <View
                      key={faq.question}
                      style={[
                        styles.faqItem,
                        isOpen && styles.faqItemOpen,
                      ]}
                    >
                      <Pressable
                        onPress={() =>
                          setOpenFaq(
                            isOpen ? -1 : index
                          )
                        }
                        style={styles.faqQuestion}
                      >
                        <Text style={styles.faqQuestionText}>
                          {faq.question}
                        </Text>

                        <View
                          style={[
                            styles.faqArrow,
                            isOpen &&
                              styles.faqArrowOpen,
                          ]}
                        >
                          <Ionicons
                            name={
                              isOpen
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={14}
                            color={
                              isOpen
                                ? "#6d28d9"
                                : "#64748b"
                            }
                          />
                        </View>
                      </Pressable>

                      {isOpen ? (
                        <View style={styles.faqAnswer}>
                          <Text style={styles.faqAnswerText}>
                            {faq.answer}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* =====================================================
              FINAL CTA
          ====================================================== */}

          <View style={styles.finalCta}>
            <View style={styles.finalGlow} />

            <View style={styles.finalCtaInner}>
              <View style={styles.finalIcon}>
                <Text style={styles.finalSparkle}>✦</Text>
              </View>

              <Text style={styles.finalEyebrow}>
                YOUR NEXT CHAPTER STARTS HERE
              </Text>

              <Text style={styles.finalTitle}>
                Ready for your next
              </Text>

              <Text style={styles.finalTitleAccent}>
                beauty moment?
              </Text>

              <Text style={styles.finalDescription}>
                Find a salon you love, choose a treatment that
                feels right and book your next appointment with
                confidence.
              </Text>

              <View
                style={[
                  styles.finalButtons,
                  isSmallPhone &&
                    styles.finalButtonsSmall,
                ]}
              >
                <Pressable
                  onPress={() =>
                    handleCustomerFeature(
                      "/customer/salons"
                    )
                  }
                  style={styles.finalPrimaryButton}
                >
                  <Text style={styles.finalPrimaryText}>
                    Explore salons
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color="#ffffff"
                  />
                </Pressable>

                <Pressable
                  onPress={goCustomerRegister}
                  style={styles.finalSecondaryButton}
                >
                  <Text style={styles.finalSecondaryText}>
                    Create free account
                  </Text>

                  <Ionicons
                    name="person-add-outline"
                    size={15}
                    color={PRIMARY}
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <View style={styles.footer}>
            <View
              style={[
                styles.footerInner,
                isTablet && styles.footerInnerTablet,
              ]}
            >
              <View style={styles.footerGrid}>
                {/* Brand */}

                <View style={styles.footerBrand}>
                  <View style={styles.footerLogoRow}>
                    <View style={styles.footerLogo}>
                      <Text style={styles.footerLogoLetter}>
                        L
                      </Text>
                    </View>

                    <View>
                      <Text style={styles.footerLogoName}>
                        LUMORA
                      </Text>

                      <Text style={styles.footerTagline}>
                        BEAUTY • BOOKING
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.footerDescription}>
                    A modern beauty discovery and booking
                    experience designed to help you find salons,
                    discover treatments and book moments worth
                    remembering.
                  </Text>

                  <View style={styles.socialRow}>
                    {[
                      {
                        icon: "logo-instagram",
                        url: "https://instagram.com",
                      },
                      {
                        icon: "logo-facebook",
                        url: "https://facebook.com",
                      },
                      {
                        icon: "logo-youtube",
                        url: "https://youtube.com",
                      },
                      {
                        icon: "logo-google",
                        url: "https://google.com",
                      },
                    ].map((social) => (
                      <Pressable
                        key={social.icon}
                        onPress={() =>
                          Linking.openURL(social.url)
                        }
                        style={styles.socialButton}
                      >
                        <Ionicons
                          name={social.icon}
                          size={15}
                          color="rgba(255,255,255,0.6)"
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Discover */}

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>
                    DISCOVER
                  </Text>

                  {[
                    "Find a Salon",
                    "Popular Services",
                    "Top Rated Salons",
                    "Beauty Categories",
                  ].map((item) => (
                    <Pressable
                      key={item}
                      onPress={() =>
                        handleCustomerFeature(
                          "/customer/salons"
                        )
                      }
                      style={styles.footerLink}
                    >
                      <Text style={styles.footerLinkText}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Business */}

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>
                    FOR BUSINESS
                  </Text>

                  <Pressable
                    onPress={() =>
                      router.push(
                        "/salon-owner/register"
                      )
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerLinkText}>
                      Register your salon
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      router.push("/salon-owner/login")
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerLinkText}>
                      Salon Owner Login
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() =>
                      router.push("/admin/login")
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerLinkText}>
                      Admin Login
                    </Text>
                  </Pressable>

                  <Pressable style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>
                      Business Support
                    </Text>
                  </Pressable>
                </View>

                {/* Company */}

                <View style={styles.footerColumn}>
                  <Text style={styles.footerColumnTitle}>
                    COMPANY
                  </Text>

                  <Pressable
                    onPress={() =>
                      scrollToSection("about")
                    }
                    style={styles.footerLink}
                  >
                    <Text style={styles.footerLinkText}>
                      About LUMORA
                    </Text>
                  </Pressable>

                  <Pressable style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>
                      Contact
                    </Text>
                  </Pressable>

                  <Pressable style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>
                      Privacy Policy
                    </Text>
                  </Pressable>

                  <Pressable style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>
                      Terms & Conditions
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.footerBottom}>
                <Text style={styles.copyright}>
                  © 2026 LUMORA. All rights reserved.
                </Text>

                <View style={styles.footerBottomRight}>
                  <Text style={styles.footerBottomText}>
                    Made for modern beauty experiences
                  </Text>

                  <Text style={styles.footerDot}>•</Text>

                  <Text style={styles.footerBottomText}>
                    Your Beauty. Your Time. Your Place.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CustomerHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  screen: {
    flex: 1,
    backgroundColor: BG,
  },

  scrollView: {
    flex: 1,
  },

  announcement: {
    minHeight: 35,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#211326",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  announcementText: {
    color: "#ffffff",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    textAlign: "center",
  },

  announcementDot: {
    color: "#f0abcf",
    fontSize: 11,
    fontWeight: "900",
  },

  header: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    zIndex: 50,
    elevation: 5,
  },

  headerInner: {
    minHeight: 72,
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 150,
  },

  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "#251329",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    position: "relative",
    shadowColor: "#251329",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },

  logoLetter: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  logoSparkle: {
    position: "absolute",
    right: 6,
    top: 5,
    color: "#f0abcf",
    fontSize: 8,
  },

  logoTextWrapper: {
    flexShrink: 1,
  },

  logoName: {
    color: "#251329",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 2.4,
  },

  logoTagline: {
    marginTop: -1,
    color: "#94a3b8",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.8,
  },

  desktopNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },

  navButton: {
    paddingVertical: 10,
    paddingHorizontal: 3,
  },

  navText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },

  activeNavText: {
    color: "#251329",
    fontWeight: "900",
  },

  headerAuth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  dropdownWrapper: {
    position: "relative",
    zIndex: 100,
  },

  loginButton: {
    minHeight: 43,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  loginButtonText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "800",
  },

  getStartedButton: {
    minHeight: 45,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },

  getStartedText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  dropdown: {
    position: "absolute",
    top: 51,
    right: 0,
    width: 260,
    padding: 8,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 10,
  },

  dropdownTitle: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 8,
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 10,
    borderRadius: 13,
  },

  dropdownIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  dropdownContent: {
    flex: 1,
    minWidth: 0,
  },

  dropdownMainText: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "900",
  },

  dropdownSubText: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
  },

  mobileMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileMenu: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingBottom: 17,
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    zIndex: 40,
  },

  mobileNavItem: {
    minHeight: 45,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 13,
  },

  mobileNavText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  mobileAuthDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 8,
  },

  mobileOutlineButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  mobileOutlineButtonText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "800",
  },

  mobilePrimaryButton: {
    minHeight: 47,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 8,
  },

  mobilePrimaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  mobileSalonButton: {
    minHeight: 47,
    borderRadius: 13,
    backgroundColor: "#ffe4e6",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileSalonButtonText: {
    color: "#9f1239",
    fontSize: 13,
    fontWeight: "900",
  },

  /* =========================================================
     HERO
  ========================================================== */

  hero: {
    backgroundColor: "#f8f2f7",
    overflow: "hidden",
    position: "relative",
  },

  heroGlowOne: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#f5d0fe",
    opacity: 0.28,
    left: -170,
    top: 70,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 370,
    height: 370,
    borderRadius: 185,
    backgroundColor: "#ddd6fe",
    opacity: 0.35,
    right: -180,
    top: 70,
  },

  heroInner: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 42,
  },

  heroInnerTablet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 38,
    paddingHorizontal: 30,
    paddingVertical: 65,
  },

  heroContent: {
    width: "100%",
  },

  heroContentTablet: {
    flex: 1.05,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd6fe",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 20,
  },

  heroBadgeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  heroBadgeSparkle: {
    color: "#6d28d9",
    fontSize: 11,
  },

  heroBadgeText: {
    color: "#5b21b6",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  heroTitle: {
    color: "#251329",
    fontSize: 45,
    lineHeight: 47,
    fontWeight: "900",
    letterSpacing: -1.7,
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  heroTitleSmall: {
    fontSize: 39,
    lineHeight: 41,
  },

  heroTitleTablet: {
    fontSize: 64,
    lineHeight: 65,
  },

  heroTitleAccent: {
    marginTop: 4,
    color: "#a21caf",
    fontSize: 45,
    lineHeight: 47,
    fontWeight: "900",
    letterSpacing: -1.7,
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  heroTitleAccentSmall: {
    fontSize: 39,
    lineHeight: 41,
  },

  heroTitleAccentTablet: {
    fontSize: 64,
    lineHeight: 65,
  },

  heroDescription: {
    marginTop: 19,
    color: "#64748b",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "500",
    maxWidth: 620,
  },

  heroDescriptionTablet: {
    fontSize: 16,
    lineHeight: 27,
    marginTop: 23,
  },

  searchCard: {
    marginTop: 27,
    padding: 8,
    borderRadius: 23,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#251329",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.11,
    shadowRadius: 30,
    elevation: 5,
  },

  searchRow: {
    width: "100%",
  },

  searchField: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
  },

  searchFieldBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  searchIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  locationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  searchInputContainer: {
    flex: 1,
    minWidth: 0,
  },

  searchLabel: {
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
  },

  searchInput: {
    width: "100%",
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "700",
    paddingVertical: 3,
  },

  searchButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  searchButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },

  searchButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  heroChecks: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 15,
    marginTop: 17,
  },

  heroCheck: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  heroCheckText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
  },

  heroVisual: {
    width: "100%",
    marginTop: 35,
    alignItems: "center",
  },

  heroVisualTablet: {
    flex: 0.95,
    marginTop: 0,
  },

  heroImageGlow: {
    position: "absolute",
    left: 0,
    right: 0,
    top: -10,
    bottom: -10,
    borderRadius: 40,
    backgroundColor: "#e9d5ff",
    opacity: 0.35,
  },

  heroImageFrame: {
    width: "100%",
    maxWidth: 620,
    height: 480,
    borderRadius: 35,
    borderWidth: 6,
    borderColor: "#ffffff",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#2d1432",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.18,
    shadowRadius: 35,
    elevation: 7,
  },

  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  heroImageSmall: {
    height: 430,
  },

  heroImageTablet: {
    height: 600,
  },

  heroImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(37,19,41,0.10)",
  },

  ratingFloating: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 17,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },

  ratingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  ratingValue: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "900",
  },

  ratingLabel: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "700",
  },

  bookingFloating: {
    position: "absolute",
    left: 13,
    right: 13,
    bottom: 13,
    padding: 15,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 6,
  },

  bookingTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  bookingTitleWrapper: {
    flex: 1,
    minWidth: 0,
  },

  bookingEyebrow: {
    color: "#7c3aed",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  bookingTitle: {
    marginTop: 3,
    color: PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  heartButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  bookingMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
  },

  bookingMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  bookingMetaText: {
    color: "#64748b",
    fontSize: 9,
    fontWeight: "700",
  },

  exploreSalonButton: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 12,
  },

  exploreSalonText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },

  availabilityFloating: {
    position: "absolute",
    right: -3,
    top: "32%",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 5,
  },

  availabilityIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  availabilityLabel: {
    color: "#94a3b8",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  availabilityValue: {
    marginTop: 3,
    color: "#334155",
    fontSize: 11,
    fontWeight: "900",
  },

  /* =========================================================
     STATS
  ========================================================== */

  statsSection: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },

  statsGridTablet: {
    maxWidth: 1350,
    alignSelf: "center",
  },

  statItem: {
    width: "50%",
    paddingHorizontal: 12,
    paddingVertical: 21,
    alignItems: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },

  statValue: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  statLabel: {
    marginTop: 4,
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },

  /* =========================================================
     COMMON SECTIONS
  ========================================================== */

  sectionWhite: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 62,
  },

  sectionSoft: {
    backgroundColor: "#f8f4f8",
    paddingHorizontal: 16,
    paddingVertical: 62,
  },

  sectionContainer: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },

  sectionHeader: {
    gap: 20,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 11,
  },

  sectionLine: {
    width: 27,
    height: 1,
  },

  sectionEyebrowText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  sectionTitle: {
    color: PRIMARY,
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  sectionTitleAccent: {
    fontSize: 36,
    lineHeight: 41,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  sectionDescription: {
    maxWidth: 650,
    marginTop: 13,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
  },

  viewAllButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 8,
  },

  viewAllText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "900",
  },

  /* =========================================================
     CATEGORIES
  ========================================================== */

  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 30,
  },

  categoriesGridTablet: {
    gap: 15,
  },

  categoryCard: {
    width: "48.5%",
    height: 225,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#e2e8f0",
  },

  categoryCardTablet: {
    width: "15.9%",
    height: 280,
  },

  categoryCardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },

  categoryImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  categoryOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(27,13,32,0.48)",
  },

  categoryContent: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 15,
  },

  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  categoryName: {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  categoryCount: {
    marginTop: 3,
    color: "rgba(255,255,255,0.68)",
    fontSize: 8,
    fontWeight: "800",
  },

  /* =========================================================
     SALONS
  ========================================================== */

  salonsList: {
    marginTop: 31,
    gap: 18,
  },

  salonCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ffffff",
    shadowColor: "#251329",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },

  salonCardTablet: {
    width: "100%",
  },

  salonImageWrapper: {
    width: "100%",
    height: 245,
    position: "relative",
  },

  salonImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  salonImageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.17)",
  },

  salonTag: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
  },

  salonTagText: {
    color: PRIMARY,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  salonHeart: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  salonRating: {
    position: "absolute",
    bottom: 14,
    left: 14,
    minHeight: 29,
    paddingHorizontal: 10,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  salonRatingText: {
    color: "#334155",
    fontSize: 10,
    fontWeight: "900",
  },

  salonReviews: {
    position: "absolute",
    bottom: 19,
    left: 73,
    color: "rgba(255,255,255,0.92)",
    fontSize: 9,
    fontWeight: "700",
  },

  salonBody: {
    padding: 18,
  },

  salonTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  salonTitleWrapper: {
    flex: 1,
    minWidth: 0,
  },

  salonName: {
    color: PRIMARY,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  salonLocation: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  salonLocationText: {
    flex: 1,
    color: "#64748b",
    fontSize: 9,
    fontWeight: "700",
  },

  salonPrice: {
    alignItems: "flex-end",
    maxWidth: 78,
  },

  priceLabel: {
    color: "#94a3b8",
    fontSize: 6,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "right",
  },

  priceValue: {
    marginTop: 4,
    color: PRIMARY,
    fontSize: 18,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  salonBottom: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  openToday: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  openDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },

  openText: {
    color: "#059669",
    fontSize: 9,
    fontWeight: "900",
  },

  viewSalonButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  viewSalonText: {
    color: PRIMARY,
    fontSize: 9,
    fontWeight: "900",
  },

  /* =========================================================
     TREATMENTS
  ========================================================== */

  centerHeader: {
    alignItems: "center",
  },

  centerEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  centerTitle: {
    color: PRIMARY,
    fontSize: 33,
    lineHeight: 39,
    fontWeight: "900",
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  centerDescription: {
    maxWidth: 600,
    marginTop: 11,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  treatmentsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    marginTop: 31,
  },

  treatmentsGridTablet: {
    gap: 15,
  },

  treatmentCard: {
    width: "48.3%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.04,
    shadowRadius: 13,
    elevation: 1,
  },

  treatmentCardTablet: {
    width: "24%",
  },

  treatmentImageWrapper: {
    width: "100%",
    height: 185,
    position: "relative",
  },

  treatmentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  treatmentCategory: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
  },

  treatmentCategoryText: {
    color: "#6d28d9",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  treatmentBody: {
    padding: 14,
  },

  treatmentName: {
    color: PRIMARY,
    fontSize: 16,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  treatmentDuration: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  treatmentDurationText: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
  },

  treatmentBottom: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  treatmentPrices: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 1,
  },

  treatmentPrice: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  treatmentOldPrice: {
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "700",
    textDecorationLine: "line-through",
  },

  treatmentArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================================================
     WHY
  ========================================================== */

  whySection: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 64,
    overflow: "hidden",
  },

  whyInner: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },

  whyInnerTablet: {
    flexDirection: "row",
    gap: 45,
    alignItems: "center",
  },

  whyContent: {
    flex: 0.85,
  },

  darkEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  darkLine: {
    width: 28,
    height: 1,
    backgroundColor: "#f0abcf",
  },

  darkEyebrowText: {
    color: "#f0abcf",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  whyTitle: {
    color: "#ffffff",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  whyTitleAccent: {
    color: "#f0abcf",
    fontSize: 36,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  whyDescription: {
    marginTop: 18,
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    lineHeight: 22,
    fontWeight: "500",
  },

  startExploringButton: {
    alignSelf: "flex-start",
    minHeight: 45,
    marginTop: 21,
    paddingHorizontal: 17,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  startExploringText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
  },

  featuresGrid: {
    marginTop: 31,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },

  featuresGridTablet: {
    flex: 1.15,
    marginTop: 0,
  },

  featureCard: {
    width: "48%",
    minHeight: 190,
    padding: 17,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.09)",
    alignItems: "center",
    justifyContent: "center",
  },

  featureTitle: {
    marginTop: 14,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  featureText: {
    marginTop: 9,
    color: "rgba(255,255,255,0.48)",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "500",
  },

  /* =========================================================
     HOW
  ========================================================== */

  howSection: {
    backgroundColor: "#faf7fa",
    paddingHorizontal: 16,
    paddingVertical: 64,
  },

  stepsGrid: {
    marginTop: 38,
    gap: 38,
  },

  stepsGridTablet: {
    flexDirection: "row",
    gap: 20,
  },

  stepCard: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
  },

  stepCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: PRIMARY,
    borderWidth: 7,
    borderColor: "#faf7fa",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 4,
  },

  stepNumber: {
    marginTop: 15,
    color: "#7c3aed",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  stepTitle: {
    marginTop: 6,
    color: PRIMARY,
    fontSize: 22,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  stepText: {
    maxWidth: 340,
    marginTop: 8,
    color: "#64748b",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "500",
    textAlign: "center",
  },

  /* =========================================================
     TESTIMONIALS
  ========================================================== */

  averageRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  averageRatingText: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
  },

  testimonialsGrid: {
    marginTop: 30,
    gap: 13,
  },

  testimonialsGridTablet: {
    flexDirection: "row",
  },

  testimonialCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: BG,
    padding: 19,
  },

  starsRow: {
    flexDirection: "row",
    gap: 3,
  },

  testimonialText: {
    marginTop: 17,
    color: PRIMARY,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "800",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  testimonialBottom: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
  },

  testimonialImage: {
    width: 41,
    height: 41,
    borderRadius: 21,
  },

  testimonialUser: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  testimonialName: {
    color: "#334155",
    fontSize: 11,
    fontWeight: "900",
  },

  testimonialRole: {
    marginTop: 2,
    color: "#94a3b8",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  /* =========================================================
     OWNER CTA
  ========================================================== */

  ownerCtaWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },

  ownerCta: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#251329",
    paddingHorizontal: 20,
    paddingVertical: 34,
    position: "relative",
  },

  ownerGlowOne: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    right: -100,
    top: -100,
    backgroundColor: "#d946ef",
    opacity: 0.12,
  },

  ownerGlowTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    left: "30%",
    bottom: -120,
    backgroundColor: "#8b5cf6",
    opacity: 0.12,
  },

  ownerCtaInner: {
    position: "relative",
  },

  ownerCtaInnerTablet: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 35,
  },

  ownerContent: {
    flex: 1,
    minWidth: 0,
  },

  ownerEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  ownerEyebrowText: {
    color: "#f0abcf",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  ownerTitle: {
    marginTop: 12,
    color: "#ffffff",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  ownerDescription: {
    marginTop: 13,
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    maxWidth: 700,
  },

  ownerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 17,
  },

  ownerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  ownerPillText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 8,
    fontWeight: "800",
  },

  registerSalonButton: {
    minHeight: 49,
    marginTop: 25,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  registerSalonText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
  },

  /* =========================================================
     FAQ
  ========================================================== */

  faqSection: {
    backgroundColor: "#faf7fa",
    paddingHorizontal: 16,
    paddingVertical: 64,
  },

  faqInner: {
    width: "100%",
    maxWidth: 1100,
    alignSelf: "center",
  },

  faqInnerTablet: {
    flexDirection: "row",
    gap: 45,
  },

  faqIntro: {
    flex: 0.7,
  },

  faqList: {
    flex: 1.3,
    marginTop: 30,
    gap: 8,
  },

  faqTitle: {
    color: PRIMARY,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  faqTitleAccent: {
    color: "#7c3aed",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  faqDescription: {
    marginTop: 15,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },

  faqItem: {
    overflow: "hidden",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },

  faqItemOpen: {
    borderColor: "#ddd6fe",
  },

  faqQuestion: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  faqQuestionText: {
    flex: 1,
    color: PRIMARY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },

  faqArrow: {
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },

  faqArrowOpen: {
    backgroundColor: "#ede9fe",
  },

  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },

  faqAnswerText: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 19,
    fontWeight: "500",
  },

  /* =========================================================
     FINAL CTA
  ========================================================== */

  finalCta: {
    backgroundColor: "#f8eef7",
    paddingHorizontal: 16,
    paddingVertical: 70,
    overflow: "hidden",
    position: "relative",
  },

  finalGlow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
    left: "50%",
    top: "50%",
    marginLeft: -200,
    marginTop: -200,
    backgroundColor: "#f0abcf",
    opacity: 0.15,
  },

  finalCtaInner: {
    position: "relative",
    width: "100%",
    maxWidth: 850,
    alignSelf: "center",
    alignItems: "center",
  },

  finalIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },

  finalSparkle: {
    color: "#ffffff",
    fontSize: 20,
  },

  finalEyebrow: {
    marginTop: 17,
    color: "#6d28d9",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.6,
    textAlign: "center",
  },

  finalTitle: {
    marginTop: 9,
    color: PRIMARY,
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  finalTitleAccent: {
    color: "#7c3aed",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    textAlign: "center",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  finalDescription: {
    maxWidth: 620,
    marginTop: 14,
    color: "#64748b",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  finalButtons: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  finalButtonsSmall: {
    width: "100%",
    flexDirection: "column",
  },

  finalPrimaryButton: {
    minHeight: 49,
    paddingHorizontal: 19,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },

  finalPrimaryText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },

  finalSecondaryButton: {
    minHeight: 49,
    paddingHorizontal: 19,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  finalSecondaryText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: "900",
  },

  /* =========================================================
     FOOTER
  ========================================================== */

  footer: {
    backgroundColor: PRIMARY_DARK,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 25,
  },

  footerInner: {
    width: "100%",
    maxWidth: 1400,
    alignSelf: "center",
  },

  footerInnerTablet: {},

  footerGrid: {
    gap: 38,
  },

  footerBrand: {
    maxWidth: 430,
  },

  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLogo: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  footerLogoLetter: {
    color: PRIMARY,
    fontSize: 24,
    fontWeight: "900",
    fontStyle: "italic",
    fontFamily:
      Platform.OS === "ios"
        ? "Georgia"
        : undefined,
  },

  footerLogoName: {
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 2.1,
  },

  footerTagline: {
    marginTop: -1,
    color: "rgba(255,255,255,0.28)",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.7,
  },

  footerDescription: {
    marginTop: 17,
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    lineHeight: 19,
    fontWeight: "500",
  },

  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 17,
  },

  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },

  footerColumn: {
    gap: 10,
  },

  footerColumnTitle: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 5,
  },

  footerLink: {
    alignSelf: "flex-start",
  },

  footerLinkText: {
    color: "rgba(255,255,255,0.42)",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "600",
  },

  footerBottom: {
    marginTop: 40,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    gap: 8,
  },

  copyright: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 9,
    fontWeight: "600",
  },

  footerBottomRight: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  footerBottomText: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 8,
    fontWeight: "600",
  },

  footerDot: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 9,
  },
});