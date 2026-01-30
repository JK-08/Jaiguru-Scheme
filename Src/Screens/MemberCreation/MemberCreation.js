import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserRegistrationForm from './UserRegistrationForm';

const MemberCreation = () => {
  const pName = 'ChristopherJohn'; // try changing this

  const displayName =
    pName.length > 10 ? pName.slice(0, 10) + '...' : pName;

  return (
    <View style={styles.container}>
        <UserRegistrationForm />
      
    </View>
  );
};

export default MemberCreation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});
