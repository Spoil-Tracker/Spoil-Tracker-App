import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useWindowDimensions, Animated, View, Text, StyleSheet, FlatList, SafeAreaView, Pressable, Image, Dimensions, TextInput, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons'; // For the plus icon



export default function ProductPage()  {
    const { height, width } = useWindowDimensions();

    const pageWidth = width * 0.24;
    const MINWIDTH = 300;

    return (
        <View style={{backgroundColor:'black'}}>
        <ScrollView contentContainerStyle={[styles.container,
            { width: pageWidth, minWidth: MINWIDTH, height: height - 64 }
        ]}>
            <View style={[styles.box,
                {height: 100, justifyContent: 'center', alignItems: 'center' }
            ]}>
                <Text style={[styles.Title, styles.productTitle]}> [Title]</Text>
            </View>
            <View style={[styles.box,
                { height: pageWidth, minHeight: MINWIDTH, minWidth: MINWIDTH, width: pageWidth } ]}>
                <Image>

                </Image>
            </View>
            <View
                style={[
                    styles.box,
                    { height: 150, width: pageWidth, minWidth: MINWIDTH }
                ]}
                >
                <ScrollView showsHorizontalScrollIndicator={false}>
                    <Text style={styles.descriptionText}>
                    AAAAA AAAAAAAAAAAAAAA AAAAAAAAAAAAAAA AAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAA
                    AAAAA AAAAAAAAAAAAAAA AAAAAAAAAAAAAAA AAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAA
                    AAAAA AAAAAAAAAAAAAAA AAAAAAAAAAAAAAA AAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAA
                    AAAAA AAAAAAAAAAAAAAA AAAAAAAAAAAAAAA AAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAA
                    AAAAA AAAAAAAAAAAAAAA AAAAAAAAAAAAAAA AAAAAAAA AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA AAAAAAAAA
                    </Text>

                </ScrollView>
            </View>
            <View style={[
                {flexDirection: 'row'}
            ]}>
                <View style={[ styles.box,
                    {width: pageWidth / 2, minWidth: MINWIDTH / 2, height: 300, flexDirection: 'row', paddingVertical: 5}
                ]}>
                    <View style= {[
                        {width: pageWidth / 4, minWidth: MINWIDTH/4}
                    ]}>
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Eaten:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Own: 
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            E: 
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                    </View>
                    <View style={[
                        {height: 300, width: 1, backgroundColor: 'black'}
                    ]}>

                    </View>
                    <View style= {[
                        {width: pageWidth / 4, minWidth: MINWIDTH/4}
                    ]}>
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[styles.Title,
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                    </View>
                </View>
                <View style={{justifyContent: 'center'}}>
                    <Pressable style={[styles.sidebarButton, styles.listButton, {width: pageWidth / 2, minWidth: MINWIDTH / 2}]} onPress={() => alert('click')}>
                        <Text style={[{fontFamily: 'inter-bold', color: '#007bff', textAlign: 'center'}]}>Add to a List</Text>
                    </Pressable>
                    <Pressable style={[styles.sidebarButton, styles.pantryButton, {width: pageWidth / 2, minWidth: MINWIDTH / 2}]} onPress={() => alert('click')}>
                        <Text style={[{fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center'}]}>Add to a Pantry</Text>
                    </Pressable>
                    <Pressable style={[styles.sidebarButton, styles.pantryButton, {width: pageWidth / 2, minWidth: MINWIDTH / 2}]} onPress={() => alert('click')}>
                        <Text style={[{fontFamily: 'inter-bold', color: '#39913b', textAlign: 'center'}]}>Add to Intake</Text>
                    </Pressable>
                </View>
            </View>
            <View style={[styles.box,
                {height: 70, justifyContent: 'center', alignItems: 'center' }
            ]}>
                <Text style={[styles.Title, styles.nutritionTitle]}> Nutrition Facts: *BASED ON AVG*</Text>
            </View>
            <View style={[ styles.box,
                    {width: pageWidth, minWidth: MINWIDTH, height: 400, flexDirection: 'row', paddingVertical: 5}
                ]}>
                    <View style= {[
                        {width: pageWidth / 2, minWidth: MINWIDTH/2}
                    ]}>
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Total Fat:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Saturated Fat:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Trans Fat:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Carbohydrates:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Fiber:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Total Sugars:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Added Sugars:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Protein:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Cholesterol:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Sodium:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Vitamin D:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Calcium:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Iron:
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            Potassium:
                        </Text>
                    </View>
                    <View style={[
                        {height: 400, width: 1, backgroundColor: 'black'}
                    ]}>

                    </View>
                    <View style= {[
                        {width: pageWidth / 2, minWidth: MINWIDTH/ 2}
                    ]}>
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>
                        <View
                        style={{
                            borderBottomColor: 'black',
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                        />
                        <Text style={[
                            {fontSize: 20, textAlign: 'center'}
                        ]}>
                            0
                        </Text>

                    </View>
                </View>
        </ScrollView>

        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        alignSelf:'center'
    },
    box: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10
    },
    Title: {
        fontFamily: 'inter-bold',
    },
    productTitle: {
        fontSize: 45,
        textAlign: 'center',
    },
    descriptionText: {
        fontSize: 20
    },
    sidebarButton: {
         // Blue color for Mark as Done
        paddingVertical: 25,
        paddingHorizontal: 0,
        borderRadius: 15,
        borderStyle: 'solid',
        borderWidth: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10, // Add space between buttons
        height: 50,
        marginLeft: 5
    },
    listButton: {
        borderColor: '#007bff',
        backgroundColor: '#e2e6ea',
    },
    pantryButton: {
        borderColor: '#39913b',
        backgroundColor: '#e0e9e0'
    },
    nutritionTitle: {
        fontSize: 30,
        textAlign: 'center',
    },


});