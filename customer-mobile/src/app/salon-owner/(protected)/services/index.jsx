import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
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
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import {
  getSalonServices,
  createService,
  updateService,
  deleteService,
  activateService,
} from "../../../../services/SalonOwnerServiceService";

import salonOwnerInstance from "../../../../services/axiosInstance";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  background: "#F6F7FB",
  white: "#FFFFFF",

  slate950: "#0F172A",
  slate900: "#111827",
  slate800: "#1E293B",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748B",
  slate400: "#94A3B8",
  slate300: "#CBD5E1",
  slate200: "#E2E8F0",
  slate100: "#F1F5F9",
  slate50: "#F8FAFC",

  violet: "#7C3AED",
  violetDark: "#6D28D9",
  violetSoft: "#F5F3FF",

  emerald: "#059669",
  emeraldSoft: "#ECFDF5",

  rose: "#E11D48",
  roseSoft: "#FFF1F2",

  amber: "#D97706",
  amberSoft: "#FFFBEB",
};

const INITIAL_FORM = {
  salon: "",
  category: "",
  name: "",
  description: "",
  price: "",
  duration: "",
};

/* =========================================================
   HELPERS
========================================================= */

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const getSalonName = (salon) =>
  salon?.name ||
  salon?.salonName ||
  salon?.businessName ||
  "Unnamed Salon";

const getCategoryName = (category) =>
  category?.name ||
  category?.categoryName ||
  "Unnamed Category";

const getCategoryFromService = (service) =>
  service?.category?.name ||
  service?.category?.categoryName ||
  service?.categoryName ||
  "Uncategorized";

const formatPrice = (price) => {
  const value = Number(price);
  if (!Number.isFinite(value)) return "₹0";
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
};

const formatDuration = (duration) => {
  const value = Number(duration);

  if (!Number.isFinite(value) || value <= 0) {
    return "Not specified";
  }

  if (value < 60) return `${value} min`;

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
};

/* =========================================================
   MAIN
========================================================= */

