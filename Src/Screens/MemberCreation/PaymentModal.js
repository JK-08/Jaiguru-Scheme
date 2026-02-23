// Components/PaymentModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

const PaymentModal = ({ visible, step, error }) => {
  const getContent = () => {
    switch (step) {
      case 'creating_order':
        return {
          title: 'Creating Order',
          message: 'Please wait while we create your payment order...',
          icon: '🔄'
        };
      case 'verifying':
        return {
          title: 'Verifying Payment',
          message: 'Please wait while we verify your payment...',
          icon: '✓'
        };
      case 'failed':
        return {
          title: 'Payment Failed',
          message: error || 'Something went wrong. Please try again.',
          icon: '✗'
        };
      default:
        return {
          title: 'Processing',
          message: 'Please wait...',
          icon: '⏳'
        };
    }
  };

  const content = getContent();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.icon}>{content.icon}</Text>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.message}>{content.message}</Text>
          {step !== 'failed' && (
            <ActivityIndicator size="large" color="#4CAF50" style={styles.spinner} />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginTop: 8,
  },
});

export default PaymentModal;