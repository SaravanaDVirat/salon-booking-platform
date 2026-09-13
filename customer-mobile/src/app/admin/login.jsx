import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import adminInstance from "../../services/AdminInstance";

export default function AdminLogin() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [focusedField, setFocusedField] = useState("");

  const isDesktop = width >= 1050;
  const isTablet = width >= 700 && width < 1050;
  const isSmallMobile = width < 360;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      emailRef.current?.focus();
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      passwordRef.current?.focus();
      return;
    }

    try {
      setLoading(true);

      const response = await adminInstance.post("/auth/admin/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { token, admin } = response.data;

      if (!token || !admin) {
        throw new Error("Invalid login response from server.");
      }

      await Promise.all([
        AsyncStorage.setItem("adminToken", token),
        AsyncStorage.setItem("adminData", JSON.stringify(admin)),
      ]);

      router.replace("/admin/dashboard");
    } catch (err) {
      console.error("Admin login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to login. Please check your credentials."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      } else {
        setError(
          err.message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getContainerWidth = () => {
    if (isDesktop) {
      return 560;
    }

    if (isTablet) {
      return 560;
    }

    if (isSmallMobile) {
      return width - 28;
    }

    return width - 36;
  };

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#090611"
      />

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.glowPurpleTop,
          {
            width: isDesktop ? 520 : 330,
            height: isDesktop ? 520 : 330,
            right: isDesktop ? -150 : -110,
            top: isDesktop ? -170 : -100,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.glowPinkBottom,
          {
            width: isDesktop ? 500 : 330,
            height: isDesktop ? 500 : 330,
            left: isDesktop ? -180 : -130,
            bottom: isDesktop ? -180 : -120,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.glowBlueCenter,
          {
            width: isDesktop ? 380 : 250,
            height: isDesktop ? 380 : 250,
            right: isDesktop ? width * 0.18 : -70,
            top: height * 0.38,
          },
        ]}
      />

      {/* =====================================================
          MAIN RESPONSIVE CONTAINER
      ===================================================== */}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight: height,
              paddingHorizontal: isDesktop ? 0 : 14,
              paddingVertical: isDesktop ? 0 : 18,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.mainContainer,
              {
                width: isDesktop ? "100%" : "100%",
                minHeight: isDesktop ? height : undefined,
                flexDirection: isDesktop ? "row" : "column",
              },
            ]}
          >
            {/* =================================================
                LEFT PREMIUM PANEL
            ================================================= */}

            {isDesktop && (
              <View style={styles.leftPanel}>
                <View style={styles.leftPanelOverlay} />

                <View style={styles.leftContent}>
                  {/* BRAND */}

                  <View style={styles.brandRow}>
                    <View style={styles.brandIconBox}>
                      <MaterialCommunityIcons
                        name="content-cut"
                        size={34}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.brandTextContainer}>
                      <Text style={styles.brandTitle}>
                        Salon
                        <Text style={styles.brandAccent}>
                          ique
                        </Text>
                      </Text>

                      <Text style={styles.brandSubtitle}>
                        ADMIN PORTAL
                      </Text>
                    </View>
                  </View>

                  {/* HERO */}

                  <View style={styles.heroContent}>
                    <View style={styles.secureBadge}>
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color="#C4A7FF"
                      />

                      <Text style={styles.secureBadgeText}>
                        SECURE ADMINISTRATION
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.heroTitle,
                        {
                          fontSize: width >= 1300 ? 66 : 56,
                        },
                      ]}
                    >
                      Manage
                      {"\n"}
                      <Text style={styles.heroAccent}>
                        your empire.
                      </Text>
                    </Text>

                    <Text style={styles.heroDescription}>
                      Control every aspect of your salon
                      platform. Manage salons, staff,
                      customers, bookings, and services
                      from one powerful dashboard.
                    </Text>

                    {/* FEATURES */}

                    <View style={styles.featuresContainer}>
                      <FeatureItem
                        icon="shield-check"
                        iconColor="#C4A7FF"
                        iconBackground="#8B5CF622"
                        borderColor="#A78BFA55"
                        title="Secure Administration"
                        description="Enterprise-grade security & encryption"
                      />

                      <FeatureItem
                        icon="account-group"
                        iconColor="#67E8F9"
                        iconBackground="#06B6D422"
                        borderColor="#22D3EE55"
                        title="Full Platform Control"
                        description="Manage salons, staff, and services"
                      />

                      <FeatureItem
                        icon="calendar-check"
                        iconColor="#F9A8D4"
                        iconBackground="#EC489922"
                        borderColor="#F472B655"
                        title="Real-time Insights"
                        description="Monitor bookings and performance metrics"
                      />
                    </View>
                  </View>

                  {/* FOOTER */}

                  <View style={styles.leftFooter}>
                    <Text style={styles.footerCopyright}>
                      © 2026 Salonique
                    </Text>

                    <View style={styles.poweredRow}>
                      <Ionicons
                        name="flash"
                        size={13}
                        color="#A78BFA"
                      />

                      <Text style={styles.poweredText}>
                        Powered by Salonique
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* =================================================
                RIGHT LOGIN PANEL
            ================================================= */}

            <View
              style={[
                styles.rightPanel,
                {
                  flex: isDesktop ? 1 : undefined,
                  width: isDesktop ? undefined : "100%",
                  minHeight: isDesktop ? height : undefined,
                  paddingHorizontal: isDesktop
                    ? 32
                    : isTablet
                    ? 28
                    : 0,
                  paddingVertical: isDesktop
                    ? 30
                    : 0,
                },
              ]}
            >
              {/* MOBILE / TABLET BRAND */}

              {!isDesktop && (
                <View
                  style={[
                    styles.mobileBrandCard,
                    {
                      width: getContainerWidth(),
                      alignSelf: "center",
                      paddingHorizontal: isSmallMobile
                        ? 14
                        : 18,
                    },
                  ]}
                >
                  <View style={styles.mobileBrandLeft}>
                    <View
                      style={[
                        styles.mobileBrandIcon,
                        {
                          width: isSmallMobile ? 48 : 54,
                          height: isSmallMobile ? 48 : 54,
                          borderRadius: isSmallMobile ? 15 : 17,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="content-cut"
                        size={isSmallMobile ? 25 : 29}
                        color="#FFFFFF"
                      />
                    </View>

                    <View style={styles.mobileBrandText}>
                      <Text
                        style={[
                          styles.mobileBrandTitle,
                          {
                            fontSize: isSmallMobile ? 25 : 29,
                          },
                        ]}
                      >
                        Salon
                        <Text style={styles.mobileBrandAccent}>
                          ique
                        </Text>
                      </Text>

                      <Text
                        style={[
                          styles.mobileBrandSubtitle,
                          {
                            fontSize: isSmallMobile ? 8 : 9,
                          },
                        ]}
                      >
                        ADMIN PORTAL
                      </Text>
                    </View>
                  </View>

                  <View style={styles.mobileSecureDot}>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#E9D5FF"
                    />
                  </View>
                </View>
              )}

              {/* LOGIN CARD */}

              <View
                style={[
                  styles.loginCard,
                  {
                    width: getContainerWidth(),
                    alignSelf: "center",
                    marginTop: isDesktop
                      ? 0
                      : isSmallMobile
                      ? 16
                      : 20,
                    paddingHorizontal: isSmallMobile
                      ? 18
                      : isTablet
                      ? 34
                      : 24,
                    paddingVertical: isSmallMobile
                      ? 24
                      : isTablet
                      ? 34
                      : 28,
                    borderRadius: isSmallMobile ? 24 : 28,
                  },
                ]}
              >
                {/* LOGIN HEADER */}

                <View style={styles.loginHeader}>
                  <View
                    style={[
                      styles.lockIconBox,
                      {
                        width: isSmallMobile ? 58 : 64,
                        height: isSmallMobile ? 58 : 64,
                        borderRadius: isSmallMobile ? 18 : 20,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={isSmallMobile ? 28 : 31}
                      color="#7C3AED"
                    />
                  </View>

                  <View style={styles.secureAccessBadge}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color="#7C3AED"
                    />

                    <Text style={styles.secureAccessText}>
                      SECURE ADMIN ACCESS
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.loginTitle,
                      {
                        fontSize: isSmallMobile
                          ? 38
                          : isTablet
                          ? 48
                          : 42,
                      },
                    ]}
                  >
                    Welcome
                    {"\n"}
                    <Text style={styles.loginTitleAccent}>
                      back
                    </Text>
                  </Text>

                  <Text style={styles.loginDescription}>
                    Sign in to your admin dashboard and
                    manage your salon platform.
                  </Text>
                </View>

                {/* ERROR */}

                {error ? (
                  <View style={styles.errorBox}>
                    <View style={styles.errorIconBox}>
                      <Ionicons
                        name="alert-circle"
                        size={21}
                        color="#DC2626"
                      />
                    </View>

                    <Text style={styles.errorText}>
                      {error}
                    </Text>
                  </View>
                ) : null}

                {/* =================================================
                    EMAIL
                ================================================= */}

                <View style={styles.fieldBlock}>
                  <Text style={styles.fieldLabel}>
                    EMAIL ADDRESS
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "email" &&
                        styles.inputContainerFocused,
                      error &&
                        !formData.email.trim() &&
                        styles.inputContainerError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={22}
                      color={
                        focusedField === "email"
                          ? "#7C3AED"
                          : "#94A3B8"
                      }
                    />

                    <TextInput
                      ref={emailRef}
                      style={styles.textInput}
                      value={formData.email}
                      onChangeText={(value) =>
                        updateField("email", value)
                      }
                      placeholder="admin@salon.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      editable={!loading}
                      returnKeyType="next"
                      onFocus={() =>
                        setFocusedField("email")
                      }
                      onBlur={() =>
                        setFocusedField("")
                      }
                      onSubmitEditing={() =>
                        passwordRef.current?.focus()
                      }
                    />
                  </View>
                </View>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <View
                  style={[
                    styles.fieldBlock,
                    {
                      marginTop: isSmallMobile ? 18 : 20,
                    },
                  ]}
                >
                  <View style={styles.passwordLabelRow}>
                    <Text style={styles.fieldLabel}>
                      PASSWORD
                    </Text>

                    <View style={styles.secureMiniBadge}>
                      <Ionicons
                        name="shield-checkmark"
                        size={11}
                        color="#7C3AED"
                      />

                      <Text style={styles.secureMiniText}>
                        SECURE
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === "password" &&
                        styles.inputContainerFocused,
                      error &&
                        !formData.password &&
                        styles.inputContainerError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={22}
                      color={
                        focusedField === "password"
                          ? "#7C3AED"
                          : "#94A3B8"
                      }
                    />

                    <TextInput
                      ref={passwordRef}
                      style={[
                        styles.textInput,
                        styles.passwordInput,
                      ]}
                      value={formData.password}
                      onChangeText={(value) =>
                        updateField("password", value)
                      }
                      placeholder="Enter your admin password"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      editable={!loading}
                      returnKeyType="done"
                      onFocus={() =>
                        setFocusedField("password")
                      }
                      onBlur={() =>
                        setFocusedField("")
                      }
                      onSubmitEditing={handleSubmit}
                    />

                    <Pressable
                      onPress={() =>
                        setShowPassword((prev) => !prev)
                      }
                      disabled={loading}
                      hitSlop={10}
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.eyeButtonPressed,
                      ]}
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={23}
                        color={
                          showPassword
                            ? "#7C3AED"
                            : "#94A3B8"
                        }
                      />
                    </Pressable>
                  </View>
                </View>

                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <Pressable
                  onPress={handleSubmit}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.loginButton,
                    {
                      height: isSmallMobile ? 58 : 62,
                      marginTop: isSmallMobile ? 25 : 30,
                    },
                    pressed &&
                      !loading &&
                      styles.loginButtonPressed,
                    loading && styles.loginButtonDisabled,
                  ]}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator
                        size="small"
                        color="#FFFFFF"
                      />

                      <Text style={styles.loginButtonText}>
                        SIGNING IN...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>
                        SIGN IN
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={22}
                        color="#FFFFFF"
                      />
                    </>
                  )}
                </Pressable>

                {/* =================================================
                    SECURITY FOOTER
                ================================================= */}

                <View
                  style={[
                    styles.securityFooter,
                    {
                      marginTop: isSmallMobile ? 20 : 24,
                    },
                  ]}
                >
                  <View style={styles.securityFooterIcon}>
                    <Ionicons
                      name="shield-checkmark"
                      size={18}
                      color="#7C3AED"
                    />
                  </View>

                  <Text style={styles.securityFooterText}>
                    Your login is protected by{"\n"}
                    <Text style={styles.securityFooterStrong}>
                      enterprise-grade encryption
                    </Text>
                  </Text>
                </View>
              </View>

              {/* MOBILE COPYRIGHT */}

              {!isDesktop && (
                <View
                  style={[
                    styles.mobileCopyright,
                    {
                      width: getContainerWidth(),
                      alignSelf: "center",
                    },
                  ]}
                >
                  <Text style={styles.mobileCopyrightText}>
                    © 2026{" "}
                    <Text style={styles.mobileCopyrightAccent}>
                      Salonique
                    </Text>{" "}
                    Admin Portal
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ============================================================
   FEATURE ITEM
============================================================ */

function FeatureItem({
  icon,
  iconColor,
  iconBackground,
  borderColor,
  title,
  description,
}) {
  return (
    <View style={styles.featureRow}>
      <View
        style={[
          styles.featureIconBox,
          {
            backgroundColor: iconBackground,
            borderColor,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={iconColor}
        />
      </View>

      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#090611",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  mainContainer: {
    flex: 1,
    overflow: "hidden",
  },

  /* ==========================================================
     BACKGROUND GLOWS
  ========================================================== */

  glowPurpleTop: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    opacity: 0.18,
    shadowColor: "#A855F7",
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },

  glowPinkBottom: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#EC4899",
    opacity: 0.14,
    shadowColor: "#EC4899",
    shadowOpacity: 0.7,
    shadowRadius: 100,
  },

  glowBlueCenter: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "#06B6D4",
    opacity: 0.08,
  },

  /* ==========================================================
     LEFT PANEL
  ========================================================== */

  leftPanel: {
    width: "46%",
    minWidth: 450,
    backgroundColor: "#0D0A16",
    position: "relative",
    overflow: "hidden",
    borderRightWidth: 1,
    borderRightColor: "#FFFFFF0D",
  },

  leftPanelOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#171125",
    opacity: 0.52,
  },

  leftContent: {
    flex: 1,
    paddingHorizontal: 58,
    paddingVertical: 48,
    justifyContent: "space-between",
    zIndex: 2,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIconBox: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: "#7C3AED",
    borderWidth: 1,
    borderColor: "#C4B5FD55",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },

  brandTextContainer: {
    marginLeft: 15,
  },

  brandTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  brandAccent: {
    color: "#C4B5FD",
  },

  brandSubtitle: {
    marginTop: 4,
    color: "#C4B5FD99",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2.4,
  },

  heroContent: {
    maxWidth: 650,
    alignSelf: "center",
    width: "100%",
  },

  secureBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#8B5CF61A",
    borderWidth: 1,
    borderColor: "#A78BFA44",
  },

  secureBadgeText: {
    marginLeft: 7,
    color: "#C4B5FD",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  heroTitle: {
    marginTop: 27,
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -3.1,
    lineHeight: 65,
  },

  heroAccent: {
    color: "#C4B5FD",
  },

  heroDescription: {
    marginTop: 24,
    color: "#FFFFFFA8",
    fontSize: 16,
    lineHeight: 27,
    fontWeight: "400",
    maxWidth: 590,
  },

  featuresContainer: {
    marginTop: 42,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
  },

  featureIconBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  featureText: {
    flex: 1,
    marginLeft: 16,
  },

  featureTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },

  featureDescription: {
    color: "#FFFFFF80",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
  },

  leftFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  footerCopyright: {
    color: "#FFFFFF66",
    fontSize: 11,
    fontWeight: "600",
  },

  poweredRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  poweredText: {
    marginLeft: 5,
    color: "#FFFFFF66",
    fontSize: 11,
    fontWeight: "600",
  },

  /* ==========================================================
     RIGHT PANEL
  ========================================================== */

  rightPanel: {
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ==========================================================
     MOBILE BRAND
  ========================================================== */

  mobileBrandCard: {
    minHeight: 76,
    borderRadius: 25,
    backgroundColor: "#5B21B6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#FFFFFF1A",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.28,
    shadowRadius: 25,
    elevation: 9,
  },

  mobileBrandLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  mobileBrandIcon: {
    backgroundColor: "#FFFFFF14",
    borderWidth: 1,
    borderColor: "#FFFFFF24",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileBrandText: {
    marginLeft: 12,
    flexShrink: 1,
  },

  mobileBrandTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    letterSpacing: -1.4,
  },

  mobileBrandAccent: {
    color: "#DDD6FE",
  },

  mobileBrandSubtitle: {
    color: "#E9D5FFCC",
    fontWeight: "900",
    letterSpacing: 2.2,
    marginTop: 2,
  },

  mobileSecureDot: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFFFFF12",
    borderWidth: 1,
    borderColor: "#FFFFFF20",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  /* ==========================================================
     LOGIN CARD
  ========================================================== */

  loginCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.13,
    shadowRadius: 35,
    elevation: 12,
  },

  loginHeader: {
    alignItems: "flex-start",
  },

  lockIconBox: {
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 3,
  },

  secureAccessBadge: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },

  secureAccessText: {
    marginLeft: 6,
    color: "#6D28D9",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  loginTitle: {
    marginTop: 17,
    color: "#0F172A",
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 42,
  },

  loginTitleAccent: {
    color: "#7C3AED",
  },

  loginDescription: {
    marginTop: 11,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    maxWidth: 440,
  },

  /* ==========================================================
     ERROR
  ========================================================== */

  errorBox: {
    marginTop: 22,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 17,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
  },

  errorIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    flex: 1,
    marginLeft: 9,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  /* ==========================================================
     FORM
  ========================================================== */

  fieldBlock: {
    marginTop: 26,
  },

  fieldLabel: {
    color: "#1E293B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.15,
  },

  passwordLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  secureMiniBadge: {
    flexDirection: "row",
    alignItems: "center",
  },

  secureMiniText: {
    marginLeft: 4,
    color: "#7C3AED",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  /*
    IMPORTANT:
    Entire input line receives focus border.
    Icon + TextInput + Eye button are inside same container.
  */

  inputContainer: {
    width: "100%",
    minHeight: 58,
    marginTop: 9,
    paddingHorizontal: 17,
    borderRadius: 17,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
  },

  inputContainerFocused: {
    backgroundColor: "#FFFFFF",
    borderColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 2,
  },

  inputContainerError: {
    borderColor: "#FCA5A5",
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    height: 56,
    marginLeft: 12,
    paddingVertical: 0,
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
    outlineStyle: "none",
  },

  passwordInput: {
    paddingRight: 4,
  },

  eyeButton: {
    width: 38,
    height: 42,
    marginLeft: 5,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  eyeButtonPressed: {
    backgroundColor: "#F5F3FF",
  },

  /* ==========================================================
     LOGIN BUTTON
  ========================================================== */

  loginButton: {
    width: "100%",
    borderRadius: 17,
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 7,
  },

  loginButtonPressed: {
    transform: [
      {
        scale: 0.985,
      },
    ],
    backgroundColor: "#6D28D9",
  },

  loginButtonDisabled: {
    opacity: 0.72,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.6,
    marginHorizontal: 9,
  },

  /* ==========================================================
     SECURITY FOOTER
  ========================================================== */

  securityFooter: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  securityFooterIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  securityFooterText: {
    marginLeft: 9,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  securityFooterStrong: {
    color: "#6D28D9",
    fontWeight: "900",
  },

  /* ==========================================================
     MOBILE COPYRIGHT
  ========================================================== */

  mobileCopyright: {
    alignItems: "center",
    paddingTop: 17,
    paddingBottom: 4,
  },

  mobileCopyrightText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  mobileCopyrightAccent: {
    color: "#7C3AED",
    fontWeight: "900",
  },
});