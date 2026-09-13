import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  getCustomerSalonById,
} from "../../../../../services/customerSalonService";

import CustomerFooter from "../../../../../components/customers/CustomerFooter";

// =====================================================
// CONSTANTS
// =====================================================

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const COLORS = {
  background: "#FCF9FC",
  white: "#FFFFFF",
  primary: "#54205B",
  primaryDark: "#421747",
  primaryDeep: "#2B102F",
  primarySoft: "#F5EDF6",
  primarySoft2: "#FAF6FA",
  accent: "#92548C",
  text: "#29162C",
  textSoft: "#5F4D61",
  muted: "#817582",
  muted2: "#8A7A8B",
  border: "#EADDE9",
  borderSoft: "#EEE5EF",
  success: "#27865B",
  successSoft: "#EAF7F0",
  closed: "#B06776",
  closedSoft: "#FFF1F3",
  rating: "#D79B18",
  ratingSoft: "#FFF7DF",
  shadow: "rgba(56,22,59,0.08)",
};

// =====================================================
// IMAGE URL
// =====================================================

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    "http://192.168.1.5:1812/api";

  const serverUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}${
    imagePath.startsWith("/") ? imagePath : `/${imagePath}`
  }`;
};

// =====================================================
// DAY FORMAT
// =====================================================

const formatDay = (day) => {
  if (!day) return "";

  return (
    day.charAt(0) +
    day.slice(1).toLowerCase()
  );
};

// =====================================================
// SKELETON
// =====================================================

const SkeletonBox = ({
  width = "100%",
  height = 20,
  radius = 12,
  style,
}) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    />
  );
};

// =====================================================
// LOADING SCREEN
// =====================================================

const LoadingState = ({ isTablet, isDesktop }) => {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.loadingContent,
        {
          paddingHorizontal: isDesktop
            ? 40
            : isTablet
            ? 28
            : 18,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.loadingInner,
          {
            maxWidth: isDesktop ? 1400 : 1000,
          },
        ]}
      >
        <SkeletonBox
          width={120}
          height={40}
          radius={14}
        />

        <View
          style={[
            styles.loadingHero,
            isDesktop && styles.loadingHeroDesktop,
          ]}
        >
          <View
            style={[
              styles.loadingImage,
              {
                height: isDesktop
                  ? 600
                  : isTablet
                  ? 480
                  : 330,
              },
            ]}
          >
            <SkeletonBox
              width="100%"
              height="100%"
              radius={30}
            />
          </View>

          <View style={styles.loadingDetails}>
            <SkeletonBox
              width={150}
              height={32}
              radius={18}
            />

            <SkeletonBox
              width="78%"
              height={48}
              radius={12}
              style={{ marginTop: 18 }}
            />

            <SkeletonBox
              width="92%"
              height={20}
              radius={10}
              style={{ marginTop: 18 }}
            />

            <SkeletonBox
              width="82%"
              height={20}
              radius={10}
              style={{ marginTop: 10 }}
            />

            <SkeletonBox
              width="100%"
              height={90}
              radius={20}
              style={{ marginTop: 28 }}
            />

            <SkeletonBox
              width="100%"
              height={54}
              radius={18}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>

        <View style={{ marginTop: 28 }}>
          <SkeletonBox
            width="100%"
            height={230}
            radius={30}
          />
        </View>
      </View>
    </ScrollView>
  );
};

// =====================================================
// ERROR STATE
// =====================================================

const ErrorState = ({ message, isTablet }) => {
  return (
    <View style={styles.errorScreen}>
      <View
        style={[
          styles.errorCard,
          {
            width: isTablet ? 500 : "90%",
          },
        ]}
      >
        <View style={styles.errorIcon}>
          <MaterialCommunityIcons
            name="store-off-outline"
            size={34}
            color={COLORS.primary}
          />
        </View>

        <Text style={styles.errorTitle}>
          Salon unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {message || "This salon could not be found."}
        </Text>

        <Pressable
          onPress={() => router.replace("/customer/salons")}
          style={({ pressed }) => [
            styles.errorButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="arrow-back"
            size={17}
            color={COLORS.white}
          />

          <Text style={styles.errorButtonText}>
            Back to salons
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

// =====================================================
// HERO IMAGE FALLBACK
// =====================================================

const SalonImageFallback = () => {
  return (
    <View style={styles.imageFallback}>
      <View style={styles.fallbackGlowOne} />
      <View style={styles.fallbackGlowTwo} />

      <View style={styles.fallbackIconContainer}>
        <MaterialCommunityIcons
          name="storefront-outline"
          size={54}
          color="rgba(255,255,255,0.88)"
        />
      </View>

      <Text style={styles.fallbackTitle}>
        LUMORA
      </Text>

      <Text style={styles.fallbackSubtitle}>
        BEAUTY & WELLNESS
      </Text>
    </View>
  );
};

// =====================================================
// IMAGE GALLERY
// =====================================================

const ImageGallery = ({
  salon,
  images,
  activeImage,
  setActiveImage,
  isTablet,
  isDesktop,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const heroHeight = isDesktop
    ? 600
    : isTablet
    ? 500
    : 340;

  useEffect(() => {
    setImageFailed(false);
  }, [activeImage]);

  return (
    <View style={styles.galleryWrapper}>
      <View
        style={[
          styles.heroImageContainer,
          {
            height: heroHeight,
            borderRadius: isDesktop ? 34 : 28,
          },
        ]}
      >
        {!imageFailed && images.length > 0 ? (
          <Image
            source={{
              uri: getImageUrl(images[activeImage]),
            }}
            style={styles.heroImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <SalonImageFallback />
        )}

        <View style={styles.imageOverlay} />

        <View style={styles.heroTopBadge}>
          <View style={styles.activeDot} />

          <Text style={styles.activeBadgeText}>
            ACTIVE SALON
          </Text>
        </View>

        <View style={styles.heroBottom}>
          <View style={styles.heroLocationRow}>
            <View style={styles.locationCircle}>
              <Ionicons
                name="location"
                size={15}
                color={COLORS.white}
              />
            </View>

            <Text
              style={styles.heroLocationText}
              numberOfLines={2}
            >
              {salon?.city || "Location unavailable"}
            </Text>
          </View>

          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Ionicons
                name="images-outline"
                size={14}
                color={COLORS.white}
              />

              <Text style={styles.imageCounterText}>
                {activeImage + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>
      </View>

      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailList}
        >
          {images.slice(0, 6).map((image, index) => {
            const selected = activeImage === index;

            return (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => setActiveImage(index)}
                style={({ pressed }) => [
                  styles.thumbnail,
                  selected && styles.thumbnailSelected,
                  pressed && styles.thumbnailPressed,
                ]}
              >
                <Image
                  source={{
                    uri: getImageUrl(image),
                  }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />

                {selected && (
                  <View style={styles.thumbnailOverlay}>
                    <View style={styles.thumbnailCheck}>
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color={COLORS.white}
                      />
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

// =====================================================
// CONTACT ITEM
// =====================================================

const ContactItem = ({
  icon,
  value,
  onPress,
  isEmail = false,
}) => {
  if (!value) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactItem,
        pressed && styles.contactPressed,
      ]}
    >
      <View style={styles.contactIcon}>
        <Ionicons
          name={icon}
          size={17}
          color={COLORS.accent}
        />
      </View>

      <Text
        style={[
          styles.contactText,
          isEmail && styles.emailText,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value}
      </Text>

      <Ionicons
        name="open-outline"
        size={15}
        color="#B39EB5"
      />
    </Pressable>
  );
};

// =====================================================
// REVIEW CARD
// =====================================================

const ReviewNavigationCard = ({
  salonId,
  isTablet,
}) => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewInfo}>
        <View style={styles.reviewIcon}>
          <Ionicons
            name="star"
            size={19}
            color={COLORS.rating}
          />
        </View>

        <View style={styles.reviewTextContainer}>
          <Text style={styles.reviewTitle}>
            Salon Reviews
          </Text>

          <Text style={styles.reviewSubtitle}>
            See what customers are saying
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() =>
          router.push(
            `/customer/salons/${salonId}/reviews`
          )
        }
        style={({ pressed }) => [
          styles.reviewButton,
          {
            width: isTablet ? "auto" : "100%",
          },
          pressed && styles.primaryPressed,
        ]}
      >
        <Text style={styles.reviewButtonText}>
          View Reviews
        </Text>

        <Ionicons
          name="arrow-forward"
          size={14}
          color={COLORS.white}
        />
      </Pressable>
    </View>
  );
};

// =====================================================
// WORKING HOURS
// =====================================================

const WorkingHours = ({
  workingHours,
  isTablet,
  isDesktop,
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderIcon}>
          <Ionicons
            name="time-outline"
            size={21}
            color={COLORS.accent}
          />
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>
            Working Hours
          </Text>

          <Text style={styles.sectionSubtitle}>
            Salon availability throughout the week
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.hoursGrid,
          {
            flexDirection:
              isDesktop || isTablet
                ? "row"
                : "column",
          },
        ]}
      >
        {workingHours.map((item) => {
          const isOpen = Boolean(item.isOpen);

          return (
            <View
              key={item.day}
              style={[
                styles.hoursItem,
                {
                  width: isDesktop
                    ? "23.5%"
                    : isTablet
                    ? "48.5%"
                    : "100%",
                },
              ]}
            >
              <View style={styles.dayInfo}>
                <View
                  style={[
                    styles.dayDot,
                    isOpen
                      ? styles.openDot
                      : styles.closedDot,
                  ]}
                />

                <Text
                  style={styles.dayText}
                  numberOfLines={1}
                >
                  {formatDay(item.day)}
                </Text>
              </View>

              {isOpen ? (
                <View style={styles.timeBadge}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={COLORS.success}
                  />

                  <Text style={styles.timeText}>
                    {item.openTime || "--"}
                    {" - "}
                    {item.closeTime || "--"}
                  </Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedText}>
                    Closed
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

const SalonDetails = () => {
  const { salonId } = useLocalSearchParams();

  const { width } = useWindowDimensions();

  const isSmallMobile = width < 360;
  const isMediumMobile =
    width >= 360 && width < 430;
  const isLargeMobile =
    width >= 430 && width < 768;
  const isTablet =
    width >= 768 && width < 1100;
  const isDesktop = width >= 1100;

  const contentMaxWidth = isDesktop
    ? 1400
    : isTablet
    ? 1050
    : 700;

  const horizontalPadding = isDesktop
    ? 40
    : isTablet
    ? 28
    : isSmallMobile
    ? 14
    : isMediumMobile
    ? 17
    : 20;

  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  // ===================================================
  // LOAD SALON
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadSalon = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getCustomerSalonById(salonId);

        if (!mounted) return;

        setSalon(response?.salon || null);
      } catch (err) {
        console.log(
          "Salon details error:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            "Unable to load this salon."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (salonId) {
      loadSalon();
    } else {
      setError("Salon ID is missing.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [salonId]);

  // ===================================================
  // WORKING HOURS
  // ===================================================

  const workingHours = useMemo(() => {
    if (!salon?.workingHours?.length) {
      return DAYS.map((day) => ({
        day,
        isOpen: false,
        openTime: "",
        closeTime: "",
      }));
    }

    return DAYS.map((day) => {
      const found =
        salon.workingHours.find(
          (item) => item.day === day
        );

      return (
        found || {
          day,
          isOpen: false,
          openTime: "",
          closeTime: "",
        }
      );
    });
  }, [salon]);

  // ===================================================
  // BOOK
  // ===================================================

  const handleBook = () => {
    if (!salonId) return;

    router.push(
      `/customer/salons/${salonId}/services`
    );
  };

  // ===================================================
  // PHONE
  // ===================================================

  const handlePhone = async () => {
    if (!salon?.phone) return;

    try {
      await Linking.openURL(
        `tel:${salon.phone}`
      );
    } catch (err) {
      console.log(
        "Phone link error:",
        err
      );
    }
  };

  // ===================================================
  // EMAIL
  // ===================================================

  const handleEmail = async () => {
    if (!salon?.email) return;

    try {
      await Linking.openURL(
        `mailto:${salon.email}`
      );
    } catch (err) {
      console.log(
        "Email link error:",
        err
      );
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <View style={styles.screen}>
        <LoadingState
          isTablet={isTablet}
          isDesktop={isDesktop}
        />
      </View>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error || !salon) {
    return (
      <View style={styles.screen}>
        <ErrorState
          message={error}
          isTablet={isTablet}
        />
      </View>
    );
  }

  // ===================================================
  // IMAGES
  // ===================================================

  const images = Array.isArray(salon.images)
    ? salon.images
    : [];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingBottom: 0,
        }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <View
          style={[
            styles.mainContainer,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <Pressable
            onPress={() =>
              router.replace(
                "/customer/salons"
              )
            }
            style={({ pressed }) => [
              styles.backButton,
              {
                alignSelf:
                  isDesktop || isTablet
                    ? "flex-start"
                    : "stretch",
              },
              pressed && styles.backPressed,
            ]}
          >
            <View style={styles.backIcon}>
              <Ionicons
                name="arrow-back"
                size={17}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.backText}>
              Back to salons
            </Text>
          </Pressable>

          {/* =================================================
              HERO
          ================================================= */}

          <View
            style={[
              styles.heroGrid,
              {
                flexDirection:
                  isTablet || isDesktop
                    ? "row"
                    : "column",
              },
            ]}
          >
            {/* =================================================
                IMAGE
            ================================================= */}

            <View
              style={[
                styles.galleryColumn,
                {
                  width:
                    isDesktop
                      ? "55%"
                      : isTablet
                      ? "52%"
                      : "100%",
                },
              ]}
            >
              <ImageGallery
                salon={salon}
                images={images}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
                isTablet={isTablet}
                isDesktop={isDesktop}
              />
            </View>

            {/* =================================================
                DETAILS
            ================================================= */}

            <View
              style={[
                styles.detailsCard,
                {
                  width:
                    isDesktop
                      ? "45%"
                      : isTablet
                      ? "48%"
                      : "100%",
                  padding:
                    isDesktop
                      ? 38
                      : isTablet
                      ? 30
                      : isSmallMobile
                      ? 20
                      : 24,
                },
              ]}
            >
              {/* BRAND PILL */}

              <View style={styles.brandPill}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={14}
                  color={COLORS.accent}
                />

                <Text style={styles.brandPillText}>
                  LUMORA SALON
                </Text>
              </View>

              {/* NAME */}

              <Text
                style={[
                  styles.salonName,
                  {
                    fontSize:
                      isSmallMobile
                        ? 28
                        : isMediumMobile
                        ? 32
                        : isTablet
                        ? 40
                        : isDesktop
                        ? 48
                        : 36,
                    lineHeight:
                      isSmallMobile
                        ? 34
                        : isMediumMobile
                        ? 39
                        : isTablet
                        ? 47
                        : isDesktop
                        ? 56
                        : 43,
                  },
                ]}
              >
                {salon.name}
              </Text>

              {/* LOCATION */}

              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color={COLORS.accent}
                  />
                </View>

                <Text style={styles.addressText}>
                  {salon.address || "Address unavailable"}
                  {salon.city
                    ? `, ${salon.city}`
                    : ""}
                </Text>
              </View>

              <View style={styles.divider} />

              {/* DESCRIPTION */}

              <Text style={styles.description}>
                {salon.description ||
                  "Experience personalized beauty services in a modern and welcoming salon environment."}
              </Text>

              {/* CONTACT */}

              {(salon.phone || salon.email) && (
                <View style={styles.contactSection}>
                  <ContactItem
                    icon="call-outline"
                    value={salon.phone}
                    onPress={handlePhone}
                  />

                  <ContactItem
                    icon="mail-outline"
                    value={salon.email}
                    onPress={handleEmail}
                    isEmail
                  />
                </View>
              )}

              {/* REVIEWS */}

              <ReviewNavigationCard
                salonId={salonId}
                isTablet={isTablet || isDesktop}
              />

              {/* BOOK BUTTON */}

              <Pressable
                onPress={handleBook}
                style={({ pressed }) => [
                  styles.bookButton,
                  pressed && styles.primaryPressed,
                ]}
              >
                <View style={styles.bookIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={19}
                    color={COLORS.white}
                  />
                </View>

                <Text
                  style={styles.bookButtonText}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                >
                  Book an Appointment
                </Text>

                <View style={styles.bookArrow}>
                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color={COLORS.white}
                  />
                </View>
              </Pressable>
            </View>
          </View>

          {/* =================================================
              WORKING HOURS
          ================================================= */}

          <WorkingHours
            workingHours={workingHours}
            isTablet={isTablet}
            isDesktop={isDesktop}
          />

          {/* =================================================
              PREMIUM INFORMATION STRIP
          ================================================= */}

          <View
            style={[
              styles.infoStrip,
              {
                flexDirection:
                  isSmallMobile
                    ? "column"
                    : "row",
              },
            ]}
          >
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={COLORS.accent}
                />
              </View>

              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>
                  Trusted Salon
                </Text>

                <Text style={styles.infoSubtitle}>
                  Professional beauty experience
                </Text>
              </View>
            </View>

            {!isSmallMobile && (
              <View style={styles.infoDivider} />
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="calendar-clear-outline"
                  size={18}
                  color={COLORS.accent}
                />
              </View>

              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>
                  Easy Booking
                </Text>

                <Text style={styles.infoSubtitle}>
                  Choose your preferred time
                </Text>
              </View>
            </View>

            {!isSmallMobile && (
              <View style={styles.infoDivider} />
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={18}
                  color={COLORS.accent}
                />
              </View>

              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>
                  Premium Care
                </Text>

                <Text style={styles.infoSubtitle}>
                  Beauty designed around you
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View style={styles.footerWrapper}>
          <CustomerFooter />
        </View>
      </ScrollView>
    </View>
  );
};

export default SalonDetails;

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // ===================================================
  // GLOBAL
  // ===================================================

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  mainContainer: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 24,
    paddingBottom: 42,
  },

  // ===================================================
  // LOADING
  // ===================================================

  loadingContent: {
    paddingTop: 30,
    paddingBottom: 50,
  },

  loadingInner: {
    width: "100%",
    alignSelf: "center",
  },

  loadingHero: {
    width: "100%",
    marginTop: 25,
  },

  loadingHeroDesktop: {
    flexDirection: "row",
    gap: 24,
  },

  loadingImage: {
    width: "100%",
  },

  loadingDetails: {
    flex: 1,
    paddingTop: 5,
  },

  skeleton: {
    backgroundColor: "#EEE5EF",
  },

  // ===================================================
  // ERROR
  // ===================================================

  errorScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },

  errorCard: {
    maxWidth: 520,
    paddingHorizontal: 26,
    paddingVertical: 34,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.08,
    shadowRadius: 35,
    elevation: 8,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  errorTitle: {
    color: COLORS.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    textAlign: "center",
  },

  errorMessage: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 9,
    maxWidth: 420,
  },

  errorButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 24,
  },

  errorButtonText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  // ===================================================
  // BACK
  // ===================================================

  backButton: {
    minHeight: 48,
    paddingHorizontal: 7,
    paddingRight: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 22,
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.035,
    shadowRadius: 12,
    elevation: 2,
  },

  backIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  backPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.985 }],
  },

  // ===================================================
  // HERO GRID
  // ===================================================

  heroGrid: {
    width: "100%",
    gap: 22,
    alignItems: "stretch",
  },

  galleryColumn: {
    minWidth: 0,
  },

  galleryWrapper: {
    width: "100%",
  },

  // ===================================================
  // HERO IMAGE
  // ===================================================

  heroImageContainer: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#EEE5EF",
    position: "relative",
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.09,
    shadowRadius: 28,
    elevation: 6,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  imageFallback: {
    flex: 1,
    backgroundColor: COLORS.primaryDeep,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  fallbackGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#54205B",
    opacity: 0.72,
    top: -90,
    right: -70,
  },

  fallbackGlowTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#9A587F",
    opacity: 0.4,
    bottom: -100,
    left: -70,
  },

  fallbackIconContainer: {
    width: 92,
    height: 92,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  fallbackTitle: {
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: 5,
  },

  fallbackSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "800",
    letterSpacing: 3,
    marginTop: 5,
  },

  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
    backgroundColor: "rgba(0,0,0,0.28)",
  },

  heroTopBadge: {
    position: "absolute",
    top: 18,
    left: 18,
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.93)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  activeBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  heroBottom: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  heroLocationRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  locationCircle: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroLocationText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },

  imageCounter: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  imageCounterText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  // ===================================================
  // THUMBNAILS
  // ===================================================

  thumbnailList: {
    paddingTop: 10,
    paddingBottom: 3,
    gap: 9,
  },

  thumbnail: {
    width: 76,
    height: 62,
    borderRadius: 13,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#EEE5EF",
  },

  thumbnailSelected: {
    borderColor: COLORS.primary,
  },

  thumbnailPressed: {
    opacity: 0.75,
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
  },

  thumbnailOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(84,32,91,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },

  thumbnailCheck: {
    width: 25,
    height: 25,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // ===================================================
  // DETAILS CARD
  // ===================================================

  detailsCard: {
    minWidth: 0,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.065,
    shadowRadius: 38,
    elevation: 5,
  },

  brandPill: {
    alignSelf: "flex-start",
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  brandPillText: {
    color: "#754078",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.25,
  },

  salonName: {
    color: COLORS.text,
    fontWeight: "900",
    letterSpacing: -1,
    marginTop: 17,
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 17,
  },

  addressIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  addressText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
    paddingTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE4EE",
    marginVertical: 22,
  },

  description: {
    color: "#756778",
    fontSize: 14,
    lineHeight: 23,
    fontWeight: "500",
  },

  // ===================================================
  // CONTACT
  // ===================================================

  contactSection: {
    marginTop: 21,
    gap: 9,
  },

  contactItem: {
    minHeight: 55,
    width: "100%",
    borderRadius: 17,
    backgroundColor: COLORS.primarySoft2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  contactPressed: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },

  contactText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  emailText: {
    fontSize: 11,
  },

  // ===================================================
  // REVIEW
  // ===================================================

  reviewCard: {
    width: "100%",
    marginTop: 21,
    padding: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  reviewInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  reviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: COLORS.ratingSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  reviewTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  reviewTitle: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  reviewSubtitle: {
    color: COLORS.muted2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    marginTop: 2,
  },

  reviewButton: {
    minHeight: 43,
    marginTop: 11,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  reviewButtonText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },

  // ===================================================
  // BOOK
  // ===================================================

  bookButton: {
    width: "100%",
    minHeight: 57,
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#54205B",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 5,
  },

  bookIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  bookButtonText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
    marginHorizontal: 8,
  },

  bookArrow: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  primaryPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  pressed: {
    opacity: 0.78,
  },

  // ===================================================
  // WORKING HOURS
  // ===================================================

  sectionCard: {
    width: "100%",
    marginTop: 24,
    padding: 22,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: "#38163B",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.055,
    shadowRadius: 32,
    elevation: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  sectionHeaderIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    marginTop: 2,
  },

  hoursGrid: {
    width: "100%",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 9,
    marginTop: 20,
  },

  hoursItem: {
    minHeight: 60,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.background,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  dayInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dayDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },

  openDot: {
    backgroundColor: COLORS.success,
  },

  closedDot: {
    backgroundColor: COLORS.closed,
  },

  dayText: {
    flex: 1,
    color: "#4F3C51",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  timeBadge: {
    maxWidth: "56%",
    minHeight: 29,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.successSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  timeText: {
    color: COLORS.success,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "800",
  },

  closedBadge: {
    minHeight: 29,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: COLORS.closedSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  closedText: {
    color: COLORS.closed,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
  },

  // ===================================================
  // INFO STRIP
  // ===================================================

  infoStrip: {
    width: "100%",
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FBF7FB",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },

  infoItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 0,
  },

  infoText: {
    flex: 1,
    minWidth: 0,
  },

  infoTitle: {
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },

  infoSubtitle: {
    color: COLORS.muted2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "500",
    marginTop: 1,
  },

  infoDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },

  // ===================================================
  // FOOTER
  // ===================================================

  footerWrapper: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});