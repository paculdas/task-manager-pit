import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasLoggedInOnce, setHasLoggedInOnce] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    const checkLoginStatus = async() => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if(token){
          router.replace("/(tabs)/home")
        }
      } catch(error){
        console.log(error)
      }
    }
    checkLoginStatus();
  }, [])

  const handleLogin = async () => {
    const user = {
      email: email,
      password: password,
    };
  
    try {
      const response = await axios.post("https://task-db-rosy.vercel.app/login", user);
      const token = response.data.token;
  
      if (!token) {
        Alert.alert("Error", "Token is empty");
        return;
      }
  
      const userId = response.data.userId;

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userId", userId);
      Alert.alert("Success", "You have successfully logged in");

      router.replace({
        name: "(tabs)/home",
      });

    } catch (error) {
      console.log("Login failed", error);
      Alert.alert("Error", "Login failed");
    }
  };
  

  const firstTimeLogin = async () => {
    try {
      const isFirstTimeLogin = await AsyncStorage.getItem('firstTimeLogin');
  
      if (!isFirstTimeLogin) {
        await AsyncStorage.setItem('firstTimeLogin', 'true');
        console.log("You've successfully logged in for the first time!");
      } else {
        console.log("Welcome back!");
      }
    } catch (error) {
      console.error('Error checking first-time login:', error);
    }
  };
  
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "white", alignItems: "center" }}
    >
      <View style={{ marginTop: 80 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#0066b2" }}>
          Task Manager App
        </Text>
      </View>
      <KeyboardAvoidingView>
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: 600, marginTop: 20 }}>
            Log in to your account
          </Text>

          <View style={{ marginTop: 70 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 30,
              }}
            >
              <MaterialIcons
                style={{ marginLeft: 8 }}
                name="email"
                size={24}
                color="gray"
              />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: email ? 17 : 17,
                }}
                placeholder="Enter your email"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: "#E0E0E0",
                paddingVertical: 5,
                borderRadius: 5,
                marginTop: 30,
              }}
            >
              <AntDesign
                style={{ marginLeft: 8 }}
                name="lock"
                size={24}
                color="gray"
              />
              <TextInput
                value={password}
                secureTextEntry={true}
                onChangeText={(text) => setPassword(text)}
                style={{
                  color: "gray",
                  marginVertical: 10,
                  width: 300,
                  fontSize: email ? 17 : 17,
                }}
                placeholder="Enter your password"
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 12,
                justifyContent: "space-between",
              }}
            >
            </View>

            <View style={{ marginTop: 70 }} />

            <Pressable
              onPress={handleLogin}
              style={{
                width: 200,
                backgroundColor: "#6699CC",
                padding: 15,
                borderRadius: 6,
                marginLeft: "auto",
                marginRight: "auto",
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
                Login
              </Text>
            </Pressable>

            <Pressable onPress={() => router.replace("/register")} style={{ marginTop: 15 }}>
              <Text
                style={{ textAlign: "center", fontSize: 15, color: "gray" }}
              >
                Don't have an account? Sign up!
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({});
