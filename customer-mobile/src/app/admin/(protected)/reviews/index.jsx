import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { getAllReviewsAdmin } from "../../../../services/adminReviewService";

/*
  ADMIN REVIEWS MANAGEMENT
  ------------------------------------------------------------
  React Native / Expo + React Native Web
  - No Tailwind
  - No HTML <div>/<select>/<input>
  - Responsive for small mobile, medium mobile, large mobile,
    tablet and laptop/desktop
  - Custom full-width dropdowns so the complete row is tappable
  - Keeps the existing getAllReviewsAdmin() API contract
*/

// ============================================================
// HELPERS
// ============================================================

const COLORS = {
  page: "#F6F7FB",
  card: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  soft: "#94A3B8",
  border: "#E7EAF0",
  borderStrong: "#DCE1EA",
  slateSoft: "#F1F5F9",
  dark: "#0B1020",
  dark2: "#151C30",
  indigo: "#4F46E5",
  violet: "#7C3AED",
  blue: "#2563EB",
  cyan: "#0891B2",
  amber: "#F59E0B",
  orange: "#F97316",
  emerald: "#10B981",
  red: "#EF4444",
  white: "#FFFFFF",
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFullDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRatingLabel = (rating) => {
  switch (Number(rating)) {
    case 5:
      return "Excellent";
    case 4:
      return "Very Good";
    case 3:
      return "Good";
    case 2:
      return "Fair";
    case 1:
      return "Poor";
    default:
      return "No Rating";
  }
};

const getRatingPalette = (rating) => {
  switch (Number(rating)) {
    case 5:
      return {
        bg: "#ECFDF5",
        border: "#A7F3D0",
        text: "#047857",
        icon: "#10B981",
      };
    case 4:
      return {
        bg: "#EFF6FF",
        border: "#BFDBFE",
        text: "#1D4ED8",
        icon: "#3B82F6",
      };
    case 3:
      return {
        bg: "#FFFBEB",
        border: "#FDE68A",
        text: "#B45309",
        icon: "#F59E0B",
      };
    case 2:
      return {
        bg: "#FFF7ED",
        border: "#FED7AA",
        text: "#C2410C",
        icon: "#F97316",
      };
    case 1:
      return {
        bg: "#FEF2F2",
        border: "#FECACA",
        text: "#B91C1C",
        icon: "#EF4444",
      };
    default:
      return {
        bg: "#F1F5F9",
        border: "#E2E8F0",
        text: "#475569",
        icon: "#64748B",
      };
  }
};

const clampRating = (rating) => {
  const n = Number(rating) || 0;
  return Math.max(0, Math.min(5, n));
};

// ============================================================
// ICON
// ============================================================

const AppIcon = ({
  name,
  size = 18,
  color = COLORS.ink,
  library = "Feather",
}) => {
  const props = { name, size, color };

  if (library === "Ionicons") {
    return <Ionicons {...props} />;
  }

  if (library === "MaterialCommunityIcons") {
    return <MaterialCommunityIcons {...props} />;
  }

  return <Feather {...props} />;
};

// ============================================================
// STAR RATING
// ============================================================

const StarRating = ({
  rating = 0,
  size = 16,
  showValue = false,
  dark = false,
}) => {
  const numericRating = clampRating(rating);

  return (
    <View style={styles.starRow}>
      <View style={styles.starIcons}>
        {[1, 2, 3, 4, 5].map((star) => (
          <AppIcon
            key={star}
            library="Ionicons"
            name={star <= numericRating ? "star" : "star-outline"}
            size={size}
            color={star <= numericRating ? "#FBBF24" : dark ? "#475569" : "#CBD5E1"}
          />
        ))}
      </View>

      {showValue ? (
        <Text style={[styles.starValue, dark && styles.starValueDark]}>
          {numericRating.toFixed(1)}
        </Text>
      ) : null}
    </View>
  );
};

// ============================================================
// PREMIUM PAGE DECORATION
// ============================================================

const AmbientGlow = ({ style, color = "#EEF2FF", size = 180 }) => (
  <View
    pointerEvents="none"
    style={[
      styles.ambientGlow,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      },
      style,
    ]}
  />
);

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ title, value, icon, bg, iconColor, accent, compact }) => (
  <View style={[styles.statCard, compact && styles.statCardCompact]}>
    <View style={[styles.statAccent, { backgroundColor: accent }]} />

    <View style={styles.statTopRow}>
      <View style={styles.statTextWrap}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{String(value)}</Text>
        <View style={styles.statMiniLine} />
      </View>

      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <AppIcon
          library="Ionicons"
          name={icon}
          size={compact ? 17 : 19}
          color={iconColor}
        />
      </View>
    </View>
  </View>
);

// ============================================================
// RATING BAR
// ============================================================

