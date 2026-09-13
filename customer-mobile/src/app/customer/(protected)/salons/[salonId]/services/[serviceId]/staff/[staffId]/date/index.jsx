import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import {
  getCustomerStaffAvailability,
  getCustomerAvailableSlots,
} from "../../../../../../../../../../services/customerSalonService";

import CustomerFooter from "../../../../../../../../../../components/customers/CustomerFooter";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#FAF9FC",
  white: "#FFFFFF",

  slate950: "#0F172A",
  slate900: "#172033",
  slate800: "#273449",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",

  violet950: "#3B0764",
  violet900: "#4C1D95",
  violet800: "#5B21B6",
  violet700: "#6D28D9",
  violet600: "#7C3AED",
  violet500: "#8B5CF6",
  violet400: "#A78BFA",
  violet200: "#DDD6FE",
  violet100: "#EDE9FE",
  violet50: "#F5F3FF",

  fuchsia600: "#C026D3",
  fuchsia500: "#D946EF",
  fuchsia100: "#FAE8FF",
  fuchsia50: "#FDF4FF",

  emerald700: "#047857",
  emerald600: "#059669",
  emerald500: "#10B981",
  emerald100: "#D1FAE5",
  emerald50: "#ECFDF5",

  amber900: "#78350F",
  amber700: "#B45309",
  amber600: "#D97706",
  amber100: "#FDE68A",
  amber50: "#FFFBEB",

  red700: "#B91C1C",
  red600: "#DC2626",
  red500: "#EF4444",
  red100: "#FECACA",
  red50: "#FEF2F2",
};

/* =========================================================
   HELPERS
========================================================= */

