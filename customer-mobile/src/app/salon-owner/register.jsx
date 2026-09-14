import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { registerSalonOwner } from "../../services/AuthService";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#070A16",
  background2: "#0B0E1D",

  white: "#FFFFFF",
  black: "#05060C",

  text: "#111827",
  textDark: "#0F172A",
  textMedium: "#475569",
  textSoft: "#64748B",
  textMuted: "#94A3B8",

  rose: "#F43F5E",
  roseLight: "#FB7185",
  roseSoft: "#FFF1F2",

  fuchsia: "#D946EF",
  purple: "#8B5CF6",

  border: "#E2E8F0",
  borderSoft: "#F1F5F9",

  inputBackground: "#F8FAFC",

  error: "#DC2626",
  errorBackground: "#FEF2F2",
  errorBorder: "#FECACA",

  success: "#16A34A",
};

/* =========================================================
   FEATURE DATA
========================================================= */

const FEATURES = [
  {
    icon: "storefront-outline",
    title: "Manage your salon profile",
  },
  {
    icon: "cut",
    title: "Create and manage services",
  },
  {
    icon: "account-group-outline",
    title: "Manage staff and availability",
  },
  {
    icon: "calendar-check-outline",
    title: "Handle customer appointments",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

const SalonOwnerRegister = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  /* =======================================================
     RESPONSIVE BREAKPOINTS
  ======================================================= */

  const isTinyMobile = width < 340;

  const isSmallMobile =
    width >= 340 && width < 390;

  const isMediumMobile =
    width >= 390 && width < 480;

  const isLargeMobile =
    width >= 480 && width < 768;

  const isTablet =
    width >= 768 && width < 1100;

  const isLaptop =
    width >= 1100;

  const isShortScreen = height < 700;

  /* =======================================================
     RESPONSIVE VALUES
  ======================================================= */

  const horizontalPadding = useMemo(() => {
    if (isTinyMobile) return 14;
    if (isSmallMobile) return 16;
    if (isMediumMobile) return 20;
    if (isLargeMobile) return 28;
    if (isTablet) return 40;
    return 58;
  }, [
    isTinyMobile,
    isSmallMobile,
    isMediumMobile,
    isLargeMobile,
    isTablet,
  ]);

  const contentMaxWidth = isLaptop
    ? 1480
    : isTablet
      ? 900
      : 600;

  const formMaxWidth = isLaptop
    ? 510
    : isTablet
      ? 540
      : 560;

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [focusedField, setFocusedField] =
    useState("");

  /* =======================================================
     CHANGE HANDLER
  ======================================================= */

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /* =======================================================
     REGISTER
  ======================================================= */

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters"
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await registerSalonOwner({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      /* =================================================
         SAVE SESSION
      ================================================= */

      if (data?.token) {
        await AsyncStorage.setItem(
          "token",
          data.token
        );
      }

      if (data?.user) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

        await Promise.all([
          AsyncStorage.setItem(
            "role",
            data.user.role || ""
          ),

          AsyncStorage.setItem(
            "userId",
            data.user.id ||
              data.user._id ||
              ""
          ),

          AsyncStorage.setItem(
            "userName",
            data.user.name || ""
          ),

          AsyncStorage.setItem(
            "userEmail",
            data.user.email || ""
          ),
        ]);
      }

      /* =================================================
         GO TO DASHBOARD
      ================================================= */

      router.replace("/salon-owner/dashboard");
    } catch (err) {
      console.error(
        "Salon Owner Registration Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INPUT STYLE HELPER
  ======================================================= */

  const getInputContainerStyle = (field) => {
    const focused = focusedField === field;

    return [
      styles.inputContainer,

      focused && styles.inputContainerFocused,

      isTinyMobile &&
        styles.inputContainerTiny,
    ];
  };

  /* =======================================================
     INPUT TEXT STYLE
  ======================================================= */

  const getInputStyle = () => {
    if (isTinyMobile) {
      return styles.inputTiny;
    }

    if (isSmallMobile) {
      return styles.inputSmall;
    }

    return styles.input;
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>

        {/* =================================================
            BACKGROUND DECORATION
        ================================================== */}

        <View
          pointerEvents="none"
          style={styles.backgroundLayer}
        >
          <View style={styles.backgroundGlowTop} />

          <View style={styles.backgroundGlowBottom} />

          <View style={styles.backgroundGlowCenter} />

          <View style={styles.backgroundDotOne} />
          <View style={styles.backgroundDotTwo} />
          <View style={styles.backgroundDotThree} />
        </View>

        {/* =================================================
            KEYBOARD HANDLING
        ================================================== */}

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          keyboardVerticalOffset={
            Platform.OS === "ios" ? 12 : 0
          }
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingHorizontal:
                  horizontalPadding,
                minHeight:
                  Platform.OS === "web"
                    ? Math.max(height - 20, 700)
                    : undefined,
              },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            removeClippedSubviews={false}
            {...(Platform.OS === "android"
              ? { nestedScrollEnabled: true }
              : {})}
          >
            {/* =================================================
                MAIN CARD
            ================================================== */}

            <View
              style={[
                styles.mainCard,
                {
                  maxWidth: contentMaxWidth,
                },

                isTablet &&
                  styles.mainCardTablet,

                isLaptop &&
                  styles.mainCardLaptop,
              ]}
            >
              {/* =================================================
                  LEFT HERO
              ================================================== */}

              {isTablet || isLaptop ? (
                <View
                  style={[
                    styles.heroPanel,

                    isTablet &&
                      styles.heroPanelTablet,

                    isLaptop &&
                      styles.heroPanelLaptop,
                  ]}
                >
                  {/* Hero background layers */}

                  <View style={styles.heroBase} />

                  <View
                    pointerEvents="none"
                    style={styles.heroGlowRose}
                  />

                  <View
                    pointerEvents="none"
                    style={styles.heroGlowPurple}
                  />

                  <View
                    pointerEvents="none"
                    style={styles.heroGlowPink}
                  />

                  {/* Grid pattern */}

                  <View
                    pointerEvents="none"
                    style={styles.gridPattern}
                  >
                    {Array.from({
                      length: 10,
                    }).map((_, index) => (
                      <View
                        key={`h-${index}`}
                        style={[
                          styles.gridHorizontal,
                          {
                            top:
                              index * 44,
                          },
                        ]}
                      />
                    ))}

                    {Array.from({
                      length: 9,
                    }).map((_, index) => (
                      <View
                        key={`v-${index}`}
                        style={[
                          styles.gridVertical,
                          {
                            left:
                              index * 44,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  <View
                    style={[
                      styles.heroContent,

                      isLaptop &&
                        styles.heroContentLaptop,

                      isTablet &&
                        styles.heroContentTablet,
                    ]}
                  >
                    {/* =================================================
                        BRAND
                    ================================================== */}

                    <View style={styles.brandRow}>
                      <View style={styles.brandIconWrapper}>
                        <View
                          style={
                            styles.brandIconGlow
                          }
                        />

                        <View
                          style={styles.brandIcon}
                        >
                          <Ionicons
                            name="storefront-outline"
                            size={
                              isLaptop ? 26 : 23
                            }
                            color={
                              COLORS.white
                            }
                          />
                        </View>
                      </View>

                      <View
                        style={styles.brandTextBlock}
                      >
                        <Text
                          style={styles.brandName}
                        >
                          Salonify
                        </Text>

                        <Text
                          style={
                            styles.brandSubtitle
                          }
                        >
                          BEAUTY BUSINESS PLATFORM
                        </Text>
                      </View>
                    </View>

                    {/* =================================================
                        HERO MAIN
                    ================================================== */}

                    <View
                      style={
                        styles.heroMainContent
                      }
                    >
                      <View
                        style={styles.portalBadge}
                      >
                        <View
                          style={
                            styles.portalBadgeIcon
                          }
                        >
                          <Ionicons
                            name="person-outline"
                            size={13}
                            color={
                              COLORS.roseLight
                            }
                          />
                        </View>

                        <Text
                          style={
                            styles.portalBadgeText
                          }
                        >
                          SALON OWNER REGISTRATION
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.heroTitle,

                          isTablet &&
                            styles.heroTitleTablet,

                          isLaptop &&
                            styles.heroTitleLaptop,
                        ]}
                      >
                        Build your salon.
                      </Text>

                      <Text
                        style={[
                          styles.heroAccent,

                          isTablet &&
                            styles.heroAccentTablet,

                          isLaptop &&
                            styles.heroAccentLaptop,
                        ]}
                      >
                        Grow digitally.
                      </Text>

                      <Text
                        style={[
                          styles.heroDescription,

                          isTablet &&
                            styles.heroDescriptionTablet,

                          isLaptop &&
                            styles.heroDescriptionLaptop,
                        ]}
                      >
                        Create your salon owner
                        account and take complete
                        control of your business,
                        team, services and customer
                        appointments from one
                        powerful platform.
                      </Text>

                      {/* =================================================
                          FEATURES
                      ================================================== */}

                      <View
                        style={
                          styles.featureList
                        }
                      >
                        {FEATURES.map(
                          (feature, index) => (
                            <View
                              key={feature.title}
                              style={[
                                styles.featureItem,

                                index ===
                                  FEATURES.length -
                                    1 &&
                                  styles.featureItemLast,
                              ]}
                            >
                              <View
                                style={
                                  styles.featureIcon
                                }
                              >
                                <MaterialCommunityIcons
                                  name={
                                    feature.icon
                                  }
                                  size={16}
                                  color={
                                    COLORS.roseLight
                                  }
                                />
                              </View>

                              <Text
                                style={
                                  styles.featureText
                                }
                              >
                                {feature.title}
                              </Text>
                            </View>
                          )
                        )}
                      </View>

                      {/* =================================================
                          MINI CARDS
                      ================================================== */}

                      <View
                        style={
                          styles.miniCardsRow
                        }
                      >
                        <View
                          style={
                            styles.miniCard
                          }
                        >
                          <View
                            style={
                              styles.miniCardIcon
                            }
                          >
                            <Ionicons
                              name="settings-outline"
                              size={17}
                              color={
                                COLORS.roseLight
                              }
                            />
                          </View>

                          <Text
                            style={
                              styles.miniCardTitle
                            }
                          >
                            Complete Control
                          </Text>

                          <Text
                            style={
                              styles.miniCardDescription
                            }
                          >
                            Run your business from
                            one place
                          </Text>
                        </View>

                        <View
                          style={
                            styles.miniCard
                          }
                        >
                          <View
                            style={
                              styles.miniCardIconPurple
                            }
                          >
                            <Ionicons
                              name="shield-checkmark-outline"
                              size={17}
                              color={
                                "#C084FC"
                              }
                            />
                          </View>

                          <Text
                            style={
                              styles.miniCardTitle
                            }
                          >
                            Owner Access
                          </Text>

                          <Text
                            style={
                              styles.miniCardDescription
                            }
                          >
                            Secure business
                            management
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* =================================================
                        BOTTOM TRUST
                    ================================================== */}

                    <View
                      style={
                        styles.trustRow
                      }
                    >
                      <View
                        style={
                          styles.trustLine
                        }
                      />

                      <Text
                        style={
                          styles.trustText
                        }
                      >
                        Built for modern beauty
                        businesses
                      </Text>

                      <View
                        style={
                          styles.trustLine
                        }
                      />
                    </View>
                  </View>
                </View>
              ) : null}

              {/* =================================================
                  RIGHT FORM PANEL
              ================================================== */}

              <View
                style={[
                  styles.formPanel,

                  isTablet &&
                    styles.formPanelTablet,

                  isLaptop &&
                    styles.formPanelLaptop,

                  !isTablet &&
                    !isLaptop &&
                    styles.formPanelMobile,
                ]}
              >
                {/* Soft decorations */}

                <View
                  pointerEvents="none"
                  style={styles.formGlowTop}
                />

                <View
                  pointerEvents="none"
                  style={styles.formGlowBottom}
                />

                <View
                  style={[
                    styles.formContent,
                    {
                      maxWidth:
                        formMaxWidth,
                    },
                  ]}
                >
                  {/* =================================================
                      MOBILE BRAND
                  ================================================== */}

                  {!isTablet && !isLaptop && (
                    <View
                      style={[
                        styles.mobileBrand,
                        isShortScreen &&
                          styles.mobileBrandCompact,
                      ]}
                    >
                      <View
                        style={
                          styles.mobileBrandIcon
                        }
                      >
                        <Ionicons
                          name="storefront-outline"
                          size={
                            isTinyMobile
                              ? 20
                              : 23
                          }
                          color={
                            COLORS.white
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.mobileBrandText
                        }
                      >
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
                            styles.mobileBrandSubtitle,
                            isTinyMobile &&
                              styles.mobileBrandSubtitleTiny,
                          ]}
                        >
                          SALON OWNER PORTAL
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* =================================================
                      HEADER
                  ================================================== */}

                  <View
                    style={[
                      styles.formHeader,

                      isShortScreen &&
                        styles.formHeaderCompact,
                    ]}
                  >
                    <View
                      style={[
                        styles.formHeaderIcon,
                        isTinyMobile &&
                          styles.formHeaderIconTiny,
                      ]}
                    >
                      <Ionicons
                        name="person-add-outline"
                        size={
                          isTinyMobile
                            ? 21
                            : 25
                        }
                        color={
                          COLORS.rose
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.formEyebrow,

                        isTinyMobile &&
                          styles.formEyebrowTiny,
                      ]}
                    >
                      GET STARTED
                    </Text>

                    <Text
                      style={[
                        styles.formTitle,

                        isTinyMobile &&
                          styles.formTitleTiny,

                        isSmallMobile &&
                          styles.formTitleSmall,

                        isTablet &&
                          styles.formTitleTablet,

                        isLaptop &&
                          styles.formTitleLaptop,
                      ]}
                    >
                      Create your account
                    </Text>

                    <Text
                      style={[
                        styles.formDescription,

                        isTinyMobile &&
                          styles.formDescriptionTiny,
                      ]}
                    >
                      Join Salonify and start
                      managing your salon digitally
                      with a smarter business
                      experience.
                    </Text>
                  </View>

                  {/* =================================================
                      ERROR
                  ================================================== */}

                  {error ? (
                    <View
                      style={[
                        styles.errorBox,

                        isTinyMobile &&
                          styles.errorBoxTiny,
                      ]}
                    >
                      <View
                        style={
                          styles.errorIcon
                        }
                      >
                        <Text
                          style={
                            styles.errorIconText
                          }
                        >
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

                  {/* =================================================
                      FORM
                  ================================================== */}

                  <View
                    style={[
                      styles.form,

                      isShortScreen &&
                        styles.formCompact,
                    ]}
                  >
                    {/* =================================================
                        FULL NAME
                    ================================================== */}

                    <View
                      style={styles.field}
                    >
                      <Text
                        style={[
                          styles.label,
                          isTinyMobile &&
                            styles.labelTiny,
                        ]}
                      >
                        Full Name
                      </Text>

                      <View
                        style={getInputContainerStyle(
                          "name"
                        )}
                      >
                        <View
                          style={
                            styles.inputIcon
                          }
                        >
                          <Ionicons
                            name="person-outline"
                            size={
                              isTinyMobile
                                ? 18
                                : 19
                            }
                            color={
                              focusedField ===
                              "name"
                                ? COLORS.rose
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <TextInput
                          value={form.name}
                          onChangeText={(value) =>
                            handleChange(
                              "name",
                              value
                            )
                          }
                          placeholder="Your full name"
                          placeholderTextColor="#94A3B8"
                          style={getInputStyle()}
                          onFocus={() =>
                            setFocusedField(
                              "name"
                            )
                          }
                          onBlur={() =>
                            setFocusedField("")
                          }
                          autoCapitalize="words"
                          autoCorrect={false}
                          returnKeyType="next"
                           autoComplete="name"
                          selectionColor={
                            COLORS.rose
                          }
                        />
                      </View>
                    </View>

                    {/* =================================================
                        EMAIL
                    ================================================== */}

                    <View
                      style={styles.field}
                    >
                      <Text
                        style={[
                          styles.label,
                          isTinyMobile &&
                            styles.labelTiny,
                        ]}
                      >
                        Email Address
                      </Text>

                      <View
                        style={getInputContainerStyle(
                          "email"
                        )}
                      >
                        <View
                          style={
                            styles.inputIcon
                          }
                        >
                          <Ionicons
                            name="mail-outline"
                            size={
                              isTinyMobile
                                ? 18
                                : 19
                            }
                            color={
                              focusedField ===
                              "email"
                                ? COLORS.rose
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <TextInput
                          value={form.email}
                          onChangeText={(value) =>
                            handleChange(
                              "email",
                              value
                            )
                          }
                          placeholder="owner@example.com"
                          placeholderTextColor="#94A3B8"
                          style={getInputStyle()}
                          onFocus={() =>
                            setFocusedField(
                              "email"
                            )
                          }
                          onBlur={() =>
                            setFocusedField("")
                          }
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                           autoComplete="email"
                          selectionColor={
                            COLORS.rose
                          }
                        />
                      </View>
                    </View>

                    {/* =================================================
                        PHONE
                    ================================================== */}

                    <View
                      style={styles.field}
                    >
                      <Text
                        style={[
                          styles.label,
                          isTinyMobile &&
                            styles.labelTiny,
                        ]}
                      >
                        Phone Number
                      </Text>

                      <View
                        style={getInputContainerStyle(
                          "phone"
                        )}
                      >
                        <View
                          style={
                            styles.inputIcon
                          }
                        >
                          <Ionicons
                            name="call-outline"
                            size={
                              isTinyMobile
                                ? 18
                                : 19
                            }
                            color={
                              focusedField ===
                              "phone"
                                ? COLORS.rose
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <TextInput
                          value={form.phone}
                          onChangeText={(value) =>
                            handleChange(
                              "phone",
                              value
                            )
                          }
                          placeholder="+91 98765 43210"
                          placeholderTextColor="#94A3B8"
                          style={getInputStyle()}
                          onFocus={() =>
                            setFocusedField(
                              "phone"
                            )
                          }
                          onBlur={() =>
                            setFocusedField("")
                          }
                          keyboardType="phone-pad"
                          autoCorrect={false}
                          returnKeyType="next"
                           autoComplete="tel"
                          selectionColor={
                            COLORS.rose
                          }
                        />
                      </View>
                    </View>

                    {/* =================================================
                        PASSWORD
                    ================================================== */}

                    <View
                      style={styles.field}
                    >
                      <Text
                        style={[
                          styles.label,
                          isTinyMobile &&
                            styles.labelTiny,
                        ]}
                      >
                        Password
                      </Text>

                      <View
                        style={getInputContainerStyle(
                          "password"
                        )}
                      >
                        <View
                          style={
                            styles.inputIcon
                          }
                        >
                          <Ionicons
                            name="lock-closed-outline"
                            size={
                              isTinyMobile
                                ? 18
                                : 19
                            }
                            color={
                              focusedField ===
                              "password"
                                ? COLORS.rose
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <TextInput
                          value={form.password}
                          onChangeText={(value) =>
                            handleChange(
                              "password",
                              value
                            )
                          }
                          placeholder="Minimum 8 characters"
                          placeholderTextColor="#94A3B8"
                          style={[
                            getInputStyle(),
                            styles.passwordInput,
                          ]}
                          onFocus={() =>
                            setFocusedField(
                              "password"
                            )
                          }
                          onBlur={() =>
                            setFocusedField("")
                          }
                          secureTextEntry={
                            !showPassword
                          }
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="next"
                           autoComplete="new-password"
                          selectionColor={
                            COLORS.rose
                          }
                        />

                        <Pressable
                          onPress={() =>
                            setShowPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          style={({ pressed }) => [
                            styles.eyeButton,
                            isTinyMobile &&
                              styles.eyeButtonTiny,
                            pressed &&
                              styles.eyeButtonPressed,
                          ]}
                          hitSlop={8}
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
                                : 20
                            }
                            color="#64748B"
                          />
                        </Pressable>
                      </View>

                      <Text
                        style={[
                          styles.helperText,
                          isTinyMobile &&
                            styles.helperTextTiny,
                        ]}
                      >
                        Use at least 8 characters
                        for a stronger password.
                      </Text>
                    </View>

                    {/* =================================================
                        CONFIRM PASSWORD
                    ================================================== */}

                    <View
                      style={styles.field}
                    >
                      <Text
                        style={[
                          styles.label,
                          isTinyMobile &&
                            styles.labelTiny,
                        ]}
                      >
                        Confirm Password
                      </Text>

                      <View
                        style={getInputContainerStyle(
                          "confirmPassword"
                        )}
                      >
                        <View
                          style={
                            styles.inputIcon
                          }
                        >
                          <Ionicons
                            name="shield-checkmark-outline"
                            size={
                              isTinyMobile
                                ? 18
                                : 19
                            }
                            color={
                              focusedField ===
                              "confirmPassword"
                                ? COLORS.rose
                                : "#94A3B8"
                            }
                          />
                        </View>

                        <TextInput
                          value={
                            form.confirmPassword
                          }
                          onChangeText={(value) =>
                            handleChange(
                              "confirmPassword",
                              value
                            )
                          }
                          placeholder="Re-enter your password"
                          placeholderTextColor="#94A3B8"
                          style={[
                            getInputStyle(),
                            styles.passwordInput,
                          ]}
                          onFocus={() =>
                            setFocusedField(
                              "confirmPassword"
                            )
                          }
                          onBlur={() =>
                            setFocusedField("")
                          }
                          secureTextEntry={
                            !showConfirmPassword
                          }
                          autoCapitalize="none"
                          autoCorrect={false}
                          returnKeyType="done"
                          onSubmitEditing={
                            handleSubmit
                          }
                           autoComplete="new-password"
                          selectionColor={
                            COLORS.rose
                          }
                        />

                        <Pressable
                          onPress={() =>
                            setShowConfirmPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          style={({ pressed }) => [
                            styles.eyeButton,
                            isTinyMobile &&
                              styles.eyeButtonTiny,
                            pressed &&
                              styles.eyeButtonPressed,
                          ]}
                          hitSlop={8}
                        >
                          <Ionicons
                            name={
                              showConfirmPassword
                                ? "eye-off-outline"
                                : "eye-outline"
                            }
                            size={
                              isTinyMobile
                                ? 19
                                : 20
                            }
                            color="#64748B"
                          />
                        </Pressable>
                      </View>
                    </View>

                    {/* =================================================
                        REGISTER BUTTON
                    ================================================== */}

                    <Pressable
                      onPress={handleSubmit}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.submitButton,

                        isTinyMobile &&
                          styles.submitButtonTiny,

                        pressed &&
                          !loading &&
                          styles.submitButtonPressed,

                        loading &&
                          styles.submitButtonLoading,
                      ]}
                    >
                      <View
                        pointerEvents="none"
                        style={
                          styles.buttonGlow
                        }
                      />

                      {loading ? (
                        <>
                          <ActivityIndicator
                            size="small"
                            color={
                              COLORS.white
                            }
                          />

                          <Text
                            style={[
                              styles.submitButtonText,
                              isTinyMobile &&
                                styles.submitButtonTextTiny,
                            ]}
                          >
                            Creating account...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.submitButtonText,
                              isTinyMobile &&
                                styles.submitButtonTextTiny,
                            ]}
                          >
                            Create Salon Owner Account
                          </Text>

                          <View
                            style={
                              styles.submitArrow
                            }
                          >
                            <Ionicons
                              name="arrow-forward"
                              size={
                                isTinyMobile
                                  ? 16
                                  : 18
                              }
                              color={
                                COLORS.white
                              }
                            />
                          </View>
                        </>
                      )}
                    </Pressable>
                  </View>

                  {/* =================================================
                      LOGIN
                  ================================================== */}

                  <View
                    style={[
                      styles.loginRow,
                      isTinyMobile &&
                        styles.loginRowTiny,
                    ]}
                  >
                    <Text
                      style={[
                        styles.loginText,
                        isTinyMobile &&
                          styles.loginTextTiny,
                      ]}
                    >
                      Already have an account?
                    </Text>

                    <Pressable
                      onPress={() =>
                        router.push(
                          "/salon-owner/login"
                        )
                      }
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.loginButton,
                        pressed &&
                          styles.loginButtonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.loginButtonText,
                          isTinyMobile &&
                            styles.loginButtonTextTiny,
                        ]}
                      >
                        Sign in
                      </Text>
                    </Pressable>
                  </View>

                  {/* =================================================
                      SECURITY FOOTER
                  ================================================== */}

                  <View
                    style={[
                      styles.securityBox,
                      isTinyMobile &&
                        styles.securityBoxTiny,
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
                        name="lock-closed-outline"
                        size={
                          isTinyMobile
                            ? 16
                            : 18
                        }
                        color="#64748B"
                      />
                    </View>

                    <View
                      style={
                        styles.securityTextBlock
                      }
                    >
                      <Text
                        style={[
                          styles.securityTitle,
                          isTinyMobile &&
                            styles.securityTitleTiny,
                        ]}
                      >
                        Your account is protected
                      </Text>

                      <Text
                        style={[
                          styles.securityDescription,
                          isTinyMobile &&
                            styles.securityDescriptionTiny,
                        ]}
                      >
                        Secure access for your
                        salon business
                      </Text>
                    </View>

                    <Ionicons
                      name="checkmark-circle"
                      size={
                        isTinyMobile
                          ? 17
                          : 19
                      }
                      color="#CBD5E1"
                    />
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 12,
  },

  /* =======================================================
     BACKGROUND
  ======================================================= */

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  backgroundGlowTop: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -220,
    left: -180,
    backgroundColor: "rgba(217,70,239,0.09)",
  },

  backgroundGlowBottom: {
    position: "absolute",
    width: 480,
    height: 480,
    borderRadius: 240,
    bottom: -280,
    right: -210,
    backgroundColor: "rgba(244,63,94,0.08)",
  },

  backgroundGlowCenter: {
    position: "absolute",
    width: 330,
    height: 330,
    borderRadius: 165,
    top: "38%",
    left: "45%",
    backgroundColor: "rgba(139,92,246,0.035)",
  },

  backgroundDotOne: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    top: "18%",
    left: "9%",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  backgroundDotTwo: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    top: "72%",
    right: "12%",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  backgroundDotThree: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    top: "43%",
    right: "7%",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  mainCard: {
    width: "100%",
    alignSelf: "center",
    overflow: "hidden",
    borderRadius: 27,
    backgroundColor: COLORS.white,
  },

  mainCardTablet: {
    flexDirection: "row",
    borderRadius: 30,
  },

  mainCardLaptop: {
    flexDirection: "row",
    borderRadius: 36,
  },

  /* =======================================================
     HERO
  ======================================================= */

  heroPanel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#0B0E1D",
  },

  heroPanelTablet: {
    width: "45%",
    minHeight: 780,
  },

  heroPanelLaptop: {
    width: "47%",
    minHeight: 820,
  },

  heroBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#080B19",
  },

  heroGlowRose: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    top: -210,
    right: -230,
    backgroundColor: "rgba(244,63,94,0.12)",
  },

  heroGlowPurple: {
    position: "absolute",
    width: 560,
    height: 560,
    borderRadius: 280,
    bottom: -320,
    left: -270,
    backgroundColor: "rgba(124,58,237,0.13)",
  },

  heroGlowPink: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: "42%",
    right: -180,
    backgroundColor: "rgba(217,70,239,0.045)",
  },

  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },

  gridHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  gridVertical: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(255,255,255,0.035)",
  },

  heroContent: {
    flex: 1,
    padding: 30,
    justifyContent: "space-between",
  },

  heroContentTablet: {
    padding: 30,
  },

  heroContentLaptop: {
    padding: 44,
  },

  /* =======================================================
     BRAND
  ======================================================= */

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandIconWrapper: {
    position: "relative",
  },

  brandIconGlow: {
    position: "absolute",
    width: 66,
    height: 66,
    borderRadius: 20,
    top: -4,
    left: -4,
    backgroundColor: "rgba(236,72,153,0.16)",
  },

  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D946EF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  brandTextBlock: {
    marginLeft: 14,
    flexShrink: 1,
  },

  brandName: {
    color: COLORS.white,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.7,
    includeFontPadding: false,
  },

  brandSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 1.6,
    includeFontPadding: false,
  },

  /* =======================================================
     HERO MAIN
  ======================================================= */

  heroMainContent: {
    marginTop: 40,
  },

  portalBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.055)",
  },

  portalBadgeIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,63,94,0.10)",
  },

  portalBadgeText: {
    flexShrink: 1,
    marginLeft: 8,
    color: "#CBD5E1",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  heroTitle: {
    marginTop: 25,
    color: COLORS.white,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.8,
    includeFontPadding: false,
  },

  heroTitleTablet: {
    fontSize: 42,
    lineHeight: 48,
  },

  heroTitleLaptop: {
    fontSize: 58,
    lineHeight: 63,
    letterSpacing: -2.5,
  },

  heroAccent: {
    marginTop: 2,
    color: COLORS.roseLight,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.8,
    includeFontPadding: false,
  },

  heroAccentTablet: {
    fontSize: 42,
    lineHeight: 48,
  },

  heroAccentLaptop: {
    fontSize: 58,
    lineHeight: 63,
    letterSpacing: -2.5,
  },

  heroDescription: {
    maxWidth: 520,
    marginTop: 21,
    color: "#94A3B8",
    fontSize: 13.5,
    lineHeight: 22,
    fontWeight: "500",
    includeFontPadding: false,
  },

  heroDescriptionTablet: {
    fontSize: 13,
    lineHeight: 21,
  },

  heroDescriptionLaptop: {
    fontSize: 15,
    lineHeight: 25,
  },

  /* =======================================================
     FEATURES
  ======================================================= */

  featureList: {
    marginTop: 28,
  },

  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
  },

  featureItemLast: {
    marginBottom: 0,
  },

  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,63,94,0.09)",
  },

  featureText: {
    flex: 1,
    marginLeft: 11,
    color: "#CBD5E1",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    includeFontPadding: false,
  },

  /* =======================================================
     MINI CARDS
  ======================================================= */

  miniCardsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 26,
  },

  miniCard: {
    flex: 1,
    minWidth: 0,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
  },

  miniCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,63,94,0.10)",
  },

  miniCardIconPurple: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.11)",
  },

  miniCardTitle: {
    marginTop: 9,
    color: COLORS.white,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "800",
    includeFontPadding: false,
  },

  miniCardDescription: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "500",
    includeFontPadding: false,
  },

  /* =======================================================
     TRUST
  ======================================================= */

  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 25,
  },

  trustLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  trustText: {
    flexShrink: 1,
    color: "#475569",
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },

  /* =======================================================
     FORM PANEL
  ======================================================= */

  formPanel: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },

  formPanelMobile: {
    width: "100%",
    minHeight: 680,
  },

  formPanelTablet: {
    width: "55%",
    minHeight: 780,
    justifyContent: "center",
  },

  formPanelLaptop: {
    width: "53%",
    minHeight: 820,
    justifyContent: "center",
  },

  formGlowTop: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -190,
    right: -150,
    backgroundColor: "#FFF1F2",
  },

  formGlowBottom: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -220,
    left: -190,
    backgroundColor: "#F5F3FF",
  },

  formContent: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  /* =======================================================
     MOBILE BRAND
  ======================================================= */

  mobileBrand: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  mobileBrandCompact: {
    marginBottom: 22,
  },

  mobileBrandIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.rose,
    shadowColor: COLORS.rose,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  mobileBrandText: {
    marginLeft: 11,
  },

  mobileBrandName: {
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  mobileBrandNameTiny: {
    fontSize: 18,
    lineHeight: 22,
  },

  mobileBrandSubtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.2,
    includeFontPadding: false,
  },

  mobileBrandSubtitleTiny: {
    fontSize: 7,
    lineHeight: 10,
  },

  /* =======================================================
     FORM HEADER
  ======================================================= */

  formHeader: {
    marginBottom: 23,
  },

  formHeaderCompact: {
    marginBottom: 18,
  },

  formHeaderIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFE4E6",
  },

  formHeaderIconTiny: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginBottom: 13,
  },

  formEyebrow: {
    color: COLORS.rose,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.8,
    includeFontPadding: false,
  },

  formEyebrowTiny: {
    fontSize: 8,
    lineHeight: 11,
    letterSpacing: 1.4,
  },

  formTitle: {
    marginTop: 6,
    color: COLORS.textDark,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.1,
    includeFontPadding: false,
  },

  formTitleTiny: {
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.8,
  },

  formTitleSmall: {
    fontSize: 29,
    lineHeight: 35,
  },

  formTitleTablet: {
    fontSize: 35,
    lineHeight: 42,
  },

  formTitleLaptop: {
    fontSize: 39,
    lineHeight: 46,
  },

  formDescription: {
    maxWidth: 500,
    marginTop: 9,
    color: "#64748B",
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: "500",
    includeFontPadding: false,
  },

  formDescriptionTiny: {
    fontSize: 12,
    lineHeight: 19,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
    backgroundColor: COLORS.errorBackground,
  },

  errorBoxTiny: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 14,
  },

  errorIcon: {
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorIconText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    includeFontPadding: false,
  },

  errorText: {
    flex: 1,
    marginLeft: 9,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    includeFontPadding: false,
  },

  errorTextTiny: {
    fontSize: 11,
    lineHeight: 16,
  },

  /* =======================================================
     FORM
  ======================================================= */

  form: {
    width: "100%",
  },

  formCompact: {
    gap: 0,
  },

  field: {
    width: "100%",
    marginBottom: 15,
  },

  label: {
    marginBottom: 7,
    color: "#334155",
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "800",
    includeFontPadding: false,
  },

  labelTiny: {
    fontSize: 11.5,
    lineHeight: 15,
    marginBottom: 6,
  },

  /* =======================================================
     INPUT
  ======================================================= */

   inputContainer: {
  position: "relative",
  width: "100%",
  minHeight: 54,
  borderRadius: 15,
  borderWidth: 1,
  borderColor: "#E2E8F0",
  backgroundColor: "#F8FAFC",
  overflow: "visible",
},

