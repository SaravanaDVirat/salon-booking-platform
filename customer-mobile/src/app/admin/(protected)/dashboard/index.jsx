import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import adminInstance from "../../../../services/AdminInstance";

const DEFAULT_STATS = {
  totalCustomers: 0,
  totalSalonOwners: 0,
  totalSalons: 0,
  totalAppointments: 0,
  totalStaff: 0,
  totalServices: 0,
  totalCategories: 0,
  totalReviews: 0,
  totalUsers: 0,
  activeSalons: 0,
  inactiveSalons: 0,
};

const STAT_CARDS = [
  {
    key: "totalCustomers",
    title: "Total Customers",
    change: "+12.4%",
    icon: "account-group-outline",
    iconFamily: "material",
    tone: "purple",
  },
  {
    key: "totalSalonOwners",
    title: "Salon Owners",
    change: "+8.1%",
    icon: "account-tie-outline",
    iconFamily: "material",
    tone: "cyan",
  },
  {
    key: "totalSalons",
    title: "Total Salons",
    change: "+5.3%",
    icon: "content-cut",
    iconFamily: "material",
    tone: "pink",
  },
  {
    key: "totalAppointments",
    title: "Appointments",
    change: "+18.2%",
    icon: "calendar-check-outline",
    iconFamily: "material",
    tone: "green",
  },
  {
    key: "totalStaff",
    title: "Staff Members",
    change: "+9.7%",
    icon: "account-multiple-outline",
    iconFamily: "material",
    tone: "orange",
  },
  {
    key: "totalServices",
    title: "Services",
    change: "+6.8%",
    icon: "chart-line",
    iconFamily: "material",
    tone: "red",
  },
  {
    key: "totalCategories",
    title: "Categories",
    change: "+4.1%",
    icon: "layers-triple-outline",
    iconFamily: "material",
    tone: "indigo",
  },
  {
    key: "totalReviews",
    title: "Reviews",
    change: "+21.0%",
    icon: "star-outline",
    iconFamily: "material",
    tone: "yellow",
  },
];

const PLATFORM_ITEMS = [
  {
    label: "Total Users",
    key: "totalUsers",
  },
  {
    label: "Total Salons",
    key: "totalSalons",
  },
  {
    label: "Total Staff",
    key: "totalStaff",
  },
  {
    label: "Total Appointments",
    key: "totalAppointments",
  },
  {
    label: "Total Reviews",
    key: "totalReviews",
  },
];

const PERFORMANCE_ITEMS = [
  {
    label: "Bookings",
    value: 82,
    icon: "calendar-check-outline",
  },
  {
    label: "Revenue",
    value: 67,
    icon: "cash-multiple",
  },
  {
    label: "Retention",
    value: 74,
    icon: "account-heart-outline",
  },
];

const QUICK_NOTES = [
  {
    text: "New salon partners onboarded this week.",
    icon: "sparkles-outline",
  },
  {
    text: "Customer satisfaction score remains above target.",
    icon: "thumb-up-outline",
  },
  {
    text: "Staff scheduling is balanced across all locations.",
    icon: "calendar-outline",
  },
];

const TONE_STYLES = {
  purple: {
    background: "#7C3AED",
    soft: "#F3E8FF",
    text: "#7C3AED",
  },
  cyan: {
    background: "#0891B2",
    soft: "#ECFEFF",
    text: "#0891B2",
  },
  pink: {
    background: "#DB2777",
    soft: "#FCE7F3",
    text: "#DB2777",
  },
  green: {
    background: "#059669",
    soft: "#ECFDF5",
    text: "#059669",
  },
  orange: {
    background: "#EA580C",
    soft: "#FFF7ED",
    text: "#EA580C",
  },
  red: {
    background: "#E11D48",
    soft: "#FFF1F2",
    text: "#E11D48",
  },
  indigo: {
    background: "#4F46E5",
    soft: "#EEF2FF",
    text: "#4F46E5",
  },
  yellow: {
    background: "#D97706",
    soft: "#FFFBEB",
    text: "#D97706",
  },
};

