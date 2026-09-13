import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
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
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  activateStaff,
  deactivateStaff,
} from "../../../../services/adminStaffservice";

const rawApiUrl = String(
  process.env.EXPO_PUBLIC_API_URL ||
    (Platform.OS === "android"
      ? "http://10.0.2.2:1812"
      : "http://localhost:1812")
).trim();

const API_URL = rawApiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");

const SALONS_API_PATH =
  process.env.EXPO_PUBLIC_SALONS_API_PATH || "/api/salons";
const SERVICES_API_PREFIX =
  process.env.EXPO_PUBLIC_SERVICES_API_PREFIX || "/api/services/salon";

const normalizeApiPath = (path) => {
  const value = String(path || "").trim();
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
};

const buildApiUrl = (path) => `${API_URL}${normalizeApiPath(path)}`;

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

const TIME_OPTIONS = Array.from({ length: 288 }, (_, index) => {
  const totalMinutes = index * 5;
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
});

const createWorkingHours = () =>
  DAYS.map((day) => ({
    day,
    startTime: "09:00",
    endTime: "18:00",
    isWorking: day !== "SUNDAY",
  }));

const createInitialForm = () => ({
  salon: "",
  name: "",
  specialization: "",
  services: [],
  phone: "",
  profileImage: null,
  profileImagePreview: "",
  workingHours: createWorkingHours(),
});

const icon = (name, size = 18, color = "#64748b") => (
  <MaterialCommunityIcons name={name} size={size} color={color} />
);

