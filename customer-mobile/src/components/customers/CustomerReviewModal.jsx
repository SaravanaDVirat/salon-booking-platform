import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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
  const [inputFocused, setInputFocused] = useState(false);

  /*
   * =========================================================
   * RESPONSIVE BREAKPOINTS
   * =========================================================
   */

  const isSmallMobile = width < 360;
  const isMediumMobile = width >= 360 && width < 430;
  const isLargeMobile = width >= 430 && width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;

  /*
   * =========================================================
   * SAFE MODAL DIMENSIONS
   * =========================================================
   */

  const horizontalScreenMargin = isSmallMobile
    ? 10
    : isMediumMobile
      ? 12
      : isLargeMobile
        ? 14
        : isTablet
          ? 30
          : 40;

  const modalWidth = isDesktop
    ? Math.min(width - horizontalScreenMargin * 2, 680)
    : isTablet
      ? Math.min(width - horizontalScreenMargin * 2, 640)
      : Math.min(width - horizontalScreenMargin * 2, 680);

  /*
   * Android needs a little extra vertical breathing room.
   * This prevents the card from touching the status/navigation
   * areas and gives KeyboardAvoidingView room to shrink.
   */

  const verticalScreenMargin =
    Platform.OS === "android"
      ? isSmallMobile
        ? 10
        : isMediumMobile
          ? 12
          : isLargeMobile
            ? 14
            : isTablet
              ? 20
              : 28
      : isSmallMobile
        ? 14
        : isMediumMobile
          ? 16
          : isLargeMobile
            ? 18
            : isTablet
              ? 24
              : 35;

  const availableHeight = Math.max(
    280,
    height - verticalScreenMargin * 2
  );

  const modalMaxHeight = Math.min(
    availableHeight,
    isDesktop ? 850 : 820
  );

  const horizontalPadding = isSmallMobile
    ? 13
    : isMediumMobile
      ? 16
      : isLargeMobile
        ? 20
        : isTablet
          ? 26
          : 28;

  /*
   * =========================================================
   * APPOINTMENT DATA
   * =========================================================
   */

  const salon = appointment?.salon || {};
  const service = appointment?.service || {};
  const staff = appointment?.staff || {};

  const appointmentId =
    appointment?._id || appointment?.id || null;

  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   *
   * Only reset when modal opens or appointment changes.
   * This is important for Android TextInput focus stability.
   */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setRating(0);
    setComment("");
    setError("");
    setSubmitting(false);
    setInputFocused(false);
  }, [isOpen, appointmentId]);

  /*
   * =========================================================
   * RATING TEXT
   * =========================================================
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
   * =========================================================
   * INPUT FOCUS
   * =========================================================
   */

  const handleInputFocus = () => {
    if (submitting) {
      return;
    }

    setInputFocused(true);
  };

  const handleInputBlur = () => {
    setInputFocused(false);
  };

  /*
   * =========================================================
   * COMMENT CHANGE
   * =========================================================
   */

  const handleCommentChange = (text) => {
    if (submitting) {
      return;
    }

    setComment(text);

    if (error) {
      setError("");
    }
  };

  /*
   * =========================================================
   * SUBMIT REVIEW
   * =========================================================
   */

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setInputFocused(false);

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

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
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {
    if (submitting) {
      return;
    }

    Keyboard.dismiss();
    setInputFocused(false);

    onClose();
  };

  /*
   * =========================================================
   * DON'T RENDER
   * =========================================================
   */

  if (!isOpen || !appointment) {
    return null;
  }

  /*
   * =========================================================
   * MODAL
   * =========================================================
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
          Platform.OS === "ios"
            ? "padding"
            : Platform.OS === "android"
              ? "height"
              : undefined
        }
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 10 : 0
        }
      >
        {/* BACKDROP */}

        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
          disabled={submitting}
        />

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
            <View style={styles.headerGlowOne} />
            <View style={styles.headerGlowTwo} />

            {/* CLOSE */}

            <Pressable
              onPress={handleClose}
              disabled={submitting}
              hitSlop={8}
              style={({ pressed }) => [
                styles.closeButton,
                isSmallMobile &&
                  styles.closeButtonSmall,
                pressed &&
                  !submitting &&
                  styles.closeButtonPressed,
                submitting && styles.disabledOpacity,
              ]}
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
                numberOfLines={2}
              >
                Share Your Experience
              </Text>

              <Text
                style={[
                  styles.headerDescription,
                  isSmallMobile &&
                    styles.headerDescriptionSmall,
                ]}
              >
                Your feedback helps us improve and
                helps other customers choose with
                confidence.
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
                numberOfLines={1}
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
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingHorizontal:
                    horizontalPadding,
                },
                isSmallMobile &&
                  styles.scrollContentSmall,
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              keyboardDismissMode={
                Platform.OS === "ios"
                  ? "interactive"
                  : "on-drag"
              }
              nestedScrollEnabled
              automaticallyAdjustKeyboardInsets={
                Platform.OS === "ios"
              }
              scrollEventThrottle={16}
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
                <View style={styles.appointmentAccent} />

                <View
                  style={[
                    styles.appointmentRow,
                    isSmallMobile &&
                      styles.appointmentRowSmall,
                  ]}
                >
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
                      ellipsizeMode="tail"
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
                      ellipsizeMode="tail"
                    >
                      {service?.name ||
                        "Beauty Service"}
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
                          ellipsizeMode="tail"
                        >
                          {staff.name}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* VISITED */}

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
                        numberOfLines={1}
                      >
                        VISITED
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* =================================================
                  RATING
              ================================================= */}

              <View
                style={[
                  styles.ratingSection,
                  isSmallMobile &&
                    styles.ratingSectionSmall,
                ]}
              >
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

                <Text
                  style={[
                    styles.ratingTitle,
                    isSmallMobile &&
                      styles.ratingTitleSmall,
                  ]}
                  numberOfLines={2}
                >
                  How was your experience?
                </Text>

                <Text
                  style={[
                    styles.ratingDescription,
                    isSmallMobile &&
                      styles.ratingDescriptionSmall,
                  ]}
                  numberOfLines={2}
                >
                  Tap a star to rate your appointment
                </Text>

                {/* STARS */}

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
                            Keyboard.dismiss();
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

                {/* RATING RESULT */}

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
                  COMMENT
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
                    <View
                      style={styles.commentTitleRow}
                    >
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
                      numberOfLines={3}
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
                      numberOfLines={1}
                    >
                      OPTIONAL
                    </Text>
                  </View>
                </View>

                {/* =================================================
                    INPUT CONTAINER
                ================================================= */}

                <View
                  style={[
                    styles.inputContainer,
                    isSmallMobile &&
                      styles.inputContainerSmall,
                    inputFocused &&
                      styles.inputContainerFocused,
                    submitting &&
                      styles.inputContainerDisabled,
                  ]}
                >
                  <TextInput
                    value={comment}
                    onChangeText={handleCommentChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    maxLength={500}
                    multiline
                    editable={!submitting}
                    selectTextOnFocus={false}
                    blurOnSubmit={false}
                    disableFullscreenUI
                    scrollEnabled
                    textAlign="left"
                    textAlignVertical="top"
                    placeholder="What did you like about your experience?"
                    placeholderTextColor="#A89DAA"
                    underlineColorAndroid="transparent"
                    autoCorrect
                    spellCheck
                    autoCapitalize="sentences"
                    importantForAutofill="no"
                    keyboardAppearance="light"
                    textBreakStrategy="simple"
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
                    pointerEvents="none"
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
                  Your review is securely linked to
                  this completed appointment.
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
            ]}
          >
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
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
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
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
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
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
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

