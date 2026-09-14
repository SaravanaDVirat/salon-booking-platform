import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";

import {
  getAllServicesAdmin,
  createService,
  updateService,
  deactivateService,
  activateService,
} from "../../../../services/adminServiceService";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const COLORS = {
  primary: "#6D28D9",
  primaryDark: "#5B21B6",
  primarySoft: "#F3E8FF",
  bg: "#F7F8FC",
  card: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  lightText: "#9CA3AF",
  border: "#E5E7EB",
  input: "#F9FAFB",
  green: "#059669",
  greenSoft: "#ECFDF5",
  red: "#E11D48",
  redSoft: "#FFF1F2",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  shadow: "#111827",
};

const initialForm = {
  salon: "",
  category: "",
  name: "",
  description: "",
  price: "",
  duration: "",
};

const getId = (item) => item?._id || item?.id || "";
const getSalonNameFromItem = (item) =>
  item?.name || item?.salonName || item?.title || "Salon";
const getCategoryNameFromItem = (item) =>
  item?.name || item?.categoryName || item?.title || "Category";

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const getToken = async () => {
  if (Platform.OS === "web") {
    try {
      return typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("token")
        : null;
    } catch {
      return null;
    }
  }

  /*
   * For native builds, keep your login token in AsyncStorage and replace
   * the block above with:
   *
   * const token = await AsyncStorage.getItem("token");
   *
   * The rest of this screen is already React Native compatible.
   */
  return null;
};

const fetchJson = async (url, options = {}) => {
  const token = await getToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};

const FieldLabel = ({ children, required = false }) => (
  <View style={styles.labelRow}>
    <Text style={styles.fieldLabel}>{children}</Text>
    {required ? <Text style={styles.required}>*</Text> : null}
  </View>
);

const IconBox = ({ name, size = 18, color = COLORS.primary }) => (
  <View style={styles.iconBox}>
    <Ionicons name={name} size={size} color={color} />
  </View>
);

