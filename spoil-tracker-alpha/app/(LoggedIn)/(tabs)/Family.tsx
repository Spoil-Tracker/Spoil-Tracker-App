import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { MaterialIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from 'react-native-paper'; // allows for dark mode, contributed by Kevin
import { doc, addDoc, getDoc, getDocs, deleteDoc, collection, arrayRemove, updateDoc, arrayUnion} from 'firebase/firestore';
import { auth, db } from '../../../services/firebaseConfig';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  createGroceryList,
  updateGroceryListIsFamily,
  updateGroceryListIsShared,
  fetchGroceryListByID,
  updateGroceryListName,
} from '@/components/GroceryList/GroceryListService';
import { getAccountByOwnerID, createAccount } from '@/components/Account/AccountService'
import { GroceryList, deleteGroceryList } from '@/components/GroceryList/GroceryListService';
import { createKitchenInvite } from '../../../services/inviteService';

export default function FamilyManagementScreen() {

  const { colors, dark } = useTheme(); // allows for dark mode, contributed by Kevin

  // ── Navigation & Auth ───────────────────────────────────────────────────────
  const router = useRouter();
  const currentUser = auth.currentUser;
  // ── Kitchen Items State & Handlers ─────────────────────────────────────────
  const [kitchenItems, setKitchenItems] = useState([
    { name: 'Fridge', count: 35 },
    { name: 'Pantry', count: 15 },
    { name: 'Freezer', count: 20 },
    { name: 'Beverage', count: 26 },
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCount, setNewItemCount] = useState('');
  const [isModalVisible, setModalVisible] = useState(false); // show add-kitchen modal
  // ── Shared Grocery Lists State & Handlers ───────────────────────────────────
  const [sharedListIds, setSharedListIds] = useState<string[]>([]);
  const [sharedLists, setSharedLists] = useState<GroceryList[]>([]);
  const [newSharedListName, setNewSharedListName] = useState('');
  const [isAddSharedModalVisible, setAddSharedModalVisible] = useState(false);
  // ── Name Editing State ───────────────────────────────────────────────
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  // ── Family Membership & Ownership ───────────────────────────────────────────
  const [familyDocId, setFamilyDocId] = useState('');
  const [familyName, setFamilyName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [familyMembers, setFamilyMembers] = useState<string[]>([]);
  const [ownerID, setOwnerID] = useState('');
  const [usernamesMap, setUsernamesMap] = useState<Record<string, string>>({});
  // ── Transfer Ownership UI ───────────────────────────────────────────────────
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [showTransferOptions, setShowTransferOptions] = useState(false);
  // ── Family Deletion Confirmation Modal ─────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  //Join Kitchen feature  
  const [enteredCode, setEnteredCode] = useState('');
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  const generateShareLink = async () => {
      try {
        const link = await createKitchenInvite(currentUser?.uid || '');
        setGeneratedLink(link);
        setShareModalVisible(true);
      } catch (error) {
        alert('Failed to generate link');
      }
    };
  
    const copyToClipboard = () => {
      Clipboard.setStringAsync(generatedLink);
      alert('Link copied to clipboard!');
    };
  
    const extractInviteCode = (input: string) => {
      const match = input.trim().match(/([a-zA-Z0-9_-]{10,})$/);
      return match ? match[1] : null;
    };
  
  const handleJoinKitchen = async () => {
    const code = extractInviteCode(enteredCode);
    const currentUser = auth.currentUser;
    if (!code || !currentUser) {
      alert('Invalid share code or user');
      return;
    }
  
    try {
      const inviteRef = doc(db, 'invites', code);
      const inviteSnap = await getDoc(inviteRef);
  
      if (!inviteSnap.exists()) {
        alert('Invite code not found or expired');
        return;
      }
  
      const inviteData = inviteSnap.data();
      const ownerID = inviteData.owner_id;
  
      // Reference to the family doc
      const familySnapshot = await getDocs(collection(db, 'family'));
      let foundFamilyDoc = null;
      let familyID = '';
  
      familySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.owner_id === ownerID) {
          foundFamilyDoc = docSnap;
          familyID = docSnap.id;
        }
      });
  
      if (!foundFamilyDoc) {
        // Create the family document
        const newFamilyRef = await addDoc(collection(db, 'family'), {
          owner_id: ownerID,
          family_name: familyName,
          members: [ownerID, currentUser.uid],
          shared_pantries: [],
          shared_lists: [],
          createdAt: new Date().toISOString(),
        });
      } else {
        // Add user to existing members array
        await updateDoc(doc(db, 'family', familyID), {
          members: arrayUnion(currentUser.uid),
        });
      }
  
      alert('Successfully joined the kitchen!');
    } catch (err) {
      console.error('Error joining kitchen:', err);
      alert('Failed to join the kitchen.');
    }
  };

  /** Edit Family Name */
  const handleSaveFamilyName = async () => {
    if (!familyDocId) return;
    try {
      await updateDoc(doc(db, 'family', familyDocId), {
        family_name: familyName.trim(),
      });
      Alert.alert('Saved', 'Family name updated.');
    } catch (err) {
      console.error('Error updating family name', err);
      Alert.alert('Error', 'Could not update name.');
    }
  };

  const addKitchenItem = () => {
    const count = parseInt(newItemCount, 10);
    if (!newItemName.trim() || isNaN(count)) return;
    setKitchenItems([...kitchenItems, { name: newItemName.trim(), count }]);
    setNewItemName('');
    setNewItemCount('');
    setModalVisible(false);
  };


    // **Fetch Family Data */
    useFocusEffect(
      useCallback(() => {
        let active = true;

        const fetchFamilyData = async () => {
          const currentUser = auth.currentUser;
          if (!currentUser) return;
    
          try {
            // 1) find the family doc this user belongs to
            const familyQuerySnapshot = await getDocs(collection(db, 'family'));
            const foundFamily = familyQuerySnapshot.docs.find(docSnap => {
              const data = docSnap.data() as {
                members: string[];
                owner_id: string;
                shared_lists?: string[];
                family_name?: string;
              };
              return Array.isArray(data.members) && data.members.includes(currentUser.uid);
            });
    
            if (!foundFamily || !active) {
              console.log('No family document found for current user');
              return;
            }
    
            const familyData = foundFamily.data() as {
              members: string[];
              owner_id: string;
              shared_lists?: string[];
              shared_pantries?: string[];
              family_name?: string;
            };
            
            if (!active) return;
            setFamilyMembers(familyData.members);
            setOwnerID(familyData.owner_id);
            setFamilyDocId(foundFamily.id);
            setSharedListIds(familyData.shared_lists ?? []);
            setFamilyName(familyData.family_name ?? '');
    
            //fetch each member’s display name
            const usernames: Record<string, string> = {};
            await Promise.all(
              familyData.members.map(async (uid: string) => {
                const snap = await getDoc(doc(db, 'users', uid));
                if (!snap.exists()) {
                  usernames[uid] = 'Unknown';
                } else {
                  const d = snap.data();
                  usernames[uid] = (d.name as string) || (d.username as string) || 'Unknown';
                }
              })
            );
            if (active) setUsernamesMap(usernames);
          } catch (error) {
            console.error('Error fetching family data:', error);
          }
        };
    
        fetchFamilyData();

        return () => { active = false; }
      }, [auth.currentUser?.uid]) 
    );

    async function ensureAccount(ownerID: string) {
      let acct = null;
      try {
        acct = await getAccountByOwnerID(ownerID);
      } catch  (err) {}
  
      if (!acct) {
        const userSnap = await getDoc(doc(db, 'users', ownerID));
        const accountName = userSnap.exists()
          ? (userSnap.data().username as string)
          : 'Unknown';
        // create the Account with the real username
        await createAccount(ownerID, accountName, 'user');
      }
  
      return acct!;
    }

    // Create-List function
    const handleCreateSharedList = async () => {
      if (!ownerID || !familyDocId) return alert ("Can't create a shared list until a family owner is known.!");

      const name = newSharedListName.trim();
      if (!name) {
        alert("Please enter a list name");
        return;
      }
    
      try {
        //Load Account recored by owner_id
        const account = await ensureAccount(ownerID);

        // create the list under that account
        const created = await createGroceryList(account.id, name);
    
        // mark it as a family/shared list
        await updateGroceryListIsFamily(created.id, true);
        await updateGroceryListIsShared(created.id, true);

        // 5) push it into your family.shared_lists array
        const familyRef = doc(db, 'family', familyDocId)
        await updateDoc(familyRef, { shared_lists: arrayUnion(created.id) })
    
        // add to local UI
        setSharedLists(prev => [
          ...prev,
          {
            ...created,
            account_id: account.id,
            grocery_list_items: [],
            isFamily: true,
            isShared: true,
            isComplete: false,
          },
        ]);
    
        setNewSharedListName('');
        setAddSharedModalVisible(false);
      } catch (err) {
        console.error(err);
        alert('Failed to create shared list');
      }
    };

    // Get *all* shared lists globally then filter to those owned by your family
    useEffect(() => {
      if (!familyDocId) return;
      if (sharedListIds.length === 0) {
        setSharedLists([]);
        return;
      }
  
      (async () => {
        try {
          // 1) fetch all lists by ID
          const results = await Promise.all(
            sharedListIds.map(id => fetchGroceryListByID(id))
          );
  
          // 2) split out which came back null
          const deletedIds = sharedListIds.filter((id, i) => results[i] === null);
  
          // 3) if any were deleted server‐side, remove them from your family.shared_lists
          if (deletedIds.length) {
            const familyRef = doc(db, 'family', familyDocId);
            for (const id of deletedIds) {
              await updateDoc(familyRef, { shared_lists: arrayRemove(id) });
            }
            // 4) prune them from your local state
            setSharedListIds(prev => prev.filter(id => !deletedIds.includes(id)));
          }
  
          // 5) keep only the non‐null lists for your UI
          setSharedLists(
            results.filter((l): l is GroceryList => l !== null)
          );
        } catch (err) {
          console.error('Failed to fetch/clean shared lists:', err);
        }
      })();
    }, [sharedListIds, familyDocId]);


    // open shared list modal
    const openSharedList = async (list: GroceryList) => {
      const user = auth.currentUser;
      if (!user) {
        alert("You must be logged in to open a list.");
        return;
      }
      const uid = user.uid ;
      try {
        await getAccountByOwnerID(uid);
      } catch {
        const name = usernamesMap[uid] || 'Unknown';
        await createAccount(uid, name, 'user');
      }
      router.push({
        pathname: '/ListUI',
        params: { id: list.id },
      });
    };

    // Delete entire family (owner only)
    const handleDeleteFamily = async () => {
      if (!familyDocId) return;

      // 1) Delete each shared list in Firestore
      try {
        await Promise.all(sharedListIds.map(id => deleteGroceryList(id)));
      } catch (err) {
        console.error('Error deleting shared grocery lists:', err);
        alert('Failed to delete some shared lists.');
        return;
      }

      // 2) Delete the family document itself
      try {
        await deleteDoc(doc(db, 'family', familyDocId));
      } catch (err) {
        console.error('Error deleting family document:', err);
        alert('Failed to delete family.');
        return;
      }

      // 3) Clear local state
      setFamilyMembers([]);
      setOwnerID('');
      setFamilyDocId('');
      setSharedListIds([]);
      setSharedLists([]);

      alert('Family and all its shared lists have been deleted.');
    };


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

    //**Change List Name */
    const handleRenameSharedList = async (idx: number) => {
      const trimmed = editingName.trim();
      if (!trimmed) {
        setEditingIndex(null);
        return;
      }
      try {
        // call your service
        const updated = await updateGroceryListName(sharedLists[idx].id, trimmed);
        // update local sharedLists array
        setSharedLists(prev => {
          const copy = [...prev];
          copy[idx] = {
            ...copy[idx],
            grocerylist_name: updated.grocerylist_name
          };
          return copy;
        });
      } catch (err) {
        console.error('Failed to rename shared list', err);
        alert('Could not rename list');
      } finally {
        setEditingIndex(null);
        setEditingName('');
      }
    };




  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header Section */}
      <Text style={styles.header}>Family Management</Text>
      <Text style={styles.greeting}>Hello, {usernamesMap[currentUser?.uid || ''] || 'User'}!</Text>

      <View style={styles.mainContent}>
        {/* Family Section */}
      {familyMembers.length > 0 ? (  
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Name</Text>
            {currentUser?.uid === ownerID
              ? (
                // -- owner sees editable input + icon
                <View style={[{flexDirection: 'row'}, {alignItems: 'center'}]}>
                  {isEditingName
                    ? (
                      <TextInput
                        style={[styles.detail, styles.input]}
                        value={familyName}
                        onChangeText={setFamilyName}
                        autoFocus
                      />
                    )
                    : (
                      <Text style={styles.detail}>{familyName || '—'}</Text>
                    )
                  }
                  <TouchableOpacity
                    onPress={async () => {
                      if (isEditingName) {
                        await handleSaveFamilyName();
                        setIsEditingName(false);
                      } else {
                        setIsEditingName(true);
                      }
                    }}
                    style={styles.iconButton}
                  >
                    <Ionicons
                      name={isEditingName ? 'checkmark-circle' : 'pencil'}
                      size={20}
                      color="#4CAF50"
                      
                    />
                  </TouchableOpacity>
                </View>
              )
              : (
                // -- non-owners just see the name
                <Text style={styles.detail}>{familyName || '—'}</Text>
              )
            }
            <Text style={styles.label}>Shared Pantries:</Text>
            <Text style={styles.detail}>{kitchenItems.length}</Text>
            <Text style={styles.label}>Shared Lists:</Text>
            <Text style={styles.detail}>{sharedLists.length}</Text>

          </View>

          {currentUser?.uid === ownerID && (
              <TouchableOpacity style={styles.button} onPress={handleSaveFamilyName}>
                <Text style={styles.buttonText}>Save Name</Text>
              </TouchableOpacity>
          )}  

          {currentUser?.uid === ownerID ? (
            <TouchableOpacity
              style={[styles.disconnectButton, { backgroundColor: 'red' }]}
              onPress={() => setShowDeleteModal(true)}
            >
              <Text style={styles.buttonText}>DELETE FAMILY</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.buttonText}>DISCONNECT</Text>
            </TouchableOpacity>
          )}
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
                    style={[styles.transferButton, { marginTop: 10 }]}
                    onPress={handleTransferOwnership}
                  >
                    <Text style={styles.buttonText}>Confirm Transfer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>

      ) : (
      <View style = {styles.section}>
        <Text style={styles.sectionTitle}> Join a Kitchen</Text>
        <Text style={styles.detail}>
          Share your kitchen with friends and family to manage the kitchen together.
        </Text>
        <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#2196F3' }, {marginTop: 10}]} onPress={generateShareLink}>
          <Text style={styles.buttonText}>Share Kitchen</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>Have a Share Code?</Text>
          <TextInput
            placeholder="Enter share code..."
            value={enteredCode}
            onChangeText={setEnteredCode}
            style={[
              styles.detail, 
              { borderWidth: 1, borderColor: 'black' }
            ]}
          />
          <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#4CAE4F'}, {marginTop: 10}]} onPress={handleJoinKitchen}>
            <Text style={styles.transferButtonText}>Join Kitchen</Text>
          </TouchableOpacity>          
        </View>  
      </View>  
      )}
