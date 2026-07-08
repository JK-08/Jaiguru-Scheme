// Src/Screens/MemberCreation/SchemeJoiningForm.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView, Modal, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSchemeGroupOptions } from '../../api/hooks/Schemes/useSchemeGroupOptions';
import { Scheme } from '../../types/Scheme/Scheme';
import { AppText, AppCard, AppBadge, AppSectionHeader } from '../../Components/ui/appcomponents';
import theme from '../../Utills/AppTheme';

const { COLORS, SIZES, SHADOWS } = theme;

// NOTE: All payments in this flow are collected online via Razorpay
// (see MemberCreation.tsx's startPayment/schemeCollectInsert payload, which
// always sends modePay: 4 / accCode: "00001" / "Online"). A payment-method
// picker (cash/cheque/NEFT/etc.) was previously built here but would have
// been misleading since selecting anything other than "Online" would not
// have changed how the charge is actually processed. It's been removed in
// favor of the accurate read-only "Online" indicator below. If offline
// payment modes are ever wired up end-to-end, reintroduce a real picker
// backed by useTransactionTypes here.
//
// The scheme-amount selector was previously a native @react-native-picker/
// picker, then briefly an AppChip grid. Now it's a custom dropdown: a
// closed, input-styled field that opens a modal list on tap (like the
// dropdown UX requested), while still avoiding @react-native-picker/picker's
// known Android crash risk under memory pressure / on some OEM ROMs (the
// same class of issue fixed for the Razorpay WebView via onRenderProcessGone).

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

export interface SchemeJoiningUserSummary {
  userName?: string;
  lastName?: string;
  mobileNumber?: string;
  emailAddress?: string;
}

export interface SchemeJoiningFormProps {
  scheme?: Scheme;
  onSubmit?: (data: SchemeJoiningFormData) => void;
  initialData?: { selectedScheme?: string } | null;
  // Registration data collected in Step 1 — shown here so the member can
  // confirm who they're registering/paying for before submitting payment.
  // Previously this screen only showed scheme/payment info with no trace
  // of the just-filled-in registration form.
  userData?: SchemeJoiningUserSummary;
}

const METAL_TYPE_NAMES: Record<string, string> = {
  G: 'Gold',
  S: 'Silver',
  B: 'Bronze',
  C: 'Copper',
};