const SelectField = ({
  label,
  value,
  placeholder,
  options,
  onChange,
  icon,
  disabled = false,
  loading = false,
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((item) => item.value === value);

  return (
    <View style={styles.fieldWrap}>
      <FieldLabel>{label}</FieldLabel>

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selectButton,
          disabled && styles.disabledControl,
          pressed && !disabled && styles.pressedControl,
        ]}
      >
        <IconBox name={icon} />
        <View style={styles.selectTextWrap}>
          <Text
            numberOfLines={1}
            style={[
              styles.selectText,
              !selected && styles.placeholderText,
            ]}
          >
            {loading ? "Loading..." : selected?.label || placeholder}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={18}
          color={COLORS.muted}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.dropdownBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View style={styles.dropdownCard}>
            <View style={styles.dropdownHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dropdownTitle}>{label}</Text>
                <Text style={styles.dropdownSubtitle}>
                  Select one option
                </Text>
              </View>

              <Pressable
                onPress={() => setOpen(false)}
                style={styles.closeSmallButton}
              >
                <Ionicons name="close" size={20} color={COLORS.muted} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownList}
            >
              <Pressable
                onPress={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.optionRow,
                  !value && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    !value && styles.optionTextSelected,
                  ]}
                >
                  {placeholder}
                </Text>
                {!value ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.primary}
                  />
                ) : null}
              </Pressable>

              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionRow,
                      isSelected && styles.optionSelected,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.optionMain}>
                      {option.icon ? (
                        <Ionicons
                          name={option.icon}
                          size={17}
                          color={
                            isSelected ? COLORS.primary : COLORS.muted
                          }
                        />
                      ) : null}

                      <Text
                        numberOfLines={2}
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>

                    {isSelected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}

              {!options.length && (
                <View style={styles.noOptionBox}>
                  <Ionicons
                    name="file-tray-outline"
                    size={30}
                    color={COLORS.lightText}
                  />
                  <Text style={styles.noOptionText}>
                    No options available
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const StatCard = ({ title, value, icon, tone }) => {
  const toneMap = {
    purple: {
      bg: COLORS.primarySoft,
      color: COLORS.primary,
    },
    green: {
      bg: COLORS.greenSoft,
      color: COLORS.green,
    },
    red: {
      bg: COLORS.redSoft,
      color: COLORS.red,
    },
    amber: {
      bg: COLORS.amberSoft,
      color: COLORS.amber,
    },
  };

  const current = toneMap[tone] || toneMap.purple;

  return (
    <View style={styles.statCard}>
      <View style={styles.statTextBlock}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue} numberOfLines={1}>
          {value}
        </Text>
      </View>

      <View
        style={[
          styles.statIcon,
          { backgroundColor: current.bg },
        ]}
      >
        <Ionicons name={icon} size={21} color={current.color} />
      </View>
    </View>
  );
};

const ServiceCard = ({
  service,
  salonName,
  categoryName,
  onEdit,
  onDeactivate,
  onActivate,
}) => {
  const isActive = service?.isActive !== false;

  return (
    <View style={styles.serviceCard}>
      <View style={styles.serviceTop}>
        <View style={styles.serviceTopRow}>
          <View style={styles.serviceCategoryWrap}>
            <View style={styles.serviceIcon}>
              <Ionicons
                name="sparkles-outline"
                size={17}
                color="#FFFFFF"
              />
            </View>

            <Text
              numberOfLines={1}
              style={styles.serviceCategory}
            >
              {categoryName}
            </Text>
          </View>

          <View
            style={[
              styles.statusPill,
              isActive
                ? styles.statusActive
                : styles.statusInactive,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? COLORS.green
                    : "#FFFFFF",
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: isActive ? COLORS.green : "#FFFFFF",
                },
              ]}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.serviceBody}>
        <Text
          style={styles.serviceName}
          numberOfLines={2}
        >
          {service?.name || "Unnamed Service"}
        </Text>

        <Text
          style={styles.serviceDescription}
          numberOfLines={3}
        >
          {service?.description || "No description available."}
        </Text>

        <View style={styles.salonRow}>
          <Ionicons
            name="storefront-outline"
            size={16}
            color={COLORS.primary}
          />
          <Text
            style={styles.salonName}
            numberOfLines={2}
          >
            {salonName}
          </Text>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <View style={styles.metricLabelRow}>
              <Ionicons
                name="cash-outline"
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.metricLabel}>PRICE</Text>
            </View>
            <Text style={styles.metricValue} numberOfLines={1}>
              ₹{Number(service?.price || 0).toLocaleString("en-IN")}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <View style={styles.metricLabelRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={COLORS.muted}
              />
              <Text style={styles.metricLabel}>DURATION</Text>
            </View>
            <Text style={styles.metricValue} numberOfLines={1}>
              {service?.duration || 0} min
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [
              styles.secondaryAction,
              pressed && styles.pressedControl,
            ]}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={COLORS.text}
            />
            <Text style={styles.secondaryActionText}>Edit</Text>
          </Pressable>

          {isActive ? (
            <Pressable
              onPress={onDeactivate}
              style={({ pressed }) => [
                styles.dangerAction,
                pressed && styles.pressedControl,
              ]}
            >
              <Ionicons
                name="power-outline"
                size={17}
                color={COLORS.red}
              />
              <Text style={styles.dangerActionText}>
                Deactivate
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={onActivate}
              style={({ pressed }) => [
                styles.successAction,
                pressed && styles.pressedControl,
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={17}
                color={COLORS.green}
              />
              <Text style={styles.successActionText}>
                Activate
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const ServicesManagement = () => {
  const { width } = useWindowDimensions();

  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSalons, setLoadingSalons] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [search, setSearch] = useState("");
  const [salonFilter, setSalonFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] =
    useState(false);

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const isDesktop = width >= 1100;
  const isTablet = width >= 700 && width < 1100;
  const isSmallMobile = width < 380;
  const contentMaxWidth = 1600;

  const showMessage = useCallback((text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearMessage = useCallback(() => setMessage(""), []);

  const loadSalons = useCallback(async () => {
    try {
      setLoadingSalons(true);
      const data = await fetchJson(`${API_URL}/salons`);
      const salonData = data?.salons || data?.data || data || [];
      setSalons(Array.isArray(salonData) ? salonData : []);
    } catch (error) {
      console.error("Failed to load salons:", error);
      setSalons([]);
      showMessage(
        getErrorMessage(error, "Unable to load salons.")
      );
    } finally {
      setLoadingSalons(false);
    }
  }, [showMessage]);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const data = await fetchJson(`${API_URL}/categories`);
      const categoryData =
        data?.categories || data?.data || data || [];
      setCategories(
        Array.isArray(categoryData) ? categoryData : []
      );
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
      showMessage(
        getErrorMessage(error, "Unable to load categories.")
      );
    } finally {
      setLoadingCategories(false);
    }
  }, [showMessage]);

  const loadServices = useCallback(
    async (options = {}) => {
      const { silent = false } = options;

      try {
        if (!silent) setLoading(true);

        const params = new URLSearchParams();

        if (salonFilter) params.append("salon", salonFilter);
        if (categoryFilter)
          params.append("category", categoryFilter);
        if (statusFilter) params.append("status", statusFilter);
        if (search.trim())
          params.append("search", search.trim());

        const query = params.toString();
        const filteredResponse = await getAllServicesAdmin(
          query ? Object.fromEntries(params.entries()) : {}
        );

        const serviceData =
          filteredResponse?.services || [];
        setServices(
          Array.isArray(serviceData) ? serviceData : []
        );

        const allResponse = await getAllServicesAdmin({});
        const allServiceData = allResponse?.services || [];

        setAllServices(
          Array.isArray(allServiceData) ? allServiceData : []
        );
      } catch (error) {
        console.error("Failed to load services:", error);
        setServices([]);
        setAllServices([]);
        showMessage(
          getErrorMessage(error, "Unable to load services.")
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [
      search,
      salonFilter,
      categoryFilter,
      statusFilter,
      showMessage,
    ]
  );

  useEffect(() => {
    loadSalons();
    loadCategories();
  }, [loadSalons, loadCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadServices();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadServices]);

  const stats = useMemo(() => {
    const total = allServices.length;

    const active = allServices.filter(
      (service) => service?.isActive !== false
    ).length;

    const inactive = allServices.filter(
      (service) => service?.isActive === false
    ).length;

    const prices = allServices
      .map((service) => Number(service?.price))
      .filter((price) => !Number.isNaN(price));

    const averagePrice =
      prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) /
          prices.length
        : 0;

    return {
      total,
      active,
      inactive,
      averagePrice,
    };
  }, [allServices]);

  const salonOptions = useMemo(
    () =>
      salons
        .map((salon) => ({
          value: getId(salon),
          label: getSalonNameFromItem(salon),
          icon: "storefront-outline",
        }))
        .filter((item) => item.value),
    [salons]
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .map((category) => ({
          value: getId(category),
          label: getCategoryNameFromItem(category),
          icon: "pricetags-outline",
        }))
        .filter((item) => item.value),
    [categories]
  );

  const statusOptions = [
    {
      value: "active",
      label: "Active",
      icon: "checkmark-circle-outline",
    },
    {
      value: "inactive",
      label: "Inactive",
      icon: "close-circle-outline",
    },
  ];

  const getSalonName = useCallback(
    (service) => {
      if (service?.salon?.name) return service.salon.name;
      if (service?.salon?.salonName)
        return service.salon.salonName;

      const salonId =
        typeof service?.salon === "object"
          ? getId(service.salon)
          : service?.salon;

      const salon = salons.find(
        (item) => getId(item) === salonId
      );

      return salon
        ? getSalonNameFromItem(salon)
        : "Salon";
    },
    [salons]
  );

  const getCategoryName = useCallback(
    (service) => {
      if (service?.category?.name)
        return service.category.name;

      const categoryId =
        typeof service?.category === "object"
          ? getId(service.category)
          : service?.category;

      const category = categories.find(
        (item) => getId(item) === categoryId
      );

      return category
        ? getCategoryNameFromItem(category)
        : "Category";
    },
    [categories]
  );

  const openCreateModal = () => {
    clearMessage();
    setEditingService(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (service) => {
    clearMessage();
    setEditingService(service);

    setForm({
      salon:
        service?.salon?._id ||
        service?.salon?.id ||
        service?.salon ||
        "",
      category:
        service?.category?._id ||
        service?.category?.id ||
        service?.category ||
        "",
      name: service?.name || "",
      description: service?.description || "",
      price:
        service?.price === undefined ||
        service?.price === null
          ? ""
          : String(service.price),
      duration:
        service?.duration === undefined ||
        service?.duration === null
          ? ""
          : String(service.duration),
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    setEditingService(null);
    setForm(initialForm);
    clearMessage();
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    clearMessage();

    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!form.salon) {
      showMessage("Please select a salon.");
      return;
    }

    if (!form.category) {
      showMessage("Please select a category.");
      return;
    }

    if (!name) {
      showMessage("Please enter the service name.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      showMessage("Please enter a valid price.");
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      showMessage("Please enter a valid duration.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        salon: form.salon,
        category: form.category,
        name,
        description,
        price,
        duration,
      };

      if (editingService) {
        await updateService(editingService._id, payload);
      } else {
        await createService(payload);
      }

      setShowModal(false);
      setEditingService(null);
      setForm(initialForm);

      showMessage(
        editingService
          ? "Service updated successfully."
          : "Service created successfully.",
        "success"
      );

      await loadServices({ silent: true });
    } catch (error) {
      console.error("Failed to save service:", error);
      showMessage(
        getErrorMessage(error, "Unable to save service.")
      );
    } finally {
      setLoading(false);
    }
  };

  const openDeactivateModal = (service) => {
    clearMessage();
    setSelectedService(service);
    setShowDeactivateModal(true);
  };

  const closeDeactivateModal = () => {
    if (loading) return;

    setSelectedService(null);
    setShowDeactivateModal(false);
  };

  const handleDeactivate = async () => {
    if (!selectedService) return;

    try {
      setLoading(true);
      await deactivateService(selectedService._id);

      setSelectedService(null);
      setShowDeactivateModal(false);

      showMessage(
        "Service deactivated successfully.",
        "success"
      );

      await loadServices({ silent: true });
    } catch (error) {
      console.error("Failed to deactivate service:", error);
      showMessage(
        getErrorMessage(
          error,
          "Unable to deactivate service."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (service) => {
    try {
      setLoading(true);
      await activateService(service._id);

      showMessage(
        "Service activated successfully.",
        "success"
      );

      await loadServices({ silent: true });
    } catch (error) {
      console.error("Failed to activate service:", error);
      showMessage(
        getErrorMessage(error, "Unable to activate service.")
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setSalonFilter("");
    setCategoryFilter("");
    setStatusFilter("");
    clearMessage();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadSalons(),
      loadCategories(),
      loadServices({ silent: true }),
    ]);
    setRefreshing(false);
  };

  const cardWidth = isDesktop
    ? "23.5%"
    : isTablet
      ? "48.5%"
      : "100%";

  const filterWidth = isDesktop
    ? "23.5%"
    : isTablet
      ? "48.5%"
      : "100%";

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              width < 380 ? 12 : width < 700 ? 18 : 28,
          },
        ]}
      >
        <View
          style={[
            styles.container,
            { maxWidth: contentMaxWidth },
          ]}
        >
          {/* Header */}
          <View style={[styles.hero, isSmallMobile && styles.heroSmall]}>
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbMuted}>Admin</Text>
              <Ionicons
                name="chevron-forward"
                size={13}
                color="#A1A1AA"
              />
              <Text
                style={styles.breadcrumbCurrent}
                numberOfLines={1}
              >
                Services Management
              </Text>
            </View>

            <View
              style={[
                styles.heroContent,
                !isDesktop && styles.heroContentStack,
              ]}
            >
              <View style={[styles.heroTitleRow, isSmallMobile && styles.heroTitleRowSmall]}>
                <View style={[styles.heroIcon, isSmallMobile && styles.heroIconSmall]}>
                  <Ionicons
                    name="sparkles"
                    size={24}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroTextBlock}>
                  <Text style={[styles.heroTitle, isSmallMobile && styles.heroTitleSmall]}>
                    Services Management
                  </Text>
                  <Text style={[styles.heroSubtitle, isSmallMobile && styles.heroSubtitleSmall]}>
                    Manage salon services, pricing and duration.
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.heroActions,
                  !isDesktop && styles.heroActionsFull,
                  isSmallMobile && styles.heroActionsSmall,
                ]}
              >
                <Pressable
                  onPress={handleRefresh}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.refreshButton,
                    !isDesktop && styles.actionFlex,
                    isSmallMobile && styles.actionFlexSmall,
                    pressed && styles.pressedControl,
                  ]}
                >
                  <Ionicons
                    name="refresh"
                    size={18}
                    color={COLORS.text}
                  />
                  <Text style={styles.refreshText}>
                    Refresh
                  </Text>
                </Pressable>

                <Pressable
                  onPress={openCreateModal}
                  style={({ pressed }) => [
                    styles.addButton,
                    !isDesktop && styles.actionFlex,
                    isSmallMobile && styles.actionFlexSmall,
                    pressed && styles.primaryPressed,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.addButtonText}>
                    Add Service
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Message */}
          {!!message && (
            <View
              style={[
                styles.messageBanner,
                messageType === "success"
                  ? styles.messageSuccess
                  : styles.messageError,
              ]}
            >
              <Ionicons
                name={
                  messageType === "success"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={19}
                color={
                  messageType === "success"
                    ? COLORS.green
                    : COLORS.red
                }
              />

              <Text
                style={[
                  styles.messageText,
                  {
                    color:
                      messageType === "success"
                        ? "#047857"
                        : "#BE123C",
                  },
                ]}
              >
                {message}
              </Text>

              <Pressable onPress={clearMessage}>
                <Ionicons
                  name="close"
                  size={18}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>
          )}

          {/* Stats */}
          <View style={styles.sectionGap}>
            <View style={styles.statsRow}>
              <View style={{ width: cardWidth }}>
                <StatCard
                  title="Total Services"
                  value={stats.total}
                  icon="layers-outline"
                  tone="purple"
                />
              </View>

              <View style={{ width: cardWidth }}>
                <StatCard
                  title="Active Services"
                  value={stats.active}
                  icon="checkmark-circle-outline"
                  tone="green"
                />
              </View>

              <View style={{ width: cardWidth }}>
                <StatCard
                  title="Inactive Services"
                  value={stats.inactive}
                  icon="close-circle-outline"
                  tone="red"
                />
              </View>

              <View style={{ width: cardWidth }}>
                <StatCard
                  title="Average Price"
                  value={`₹${Math.round(
                    stats.averagePrice
                  ).toLocaleString("en-IN")}`}
                  icon="cash-outline"
                  tone="amber"
                />
              </View>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterCard}>
            <View style={styles.filterHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterTitle}>
                  Search & Filters
                </Text>
                <Text style={styles.filterSubtitle}>
                  Quickly find and filter salon services.
                </Text>
              </View>

              {!!(
                search ||
                salonFilter ||
                categoryFilter ||
                statusFilter
              ) && (
                <Pressable
                  onPress={resetFilters}
                  style={styles.resetButton}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={15}
                    color={COLORS.primary}
                  />
                  <Text style={styles.resetText}>
                    Reset Filters
                  </Text>
                </Pressable>
              )}
            </View>

            <View style={styles.filterGrid}>
              <View
                style={[
                  styles.filterField,
                  { width: filterWidth },
                ]}
              >
                <FieldLabel>Search</FieldLabel>
                <View style={styles.inputWrap}>
                  <Ionicons
                    name="search"
                    size={18}
                    color={COLORS.lightText}
                  />
                  <TextInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search service name..."
                    placeholderTextColor={COLORS.lightText}
                    style={styles.textInput}
                    returnKeyType="search"
                    clearButtonMode={
                      Platform.OS === "ios" ? "while-editing" : "never"
                    }
                  />
                  {!!search && Platform.OS !== "ios" && (
                    <Pressable
                      onPress={() => setSearch("")}
                      hitSlop={10}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={COLORS.lightText}
                      />
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={{ width: filterWidth }}>
                <SelectField
                  label="Salon"
                  value={salonFilter}
                  placeholder="All Salons"
                  options={salonOptions}
                  onChange={setSalonFilter}
                  icon="storefront-outline"
                  loading={loadingSalons}
                  disabled={loadingSalons}
                />
              </View>

              <View style={{ width: filterWidth }}>
                <SelectField
                  label="Category"
                  value={categoryFilter}
                  placeholder="All Categories"
                  options={categoryOptions}
                  onChange={setCategoryFilter}
                  icon="pricetags-outline"
                  loading={loadingCategories}
                  disabled={loadingCategories}
                />
              </View>

              {!isDesktop && (
                <View style={{ width: filterWidth }}>
                  <SelectField
                    label="Status"
                    value={statusFilter}
                    placeholder="All Status"
                    options={statusOptions}
                    onChange={setStatusFilter}
                    icon="pulse-outline"
                  />
                </View>
              )}

              {isDesktop && (
                <View style={{ width: filterWidth }}>
                  <SelectField
                    label="Status"
                    value={statusFilter}
                    placeholder="All Status"
                    options={statusOptions}
                    onChange={setStatusFilter}
                    icon="pulse-outline"
                  />
                </View>
              )}
            </View>
          </View>

          {/* Loading */}
          {loading && (
            <View style={styles.loadingBanner}>
              <ActivityIndicator
                size="small"
                color={COLORS.primary}
              />
              <Text style={styles.loadingText}>
                Updating services...
              </Text>
            </View>
          )}

          {/* Empty */}
          {!loading && services.length === 0 && (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="sparkles-outline"
                  size={30}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No services found
              </Text>

              <Text style={styles.emptyText}>
                There are no services matching your current
                filters.
              </Text>

              {!!(
                search ||
                salonFilter ||
                categoryFilter ||
                statusFilter
              ) && (
                <Pressable
                  onPress={resetFilters}
                  style={styles.clearFiltersButton}
                >
                  <Text style={styles.clearFiltersText}>
                    Clear Filters
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Services */}
          {!loading && services.length > 0 && (
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <View
                  key={service?._id || service?.id}
                  style={{ width: cardWidth }}
                >
                  <ServiceCard
                    service={service}
                    salonName={getSalonName(service)}
                    categoryName={getCategoryName(service)}
                    onEdit={() => openEditModal(service)}
                    onDeactivate={() =>
                      openDeactivateModal(service)
                    }
                    onActivate={() =>
                      handleActivate(service)
                    }
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create / Edit */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => !loading && closeModal()}
          />

          <View
            style={[
              styles.formModal,
              isSmallMobile && styles.formModalSmall,
              {
                width:
                  width < 380
                    ? "96%"
                    : width < 500
                      ? "94%"
                      : width < 900
                        ? "88%"
                        : 760,
                maxHeight:
                  width < 380 ? "94%" : width < 500 ? "92%" : "88%",
              },
            ]}
          >
            <View style={[styles.modalHeader, isSmallMobile && styles.modalHeaderSmall]}>
              <View style={styles.modalHeaderText}>
                <Text style={[styles.modalEyebrow, isSmallMobile && styles.modalEyebrowSmall]}>
                  {editingService ? "EDIT SERVICE" : "NEW SERVICE"}
                </Text>
                <Text style={[styles.modalTitle, isSmallMobile && styles.modalTitleSmall]}>
                  {editingService
                    ? "Edit salon service"
                    : "Create salon service"}
                </Text>
                <Text style={[styles.modalSubtitle, isSmallMobile && styles.modalSubtitleSmall]}>
                  Add service details, pricing and duration.
                </Text>
              </View>

              <Pressable
                onPress={closeModal}
                disabled={loading}
                style={[styles.modalClose, isSmallMobile && styles.modalCloseSmall]}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color={COLORS.muted}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={[styles.formContent, isSmallMobile && styles.formContentSmall]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {!!message && messageType === "error" && (
                <View style={styles.formError}>
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color={COLORS.red}
                  />
                  <Text style={styles.formErrorText}>
                    {message}
                  </Text>
                </View>
              )}

              <View style={[styles.formGrid, isSmallMobile && styles.formGridSmall]}>
                <View
                  style={[
                    styles.formField,
                    { width: isTablet || isDesktop ? "48.7%" : "100%" },
                  ]}
                >
                  <SelectField
                    label="Salon"
                    value={form.salon}
                    placeholder="Select salon"
                    options={salonOptions}
                    onChange={(value) =>
                      handleChange("salon", value)
                    }
                    icon="storefront-outline"
                    loading={loadingSalons}
                    disabled={loadingSalons}
                  />
                </View>

                <View
                  style={[
                    styles.formField,
                    { width: isTablet || isDesktop ? "48.7%" : "100%" },
                  ]}
                >
                  <SelectField
                    label="Category"
                    value={form.category}
                    placeholder="Select category"
                    options={categoryOptions}
                    onChange={(value) =>
                      handleChange("category", value)
                    }
                    icon="pricetags-outline"
                    loading={loadingCategories}
                    disabled={loadingCategories}
                  />
                </View>

                <View style={styles.fullField}>
                  <FieldLabel required>Service Name</FieldLabel>
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="sparkles-outline"
                      size={18}
                      color={COLORS.lightText}
                    />
                    <TextInput
                      value={form.name}
                      onChangeText={(value) =>
                        handleChange("name", value)
                      }
                      placeholder="Eg: Hair Cut"
                      placeholderTextColor={COLORS.lightText}
                      style={styles.textInput}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <View style={styles.fullField}>
                  <FieldLabel>Description</FieldLabel>
                  <View
                    style={[
                      styles.inputWrap,
                      styles.textareaWrap,
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={18}
                      color={COLORS.lightText}
                      style={styles.textareaIcon}
                    />
                    <TextInput
                      value={form.description}
                      onChangeText={(value) =>
                        handleChange("description", value)
                      }
                      placeholder="Describe this service..."
                      placeholderTextColor={COLORS.lightText}
                      style={[
                        styles.textInput,
                        styles.textarea,
                      ]}
                      multiline
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.formField,
                    { width: isTablet || isDesktop ? "48.7%" : "100%" },
                  ]}
                >
                  <FieldLabel required>Price (₹)</FieldLabel>
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={COLORS.lightText}
                    />
                    <TextInput
                      value={String(form.price)}
                      onChangeText={(value) =>
                        handleChange(
                          "price",
                          value.replace(/[^0-9.]/g, "")
                        )
                      }
                      placeholder="500"
                      placeholderTextColor={COLORS.lightText}
                      style={styles.textInput}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View
                  style={[
                    styles.formField,
                    { width: isTablet || isDesktop ? "48.7%" : "100%" },
                  ]}
                >
                  <FieldLabel required>
                    Duration (minutes)
                  </FieldLabel>
                  <View style={styles.inputWrap}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={COLORS.lightText}
                    />
                    <TextInput
                      value={String(form.duration)}
                      onChangeText={(value) =>
                        handleChange(
                          "duration",
                          value.replace(/[^0-9]/g, "")
                        )
                      }
                      placeholder="45"
                      placeholderTextColor={COLORS.lightText}
                      style={styles.textInput}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={[styles.modalFooter, isSmallMobile && styles.modalFooterSmall]}>
              <Pressable
                onPress={closeModal}
                disabled={loading}
                style={({ pressed }) => [
                  styles.cancelButton,
                  isSmallMobile && styles.modalActionSmall,
                  pressed && styles.pressedControl,
                ]}
              >
                <Text style={styles.cancelText} numberOfLines={1}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitButton,
                  isSmallMobile && styles.modalActionSmall,
                  loading && styles.disabledSubmit,
                  pressed && styles.primaryPressed,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name={
                      editingService
                        ? "checkmark-circle-outline"
                        : "add-circle-outline"
                    }
                    size={isSmallMobile ? 16 : 18}
                    color="#FFFFFF"
                  />
                )}

                <Text
                  style={[styles.submitText, isSmallMobile && styles.submitTextSmall]}
                  numberOfLines={1}
                  allowFontScaling={false}
                >
                  {loading
                    ? "Saving..."
                    : editingService
                      ? "Update Service"
                      : "Create Service"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deactivate confirmation */}
      <Modal
        visible={showDeactivateModal}
        transparent
        animationType="fade"
        onRequestClose={closeDeactivateModal}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() =>
              !loading && closeDeactivateModal()
            }
          />

          <View
            style={[
              styles.confirmModal,
              { width: width < 500 ? "92%" : 440 },
            ]}
          >
            <View style={styles.confirmTop}>
              <View style={styles.warningIcon}>
                <Ionicons
                  name="warning-outline"
                  size={25}
                  color={COLORS.red}
                />
              </View>

              <View style={styles.confirmTextBlock}>
                <Text style={styles.confirmTitle}>
                  Deactivate Service?
                </Text>
                <Text style={styles.confirmText}>
                  Are you sure you want to deactivate{" "}
                  <Text style={styles.confirmStrong}>
                    {selectedService?.name || "this service"}
                  </Text>
                  ?
                </Text>
              </View>
            </View>

            <View style={styles.confirmActions}>
              <Pressable
                onPress={closeDeactivateModal}
                disabled={loading}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText} numberOfLines={1}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleDeactivate}
                disabled={loading}
                style={[
                  styles.deactivateButton,
                  loading && styles.disabledDanger,
                ]}
              >
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Ionicons
                    name="power-outline"
                    size={18}
                    color="#FFFFFF"
                  />
                )}
                <Text style={styles.submitText}>
                  {loading ? "Deactivating..." : "Deactivate"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    paddingTop: Platform.OS === "web" ? 76 : 22,
    paddingBottom: 40,
  },

  container: {
    width: "100%",
    alignSelf: "center",
  },

  heroSmall: {
    padding: 14,
    borderRadius: 20,
    marginBottom: 14,
  },

  heroTitleRowSmall: {
    alignItems: "flex-start",
  },

  heroIconSmall: {
    width: 46,
    height: 46,
    borderRadius: 14,
    marginRight: 10,
  },

  heroTitleSmall: {
    fontSize: 23,
    lineHeight: 27,
    letterSpacing: -0.45,
  },

  heroSubtitleSmall: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 17,
  },

  heroActionsSmall: {
    gap: 8,
  },

  actionFlexSmall: {
    minWidth: 0,
    paddingHorizontal: 10,
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EDE9FE",
    borderRadius: 26,
    padding: 26,
    marginBottom: 18,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },

  heroGlowOne: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    right: -100,
    top: -130,
    backgroundColor: "#EDE9FE",
    opacity: 0.65,
  },

  heroGlowTwo: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    right: "28%",
    bottom: -90,
    backgroundColor: "#FCE7F3",
    opacity: 0.5,
  },

  breadcrumb: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 20,
  },

  breadcrumbMuted: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A1A1AA",
  },

  breadcrumbCurrent: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    color: "#52525B",
  },

  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  heroContentStack: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    flex: 1,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 7 },
    elevation: 5,
  },

  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: COLORS.text,
    letterSpacing: -0.7,
  },

  heroSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.muted,
  },

  heroActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  heroActionsFull: {
    width: "100%",
  },

  actionFlex: {
    flex: 1,
  },

  refreshButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  refreshText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
  },

  addButton: {
    minHeight: 46,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 7,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  addButtonText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  primaryPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },

  pressedControl: {
    opacity: 0.72,
  },

  messageBanner: {
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },

  messageSuccess: {
    backgroundColor: COLORS.greenSoft,
    borderColor: "#A7F3D0",
  },

  messageError: {
    backgroundColor: COLORS.redSoft,
    borderColor: "#FECDD3",
  },

  messageText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },

  sectionGap: {
    marginBottom: 18,
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },

  statCard: {
    minHeight: 112,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },

  statTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  statTitle: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: COLORS.lightText,
  },

  statValue: {
    marginTop: 5,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "900",
    color: COLORS.text,
  },

  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  filterCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 18,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 1,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 17,
  },

  filterTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    color: COLORS.text,
  },

  filterSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    color: COLORS.lightText,
  },

  resetButton: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  resetText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.primary,
  },

  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  filterField: {
    minWidth: 0,
  },

  fieldWrap: {
    width: "100%",
  },

  labelRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  fieldLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "900",
    color: "#4B5563",
  },

  required: {
    marginLeft: 3,
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "900",
  },

  inputWrap: {
    minHeight: 46,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.input,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },

  textInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 46,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 14,
    fontWeight: "650",
    color: COLORS.text,
    outlineStyle: "none",
  },

  selectButton: {
    minHeight: 46,
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.input,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingRight: 14,
    gap: 10,
  },

  selectTextWrap: {
    flex: 1,
    minWidth: 0,
  },

  selectText: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: COLORS.text,
  },

  placeholderText: {
    color: COLORS.muted,
  },

  iconBox: {
    width: 27,
    height: 27,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3E8FF",
  },

  disabledControl: {
    opacity: 0.55,
  },

  loadingBanner: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },

  emptyCard: {
    minHeight: 330,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 45,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySoft,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    color: COLORS.text,
  },

  emptyText: {
    maxWidth: 430,
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    color: COLORS.muted,
  },

  clearFiltersButton: {
    minHeight: 43,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 17,
  },

  clearFiltersText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  serviceCard: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.055,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },

  serviceTop: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: COLORS.primary,
  },

  serviceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  serviceCategoryWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.17)",
  },

  serviceCategory: {
    flex: 1,
    minWidth: 0,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    textTransform: "uppercase",
  },

  statusPill: {
    minHeight: 26,
    borderRadius: 20,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  statusActive: {
    backgroundColor: "#D1FAE5",
  },

  statusInactive: {
    backgroundColor: "rgba(255,255,255,0.15)",
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
    letterSpacing: 0.4,
  },

  serviceBody: {
    padding: 17,
  },

  serviceName: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "900",
    color: COLORS.text,
  },

  serviceDescription: {
    minHeight: 57,
    marginTop: 7,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: "500",
    color: COLORS.muted,
  },

  salonRow: {
    minHeight: 45,
    marginTop: 13,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  salonName: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: "#475569",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 10,
  },

  metricBox: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#F8FAFC",
    padding: 11,
  },

  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metricLabel: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.lightText,
    letterSpacing: 0.5,
  },

  metricValue: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "900",
    color: COLORS.text,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 12,
  },

  secondaryAction: {
    flex: 1,
    minHeight: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  secondaryActionText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.text,
  },

  dangerAction: {
    flex: 1,
    minHeight: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECDD3",
    backgroundColor: COLORS.redSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  dangerActionText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.red,
  },

  successAction: {
    flex: 1,
    minHeight: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: COLORS.greenSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  successActionText: {
    fontSize: 12,
    fontWeight: "900",
    color: COLORS.green,
  },

  dropdownBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.62)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  dropdownCard: {
    width: "100%",
    maxWidth: 560,
    maxHeight: "78%",
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },

  dropdownHeader: {
    minHeight: 72,
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  dropdownTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.text,
  },

  dropdownSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.lightText,
  },

  closeSmallButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  dropdownList: {
    padding: 10,
  },

  optionRow: {
    width: "100%",
    minHeight: 50,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  optionMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  optionSelected: {
    backgroundColor: "#F5F3FF",
  },

  optionPressed: {
    backgroundColor: "#F1F5F9",
  },

  optionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: "#374151",
  },

  optionTextSelected: {
    fontWeight: "900",
    color: COLORS.primary,
  },

  noOptionBox: {
    minHeight: 130,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  noOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.lightText,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  formModalSmall: {
    borderRadius: 21,
  },

  modalHeaderSmall: {
    minHeight: 86,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 9,
  },

  modalEyebrowSmall: {
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 1.15,
  },

  modalTitleSmall: {
    marginTop: 2,
    fontSize: 19,
    lineHeight: 23,
  },

  modalSubtitleSmall: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
  },

  modalCloseSmall: {
    width: 38,
    height: 38,
    borderRadius: 11,
  },

  formContentSmall: {
    paddingHorizontal: 14,
    paddingVertical: 15,
  },

  modalFooterSmall: {
    minHeight: 66,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
  },

  modalActionSmall: {
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: 6,
    borderRadius: 12,
  },

  submitTextSmall: {
    flexShrink: 0,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: -0.15,
  },

  formModal: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 15,
  },

  modalHeader: {
    minHeight: 102,
    paddingHorizontal: 21,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
  },

  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  modalEyebrow: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: COLORS.primary,
  },

  modalTitle: {
    marginTop: 2,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "900",
    color: COLORS.text,
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
    color: COLORS.muted,
  },

  modalClose: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },

  formScroll: {
    flex: 1,
  },

  formContent: {
    paddingHorizontal: 21,
    paddingVertical: 21,
  },

  formError: {
    minHeight: 45,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "#FECDD3",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },

  formErrorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: COLORS.red,
  },

  formGridSmall: {
    rowGap: 13,
  },

  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
  },

  formField: {
    minWidth: 0,
  },

  fullField: {
    width: "100%",
    minWidth: 0,
  },

  textareaWrap: {
    minHeight: 118,
    alignItems: "flex-start",
    paddingTop: 13,
  },

  textareaIcon: {
    marginTop: 2,
  },

  textarea: {
    minHeight: 90,
    paddingTop: 0,
    lineHeight: 20,
  },

  modalFooter: {
    minHeight: 74,
    paddingHorizontal: 21,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "rgba(255,255,255,0.97)",
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 0.9,
    minWidth: 0,
    minHeight: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#475569",
  },

  submitButton: {
    flex: 1.1,
    minWidth: 0,
    minHeight: 46,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 7,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  disabledSubmit: {
    opacity: 0.6,
  },

  submitText: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
  },

  confirmModal: {
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 21,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 15,
  },

  confirmTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
  },

  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.redSoft,
  },

  confirmTextBlock: {
    flex: 1,
    minWidth: 0,
  },

  confirmTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
    color: COLORS.text,
  },

  confirmText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    color: COLORS.muted,
  },

  confirmStrong: {
    fontWeight: "900",
    color: COLORS.text,
  },

  confirmActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  deactivateButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  disabledDanger: {
    opacity: 0.6,
  },
});

export default ServicesManagement;
