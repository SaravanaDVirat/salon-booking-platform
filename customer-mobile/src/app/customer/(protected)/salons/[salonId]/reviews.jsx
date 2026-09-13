import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import {
  getCustomerSalonReviews,
  getCustomerSalonRating,
} from "../../../../../services/customerReviewService";

import CustomerFooter from "../../../../../components/customers/CustomerFooter";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#FCF9FC",
  white: "#FFFFFF",

  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primaryDeep: "#321452",

  violet: "#8B5CF6",
  violetSoft: "#F4EEFF",
  violetLight: "#EDE5FF",

  pink: "#D946EF",

  text: "#17121C",
  textDark: "#263153",
  textMuted: "#756A7B",
  textLight: "#9B90A1",

  border: "#E7DFEA",
  borderPurple: "#D9C8FF",

  star: "#FBBF24",
  starSoft: "#FFF7DF",

  danger: "#C43D4B",
  dangerBg: "#FFF1F2",
  dangerBorder: "#FFD4D9",
};

/* =========================================================
   HELPERS
========================================================= */

const clamp = (value, min, max) =>
  Math.min(Math.max(value, min), max);

/* =========================================================
   STAR ROW
========================================================= */

const StarRow = ({
  rating = 0,
  size = 16,
  color = COLORS.violet,
  emptyColor = "#DDD4E9",
}) => {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= roundedRating ? "star" : "star-outline"}
          size={size}
          color={star <= roundedRating ? color : emptyColor}
          style={styles.starIcon}
        />
      ))}
    </View>
  );
};

/* =========================================================
   LOADING
========================================================= */

const LoadingState = () => {
  return (
    <View style={styles.loadingCard}>
      <View style={styles.loadingIconBox}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>

      <Text style={styles.loadingTitle}>
        Loading customer reviews...
      </Text>

      <Text style={styles.loadingSubtitle}>
        Please wait a moment
      </Text>
    </View>
  );
};

/* =========================================================
   ERROR
========================================================= */

const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={styles.errorCard}>
      <View style={styles.errorIconBox}>
        <Ionicons
          name="alert-circle-outline"
          size={21}
          color={COLORS.danger}
        />
      </View>

      <View style={styles.errorContent}>
        <Text style={styles.errorTitle}>
          Unable to load reviews
        </Text>

        <Text style={styles.errorMessage}>
          {message || "Something went wrong."}
        </Text>
      </View>

      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.pressed,
        ]}
      >
        <Ionicons
          name="refresh"
          size={15}
          color={COLORS.danger}
        />

        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const EmptyState = () => {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyGlowOne} />
      <View style={styles.emptyGlowTwo} />

      <View style={styles.emptyIconOuter}>
        <View style={styles.emptyIconInner}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={27}
            color={COLORS.primary}
          />
        </View>
      </View>

      <Text style={styles.emptyTitle}>
        No reviews yet
      </Text>

      <Text style={styles.emptyDescription}>
        Be the first customer to share your experience
        with this salon.
      </Text>
    </View>
  );
};

/* =========================================================
   RATING SUMMARY
========================================================= */

