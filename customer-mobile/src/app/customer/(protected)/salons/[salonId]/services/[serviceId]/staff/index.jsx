import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import { getCustomerStaffByService } from "../../../../../../../../services/customerSalonService";
import CustomerFooter from "../../../../../../../../components/customers/CustomerFooter";

const API_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  "http://192.168.1.5:1812/api"
).replace(/\/api\/?$/, "");

const COLORS = {
  background: "#F8F7FC",
  surface: "#FFFFFF",
  surfaceSoft: "#FBF9FC",

  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  primaryDeep: "#5B21B6",

  purple: "#8B5CF6",
  violet: "#7C3AED",
  fuchsia: "#D946EF",

  text: "#18131C",
  textDark: "#211827",
  textMedium: "#554A5A",
  textSoft: "#766B7A",
  textMuted: "#9A909E",

  border: "#E9E2ED",
  borderSoft: "#F0EBF2",

  white: "#FFFFFF",

  green: "#10B981",
  greenDark: "#047857",
  greenSoft: "#ECFDF5",

  red: "#EF4444",
  redDark: "#B91C1C",
  redSoft: "#FEF2F2",

  slateSoft: "#F5F4F7",
  slateBorder: "#E5E1E8",
};

const CustomerStaffSelection = () => {
  const { salonId, serviceId } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [service, setService] = useState(null);
  const [salon, setSalon] = useState(null);

  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const normalizedSalonId = Array.isArray(salonId)
    ? salonId[0]
    : salonId;

  const normalizedServiceId = Array.isArray(serviceId)
    ? serviceId[0]
    : serviceId;

  const isSmallMobile = width < 360;
  const isMediumMobile = width >= 360 && width < 430;
  const isLargeMobile = width >= 430 && width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;

  const horizontalPadding = isSmallMobile
    ? 14
    : isMediumMobile
      ? 16
      : isLargeMobile
        ? 20
        : isTablet
          ? 28
          : 42;

  const contentMaxWidth = 1500;

  const getInitials = (name = "") => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const getImageUrl = (profileImage) => {
    if (!profileImage) {
      return null;
    }

    if (
      profileImage.startsWith("http://") ||
      profileImage.startsWith("https://")
    ) {
      return profileImage;
    }

    return `${API_URL}${profileImage.startsWith("/") ? "" : "/"}${profileImage}`;
  };

  const loadStaff = async () => {
    if (!normalizedSalonId || !normalizedServiceId) {
      setLoading(false);
      setError("Salon or service information is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getCustomerStaffByService(
        normalizedSalonId,
        normalizedServiceId
      );

      const staffList = Array.isArray(data?.staff)
        ? data.staff
        : [];

      setStaff(staffList);

      if (data?.service) {
        setService({
          _id: data.service.id || data.service._id,
          name: data.service.name,
          category: data.service.category,
        });
      }

      if (data?.salon) {
        setSalon({
          _id: data.salon.id || data.salon._id,
          name: data.salon.name,
          city: data.salon.city,
        });
      }
    } catch (err) {
      console.error("Fetch staff error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load stylists. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [normalizedSalonId, normalizedServiceId]);

  const selectedIndex = useMemo(() => {
    if (!selectedStaff) {
      return -1;
    }

    return staff.findIndex(
      (item) => item?._id === selectedStaff?._id
    );
  }, [staff, selectedStaff]);

  const handleContinue = () => {
    if (!selectedStaff) {
      return;
    }

    router.push(
      `/customer/salons/${normalizedSalonId}/services/${normalizedServiceId}/staff/${selectedStaff._id}/date`
    );
  };

  const handleBack = () => {
    router.back();
  };

  const getGridCardWidth = () => {
    if (isDesktop) {
      return "31.8%";
    }

    if (isTablet) {
      return "48.35%";
    }

    return "100%";
  };

  const getServiceIcon = () => {
    const categoryName =
      typeof service?.category === "string"
        ? service.category.toLowerCase()
        : service?.category?.name?.toLowerCase() || "";

    if (categoryName.includes("spa")) {
      return (
        <MaterialCommunityIcons
          name="spa"
          size={isSmallMobile ? 22 : 27}
          color={COLORS.white}
        />
      );
    }

    if (
      categoryName.includes("hair") ||
      categoryName.includes("nail")
    ) {
      return (
        <MaterialCommunityIcons
          name="content-cut"
          size={isSmallMobile ? 22 : 27}
          color={COLORS.white}
        />
      );
    }

    if (categoryName.includes("skin")) {
      return (
        <MaterialCommunityIcons
          name="face-woman-shimmer"
          size={isSmallMobile ? 22 : 27}
          color={COLORS.white}
        />
      );
    }

    return (
      <Ionicons
        name="sparkles"
        size={isSmallMobile ? 22 : 27}
        color={COLORS.white}
      />
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          selectedStaff && styles.scrollWithBottomBar,
        ]}
      >
        {/* =====================================================
            PREMIUM BACKGROUND
        ===================================================== */}

        <View pointerEvents="none" style={styles.backgroundLayer}>
          <View style={styles.backgroundOrbOne} />
          <View style={styles.backgroundOrbTwo} />
          <View style={styles.backgroundOrbThree} />
          <View style={styles.backgroundGlow} />
        </View>

        {/* =====================================================
            MAIN CONTENT
        ===================================================== */}

        <View
          style={[
            styles.main,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.contentContainer,
              {
                maxWidth: contentMaxWidth,
              },
            ]}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <View style={styles.header}>
              <Pressable
                onPress={handleBack}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={({ pressed }) => [
                  styles.backButton,
                  isSmallMobile && styles.backButtonSmall,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="arrow-back"
                  size={isSmallMobile ? 17 : 19}
                  color={COLORS.textMedium}
                />
              </Pressable>

              <View style={styles.headerContent}>
                <View style={styles.headerMetaRow}>
                  <View
                    style={[
                      styles.stepBadge,
                      isSmallMobile && styles.stepBadgeSmall,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="progress-check"
                      size={isSmallMobile ? 12 : 14}
                      color={COLORS.primary}
                    />

                    <Text
                      style={[
                        styles.stepBadgeText,
                        isSmallMobile &&
                          styles.stepBadgeTextSmall,
                      ]}
                    >
                      STEP 2 OF 4
                    </Text>
                  </View>

                  {!isSmallMobile && (
                    <>
                      <View style={styles.metaDot} />

                      <Text style={styles.headerMetaText}>
                        Personalize your appointment
                      </Text>
                    </>
                  )}
                </View>

                <Text
                  style={[
                    styles.pageTitle,
                    isSmallMobile && styles.pageTitleSmall,
                    isMediumMobile && styles.pageTitleMedium,
                    isLargeMobile && styles.pageTitleLarge,
                    isTablet && styles.pageTitleTablet,
                    isDesktop && styles.pageTitleDesktop,
                  ]}
                >
                  Choose your{" "}
                  <Text style={styles.pageTitleAccent}>
                    stylist
                  </Text>
                </Text>

                <Text
                  style={[
                    styles.pageDescription,
                    isSmallMobile &&
                      styles.pageDescriptionSmall,
                    isTablet &&
                      styles.pageDescriptionTablet,
                    isDesktop &&
                      styles.pageDescriptionDesktop,
                  ]}
                >
                  Select a professional stylist who can perform
                  your chosen beauty service.
                </Text>
              </View>
            </View>

            {/* =================================================
                PROGRESS TRACKER
            ================================================= */}

            <View style={styles.progressCard}>
              <View style={styles.progressTopLine} />

              <View style={styles.progressSteps}>
                {/* STEP 1 */}

                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      styles.progressCircleComplete,
                      isSmallMobile &&
                        styles.progressCircleSmall,
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={isSmallMobile ? 13 : 16}
                      color={COLORS.white}
                    />
                  </View>

                  <Text
                    style={[
                      styles.progressLabel,
                      styles.progressLabelActive,
                      isSmallMobile &&
                        styles.progressLabelSmall,
                    ]}
                  >
                    Service
                  </Text>
                </View>

                <View
                  style={[
                    styles.progressLine,
                    styles.progressLineActive,
                  ]}
                />

                {/* STEP 2 */}

                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      styles.progressCircleCurrent,
                      isSmallMobile &&
                        styles.progressCircleSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressNumber,
                        isSmallMobile &&
                          styles.progressNumberSmall,
                      ]}
                    >
                      2
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.progressLabel,
                      styles.progressLabelActive,
                      isSmallMobile &&
                        styles.progressLabelSmall,
                    ]}
                  >
                    Stylist
                  </Text>
                </View>

                <View style={styles.progressLine} />

                {/* STEP 3 */}

                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      styles.progressCirclePending,
                      isSmallMobile &&
                        styles.progressCircleSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressNumberPending,
                        isSmallMobile &&
                          styles.progressNumberSmall,
                      ]}
                    >
                      3
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.progressLabel,
                      isSmallMobile &&
                        styles.progressLabelSmall,
                    ]}
                  >
                    Date
                  </Text>
                </View>

                <View style={styles.progressLine} />

                {/* STEP 4 */}

                <View style={styles.progressStep}>
                  <View
                    style={[
                      styles.progressCircle,
                      styles.progressCirclePending,
                      isSmallMobile &&
                        styles.progressCircleSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.progressNumberPending,
                        isSmallMobile &&
                          styles.progressNumberSmall,
                      ]}
                    >
                      4
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.progressLabel,
                      isSmallMobile &&
                        styles.progressLabelSmall,
                    ]}
                  >
                    Confirm
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                SELECTED SERVICE HERO
            ================================================= */}

            <View style={styles.serviceHero}>
              <View style={styles.serviceHeroOrbOne} />
              <View style={styles.serviceHeroOrbTwo} />
              <View style={styles.serviceHeroTopLine} />

              <View
                style={[
                  styles.serviceHeroContent,
                  isDesktop &&
                    styles.serviceHeroContentDesktop,
                ]}
              >
                <View
                  style={[
                    styles.serviceInfo,
                    isSmallMobile &&
                      styles.serviceInfoSmall,
                  ]}
                >
                  <View
                    style={[
                      styles.serviceIconBox,
                      isSmallMobile &&
                        styles.serviceIconBoxSmall,
                    ]}
                  >
                    {getServiceIcon()}
                  </View>

                  <View style={styles.serviceTextBlock}>
                    <Text
                      style={[
                        styles.serviceEyebrow,
                        isSmallMobile &&
                          styles.serviceEyebrowSmall,
                      ]}
                    >
                      SELECTED SERVICE
                    </Text>

                    <Text
                      style={[
                        styles.serviceName,
                        isSmallMobile &&
                          styles.serviceNameSmall,
                        isTablet &&
                          styles.serviceNameTablet,
                        isDesktop &&
                          styles.serviceNameDesktop,
                      ]}
                      numberOfLines={3}
                    >
                      {service?.name || "Selected Service"}
                    </Text>

                    {salon?.name ? (
                      <Text
                        style={[
                          styles.salonName,
                          isSmallMobile &&
                            styles.salonNameSmall,
                        ]}
                        numberOfLines={2}
                      >
                        {salon.name}
                        {salon.city
                          ? `  •  ${salon.city}`
                          : ""}
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View
                  style={[
                    styles.staffCountBadge,
                    isSmallMobile &&
                      styles.staffCountBadgeSmall,
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={isSmallMobile ? 15 : 17}
                    color={COLORS.white}
                  />

                  <Text
                    style={[
                      styles.staffCountText,
                      isSmallMobile &&
                        styles.staffCountTextSmall,
                    ]}
                  >
                    {staff.length} stylist
                    {staff.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              <View style={styles.stateCard}>
                <View
                  style={[
                    styles.stateIcon,
                    styles.stateIconLoading,
                    isSmallMobile &&
                      styles.stateIconSmall,
                  ]}
                >
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                  />
                </View>

                <Text
                  style={[
                    styles.stateTitle,
                    isSmallMobile &&
                      styles.stateTitleSmall,
                  ]}
                >
                  Finding available stylists
                </Text>

                <Text
                  style={[
                    styles.stateDescription,
                    isSmallMobile &&
                      styles.stateDescriptionSmall,
                  ]}
                >
                  Checking professionals assigned to this
                  service...
                </Text>
              </View>
            ) : null}

            {/* =================================================
                ERROR
            ================================================= */}

            {!loading && error ? (
              <View style={styles.errorCard}>
                <View style={styles.errorTopLine} />

                <View
                  style={[
                    styles.stateIcon,
                    styles.stateIconError,
                    isSmallMobile &&
                      styles.stateIconSmall,
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={isSmallMobile ? 26 : 31}
                    color={COLORS.red}
                  />
                </View>

                <Text
                  style={[
                    styles.stateTitle,
                    isSmallMobile &&
                      styles.stateTitleSmall,
                  ]}
                >
                  Unable to load stylists
                </Text>

                <Text
                  style={[
                    styles.stateDescription,
                    isSmallMobile &&
                      styles.stateDescriptionSmall,
                  ]}
                >
                  {error}
                </Text>

                <Pressable
                  onPress={loadStaff}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="refresh"
                    size={17}
                    color={COLORS.white}
                  />

                  <Text style={styles.retryButtonText}>
                    Try Again
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading && !error && staff.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyDecorOne} />
                <View style={styles.emptyDecorTwo} />

                <View
                  style={[
                    styles.stateIcon,
                    styles.stateIconEmpty,
                    isSmallMobile &&
                      styles.stateIconSmall,
                  ]}
                >
                  <Ionicons
                    name="people-outline"
                    size={isSmallMobile ? 27 : 33}
                    color={COLORS.textMuted}
                  />
                </View>

                <Text
                  style={[
                    styles.stateTitle,
                    isSmallMobile &&
                      styles.stateTitleSmall,
                  ]}
                >
                  No stylist available
                </Text>

                <Text
                  style={[
                    styles.stateDescription,
                    isSmallMobile &&
                      styles.stateDescriptionSmall,
                  ]}
                >
                  There are currently no active stylists assigned
                  to this service. Please choose another service
                  or try again later.
                </Text>

                <Pressable
                  onPress={handleBack}
                  style={({ pressed }) => [
                    styles.backServicesButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={COLORS.white}
                  />

                  <Text style={styles.backServicesButtonText}>
                    Back to Services
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* =================================================
                STAFF LIST
            ================================================= */}

            {!loading && !error && staff.length > 0 ? (
              <View
                style={[
                  styles.staffSection,
                  selectedStaff &&
                    styles.staffSectionWithBottomBar,
                ]}
              >
                {/* SECTION HEADER */}

                <View
                  style={[
                    styles.staffSectionHeader,
                    isSmallMobile &&
                      styles.staffSectionHeaderSmall,
                  ]}
                >
                  <View style={styles.staffHeadingBlock}>
                    <View style={styles.professionalLabelRow}>
                      <View style={styles.professionalDot} />

                      <Text
                        style={[
                          styles.professionalLabel,
                          isSmallMobile &&
                            styles.professionalLabelSmall,
                        ]}
                      >
                        PROFESSIONAL TEAM
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.staffSectionTitle,
                        isSmallMobile &&
                          styles.staffSectionTitleSmall,
                        isTablet &&
                          styles.staffSectionTitleTablet,
                        isDesktop &&
                          styles.staffSectionTitleDesktop,
                      ]}
                    >
                      Available stylists
                    </Text>

                    <Text
                      style={[
                        styles.staffSectionDescription,
                        isSmallMobile &&
                          styles.staffSectionDescriptionSmall,
                      ]}
                    >
                      Choose one professional for your
                      appointment.
                    </Text>
                  </View>

                  {selectedStaff ? (
                    <View
                      style={[
                        styles.selectedBadge,
                        isSmallMobile &&
                          styles.selectedBadgeSmall,
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={isSmallMobile ? 13 : 15}
                        color={COLORS.primary}
                      />

                      <Text
                        style={[
                          styles.selectedBadgeText,
                          isSmallMobile &&
                            styles.selectedBadgeTextSmall,
                        ]}
                      >
                        Stylist selected
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* STAFF GRID */}

                <View
                  style={[
                    styles.staffGrid,
                    isTablet &&
                      styles.staffGridTablet,
                    isDesktop &&
                      styles.staffGridDesktop,
                  ]}
                >
                  {staff.map((item, index) => {
                    const isSelected =
                      selectedStaff?._id === item?._id;

                    const imageUrl = getImageUrl(
                      item?.profileImage
                    );

                    const specializations =
                      Array.isArray(item?.specialization) &&
                      item.specialization.length > 0
                        ? item.specialization.join("  •  ")
                        : "Professional Stylist";

                    return (
                      <View
                        key={item?._id || `${item?.name}-${index}`}
                        style={[
                          styles.staffCard,
                          {
                            width: getGridCardWidth(),
                          },
                          isSelected &&
                            styles.staffCardSelected,
                        ]}
                      >
                        {/* CARD TOP ACCENT */}

                        <View
                          style={[
                            styles.cardAccent,
                            isSelected &&
                              styles.cardAccentSelected,
                          ]}
                        />

                        {/* CARD GLOW */}

                        <View
                          pointerEvents="none"
                          style={[
                            styles.cardGlow,
                            isSelected &&
                              styles.cardGlowSelected,
                          ]}
                        />

                        {/* SELECTION CHECK */}

                        <View
                          style={[
                            styles.selectionIndicator,
                            isSelected &&
                              styles.selectionIndicatorSelected,
                            isSmallMobile &&
                              styles.selectionIndicatorSmall,
                          ]}
                        >
                          {isSelected ? (
                            <Ionicons
                              name="checkmark"
                              size={isSmallMobile ? 13 : 15}
                              color={COLORS.white}
                            />
                          ) : null}
                        </View>

                        {/* PROFILE ROW */}

                        <Pressable
                          onPress={() =>
                            setSelectedStaff(item)
                          }
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.profileRow,
                            pressed && styles.cardPressed,
                          ]}
                        >
                          {imageUrl ? (
                            <Image
                              source={{ uri: imageUrl }}
                              style={[
                                styles.profileImage,
                                isSmallMobile &&
                                  styles.profileImageSmall,
                              ]}
                            />
                          ) : (
                            <View
                              style={[
                                styles.initialsAvatar,
                                isSmallMobile &&
                                  styles.initialsAvatarSmall,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.initialsText,
                                  isSmallMobile &&
                                    styles.initialsTextSmall,
                                ]}
                              >
                                {getInitials(item?.name)}
                              </Text>
                            </View>
                          )}

                          <View
                            style={[
                              styles.profileTextBlock,
                              isSmallMobile &&
                                styles.profileTextBlockSmall,
                            ]}
                          >
                            <Text
                              style={[
                                styles.staffName,
                                isSmallMobile &&
                                  styles.staffNameSmall,
                              ]}
                              numberOfLines={2}
                            >
                              {item?.name ||
                                "Professional Stylist"}
                            </Text>

                            <Text
                              style={[
                                styles.staffSpecialization,
                                isSmallMobile &&
                                  styles.staffSpecializationSmall,
                              ]}
                              numberOfLines={3}
                            >
                              {specializations}
                            </Text>
                          </View>
                        </Pressable>

                        {/* STATUS AREA */}

                        <View
                          style={[
                            styles.statusRow,
                            isSmallMobile &&
                              styles.statusRowSmall,
                          ]}
                        >
                          <View
                            style={[
                              styles.statusChip,
                              isSmallMobile &&
                                styles.statusChipSmall,
                            ]}
                          >
                            <View
                              style={styles.statusDot}
                            />

                            <Text
                              style={[
                                styles.statusChipText,
                                isSmallMobile &&
                                  styles.statusChipTextSmall,
                              ]}
                            >
                              Available
                            </Text>
                          </View>

                          {item?.workingHours?.length > 0 ? (
                            <View
                              style={[
                                styles.scheduleChip,
                                isSmallMobile &&
                                  styles.scheduleChipSmall,
                              ]}
                            >
                              <Ionicons
                                name="time-outline"
                                size={isSmallMobile ? 11 : 13}
                                color={COLORS.textMedium}
                              />

                              <Text
                                style={[
                                  styles.scheduleChipText,
                                  isSmallMobile &&
                                    styles.scheduleChipTextSmall,
                                ]}
                                numberOfLines={1}
                              >
                                Schedule
                              </Text>
                            </View>
                          ) : null}
                        </View>

                        {/* SELECT BUTTON */}

                        <Pressable
                          onPress={() =>
                            setSelectedStaff(item)
                          }
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.selectStaffButton,
                            isSelected &&
                              styles.selectStaffButtonSelected,
                            pressed &&
                              styles.selectStaffButtonPressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.selectStaffButtonText,
                              isSelected &&
                                styles.selectStaffButtonTextSelected,
                              isSmallMobile &&
                                styles.selectStaffButtonTextSmall,
                            ]}
                          >
                            {isSelected
                              ? "Selected stylist"
                              : "Select stylist"}
                          </Text>

                          <Ionicons
                            name={
                              isSelected
                                ? "checkmark-circle"
                                : "arrow-forward"
                            }
                            size={isSmallMobile ? 16 : 18}
                            color={
                              isSelected
                                ? COLORS.white
                                : COLORS.primary
                            }
                          />
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {/* =================================================
                FOOTER
            ================================================= */}

            <CustomerFooter />
          </View>
        </View>
      </ScrollView>

      {/* =======================================================
          STICKY CONTINUE BAR
      ======================================================= */}

      {!loading && !error && staff.length > 0 ? (
        <View style={styles.bottomBar}>
          <View
            style={[
              styles.bottomBarInner,
              {
                maxWidth: contentMaxWidth,
                paddingHorizontal: horizontalPadding,
              },
              (isMediumMobile || isLargeMobile) &&
                styles.bottomBarInnerMobile,
              isSmallMobile &&
                styles.bottomBarInnerSmall,
            ]}
          >
            <View
              style={[
                styles.bottomSelectionInfo,
                (isMediumMobile || isLargeMobile) &&
                  styles.bottomSelectionInfoMobile,
                isSmallMobile &&
                  styles.bottomSelectionInfoSmall,
              ]}
            >
              <View
                style={[
                  styles.bottomIcon,
                  selectedStaff &&
                    styles.bottomIconSelected,
                  isSmallMobile &&
                    styles.bottomIconSmall,
                ]}
              >
                <Ionicons
                  name={
                    selectedStaff
                      ? "checkmark"
                      : "person-outline"
                  }
                  size={isSmallMobile ? 17 : 20}
                  color={
                    selectedStaff
                      ? COLORS.white
                      : COLORS.textMuted
                  }
                />
              </View>

              <View
                style={styles.bottomTextBlock}
              >
                <Text
                  style={[
                    styles.bottomEyebrow,
                    isSmallMobile &&
                      styles.bottomEyebrowSmall,
                  ]}
                >
                  {selectedStaff
                    ? "SELECTED STYLIST"
                    : "NEXT STEP"}
                </Text>

                <Text
                  style={[
                    styles.bottomSelectedName,
                    (isMediumMobile || isLargeMobile) &&
                      styles.bottomSelectedNameMobile,
                    isSmallMobile &&
                      styles.bottomSelectedNameSmall,
                  ]}
                  numberOfLines={1}
                >
                  {selectedStaff
                    ? selectedStaff.name
                    : "Select a stylist to continue"}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleContinue}
              disabled={!selectedStaff}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.continueButton,
                !selectedStaff &&
                  styles.continueButtonDisabled,
                (isMediumMobile || isLargeMobile) &&
                  styles.continueButtonMobile,
                isSmallMobile &&
                  styles.continueButtonSmall,
                pressed &&
                  selectedStaff &&
                  styles.continueButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  !selectedStaff &&
                    styles.continueButtonTextDisabled,
                  isSmallMobile &&
                    styles.continueButtonTextSmall,
                ]}
                numberOfLines={1}
              >
                Choose date & time
              </Text>

              <Ionicons
                name="arrow-forward"
                size={isSmallMobile ? 16 : 19}
                color={
                  selectedStaff
                    ? COLORS.white
                    : COLORS.textMuted
                }
              />
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 35,
  },

  scrollWithBottomBar: {
    paddingBottom: 145,
  },

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  backgroundOrbOne: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    top: -130,
    left: -130,
    backgroundColor: "rgba(124,58,237,0.08)",
  },

  backgroundOrbTwo: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    top: 160,
    right: -230,
    backgroundColor: "rgba(217,70,239,0.07)",
  },

  backgroundOrbThree: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    bottom: -170,
    left: "20%",
    backgroundColor: "rgba(139,92,246,0.06)",
  },

  backgroundGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 520,
    backgroundColor: "rgba(255,255,255,0.36)",
  },

  main: {
    width: "100%",
    paddingTop: 20,
    paddingBottom: 25,
  },

  contentContainer: {
    width: "100%",
    alignSelf: "center",
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    marginBottom: 24,
  },

  backButton: {
    width: 45,
    height: 45,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#241329",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  backButtonSmall: {
    width: 39,
    height: 39,
    borderRadius: 13,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerMetaRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  stepBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD2F4",
    backgroundColor: "#F5F0FF",
  },

  stepBadgeSmall: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 5,
  },

  stepBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.15,
    includeFontPadding: false,
  },

  stepBadgeTextSmall: {
    fontSize: 8,
    letterSpacing: 0.9,
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C4B5D0",
  },

  headerMetaText: {
    color: "#9A909F",
    fontSize: 11,
    fontWeight: "700",
    includeFontPadding: false,
  },

  pageTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 50,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1.8,
    includeFontPadding: false,
  },

  pageTitleSmall: {
    marginTop: 11,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.9,
  },

  pageTitleMedium: {
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.1,
  },

  pageTitleLarge: {
    fontSize: 42,
    lineHeight: 47,
    letterSpacing: -1.4,
  },

  pageTitleTablet: {
    fontSize: 55,
    lineHeight: 59,
  },

  pageTitleDesktop: {
    fontSize: 68,
    lineHeight: 72,
    letterSpacing: -2.5,
  },

  pageTitleAccent: {
    color: COLORS.primary,
  },

  pageDescription: {
    maxWidth: 680,
    marginTop: 10,
    color: COLORS.textSoft,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    includeFontPadding: false,
  },

  pageDescriptionSmall: {
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 8,
  },

  pageDescriptionTablet: {
    fontSize: 15,
    lineHeight: 24,
  },

  pageDescriptionDesktop: {
    fontSize: 16,
    lineHeight: 26,
  },

  /* =========================================================
     PROGRESS
  ========================================================= */

  progressCard: {
    width: "100%",
    position: "relative",
    overflow: "hidden",
    marginBottom: 22,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.84)",
    shadowColor: "#241329",
    shadowOpacity: 0.065,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },

  progressTopLine: {
    position: "absolute",
    top: 0,
    left: 35,
    right: 35,
    height: 1,
    backgroundColor: "#DDD1F1",
  },

  progressSteps: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  progressStep: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleSmall: {
    width: 31,
    height: 31,
    borderRadius: 16,
  },

  progressCircleComplete: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  progressCircleCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: "#E9D5FF",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  progressCirclePending: {
    borderWidth: 1,
    borderColor: COLORS.slateBorder,
    backgroundColor: "#F8F7F9",
  },

  progressNumber: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  progressNumberPending: {
    color: "#A69CAA",
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  progressNumberSmall: {
    fontSize: 10,
  },

  progressLabel: {
    marginTop: 6,
    color: "#A198A7",
    fontSize: 9.5,
    fontWeight: "800",
    includeFontPadding: false,
  },

  progressLabelActive: {
    color: COLORS.primaryDark,
  },

  progressLabelSmall: {
    marginTop: 5,
    fontSize: 8,
  },

  progressLine: {
    flex: 1,
    height: 2,
    minWidth: 8,
    backgroundColor: "#E8E3EA",
  },

  progressLineActive: {
    backgroundColor: "#C4B5FD",
  },

  /* =========================================================
     SERVICE HERO
  ========================================================= */

  serviceHero: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    minHeight: 130,
    marginBottom: 25,
    padding: 19,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primaryDeep,
    shadowOpacity: 0.22,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 16,
    },
    elevation: 6,
  },

  serviceHeroOrbOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    right: -85,
    top: -115,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  serviceHeroOrbTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: "32%",
    bottom: -130,
    backgroundColor: "rgba(217,70,239,0.18)",
  },

  serviceHeroTopLine: {
    position: "absolute",
    top: 0,
    left: 35,
    right: 35,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  serviceHeroContent: {
    width: "100%",
    flexDirection: "column",
    gap: 15,
  },

  serviceHeroContentDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 30,
  },

  serviceInfo: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  serviceInfoSmall: {
    gap: 10,
  },

  serviceIconBox: {
    width: 58,
    height: 58,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  serviceIconBoxSmall: {
    width: 46,
    height: 46,
    borderRadius: 15,
  },

  serviceTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  serviceEyebrow: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    includeFontPadding: false,
  },

  serviceEyebrowSmall: {
    fontSize: 7.5,
    letterSpacing: 1.1,
  },

  serviceName: {
    marginTop: 5,
    color: COLORS.white,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.35,
    includeFontPadding: false,
  },

  serviceNameSmall: {
    fontSize: 14.5,
    lineHeight: 19,
  },

  serviceNameTablet: {
    fontSize: 21,
    lineHeight: 26,
  },

  serviceNameDesktop: {
    fontSize: 25,
    lineHeight: 30,
  },

  salonName: {
    marginTop: 5,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "600",
    includeFontPadding: false,
  },

  salonNameSmall: {
    fontSize: 9.5,
    lineHeight: 14,
  },

  staffCountBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  staffCountBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },

  staffCountText: {
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  staffCountTextSmall: {
    fontSize: 9,
  },

  /* =========================================================
     STATES
  ========================================================= */

  stateCard: {
    width: "100%",
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    marginBottom: 20,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#241329",
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 3,
  },

  errorCard: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    minHeight: 310,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
    marginBottom: 20,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#7F1D1D",
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 3,
  },

  errorTopLine: {
    position: "absolute",
    top: 0,
    left: 45,
    right: 45,
    height: 1,
    backgroundColor: "#FECACA",
  },

  emptyCard: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    minHeight: 350,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 55,
    marginBottom: 20,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#241329",
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 3,
  },

  emptyDecorOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -95,
    right: -75,
    backgroundColor: "rgba(124,58,237,0.05)",
  },

  emptyDecorTwo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: -90,
    left: -70,
    backgroundColor: "rgba(217,70,239,0.05)",
  },

  stateIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },

  stateIconSmall: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },

  stateIconLoading: {
    backgroundColor: "#F5F0FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  stateIconError: {
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  stateIconEmpty: {
    backgroundColor: COLORS.slateSoft,
    borderWidth: 1,
    borderColor: COLORS.slateBorder,
  },

  stateTitle: {
    marginTop: 17,
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  stateTitleSmall: {
    fontSize: 17,
    lineHeight: 22,
  },

  stateDescription: {
    maxWidth: 560,
    marginTop: 8,
    color: COLORS.textSoft,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  stateDescriptionSmall: {
    fontSize: 11.5,
    lineHeight: 18,
  },

  retryButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 22,
    paddingHorizontal: 22,
    borderRadius: 15,
    backgroundColor: COLORS.primaryDeep,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  retryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  backServicesButton: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 23,
    paddingHorizontal: 21,
    borderRadius: 15,
    backgroundColor: "#17131A",
  },

  backServicesButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  /* =========================================================
     STAFF SECTION
  ========================================================= */

  staffSection: {
    width: "100%",
  },

  staffSectionWithBottomBar: {
    paddingBottom: 15,
  },

  staffSectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 20,
    marginBottom: 20,
  },

  staffSectionHeaderSmall: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 11,
  },

  staffHeadingBlock: {
    flex: 1,
    minWidth: 0,
  },

  professionalLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  professionalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 2,
  },

  professionalLabel: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.55,
    includeFontPadding: false,
  },

  professionalLabelSmall: {
    fontSize: 7.8,
    letterSpacing: 1.15,
  },

  staffSectionTitle: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
    includeFontPadding: false,
  },

  staffSectionTitleSmall: {
    fontSize: 22,
    lineHeight: 27,
  },

  staffSectionTitleTablet: {
    fontSize: 32,
    lineHeight: 37,
  },

  staffSectionTitleDesktop: {
    fontSize: 38,
    lineHeight: 43,
  },

  staffSectionDescription: {
    marginTop: 5,
    color: COLORS.textSoft,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "500",
    includeFontPadding: false,
  },

  staffSectionDescriptionSmall: {
    fontSize: 11,
    lineHeight: 17,
  },

  selectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD2F4",
    backgroundColor: "#F5F0FF",
  },

  selectedBadgeSmall: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  selectedBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 10,
    fontWeight: "900",
    includeFontPadding: false,
  },

  selectedBadgeTextSmall: {
    fontSize: 8.5,
  },

  /* =========================================================
     STAFF GRID
  ========================================================= */

  staffGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 17,
  },

  staffGridTablet: {
    gap: 20,
  },

  staffGridDesktop: {
    gap: 23,
  },

  /* =========================================================
     STAFF CARD
  ========================================================= */

  staffCard: {
    position: "relative",
    minHeight: 255,
    overflow: "hidden",
    padding: 17,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    shadowColor: "#241329",
    shadowOpacity: 0.055,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 3,
  },

  staffCardSelected: {
    borderColor: "#A78BFA",
    backgroundColor: "#FFFFFF",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    elevation: 7,
  },

  cardAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "transparent",
  },

  cardAccentSelected: {
    backgroundColor: COLORS.primary,
  },

  cardGlow: {
    position: "absolute",
    width: 145,
    height: 145,
    borderRadius: 73,
    right: -75,
    top: -75,
    backgroundColor: "rgba(124,58,237,0)",
  },

  cardGlowSelected: {
    backgroundColor: "rgba(124,58,237,0.07)",
  },

  selectionIndicator: {
    position: "absolute",
    top: 13,
    right: 13,
    zIndex: 5,
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#F1EFF3",
  },

  selectionIndicatorSmall: {
    width: 27,
    height: 27,
    borderRadius: 14,
    top: 11,
    right: 11,
  },

  selectionIndicatorSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  profileRow: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingRight: 37,
  },

  profileImage: {
    width: 61,
    height: 61,
    flexShrink: 0,
    borderRadius: 19,
    backgroundColor: "#F1ECF4",
  },

  profileImageSmall: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },

  initialsAvatar: {
    width: 61,
    height: 61,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: COLORS.primary,
  },

  initialsAvatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },

  initialsText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  initialsTextSmall: {
    fontSize: 15,
  },

  profileTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },

  profileTextBlockSmall: {
    paddingTop: 0,
  },

  staffName: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    letterSpacing: -0.2,
    includeFontPadding: false,
  },

  staffNameSmall: {
    fontSize: 14,
    lineHeight: 19,
  },

  staffSpecialization: {
    marginTop: 5,
    color: COLORS.textSoft,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "600",
    includeFontPadding: false,
  },

  staffSpecializationSmall: {
    marginTop: 4,
    fontSize: 9.5,
    lineHeight: 14,
  },

  /* =========================================================
     STATUS
  ========================================================= */

  statusRow: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
    marginTop: 18,
  },

  statusRowSmall: {
    marginTop: 14,
    gap: 6,
  },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: COLORS.greenSoft,
  },

  statusChipSmall: {
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },

  statusChipText: {
    color: COLORS.greenDark,
    fontSize: 9.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  statusChipTextSmall: {
    fontSize: 8,
  },

  scheduleChip: {
    maxWidth: "65%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.slateBorder,
    backgroundColor: COLORS.slateSoft,
  },

  scheduleChipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  scheduleChipText: {
    flexShrink: 1,
    color: COLORS.textMedium,
    fontSize: 9.5,
    fontWeight: "800",
    includeFontPadding: false,
  },

  scheduleChipTextSmall: {
    fontSize: 8,
  },

  /* =========================================================
     SELECT STAFF
  ========================================================= */

  selectStaffButton: {
    width: "100%",
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 17,
    paddingHorizontal: 13,
    borderRadius: 14,
    backgroundColor: "#F7F4FA",
  },

  selectStaffButtonSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.19,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 4,
  },

  selectStaffButtonPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  selectStaffButtonText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.primaryDark,
    fontSize: 11.5,
    fontWeight: "900",
    includeFontPadding: false,
  },

  selectStaffButtonTextSelected: {
    color: COLORS.white,
  },

  selectStaffButtonTextSmall: {
    fontSize: 10,
  },

  /* =========================================================
     BOTTOM BAR
  ========================================================= */

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    borderTopWidth: 1,
    borderTopColor: "#E6DDEC",
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#241329",
    shadowOpacity: 0.16,
    shadowRadius: 25,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    elevation: 15,
  },

  bottomBarInner: {
    width: "100%",
    minHeight: 83,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    paddingTop: 11,
    paddingBottom: 11,
  },

  bottomBarInnerMobile: {
    minHeight: 112,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "center",
    gap: 8,
    paddingTop: 9,
    paddingBottom: 9,
  },

  bottomBarInnerSmall: {
    minHeight: 104,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 8,
    paddingTop: 9,
    paddingBottom: 9,
  },

  bottomSelectionInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  bottomSelectionInfoMobile: {
    width: "100%",
    flex: 0,
    minWidth: 0,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  bottomSelectionInfoSmall: {
    minHeight: 38,
  },

  bottomIcon: {
    width: 45,
    height: 45,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F5F3F6",
  },

  bottomIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },

  bottomIconSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  bottomTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  bottomEyebrow: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 1.25,
    includeFontPadding: false,
  },

  bottomEyebrowSmall: {
    fontSize: 7,
    letterSpacing: 0.9,
  },

  bottomSelectedName: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    includeFontPadding: false,
  },

  bottomSelectedNameSmall: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
  },

  bottomSelectedNameMobile: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 17,
  },

  continueButton: {
    minWidth: 215,
    height: 50,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#17131A",
    shadowColor: "#17131A",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 5,
  },

  continueButtonMobile: {
    width: "100%",
    minWidth: 0,
    height: 43,
    flexShrink: 0,
    borderRadius: 14,
    paddingHorizontal: 14,
  },

  continueButtonSmall: {
    width: "100%",
    minWidth: 0,
    height: 43,
    borderRadius: 14,
  },

  continueButtonDisabled: {
    backgroundColor: "#F0EEF2",
    shadowOpacity: 0,
    elevation: 0,
  },

  continueButtonPressed: {
    opacity: 0.84,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  continueButtonText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  continueButtonTextSmall: {
    fontSize: 10.5,
  },

  continueButtonTextDisabled: {
    color: COLORS.textMuted,
  },

  /* =========================================================
     COMMON
  ========================================================= */

  pressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  cardPressed: {
    opacity: 0.82,
  },
});

export default CustomerStaffSelection;