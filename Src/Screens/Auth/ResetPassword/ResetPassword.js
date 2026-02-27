import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import useAuth from "../../../Hooks/useRegister";
import CommonHeader from "../../../Components/CommonHeader/CommonHeader";

const ResetPasswordScreen = ({ route, navigation }) => {
  const { contactNumber, otp } = route.params;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { updatePassword, loading } = useAuth();

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Enter all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const res = await updatePassword({
      contactNumber,
      otp,
      newPassword,
    });

    if (!res?.error) {
      Alert.alert("Success", "Password Updated Successfully");
      navigation.navigate("Login");
    } else {
      Alert.alert("Error", res.error);
    }
  };

  return (
    <View style={styles.container}>
      <CommonHeader title={"Reset Password"} />

      <Text style={styles.title}>Create New Password</Text>

      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});