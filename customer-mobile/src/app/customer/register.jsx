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
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  registerCustomer,
  saveCustomerSession,
} from "../../services/CustomerAuthService";

const PRIMARY = "#32143f";
const PRIMARY_LIGHT = "#f6edf7";
const TEXT = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

const CustomerRegister = () => {
  const { width } = useWindowDimensions();

  // ============================================================
  // RESPONSIVE BREAKPOINTS
  // ============================================================

  const isVerySmall = width < 360;
  const isSmall = width < 390;
  const isTablet = width >= 768;
  const isLargeScreen = width >= 1100;

  const horizontalPadding = isVerySmall
    ? 14
    : isSmall
      ? 16
      : isTablet
        ? 28
        : 18;

  const titleSize = isVerySmall
    ? 28
    : isSmall
      ? 30
      : isTablet
        ? 34
        : 31;

  const brandNameSize = isVerySmall ? 17 : 19;

  // ============================================================
  // FORM STATE
  // ============================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const passwordStrength = useMemo(() => {
    const password = formData.password;

    if (!password) {
      return {
        score: 0,
        label: "Enter a password",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        score,
        label: "Weak password",
      };
    }

    if (score === 2) {
      return {
        score,
        label: "Fair password",
      };
    }

    if (score === 3) {
      return {
        score,
        label: "Good password",
      };
    }

    return {
      score,
      label: "Strong password",
    };
  }, [formData.password]);

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // PHONE CHANGE
  // ============================================================

  const handlePhoneChange = (value) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 10);

    setFormData((prev) => ({
      ...prev,
      phone: cleanValue,
    }));

    if (error) {
      setError("");
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      return "Please enter a valid 10-digit phone number.";
    }

    if (!formData.password) {
      return "Please create a password.";
    }

    if (formData.password.length < 8) {
      return "Password must contain at least 8 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    return null;
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleSubmit = async () => {
    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const response = await registerCustomer({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/\D/g, ""),
        password: formData.password,
      });

      if (response?.user?.role !== "CUSTOMER") {
        setError("Customer account could not be created.");
        return;
      }

      await saveCustomerSession(response);

      router.replace("/customer/salons");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Unable to create your account. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PASSWORD STRENGTH COLOR
  // ============================================================

  const getStrengthColor = () => {
    if (passwordStrength.score >= 4) {
      return "#059669";
    }

    if (passwordStrength.score === 3) {
      return "#2563eb";
    }

    if (passwordStrength.score === 2) {
      return "#d97706";
    }

    return "#ef4444";
  };

  // ============================================================
  // DYNAMIC STYLES
  // ============================================================

  const responsiveContentStyle = {
    paddingHorizontal: horizontalPadding,
    maxWidth: isLargeScreen ? 700 : 650,
  };

  const responsiveTitleStyle = {
    fontSize: titleSize,
    lineHeight: isVerySmall ? 34 : 38,
  };

  const responsiveBrandNameStyle = {
    fontSize: brandNameSize,
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ==================================================
              BACKGROUND DECORATION
          ================================================== */}

          <View style={styles.backgroundGlowOne} />
          <View style={styles.backgroundGlowTwo} />

          <View style={[styles.content, responsiveContentStyle]}>
            {/* ==================================================
                HEADER
            ================================================== */}

            <View style={styles.topHeader}>
              <Pressable
                style={styles.brandContainer}
                onPress={() => router.replace("/")}
              >
                <View style={styles.brandIcon}>
                  <Ionicons
                    name="sparkles"
                    size={isVerySmall ? 19 : 21}
                    color="#f4c7dc"
                  />
                </View>

                <View style={styles.brandTextContainer}>
                  <Text
                    style={[
                      styles.brandName,
                      responsiveBrandNameStyle,
                    ]}
                    numberOfLines={1}
                  >
                    LUMORA
                  </Text>

                  <Text style={styles.brandTagline} numberOfLines={1}>
                    BEAUTY • TIME • YOU
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={styles.backButton}
                onPress={() => router.replace("/customer/login")}
                hitSlop={8}
              >
                <Ionicons
                  name="arrow-back"
                  size={19}
                  color={MUTED}
                />
              </Pressable>
            </View>

            {/* ==================================================
                INTRO
            ================================================== */}

            <View style={styles.intro}>
              <View style={styles.introIcon}>
                <Ionicons
                  name="sparkles"
                  size={25}
                  color={PRIMARY}
                />
              </View>

              <Text style={[styles.title, responsiveTitleStyle]}>
                Create your account
              </Text>

              <Text style={styles.subtitle}>
                Join LUMORA and make your next beauty appointment
                effortless.
              </Text>
            </View>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error ? (
              <View style={styles.errorCard}>
                <View style={styles.errorDot} />

                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* ==================================================
                FORM
            ================================================== */}

            <View style={styles.form}>
              {/* ==================================================
                  FULL NAME
              ================================================== */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Full name</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color="#94a3b8"
                    />
                  </View>

                  <TextInput
                    value={formData.name}
                    onChangeText={(value) =>
                      handleChange("name", value)
                    }
                    placeholder="Your full name"
                    placeholderTextColor="#94a3b8"
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    style={styles.input}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* ==================================================
                  EMAIL + PHONE
                  IMPORTANT:
                  320px -> STACKED
                  390px+ -> TWO COLUMN
              ================================================== */}

              <View
                style={[
                  styles.contactFields,
                  isSmall
                    ? styles.contactFieldsStacked
                    : styles.contactFieldsRow,
                ]}
              >
                {/* EMAIL */}

                <View
                  style={[
                    styles.columnField,
                    isSmall
                      ? styles.columnFieldStacked
                      : styles.columnFieldRow,
                  ]}
                >
                  <Text style={styles.label}>Email</Text>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color="#94a3b8"
                      />
                    </View>

                    <TextInput
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
                      textContentType="emailAddress"
                      style={styles.input}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* PHONE */}

                <View
                  style={[
                    styles.columnField,
                    isSmall
                      ? styles.columnFieldStacked
                      : styles.columnFieldRow,
                  ]}
                >
                  <Text style={styles.label}>Phone</Text>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Ionicons
                        name="call-outline"
                        size={18}
                        color="#94a3b8"
                      />
                    </View>

                    <TextInput
                      value={formData.phone}
                      onChangeText={handlePhoneChange}
                      placeholder="10-digit number"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      maxLength={10}
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      style={[
                        styles.input,
                        styles.phoneInput,
                      ]}
                      returnKeyType="next"
                    />
                  </View>
                </View>
              </View>

              {/* ==================================================
                  PASSWORD
              ================================================== */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password</Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#94a3b8"
                    />
                  </View>

                  <TextInput
                    value={formData.password}
                    onChangeText={(value) =>
                      handleChange("password", value)
                    }
                    placeholder="Create a strong password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    style={styles.input}
                    returnKeyType="next"
                  />

                  <Pressable
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowPassword((prev) => !prev)
                    }
                    hitSlop={8}
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

                {/* PASSWORD STRENGTH */}

                {formData.password ? (
                  <View style={styles.strengthCard}>
                    <View style={styles.strengthHeader}>
                      <Text style={styles.strengthTitle}>
                        PASSWORD STRENGTH
                      </Text>

                      <Text
                        style={[
                          styles.strengthLabel,
                          {
                            color: getStrengthColor(),
                          },
                        ]}
                      >
                        {passwordStrength.label}
                      </Text>
                    </View>

                    <View style={styles.strengthBars}>
                      {[1, 2, 3, 4].map((item) => (
                        <View
                          key={item}
                          style={[
                            styles.strengthBar,
                            {
                              backgroundColor:
                                item <= passwordStrength.score
                                  ? getStrengthColor()
                                  : "#e2e8f0",
                            },
                          ]}
                        />
                      ))}
                    </View>

                    <Text style={styles.strengthHint}>
                      Use 8+ characters with uppercase letters,
                      numbers and symbols.
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* ==================================================
                  CONFIRM PASSWORD
              ================================================== */}

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>
                  Confirm password
                </Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color="#94a3b8"
                    />
                  </View>

                  <TextInput
                    value={formData.confirmPassword}
                    onChangeText={(value) =>
                      handleChange(
                        "confirmPassword",
                        value
                      )
                    }
                    placeholder="Repeat your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    textContentType="newPassword"
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />

                  <Pressable
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name={
                        showConfirmPassword
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#94a3b8"
                    />
                  </Pressable>
                </View>
              </View>

              {/* ==================================================
                  SECURITY CARD
              ================================================== */}

              <View style={styles.securityCard}>
                <View style={styles.securityIcon}>
                  <MaterialCommunityIcons
                    name="shield-check-outline"
                    size={22}
                    color={PRIMARY}
                  />
                </View>

                <View style={styles.securityContent}>
                  <Text style={styles.securityTitle}>
                    Your information stays protected
                  </Text>

                  <Text style={styles.securityDescription}>
                    Your password is securely encrypted before it
                    is stored.
                  </Text>
                </View>
              </View>

              {/* ==================================================
                  SUBMIT
              ================================================== */}

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && !loading
                    ? styles.submitButtonPressed
                    : null,
                  loading
                    ? styles.submitButtonDisabled
                    : null,
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

                    <Text style={styles.submitText}>
                      Creating account...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitText}>
                      Create my account
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#ffffff"
                    />
                  </>
                )}
              </Pressable>
            </View>

            {/* ==================================================
                LOGIN LINK
            ================================================== */}

            <View style={styles.loginTextContainer}>
              <Text style={styles.loginText}>
                Already have an account?{" "}
              </Text>

              <Pressable
                onPress={() =>
                  router.replace("/customer/login")
                }
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </Pressable>
            </View>

            {/* ==================================================
                BENEFITS
            ================================================== */}

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#10b981"
                  />
                </View>

                <Text style={styles.benefitText}>
                  Free account
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#10b981"
                  />
                </View>

                <Text style={styles.benefitText}>
                  Instant booking
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#10b981"
                  />
                </View>

                <Text style={styles.benefitText}>
                  Secure
                </Text>
              </View>
            </View>

            {/* ==================================================
                BRAND FEATURE
            ================================================== */}

            <View style={styles.brandFeatureCard}>
              <View style={styles.brandFeatureHeader}>
                <View style={styles.brandSparkle}>
                  <Ionicons
                    name="sparkles"
                    size={17}
                    color="#f4c7dc"
                  />
                </View>

                <Text style={styles.brandFeatureBadge}>
                  ONE ACCOUNT. ENDLESS BEAUTY POSSIBILITIES.
                </Text>
              </View>

              <Text style={styles.brandFeatureTitle}>
                Your beauty.{"\n"}
                <Text style={styles.brandFeatureAccent}>
                  Your way.
                </Text>
              </Text>

              <Text style={styles.brandFeatureDescription}>
                Find the right salon, the right specialist and
                the right time — without the usual back and
                forth.
              </Text>

              <View style={styles.featureList}>
                {[
                  "Discover salons around you",
                  "Choose your preferred service",
                  "Pick your favourite stylist",
                  "Book your perfect time",
                ].map((item) => (
                  <View
                    key={item}
                    style={styles.featureItem}
                  >
                    <View style={styles.featureCheck}>
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color="#f4c7dc"
                      />
                    </View>

                    <Text style={styles.featureText}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.bottomDescription}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color="#d8bfdc"
                />

                <Text style={styles.bottomDescriptionText}>
                  Designed for a simpler, more beautiful booking
                  experience.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerRegister;

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#faf8fb",
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#faf8fb",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 45,
  },

  content: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 12,
  },

  // ============================================================
  // BACKGROUND
  // ============================================================

  backgroundGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#f8e8f4",
    opacity: 0.42,
    left: -145,
    top: 100,
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#eee4f5",
    opacity: 0.48,
    right: -155,
    bottom: 120,
  },

  // ============================================================
  // HEADER
  // ============================================================

  topHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  brandContainer: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },

  brandIcon: {
    width: 43,
    height: 43,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.18,
    shadowRadius: 13,
    elevation: 5,
  },

  brandTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  brandName: {
    color: TEXT,
    fontWeight: "900",
    letterSpacing: 2.5,
  },

  brandTagline: {
    color: "#94a3b8",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.7,
    marginTop: 2,
  },

  backButton: {
    width: 43,
    height: 43,
    flexShrink: 0,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },

  // ============================================================
  // INTRO
  // ============================================================

  intro: {
    width: "100%",
    marginBottom: 24,
  },

  introIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#f1e6f3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.07,
    shadowRadius: 13,
    elevation: 2,
  },

  title: {
    color: "#020617",
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  subtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    marginTop: 11,
    maxWidth: 560,
  },

  // ============================================================
  // ERROR
  // ============================================================

  errorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 20,
  },

  errorDot: {
    width: 8,
    height: 8,
    flexShrink: 0,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    marginTop: 6,
    marginRight: 11,

    shadowColor: "#ef4444",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },

  errorText: {
    flex: 1,
    minWidth: 0,
    color: "#b91c1c",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  // ============================================================
  // FORM
  // ============================================================

  form: {
    width: "100%",
    gap: 17,
  },

  fieldContainer: {
    width: "100%",
  },

  // ============================================================
  // EMAIL + PHONE RESPONSIVE
  // ============================================================

  contactFields: {
    width: "100%",
  },

  contactFieldsRow: {
    flexDirection: "row",
    gap: 12,
  },

  contactFieldsStacked: {
    flexDirection: "column",
    gap: 17,
  },

  columnField: {
    minWidth: 0,
  },

  columnFieldRow: {
    flex: 1,
  },

  columnFieldStacked: {
    width: "100%",
  },

  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  // ============================================================
  // INPUT
  // ============================================================

  inputWrapper: {
    width: "100%",
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 17,

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 1,
  },

  inputIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 7,
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  phoneInput: {
    letterSpacing: 0.7,
  },

  eyeButton: {
    width: 42,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  strengthCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 17,
    padding: 14,
    marginTop: 10,

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  strengthHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  strengthTitle: {
    flex: 1,
    color: "#94a3b8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },

  strengthLabel: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "900",
    textAlign: "right",
  },

  strengthBars: {
    width: "100%",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
  },

  strengthBar: {
    flex: 1,
    height: 6,
    borderRadius: 5,
  },

  strengthHint: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "500",
    marginTop: 8,
  },

  // ============================================================
  // SECURITY
  // ============================================================

  securityCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    borderRadius: 17,
    padding: 14,
    marginTop: 1,

    shadowColor: "#0f172a",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.045,
    shadowRadius: 12,
    elevation: 1,
  },

  securityIcon: {
    width: 43,
    height: 43,
    flexShrink: 0,
    borderRadius: 13,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  securityContent: {
    flex: 1,
    minWidth: 0,
  },

  securityTitle: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },

  securityDescription: {
    color: "#94a3b8",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "500",
    marginTop: 3,
  },

  // ============================================================
  // SUBMIT BUTTON
  // ============================================================

  submitButton: {
    width: "100%",
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    backgroundColor: PRIMARY,
    borderRadius: 17,
    paddingHorizontal: 20,
    marginTop: 2,

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 11,
    },
    shadowOpacity: 0.22,
    shadowRadius: 19,
    elevation: 5,
  },

  submitButtonPressed: {
    transform: [
      {
        translateY: 1,
      },
    ],
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  // ============================================================
  // LOGIN
  // ============================================================

  loginTextContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 22,
    paddingHorizontal: 5,
  },

  loginText: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
  },

  loginLink: {
    color: PRIMARY,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "900",
  },

  // ============================================================
  // BENEFITS
  // ============================================================

  benefitsContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 17,
    marginTop: 20,
  },

  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  checkCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },

  benefitText: {
    color: "#94a3b8",
    fontSize: 10,
    fontWeight: "800",
  },

  // ============================================================
  // BRAND FEATURE
  // ============================================================

  brandFeatureCard: {
    width: "100%",
    backgroundColor: PRIMARY,
    borderRadius: 25,
    marginTop: 28,
    padding: 22,
    overflow: "hidden",

    shadowColor: PRIMARY,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.17,
    shadowRadius: 22,
    elevation: 6,
  },

  brandFeatureHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },

  brandSparkle: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  brandFeatureBadge: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.72)",
    fontSize: 8,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  brandFeatureTitle: {
    color: "#ffffff",
    fontSize: 34,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -1.3,
  },

  brandFeatureAccent: {
    color: "#efb8d3",
  },

  brandFeatureDescription: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
    marginTop: 15,
  },

  featureList: {
    width: "100%",
    marginTop: 20,
    gap: 8,
  },

  featureItem: {
    width: "100%",
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 15,
    paddingHorizontal: 11,
  },

  featureCheck: {
    width: 29,
    height: 29,
    flexShrink: 0,
    borderRadius: 14.5,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  featureText: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.76)",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
  },

  bottomDescription: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 19,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },

  bottomDescriptionText: {
    flex: 1,
    minWidth: 0,
    color: "rgba(255,255,255,0.48)",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});