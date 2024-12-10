import { StyleSheet } from "react-native";

const styles = StyleSheet.create
({
    container: 
    {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },

    title: 
    {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
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
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
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