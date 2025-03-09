import { Appearance, StyleSheet } from 'react-native';

const scheme = Appearance.getColorScheme();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  lightContainer: {
    backgroundColor: '#FEF9F2',
  },

  darkContainer: {
    backgroundColor: '#26272B',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },

  title: {
    fontSize: 60,
    fontFamily: 'inter-bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#4CAE4F',
  },

  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },

  lightText: {
    color: '#000',
  },

  darkText: {
    color: '#FFF',
  },

  contentContainer: {
    flexDirection: 'row',
    flex: 1,
  },

  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 10,
  },

  rightSection: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 20,
  },

  divider: {
    width: 2,
    backgroundColor: '#4CAE4F',
    marginHorizontal: 15,
    alignSelf: 'stretch',
  },

  formGroup: {
    marginBottom: 15,
    width: '90%',
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },

  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
  },

  lightInput: {
    borderColor: '#ccc',
    color: '#000',
    backgroundColor: '#FFF',
  },

  darkInput: {
    borderColor: '#444',
    color: '#FFF',
    backgroundColor: '#222',
  },

  button: {
    backgroundColor: '#4CAE4F',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#6c757d',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  notificationOption: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#4CAE4F',
    borderRadius: 5,
    alignItems: 'center',
    width: '90%',
  },

  selectedOption: {
    backgroundColor: '#4CAE4F',
  },

  notificationText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  phoneInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
  },

  lightPhoneInput: {
    borderColor: '#ccc',
    color: '#000',
    backgroundColor: '#FFF',
  },

  darkPhoneInput: {
    borderColor: '#444',
    color: '#FFF',
    backgroundColor: '#222',
  },

  phoneSaveButton: {
    backgroundColor: '#4CAE4F',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },

  phoneSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  phoneVerifiedText: {
    color: '#4CAE4F',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },

  removeButton: {
    backgroundColor: '#d9534f',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  feedbackButton: {
    backgroundColor: '#4CAE4F',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  feedbackInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    marginTop: 10,
    color: scheme === 'dark' ? '#FFF' : '#000',
  },
});

export default styles;