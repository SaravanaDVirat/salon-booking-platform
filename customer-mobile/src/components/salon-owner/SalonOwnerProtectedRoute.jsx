import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SalonOwnerProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkSalonOwnerSession = async () => {
      try {
        const [token, userData] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user"),
        ]);

        if (!token || !userData) {
          if (mounted) {
            setAuthenticated(false);
            setChecking(false);
          }

          return;
        }

        let user = null;

        try {
          user = JSON.parse(userData);
        } catch (error) {
          console.error("Invalid user session");

          await Promise.all([
            AsyncStorage.removeItem("token"),
            AsyncStorage.removeItem("user"),
            AsyncStorage.removeItem("role"),
            AsyncStorage.removeItem("userId"),
            AsyncStorage.removeItem("userName"),
            AsyncStorage.removeItem("userEmail"),
          ]);

          if (mounted) {
            setAuthenticated(false);
            setChecking(false);
          }

          return;
        }

        if (!user || user.role !== "SALON_OWNER") {
          await Promise.all([
            AsyncStorage.removeItem("token"),
            AsyncStorage.removeItem("user"),
            AsyncStorage.removeItem("role"),
            AsyncStorage.removeItem("userId"),
            AsyncStorage.removeItem("userName"),
            AsyncStorage.removeItem("userEmail"),
          ]);

          if (mounted) {
            setAuthenticated(false);
            setChecking(false);
          }

          return;
        }

        if (mounted) {
          setAuthenticated(true);
          setChecking(false);
        }
      } catch (error) {
        console.error(
          "Salon Owner session check failed:",
          error
        );

        if (mounted) {
          setAuthenticated(false);
          setChecking(false);
        }
      }
    };

    checkSalonOwnerSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ------------------------------------------------------------
  // SESSION CHECKING
  // ------------------------------------------------------------

  if (checking) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingCard}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInner} />
          </View>

          <ActivityIndicator
            size="small"
            color="#D946EF"
            style={styles.loader}
          />
        </View>
      </View>
    );
  }

  // ------------------------------------------------------------
  // NOT AUTHENTICATED
  // ------------------------------------------------------------

  if (!authenticated) {
    return <Redirect href="/salon-owner/login" />;
  }

  // ------------------------------------------------------------
  // AUTHENTICATED
  // ------------------------------------------------------------

  return children;
};

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#070A16",
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.045)",
    shadowColor: "#D946EF",
    shadowOpacity: 0.16,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },

  logoCircle: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#D946EF",
    shadowColor: "#D946EF",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    elevation: 6,
  },

  logoInner: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },

  loader: {
    marginTop: 14,
  },
});

export default SalonOwnerProtectedRoute;