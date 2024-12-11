import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import db from "./firebase";

interface EditAccountRouteParams {
  userID: string;
  currentFirstName: string;
  currentLastName: string;
}

export default function EditAccount() {
  const route = useRoute();
  const { userID, currentFirstName, currentLastName } = route.params as EditAccountRouteParams;

  const [firstName, setFirstName] = useState(currentFirstName || "");
  const [lastName, setLastName] = useState(currentLastName || "");
  const router = useRouter();

  // Log the current values for debugging
  useEffect(() => {
    console.log("Current first name:", currentFirstName);
    console.log("Current last name:", currentLastName);
  }, [currentFirstName, currentLastName]);

  const updateUserData = async () => {
    try {
      const userRef = doc(db, "users", userID); // Reference to the user document
      await updateDoc(userRef, {
        name: `${firstName} ${lastName}`,
      });
      console.log("User account updated successfully!");

      // Go back to the home screen after update
      router.push("/"); // You can navigate back or to a different screen after the update
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Account</Text>

      {/* First Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
        />
      </View>

      {/* Last Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
        />
      </View>

      {/* Update Button */}
      <Button title="Update Account" onPress={updateUserData} />

      <View style={styles.space} />

      {/* Go Back Button */}
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    width: "100%",
  },
  space: {
    marginBottom: 20,
  },
});
