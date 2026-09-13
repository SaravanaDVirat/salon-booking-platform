import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
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
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  activateCustomer,
  deactivateCustomer,
} from "../../../../services/customerService";

const COLORS = {
  bg: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceSoft: "#FAFBFD",
  text: "#171A2B",
  text2: "#555B6E",
  muted: "#969BAD",
  border: "#E7EAF0",
  violet: "#5B5FF0",
  violetDark: "#3E3FB6",
  violetSoft: "#F0F0FF",
  indigoSoft: "#EEF1FF",
  green: "#1D995D",
  greenBg: "#EAF9F0",
  red: "#D34E4E",
  redBg: "#FFF0F0",
  amber: "#D58A28",
  amberBg: "#FFF6E7",
  cyan: "#167EA8",
  cyanBg: "#EAF8FC",
  white: "#FFFFFF",
  dark: "#111827",
};

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
};

const getInitials = (name = "") => {
  const value = name.trim();
  if (!value) return "?";
  return value.charAt(0).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const Customers = () => {
  const { width } = useWindowDimensions();

  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1100;
  const isDesktop = width >= 1100;

  const horizontalPadding = isSmallMobile
    ? 12
    : isMobile
      ? 16
      : isTablet
        ? 24
        : 30;

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCustomers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getCustomers();
      setCustomers(Array.isArray(data?.users) ? data.users : []);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to load customers"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) return customers;

    return customers.filter((customer) =>
      [customer?.name, customer?.email, customer?.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [customers, search]);

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer?.isActive).length,
    [customers]
  );

  const inactiveCustomers = customers.length - activeCustomers;

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (error) setError("");
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setFormData({ ...initialForm });
    setError("");
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer?.name || "",
      email: customer?.email || "",
      password: "",
      phone: customer?.phone || "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ ...initialForm });
    setError("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!editingCustomer && !formData.password) {
      setError("Password is required");
      return;
    }

    if (!editingCustomer && formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: "CUSTOMER",
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, payload);
        setSuccess("Customer updated successfully");
      } else {
        await createCustomer({
          ...payload,
          password: formData.password,
        });
        setSuccess("Customer created successfully");
      }

      setShowModal(false);
      setEditingCustomer(null);
      setFormData({ ...initialForm });
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setSaving(false);
    }
  };

 const confirmDelete = (customer) => {
  const customerName = customer?.name || "this customer";

  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customerName}?`
    );

    if (confirmed) {
      handleDelete(customer);
    }

    return;
  }
  Alert.alert(
    "Delete customer",
    `Are you sure you want to delete ${customerName}?`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(customer),
      },
    ]
  );
};

  const handleDelete = async (customer) => {
    try {
      setError("");
      await deleteCustomer(customer._id);
      setSuccess("Customer deleted successfully");
      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to delete customer"));
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      setError("");

      if (customer.isActive) {
        await deactivateCustomer(customer._id);
        setSuccess("Customer deactivated successfully");
      } else {
        await activateCustomer(customer._id);
        setSuccess("Customer activated successfully");
      }

      await fetchCustomers();
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to update customer status"));
    }
  };

  const clearSearch = () => setSearch("");

  const renderStat = ({
    icon,
    label,
    value,
    tone,
    background,
  }) => (
    <View
      style={[
        styles.statCard,
        isDesktop && styles.statCardDesktop,
        isTablet && styles.statCardTablet,
      ]}
    >
      <View style={[styles.statGlow, { backgroundColor: background }]} />
      <View style={[styles.statIcon, { backgroundColor: tone }]}>
        <Ionicons name={icon} size={isSmallMobile ? 18 : 21} color={COLORS.white} />
      </View>

      <View style={styles.statTextWrap}>
        <Text
          style={[styles.statLabel, isSmallMobile && styles.statLabelSmall]}
        >
          {label}
        </Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  const renderDesktopRow = ({ item, index }) => (
    <View style={styles.desktopRow}>
      <View style={[styles.desktopCell, styles.indexCell]}>
        <Text style={styles.indexText}>
          {String(index + 1).padStart(2, "0")}
        </Text>
      </View>

      <View style={[styles.desktopCell, styles.customerCell]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item?.name)}</Text>
        </View>
        <View style={styles.customerIdentity}>
          <Text style={styles.customerName} numberOfLines={2}>
            {item?.name || "Unnamed Customer"}
          </Text>
          <Text style={styles.customerSub}>Customer</Text>
        </View>
      </View>

      <View style={[styles.desktopCell, styles.emailCell]}>
        <Text style={styles.desktopValue} numberOfLines={3}>
          {item?.email || "No email address"}
        </Text>
      </View>

      <View style={[styles.desktopCell, styles.phoneCell]}>
        <Text style={styles.desktopValue} numberOfLines={2}>
          {item?.phone || "Not provided"}
        </Text>
      </View>

      <View style={[styles.desktopCell, styles.statusCell]}>
        <StatusPill active={item?.isActive} />
      </View>

      <View style={[styles.desktopCell, styles.joinedCell]}>
        <Text style={styles.desktopValue} numberOfLines={2}>
          {formatDate(item?.createdAt)}
        </Text>
      </View>

      <View style={[styles.desktopCell, styles.actionsCell]}>
        <ActionIcon
          icon="create-outline"
          label="Edit customer"
          color={COLORS.violet}
          onPress={() => handleEdit(item)}
        />
        <ActionIcon
          icon={item?.isActive ? "person-remove-outline" : "person-add-outline"}
          label={item?.isActive ? "Deactivate" : "Activate"}
          color={item?.isActive ? COLORS.amber : COLORS.green}
          onPress={() => handleToggleStatus(item)}
        />
        <ActionIcon
          icon="trash-outline"
          label="Delete customer"
          color={COLORS.red}
          onPress={() => confirmDelete(item)}
        />
      </View>
    </View>
  );

  const renderCustomerCard = ({ item, index }) => (
    <View style={styles.customerCard}>
      <View style={styles.cardGlow} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIdentity}>
          <View style={[styles.avatar, styles.avatarMobile]}>
            <Text style={styles.avatarText}>{getInitials(item?.name)}</Text>
          </View>

          <View style={styles.customerIdentity}>
            <Text style={styles.customerName} numberOfLines={2}>
              {item?.name || "Unnamed Customer"}
            </Text>
            <Text style={styles.customerSub}>
              Customer #{String(index + 1).padStart(2, "0")}
            </Text>
          </View>
        </View>

        <StatusPill active={item?.isActive} />
      </View>

      <View style={styles.cardBody}>
        <InfoBox
          icon="mail-outline"
          label="Email"
          value={item?.email || "No email address"}
          fullWidth
        />
        <InfoBox
          icon="call-outline"
          label="Phone"
          value={item?.phone || "Not provided"}
          muted={!item?.phone}
        />
        <InfoBox
          icon="calendar-outline"
          label="Joined"
          value={formatDate(item?.createdAt)}
          fullWidth
        />
      </View>

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => handleEdit(item)}
          style={({ pressed }) => [
            styles.cardActionButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="create-outline" size={17} color={COLORS.violet} />
          <Text style={[styles.cardActionText, { color: COLORS.violet }]}>
            Edit
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleToggleStatus(item)}
          style={({ pressed }) => [
            styles.cardActionButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name={item?.isActive ? "person-remove-outline" : "person-add-outline"}
            size={17}
            color={item?.isActive ? COLORS.amber : COLORS.green}
          />
          <Text
            style={[
              styles.cardActionText,
              { color: item?.isActive ? COLORS.amber : COLORS.green },
            ]}
          >
            {item?.isActive ? "Deactivate" : "Activate"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => confirmDelete(item)}
          accessibilityLabel="Delete customer"
          style={({ pressed }) => [
            styles.deleteAction,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="trash-outline" size={17} color={COLORS.red} />
          {!isSmallMobile && <Text style={styles.deleteText}>Delete</Text>}
        </Pressable>
      </View>
    </View>
  );

  const renderListHeader = () => (
    <>
      <View
        style={[
          styles.pageHeader,
          { marginHorizontal: horizontalPadding },
          isDesktop && styles.pageHeaderDesktop,
        ]}
      >
        <View style={styles.headerGlowOne} />
        <View style={styles.headerGlowTwo} />

        <View style={styles.headerContent}>
          <View style={styles.headerTextWrap}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>ADMIN / CUSTOMERS</Text>
            </View>

            <Text style={styles.pageTitle} numberOfLines={2}>
              Customer Management
            </Text>

            <Text style={styles.pageDescription}>
              Manage registered customers, account status and customer information.
            </Text>
          </View>

          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [
              styles.addButton,
              isDesktop && styles.addButtonDesktop,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="person-add" size={17} color={COLORS.white} />
            <Text style={styles.addButtonText}>Add Customer</Text>
          </Pressable>
        </View>
      </View>

      {success ? (
        <AlertBanner
          type="success"
          message={success}
          onClose={() => setSuccess("")}
          horizontalPadding={horizontalPadding}
        />
      ) : null}

      {error && !showModal ? (
        <AlertBanner
          type="error"
          message={error}
          onClose={() => setError("")}
          horizontalPadding={horizontalPadding}
        />
      ) : null}

      <View
        style={[
          styles.statsGrid,
          { marginHorizontal: horizontalPadding },
          isDesktop && styles.statsGridDesktop,
        ]}
      >
        {renderStat({
          icon: "people",
          label: "Total Customers",
          value: customers.length,
          tone: "#625CE8",
          background: "#E7E6FF",
        })}
        {renderStat({
          icon: "person",
          label: "Active",
          value: activeCustomers,
          tone: "#13A86B",
          background: "#DDF7EB",
        })}
        {renderStat({
          icon: "person-remove",
          label: "Inactive",
          value: inactiveCustomers,
          tone: "#DF4E68",
          background: "#FFE3E8",
        })}
        {renderStat({
          icon: "search",
          label: "Search Results",
          value: filteredCustomers.length,
          tone: "#1599B9",
          background: "#DDF6FC",
        })}
      </View>

      <View
        style={[
          styles.mainPanel,
          { marginHorizontal: horizontalPadding },
          isDesktop && styles.mainPanelDesktop,
        ]}
      >
        <View style={styles.toolbar}>
          <View style={styles.toolbarTitleWrap}>
            <View style={styles.toolbarIcon}>
              <Ionicons name="people-outline" size={17} color={COLORS.violet} />
            </View>

            <View style={styles.toolbarText}>
              <Text style={styles.toolbarTitle}>Customers</Text>
              <Text style={styles.toolbarSubtitle}>
                {filteredCustomers.length}{" "}
                {filteredCustomers.length === 1 ? "customer" : "customers"} found
              </Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color="#A0A5B5" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customers..."
              placeholderTextColor="#A0A5B5"
              autoCorrect={false}
              returnKeyType="search"
              style={styles.searchInput}
              selectionColor={COLORS.violet}
            />

            {search.length > 0 ? (
              <Pressable
                onPress={clearSearch}
                hitSlop={8}
                style={styles.searchClear}
              >
                <Ionicons name="close-circle" size={18} color="#9CA2B1" />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isDesktop ? (
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.indexCell]}>#</Text>
            <Text style={[styles.tableHeaderText, styles.customerCell]}>Customer</Text>
            <Text style={[styles.tableHeaderText, styles.emailCell]}>Email</Text>
            <Text style={[styles.tableHeaderText, styles.phoneCell]}>Phone</Text>
            <Text style={[styles.tableHeaderText, styles.statusCell]}>Status</Text>
            <Text style={[styles.tableHeaderText, styles.joinedCell]}>Joined</Text>
            <Text style={[styles.tableHeaderText, styles.actionsCell]}>Actions</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  const renderEmpty = () => (
    <View
      style={[
        styles.emptyState,
        { marginHorizontal: horizontalPadding },
        isDesktop && styles.mainPanelDesktop,
      ]}
    >
      <View style={styles.emptyIcon}>
        <Ionicons name="people-outline" size={30} color={COLORS.violet} />
      </View>
      <Text style={styles.emptyTitle}>No customers found</Text>
      <Text style={styles.emptyDescription}>
        Try changing your search or add a new customer.
      </Text>
      <Pressable
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.emptyButton,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name="person-add" size={16} color={COLORS.white} />
        <Text style={styles.emptyButtonText}>Add Customer</Text>
      </Pressable>
    </View>
  );

  const renderLoading = () => (
    <View
      style={[
        styles.loadingState,
        { marginHorizontal: horizontalPadding },
      ]}
    >
      <View style={styles.loadingOrb}>
        <Ionicons name="people-outline" size={22} color={COLORS.violet} />
      </View>
      <Text style={styles.loadingTitle}>Loading customers...</Text>
      <Text style={styles.loadingSub}>Preparing your customer workspace</Text>
    </View>
  );

  const listData = filteredCustomers;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.bg}
        translucent={false}
      />

      <View style={styles.screen}>
        {loading ? (
          <ScrollView
            contentContainerStyle={styles.loadingScroll}
            showsVerticalScrollIndicator={false}
          >
            {renderListHeader()}
            {renderLoading()}
          </ScrollView>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) => String(item?._id || index)}
            renderItem={isDesktop ? renderDesktopRow : renderCustomerCard}
            ListHeaderComponent={renderListHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={[
              styles.listContent,
              listData.length === 0 && styles.listEmptyContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchCustomers(true)}
                tintColor={COLORS.violet}
                colors={[COLORS.violet]}
              />
            }
            ItemSeparatorComponent={
              isDesktop
                ? () => <View style={styles.desktopRowSeparator} />
                : () => <View style={styles.cardSeparator} />
            }
          />
        )}
      </View>

      <CustomerModal
        visible={showModal}
        editingCustomer={editingCustomer}
        formData={formData}
        error={error}
        saving={saving}
        isSmallMobile={isSmallMobile}
        isMobile={isMobile}
        isTablet={isTablet}
        onClose={closeModal}
        onChange={updateField}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
};

const StatusPill = ({ active }) => (
  <View
    style={[
      styles.statusPill,
      active ? styles.statusActive : styles.statusInactive,
    ]}
  >
    <View
      style={[
        styles.statusDot,
        active ? styles.statusDotActive : styles.statusDotInactive,
      ]}
    />
    <Text
      style={[
        styles.statusText,
        active ? styles.statusTextActive : styles.statusTextInactive,
      ]}
    >
      {active ? "Active" : "Inactive"}
    </Text>
  </View>
);

const ActionIcon = ({ icon, label, color, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={label}
    style={({ pressed }) => [
      styles.actionIcon,
      pressed && styles.pressed,
    ]}
  >
    <Ionicons name={icon} size={17} color={color} />
  </Pressable>
);

const InfoBox = ({ icon, label, value, muted, fullWidth }) => (
  <View style={[styles.infoBox, fullWidth && styles.infoBoxFull]}>
    <View style={styles.infoLabelRow}>
      <Ionicons name={icon} size={13} color={COLORS.violet} />
      <Text style={styles.infoLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.infoValueScroll}
      style={styles.infoValueScrollView}
    >
      <Text
        style={[styles.infoValue, muted && styles.infoMuted]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </ScrollView>
  </View>
);

const AlertBanner = ({ type, message, onClose, horizontalPadding }) => {
  const isSuccess = type === "success";

  return (
    <View
      style={[
        styles.alert,
        isSuccess ? styles.alertSuccess : styles.alertError,
        { marginHorizontal: horizontalPadding },
      ]}
    >
      <View
        style={[
          styles.alertIcon,
          isSuccess ? styles.alertIconSuccess : styles.alertIconError,
        ]}
      >
        <Ionicons
          name={isSuccess ? "checkmark" : "alert-circle"}
          size={15}
          color={isSuccess ? COLORS.green : COLORS.red}
        />
      </View>

      <Text style={styles.alertText}>{message}</Text>

      <Pressable onPress={onClose} hitSlop={8} style={styles.alertClose}>
        <Ionicons
          name="close"
          size={17}
          color={isSuccess ? COLORS.green : COLORS.red}
        />
      </Pressable>
    </View>
  );
};

const CustomerModal = ({
  visible,
  editingCustomer,
  formData,
  error,
  saving,
  isSmallMobile,
  isMobile,
  isTablet,
  onClose,
  onChange,
  onSubmit,
}) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(
      showEvent,
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      hideEvent,
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.modalBackdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.modalBackdropPressable}
          onPress={() => {
            if (!saving) onClose();
          }}
        >
          <Pressable
            style={[
              styles.modalCard,
              isSmallMobile && styles.modalCardSmall,
              isTablet && styles.modalCardTablet,
              keyboardVisible && isMobile && styles.modalCardKeyboard,
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons
                  name={editingCustomer ? "person-outline" : "person-add"}
                  size={isSmallMobile ? 20 : 22}
                  color={COLORS.violet}
                />
              </View>

              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle} numberOfLines={2}>
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </Text>
                <Text style={styles.modalSubtitle} numberOfLines={2}>
                  {editingCustomer
                    ? "Update customer account information."
                    : "Create a new customer account."}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                disabled={saving}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.modalClose,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Ionicons name="close" size={18} color="#707587" />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={[
                styles.modalBodyContent,
                keyboardVisible && { paddingBottom: 24 },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              automaticallyAdjustKeyboardInsets
            >
              {error ? (
                <View style={styles.formError}>
                  <Ionicons
                    name="alert-circle"
                    size={16}
                    color={COLORS.red}
                  />
                  <Text style={styles.formErrorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.formGrid}>
                <Field
                  label="Full Name"
                  icon="person-outline"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(value) => onChange("name", value)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  fullWidth
                />

                <Field
                  label="Email Address"
                  icon="mail-outline"
                  placeholder="customer@example.com"
                  value={formData.email}
                  onChangeText={(value) => onChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  fullWidth
                />

                <Field
                  label="Phone Number"
                  icon="call-outline"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChangeText={(value) => onChange("phone", value)}
                  keyboardType="phone-pad"
                  autoCorrect={false}
                  fullWidth={isMobile}
                />

                <Field
                  label={
                    editingCustomer ? (
                      <Text>
                        Password{" "}
                        <Text style={styles.optionalText}>Optional</Text>
                      </Text>
                    ) : (
                      "Password"
                    )
                  }
                  icon="lock-closed-outline"
                  placeholder={
                    editingCustomer
                      ? "Leave blank to keep current password"
                      : "Minimum 8 characters"
                  }
                  value={formData.password}
                  onChangeText={(value) => onChange("password", value)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  fullWidth
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={onClose}
                disabled={saving}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                  saving && styles.disabled,
                ]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={onSubmit}
                disabled={saving}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.buttonPressed,
                  saving && styles.disabled,
                ]}
              >
                {saving ? (
                  <>
                    <View style={styles.loadingDot} />
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name={editingCustomer ? "checkmark" : "person-add"}
                      size={17}
                      color={COLORS.white}
                    />
                    <Text style={styles.saveButtonText}>
                      {editingCustomer ? "Update Customer" : "Create Customer"}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const Field = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  fullWidth,
  ...inputProps
}) => (
  <View style={[styles.fieldWrap, fullWidth && styles.fieldFull]}>
    <Text style={styles.fieldLabel}>{label}</Text>

    <View style={styles.inputShell}>
      <Ionicons name={icon} size={17} color="#9BA0B0" />
      <TextInput
        {...inputProps}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B7BBC6"
        style={styles.input}
        selectionColor={COLORS.violet}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  screen: {
    flex: 1,
    minWidth: 0,
    backgroundColor: COLORS.bg,
  },

  listContent: {
    paddingTop: 14,
    paddingBottom: 34,
  },

  listEmptyContent: {
    paddingBottom: 40,
  },

  loadingScroll: {
    paddingTop: 14,
    paddingBottom: 40,
  },

  pageHeader: {
    position: "relative",
    overflow: "hidden",
    minHeight: 0,
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.92)",
    backgroundColor: "rgba(255,255,255,0.94)",
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 3,
  },

  pageHeaderDesktop: {
    minHeight: 190,
    borderRadius: 28,
    marginBottom: 18,
  },

  headerGlowOne: {
    position: "absolute",
    right: -58,
    top: -74,
    width: 190,
    height: 190,
    borderRadius: 100,
    backgroundColor: "#E8E3FF",
    opacity: 0.65,
  },

  headerGlowTwo: {
    position: "absolute",
    left: -60,
    bottom: -86,
    width: 170,
    height: 170,
    borderRadius: 100,
    backgroundColor: "#E9EEFF",
    opacity: 0.55,
  },

  headerContent: {
    zIndex: 2,
    minWidth: 0,
    flex: 1,
    padding: 18,
    justifyContent: "space-between",
    gap: 18,
  },

  headerTextWrap: {
    minWidth: 0,
    flexShrink: 1,
  },

  eyebrowRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 7,
    minWidth: 0,
  },

  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.violet,
    shadowColor: COLORS.violet,
    shadowOpacity: 0.5,
    shadowRadius: 7,
    elevation: 2,
  },

  eyebrow: {
    flexShrink: 1,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: COLORS.violet,
  },

  pageTitle: {
    maxWidth: "100%",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.8,
    color: "#11131F",
  },

  pageDescription: {
    maxWidth: 620,
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: "500",
    color: "#74798A",
  },

  addButton: {
    width: "100%",
    minHeight: 48,
    paddingHorizontal: 17,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.dark,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },

  addButtonDesktop: {
    width: 175,
    minHeight: 50,
    borderRadius: 16,
    alignSelf: "center",
  },

  addButtonText: {
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: COLORS.white,
  },

  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.985 }],
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },

  disabled: {
    opacity: 0.55,
  },

  alert: {
    minWidth: 0,
    minHeight: 50,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  alertSuccess: {
    backgroundColor: "#F0FBF5",
    borderColor: "#CBEEDB",
  },

  alertError: {
    backgroundColor: "#FFF4F4",
    borderColor: "#F3D0D0",
  },

  alertIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  alertIconSuccess: {
    backgroundColor: "#DDF5E8",
  },

  alertIconError: {
    backgroundColor: "#FFE4E4",
  },

  alertText: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
    color: COLORS.text2,
  },

  alertClose: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },

  statsGridDesktop: {
    gap: 14,
    marginBottom: 18,
  },

  statCard: {
    position: "relative",
    overflow: "hidden",
    minWidth: 0,
    minHeight: 102,
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 1,
    padding: 14,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.055,
    shadowRadius: 22,
    elevation: 2,
  },

  statCardTablet: {
    flexBasis: "23.5%",
    minHeight: 112,
    padding: 16,
  },

  statCardDesktop: {
    flexBasis: 0,
    flexGrow: 1,
    minHeight: 118,
    padding: 18,
    borderRadius: 22,
  },

  statGlow: {
    position: "absolute",
    right: -25,
    top: -30,
    width: 85,
    height: 85,
    borderRadius: 50,
    opacity: 0.65,
  },

  statIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },

  statTextWrap: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },

  statLabel: {
    flexShrink: 1,
    flexWrap: "wrap",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "800",
    color: "#9297A9",
  },

  statLabelSmall: {
    fontSize: 8.5,
    lineHeight: 12,
  },

  statValue: {
    marginTop: 4,
    fontSize: 23,
    lineHeight: 27,
    fontWeight: "900",
    color: COLORS.text,
  },

  mainPanel: {
    minWidth: 0,
    overflow: "hidden",
    marginBottom: 2,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.065,
    shadowRadius: 30,
    elevation: 3,
  },

  mainPanelDesktop: {
    borderRadius: 26,
  },

  toolbar: {
    minWidth: 0,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
    gap: 12,
  },

  toolbarTitleWrap: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  toolbarIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    flexShrink: 0,
  },

  toolbarText: {
    flex: 1,
    minWidth: 0,
  },

  toolbarTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  toolbarSubtitle: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: COLORS.muted,
  },

  searchBox: {
    width: "100%",
    minWidth: 0,
    height: 45,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E3E6EE",
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 12,
    lineHeight: 18,
    color: "#272B3B",
    outlineStyle: "none",
  },

  searchClear: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  tableHeader: {
    minWidth: 0,
    minHeight: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F5",
    backgroundColor: "#FBFCFD",
    flexDirection: "row",
    alignItems: "center",
  },

  tableHeaderText: {
    minWidth: 0,
    paddingHorizontal: 8,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: "#9297A8",
    textTransform: "uppercase",
  },

  desktopRow: {
    minWidth: 0,
    minHeight: 82,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
  },

  desktopRowSeparator: {
    height: 1,
    backgroundColor: "#F0F1F5",
    marginHorizontal: 16,
  },

  desktopCell: {
    minWidth: 0,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  indexCell: {
    width: "6%",
  },

  customerCell: {
    width: "22%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  emailCell: {
    width: "23%",
  },

  phoneCell: {
    width: "15%",
  },

  statusCell: {
    width: "12%",
  },

  joinedCell: {
    width: "12%",
  },

  actionsCell: {
    width: "10%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
  },

  indexText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: "#A2A7B6",
  },

  avatar: {
    width: 41,
    height: 41,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: COLORS.indigoSoft,
    borderWidth: 1,
    borderColor: "#E0E2FF",
  },

  avatarMobile: {
    width: 45,
    height: 45,
    borderRadius: 14,
  },

  avatarText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "900",
    color: "#5559DD",
  },

  customerIdentity: {
    flex: 1,
    minWidth: 0,
  },

  customerName: {
    maxWidth: "100%",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
    color: "#272B3A",
  },

  customerSub: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: "#A0A5B5",
  },

  desktopValue: {
    maxWidth: "100%",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "600",
    color: "#555B6E",
  },

  statusPill: {
    minHeight: 29,
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusActive: {
    backgroundColor: COLORS.greenBg,
  },

  statusInactive: {
    backgroundColor: COLORS.redBg,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },

  statusDotActive: {
    backgroundColor: "#25AE69",
  },

  statusDotInactive: {
    backgroundColor: "#E25252",
  },

  statusText: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
  },

  statusTextActive: {
    color: COLORS.green,
  },

  statusTextInactive: {
    color: COLORS.red,
  },

  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E9EBF1",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  customerCard: {
    position: "relative",
    minWidth: 0,
    marginHorizontal: 10,
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E7E9EF",
    backgroundColor: COLORS.white,
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.055,
    shadowRadius: 18,
    elevation: 2,
  },

  cardSeparator: {
    height: 10,
  },

  cardGlow: {
    position: "absolute",
    right: -40,
    top: -40,
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: "#F0ECFF",
    opacity: 0.65,
  },

  cardHeader: {
    minWidth: 0,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F5",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },

  cardIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cardBody: {
    minWidth: 0,
    padding: 14,
    gap: 9,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  infoBox: {
    minWidth: 0,
    flexBasis: "47%",
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F1F4",
    backgroundColor: "#FAFBFD",
  },

  infoBoxFull: {
    flexBasis: "100%",
  },

  infoLabelRow: {
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  infoLabel: {
    flexShrink: 1,
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: "#A0A5B5",
    textTransform: "uppercase",
  },

  infoValueScrollView: {
    width: "100%",
    marginTop: 5,
    flexGrow: 0,
    flexShrink: 1,
  },

  infoValueScroll: {
    flexGrow: 1,
  },

  infoValue: {
    flexShrink: 0,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "800",
    color: "#555B6E",
  },

  infoMuted: {
    color: "#B0B4C0",
  },

  cardActions: {
    minWidth: 0,
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 0,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 7,
  },

  cardActionButton: {
    minWidth: 0,
    minHeight: 42,
    flex: 1,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EBF1",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  cardActionText: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "900",
  },

  deleteAction: {
    minWidth: 42,
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9EBF1",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  deleteText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "900",
    color: COLORS.red,
  },

  emptyState: {
    minHeight: 310,
    marginTop: 2,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.055,
    shadowRadius: 25,
    elevation: 2,
  },

  emptyIcon: {
    width: 62,
    height: 62,
    marginBottom: 14,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F0FF",
    borderWidth: 1,
    borderColor: "#E4E2FF",
  },

  emptyTitle: {
    maxWidth: "100%",
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.text,
    textAlign: "center",
  },

  emptyDescription: {
    maxWidth: 360,
    marginTop: 7,
    marginBottom: 17,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: "600",
    color: "#999EAE",
    textAlign: "center",
  },

  emptyButton: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  loadingState: {
    minHeight: 300,
    marginBottom: 20,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E233C",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.045,
    shadowRadius: 25,
    elevation: 2,
  },

  loadingOrb: {
    width: 52,
    height: 52,
    marginBottom: 13,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F0FF",
    borderWidth: 1,
    borderColor: "#E2E0FF",
  },

  loadingTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "900",
    color: COLORS.text2,
  },

  loadingSub: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
    color: COLORS.muted,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,18,30,0.62)",
  },

  modalBackdropPressable: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  modalCard: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "92%",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
    backgroundColor: COLORS.white,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 22 },
    shadowOpacity: 0.28,
    shadowRadius: 45,
    elevation: 15,
  },

  modalCardSmall: {
    maxHeight: "95%",
    borderRadius: 20,
  },

  modalCardTablet: {
    maxWidth: 720,
    borderRadius: 28,
  },

  modalCardKeyboard: {
    maxHeight: "84%",
  },

  modalHeader: {
    minWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF0F4",
    backgroundColor: "#FCFCFE",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  modalHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#F0F0FF",
    borderWidth: 1,
    borderColor: "#E3E2FF",
  },

  modalTitleWrap: {
    flex: 1,
    minWidth: 0,
  },

  modalTitle: {
    maxWidth: "100%",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900",
    color: COLORS.text,
  },

  modalSubtitle: {
    maxWidth: "100%",
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    fontWeight: "600",
    color: COLORS.muted,
  },

  modalClose: {
    width: 35,
    height: 35,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    backgroundColor: "#F4F5F8",
  },

  modalBody: {
    minHeight: 0,
    flexGrow: 1,
    flexShrink: 1,
  },

  modalBodyContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },

  formError: {
    minWidth: 0,
    marginBottom: 14,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3D0D0",
    backgroundColor: "#FFF2F2",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  formErrorText: {
    flex: 1,
    minWidth: 0,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "800",
    color: COLORS.red,
  },

  formGrid: {
    minWidth: 0,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  fieldWrap: {
    minWidth: 0,
    flexBasis: "47%",
    flexGrow: 1,
  },

  fieldFull: {
    flexBasis: "100%",
  },

  fieldLabel: {
    maxWidth: "100%",
    marginBottom: 6,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    color: "#343849",
  },

  optionalText: {
    fontWeight: "600",
    color: "#999EAD",
  },

  inputShell: {
    width: "100%",
    minWidth: 0,
    minHeight: 47,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#E2E5EC",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 46,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    color: "#303445",
    outlineStyle: "none",
  },

  modalFooter: {
    minWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF0F4",
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 9,
  },

  cancelButton: {
    minWidth: 92,
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E5EB",
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: "#686D7D",
  },

  saveButton: {
    minWidth: 150,
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.dark,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.17,
    shadowRadius: 14,
    elevation: 4,
  },

  saveButtonText: {
    flexShrink: 1,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "900",
    color: COLORS.white,
  },

  loadingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    borderTopColor: COLORS.white,
  },
});

export default Customers;
