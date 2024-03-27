import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import {
  AntDesign,
  Ionicons,
  Entypo,
  Feather,
  MaterialIcons,
  FontAwesome,
} from "@expo/vector-icons";
import FlashMessage from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

const index = () => {
  const today = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState([]);
  const flashMessage = useRef();

  const fetchCompletedTodos = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const formattedDate = moment(selectedDate).format("YYYY-MM-DD"); // Format the date string if needed
  
      const response = await axios.get(
        `http://127.0.0.1:3000/todos/completed/${formattedDate}/${userId}`
      );
  
      const completedTodos = response.data.completedTodos || [];
      setTodos(completedTodos);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleFlashMessage = (message, description, type) => {
    flashMessage.current.showMessage({
      message,
      description,
      type,
      position: "bottom",
      style: {
      },
      icon: () => <FontAwesome name="check-circle" size={24} color="white" style={{paddingRight: 20, paddingTop: 14}}/>
    });
  }
  
  useEffect(() => {
    fetchCompletedTodos();
  }, [selectedDate]);

  console.log(todos);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleDeleteTask = async (todoIdDelete) => {
    try {
      const response = await axios.delete(`http://127.0.0.1:3000/todos/${todoIdDelete}`);
      console.log("Task deleted successfully:", response.data);

      await fetchCompletedTodos();

      handleFlashMessage("Task Deleted!", "Task successfully deleted", "success");
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  return (
    <>
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#7CB9E8" },
        }}
      />

      <View style={{ marginTop: 20 }} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
          marginVertical: 10,
          marginHorizontal: 12,
        }}
      >
        <Text>Completed Tasks</Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
      </View>

      {todos?.map((item, index) => (
        <Pressable
          style={{
            backgroundColor: "#E0E0E0",
            padding: 10,
            borderRadius: 7,
            marginVertical: 10,
            marginHorizontal: 12,
          }}
          key={index}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FontAwesome name="circle" size={18} color="gray" />
            <Text
              style={{
                flex: 1,
                textDecorationLine: "line-through",
                color: "gray",
              }}
            >
              {item?.title}
            </Text>
            <Feather onPress={() => handleDeleteTask(item?._id)} name="flag" size={20} color="gray" />
          </View>
        </Pressable>
      ))}
    </ScrollView>
      <FlashMessage ref={flashMessage}/>
    </>
  );
};

export default index;

const styles = StyleSheet.create({});