const AdminDashboard = () => {
  const { width } = useWindowDimensions();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isLargeScreen = width >= 1024;

  const fetchDashboardStats = useCallback(async () => {
    try {
      setError("");

      const response = await adminInstance.get("/admin/dashboard");

      const data =
        response?.data?.data ||
        response?.data ||
        {};

      setStats({
        ...DEFAULT_STATS,
        ...data,
      });
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const safeStats = useMemo(
    () => ({
      ...DEFAULT_STATS,
      ...(stats || {}),
    }),
    [stats]
  );

  const progressPercent =
    safeStats.totalSalons > 0
      ? Math.min(
          (safeStats.activeSalons / safeStats.totalSalons) * 100,
          100
        )
      : 0;

  const horizontalPadding = isSmallMobile
    ? 12
    : isMobile
    ? 16
    : isTablet
    ? 24
    : 30;

  const cardGap = isSmallMobile ? 10 : 14;

  const statCardWidth = isLargeScreen
    ? "23.5%"
    : isTablet
    ? "48%"
    : "48%";

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingHeader}>
          <View style={styles.skeletonSmall} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonText} />
        </View>

        <View
          style={[
            styles.skeletonGrid,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.skeletonCard,
                {
                  width: statCardWidth,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.loadingIndicatorWrap}>
          <ActivityIndicator
            size="small"
            color="#7C3AED"
          />
          <Text style={styles.loadingText}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView
        contentContainerStyle={styles.errorScreen}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.errorIcon}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={34}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Unable to load dashboard
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={fetchDashboardStats}
          style={styles.retryButton}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={19}
            color="#FFFFFF"
          />

          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingHorizontal: horizontalPadding,
          paddingBottom: isSmallMobile ? 28 : 40,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#7C3AED"
          colors={["#7C3AED"]}
        />
      }
    >
      {/* =========================================================
          HERO
      ========================================================= */}

      <View
        style={[
          styles.hero,
          isSmallMobile && styles.heroSmall,
        ]}
      >
        <View style={styles.heroGlowOne} />
        <View style={styles.heroGlowTwo} />

        <View
          style={[
            styles.heroContent,
            isMobile
              ? styles.heroContentMobile
              : styles.heroContentDesktop,
          ]}
        >
          <View style={styles.heroTextBlock}>
            <View style={styles.overviewBadge}>
              <View style={styles.liveDot} />

              <Text style={styles.overviewBadgeText}>
                PLATFORM OVERVIEW
              </Text>
            </View>

            <Text
              style={[
                styles.heroTitle,
                isSmallMobile && styles.heroTitleSmall,
                isTablet && styles.heroTitleTablet,
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              Dashboard
            </Text>

            <Text
              style={[
                styles.heroSubtitle,
                isSmallMobile && styles.heroSubtitleSmall,
              ]}
            >
              Here's what's happening across your salon platform
              right now.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.82}
            onPress={handleRefresh}
            style={[
              styles.refreshButton,
              isMobile && styles.refreshButtonMobile,
            ]}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <MaterialCommunityIcons
                name="refresh"
                size={19}
                color="#FFFFFF"
              />
            )}

            <Text style={styles.refreshButtonText}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroBottomLine}>
          <View style={styles.heroAccent} />
          <View style={styles.heroAccentShort} />
        </View>
      </View>

      {/* =========================================================
          STAT CARDS
      ========================================================= */}

      <View
        style={[
          styles.sectionHeader,
          isSmallMobile && styles.sectionHeaderSmall,
        ]}
      >
        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionEyebrow}>
            KEY METRICS
          </Text>

          <Text
            style={styles.sectionTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.82}
          >
            Platform performance
          </Text>
        </View>

        <View style={styles.liveStatus}>
          <View style={styles.liveStatusDot} />

          <Text style={styles.liveStatusText}>
            LIVE
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statsGrid,
          {
            gap: cardGap,
          },
        ]}
      >
        {STAT_CARDS.map((card) => {
          const tone = TONE_STYLES[card.tone];
          const value = safeStats[card.key];

          return (
            <View
              key={card.key}
              style={[
                styles.statCard,
                {
                  width: statCardWidth,
                },
                isSmallMobile && styles.statCardSmall,
                isLargeScreen && styles.statCardDesktop,
              ]}
            >
              <View style={styles.statCardTop}>
                <View
                  style={[
                    styles.statIcon,
                    {
                      backgroundColor: tone.background,
                    },
                  ]}
                >
                  {card.iconFamily === "material" ? (
                    <MaterialCommunityIcons
                      name={card.icon}
                      size={isSmallMobile ? 19 : 22}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name={card.icon}
                      size={22}
                      color="#FFFFFF"
                    />
                  )}
                </View>

                <View
                  style={[
                    styles.livePill,
                    {
                      backgroundColor: "#ECFDF5",
                    },
                  ]}
                >
                  <View style={styles.livePillDot} />

                  <Text style={styles.livePillText}>
                    LIVE
                  </Text>
                </View>
              </View>

              <View style={styles.statMain}>
                <Text
                  style={[
                    styles.statValue,
                    isSmallMobile && styles.statValueSmall,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {value}
                </Text>

                <View style={styles.statChangeRow}>
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={14}
                    color="#059669"
                  />

                  <Text style={styles.statChange}>
                    {card.change}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.statLabel,
                    isSmallMobile && styles.statLabelSmall,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.82}
                >
                  {card.title}
                </Text>
              </View>

              <View
                style={[
                  styles.statAccent,
                  {
                    backgroundColor: tone.background,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* =========================================================
          SALON STATUS + PLATFORM SUMMARY
      ========================================================= */}

      <View
        style={[
          styles.twoColumnSection,
          !isLargeScreen && styles.twoColumnStack,
        ]}
      >
        {/* SALON STATUS */}

        <View
          style={[
            styles.panel,
            isLargeScreen
              ? styles.panelLargeLeft
              : styles.panelFull,
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <Text
                style={styles.panelTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Salon Status
              </Text>

              <Text style={styles.panelSubtitle}>
                Current platform salon activity
              </Text>
            </View>

            <View style={styles.panelIconPurple}>
              <MaterialCommunityIcons
                name="content-cut"
                size={22}
                color="#7C3AED"
              />
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <View style={styles.activeDot} />

                <Text style={styles.statusLabel}>
                  Active Salons
                </Text>
              </View>

              <Text style={styles.statusValue}>
                {safeStats.activeSalons}
              </Text>
            </View>

            <View style={styles.progressArea}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progressPercent}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.progressFooter}>
                <Text style={styles.progressCaption}>
                  Operational rate
                </Text>

                <Text style={styles.progressPercent}>
                  {Math.round(progressPercent)}%
                </Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={styles.statusRowLeft}>
                <View style={styles.inactiveDot} />

                <Text style={styles.statusLabel}>
                  Inactive Salons
                </Text>
              </View>

              <Text style={styles.statusValue}>
                {safeStats.inactiveSalons}
              </Text>
            </View>
          </View>
        </View>

        {/* PLATFORM SUMMARY */}

        <View
          style={[
            styles.panel,
            isLargeScreen
              ? styles.panelLargeRight
              : styles.panelFull,
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <Text
                style={styles.panelTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.72}
              >
                Platform Summary
              </Text>

              <Text style={styles.panelSubtitle}>
                Overall system statistics
              </Text>
            </View>

            <View style={styles.panelIconCyan}>
              <MaterialCommunityIcons
                name="chart-box-outline"
                size={22}
                color="#0891B2"
              />
            </View>
          </View>

          <View style={styles.platformList}>
            {PLATFORM_ITEMS.map((item, index) => (
              <View
                key={item.key}
                style={[
                  styles.platformRow,
                  index === PLATFORM_ITEMS.length - 1 &&
                    styles.platformRowLast,
                ]}
              >
                <View style={styles.platformLabelWrap}>
                  <View style={styles.platformBullet}>
                    <View style={styles.platformBulletInner} />
                  </View>

                  <Text
                    style={styles.platformLabel}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.78}
                  >
                    {item.label}
                  </Text>
                </View>

                <Text style={styles.platformValue}>
                  {safeStats[item.key]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* =========================================================
          PERFORMANCE + QUICK NOTES
      ========================================================= */}

      <View
        style={[
          styles.twoColumnSection,
          !isLargeScreen && styles.twoColumnStack,
        ]}
      >
        {/* PERFORMANCE */}

        <View
          style={[
            styles.panel,
            isLargeScreen
              ? styles.panelLargePerformance
              : styles.panelFull,
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <Text
                style={styles.panelTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Performance
              </Text>

              <Text style={styles.panelSubtitle}>
                This month growth
              </Text>
            </View>

            <View style={styles.growthBadge}>
              <MaterialCommunityIcons
                name="arrow-top-right"
                size={14}
                color="#059669"
              />

              <Text style={styles.growthBadgeText}>
                +24.8%
              </Text>
            </View>
          </View>

          <View style={styles.performanceList}>
            {PERFORMANCE_ITEMS.map((item, index) => (
              <View
                key={item.label}
                style={styles.performanceItem}
              >
                <View style={styles.performanceTop}>
                  <View style={styles.performanceLabelWrap}>
                    <View
                      style={[
                        styles.performanceIcon,
                        index === 0 &&
                          styles.performanceIconPurple,
                        index === 1 &&
                          styles.performanceIconCyan,
                        index === 2 &&
                          styles.performanceIconGreen,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={16}
                        color={
                          index === 0
                            ? "#7C3AED"
                            : index === 1
                            ? "#0891B2"
                            : "#059669"
                        }
                      />
                    </View>

                    <Text style={styles.performanceLabel}>
                      {item.label}
                    </Text>
                  </View>

                  <Text style={styles.performanceValue}>
                    {item.value}%
                  </Text>
                </View>

                <View style={styles.performanceTrack}>
                  <View
                    style={[
                      styles.performanceFill,
                      {
                        width: `${item.value}%`,
                      },
                      index === 0 &&
                        styles.performanceFillPurple,
                      index === 1 &&
                        styles.performanceFillCyan,
                      index === 2 &&
                        styles.performanceFillGreen,
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* QUICK NOTES */}

        <View
          style={[
            styles.panel,
            isLargeScreen
              ? styles.panelLargeNotes
              : styles.panelFull,
          ]}
        >
          <View style={styles.panelHeader}>
            <View style={styles.panelHeaderText}>
              <Text
                style={styles.panelTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Quick Notes
              </Text>

              <Text style={styles.panelSubtitle}>
                Operational highlights
              </Text>
            </View>

            <View style={styles.panelIconAmber}>
              <MaterialCommunityIcons
                name="star-four-points-outline"
                size={21}
                color="#D97706"
              />
            </View>
          </View>

          <View style={styles.notesList}>
            {QUICK_NOTES.map((note) => (
              <View
                key={note.text}
                style={styles.noteCard}
              >
                <View style={styles.noteIcon}>
                  <MaterialCommunityIcons
                    name={note.icon}
                    size={16}
                    color="#7C3AED"
                  />
                </View>

                <Text style={styles.noteText}>
                  {note.text}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* =========================================================
          FOOTER STATUS
      ========================================================= */}

      <View style={styles.dashboardFooter}>
        <View style={styles.footerLive}>
          <View style={styles.footerLiveDot} />

          <Text style={styles.footerLiveText}>
            All systems operational
          </Text>
        </View>

        <Text style={styles.footerText}>
          Salonique Admin Platform
        </Text>
      </View>
    </ScrollView>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  content: {
    paddingTop: 18,
  },

  /* =========================================================
     LOADING
  ========================================================= */

  loadingScreen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    paddingTop: 24,
  },

  loadingHeader: {
    marginHorizontal: 18,
    padding: 22,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  skeletonSmall: {
    width: 90,
    height: 12,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },

  skeletonTitle: {
    width: 180,
    height: 32,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    marginTop: 15,
  },

  skeletonText: {
    width: "72%",
    height: 14,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
  },

  skeletonGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  skeletonCard: {
    height: 190,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  loadingIndicatorWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },

  loadingText: {
    marginTop: 10,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  /* =========================================================
     ERROR
  ========================================================= */

  errorScreen: {
    flexGrow: 1,
    backgroundColor: "#F4F7FB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 18,
  },

  errorTitle: {
    color: "#0F172A",
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.6,
  },

  errorMessage: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 10,
    maxWidth: 420,
  },

  retryButton: {
    marginTop: 22,
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 17,
    backgroundColor: "#0F172A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  /* =========================================================
     HERO
  ========================================================= */

  hero: {
    minHeight: 210,
    borderRadius: 32,
    backgroundColor: "#0A1020",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#1E293B",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
  },

  heroSmall: {
    minHeight: 225,
    borderRadius: 27,
  },

  heroGlowOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#4C1D95",
    opacity: 0.22,
    right: -90,
    top: -110,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#0E7490",
    opacity: 0.13,
    left: -90,
    bottom: -120,
  },

  heroContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 25,
    justifyContent: "space-between",
  },

  heroContentMobile: {
    alignItems: "flex-start",
  },

  heroContentDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  overviewBadge: {
    alignSelf: "flex-start",
    minHeight: 29,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: "rgba(139,92,246,0.14)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.28)",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A78BFA",
  },

  overviewBadgeText: {
    color: "#C4B5FD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 46,
    lineHeight: 51,
    fontWeight: "900",
    letterSpacing: -2,
    marginTop: 13,
  },

  heroTitleSmall: {
    fontSize: 37,
    lineHeight: 43,
    letterSpacing: -1.5,
  },

  heroTitleTablet: {
    fontSize: 48,
    lineHeight: 54,
  },

  heroSubtitle: {
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    marginTop: 8,
    maxWidth: 650,
  },

  heroSubtitleSmall: {
    fontSize: 13,
    lineHeight: 20,
  },

  refreshButton: {
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginLeft: 20,
  },

  refreshButtonMobile: {
    marginLeft: 0,
    marginTop: 18,
    width: 126,
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  heroBottomLine: {
    position: "absolute",
    left: 25,
    right: 25,
    bottom: 0,
    height: 3,
    flexDirection: "row",
    gap: 5,
  },

  heroAccent: {
    width: 80,
    height: 3,
    borderRadius: 10,
    backgroundColor: "#8B5CF6",
  },

  heroAccentShort: {
    width: 28,
    height: 3,
    borderRadius: 10,
    backgroundColor: "#C084FC",
    opacity: 0.6,
  },

  /* =========================================================
     SECTION HEADER
  ========================================================= */

  sectionHeader: {
    marginTop: 27,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionHeaderSmall: {
    marginTop: 23,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    color: "#7C3AED",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 3,
  },

  liveStatus: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  liveStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  liveStatusText: {
    color: "#059669",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  /* =========================================================
     STAT CARDS
  ========================================================= */

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  statCard: {
    minHeight: 184,
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 17,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.045,
    shadowRadius: 17,
    elevation: 2,
    position: "relative",
  },

  statCardSmall: {
    minHeight: 168,
    padding: 13,
    borderRadius: 21,
  },

  statCardDesktop: {
    minHeight: 195,
    padding: 19,
  },

  statCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  statIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  livePill: {
    minHeight: 23,
    paddingHorizontal: 8,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  livePillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },

  livePillText: {
    color: "#059669",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  statMain: {
    marginTop: 22,
  },

  statValue: {
    color: "#0F172A",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  statValueSmall: {
    fontSize: 29,
    lineHeight: 34,
  },

  statChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  statChange: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  statLabel: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 10,
  },

  statLabelSmall: {
    fontSize: 11,
    lineHeight: 15,
  },

  statAccent: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 3,
    width: "32%",
    borderTopRightRadius: 10,
  },

  /* =========================================================
     TWO COLUMN
  ========================================================= */

  twoColumnSection: {
    marginTop: 18,
    flexDirection: "row",
    gap: 18,
    alignItems: "stretch",
  },

  twoColumnStack: {
    flexDirection: "column",
  },

  /* =========================================================
     PANELS
  ========================================================= */

  panel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.045,
    shadowRadius: 22,
    elevation: 2,
  },

  panelFull: {
    width: "100%",
  },

  panelLargeLeft: {
    flex: 1.2,
  },

  panelLargeRight: {
    flex: 0.8,
  },

  panelLargePerformance: {
    flex: 1.05,
  },

  panelLargeNotes: {
    flex: 0.95,
  },

  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  panelHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  panelTitle: {
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
  },

  panelSubtitle: {
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    marginTop: 3,
  },

  panelIconPurple: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  panelIconCyan: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#ECFEFF",
    alignItems: "center",
    justifyContent: "center",
  },

  panelIconAmber: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================================================
     SALON STATUS
  ========================================================= */

  statusContainer: {
    marginTop: 21,
    gap: 13,
  },

  statusRow: {
    minHeight: 55,
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  activeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#10B981",
  },

  inactiveDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
  },

  statusLabel: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },

  statusValue: {
    color: "#0F172A",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },

  progressArea: {
    paddingHorizontal: 3,
  },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    minWidth: 2,
  },

  progressFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
  },

  progressCaption: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "700",
  },

  progressPercent: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
  },

  /* =========================================================
     PLATFORM SUMMARY
  ========================================================= */

  platformList: {
    marginTop: 19,
  },

  platformRow: {
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  platformRowLast: {
    borderBottomWidth: 0,
  },

  platformLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 9,
  },

  platformBullet: {
    width: 23,
    height: 23,
    borderRadius: 8,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  platformBulletInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
  },

  platformLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },

  platformValue: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },

  /* =========================================================
     PERFORMANCE
  ========================================================= */

  growthBadge: {
    minHeight: 29,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  growthBadgeText: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "900",
  },

  performanceList: {
    marginTop: 24,
    gap: 21,
  },

  performanceItem: {
    width: "100%",
  },

  performanceTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
  },

  performanceLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
    minWidth: 0,
  },

  performanceIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  performanceIconPurple: {
    backgroundColor: "#F3E8FF",
  },

  performanceIconCyan: {
    backgroundColor: "#ECFEFF",
  },

  performanceIconGreen: {
    backgroundColor: "#ECFDF5",
  },

  performanceLabel: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
  },

  performanceValue: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "900",
  },

  performanceTrack: {
    width: "100%",
    height: 9,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
  },

  performanceFill: {
    height: "100%",
    borderRadius: 999,
  },

  performanceFillPurple: {
    backgroundColor: "#7C3AED",
  },

  performanceFillCyan: {
    backgroundColor: "#0891B2",
  },

  performanceFillGreen: {
    backgroundColor: "#059669",
  },

  /* =========================================================
     QUICK NOTES
  ========================================================= */

  notesList: {
    marginTop: 19,
    gap: 10,
  },

  noteCard: {
    minHeight: 61,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  noteIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  noteText: {
    flex: 1,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  /* =========================================================
     FOOTER
  ========================================================= */

  dashboardFooter: {
    marginTop: 18,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  footerLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1,
    minWidth: 0,
  },

  footerLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  footerLiveText: {
    color: "#059669",
    fontSize: 10,
    fontWeight: "800",
  },

  footerText: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "700",
  },
});