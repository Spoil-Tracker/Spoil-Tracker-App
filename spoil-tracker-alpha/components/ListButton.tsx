import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

type ListButtonProps = {
  list: { id: string; name: string };
};

const ListButton = ({ list }: ListButtonProps) => (
  <Link href={`../ListUI?id=${list.id}`} style={styles.button}>
    <Text style={styles.buttonText}>{list.name}</Text>
  </Link>
);

export default ListButton;

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#94D3FF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        marginVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#2196F3',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
})
