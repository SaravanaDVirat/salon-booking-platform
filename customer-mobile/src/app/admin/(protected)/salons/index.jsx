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
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const Search = (props) => <Ionicons name="search" {...props} />;
const MapPin = (props) => <Ionicons name="location-outline" {...props} />;
const Phone = (props) => <Ionicons name="call-outline" {...props} />;
const Mail = (props) => <Ionicons name="mail-outline" {...props} />;
const Edit3 = (props) => <Ionicons name="create-outline" {...props} />;
const Trash2 = (props) => <Ionicons name="trash-outline" {...props} />;
const Power = (props) => <Ionicons name="power-outline" {...props} />;
const Eye = (props) => <Ionicons name="eye-outline" {...props} />;
const X = (props) => <Ionicons name="close" {...props} />;
const Building2 = (props) => <Ionicons name="business-outline" {...props} />;
const CheckCircle2 = (props) => <Ionicons name="checkmark-circle" {...props} />;
const XCircle = (props) => <Ionicons name="close-circle" {...props} />;
const RefreshCw = (props) => <Ionicons name="refresh" {...props} />;
const ImagePlus = (props) => <Ionicons name="images-outline" {...props} />;
const Clock3 = (props) => <Ionicons name="time-outline" {...props} />;
const Navigation = (props) => <Ionicons name="navigate-outline" {...props} />;
const ChevronDown = (props) => <Ionicons name="chevron-down" {...props} />;
const ChevronRight = (props) => <Ionicons name="chevron-forward" {...props} />;
const Upload = (props) => <Ionicons name="cloud-upload-outline" {...props} />;
const Save = (props) => <Ionicons name="save-outline" {...props} />;

import {
  getAdminSalons,
  updateSalon,
  deleteSalon,
  activateSalon,
  deactivateSalon,
} from "../../../../services/adminSalonService";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const COLORS = {
  bg: "#F5F3FF",
  surface: "#FFFFFF",
  surfaceSoft: "#FAF9FF",
  border: "#E7E5F2",
  text: "#0F172A",
  muted: "#64748B",
  faint: "#94A3B8",
  primary: "#7C3AED",
  primaryDark: "#6D28D9",
  secondary: "#C026D3",
  green: "#059669",
  greenBg: "#ECFDF5",
  red: "#E11D48",
  redBg: "#FFF1F2",
  amber: "#D97706",
  amberBg: "#FFFBEB",
  blue: "#0284C7",
  blueBg: "#F0F9FF",
  violetBg: "#F5F3FF",
  slateBg: "#F8FAFC",
};

const defaultWorkingHours = {
  MONDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  TUESDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  WEDNESDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  THURSDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  FRIDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  SATURDAY: { isOpen: true, openTime: "09:00", closeTime: "18:00" },
  SUNDAY: { isOpen: false, openTime: "", closeTime: "" },
};

const createDefaultWorkingHours = () =>
  Object.fromEntries(
    DAYS.map((day) => [day, { ...defaultWorkingHours[day] }])
  );

const normalizeWorkingHours = (workingHours) => {
  const result = createDefaultWorkingHours();

  if (!Array.isArray(workingHours)) return result;

  workingHours.forEach((item) => {
    if (!item?.day) return;
    const day = String(item.day).toUpperCase();
    if (!DAYS.includes(day)) return;

    result[day] = {
      isOpen: Boolean(item.isOpen),
      openTime: item.openTime || "",
      closeTime: item.closeTime || "",
    };
  });

  return result;
};

const convertWorkingHoursForBackend = (workingHours) =>
  DAYS.map((day) => {
    const current = workingHours?.[day] || {};
    return {
      day,
      isOpen: Boolean(current.isOpen),
      openTime: current.isOpen ? current.openTime || "" : "",
      closeTime: current.isOpen ? current.closeTime || "" : "",
    };
  });

const formatDay = (day) =>
  day.charAt(0) + day.slice(1).toLowerCase();

const getInitial = (name) =>
  name?.trim()?.charAt(0)?.toUpperCase() || "S";

const getImageUrl = (image) => {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const normalizedPath = image.startsWith("/") ? image : `/${image}`;
  return `${API_ORIGIN}${normalizedPath}`;
};

const isWeb = Platform.OS === "web";

const makeUploadFile = (asset) => {
  if (!asset) return null;

  // Expo ImagePicker on web exposes the actual File object.
  if (Platform.OS === "web" && asset.file) {
    return asset.file;
  }

  const uri = asset.uri;
  const fileName =
    asset.fileName ||
    uri?.split("/").pop() ||
    `salon-${Date.now()}.jpg`;

  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "jpg";

  const mimeType =
    asset.mimeType ||
    (extension === "png"
      ? "image/png"
      : extension === "webp"
      ? "image/webp"
      : "image/jpeg");

  return {
    uri,
    name: fileName,
    type: mimeType,
  };
};

const buildMultipartFormData = (formData, imageAssets) => {
  const data = new FormData();

  data.append("name", formData.name.trim());
  data.append("description", formData.description.trim());
  data.append("phone", formData.phone.trim());
  data.append("email", formData.email.trim());
  data.append("address", formData.address.trim());
  data.append("city", formData.city.trim());
  data.append("location", formData.location.trim());
  data.append(
    "workingHours",
    JSON.stringify(convertWorkingHoursForBackend(formData.workingHours))
  );

  imageAssets.forEach((asset) => {
    const file = makeUploadFile(asset);
    if (file) data.append("images", file);
  });

  return data;
};

const GlassButton = ({
  icon,
  label,
  onPress,
  disabled,
  tone = "neutral",
  fullWidth = false,
}) => {
  const toneMap = {
    neutral: {
      bg: "#FFFFFF",
      border: COLORS.border,
      text: "#475569",
    },
    primary: {
      bg: COLORS.primary,
      border: COLORS.primary,
      text: "#FFFFFF",
    },
    danger: {
      bg: COLORS.redBg,
      border: "#FECDD3",
      text: COLORS.red,
    },
    success: {
      bg: COLORS.greenBg,
      border: "#A7F3D0",
      text: COLORS.green,
    },
  };

  const colors = toneMap[tone] || toneMap.neutral;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.glassButton,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.glassButtonText,
          { color: colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const IconAction = ({
  icon,
  onPress,
  disabled,
  accessibilityLabel,
  backgroundColor = "#FFFFFF",
  borderColor = COLORS.border,
}) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [
      styles.iconAction,
      {
        backgroundColor,
        borderColor,
        opacity: disabled ? 0.45 : 1,
        transform: [{ translateY: pressed ? 0 : -1 }],
      },
    ]}
  >
    {icon}
  </Pressable>
);

const SectionTitle = ({ icon, title, subtitle }) => (
  <View style={styles.sectionTitleWrap}>
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {subtitle ? (
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    ) : null}
  </View>
);

const InfoRow = ({ icon, label, value, tone = "neutral" }) => (
  <View style={styles.infoRow}>
    <View
      style={[
        styles.infoIcon,
        tone === "violet" && {
          backgroundColor: COLORS.violetBg,
          borderColor: "#DDD6FE",
        },
      ]}
    >
      {icon}
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "N/A"}</Text>
    </View>
  </View>
);

const Field = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
  required,
  editable = true,
}) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#A8B2C2"
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? "top" : "center"}
      selectionColor={COLORS.primary}
      style={[
        styles.input,
        multiline && styles.textarea,
        !editable && styles.inputDisabled,
      ]}
    />
  </View>
);

