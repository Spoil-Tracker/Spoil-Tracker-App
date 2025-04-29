import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Modal,
  Pressable,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { deletePantry } from './PantryService'; // function to delete pantries from the server

// defines pantry object
type Pantry = {
  id: string;
  name: string;
  pantry_name: string;
  description: string;
};

// defines pantry prop
type ListSectionProps = {
  title: string;
  lists: Pantry[];
  fetchLists: () => void;
};

// function to display a list of pantries to the user
export default function ListSection({
  title,
  lists,
  fetchLists,
}: ListSectionProps) {
  const { width, height } = useWindowDimensions();
  // 75% width, 29% height
  const sectionWidth = width * 0.75;
  const sectionHeight = height * 0.29;

  return (
    <View
      style={[styles.section, { width: sectionWidth, height: sectionHeight }]}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {lists.map((p) => (
          <ListButton key={p.id} pantry={p} fetchLists={fetchLists} />
        ))}
      </ScrollView>
    </View>
  );
}

type ListButtonProps = {
  pantry: Pantry;
  fetchLists: () => void;
};

// creates the functions within listbutton allowing for dropdowns and deletion
function ListButton({ pantry, fetchLists }: ListButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const toggleDropdown = () => {
    Animated.timing(dropdownHeight, {
      toValue: dropdownOpen ? 0 : 140,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setDropdownOpen(!dropdownOpen);
  };

  // handles the ability to delete a pantry
  const handleDelete = async () => {
    try {
      await deletePantry(pantry.id);
      fetchLists();
    } catch {
      Alert.alert('Error', 'Could not delete pantry.');
    }
  };

  // displays the pantry section to the user, allowing them to choose a pantry to add items to
  return (
    <View style={styles.itemWrapper}>
      {/* Button */}
      <TouchableOpacity onPress={toggleDropdown} style={styles.button}>
        <MaterialCommunityIcons name="fridge" size={48} color="#333" />
        <Text style={styles.buttonText}>{pantry.name}</Text>
      </TouchableOpacity>

      {/* Animated dropdown */}
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <View style={styles.dropdownInner}>
          <View style={styles.actions}>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/PantryUI',
                  params: { pantryId: pantry.id },
                })
              }
              style={[
                styles.viewButton,
                {
                  backgroundColor: '#94D3FF',
                  borderColor: '#2196F3',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Text style={styles.actionText}>View</Text>
            </Pressable>
            <Pressable
              style={[styles.viewButton, styles.deleteBtn]}
              onPress={() => setConfirmOpen(true)}
            >
              <Text style={styles.actionText}>Delete</Text>
            </Pressable>
          </View>
          <View style={styles.info}>
            <Text style={[styles.infoText, { fontWeight: 'bold' }]}>
              Description:
            </Text>
            <Text style={styles.infoText}>{pantry.description}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Confirm Delete Modal */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete "{pantry.name}"?</Text>
            <View style={styles.modalBtns}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={() => {
                  setConfirmOpen(false);
                  setDropdownOpen(false);
                  dropdownHeight.setValue(0);
                  handleDelete();
                }}
              >
                <Text style={styles.modalBtnText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#e2e6ea',
    borderRadius: 8,
    padding: 16,
    alignSelf: 'center',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 12,
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemWrapper: {
    width: '30%',
    alignItems: 'center',
    margin: 8,
  },
  button: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    borderWidth: 2,
    borderColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    overflow: 'hidden',
    width: '100%',
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  dropdownInner: {
    padding: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  viewButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  deleteBtn: {
    backgroundColor: '#d9534f',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
  },
  info: {
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
  },
  confirmBtn: {
    backgroundColor: '#d9534f',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
