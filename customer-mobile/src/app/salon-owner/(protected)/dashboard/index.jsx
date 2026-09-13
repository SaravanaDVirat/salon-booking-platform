import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
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

import { getOwnerDashboard } from "../../../../services/salonOwnerService";

/* ================================================================
   COLORS
================================================================ */

const COLORS = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFD",

  text: "#0F172A",
  textDark: "#111827",
  textMedium: "#475569",
  textSoft: "#64748B",
  textMuted: "#94A3B8",

  border: "#E7EAF0",
  borderSoft: "#EEF1F5",

  pink: "#EC4899",
  pinkDark: "#DB2777",
  pinkSoft: "#FDF2F8",

  purple: "#8B5CF6",
  purpleSoft: "#F5F3FF",

  blue: "#3B82F6",
  blueSoft: "#EFF6FF",

  emerald: "#10B981",
  emeraldSoft: "#ECFDF5",

  amber: "#F59E0B",
  amberSoft: "#FFFBEB",

  red: "#EF4444",
  redSoft: "#FEF2F2",

  white: "#FFFFFF",
  black: "#020617",
};

/* ================================================================
   MAIN
================================================================ */

const SalonOwnerDashboard = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  /*
   * Responsive breakpoints
   *
   * 320  -> ultra compact
   * 360  -> small mobile
   * 390  -> normal mobile
   * 430  -> large mobile
   * 768  -> tablet
   * 1100 -> laptop
   * 1450 -> desktop
   */

  const isUltraSmall = width < 340;
  const isSmallMobile = width >= 340 && width < 390;
  const isMediumMobile = width >= 390 && width < 430;
  const isLargeMobile = width >= 430 && width < 768;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isLaptop = width >= 1100 && width < 1450;
  const isDesktop = width >= 1450;

  const isNarrowMobile = width < 390;
  const isCompact = width < 430;
  const isWide = width >= 1100;

  const horizontalPadding = useMemo(() => {
    if (width < 340) return 10;
    if (width < 390) return 12;
    if (width < 430) return 14;
    if (width < 768) return 18;
    if (width < 1100) return 24;
    if (width < 1450) return 30;
    return 36;
  }, [width]);

  const contentMaxWidth = 1500;

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ================================================================
     LOAD
  ================================================================= */

  const loadDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getOwnerDashboard();

      setDashboard(data);
    } catch (err) {
      console.error("Salon Owner Dashboard Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    loadDashboard(true);
  };

  /* ================================================================
     DATA
  ================================================================= */

  const stats = dashboard?.stats || {};

  const statCards = useMemo(
    () => [
      {
        title: "TOTAL SALONS",
        value: stats.totalSalons || 0,
        label: "Registered locations",
        icon: "store-outline",
        family: "material",
        color: COLORS.pink,
        bg: COLORS.pinkSoft,
      },
      {
        title: "SERVICES",
        value: stats.totalServices || 0,
        label: "Available services",
        icon: "content-cut",
        family: "material",
        color: COLORS.purple,
        bg: COLORS.purpleSoft,
      },
      {
        title: "STAFF MEMBERS",
        value: stats.totalStaff || 0,
        label: "Active team members",
        icon: "people-outline",
        family: "ion",
        color: COLORS.blue,
        bg: COLORS.blueSoft,
      },
      {
        title: "APPOINTMENTS",
        value: stats.totalAppointments || 0,
        label: "Total bookings",
        icon: "calendar-check-outline",
        family: "material",
        color: COLORS.emerald,
        bg: COLORS.emeraldSoft,
      },
    ],
    [stats]
  );

  /* ================================================================
     LOADING
  ================================================================= */

  if (loading) {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.centerScroll,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.loadingGlowOne} />
          <View style={styles.loadingGlowTwo} />

          <View
            style={[
              styles.loadingCard,
              {
                width: "100%",
                maxWidth: isMobile ? 430 : 540,
              },
            ]}
          >
            <View
              style={[
                styles.loadingIconOuter,
                isUltraSmall && styles.loadingIconOuterUltra,
              ]}
            >
              <View
                style={[
                  styles.loadingIconInner,
                  isUltraSmall && styles.loadingIconInnerUltra,
                ]}
              >
                <MaterialCommunityIcons
                  name="store-outline"
                  size={isUltraSmall ? 21 : 28}
                  color={COLORS.pink}
                />

                <View style={styles.loadingSpinner}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.purple}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.loadingEyebrow}>
              SALON WORKSPACE
            </Text>

            <Text
              style={[
                styles.loadingTitle,
                isUltraSmall && styles.loadingTitleUltra,
              ]}
            >
              Preparing your dashboard
            </Text>

            <Text
              style={[
                styles.loadingDescription,
                isUltraSmall &&
                  styles.loadingDescriptionUltra,
              ]}
            >
              Fetching your salon business information...
            </Text>

            <View style={styles.loadingProgressTrack}>
              <View style={styles.loadingProgressBar} />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     ERROR
  ================================================================= */

  if (error) {
    return (
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={[
            styles.centerScroll,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.pink}
              colors={[COLORS.pink]}
            />
          }
        >
          <View style={styles.errorGlowOne} />
          <View style={styles.errorGlowTwo} />

          <View
            style={[
              styles.errorCard,
              {
                width: "100%",
                maxWidth: isMobile ? 560 : 680,
              },
            ]}
          >
            <View style={styles.errorTopLine} />

            <View
              style={[
                styles.errorIcon,
                isUltraSmall && styles.errorIconUltra,
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={isUltraSmall ? 27 : 34}
                color={COLORS.red}
              />
            </View>

            <Text style={styles.errorEyebrow}>
              SOMETHING WENT WRONG
            </Text>

            <Text
              style={[
                styles.errorTitle,
                isUltraSmall && styles.errorTitleUltra,
              ]}
            >
              Unable to load dashboard
            </Text>

            <Text
              style={[
                styles.errorDescription,
                isUltraSmall &&
                  styles.errorDescriptionUltra,
              ]}
            >
              Something went wrong while loading your salon
              information.
            </Text>

            <View style={styles.errorMessageBox}>
              <Text style={styles.errorMessageText}>
                {error}
              </Text>
            </View>

            <Pressable
              onPress={() => loadDashboard()}
              style={({ pressed }) => [
                styles.retryButton,
                isUltraSmall && styles.retryButtonUltra,
                pressed && styles.retryButtonPressed,
              ]}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={COLORS.white}
              />

              <Text style={styles.retryButtonText}>
                Try Again
              </Text>

              <Ionicons
                name="arrow-forward"
                size={15}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     HELPERS
  ================================================================= */

  const formatAppointmentDate = (date) => {
    if (!date) return "Date unavailable";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date unavailable";
    }
  };

  /* ================================================================
     MAIN
  ================================================================= */

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.pink}
            colors={[COLORS.pink]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
      >
        {/* BACKGROUND */}

        <View
          pointerEvents="none"
          style={styles.backgroundDecor}
        >
          <View style={styles.backgroundGlowLeft} />
          <View style={styles.backgroundGlowRight} />
          <View style={styles.backgroundGlowBottom} />
        </View>

        <View
          style={[
            styles.contentContainer,
            { maxWidth: contentMaxWidth },
          ]}
        >
          {/* ======================================================
              HERO
          ======================================================= */}

          <View style={styles.heroCard}>
            <View style={styles.heroTopLine} />

            <View
              pointerEvents="none"
              style={styles.heroDecoration}
            >
              <View style={styles.heroGlowRight} />
              <View style={styles.heroGlowBottom} />
            </View>

            <View
              style={[
                styles.heroContent,
                isWide && styles.heroContentWide,
              ]}
            >
              <View
                style={[
                  styles.heroLeft,
                  isWide && styles.heroLeftWide,
                ]}
              >
                <View style={styles.heroBadge}>
                  <View style={styles.heroBadgeDot} />

                  <Text
                    style={styles.heroBadgeText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                  >
                    SALON MANAGEMENT
                  </Text>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    isUltraSmall && styles.heroTitleUltra,
                    isSmallMobile && styles.heroTitleSmall,
                    isMediumMobile && styles.heroTitleMedium,
                    isLargeMobile && styles.heroTitleLarge,
                    isTablet && styles.heroTitleTablet,
                    isLaptop && styles.heroTitleLaptop,
                    isDesktop && styles.heroTitleDesktop,
                  ]}
                >
                  Welcome back,{"\n"}
                  <Text style={styles.heroTitleAccent}>
                    Salon Owner.
                  </Text>
                </Text>

                <Text
                  style={[
                    styles.heroDescription,
                    isUltraSmall &&
                      styles.heroDescriptionUltra,
                    isTablet &&
                      styles.heroDescriptionTablet,
                    isWide &&
                      styles.heroDescriptionWide,
                  ]}
                >
                  Manage your salon, services, staff and
                  customer appointments from one powerful
                  workspace.
                </Text>
              </View>

              {/* BUSINESS OVERVIEW */}

              <View
                style={[
                  styles.overviewCard,
                  isWide && styles.overviewCardWide,
                  isCompact &&
                    styles.overviewCardCompact,
                ]}
              >
                <View style={styles.overviewGlow} />

                <View style={styles.overviewRow}>
                  <View
                    style={[
                      styles.overviewIcon,
                      isUltraSmall &&
                        styles.overviewIconUltra,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="store-outline"
                      size={isUltraSmall ? 20 : 24}
                      color={COLORS.white}
                    />
                  </View>

                  <View style={styles.overviewTextBlock}>
                    <Text style={styles.overviewLabel}>
                      BUSINESS OVERVIEW
                    </Text>

                    <Text
                      style={[
                        styles.overviewValue,
                        isUltraSmall &&
                          styles.overviewValueUltra,
                      ]}
                    >
                      {stats.totalSalons || 0} Salon
                      {stats.totalSalons === 1 ? "" : "s"}
                    </Text>
                  </View>
                </View>

                <View style={styles.overviewStatus}>
                  <View style={styles.overviewStatusDot} />

                  <Text
                    style={styles.overviewStatusText}
                    numberOfLines={1}
                  >
                    Workspace active
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ======================================================
              STATS
          ======================================================= */}

          <View
            style={[
              styles.statsGrid,
              width < 360 && styles.statsGridOneColumn,
            ]}
          >
            {statCards.map((card) => (
              <StatCard
                key={card.title}
                card={card}
                oneColumn={width < 360}
                ultra={isUltraSmall}
              />
            ))}
          </View>

          {/* ======================================================
              MAIN CONTENT
          ======================================================= */}

          <View
            style={[
              styles.mainGrid,
              isWide && styles.mainGridWide,
            ]}
          >
            {/* APPOINTMENT STATUS */}

            <View
              style={[
                styles.panelCard,
                isWide && styles.statusPanelWide,
              ]}
            >
              <View style={styles.panelGlowPink} />

              <PanelHeader
                icon="calendar-outline"
                iconColor={COLORS.pink}
                iconBackground={COLORS.pinkSoft}
                title="Appointment Status"
                subtitle="Current appointment overview"
                badge="LIVE"
                badgeColor={COLORS.emerald}
                compact={isCompact}
              />

              <View style={styles.statusList}>
                <StatusRow
                  title="Pending"
                  value={stats.pendingAppointments}
                  icon="time-outline"
                  iconColor={COLORS.amber}
                  iconBg={COLORS.amberSoft}
                  barColor={COLORS.amber}
                  ultra={isUltraSmall}
                />

                <StatusRow
                  title="Confirmed"
                  value={stats.confirmedAppointments}
                  icon="calendar-check-outline"
                  iconColor={COLORS.blue}
                  iconBg={COLORS.blueSoft}
                  barColor={COLORS.blue}
                  ultra={isUltraSmall}
                />

                <StatusRow
                  title="Completed"
                  value={stats.completedAppointments}
                  icon="checkmark-circle-outline"
                  iconColor={COLORS.emerald}
                  iconBg={COLORS.emeraldSoft}
                  barColor={COLORS.emerald}
                  ultra={isUltraSmall}
                />
              </View>
            </View>

            {/* SALONS */}

            <View
              style={[
                styles.panelCard,
                styles.salonsPanel,
              ]}
            >
              <PanelHeader
                icon="store-outline"
                materialIcon
                iconColor={COLORS.purple}
                iconBackground={COLORS.purpleSoft}
                title="Your Salons"
                subtitle="Manage your registered salon locations"
                total={dashboard?.salons?.length || 0}
                compact={isCompact}
              />

              <View style={styles.salonsContent}>
                {dashboard?.salons?.length > 0 ? (
                  <View style={styles.salonsGrid}>
                    {dashboard.salons.map((salon) => (
                      <SalonCard
                        key={salon._id}
                        salon={salon}
                        ultra={isUltraSmall}
                        twoColumns={
                          isTablet ||
                          isLaptop ||
                          isDesktop
                        }
                      />
                    ))}
                  </View>
                ) : (
                  <EmptySalons ultra={isUltraSmall} />
                )}
              </View>
            </View>
          </View>

          {/* ======================================================
              APPOINTMENTS
          ======================================================= */}

          <View style={styles.appointmentsPanel}>
            <View
              style={[
                styles.appointmentsHeader,
                isCompact &&
                  styles.appointmentsHeaderCompact,
              ]}
            >
              <View style={styles.appointmentsHeaderLeft}>
                <View
                  style={[
                    styles.panelIcon,
                    {
                      backgroundColor:
                        COLORS.emeraldSoft,
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar"
                    size={18}
                    color={COLORS.emerald}
                  />
                </View>

                <View style={styles.panelHeadingBlock}>
                  <Text style={styles.panelTitle}>
                    Upcoming Appointments
                  </Text>

                  <Text style={styles.panelSubtitle}>
                    Next scheduled customer appointments
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  router.push("/salon-owner/appointments")
                }
                style={({ pressed }) => [
                  styles.viewAllButton,
                  isCompact &&
                    styles.viewAllButtonCompact,
                  pressed && styles.viewAllPressed,
                ]}
              >
                <Text
                  style={styles.viewAllText}
                  numberOfLines={1}
                >
                  View All
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color={COLORS.textDark}
                />
              </Pressable>
            </View>

            <View style={styles.appointmentList}>
              {dashboard?.upcomingAppointments?.length > 0 ? (
                dashboard.upcomingAppointments.map(
                  (appointment) => (
                    <AppointmentRow
                      key={appointment._id}
                      appointment={appointment}
                      mobile={isMobile}
                      ultra={isUltraSmall}
                      tablet={isTablet}
                      formatAppointmentDate={
                        formatAppointmentDate
                      }
                    />
                  )
                )
              ) : (
                <EmptyAppointments
                  ultra={isUltraSmall}
                />
              )}
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </View>
      </ScrollView>
    </View>
  );
};

/* ================================================================
   PANEL HEADER
================================================================ */

const PanelHeader = ({
  icon,
  materialIcon = false,
  iconColor,
  iconBackground,
  title,
  subtitle,
  badge,
  badgeColor,
  total,
  compact = false,
}) => {
  return (
    <View
      style={[
        styles.panelHeader,
        compact && styles.panelHeaderCompact,
      ]}
    >
      <View style={styles.panelHeaderLeft}>
        <View
          style={[
            styles.panelIcon,
            compact && styles.panelIconCompact,
            {
              backgroundColor: iconBackground,
            },
          ]}
        >
          {materialIcon ? (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={iconColor}
            />
          ) : (
            <Ionicons
              name={icon}
              size={18}
              color={iconColor}
            />
          )}
        </View>

        <View style={styles.panelHeadingBlock}>
          <Text style={styles.panelTitle}>
            {title}
          </Text>

          <Text style={styles.panelSubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      {badge ? (
        <View
          style={[
            styles.liveBadge,
            compact && styles.liveBadgeCompact,
            {
              backgroundColor:
                badgeColor === COLORS.emerald
                  ? COLORS.emeraldSoft
                  : COLORS.surfaceSoft,
              borderColor:
                badgeColor === COLORS.emerald
                  ? "#D1FAE5"
                  : COLORS.border,
            },
          ]}
        >
          <View
            style={[
              styles.liveDot,
              { backgroundColor: badgeColor },
            ]}
          />

          <Text
            style={[
              styles.liveText,
              {
                color:
                  badgeColor === COLORS.emerald
                    ? "#059669"
                    : COLORS.textMedium,
              },
            ]}
          >
            {badge}
          </Text>
        </View>
      ) : null}

      {typeof total === "number" ? (
        <View
          style={[
            styles.totalBadge,
            compact && styles.totalBadgeCompact,
          ]}
        >
          <Text style={styles.totalLabel}>
            TOTAL
          </Text>

          <Text style={styles.totalValue}>
            {total}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

/* ================================================================
   STAT CARD
================================================================ */

const StatCard = ({
  card,
  oneColumn,
  ultra,
}) => {
  return (
    <View
      style={[
        styles.statCard,
        oneColumn && styles.statCardOneColumn,
        ultra && styles.statCardUltra,
      ]}
    >
      <View
        style={[
          styles.statAccent,
          { backgroundColor: card.color },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.statGlow,
          { backgroundColor: card.color },
        ]}
      />

      <View style={styles.statContent}>
        <View style={styles.statTopRow}>
          <View style={styles.statTextBlock}>
            <Text
              style={[
                styles.statTitle,
                ultra && styles.statTitleUltra,
              ]}
            >
              {card.title}
            </Text>

            <Text
              style={[
                styles.statValue,
                ultra && styles.statValueUltra,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {card.value}
            </Text>
          </View>

          <View
            style={[
              styles.statIcon,
              ultra && styles.statIconUltra,
              { backgroundColor: card.bg },
            ]}
          >
            {card.family === "material" ? (
              <MaterialCommunityIcons
                name={card.icon}
                size={ultra ? 19 : 22}
                color={card.color}
              />
            ) : (
              <Ionicons
                name={card.icon}
                size={ultra ? 20 : 22}
                color={card.color}
              />
            )}
          </View>
        </View>

        <View style={styles.statBottom}>
          <View
            style={[
              styles.statBottomDot,
              { backgroundColor: COLORS.emerald },
            ]}
          />

          <Text
            style={[
              styles.statBottomText,
              ultra && styles.statBottomTextUltra,
            ]}
            numberOfLines={1}
          >
            {card.label}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ================================================================
   STATUS ROW
================================================================ */

const StatusRow = ({
  title,
  value,
  icon,
  iconColor,
  iconBg,
  barColor,
  ultra,
}) => {
  return (
    <View
      style={[
        styles.statusRow,
        ultra && styles.statusRowUltra,
      ]}
    >
      <View style={styles.statusLeft}>
        <View
          style={[
            styles.statusIcon,
            ultra && styles.statusIconUltra,
            { backgroundColor: iconBg },
          ]}
        >
          <Ionicons
            name={icon}
            size={ultra ? 15 : 18}
            color={iconColor}
          />
        </View>

        <View style={styles.statusTextBlock}>
          <Text
            style={[
              styles.statusTitle,
              ultra && styles.statusTitleUltra,
            ]}
          >
            {title}
          </Text>

          <View
            style={[
              styles.statusProgressTrack,
              ultra &&
                styles.statusProgressTrackUltra,
            ]}
          >
            <View
              style={[
                styles.statusProgressBar,
                { backgroundColor: barColor },
              ]}
            />
          </View>
        </View>
      </View>

      <Text
        style={[
          styles.statusValue,
          ultra && styles.statusValueUltra,
        ]}
        numberOfLines={1}
      >
        {value || 0}
      </Text>
    </View>
  );
};

/* ================================================================
   SALON CARD
================================================================ */

const SalonCard = ({
  salon,
  ultra,
  twoColumns,
}) => {
  const active = Boolean(salon?.isActive);

  return (
    <View
      style={[
        styles.salonCard,
        twoColumns && styles.salonCardTwoColumns,
        ultra && styles.salonCardUltra,
      ]}
    >
      <View style={styles.salonGlow} />

      <View style={styles.salonTop}>
        <View
          style={[
            styles.salonIcon,
            ultra && styles.salonIconUltra,
          ]}
        >
          <MaterialCommunityIcons
            name="store-outline"
            size={ultra ? 18 : 21}
            color={COLORS.white}
          />
        </View>

        <View style={styles.salonMain}>
          {/* NAME */}

          <Text
            style={[
              styles.salonName,
              ultra && styles.salonNameUltra,
            ]}
          >
            {salon?.name || "Salon"}
          </Text>

          {/* STATUS - separate line on ALL narrow layouts */}

          <View
            style={[
              styles.salonStatus,
              active
                ? styles.salonStatusActive
                : styles.salonStatusInactive,
            ]}
          >
            <View
              style={[
                styles.salonStatusDot,
                {
                  backgroundColor: active
                    ? COLORS.emerald
                    : COLORS.red,
                },
              ]}
            />

            <Text
              style={[
                styles.salonStatusText,
                {
                  color: active
                    ? "#059669"
                    : "#DC2626",
                },
              ]}
            >
              {active ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>

          {/* LOCATION */}

          <View style={styles.salonLocation}>
            <Ionicons
              name="location-outline"
              size={13}
              color={COLORS.textMuted}
            />

            <Text
              style={[
                styles.salonCity,
                ultra && styles.salonCityUltra,
              ]}
            >
              {salon?.city || "Location not added"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/* ================================================================
   EMPTY SALONS
================================================================ */

const EmptySalons = ({ ultra }) => {
  return (
    <View
      style={[
        styles.emptySalons,
        ultra && styles.emptySalonsUltra,
      ]}
    >
      <View style={styles.emptySalonsIcon}>
        <MaterialCommunityIcons
          name="store-off-outline"
          size={24}
          color="#CBD5E1"
        />
      </View>

      <Text
        style={[
          styles.emptySalonsTitle,
          ultra && styles.emptySalonsTitleUltra,
        ]}
      >
        No salon added yet
      </Text>

      <Text
        style={[
          styles.emptySalonsDescription,
          ultra &&
            styles.emptySalonsDescriptionUltra,
        ]}
      >
        Add your salon details to get started.
      </Text>
    </View>
  );
};

/* ================================================================
   APPOINTMENT ROW
================================================================ */

const AppointmentRow = ({
  appointment,
  mobile,
  ultra,
  tablet,
  formatAppointmentDate,
}) => {
  const status =
    appointment?.status || "PENDING";

  const getStatusConfig = () => {
    if (status === "CONFIRMED") {
      return {
        bg: COLORS.blueSoft,
        border: "#DBEAFE",
        text: "#2563EB",
        dot: COLORS.blue,
      };
    }

    if (status === "COMPLETED") {
      return {
        bg: COLORS.emeraldSoft,
        border: "#D1FAE5",
        text: "#059669",
        dot: COLORS.emerald,
      };
    }

    return {
      bg: COLORS.amberSoft,
      border: "#FEF3C7",
      text: "#D97706",
      dot: COLORS.amber,
    };
  };

  const config = getStatusConfig();

  /* ==============================================================
     MOBILE
  ============================================================== */

  if (mobile) {
    return (
      <View
        style={[
          styles.appointmentRowMobile,
          ultra && styles.appointmentRowMobileUltra,
        ]}
      >
        {/* CUSTOMER */}

        <View style={styles.customerBlock}>
          <View
            style={[
              styles.customerAvatar,
              ultra &&
                styles.customerAvatarUltra,
            ]}
          >
            <Ionicons
              name="person-outline"
              size={ultra ? 17 : 20}
              color={COLORS.textSoft}
            />
          </View>

          <View style={styles.customerTextBlock}>
            <Text
              style={[
                styles.customerName,
                ultra && styles.customerNameUltra,
              ]}
            >
              {appointment?.customer?.name ||
                "Customer"}
            </Text>

            <Text
              style={[
                styles.customerService,
                ultra &&
                  styles.customerServiceUltra,
              ]}
            >
              {appointment?.service?.name ||
                "Service"}
            </Text>
          </View>
        </View>

        {/* DATE + TIME */}

        <View style={styles.mobileAppointmentDetails}>
          <AppointmentDetail
            icon="calendar-outline"
            label="DATE"
            value={formatAppointmentDate(
              appointment?.appointmentDate
            )}
            ultra={ultra}
          />

          <AppointmentDetail
            icon="time-outline"
            label="TIME"
            value={
              appointment?.startTime ||
              "Unavailable"
            }
            ultra={ultra}
          />
        </View>

        {/* STATUS */}

        <View style={styles.mobileAppointmentStatus}>
          <Text style={styles.mobileStatusLabelText}>
            STATUS
          </Text>

          <AppointmentStatus
            config={config}
            status={status}
            fullWidth
            ultra={ultra}
          />
        </View>
      </View>
    );
  }

  /* ==============================================================
     TABLET / DESKTOP
  ============================================================== */

  return (
    <View
      style={[
        styles.appointmentRowDesktop,
        tablet && styles.appointmentRowTablet,
      ]}
    >
      {/* CUSTOMER */}

      <View
        style={[
          styles.customerBlockDesktop,
          tablet &&
            styles.customerBlockDesktopTablet,
        ]}
      >
        <View style={styles.customerAvatar}>
          <Ionicons
            name="person-outline"
            size={20}
            color={COLORS.textSoft}
          />
        </View>

        <View style={styles.customerTextBlock}>
          <Text
            style={styles.customerName}
            numberOfLines={1}
          >
            {appointment?.customer?.name ||
              "Customer"}
          </Text>

          <Text
            style={styles.customerService}
            numberOfLines={1}
          >
            {appointment?.service?.name ||
              "Service"}
          </Text>
        </View>
      </View>

      {/* DATE */}

      <View style={styles.desktopDetail}>
        <View style={styles.desktopDetailHeader}>
          <Ionicons
            name="calendar-outline"
            size={11}
            color={COLORS.textMuted}
          />

          <Text style={styles.appointmentDetailLabel}>
            DATE
          </Text>
        </View>

        <Text
          style={styles.desktopDetailValue}
          numberOfLines={1}
        >
          {formatAppointmentDate(
            appointment?.appointmentDate
          )}
        </Text>
      </View>

      {/* TIME */}

      <View style={styles.desktopDetail}>
        <View style={styles.desktopDetailHeader}>
          <Ionicons
            name="time-outline"
            size={11}
            color={COLORS.textMuted}
          />

          <Text style={styles.appointmentDetailLabel}>
            TIME
          </Text>
        </View>

        <Text
          style={styles.desktopDetailValue}
          numberOfLines={1}
        >
          {appointment?.startTime ||
            "Unavailable"}
        </Text>
      </View>

      {/* STATUS */}

      <View style={styles.desktopStatusBlock}>
        <Text style={styles.desktopStatusLabel}>
          STATUS
        </Text>

        <AppointmentStatus
          config={config}
          status={status}
        />
      </View>
    </View>
  );
};

/* ================================================================
   APPOINTMENT DETAIL
================================================================ */

const AppointmentDetail = ({
  icon,
  label,
  value,
  ultra,
}) => {
  return (
    <View
      style={[
        styles.appointmentDetail,
        ultra && styles.appointmentDetailUltra,
      ]}
    >
      <View style={styles.appointmentDetailHeader}>
        <Ionicons
          name={icon}
          size={10}
          color={COLORS.textMuted}
        />

        <Text style={styles.appointmentDetailLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.appointmentDetailValue,
          ultra &&
            styles.appointmentDetailValueUltra,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {value}
      </Text>
    </View>
  );
};

/* ================================================================
   APPOINTMENT STATUS
================================================================ */

const AppointmentStatus = ({
  config,
  status,
  fullWidth = false,
  ultra = false,
}) => {
  return (
    <View
      style={[
        styles.appointmentStatus,
        fullWidth &&
          styles.appointmentStatusFull,
        ultra &&
          styles.appointmentStatusUltra,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
      ]}
    >
      <View
        style={[
          styles.appointmentStatusDot,
          {
            backgroundColor: config.dot,
          },
        ]}
      />

      <Text
        style={[
          styles.appointmentStatusText,
          ultra &&
            styles.appointmentStatusTextUltra,
          { color: config.text },
        ]}
        numberOfLines={1}
      >
        {status}
      </Text>
    </View>
  );
};

/* ================================================================
   EMPTY APPOINTMENTS
================================================================ */

const EmptyAppointments = ({ ultra }) => {
  return (
    <View
      style={[
        styles.emptyAppointments,
        ultra &&
          styles.emptyAppointmentsUltra,
      ]}
    >
      <View style={styles.emptyAppointmentsIcon}>
        <Ionicons
          name="calendar-outline"
          size={27}
          color="#CBD5E1"
        />
      </View>

      <Text
        style={[
          styles.emptyAppointmentsTitle,
          ultra &&
            styles.emptyAppointmentsTitleUltra,
        ]}
      >
        No upcoming appointments
      </Text>

      <Text
        style={[
          styles.emptyAppointmentsDescription,
          ultra &&
            styles.emptyAppointmentsDescriptionUltra,
        ]}
      >
        Your next customer appointments will appear
        here.
      </Text>
    </View>
  );
};

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  /* ================================================================
     ROOT
  ================================================================= */

  screen: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    width: "100%",
    paddingTop: 10,
    paddingBottom: 22,
  },

  contentContainer: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    minWidth: 0,
  },

  centerScroll: {
    flexGrow: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },

  /* ================================================================
     BACKGROUND
  ================================================================= */

  backgroundDecor: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    overflow: "hidden",
  },

  backgroundGlowLeft: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    left: -150,
    top: 80,
    backgroundColor:
      "rgba(244,114,182,0.055)",
  },

  backgroundGlowRight: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    right: -150,
    top: 350,
    backgroundColor:
      "rgba(139,92,246,0.05)",
  },

  backgroundGlowBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    left: "40%",
    bottom: -170,
    backgroundColor:
      "rgba(99,102,241,0.03)",
  },

  /* ================================================================
     HERO
  ================================================================= */

  heroCard: {
    width: "100%",
    minWidth: 0,
    position: "relative",
    overflow: "hidden",

    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.055,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 3,
  },

  heroTopLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.pink,
  },

  heroDecoration: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  heroGlowRight: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -130,
    top: -150,
    backgroundColor:
      "rgba(251,207,232,0.24)",
  },

  heroGlowBottom: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    left: "30%",
    bottom: -270,
    backgroundColor:
      "rgba(221,214,254,0.16)",
  },

  heroContent: {
    width: "100%",
    minWidth: 0,

    paddingHorizontal: 14,
    paddingTop: 25,
    paddingBottom: 18,
  },

  heroContentWide: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 32,
    paddingTop: 34,
    paddingBottom: 34,
  },

  heroLeft: {
    width: "100%",
    minWidth: 0,
  },

  heroLeftWide: {
    flex: 1,
    minWidth: 0,
    maxWidth: 800,
  },

  heroBadge: {
    alignSelf: "flex-start",

    minHeight: 27,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#FCE7F3",
    backgroundColor: COLORS.pinkSoft,
  },

  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: COLORS.pink,
  },

  heroBadgeText: {
    color: COLORS.pinkDark,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  heroTitle: {
    marginTop: 13,

    color: COLORS.text,
    fontSize: 40,
    lineHeight: 45,
    fontWeight: "900",
    letterSpacing: -1,

    includeFontPadding: false,
  },

  heroTitleUltra: {
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  heroTitleSmall: {
    fontSize: 31,
    lineHeight: 36,
    letterSpacing: -0.7,
  },

  heroTitleMedium: {
    fontSize: 35,
    lineHeight: 40,
    letterSpacing: -0.8,
  },

  heroTitleLarge: {
    fontSize: 39,
    lineHeight: 44,
  },

  heroTitleTablet: {
    fontSize: 44,
    lineHeight: 50,
  },

  heroTitleLaptop: {
    fontSize: 50,
    lineHeight: 56,
  },

  heroTitleDesktop: {
    fontSize: 57,
    lineHeight: 63,
  },

  heroTitleAccent: {
    color: COLORS.pink,
  },

  heroDescription: {
    width: "100%",
    maxWidth: 600,

    marginTop: 10,

    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",

    includeFontPadding: false,
  },

  heroDescriptionUltra: {
    fontSize: 10.5,
    lineHeight: 16,
  },

  heroDescriptionTablet: {
    fontSize: 13.5,
    lineHeight: 21,
  },

  heroDescriptionWide: {
    fontSize: 14,
    lineHeight: 22,
  },

  /* ================================================================
     OVERVIEW
  ================================================================= */

  overviewCard: {
    width: "100%",
    minWidth: 0,

    marginTop: 18,

    padding: 12,

    overflow: "hidden",

    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E9EAF0",
    backgroundColor: "#F8FAFC",
  },

  overviewCardCompact: {
    marginTop: 16,
  },

  overviewCardWide: {
    width: 300,
    flexShrink: 0,
    marginTop: 0,
    padding: 16,
  },

  overviewGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -50,
    top: -55,
    backgroundColor:
      "rgba(251,207,232,0.35)",
  },

  overviewRow: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  overviewIcon: {
    width: 45,
    height: 45,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 14,
    backgroundColor: COLORS.pink,
  },

  overviewIconUltra: {
    width: 39,
    height: 39,
    borderRadius: 12,
  },

  overviewTextBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  overviewLabel: {
    color: COLORS.textMuted,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  overviewValue: {
    marginTop: 3,

    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",

    includeFontPadding: false,
  },

  overviewValueUltra: {
    fontSize: 13,
    lineHeight: 17,
  },

  overviewStatus: {
    width: "100%",

    marginTop: 10,

    minHeight: 28,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,

    borderRadius: 9,
    backgroundColor: COLORS.white,
  },

  overviewStatusDot: {
    width: 6,
    height: 6,
    flexShrink: 0,

    borderRadius: 3,
    marginRight: 6,

    backgroundColor: COLORS.emerald,
  },

  overviewStatusText: {
    flex: 1,
    minWidth: 0,

    color: COLORS.textSoft,
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "800",

    includeFontPadding: false,
  },

  /* ================================================================
     STATS
  ================================================================= */

  statsGrid: {
    width: "100%",

    marginTop: 12,

    flexDirection: "row",
    flexWrap: "wrap",

    gap: 10,
  },

  statsGridOneColumn: {
    flexDirection: "column",
  },

  statCard: {
    width: "calc(50% - 5px)",
    minWidth: 0,

    minHeight: 135,

    position: "relative",
    overflow: "hidden",

    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 2,
  },

  statCardOneColumn: {
    width: "100%",
  },

  statCardUltra: {
    minHeight: 118,
    borderRadius: 17,
  },

  statAccent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 3,
  },

  statGlow: {
    position: "absolute",

    width: 100,
    height: 100,
    borderRadius: 50,

    right: -50,
    top: -55,

    opacity: 0.08,
  },

  statContent: {
    flex: 1,
    minWidth: 0,

    padding: 13,
  },

  statTopRow: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  statTextBlock: {
    flex: 1,
    minWidth: 0,

    paddingRight: 5,
  },

  statTitle: {
    color: COLORS.textMuted,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.65,

    includeFontPadding: false,
  },

  statTitleUltra: {
    fontSize: 7.2,
    lineHeight: 10,
    letterSpacing: 0.45,
  },

  statValue: {
    marginTop: 5,

    color: COLORS.text,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.5,

    includeFontPadding: false,
  },

  statValueUltra: {
    fontSize: 24,
    lineHeight: 28,
  },

  statIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 13,
  },

  statIconUltra: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },

  statBottom: {
    width: "100%",
    minWidth: 0,

    marginTop: 13,

    flexDirection: "row",
    alignItems: "center",
  },

  statBottomDot: {
    width: 5,
    height: 5,
    flexShrink: 0,

    borderRadius: 3,
    marginRight: 5,
  },

  statBottomText: {
    flex: 1,
    minWidth: 0,

    color: COLORS.textMuted,
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "600",

    includeFontPadding: false,
  },

  statBottomTextUltra: {
    fontSize: 7.7,
    lineHeight: 11,
  },

  /* ================================================================
     MAIN GRID
  ================================================================= */

  mainGrid: {
    width: "100%",

    marginTop: 12,

    flexDirection: "column",

    gap: 12,
  },

  mainGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  /* ================================================================
     PANELS
  ================================================================= */

  panelCard: {
    width: "100%",
    minWidth: 0,

    position: "relative",
    overflow: "hidden",

    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 2,
  },

  statusPanelWide: {
    flex: 0.82,
  },

  salonsPanel: {
    flex: 1.18,
  },

  panelGlowPink: {
    position: "absolute",

    width: 140,
    height: 140,
    borderRadius: 70,

    right: -70,
    top: -75,

    backgroundColor:
      "rgba(251,207,232,0.18)",
  },

  /* ================================================================
     PANEL HEADER
  ================================================================= */

  panelHeader: {
    width: "100%",
    minWidth: 0,

    minHeight: 67,

    paddingHorizontal: 13,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  panelHeaderCompact: {
    minHeight: 62,
    paddingHorizontal: 11,
    paddingVertical: 10,
  },

  panelHeaderLeft: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  panelIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
  },

  panelIconCompact: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },

  panelHeadingBlock: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,
  },

  panelTitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",

    includeFontPadding: false,
  },

  panelSubtitle: {
    marginTop: 3,

    color: COLORS.textMuted,
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "500",

    includeFontPadding: false,
  },

  liveBadge: {
    flexShrink: 0,

    minHeight: 25,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,

    paddingHorizontal: 7,

    borderRadius: 999,
    borderWidth: 1,
  },

  liveBadgeCompact: {
    minHeight: 23,
    paddingHorizontal: 6,
  },

  liveDot: {
    width: 5,
    height: 5,
    flexShrink: 0,

    borderRadius: 3,
    marginRight: 4,
  },

  liveText: {
    fontSize: 6.5,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.5,

    includeFontPadding: false,
  },

  totalBadge: {
    flexShrink: 0,

    minWidth: 45,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,

    paddingHorizontal: 7,
    paddingVertical: 6,

    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#EDE9FE",

    backgroundColor: COLORS.purpleSoft,
  },

  totalBadgeCompact: {
    minWidth: 42,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },

  totalLabel: {
    color: COLORS.textMuted,
    fontSize: 6.5,
    lineHeight: 8,
    fontWeight: "900",
    letterSpacing: 0.5,

    includeFontPadding: false,
  },

  totalValue: {
    marginTop: 1,

    color: COLORS.purple,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "900",

    includeFontPadding: false,
  },

  /* ================================================================
     STATUS
  ================================================================= */

  statusList: {
    width: "100%",
    padding: 10,

    gap: 7,
  },

  statusRow: {
    width: "100%",
    minWidth: 0,

    minHeight: 65,

    paddingHorizontal: 10,
    paddingVertical: 9,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,

    backgroundColor: "#FBFCFE",
  },

  statusRowUltra: {
    minHeight: 57,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 12,
  },

  statusLeft: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  statusIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
  },

  statusIconUltra: {
    width: 31,
    height: 31,
    borderRadius: 10,
  },

  statusTextBlock: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,
  },

  statusTitle: {
    color: COLORS.textMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800",

    includeFontPadding: false,
  },

  statusTitleUltra: {
    fontSize: 9.5,
    lineHeight: 12,
  },

  statusProgressTrack: {
    width: 64,
    height: 4,

    marginTop: 6,

    overflow: "hidden",

    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },

  statusProgressTrackUltra: {
    width: 52,
    height: 3,
    marginTop: 5,
  },

  statusProgressBar: {
    width: "62%",
    height: "100%",
    borderRadius: 999,
  },

  statusValue: {
    flexShrink: 0,

    marginLeft: 8,

    color: COLORS.text,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",

    includeFontPadding: false,
  },

  statusValueUltra: {
    fontSize: 18,
    lineHeight: 22,
  },

  /* ================================================================
     SALONS
  ================================================================= */

  salonsContent: {
    width: "100%",
    minWidth: 0,
    padding: 10,
  },

  salonsGrid: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    flexWrap: "wrap",

    gap: 8,
  },

  salonCard: {
    width: "100%",
    minWidth: 0,

    position: "relative",

    padding: 11,

    overflow: "hidden",

    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EDF0F4",

    backgroundColor: "#FAFBFC",
  },

  salonCardTwoColumns: {
    width: "calc(50% - 4px)",
  },

  salonCardUltra: {
    padding: 9,
    borderRadius: 13,
  },

  salonGlow: {
    position: "absolute",

    width: 80,
    height: 80,
    borderRadius: 40,

    right: -40,
    top: -40,

    backgroundColor:
      "rgba(251,207,232,0.23)",
  },

  salonTop: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  salonIcon: {
    width: 41,
    height: 41,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 13,
    backgroundColor: COLORS.pink,
  },

  salonIconUltra: {
    width: 35,
    height: 35,
    borderRadius: 11,
  },

  salonMain: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,
  },

  /*
   * Important:
   * Name and status are NOT in the same row.
   * This prevents 320/375px text collision.
   */

  salonName: {
    width: "100%",

    color: COLORS.textDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",

    includeFontPadding: false,
  },

  salonNameUltra: {
    fontSize: 10.5,
    lineHeight: 14,
  },

  salonStatus: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 5,

    paddingHorizontal: 6,
    paddingVertical: 3,

    borderRadius: 999,
  },

  salonStatusActive: {
    backgroundColor: COLORS.emeraldSoft,
  },

  salonStatusInactive: {
    backgroundColor: COLORS.redSoft,
  },

  salonStatusDot: {
    width: 5,
    height: 5,
    flexShrink: 0,

    borderRadius: 3,
    marginRight: 4,
  },

  salonStatusText: {
    fontSize: 6.5,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.35,

    includeFontPadding: false,
  },

  salonLocation: {
    width: "100%",
    minWidth: 0,

    marginTop: 6,

    flexDirection: "row",
    alignItems: "flex-start",
  },

  salonCity: {
    flex: 1,
    minWidth: 0,

    marginLeft: 4,

    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "600",

    includeFontPadding: false,
  },

  salonCityUltra: {
    fontSize: 8,
    lineHeight: 11,
  },

  /* ================================================================
     EMPTY SALON
  ================================================================= */

  emptySalons: {
    width: "100%",
    minHeight: 150,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 14,
    paddingVertical: 22,

    borderRadius: 15,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",

    backgroundColor: "#FAFBFC",
  },

  emptySalonsUltra: {
    minHeight: 130,
    paddingVertical: 18,
  },

  emptySalonsIcon: {
    width: 49,
    height: 49,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 15,
    backgroundColor: COLORS.white,
  },

  emptySalonsTitle: {
    maxWidth: "100%",

    marginTop: 10,

    color: COLORS.textMedium,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    textAlign: "center",

    includeFontPadding: false,
  },

  emptySalonsTitleUltra: {
    fontSize: 10.5,
    lineHeight: 14,
  },

  emptySalonsDescription: {
    maxWidth: 300,

    marginTop: 4,

    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "500",
    textAlign: "center",

    includeFontPadding: false,
  },

  emptySalonsDescriptionUltra: {
    fontSize: 8,
    lineHeight: 11,
  },

  /* ================================================================
     APPOINTMENTS PANEL
  ================================================================= */

  appointmentsPanel: {
    width: "100%",
    minWidth: 0,

    marginTop: 12,

    overflow: "hidden",

    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 2,
  },

  appointmentsHeader: {
    width: "100%",
    minWidth: 0,

    minHeight: 67,

    paddingHorizontal: 13,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  appointmentsHeaderCompact: {
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  appointmentsHeaderLeft: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  viewAllButton: {
    flexShrink: 0,

    minHeight: 36,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    marginLeft: 6,

    paddingHorizontal: 10,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,

    backgroundColor: COLORS.white,
  },

  viewAllButtonCompact: {
    minHeight: 33,
    paddingHorizontal: 8,
  },

  viewAllPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },

  viewAllText: {
    color: COLORS.textDark,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",

    includeFontPadding: false,
  },

  appointmentList: {
    width: "100%",
    minWidth: 0,
  },

  /* ================================================================
     MOBILE APPOINTMENT
  ================================================================= */

  appointmentRowMobile: {
    width: "100%",
    minWidth: 0,

    paddingHorizontal: 12,
    paddingVertical: 12,

    flexDirection: "column",
    alignItems: "stretch",

    gap: 9,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  appointmentRowMobileUltra: {
    paddingHorizontal: 9,
    paddingVertical: 10,
    gap: 7,
  },

  customerBlock: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  customerAvatar: {
    width: 42,
    height: 42,
    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 13,
    backgroundColor: "#F1F5F9",
  },

  customerAvatarUltra: {
    width: 36,
    height: 36,
    borderRadius: 11,
  },

  customerTextBlock: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,
  },

  customerName: {
    width: "100%",

    color: COLORS.textDark,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",

    includeFontPadding: false,
  },

  customerNameUltra: {
    fontSize: 10.5,
    lineHeight: 14,
  },

  customerService: {
    width: "100%",

    marginTop: 2,

    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "600",

    includeFontPadding: false,
  },

  customerServiceUltra: {
    fontSize: 8,
    lineHeight: 11,
  },

  /* ================================================================
     MOBILE DETAILS
  ================================================================= */

  mobileAppointmentDetails: {
    width: "100%",

    flexDirection: "row",

    gap: 7,
  },

  appointmentDetail: {
    flex: 1,
    minWidth: 0,

    minHeight: 50,

    paddingHorizontal: 8,
    paddingVertical: 8,

    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,

    backgroundColor: "#FAFBFC",
  },

  appointmentDetailUltra: {
    minHeight: 46,
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderRadius: 9,
  },

  appointmentDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  appointmentDetailLabel: {
    marginLeft: 4,

    color: COLORS.textMuted,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.5,

    includeFontPadding: false,
  },

  appointmentDetailValue: {
    width: "100%",

    marginTop: 3,

    color: COLORS.textMedium,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "800",

    includeFontPadding: false,
  },

  appointmentDetailValueUltra: {
    fontSize: 8.5,
    lineHeight: 11,
  },

  mobileAppointmentStatus: {
    width: "100%",
    minWidth: 0,
  },

  mobileStatusLabelText: {
    marginBottom: 4,

    color: COLORS.textMuted,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.5,

    includeFontPadding: false,
  },

  appointmentStatus: {
    minHeight: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 8,
    paddingVertical: 6,

    borderRadius: 999,
    borderWidth: 1,
  },

  appointmentStatusFull: {
    width: "100%",
    minHeight: 35,
    borderRadius: 10,
  },

  appointmentStatusUltra: {
    minHeight: 32,
    paddingHorizontal: 7,
  },

  appointmentStatusDot: {
    width: 5,
    height: 5,
    flexShrink: 0,

    borderRadius: 3,
    marginRight: 5,
  },

  appointmentStatusText: {
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.4,

    includeFontPadding: false,
  },

  appointmentStatusTextUltra: {
    fontSize: 7,
    lineHeight: 9,
  },

  /* ================================================================
     TABLET / DESKTOP APPOINTMENT
  ================================================================= */

  appointmentRowDesktop: {
    width: "100%",
    minWidth: 0,

    minHeight: 74,

    paddingHorizontal: 15,
    paddingVertical: 12,

    flexDirection: "row",
    alignItems: "center",

    gap: 12,

    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
  },

  appointmentRowTablet: {
    paddingHorizontal: 12,
    gap: 9,
  },

  customerBlockDesktop: {
    flex: 1,

    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",
  },

  customerBlockDesktopTablet: {
    flex: 1.1,
  },

  desktopDetail: {
    width: 115,
    flexShrink: 0,
    minWidth: 0,
  },

  desktopDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  desktopDetailValue: {
    width: "100%",

    marginTop: 4,

    color: COLORS.textMedium,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",

    includeFontPadding: false,
  },

  desktopStatusBlock: {
    width: 100,
    flexShrink: 0,
    minWidth: 0,

    alignItems: "flex-start",
  },

  desktopStatusLabel: {
    marginBottom: 4,

    color: COLORS.textMuted,
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "900",
    letterSpacing: 0.6,

    includeFontPadding: false,
  },

  /* ================================================================
     EMPTY APPOINTMENTS
  ================================================================= */

  emptyAppointments: {
    width: "100%",
    minHeight: 175,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 15,
    paddingVertical: 26,
  },

  emptyAppointmentsUltra: {
    minHeight: 155,
    paddingHorizontal: 12,
    paddingVertical: 22,
  },

  emptyAppointmentsIcon: {
    width: 55,
    height: 55,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 16,
    backgroundColor: "#F8FAFC",
  },

  emptyAppointmentsTitle: {
    maxWidth: 340,

    marginTop: 11,

    color: COLORS.textMedium,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "center",

    includeFontPadding: false,
  },

  emptyAppointmentsTitleUltra: {
    fontSize: 11,
    lineHeight: 15,
  },

  emptyAppointmentsDescription: {
    maxWidth: 380,

    marginTop: 4,

    color: COLORS.textMuted,
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "500",
    textAlign: "center",

    includeFontPadding: false,
  },

  emptyAppointmentsDescriptionUltra: {
    fontSize: 8.5,
    lineHeight: 12,
  },

  bottomSpace: {
    height: 6,
  },

  /* ================================================================
     LOADING
  ================================================================= */

  loadingGlowOne: {
    position: "absolute",

    width: 260,
    height: 260,

    left: -100,
    top: 60,

    borderRadius: 999,

    backgroundColor:
      "rgba(251,207,232,0.2)",
  },

  loadingGlowTwo: {
    position: "absolute",

    width: 300,
    height: 300,

    right: -120,
    bottom: 20,

    borderRadius: 999,

    backgroundColor:
      "rgba(221,214,254,0.2)",
  },

  loadingCard: {
    alignItems: "center",

    paddingHorizontal: 20,
    paddingVertical: 30,

    overflow: "hidden",

    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF",

    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
  },

  loadingIconOuter: {
    width: 82,
    height: 82,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 25,
    backgroundColor: COLORS.pinkSoft,
  },

  loadingIconOuterUltra: {
    width: 68,
    height: 68,
    borderRadius: 21,
  },

  loadingIconInner: {
    width: 59,
    height: 59,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 19,
    backgroundColor: COLORS.white,
  },

  loadingIconInnerUltra: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },

  loadingSpinner: {
    position: "absolute",

    right: -2,
    bottom: -2,

    width: 22,
    height: 22,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,
    backgroundColor: COLORS.white,
  },

  loadingEyebrow: {
    marginTop: 17,

    color: COLORS.pink,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.3,

    includeFontPadding: false,
  },

  loadingTitle: {
    maxWidth: "100%",

    marginTop: 6,

    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    textAlign: "center",

    includeFontPadding: false,
  },

  loadingTitleUltra: {
    fontSize: 17,
    lineHeight: 21,
  },

  loadingDescription: {
    maxWidth: 360,

    marginTop: 6,

    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "500",
    textAlign: "center",

    includeFontPadding: false,
  },

  loadingDescriptionUltra: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  loadingProgressTrack: {
    width: 135,
    height: 4,

    marginTop: 20,

    overflow: "hidden",

    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  loadingProgressBar: {
    width: "50%",
    height: "100%",

    borderRadius: 999,

    backgroundColor: COLORS.pink,
  },

  /* ================================================================
     ERROR
  ================================================================= */

  errorGlowOne: {
    position: "absolute",

    width: 240,
    height: 240,

    left: -130,
    top: 60,

    borderRadius: 120,

    backgroundColor:
      "rgba(254,202,202,0.2)",
  },

  errorGlowTwo: {
    position: "absolute",

    width: 280,
    height: 280,

    right: -160,
    bottom: 25,

    borderRadius: 140,

    backgroundColor:
      "rgba(254,215,170,0.15)",
  },

  errorCard: {
    alignItems: "center",

    overflow: "hidden",

    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF",

    backgroundColor: "#FFFFFF",

    shadowColor: "#7F1D1D",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 4,
  },

  errorTopLine: {
    width: "100%",
    height: 3,
    backgroundColor: COLORS.red,
  },

  errorIcon: {
    width: 66,
    height: 66,

    marginTop: 25,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 20,
    backgroundColor: COLORS.redSoft,
  },

  errorIconUltra: {
    width: 56,
    height: 56,
    marginTop: 21,
    borderRadius: 18,
  },

  errorEyebrow: {
    marginTop: 14,

    color: COLORS.red,
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.3,

    includeFontPadding: false,
  },

  errorTitle: {
    maxWidth: "100%",

    marginTop: 6,
    paddingHorizontal: 15,

    color: COLORS.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    textAlign: "center",

    includeFontPadding: false,
  },

  errorTitleUltra: {
    fontSize: 17,
    lineHeight: 22,
  },

  errorDescription: {
    maxWidth: 440,

    marginTop: 7,
    paddingHorizontal: 15,

    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "500",
    textAlign: "center",

    includeFontPadding: false,
  },

  errorDescriptionUltra: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  errorMessageBox: {
    width: "88%",
    maxWidth: 500,

    marginTop: 14,

    paddingHorizontal: 10,
    paddingVertical: 10,

    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",

    backgroundColor: "#FFF7F7",
  },

  errorMessageText: {
    color: "#DC2626",
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center",

    includeFontPadding: false,
  },

  retryButton: {
    minHeight: 42,

    marginTop: 17,
    marginBottom: 24,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 18,

    borderRadius: 13,
    backgroundColor: COLORS.black,
  },

  retryButtonUltra: {
    minHeight: 39,
    marginTop: 14,
    marginBottom: 20,
    paddingHorizontal: 15,
  },

  retryButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  retryButtonText: {
    marginHorizontal: 7,

    color: COLORS.white,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",

    includeFontPadding: false,
  },
});

export default SalonOwnerDashboard;