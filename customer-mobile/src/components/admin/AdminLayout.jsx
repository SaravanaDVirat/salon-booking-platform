import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

/* ============================================================
   MENU CONFIG
============================================================ */

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: "bar-chart-outline",
  },
  {
    name: "Customers",
    path: "/admin/customers",
    icon: "people-outline",
  },
  {
    name: "Salons",
    path: "/admin/salons",
    icon: "cut-outline",
  },
  {
    name: "Salon Owners",
    path: "/admin/owners",
    icon: "person-outline",
  },
  {
    name: "Staff",
    path: "/admin/staff",
    icon: "people-outline",
  },
  {
    name: "Services",
    path: "/admin/services",
    icon: "construct-outline",
  },
  {
    name: "Categories",
    path: "/admin/categories",
    icon: "layers-outline",
  },
  {
    name: "Appointments",
    path: "/admin/appointments",
    icon: "calendar-outline",
  },
  {
    name: "Reviews",
    path: "/admin/reviews",
    icon: "star-outline",
  },
];

/* ============================================================
   ADMIN LAYOUT
============================================================ */

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { width, height } = useWindowDimensions();

  const isDesktop = width >= 1100;
  const isTablet = width >= 768 && width < 1100;
  const isLargeMobile = width >= 480 && width < 768;
  const isSmallMobile = width < 480;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState({});
  const [searchValue, setSearchValue] = useState("");
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  /* ============================================================
     LOAD ADMIN DATA
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const [adminDataValue, adminUserValue] = await Promise.all([
          AsyncStorage.getItem("adminData"),
          AsyncStorage.getItem("adminUser"),
        ]);

        let parsedAdmin = {};

        const storedValue = adminDataValue || adminUserValue;

        if (storedValue) {
          try {
            parsedAdmin = JSON.parse(storedValue);
          } catch {
            parsedAdmin = {};
          }
        }

        if (mounted) {
          setAdminData(parsedAdmin || {});
        }
      } catch (error) {
        console.error("Failed to load admin data:", error);

        if (mounted) {
          setAdminData({});
        }
      } finally {
        if (mounted) {
          setLoadingAdmin(false);
        }
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     CLOSE MOBILE SIDEBAR WHEN ROUTE CHANGES
  ============================================================ */

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [pathname, isDesktop]);

  /* ============================================================
     ADMIN DETAILS
  ============================================================ */

  const adminName = useMemo(() => {
    return adminData?.name || adminData?.email || "Administrator";
  }, [adminData]);

  const adminInitial = useMemo(() => {
    const firstCharacter = String(adminName)
      .trim()
      .charAt(0)
      .toUpperCase();

    return firstCharacter || "A";
  }, [adminName]);

  /* ============================================================
     ACTIVE MENU
  ============================================================ */

  const isMenuActive = (itemPath) => {
    if (!pathname) return false;

    if (itemPath === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }

    return (
      pathname === itemPath ||
      pathname.startsWith(`${itemPath}/`)
    );
  };

  /* ============================================================
     NAVIGATION
  ============================================================ */

  const handleNavigation = (path) => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }

    router.push(path);
  };

  /* ============================================================
     LOGOUT
  ============================================================ */

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      setSidebarOpen(false);

      await Promise.all([
        AsyncStorage.removeItem("adminToken"),
        AsyncStorage.removeItem("adminData"),
        AsyncStorage.removeItem("adminUser"),
      ]);

      router.replace("/admin/login");
    } catch (error) {
      console.error("Admin logout error:", error);

      router.replace("/admin/login");
    } finally {
      setLoggingOut(false);
    }
  };

  /* ============================================================
     SEARCH
  ============================================================ */

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  /* ============================================================
     SIDEBAR WIDTH
  ============================================================ */

  const sidebarWidth = isDesktop
    ? width >= 1440
      ? 292
      : 276
    : Math.min(width * 0.88, 360);

  /* ============================================================
     SIDEBAR
  ============================================================ */

  const renderSidebar = () => {
    return (
      <View
        style={[
          styles.sidebar,
          {
            width: sidebarWidth,
            height: height,
          },
          isDesktop
            ? styles.desktopSidebar
            : styles.mobileSidebar,
        ]}
      >
        {/* Decorative glow */}

        <View
          pointerEvents="none"
          style={styles.sidebarGlowTop}
        />

        <View
          pointerEvents="none"
          style={styles.sidebarGlowBottom}
        />

        <SafeAreaView style={styles.sidebarSafeArea}>
          <View style={styles.sidebarInner}>

            {/* ==================================================
                BRAND HEADER
            ================================================== */}

            <View style={styles.sidebarBrandRow}>
              <View style={styles.brandLeft}>

                <View style={styles.brandIcon}>
                  <Ionicons
                    name="cut-outline"
                    size={23}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.brandTextContainer}>
                  <Text
                    numberOfLines={1}
                    style={styles.brandTitle}
                  >
                    Saloni
                    <Text style={styles.brandTitleAccent}>
                      que
                    </Text>
                  </Text>

                  <Text style={styles.brandSubtitle}>
                    ADMIN PORTAL
                  </Text>
                </View>
              </View>

              {!isDesktop && (
                <Pressable
                  onPress={() => setSidebarOpen(false)}
                  style={({ pressed }) => [
                    styles.closeSidebarButton,
                    pressed && styles.pressed,
                  ]}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={19}
                    color="#CBD5E1"
                  />
                </Pressable>
              )}
            </View>

            {/* ==================================================
                MENU TITLE
            ================================================== */}

            <View style={styles.menuTitleContainer}>
              <View style={styles.menuTitleLine} />

              <Text style={styles.menuTitle}>
                MAIN MENU
              </Text>
            </View>

            {/* ==================================================
                NAVIGATION
            ================================================== */}

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.navigationScroll}
              contentContainerStyle={[
                styles.navigationContent,
                {
                  paddingBottom: isDesktop ? 20 : 24,
                },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {menuItems.map((item) => {
                const active = isMenuActive(item.path);

                return (
                  <Pressable
                    key={item.name}
                    onPress={() =>
                      handleNavigation(item.path)
                    }
                    style={({ pressed }) => [
                      styles.menuItem,
                      active && styles.menuItemActive,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    {/* Active indicator */}

                    {active && (
                      <View
                        pointerEvents="none"
                        style={styles.activeIndicator}
                      />
                    )}

                    <View
                      style={[
                        styles.menuIconBox,
                        active &&
                          styles.menuIconBoxActive,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={
                          active
                            ? "#DDD6FE"
                            : "#CBD5E1"
                        }
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.menuItemText,
                        active &&
                          styles.menuItemTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>

                    {active && (
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#C4B5FD"
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* ==================================================
                ADMIN PROFILE + LOGOUT
            ================================================== */}

            <View style={styles.sidebarBottom}>

              <View style={styles.profileCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>
                    {adminInitial}
                  </Text>
                </View>

                <View style={styles.profileTextContainer}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.profileName}
                  >
                    {adminName}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={styles.profileRole}
                  >
                    PLATFORM ADMIN
                  </Text>
                </View>

                <View style={styles.onlineDot} />
              </View>

              <Pressable
                onPress={handleLogout}
                disabled={loggingOut}
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutPressed,
                  loggingOut && styles.logoutDisabled,
                ]}
              >
                {loggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="log-out-outline"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text style={styles.logoutText}>
                      Logout
                    </Text>
                  </>
                )}
              </Pressable>

              <View style={styles.poweredRow}>
                <Ionicons
                  name="flash"
                  size={11}
                  color="#A78BFA"
                />

                <Text style={styles.poweredText}>
                  Powered by Salonique
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  /* ============================================================
     HEADER
  ============================================================ */

  const renderHeader = () => {
    return (
      <View
        style={[
          styles.header,
          {
            minHeight: isSmallMobile
              ? 68
              : isLargeMobile
              ? 72
              : 76,
          },
        ]}
      >
        <View style={styles.headerInner}>

          {/* LEFT */}

          <View
            style={[
              styles.headerLeft,
              isSmallMobile &&
                styles.headerLeftSmall,
            ]}
          >
            {!isDesktop && (
              <Pressable
                onPress={() => setSidebarOpen(true)}
                style={({ pressed }) => [
                  styles.menuButton,
                  pressed && styles.pressed,
                ]}
                hitSlop={6}
              >
                <Ionicons
                  name="menu"
                  size={21}
                  color="#334155"
                />
              </Pressable>
            )}

            {/* Desktop / tablet title */}

            {!isSmallMobile && (
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerEyebrow}>
                  OVERVIEW
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.headerTitle}
                >
                  Administration
                </Text>
              </View>
            )}

            {/* Small mobile title */}

            {isSmallMobile && (
              <View style={styles.mobileHeaderBrand}>

                <View style={styles.mobileHeaderIcon}>
                  <Ionicons
                    name="cut-outline"
                    size={17}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.mobileHeaderBrandText}>
                  <Text
                    numberOfLines={1}
                    style={styles.mobileHeaderTitle}
                  >
                    Saloni
                    <Text
                      style={
                        styles.mobileHeaderTitleAccent
                      }
                    >
                      que
                    </Text>
                  </Text>

                  <Text
                    style={styles.mobileHeaderSubtitle}
                  >
                    ADMIN
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* CENTER SEARCH */}

          {(isDesktop || isTablet) && (
            <View style={styles.searchWrapper}>
              <View
                style={[
                  styles.searchBox,
                  searchValue.length > 0 &&
                    styles.searchBoxFocused,
                ]}
              >
                <Ionicons
                  name="search"
                  size={17}
                  color={
                    searchValue.length > 0
                      ? "#7C3AED"
                      : "#94A3B8"
                  }
                />

                <TextInput
                  value={searchValue}
                  onChangeText={handleSearchChange}
                  placeholder="Search dashboard"
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="#7C3AED"
                />

                {searchValue.length > 0 && (
                  <Pressable
                    onPress={() => setSearchValue("")}
                    style={styles.clearSearchButton}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close"
                      size={15}
                      color="#64748B"
                    />
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {/* RIGHT */}

          <View
            style={[
              styles.headerRight,
              isSmallMobile &&
                styles.headerRightSmall,
            ]}
          >
            {/* Notification */}

            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                styles.notificationButton,
                pressed && styles.pressed,
              ]}
              hitSlop={6}
            >
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#475569"
              />

              <View style={styles.notificationDot} />
            </Pressable>

            {/* Admin profile */}

            <View
              style={[
                styles.headerProfile,
                isSmallMobile &&
                  styles.headerProfileSmall,
              ]}
            >
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {loadingAdmin ? "A" : adminInitial}
                </Text>
              </View>

              {!isSmallMobile && !isTablet && (
                <View
                  style={styles.headerProfileText}
                >
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={styles.headerProfileName}
                  >
                    {adminName}
                  </Text>

                  <Text
                    style={styles.headerProfileRole}
                  >
                    ADMIN
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  /* ============================================================
     MAIN CONTENT
  ============================================================ */

  return (
    <View style={styles.root}>

      {/* ========================================================
          DESKTOP
      ======================================================== */}

      {isDesktop && (
        <View
          style={[
            styles.desktopShell,
            {
              paddingLeft: sidebarWidth,
            },
          ]}
        >
          {/* Sidebar */}

          <View
            style={[
              styles.desktopSidebarHolder,
              {
                width: sidebarWidth,
              },
            ]}
          >
            {renderSidebar()}
          </View>

          {/* Main */}

          <View style={styles.mainArea}>
            {renderHeader()}

            <View
              style={[
                styles.pageContainer,
                isTablet &&
                  styles.pageContainerTablet,
              ]}
            >
              {children}
            </View>
          </View>
        </View>
      )}

      {/* ========================================================
          TABLET / MOBILE
      ======================================================== */}

      {!isDesktop && (
        <View style={styles.mobileShell}>

          {renderHeader()}

          <View style={styles.pageContainer}>
            {children}
          </View>

          {/* Drawer overlay */}

          {sidebarOpen && (
            <View
              style={styles.drawerLayer}
              pointerEvents="box-none"
            >
              <Pressable
                onPress={() => setSidebarOpen(false)}
                style={styles.drawerBackdrop}
              />

              <View
                style={[
                  styles.drawerContainer,
                  {
                    width: sidebarWidth,
                  },
                ]}
              >
                {renderSidebar()}
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({

  /* ============================================================
     ROOT
  ============================================================ */

  root: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  desktopShell: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F7FB",
  },

  mobileShell: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },

  mainArea: {
    flex: 1,
    minWidth: 0,
  },

  /* ============================================================
     SIDEBAR
  ============================================================ */

  sidebar: {
    backgroundColor: "#0A1020",
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "#1E293B",
  },

  desktopSidebarHolder: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },

  desktopSidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },

  mobileSidebar: {
    flex: 1,
    borderRightWidth: 0,
    borderRightColor: "transparent",
  },

  drawerLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: "row",
  },

  drawerBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(2, 6, 23, 0.58)",
  },

  drawerContainer: {
    height: "100%",
    zIndex: 101,
    elevation: 30,
    shadowColor: "#020617",
    shadowOffset: {
      width: 10,
      height: 0,
    },
    shadowOpacity: 0.35,
    shadowRadius: 35,
  },

  sidebarSafeArea: {
    flex: 1,
  },

  sidebarInner: {
    flex: 1,
    minHeight: 0,
  },

  sidebarGlowTop: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#7C3AED18",
    top: -160,
    left: -110,
  },

  sidebarGlowBottom: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#2563EB14",
    bottom: -140,
    right: -130,
  },

  /* ============================================================
     BRAND
  ============================================================ */

  sidebarBrandRow: {
    minHeight: 82,
    paddingHorizontal: 17,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF12",
  },

  brandLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    borderWidth: 1,
    borderColor: "#C4B5FD35",
    shadowColor: "#A855F7",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 9,
  },

  brandTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  brandTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 27,
  },

  brandTitleAccent: {
    color: "#C4B5FD",
    fontWeight: "900",
  },

  brandSubtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 2.1,
    lineHeight: 11,
  },

  closeSidebarButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF08",
    borderWidth: 1,
    borderColor: "#FFFFFF12",
    marginLeft: 8,
  },

  /* ============================================================
     MENU TITLE
  ============================================================ */

  menuTitleContainer: {
    height: 52,
    paddingHorizontal: 19,
    flexDirection: "row",
    alignItems: "center",
  },

  menuTitleLine: {
    width: 20,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#8B5CF6",
    marginRight: 9,
  },

  menuTitle: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2.1,
    lineHeight: 12,
  },

  /* ============================================================
     NAVIGATION
  ============================================================ */

  navigationScroll: {
    flex: 1,
    minHeight: 0,
  },

  navigationContent: {
    paddingHorizontal: 11,
  },

  menuItem: {
    width: "100%",
    minHeight: 52,
    marginBottom: 6,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },

  menuItemActive: {
    backgroundColor: "#8B5CF620",
    borderWidth: 1,
    borderColor: "#A78BFA35",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },

  menuItemPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    width: 3,
    height: 25,
    borderRadius: 4,
    backgroundColor: "#A78BFA",
  },

  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF07",
    borderWidth: 1,
    borderColor: "#FFFFFF0D",
  },

  menuIconBoxActive: {
    backgroundColor: "#8B5CF622",
    borderColor: "#A78BFA30",
  },

  menuItemText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    color: "#CBD5E1",
    fontSize: 13,
    fontWeight: "650",
    lineHeight: 18,
  },

  menuItemTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  /* ============================================================
     SIDEBAR BOTTOM
  ============================================================ */

  sidebarBottom: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#FFFFFF12",
    backgroundColor: "#0A1020EE",
  },

  profileCard: {
    minHeight: 64,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FFFFFF12",
    backgroundColor: "#FFFFFF07",
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    borderWidth: 1,
    borderColor: "#C4B5FD35",
  },

  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 20,
  },

  profileTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },

  profileName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },

  profileRole: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.25,
    lineHeight: 10,
  },

  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34D399",
    marginLeft: 6,
  },

  logoutButton: {
    width: "100%",
    minHeight: 47,
    marginTop: 10,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },

  logoutPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  logoutDisabled: {
    opacity: 0.65,
  },

  logoutText: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },

  poweredRow: {
    marginTop: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  poweredText: {
    marginLeft: 5,
    color: "#475569",
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 0.3,
    lineHeight: 11,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    width: "100%",
    backgroundColor: "#FFFFFFF7",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    zIndex: 10,
    elevation: 3,
  },

  headerInner: {
    width: "100%",
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  headerLeft: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  headerLeftSmall: {
    flex: 1,
  },

  headerTitleContainer: {
    minWidth: 0,
  },

  headerEyebrow: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2,
    lineHeight: 11,
  },

  headerTitle: {
    marginTop: 2,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.8,
    lineHeight: 24,
  },

  menuButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 10,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  /* ============================================================
     MOBILE HEADER BRAND
  ============================================================ */

  mobileHeaderBrand: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  mobileHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
  },

  mobileHeaderBrandText: {
    minWidth: 0,
    marginLeft: 8,
  },

  mobileHeaderTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.9,
    lineHeight: 20,
  },

  mobileHeaderTitleAccent: {
    color: "#7C3AED",
  },

  mobileHeaderSubtitle: {
    marginTop: 1,
    color: "#64748B",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.6,
    lineHeight: 9,
  },

  /* ============================================================
     SEARCH
  ============================================================ */

  searchWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 18,
  },

  searchBox: {
    width: "100%",
    maxWidth: 520,
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  searchBoxFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#C4B5FD",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    marginLeft: 9,
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: "#334155",
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    textAlignVertical: "center",
    outlineStyle: "none",
  },

  clearSearchButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  /* ============================================================
     HEADER RIGHT
  ============================================================ */

  headerRight: {
    marginLeft: "auto",
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  headerRightSmall: {
    gap: 6,
  },

  notificationButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
    position: "relative",
  },

  notificationDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B5CF6",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },

  headerProfile: {
    minHeight: 47,
    maxWidth: 210,
    paddingHorizontal: 7,
    paddingVertical: 6,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  headerProfileSmall: {
    paddingHorizontal: 5,
  },

  headerAvatar: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
  },

  headerAvatarText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 17,
  },

  headerProfileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    paddingRight: 3,
  },

  headerProfileName: {
    color: "#1E293B",
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 15,
  },

  headerProfileRole: {
    marginTop: 1,
    color: "#64748B",
    fontSize: 7,
    fontWeight: "800",
    letterSpacing: 1.2,
    lineHeight: 10,
  },

  /* ============================================================
     PAGE
  ============================================================ */

  pageContainer: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 18,
  },

  pageContainerTablet: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
  },

  /* ============================================================
     GENERAL
  ============================================================ */

  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
});

export default AdminLayout;