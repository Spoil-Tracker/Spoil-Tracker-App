import { StyleSheet } from "react-native";

const styles = StyleSheet.create
({
    container: 
    {
        flex: 1,
        padding: 20,
        backgroundColor: '#FEF9F2',
    },

    title: 
    {
        fontSize: 60,
        fontFamily: 'inter-bold',
        color: '#4CAE4F',
        textAlign: 'center',
        marginBottom: 30,
    },

    contentContainer:
    {
        flexDirection: 'row',
        flex: 1,
    },

    leftSection:
    {
        flex: 1,
        alignItems: 'flex-start',
        paddingLeft: 10,
    },

    rightSection:
    {
        flex: 1,
        alignItems: 'flex-start',
        paddingLeft: 20,
    },

    divider:
    {
        width: 2,
        backgroundColor: '#4CAE4F',
        marginHorizontal: 15,
        height: '100%',
    },

    formGroup: 
    {
        marginBottom: 15,
        width: '90%',
    },

    label: 
    {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    
    input: 
    {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        width: '100%',
        marginBottom: 10,
    },
      
    button: 
    {
        backgroundColor: '#4CAE4F',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
    },
      
    disabledButton: 
    {
        backgroundColor: '#6c757d',
    },
      
    buttonText: 
    {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default styles;