const RatingBar = ({ rating, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.ratingBarRow}>
      <View style={styles.ratingBarLabel}>
        <Text style={styles.ratingBarNumber}>{rating}</Text>
        <AppIcon library="Ionicons" name="star" size={11} color="#FBBF24" />
      </View>

      <View style={styles.ratingTrack}>
        <View
          style={[
            styles.ratingFill,
            {
              width: `${Math.max(percentage, count > 0 ? 2 : 0)}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.ratingCount}>{count}</Text>
    </View>
  );
};

// ============================================================
// DROPDOWN
// ============================================================

const Dropdown = ({
  label,
  value,
  options,
  onChange,
  icon,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);

  return (
    <>
      <View style={[styles.fieldBlock, compact && styles.fieldBlockCompact]}>
        <Text style={styles.fieldLabel}>{label}</Text>

        {/* Entire row is tappable/clickable */}
        <Pressable
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${selected?.label || ""}`}
          style={({ pressed }) => [
            styles.dropdownButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.dropdownLeft}>
            <View style={styles.dropdownIcon}>
              <AppIcon
                library="Ionicons"
                name={icon}
                size={16}
                color={COLORS.indigo}
              />
            </View>

            <Text style={styles.dropdownText} numberOfLines={1}>
              {selected?.label || "Select"}
            </Text>
          </View>

          <AppIcon
            library="Ionicons"
            name="chevron-down"
            size={17}
            color={COLORS.soft}
          />
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.dropdownOverlay} onPress={() => setOpen(false)}>
          <Pressable
            style={styles.dropdownSheet}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.dropdownSheetHeader}>
              <View style={styles.dropdownSheetTitleWrap}>
                <View style={styles.dropdownSheetIcon}>
                  <AppIcon
                    library="Ionicons"
                    name={icon}
                    size={18}
                    color={COLORS.indigo}
                  />
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.dropdownSheetEyebrow}>{label}</Text>
                  <Text style={styles.dropdownSheetTitle}>
                    Choose an option
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => setOpen(false)}
                style={styles.closeSmallButton}
              >
                <AppIcon
                  library="Ionicons"
                  name="close"
                  size={19}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownOptions}
            >
              {options.map((item) => {
                const active = item.value === value;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownOption,
                      active && styles.dropdownOptionActive,
                      pressed && styles.dropdownOptionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        active && styles.dropdownOptionTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {active ? (
                      <View style={styles.checkCircle}>
                        <AppIcon
                          library="Ionicons"
                          name="checkmark"
                          size={15}
                          color="#FFFFFF"
                        />
                      </View>
                    ) : (
                      <View style={styles.emptyRadio} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// ============================================================
// REVIEW CARD
// ============================================================

const ReviewCard = ({ review, onView, wide }) => {
  const rating = Number(review.rating || 0);
  const palette = getRatingPalette(rating);

  return (
    <View style={[styles.reviewCard, wide && styles.reviewCardWide]}>
      <View style={[styles.reviewTopAccent, { backgroundColor: COLORS.indigo }]} />

      <AmbientGlow
        color="#EEF2FF"
        size={150}
        style={{ right: -55, top: -55 }}
      />

      <View style={styles.reviewCardInner}>
        {/* TOP INFORMATION */}
        <View style={[styles.reviewInfoGrid, wide && styles.reviewInfoGridWide]}>
          {/* Customer */}
          <View style={styles.infoBlock}>
            <Text style={styles.microLabel}>CUSTOMER</Text>

            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <AppIcon
                  library="Ionicons"
                  name="person"
                  size={18}
                  color={COLORS.indigo}
                />
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.customerName}>
                  {review.customer?.name || "Unknown Customer"}
                </Text>

                <Text style={styles.customerEmail}>
                  {review.customer?.email || "No email available"}
                </Text>

                <View style={styles.verifiedBadge}>
                  <AppIcon
                    library="Ionicons"
                    name="checkmark-circle"
                    size={11}
                    color={COLORS.muted}
                  />
                  <Text style={styles.verifiedText}>Verified Customer</Text>
                </View>
              </View>
            </View>
          </View>

          {/* SALON */}
          <View style={styles.infoBlock}>
            <Text style={styles.microLabel}>SALON</Text>

            <View style={styles.salonRow}>
              <View style={styles.salonIcon}>
                <AppIcon
                  library="Ionicons"
                  name="storefront"
                  size={18}
                  color="#D97706"
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.salonName}>
                  {review.salon?.name || "Unknown Salon"}
                </Text>

                {review.salon?.city ? (
                  <Text style={styles.cityText}>{review.salon.city}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* RATING */}
          <View style={styles.infoBlock}>
            <Text style={styles.microLabel}>RATING</Text>

            <View style={styles.ratingInfoRow}>
              <View
                style={[
                  styles.ratingBadge,
                  {
                    backgroundColor: palette.bg,
                    borderColor: palette.border,
                  },
                ]}
              >
                <AppIcon
                  library="Ionicons"
                  name="star"
                  size={12}
                  color={palette.icon}
                />
                <Text style={[styles.ratingBadgeText, { color: palette.text }]}>
                  {rating.toFixed(1)}
                </Text>
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
                <StarRating rating={rating} size={11} />
              </View>
            </View>
          </View>

          {/* SUBMITTED */}
          <View style={styles.infoBlock}>
            <Text style={styles.microLabel}>SUBMITTED</Text>

            <View style={styles.submittedRow}>
              <View style={styles.calendarIcon}>
                <AppIcon
                  library="Ionicons"
                  name="calendar-outline"
                  size={16}
                  color={COLORS.muted}
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.submittedDate}>
                  {formatDate(review.createdAt)}
                </Text>
                <Text style={styles.submittedTime}>
                  {formatDateTime(review.createdAt)}
                </Text>
              </View>
            </View>
          </View>

          {/* ACTION */}
          <View style={[styles.actionBlock, wide && styles.actionBlockWide]}>
            <Pressable
              onPress={() => onView(review)}
              accessibilityRole="button"
              accessibilityLabel="View review details"
              style={({ pressed }) => [
                styles.viewButton,
                pressed && styles.viewButtonPressed,
              ]}
            >
              <AppIcon
                library="Ionicons"
                name="eye-outline"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.viewButtonText}>View Details</Text>
              <AppIcon
                library="Ionicons"
                name="arrow-forward"
                size={14}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        {/* REVIEW CONTENT */}
        <View style={[styles.reviewContentGrid, wide && styles.reviewContentGridWide]}>
          <View style={styles.feedbackLabelBlock}>
            <View style={styles.feedbackIcon}>
              <AppIcon
                library="Ionicons"
                name="chatbubble-ellipses-outline"
                size={17}
                color={COLORS.violet}
              />
            </View>

            <View style={styles.flexOne}>
              <Text style={styles.feedbackLabel}>CUSTOMER FEEDBACK</Text>
              <Text style={styles.feedbackSubLabel}>Written review</Text>
            </View>
          </View>

          <View style={styles.commentBox}>
            <View style={styles.commentAccent} />
            <Text style={styles.commentText}>
              {review.comment || "No written feedback provided."}
            </Text>
          </View>

          <View style={styles.experienceBox}>
            <View style={styles.experienceHeader}>
              <View style={styles.experienceIcon}>
                <AppIcon
                  library="Ionicons"
                  name="thumbs-up"
                  size={13}
                  color="#D97706"
                />
              </View>

              <Text style={styles.experienceTitle}>EXPERIENCE</Text>
            </View>

            <Text style={styles.experienceText}>
              {rating >= 4
                ? "Positive customer experience"
                : rating >= 3
                ? "Average customer experience"
                : "Needs attention"}
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.cardFooter}>
          <View style={styles.footerBadges}>
            <View style={styles.footerBadge}>
              <AppIcon
                library="Ionicons"
                name="star-outline"
                size={11}
                color="#F59E0B"
              />
              <Text style={styles.footerBadgeText}>{rating}/5 Rating</Text>
            </View>

            <View style={styles.footerBadgeGreen}>
              <AppIcon
                library="Ionicons"
                name="thumbs-up-outline"
                size={11}
                color={COLORS.emerald}
              />
              <Text style={styles.footerBadgeGreenText}>Customer Feedback</Text>
            </View>
          </View>

          <Pressable
            onPress={() => onView(review)}
            style={styles.openReviewButton}
          >
            <Text style={styles.openReviewText}>Open full review</Text>
            <AppIcon
              library="Ionicons"
              name="arrow-forward"
              size={13}
              color={COLORS.indigo}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

// ============================================================
// DETAIL COMPONENTS
// ============================================================

const DetailSection = ({ title, icon, children }) => (
  <View style={styles.detailSection}>
    <View style={styles.detailSectionHeader}>
      <View style={styles.detailSectionIcon}>
        <AppIcon
          library="Ionicons"
          name={icon}
          size={15}
          color={COLORS.muted}
        />
      </View>
      <Text style={styles.detailSectionTitle}>{title}</Text>
    </View>

    {children}
  </View>
);

const DetailGrid = ({ children }) => (
  <View style={styles.detailGrid}>{children}</View>
);

const DetailValue = ({ icon, label, value }) => (
  <View style={styles.detailValue}>
    <View style={styles.detailValueHeader}>
      <AppIcon
        library="Ionicons"
        name={icon}
        size={14}
        color={COLORS.soft}
      />
      <Text style={styles.detailValueLabel}>{label}</Text>
    </View>

    <Text style={styles.detailValueText}>{String(value ?? "-")}</Text>
  </View>
);

// ============================================================
// REVIEW DETAILS MODAL
// ============================================================

const ReviewDetailsModal = ({ review, onClose }) => {
  const rating = Number(review.rating || 0);
  const palette = getRatingPalette(rating);
  const { width, height } = useWindowDimensions();

  const modalWidth = Math.min(
    width - (width < 500 ? 20 : 40),
    860
  );

  const modalHeight = Math.min(height * 0.9, 850);

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.modalCard,
            {
              width: modalWidth,
              maxHeight: modalHeight,
            },
          ]}
        >
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <AmbientGlow
              color="#FFF7ED"
              size={110}
              style={{ right: -35, top: -45 }}
            />

            <View style={styles.modalHeaderLeft}>
              <View style={styles.modalHeaderIcon}>
                <AppIcon
                  library="Ionicons"
                  name="chatbubble-ellipses"
                  size={19}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.modalEyebrow}>CUSTOMER FEEDBACK</Text>
                <Text style={styles.modalTitle}>Review Details</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close review details"
              style={styles.modalCloseButton}
            >
              <AppIcon
                library="Ionicons"
                name="close"
                size={20}
                color={COLORS.muted}
              />
            </Pressable>
          </View>

          {/* BODY */}
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* RATING HERO */}
            <View style={styles.ratingHero}>
              <AmbientGlow
                color="rgba(245,158,11,0.10)"
                size={170}
                style={{ right: -65, top: -75 }}
              />

              <View style={styles.ratingHeroContent}>
                <View style={styles.flexOne}>
                  <Text style={styles.ratingHeroEyebrow}>CUSTOMER RATING</Text>

                  <View style={styles.ratingHeroMain}>
                    <Text style={styles.ratingHeroNumber}>{rating}</Text>

                    <View style={styles.flexOne}>
                      <StarRating rating={rating} size={17} dark />
                      <Text style={styles.ratingHeroLabel}>
                        {getRatingLabel(rating)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.ratingHeroBadge,
                    {
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.ratingHeroBadgeText,
                      { color: palette.text },
                    ]}
                  >
                    {rating}/5 Stars
                  </Text>
                </View>
              </View>
            </View>

            {/* CUSTOMER */}
            <DetailSection title="Customer" icon="person-outline">
              <DetailGrid>
                <DetailValue
                  icon="person-outline"
                  label="Name"
                  value={review.customer?.name || "-"}
                />
                <DetailValue
                  icon="mail-outline"
                  label="Email"
                  value={review.customer?.email || "-"}
                />
              </DetailGrid>
            </DetailSection>

            {/* SALON */}
            <DetailSection title="Salon" icon="storefront-outline">
              <DetailGrid>
                <DetailValue
                  icon="storefront-outline"
                  label="Salon Name"
                  value={review.salon?.name || "-"}
                />
                <DetailValue
                  icon="calendar-outline"
                  label="Review Date"
                  value={formatFullDate(review.createdAt)}
                />
              </DetailGrid>
            </DetailSection>

            {/* COMMENT */}
            <DetailSection
              title="Customer Comment"
              icon="chatbubble-ellipses-outline"
            >
              <View style={styles.modalCommentBox}>
                <View style={styles.modalCommentGlow} />
                <Text style={styles.modalCommentText}>
                  {review.comment ||
                    "No comment was provided by the customer."}
                </Text>
              </View>
            </DetailSection>

            {/* APPOINTMENT */}
            {review.appointment ? (
              <DetailSection title="Appointment" icon="calendar-outline">
                <DetailGrid>
                  <DetailValue
                    icon="calendar-outline"
                    label="Appointment Date"
                    value={
                      review.appointment?.appointmentDate
                        ? formatFullDate(review.appointment.appointmentDate)
                        : "-"
                    }
                  />
                  <DetailValue
                    icon="finger-print-outline"
                    label="Appointment ID"
                    value={review.appointment?._id || "-"}
                  />
                </DetailGrid>
              </DetailSection>
            ) : null}

            {/* SUBMITTED */}
            <View style={styles.submittedBox}>
              <View style={styles.submittedBoxHeader}>
                <AppIcon
                  library="Ionicons"
                  name="time-outline"
                  size={15}
                  color={COLORS.soft}
                />
                <Text style={styles.submittedBoxLabel}>SUBMITTED ON</Text>
              </View>

              <Text style={styles.submittedBoxValue}>
                {formatDateTime(review.createdAt)}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalFooterButton,
                pressed && styles.modalFooterButtonPressed,
              ]}
            >
              <Text style={styles.modalFooterButtonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ filtered }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <AppIcon
        library="Ionicons"
        name="chatbubble-ellipses-outline"
        size={29}
        color={COLORS.soft}
      />
    </View>

    <Text style={styles.emptyTitle}>
      {filtered ? "No reviews found" : "No reviews available"}
    </Text>

    <Text style={styles.emptyText}>
      {filtered
        ? "Try changing your search or rating filter to find the reviews you are looking for."
        : "Customer feedback will appear here when reviews are available."}
    </Text>
  </View>
);

