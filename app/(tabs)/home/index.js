import React, { useEffect, useState, useRef } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import {
  AntDesign,
  Ionicons,
  Entypo,
  Feather,
  MaterialIcons,
  FontAwesome
} from "@expo/vector-icons";
import {
  BottomModal,
  ModalContent,
  SlideAnimation,
  ModalTitle,
} from "react-native-modals";
import axios from "axios";
import moment from "moment";
import FlashMessage from "react-native-flash-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firstTimeLogin } from '../../(authenticate)/login';
import { useRoute } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

const Index = () => {
  const [todos, setTodos] = useState([]);
  const today = moment().format("MMM Do");
  const [isModalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("All");
  const [todo, setTodo] = useState("");
  const [pendingTodos, setPendingTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [hasLoggedInOnce, setHasLoggedInOnce] = useState(false);
  const [marked, setMarked] = useState(false);

  const suggestions = [
    {
      id: "0",
      todo: "Go for a walk",
    },
    {
      id: "1",
      todo: "Go exercise",
    },
    {
      id: "2",
      todo: "Go shopping",
    },
    {
      id: "3",
      todo: "Go to bed early",
    },
    {
      id: "4",
      todo: "Hang out with friends",
    },
  ];

  const addTodo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId'); // Retrieve userId from AsyncStorage
      const todoData = {
        userId: userId, // Assign userId to the todoData object
        title: todo,
        category: category,
      };
  
      await axios.post(
        `https://task-db-rosy.vercel.app/todos/${userId}`,
        todoData
      );
  
      await getUserTodos();
  
      setTodo("");
      setModalVisible(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getUserTodos = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`https://task-db-rosy.vercel.app/users/${userId}/todos`);
  
      const fetchedTodos = response.data.todos || [];
  
      // Filter todos based on the selected category
      const filteredTodos = fetchedTodos.filter(todo => todo.category === category);

      // Filter pending and completed todos separately
      const pending = filteredTodos.filter(todo => todo.status !== "completed");
      const completed = filteredTodos.filter(todo => todo.status === "completed");
  
      setTodos(filteredTodos);
      setPendingTodos(pending);
      setCompletedTodos(completed);
    } catch (error) {
      console.log("error", error);
    }
  };  

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        
        console.log('User ID:', userId);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      }
    };

    getUserData();

    const checkFirstTimeLogin = async () => {
      try {
        const isFirstTimeLogin = await AsyncStorage.getItem('firstTimeLogin');
        if (isFirstTimeLogin) {
          handleFlashMessage("Success!", "You have successfully logged in", "success");
        }
      } catch (error) {
        console.error('Error checking first-time login:', error);
      }
    };

    if (!hasLoggedInOnce) { // Check if firstTimeLogin has occurred
      checkFirstTimeLogin(); // If not, call checkFirstTimeLogin
    }
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getUserTodos();
    } 
  }, [isFocused, category, marked, isModalVisible]);

  const markTodoAsCompleted = async (todoId) => {
    try {
      setMarked(true);
      await axios.patch(`https://task-db-rosy.vercel.app/todos/${todoId}/complete`);
      await getUserTodos();
      handleFlashMessage("Task marked as completed!", "Task successfully marked as completed", "success");
    } catch (error) {
      console.log("error", error);
    }
  };
  
  const handleDeleteTask = async (todoIdDelete) => {
    try {
      await axios.delete(`https://task-db-rosy.vercel.app/todos/${todoIdDelete}`);
      await getUserTodos();
      handleFlashMessage("Task Deleted!", "Task successfully deleted", "success");
    } catch (error) {
      console.log("Error deleting task:", error);
    }
  };

  const flashMessage = useRef();
  
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
  
  const firstTimeLogin = async () => {
    try {
      // Check if the flag indicating first-time login exists in AsyncStorage
      const isFirstTimeLogin = await AsyncStorage.getItem('firstTimeLogin');
  
      if (!isFirstTimeLogin) {
        // If it's the first time logging in, set the flag in AsyncStorage
        await AsyncStorage.setItem('firstTimeLogin', 'true');
        // Perform actions for first-time login
        console.log("You've successfully logged in for the first time!");
      } else {
        // If it's not the first time logging in, perform actions accordingly
        handleFlashMessage("Login!", "You have succesfully logged in", "success");
      }
    } catch (error) {
      console.error('Error checking first-time login:', error);
    }
  };

  return (
    <>
      <View
        style={{
          marginHorizontal: 10,
          marginVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Pressable
          onPress={() => { 
            setCategory("All");
            getUserTodos();
          }}
          style={{
            backgroundColor: category === "All" ? "#7CB9E8" : "#FFFFFF",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: category === "All" ? "white" : "black", textAlign: "center" }}>All</Text>
        </Pressable>
        <Pressable
          onPress={() => { 
            setCategory("Work");
            getUserTodos();
          }}
          style={{
            backgroundColor: category === "Work" ? "#7CB9E8" : "#FFFFFF",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: category === "Work" ? "white" : "black", textAlign: "center" }}>Work</Text>
        </Pressable>
        <Pressable
          onPress={() => { 
            setCategory("Personal");
            getUserTodos();
          }}
          style={{
            backgroundColor: category === "Personal" ? "#7CB9E8" : "#FFFFFF",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            marginRight: "auto",
          }}
        >
          <Text style={{ color: category === "Personal" ? "white" : "black", textAlign: "center" }}>Personal</Text>
        </Pressable>
        <Pressable onPress={() => setModalVisible(!isModalVisible)}>
          <AntDesign name="pluscircle" size={30} color="#007FFF" />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: "white" , position: "relative"}}>
        <View style={{ padding: 10 }}>
          {todos?.length > 0 ? (
            <View>
              {pendingTodos?.length > 0 && <Text>Task to do! {today}</Text>}

              {pendingTodos?.map((item, index) => (
                <Pressable
                  style={{
                    backgroundColor: "#E0E0E0",
                    padding: 10,
                    borderRadius: 7,
                    marginVertical: 10,
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
                    <Entypo
                      onPress={() => markTodoAsCompleted(item?._id)}
                      name="circle"
                      size={18}
                      color="black"
                    />
                    <Text style={{ flex: 1 }}>{item?.title}</Text>
                    <Feather onPress={() => handleDeleteTask(item?._id)} name="flag" size={20} color="black" />
                  </View>
                </Pressable>
              ))}

              {completedTodos?.length > 0 && (
                <View>
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      margin: 10,
                    }}
                  >
                    <Image
                      style={{ width: 200, height: 200, resizeMode: "contain" }}
                      source={{
                        uri: "https://cdn-icons-png.flaticon.com/128/6784/6784655.png",
                      }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      marginVertical: 10,
                    }}
                  >
                    <Text>Completed Tasks</Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="black"
                    />
                  </View>

                  {completedTodos?.map((item, index) => (
                    <Pressable
                      style={{
                        backgroundColor: "#E0E0E0",
                        padding: 10,
                        borderRadius: 7,
                        marginVertical: 10,
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
                        <Feather  onPress={() => handleDeleteTask(item?._id)} name="flag" size={20} color="gray" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                marginTop: 130,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <Image
                style={{ width: 200, height: 200, resizeMode: "contain" }}
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/2387/2387679.png",
                }}
              />
              <Text
                style={{
                  fontSize: 16,
                  marginTop: 15,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                No Tasks for today! Add a task
              </Text>
              <Pressable
                onPress={() => setModalVisible(!isModalVisible)}
                style={{ marginTop: 15 }}
              >
                <AntDesign name="pluscircle" size={30} color="#007FFF" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomModal
        onBackdropPress={() => setModalVisible(!isModalVisible)}
        onHardwareBackpress={() => setModalVisible(!isModalVisible)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalTitle={<ModalTitle title="Add a Task" />}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        visible={isModalVisible}
        onTouchOutside={() => setModalVisible(!isModalVisible)}
      >
        <ModalContent style={{ width: "100%", height: 300 }}>
          <View
            style={{
              marginVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <TextInput
              value={todo}
              onChangeText={(text) => setTodo(text)}
              placeholder="Input a new task here"
              style={{
                padding: 10,
                borderColor: "#E0E0E0",
                borderWidth: 1,
                borderRadius: 5,
                flex: 1,
              }}
            />
            <Ionicons onPress={addTodo} name="send" size={24} color="#007FFF" />
          </View>

          <Text>Choose Category</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginVertical: 10,
            }}
          >
            <Pressable
              onPress={() => setCategory("All")}
              style={{
                borderColor: "#E0E0E0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 25,
              }}
            >
              <Text>All</Text>
            </Pressable>
            <Pressable
              onPress={() => setCategory("Work")}
              style={{
                borderColor: "#E0E0E0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 25,
              }}
            >
              <Text>Work</Text>
            </Pressable>
            <Pressable
              onPress={() => setCategory("Personal")}
              style={{
                borderColor: "#E0E0E0",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderRadius: 25,
              }}
            >
              <Text>Personal</Text>
            </Pressable>
          </View>

          <Text>Some Suggestions</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginVertical: 10,
            }}
          >
            {suggestions?.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setTodo(item?.todo)}
                style={{
                  backgroundColor: "#F0F8FF",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 25,
                }}
              >
                <Text style={{ textAlign: "center" }} key={index}>
                  {item?.todo}
                </Text>
              </Pressable>
            ))}
          </View>
        </ModalContent>
      </BottomModal>
      <FlashMessage ref={flashMessage}/>
    </>
  );
};

export default Index;

const styles = StyleSheet.create({});