const getParamValue = (value) => {
  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

const safeJsonParse = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getSlotValue = (slot) => {
  if (typeof slot === "string") {
    return slot;
  }

  return slot?.startTime || slot?.time || "";
};

const getSlotLabel = (slot) => {
  if (typeof slot === "string") {
    return slot;
  }

  if (slot?.startTime && slot?.endTime) {
    return `${slot.startTime} - ${slot.endTime}`;
  }

  return slot?.startTime || slot?.time || "Available slot";
};

const isSameSlot = (first, second) => {
  if (!first || !second) {
    return false;
  }

  if (
    typeof first === "string" &&
    typeof second === "string"
  ) {
    return first === second;
  }

  return (
    getSlotValue(first) === getSlotValue(second) &&
    (first?.endTime || "") === (second?.endTime || "")
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const CustomerStaffDateSlots = () => {
  const router = useRouter();

  const params = useLocalSearchParams();

  const salonId = getParamValue(params.salonId);
  const serviceId = getParamValue(params.serviceId);
  const staffId = getParamValue(params.staffId);

  const { width } = useWindowDimensions();

  /* =======================================================
     RESPONSIVE BREAKPOINTS
  ======================================================= */

  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isLargeMobile = width >= 430 && width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isLaptop = width >= 1024 && width < 1440;
  const isLargeDesktop = width >= 1440;

  const horizontalPadding = useMemo(() => {
    if (isSmallMobile) return 14;
    if (width < 430) return 16;
    if (isMobile) return 18;
    if (isTablet) return 26;
    if (isLaptop) return 38;
    if (isLargeDesktop) return 48;

    return 24;
  }, [
    width,
    isSmallMobile,
    isMobile,
    isTablet,
    isLaptop,
    isLargeDesktop,
  ]);

  const maxContentWidth = 1480;

  /* =======================================================
     ROUTER DATA

     Expo Router does not have React Router's location.state.
     We support JSON params if another page sends them.
  ======================================================= */

  const salon = useMemo(
    () => safeJsonParse(params.salon) || null,
    [params.salon]
  );

  const service = useMemo(
    () => safeJsonParse(params.service) || null,
    [params.service]
  );

  const staff = useMemo(
    () => safeJsonParse(params.staff) || null,
    [params.staff]
  );

  /* =======================================================
     STATE
  ======================================================= */

  const [selectedDate, setSelectedDate] = useState("");
  const [availability, setAvailability] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [availabilityLoading, setAvailabilityLoading] =
    useState(false);

  const [slotsLoading, setSlotsLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     MINIMUM DATE
  ======================================================= */

  const minDate = useMemo(() => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(
      2,
      "0"
    );
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = useCallback((date) => {
    if (!date) {
      return "";
    }

    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, []);

  /* =======================================================
     FETCH AVAILABLE SLOTS
  ======================================================= */

  const fetchAvailableSlots = useCallback(
    async (date, showLoading = true) => {
      if (!date || !salonId || !serviceId || !staffId) {
        return;
      }

      try {
        if (showLoading) {
          setSlotsLoading(true);
        }

        const data = await getCustomerAvailableSlots({
          salonId,
          serviceId,
          staffId,
          date,
        });

        const nextSlots = Array.isArray(data?.slots)
          ? data.slots
          : Array.isArray(data?.availableSlots)
          ? data.availableSlots
          : [];

        setSlots(nextSlots);
      } catch (err) {
        console.error(
          "Available slots error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load available time slots."
        );

        setSlots([]);
      } finally {
        if (showLoading) {
          setSlotsLoading(false);
        }
      }
    },
    [salonId, serviceId, staffId]
  );

  /* =======================================================
     FETCH STAFF AVAILABILITY
  ======================================================= */

  const fetchAvailability = useCallback(
    async (date) => {
      if (!date || !staffId) {
        setAvailability(null);
        setSlots([]);
        setSelectedSlot(null);
        return;
      }

      try {
        setAvailabilityLoading(true);
        setSlotsLoading(false);

        setSlots([]);
        setSelectedSlot(null);
        setError("");

        const data =
          await getCustomerStaffAvailability(
            staffId,
            date
          );

        setAvailability(data);

        if (!data?.available) {
          setSlots([]);
          return;
        }

        await fetchAvailableSlots(date, true);
      } catch (err) {
        console.error(
          "Availability error:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to check staff availability."
        );

        setAvailability(null);
        setSlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    },
    [staffId, fetchAvailableSlots]
  );

  /* =======================================================
     DATE CHANGE
  ======================================================= */

  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      setSlots([]);
      setSelectedSlot(null);
      setError("");
      return;
    }

    fetchAvailability(selectedDate);
  }, [selectedDate, fetchAvailability]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = useCallback(async () => {
    if (!selectedDate) {
      return;
    }

    try {
      setRefreshing(true);
      await fetchAvailability(selectedDate);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, fetchAvailability]);

  /* =======================================================
     CONTINUE
  ======================================================= */

  const handleContinue = () => {
    if (!selectedSlot) {
      return;
    }

    const nextPath =
      `/customer/salons/${salonId}` +
      `/services/${serviceId}` +
      `/staff/${staffId}/confirm`;

    /*
      React Router state does not exist in Expo Router.

      We pass the required booking information through
      route params. If the confirmation page refetches
      salon/service/staff using IDs, these JSON params can
      simply be ignored there.
    */

    router.push({
      pathname: nextPath,
      params: {
        date: selectedDate,
        slot: JSON.stringify(selectedSlot),

        ...(salon
          ? {
              salon: JSON.stringify(salon),
            }
          : {}),

        ...(service
          ? {
              service: JSON.stringify(service),
            }
          : {}),

        ...(staff
          ? {
              staff: JSON.stringify(staff),
            }
          : {}),
      },
    });
  };

  /* =======================================================
     CLEAR SELECTED SLOT
  ======================================================= */

  const clearSelectedSlot = () => {
    setSelectedSlot(null);
  };

  /* =======================================================
     BACK
  ======================================================= */

  const handleBack = () => {
    router.back();
  };

  /* =======================================================
     RESPONSIVE SLOT COLUMNS
  ======================================================= */

  const slotColumns = useMemo(() => {
    if (isSmallMobile) {
      return 2;
    }

    if (isMobile) {
      return 2;
    }

    if (isTablet) {
      return 4;
    }

    if (isLaptop) {
      return 5;
    }

    return 6;
  }, [
    isSmallMobile,
    isMobile,
    isTablet,
    isLaptop,
  ]);

  /* =======================================================
     STAFF SPECIALIZATION
  ======================================================= */

  const staffSpecialization = useMemo(() => {
    if (
      Array.isArray(staff?.specialization) &&
      staff.specialization.length > 0
    ) {
      return staff.specialization.join(" • ");
    }

    if (typeof staff?.specialization === "string") {
      return staff.specialization;
    }

    return "Professional Stylist";
  }, [staff]);

  /* =======================================================
     SELECTED SLOT LABEL
  ======================================================= */

  const selectedSlotLabel = useMemo(() => {
    if (!selectedSlot) {
      return "";
    }

    return getSlotLabel(selectedSlot);
  }, [selectedSlot]);

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <View style={styles.root}>
      {/* ===================================================
          PREMIUM BACKGROUND
      =================================================== */}

      <View
        pointerEvents="none"
        style={styles.backgroundLayer}
      >
        <View style={styles.backgroundGlowOne} />
        <View style={styles.backgroundGlowTwo} />
        <View style={styles.backgroundGlowThree} />
      </View>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              selectedSlot && isMobile
                ? 34
                : 28,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.violet600}
            colors={[COLORS.violet600]}
          />
        }
      >
        <View
          style={[
            styles.contentContainer,
            {
              paddingHorizontal:
                horizontalPadding,
              maxWidth: maxContentWidth,
            },
          ]}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <View
            style={[
              styles.header,
              {
                marginBottom: isSmallMobile
                  ? 20
                  : isMobile
                  ? 26
                  : 34,
              },
            ]}
          >
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={isSmallMobile ? 18 : 20}
                color={COLORS.slate700}
              />
            </Pressable>

            <View style={styles.headerContent}>
              <View style={styles.stepBadge}>
                <View style={styles.stepBadgeDot} />

                <Text style={styles.stepBadgeText}>
                  STEP 3 OF 4
                </Text>
              </View>

              <Text
                style={[
                  styles.pageTitle,
                  {
                    fontSize: isSmallMobile
                      ? 28
                      : isMobile
                      ? 31
                      : isTablet
                      ? 38
                      : 46,
                  },
                ]}
              >
                Choose date & time
              </Text>

              <Text style={styles.pageSubtitle}>
                Pick a date and an available appointment
                slot that works best for you.
              </Text>
            </View>
          </View>

          {/* =================================================
              PROGRESS STEPPER
          ================================================= */}

          <View style={styles.progressCard}>
            <ProgressStep
              number="✓"
              label="Service"
              completed
              compact={isSmallMobile}
            />

            <View
              style={[
                styles.progressLine,
                styles.progressLineActive,
              ]}
            />

            <ProgressStep
              number="✓"
              label="Stylist"
              completed
              compact={isSmallMobile}
            />

            <View style={styles.progressLine} />

            <ProgressStep
              number="3"
              label="Date & Time"
              active
              compact={isSmallMobile}
            />

            <View style={styles.progressLine} />

            <ProgressStep
              number="4"
              label="Confirm"
              compact={isSmallMobile}
            />
          </View>

          {/* =================================================
              SELECTED STAFF + SERVICE
          ================================================= */}

          <View
            style={[
              styles.selectionRow,
              {
                flexDirection:
                  isTablet || isLaptop || isLargeDesktop
                    ? "row"
                    : "column",
              },
            ]}
          >
            {/* STAFF */}

            <InfoCard
              icon="person-outline"
              iconBackground={COLORS.violet50}
              iconColor={COLORS.violet600}
              eyebrow="SELECTED STYLIST"
              title={
                staff?.name ||
                "Selected Stylist"
              }
              subtitle={staffSpecialization}
              accent={COLORS.violet500}
              containerStyle={
                isTablet ||
                isLaptop ||
                isLargeDesktop
                  ? styles.infoCardHalf
                  : styles.infoCardFull
              }
            />

            {/* SERVICE */}

            <InfoCard
              icon="cut-outline"
              iconBackground={COLORS.fuchsia50}
              iconColor={COLORS.fuchsia600}
              eyebrow="SELECTED SERVICE"
              title={
                service?.name ||
                "Selected Service"
              }
              subtitle={
                salon?.name || "Selected Salon"
              }
              accent={COLORS.fuchsia500}
              containerStyle={
                isTablet ||
                isLaptop ||
                isLargeDesktop
                  ? styles.infoCardHalf
                  : styles.infoCardFull
              }
            />
          </View>

          {/* =================================================
              DATE CARD
          ================================================= */}

          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[
                COLORS.violet600,
                COLORS.violet500,
                COLORS.fuchsia500,
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.topAccent}
            />

            <View style={styles.decorativeGlow} />

            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={COLORS.violet600}
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Select appointment date
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Choose a date to see available slots.
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>
              APPOINTMENT DATE
            </Text>

            <View
              style={[
                styles.dateInputWrapper,
                {
                  maxWidth:
                    isMobile
                      ? "100%"
                      : 520,
                },
              ]}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={COLORS.violet600}
                style={styles.dateInputIcon}
              />

              {Platform.OS === "web" ? (
                <DateInputWeb
                  value={selectedDate}
                  min={minDate}
                  onChange={setSelectedDate}
                />
              ) : (
                <Pressable
                  onPress={() => {
                    /*
                      Native date picker can be plugged here.

                      Current UI intentionally avoids using
                      a web-only input inside React Native.
                    */
                  }}
                  style={styles.nativeDatePlaceholder}
                >
                  <Text
                    style={[
                      styles.nativeDateText,
                      !selectedDate &&
                        styles.nativeDatePlaceholderText,
                    ]}
                  >
                    {selectedDate
                      ? formatDate(selectedDate)
                      : "Select appointment date"}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* SELECTED DATE */}

            {selectedDate ? (
              <View style={styles.selectedDateCard}>
                <View style={styles.selectedDateIcon}>
                  <Ionicons
                    name="checkmark"
                    size={15}
                    color={COLORS.violet700}
                  />
                </View>

                <View
                  style={
                    styles.selectedDateContent
                  }
                >
                  <Text
                    style={
                      styles.selectedDateLabel
                    }
                  >
                    SELECTED DATE
                  </Text>

                  <Text
                    style={
                      styles.selectedDateText
                    }
                  >
                    {formatDate(selectedDate)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* =================================================
              AVAILABILITY CARD
          ================================================= */}

          {selectedDate ? (
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={[
                  COLORS.fuchsia500,
                  COLORS.violet500,
                  COLORS.violet600,
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={styles.topAccent}
              />

              <View style={styles.availabilityGlow} />

              {/* HEADER */}

              <View style={styles.availabilityHeader}>
                <View
                  style={
                    styles.availabilityHeaderLeft
                  }
                >
                  <View style={styles.slotIconBox}>
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={COLORS.violet600}
                    />
                  </View>

                  <View
                    style={
                      styles.availabilityHeaderText
                    }
                  >
                    <View
                      style={
                        styles.titleWithBadge
                      }
                    >
                      <Text
                        style={
                          styles.sectionTitle
                        }
                      >
                        Available time slots
                      </Text>

                      {availability?.available ? (
                        <View
                          style={
                            styles.availableBadge
                          }
                        >
                          <View
                            style={
                              styles.availableDot
                            }
                          />

                          <Text
                            style={
                              styles.availableBadgeText
                            }
                          >
                            AVAILABLE
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text
                      style={
                        styles.sectionSubtitle
                      }
                    >
                      {availability?.workingHours
                        ? `${availability.workingHours.startTime} - ${availability.workingHours.endTime}`
                        : availabilityLoading
                        ? "Checking working hours..."
                        : "Working hours unavailable"}
                    </Text>
                  </View>
                </View>

                {availabilityLoading ? (
                  <View
                    style={
                      styles.headerLoader
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color={COLORS.violet600}
                    />
                  </View>
                ) : null}
              </View>

              {/* ERROR */}

              {error ? (
                <View style={styles.errorCard}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color={COLORS.red600}
                    />
                  </View>

                  <View
                    style={styles.errorContent}
                  >
                    <Text
                      style={styles.errorEyebrow}
                    >
                      SOMETHING WENT WRONG
                    </Text>

                    <Text
                      style={styles.errorText}
                    >
                      {error}
                    </Text>

                    <Pressable
                      onPress={() =>
                        fetchAvailability(
                          selectedDate
                        )
                      }
                      style={({ pressed }) => [
                        styles.retryButton,
                        pressed &&
                          styles.pressedButton,
                      ]}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={15}
                        color={COLORS.red700}
                      />

                      <Text
                        style={
                          styles.retryButtonText
                        }
                      >
                        Try again
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* UNAVAILABLE */}

              {!availabilityLoading &&
              availability &&
              !availability.available ? (
                <View style={styles.unavailableCard}>
                  <View
                    style={
                      styles.unavailableIcon
                    }
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={21}
                      color={COLORS.amber600}
                    />
                  </View>

                  <View
                    style={
                      styles.unavailableContent
                    }
                  >
                    <Text
                      style={
                        styles.unavailableTitle
                      }
                    >
                      Stylist unavailable
                    </Text>

                    <Text
                      style={
                        styles.unavailableText
                      }
                    >
                      {availability.reason ||
                        "This stylist is not available on the selected date."}
                    </Text>
                  </View>
                </View>
              ) : null}

              {/* SLOTS LOADING */}

              {availability?.available &&
              slotsLoading ? (
                <View style={styles.loadingSlotsCard}>
                  <View
                    style={
                      styles.loadingSpinnerCard
                    }
                  >
                    <ActivityIndicator
                      size="small"
                      color={COLORS.violet600}
                    />
                  </View>

                  <Text
                    style={
                      styles.loadingSlotsTitle
                    }
                  >
                    Finding available slots...
                  </Text>

                  <Text
                    style={
                      styles.loadingSlotsSubtitle
                    }
                  >
                    Checking appointments and working
                    hours
                  </Text>
                </View>
              ) : null}

              {/* AVAILABLE SLOTS */}

              {availability?.available &&
              !slotsLoading &&
              slots.length > 0 ? (
                <View>
                  <View
                    style={
                      styles.slotSummaryRow
                    }
                  >
                    <View
                      style={
                        styles.slotCountBadge
                      }
                    >
                      <View
                        style={
                          styles.slotCountDot
                        }
                      />

                      <Text
                        style={
                          styles.slotCountText
                        }
                      >
                        {slots.length} available{" "}
                        {slots.length === 1
                          ? "slot"
                          : "slots"}
                      </Text>
                    </View>

                    {!isSmallMobile ? (
                      <Text
                        style={
                          styles.slotInstruction
                        }
                      >
                        Select your preferred time
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.slotsGrid,
                      {
                        gap: isSmallMobile
                          ? 9
                          : 11,
                      },
                    ]}
                  >
                    {slots.map(
                      (slot, index) => {
                        const slotLabel =
                          getSlotLabel(slot);

                        const selected =
                          isSameSlot(
                            selectedSlot,
                            slot
                          );

                        return (
                          <SlotButton
                            key={`${getSlotValue(
                              slot
                            )}-${index}`}
                            slot={slot}
                            label={slotLabel}
                            selected={selected}
                            width={
                              slotColumns === 2
                                ? "48%"
                                : slotColumns === 4
                                ? "23.7%"
                                : slotColumns === 5
                                ? "19%"
                                : "15.6%"
                            }
                            onPress={() =>
                              setSelectedSlot(
                                slot
                              )
                            }
                            small={
                              isSmallMobile
                            }
                          />
                        );
                      }
                    )}
                  </View>
                </View>
              ) : null}

              {/* NO SLOTS */}

              {availability?.available &&
              !slotsLoading &&
              !error &&
              slots.length === 0 ? (
                <View
                  style={
                    styles.noSlotsCard
                  }
                >
                  <View
                    style={
                      styles.noSlotsIcon
                    }
                  >
                    <Ionicons
                      name="time-outline"
                      size={23}
                      color={COLORS.slate400}
                    />
                  </View>

                  <Text
                    style={
                      styles.noSlotsTitle
                    }
                  >
                    No slots available
                  </Text>

                  <Text
                    style={
                      styles.noSlotsText
                    }
                  >
                    This stylist is working on this
                    day, but all appointment slots are
                    already booked.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            /* =================================================
               DATE EMPTY STATE
            ================================================= */

            <View style={styles.dateHintCard}>
              <View style={styles.dateHintIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={COLORS.violet600}
                />
              </View>

              <View
                style={styles.dateHintContent}
              >
                <Text
                  style={styles.dateHintTitle}
                >
                  Choose a date to continue
                </Text>

                <Text
                  style={styles.dateHintText}
                >
                  Once you select a date, we will check
                  the stylist's working hours and show
                  all available appointment slots.
                </Text>
              </View>
            </View>
          )}

          {/* =================================================
              SELECTED BOOKING SUMMARY
          ================================================= */}

          {selectedDate &&
          availability?.available &&
          selectedSlot ? (
            <View style={styles.bookingSummaryCard}>
              <LinearGradient
                colors={[
                  COLORS.violet700,
                  COLORS.violet600,
                  COLORS.fuchsia600,
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 1,
                }}
                style={styles.bookingGradient}
              >
                <View
                  style={
                    styles.bookingGlow
                  }
                />

                <View
                  style={
                    styles.bookingContent
                  }
                >
                  <View
                    style={
                      styles.bookingInfo
                    }
                  >
                    <View
                      style={
                        styles.bookingCheck
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={COLORS.white}
                      />
                    </View>

                    <View
                      style={
                        styles.bookingTextWrap
                      }
                    >
                      <Text
                        style={
                          styles.bookingEyebrow
                        }
                      >
                        SELECTED APPOINTMENT
                      </Text>

                      <Text
                        style={
                          styles.bookingSlot
                        }
                      >
                        {selectedSlotLabel}
                      </Text>

                      <Text
                        style={
                          styles.bookingDate
                        }
                      >
                        {formatDate(
                          selectedDate
                        )}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={clearSelectedSlot}
                    style={({ pressed }) => [
                      styles.clearBookingButton,
                      pressed &&
                        styles.bookingPressed,
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={COLORS.white}
                    />
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleContinue}
                  disabled={!selectedSlot}
                  style={({ pressed }) => [
                    styles.continueButton,
                    pressed &&
                      styles.continuePressed,
                  ]}
                >
                  <Text
                    style={
                      styles.continueButtonText
                    }
                  >
                    Continue to confirmation
                  </Text>

                  <View
                    style={
                      styles.continueArrow
                    }
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={COLORS.slate950}
                    />
                  </View>
                </Pressable>
              </LinearGradient>
            </View>
          ) : null}

          {/* =================================================
              FOOTER
          ================================================= */}

          <View style={styles.footerWrapper}>
            <CustomerFooter />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ===========================================================
   PROGRESS STEP
=========================================================== */

const ProgressStep = ({
  number,
  label,
  completed = false,
  active = false,
  compact = false,
}) => {
  return (
    <View
      style={[
        styles.progressStep,
        compact && styles.progressStepCompact,
      ]}
    >
      <View
        style={[
          styles.progressCircle,
          completed &&
            styles.progressCircleCompleted,
          active && styles.progressCircleActive,
        ]}
      >
        <Text
          style={[
            styles.progressNumber,
            completed &&
              styles.progressNumberCompleted,
            active &&
              styles.progressNumberActive,
          ]}
        >
          {number}
        </Text>
      </View>

      {!compact ? (
        <Text
          numberOfLines={2}
          style={[
            styles.progressLabel,
            completed &&
              styles.progressLabelCompleted,
            active &&
              styles.progressLabelActive,
          ]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
};

/* ===========================================================
   INFO CARD
=========================================================== */

const InfoCard = ({
  icon,
  iconBackground,
  iconColor,
  eyebrow,
  title,
  subtitle,
  accent,
  containerStyle,
}) => {
  return (
    <View
      style={[
        styles.infoCard,
        containerStyle,
      ]}
    >
      <View
        style={[
          styles.infoCardAccent,
          {
            backgroundColor: accent,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.infoCardGlow,
          {
            backgroundColor: accent,
          },
        ]}
      />

      <View style={styles.infoCardInner}>
        <View
          style={[
            styles.infoIcon,
            {
              backgroundColor:
                iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={iconColor}
          />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoEyebrow}>
            {eyebrow}
          </Text>

          <Text
            numberOfLines={3}
            style={styles.infoTitle}
          >
            {title}
          </Text>

          <Text
            numberOfLines={4}
            style={styles.infoSubtitle}
          >
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};

/* ===========================================================
   SLOT BUTTON
=========================================================== */

const SlotButton = ({
  slot,
  label,
  selected,
  width,
  onPress,
  small,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.slotButton,
        {
          width,
          minHeight: small ? 82 : 92,
        },
        selected
          ? styles.slotButtonSelected
          : styles.slotButtonNormal,
        pressed &&
          (selected
            ? styles.slotSelectedPressed
            : styles.slotPressed),
      ]}
    >
      {selected ? (
        <LinearGradient
          colors={[
            COLORS.violet700,
            COLORS.violet600,
            COLORS.fuchsia600,
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 1,
          }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {selected ? (
        <View
          pointerEvents="none"
          style={styles.slotSelectedGlow}
        />
      ) : null}

      <View
        style={[
          styles.slotClock,
          selected &&
            styles.slotClockSelected,
        ]}
      >
        <Ionicons
          name="time-outline"
          size={15}
          color={
            selected
              ? COLORS.white
              : COLORS.violet600
          }
        />
      </View>

      <Text
        numberOfLines={3}
        style={[
          styles.slotLabel,
          selected &&
            styles.slotLabelSelected,
        ]}
      >
        {label}
      </Text>

      {selected ? (
        <View style={styles.slotCheck}>
          <Ionicons
            name="checkmark"
            size={11}
            color={COLORS.white}
          />
        </View>
      ) : null}
    </Pressable>
  );
};

/* ===========================================================
   WEB DATE INPUT
=========================================================== */

const DateInputWeb = ({
  value,
  min,
  onChange,
}) => {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.webDateInputContainer}>
      {React.createElement("input", {
        type: "date",
        value: value,
        min: min,
        onChange: (event) =>
          onChange(
            event?.target?.value || ""
          ),
        style: {
          width: "100%",
          height: 52,
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          color: COLORS.slate800,
          fontSize: 14,
          fontWeight: "700",
          fontFamily:
            Platform.OS === "web"
              ? "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
              : undefined,
          paddingLeft: 42,
          paddingRight: 12,
          boxSizing: "border-box",
        },
      })}
    </View>
  );
};

/* ===========================================================
   STYLES
=========================================================== */

const styles = StyleSheet.create({
  /* =======================================================
     ROOT
  ======================================================= */

  root: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    width: "100%",
    alignItems: "center",
  },

  contentContainer: {
    width: "100%",
    alignSelf: "center",
    paddingTop: 20,
  },

  /* =======================================================
     BACKGROUND
  ======================================================= */

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },

  backgroundGlowOne: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    left: -210,
    top: -180,
    backgroundColor: "rgba(139,92,246,0.09)",
  },

  backgroundGlowTwo: {
    position: "absolute",
    width: 440,
    height: 440,
    borderRadius: 220,
    right: -220,
    top: 260,
    backgroundColor: "rgba(217,70,239,0.06)",
  },

  backgroundGlowThree: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    left: "30%",
    bottom: -250,
    backgroundColor: "rgba(167,139,250,0.05)",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 3,
  },

  pressedButton: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  stepBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.violet50,
    borderWidth: 1,
    borderColor: COLORS.violet200,
    marginBottom: 9,
  },

  stepBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.violet600,
    marginRight: 7,
  },

  stepBadgeText: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: COLORS.violet700,
  },

  pageTitle: {
    width: "100%",
    flexShrink: 1,
    color: COLORS.slate950,
    fontWeight: "900",
    letterSpacing: -1.1,
    lineHeight: 52,
  },

  pageSubtitle: {
    width: "100%",
    maxWidth: 720,
    marginTop: 9,
    color: COLORS.slate500,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },

  /* =======================================================
     PROGRESS
  ======================================================= */

  progressCard: {
    width: "100%",
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 13,
    marginBottom: 22,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.055,
    shadowRadius: 30,
    elevation: 3,
  },

  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    flexShrink: 1,
    gap: 8,
  },

  progressStepCompact: {
    flex: 0,
  },

  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },

  progressCircleCompleted: {
    borderWidth: 0,
    backgroundColor: COLORS.violet600,
  },

  progressCircleActive: {
    borderWidth: 2,
    borderColor: COLORS.violet300,
    backgroundColor: COLORS.violet50,
  },

  progressNumber: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.slate400,
  },

  progressNumberCompleted: {
    color: COLORS.white,
  },

  progressNumberActive: {
    color: COLORS.violet700,
  },

  progressLabel: {
    maxWidth: 90,
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    color: COLORS.slate400,
  },

  progressLabelCompleted: {
    color: COLORS.violet700,
  },

  progressLabelActive: {
    color: COLORS.violet700,
  },

  progressLine: {
    flex: 1,
    height: 1,
    minWidth: 5,
    marginHorizontal: 6,
    backgroundColor: COLORS.slate200,
  },

  progressLineActive: {
    backgroundColor: COLORS.violet300,
  },

  /* =======================================================
     INFO CARDS
  ======================================================= */

  selectionRow: {
    width: "100%",
    gap: 14,
    marginBottom: 20,
  },

  infoCardFull: {
    width: "100%",
  },

  infoCardHalf: {
    flex: 1,
    minWidth: 0,
  },

  infoCard: {
    position: "relative",
    minHeight: 124,
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.055,
    shadowRadius: 30,
    elevation: 3,
  },

  infoCardAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },

  infoCardGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -65,
    top: -65,
    opacity: 0.08,
  },

  infoCardInner: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 18,
    gap: 13,
  },

  infoIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: COLORS.slate400,
    marginBottom: 4,
  },

  infoTitle: {
    width: "100%",
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.slate950,
  },

  infoSubtitle: {
    width: "100%",
    flexShrink: 1,
    marginTop: 4,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    color: COLORS.slate500,
  },

  /* =======================================================
     SECTION CARD
  ======================================================= */

  sectionCard: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.91)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.96)",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 17,
    },
    shadowOpacity: 0.06,
    shadowRadius: 34,
    elevation: 4,
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  decorativeGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -110,
    top: -105,
    backgroundColor: "rgba(139,92,246,0.07)",
  },

  availabilityGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -120,
    top: 120,
    backgroundColor: "rgba(139,92,246,0.045)",
  },

  /* =======================================================
     SECTION HEADER
  ======================================================= */

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    marginBottom: 22,
  },

  sectionIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.violet50,
    borderWidth: 1,
    borderColor: COLORS.violet100,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.slate950,
  },

  sectionSubtitle: {
    flexShrink: 1,
    marginTop: 3,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    color: COLORS.slate500,
  },

  inputLabel: {
    marginBottom: 8,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.25,
    color: COLORS.slate400,
  },

  /* =======================================================
     DATE INPUT
  ======================================================= */

  dateInputWrapper: {
    position: "relative",
    width: "100%",
    height: 54,
    overflow: "hidden",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate50,
  },

  dateInputIcon: {
    position: "absolute",
    zIndex: 5,
    left: 16,
    top: 17,
  },

  webDateInputContainer: {
    width: "100%",
    height: "100%",
  },

  nativeDatePlaceholder: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 48,
    paddingRight: 14,
  },

  nativeDateText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.slate800,
  },

  nativeDatePlaceholderText: {
    color: COLORS.slate400,
  },

  selectedDateCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 13,
    borderRadius: 17,
    backgroundColor: COLORS.violet50,
    borderWidth: 1,
    borderColor: COLORS.violet100,
    gap: 11,
  },

  selectedDateIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.white,
  },

  selectedDateContent: {
    flex: 1,
    minWidth: 0,
  },

  selectedDateLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.violet500,
  },

  selectedDateText: {
    marginTop: 2,
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
    color: COLORS.violet700,
  },

  /* =======================================================
     DATE HINT
  ======================================================= */

  dateHintCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    padding: 19,
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: "rgba(245,243,255,0.72)",
    borderWidth: 1,
    borderColor: COLORS.violet100,
  },

  dateHintIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.white,
  },

  dateHintContent: {
    flex: 1,
    minWidth: 0,
  },

  dateHintTitle: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  dateHintText: {
    marginTop: 4,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.slate500,
    fontWeight: "500",
  },

  /* =======================================================
     AVAILABILITY HEADER
  ======================================================= */

  availabilityHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },

  availabilityHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  slotIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.violet50,
    borderWidth: 1,
    borderColor: COLORS.violet100,
  },

  availabilityHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  titleWithBadge: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.emerald50,
    borderWidth: 1,
    borderColor: COLORS.emerald100,
  },

  availableDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
    backgroundColor: COLORS.emerald500,
  },

  availableBadgeText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: COLORS.emerald700,
  },

  headerLoader: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.violet50,
  },

  /* =======================================================
     ERROR
  ======================================================= */

  errorCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    marginBottom: 17,
    borderRadius: 18,
    backgroundColor: COLORS.red50,
    borderWidth: 1,
    borderColor: COLORS.red100,
  },

  errorIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.white,
  },

  errorContent: {
    flex: 1,
    minWidth: 0,
  },

  errorEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: COLORS.red500,
  },

  errorText: {
    marginTop: 3,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.red700,
  },

  retryButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.red100,
  },

  retryButtonText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.red700,
  },

  /* =======================================================
     UNAVAILABLE
  ======================================================= */

  unavailableCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 17,
    borderRadius: 20,
    backgroundColor: COLORS.amber50,
    borderWidth: 1,
    borderColor: COLORS.amber100,
  },

  unavailableIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.white,
  },

  unavailableContent: {
    flex: 1,
    minWidth: 0,
  },

  unavailableTitle: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    color: COLORS.amber900,
  },

  unavailableText: {
    marginTop: 4,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: COLORS.amber700,
  },

  /* =======================================================
     LOADING SLOTS
  ======================================================= */

  loadingSlotsCard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 46,
    paddingHorizontal: 20,
    borderRadius: 22,
    backgroundColor: "rgba(245,243,255,0.75)",
    borderWidth: 1,
    borderColor: COLORS.violet100,
  },

  loadingSpinnerCard: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,

    shadowColor: COLORS.violet600,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },

  loadingSlotsTitle: {
    marginTop: 14,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    color: COLORS.slate700,
  },

  loadingSlotsSubtitle: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    color: COLORS.slate400,
    fontWeight: "600",
  },

  /* =======================================================
     SLOT SUMMARY
  ======================================================= */

  slotSummaryRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 13,
  },

  slotCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.emerald50,
    borderWidth: 1,
    borderColor: COLORS.emerald100,
  },

  slotCountDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: COLORS.emerald500,
  },

  slotCountText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.emerald700,
  },

  slotInstruction: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.slate400,
  },

  /* =======================================================
     SLOT GRID
  ======================================================= */

  slotsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  slotButton: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 17,
    borderWidth: 1,
  },

  slotButtonNormal: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.slate200,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 10,
    elevation: 1,
  },

  slotButtonSelected: {
    borderColor: COLORS.violet600,

    shadowColor: COLORS.violet600,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 4,
  },

  slotPressed: {
    transform: [
      {
        scale: 0.975,
      },
    ],
    backgroundColor: COLORS.violet50,
  },

  slotSelectedPressed: {
    transform: [
      {
        scale: 0.975,
      },
    ],
  },

  slotSelectedGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    right: -35,
    top: -35,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  slotClock: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
    backgroundColor: COLORS.violet50,
  },

  slotClockSelected: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  slotLabel: {
    width: "100%",
    flexShrink: 1,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: COLORS.slate800,
  },

  slotLabelSelected: {
    color: COLORS.white,
  },

  slotCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
  },

  /* =======================================================
     NO SLOTS
  ======================================================= */

  noSlotsCard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate200,
  },

  noSlotsIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },

  noSlotsTitle: {
    marginTop: 13,
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: COLORS.slate800,
  },

  noSlotsText: {
    width: "100%",
    maxWidth: 560,
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.slate500,
  },

  /* =======================================================
     BOOKING SUMMARY
  ======================================================= */

  bookingSummaryCard: {
    width: "100%",
    overflow: "hidden",
    marginBottom: 24,
    borderRadius: 28,

    shadowColor: COLORS.violet700,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.18,
    shadowRadius: 35,
    elevation: 7,
  },

  bookingGradient: {
    width: "100%",
    padding: 16,
    overflow: "hidden",
  },

  bookingGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -100,
    top: -120,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  bookingContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  bookingInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  bookingCheck: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  bookingTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  bookingEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.15,
    color: "rgba(255,255,255,0.72)",
  },

  bookingSlot: {
    marginTop: 3,
    flexShrink: 1,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.white,
  },

  bookingDate: {
    marginTop: 3,
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.78)",
  },

  clearBookingButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  bookingPressed: {
    opacity: 0.7,
  },

  continueButton: {
    width: "100%",
    minHeight: 52,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: COLORS.white,
  },

  continuePressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  continueButtonText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    color: COLORS.slate950,
  },

  continueArrow: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.violet100,
  },

  /* =======================================================
     FOOTER
  ======================================================= */

  footerWrapper: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default CustomerStaffDateSlots;