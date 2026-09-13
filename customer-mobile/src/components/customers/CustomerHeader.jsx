import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CustomerHeader = () => {
  const { width } = useWindowDimensions();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [userName, setUserName] = useState("Customer");

  const isDesktop = width >= 900;
  const isSmall = width < 360;
  const isTablet = width >= 600 && width < 900;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");

      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user?.name || "Customer");
      }
    } catch (error) {
      console.log("Failed to load customer:", error);
      setUserName("Customer");
    }
  };

  const closeMenus = () => {
    setMobileMenu(false);
    setProfileMenu(false);
  };

  const goHome = () => {
    closeMenus();
    router.replace("/customer/home");
  };

  const goSalons = () => {
    closeMenus();
    router.push("/customer/salons");
  };

  const goAppointments = () => {
    closeMenus();
    router.push("/customer/appointments");
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("role");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("userEmail");
    } catch (error) {
      console.log("Logout error:", error);
    }

    closeMenus();

    router.replace("/customer/login");
  };

  return (
    <View style={styles.headerContainer}>
      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

      <View
        style={[
          styles.headerInner,
          {
            paddingHorizontal: isSmall ? 14 : isTablet ? 24 : 18,
            height: isSmall ? 66 : 72,
          },
        ]}
      >
        {/* =====================================================
            LOGO
        ===================================================== */}

        <Pressable
          onPress={goHome}
          style={styles.logoButton}
          accessibilityRole="button"
        >
          <View
            style={[
              styles.logoBox,
              {
                width: isSmall ? 38 : 42,
                height: isSmall ? 38 : 42,
                borderRadius: isSmall ? 11 : 13,
              },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={isSmall ? 19 : 21}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.logoTextContainer}>
            <Text
              style={[
                styles.logoText,
                {
                  fontSize: isSmall ? 17 : isTablet ? 21 : 19,
                },
              ]}
              numberOfLines={1}
            >
              LUMORA
            </Text>

            {!isSmall && (
              <Text style={styles.logoTagline} numberOfLines={1}>
                BEAUTY • TIME • YOU
              </Text>
            )}
          </View>
        </Pressable>

        {/* =====================================================
            DESKTOP NAVIGATION
        ===================================================== */}

        {isDesktop && (
          <View style={styles.desktopNavigation}>
            <HeaderNavButton
              icon="home-outline"
              label="Home"
              onPress={goHome}
            />

            <HeaderNavButton
              icon="storefront-outline"
              label="Discover Salons"
              onPress={goSalons}
            />

            <HeaderNavButton
              icon="calendar-outline"
              label="My Appointments"
              onPress={goAppointments}
            />
          </View>
        )}

        {/* =====================================================
            DESKTOP PROFILE
        ===================================================== */}

        {isDesktop && (
          <View style={styles.profileWrapper}>
            <Pressable
              onPress={() => {
                setProfileMenu((prev) => !prev);
                setMobileMenu(false);
              }}
              style={({ pressed }) => [
                styles.profileButton,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.profileAvatar}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color="#6D28D9"
                />
              </View>

              <View style={styles.profileTextContainer}>
                <Text
                  style={styles.profileName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userName}
                </Text>

                <Text style={styles.profileRole}>CUSTOMER</Text>
              </View>

              <Ionicons
                name={profileMenu ? "chevron-up" : "chevron-down"}
                size={15}
                color="#94A3B8"
              />
            </Pressable>

            {profileMenu && (
              <View style={styles.profileDropdown}>
                <Pressable
                  onPress={goAppointments}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && styles.dropdownPressed,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="#6D28D9"
                  />

                  <Text style={styles.dropdownText}>
                    My Appointments
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.dropdownItem,
                    pressed && styles.logoutPressed,
                  ]}
                >
                  <Ionicons
                    name="log-out-outline"
                    size={18}
                    color="#DC2626"
                  />

                  <Text
                    style={[
                      styles.dropdownText,
                      styles.logoutText,
                    ]}
                  >
                    Logout
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {/* =====================================================
            MOBILE MENU BUTTON
        ===================================================== */}

        {!isDesktop && (
          <Pressable
            onPress={() => {
              setMobileMenu((prev) => !prev);
              setProfileMenu(false);
            }}
            style={({ pressed }) => [
              styles.menuButton,
              {
                width: isSmall ? 42 : 46,
                height: isSmall ? 42 : 46,
              },
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
          >
            <Ionicons
              name={mobileMenu ? "close" : "menu"}
              size={isSmall ? 22 : 24}
              color="#334155"
            />
          </Pressable>
        )}
      </View>

      {/* =====================================================
          MOBILE MENU
      ===================================================== */}

      {!isDesktop && mobileMenu && (
        <View style={styles.mobileMenuContainer}>
          <View
            style={[
              styles.mobileMenuInner,
              {
                paddingHorizontal: isSmall ? 14 : 18,
              },
            ]}
          >
            {/* Home */}

            <MobileMenuButton
              icon="home-outline"
              label="Home"
              onPress={goHome}
              small={isSmall}
            />

            {/* Salons */}

            <MobileMenuButton
              icon="storefront-outline"
              label="Discover Salons"
              onPress={goSalons}
              small={isSmall}
            />

            {/* Appointments */}

            <MobileMenuButton
              icon="calendar-outline"
              label="My Appointments"
              onPress={goAppointments}
              small={isSmall}
            />

            <View style={styles.mobileDivider} />

            {/* User */}

            <View style={styles.mobileUserCard}>
              <View style={styles.mobileUserAvatar}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color="#6D28D9"
                />
              </View>

              <View style={styles.mobileUserInfo}>
                <Text
                  style={styles.mobileUserName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {userName}
                </Text>

                <Text style={styles.mobileUserRole}>
                  CUSTOMER
                </Text>
              </View>
            </View>

            {/* Logout */}

            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.mobileLogoutButton,
                pressed && styles.mobileLogoutPressed,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#DC2626"
              />

              <Text style={styles.mobileLogoutText}>
                Logout
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

/* =============================================================
   DESKTOP NAV BUTTON
============================================================= */

const HeaderNavButton = ({ icon, label, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navButton,
        pressed && styles.navPressed,
      ]}
    >
      <Ionicons name={icon} size={18} color="#475569" />

      <Text style={styles.navText}>{label}</Text>
    </Pressable>
  );
};

/* =============================================================
   MOBILE MENU BUTTON
============================================================= */

const MobileMenuButton = ({
  icon,
  label,
  onPress,
  small,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mobileNavButton,
        {
          paddingVertical: small ? 11 : 13,
        },
        pressed && styles.mobileNavPressed,
      ]}
    >
      <View style={styles.mobileNavIcon}>
        <Ionicons
          name={icon}
          size={18}
          color="#6D28D9"
        />
      </View>

      <Text style={styles.mobileNavText}>{label}</Text>

      <Ionicons
        name="chevron-forward"
        size={17}
        color="#CBD5E1"
      />
    </Pressable>
  );
};

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",

    // Works nicely on web and does not break native.
    zIndex: 100,
    elevation: 8,
  },

  headerInner: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logoButton: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    flexShrink: 1,
  },

  logoBox: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4C145F",

    shadowColor: "#4C145F",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 5,
  },

  logoTextContainer: {
    marginLeft: 10,
    minWidth: 0,
    flexShrink: 1,
  },

  logoText: {
    fontWeight: "900",
    letterSpacing: 3,
    color: "#172033",
  },

  logoTagline: {
    marginTop: 1,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#94A3B8",
  },

  desktopNavigation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,

    marginLeft: 20,
    marginRight: 20,
    flexShrink: 1,
  },

  navButton: {
    minHeight: 44,
    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",
    gap: 8,

    borderRadius: 12,
  },

  navPressed: {
    backgroundColor: "#F5F3FF",
  },

  navText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  profileWrapper: {
    position: "relative",
  },

  profileButton: {
    minWidth: 180,
    maxWidth: 250,

    minHeight: 48,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,

    backgroundColor: "#FFFFFF",
  },

  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F3E8FF",
  },

  profileTextContainer: {
    flex: 1,
    minWidth: 0,

    marginHorizontal: 9,
  },

  profileName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },

  profileRole: {
    marginTop: 2,

    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.3,

    color: "#94A3B8",
  },

  profileDropdown: {
    position: "absolute",

    right: 0,
    top: 56,

    width: 230,

    padding: 7,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,

    shadowColor: "#0F172A",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 10,
  },

  dropdownItem: {
    minHeight: 44,

    flexDirection: "row",
    alignItems: "center",

    gap: 11,

    paddingHorizontal: 12,
    borderRadius: 11,
  },

  dropdownPressed: {
    backgroundColor: "#F5F3FF",
  },

  logoutPressed: {
    backgroundColor: "#FEF2F2",
  },

  dropdownText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  logoutText: {
    color: "#DC2626",
  },

  menuButton: {
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,

    backgroundColor: "#FFFFFF",

    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 3,
  },

  pressed: {
    opacity: 0.75,
  },

  mobileMenuContainer: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",

    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 7,
  },

  mobileMenuInner: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",

    paddingTop: 9,
    paddingBottom: 14,
  },

  mobileNavButton: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 13,
    paddingHorizontal: 7,
  },

  mobileNavPressed: {
    backgroundColor: "#F5F3FF",
  },

  mobileNavIcon: {
    width: 38,
    height: 38,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    backgroundColor: "#F5F3FF",
  },

  mobileNavText: {
    flex: 1,

    marginLeft: 11,

    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },

  mobileDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",

    marginVertical: 9,
  },

  mobileUserCard: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 11,

    borderRadius: 14,

    backgroundColor: "#F8FAFC",
  },

  mobileUserAvatar: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,

    backgroundColor: "#F3E8FF",
  },

  mobileUserInfo: {
    flex: 1,
    minWidth: 0,

    marginLeft: 11,
  },

  mobileUserName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },

  mobileUserRole: {
    marginTop: 2,

    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,

    color: "#94A3B8",
  },

  mobileLogoutButton: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 12,
    paddingVertical: 13,

    marginTop: 6,

    borderRadius: 12,
  },

  mobileLogoutPressed: {
    backgroundColor: "#FEF2F2",
  },

  mobileLogoutText: {
    marginLeft: 10,

    fontSize: 14,
    fontWeight: "800",

    color: "#DC2626",
  },
});

export default CustomerHeader;