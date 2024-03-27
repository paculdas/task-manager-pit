import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Index = () => {
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const router = useRouter();

  const fetchTaskData = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const response = await axios.get(`http://192.168.1.3:3000/todos/${userId}/count`);
      const { totalCompletedTodos, totalPendingTodos } = response.data;
      setCompletedTasks(totalCompletedTodos);
      setPendingTasks(totalPendingTodos);
    } catch (error) {
      console.log("Error fetching task data:", error);
    }
  };

  const fetchUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    try {
      const response = await axios.get(
        `http://192.168.1.3:3000/users/${userId}`
      );
      const userData = response.data;

      setUserName(userData.name);
      setUserEmail(userData.email);
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchTaskData();
    fetchUser();

    const intervalId = setInterval(fetchTaskData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      console.log("User has logged out of the account");
      setShowLogout(false);
      router.replace("/login");
    } catch (error) {
      console.log("Error logging out", error);
    }
  };

  return (
    <View style={{ padding: 10, flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          style={{ width: 60, height: 60, borderRadius: 30 }}
          source={{
            uri: "https://wallpapers.com/images/high/basic-default-pfp-pxi77qv5o0zuz8j3.webp",
          }}
        />
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            Welcome, {userName}
          </Text>
          <Text style={{ fontSize: 15, color: "gray", marginTop: 4 }}>
            {userEmail}
          </Text>
        </View>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ textAlign: "center" }}>Tasks Overview</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginVertical: 8,
          }}
        >

          <View
            style={{
              backgroundColor: "#89CFF0",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {completedTasks}
            </Text>
            <Text style={{ marginTop: 4 }}>Completed Tasks</Text>
          </View>

          {/* Pending Tasks */}
          <View
            style={{
              backgroundColor: "#89CFF0",
              padding: 10,
              borderRadius: 8,
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              {pendingTasks}
            </Text>
            <Text style={{ marginTop: 4 }}>Pending Tasks</Text>
          </View>
        </View>
      </View>

      {/* Log Out Button */}
      <Pressable
        onPress={() => setShowLogout(true)}
        style={{
          width: 200,
          backgroundColor: "#FF6347",
          padding: 15,
          borderRadius: 6,
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: 20,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Log Out
        </Text>
      </Pressable>

      {/* Log Out Confirmation Modal */}
      <Modal
        visible={showLogout}
        onRequestClose={() => setShowLogout(false)}
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.buttonContainer}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowLogout(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              {/* Log Out Button */}
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={handleLogout}
              >
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: 300,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    padding: 10,
    borderRadius: 6,
    width: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  logoutButton: {
    backgroundColor: "#FF6347",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
