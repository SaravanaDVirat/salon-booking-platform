import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Redirect, Slot } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomerHeader from "./CustomerHeader";

const CustomerProtectedRoute = ({
  allowedRoles = ["CUSTOMER"],
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async () => {
      try {
        const [token, storedRole, user] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("role"),
          AsyncStorage.getItem("user"),
        ]);

        if (!mounted) return;

        const normalizedRole = storedRole
          ? storedRole.trim().toUpperCase()
          : null;

        const authenticated = Boolean(
          token &&
            storedRole &&
            user &&
            normalizedRole
        );

        setIsAuthenticated(authenticated);
        setRole(normalizedRole);
      } catch (error) {
        console.error(
          "Customer authentication check failed:",
          error
        );

        if (!mounted) return;

        setIsAuthenticated(false);
        setRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator
              size="small"
              color="#6D28D9"
            />
          </View>
        </View>
      </View>
    );
  }

  /* =======================================================
     AUTH CHECK
  ======================================================= */

  if (!isAuthenticated) {
    return <Redirect href="/customer/login" />;
  }

  /* =======================================================
     ROLE CHECK
  ======================================================= */

  const normalizedAllowedRoles = allowedRoles.map(
    (item) => item.trim().toUpperCase()
  );

  if (
    normalizedAllowedRoles.length > 0 &&
    (!role || !normalizedAllowedRoles.includes(role))
  ) {
    return <Redirect href="/customer/login" />;
  }

  /* =======================================================
     PROTECTED CUSTOMER SHELL
     
     Footer intentionally removed.
     Individual pages can render CustomerFooter
     inside their own ScrollView when required.
  ======================================================= */

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <CustomerHeader />
      </View>

      <View style={styles.main}>
        <Slot />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* =======================================================
     ROOT
  ======================================================= */

  root: {
    flex: 1,

    width: "100%",
    minWidth: 0,
    minHeight: 0,

    alignSelf: "stretch",

    backgroundColor: "#FCF9FC",
  },

  /* =======================================================
     HEADER
  ======================================================= */

  header: {
    width: "100%",
    minWidth: 0,

    flexShrink: 0,

    alignSelf: "stretch",

    zIndex: 100,
    elevation: 10,
  },

  /* =======================================================
     MAIN CONTENT
  ======================================================= */

  main: {
    flex: 1,

    width: "100%",
    minWidth: 0,
    minHeight: 0,

    alignSelf: "stretch",

    /*
     * Important:
     * Slot pages manage their own ScrollView.
     * Hidden prevents the protected shell itself
     * from creating an extra overflow area.
     */
    overflow: "hidden",

    zIndex: 1,
  },

  /* =======================================================
     LOADING SCREEN
  ======================================================= */

  loadingScreen: {
    flex: 1,

    width: "100%",
    minWidth: 0,
    minHeight: 320,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#FCF9FC",
  },

  loadingCard: {
    width: 74,
    height: 74,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#EADDE9",

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    shadowColor: "#241028",

    shadowOffset: {
      width: 0,
      height: 12,
    },

    shadowOpacity: 0.08,
    shadowRadius: 24,

    elevation: 4,
  },

  loadingIcon: {
    width: 42,
    height: 42,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 14,

    backgroundColor: "#F4ECF5",
  },
});

export default CustomerProtectedRoute;