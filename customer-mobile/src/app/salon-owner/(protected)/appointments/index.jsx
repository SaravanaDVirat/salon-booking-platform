import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import {
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../../../services/salonOwnerAppointmentService";

const STATUS = {
  PENDING: {
    label: "Pending",
    icon: "time-outline",
    color: "#B45309",
    bg: "#FFF7ED",
    border: "#FED7AA",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "checkmark-circle-outline",
    color: "#047857",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  COMPLETED: {
    label: "Completed",
    icon: "checkmark-circle",
    color: "#1D4ED8",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "close-circle-outline",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  REJECTED: {
    label: "Rejected",
    icon: "ban-outline",
    color: "#475569",
    bg: "#F1F5F9",
    border: "#CBD5E1",
  },
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

const safeString = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInputDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parsePickerDate = (value) => {
  if (!value) return new Date();
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date();
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toPickerDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({ day: previousMonthDays - i, date: new Date(year, month - 1, previousMonthDays - i), outside: true });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, date: new Date(year, month, day), outside: false });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay, date: new Date(year, month + 1, nextDay), outside: true });
    nextDay += 1;
  }
  return cells;
};

const getInitial = (name) => {
  const value = safeString(name, "C").trim();
  return value ? value.charAt(0).toUpperCase() : "C";
};

const getStatus = (status) => STATUS[status] || STATUS.PENDING;

const getSpecialization = (staff) => {
  if (!Array.isArray(staff?.specialization)) return "";
  return staff.specialization.filter(Boolean).join(", ");
};

