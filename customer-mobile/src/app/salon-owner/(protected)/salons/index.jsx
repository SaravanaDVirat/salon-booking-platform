import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  createSalon,
  deleteSalon,
  getMySalons,
  updateSalon,
  updateSalonStatus,
} from "../../../../services/salonOwnerService";



const WEB_API_ORIGIN = "http://localhost:1812";
const ANDROID_API_ORIGIN = "http://10.0.2.2:1812";

const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android" ? ANDROID_API_ORIGIN : WEB_API_ORIGIN);

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const initialWorkingHours = {
  monday: "09:00 - 18:00",
  tuesday: "09:00 - 18:00",
  wednesday: "09:00 - 18:00",
  thursday: "09:00 - 18:00",
  friday: "09:00 - 18:00",
  saturday: "09:00 - 18:00",
  sunday: "Closed",
};

const createInitialForm = () => ({
  name: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  location: "",
  images: [],
  imagePreviews: [],
  existingImages: [],
  workingHours: { ...initialWorkingHours },
});

const getImageUrl = (image) => {
  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    "http://192.168.1.5:1812/api";

  const serverUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}${
    image.startsWith("/") ? image : `/${image}`
  }`;
};

const formatDay = (day) =>
  day.charAt(0).toUpperCase() + day.slice(1);

const workingHoursToArray = (workingHours = {}) => {
  return Object.entries(workingHours).map(([day, value]) => {
    if (value === "Closed") {
      return {
        day: day.toUpperCase(),
        openTime: "",
        closeTime: "",
        isOpen: false,
      };
    }

    const [openTime = "", closeTime = ""] = String(value)
      .split("-")
      .map((time) => time.trim());

    return {
      day: day.toUpperCase(),
      openTime,
      closeTime,
      isOpen: true,
    };
  });
};

const workingHoursToForm = (workingHours = []) => {
  const result = { ...initialWorkingHours };

  if (!Array.isArray(workingHours)) {
    return result;
  }

  workingHours.forEach((item) => {
    if (!item?.day) return;

    const day = item.day.toLowerCase();

    if (item.isOpen === false) {
      result[day] = "Closed";
      return;
    }

    result[day] = `${item.openTime || ""} - ${
      item.closeTime || ""
    }`.trim();
  });

  return result;
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.message ||
  fallback;

const normalizePickedImage = (asset, index) => {
  const uri = asset?.uri;
  if (!uri) return null;

  const extension =
    uri.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";

  const mime =
    asset?.mimeType ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
      ? "image/webp"
      : "image/jpeg");

  return {
    uri,
    name: asset?.fileName || `salon-image-${Date.now()}-${index}.${extension}`,
    type: mime,
    size: asset?.fileSize || 0,
  };
};

const IconButton = ({
  icon,
  onPress,
  disabled = false,
  variant = "neutral",
  size = 42,
  label,
}) => {
  const variants = {
    neutral: {
      bg: "#F1F5F9",
      border: "#E2E8F0",
      color: "#475569",
    },
    blue: {
      bg: "#EFF6FF",
      border: "#BFDBFE",
      color: "#2563EB",
    },
    green: {
      bg: "#ECFDF5",
      border: "#A7F3D0",
      color: "#059669",
    },
    orange: {
      bg: "#FFF7ED",
      border: "#FED7AA",
      color: "#EA580C",
    },
    red: {
      bg: "#FEF2F2",
      border: "#FECACA",
      color: "#DC2626",
    },
  };

  const theme = variants[variant] || variants.neutral;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon(theme.color)}
    </Pressable>
  );
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
  tone = "pink",
}) => {
  const tones = {
    pink: {
      bg: "#FCE7F3",
      color: "#DB2777",
    },
    purple: {
      bg: "#F3E8FF",
      color: "#9333EA",
    },
    blue: {
      bg: "#DBEAFE",
      color: "#2563EB",
    },
  };

  const t = tones[tone] || tones.pink;

  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionIcon,
          { backgroundColor: t.bg },
        ]}
      >
        {icon(t.color)}
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  multiline = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = false,
  secureTextEntry = false,
  maxLength,
  icon,
}) => {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>
          {label}
          {required ? (
            <Text style={styles.required}> *</Text>
          ) : null}
        </Text>
      </View>

      <View
        style={[
          styles.inputShell,
          multiline && styles.inputShellMultiline,
        ]}
      >
        {icon ? (
          <View
            style={[
              styles.inputIcon,
              multiline && styles.inputIconMultiline,
            ]}
          >
            {icon}
          </View>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          style={[
            styles.textInput,
            icon && styles.textInputWithIcon,
            multiline && styles.textInputMultiline,
          ]}
        />
      </View>
    </View>
  );
};

const WorkingHourField = ({
  day,
  value,
  onChangeText,
}) => {
  const closed = value === "Closed";

  return (
    <View style={styles.hoursCard}>
      <View style={styles.hoursTopRow}>
        <Text style={styles.hoursDay}>{formatDay(day)}</Text>

        <View
          style={[
            styles.hoursStatus,
            closed
              ? styles.hoursStatusClosed
              : styles.hoursStatusOpen,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: closed
                  ? "#EF4444"
                  : "#10B981",
              },
            ]}
          />
          <Text
            style={[
              styles.hoursStatusText,
              {
                color: closed ? "#DC2626" : "#059669",
              },
            ]}
          >
            {closed ? "Closed" : "Open"}
          </Text>
        </View>
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="09:00 - 18:00"
        placeholderTextColor="#94A3B8"
        style={styles.hoursInput}
        autoCapitalize="none"
        autoCorrect={false}
        selectTextOnFocus
      />

      <Text style={styles.hoursHint}>
        Use 24-hour format
      </Text>
    </View>
  );
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  tone = "slate",
}) => {
  const themes = {
    slate: {
      border: "#E2E8F0",
      soft: "#F1F5F9",
      text: "#475569",
      value: "#0F172A",
    },
    green: {
      border: "#A7F3D0",
      soft: "#ECFDF5",
      text: "#059669",
      value: "#059669",
    },
    red: {
      border: "#FECACA",
      soft: "#FEF2F2",
      text: "#DC2626",
      value: "#DC2626",
    },
  };

  const theme = themes[tone] || themes.slate;

  return (
    <View
      style={[
        styles.statCard,
        { borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.statGlow,
          { backgroundColor: theme.soft },
        ]}
      />

      <View style={styles.statContent}>
        <View style={styles.statTextArea}>
          <Text
            style={[
              styles.statTitle,
              { color: theme.text },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.statValue,
              { color: theme.value },
            ]}
          >
            {value}
          </Text>

          <Text style={styles.statSubtitle}>{subtitle}</Text>
        </View>

        <View
          style={[
            styles.statIcon,
            { backgroundColor: theme.soft },
          ]}
        >
          {icon(theme.text)}
        </View>
      </View>
    </View>
  );
};

const SalonImage = ({
  uri,
  style,
  fallback = false,
}) => {
  if (!uri || fallback) {
    return (
      <View style={[style, styles.imageFallback]}>
        <MaterialCommunityIcons
          name="storefront-outline"
          size={24}
          color="#DB2777"
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
    />
  );
};

const SalonCard = ({
  salon,
  onEdit,
  onStatus,
  onDelete,
  statusLoading,
}) => {
  const isActive = Boolean(salon.isActive);
  const firstImage = salon.images?.[0]
    ? getImageUrl(salon.images[0])
    : "";

  return (
    <View style={styles.salonCard}>
      <LinearGradient
        colors={
          isActive
            ? ["#34D399", "#14B8A6"]
            : ["#F87171", "#FB923C"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.cardAccent}
      />

      <View style={styles.cardInner}>
        <View style={styles.cardTopRow}>
          <View style={styles.salonIdentity}>
            <SalonImage
              uri={firstImage}
              fallback={!firstImage}
              style={styles.cardAvatar}
            />

            <View style={styles.salonIdentityText}>
              <Text style={styles.cardSalonName}>
                {salon.name || "Unnamed Salon"}
              </Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color="#DB2777"
                />
                <Text style={styles.locationText}>
                  {salon.city || "Location unavailable"}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              isActive
                ? styles.activeBadge
                : styles.inactiveBadge,
            ]}
          >
            <View
              style={[
                styles.badgeDot,
                {
                  backgroundColor: isActive
                    ? "#10B981"
                    : "#EF4444",
                },
              ]}
            />
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: isActive
                    ? "#059669"
                    : "#DC2626",
                },
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {salon.images?.length > 0 ? (
          <View style={styles.galleryBlock}>
            <View style={styles.galleryHeader}>
              <View style={styles.galleryTitleRow}>
                <Ionicons
                  name="images-outline"
                  size={14}
                  color="#64748B"
                />
                <Text style={styles.galleryTitle}>
                  Gallery
                </Text>
              </View>

              <Text style={styles.galleryCount}>
                {salon.images.length}{" "}
                {salon.images.length === 1
                  ? "image"
                  : "images"}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryList}
            >
              {salon.images
                .slice(0, 5)
                .map((image, index) => (
                  <View
                    key={`${image}-${index}`}
                    style={styles.galleryImageWrap}
                  >
                    <Image
                      source={{
                        uri: getImageUrl(image),
                      }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />

                    {index === 4 &&
                    salon.images.length > 5 ? (
                      <View style={styles.moreOverlay}>
                        <Text style={styles.moreOverlayText}>
                          +{salon.images.length - 5}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
            </ScrollView>
          </View>
        ) : null}

        <Text style={styles.cardDescription}>
          {salon.description ||
            "No description available for this salon."}
        </Text>

        <View style={styles.detailGrid}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>ADDRESS</Text>
            <Text style={styles.detailValue}>
              {salon.address || "Address unavailable"}
            </Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>CONTACT</Text>
            <Text style={styles.detailValue}>
              {salon.phone ||
                salon.email ||
                "No contact information"}
            </Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              styles.cardAction,
              styles.editAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color="#2563EB"
            />
            <Text style={styles.editActionText}>Edit</Text>
          </Pressable>

          <Pressable
            onPress={onStatus}
            disabled={statusLoading}
            style={({ pressed }) => [
              styles.cardAction,
              isActive
                ? styles.offAction
                : styles.onAction,
              pressed && styles.pressed,
              statusLoading && styles.disabled,
            ]}
          >
            {statusLoading ? (
              <ActivityIndicator
                size="small"
                color={isActive ? "#EA580C" : "#059669"}
              />
            ) : (
              <Ionicons
                name={
                  isActive
                    ? "power-outline"
                    : "checkmark-circle-outline"
                }
                size={17}
                color={
                  isActive ? "#EA580C" : "#059669"
                }
              />
            )}

            <Text
              style={[
                styles.actionText,
                {
                  color: isActive
                    ? "#EA580C"
                    : "#059669",
                },
              ]}
            >
              {isActive ? "Off" : "On"}
            </Text>
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [
              styles.cardAction,
              styles.deleteAction,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color="#DC2626"
            />
            <Text style={styles.deleteActionText}>
              Delete
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const DesktopSalonTable = ({
  salons,
  onEdit,
  onStatus,
  onDelete,
  statusLoading,
}) => {
  return (
    <View style={styles.tableCard}>
      <View style={styles.tableHeader}>
        <View>
          <Text style={styles.tableTitle}>All Salons</Text>
          <Text style={styles.tableSubtitle}>
            Manage your salon information and status.
          </Text>
        </View>

        <View style={styles.resultsPill}>
          <Text style={styles.resultsPillText}>
            {salons.length} results
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
      >
        <View style={styles.tableMinWidth}>
          <View style={styles.tableRowHeader}>
            <Text style={[styles.tableHead, styles.colSalon]}>
              SALON
            </Text>
            <Text style={[styles.tableHead, styles.colLocation]}>
              LOCATION
            </Text>
            <Text style={[styles.tableHead, styles.colContact]}>
              CONTACT
            </Text>
            <Text style={[styles.tableHead, styles.colStatus]}>
              STATUS
            </Text>
            <Text
              style={[
                styles.tableHead,
                styles.colActions,
                styles.alignRight,
              ]}
            >
              ACTIONS
            </Text>
          </View>

          {salons.map((salon) => {
            const active = Boolean(salon.isActive);
            const firstImage = salon.images?.[0]
              ? getImageUrl(salon.images[0])
              : "";

            return (
              <View
                key={salon._id}
                style={styles.tableRow}
              >
                <View style={[styles.colSalon, styles.salonCell]}>
                  <SalonImage
                    uri={firstImage}
                    fallback={!firstImage}
                    style={styles.tableAvatar}
                  />

                  <View style={styles.tableSalonText}>
                    <Text style={styles.tableSalonName}>
                      {salon.name || "Unnamed Salon"}
                    </Text>
                    <Text style={styles.tableDescription}>
                      {salon.description ||
                        "No description available"}
                    </Text>
                  </View>
                </View>

                <View style={styles.colLocation}>
                  <View style={styles.tableLocationRow}>
                    <Ionicons
                      name="location-outline"
                      size={15}
                      color="#DB2777"
                    />
                    <Text style={styles.tablePrimary}>
                      {salon.city || "—"}
                    </Text>
                  </View>
                  <Text style={styles.tableSecondary}>
                    {salon.address || "No address"}
                  </Text>
                </View>

                <View style={styles.colContact}>
                  <Text style={styles.tablePrimary}>
                    {salon.phone || "—"}
                  </Text>
                  <Text style={styles.tableSecondary}>
                    {salon.email || "—"}
                  </Text>
                </View>

                <View style={styles.colStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      active
                        ? styles.activeBadge
                        : styles.inactiveBadge,
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeDot,
                        {
                          backgroundColor: active
                            ? "#10B981"
                            : "#EF4444",
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: active
                            ? "#059669"
                            : "#DC2626",
                        },
                      ]}
                    >
                      {active ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.colActions,
                    styles.tableActions,
                  ]}
                >
                  <IconButton
                    label="Edit salon"
                    variant="blue"
                    icon={(color) => (
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={color}
                      />
                    )}
                    onPress={() => onEdit(salon)}
                  />

                  <IconButton
                    label={
                      active
                        ? "Deactivate salon"
                        : "Activate salon"
                    }
                    variant={active ? "orange" : "green"}
                    disabled={statusLoading === salon._id}
                    icon={(color) =>
                      statusLoading === salon._id ? (
                        <ActivityIndicator
                          size="small"
                          color={color}
                        />
                      ) : (
                        <Ionicons
                          name={
                            active
                              ? "power-outline"
                              : "checkmark-outline"
                          }
                          size={18}
                          color={color}
                        />
                      )
                    }
                    onPress={() => onStatus(salon)}
                  />

                  <IconButton
                    label="Delete salon"
                    variant="red"
                    icon={(color) => (
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={color}
                      />
                    )}
                    onPress={() => onDelete(salon)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const SalonFormModal = ({
  visible,
  editingSalon,
  form,
  setForm,
  error,
  saving,
  onClose,
  onSubmit,
  onPickImages,
  onRemoveNewImage,
}) => {
  const { width, height } = useWindowDimensions();
  const wideForm = width >= 900;

  const updateField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateHour = (day, value) => {
    setForm((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: value,
      },
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={() => {
        if (!saving) onClose();
      }}
    >
      <View style={styles.modalBackdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalKeyboard}
        >
          <View
            style={[
              styles.formModal,
              {
                maxHeight:
                  Platform.OS === "web"
                    ? Math.min(height * 0.94, 900)
                    : height * 0.94,
                width:
                  Platform.OS === "web"
                    ? Math.min(width - 24, 1180)
                    : "94%",
              },
            ]}
          >
            <LinearGradient
              colors={["#FFFFFF", "#FFF7FB", "#FFFFFF"]}
              style={styles.formModalHeader}
            >
              <View style={styles.formHeaderContent}>
                <View style={styles.formTitleArea}>
                  <View style={styles.formEyebrow}>
                    <MaterialCommunityIcons
                      name="storefront-outline"
                      size={13}
                      color="#DB2777"
                    />
                    <Text style={styles.formEyebrowText}>
                      SALON WORKSPACE
                    </Text>
                  </View>

                  <Text style={styles.formTitle}>
                    {editingSalon
                      ? "Edit Salon"
                      : "Create New Salon"}
                  </Text>

                  <Text style={styles.formSubtitle}>
                    Configure your salon profile, location,
                    images and weekly working hours.
                  </Text>
                </View>

                <Pressable
                  onPress={onClose}
                  disabled={saving}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && styles.pressed,
                    saving && styles.disabled,
                  ]}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color="#64748B"
                  />
                </Pressable>
              </View>
            </LinearGradient>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {error ? (
                <View style={styles.formError}>
                  <View style={styles.errorIcon}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#DC2626"
                    />
                  </View>

                  <View style={styles.errorTextArea}>
                    <Text style={styles.errorTitle}>
                      Please check the form
                    </Text>
                    <Text style={styles.errorMessage}>
                      {error}
                    </Text>
                  </View>
                </View>
              ) : null}

              <View
                style={[
                  styles.formGrid,
                  wideForm && styles.formGridWide,
                ]}
              >
                {/* BASIC INFORMATION */}
                <View
                  style={[
                    styles.formSection,
                    wideForm && styles.formHalf,
                  ]}
                >
                  <SectionHeader
                    tone="pink"
                    title="Basic Information"
                    subtitle="Tell customers about your salon."
                    icon={(color) => (
                      <MaterialCommunityIcons
                        name="storefront-outline"
                        size={19}
                        color={color}
                      />
                    )}
                  />

                  <Field
                    label="Salon Name"
                    required
                    value={form.name}
                    onChangeText={(value) =>
                      updateField("name", value)
                    }
                    placeholder="Luxury Beauty Studio"
                    icon={
                      <MaterialCommunityIcons
                        name="store-outline"
                        size={18}
                        color="#94A3B8"
                      />
                    }
                  />

                  <Field
                    label="Description"
                    value={form.description}
                    onChangeText={(value) =>
                      updateField("description", value)
                    }
                    placeholder="Describe your salon, specialties and experience..."
                    multiline
                    maxLength={1000}
                  />

                  <View style={styles.fieldRow}>
                    <View style={styles.fieldFlex}>
                      <Field
                        label="Phone"
                        value={form.phone}
                        onChangeText={(value) =>
                          updateField("phone", value)
                        }
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        maxLength={20}
                        icon={
                          <Ionicons
                            name="call-outline"
                            size={17}
                            color="#94A3B8"
                          />
                        }
                      />
                    </View>

                    <View style={styles.fieldFlex}>
                      <Field
                        label="Email"
                        value={form.email}
                        onChangeText={(value) =>
                          updateField("email", value)
                        }
                        placeholder="salon@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        icon={
                          <Ionicons
                            name="mail-outline"
                            size={17}
                            color="#94A3B8"
                          />
                        }
                      />
                    </View>
                  </View>
                </View>

                {/* LOCATION */}
                <View
                  style={[
                    styles.formSection,
                    wideForm && styles.formHalf,
                  ]}
                >
                  <SectionHeader
                    tone="purple"
                    title="Location Details"
                    subtitle="Help customers find your salon."
                    icon={(color) => (
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={color}
                      />
                    )}
                  />

                  <Field
                    label="Address"
                    required
                    value={form.address}
                    onChangeText={(value) =>
                      updateField("address", value)
                    }
                    placeholder="Full salon address"
                    multiline
                    icon={
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color="#94A3B8"
                      />
                    }
                  />

                  <Field
                    label="City"
                    required
                    value={form.city}
                    onChangeText={(value) =>
                      updateField("city", value)
                    }
                    placeholder="Nagercoil"
                    icon={
                      <Ionicons
                        name="business-outline"
                        size={18}
                        color="#94A3B8"
                      />
                    }
                  />

                  <Field
                    label="Location / Map URL"
                    value={form.location}
                    onChangeText={(value) =>
                      updateField("location", value)
                    }
                    placeholder="Google Maps URL or coordinates"
                    autoCapitalize="none"
                    icon={
                      <Ionicons
                        name="map-outline"
                        size={18}
                        color="#94A3B8"
                      />
                    }
                  />

                  <Text style={styles.helperText}>
                    You can provide a Google Maps URL or
                    supported coordinates.
                  </Text>
                </View>

                {/* IMAGES */}
                <View style={styles.formSectionFull}>
                  <SectionHeader
                    tone="pink"
                    title="Salon Images"
                    subtitle="Upload high-quality images of your salon."
                    icon={(color) => (
                      <Ionicons
                        name="images-outline"
                        size={20}
                        color={color}
                      />
                    )}
                  />

                  <View style={styles.uploadMetaRow}>
                    <Text style={styles.uploadMetaText}>
                      {form.images.length}/10 selected
                    </Text>

                    <Text style={styles.uploadLimit}>
                      Maximum 10 files · 5 MB each
                    </Text>
                  </View>

                  <Pressable
                    onPress={onPickImages}
                    style={({ pressed }) => [
                      styles.uploadBox,
                      pressed && styles.uploadBoxPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={["#FDF2F8", "#F5F3FF"]}
                      style={styles.uploadIcon}
                    >
                      <Ionicons
                        name="cloud-upload-outline"
                        size={27}
                        color="#DB2777"
                      />
                    </LinearGradient>

                    <Text style={styles.uploadTitle}>
                      Upload salon images
                    </Text>

                    <Text style={styles.uploadSubtitle}>
                      Tap here to choose JPG, JPEG, PNG or
                      WEBP images.
                    </Text>

                    <View style={styles.uploadChip}>
                      <Ionicons
                        name="images-outline"
                        size={13}
                        color="#64748B"
                      />
                      <Text style={styles.uploadChipText}>
                        Select up to 10 images
                      </Text>
                    </View>
                  </Pressable>

                  {editingSalon &&
                  form.existingImages.length > 0 ? (
                    <View style={styles.previewBlock}>
                      <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>
                          CURRENT IMAGES
                        </Text>
                        <Text style={styles.previewCount}>
                          {form.existingImages.length} saved
                        </Text>
                      </View>

                      <View style={styles.imageGrid}>
                        {form.existingImages.map(
                          (image, index) => (
                            <View
                              key={`${image}-${index}`}
                              style={styles.previewTile}
                            >
                              <Image
                                source={{
                                  uri: getImageUrl(image),
                                }}
                                style={styles.previewImage}
                                resizeMode="cover"
                              />
                              <View style={styles.previewCaption}>
                                <Text
                                  style={styles.previewCaptionText}
                                >
                                  Image {index + 1}
                                </Text>
                              </View>
                            </View>
                          )
                        )}
                      </View>

                      {form.images.length > 0 ? (
                        <View style={styles.warningBox}>
                          <Ionicons
                            name="information-circle-outline"
                            size={17}
                            color="#EA580C"
                          />
                          <Text style={styles.warningText}>
                            Selecting new images will replace the
                            current salon images when submitted.
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}

                  {form.imagePreviews.length > 0 ? (
                    <View style={styles.previewBlock}>
                      <View style={styles.previewHeader}>
                        <Text style={styles.previewTitle}>
                          SELECTED IMAGES
                        </Text>
                        <Text
                          style={[
                            styles.previewCount,
                            { color: "#DB2777" },
                          ]}
                        >
                          Ready to upload
                        </Text>
                      </View>

                      <View style={styles.imageGrid}>
                        {form.imagePreviews.map(
                          (preview, index) => (
                            <View
                              key={preview}
                              style={styles.previewTile}
                            >
                              <Image
                                source={{ uri: preview }}
                                style={styles.previewImage}
                                resizeMode="cover"
                              />

                              <View style={styles.previewCaption}>
                                <Text
                                  style={styles.previewCaptionText}
                                >
                                  New Image
                                </Text>
                              </View>

                              <Pressable
                                onPress={() =>
                                  onRemoveNewImage(index)
                                }
                                style={({ pressed }) => [
                                  styles.removeImageButton,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <Ionicons
                                  name="close"
                                  size={16}
                                  color="#FFFFFF"
                                />
                              </Pressable>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  ) : null}
                </View>

                {/* WORKING HOURS */}
                <View style={styles.formSectionFull}>
                  <SectionHeader
                    tone="purple"
                    title="Working Hours"
                    subtitle="Set your weekly business schedule."
                    icon={(color) => (
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={color}
                      />
                    )}
                  />

                  <View style={styles.hoursGrid}>
                    {DAYS.map((day) => (
                      <WorkingHourField
                        key={day}
                        day={day}
                        value={form.workingHours[day]}
                        onChangeText={(value) =>
                          updateHour(day, value)
                        }
                      />
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.formFooter}>
              <Pressable
                onPress={onClose}
                disabled={saving}
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.cancelButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={saving}
                style={({ pressed }) => [
                  styles.footerButton,
                  styles.saveButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <LinearGradient
                  colors={["#DB2777", "#C026D3", "#7C3AED"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveGradient}
                >
                  {saving ? (
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons
                      name={
                        editingSalon
                          ? "checkmark-circle-outline"
                          : "add-circle-outline"
                      }
                      size={18}
                      color="#FFFFFF"
                    />
                  )}

                  <Text style={styles.saveButtonText}>
                    {saving
                      ? "Saving..."
                      : editingSalon
                      ? "Update Salon"
                      : "Create Salon"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const DeleteModal = ({
  visible,
  salon,
  loading,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.deleteBackdrop}>
        <View style={styles.deleteModal}>
          <LinearGradient
            colors={["#FFF1F2", "#FFFFFF"]}
            style={styles.deleteTop}
          >
            <View style={styles.deleteIcon}>
              <Ionicons
                name="trash-outline"
                size={25}
                color="#EF4444"
              />
            </View>

            <Text style={styles.deleteTitle}>
              Delete Salon?
            </Text>

            <Text style={styles.deleteDescription}>
              Are you sure you want to permanently delete{" "}
              <Text style={styles.deleteSalonName}>
                {salon?.name || "this salon"}
              </Text>
              ?
            </Text>

            <View style={styles.deleteWarning}>
              <Ionicons
                name="warning-outline"
                size={17}
                color="#DC2626"
              />
              <Text style={styles.deleteWarningText}>
                This action cannot be undone. All salon
                information associated with this location may
                be removed.
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.deleteFooter}>
            <Pressable
              onPress={onCancel}
              disabled={loading}
              style={({ pressed }) => [
                styles.deleteFooterButton,
                styles.deleteCancelButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              <Text style={styles.deleteCancelText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                styles.deleteFooterButton,
                styles.deleteConfirmButton,
                pressed && styles.pressed,
                loading && styles.disabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.deleteConfirmText}>
                {loading ? "Deleting..." : "Delete"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const LoadingScreen = () => {
  return (
    <View style={styles.loadingPage}>
      <LinearGradient
        colors={["#FFF7FB", "#FFFFFF", "#F8F5FF"]}
        style={styles.loadingGradient}
      >
        <View style={styles.loadingLogo}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={27}
            color="#DB2777"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading your salons
        </Text>

        <Text style={styles.loadingSubtitle}>
          Preparing your salon workspace...
        </Text>

        <ActivityIndicator
          size="small"
          color="#DB2777"
          style={{ marginTop: 18 }}
        />
      </LinearGradient>
    </View>
  );
};

const EmptyState = ({ search, onCreate }) => {
  return (
    <View style={styles.emptyCard}>
      <LinearGradient
        colors={["#FDF2F8", "#F5F3FF"]}
        style={styles.emptyIcon}
      >
        <Ionicons
          name={search ? "search-outline" : "storefront-outline"}
          size={32}
          color="#DB2777"
        />
      </LinearGradient>

      <Text style={styles.emptyTitle}>
        {search
          ? "No salons found"
          : "Create your first salon"}
      </Text>

      <Text style={styles.emptyText}>
        {search
          ? "We couldn't find any salon matching your search. Try another keyword."
          : "Add your first salon location and start managing your beauty business from one place."}
      </Text>

      {!search ? (
        <Pressable
          onPress={onCreate}
          style={({ pressed }) => [
            styles.emptyButton,
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={["#0F172A", "#1E293B"]}
            style={styles.emptyButtonGradient}
          >
            <Ionicons
              name="add"
              size={19}
              color="#FFFFFF"
            />
            <Text style={styles.emptyButtonText}>
              Create Salon
            </Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </View>
  );
};

const MySalons = () => {
  const { width } = useWindowDimensions();

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);

  const [form, setForm] = useState(createInitialForm());

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const isDesktop = width >= 1050;
  const isTablet = width >= 700 && width < 1050;

  const loadSalons = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setActionError("");

        const data = await getMySalons();
        setSalons(data?.salons || []);
      } catch (requestError) {
        console.error(requestError);

        setActionError(
          getErrorMessage(
            requestError,
            "Failed to load salons."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadSalons();
  }, [loadSalons]);

  const filteredSalons = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return salons;

    return salons.filter((salon) =>
      [
        salon.name,
        salon.city,
        salon.address,
        salon.phone,
        salon.email,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [salons, search]);

  const activeSalons = salons.filter(
    (salon) => salon.isActive
  ).length;

  const inactiveSalons = salons.filter(
    (salon) => !salon.isActive
  ).length;

  const resetForm = useCallback(() => {
    setForm(createInitialForm());
  }, []);

  const openCreateModal = () => {
    setEditingSalon(null);
    resetForm();
    setError("");
    setActionError("");
    setModalOpen(true);
  };

  const openEditModal = (salon) => {
    setEditingSalon(salon);

    setForm({
      name: salon.name || "",
      description: salon.description || "",
      phone: salon.phone || "",
      email: salon.email || "",
      address: salon.address || "",
      city: salon.city || "",
      location:
        typeof salon.location === "string"
          ? salon.location
          : salon.location
          ? JSON.stringify(salon.location)
          : "",
      images: [],
      imagePreviews: [],
      existingImages: Array.isArray(salon.images)
        ? salon.images
        : [],
      workingHours: workingHoursToForm(
        salon.workingHours
      ),
    });

    setError("");
    setActionError("");
    setModalOpen(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) return;

    setModalOpen(false);
    setEditingSalon(null);
    resetForm();
    setError("");
  };

  const pickImages = async () => {
    try {
      setError("");

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo permission required",
          "Please allow photo library access to upload salon images."
        );
        return;
      }

      const remainingSlots = 10;

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: remainingSlots,
          quality: 0.9,
          orderedSelection: true,
        });

      if (result.canceled) return;

      const assets = result.assets || [];

      if (!assets.length) return;

      if (assets.length > 10) {
        setError(
          "You can upload a maximum of 10 images."
        );
        return;
      }

      const normalized = assets
        .map(normalizePickedImage)
        .filter(Boolean);

      const oversized = normalized.find(
        (file) =>
          file.size && file.size > 5 * 1024 * 1024
      );

      if (oversized) {
        setError(
          "Each image should be less than 5 MB."
        );
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: normalized,
        imagePreviews: normalized.map(
          (file) => file.uri
        ),
      }));
    } catch (pickerError) {
      console.error(pickerError);

      setError(
        getErrorMessage(
          pickerError,
          "Unable to select images."
        )
      );
    }
  };

  const removeNewImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter(
        (_, imageIndex) => imageIndex !== index
      ),
      imagePreviews: prev.imagePreviews.filter(
        (_, imageIndex) => imageIndex !== index
      ),
    }));
  };

 const handleSubmit = async () => {
  setError("");

  if (!form.name.trim()) {
    setError("Salon name is required.");
    return;
  }

  if (!form.address.trim()) {
    setError("Address is required.");
    return;
  }

  if (!form.city.trim()) {
    setError("City is required.");
    return;
  }

  if (form.images.length > 10) {
    setError("You can upload a maximum of 10 images.");
    return;
  }

  try {
    setSaving(true);

    const formData = new FormData();

    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("phone", form.phone.trim());
    formData.append("email", form.email.trim());
    formData.append("address", form.address.trim());
    formData.append("city", form.city.trim());

    if (form.location.trim()) {
      formData.append("location", form.location.trim());
    }

    const workingHoursArray =
      workingHoursToArray(form.workingHours);

    formData.append(
      "workingHours",
      JSON.stringify(workingHoursArray)
    );

    // =================================================
    // IMAGE UPLOAD FIX
    // =================================================

    if (Platform.OS === "web") {
      for (const image of form.images) {
        if (!image?.uri) continue;

        const response = await fetch(image.uri);
        const blob = await response.blob();

        const file = new File(
          [blob],
          image.name || `salon-image-${Date.now()}.jpg`,
          {
            type: image.type || blob.type || "image/jpeg",
          }
        );

        formData.append("images", file);
      }
    } else {
      form.images.forEach((image) => {
        if (!image?.uri) return;

        formData.append("images", {
          uri: image.uri,
          name:
            image.name ||
            `salon-image-${Date.now()}.jpg`,
          type:
            image.type ||
            "image/jpeg",
        });
      });
    }

    // =================================================

    let data;

    if (editingSalon) {
      data = await updateSalon(
        editingSalon._id,
        formData
      );

      setSalons((prev) =>
        prev.map((salon) =>
          salon._id === editingSalon._id
            ? data.salon
            : salon
        )
      );
    } else {
      data = await createSalon(formData);

      setSalons((prev) => [
        data.salon,
        ...prev,
      ]);
    }

    closeModal(true);
  } catch (requestError) {
    console.error(
      "Failed to save salon:",
      requestError
    );

    setError(
      getErrorMessage(
        requestError,
        "Failed to save salon."
      )
    );
  } finally {
    setSaving(false);
  }
};

  const handleStatus = async (salon) => {
    try {
      setStatusLoading(salon._id);
      setActionError("");

      const nextStatus = !salon.isActive;

      const data = await updateSalonStatus(
        salon._id,
        nextStatus
      );

      setSalons((prev) =>
        prev.map((item) =>
          item._id === salon._id
            ? data.salon
            : item
        )
      );
    } catch (requestError) {
      console.error(requestError);

      setActionError(
        getErrorMessage(
          requestError,
          "Failed to update salon status."
        )
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const requestDelete = (salon) => {
    setDeleteTarget(salon);
    setActionError("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setStatusLoading(deleteTarget._id);
      setActionError("");

      await deleteSalon(deleteTarget._id);

      setSalons((prev) =>
        prev.filter(
          (salon) =>
            salon._id !== deleteTarget._id
        )
      );

      setDeleteTarget(null);
    } catch (requestError) {
      console.error(requestError);

      setActionError(
        getErrorMessage(
          requestError,
          "Failed to delete salon."
        )
      );
    } finally {
      setStatusLoading(null);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.page}>
      <LinearGradient
        colors={["#FAF7FF", "#FFFFFF", "#FFF9FC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={[
          styles.pageContent,
          isDesktop && styles.pageContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSalons(true)}
            tintColor="#DB2777"
            colors={["#DB2777"]}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* PREMIUM HEADER */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />

          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <View style={styles.eyebrow}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={13}
                  color="#DB2777"
                />
                <Text style={styles.eyebrowText}>
                  SALON MANAGEMENT
                </Text>
              </View>

              <Text style={styles.heroTitle}>
                My Salons
              </Text>

              <Text style={styles.heroDescription}>
                Create, manage and control all your salon
                locations from one centralized workspace.
              </Text>

              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <View
                    style={[
                      styles.heroPillDot,
                      { backgroundColor: "#94A3B8" },
                    ]}
                  />
                  <Text style={styles.heroPillText}>
                    {salons.length}{" "}
                    {salons.length === 1
                      ? "Salon"
                      : "Salons"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.heroPill,
                    styles.heroActivePill,
                  ]}
                >
                  <View
                    style={[
                      styles.heroPillDot,
                      { backgroundColor: "#10B981" },
                    ]}
                  />
                  <Text
                    style={[
                      styles.heroPillText,
                      { color: "#059669" },
                    ]}
                  >
                    {activeSalons} Active
                  </Text>
                </View>

                {inactiveSalons > 0 ? (
                  <View
                    style={[
                      styles.heroPill,
                      styles.heroInactivePill,
                    ]}
                  >
                    <View
                      style={[
                        styles.heroPillDot,
                        { backgroundColor: "#EF4444" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.heroPillText,
                        { color: "#DC2626" },
                      ]}
                    >
                      {inactiveSalons} Inactive
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={openCreateModal}
              style={({ pressed }) => [
                styles.addSalonButton,
                pressed && styles.pressed,
              ]}
            >
              <LinearGradient
                colors={["#DB2777", "#C026D3", "#7C3AED"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addSalonGradient}
              >
                <Ionicons
                  name="add"
                  size={21}
                  color="#FFFFFF"
                />
                <Text style={styles.addSalonText}>
                  Add New Salon
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* STAT CARDS */}
        <View style={styles.statsGrid}>
          <StatCard
            title="TOTAL SALONS"
            value={salons.length}
            subtitle="Registered locations"
            tone="slate"
            icon={(color) => (
              <MaterialCommunityIcons
                name="storefront-outline"
                size={21}
                color={color}
              />
            )}
          />

          <StatCard
            title="ACTIVE"
            value={activeSalons}
            subtitle="Currently available"
            tone="green"
            icon={(color) => (
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={color}
              />
            )}
          />

          <StatCard
            title="INACTIVE"
            value={inactiveSalons}
            subtitle="Currently disabled"
            tone="red"
            icon={(color) => (
              <Ionicons
                name="power-outline"
                size={22}
                color={color}
              />
            )}
          />
        </View>

        {/* SEARCH / TOOLBAR */}
        <View style={styles.toolbar}>
          <View style={styles.toolbarMain}>
            <View style={styles.toolbarTitleRow}>
              <View>
                <Text style={styles.toolbarTitle}>
                  Salon Directory
                </Text>
                <Text style={styles.toolbarSubtitle}>
                  Search and manage your locations.
                </Text>
              </View>

              {search ? (
                <Pressable
                  onPress={() => setSearch("")}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.clearButtonText}>
                    Clear
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.searchShell}>
              <Ionicons
                name="search-outline"
                size={19}
                color="#94A3B8"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search salon, city, phone or email..."
                placeholderTextColor="#94A3B8"
                style={styles.searchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />

              {search ? (
                <Pressable
                  onPress={() => setSearch("")}
                  hitSlop={8}
                  style={styles.searchClearIcon}
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color="#CBD5E1"
                  />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.showingPill}>
            <Ionicons
              name="storefront-outline"
              size={14}
              color="#DB2777"
            />
            <Text style={styles.showingLabel}>
              Showing
            </Text>
            <View style={styles.showingNumber}>
              <Text style={styles.showingNumberText}>
                {filteredSalons.length}
              </Text>
            </View>
          </View>
        </View>

        {/* GLOBAL ERROR */}
        {actionError ? (
          <View style={styles.globalError}>
            <View style={styles.globalErrorIcon}>
              <Ionicons
                name="alert-circle-outline"
                size={19}
                color="#DC2626"
              />
            </View>

            <View style={styles.globalErrorText}>
              <Text style={styles.globalErrorTitle}>
                Something went wrong
              </Text>
              <Text style={styles.globalErrorMessage}>
                {actionError}
              </Text>
            </View>

            <Pressable
              onPress={() => setActionError("")}
              hitSlop={8}
              style={styles.globalErrorClose}
            >
              <Ionicons
                name="close"
                size={18}
                color="#F87171"
              />
            </Pressable>
          </View>
        ) : null}

        {/* CONTENT */}
        {filteredSalons.length === 0 ? (
          <EmptyState
            search={Boolean(search)}
            onCreate={openCreateModal}
          />
        ) : isDesktop ? (
          <DesktopSalonTable
            salons={filteredSalons}
            onEdit={openEditModal}
            onStatus={handleStatus}
            onDelete={requestDelete}
            statusLoading={statusLoading}
          />
        ) : (
          <View
            style={[
              styles.cardsList,
              isTablet && styles.cardsListTablet,
            ]}
          >
            {filteredSalons.map((salon) => (
              <SalonCard
                key={salon._id}
                salon={salon}
                onEdit={() => openEditModal(salon)}
                onStatus={() => handleStatus(salon)}
                onDelete={() => requestDelete(salon)}
                statusLoading={
                  statusLoading === salon._id
                }
              />
            ))}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      <SalonFormModal
        visible={modalOpen}
        editingSalon={editingSalon}
        form={form}
        setForm={setForm}
        error={error}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onPickImages={pickImages}
        onRemoveNewImage={removeNewImage}
      />

      <DeleteModal
        visible={Boolean(deleteTarget)}
        salon={deleteTarget}
        loading={
          Boolean(deleteTarget) &&
          statusLoading === deleteTarget?._id
        }
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    minHeight: Platform.OS === "web" ? "100vh" : undefined,
  },

  pageScroll: {
    flex: 1,
  },

  pageContent: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 30,
    gap: 16,
  },

  pageContentDesktop: {
    maxWidth: 1440,
    paddingHorizontal: 26,
    paddingTop: 24,
    gap: 20,
  },

  /* ---------------- HERO ---------------- */

  heroCard: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.07,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 13 },
    elevation: 4,
  },

  heroGlowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -95,
    top: -130,
    backgroundColor: "rgba(244,114,182,0.10)",
  },

  heroGlowTwo: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    left: "30%",
    bottom: -160,
    backgroundColor: "rgba(168,85,247,0.07)",
  },

  heroContent: {
    padding: 20,
    gap: 20,
  },

  heroText: {
    minWidth: 0,
    flexShrink: 1,
  },

  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#FBCFE8",
    backgroundColor: "#FDF2F8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  eyebrowText: {
    color: "#DB2777",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  heroTitle: {
    marginTop: 12,
    color: "#0F172A",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
    flexShrink: 1,
  },

  heroDescription: {
    marginTop: 7,
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 760,
    flexShrink: 1,
  },

  heroPills: {
    marginTop: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  heroPill: {
    minHeight: 31,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  heroActivePill: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },

  heroInactivePill: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  heroPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  heroPillText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },

  addSalonButton: {
    width: "100%",
    minHeight: 50,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#DB2777",
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  addSalonGradient: {
    flex: 1,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 18,
    borderRadius: 14,
  },

  addSalonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  /* ---------------- STATS ---------------- */

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  statCard: {
    position: "relative",
    overflow: "hidden",
    flexGrow: 1,
    flexBasis: 220,
    minWidth: 0,
    minHeight: 128,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.045,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  statGlow: {
    position: "absolute",
    width: 95,
    height: 95,
    borderRadius: 48,
    right: -28,
    top: -28,
  },

  statContent: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  statTextArea: {
    flex: 1,
    minWidth: 0,
  },

  statTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  statValue: {
    marginTop: 8,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
  },

  statSubtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
  },

  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ---------------- TOOLBAR ---------------- */

  toolbar: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 14,
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.045,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  toolbarMain: {
    flex: 1,
    minWidth: 0,
  },

  toolbarTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 9,
  },

  toolbarTitle: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "900",
  },

  toolbarSubtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "600",
  },

  clearButton: {
    paddingHorizontal: 5,
    paddingVertical: 5,
  },

  clearButtonText: {
    color: "#DB2777",
    fontSize: 11,
    fontWeight: "900",
  },

  searchShell: {
    minHeight: 50,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    color: "#334155",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
    outlineStyle: "none",
  },

  searchClearIcon: {
    padding: 2,
  },

  showingPill: {
    alignSelf: "flex-start",
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  showingLabel: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },

  showingNumber: {
    minWidth: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  showingNumberText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "900",
  },

  /* ---------------- ERROR ---------------- */

  globalError: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    padding: 12,
  },

  globalErrorIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  globalErrorText: {
    flex: 1,
    minWidth: 0,
  },

  globalErrorTitle: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "900",
  },

  globalErrorMessage: {
    marginTop: 2,
    color: "#DC2626",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
  },

  globalErrorClose: {
    padding: 4,
  },

  /* ---------------- EMPTY ---------------- */

  emptyCard: {
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 52,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 19,
    color: "#1E293B",
    textAlign: "center",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    flexShrink: 1,
  },

  emptyText: {
    marginTop: 7,
    maxWidth: 520,
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "600",
    flexShrink: 1,
  },

  emptyButton: {
    marginTop: 18,
    minHeight: 48,
    borderRadius: 13,
    overflow: "hidden",
  },

  emptyButtonGradient: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 13,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  /* ---------------- SALON CARDS ---------------- */

  cardsList: {
    width: "100%",
    gap: 14,
  },

  cardsListTablet: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  salonCard: {
    overflow: "hidden",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.055,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 9 },
    elevation: 3,
  },

  cardAccent: {
    width: "100%",
    height: 4,
  },

  cardInner: {
    padding: 15,
  },

  cardTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  salonIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  cardAvatar: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  imageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDF2F8",
  },

  salonIdentityText: {
    flex: 1,
    minWidth: 0,
  },

  cardSalonName: {
    color: "#1E293B",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    flexShrink: 1,
  },

  locationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },

  locationText: {
    flex: 1,
    minWidth: 0,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "700",
    flexShrink: 1,
  },

  statusBadge: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  activeBadge: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },

  inactiveBadge: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  galleryBlock: {
    marginTop: 17,
  },

  galleryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 7,
  },

  galleryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  galleryTitle: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  galleryCount: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
  },

  galleryList: {
    gap: 8,
    paddingRight: 4,
  },

  galleryImageWrap: {
    position: "relative",
    width: 76,
    height: 76,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
  },

  galleryImage: {
    width: "100%",
    height: "100%",
  },

  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.60)",
  },

  moreOverlayText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  cardDescription: {
    marginTop: 16,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
  },

  detailGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },

  detailBox: {
    flex: 1,
    minWidth: 150,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    padding: 11,
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  detailValue: {
    marginTop: 5,
    color: "#334155",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    flexShrink: 1,
  },

  cardActions: {
    width: "100%",
    flexDirection: "row",
    gap: 7,
    marginTop: 13,
  },

  cardAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 5,
  },

  editAction: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },

  offAction: {
    borderColor: "#FED7AA",
    backgroundColor: "#FFF7ED",
  },

  onAction: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },

  deleteAction: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  actionText: {
    fontSize: 10,
    fontWeight: "900",
  },

  editActionText: {
    color: "#2563EB",
    fontSize: 10,
    fontWeight: "900",
  },

  deleteActionText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "900",
  },

  /* ---------------- DESKTOP TABLE ---------------- */

  tableCard: {
    width: "100%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.055,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  tableHeader: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 22,
    paddingVertical: 17,
  },

  tableTitle: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "900",
  },

  tableSubtitle: {
    marginTop: 4,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  resultsPill: {
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },

  resultsPillText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "800",
  },

  tableMinWidth: {
    minWidth: 1100,
  },

  tableRowHeader: {
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 22,
  },

  tableHead: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  tableRow: {
    minHeight: 94,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 22,
    paddingVertical: 14,
  },

  colSalon: {
    width: 290,
  },

  colLocation: {
    width: 230,
    paddingRight: 18,
  },

  colContact: {
    width: 210,
    paddingRight: 18,
  },

  colStatus: {
    width: 145,
  },

  colActions: {
    width: 205,
  },

  alignRight: {
    textAlign: "right",
  },

  salonCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingRight: 15,
  },

  tableAvatar: {
    width: 48,
    height: 48,
    flexShrink: 0,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  tableSalonText: {
    flex: 1,
    minWidth: 0,
  },

  tableSalonName: {
    color: "#1E293B",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    flexShrink: 1,
  },

  tableDescription: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  tableLocationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
  },

  tablePrimary: {
    color: "#475569",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "800",
    flexShrink: 1,
  },

  tableSecondary: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  tableActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 7,
  },

  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 11,
  },

  /* ---------------- FORM MODAL ---------------- */

  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.72)",
    padding: 10,
  },

  modalKeyboard: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  formModal: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 25 },
    elevation: 15,
  },

  formModalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  formHeaderContent: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
  },

  formTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  formEyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#FDF2F8",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  formEyebrowText: {
    color: "#DB2777",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  formTitle: {
    marginTop: 8,
    color: "#0F172A",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    flexShrink: 1,
  },

  formSubtitle: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    flexShrink: 1,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  formScroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  formContent: {
    padding: 14,
    paddingBottom: 22,
  },

  formGrid: {
    width: "100%",
    gap: 14,
  },

  formGridWide: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  formHalf: {
    width: "48.9%",
  },

  formSection: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  formSectionFull: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.85)",
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  sectionTitle: {
    color: "#1E293B",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    flexShrink: 1,
  },

  field: {
    width: "100%",
    marginBottom: 13,
  },

  fieldRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  fieldFlex: {
    flex: 1,
    minWidth: 0,
  },

  fieldLabelRow: {
    marginBottom: 6,
    minHeight: 16,
  },

  fieldLabel: {
    color: "#475569",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    flexShrink: 1,
  },

  required: {
    color: "#DB2777",
  },

  inputShell: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
  },

  inputShellMultiline: {
    minHeight: 105,
    alignItems: "flex-start",
    paddingVertical: 10,
  },

  inputIcon: {
    width: 25,
    flexShrink: 0,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  inputIconMultiline: {
    paddingTop: 2,
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    paddingVertical: 0,
    outlineStyle: "none",
  },

  textInputWithIcon: {
    paddingLeft: 2,
  },

  textInputMultiline: {
    minHeight: 84,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "top",
  },

  helperText: {
    marginTop: -6,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
  },

  formError: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    padding: 11,
    marginBottom: 14,
  },

  errorIcon: {
    width: 31,
    height: 31,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#FEE2E2",
  },

  errorTextArea: {
    flex: 1,
    minWidth: 0,
  },

  errorTitle: {
    color: "#B91C1C",
    fontSize: 11,
    fontWeight: "900",
  },

  errorMessage: {
    marginTop: 2,
    color: "#DC2626",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    flexShrink: 1,
  },

  /* ---------------- UPLOAD ---------------- */

  uploadMetaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 9,
  },

  uploadMetaText: {
    color: "#DB2777",
    fontSize: 10,
    fontWeight: "900",
  },

  uploadLimit: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "700",
  },

  uploadBox: {
    width: "100%",
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 25,
  },

  uploadBoxPressed: {
    borderColor: "#F9A8D4",
    backgroundColor: "#FFF7FB",
  },

  uploadIcon: {
    width: 57,
    height: 57,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },

  uploadTitle: {
    marginTop: 12,
    color: "#334155",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
  },

  uploadSubtitle: {
    marginTop: 4,
    maxWidth: 420,
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  uploadChip: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  uploadChipText: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "800",
  },

  previewBlock: {
    width: "100%",
    marginTop: 18,
  },

  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 9,
  },

  previewTitle: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },

  previewCount: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
  },

  imageGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  previewTile: {
    position: "relative",
    width: 105,
    aspectRatio: 1,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    backgroundColor: "#F1F5F9",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },

  previewCaption: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15,23,42,0.62)",
    paddingHorizontal: 7,
    paddingVertical: 6,
  },

  previewCaptionText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  removeImageButton: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 27,
    height: 27,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#DC2626",
  },

  warningBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 11,
    backgroundColor: "#FFF7ED",
    padding: 9,
  },

  warningText: {
    flex: 1,
    color: "#EA580C",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  /* ---------------- HOURS ---------------- */

  hoursGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  hoursCard: {
    flexGrow: 1,
    flexBasis: 210,
    minWidth: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 11,
  },

  hoursTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
    marginBottom: 8,
  },

  hoursDay: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "900",
  },

  hoursStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  hoursStatusOpen: {
    borderColor: "#A7F3D0",
    backgroundColor: "#ECFDF5",
  },

  hoursStatusClosed: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  hoursStatusText: {
    fontSize: 8,
    fontWeight: "900",
  },

  hoursInput: {
    width: "100%",
    minHeight: 43,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    color: "#475569",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 0,
    outlineStyle: "none",
  },

  hoursHint: {
    marginTop: 5,
    color: "#CBD5E1",
    fontSize: 8,
    fontWeight: "700",
  },

  /* ---------------- FORM FOOTER ---------------- */

  formFooter: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  footerButton: {
    minHeight: 47,
    minWidth: 112,
    overflow: "hidden",
    borderRadius: 12,
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },

  saveButton: {
    minWidth: 155,
  },

  saveGradient: {
    flex: 1,
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 17,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* ---------------- DELETE ---------------- */

  deleteBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.72)",
    padding: 14,
  },

  deleteModal: {
    width: "100%",
    maxWidth: 450,
    overflow: "hidden",
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.28,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 22 },
    elevation: 14,
  },

  deleteTop: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 27,
    paddingBottom: 21,
  },

  deleteIcon: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#FEF2F2",
  },

  deleteTitle: {
    marginTop: 15,
    color: "#0F172A",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900",
  },

  deleteDescription: {
    marginTop: 7,
    color: "#64748B",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
  },

  deleteSalonName: {
    color: "#334155",
    fontWeight: "900",
  },

  deleteWarning: {
    width: "100%",
    marginTop: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    padding: 10,
  },

  deleteWarningText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  deleteFooter: {
    width: "100%",
    flexDirection: "row",
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    padding: 13,
  },

  deleteFooterButton: {
    flex: 1,
    minHeight: 47,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
  },

  deleteCancelButton: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  deleteCancelText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },

  deleteConfirmButton: {
    backgroundColor: "#DC2626",
  },

  deleteConfirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  /* ---------------- LOADING ---------------- */

  loadingPage: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  loadingGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  loadingLogo: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FDF2F8",
  },

  loadingTitle: {
    marginTop: 16,
    color: "#1E293B",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "900",
  },

  loadingSubtitle: {
    marginTop: 4,
    color: "#94A3B8",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
  },

  /* ---------------- COMMON ---------------- */

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  disabled: {
    opacity: 0.5,
  },

  bottomSpace: {
    height: 15,
  },
});

export default MySalons;
