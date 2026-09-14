import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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

import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  getSalonOwners,
  createSalonOwner,
  updateSalonOwner,
  deleteSalonOwner,
  activateSalonOwner,
  deactivateSalonOwner,
} from "../../../../services/adminOwnerService";

/* ============================================================
   COLORS
============================================================ */

const COLORS = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFAFD",

  text: "#0F172A",
  textSecondary: "#475569",
  muted: "#94A3B8",
  mutedDark: "#64748B",

  border: "#E2E8F0",
  borderSoft: "#EEF2F7",

  violet: "#7C3AED",
  violetDark: "#5B21B6",
  violetSoft: "#F5F3FF",
  violetBorder: "#DDD6FE",

  emerald: "#059669",
  emeraldSoft: "#ECFDF5",
  emeraldBorder: "#A7F3D0",

  amber: "#D97706",
  amberSoft: "#FFFBEB",
  amberBorder: "#FDE68A",

  rose: "#E11D48",
  roseSoft: "#FFF1F2",
  roseBorder: "#FECDD3",

  slateDark: "#0F172A",
  slateMedium: "#334155",
};

/* ============================================================
   RESPONSIVE HELPERS
============================================================ */

const getHorizontalPadding = (width) => {
  if (width < 340) return 10;
  if (width < 380) return 12;
  if (width < 430) return 14;
  if (width < 600) return 16;
  if (width < 768) return 22;
  if (width < 1024) return 28;
  if (width < 1280) return 34;
  if (width < 1440) return 40;
  return 48;
};

const getContentMaxWidth = (width) => {
  if (width >= 1600) return 1480;
  if (width >= 1280) return 1400;
  return 1180;
};

const getInitial = (name) => {
  if (!name) return "S";

  return (
    name.trim().charAt(0).toUpperCase() || "S"
  );
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong"
) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

/* ============================================================
   ADMIN FOOTER
============================================================ */

const AdminFooter = ({ width }) => {
  const isCompact = width < 700;

  return (
    <View style={styles.footerOuter}>
      <View
        style={[
          styles.footer,
          {
            paddingHorizontal:
              width < 380
                ? 16
                : width < 600
                ? 20
                : 30,
          },
        ]}
      >
        <View
          style={[
            styles.footerTop,
            !isCompact && styles.footerTopDesktop,
          ]}
        >
          <View
            style={[
              styles.footerBrand,
              !isCompact &&
                styles.footerBrandDesktop,
            ]}
          >
            <View style={styles.footerLogo}>
              <MaterialCommunityIcons
                name="store-cog-outline"
                size={21}
                color="#FFFFFF"
              />
            </View>

            <View style={styles.footerBrandText}>
              <Text style={styles.footerBrandName}>
                LUMORA
              </Text>

              <Text
                style={styles.footerBrandDescription}
              >
                Smart salon management platform
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.footerLinks,
              !isCompact &&
                styles.footerLinksDesktop,
            ]}
          >
            <View style={styles.footerLinkBlock}>
              <Text style={styles.footerHeading}>
                PLATFORM
              </Text>

              <Text style={styles.footerLink}>
                Admin Management
              </Text>

              <Text style={styles.footerLink}>
                Salon Operations
              </Text>
            </View>

            <View style={styles.footerLinkBlock}>
              <Text style={styles.footerHeading}>
                SECURITY
              </Text>

              <Text style={styles.footerLink}>
                Secure Accounts
              </Text>

              <Text style={styles.footerLink}>
                Access Control
              </Text>
            </View>

            <View style={styles.footerLinkBlock}>
              <Text style={styles.footerHeading}>
                SUPPORT
              </Text>

              <Text style={styles.footerLink}>
                Account Help
              </Text>

              <Text style={styles.footerLink}>
                Management Support
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footerDivider} />

        <View
          style={[
            styles.footerBottom,
            !isCompact &&
              styles.footerBottomDesktop,
          ]}
        >
          <Text style={styles.footerCopyright}>
            © {new Date().getFullYear()} LUMORA. All rights reserved.
          </Text>

          <View
            style={[
              styles.footerLegal,
              !isCompact &&
                styles.footerLegalDesktop,
            ]}
          >
            <Text style={styles.footerLegalText}>
              Privacy
            </Text>

            <View style={styles.footerDot} />

            <Text style={styles.footerLegalText}>
              Terms
            </Text>

            <View style={styles.footerDot} />

            <Text style={styles.footerLegalText}>
              Admin Portal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

/* ============================================================
   STAT CARD
============================================================ */