// ============================================================
// ERROR STATE
// ============================================================

const ErrorBanner = ({ error, onRetry }) => (
  <View style={styles.errorCard}>
    <View style={styles.errorIcon}>
      <AppIcon
        library="Ionicons"
        name="warning-outline"
        size={18}
        color={COLORS.red}
      />
    </View>

    <View style={styles.flexOne}>
      <Text style={styles.errorTitle}>Unable to load reviews</Text>
      <Text style={styles.errorText}>{error}</Text>
    </View>

    <Pressable onPress={onRetry} style={styles.errorRetry}>
      <Text style={styles.errorRetryText}>Try Again</Text>
    </Pressable>
  </View>
);

// ============================================================
// LOADING
// ============================================================

const LoadingState = () => (
  <View style={styles.loadingPage}>
    <View style={styles.loadingCard}>
      <AmbientGlow
        color="#EEF2FF"
        size={170}
        style={{ right: -60, top: -70 }}
      />
      <AmbientGlow
        color="#FFF7ED"
        size={150}
        style={{ left: -65, bottom: -70 }}
      />

      <View style={styles.loadingIcon}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>

      <Text style={styles.loadingTitle}>Loading reviews</Text>
      <Text style={styles.loadingText}>
        Preparing your customer feedback dashboard...
      </Text>

      <View style={styles.loadingTrack}>
        <View style={styles.loadingFill} />
      </View>
    </View>
  </View>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

const ReviewsManagement = () => {
  const { width } = useWindowDimensions();

  const isTiny = width < 360;
  const isSmall = width >= 360 && width < 480;
  const isMedium = width >= 480 && width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isWide = width >= 1100;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("LATEST");

  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [error, setError] = useState("");

  const loadReviews = useCallback(async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllReviewsAdmin();
      setReviews(data?.reviews || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);

      setError(
        err?.response?.data?.message || "Failed to load reviews"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const average =
      total > 0
        ? reviews.reduce(
            (sum, review) => sum + Number(review.rating || 0),
            0
          ) / total
        : 0;

    const fiveStar = reviews.filter(
      (review) => Number(review.rating) === 5
    ).length;

    const fourStar = reviews.filter(
      (review) => Number(review.rating) === 4
    ).length;

    const threeStar = reviews.filter(
      (review) => Number(review.rating) === 3
    ).length;

    const twoStar = reviews.filter(
      (review) => Number(review.rating) === 2
    ).length;

    const oneStar = reviews.filter(
      (review) => Number(review.rating) === 1
    ).length;

    return {
      total,
      average,
      fiveStar,
      fourStar,
      threeStar,
      twoStar,
      oneStar,
    };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = reviews.filter((review) => {
      const customerName =
        review.customer?.name?.toLowerCase() || "";

      const customerEmail =
        review.customer?.email?.toLowerCase() || "";

      const salonName =
        review.salon?.name?.toLowerCase() || "";

      const comment =
        review.comment?.toLowerCase() || "";

      const rating = String(review.rating || "");

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        salonName.includes(searchValue) ||
        comment.includes(searchValue) ||
        rating.includes(searchValue);

      const matchesRating =
        ratingFilter === "ALL" ||
        Number(review.rating) === Number(ratingFilter);

      return matchesSearch && matchesRating;
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      if (sortOrder === "LATEST") return dateB - dateA;
      if (sortOrder === "OLDEST") return dateA - dateB;

      if (sortOrder === "HIGHEST") {
        return Number(b.rating || 0) - Number(a.rating || 0);
      }

      if (sortOrder === "LOWEST") {
        return Number(a.rating || 0) - Number(b.rating || 0);
      }

      return 0;
    });
  }, [reviews, search, ratingFilter, sortOrder]);

  const clearFilters = () => {
    setSearch("");
    setRatingFilter("ALL");
    setSortOrder("LATEST");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    ratingFilter !== "ALL" ||
    sortOrder !== "LATEST";

  const handleViewDetails = (review) => {
    setSelectedReview(review);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedReview(null);
  };

  if (loading) {
    return <LoadingState />;
  }

  const statsData = [
    {
      title: "Total Reviews",
      value: stats.total,
      icon: "chatbubble-ellipses",
      bg: "#F1F5F9",
      iconColor: COLORS.ink,
      accent: COLORS.ink,
    },
    {
      title: "Average Rating",
      value: stats.total > 0 ? stats.average.toFixed(1) : "0.0",
      icon: "star",
      bg: "#FFF7ED",
      iconColor: "#F59E0B",
      accent: "#F59E0B",
    },
    {
      title: "5 Star Reviews",
      value: stats.fiveStar,
      icon: "thumbs-up",
      bg: "#ECFDF5",
      iconColor: COLORS.emerald,
      accent: COLORS.emerald,
    },
    {
      title: "4 Star Reviews",
      value: stats.fourStar,
      icon: "star",
      bg: "#EFF6FF",
      iconColor: COLORS.blue,
      accent: COLORS.blue,
    },
    {
      title: "1–3 Star Reviews",
      value: stats.oneStar + stats.twoStar + stats.threeStar,
      icon: "stats-chart",
      bg: "#FEF2F2",
      iconColor: COLORS.red,
      accent: COLORS.red,
    },
  ];

  const ratingOptions = [
    { value: "ALL", label: "All Ratings" },
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars" },
    { value: "3", label: "3 Stars" },
    { value: "2", label: "2 Stars" },
    { value: "1", label: "1 Star" },
  ];

  const sortOptions = [
    { value: "LATEST", label: "Latest Reviews" },
    { value: "OLDEST", label: "Oldest Reviews" },
    { value: "HIGHEST", label: "Highest Rating" },
    { value: "LOWEST", label: "Lowest Rating" },
  ];

  return (
    <View style={styles.page}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={[
          styles.pageContent,
          isTiny && styles.pageContentTiny,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadReviews(true)}
            tintColor={COLORS.indigo}
            colors={[COLORS.indigo]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* ================================================== */}
          {/* PREMIUM HEADER */}
          {/* ================================================== */}

          <View style={styles.hero}>
            <AmbientGlow
              color="#EEF2FF"
              size={250}
              style={{ right: -90, top: -115 }}
            />
            <AmbientGlow
              color="#FFF7ED"
              size={220}
              style={{ left: width * 0.32, bottom: -160 }}
            />
            <AmbientGlow
              color="#EFF6FF"
              size={150}
              style={{ right: width * 0.18, top: "50%" }}
            />

            <View style={styles.heroInner}>
              <View style={styles.heroMain}>
                <View style={styles.heroIcon}>
                  <AppIcon
                    library="Ionicons"
                    name="chatbubble-ellipses"
                    size={23}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroTextWrap}>
                  <View style={styles.breadcrumb}>
                    <Text style={styles.breadcrumbText}>ADMIN</Text>
                    <AppIcon
                      library="Ionicons"
                      name="chevron-forward"
                      size={9}
                      color="#CBD5E1"
                    />
                    <Text style={styles.breadcrumbCurrent}>REVIEWS</Text>
                  </View>

                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.heroTitle,
                        isTiny && styles.heroTitleTiny,
                      ]}
                    >
                      Reviews Management
                    </Text>

                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveText}>LIVE</Text>
                    </View>
                  </View>

                  <Text style={styles.heroSubtitle}>
                    Monitor customer feedback, ratings and salon reputation
                    from one centralized dashboard.
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => loadReviews(true)}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.refreshButtonPressed,
                  refreshing && styles.refreshButtonDisabled,
                ]}
              >
                <AppIcon
                  library="Ionicons"
                  name="refresh"
                  size={17}
                  color="#FFFFFF"
                />
                <Text style={styles.refreshText}>
                  {refreshing ? "Refreshing..." : "Refresh Reviews"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error ? (
            <ErrorBanner
              error={error}
              onRetry={() => loadReviews(false)}
            />
          ) : null}

          {/* ================================================== */}
          {/* STAT CARDS */}
          {/* ================================================== */}

          <View
            style={[
              styles.statsGrid,
              (isTiny || isSmall) && styles.statsGridTwo,
              isMedium && styles.statsGridThree,
              isTablet && styles.statsGridFive,
              isWide && styles.statsGridFive,
            ]}
          >
            {statsData.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.statGridItem,
                  isTiny && styles.statGridItemTiny,
                  isSmall && styles.statGridItemSmall,
                  isMedium && styles.statGridItemMedium,
                  isTablet && styles.statGridItemTablet,
                  isWide && styles.statGridItemWide,
                ]}
              >
                <StatCard {...item} compact={isTiny || isSmall} />
              </View>
            ))}
          </View>

          {/* ================================================== */}
          {/* RATING INSIGHTS */}
          {/* ================================================== */}

          <View
            style={[
              styles.insightsGrid,
              (isTiny || isSmall || isMedium || isTablet) &&
                styles.insightsGridStack,
            ]}
          >
            {/* Overall Rating */}
            <View style={styles.insightCard}>
              <AmbientGlow
                color="#FFF7ED"
                size={150}
                style={{ right: -55, top: -55 }}
              />

              <View style={styles.insightCardInner}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightHeaderLeft}>
                    <View style={styles.insightIconAmber}>
                      <AppIcon
                        library="Ionicons"
                        name="star"
                        size={18}
                        color="#F59E0B"
                      />
                    </View>

                    <View style={styles.flexOne}>
                      <Text style={styles.insightEyebrow}>
                        OVERALL RATING
                      </Text>
                      <Text style={styles.insightSubtitle}>
                        Customer satisfaction
                      </Text>
                    </View>
                  </View>

                  <View style={styles.livePill}>
                    <Text style={styles.livePillText}>LIVE</Text>
                  </View>
                </View>

                <View style={styles.overallNumberRow}>
                  <Text style={styles.overallNumber}>
                    {stats.total > 0 ? stats.average.toFixed(1) : "0.0"}
                  </Text>
                  <Text style={styles.overallOutOf}>/ 5.0</Text>
                </View>

                <View style={styles.overallRatingRow}>
                  <StarRating
                    rating={Math.round(stats.average)}
                    size={17}
                  />

                  <View
                    style={[
                      styles.ratingLabelPill,
                      {
                        backgroundColor: getRatingPalette(
                          Math.round(stats.average)
                        ).bg,
                        borderColor: getRatingPalette(
                          Math.round(stats.average)
                        ).border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratingLabelPillText,
                        {
                          color: getRatingPalette(
                            Math.round(stats.average)
                          ).text,
                        },
                      ]}
                    >
                      {stats.total > 0
                        ? getRatingLabel(Math.round(stats.average))
                        : "No Rating"}
                    </Text>
                  </View>
                </View>

                <View style={styles.insightBottomNote}>
                  <Text style={styles.insightBottomText}>
                    Based on{" "}
                    <Text style={styles.insightBottomStrong}>
                      {stats.total}
                    </Text>{" "}
                    customer reviews
                  </Text>
                </View>
              </View>
            </View>

            {/* Rating Distribution */}
            <View style={styles.insightCard}>
              <View style={styles.insightCardInner}>
                <View style={styles.insightHeader}>
                  <View style={styles.insightHeaderLeft}>
                    <View style={styles.insightIconSlate}>
                      <AppIcon
                        library="Ionicons"
                        name="stats-chart-outline"
                        size={17}
                        color={COLORS.muted}
                      />
                    </View>

                    <View style={styles.flexOne}>
                      <Text style={styles.distributionTitle}>
                        Rating Distribution
                      </Text>
                      <Text style={styles.insightSubtitle}>
                        Breakdown of customer ratings
                      </Text>
                    </View>
                  </View>

                  <View style={styles.totalPill}>
                    <Text style={styles.totalPillLabel}>TOTAL</Text>
                    <Text style={styles.totalPillValue}>{stats.total}</Text>
                  </View>
                </View>

                <View style={styles.ratingBars}>
                  <RatingBar
                    rating={5}
                    count={stats.fiveStar}
                    total={stats.total}
                  />
                  <RatingBar
                    rating={4}
                    count={stats.fourStar}
                    total={stats.total}
                  />
                  <RatingBar
                    rating={3}
                    count={stats.threeStar}
                    total={stats.total}
                  />
                  <RatingBar
                    rating={2}
                    count={stats.twoStar}
                    total={stats.total}
                  />
                  <RatingBar
                    rating={1}
                    count={stats.oneStar}
                    total={stats.total}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ================================================== */}
          {/* FILTER PANEL */}
          {/* ================================================== */}

          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <View style={styles.flexOne}>
                <Text style={styles.filterTitle}>Review Explorer</Text>
                <Text style={styles.filterSubtitle}>
                  Search, filter and organize customer feedback
                </Text>
              </View>

              {hasActiveFilters ? (
                <Pressable
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <AppIcon
                    library="Ionicons"
                    name="close-circle-outline"
                    size={14}
                    color={COLORS.muted}
                  />
                  <Text style={styles.clearButtonText}>Clear filters</Text>
                </Pressable>
              ) : null}
            </View>

            <View
              style={[
                styles.filterBody,
                (isTiny || isSmall) && styles.filterBodyTiny,
              ]}
            >
              {/* SEARCH */}
              <View
                style={[
                  styles.searchBlock,
                  isMedium || isTablet || isWide
                    ? styles.searchBlockWide
                    : null,
                ]}
              >
                <Text style={styles.fieldLabel}>SEARCH REVIEWS</Text>

                <View style={styles.searchInputWrap}>
                  <AppIcon
                    library="Ionicons"
                    name="search"
                    size={17}
                    color={COLORS.soft}
                  />

                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search customer, email, salon or review..."
                    placeholderTextColor="#94A3B8"
                    style={styles.searchInput}
                    returnKeyType="search"
                    autoCorrect={false}
                    autoCapitalize="none"
                    selectionColor={COLORS.indigo}
                  />

                  {search.length > 0 ? (
                    <Pressable
                      onPress={() => setSearch("")}
                      style={styles.searchClear}
                    >
                      <AppIcon
                        library="Ionicons"
                        name="close"
                        size={14}
                        color={COLORS.soft}
                      />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {/* DROPDOWNS */}
              <View
                style={[
                  styles.dropdownGrid,
                  isMedium || isTablet || isWide
                    ? styles.dropdownGridTwo
                    : null,
                ]}
              >
                <Dropdown
                  label="RATING"
                  value={ratingFilter}
                  options={ratingOptions}
                  onChange={setRatingFilter}
                  icon="star-outline"
                  compact={isTiny}
                />

                <Dropdown
                  label="SORT BY"
                  value={sortOrder}
                  options={sortOptions}
                  onChange={setSortOrder}
                  icon="swap-vertical-outline"
                  compact={isTiny}
                />
              </View>
            </View>

            <View style={styles.resultSummary}>
              <View style={styles.resultSummaryLeft}>
                <Text style={styles.resultText}>Showing</Text>
                <View style={styles.resultNumber}>
                  <Text style={styles.resultNumberText}>
                    {filteredReviews.length}
                  </Text>
                </View>
                <Text style={styles.resultText}>of</Text>
                <Text style={styles.resultTotal}>{reviews.length}</Text>
                <Text style={styles.resultText}>reviews</Text>
              </View>

              {hasActiveFilters ? (
                <View style={styles.filtersActive}>
                  <View style={styles.filtersActiveDot} />
                  <Text style={styles.filtersActiveText}>
                    FILTERS ACTIVE
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ================================================== */}
          {/* REVIEWS */}
          {/* ================================================== */}

          <View style={styles.reviewsSectionHeader}>
            <View style={styles.reviewsTitleLeft}>
              <View style={styles.reviewsTitleIcon}>
                <AppIcon
                  library="Ionicons"
                  name="chatbubble-ellipses"
                  size={17}
                  color="#FFFFFF"
                />
              </View>

              <View style={styles.flexOne}>
                <Text style={styles.reviewsTitle}>Customer Reviews</Text>
                <Text style={styles.reviewsSubtitle}>
                  Detailed customer feedback and ratings
                </Text>
              </View>
            </View>

            <View style={styles.showingPill}>
              <View style={styles.showingPillIcon}>
                <AppIcon
                  library="Ionicons"
                  name="chatbubble-outline"
                  size={12}
                  color={COLORS.indigo}
                />
              </View>
              <View>
                <Text style={styles.showingPillLabel}>SHOWING</Text>
                <Text style={styles.showingPillValue}>
                  {filteredReviews.length} Reviews
                </Text>
              </View>
            </View>
          </View>

          {filteredReviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onView={handleViewDetails}
                  wide={isWide}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <EmptyState filtered={reviews.length > 0} />
            </View>
          )}
        </View>
      </ScrollView>

      {/* ====================================================== */}
      {/* DETAILS MODAL */}
      {/* ====================================================== */}

      {showDetailsModal && selectedReview ? (
        <ReviewDetailsModal
          review={selectedReview}
          onClose={handleCloseDetails}
        />
      ) : null}
    </View>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    minWidth: 0,
  },

  page: {
    flex: 1,
    minHeight: 0,
    backgroundColor: COLORS.page,
  },

  pageScroll: {
    flex: 1,
  },

  pageContent: {
    paddingVertical: 22,
    paddingHorizontal: 18,
  },

  pageContentTiny: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  container: {
    width: "100%",
    maxWidth: 1800,
    alignSelf: "center",
  },

  // ----------------------------------------------------------
  // AMBIENT
  // ----------------------------------------------------------

  ambientGlow: {
    position: "absolute",
    opacity: 0.78,
  },

  // ----------------------------------------------------------
  // HERO
  // ----------------------------------------------------------

  hero: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 28,
    marginBottom: 18,
    ...Platform.select({
      web: {
        boxShadow: "0px 20px 60px rgba(15,23,42,0.08)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.07,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 12 },
        elevation: 4,
      },
    }),
  },

  heroInner: {
    position: "relative",
    zIndex: 2,
    paddingHorizontal: 22,
    paddingVertical: 23,
    gap: 18,
  },

  heroMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
    flex: 1,
    minWidth: 0,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
    flexShrink: 0,
  },

  heroTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 8,
  },

  breadcrumbText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    color: "#94A3B8",
  },

  breadcrumbCurrent: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.7,
    color: COLORS.ink,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  heroTitle: {
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.15,
    color: "#020617",
    flexShrink: 1,
  },

  heroTitleTiny: {
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    marginTop: 7,
    maxWidth: 780,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
    color: COLORS.muted,
    flexShrink: 1,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },

  liveText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: "#047857",
  },

  refreshButton: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: COLORS.dark,
    alignSelf: "stretch",
    ...Platform.select({
      web: {
        cursor: "pointer",
        boxShadow: "0px 12px 28px rgba(15,23,42,0.16)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 7 },
        elevation: 4,
      },
    }),
  },

  refreshButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  refreshButtonDisabled: {
    opacity: 0.6,
  },

  refreshText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  // ----------------------------------------------------------
  // ERROR
  // ----------------------------------------------------------

  errorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    marginBottom: 18,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
  },

  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    flexShrink: 0,
  },

  errorTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: "#7F1D1D",
  },

  errorText: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 17,
    color: "#DC2626",
  },

  errorRetry: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    flexShrink: 0,
  },

  errorRetryText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#B91C1C",
  },

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statsGridTwo: {
    // item width is controlled below
  },

  statsGridThree: {},

  statsGridFive: {},

  statGridItem: {
    minWidth: 0,
  },

  statGridItemTiny: {
    width: "100%",
  },

  statGridItemSmall: {
    width: "48%",
  },

  statGridItemMedium: {
    width: "31.5%",
  },

  statGridItemTablet: {
    width: "18.5%",
  },

  statGridItemWide: {
    flex: 1,
  },

  statCard: {
    position: "relative",
    minHeight: 132,
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 17,
    ...Platform.select({
      web: {
        boxShadow: "0px 15px 40px rgba(15,23,42,0.06)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 7 },
        elevation: 2,
      },
    }),
  },

  statCardCompact: {
    minHeight: 122,
    padding: 14,
  },

  statAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  statTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minWidth: 0,
  },

  statTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  statTitle: {
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.soft,
    flexShrink: 1,
  },

  statValue: {
    marginTop: 6,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: "#020617",
  },

  statMiniLine: {
    marginTop: 10,
    width: 34,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
  },

  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ----------------------------------------------------------
  // INSIGHTS
  // ----------------------------------------------------------

  insightsGrid: {
    width: "100%",
    flexDirection: "row",
    gap: 15,
    marginBottom: 18,
  },

  insightsGridStack: {
    flexDirection: "column",
  },

  insightCard: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        boxShadow: "0px 18px 50px rgba(15,23,42,0.06)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 9 },
        elevation: 2,
      },
    }),
  },

  insightCardInner: {
    padding: 20,
    minWidth: 0,
  },

  insightHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    minWidth: 0,
  },

  insightHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
    minWidth: 0,
  },

  insightIconAmber: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    flexShrink: 0,
  },

  insightIconSlate: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    flexShrink: 0,
  },

  insightEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: COLORS.soft,
  },

  insightSubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    color: "#475569",
  },

  distributionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#020617",
  },

  livePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexShrink: 0,
  },

  livePillText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.soft,
  },

  overallNumberRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },

  overallNumber: {
    fontSize: 55,
    lineHeight: 58,
    fontWeight: "900",
    letterSpacing: -2.4,
    color: "#020617",
  },

  overallOutOf: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.soft,
  },

  overallRatingRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
  },

  ratingLabelPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  ratingLabelPillText: {
    fontSize: 9,
    fontWeight: "900",
  },

  insightBottomNote: {
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  insightBottomText: {
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.muted,
  },

  insightBottomStrong: {
    fontWeight: "900",
    color: COLORS.ink,
  },

  totalPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    flexShrink: 0,
  },

  totalPillLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: COLORS.soft,
  },

  totalPillValue: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.ink,
  },

  ratingBars: {
    marginTop: 22,
    gap: 13,
  },

  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minWidth: 0,
  },

  ratingBarLabel: {
    width: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },

  ratingBarNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
  },

  ratingTrack: {
    flex: 1,
    minWidth: 0,
    height: 9,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "#F1F5F9",
  },

  ratingFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: "#F59E0B",
  },

  ratingCount: {
    width: 34,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.muted,
    flexShrink: 0,
  },

  // ----------------------------------------------------------
  // FILTER
  // ----------------------------------------------------------

  filterCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: "0px 18px 50px rgba(15,23,42,0.06)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.05,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 9 },
        elevation: 2,
      },
    }),
  },

  filterHeader: {
    minWidth: 0,
    paddingHorizontal: 18,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  filterTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#020617",
  },

  filterSubtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 16,
    color: COLORS.soft,
  },

  clearButton: {
    minHeight: 35,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  clearButtonText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.muted,
  },

  filterBody: {
    padding: 18,
    gap: 14,
  },

  filterBodyTiny: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  searchBlock: {
    width: "100%",
    minWidth: 0,
  },

  searchBlockWide: {
    flex: 1,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.15,
    color: COLORS.soft,
  },

  searchInputWrap: {
    width: "100%",
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#F8FAFC",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.ink,
  },

  searchClear: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    flexShrink: 0,
  },

  dropdownGrid: {
    width: "100%",
    gap: 12,
  },

  dropdownGridTwo: {
    flexDirection: "row",
  },

  fieldBlock: {
    width: "100%",
    minWidth: 0,
  },

  fieldBlockCompact: {
    flex: 1,
  },

  dropdownButton: {
    width: "100%",
    minHeight: 50,
    paddingHorizontal: 10,
    paddingRight: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  pressed: {
    opacity: 0.8,
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
    minWidth: 0,
  },

  dropdownIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    flexShrink: 0,
  },

  dropdownText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  dropdownOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(2,6,23,0.62)",
  },

  dropdownSheet: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "80%",
    overflow: "hidden",
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
    ...Platform.select({
      web: {
        boxShadow: "0px 30px 90px rgba(0,0,0,0.28)",
      },
      default: {
        shadowColor: "#000000",
        shadowOpacity: 0.28,
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 15 },
        elevation: 12,
      },
    }),
  },

  dropdownSheetHeader: {
    paddingHorizontal: 17,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  dropdownSheetTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },

  dropdownSheetIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    flexShrink: 0,
  },

  dropdownSheetEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: COLORS.soft,
  },

  dropdownSheetTitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.ink,
  },

  closeSmallButton: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
  },

  dropdownOptions: {
    padding: 10,
    gap: 6,
  },

  dropdownOption: {
    minHeight: 52,
    width: "100%",
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },

  dropdownOptionActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#C7D2FE",
  },

  dropdownOptionPressed: {
    backgroundColor: "#F8FAFC",
  },

  dropdownOptionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
  },

  dropdownOptionTextActive: {
    color: COLORS.indigo,
    fontWeight: "900",
  },

  checkCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.indigo,
    flexShrink: 0,
  },

  emptyRadio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    flexShrink: 0,
  },

  resultSummary: {
    minWidth: 0,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  resultSummaryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    minWidth: 0,
  },

  resultText: {
    fontSize: 10,
    color: COLORS.muted,
  },

  resultNumber: {
    minWidth: 27,
    height: 25,
    paddingHorizontal: 7,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  resultNumberText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.ink,
  },

  resultTotal: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.ink,
  },

  filtersActive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  filtersActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },

  filtersActiveText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.soft,
  },

  // ----------------------------------------------------------
  // REVIEW SECTION
  // ----------------------------------------------------------

  reviewsSectionHeader: {
    minWidth: 0,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },

  reviewsTitleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
    minWidth: 0,
  },

  reviewsTitleIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
    flexShrink: 0,
  },

  reviewsTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.ink,
  },

  reviewsSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: COLORS.soft,
  },

  showingPill: {
    minHeight: 43,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  showingPillIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
  },

  showingPillLabel: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.soft,
  },

  showingPillValue: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.ink,
  },

  reviewsList: {
    width: "100%",
    gap: 14,
  },

  // ----------------------------------------------------------
  // REVIEW CARD
  // ----------------------------------------------------------

  reviewCard: {
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      web: {
        boxShadow: "0px 22px 65px rgba(15,23,42,0.07)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.06,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
      },
    }),
  },

  reviewCardWide: {},

  reviewTopAccent: {
    width: "100%",
    height: 3,
  },

  reviewCardInner: {
    position: "relative",
    zIndex: 2,
    padding: 18,
    minWidth: 0,
  },

  reviewInfoGrid: {
    width: "100%",
    minWidth: 0,
    gap: 15,
  },

  reviewInfoGridWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  infoBlock: {
    minWidth: 0,
    flex: 1,
  },

  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minWidth: 0,
  },

  customerAvatar: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    position: "relative",
    flexShrink: 0,
  },

  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: COLORS.emerald,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  customerName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: COLORS.ink,
    flexShrink: 1,
  },

  customerEmail: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    color: COLORS.soft,
    flexShrink: 1,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },

  verifiedText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.soft,
  },

  salonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  salonIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FED7AA",
    flexShrink: 0,
  },

  salonName: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    color: "#334155",
    flexShrink: 1,
  },

  cityText: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.soft,
    flexShrink: 1,
  },

  microLabel: {
    marginBottom: 7,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: COLORS.soft,
  },

  ratingInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minWidth: 0,
  },

  ratingBadge: {
    minHeight: 40,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "900",
  },

  ratingLabel: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    color: "#475569",
  },

  starRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },

  starIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    flexShrink: 0,
  },

  starValue: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.ink,
  },

  starValueDark: {
    color: "#FFFFFF",
  },

  submittedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minWidth: 0,
  },

  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexShrink: 0,
  },

  submittedDate: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    color: "#475569",
  },

  submittedTime: {
    marginTop: 1,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: COLORS.soft,
  },

  actionBlock: {
    width: "100%",
    minWidth: 0,
  },

  actionBlockWide: {
    width: "auto",
    flexShrink: 0,
    alignSelf: "flex-end",
  },

  viewButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 13,
    backgroundColor: COLORS.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...Platform.select({
      web: {
        cursor: "pointer",
      },
      default: {},
    }),
  },

  viewButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },

  viewButtonText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  divider: {
    width: "100%",
    height: 1,
    marginVertical: 17,
    backgroundColor: "#F1F5F9",
  },

  reviewContentGrid: {
    width: "100%",
    minWidth: 0,
    gap: 12,
  },

  reviewContentGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  feedbackLabelBlock: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 0.65,
  },

  feedbackIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    flexShrink: 0,
  },

  feedbackLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.soft,
  },

  feedbackSubLabel: {
    marginTop: 2,
    fontSize: 8,
    color: COLORS.soft,
  },

  commentBox: {
    minWidth: 0,
    minHeight: 76,
    flex: 1.6,
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
  },

  commentAccent: {
    position: "absolute",
    left: 0,
    top: 12,
    bottom: 12,
    width: 4,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: COLORS.indigo,
  },

  commentText: {
    fontSize: 11,
    lineHeight: 19,
    fontWeight: "600",
    color: "#475569",
    flexShrink: 1,
  },

  experienceBox: {
    minWidth: 0,
    flex: 0.95,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
  },

  experienceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  experienceIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FDE68A",
    flexShrink: 0,
  },

  experienceTitle: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#B45309",
  },

  experienceText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "900",
    color: "#475569",
  },

  cardFooter: {
    marginTop: 16,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    minWidth: 0,
  },

  footerBadges: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },

  footerBadge: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },

  footerBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: COLORS.muted,
  },

  footerBadgeGreen: {
    minHeight: 27,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
  },

  footerBadgeGreenText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#059669",
  },

  openReviewButton: {
    minHeight: 30,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 0,
  },

  openReviewText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.indigo,
  },

  // ----------------------------------------------------------
  // EMPTY
  // ----------------------------------------------------------

  emptyCard: {
    width: "100%",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
  },

  emptyState: {
    paddingHorizontal: 20,
    paddingVertical: 65,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.ink,
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 470,
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.muted,
    textAlign: "center",
  },

  // ----------------------------------------------------------
  // MODAL
  // ----------------------------------------------------------

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "rgba(2,6,23,0.70)",
  },

  modalCard: {
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "#FFFFFF",
    zIndex: 2,
    ...Platform.select({
      web: {
        boxShadow: "0px 35px 110px rgba(0,0,0,0.35)",
      },
      default: {
        shadowColor: "#000000",
        shadowOpacity: 0.35,
        shadowRadius: 35,
        shadowOffset: { width: 0, height: 18 },
        elevation: 15,
      },
    }),
  },

  modalHeader: {
    position: "relative",
    overflow: "hidden",
    paddingHorizontal: 17,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
    minWidth: 0,
  },

  modalHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
    flexShrink: 0,
  },

  modalEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.soft,
  },

  modalTitle: {
    marginTop: 2,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    color: "#020617",
    flexShrink: 1,
  },

  modalCloseButton: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
  },

  modalScroll: {
    flex: 1,
    minHeight: 0,
  },

  modalBody: {
    padding: 15,
    paddingBottom: 20,
  },

  ratingHero: {
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    padding: 17,
    borderRadius: 19,
    backgroundColor: COLORS.dark,
  },

  ratingHeroContent: {
    position: "relative",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minWidth: 0,
  },

  ratingHeroEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#94A3B8",
  },

  ratingHeroMain: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    minWidth: 0,
  },

  ratingHeroNumber: {
    fontSize: 46,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.5,
    color: "#FFFFFF",
  },

  ratingHeroLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "800",
    color: "#94A3B8",
  },

  ratingHeroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    flexShrink: 0,
  },

  ratingHeroBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  detailSection: {
    marginTop: 18,
    minWidth: 0,
  },

  detailSectionHeader: {
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailSectionIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
  },

  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.ink,
  },

  detailGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  detailValue: {
    minWidth: 0,
    flex: 1,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },

  detailValueHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
  },

  detailValueLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.soft,
    flexShrink: 1,
  },

  detailValueText: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    color: "#334155",
    flexShrink: 1,
  },

  modalCommentBox: {
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },

  modalCommentGlow: {
    position: "absolute",
    right: -20,
    top: -25,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E2E8F0",
    opacity: 0.7,
  },

  modalCommentText: {
    position: "relative",
    zIndex: 2,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    color: "#475569",
    flexShrink: 1,
  },

  submittedBox: {
    marginTop: 18,
    padding: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
  },

  submittedBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  submittedBoxLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: COLORS.soft,
  },

  submittedBoxValue: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "900",
    color: "#334155",
  },

  modalFooterButton: {
    minHeight: 45,
    width: "100%",
    marginTop: 18,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
  },

  modalFooterButtonPressed: {
    opacity: 0.82,
  },

  modalFooterButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  loadingPage: {
    flex: 1,
    minHeight: 500,
    backgroundColor: COLORS.page,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 430,
    minHeight: 250,
    overflow: "hidden",
    position: "relative",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    ...Platform.select({
      web: {
        boxShadow: "0px 25px 70px rgba(15,23,42,0.08)",
      },
      default: {
        shadowColor: "#0F172A",
        shadowOpacity: 0.07,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 12 },
        elevation: 4,
      },
    }),
  },

  loadingIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.dark,
  },

  loadingTitle: {
    marginTop: 17,
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.ink,
  },

  loadingText: {
    maxWidth: 320,
    marginTop: 6,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    color: COLORS.muted,
  },

  loadingTrack: {
    width: 120,
    height: 5,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 99,
    backgroundColor: "#F1F5F9",
  },

  loadingFill: {
    width: "52%",
    height: "100%",
    borderRadius: 99,
    backgroundColor: COLORS.dark,
  },
});

// ============================================================
// WEB-ONLY RESPONSIVE OVERRIDES
// ============================================================
//
// React Native Web supports percentage/calc widths, while native
// platforms ignore unsupported web-only style values safely.
// The component uses width breakpoints so no desktop-only table is
// required. Every review stays a readable card on every device.
//

export default ReviewsManagement;
