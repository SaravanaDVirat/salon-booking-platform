import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { loginUser } from "../../services/AuthService";

const COLORS = {
  dark: "#070A16",
  darkSoft: "#0D1020",
  darkPanel: "#111526",
  darkPanel2: "#17192B",

  white: "#FFFFFF",
  black: "#111318",

  rose: "#F43F5E",
  roseLight: "#FB7185",
  roseSoft: "#FFF1F2",

  fuchsia: "#D946EF",
  purple: "#7C3AED",

  text: "#0F172A",
  textMedium: "#475569",
  textSoft: "#64748B",
  textMuted: "#94A3B8",

  border: "#E2E8F0",
  borderSoft: "#F1F5F9",

  inputBg: "#F8FAFC",

  red: "#DC2626",
  redBg: "#FEF2F2",

  success: "#16A34A",
};

const SalonOwnerLogin = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     RESPONSIVE BREAKPOINTS
  ========================================================= */

  const isTinyMobile = width < 340;

  const isSmallMobile =
    width >= 340 && width < 380;

  const isMediumMobile =
    width >= 380 && width < 480;

  const isLargeMobile =
    width >= 480 && width < 768;

  const isTablet =
    width >= 768 && width < 1000;

  const isDesktop =
    width >= 1000;

  const horizontalPadding = isTinyMobile
    ? 14
    : isSmallMobile
      ? 17
      : isMediumMobile
        ? 20
        : isLargeMobile
          ? 28
          : isTablet
            ? 36
            : 52;

  const pagePadding = isDesktop
    ? 24
    : isTablet
      ? 18
      : 12;

  const cardRadius = isDesktop
    ? 38
    : isTablet
      ? 32
      : 26;

  const contentMaxWidth = 1500;

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      if (data?.user?.role !== "SALON_OWNER") {
        setError(
          "This login is only available for salon owners."
        );
        return;
      }

      if (!data?.token) {
        setError(
          "Login succeeded but no authentication token was received."
        );
        return;
      }

      /*
       * -------------------------------------------------------
       * RN SESSION STORAGE
       * -------------------------------------------------------
       */

      const storageItems = [
        AsyncStorage.setItem("token", data.token),
        AsyncStorage.setItem(
          "user",
          JSON.stringify(data.user)
        ),
        AsyncStorage.setItem(
          "role",
          data.user?.role || ""
        ),
        AsyncStorage.setItem(
          "userId",
          data.user?.id ||
            data.user?._id ||
            ""
        ),
        AsyncStorage.setItem(
          "userName",
          data.user?.name || ""
        ),
        AsyncStorage.setItem(
          "userEmail",
          data.user?.email || ""
        ),
      ];

      await Promise.all(storageItems);

      /*
       * -------------------------------------------------------
       * AFTER SUCCESS
       * -------------------------------------------------------
       */

      router.replace("/salon-owner/dashboard");
    } catch (err) {
      console.log(
        "Salon Owner Login Error:",
        err?.response?.data || err?.message || err
      );

      setError(
        err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     BACKGROUND GLOW COMPONENT
  ========================================================= */

  const Glow = ({
    style,
    color,
  }) => (
    <View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          backgroundColor: color,
        },
        style,
      ]}
    />
  );

  /* =========================================================
     LEFT DESKTOP BRAND PANEL
  ========================================================= */

  const renderBrandPanel = () => {
    return (
      <View style={styles.brandPanel}>
        <View style={styles.brandBackground} />

        <Glow
          color="rgba(244,63,94,0.12)"
          style={styles.brandGlowTop}
        />

        <Glow
          color="rgba(124,58,237,0.14)"
          style={styles.brandGlowBottom}
        />

        <Glow
          color="rgba(217,70,239,0.06)"
          style={styles.brandGlowCenter}
        />

        {/* subtle grid */}
        <View
          pointerEvents="none"
          style={styles.gridOverlay}
        >
          {Array.from({ length: 9 }).map(
            (_, index) => (
              <View
                key={`h-${index}`}
                style={[
                  styles.gridHorizontal,
                  {
                    top: index * 52,
                  },
                ]}
              />
            )
          )}

          {Array.from({ length: 8 }).map(
            (_, index) => (
              <View
                key={`v-${index}`}
                style={[
                  styles.gridVertical,
                  {
                    left: index * 52,
                  },
                ]}
              />
            )
          )}
        </View>

        <View
          style={[
            styles.brandContent,
            {
              paddingHorizontal:
                isDesktop
                  ? 52
                  : 36,
              paddingVertical:
                isDesktop
                  ? 48
                  : 36,
            },
          ]}
        >
          {/* BRAND */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogo}>
              <MaterialCommunityIcons
                name="storefront-outline"
                size={28}
                color={COLORS.white}
              />

              <View style={styles.logoGlow} />
            </View>

            <View style={styles.brandNameBlock}>
              <Text style={styles.brandName}>
                Salonify
              </Text>

              <Text style={styles.brandMiniText}>
                BUSINESS PLATFORM
              </Text>
            </View>
          </View>

          {/* HERO CONTENT */}
          <View style={styles.brandHero}>
            <View style={styles.portalBadge}>
              <View style={styles.portalBadgeIcon}>
                <Ionicons
                  name="person"
                  size={13}
                  color={COLORS.roseLight}
                />
              </View>

              <Text style={styles.portalBadgeText}>
                SALON OWNER PORTAL
              </Text>
            </View>

            <Text
              style={[
                styles.brandTitle,
                isTablet &&
                  styles.brandTitleTablet,
              ]}
            >
              Run your salon.
            </Text>

            <Text
              style={[
                styles.brandTitleAccent,
                isTablet &&
                  styles.brandTitleAccentTablet,
              ]}
            >
              Grow your business.
            </Text>

            <Text
              style={[
                styles.brandDescription,
                isTablet &&
                  styles.brandDescriptionTablet,
              ]}
            >
              Manage appointments, services,
              staff, customers and your complete
              salon business from one powerful and
              secure platform.
            </Text>

            {/* FEATURE CARDS */}
            <View
              style={[
                styles.featureGrid,
                isTablet &&
                  styles.featureGridTablet,
              ]}
            >
              {/* FEATURE 1 */}
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureGlow,
                    styles.featureGlowRose,
                  ]}
                />

                <View style={styles.featureIcon}>
                  <MaterialCommunityIcons
                    name="store-cog-outline"
                    size={20}
                    color={COLORS.roseLight}
                  />
                </View>

                <Text style={styles.featureTitle}>
                  Salon Management
                </Text>

                <Text style={styles.featureDescription}>
                  Everything in one place
                </Text>
              </View>

              {/* FEATURE 2 */}
              <View style={styles.featureCard}>
                <View
                  style={[
                    styles.featureGlow,
                    styles.featureGlowPurple,
                  ]}
                />

                <View
                  style={[
                    styles.featureIcon,
                    styles.featureIconPurple,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#C084FC"
                  />
                </View>

                <Text style={styles.featureTitle}>
                  Secure Access
                </Text>

                <Text style={styles.featureDescription}>
                  Protected business data
                </Text>
              </View>
            </View>
          </View>

          {/* BOTTOM TRUST */}
          <View style={styles.trustRow}>
            <View style={styles.trustLine} />

            <Text style={styles.trustText}>
              Built for modern beauty businesses
            </Text>

            <View style={styles.trustLine} />
          </View>
        </View>
      </View>
    );
  };

  /* =========================================================
     MOBILE BRAND
  ========================================================= */

  const renderMobileBrand = () => {
    return (
      <View
        style={[
          styles.mobileBrand,
          {
            marginBottom:
              isTinyMobile
                ? 26
                : 34,
          },
        ]}
      >
        <View
          style={[
            styles.mobileBrandLogo,
            isTinyMobile &&
              styles.mobileBrandLogoTiny,
          ]}
        >
          <MaterialCommunityIcons
            name="storefront-outline"
            size={
              isTinyMobile
                ? 21
                : 25
            }
            color={COLORS.white}
          />
        </View>

        <View style={styles.mobileBrandText}>
          <Text
            style={[
              styles.mobileBrandName,
              isTinyMobile &&
                styles.mobileBrandNameTiny,
            ]}
          >
            Salonify
          </Text>

          <Text
            style={[
              styles.mobileBrandPortal,
              isTinyMobile &&
                styles.mobileBrandPortalTiny,
            ]}
          >
            SALON OWNER PORTAL
          </Text>
        </View>
      </View>
    );
  };

  /* =========================================================
     INPUT COMPONENT
  ========================================================= */

  const renderInput = ({
    label,
    value,
    field,
    placeholder,
    icon,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "none",
    autoComplete,
  }) => {
    const isFocused =
      focusedInput === field;

    return (
      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputLabel,
            isTinyMobile &&
              styles.inputLabelTiny,
          ]}
        >
          {label}
        </Text>

        <View
          style={[
            styles.inputOuter,
            isFocused &&
              styles.inputOuterFocused,
            error &&
              field === "email" &&
              styles.inputOuterError,
            isTinyMobile &&
              styles.inputOuterTiny,
          ]}
        >
          {/* LEFT ICON */}
          <View
            style={[
              styles.inputIcon,
              isFocused &&
                styles.inputIconFocused,
            ]}
          >
            <Ionicons
              name={icon}
              size={
                isTinyMobile
                  ? 17
                  : 19
              }
              color={
                isFocused
                  ? COLORS.rose
                  : "#94A3B8"
              }
            />
          </View>

          {/* INPUT */}
          <TextInput
            value={value}
            onChangeText={(text) =>
              handleChange(
                field,
                text
              )
            }
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            secureTextEntry={
              secureTextEntry
            }
            keyboardType={keyboardType}
            autoCapitalize={
              autoCapitalize
            }
            autoComplete={
              autoComplete
            }
            autoCorrect={false}
            spellCheck={false}
            onFocus={() =>
              setFocusedInput(field)
            }
            onBlur={() =>
              setFocusedInput("")
            }
            style={[
              styles.textInput,
              isTinyMobile &&
                styles.textInputTiny,
            ]}
            selectionColor={
              COLORS.rose
            }
            cursorColor={
              COLORS.rose
          }
            returnKeyType={
              field === "email"
                ? "next"
                : "done"
            }
            onSubmitEditing={
              field === "password"
                ? handleSubmit
                : undefined
            }
          />

          {/* PASSWORD TOGGLE */}
          {field === "password" && (
            <Pressable
              onPress={() =>
                setShowPassword(
                  (previous) =>
                    !previous
                )
              }
              hitSlop={8}
              style={({ pressed }) => [
                styles.passwordToggle,
                pressed &&
                  styles.passwordTogglePressed,
              ]}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={
                  isTinyMobile
                    ? 19
                    : 21
                }
                color={
                  isFocused
                    ? COLORS.rose
                    : "#94A3B8"
                }
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  /* =========================================================
     LOGIN FORM
  ========================================================= */

  const renderLoginContent = () => {
    return (
      <View
        style={[
          styles.loginContent,
          {
            maxWidth:
              isDesktop
                ? 500
                : 560,
          },
        ]}
      >
        {/* MOBILE BRAND */}
        {!isDesktop &&
          renderMobileBrand()}

        {/* HEADER ICON */}
        <View
          style={[
            styles.loginHeaderIcon,
            isTinyMobile &&
              styles.loginHeaderIconTiny,
          ]}
        >
          <Ionicons
            name="person-circle-outline"
            size={
              isTinyMobile
                ? 25
                : 30
            }
            color={COLORS.rose}
          />
        </View>

        {/* HEADER */}
        <View
          style={[
            styles.loginHeader,
            isTinyMobile &&
              styles.loginHeaderTiny,
          ]}
        >
          <Text
            style={[
              styles.loginEyebrow,
              isTinyMobile &&
                styles.loginEyebrowTiny,
            ]}
          >
            OWNER ACCESS
          </Text>

          <Text
            style={[
              styles.loginTitle,
              isTinyMobile &&
                styles.loginTitleTiny,
              isSmallMobile &&
                styles.loginTitleSmall,
              isMediumMobile &&
                styles.loginTitleMedium,
              isLargeMobile &&
                styles.loginTitleLarge,
              isTablet &&
                styles.loginTitleTablet,
            ]}
          >
            Welcome back
          </Text>

          <Text
            style={[
              styles.loginDescription,
              isTinyMobile &&
                styles.loginDescriptionTiny,
              isTablet &&
                styles.loginDescriptionTablet,
            ]}
          >
            Sign in to manage your salon
            business and keep everything
            running smoothly.
          </Text>
        </View>

        {/* ERROR */}
        {error ? (
          <View
            style={[
              styles.errorBox,
              isTinyMobile &&
                styles.errorBoxTiny,
            ]}
          >
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>
                !
              </Text>
            </View>

            <Text
              style={[
                styles.errorText,
                isTinyMobile &&
                  styles.errorTextTiny,
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* FORM */}
        <View style={styles.form}>
          {/* EMAIL */}
          {renderInput({
            label: "Email Address",
            field: "email",
            value: form.email,
            placeholder:
              "owner@example.com",
            icon: "mail-outline",
            keyboardType:
              "email-address",
            autoCapitalize:
              "none",
            autoComplete:
              "email",
          })}

          {/* PASSWORD */}
          {renderInput({
            label: "Password",
            field: "password",
            value: form.password,
            placeholder:
              "Enter your password",
            icon: "lock-closed-outline",
            secureTextEntry:
              !showPassword,
            autoCapitalize:
              "none",
            autoComplete:
              "password",
          })}

          {/* REMEMBER ME */}
          <View
            style={[
              styles.optionsRow,
              isTinyMobile &&
                styles.optionsRowTiny,
            ]}
          >
            <Pressable
              onPress={() =>
                setRememberMe(
                  (previous) =>
                    !previous
                )
              }
              style={({ pressed }) => [
                styles.rememberButton,
                pressed &&
                  styles.rememberButtonPressed,
              ]}
              hitSlop={5}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberMe &&
                    styles.checkboxActive,
                  isTinyMobile &&
                    styles.checkboxTiny,
                ]}
              >
                {rememberMe && (
                  <Ionicons
                    name="checkmark"
                    size={
                      isTinyMobile
                        ? 12
                        : 14
                    }
                    color={
                      COLORS.white
                    }
                  />
                )}
              </View>

              <Text
                style={[
                  styles.rememberText,
                  isTinyMobile &&
                    styles.rememberTextTiny,
                ]}
              >
                Remember me
              </Text>
            </Pressable>
          </View>

          {/* LOGIN BUTTON */}
          <Pressable
            onPress={handleSubmit}
            disabled={loading}
            style={({ pressed }) => [
              styles.loginButton,
              isTinyMobile &&
                styles.loginButtonTiny,
              loading &&
                styles.loginButtonLoading,
              pressed &&
                !loading &&
                styles.loginButtonPressed,
            ]}
          >
            {/* decorative shine */}
            <View
              pointerEvents="none"
              style={styles.buttonShine}
            />

            {loading ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={COLORS.white}
                />

                <Text
                  style={[
                    styles.loginButtonText,
                    isTinyMobile &&
                      styles.loginButtonTextTiny,
                  ]}
                >
                  Signing in...
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={[
                    styles.loginButtonText,
                    isTinyMobile &&
                      styles.loginButtonTextTiny,
                  ]}
                >
                  Sign In
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={
                    isTinyMobile
                      ? 17
                      : 19
                  }
                  color={
                    COLORS.white
                  }
                />
              </>
            )}
          </Pressable>
        </View>

        {/* REGISTER */}
        <View
          style={[
            styles.registerRow,
            isTinyMobile &&
              styles.registerRowTiny,
          ]}
        >
          <Text
            style={[
              styles.registerText,
              isTinyMobile &&
                styles.registerTextTiny,
            ]}
          >
            Don't have a salon owner account?
          </Text>

          <Link
            href="/salon-owner/register"
            asChild
          >
            <Pressable
              hitSlop={5}
              style={({ pressed }) => [
                styles.registerLink,
                pressed &&
                  styles.registerLinkPressed,
              ]}
            >
              <Text
                style={[
                  styles.registerLinkText,
                  isTinyMobile &&
                    styles.registerLinkTextTiny,
                ]}
              >
                Register now
              </Text>
            </Pressable>
          </Link>
        </View>

        {/* SECURITY CARD */}
        <View
          style={[
            styles.securityCard,
            isTinyMobile &&
              styles.securityCardTiny,
          ]}
        >
          <View
            style={[
              styles.securityIcon,
              isTinyMobile &&
                styles.securityIconTiny,
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={
                isTinyMobile
                  ? 17
                  : 20
              }
              color="#64748B"
            />
          </View>

          <View
            style={[
              styles.securityTextBlock,
              isTinyMobile &&
                styles.securityTextBlockTiny,
            ]}
          >
            <Text
              style={[
                styles.securityTitle,
                isTinyMobile &&
                  styles.securityTitleTiny,
              ]}
              numberOfLines={2}
            >
              Secure salon management platform
            </Text>

            <Text
              style={[
                styles.securityDescription,
                isTinyMobile &&
                  styles.securityDescriptionTiny,
              ]}
              numberOfLines={2}
            >
              Your business access is protected
            </Text>
          </View>

          <Ionicons
            name="lock-closed"
            size={
              isTinyMobile
                ? 14
                : 16
            }
            color="#CBD5E1"
          />
        </View>
      </View>
    );
  };

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <View
      style={[
        styles.screen,
        {
          padding:
            pagePadding,
        },
      ]}
    >
      {/* OUTER BACKGROUND */}
      <View
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        <View
          style={styles.pageBackground}
        />

        <Glow
          color="rgba(217,70,239,0.07)"
          style={styles.pageGlowOne}
        />

        <Glow
          color="rgba(244,63,94,0.08)"
          style={styles.pageGlowTwo}
        />

        <Glow
          color="rgba(124,58,237,0.05)"
          style={styles.pageGlowThree}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardWrapper}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              minHeight:
                isDesktop
                  ? Math.max(
                      height -
                        pagePadding * 2,
                      760
                    )
                  : undefined,
            },
          ]}
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={false}
        >
          <View
            style={[
              styles.mainCard,
              {
                maxWidth:
                  contentMaxWidth,
                borderRadius:
                  cardRadius,
              },
              isDesktop &&
                styles.mainCardDesktop,
              isTablet &&
                styles.mainCardTablet,
            ]}
          >
            {/* DESKTOP / TABLET BRAND */}
            {(isDesktop || isTablet) &&
              renderBrandPanel()}

            {/* LOGIN SIDE */}
            <View
              style={[
                styles.loginPanel,
                isDesktop &&
                  styles.loginPanelDesktop,
                isTablet &&
                  styles.loginPanelTablet,
              ]}
            >
              {/* soft decorations */}
              <View
                pointerEvents="none"
                style={
                  styles.loginDecorationTop
                }
              />

              <View
                pointerEvents="none"
                style={
                  styles.loginDecorationBottom
                }
              />

              <View
                style={[
                  styles.loginPanelInner,
                  {
                    paddingHorizontal:
                      horizontalPadding,
                    paddingVertical:
                      isTinyMobile
                        ? 22
                        : isSmallMobile
                          ? 28
                          : isMediumMobile
                            ? 34
                            : isLargeMobile
                              ? 40
                              : isTablet
                                ? 48
                                : 60,
                  },
                ]}
              >
                {renderLoginContent()}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.dark,
  },

  pageBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.dark,
  },

  keyboardWrapper: {
    flex: 1,
    width: "100%",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    width: "100%",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  /* =========================================================
     GLOWS
  ========================================================= */

  glow: {
    position: "absolute",
    borderRadius: 999,
  },

  pageGlowOne: {
    width: 420,
    height: 420,
    left: -180,
    top: -180,
  },

  pageGlowTwo: {
    width: 430,
    height: 430,
    right: -190,
    bottom: -190,
  },

  pageGlowThree: {
    width: 300,
    height: 300,
    left: "45%",
    top: "35%",
  },

  /* =========================================================
     MAIN CARD
  ========================================================= */

  mainCard: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: COLORS.white,

    shadowColor: "#000000",
    shadowOpacity: 0.42,
    shadowRadius: 50,
    shadowOffset: {
      width: 0,
      height: 28,
    },

    elevation: 12,
  },

  mainCardDesktop: {
    minHeight: 760,
    flexDirection: "row",
  },

  mainCardTablet: {
    minHeight: 700,
    flexDirection: "column",
  },

  /* =========================================================
     BRAND PANEL
  ========================================================= */

  brandPanel: {
    position: "relative",
    flex: 0.94,
    minHeight: 700,
    overflow: "hidden",
    backgroundColor: COLORS.darkSoft,
  },

  brandBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkSoft,
  },

  brandGlowTop: {
    width: 480,
    height: 480,
    right: -220,
    top: -220,
  },

  brandGlowBottom: {
    width: 520,
    height: 520,
    left: -250,
    bottom: -280,
  },

  brandGlowCenter: {
    width: 300,
    height: 300,
    right: -100,
    top: "42%",
  },

  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.035,
  },

  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.white,
  },

  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.white,
  },

  brandContent: {
    position: "relative",
    zIndex: 5,
    flex: 1,
    justifyContent: "space-between",
  },

  brandHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  brandLogo: {
    position: "relative",
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.rose,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",

    shadowColor: COLORS.rose,
    shadowOpacity: 0.35,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  logoGlow: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(244,63,94,0.20)",
    zIndex: -1,
  },

  brandNameBlock: {
    minWidth: 0,
  },

  brandName: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  brandMiniText: {
    marginTop: 2,
    color: "#64748B",
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.7,
  },

  /* =========================================================
     BRAND HERO
  ========================================================= */

  brandHero: {
    flex: 1,
    justifyContent: "center",
    marginTop: 50,
    marginBottom: 35,
  },

  portalBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor:
      "rgba(255,255,255,0.045)",
  },

  portalBadgeIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(244,63,94,0.12)",
  },

  portalBadgeText: {
    color: "#CBD5E1",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.25,
  },

  brandTitle: {
    marginTop: 28,
    color: COLORS.white,
    fontSize: 55,
    lineHeight: 61,
    fontWeight: "900",
    letterSpacing: -2.4,
  },

  brandTitleTablet: {
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.8,
  },

  brandTitleAccent: {
    marginTop: 2,
    color: COLORS.roseLight,
    fontSize: 55,
    lineHeight: 61,
    fontWeight: "900",
    letterSpacing: -2.4,
  },

  brandTitleAccentTablet: {
    fontSize: 44,
    lineHeight: 50,
    letterSpacing: -1.8,
  },

  brandDescription: {
    maxWidth: 610,
    marginTop: 23,
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 25,
    fontWeight: "500",
  },

  brandDescriptionTablet: {
    fontSize: 14,
    lineHeight: 23,
  },

  /* =========================================================
     FEATURE GRID
  ========================================================= */

  featureGrid: {
    marginTop: 35,
    flexDirection: "row",
    gap: 14,
  },

  featureGridTablet: {
    gap: 10,
  },

  featureCard: {
    position: "relative",
    flex: 1,
    minHeight: 135,
    overflow: "hidden",
    padding: 18,
    borderRadius: 19,
    borderWidth: 1,
    borderColor:
      "rgba(255,255,255,0.09)",
    backgroundColor:
      "rgba(255,255,255,0.045)",
  },

  featureGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -45,
    top: -50,
  },

  featureGlowRose: {
    backgroundColor:
      "rgba(244,63,94,0.10)",
  },

  featureGlowPurple: {
    backgroundColor:
      "rgba(124,58,237,0.10)",
  },

  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
    backgroundColor:
      "rgba(244,63,94,0.10)",
    borderWidth: 1,
    borderColor:
      "rgba(244,63,94,0.10)",
  },

  featureIconPurple: {
    backgroundColor:
      "rgba(124,58,237,0.10)",
    borderColor:
      "rgba(124,58,237,0.12)",
  },

  featureTitle: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  featureDescription: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "500",
  },

  /* =========================================================
     TRUST
  ========================================================= */

  trustRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  trustLine: {
    flex: 1,
    height: 1,
    backgroundColor:
      "rgba(255,255,255,0.08)",
  },

  trustText: {
    flexShrink: 1,
    color: "#64748B",
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  /* =========================================================
     LOGIN PANEL
  ========================================================= */

  loginPanel: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },

  loginPanelDesktop: {
    flex: 1.06,
    minHeight: 760,
  },

  loginPanelTablet: {
    minHeight: 680,
  },

  loginPanelInner: {
    position: "relative",
    zIndex: 5,
    width: "100%",
    alignItems: "center",
  },

  loginDecorationTop: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    right: -140,
    top: -150,
    backgroundColor: "#FFF1F2",
    opacity: 0.85,
  },

  loginDecorationBottom: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    left: -180,
    bottom: -200,
    backgroundColor: "#F5F3FF",
    opacity: 0.75,
  },

  /* =========================================================
     LOGIN CONTENT
  ========================================================= */

  loginContent: {
    width: "100%",
    alignSelf: "center",
  },

  /* =========================================================
     MOBILE BRAND
  ========================================================= */

  mobileBrand: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  mobileBrandLogo: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.rose,

    shadowColor: COLORS.rose,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 5,
  },

  mobileBrandLogoTiny: {
    width: 43,
    height: 43,
    borderRadius: 14,
  },

  mobileBrandText: {
    minWidth: 0,
  },

  mobileBrandName: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  mobileBrandNameTiny: {
    fontSize: 18,
    lineHeight: 23,
  },

  mobileBrandPortal: {
    marginTop: 1,
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.35,
  },

  mobileBrandPortalTiny: {
    fontSize: 7,
    letterSpacing: 1,
  },

  /* =========================================================
     LOGIN HEADER
  ========================================================= */

  loginHeaderIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFE4E6",
    marginBottom: 20,
  },

  loginHeaderIconTiny: {
    width: 49,
    height: 49,
    borderRadius: 16,
    marginBottom: 15,
  },

  loginHeader: {
    marginBottom: 29,
  },

  loginHeaderTiny: {
    marginBottom: 22,
  },

  loginEyebrow: {
    color: COLORS.rose,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },

  loginEyebrowTiny: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.4,
  },

  loginTitle: {
    marginTop: 8,
    color: "#020617",
    fontSize: 39,
    lineHeight: 45,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  loginTitleTiny: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.8,
  },

  loginTitleSmall: {
    fontSize: 30,
    lineHeight: 36,
  },

  loginTitleMedium: {
    fontSize: 33,
    lineHeight: 39,
  },

  loginTitleLarge: {
    fontSize: 36,
    lineHeight: 42,
  },

  loginTitleTablet: {
    fontSize: 40,
    lineHeight: 46,
  },

  loginDescription: {
    maxWidth: 490,
    marginTop: 9,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },

  loginDescriptionTiny: {
    fontSize: 11.5,
    lineHeight: 18,
  },

  loginDescriptionTablet: {
    fontSize: 15,
    lineHeight: 24,
  },

  /* =========================================================
     ERROR
  ========================================================= */

  errorBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 20,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redBg,
  },

  errorBoxTiny: {
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 13,
  },

  errorIcon: {
    width: 21,
    height: 21,
    flexShrink: 0,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
  },

  errorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  errorTextTiny: {
    fontSize: 10.5,
    lineHeight: 16,
  },

  /* =========================================================
     FORM
  ========================================================= */

  form: {
    width: "100%",
    gap: 18,
  },

  inputGroup: {
    width: "100%",
  },

  inputLabel: {
    marginBottom: 9,
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  inputLabelTiny: {
    marginBottom: 7,
    fontSize: 11,
    lineHeight: 15,
  },

  inputOuter: {
    width: "100%",
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: COLORS.inputBg,

    /*
     * Important:
     * No absolute border/ring.
     * So keyboard focus won't visually cut the box.
     */
  },

  inputOuterTiny: {
    minHeight: 50,
    borderRadius: 14,
  },

  inputOuterFocused: {
    borderColor: COLORS.rose,
    backgroundColor: COLORS.white,

    shadowColor: COLORS.rose,
    shadowOpacity: 0.09,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 2,
  },

  inputOuterError: {
    borderColor: "#FCA5A5",
  },

  inputIcon: {
    width: 48,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  inputIconFocused: {
    backgroundColor: "transparent",
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    height: 56,
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: "#1E293B",
    fontSize: 13.5,
    fontWeight: "600",
    includeFontPadding: false,
    outlineStyle: "none",
  },

  textInputTiny: {
    height: 49,
    fontSize: 11.5,
  },

  passwordToggle: {
    width: 49,
    height: 55,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  passwordTogglePressed: {
    backgroundColor: "#F1F5F9",
    opacity: 0.75,
  },

  /* =========================================================
     OPTIONS
  ========================================================= */

  optionsRow: {
    minHeight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: -1,
  },

  optionsRowTiny: {
    minHeight: 22,
  },

  rememberButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 3,
  },

  rememberButtonPressed: {
    opacity: 0.7,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: COLORS.white,
  },

  checkboxTiny: {
    width: 15,
    height: 15,
    borderRadius: 4,
  },

  checkboxActive: {
    borderColor: COLORS.rose,
    backgroundColor: COLORS.rose,
  },

  rememberText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },

  rememberTextTiny: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* =========================================================
     LOGIN BUTTON
  ========================================================= */

  loginButton: {
    position: "relative",
    width: "100%",
    minHeight: 55,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 3,
    borderRadius: 17,
    backgroundColor: "#0F172A",

    shadowColor: "#0F172A",
    shadowOpacity: 0.20,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },

    elevation: 5,
  },

  loginButtonTiny: {
    minHeight: 48,
    borderRadius: 14,
  },

  loginButtonLoading: {
    opacity: 0.68,
  },

  loginButtonPressed: {
    backgroundColor: COLORS.rose,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  buttonShine: {
    position: "absolute",
    width: 90,
    height: 100,
    left: -45,
    top: -22,
    transform: [
      {
        rotate: "18deg",
      },
    ],
    backgroundColor:
      "rgba(255,255,255,0.055)",
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  loginButtonTextTiny: {
    fontSize: 11,
    lineHeight: 15,
  },

  /* =========================================================
     REGISTER
  ========================================================= */

  registerRow: {
    width: "100%",
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 5,
    rowGap: 3,
  },

  registerRowTiny: {
    marginTop: 19,
  },

  registerText: {
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },

  registerTextTiny: {
    fontSize: 10,
    lineHeight: 15,
  },

  registerLink: {
    paddingVertical: 2,
  },

  registerLinkPressed: {
    opacity: 0.6,
  },

  registerLinkText: {
    color: COLORS.rose,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },

  registerLinkTextTiny: {
    fontSize: 10,
    lineHeight: 15,
  },

  /* =========================================================
     SECURITY CARD
  ========================================================= */

  securityCard: {
    width: "100%",
    minHeight: 59,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 26,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },

  securityCardTiny: {
    minHeight: 51,
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
  },

  securityIcon: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  securityIconTiny: {
    width: 31,
    height: 31,
    borderRadius: 10,
  },

  securityTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  securityTextBlockTiny: {
    gap: 1,
  },

  securityTitle: {
    color: "#475569",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },

  securityTitleTiny: {
    fontSize: 9.5,
    lineHeight: 13,
  },

  securityDescription: {
    marginTop: 1,
    color: "#94A3B8",
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "500",
  },

  securityDescriptionTiny: {
    fontSize: 8,
    lineHeight: 12,
  },
});

export default SalonOwnerLogin;