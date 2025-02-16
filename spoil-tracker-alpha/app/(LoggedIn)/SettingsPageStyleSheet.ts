import { StyleSheet } from "react-native";

const styles = StyleSheet.create
({
    // Main container for the Settings screen.
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

    // Title section with an icon.
    titleContainer:
    {
        flexDirection: 'row', // Aligns the icon and text.
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30, // Adds spacing below the title.
    },

    title: 
    {
        fontSize: 60,
        fontFamily: 'inter-bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#4CAE4F',
    },

    icon:
    {
        width: 50,
        height: 50,
        marginRight: 10, // Adds spacing between the icon and title.
    },

    lightText: 
    {
        color: '#000',
    },

    darkText: 
    {
        color: '#FFF',
    },

    // Main content container, divided into two sections.
    contentContainer:
    {
        flexDirection: 'row', // Layout split between left and right sections.
        flex: 1, // Allows content to fill available space.
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
        height: '100%', // Extends the full height of the container, should users zoom out.
    },

    // Container for input fields and buttons.
    formGroup: 
    {
        marginBottom: 15,
        width: '90%',
    },

    // Label text for input fields.
    label: 
    {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 5,
    },
    
    // General input field styling.
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
    
    // General button styling.
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
        backgroundColor: '#6c757d', // Gray out the button.
    },
      
    buttonText: 
    {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Notification settings container.
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

    phoneVerifiedText:
    {
        color: '#4CAE4F',
        fontSize: 16,
        marginTop: 10,
        textAlign: 'center',
    },
      
});

export default styles;