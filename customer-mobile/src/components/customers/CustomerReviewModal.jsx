import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { createCustomerReview } from "../../services/customerReviewService";

const COLORS = {
  background: "#F6F4F8",
  white: "#FFFFFF",
  surface: "#FBFAFC",

  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  primaryDeep: "#4C1D95",
  primarySoft: "#F3E8FF",

  amber: "#F59E0B",
  amberDark: "#D97706",
  amberSoft: "#FFF7E6",

  text: "#17121A",
  textDark: "#211925",
  textMedium: "#514653",
  textSoft: "#756A78",
  textMuted: "#9B909E",

  border: "#E8E2EA",
  borderSoft: "#F0EBF2",

  red: "#DC2626",
  redSoft: "#FEF2F2",
  redBorder: "#FECACA",

  green: "#16A34A",
  greenSoft: "#ECFDF3",

  dark: "#17121A",
};

const CustomerReviewModal = ({
  isOpen,
  onClose,
  appointment,
  onSuccess,
}) => {
  const { width, height } = useWindowDimensions();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * RESPONSIVE BREAKPOINTS
   * ---------------------------------------------------------
   */

  const isSmallMobile = width < 360;
  const isMediumMobile = width >= 360 && width < 430;
  const isLargeMobile = width >= 430 && width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;

  /*
   * ---------------------------------------------------------
   * RESPONSIVE VALUES
   * ---------------------------------------------------------
   */

  const modalWidth = isDesktop
    ? Math.min(width - 80, 680)
    : isTablet
      ? Math.min(width - 60, 640)
      : isLargeMobile
        ? Math.min(width - 28, 590)
        : isMediumMobile
          ? width - 24
          : width - 18;

  const modalMaxHeight = isDesktop
    ? Math.min(height - 70, 850)
    : isTablet
      ? Math.min(height - 50, 820)
      : Math.min(height - 24, 820);

  const horizontalPadding = isSmallMobile
    ? 14
    : isMediumMobile
      ? 17
      : isLargeMobile
        ? 20
        : isTablet
          ? 26
          : 28;

  /*
   * ---------------------------------------------------------
   * APPOINTMENT DATA
   * ---------------------------------------------------------
   */

  const salon = appointment?.salon || {};
  const service = appointment?.service || {};
  const staff = appointment?.staff || {};

  /*
   * ---------------------------------------------------------
   * RESET FORM
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen, appointment]);

  /*
   * ---------------------------------------------------------
   * RATING TEXT
   * ---------------------------------------------------------
   */

  const ratingText = useMemo(
    () => ({
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    }),
    []
  );

  /*
   * ---------------------------------------------------------
   * SUBMIT REVIEW
   * ---------------------------------------------------------
   */

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    const appointmentId =
      appointment?._id || appointment?.id;

    if (!appointmentId) {
      setError("Appointment information is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await createCustomerReview({
        appointmentId,
        rating,
        comment: comment.trim(),
      });

      if (onSuccess) {
        onSuccess(response);
      }

      onClose();
    } catch (err) {
      console.error("Create review error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * CLOSE
   * ---------------------------------------------------------
   */

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  /*
   * ---------------------------------------------------------
   * DON'T RENDER
   * ---------------------------------------------------------
   */

  if (!isOpen || !appointment) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * MODAL
   * ---------------------------------------------------------
   */

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        {/* BACKDROP */}

        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          disabled={submitting}
        >
          {/* EMPTY PRESSABLE SPACE */}
        </Pressable>

        {/* MODAL CARD */}

        <View
          style={[
            styles.modalCard,
            {
              width: modalWidth,
              maxHeight: modalMaxHeight,
            },
            isSmallMobile && styles.modalCardSmall,
            isDesktop && styles.modalCardDesktop,
          ]}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View
            style={[
              styles.header,
              {
                paddingHorizontal: horizontalPadding,
              },
              isSmallMobile && styles.headerSmall,
            ]}
          >
            {/* HEADER DECORATION */}

            <View style={styles.headerGlowOne} />
            <View style={styles.headerGlowTwo} />

            {/* CLOSE */}

            <Pressable
              onPress={handleClose}
              disabled={submitting}
              style={({ pressed }) => [
                styles.closeButton,
                isSmallMobile &&
                  styles.closeButtonSmall,
                pressed &&
                  !submitting &&
                  styles.closeButtonPressed,
                submitting && styles.disabledOpacity,
              ]}
              hitSlop={8}
            >
              <Ionicons
                name="close"
                size={isSmallMobile ? 18 : 20}
                color={COLORS.white}
              />
            </Pressable>

            {/* HEADER CONTENT */}

            <View
              style={[
                styles.headerContent,
                isSmallMobile &&
                  styles.headerContentSmall,
              ]}
            >
              {/* ICON */}

              <View
                style={[
                  styles.headerIcon,
                  isSmallMobile &&
                    styles.headerIconSmall,
                ]}
              >
                <MaterialCommunityIcons
                  name="comment-heart-outline"
                  size={isSmallMobile ? 19 : 22}
                  color={COLORS.white}
                />
              </View>

              {/* TITLE */}

              <Text
                style={[
                  styles.headerTitle,
                  isSmallMobile &&
                    styles.headerTitleSmall,
                  isTablet &&
                    styles.headerTitleTablet,
                  isDesktop &&
                    styles.headerTitleDesktop,
                ]}
              >
                Share Your Experience
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.headerDescription,
                  isSmallMobile &&
                    styles.headerDescriptionSmall,
                ]}
              >
                Your feedback helps us improve and helps
                other customers choose with confidence.
              </Text>
            </View>

            {/* HEADER STATUS */}

            <View
              style={[
                styles.headerStatus,
                isSmallMobile &&
                  styles.headerStatusSmall,
              ]}
            >
              <View style={styles.headerStatusDot} />

              <Text
                style={[
                  styles.headerStatusText,
                  isSmallMobile &&
                    styles.headerStatusTextSmall,
                ]}
              >
                YOUR FEEDBACK MATTERS
              </Text>
            </View>
          </View>

          {/* =================================================
              CONTENT
          ================================================= */}

          <View style={styles.contentWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal:
                    horizontalPadding,
                },
                isSmallMobile &&
                  styles.scrollContentSmall,
              ]}
            >
              {/* =================================================
                  APPOINTMENT CARD
              ================================================= */}

              <View
                style={[
                  styles.appointmentCard,
                  isSmallMobile &&
                    styles.appointmentCardSmall,
                ]}
              >
                {/* TOP ACCENT */}

                <View style={styles.appointmentAccent} />

                <View
                  style={[
                    styles.appointmentRow,
                    isSmallMobile &&
                      styles.appointmentRowSmall,
                  ]}
                >
                  {/* ICON */}

                  <View
                    style={[
                      styles.appointmentIcon,
                      isSmallMobile &&
                        styles.appointmentIconSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="content-cut"
                      size={isSmallMobile ? 18 : 21}
                      color={COLORS.primary}
                    />
                  </View>

                  {/* DETAILS */}

                  <View
                    style={styles.appointmentDetails}
                  >
                    <Text
                      style={[
                        styles.appointmentEyebrow,
                        isSmallMobile &&
                          styles.appointmentEyebrowSmall,
                      ]}
                    >
                      YOUR APPOINTMENT
                    </Text>

                    <Text
                      style={[
                        styles.salonName,
                        isSmallMobile &&
                          styles.salonNameSmall,
                      ]}
                      numberOfLines={2}
                    >
                      {salon?.name || "Salon"}
                    </Text>

                    <Text
                      style={[
                        styles.serviceName,
                        isSmallMobile &&
                          styles.serviceNameSmall,
                      ]}
                      numberOfLines={2}
                    >
                      {service?.name || "Beauty Service"}
                    </Text>

                    {staff?.name ? (
                      <View
                        style={[
                          styles.staffPill,
                          isSmallMobile &&
                            styles.staffPillSmall,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={
                            isSmallMobile ? 11 : 12
                          }
                          color={COLORS.textSoft}
                        />

                        <Text
                          style={[
                            styles.staffText,
                            isSmallMobile &&
                              styles.staffTextSmall,
                          ]}
                          numberOfLines={1}
                        >
                          {staff.name}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* COMPLETED BADGE */}

                  <View
                    style={[
                      styles.completedBadge,
                      isSmallMobile &&
                        styles.completedBadgeSmall,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={
                        isSmallMobile ? 13 : 15
                      }
                      color={COLORS.green}
                    />

                    {!isSmallMobile && (
                      <Text
                        style={styles.completedText}
                      >
                        VISITED
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* =================================================
                  RATING SECTION
              ================================================= */}

              <View
                style={[
                  styles.ratingSection,
                  isSmallMobile &&
                    styles.ratingSectionSmall,
                ]}
              >
                {/* RATING ICON */}

                <View
                  style={[
                    styles.ratingIcon,
                    isSmallMobile &&
                      styles.ratingIconSmall,
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={isSmallMobile ? 17 : 20}
                    color={COLORS.amber}
                  />
                </View>

                {/* TITLE */}

                <Text
                  style={[
                    styles.ratingTitle,
                    isSmallMobile &&
                      styles.ratingTitleSmall,
                  ]}
                >
                  How was your experience?
                </Text>

                {/* DESCRIPTION */}

                <Text
                  style={[
                    styles.ratingDescription,
                    isSmallMobile &&
                      styles.ratingDescriptionSmall,
                  ]}
                >
                  Tap a star to rate your appointment
                </Text>

                {/* =================================================
                    STAR BOXES
                ================================================= */}

                <View
                  style={[
                    styles.starsContainer,
                    isSmallMobile &&
                      styles.starsContainerSmall,
                  ]}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= rating;

                    return (
                      <Pressable
                        key={star}
                        onPress={() => {
                          if (!submitting) {
                            setRating(star);
                            setError("");
                          }
                        }}
                        disabled={submitting}
                        accessibilityRole="button"
                        accessibilityLabel={`Rate ${star} star${
                          star > 1 ? "s" : ""
                        }`}
                        style={({ pressed }) => [
                          styles.starButton,
                          isSmallMobile &&
                            styles.starButtonSmall,
                          active &&
                            styles.starButtonActive,
                          pressed &&
                            !submitting &&
                            styles.starButtonPressed,
                          submitting &&
                            styles.disabledOpacity,
                        ]}
                      >
                        <Ionicons
                          name={
                            active
                              ? "star"
                              : "star-outline"
                          }
                          size={
                            isSmallMobile
                              ? 21
                              : isMediumMobile
                                ? 24
                                : 27
                          }
                          color={
                            active
                              ? COLORS.amber
                              : "#CFC6D1"
                          }
                        />

                        {/* STAR NUMBER */}

                        <Text
                          style={[
                            styles.starNumber,
                            isSmallMobile &&
                              styles.starNumberSmall,
                            active &&
                              styles.starNumberActive,
                          ]}
                        >
                          {star}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* =================================================
                    RATING RESULT
                ================================================= */}

                <View
                  style={[
                    styles.ratingResult,
                    !rating &&
                      styles.ratingResultEmpty,
                    isSmallMobile &&
                      styles.ratingResultSmall,
                  ]}
                >
                  {rating ? (
                    <>
                      <Ionicons
                        name="sparkles"
                        size={13}
                        color={COLORS.amberDark}
                      />

                      <Text
                        style={[
                          styles.ratingResultText,
                          isSmallMobile &&
                            styles.ratingResultTextSmall,
                        ]}
                      >
                        {ratingText[rating]}
                      </Text>

                      <View
                        style={styles.ratingResultDivider}
                      />

                      <Text
                        style={[
                          styles.ratingScore,
                          isSmallMobile &&
                            styles.ratingScoreSmall,
                        ]}
                      >
                        {rating}.0 / 5
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.ratingEmptyText,
                        isSmallMobile &&
                          styles.ratingEmptyTextSmall,
                      ]}
                    >
                      No rating selected yet
                    </Text>
                  )}
                </View>
              </View>

              {/* =================================================
                  COMMENT SECTION
              ================================================= */}

              <View
                style={[
                  styles.commentSection,
                  isSmallMobile &&
                    styles.commentSectionSmall,
                ]}
              >
                {/* LABEL ROW */}

                <View
                  style={[
                    styles.commentHeader,
                    isSmallMobile &&
                      styles.commentHeaderSmall,
                  ]}
                >
                  <View
                    style={styles.commentTitleBlock}
                  >
                    <View style={styles.commentTitleRow}>
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={
                          isSmallMobile ? 15 : 17
                        }
                        color={COLORS.primary}
                      />

                      <Text
                        style={[
                          styles.commentTitle,
                          isSmallMobile &&
                            styles.commentTitleSmall,
                        ]}
                      >
                        Tell us more
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.commentDescription,
                        isSmallMobile &&
                          styles.commentDescriptionSmall,
                      ]}
                    >
                      Share what you liked about the
                      salon, service or staff.
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.optionalBadge,
                      isSmallMobile &&
                        styles.optionalBadgeSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionalText,
                        isSmallMobile &&
                          styles.optionalTextSmall,
                      ]}
                    >
                      OPTIONAL
                    </Text>
                  </View>
                </View>

                {/* =================================================
                    INPUT
                ================================================= */}

                <View
                  style={[
                    styles.inputContainer,
                    isSmallMobile &&
                      styles.inputContainerSmall,
                  ]}
                >
                  <TextInput
                    value={comment}
                    onChangeText={(text) => {
                      setComment(text);
                      if (error) {
                        setError("");
                      }
                    }}
                    maxLength={500}
                    multiline
                    textAlignVertical="top"
                    editable={!submitting}
                    placeholder="What did you like about your experience?"
                    placeholderTextColor="#A89DAA"
                    style={[
                      styles.commentInput,
                      isSmallMobile &&
                        styles.commentInputSmall,
                    ]}
                  />

                  {/* CHARACTER COUNT */}

                  <View
                    style={[
                      styles.characterCount,
                      isSmallMobile &&
                        styles.characterCountSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.characterCountText,
                        isSmallMobile &&
                          styles.characterCountTextSmall,
                      ]}
                    >
                      {comment.length}/500
                    </Text>
                  </View>
                </View>
              </View>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error ? (
                <View
                  style={[
                    styles.errorCard,
                    isSmallMobile &&
                      styles.errorCardSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.errorIcon,
                      isSmallMobile &&
                        styles.errorIconSmall,
                    ]}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={isSmallMobile ? 16 : 18}
                      color={COLORS.red}
                    />
                  </View>

                  <View
                    style={styles.errorContent}
                  >
                    <Text
                      style={[
                        styles.errorTitle,
                        isSmallMobile &&
                          styles.errorTitleSmall,
                      ]}
                    >
                      Review couldn't be submitted
                    </Text>

                    <Text
                      style={[
                        styles.errorMessage,
                        isSmallMobile &&
                          styles.errorMessageSmall,
                      ]}
                    >
                      {error}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* =================================================
                  TRUST STRIP
              ================================================= */}

              <View
                style={[
                  styles.trustStrip,
                  isSmallMobile &&
                    styles.trustStripSmall,
                ]}
              >
                <View
                  style={[
                    styles.trustIcon,
                    isSmallMobile &&
                      styles.trustIconSmall,
                  ]}
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={isSmallMobile ? 15 : 17}
                    color={COLORS.green}
                  />
                </View>

                <Text
                  style={[
                    styles.trustText,
                    isSmallMobile &&
                      styles.trustTextSmall,
                  ]}
                >
                  Your review is securely linked to this
                  completed appointment.
                </Text>
              </View>
            </ScrollView>
          </View>

          {/* =================================================
              FOOTER
          ================================================= */}

          <View
            style={[
              styles.footer,
              {
                paddingHorizontal:
                  horizontalPadding,
              },
              isSmallMobile &&
                styles.footerSmall,
            ]}
          >
            {/* FOOTER TOP LINE */}

            <View style={styles.footerTopLine} />

            <View
              style={[
                styles.footerActions,
                isSmallMobile &&
                  styles.footerActionsSmall,
              ]}
            >
              {/* MAYBE LATER */}

              <Pressable
                onPress={handleClose}
                disabled={submitting}
                style={({ pressed }) => [
                  styles.maybeButton,
                  isSmallMobile &&
                    styles.maybeButtonSmall,
                  pressed &&
                    !submitting &&
                    styles.maybeButtonPressed,
                  submitting &&
                    styles.disabledOpacity,
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={isSmallMobile ? 15 : 17}
                  color={COLORS.textMedium}
                />

                <Text
                  style={[
                    styles.maybeButtonText,
                    isSmallMobile &&
                      styles.maybeButtonTextSmall,
                  ]}
                >
                  Maybe Later
                </Text>
              </Pressable>

              {/* SUBMIT */}

              <Pressable
                onPress={handleSubmit}
                disabled={submitting || !rating}
                style={({ pressed }) => [
                  styles.submitButton,
                  isSmallMobile &&
                    styles.submitButtonSmall,
                  (!rating || submitting) &&
                    styles.submitButtonDisabled,
                  pressed &&
                    rating &&
                    !submitting &&
                    styles.submitButtonPressed,
                ]}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                    />

                    <Text
                      style={[
                        styles.submitButtonText,
                        isSmallMobile &&
                          styles.submitButtonTextSmall,
                      ]}
                    >
                      Submitting...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={isSmallMobile ? 17 : 19}
                      color={COLORS.white}
                    />

                    <Text
                      style={[
                        styles.submitButtonText,
                        isSmallMobile &&
                          styles.submitButtonTextSmall,
                      ]}
                    >
                      Submit Review
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  /*
   * =========================================================
   * ROOT / BACKDROP
   * =========================================================
   */

  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 10, 20, 0.68)",
  },

  /*
   * =========================================================
   * MODAL CARD
   * =========================================================
   */

  modalCard: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: COLORS.white,

    shadowColor: "#120A16",
    shadowOpacity: 0.30,
    shadowRadius: 45,
    shadowOffset: {
      width: 0,
      height: 24,
    },

    elevation: 18,
  },

  modalCardSmall: {
    borderRadius: 22,
  },

  modalCardDesktop: {
    borderRadius: 32,
  },

  /*
   * =========================================================
   * HEADER
   * =========================================================
   */

  header: {
    position: "relative",
    overflow: "hidden",
    paddingTop: 22,
    paddingBottom: 20,
    backgroundColor: COLORS.primaryDeep,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  headerSmall: {
    paddingTop: 17,
    paddingBottom: 16,
  },

  headerGlowOne: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    right: -90,
    top: -125,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  headerGlowTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -90,
    bottom: -125,
    backgroundColor: "rgba(216,180,254,0.12)",
  },

  closeButton: {
    position: "absolute",
    right: 17,
    top: 17,
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    zIndex: 10,
  },

  closeButtonSmall: {
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    borderRadius: 11,
  },

  closeButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },

  disabledOpacity: {
    opacity: 0.50,
  },

  headerContent: {
    paddingRight: 48,
  },

  headerContentSmall: {
    paddingRight: 38,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  headerIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 13,
  },

  headerTitle: {
    marginTop: 13,
    color: COLORS.white,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
    includeFontPadding: false,
  },

  headerTitleSmall: {
    fontSize: 18,
    lineHeight: 23,
  },

  headerTitleTablet: {
    fontSize: 26,
    lineHeight: 32,
  },

  headerTitleDesktop: {
    fontSize: 28,
    lineHeight: 34,
  },

  headerDescription: {
    marginTop: 6,
    maxWidth: 500,
    color: "#EDE4F7",
    fontSize: 12.5,
    lineHeight: 20,
    fontWeight: "500",
    includeFontPadding: false,
  },

  headerDescriptionSmall: {
    fontSize: 10.5,
    lineHeight: 17,
  },

  headerStatus: {
    marginTop: 17,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  headerStatusSmall: {
    marginTop: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  headerStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#86EFAC",
  },

  headerStatusText: {
    color: "#E9DDF5",
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  headerStatusTextSmall: {
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.7,
  },

  /*
   * =========================================================
   * CONTENT
   * =========================================================
   */

  contentWrapper: {
    flex: 1,
    minHeight: 0,
    backgroundColor: COLORS.surface,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  scrollContentSmall: {
    paddingTop: 14,
    paddingBottom: 14,
  },

  /*
   * =========================================================
   * APPOINTMENT CARD
   * =========================================================
   */

  appointmentCard: {
    position: "relative",
    overflow: "hidden",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,

    shadowColor: "#39233F",
    shadowOpacity: 0.055,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 2,
  },

  appointmentCardSmall: {
    padding: 12,
    borderRadius: 17,
  },

  appointmentAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 4,
    height: "100%",
    backgroundColor: COLORS.primary,
  },

  appointmentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  appointmentRowSmall: {
    gap: 9,
  },

  appointmentIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  appointmentIconSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },

  appointmentDetails: {
    flex: 1,
    minWidth: 0,
  },

  appointmentEyebrow: {
    color: COLORS.primary,
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.3,
    includeFontPadding: false,
  },

  appointmentEyebrowSmall: {
    fontSize: 7,
    lineHeight: 9,
    letterSpacing: 0.9,
  },

  salonName: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    includeFontPadding: false,
  },

  salonNameSmall: {
    fontSize: 13,
    lineHeight: 17,
  },

  serviceName: {
    marginTop: 2,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    includeFontPadding: false,
  },

  serviceNameSmall: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  staffPill: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: "#F7F4F8",
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },

  staffPillSmall: {
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  staffText: {
    flexShrink: 1,
    color: COLORS.textMedium,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "800",
    includeFontPadding: false,
  },

  staffTextSmall: {
    fontSize: 8.5,
    lineHeight: 11,
  },

  completedBadge: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  completedBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 5,
  },

  completedText: {
    color: COLORS.green,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    includeFontPadding: false,
  },

  /*
   * =========================================================
   * RATING SECTION
   * =========================================================
   */

  ratingSection: {
    marginTop: 20,
    paddingVertical: 4,
    alignItems: "center",
  },

  ratingSectionSmall: {
    marginTop: 15,
  },

  ratingIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  ratingIconSmall: {
    width: 34,
    height: 34,
    borderRadius: 12,
  },

  ratingTitle: {
    marginTop: 11,
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  ratingTitleSmall: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 19,
  },

  ratingDescription: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  ratingDescriptionSmall: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  starsContainer: {
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  starsContainerSmall: {
    marginTop: 12,
    gap: 5,
  },

  starButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,

    shadowColor: "#38243E",
    shadowOpacity: 0.035,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 1,
  },

  starButtonSmall: {
    width: 43,
    height: 43,
    borderRadius: 13,
  },

  starButtonActive: {
    backgroundColor: "#FFF9EA",
    borderColor: "#FCD34D",

    shadowColor: COLORS.amber,
    shadowOpacity: 0.13,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 3,
  },

  starButtonPressed: {
    transform: [{ scale: 0.93 }],
    opacity: 0.82,
  },

  starNumber: {
    position: "absolute",
    bottom: 3,
    color: "#B6ACB8",
    fontSize: 6.5,
    lineHeight: 8,
    fontWeight: "900",
    includeFontPadding: false,
  },

  starNumberSmall: {
    bottom: 2,
    fontSize: 5.5,
    lineHeight: 7,
  },

  starNumberActive: {
    color: COLORS.amberDark,
  },

  ratingResult: {
    marginTop: 12,
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.amberSoft,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  ratingResultSmall: {
    marginTop: 9,
    minHeight: 27,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  ratingResultEmpty: {
    backgroundColor: "#F7F4F8",
    borderColor: COLORS.borderSoft,
  },

  ratingResultText: {
    color: COLORS.amberDark,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  ratingResultTextSmall: {
    fontSize: 8.5,
    lineHeight: 11,
  },

  ratingResultDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#F3D58A",
  },

  ratingScore: {
    color: COLORS.textMedium,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "800",
    includeFontPadding: false,
  },

  ratingScoreSmall: {
    fontSize: 8,
    lineHeight: 11,
  },

  ratingEmptyText: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "600",
    includeFontPadding: false,
  },

  ratingEmptyTextSmall: {
    fontSize: 8,
    lineHeight: 11,
  },

  /*
   * =========================================================
   * COMMENT
   * =========================================================
   */

  commentSection: {
    marginTop: 21,
  },

  commentSectionSmall: {
    marginTop: 16,
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  commentHeaderSmall: {
    gap: 8,
  },

  commentTitleBlock: {
    flex: 1,
    minWidth: 0,
  },

  commentTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  commentTitle: {
    color: COLORS.textDark,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    includeFontPadding: false,
  },

  commentTitleSmall: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  commentDescription: {
    marginTop: 3,
    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "500",
    includeFontPadding: false,
  },

  commentDescriptionSmall: {
    fontSize: 8.5,
    lineHeight: 13,
  },

  optionalBadge: {
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F4F1F5",
  },

  optionalBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  optionalText: {
    color: COLORS.textMuted,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
    includeFontPadding: false,
  },

  optionalTextSmall: {
    fontSize: 6.5,
    lineHeight: 8,
  },

  inputContainer: {
  position: "relative",
  marginTop: 11,
  minHeight: 126,
  borderRadius: 17,
  borderWidth: 1,
  borderColor: COLORS.border,
  backgroundColor: "#FAF8FB",
  overflow: "hidden",
  boxSizing: "border-box",
},
  inputContainerSmall: {
    marginTop: 8,
    minHeight: 105,
    borderRadius: 14,
  },

 commentInput: {
  width: "100%",
  minHeight: 126,

  paddingHorizontal: 14,
  paddingTop: 13,
  paddingBottom: 31,

  color: COLORS.textDark,
  fontSize: 12,
  lineHeight: 19,
  fontWeight: "500",
  includeFontPadding: false,
  borderWidth: 0,
  borderColor: "transparent",
  outlineStyle: "none",
  outlineWidth: 0,
  backgroundColor: "transparent",
  boxSizing: "border-box",
},

  commentInputSmall: {
  minHeight: 105,
  paddingHorizontal: 11,
  paddingTop: 10,
  paddingBottom: 27,
  fontSize: 10,
  lineHeight: 16,
  borderWidth: 0,
  borderColor: "transparent",
  outlineStyle: "none",
  outlineWidth: 0,
  backgroundColor: "transparent",
  boxSizing: "border-box",
},
  characterCount: {
    position: "absolute",
    right: 10,
    bottom: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#F0ECF2",
  },

  characterCountSmall: {
    right: 8,
    bottom: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },

  characterCountText: {
    color: COLORS.textMuted,
    fontSize: 7.5,
    lineHeight: 10,
    fontWeight: "800",
    includeFontPadding: false,
  },

  characterCountTextSmall: {
    fontSize: 6.5,
    lineHeight: 8,
  },

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  errorCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.redBorder,
    backgroundColor: COLORS.redSoft,
  },

  errorCardSmall: {
    marginTop: 9,
    gap: 7,
    padding: 9,
    borderRadius: 12,
  },

  errorIcon: {
    width: 29,
    height: 29,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },

  errorIconSmall: {
    width: 25,
    height: 25,
    borderRadius: 8,
  },

  errorContent: {
    flex: 1,
    minWidth: 0,
  },

  errorTitle: {
    color: "#991B1B",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  errorTitleSmall: {
    fontSize: 9,
    lineHeight: 12,
  },

  errorMessage: {
    marginTop: 2,
    color: "#B91C1C",
    fontSize: 9.5,
    lineHeight: 15,
    fontWeight: "600",
    includeFontPadding: false,
  },

  errorMessageSmall: {
    fontSize: 8,
    lineHeight: 12,
  },

  /*
   * =========================================================
   * TRUST STRIP
   * =========================================================
   */

  trustStrip: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: COLORS.greenSoft,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  trustStripSmall: {
    marginTop: 9,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 10,
  },

  trustIcon: {
    width: 27,
    height: 27,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: COLORS.white,
  },

  trustIconSmall: {
    width: 23,
    height: 23,
    borderRadius: 7,
  },

  trustText: {
    flex: 1,
    color: "#52705B",
    fontSize: 8.5,
    lineHeight: 13,
    fontWeight: "600",
    includeFontPadding: false,
  },

  trustTextSmall: {
    fontSize: 7,
    lineHeight: 11,
  },

  /*
   * =========================================================
   * FOOTER
   * =========================================================
   */

  footer: {
    backgroundColor: COLORS.white,
  },

  footerSmall: {},

  footerTopLine: {
    height: 1,
    backgroundColor: COLORS.border,
  },

  footerActions: {
    paddingTop: 12,
    paddingBottom: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 9,
  },

  footerActionsSmall: {
    paddingTop: 9,
    paddingBottom: 10,
    gap: 7,
  },

  /*
   * MAYBE LATER
   */

  maybeButton: {
    minHeight: 45,
    minWidth: 120,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },

  maybeButtonSmall: {
    minHeight: 39,
    minWidth: 0,
    flex: 0.9,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 5,
  },

  maybeButtonPressed: {
    backgroundColor: "#F7F4F8",
    transform: [{ scale: 0.98 }],
  },

  maybeButtonText: {
    color: COLORS.textMedium,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  maybeButtonTextSmall: {
    fontSize: 8.5,
    lineHeight: 11,
  },

  /*
   * SUBMIT
   */

  submitButton: {
    minHeight: 45,
    minWidth: 165,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    backgroundColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 7,
    },

    elevation: 5,
  },

  submitButtonSmall: {
    minHeight: 39,
    minWidth: 0,
    flex: 1.1,
    paddingHorizontal: 9,
    borderRadius: 12,
    gap: 5,
  },

  submitButtonDisabled: {
    backgroundColor: "#C7BEC9",
    shadowOpacity: 0,
    elevation: 0,
  },

  submitButtonPressed: {
    backgroundColor: COLORS.primaryDark,
    transform: [{ scale: 0.985 }],
  },

  submitButtonText: {
    color: COLORS.white,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "900",
    includeFontPadding: false,
  },

  submitButtonTextSmall: {
    fontSize: 8.5,
    lineHeight: 11,
  },
});

export default CustomerReviewModal;