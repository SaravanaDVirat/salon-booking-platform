import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  createCustomerAppointment,
} from "../../../../../../../../../services/CustomerAppointmentService";

import {
  getCustomerSalonById,
  getCustomerSalonServices,
  getCustomerStaffByService,
} from "../../../../../../../../../services/customerSalonService";

import CustomerFooter from "../../../../../../../../../components/customers/CustomerFooter";

const COLORS = {
  background: "#F7F7FB",
  white: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F8F7FA",

  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  primarySoft: "#F3E8FF",

  text: "#111827",
  textDark: "#0F172A",
  textMedium: "#475569",
  textSoft: "#64748B",
  textMuted: "#94A3B8",

  border: "#E5E7EB",
  borderSoft: "#EEF0F4",

  red: "#DC2626",
  redSoft: "#FEF2F2",

  amber: "#D97706",
  amberSoft: "#FFFBEB",

  green: "#16A34A",
  greenSoft: "#F0FDF4",

  violetLight: "#DDD6FE",
  violetLighter: "#F5F3FF",

  dark: "#0F172A",
};

const parseRouteValue = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const parseJsonParam = (value) => {
  const parsedValue = parseRouteValue(value);

  if (!parsedValue) {
    return null;
  }

  try {
    return JSON.parse(parsedValue);
  } catch {
    return null;
  }
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  try {
    const date = new Date(`${value}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const CustomerAppointmentConfirm = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const params = useLocalSearchParams();

  const salonId = parseRouteValue(params.salonId);
  const serviceId = parseRouteValue(params.serviceId);
  const staffId = parseRouteValue(params.staffId);

  const date = parseRouteValue(params.date);

  const startTimeParam =
    parseRouteValue(params.startTime) ||
    parseRouteValue(params.time);

  const endTimeParam =
    parseRouteValue(params.endTime) || "";

  const salonParam = parseJsonParam(params.salon);
  const serviceParam = parseJsonParam(params.service);
  const staffParam = parseJsonParam(params.staff);
  const slotParam = parseJsonParam(params.slot);

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

  const contentMaxWidth = 1450;

  const [salon, setSalon] = useState(salonParam || null);
  const [service, setService] = useState(serviceParam || null);
  const [staff, setStaff] = useState(staffParam || null);

  const [notes, setNotes] = useState("");

  const [loadingContext, setLoadingContext] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  const [error, setError] = useState("");

  const routeSlot = useMemo(() => {
    if (slotParam && typeof slotParam === "object") {
      return slotParam;
    }

    return {
      startTime:
        startTimeParam ||
        "",
      endTime:
        endTimeParam ||
        "",
    };
  }, [slotParam, startTimeParam, endTimeParam]);

  const startTime =
    typeof routeSlot === "string"
      ? routeSlot
      : routeSlot?.startTime ||
        routeSlot?.time ||
        startTimeParam ||
        "";

  const endTime =
    typeof routeSlot === "object"
      ? routeSlot?.endTime || endTimeParam || ""
      : endTimeParam || "";

  const hasBasicBookingInfo =
    Boolean(
      salonId &&
        serviceId &&
        staffId &&
        date &&
        startTime
    );

  const hasDisplayData =
    Boolean(
      salon &&
        service &&
        staff
    );

  useEffect(() => {
    let mounted = true;

    const hydrateBookingContext = async () => {
      if (!salonId || !serviceId || !staffId) {
        return;
      }

      if (
        salonParam &&
        serviceParam &&
        staffParam
      ) {
        return;
      }

      try {
        setLoadingContext(true);
        setError("");

        const [
          salonResponse,
          servicesResponse,
          staffResponse,
        ] = await Promise.all([
          salonParam
            ? Promise.resolve(salonParam)
            : getCustomerSalonById(salonId),

          serviceParam
            ? Promise.resolve({
                services: [serviceParam],
              })
            : getCustomerSalonServices(salonId),

          staffParam
            ? Promise.resolve({
                staff: [staffParam],
              })
            : getCustomerStaffByService(
                salonId,
                serviceId
              ),
        ]);

        if (!mounted) {
          return;
        }

        const salonData =
          salonResponse?.salon ||
          salonResponse?.data?.salon ||
          salonResponse;

        const serviceList =
          servicesResponse?.services ||
          servicesResponse?.data?.services ||
          [];

        const staffList =
          staffResponse?.staff ||
          staffResponse?.data?.staff ||
          [];

        const foundService =
          serviceList.find(
            (item) =>
              String(item?._id) === String(serviceId)
          ) ||
          serviceParam ||
          null;

        const foundStaff =
          staffList.find(
            (item) =>
              String(item?._id) === String(staffId)
          ) ||
          staffParam ||
          null;

        setSalon(salonData || null);
        setService(foundService);
        setStaff(foundStaff);
      } catch (err) {
        console.error(
          "Appointment context error:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            "Unable to load booking information."
        );
      } finally {
        if (mounted) {
          setLoadingContext(false);
        }
      }
    };

    hydrateBookingContext();

    return () => {
      mounted = false;
    };
  }, [
    salonId,
    serviceId,
    staffId,
    salonParam,
    serviceParam,
    staffParam,
  ]);

  const handleBack = () => {
    router.back();
  };

  const handleBooking = async () => {
    if (
      !salonId ||
      !serviceId ||
      !staffId ||
      !date ||
      !startTime
    ) {
      setError(
        "Appointment information is incomplete. Please go back and select the date and time again."
      );

      return;
    }

    try {
      setLoadingBooking(true);
      setError("");

      const response =
        await createCustomerAppointment({
          salonId,
          serviceId,
          staffId,
          appointmentDate: date,
          startTime,
          notes: notes.trim(),
        });

      const appointment =
        response?.appointment;

      if (appointment?._id) {
        router.replace({
          pathname:
            "/customer/appointments/[appointmentId]",
          params: {
            appointmentId:
              appointment._id,
            bookingSuccess: "true",
          },
        });

        return;
      }

      router.replace("/customer/appointments");
    } catch (err) {
      console.error(
        "Booking error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to book appointment. Please try again."
      );
    } finally {
      setLoadingBooking(false);
    }
  };

  if (
    !hasBasicBookingInfo ||
    (!loadingContext && !hasDisplayData)
  ) {
    return (
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.missingScrollContent,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.missingContainer,
              {
                maxWidth:
                  isDesktop
                    ? 700
                    : 620,
              },
            ]}
          >
            <View style={styles.missingGlowOne} />
            <View style={styles.missingGlowTwo} />

            <View style={styles.missingIcon}>
              <Ionicons
                name="location-outline"
                size={
                  isSmallMobile ? 26 : 32
                }
                color={COLORS.red}
              />
            </View>

            <Text
              style={[
                styles.missingEyebrow,
                isSmallMobile &&
                  styles.missingEyebrowSmall,
              ]}
            >
              BOOKING UNAVAILABLE
            </Text>

            <Text
              style={[
                styles.missingTitle,
                isSmallMobile &&
                  styles.missingTitleSmall,
              ]}
            >
              Booking information missing
            </Text>

            <Text
              style={[
                styles.missingDescription,
                isSmallMobile &&
                  styles.missingDescriptionSmall,
              ]}
            >
              Please go back and select the
              service, stylist, date and time
              again.
            </Text>

            {loadingContext && (
              <View
                style={styles.contextLoading}
              >
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />

                <Text
                  style={styles.contextLoadingText}
                >
                  Loading booking information...
                </Text>
              </View>
            )}

            {!loadingContext && error ? (
              <Text
                style={[
                  styles.missingError,
                  isSmallMobile &&
                    styles.missingErrorSmall,
                ]}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.missingBackButton,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={
                  isSmallMobile ? 16 : 18
                }
                color={COLORS.white}
              />

              <Text
                style={[
                  styles.missingBackText,
                  isSmallMobile &&
                    styles.missingBackTextSmall,
                ]}
              >
                Go Back
              </Text>
            </Pressable>
          </View>

          <View
            style={{
              width: "100%",
              maxWidth: contentMaxWidth,
            }}
          >
            <CustomerFooter />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={[
            styles.pageContainer,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          {/* HEADER */}

          <View
            style={[
              styles.pageHeader,
              isSmallMobile &&
                styles.pageHeaderSmall,
            ]}
          >
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.headerBackButton,
                isSmallMobile &&
                  styles.headerBackButtonSmall,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <Ionicons
                name="arrow-back"
                size={
                  isSmallMobile ? 17 : 19
                }
                color={COLORS.textMedium}
              />
            </Pressable>

            <View
              style={styles.headerContent}
            >
              <View
                style={[
                  styles.headerMeta,
                  isSmallMobile &&
                    styles.headerMetaSmall,
                ]}
              >
                <Text
                  style={[
                    styles.headerMetaPrimary,
                    isSmallMobile &&
                      styles.headerMetaPrimarySmall,
                  ]}
                >
                  FINAL STEP
                </Text>

                <View
                  style={styles.metaDot}
                />

                <Text
                  style={[
                    styles.headerMetaSecondary,
                    isSmallMobile &&
                      styles.headerMetaSecondarySmall,
                  ]}
                >
                  REVIEW & CONFIRM
                </Text>
              </View>

              <Text
                style={[
                  styles.pageTitle,
                  isSmallMobile &&
                    styles.pageTitleSmall,
                  isMediumMobile &&
                    styles.pageTitleMedium,
                  isLargeMobile &&
                    styles.pageTitleLarge,
                  isTablet &&
                    styles.pageTitleTablet,
                  isDesktop &&
                    styles.pageTitleDesktop,
                ]}
              >
                Confirm your appointment
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
                Review your booking details
                before confirming your
                appointment.
              </Text>
            </View>
          </View>

          {/* DESKTOP / TABLET / MOBILE CONTENT */}

          <View
            style={[
              styles.mainLayout,
              isDesktop &&
                styles.mainLayoutDesktop,
            ]}
          >
            {/* LEFT */}

            <View
              style={[
                styles.leftColumn,
                isDesktop &&
                  styles.leftColumnDesktop,
              ]}
            >
              {/* SALON CARD */}

              <View
                style={[
                  styles.card,
                  isSmallMobile &&
                    styles.cardSmall,
                ]}
              >
                <View
                  style={styles.cardTopLine}
                />

                <View
                  style={styles.salonRow}
                >
                  <View
                    style={[
                      styles.salonIcon,
                      isSmallMobile &&
                        styles.salonIconSmall,
                    ]}
                  >
                    <Ionicons
                      name="location"
                      size={
                        isSmallMobile
                          ? 19
                          : 22
                      }
                      color={COLORS.primary}
                    />
                  </View>

                  <View
                    style={
                      styles.salonTextBlock
                    }
                  >
                    <Text
                      style={[
                        styles.overline,
                        isSmallMobile &&
                          styles.overlineSmall,
                      ]}
                    >
                      SALON
                    </Text>

                    <Text
                      style={[
                        styles.salonName,
                        isSmallMobile &&
                          styles.salonNameSmall,
                      ]}
                      numberOfLines={2}
                    >
                      {salon?.name ||
                        "Salon"}
                    </Text>

                    {salon?.city ? (
                      <Text
                        style={[
                          styles.salonCity,
                          isSmallMobile &&
                            styles.salonCitySmall,
                        ]}
                        numberOfLines={2}
                      >
                        {salon.city}
                      </Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.selectedBadge,
                      isSmallMobile &&
                        styles.selectedBadgeSmall,
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={
                        isSmallMobile
                          ? 11
                          : 12
                      }
                      color={COLORS.primary}
                    />

                    {!isSmallMobile ? (
                      <Text
                        style={
                          styles.selectedBadgeText
                        }
                      >
                        SELECTED
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* APPOINTMENT DETAILS */}

              <View
                style={[
                  styles.card,
                  isSmallMobile &&
                    styles.cardSmall,
                ]}
              >
                <View
                  style={styles.cardGlow}
                />

                <View
                  style={styles.sectionHeader}
                >
                  <View
                    style={
                      styles.sectionHeaderText
                    }
                  >
                    <Text
                      style={[
                        styles.sectionEyebrow,
                        isSmallMobile &&
                          styles.sectionEyebrowSmall,
                      ]}
                    >
                      APPOINTMENT DETAILS
                    </Text>

                    <Text
                      style={[
                        styles.sectionTitle,
                        isSmallMobile &&
                          styles.sectionTitleSmall,
                      ]}
                    >
                      Your booking
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.reviewBadge,
                      isSmallMobile &&
                        styles.reviewBadgeSmall,
                    ]}
                  >
                    <Text
                      style={[
                        styles.reviewBadgeText,
                        isSmallMobile &&
                          styles.reviewBadgeTextSmall,
                      ]}
                    >
                      REVIEW
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.detailGrid,
                    !isDesktop &&
                      styles.detailGridNonDesktop,
                  ]}
                >
                  {/* SERVICE */}

                  <View
                    style={[
                      styles.detailCard,
                      isSmallMobile &&
                        styles.detailCardSmall,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIcon,
                        isSmallMobile &&
                          styles.detailIconSmall,
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="content-cut"
                        size={
                          isSmallMobile
                            ? 18
                            : 20
                        }
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.detailTextBlock
                      }
                    >
                      <Text
                        style={[
                          styles.detailLabel,
                          isSmallMobile &&
                            styles.detailLabelSmall,
                        ]}
                      >
                        SERVICE
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          isSmallMobile &&
                            styles.detailValueSmall,
                        ]}
                        numberOfLines={3}
                      >
                        {service?.name ||
                          "Selected Service"}
                      </Text>
                    </View>
                  </View>

                  {/* STYLIST */}

                  <View
                    style={[
                      styles.detailCard,
                      isSmallMobile &&
                        styles.detailCardSmall,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIcon,
                        isSmallMobile &&
                          styles.detailIconSmall,
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={
                          isSmallMobile
                            ? 18
                            : 20
                        }
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.detailTextBlock
                      }
                    >
                      <Text
                        style={[
                          styles.detailLabel,
                          isSmallMobile &&
                            styles.detailLabelSmall,
                        ]}
                      >
                        STYLIST
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          isSmallMobile &&
                            styles.detailValueSmall,
                        ]}
                        numberOfLines={3}
                      >
                        {staff?.name ||
                          "Selected Stylist"}
                      </Text>
                    </View>
                  </View>

                  {/* DATE */}

                  <View
                    style={[
                      styles.detailCard,
                      isSmallMobile &&
                        styles.detailCardSmall,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIcon,
                        isSmallMobile &&
                          styles.detailIconSmall,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={
                          isSmallMobile
                            ? 18
                            : 20
                        }
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.detailTextBlock
                      }
                    >
                      <Text
                        style={[
                          styles.detailLabel,
                          isSmallMobile &&
                            styles.detailLabelSmall,
                        ]}
                      >
                        DATE
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          isSmallMobile &&
                            styles.detailValueSmall,
                        ]}
                        numberOfLines={3}
                      >
                        {formatDate(date)}
                      </Text>
                    </View>
                  </View>

                  {/* TIME */}

                  <View
                    style={[
                      styles.detailCard,
                      isSmallMobile &&
                        styles.detailCardSmall,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIcon,
                        isSmallMobile &&
                          styles.detailIconSmall,
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={
                          isSmallMobile
                            ? 18
                            : 20
                        }
                        color={
                          COLORS.primary
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.detailTextBlock
                      }
                    >
                      <Text
                        style={[
                          styles.detailLabel,
                          isSmallMobile &&
                            styles.detailLabelSmall,
                        ]}
                      >
                        TIME
                      </Text>

                      <Text
                        style={[
                          styles.detailValue,
                          isSmallMobile &&
                            styles.detailValueSmall,
                        ]}
                        numberOfLines={2}
                      >
                        {startTime}
                        {endTime
                          ? ` - ${endTime}`
                          : ""}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* NOTES */}

              <View
                style={[
                  styles.card,
                  isSmallMobile &&
                    styles.cardSmall,
                ]}
              >
                <View
                  style={styles.notesGlow}
                />

                <View
                  style={styles.notesHeader}
                >
                  <View
                    style={
                      styles.notesHeaderText
                    }
                  >
                    <Text
                      style={[
                        styles.notesTitle,
                        isSmallMobile &&
                          styles.notesTitleSmall,
                      ]}
                    >
                      Notes
                    </Text>

                    <Text
                      style={[
                        styles.notesDescription,
                        isSmallMobile &&
                          styles.notesDescriptionSmall,
                      ]}
                    >
                      Add anything you would
                      like the salon to know.
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
                        styles.optionalBadgeText,
                        isSmallMobile &&
                          styles.optionalBadgeTextSmall,
                      ]}
                    >
                      OPTIONAL
                    </Text>
                  </View>
                </View>

                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  maxLength={500}
                  placeholder="Anything you'd like the salon to know?"
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                  style={[
                    styles.notesInput,
                    isSmallMobile &&
                      styles.notesInputSmall,
                  ]}
                />

                <View
                  style={
                    styles.characterRow
                  }
                >
                  <Text
                    style={[
                      styles.characterText,
                      notes.length >= 450 &&
                        styles.characterTextWarning,
                    ]}
                  >
                    {notes.length}/500
                  </Text>
                </View>
              </View>
            </View>

            {/* RIGHT SUMMARY */}

            <View
              style={[
                styles.rightColumn,
                isDesktop &&
                  styles.rightColumnDesktop,
              ]}
            >
              <View
                style={[
                  styles.summaryCard,
                  isSmallMobile &&
                    styles.summaryCardSmall,
                ]}
              >
                <View
                  style={styles.summaryGlowOne}
                />

                <View
                  style={styles.summaryGlowTwo}
                />

                <View
                  style={
                    styles.summaryInner
                  }
                >
                  {/* SUMMARY HERO */}

                  <View
                    style={[
                      styles.summaryHero,
                      isSmallMobile &&
                        styles.summaryHeroSmall,
                    ]}
                  >
                    <View
                      style={
                        styles.summaryHeroGlow
                      }
                    />

                    <View
                      style={
                        styles.summaryHeroContent
                      }
                    >
                      <View
                        style={
                          styles.summaryHeroTop
                        }
                      >
                        <Text
                          style={[
                            styles.summaryHeroLabel,
                            isSmallMobile &&
                              styles.summaryHeroLabelSmall,
                          ]}
                        >
                          BOOKING SUMMARY
                        </Text>

                        <View
                          style={[
                            styles.summaryCheck,
                            isSmallMobile &&
                              styles.summaryCheckSmall,
                          ]}
                        >
                          <Ionicons
                            name="checkmark"
                            size={
                              isSmallMobile
                                ? 14
                                : 17
                            }
                            color={
                              COLORS.white
                            }
                          />
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.summaryServiceName,
                          isSmallMobile &&
                            styles.summaryServiceNameSmall,
                        ]}
                        numberOfLines={3}
                      >
                        {service?.name ||
                          "Selected Service"}
                      </Text>

                      <View
                        style={
                          styles.summaryPriceRow
                        }
                      >
                        <Text
                          style={[
                            styles.summaryPriceLabel,
                            isSmallMobile &&
                              styles.summaryPriceLabelSmall,
                          ]}
                        >
                          Service price
                        </Text>

                        <Text
                          style={[
                            styles.summaryPrice,
                            isSmallMobile &&
                              styles.summaryPriceSmall,
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                        >
                          ₹
                          {Number(
                            service?.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ERROR */}

                  {error ? (
                    <View
                      style={[
                        styles.errorBox,
                        isSmallMobile &&
                          styles.errorBoxSmall,
                      ]}
                    >
                      <View
                        style={
                          styles.errorIcon
                        }
                      >
                        <Ionicons
                          name="alert-circle"
                          size={
                            isSmallMobile
                              ? 17
                              : 19
                          }
                          color={
                            COLORS.red
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.errorText,
                          isSmallMobile &&
                            styles.errorTextSmall,
                        ]}
                      >
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* QUICK DETAILS */}

                  <View
                    style={[
                      styles.quickDetails,
                      isSmallMobile &&
                        styles.quickDetailsSmall,
                    ]}
                  >
                    {/* DATE */}

                    <View
                      style={
                        styles.quickItem
                      }
                    >
                      <View
                        style={[
                          styles.quickIcon,
                          isSmallMobile &&
                            styles.quickIconSmall,
                        ]}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={
                            isSmallMobile
                              ? 17
                              : 18
                          }
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.quickText
                        }
                      >
                        <Text
                          style={[
                            styles.quickLabel,
                            isSmallMobile &&
                              styles.quickLabelSmall,
                          ]}
                        >
                          DATE
                        </Text>

                        <Text
                          style={[
                            styles.quickValue,
                            isSmallMobile &&
                              styles.quickValueSmall,
                          ]}
                        >
                          {formatDate(
                            date
                          )}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.quickDivider
                      }
                    />

                    {/* TIME */}

                    <View
                      style={
                        styles.quickItem
                      }
                    >
                      <View
                        style={[
                          styles.quickIcon,
                          isSmallMobile &&
                            styles.quickIconSmall,
                        ]}
                      >
                        <Ionicons
                          name="time-outline"
                          size={
                            isSmallMobile
                              ? 17
                              : 18
                          }
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.quickText
                        }
                      >
                        <Text
                          style={[
                            styles.quickLabel,
                            isSmallMobile &&
                              styles.quickLabelSmall,
                          ]}
                        >
                          TIME
                        </Text>

                        <Text
                          style={[
                            styles.quickValue,
                            isSmallMobile &&
                              styles.quickValueSmall,
                          ]}
                        >
                          {startTime}
                          {endTime
                            ? ` - ${endTime}`
                            : ""}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={
                        styles.quickDivider
                      }
                    />

                    {/* STYLIST */}

                    <View
                      style={
                        styles.quickItem
                      }
                    >
                      <View
                        style={[
                          styles.quickIcon,
                          isSmallMobile &&
                            styles.quickIconSmall,
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={
                            isSmallMobile
                              ? 17
                              : 18
                          }
                          color={
                            COLORS.primary
                          }
                        />
                      </View>

                      <View
                        style={
                          styles.quickText
                        }
                      >
                        <Text
                          style={[
                            styles.quickLabel,
                            isSmallMobile &&
                              styles.quickLabelSmall,
                          ]}
                        >
                          STYLIST
                        </Text>

                        <Text
                          style={[
                            styles.quickValue,
                            isSmallMobile &&
                              styles.quickValueSmall,
                          ]}
                          numberOfLines={2}
                        >
                          {staff?.name ||
                            "Selected Stylist"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* PRICE INFO */}

                  <View
                    style={[
                      styles.priceInfo,
                      isSmallMobile &&
                        styles.priceInfoSmall,
                    ]}
                  >
                    <View
                      style={
                        styles.priceInfoIcon
                      }
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={
                          isSmallMobile
                            ? 16
                            : 18
                        }
                        color={
                          COLORS.green
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.priceInfoText,
                        isSmallMobile &&
                          styles.priceInfoTextSmall,
                      ]}
                    >
                      No payment is required
                      right now.
                    </Text>
                  </View>

                  {/* DIVIDER */}

                  <View
                    style={
                      styles.summaryDivider
                    }
                  />

                  {/* CONFIRM BUTTON */}

                  <Pressable
                    onPress={handleBooking}
                    disabled={loadingBooking}
                    style={({ pressed }) => [
                      styles.confirmButton,
                      isSmallMobile &&
                        styles.confirmButtonSmall,
                      loadingBooking &&
                        styles.confirmButtonLoading,
                      pressed &&
                        !loadingBooking &&
                        styles.confirmButtonPressed,
                    ]}
                  >
                    {loadingBooking ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color={
                            COLORS.white
                          }
                        />

                        <Text
                          style={[
                            styles.confirmButtonText,
                            isSmallMobile &&
                              styles.confirmButtonTextSmall,
                          ]}
                        >
                          Booking...
                        </Text>
                      </>
                    ) : (
                      <>
                        <View
                          style={
                            styles.confirmButtonIcon
                          }
                        >
                          <Ionicons
                            name="checkmark"
                            size={
                              isSmallMobile
                                ? 16
                                : 18
                            }
                            color={
                              COLORS.white
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.confirmButtonText,
                            isSmallMobile &&
                              styles.confirmButtonTextSmall,
                          ]}
                        >
                          Confirm Appointment
                        </Text>

                        <Ionicons
                          name="arrow-forward"
                          size={
                            isSmallMobile
                              ? 16
                              : 18
                          }
                          color={
                            COLORS.white
                          }
                        />
                      </>
                    )}
                  </Pressable>

                  {/* PENDING STATUS */}

                  <View
                    style={[
                      styles.pendingBox,
                      isSmallMobile &&
                        styles.pendingBoxSmall,
                    ]}
                  >
                    <View
                      style={
                        styles.pendingDot
                      }
                    />

                    <Text
                      style={[
                        styles.pendingText,
                        isSmallMobile &&
                          styles.pendingTextSmall,
                      ]}
                    >
                      Your appointment will be
                      created with{" "}
                      <Text
                        style={
                          styles.pendingStrong
                        }
                      >
                        PENDING
                      </Text>{" "}
                      status.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* FOOTER */}

          <View
            style={styles.footerWrapper}
          >
            <CustomerFooter />
          </View>
        </View>
      </ScrollView>
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
    paddingTop: 26,
    paddingBottom: 0,
  },

  pageContainer: {
    width: "100%",
    alignSelf: "center",
  },

  /* =========================================================
     HEADER
  ========================================================= */

  pageHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 34,
  },

  pageHeaderSmall: {
    gap: 11,
    marginBottom: 24,
  },

  headerBackButton: {
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E5EA",
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  headerBackButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 14,
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 9,
  },

  headerMetaSmall: {
    gap: 6,
  },

  headerMetaPrimary: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    includeFontPadding: false,
  },

  headerMetaPrimarySmall: {
    fontSize: 8,
    letterSpacing: 1.3,
  },

  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C4B5FD",
  },

  headerMetaSecondary: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    includeFontPadding: false,
  },

  headerMetaSecondarySmall: {
    fontSize: 8,
    letterSpacing: 0.8,
  },

  pageTitle: {
    marginTop: 10,
    color: COLORS.textDark,
    fontSize: 49,
    lineHeight: 54,
    fontWeight: "900",
    letterSpacing: -1.7,
    includeFontPadding: false,
  },

  pageTitleSmall: {
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: -0.8,
  },

  pageTitleMedium: {
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -1,
  },

  pageTitleLarge: {
    fontSize: 39,
    lineHeight: 44,
    letterSpacing: -1.2,
  },

  pageTitleTablet: {
    fontSize: 50,
    lineHeight: 56,
  },

  pageTitleDesktop: {
    fontSize: 61,
    lineHeight: 66,
    letterSpacing: -2.2,
  },

  pageDescription: {
    maxWidth: 720,
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
     MAIN LAYOUT
  ========================================================= */

  mainLayout: {
    width: "100%",
    gap: 20,
  },

  mainLayoutDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 30,
  },

  leftColumn: {
    width: "100%",
    gap: 20,
  },

  leftColumnDesktop: {
    flex: 1,
    minWidth: 0,
  },

  rightColumn: {
    width: "100%",
  },

  rightColumnDesktop: {
    width: 400,
    flexShrink: 0,
  },

  /* =========================================================
     COMMON CARD
  ========================================================= */

  card: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    padding: 22,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.065,
    shadowRadius: 28,
    shadowOffset: {
      width: 0,
      height: 13,
    },
    elevation: 3,
  },

  cardSmall: {
    padding: 16,
    borderRadius: 22,
  },

  cardTopLine: {
    position: "absolute",
    top: 0,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: "#DDD6FE",
  },

  cardGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -100,
    top: -100,
    backgroundColor: "rgba(196,181,253,0.20)",
  },

  notesGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -80,
    bottom: -80,
    backgroundColor: "rgba(221,214,254,0.20)",
  },

  /* =========================================================
     SALON
  ========================================================= */

  salonRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  salonIcon: {
    width: 55,
    height: 55,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: COLORS.violetLighter,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  salonIconSmall: {
    width: 45,
    height: 45,
    borderRadius: 15,
  },

  salonTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  overline: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    includeFontPadding: false,
  },

  overlineSmall: {
    fontSize: 7.5,
    letterSpacing: 1.2,
  },

  salonName: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    includeFontPadding: false,
  },

  salonNameSmall: {
    fontSize: 15,
    lineHeight: 20,
  },

  salonCity: {
    marginTop: 2,
    color: COLORS.textSoft,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    includeFontPadding: false,
  },

  salonCitySmall: {
    fontSize: 10.5,
    lineHeight: 16,
  },

  selectedBadge: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
  },

  selectedBadgeSmall: {
    width: 29,
    height: 29,
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: "center",
    borderRadius: 10,
  },

  selectedBadgeText: {
    color: COLORS.primary,
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  /* =========================================================
     SECTION HEADER
  ========================================================= */

  sectionHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 20,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionEyebrow: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: "900",
    letterSpacing: 1.8,
    includeFontPadding: false,
  },

  sectionEyebrowSmall: {
    fontSize: 7.5,
    letterSpacing: 1.2,
  },

  sectionTitle: {
    marginTop: 4,
    color: COLORS.textDark,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
    includeFontPadding: false,
  },

  sectionTitleSmall: {
    fontSize: 20,
    lineHeight: 25,
  },

  reviewBadge: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  reviewBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  reviewBadgeText: {
    color: COLORS.textSoft,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  reviewBadgeTextSmall: {
    fontSize: 7,
  },

  /* =========================================================
     DETAIL GRID
  ========================================================= */

  detailGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
  },

  detailGridNonDesktop: {
    justifyContent: "space-between",
  },

  detailCard: {
    width: "48.8%",
    minHeight: 92,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#F8FAFC",
  },

  detailCardSmall: {
    width: "100%",
    minHeight: 76,
    padding: 11,
    borderRadius: 15,
  },

  detailIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
  },

  detailIconSmall: {
    width: 34,
    height: 34,
    borderRadius: 11,
  },

  detailTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  detailLabelSmall: {
    fontSize: 7,
    letterSpacing: 0.7,
  },

  detailValue: {
    marginTop: 5,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    includeFontPadding: false,
  },

  detailValueSmall: {
    fontSize: 11,
    lineHeight: 15,
  },

  /* =========================================================
     NOTES
  ========================================================= */

  notesHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },

  notesHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  notesTitle: {
    color: COLORS.textDark,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    includeFontPadding: false,
  },

  notesTitleSmall: {
    fontSize: 14,
    lineHeight: 19,
  },

  notesDescription: {
    marginTop: 4,
    color: COLORS.textMuted,
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: "500",
    includeFontPadding: false,
  },

  notesDescriptionSmall: {
    fontSize: 10,
    lineHeight: 15,
  },

  optionalBadge: {
    flexShrink: 0,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  optionalBadgeSmall: {
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  optionalBadgeText: {
    color: COLORS.textMuted,
    fontSize: 7.5,
    fontWeight: "900",
    letterSpacing: 0.8,
    includeFontPadding: false,
  },

  optionalBadgeTextSmall: {
    fontSize: 6.5,
  },

  notesInput: {
    width: "100%",
    minHeight: 125,
    marginTop: 17,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
  },

  notesInputSmall: {
    minHeight: 110,
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    fontSize: 11.5,
    lineHeight: 18,
  },

  characterRow: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 7,
  },

  characterText: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    fontWeight: "800",
    includeFontPadding: false,
  },

  characterTextWarning: {
    color: COLORS.amber,
  },

  /* =========================================================
     SUMMARY
  ========================================================= */

  summaryCard: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 29,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.98)",
    backgroundColor: "rgba(255,255,255,0.97)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.10,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    elevation: 5,
  },

  summaryCardSmall: {
    borderRadius: 22,
  },

  summaryGlowOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    right: -130,
    top: -120,
    backgroundColor: "rgba(196,181,253,0.25)",
  },

  summaryGlowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -100,
    bottom: -100,
    backgroundColor: "rgba(244,114,182,0.10)",
  },

  summaryInner: {
    padding: 17,
  },

  summaryHero: {
    position: "relative",
    width: "100%",
    minHeight: 205,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#7C3AED",
  },

  summaryHeroSmall: {
    minHeight: 180,
    borderRadius: 18,
  },

  summaryHeroGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    right: -65,
    top: -70,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  summaryHeroContent: {
    flex: 1,
    padding: 20,
  },

  summaryHeroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  summaryHeroLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    includeFontPadding: false,
  },

  summaryHeroLabelSmall: {
    fontSize: 7.5,
    letterSpacing: 1.1,
  },

  summaryCheck: {
    width: 34,
    height: 34,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  summaryCheckSmall: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
  },

  summaryServiceName: {
    marginTop: 24,
    color: COLORS.white,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: -0.4,
    includeFontPadding: false,
  },

  summaryServiceNameSmall: {
    marginTop: 19,
    fontSize: 18,
    lineHeight: 24,
  },

  summaryPriceRow: {
    minHeight: 45,
    marginTop: 21,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.18)",
  },

  summaryPriceLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 10.5,
    fontWeight: "600",
    includeFontPadding: false,
  },

  summaryPriceLabelSmall: {
    fontSize: 9,
  },

  summaryPrice: {
    flexShrink: 0,
    color: COLORS.white,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "900",
    includeFontPadding: false,
  },

  summaryPriceSmall: {
    fontSize: 21,
    lineHeight: 24,
  },

  /* =========================================================
     ERROR
  ========================================================= */

  errorBox: {
    width: "100%",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redSoft,
  },

  errorBoxSmall: {
    padding: 10,
    borderRadius: 13,
  },

  errorIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    flex: 1,
    color: "#B91C1C",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    includeFontPadding: false,
  },

  errorTextSmall: {
    fontSize: 9.5,
    lineHeight: 15,
  },

  /* =========================================================
     QUICK DETAILS
  ========================================================= */

  quickDetails: {
    width: "100%",
    marginTop: 17,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF0F4",
    backgroundColor: "#F8FAFC",
  },

  quickDetailsSmall: {
    marginTop: 13,
    padding: 12,
    borderRadius: 15,
  },

  quickItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },

  quickIcon: {
    width: 37,
    height: 37,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: COLORS.white,
  },

  quickIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },

  quickText: {
    flex: 1,
    minWidth: 0,
  },

  quickLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    includeFontPadding: false,
  },

  quickLabelSmall: {
    fontSize: 6.8,
    letterSpacing: 0.7,
  },

  quickValue: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "900",
    includeFontPadding: false,
  },

  quickValueSmall: {
    fontSize: 10,
    lineHeight: 15,
  },

  quickDivider: {
    height: 1,
    marginVertical: 13,
    backgroundColor: "#E8EBF0",
  },

  /* =========================================================
     PRICE INFO
  ========================================================= */

  priceInfo: {
    width: "100%",
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: COLORS.greenSoft,
  },

  priceInfoSmall: {
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 11,
  },

  priceInfoIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  priceInfoText: {
    flex: 1,
    color: "#166534",
    fontSize: 9.5,
    lineHeight: 14,
    fontWeight: "700",
    includeFontPadding: false,
  },

  priceInfoTextSmall: {
    fontSize: 8.5,
    lineHeight: 13,
  },

  /* =========================================================
     SUMMARY DIVIDER
  ========================================================= */

  summaryDivider: {
    width: "100%",
    height: 1,
    marginVertical: 17,
    backgroundColor: "#E8EBF0",
  },

  /* =========================================================
     CONFIRM BUTTON
  ========================================================= */

  confirmButton: {
    width: "100%",
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: COLORS.dark,
    shadowColor: "#0F172A",
    shadowOpacity: 0.20,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 9,
    },
    elevation: 5,
  },

  confirmButtonSmall: {
    minHeight: 47,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 7,
  },

  confirmButtonLoading: {
    opacity: 0.68,
  },

  confirmButtonPressed: {
    opacity: 0.86,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  confirmButtonIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  confirmButtonText: {
    flexShrink: 1,
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    textAlign: "center",
    includeFontPadding: false,
  },

  confirmButtonTextSmall: {
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* =========================================================
     PENDING
  ========================================================= */

  pendingBox: {
    width: "100%",
    marginTop: 11,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: COLORS.amberSoft,
  },

  pendingBoxSmall: {
    marginTop: 9,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 11,
  },

  pendingDot: {
    width: 6,
    height: 6,
    marginTop: 5,
    flexShrink: 0,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },

  pendingText: {
    flex: 1,
    color: COLORS.textSoft,
    fontSize: 9.5,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
    includeFontPadding: false,
  },

  pendingTextSmall: {
    fontSize: 8,
    lineHeight: 13,
  },

  pendingStrong: {
    color: COLORS.text,
    fontWeight: "900",
  },

  /* =========================================================
     MISSING STATE
  ========================================================= */

  missingScrollContent: {
    flexGrow: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 45,
    paddingBottom: 0,
  },

  missingContainer: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingVertical: 48,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#0F172A",
    shadowOpacity: 0.09,
    shadowRadius: 35,
    shadowOffset: {
      width: 0,
      height: 17,
    },
    elevation: 5,
  },

  missingGlowOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    left: -120,
    top: -120,
    backgroundColor: "rgba(221,214,254,0.25)",
  },

  missingGlowTwo: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    right: -100,
    bottom: -100,
    backgroundColor: "rgba(254,205,211,0.18)",
  },

  missingIcon: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  missingEyebrow: {
    marginTop: 22,
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.9,
    includeFontPadding: false,
  },

  missingEyebrowSmall: {
    fontSize: 7.5,
    letterSpacing: 1.2,
  },

  missingTitle: {
    marginTop: 7,
    color: COLORS.textDark,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.8,
    includeFontPadding: false,
  },

  missingTitleSmall: {
    fontSize: 22,
    lineHeight: 28,
  },

  missingDescription: {
    maxWidth: 500,
    marginTop: 9,
    color: COLORS.textSoft,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },

  missingDescriptionSmall: {
    fontSize: 11.5,
    lineHeight: 18,
  },

  contextLoading: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  contextLoadingText: {
    color: COLORS.textSoft,
    fontSize: 11,
    fontWeight: "600",
    includeFontPadding: false,
  },

  missingError: {
    maxWidth: 520,
    marginTop: 16,
    color: COLORS.red,
    fontSize: 11.5,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },

  missingErrorSmall: {
    fontSize: 10,
    lineHeight: 16,
  },

  missingBackButton: {
    minHeight: 50,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: COLORS.dark,
  },

  missingBackText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    includeFontPadding: false,
  },

  missingBackTextSmall: {
    fontSize: 10.5,
  },

  /* =========================================================
     FOOTER
  ========================================================= */

  footerWrapper: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  /* =========================================================
     COMMON
  ========================================================= */

  buttonPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },
});

export default CustomerAppointmentConfirm;