export default function SalonOwnerServices() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  /*
   * Use the real page width when this screen is rendered beside
   * a sidebar. This avoids using the full browser width for layout
   * decisions when the content area is actually narrower.
   */
  const [pageWidth, setPageWidth] = useState(0);

  const width = pageWidth || windowWidth;

  // Breakpoints are based on the actual content width, not the browser width.
  // Small: <360 | Mobile: 360-599 | Large mobile: 600-767
  // Tablet: 768-1099 | Desktop: 1100-1439 | Wide: 1440+
  const isSmallMobile = width < 360;
  const isMobile = width < 600;
  const isLargeMobile = width >= 600 && width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;
  const isWideDesktop = width >= 1440;

  const horizontalPadding = isSmallMobile
    ? 12
    : isMobile
      ? 16
      : isTablet
        ? 24
        : 30;

  const contentMaxWidth = isWideDesktop ? 1480 : 1280;

  /* =======================================================
     STATE
  ======================================================= */

  const [services, setServices] = useState([]);
  const [salons, setSalons] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedSalon, setSelectedSalon] = useState("");

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [salonLoading, setSalonLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectModal, setSelectModal] = useState(null);

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [form, setForm] = useState(INITIAL_FORM);

  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD SALONS
  ======================================================= */

  const loadSalons = useCallback(async () => {
    try {
      setSalonLoading(true);
      setError("");

      const response = await salonOwnerInstance.get(
        "/salons/owner/my-salons"
      );

      const data = response?.data;

      const salonList = Array.isArray(data?.salons)
        ? data.salons
        : Array.isArray(data)
          ? data
          : [];

      setSalons(salonList);

      /*
       * Keep the current salon if it still exists.
       * Otherwise choose the first salon.
       */
      setSelectedSalon((previous) => {
        const stillExists = salonList.some(
          (salon) => String(salon?._id) === String(previous)
        );

        return stillExists
          ? previous
          : salonList[0]?._id || "";
      });
    } catch (err) {
      setSalons([]);
      setSelectedSalon("");
      setError(getErrorMessage(err, "Failed to load salons."));
    } finally {
      setSalonLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  const loadCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);

      const response = await salonOwnerInstance.get("/categories");
      const data = response?.data;

      const categoryList = Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data)
          ? data
          : [];

      setCategories(
        categoryList.filter(
          (category) => category?.isActive !== false
        )
      );
    } catch (err) {
      setCategories([]);
      setError(
        getErrorMessage(err, "Failed to load categories.")
      );
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  /* =======================================================
     LOAD SERVICES
  ======================================================= */

  const loadServices = useCallback(async (salonId) => {
    if (!salonId) {
      setServices([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getSalonServices(salonId);

      const serviceList = Array.isArray(data?.services)
        ? data.services
        : Array.isArray(data)
          ? data
          : [];

      setServices(serviceList);
    } catch (err) {
      setServices([]);
      setError(
        getErrorMessage(err, "Failed to load services.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadSalons();
    loadCategories();
  }, [loadSalons, loadCategories]);

  /* =======================================================
     LOAD SERVICES WHEN SALON CHANGES
  ======================================================= */

  useEffect(() => {
    if (selectedSalon) {
      loadServices(selectedSalon);
    } else {
      setServices([]);
    }
  }, [selectedSalon, loadServices]);

  /* =======================================================
     SUCCESS MESSAGE
  ======================================================= */

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => setSuccess(""), 3000);
    return () => clearTimeout(timer);
  }, [success]);

  /* =======================================================
     CURRENT SALON
  ======================================================= */

  const currentSalon = useMemo(
    () =>
      salons.find(
        (salon) =>
          String(salon?._id) === String(selectedSalon)
      ),
    [salons, selectedSalon]
  );

  /* =======================================================
     FILTERED SERVICES
  ======================================================= */

  const filteredServices = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return services.filter((service) => {
      const categoryName = getCategoryFromService(service);

      const matchesSearch =
        !search ||
        String(service?.name || "")
          .toLowerCase()
          .includes(search) ||
        String(service?.description || "")
          .toLowerCase()
          .includes(search) ||
        String(categoryName)
          .toLowerCase()
          .includes(search);

      const active = service?.isActive !== false;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchText, statusFilter]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = services.length;

    const active = services.filter(
      (service) => service?.isActive !== false
    ).length;

    const inactive = services.filter(
      (service) => service?.isActive === false
    ).length;

    const prices = services
      .map((service) => Number(service?.price))
      .filter((price) => Number.isFinite(price));

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
  }, [services]);

  /* =======================================================
     FORM
  ======================================================= */

  const updateForm = useCallback((field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  const openCreateModal = () => {
    if (!selectedSalon) {
      setError("Please select a salon first.");
      return;
    }

    setEditingService(null);
    setForm({
      ...INITIAL_FORM,
      salon: selectedSalon,
    });
    setError("");
    setSelectModal(null);
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);

    setForm({
      salon:
        service?.salon?._id ||
        service?.salon ||
        selectedSalon ||
        "",

      category:
        service?.category?._id ||
        service?.category ||
        "",

      name: service?.name || "",
      description: service?.description || "",

      price:
        service?.price !== undefined &&
        service?.price !== null
          ? String(service.price)
          : "",

      duration:
        service?.duration !== undefined &&
        service?.duration !== null
          ? String(service.duration)
          : "",
    });

    setError("");
    setSelectModal(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingService(null);
    setForm(INITIAL_FORM);
    setError("");
    setSelectModal(null);
  };

  /* =======================================================
     DELETE / DEACTIVATE
  ======================================================= */

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setError("");
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (submitting) return;

    setDeleteModalOpen(false);
    setSelectedService(null);
    setError("");
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!form.salon) return "Please select a salon.";
    if (!form.category) return "Please select a category.";

    if (!form.name.trim()) {
      return "Service name is required.";
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      return "Please enter a valid price.";
    }

    if (
      form.duration === "" ||
      !Number.isFinite(Number(form.duration)) ||
      Number(form.duration) < 1
    ) {
      return "Duration must be at least 1 minute.";
    }

    return "";
  };

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      salon: form.salon,
      category: form.category,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
    };

    try {
      setSubmitting(true);
      setError("");

      if (editingService) {
        await updateService(editingService._id, payload);
        setSuccess("Service updated successfully.");
      } else {
        await createService(payload);
        setSuccess("Service created successfully.");
      }

      setModalOpen(false);
      setEditingService(null);
      setForm(INITIAL_FORM);
      setSelectModal(null);

      await loadServices(selectedSalon);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Something went wrong while saving the service."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     DEACTIVATE
  ======================================================= */

  const handleDeactivate = async () => {
    if (!selectedService?._id) return;

    try {
      setSubmitting(true);
      setError("");

      await deleteService(selectedService._id);

      setSuccess("Service deactivated successfully.");
      setDeleteModalOpen(false);
      setSelectedService(null);

      await loadServices(selectedSalon);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to deactivate service."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     ACTIVATE
  ======================================================= */

  const handleActivate = async (service) => {
    if (!service?._id) return;

    try {
      setActionLoadingId(service._id);
      setError("");

      await activateService(service._id);

      setSuccess("Service activated successfully.");
      await loadServices(selectedSalon);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to activate service."
        )
      );
    } finally {
      setActionLoadingId("");
    }
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    if (!selectedSalon) return;

    try {
      setRefreshing(true);

      await Promise.all([
        loadSalons(),
        loadCategories(),
      ]);

      await loadServices(selectedSalon);
      setSuccess("Services refreshed.");
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     SELECT MODAL

     IMPORTANT:
     heroSalon changes selectedSalon.
     formSalon changes only the form value.
     This fixes the original hero salon selector bug.
  ======================================================= */

  const openSelect = (type) => {
    if (type === "heroSalon" && salonLoading) return;
    if (type === "formSalon" && salonLoading) return;
    if (type === "category" && categoryLoading) return;

    setError("");
    setSelectModal(type);
  };

  const closeSelect = () => {
    setSelectModal(null);
  };

  const handleSalonSelect = (salonId) => {
    if (!salonId) return;

    setSelectedSalon(salonId);
    setSearchText("");
    setStatusFilter("ALL");
    setSelectModal(null);
    setError("");
  };

  const handleFormSalonSelect = (salonId) => {
    if (!salonId) return;

    updateForm("salon", salonId);
    setSelectModal(null);
    setError("");
  };

  const handleCategorySelect = (categoryId) => {
    if (!categoryId) return;

    updateForm("category", categoryId);
    setSelectModal(null);
    setError("");
  };

  const showPageError =
    Boolean(error) &&
    !modalOpen &&
    !deleteModalOpen &&
    !selectModal;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View
      style={styles.screen}
      onLayout={(event) => {
        const measuredWidth = event?.nativeEvent?.layout?.width || 0;
        if (measuredWidth > 0 && Math.abs(measuredWidth - pageWidth) > 1) {
          setPageWidth(measuredWidth);
        }
      }}
    >
      <View
        pointerEvents="none"
        style={[
          styles.backgroundOrb,
          styles.backgroundOrbOne,
          {
            width: isMobile ? 180 : 300,
            height: isMobile ? 180 : 300,
          },
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.backgroundOrb,
          styles.backgroundOrbTwo,
          {
            width: isMobile ? 160 : 280,
            height: isMobile ? 160 : 280,
          },
        ]}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isMobile ? 12 : 20,
            paddingBottom: 36,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
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
            styles.content,
            {
              maxWidth: contentMaxWidth,
            },
          ]}
        >
          {showPageError ? (
            <MessageBanner
              type="error"
              message={error}
              onClose={() => setError("")}
            />
          ) : null}

          {success ? (
            <MessageBanner
              type="success"
              message={success}
              onClose={() => setSuccess("")}
            />
          ) : null}

          {/* =================================================
              HERO
          ================================================= */}

          <View
            style={[
              styles.hero,
              {
                borderRadius: isMobile ? 20 : 26,
                padding: isSmallMobile
                  ? 16
                  : isMobile
                    ? 18
                    : isTablet
                      ? 24
                      : 30,
              },
            ]}
          >
            <View style={styles.heroAccent} />

            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeIcon}>
                <MaterialCommunityIcons
                  name="content-cut"
                  size={15}
                  color={COLORS.violet}
                />
              </View>

              <Text
                style={styles.heroBadgeText}
                numberOfLines={1}
              >
                SERVICE MANAGEMENT
              </Text>
            </View>

            <View
              style={[
                styles.heroMain,
                {
                  flexDirection: isDesktop ? "row" : "column",
                },
              ]}
            >
              <View
                style={[
                  styles.heroText,
                  {
                    flex: isDesktop ? 1 : undefined,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.heroTitle,
                    {
                      fontSize: isSmallMobile
                        ? 28
                        : isMobile
                          ? 31
                          : isTablet
                            ? 38
                            : 46,
                      lineHeight: isSmallMobile
                        ? 34
                        : isMobile
                          ? 38
                          : isTablet
                            ? 45
                            : 53,
                    },
                  ]}
                >
                  Manage Your Services
                </Text>

                <Text style={styles.heroDescription}>
                  Create, update and manage the beauty services
                  offered by your salons.
                </Text>
              </View>

              <View
                style={[
                  styles.heroControls,
                  {
                    width: isDesktop
                      ? isWideDesktop
                        ? 590
                        : 500
                      : "100%",
                    maxWidth: "100%",
                    flexShrink: 0,
                    flexDirection: isDesktop ? "row" : "column",
                  },
                ]}
              >
                <View
                  style={[
                    styles.heroSalonControl,
                    {
                      flex: isDesktop ? 1 : undefined,
                      width: isDesktop ? undefined : "100%",
                      marginRight: isDesktop ? 9 : 0,
                      marginBottom: isDesktop ? 0 : 10,
                    },
                  ]}
                >
                  <SelectField
                    label="Salon"
                    value={
                      currentSalon
                        ? getSalonName(currentSalon)
                        : salonLoading
                          ? "Loading salons..."
                          : "Select salon"
                    }
                    icon="grid"
                    disabled={
                      salonLoading || salons.length === 0
                    }
                    onPress={() => openSelect("heroSalon")}
                  />
                </View>

                <Pressable
                  disabled={!selectedSalon}
                  onPress={openCreateModal}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    {
                      width: isDesktop ? 132 : "100%",
                      opacity: !selectedSalon
                        ? 0.45
                        : pressed
                          ? 0.88
                          : 1,
                    },
                  ]}
                >
                  <Feather
                    name="plus"
                    size={18}
                    color={COLORS.white}
                  />
                  <Text
                    style={styles.primaryButtonText}
                    numberOfLines={1}
                  >
                    Add Service
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* =================================================
              CURRENT SALON
          ================================================= */}

          <View
            style={[
              styles.currentSalonCard,
              {
                borderRadius: isMobile ? 20 : 25,
                padding: isSmallMobile
                  ? 14
                  : isMobile
                    ? 16
                    : 20,
                flexDirection: isTablet || isDesktop ? "row" : "column",
              },
            ]}
          >
            <View
              style={[
                styles.currentSalonLeft,
                {
                  width:
                    isTablet || isDesktop
                      ? undefined
                      : "100%",
                },
              ]}
            >
              <View style={styles.currentSalonIcon}>
                <MaterialCommunityIcons
                  name="storefront-outline"
                  size={23}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.currentSalonInfo}>
                <Text style={styles.currentSalonLabel}>
                  CURRENTLY MANAGING
                </Text>

                <Text
                  style={styles.currentSalonName}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {currentSalon
                    ? getSalonName(currentSalon)
                    : "No salon selected"}
                </Text>

                <Text
                  style={styles.currentSalonAddress}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {currentSalon?.city
                    ? `${currentSalon.city} • `
                    : ""}
                  {currentSalon?.address ||
                    currentSalon?.location ||
                    "Salon location"}
                </Text>
              </View>
            </View>

            <Pressable
              disabled={loading || !selectedSalon}
              onPress={handleRefresh}
              style={({ pressed }) => [
                styles.refreshButton,
                {
                  width:
                    isTablet || isDesktop
                      ? 104
                      : "100%",
                  opacity:
                    loading || !selectedSalon
                      ? 0.5
                      : pressed
                        ? 0.75
                        : 1,
                },
              ]}
            >
              {refreshing ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.slate700}
                />
              ) : (
                <Feather
                  name="refresh-cw"
                  size={16}
                  color={COLORS.slate700}
                />
              )}

              <Text style={styles.refreshButtonText}>
                Refresh
              </Text>
            </Pressable>
          </View>

          {/* =================================================
              STATS
          ================================================= */}

          <View
            style={[
              styles.statsGrid,
              {
                marginHorizontal: isSmallMobile ? -3 : -5,
              },
            ]}
          >
            <StatCard
              compact={!isDesktop}
              label="Total Services"
              value={stats.total}
              caption="All services"
              icon="layers-outline"
              iconBackground={COLORS.violetSoft}
              iconColor={COLORS.violet}
            />

            <StatCard
              compact={!isDesktop}
              label="Active"
              value={stats.active}
              caption={`${
                stats.total
                  ? Math.round(
                      (stats.active / stats.total) * 100
                    )
                  : 0
              }% active`}
              icon="check-circle-outline"
              iconBackground={COLORS.emeraldSoft}
              iconColor={COLORS.emerald}
            />

            <StatCard
              compact={!isDesktop}
              label="Inactive"
              value={stats.inactive}
              caption="Hidden services"
              icon="close-circle-outline"
              iconBackground={COLORS.roseSoft}
              iconColor={COLORS.rose}
            />

            <StatCard
              compact={!isDesktop}
              label="Avg. Price"
              value={formatPrice(stats.averagePrice)}
              caption="Per service"
              icon="cash-outline"
              iconBackground={COLORS.amberSoft}
              iconColor={COLORS.amber}
              valueSmall
            />
          </View>

          {/* =================================================
              COMMAND CENTER
          ================================================= */}

          <View
            style={[
              styles.commandCard,
              {
                borderRadius: isMobile ? 20 : 25,
              },
            ]}
          >
            <View
              style={[
                styles.commandHeader,
                {
                  flexDirection: isDesktop ? "row" : "column",
                  alignItems: isDesktop ? "center" : "stretch",
                },
              ]}
            >
              <View
                style={[
                  styles.commandTitleArea,
                  {
                    flex: isDesktop ? 1 : undefined,
                  },
                ]}
              >
                <View style={styles.commandIcon}>
                  <Feather
                    name="grid"
                    size={17}
                    color={COLORS.violet}
                  />
                </View>

                <View style={styles.commandTitleTextArea}>
                  <Text style={styles.commandTitle}>
                    Services
                  </Text>

                  <Text style={styles.commandSubtitle}>
                    {filteredServices.length}{" "}
                    {filteredServices.length === 1
                      ? "service"
                      : "services"}{" "}
                    found
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.searchContainer,
                  {
                    width:
                      isDesktop
                        ? isWideDesktop
                          ? 480
                          : 390
                        : "100%",
                    marginTop: isDesktop ? 0 : 12,
                  },
                ]}
              >
                <Feather
                  name="search"
                  size={17}
                  color={COLORS.slate400}
                  style={styles.searchIcon}
                />

                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search services..."
                  placeholderTextColor={COLORS.slate400}
                  style={styles.searchInput}
                  returnKeyType="search"
                  autoCorrect={false}
                  autoCapitalize="none"
                  underlineColorAndroid="transparent"
                  clearButtonMode="never"
                />

                {searchText.length > 0 ? (
                  <Pressable
                    onPress={() => setSearchText("")}
                    style={styles.searchClear}
                    hitSlop={6}
                  >
                    <Feather
                      name="x"
                      size={15}
                      color={COLORS.slate500}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <View
              style={[
                styles.commandBottom,
                {
                  flexDirection:
                    isMobile ? "column" : "row",
                  alignItems:
                    isMobile ? "stretch" : "center",
                },
              ]}
            >
              <View
                style={[
                  styles.filterRow,
                  {
                    width: isMobile || isTablet ? "100%" : undefined,
                  },
                ]}
              >
                {["ALL", "ACTIVE", "INACTIVE"].map((status, index) => {
                  const selected = statusFilter === status;

                  return (
                    <Pressable
                      key={status}
                      onPress={() => setStatusFilter(status)}
                      style={({ pressed }) => [
                        styles.filterButton,
                        selected
                          ? styles.filterButtonActive
                          : styles.filterButtonInactive,
                        {
                          flex: isMobile || isTablet ? 1 : undefined,
                          marginRight: index === 2 ? 0 : 7,
                          opacity: pressed ? 0.78 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          selected
                            ? styles.filterButtonTextActive
                            : styles.filterButtonTextInactive,
                        ]}
                        numberOfLines={1}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View
                style={[
                  styles.showingInfo,
                  {
                    width: isMobile || isTablet ? "100%" : undefined,
                    marginTop: isMobile || isTablet ? 12 : 0,
                    paddingTop: isMobile || isTablet ? 10 : 0,
                    borderTopWidth: isMobile || isTablet ? 1 : 0,
                    borderTopColor: COLORS.slate100,
                  },
                ]}
              >
                <Feather
                  name="info"
                  size={14}
                  color={COLORS.slate400}
                />

                <Text style={styles.showingInfoText}>
                  Showing {filteredServices.length} of{" "}
                  {services.length}
                </Text>
              </View>
            </View>
          </View>

          {/* =================================================
              SERVICES
          ================================================= */}

          {loading ? (
            <LoadingServices isMobile={isMobile} />
          ) : filteredServices.length > 0 ? (
            <View style={styles.servicesGrid}>
              {filteredServices.map((service) => (
                <View
                  key={service?._id}
                  style={[
                    styles.serviceCardWrapper,
                    {
                      width:
                        isDesktop
                          ? isWideDesktop
                            ? "31.5%"
                            : "48.5%"
                          : "100%",
                    },
                  ]}
                >
                  <ServiceCard
                    service={service}
                    isMobile={isMobile}
                    isSmallMobile={isSmallMobile}
                    actionLoading={
                      actionLoadingId === service?._id
                    }
                    onEdit={() => openEditModal(service)}
                    onDeactivate={() =>
                      openDeleteModal(service)
                    }
                    onActivate={() =>
                      handleActivate(service)
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              hasServices={services.length > 0}
              selectedSalon={selectedSalon}
              onCreate={openCreateModal}
            />
          )}
        </View>
      </ScrollView>

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.modalKeyboard}
          >
            <View
              style={[
                styles.formModal,
                {
                  width: Math.min(
                    Math.max(windowWidth - 24, 280),
                    680
                  ),
                  maxHeight: Math.min(
                    windowHeight - 24,
                    760
                  ),
                  borderRadius: isMobile ? 20 : 27,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.modalHeaderIcon}>
                    <Feather
                      name={
                        editingService
                          ? "edit-3"
                          : "plus"
                      }
                      size={20}
                      color={COLORS.white}
                    />
                  </View>

                  <View style={styles.modalHeaderText}>
                    <Text
                      style={styles.modalTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {editingService
                        ? "Edit Service"
                        : "Create New Service"}
                    </Text>

                    <Text
                      style={styles.modalSubtitle}
                      numberOfLines={2}
                    >
                      {editingService
                        ? "Update the service details below."
                        : "Add a new beauty service to your salon."}
                    </Text>
                  </View>
                </View>

                <Pressable
                  disabled={submitting}
                  onPress={closeModal}
                  style={styles.modalClose}
                  hitSlop={6}
                >
                  <Feather
                    name="x"
                    size={20}
                    color={COLORS.slate500}
                  />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalBody}
                contentContainerStyle={[
                  styles.modalBodyContent,
                  {
                    paddingHorizontal: isSmallMobile
                      ? 14
                      : isMobile
                        ? 17
                        : 24,
                  },
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                {error ? (
                  <MessageBanner
                    type="error"
                    message={error}
                    onClose={() => setError("")}
                    compact
                  />
                ) : null}

                <FieldLabel
                  label="Salon"
                  required
                  icon="grid"
                />

                <SelectField
                  value={
                    salons.find(
                      (salon) =>
                        String(salon?._id) ===
                        String(form.salon)
                    )
                      ? getSalonName(
                          salons.find(
                            (salon) =>
                              String(salon?._id) ===
                              String(form.salon)
                          )
                        )
                      : "Select salon"
                  }
                  placeholder="Select salon"
                  disabled={
                    Boolean(editingService) ||
                    salonLoading ||
                    salons.length === 0
                  }
                  onPress={() => openSelect("formSalon")}
                  fullWidth
                />

                <FieldLabel
                  label="Category"
                  required
                  icon="tag"
                />

                <SelectField
                  value={
                    categories.find(
                      (category) =>
                        String(category?._id) ===
                        String(form.category)
                    )
                      ? getCategoryName(
                          categories.find(
                            (category) =>
                              String(category?._id) ===
                              String(form.category)
                          )
                        )
                      : "Select category"
                  }
                  placeholder="Select category"
                  disabled={
                    categoryLoading ||
                    categories.length === 0
                  }
                  onPress={() => openSelect("category")}
                  fullWidth
                />

                <FieldLabel
                  label="Service Name"
                  required
                  icon="content-cut"
                />

                <TextInput
                  value={form.name}
                  onChangeText={(value) =>
                    updateForm("name", value)
                  }
                  placeholder="e.g. Hair Cut & Styling"
                  placeholderTextColor={COLORS.slate400}
                  style={styles.formInput}
                  returnKeyType="next"
                  autoCorrect={false}
                />

                <FieldLabel
                  label="Description"
                  icon="info"
                />

                <TextInput
                  value={form.description}
                  onChangeText={(value) =>
                    updateForm("description", value)
                  }
                  placeholder="Describe what is included in this service..."
                  placeholderTextColor={COLORS.slate400}
                  style={[
                    styles.formInput,
                    styles.descriptionInput,
                  ]}
                  multiline
                  textAlignVertical="top"
                />

                <View
                  style={[
                    styles.formTwoColumns,
                    {
                      flexDirection:
                        isMobile ? "column" : "row",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.formColumn,
                      {
                        marginRight:
                          isMobile ? 0 : 6,
                      },
                    ]}
                  >
                    <FieldLabel
                      label="Price"
                      required
                      icon="cash"
                    />

                    <View style={styles.inputWithPrefix}>
                      <Text style={styles.inputPrefix}>
                        ₹
                      </Text>

                      <TextInput
                        value={form.price}
                        onChangeText={(value) =>
                          updateForm(
                            "price",
                            value.replace(/[^0-9]/g, "")
                          )
                        }
                        placeholder="200"
                        placeholderTextColor={COLORS.slate400}
                        keyboardType="numeric"
                        style={styles.prefixedInput}
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      styles.formColumn,
                      {
                        marginLeft:
                          isMobile ? 0 : 6,
                      },
                    ]}
                  >
                    <FieldLabel
                      label="Duration"
                      required
                      icon="clock"
                    />

                    <View style={styles.inputWithSuffix}>
                      <TextInput
                        value={form.duration}
                        onChangeText={(value) =>
                          updateForm(
                            "duration",
                            value.replace(/[^0-9]/g, "")
                          )
                        }
                        placeholder="60"
                        placeholderTextColor={COLORS.slate400}
                        keyboardType="numeric"
                        style={styles.suffixInput}
                      />

                      <Text style={styles.inputSuffix}>
                        min
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View
                style={[
                  styles.modalFooter,
                  {
                    flexDirection:
                      isMobile ? "column" : "row",
                  },
                ]}
              >
                <Pressable
                  disabled={submitting}
                  onPress={closeModal}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    {
                      width:
                        isMobile ? "100%" : undefined,
                      flex:
                        isMobile ? undefined : 0,
                      opacity: submitting
                        ? 0.5
                        : pressed
                          ? 0.75
                          : 1,
                    },
                  ]}
                >
                  <Text style={styles.cancelButtonText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  disabled={submitting}
                  onPress={handleSubmit}
                  style={({ pressed }) => [
                    styles.saveButton,
                    {
                      width:
                        isMobile ? "100%" : undefined,
                      flex:
                        isMobile ? undefined : 0,
                      opacity: submitting
                        ? 0.6
                        : pressed
                          ? 0.86
                          : 1,
                    },
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.white}
                    />
                  ) : (
                    <Feather
                      name={
                        editingService
                          ? "edit-3"
                          : "plus"
                      }
                      size={16}
                      color={COLORS.white}
                    />
                  )}

                  <Text style={styles.saveButtonText}>
                    {submitting
                      ? "Saving..."
                      : editingService
                        ? "Update Service"
                        : "Create Service"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* =====================================================
          DEACTIVATE MODAL
      ===================================================== */}

      <Modal
        visible={deleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteModal,
              {
                width: Math.min(
                  Math.max(windowWidth - 24, 280),
                  470
                ),
                borderRadius: isMobile ? 20 : 27,
              },
            ]}
          >
            <View style={styles.warningIcon}>
              <Feather
                name="alert-triangle"
                size={25}
                color={COLORS.amber}
              />
            </View>

            <Text
              style={styles.deleteTitle}
              numberOfLines={2}
            >
              Deactivate Service?
            </Text>

            <Text style={styles.deleteDescription}>
              Are you sure you want to deactivate{" "}
              <Text style={styles.deleteServiceName}>
                {selectedService?.name || "this service"}
              </Text>
              ? The service will no longer be active.
            </Text>

            {error ? (
              <MessageBanner
                type="error"
                message={error}
                onClose={() => setError("")}
                compact
              />
            ) : null}

            <View
              style={[
                styles.deleteActions,
                {
                  flexDirection:
                    isMobile ? "column" : "row",
                },
              ]}
            >
              <Pressable
                disabled={submitting}
                onPress={closeDeleteModal}
                style={[
                  styles.deleteCancelButton,
                  {
                    width:
                      isMobile ? "100%" : undefined,
                  },
                ]}
              >
                <Text style={styles.deleteCancelText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                disabled={submitting}
                onPress={handleDeactivate}
                style={[
                  styles.deactivateButton,
                  {
                    width:
                      isMobile ? "100%" : undefined,
                    opacity: submitting ? 0.6 : 1,
                  },
                ]}
              >
                {submitting ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Feather
                    name="x-circle"
                    size={16}
                    color={COLORS.white}
                  />
                )}

                <Text style={styles.deactivateButtonText}>
                  {submitting
                    ? "Deactivating..."
                    : "Deactivate"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          SELECT MODAL

          This is a separate modal layer, so the option press
          is always captured. heroSalon and formSalon have
          separate handlers.
      ===================================================== */}

      <Modal
        visible={Boolean(selectModal)}
        transparent
        animationType="fade"
        onRequestClose={closeSelect}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.selectModal,
              {
                width: Math.min(
                  Math.max(windowWidth - (isSmallMobile ? 18 : 28), 280),
                  540
                ),
                maxHeight: Math.min(
                  windowHeight - 28,
                  isMobile ? 560 : 620
                ),
                borderRadius: isMobile ? 20 : 26,
              },
            ]}
          >
            <View style={styles.selectModalHeader}>
              <View style={styles.selectModalTitleArea}>
                <View style={styles.selectModalIcon}>
                  <Feather
                    name={
                      selectModal === "category"
                        ? "tag"
                        : "grid"
                    }
                    size={18}
                    color={COLORS.violet}
                  />
                </View>

                <View style={styles.selectModalTitleText}>
                  <Text
                    style={styles.selectModalTitle}
                    numberOfLines={1}
                  >
                    {selectModal === "category"
                      ? "Select Category"
                      : "Select Salon"}
                  </Text>

                  <Text
                    style={styles.selectModalSubtitle}
                    numberOfLines={1}
                  >
                    Choose an option from the list
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={closeSelect}
                style={styles.selectClose}
                hitSlop={6}
              >
                <Feather
                  name="x"
                  size={20}
                  color={COLORS.slate500}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.selectScroll}
              contentContainerStyle={styles.selectList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {selectModal === "category"
                ? categories.map((category) => {
                    const selected =
                      String(form.category) ===
                      String(category?._id);

                    return (
                      <Pressable
                        key={category?._id}
                        onPress={() =>
                          handleCategorySelect(category?._id)
                        }
                        style={({ pressed }) => [
                          styles.option,
                          selected &&
                            styles.optionSelected,
                          {
                            opacity: pressed ? 0.78 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.optionIcon,
                            selected &&
                              styles.optionIconSelected,
                          ]}
                        >
                          <Feather
                            name="tag"
                            size={16}
                            color={
                              selected
                                ? COLORS.white
                                : COLORS.violet
                            }
                          />
                        </View>

                        <Text
                          style={[
                            styles.optionText,
                            selected &&
                              styles.optionTextSelected,
                          ]}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {getCategoryName(category)}
                        </Text>

                        {selected ? (
                          <Feather
                            name="check-circle"
                            size={20}
                            color={COLORS.violet}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })
                : salons.map((salon) => {
                    const selected =
                      String(
                        selectModal === "heroSalon"
                          ? selectedSalon
                          : form.salon
                      ) === String(salon?._id);

                    return (
                      <Pressable
                        key={salon?._id}
                        onPress={() =>
                          selectModal === "heroSalon"
                            ? handleSalonSelect(salon?._id)
                            : handleFormSalonSelect(salon?._id)
                        }
                        style={({ pressed }) => [
                          styles.option,
                          selected &&
                            styles.optionSelected,
                          {
                            opacity: pressed ? 0.78 : 1,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.optionIcon,
                            selected &&
                              styles.optionIconSelected,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="storefront-outline"
                            size={18}
                            color={
                              selected
                                ? COLORS.white
                                : COLORS.violet
                            }
                          />
                        </View>

                        <View style={styles.optionTextArea}>
                          <Text
                            style={[
                              styles.optionText,
                              selected &&
                                styles.optionTextSelected,
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {getSalonName(salon)}
                          </Text>

                          {salon?.city ? (
                            <Text
                              style={styles.optionSecondary}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {salon.city}
                            </Text>
                          ) : null}
                        </View>

                        {selected ? (
                          <Feather
                            name="check-circle"
                            size={20}
                            color={COLORS.violet}
                          />
                        ) : null}
                      </Pressable>
                    );
                  })}

              {(
                selectModal === "category"
                  ? categories
                  : salons
              ).length === 0 ? (
                <View style={styles.noOptions}>
                  <Feather
                    name="inbox"
                    size={30}
                    color={COLORS.slate300}
                  />

                  <Text style={styles.noOptionsTitle}>
                    No options available
                  </Text>

                  <Text style={styles.noOptionsDescription}>
                    There are no available options to select.
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   MESSAGE BANNER
========================================================= */

function MessageBanner({
  type,
  message,
  onClose,
  compact = false,
}) {
  const isError = type === "error";

  return (
    <View
      style={[
        styles.messageBanner,
        compact && styles.messageBannerCompact,
        isError
          ? styles.errorBanner
          : styles.successBanner,
      ]}
    >
      <View
        style={[
          styles.messageIcon,
          isError
            ? styles.errorMessageIcon
            : styles.successMessageIcon,
        ]}
      >
        <Feather
          name={
            isError
              ? "alert-triangle"
              : "check-circle"
          }
          size={compact ? 15 : 17}
          color={
            isError
              ? COLORS.rose
              : COLORS.emerald
          }
        />
      </View>

      <Text
        style={[
          styles.messageText,
          isError
            ? styles.errorMessageText
            : styles.successMessageText,
        ]}
      >
        {message}
      </Text>

      <Pressable
        onPress={onClose}
        style={styles.messageClose}
        hitSlop={5}
      >
        <Feather
          name="x"
          size={16}
          color={
            isError
              ? COLORS.rose
              : COLORS.emerald
          }
        />
      </Pressable>
    </View>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  value,
  placeholder,
  icon = "grid",
  disabled = false,
  onPress,
  fullWidth = false,
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectField,
        fullWidth && styles.selectFieldFull,
        {
          opacity: disabled
            ? 0.5
            : pressed
              ? 0.82
              : 1,
        },
      ]}
    >
      <View style={styles.selectFieldLeftIcon}>
        <Feather
          name={icon === "content-cut" ? "scissors" : icon}
          size={16}
          color={COLORS.violet}
        />
      </View>

      <Text
        style={[
          styles.selectFieldText,
          !value && styles.selectFieldPlaceholder,
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value || placeholder || "Select"}
      </Text>

      <Feather
        name="chevron-down"
        size={17}
        color={COLORS.slate400}
      />
    </Pressable>
  );
}

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  label,
  required,
  icon,
}) {
  return (
    <View style={styles.fieldLabelRow}>
      <Feather
        name={
          icon === "content-cut"
            ? "scissors"
            : icon
        }
        size={13}
        color={COLORS.violet}
      />

      <Text
        style={styles.fieldLabelText}
        numberOfLines={1}
      >
        {label}
      </Text>

      {required ? (
        <Text style={styles.requiredStar}>*</Text>
      ) : null}
    </View>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  caption,
  icon,
  iconBackground,
  iconColor,
  valueSmall = false,
  compact = false,
}) {
  return (
    <View
      style={[
        styles.statCard,
        compact && styles.statCardCompact,
      ]}
    >
      <View style={styles.statContent}>
        <Text
          style={styles.statLabel}
          numberOfLines={2}
        >
          {label}
        </Text>

        <Text
          style={[
            styles.statValue,
            valueSmall && styles.statValueSmall,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {value}
        </Text>

        <Text
          style={styles.statCaption}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {caption}
        </Text>
      </View>

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={iconColor}
        />
      </View>
    </View>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingServices({ isMobile }) {
  return (
    <View style={styles.loadingContainer}>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={[
            styles.loadingCard,
            {
              minHeight: isMobile ? 250 : 290,
            },
          ]}
        >
          <View style={styles.loadingTopRow}>
            <View style={styles.loadingCircle} />
            <View style={styles.loadingTopLines}>
              <View style={styles.loadingLineLarge} />
              <View style={styles.loadingLineShort} />
            </View>
          </View>

          <View style={styles.loadingLine} />
          <View
            style={[
              styles.loadingLine,
              { width: "72%" },
            ]}
          />

          <View style={styles.loadingBottomRow}>
            <View style={styles.loadingSmallBox} />
            <View style={styles.loadingSmallBox} />
          </View>
        </View>
      ))}
    </View>
  );
}

/* =========================================================
   SERVICE CARD
========================================================= */

function ServiceCard({
  service,
  isSmallMobile,
  isMobile,
  actionLoading,
  onEdit,
  onDeactivate,
  onActivate,
}) {
  const active = service?.isActive !== false;

  const categoryName = getCategoryFromService(service);

  return (
    <View
      style={[
        styles.serviceCard,
        {
          borderRadius: isSmallMobile ? 20 : 24,
        },
      ]}
    >
      <View
        style={[
          styles.serviceCardTopLine,
          {
            backgroundColor: active
              ? COLORS.violet
              : COLORS.slate300,
          },
        ]}
      />

      <View style={styles.serviceTop}>
        <View style={styles.serviceIcon}>
          <MaterialCommunityIcons
            name="content-cut"
            size={21}
            color={COLORS.violet}
          />
        </View>

        <View style={styles.serviceTitleArea}>
          <View
            style={[
              styles.serviceTitleRow,
              {
                flexDirection: isSmallMobile ? "column" : "row",
                alignItems: isSmallMobile ? "flex-start" : "flex-start",
              },
            ]}
          >
            <Text
              style={styles.serviceName}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {service?.name || "Unnamed Service"}
            </Text>

            <View
              style={[
                styles.statusBadge,
                active
                  ? styles.activeBadge
                  : styles.inactiveBadge,
                isSmallMobile && styles.statusBadgeSmallMobile,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  active
                    ? styles.activeBadgeText
                    : styles.inactiveBadgeText,
                ]}
                numberOfLines={1}
              >
                {active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <View style={styles.categoryRow}>
            <Feather
              name="tag"
              size={13}
              color={COLORS.violet}
            />

            <Text
              style={styles.categoryText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {categoryName}
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={styles.serviceDescription}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {service?.description ||
          "No description provided."}
      </Text>

      <View
        style={[
          styles.detailGrid,
          {
            flexDirection:
              isMobile ? "column" : "row",
          },
        ]}
      >
        <View
          style={[
            styles.detailBox,
            {
              flex: isMobile ? undefined : 1,
              marginRight:
                isMobile ? 0 : 5,
            },
          ]}
        >
          <View style={styles.detailLabelRow}>
            <Feather
              name="dollar-sign"
              size={14}
              color={COLORS.violet}
            />

            <Text style={styles.detailLabel}>
              PRICE
            </Text>
          </View>

          <Text
            style={styles.detailValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {formatPrice(service?.price)}
          </Text>
        </View>

        <View
          style={[
            styles.detailBox,
            {
              flex: isMobile ? undefined : 1,
              marginLeft:
                isMobile ? 0 : 5,
              marginTop:
                isMobile ? 8 : 0,
            },
          ]}
        >
          <View style={styles.detailLabelRow}>
            <Feather
              name="clock"
              size={14}
              color={COLORS.violet}
            />

            <Text style={styles.detailLabel}>
              DURATION
            </Text>
          </View>

          <Text
            style={styles.detailValue}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.72}
          >
            {formatDuration(service?.duration)}
          </Text>
        </View>
      </View>

      <View style={styles.serviceDivider} />

      <View
        style={[
          styles.serviceActions,
          {
            flexDirection:
              isMobile ? "column" : "row",
          },
        ]}
      >
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [
            styles.editButton,
            {
              width:
                isMobile ? "100%" : undefined,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Feather
            name="edit-3"
            size={14}
            color={COLORS.slate700}
          />

          <Text style={styles.editButtonText}>
            Edit
          </Text>
        </Pressable>

        {active ? (
          <Pressable
            onPress={onDeactivate}
            style={({ pressed }) => [
              styles.deactivateOutlineButton,
              {
                width:
                  isMobile ? "100%" : undefined,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Feather
              name="x-circle"
              size={14}
              color={COLORS.amber}
            />

            <Text style={styles.deactivateOutlineText}>
              Deactivate
            </Text>
          </Pressable>
        ) : (
          <Pressable
            disabled={actionLoading}
            onPress={onActivate}
            style={({ pressed }) => [
              styles.activateButton,
              {
                width:
                  isMobile ? "100%" : undefined,
                opacity: actionLoading
                  ? 0.6
                  : pressed
                    ? 0.8
                    : 1,
              },
            ]}
          >
            {actionLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.emerald}
              />
            ) : (
              <Feather
                name="check-circle"
                size={14}
                color={COLORS.emerald}
              />
            )}

            <Text style={styles.activateButtonText}>
              {actionLoading
                ? "Activating..."
                : "Activate"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  hasServices,
  selectedSalon,
  onCreate,
}) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons
          name="content-cut"
          size={28}
          color={COLORS.violet}
        />
      </View>

      <Text
        style={styles.emptyTitle}
        numberOfLines={2}
      >
        {hasServices
          ? "No matching services"
          : "No services available"}
      </Text>

      <Text style={styles.emptyDescription}>
        {hasServices
          ? "Try changing your search or status filter."
          : "Create your first service for this salon to get started."}
      </Text>

      {!hasServices && selectedSalon ? (
        <Pressable
          onPress={onCreate}
          style={styles.emptyCreateButton}
        >
          <Feather
            name="plus"
            size={17}
            color={COLORS.white}
          />

          <Text style={styles.emptyCreateButtonText}>
            Create Service
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  screen: {
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
  },

  content: {
    width: "100%",
    alignSelf: "center",
    minWidth: 0,
  },

  /* =======================================================
     BACKGROUND
  ======================================================= */

  backgroundOrb: {
    position: "absolute",
    borderRadius: 999,
  },

  backgroundOrbOne: {
    backgroundColor: "#DDD6FE",
    opacity: 0.17,
    top: 20,
    left: "4%",
  },

  backgroundOrbTwo: {
    backgroundColor: "#F5D0FE",
    opacity: 0.11,
    top: 300,
    right: "2%",
  },

  /* =======================================================
     MESSAGE
  ======================================================= */

  messageBanner: {
    width: "100%",
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  messageBannerCompact: {
    minHeight: 46,
    borderRadius: 13,
    marginBottom: 16,
  },

  errorBanner: {
    backgroundColor: COLORS.roseSoft,
    borderColor: "#FECDD3",
  },

  successBanner: {
    backgroundColor: COLORS.emeraldSoft,
    borderColor: "#A7F3D0",
  },

  messageIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 9,
  },

  errorMessageIcon: {
    backgroundColor: "#FFE4E6",
  },

  successMessageIcon: {
    backgroundColor: "#D1FAE5",
  },

  messageText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },

  errorMessageText: {
    color: "#BE123C",
  },

  successMessageText: {
    color: "#047857",
  },

  messageClose: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 6,
  },

  /* =======================================================
     HERO
  ======================================================= */

  hero: {
    position: "relative",
    overflow: "hidden",
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 13,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.055,
    shadowRadius: 28,
    elevation: 2,
  },

  heroAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.violet,
  },

  heroBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#DDD6FE",
    backgroundColor: "#FAF9FF",
    paddingLeft: 6,
    paddingRight: 11,
    paddingVertical: 5,
    marginBottom: 17,
  },

  heroBadgeIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    flexShrink: 0,
    marginRight: 7,
  },

  heroBadgeText: {
    color: COLORS.violet,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },

  heroMain: {
    width: "100%",
    alignItems: "stretch",
    justifyContent: "space-between",
  },

  heroText: {
    minWidth: 0,
  },

  heroTitle: {
    color: COLORS.slate950,
    fontWeight: "900",
    letterSpacing: -1,
    flexShrink: 1,
  },

  heroDescription: {
    color: COLORS.slate500,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 650,
  },

  heroControls: {
    width: "100%",
    minWidth: 0,
    alignItems: "stretch",
    justifyContent: "flex-start",
    flexDirection: "column",
    marginTop: 18,
  },

  heroSalonControl: {
    minWidth: 0,
    width: "100%",
    marginRight: 0,
  },

  selectField: {
    height: 52,
    width: "100%",
    minWidth: 0,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  selectFieldFull: {
    marginBottom: 18,
  },

  selectFieldLeftIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violetSoft,
    flexShrink: 0,
    marginRight: 9,
  },

  selectFieldText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.slate800,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },

  selectFieldPlaceholder: {
    color: COLORS.slate400,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: COLORS.violet,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    shadowColor: COLORS.violet,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },

  primaryButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 17,
    marginLeft: 7,
  },

  /* =======================================================
     CURRENT SALON
  ======================================================= */

  currentSalonCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    marginBottom: 13,
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.04,
    shadowRadius: 22,
    elevation: 1,
  },

  currentSalonLeft: {
    flex: 1,
    width: "100%",
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  currentSalonIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.violet,
    flexShrink: 0,
    marginRight: 12,
  },

  currentSalonInfo: {
    flex: 1,
    minWidth: 0,
  },

  currentSalonLabel: {
    color: COLORS.violet,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.15,
    lineHeight: 12,
    marginBottom: 3,
  },

  currentSalonName: {
    color: COLORS.slate950,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22,
  },

  currentSalonAddress: {
    color: COLORS.slate500,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 17,
    marginTop: 3,
  },

  refreshButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  refreshButtonText: {
    color: COLORS.slate700,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
    marginLeft: 7,
  },

  /* =======================================================
     STATS
  ======================================================= */

  statsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 13,
    marginHorizontal: -5,
  },

  statCard: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "23%",
    minWidth: 0,
    minHeight: 112,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    padding: 13,
    marginHorizontal: 5,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.035,
    shadowRadius: 18,
    elevation: 1,
  },

  statCardCompact: {
    flexBasis: "45%",
    minHeight: 106,
  },

  statContent: {
    flex: 1,
    minWidth: 0,
  },

  statLabel: {
    color: COLORS.slate400,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    lineHeight: 12,
  },

  statValue: {
    color: COLORS.slate950,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.9,
    lineHeight: 32,
    marginTop: 7,
  },

  statValueSmall: {
    fontSize: 20,
    letterSpacing: -0.5,
  },

  statCaption: {
    color: COLORS.slate400,
    fontSize: 8,
    fontWeight: "700",
    lineHeight: 12,
    marginTop: 3,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 7,
  },

  /* =======================================================
     COMMAND
  ======================================================= */

  commandCard: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    overflow: "hidden",
    marginBottom: 13,
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.04,
    shadowRadius: 22,
    elevation: 1,
  },

  commandHeader: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 13,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    minWidth: 0,
  },

  commandTitleArea: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  commandIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.violetSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 9,
  },

  commandTitleTextArea: {
    flex: 1,
    minWidth: 0,
  },

  commandTitle: {
    color: COLORS.slate950,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },

  commandSubtitle: {
    color: COLORS.slate500,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 1,
  },

  searchContainer: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginTop: 0,
  },

  searchIcon: {
    marginLeft: 13,
    marginRight: 7,
    flexShrink: 0,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 46,
    color: COLORS.slate800,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 0,
    paddingVertical: 0,
    outlineStyle: "none",
  },

  searchClear: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  commandBottom: {
    width: "100%",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 14,
    justifyContent: "space-between",
    minWidth: 0,
  },

  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    minWidth: 0,
  },

  filterButton: {
    minHeight: 38,
    borderRadius: 11,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },

  filterButtonActive: {
    backgroundColor: COLORS.slate950,
  },

  filterButtonInactive: {
    backgroundColor: COLORS.slate100,
  },

  filterButtonText: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    lineHeight: 12,
  },

  filterButtonTextActive: {
    color: COLORS.white,
  },

  filterButtonTextInactive: {
    color: COLORS.slate500,
  },

  showingInfo: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  showingInfoText: {
    color: COLORS.slate400,
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 15,
    marginLeft: 6,
    flexShrink: 1,
  },

  /* =======================================================
     SERVICES
  ======================================================= */

  servicesGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
  },

  serviceCardWrapper: {
    minWidth: 0,
    marginBottom: 10,
  },

  serviceCard: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    padding: 15,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.04,
    shadowRadius: 22,
    elevation: 1,
  },

  serviceCardTopLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 3,
  },

  serviceTop: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
  },

  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.violetSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 10,
  },

  serviceTitleArea: {
    flex: 1,
    minWidth: 0,
  },

  serviceTitleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
  },

  serviceName: {
    flex: 1,
    minWidth: 0,
    color: COLORS.slate950,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
    paddingRight: 5,
  },

  statusBadge: {
    minHeight: 24,
    borderRadius: 999,
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  activeBadge: {
    backgroundColor: "#D1FAE5",
  },

  inactiveBadge: {
    backgroundColor: "#FFE4E6",
  },

  statusBadgeSmallMobile: {
    alignSelf: "flex-start",
    marginTop: 4,
  },

  statusBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.45,
    lineHeight: 10,
  },

  activeBadgeText: {
    color: "#047857",
  },

  inactiveBadgeText: {
    color: "#BE123C",
  },

  categoryRow: {
    width: "100%",
    marginTop: 5,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  categoryText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.violet,
    fontSize: 9,
    fontWeight: "800",
    lineHeight: 14,
    marginLeft: 6,
  },

  serviceDescription: {
    color: COLORS.slate500,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 18,
    marginTop: 15,
    minHeight: 36,
  },

  detailGrid: {
    width: "100%",
    marginTop: 14,
    minWidth: 0,
  },

  detailBox: {
    minWidth: 0,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: "#FAFBFC",
    padding: 11,
  },

  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailLabel: {
    color: COLORS.slate400,
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.85,
    lineHeight: 11,
    marginLeft: 6,
  },

  detailValue: {
    color: COLORS.slate950,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
    marginTop: 6,
  },

  serviceDivider: {
    height: 1,
    backgroundColor: COLORS.slate100,
    marginVertical: 14,
  },

  serviceActions: {
    width: "100%",
    minWidth: 0,
  },

  editButton: {
    minHeight: 42,
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  editButtonText: {
    color: COLORS.slate700,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 15,
    marginLeft: 6,
  },

  deactivateOutlineButton: {
    minHeight: 42,
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: COLORS.amberSoft,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  deactivateOutlineText: {
    color: "#B45309",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 15,
    marginLeft: 6,
  },

  activateButton: {
    minHeight: 42,
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    backgroundColor: COLORS.emeraldSoft,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },

  activateButtonText: {
    color: "#047857",
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 15,
    marginLeft: 6,
  },

  /* =======================================================
     EMPTY
  ======================================================= */

  emptyState: {
    width: "100%",
    minHeight: 290,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.slate300,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 26,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.violetSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    color: COLORS.slate950,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
    marginTop: 15,
    textAlign: "center",
  },

  emptyDescription: {
    maxWidth: 450,
    color: COLORS.slate500,
    fontSize: 11,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },

  emptyCreateButton: {
    minHeight: 43,
    borderRadius: 12,
    backgroundColor: COLORS.slate950,
    paddingHorizontal: 17,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyCreateButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
    marginLeft: 7,
  },

  /* =======================================================
     LOADING
  ======================================================= */

  loadingContainer: {
    width: "100%",
  },

  loadingCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    padding: 17,
    marginBottom: 10,
  },

  loadingTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },

  loadingCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: COLORS.slate100,
    flexShrink: 0,
    marginRight: 10,
  },

  loadingTopLines: {
    flex: 1,
    minWidth: 0,
  },

  loadingLineLarge: {
    height: 15,
    width: "62%",
    borderRadius: 7,
    backgroundColor: COLORS.slate100,
  },

  loadingLineShort: {
    height: 9,
    width: "38%",
    borderRadius: 6,
    backgroundColor: COLORS.slate100,
    marginTop: 8,
  },

  loadingLine: {
    height: 10,
    width: "90%",
    borderRadius: 6,
    backgroundColor: COLORS.slate100,
    marginTop: 18,
  },

  loadingBottomRow: {
    width: "100%",
    flexDirection: "row",
    marginTop: 24,
  },

  loadingSmallBox: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    backgroundColor: COLORS.slate100,
    marginRight: 6,
  },

  /* =======================================================
     MODALS
  ======================================================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.68)",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },

  modalKeyboard: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  formModal: {
    maxWidth: 680,
    width: "100%",
    backgroundColor: COLORS.white,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.25,
    shadowRadius: 42,
    elevation: 15,
  },

  modalHeader: {
    minHeight: 78,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    backgroundColor: "#FBF9FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },

  modalHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  modalHeaderIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.violet,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 10,
  },

  modalHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  modalTitle: {
    color: COLORS.slate950,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
  },

  modalSubtitle: {
    color: COLORS.slate500,
    fontSize: 9,
    fontWeight: "600",
    lineHeight: 14,
    marginTop: 2,
  },

  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.slate100,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 8,
  },

  modalBody: {
    flex: 1,
    minHeight: 0,
  },

  modalBodyContent: {
    paddingTop: 18,
    paddingBottom: 8,
  },

  fieldLabelRow: {
    minHeight: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  fieldLabelText: {
    color: COLORS.slate600,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.65,
    lineHeight: 13,
    marginLeft: 6,
  },

  requiredStar: {
    color: COLORS.rose,
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 15,
    marginLeft: 2,
  },

  formInput: {
    width: "100%",
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: "#FAFBFC",
    color: COLORS.slate800,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 17,
    outlineStyle: "none",
  },

  descriptionInput: {
    minHeight: 104,
    paddingTop: 12,
  },

  formTwoColumns: {
    width: "100%",
    minWidth: 0,
  },

  formColumn: {
    flex: 1,
    minWidth: 0,
  },

  inputWithPrefix: {
    width: "100%",
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    minWidth: 0,
  },

  inputPrefix: {
    color: COLORS.slate400,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
    marginLeft: 12,
    flexShrink: 0,
  },

  prefixedInput: {
    flex: 1,
    minWidth: 0,
    height: 47,
    color: COLORS.slate800,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 0,
    outlineStyle: "none",
  },

  inputWithSuffix: {
    width: "100%",
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: "#FAFBFC",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
    minWidth: 0,
  },

  suffixInput: {
    flex: 1,
    minWidth: 0,
    height: 47,
    color: COLORS.slate800,
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 0,
    outlineStyle: "none",
  },

  inputSuffix: {
    color: COLORS.slate400,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 14,
    marginRight: 12,
    flexShrink: 0,
  },

  modalFooter: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    backgroundColor: COLORS.white,
    alignItems: "stretch",
    justifyContent: "flex-end",
  },

  cancelButton: {
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  cancelButtonText: {
    color: COLORS.slate600,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
  },

  saveButton: {
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: COLORS.violet,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 135,
    shadowColor: COLORS.violet,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 3,
     flex: 1,
  flexShrink: 0,
  },

  saveButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
    marginLeft: 7,
  },

  /* =======================================================
     DELETE MODAL
  ======================================================= */

  deleteModal: {
    maxWidth: 470,
    backgroundColor: COLORS.white,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.25,
    shadowRadius: 42,
    elevation: 15,
  },

  warningIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: COLORS.amberSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteTitle: {
    color: COLORS.slate950,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 16,
  },

  deleteDescription: {
    color: COLORS.slate500,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 20,
    marginTop: 7,
  },

  deleteServiceName: {
    color: COLORS.slate800,
    fontWeight: "900",
  },

  deleteActions: {
    width: "100%",
    marginTop: 20,
  },

  deleteCancelButton: {
    minHeight: 47,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 5,
  },

  deleteCancelText: {
    color: COLORS.slate600,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
  },

  deactivateButton: {
    minHeight: 47,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    flex: 1,
    marginLeft: 5,
  },

  deactivateButtonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "900",
    lineHeight: 16,
  },

  /* =======================================================
     SELECT MODAL
  ======================================================= */

  selectModal: {
    maxWidth: 540,
    width: "100%",
    backgroundColor: COLORS.white,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 24,
    },
    shadowOpacity: 0.25,
    shadowRadius: 42,
    elevation: 15,
  },

  selectModalHeader: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.slate100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 0,
  },

  selectModalTitleArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  selectModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.violetSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 9,
  },

  selectModalTitleText: {
    flex: 1,
    minWidth: 0,
  },

  selectModalTitle: {
    color: COLORS.slate950,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 21,
  },

  selectModalSubtitle: {
    color: COLORS.slate500,
    fontSize: 9,
    fontWeight: "600",
    lineHeight: 14,
    marginTop: 1,
  },

  selectClose: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.slate100,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginLeft: 8,
  },

  selectScroll: {
    flexGrow: 0,
    minHeight: 0,
  },

  selectList: {
    padding: 11,
    paddingBottom: 13,
  },

  option: {
    width: "100%",
    minHeight: 60,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.slate200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    marginBottom: 8,
  },

  optionSelected: {
    borderColor: "#C4B5FD",
    backgroundColor: COLORS.violetSoft,
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.violetSoft,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginRight: 9,
  },

  optionIconSelected: {
    backgroundColor: COLORS.violet,
  },

  optionTextArea: {
    flex: 1,
    minWidth: 0,
  },

  optionText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.slate800,
    fontSize: 11,
    fontWeight: "800",
    lineHeight: 16,
  },

  optionTextSelected: {
    color: COLORS.violetDark,
    fontWeight: "900",
  },

  optionSecondary: {
    color: COLORS.slate500,
    fontSize: 8,
    fontWeight: "600",
    lineHeight: 12,
    marginTop: 1,
  },

  noOptions: {
    minHeight: 190,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  noOptionsTitle: {
    color: COLORS.slate800,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 20,
    marginTop: 9,
  },

  noOptionsDescription: {
    color: COLORS.slate500,
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
    marginTop: 4,
  },
});
