// Src/Screens/MemberCreation/UserRegistrationForm.tsx
import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardTypeOptions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../../Utills/AppTheme';
import authStorage from '../../Utills/AsynchStorageHelper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AppButton } from '../../Components/ui/appcomponents';

const { COLORS, SIZES, FONTS, ELEVATION } = theme;

// Storage key for saving form data
const FORM_STORAGE_KEY = '@user_registration_form_data';

// Months for date picker
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export interface UserRegistrationFormData {
  aadharNumber: string;
  panNumber: string;
  userName: string;
  lastName: string;
  dob: string;
  maritalStatus: string;
  anniversaryDate: string;
  mobileNumber: string;
  emailAddress: string;
  doorNo: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  nomineeName: string;
  nomineeMobile: string;
  nomineeRelationship: string;
  [key: string]: string;
}

type FormErrors = Partial<Record<string, string | null>>;

export interface UserRegistrationFormRef {
  validateAndSubmit: () => boolean;
  clearForm: () => void;
}

export interface UserRegistrationFormProps {
  onSubmit: (data: UserRegistrationFormData) => void;
  initialData?: Partial<UserRegistrationFormData>;
}

const EMPTY_FORM: UserRegistrationFormData = {
  aadharNumber: '',
  panNumber: '',
  userName: '',
  lastName: '',
  dob: '',
  maritalStatus: '',
  anniversaryDate: '',
  mobileNumber: '',
  emailAddress: '',
  doorNo: '',
  street: '',
  area: '',
  pincode: '',
  city: '',
  state: '',
  nomineeName: '',
  nomineeMobile: '',
  nomineeRelationship: '',
};

interface SelectedDate {
  day: string;
  month: string;
  year: string;
}

interface RenderInputOptions {
  mandatory?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  editable?: boolean;
}

