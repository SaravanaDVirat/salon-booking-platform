import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";

import {
  getAllAppointmentsAdmin,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} from "../../../../services/adminAppointmentService";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  primary: "#5146E5",
  primaryDark: "#4338CA",
  primarySoft: "#EEF2FF",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  green: "#059669",
  greenSoft: "#ECFDF5",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
  red: "#DC2626",
  redSoft: "#FEF2F2",
  slate950: "#0F172A",
  slate900: "#172033",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",
  white: "#FFFFFF",
  border: "#E7EAF0",
  shadow: "#0F172A",
};

/* =========================================================
   STATUS
========================================================= */

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: "time-outline",
    color: COLORS.amber,
    bg: COLORS.amberSoft,
    border: "#FDE68A",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: "checkmark-circle-outline",
    color: COLORS.blue,
    bg: COLORS.blueSoft,
    border: "#BFDBFE",
  },
  COMPLETED: {
    label: "Completed",
    icon: "checkmark-done-circle-outline",
    color: COLORS.green,
    bg: COLORS.greenSoft,
    border: "#A7F3D0",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "ban-outline",
    color: COLORS.red,
    bg: COLORS.redSoft,
    border: "#FECACA",
  },
  REJECTED: {
    label: "Rejected",
    icon: "close-circle-outline",
    color: COLORS.slate600,
    bg: COLORS.slate100,
    border: COLORS.slate200,
  },
};

const STATUS_OPTIONS = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status || "Unknown",
    icon: "alert-circle-outline",
    color: COLORS.slate600,
    bg: COLORS.slate100,
    border: COLORS.slate200,
  };

/* =========================================================
   DATE / TIME HELPERS
========================================================= */

const pad = (n) => String(n).padStart(2, "0");