const StatCard = ({
  label,
  value,
  description,
  icon,
  variant,
}) => {
  const variantStyles = {
    violet: {
      iconBackground: "#F5F3FF",
      iconColor: COLORS.violet,
      numberColor: COLORS.text,
      glow: "#DDD6FE",
    },

    emerald: {
      iconBackground: "#ECFDF5",
      iconColor: COLORS.emerald,
      numberColor: COLORS.emerald,
      glow: "#A7F3D0",
    },

    rose: {
      iconBackground: "#FFF1F2",
      iconColor: COLORS.rose,
      numberColor: COLORS.rose,
      glow: "#FECDD3",
    },
  };

  const current =
    variantStyles[variant] ||
    variantStyles.violet;

  return (
    <View style={styles.statCard}>
      <View
        style={[
          styles.statGlow,
          {
            backgroundColor: current.glow,
          },
        ]}
      />

      <View style={styles.statContent}>
        <View style={styles.statText}>
          <Text style={styles.statLabel}>
            {label}
          </Text>

          <Text
            style={[
              styles.statValue,
              {
                color: current.numberColor,
              },
            ]}
          >
            {value}
          </Text>

          <Text style={styles.statDescription}>
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.statIcon,
            {
              backgroundColor:
                current.iconBackground,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={current.iconColor}
          />
        </View>
      </View>
    </View>
  );
};

/* ============================================================
   OWNER CARD
============================================================ */

const OwnerCard = ({
  owner,
  onEdit,
  onToggle,
  onDelete,
  width,
}) => {
  const isSmall = width < 380;

  const salons = Array.isArray(owner?.salons)
    ? owner.salons
    : [];

  return (
    <View
      style={[
        styles.ownerCard,
        width < 600 &&
          styles.ownerCardMobile,
      ]}
    >
      <View style={styles.ownerCardGlow} />

      {/* HEADER */}

      <View style={styles.ownerHeader}>
        <View style={styles.ownerIdentity}>
          <View
            style={[
              styles.ownerAvatar,
              isSmall &&
                styles.ownerAvatarSmall,
            ]}
          >
            <Text
              style={[
                styles.ownerAvatarText,
                isSmall &&
                  styles.ownerAvatarTextSmall,
              ]}
            >
              {getInitial(owner?.name)}
            </Text>
          </View>

          <View style={styles.ownerIdentityText}>
            <Text
              style={styles.ownerName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {owner?.name || "Unnamed"}
            </Text>

            <Text style={styles.ownerRole}>
              SALON OWNER
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            owner?.isActive
              ? styles.statusActive
              : styles.statusInactive,
          ]}
        >
          <Ionicons
            name={
              owner?.isActive
                ? "checkmark-circle"
                : "close-circle"
            }
            size={13}
            color={
              owner?.isActive
                ? COLORS.emerald
                : COLORS.rose
            }
          />

          <Text
            style={[
              styles.statusText,
              {
                color: owner?.isActive
                  ? COLORS.emerald
                  : COLORS.rose,
              },
            ]}
          >
            {owner?.isActive
              ? "Active"
              : "Inactive"}
          </Text>
        </View>
      </View>

      {/* BODY */}

      <View style={styles.ownerBody}>
        {/* EMAIL */}

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="mail-outline"
              size={15}
              color={COLORS.violet}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              EMAIL ADDRESS
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={0}
            >
              {owner?.email ||
                "No email address"}
            </Text>
          </View>
        </View>

        {/* PHONE */}

        <View
          style={[
            styles.infoRow,
            styles.infoRowPhone,
          ]}
        >
          <View
            style={[
              styles.infoIcon,
              styles.infoIconNeutral,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={15}
              color={COLORS.mutedDark}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              PHONE NUMBER
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={0}
            >
              {owner?.phone ||
                "No phone number"}
            </Text>
          </View>
        </View>

        {/* SALONS */}

        <View style={styles.salonsBox}>
          <View style={styles.salonsHeader}>
            <View style={styles.salonsIcon}>
              <Ionicons
                name="business-outline"
                size={15}
                color={COLORS.violet}
              />
            </View>

            <View style={styles.salonsTitleWrap}>
              <Text style={styles.infoLabel}>
                ASSIGNED SALONS
              </Text>

              <Text style={styles.salonsCount}>
                {salons.length} salon
                {salons.length === 1
                  ? ""
                  : "s"}
              </Text>
            </View>
          </View>

          {salons.length > 0 ? (
            <View style={styles.salonList}>
              {salons.map((salon, index) => (
                <View
                  key={
                    salon?._id ||
                    `${salon?.name}-${index}`
                  }
                  style={styles.salonItem}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={14}
                    color={COLORS.violet}
                  />

                  <Text
                    style={styles.salonName}
                    numberOfLines={0}
                  >
                    {salon?.name ||
                      "Unnamed Salon"}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noSalonBox}>
              <Text style={styles.noSalonText}>
                No salon assigned
              </Text>
            </View>
          )}
        </View>

        {/* ACTIONS */}

        <View style={styles.ownerActions}>
          <Pressable
            onPress={() => onEdit(owner)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={16}
              color={COLORS.violet}
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onToggle(owner)}
            style={({ pressed }) => [
              styles.squareAction,
              owner?.isActive
                ? styles.pauseButton
                : styles.activateButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={
                owner?.isActive
                  ? "pause-circle-outline"
                  : "play-circle-outline"
              }
              size={18}
              color={
                owner?.isActive
                  ? COLORS.amber
                  : COLORS.emerald
              }
            />
          </Pressable>

          <Pressable
            onPress={() => onDelete(owner)}
            style={({ pressed }) => [
              styles.squareAction,
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={17}
              color={COLORS.rose}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

/* ============================================================
   FORM INPUT
============================================================ */

const FormInput = ({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  required,
}) => {
  return (
    <View style={styles.formField}>
      <Text style={styles.formLabel}>
        {label}
        {required ? " *" : ""}
      </Text>

      <View style={styles.inputShell}>
        <View style={styles.inputIcon}>
          <Ionicons
            name={icon}
            size={17}
            color={COLORS.mutedDark}
          />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A8B1C0"
          keyboardType={
            keyboardType || "default"
          }
          secureTextEntry={secureTextEntry}
          autoCapitalize={
            autoCapitalize || "sentences"
          }
          autoCorrect={false}
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

/* ============================================================
   STATUS FILTER MODAL
============================================================ */

const StatusFilterModal = ({
  visible,
  selected,
  onSelect,
  onClose,
}) => {
  const options = [
    {
      value: "ALL",
      label: "All Status",
      description:
        "Show all salon owner accounts",
      icon: "people-outline",
    },
    {
      value: "ACTIVE",
      label: "Active",
      description:
        "Show active accounts only",
      icon: "checkmark-circle-outline",
    },
    {
      value: "INACTIVE",
      label: "Inactive",
      description:
        "Show inactive accounts only",
      icon: "close-circle-outline",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />

        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <View
              style={styles.filterModalTitleWrap}
            >
              <View style={styles.filterModalIcon}>
                <Ionicons
                  name="funnel-outline"
                  size={18}
                  color={COLORS.violet}
                />
              </View>

              <View
                style={styles.filterModalTitleText}
              >
                <Text
                  style={styles.filterModalTitle}
                >
                  Filter accounts
                </Text>

                <Text
                  style={styles.filterModalSubtitle}
                >
                  Choose account status
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <Ionicons
                name="close"
                size={19}
                color={COLORS.mutedDark}
              />
            </Pressable>
          </View>

          <View style={styles.filterOptions}>
            {options.map((option) => {
              const active =
                selected === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.filterOption,
                    active &&
                      styles.filterOptionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.filterOptionIcon,
                      active &&
                        styles.filterOptionIconActive,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={
                        active
                          ? COLORS.violet
                          : COLORS.mutedDark
                      }
                    />
                  </View>

                  <View
                    style={styles.filterOptionText}
                  >
                    <Text
                      style={[
                        styles.filterOptionTitle,
                        active &&
                          styles.filterOptionTitleActive,
                      ]}
                    >
                      {option.label}
                    </Text>

                    <Text
                      style={
                        styles.filterOptionDescription
                      }
                    >
                      {option.description}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.radioOuter,
                      active &&
                        styles.radioOuterActive,
                    ]}
                  >
                    {active && (
                      <View
                        style={styles.radioInner}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ============================================================
   CREATE / EDIT MODAL
============================================================ */

const OwnerFormModal = ({
  visible,
  editingOwner,
  formData,
  setFormData,
  saving,
  onClose,
  onSubmit,
  width,
}) => {
  const isSmall = width < 380;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!saving) onClose();
      }}
    >
      <KeyboardAvoidingView
        style={styles.modalKeyboard}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              if (!saving) onClose();
            }}
          />

          <View
            style={[
              styles.ownerFormModal,
              {
                width:
                  width < 600
                    ? "94%"
                    : Math.min(
                        width - 70,
                        620
                      ),
                maxHeight:
                  width < 600
                    ? "92%"
                    : "88%",
              },
            ]}
          >
            <View style={styles.formModalHeader}>
              <View
                style={styles.formModalHeaderGlow}
              />

              <View
                style={styles.formModalTitleArea}
              >
                <View
                  style={styles.formModalIcon}
                >
                  <Ionicons
                    name={
                      editingOwner
                        ? "create-outline"
                        : "person-add-outline"
                    }
                    size={21}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={styles.formModalTitleText}
                >
                  <Text
                    style={[
                      styles.formModalTitle,
                      isSmall &&
                        styles.formModalTitleSmall,
                    ]}
                  >
                    {editingOwner
                      ? "Edit Salon Owner"
                      : "Add Salon Owner"}
                  </Text>

                  <Text
                    style={
                      styles.formModalSubtitle
                    }
                  >
                    {editingOwner
                      ? "Update owner account details"
                      : "Create a new salon owner account"}
                  </Text>
                </View>
              </View>

              <Pressable
                disabled={saving}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="close"
                  size={19}
                  color={COLORS.mutedDark}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.formScrollContent
              }
            >
              <FormInput
                label="Full Name"
                icon="person-outline"
                value={formData.name}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: value,
                  }))
                }
                placeholder="Enter full name"
                required
              />

              <FormInput
                label="Email Address"
                icon="mail-outline"
                value={formData.email}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: value,
                  }))
                }
                placeholder="owner@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <FormInput
                label="Phone Number"
                icon="call-outline"
                value={formData.phone}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: value,
                  }))
                }
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                autoCapitalize="none"
              />

              <FormInput
                label="Password"
                icon="lock-closed-outline"
                value={formData.password}
                onChangeText={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: value,
                  }))
                }
                placeholder={
                  editingOwner
                    ? "Leave empty to keep current password"
                    : "Enter password"
                }
                secureTextEntry
                autoCapitalize="none"
                required={!editingOwner}
              />

              {editingOwner && (
                <View style={styles.passwordHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={15}
                    color={COLORS.mutedDark}
                  />

                  <Text
                    style={
                      styles.passwordHintText
                    }
                  >
                    Leave this field empty if you
                    don't want to change the current
                    password.
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.formModalFooter}>
              <Pressable
                disabled={saving}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                  saving &&
                    styles.disabledButton,
                ]}
              >
                <Text
                  style={styles.cancelButtonText}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                disabled={saving}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressed,
                  saving &&
                    styles.disabledButton,
                ]}
              >
                {saving ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.submitButtonText
                      }
                    >
                      Saving...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="checkmark"
                      size={17}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.submitButtonText
                      }
                    >
                      {editingOwner
                        ? "Update Owner"
                        : "Create Owner"}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ============================================================
   CONFIRM ACTION MODAL
   WEB + ANDROID SAFE
