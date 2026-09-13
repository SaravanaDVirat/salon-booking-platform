import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CustomerFooter = () => {
  const { width } = useWindowDimensions();

  const isSmall = width < 360;
  const isTablet = width >= 600;
  const isDesktop = width >= 1000;

  const goSalons = () => {
    router.push("/customer/salons");
  };

  const goAppointments = () => {
    router.push("/customer/appointments");
  };

  const goHome = () => {
    router.replace("/customer/home");
  };

  return (
    <View style={styles.footer}>
      <View
        style={[
          styles.footerInner,
          {
            paddingHorizontal: isSmall
              ? 16
              : isTablet
              ? 28
              : 20,
            paddingTop: isSmall ? 38 : 52,
            paddingBottom: isSmall ? 22 : 28,
          },
        ]}
      >
        {/* =====================================================
            FOOTER MAIN CONTENT
        ===================================================== */}

        <View
          style={[
            styles.footerGrid,
            {
              flexDirection: isDesktop ? "row" : "column",
            },
          ]}
        >
          {/* =================================================
              BRAND
          ================================================= */}

          <View
            style={[
              styles.brandSection,
              {
                width: isDesktop ? "31%" : "100%",
              },
            ]}
          >
            <Pressable
              onPress={goHome}
              style={styles.footerLogoButton}
            >
              <View style={styles.footerLogoBox}>
                <Ionicons
                  name="sparkles"
                  size={21}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={[
                  styles.footerLogoText,
                  {
                    fontSize: isSmall ? 20 : 23,
                  },
                ]}
              >
                LUMORA
              </Text>
            </Pressable>

            <Text style={styles.description}>
              Your Beauty. Your Time. Your Place. Discover
              premium salons, beauty services and trusted
              stylists in one beautiful platform.
            </Text>

            {/* Social icons */}

            <View style={styles.socialRow}>
              <SocialButton icon="logo-instagram" />
              <SocialButton icon="logo-facebook" />
              <SocialButton icon="logo-twitter" />
            </View>
          </View>

          {/* =================================================
              PLATFORM
          ================================================= */}

          <FooterColumn
            title="Platform"
            width={isDesktop ? "19%" : "100%"}
            marginTop={isDesktop ? 0 : 32}
          >
            <FooterLink
              label="Discover Salons"
              icon="storefront-outline"
              onPress={goSalons}
            />

            <FooterLink
              label="Services"
              icon="sparkles-outline"
              onPress={goSalons}
            />

            <FooterLink
              label="How It Works"
              icon="help-circle-outline"
              onPress={goHome}
            />
          </FooterColumn>

          {/* =================================================
              CUSTOMER
          ================================================= */}

          <FooterColumn
            title="Customer"
            width={isDesktop ? "19%" : "100%"}
            marginTop={isDesktop ? 0 : 28}
          >
            <FooterLink
              label="My Appointments"
              icon="calendar-outline"
              onPress={goAppointments}
            />

            <FooterLink
              label="Booking History"
              icon="time-outline"
              onPress={goAppointments}
            />

            <FooterLink
              label="Help & Support"
              icon="headset-outline"
              onPress={goHome}
            />
          </FooterColumn>

          {/* =================================================
              BUSINESS
          ================================================= */}

          <FooterColumn
            title="Business"
            width={isDesktop ? "19%" : "100%"}
            marginTop={isDesktop ? 0 : 28}
          >
            <FooterLink
              label="Become a Salon Partner"
              icon="business-outline"
              onPress={goHome}
            />

            <FooterLink
              label="Partner Login"
              icon="log-in-outline"
              onPress={goHome}
            />

            <FooterLink
              label="Business Support"
              icon="help-buoy-outline"
              onPress={goHome}
            />
          </FooterColumn>
        </View>

        {/* =====================================================
            BOTTOM DIVIDER
        ===================================================== */}

        <View style={styles.divider} />

        {/* =====================================================
            COPYRIGHT
        ===================================================== */}

        <View
          style={[
            styles.bottomRow,
            {
              flexDirection:
                width < 520 ? "column" : "row",
              alignItems:
                width < 520 ? "flex-start" : "center",
            },
          ]}
        >
          <Text style={styles.copyright}>
            © 2026 LUMORA. All rights reserved.
          </Text>

          <View
            style={[
              styles.legalLinks,
              {
                marginTop: width < 520 ? 13 : 0,
              },
            ]}
          >
            <Pressable>
              <Text style={styles.legalText}>
                Privacy
              </Text>
            </Pressable>

            <Pressable>
              <Text style={styles.legalText}>
                Terms
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

/* =============================================================
   FOOTER COLUMN
============================================================= */

const FooterColumn = ({
  title,
  children,
  width,
  marginTop,
}) => {
  return (
    <View
      style={{
        width,
        marginTop,
      }}
    >
      <Text style={styles.columnTitle}>{title}</Text>

      <View style={styles.linksContainer}>
        {children}
      </View>
    </View>
  );
};

/* =============================================================
   FOOTER LINK
============================================================= */

const FooterLink = ({
  label,
  icon,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.footerLink,
        pressed && styles.footerLinkPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={15}
        color="#94A3B8"
      />

      <Text
        style={styles.footerLinkText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </Pressable>
  );
};

/* =============================================================
   SOCIAL BUTTON
============================================================= */

const SocialButton = ({ icon }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.socialButton,
        pressed && styles.socialPressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color="#CBD5E1"
      />
    </Pressable>
  );
};

/* =============================================================
   STYLES
============================================================= */

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    backgroundColor: "#090B16",
  },

  footerInner: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
  },

  footerGrid: {
    width: "100%",

    justifyContent: "space-between",
  },

  brandSection: {
    minWidth: 0,
  },

  footerLogoButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  footerLogoBox: {
    width: 43,
    height: 43,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 12,

    backgroundColor: "#6D28D9",
  },

  footerLogoText: {
    marginLeft: 10,

    fontWeight: "900",
    letterSpacing: 3,

    color: "#FFFFFF",
  },

  description: {
    maxWidth: 390,

    marginTop: 17,

    fontSize: 13,
    lineHeight: 23,

    color: "#94A3B8",
  },

  socialRow: {
    flexDirection: "row",
    alignItems: "center",

    marginTop: 20,

    gap: 9,
  },

  socialButton: {
    width: 40,
    height: 40,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 11,

    backgroundColor: "rgba(255,255,255,0.06)",
  },

  socialPressed: {
    backgroundColor: "#6D28D9",
  },

  columnTitle: {
    fontSize: 12,
    fontWeight: "900",

    letterSpacing: 1.4,
    textTransform: "uppercase",

    color: "#FFFFFF",
  },

  linksContainer: {
    marginTop: 15,
  },

  footerLink: {
    minHeight: 34,

    flexDirection: "row",
    alignItems: "center",

    borderRadius: 8,

    paddingVertical: 5,
    paddingHorizontal: 5,
  },

  footerLinkPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  footerLinkText: {
    flex: 1,
    minWidth: 0,

    marginLeft: 9,

    fontSize: 13,
    fontWeight: "600",

    color: "#94A3B8",
  },

  divider: {
    height: 1,

    marginTop: 40,

    backgroundColor: "rgba(255,255,255,0.08)",
  },

  bottomRow: {
    width: "100%",

    justifyContent: "space-between",

    paddingTop: 20,
  },

  copyright: {
    fontSize: 11,
    lineHeight: 18,

    color: "#64748B",
  },

  legalLinks: {
    flexDirection: "row",
    alignItems: "center",

    gap: 20,
  },

  legalText: {
    fontSize: 11,
    fontWeight: "700",

    color: "#64748B",
  },
});

export default CustomerFooter;