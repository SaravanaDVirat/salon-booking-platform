import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  KeyboardAvoidingView,
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

import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { getCustomerSalonServices } from "../../../../../../services/customerSalonService";
import CustomerFooter from "../../../../../../components/customers/CustomerFooter";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#FBF8FB",
  white: "#FFFFFF",

  primary: "#8D4F83",
  primaryDark: "#713E68",
  primaryDeep: "#62345B",
  primarySoft: "#F3E8F2",

  text: "#291F2A",
  textDark: "#241C25",
  textMuted: "#7D717D",
  textLight: "#A097A1",

  border: "#EAE1EA",
  borderLight: "#F0E9F0",

  card: "#FFFFFF",
  soft: "#F8F3F8",

  success: "#22C55E",
  successSoft: "#EAF9EF",

  danger: "#DC2626",
  dangerSoft: "#FEF2F2",

  shadow: "#5A3B55",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeParam = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const formatPrice = (price) => {
  const numericPrice = Number(price || 0);

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const getServiceIconName = (categoryName = "") => {
  const category = String(categoryName).toLowerCase();

  if (category.includes("spa")) {
    return "flower-outline";
  }

  if (
    category.includes("hair") ||
    category.includes("nail") ||
    category.includes("barber")
  ) {
    return "cut-outline";
  }

  if (
    category.includes("facial") ||
    category.includes("skin") ||
    category.includes("beauty")
  ) {
    return "sparkles-outline";
  }

  return "star-outline";
};

/* =========================================================
   COMPONENT
========================================================= */

const SalonServices = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const salonId = normalizeParam(params?.salonId);

  const { width } = useWindowDimensions();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [selectedService, setSelectedService] =
    useState(null);

  /* =========================================================
     RESPONSIVE BREAKPOINTS
  ========================================================= */

  const isTinyMobile = width < 360;

  const isSmallMobile =
    width >= 360 && width < 430;

  const isMobile = width < 700;

  const isTablet =
    width >= 700 && width < 1050;

  const isDesktop = width >= 1050;

  const isLargeDesktop = width >= 1440;

  /* =========================================================
     RESPONSIVE CONTAINER
  ========================================================= */

  const horizontalPadding = useMemo(() => {
    if (isLargeDesktop) return 48;
    if (isDesktop) return 36;
    if (isTablet) return 26;
    if (isSmallMobile) return 18;
    if (isTinyMobile) return 14;

    return 16;
  }, [
    isLargeDesktop,
    isDesktop,
    isTablet,
    isSmallMobile,
    isTinyMobile,
  ]);

  const maxContentWidth = 1480;

  const containerWidth = useMemo(() => {
    const available = Math.max(
      width - horizontalPadding * 2,
      0
    );

    return Math.min(
      available,
      maxContentWidth
    );
  }, [
    width,
    horizontalPadding,
  ]);

  /* =========================================================
     GRID
  ========================================================= */

  const columns = useMemo(() => {
    if (width >= 1280) {
      return 3;
    }

    if (width >= 720) {
      return 2;
    }

    return 1;
  }, [width]);

  const gridGap = useMemo(() => {
    if (width >= 1280) return 22;
    if (width >= 720) return 18;

    return 14;
  }, [width]);

  const cardWidth = useMemo(() => {
    if (columns === 1) {
      return containerWidth;
    }

    return Math.max(
      0,
      (containerWidth -
        gridGap * (columns - 1)) /
        columns
    );
  }, [
    columns,
    containerWidth,
    gridGap,
  ]);

  /* =========================================================
     LOAD SERVICES
  ========================================================= */

  const loadServices = useCallback(
    async (isRefresh = false) => {
      if (!salonId) {
        setLoading(false);
        setError(
          "Salon information is missing."
        );
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response =
          await getCustomerSalonServices(
            salonId
          );

        setServices(
          Array.isArray(response?.services)
            ? response.services
            : []
        );
      } catch (err) {
        console.error(
          "Salon Services Error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load salon services"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [salonId]
  );

  useEffect(() => {
    loadServices(false);
  }, [loadServices]);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const names = services
      .map(
        (service) =>
          service?.category?.name
      )
      .filter(
        (name) =>
          typeof name === "string" &&
          name.trim().length > 0
      );

    const uniqueNames = [
      ...new Set(names),
    ];

    return ["ALL", ...uniqueNames];
  }, [services]);

  /* =========================================================
     FILTER SERVICES
  ========================================================= */

  const filteredServices = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const name =
        service?.name?.toLowerCase() || "";

      const description =
        service?.description?.toLowerCase() ||
        "";

      const category =
        service?.category?.name?.toLowerCase() ||
        "";

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        description.includes(keyword) ||
        category.includes(keyword);

      const matchesCategory =
        selectedCategory === "ALL" ||
        service?.category?.name ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    services,
    search,
    selectedCategory,
  ]);

  /* =========================================================
     SERVICE SELECT
  ========================================================= */

  const handleSelectService =
    useCallback((service) => {
      setSelectedService(service);
    }, []);

  const handleClearSelection =
    useCallback(() => {
      setSelectedService(null);
    }, []);

  /* =========================================================
     CONTINUE
  ========================================================= */

  const handleContinue = useCallback(() => {
    if (
      !selectedService?._id ||
      !salonId
    ) {
      return;
    }

    router.push(
      `/customer/salons/${salonId}/services/${selectedService._id}/staff`
    );
  }, [
    router,
    salonId,
    selectedService,
  ]);

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedCategory("ALL");
  }, []);

  /* =========================================================
     HERO
  ========================================================= */

  const renderHero = () => {
    const heroTitleSize = (() => {
      if (isTinyMobile) return 32;
      if (isSmallMobile) return 36;
      if (isMobile) return 40;
      if (isTablet) return 46;
      if (width < 1280) return 54;

      return 62;
    })();

    return (
      <LinearGradient
        colors={[
          "#FFF9FD",
          "#FBF5FB",
          "#F3E9F3",
        ]}
        start={{
          x: 0,
          y: 0,
        }}
        end={{
          x: 1,
          y: 1,
        }}
        style={styles.heroSection}
      >
        {/* DECORATIVE BACKGROUND */}

        <View
          pointerEvents="none"
          style={[
            styles.heroGlowRight,
            {
              width: isMobile ? 190 : 340,
              height: isMobile ? 190 : 340,
            },
          ]}
        />

        <View
          pointerEvents="none"
          style={[
            styles.heroGlowLeft,
            {
              width: isMobile ? 210 : 360,
              height: isMobile ? 210 : 360,
            },
          ]}
        />

        <View
          style={[
            styles.container,
            {
              width: containerWidth,
            },
          ]}
        >
          {/* BACK BUTTON */}

          <View style={styles.backButtonWrapper}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={
                  isTinyMobile ? 15 : 17
                }
                color="#625462"
              />

              <Text
                style={styles.backButtonText}
                numberOfLines={1}
              >
                Back to salons
              </Text>
            </Pressable>
          </View>

          {/* HERO CONTENT */}

          <View
            style={[
              styles.heroContent,
              isMobile &&
                styles.heroContentMobile,
            ]}
          >
            {/* LEFT CONTENT */}

            <View
              style={[
                styles.heroLeft,
                isMobile &&
                  styles.heroLeftMobile,
              ]}
            >
              {/* BADGE */}

              <View
                style={styles.heroBadge}
              >
                <Ionicons
                  name="cut-outline"
                  size={
                    isTinyMobile ? 12 : 14
                  }
                  color={COLORS.primary}
                />

                <Text
                  style={styles.heroBadgeText}
                  numberOfLines={1}
                >
                  Beauty Services
                </Text>
              </View>

              {/* TITLE */}

              <Text
                style={[
                  styles.heroTitle,
                  {
                    fontSize:
                      heroTitleSize,
                    lineHeight:
                      heroTitleSize * 1.03,
                  },
                ]}
              >
                Choose your
              </Text>

              <Text
                style={[
                  styles.heroTitleAccent,
                  {
                    fontSize:
                      heroTitleSize,
                    lineHeight:
                      heroTitleSize * 1.03,
                  },
                ]}
              >
                perfect treatment.
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.heroDescription,
                  {
                    fontSize:
                      isTinyMobile ? 12 : 14,
                    lineHeight:
                      isTinyMobile ? 19 : 22,
                  },
                ]}
              >
                Explore premium beauty
                services available at this
                salon. Pick the treatment
                that fits your style and
                continue to choose your
                preferred stylist.
              </Text>

              {/* STATS */}

              <View
                style={styles.heroStats}
              >
                <View
                  style={styles.heroStatPill}
                >
                  <View
                    style={styles.activeDot}
                  />

                  <Text
                    style={styles.heroStatText}
                    numberOfLines={1}
                  >
                    Active services
                  </Text>
                </View>

                <View
                  style={styles.heroStatPill}
                >
                  <Ionicons
                    name="flash-outline"
                    size={13}
                    color={COLORS.primary}
                  />

                  <Text
                    style={styles.heroStatText}
                    numberOfLines={1}
                  >
                    Easy booking
                  </Text>
                </View>
              </View>
            </View>

            {/* SUMMARY */}

            <View
              style={[
                styles.summaryCard,
                {
                  width: isMobile
                    ? "100%"
                    : isTablet
                    ? 310
                    : 360,
                },
              ]}
            >
              <View
                style={styles.summaryTop}
              >
                <View
                  style={styles.summaryTextArea}
                >
                  <Text
                    style={styles.summaryLabel}
                    numberOfLines={2}
                  >
                    Available Services
                  </Text>

                  <Text
                    style={styles.summaryCount}
                  >
                    {services.length}
                  </Text>
                </View>

                <View
                  style={styles.summaryIcon}
                >
                  <Ionicons
                    name="bag-handle-outline"
                    size={
                      isTinyMobile ? 22 : 25
                    }
                    color={COLORS.primary}
                  />
                </View>
              </View>

              <View
                style={styles.summaryStatus}
              >
                <View
                  style={
                    styles.summaryStatusDot
                  }
                />

                <Text
                  style={
                    styles.summaryStatusText
                  }
                  numberOfLines={2}
                >
                  Active services only
                </Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    );
  };

  /* =========================================================
     FILTERS
  ========================================================= */

  const renderFilters = () => {
    return (
      <View
        style={[
          styles.filterCard,
          {
            width: containerWidth,
          },
        ]}
      >
        {/* SEARCH */}

        <View
          style={[
            styles.searchContainer,
            searchFocused &&
              styles.searchContainerFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={
              searchFocused
                ? COLORS.primary
                : "#A79BA7"
            }
            style={styles.searchIcon}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search hair, spa, nails, facial..."
            placeholderTextColor="#AAA0AA"
            style={[
              styles.searchInput,
              {
                fontSize:
                  isTinyMobile ? 12 : 14,
              },
            ]}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            onFocus={() =>
              setSearchFocused(true)
            }
            onBlur={() =>
              setSearchFocused(false)
            }
            clearButtonMode={
              Platform.OS === "ios"
                ? "while-editing"
                : "never"
            }
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              hitSlop={10}
              style={styles.searchClear}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color="#B0A6B0"
              />
            </Pressable>
          )}
        </View>

        {/* CATEGORY LIST */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={[
            styles.categoryScrollContent,
            {
              paddingRight:
                isMobile ? 4 : 0,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {categories.map((category) => {
            const active =
              selectedCategory ===
              category;

            return (
              <Pressable
                key={category}
                onPress={() =>
                  setSelectedCategory(
                    category
                  )
                }
                style={({ pressed }) => [
                  styles.categoryChip,
                  active &&
                    styles.categoryChipActive,
                  pressed &&
                    styles.categoryChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    active &&
                      styles.categoryChipTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {category === "ALL"
                    ? "All Services"
                    : category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  /* =========================================================
     RESULT HEADER
  ========================================================= */

  const renderResultHeader = () => {
    if (loading || error) {
      return null;
    }

    return (
      <View
        style={[
          styles.resultHeader,
          {
            width: containerWidth,
          },
        ]}
      >
        <View
          style={styles.resultHeadingArea}
        >
          <Text
            style={styles.resultEyebrow}
            numberOfLines={1}
          >
            Explore treatments
          </Text>

          <Text
            style={[
              styles.resultTitle,
              isMobile &&
                styles.resultTitleMobile,
            ]}
            numberOfLines={
              isMobile ? 2 : 1
            }
          >
            Find your perfect service
          </Text>
        </View>

        <View
          style={styles.resultCountPill}
        >
          <Text
            style={styles.resultCountText}
            numberOfLines={1}
          >
            {filteredServices.length}{" "}
            {filteredServices.length === 1
              ? "service"
              : "services"}
          </Text>
        </View>
      </View>
    );
  };

  /* =========================================================
     SKELETON CARD
  ========================================================= */

  const SkeletonCard = ({
    index,
  }) => {
    const heroHeight = isMobile
      ? 132
      : 150;

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
            styles.skeletonHero,
            {
              height: heroHeight,
            },
          ]}
        >
          <View
            style={styles.skeletonIcon}
          />

          <View
            style={styles.skeletonBadge}
          />
        </View>

        <View
          style={[
            styles.skeletonContent,
            {
              padding: isMobile ? 16 : 20,
            },
          ]}
        >
          <View
            style={[
              styles.skeletonLine,
              {
                width:
                  index % 2 === 0
                    ? "72%"
                    : "62%",
              },
            ]}
          />

          <View
            style={[
              styles.skeletonLineSmall,
              {
                width: "95%",
              },
            ]}
          />

          <View
            style={[
              styles.skeletonLineSmall,
              {
                width: "78%",
              },
            ]}
          />

          <View
            style={styles.skeletonMeta}
          >
            <View
              style={
                styles.skeletonMetaIcon
              }
            />

            <View
              style={
                styles.skeletonMetaText
              }
            />
          </View>

          <View
            style={styles.skeletonButton}
          />
        </View>
      </View>
    );
  };

  /* =========================================================
     SERVICE CARD
  ========================================================= */

  const ServiceCard = ({
    service,
  }) => {
    const isSelected =
      selectedService?._id ===
      service?._id;

    const categoryName =
      service?.category?.name ||
      "Beauty Service";

    const iconName =
      getServiceIconName(categoryName);

    const heroHeight = isMobile
      ? 132
      : isTablet
      ? 142
      : 150;

    return (
      <Pressable
        onPress={() =>
          handleSelectService(service)
        }
        style={({ pressed }) => [
          styles.serviceCard,
          {
            width: cardWidth,
          },
          isSelected &&
            styles.serviceCardSelected,
          pressed &&
            styles.serviceCardPressed,
        ]}
      >
        {/* CARD HERO */}

        <LinearGradient
          colors={[
            "#704069",
            "#8D4F83",
            "#CBA5C4",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={[
            styles.serviceHero,
            {
              height: heroHeight,
            },
          ]}
        >
          {/* DECORATIVE CIRCLES */}

          <View
            pointerEvents="none"
            style={[
              styles.heroCircleLarge,
              {
                width: isMobile
                  ? 155
                  : 190,
                height: isMobile
                  ? 155
                  : 190,
                right: isMobile
                  ? -55
                  : -45,
                top: isMobile
                  ? -50
                  : -48,
              },
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.heroCircleBottom,
              {
                width: isMobile
                  ? 145
                  : 175,
                height: isMobile
                  ? 145
                  : 175,
                left: isMobile
                  ? -45
                  : -38,
                bottom: isMobile
                  ? -55
                  : -55,
              },
            ]}
          />

          {/* ICON */}

          <View
            style={[
              styles.serviceIconBox,
              {
                width: isMobile
                  ? 44
                  : 48,
                height: isMobile
                  ? 44
                  : 48,
              },
            ]}
          >
            <Ionicons
              name={iconName}
              size={
                isMobile ? 20 : 23
              }
              color="#FFFFFF"
            />
          </View>

          {/* AVAILABLE */}

          <View
            style={[
              styles.availableBadge,
              {
                right: isMobile ? 14 : 17,
                top: isMobile ? 14 : 18,
              },
            ]}
          >
            <View
              style={styles.availableDot}
            />

            <Text
              style={styles.availableText}
              numberOfLines={1}
            >
              Available
            </Text>
          </View>

          {/* CATEGORY */}

          <View
            style={[
              styles.categoryPosition,
              {
                left: isMobile ? 15 : 18,
                right: isMobile ? 15 : 18,
                bottom: isMobile ? 15 : 18,
              },
            ]}
          >
            <Text
              style={styles.categoryLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {categoryName}
            </Text>
          </View>
        </LinearGradient>

        {/* CARD CONTENT */}

        <View
          style={[
            styles.serviceContent,
            {
              padding: isTinyMobile
                ? 14
                : isMobile
                ? 16
                : 20,
            },
          ]}
        >
          {/* TITLE */}

          <View
            style={styles.titleRow}
          >
            <Text
              style={[
                styles.serviceTitle,
                {
                  fontSize: isTinyMobile
                    ? 15
                    : isMobile
                    ? 17
                    : 18,
                  lineHeight: isTinyMobile
                    ? 20
                    : isMobile
                    ? 22
                    : 23,
                },
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {service?.name ||
                "Beauty Service"}
            </Text>

            {isSelected && (
              <View
                style={
                  styles.selectedCheck
                }
              >
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            )}
          </View>

          {/* DESCRIPTION */}

          <Text
            style={[
              styles.serviceDescription,
              {
                minHeight: isMobile
                  ? 63
                  : 66,
              },
            ]}
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {service?.description ||
              "Premium beauty treatment tailored to your needs."}
          </Text>

          {/* DIVIDER */}

          <View
            style={styles.divider}
          />

          {/* META */}

          <View
            style={[
              styles.metaRow,
              isTinyMobile &&
                styles.metaRowTiny,
            ]}
          >
            {/* DURATION */}

            <View
              style={styles.durationBlock}
            >
              <View
                style={
                  styles.metaIconBox
                }
              >
                <Ionicons
                  name="time-outline"
                  size={16}
                  color={COLORS.primary}
                />
              </View>

              <View
                style={
                  styles.metaTextBlock
                }
              >
                <Text
                  style={styles.metaLabel}
                  numberOfLines={1}
                >
                  Duration
                </Text>

                <Text
                  style={styles.metaValue}
                  numberOfLines={1}
                >
                  {service?.duration ||
                    0}{" "}
                  min
                </Text>
              </View>
            </View>

            {/* PRICE */}

            <View
              style={[
                styles.priceBlock,
                isTinyMobile &&
                  styles.priceBlockTiny,
              ]}
            >
              <Text
                style={styles.metaLabel}
                numberOfLines={1}
              >
                Starting at
              </Text>

              <Text
                style={[
                  styles.priceValue,
                  {
                    fontSize: isTinyMobile
                      ? 16
                      : 19,
                  },
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {formatPrice(
                  service?.price
                )}
              </Text>
            </View>
          </View>

          {/* SELECT BUTTON */}

          <Pressable
            onPress={() =>
              handleSelectService(
                service
              )
            }
            style={({ pressed }) => [
              styles.selectButton,
              isSelected &&
                styles.selectButtonSelected,
              pressed &&
                styles.selectButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.selectButtonText,
                isSelected &&
                  styles.selectButtonTextSelected,
              ]}
              numberOfLines={1}
            >
              {isSelected
                ? "Selected"
                : "Select Service"}
            </Text>

            <Ionicons
              name={
                isSelected
                  ? "checkmark-circle"
                  : "chevron-forward"
              }
              size={
                isTinyMobile ? 16 : 18
              }
              color={
                isSelected
                  ? "#FFFFFF"
                  : COLORS.primaryDark
              }
            />
          </Pressable>
        </View>

        {/* SELECTED LINE */}

        {isSelected && (
          <LinearGradient
            colors={[
              "#8D4F83",
              "#C28ABA",
              "#8D4F83",
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 0,
            }}
            style={
              styles.selectedBottomLine
            }
          />
        )}
      </Pressable>
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  const renderLoading = () => {
    const skeletonCount =
      columns === 3
        ? 6
        : columns === 2
        ? 4
        : 3;

    return (
      <View
        style={[
          styles.grid,
          {
            width: containerWidth,
            columnGap: gridGap,
            rowGap: gridGap,
          },
        ]}
      >
        {Array.from({
          length: skeletonCount,
        }).map((_, index) => (
          <SkeletonCard
            key={`skeleton-${index}`}
            index={index}
          />
        ))}
      </View>
    );
  };

  /* =========================================================
     ERROR
  ========================================================= */

  const renderError = () => {
    if (!error || loading) {
      return null;
    }

    return (
      <View
        style={[
          styles.stateCard,
          {
            width: containerWidth,
          },
        ]}
      >
        <View
          style={styles.errorIcon}
        >
          <Ionicons
            name="alert-outline"
            size={26}
            color={COLORS.danger}
          />
        </View>

        <Text
          style={styles.stateTitle}
        >
          Unable to load services
        </Text>

        <Text
          style={styles.stateDescription}
        >
          {error}
        </Text>

        <Pressable
          onPress={() =>
            loadServices(false)
          }
          style={({ pressed }) => [
            styles.retryButton,
            pressed &&
              styles.retryButtonPressed,
          ]}
        >
          <Ionicons
            name="refresh-outline"
            size={17}
            color="#FFFFFF"
          />

          <Text
            style={styles.retryButtonText}
          >
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  };

  /* =========================================================
     EMPTY
  ========================================================= */

  const renderEmpty = () => {
    if (
      loading ||
      error ||
      filteredServices.length > 0
    ) {
      return null;
    }

    return (
      <View
        style={[
          styles.emptyCard,
          {
            width: containerWidth,
          },
        ]}
      >
        <View
          style={styles.emptyIcon}
        >
          <Ionicons
            name="search-outline"
            size={27}
            color={COLORS.primary}
          />
        </View>

        <Text
          style={styles.stateTitle}
        >
          No services found
        </Text>

        <Text
          style={styles.stateDescription}
        >
          Try another service name or
          select a different category.
        </Text>

        <Pressable
          onPress={clearFilters}
          style={({ pressed }) => [
            styles.clearFilterButton,
            pressed &&
              styles.clearFilterPressed,
          ]}
        >
          <Text
            style={styles.clearFilterText}
          >
            Clear Filters
          </Text>

          <Ionicons
            name="refresh-outline"
            size={17}
            color="#FFFFFF"
          />
        </Pressable>
      </View>
    );
  };

  /* =========================================================
     SERVICES
  ========================================================= */

  const renderServices = () => {
    if (
      loading ||
      error ||
      filteredServices.length === 0
    ) {
      return null;
    }

    return (
      <View
        style={[
          styles.grid,
          {
            width: containerWidth,
            columnGap: gridGap,
            rowGap: gridGap,
          },
        ]}
      >
        {filteredServices.map(
          (service) => (
            <ServiceCard
              key={service?._id}
              service={service}
            />
          )
        )}
      </View>
    );
  };

  /* =========================================================
     BOOKING BAR
  ========================================================= */

  const renderBookingBar = () => {
    if (!selectedService) {
      return null;
    }

    return (
      <View
        style={[
          styles.bookingBarWrapper,
          {
            paddingHorizontal:
              isTinyMobile
                ? 8
                : isMobile
                ? 12
                : 16,
          },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.bookingBar,
            {
              maxWidth:
                maxContentWidth,
            },
            isMobile &&
              styles.bookingBarMobile,
          ]}
        >
          {/* SELECTED INFO */}

          <View
            style={[
              styles.bookingInfo,
              isMobile &&
                styles.bookingInfoMobile,
            ]}
          >
            <View
              style={
                styles.bookingIcon
              }
            >
              <Ionicons
                name="checkmark"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View
              style={
                styles.bookingTextArea
              }
            >
              <Text
                style={
                  styles.bookingLabel
                }
                numberOfLines={1}
              >
                Selected service
              </Text>

              <View
                style={[
                  styles.bookingNameRow,
                  isMobile &&
                    styles.bookingNameRowMobile,
                ]}
              >
                <Text
                  style={
                    styles.bookingServiceName
                  }
                  numberOfLines={
                    isMobile ? 1 : 2
                  }
                  ellipsizeMode="tail"
                >
                  {selectedService?.name ||
                    "Selected service"}
                </Text>

                <View
                  style={
                    styles.bookingDotSeparator
                  }
                />

                <Text
                  style={
                    styles.bookingPrice
                  }
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {formatPrice(
                    selectedService?.price
                  )}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={
                handleClearSelection
              }
              hitSlop={10}
              style={
                styles.clearSelection
              }
            >
              <Ionicons
                name="close"
                size={18}
                color="#8F838F"
              />
            </Pressable>
          </View>

          {/* CONTINUE */}

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              isMobile &&
                styles.continueButtonMobile,
              pressed &&
                styles.continueButtonPressed,
            ]}
          >
            <Text
              style={
                styles.continueButtonText
              }
              numberOfLines={1}
            >
              {isMobile
                ? "Continue"
                : "Continue to Stylist"}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      </View>
    );
  };

  /* =========================================================
     MAIN RENDER
  ========================================================= */

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              selectedService
                ? isMobile
                  ? 145
                  : 110
                : 0,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios"
            ? "interactive"
            : "on-drag"
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadServices(true)
            }
            tintColor={
              COLORS.primary
            }
            colors={[
              COLORS.primary,
            ]}
          />
        }
      >
        {/* HERO */}

        {renderHero()}

        {/* CONTENT */}

        <View
          style={styles.contentSection}
        >
          {renderFilters()}

          {renderResultHeader()}

          {loading &&
            renderLoading()}

          {renderError()}

          {renderEmpty()}

          {renderServices()}

          {/* FOOTER */}

          <View
            style={[
              styles.footerWrapper,
              {
                marginTop:
                  filteredServices.length >
                  0
                    ? isMobile
                      ? 42
                      : 58
                    : 36,
              },
            ]}
          >
            <CustomerFooter />
          </View>
        </View>
      </ScrollView>

      {/* BOOKING BAR */}

      {renderBookingBar()}
    </KeyboardAvoidingView>
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
    width: "100%",
    minHeight: 0,
    backgroundColor:
      COLORS.background,
  },

  scrollView: {
    flex: 1,
    width: "100%",
    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    width: "100%",
    paddingBottom: 0,
  },

  /* =======================================================
     COMMON CONTAINER
  ======================================================= */

  container: {
    alignSelf: "center",
    maxWidth: 1480,
  },

  /* =======================================================
     HERO
  ======================================================= */

  heroSection: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor:
      COLORS.border,
  },

  heroGlowRight: {
    position: "absolute",
    right: -100,
    top: -100,
    borderRadius: 999,
    backgroundColor:
      "rgba(141,79,131,0.10)",
  },

  heroGlowLeft: {
    position: "absolute",
    left: -130,
    bottom: -160,
    borderRadius: 999,
    backgroundColor:
      "rgba(217,182,211,0.28)",
  },

  backButtonWrapper: {
    paddingTop: 22,
    paddingBottom: 4,
  },

  backButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor:
      "rgba(231,220,231,0.95)",
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.90)",
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 2,
  },

  backButtonPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  backButtonText: {
    flexShrink: 1,
    color: "#625462",
    fontSize: 13,
    fontWeight: "800",
  },

  /* =======================================================
     HERO CONTENT
  ======================================================= */

  heroContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 36,
    paddingTop: 54,
    paddingBottom: 68,
  },

  heroContentMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 28,
    paddingTop: 34,
    paddingBottom: 42,
  },

  heroLeft: {
    flex: 1,
    minWidth: 0,
    maxWidth: 820,
  },

  heroLeftMobile: {
    maxWidth: "100%",
  },

  heroBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor:
      "rgba(234,221,234,0.95)",
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.84)",
  },

  heroBadgeText: {
    flexShrink: 1,
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  heroTitle: {
    marginTop: 20,
    flexShrink: 1,
    color: COLORS.textDark,
    fontWeight: "900",
    letterSpacing: -1.7,
  },

  heroTitleAccent: {
    marginTop: 2,
    flexShrink: 1,
    color: COLORS.primary,
    fontWeight: "900",
    letterSpacing: -1.7,
  },

  heroDescription: {
    maxWidth: 730,
    marginTop: 19,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  heroStats: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 9,
    marginTop: 23,
  },

  heroStatPill: {
    maxWidth: "100%",
    minHeight: 37,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.88)",
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.70)",
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor:
      COLORS.success,
  },

  heroStatText: {
    flexShrink: 1,
    color: "#756875",
    fontSize: 11,
    fontWeight: "800",
  },

  /* =======================================================
     SUMMARY
  ======================================================= */

  summaryCard: {
    minWidth: 0,
    padding: 21,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.95)",
    borderRadius: 28,
    backgroundColor:
      "rgba(255,255,255,0.80)",
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.10,
    shadowRadius: 35,
    elevation: 5,
  },

  summaryTop: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  summaryTextArea: {
    flex: 1,
    minWidth: 0,
  },

  summaryLabel: {
    flexShrink: 1,
    color: "#958995",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  summaryCount: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46,
    letterSpacing: -1,
  },

  summaryIcon: {
    width: 58,
    height: 58,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 19,
    backgroundColor:
      COLORS.primarySoft,
  },

  summaryStatus: {
    minWidth: 0,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor:
      "#F8F3F8",
  },

  summaryStatusDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 99,
    backgroundColor:
      COLORS.success,
  },

  summaryStatusText: {
    flexShrink: 1,
    color: "#716572",
    fontSize: 11,
    fontWeight: "800",
  },

  /* =======================================================
     CONTENT
  ======================================================= */

  contentSection: {
    width: "100%",
    paddingTop: 30,
  },

  /* =======================================================
     FILTER
  ======================================================= */

  filterCard: {
    alignSelf: "center",
    minWidth: 0,
    padding: 12,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 24,
    backgroundColor:
      "rgba(255,255,255,0.96)",
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 3,
  },

  searchContainer: {
    width: "100%",
    minWidth: 0,
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      COLORS.borderLight,
    borderRadius: 17,
    backgroundColor:
      "#FBF9FC",
  },

  searchContainerFocused: {
    borderColor:
      "rgba(141,79,131,0.55)",
    backgroundColor:
      "#FFFFFF",
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  searchIcon: {
    flexShrink: 0,
    marginLeft: 15,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 52,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: "#312731",
    fontWeight: "600",
    outlineStyle: "none",
  },

  searchClear: {
    width: 42,
    height: 52,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  categoryScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    paddingTop: 10,
    paddingBottom: 2,
  },

  categoryChip: {
    minHeight: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor:
      "transparent",
    borderRadius: 13,
    backgroundColor:
      "#F7F2F7",
  },

  categoryChipActive: {
    borderColor:
      COLORS.primary,
    backgroundColor:
      COLORS.primary,
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },

  categoryChipPressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  categoryChipText: {
    flexShrink: 0,
    color: "#756B75",
    fontSize: 11,
    fontWeight: "900",
  },

  categoryChipTextActive: {
    color: "#FFFFFF",
  },

  /* =======================================================
     RESULT HEADER
  ======================================================= */

  resultHeader: {
    alignSelf: "center",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 14,
    paddingTop: 34,
    paddingBottom: 6,
  },

  resultHeadingArea: {
    flex: 1,
    minWidth: 0,
  },

  resultEyebrow: {
    color: "#9C909D",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  resultTitle: {
    marginTop: 5,
    flexShrink: 1,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.8,
  },

  resultTitleMobile: {
    fontSize: 23,
    lineHeight: 29,
  },

  resultCountPill: {
    minHeight: 38,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 999,
    backgroundColor:
      COLORS.white,
  },

  resultCountText: {
    color: "#796D79",
    fontSize: 11,
    fontWeight: "800",
  },

  /* =======================================================
     GRID
  ======================================================= */

  grid: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    paddingTop: 20,
  },

  /* =======================================================
     SERVICE CARD
  ======================================================= */

  serviceCard: {
    position: "relative",
    minWidth: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      "#EEE7EF",
    borderRadius: 27,
    backgroundColor:
      COLORS.card,
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 25,
    elevation: 3,
  },

  serviceCardSelected: {
    borderColor:
      "rgba(141,79,131,0.50)",
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 7,
  },

  serviceCardPressed: {
    opacity: 0.97,
    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  serviceHero: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  heroCircleLarge: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  heroCircleBottom: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor:
      "rgba(0,0,0,0.08)",
  },

  serviceIconBox: {
    position: "absolute",
    left: 16,
    top: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
    borderRadius: 16,
    backgroundColor:
      "rgba(255,255,255,0.15)",
  },

  availableBadge: {
    position: "absolute",
    maxWidth: "45%",
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.20)",
    borderRadius: 999,
    backgroundColor:
      "rgba(255,255,255,0.14)",
  },

  availableDot: {
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: 99,
    backgroundColor:
      "#A7F3B8",
  },

  availableText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  categoryPosition: {
    position: "absolute",
    minWidth: 0,
  },

  categoryLabel: {
    flexShrink: 1,
    color:
      "rgba(255,255,255,0.76)",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },

  /* =======================================================
     CARD CONTENT
  ======================================================= */

  serviceContent: {
    minWidth: 0,
  },

  titleRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  serviceTitle: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
    color: "#2B222C",
    fontWeight: "900",
    letterSpacing: -0.2,
  },

  selectedCheck: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor:
      COLORS.primary,
  },

  serviceDescription: {
    marginTop: 11,
    flexShrink: 1,
    color: "#817581",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 21,
  },

  divider: {
    width: "100%",
    height: 1,
    marginTop: 16,
    marginBottom: 14,
    backgroundColor:
      "#F0E9F0",
  },

  /* =======================================================
     META
  ======================================================= */

  metaRow: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  metaRowTiny: {
    gap: 7,
  },

  durationBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  metaIconBox: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor:
      "rgba(141,79,131,0.10)",
  },

  metaTextBlock: {
    minWidth: 0,
    flexShrink: 1,
  },

  metaLabel: {
    flexShrink: 1,
    color: "#A197A2",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  metaValue: {
    marginTop: 2,
    flexShrink: 1,
    color: "#342934",
    fontSize: 13,
    fontWeight: "900",
  },

  priceBlock: {
    minWidth: 0,
    maxWidth: "48%",
    alignItems: "flex-end",
  },

  priceBlockTiny: {
    maxWidth: "46%",
  },

  priceValue: {
    maxWidth: "100%",
    marginTop: 2,
    color: COLORS.primary,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 24,
  },

  /* =======================================================
     SELECT BUTTON
  ======================================================= */

  selectButton: {
    width: "100%",
    minHeight: 48,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor:
      "#F7F1F7",
  },

  selectButtonSelected: {
    backgroundColor:
      COLORS.primary,
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },

  selectButtonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  selectButtonText: {
    flexShrink: 1,
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },

  selectButtonTextSelected: {
    color: "#FFFFFF",
  },

  selectedBottomLine: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 4,
  },

  /* =======================================================
     SKELETON
  ======================================================= */

  skeletonCard: {
    minWidth: 0,
    overflow: "hidden",
    borderWidth: 1,
    borderColor:
      "#EEE7EF",
    borderRadius: 27,
    backgroundColor:
      COLORS.white,
  },

  skeletonHero: {
    position: "relative",
    backgroundColor:
      "#EEE8EF",
  },

  skeletonIcon: {
    position: "absolute",
    left: 17,
    top: 17,
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor:
      "#E5DDE6",
  },

  skeletonBadge: {
    position: "absolute",
    right: 17,
    top: 19,
    width: 76,
    height: 26,
    borderRadius: 999,
    backgroundColor:
      "#E5DDE6",
  },

  skeletonContent: {
    minWidth: 0,
  },

  skeletonLine: {
    height: 18,
    borderRadius: 7,
    backgroundColor:
      "#EEE8EF",
  },

  skeletonLineSmall: {
    height: 13,
    marginTop: 12,
    borderRadius: 6,
    backgroundColor:
      "#F3EEF3",
  },

  skeletonMeta: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  skeletonMetaIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor:
      "#EEE8EF",
  },

  skeletonMetaText: {
    width: 70,
    height: 12,
    borderRadius: 6,
    backgroundColor:
      "#F0EBF0",
  },

  skeletonButton: {
    width: "100%",
    height: 48,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor:
      "#EEE8EF",
  },

  /* =======================================================
     ERROR / EMPTY
  ======================================================= */

  stateCard: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: 38,
    paddingHorizontal: 24,
    paddingVertical: 38,
    borderWidth: 1,
    borderColor:
      "#F1DADA",
    borderRadius: 27,
    backgroundColor:
      COLORS.white,
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 3,
  },

  emptyCard: {
    alignSelf: "center",
    alignItems: "center",
    marginTop: 38,
    paddingHorizontal: 24,
    paddingVertical: 52,
    borderWidth: 1,
    borderColor:
      COLORS.border,
    borderRadius: 28,
    backgroundColor:
      COLORS.white,
    shadowColor:
      COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.05,
    shadowRadius: 28,
    elevation: 3,
  },

  errorIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor:
      COLORS.dangerSoft,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor:
      COLORS.primarySoft,
  },

  stateTitle: {
    maxWidth: "100%",
    marginTop: 18,
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 27,
  },

  stateDescription: {
    maxWidth: 500,
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    minHeight: 46,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor:
      COLORS.danger,
  },

  retryButtonPressed: {
    opacity: 0.78,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  clearFilterButton: {
    minHeight: 47,
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor:
      COLORS.primary,
  },

  clearFilterPressed: {
    opacity: 0.78,
  },

  clearFilterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footerWrapper: {
    width: "100%",
    overflow: "hidden",
  },

  /* =======================================================
     BOOKING BAR
  ======================================================= */

  bookingBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: "center",
    paddingBottom:
      Platform.OS === "web" ? 12 : 10,
  },

  bookingBar: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor:
      "rgba(233,220,232,0.95)",
    borderRadius: 22,
    backgroundColor:
      "rgba(255,255,255,0.98)",
    shadowColor:
      "#3C1E37",
    shadowOffset: {
      width: 0,
      height: -9,
    },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 12,
  },

  bookingBarMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 20,
  },

  bookingInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bookingInfoMobile: {
    width: "100%",
  },

  bookingIcon: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor:
      COLORS.primarySoft,
  },

  bookingTextArea: {
    flex: 1,
    minWidth: 0,
  },

  bookingLabel: {
    color: "#A096A1",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  bookingNameRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 3,
  },

  bookingNameRowMobile: {
    maxWidth: "100%",
  },

  bookingServiceName: {
    flexShrink: 1,
    color: "#2D232E",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 18,
  },

  bookingDotSeparator: {
    width: 4,
    height: 4,
    flexShrink: 0,
    borderRadius: 99,
    backgroundColor:
      "#B3A9B3",
  },

  bookingPrice: {
    maxWidth: 90,
    flexShrink: 0,
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "900",
  },

  clearSelection: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor:
      "#F4EFF4",
  },

  continueButton: {
    minWidth: 190,
    height: 48,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor:
      COLORS.primary,
    shadowColor:
      COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.20,
    shadowRadius: 17,
    elevation: 5,
  },

  continueButtonMobile: {
    width: "100%",
    minWidth: 0,
  },

  continueButtonPressed: {
    opacity: 0.8,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  continueButtonText: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
});

/* =========================================================
   WEB POINTER SUPPORT
========================================================= */

if (Platform.OS === "web") {
  styles.backButton = {
    ...styles.backButton,
    cursor: "pointer",
  };

  styles.serviceCard = {
    ...styles.serviceCard,
    cursor: "pointer",
  };

  styles.categoryChip = {
    ...styles.categoryChip,
    cursor: "pointer",
  };

  styles.selectButton = {
    ...styles.selectButton,
    cursor: "pointer",
  };

  styles.continueButton = {
    ...styles.continueButton,
    cursor: "pointer",
  };

  styles.searchInput = {
    ...styles.searchInput,
    outlineStyle: "none",
  };
}

export default SalonServices;