/*
 * =============================================================
 * STYLES
 * =============================================================
 */

const styles = StyleSheet.create({
  /*
   * =========================================================
   * ROOT
   * =========================================================
   */

  modalRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 10, 20, 0.68)",
  },

  /*
   * =========================================================
   * MODAL CARD
   * =========================================================
   */

  modalCard: {
    flexShrink: 1,
    minHeight: 0,

    overflow: "hidden",

    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",

    backgroundColor: COLORS.white,

    shadowColor: "#120A16",
    shadowOpacity: 0.3,
    shadowRadius: 45,

    shadowOffset: {
      width: 0,
      height: 24,
    },

    elevation: 18,
  },

  modalCardSmall: {
    borderRadius: 21,
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
    flexShrink: 0,

    paddingTop: 22,
    paddingBottom: 20,

    backgroundColor: COLORS.primaryDeep,

    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  headerSmall: {
    paddingTop: 15,
    paddingBottom: 14,
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
    right: 10,
    top: 10,

    width: 32,
    height: 32,

    borderRadius: 10,
  },

  closeButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.94 }],
  },

  disabledOpacity: {
    opacity: 0.5,
  },

  headerContent: {
    paddingRight: 48,
  },

  headerContentSmall: {
    paddingRight: 37,
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
    width: 38,
    height: 38,

    borderRadius: 12,
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
    marginTop: 9,

    fontSize: 18,
    lineHeight: 22,

    letterSpacing: -0.3,
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
    marginTop: 5,

    fontSize: 10.5,
    lineHeight: 16,
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
    marginTop: 10,

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

  scrollView: {
    flex: 1,
    minHeight: 0,
  },

  scrollContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },

  scrollContentSmall: {
    paddingTop: 13,
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
    padding: 11,
    borderRadius: 16,
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
    gap: 8,
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
    width: 37,
    height: 37,

    borderRadius: 11,
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
    fontSize: 6.8,
    lineHeight: 9,

    letterSpacing: 0.8,
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
    marginTop: 3,

    fontSize: 12.5,
    lineHeight: 16,
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
    fontSize: 10,
    lineHeight: 14,
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
    marginTop: 5,

    paddingHorizontal: 6,
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
    fontSize: 8,
    lineHeight: 10,
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
    paddingHorizontal: 5,
    paddingVertical: 4,
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
   * RATING
   * =========================================================
   */

  ratingSection: {
    marginTop: 20,

    paddingVertical: 4,

    alignItems: "center",
  },

  ratingSectionSmall: {
    marginTop: 14,
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

    borderRadius: 11,
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
    marginTop: 7,

    fontSize: 14,
    lineHeight: 18,
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
    marginTop: 3,

    fontSize: 9.2,
    lineHeight: 13,
  },

  /*
   * =========================================================
   * STARS
   * =========================================================
   */

  starsContainer: {
    marginTop: 17,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 8,
  },

  starsContainerSmall: {
    marginTop: 11,
    gap: 4,
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

    borderRadius: 12,
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
    marginTop: 8,

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
    marginTop: 15,
  },

  commentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    gap: 12,
  },

  commentHeaderSmall: {
    gap: 7,
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
    lineHeight: 15,
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
    fontSize: 8.3,
    lineHeight: 12,
  },

  optionalBadge: {
    flexShrink: 0,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: "#F4F1F5",
  },

  optionalBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    fontSize: 6.2,
    lineHeight: 8,
  },

  /*
   * =========================================================
   * INPUT CONTAINER
   * =========================================================
   */

  inputContainer: {
    position: "relative",

    marginTop: 11,

    height: 136,
    minHeight: 136,

    width: "100%",

    borderRadius: 17,

    borderWidth: 1,
    borderColor: COLORS.border,

    backgroundColor: "#FAF8FB",

    overflow: "hidden",
  },

  inputContainerSmall: {
    marginTop: 8,

    height: 116,
    minHeight: 116,

    borderRadius: 14,
  },

  inputContainerFocused: {
    borderColor: COLORS.primary,

    borderWidth: 1.5,

    backgroundColor: COLORS.white,

    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 1,
  },

  inputContainerDisabled: {
    opacity: 0.72,
  },

  /*
   * =========================================================
   * TEXT INPUT
   * =========================================================
   *
   * IMPORTANT:
   * No `outline`
   * No `outlineStyle`
   * No `outlineWidth`
   * No `boxSizing`
   *
   * These were causing the web console error.
   *
   * Also using flex:1 instead of height:"100%" so Android
   * handles multiline input + padding correctly.
   */

  commentInput: {
    flex: 1,

    minHeight: 0,

    width: "100%",

    paddingLeft: 14,
    paddingRight: 14,

    paddingTop: 13,
    paddingBottom: 34,

    margin: 0,

    color: COLORS.textDark,

    fontSize: 12,
    lineHeight: 19,

    fontWeight: "500",

    includeFontPadding: false,

    backgroundColor: "transparent",

    borderWidth: 0,
    borderColor: "transparent",

    textAlign: "left",
    textAlignVertical: "top",

    /*
     * Android native TextInput focus is controlled by the
     * wrapper border above, so there is no second border.
     */
  },

  commentInputSmall: {
    flex: 1,

    minHeight: 0,

    width: "100%",

    paddingLeft: 11,
    paddingRight: 11,

    paddingTop: 10,
    paddingBottom: 30,

    fontSize: 10,
    lineHeight: 16,

    includeFontPadding: false,

    textAlign: "left",
    textAlignVertical: "top",
  },

  /*
   * =========================================================
   * CHARACTER COUNT
   * =========================================================
   */

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
    flexShrink: 0,

    backgroundColor: COLORS.white,
  },

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

    gap: 6,
  },

  /*
   * =========================================================
   * MAYBE LATER
   * =========================================================
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

    paddingHorizontal: 7,

    borderRadius: 12,

    gap: 4,
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
    fontSize: 8.2,
    lineHeight: 11,
  },

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
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

    paddingHorizontal: 7,

    borderRadius: 12,

    gap: 4,
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
    fontSize: 8.2,
    lineHeight: 11,
  },
});

export default CustomerReviewModal;