inputContainerTiny: {
  minHeight: 50,
  borderRadius: 14,
},

  inputContainerFocused: {
  borderColor: "#FB7185",
  backgroundColor: "#FFFFFF",

  shadowColor: COLORS.rose,
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 2,
},

  inputIcon: {
  position: "absolute",
  left: 0,
  top: 0,
  width: 44,
  height: 52,
  alignItems: "center",
  justifyContent: "center",
  zIndex: 2,
  pointerEvents: "none",
},

  input: {
  width: "100%",
  height: 52,
  minWidth: 0,

  paddingLeft: 49,
  paddingRight: 14,
  paddingVertical: 0,

  color: "#1E293B",
  fontSize: 13.5,
  fontWeight: "600",

  includeFontPadding: false,
  outlineStyle: "none",
},

  inputSmall: {
  width: "100%",
  height: 50,
  minWidth: 0,
  paddingLeft: 47,
  paddingRight: 13,
  fontSize: 13,
  outlineStyle: "none",
},

inputTiny: {
  width: "100%",
  height: 48,
  minWidth: 0,
  paddingLeft: 45,
  paddingRight: 12,
  fontSize: 12,
  outlineStyle: "none",
},

 passwordInput: {
  paddingRight: 55,
},

  eyeButton: {
  position: "absolute",
  right: 2,
  top: 1,
  width: 45,
  height: 50,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 13,
  zIndex: 3,
},

