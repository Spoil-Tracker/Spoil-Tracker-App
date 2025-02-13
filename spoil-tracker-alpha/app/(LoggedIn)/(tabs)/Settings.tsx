import React, { useState, useEffect } from 'react';
import 
{
  TextInput,
  TouchableOpacity,
  View,
  Text,
  Image,
} from 'react-native';
import { auth } from '../../../services/firebaseConfig';
import { verifyBeforeUpdateEmail } from 'firebase/auth';
import 
{
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
  PhoneAuthProvider,
  signInWithCredential,
  RecaptchaVerifier,
} from 'firebase/auth';
import Banner from '../../../components/Banner';
import styles from '../SettingsPageStyleSheet';

const SettingsPage = (): JSX.Element => 
{
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerType, setBannerType] = useState<'success' | 'error'>('success');

  const [notificationSetting, setNotificationSetting] = useState('Notify Everyday');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => 
  {
    const currentUser = auth.currentUser;
    if (currentUser) 
    {
      setUser(currentUser);
      setEmailVerified(currentUser.emailVerified);
    }
  }, []);

  useEffect(() => 
  {
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', 
    {
      size: 'invisible',
      callback: () => console.log('Recaptcha resolved'),
    });
    setRecaptchaVerifier(verifier);
  }, []);

  const handleEmailChange = async () => 
  {
    if (!user) 
    {
      setBannerMessage('You must be logged in to update your email.');
      setBannerType('error');
      return;
    }

    if (username.trim() === '') 
    {
      setBannerMessage('Email cannot be empty.');
      setBannerType('error');
      return;
    }

    const credential = EmailAuthProvider.credential(user.email || '', password);
    try 
    {
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, username);
      setBannerMessage('Verification email sent. Please check your inbox.');
      setBannerType('success');
    } catch (error) 
    {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to update email: ' + errorMessage);
      setBannerType('error');
    }
  };

  const handlePasswordChange = async () => 
  {
    if (!user) 
    {
      setBannerMessage('You must be logged in to change your password.');
      setBannerType('error');
      return;
    }

    if (password.trim().length < 6) 
    {
      setBannerMessage('Password must be at least 6 characters long.');
      setBannerType('error');
      return;
    }

    try 
    {
      await updatePassword(user, password);
      setBannerMessage('Password updated successfully.');
      setBannerType('success');
    } catch (error) 
    {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to update password: ' + errorMessage);
      setBannerType('error');
    }
  };

  const handleEmailVerification = async () =>
  {
    if (!user)
    {
      setBannerMessage('You must be logged in to verify your email.');
      setBannerType('error');
      return;
    }

    if (user.emailVerified) 
    {
      setEmailVerified(true);
      setBannerMessage('Your email is already verified.');
      setBannerType('success');
      return;
    }

    try
    {
      await sendEmailVerification(user);
      setBannerMessage('Verification email sent. Please check your inbox.');
      setBannerType('success');

      const interval = setInterval(async () =>
      {
        await user.reload();
        if (user.emailVerified)
        {
          setEmailVerified(true);
          setBannerMessage('Email verified successfully.');
          setBannerType('success');
          clearInterval(interval);
        }
      }, 5000);

      setTimeout(() => clearInterval(interval), 60000);
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setBannerMessage('Failed to send verification email: ' + errorMessage);
      setBannerType('error');
    }
  };

  const handleNotificationChange = (setting: string) => 
  {
    setNotificationSetting(setting);
    setBannerMessage(`Notification setting changed to: ${setting}`);
    setBannerType('success');
  };

  const sendVerificationCode = async () =>
  {
    if (phoneNumber.trim() === '')
    {
      setBannerMessage('Please enter a phone number.');
      setBannerType('error');
      return;
    }

    if (!recaptchaVerifier)
    {
      setBannerMessage('Recaptcha not ready, please try again.');
      setBannerType('error');
      return;
    }

    try
    {
      console.log("Sending verification code to:", phoneNumber);
      const provider = new PhoneAuthProvider(auth);
      const id = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifier);
      setVerificationId(id);
      console.log("Verification ID received:", id);
      setBannerMessage('Verification code sent to your phone.');
      setBannerType('success');
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error sending verification code:", error);
      setBannerMessage('Failed to send verification code. ' + errorMessage);
      setBannerType('error');
    }
  };

  const verifyCode = async () =>
  {
    if (!verificationId || verificationCode.trim() === '')
    {
      setBannerMessage('Please enter the verification code.');
      setBannerType('error');
      return;
    }

    try
    {
      console.log("Verifying code:", verificationCode);
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await signInWithCredential(auth, credential);
      setPhoneVerified(true);
      setBannerMessage('Phone number verified successfully.');
      setBannerType('success');
    } catch (error)
    {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error("Error verifying code:", error);
      setBannerMessage('Invalid verification code. ' + errorMessage);
      setBannerType('error');
    }
  }

  return (
    <View style={[styles.container, darkMode ? styles.darkContainer : styles.lightContainer]}>
      {bannerMessage && <Banner message={bannerMessage} type={bannerType} />}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
        <Image
          source={require('C:/Users/dgkth/Downloads/Spoil-Tracker-App/spoil-tracker-alpha/assets/images/favicon.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.leftSection}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>New Email:</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your new email"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
            />
            <TouchableOpacity style={styles.button} onPress={handleEmailChange}>
              <Text style={styles.buttonText}>Change Email</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Email Verification:</Text>
            <TouchableOpacity
              style={[styles.button, emailVerified && styles.disabledButton]}
              onPress={handleEmailVerification}
              disabled={emailVerified}
            >
              <Text style={styles.buttonText}>
                {emailVerified ? 'Email Verified' : 'Verify Email'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>New Password:</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your new password"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordChange}>
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.rightSection}>
          <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Notification Settings:</Text>
          {['Notify Everyday', 'Notify Weekly', 'Notify Monthly', 'Notify Never'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.notificationOption,
                notificationSetting === option && styles.selectedOption,
              ]}
              onPress={() => handleNotificationChange(option)}
            >
              <Text style={styles.notificationText}>{option}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.formGroup}>
            <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>Phone Number (Optional):</Text>
            <TextInput
              style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              placeholderTextColor={darkMode ? "#ddd" : "#555"}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={sendVerificationCode}>
              <Text style={styles.buttonText}>Send Verification Code</Text>
            </TouchableOpacity>
          </View>

          {verificationId !== '' && (
            <View style={styles.formGroup}>
              <Text style={[styles.label, darkMode ? styles.darkText : styles.lightText]}>
                Enter Verification Code:
              </Text>
              <TextInput
                style={[styles.input, darkMode ? styles.darkInput : styles.lightInput]}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="Enter code"
                placeholderTextColor={darkMode ? "#ddd" : "#555"}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={verifyCode}>
                <Text style={styles.buttonText}>Verify Phone Number</Text>
              </TouchableOpacity>
            </View>
          )}

          {phoneVerified && (
            <Text style={[styles.label, { color: '#4CAE4F', marginTop: 10 }]}>
              Phone Number Verified!
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={() => setDarkMode(!darkMode)}>
            <Text style={styles.buttonText}>
              {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View id="recaptcha-container"></View>
    </View>
  );
};

export default SettingsPage;