<Modal
            animationType="slide"
            transparent={true}
            visible={isShareModalVisible}
            onRequestClose={() => setShareModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Share Kitchen</Text>
                <Text style={styles.detail}>
                  Share this link with your family members.
                </Text>
                <TextInput
                  style={[
                    styles.linkBox, 
                    {
                      color: dark ? '#FFF' : '#000',
                      backgroundColor: dark ? '#222' : '#f5f5f5',
                      borderColor: dark ? '#444' : '#ccc',
                    },
                  ]}
                  value={generatedLink}
                  editable={false}
                />
                <TouchableOpacity
                  style={styles.transferButton}
                  onPress={copyToClipboard}
                >
                  <Text style={styles.transferButtonText}>Copy Link</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShareModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


        {/* Delete-Family Confirmation Modal */}
      <Modal
        transparent
        visible={showDeleteModal}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Are you sure you want to delete this family?
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowDeleteModal(false)}
                style={[styles.modalButton, { backgroundColor: '#2196F3' } ]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteFamily}
                style={[styles.modalButton, { backgroundColor: '#FF5252' }]}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF5252' }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#2196F3' }]} onPress={addKitchenItem}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Grocery List Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Shared Grocery Lists</Text>
            <TouchableOpacity
              disabled={!ownerID}
              style={[
                styles.addButtonIcon,
                !ownerID && { opacity: 0.5 }
              ]}
              onPress={() => setAddSharedModalVisible(true)}
            >
              <AntDesign name="pluscircleo" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>

          {sharedLists.length > 0 ? (
            <View style={styles.groceryList}>
              {sharedLists.map((list, idx) => (
                <View key={list.id} style={styles.groceryItem}>

                  {/* Name or inline edit input */}
                  {editingIndex === idx ? (
                    <TextInput
                      style={[styles.groceryText, styles.editInput]}
                      value={editingName}
                      onChangeText={setEditingName}
                      onSubmitEditing={() => handleRenameSharedList(idx)}
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity onPress={() => openSharedList(list)}>
                      <Text style={styles.groceryText}>
                        {list.grocerylist_name}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Action buttons aligned right */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                    {/* Complete icon */}
                    <View style={{ marginLeft: 'auto', padding: 4 }}>
                      {list.isComplete
                        ? <AntDesign name="checkcircle"   size={20} color="#4CAF50" />
                        : <AntDesign name="checkcircleo"  size={20} color="#ccc" />}
                    </View>

                    {/* if not editing, show pencil */}
                    {editingIndex !== idx ? (
                      <TouchableOpacity
                        style={{ marginLeft: 12, padding: 4 }}
                        onPress={() => {
                          setEditingIndex(idx);
                          setEditingName(list.grocerylist_name);
                        }}
                      >
                        <AntDesign name="edit" size={20} color="black" />
                      </TouchableOpacity>
                    ) : (
                      /* if editing, show check to confirm rename */
                      <TouchableOpacity
                        style={{ marginLeft: 12, padding: 4 }}
                        onPress={() => handleRenameSharedList(idx)}
                      >
                        <AntDesign name="check" size={20} color="#4CAE4F" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontStyle: 'italic', marginTop: 10 }}>
              No shared lists yet.
            </Text>
          )}
        </View>

        <Modal 
          visible={isAddSharedModalVisible}
          transparent animationType="slide"
          onRequestClose={() => setAddSharedModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>New Shared List</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter list name"
                value={newSharedListName}
                onChangeText={setNewSharedListName}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#FF5252' }]} onPress={() => setAddSharedModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#2196F3' }]} onPress={handleCreateSharedList}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* List‑detail modal */}
        
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
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
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
    alignItems: 'center',
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
    width: 500,
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
    borderBottomWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
    width: '100%',
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
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
  editInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#4CAE4F',
    marginRight: 8,
    paddingVertical: 2,
  },
  groceryText: {
    flex: 1,
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
  itemsContainer: {
    flex: 1,
    width: '100%',
  },
  itemRowFull: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    width: '100%',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  itemText: {
    fontSize: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemDetailsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  quantityInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 6,
    marginRight: 8,
    textAlign: 'center',
    height: 32,
  },
  measureInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 6,
    height: 32,
  },
  closeButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  linkBox: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },

});