const AppointmentManagement = () => {
  const { width } = useWindowDimensions();

  const isSmallPhone = width < 375;
  const isCompactFilterPhone = width <= 375;
  const isPhone = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const horizontalPadding = isSmallPhone
    ? 12
    : isPhone
      ? 16
      : isTablet
        ? 24
        : 30;

  const contentMaxWidth = isDesktop ? 1540 : 1000;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [salonFilter, setSalonFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [dropdownType, setDropdownType] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  const loadAppointments = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getAllAppointments();

      setAppointments(
        Array.isArray(data?.appointments) ? data.appointments : []
      );
    } catch (error) {
      console.error("Failed to load appointments:", error);

      Alert.alert(
        "Unable to load appointments",
        error?.response?.data?.message ||
          "Failed to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const salons = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      if (appointment?.salon?._id) {
        map.set(appointment.salon._id, appointment.salon);
      }
    });

    return Array.from(map.values());
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const customerName =
        safeString(appointment?.customer?.name).toLowerCase();
      const customerPhone =
        safeString(appointment?.customer?.phone).toLowerCase();
      const salonName =
        safeString(appointment?.salon?.name).toLowerCase();
      const serviceName =
        safeString(appointment?.service?.name).toLowerCase();
      const staffName =
        safeString(appointment?.staff?.name).toLowerCase();

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        salonName.includes(searchValue) ||
        serviceName.includes(searchValue) ||
        staffName.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        appointment?.status === statusFilter;

      const matchesSalon =
        salonFilter === "ALL" ||
        appointment?.salon?._id === salonFilter;

      const matchesDate =
        !dateFilter ||
        getInputDate(appointment?.appointmentDate) === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesSalon &&
        matchesDate
      );
    });
  }, [appointments, search, statusFilter, salonFilter, dateFilter]);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((item) => item?.status === "PENDING").length,
      confirmed: appointments.filter(
        (item) => item?.status === "CONFIRMED"
      ).length,
      completed: appointments.filter(
        (item) => item?.status === "COMPLETED"
      ).length,
      cancelled: appointments.filter(
        (item) =>
          item?.status === "CANCELLED" ||
          item?.status === "REJECTED"
      ).length,
    }),
    [appointments]
  );

  const openDatePicker = () => {
    setCalendarMonth(parsePickerDate(dateFilter));
    setShowDatePicker(true);
  };

  const closeDatePicker = () => setShowDatePicker(false);

  const selectFilterDate = (date) => {
    setDateFilter(toPickerDate(date));
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setDateFilter("");
    setShowDatePicker(false);
  };

  const goCalendarMonth = (direction) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setSalonFilter("ALL");
    setDateFilter("");
    setDropdownType(null);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedAppointment(null);
  };

  const handleStatusChange = async (appointment, nextStatus) => {
    if (!appointment?._id) return;

    try {
      setUpdatingId(appointment._id);

      const data = await updateAppointmentStatus(
        appointment._id,
        nextStatus
      );

      const updated = data?.appointment || {
        ...appointment,
        status: nextStatus,
      };

      setAppointments((previous) =>
        previous.map((item) =>
          item?._id === appointment._id ? updated : item
        )
      );

      setSelectedAppointment((current) =>
        current?._id === appointment._id ? updated : current
      );
    } catch (error) {
      console.error("Failed to update appointment:", error);

      Alert.alert(
        "Update failed",
        error?.response?.data?.message ||
          "Failed to update appointment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openCancelModal = (appointment) => {
    setCancelTarget(appointment);
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    if (updatingId) return;
    setShowCancelModal(false);
    setCancelTarget(null);
  };

  const handleCancel = async () => {
    if (!cancelTarget?._id) return;

    try {
      setUpdatingId(cancelTarget._id);

      const data = await cancelAppointment(cancelTarget._id);

      const updated = data?.appointment || {
        ...cancelTarget,
        status: "CANCELLED",
      };

      setAppointments((previous) =>
        previous.map((item) =>
          item?._id === cancelTarget._id ? updated : item
        )
      );

      setSelectedAppointment((current) =>
        current?._id === cancelTarget._id ? updated : current
      );

      setShowCancelModal(false);
      setCancelTarget(null);
    } catch (error) {
      console.error("Failed to cancel appointment:", error);

      Alert.alert(
        "Cancellation failed",
        error?.response?.data?.message ||
          "Failed to cancel appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetails = async (appointment) => {
    if (!appointment?._id) return;

    setSelectedAppointment(appointment);
    setShowDetails(true);
    setDetailsLoading(true);

    try {
      const data = await getAppointmentById(appointment._id);

      if (data?.appointment) {
        setSelectedAppointment(data.appointment);

        setAppointments((previous) =>
          previous.map((item) =>
            item?._id === appointment._id
              ? data.appointment
              : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to fetch appointment details:", error);

      Alert.alert(
        "Details unavailable",
        error?.response?.data?.message ||
          "Failed to fetch appointment details."
      );

      setShowDetails(false);
      setSelectedAppointment(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const selectedSalonName =
    salonFilter === "ALL"
      ? "All Salons"
      : salons.find((salon) => salon?._id === salonFilter)?.name ||
        "All Salons";

  const selectedStatusLabel =
    STATUS_OPTIONS.find((item) => item.value === statusFilter)?.label ||
    "All Status";

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.loadingContainer,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
            <SkeletonHeader isSmallPhone={isSmallPhone} />
            <View style={styles.skeletonStats}>
              {[1, 2, 3, 4, 5].map((item) => (
                <View
                  key={item}
                  style={[
                    styles.skeletonStat,
                    {
                      width: isPhone
                        ? isSmallPhone
                          ? "100%"
                          : "48.5%"
                        : isTablet
                          ? "31.5%"
                          : "18.7%",
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.skeletonFilter} />
            <View style={styles.skeletonCard} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isPhone ? 14 : 22,
          paddingBottom: 42,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAppointments(true)}
            tintColor="#7C3AED"
            colors={["#7C3AED"]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { maxWidth: contentMaxWidth }]}>
          {/* HEADER */}
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View
              style={[
                styles.heroContent,
                isDesktop && styles.heroContentDesktop,
              ]}
            >
              <View style={styles.heroLeft}>
                <View style={styles.heroPill}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color="#7C3AED"
                  />
                  <Text style={styles.heroPillText}>
                    Appointment Center
                  </Text>
                </View>

                <Text
  style={[
    styles.heroTitle,
    isPhone && styles.heroTitlePhone,
  ]}
  numberOfLines={1}
  adjustsFontSizeToFit={false}
>
  Appointments
</Text>

                <Text style={styles.heroSubtitle}>
                  View and manage appointments across your salons from one place.
                </Text>
              </View>

              <Pressable
                onPress={() => loadAppointments(true)}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  isDesktop && styles.refreshButtonDesktop,
                  pressed && styles.pressed,
                  refreshing && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color="#475569"
                />
                <Text style={styles.refreshText}>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* STATS */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="calendar-outline"
              label="Total"
              value={stats.total}
              description="All appointments"
              accent="#7C3AED"
              bg="#F5F3FF"
              width={isPhone ? (isSmallPhone ? "100%" : "48.5%") : isTablet ? "31.5%" : "18.7%"}
            />

            <StatCard
              icon="time-outline"
              label="Pending"
              value={stats.pending}
              description="Awaiting action"
              accent="#D97706"
              bg="#FFF7ED"
              width={isPhone ? (isSmallPhone ? "100%" : "48.5%") : isTablet ? "31.5%" : "18.7%"}
            />

            <StatCard
              icon="checkmark-circle-outline"
              label="Confirmed"
              value={stats.confirmed}
              description="Upcoming bookings"
              accent="#059669"
              bg="#ECFDF5"
              width={isPhone ? (isSmallPhone ? "100%" : "48.5%") : isTablet ? "31.5%" : "18.7%"}
            />

            <StatCard
              icon="checkmark-done-outline"
              label="Completed"
              value={stats.completed}
              description="Successfully served"
              accent="#2563EB"
              bg="#EFF6FF"
              width={isPhone ? (isSmallPhone ? "100%" : "48.5%") : isTablet ? "31.5%" : "18.7%"}
            />

            <StatCard
              icon="ban-outline"
              label="Cancelled"
              value={stats.cancelled}
              description="Cancelled / rejected"
              accent="#DC2626"
              bg="#FEF2F2"
              width={isPhone ? (isSmallPhone ? "100%" : "48.5%") : isTablet ? "31.5%" : "18.7%"}
            />
          </View>

          {/* FILTERS */}
          <View style={styles.filterCard}>
            <View style={styles.filterGlow} />

            <View
                style={[
                  styles.filterHeader,
                  isCompactFilterPhone && styles.filterHeaderSmallPhone,
                ]}
              >
              <View style={styles.filterTitleRow}>
                <LinearGradient
                  colors={["#7C3AED", "#9333EA", "#C026D3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.filterIconBox}
                >
                  <Ionicons
                    name="options-outline"
                    size={17}
                    color="#FFFFFF"
                  />
                </LinearGradient>

                <View style={styles.filterTitleCopy}>
                  <Text
                    style={styles.filterTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                  >
                    Filter Appointments
                  </Text>
                  <Text style={styles.filterCount}>
                    <Text style={styles.filterCountStrong}>
                      {filteredAppointments.length}
                    </Text>{" "}
                    {filteredAppointments.length === 1
                      ? "appointment"
                      : "appointments"}{" "}
                    found
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={clearFilters}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={14}
                  color="#7C3AED"
                />
                <Text style={styles.clearButtonText}>Clear filters</Text>
              </Pressable>
            </View>

            <View
              style={[
                styles.filterGrid,
                isPhone
                  ? styles.filterGridPhone
                  : isTablet
                    ? styles.filterGridTablet
                    : styles.filterGridDesktop,
              ]}
            >
              {/* SEARCH */}
              <View
                style={[
                  styles.searchWrap,
                  isPhone && styles.fullWidth,
                  !isPhone && { flex: 1.8 },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#94A3B8"
                  style={styles.searchIcon}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search customer, service, staff..."
                  placeholderTextColor="#94A3B8"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              {/* STATUS */}
              <View style={[styles.filterControl, !isPhone && { flex: 1 }]}>
                <FilterSelect
                  icon="filter-outline"
                  label={selectedStatusLabel}
                  active={statusFilter !== "ALL"}
                  onPress={() =>
                    setDropdownType(
                      dropdownType === "status" ? null : "status"
                    )
                  }
                />
              </View>

              {/* SALON */}
              <View style={[styles.filterControl, !isPhone && { flex: 1.35 }]}>
                <FilterSelect
                  icon="storefront-outline"
                  label={selectedSalonName}
                  active={salonFilter !== "ALL"}
                  onPress={() =>
                    setDropdownType(
                      dropdownType === "salon" ? null : "salon"
                    )
                  }
                />
              </View>

              {/* DATE */}
              <View style={[styles.filterControl, !isPhone && { flex: 1 }]}>
                <Pressable
                  onPress={openDatePicker}
                  style={({ pressed }) => [
                    styles.dateInputWrap,
                    dateFilter && styles.dateInputWrapActive,
                    pressed && styles.fieldPressed,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={17}
                    color={dateFilter ? "#7C3AED" : "#94A3B8"}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateDisplayText,
                      dateFilter && styles.dateDisplayTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {dateFilter || "YYYY-MM-DD"}
                  </Text>
                  {dateFilter ? (
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        clearDateFilter();
                      }}
                      hitSlop={8}
                      style={styles.dateClear}
                    >
                      <Ionicons name="close-circle" size={17} color="#CBD5E1" />
                    </Pressable>
                  ) : null}
                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={dateFilter ? "#7C3AED" : "#94A3B8"}
                    style={styles.dateChevron}
                  />
                </Pressable>
              </View>
            </View>

            <Text style={styles.dateHint}>
              Date filter accepts the appointment date in YYYY-MM-DD format.
            </Text>
          </View>

          {/* LIST HEADER */}
          <View style={styles.listHeaderCard}>
            <View style={styles.listHeaderLeft}>
              <View style={styles.listHeaderIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#7C3AED"
                />
              </View>
              <View style={styles.listHeaderCopy}>
                <Text style={styles.listHeaderTitle}>
                  Appointment Records
                </Text>
                <Text style={styles.listHeaderSubtitle}>
                  Manage customer bookings and schedules
                </Text>
              </View>
            </View>

            <View style={styles.recordsPill}>
              <View style={styles.liveDot} />
              <Text style={styles.recordsText}>
                {filteredAppointments.length} Records
              </Text>
            </View>
          </View>

          {/* APPOINTMENT LIST */}
          {filteredAppointments.length === 0 ? (
            <EmptyState onClear={clearFilters} />
          ) : (
            <View style={styles.appointmentList}>
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment?._id}
                  appointment={appointment}
                  isPhone={isPhone}
                  isTablet={isTablet}
                  isDesktop={isDesktop}
                  updating={updatingId === appointment?._id}
                  onView={() => openDetails(appointment)}
                  onConfirm={() =>
                    handleStatusChange(appointment, "CONFIRMED")
                  }
                  onReject={() =>
                    handleStatusChange(appointment, "REJECTED")
                  }
                  onComplete={() =>
                    handleStatusChange(appointment, "COMPLETED")
                  }
                  onCancel={() => openCancelModal(appointment)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* STATUS / SALON DROPDOWN */}
      <Modal
        visible={Boolean(dropdownType)}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownType(null)}
      >
        <Pressable
          style={styles.dropdownBackdrop}
          onPress={() => setDropdownType(null)}
        >
          <Pressable
            style={[
              styles.dropdownSheet,
              {
                width: isPhone
                  ? "92%"
                  : isTablet
                    ? "70%"
                    : 500,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.dropdownHandle} />

            <View style={styles.dropdownHeader}>
              <View>
                <Text style={styles.dropdownTitle}>
                  {dropdownType === "status"
                    ? "Select Status"
                    : "Select Salon"}
                </Text>
                <Text style={styles.dropdownSubtitle}>
                  Tap the full row to select
                </Text>
              </View>

              <Pressable
                onPress={() => setDropdownType(null)}
                style={styles.modalCloseButtonLight}
              >
                <Ionicons name="close" size={19} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.dropdownScroll}
              contentContainerStyle={styles.dropdownContent}
              showsVerticalScrollIndicator={false}
            >
              {dropdownType === "status" ? (
                STATUS_OPTIONS.map((option) => {
                  const selected = statusFilter === option.value;
                  const config =
                    option.value === "ALL"
                      ? {
                          color: "#7C3AED",
                          bg: "#F5F3FF",
                          border: "#DDD6FE",
                          icon: "layers-outline",
                        }
                      : getStatus(option.value);

                  return (
                    <Pressable
                      key={option.value}
                      onPress={() => {
                        setStatusFilter(option.value);
                        setDropdownType(null);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownOption,
                        selected && {
                          backgroundColor: config.bg,
                          borderColor: config.border,
                        },
                        pressed && styles.dropdownPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.dropdownOptionIcon,
                          {
                            backgroundColor: config.bg,
                          },
                        ]}
                      >
                        <Ionicons
                          name={config.icon}
                          size={17}
                          color={config.color}
                        />
                      </View>

                      <Text
                        style={[
                          styles.dropdownOptionText,
                          selected && {
                            color: config.color,
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {option.label}
                      </Text>

                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#7C3AED"
                        />
                      ) : null}
                    </Pressable>
                  );
                })
              ) : (
                <>
                  <Pressable
                    onPress={() => {
                      setSalonFilter("ALL");
                      setDropdownType(null);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownOption,
                      salonFilter === "ALL" && styles.dropdownOptionSelected,
                      pressed && styles.dropdownPressed,
                    ]}
                  >
                    <View style={styles.dropdownOptionIcon}>
                      <Ionicons
                        name="business-outline"
                        size={17}
                        color="#7C3AED"
                      />
                    </View>
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        salonFilter === "ALL" && styles.dropdownSelectedText,
                      ]}
                    >
                      All Salons
                    </Text>
                    {salonFilter === "ALL" ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#7C3AED"
                      />
                    ) : null}
                  </Pressable>

                  {salons.map((salon) => {
                    const selected = salonFilter === salon?._id;

                    return (
                      <Pressable
                        key={salon?._id}
                        onPress={() => {
                          setSalonFilter(salon?._id);
                          setDropdownType(null);
                        }}
                        style={({ pressed }) => [
                          styles.dropdownOption,
                          selected && styles.dropdownOptionSelected,
                          pressed && styles.dropdownPressed,
                        ]}
                      >
                        <View style={styles.dropdownOptionIcon}>
                          <Ionicons
                            name="storefront-outline"
                            size={17}
                            color={selected ? "#7C3AED" : "#64748B"}
                          />
                        </View>

                        <Text
                          style={[
                            styles.dropdownOptionText,
                            selected && styles.dropdownSelectedText,
                          ]}
                        >
                          {safeString(salon?.name, "Unnamed salon")}
                        </Text>

                        {selected ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#7C3AED"
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}

                  {salons.length === 0 ? (
                    <View style={styles.dropdownEmpty}>
                      <Ionicons
                        name="storefront-outline"
                        size={26}
                        color="#CBD5E1"
                      />
                      <Text style={styles.dropdownEmptyText}>
                        No salons available in the loaded appointments.
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* DATE PICKER */}
      <DatePickerModal
        visible={showDatePicker}
        monthDate={calendarMonth}
        selectedDate={dateFilter}
        isPhone={isPhone}
        isSmallPhone={isSmallPhone}
        onClose={closeDatePicker}
        onSelectDate={selectFilterDate}
        onChangeMonth={goCalendarMonth}
        onClear={clearDateFilter}
      />

      {/* DETAILS */}
      <AppointmentDetailsModal
        visible={showDetails}
        appointment={selectedAppointment}
        loading={detailsLoading}
        updatingId={updatingId}
        isPhone={isPhone}
        isSmallPhone={isSmallPhone}
        onClose={closeDetails}
        onReject={() =>
          handleStatusChange(selectedAppointment, "REJECTED")
        }
        onConfirm={() =>
          handleStatusChange(selectedAppointment, "CONFIRMED")
        }
        onComplete={() =>
          handleStatusChange(selectedAppointment, "COMPLETED")
        }
      />

      {/* CANCEL */}
      <CancelModal
        visible={showCancelModal}
        appointment={cancelTarget}
        loading={
          Boolean(cancelTarget?._id) &&
          updatingId === cancelTarget?._id
        }
        isPhone={isPhone}
        onKeep={closeCancelModal}
        onConfirm={handleCancel}
      />
    </SafeAreaView>
  );
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const SkeletonHeader = ({ isSmallPhone }) => (
  <View style={styles.skeletonHero}>
    <View style={styles.skeletonLineSmall} />
    <View
      style={[
        styles.skeletonLineLarge,
        isSmallPhone && { width: "75%" },
      ]}
    />
    <View style={styles.skeletonLineMedium} />
  </View>
);

const StatCard = ({
  icon,
  label,
  value,
  description,
  accent,
  bg,
  width,
}) => (
  <View style={[styles.statCard, { width }]}>
    <View style={[styles.statAccent, { backgroundColor: accent }]} />
    <View style={[styles.statGlow, { backgroundColor: bg }]} />

    <View style={styles.statTop}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={19} color={accent} />
      </View>

      <Text style={styles.statLabel}>{label}</Text>
    </View>

    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statDescription}>{description}</Text>
  </View>
);

const FilterSelect = ({ icon, label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.selectField,
      active && styles.selectFieldActive,
      pressed && styles.fieldPressed,
    ]}
  >
    <View style={styles.selectLeft}>
      <Ionicons
        name={icon}
        size={17}
        color={active ? "#7C3AED" : "#94A3B8"}
      />
      <Text
        style={[
          styles.selectText,
          active && styles.selectTextActive,
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>

    <Ionicons
      name="chevron-down"
      size={16}
      color={active ? "#7C3AED" : "#94A3B8"}
    />
  </Pressable>
);

const EmptyState = ({ onClear }) => (
  <View style={styles.emptyCard}>
    <LinearGradient
      colors={["#F5F3FF", "#FAF5FF", "#FDF4FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.emptyIcon}
    >
      <Ionicons
        name="calendar-outline"
        size={30}
        color="#7C3AED"
      />
    </LinearGradient>

    <Text style={styles.emptyTitle}>No appointments found</Text>
    <Text style={styles.emptySubtitle}>
      Try changing your search or filters.
    </Text>

    <Pressable
      onPress={onClear}
      style={({ pressed }) => [
        styles.emptyButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="refresh-outline"
        size={15}
        color="#7C3AED"
      />
      <Text style={styles.emptyButtonText}>Clear filters</Text>
    </Pressable>
  </View>
);

const AppointmentCard = ({
  appointment,
  isPhone,
  isTablet,
  isDesktop,
  updating,
  onView,
  onConfirm,
  onReject,
  onComplete,
  onCancel,
}) => {
  const status = getStatus(appointment?.status);
  const canCancel = ["PENDING", "CONFIRMED"].includes(
    appointment?.status
  );

  const informationWidth = isDesktop
    ? "23.7%"
    : isTablet
      ? "48.5%"
      : "100%";

  return (
    <View style={styles.appointmentCard}>
      <LinearGradient
        colors={["#7C3AED", "#A855F7", "#C026D3"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardAccent}
      />

      <View style={styles.cardContent}>
        {/* CUSTOMER / STATUS */}
        <View
          style={[
            styles.cardTop,
            isDesktop && styles.cardTopDesktop,
          ]}
        >
          <View style={styles.customerBlock}>
            <LinearGradient
              colors={["#7C3AED", "#9333EA", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {getInitial(appointment?.customer?.name)}
              </Text>
              <View style={styles.onlineDot} />
            </LinearGradient>

            <View style={styles.customerCopy}>
              <View style={styles.customerNameRow}>
                <Text
                  style={styles.customerName}
                  numberOfLines={2}
                >
                  {safeString(
                    appointment?.customer?.name,
                    "Unknown customer"
                  )}
                </Text>
                <View style={styles.customerTag}>
                  <Text style={styles.customerTagText}>Customer</Text>
                </View>
              </View>

              <View style={styles.phoneRow}>
                <Ionicons
                  name="call-outline"
                  size={12}
                  color="#94A3B8"
                />
                <Text
                  style={styles.phoneText}
                  numberOfLines={2}
                >
                  {safeString(
                    appointment?.customer?.phone,
                    "No phone"
                  )}
                </Text>
              </View>
            </View>
          </View>

          <StatusBadge status={appointment?.status} compact={false} />
        </View>

        {/* INFO GRID */}
        <View style={styles.infoGrid}>
          <InfoCard
            width={informationWidth}
            icon="storefront-outline"
            iconBg="#F5F3FF"
            iconColor="#7C3AED"
            label="Salon"
            value={safeString(
              appointment?.salon?.name,
              "Unknown salon"
            )}
          />

          <InfoCard
            width={informationWidth}
            icon="cut-outline"
            iconBg="#FDF2F8"
            iconColor="#C026D3"
            label="Service"
            value={safeString(
              appointment?.service?.name,
              "Unknown service"
            )}
          />

          <InfoCard
            width={informationWidth}
            icon="person-outline"
            iconBg="#F1F5F9"
            iconColor="#64748B"
            label="Staff"
            value={safeString(
              appointment?.staff?.name,
              "Not assigned"
            )}
          />

          <ScheduleInfoCard
            width={informationWidth}
            appointment={appointment}
          />
        </View>

        {/* ACTIONS */}
        <View style={styles.actionBar}>
          <View style={styles.quickActionCopy}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="flash-outline"
                size={14}
                color="#64748B"
              />
            </View>

            <View style={styles.quickActionText}>
              <Text style={styles.quickActionTitle}>
                Quick Actions
              </Text>
              <Text style={styles.quickActionSubtitle}>
                Manage this appointment
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.actionButtons,
              isPhone && styles.actionButtonsPhone,
            ]}
          >
            <ActionButton
              label="View"
              icon="eye-outline"
              variant="neutral"
              onPress={onView}
              flex={isPhone ? 1 : 0}
            />

            {appointment?.status === "PENDING" ? (
              <>
                <ActionButton
                  label="Confirm"
                  icon="checkmark-circle-outline"
                  variant="success"
                  onPress={onConfirm}
                  disabled={updating}
                  flex={isPhone ? 1 : 0}
                />

                <ActionButton
                  label="Reject"
                  icon="close-circle-outline"
                  variant="dangerSoft"
                  onPress={onReject}
                  disabled={updating}
                  flex={isPhone ? 1 : 0}
                />
              </>
            ) : null}

            {appointment?.status === "CONFIRMED" ? (
              <ActionButton
                label="Complete"
                icon="checkmark-done-outline"
                variant="blue"
                onPress={onComplete}
                disabled={updating}
                flex={isPhone ? 1 : 0}
              />
            ) : null}

            {canCancel ? (
              <ActionButton
                label="Cancel"
                icon="close-outline"
                variant="cancel"
                onPress={onCancel}
                disabled={updating}
                flex={isPhone ? 1 : 0}
              />
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};

const StatusBadge = ({ status, compact = false }) => {
  const config = getStatus(status);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        compact && styles.statusBadgeCompact,
      ]}
    >
      <Ionicons
        name={config.icon}
        size={compact ? 12 : 14}
        color={config.color}
      />
      <Text
        style={[
          styles.statusBadgeText,
          { color: config.color },
          compact && styles.statusBadgeTextCompact,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const InfoCard = ({
  width,
  icon,
  iconBg,
  iconColor,
  label,
  value,
}) => (
  <View style={[styles.infoCard, { width }]}>
    <View style={styles.infoHeader}>
      <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>

      <Text style={styles.infoLabel}>{label}</Text>
    </View>

    <Text style={styles.infoValue} numberOfLines={4}>
      {value}
    </Text>
  </View>
);

const ScheduleInfoCard = ({ width, appointment }) => (
  <View
    style={[
      styles.infoCard,
      styles.scheduleCard,
      { width },
    ]}
  >
    <View style={styles.infoHeader}>
      <View style={styles.scheduleIcon}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color="#7C3AED"
        />
      </View>
      <Text style={styles.infoLabel}>Schedule</Text>
    </View>

    <Text style={styles.infoValue} numberOfLines={2}>
      {formatDate(appointment?.appointmentDate)}
    </Text>

    <View style={styles.timePill}>
      <Ionicons
        name="time-outline"
        size={12}
        color="#7C3AED"
      />
      <Text style={styles.timePillText}>
        {safeString(appointment?.startTime, "--")}
      </Text>
      <Text style={styles.timeDash}>-</Text>
      <Text style={styles.timePillText}>
        {safeString(appointment?.endTime, "--")}
      </Text>
    </View>
  </View>
);

const ActionButton = ({
  label,
  icon,
  variant,
  onPress,
  disabled = false,
  flex = 0,
}) => {
  const variantStyle = {
    neutral: styles.actionNeutral,
    success: styles.actionSuccess,
    dangerSoft: styles.actionDangerSoft,
    blue: styles.actionBlue,
    cancel: styles.actionCancel,
  }[variant];

  const textStyle = {
    neutral: styles.actionNeutralText,
    success: styles.actionWhiteText,
    dangerSoft: styles.actionDangerText,
    blue: styles.actionWhiteText,
    cancel: styles.actionCancelText,
  }[variant];

  const isGradient = variant === "success" || variant === "blue";

  const content = (
    <>
      <Ionicons
        name={icon}
        size={14}
        color={
          variant === "success" || variant === "blue"
            ? "#FFFFFF"
            : variant === "dangerSoft"
              ? "#DC2626"
              : variant === "cancel"
                ? "#EF4444"
                : "#475569"
        }
      />
      <Text style={textStyle}>{label}</Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionButton,
        variantStyle,
        flex ? { flex } : null,
        pressed && styles.actionPressed,
        disabled && styles.disabledButton,
      ]}
    >
      {isGradient ? (
        <LinearGradient
          colors={
            variant === "success"
              ? ["#10B981", "#0D9488"]
              : ["#2563EB", "#06B6D4"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.actionGradient}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}

      {disabled ? (
        <View style={styles.buttonLoadingOverlay}>
          <ActivityIndicator
            size="small"
            color={
              variant === "success" ||
              variant === "blue"
                ? "#FFFFFF"
                : "#7C3AED"
            }
          />
        </View>
      ) : null}
    </Pressable>
  );
};

/* =========================================================
   DATE PICKER MODAL
========================================================= */

const DatePickerModal = ({ visible, monthDate, selectedDate, isPhone, isSmallPhone, onClose, onSelectDate, onChangeMonth, onClear }) => {
  const days = getCalendarDays(monthDate);
  const monthTitle = monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const todayKey = toPickerDate(new Date());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.datePickerBackdrop} onPress={onClose}>
        <Pressable
          style={[styles.datePickerSheet, isPhone && styles.datePickerSheetPhone, isSmallPhone && styles.datePickerSheetSmallPhone]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={styles.datePickerAccent} />
          <View style={styles.datePickerHeader}>
            <View style={styles.datePickerHeaderLeft}>
              <View style={styles.datePickerIcon}>
                <Ionicons name="calendar" size={18} color="#7C3AED" />
              </View>
              <View style={styles.datePickerHeaderCopy}>
                <Text style={styles.datePickerTitle}>Select date</Text>
                <Text style={styles.datePickerSubtitle}>Choose an appointment date</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.datePickerClose} hitSlop={8}>
              <Ionicons name="close" size={19} color="#64748B" />
            </Pressable>
          </View>

          <View style={styles.calendarMonthRow}>
            <Pressable onPress={() => onChangeMonth(-1)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-back" size={18} color="#475569" />
            </Pressable>
            <Text style={styles.calendarMonthTitle} numberOfLines={1}>{monthTitle}</Text>
            <Pressable onPress={() => onChangeMonth(1)} style={styles.calendarNavButton}>
              <Ionicons name="chevron-forward" size={18} color="#475569" />
            </Pressable>
          </View>

          <View style={styles.calendarWeekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <View key={`${day}-${index}`} style={styles.calendarWeekCell}>
                <Text style={styles.calendarWeekText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {days.map((item, index) => {
              const key = toPickerDate(item.date);
              const selected = key === selectedDate;
              const today = key === todayKey;
              return (
                <Pressable
                  key={`${key}-${index}`}
                  onPress={() => onSelectDate(item.date)}
                  style={({ pressed }) => [
                    styles.calendarDay,
                    item.outside && styles.calendarDayOutside,
                    today && styles.calendarDayToday,
                    selected && styles.calendarDaySelected,
                    pressed && styles.calendarDayPressed,
                  ]}
                >
                  <Text style={[
                    styles.calendarDayText,
                    item.outside && styles.calendarDayTextOutside,
                    today && styles.calendarDayTextToday,
                    selected && styles.calendarDayTextSelected,
                  ]}>{item.day}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.datePickerFooter}>
            <Pressable onPress={() => onSelectDate(new Date())} style={styles.todayButton}>
              <Ionicons name="today-outline" size={15} color="#7C3AED" />
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>
            {selectedDate ? (
              <Pressable onPress={onClear} style={styles.clearDateButton}>
                <Text style={styles.clearDateButtonText}>Clear date</Text>
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

/* =========================================================
   DETAILS MODAL
========================================================= */

const AppointmentDetailsModal = ({
  visible,
  appointment,
  loading,
  updatingId,
  isPhone,
  isSmallPhone,
  onClose,
  onReject,
  onConfirm,
  onComplete,
}) => {
  if (!appointment) return null;

  const customer = appointment?.customer;
  const salon = appointment?.salon;
  const service = appointment?.service;
  const staff = appointment?.staff;

  const updating = updatingId === appointment?._id;

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isPhone ? "slide" : "fade"}
      onRequestClose={onClose}
    >
      <View style={styles.detailsBackdrop}>
        <View
          style={[
            styles.detailsModal,
            isPhone && styles.detailsModalPhone,
            isSmallPhone && styles.detailsModalSmallPhone,
          ]}
        >
          <LinearGradient
            colors={["#6D28D9", "#7C3AED", "#C026D3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailsHeader}
          >
            <View style={styles.detailsGlow} />

            <View style={styles.detailsHeaderContent}>
              <View style={styles.detailsHeaderCopy}>
                <Text style={styles.detailsEyebrow}>
                  Appointment Details
                </Text>

                <Text
                  style={styles.detailsTitle}
                  numberOfLines={3}
                >
                  {safeString(
                    customer?.name,
                    "Unknown customer"
                  )}
                </Text>

                <Text
                  style={styles.detailsService}
                  numberOfLines={2}
                >
                  {safeString(
                    service?.name,
                    "Unknown service"
                  )}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.detailsClose,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.detailsBody}
            contentContainerStyle={styles.detailsBodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingNotice}>
                <ActivityIndicator
                  size="small"
                  color="#7C3AED"
                />
                <Text style={styles.loadingNoticeText}>
                  Loading latest appointment details...
                </Text>
              </View>
            ) : null}

            <View style={styles.detailsGrid}>
              <DetailInfoBox
                label="Customer"
                icon="person-outline"
                value={safeString(
                  customer?.name,
                  "Unknown customer"
                )}
                lines={[
                  safeString(customer?.email, "No email"),
                  safeString(customer?.phone, "No phone"),
                ]}
              />

              <DetailInfoBox
                label="Salon"
                icon="storefront-outline"
                value={safeString(
                  salon?.name,
                  "Unknown salon"
                )}
                lines={[
                  safeString(salon?.city, "No city"),
                  safeString(salon?.address, "No address"),
                ]}
              />

              <DetailInfoBox
                label="Service"
                icon="cut-outline"
                value={safeString(
                  service?.name,
                  "Unknown service"
                )}
                lines={[
                  `Duration: ${safeString(
                    service?.duration,
                    "-"
                  )} min`,
                  `₹${safeString(service?.price, "-")}`,
                ]}
              />

              <DetailInfoBox
                label="Staff"
                icon="people-outline"
                value={safeString(
                  staff?.name,
                  "Not assigned"
                )}
                lines={
                  getSpecialization(staff)
                    ? [getSpecialization(staff)]
                    : []
                }
              />
            </View>

            <View style={styles.dateTimeBox}>
              <DateTimeItem
                icon="calendar-outline"
                label="Date"
                value={formatDate(
                  appointment?.appointmentDate
                )}
              />
              <DateTimeItem
                icon="play-outline"
                label="Start"
                value={safeString(
                  appointment?.startTime,
                  "--"
                )}
              />
              <DateTimeItem
                icon="stop-outline"
                label="End"
                value={safeString(
                  appointment?.endTime,
                  "--"
                )}
              />
            </View>

            {appointment?.notes ? (
              <View style={styles.notesBox}>
                <View style={styles.notesHeader}>
                  <Ionicons
                    name="document-text-outline"
                    size={15}
                    color="#64748B"
                  />
                  <Text style={styles.notesLabel}>
                    Customer Notes
                  </Text>
                </View>
                <Text style={styles.notesText}>
                  {safeString(appointment.notes)}
                </Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.detailsFooter}>
            <View
              style={[
                styles.detailsFooterButtons,
                isPhone && styles.detailsFooterButtonsPhone,
              ]}
            >
              {appointment?.status === "PENDING" ? (
                <>
                  <ActionButton
                    label="Reject"
                    icon="close-circle-outline"
                    variant="dangerSoft"
                    onPress={onReject}
                    disabled={loading || updating}
                    flex={1}
                  />

                  <ActionButton
                    label="Confirm Appointment"
                    icon="checkmark-circle-outline"
                    variant="success"
                    onPress={onConfirm}
                    disabled={loading || updating}
                    flex={1}
                  />
                </>
              ) : null}

              {appointment?.status === "CONFIRMED" ? (
                <ActionButton
                  label="Mark Completed"
                  icon="checkmark-done-outline"
                  variant="blue"
                  onPress={onComplete}
                  disabled={loading || updating}
                  flex={1}
                />
              ) : null}

              <ActionButton
                label="Close"
                icon="close-outline"
                variant="neutral"
                onPress={onClose}
                disabled={updating}
                flex={1}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const DetailInfoBox = ({
  label,
  icon,
  value,
  lines = [],
}) => (
  <View style={styles.detailInfoBox}>
    <View style={styles.detailInfoHeader}>
      <View style={styles.detailInfoIcon}>
        <Ionicons
          name={icon}
          size={15}
          color="#7C3AED"
        />
      </View>
      <Text style={styles.detailInfoLabel}>{label}</Text>
    </View>

    <Text
      style={styles.detailInfoValue}
      numberOfLines={4}
    >
      {value}
    </Text>

    {lines.map((line, index) => (
      <Text
        key={`${label}-${index}`}
        style={styles.detailInfoLine}
        numberOfLines={5}
      >
        {line}
      </Text>
    ))}
  </View>
);

const DateTimeItem = ({ icon, label, value }) => (
  <View style={styles.dateTimeItem}>
    <View style={styles.dateTimeHeader}>
      <Ionicons
        name={icon}
        size={14}
        color="#8B5CF6"
      />
      <Text style={styles.dateTimeLabel}>{label}</Text>
    </View>

    <Text style={styles.dateTimeValue} numberOfLines={3}>
      {value}
    </Text>
  </View>
);

/* =========================================================
   CANCEL MODAL
========================================================= */

const CancelModal = ({
  visible,
  appointment,
  loading,
  isPhone,
  onKeep,
  onConfirm,
}) => {
  if (!appointment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onKeep}
    >
      <View style={styles.cancelBackdrop}>
        <View
          style={[
            styles.cancelModal,
            isPhone && styles.cancelModalPhone,
          ]}
        >
          <LinearGradient
            colors={["#EF4444", "#F43F5E", "#F97316"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cancelAccent}
          />

          <View style={styles.cancelBody}>
            <View style={styles.cancelHeader}>
              <View style={styles.cancelIcon}>
                <Ionicons
                  name="close-circle-outline"
                  size={26}
                  color="#EF4444"
                />
              </View>

              <View style={styles.cancelHeaderCopy}>
                <Text style={styles.cancelTitle}>
                  Cancel Appointment?
                </Text>
                <Text style={styles.cancelSubtitle}>
                  Are you sure you want to cancel this appointment?
                </Text>
              </View>
            </View>

            <View style={styles.cancelPreview}>
              <Text
                style={styles.cancelCustomer}
                numberOfLines={3}
              >
                {safeString(
                  appointment?.customer?.name,
                  "Unknown customer"
                )}
              </Text>

              <Text
                style={styles.cancelService}
                numberOfLines={3}
              >
                {safeString(
                  appointment?.service?.name,
                  "Unknown service"
                )}
              </Text>

              <Text style={styles.cancelDate}>
                {formatDate(
                  appointment?.appointmentDate
                )}{" "}
                •{" "}
                {safeString(
                  appointment?.startTime,
                  "--"
                )}
              </Text>
            </View>

            <View
              style={[
                styles.cancelActions,
                isPhone && styles.cancelActionsPhone,
              ]}
            >
              <ActionButton
                label="Keep"
                icon="arrow-back-outline"
                variant="neutral"
                onPress={onKeep}
                disabled={loading}
                flex={1}
              />

              <Pressable
                onPress={onConfirm}
                disabled={loading}
                style={({ pressed }) => [
                  styles.yesCancelButton,
                  pressed && styles.actionPressed,
                  loading && styles.disabledButton,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={15}
                      color="#FFFFFF"
                    />
                    <Text style={styles.yesCancelText}>
                      Yes, Cancel
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  screen: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  content: {
    width: "100%",
    alignSelf: "center",
  },

  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  disabledButton: {
    opacity: 0.55,
  },

  fullWidth: {
    width: "100%",
  },

  /* HEADER */
  heroCard: {
    minHeight: 180,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    padding: 22,
    marginBottom: 14,
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 5,
    position: "relative",
  },

  heroGlowOne: {
    position: "absolute",
    right: -55,
    top: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "#E9D5FF",
    opacity: 0.32,
  },

  heroGlowTwo: {
    position: "absolute",
    left: "32%",
    bottom: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#F5D0FE",
    opacity: 0.18,
  },

  heroContent: {
    zIndex: 2,
    gap: 18,
  },

  heroContentDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  heroLeft: {
    flex: 1,
    minWidth: 0,
  },

  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    marginBottom: 11,
  },

  heroPillText: {
    color: "#7C3AED",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },

  heroTitle: {
    color: "#020617",
    fontSize: 44,
    lineHeight: 48,
    fontWeight: "900",
    letterSpacing: -1.8,
  },

 heroTitlePhone: {
  fontSize: 32,
  lineHeight: 38,
  letterSpacing: -1.2,
},

  heroSubtitle: {
    marginTop: 9,
    maxWidth: 760,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },

  refreshButton: {
    minHeight: 48,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },

  refreshButtonDesktop: {
    width: 142,
  },

  refreshText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "900",
  },

  /* STATS */
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginBottom: 14,
  },

  statCard: {
    minHeight: 150,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    padding: 17,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#1E293B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 25,
    elevation: 3,
  },

  statAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },

  statGlow: {
    position: "absolute",
    right: -25,
    top: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.8,
  },

  statTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  statIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    flex: 1,
    textAlign: "right",
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  statValue: {
    marginTop: 17,
    color: "#0F172A",
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
  },

  statDescription: {
    marginTop: 5,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
  },

  /* FILTER */
  filterCard: {
    position: "relative",
    overflow: "visible",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
  },

  filterGlow: {
    position: "absolute",
    right: -45,
    top: -45,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E9D5FF",
    opacity: 0.22,
  },

  filterHeader: {
    position: "relative",
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },

  filterHeaderSmallPhone: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 10,
  },

  filterTitleRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  filterIconBox: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  filterTitleCopy: {
    minWidth: 0,
    flex: 1,
  },

  filterTitle: {
    color: "#1E293B",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
  },

  filterCount: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
  },

  filterCountStrong: {
    color: "#7C3AED",
    fontWeight: "900",
  },

  clearButton: {
    minHeight: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 0,
  },

  clearButtonText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "900",
  },

  filterGrid: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  filterGridPhone: {
    flexDirection: "column",
  },

  filterGridTablet: {
    flexDirection: "row",
  },

  filterGridDesktop: {
    flexDirection: "row",
  },

  searchWrap: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  searchIcon: {
    marginLeft: 15,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 52,
    paddingHorizontal: 11,
    paddingVertical: 0,
    color: "#1E293B",
    fontSize: 13,
    fontWeight: "600",
    outlineStyle: "none",
      outlineWidth: 0,
      borderWidth: 0,
  },

  filterControl: {
    minWidth: 0,
  },

  selectField: {
    minHeight: 52,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  selectFieldActive: {
    borderColor: "#C4B5FD",
    backgroundColor: "#FFFFFF",
  },

  fieldPressed: {
    opacity: 0.84,
    backgroundColor: "#FFFFFF",
  },

  selectLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectText: {
    minWidth: 0,
    flex: 1,
    color: "#475569",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  selectTextActive: {
    color: "#6D28D9",
  },

  dateInputWrap: {
    minHeight: 52,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  dateInputWrapActive: {
    borderColor: "#C4B5FD",
    backgroundColor: "#FFFFFF",
  },

  dateIcon: { marginLeft: 14 },

  dateDisplayText: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 10,
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  dateDisplayTextActive: { color: "#6D28D9" },

  dateClear: { paddingRight: 8 },
  dateChevron: { marginLeft: 2 },

  datePickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  datePickerSheet: {
    width: 430, maxWidth: "100%", borderRadius: 28, backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#E9D5FF", padding: 18, overflow: "hidden",
    shadowColor: "#4C1D95", shadowOpacity: 0.18, shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 }, elevation: 14,
  },
  datePickerSheetPhone: { width: "100%", maxWidth: 430, borderRadius: 24, padding: 15 },
  datePickerSheetSmallPhone: { borderRadius: 22, padding: 13 },
  datePickerAccent: { position: "absolute", top: 0, left: 0, right: 0, height: 4, backgroundColor: "#8B5CF6" },
  datePickerHeader: { marginTop: 3, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  datePickerHeaderLeft: { minWidth: 0, flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  datePickerIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: "#F5F3FF", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  datePickerHeaderCopy: { minWidth: 0, flex: 1 },
  datePickerTitle: { color: "#1E293B", fontSize: 16, lineHeight: 21, fontWeight: "900" },
  datePickerSubtitle: { marginTop: 2, color: "#94A3B8", fontSize: 10, lineHeight: 15, fontWeight: "600" },
  datePickerClose: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  calendarMonthRow: { marginTop: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  calendarNavButton: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  calendarMonthTitle: { flex: 1, minWidth: 0, textAlign: "center", color: "#1E293B", fontSize: 15, lineHeight: 20, fontWeight: "900" },
  calendarWeekRow: { marginTop: 14, flexDirection: "row" },
  calendarWeekCell: { width: "14.2857%", height: 30, alignItems: "center", justifyContent: "center" },
  calendarWeekText: { color: "#94A3B8", fontSize: 10, lineHeight: 14, fontWeight: "900" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: { width: "14.2857%", aspectRatio: 1.05, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  calendarDayOutside: { opacity: 0.28 },
  calendarDayToday: { borderWidth: 1, borderColor: "#C4B5FD", backgroundColor: "#FAF5FF" },
  calendarDaySelected: { backgroundColor: "#7C3AED", borderWidth: 0 },
  calendarDayPressed: { opacity: 0.72 },
  calendarDayText: { color: "#334155", fontSize: 12, lineHeight: 16, fontWeight: "800" },
  calendarDayTextOutside: { color: "#CBD5E1" },
  calendarDayTextToday: { color: "#7C3AED", fontWeight: "900" },
  calendarDayTextSelected: { color: "#FFFFFF", fontWeight: "900" },
  datePickerFooter: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#F1F5F9", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  todayButton: { minHeight: 38, borderRadius: 12, paddingHorizontal: 13, backgroundColor: "#F5F3FF", borderWidth: 1, borderColor: "#DDD6FE", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  todayButtonText: { color: "#7C3AED", fontSize: 11, lineHeight: 15, fontWeight: "900" },
  clearDateButton: { minHeight: 38, paddingHorizontal: 11, alignItems: "center", justifyContent: "center" },
  clearDateButtonText: { color: "#94A3B8", fontSize: 11, lineHeight: 15, fontWeight: "800" },

  dateHint: {
    marginTop: 8,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
  },

  /* LIST HEADER */
  listHeaderCard: {
    minHeight: 72,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },

  listHeaderLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  listHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  listHeaderCopy: {
    minWidth: 0,
    flex: 1,
  },

  listHeaderTitle: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  listHeaderSubtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
  },

  recordsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexShrink: 0,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },

  recordsText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
  },

  /* APPOINTMENT CARD */
  appointmentList: {
    gap: 14,
  },

  appointmentCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 27,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
  },

  cardAccent: {
    width: "100%",
    height: 4,
  },

  cardContent: {
    padding: 17,
  },

  cardTop: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 13,
  },

  cardTopDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  customerBlock: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#34D399",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  customerCopy: {
    minWidth: 0,
    flex: 1,
  },

  customerNameRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  customerName: {
    maxWidth: "100%",
    color: "#1E293B",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    flexShrink: 1,
  },

  customerTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    flexShrink: 0,
  },

  customerTagText: {
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  phoneRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    minWidth: 0,
  },

  phoneText: {
    flex: 1,
    minWidth: 0,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },

  statusBadge: {
    minHeight: 35,
    alignSelf: "flex-start",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },

  statusBadgeCompact: {
    minHeight: 30,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  statusBadgeText: {
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    flexShrink: 1,
  },

  statusBadgeTextCompact: {
    fontSize: 8,
  },

  /* INFO */
  infoGrid: {
    marginTop: 15,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  infoCard: {
    minWidth: 0,
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 13,
  },

  infoHeader: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  infoValue: {
    marginTop: 10,
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },

  scheduleCard: {
    backgroundColor: "#F8F5FF",
    borderColor: "#DDD6FE",
  },

  scheduleIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },

  timePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  timePillText: {
    color: "#7C3AED",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
  },

  timeDash: {
    color: "#C4B5FD",
    fontSize: 9,
    fontWeight: "900",
  },

  /* ACTIONS */
  actionBar: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 13,
  },

  quickActionCopy: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  quickActionIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionText: {
    minWidth: 0,
  },

  quickActionTitle: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  quickActionSubtitle: {
    marginTop: 1,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
  },

  actionButtons: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },

  actionButtonsPhone: {
    alignItems: "stretch",
  },

  actionButton: {
    minHeight: 42,
    minWidth: 92,
    borderRadius: 13,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
    overflow: "hidden",
  },

  actionNeutral: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  actionSuccess: {
    backgroundColor: "#10B981",
    paddingHorizontal: 0,
  },

  actionDangerSoft: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  actionBlue: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 0,
  },

  actionCancel: {
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
  },

  actionGradient: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
  },

  actionNeutralText: {
    color: "#475569",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },

  actionWhiteText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },

  actionDangerText: {
    color: "#DC2626",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },

  actionCancelText: {
    color: "#EF4444",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },

  actionPressed: {
    opacity: 0.82,
    transform: [{ translateY: 1 }],
  },

  buttonLoadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  /* EMPTY */
  emptyCard: {
    minHeight: 390,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 50,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 28,
    elevation: 4,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: "#334155",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  emptySubtitle: {
    maxWidth: 360,
    marginTop: 7,
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 17,
    minHeight: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#7C3AED",
    fontSize: 11,
    fontWeight: "900",
  },

  /* DROPDOWN */
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  dropdownSheet: {
    maxHeight: "82%",
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 45,
    elevation: 12,
  },

  dropdownHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#CBD5E1",
    marginTop: 9,
  },

  dropdownHeader: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  dropdownTitle: {
    color: "#1E293B",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
  },

  dropdownSubtitle: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
  },

  modalCloseButtonLight: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },

  dropdownScroll: {
    flexGrow: 0,
  },

  dropdownContent: {
    padding: 10,
    gap: 6,
  },

  dropdownOption: {
    minHeight: 55,
    width: "100%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  dropdownOptionSelected: {
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },

  dropdownPressed: {
    backgroundColor: "#F8FAFC",
    opacity: 0.85,
  },

  dropdownOptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  dropdownOptionText: {
    flex: 1,
    minWidth: 0,
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  dropdownSelectedText: {
    color: "#6D28D9",
    fontWeight: "900",
  },

  dropdownEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 35,
    gap: 10,
  },

  dropdownEmptyText: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  /* DETAILS */
  detailsBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.76)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  detailsModal: {
    width: "100%",
    maxWidth: 900,
    maxHeight: "92%",
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.28,
    shadowRadius: 55,
    elevation: 15,
  },

  detailsModalPhone: {
    maxHeight: "94%",
    maxWidth: "100%",
    borderRadius: 27,
    alignSelf: "stretch",
  },

  detailsModalSmallPhone: {
    maxHeight: "96%",
    borderRadius: 23,
  },

  detailsHeader: {
    minHeight: 145,
    padding: 19,
    position: "relative",
    overflow: "hidden",
  },

  detailsGlow: {
    position: "absolute",
    right: -45,
    top: -70,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
    opacity: 0.08,
  },

  detailsHeaderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  detailsHeaderCopy: {
    minWidth: 0,
    flex: 1,
  },

  detailsEyebrow: {
    color: "#DDD6FE",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },

  detailsTitle: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
  },

  detailsService: {
    marginTop: 4,
    color: "#EDE9FE",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  detailsClose: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  detailsBody: {
    minHeight: 0,
    flexGrow: 0,
    backgroundColor: "#FFFFFF",
  },

  detailsBodyContent: {
    padding: 16,
    paddingBottom: 18,
  },

  loadingNotice: {
    minHeight: 47,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  loadingNoticeText: {
    flex: 1,
    color: "#6D28D9",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
  },

  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },

  detailInfoBox: {
    width: "48.8%",
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  detailInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailInfoIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },

  detailInfoLabel: {
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  detailInfoValue: {
    marginTop: 9,
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  detailInfoLine: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "500",
  },

  dateTimeBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F8F5FF",
    padding: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  dateTimeItem: {
    width: "31.5%",
    minWidth: 100,
  },

  dateTimeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dateTimeLabel: {
    color: "#8B5CF6",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  dateTimeValue: {
    marginTop: 5,
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
  },

  notesBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 14,
  },

  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  notesLabel: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  notesText: {
    marginTop: 8,
    color: "#475569",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "500",
  },

  detailsFooter: {
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 12,
  },

  detailsFooterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 8,
  },

  detailsFooterButtonsPhone: {
    width: "100%",
  },

  /* CANCEL */
  cancelBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.76)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  cancelModal: {
    width: "100%",
    maxWidth: 500,
    borderRadius: 27,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.3,
    shadowRadius: 55,
    elevation: 15,
  },

  cancelModalPhone: {
    maxWidth: "100%",
  },

  cancelAccent: {
    width: "100%",
    height: 5,
  },

  cancelBody: {
    padding: 18,
  },

  cancelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  cancelIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  cancelHeaderCopy: {
    minWidth: 0,
    flex: 1,
  },

  cancelTitle: {
    color: "#1E293B",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },

  cancelSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
  },

  cancelPreview: {
    marginTop: 16,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  cancelCustomer: {
    color: "#334155",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
  },

  cancelService: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  cancelDate: {
    marginTop: 7,
    color: "#7C3AED",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },

  cancelActions: {
    marginTop: 15,
    flexDirection: "row",
    gap: 8,
  },

  cancelActionsPhone: {
    width: "100%",
  },

  yesCancelButton: {
    minHeight: 44,
    flex: 1,
    borderRadius: 13,
    backgroundColor: "#EF4444",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  yesCancelText: {
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
  },

  /* LOADING */
  loadingContainer: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: 40,
  },

  skeletonHero: {
    minHeight: 180,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    padding: 22,
    marginBottom: 14,
  },

  skeletonLineSmall: {
    width: 160,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    marginBottom: 16,
  },

  skeletonLineLarge: {
    width: "48%",
    minWidth: 220,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  skeletonLineMedium: {
    width: "65%",
    maxWidth: 650,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    marginTop: 13,
  },

  skeletonStats: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },

  skeletonStat: {
    height: 145,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
  },

  skeletonFilter: {
    height: 160,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
  },

  skeletonCard: {
    height: 470,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
  },
});

export default AppointmentManagement;
