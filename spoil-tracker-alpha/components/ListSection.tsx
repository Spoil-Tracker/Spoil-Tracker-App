import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ListButton from './ListButton';

type ListSectionProps = {
  title: string;
  lists: { id: string; name: string }[];
};

const ListSection = ({ title, lists }: ListSectionProps) => (
  <View style={styles.listSection}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ScrollView style={styles.scrollView}>
      {lists.map((list) => (
        <ListButton key={list.id} list={list} />
      ))}
    </ScrollView>
  </View>
);

export default ListSection;

const styles = StyleSheet.create({
    listSection: {
        width: 350,
        margin: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        height: 250,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 10,
        fontFamily: 'inter-bold'
    },
    scrollView: {
        flex: 1,
    },
})