const RatingSummary = ({
  rating,
  isSmallMobile,
  isDesktop,
}) => {
  const average = Number(rating?.averageRating) || 0;
  const total = Number(rating?.totalReviews) || 0;

  return (
    <View
      style={[
        styles.ratingSummary,
        isSmallMobile && styles.ratingSummarySmall,
        isDesktop && styles.ratingSummaryDesktop,
      ]}
    >
      <View style={styles.ratingGlowOne} />
      <View style={styles.ratingGlowTwo} />

      <View
        style={[
          styles.ratingNumberBox,
          isSmallMobile && styles.ratingNumberBoxSmall,
        ]}
      >
        <Text
          style={[
            styles.ratingNumber,
            isSmallMobile && styles.ratingNumberSmall,
          ]}
          numberOfLines={1}
        >
          {average.toFixed(1)}
        </Text>

        <Text style={styles.ratingLabel}>RATING</Text>
      </View>

      <View style={styles.ratingDetails}>
        <StarRow
          rating={average}
          size={isSmallMobile ? 14 : 16}
        />

        <View style={styles.reviewCountRow}>
          <View style={styles.reviewDot} />

          <Text
            style={styles.reviewCountText}
            numberOfLines={1}
          >
            {total} {total === 1 ? "REVIEW" : "REVIEWS"}
          </Text>
        </View>
      </View>

      {isDesktop ? (
        <View style={styles.ratingSideDetail}>
          <Text style={styles.ratingSideSmall}>
            CUSTOMER
          </Text>

          <Text style={styles.ratingSideLarge}>
            FEEDBACK
          </Text>

          <View style={styles.ratingSideLine} />
        </View>
      ) : null}

      <View style={styles.ratingShine} />
    </View>
  );
};

/* =========================================================
   COMMENT
========================================================= */

const CommentBlock = ({ comment, isSmallMobile }) => {
  if (!comment) {
    return null;
  }

  return (
    <View
      style={[
        styles.commentOuter,
        isSmallMobile && styles.commentOuterSmall,
      ]}
    >
      <View style={styles.commentGlowOne} />
      <View style={styles.commentGlowTwo} />

      <View style={styles.commentHeading}>
        <View style={styles.commentIcon}>
          <Ionicons
            name="chatbubble-ellipses"
            size={17}
            color={COLORS.white}
          />

          <View style={styles.commentIconBorder} />
        </View>

        <View style={styles.commentHeadingText}>
          <View style={styles.commentTitleRow}>
            <Text style={styles.commentTitle}>
              COMMENT
            </Text>

            <View style={styles.commentTitleDot} />
          </View>

          <View style={styles.commentTitleLine} />
        </View>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.bigQuote}>”</Text>

        <View style={styles.quoteIcon}>
          <Text style={styles.quoteIconText}>“</Text>
        </View>

        <View style={styles.commentTextRow}>
          <View style={styles.verticalGradientFake}>
            <View style={styles.gradientLineTop} />
            <View style={styles.gradientLineMiddle} />
            <View style={styles.gradientLineBottom} />
          </View>

          <Text style={styles.commentText}>
            {comment}
          </Text>
        </View>

        <View style={styles.commentBottomDetail}>
          <View style={styles.bottomLineLarge} />
          <View style={styles.bottomDot} />
          <View style={styles.bottomLineSmall} />
        </View>
      </View>

      <View style={styles.commentFooter}>
        <View style={styles.experienceRow}>
          <View style={styles.experienceDot} />

          <Text
            style={styles.experienceText}
            numberOfLines={1}
          >
            CUSTOMER EXPERIENCE
          </Text>
        </View>

        <View style={styles.footerDecoration}>
          <View style={styles.footerLineLarge} />
          <View style={styles.footerDot} />
          <View style={styles.footerLineSmall} />
        </View>
      </View>
    </View>
  );
};

/* =========================================================
   REVIEW CARD
========================================================= */

const ReviewCard = ({
  review,
  isSmallMobile,
}) => {
  const customerName =
    review?.customer?.name || "Customer";

  const createdDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      )
    : "";

  const reviewRating =
    Number(review?.rating) || 0;

  return (
    <View
      style={[
        styles.reviewCard,
        isSmallMobile && styles.reviewCardSmall,
      ]}
    >
      <View style={styles.reviewTopAccent} />

      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View
            style={[
              styles.customerAvatar,
              isSmallMobile &&
                styles.customerAvatarSmall,
            ]}
          >
            <Ionicons
              name="person"
              size={18}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.customerText}>
            <Text
              style={[
                styles.customerName,
                isSmallMobile &&
                  styles.customerNameSmall,
              ]}
              numberOfLines={2}
            >
              {customerName}
            </Text>

            <Text
              style={styles.verifiedText}
              numberOfLines={1}
            >
              VERIFIED CUSTOMER
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.reviewStarsBox,
            isSmallMobile &&
              styles.reviewStarsBoxSmall,
          ]}
        >
          <StarRow
            rating={reviewRating}
            size={isSmallMobile ? 11 : 13}
            color={COLORS.star}
            emptyColor="#DDD7CB"
          />
        </View>
      </View>

      <CommentBlock
        comment={review?.comment}
        isSmallMobile={isSmallMobile}
      />

      <View style={styles.reviewFooter}>
        <Text
          style={styles.reviewDate}
          numberOfLines={1}
        >
          {createdDate}
        </Text>

        <Text
          style={styles.reviewFooterLabel}
          numberOfLines={1}
        >
          CUSTOMER REVIEW
        </Text>
      </View>
    </View>
  );
};