const UserRegistrationForm = forwardRef<UserRegistrationFormRef, UserRegistrationFormProps>(
  ({ onSubmit, initialData = {} }, ref) => {
    const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

    const [formData, setFormData] = useState<UserRegistrationFormData>({ ...EMPTY_FORM });

    const [errors, setErrors] = useState<FormErrors>({});
    const [hasPreviousData, setHasPreviousData] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [postOffices, setPostOffices] = useState<any[]>([]);
    const [showAreaDropdown, setShowAreaDropdown] = useState(false);

    // Date picker states
    const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<SelectedDate>({
      day: '01',
      month: '01',
      year: '1990',
    });

    const maritalStatusOptions = ['Single', 'Married'];
    const relationshipOptions = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Sibling', 'Other'];

    // Generate days, months, years for date picker
    const currentYear = new Date().getFullYear();
    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const maxDobYear = currentYear - 18;
    const years = Array.from({ length: 100 }, (_, i) => (currentYear - i).toString());
    const dobYears = Array.from({ length: 100 }, (_, i) => (maxDobYear - i).toString());

    // Load user data from AuthStorage on mount
    useEffect(() => {
      loadUserDataFromAuth();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize with initialData if provided
    useEffect(() => {
      if (initialData && Object.keys(initialData).length > 0) {
        const merged: UserRegistrationFormData = { ...EMPTY_FORM };
        (Object.keys(initialData) as (keyof UserRegistrationFormData)[]).forEach((key) => {
          if (initialData[key] !== undefined) merged[key] = initialData[key] as string;
        });
        setFormData(merged);
        setHasPreviousData(true);

        if (initialData.dob) {
          const [year, month, day] = initialData.dob.split('-');
          setSelectedDate({ day, month, year });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]);

    // Save form data to AsyncStorage whenever formData changes
    useEffect(() => {
      saveFormData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData]);

    // Auto-fetch city and state from pincode
    useEffect(() => {
      if (formData.pincode && formData.pincode.length === 6) {
        fetchLocationFromPincode();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.pincode]);

    // Expose validateAndSubmit method to parent
    useImperativeHandle(ref, () => ({
      validateAndSubmit: () => {
        if (validateForm()) {
          onSubmit(formData);
          return true;
        }
        return false;
      },
      clearForm: clearFormData,
    }));

    // Load user data from AuthStorage
    const loadUserDataFromAuth = async () => {
      try {
        // First try to load saved form data
        const savedFormData = await AsyncStorage.getItem(FORM_STORAGE_KEY);

        if (savedFormData !== null) {
          const parsedData = JSON.parse(savedFormData);
          setFormData(parsedData);
          setHasPreviousData(true);

          if (parsedData.dob) {
            const [year, month, day] = parsedData.dob.split('-');
            setSelectedDate({ day, month, year });
          }
          return;
        }

        // If no saved form data, load from auth storage
        const authSession = await authStorage.getAuthSession();

        if (authSession.isAuthenticated && authSession.user) {
          const user = authSession.user;

          // Map auth user data to form fields
          const userFields = {
            userName: user.username || user.name || '',
            mobileNumber: user.contactNumber || user.mobileNumber || user.phone || '',
            emailAddress: user.email || '',
          };

          setFormData((prev) => ({
            ...prev,
            ...userFields,
          }));

          // Also try to load from USER_DATA key directly if needed
          const userData = await AsyncStorage.getItem('userData');
          if (userData) {
            const parsedUserData = JSON.parse(userData);
            setFormData((prev) => ({
              ...prev,
              userName: prev.userName || parsedUserData.username || parsedUserData.name || '',
              mobileNumber: prev.mobileNumber || parsedUserData.contactNumber || parsedUserData.mobileNumber || '',
              emailAddress: prev.emailAddress || parsedUserData.email || '',
            }));
          }
        }
      } catch (error) {
        console.error('Error loading user data from auth:', error);
      }
    };

    // Fetch location from pincode
    const fetchLocationFromPincode = async (pincode: string = formData.pincode) => {
      if (!pincode || pincode.length !== 6) return;

      setIsFetchingLocation(true);
      setPostOffices([]);
      setShowAreaDropdown(false);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();

        if (data[0]?.Status === 'Success') {
          const offices = data[0].PostOffice;
          setPostOffices(offices);
          setShowAreaDropdown(true);
          // Clear area/city/state so user picks fresh
          setFormData((prev) => ({ ...prev, area: '', city: '', state: '' }));
          setErrors((prev) => ({ ...prev, pincode: null, area: null, city: null, state: null }));
        } else {
          setErrors((prev) => ({ ...prev, pincode: 'Invalid pincode. Please check and try again.' }));
        }
      } catch (error) {
        setErrors((prev) => ({ ...prev, pincode: 'Failed to fetch location data. Please enter manually.' }));
      } finally {
        setIsFetchingLocation(false);
      }
    };

    const handleAreaSelect = (office: any) => {
      setFormData((prev) => ({
        ...prev,
        area: office.Name,
        city: office.Block || office.District || '',
        state: office.State || '',
      }));
      setShowAreaDropdown(false);
      setErrors((prev) => ({ ...prev, area: null, city: null, state: null }));
    };

    // Save form data to AsyncStorage
    const saveFormData = async () => {
      try {
        const jsonValue = JSON.stringify(formData);
        await AsyncStorage.setItem(FORM_STORAGE_KEY, jsonValue);
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    // Clear all form data
    const clearFormData = async () => {
      Alert.alert(
        'Clear Form',
        'Are you sure you want to clear all form data? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.removeItem(FORM_STORAGE_KEY);

                setFormData({ ...EMPTY_FORM });

                setErrors({});
                setHasPreviousData(false);

                // Reload user data from auth
                loadUserDataFromAuth();
              } catch (error) {
                Alert.alert('Error', 'Failed to clear form data. Please try again.');
              }
            },
          },
        ]
      );
    };

    // Clear specific field
    const clearField = (field: keyof UserRegistrationFormData) => {
      setFormData((prev) => ({ ...prev, [field]: '' }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    };

    // Clear all errors
    const clearAllErrors = () => {
      setErrors({});
    };

    // Verhoeff Algorithm for Aadhaar Validation
    const verhoeffCheck = (num: string) => {
      const cleanedNum = num.replace(/\D/g, '');

      if (cleanedNum.length !== 12) return false;

      const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
      ];

      const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
      ];

      const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

      let c = 0;
      const reversedArray = cleanedNum.split('').reverse();

      for (let i = 0; i < reversedArray.length; i++) {
        c = d[c][p[i % 8][parseInt(reversedArray[i], 10)]];
      }

      return inv[c] === 0;
    };

    // Validate Aadhar number automatically
    const validateAadharNumber = (aadharNumber: string) => {
      const cleanedAadhar = aadharNumber.replace(/\s/g, '');

      if (cleanedAadhar === '') {
        setErrors((prev) => ({ ...prev, aadharNumber: null }));
        return;
      }

      if (!/^\d{12}$/.test(cleanedAadhar)) {
        setErrors((prev) => ({
          ...prev,
          aadharNumber: 'Aadhar must be 12 digits',
        }));
        return;
      }

      const isValid = verhoeffCheck(aadharNumber);

      if (isValid) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.aadharNumber;
          return newErrors;
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          aadharNumber: 'Invalid Aadhar number. Please check and try again.',
        }));
      }
    };

    const handleInputChange = (field: keyof UserRegistrationFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field if it exists
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }

      // Automatically validate Aadhar as user types
      if (field === 'aadharNumber') {
        if (value.replace(/\s/g, '').length === 12) {
          validateAadharNumber(value);
        }
      }

      // Validate PAN format automatically
      if (field === 'panNumber' && value !== '') {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value)) {
          setErrors((prev) => ({ ...prev, panNumber: 'Invalid PAN format (e.g., ABCDE1234F)' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.panNumber;
            return newErrors;
          });
        }
      }

      // Validate mobile numbers automatically
      if ((field === 'mobileNumber' || field === 'nomineeMobile') && value !== '') {
        if (!/^\d{10}$/.test(value)) {
          setErrors((prev) => ({
            ...prev,
            [field]: `${field === 'mobileNumber' ? 'Mobile' : 'Nominee mobile'} must be 10 digits`,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }

      // Validate email automatically
      if (field === 'emailAddress' && value !== '') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setErrors((prev) => ({ ...prev, emailAddress: 'Invalid email format' }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.emailAddress;
            return newErrors;
          });
        }
      }

      // Validate pincode automatically
      if (field === 'pincode' && value !== '') {
        if (!/^\d{6}$/.test(value)) {
          setErrors((prev) => ({ ...prev, pincode: 'Pincode must be 6 digits' }));
        }
      }
    };

    const validateForm = () => {
      const newErrors: FormErrors = {};

      // Aadhar validation
      if (!formData.aadharNumber) {
        newErrors.aadharNumber = 'Aadhar number is required';
      } else if (!/^\d{12}$/.test(formData.aadharNumber.replace(/\s/g, ''))) {
        newErrors.aadharNumber = 'Aadhar must be 12 digits';
      } else if (!verhoeffCheck(formData.aadharNumber)) {
        newErrors.aadharNumber = 'Invalid Aadhar number';
      }

      // PAN validation - only if provided
      if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
      }

      // User details validation
      if (!formData.userName) newErrors.userName = 'Name is required';
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
      } else {
        const dob = new Date(formData.dob);
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 18);
        if (dob > minAge) newErrors.dob = 'You must be at least 18 years old';
      }
      if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';

      // Anniversary validation (if married)
      if (formData.maritalStatus === 'Married' && !formData.anniversaryDate) {
        newErrors.anniversaryDate = 'Anniversary date is required for married individuals';
      }

      // Mobile validation
      if (!formData.mobileNumber) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Mobile must be 10 digits';
      }

      // Email validation
      if (!formData.emailAddress) {
        newErrors.emailAddress = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
        newErrors.emailAddress = 'Invalid email format';
      }

      // Address validation
      if (!formData.doorNo) newErrors.doorNo = 'Door number is required';
      if (!formData.street) newErrors.street = 'Street is required';
      if (!formData.area) newErrors.area = 'Area is required';
      if (!formData.pincode) {
        newErrors.pincode = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';

      // Nominee validation
      if (!formData.nomineeName) newErrors.nomineeName = 'Nominee name is required';
      if (!formData.nomineeMobile) {
        newErrors.nomineeMobile = 'Nominee mobile is required';
      } else if (!/^\d{10}$/.test(formData.nomineeMobile)) {
        newErrors.nomineeMobile = 'Nominee mobile must be 10 digits';
      }
    

      setErrors(newErrors);
      const errorFields = Object.keys(newErrors) as string[];
      if (errorFields.length > 0) {
        scrollViewRef.current?.scrollToPosition(0, 0, true);
        const errorList = errorFields.map((f) => `• ${newErrors[f]}`).join('\n');
        Alert.alert('Please fix the following errors', errorList);
        return false;
      }
      return true;
    };

    const formatAadhar = (text: string) => {
      const cleaned = text.replace(/\s/g, '');
      const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
      if (match) {
        return [match[1], match[2], match[3]].filter(Boolean).join(' ');
      }
      return text;
    };

    const formatDateDisplay = (dateString: string) => {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    };

    const openDatePicker = (type: any) => {
      if (type === 'dob' && formData.dob) {
        const [year, month, day] = formData.dob.split('-');
        setSelectedDate({ day, month, year });
      } else if (type === 'anniversaryDate' && formData.anniversaryDate) {
        const [year, month, day] = formData.anniversaryDate.split('-');
        setSelectedDate({ day, month, year });
      } else {
        const defaultYear = type === 'dob' ? (currentYear - 25).toString() : '1990';
        setSelectedDate({ day: '01', month: '01', year: defaultYear });
      }
      setShowDatePicker(type);
    };

    const handleDateConfirm = () => {
      if (!selectedDate.day || !selectedDate.month || !selectedDate.year) {
        Alert.alert('Error', 'Please select a valid date');
        return;
      }

      const formattedDate = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;

      if (showDatePicker === 'dob') {
        const dob = new Date(parseInt(selectedDate.year), parseInt(selectedDate.month) - 1, parseInt(selectedDate.day));
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 18);
        if (dob > minAge) {
          Alert.alert('Invalid Date', 'You must be at least 18 years old.');
          return;
        }
        handleInputChange('dob', formattedDate);
      } else if (showDatePicker === 'anniversaryDate') {
        handleInputChange('anniversaryDate', formattedDate);
      }

      setShowDatePicker(null);
    };

    const ITEM_HEIGHT = 44;
    const VISIBLE_ITEMS = 5;
    const SCROLL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

    const dayScrollRef = useRef<ScrollView>(null);
    const monthScrollRef = useRef<ScrollView>(null);
    const yearScrollRef = useRef<ScrollView>(null);

    const scrollToIndex = (scrollRef: React.RefObject<ScrollView | null>, index: number) => {
      scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    };

    const handleDaySelect = (day: string) => {
      setSelectedDate((prev) => ({ ...prev, day }));
      scrollToIndex(dayScrollRef, days.indexOf(day));
    };

    const handleMonthSelect = (month: string) => {
      setSelectedDate((prev) => ({ ...prev, month }));
      scrollToIndex(monthScrollRef, months.indexOf(month));
    };

    const handleYearSelect = (year: string) => {
      setSelectedDate((prev) => ({ ...prev, year }));
      scrollToIndex(yearScrollRef, years.indexOf(year));
    };

    const initScroll = () => {
      setTimeout(() => {
        scrollToIndex(dayScrollRef, days.indexOf(selectedDate.day));
        scrollToIndex(monthScrollRef, months.indexOf(selectedDate.month));
        scrollToIndex(yearScrollRef, years.indexOf(selectedDate.year));
      }, 100);
    };

    const renderPickerColumn = (
      label: string,
      items: string[],
      selectedValue: string,
      onSelect: (item: string) => void,
      scrollRef: React.RefObject<ScrollView | null>,
      displayFn: ((item: string, index: number) => string) | null
    ) => (
      <View style={styles.pickerColumn}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <View style={{ height: SCROLL_HEIGHT }}>
          {/* Center highlight */}
          <View style={styles.pickerHighlight} pointerEvents="none" />
          <ScrollView
            ref={scrollRef}
            style={styles.pickerScrollView}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
          >
            {/* Top padding */}
            <View style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
            {items.map((item, index) => (
              <TouchableOpacity
                key={item}
                style={[styles.pickerItem, { height: ITEM_HEIGHT }]}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerItemText, selectedValue === item && styles.pickerItemTextSelected]}>
                  {displayFn ? displayFn(item, index) : item}
                </Text>
              </TouchableOpacity>
            ))}
            {/* Bottom padding */}
            <View style={{ height: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) }} />
          </ScrollView>
        </View>
      </View>
    );

    const renderDatePicker = () => (
      <Modal visible={!!showDatePicker} transparent animationType="fade" onShow={initScroll}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showDatePicker === 'dob' ? 'Select Date of Birth' : 'Select Anniversary Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.selectedDatePreview}>
              Selected: {selectedDate.day}/{selectedDate.month}/{selectedDate.year}
            </Text>

            <View style={styles.pickerContainer}>
              {renderPickerColumn('Day', days, selectedDate.day, handleDaySelect, dayScrollRef, null)}
              {renderPickerColumn(
                'Month',
                months,
                selectedDate.month,
                handleMonthSelect,
                monthScrollRef,
                (m, i) => MONTHS[i]
              )}
              {renderPickerColumn('Year', showDatePicker === 'dob' ? dobYears : years, selectedDate.year, handleYearSelect, yearScrollRef, null)}
            </View>

            <View style={styles.modalButtons}>
              <AppButton
                label="Cancel"
                variant="outline"
                onPress={() => setShowDatePicker(null)}
                fullWidth={false}
                style={styles.navButtonFlex}
              />
              <AppButton
                label="Confirm"
                variant="primary"
                onPress={handleDateConfirm}
                fullWidth={false}
                style={styles.navButtonFlex}
              />
            </View>
          </View>
        </View>
      </Modal>
    );

    const renderInput = (
      label: string,
      field: keyof UserRegistrationFormData,
      placeholder: string,
      options: RenderInputOptions = {}
    ) => {
      const { mandatory = false, keyboardType = 'default', autoCapitalize = 'words', maxLength, editable = true } = options;

      const hasError = !!errors[field];
      const hasValue = !!formData[field];

      return (
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {label}
              {mandatory && <Text style={styles.mandatory}> *</Text>}
            </Text>
            {hasValue && editable && (
              <TouchableOpacity onPress={() => clearField(field)} style={styles.clearFieldButton}>
                <Text style={styles.clearFieldText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={[styles.input, hasError && styles.inputError, !editable && styles.inputDisabled]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.contentPlaceholder}
            value={formData[field]}
            onChangeText={(text) => {
              if (field === 'aadharNumber') {
                const formatted = formatAadhar(text);
                handleInputChange(field, formatted);
              } else if (field === 'panNumber') {
                handleInputChange(field, text.toUpperCase());
              } else {
                handleInputChange(field, text);
              }
            }}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            editable={editable}
          />
          {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
      );
    };

    const renderDateInput = (label: string, field: keyof UserRegistrationFormData, mandatory = true) => {
      const hasError = !!errors[field];
      const hasValue = !!formData[field];

      return (
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              {label}
              {mandatory && <Text style={styles.mandatory}> *</Text>}
            </Text>
            {hasValue && (
              <TouchableOpacity onPress={() => clearField(field)} style={styles.clearFieldButton}>
                <Text style={styles.clearFieldText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.input, styles.dateInput, hasError && styles.inputError]}
            onPress={() => openDatePicker(field)}
          >
            <Text style={hasValue ? styles.dateText : styles.placeholderText}>
              {hasValue ? formatDateDisplay(formData[field]) : `Select ${label}`}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
          {hasError && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
      );
    };

    const renderMaritalStatusPicker = () => {
      return (
        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Marital Status<Text style={styles.mandatory}> *</Text>
            </Text>
            {formData.maritalStatus && (
              <TouchableOpacity onPress={() => clearField('maritalStatus')} style={styles.clearFieldButton}>
                <Text style={styles.clearFieldText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.maritalStatusContainer}>
            {maritalStatusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.maritalStatusButton, formData.maritalStatus === status && styles.maritalStatusButtonActive]}
                onPress={() => handleInputChange('maritalStatus', status)}
              >
                <Text style={[styles.maritalStatusText, formData.maritalStatus === status && styles.maritalStatusTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.maritalStatus && <Text style={styles.errorText}>{errors.maritalStatus}</Text>}
        </View>
      );
    };


    return (
      <View style={styles.container}>
        {/* <View style={styles.customHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>User Registration</Text>
            <Text style={styles.headerSubtitle}>Step 1: Fill in your personal details</Text>
          </View>
          {hasPreviousData && (
            <AppButton label="Clear Form" variant="danger" size="sm" onPress={clearFormData} />
          )}
        </View> */}

        <KeyboardAwareScrollView
          ref={scrollViewRef}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Document Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>📄</Text>
              </View>
              <Text style={styles.sectionTitle}>Document Details</Text>
            </View>

            {renderInput('Aadhar Number', 'aadharNumber', 'XXXX XXXX XXXX', {
              mandatory: true,
              keyboardType: 'numeric',
              maxLength: 14,
            })}

            {renderInput('PAN Number', 'panNumber', 'ABCDE1234F', {
              mandatory: false,
              autoCapitalize: 'characters',
              maxLength: 10,
            })}
          </View>

          {/* Personal Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>👤</Text>
              </View>
              <Text style={styles.sectionTitle}>Personal Details</Text>
            </View>

            {renderInput('Full Name', 'userName', 'Enter your full name', {
              mandatory: true,
            })}

            {renderInput('Last Name', 'lastName', 'Enter last name', {
              mandatory: false,
            })}

            {renderDateInput('Date of Birth', 'dob', true)}

            {renderMaritalStatusPicker()}

            {formData.maritalStatus === 'Married' && renderDateInput('Anniversary Date', 'anniversaryDate', true)}

            {renderInput('Mobile Number', 'mobileNumber', '10 digit mobile', {
              mandatory: true,
              keyboardType: 'phone-pad',
              maxLength: 10,
              editable: false,
            })}

            {renderInput('Email Address', 'emailAddress', 'example@email.com', {
              mandatory: true,
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              editable: false,
            })}
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>🏠</Text>
              </View>
              <Text style={styles.sectionTitle}>Address Details</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                {renderInput('Door No', 'doorNo', 'Door No.', { mandatory: true })}
              </View>
              <View style={styles.halfWidth}>
                {renderInput('Street', 'street', 'Street name', { mandatory: true })}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <View style={styles.pincodeContainer}>
                  {renderInput('Pincode', 'pincode', '6 digits', {
                    mandatory: true,
                    keyboardType: 'numeric',
                    maxLength: 6,
                  })}
                  {isFetchingLocation && (
                    <ActivityIndicator size="small" color={COLORS.contentBrand} style={styles.pincodeLoader} />
                  )}
                </View>
              </View>
              <View style={styles.halfWidth}>
                {renderInput('City', 'city', 'City', {
                  mandatory: true,
                  editable: false,
                })}
              </View>
            </View>

            {/* Area dropdown */}
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Area / Locality<Text style={styles.mandatory}> *</Text></Text>
                {formData.area ? (
                  <TouchableOpacity onPress={() => clearField('area')} style={styles.clearFieldButton}>
                    <Text style={styles.clearFieldText}>Clear</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, !!errors.area && styles.inputError]}
                onPress={() => postOffices.length > 0 && setShowAreaDropdown((v) => !v)}
                activeOpacity={0.8}
              >
                <Text style={formData.area ? styles.dateText : styles.placeholderText}>
                  {formData.area || (postOffices.length > 0 ? 'Select area from list' : 'Enter pincode first')}
                </Text>
                {postOffices.length > 0 && <Text style={styles.dateIcon}>{showAreaDropdown ? '▲' : '▼'}</Text>}
              </TouchableOpacity>
              {!!errors.area && <Text style={styles.errorText}>{errors.area}</Text>}
              {showAreaDropdown && postOffices.length > 0 && (
                <View style={styles.dropdown}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
                    {postOffices.map((office, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.dropdownItem, formData.area === office.Name && styles.dropdownItemActive]}
                        onPress={() => handleAreaSelect(office)}
                      >
                        <Text style={[styles.dropdownItemText, formData.area === office.Name && styles.dropdownItemTextActive]}>
                          {office.Name}
                        </Text>
                        <Text style={styles.dropdownItemSub}>{office.BranchType}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {renderInput('State', 'state', 'State', {
              mandatory: true,
              editable: false,
            })}
          </View>

          {/* Nominee Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Text style={styles.sectionIcon}>👥</Text>
              </View>
              <Text style={styles.sectionTitle}>Nominee Details</Text>
            </View>

            {renderInput('Nominee Name', 'nomineeName', 'Nominee full name', {
              mandatory: true,
            })}

            {renderInput('Nominee Mobile', 'nomineeMobile', '10 digit mobile', {
              mandatory: true,
              keyboardType: 'phone-pad',
              maxLength: 10,
            })}

            {/* {renderRelationshipPicker()} */}
          </View>

          {/* Action Buttons */}
          {/* <View style={styles.actionButtonsContainer}>
            <AppButton label="Clear Errors" variant="ghost" size="sm" onPress={clearAllErrors} />
          </View> */}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </KeyboardAwareScrollView>

        {/* Date Picker Modal */}
        {renderDatePicker()}
      </View>
    );
  }
);

UserRegistrationForm.displayName = 'UserRegistrationForm';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfacePage,
  },
  customHeader: {
    paddingHorizontal: SIZES.space.gutter,
    paddingVertical: SIZES.space.lg,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...ELEVATION.raised,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    ...FONTS.title,
    color: COLORS.contentBrand,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...FONTS.bodySm,
    color: COLORS.contentSecondary,
  },
  clearFormButton: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: SIZES.space.md,
    paddingVertical: SIZES.space.sm,
    borderRadius: SIZES.radius.sm,
    ...ELEVATION.raised,
  },
  clearFormButtonText: {
    color: COLORS.contentOnBrand,
    ...FONTS.bodySm,
    fontWeight: '600',
  },
  scrollContent: {
    padding: SIZES.space.gutter,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.card,
    padding: SIZES.space.lg,
    marginBottom: SIZES.space.lg,
    ...ELEVATION.raised,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.space.lg,
  },
  sectionIconContainer: {
    width: SIZES.icon.lg,
    height: SIZES.icon.lg,
    borderRadius: SIZES.radius.sm,
    backgroundColor: COLORS.brandAlpha16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.space.sm,
  },
  sectionIcon: {
    fontSize: SIZES.text.md,
  },
  sectionTitle: {
    ...FONTS.heading,
    color: COLORS.contentBrand,
  },
  inputContainer: {
    marginBottom: SIZES.space.md,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.space.xs,
  },
  label: {
    ...FONTS.bodyEmphasis,
    color: COLORS.contentPrimary,
  },
  mandatory: {
    color: COLORS.danger,
  },
  clearFieldButton: {
    paddingHorizontal: SIZES.space.sm,
    paddingVertical: SIZES.space.xs,
  },
  clearFieldText: {
    ...FONTS.label,
    color: COLORS.contentBrand,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.fieldBorder,
    borderRadius: SIZES.radius.field,
    paddingHorizontal: SIZES.space.md,
    paddingVertical: Platform.OS === 'ios' ? SIZES.space.sm : SIZES.space.xs,
    ...FONTS.body,
    color: COLORS.contentPrimary,
    backgroundColor: COLORS.fieldBackground,
    minHeight: SIZES.field.height,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  inputDisabled: {
    backgroundColor: COLORS.surfaceSunken,
    color: COLORS.contentMuted,
  },
  errorText: {
    marginTop: SIZES.space.xs,
    color: COLORS.danger,
    ...FONTS.caption,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    ...FONTS.body,
    color: COLORS.contentPrimary,
  },
  placeholderText: {
    ...FONTS.body,
    color: COLORS.contentPlaceholder,
  },
  dateIcon: {
    fontSize: SIZES.text.md,
  },
  maritalStatusContainer: {
    flexDirection: 'row',
    marginTop: SIZES.space.xs,
    gap: SIZES.space.sm,
  },
  maritalStatusButton: {
    flex: 1,
    paddingVertical: SIZES.space.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maritalStatusButtonActive: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.borderAccent,
  },
  maritalStatusText: {
    ...FONTS.body,
    color: COLORS.contentSecondary,
  },
  maritalStatusTextActive: {
    ...FONTS.bodyEmphasis,
    color: COLORS.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.space.md,
  },
  halfWidth: {
    flex: 1,
  },
  pincodeContainer: {
    position: 'relative',
  },
  pincodeLoader: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 35 : 40,
  },
  actionButtonsContainer: {
    marginTop: SIZES.space.lg,
    gap: SIZES.space.sm,
  },
  navButtonFlex: {
    flex: 1,
  },
  clearAllButton: {
    alignItems: 'center',
    paddingVertical: SIZES.space.sm,
    marginBottom: SIZES.space.xs,
  },
  clearAllButtonText: {
    color: COLORS.contentMuted,
    ...FONTS.bodySm,
  },
  bottomSpacing: {
    height: SIZES.space.xxxl,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.field,
    backgroundColor: COLORS.surface,
    marginTop: SIZES.space.xs,
    ...ELEVATION.floating,
    zIndex: 99,
  },
  dropdownItem: {
    paddingHorizontal: SIZES.space.md,
    paddingVertical: SIZES.space.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSubtle,
  },
  dropdownItemActive: {
    backgroundColor: COLORS.brandSubtle,
  },
  dropdownItemText: {
    ...FONTS.body,
    color: COLORS.contentPrimary,
  },
  dropdownItemTextActive: {
    color: COLORS.brand,
    fontFamily: FONTS.family.semiBold,
  },
  dropdownItemSub: {
    ...FONTS.caption,
    color: COLORS.contentMuted,
    marginTop: 2,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.card,
    padding: SIZES.space.lg,
    width: '90%',
    maxHeight: '80%',
    ...ELEVATION.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.space.md,
  },
  modalTitle: {
    ...FONTS.heading,
    color: COLORS.contentBrand,
  },
  closeButton: {
    fontSize: SIZES.text.xl,
    color: COLORS.contentSecondary,
    padding: SIZES.space.xs,
  },
  selectedDatePreview: {
    ...FONTS.body,
    color: COLORS.contentBrand,
    marginBottom: SIZES.space.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.space.lg,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SIZES.space.xs,
  },
  pickerLabel: {
    ...FONTS.caption,
    color: COLORS.contentSecondary,
    marginBottom: SIZES.space.xs,
  },
  pickerScrollView: {
    width: '100%',
  },
  pickerHighlight: {
    position: 'absolute',
    top: 44 * 2,
    left: 0,
    right: 0,
    height: 44,
    backgroundColor: COLORS.brand + '15',
    borderRadius: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.borderAccent + '40',
    zIndex: 1,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemSelected: {},
  pickerItemText: {
    ...FONTS.body,
    color: COLORS.contentSecondary,
    textAlign: 'center',
    fontSize: 13,
  },
  pickerItemTextSelected: {
    color: COLORS.contentBrand,
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.space.md,
    marginTop: SIZES.space.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.space.sm,
    borderRadius: SIZES.radius.field,
    backgroundColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...FONTS.body,
    color: COLORS.contentPrimary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: SIZES.space.sm,
    borderRadius: SIZES.radius.field,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...FONTS.body,
    color: COLORS.contentOnBrand,
    fontWeight: '600',
  },
});

export default UserRegistrationForm;