const getToken = async () => {
  try {
    if (Platform.OS === "web" && typeof sessionStorage !== "undefined") {
      const webToken = sessionStorage.getItem("token");
      if (webToken) return webToken;
    }

    return await AsyncStorage.getItem("token");
  } catch {
    return null;
  }
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const getId = (value) =>
  typeof value === "object" && value !== null ? value?._id : value;

const getSpecializationText = (specialization) => {
  if (Array.isArray(specialization)) {
    return specialization.join(", ");
  }

  return specialization || "General";
};

const getSpecializationSearchText = (specialization) => {
  if (Array.isArray(specialization)) {
    return specialization.join(" ").toLowerCase();
  }

  return String(specialization || "").toLowerCase();
};

const formatDay = (day) =>
  day ? `${day.charAt(0)}${day.slice(1).toLowerCase()}` : "";

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getWorkingHourForDay = (workingHours, day) =>
  workingHours?.find((item) => item.day === day) || null;

const getInitials = (name) => {
  const value = String(name || "?").trim();

  if (!value) return "?";

  const parts = value.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const getImageUri = (profileImage) => {
  if (!profileImage) return "";

  // Backend APIs sometimes return the image as a string and sometimes
  // as an object (url/path/secure_url). Never stringify the object into
  // "[object Object]" because that produces a broken Image source.
  const raw =
    typeof profileImage === "string"
      ? profileImage
      : profileImage?.url ||
        profileImage?.secure_url ||
        profileImage?.path ||
        profileImage?.imageUrl ||
        profileImage?.image ||
        profileImage?.filename ||
        "";

  if (!raw) return "";

  if (raw.startsWith("data:image/")) return raw;
  if (raw.startsWith("blob:")) return raw;
  // If the backend stored localhost/127.0.0.1, a real phone cannot reach
  // that address. Replace it with the configured API host. This also fixes
  // browser previews when the backend returns localhost image URLs.
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?/i.test(raw)) {
    try {
      const parsed = new URL(raw);
      return `${API_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      // fall through to normal relative-path handling
    }
  }

  if (/^https?:\/\//i.test(raw)) return raw;

  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_URL}${normalized}`;
};

const readJsonResponse = async (response, label, requestUrl = "") => {
  const contentType = response.headers?.get?.("content-type") || "";
  const text = await response.text();

  if (!text) {
    if (!response.ok) {
      throw new Error(`${label} failed (${response.status}).`);
    }
    return {};
  }

  // This is the exact cause of the screenshot error when a frontend/HTML
  // page is returned by an API request: JSON.parse sees the first '<'.
  if (!contentType.toLowerCase().includes("application/json")) {
    const looksLikeHtml = /^\s*<!doctype html|^\s*<html/i.test(text);
    if (looksLikeHtml) {
      const preview = text
        .replace(/\s+/g, " ")
        .slice(0, 180);
      throw new Error(
        `${label} returned HTML instead of JSON (HTTP ${response.status}). URL: ${requestUrl || "unknown"}. ${preview}`
      );
    }
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `${label} returned invalid JSON (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || `${label} failed (${response.status}).`
    );
  }

  return data;
};

const apiFetchJson = async (path, options = {}, label = "API request") => {
  const requestUrl = buildApiUrl(path);
  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  return readJsonResponse(response, label, requestUrl);
};

const apiFetchJsonWithFallback = async (paths, options = {}, label = "API request") => {
  const uniquePaths = [...new Set(paths.map(normalizeApiPath))];
  let lastError = null;

  for (const path of uniquePaths) {
    try {
      return await apiFetchJson(path, options, label);
    } catch (error) {
      lastError = error;
      const message = String(error?.message || "");
      // Only fall through on routing/HTML/404-style failures. Do not hide
      // auth, validation, network or server errors from a valid API route.
      if (!/returned HTML|HTTP 404|HTTP 405|invalid JSON/i.test(message)) {
        throw error;
      }
    }
  }

  throw lastError || new Error(`${label} failed.`);
};

const normalizeWorkingHours = (workingHours) => {
  const source = safeArray(workingHours);

  return DAYS.map((day) => {
    const found = source.find((item) => item?.day === day);

    return {
      day,
      startTime: found?.startTime || "09:00",
      endTime: found?.endTime || "18:00",
      isWorking: found?.isWorking !== false && day !== "SUNDAY",
    };
  });
};

const FieldLabel = ({ children, required = false }) => (
  <View style={styles.labelRow}>
    <Text style={styles.fieldLabel}>{children}</Text>
    {required ? <Text style={styles.required}>*</Text> : null}
  </View>
);

const SectionHeader = ({
  iconName,
  title,
  subtitle,
  tone = "violet",
}) => {
  const palette =
    tone === "emerald"
      ? styles.emeraldIcon
      : tone === "amber"
        ? styles.amberIcon
        : styles.violetIcon;

  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, palette]}>
        {icon(iconName, 19, palette.color)}
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const StatCard = ({ label, value, iconName, tone }) => {
  const toneStyles = {
    violet: {
      iconBg: "#f1ecff",
      iconColor: "#6d28d9",
      valueColor: "#111827",
    },
    emerald: {
      iconBg: "#e9fbf3",
      iconColor: "#059669",
      valueColor: "#059669",
    },
    rose: {
      iconBg: "#fff0f2",
      iconColor: "#e11d48",
      valueColor: "#e11d48",
    },
  };

  const palette = toneStyles[tone] || toneStyles.violet;

  return (
    <View style={styles.statCard}>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color: palette.valueColor }]}>
          {value}
        </Text>
      </View>

      <View style={[styles.statIcon, { backgroundColor: palette.iconBg }]}>
        {icon(iconName, 20, palette.iconColor)}
      </View>
    </View>
  );
};

const StatusBadge = ({ active }) => (
  <View
    style={[
      styles.statusBadge,
      active ? styles.statusActive : styles.statusInactive,
    ]}
  >
    <View
      style={[
        styles.statusDot,
        { backgroundColor: active ? "#10b981" : "#94a3b8" },
      ]}
    />

    <Text
      style={[
        styles.statusText,
        { color: active ? "#047857" : "#64748b" },
      ]}
    >
      {active ? "ACTIVE" : "INACTIVE"}
    </Text>
  </View>
);

const PrimaryButton = ({
  iconName,
  children,
  onPress,
  disabled = false,
  style,
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.primaryButton,
      pressed && !disabled && styles.pressed,
      disabled && styles.disabledButton,
      style,
    ]}
  >
    {icon(iconName, 17, "#ffffff")}
    <Text style={styles.primaryButtonText}>{children}</Text>
  </Pressable>
);

const OutlineButton = ({
  iconName,
  children,
  onPress,
  danger = false,
  style,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.outlineButton,
      danger && styles.outlineDanger,
      pressed && styles.pressed,
      style,
    ]}
  >
    {icon(iconName, 16, danger ? "#e11d48" : "#475569")}
    <Text
      style={[
        styles.outlineButtonText,
        danger && styles.outlineDangerText,
      ]}
    >
      {children}
    </Text>
  </Pressable>
);

/**
 * Reusable full-row selector.
 * Every option is a full-width press target, so there is no tiny select hit-area.
 */
const FullLineSelector = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
  helper,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);

  return (
    <>
      <View style={styles.fieldBlock}>
        <FieldLabel>{label}</FieldLabel>

        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={({ pressed }) => [
            styles.selector,
            pressed && !disabled && styles.selectorPressed,
            disabled && styles.selectorDisabled,
          ]}
        >
          <Text
            numberOfLines={3}
            style={[
              styles.selectorText,
              !selected && styles.placeholderText,
            ]}
          >
            {selected?.label || placeholder}
          </Text>

          {icon(
            "chevron-down",
            21,
            disabled ? "#cbd5e1" : "#64748b"
          )}
        </Pressable>

        {!!helper && <Text style={styles.helperText}>{helper}</Text>}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.selectorModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIcon}>
                  {icon(
                    "format-list-bulleted",
                    20,
                    "#6d28d9"
                  )}
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.modalTitle}>{label}</Text>
                  <Text style={styles.modalSubtitle}>
                    Select one option
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.iconButton}
                onPress={() => setOpen(false)}
              >
                {icon("close", 20, "#475569")}
              </Pressable>
            </View>

            <ScrollView
              style={styles.selectorList}
              contentContainerStyle={styles.selectorListContent}
              keyboardShouldPersistTaps="handled"
            >
              {options.map((item) => {
                const selectedItem = item.value === value;

                return (
                  <Pressable
                    key={String(item.value)}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.selectorOption,
                      selectedItem &&
                        styles.selectorOptionSelected,
                      pressed &&
                        styles.selectorOptionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorOptionText,
                        selectedItem &&
                          styles.selectorOptionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>

                    <View
                      style={[
                        styles.radio,
                        selectedItem && styles.radioSelected,
                      ]}
                    >
                      {selectedItem ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const TimeSelector = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.timeSelector,
          pressed && !disabled && styles.selectorPressed,
          disabled && styles.timeSelectorDisabled,
        ]}
      >
        {icon(
          "clock-outline",
          17,
          disabled ? "#94a3b8" : "#64748b"
        )}

        <Text
          style={[
            styles.timeSelectorText,
            disabled && styles.disabledText,
          ]}
        >
          {value || "--:--"}
        </Text>

        {icon(
          "chevron-down",
          18,
          disabled ? "#cbd5e1" : "#94a3b8"
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.timeModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={[
                    styles.modalHeaderIcon,
                    styles.emeraldIcon,
                  ]}
                >
                  {icon(
                    "clock-outline",
                    20,
                    "#059669"
                  )}
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.modalTitle}>
                    Select time
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    5 minute intervals
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.iconButton}
                onPress={() => setOpen(false)}
              >
                {icon("close", 20, "#475569")}
              </Pressable>
            </View>

            <ScrollView
              style={styles.timeList}
              contentContainerStyle={styles.timeListContent}
              showsVerticalScrollIndicator
            >
              {TIME_OPTIONS.map((time) => {
                const selected = time === value;

                return (
                  <Pressable
                    key={time}
                    onPress={() => {
                      onChange(time);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.timeOption,
                      selected && styles.timeOptionSelected,
                      pressed &&
                        styles.selectorOptionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        selected &&
                          styles.timeOptionTextSelected,
                      ]}
                    >
                      {time}
                    </Text>

                    {selected
                      ? icon(
                          "check-circle",
                          19,
                          "#7c3aed"
                        )
                      : icon(
                          "circle-outline",
                          19,
                          "#cbd5e1"
                        )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const StaffCard = ({
  item,
  onDetails,
  onEdit,
  onStatus,
  onDelete,
  compact = false,
  style,
}) => (
  <View
    style={[
      styles.staffCard,
      compact && styles.staffCardCompact,
      style,
    ]}
  >
    <View style={styles.staffCardTop}>
      {item.profileImage ? (
        <Image
          source={{
            uri: getImageUri(item.profileImage),
          }}
          style={styles.avatarLarge}
          onError={(event) =>
            console.warn("Staff profile image failed:", event?.nativeEvent?.error)
          }
        />
      ) : (
        <View style={styles.avatarLargeFallback}>
          <Text style={styles.avatarInitials}>
            {getInitials(item.name)}
          </Text>
        </View>
      )}

      <View style={styles.staffIdentity}>
        <View style={styles.staffNameRow}>
          <Text style={styles.staffName} numberOfLines={3}>
            {item.name || "Unnamed Staff"}
          </Text>

          <StatusBadge active={!!item.isActive} />
        </View>

        <Text style={styles.staffId} numberOfLines={1}>
          ID: {item._id?.slice(-8) || "-"}
        </Text>
      </View>
    </View>

    <View style={styles.skillPill}>
      {icon("briefcase-outline", 15, "#7c3aed")}

      <Text style={styles.skillText} numberOfLines={4}>
        {getSpecializationText(item.specialization)}
      </Text>
    </View>

    <View style={styles.infoGrid}>
      <View style={styles.infoBox}>
        <View style={styles.infoIcon}>
          {icon("store-outline", 16, "#7c3aed")}
        </View>

        <Text style={styles.infoLabel}>Salon</Text>

        <Text style={styles.infoValue} numberOfLines={3}>
          {item.salon?.name || "Unknown"}
        </Text>

        {!!item.salon?.city && (
          <Text
            style={styles.infoSubValue}
            numberOfLines={2}
          >
            {item.salon.city}
          </Text>
        )}
      </View>

      <View style={styles.infoBox}>
        <View style={styles.infoIcon}>
          {icon("phone-outline", 16, "#64748b")}
        </View>

        <Text style={styles.infoLabel}>Phone</Text>

        <Text style={styles.infoValue} numberOfLines={4}>
          {item.phone || "-"}
        </Text>
      </View>
    </View>

    <View style={styles.cardActions}>
      <Pressable
        onPress={onDetails}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionViolet,
          pressed && styles.pressed,
        ]}
      >
        {icon("clock-outline", 16, "#6d28d9")}
        <Text
          style={[
            styles.actionText,
            { color: "#6d28d9" },
          ]}
        >
          Schedule & Leaves
        </Text>
      </Pressable>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionIndigo,
          pressed && styles.pressed,
        ]}
      >
        {icon("pencil-outline", 16, "#4338ca")}
        <Text
          style={[
            styles.actionText,
            { color: "#4338ca" },
          ]}
        >
          Edit
        </Text>
      </Pressable>

      <Pressable
        onPress={onStatus}
        style={({ pressed }) => [
          styles.actionButton,
          item.isActive
            ? styles.actionAmber
            : styles.actionEmerald,
          pressed && styles.pressed,
        ]}
      >
        {icon(
          item.isActive
            ? "account-off-outline"
            : "account-check-outline",
          16,
          item.isActive ? "#b45309" : "#047857"
        )}

        <Text
          style={[
            styles.actionText,
            {
              color: item.isActive
                ? "#b45309"
                : "#047857",
            },
          ]}
        >
          {item.isActive ? "Deactivate" : "Activate"}
        </Text>
      </Pressable>

      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.actionButton,
          styles.actionRose,
          pressed && styles.pressed,
        ]}
      >
        {icon("trash-can-outline", 16, "#e11d48")}

        <Text
          style={[
            styles.actionText,
            { color: "#e11d48" },
          ]}
        >
          Delete
        </Text>
      </Pressable>
    </View>
  </View>
);

const StaffFormModal = ({
  visible,
  editingStaff,
  form,
  setForm,
  salons,
  salonLoading,
  services,
  serviceLoading,
  saving,
  onClose,
  onSubmit,
  loadServices,
  width,
}) => {
  const updateWorkingHour = (
    index,
    field,
    value
  ) => {
    setForm((prev) => {
      const updated = [...prev.workingHours];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        workingHours: updated,
      };
    });
  };

  const toggleService = (serviceId) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(
            (id) => id !== serviceId
          )
        : [...prev.services, serviceId],
    }));
  };

  const handleSalonChange = async (salonId) => {
    setForm((prev) => ({
      ...prev,
      salon: salonId,
      services: [],
    }));

    await loadServices(salonId);
  };

  const pickProfileImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Please allow photo library access to choose a profile image."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
          selectionLimit: 1,
        });

      if (
        result.canceled ||
        !result.assets?.length
      ) {
        return;
      }

      const asset = result.assets[0];

      if (
        asset.fileSize &&
        asset.fileSize > 5 * 1024 * 1024
      ) {
        Alert.alert(
          "Image too large",
          "Please choose an image smaller than 5 MB."
        );
        return;
      }

      const extension =
        asset.fileName?.split(".").pop()?.toLowerCase() ||
        asset.mimeType?.split("/").pop()?.toLowerCase() ||
        "jpg";

      const mimeType =
        asset.mimeType ||
        `image/${extension === "jpg" ? "jpeg" : extension}`;

      let webFile = asset.file || null;

      // Expo Web may provide only a blob/object URI. Convert it to a real
      // File so multipart upload works reliably in Chrome/Edge/Firefox.
      if (Platform.OS === "web" && !webFile) {
        try {
          const blobResponse = await fetch(asset.uri);
          const blob = await blobResponse.blob();
          webFile = new File(
            [blob],
            asset.fileName || `staff-profile-${Date.now()}.${extension}`,
            { type: mimeType }
          );
        } catch (fileError) {
          console.warn("Could not create browser File object", fileError);
        }
      }

      setForm((prev) => ({
        ...prev,
        profileImage: {
          uri: asset.uri,
          name: asset.fileName || `staff-profile-${Date.now()}.${extension}`,
          type: mimeType,
          file: webFile,
        },
        profileImagePreview: asset.uri,
      }));
    } catch (error) {
      console.error(
        "Image picker error:",
        error
      );

      Alert.alert(
        "Image error",
        "Unable to select the profile image."
      );
    }
  };

  const salonOptions = salons.map((salon) => ({
    value: salon._id,
    label: `${salon.name || "Unnamed Salon"}${
      salon.city ? ` — ${salon.city}` : ""
    }`,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          style={styles.modalKeyboard}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={[
              styles.formModalCard,
              width >= 768 &&
                styles.formModalTablet,
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIcon}>
                  {icon(
                    "briefcase-outline",
                    20,
                    "#6d28d9"
                  )}
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.modalTitle}>
                    {editingStaff
                      ? "Edit Staff"
                      : "Add New Staff"}
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Manage profile, services and
                    weekly availability
                  </Text>
                </View>
              </View>

              <Pressable
                style={styles.iconButton}
                onPress={onClose}
              >
                {icon("close", 21, "#475569")}
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={
                styles.formScrollContent
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <View
                style={[
                  styles.formColumns,
                  width >= 1000 &&
                    styles.formColumnsWide,
                ]}
              >
                <View style={styles.formSection}>
                  <SectionHeader
                    iconName="account-details-outline"
                    title="Basic Information"
                    subtitle="Staff profile details"
                  />

                  <FullLineSelector
                    label="Salon"
                    value={form.salon}
                    placeholder={
                      salonLoading
                        ? "Loading salons..."
                        : "Select salon"
                    }
                    options={salonOptions}
                    onChange={handleSalonChange}
                    disabled={!!editingStaff}
                    helper={
                      editingStaff
                        ? "Salon cannot be changed while editing."
                        : ""
                    }
                  />

                  <View style={styles.fieldBlock}>
                    <FieldLabel required>
                      Staff Name
                    </FieldLabel>

                    <TextInput
                      value={form.name}
                      onChangeText={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          name: value,
                        }))
                      }
                      placeholder="Enter staff name"
                      placeholderTextColor="#94a3b8"
                      style={styles.textInput}
                      returnKeyType="next"
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <FieldLabel>
                      Specialization
                    </FieldLabel>

                    <TextInput
                      value={form.specialization}
                      onChangeText={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          specialization: value,
                        }))
                      }
                      placeholder="Hair stylist, Beautician..."
                      placeholderTextColor="#94a3b8"
                      style={styles.textInput}
                    />

                    <Text style={styles.helperText}>
                      Use comma to separate multiple
                      specializations.
                    </Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <View
                      style={styles.serviceLabelRow}
                    >
                      <FieldLabel>
                        Services
                      </FieldLabel>

                      {form.services.length > 0 ? (
                        <View
                          style={
                            styles.selectedCount
                          }
                        >
                          <Text
                            style={
                              styles.selectedCountText
                            }
                          >
                            {form.services.length}{" "}
                            selected
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.serviceBox}>
                      {serviceLoading ? (
                        <View style={styles.emptyBox}>
                          <ActivityIndicator
                            size="small"
                            color="#7c3aed"
                          />
                          <Text
                            style={
                              styles.emptyBoxText
                            }
                          >
                            Loading services...
                          </Text>
                        </View>
                      ) : !form.salon ? (
                        <View style={styles.emptyBox}>
                          {icon(
                            "store-outline",
                            20,
                            "#94a3b8"
                          )}
                          <Text
                            style={
                              styles.emptyBoxText
                            }
                          >
                            Select a salon first to
                            choose services.
                          </Text>
                        </View>
                      ) : services.length === 0 ? (
                        <View style={styles.emptyBox}>
                          {icon(
                            "briefcase-off-outline",
                            20,
                            "#94a3b8"
                          )}
                          <Text
                            style={
                              styles.emptyBoxText
                            }
                          >
                            No active services found.
                          </Text>
                          <Text
                            style={
                              styles.emptyBoxSubText
                            }
                          >
                            Add active services to this
                            salon first.
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.servicesGrid,
                            width >= 700 &&
                              styles.servicesGridWide,
                          ]}
                        >
                          {services.map((service) => {
                            const selected =
                              form.services.includes(
                                service._id
                              );

                            return (
                              <Pressable
                                key={service._id}
                                onPress={() =>
                                  toggleService(
                                    service._id
                                  )
                                }
                                style={({ pressed }) => [
                                  styles.serviceItem,
                                  selected &&
                                    styles.serviceItemSelected,
                                  pressed &&
                                    styles.selectorOptionPressed,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.checkbox,
                                    selected &&
                                      styles.checkboxSelected,
                                  ]}
                                >
                                  {selected
                                    ? icon(
                                        "check",
                                        13,
                                        "#ffffff"
                                      )
                                    : null}
                                </View>

                                <View
                                  style={
                                    styles.flexOne
                                  }
                                >
                                  <Text
                                    style={[
                                      styles.serviceName,
                                      selected &&
                                        styles.serviceNameSelected,
                                    ]}
                                  >
                                    {service.name ||
                                      "Unnamed Service"}
                                  </Text>

                                  <Text
                                    style={
                                      styles.serviceMeta
                                    }
                                  >
                                    {service.duration
                                      ? `${service.duration} min`
                                      : "Duration not set"}
                                    {service.price !==
                                      undefined &&
                                    service.price !==
                                      null
                                      ? ` · ₹${service.price}`
                                      : ""}
                                  </Text>
                                </View>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    <Text style={styles.helperText}>
                      Select one or more services this
                      staff member can perform.
                    </Text>
                  </View>

                  <View style={styles.fieldBlock}>
                    <FieldLabel>
                      Phone
                    </FieldLabel>

                    <TextInput
                      value={form.phone}
                      onChangeText={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          phone: value,
                        }))
                      }
                      placeholder="+91 XXXXX XXXXX"
                      placeholderTextColor="#94a3b8"
                      keyboardType="phone-pad"
                      style={styles.textInput}
                    />
                  </View>

                  <View style={styles.fieldBlock}>
                    <FieldLabel>
                      Profile Image
                    </FieldLabel>

                    <Pressable
                      onPress={pickProfileImage}
                      style={({ pressed }) => [
                        styles.imagePickerButton,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View
                        style={
                          styles.imagePickerIcon
                        }
                      >
                        {icon(
                          "image-plus",
                          21,
                          "#6d28d9"
                        )}
                      </View>

                      <View
                        style={styles.flexOne}
                      >
                        <Text
                          style={
                            styles.imagePickerTitle
                          }
                        >
                          {form.profileImage
                            ? "Change profile image"
                            : "Choose profile image"}
                        </Text>

                        <Text
                          style={
                            styles.imagePickerSubtitle
                          }
                        >
                          JPG, JPEG, PNG, WEBP · Maximum
                          5 MB
                        </Text>
                      </View>

                      {icon(
                        "chevron-right",
                        20,
                        "#94a3b8"
                      )}
                    </Pressable>

                    {!!form.profileImagePreview && (
                      <View
                        style={
                          styles.imagePreviewBox
                        }
                      >
                        <Image
                          source={{
                            uri: form.profileImagePreview,
                          }}
                          style={styles.previewImage}
                        />

                        <View
                          style={styles.flexOne}
                        >
                          <Text
                            style={
                              styles.previewTitle
                            }
                            numberOfLines={3}
                          >
                            {form.profileImage?.name ||
                              "Current profile image"}
                          </Text>

                          {form.profileImage ? (
                            <Pressable
                              onPress={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  profileImage: null,
                                  profileImagePreview:
                                    editingStaff
                                      ? getImageUri(
                                          editingStaff.profileImage
                                        )
                                      : "",
                                }))
                              }
                            >
                              <Text
                                style={
                                  styles.removeImageText
                                }
                              >
                                Remove new image
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.formSection}>
                  <SectionHeader
                    iconName="clock-time-four-outline"
                    title="Working Hours"
                    subtitle="Configure the staff's weekly availability."
                    tone="emerald"
                  />

                  <View
                    style={styles.workingHoursList}
                  >
                    {form.workingHours.map(
                      (item, index) => (
                        <View
                          key={item.day}
                          style={
                            styles.workingDayCard
                          }
                        >
                          <View
                            style={styles.dayHeader}
                          >
                            <Pressable
                              onPress={() =>
                                updateWorkingHour(
                                  index,
                                  "isWorking",
                                  !item.isWorking
                                )
                              }
                              style={
                                styles.dayToggleRow
                              }
                              hitSlop={8}
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  item.isWorking &&
                                    styles.checkboxSelected,
                                ]}
                              >
                                {item.isWorking
                                  ? icon(
                                      "check",
                                      13,
                                      "#ffffff"
                                    )
                                  : null}
                              </View>

                              <Text
                                style={styles.dayName}
                              >
                                {formatDay(item.day)}
                              </Text>
                            </Pressable>

                            <View
                              style={[
                                styles.dayStatus,
                                item.isWorking
                                  ? styles.dayStatusOpen
                                  : styles.dayStatusClosed,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dayStatusText,
                                  {
                                    color:
                                      item.isWorking
                                        ? "#047857"
                                        : "#64748b",
                                  },
                                ]}
                              >
                                {item.isWorking
                                  ? "Working"
                                  : "Off"}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={styles.timeRow}
                          >
                            <View
                              style={
                                styles.timeColumn
                              }
                            >
                              <Text
                                style={
                                  styles.timeLabel
                                }
                              >
                                Start time
                              </Text>

                              <TimeSelector
                                value={
                                  item.startTime
                                }
                                disabled={
                                  !item.isWorking
                                }
                                onChange={(value) =>
                                  updateWorkingHour(
                                    index,
                                    "startTime",
                                    value
                                  )
                                }
                              />
                            </View>

                            <View
                              style={
                                styles.timeColumn
                              }
                            >
                              <Text
                                style={
                                  styles.timeLabel
                                }
                              >
                                End time
                              </Text>

                              <TimeSelector
                                value={
                                  item.endTime
                                }
                                disabled={
                                  !item.isWorking
                                }
                                onChange={(value) =>
                                  updateWorkingHour(
                                    index,
                                    "endTime",
                                    value
                                  )
                                }
                              />
                            </View>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.formFooter}>
              <OutlineButton
                iconName="close"
                onPress={onClose}
                style={styles.footerButton}
              >
                Cancel
              </OutlineButton>

              <PrimaryButton
                iconName={
                  saving
                    ? "loading"
                    : editingStaff
                      ? "pencil-outline"
                      : "plus"
                }
                onPress={onSubmit}
                disabled={saving}
                style={styles.footerButton}
              >
                {saving
                  ? "Saving..."
                  : editingStaff
                    ? "Update Staff"
                    : "Create Staff"}
              </PrimaryButton>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const DetailsModal = ({
  visible,
  staff,
  onClose,
  width,
}) => {
  if (!staff) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackdrop}>
        <View
          style={[
            styles.detailsModalCard,
            width >= 768 &&
              styles.detailsModalTablet,
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              {staff.profileImage ? (
                <Image
                  source={{
                    uri: getImageUri(
                      staff.profileImage
                    ),
                  }}
                  style={styles.detailsAvatar}
                  onError={(event) =>
                    console.warn("Staff detail image failed:", event?.nativeEvent?.error)
                  }
                />
              ) : (
                <View
                  style={
                    styles.detailsAvatarFallback
                  }
                >
                  <Text
                    style={styles.avatarInitials}
                  >
                    {getInitials(staff.name)}
                  </Text>
                </View>
              )}

              <View style={styles.flexOne}>
                <Text
                  style={styles.modalTitle}
                  numberOfLines={2}
                >
                  {staff.name || "Unnamed Staff"}
                </Text>

                <Text
                  style={styles.modalSubtitle}
                  numberOfLines={2}
                >
                  {staff.salon?.name ||
                    "Unknown Salon"}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.iconButton}
              onPress={onClose}
            >
              {icon("close", 21, "#475569")}
            </Pressable>
          </View>

          <ScrollView
            style={styles.detailsScroll}
            contentContainerStyle={
              styles.detailsScrollContent
            }
            showsVerticalScrollIndicator
          >
            <View
              style={[
                styles.detailsGrid,
                width >= 900 &&
                  styles.detailsGridWide,
              ]}
            >
              <View style={styles.detailsSection}>
                <SectionHeader
                  iconName="clock-time-four-outline"
                  title="Working Hours"
                  subtitle="Weekly staff availability"
                  tone="emerald"
                />

                <View style={styles.detailRows}>
                  {DAYS.map((day) => {
                    const hour =
                      getWorkingHourForDay(
                        staff.workingHours,
                        day
                      );

                    const isWorking =
                      !!hour?.isWorking;

                    return (
                      <View
                        key={day}
                        style={
                          styles.detailDayRow
                        }
                      >
                        <View
                          style={
                            styles.detailDayName
                          }
                        >
                          <View
                            style={[
                              styles.detailDot,
                              {
                                backgroundColor:
                                  isWorking
                                    ? "#10b981"
                                    : "#cbd5e1",
                              },
                            ]}
                          />

                          <Text
                            style={
                              styles.detailDayText
                            }
                          >
                            {formatDay(day)}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.detailTime,
                            {
                              color: isWorking
                                ? "#047857"
                                : "#94a3b8",
                            },
                          ]}
                        >
                          {isWorking
                            ? `${
                                hour?.startTime ||
                                "--:--"
                              } – ${
                                hour?.endTime ||
                                "--:--"
                              }`
                            : "Not Working"}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.detailsSection}>
                <SectionHeader
                  iconName="calendar-alert"
                  title="Staff Leaves"
                  subtitle="Scheduled leave periods"
                  tone="amber"
                />

                {!staff.leaves?.length ? (
                  <View style={styles.noLeavesBox}>
                    <View
                      style={
                        styles.noLeavesIcon
                      }
                    >
                      {icon(
                        "calendar-check-outline",
                        23,
                        "#94a3b8"
                      )}
                    </View>

                    <Text
                      style={
                        styles.noLeavesTitle
                      }
                    >
                      No leaves recorded
                    </Text>

                    <Text
                      style={styles.noLeavesText}
                    >
                      There are currently no staff leave
                      periods available for this staff
                      member.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.leaveList}>
                    {staff.leaves.map(
                      (leave, index) => (
                        <View
                          key={`${staff._id}-leave-${index}`}
                          style={styles.leaveCard}
                        >
                          <View
                            style={styles.leaveIcon}
                          >
                            {icon(
                              "calendar-alert",
                              17,
                              "#e11d48"
                            )}
                          </View>

                          <View
                            style={styles.flexOne}
                          >
                            <View
                              style={
                                styles.leaveTopRow
                              }
                            >
                              <Text
                                style={
                                  styles.leaveTitle
                                }
                              >
                                Leave {index + 1}
                              </Text>

                              <View
                                style={
                                  styles.leaveBadge
                                }
                              >
                                <Text
                                  style={
                                    styles.leaveBadgeText
                                  }
                                >
                                  LEAVE
                                </Text>
                              </View>
                            </View>

                            <Text
                              style={
                                styles.leaveDates
                              }
                            >
                              {formatDate(
                                leave.startDate
                              )}{" "}
                              →{" "}
                              {formatDate(
                                leave.endDate
                              )}
                            </Text>

                            {!!leave.reason && (
                              <Text
                                style={
                                  styles.leaveReason
                                }
                              >
                                {leave.reason}
                              </Text>
                            )}
                          </View>
                        </View>
                      )
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const DeleteModal = ({
  visible,
  staff,
  onClose,
  onConfirm,
  deleting,
}) => {
  if (!staff) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalBackdrop}>
        <View style={styles.deleteModalCard}>
          <View style={styles.deleteIcon}>
            {icon(
              "alert-outline",
              29,
              "#e11d48"
            )}
          </View>

          <Text style={styles.deleteTitle}>
            Delete Staff?
          </Text>

          <Text style={styles.deleteText}>
            Are you sure you want to delete{" "}
            <Text style={styles.deleteName}>
              {staff.name ||
                "this staff member"}
            </Text>
            ?
            {"\n"}
            This action cannot be undone.
          </Text>

          <View style={styles.deleteActions}>
            <OutlineButton
              onPress={onClose}
              iconName="close"
              style={styles.deleteActionButton}
            >
              Cancel
            </OutlineButton>

            <Pressable
              disabled={deleting}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.deleteConfirmButton,
                pressed &&
                  !deleting &&
                  styles.pressed,
                deleting &&
                  styles.disabledButton,
              ]}
            >
              {deleting ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                icon(
                  "trash-can-outline",
                  17,
                  "#ffffff"
                )
              )}

              <Text
                style={styles.deleteConfirmText}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Staff"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const StaffManagement = () => {
  const { width } = useWindowDimensions();

  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] =
    useState(false);
  const [serviceLoading, setServiceLoading] =
    useState(false);
  const [salonLoading, setSalonLoading] =
    useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showFormModal, setShowFormModal] =
    useState(false);
  const [showDetailsModal, setShowDetailsModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editingStaff, setEditingStaff] =
    useState(null);
  const [selectedStaff, setSelectedStaff] =
    useState(null);

  const [form, setForm] = useState(
    createInitialForm()
  );

  const isTablet =
    width >= 768 && width < 1200;

  const isDesktop = width >= 1200;

  const loadStaff = useCallback(
    async (silent = false) => {
      try {
        if (!silent) {
          setLoading(true);
        }

        const data = await getAllStaff();

        setStaff(
          Array.isArray(data?.staff)
            ? data.staff
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load staff:",
          error
        );

        Alert.alert(
          "Unable to load staff",
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load staff."
        );
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  const loadSalons = useCallback(async () => {
    try {
      setSalonLoading(true);

      const token = await getToken();

      const salonPaths = [
        SALONS_API_PATH,
        "/api/salons",
        "/api/admin/salons",
        "/api/salon",
        "/api/admin/salon",
      ];

      const data = await apiFetchJsonWithFallback(
        salonPaths,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        },
        "Load salons"
      );

      const salonList =
        data?.salons || data?.data || data?.results || data || [];

      setSalons(
        Array.isArray(salonList)
          ? salonList
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load salons:",
        error
      );

      setSalons([]);

      Alert.alert(
        "Unable to load salons",
        error?.message ||
          "Failed to load salons."
      );
    } finally {
      setSalonLoading(false);
    }
  }, []);

  const loadServices = useCallback(
    async (salonId) => {
      if (!salonId) {
        setServices([]);
        return;
      }

      try {
        setServiceLoading(true);

        const token = await getToken();

        const serviceId = encodeURIComponent(salonId);
        const servicePaths = [
          `${SERVICES_API_PREFIX}/${serviceId}`,
          `/api/services/salon/${serviceId}`,
          `/api/admin/services/salon/${serviceId}`,
          `/api/services/${serviceId}`,
        ];

        const data = await apiFetchJsonWithFallback(
          servicePaths,
          {
            headers: token
              ? { Authorization: `Bearer ${token}` }
              : {},
          },
          "Load services"
        );

        const list =
          data?.services ||
          data?.data ||
          data ||
          [];

        setServices(
          safeArray(list).filter(
            (service) =>
              service?.isActive !== false
          )
        );
      } catch (error) {
        console.error(
          "Failed to load services:",
          error
        );

        setServices([]);

        Alert.alert(
          "Unable to load services",
          error?.message ||
            "Failed to load services."
        );
      } finally {
        setServiceLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadStaff();
    loadSalons();
  }, [loadStaff, loadSalons]);

  const filteredStaff = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return staff.filter((item) => {
      const salonName =
        item.salon?.name?.toLowerCase() ||
        "";

      const name =
        item.name?.toLowerCase() || "";

      const specialization =
        getSpecializationSearchText(
          item.specialization
        );

      const phone =
        item.phone?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        name.includes(searchValue) ||
        salonName.includes(searchValue) ||
        specialization.includes(
          searchValue
        ) ||
        phone.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          !!item.isActive) ||
        (statusFilter === "INACTIVE" &&
          !item.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    staff,
    search,
    statusFilter,
  ]);

  const totalStaff = staff.length;

  const activeStaff = staff.filter(
    (item) => item.isActive
  ).length;

  const inactiveStaff =
    staff.filter(
      (item) => !item.isActive
    ).length;

  const openCreateModal = () => {
    setEditingStaff(null);
    setServices([]);
    setForm(createInitialForm());
    setShowFormModal(true);
  };

  const openEditModal = async (item) => {
    setEditingStaff(item);

    const salonId = getId(item.salon);

    const nextForm = {
      salon: salonId || "",
      name: item.name || "",
      specialization:
        Array.isArray(item.specialization)
          ? item.specialization.join(
              ", "
            )
          : item.specialization || "",
      services: safeArray(
        item.services
      )
        .map(getId)
        .filter(Boolean),
      phone: item.phone || "",
      profileImage: null,
      profileImagePreview:
        getImageUri(
          item.profileImage
        ),
      workingHours:
        normalizeWorkingHours(
          item.workingHours
        ),
    };

    setForm(nextForm);
    setShowFormModal(true);

    if (salonId) {
      await loadServices(salonId);
    } else {
      setServices([]);
    }
  };

  const openDetailsModal = (item) => {
    setSelectedStaff(item);
    setShowDetailsModal(true);
  };

  const confirmDelete = (item) => {
    setSelectedStaff(item);
    setShowDeleteModal(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      Alert.alert(
        "Missing staff name",
        "Please enter the staff name."
      );
      return false;
    }

    if (
      !editingStaff &&
      !form.salon
    ) {
      Alert.alert(
        "Salon required",
        "Please select a salon."
      );
      return false;
    }

    for (const item of form.workingHours) {
      if (!item.isWorking) {
        continue;
      }

      if (
        !item.startTime ||
        !item.endTime
      ) {
        Alert.alert(
          "Working hours incomplete",
          `Please select both start and end time for ${formatDay(
            item.day
          )}.`
        );
        return false;
      }

      if (
        item.startTime >= item.endTime
      ) {
        Alert.alert(
          "Invalid working hours",
          `${formatDay(
            item.day
          )} end time must be later than start time.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name.trim()
      );

      formData.append(
        "specialization",
        form.specialization || ""
      );

      formData.append(
        "services",
        JSON.stringify(
          form.services || []
        )
      );

      formData.append(
        "phone",
        form.phone || ""
      );

      formData.append(
        "workingHours",
        JSON.stringify(
          form.workingHours || []
        )
      );

      if (!editingStaff) {
        formData.append(
          "salon",
          form.salon
        );
      }

      if (form.profileImage?.uri) {
        if (Platform.OS === "web") {
          let browserFile = form.profileImage.file || null;

          if (!browserFile) {
            const blobResponse = await fetch(form.profileImage.uri);
            const blob = await blobResponse.blob();
            browserFile = new File(
              [blob],
              form.profileImage.name || `staff-${Date.now()}.jpg`,
              { type: form.profileImage.type || blob.type || "image/jpeg" }
            );
          }

          formData.append("profileImage", browserFile);
        } else {
          formData.append("profileImage", {
            uri: form.profileImage.uri,
            name: form.profileImage.name || `staff-${Date.now()}.jpg`,
            type: form.profileImage.type || "image/jpeg",
          });
        }
      }

      if (editingStaff) {
        await updateStaff(
          editingStaff._id,
          formData
        );
      } else {
        await createStaff(
          formData
        );
      }

      setShowFormModal(false);
      setEditingStaff(null);
      setForm(createInitialForm());
      setServices([]);

      await loadStaff(true);

      Alert.alert(
        "Success",
        editingStaff
          ? "Staff updated successfully."
          : "Staff created successfully."
      );
    } catch (error) {
      console.error(
        "Staff save error:",
        error
      );

      Alert.alert(
        "Operation failed",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save staff."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStaff) {
      return;
    }

    try {
      setDeleting(true);

      await deleteStaff(
        selectedStaff._id
      );

      setShowDeleteModal(false);
      setSelectedStaff(null);

      await loadStaff(true);

      Alert.alert(
        "Deleted",
        "Staff deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete staff error:",
        error
      );

      Alert.alert(
        "Delete failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete staff."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (
    item
  ) => {
    try {
      if (item.isActive) {
        await deactivateStaff(
          item._id
        );
      } else {
        await activateStaff(
          item._id
        );
      }

      await loadStaff(true);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      Alert.alert(
        "Status update failed",
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update status."
      );
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        loadStaff(true),
        loadSalons(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={[
            styles.pageContent,
            isDesktop &&
              styles.pageContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#7c3aed"
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View
              style={[
                styles.heroContent,
                width >= 900 &&
                  styles.heroContentDesktop,
              ]}
            >
              <View style={styles.heroIdentity}>
                <View style={styles.heroIcon}>
                  {icon(
                    "account-group-outline",
                    25,
                    "#ffffff"
                  )}
                </View>

                <View style={styles.flexOne}>
                  <Text style={styles.eyebrow}>
                    ADMINISTRATION
                  </Text>

                  <Text style={styles.heroTitle}>
                    Staff Management
                  </Text>

                  <Text style={styles.heroSubtitle}>
                    Manage salon staff, working
                    schedules, availability and
                    account status from one place.
                  </Text>
                </View>
              </View>

              <PrimaryButton
                iconName="plus"
                onPress={openCreateModal}
                style={[
                  styles.addStaffButton,
                  width >= 900 &&
                    styles.addStaffButtonDesktop,
                ]}
              >
                Add Staff
              </PrimaryButton>
            </View>
          </View>

          <View
            style={[
              styles.statsGrid,
              width >= 700 &&
                styles.statsGridRow,
            ]}
          >
            <StatCard
              label="Total Staff"
              value={totalStaff}
              iconName="account-group-outline"
              tone="violet"
            />

            <StatCard
              label="Active Staff"
              value={activeStaff}
              iconName="account-check-outline"
              tone="emerald"
            />

            <StatCard
              label="Inactive Staff"
              value={inactiveStaff}
              iconName="account-off-outline"
              tone="rose"
            />
          </View>

          <View
            style={[
              styles.filterCard,
              width >= 900 &&
                styles.filterCardRow,
            ]}
          >
            <View
              style={[
                styles.searchWrap,
                width >= 900 &&
                  styles.flexOne,
              ]}
            >
              {icon(
                "magnify",
                21,
                "#94a3b8"
              )}

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search staff, salon, specialization or phone..."
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />

              {!!search && (
                <Pressable
                  onPress={() => setSearch("")}
                  style={styles.clearSearch}
                >
                  {icon(
                    "close-circle",
                    19,
                    "#94a3b8"
                  )}
                </Pressable>
              )}
            </View>

            <View
              style={[
                styles.filterStatusWrap,
                width >= 900 &&
                  styles.filterStatusDesktop,
              ]}
            >
              <FullLineSelector
                label="Status"
                value={statusFilter}
                placeholder="All Status"
                options={STATUS_OPTIONS}
                onChange={setStatusFilter}
              />
            </View>
          </View>

          <View style={styles.directoryCard}>
            <View style={styles.directoryHeader}>
              <View style={styles.flexOne}>
                <Text
                  style={styles.directoryTitle}
                >
                  Staff Directory
                </Text>

                <Text
                  style={
                    styles.directorySubtitle
                  }
                >
                  {filteredStaff.length}{" "}
                  {filteredStaff.length === 1
                    ? "staff"
                    : "staff members"}{" "}
                  found
                </Text>
              </View>

              {search ||
              statusFilter !== "ALL" ? (
                <Pressable
                  onPress={() => {
                    setSearch("");
                    setStatusFilter(
                      "ALL"
                    );
                  }}
                  style={
                    styles.resetFilterButton
                  }
                >
                  {icon(
                    "filter-remove-outline",
                    16,
                    "#6d28d9"
                  )}

                  <Text
                    style={
                      styles.resetFilterText
                    }
                  >
                    Reset
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <View
                  style={styles.loadingIcon}
                >
                  {icon(
                    "account-group-outline",
                    25,
                    "#7c3aed"
                  )}
                </View>

                <ActivityIndicator
                  size="small"
                  color="#7c3aed"
                />

                <Text
                  style={styles.loadingTitle}
                >
                  Loading staff...
                </Text>

                <Text
                  style={styles.loadingText}
                >
                  Fetching the latest staff
                  directory.
                </Text>
              </View>
            ) : filteredStaff.length ===
              0 ? (
              <View
                style={
                  styles.emptyDirectory
                }
              >
                <View
                  style={
                    styles.emptyDirectoryIcon
                  }
                >
                  {icon(
                    "account-search-outline",
                    34,
                    "#94a3b8"
                  )}
                </View>

                <Text
                  style={
                    styles.emptyDirectoryTitle
                  }
                >
                  No staff found
                </Text>

                <Text
                  style={
                    styles.emptyDirectoryText
                  }
                >
                  Try changing your search or
                  add a new staff member.
                </Text>

                <PrimaryButton
                  iconName="plus"
                  onPress={
                    openCreateModal
                  }
                  style={
                    styles.emptyAddButton
                  }
                >
                  Add Staff
                </PrimaryButton>
              </View>
            ) : (
              <View
                style={[
                  styles.staffGrid,
                  width >= 700 &&
                    styles.staffGridTwo,
                  width >= 1200 &&
                    styles.staffGridThree,
                ]}
              >
                {filteredStaff.map(
                  (item) => (
                    <StaffCard
                      key={item._id}
                      item={item}
                      compact={isTablet}
                      style={{
                        width:
                          width >= 1200
                            ? "31.8%"
                            : width >= 700
                              ? "48.3%"
                              : "100%",
                        marginBottom:
                          width >= 700
                            ? 12
                            : 10,
                      }}
                      onDetails={() =>
                        openDetailsModal(
                          item
                        )
                      }
                      onEdit={() =>
                        openEditModal(
                          item
                        )
                      }
                      onStatus={() =>
                        handleStatusChange(
                          item
                        )
                      }
                      onDelete={() =>
                        confirmDelete(
                          item
                        )
                      }
                    />
                  )
                )}
              </View>
            )}
          </View>
        </ScrollView>

        <StaffFormModal
          visible={showFormModal}
          editingStaff={editingStaff}
          form={form}
          setForm={setForm}
          salons={salons}
          salonLoading={salonLoading}
          services={services}
          serviceLoading={serviceLoading}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setShowFormModal(
                false
              );
              setEditingStaff(null);
            }
          }}
          onSubmit={handleSubmit}
          loadServices={loadServices}
          width={width}
        />

        <DetailsModal
          visible={showDetailsModal}
          staff={selectedStaff}
          onClose={() => {
            setShowDetailsModal(
              false
            );
            setSelectedStaff(null);
          }}
          width={width}
        />

        <DeleteModal
          visible={showDeleteModal}
          staff={selectedStaff}
          deleting={deleting}
          onClose={() => {
            if (!deleting) {
              setShowDeleteModal(
                false
              );
              setSelectedStaff(
                null
              );
            }
          }}
          onConfirm={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
};

const shadow = Platform.select({
  ios: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },
  android: {
    elevation: 5,
  },
  web: {
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {
      width: 0,
      height: 12,
    },
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  page: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#f5f7fb",
  },
  pageScroll: {
    flex: 1,
  },
  pageContent: {
    width: "100%",
    maxWidth: 1500,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 28,
  },
  pageContentDesktop: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    ...shadow,
    marginBottom: 12,
  },
  heroGlowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -85,
    top: -115,
    backgroundColor:
      "rgba(124,58,237,0.08)",
  },
  heroGlowTwo: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    left: -90,
    bottom: -125,
    backgroundColor:
      "rgba(99,102,241,0.05)",
  },
  heroContent: {
    padding: 18,
    gap: 16,
  },
  heroContentDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroIdentity: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    minWidth: 0,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6d28d9",
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 2,
    color: "#7c3aed",
    marginBottom: 5,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#020617",
  },
  heroSubtitle: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    color: "#64748b",
    maxWidth: 760,
  },
  addStaffButton: {
    width: "100%",
  },
  addStaffButtonDesktop: {
    width: 150,
    flexShrink: 0,
  },

  primaryButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: "#111827",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...shadow,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },
  outlineButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  outlineButtonText: {
    color: "#475569",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
  },
  outlineDanger: {
    borderColor: "#fecdd3",
    backgroundColor: "#fffafa",
  },
  outlineDangerText: {
    color: "#e11d48",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  disabledButton: {
    opacity: 0.55,
  },

  statsGrid: {
    width: "100%",
    gap: 10,
    marginBottom: 12,
  },
  statsGridRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  statCard: {
    minWidth: 0,
    minHeight: 100,
    flex: 1,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor:
      "rgba(255,255,255,0.95)",
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow,
  },
  statContent: {
    minWidth: 0,
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.3,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 7,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  filterCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor:
      "rgba(255,255,255,0.95)",
    padding: 13,
    marginBottom: 12,
    ...shadow,
    gap: 10,
  },
  filterCardRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  searchWrap: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
  flex: 1,
  width: '100%',
  minWidth: 0,

  height: 56,

  paddingHorizontal: 0,
  paddingVertical: 0,

  margin: 0,

  fontSize: 15,
  color: '#0F172A',

  outlineStyle: 'none',
},
  clearSearch: {
    padding: 4,
  },
  filterStatusWrap: {
    minWidth: 0,
  },
  filterStatusDesktop: {
    width: 240,
  },

  fieldBlock: {
    minWidth: 0,
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 0.7,
    color: "#475569",
    textTransform: "uppercase",
  },
  required: {
    fontSize: 12,
    fontWeight: "900",
    color: "#e11d48",
  },
  textInput: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical:
      Platform.OS === "ios" ? 12 : 9,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600",
    color: "#1e293b",
  },
  helperText: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    color: "#94a3b8",
  },

  selector: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  selectorPressed: {
    borderColor: "#a78bfa",
    backgroundColor: "#faf9ff",
  },
  selectorDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  selectorText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#334155",
  },
  placeholderText: {
    color: "#94a3b8",
    fontWeight: "600",
  },

  directoryCard: {
    minWidth: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ffffff",
    backgroundColor:
      "rgba(255,255,255,0.96)",
    overflow: "hidden",
    ...shadow,
  },
  directoryHeader: {
    minWidth: 0,
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  directoryTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#020617",
  },
  directorySubtitle: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  resetFilterButton: {
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 11,
    backgroundColor: "#f5f3ff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#6d28d9",
  },

  staffGrid: {
    width: "100%",
    padding: 10,
    gap: 10,
    flexDirection: "column",
  },
  staffGridTwo: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  staffGridThree: {
    justifyContent: "space-between",
  },

  staffCard: {
    minWidth: 0,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
    ...shadow,
  },
  staffCardCompact: {
    borderRadius: 20,
  },
  staffCardTop: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
  },
  avatarLargeFallback: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    color: "#ffffff",
  },
  staffIdentity: {
    flex: 1,
    minWidth: 0,
  },
  staffNameRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  staffName: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    color: "#0f172a",
  },
  staffId: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  statusInactive: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  skillPill: {
    marginTop: 12,
    minWidth: 0,
    borderRadius: 13,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  skillText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    color: "#64748b",
  },

  infoGrid: {
    marginTop: 10,
    gap: 8,
    flexDirection: "row",
  },
  infoBox: {
    flex: 1,
    minWidth: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
    padding: 10,
  },
  infoIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  infoLabel: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  infoValue: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "800",
    color: "#334155",
  },
  infoSubValue: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },

  cardActions: {
    marginTop: 10,
    gap: 7,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 9,
    flexGrow: 1,
    flexBasis: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },
  actionText: {
    flexShrink: 1,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
  },
  actionViolet: {
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
  },
  actionIndigo: {
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
  },
  actionAmber: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  actionEmerald: {
    borderColor: "#a7f3d0",
    backgroundColor: "#ecfdf5",
  },
  actionRose: {
    borderColor: "#fecdd3",
    backgroundColor: "#fff1f2",
  },

  loadingBox: {
    minHeight: 290,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loadingTitle: {
    marginTop: 11,
    fontSize: 14,
    fontWeight: "900",
    color: "#334155",
  },
  loadingText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#94a3b8",
  },
  emptyDirectory: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  emptyDirectoryIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  emptyDirectoryTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: "#0f172a",
  },
  emptyDirectoryText: {
    marginTop: 6,
    maxWidth: 400,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptyAddButton: {
    width: 150,
    marginTop: 18,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor:
      "rgba(2,6,23,0.70)",
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  modalKeyboard: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formModalCard: {
    width: "100%",
    maxWidth: 680,
    height: "96%",
    borderRadius: 22,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...shadow,
  },
  formModalTablet: {
    maxWidth: 1120,
    height: "94%",
    borderRadius: 28,
  },
  detailsModalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "94%",
    borderRadius: 22,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...shadow,
  },
  detailsModalTablet: {
    maxWidth: 1050,
    borderRadius: 28,
  },
  selectorModalCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "82%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...shadow,
  },
  timeModalCard: {
    width: "100%",
    maxWidth: 500,
    height: "82%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    ...shadow,
  },
  deleteModalCard: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 25,
    backgroundColor: "#ffffff",
    padding: 23,
    alignItems: "center",
    ...shadow,
  },

  modalHeader: {
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalHeaderLeft: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  modalHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f3e8ff",
    alignItems: "center",
    justifyContent: "center",
  },
  flexOne: {
    flex: 1,
    minWidth: 0,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: "#020617",
  },
  modalSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: "#94a3b8",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  formScroll: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  formScrollContent: {
    padding: 10,
    paddingBottom: 18,
  },
  formColumns: {
    gap: 10,
  },
  formColumnsWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  formSection: {
    minWidth: 0,
    flex: 1,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
  },
  sectionHeader: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 17,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  violetIcon: {
    backgroundColor: "#f3e8ff",
    color: "#6d28d9",
  },
  emeraldIcon: {
    backgroundColor: "#d1fae5",
    color: "#059669",
  },
  amberIcon: {
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  sectionHeaderText: {
    minWidth: 0,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: "#020617",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: "#94a3b8",
  },

  serviceLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  selectedCount: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: "#f5f3ff",
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  selectedCountText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    color: "#6d28d9",
  },
  serviceBox: {
    maxHeight: 310,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
  },
  servicesGrid: {
    padding: 8,
    gap: 7,
  },
  servicesGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  serviceItem: {
    minWidth: 0,
    flexGrow: 1,
    flexBasis: "100%",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  serviceItemSelected: {
    borderColor: "#c4b5fd",
    backgroundColor: "#f5f3ff",
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxSelected: {
    borderColor: "#7c3aed",
    backgroundColor: "#7c3aed",
  },
  serviceName: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: "#475569",
  },
  serviceNameSelected: {
    color: "#5b21b6",
  },
  serviceMeta: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  emptyBox: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 22,
    gap: 7,
  },
  emptyBoxText: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    color: "#64748b",
  },
  emptyBoxSubText: {
    textAlign: "center",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: "#94a3b8",
  },

  imagePickerButton: {
    minHeight: 66,
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  imagePickerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  imagePickerTitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: "#334155",
  },
  imagePickerSubtitle: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  imagePreviewBox: {
    marginTop: 10,
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    backgroundColor: "#f8fafc",
    padding: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 17,
    backgroundColor: "#e2e8f0",
    flexShrink: 0,
  },
  previewTitle: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "800",
    color: "#475569",
  },
  removeImageText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    color: "#e11d48",
  },

  workingHoursList: {
    gap: 8,
  },
  workingDayCard: {
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    padding: 11,
  },
  dayHeader: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dayToggleRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: "#334155",
  },
  dayStatus: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  dayStatusOpen: {
    backgroundColor: "#ecfdf5",
  },
  dayStatusClosed: {
    backgroundColor: "#f1f5f9",
  },
  dayStatusText: {
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  timeRow: {
    marginTop: 9,
    flexDirection: "row",
    gap: 8,
  },
  timeColumn: {
    flex: 1,
    minWidth: 0,
  },
  timeLabel: {
    marginBottom: 5,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  timeSelector: {
    minWidth: 0,
    minHeight: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  timeSelectorDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  timeSelectorText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    fontWeight: "800",
    color: "#334155",
  },
  disabledText: {
    color: "#94a3b8",
  },

  formFooter: {
    minHeight: 68,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    gap: 8,
  },
  footerButton: {
    flex: 1,
  },

  selectorList: {
    maxHeight: 520,
  },
  selectorListContent: {
    padding: 10,
    gap: 7,
  },
  selectorOption: {
    minHeight: 54,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectorOptionSelected: {
    borderColor: "#c4b5fd",
    backgroundColor: "#f5f3ff",
  },
  selectorOptionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.992 }],
  },
  selectorOptionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    color: "#334155",
  },
  selectorOptionTextSelected: {
    color: "#5b21b6",
    fontWeight: "900",
  },
  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: "#7c3aed",
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#7c3aed",
  },

  timeList: {
    flex: 1,
  },
  timeListContent: {
    padding: 10,
    gap: 6,
  },
  timeOption: {
    minHeight: 48,
    width: "100%",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeOptionSelected: {
    borderColor: "#c4b5fd",
    backgroundColor: "#f5f3ff",
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#475569",
  },
  timeOptionTextSelected: {
    color: "#6d28d9",
    fontWeight: "900",
  },

  detailsScroll: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  detailsScrollContent: {
    padding: 10,
    paddingBottom: 20,
  },
  detailsGrid: {
    gap: 10,
  },
  detailsGridWide: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  detailsSection: {
    flex: 1,
    minWidth: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 14,
  },
  detailsAvatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#f1f5f9",
  },
  detailsAvatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#312e81",
    alignItems: "center",
    justifyContent: "center",
  },
  detailRows: {
    gap: 7,
  },
  detailDayRow: {
    minWidth: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 11,
    paddingVertical: 11,
    gap: 6,
  },
  detailDayName: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  detailDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  detailDayText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: "#475569",
  },
  detailTime: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },

  noLeavesBox: {
    minHeight: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  noLeavesIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },
  noLeavesTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: "#475569",
  },
  noLeavesText: {
    marginTop: 5,
    maxWidth: 280,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  leaveList: {
    gap: 8,
  },
  leaveCard: {
    minWidth: 0,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  leaveIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  leaveTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  leaveTitle: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: "#334155",
  },
  leaveBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#fff1f2",
  },
  leaveBadgeText: {
    fontSize: 8,
    lineHeight: 10,
    fontWeight: "900",
    color: "#e11d48",
  },
  leaveDates: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: "#475569",
  },
  leaveReason: {
    marginTop: 6,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    color: "#64748b",
  },

  deleteIcon: {
    width: 65,
    height: 65,
    borderRadius: 22,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  deleteTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#020617",
    textAlign: "center",
  },
  deleteText: {
    marginTop: 9,
    maxWidth: 350,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
  },
  deleteName: {
    fontWeight: "900",
    color: "#334155",
  },
  deleteActions: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    gap: 8,
  },
  deleteActionButton: {
    flex: 1,
  },
  deleteConfirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: "#e11d48",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  deleteConfirmText: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
});

export default StaffManagement;
