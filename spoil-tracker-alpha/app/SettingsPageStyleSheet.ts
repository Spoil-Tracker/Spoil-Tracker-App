import { StyleSheet } from "react-native";

const styles = StyleSheet.create
({
    container: 
    {
        flex: 1,
        padding: 20,
    },

    lightContainer:
    {
        backgroundColor: '#FEF9F2',
    },

    darkContainer:
    {
        backgroundColor: '#121212',
    },

    title: 
    {
        fontSize: 60,
        fontFamily: 'inter-bold',
        textAlign: 'center',
        marginBottom: 30,
    },

    lightText: 
    {
        color: '#000',
    },

    darkText: 
    {
        color: '#FFF',
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
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        width: '100%',
    },

    lightInput: 
    {
        borderColor: '#ccc',
        color: '#000',
        backgroundColor: '#FFF',
    },

    darkInput: 
    {
        borderColor: '#444',
        color: '#FFF',
        backgroundColor: '#222',
    },
      
    button: 
    {
        backgroundColor: '#4CAE4F',
        borderRadius: 5,
        padding: 10,
        marginTop: 10,
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
        fontWeight: 'bold',
    },

    notificationOption: 
    {
        padding: 10,
        marginVertical: 5,
        borderWidth: 1,
        borderColor: '#4CAE4F',
        borderRadius: 5,
        alignItems: 'center',
        width: '90%',
    },
      
    selectedOption: 
    {
        backgroundColor: '#4CAE4F',
    },
      
    notificationText: 
    {
        fontSize: 16,
        color: '#000',
    },

    phoneInput:
    {
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        width: '100%',
    },

    lightPhoneInput: 
    {
        borderColor: '#ccc',
        color: '#000',
        backgroundColor: '#FFF',
    },

    darkPhoneInput: 
    {
        borderColor: '#444',
        color: '#FFF',
        backgroundColor: '#222',
    },

    phoneSaveButton:
    {
        backgroundColor: '#4CAE4F',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },

    phoneSaveButtonText:
    {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
      
});

export default styles;