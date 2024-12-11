import { StyleSheet } from "react-native";

const styles = StyleSheet.create
({
    container: 
    {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FEF9F2',
    },

    title: 
    {
        fontSize: 60,
        fontFamily: 'inter-bold',
        color: '#4CAE4F',
        marginBottom: 10,
    },

    formGroup: 
    {
        marginBottom: 20,
    },

    label: 
    {
        fontSize: 16,
        marginBottom: 8,
    },
    
    input: 
    {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 10,
    },
      
    button: 
    {
        backgroundColor: '#4CAE4F',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        borderRadius: 10,
        padding: 15,
        marginTop: 20,
    },
      
    disabledButton: 
    {
        backgroundColor: '#6c757d',
    },
      
    buttonText: 
    {
        color: '#fff',
        fontSize: 16,
    },
});

export default styles;