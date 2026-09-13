import React, { useEffect, useMemo, useState } from "react";
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
  getAllCategoriesForAdmin,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
} from "../../../../services/adminCategoryService";

const C = {
  primary: "#6D28D9",
  primaryDark: "#5B21B6",
  primarySoft: "#F3E8FF",
  primaryTint: "#FAF5FF",
  text: "#111827",
  text2: "#334155",
  muted: "#64748B",
  faint: "#94A3B8",
  border: "#E2E8F0",
  borderSoft: "#EEF2F7",
  bg: "#F7F8FC",
  white: "#FFFFFF",
  green: "#059669",
  greenSoft: "#ECFDF5",
  red: "#DC2626",
  redSoft: "#FEF2F2",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
};

const initialForm = { name: "", description: "" };
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Categories", icon: "apps-outline" },
  { value: "ACTIVE", label: "Active Only", icon: "checkmark-circle-outline" },
  { value: "INACTIVE", label: "Inactive Only", icon: "power-outline" },
];

const idOf = (x) => x?._id || x?.id;

export default function CategoriesManagement() {
  const { width, height } = useWindowDimensions();
  const small = width <= 359;
  const mobile = width < 768;
  const tablet = width >= 768 && width < 1200;
  const columns = mobile ? 1 : tablet ? 2 : width >= 1280 ? 4 : 3;
  const gap = small ? 10 : mobile ? 12 : 16;
  const pad = small ? 12 : mobile ? 16 : tablet ? 24 : 30;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [toast, setToast] = useState(null);

  const toastIt = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const loadCategories = async (pull = false) => {
    try {
      pull ? setRefreshing(true) : setLoading(true);
      const data = await getAllCategoriesForAdmin();
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch (e) {
      console.error("Failed to load categories:", e);
      setCategories([]);
      toastIt(e?.response?.data?.message || e?.message || "Failed to load categories", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories.filter((cat) => {
      const name = String(cat?.name || "").toLowerCase();
      const desc = String(cat?.description || "").toLowerCase();
      const textOk = !q || name.includes(q) || desc.includes(q);
      const statusOk = statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat?.isActive === true) ||
        (statusFilter === "INACTIVE" && cat?.isActive === false);
      return textOk && statusOk;
    });
  }, [categories, search, statusFilter]);

  const total = categories.length;
  const active = categories.filter((x) => x?.isActive === true).length;
  const inactive = categories.filter((x) => x?.isActive === false).length;
  const activeRate = total ? Math.round((active / total) * 100) : 0;
  const selectedStatus = STATUS_OPTIONS.find((x) => x.value === statusFilter) || STATUS_OPTIONS[0];

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat?.name || "", description: cat?.description || "" });
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
    setForm(initialForm);
  };

  const submit = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    if (!name) return toastIt("Category name is required", "error");
    if (name.length < 2) return toastIt("Category name must contain at least 2 characters", "error");

    try {
      setSaving(true);
      if (editing) {
        await updateCategory(idOf(editing), { name, description });
        toastIt("Category updated successfully");
      } else {
        await createCategory({ name, description });
        toastIt("Category created successfully");
      }
      setShowForm(false);
      setEditing(null);
      setForm(initialForm);
      await loadCategories();
    } catch (e) {
      console.error("Category save error:", e);
      toastIt(e?.response?.data?.message || e?.message || "Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };

  const askDeactivate = (cat) => {
    setSelected(cat);
    setShowDeactivate(true);
  };

  const closeDeactivate = () => {
    if (saving) return;
    setShowDeactivate(false);
    setSelected(null);
  };

  const deactivate = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      await deactivateCategory(idOf(selected));
      setShowDeactivate(false);
      setSelected(null);
      toastIt("Category deactivated successfully");
      await loadCategories();
    } catch (e) {
      toastIt(e?.response?.data?.message || e?.message || "Failed to deactivate category", "error");
    } finally {
      setSaving(false);
    }
  };

  const activate = async (cat) => {
    try {
      setSaving(true);
      await activateCategory(idOf(cat));
      toastIt("Category activated successfully");
      await loadCategories();
    } catch (e) {
      toastIt(e?.response?.data?.message || e?.message || "Failed to activate category", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.screen}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingHorizontal: pad, paddingTop: small ? 14 : mobile ? 18 : 28, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadCategories(true)} tintColor={C.primary} colors={[C.primary]} />}
      >
        <View style={[s.content, { maxWidth: 1600 }]}>
          <View style={[s.hero, { borderRadius: small ? 18 : 26, padding: small ? 14 : mobile ? 18 : 26 }]}>
            <View style={s.heroGlow} />
            <View style={s.breadcrumb}>
              <Text style={s.crumbMuted}>Admin</Text>
              <Ionicons name="chevron-forward" size={12} color={C.faint} />
              <Text style={s.crumbCurrent} numberOfLines={1}>Categories Management</Text>
            </View>

            <View style={[s.heroMain, { flexDirection: mobile ? "column" : "row" }]}>
              <View style={s.heroIdentity}>
                <View style={[s.heroIcon, { width: small ? 44 : 52, height: small ? 44 : 52 }]}>
                  <Ionicons name="pricetags-outline" size={small ? 21 : 25} color={C.white} />
                </View>
                <View style={s.heroText}>
                  <Text style={s.eyebrow}>CATEGORY MANAGEMENT</Text>
                  <Text style={[s.heroTitle, { fontSize: small ? 23 : mobile ? 27 : 34, lineHeight: small ? 29 : mobile ? 34 : 40 }]}>Service Categories</Text>
                  <Text style={[s.heroDesc, { fontSize: small ? 12 : 14, lineHeight: small ? 18 : 21 }]}>Create and manage service categories used across all salons in your platform.</Text>
                </View>
              </View>

              <View style={[s.heroActions, { flexDirection: small ? "column" : "row", width: mobile ? "100%" : "auto" }]}>
                <Action label="Refresh" icon="refresh-outline" secondary compact={small || tablet} disabled={loading} onPress={() => loadCategories()} />
                <Action label="Add Category" icon="add" compact={small || tablet} onPress={openCreate} />
              </View>
            </View>
          </View>

          <View style={[s.stats, { flexDirection: mobile ? "column" : "row", gap }]}>
            <Stat title="Total Categories" value={total} sub="All categories" icon="layers-outline" tone="purple" />
            <Stat title="Active" value={active} sub="Currently available" icon="checkmark-circle-outline" tone="green" />
            <Stat title="Inactive" value={inactive} sub="Currently disabled" icon="power-outline" tone="red" />
            <Stat title="Active Rate" value={`${activeRate}%`} sub="Platform availability" icon="pie-chart-outline" tone="blue" />
          </View>

          <View style={[s.filterCard, { borderRadius: small ? 18 : 24, padding: small ? 11 : 16 }]}>
            <View style={[s.filterTop, { flexDirection: mobile ? "column" : "row", gap: 12 }]}>
              <View style={s.searchWrap}>
                <Ionicons name="search-outline" size={18} color={C.faint} style={s.searchIcon} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search category name or description..."
                  placeholderTextColor={C.faint}
                  style={[s.searchInput, { height: small ? 46 : 50, fontSize: small ? 12 : 14 }]}
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor={C.primary}
                />
              </View>

              <View style={[s.statusWrap, { width: mobile ? "100%" : 230 }]}>
                <Text style={s.filterLabel}>Status</Text>
                <Pressable onPress={() => setShowPicker(true)} style={({ pressed }) => [s.select, { minHeight: small ? 46 : 50, opacity: pressed ? 0.8 : 1 }]}>
                  <View style={s.selectLeft}>
                    <View style={s.selectIcon}><Ionicons name={selectedStatus.icon} size={17} color={C.primary} /></View>
                    <Text style={s.selectText} numberOfLines={1}>{selectedStatus.label}</Text>
                  </View>
                  <Ionicons name="chevron-down" size={17} color={C.muted} />
                </Pressable>
              </View>
            </View>

            <View style={s.resultRow}>
              <Text style={s.resultText}>Showing <Text style={s.resultStrong}>{filtered.length}</Text> of <Text style={s.resultStrong}>{total}</Text> categories</Text>
              {(search || statusFilter !== "ALL") && (
                <Pressable onPress={() => { setSearch(""); setStatusFilter("ALL"); }} style={s.clearBtn}>
                  <Ionicons name="close-circle-outline" size={15} color={C.primary} />
                  <Text style={s.clearText}>Clear filters</Text>
                </Pressable>
              )}
            </View>
          </View>

          {loading && <Loading />}

          {!loading && filtered.length === 0 && (
            <Empty hasFilter={!!search || statusFilter !== "ALL"} onCreate={openCreate} />
          )}

          {!loading && filtered.length > 0 && (
            <View style={[s.grid, { marginHorizontal: -(gap / 2) }]}>
              {filtered.map((cat) => (
                <View key={idOf(cat)} style={{ width: `${100 / columns}%`, paddingHorizontal: gap / 2, marginBottom: gap }}>
                  <CategoryCard category={cat} onEdit={openEdit} onDeactivate={askDeactivate} onActivate={activate} disabled={saving} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <StatusPicker visible={showPicker} value={statusFilter} small={small} height={height} onClose={() => setShowPicker(false)} onSelect={(v) => { setStatusFilter(v); setShowPicker(false); }} />
      <CategoryModal visible={showForm} editing={editing} form={form} setForm={setForm} saving={saving} small={small} mobile={mobile} height={height} onClose={closeForm} onSubmit={submit} />
      <ConfirmModal visible={showDeactivate} category={selected} saving={saving} small={small} onClose={closeDeactivate} onConfirm={deactivate} />
      {toast && <Toast data={toast} onClose={() => setToast(null)} mobile={mobile} />}
    </View>
  );
}

function Action({ label, icon, secondary, compact, disabled, onPress }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [s.action, secondary ? s.actionSecondary : s.actionPrimary, compact && s.actionCompact, { opacity: disabled ? 0.55 : pressed ? 0.82 : 1 }]}>
      <Ionicons name={icon} size={compact ? 17 : 18} color={secondary ? C.text2 : C.white} />
      <Text style={[s.actionText, secondary ? s.actionTextSecondary : s.actionTextPrimary, compact && { fontSize: 12 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{label}</Text>
    </Pressable>
  );
}

function Stat({ title, value, sub, icon, tone }) {
  const tones = { purple: [C.primarySoft, C.primary], green: [C.greenSoft, C.green], red: [C.redSoft, C.red], blue: ["#EFF6FF", "#2563EB"] };
  const [bg, fg] = tones[tone] || tones.purple;
  return (
    <View style={s.stat}>
      <View style={s.statText}><Text style={s.statTitle} numberOfLines={2}>{title}</Text><Text style={s.statValue} numberOfLines={1}>{value}</Text><Text style={s.statSub} numberOfLines={2}>{sub}</Text></View>
      <View style={[s.statIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={22} color={fg} /></View>
    </View>
  );
}

function CategoryCard({ category, onEdit, onDeactivate, onActivate, disabled }) {
  const active = category?.isActive === true;
  return (
    <View style={s.card}>
      <View style={[s.cardAccent, { backgroundColor: active ? C.primary : "#CBD5E1" }]} />
      <View style={s.cardBody}>
        <View style={s.cardHeader}>
          <View style={s.cardIdentity}>
            <View style={[s.catIcon, { backgroundColor: active ? C.primarySoft : "#F1F5F9" }]}><Ionicons name="pricetags-outline" size={21} color={active ? C.primary : C.faint} /></View>
            <View style={s.catNameWrap}>
              <Text style={s.catName} numberOfLines={2}>{category?.name || "Unnamed Category"}</Text>
              <Text style={s.catType}>Service Category</Text>
            </View>
          </View>
          <View style={[s.badge, { backgroundColor: active ? C.greenSoft : "#F1F5F9" }]}>
            <Ionicons name={active ? "checkmark-circle-outline" : "power-outline"} size={12} color={active ? C.green : C.muted} />
            <Text style={[s.badgeText, { color: active ? C.green : C.muted }]}>{active ? "ACTIVE" : "INACTIVE"}</Text>
          </View>
        </View>
        <View style={s.description}><Text style={s.descriptionText} numberOfLines={3}>{category?.description || "No description available for this category."}</Text></View>
        <View style={s.cardActions}>
          <Pressable disabled={disabled} onPress={() => onEdit(category)} style={({ pressed }) => [s.editBtn, { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
            <Ionicons name="create-outline" size={17} color={C.primary} /><Text style={s.editText}>Edit</Text>
          </Pressable>
          <Pressable disabled={disabled} onPress={() => active ? onDeactivate(category) : onActivate(category)} style={({ pressed }) => [s.squareBtn, { backgroundColor: active ? C.redSoft : C.greenSoft, opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }]}>
            <Ionicons name={active ? "trash-outline" : "checkmark-circle-outline"} size={18} color={active ? C.red : C.green} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Loading() {
  return <View style={s.loading}><View style={s.loadingIcon}><ActivityIndicator color={C.primary} /></View><Text style={s.loadingTitle}>Loading categories</Text><Text style={s.loadingText}>Please wait while we fetch the latest data.</Text></View>;
}

function Empty({ hasFilter, onCreate }) {
  return <View style={s.empty}><View style={s.emptyIcon}><Ionicons name="pricetags-outline" size={30} color={C.faint} /></View><Text style={s.emptyTitle}>No categories found</Text><Text style={s.emptyText}>{hasFilter ? "Try changing your search or filter." : "No categories have been created yet."}</Text>{!hasFilter && <Action label="Create First Category" icon="add" onPress={onCreate} />}</View>;
}

function StatusPicker({ visible, value, small, height, onClose, onSelect }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <View style={s.backdrop}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><View style={[s.picker, { width: small ? "88%" : 360, maxHeight: Math.min(height * 0.72, 500) }]}>
      <View style={s.pickerHeader}><View><Text style={s.modalEyebrow}>FILTER</Text><Text style={s.pickerTitle}>Choose status</Text></View><Pressable onPress={onClose} style={s.closeBtn}><Ionicons name="close" size={20} color={C.muted} /></Pressable></View>
      <ScrollView contentContainerStyle={{ padding: 10 }} showsVerticalScrollIndicator={false}>
        {STATUS_OPTIONS.map((o) => { const selected = o.value === value; return <Pressable key={o.value} onPress={() => onSelect(o.value)} style={({ pressed }) => [s.option, { backgroundColor: selected ? C.primaryTint : C.white, borderColor: selected ? "#DDD6FE" : C.borderSoft, opacity: pressed ? 0.78 : 1 }]}>
          <View style={[s.optionIcon, { backgroundColor: selected ? C.primarySoft : "#F8FAFC" }]}><Ionicons name={o.icon} size={19} color={selected ? C.primary : C.muted} /></View>
          <Text style={[s.optionText, selected && { color: C.primaryDark }]}>{o.label}</Text>
          <View style={[s.radio, selected && { borderColor: C.primary }]}>{selected && <View style={s.radioDot} />}</View>
        </Pressable>; })}
      </ScrollView>
    </View></View>
  </Modal>;
}

function CategoryModal({ visible, editing, form, setForm, saving, small, mobile, height, onClose, onSubmit }) {
  const modalWidth = small ? "96%" : mobile ? "94%" : "min(620px, 92%)";
  const maxHeight = Math.min(height - (small ? 18 : 40), mobile ? 720 : 780);
  const submitLabel = editing ? "Update Category" : "Create Category";
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.backdrop}>
      <View style={[s.formModal, { width: modalWidth, maxHeight, borderRadius: small ? 20 : 28 }]}>
        <View style={[s.formHeader, { paddingHorizontal: small ? 14 : 20, paddingVertical: small ? 12 : 18 }]}>
          <View style={s.formHeaderLeft}><View style={[s.formHeaderIcon, { width: small ? 38 : 44, height: small ? 38 : 44 }]}><Ionicons name={editing ? "create-outline" : "add"} size={small ? 19 : 22} color={C.primary} /></View><View style={s.formHeaderText}><Text style={s.modalEyebrow}>{editing ? "EDIT CATEGORY" : "NEW CATEGORY"}</Text><Text style={[s.formTitle, { fontSize: small ? 18 : 21 }]} numberOfLines={2}>{editing ? "Update category" : "Create category"}</Text></View></View>
          <Pressable disabled={saving} onPress={onClose} style={s.closeBtn}><Ionicons name="close" size={20} color={C.muted} /></Pressable>
        </View>

        <ScrollView style={s.formScroll} contentContainerStyle={{ padding: small ? 14 : mobile ? 18 : 24, gap: 19 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View><Text style={s.label}>Category Name <Text style={{ color: C.red }}>*</Text></Text><View style={s.inputWrap}><Ionicons name="pricetags-outline" size={18} color={C.faint} style={s.inputIcon} /><TextInput value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))} placeholder="Eg: Hair, Skin, Nails, Spa" placeholderTextColor={C.faint} maxLength={80} style={[s.input, { minHeight: small ? 48 : 52, fontSize: small ? 13 : 14 }]} selectionColor={C.primary} /></View><Text style={s.hint}>Use a short and clear category name.</Text></View>
          <View><View style={s.labelRow}><Text style={s.label}>Description</Text><Text style={s.counter}>{form.description.length}/500</Text></View><TextInput value={form.description} onChangeText={(v) => setForm((p) => ({ ...p, description: v }))} placeholder="Describe the services that belong to this category..." placeholderTextColor={C.faint} multiline textAlignVertical="top" maxLength={500} style={[s.textarea, { minHeight: small ? 120 : 140, fontSize: small ? 13 : 14 }]} selectionColor={C.primary} /></View>
          <View style={s.info}><View style={s.infoIcon}><Ionicons name="layers-outline" size={18} color={C.primary} /></View><View style={s.infoText}><Text style={s.infoTitle}>Category availability</Text><Text style={s.infoDesc}>Newly created categories are active by default and can be deactivated later.</Text></View></View>
        </ScrollView>

        <View style={[s.footer, { paddingHorizontal: small ? 14 : mobile ? 18 : 24, paddingVertical: small ? 12 : 16, gap: small ? 8 : 10 }]}>
          <Pressable disabled={saving} onPress={onClose} style={({ pressed }) => [s.modalSecondary, { opacity: saving ? 0.5 : pressed ? 0.78 : 1 }]}><Text style={[s.modalSecondaryText, { fontSize: small ? 11 : 14 }]} numberOfLines={1} adjustsFontSizeToFit>Cancel</Text></Pressable>
          <Pressable disabled={saving} onPress={onSubmit} style={({ pressed }) => [s.modalPrimary, small && s.modalPrimarySmall, { opacity: saving ? 0.6 : pressed ? 0.82 : 1 }]}>
            {saving ? <ActivityIndicator size="small" color={C.white} /> : <Ionicons name={editing ? "create-outline" : "add-circle-outline"} size={small ? 14 : 18} color={C.white} />}
            <Text style={[s.modalPrimaryText, { fontSize: small ? 11 : 14 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>{saving ? "Saving..." : submitLabel}</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}

function ConfirmModal({ visible, category, saving, small, onClose, onConfirm }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent><View style={s.backdrop}><View style={[s.confirm, { width: small ? "92%" : 430, padding: small ? 18 : 24, borderRadius: small ? 20 : 28 }]}>
    <View style={s.confirmIcon}><Ionicons name="warning-outline" size={29} color={C.red} /></View><Text style={s.confirmTitle}>Deactivate Category?</Text><Text style={s.confirmDesc}>Are you sure you want to deactivate <Text style={s.strong}>{category?.name || "this category"}</Text>?</Text>
    <View style={s.warning}><Ionicons name="information-circle-outline" size={17} color={C.amber} /><Text style={s.warningText}>This category will no longer be available as an active category.</Text></View>
    <View style={[s.confirmActions, { flexDirection: small ? "column" : "row" }]}><Pressable disabled={saving} onPress={onClose} style={s.modalSecondary}><Text style={s.modalSecondaryText}>Cancel</Text></Pressable><Pressable disabled={saving} onPress={onConfirm} style={s.danger}>{saving ? <ActivityIndicator size="small" color={C.white} /> : <Ionicons name="power-outline" size={17} color={C.white} />}<Text style={s.dangerText} numberOfLines={1}>{saving ? "Deactivating..." : "Deactivate"}</Text></Pressable></View>
  </View></View></Modal>;
}

function Toast({ data, onClose, mobile }) {
  const error = data.type === "error";
  return <View style={[s.toastPosition, { left: mobile ? 12 : undefined, right: mobile ? 12 : 22 }]}><View style={[s.toast, { borderColor: error ? "#FECACA" : "#A7F3D0" }]}><View style={[s.toastIcon, { backgroundColor: error ? C.redSoft : C.greenSoft }]}><Ionicons name={error ? "alert-circle-outline" : "checkmark-circle-outline"} size={19} color={error ? C.red : C.green} /></View><View style={s.toastBody}><Text style={[s.toastEyebrow, { color: error ? C.red : C.green }]}>{error ? "SOMETHING WENT WRONG" : "SUCCESS"}</Text><Text style={s.toastMessage}>{data.message}</Text></View><Pressable onPress={onClose} style={s.toastClose}><Ionicons name="close" size={18} color={C.faint} /></Pressable></View></View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg }, scroll: { flex: 1 }, content: { width: "100%", alignSelf: "center", minWidth: 0 },
  hero: { position: "relative", overflow: "hidden", marginBottom: 18, borderWidth: 1, borderColor: "#E9D5FF", backgroundColor: C.white, shadowColor: "#4C1D95", shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 3 },
  heroGlow: { position: "absolute", width: 210, height: 210, borderRadius: 105, right: -90, top: -105, backgroundColor: "#EDE9FE", opacity: 0.7 },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 13, minWidth: 0 }, crumbMuted: { color: C.faint, fontSize: 11, fontWeight: "700" }, crumbCurrent: { flex: 1, color: C.text2, fontSize: 11, fontWeight: "800" },
  heroMain: { gap: 20, justifyContent: "space-between" }, heroIdentity: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 13 }, heroIcon: { flexShrink: 0, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.28, shadowRadius: 13, shadowOffset: { width: 0, height: 6 }, elevation: 5 }, heroText: { flex: 1, minWidth: 0 }, eyebrow: { color: C.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.15 }, heroTitle: { color: C.text, fontWeight: "900", letterSpacing: -0.8 }, heroDesc: { marginTop: 5, color: C.muted, fontWeight: "600", maxWidth: 720 },
  heroActions: { alignItems: "stretch", justifyContent: "center", gap: 9 }, action: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 }, actionCompact: { minHeight: 44, paddingHorizontal: 12, borderRadius: 13 }, actionPrimary: { backgroundColor: C.primary, borderColor: C.primary, shadowColor: C.primary, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, actionSecondary: { backgroundColor: C.white, borderColor: C.border }, actionText: { fontWeight: "900" }, actionTextPrimary: { color: C.white }, actionTextSecondary: { color: C.text2 },
  stats: { width: "100%", marginBottom: 18 }, stat: { flex: 1, minWidth: 0, minHeight: 116, padding: 17, borderRadius: 22, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", shadowColor: "#0F172A", shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, statText: { flex: 1, minWidth: 0, paddingRight: 8 }, statTitle: { color: C.faint, fontSize: 10, lineHeight: 15, fontWeight: "900", letterSpacing: 0.6 }, statValue: { marginTop: 4, color: C.text, fontSize: 28, lineHeight: 34, fontWeight: "900" }, statSub: { marginTop: 2, color: C.faint, fontSize: 11, lineHeight: 16, fontWeight: "600" }, statIcon: { width: 46, height: 46, flexShrink: 0, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  filterCard: { marginBottom: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, shadowColor: "#0F172A", shadowOpacity: 0.045, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 2 }, filterTop: { width: "100%", alignItems: "stretch" }, searchWrap: { flex: 1, minWidth: 0, position: "relative" }, searchIcon: { position: "absolute", zIndex: 2, left: 15, top: 16 }, searchInput: { width: "100%", minWidth: 0, paddingLeft: 43, paddingRight: 13, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: "#F8FAFC", color: C.text2, fontWeight: "600" }, statusWrap: { minWidth: 0 }, filterLabel: { marginBottom: 6, color: C.text2, fontSize: 11, fontWeight: "900" }, select: { width: "100%", paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: C.border, backgroundColor: "#F8FAFC", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, selectLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 }, selectIcon: { width: 30, height: 30, flexShrink: 0, borderRadius: 9, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" }, selectText: { flex: 1, minWidth: 0, color: C.text2, fontSize: 13, fontWeight: "800" }, resultRow: { marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: C.borderSoft, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }, resultText: { color: C.faint, fontSize: 11, fontWeight: "700" }, resultStrong: { color: C.text2, fontWeight: "900" }, clearBtn: { flexDirection: "row", alignItems: "center", gap: 4 }, clearText: { color: C.primary, fontSize: 11, fontWeight: "900" },
  loading: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderColor: C.border, backgroundColor: C.white }, loadingIcon: { width: 54, height: 54, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: C.primarySoft, marginBottom: 13 }, loadingTitle: { color: C.text, fontSize: 17, fontWeight: "900" }, loadingText: { marginTop: 4, color: C.muted, fontSize: 12, textAlign: "center" }, empty: { alignItems: "center", paddingVertical: 55, paddingHorizontal: 20, borderRadius: 24, borderWidth: 1, borderStyle: "dashed", borderColor: "#CBD5E1", backgroundColor: C.white }, emptyIcon: { width: 76, height: 76, borderRadius: 25, marginBottom: 17, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F5F9" }, emptyTitle: { color: C.text, fontSize: 20, fontWeight: "900", textAlign: "center" }, emptyText: { maxWidth: 420, marginVertical: 7, color: C.muted, fontSize: 13, lineHeight: 20, fontWeight: "600", textAlign: "center" },
  grid: { width: "100%", flexDirection: "row", flexWrap: "wrap" }, card: { width: "100%", minWidth: 0, overflow: "hidden", borderRadius: 21, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, shadowColor: "#0F172A", shadowOpacity: 0.055, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2 }, cardAccent: { height: 5 }, cardBody: { minWidth: 0, padding: 17 }, cardHeader: { minWidth: 0, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, cardIdentity: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 }, catIcon: { width: 46, height: 46, flexShrink: 0, borderRadius: 15, alignItems: "center", justifyContent: "center" }, catNameWrap: { flex: 1, minWidth: 0 }, catName: { color: C.text, fontSize: 16, lineHeight: 21, fontWeight: "900" }, catType: { marginTop: 2, color: C.faint, fontSize: 10, fontWeight: "700" }, badge: { maxWidth: 92, minHeight: 26, flexShrink: 0, paddingHorizontal: 8, borderRadius: 999, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }, badgeText: { fontSize: 8.5, fontWeight: "900", letterSpacing: 0.3 }, description: { minHeight: 66, marginTop: 14 }, descriptionText: { color: C.muted, fontSize: 12.5, lineHeight: 19, fontWeight: "500" }, cardActions: { marginTop: 15, flexDirection: "row", alignItems: "stretch", gap: 8 }, editBtn: { flex: 1, minWidth: 0, minHeight: 44, borderRadius: 12, backgroundColor: C.primarySoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, editText: { color: C.primary, fontSize: 13, fontWeight: "900" }, squareBtn: { width: 44, minHeight: 44, flexShrink: 0, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  backdrop: { flex: 1, alignItems: "center", justifyContent: "center", padding: 10, backgroundColor: "rgba(15,23,42,0.64)" }, picker: { overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: "#E9D5FF", backgroundColor: C.white, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 15 }, elevation: 10 }, pickerHeader: { minHeight: 76, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: C.borderSoft, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, modalEyebrow: { color: C.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1 }, pickerTitle: { marginTop: 2, color: C.text, fontSize: 18, fontWeight: "900" }, closeBtn: { width: 40, height: 40, flexShrink: 0, borderRadius: 13, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center" }, option: { width: "100%", minHeight: 58, marginBottom: 8, paddingHorizontal: 10, borderRadius: 15, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 10 }, optionIcon: { width: 36, height: 36, flexShrink: 0, borderRadius: 11, alignItems: "center", justifyContent: "center" }, optionText: { flex: 1, minWidth: 0, color: C.text2, fontSize: 13, fontWeight: "800" }, radio: { width: 20, height: 20, flexShrink: 0, borderRadius: 10, borderWidth: 1.5, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" }, radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: C.primary },
  formModal: { overflow: "hidden", borderWidth: 1, borderColor: "#E9D5FF", backgroundColor: C.white, shadowColor: "#000", shadowOpacity: 0.26, shadowRadius: 32, shadowOffset: { width: 0, height: 16 }, elevation: 12 }, formHeader: { minWidth: 0, borderBottomWidth: 1, borderBottomColor: C.borderSoft, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, formHeaderLeft: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 }, formHeaderIcon: { flexShrink: 0, borderRadius: 14, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" }, formHeaderText: { flex: 1, minWidth: 0 }, formTitle: { marginTop: 2, color: C.text, fontWeight: "900" }, formScroll: { flexGrow: 0, minHeight: 0 }, label: { marginBottom: 7, color: C.text2, fontSize: 12, fontWeight: "900" }, labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, counter: { marginBottom: 7, color: C.faint, fontSize: 10, fontWeight: "700" }, inputWrap: { width: "100%", minWidth: 0, position: "relative" }, inputIcon: { position: "absolute", zIndex: 2, left: 15, top: 16 }, input: { width: "100%", minWidth: 0, paddingLeft: 43, paddingRight: 13, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: "#F8FAFC", color: C.text, fontWeight: "700" }, hint: { marginTop: 6, color: C.faint, fontSize: 10.5, fontWeight: "600" }, textarea: { width: "100%", minWidth: 0, paddingHorizontal: 13, paddingTop: 12, paddingBottom: 12, borderRadius: 15, borderWidth: 1, borderColor: C.border, backgroundColor: "#F8FAFC", color: C.text2, fontWeight: "600" }, info: { borderRadius: 16, borderWidth: 1, borderColor: "#DDD6FE", backgroundColor: C.primaryTint, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 10 }, infoIcon: { width: 32, height: 32, flexShrink: 0, borderRadius: 10, backgroundColor: C.primarySoft, alignItems: "center", justifyContent: "center" }, infoText: { flex: 1, minWidth: 0 }, infoTitle: { color: "#4C1D95", fontSize: 12, fontWeight: "900" }, infoDesc: { marginTop: 3, color: C.primary, fontSize: 10.5, lineHeight: 16, fontWeight: "600" }, footer: { borderTopWidth: 1, borderTopColor: C.borderSoft, flexDirection: "row", alignItems: "stretch" }, modalSecondary: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 9, borderRadius: 13, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, alignItems: "center", justifyContent: "center" }, modalSecondarySmall: { flex: 0.82, paddingHorizontal: 4 }, modalSecondaryText: { color: C.text2, fontWeight: "900", textAlign: "center" }, modalPrimary: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 8, borderRadius: 13, backgroundColor: C.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, shadowColor: C.primary, shadowOpacity: 0.22, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 }, modalPrimarySmall: { flex: 1.18, paddingHorizontal: 4, gap: 4 }, modalPrimaryText: { flex: 1, minWidth: 0, color: C.white, fontWeight: "900", textAlign: "center", includeFontPadding: false },
  confirm: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 30, shadowOffset: { width: 0, height: 15 }, elevation: 10 }, confirmIcon: { width: 64, height: 64, alignSelf: "center", marginBottom: 16, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: C.redSoft }, confirmTitle: { color: C.text, fontSize: 20, fontWeight: "900", textAlign: "center" }, confirmDesc: { marginTop: 7, color: C.muted, fontSize: 13, lineHeight: 20, fontWeight: "600", textAlign: "center" }, strong: { color: C.text2, fontWeight: "900" }, warning: { marginTop: 15, padding: 12, borderRadius: 14, backgroundColor: C.amberSoft, flexDirection: "row", alignItems: "flex-start", gap: 8 }, warningText: { flex: 1, color: "#92400E", fontSize: 10.5, lineHeight: 16, fontWeight: "700" }, confirmActions: { marginTop: 18, gap: 9 }, danger: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: 9, borderRadius: 13, backgroundColor: C.red, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }, dangerText: { flex: 1, color: C.white, fontSize: 13, fontWeight: "900", textAlign: "center" },
  toastPosition: { position: "absolute", top: Platform.OS === "web" ? 18 : 48, zIndex: 1000, maxWidth: 430, alignSelf: "center" }, toast: { width: "100%", minWidth: 0, padding: 11, borderRadius: 17, borderWidth: 1, backgroundColor: C.white, flexDirection: "row", alignItems: "flex-start", gap: 9, shadowColor: "#000", shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 }, toastIcon: { width: 36, height: 36, flexShrink: 0, borderRadius: 11, alignItems: "center", justifyContent: "center" }, toastBody: { flex: 1, minWidth: 0 }, toastEyebrow: { fontSize: 8, fontWeight: "900", letterSpacing: 0.8 }, toastMessage: { marginTop: 2, color: C.text2, fontSize: 11.5, lineHeight: 17, fontWeight: "800" }, toastClose: { width: 28, height: 28, flexShrink: 0, alignItems: "center", justifyContent: "center" },
});