============================================================ */

const ConfirmActionModal = ({
  visible,
  type,
  owner,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!owner) return null;

  const config = {
    activate: {
      title: "Activate salon owner?",
      description: `Are you sure you want to activate ${
        owner?.name || "this salon owner"
      }? This account will regain access.`,
      icon: "play-circle-outline",
      iconColor: COLORS.emerald,
      iconBackground: COLORS.emeraldSoft,
      buttonStyle:
        styles.confirmActivateButton,
      buttonText: "Activate",
    },

    deactivate: {
      title: "Deactivate salon owner?",
      description: `Are you sure you want to deactivate ${
        owner?.name || "this salon owner"
      }? This account will lose access.`,
      icon: "pause-circle-outline",
      iconColor: COLORS.amber,
      iconBackground: COLORS.amberSoft,
      buttonStyle:
        styles.confirmDeactivateButton,
      buttonText: "Deactivate",
    },

    delete: {
      title: "Delete salon owner?",
      description: `Are you sure you want to delete ${
        owner?.name || "this salon owner"
      }? This action cannot be undone.`,
      icon: "trash-outline",
      iconColor: COLORS.rose,
      iconBackground: COLORS.roseSoft,
      buttonStyle:
        styles.confirmDeleteButton,
      buttonText: "Delete",
    },
  };

  const current = config[type];

  if (!current) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (!loading) {
          onCancel();
        }
      }}
    >
      <View style={styles.confirmOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          disabled={loading}
          onPress={onCancel}
        />

        <View
          style={styles.confirmModal}
          onStartShouldSetResponder={() => true}
        >
          <View
            style={[
              styles.confirmIcon,
              {
                backgroundColor:
                  current.iconBackground,
              },
            ]}
          >
            <Ionicons
              name={current.icon}
              size={29}
              color={current.iconColor}
            />
          </View>

          <View style={styles.confirmContent}>
            <Text style={styles.confirmTitle}>
              {current.title}
            </Text>

            <Text
              style={styles.confirmDescription}
            >
              {current.description}
            </Text>
          </View>

          <View style={styles.confirmActions}>
            <Pressable
              disabled={loading}
              onPress={onCancel}
              style={({ pressed }) => [
                styles.confirmCancelButton,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
                  styles.disabledButton,
              ]}
            >
              <Text
                style={styles.confirmCancelText}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.confirmButton,
                current.buttonStyle,
                pressed &&
                  !loading &&
                  styles.pressed,
                loading &&
                  styles.disabledButton,
              ]}
            >
              {loading ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.confirmButtonText}
                  >
                    Processing...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name={current.icon}
                    size={16}
                    color="#FFFFFF"
                  />

                  <Text
                    style={styles.confirmButtonText}
                  >
                    {current.buttonText}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const SalonOwners = () => {
  const { width } = useWindowDimensions();

  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showFormModal, setShowFormModal] =
    useState(false);

  const [showFilterModal, setShowFilterModal] =
    useState(false);

  const [editingOwner, setEditingOwner] =
    useState(null);

  const [saving, setSaving] = useState(false);

  /* ==========================================================
     NEW ACTION STATE
  ========================================================== */

  const [actionLoading, setActionLoading] =
    useState(false);

  const [confirmModal, setConfirmModal] =
    useState({
      visible: false,
      type: null,
      owner: null,
    });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  /* ==========================================================
     RESPONSIVE VALUES
  ========================================================== */

  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isTablet =
    width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  const horizontalPadding =
    getHorizontalPadding(width);

  const contentMaxWidth =
    getContentMaxWidth(width);

  /* ==========================================================
     FETCH
  ========================================================== */

  const fetchSalonOwners = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const data = await getSalonOwners();

        setOwners(
          Array.isArray(data?.users)
            ? data.users
            : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch salon owners:",
          error
        );

        Alert.alert(
          "Unable to load",
          getErrorMessage(
            error,
            "Failed to fetch salon owners"
          )
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchSalonOwners();
  }, [fetchSalonOwners]);

  /* ==========================================================
     PULL TO REFRESH
  ========================================================== */

  const handleRefresh = useCallback(
    async () => {
      try {
        setRefreshing(true);

        const data = await getSalonOwners();

        setOwners(
          Array.isArray(data?.users)
            ? data.users
            : []
        );
      } catch (error) {
        console.error(error);

        Alert.alert(
          "Refresh failed",
          getErrorMessage(
            error,
            "Unable to refresh salon owners"
          )
        );
      } finally {
        setRefreshing(false);
      }
    },
    []
  );

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredOwners = useMemo(() => {
    const searchText =
      search.toLowerCase().trim();

    return owners.filter((owner) => {
      const salonNames = Array.isArray(
        owner?.salons
      )
        ? owner.salons
            .map((salon) => salon?.name)
            .filter(Boolean)
            .join(" ")
        : "";

      const searchableText = [
        owner?.name,
        owner?.email,
        owner?.phone,
        salonNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        searchableText.includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          owner?.isActive) ||
        (statusFilter === "INACTIVE" &&
          !owner?.isActive);

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [owners, search, statusFilter]);

  /* ==========================================================
     STATS
  ========================================================== */

  const totalOwners = owners.length;

  const activeOwners = owners.filter(
    (owner) => owner?.isActive
  ).length;

  const inactiveOwners =
    owners.length - activeOwners;

  /* ==========================================================
     FORM
  ========================================================== */

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
    });
  };

  const openCreateModal = () => {
    setEditingOwner(null);

    resetForm();

    setShowFormModal(true);
  };

  const openEditModal = (owner) => {
    setEditingOwner(owner);

    setFormData({
      name: owner?.name || "",
      email: owner?.email || "",
      phone: owner?.phone || "",
      password: "",
    });

    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setShowFormModal(false);
    setEditingOwner(null);

    resetForm();
  };

  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit = async () => {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;

    if (!name) {
      Alert.alert(
        "Missing information",
        "Please enter the owner's full name."
      );
      return;
    }

    if (!email) {
      Alert.alert(
        "Missing information",
        "Please enter the email address."
      );
      return;
    }

    if (
      !editingOwner &&
      !password.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Please enter a password."
      );
      return;
    }

    try {
      setSaving(true);

      if (editingOwner) {
        const updateData = {
          name,
          email,
          phone,
        };

        if (password.trim()) {
          updateData.password = password;
        }

        await updateSalonOwner(
          editingOwner._id,
          updateData
        );
      } else {
        await createSalonOwner({
          name,
          email,
          phone,
          password,
        });
      }

      setShowFormModal(false);
      setEditingOwner(null);
      resetForm();

      await fetchSalonOwners({
        showLoader: false,
      });

      Alert.alert(
        "Success",
        editingOwner
          ? "Salon owner updated successfully."
          : "Salon owner created successfully."
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Operation failed",
        getErrorMessage(
          error,
          "Unable to save salon owner"
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     OPEN STATUS CONFIRMATION
  ========================================================== */

  const handleToggleStatus = (owner) => {
    if (!owner?._id || actionLoading) {
      return;
    }

    setConfirmModal({
      visible: true,
      type: owner?.isActive
        ? "deactivate"
        : "activate",
      owner,
    });
  };

  /* ==========================================================
     OPEN DELETE CONFIRMATION
  ========================================================== */

  const handleDelete = (owner) => {
    if (!owner?._id || actionLoading) {
      return;
    }

    setConfirmModal({
      visible: true,
      type: "delete",
      owner,
    });
  };

  /* ==========================================================
     CLOSE CONFIRMATION
  ========================================================== */

  const closeConfirmModal = () => {
    if (actionLoading) return;

    setConfirmModal({
      visible: false,
      type: null,
      owner: null,
    });
  };

  /* ==========================================================
     EXECUTE CONFIRMED ACTION
  ========================================================== */

  const executeConfirmedAction =
    async () => {
      const {
        type,
        owner,
      } = confirmModal;

      if (
        !owner?._id ||
        !type ||
        actionLoading
      ) {
        return;
      }

      try {
        setActionLoading(true);

        /* ACTIVATE */

        if (type === "activate") {
          await activateSalonOwner(
            owner._id
          );
        }

        /* DEACTIVATE */

        if (type === "deactivate") {
          await deactivateSalonOwner(
            owner._id
          );
        }

        /* DELETE */

        if (type === "delete") {
          await deleteSalonOwner(
            owner._id
          );
        }

        /* REFRESH DATA */

        if (type === "delete") {
          setOwners((prev) =>
            prev.filter(
              (item) =>
                item?._id !== owner?._id
            )
          );
        } else {
          await fetchSalonOwners({
            showLoader: false,
          });
        }

        /* CLOSE MODAL */

        setConfirmModal({
          visible: false,
          type: null,
          owner: null,
        });

        /* SUCCESS */

        Alert.alert(
          "Success",
          type === "activate"
            ? "Salon owner activated successfully."
            : type === "deactivate"
            ? "Salon owner deactivated successfully."
            : "Salon owner deleted successfully."
        );
      } catch (error) {
        console.error(
          `Salon owner ${type} failed:`,
          error
        );

        setConfirmModal({
          visible: false,
          type: null,
          owner: null,
        });

        Alert.alert(
          "Operation failed",
          getErrorMessage(
            error,
            type === "delete"
              ? "Failed to delete salon owner."
              : "Failed to update salon owner status."
          )
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
  };

  const hasFilters =
    search.trim().length > 0 ||
    statusFilter !== "ALL";

  /* ==========================================================
     LOADING SCREEN
  ========================================================== */

  if (loading) {
    return (
      <View style={styles.root}>
        <ScrollView
          contentContainerStyle={[
            styles.loadingContainer,
            {
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          <View
            style={[
              styles.loadingCard,
              {
                maxWidth: contentMaxWidth,
              },
            ]}
          >
            <View style={styles.loadingIconBox}>
              <ActivityIndicator
                size="small"
                color={COLORS.violet}
              />
            </View>

            <Text style={styles.loadingTitle}>
              Loading salon owners...
            </Text>

            <Text
              style={styles.loadingSubtitle}
            >
              Please wait while we fetch the accounts
            </Text>
          </View>
        </ScrollView>

        <AdminFooter width={width} />
      </View>
    );
  }

  /* ==========================================================
     MAIN
  ========================================================== */

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.violet}
            colors={[COLORS.violet]}
          />
        }
      >
        <View
          style={[
            styles.pageContainer,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          {/* PAGE HEADER */}

          <View style={styles.heroCard}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View
              style={[
                styles.heroContent,
                isMobile &&
                  styles.heroContentMobile,
              ]}
            >
              <View style={styles.heroTitleArea}>
                <View
                  style={[
                    styles.heroIcon,
                    isSmallMobile &&
                      styles.heroIconSmall,
                  ]}
                >
                  <Ionicons
                    name="storefront-outline"
                    size={
                      isSmallMobile ? 22 : 25
                    }
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroTextArea}>
                  <Text
                    style={[
                      styles.heroTitle,
                      isSmallMobile &&
                        styles.heroTitleSmall,
                    ]}
                    numberOfLines={0}
                  >
                    Salon Owners
                  </Text>

                  <Text
                    style={styles.heroSubtitle}
                    numberOfLines={0}
                  >
                    Manage salon owners and their
                    account access
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={openCreateModal}
                style={({ pressed }) => [
                  styles.addButton,
                  isMobile &&
                    styles.addButtonMobile,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="add"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.addButtonText}
                >
                  Add Salon Owner
                </Text>
              </Pressable>
            </View>
          </View>

          {/* STATS */}

          <View
            style={[
              styles.statsGrid,
              isSmallMobile &&
                styles.statsGridSmall,
            ]}
          >
            <StatCard
              label="TOTAL OWNERS"
              value={totalOwners}
              description="Registered accounts"
              icon="people-outline"
              variant="violet"
            />

            <StatCard
              label="ACTIVE"
              value={activeOwners}
              description="Active accounts"
              icon="checkmark-circle-outline"
              variant="emerald"
            />

            <StatCard
              label="INACTIVE"
              value={inactiveOwners}
              description="Disabled accounts"
              icon="remove-circle-outline"
              variant="rose"
            />
          </View>

          {/* SEARCH / FILTER */}

          <View style={styles.filterCard}>
            <View
              style={[
                styles.filterRow,
                !isDesktop &&
                  styles.filterRowStacked,
              ]}
            >
              <View
                style={[
                  styles.searchShell,
                  isDesktop
                    ? styles.searchShellDesktop
                    : styles.searchShellFull,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={COLORS.muted}
                />

                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name, email, phone or salon..."
                  placeholderTextColor="#A8B1C0"
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  returnKeyType="search"
                />

                {search.length > 0 && (
                  <Pressable
                    onPress={() =>
                      setSearch("")
                    }
                    style={styles.searchClear}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color="#B8C0CC"
                    />
                  </Pressable>
                )}
              </View>

              <Pressable
                onPress={() =>
                  setShowFilterModal(true)
                }
                style={({ pressed }) => [
                  styles.statusSelect,
                  isDesktop
                    ? styles.statusSelectDesktop
                    : styles.statusSelectFull,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={styles.statusSelectLeft}
                >
                  <View
                    style={styles.statusSelectIcon}
                  >
                    <Ionicons
                      name="funnel-outline"
                      size={17}
                      color={COLORS.violet}
                    />
                  </View>

                  <View
                    style={
                      styles.statusSelectText
                    }
                  >
                    <Text
                      style={
                        styles.statusSelectLabel
                      }
                    >
                      STATUS
                    </Text>

                    <Text
                      style={
                        styles.statusSelectValue
                      }
                      numberOfLines={1}
                    >
                      {statusFilter === "ALL"
                        ? "All Status"
                        : statusFilter ===
                          "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </Text>
                  </View>
                </View>

                <Ionicons
                  name="chevron-down"
                  size={17}
                  color={COLORS.mutedDark}
                />
              </Pressable>
            </View>

            {hasFilters && (
              <View style={styles.filterSummary}>
                <View
                  style={
                    styles.filterSummaryLeft
                  }
                >
                  <Ionicons
                    name="options-outline"
                    size={15}
                    color={COLORS.violet}
                  />

                  <Text
                    style={
                      styles.filterSummaryText
                    }
                    numberOfLines={0}
                  >
                    Filters applied
                  </Text>
                </View>

                <Pressable
                  onPress={clearFilters}
                  style={styles.clearFilterButton}
                >
                  <Text
                    style={
                      styles.clearFilterText
                    }
                  >
                    Clear
                  </Text>

                  <Ionicons
                    name="close"
                    size={14}
                    color={COLORS.violet}
                  />
                </Pressable>
              </View>
            )}
          </View>

          {/* MAIN LIST */}

          <View style={styles.mainCard}>
            <View
              style={[
                styles.listHeader,
                !isDesktop &&
                  styles.listHeaderMobile,
              ]}
            >
              <View style={styles.listTitleArea}>
                <View style={styles.listIcon}>
                  <Ionicons
                    name="business-outline"
                    size={17}
                    color={COLORS.violet}
                  />
                </View>

                <View
                  style={styles.listTitleText}
                >
                  <Text
                    style={styles.listTitle}
                    numberOfLines={0}
                  >
                    Salon Owner Accounts
                  </Text>

                  <Text
                    style={styles.listSubtitle}
                  >
                    Showing{" "}
                    {filteredOwners.length} of{" "}
                    {totalOwners} owners
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  fetchSalonOwners()
                }
                style={({ pressed }) => [
                  styles.refreshButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="refresh-outline"
                  size={18}
                  color={COLORS.mutedDark}
                />
              </Pressable>
            </View>

            {filteredOwners.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="storefront-outline"
                    size={34}
                    color={COLORS.violet}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No salon owners found
                </Text>

                <Text
                  style={styles.emptyDescription}
                  numberOfLines={0}
                >
                  {hasFilters
                    ? "Try changing your search or status filter to see more accounts."
                    : "There are no salon owner accounts yet. Create the first account to get started."}
                </Text>

                {hasFilters ? (
                  <Pressable
                    onPress={clearFilters}
                    style={({ pressed }) => [
                      styles.emptyButton,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      Clear Filters
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={openCreateModal}
                    style={({ pressed }) => [
                      styles.emptyButton,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={18}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.emptyButtonText
                      }
                    >
                      Add Salon Owner
                    </Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View
                style={[
                  styles.ownerGrid,
                  isMobile &&
                    styles.ownerGridMobile,
                  isSmallMobile &&
                    styles.ownerGridSmall,
                ]}
              >
                {filteredOwners.map(
                  (owner) => (
                    <OwnerCard
                      key={owner?._id}
                      owner={owner}
                      onEdit={openEditModal}
                      onToggle={
                        handleToggleStatus
                      }
                      onDelete={handleDelete}
                      width={width}
                    />
                  )
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* STATUS FILTER */}

      <StatusFilterModal
        visible={showFilterModal}
        selected={statusFilter}
        onSelect={setStatusFilter}
        onClose={() =>
          setShowFilterModal(false)
        }
      />

      {/* CREATE / EDIT */}

      <OwnerFormModal
        visible={showFormModal}
        editingOwner={editingOwner}
        formData={formData}
        setFormData={setFormData}
        saving={saving}
        onClose={closeFormModal}
        onSubmit={handleSubmit}
        width={width}
      />

      {/* ACTIVATE / DEACTIVATE / DELETE */}

      <ConfirmActionModal
        visible={confirmModal.visible}
        type={confirmModal.type}
        owner={confirmModal.owner}
        loading={actionLoading}
        onCancel={closeConfirmModal}
        onConfirm={executeConfirmedAction}
      />
    </View>
  );
};

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    width: "100%",
    paddingTop: 16,
  },

  pageContainer: {
    width: "100%",
    alignSelf: "center",
  },

  /* ==========================================================
     LOADING
  ========================================================== */

  loadingContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },

  loadingCard: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 42,
    paddingHorizontal: 20,
  },

  loadingIconBox: {
    width: 68,
    height: 68,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  loadingTitle: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },

  loadingSubtitle: {
    marginTop: 6,
    color: COLORS.mutedDark,
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },

  /* ==========================================================
     HERO
  ========================================================== */

  heroCard: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    marginBottom: 16,

    shadowColor: "#1E233C",
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.07,
    shadowRadius: 34,
    elevation: 3,
  },

  heroGlowOne: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    right: -85,
    top: -115,
    backgroundColor: "#EDE9FE",
    opacity: 0.8,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: "28%",
    bottom: -125,
    backgroundColor: "#FAE8FF",
    opacity: 0.55,
  },

  heroContent: {
    width: "100%",
    minWidth: 0,
    padding: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
  },

  heroContentMobile: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  heroTitleArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  heroIcon: {
    width: 56,
    height: 56,
    flexShrink: 0,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violet,
    marginRight: 14,

    shadowColor: COLORS.violet,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 5,
  },

  heroIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginRight: 11,
  },

  heroTextArea: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -1.1,
    flexShrink: 1,
  },

  heroTitleSmall: {
    fontSize: 23,
    lineHeight: 29,
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    marginTop: 5,
    color: COLORS.mutedDark,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    flexShrink: 1,
  },

  addButton: {
    minHeight: 46,
    minWidth: 170,
    paddingHorizontal: 18,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.slateDark,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },

  addButtonMobile: {
    width: "100%",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
    flexShrink: 1,
  },

  /* ==========================================================
     STATS
  ========================================================== */

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
    marginBottom: 16,
  },

  statsGridSmall: {
    gap: 9,
  },

  statCard: {
    position: "relative",
    flex: 1,
    minWidth: 230,
    overflow: "hidden",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor:
      "rgba(255,255,255,0.96)",
    padding: 18,

    shadowColor: "#1E233C",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 24,
    elevation: 2,
  },

  statGlow: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    right: -30,
    top: -35,
    opacity: 0.42,
  },

  statContent: {
    position: "relative",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statText: {
    flex: 1,
    minWidth: 0,
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },

  statValue: {
    marginTop: 7,
    fontSize: 29,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  statDescription: {
    marginTop: 5,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  statIcon: {
    width: 47,
    height: 47,
    flexShrink: 0,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  /* ==========================================================
     FILTER
  ========================================================== */

  filterCard: {
    width: "100%",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor:
      "rgba(255,255,255,0.95)",
    padding: 13,
    marginBottom: 16,

    shadowColor: "#1E233C",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.055,
    shadowRadius: 24,
    elevation: 2,
  },

  filterRow: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 11,
  },

  filterRowStacked: {
    flexDirection: "column",
  },

  searchShell: {
    width: "100%",
    minWidth: 0,
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    overflow: "hidden",
  },

  searchShellDesktop: {
    flex: 1,
    minWidth: 0,
  },

  searchShellFull: {
    width: "100%",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    width: 0,
    height: 48,
    marginLeft: 10,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },

  searchClear: {
    width: 28,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  statusSelect: {
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 13,
  },

  statusSelectDesktop: {
    width: 220,
    flexShrink: 0,
  },

  statusSelectFull: {
    width: "100%",
  },

  statusSelectLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  statusSelectIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    marginRight: 9,
  },

  statusSelectText: {
    flex: 1,
    minWidth: 0,
  },

  statusSelectLabel: {
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 0.9,
  },

  statusSelectValue: {
    marginTop: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
  },

  filterSummary: {
    width: "100%",
    marginTop: 10,
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: "#EDE9FE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterSummaryLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  filterSummaryText: {
    flexShrink: 1,
    color: COLORS.violetDark,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },

  clearFilterButton: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  clearFilterText: {
    color: COLORS.violet,
    fontSize: 10,
    fontWeight: "900",
  },

  /* ==========================================================
     MAIN CARD
  ========================================================== */

  mainCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor:
      "rgba(255,255,255,0.97)",

    shadowColor: "#1E233C",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.065,
    shadowRadius: 30,
    elevation: 3,
  },

  listHeader: {
    width: "100%",
    minWidth: 0,
    minHeight: 74,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  listHeaderMobile: {
    minHeight: 82,
  },

  listTitleArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  listIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    marginRight: 9,
  },

  listTitleText: {
    flex: 1,
    minWidth: 0,
  },

  listTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: -0.25,
    flexShrink: 1,
  },

  listSubtitle: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  refreshButton: {
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ==========================================================
     OWNER GRID
  ========================================================== */

  ownerGrid: {
    width: "100%",
    padding: 15,
    backgroundColor: "#FAFBFD",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  ownerGridSmall: {
    padding: 10,
    gap: 10,
  },

  ownerGridMobile: {
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 10,
    flexDirection: "column",
    flexWrap: "nowrap",
  },

  ownerCard: {
    position: "relative",
    flexGrow: 1,
    flexBasis: 350,
    minWidth: 280,
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7EAF0",
    backgroundColor: "#FFFFFF",

    shadowColor: "#1E233C",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },

  ownerCardMobile: {
    width: "100%",
    minWidth: 0,
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
  },

  ownerCardGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    right: -50,
    top: -60,
    backgroundColor: "#EDE9FE",
    opacity: 0.55,
  },

  ownerHeader: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 7,
    overflow: "hidden",
  },

  ownerIdentity: {
    flex: 1,
    minWidth: 0,
    width: 0,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },

  ownerAvatar: {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    flexShrink: 0,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.slateDark,
    marginRight: 11,

    shadowColor: COLORS.violet,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },

  ownerAvatarSmall: {
    width: 42,
    height: 42,
    minWidth: 42,
    minHeight: 42,
    borderRadius: 13,
    marginRight: 9,
  },

  ownerAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  ownerAvatarTextSmall: {
    fontSize: 14,
  },

  ownerIdentityText: {
    flex: 1,
    minWidth: 0,
  },

  ownerName: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "900",
    flexShrink: 1,
  },

  ownerRole: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },

  statusBadge: {
    minHeight: 29,
    flexShrink: 0,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  statusActive: {
    backgroundColor: COLORS.emeraldSoft,
    borderWidth: 1,
    borderColor: COLORS.emeraldBorder,
  },

  statusInactive: {
    backgroundColor: COLORS.roseSoft,
    borderWidth: 1,
    borderColor: COLORS.roseBorder,
  },

  statusText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
  },

  /* ==========================================================
     OWNER BODY
  ========================================================== */

  ownerBody: {
    width: "100%",
    minWidth: 0,
    padding: 15,
  },

  infoRow: {
    width: "100%",
    minWidth: 0,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoRowPhone: {
    marginTop: 8,
    backgroundColor: "#FFFFFF",
  },

  infoIcon: {
    width: 32,
    height: 32,
    minWidth: 32,
    minHeight: 32,
    flexShrink: 0,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 9,
  },

  infoIconNeutral: {
    backgroundColor: "#F8FAFC",
  },

  infoContent: {
    flex: 1,
    minWidth: 0,
  },

  infoLabel: {
    color: COLORS.muted,
    fontSize: 8,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  infoValue: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 10.5,
    lineHeight: 16,
    fontWeight: "700",
    flexShrink: 1,
  },

  /* ==========================================================
     SALONS
  ========================================================== */

  salonsBox: {
    width: "100%",
    minWidth: 0,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9E1FF",
    backgroundColor: "#FAF9FF",
  },

  salonsHeader: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  salonsIcon: {
    width: 32,
    height: 32,
    minWidth: 32,
    flexShrink: 0,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 9,
  },

  salonsTitleWrap: {
    flex: 1,
    minWidth: 0,
  },

  salonsCount: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
  },

  salonList: {
    width: "100%",
    minWidth: 0,
    marginTop: 9,
    gap: 6,
  },

  salonItem: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor:
      "rgba(255,255,255,0.82)",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  salonName: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "700",
    flexShrink: 1,
  },

  noSalonBox: {
    width: "100%",
    minHeight: 38,
    marginTop: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  noSalonText: {
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    textAlign: "center",
  },

  /* ==========================================================
     ACTIONS
  ========================================================== */

  ownerActions: {
    width: "100%",
    minWidth: 0,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    overflow: "hidden",
  },

  actionButton: {
    minHeight: 40,
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },

  editButton: {
    borderColor: COLORS.violetBorder,
    backgroundColor: "#FAF9FF",
  },

  editButtonText: {
    color: COLORS.violet,
    fontSize: 10,
    fontWeight: "900",
  },

  squareAction: {
    width: 40,
    height: 40,
    minWidth: 40,
    flexShrink: 0,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  pauseButton: {
    borderColor: COLORS.amberBorder,
    backgroundColor: COLORS.amberSoft,
  },

  activateButton: {
    borderColor: COLORS.emeraldBorder,
    backgroundColor: COLORS.emeraldSoft,
  },

  deleteButton: {
    borderColor: COLORS.roseBorder,
    backgroundColor: COLORS.roseSoft,
  },

  pressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  /* ==========================================================
     EMPTY
  ========================================================== */

  emptyState: {
    width: "100%",
    minHeight: 350,
    paddingHorizontal: 24,
    paddingVertical: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    borderWidth: 1,
    borderColor: COLORS.violetBorder,
  },

  emptyTitle: {
    marginTop: 18,
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyDescription: {
    width: "100%",
    maxWidth: 430,
    marginTop: 7,
    color: COLORS.mutedDark,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "500",
    textAlign: "center",
  },

  emptyButton: {
    minHeight: 43,
    minWidth: 145,
    marginTop: 18,
    paddingHorizontal: 17,
    borderRadius: 13,
    backgroundColor: COLORS.slateDark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  /* ==========================================================
     MODALS
  ========================================================== */

  modalKeyboard: {
    flex: 1,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(15,23,42,0.64)",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },

  filterModal: {
    width: "100%",
    maxWidth: 500,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.25,
    shadowRadius: 55,
    elevation: 14,
  },

  filterModalHeader: {
    width: "100%",
    minWidth: 0,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterModalTitleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  filterModalIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    marginRight: 10,
  },

  filterModalTitleText: {
    flex: 1,
    minWidth: 0,
  },

  filterModalTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },

  filterModalSubtitle: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  modalCloseButton: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  filterOptions: {
    width: "100%",
    padding: 13,
    gap: 8,
  },

  filterOption: {
    width: "100%",
    minHeight: 68,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  filterOptionActive: {
    borderColor: COLORS.violetBorder,
    backgroundColor: COLORS.violetSoft,
  },

  filterOptionIcon: {
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    marginRight: 10,
  },

  filterOptionIconActive: {
    backgroundColor: "#FFFFFF",
  },

  filterOptionText: {
    flex: 1,
    minWidth: 0,
  },

  filterOptionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800",
  },

  filterOptionTitleActive: {
    color: COLORS.violetDark,
  },

  filterOptionDescription: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "500",
    flexShrink: 1,
  },

  radioOuter: {
    width: 21,
    height: 21,
    minWidth: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  radioOuterActive: {
    borderColor: COLORS.violet,
  },

  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.violet,
  },

  /* ==========================================================
     FORM MODAL
  ========================================================== */

  ownerFormModal: {
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 30,
    },
    shadowOpacity: 0.28,
    shadowRadius: 70,
    elevation: 15,
  },

  formModalHeader: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSoft,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  formModalHeaderGlow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    right: -45,
    top: -70,
    backgroundColor: "#EDE9FE",
    opacity: 0.55,
  },

  formModalTitleArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  formModalIcon: {
    width: 46,
    height: 46,
    minWidth: 46,
    flexShrink: 0,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violet,
    marginRight: 10,
  },

  formModalTitleText: {
    flex: 1,
    minWidth: 0,
  },

  formModalTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    letterSpacing: -0.4,
    flexShrink: 1,
  },

  formModalTitleSmall: {
    fontSize: 15,
    lineHeight: 20,
  },

  formModalSubtitle: {
    marginTop: 2,
    color: COLORS.muted,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "500",
    flexShrink: 1,
  },

  formScrollContent: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 15,
  },

  formField: {
    width: "100%",
    minWidth: 0,
  },

  formLabel: {
    marginBottom: 7,
    color: COLORS.textSecondary,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  inputShell: {
    width: "100%",
    minWidth: 0,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  inputIcon: {
    width: 31,
    height: 31,
    minWidth: 31,
    flexShrink: 0,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    height: 48,
    marginLeft: 7,
    paddingHorizontal: 2,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },

  passwordHint: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
  },

  passwordHintText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.mutedDark,
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "500",
  },

  formModalFooter: {
    width: "100%",
    minWidth: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    backgroundColor: "#FAFBFD",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 9,
  },

  cancelButton: {
    minHeight: 45,
    minWidth: 95,
    paddingHorizontal: 18,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: "800",
  },

  submitButton: {
    minHeight: 45,
    minWidth: 145,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: COLORS.slateDark,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.55,
  },

  /* ==========================================================
     CONFIRM MODAL
  ========================================================== */

  confirmOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor:
      "rgba(15, 23, 42, 0.58)",
  },

  confirmModal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 18,
    },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  },

  confirmIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  confirmContent: {
    marginTop: 18,
    alignItems: "center",
  },

  confirmTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  confirmDescription: {
    marginTop: 9,
    maxWidth: 390,
    color: COLORS.mutedDark,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    textAlign: "center",
  },

  confirmActions: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
  },

  confirmCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  confirmCancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: "800",
  },

  confirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 14,
  },

  confirmActivateButton: {
    backgroundColor: COLORS.emerald,
  },

  confirmDeactivateButton: {
    backgroundColor: COLORS.amber,
  },

  confirmDeleteButton: {
    backgroundColor: COLORS.rose,
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /* ==========================================================
     FOOTER
  ========================================================== */

  footerWrapper: {
    width: "100%",
    alignSelf: "center",
    marginTop: 18,
  },

  footerOuter: {
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#0B1020",
  },

  footer: {
    width: "100%",
    paddingVertical: 26,
  },

  footerTop: {
    width: "100%",
    minWidth: 0,
  },

  footerTopDesktop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 30,
  },

  footerBrand: {
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  footerBrandDesktop: {
    flex: 1,
  },

  footerLogo: {
    width: 44,
    height: 44,
    flexShrink: 0,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violet,
    marginRight: 11,
  },

  footerBrandText: {
    flex: 1,
    minWidth: 0,
  },

  footerBrandName: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  footerBrandDescription: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "500",
  },

  footerLinks: {
    width: "100%",
    minWidth: 0,
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 28,
  },

  footerLinksDesktop: {
    width: "auto",
    marginTop: 0,
    justifyContent: "flex-end",
  },

  footerLinkBlock: {
    minWidth: 100,
  },

  footerHeading: {
    marginBottom: 8,
    color: "#CBD5E1",
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  footerLink: {
    marginBottom: 5,
    color: "#64748B",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
  },

  footerDivider: {
    width: "100%",
    height: 1,
    marginTop: 23,
    backgroundColor:
      "rgba(148,163,184,0.12)",
  },

  footerBottom: {
    width: "100%",
    minWidth: 0,
    marginTop: 15,
  },

  footerBottomDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
  },

  footerCopyright: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
  },

  footerLegal: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  footerLegalDesktop: {
    marginTop: 0,
    justifyContent: "flex-end",
  },

  footerLegalText: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 15,
    fontWeight: "600",
  },

  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#475569",
  },
});

export default SalonOwners;