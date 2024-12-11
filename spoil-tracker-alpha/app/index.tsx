import React, { useEffect, useState } from "react";
import { Text, View, Button, Modal, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import db from "./firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

export default function HomeScreen() {
  const router = useRouter();
  const [isModalVisible, setModalVisible] = useState(false); // State to control modal visibility
  const [userData, setUserData] = useState({ email: "", firstName: "", lastName: "" });

  //Hardcoded userID
  const userID = "Sd9NPSaLfYtRkZZwmpaG"; // Replace with actual dynamic userID

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        //const userID = "AMrBBLo4ncmDHe2rPOJc";
        console.log("Starting fetchUserData...");
        const userDoc = await getDoc(doc(db, "users", userID));
        console.log("Firestore query complete:", userDoc);

        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log("User document data:", data);

          // Update state with the retrieved data
          setUserData({
            email: data.email,
            firstName: data.name.split(" ")[0], // Extract first name
            lastName: data.name.split(" ")[1],  // Extract last name
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);


  const toggleModal = () => {
    setModalVisible(!isModalVisible); // Toggle the modal visibility
  };

  const handleDeleteAccount = async () => {
    try {
      // Reference to the user document by userID
      const userRef = doc(db, "users", userID);

       //Delete the user document from Firestore
      await deleteDoc(userRef);

      //console.log("User account deleted successfully.");

      // Optionally, navigate to a different screen (e.g., home page)
      router.push("/"); // Redirect to the Home screen

      // Close the modal after deletion
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting user account: ", error);
    }
  };
  

  //const handleDeleteAccount = () => {
    //console.log("Account Deleted");
     //Add logic to permanently delete the account (API call or similar)
    //router.push("/"); // Navigate to Home Screen after deletion
    //setModalVisible(false); // Close the modal after deletion
  //};

  return (
    <View style={styles.container}>
      {/* First Group */}
      <View style={styles.group}>
        <Text style={styles.title}>My Account</Text>
        <Text>Your user account details</Text>
        <View style={styles.space} />
        <Text>Email: {userData.email || "Loading..."}</Text>
        <Text>First Name: {userData.firstName || "Loading..."}</Text>
        <Text>Last Name: {userData.lastName || "Loading..."}</Text>
        <Text>Date joined: </Text>
        <Button
          title="Edit Account"
          onPress={() =>
            router.push({
              pathname: "/EditAccount",
              params: {
                userID, // Pass the userID
                currentFirstName: userData.firstName,
                currentLastName: userData.lastName,
              },
            })
          }
        />
      </View>

      {/* Second Group */}
      <View style={styles.group}>
        <Text style={styles.dangerText}>Permanently Delete User Account</Text>
        <Button title="Delete Account" onPress={toggleModal} />
      </View>

      {/* Modal for Delete Confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal} // Handle closing the modal
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Are you sure?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </Text>

            {/* Buttons for the modal */}
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={toggleModal} />
              <Button title="Permanently Delete Account" color="red" onPress={handleDeleteAccount} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  group: {
    width: "90%",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dangerText: {
    marginTop: 16,
    marginBottom: 8,
    color: "red",
    fontWeight: "bold",
  },
  space: {
    marginBottom: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Overlay background with opacity
  },
  modalContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
