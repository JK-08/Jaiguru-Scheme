// Src/Screens/MemberCreation/SchemeJoiningForm.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSchemeGroupOptions } from '../../api/hooks/Schemes/useSchemeGroupOptions';
import { Scheme } from '../../types/Scheme/Scheme';

// NOTE: All payments in this flow are collected online via Razorpay
// (see MemberCreation.tsx's startPayment/schemeCollectInsert payload, which
// always sends modePay: 4 / accCode: "00001" / "Online"). A payment-method
// picker (cash/cheque/NEFT/etc.) was previously built here but would have
// been misleading since selecting anything other than "Online" would not
// have changed how the charge is actually processed. It's been removed in
// favor of the accurate read-only "Online" indicator below. If offline
// payment modes are ever wired up end-to-end, reintroduce a real picker
// backed by useTransactionTypes here.

export interface SchemeJoiningFormData {
  schemeId?: number;
  schemeName?: string;
  selectedScheme: string;
  amount: number | null;
  paymentType: string;
  metalType?: string;
  schemeCode?: string;
}

export interface SchemeJoiningFormRef {
  validateAndSubmit: () => boolean;
  getFormData: () => SchemeJoiningFormData;
}

export interface SchemeJoiningFormProps {
  scheme?: Scheme;
  onSubmit?: (data: SchemeJoiningFormData) => void;
  initialData?: { selectedScheme?: string } | null;
}

const METAL_TYPE_NAMES: Record<string, string> = {
  G: 'Gold',
  S: 'Silver',
  B: 'Bronze',
  C: 'Copper',
};

const SchemeJoiningForm = forwardRef<SchemeJoiningFormRef, SchemeJoiningFormProps>(
  ({ scheme, initialData = null }, ref) => {
    const { schemes, loading: loadingSchemes, error: errorSchemes, getAmount } = useSchemeGroupOptions(
      scheme?.SchemeId
    );

    const [selectedScheme, setSelectedScheme] = useState('');
    const [selectedPayment] = useState('00001');

    useEffect(() => {
      if (initialData) {
        setSelectedScheme(initialData.selectedScheme || '');
      } else if (schemes.length > 0 && !selectedScheme) {
        setSelectedScheme(schemes[0].GROUPCODE);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [schemes, initialData]);

    const validateForm = (): boolean => {
      if (!selectedScheme) {
        return false;
      }
      if (!selectedPayment) {
        return false;
      }
      return true;
    };

    const prepareSubmissionData = (): SchemeJoiningFormData => {
      const amount = getAmount(selectedScheme);
      const paymentType = 'Online';

      return {
        schemeId: scheme?.SchemeId,
        schemeName: scheme?.schemeName,
        selectedScheme,
        amount,
        paymentType,
        metalType: scheme?.MetalType,
        schemeCode: scheme?.SchemeSName,
      };
    };

    useImperativeHandle(ref, () => ({
      validateAndSubmit: () => validateForm(),
      getFormData: () => prepareSubmissionData(),
    }));

    const getMetalTypeName = (metalType?: string) => (metalType ? METAL_TYPE_NAMES[metalType] || metalType : 'N/A');

    if (loadingSchemes) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading schemes...</Text>
        </View>
      );
    }

    if (errorSchemes) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading schemes: {errorSchemes}</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scheme Joining</Text>
          <Text style={styles.headerSubtitle}>Step 2: Select scheme and payment details</Text>
        </View>

        {/* Scheme Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Selected Scheme Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheme Name:</Text>
            <Text style={styles.detailValue}>{scheme?.schemeName || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheme Code:</Text>
            <Text style={styles.detailValue}>{scheme?.SchemeSName || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Metal Type:</Text>
            <Text style={styles.detailValue}>
              {getMetalTypeName(scheme?.MetalType)} ({scheme?.MetalType || 'N/A'})
            </Text>
          </View>
        </View>

        {/* Scheme Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Scheme Amount</Text>
          <Text style={styles.label}>Available Schemes:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedScheme}
              onValueChange={(itemValue: string) => setSelectedScheme(itemValue)}
              style={styles.picker}
            >
              {schemes.length === 0 ? (
                <Picker.Item label="No schemes available" value="" />
              ) : (
                schemes.map((schemeItem) => (
                  <Picker.Item
                    key={schemeItem.GROUPCODE}
                    label={`${schemeItem.GROUPCODE} - ₹${schemeItem.AMOUNT}`}
                    value={schemeItem.GROUPCODE}
                  />
                ))
              )}
            </Picker>
          </View>

          {selectedScheme && (
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Selected Amount:</Text>
              <Text style={styles.amountValue}>₹{getAmount(selectedScheme)}</Text>
            </View>
          )}
        </View>

        {/* Payment Method (see note above the component: always Online via Razorpay) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentDetails}>
            <Text style={styles.paymentLabel}>Payment Type:</Text>
            <Text style={styles.paymentValue}>Online (00001)</Text>
          </View>
        </View>

        {/* Summary Card */}
        {selectedScheme && selectedPayment && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Scheme:</Text>
              <Text style={styles.summaryValue}>{scheme?.schemeName}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Scheme Code:</Text>
              <Text style={styles.summaryValue}>{selectedScheme}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>₹{getAmount(selectedScheme)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Type:</Text>
              <Text style={styles.summaryValue}>Online (00001)</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Metal Type:</Text>
              <Text style={styles.summaryValue}>{getMetalTypeName(scheme?.MetalType)}</Text>
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    );
  }
);

SchemeJoiningForm.displayName = 'SchemeJoiningForm';
export default SchemeJoiningForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    color: '#D32F2F',
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495E',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D5D8DC',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  picker: {
    height: 50,
  },
  amountContainer: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  amountLabel: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  paymentDetails: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
  },
  summaryCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFECB3',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF8F00',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFECB3',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#FF8F00',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FF6F00',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 30,
  },
});