const TimePickerModal = ({
  visible,
  title,
  value,
  onSelect,
  onClose,
}) => {
  const [draft, setDraft] = useState(value || "09:00");

  useEffect(() => {
    if (visible) setDraft(value || "09:00");
  }, [visible, value]);

  const options = useMemo(() => {
    const result = [];
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 30) {
        const h = String(hour).padStart(2, "0");
        const m = String(minute).padStart(2, "0");
        result.push(`${h}:${m}`);
      }
    }
    return result;
  }, []);

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
        <View style={styles.timeModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <View style={styles.modalEyebrow}>
                <Clock3 size={12} color={COLORS.primary} />
                <Text style={styles.modalEyebrowText}>
                  TIME SELECTION
                </Text>
              </View>
              <Text style={styles.modalTitle}>{title}</Text>
              <Text style={styles.modalSubtitle}>
                Choose a time. The entire option row is selectable.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <X size={18} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.timeList}
            contentContainerStyle={styles.timeListContent}
            showsVerticalScrollIndicator={false}
          >
            {options.map((time) => {
              const selected = draft === time;
              return (
                <Pressable
                  key={time}
                  onPress={() => setDraft(time)}
                  style={[
                    styles.timeOption,
                    selected && styles.timeOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      selected && styles.timeOptionTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                  {selected ? (
                    <CheckCircle2
                      size={18}
                      color={COLORS.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <GlassButton
              label="Cancel"
              onPress={onClose}
              fullWidth={isWeb ? false : true}
            />
            <GlassButton
              label="Use Time"
              tone="primary"
              icon={<CheckCircle2 size={17} color="#FFFFFF" />}
              onPress={() => {
                onSelect(draft);
                onClose();
              }}
              fullWidth={isWeb ? false : true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel,
  danger,
  loading,
  onCancel,
  onConfirm,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={loading ? undefined : onCancel}
  >
    <View style={styles.modalBackdrop}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={loading ? undefined : onCancel}
      />
      <View style={styles.confirmModal}>
        <View
          style={[
            styles.confirmIcon,
            danger
              ? { backgroundColor: COLORS.redBg }
              : { backgroundColor: COLORS.violetBg },
          ]}
        >
          {danger ? (
            <Trash2 size={24} color={COLORS.red} />
          ) : (
            <Power size={24} color={COLORS.primary} />
          )}
        </View>

        <Text style={styles.confirmTitle}>{title}</Text>
        <Text style={styles.confirmMessage}>{message}</Text>

        <View style={styles.confirmActions}>
          <GlassButton
            label="Cancel"
            onPress={onCancel}
            disabled={loading}
            fullWidth
          />
          <Pressable
            disabled={loading}
            onPress={onConfirm}
            style={[
              styles.confirmPrimary,
              danger && {
                backgroundColor: COLORS.red,
                borderColor: COLORS.red,
              },
              loading && { opacity: 0.55 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                {danger ? (
                  <Trash2 size={16} color="#FFFFFF" />
                ) : (
                  <Power size={16} color="#FFFFFF" />
                )}
                <Text style={styles.confirmPrimaryText}>
                  {confirmLabel}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const SalonCard = ({
  salon,
  onView,
  onEdit,
  onStatus,
  onDelete,
  statusLoading,
  deleteLoading,
}) => {
  const { width: cardScreenWidth } = useWindowDimensions();
  const is320Mobile = cardScreenWidth <= 350;
  const active = Boolean(salon.isActive);

  return (
    <View style={styles.salonCard}>
      <View style={styles.cardGlowTop} />
      <View style={styles.cardGlowBottom} />

      <View
        style={[
          styles.cardHeader,
          is320Mobile && styles.cardHeader320,
        ]}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitial(salon.name)}
          </Text>
        </View>

        <View style={styles.cardNameWrap}>
          <View
            style={[
              styles.cardNameRow,
              is320Mobile && styles.cardNameRow320,
            ]}
          >
            <View
              style={[
                styles.cardNameTextWrap,
                is320Mobile && styles.cardNameTextWrap320,
              ]}
            >
              <Text
                style={[
                  styles.cardSalonName,
                  is320Mobile && styles.cardSalonName320,
                ]}
              >
                {salon.name || "Unnamed Salon"}
              </Text>
              <View style={styles.salonTypeRow}>
                <Building2 size={11} color="#94A3B8" />
                <Text style={styles.salonType}>SALON</Text>
              </View>
            </View>

            <View
              style={[
                styles.statusBadge,
                is320Mobile && styles.statusBadge320,
                active
                  ? styles.statusActive
                  : styles.statusInactive,
              ]}
            >
              {active ? (
                <CheckCircle2 size={12} color={COLORS.green} />
              ) : (
                <XCircle size={12} color={COLORS.red} />
              )}
              <Text
                style={[
                  styles.statusText,
                  active
                    ? { color: COLORS.green }
                    : { color: COLORS.red },
                ]}
              >
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.ownerBox}>
          <View style={styles.ownerHeader}>
            <View style={styles.smallIconBox}>
              <Building2 size={14} color={COLORS.primary} />
            </View>
            <Text style={styles.smallSectionLabel}>
              SALON OWNER
            </Text>
          </View>
          <Text style={styles.ownerName}>
            {salon.owner?.name || "Unknown Owner"}
          </Text>
          <Text style={styles.ownerEmail}>
            {salon.owner?.email || "No owner email available"}
          </Text>
        </View>

        <View style={styles.locationBox}>
          <View style={styles.locationIcon}>
            <MapPin size={15} color={COLORS.primary} />
          </View>
          <View style={styles.locationTextWrap}>
            <Text style={styles.smallSectionLabel}>
              LOCATION
            </Text>
            <Text style={styles.locationCity}>
              {salon.city || "City unavailable"}
            </Text>
            <Text style={styles.locationAddress}>
              {salon.address || "Address unavailable"}
            </Text>
          </View>
        </View>

        <View style={styles.contactStack}>
          <InfoRow
            label="PHONE"
            value={salon.phone || "No phone number"}
            icon={<Phone size={13} color="#64748B" />}
          />
          <InfoRow
            label="EMAIL"
            value={salon.email || "No email address"}
            icon={<Mail size={13} color="#64748B" />}
          />
        </View>

        <View style={styles.quickInfo}>
          <CheckCircle2 size={13} color={COLORS.primary} />
          <Text style={styles.quickInfoText}>
            {active ? "Currently Active" : "Currently Inactive"}
          </Text>
        </View>

        <View
          style={[
            styles.cardActions,
            is320Mobile && styles.cardActions320,
          ]}
        >
          {!is320Mobile && (
            <View style={styles.manageTextWrap}>
              <Text style={styles.manageTitle}>MANAGE SALON</Text>
              <Text style={styles.manageSubtitle}>
                View, edit or change status
              </Text>
            </View>
          )}

          <View
            style={[
              styles.actionsRow,
              is320Mobile && styles.actionsRow320,
            ]}
          >
            <IconAction
              accessibilityLabel={`View ${salon.name || "salon"}`}
              onPress={onView}
              backgroundColor={COLORS.blueBg}
              borderColor="#BAE6FD"
              icon={<Eye size={16} color={COLORS.blue} />}
            />
            <IconAction
              accessibilityLabel={`Edit ${salon.name || "salon"}`}
              onPress={onEdit}
              backgroundColor={COLORS.violetBg}
              borderColor="#DDD6FE"
              icon={<Edit3 size={16} color={COLORS.primary} />}
            />
            <IconAction
              accessibilityLabel={
                active
                  ? `Deactivate ${salon.name || "salon"}`
                  : `Activate ${salon.name || "salon"}`
              }
              onPress={onStatus}
              disabled={statusLoading}
              backgroundColor={
                active ? COLORS.amberBg : COLORS.greenBg
              }
              borderColor={
                active ? "#FDE68A" : "#A7F3D0"
              }
              icon={
                statusLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      active ? COLORS.amber : COLORS.green
                    }
                  />
                ) : (
                  <Power
                    size={16}
                    color={
                      active ? COLORS.amber : COLORS.green
                    }
                  />
                )
              }
            />
            <IconAction
              accessibilityLabel={`Delete ${salon.name || "salon"}`}
              onPress={onDelete}
              disabled={deleteLoading}
              backgroundColor={COLORS.redBg}
              borderColor="#FECDD3"
              icon={
                deleteLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.red}
                  />
                ) : (
                  <Trash2 size={16} color={COLORS.red} />
                )
              }
            />
          </View>

          {is320Mobile && (
            <View style={styles.manageTextWrap320}>
              <Text style={styles.manageTitle}>MANAGE SALON</Text>
              <Text style={styles.manageSubtitle}>
                View, edit or change status
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const ViewSalonModal = ({
  visible,
  salon,
  onClose,
  onEdit,
}) => {
  if (!salon) return null;

  const workingHours = Array.isArray(salon.workingHours)
    ? salon.workingHours
    : [];

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

        <View style={styles.largeModal}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderText}>
              <View style={styles.modalEyebrow}>
                <Building2 size={12} color={COLORS.primary} />
                <Text style={styles.modalEyebrowText}>
                  SALON DETAILS
                </Text>
              </View>
              <Text style={styles.modalTitle}>
                {salon.name || "Salon Details"}
              </Text>
              <Text style={styles.modalSubtitle}>
                Complete salon information and availability
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.modalClose}
            >
              <X size={18} color="#64748B" />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileHero}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {getInitial(salon.name)}
                </Text>
              </View>

              <View style={styles.profileText}>
                <Text style={styles.profileName}>
                  {salon.name || "Unnamed Salon"}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    salon.isActive
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                >
                  {salon.isActive ? (
                    <CheckCircle2
                      size={12}
                      color={COLORS.green}
                    />
                  ) : (
                    <XCircle size={12} color={COLORS.red} />
                  )}
                  <Text
                    style={[
                      styles.statusText,
                      salon.isActive
                        ? { color: COLORS.green }
                        : { color: COLORS.red },
                    ]}
                  >
                    {salon.isActive ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            </View>

            <SectionTitle
              title="Salon Information"
              subtitle="Core business and contact details"
            />

            <View style={styles.detailGrid}>
              {[
                ["Owner", salon.owner?.name],
                ["Owner Email", salon.owner?.email],
                ["Phone", salon.phone],
                ["Email", salon.email],
                ["City", salon.city],
                ["Address", salon.address],
                ["Location", salon.location],
                [
                  "Images",
                  `${salon.images?.length || 0} image${
                    (salon.images?.length || 0) !== 1 ? "s" : ""
                  }`,
                ],
              ].map(([label, value]) => (
                <View key={label} style={styles.detailBox}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>
                    {value || "N/A"}
                  </Text>
                </View>
              ))}
            </View>

            {salon.description ? (
              <View style={styles.descriptionBox}>
                <Text style={styles.detailLabel}>DESCRIPTION</Text>
                <Text style={styles.descriptionText}>
                  {salon.description}
                </Text>
              </View>
            ) : null}

            <View style={styles.locationHero}>
              <View style={styles.locationHeroHeader}>
                <Navigation
                  size={17}
                  color={COLORS.primary}
                />
                <Text style={styles.locationHeroTitle}>
                  SALON LOCATION
                </Text>
              </View>
              <Text style={styles.locationHeroText}>
                {salon.location || "Location not provided"}
              </Text>
            </View>

            <SectionTitle
              icon={
                <Clock3
                  size={17}
                  color={COLORS.primary}
                />
              }
              title="Working Hours"
              subtitle="Weekly opening schedule"
            />

            <View style={styles.hoursGrid}>
              {DAYS.map((day) => {
                const hour = workingHours.find(
                  (item) =>
                    String(item?.day).toUpperCase() === day
                );

                return (
                  <View key={day} style={styles.viewHourRow}>
                    <Text style={styles.viewHourDay}>
                      {formatDay(day)}
                    </Text>

                    {hour?.isOpen ? (
                      <View style={styles.openTimeBadge}>
                        <Text style={styles.openTimeText}>
                          {hour.openTime || "--:--"} -{" "}
                          {hour.closeTime || "--:--"}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedText}>
                          Closed
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <SectionTitle
              icon={
                <ImagePlus
                  size={17}
                  color={COLORS.primary}
                />
              }
              title="Salon Images"
              subtitle={`${salon.images?.length || 0} image${
                (salon.images?.length || 0) !== 1 ? "s" : ""
              }`}
            />

            {salon.images?.length ? (
              <View style={styles.imageGrid}>
                {salon.images.map((image, index) => (
                  <View
                    key={`${image}-${index}`}
                    style={styles.imageTile}
                  >
                    <Image
                      source={{ uri: getImageUrl(image) }}
                      style={styles.imageFill}
                      resizeMode="cover"
                    />
                    <View style={styles.imageIndex}>
                      <Text style={styles.imageIndexText}>
                        Image {index + 1}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyImages}>
                <ImagePlus size={24} color="#94A3B8" />
                <Text style={styles.emptyImagesText}>
                  No salon images available
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <GlassButton
              label="Close"
              onPress={onClose}
              fullWidth={!isWeb}
            />
            <GlassButton
              label="Edit Salon"
              tone="primary"
              icon={<Edit3 size={16} color="#FFFFFF" />}
              onPress={() => {
                onClose();
                onEdit();
              }}
              fullWidth={!isWeb}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const EditSalonModal = ({
  visible,
  salon,
  formData,
  setFormData,
  selectedImages,
  existingImages,
  updateLoading,
  onClose,
  onSave,
  onPickImages,
  onClearNewImages,
  onRemoveNewImage,
  onOpenTimePicker,
}) => {
  const { width: editScreenWidth } = useWindowDimensions();
  const isMobile = editScreenWidth < 600;

  if (!salon) return null;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateWorkingHour = (day, field, value) => {
    setFormData((prev) => ({
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

  const toggleWorkingHour = (day) => {
    setFormData((prev) => {
      const current =
        prev.workingHours?.[day] || {
          isOpen: false,
          openTime: "",
          closeTime: "",
        };

      const nextIsOpen = !current.isOpen;

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: {
            ...current,
            isOpen: nextIsOpen,
            openTime: nextIsOpen
              ? current.openTime || "09:00"
              : "",
            closeTime: nextIsOpen
              ? current.closeTime || "18:00"
              : "",
          },
        },
      };
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={updateLoading ? undefined : onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={updateLoading ? undefined : onClose}
        />

        <View style={styles.largeModal}>
          <KeyboardAvoidingView
            behavior={
              Platform.OS === "ios" ? "padding" : undefined
            }
            style={styles.keyboardContainer}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <View style={styles.modalEyebrow}>
                  <Edit3 size={12} color={COLORS.primary} />
                  <Text style={styles.modalEyebrowText}>
                    EDIT MODE
                  </Text>
                </View>
                <Text style={styles.modalTitle}>
                  Edit Salon
                </Text>
                <Text style={styles.modalSubtitle}>
                  Update salon information, working hours and images.
                </Text>
              </View>

              <Pressable
                disabled={updateLoading}
                onPress={onClose}
                style={[
                  styles.modalClose,
                  updateLoading && { opacity: 0.45 },
                ]}
              >
                <X size={18} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.editContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <SectionTitle
                title="Basic Information"
                subtitle="Keep the salon profile complete and accurate"
              />

              <View style={styles.formGrid}>
                <View style={styles.formFull}>
                  <Field
                    label="Salon Name"
                    value={formData.name}
                    onChangeText={(value) =>
                      updateField("name", value)
                    }
                    required
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formFull}>
                  <Field
                    label="Description"
                    value={formData.description}
                    onChangeText={(value) =>
                      updateField("description", value)
                    }
                    multiline
                    numberOfLines={4}
                    placeholder="Describe the salon..."
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formHalf}>
                  <Field
                    label="Phone"
                    value={formData.phone}
                    onChangeText={(value) =>
                      updateField("phone", value)
                    }
                    keyboardType="phone-pad"
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formHalf}>
                  <Field
                    label="Email"
                    value={formData.email}
                    onChangeText={(value) =>
                      updateField("email", value)
                    }
                    keyboardType="email-address"
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formHalf}>
                  <Field
                    label="City"
                    value={formData.city}
                    onChangeText={(value) =>
                      updateField("city", value)
                    }
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formHalf}>
                  <Field
                    label="Address"
                    value={formData.address}
                    onChangeText={(value) =>
                      updateField("address", value)
                    }
                    editable={!updateLoading}
                  />
                </View>

                <View style={styles.formFull}>
                  <Field
                    label="Location"
                    value={formData.location}
                    onChangeText={(value) =>
                      updateField("location", value)
                    }
                    placeholder="Enter salon location or Google Maps link"
                    editable={!updateLoading}
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <SectionTitle
                icon={
                  <Clock3
                    size={17}
                    color={COLORS.primary}
                  />
                }
                title="Working Hours"
                subtitle="Every day is independently configurable"
              />

              <View style={styles.hoursEditor}>
                {DAYS.map((day) => {
                  const current =
                    formData.workingHours?.[day] ||
                    {
                      isOpen: false,
                      openTime: "",
                      closeTime: "",
                    };

                  return (
                    <View
                      key={day}
                      style={styles.hourEditorCard}
                    >
                      <View style={styles.hourDayHeader}>
                        <View style={styles.dayIdentity}>
                          <View style={styles.dayDot} />
                          <Text style={styles.hourDayName}>
                            {formatDay(day)}
                          </Text>
                        </View>

                        <View style={styles.switchWrap}>
                          <Text
                            style={[
                              styles.switchText,
                              current.isOpen
                                ? { color: COLORS.green }
                                : { color: COLORS.red },
                            ]}
                          >
                            {current.isOpen ? "Open" : "Closed"}
                          </Text>
                          <Switch
                            value={Boolean(current.isOpen)}
                            onValueChange={() =>
                              toggleWorkingHour(day)
                            }
                            disabled={updateLoading}
                            trackColor={{
                              false: "#E2E8F0",
                              true: "#A7F3D0",
                            }}
                            thumbColor={
                              current.isOpen
                                ? COLORS.green
                                : "#FFFFFF"
                            }
                          />
                        </View>
                      </View>

                      {current.isOpen ? (
                        <View style={styles.timeGrid}>
                          <View style={styles.timeField}>
                            <Text style={styles.timeFieldLabel}>
                              OPENS
                            </Text>
                            <Pressable
                              disabled={updateLoading}
                              onPress={() =>
                                onOpenTimePicker(
                                  day,
                                  "openTime",
                                  current.openTime || "09:00"
                                )
                              }
                              style={styles.timeSelect}
                            >
                              <Clock3
                                size={15}
                                color={COLORS.primary}
                              />
                              <Text style={styles.timeSelectText}>
                                {current.openTime || "09:00"}
                              </Text>
                              <ChevronDown
                                size={15}
                                color="#94A3B8"
                              />
                            </Pressable>
                          </View>

                          <View style={styles.timeField}>
                            <Text style={styles.timeFieldLabel}>
                              CLOSES
                            </Text>
                            <Pressable
                              disabled={updateLoading}
                              onPress={() =>
                                onOpenTimePicker(
                                  day,
                                  "closeTime",
                                  current.closeTime || "18:00"
                                )
                              }
                              style={styles.timeSelect}
                            >
                              <Clock3
                                size={15}
                                color={COLORS.primary}
                              />
                              <Text style={styles.timeSelectText}>
                                {current.closeTime || "18:00"}
                              </Text>
                              <ChevronDown
                                size={15}
                                color="#94A3B8"
                              />
                            </Pressable>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.closedNotice}>
                          <XCircle size={14} color="#FB7185" />
                          <Text style={styles.closedNoticeText}>
                            Salon closed on this day
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <SectionTitle
                icon={
                  <ImagePlus
                    size={17}
                    color={COLORS.primary}
                  />
                }
                title="Salon Images"
                subtitle="Up to 10 images · Maximum 5 MB each"
              />

              <Pressable
                disabled={updateLoading}
                onPress={onPickImages}
                style={[
                  styles.uploadZone,
                  updateLoading && { opacity: 0.5 },
                ]}
              >
                <View style={styles.uploadIcon}>
                  <Upload size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.uploadTitle}>
                  Choose salon images
                </Text>
                <Text style={styles.uploadSubtitle}>
                  Select multiple images from your device
                </Text>
                <View style={styles.uploadPill}>
                  <Text style={styles.uploadPillText}>
                    MAX 10 • 5 MB / IMAGE
                  </Text>
                </View>
              </Pressable>

              {existingImages?.length ? (
                <View style={styles.imageSection}>
                  <View style={styles.imageSectionHeader}>
                    <Text style={styles.imageSectionTitle}>
                      CURRENT IMAGES
                    </Text>
                    <View style={styles.countPill}>
                      <Text style={styles.countPillText}>
                        {existingImages.length} images
                      </Text>
                    </View>
                  </View>

                  <View style={styles.imageGrid}>
                    {existingImages.map((image, index) => (
                      <View
                        key={`${image}-${index}`}
                        style={styles.imageTile}
                      >
                        <Image
                          source={{
                            uri: getImageUrl(image),
                          }}
                          style={styles.imageFill}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {selectedImages?.length ? (
                <View style={styles.imageSection}>
                  <View style={styles.imageSectionHeader}>
                    <Text
                      style={[
                        styles.imageSectionTitle,
                        { color: COLORS.primary },
                      ]}
                    >
                      NEW IMAGES
                    </Text>
                    <Pressable
                      disabled={updateLoading}
                      onPress={onClearNewImages}
                      style={styles.clearImagesButton}
                    >
                      <X size={13} color={COLORS.red} />
                      <Text style={styles.clearImagesText}>
                        Clear
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.imageGrid}>
                    {selectedImages.map((asset, index) => (
                      <View
                        key={`${asset.uri}-${index}`}
                        style={[
                          styles.imageTile,
                          {
                            borderColor: "#C4B5FD",
                            backgroundColor: "#F5F3FF",
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: asset.uri }}
                          style={styles.imageFill}
                          resizeMode="cover"
                        />
                        <View style={styles.newImageBadge}>
                          <Text style={styles.newImageBadgeText}>
                            New
                          </Text>
                        </View>
                        <Pressable
                          disabled={updateLoading}
                          onPress={() =>
                            onRemoveNewImage(index)
                          }
                          style={styles.removeImageButton}
                        >
                          <X size={14} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    ))}
                  </View>

                  <View style={styles.warningBox}>
                    <Text style={styles.warningEmoji}>!</Text>
                    <Text style={styles.warningText}>
                      Selecting new images will replace the current
                      salon images when you save changes.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.noNewImages}>
                  <ImagePlus size={15} color="#94A3B8" />
                  <Text style={styles.noNewImagesText}>
                    No new images selected. Existing images will
                    remain unchanged.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <GlassButton
                label="Cancel"
                onPress={onClose}
                disabled={updateLoading}
                fullWidth={!isWeb}
              />
              <View
                style={isMobile ? styles.mobileRefreshWrap : undefined}
              >
                <GlassButton
                  label={
                  updateLoading ? "Updating..." : "Save Changes"
                }
                tone="primary"
                disabled={updateLoading}
                icon={
                  updateLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                  )
                }
                onPress={onSave}
                fullWidth={!isWeb}
              />
            </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const Salons = () => {
  const { width: screenWidth, height: screenHeight } =
    useWindowDimensions();

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedSalon, setSelectedSalon] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [statusLoading, setStatusLoading] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePickerLoading, setImagePickerLoading] =
    useState(false);

  const [timePicker, setTimePicker] = useState({
    visible: false,
    day: null,
    field: null,
    value: "09:00",
  });

  const [confirmState, setConfirmState] = useState({
    visible: false,
    type: null,
    salon: null,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    location: "",
    workingHours: createDefaultWorkingHours(),
  });

  const isSmallMobile = screenWidth < 380;
  const isTinyMobile = screenWidth < 350;
  const isMobile = screenWidth < 600;
  const isTablet = screenWidth >= 600 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  const contentMaxWidth = isDesktop ? 1500 : 100000;
  const horizontalPadding = isSmallMobile
    ? 10
    : isMobile
    ? 14
    : isTablet
    ? 20
    : 28;

  const fetchSalons = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await getAdminSalons();
      setSalons(response?.salons || []);
    } catch (error) {
      console.error("Failed to fetch salons:", error);
      Alert.alert(
        "Unable to load salons",
        error?.response?.data?.message ||
          "Failed to fetch salons. Please try again."
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalons(true);
  }, [fetchSalons]);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await getAdminSalons();
      setSalons(response?.salons || []);
    } catch (error) {
      console.error("Refresh failed:", error);
      Alert.alert(
        "Refresh failed",
        error?.response?.data?.message ||
          "Failed to refresh salons."
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredSalons = useMemo(() => {
    const value = search.trim().toLowerCase();

    return salons.filter((salon) => {
      const matchesSearch =
        !value ||
        salon.name?.toLowerCase().includes(value) ||
        salon.city?.toLowerCase().includes(value) ||
        salon.owner?.name?.toLowerCase().includes(value) ||
        salon.owner?.email?.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && salon.isActive) ||
        (statusFilter === "INACTIVE" && !salon.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [salons, search, statusFilter]);

  const totalSalons = salons.length;
  const activeSalons = salons.filter(
    (salon) => salon.isActive
  ).length;
  const inactiveSalons = salons.filter(
    (salon) => !salon.isActive
  ).length;

  const handleView = (salon) => {
    setSelectedSalon(salon);
    setShowViewModal(true);
  };

  const handleEdit = (salon) => {
    setSelectedSalon(salon);

    setFormData({
      name: salon.name || "",
      description: salon.description || "",
      phone: salon.phone || "",
      email: salon.email || "",
      address: salon.address || "",
      city: salon.city || "",
      location: salon.location || "",
      workingHours: normalizeWorkingHours(
        salon.workingHours
      ),
    });

    setSelectedImages([]);
    setShowEditModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  const closeEditModal = () => {
    if (updateLoading) return;
    setShowEditModal(false);
    setSelectedImages([]);
  };

  const openTimePicker = (day, field, value) => {
    setTimePicker({
      visible: true,
      day,
      field,
      value: value || "09:00",
    });
  };

  const closeTimePicker = () => {
    setTimePicker((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  const applySelectedTime = (value) => {
    if (!timePicker.day || !timePicker.field) return;

    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [timePicker.day]: {
          ...prev.workingHours[timePicker.day],
          [timePicker.field]: value,
        },
      },
    }));
  };

  const requestImagePermission = async () => {
    if (Platform.OS === "web") return true;

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow photo library access to select salon images."
      );
      return false;
    }

    return true;
  };

  const handlePickImages = async () => {
    if (imagePickerLoading || updateLoading) return;

    try {
      setImagePickerLoading(true);

      const allowed = await requestImagePermission();
      if (!allowed) return;

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: 10,
          quality: 0.9,
          exif: false,
        });

      if (result.canceled) return;

      const assets = result.assets || [];

      if (assets.length > 10) {
        Alert.alert(
          "Image limit",
          "You can select a maximum of 10 images."
        );
        return;
      }

      const oversized = assets.find(
        (asset) =>
          asset.fileSize && asset.fileSize > 5 * 1024 * 1024
      );

      if (oversized) {
        Alert.alert(
          "Image too large",
          "Each image should be less than 5 MB."
        );
        return;
      }

      setSelectedImages(assets);
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert(
        "Image selection failed",
        "Unable to select images. Please try again."
      );
    } finally {
      setImagePickerLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSalon?._id) return;

    if (!formData.name.trim()) {
      Alert.alert("Validation", "Salon name is required.");
      return;
    }

    try {
      setUpdateLoading(true);

      const data = buildMultipartFormData(
        formData,
        selectedImages
      );

      const response = await updateSalon(
        selectedSalon._id,
        data
      );

      setSalons((prev) =>
        prev.map((salon) =>
          salon._id === selectedSalon._id
            ? response.salon
            : salon
        )
      );

      setSelectedSalon(response.salon);
      setSelectedImages([]);
      setShowEditModal(false);

      Alert.alert(
        "Success",
        "Salon updated successfully."
      );
    } catch (error) {
      console.error("Failed to update salon:", error);
      Alert.alert(
        "Update failed",
        error?.response?.data?.message ||
          "Failed to update salon."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const executeStatusChange = async () => {
    const salon = confirmState.salon;
    if (!salon?._id) return;

    const activating = !salon.isActive;

    try {
      setStatusLoading(salon._id);

      const response = activating
        ? await activateSalon(salon._id)
        : await deactivateSalon(salon._id);

      setSalons((prev) =>
        prev.map((item) =>
          item._id === salon._id
            ? response.salon
            : item
        )
      );

      if (selectedSalon?._id === salon._id) {
        setSelectedSalon(response.salon);
      }

      setConfirmState({
        visible: false,
        type: null,
        salon: null,
      });
    } catch (error) {
      console.error("Status update failed:", error);
      Alert.alert(
        "Status update failed",
        error?.response?.data?.message ||
          "Failed to update salon status."
      );
    } finally {
      setStatusLoading(null);
    }
  };

  const executeDelete = async () => {
    const salon = confirmState.salon;
    if (!salon?._id) return;

    try {
      setDeleteLoading(salon._id);

      await deleteSalon(salon._id);

      setSalons((prev) =>
        prev.filter((item) => item._id !== salon._id)
      );

      if (selectedSalon?._id === salon._id) {
        setSelectedSalon(null);
      }

      setConfirmState({
        visible: false,
        type: null,
        salon: null,
      });

      Alert.alert(
        "Deleted",
        "Salon deleted successfully."
      );
    } catch (error) {
      console.error("Delete failed:", error);
      Alert.alert(
        "Delete failed",
        error?.response?.data?.message ||
          "Failed to delete salon."
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const requestStatusChange = (salon) => {
    setConfirmState({
      visible: true,
      type: "status",
      salon,
    });
  };

  const requestDelete = (salon) => {
    setConfirmState({
      visible: true,
      type: "delete",
      salon,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const stats = [
    {
      label: "Total Salons",
      value: totalSalons,
      icon: <Building2 size={21} color="#FFFFFF" />,
      iconBg: "#7C3AED",
      soft: "#F5F3FF",
    },
    {
      label: "Active Salons",
      value: activeSalons,
      icon: <CheckCircle2 size={21} color="#FFFFFF" />,
      iconBg: "#059669",
      soft: "#ECFDF5",
    },
    {
      label: "Inactive Salons",
      value: inactiveSalons,
      icon: <XCircle size={21} color="#FFFFFF" />,
      iconBg: "#E11D48",
      soft: "#FFF1F2",
    },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.pageContent,
          {
            paddingHorizontal: horizontalPadding,
            minHeight: screenHeight,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.pageInner,
            { maxWidth: contentMaxWidth },
          ]}
        >
          <View
            style={[
              styles.headerCard,
              isMobile && styles.headerCardMobile,
              isTinyMobile && styles.headerCardTinyMobile,
            ]}
          >
            <View style={styles.headerGlowOne} />
            <View style={styles.headerGlowTwo} />

            <View
              style={[
                styles.headerContent,
                isMobile && styles.headerContentMobile,
                isTinyMobile && styles.headerContentTinyMobile,
              ]}
            >
              <View
              style={[
                styles.headerIdentity,
                isTinyMobile && styles.headerIdentityTinyMobile,
              ]}
            >
                <View style={styles.headerIcon}>
                  <Building2
                    size={isSmallMobile ? 21 : 25}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={[
                    styles.headerText,
                    isTinyMobile && styles.headerTextTinyMobile,
                  ]}
                >
                  <View style={styles.adminPill}>
                    <View style={styles.adminDot} />
                    <Text style={styles.adminPillText}>
                      ADMINISTRATION
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.pageTitle,
                      isTinyMobile && styles.pageTitleTinyMobile,
                    ]}
                  >
                    Salon Management
                  </Text>

                  <Text
                    style={[
                      styles.pageSubtitle,
                      isTinyMobile && styles.pageSubtitleTinyMobile,
                    ]}
                  >
                    Manage salons, owners and salon availability
                    from one powerful workspace.
                  </Text>
                </View>
              </View>

              <View
                style={isMobile ? styles.mobileRefreshWrap : undefined}
              >
                <GlassButton
                  label={
                  refreshing ? "Refreshing..." : "Refresh"
                }
                disabled={refreshing}
                icon={
                  refreshing ? (
                    <ActivityIndicator
                      size="small"
                      color="#475569"
                    />
                  ) : (
                    <RefreshCw
                      size={17}
                      color="#475569"
                    />
                  )
                }
                  onPress={handleRefresh}
                />
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  isSmallMobile && styles.statCardSmall,
                ]}
              >
                <View
                  style={[
                    styles.statGlow,
                    { backgroundColor: stat.soft },
                  ]}
                />
                <View style={styles.statContent}>
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: stat.iconBg },
                    ]}
                  >
                    {stat.icon}
                  </View>
                  <View style={styles.statTextWrap}>
                    <Text style={styles.statLabel}>
                      {stat.label}
                    </Text>
                    <Text style={styles.statValue}>
                      {stat.value}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.filterCard,
              isMobile && styles.filterCardMobile,
            ]}
          >
            <View style={styles.searchWrap}>
              <Search
                size={18}
                color="#94A3B8"
                style={styles.searchIcon}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search salon, city or owner..."
                placeholderTextColor="#94A3B8"
                selectionColor={COLORS.primary}
                style={styles.searchInput}
                returnKeyType="search"
                clearButtonMode={
                  Platform.OS === "ios" ? "while-editing" : "never"
                }
              />
              {search ? (
                <Pressable
                  onPress={() => setSearch("")}
                  style={styles.searchClear}
                >
                  <X size={15} color="#64748B" />
                </Pressable>
              ) : null}
            </View>

            <View
              style={[
                styles.filterButtons,
                isMobile && styles.filterButtonsMobile,
              ]}
            >
              {[
                ["ALL", "All"],
                ["ACTIVE", "Active"],
                ["INACTIVE", "Inactive"],
              ].map(([value, label]) => {
                const selected = statusFilter === value;

                return (
                  <Pressable
                    key={value}
                    onPress={() => setStatusFilter(value)}
                    style={[
                      styles.filterButton,
                      isMobile && styles.filterButtonMobile,
                      selected &&
                        (value === "ALL"
                          ? styles.filterAllSelected
                          : value === "ACTIVE"
                          ? styles.filterActiveSelected
                          : styles.filterInactiveSelected),
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selected &&
                          styles.filterButtonTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderText}>
                <View style={styles.allSalonsTitleRow}>
                  <View style={styles.purpleDot} />
                  <Text style={styles.allSalonsTitle}>
                    All Salons
                  </Text>
                </View>

                <Text style={styles.resultText}>
                  {filteredSalons.length} salon
                  {filteredSalons.length !== 1 ? "s" : ""} found
                </Text>
              </View>

              <View style={styles.resultStatusPill}>
                <Text style={styles.resultStatusText}>
                  {statusFilter === "ALL"
                    ? "All Status"
                    : statusFilter}
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingState}>
                <View style={styles.loadingIcon}>
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.loadingTitle}>
                  Loading salons...
                </Text>
                <Text style={styles.loadingSubtitle}>
                  Please wait while we fetch the latest data
                </Text>
              </View>
            ) : filteredSalons.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Building2 size={30} color="#8B5CF6" />
                </View>
                <Text style={styles.emptyTitle}>
                  No salons found
                </Text>
                <Text style={styles.emptyText}>
                  Try changing your search keyword or selected
                  status filter.
                </Text>
                {(search || statusFilter !== "ALL") ? (
                  <GlassButton
                    label="Clear Filters"
                    tone="primary"
                    onPress={clearFilters}
                  />
                ) : null}
              </View>
            ) : (
              <View style={styles.cardsGrid}>
                {filteredSalons.map((salon) => (
                  <View
                    key={salon._id}
                    style={[
                      styles.cardColumn,
                      isSmallMobile && styles.cardColumnSmall,
                    ]}
                  >
                    <SalonCard
                      salon={salon}
                      onView={() => handleView(salon)}
                      onEdit={() => handleEdit(salon)}
                      onStatus={() =>
                        requestStatusChange(salon)
                      }
                      onDelete={() => requestDelete(salon)}
                      statusLoading={
                        statusLoading === salon._id
                      }
                      deleteLoading={
                        deleteLoading === salon._id
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <ViewSalonModal
        visible={showViewModal}
        salon={selectedSalon}
        onClose={closeViewModal}
        onEdit={() => {
          if (selectedSalon) handleEdit(selectedSalon);
        }}
      />

      <EditSalonModal
        visible={showEditModal}
        salon={selectedSalon}
        formData={formData}
        setFormData={setFormData}
        selectedImages={selectedImages}
        existingImages={selectedSalon?.images || []}
        updateLoading={updateLoading}
        onClose={closeEditModal}
        onSave={handleSave}
        onPickImages={handlePickImages}
        onClearNewImages={() => setSelectedImages([])}
        onRemoveNewImage={(index) =>
          setSelectedImages((prev) =>
            prev.filter((_, i) => i !== index)
          )
        }
        onOpenTimePicker={openTimePicker}
      />

      <TimePickerModal
        visible={timePicker.visible}
        title={
          timePicker.field === "closeTime"
            ? "Select closing time"
            : "Select opening time"
        }
        value={timePicker.value}
        onClose={closeTimePicker}
        onSelect={applySelectedTime}
      />

      <ConfirmModal
        visible={confirmState.visible}
        title={
          confirmState.type === "delete"
            ? "Delete salon?"
            : confirmState.salon?.isActive
            ? "Deactivate salon?"
            : "Activate salon?"
        }
        message={
          confirmState.type === "delete"
            ? `Are you sure you want to permanently delete "${
                confirmState.salon?.name || "this salon"
              }"? This action cannot be undone.`
            : `${
                confirmState.salon?.isActive
                  ? "Deactivate"
                  : "Activate"
              } "${
                confirmState.salon?.name || "this salon"
              }"?`
        }
        confirmLabel={
          confirmState.type === "delete"
            ? "Delete Salon"
            : confirmState.salon?.isActive
            ? "Deactivate"
            : "Activate"
        }
        danger={confirmState.type === "delete"}
        loading={
          confirmState.type === "delete"
            ? Boolean(deleteLoading)
            : Boolean(statusLoading)
        }
        onCancel={() =>
          setConfirmState({
            visible: false,
            type: null,
            salon: null,
          })
        }
        onConfirm={
          confirmState.type === "delete"
            ? executeDelete
            : executeStatusChange
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scroll: {
    flex: 1,
  },

  pageContent: {
    paddingTop: 12,
    paddingBottom: 36,
  },

  pageInner: {
    width: "100%",
    alignSelf: "center",
  },


  headerCardMobile: {
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  headerCardTinyMobile: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },

  headerContentMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  headerContentTinyMobile: {
    gap: 12,
  },

  mobileRefreshWrap: {
    width: "100%",
  },

  filterCardMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  filterButtonsMobile: {
    width: "100%",
    flexShrink: 1,
  },

  filterButtonMobile: {
    flex: 1,
    minWidth: 0,
  },

  headerCard: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 16,
    shadowColor: "#1E233C",
    shadowOpacity: 0.08,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 4,
  },

  headerGlowOne: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -80,
    top: -90,
    backgroundColor: "rgba(139,92,246,0.12)",
  },

  headerGlowTwo: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    left: "32%",
    bottom: -110,
    backgroundColor: "rgba(217,70,239,0.08)",
  },

  headerContent: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  headerIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  headerIdentityTinyMobile: {
    width: "100%",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 11,
  },

  headerIcon: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  headerTextTinyMobile: {
    width: "100%",
    flex: 0,
  },

  adminPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    marginBottom: 7,
  },

  adminDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },

  adminPillText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  pageTitle: {
    color: "#020617",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.6,
    flexShrink: 1,
  },

  pageSubtitle: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    maxWidth: 700,
    flexShrink: 1,
  },

  pageTitleTinyMobile: {
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: -1.15,
    maxWidth: "100%",
  },

  pageSubtitleTinyMobile: {
    fontSize: 12,
    lineHeight: 18,
    maxWidth: "100%",
  },

  glassButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  fullWidth: {
    flex: 1,
  },

  glassButtonText: {
    fontSize: 13,
    fontWeight: "900",
    flexShrink: 1,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 260,
    minHeight: 106,
    overflow: "hidden",
    position: "relative",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 18,
    shadowColor: "#1E233C",
    shadowOpacity: 0.065,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 9 },
    elevation: 3,
  },

  statCardSmall: {
    minWidth: "100%",
    flexBasis: "100%",
  },

  statGlow: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    right: -38,
    top: -42,
    opacity: 0.9,
  },

  statContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  statIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  statTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    flexShrink: 1,
  },

  statValue: {
    marginTop: 5,
    color: "#020617",
    fontSize: 30,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -1.5,
  },

  filterCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor: "rgba(255,255,255,0.96)",
    padding: 14,
    marginBottom: 16,
    shadowColor: "#1E233C",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 9 },
    elevation: 3,
  },

  searchWrap: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
  },

  searchIcon: {
    marginLeft: 14,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingHorizontal: 10,
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  searchClear: {
    width: 32,
    height: 32,
    marginRight: 6,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
  },

  filterButtons: {
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },

  filterButton: {
    minWidth: 84,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  filterAllSelected: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },

  filterActiveSelected: {
    backgroundColor: COLORS.green,
    borderColor: COLORS.green,
  },

  filterInactiveSelected: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },

  filterButtonText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "900",
  },

  filterButtonTextSelected: {
    color: "#FFFFFF",
  },

  mainCard: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#1E233C",
    shadowOpacity: 0.075,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 13 },
    elevation: 4,
  },

  sectionHeader: {
    minHeight: 78,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  sectionHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  allSalonsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  purpleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  allSalonsTitle: {
    color: "#020617",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    flexShrink: 1,
  },

  resultText: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },

  resultStatusPill: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
  },

  resultStatusText: {
    color: "#64748B",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    padding: 14,
  },

  cardColumn: {
    flexGrow: 1,
    flexBasis: "31.5%",
    minWidth: 300,
  },

  cardColumnSmall: {
    flexBasis: "100%",
    minWidth: "100%",
  },

  salonCard: {
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOpacity: 0.055,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  cardGlowTop: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 63,
    right: -45,
    top: -50,
    backgroundColor: "rgba(139,92,246,0.09)",
  },

  cardGlowBottom: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 63,
    left: -45,
    bottom: -60,
    backgroundColor: "rgba(217,70,239,0.055)",
  },

  cardHeader: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  cardHeader320: {
    gap: 10,
    padding: 14,
  },

  avatar: {
    width: 50,
    height: 50,
    flexShrink: 0,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: "#F5F3FF",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  cardNameWrap: {
    flex: 1,
    minWidth: 0,
  },

  cardNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  cardNameRow320: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 5,
  },

  cardNameTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  cardNameTextWrap320: {
    width: "100%",
    flex: 0,
    minWidth: 0,
  },

  cardSalonName: {
    color: "#0F172A",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    flexShrink: 1,
  },

  cardSalonName320: {
    flexShrink: 1,
    ...(isWeb
      ? {
          whiteSpace: "normal",
          wordBreak: "normal",
          overflowWrap: "normal",
        }
      : {}),
  },

  salonTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  salonType: {
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },

  statusBadge: {
    flexShrink: 0,
    maxWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusBadge320: {
    maxWidth: "100%",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  statusActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: "#A7F3D0",
  },

  statusInactive: {
    backgroundColor: COLORS.redBg,
    borderColor: "#FECDD3",
  },

  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    flexShrink: 1,
  },

  cardBody: {
    position: "relative",
    padding: 17,
  },

  ownerBox: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  ownerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  smallIconBox: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  smallSectionLabel: {
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
    flexShrink: 1,
  },

  ownerName: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    flexShrink: 1,
  },

  ownerEmail: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
    ...(isWeb ? { overflowWrap: "anywhere" } : {}),
  },

  locationBox: {
    marginTop: 10,
    minWidth: 0,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    backgroundColor: "#FFFFFF",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  locationTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  locationCity: {
    marginTop: 5,
    color: "#334155",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
    flexShrink: 1,
  },

  locationAddress: {
    marginTop: 2,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
    ...(isWeb ? { overflowWrap: "anywhere" } : {}),
  },

  contactStack: {
    marginTop: 10,
    gap: 8,
  },

  infoRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    backgroundColor: "#F8FAFC",
  },

  infoIcon: {
    width: 28,
    height: 28,
    flexShrink: 0,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  infoTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  infoValue: {
    marginTop: 2,
    color: "#475569",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "800",
    flexShrink: 1,
    ...(isWeb ? { overflowWrap: "anywhere" } : {}),
  },

  quickInfo: {
    marginTop: 10,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF5FF",
  },

  quickInfoText: {
    color: COLORS.primary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
    flexShrink: 1,
  },

  cardActions: {
    minWidth: 0,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  cardActions320: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    gap: 9,
  },

  manageTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  manageTextWrap320: {
    width: "100%",
    flex: 0,
    minWidth: 0,
  },

  manageTitle: {
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  manageSubtitle: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    flexShrink: 1,
  },

  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  actionsRow320: {
    width: "100%",
    justifyContent: "flex-end",
  },

  iconAction: {
    width: 35,
    height: 35,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  loadingState: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 70,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loadingTitle: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "900",
  },

  loadingSubtitle: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyState: {
    minHeight: 340,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#334155",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    maxWidth: 420,
    marginTop: 5,
    marginBottom: 16,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "600",
    textAlign: "center",
    flexShrink: 1,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.66)",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },

  largeModal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "96%",
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    shadowColor: "#020617",
    shadowOpacity: 0.28,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 22 },
    elevation: 16,
  },

  keyboardContainer: {
    flex: 1,
    minHeight: 0,
  },

  modalHeader: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    backgroundColor: "#FAF7FF",
  },

  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  modalEyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FFFFFF",
    marginBottom: 7,
  },

  modalEyebrowText: {
    color: COLORS.primary,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 1.05,
  },

  modalTitle: {
    color: "#020617",
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    letterSpacing: -0.8,
    flexShrink: 1,
  },

  modalSubtitle: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 10,
    lineHeight: 17,
    fontWeight: "600",
    flexShrink: 1,
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalScroll: {
    flex: 1,
    minHeight: 0,
  },

  modalScrollContent: {
    padding: 18,
    paddingBottom: 26,
  },

  editContent: {
    padding: 18,
    paddingBottom: 30,
  },

  profileHero: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 17,
    marginBottom: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF7FF",
  },

  profileAvatar: {
    width: 62,
    height: 62,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    flexShrink: 0,
  },

  profileAvatarText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  profileText: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    color: "#0F172A",
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    flexShrink: 1,
  },

  sectionTitleWrap: {
    marginBottom: 11,
  },

  sectionTitleRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionAccent: {
    width: 4,
    height: 19,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },

  sectionTitle: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    flexShrink: 1,
  },

  sectionSubtitle: {
    marginTop: 4,
    marginLeft: 12,
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "600",
    flexShrink: 1,
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 18,
  },

  detailBox: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 260,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    padding: 13,
    shadowColor: "#0F172A",
    shadowOpacity: 0.025,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  detailLabel: {
    color: "#94A3B8",
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "900",
    letterSpacing: 0.95,
    flexShrink: 1,
  },

  detailValue: {
    marginTop: 5,
    color: "#475569",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "800",
    flexShrink: 1,
    ...(isWeb ? { overflowWrap: "anywhere" } : {}),
  },

  descriptionBox: {
    marginBottom: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  descriptionText: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
  },

  locationHero: {
    marginBottom: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF5FF",
    padding: 14,
  },

  locationHeroHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  locationHeroTitle: {
    color: COLORS.primary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  locationHeroText: {
    marginTop: 7,
    color: "#475569",
    fontSize: 11,
    lineHeight: 20,
    fontWeight: "700",
    flexShrink: 1,
  },

  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 19,
  },

  viewHourRow: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 260,
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  viewHourDay: {
    flex: 1,
    minWidth: 0,
    color: "#475569",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    flexShrink: 1,
  },

  openTimeBadge: {
    flexShrink: 0,
    maxWidth: "62%",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: COLORS.greenBg,
  },

  openTimeText: {
    color: COLORS.green,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    flexShrink: 1,
  },

  closedBadge: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: COLORS.redBg,
  },

  closedText: {
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "900",
  },

  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  imageTile: {
    flexGrow: 1,
    flexBasis: "31.5%",
    minWidth: 120,
    aspectRatio: 4 / 3,
    overflow: "hidden",
    position: "relative",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F1F5F9",
  },

  imageFill: {
    width: "100%",
    height: "100%",
  },

  imageIndex: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "rgba(2,6,23,0.62)",
  },

  imageIndexText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
  },

  emptyImages: {
    minHeight: 120,
    borderRadius: 17,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyImagesText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "700",
  },

  modalFooter: {
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "rgba(255,255,255,0.97)",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 9,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  formFull: {
    width: "100%",
  },

  formHalf: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 260,
  },

  field: {
    width: "100%",
  },

  fieldLabel: {
    marginBottom: 6,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  required: {
    color: COLORS.red,
  },

  input: {
    width: "100%",
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    ...(isWeb ? { outlineStyle: "none" } : {}),
  },

  textarea: {
    minHeight: 105,
    paddingTop: 12,
    paddingBottom: 12,
  },

  inputDisabled: {
    backgroundColor: "#F8FAFC",
    color: "#94A3B8",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEF2F7",
    marginVertical: 22,
  },

  hoursEditor: {
    gap: 10,
  },

  hourEditorCard: {
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    padding: 13,
  },

  hourDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  dayIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    flexShrink: 0,
  },

  hourDayName: {
    color: "#334155",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    flexShrink: 1,
  },

  switchWrap: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  switchText: {
    fontSize: 9,
    fontWeight: "900",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginTop: 12,
  },

  timeField: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 230,
  },

  timeFieldLabel: {
    marginBottom: 5,
    color: "#94A3B8",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  timeSelect: {
    width: "100%",
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  timeSelectText: {
    flex: 1,
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
  },

  closedNotice: {
    marginTop: 12,
    minHeight: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  closedNoticeText: {
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "800",
    flexShrink: 1,
  },

  uploadZone: {
    minHeight: 145,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#C4B5FD",
    backgroundColor: "#FAF7FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  uploadIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  uploadTitle: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },

  uploadSubtitle: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  uploadPill: {
    marginTop: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
  },

  uploadPillText: {
    color: COLORS.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  imageSection: {
    marginTop: 18,
  },

  imageSectionHeader: {
    minWidth: 0,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  imageSectionTitle: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
    flexShrink: 1,
  },

  countPill: {
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  countPillText: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "900",
  },

  clearImagesButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: COLORS.redBg,
  },

  clearImagesText: {
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "900",
  },

  newImageBadge: {
    position: "absolute",
    left: 8,
    bottom: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "rgba(124,58,237,0.92)",
  },

  newImageBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  removeImageButton: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "rgba(225,29,72,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  warningBox: {
    marginTop: 10,
    minWidth: 0,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#FDE68A",
    backgroundColor: COLORS.amberBg,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  warningEmoji: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#F59E0B",
    color: "#FFFFFF",
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "900",
    textAlign: "center",
    flexShrink: 0,
  },

  warningText: {
    flex: 1,
    color: "#B45309",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "800",
    flexShrink: 1,
  },

  noNewImages: {
    marginTop: 11,
    minWidth: 0,
    borderRadius: 13,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  noNewImagesText: {
    flex: 1,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  timeModal: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "88%",
    overflow: "hidden",
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    shadowColor: "#020617",
    shadowOpacity: 0.3,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 18 },
    elevation: 15,
  },

  timeList: {
    flexGrow: 0,
    minHeight: 120,
  },

  timeListContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 7,
  },

  timeOption: {
    width: "100%",
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  timeOptionSelected: {
    borderColor: "#C4B5FD",
    backgroundColor: "#F5F3FF",
  },

  timeOptionText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
  },

  timeOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: "900",
  },

  confirmModal: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    padding: 22,
    shadowColor: "#020617",
    shadowOpacity: 0.3,
    shadowRadius: 35,
    shadowOffset: { width: 0, height: 18 },
    elevation: 15,
  },

  confirmIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  confirmTitle: {
    color: "#0F172A",
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
  },

  confirmMessage: {
    marginTop: 7,
    color: "#64748B",
    fontSize: 11,
    lineHeight: 19,
    fontWeight: "600",
    flexShrink: 1,
  },

  confirmActions: {
    marginTop: 19,
    flexDirection: "row",
    gap: 9,
  },

  confirmPrimary: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  confirmPrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    flexShrink: 1,
  },
});

export default Salons;
