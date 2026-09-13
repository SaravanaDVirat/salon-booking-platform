import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  cancelCustomerAppointment,
  getCustomerAppointmentById,
} from "../../../../../services/CustomerAppointmentService";

import CustomerFooter from "../../../../../components/customers/CustomerFooter";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#F8F6FA",
  backgroundSoft: "#FBF9FC",

  white: "#FFFFFF",

  primary: "#7C3AED",
  primaryDark: "#6527C7",
  primaryDeep: "#4C1D95",

  violetSoft: "#F3EEFF",
  violetSoft2: "#F8F5FF",
  violetBorder: "#E9DDFF",

  text: "#211B26",
  textDark: "#17121B",
  textMedium: "#514657",
  textSoft: "#746A79",
  textMuted: "#9B929F",

  border: "#EAE4ED",
  borderSoft: "#F1EDF3",

  green: "#16A34A",
  greenSoft: "#ECFDF3",
  greenBorder: "#BBF7D0",

  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  blueBorder: "#BFDBFE",

  amber: "#D97706",
  amberSoft: "#FFFBEB",
  amberBorder: "#FDE68A",

  red: "#DC2626",
  redDark: "#B91C1C",
  redSoft: "#FEF2F2",
  redBorder: "#FECACA",

  slateSoft: "#F1F5F9",
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date) => {
  if (!date) return "—";

  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatPrice = (price) => {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return `₹${price}`;
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
};

const getStatusConfig = (status) => {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "CONFIRMED",
        icon: "checkmark-circle",
        color: COLORS.green,
        background: COLORS.greenSoft,
        border: COLORS.greenBorder,
      };

    case "COMPLETED":
      return {
        label: "COMPLETED",
        icon: "checkmark-done-circle",
        color: COLORS.blue,
        background: COLORS.blueSoft,
        border: COLORS.blueBorder,
      };

    case "CANCELLED":
      return {
        label: "CANCELLED",
        icon: "close-circle",
        color: COLORS.textMuted,
        background: COLORS.slateSoft,
        border: "#CBD5E1",
      };

    case "REJECTED":
      return {
        label: "REJECTED",
        icon: "alert-circle",
        color: COLORS.red,
        background: COLORS.redSoft,
        border: COLORS.redBorder,
      };

    default:
      return {
        label: status || "PENDING",
        icon: "time",
        color: COLORS.amber,
        background: COLORS.amberSoft,
        border: COLORS.amberBorder,
      };
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const CustomerAppointmentDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { width } = useWindowDimensions();

  const [appointment, setAppointment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  /* =======================================================
     RESPONSIVE BREAKPOINTS
  ======================================================= */

  const isSmallMobile = width < 360;

  const isMediumMobile =
    width >= 360 && width < 430;

  const isLargeMobile =
    width >= 430 && width < 768;

  const isTablet =
    width >= 768 && width < 1100;

  const isLaptop =
    width >= 1100 && width < 1450;

  const isDesktop =
    width >= 1450;

  const horizontalPadding = isSmallMobile
    ? 14
    : isMediumMobile
      ? 16
      : isLargeMobile
        ? 20
        : isTablet
          ? 28
          : isLaptop
            ? 38
            : 48;

  const contentMaxWidth = 1280;

  /* =======================================================
     LOAD APPOINTMENT
  ======================================================= */

  const loadAppointment = useCallback(
    async (isRefresh = false) => {
      if (!id) {
        setLoading(false);
        setError("Appointment ID is missing.");
        return;
      }

      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const data =
          await getCustomerAppointmentById(id);

        setAppointment(
          data?.appointment || null
        );
      } catch (err) {
        console.error(
          "Customer appointment details error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load appointment."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadAppointment();
  }, [loadAppointment]);

  /* =======================================================
     CANCEL PERMISSION
  ======================================================= */

  const canCancel = useMemo(() => {
    if (!appointment) return false;

    return ![
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ].includes(appointment.status);
  }, [appointment]);

  /* =======================================================
     CANCEL APPOINTMENT
  ======================================================= */

  const handleCancel = async () => {
    if (!id || cancelling) return;

    try {
      setCancelling(true);
      setError("");

      const response =
        await cancelCustomerAppointment(id);

      setAppointment(
        response?.appointment || {
          ...appointment,
          status: "CANCELLED",
        }
      );

      setShowCancel(false);
    } catch (err) {
      console.error(
        "Cancel appointment error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const goToAppointments = () => {
    router.replace("/customer/appointments");
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const statusConfig = getStatusConfig(
    appointment?.status
  );

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  if (loading) {
    return (
      <View style={styles.screen}>
        <View style={styles.backgroundLayer}>
          <View style={styles.glowTopLeft} />
          <View style={styles.glowBottomRight} />
          <View style={styles.glowCenter} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.centerContent,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.loadingCard,
              isSmallMobile &&
                styles.loadingCardSmall,
              isTablet &&
                styles.loadingCardTablet,
            ]}
          >
            <View
              style={[
                styles.loadingIcon,
                isSmallMobile &&
                  styles.loadingIconSmall,
              ]}
            >
              <ActivityIndicator
                size={
                  isSmallMobile
                    ? "small"
                    : "large"
                }
                color={COLORS.primary}
              />
            </View>

            <Text
              style={[
                styles.loadingTitle,
                isSmallMobile &&
                  styles.loadingTitleSmall,
              ]}
            >
              Loading appointment
            </Text>

            <Text
              style={[
                styles.loadingDescription,
                isSmallMobile &&
                  styles.loadingDescriptionSmall,
              ]}
            >
              Please wait while we retrieve
              your booking details.
            </Text>

            <View style={styles.loadingTrack}>
              <View
                style={styles.loadingProgress}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* =======================================================
     ERROR WITHOUT APPOINTMENT
  ======================================================= */

  if (error && !appointment) {
    return (
      <View style={styles.screen}>
        <View style={styles.backgroundLayer}>
          <View style={styles.errorGlowOne} />
          <View style={styles.errorGlowTwo} />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.centerContent,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.errorCard,
              isSmallMobile &&
                styles.errorCardSmall,
              isTablet &&
                styles.errorCardTablet,
            ]}
          >
            <View
              style={[
                styles.errorIcon,
                isSmallMobile &&
                  styles.errorIconSmall,
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={
                  isSmallMobile ? 25 : 30
                }
                color={COLORS.red}
              />
            </View>

            <Text
              style={[
                styles.errorTitle,
                isSmallMobile &&
                  styles.errorTitleSmall,
              ]}
            >
              Unable to load appointment
            </Text>

            <Text
              style={[
                styles.errorDescription,
                isSmallMobile &&
                  styles.errorDescriptionSmall,
              ]}
            >
              {error}
            </Text>

            <View
              style={[
                styles.errorActions,
                isSmallMobile &&
                  styles.errorActionsSmall,
              ]}
            >
              <Pressable
                onPress={() =>
                  loadAppointment()
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed &&
                    styles.buttonPressed,
                  isSmallMobile &&
                    styles.primaryButtonSmall,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={
                    isSmallMobile ? 16 : 18
                  }
                  color={COLORS.white}
                />

                <Text
                  style={[
                    styles.primaryButtonText,
                    isSmallMobile &&
                      styles.primaryButtonTextSmall,
                  ]}
                >
                  Try Again
                </Text>
              </Pressable>

              <Pressable
                onPress={goToAppointments}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed &&
                    styles.buttonPressed,
                  isSmallMobile &&
                    styles.secondaryButtonSmall,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={
                    isSmallMobile ? 16 : 18
                  }
                  color={COLORS.textMedium}
                />

                <Text
                  style={[
                    styles.secondaryButtonText,
                    isSmallMobile &&
                      styles.secondaryButtonTextSmall,
                  ]}
                >
                  My Appointments
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!appointment) {
    return null;
  }

  /* =======================================================
     MAIN SCREEN
  ======================================================= */

  return (
    <View style={styles.screen}>
      {/* ===================================================
          PREMIUM BACKGROUND
      ==================================================== */}

      <View
        pointerEvents="none"
        style={styles.backgroundLayer}
      >
        <View style={styles.mainGlowOne} />
        <View style={styles.mainGlowTwo} />
        <View style={styles.mainGlowThree} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadAppointment(true)
            }
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={[
            styles.pageContainer,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.pageInner,
              {
                maxWidth: contentMaxWidth,
              },
            ]}
          >
            {/* =================================================
                HEADER
            ================================================== */}

            <View
              style={[
                styles.pageHeader,
                isSmallMobile &&
                  styles.pageHeaderSmall,
              ]}
            >
              <Pressable
                onPress={goToAppointments}
                accessibilityRole="button"
                accessibilityLabel="Back to appointments"
                style={({ pressed }) => [
                  styles.backButton,
                  isSmallMobile &&
                    styles.backButtonSmall,
                  pressed &&
                    styles.backButtonPressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={
                    isSmallMobile ? 17 : 19
                  }
                  color={COLORS.textMedium}
                />
              </Pressable>

              <View
                style={[
                  styles.headerTextBlock,
                  isSmallMobile &&
                    styles.headerTextBlockSmall,
                ]}
              >
                <View
                  style={
                    styles.breadcrumbRow
                  }
                >
                  <Text
                    style={[
                      styles.breadcrumbPrimary,
                      isSmallMobile &&
                        styles.breadcrumbPrimarySmall,
                    ]}
                  >
                    APPOINTMENT
                  </Text>

                  <View
                    style={styles.breadcrumbDot}
                  />

                  <Text
                    style={[
                      styles.breadcrumbSecondary,
                      isSmallMobile &&
                        styles.breadcrumbSecondarySmall,
                    ]}
                  >
                    BOOKING DETAILS
                  </Text>
                </View>

                <Text
                  style={[
                    styles.pageTitle,
                    isSmallMobile &&
                      styles.pageTitleSmall,
                    isMediumMobile &&
                      styles.pageTitleMedium,
                    isTablet &&
                      styles.pageTitleTablet,
                    isDesktop &&
                      styles.pageTitleDesktop,
                  ]}
                  numberOfLines={2}
                >
                  Appointment Details
                </Text>
              </View>
            </View>

            {/* =================================================
                ERROR BANNER
            ================================================== */}

            {error ? (
              <View
                style={[
                  styles.errorBanner,
                  isSmallMobile &&
                    styles.errorBannerSmall,
                ]}
              >
                <View
                  style={
                    styles.errorBannerIcon
                  }
                >
                  <Ionicons
                    name="alert-circle"
                    size={
                      isSmallMobile ? 17 : 19
                    }
                    color={COLORS.red}
                  />
                </View>

                <Text
                  style={[
                    styles.errorBannerText,
                    isSmallMobile &&
                      styles.errorBannerTextSmall,
                  ]}
                >
                  {error}
                </Text>

                <Pressable
                  onPress={() =>
                    setError("")
                  }
                  style={
                    styles.errorBannerClose
                  }
                >
                  <Ionicons
                    name="close"
                    size={17}
                    color={COLORS.red}
                  />
                </Pressable>
              </View>
            ) : null}

            {/* =================================================
                MAIN CARD
            ================================================== */}

            <View
              style={[
                styles.mainCard,
                isSmallMobile &&
                  styles.mainCardSmall,
              ]}
            >
              {/* =================================================
                  HERO
              ================================================== */}

              <View
                style={[
                  styles.hero,
                  isSmallMobile &&
                    styles.heroSmall,
                ]}
              >
                {/* Decorative layers */}

                <View
                  pointerEvents="none"
                  style={styles.heroGlowOne}
                />

                <View
                  pointerEvents="none"
                  style={styles.heroGlowTwo}
                />

                <View
                  pointerEvents="none"
                  style={styles.heroGlowThree}
                />

                <View
                  style={[
                    styles.heroContent,
                    isSmallMobile &&
                      styles.heroContentSmall,
                    isTablet &&
                      styles.heroContentTablet,
                    isDesktop &&
                      styles.heroContentDesktop,
                  ]}
                >
                  {/* =========================================
                      SERVICE INFORMATION
                  ========================================== */}

                  <View
                    style={[
                      styles.serviceHeroBlock,
                      isDesktop &&
                        styles.serviceHeroBlockDesktop,
                    ]}
                  >
                    <View
                      style={[
                        styles.serviceHeroIcon,
                        isSmallMobile &&
                          styles.serviceHeroIconSmall,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="content-cut"
                        size={
                          isSmallMobile
                            ? 23
                            : 27
                        }
                        color={COLORS.white}
                      />
                    </View>

                    <View
                      style={[
                        styles.serviceHeroText,
                        isSmallMobile &&
                          styles.serviceHeroTextSmall,
                      ]}
                    >
                      <Text
                        style={[
                          styles.heroEyebrow,
                          isSmallMobile &&
                            styles.heroEyebrowSmall,
                        ]}
                      >
                        SELECTED SERVICE
                      </Text>

                      <Text
                        style={[
                          styles.heroServiceName,
                          isSmallMobile &&
                            styles.heroServiceNameSmall,
                          isTablet &&
                            styles.heroServiceNameTablet,
                          isDesktop &&
                            styles.heroServiceNameDesktop,
                        ]}
                      >
                        {appointment.service
                          ?.name ||
                          "Salon Service"}
                      </Text>

                      <View
                        style={
                          styles.heroSalonRow
                        }
                      >
                        <Ionicons
                          name="location"
                          size={
                            isSmallMobile
                              ? 13
                              : 15
                          }
                          color="rgba(255,255,255,0.72)"
                        />

                        <Text
                          style={[
                            styles.heroSalonName,
                            isSmallMobile &&
                              styles.heroSalonNameSmall,
                          ]}
                          numberOfLines={2}
                        >
                          {appointment.salon
                            ?.name ||
                            "Salon"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* =========================================
                      STATUS
                  ========================================== */}

                  <View
                    style={[
                      styles.heroStatusWrap,
                      isDesktop &&
                        styles.heroStatusWrapDesktop,
                    ]}
                  >
                    <View
                      style={[
                        styles.heroStatus,
                        isSmallMobile &&
                          styles.heroStatusSmall,
                      ]}
                    >
                      <Ionicons
                        name={
                          statusConfig.icon
                        }
                        size={
                          isSmallMobile
                            ? 15
                            : 17
                        }
                        color={COLORS.white}
                      />

                      <Text
                        style={[
                          styles.heroStatusText,
                          isSmallMobile &&
                            styles.heroStatusTextSmall,
                        ]}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* =================================================
                  QUICK INFO
              ================================================== */}

              <View
                style={[
                  styles.quickInfoSection,
                  isSmallMobile &&
                    styles.quickInfoSectionSmall,
                ]}
              >
                <View
                  style={[
                    styles.quickInfoGrid,
                    isTablet &&
                      styles.quickInfoGridTablet,
                    isDesktop &&
                      styles.quickInfoGridDesktop,
                  ]}
                >
                  {/* DATE */}

                  <InfoCard
                    icon="calendar-outline"
                    title="DATE"
                    value={formatDate(
                      appointment.appointmentDate
                    )}
                    small={isSmallMobile}
                  />

                  {/* TIME */}

                  <InfoCard
                    icon="time-outline"
                    title="TIME"
                    value={
                      appointment.startTime
                        ? `${appointment.startTime}${
                            appointment.endTime
                              ? ` - ${appointment.endTime}`
                              : ""
                          }`
                        : "—"
                    }
                    small={isSmallMobile}
                  />

                  {/* STYLIST */}

                  <InfoCard
                    icon="person-outline"
                    title="STYLIST"
                    value={
                      appointment.staff
                        ?.name || "—"
                    }
                    small={isSmallMobile}
                  />

                  {/* LOCATION */}

                  <InfoCard
                    icon="location-outline"
                    title="LOCATION"
                    value={
                      appointment.salon
                        ?.city || "Salon"
                    }
                    small={isSmallMobile}
                  />
                </View>
              </View>

              {/* =================================================
                  BOOKING INFORMATION
              ================================================== */}

              <View
                style={[
                  styles.bookingSection,
                  isSmallMobile &&
                    styles.bookingSectionSmall,
                ]}
              >
                {/* Section heading */}

                <View
                  style={[
                    styles.sectionHeading,
                    isSmallMobile &&
                      styles.sectionHeadingSmall,
                  ]}
                >
                  <View
                    style={
                      styles.sectionHeadingText
                    }
                  >
                    <Text
                      style={[
                        styles.sectionEyebrow,
                        isSmallMobile &&
                          styles.sectionEyebrowSmall,
                      ]}
                    >
                      RESERVATION OVERVIEW
                    </Text>

                    <Text
                      style={[
                        styles.sectionTitle,
                        isSmallMobile &&
                          styles.sectionTitleSmall,
                        isTablet &&
                          styles.sectionTitleTablet,
                      ]}
                    >
                      Booking information
                    </Text>
                  </View>

                  {!isSmallMobile ? (
                    <View
                      style={
                        styles.headingLine
                      }
                    />
                  ) : null}
                </View>

                {/* Booking data */}

                <View
                  style={[
                    styles.bookingGrid,
                    isTablet &&
                      styles.bookingGridTablet,
                    isDesktop &&
                      styles.bookingGridDesktop,
                  ]}
                >
                  {/* SERVICE PRICE */}

                  <BookingInfoCard
                    icon="cash-outline"
                    title="SERVICE PRICE"
                    value={formatPrice(
                      appointment.service
                        ?.price
                    )}
                    accent="violet"
                    small={isSmallMobile}
                  />

                  {/* DURATION */}

                  <BookingInfoCard
                    icon="timer-outline"
                    title="SERVICE DURATION"
                    value={
                      appointment.service
                        ?.duration
                        ? `${appointment.service.duration} min`
                        : "—"
                    }
                    accent="fuchsia"
                    small={isSmallMobile}
                  />

                  {/* ADDRESS */}

                  <View
                    style={[
                      styles.detailPanel,
                      isSmallMobile &&
                        styles.detailPanelSmall,
                    ]}
                  >
                    <View
                      style={
                        styles.detailPanelHeader
                      }
                    >
                      <View
                        style={[
                          styles.detailPanelIcon,
                          isSmallMobile &&
                            styles.detailPanelIconSmall,
                        ]}
                      >
                        <Ionicons
                          name="location-outline"
                          size={
                            isSmallMobile
                              ? 16
                              : 18
                          }
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.detailPanelTitle,
                          isSmallMobile &&
                            styles.detailPanelTitleSmall,
                        ]}
                      >
                        SALON ADDRESS
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.detailPanelValue,
                        isSmallMobile &&
                          styles.detailPanelValueSmall,
                      ]}
                    >
                      {appointment.salon
                        ?.address ||
                        "Address unavailable"}
                    </Text>
                  </View>

                  {/* APPOINTMENT ID */}

                  <View
                    style={[
                      styles.detailPanel,
                      isSmallMobile &&
                        styles.detailPanelSmall,
                    ]}
                  >
                    <View
                      style={
                        styles.detailPanelHeader
                      }
                    >
                      <View
                        style={[
                          styles.detailPanelIcon,
                          isSmallMobile &&
                            styles.detailPanelIconSmall,
                        ]}
                      >
                        <Ionicons
                          name="finger-print-outline"
                          size={
                            isSmallMobile
                              ? 16
                              : 18
                          }
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.detailPanelTitle,
                          isSmallMobile &&
                            styles.detailPanelTitleSmall,
                        ]}
                      >
                        APPOINTMENT ID
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.appointmentId,
                        isSmallMobile &&
                          styles.appointmentIdSmall,
                      ]}
                      selectable
                    >
                      {appointment._id ||
                        "—"}
                    </Text>
                  </View>
                </View>

                {/* =================================================
                    NOTES
                ================================================== */}

                {appointment.notes ? (
                  <View
                    style={[
                      styles.notesCard,
                      isSmallMobile &&
                        styles.notesCardSmall,
                    ]}
                  >
                    <View
                      pointerEvents="none"
                      style={
                        styles.notesGlow
                      }
                    />

                    <View
                      style={
                        styles.notesContent
                      }
                    >
                      <View
                        style={
                          styles.notesHeader
                        }
                      >
                        <View
                          style={
                            styles.notesDot
                          }
                        />

                        <Text
                          style={[
                            styles.notesLabel,
                            isSmallMobile &&
                              styles.notesLabelSmall,
                          ]}
                        >
                          YOUR NOTES
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.notesText,
                          isSmallMobile &&
                            styles.notesTextSmall,
                        ]}
                      >
                        {appointment.notes}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <View
                style={[
                  styles.actionsSection,
                  isSmallMobile &&
                    styles.actionsSectionSmall,
                ]}
              >
                <View
                  style={[
                    styles.actionsContainer,
                    isSmallMobile &&
                      styles.actionsContainerSmall,
                  ]}
                >
                  <Pressable
                    onPress={
                      goToAppointments
                    }
                    style={({ pressed }) => [
                      styles.backAction,
                      isSmallMobile &&
                        styles.backActionSmall,
                      pressed &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={
                        isSmallMobile
                          ? 16
                          : 18
                      }
                      color={
                        COLORS.textMedium
                      }
                    />

                    <Text
                      style={[
                        styles.backActionText,
                        isSmallMobile &&
                          styles.backActionTextSmall,
                      ]}
                    >
                      Back to Appointments
                    </Text>
                  </Pressable>

                  {canCancel ? (
                    <Pressable
                      onPress={() =>
                        setShowCancel(true)
                      }
                      disabled={cancelling}
                      style={({
                        pressed,
                      }) => [
                        styles.cancelAction,
                        isSmallMobile &&
                          styles.cancelActionSmall,
                        pressed &&
                          styles.cancelActionPressed,
                      ]}
                    >
                      <Ionicons
                        name="close"
                        size={
                          isSmallMobile
                            ? 17
                            : 19
                        }
                        color={COLORS.white}
                      />

                      <Text
                        style={[
                          styles.cancelActionText,
                          isSmallMobile &&
                            styles.cancelActionTextSmall,
                        ]}
                      >
                        Cancel Appointment
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            {/* =================================================
                FOOTER
            ================================================== */}

            <View
              style={[
                styles.footerWrapper,
                isSmallMobile &&
                  styles.footerWrapperSmall,
              ]}
            >
              <CustomerFooter />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* =====================================================
          CANCEL MODAL
      ====================================================== */}

      <Modal
        visible={showCancel}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!cancelling) {
            setShowCancel(false);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropPress}
            onPress={() => {
              if (!cancelling) {
                setShowCancel(false);
              }
            }}
          />

          <View
            style={[
              styles.cancelModal,
              isSmallMobile &&
                styles.cancelModalSmall,
              isTablet &&
                styles.cancelModalTablet,
            ]}
          >
            {/* Accent */}

            <View
              style={
                styles.modalAccent
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalScrollContent
              }
            >
              {/* Icon */}

              <View
                style={[
                  styles.modalIcon,
                  isSmallMobile &&
                    styles.modalIconSmall,
                ]}
              >
                <Ionicons
                  name="alert-circle"
                  size={
                    isSmallMobile
                      ? 27
                      : 32
                  }
                  color={COLORS.red}
                />
              </View>

              {/* Title */}

              <Text
                style={[
                  styles.modalTitle,
                  isSmallMobile &&
                    styles.modalTitleSmall,
                ]}
              >
                Cancel appointment?
              </Text>

              <Text
                style={[
                  styles.modalDescription,
                  isSmallMobile &&
                    styles.modalDescriptionSmall,
                ]}
              >
                This will mark your appointment
                as cancelled. You can no longer
                use this booking after
                cancellation.
              </Text>

              {/* Booking summary */}

              <View
                style={[
                  styles.modalBookingCard,
                  isSmallMobile &&
                    styles.modalBookingCardSmall,
                ]}
              >
                <Text
                  style={[
                    styles.modalBookingLabel,
                    isSmallMobile &&
                      styles.modalBookingLabelSmall,
                  ]}
                >
                  BOOKING
                </Text>

                <Text
                  style={[
                    styles.modalServiceName,
                    isSmallMobile &&
                      styles.modalServiceNameSmall,
                  ]}
                  numberOfLines={2}
                >
                  {appointment.service
                    ?.name ||
                    "Salon Service"}
                </Text>

                <View
                  style={
                    styles.modalBookingMeta
                  }
                >
                  <Ionicons
                    name="calendar-outline"
                    size={
                      isSmallMobile
                        ? 14
                        : 16
                    }
                    color={
                      COLORS.textMuted
                    }
                  />

                  <Text
                    style={[
                      styles.modalBookingMetaText,
                      isSmallMobile &&
                        styles.modalBookingMetaTextSmall,
                    ]}
                    numberOfLines={2}
                  >
                    {formatDate(
                      appointment.appointmentDate
                    )}
                  </Text>
                </View>

                {appointment.startTime ? (
                  <View
                    style={
                      styles.modalBookingMeta
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={
                        isSmallMobile
                          ? 14
                          : 16
                      }
                      color={
                        COLORS.textMuted
                      }
                    />

                    <Text
                      style={[
                        styles.modalBookingMetaText,
                        isSmallMobile &&
                          styles.modalBookingMetaTextSmall,
                      ]}
                    >
                      {appointment.startTime}
                      {appointment.endTime
                        ? ` - ${appointment.endTime}`
                        : ""}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Warning */}

              <View
                style={[
                  styles.modalWarning,
                  isSmallMobile &&
                    styles.modalWarningSmall,
                ]}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={
                    isSmallMobile
                      ? 17
                      : 19
                  }
                  color={COLORS.red}
                />

                <Text
                  style={[
                    styles.modalWarningText,
                    isSmallMobile &&
                      styles.modalWarningTextSmall,
                  ]}
                >
                  Please make sure you want
                  to cancel before continuing.
                </Text>
              </View>

              {/* Actions */}

              <View
                style={[
                  styles.modalActions,
                  isSmallMobile &&
                    styles.modalActionsSmall,
                ]}
              >
                <Pressable
                  onPress={() =>
                    setShowCancel(false)
                  }
                  disabled={cancelling}
                  style={({ pressed }) => [
                    styles.keepButton,
                    isSmallMobile &&
                      styles.keepButtonSmall,
                    pressed &&
                      styles.buttonPressed,
                    cancelling &&
                      styles.disabledButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.keepButtonText,
                      isSmallMobile &&
                        styles.keepButtonTextSmall,
                    ]}
                  >
                    Keep Appointment
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleCancel}
                  disabled={cancelling}
                  style={({ pressed }) => [
                    styles.confirmCancelButton,
                    isSmallMobile &&
                      styles.confirmCancelButtonSmall,
                    pressed &&
                      styles.confirmCancelPressed,
                    cancelling &&
                      styles.disabledButton,
                  ]}
                >
                  {cancelling ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        COLORS.white
                      }
                    />
                  ) : (
                    <Ionicons
                      name="close"
                      size={
                        isSmallMobile
                          ? 17
                          : 19
                      }
                      color={
                        COLORS.white
                      }
                    />
                  )}

                  <Text
                    style={[
                      styles.confirmCancelText,
                      isSmallMobile &&
                        styles.confirmCancelTextSmall,
                    ]}
                  >
                    {cancelling
                      ? "Cancelling..."
                      : "Cancel Appointment"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/* =========================================================
   INFO CARD
========================================================= */

const InfoCard = ({
  icon,
  title,
  value,
  small = false,
}) => {
  return (
    <View
      style={[
        styles.infoCard,
        small && styles.infoCardSmall,
      ]}
    >
      <View
        style={[
          styles.infoCardIcon,
          small &&
            styles.infoCardIconSmall,
        ]}
      >
        <Ionicons
          name={icon}
          size={small ? 17 : 19}
          color={COLORS.primary}
        />
      </View>

      <Text
        style={[
          styles.infoCardLabel,
          small &&
            styles.infoCardLabelSmall,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.infoCardValue,
          small &&
            styles.infoCardValueSmall,
        ]}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
};

/* =========================================================
   BOOKING INFO CARD
========================================================= */

const BookingInfoCard = ({
  icon,
  title,
  value,
  accent = "violet",
  small = false,
}) => {
  const isFuchsia = accent === "fuchsia";

  return (
    <View
      style={[
        styles.bookingInfoCard,
        small &&
          styles.bookingInfoCardSmall,
      ]}
    >
      <View
        style={[
          styles.bookingCardGlow,
          isFuchsia &&
            styles.bookingCardGlowFuchsia,
        ]}
      />

      <View
        style={
          styles.bookingInfoCardContent
        }
      >
        <View
          style={[
            styles.bookingInfoIcon,
            isFuchsia &&
              styles.bookingInfoIconFuchsia,
            small &&
              styles.bookingInfoIconSmall,
          ]}
        >
          <Ionicons
            name={icon}
            size={small ? 17 : 20}
            color={COLORS.primary}
          />
        </View>

        <Text
          style={[
            styles.bookingInfoLabel,
            small &&
              styles.bookingInfoLabelSmall,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.bookingInfoValue,
            small &&
              styles.bookingInfoValueSmall,
          ]}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
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

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
  },

  backgroundLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },

  /* =======================================================
     BACKGROUND GLOWS
  ======================================================= */

  glowTopLeft: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    top: -140,
    left: -130,
    backgroundColor:
      "rgba(124,58,237,0.075)",
  },

  glowBottomRight: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    right: -160,
    bottom: -130,
    backgroundColor:
      "rgba(217,70,239,0.065)",
  },

  glowCenter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: "35%",
    left: "42%",
    backgroundColor:
      "rgba(196,181,253,0.045)",
  },

  errorGlowOne: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    left: -150,
    top: -100,
    backgroundColor:
      "rgba(239,68,68,0.075)",
  },

  errorGlowTwo: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    right: -160,
    bottom: -140,
    backgroundColor:
      "rgba(244,63,94,0.055)",
  },

  mainGlowOne: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    left: -210,
    top: -170,
    backgroundColor:
      "rgba(124,58,237,0.055)",
  },

  mainGlowTwo: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    right: -210,
    top: "28%",
    backgroundColor:
      "rgba(217,70,239,0.045)",
  },

  mainGlowThree: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    left: "25%",
    bottom: -170,
    backgroundColor:
      "rgba(167,139,250,0.04)",
  },

  /* =======================================================
     CENTER STATES
  ======================================================= */

  centerContent: {
    flexGrow: 1,
    minHeight: 620,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    paddingHorizontal: 38,
    paddingVertical: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor:
      "rgba(255,255,255,0.92)",

    shadowColor: "#4C1D95",
    shadowOpacity: 0.11,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    elevation: 6,
  },

  loadingCardSmall: {
    paddingHorizontal: 22,
    paddingVertical: 32,
    borderRadius: 25,
  },

  loadingCardTablet: {
    maxWidth: 500,
    paddingVertical: 48,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  loadingIconSmall: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },

  loadingTitle: {
    marginTop: 20,
    color: COLORS.textDark,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  loadingTitleSmall: {
    fontSize: 18,
    lineHeight: 23,
  },

  loadingDescription: {
    maxWidth: 350,
    marginTop: 9,
    color: COLORS.textSoft,
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  loadingDescriptionSmall: {
    fontSize: 12,
    lineHeight: 19,
  },

  loadingTrack: {
    width: 100,
    height: 6,
    marginTop: 23,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#EDE8F2",
  },

  loadingProgress: {
    width: "52%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  /* =======================================================
     ERROR STATE
  ======================================================= */

  errorCard: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
    paddingHorizontal: 38,
    paddingVertical: 42,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(254,202,202,0.8)",
    backgroundColor:
      "rgba(255,255,255,0.94)",

    shadowColor: "#7F1D1D",
    shadowOpacity: 0.09,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    elevation: 5,
  },

  errorCardSmall: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    borderRadius: 25,
  },

  errorCardTablet: {
    maxWidth: 620,
    paddingVertical: 48,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
  },

  errorIconSmall: {
    width: 58,
    height: 58,
    borderRadius: 18,
  },

  errorTitle: {
    marginTop: 20,
    color: COLORS.textDark,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  errorTitleSmall: {
    fontSize: 18,
    lineHeight: 24,
  },

  errorDescription: {
    maxWidth: 470,
    marginTop: 9,
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  errorDescriptionSmall: {
    fontSize: 12,
    lineHeight: 19,
  },

  errorActions: {
    width: "100%",
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 11,
  },

  errorActionsSmall: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  primaryButton: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  primaryButtonSmall: {
    width: "100%",
    minHeight: 45,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  primaryButtonTextSmall: {
    fontSize: 11,
  },

  secondaryButton: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  secondaryButtonSmall: {
    width: "100%",
    minHeight: 45,
  },

  secondaryButtonText: {
    color: COLORS.textMedium,
    fontSize: 12.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  secondaryButtonTextSmall: {
    fontSize: 11,
  },

  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  /* =======================================================
     PAGE
  ======================================================= */

  pageContainer: {
    width: "100%",
    paddingTop: 22,
    paddingBottom: 35,
  },

  pageInner: {
    width: "100%",
    alignSelf: "center",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  pageHeader: {
    width: "100%",
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },

  pageHeaderSmall: {
    gap: 10,
    marginBottom: 17,
  },

  backButton: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor:
      "rgba(255,255,255,0.90)",

    shadowColor: "#312033",
    shadowOpacity: 0.055,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },

  backButtonSmall: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },

  backButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },

  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  headerTextBlockSmall: {
    minWidth: 0,
  },

  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  breadcrumbPrimary: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.9,
    includeFontPadding: false,
  },

  breadcrumbPrimarySmall: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.3,
  },

  breadcrumbSecondary: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    includeFontPadding: false,
  },

  breadcrumbSecondarySmall: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 0.7,
  },

  breadcrumbDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C4B8C8",
  },

  pageTitle: {
    marginTop: 5,
    color: COLORS.textDark,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
    includeFontPadding: false,
  },

  pageTitleSmall: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 25,
    letterSpacing: -0.35,
  },

  pageTitleMedium: {
    fontSize: 24,
    lineHeight: 29,
  },

  pageTitleTablet: {
    fontSize: 34,
    lineHeight: 40,
  },

  pageTitleDesktop: {
    fontSize: 38,
    lineHeight: 44,
  },

  /* =======================================================
     ERROR BANNER
  ======================================================= */

  errorBanner: {
    width: "100%",
    minHeight: 58,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    backgroundColor:
      "rgba(254,242,242,0.92)",
  },

  errorBannerSmall: {
    minHeight: 52,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 15,
    gap: 8,
  },

  errorBannerIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  errorBannerText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.redDark,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "700",
    includeFontPadding: false,
  },

  errorBannerTextSmall: {
    fontSize: 11,
    lineHeight: 17,
  },

  errorBannerClose: {
    width: 30,
    height: 30,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  mainCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 31,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor:
      "rgba(255,255,255,0.95)",

    shadowColor: "#4C1D95",
    shadowOpacity: 0.085,
    shadowRadius: 45,
    shadowOffset: {
      width: 0,
      height: 22,
    },
    elevation: 5,
  },

  mainCardSmall: {
    borderRadius: 25,
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#6D28D9",
  },

  heroSmall: {
    minHeight: 0,
  },

  heroGlowOne: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    top: -175,
    right: -100,
    backgroundColor:
      "rgba(255,255,255,0.105)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    left: -155,
    bottom: -195,
    backgroundColor:
      "rgba(255,255,255,0.055)",
  },

  heroGlowThree: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    left: "48%",
    top: 55,
    backgroundColor:
      "rgba(217,70,239,0.12)",
  },

  heroContent: {
    position: "relative",
    minHeight: 190,
    paddingHorizontal: 29,
    paddingVertical: 31,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  heroContentSmall: {
    minHeight: 165,
    paddingHorizontal: 16,
    paddingVertical: 21,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 18,
  },

  heroContentTablet: {
    paddingHorizontal: 32,
    paddingVertical: 34,
    minHeight: 210,
  },

  heroContentDesktop: {
    minHeight: 225,
    paddingHorizontal: 39,
    paddingVertical: 39,
    gap: 35,
  },

  /* =======================================================
     SERVICE HERO
  ======================================================= */

  serviceHeroBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },

  serviceHeroBlockDesktop: {
    maxWidth: 800,
  },

  serviceHeroIcon: {
    width: 64,
    height: 64,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.22)",
    backgroundColor:
      "rgba(255,255,255,0.14)",

    shadowColor: "#2E1065",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  serviceHeroIconSmall: {
    width: 49,
    height: 49,
    borderRadius: 16,
  },

  serviceHeroText: {
    flex: 1,
    minWidth: 0,
  },

  serviceHeroTextSmall: {
    minWidth: 0,
  },

  heroEyebrow: {
    color: "rgba(255,255,255,0.61)",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.8,
    includeFontPadding: false,
  },

  heroEyebrowSmall: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.15,
  },

  heroServiceName: {
    marginTop: 5,
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  heroServiceNameSmall: {
    marginTop: 4,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  },

  heroServiceNameTablet: {
    fontSize: 29,
    lineHeight: 35,
  },

  heroServiceNameDesktop: {
    fontSize: 34,
    lineHeight: 41,
  },

  heroSalonRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    minWidth: 0,
  },

  heroSalonName: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    includeFontPadding: false,
  },

  heroSalonNameSmall: {
    fontSize: 11,
    lineHeight: 16,
  },

  /* =======================================================
     HERO STATUS
  ======================================================= */

  heroStatusWrap: {
    flexShrink: 0,
    alignItems: "flex-end",
  },

  heroStatusWrapDesktop: {
    alignSelf: "center",
  },

  heroStatus: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.23)",
    backgroundColor:
      "rgba(255,255,255,0.14)",
  },

  heroStatusSmall: {
    minHeight: 37,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    gap: 6,
  },

  heroStatusText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    includeFontPadding: false,
  },

  heroStatusTextSmall: {
    fontSize: 8.5,
    lineHeight: 11,
    letterSpacing: 0.8,
  },

  /* =======================================================
     QUICK INFO
  ======================================================= */

  quickInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    backgroundColor: "#FCFBFD",
  },

  quickInfoSectionSmall: {
    padding: 12,
  },

  quickInfoGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  quickInfoGridTablet: {
    gap: 14,
  },

  quickInfoGridDesktop: {
    gap: 15,
  },

  infoCard: {
    width: "48.7%",
    minHeight: 145,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,

    shadowColor: "#312033",
    shadowOpacity: 0.035,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 1,
  },

  infoCardSmall: {
    width: "100%",
    minHeight: 119,
    padding: 13,
    borderRadius: 18,
  },

  infoCardIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  infoCardIconSmall: {
    width: 35,
    height: 35,
    borderRadius: 11,
  },

  infoCardLabel: {
    marginTop: 15,
    color: COLORS.textMuted,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.45,
    includeFontPadding: false,
  },

  infoCardLabelSmall: {
    marginTop: 10,
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1,
  },

  infoCardValue: {
    marginTop: 5,
    color: COLORS.textDark,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    includeFontPadding: false,
  },

  infoCardValueSmall: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
  },

  /* =======================================================
     BOOKING SECTION
  ======================================================= */

  bookingSection: {
    paddingHorizontal: 29,
    paddingTop: 29,
    paddingBottom: 31,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    backgroundColor: COLORS.white,
  },

  bookingSectionSmall: {
    paddingHorizontal: 15,
    paddingTop: 22,
    paddingBottom: 23,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 18,
  },

  sectionHeadingSmall: {
    gap: 0,
  },

  sectionHeadingText: {
    minWidth: 0,
  },

  sectionEyebrow: {
    color: COLORS.primary,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.65,
    includeFontPadding: false,
  },

  sectionEyebrowSmall: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.1,
  },

  sectionTitle: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  sectionTitleSmall: {
    fontSize: 19,
    lineHeight: 24,
  },

  sectionTitleTablet: {
    fontSize: 27,
    lineHeight: 33,
  },

  headingLine: {
    flex: 1,
    height: 1,
    marginBottom: 7,
    backgroundColor: COLORS.violetBorder,
  },

  /* =======================================================
     BOOKING GRID
  ======================================================= */

  bookingGrid: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },

  bookingGridTablet: {
    gap: 16,
  },

  bookingGridDesktop: {
    gap: 17,
  },

  /* =======================================================
     BOOKING INFO CARD
  ======================================================= */

  bookingInfoCard: {
    position: "relative",
    width: "48.7%",
    minHeight: 147,
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FCFBFD",
  },

  bookingInfoCardSmall: {
    width: "100%",
    minHeight: 125,
    borderRadius: 18,
  },

  bookingCardGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    right: -40,
    top: -40,
    backgroundColor:
      "rgba(124,58,237,0.09)",
  },

  bookingCardGlowFuchsia: {
    backgroundColor:
      "rgba(217,70,239,0.085)",
  },

  bookingInfoCardContent: {
    position: "relative",
    padding: 16,
  },

  bookingInfoIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  bookingInfoIconFuchsia: {
    backgroundColor: "#FDF1FF",
    borderColor: "#F5D0FE",
  },

  bookingInfoIconSmall: {
    width: 35,
    height: 35,
    borderRadius: 11,
  },

  bookingInfoLabel: {
    marginTop: 14,
    color: COLORS.textMuted,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.35,
    includeFontPadding: false,
  },

  bookingInfoLabelSmall: {
    marginTop: 10,
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.9,
  },

  bookingInfoValue: {
    marginTop: 5,
    color: COLORS.textDark,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.4,
    includeFontPadding: false,
  },

  bookingInfoValueSmall: {
    fontSize: 18,
    lineHeight: 23,
  },

  /* =======================================================
     DETAIL PANELS
  ======================================================= */

  detailPanel: {
    width: "48.7%",
    minHeight: 147,
    padding: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F9FAFB",
  },

  detailPanelSmall: {
    width: "100%",
    minHeight: 125,
    padding: 13,
    borderRadius: 18,
  },

  detailPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  detailPanelIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  detailPanelIconSmall: {
    width: 31,
    height: 31,
    borderRadius: 10,
  },

  detailPanelTitle: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    includeFontPadding: false,
  },

  detailPanelTitleSmall: {
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.85,
  },

  detailPanelValue: {
    marginTop: 14,
    color: COLORS.textMedium,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "700",
    includeFontPadding: false,
  },

  detailPanelValueSmall: {
    marginTop: 10,
    fontSize: 11.5,
    lineHeight: 18,
  },

  appointmentId: {
    marginTop: 14,
    color: "#59616E",
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: "800",
    includeFontPadding: false,
  },

  appointmentIdSmall: {
    marginTop: 10,
    fontSize: 9.5,
    lineHeight: 15,
  },

  /* =======================================================
     NOTES
  ======================================================= */

  notesCard: {
    position: "relative",
    overflow: "hidden",
    marginTop: 15,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
    backgroundColor: "#F8F5FF",
  },

  notesCardSmall: {
    marginTop: 13,
    borderRadius: 18,
  },

  notesGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -85,
    top: -100,
    backgroundColor:
      "rgba(167,139,250,0.16)",
  },

  notesContent: {
    position: "relative",
    padding: 17,
  },

  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  notesDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  notesLabel: {
    color: COLORS.primary,
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    includeFontPadding: false,
  },

  notesLabelSmall: {
    fontSize: 8,
    lineHeight: 10,
    letterSpacing: 0.9,
  },

  notesText: {
    marginTop: 11,
    color: "#3B2460",
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: "600",
    includeFontPadding: false,
  },

  notesTextSmall: {
    marginTop: 9,
    fontSize: 11.5,
    lineHeight: 19,
  },

  /* =======================================================
     ACTIONS
  ======================================================= */

  actionsSection: {
    paddingHorizontal: 29,
    paddingVertical: 24,
    backgroundColor: "#FCFBFD",
  },

  actionsSectionSmall: {
    paddingHorizontal: 15,
    paddingVertical: 17,
  },

  actionsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 11,
  },

  actionsContainerSmall: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  backAction: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  backActionSmall: {
    width: "100%",
    minHeight: 46,
  },

  backActionText: {
    color: COLORS.textMedium,
    fontSize: 12.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  backActionTextSmall: {
    fontSize: 11,
  },

  cancelAction: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 21,
    borderRadius: 16,
    backgroundColor: COLORS.red,

    shadowColor: COLORS.red,
    shadowOpacity: 0.20,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 4,
  },

  cancelActionSmall: {
    width: "100%",
    minHeight: 46,
  },

  cancelActionPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  cancelActionText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  cancelActionTextSmall: {
    fontSize: 11,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footerWrapper: {
    width: "100%",
    marginTop: 2,
  },

  footerWrapperSmall: {
    marginTop: 0,
  },

  /* =======================================================
     MODAL
  ======================================================= */

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
    backgroundColor:
      "rgba(15,23,42,0.62)",
  },

  modalBackdropPress: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  cancelModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90%",
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: COLORS.white,

    shadowColor: "#000000",
    shadowOpacity: 0.30,
    shadowRadius: 45,
    shadowOffset: {
      width: 0,
      height: 22,
    },
    elevation: 15,
  },

  cancelModalSmall: {
    maxHeight: "92%",
    borderRadius: 24,
  },

  cancelModalTablet: {
    maxWidth: 570,
  },

  modalAccent: {
    width: "100%",
    height: 5,
    backgroundColor: COLORS.red,
  },

  modalScrollContent: {
    padding: 22,
    paddingBottom: 25,
  },

  modalIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
  },

  modalIconSmall: {
    width: 52,
    height: 52,
    borderRadius: 17,
  },

  modalTitle: {
    marginTop: 18,
    color: COLORS.textDark,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  modalTitleSmall: {
    marginTop: 15,
    fontSize: 19,
    lineHeight: 24,
  },

  modalDescription: {
    marginTop: 9,
    color: COLORS.textSoft,
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: "500",
    includeFontPadding: false,
  },

  modalDescriptionSmall: {
    fontSize: 11.5,
    lineHeight: 18,
  },

  /* =======================================================
     MODAL BOOKING
  ======================================================= */

  modalBookingCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
  },

  modalBookingCardSmall: {
    marginTop: 15,
    padding: 13,
    borderRadius: 16,
  },

  modalBookingLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.3,
    includeFontPadding: false,
  },

  modalBookingLabelSmall: {
    fontSize: 7.5,
    lineHeight: 10,
    letterSpacing: 0.9,
  },

  modalServiceName: {
    marginTop: 5,
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    includeFontPadding: false,
  },

  modalServiceNameSmall: {
    fontSize: 12.5,
    lineHeight: 17,
  },

  modalBookingMeta: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  modalBookingMetaText: {
    flex: 1,
    color: COLORS.textSoft,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "600",
    includeFontPadding: false,
  },

  modalBookingMetaTextSmall: {
    fontSize: 10,
    lineHeight: 15,
  },

  /* =======================================================
     MODAL WARNING
  ======================================================= */

  modalWarning: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 13,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  modalWarningSmall: {
    marginTop: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
  },

  modalWarningText: {
    flex: 1,
    color: COLORS.redDark,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "700",
    includeFontPadding: false,
  },

  modalWarningTextSmall: {
    fontSize: 9.5,
    lineHeight: 15,
  },

  /* =======================================================
     MODAL ACTIONS
  ======================================================= */

  modalActions: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },

  modalActionsSmall: {
    flexDirection: "column",
    gap: 9,
    marginTop: 17,
  },

  keepButton: {
    flex: 1,
    minHeight: 49,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  keepButtonSmall: {
    width: "100%",
    minHeight: 45,
  },

  keepButtonText: {
    color: COLORS.textMedium,
    fontSize: 11.5,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  keepButtonTextSmall: {
    fontSize: 10.5,
  },

  confirmCancelButton: {
    flex: 1,
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: COLORS.red,

    shadowColor: COLORS.red,
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  confirmCancelButtonSmall: {
    width: "100%",
    minHeight: 45,
  },

  confirmCancelPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  confirmCancelText: {
    color: COLORS.white,
    fontSize: 11.5,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  confirmCancelTextSmall: {
    fontSize: 10.5,
  },

  disabledButton: {
    opacity: 0.55,
  },
});

export default CustomerAppointmentDetails;