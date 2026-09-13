import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AdminProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAdminAccess = async () => {
      try {
        const [token, adminData] = await Promise.all([
          AsyncStorage.getItem("adminToken"),
          AsyncStorage.getItem("adminData"),
        ]);

        if (!token || !adminData) {
          if (mounted) {
            setIsAuthorized(false);
            setChecking(false);
          }
          return;
        }

        let admin;

        try {
          admin = JSON.parse(adminData);
        } catch {
          await Promise.all([
            AsyncStorage.removeItem("adminToken"),
            AsyncStorage.removeItem("adminData"),
          ]);

          if (mounted) {
            setIsAuthorized(false);
            setChecking(false);
          }

          return;
        }

        if (!admin || admin.role !== "ADMIN") {
          await Promise.all([
            AsyncStorage.removeItem("adminToken"),
            AsyncStorage.removeItem("adminData"),
          ]);

          if (mounted) {
            setIsAuthorized(false);
            setChecking(false);
          }

          return;
        }

        if (mounted) {
          setIsAuthorized(true);
          setChecking(false);
        }
      } catch (error) {
        console.error("Admin protected route error:", error);

        await Promise.all([
          AsyncStorage.removeItem("adminToken"),
          AsyncStorage.removeItem("adminData"),
        ]);

        if (mounted) {
          setIsAuthorized(false);
          setChecking(false);
        }
      }
    };

    checkAdminAccess();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     AUTH CHECKING
  ========================================================== */

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <View style={styles.iconContainer}>
            <ActivityIndicator
              size="large"
              color="#7C3AED"
            />
          </View>

          <View style={styles.loadingTextContainer}>
            <View style={styles.loadingLine} />
            <View style={styles.loadingLineSmall} />
          </View>
        </View>
      </View>
    );
  }

  /* ==========================================================
     NOT AUTHORIZED
  ========================================================== */

  if (!isAuthorized) {
    return <Redirect href="/admin/login" />;
  }

  /* ==========================================================
     AUTHORIZED
  ========================================================== */

  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#090611",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  loadingCard: {
    width: "100%",
    maxWidth: 380,
    paddingHorizontal: 28,
    paddingVertical: 30,
    borderRadius: 28,
    backgroundColor: "#171125",
    borderWidth: 1,
    borderColor: "#FFFFFF12",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#7C3AED18",
    borderWidth: 1,
    borderColor: "#A78BFA35",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingTextContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },

  loadingLine: {
    width: "55%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF18",
  },

  loadingLineSmall: {
    width: "35%",
    height: 6,
    borderRadius: 999,
    backgroundColor: "#FFFFFF0D",
    marginTop: 10,
  },
});

export default AdminProtectedRoute;