import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const COLORS = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceSoft: "#F8F9FD",
  ink: "#111827",
  muted: "#667085",
  faint: "#98A2B3",
  border: "#E7EAF0",
  primary: "#635BFF",
  primaryDark: "#4F46E5",
  primarySoft: "#EEF0FF",
  violet: "#7C3AED",
  success: "#12B76A",
  successSoft: "#ECFDF3",
  danger: "#F04438",
  dangerSoft: "#FEF3F2",
  warning: "#F79009",
  warningSoft: "#FFFAEB",
  info: "#1570EF",
  infoSoft: "#EFF8FF",
  shadow: "#101828",
};

const createDefaultWorkingHours = () => {
  const hours = {};
  DAYS.forEach((day) => {
    hours[day] = {
      isWorking: true,
      startTime: "09:00",
      endTime: "18:00",
    };
  });
  return hours;
};

const emptyForm = () => ({
  salon: "",
  name: "",
  specialization: [],
  specializationInput: "",
  services: [],
  phone: "",
  profileImage: null,
  workingHours: createDefaultWorkingHours(),
});

const getToken = async () => {
  // The old implementation could accidentally send the complete `user` JSON
  // as a Bearer token when the real token was stored under another key.
  // This resolver checks the common keys used by the customer/salon-owner app
  // and only returns an actual token string.
  const keys = [
    "token",
    "accessToken",
    "authToken",
    "jwt",
    "user",
    "currentUser",
    "auth",
  ];

  const storages = [];

  if (typeof sessionStorage !== "undefined") {
    storages.push({
      get: (key) => sessionStorage.getItem(key),
    });
  }

  // AsyncStorage also works on Expo Web and is required for native builds.
  storages.push({
    get: (key) => AsyncStorage.getItem(key),
  });

  const looksLikeJwt = (value) =>
    typeof value === "string" && value.split(".").length === 3 && value.length > 30;

  const extract = (value) => {
    if (!value) return null;

    if (typeof value !== "string") {
      return extract(value?.token || value?.accessToken || value?.jwt || value?.data);
    }

    const trimmed = value.trim();
    if (!trimmed) return null;
    if (looksLikeJwt(trimmed)) return trimmed;

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === "string") return extract(parsed);
      return extract(
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.jwt ||
        parsed?.data?.token ||
        parsed?.data?.accessToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken
      );
    } catch {
      // Do not return arbitrary values such as the serialized user object.
      return null;
    }
  };

  for (const storage of storages) {
    for (const key of keys) {
      try {
        const token = extract(await storage.get(key));
        if (token) return token;
      } catch {
        // Continue to the next storage/key.
      }
    }
  }

  return null;
};

const authHeaders = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error(
      "Authentication token not found. Please login again and reopen Staff Management."
    );
  }
  return { Authorization: `Bearer ${token}` };
};

const safeJson = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return value?._id || value?.id || "";
  return String(value);
};

const getImageUrl = (path) => {
  if (!path) return "";
  if (String(path).startsWith("http://") || String(path).startsWith("https://")) return path;
  return `${API_URL.replace("/api", "")}${path}`;
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

const pad2 = (value) => String(value).padStart(2, "0");

const toDateInputValue = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const parseDateInput = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getInitials = (name) => {
  if (!name) return "ST";
  return String(name)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

const isLeaveToday = (leaves = []) => {
  if (!Array.isArray(leaves) || leaves.length === 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return leaves.some((leave) => {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return today >= start && today <= end;
  });
};

const SectionTitle = ({ icon, title, subtitle, right }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionHeaderLeft}>
      <View style={styles.sectionIcon}>
        <FontAwesome5 name={icon} size={15} color={COLORS.primary} />
      </View>
      <View style={styles.flex1}>
        <Text style={styles.sectionTitle} numberOfLines={2}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.sectionSubtitle} numberOfLines={3}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
    {right}
  </View>
);

const FieldLabel = ({ children, required }) => (
  <Text style={styles.fieldLabel}>
    {children}
    {required ? <Text style={styles.required}> *</Text> : null}
  </Text>
);

const PremiumButton = ({
  title,
  icon,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}) => {
  const primary = variant === "primary";
  const danger = variant === "danger";
  const soft = variant === "soft";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        danger && styles.buttonDanger,
        soft && styles.buttonSoft,
        !primary && !danger && !soft && styles.buttonOutline,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={primary || danger ? "#fff" : COLORS.primary} />
      ) : (
        <>
          {!!icon && (
            <FontAwesome5
              name={icon}
              size={13}
              color={primary || danger ? "#fff" : COLORS.primary}
            />
          )}
          <Text
            style={[
              styles.buttonText,
              primary || danger ? styles.buttonTextWhite : styles.buttonTextPrimary,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const StatCard = ({ icon, label, value, helper, tone, compact }) => {
  const palette =
    tone === "success"
      ? { bg: COLORS.successSoft, fg: COLORS.success, ring: "#D1FADF" }
      : tone === "danger"
      ? { bg: COLORS.dangerSoft, fg: COLORS.danger, ring: "#FEE4E2" }
      : tone === "warning"
      ? { bg: COLORS.warningSoft, fg: COLORS.warning, ring: "#FEDF89" }
      : { bg: COLORS.primarySoft, fg: COLORS.primary, ring: "#D9D6FE" };

  return (
    <View style={[styles.statCard, compact && styles.statCardMobile]}>
      <View style={[styles.statAccent, { backgroundColor: palette.fg }]} />
      <View style={styles.statTop}>
        <View
          style={[
            styles.statIcon,
            { backgroundColor: palette.bg, borderColor: palette.ring },
          ]}
        >
          <FontAwesome5 name={icon} size={17} color={palette.fg} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: palette.fg }]} />
      </View>

      <View style={styles.statBottom}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: tone === "success" ? COLORS.success : tone === "danger" ? COLORS.danger : tone === "warning" ? COLORS.warning : COLORS.ink }]}>
          {value}
        </Text>
        <Text style={styles.statHelper} numberOfLines={2}>
          {helper}
        </Text>
      </View>
    </View>
  );
};

