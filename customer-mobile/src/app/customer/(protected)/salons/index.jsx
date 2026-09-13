import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import { getCustomerSalons } from "../../../../services/customerSalonService";
import CustomerFooter from "../../../../components/customers/CustomerFooter";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#54205B",
  primaryDark: "#29162C",
  primaryDeep: "#241028",
  primaryLight: "#71366F",

  accent: "#92548C",
  accentLight: "#E7B8DA",

  background: "#FCF9FC",
  white: "#FFFFFF",

  text: "#29162C",
  textMuted: "#817582",
  textLight: "#9A8A9B",

  border: "#EADDE9",
  borderLight: "#F0E7F0",

  success: "#2F8F63",
  successBg: "#EAF7F0",

  danger: "#C44545",
  dangerBg: "#FFF1F1",

  softPurple: "#F4ECF5",
  softPink: "#F7E8F2",
  softCard: "#FAF6FA",
};

/* =========================================================
   HELPERS
========================================================= */

const getApiServerUrl = () => {
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "";

  if (!apiUrl) {
    return "";
  }

  return apiUrl.replace(/\/api\/?$/, "");
};

const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const serverUrl = getApiServerUrl();

  if (!serverUrl) {
    return imagePath;
  }

  return `${serverUrl}${
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }`;
};