const SchemeJoiningForm = forwardRef<SchemeJoiningFormRef, SchemeJoiningFormProps>(
  ({ scheme, initialData = null, userData }, ref) => {
    const { schemes, loading: loadingSchemes, error: errorSchemes, getAmount } = useSchemeGroupOptions(
      scheme?.SchemeId
    );

    const [selectedScheme, setSelectedScheme] = useState('');
    const [selectedPayment] = useState('00001');
    const [dropdownVisible, setDropdownVisible] = useState(false);

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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <AppText variant="bodySmall" color={COLORS.textSecondary} style={{ marginTop: SIZES.sm }}>
            Loading schemes...
          </AppText>
        </View>
      );
    }

    if (errorSchemes) {
      return (
        <View style={styles.errorContainer}>
          <AppText variant="bodyBold" color={COLORS.error} align="center">
            Error loading schemes: {errorSchemes}
          </AppText>
        </View>
      );
    }

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

        {/* Member Details (from Step 1 registration) */}
        {userData && (userData.userName || userData.mobileNumber || userData.emailAddress) && (
          <AppCard style={styles.card}>
            <AppSectionHeader title="Member Details" />
            <View style={styles.detailRow}>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                Name
              </AppText>
              <AppText variant="bodyBold">
                {[userData.userName, userData.lastName].filter(Boolean).join(' ') || 'N/A'}
              </AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                Mobile
              </AppText>
              <AppText variant="bodyBold">{userData.mobileNumber || 'N/A'}</AppText>
            </View>
            <View style={[styles.detailRow, { marginBottom: 0 }]}>
              <AppText variant="bodySmall" color={COLORS.textSecondary}>
                Email
              </AppText>
              <AppText variant="bodyBold">{userData.emailAddress || 'N/A'}</AppText>
            </View>
          </AppCard>
        )}

        {/* Scheme Details Card */}
        <AppCard style={styles.card}>
          <AppSectionHeader title="Selected Scheme Details" />
          <View style={styles.detailRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Scheme Name
            </AppText>
            <AppText variant="bodyBold">{scheme?.schemeName || 'N/A'}</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Scheme Code
            </AppText>
            <AppText variant="bodyBold">{scheme?.SchemeSName || 'N/A'}</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              Metal Type
            </AppText>
            <AppBadge label={`${getMetalTypeName(scheme?.MetalType)} (${scheme?.MetalType || 'N/A'})`} variant="gold" />
          </View>
        </AppCard>

        {/* Scheme Amount Selection */}
        <AppCard style={styles.card}>
          <AppSectionHeader title="Select Scheme Amount" />
          {schemes.length === 0 ? (
            <AppText variant="bodySmall" color={COLORS.textSecondary}>
              No schemes available
            </AppText>
          ) : (
            <TouchableOpacity
              style={styles.dropdownField}
              activeOpacity={0.7}
              onPress={() => setDropdownVisible(true)}
            >
              <AppText variant="body" color={selectedScheme ? COLORS.textPrimary : COLORS.inputPlaceholder}>
                {selectedScheme
                  ? `${selectedScheme} · ₹${getAmount(selectedScheme)}`
                  : 'Select an amount'}
              </AppText>
              <Icon name="chevron-down" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}

          {selectedScheme && (
            <View style={styles.amountContainer}>
              <View>
                <AppText variant="bodySmall" color={COLORS.successDark}>
                  Selected Amount
                </AppText>
                <AppText variant="caption" color={COLORS.successDark}>
                  Code: {selectedScheme}
                </AppText>
              </View>
              <AppText variant="h4" color={COLORS.successDark}>
                ₹{getAmount(selectedScheme)}
              </AppText>
            </View>
          )}
        </AppCard>

        {/* Scheme Amount Dropdown Modal */}
        <Modal visible={dropdownVisible} transparent animationType="fade" onRequestClose={() => setDropdownVisible(false)}>
          <TouchableOpacity
            style={styles.dropdownOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={styles.dropdownSheet} onStartShouldSetResponder={() => true}>
              <AppText variant="h5" style={{ marginBottom: SIZES.md }}>
                Select Scheme Amount
              </AppText>
              <FlatList
                data={schemes}
                keyExtractor={(item) => item.GROUPCODE}
                style={styles.dropdownList}
                renderItem={({ item }) => {
                  const isSelected = selectedScheme === item.GROUPCODE;
                  return (
                    <TouchableOpacity
                      style={[styles.dropdownRow, isSelected && styles.dropdownRowSelected]}
                      onPress={() => {
                        setSelectedScheme(item.GROUPCODE);
                        setDropdownVisible(false);
                      }}
                    >
                      <AppText variant={isSelected ? 'bodyBold' : 'body'} color={isSelected ? COLORS.primary : COLORS.textPrimary}>
                        {item.GROUPCODE} · ₹{item.AMOUNT}
                      </AppText>
                      {isSelected && <Icon name="checkmark-circle" size={20} color={COLORS.primary} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Payment Method (see note above the component: always Online via Razorpay) */}
        <AppCard style={styles.card}>
          <AppSectionHeader title="Payment Method" />
          <View style={styles.paymentDetails}>
            <AppText variant="bodySmall" color={COLORS.primary}>
              Payment Type
            </AppText>
            <AppText variant="h6" color={COLORS.primaryDark}>
              Online (00001)
            </AppText>
          </View>
        </AppCard>

        {/* Summary Card */}
        {selectedScheme && selectedPayment && (
          <AppCard variant="premium" style={styles.card}>
            <AppText variant="h5" align="center" color={COLORS.accentDark} style={{ marginBottom: SIZES.md }}>
              Order Summary
            </AppText>

            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={COLORS.accentDark}>
                Scheme
              </AppText>
              <AppText variant="bodyBold" color={COLORS.accentDark}>
                {scheme?.schemeName}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={COLORS.accentDark}>
                Scheme Code
              </AppText>
              <AppText variant="bodyBold" color={COLORS.accentDark}>
                {selectedScheme}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={COLORS.accentDark}>
                Amount
              </AppText>
              <AppText variant="bodyBold" color={COLORS.accentDark}>
                ₹{getAmount(selectedScheme)}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodySmall" color={COLORS.accentDark}>
                Payment Type
              </AppText>
              <AppText variant="bodyBold" color={COLORS.accentDark}>
                Online (00001)
              </AppText>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <AppText variant="bodySmall" color={COLORS.accentDark}>
                Metal Type
              </AppText>
              <AppText variant="bodyBold" color={COLORS.accentDark}>
                {getMetalTypeName(scheme?.MetalType)}
              </AppText>
            </View>
          </AppCard>
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
    backgroundColor: COLORS.backgroundSecondary,
  },
  contentContainer: {
    padding: SIZES.padding.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.xl,
    backgroundColor: COLORS.backgroundSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.xl,
    backgroundColor: COLORS.backgroundSecondary,
  },
  header: {
    marginBottom: SIZES.margin.lg,
    paddingBottom: SIZES.padding.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  card: {
    marginBottom: SIZES.margin.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
  },
  dropdownField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.input,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: SIZES.padding.md,
    backgroundColor: COLORS.inputBackground,
    marginBottom: SIZES.md,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.xl,
  },
  dropdownSheet: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.padding.lg,
    maxHeight: '70%',
    ...SHADOWS.lg,
  },
  dropdownList: {
    flexGrow: 0,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  dropdownRowSelected: {
    backgroundColor: COLORS.primaryPale,
    borderRadius: SIZES.radius.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  paymentDetails: {
    backgroundColor: COLORS.primaryPale,
    padding: SIZES.padding.md,
    borderRadius: SIZES.radius.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.margin.sm,
    paddingBottom: SIZES.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldOpacity20,
  },
  bottomSpacing: {
    height: 30,
  },
});