const CustomSelect = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled,
  icon = "chevron-down",
  searchable = false,
  modalTitle = "Select an option",
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((item) => String(item.value) === String(value));
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter((item) => String(item.label).toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <>
      {!!label && <FieldLabel>{label}</FieldLabel>}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selectBox,
          pressed && styles.selectPressed,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.selectLeft}>
          <View style={styles.selectIcon}>
            <FontAwesome5 name={icon} size={13} color={COLORS.primary} />
          </View>
          <Text
            style={[styles.selectText, !selected && styles.selectPlaceholder]}
            numberOfLines={2}
          >
            {selected?.label || placeholder}
          </Text>
        </View>
        <FontAwesome5 name="chevron-down" size={12} color={COLORS.faint} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.selectModal}>
            <View style={styles.modalTopLine} />
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <FontAwesome5 name={icon} size={15} color="#fff" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.modalTitle}>{modalTitle}</Text>
                <Text style={styles.modalSubtitle}>
                  {options.length} option{options.length === 1 ? "" : "s"} available
                </Text>
              </View>
              <Pressable onPress={() => setOpen(false)} style={styles.closeIconButton}>
                <Ionicons name="close" size={20} color={COLORS.muted} />
              </Pressable>
            </View>

            {searchable && (
              <View style={styles.modalSearch}>
                <Ionicons name="search" size={17} color={COLORS.faint} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search options..."
                  placeholderTextColor={COLORS.faint}
                  style={styles.modalSearchInput}
                  autoCorrect={false}
                />
              </View>
            )}

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.value)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => {
                const active = String(item.value) === String(value);
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      active && styles.optionRowActive,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.optionMain}>
                      <View style={[styles.optionCheck, active && styles.optionCheckActive]}>
                        {active && <Ionicons name="checkmark" size={15} color="#fff" />}
                      </View>
                      <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={3}>
                        {item.label}
                      </Text>
                    </View>
                    {active && <View style={styles.selectedPill}><Text style={styles.selectedPillText}>Selected</Text></View>}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyOptions}>
                  <FontAwesome5 name="search" size={20} color={COLORS.faint} />
                  <Text style={styles.emptyOptionsText}>No matching options</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const ServiceMultiSelect = ({ services, selectedIds, onToggle, loading }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return services;
    return services.filter((service) =>
      String(service.name || "").toLowerCase().includes(q)
    );
  }, [services, query]);

  const selectedServices = services.filter((service) =>
    selectedIds.includes(String(service._id))
  );

  return (
    <View>
      <FieldLabel>Services</FieldLabel>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.multiSelectBox}
        disabled={loading}
      >
        <View style={styles.multiSelectLeft}>
          <View style={styles.selectIcon}>
            <FontAwesome5 name="concierge-bell" size={13} color={COLORS.primary} />
          </View>
          <View style={styles.flex1}>
            <Text style={styles.multiSelectTitle}>
              {loading
                ? "Loading services..."
                : selectedServices.length
                ? `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""} selected`
                : "Choose services"}
            </Text>
            <Text style={styles.multiSelectHint} numberOfLines={2}>
              {selectedServices.length
                ? selectedServices.map((s) => s.name).join(" • ")
                : "Tap to select one or more services"}
            </Text>
          </View>
        </View>
        <FontAwesome5 name="chevron-down" size={12} color={COLORS.faint} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.selectModal, styles.serviceModal]}>
            <View style={styles.modalTopLine} />
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: COLORS.primary }]}>
                <FontAwesome5 name="concierge-bell" size={15} color="#fff" />
              </View>
              <View style={styles.flex1}>
                <Text style={styles.modalTitle}>Assign Services</Text>
                <Text style={styles.modalSubtitle}>
                  Select every service this staff member can provide
                </Text>
              </View>
              <Pressable onPress={() => setOpen(false)} style={styles.closeIconButton}>
                <Ionicons name="close" size={20} color={COLORS.muted} />
              </Pressable>
            </View>

            <View style={styles.modalSearch}>
              <Ionicons name="search" size={17} color={COLORS.faint} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search services..."
                placeholderTextColor={COLORS.faint}
                style={styles.modalSearchInput}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item._id)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.optionList}
              renderItem={({ item }) => {
                const id = String(item._id);
                const active = selectedIds.includes(id);
                return (
                  <Pressable
                    onPress={() => onToggle(id)}
                    style={({ pressed }) => [
                      styles.serviceOption,
                      active && styles.serviceOptionActive,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.serviceCheck}>
                      {active ? (
                        <View style={styles.serviceCheckFilled}>
                          <Ionicons name="checkmark" size={15} color="#fff" />
                        </View>
                      ) : (
                        <View style={styles.serviceCheckEmpty} />
                      )}
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.serviceOptionName} numberOfLines={2}>
                        {item.name || "Unnamed service"}
                      </Text>
                      <Text style={styles.serviceOptionMeta} numberOfLines={1}>
                        {item.price != null ? `₹${item.price}` : "Price not set"}
                        {item.duration ? `  •  ${item.duration} min` : ""}
                      </Text>
                    </View>
                    {active && <View style={styles.selectedPill}><Text style={styles.selectedPillText}>Added</Text></View>}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyOptions}>
                  <FontAwesome5 name="concierge-bell" size={20} color={COLORS.faint} />
                  <Text style={styles.emptyOptionsText}>
                    {loading ? "Loading services..." : "No active services found"}
                  </Text>
                </View>
              }
            />

            <View style={styles.modalFooter}>
              <Text style={styles.selectedCount}>
                {selectedIds.length} selected
              </Text>
              <PremiumButton title="Done" icon="check" onPress={() => setOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const Avatar = ({ image, name, size = 58 }) => {
  const uri = getImageUrl(image);
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 3 }} />;
  }

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 3,
        },
      ]}
    >
      <Text style={[styles.avatarText, { fontSize: Math.max(15, size * 0.29) }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
};

const WorkingSchedule = ({ hours, compact = false }) => {
  const list = Array.isArray(hours)
    ? hours
    : DAYS.map((day) => ({ day, ...(hours?.[day] || {}) }));

  return (
    <View style={compact ? styles.scheduleCompact : styles.scheduleList}>
      {list.map((schedule, index) => {
        const isWorking = schedule.isWorking !== false;
        return (
          <View key={`${schedule.day || "day"}-${index}`} style={styles.scheduleRow}>
            <View style={styles.scheduleDay}>
              <View style={[styles.scheduleDot, { backgroundColor: isWorking ? COLORS.success : COLORS.faint }]} />
              <Text style={styles.scheduleDayText}>{DAY_LABELS[schedule.day] || schedule.day || "Day"}</Text>
            </View>
            <Text style={[styles.scheduleTime, !isWorking && styles.scheduleClosed]}>
              {isWorking
                ? `${schedule.startTime || "09:00"} – ${schedule.endTime || "18:00"}`
                : "Closed"}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const StaffCard = ({
  item,
  expanded,
  onExpand,
  onEdit,
  onStatus,
  onDelete,
  onLeave,
  onRemoveLeave,
}) => {
    const { width } = useWindowDimensions();

  const mobile = width < 600;
  const smallMobile = width < 360;
  const tablet = width >= 600 && width < 1024;
  const compactCard = width < 1024;
  const active = item.isActive !== false;
  const leaves = Array.isArray(item.leaves) ? item.leaves : [];

  return (
    <View style={styles.staffCard}>
      <View style={styles.staffCardTopGlow} />

      <View style={[styles.staffMainRow, compactCard && styles.staffMainRowMobile]}>
        <Avatar image={item.profileImage} name={item.name} size={58} />

        <View style={[styles.staffIdentity, compactCard && styles.staffIdentityMobile]}>
          <View style={styles.nameLine}>
            <Text style={styles.staffName} numberOfLines={2}>
              {item.name || "Unnamed Staff"}
            </Text>
            <View style={[styles.statusBadge, active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
              <View style={[styles.statusBadgeDot, { backgroundColor: active ? COLORS.success : COLORS.danger }]} />
              <Text style={[styles.statusBadgeText, { color: active ? COLORS.success : COLORS.danger }]}>
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <View style={styles.identityMeta}>
            <View style={styles.metaItem}>
              <FontAwesome5 name="phone-alt" size={10} color={COLORS.faint} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.phone || "No phone"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome5 name="store" size={10} color={COLORS.faint} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.salon?.name || "Salon"}
              </Text>
            </View>
          </View>

          {!!item.specialization?.length && (
            <View style={styles.chipWrap}>
              {item.specialization.slice(0, 4).map((spec, index) => (
                <View key={`${spec}-${index}`} style={styles.specChip}>
                  <Text style={styles.specChipText} numberOfLines={1}>{spec}</Text>
                </View>
              ))}
              {item.specialization.length > 4 && (
                <View style={styles.specMoreChip}>
                  <Text style={styles.specMoreText}>+{item.specialization.length - 4}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Desktop / laptop: keep actions beside the staff details. */}
        {!compactCard && (
          <View style={styles.staffActions}>
            <Pressable onPress={() => onExpand(item._id)} style={styles.iconAction}>
              <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={COLORS.muted} />
            </Pressable>
            <Pressable onPress={() => onEdit(item)} style={[styles.iconAction, styles.iconActionPrimary]}>
              <FontAwesome5 name="edit" size={12} color={COLORS.primary} />
            </Pressable>
            <Pressable onPress={() => onStatus(item)} style={[styles.iconAction, active ? styles.iconActionWarning : styles.iconActionSuccess]}>
              <FontAwesome5 name={active ? "ban" : "check"} size={12} color={active ? COLORS.danger : COLORS.success} />
            </Pressable>
            <Pressable onPress={() => onDelete(item)} style={[styles.iconAction, styles.iconActionDanger]}>
              <FontAwesome5 name="trash-alt" size={12} color={COLORS.danger} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Mobile / tablet: actions get their OWN row, completely outside the
          identity layout. This prevents them from ever sitting on the name,
          status badge, phone, salon or specialization. */}
      {compactCard && (
        <View style={styles.staffActionsMobile}>
          <Pressable onPress={() => onExpand(item._id)} style={styles.iconAction}>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={COLORS.muted} />
          </Pressable>
          <Pressable onPress={() => onEdit(item)} style={[styles.iconAction, styles.iconActionPrimary]}>
            <FontAwesome5 name="edit" size={12} color={COLORS.primary} />
          </Pressable>
          <Pressable onPress={() => onStatus(item)} style={[styles.iconAction, active ? styles.iconActionWarning : styles.iconActionSuccess]}>
            <FontAwesome5 name={active ? "ban" : "check"} size={12} color={active ? COLORS.danger : COLORS.success} />
          </Pressable>
          <Pressable onPress={() => onDelete(item)} style={[styles.iconAction, styles.iconActionDanger]}>
            <FontAwesome5 name="trash-alt" size={12} color={COLORS.danger} />
          </Pressable>
        </View>
      )}

      <View style={[styles.staffBottomRow, compactCard && styles.staffBottomRowMobile]}>
        <View style={styles.quickInfo}>
          <View style={styles.quickInfoItem}>
            <FontAwesome5 name="concierge-bell" size={11} color={COLORS.primary} />
            <Text style={styles.quickInfoText}>{Array.isArray(item.services) ? item.services.length : 0} services</Text>
          </View>
          <View style={styles.quickInfoItem}>
            <FontAwesome5 name="calendar-alt" size={11} color={COLORS.warning} />
            <Text style={styles.quickInfoText}>{leaves.length} leave{leaves.length === 1 ? "" : "s"}</Text>
          </View>
          {isLeaveToday(leaves) && (
            <View style={styles.todayLeavePill}>
              <View style={styles.todayLeaveDot} />
              <Text style={styles.todayLeaveText}>On leave today</Text>
            </View>
          )}
        </View>

        <Pressable onPress={() => onLeave(item)} style={[styles.leaveButton, mobile && styles.leaveButtonMobile]}>
          <FontAwesome5 name="calendar-plus" size={11} color={COLORS.warning} />
          <Text style={styles.leaveButtonText}>Add leave</Text>
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.expandedArea}>
          <View style={styles.detailPanel}>
            <SectionTitle
              icon="clock"
              title="Working Schedule"
              subtitle="Weekly working hours"
            />
            <WorkingSchedule hours={item.workingHours || []} compact />
          </View>

          <View style={styles.detailPanel}>
            <SectionTitle
              icon="calendar-alt"
              title="Leave History"
              subtitle={`${leaves.length} recorded leave${leaves.length === 1 ? "" : "s"}`}
              right={
                <Pressable onPress={() => onLeave(item)} style={styles.miniAction}>
                  <FontAwesome5 name="plus" size={10} color={COLORS.primary} />
                </Pressable>
              }
            />
            {leaves.length ? (
              <View style={styles.leaveList}>
                {leaves.map((leave, index) => (
                  <View key={`${leave.startDate}-${index}`} style={styles.leaveHistoryRow}>
                    <View style={styles.leaveDateIcon}>
                      <FontAwesome5 name="calendar-day" size={12} color={COLORS.warning} />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.leaveRange}>
                        {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                      </Text>
                      {!!leave.reason && (
                        <Text style={styles.leaveReason} numberOfLines={3}>
                          {leave.reason}
                        </Text>
                      )}
                    </View>
                    <Pressable onPress={() => onRemoveLeave(item, index)} style={styles.removeLeaveButton}>
                      <FontAwesome5 name="trash-alt" size={11} color={COLORS.danger} />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.inlineEmpty}>
                <FontAwesome5 name="calendar-check" size={18} color={COLORS.faint} />
                <Text style={styles.inlineEmptyText}>No leave records yet.</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const StaffFormModal = ({
  visible,
  editingStaff,
  form,
  setForm,
  salons,
  services,
  serviceLoading,
  saving,
  imagePreview,
  setImagePreview,
  onClose,
  onSubmit,
  onPickImage,
  onAddSpecialization,
  onRemoveSpecialization,
  onToggleService,
  onToggleWorkingDay,
  onUpdateWorkingHour,
}) => {
  const { width, height } = useWindowDimensions();
  const wide = width >= 900;
  const medium = width >= 600;
  const modalHorizontalPadding = width <= 360 ? 8 : width < 600 ? 12 : 24;
  const modalWidth = Math.min(Math.max(width - modalHorizontalPadding * 2, 0), 1180);
  const modalHeight = Math.min(
    Math.max(height - (medium ? 40 : 18), 360),
    920
  );

  const salonOptions = salons.map((salon) => ({
    value: String(salon._id),
    label: salon.name || "Unnamed Salon",
  }));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.formBackdrop}>
        <KeyboardAvoidingView
          style={styles.formKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.formModal, { width: modalWidth, height: modalHeight }]}>
            <View style={styles.formHeader}>
              <View style={styles.formHeaderLeft}>
                <View style={styles.formHeaderIcon}>
                  <FontAwesome5 name={editingStaff ? "user-edit" : "user-plus"} size={17} color="#fff" />
                </View>
                <View style={styles.flex1}>
                  <View style={styles.formTitleRow}>
                    <Text style={styles.formTitle} numberOfLines={2}>
                      {editingStaff ? "Edit Staff" : "Add New Staff"}
                    </Text>
                    <View style={styles.formModePill}>
                      <Text style={styles.formModeText}>{editingStaff ? "UPDATE" : "NEW"}</Text>
                    </View>
                  </View>
                  <Text style={styles.formSubtitle} numberOfLines={2}>
                    {editingStaff
                      ? "Update profile, services and working schedule."
                      : "Create a professional staff profile with availability."}
                  </Text>
                </View>
              </View>

              <Pressable onPress={onClose} style={styles.closeIconButton}>
                <Ionicons name="close" size={21} color={COLORS.muted} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.formGrid, wide && styles.formGridWide]}>
                <View style={wide ? styles.formColumn : styles.fullWidth}>
                  <View style={styles.formPanel}>
                    <SectionTitle
                      icon="id-card"
                      title="Profile Information"
                      subtitle="Basic staff identity and salon assignment"
                    />

                    <View style={[styles.profileEditor, width <= 380 && styles.profileEditorCompact]}>
                      <View style={styles.profileImageWrap}>
                        {imagePreview ? (
                          <Image source={{ uri: imagePreview }} style={styles.profilePreview} />
                        ) : (
                          <View style={styles.profilePlaceholder}>
                            <FontAwesome5 name="user-tie" size={30} color={COLORS.primary} />
                          </View>
                        )}
                        <Pressable onPress={onPickImage} style={styles.cameraButton}>
                          <Ionicons name="camera" size={14} color="#fff" />
                        </Pressable>
                      </View>

                      <View style={styles.flex1}>
                        <Text style={styles.imageTitle}>Profile photo</Text>
                        <Text style={styles.imageHint} numberOfLines={3}>
                          JPG, PNG or WEBP. Maximum 5 MB.
                        </Text>
                        <PremiumButton
                          title={imagePreview ? "Change photo" : "Choose photo"}
                          icon="image"
                          variant="soft"
                          onPress={onPickImage}
                          style={styles.smallButton}
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <FieldLabel required>Salon</FieldLabel>
                      <CustomSelect
                        value={form.salon}
                        placeholder="Select salon"
                        options={salonOptions}
                        onChange={(value) => setForm((prev) => ({ ...prev, salon: value, services: [] }))}
                        icon="store"
                        searchable
                        modalTitle="Select Salon"
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <FieldLabel required>Staff name</FieldLabel>
                      <View style={styles.inputWrap}>
                        <FontAwesome5 name="user" size={13} color={COLORS.faint} />
                        <TextInput
                          value={form.name}
                          onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))}
                          placeholder="Enter full name"
                          placeholderTextColor={COLORS.faint}
                          style={styles.input}
                          autoCapitalize="words"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <FieldLabel>Phone number</FieldLabel>
                      <View style={styles.inputWrap}>
                        <FontAwesome5 name="phone-alt" size={12} color={COLORS.faint} />
                        <TextInput
                          value={form.phone}
                          onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                          placeholder="Enter phone number"
                          placeholderTextColor={COLORS.faint}
                          style={styles.input}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <FieldLabel>Specializations</FieldLabel>
                      <View style={styles.tagInputWrap}>
                        <View style={styles.tagInputTop}>
                          <FontAwesome5 name="star" size={12} color={COLORS.faint} />
                          <TextInput
                            value={form.specializationInput}
                            onChangeText={(value) => setForm((prev) => ({ ...prev, specializationInput: value }))}
                            placeholder="Type and press Add"
                            placeholderTextColor={COLORS.faint}
                            style={styles.tagInput}
                            onSubmitEditing={onAddSpecialization}
                            returnKeyType="done"
                          />
                          <Pressable onPress={onAddSpecialization} style={styles.addTagButton}>
                            <FontAwesome5 name="plus" size={10} color="#fff" />
                            <Text style={styles.addTagText}>Add</Text>
                          </Pressable>
                        </View>

                        {form.specialization.length > 0 && (
                          <View style={styles.tagList}>
                            {form.specialization.map((item, index) => (
                              <View key={`${item}-${index}`} style={styles.editTag}>
                                <Text style={styles.editTagText} numberOfLines={1}>{item}</Text>
                                <Pressable onPress={() => onRemoveSpecialization(index)} hitSlop={8}>
                                  <Ionicons name="close-circle" size={16} color={COLORS.primary} />
                                </Pressable>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.fieldGroup}>
                      <ServiceMultiSelect
                        services={services}
                        selectedIds={form.services || []}
                        onToggle={onToggleService}
                        loading={serviceLoading}
                      />
                    </View>
                  </View>
                </View>

                <View style={wide ? styles.formColumn : styles.fullWidth}>
                  <View style={styles.formPanel}>
                    <SectionTitle
                      icon="clock"
                      title="Working Schedule"
                      subtitle="Configure each working day and operating hours."
                      right={<View style={styles.weeklyPill}><Text style={styles.weeklyPillText}>WEEKLY</Text></View>}
                    />

                    <View style={styles.scheduleEditor}>
                      {DAYS.map((day) => {
                        const row = form.workingHours[day];
                        return (
                          <View
                            key={day}
                            style={[
                              styles.scheduleEditorRow,
                              width < 600 && styles.scheduleEditorRowMobile,
                            ]}
                          >
                            <View style={styles.dayInfo}>
                              <View
                                style={[
                                  styles.dayToggleDot,
                                  {
                                    backgroundColor: row.isWorking
                                      ? COLORS.success
                                      : COLORS.faint,
                                  },
                                ]}
                              />
                              <View style={styles.flex1}>
                                <Text style={styles.dayName} numberOfLines={1}>
                                  {DAY_LABELS[day]}
                                </Text>
                                <Text style={styles.dayState} numberOfLines={1}>
                                  {row.isWorking ? "Working day" : "Closed"}
                                </Text>
                              </View>
                            </View>

                            <Pressable
                              onPress={() => onToggleWorkingDay(day)}
                              style={[styles.switch, row.isWorking && styles.switchOn]}
                              accessibilityRole="switch"
                              accessibilityState={{ checked: row.isWorking }}
                            >
                              <View
                                style={[
                                  styles.switchThumb,
                                  row.isWorking && styles.switchThumbOn,
                                ]}
                              />
                            </Pressable>

                            <View style={styles.timeFields}>
                              <View
                                style={[
                                  styles.timeInputWrap,
                                  !row.isWorking && styles.disabledTime,
                                ]}
                              >
                                <FontAwesome5
                                  name="clock"
                                  size={11}
                                  color={COLORS.faint}
                                />
                                <TextInput
                                  value={row.startTime}
                                  onChangeText={(value) =>
                                    onUpdateWorkingHour(day, "startTime", value)
                                  }
                                  style={styles.timeInput}
                                  placeholder="09:00"
                                  placeholderTextColor={COLORS.faint}
                                  editable={row.isWorking}
                                  maxLength={5}
                                  keyboardType="numbers-and-punctuation"
                                  textAlign="center"
                                />
                              </View>

                              <Text style={styles.timeDash}>—</Text>

                              <View
                                style={[
                                  styles.timeInputWrap,
                                  !row.isWorking && styles.disabledTime,
                                ]}
                              >
                                <FontAwesome5
                                  name="clock"
                                  size={11}
                                  color={COLORS.faint}
                                />
                                <TextInput
                                  value={row.endTime}
                                  onChangeText={(value) =>
                                    onUpdateWorkingHour(day, "endTime", value)
                                  }
                                  style={styles.timeInput}
                                  placeholder="18:00"
                                  placeholderTextColor={COLORS.faint}
                                  editable={row.isWorking}
                                  maxLength={5}
                                  keyboardType="numbers-and-punctuation"
                                  textAlign="center"
                                />
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.infoBanner}>
                    <View style={styles.infoBannerIcon}>
                      <Ionicons name="information" size={16} color={COLORS.info} />
                    </View>
                    <View style={styles.flex1}>
                      <Text style={styles.infoBannerTitle}>Availability tip</Text>
                      <Text style={styles.infoBannerText}>
                        Staff availability is managed independently from salon operating hours. Keep the schedule accurate so customer booking slots stay reliable.
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.formFooter, width < 600 && styles.formFooterMobile]}>
              <View style={styles.footerHint}>
                <View style={styles.footerHintDot} />
                <Text style={styles.footerHintText}>Changes are saved to the salon staff record.</Text>
              </View>
              <View style={[styles.footerButtons, width < 600 && styles.footerButtonsMobile]}>
                <PremiumButton title="Cancel" variant="outline" onPress={onClose} style={styles.footerCancel} />
                <PremiumButton
                  title={editingStaff ? "Update Staff" : "Create Staff"}
                  icon={editingStaff ? "save" : "user-plus"}
                  onPress={onSubmit}
                  loading={saving}
                  style={styles.footerSave}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const LeaveModal = ({
  visible,
  staff,
  form,
  setForm,
  saving,
  onClose,
  onSubmit,
}) => {
  const { width } = useWindowDimensions();
  const mobile = width < 600;

  const today = new Date();
  const initialMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(initialMonth);

  const openCalendar = (target) => {
    const currentValue = form[target];
    if (currentValue) {
      const parsed = parseDateInput(currentValue);
      if (parsed) {
        setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      } else {
        setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
      }
    } else {
      setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    }
    setCalendarTarget(target);
  };

  const selectCalendarDate = (date) => {
    const value = toDateInputValue(date);
    setForm((prev) => ({ ...prev, [calendarTarget]: value }));
    setCalendarTarget(null);
  };

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    // Sunday-first calendar. Empty leading cells keep dates aligned.
    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.formBackdrop}>
        <KeyboardAvoidingView
          style={styles.formKeyboard}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View
            style={[
              styles.leaveModal,
              { width: Math.min(Math.max(width - (mobile ? 16 : 32), 280), 560) },
            ]}
          >
            <View style={styles.modalTopLine} />
            <View style={styles.formHeader}>
              <View style={styles.formHeaderLeft}>
                <View style={[styles.formHeaderIcon, { backgroundColor: COLORS.warning }]}>
                  <FontAwesome5 name="calendar-plus" size={16} color="#fff" />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.formTitle}>Add Staff Leave</Text>
                  <Text style={styles.formSubtitle} numberOfLines={2}>
                    {staff?.name || "Staff member"} · Record unavailable dates
                  </Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeIconButton}>
                <Ionicons name="close" size={21} color={COLORS.muted} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.leaveFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.leaveNotice}>
                <View style={styles.leaveNoticeIcon}>
                  <FontAwesome5 name="calendar-alt" size={15} color={COLORS.warning} />
                </View>
                <Text style={styles.leaveNoticeText}>
                  Add a date range when this staff member will be unavailable. The start date cannot be after the end date.
                </Text>
              </View>

              <View style={[styles.dateGrid, mobile && styles.dateGridMobile]}>
                <View style={styles.flex1}>
                  <FieldLabel required>Start date</FieldLabel>
                  <View style={styles.inputWrap}>
                    <FontAwesome5 name="calendar-day" size={12} color={COLORS.faint} />
                    <Pressable
                      onPress={() => openCalendar("startDate")}
                      style={({ pressed }) => [
                        styles.inputWrapPressable,
                        pressed && styles.selectPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Choose start date"
                    >
                      <FontAwesome5 name="calendar-day" size={12} color={form.startDate ? COLORS.primary : COLORS.faint} />
                      <Text
                        style={[
                          styles.dateValueText,
                          !form.startDate && styles.datePlaceholderText,
                        ]}
                        numberOfLines={1}
                      >
                        {form.startDate || "Choose date"}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={COLORS.faint} />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.flex1}>
                  <FieldLabel required>End date</FieldLabel>
                  <View style={styles.inputWrap}>
                    <FontAwesome5 name="calendar-check" size={12} color={COLORS.faint} />
                    <Pressable
                      onPress={() => openCalendar("endDate")}
                      style={({ pressed }) => [
                        styles.inputWrapPressable,
                        pressed && styles.selectPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel="Choose end date"
                    >
                      <FontAwesome5 name="calendar-check" size={12} color={form.endDate ? COLORS.primary : COLORS.faint} />
                      <Text
                        style={[
                          styles.dateValueText,
                          !form.endDate && styles.datePlaceholderText,
                        ]}
                        numberOfLines={1}
                      >
                        {form.endDate || "Choose date"}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={COLORS.faint} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <FieldLabel>Reason</FieldLabel>
                <View style={[styles.inputWrap, styles.textAreaWrap]}>
                  <MaterialCommunityIcons name="text-box-outline" size={17} color={COLORS.faint} />
                  <TextInput
                    value={form.reason}
                    onChangeText={(value) => setForm((prev) => ({ ...prev, reason: value }))}
                    placeholder="Optional reason for leave"
                    placeholderTextColor={COLORS.faint}
                    style={[styles.input, styles.textArea]}
                    multiline
                    textAlignVertical="top"
                    maxLength={300}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.formFooter}>
              <View style={styles.footerButtonsFull}>
                <PremiumButton title="Cancel" variant="outline" onPress={onClose} style={styles.footerCancel} />
                <PremiumButton
                  title="Save Leave"
                  icon="calendar-plus"
                  onPress={onSubmit}
                  loading={saving}
                  style={styles.footerSave}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {calendarTarget && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setCalendarTarget(null)}
        >
          <View style={styles.calendarBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setCalendarTarget(null)}
            />
            <View style={[styles.calendarModal, mobile && styles.calendarModalMobile]}>
              <View style={styles.calendarHeader}>
                <View style={styles.calendarHeaderIcon}>
                  <FontAwesome5 name="calendar-alt" size={15} color="#fff" />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.calendarTitle}>
                    {calendarTarget === "startDate" ? "Start date" : "End date"}
                  </Text>
                  <Text style={styles.calendarSubtitle}>{monthLabel}</Text>
                </View>
                <Pressable
                  onPress={() => setCalendarTarget(null)}
                  style={styles.closeIconButton}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color={COLORS.muted} />
                </Pressable>
              </View>

              <View style={styles.calendarMonthBar}>
                <Pressable
                  onPress={() =>
                    setCalendarMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                    )
                  }
                  style={styles.calendarNavButton}
                  hitSlop={6}
                >
                  <Ionicons name="chevron-back" size={18} color={COLORS.ink} />
                </Pressable>

                <Text style={styles.calendarMonthText}>{monthLabel}</Text>

                <Pressable
                  onPress={() =>
                    setCalendarMonth(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                    )
                  }
                  style={styles.calendarNavButton}
                  hitSlop={6}
                >
                  <Ionicons name="chevron-forward" size={18} color={COLORS.ink} />
                </Pressable>
              </View>

              <View style={styles.calendarWeekRow}>
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <View key={`${day}-${index}`} style={styles.calendarWeekCell}>
                    <Text style={styles.calendarWeekText}>{day}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <View key={`empty-${index}`} style={styles.calendarDayCell} />;
                  }

                  const value = toDateInputValue(date);
                  const selected = value === form[calendarTarget];
                  const isToday = value === toDateInputValue(today);
                  const isBeforeToday =
                    date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                  return (
                    <Pressable
                      key={value}
                      onPress={() => selectCalendarDate(date)}
                      style={({ pressed }) => [
                        styles.calendarDayCell,
                        styles.calendarDayButton,
                        selected && styles.calendarDaySelected,
                        pressed && styles.calendarDayPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${value}`}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          selected && styles.calendarDaySelectedText,
                          isToday && !selected && styles.calendarTodayText,
                          isBeforeToday && !selected && styles.calendarPastText,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                      {isToday && (
                        <View
                          style={[
                            styles.calendarTodayDot,
                            selected && styles.calendarTodayDotSelected,
                          ]}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.calendarFooter}>
                <View style={styles.calendarLegend}>
                  <View style={styles.calendarLegendDot} />
                  <Text style={styles.calendarLegendText}>Today</Text>
                </View>
                <Pressable
                  onPress={() => selectCalendarDate(today)}
                  style={styles.calendarTodayButton}
                >
                  <Text style={styles.calendarTodayButtonText}>Today</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText,
  destructive,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={loading ? undefined : onCancel}
        />
        <View style={styles.confirmModal}>
          <View style={[styles.confirmIcon, destructive ? styles.confirmIconDanger : styles.confirmIconPrimary]}>
            <FontAwesome5
              name={destructive ? "exclamation-triangle" : "check"}
              size={17}
              color={destructive ? COLORS.danger : COLORS.primary}
            />
          </View>

          <Text style={styles.confirmTitle} numberOfLines={3}>
            {title}
          </Text>
          <Text style={styles.confirmMessage} numberOfLines={6}>
            {message}
          </Text>

          <View style={styles.confirmButtons}>
            <PremiumButton
              title="Cancel"
              variant="outline"
              onPress={onCancel}
              disabled={loading}
              style={styles.confirmCancelButton}
            />
            <PremiumButton
              title={confirmText}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              loading={loading}
              style={styles.confirmActionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function StaffsManagement() {
  const { width } = useWindowDimensions();
  const ultraSmall = width <= 340;
  const smallMobile = width <= 380;
  const mobile = width < 600;
  const wide = width >= 1000;
  const tablet = width >= 600 && width < 1000;

  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");

  const [searchText, setSearchText] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [salonLoading, setSalonLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [imagePreview, setImagePreview] = useState("");

  const [expandedStaff, setExpandedStaff] = useState(null);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveStaff, setLeaveStaff] = useState(null);
  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // Cross-platform confirmation state.
  // React Native Alert buttons are unreliable on some Expo Web/browser setups,
  // so status/delete/leave-removal confirmations use a real Modal instead.
  const [confirmState, setConfirmState] = useState({
    visible: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    destructive: false,
    onConfirm: null,
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 3200);
  }, []);

  const loadSalons = useCallback(async () => {
    try {
      setSalonLoading(true);
      const headers = await authHeaders();
      const response = await fetch(`${API_URL}/salons/owner/my-salons`, {
        headers,
      });
      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            "Authentication expired or unavailable. Please login again from the Salon Owner app on this address."
          );
        }
        throw new Error(data.message || "Failed to fetch salons");
      }

      const salonList = data.salons || data || [];
      setSalons(Array.isArray(salonList) ? salonList : []);

      // Preserve original behavior: never auto-select the first salon.
      setSelectedSalon("");
      setStaff([]);
    } catch (error) {
      console.error("Load salons error:", error);
      showToast(error.message || "Failed to load salons", "error");
    } finally {
      setSalonLoading(false);
    }
  }, [showToast]);

  const loadServices = useCallback(async (salonId) => {
    if (!salonId) {
      setServices([]);
      return;
    }

    try {
      setServiceLoading(true);
      const response = await fetch(`${API_URL}/services/salon/${salonId}`, {
        headers: { ...(await authHeaders()) },
      });
      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication expired or unavailable. Please login again.");
        }
        throw new Error(data.message || "Failed to fetch services");
      }

      const serviceList = data.services || data.data || data || [];
      setServices(
        Array.isArray(serviceList)
          ? serviceList.filter((service) => service.isActive !== false)
          : []
      );
    } catch (error) {
      console.error("Load services error:", error);
      setServices([]);
      showToast(error.message || "Failed to load services", "error");
    } finally {
      setServiceLoading(false);
    }
  }, [showToast]);

  const loadStaff = useCallback(async () => {
    if (!selectedSalon) {
      setStaff([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff`, {
        headers: { ...(await authHeaders()) },
      });
      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication expired or unavailable. Please login again.");
        }
        throw new Error(data.message || "Failed to fetch staff");
      }

      const staffList = data.staff || [];
      const filteredStaff = staffList.filter((item) => {
        const salonId = item.salon?._id || item.salon;
        return String(salonId || "") === String(selectedSalon);
      });

      setStaff(filteredStaff);
    } catch (error) {
      console.error("Load staff error:", error);
      showToast(error.message || "Failed to load staff", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedSalon, showToast]);

  useEffect(() => {
    loadSalons();
  }, [loadSalons]);

  useEffect(() => {
    if (selectedSalon) {
      loadStaff();
    } else {
      setStaff([]);
    }
  }, [selectedSalon, loadStaff]);

  useEffect(() => {
    if (form.salon) {
      loadServices(form.salon);
    } else {
      setServices([]);
    }
  }, [form.salon, loadServices]);

  const filteredStaff = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return staff.filter((item) => {
      const matchesSearch =
        !search ||
        String(item.name || "").toLowerCase().includes(search) ||
        String(item.phone || "").toLowerCase().includes(search) ||
        (Array.isArray(item.specialization) &&
          item.specialization.some((spec) =>
            String(spec).toLowerCase().includes(search)
          ));

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && item.isActive !== false) ||
        (statusFilter === "INACTIVE" && item.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [staff, searchText, statusFilter]);

  const stats = useMemo(() => {
    const total = staff.length;
    const active = staff.filter((item) => item.isActive !== false).length;
    const inactive = staff.filter((item) => item.isActive === false).length;
    const onLeaveToday = staff.filter((item) => isLeaveToday(item.leaves)).length;

    return { total, active, inactive, onLeaveToday };
  }, [staff]);

  const selectedSalonData = useMemo(
    () => salons.find((salon) => String(salon._id) === String(selectedSalon)),
    [salons, selectedSalon]
  );

  const openCreateModal = () => {
    setEditingStaff(null);
    setForm({
      ...emptyForm(),
      salon: selectedSalon,
    });
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingStaff(item);

    const existingSalon = item.salon?._id || item.salon || selectedSalon;
    const workingHours = createDefaultWorkingHours();

    if (Array.isArray(item.workingHours)) {
      item.workingHours.forEach((day) => {
        if (day.day && workingHours[day.day]) {
          workingHours[day.day] = {
            isWorking: day.isWorking !== false,
            startTime: day.startTime || "09:00",
            endTime: day.endTime || "18:00",
          };
        }
      });
    }

    setForm({
      salon: existingSalon,
      name: item.name || "",
      specialization: Array.isArray(item.specialization) ? item.specialization : [],
      specializationInput: "",
      services: Array.isArray(item.services)
        ? item.services.map((service) => typeof service === "object" ? service?._id : service).filter(Boolean).map(String)
        : [],
      phone: item.phone || "",
      profileImage: null,
      workingHours,
    });

    setImagePreview(item.profileImage ? getImageUrl(item.profileImage) : "");
    setShowModal(true);
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast(
          "Please allow photo library access to choose a staff profile image.",
          "error"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.88,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const fileSize = asset.fileSize || 0;

      if (fileSize > 5 * 1024 * 1024) {
        showToast("Image size must be below 5MB", "error");
        return;
      }

      const mimeType = asset.mimeType || "image/jpeg";
      if (!mimeType.startsWith("image/")) {
        showToast("Please select a valid image", "error");
        return;
      }

      setForm((prev) => ({
        ...prev,
        profileImage: {
          uri,
          name: asset.fileName || `staff-${Date.now()}.jpg`,
          type: mimeType,
        },
      }));
      setImagePreview(uri);
    } catch (error) {
      console.error("Pick image error:", error);
      showToast("Unable to choose image", "error");
    }
  };

  const addSpecialization = () => {
    const value = form.specializationInput.trim();
    if (!value) return;

    const exists = form.specialization.some(
      (item) => String(item).toLowerCase() === value.toLowerCase()
    );

    if (exists) {
      setForm((prev) => ({ ...prev, specializationInput: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      specialization: [...prev.specialization, value],
      specializationInput: "",
    }));
  };

  const removeSpecialization = (index) => {
    setForm((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index),
    }));
  };

  const toggleService = (serviceId) => {
    const id = String(serviceId);
    setForm((prev) => {
      const selected = prev.services || [];
      return {
        ...prev,
        services: selected.includes(id)
          ? selected.filter((item) => String(item) !== id)
          : [...selected, id],
      };
    });
  };

  const updateWorkingHour = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleWorkingDay = (day) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          isWorking: !prev.workingHours[day].isWorking,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast("Staff name is required", "error");
      return;
    }

    if (!form.salon) {
      showToast("Please select a salon", "error");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("salon", String(form.salon));
      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());

      form.specialization.forEach((item) => {
        formData.append("specialization", item);
      });

      formData.append("services", JSON.stringify(form.services || []));

      const workingHoursArray = DAYS.map((day) => ({
        day,
        isWorking: form.workingHours[day].isWorking,
        startTime: form.workingHours[day].isWorking
          ? form.workingHours[day].startTime
          : "",
        endTime: form.workingHours[day].isWorking
          ? form.workingHours[day].endTime
          : "",
      }));

      formData.append("workingHours", JSON.stringify(workingHoursArray));

     if (form.profileImage?.uri) {
  const image = form.profileImage;

  if (Platform.OS === "web") {
    const response = await fetch(image.uri);
    const blob = await response.blob();

    const file = new File(
      [blob],
      image.name || `staff-${Date.now()}.jpg`,
      {
        type: image.type || blob.type || "image/jpeg",
      }
    );

    formData.append("profileImage", file);
  } else {
    formData.append("profileImage", {
      uri: image.uri,
      name: image.name || `staff-${Date.now()}.jpg`,
      type: image.type || "image/jpeg",
    });
  }
}

      const url = editingStaff
        ? `${API_URL}/staff/${editingStaff._id}`
        : `${API_URL}/staff`;

      const method = editingStaff ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          ...(await authHeaders()),
          // DO NOT set Content-Type manually for multipart/form-data.
          // fetch supplies the boundary.
        },
        body: formData,
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save staff");
      }

      showToast(
        editingStaff
          ? "Staff updated successfully"
          : "Staff created successfully"
      );

      setShowModal(false);
      setEditingStaff(null);
      setForm(emptyForm());
      setImagePreview("");
      await loadStaff();
    } catch (error) {
      console.error("Save staff error:", error);
      showToast(error.message || "Failed to save staff", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (item) => {
    const action = item.isActive !== false ? "deactivate" : "activate";
    const verb = action === "deactivate" ? "Deactivate" : "Activate";

    setConfirmState({
      visible: true,
      title: `${verb} staff?`,
      message: `${action === "deactivate" ? "Deactivate" : "Activate"} "${item.name}"?`,
      confirmText: verb,
      destructive: action === "deactivate",
      onConfirm: async () => {
        try {
          setSaving(true);
          const response = await fetch(`${API_URL}/staff/${item._id}/${action}`, {
            method: "PATCH",
            headers: { ...(await authHeaders()) },
          });
          const data = await safeJson(response);

          if (!response.ok) {
            throw new Error(data.message || `Failed to ${action} staff`);
          }

          showToast(data.message || `Staff ${action}d successfully`);
          setConfirmState((prev) => ({ ...prev, visible: false }));
          await loadStaff();
        } catch (error) {
          console.error(`${action} staff error:`, error);
          showToast(error.message || `Failed to ${action} staff`, "error");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const deleteStaff = (item) => {
    setConfirmState({
      visible: true,
      title: "Delete staff permanently?",
      message: `"${item.name}" will be removed. This action cannot be undone.`,
      confirmText: "Delete",
      destructive: true,
      onConfirm: async () => {
        try {
          setSaving(true);
          const response = await fetch(`${API_URL}/staff/${item._id}`, {
            method: "DELETE",
            headers: { ...(await authHeaders()) },
          });
          const data = await safeJson(response);

          if (!response.ok) {
            throw new Error(data.message || "Failed to delete staff");
          }

          showToast(data.message || "Staff deleted successfully");
          setConfirmState((prev) => ({ ...prev, visible: false }));
          if (expandedStaff === item._id) setExpandedStaff(null);
          await loadStaff();
        } catch (error) {
          console.error("Delete staff error:", error);
          showToast(error.message || "Failed to delete staff", "error");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const openLeaveModal = (item) => {
    setLeaveStaff(item);
    setLeaveForm({
      startDate: "",
      endDate: "",
      reason: "",
    });
    setShowLeaveModal(true);
  };

  const submitLeave = async () => {
    if (!leaveForm.startDate || !leaveForm.endDate) {
      showToast("Start date and end date are required", "error");
      return;
    }

    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      showToast("Please enter valid dates in YYYY-MM-DD format", "error");
      return;
    }

    if (start > end) {
      showToast("Start date cannot be after end date", "error");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_URL}/staff/${leaveStaff._id}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify(leaveForm),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || "Failed to add leave");
      }

      showToast(data.message || "Staff leave added successfully");
      setShowLeaveModal(false);
      setLeaveStaff(null);
      await loadStaff();
    } catch (error) {
      console.error("Add leave error:", error);
      showToast(error.message || "Failed to add leave", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeLeave = (item, leaveIndex) => {
    setConfirmState({
      visible: true,
      title: "Remove this leave?",
      message: `Remove leave record ${leaveIndex + 1} for ${item.name}?`,
      confirmText: "Remove",
      destructive: true,
      onConfirm: async () => {
        try {
          setSaving(true);
          const response = await fetch(
            `${API_URL}/staff/${item._id}/leaves/${leaveIndex}`,
            {
              method: "DELETE",
              headers: { ...(await authHeaders()) },
            }
          );
          const data = await safeJson(response);

          if (!response.ok) {
            throw new Error(data.message || "Failed to remove leave");
          }

          showToast(data.message || "Leave removed successfully");
          setConfirmState((prev) => ({ ...prev, visible: false }));
          await loadStaff();
        } catch (error) {
          console.error("Remove leave error:", error);
          showToast(error.message || "Failed to remove leave", "error");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const refresh = async () => {
    try {
      setRefreshing(true);
      if (!salons.length) {
        await loadSalons();
      } else if (selectedSalon) {
        await loadStaff();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const statusOptions = [
    { value: "ALL", label: "All Staff" },
    { value: "ACTIVE", label: "Active Staff" },
    { value: "INACTIVE", label: "Inactive Staff" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      <View style={styles.screen}>
        {/* Toast */}
        {toast.show && (
          <View pointerEvents="box-none" style={styles.toastLayer}>
            <View style={[styles.toast, toast.type === "error" ? styles.toastError : styles.toastSuccess]}>
              <View style={[styles.toastIcon, toast.type === "error" ? styles.toastIconError : styles.toastIconSuccess]}>
                <FontAwesome5
                  name={toast.type === "error" ? "exclamation-triangle" : "check"}
                  size={12}
                  color={toast.type === "error" ? COLORS.danger : COLORS.success}
                />
              </View>
              <Text style={styles.toastText} numberOfLines={4}>{toast.message}</Text>
              <Pressable
                onPress={() => setToast({ show: false, type: "", message: "" })}
                style={styles.toastClose}
              >
                <Ionicons name="close" size={17} color={COLORS.muted} />
              </Pressable>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.page}
          contentContainerStyle={styles.pageContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={COLORS.primary} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Premium header */}
          <View style={styles.hero}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroInner}>
              <View style={[styles.heroTop, (mobile || tablet) && styles.heroTopMobile]}>
                <View style={[styles.heroIdentity, (mobile || tablet) && styles.heroIdentityMobile]}>
                  <View style={[styles.heroIcon, ultraSmall && styles.heroIconUltraSmall]}>
                    <FontAwesome5 name="user-tie" size={21} color="#fff" />
                  </View>

                  <View style={styles.flex1}>
                    <View style={styles.heroBadgeRow}>
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>STAFF MANAGEMENT</Text>
                      </View>

                      {!!selectedSalonData && (
                        <View style={styles.salonBadge}>
                          <FontAwesome5 name="store" size={9} color={COLORS.success} />
                          <Text style={styles.salonBadgeText} numberOfLines={1}>
                            {selectedSalonData.name}
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text style={[styles.heroTitle, ultraSmall && styles.heroTitleUltraSmall]} numberOfLines={3}>
                      Manage Your Team
                    </Text>
                    <Text style={styles.heroDescription} numberOfLines={4}>
                      Manage staff members, schedules, specializations, leaves and availability across your salons.
                    </Text>
                  </View>
                </View>

                <View style={[styles.heroSelector, (mobile || tablet) && styles.heroSelectorMobile]}>
                  <CustomSelect
                    label="SELECT SALON"
                    value={selectedSalon}
                    placeholder={salonLoading ? "Loading salons..." : "Select salon"}
                    options={salons.map((salon) => ({
                      value: String(salon._id),
                      label: salon.name || "Unnamed Salon",
                    }))}
                    onChange={setSelectedSalon}
                    disabled={salonLoading}
                    icon="store"
                    searchable
                    modalTitle="Select Salon"
                  />
                </View>
              </View>
            </View>
          </View>

          {!selectedSalon ? (
            <View style={styles.noSalonCard}>
              <View style={styles.noSalonIcon}>
                <FontAwesome5 name="store" size={25} color={COLORS.primary} />
              </View>
              <Text style={styles.noSalonTitle}>Select a salon to continue</Text>
              <Text style={styles.noSalonText}>
                Choose one of your salons above to view and manage its staff members.
              </Text>

              {salons.length === 0 && !salonLoading && (
                <View style={styles.warningBanner}>
                  <FontAwesome5 name="exclamation-triangle" size={13} color={COLORS.warning} />
                  <Text style={styles.warningBannerText}>
                    No salons are currently associated with your account.
                  </Text>
                </View>
              )}

              {salonLoading && (
                <View style={styles.loadingInline}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingInlineText}>Loading your salons...</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* Stats */}
              <View style={[styles.statsGrid, wide && styles.statsGridWide, tablet && styles.statsGridTablet, mobile && styles.statsGridMobile, ultraSmall && styles.statsGridUltraSmall]}>
                <StatCard compact={mobile || tablet} icon="users" label="TOTAL STAFF" value={stats.total} helper="Team members" />
                <StatCard compact={mobile || tablet} icon="user-check" label="ACTIVE" value={stats.active} helper="Currently working" tone="success" />
                <StatCard compact={mobile || tablet} icon="ban" label="INACTIVE" value={stats.inactive} helper="Not available" tone="danger" />
                <StatCard compact={mobile || tablet} icon="calendar-alt" label="ON LEAVE TODAY" value={stats.onLeaveToday} helper="Staff unavailable" tone="warning" />
              </View>

              {/* Toolbar */}
              <View
                style={[
                  styles.toolbar,
                  mobile && styles.toolbarMobile,
                  tablet && styles.toolbarTablet,
                ]}
              >
                <View
                  style={[
                    styles.searchWrap,
                    wide && styles.searchWide,
                    mobile && styles.searchMobile,
                    tablet && styles.searchTablet,
                    searchFocused && styles.searchFocused,
                  ]}
                >
                  <Ionicons name="search" size={18} color={COLORS.faint} />
                  <TextInput
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search staff, phone or specialization..."
                    placeholderTextColor={COLORS.faint}
                    style={styles.searchInput}
                    autoCorrect={false}
                    clearButtonMode="while-editing"
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  {!!searchText && (
                    <Pressable onPress={() => setSearchText("")} style={styles.clearSearch}>
                      <Ionicons name="close-circle" size={17} color={COLORS.faint} />
                    </Pressable>
                  )}
                </View>

                <View
                  style={[
                    styles.toolbarFilter,
                    mobile && styles.toolbarFilterMobile,
                    tablet && styles.toolbarFilterTablet,
                  ]}
                >
                  <CustomSelect
                    value={statusFilter}
                    placeholder="Filter status"
                    options={statusOptions}
                    onChange={setStatusFilter}
                    icon="filter"
                    modalTitle="Filter Staff"
                  />
                </View>

                <PremiumButton
                  title={wide || tablet ? "Add Staff" : "Add"}
                  icon="user-plus"
                  onPress={openCreateModal}
                  style={[
                    styles.addButton,
                    mobile && styles.addButtonMobile,
                    tablet && styles.addButtonTablet,
                  ]}
                />
              </View>

              {/* Result summary */}
              <View style={[styles.resultHeader, mobile && styles.resultHeaderMobile]}>
                <View style={styles.resultTitleWrap}>
                  <View style={styles.resultLiveDot} />
                  <Text style={styles.resultTitle}>
                    {filteredStaff.length} staff member{filteredStaff.length === 1 ? "" : "s"}
                  </Text>
                  {searchText || statusFilter !== "ALL" ? (
                    <View style={styles.filteredPill}>
                      <Text style={styles.filteredPillText}>Filtered</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.resultHint}>
                  {loading ? "Refreshing..." : selectedSalonData?.name || "Selected salon"}
                </Text>
              </View>

              {loading ? (
                <View style={styles.loadingCard}>
                  <View style={styles.loadingSpinnerBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  </View>
                  <Text style={styles.loadingTitle}>Loading staff</Text>
                  <Text style={styles.loadingText}>Fetching the latest team data...</Text>
                </View>
              ) : filteredStaff.length === 0 ? (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <FontAwesome5 name="users-slash" size={25} color={COLORS.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {searchText || statusFilter !== "ALL" ? "No staff match your filters" : "No staff members yet"}
                  </Text>
                  <Text style={styles.emptyText}>
                    {searchText || statusFilter !== "ALL"
                      ? "Try changing your search or status filter."
                      : "Create your first staff profile for this salon."}
                  </Text>
                  {searchText || statusFilter !== "ALL" ? (
                    <PremiumButton
                      title="Clear filters"
                      icon="undo"
                      variant="soft"
                      onPress={() => {
                        setSearchText("");
                        setStatusFilter("ALL");
                      }}
                      style={styles.emptyButton}
                    />
                  ) : (
                    <PremiumButton
                      title="Add First Staff"
                      icon="user-plus"
                      onPress={openCreateModal}
                      style={styles.emptyButton}
                    />
                  )}
                </View>
              ) : (
                <View style={styles.staffList}>
                  {filteredStaff.map((item) => (
                    <StaffCard
                      key={item._id}
                      item={item}
                      expanded={expandedStaff === item._id}
                      onExpand={(id) => setExpandedStaff((prev) => prev === id ? null : id)}
                      onEdit={openEditModal}
                      onStatus={toggleStatus}
                      onDelete={deleteStaff}
                      onLeave={openLeaveModal}
                      onRemoveLeave={removeLeave}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <StaffFormModal
          visible={showModal}
          editingStaff={editingStaff}
          form={form}
          setForm={setForm}
          salons={salons}
          services={services}
          serviceLoading={serviceLoading}
          saving={saving}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          onClose={() => {
            if (!saving) {
              setShowModal(false);
              setEditingStaff(null);
            }
          }}
          onSubmit={handleSubmit}
          onPickImage={pickImage}
          onAddSpecialization={addSpecialization}
          onRemoveSpecialization={removeSpecialization}
          onToggleService={toggleService}
          onToggleWorkingDay={toggleWorkingDay}
          onUpdateWorkingHour={updateWorkingHour}
        />

        <LeaveModal
          visible={showLeaveModal}
          staff={leaveStaff}
          form={leaveForm}
          setForm={setLeaveForm}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setShowLeaveModal(false);
              setLeaveStaff(null);
            }
          }}
          onSubmit={submitLeave}
        />

        <ConfirmModal
          visible={confirmState.visible}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          destructive={confirmState.destructive}
          loading={saving}
          onCancel={() => {
            if (!saving) {
              setConfirmState((prev) => ({ ...prev, visible: false }));
            }
          }}
          onConfirm={confirmState.onConfirm}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  page: {
    flex: 1,
  },

  pageContent: {
    paddingBottom: 50,
  },

  flex1: {
    flex: 1,
    minWidth: 0,
  },

  hero: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    overflow: "hidden",
  },

  heroInner: {
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 22,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 22,
  },

  heroTopMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 14,
  },

  heroIdentityMobile: {
    width: "100%",
    alignItems: "flex-start",
  },

  heroSelectorMobile: {
    width: "100%",
    maxWidth: "100%",
  },

  heroIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  heroGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -80,
    top: -150,
    backgroundColor: "#EEF0FF",
    opacity: 0.8,
  },

  heroIconUltraSmall: {
    width: 48,
    height: 48,
    borderRadius: 16,
  },

  heroTitleUltraSmall: {
    fontSize: 24,
    lineHeight: 29,
    letterSpacing: -0.7,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    left: -100,
    bottom: -160,
    backgroundColor: "#F3E8FF",
    opacity: 0.55,
  },

  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
  },

  heroBadge: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  salonBadge: {
    maxWidth: 240,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.successSoft,
    borderWidth: 1,
    borderColor: "#D1FADF",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  salonBadgeText: {
    flexShrink: 1,
    color: "#027A48",
    fontSize: 9,
    fontWeight: "800",
  },

  heroTitle: {
    color: COLORS.ink,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  heroDescription: {
    marginTop: 7,
    maxWidth: 680,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  heroSelector: {
    width: 330,
    flexShrink: 0,
  },

  fieldLabel: {
    marginBottom: 7,
    color: "#667085",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },

  required: {
    color: COLORS.danger,
  },

  selectBox: {
    minHeight: 52,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
  },

  selectPressed: {
    transform: [{ scale: 0.992 }],
    borderColor: "#C7C4FF",
  },

  selectLeft: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  selectText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },

  selectPlaceholder: {
    color: COLORS.faint,
    fontWeight: "600",
  },

  noSalonCard: {
    minHeight: 430,
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  noSalonIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  noSalonTitle: {
    color: COLORS.ink,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },

  noSalonText: {
    maxWidth: 430,
    marginTop: 8,
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  warningBanner: {
    maxWidth: 470,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: "#FEDF89",
  },

  warningBannerText: {
    flex: 1,
    color: "#B54708",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },

  loadingInline: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  loadingInlineText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  statsGrid: {
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 20,
    gap: 12,
  },

  statsGridWide: {
    flexDirection: "row",
    flexWrap: "nowrap",
  },

  statsGridTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  statsGridMobile: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 9,
  },

  statsGridUltraSmall: {
    paddingHorizontal: 10,
    gap: 8,
  },

  statCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 158,
    overflow: "hidden",
    position: "relative",
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 17,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.045,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  statAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },

  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },

  statBottom: {
    marginTop: 20,
  },

  statCardMobile: {
    flex: 0,
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 0,
    minHeight: 138,
    padding: 13,
  },

  statLabel: {
    color: COLORS.faint,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  statValue: {
    marginTop: 3,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -1,
  },

  statHelper: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  toolbar: {
    marginHorizontal: 18,
    marginTop: 18,
    padding: 13,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },

  toolbarMobile: {
    marginHorizontal: 12,
    padding: 10,
    gap: 8,
    flexDirection: "column",
    alignItems: "stretch",
  },

  toolbarTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
  },

  searchWrap: {
    minHeight: 52,
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSoft,
  },

  searchWide: {
    minWidth: 280,
  },

  searchMobile: {
    width: "100%",
    minWidth: 0,
  },

  searchTablet: {
    flexBasis: "100%",
    width: "100%",
    flexGrow: 1,
  },

  searchFocused: {
    borderColor: "#C7C4FF",
    backgroundColor: "#FFFFFF",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: "600",
    outlineStyle: "none",
  },

  clearSearch: {
    padding: 3,
  },

  toolbarFilter: {
    minWidth: 160,
  },

  toolbarFilterMobile: {
    width: "100%",
    minWidth: 0,
  },

  toolbarFilterTablet: {
    flex: 1,
    minWidth: 0,
  },

  addButtonMobile: {
    width: "100%",
    minWidth: 0,
  },

  addButtonTablet: {
    minWidth: 125,
    flexShrink: 0,
  },

  addButton: {
    minHeight: 52,
    flexShrink: 0,
  },

  button: {
    minHeight: 44,
    minWidth: 0,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    flexShrink: 1,
  },

  buttonPrimary: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },

  buttonDanger: {
    borderColor: COLORS.danger,
    backgroundColor: COLORS.danger,
  },

  buttonSoft: {
    borderColor: "#D9D6FE",
    backgroundColor: COLORS.primarySoft,
  },

  buttonOutline: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  buttonText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "900",
  },

  buttonTextWhite: {
    color: "#fff",
  },

  buttonTextPrimary: {
    color: COLORS.primary,
  },

  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.94,
  },

  disabled: {
    opacity: 0.55,
  },

  resultHeader: {
    marginHorizontal: 18,
    marginTop: 19,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  resultHeaderMobile: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 10,
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 6,
  },

  resultTitleWrap: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  resultLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  resultTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
  },

  resultHint: {
    maxWidth: 260,
    color: COLORS.faint,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "700",
  },

  filteredPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },

  filteredPillText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
  },

  staffList: {
    paddingHorizontal: 18,
    gap: 12,
  },

  staffCard: {
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.045,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  staffCardTopGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
  },

  staffMainRow: {
    padding: 16,
    paddingTop: 19,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },

  staffMainRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
    paddingHorizontal: 13,
  },

  avatar: {
    flexShrink: 0,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  staffIdentity: {
    flex: 1,
    minWidth: 0,
  },

  staffIdentityMobile: {
    width: "100%",
    flex: 0,
  },

  nameLine: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 7,
  },

  staffName: {
    maxWidth: "100%",
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusBadgeActive: {
    backgroundColor: COLORS.successSoft,
    borderColor: "#D1FADF",
  },

  statusBadgeInactive: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: "#FEE4E2",
  },

  statusBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
  },

  identityMeta: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  metaItem: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metaText: {
    maxWidth: 210,
    flexShrink: 1,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },

  chipWrap: {
    marginTop: 9,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },

  specChip: {
    maxWidth: 170,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F8F7FF",
    borderWidth: 1,
    borderColor: "#E6E3FF",
  },

  specChipText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
  },

  specMoreChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  specMoreText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
  },

  staffActions: {
    flexShrink: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: 6,
    maxWidth: 176,
  },

  /* Action buttons: dedicated responsive row on mobile/tablet.
     Keeps the buttons below the staff details and prevents overlap. */
  staffActionsMobile: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 0,
    alignSelf: "stretch",
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    paddingHorizontal: 13,
    paddingBottom: 12,
    paddingTop: 0,
  },

  iconAction: {
    width: 38,
    height: 38,
    minWidth: 38,
    minHeight: 38,
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  iconActionPrimary: {
    backgroundColor: COLORS.primarySoft,
    borderColor: "#D9D6FE",
  },

  iconActionWarning: {
    backgroundColor: COLORS.warningSoft,
    borderColor: "#FEDF89",
  },

  iconActionSuccess: {
    backgroundColor: COLORS.successSoft,
    borderColor: "#D1FADF",
  },

  iconActionDanger: {
    backgroundColor: COLORS.dangerSoft,
    borderColor: "#FEE4E2",
  },

  staffBottomRow: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  staffBottomRowMobile: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingHorizontal: 13,
    gap: 8,
  },

  quickInfo: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 9,
  },

  quickInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  quickInfoText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  todayLeavePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.warningSoft,
  },

  todayLeaveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.warning,
  },

  todayLeaveText: {
    color: "#B54708",
    fontSize: 9,
    fontWeight: "900",
  },

  leaveButton: {
    flexShrink: 0,
    minHeight: 35,
    paddingHorizontal: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#FEDF89",
    backgroundColor: COLORS.warningSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  leaveButtonText: {
    color: "#B54708",
    fontSize: 10,
    fontWeight: "900",
  },

  leaveButtonMobile: {
    width: "100%",
    justifyContent: "center",
  },

  expandedArea: {
    padding: 14,
    paddingTop: 0,
    gap: 10,
  },

  detailPanel: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
  },

  sectionHeader: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  sectionHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    color: COLORS.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 2,
    color: COLORS.faint,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  miniAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    alignItems: "center",
    justifyContent: "center",
  },

  scheduleList: {
    marginTop: 13,
    gap: 7,
  },

  scheduleCompact: {
    marginTop: 12,
    gap: 6,
  },

  scheduleRow: {
    minHeight: 40,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  scheduleDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  scheduleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  scheduleDayText: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "800",
  },

  scheduleTime: {
    color: COLORS.success,
    fontSize: 10,
    fontWeight: "900",
  },

  scheduleClosed: {
    color: COLORS.faint,
  },

  leaveList: {
    marginTop: 12,
    gap: 7,
  },

  leaveHistoryRow: {
    minWidth: 0,
    padding: 9,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  leaveDateIcon: {
    width: 33,
    height: 33,
    borderRadius: 10,
    backgroundColor: COLORS.warningSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  leaveRange: {
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "900",
  },

  leaveReason: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  removeLeaveButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#FEE4E2",
    alignItems: "center",
    justifyContent: "center",
  },

  inlineEmpty: {
    minHeight: 65,
    marginTop: 11,
    borderRadius: 13,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  inlineEmptyText: {
    color: COLORS.faint,
    fontSize: 10,
    fontWeight: "700",
  },

  loadingCard: {
    marginHorizontal: 18,
    minHeight: 280,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  loadingSpinnerBox: {
    width: 64,
    height: 64,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTitle: {
    marginTop: 14,
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: "900",
  },

  loadingText: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "600",
  },

  emptyCard: {
    marginHorizontal: 18,
    minHeight: 320,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    maxWidth: 450,
    marginTop: 15,
    color: COLORS.ink,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },

  emptyText: {
    maxWidth: 450,
    marginTop: 6,
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
  },

  emptyButton: {
    marginTop: 17,
  },

  toastLayer: {
    position: "absolute",
    zIndex: 9999,
    top: 14,
    left: 14,
    right: 14,
    alignItems: "center",
  },

  toast: {
    width: "100%",
    maxWidth: 620,
    minHeight: 58,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 9 },
    elevation: 12,
  },

  toastSuccess: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1FADF",
  },

  toastError: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FEE4E2",
  },

  toastIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  toastIconSuccess: {
    backgroundColor: COLORS.successSoft,
  },

  toastIconError: {
    backgroundColor: COLORS.dangerSoft,
  },

  toastText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
  },

  toastClose: {
    padding: 5,
  },

  modalBackdrop: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    justifyContent: "center",
    alignItems: "center",
  },

  selectModal: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "92%",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 15 },
    elevation: 18,
  },

  serviceModal: {
    width: "100%",
    maxWidth: 760,
    height: "84%",
    maxHeight: "92%",
  },

  modalTopLine: {
    height: 3,
    backgroundColor: COLORS.primary,
  },

  modalHeader: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  modalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalTitle: {
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
  },

  modalSubtitle: {
    marginTop: 2,
    flexShrink: 1,
    color: COLORS.faint,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "600",
  },

  closeIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalSearch: {
    width: "auto",
    minWidth: 0,
    margin: 9,
    minHeight: 46,
    paddingHorizontal: 10,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },

  modalSearchInput: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "600",
    outlineStyle: "none",
  },

  optionList: {
    width: "100%",
    paddingHorizontal: 9,
    paddingBottom: 10,
    gap: 6,
  },

  optionRow: {
    width: "100%",
    minWidth: 0,
    minHeight: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
  },

  optionRowActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: "#C7C4FF",
  },

  optionPressed: {
    transform: [{ scale: 0.99 }],
  },

  optionMain: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  optionCheck: {
    width: 25,
    height: 25,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  optionCheckActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },

  optionText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
  },

  optionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "900",
  },

  selectedPill: {
    flexShrink: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9D6FE",
  },

  selectedPillText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.4,
  },

  emptyOptions: {
    minHeight: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  emptyOptionsText: {
    color: COLORS.faint,
    fontSize: 11,
    fontWeight: "700",
  },

  serviceOption: {
    width: "100%",
    minWidth: 0,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  serviceOptionActive: {
    backgroundColor: COLORS.primarySoft,
    borderColor: "#C7C4FF",
  },

  serviceCheck: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceCheckFilled: {
    width: 25,
    height: 25,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceCheckEmpty: {
    width: 23,
    height: 23,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
  },

  serviceOptionName: {
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },

  serviceOptionMeta: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "700",
  },

  modalFooter: {
    width: "100%",
    minHeight: 60,
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  selectedCount: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },

  formBackdrop: {
    flex: 1,
    width: "100%",
    height: "100%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: "rgba(15, 23, 42, 0.68)",
    alignItems: "center",
    justifyContent: "center",
  },

  formKeyboard: {
    width: "100%",
    height: "100%",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 8,
  },

  formModal: {
    width: "100%",
    maxWidth: 1180,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 18 },
    elevation: 22,
  },

  formHeader: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
    backgroundColor: COLORS.surface,
  },

  formHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  formHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  formTitleRow: {
    flex: 1,
    minWidth: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  formTitle: {
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
  },

  formModePill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
  },

  formModeText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  formSubtitle: {
    marginTop: 2,
    flexShrink: 1,
    color: COLORS.faint,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },

  formScroll: {
    flex: 1,
    flexBasis: 0,
    minHeight: 0,
    width: "100%",
  },

  formContent: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 28,
  },

  formGrid: {
    width: "100%",
    minWidth: 0,
    gap: 12,
  },

  formGridWide: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  formColumn: {
    flex: 1,
    minWidth: 0,
    width: "100%",
  },

  fullWidth: {
    width: "100%",
  },

  formPanel: {
    width: "100%",
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 13,
  },

  fieldGroup: {
    width: "100%",
    minWidth: 0,
    marginTop: 13,
  },

  inputWrap: {
    width: "100%",
    minWidth: 0,
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "hidden",
  },

  input: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    minHeight: 46,
    paddingVertical: 0,
    paddingHorizontal: 0,
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "600",
    outlineStyle: "none",
  },

  profileEditor: {
    marginTop: 14,
    padding: 12,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  profileImageWrap: {
    position: "relative",
    flexShrink: 0,
  },

  profilePreview: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
  },

  profilePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    alignItems: "center",
    justifyContent: "center",
  },

  cameraButton: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  imageTitle: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "900",
  },

  imageHint: {
    maxWidth: 300,
    marginTop: 3,
    color: COLORS.faint,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
  },

  smallButton: {
    alignSelf: "flex-start",
    minHeight: 35,
    marginTop: 8,
    paddingHorizontal: 10,
    borderRadius: 11,
  },

  tagInputWrap: {
    width: "100%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    padding: 7,
  },

  tagInputTop: {
    width: "100%",
    minWidth: 0,
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 5,
  },

  tagInput: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    color: COLORS.ink,
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 0,
    paddingVertical: 0,
    outlineStyle: "none",
  },

  addTagButton: {
    minHeight: 32,
    flexShrink: 0,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  addTagText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "900",
  },

  tagList: {
    paddingHorizontal: 6,
    paddingBottom: 5,
    paddingTop: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },

  editTag: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9D6FE",
  },

  editTagText: {
    maxWidth: 170,
    color: COLORS.primaryDark,
    fontSize: 9,
    fontWeight: "800",
  },

  multiSelectBox: {
    width: "100%",
    minWidth: 0,
    minHeight: 62,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    overflow: "hidden",
  },

  multiSelectLeft: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  multiSelectTitle: {
    flexShrink: 1,
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
  },

  multiSelectHint: {
    marginTop: 2,
    flexShrink: 1,
    color: COLORS.faint,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "600",
  },

  weeklyPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
  },

  weeklyPillText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  scheduleEditor: {
    width: "100%",
    minWidth: 0,
    marginTop: 14,
    gap: 8,
  },

  scheduleEditorRow: {
    width: "100%",
    minWidth: 0,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  scheduleEditorRowMobile: {
    width: "100%",
    minWidth: 0,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 10,
  },

  dayInfo: {
    flex: 1,
    width: "auto",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dayToggleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  dayName: {
    color: COLORS.ink,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    flexShrink: 1,
  },

  dayState: {
    marginTop: 1,
    color: COLORS.faint,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "700",
    flexShrink: 1,
  },

  switch: {
    width: 40,
    height: 23,
    padding: 2,
    borderRadius: 999,
    backgroundColor: "#D0D5DD",
    alignSelf: "center",
    flexShrink: 0,
  },

  switchOn: {
    backgroundColor: COLORS.success,
  },

  switchThumb: {
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#fff",
  },

  switchThumbOn: {
    transform: [{ translateX: 17 }],
  },

  timeFields: {
    width: 220,
    maxWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 0,
  },

  timeInputWrap: {
    flex: 1,
    minWidth: 0,
    height: 43,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    overflow: "hidden",
  },

  disabledTime: {
    opacity: 0.45,
    backgroundColor: "#F2F4F7",
  },

  timeInput: {
    flex: 1,
    minWidth: 0,
    width: "auto",
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
    outlineStyle: "none",
  },

  timeDash: {
    color: COLORS.faint,
    fontSize: 12,
    fontWeight: "900",
  },

  infoBanner: {
    marginTop: 13,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B2DDFF",
    backgroundColor: COLORS.infoSoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  infoBannerIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: "#D1E9FF",
    alignItems: "center",
    justifyContent: "center",
  },

  infoBannerTitle: {
    color: "#175CD3",
    fontSize: 10,
    fontWeight: "900",
  },

  infoBannerText: {
    marginTop: 2,
    color: "#175CD3",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
  },

  formFooter: {
    width: "100%",
    minHeight: 70,
    flexShrink: 0,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: "#FBFCFE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    zIndex: 20,
  },

  footerHint: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  footerHintDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },

  footerHintText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.faint,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "700",
  },

  footerButtons: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  footerButtonsFull: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
  },

  formFooterMobile: {
    width: "100%",
    minHeight: 0,
    paddingHorizontal: 9,
    paddingVertical: 8,
    flexDirection: "column",
    alignItems: "stretch",
    gap: 7,
  },

  footerButtonsMobile: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    flexShrink: 0,
  },

  footerCancel: {
  flex: 1,
  minWidth: 100,
  flexShrink: 0,
},

footerSave: {
  flex: 1,
  minWidth: 135,
  flexShrink: 0,
},

  leaveModal: {
    width: "100%",
    maxWidth: 560,
    minWidth: 0,
    maxHeight: "90%",
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 15 },
    elevation: 20,
  },

  leaveFormContent: {
    width: "100%",
    minWidth: 0,
    padding: 12,
    gap: 11,
  },

  leaveNotice: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEDF89",
    backgroundColor: COLORS.warningSoft,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  leaveNoticeIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FEF0C7",
    alignItems: "center",
    justifyContent: "center",
  },

  leaveNoticeText: {
    flex: 1,
    color: "#B54708",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },

  dateGrid: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  dateGridMobile: {
    flexDirection: "column",
    gap: 10,
  },

  textAreaWrap: {
    minHeight: 105,
    alignItems: "flex-start",
  },

  textArea: {
    minHeight: 82,
    textAlignVertical: "top",
  },

  profileEditorCompact: {
    alignItems: "flex-start",
  },
  inputWrapPressable: {
    minHeight: 44,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },

  dateValueText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
  },

  datePlaceholderText: {
    color: COLORS.faint,
    fontWeight: "600",
  },

  calendarBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  calendarModal: {
    width: "100%",
    maxWidth: 410,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },

  calendarModalMobile: {
    maxWidth: 390,
  },

  calendarHeader: {
    minWidth: 0,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  calendarHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "900",
  },

  calendarSubtitle: {
    marginTop: 2,
    color: COLORS.faint,
    fontSize: 10,
    fontWeight: "700",
  },

  calendarMonthBar: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  calendarNavButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarMonthText: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },

  calendarWeekRow: {
    paddingHorizontal: 12,
    flexDirection: "row",
  },

  calendarWeekCell: {
    width: "14.2857%",
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarWeekText: {
    color: COLORS.faint,
    fontSize: 10,
    fontWeight: "900",
  },

  calendarGrid: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarDayCell: {
    width: "14.2857%",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarDayButton: {
    borderRadius: 13,
  },

  calendarDayPressed: {
    backgroundColor: COLORS.primarySoft,
  },

  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },

  calendarDayText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "800",
  },

  calendarDaySelectedText: {
    color: "#fff",
    fontWeight: "900",
  },

  calendarTodayText: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  calendarPastText: {
    color: "#B8BFCC",
  },

  calendarTodayDot: {
    position: "absolute",
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  calendarTodayDotSelected: {
    backgroundColor: "#fff",
  },

  calendarFooter: {
    minHeight: 56,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  calendarLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  calendarLegendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  calendarLegendText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  calendarTodayButton: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarTodayButtonText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
  },

  confirmBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  confirmModal: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 20,
  },

  confirmIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  confirmIconDanger: {
    backgroundColor: COLORS.dangerSoft,
    borderWidth: 1,
    borderColor: "#FEE4E2",
  },

  confirmIconPrimary: {
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: "#D9D6FE",
  },

  confirmTitle: {
    color: COLORS.ink,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
  },

  confirmMessage: {
    marginTop: 7,
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  confirmButtons: {
    marginTop: 18,
    width: "100%",
    flexDirection: "row",
    gap: 9,
  },

  confirmCancelButton: {
    flex: 1,
    minWidth: 0,
  },

  confirmActionButton: {
    flex: 1,
    minWidth: 0,
  },

});