const formatCount = (value) => {
  const number = Number(value || 0);

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}k`;
  }

  return String(number);
};

/* =========================================================
   SALON IMAGE PLACEHOLDER
========================================================= */

const SalonImagePlaceholder = () => {
  return (
    <View style={styles.imagePlaceholder}>
      <View style={styles.placeholderIcon}>
        <Ionicons
          name="storefront-outline"
          size={32}
          color={COLORS.white}
        />
      </View>

      <Text style={styles.placeholderBrand}>
        LUMORA
      </Text>
    </View>
  );
};

/* =========================================================
   SALON IMAGE
========================================================= */

const SalonImage = ({
  image,
  salonName,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return <SalonImagePlaceholder />;
  }

  return (
    <Image
      source={{ uri: image }}
      style={styles.salonImage}
      resizeMode="cover"
      onError={() => setHasError(true)}
      accessibilityLabel={`${salonName || "Salon"} image`}
    />
  );
};

/* =========================================================
   SALON CARD
========================================================= */

const SalonCard = ({
  salon,
  onView,
  onBook,
  cardWidth,
  isSmallMobile,
  isTablet,
}) => {
  const image =
    salon?.images?.[0]
      ? getImageUrl(salon.images[0])
      : null;

  return (
    <View
      style={[
        styles.salonCard,
        {
          width: cardWidth,
        },
      ]}
    >
      {/* IMAGE */}

      <View
        style={[
          styles.salonImageContainer,

          isSmallMobile &&
            styles.salonImageContainerSmall,

          isTablet &&
            styles.salonImageContainerTablet,
        ]}
      >
        <SalonImage
          image={image}
          salonName={salon?.name}
        />

        <View
          pointerEvents="none"
          style={styles.imageOverlay}
        />

        <View
          pointerEvents="none"
          style={styles.imageShine}
        />

        {/* AVAILABLE */}

        <View style={styles.availableBadge}>
          <View style={styles.availableDot}>
            <Ionicons
              name="checkmark"
              size={9}
              color={COLORS.white}
            />
          </View>

          <Text style={styles.availableText}>
            AVAILABLE
          </Text>
        </View>

        {/* LOCATION */}

        <View style={styles.cityBadge}>
          <Ionicons
            name="location-outline"
            size={13}
            color={COLORS.white}
          />

          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.cityText}
          >
            {salon?.city || "Location unavailable"}
          </Text>
        </View>

        {/* PHOTO COUNT */}

        {Array.isArray(salon?.images) &&
          salon.images.length > 1 && (
            <View style={styles.photoCount}>
              <Ionicons
                name="images-outline"
                size={11}
                color={COLORS.white}
              />

              <Text style={styles.photoCountText}>
                +{salon.images.length - 1}
              </Text>
            </View>
          )}
      </View>

      {/* CONTENT */}

      <View style={styles.salonContent}>
        <View style={styles.nameSection}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.salonName}
          >
            {salon?.name || "Unnamed Salon"}
          </Text>

          <View style={styles.addressRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color={COLORS.accent}
            />

            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.addressText}
            >
              {salon?.address || "Address unavailable"}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          style={styles.description}
        >
          {salon?.description ||
            "Discover premium beauty services and personalized salon experiences."}
        </Text>

        {/* CONTACT */}

        <View style={styles.contactGrid}>
          {salon?.phone ? (
            <View style={styles.contactBox}>
              <View style={styles.contactIcon}>
                <Ionicons
                  name="call-outline"
                  size={13}
                  color={COLORS.accent}
                />
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.contactText}
              >
                {salon.phone}
              </Text>
            </View>
          ) : null}

          {salon?.email ? (
            <View style={styles.contactBox}>
              <View style={styles.contactIcon}>
                <Ionicons
                  name="mail-outline"
                  size={13}
                  color={COLORS.accent}
                />
              </View>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.contactText}
              >
                {salon.email}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ACTIONS */}

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => onView(salon?._id)}
            style={({ pressed }) => [
              styles.viewButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.viewButtonText}>
              View Salon
            </Text>

            <Ionicons
              name="arrow-forward"
              size={14}
              color={COLORS.primary}
            />
          </Pressable>

          <Pressable
            onPress={() => onBook(salon?._id)}
            style={({ pressed }) => [
              styles.bookButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={COLORS.white}
            />

            <Text style={styles.bookButtonText}>
              Book Now
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({
  onReset,
  isSmallMobile,
}) => {
  return (
    <View
      style={[
        styles.emptyCard,
        isSmallMobile &&
          styles.emptyCardSmall,
      ]}
    >
      <View style={styles.emptyGlowOne} />
      <View style={styles.emptyGlowTwo} />

      <View style={styles.emptyIcon}>
        <Ionicons
          name="storefront-outline"
          size={34}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.emptyTitle}>
        No salons found
      </Text>

      <Text style={styles.emptyDescription}>
        We couldn't find any active salons matching
        your search. Try another salon name or city.
      </Text>

      <Pressable
        onPress={onReset}
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons
          name="refresh-outline"
          size={16}
          color={COLORS.white}
        />

        <Text style={styles.resetButtonText}>
          Reset Search
        </Text>
      </Pressable>
    </View>
  );
};

/* =========================================================
   SKELETON CARD
========================================================= */

const SkeletonCard = ({
  cardWidth,
  isSmallMobile,
  isTablet,
}) => {
  return (
    <View
      style={[
        styles.skeletonCard,
        {
          width: cardWidth,
        },
      ]}
    >
      <View
        style={[
          styles.skeletonImage,

          isSmallMobile &&
            styles.skeletonImageSmall,

          isTablet &&
            styles.skeletonImageTablet,
        ]}
      />

      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLineLarge} />
        <View style={styles.skeletonLineMedium} />
        <View style={styles.skeletonLineSmall} />

        <View style={styles.skeletonContactRow}>
          <View style={styles.skeletonContact} />
          <View style={styles.skeletonContact} />
        </View>

        <View style={styles.skeletonButtons}>
          <View style={styles.skeletonButton} />
          <View style={styles.skeletonButton} />
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   FILTER MODAL
========================================================= */

const FilterModal = ({
  visible,
  searchInput,
  cityInput,
  setSearchInput,
  setCityInput,
  onApply,
  onReset,
  onClose,
  isSmallMobile,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View
          style={[
            styles.filterSheet,
            isSmallMobile &&
              styles.filterSheetSmall,
          ]}
        >
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.sheetEyebrow}>
                DISCOVER
              </Text>

              <Text style={styles.sheetTitle}>
                Refine your search
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={21}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          {/* SALON INPUT */}

          <View style={styles.modalInputWrapper}>
            <Ionicons
              name="search-outline"
              size={18}
              color={COLORS.accent}
            />

            <TextInput
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Search salon by name..."
              placeholderTextColor={COLORS.textLight}
              style={styles.modalInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />

            {searchInput ? (
              <Pressable
                onPress={() =>
                  setSearchInput("")
                }
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color="#B7A8B8"
                />
              </Pressable>
            ) : null}
          </View>

          {/* CITY INPUT */}

          <View style={styles.modalInputWrapper}>
            <Ionicons
              name="location-outline"
              size={18}
              color={COLORS.accent}
            />

            <TextInput
              value={cityInput}
              onChangeText={setCityInput}
              placeholder="Search by city..."
              placeholderTextColor={COLORS.textLight}
              style={styles.modalInput}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="words"
            />
          </View>

          {/* ACTIONS */}

          <View style={styles.modalActions}>
            <Pressable
              onPress={onReset}
              style={({ pressed }) => [
                styles.modalResetButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalResetText}>
                Reset
              </Text>
            </Pressable>

            <Pressable
              onPress={onApply}
              style={({ pressed }) => [
                styles.modalApplyButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="search-outline"
                size={15}
                color={COLORS.white}
              />

              <Text style={styles.modalApplyText}>
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* =========================================================
   FILTER CHIP
========================================================= */

const FilterChip = ({
  label,
  value,
  onRemove,
}) => {
  return (
    <View style={styles.filterChip}>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={styles.filterChipText}
      >
        {label}: {value}
      </Text>

      <Pressable
        onPress={onRemove}
        hitSlop={8}
        style={styles.filterChipClose}
      >
        <Ionicons
          name="close"
          size={12}
          color={COLORS.primary}
        />
      </Pressable>
    </View>
  );
};

/* =========================================================
   MAIN
========================================================= */

const SalonDiscovery = () => {
  const router = useRouter();

  const { width } =
    useWindowDimensions();

  const scrollViewRef = useRef(null);

  const [searchInput, setSearchInput] =
    useState("");

  const [cityInput, setCityInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [city, setCity] =
    useState("");

  const [salons, setSalons] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [showFilters, setShowFilters] =
    useState(false);

  const limit = 9;

  /* =======================================================
     RESPONSIVE BREAKPOINTS
  ======================================================= */

  const isSmallMobile =
    width < 380;

  const isMobile =
    width < 640;

  const isTablet =
    width >= 640 &&
    width < 1024;

  const isLaptop =
    width >= 1024 &&
    width < 1280;

  const isDesktop =
    width >= 1280;

  /* =======================================================
     PAGE PADDING
  ======================================================= */

  const horizontalPadding =
    useMemo(() => {
      if (width >= 1440) {
        return 42;
      }

      if (width >= 1280) {
        return 34;
      }

      if (width >= 1024) {
        return 28;
      }

      if (width >= 768) {
        return 24;
      }

      if (width >= 640) {
        return 20;
      }

      if (width >= 430) {
        return 16;
      }

      return 12;
    }, [width]);

  /* =======================================================
     CARD WIDTH
  ======================================================= */

  const cardWidth =
    useMemo(() => {
      const availableWidth =
        width -
        horizontalPadding * 2;

      if (width >= 1280) {
        const gap = 22;

        return Math.max(
          280,
          Math.floor(
            (availableWidth - gap * 2) / 3
          )
        );
      }

      if (width >= 640) {
        const gap = 18;

        return Math.max(
          280,
          Math.floor(
            (availableWidth - gap) / 2
          )
        );
      }

      return Math.max(
        0,
        availableWidth
      );
    }, [
      width,
      horizontalPadding,
    ]);

  /* =======================================================
     AUTH
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const [
          token,
          role,
          user,
        ] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("user"),
        ]);

        if (!mounted) {
          return;
        }

        if (
          !token ||
          !role ||
          role.trim().toUpperCase() !==
            "CUSTOMER" ||
          !user
        ) {
          router.replace(
            "/customer/login"
          );
        }
      } catch (authError) {
        console.error(
          "Customer authentication error:",
          authError
        );

        if (mounted) {
          router.replace(
            "/customer/login"
          );
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* =======================================================
     LOAD SALONS
  ======================================================= */

  const loadSalons =
    useCallback(
      async (showRefresh = false) => {
        try {
          setError("");

          if (showRefresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          const response =
            await getCustomerSalons({
              search,
              city,
              page,
              limit,
            });

          setSalons(
            Array.isArray(
              response?.salons
            )
              ? response.salons
              : []
          );

          setTotal(
            Number(
              response?.total || 0
            )
          );

          setTotalPages(
            Number(
              response?.totalPages || 0
            )
          );
        } catch (err) {
          console.error(
            "Customer salons error:",
            err
          );

          setError(
            err?.response?.data
              ?.message ||
              "Unable to load salons right now. Please try again."
          );

          setSalons([]);
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        search,
        city,
        page,
      ]
    );

  useEffect(() => {
    loadSalons();
  }, [loadSalons]);

  /* =======================================================
     SCROLL TOP
  ======================================================= */

  const scrollToTop =
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      });
    }, []);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const changePage =
    useCallback(
      (nextPage) => {
        if (
          nextPage < 1 ||
          nextPage > totalPages ||
          nextPage === page
        ) {
          return;
        }

        setPage(nextPage);

        scrollToTop();
      },
      [
        page,
        totalPages,
        scrollToTop,
      ]
    );

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearch =
    useCallback(() => {
      setSearch(
        searchInput.trim()
      );

      setCity(
        cityInput.trim()
      );

      setPage(1);

      setShowFilters(false);

      scrollToTop();
    }, [
      searchInput,
      cityInput,
      scrollToTop,
    ]);

  /* =======================================================
     RESET
  ======================================================= */

  const handleReset =
    useCallback(() => {
      setSearchInput("");
      setCityInput("");

      setSearch("");
      setCity("");

      setPage(1);

      setShowFilters(false);

      scrollToTop();
    }, [scrollToTop]);

  /* =======================================================
     VIEW SALON
  ======================================================= */

  const handleViewSalon =
    useCallback(
      (salonId) => {
        if (!salonId) {
          return;
        }

        router.push(
          `/customer/salons/${salonId}`
        );
      },
      [router]
    );

  /* =======================================================
     BOOK
  ======================================================= */

  const handleBook =
    useCallback(
      async (salonId) => {
        if (!salonId) {
          return;
        }

        try {
          const [
            token,
            role,
            user,
          ] = await Promise.all([
            AsyncStorage.getItem("token"),
            AsyncStorage.getItem("role"),
            AsyncStorage.getItem("user"),
          ]);

          if (
            !token ||
            role?.trim().toUpperCase() !==
              "CUSTOMER" ||
            !user
          ) {
            router.replace(
              "/customer/login"
            );

            return;
          }

          router.push(
            `/customer/salons/${salonId}`
          );
        } catch (bookingError) {
          console.error(
            "Booking authentication error:",
            bookingError
          );

          router.replace(
            "/customer/login"
          );
        }
      },
      [router]
    );

  /* =======================================================
     PAGINATION ITEMS
  ======================================================= */

  const paginationItems =
    useMemo(() => {
      if (totalPages <= 1) {
        return [];
      }

      const pages = [];

      let start = Math.max(
        1,
        page - 2
      );

      let end = Math.min(
        totalPages,
        page + 2
      );

      if (page <= 3) {
        start = 1;

        end = Math.min(
          totalPages,
          5
        );
      }

      if (
        page >=
        totalPages - 2
      ) {
        start = Math.max(
          1,
          totalPages - 4
        );

        end = totalPages;
      }

      for (
        let i = start;
        i <= end;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }, [
      page,
      totalPages,
    ]);

  /* =======================================================
     FILTER COUNT
  ======================================================= */

  const activeFiltersCount =
    [search, city].filter(
      Boolean
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadSalons(true)
            }
            tintColor={COLORS.primary}
            colors={[
              COLORS.primary,
            ]}
          />
        }
      >
        {/* =================================================
            PAGE CONTAINER
        ================================================= */}

        <View
          style={[
            styles.pageContainer,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          {/* =================================================
              HERO
          ================================================= */}

          <View
            style={[
              styles.hero,

              isSmallMobile &&
                styles.heroSmall,

              isTablet &&
                styles.heroTablet,

              isLaptop &&
                styles.heroLaptop,
            ]}
          >
            <View
              pointerEvents="none"
              style={styles.heroGlowOne}
            />

            <View
              pointerEvents="none"
              style={styles.heroGlowTwo}
            />

            {!isMobile && (
              <>
                <View
                  pointerEvents="none"
                  style={
                    styles.heroRingOne
                  }
                />

                <View
                  pointerEvents="none"
                  style={
                    styles.heroRingTwo
                  }
                />
              </>
            )}

            <View style={styles.heroInner}>
              {/* LABEL */}

              <View style={styles.heroLabel}>
                <Ionicons
                  name="sparkles"
                  size={
                    isSmallMobile
                      ? 11
                      : 13
                  }
                  color="#F3C3D8"
                />

                <Text
                  style={[
                    styles.heroLabelText,
                    isSmallMobile &&
                      styles.heroLabelSmallText,
                  ]}
                  numberOfLines={1}
                >
                  DISCOVER LUMORA
                </Text>
              </View>

              {/* TITLE */}

              <Text
                style={[
                  styles.heroTitle,

                  isSmallMobile &&
                    styles.heroTitleSmall,

                  isTablet &&
                    styles.heroTitleTablet,

                  isLaptop &&
                    styles.heroTitleLaptop,
                ]}
              >
                Find your perfect
              </Text>

              <Text
                style={[
                  styles.heroTitleAccent,

                  isSmallMobile &&
                    styles.heroTitleAccentSmall,

                  isTablet &&
                    styles.heroTitleAccentTablet,

                  isLaptop &&
                    styles.heroTitleAccentLaptop,
                ]}
              >
                beauty destination.
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.heroDescription,

                  isSmallMobile &&
                    styles.heroDescriptionSmall,

                  isTablet &&
                    styles.heroDescriptionTablet,
                ]}
              >
                Discover active salons, explore their
                services and find a beauty experience
                that fits your time, style and place.
              </Text>

              {/* =================================================
                  SEARCH PANEL
              ================================================= */}

              <View
                style={[
                  styles.searchPanel,

                  isDesktop &&
                    styles.searchPanelDesktop,

                  isSmallMobile &&
                    styles.searchPanelSmall,
                ]}
              >
                {/* SALON SEARCH */}

                <View
                  style={[
                    styles.searchInputBox,

                    isDesktop &&
                      styles.searchInputDesktop,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={19}
                    color={COLORS.accent}
                  />

                  <TextInput
                    value={searchInput}
                    onChangeText={
                      setSearchInput
                    }
                    placeholder="Search salon by name..."
                    placeholderTextColor="#A293A5"
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={
                      handleSearch
                    }
                    autoCorrect={false}
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                  />

                  {searchInput ? (
                    <Pressable
                      onPress={() =>
                        setSearchInput("")
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color="#B5A5B6"
                      />
                    </Pressable>
                  ) : null}
                </View>

                {/* CITY SEARCH */}

                <View
                  style={[
                    styles.searchInputBox,

                    isDesktop &&
                      styles.searchInputDesktop,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={19}
                    color={COLORS.accent}
                  />

                  <TextInput
                    value={cityInput}
                    onChangeText={
                      setCityInput
                    }
                    placeholder="Search by city..."
                    placeholderTextColor="#A293A5"
                    style={styles.searchInput}
                    returnKeyType="search"
                    onSubmitEditing={
                      handleSearch
                    }
                    autoCorrect={false}
                    autoCapitalize="words"
                    underlineColorAndroid="transparent"
                  />
                </View>

                {/* SEARCH BUTTON */}

                <Pressable
                  onPress={handleSearch}
                  style={({ pressed }) => [
                    styles.searchButton,

                    isDesktop &&
                      styles.searchButtonDesktop,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={17}
                    color={COLORS.white}
                  />

                  <Text
                    style={
                      styles.searchButtonText
                    }
                    numberOfLines={1}
                  >
                    Search Salons
                  </Text>

                  {!isSmallMobile && (
                    <Ionicons
                      name="arrow-forward"
                      size={14}
                      color={COLORS.white}
                    />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* =================================================
              COLLECTION HEADER
          ================================================= */}

          <View
            style={[
              styles.collectionHeader,

              isDesktop &&
                styles.collectionHeaderDesktop,

              isSmallMobile &&
                styles.collectionHeaderSmall,
            ]}
          >
            <View
              style={styles.collectionText}
            >
              <View
                style={
                  styles.collectionEyebrowRow
                }
              >
                <View
                  style={
                    styles.collectionLine
                  }
                />

                <Text
                  style={
                    styles.collectionEyebrow
                  }
                  numberOfLines={1}
                >
                  SALON COLLECTION
                </Text>
              </View>

              <Text
                style={[
                  styles.collectionTitle,

                  isSmallMobile &&
                    styles.collectionTitleSmall,

                  isTablet &&
                    styles.collectionTitleTablet,
                ]}
              >
                Discover salons near your style
              </Text>

              <Text
                style={
                  styles.collectionDescription
                }
              >
                Explore LUMORA salons and choose a
                place that feels right for your next
                beauty experience.
              </Text>
            </View>

            {/* DESKTOP STATS */}

            {isDesktop && (
              <View
                style={
                  styles.desktopStats
                }
              >
                <View
                  style={
                    styles.statsCard
                  }
                >
                  <Text
                    style={
                      styles.statsLabel
                    }
                  >
                    AVAILABLE SALONS
                  </Text>

                  <Text
                    style={
                      styles.statsNumber
                    }
                  >
                    {loading
                      ? "—"
                      : formatCount(
                          total
                        )}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    loadSalons(true)
                  }
                  disabled={
                    refreshing
                  }
                  style={({ pressed }) => [
                    styles.refreshButton,

                    pressed &&
                      styles.buttonPressed,

                    refreshing &&
                      styles.disabledButton,
                  ]}
                >
                  {refreshing ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.primary
                      }
                    />
                  ) : (
                    <Ionicons
                      name="refresh-outline"
                      size={19}
                      color={
                        COLORS.primary
                      }
                    />
                  )}
                </Pressable>
              </View>
            )}
          </View>

          {/* =================================================
              MOBILE TOOLBAR
          ================================================= */}

          {!isDesktop && (
            <View
              style={[
                styles.mobileToolbar,

                isSmallMobile &&
                  styles.mobileToolbarSmall,
              ]}
            >
              <Pressable
                onPress={() =>
                  setShowFilters(true)
                }
                style={({ pressed }) => [
                  styles.filterToolbarButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Ionicons
                  name="options-outline"
                  size={17}
                  color={COLORS.primary}
                />

                <Text
                  style={
                    styles.filterToolbarText
                  }
                >
                  Filters
                </Text>

                {activeFiltersCount >
                0 ? (
                  <View
                    style={
                      styles.filterCount
                    }
                  >
                    <Text
                      style={
                        styles.filterCountText
                      }
                    >
                      {
                        activeFiltersCount
                      }
                    </Text>
                  </View>
                ) : null}
              </Pressable>

              <Pressable
                onPress={() =>
                  loadSalons(true)
                }
                disabled={
                  refreshing
                }
                style={({ pressed }) => [
                  styles.toolbarIconButton,

                  pressed &&
                    styles.buttonPressed,

                  refreshing &&
                    styles.disabledButton,
                ]}
              >
                {refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      COLORS.primary
                    }
                  />
                ) : (
                  <Ionicons
                    name="refresh-outline"
                    size={17}
                    color={
                      COLORS.primary
                    }
                  />
                )}
              </Pressable>

              <View
                style={
                  styles.resultCountBox
                }
              >
                <Text
                  style={
                    styles.resultCountText
                  }
                >
                  {loading
                    ? "..."
                    : formatCount(
                        total
                      )}
                </Text>
              </View>
            </View>
          )}

          {/* =================================================
              ACTIVE FILTERS
          ================================================= */}

          {activeFiltersCount > 0 && (
            <View
              style={
                styles.activeFilters
              }
            >
              <Text
                style={
                  styles.activeFiltersLabel
                }
              >
                ACTIVE:
              </Text>

              {search ? (
                <FilterChip
                  label="Search"
                  value={search}
                  onRemove={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                    scrollToTop();
                  }}
                />
              ) : null}

              {city ? (
                <FilterChip
                  label="City"
                  value={city}
                  onRemove={() => {
                    setCityInput("");
                    setCity("");
                    setPage(1);
                    scrollToTop();
                  }}
                />
              ) : null}

              <Pressable
                onPress={handleReset}
                hitSlop={8}
              >
                <Text
                  style={
                    styles.clearAllText
                  }
                >
                  Clear all
                </Text>
              </Pressable>
            </View>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && !loading ? (
            <View
              style={[
                styles.errorCard,

                isMobile &&
                  styles.errorCardMobile,
              ]}
            >
              <View
                style={
                  styles.errorIcon
                }
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={19}
                  color={COLORS.danger}
                />
              </View>

              <View
                style={
                  styles.errorTextContainer
                }
              >
                <Text
                  style={
                    styles.errorTitle
                  }
                >
                  Something went wrong
                </Text>

                <Text
                  style={
                    styles.errorMessage
                  }
                >
                  {error}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  loadSalons(true)
                }
                style={[
                  styles.retryButton,

                  isMobile &&
                    styles.retryButtonMobile,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={15}
                  color={
                    COLORS.danger
                  }
                />

                <Text
                  style={
                    styles.retryText
                  }
                >
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* =================================================
              LOADING / SALONS
          ================================================= */}

          {loading ? (
            <View
              style={
                styles.salonGrid
              }
            >
              {Array.from({
                length: isMobile
                  ? 3
                  : isTablet
                  ? 4
                  : 6,
              }).map(
                (_, index) => (
                  <SkeletonCard
                    key={index}
                    cardWidth={
                      cardWidth
                    }
                    isSmallMobile={
                      isSmallMobile
                    }
                    isTablet={
                      isTablet
                    }
                  />
                )
              )}
            </View>
          ) : salons.length === 0 ? (
            <EmptyState
              onReset={handleReset}
              isSmallMobile={
                isSmallMobile
              }
            />
          ) : (
            <>
              {/* =================================================
                  SALON GRID
              ================================================= */}

              <View
                style={
                  styles.salonGrid
                }
              >
                {salons.map(
                  (salon) => (
                    <SalonCard
                      key={
                        salon?._id
                      }
                      salon={salon}
                      cardWidth={
                        cardWidth
                      }
                      onView={
                        handleViewSalon
                      }
                      onBook={
                        handleBook
                      }
                      isSmallMobile={
                        isSmallMobile
                      }
                      isTablet={
                        isTablet
                      }
                    />
                  )
                )}
              </View>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages > 1 && (
                <View
                  style={[
                    styles.paginationContainer,

                    isMobile &&
                      styles.paginationContainerMobile,
                  ]}
                >
                  <View
                    style={
                      styles.paginationInfo
                    }
                  >
                    <Text
                      style={
                        styles.paginationInfoText
                      }
                    >
                      Showing{" "}
                      <Text
                        style={
                          styles.paginationBold
                        }
                      >
                        {(page - 1) *
                          limit +
                          1}
                      </Text>{" "}
                      –{" "}
                      <Text
                        style={
                          styles.paginationBold
                        }
                      >
                        {Math.min(
                          page * limit,
                          total
                        )}
                      </Text>{" "}
                      of{" "}
                      <Text
                        style={
                          styles.paginationBold
                        }
                      >
                        {total}
                      </Text>{" "}
                      salons
                    </Text>
                  </View>

                  <View
                    style={
                      styles.paginationControls
                    }
                  >
                    {/* PREVIOUS */}

                    <Pressable
                      disabled={
                        page === 1
                      }
                      onPress={() =>
                        changePage(
                          Math.max(
                            1,
                            page - 1
                          )
                        )
                      }
                      style={({ pressed }) => [
                        styles.paginationButton,

                        page === 1 &&
                          styles.paginationDisabled,

                        pressed &&
                          styles.buttonPressed,
                      ]}
                    >
                      <Ionicons
                        name="chevron-back"
                        size={15}
                        color={
                          COLORS.primary
                        }
                      />
                    </Pressable>

                    {/* PAGES */}

                    {paginationItems.map(
                      (
                        pageNumber
                      ) => (
                        <Pressable
                          key={
                            pageNumber
                          }
                          onPress={() =>
                            changePage(
                              pageNumber
                            )
                          }
                          style={({ pressed }) => [
                            styles.paginationNumber,

                            page ===
                              pageNumber &&
                              styles.paginationActive,

                            pressed &&
                              styles.buttonPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.paginationNumberText,

                              page ===
                                pageNumber &&
                                styles.paginationActiveText,
                            ]}
                          >
                            {
                              pageNumber
                            }
                          </Text>
                        </Pressable>
                      )
                    )}

                    {/* NEXT */}

                    <Pressable
                      disabled={
                        page ===
                        totalPages
                      }
                      onPress={() =>
                        changePage(
                          Math.min(
                            totalPages,
                            page + 1
                          )
                        )
                      }
                      style={({ pressed }) => [
                        styles.paginationButton,

                        page ===
                          totalPages &&
                          styles.paginationDisabled,

                        pressed &&
                          styles.buttonPressed,
                      ]}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={
                          COLORS.primary
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}

          {/* =================================================
              BOTTOM CTA
          ================================================= */}

          <View
            style={[
              styles.bottomCta,

              isSmallMobile &&
                styles.bottomCtaSmall,

              isTablet &&
                styles.bottomCtaTablet,
            ]}
          >
            <View
              pointerEvents="none"
              style={
                styles.ctaGlowOne
              }
            />

            <View
              pointerEvents="none"
              style={
                styles.ctaGlowTwo
              }
            />

            <View
              style={[
                styles.ctaContent,

                isDesktop &&
                  styles.ctaContentDesktop,
              ]}
            >
              <View
                style={
                  styles.ctaTextContainer
                }
              >
                <View
                  style={
                    styles.ctaEyebrowRow
                  }
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color="#EFC5D9"
                  />

                  <Text
                    style={
                      styles.ctaEyebrow
                    }
                    numberOfLines={1}
                  >
                    YOUR BEAUTY. YOUR TIME.
                  </Text>
                </View>

                <Text
                  style={
                    styles.ctaTitle
                  }
                >
                  Your next beauty experience
                  is closer than you think.
                </Text>

                <Text
                  style={
                    styles.ctaDescription
                  }
                >
                  Explore salons, compare your
                  options and discover the place
                  that feels right for you.
                </Text>
              </View>

              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.ctaButton,

                  isDesktop &&
                    styles.ctaButtonDesktop,

                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={
                    styles.ctaButtonText
                  }
                >
                  Explore Again
                </Text>

                <Ionicons
                  name="arrow-up"
                  size={15}
                  color={
                    COLORS.primary
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* =================================================
              FOOTER
          ================================================= */}

          <View
            style={styles.pageFooter}
          >
            <CustomerFooter />
          </View>
        </View>
      </ScrollView>

      {/* =====================================================
          FILTER MODAL
      ===================================================== */}

      <FilterModal
        visible={showFilters}
        searchInput={searchInput}
        cityInput={cityInput}
        setSearchInput={
          setSearchInput
        }
        setCityInput={
          setCityInput
        }
        onApply={handleSearch}
        onReset={handleReset}
        onClose={() =>
          setShowFilters(false)
        }
        isSmallMobile={
          isSmallMobile
        }
      />
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     ROOT
  ======================================================= */

  root: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    minWidth: 0,
    minHeight: 0,
  },

  scrollView: {
    flex: 1,
    minWidth: 0,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 14,
    paddingBottom: 0,
    alignItems: "stretch",
  },

  pageContainer: {
    alignSelf: "stretch",
    minWidth: 0,
    width: "100%",
    boxSizing: "border-box",
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    position: "relative",
    overflow: "hidden",

    width: "100%",
    minWidth: 0,

    minHeight: 455,

    borderRadius: 32,

    backgroundColor:
      COLORS.primaryDeep,

    marginBottom: 32,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 18,
    },

    shadowOpacity: 0.18,
    shadowRadius: 35,

    elevation: 7,
  },

  heroSmall: {
    minHeight: 470,
    borderRadius: 22,
    marginBottom: 24,
  },

  heroTablet: {
    minHeight: 430,
    borderRadius: 28,
    marginBottom: 28,
  },

  heroLaptop: {
    minHeight: 445,
  },

  heroInner: {
    position: "relative",
    zIndex: 5,

    width: "100%",
    minWidth: 0,

    paddingHorizontal: 24,
    paddingVertical: 32,

    alignItems: "flex-start",

    boxSizing: "border-box",
  },

  heroGlowOne: {
    position: "absolute",

    width: 300,
    height: 300,

    left: -120,
    top: -120,

    borderRadius: 150,

    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  heroGlowTwo: {
    position: "absolute",

    width: 360,
    height: 360,

    right: -150,
    bottom: -180,

    borderRadius: 180,

    backgroundColor:
      "rgba(231,168,198,0.10)",
  },

  heroRingOne: {
    position: "absolute",

    width: 145,
    height: 145,

    right: 60,
    top: 45,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.09)",

    borderRadius: 73,
  },

  heroRingTwo: {
    position: "absolute",

    width: 220,
    height: 220,

    right: 15,
    top: 5,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.045)",

    borderRadius: 110,
  },

  /* =======================================================
     HERO LABEL
  ======================================================= */

  heroLabel: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    paddingHorizontal: 13,
    paddingVertical: 9,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.14)",

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.08)",

    marginBottom: 20,

    maxWidth: "100%",
  },

  heroLabelText: {
    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.6,

    color:
      "rgba(255,255,255,0.88)",

    flexShrink: 1,
  },

  heroLabelSmallText: {
    fontSize: 8,
    letterSpacing: 1.1,
  },

  /* =======================================================
     HERO TITLE
  ======================================================= */

  heroTitle: {
    width: "100%",
    maxWidth: 900,

    fontSize: 45,
    lineHeight: 50,

    fontWeight: "900",

    letterSpacing: -1.8,

    color: COLORS.white,

    flexShrink: 1,
  },

  heroTitleSmall: {
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -1,
  },

  heroTitleTablet: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.4,
  },

  heroTitleLaptop: {
    fontSize: 43,
    lineHeight: 49,
  },

  heroTitleAccent: {
    width: "100%",
    maxWidth: 900,

    marginTop: 2,

    fontSize: 45,
    lineHeight: 50,

    fontWeight: "900",

    letterSpacing: -1.8,

    color: "#E7B8DA",

    flexShrink: 1,
  },

  heroTitleAccentSmall: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -1,
  },

  heroTitleAccentTablet: {
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.4,
  },

  heroTitleAccentLaptop: {
    fontSize: 43,
    lineHeight: 49,
  },

  heroDescription: {
    width: "100%",
    maxWidth: 720,

    marginTop: 16,

    fontSize: 14,
    lineHeight: 23,

    fontWeight: "500",

    color:
      "rgba(255,255,255,0.70)",

    flexShrink: 1,
  },

  heroDescriptionSmall: {
    fontSize: 12,
    lineHeight: 19,
    marginTop: 13,
  },

  heroDescriptionTablet: {
    maxWidth: 680,
    fontSize: 13,
    lineHeight: 21,
  },

  /* =======================================================
     SEARCH PANEL
  ======================================================= */

  searchPanel: {
    width: "100%",
    minWidth: 0,

    marginTop: 27,

    padding: 8,

    gap: 8,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.14)",

    borderRadius: 23,

    backgroundColor:
      "rgba(255,255,255,0.09)",

    boxSizing: "border-box",
  },

  searchPanelDesktop: {
    flexDirection: "row",
    alignItems: "center",
  },

  searchPanelSmall: {
    padding: 7,
    borderRadius: 19,
    gap: 7,
  },

  /* =======================================================
     SEARCH INPUT
  ======================================================= */

  searchInputBox: {
    width: "100%",
    minWidth: 0,

    minHeight: 53,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    paddingHorizontal: 14,

    borderRadius: 15,

    backgroundColor:
      COLORS.white,

    boxSizing: "border-box",
  },

  searchInputDesktop: {
    flex: 1,
    minHeight: 58,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,

    paddingVertical: 0,

    fontSize: 13,
    fontWeight: "600",

    color: COLORS.text,

    backgroundColor:
      "transparent",

    outlineStyle: "none",
    outlineWidth: 0,

    borderWidth: 0,

    boxSizing: "border-box",
  },

  searchButton: {
    width: "100%",
    minHeight: 53,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 18,

    borderRadius: 15,

    backgroundColor:
      COLORS.primaryDark,

    shadowColor:
      COLORS.primaryDark,

    shadowOffset: {
      width: 0,
      height: 9,
    },

    shadowOpacity: 0.24,
    shadowRadius: 18,

    elevation: 5,

    boxSizing: "border-box",
  },

  searchButtonDesktop: {
    width: 185,
    minHeight: 58,
    flexShrink: 0,
  },

  searchButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,

    flexShrink: 1,
  },

  /* =======================================================
     COLLECTION HEADER
  ======================================================= */

  collectionHeader: {
    width: "100%",
    minWidth: 0,

    marginBottom: 24,

    gap: 18,
  },

  collectionHeaderSmall: {
    marginBottom: 18,
    gap: 14,
  },

  collectionHeaderDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",

    gap: 28,
  },

  collectionText: {
    flex: 1,
    minWidth: 0,
  },

  collectionEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    marginBottom: 8,
  },

  collectionLine: {
    width: 27,
    height: 1,

    backgroundColor:
      COLORS.accent,

    flexShrink: 0,
  },

  collectionEyebrow: {
    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 1.8,

    color: COLORS.accent,

    flexShrink: 1,
  },

  collectionTitle: {
    width: "100%",
    maxWidth: 800,

    fontSize: 29,
    lineHeight: 35,

    fontWeight: "900",

    letterSpacing: -1,

    color: COLORS.text,

    flexShrink: 1,
  },

  collectionTitleSmall: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.7,
  },

  collectionTitleTablet: {
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: -0.9,
  },

  collectionDescription: {
    width: "100%",
    maxWidth: 650,

    marginTop: 7,

    fontSize: 13,
    lineHeight: 21,

    color: COLORS.textMuted,

    flexShrink: 1,
  },

  /* =======================================================
     DESKTOP STATS
  ======================================================= */

  desktopStats: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    flexShrink: 0,
  },

  statsCard: {
    minWidth: 145,

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 17,

    backgroundColor:
      COLORS.white,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.05,
    shadowRadius: 18,

    elevation: 2,
  },

  statsLabel: {
    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.2,

    color: COLORS.textLight,
  },

  statsNumber: {
    marginTop: 3,

    fontSize: 23,
    fontWeight: "900",

    color: COLORS.primary,
  },

  refreshButton: {
    width: 51,
    height: 51,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 17,

    backgroundColor:
      COLORS.white,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.05,
    shadowRadius: 18,

    elevation: 2,
  },

  /* =======================================================
     MOBILE TOOLBAR
  ======================================================= */

  mobileToolbar: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    marginBottom: 17,
  },

  mobileToolbarSmall: {
    gap: 6,
    marginBottom: 14,
  },

  filterToolbarButton: {
    flex: 1,
    minWidth: 0,

    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 10,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 13,

    backgroundColor:
      COLORS.white,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.04,
    shadowRadius: 13,

    elevation: 1,
  },

  filterToolbarText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.primary,
  },

  filterCount: {
    minWidth: 20,
    height: 20,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 5,

    borderRadius: 10,

    backgroundColor:
      COLORS.primary,
  },

  filterCountText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.white,
  },

  toolbarIconButton: {
    width: 45,
    height: 45,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 13,

    backgroundColor:
      COLORS.white,
  },

  resultCountBox: {
    minWidth: 48,
    height: 45,

    flexShrink: 0,

    paddingHorizontal: 11,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 13,

    backgroundColor:
      COLORS.white,
  },

  resultCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.textMuted,
  },

  /* =======================================================
     ACTIVE FILTERS
  ======================================================= */

  activeFilters: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",

    gap: 7,

    marginBottom: 19,
  },

  activeFiltersLabel: {
    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.2,

    color: COLORS.textLight,
  },

  filterChip: {
    maxWidth: "72%",

    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    paddingLeft: 10,
    paddingRight: 5,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor:
      "#F1E7F2",
  },

  filterChipText: {
    flexShrink: 1,

    fontSize: 9,
    fontWeight: "900",

    color: COLORS.primary,
  },

  filterChipClose: {
    width: 19,
    height: 19,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 10,

    backgroundColor:
      "#E5D5E6",
  },

  clearAllText: {
    marginLeft: 3,

    fontSize: 9,
    fontWeight: "900",

    color: COLORS.accent,

    textDecorationLine:
      "underline",
  },

  /* =======================================================
     GRID
  ======================================================= */

  salonGrid: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    flexWrap: "wrap",

    justifyContent: "flex-start",

    gap: 22,

    marginBottom: 32,
  },

  /* =======================================================
     SALON CARD
  ======================================================= */

  salonCard: {
    minWidth: 0,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 26,

    backgroundColor:
      COLORS.white,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.055,
    shadowRadius: 24,

    elevation: 3,

    boxSizing: "border-box",
  },

  /* =======================================================
     IMAGE
  ======================================================= */

  salonImageContainer: {
    position: "relative",

    width: "100%",
    height: 225,

    overflow: "hidden",

    backgroundColor:
      COLORS.primaryDeep,
  },

  salonImageContainerSmall: {
    height: 190,
  },

  salonImageContainerTablet: {
    height: 205,
  },

  salonImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor:
      COLORS.primaryDeep,
  },

  placeholderIcon: {
    width: 68,
    height: 68,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 9,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.20)",

    borderRadius: 21,

    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  placeholderBrand: {
    fontSize: 9,
    fontWeight: "900",

    letterSpacing: 3,

    color:
      "rgba(255,255,255,0.70)",
  },

  imageOverlay: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    backgroundColor:
      "rgba(0,0,0,0.18)",
  },

  imageShine: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,

    height: 80,

    backgroundColor:
      "rgba(255,255,255,0.06)",
  },

  /* =======================================================
     IMAGE BADGES
  ======================================================= */

  availableBadge: {
    position: "absolute",

    left: 13,
    top: 13,

    maxWidth: "70%",

    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 9,
    paddingVertical: 7,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.35)",

    borderRadius: 999,

    backgroundColor:
      "rgba(255,255,255,0.93)",
  },

  availableDot: {
    width: 15,
    height: 15,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 8,

    backgroundColor:
      COLORS.success,
  },

  availableText: {
    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 0.7,

    color: COLORS.primary,
  },

  cityBadge: {
    position: "absolute",

    left: 13,
    bottom: 13,

    maxWidth: "70%",

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  cityText: {
    flexShrink: 1,

    fontSize: 10,
    fontWeight: "700",

    color: COLORS.white,
  },

  photoCount: {
    position: "absolute",

    right: 13,
    bottom: 13,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderWidth: 1,

    borderColor:
      "rgba(255,255,255,0.15)",

    borderRadius: 999,

    backgroundColor:
      "rgba(0,0,0,0.35)",
  },

  photoCountText: {
    fontSize: 9,
    fontWeight: "800",

    color: COLORS.white,
  },

  /* =======================================================
     CARD CONTENT
  ======================================================= */

  salonContent: {
    width: "100%",
    minWidth: 0,

    padding: 16,

    boxSizing: "border-box",
  },

  nameSection: {
    width: "100%",
    minWidth: 0,

    marginBottom: 12,
  },

  salonName: {
    width: "100%",

    fontSize: 17,
    lineHeight: 22,

    fontWeight: "900",

    letterSpacing: -0.4,

    color: COLORS.text,
  },

  addressRow: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "flex-start",

    gap: 7,

    marginTop: 8,
  },

  addressText: {
    flex: 1,
    minWidth: 0,

    fontSize: 11,
    lineHeight: 17,

    color: COLORS.textMuted,
  },

  description: {
    width: "100%",

    minHeight: 54,

    marginBottom: 13,

    fontSize: 11,
    lineHeight: 18,

    color: COLORS.textMuted,
  },

  /* =======================================================
     CONTACT
  ======================================================= */

  contactGrid: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    flexWrap: "wrap",

    gap: 7,

    marginBottom: 15,
  },

  contactBox: {
    flex: 1,
    minWidth: 120,

    minHeight: 39,

    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    paddingHorizontal: 9,

    borderRadius: 11,

    backgroundColor:
      COLORS.softCard,

    boxSizing: "border-box",
  },

  contactIcon: {
    width: 25,
    height: 25,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 8,

    backgroundColor:
      COLORS.softPurple,
  },

  contactText: {
    flex: 1,
    minWidth: 0,

    fontSize: 9,
    fontWeight: "700",

    color: "#756778",
  },

  /* =======================================================
     ACTIONS
  ======================================================= */

  actionRow: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",

    gap: 8,

    marginTop: 4,
  },

  viewButton: {
    flex: 1,
    minWidth: 0,

    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    paddingHorizontal: 8,

    borderWidth: 1,

    borderColor: "#E4D5E4",

    borderRadius: 12,

    backgroundColor:
      COLORS.white,
  },

  viewButtonText: {
    fontSize: 10,
    fontWeight: "900",

    color: COLORS.primary,

    flexShrink: 1,
  },

  bookButton: {
    flex: 1,
    minWidth: 0,

    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 6,

    paddingHorizontal: 8,

    borderRadius: 12,

    backgroundColor:
      COLORS.primary,

    shadowColor:
      COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.20,
    shadowRadius: 14,

    elevation: 4,
  },

  bookButtonText: {
    fontSize: 10,
    fontWeight: "900",

    color: COLORS.white,

    flexShrink: 1,
  },

  buttonPressed: {
    opacity: 0.78,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  disabledButton: {
    opacity: 0.55,
  },

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  emptyCard: {
    position: "relative",
    overflow: "hidden",

    width: "100%",

    alignItems: "center",

    paddingHorizontal: 24,
    paddingVertical: 52,

    marginBottom: 30,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 26,

    backgroundColor:
      COLORS.white,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.045,
    shadowRadius: 25,

    elevation: 2,

    boxSizing: "border-box",
  },

  emptyCardSmall: {
    paddingHorizontal: 16,
    paddingVertical: 42,
  },

  emptyGlowOne: {
    position: "absolute",

    width: 180,
    height: 180,

    right: -70,
    top: -80,

    borderRadius: 90,

    backgroundColor: "#F3E4F3",
  },

  emptyGlowTwo: {
    position: "absolute",

    width: 160,
    height: 160,

    left: -70,
    bottom: -80,

    borderRadius: 80,

    backgroundColor: "#F7E8F2",
  },

  emptyIcon: {
    width: 78,
    height: 78,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 18,

    borderRadius: 25,

    backgroundColor:
      COLORS.softPurple,
  },

  emptyTitle: {
    width: "100%",

    textAlign: "center",

    fontSize: 22,
    lineHeight: 28,

    fontWeight: "900",

    color: COLORS.text,
  },

  emptyDescription: {
    width: "100%",
    maxWidth: 480,

    marginTop: 8,

    textAlign: "center",

    fontSize: 12,
    lineHeight: 20,

    color: COLORS.textMuted,
  },

  resetButton: {
    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    marginTop: 20,

    paddingHorizontal: 19,

    borderRadius: 12,

    backgroundColor:
      COLORS.primary,

    shadowColor:
      COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.18,
    shadowRadius: 16,

    elevation: 4,
  },

  resetButtonText: {
    fontSize: 11,
    fontWeight: "900",

    color: COLORS.white,
  },

  /* =======================================================
     SKELETON
  ======================================================= */

  skeletonCard: {
    overflow: "hidden",

    minWidth: 0,

    borderWidth: 1,
    borderColor: COLORS.border,

    borderRadius: 26,

    backgroundColor:
      COLORS.white,
  },

  skeletonImage: {
    width: "100%",
    height: 225,

    backgroundColor:
      "#EEE5EF",
  },

  skeletonImageSmall: {
    height: 190,
  },

  skeletonImageTablet: {
    height: 205,
  },

  skeletonContent: {
    padding: 16,
    gap: 11,
  },

  skeletonLineLarge: {
    width: "70%",
    height: 17,

    borderRadius: 7,

    backgroundColor:
      "#EEE5EF",
  },

  skeletonLineMedium: {
    width: "95%",
    height: 11,

    borderRadius: 6,

    backgroundColor:
      "#F2EBF3",
  },

  skeletonLineSmall: {
    width: "80%",
    height: 11,

    borderRadius: 6,

    backgroundColor:
      "#F2EBF3",
  },

  skeletonContactRow: {
    flexDirection: "row",
    gap: 7,
  },

  skeletonContact: {
    flex: 1,
    minWidth: 0,

    height: 39,

    borderRadius: 11,

    backgroundColor:
      "#F3EDF3",
  },

  skeletonButtons: {
    flexDirection: "row",

    gap: 8,

    marginTop: 2,
  },

  skeletonButton: {
    flex: 1,
    minWidth: 0,

    height: 45,

    borderRadius: 12,

    backgroundColor:
      "#F1EAF2",
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorCard: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    marginBottom: 20,

    padding: 13,

    borderWidth: 1,

    borderColor: "#F2D4D4",

    borderRadius: 17,

    backgroundColor:
      COLORS.dangerBg,
  },

  errorCardMobile: {
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  errorIcon: {
    width: 35,
    height: 35,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    backgroundColor:
      "#FFE3E3",
  },

  errorTextContainer: {
    flex: 1,
    minWidth: 180,
  },

  errorTitle: {
    fontSize: 11,
    fontWeight: "900",

    color: "#A73737",
  },

  errorMessage: {
    marginTop: 2,

    fontSize: 9,
    lineHeight: 15,

    color: COLORS.danger,
  },

  retryButton: {
    minHeight: 38,

    flexShrink: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,

    paddingHorizontal: 10,

    borderRadius: 10,

    backgroundColor:
      COLORS.white,
  },

  retryButtonMobile: {
    alignSelf: "center",
  },

  retryText: {
    fontSize: 9,
    fontWeight: "900",

    color: COLORS.danger,
  },

  /* =======================================================
     PAGINATION
  ======================================================= */

  paginationContainer: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    flexWrap: "wrap",

    gap: 15,

    paddingTop: 20,

    marginBottom: 28,

    borderTopWidth: 1,
    borderTopColor:
      COLORS.border,
  },

  paginationContainerMobile: {
    alignItems: "stretch",

    flexDirection: "column",

    gap: 12,
  },

  paginationInfo: {
    flex: 1,
    minWidth: 170,
  },

  paginationInfoText: {
    fontSize: 10,
    lineHeight: 17,

    color: COLORS.textMuted,
  },

  paginationBold: {
    fontWeight: "900",

    color: COLORS.primary,
  },

  paginationControls: {
    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    flexShrink: 0,
  },

  paginationButton: {
    width: 39,
    height: 39,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius: 11,

    backgroundColor:
      COLORS.white,
  },

  paginationNumber: {
    minWidth: 39,
    height: 39,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 8,

    borderRadius: 11,

    backgroundColor:
      COLORS.white,
  },

  paginationNumberText: {
    fontSize: 10,
    fontWeight: "900",

    color: "#6F5D70",
  },

  paginationActive: {
    backgroundColor:
      COLORS.primary,

    shadowColor:
      COLORS.primary,

    shadowOffset: {
      width: 0,
      height: 7,
    },

    shadowOpacity: 0.18,
    shadowRadius: 14,

    elevation: 4,
  },

  paginationActiveText: {
    color: COLORS.white,
  },

  paginationDisabled: {
    opacity: 0.3,
  },

  /* =======================================================
     BOTTOM CTA
  ======================================================= */

  bottomCta: {
    position: "relative",
    overflow: "hidden",

    width: "100%",
    minWidth: 0,

    minHeight: 245,

    marginTop: 0,
    marginBottom: 28,

    padding: 24,

    borderRadius: 26,

    backgroundColor:
      COLORS.primaryDark,

    shadowColor:
      COLORS.primaryDeep,

    shadowOffset: {
      width: 0,
      height: 20,
    },

    shadowOpacity: 0.17,
    shadowRadius: 32,

    elevation: 6,

    boxSizing: "border-box",
  },

  bottomCtaSmall: {
    minHeight: 285,

    padding: 18,

    marginBottom: 22,

    borderRadius: 22,
  },

  bottomCtaTablet: {
    minHeight: 225,
  },

  ctaGlowOne: {
    position: "absolute",

    width: 230,
    height: 230,

    right: -90,
    top: -100,

    borderRadius: 115,

    backgroundColor:
      "rgba(255,255,255,0.07)",
  },

  ctaGlowTwo: {
    position: "absolute",

    width: 190,
    height: 190,

    left: -80,
    bottom: -100,

    borderRadius: 95,

    backgroundColor:
      "rgba(239,184,211,0.08)",
  },

  ctaContent: {
    position: "relative",
    zIndex: 5,

    width: "100%",
    minWidth: 0,

    flexDirection: "column",

    gap: 22,
  },

  ctaContentDesktop: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    gap: 35,
  },

  /*
   * IMPORTANT:
   * No width: 0 here.
   * This fixes the mobile one-letter-per-line problem.
   */

  ctaTextContainer: {
    flex: 1,
    minWidth: 0,

    width: "100%",
  },

  ctaEyebrowRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    marginBottom: 10,

    maxWidth: "100%",
  },

  ctaEyebrow: {
    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.2,

    color: "#EFC5D9",

    flexShrink: 1,
  },

  ctaTitle: {
    width: "100%",
    maxWidth: 760,

    fontSize: 24,
    lineHeight: 30,

    fontWeight: "900",

    letterSpacing: -0.7,

    color: COLORS.white,

    flexShrink: 1,
  },

  ctaDescription: {
    width: "100%",
    maxWidth: 620,

    marginTop: 9,

    fontSize: 11,
    lineHeight: 18,

    color:
      "rgba(255,255,255,0.65)",

    flexShrink: 1,
  },

  ctaButton: {
    width: "100%",
    minHeight: 47,

    alignSelf: "stretch",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 18,

    borderRadius: 12,

    backgroundColor:
      COLORS.white,
  },

  ctaButtonDesktop: {
    width: 175,
    minHeight: 52,

    flexShrink: 0,

    alignSelf: "center",
  },

  ctaButtonText: {
    fontSize: 11,
    fontWeight: "900",

    color: COLORS.primary,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  pageFooter: {
    width: "100%",
    minWidth: 0,

    marginTop: 0,
    marginBottom: 0,
  },

  /* =======================================================
     FILTER MODAL
  ======================================================= */

  modalRoot: {
    flex: 1,

    justifyContent: "flex-end",

    width: "100%",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor:
      "rgba(20,8,24,0.55)",
  },

  filterSheet: {
    width: "100%",

    maxWidth: 720,

    alignSelf: "center",

    paddingHorizontal: 18,
    paddingTop: 10,

    paddingBottom:
      Platform.OS === "ios"
        ? 30
        : 18,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor:
      COLORS.white,

    shadowColor: "#000000",

    shadowOffset: {
      width: 0,
      height: -10,
    },

    shadowOpacity: 0.15,
    shadowRadius: 30,

    elevation: 15,

    boxSizing: "border-box",
  },

  filterSheetSmall: {
    paddingHorizontal: 14,
    paddingBottom: 16,

    borderTopLeftRadius: 23,
    borderTopRightRadius: 23,
  },

  sheetHandle: {
    alignSelf: "center",

    width: 42,
    height: 4,

    marginBottom: 17,

    borderRadius: 999,

    backgroundColor:
      "#DCCDDD",
  },

  sheetHeader: {
    flexDirection: "row",

    alignItems: "center",
    justifyContent: "space-between",

    gap: 15,

    marginBottom: 18,
  },

  sheetHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sheetEyebrow: {
    fontSize: 8,
    fontWeight: "900",

    letterSpacing: 1.5,

    color: COLORS.accent,
  },

  sheetTitle: {
    marginTop: 4,

    fontSize: 21,

    fontWeight: "900",

    letterSpacing: -0.5,

    color: COLORS.text,
  },

  closeButton: {
    width: 40,
    height: 40,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,

    backgroundColor:
      COLORS.softPurple,
  },

  /* =======================================================
     MODAL INPUT
  ======================================================= */

  modalInputWrapper: {
    width: "100%",
    minWidth: 0,

    minHeight: 53,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    paddingHorizontal: 14,

    marginBottom: 10,

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius: 14,

    backgroundColor:
      COLORS.background,

    boxSizing: "border-box",
  },

  modalInput: {
    flex: 1,
    minWidth: 0,

    paddingVertical: 0,

    fontSize: 13,
    fontWeight: "600",

    color: COLORS.text,

    backgroundColor:
      "transparent",

    outlineStyle: "none",
    outlineWidth: 0,

    borderWidth: 0,

    boxSizing: "border-box",
  },

  /* =======================================================
     MODAL ACTIONS
  ======================================================= */

  modalActions: {
    flexDirection: "row",

    gap: 9,

    marginTop: 8,
  },

  modalResetButton: {
    flex: 0.75,
    minWidth: 0,

    minHeight: 49,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    borderColor:
      COLORS.border,

    borderRadius: 13,

    backgroundColor:
      COLORS.white,
  },

  modalResetText: {
    fontSize: 11,
    fontWeight: "900",

    color: COLORS.primary,
  },

  modalApplyButton: {
    flex: 1.4,
    minWidth: 0,

    minHeight: 49,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 7,

    borderRadius: 13,

    backgroundColor:
      COLORS.primary,
  },

  modalApplyText: {
    fontSize: 11,
    fontWeight: "900",

    color: COLORS.white,
  },
});

export default SalonDiscovery;