import React, { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { useRouter } from "expo-router";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  cancelCustomerAppointment,
  getCustomerAppointments,
} from "../../../../services/CustomerAppointmentService";

import CustomerReviewModal from "../../../../components/customers/CustomerReviewModal";
import CustomerFooter from "../../../../components/customers/CustomerFooter";

const COLORS = {
  background: "#F8F6FA",
  surface: "#FFFFFF",
  white: "#FFFFFF",

  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  primarySoft: "#F3E8FF",

  text: "#17121B",
  textDark: "#211827",
  textMedium: "#5E5262",
  textSoft: "#7D7181",
  textMuted: "#A197A5",

  border: "#E9E2EC",
  borderSoft: "#F1ECF3",

  green: "#16A34A",
  greenSoft: "#F0FDF4",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
  red: "#DC2626",
  redSoft: "#FEF2F2",
  slateSoft: "#F1F3F5",
};

const FILTERS = [
  ["ALL", "All"],
  ["PENDING", "Pending"],
  ["CONFIRMED", "Confirmed"],
  ["COMPLETED", "Completed"],
  ["CANCELLED", "Cancelled"],
];

const CustomerMyAppointments = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [cancelId, setCancelId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [reviewAppointment, setReviewAppointment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewedAppointments, setReviewedAppointments] = useState({});

  /*
   * RESPONSIVE BREAKPOINTS
   * <360    small mobile
   * 360-767 mobile
   * 768-999 tablet
   * >=1000  desktop / laptop
   *
   * Two appointment columns intentionally start at 1000px.
   * This prevents narrow tablet cards from wrapping/overlapping.
   */
  const isSmallMobile = width < 360;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1000;
  const isDesktop = width >= 1000;

  const horizontalPadding = isSmallMobile
    ? 12
    : isMobile
      ? 18
      : isTablet
        ? 28
        : 40;

  const contentMaxWidth = 1500;
  const twoColumn = isDesktop;

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerAppointments();

      setAppointments(
        Array.isArray(data?.appointments) ? data.appointments : []
      );
    } catch (err) {
      console.error("Appointments error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to load your appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === "ALL") return appointments;

    return appointments.filter(
      (appointment) => appointment.status === filter
    );
  }, [appointments, filter]);

  const getFilterCount = (filterValue) => {
    if (filterValue === "ALL") return appointments.length;

    return appointments.filter(
      (appointment) => appointment.status === filterValue
    ).length;
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          background: COLORS.greenSoft,
          border: "#BBF7D0",
          text: "#15803D",
          icon: "checkmark-circle",
        };

      case "COMPLETED":
        return {
          background: COLORS.blueSoft,
          border: "#BFDBFE",
          text: "#1D4ED8",
          icon: "checkmark-done-circle",
        };

      case "CANCELLED":
        return {
          background: COLORS.slateSoft,
          border: "#DDE1E5",
          text: "#64748B",
          icon: "close-circle",
        };

      case "REJECTED":
        return {
          background: COLORS.redSoft,
          border: "#FECACA",
          text: "#B91C1C",
          icon: "alert-circle",
        };

      default:
        return {
          background: COLORS.amberSoft,
          border: "#FDE68A",
          text: "#B45309",
          icon: "time",
        };
    }
  };

  const canCancel = (appointment) =>
    !["COMPLETED", "CANCELLED", "REJECTED"].includes(
      appointment.status
    );

  const handleCancel = async () => {
    if (!cancelId) return;

    try {
      setCancelling(true);
      setError("");

      await cancelCustomerAppointment(cancelId);

      setAppointments((previous) =>
        previous.map((appointment) =>
          (appointment._id || appointment.id) === cancelId
            ? { ...appointment, status: "CANCELLED" }
            : appointment
        )
      );

      setCancelId(null);
    } catch (err) {
      console.error("Cancel error:", err);
      setError(
        err?.response?.data?.message ||
          "Unable to cancel appointment."
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReview = (appointment) => {
    setReviewAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleCloseReview = () => {
    if (cancelling) return;

    setShowReviewModal(false);
    setReviewAppointment(null);
  };

  const handleReviewSuccess = () => {
    if (!reviewAppointment) return;

    const appointmentId =
      reviewAppointment._id || reviewAppointment.id;

    if (appointmentId) {
      setReviewedAppointments((previous) => ({
        ...previous,
        [appointmentId]: true,
      }));
    }

    setError("");
  };

  const handleBookNew = () => {
    router.push("/customer/salons");
  };

  const handleViewDetails = (appointment) => {
    const appointmentId = appointment._id || appointment.id;
    if (!appointmentId) return;

    router.push(`/customer/appointments/${appointmentId}`);
  };

  const renderAppointmentCard = (appointment) => {
    const appointmentId = appointment._id || appointment.id;
    const hasBeenReviewed = !!reviewedAppointments[appointmentId];
    const statusConfig = getStatusConfig(appointment.status);

    return (
      <View
        key={appointmentId}
        style={[
          styles.appointmentCard,
          twoColumn && styles.appointmentCardTwoColumn,
        ]}
      >
        <View style={styles.cardTopAccent} />

        {/* CARD HEADER */}
        <View style={[styles.cardHeader, isMobile && styles.cardHeaderMobile]}>
          <View
            style={[
              styles.serviceIcon,
              isSmallMobile && styles.serviceIconSmall,
            ]}
          >
            <MaterialCommunityIcons
              name="content-cut"
              size={isSmallMobile ? 20 : 24}
              color={COLORS.primary}
            />
            <View style={styles.iconDot} />
          </View>

          <View
            style={[
              styles.serviceInfo,
              isMobile && styles.serviceInfoMobile,
            ]}
          >
            <Text
              style={[
                styles.serviceTitle,
                isSmallMobile && styles.serviceTitleSmall,
              ]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {appointment.service?.name || "Salon Service"}
            </Text>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={13}
                color={COLORS.primary}
              />
              <Text
                style={styles.locationText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {appointment.salon?.name || "Salon"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isMobile && styles.statusBadgeMobile,
              {
                backgroundColor: statusConfig.background,
                borderColor: statusConfig.border,
              },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={11}
              color={statusConfig.text}
            />
            <Text
              style={[styles.statusText, { color: statusConfig.text }]}
              numberOfLines={1}
            >
              {appointment.status || "PENDING"}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <View
          style={[
            styles.detailsGrid,
            isMobile && styles.detailsGridMobile,
          ]}
        >
          <View style={styles.detailBox}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.detailLabel}>DATE</Text>
            <Text
              style={styles.detailValue}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {formatDate(appointment.appointmentDate)}
            </Text>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="time-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.detailLabel}>TIME</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {appointment.startTime || "Time unavailable"}
            </Text>
          </View>

          <View style={styles.detailBox}>
            <View style={styles.detailIcon}>
              <Ionicons
                name="person-outline"
                size={16}
                color={COLORS.primary}
              />
            </View>
            <Text style={styles.detailLabel}>STYLIST</Text>
            <Text
              style={styles.detailValue}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {appointment.staff?.name || "Not assigned"}
            </Text>
          </View>
        </View>

        {/* APPOINTMENT ID */}
        <View style={styles.idSection}>
          <View style={styles.idLabelRow}>
            <Ionicons
              name="finger-print-outline"
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={styles.idLabel}>APPOINTMENT ID</Text>
          </View>

          <Text
            style={styles.idText}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            {appointmentId || "ID unavailable"}
          </Text>
        </View>

        {/* ACTIONS */}
        <View
          style={[
            styles.actionsSection,
            isMobile && styles.actionsSectionMobile,
          ]}
        >
          {appointment.status === "COMPLETED" ? (
            hasBeenReviewed ? (
              <View style={styles.reviewedButton}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={COLORS.green}
                />
                <Text style={styles.reviewedButtonText} numberOfLines={1}>
                  Review Submitted
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={() => handleOpenReview(appointment)}
                style={({ pressed }) => [
                  styles.reviewButton,
                  pressed && styles.reviewButtonPressed,
                ]}
              >
                <Ionicons name="star" size={15} color={COLORS.white} />
                <Text style={styles.reviewButtonText} numberOfLines={1}>
                  Write Review
                </Text>
              </Pressable>
            )
          ) : null}

          {canCancel(appointment) ? (
            <Pressable
              onPress={() => setCancelId(appointmentId)}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.cancelButtonPressed,
              ]}
            >
              <Ionicons name="close" size={16} color={COLORS.red} />
              <Text style={styles.cancelButtonText} numberOfLines={1}>
                Cancel
              </Text>
            </Pressable>
          ) : null}

          <Pressable
            onPress={() => handleViewDetails(appointment)}
            style={({ pressed }) => [
              styles.detailsButton,
              pressed && styles.detailsButtonPressed,
            ]}
          >
            <Text style={styles.detailsButtonText} numberOfLines={1}>
              View Details
            </Text>
            <Ionicons
              name="arrow-forward"
              size={15}
              color={COLORS.white}
            />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View pointerEvents="none" style={styles.backgroundDecor}>
        <View style={styles.backgroundGlowOne} />
        <View style={styles.backgroundGlowTwo} />
        <View style={styles.backgroundGlowThree} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.main,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View
            style={[
              styles.mainInner,
              { maxWidth: contentMaxWidth },
            ]}
          >
            {/* PAGE HEADER */}
            <View
              style={[
                styles.headerSection,
                isMobile && styles.headerSectionMobile,
              ]}
            >
              <View style={styles.headerContent}>
                <View style={styles.dashboardBadge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.dashboardBadgeText} numberOfLines={1}>
                    CUSTOMER DASHBOARD
                  </Text>
                </View>

                <Text
                  style={[
                    styles.pageTitle,
                    isMobile && styles.pageTitleMobile,
                    isSmallMobile && styles.pageTitleSmall,
                    isTablet && styles.pageTitleTablet,
                    isDesktop && styles.pageTitleDesktop,
                  ]}
                  numberOfLines={isMobile ? 2 : 1}
                  adjustsFontSizeToFit={!isMobile}
                  minimumFontScale={0.9}
                >
                  My Appointments
                </Text>

                <Text
                  style={[
                    styles.pageDescription,
                    isMobile && styles.pageDescriptionMobile,
                    isDesktop && styles.pageDescriptionDesktop,
                  ]}
                >
                  Track your salon bookings, appointment status and upcoming visits.
                </Text>
              </View>

              <Pressable
                onPress={handleBookNew}
                style={({ pressed }) => [
                  styles.bookButton,
                  isMobile && styles.bookButtonMobile,
                  pressed && styles.bookButtonPressed,
                ]}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.bookButtonText} numberOfLines={1}>
                  Book a new appointment
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={COLORS.white}
                />
              </Pressable>
            </View>

            {/* FILTERS */}
            <View style={styles.filterPanel}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
                bounces={false}
              >
                {FILTERS.map(([value, label]) => {
                  const active = filter === value;
                  const count = getFilterCount(value);

                  return (
                    <Pressable
                      key={value}
                      onPress={() => setFilter(value)}
                      style={({ pressed }) => [
                        styles.filterButton,
                        active && styles.filterButtonActive,
                        pressed && styles.filterButtonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          active && styles.filterTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Text>

                      <View
                        style={[
                          styles.filterCount,
                          active && styles.filterCountActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterCountText,
                            active && styles.filterCountTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* ERROR */}
            {error ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorBannerIcon}>
                  <Ionicons
                    name="alert-circle"
                    size={19}
                    color={COLORS.red}
                  />
                </View>

                <Text style={styles.errorBannerText}>{error}</Text>

                <Pressable
                  onPress={loadAppointments}
                  style={({ pressed }) => [
                    styles.errorRetryButton,
                    pressed && styles.errorRetryPressed,
                  ]}
                >
                  <Ionicons
                    name="refresh"
                    size={15}
                    color={COLORS.red}
                  />
                  <Text style={styles.errorRetryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}

            {/* RESULTS HEADER */}
            {!loading && filteredAppointments.length > 0 ? (
              <View
                style={[
                  styles.resultsHeader,
                  isMobile && styles.resultsHeaderMobile,
                ]}
              >
                <View style={styles.resultsTitleBlock}>
                  <Text style={styles.resultsEyebrow}>
                    BOOKING ACTIVITY
                  </Text>
                  <Text
                    style={[
                      styles.resultsTitle,
                      isMobile && styles.resultsTitleMobile,
                    ]}
                  >
                    Your appointments
                  </Text>
                </View>

                <View style={styles.resultsPill}>
                  <View style={styles.resultsPillDot} />
                  <Text style={styles.resultsPillText} numberOfLines={1}>
                    {filteredAppointments.length} appointment
                    {filteredAppointments.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* CONTENT */}
            {loading ? (
              <View style={styles.loadingCard}>
                <View style={styles.loadingAccent} />
                <View style={styles.loadingIcon}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.loadingTitle}>
                  Loading your appointments...
                </Text>
                <Text style={styles.loadingSubtitle}>
                  Please wait while we fetch your latest bookings.
                </Text>
              </View>
            ) : filteredAppointments.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyAccent} />

                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={isSmallMobile ? 29 : 34}
                    color={COLORS.primary}
                  />
                </View>

                <Text style={styles.emptyTitle} numberOfLines={2}>
                  No appointments found
                </Text>

                <Text style={styles.emptyDescription}>
                  You don't have any appointments in this category yet.
                </Text>

                <Pressable
                  onPress={handleBookNew}
                  style={({ pressed }) => [
                    styles.emptyButton,
                    pressed && styles.emptyButtonPressed,
                  ]}
                >
                  <Ionicons
                    name="search"
                    size={16}
                    color={COLORS.white}
                  />
                  <Text style={styles.emptyButtonText} numberOfLines={1}>
                    Explore Salons
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>
            ) : (
              <View
                style={[
                  styles.appointmentGrid,
                  twoColumn && styles.appointmentGridTwoColumn,
                ]}
              >
                {filteredAppointments.map(renderAppointmentCard)}
              </View>
            )}

            {/* FOOTER
                Footer stays inside the same vertical ScrollView,
                after all page content. */}
            <View style={styles.footerWrap}>
              <CustomerFooter />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CANCEL MODAL */}
      <Modal
        visible={!!cancelId}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!cancelling) setCancelId(null);
        }}
      >
        <View style={styles.cancelOverlay}>
          <Pressable
            style={styles.cancelBackdrop}
            onPress={() => {
              if (!cancelling) setCancelId(null);
            }}
          />

          <View
            style={[
              styles.cancelModal,
              {
                width: Math.min(
                  Math.max(width - horizontalPadding * 2, 260),
                  460
                ),
              },
            ]}
          >
            <View style={styles.cancelAccent} />

            <View style={styles.cancelIcon}>
              <Ionicons
                name="warning-outline"
                size={28}
                color={COLORS.red}
              />
            </View>

            <Text style={styles.cancelTitle}>
              Cancel appointment?
            </Text>

            <Text style={styles.cancelDescription}>
              Are you sure you want to cancel this appointment? This action will change its status to cancelled.
            </Text>

            <View
              style={[
                styles.cancelActions,
                isMobile && styles.cancelActionsMobile,
              ]}
            >
              <Pressable
                onPress={() => setCancelId(null)}
                disabled={cancelling}
                style={({ pressed }) => [
                  styles.keepButton,
                  pressed && styles.keepButtonPressed,
                  cancelling && styles.disabledButton,
                ]}
              >
                <Text style={styles.keepButtonText} numberOfLines={1}>
                  Keep Appointment
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCancel}
                disabled={cancelling}
                style={({ pressed }) => [
                  styles.confirmCancelButton,
                  pressed && styles.confirmCancelPressed,
                  cancelling && styles.disabledButton,
                ]}
              >
                {cancelling ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Ionicons
                    name="close-circle-outline"
                    size={17}
                    color={COLORS.white}
                  />
                )}

                <Text
                  style={styles.confirmCancelText}
                  numberOfLines={1}
                >
                  {cancelling ? "Cancelling..." : "Yes, Cancel"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <CustomerReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReview}
        appointment={reviewAppointment}
        onSuccess={handleReviewSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  backgroundGlowOne: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    top: -220,
    left: -170,
    backgroundColor: "rgba(124,58,237,0.075)",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: 320,
    right: -250,
    backgroundColor: "rgba(217,70,239,0.045)",
  },

  backgroundGlowThree: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    bottom: -180,
    left: "30%",
    backgroundColor: "rgba(139,92,246,0.045)",
  },

  main: {
    width: "100%",
    paddingTop: 28,
    paddingBottom: 0,
  },

  mainInner: {
    width: "100%",
    alignSelf: "center",
  },

  /* PAGE HEADER */
  headerSection: {
    width: "100%",
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
  },

  headerSectionMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 16,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  dashboardBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD4E6",
    backgroundColor: "rgba(255,255,255,0.9)",
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  dashboardBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.35,
    includeFontPadding: false,
  },

  pageTitle: {
    width: "100%",
    marginTop: 15,
    color: COLORS.textDark,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.7,
    includeFontPadding: false,
  },

  pageTitleMobile: {
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1.15,
  },

  pageTitleSmall: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -1,
  },

  pageTitleTablet: {
    fontSize: 50,
    lineHeight: 56,
    letterSpacing: -2,
  },

  pageTitleDesktop: {
    fontSize: 62,
    lineHeight: 67,
    letterSpacing: -2.6,
  },

  pageDescription: {
    width: "100%",
    maxWidth: 680,
    marginTop: 9,
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    includeFontPadding: false,
  },

  pageDescriptionMobile: {
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 560,
  },

  pageDescriptionDesktop: {
    fontSize: 16,
    lineHeight: 25,
  },

  bookButton: {
    minHeight: 50,
    maxWidth: 320,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 19,
    borderRadius: 16,
    backgroundColor: COLORS.textDark,
    shadowColor: COLORS.textDark,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },

  bookButtonMobile: {
    width: "100%",
    maxWidth: "100%",
    minHeight: 46,
  },

  bookButtonText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "900",
    includeFontPadding: false,
  },

  bookButtonPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: COLORS.primary,
  },

  /* FILTERS */
  filterPanel: {
    width: "100%",
    minHeight: 57,
    padding: 6,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#37243B",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  filterScrollContent: {
    alignItems: "center",
    gap: 4,
    paddingRight: 4,
  },

  filterButton: {
    minHeight: 43,
    minWidth: 86,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: 13,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  filterButtonPressed: {
    opacity: 0.82,
  },

  filterText: {
    color: COLORS.textSoft,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "900",
    includeFontPadding: false,
  },

  filterTextActive: {
    color: COLORS.white,
  },

  filterCount: {
    minWidth: 21,
    height: 21,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    borderRadius: 999,
    backgroundColor: "#F0EDF2",
  },

  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  filterCountText: {
    color: COLORS.textSoft,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    includeFontPadding: false,
  },

  filterCountTextActive: {
    color: COLORS.white,
  },

  /* ERROR */
  errorBanner: {
    marginTop: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "rgba(254,242,242,0.96)",
  },

  errorBannerIcon: {
    width: 35,
    height: 35,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: COLORS.white,
  },

  errorBannerText: {
    flex: 1,
    minWidth: 0,
    color: "#B91C1C",
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "700",
    includeFontPadding: false,
  },

  errorRetryButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
  },

  errorRetryText: {
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "900",
    includeFontPadding: false,
  },

  errorRetryPressed: {
    opacity: 0.7,
  },

  /* RESULTS */
  resultsHeader: {
    width: "100%",
    marginTop: 28,
    marginBottom: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 15,
  },

  resultsHeaderMobile: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
  },

  resultsTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  resultsEyebrow: {
    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    includeFontPadding: false,
  },

  resultsTitle: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    includeFontPadding: false,
  },

  resultsTitleMobile: {
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.65,
  },

  resultsPill: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  resultsPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  resultsPillText: {
    color: COLORS.textSoft,
    fontSize: 9.5,
    fontWeight: "800",
    includeFontPadding: false,
  },

  /* LOADING / EMPTY */
  loadingCard: {
    position: "relative",
    width: "100%",
    minHeight: 300,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 45,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  loadingAccent: {
    position: "absolute",
    top: 0,
    left: "25%",
    right: "25%",
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.primary,
  },

  loadingIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: COLORS.primarySoft,
  },

  loadingTitle: {
    marginTop: 16,
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  loadingSubtitle: {
    maxWidth: 420,
    marginTop: 6,
    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 17,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  emptyCard: {
    position: "relative",
    width: "100%",
    minHeight: 340,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 50,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#37243B",
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },

  emptyAccent: {
    position: "absolute",
    top: 0,
    width: 120,
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.primary,
  },

  emptyIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: COLORS.primarySoft,
  },

  emptyTitle: {
    maxWidth: "100%",
    marginTop: 17,
    color: COLORS.textDark,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  emptyDescription: {
    maxWidth: 440,
    marginTop: 7,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  emptyButton: {
    marginTop: 20,
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },

  emptyButtonText: {
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  emptyButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.86,
  },

  /* APPOINTMENTS */
  appointmentGrid: {
    width: "100%",
    marginTop: 20,
    gap: 16,
  },

  appointmentGridTwoColumn: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 18,
  },

  appointmentCard: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#37243B",
    shadowOpacity: 0.055,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  appointmentCardTwoColumn: {
    width: "49.15%",
  },

  cardTopAccent: {
    height: 3,
    backgroundColor: COLORS.primary,
  },

  cardHeader: {
    minHeight: 92,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  cardHeaderMobile: {
    minHeight: 86,
    paddingHorizontal: 13,
    paddingTop: 15,
    paddingBottom: 14,
    gap: 9,
  },

  serviceIcon: {
    position: "relative",
    width: 50,
    height: 50,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: COLORS.primarySoft,
  },

  serviceIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },

  iconDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    right: -2,
    top: -2,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.white,
  },

  serviceInfo: {
    flex: 1,
    minWidth: 0,
  },

  serviceInfoMobile: {
    paddingRight: 72,
  },

  serviceTitle: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.2,
    includeFontPadding: false,
  },

  serviceTitleSmall: {
    fontSize: 12.5,
    lineHeight: 17,
    letterSpacing: -0.15,
  },

  locationRow: {
    width: "100%",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  locationText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.textSoft,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "600",
    includeFontPadding: false,
  },

  statusBadge: {
    flexShrink: 0,
    maxWidth: 120,
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusBadgeMobile: {
    position: "absolute",
    top: 15,
    right: 14,
    maxWidth: 84,
    minHeight: 26,
    paddingHorizontal: 7,
  },

  statusText: {
    maxWidth: 88,
    color: COLORS.textMedium,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.35,
    textAlign: "center",
    includeFontPadding: false,
  },

  /* DETAILS */
  detailsGrid: {
    width: "100%",
    padding: 13,
    flexDirection: "row",
    gap: 8,
  },

  detailsGridMobile: {
    padding: 10,
    gap: 7,
  },

  detailBox: {
    flex: 1,
    minWidth: 0,
    minHeight: 112,
    padding: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEE9F0",
    backgroundColor: "#FCFBFD",
  },

  detailIcon: {
    width: 33,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
  },

  detailLabel: {
    marginTop: 9,
    color: COLORS.textMuted,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.05,
    includeFontPadding: false,
  },

  detailValue: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    includeFontPadding: false,
  },

  /* ID */
  idSection: {
    marginHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 12,
    paddingHorizontal: 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  idLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  idLabel: {
    color: COLORS.textMuted,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  idText: {
    marginTop: 4,
    color: "#7B7180",
    fontSize: 8.5,
    lineHeight: 13,
    fontWeight: "700",
    fontFamily: Platform.OS === "android" ? "monospace" : undefined,
  },

  /* ACTIONS */
  actionsSection: {
    minHeight: 61,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 7,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
  },

  actionsSectionMobile: {
    minHeight: 0,
    padding: 10,
    flexWrap: "wrap",
    justifyContent: "stretch",
  },

  reviewButton: {
    minHeight: 40,
    flex: 1,
    minWidth: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  reviewedButton: {
    minHeight: 40,
    flex: 1,
    minWidth: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    backgroundColor: COLORS.greenSoft,
  },

  cancelButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redSoft,
  },

  detailsButton: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 13,
    borderRadius: 12,
    backgroundColor: COLORS.textDark,
  },

  reviewButtonText: {
    color: COLORS.white,
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  reviewedButtonText: {
    color: COLORS.green,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    includeFontPadding: false,
  },

  cancelButtonText: {
    color: COLORS.red,
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  detailsButtonText: {
    color: COLORS.white,
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  reviewButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.85,
  },

  cancelButtonPressed: {
    backgroundColor: "#FEE2E2",
    transform: [{ scale: 0.98 }],
  },

  detailsButtonPressed: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 0.98 }],
  },

  /* FOOTER */
  footerWrap: {
    width: "100%",
    marginTop: 48,
    paddingTop: 0,
    paddingBottom: 0,
    overflow: "hidden",
  },

  /* CANCEL MODAL */
  cancelOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,10,20,0.66)",
  },

  cancelModal: {
    position: "relative",
    overflow: "hidden",
    padding: 24,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: COLORS.white,
    shadowColor: "#130A18",
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },

  cancelAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.red,
  },

  cancelIcon: {
    width: 59,
    height: 59,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: COLORS.redSoft,
  },

  cancelTitle: {
    marginTop: 18,
    color: COLORS.textDark,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  cancelDescription: {
    marginTop: 8,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    includeFontPadding: false,
  },

  cancelActions: {
    marginTop: 23,
    flexDirection: "row",
    gap: 9,
  },

  cancelActionsMobile: {
    flexDirection: "column",
  },

  keepButton: {
    flex: 1,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  keepButtonText: {
    color: COLORS.textMedium,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  keepButtonPressed: {
    backgroundColor: "#F7F5F8",
    transform: [{ scale: 0.985 }],
  },

  confirmCancelButton: {
    flex: 1,
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    borderRadius: 13,
    backgroundColor: COLORS.red,
    shadowColor: COLORS.red,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  confirmCancelText: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  confirmCancelPressed: {
    backgroundColor: "#B91C1C",
    transform: [{ scale: 0.985 }],
  },

  disabledButton: {
    opacity: 0.52,
  },
});

export default CustomerMyAppointments;