eyeButtonTiny: {
  right: 2,
  top: 1,
  width: 40,
  height: 46,
},

  eyeButtonPressed: {
    backgroundColor: "#F1F5F9",
  },

  helperText: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "600",
    includeFontPadding: false,
  },

  helperTextTiny: {
    fontSize: 8.5,
    lineHeight: 13,
  },

  /* =======================================================
     SUBMIT
  ======================================================= */

  submitButton: {
    position: "relative",
    width: "100%",
    minHeight: 55,
    marginTop: 5,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: "#0F172A",
    shadowColor: "#0F172A",
    shadowOpacity: 0.17,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 5,
  },

  submitButtonTiny: {
    minHeight: 51,
    borderRadius: 14,
  },

  submitButtonPressed: {
    opacity: 0.9,
    transform: [
      {
        scale: 0.988,
      },
    ],
  },

  submitButtonLoading: {
    opacity: 0.65,
  },

  buttonGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -70,
    top: -90,
    backgroundColor: "rgba(244,63,94,0.25)",
  },

  submitButtonText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  submitButtonTextTiny: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  submitArrow: {
    width: 30,
    height: 30,
    marginLeft: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  /* =======================================================
     LOGIN
  ======================================================= */

  loginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19,
    paddingHorizontal: 5,
  },

  loginRowTiny: {
    marginTop: 15,
  },

  loginText: {
    color: "#64748B",
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  loginTextTiny: {
    fontSize: 10,
    lineHeight: 15,
  },

  loginButton: {
    marginLeft: 5,
    paddingVertical: 2,
  },

  loginButtonPressed: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: COLORS.rose,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "900",
    includeFontPadding: false,
  },

  loginButtonTextTiny: {
    fontSize: 10,
    lineHeight: 15,
  },

  /* =======================================================
     SECURITY
  ======================================================= */

  securityBox: {
    width: "100%",
    minHeight: 58,
    marginTop: 18,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },

  securityBoxTiny: {
    minHeight: 52,
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 15,
  },

  securityIcon: {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  securityIconTiny: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },

  securityTextBlock: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    marginRight: 7,
  },

  securityTitle: {
    color: "#334155",
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "800",
    includeFontPadding: false,
  },

  securityTitleTiny: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  securityDescription: {
    marginTop: 1,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "500",
    includeFontPadding: false,
  },

  securityDescriptionTiny: {
    fontSize: 8,
    lineHeight: 12,
  },
});

export default SalonOwnerRegister;