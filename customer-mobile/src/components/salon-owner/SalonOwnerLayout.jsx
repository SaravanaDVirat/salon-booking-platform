import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Slot, Redirect, usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  background: "#F5F6FA",
  white: "#FFFFFF",
  sidebar: "#080C19",
  sidebarBorder: "rgba(255,255,255,0.075)",
  primaryPink: "#EC4899",
  text: "#111827",
  textDark: "#0F172A",
  textSoft: "#64748B",
  textMuted: "#94A3B8",
  border: "#E5E7EB",
  green: "#10B981",
};

const MENU_ITEMS = [
  { label: "Dashboard", route: "/salon-owner/dashboard", icon: "view-dashboard-outline" },
  { label: "My Salon", route: "/salon-owner/salons", icon: "storefront-outline" },
  { label: "Services", route: "/salon-owner/services", icon: "content-cut" },
  { label: "Staff", route: "/salon-owner/staff", icon: "account-group-outline" },
  { label: "Appointments", route: "/salon-owner/appointments", icon: "calendar-month-outline" },
];

const SalonOwnerLayout = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Breakpoints: small mobile / medium mobile / large mobile / tablet / laptop / desktop
  const isSmallMobile = width < 360;
  const isMediumMobile = width >= 360 && width < 430;
  const isLargeMobile = width >= 430 && width < 768;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isLaptop = width >= 1100 && width < 1400;
  const isDesktop = width >= 1400;

  // Never allow a wide sidebar to squeeze tablet content.
  const effectiveCollapsed = !isMobile && isTablet ? true : collapsed;
  const sidebarWidth = isMobile ? 0 : effectiveCollapsed ? 78 : 250;

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        const [token, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        if (!mounted) return;

        if (!token) {
          setAuthenticated(false);
          setAuthLoading(false);
          return;
        }

        let parsedUser = null;

        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser);
          } catch {
            parsedUser = null;
          }
        }

        if (
          parsedUser?.role &&
          parsedUser.role !== "SALON_OWNER"
        ) {
          await Promise.all([
            AsyncStorage.removeItem("token"),
            AsyncStorage.removeItem("user"),
          ]);

          setAuthenticated(false);
          setUser(null);
          setAuthLoading(false);
          return;
        }

        setUser(parsedUser);
        setAuthenticated(true);
      } catch (error) {
        console.error("Salon Owner Auth Check Error:", error);
        setAuthenticated(false);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // If the browser is resized from desktop/tablet to mobile,
  // remove the desktop collapsed state from the mobile UI.
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const activeMenu = useMemo(
    () =>
      MENU_ITEMS.find(
        (item) =>
          pathname === item.route ||
          pathname?.startsWith(`${item.route}/`)
      ),
    [pathname]
  );

  const ownerName = user?.name || "Salon Owner";

  const ownerInitials = useMemo(() => {
    const words = ownerName.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return ownerName.slice(0, 2).toUpperCase() || "SO";
  }, [ownerName]);

  const handleLogout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("token"),
        AsyncStorage.removeItem("user"),
        AsyncStorage.removeItem("role"),
        AsyncStorage.removeItem("userId"),
        AsyncStorage.removeItem("userName"),
        AsyncStorage.removeItem("userEmail"),
      ]);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setAuthenticated(false);
      setUser(null);
      setSidebarOpen(false);
      router.replace("/salon-owner/login");
    }
  };

  const handleMenuPress = (route) => {
    setSidebarOpen(false);

    if (pathname !== route) {
      router.push(route);
    }
  };

  const getPageTitle = () => {
    if (pathname === "/salon-owner/dashboard") return "Dashboard";
    if (pathname?.startsWith("/salon-owner/salons")) return "My Salon";
    if (pathname?.startsWith("/salon-owner/services")) return "Services";
    if (pathname?.startsWith("/salon-owner/staff")) return "Staff";
    if (pathname?.startsWith("/salon-owner/appointments")) return "Appointments";

    return activeMenu?.label || "Owner Workspace";
  };

  if (authLoading) {
    return (
      <View style={styles.authLoadingScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.authLoadingIcon}>
          <MaterialCommunityIcons
            name="content-cut"
            size={26}
            color={COLORS.white}
          />
        </View>

        <ActivityIndicator
          size="small"
          color={COLORS.primaryPink}
          style={styles.authLoadingSpinner}
        />

        <Text style={styles.authLoadingTitle}>
          Preparing your workspace
        </Text>

        <Text style={styles.authLoadingSubtitle}>
          Securely loading salon owner dashboard...
        </Text>
      </View>
    );
  }

  if (!authenticated) {
    return <Redirect href="/salon-owner/login" />;
  }

  const SidebarContent = ({ mobile = false }) => {
    const isCollapsed = mobile ? false : effectiveCollapsed;

    return (
      <View
        style={[
          styles.sidebar,
          mobile && styles.mobileSidebar,
          !mobile && isCollapsed
            ? styles.sidebarCollapsed
            : styles.sidebarExpanded,
        ]}
      >
        <View pointerEvents="none" style={styles.sidebarDecor}>
          <View style={styles.sidebarGlowTop} />
          <View style={styles.sidebarGlowBottom} />
          <View style={styles.sidebarGlowMiddle} />
        </View>

        {/* BRAND */}
        <View
          style={[
            styles.brandHeader,
            isCollapsed
              ? styles.brandHeaderCollapsed
              : styles.brandHeaderExpanded,
          ]}
        >
          <View
            style={[
              styles.brandWrapper,
              isCollapsed && styles.brandWrapperCollapsed,
            ]}
          >
            <View style={styles.brandLogo}>
              <MaterialCommunityIcons
                name="content-cut"
                size={19}
                color={COLORS.white}
              />
            </View>

            {!isCollapsed && (
              <View style={styles.brandTextWrapper}>
                <Text style={styles.brandTitle} numberOfLines={1}>
                  SalonPro
                </Text>
                <Text style={styles.brandSubtitle} numberOfLines={1}>
                  OWNER DASHBOARD
                </Text>
              </View>
            )}
          </View>

          {mobile && (
            <Pressable
              onPress={() => setSidebarOpen(false)}
              style={({ pressed }) => [
                styles.mobileCloseButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="close" size={21} color="#CBD5E1" />
            </Pressable>
          )}
        </View>

        {/* MENU */}
        <ScrollView
          style={styles.sidebarScroll}
          contentContainerStyle={[
            styles.sidebarScrollContent,
            isCollapsed && styles.sidebarScrollContentCollapsed,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {!isCollapsed && (
            <View style={styles.managementHeader}>
              <Text style={styles.managementLabel}>MANAGEMENT</Text>
              <View style={styles.managementLine} />
            </View>
          )}

          <View style={styles.menuContainer}>
            {MENU_ITEMS.map((item) => {
              const isActive = activeMenu?.route === item.route;

              return (
                <Pressable
                  key={item.route}
                  onPress={() => handleMenuPress(item.route)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    isCollapsed
                      ? styles.menuItemCollapsed
                      : styles.menuItemExpanded,
                    isActive && styles.menuItemActive,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  {isActive && <View style={styles.activeIndicator} />}

                  <View
                    style={[
                      styles.menuIconBox,
                      isActive && styles.menuIconBoxActive,
                      isCollapsed && styles.menuIconBoxCollapsed,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={19}
                      color={isActive ? COLORS.white : "#94A3B8"}
                    />
                  </View>

                  {!isCollapsed && (
                    <>
                      <Text
                        style={[
                          styles.menuText,
                          isActive && styles.menuTextActive,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.label}
                      </Text>

                      {isActive && <View style={styles.menuActiveDot} />}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* SIDEBAR FOOTER */}
        <View
          style={[
            styles.sidebarFooter,
            isCollapsed && styles.sidebarFooterCollapsed,
          ]}
        >
          {!isCollapsed && (
            <View style={styles.accountCard}>
              <View style={styles.accountAvatar}>
                <Text style={styles.accountAvatarText}>{ownerInitials}</Text>
              </View>

              <View style={styles.accountInfo}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {ownerName}
                </Text>
                <Text style={styles.accountRole} numberOfLines={1}>
                  Salon Owner
                </Text>
              </View>

              <View style={styles.accountOnlineDot} />
            </View>
          )}

          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              isCollapsed
                ? styles.logoutButtonCollapsed
                : styles.logoutButtonExpanded,
              pressed && styles.logoutPressed,
            ]}
          >
            <View style={styles.logoutIconBox}>
              <MaterialCommunityIcons
                name="logout-variant"
                size={19}
                color="#F87171"
              />
            </View>

            {!isCollapsed && (
              <Text style={styles.logoutText}>Logout</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.app}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.white}
      />

      {/* DESKTOP / TABLET SIDEBAR */}
      {!isMobile && (
        <View
          style={[
            styles.desktopSidebarWrapper,
            { width: sidebarWidth },
          ]}
        >
          <SidebarContent mobile={false} />
        </View>
      )}

      {/* MOBILE DRAWER */}
      <Modal
        visible={sidebarOpen}
        animationType="none"
        transparent
        onRequestClose={() => setSidebarOpen(false)}
      >
        <View style={styles.mobileDrawerRoot}>
          <Pressable
            style={styles.mobileOverlay}
            onPress={() => setSidebarOpen(false)}
          />

          <View
            style={[
              styles.mobileDrawer,
              {
                width: Math.min(
                  isSmallMobile
                    ? width * 0.88
                    : isMediumMobile
                    ? width * 0.84
                    : width * 0.78,
                  330
                ),
              },
            ]}
          >
            <SidebarContent mobile />
          </View>
        </View>
      </Modal>

      {/* MAIN APPLICATION */}
      <View
        style={[
          styles.mainArea,
          !isMobile && { marginLeft: sidebarWidth },
        ]}
      >
        {/* TOP BAR */}
        <View
          style={[
            styles.topBar,
            isSmallMobile && styles.topBarSmall,
            isMediumMobile && styles.topBarMedium,
          ]}
        >
          <View style={styles.topBarInner}>
            {/* LEFT SIDE */}
            <View style={styles.topBarLeft}>
              {isMobile ? (
                <Pressable
                  onPress={() => setSidebarOpen(true)}
                  style={({ pressed }) => [
                    styles.mobileMenuButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="menu"
                    size={21}
                    color={COLORS.text}
                  />
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setCollapsed((value) => !value)}
                  style={({ pressed }) => [
                    styles.collapseButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={
                      effectiveCollapsed
                        ? "chevron-forward"
                        : "chevron-back"
                    }
                    size={17}
                    color={COLORS.textSoft}
                  />
                </Pressable>
              )}

              <View style={styles.pageHeadingWrapper}>
                {!isMobile && (
                  <Text
                    style={styles.topBarEyebrow}
                    numberOfLines={1}
                  >
                    SALON MANAGEMENT
                  </Text>
                )}

                <Text
                  style={[
                    styles.topBarTitle,
                    isSmallMobile && styles.topBarTitleSmall,
                  ]}
                  numberOfLines={1}
                >
                  {getPageTitle()}
                </Text>
              </View>
            </View>

            
            <View style={styles.topBarRight}>
              {!isMobile && (
                <View style={styles.onlineBadge}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>ONLINE</Text>
                </View>
              )}

              {!isMobile && <View style={styles.topBarDivider} />}

              <View style={styles.profileArea}>
                {!isMobile && (
                  <View
                    style={[
                      styles.profileText,
                      isTablet && styles.profileTextTablet,
                    ]}
                  >
                    <Text
                      style={styles.profileName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {ownerName}
                    </Text>

                    <Text
                      style={styles.profileRole}
                      numberOfLines={1}
                    >
                      OWNER ACCOUNT
                    </Text>
                  </View>
                )}

                <View style={styles.profileAvatarWrapper}>
                  <View
                    style={[
                      styles.profileAvatar,
                      isSmallMobile && styles.profileAvatarSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.profileAvatarText,
                        isSmallMobile &&
                          styles.profileAvatarTextSmall,
                      ]}
                    >
                      {ownerInitials}
                    </Text>
                  </View>

                  <View style={styles.profileOnlineDot} />
                </View>
              </View>
            </View>
          </View>
        </View>
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={[
            styles.pageScrollContent,
            isSmallMobile && styles.pageScrollContentSmall,
            isMediumMobile && styles.pageScrollContentMedium,
            isLargeMobile && styles.pageScrollContentLarge,
            isTablet && styles.pageScrollContentTablet,
            isLaptop && styles.pageScrollContentLaptop,
            isDesktop && styles.pageScrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          nestedScrollEnabled
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.contentContainer}>
            <Slot />
          </View>

          {/* Safe breathing room after the Slot/footer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: COLORS.background,
  },

  authLoadingScreen: {
    flex: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    backgroundColor: COLORS.white,
  },

  authLoadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primaryPink,
  },

  authLoadingSpinner: {
    marginTop: 22,
  },

  authLoadingTitle: {
    marginTop: 17,
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  authLoadingSubtitle: {
    marginTop: 7,
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },

  desktopSidebarWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },

  sidebar: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: COLORS.sidebar,
    borderRightWidth: 1,
    borderRightColor: COLORS.sidebarBorder,
  },

  sidebarExpanded: {
    width: 250,
  },

  sidebarCollapsed: {
    width: 78,
  },

  mobileSidebar: {
    width: "100%",
    borderRightWidth: 0,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },

  sidebarDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  sidebarGlowTop: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -155,
    left: -130,
    backgroundColor: "rgba(217,70,239,0.09)",
  },

  sidebarGlowBottom: {
    position: "absolute",
    width: 340,
    height: 340,
    borderRadius: 170,
    bottom: -175,
    right: -175,
    backgroundColor: "rgba(124,58,237,0.10)",
  },

  sidebarGlowMiddle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: "42%",
    right: -120,
    backgroundColor: "rgba(236,72,153,0.035)",
  },

  brandHeader: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sidebarBorder,
  },

  brandHeaderExpanded: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  brandHeaderCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  brandWrapper: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  brandWrapperCollapsed: {
    flex: 0,
    justifyContent: "center",
  },

  brandLogo: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: COLORS.primaryPink,
  },

  brandTextWrapper: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  brandTitle: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.3,
    includeFontPadding: false,
  },

  brandSubtitle: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.3,
    includeFontPadding: false,
  },

  mobileCloseButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  sidebarScroll: {
    flex: 1,
    minHeight: 0,
  },

  sidebarScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 18,
  },

  sidebarScrollContentCollapsed: {
    paddingHorizontal: 8,
  },

  managementHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  managementLabel: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
    includeFontPadding: false,
  },

  managementLine: {
    flex: 1,
    height: 1,
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.055)",
  },

  menuContainer: {
    gap: 7,
  },

  menuItem: {
    position: "relative",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
  },

  menuItemExpanded: {
    paddingHorizontal: 10,
  },

  menuItemCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  menuItemActive: {
    backgroundColor: COLORS.primaryPink,
  },

  menuItemPressed: {
    opacity: 0.78,
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: "50%",
    width: 4,
    height: 26,
    marginTop: -13,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: COLORS.white,
  },

  menuIconBox: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  menuIconBoxActive: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  menuIconBoxCollapsed: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },

  menuText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    includeFontPadding: false,
  },

  menuTextActive: {
    color: COLORS.white,
    fontWeight: "900",
  },

  menuActiveDot: {
    width: 6,
    height: 6,
    flexShrink: 0,
    borderRadius: 3,
    marginLeft: 7,
    backgroundColor: COLORS.white,
  },

  sidebarFooter: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingTop: 11,
    paddingBottom: Platform.OS === "android" ? 12 : 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.sidebarBorder,
  },

  sidebarFooterCollapsed: {
    paddingHorizontal: 8,
  },

  accountCard: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.055)",
    backgroundColor: "rgba(255,255,255,0.035)",
    marginBottom: 8,
  },

  accountAvatar: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primaryPink,
  },

  accountAvatarText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  accountName: {
    color: COLORS.white,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "900",
    includeFontPadding: false,
  },

  accountRole: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    includeFontPadding: false,
  },

  accountOnlineDot: {
    width: 7,
    height: 7,
    flexShrink: 0,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },

  logoutButton: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
  },

  logoutButtonExpanded: {
    paddingHorizontal: 10,
  },

  logoutButtonCollapsed: {
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  logoutIconBox: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(239,68,68,0.07)",
  },

  logoutText: {
    marginLeft: 11,
    color: "#F87171",
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    includeFontPadding: false,
  },

  logoutPressed: {
    opacity: 0.72,
    backgroundColor: "rgba(239,68,68,0.07)",
  },

  mobileDrawerRoot: {
    flex: 1,
    flexDirection: "row",
  },

  mobileOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2,6,23,0.64)",
  },

  mobileDrawer: {
    height: "100%",
    overflow: "hidden",
    backgroundColor: COLORS.sidebar,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 20,
  },

  mainArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    backgroundColor: COLORS.background,
  },

  topBar: {
    height: 74,
    flexShrink: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.98)",
  },

  topBarSmall: {
    height: 64,
  },

  topBarMedium: {
    height: 68,
  },

  topBarInner: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  topBarLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  mobileMenuButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  collapseButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  pageHeadingWrapper: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  topBarEyebrow: {
    color: "#94A3B8",
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    includeFontPadding: false,
  },

  topBarTitle: {
    marginTop: 3,
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    letterSpacing: -0.25,
    includeFontPadding: false,
  },

  topBarTitleSmall: {
    marginTop: 0,
    fontSize: 13,
    lineHeight: 17,
  },

  topBarRight: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  onlineBadge: {
    height: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    backgroundColor: "#ECFDF5",
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  onlineText: {
    marginLeft: 7,
    color: "#059669",
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  topBarDivider: {
    width: 1,
    height: 28,
    marginHorizontal: 11,
    backgroundColor: COLORS.border,
  },

  profileArea: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },

  profileText: {
    width: 125,
    minWidth: 0,
    alignItems: "flex-end",
    marginRight: 9,
  },

  profileTextTablet: {
    width: 96,
  },

  profileName: {
    maxWidth: "100%",
    color: "#334155",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "900",
    includeFontPadding: false,
  },

  profileRole: {
    maxWidth: "100%",
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  profileAvatarWrapper: {
    position: "relative",
    flexShrink: 0,
  },

  profileAvatar: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: COLORS.primaryPink,
  },

  profileAvatarSmall: {
    width: 37,
    height: 37,
    borderRadius: 13,
  },

  profileAvatarText: {
    color: COLORS.white,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  profileAvatarTextSmall: {
    fontSize: 9.5,
    lineHeight: 12,
  },

  profileOnlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.green,
  },

  pageScroll: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },

  pageScrollContent: {
    flexGrow: 1,
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  pageScrollContentSmall: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 18,
  },

  pageScrollContentMedium: {
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 20,
  },

  pageScrollContentLarge: {
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 22,
  },

  pageScrollContentTablet: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 30,
  },

  pageScrollContentLaptop: {
    paddingHorizontal: 30,
    paddingTop: 28,
    paddingBottom: 34,
  },

  pageScrollContentDesktop: {
    paddingHorizontal: 34,
    paddingTop: 30,
    paddingBottom: 38,
  },

  contentContainer: {
    width: "100%",
    maxWidth: 1600,
    minWidth: 0,
    alignSelf: "center",
  },

  bottomSpacer: {
    height: 22,
    flexShrink: 0,
  },

  pressed: {
    opacity: 0.72,
  },
});

export default SalonOwnerLayout;