/* =========================================================
   MAIN
========================================================= */

const CustomerSalonReviews = ({
  salonId: propSalonId,
}) => {
  const params = useLocalSearchParams();

  const routeSalonId = params?.salonId;
  const salonId = propSalonId || routeSalonId;

  const { width } = useWindowDimensions();

  /*
    Breakpoints are intentionally conservative.

    < 360   = small mobile
    < 600   = mobile
    < 900   = tablet / narrow tablet
    < 1200  = desktop / laptop
    >= 1200 = large desktop

    The important part is that the header stays stacked
    until there is enough horizontal room.
  */
  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;
  const isDesktop = width >= 900;
  const isLargeDesktop = width >= 1440;

  const horizontalPadding = useMemo(() => {
    if (width >= 1600) return 52;
    if (width >= 1440) return 44;
    if (width >= 1200) return 34;
    if (width >= 900) return 28;
    if (width >= 768) return 24;
    if (width >= 600) return 20;
    if (width >= 430) return 16;
    if (width >= 360) return 13;
    return 10;
  }, [width]);

  const contentMaxWidth = isLargeDesktop
    ? 1380
    : isDesktop
    ? 1280
    : undefined;

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD REVIEWS
  ======================================================= */

  const loadReviews = useCallback(
    async (showLoader = true) => {
      if (!salonId) {
        setLoading(false);
        setError("Salon ID is missing.");
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const [reviewsData, ratingData] =
          await Promise.all([
            getCustomerSalonReviews(salonId),
            getCustomerSalonRating(salonId),
          ]);

        setReviews(
          Array.isArray(reviewsData?.reviews)
            ? reviewsData.reviews
            : []
        );

        setRating({
          averageRating:
            Number(ratingData?.averageRating) || 0,
          totalReviews:
            Number(ratingData?.totalReviews) || 0,
        });
      } catch (err) {
        console.error(
          "Salon reviews error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load reviews."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [salonId]
  );

  useEffect(() => {
    loadReviews(true);
  }, [loadReviews]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReviews(false);
  }, [loadReviews]);

  /* =======================================================
     CONTENT
  ======================================================= */

  const renderMainContent = () => {
    if (loading) {
      return (
        <View
          style={[
            styles.pageContainer,
            contentMaxWidth && {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          <LoadingState />
        </View>
      );
    }

    return (
      <View
        style={[
          styles.pageContainer,
          contentMaxWidth && {
            maxWidth: contentMaxWidth,
          },
        ]}
      >
        {/* =================================================
            MAIN HEADER
        ================================================= */}

        <View
          style={[
            styles.mainHeader,
            isSmallMobile &&
              styles.mainHeaderSmall,
          ]}
        >
          <View style={styles.headerAccent} />

          <View
            style={[
              styles.headerContent,
              isDesktop &&
                styles.headerContentDesktop,
            ]}
          >
            {/* TITLE SIDE */}

            <View
              style={[
                styles.titleSection,
                isDesktop &&
                  styles.titleSectionDesktop,
              ]}
            >
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={isSmallMobile ? 13 : 15}
                    color={COLORS.primary}
                  />
                </View>

                <Text
                  style={styles.eyebrow}
                  numberOfLines={1}
                >
                  CUSTOMER FEEDBACK
                </Text>
              </View>

              <Text
                style={[
                  styles.pageTitle,
                  isSmallMobile &&
                    styles.pageTitleSmall,
                  isTablet &&
                    styles.pageTitleTablet,
                ]}
              >
                What customers say
              </Text>

              <Text
                style={[
                  styles.pageDescription,
                  isSmallMobile &&
                    styles.pageDescriptionSmall,
                ]}
              >
                Real experiences from customers who
                visited this salon.
              </Text>
            </View>

            {/* RATING SIDE */}

            <View
              style={[
                styles.ratingSection,
                isDesktop &&
                  styles.ratingSectionDesktop,
              ]}
            >
              <RatingSummary
                rating={rating}
                isSmallMobile={isSmallMobile}
                isDesktop={isDesktop}
              />
            </View>
          </View>
        </View>

        {/* ERROR */}

        {error ? (
          <ErrorState
            message={error}
            onRetry={() => loadReviews(true)}
          />
        ) : null}

        {/* EMPTY */}

        {!error && reviews.length === 0 ? (
          <EmptyState />
        ) : null}

        {/* REVIEWS */}

        {!error && reviews.length > 0 ? (
          <View
            style={[
              styles.reviewsGrid,
              isDesktop &&
                styles.reviewsGridDesktop,
            ]}
          >
            {reviews.map((review, index) => (
              <View
                key={
                  review?._id ||
                  review?.id ||
                  `review-${index}`
                }
                style={[
                  styles.reviewGridItem,
                  isDesktop &&
                    styles.reviewGridItemDesktop,
                ]}
              >
                <ReviewCard
                  review={review}
                  isSmallMobile={isSmallMobile}
                />
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  /* =======================================================
     FINAL LAYOUT

     IMPORTANT:
     - flexGrow: 1 makes short pages fill the viewport.
     - pageArea flexGrow: 1 pushes footer to bottom.
     - footer is INSIDE the ScrollView, so long pages
       scroll naturally and there is no extra white block.
  ======================================================= */

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.pageArea}>
          {renderMainContent()}

          <View style={styles.footerWrapper}>
            <CustomerFooter />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  /* =======================================================
     ROOT / SCROLL
  ======================================================= */

  root: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    minHeight: 0,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
    width: "100%",
    minWidth: 0,
  },

  scrollContent: {
    flexGrow: 1,
    width: "100%",
    minWidth: 0,
    paddingTop: 18,
    paddingBottom: 0,
  },

  pageArea: {
    flexGrow: 1,
    width: "100%",
    minWidth: 0,
    alignItems: "center",
  },

  pageContainer: {
    width: "100%",
    minWidth: 0,
    alignSelf: "center",
    flexGrow: 0,
  },

  /* =======================================================
     LOADING
  ======================================================= */

  loadingCard: {
    width: "100%",
    minWidth: 0,
    minHeight: 300,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
    paddingVertical: 45,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 26,

    backgroundColor: COLORS.white,

    shadowColor: "#241028",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },

  loadingIconBox: {
    width: 58,
    height: 58,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 15,

    borderWidth: 1,
    borderColor: "#E4D8FF",
    borderRadius: 18,

    backgroundColor: COLORS.violetSoft,
  },

  loadingTitle: {
    maxWidth: "100%",
    textAlign: "center",

    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",

    color: COLORS.text,
  },

  loadingSubtitle: {
    marginTop: 5,

    textAlign: "center",

    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",

    color: COLORS.textLight,
  },

  /* =======================================================
     MAIN HEADER
  ======================================================= */

  mainHeader: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    marginBottom: 22,

    overflow: "hidden",

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 27,

    backgroundColor: COLORS.white,

    shadowColor: "#241028",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 28,
    elevation: 3,
  },

  mainHeaderSmall: {
    marginBottom: 18,
    borderRadius: 21,
  },

  headerAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,

    width: 4,

    backgroundColor: COLORS.primary,
  },

  headerContent: {
    width: "100%",
    minWidth: 0,

    paddingHorizontal: 17,
    paddingVertical: 18,

    /*
      DO NOT use row on mobile/tablet.
      This prevents the title from getting a tiny width
      and rendering one character per line.
    */
    flexDirection: "column",

    gap: 18,
  },

  headerContentDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 28,

    paddingHorizontal: 24,
    paddingVertical: 23,
  },

  /* =======================================================
     TITLE
  ======================================================= */

  titleSection: {
    width: "100%",
    minWidth: 0,
    flexShrink: 1,
  },

  titleSectionDesktop: {
    flex: 1,
    width: undefined,
    minWidth: 0,
    maxWidth: 760,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",

    width: "100%",
    minWidth: 0,

    gap: 8,
    marginBottom: 9,
  },

  eyebrowIcon: {
    width: 27,
    height: 27,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 9,
    backgroundColor: COLORS.violetSoft,
  },

  eyebrow: {
    flexShrink: 1,

    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.7,

    color: COLORS.primary,
  },

  pageTitle: {
    /*
      No width: "100%" here.
      This is intentional: on RN Web a percentage width
      inside a flex row can collapse unexpectedly.
    */
    flexShrink: 1,

    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.8,

    color: COLORS.text,
  },

  pageTitleSmall: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.5,
  },

  pageTitleTablet: {
    fontSize: 29,
    lineHeight: 36,
  },

  pageDescription: {
    flexShrink: 1,

    maxWidth: 650,

    marginTop: 7,

    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",

    color: COLORS.textMuted,
  },

  pageDescriptionSmall: {
    fontSize: 11,
    lineHeight: 18,
  },

  /* =======================================================
     RATING SECTION
  ======================================================= */

  ratingSection: {
    width: "100%",
    minWidth: 0,
    flexShrink: 1,
  },

  ratingSectionDesktop: {
    width: 310,
    maxWidth: 360,
    flexShrink: 0,
  },

  /* =======================================================
     RATING SUMMARY
  ======================================================= */

  ratingSummary: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 13,

    overflow: "hidden",

    paddingHorizontal: 14,
    paddingVertical: 13,

    borderWidth: 1,
    borderColor: "#DDD0FF",
    borderRadius: 21,

    backgroundColor: "#FAF8FF",

    shadowColor: "#6F4CFF",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 2,
  },

  ratingSummarySmall: {
    gap: 10,

    paddingHorizontal: 10,
    paddingVertical: 10,

    borderRadius: 18,
  },

  ratingSummaryDesktop: {
    minHeight: 88,
  },

  ratingNumberBox: {
    width: 62,
    height: 62,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#DDD0FF",
    borderRadius: 18,

    backgroundColor: "#F8F4FF",

    shadowColor: "#6F4CFF",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },

  ratingNumberBoxSmall: {
    width: 53,
    height: 53,
    borderRadius: 16,
  },

  ratingNumber: {
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -1,

    color: "#38256F",
  },

  ratingNumberSmall: {
    fontSize: 22,
    lineHeight: 25,
  },

  ratingLabel: {
    marginTop: 1,

    fontSize: 7,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.3,

    color: "#9A82C7",
  },

  ratingDetails: {
    flex: 1,
    minWidth: 0,

    justifyContent: "center",
  },

  starRow: {
    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,

    gap: 2,
  },

  starIcon: {
    flexShrink: 0,
  },

  reviewCountRow: {
    flexDirection: "row",
    alignItems: "center",

    minWidth: 0,

    gap: 8,
    marginTop: 8,
  },

  reviewDot: {
    width: 6,
    height: 6,

    flexShrink: 0,

    borderRadius: 999,

    backgroundColor: COLORS.primary,
  },

  reviewCountText: {
    flexShrink: 1,

    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.25,

    color: "#75618F",
  },

  ratingSideDetail: {
    flexShrink: 0,

    alignItems: "flex-end",
    justifyContent: "center",

    paddingLeft: 7,
  },

  ratingSideSmall: {
    fontSize: 7,
    lineHeight: 10,
    fontWeight: "900",
    letterSpacing: 1.5,

    color: "#A18BBF",
  },

  ratingSideLarge: {
    marginTop: 2,

    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.2,

    color: "#7652C4",
  },

  ratingSideLine: {
    width: 28,
    height: 2,

    marginTop: 6,

    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  ratingGlowOne: {
    position: "absolute",

    width: 90,
    height: 90,

    right: -32,
    top: -36,

    borderRadius: 999,

    backgroundColor: "rgba(139,92,246,0.08)",
  },

  ratingGlowTwo: {
    position: "absolute",

    width: 70,
    height: 70,

    left: "30%",
    bottom: -45,

    borderRadius: 999,

    backgroundColor: "rgba(217,70,239,0.06)",
  },

  ratingShine: {
    position: "absolute",

    left: 20,
    right: 20,
    top: 0,

    height: 1,

    backgroundColor: "#B794FF",
    opacity: 0.45,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorCard: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 11,
    marginBottom: 20,

    padding: 13,

    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    borderRadius: 18,

    backgroundColor: COLORS.dangerBg,
  },

  errorIconBox: {
    width: 38,
    height: 38,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,
    backgroundColor: "#FFE2E6",
  },

  errorContent: {
    flex: 1,
    minWidth: 0,
  },

  errorTitle: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",

    color: "#A72F3D",
  },

  errorMessage: {
    marginTop: 2,

    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",

    color: COLORS.danger,
  },

  retryButton: {
    minHeight: 38,

    flexShrink: 0,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,

    paddingHorizontal: 11,

    borderWidth: 1,
    borderColor: "#FFC6CD",
    borderRadius: 11,

    backgroundColor: COLORS.white,
  },

  retryText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",

    color: COLORS.danger,
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyCard: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    overflow: "hidden",

    alignItems: "center",

    paddingHorizontal: 22,
    paddingVertical: 55,

    marginBottom: 25,

    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D9D0DF",
    borderRadius: 27,

    backgroundColor: "#F9F7FA",
  },

  emptyGlowOne: {
    position: "absolute",

    width: 150,
    height: 150,

    left: -90,
    top: -90,

    borderRadius: 999,

    backgroundColor: "rgba(124,58,237,0.05)",
  },

  emptyGlowTwo: {
    position: "absolute",

    width: 160,
    height: 160,

    right: -90,
    bottom: -100,

    borderRadius: 999,

    backgroundColor: "rgba(217,70,239,0.05)",
  },

  emptyIconOuter: {
    width: 72,
    height: 72,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 22,
    backgroundColor: "#EEE7FF",
  },

  emptyIconInner: {
    width: 56,
    height: 56,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#DDD0FF",
    borderRadius: 18,

    backgroundColor: COLORS.white,
  },

  emptyTitle: {
    marginTop: 18,

    textAlign: "center",

    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: -0.4,

    color: COLORS.text,
  },

  emptyDescription: {
    maxWidth: 480,

    marginTop: 7,

    textAlign: "center",

    fontSize: 11,
    lineHeight: 19,
    fontWeight: "500",

    color: COLORS.textMuted,
  },

  /* =======================================================
     REVIEWS GRID
  ======================================================= */

  reviewsGrid: {
    width: "100%",
    minWidth: 0,

    flexDirection: "column",
    gap: 15,
  },

  reviewsGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",

    columnGap: 0,
    rowGap: 18,
  },

  reviewGridItem: {
    width: "100%",
    minWidth: 0,
  },

  reviewGridItemDesktop: {
    width: "48.8%",
  },

  /* =======================================================
     REVIEW CARD
  ======================================================= */

  reviewCard: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    overflow: "hidden",

    paddingHorizontal: 17,
    paddingVertical: 17,

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,

    backgroundColor: COLORS.white,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.045,
    shadowRadius: 25,
    elevation: 2,
  },

  reviewCardSmall: {
    paddingHorizontal: 12,
    paddingVertical: 13,

    borderRadius: 20,
  },

  reviewTopAccent: {
    position: "absolute",

    left: 0,
    right: 0,
    top: 0,

    height: 2,

    backgroundColor: COLORS.primary,
    opacity: 0.75,
  },

  /* =======================================================
     CUSTOMER HEADER
  ======================================================= */

  reviewHeader: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "flex-start",

    justifyContent: "space-between",

    gap: 10,
  },

  customerInfo: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
  },

  customerAvatar: {
    width: 44,
    height: 44,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#E1D5FF",
    borderRadius: 15,

    backgroundColor: COLORS.violetSoft,
  },

  customerAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },

  customerText: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    flexShrink: 1,

    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",

    color: COLORS.text,
  },

  customerNameSmall: {
    fontSize: 12,
    lineHeight: 17,
  },

  verifiedText: {
    marginTop: 2,

    fontSize: 8,
    lineHeight: 12,
    fontWeight: "800",
    letterSpacing: 0.9,

    color: "#A39AA8",
  },

  reviewStarsBox: {
    flexShrink: 0,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 8,
    paddingVertical: 7,

    borderWidth: 1,
    borderColor: "#F5E7B7",
    borderRadius: 10,

    backgroundColor: COLORS.starSoft,
  },

  reviewStarsBoxSmall: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 9,
  },

  /* =======================================================
     COMMENT OUTER
  ======================================================= */

  commentOuter: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    overflow: "hidden",

    marginTop: 17,

    paddingHorizontal: 13,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: COLORS.borderPurple,
    borderRadius: 23,

    backgroundColor: "#F8F5FF",

    shadowColor: "#6F4CFF",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 25,
    elevation: 2,
  },

  commentOuterSmall: {
    marginTop: 14,

    paddingHorizontal: 9,
    paddingVertical: 11,

    borderRadius: 19,
  },

  commentGlowOne: {
    position: "absolute",

    width: 140,
    height: 140,

    right: -55,
    bottom: -65,

    borderRadius: 999,

    backgroundColor: "rgba(139,92,246,0.08)",
  },

  commentGlowTwo: {
    position: "absolute",

    width: 95,
    height: 95,

    left: -45,
    top: -45,

    borderRadius: 999,

    backgroundColor: "rgba(139,92,246,0.05)",
  },

  /* =======================================================
     COMMENT HEADING
  ======================================================= */

  commentHeading: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,
    marginBottom: 13,
  },

  commentIcon: {
    position: "relative",

    width: 39,
    height: 39,

    flexShrink: 0,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,

    backgroundColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.23,
    shadowRadius: 14,
    elevation: 3,
  },

  commentIconBorder: {
    position: "absolute",

    left: 3,
    right: 3,
    top: 3,
    bottom: 3,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 9,
  },

  commentHeadingText: {
    flex: 1,
    minWidth: 0,
  },

  commentTitleRow: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  commentTitle: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 2.2,

    color: "#6D3DF5",
  },

  commentTitleDot: {
    width: 4,
    height: 4,

    borderRadius: 999,
    backgroundColor: "#A855F7",
  },

  commentTitleLine: {
    width: 82,
    height: 2,

    marginTop: 6,

    borderRadius: 999,
    backgroundColor: "#A855F7",
  },

  /* =======================================================
     QUOTE CARD
  ======================================================= */

  quoteCard: {
    position: "relative",

    width: "100%",
    minWidth: 0,

    overflow: "hidden",

    paddingHorizontal: 12,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: "#D9C8FF",
    borderRadius: 19,

    backgroundColor: COLORS.white,

    shadowColor: "#6948B4",
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.045,
    shadowRadius: 20,
    elevation: 1,
  },

  bigQuote: {
    position: "absolute",

    right: 4,
    top: -15,

    fontSize: 76,
    lineHeight: 88,
    fontWeight: "900",

    color: "#EEE6FF",

    fontFamily: "serif",
  },

  quoteIcon: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    marginBottom: 13,

    borderRadius: 999,
    backgroundColor: COLORS.primary,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.24,
    shadowRadius: 15,
    elevation: 3,
  },

  quoteIconText: {
    marginTop: -2,

    fontSize: 27,
    lineHeight: 31,
    fontWeight: "900",

    color: COLORS.white,

    fontFamily: "serif",
  },

  /* =======================================================
     COMMENT TEXT
  ======================================================= */

  commentTextRow: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "stretch",

    gap: 12,
  },

  verticalGradientFake: {
    width: 4,

    flexShrink: 0,

    overflow: "hidden",

    borderRadius: 999,
  },

  gradientLineTop: {
    flex: 1,
    backgroundColor: "#7C3AED",
  },

  gradientLineMiddle: {
    flex: 1,
    backgroundColor: "#A855F7",
  },

  gradientLineBottom: {
    flex: 1,
    backgroundColor: "#D946EF",
  },

  commentText: {
    flex: 1,
    minWidth: 0,

    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",

    color: COLORS.textDark,
  },

  /* =======================================================
     COMMENT BOTTOM
  ======================================================= */

  commentBottomDetail: {
    flexDirection: "row",
    alignItems: "center",

    gap: 6,

    marginTop: 15,
    marginLeft: 16,
  },

  bottomLineLarge: {
    width: 28,
    height: 3,

    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  bottomDot: {
    width: 4,
    height: 4,

    borderRadius: 999,
    backgroundColor: "#A855F7",
  },

  bottomLineSmall: {
    width: 35,
    height: 2,

    borderRadius: 999,
    backgroundColor: "#E3D7FF",
  },

  /* =======================================================
     COMMENT FOOTER
  ======================================================= */

  commentFooter: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",

    gap: 10,
    marginTop: 12,

    paddingHorizontal: 2,
  },

  experienceRow: {
    flex: 1,
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  experienceDot: {
    width: 5,
    height: 5,

    flexShrink: 0,

    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },

  experienceText: {
    flexShrink: 1,

    fontSize: 7,
    lineHeight: 11,
    fontWeight: "800",
    letterSpacing: 1.2,

    color: "#81729D",
  },

  footerDecoration: {
    flexShrink: 0,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  footerLineLarge: {
    width: 19,
    height: 1,

    backgroundColor: "#DED2F7",
  },

  footerDot: {
    width: 4,
    height: 4,

    borderRadius: 999,

    backgroundColor: "#A855F7",
  },

  footerLineSmall: {
    width: 9,
    height: 1,

    backgroundColor: "#DED2F7",
  },

  /* =======================================================
     REVIEW FOOTER
  ======================================================= */

  reviewFooter: {
    width: "100%",
    minWidth: 0,

    flexDirection: "row",
    alignItems: "center",

    justifyContent: "space-between",

    gap: 10,

    marginTop: 14,
    paddingTop: 12,

    borderTopWidth: 1,
    borderTopColor: "#F0EAF2",
  },

  reviewDate: {
    flex: 1,
    minWidth: 0,

    fontSize: 8,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 0.7,

    color: "#A098A5",
  },

  reviewFooterLabel: {
    flexShrink: 0,

    fontSize: 7,
    lineHeight: 11,
    fontWeight: "800",
    letterSpacing: 0.7,

    color: "#D0C8D2",
  },

  /* =======================================================
     PAGE FOOTER
  ======================================================= */

  footerWrapper: {
    width: "100%",
    minWidth: 0,

    marginTop: "auto",
    paddingTop: 28,
  },

  /* =======================================================
     PRESS
  ======================================================= */

  pressed: {
    opacity: 0.72,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },
});

export default CustomerSalonReviews;
