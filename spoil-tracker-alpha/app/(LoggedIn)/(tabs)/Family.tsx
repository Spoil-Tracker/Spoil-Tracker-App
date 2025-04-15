import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import { doc, getDoc, getDocs, collection, arrayRemove, updateDoc, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { auth, db } from '../../../services/firebaseConfig';
import { useFocusEffect } from 'expo-router';

export default function FamilyManagementScreen() {
    const [kitchenItems, setKitchenItems] = useState([
        { name: 'Fridge', count: 35 },
        { name: 'Pantry', count: 15 },
        { name: 'Freezer', count: 20 },
        { name: 'Beverage', count: 26 },
      ]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCount, setNewItemCount] = useState('');
    
    const addKitchenItem = () => {
        if (newItemName.trim() && !isNaN(parseInt(newItemCount, 10))) {
          setKitchenItems([...kitchenItems, { name: newItemName, count: parseInt(newItemCount, 10) }]);
          setNewItemName('');
          setNewItemCount('');
          setModalVisible(false);
        }
    };
      
    const [groceryLists, setGroceryLists] = useState(['Grocery List 1', 'Grocery List 2']);

    const [familyMembers, setFamilyMembers] = useState<string[]>([]);
    const [ownerID, setOwnerID] = useState('');
    const [usernamesMap, setUsernamesMap] = useState<{ [key: string]: string }>({});

    const [isGroceryModalVisible, setGroceryModalVisible] = useState(false);
    const [newGroceryName, setNewGroceryName] = useState('');

    const addGroceryList = () => {
        if (newGroceryName.trim()) {
            setGroceryLists([...groceryLists, newGroceryName]);
            setNewGroceryName('');
            setGroceryModalVisible(false);
        }
    };

    const currentUser = auth.currentUser;
    const [selectedNewOwner, setSelectedNewOwner] = useState('');
    const [showTransferOptions, setShowTransferOptions] = useState(false); 
  
    // **Fetch Family Data */
    useFocusEffect(
      useCallback(() => {
        const fetchFamilyData = async () => {
          const currentUser = auth.currentUser;
          if (!currentUser) return;
      
          try {
            // Search for a family doc where this user is a member
            const familyQuerySnapshot = await getDocs(collection(db, 'family'));
            let foundFamily: QueryDocumentSnapshot<DocumentData> | undefined = familyQuerySnapshot.docs.find(docSnap => {
              const data = docSnap.data() as { members: string[]; owner_id: string };
              return data.members?.includes(currentUser.uid);
            });
      
            if (!foundFamily) {
              console.log('No family document found for current user');
              return;
            }
      
            const data = foundFamily.data() as { members: string[]; owner_id: string };
            const members: string[] = data.members;
            const owner: string = data.owner_id;
      
            setFamilyMembers(members);
            setOwnerID(owner);
      
            // Fetch usernames from Firestore
            const usernames: { [key: string]: string } = {};
            await Promise.all(
              members.map(async (uid) => {
                const userSnap = await getDoc(doc(db, 'users', uid));
                usernames[uid] = userSnap.exists() ? userSnap.data().username : 'Unknown';
              })
            );
      
            setUsernamesMap(usernames);
          } catch (error) {
            console.error('Error fetching family data:', error);
          }
        };
    
        fetchFamilyData();
      }, [])
    );

    // **Disconnect from family */
    const handleDisconnect = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
    
      try {
        const familySnapshot = await getDocs(collection(db, 'family'));
        let targetDoc = null;
    
        familySnapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.members?.includes(currentUser.uid)) {
            targetDoc = docSnap.ref;
          }
        });
    
        if (!targetDoc) {
          alert('No family document found.');
          return;
        }
    
        // Remove user from members array
        await updateDoc(targetDoc, {
          members: arrayRemove(currentUser.uid),
        });
    
        // Clear state after removal
        setFamilyMembers([]);
        setOwnerID('');
        setUsernamesMap({});
        
    
        alert('You have disconnected from the family.');
      } catch (error) {
        console.error('Error disconnecting from family:', error);
        alert('Failed to disconnect.');
      }
    };
    
    //** Transfer Ownership */
    const handleTransferOwnership = async () => {
      if (!selectedNewOwner || selectedNewOwner === ownerID) {
        alert("Please select a valid member to transfer ownership.");
        return;
      }
    
      try {
        const familySnapshot = await getDocs(collection(db, 'family'));
        const foundFamily = familySnapshot.docs.find(docSnap => {
          const data = docSnap.data() as { members: string[]; owner_id: string };
          return data.members?.includes(currentUser?.uid || '');
        });
    
        if (!foundFamily) {
          alert("No family found.");
          return;
        }
    
        const familyRef = doc(db, 'family', foundFamily.id);
        await updateDoc(familyRef, { owner_id: selectedNewOwner });
        setOwnerID(selectedNewOwner);
        setSelectedNewOwner('');
        alert("Ownership transferred!");
      } catch (error) {
        console.error("Error transferring ownership:", error);
        alert("Failed to transfer ownership.");
      }
    };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <Text style={styles.header}>Family Management</Text>
      <Text style={styles.greeting}>Hello, {usernamesMap[currentUser?.uid || ''] || 'User'}!</Text>

      <View style={styles.mainContent}>
        {/* Family Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.detail}>Best Family Ever</Text>
            <Text style={styles.label}>Shared Pantries:</Text>
            <Text style={styles.detail}>{kitchenItems.length}</Text>
            <Text style={styles.label}>Shared Lists:</Text>
            <Text style={styles.detail}>{groceryLists.length}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
            <Text style={styles.buttonText}>DISCONNECT</Text>
          </TouchableOpacity>
          {currentUser?.uid === ownerID && (
            <>
              <TouchableOpacity
                style={styles.transferButton}
                onPress={() => setShowTransferOptions(!showTransferOptions)}
              >
                <Text style={styles.transferButtonText}>TRANSFER OWNERSHIP</Text>
              </TouchableOpacity>

              {showTransferOptions && (
                <View style={styles.transferList}>
                  {familyMembers
                    .filter(uid => uid !== ownerID)
                    .map(uid => (
                      <TouchableOpacity
                        key={uid}
                        style={[
                          styles.transferOption,
                          selectedNewOwner === uid && styles.selectedTransferOption
                        ]}
                        onPress={() => setSelectedNewOwner(uid)}
                      >
                        <Text>{usernamesMap[uid]}</Text>
                      </TouchableOpacity>
                    ))}

                  <TouchableOpacity
                    style={[styles.button, { marginTop: 10 }]}
                    onPress={handleTransferOwnership}
                  >
                    <Text style={styles.buttonText}>Confirm Transfer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

        {/* Family Members Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Members</Text>
          {familyMembers.length > 0 ? (
            <View style={styles.memberGrid}>
              {familyMembers.map((uid, index) => (
                <Text
                  key={index}
                  style={[
                    styles.memberBox,
                    uid === ownerID ? styles.headMember : null
                  ]}
                >
                  {usernamesMap[uid] || 'Unknown'} {uid === ownerID ? '[HEAD]' : ''}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ fontStyle: 'italic', marginTop: 10 }}>
              You are not part of any family yet.
            </Text>
          )}

        </View>

        {/* Kitchen Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kitchen</Text>
          <View style={styles.kitchenGrid}>
            {kitchenItems.map((item, index) => (
              <View key={index} style={styles.kitchenItem}>
                <MaterialIcons name="kitchen" size={30} />
                <Text>{item.name} ({item.count})</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addButtonIcon} onPress={() => setModalVisible(true)}>
            <AntDesign name="pluscircleo" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Modal for Adding Item */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Kitchen Item</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter item count"
              keyboardType="numeric"
              value={newItemCount}
              onChangeText={setNewItemCount}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={addKitchenItem}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* Grocery List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grocery Lists</Text>
          <View style={styles.groceryList}>
            {groceryLists.map((list, index) => (
              <View key={index} style={styles.groceryItem}>
                <Text style={styles.groceryText}>{list}</Text>
                <TouchableOpacity>
                  <Feather name="edit" size={20} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addButtonIcon} onPress={() => setGroceryModalVisible(true)}>
            <AntDesign name="pluscircleo" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Modal visible={isGroceryModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Grocery List</Text>
                        <TextInput style={styles.input} placeholder="Enter list name" value={newGroceryName} onChangeText={setNewGroceryName} />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setGroceryModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addButton} onPress={addGroceryList}>
                                <Text style={styles.buttonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FEF9F2',
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAE4F',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 40,
  },
  mainContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  section: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f9f9f9',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#3568A6',
  },
  detail: {
    fontSize: 18,
  },
  button: {
    padding: 10,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  disconnectButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '90%',
  },
  memberBox: {
    backgroundColor: '#D8BFD8',
    padding: 15,
    borderRadius: 8,
    margin: 5,
  },
  headMember: {
    backgroundColor: '#20B2AA',
    fontWeight: 'bold',
  },
  addButtonIcon: {
    fontWeight: 'bold',
    margin: 10,
  },
  kitchenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '90%',
  },
  kitchenItem: {
    backgroundColor: '#FFE4C4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF6666',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginLeft: 5,
  },
  groceryList: {
    width: '90%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groceryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#5A7898',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  groceryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transferOption: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedTransferOption: {
    backgroundColor: '#D0F0C0',
  },
  transferButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  transferButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  transferList: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
});