const toLocalDateKey = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFullDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "-";
  const [hour, minute] = String(time).split(":");
  const d = new Date();
  d.setHours(Number(hour) || 0, Number(minute) || 0, 0, 0);

  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseDateKey = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatDateKeyForDisplay = (value) => {
  const d = parseDateKey(value);
  if (!d) return "Select appointment date";

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(day);

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

/* =========================================================
   MAIN
========================================================= */

const AppointmentManagement = () => {
  const { width } = useWindowDimensions();

  const isSmallMobile = width < 360;
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isDesktop = width >= 1100;

  const horizontalPadding = isSmallMobile
    ? 12
    : isMobile
      ? 16
      : isTablet
        ? 24
        : 32;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [statusPickerValue, setStatusPickerValue] = useState("ALL");
  const [statusPickerCallback, setStatusPickerCallback] = useState(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(false);
  const [error, setError] = useState("");

  const loadAppointments = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await getAllAppointmentsAdmin();
      setAppointments(data?.appointments || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError(
        err?.response?.data?.message || "Failed to load appointments"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const stats = useMemo(
    () => ({
      total: appointments.length,
      pending: appointments.filter((x) => x.status === "PENDING").length,
      confirmed: appointments.filter((x) => x.status === "CONFIRMED").length,
      completed: appointments.filter((x) => x.status === "COMPLETED").length,
      cancelled: appointments.filter(
        (x) => x.status === "CANCELLED" || x.status === "REJECTED"
      ).length,
    }),
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return appointments.filter((appointment) => {
      const customerName =
        appointment.customer?.name?.toLowerCase() || "";
      const customerEmail =
        appointment.customer?.email?.toLowerCase() || "";
      const customerPhone =
        appointment.customer?.phone?.toLowerCase() || "";
      const salonName = appointment.salon?.name?.toLowerCase() || "";
      const serviceName = appointment.service?.name?.toLowerCase() || "";
      const staffName = appointment.staff?.name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        customerName.includes(searchValue) ||
        customerEmail.includes(searchValue) ||
        customerPhone.includes(searchValue) ||
        salonName.includes(searchValue) ||
        serviceName.includes(searchValue) ||
        staffName.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" || appointment.status === statusFilter;

      const appointmentDate = toLocalDateKey(appointment.appointmentDate);
      const matchesDate =
        !dateFilter || appointmentDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointments, search, statusFilter, dateFilter]);

  const openStatusPicker = (currentValue, callback) => {
    setStatusPickerValue(currentValue);
    setStatusPickerCallback(() => callback);
    setShowStatusPicker(true);
  };

  const selectStatus = (value) => {
    setShowStatusPicker(false);
    const callback = statusPickerCallback;
    setStatusPickerCallback(null);
    if (callback) callback(value);
  };

  const handleViewDetails = async (id) => {
    try {
      const data = await getAppointmentById(id);
      setSelectedAppointment(data?.appointment || null);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch appointment details:", err);
      Alert.alert(
        "Unable to load",
        err?.response?.data?.message ||
          "Failed to fetch appointment details"
      );
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      setUpdatingStatus(true);

      const data = await updateAppointmentStatus(id, status);
      const updatedAppointment = data?.appointment;

      setAppointments((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                ...(updatedAppointment || {}),
                status,
              }
            : item
        )
      );

      setSelectedAppointment((prev) =>
        prev?._id === id
          ? {
              ...prev,
              ...(updatedAppointment || {}),
              status,
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      Alert.alert(
        "Update failed",
        err?.response?.data?.message ||
          "Failed to update appointment status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelAppointment = (id) => {
    Alert.alert(
      "Cancel appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "Keep appointment", style: "cancel" },
        {
          text: "Cancel appointment",
          style: "destructive",
          onPress: async () => {
            try {
              setCancellingAppointment(true);

              const data = await cancelAppointment(id);
              const cancelledAppointment = data?.appointment;

              setAppointments((prev) =>
                prev.map((item) =>
                  item._id === id
                    ? {
                        ...item,
                        ...(cancelledAppointment || {}),
                        status: "CANCELLED",
                      }
                    : item
                )
              );

              setSelectedAppointment((prev) =>
                prev?._id === id
                  ? {
                      ...prev,
                      ...(cancelledAppointment || {}),
                      status: "CANCELLED",
                    }
                  : prev
              );

              Alert.alert(
                "Success",
                "Appointment cancelled successfully"
              );
            } catch (err) {
              console.error("Failed to cancel appointment:", err);
              Alert.alert(
                "Cancellation failed",
                err?.response?.data?.message ||
                  "Failed to cancel appointment"
              );
            } finally {
              setCancellingAppointment(false);
            }
          },
        },
      ]
    );
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
  };

  const openCalendar = () => {
    const selected = parseDateKey(dateFilter);
    setCalendarDate(selected || new Date());
    setShowDatePicker(true);
  };

  const selectCalendarDate = (day) => {
    if (!day) return;

    const selected = new Date(
      calendarDate.getFullYear(),
      calendarDate.getMonth(),
      day
    );

    setDateFilter(
      `${selected.getFullYear()}-${pad(selected.getMonth() + 1)}-${pad(
        selected.getDate()
      )}`
    );
    setShowDatePicker(false);
  };

  const changeCalendarMonth = (delta) => {
    setCalendarDate(
      new Date(
        calendarDate.getFullYear(),
        calendarDate.getMonth() + delta,
        1
      )
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingScreen}>
          <View style={styles.loadingIcon}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={COLORS.primary}
            />
          </View>
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginTop: 18 }}
          />
          <Text style={styles.loadingTitle}>Loading appointments...</Text>
          <Text style={styles.loadingSubtitle}>
            Please wait a moment
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isSmallMobile ? 12 : isMobile ? 16 : 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadAppointments(true)}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.maxWidth}>
          {/* =================================================
              HEADER
          ================================================= */}

          <View style={styles.hero}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View
              style={[
                styles.heroContent,
                isDesktop && styles.heroDesktop,
              ]}
            >
              <View style={styles.heroText}>
                <View style={styles.breadcrumb}>
                  <Text style={styles.breadcrumbText}>ADMIN</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={11}
                    color={COLORS.primary}
                  />
                  <Text style={styles.breadcrumbText}>APPOINTMENTS</Text>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    isSmallMobile && styles.heroTitleSmall,
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit={false}
                >
                  Appointment Management
                </Text>

                <Text style={styles.heroSubtitle}>
                  Monitor and manage all salon appointments from one place.
                </Text>
              </View>

              <Pressable
                onPress={() => loadAppointments(true)}
                disabled={refreshing}
                style={({ pressed }) => [
                  styles.refreshButton,
                  isDesktop && styles.refreshDesktop,
                  pressed && { opacity: 0.85 },
                  refreshing && { opacity: 0.6 },
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={17}
                  color={COLORS.white}
                />
                <Text style={styles.refreshText}>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* =================================================
              ERROR
          ================================================= */}

          {error ? (
            <View style={styles.errorCard}>
              <View style={styles.errorIcon}>
                <Ionicons
                  name="warning-outline"
                  size={19}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.errorBody}>
                <Text style={styles.errorTitle}>
                  Unable to load appointments
                </Text>
                <Text style={styles.errorMessage}>{error}</Text>

                <Pressable
                  onPress={() => loadAppointments()}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {/* =================================================
              RESPONSIVE STATS
          ================================================= */}

          <View
            style={[
              styles.statsGrid,
              isSmallMobile && styles.statsGridSmall,
              isTablet && styles.statsGridTablet,
              isDesktop && styles.statsGridDesktop,
            ]}
          >
            <StatCard
              title="Total"
              value={stats.total}
              icon="calendar-outline"
              color={COLORS.primary}
              bg={COLORS.primarySoft}
              width={isDesktop ? "19%" : undefined}
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon="time-outline"
              color={COLORS.amber}
              bg={COLORS.amberSoft}
              width={isDesktop ? "19%" : undefined}
            />
            <StatCard
              title="Confirmed"
              value={stats.confirmed}
              icon="checkmark-circle-outline"
              color={COLORS.blue}
              bg={COLORS.blueSoft}
              width={isDesktop ? "19%" : undefined}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon="checkmark-done-circle-outline"
              color={COLORS.green}
              bg={COLORS.greenSoft}
              width={isDesktop ? "19%" : undefined}
            />
            <StatCard
              title="Cancelled"
              value={stats.cancelled}
              icon="ban-outline"
              color={COLORS.red}
              bg={COLORS.redSoft}
              width={isDesktop ? "19%" : undefined}
            />
          </View>

          {/* =================================================
              FILTER PANEL
          ================================================= */}

          <View style={styles.filterPanel}>
            <View style={styles.filterHeader}>
              <View style={styles.filterHeaderIcon}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.filterHeaderText}>
                <Text style={styles.filterTitle}>
                  Find Appointments
                </Text>
                <Text style={styles.filterSubtitle}>
                  Search and filter appointment records
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.filterFields,
                isTablet && styles.filterFieldsTablet,
                isDesktop && styles.filterFieldsDesktop,
              ]}
            >
              <View
                style={[
                  styles.searchWrap,
                  isTablet && styles.searchTablet,
                  isDesktop && styles.searchDesktop,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.slate400}
                  style={styles.inputIcon}
                />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search customer, salon, service, staff..."
                  placeholderTextColor={COLORS.slate400}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                />
              </View>

              <View
                style={[
                  isTablet && styles.statusTablet,
                  isDesktop && styles.statusDesktop,
                ]}
              >
                <FullLineSelect
                  value={statusFilter}
                  label={
                    statusFilter === "ALL"
                      ? "All Status"
                      : getStatusConfig(statusFilter).label
                  }
                  icon="filter-outline"
                  onPress={() =>
                    openStatusPicker(statusFilter, setStatusFilter)
                  }
                  disabled={false}
                />
              </View>

              <View
                style={[
                  isTablet && styles.dateTablet,
                  isDesktop && styles.dateDesktop,
                ]}
              >
                <Pressable
                  onPress={openCalendar}
                  style={({ pressed }) => [
                    styles.dateButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.slate400}
                  />
                  <Text
                    style={[
                      styles.dateButtonText,
                      !dateFilter && styles.datePlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {formatDateKeyForDisplay(dateFilter)}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={15}
                    color={COLORS.slate400}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.resultBar}>
              <Text style={styles.resultText}>
                Showing{" "}
                <Text style={styles.resultStrong}>
                  {filteredAppointments.length}
                </Text>{" "}
                of{" "}
                <Text style={styles.resultStrong}>
                  {appointments.length}
                </Text>{" "}
                appointments
              </Text>

              {Boolean(search || statusFilter !== "ALL" || dateFilter) ? (
                <Pressable
                  onPress={clearFilters}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={14}
                    color={COLORS.slate500}
                  />
                  <Text style={styles.clearText}>Clear filters</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* =================================================
              RECORDS
          ================================================= */}

          <View
            style={[
              styles.recordsHeader,
              isSmallMobile && styles.recordsHeaderSmall,
            ]}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.recordsEyebrow}>
                APPOINTMENT RECORDS
              </Text>
              <Text style={styles.recordsTitle}>All Appointments</Text>
            </View>

            <View style={styles.recordsPill}>
              <Text style={styles.recordsPillText}>
                {filteredAppointments.length} Records
              </Text>
            </View>
          </View>

          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyCard}>
              <EmptyState />
            </View>
          ) : isDesktop ? (
            <View style={styles.desktopList}>
              {filteredAppointments.map((appointment) => (
                <AppointmentRow
                  key={appointment._id}
                  appointment={appointment}
                  onView={handleViewDetails}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancelAppointment}
                  openStatusPicker={openStatusPicker}
                  updatingStatus={updatingStatus}
                  cancellingAppointment={cancellingAppointment}
                />
              ))}
            </View>
          ) : (
            <View
              style={[
                styles.mobileList,
                isTablet && styles.tabletList,
              ]}
            >
              {filteredAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  onView={handleViewDetails}
                  onStatusChange={handleStatusChange}
                  onCancel={handleCancelAppointment}
                  openStatusPicker={openStatusPicker}
                  updatingStatus={updatingStatus}
                  cancellingAppointment={cancellingAppointment}
                  isTablet={isTablet}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* =====================================================
          STATUS PICKER
      ===================================================== */}

      <StatusPickerModal
        visible={showStatusPicker}
        value={statusPickerValue}
        title={
          statusPickerValue === "ALL"
            ? "Select Status"
            : "Change Appointment Status"
        }
        allowAll={statusPickerCallback !== null}
        onClose={() => {
          setShowStatusPicker(false);
          setStatusPickerCallback(null);
        }}
        onSelect={selectStatus}
      />

      {/* =====================================================
          CALENDAR
      ===================================================== */}

      <CalendarModal
        visible={showDatePicker}
        selectedDate={dateFilter}
        calendarDate={calendarDate}
        onClose={() => setShowDatePicker(false)}
        onMonthChange={changeCalendarMonth}
        onSelect={selectCalendarDate}
        onClear={() => {
          setDateFilter("");
          setShowDatePicker(false);
        }}
      />

      {/* =====================================================
          DETAILS
      ===================================================== */}

      <AppointmentDetailsModal
        visible={showDetailsModal && !!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        onStatusChange={handleStatusChange}
        onCancel={handleCancelAppointment}
        openStatusPicker={openStatusPicker}
        updatingStatus={updatingStatus}
        cancellingAppointment={cancellingAppointment}
        isSmallMobile={isSmallMobile}
      />
    </SafeAreaView>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value, icon, color, bg, width }) => (
  <View
    style={[
      styles.statCard,
      width ? { width } : null,
    ]}
  >
    <View style={styles.statTop}>
      <View style={styles.statText}>
        <Text style={styles.statLabel} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: bg,
          },
        ]}
      >
        <Ionicons name={icon} size={19} color={color} />
      </View>
    </View>
  </View>
);

/* =========================================================
   FULL-LINE SELECT
   ========================================================= */

const FullLineSelect = ({
  value,
  label,
  icon,
  onPress,
  disabled,
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.selectButton,
      pressed && styles.pressed,
      disabled && { opacity: 0.5 },
    ]}
  >
    <Ionicons
      name={icon}
      size={18}
      color={COLORS.slate400}
    />

    <Text
      style={styles.selectButtonText}
      numberOfLines={1}
    >
      {label}
    </Text>

    <Ionicons
      name="chevron-down"
      size={16}
      color={COLORS.slate400}
    />
  </Pressable>
);

