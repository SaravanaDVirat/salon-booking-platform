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
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  loginCustomer,
  saveCustomerSession,
} from "../../services/CustomerAuthService";

const CustomerLogin = () => {
  const { width, height } = useWindowDimensions();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * =========================================
   * RESPONSIVE BREAKPOINTS
   * =========================================
   */

  const isSmallPhone = width < 360;
  const isPhone = width < 600;
  const isTablet = width >= 600;
  const isLargeTablet = width >= 900;

  const horizontalPadding = useMemo(() => {
    if (isSmallPhone) return 14;
    if (isPhone) return 18;
    if (isLargeTablet) return 28;
    return 24;
  }, [isSmallPhone, isPhone, isLargeTablet]);

  const cardPadding = useMemo(() => {
    if (isSmallPhone) return 18;
    if (isPhone) return 22;
    if (isLargeTablet) return 34;
    return 30;
  }, [isSmallPhone, isPhone, isLargeTablet]);

  const headingSize = useMemo(() => {
    if (isSmallPhone) return 27;
    if (isPhone) return 30;
    if (isLargeTablet) return 34;
    return 32;
  }, [isSmallPhone, isPhone, isLargeTablet]);

  const inputHeight = isSmallPhone ? 53 : 57;

  const from = "/customer/home";

  /*
   * =========================================
   * FORM CHANGE
   * =========================================
   */

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  /*
   * =========================================
   * LOGIN
   * =========================================
   */

  const handleSubmit = async () => {
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await loginCustomer({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response?.user?.role !== "CUSTOMER") {
        setError(
          "This account is not a customer account. Please use the correct login."
        );
        return;
      }

      await saveCustomerSession(response);

      router.replace("/customer/salons");
    } catch (err) {
  console.log("LOGIN ERROR:", err);
  console.log("STATUS:", err?.response?.status);
  console.log("DATA:", err?.response?.data);

  setError(
    err?.response?.data?.message ||
    "Unable to login. Please check your credentials and try again."
  );
}finally {
      setLoading(false);
    }
  };

  /*
   * =========================================
   * SCREEN
   * =========================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              minHeight: height,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* =========================================
              BACKGROUND DECORATIONS
          ========================================= */}

          <View style={styles.backgroundDecor} pointerEvents="none">
            <View
              style={[
                styles.decorCircleOne,
                {
                  width: isTablet ? 300 : 210,
                  height: isTablet ? 300 : 210,
                  borderRadius: isTablet ? 150 : 105,
                  right: isTablet ? -100 : -90,
                  top: isTablet ? -110 : -80,
                },
              ]}
            />

            <View
              style={[
                styles.decorCircleTwo,
                {
                  width: isTablet ? 240 : 170,
                  height: isTablet ? 240 : 170,
                  borderRadius: isTablet ? 120 : 85,
                  left: isTablet ? -100 : -75,
                  bottom: 30,
                },
              ]}
            />

            <View style={styles.decorDotOne} />
            <View style={styles.decorDotTwo} />
          </View>

          {/* =========================================
              MAIN CONTENT
          ========================================= */}

          <View
            style={[
              styles.contentContainer,
              {
                maxWidth: isTablet ? 560 : 520,
              },
            ]}
          >
            {/* =========================================
                BRAND HEADER
            ========================================= */}

            <View style={styles.brandHeader}>
              <Pressable
                style={styles.brandButton}
                onPress={() => router.replace("/customer/home")}
              >
                <View
                  style={[
                    styles.brandIcon,
                    {
                      width: isSmallPhone ? 40 : 44,
                      height: isSmallPhone ? 40 : 44,
                      borderRadius: isSmallPhone ? 13 : 14,
                    },
                  ]}
                >
                  <Ionicons
                    name="sparkles"
                    size={isSmallPhone ? 18 : 20}
                    color="#f4c7dc"
                  />
                </View>

                <View style={styles.brandTextContainer}>
                  <Text
                    style={[
                      styles.brandName,
                      {
                        fontSize: isSmallPhone ? 19 : 21,
                      },
                    ]}
                  >
                    LUMORA
                  </Text>

                  <Text style={styles.brandTagline}>
                    BEAUTY • TIME • YOU
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={[
                  styles.backButton,
                  {
                    width: isSmallPhone ? 40 : 44,
                    height: isSmallPhone ? 40 : 44,
                  },
                ]}
                onPress={() => router.replace("/customer/home")}
                hitSlop={8}
              >
                <Ionicons
                  name="arrow-back"
                  size={isSmallPhone ? 19 : 20}
                  color="#64748b"
                />
              </Pressable>
            </View>

            {/* =========================================
                LOGIN CARD
            ========================================= */}

            <View
              style={[
                styles.card,
                {
                  padding: cardPadding,
                  borderRadius: isSmallPhone ? 23 : 28,
                },
              ]}
            >
              {/* =======================================
                  HEADER ICON
              ======================================= */}

              <View
                style={[
                  styles.headingIcon,
                  {
                    width: isSmallPhone ? 47 : 52,
                    height: isSmallPhone ? 47 : 52,
                    borderRadius: isSmallPhone ? 15 : 17,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={isSmallPhone ? 21 : 23}
                  color="#32143f"
                />
              </View>

              {/* =======================================
                  BADGE
              ======================================= */}

              <View style={styles.loginBadge}>
                <Ionicons
                  name="sparkles-outline"
                  size={12}
                  color="#32143f"
                />

                <Text style={styles.loginBadgeText}>
                  CUSTOMER LOGIN
                </Text>
              </View>

              {/* =======================================
                  HEADING
              ======================================= */}

              <Text
                style={[
                  styles.heading,
                  {
                    fontSize: headingSize,
                  },
                ]}
              >
                Welcome back
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: isSmallPhone ? 13 : 14,
                  },
                ]}
              >
                Sign in to continue your beauty journey with LUMORA.
              </Text>

              {/* =======================================
                  ERROR
              ======================================= */}

              {error ? (
                <View style={styles.errorBox}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#dc2626"
                    />
                  </View>

                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* =======================================
                  EMAIL
              ======================================= */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  EMAIL ADDRESS
                </Text>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      minHeight: inputHeight,
                    },
                    formData.email.length > 0 &&
                      styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={19}
                    color="#94a3b8"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      {
                        height: inputHeight - 2,
                        fontSize: isSmallPhone ? 13 : 14,
                      },
                    ]}
                    value={formData.email}
                    onChangeText={(value) =>
                      handleChange("email", value)
                    }
                    placeholder="you@example.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* =======================================
                  PASSWORD
              ======================================= */}

              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    PASSWORD
                  </Text>

                  <View style={styles.secureBadge}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={11}
                      color="#64748b"
                    />

                    <Text style={styles.secureText}>
                      SECURE
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      minHeight: inputHeight,
                    },
                    formData.password.length > 0 &&
                      styles.inputWrapperFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color="#94a3b8"
                    style={styles.inputIcon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        height: inputHeight - 2,
                        fontSize: isSmallPhone ? 13 : 14,
                      },
                    ]}
                    value={formData.password}
                    onChangeText={(value) =>
                      handleChange("password", value)
                    }
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />

                  <Pressable
                    style={styles.passwordToggle}
                    onPress={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={loading}
                    hitSlop={6}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#94a3b8"
                    />
                  </Pressable>
                </View>
              </View>

              {/* =======================================
                  SECURITY INFORMATION
              ======================================= */}

              <View style={styles.securityBox}>
                <View style={styles.securityIconBox}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color="#32143f"
                  />
                </View>

                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>
                    Secure authentication
                  </Text>

                  <Text style={styles.securityDescription}>
                    Your login is protected with encrypted authentication.
                  </Text>
                </View>
              </View>

              {/* =======================================
                  LOGIN BUTTON
              ======================================= */}

              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    minHeight: isSmallPhone ? 53 : 57,
                  },
                  pressed &&
                    !loading &&
                    styles.loginButtonPressed,
                  loading && styles.loginButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#ffffff"
                    />

                    <Text
                      style={[
                        styles.loginButtonText,
                        {
                          fontSize: isSmallPhone ? 13 : 14,
                        },
                      ]}
                    >
                      Signing you in...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        styles.loginButtonText,
                        {
                          fontSize: isSmallPhone ? 13 : 14,
                        },
                      ]}
                    >
                      Continue to LUMORA
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#ffffff"
                    />
                  </>
                )}
              </Pressable>

              {/* =======================================
                  DIVIDER
              ======================================= */}

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />

                <Text style={styles.dividerText}>
                  NEW HERE?
                </Text>

                <View style={styles.divider} />
              </View>

              {/* =======================================
                  REGISTER BUTTON
              ======================================= */}

              <Pressable
                style={({ pressed }) => [
                  styles.registerButton,
                  {
                    minHeight: isSmallPhone ? 50 : 53,
                  },
                  pressed && styles.registerButtonPressed,
                ]}
                onPress={() =>
                  router.push({
                    pathname: "/customer/register",
                    params: {
                      from,
                    },
                  })
                }
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={19}
                  color="#475569"
                />

                <Text
                  style={[
                    styles.registerButtonText,
                    {
                      fontSize: isSmallPhone ? 12 : 13,
                    },
                  ]}
                >
                  Create your LUMORA account
                </Text>
              </Pressable>

              {/* =======================================
                  TRUST FEATURES
              ======================================= */}

              <View
                style={[
                  styles.trustFeatures,
                  isSmallPhone && styles.trustFeaturesSmall,
                ]}
              >
                <View style={styles.trustItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#10b981"
                  />

                  <Text style={styles.trustText}>
                    Easy booking
                  </Text>
                </View>

                <View style={styles.trustItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#10b981"
                  />

                  <Text style={styles.trustText}>
                    Trusted salons
                  </Text>
                </View>

                <View style={styles.trustItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color="#10b981"
                  />

                  <Text style={styles.trustText}>
                    Secure account
                  </Text>
                </View>
              </View>

              {/* =======================================
                  TERMS
              ======================================= */}

              <Text
                style={[
                  styles.terms,
                  {
                    fontSize: isSmallPhone ? 9 : 9.5,
                  },
                ]}
              >
                By continuing, you agree to LUMORA's terms and
                privacy policy.
              </Text>
            </View>

            {/* =========================================
                BOTTOM BRAND NOTE
            ========================================= */}

            <View style={styles.bottomNote}>
              <View style={styles.bottomLine} />

              <Text style={styles.bottomNoteText}>
                LUMORA • BEAUTY • TIME • YOU
              </Text>

              <View style={styles.bottomLine} />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerLogin;

/* =====================================================
   STYLES
===================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f4f8",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 30,
    justifyContent: "center",
  },

  /*
   * =========================================
   * MAIN CONTAINER
   * =========================================
   */

  contentContainer: {
    width: "100%",
    alignSelf: "center",
  },

  /*
   * =========================================
   * BACKGROUND
   * =========================================
   */

  backgroundDecor: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  decorCircleOne: {
    position: "absolute",
    backgroundColor: "#ead8ed",
    opacity: 0.38,
  },

  decorCircleTwo: {
    position: "absolute",
    backgroundColor: "#f2dce8",
    opacity: 0.35,
  },

  decorDotOne: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#d7b6d8",
    top: "28%",
    right: "12%",
    opacity: 0.65,
  },

  decorDotTwo: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e5b7ca",
    top: "40%",
    left: "10%",
    opacity: 0.65,
  },

  /*
   * =========================================
   * BRAND HEADER
   * =========================================
   */

  brandHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  brandButton: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  brandIcon: {
    backgroundColor: "#32143f",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    shadowColor: "#32143f",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },

  brandTextContainer: {
    flexShrink: 1,
  },

  brandName: {
    fontWeight: "900",
    letterSpacing: 3,
    color: "#0f172a",
  },

  brandTagline: {
    marginTop: 2,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#94a3b8",
  },

  backButton: {
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  /*
   * =========================================
   * MAIN CARD
   * =========================================
   */

  card: {
    width: "100%",
    alignSelf: "center",

    backgroundColor: "#ffffff",

    borderWidth: 1,
    borderColor: "#eee7f0",

    shadowColor: "#32143f",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.11,
    shadowRadius: 28,

    elevation: 7,
  },

  /*
   * =========================================
   * HEADING
   * =========================================
   */

  headingIcon: {
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#f6eef8",

    marginBottom: 14,
  },

  loginBadge: {
    alignSelf: "flex-start",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 11,
    paddingVertical: 7,

    borderRadius: 20,

    borderWidth: 1,
    borderColor: "#ead9eb",

    backgroundColor: "#faf6fb",

    marginBottom: 11,

    gap: 5,
  },

  loginBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#32143f",
  },

  heading: {
    fontWeight: "900",
    letterSpacing: -1,

    color: "#0f172a",
  },

  subtitle: {
    marginTop: 7,

    lineHeight: 21,

    color: "#64748b",

    maxWidth: 470,
  },

  /*
   * =========================================
   * ERROR
   * =========================================
   */

  errorBox: {
    width: "100%",

    marginTop: 18,

    flexDirection: "row",
    alignItems: "flex-start",

    paddingHorizontal: 13,
    paddingVertical: 12,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#fecaca",

    backgroundColor: "#fff7f7",
  },

  errorIcon: {
    marginRight: 9,
    marginTop: 1,
  },

  errorText: {
    flex: 1,

    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",

    color: "#b91c1c",
  },

  /*
   * =========================================
   * FORM
   * =========================================
   */

  fieldContainer: {
    width: "100%",
    marginTop: 21,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  label: {
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 0.95,
    color: "#334155",

    marginBottom: 8,
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,

    marginBottom: 8,
  },

  secureText: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: "#94a3b8",
  },

  /*
   * =========================================
   * INPUT
   * =========================================
   */

  inputWrapper: {
  width: "100%",
  height: 60,
  borderWidth: 1.5,
  borderColor: "#4A235A",
  borderRadius: 16,
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  overflow: "hidden",
},

  inputWrapperFocused: {
    borderColor: "#32143f",
    backgroundColor: "#ffffff",

    shadowColor: "#32143f",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },

  inputIcon: {
    marginLeft: 14,
    marginRight: 9,
  },

  input: {
  flex: 1,
  minWidth: 0,
  height: "100%",
  paddingHorizontal: 12,
  paddingVertical: 0,
  fontSize: 14,
  color: "#172033",
  outlineStyle: "none",
},

  passwordInput: {
    paddingRight: 52,
  },

  passwordToggle: {
    position: "absolute",
    right: 6,

    width: 43,
    height: 43,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#ffffff",
  },

  /*
   * =========================================
   * SECURITY
   * =========================================
   */

  securityBox: {
    width: "100%",

    marginTop: 20,

    flexDirection: "row",
    alignItems: "center",

    padding: 13,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#eadceb",

    backgroundColor: "#faf7fc",
  },

  securityIconBox: {
    width: 41,
    height: 41,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#ffffff",

    marginRight: 11,
  },

  securityContent: {
    flex: 1,
    minWidth: 0,
  },

  securityTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#334155",
  },

  securityDescription: {
    marginTop: 3,

    fontSize: 10.5,
    lineHeight: 15.5,

    color: "#64748b",
  },

  /*
   * =========================================
   * LOGIN BUTTON
   * =========================================
   */

  loginButton: {
    width: "100%",

    marginTop: 20,

    borderRadius: 16,

    backgroundColor: "#32143f",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 10,

    shadowColor: "#32143f",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.24,
    shadowRadius: 16,

    elevation: 5,
  },

  loginButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontWeight: "900",
    color: "#ffffff",
  },

  /*
   * =========================================
   * DIVIDER
   * =========================================
   */

  dividerContainer: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    gap: 11,

    marginTop: 24,
    marginBottom: 17,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },

  dividerText: {
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#94a3b8",
  },

  /*
   * =========================================
   * REGISTER BUTTON
   * =========================================
   */

  registerButton: {
    width: "100%",

    borderRadius: 16,

    borderWidth: 1,
    borderColor: "#e2e8f0",

    backgroundColor: "#ffffff",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,

    paddingHorizontal: 12,
  },

  registerButtonPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: "#fcf8fc",
  },

  registerButtonText: {
    flexShrink: 1,

    fontWeight: "900",

    color: "#475569",

    textAlign: "center",
  },

  /*
   * =========================================
   * TRUST FEATURES
   * =========================================
   */

  trustFeatures: {
    width: "100%",

    flexDirection: "row",

    gap: 7,

    marginTop: 17,
  },

  trustFeaturesSmall: {
    flexWrap: "wrap",
  },

  trustItem: {
    flex: 1,

    minHeight: 40,

    borderRadius: 12,

    backgroundColor: "#f8fafc",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 5,
  },

  trustText: {
    marginLeft: 4,

    fontSize: 8.8,
    fontWeight: "800",

    color: "#64748b",

    textAlign: "center",
  },

  /*
   * =========================================
   * TERMS
   * =========================================
   */

  terms: {
    marginTop: 18,

    lineHeight: 15,

    color: "#94a3b8",

    textAlign: "center",
  },

  /*
   * =========================================
   * BOTTOM NOTE
   * =========================================
   */

  bottomNote: {
    width: "100%",

    flexDirection: "row",
    alignItems: "center",

    marginTop: 18,

    gap: 9,
  },

  bottomLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e8e0ea",
  },

  bottomNoteText: {
    fontSize: 7.5,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#b0a5b4",
  },
});