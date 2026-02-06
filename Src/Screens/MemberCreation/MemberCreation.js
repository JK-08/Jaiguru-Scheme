import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import UserRegistrationForm from "./UserRegistrationForm";
import SchemeJoiningForm from "./SchemeJoiningForm";
import { useCreateMember } from "../../Hooks/useMemberCreate"; // import the hook

const MemberCreation = () => {
  const route = useRoute();
  const { scheme } = route.params || {}; // Scheme data passed via navigation
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [userRegistrationData, setUserRegistrationData] = useState(null);

  const { create, loading, error, data } = useCreateMember(); // hook for API call

  console.log("User Registration Data:", userRegistrationData);

  // Callback when registration form is submitted
  const handleRegistrationSubmit = (formData) => {
    setUserRegistrationData(formData);
    setIsRegistrationComplete(true);
  };

  // Callback when scheme joining form is submitted
  const handleSchemeSubmit = async (schemeData) => {
    console.log("Scheme Joining Data:", schemeData);

    // Transform your form data to match API payload
    const payload = {
      newMember: {
        title: "Mr", // Could come from registration if you have it
        initial: userRegistrationData.userName?.[0] || "",
        pName: userRegistrationData.userName,
        sName: "", // You can add last name if available
        doorNo: userRegistrationData.doorNo,
        address1: userRegistrationData.street,
        address2: "",
        area: userRegistrationData.area,
        city: userRegistrationData.city,
        state: userRegistrationData.state,
        country: "India",
        pinCode: userRegistrationData.pincode,
        mobile: userRegistrationData.mobileNumber,
        mobile2: userRegistrationData.nomineeMobile,
        nomeni: userRegistrationData.nomineeName,
        nomineeMobile: userRegistrationData.nomineeMobile,
        nomineeRelationship: "Spouse", // Can be dynamic
        nomAddr1: userRegistrationData.street,
        nomAddr2: "",
        nomCity: userRegistrationData.city,
        nomState: userRegistrationData.state,
        nomPincode: userRegistrationData.pincode,
        nomCountry: "India",
        idProof: "Aadhaar",
        idProofNo: userRegistrationData.aadharNumber.replace(/\s/g, ""),
        aadhaarMasked: userRegistrationData.aadharNumber
          .slice(-4)
          .padStart(userRegistrationData.aadharNumber.length, "X"),
        panNumber: userRegistrationData.panNumber,
        dob: userRegistrationData.dob.split("-").reverse().join("-"), // API expects yyyy-mm-dd
        email: userRegistrationData.emailAddress,
        mobileVerified: true,
        aadhaarVerified: true,
        nomineeMobileVerified: true,
        nomineeAadhaarVerified: false,
        upDateTime: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId: "999",
        appVer: "WEB",
        anniversaryDate: new Date().toISOString().slice(0, 10),
      },
      createSchemeSummary: {
        schemeId: schemeData.schemeId,
        groupCode: schemeData.selectedScheme,
        regNo: 1,
        joinDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        upDateTime2: new Date().toISOString().slice(0, 19).replace("T", " "),
        openingDate: new Date().toISOString().slice(0, 19).replace("T", " "),
        userId2: "999",
      },
      schemeCollectInsert: {
        amount: schemeData.amount,
        modePay: schemeData.paymentType[0] || "O",
        accCode: "1",
        chqBankCode: "1",
        chqCardNo: "7700201931983",
        chqBranch: "Phi Com Test",
        chkBank: "NB",
        chqRtnReason: "ORDER-2C63D28B94",
      },
      referralCode: "RANJI40191",
    };

    try {
      const res = await create(payload); // call the API
      console.log("API Response:", res);

      Alert.alert(
        "Success",
        `Member created successfully!\n\nPersonal ID: ${res.message.personalId}\nScheme: ${schemeData.schemeName}\nAmount: ₹${schemeData.amount}\nPayment Type: ${schemeData.paymentType}`,
      );
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to create member");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {!isRegistrationComplete ? (
        <UserRegistrationForm onSubmit={handleRegistrationSubmit} />
      ) : (
        <>
          <SchemeJoiningForm scheme={scheme} onSubmit={handleSchemeSubmit} />
        </>
      )}
    </ScrollView>
  );
};

export default MemberCreation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});