/* =========================================================
   STATUS PICKER MODAL
========================================================= */

const StatusPickerModal = ({
  visible,
  value,
  title,
  allowAll,
  onClose,
  onSelect,
}) => {
  const options = allowAll
    ? ["ALL", ...STATUS_OPTIONS]
    : STATUS_OPTIONS;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.pickerModal}>
          <View style={styles.pickerHeader}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pickerEyebrow}>
                APPOINTMENT
              </Text>
              <Text style={styles.pickerTitle}>
                {title}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <Ionicons
                name="close"
                size={19}
                color={COLORS.slate600}
              />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 430 }}
            contentContainerStyle={styles.pickerList}
            showsVerticalScrollIndicator={false}
          >
            {options.map((option) => {
              const active = value === option;

              if (option === "ALL") {
                return (
                  <Pressable
                    key={option}
                    onPress={() => onSelect(option)}
                    style={[
                      styles.statusOption,
                      active && styles.statusOptionActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusOptionIcon,
                        active && {
                          backgroundColor: COLORS.primarySoft,
                        },
                      ]}
                    >
                      <Ionicons
                        name="apps-outline"
                        size={19}
                        color={
                          active
                            ? COLORS.primary
                            : COLORS.slate500
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.statusOptionText,
                        active && styles.statusOptionTextActive,
                      ]}
                    >
                      All Status
                    </Text>

                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={21}
                        color={COLORS.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              }

              const config = getStatusConfig(option);

              return (
                <Pressable
                  key={option}
                  onPress={() => onSelect(option)}
                  style={[
                    styles.statusOption,
                    active && {
                      borderColor: config.border,
                      backgroundColor: config.bg,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusOptionIcon,
                      { backgroundColor: config.bg },
                    ]}
                  >
                    <Ionicons
                      name={config.icon}
                      size={19}
                      color={config.color}
                    />
                  </View>

                  <Text
                    style={[
                      styles.statusOptionText,
                      active && {
                        color: config.color,
                        fontWeight: "900",
                      },
                    ]}
                  >
                    {config.label}
                  </Text>

                  {active ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={21}
                      color={config.color}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   CALENDAR MODAL
========================================================= */

const CalendarModal = ({
  visible,
  selectedDate,
  calendarDate,
  onClose,
  onMonthChange,
  onSelect,
  onClear,
}) => {
  const monthDays = getMonthDays(
    calendarDate.getFullYear(),
    calendarDate.getMonth()
  );

  const monthName = calendarDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const todayKey = toLocalDateKey(new Date());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarHeaderIcon}>
              <Ionicons
                name="calendar"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.pickerEyebrow}>
                DATE FILTER
              </Text>
              <Text
                style={styles.calendarSelected}
                numberOfLines={1}
              >
                {selectedDate
                  ? formatDateKeyForDisplay(selectedDate)
                  : "Choose appointment date"}
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <Ionicons
                name="close"
                size={19}
                color={COLORS.slate600}
              />
            </Pressable>
          </View>

          <View style={styles.calendarBody}>
            <View style={styles.monthNav}>
              <Pressable
                onPress={() => onMonthChange(-1)}
                style={styles.monthButton}
              >
                <Ionicons
                  name="chevron-back"
                  size={18}
                  color={COLORS.slate700}
                />
              </Pressable>

              <Text style={styles.monthTitle}>
                {monthName}
              </Text>

              <Pressable
                onPress={() => onMonthChange(1)}
                style={styles.monthButton}
              >
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.slate700}
                />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map(
                (day, index) => (
                  <View
                    key={`${day}-${index}`}
                    style={styles.weekCell}
                  >
                    <Text style={styles.weekText}>
                      {day}
                    </Text>
                  </View>
                )
              )}
            </View>

            <View style={styles.calendarGrid}>
              {monthDays.map((day, index) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.dayCell}
                    />
                  );
                }

                const date = new Date(
                  calendarDate.getFullYear(),
                  calendarDate.getMonth(),
                  day
                );
                const key = toLocalDateKey(date);
                const selected = selectedDate === key;
                const today = todayKey === key;

                return (
                  <Pressable
                    key={key}
                    onPress={() => onSelect(day)}
                    style={[
                      styles.dayCell,
                      selected && styles.daySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.daySelectedText,
                        today &&
                          !selected &&
                          styles.todayText,
                      ]}
                    >
                      {day}
                    </Text>

                    {today && !selected ? (
                      <View style={styles.todayDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.calendarFooter}>
              <Pressable
                onPress={onClear}
                style={styles.calendarClear}
              >
                <Text style={styles.calendarClearText}>
                  Clear date
                </Text>
              </Pressable>

              <Pressable
                onPress={onClose}
                style={styles.calendarDone}
              >
                <Text style={styles.calendarDoneText}>
                  Done
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
      ]}
    >
      <Ionicons
        name={config.icon}
        size={13}
        color={config.color}
      />
      <Text
        style={[
          styles.statusBadgeText,
          { color: config.color },
        ]}
        numberOfLines={1}
      >
        {config.label}
      </Text>
    </View>
  );
};

/* =========================================================
   APPOINTMENT ROW - DESKTOP
========================================================= */

const AppointmentRow = ({
  appointment,
  onView,
  onStatusChange,
  onCancel,
  openStatusPicker,
  updatingStatus,
  cancellingAppointment,
}) => (
  <View style={styles.appointmentRow}>
    <View style={styles.rowAccent} />

    <View style={styles.rowContent}>
      <View style={styles.rowHeader}>
        <View style={styles.customerBlock}>
          <View style={styles.customerAvatar}>
            <Ionicons
              name="person-outline"
              size={21}
              color={COLORS.slate600}
            />
          </View>

          <View style={styles.customerText}>
            <Text
              style={styles.customerName}
              numberOfLines={1}
            >
              {appointment.customer?.name ||
                "Unknown Customer"}
            </Text>

            <View style={styles.customerContact}>
              <Ionicons
                name={
                  appointment.customer?.phone
                    ? "call-outline"
                    : "mail-outline"
                }
                size={12}
                color={COLORS.slate400}
              />
              <Text
                style={styles.customerContactText}
                numberOfLines={1}
              >
                {appointment.customer?.phone ||
                  appointment.customer?.email ||
                  "-"}
              </Text>
            </View>
          </View>
        </View>

        <StatusBadge status={appointment.status} />
      </View>

      <View style={styles.desktopInfoGrid}>
        <DesktopInfo
          icon="storefront-outline"
          label="Salon"
          value={appointment.salon?.name || "-"}
        />

        <DesktopInfo
          icon="sparkles-outline"
          label="Service"
          value={appointment.service?.name || "-"}
          secondary={
            appointment.service?.price !== undefined
              ? `₹${appointment.service.price}`
              : ""
          }
        />

        <DesktopInfo
          icon="person-outline"
          label="Staff"
          value={appointment.staff?.name || "-"}
          secondary={
            appointment.staff?.specialization || ""
          }
        />

        <DesktopInfo
          icon="calendar-outline"
          label="Schedule"
          value={formatDate(
            appointment.appointmentDate
          )}
          secondary={`${formatTime(
            appointment.startTime
          )} - ${formatTime(
            appointment.endTime
          )}`}
        />
      </View>

      <View style={styles.rowActions}>
        <Pressable
          onPress={() => onView(appointment._id)}
          style={styles.secondaryAction}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={COLORS.slate700}
          />
          <Text style={styles.secondaryActionText}>
            View Details
          </Text>
        </Pressable>

        <View style={styles.desktopStatusControl}>
          <FullLineSelect
            value={appointment.status}
            label={getStatusConfig(appointment.status).label}
            icon="swap-vertical-outline"
            onPress={() =>
              openStatusPicker(
                appointment.status,
                (status) =>
                  onStatusChange(
                    appointment._id,
                    status
                  )
              )
            }
            disabled={
              updatingStatus ||
              cancellingAppointment
            }
          />
        </View>

        {(appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED") && (
          <Pressable
            onPress={() =>
              onCancel(appointment._id)
            }
            disabled={
              cancellingAppointment ||
              updatingStatus
            }
            style={[
              styles.cancelAction,
              (cancellingAppointment ||
                updatingStatus) &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name="ban-outline"
              size={16}
              color={COLORS.red}
            />
            <Text style={styles.cancelActionText}>
              {cancellingAppointment
                ? "Cancelling..."
                : "Cancel"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  </View>
);

/* =========================================================
   DESKTOP INFO
========================================================= */

const DesktopInfo = ({
  icon,
  label,
  value,
  secondary,
}) => (
  <View style={styles.desktopInfo}>
    <View style={styles.desktopInfoTop}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={15}
          color={COLORS.primary}
        />
      </View>

      <Text
        style={styles.desktopInfoLabel}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>

    <Text
      style={styles.desktopInfoValue}
      numberOfLines={2}
    >
      {value}
    </Text>

    {secondary ? (
      <Text
        style={styles.desktopInfoSecondary}
        numberOfLines={1}
      >
        {secondary}
      </Text>
    ) : null}
  </View>
);

/* =========================================================
   APPOINTMENT CARD - MOBILE / TABLET
========================================================= */

const AppointmentCard = ({
  appointment,
  onView,
  onStatusChange,
  onCancel,
  openStatusPicker,
  updatingStatus,
  cancellingAppointment,
  isTablet,
}) => (
  <View
    style={[
      styles.appointmentCard,
      isTablet && styles.appointmentCardTablet,
    ]}
  >
    <View style={styles.rowAccent} />

    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={styles.customerBlock}>
          <View style={styles.mobileAvatar}>
            <Ionicons
              name="person-outline"
              size={19}
              color={COLORS.slate600}
            />
          </View>

          <View style={styles.customerText}>
            <Text
              style={styles.mobileCustomerName}
              numberOfLines={1}
            >
              {appointment.customer?.name ||
                "Unknown Customer"}
            </Text>

            <Text
              style={styles.mobileCustomerContact}
              numberOfLines={1}
            >
              {appointment.customer?.phone ||
                appointment.customer?.email ||
                "-"}
            </Text>
          </View>
        </View>

        <StatusBadge status={appointment.status} />
      </View>

      <View
        style={[
          styles.mobileInfoGrid,
          isTablet && styles.mobileInfoGridTablet,
        ]}
      >
        <InfoItem
          icon="storefront-outline"
          label="Salon"
          value={appointment.salon?.name || "-"}
          isTablet={isTablet}
        />
        <InfoItem
          icon="sparkles-outline"
          label="Service"
          value={appointment.service?.name || "-"}
          isTablet={isTablet}
        />
        <InfoItem
          icon="person-outline"
          label="Staff"
          value={appointment.staff?.name || "-"}
          isTablet={isTablet}
        />
        <InfoItem
          icon="calendar-outline"
          label="Appointment"
          value={formatDate(
            appointment.appointmentDate
          )}
          isTablet={isTablet}
        />
      </View>

      <View style={styles.timePriceBar}>
        <View style={styles.timeBlock}>
          <View style={styles.timeIcon}>
            <Ionicons
              name="time-outline"
              size={15}
              color={COLORS.primary}
            />
          </View>

          <Text
            style={styles.timeText}
            numberOfLines={1}
          >
            {formatTime(appointment.startTime)} -{" "}
            {formatTime(appointment.endTime)}
          </Text>
        </View>

        <Text style={styles.priceText}>
          ₹{appointment.service?.price ?? 0}
        </Text>
      </View>

      <View style={styles.mobileActions}>
        <Pressable
          onPress={() => onView(appointment._id)}
          style={styles.mobileViewAction}
        >
          <Ionicons
            name="eye-outline"
            size={16}
            color={COLORS.slate700}
          />
          <Text style={styles.mobileViewText}>
            View Details
          </Text>
        </Pressable>

        <View style={styles.mobileStatusAction}>
          <FullLineSelect
            value={appointment.status}
            label={getStatusConfig(appointment.status).label}
            icon="swap-vertical-outline"
            onPress={() =>
              openStatusPicker(
                appointment.status,
                (status) =>
                  onStatusChange(
                    appointment._id,
                    status
                  )
              )
            }
            disabled={
              updatingStatus ||
              cancellingAppointment
            }
          />
        </View>

        {(appointment.status === "PENDING" ||
          appointment.status === "CONFIRMED") && (
          <Pressable
            onPress={() =>
              onCancel(appointment._id)
            }
            disabled={
              cancellingAppointment ||
              updatingStatus
            }
            style={[
              styles.mobileCancelAction,
              (cancellingAppointment ||
                updatingStatus) &&
                styles.disabled,
            ]}
          >
            <Ionicons
              name="ban-outline"
              size={16}
              color={COLORS.red}
            />
            <Text style={styles.mobileCancelText}>
              {cancellingAppointment
                ? "Cancelling..."
                : "Cancel Appointment"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  </View>
);

/* =========================================================
   INFO ITEM
========================================================= */

const InfoItem = ({
  icon,
  label,
  value,
  isTablet = false,
}) => (
  <View style={[styles.infoItem, isTablet && { width: "48.5%" }]}>
    <View style={styles.infoItemIcon}>
      <Ionicons
        name={icon}
        size={15}
        color={COLORS.primary}
      />
    </View>

    <View style={styles.infoItemText}>
      <Text
        style={styles.infoItemLabel}
        numberOfLines={1}
      >
        {label}
      </Text>

      <Text
        style={styles.infoItemValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  </View>
);

/* =========================================================
   DETAILS MODAL
========================================================= */

const AppointmentDetailsModal = ({
  visible,
  appointment,
  onClose,
  onStatusChange,
  onCancel,
  openStatusPicker,
  updatingStatus,
  cancellingAppointment,
  isSmallMobile,
}) => {
  if (!appointment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalBackdrop,
          isSmallMobile && styles.modalBackdropSmall,
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View
          style={[
            styles.detailsModal,
            isSmallMobile && styles.detailsModalSmall,
          ]}
        >
          <View
            style={[
              styles.detailsHeader,
              isSmallMobile && styles.detailsHeaderSmall,
            ]}
          >
            <View style={styles.detailsHeaderText}>
              <Text style={styles.pickerEyebrow}>
                APPOINTMENT DETAILS
              </Text>
              <Text
                style={styles.detailsTitle}
                numberOfLines={1}
              >
                Booking Information
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <Ionicons
                name="close"
                size={19}
                color={COLORS.slate600}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={[
              styles.detailsBody,
              isSmallMobile && styles.detailsBodySmall,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Status */}
            <View
              style={[
                styles.detailsStatusCard,
                isSmallMobile && styles.detailsStatusCardSmall,
              ]}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.detailsMiniLabel}>
                  CURRENT STATUS
                </Text>
                <View style={{ marginTop: 8 }}>
                  <StatusBadge
                    status={appointment.status}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.detailsStatusControls,
                  isSmallMobile && styles.detailsStatusControlsSmall,
                ]}
              >
                <View
                  style={[
                    styles.detailsSelect,
                    isSmallMobile && styles.detailsSelectSmall,
                  ]}
                >
                  <FullLineSelect
                    value={appointment.status}
                    label={
                      getStatusConfig(
                        appointment.status
                      ).label
                    }
                    icon="swap-vertical-outline"
                    onPress={() =>
                      openStatusPicker(
                        appointment.status,
                        (status) =>
                          onStatusChange(
                            appointment._id,
                            status
                          )
                      )
                    }
                    disabled={
                      updatingStatus ||
                      cancellingAppointment
                    }
                  />
                </View>

                {(appointment.status ===
                  "PENDING" ||
                  appointment.status ===
                    "CONFIRMED") && (
                  <Pressable
                    onPress={() =>
                      onCancel(
                        appointment._id
                      )
                    }
                    disabled={
                      cancellingAppointment ||
                      updatingStatus
                    }
                    style={[
                      styles.detailsCancel,
                      (cancellingAppointment ||
                        updatingStatus) &&
                        styles.disabled,
                    ]}
                  >
                    <Ionicons
                      name="ban-outline"
                      size={15}
                      color={COLORS.red}
                    />
                    <Text
                      style={
                        styles.detailsCancelText
                      }
                    >
                      {cancellingAppointment
                        ? "Cancelling..."
                        : "Cancel"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Customer */}
            <DetailSection
              title="Customer"
              icon="person-outline"
            >
              <DetailGrid>
                <DetailValue
                  icon="person-outline"
                  label="Name"
                  value={
                    appointment.customer?.name ||
                    "-"
                  }
                />
                <DetailValue
                  icon="mail-outline"
                  label="Email"
                  value={
                    appointment.customer?.email ||
                    "-"
                  }
                />
                <DetailValue
                  icon="call-outline"
                  label="Phone"
                  value={
                    appointment.customer?.phone ||
                    "-"
                  }
                />
              </DetailGrid>
            </DetailSection>

            {/* Salon & Service */}
            <DetailSection
              title="Salon & Service"
              icon="storefront-outline"
            >
              <DetailGrid>
                <DetailValue
                  icon="storefront-outline"
                  label="Salon"
                  value={
                    appointment.salon?.name || "-"
                  }
                />
                <DetailValue
                  icon="sparkles-outline"
                  label="Service"
                  value={
                    appointment.service?.name ||
                    "-"
                  }
                />
                <DetailValue
                  icon="cash-outline"
                  label="Price"
                  value={`₹${
                    appointment.service?.price ??
                    0
                  }`}
                />
                <DetailValue
                  icon="time-outline"
                  label="Duration"
                  value={
                    appointment.service?.duration
                      ? `${appointment.service.duration} minutes`
                      : "-"
                  }
                />
              </DetailGrid>
            </DetailSection>

            {/* Schedule */}
            <DetailSection
              title="Schedule"
              icon="calendar-outline"
            >
              <DetailGrid>
                <DetailValue
                  icon="calendar-outline"
                  label="Date"
                  value={formatFullDate(
                    appointment.appointmentDate
                  )}
                />
                <DetailValue
                  icon="time-outline"
                  label="Time"
                  value={`${formatTime(
                    appointment.startTime
                  )} - ${formatTime(
                    appointment.endTime
                  )}`}
                />
                <DetailValue
                  icon="person-outline"
                  label="Staff"
                  value={
                    appointment.staff?.name ||
                    "-"
                  }
                />
                <DetailValue
                  icon="briefcase-outline"
                  label="Specialization"
                  value={
                    appointment.staff
                      ?.specialization || "-"
                  }
                />
              </DetailGrid>
            </DetailSection>

            {/* Notes */}
            {appointment.notes ? (
              <DetailSection
                title="Customer Notes"
                icon="document-text-outline"
              >
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>
                    {appointment.notes}
                  </Text>
                </View>
              </DetailSection>
            ) : null}

            <View style={styles.detailsFooter}>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>
                  Close
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/* =========================================================
   DETAIL SECTION
========================================================= */

const DetailSection = ({
  title,
  icon,
  children,
}) => (
  <View style={styles.detailSection}>
    <View style={styles.detailSectionHeader}>
      <View style={styles.detailSectionIcon}>
        <Ionicons
          name={icon}
          size={16}
          color={COLORS.primary}
        />
      </View>

      <Text
        style={styles.detailSectionTitle}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>

    {children}
  </View>
);

/* =========================================================
   DETAIL GRID
========================================================= */

const DetailGrid = ({ children }) => (
  <View style={styles.detailGrid}>
    {children}
  </View>
);

/* =========================================================
   DETAIL VALUE
========================================================= */

const DetailValue = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.detailValue}>
    <View style={styles.detailValueTop}>
      <Ionicons
        name={icon}
        size={13}
        color={COLORS.slate400}
      />
      <Text
        style={styles.detailValueLabel}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>

    <Text style={styles.detailValueText}>
      {value}
    </Text>
  </View>
);

/* =========================================================
   EMPTY
========================================================= */

const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>
      <Ionicons
        name="calendar-outline"
        size={29}
        color={COLORS.primary}
      />
    </View>

    <Text style={styles.emptyTitle}>
      No appointments found
    </Text>

    <Text style={styles.emptyText}>
      Try changing your search or filters to find the
      appointments you are looking for.
    </Text>
  </View>
);

/* =========================================================
   STYLES
========================================================= */

const shadow = Platform.select({
  ios: {
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  android: {
    elevation: 3,
  },
  web: {
    boxShadow: "0px 10px 30px rgba(15,23,42,0.06)",
  },
});

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },

  maxWidth: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
  },

  pressed: {
    opacity: 0.8,
  },

  disabled: {
    opacity: 0.5,
  },

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.slate50,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#DBE4FF",
  },

  loadingTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.slate800,
  },

  loadingSubtitle: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate400,
  },

  /* -------------------------------------------------------
     HERO
  ------------------------------------------------------- */

  hero: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E7FF",
    backgroundColor: "rgba(255,255,255,0.97)",
    marginBottom: 18,
    ...shadow,
  },

  heroGlowOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -65,
    top: -95,
    backgroundColor: "#EEF2FF",
    opacity: 0.9,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    left: -90,
    bottom: -105,
    backgroundColor: "#EFF6FF",
    opacity: 0.8,
  },

  heroContent: {
    position: "relative",
    padding: 17,
    gap: 17,
  },

  heroDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 28,
    gap: 28,
  },

  heroText: {
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
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: COLORS.primary,
  },

  heroTitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: COLORS.slate950,
  },

  heroTitleSmall: {
    fontSize: 25,
    lineHeight: 30,
  },

  heroSubtitle: {
    marginTop: 7,
    maxWidth: 720,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  refreshButton: {
    minHeight: 44,
    width: "100%",
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
  },

  refreshDesktop: {
    width: 132,
    flexShrink: 0,
  },

  refreshText: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.white,
  },

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  errorCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    marginBottom: 18,
    padding: 14,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.white,
  },

  errorIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.redSoft,
  },

  errorBody: {
    flex: 1,
    minWidth: 0,
  },

  errorTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#991B1B",
  },

  errorMessage: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    color: "#B91C1C",
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 9,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: COLORS.red,
  },

  retryText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },

  /* -------------------------------------------------------
     STATS
  ------------------------------------------------------- */

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 18,
  },

  statsGridSmall: {
    gap: 9,
  },

  statsGridTablet: {
    gap: 12,
  },

  statsGridDesktop: {
    flexWrap: "nowrap",
    gap: 0,
  },

  statCard: {
    width: "48.5%",
    minHeight: 105,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    padding: 12,
    ...shadow,
  },

  statTop: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  statText: {
    flex: 1,
    minWidth: 0,
  },

  statLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.05,
    color: COLORS.slate400,
  },

  statValue: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: "900",
    letterSpacing: -0.7,
    color: COLORS.slate900,
  },

  statIcon: {
    width: 39,
    height: 39,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  /* -------------------------------------------------------
     FILTER
  ------------------------------------------------------- */

  filterPanel: {
    marginBottom: 22,
    padding: 13,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },

  filterHeaderIcon: {
    width: 39,
    height: 39,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },

  filterHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  filterTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  filterSubtitle: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate400,
  },

  filterFields: {
    gap: 9,
  },

  filterFieldsTablet: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  filterFieldsDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },

  searchWrap: {
    minHeight: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate50,
    paddingHorizontal: 12,
  },

  searchTablet: {
    flex: 2,
  },

  searchDesktop: {
    flex: 2.2,
  },

  inputIcon: {
    marginRight: 9,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    paddingVertical: 0,
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.slate700,
    outlineStyle: "none",
  },

  selectButton: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate50,
    paddingHorizontal: 12,
  },

  selectButtonText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    color: COLORS.slate700,
  },

  statusTablet: {
    flex: 1,
    minWidth: 145,
  },

  statusDesktop: {
    flex: 0.85,
    minWidth: 170,
  },

  dateTablet: {
    flex: 1,
    minWidth: 155,
  },

  dateDesktop: {
    flex: 0.9,
    minWidth: 175,
  },

  dateButton: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.slate50,
    paddingHorizontal: 12,
  },

  dateButtonText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.slate700,
  },

  datePlaceholder: {
    color: COLORS.slate400,
  },

  resultBar: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },

  resultText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  resultStrong: {
    fontWeight: "900",
    color: COLORS.slate900,
  },

  clearButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },

  clearText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.slate500,
  },

  /* -------------------------------------------------------
     RECORDS HEADER
  ------------------------------------------------------- */

  recordsHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 18,
    marginBottom: 17,
    paddingHorizontal: 2,
  },

  recordsHeaderSmall: {
    marginTop: 16,
    marginBottom: 16,
    gap: 7,
  },

  recordsEyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: COLORS.primary,
  },

  recordsTitle: {
    marginTop: 6,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  recordsPill: {
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  recordsPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slate500,
  },

  desktopList: {
    gap: 13,
  },

  mobileList: {
    gap: 12,
  },

  tabletList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 12,
  },

  /* -------------------------------------------------------
     DESKTOP APPOINTMENT
  ------------------------------------------------------- */

  appointmentRow: {
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  rowAccent: {
    height: 3,
    width: "100%",
    backgroundColor: COLORS.primary,
  },

  rowContent: {
    padding: 17,
  },

  rowHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },

  customerBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 10,
  },

  customerAvatar: {
    width: 46,
    height: 46,
    flexShrink: 0,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate100,
  },

  customerText: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  customerContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },

  customerContactText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  statusBadge: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    flexShrink: 0,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  statusBadgeText: {
    maxWidth: 140,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.35,
  },

  desktopInfoGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  desktopInfo: {
    flex: 1,
    minWidth: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: "#FAFBFD",
    padding: 12,
  },

  desktopInfoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minWidth: 0,
  },

  infoIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  desktopInfoLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.slate400,
  },

  desktopInfoValue: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: COLORS.slate800,
  },

  desktopInfoSecondary: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },

  secondaryAction: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
  },

  secondaryActionText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.slate700,
  },

  desktopStatusControl: {
    width: 178,
  },

  cancelAction: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redSoft,
    paddingHorizontal: 13,
  },

  cancelActionText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.red,
  },

  /* -------------------------------------------------------
     MOBILE CARD
  ------------------------------------------------------- */

  appointmentCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  appointmentCardTablet: {
    width: "48.5%",
  },

  cardContent: {
    padding: 13,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 9,
  },

  mobileAvatar: {
    width: 41,
    height: 41,
    flexShrink: 0,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate100,
  },

  mobileCustomerName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  mobileCustomerContact: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  mobileInfoGrid: {
    gap: 8,
    marginTop: 13,
  },

  mobileInfoGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  infoItem: {
    minHeight: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: COLORS.white,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  infoItemText: {
    flex: 1,
    minWidth: 0,
  },

  infoItemIcon: {
    width: 31,
    height: 31,
    flexShrink: 0,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate50,
  },

  infoItemLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.75,
    color: COLORS.slate400,
  },

  infoItemValue: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    color: COLORS.slate800,
  },

  timePriceBar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  timeBlock: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  timeIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },

  timeText: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.slate600,
  },

  priceText: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  mobileActions: {
    gap: 8,
    marginTop: 9,
  },

  mobileViewAction: {
    width: "100%",
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
  },

  mobileViewText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.slate700,
  },

  mobileStatusAction: {
    width: "100%",
  },

  mobileCancelAction: {
    width: "100%",
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redSoft,
  },

  mobileCancelText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.red,
  },

  /* -------------------------------------------------------
     EMPTY
  ------------------------------------------------------- */

  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 50,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },

  emptyTitle: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  emptyText: {
    maxWidth: 430,
    marginTop: 7,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: COLORS.slate500,
  },

  /* -------------------------------------------------------
     GENERIC MODALS
  ------------------------------------------------------- */

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.64)",
    padding: 14,
  },

  modalBackdropSmall: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  pickerModal: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "82%",
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },

  pickerEyebrow: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.25,
    color: COLORS.primary,
  },

  pickerTitle: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  modalClose: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate100,
  },

  pickerList: {
    padding: 12,
    gap: 8,
  },

  statusOption: {
    minHeight: 57,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
  },

  statusOptionActive: {
    borderColor: "#C7D2FE",
    backgroundColor: COLORS.primarySoft,
  },

  statusOptionIcon: {
    width: 35,
    height: 35,
    flexShrink: 0,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate100,
  },

  statusOptionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.slate700,
  },

  statusOptionTextActive: {
    fontWeight: "900",
    color: COLORS.primary,
  },

  /* -------------------------------------------------------
     CALENDAR
  ------------------------------------------------------- */

  calendarModal: {
    width: "100%",
    maxWidth: 430,
    overflow: "hidden",
    borderRadius: 23,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
  },

  calendarHeaderIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },

  calendarSelected: {
    marginTop: 3,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  calendarBody: {
    padding: 14,
  },

  monthNav: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slate50,
    borderWidth: 1,
    borderColor: COLORS.slate100,
  },

  monthTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  weekRow: {
    flexDirection: "row",
    marginTop: 9,
  },

  weekCell: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
  },

  weekText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.slate400,
  },

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: "14.2857%",
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  daySelected: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },

  dayText: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.slate700,
  },

  daySelectedText: {
    color: COLORS.white,
    fontWeight: "900",
  },

  todayText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  todayDot: {
    position: "absolute",
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  calendarFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 9,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },

  calendarClear: {
    minHeight: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    paddingHorizontal: 13,
  },

  calendarClearText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.slate500,
  },

  calendarDone: {
    minHeight: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
  },

  calendarDoneText: {
    fontSize: 11,
    fontWeight: "900",
    color: COLORS.white,
  },

  /* -------------------------------------------------------
     DETAILS
  ------------------------------------------------------- */

  detailsModal: {
    width: "100%",
    maxWidth: 900,
    maxHeight: "92%",
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: COLORS.white,
    ...shadow,
  },

  detailsModalSmall: {
    width: "100%",
    maxHeight: "94%",
    borderRadius: 19,
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    backgroundColor: COLORS.white,
  },

  detailsHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  detailsHeaderSmall: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  detailsTitle: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  detailsScroll: {
    flex: 1,
  },

  detailsBody: {
    padding: 14,
    paddingBottom: 20,
  },

  detailsBodySmall: {
    padding: 10,
    paddingBottom: 16,
  },

  detailsStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DBE4FF",
    backgroundColor: "#F8FAFF",
    padding: 12,
  },

  detailsStatusCardSmall: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    padding: 10,
  },

  detailsMiniLabel: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: COLORS.slate400,
  },

  detailsStatusControls: {
    flexShrink: 1,
    alignItems: "flex-end",
    gap: 7,
  },

  detailsStatusControlsSmall: {
    width: "100%",
    flexShrink: 0,
    alignItems: "stretch",
    gap: 8,
  },

  detailsSelect: {
    width: 175,
    maxWidth: "100%",
  },

  detailsSelectSmall: {
    width: "100%",
    maxWidth: "100%",
  },

  detailsCancel: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: COLORS.redSoft,
    paddingHorizontal: 12,
  },

  detailsCancelText: {
    fontSize: 10,
    fontWeight: "900",
    color: COLORS.red,
  },

  detailSection: {
    marginTop: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: "#FBFCFE",
    padding: 12,
  },

  detailSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  detailSectionIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
  },

  detailSectionTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.slate900,
  },

  detailGrid: {
    gap: 8,
  },

  detailValue: {
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: COLORS.white,
    padding: 10,
  },

  detailValueTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  detailValueLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: COLORS.slate400,
  },

  detailValueText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: COLORS.slate800,
  },

  notesBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    backgroundColor: COLORS.white,
    padding: 11,
  },

  notesText: {
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: COLORS.slate600,
  },

  detailsFooter: {
    alignItems: "flex-end",
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
  },

  closeButton: {
    minHeight: 42,
    minWidth: 105,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
  },

  closeButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.white,
  },
});

export default AppointmentManagement;
