import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SIZES, FONTS, SHADOWS, moderateScale } from '../../../Utills/AppTheme';
import { useUsersList } from '../../../Hooks/useLoginCheck';
import CommonHeader from '../../../Components/CommonHeader/CommonHeader';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

const LoginCheckScreen = () => {
  const [authVisible, setAuthVisible] = useState(true);
  const [inputUser, setInputUser] = useState('');
  const [inputPass, setInputPass] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  const { users, loading: usersLoading, refetch } = useUsersList('', date, date);

  const onDateChange = (event, selected) => {
    setShowPicker(Platform.OS === 'ios');
    if (selected) {
      const formatted = selected.toISOString().split('T')[0];
      setPickerDate(selected);
      setDate(formatted);
    }
  };

  const filteredUsers = (users || []);
  const handleLogin = () => {
    if (inputUser === ADMIN_USERNAME && inputPass === ADMIN_PASSWORD) {
      setAuthVisible(false);
    } else {
      Alert.alert('Invalid Credentials', 'Username or password is incorrect.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
 <CommonHeader title="Login Check"  />
      {/* Admin Login Modal */}
      <Modal transparent visible={authVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Admin Login</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter username"
              placeholderTextColor={COLORS.inputPlaceholder}
              value={inputUser}
              onChangeText={setInputUser}
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor={COLORS.inputPlaceholder}
              value={inputPass}
              onChangeText={setInputPass}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      {!authVisible && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
         
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.headerBar} />
              <Text style={styles.cardTitle}>Login Records</Text>
            </View>

            {/* Date Filter */}
           
            <View style={styles.filterRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: SIZES.xs}}>
                 <Text style={styles.label1}>Date</Text>
              <TouchableOpacity
                style={[styles.input, styles.dateInput, styles.datePickerBtn]}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dateText}>📅  {date}</Text>
              </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.fetchBtn}
                onPress={refetch}
                activeOpacity={0.8}
              >
                <Text style={styles.fetchBtnText}>Fetch</Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}

            {/* Table */}
            {usersLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
            ) : filteredUsers.length === 0 ? (
              <Text style={styles.emptyText}>No records found</Text>
            ) : (
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableHeaderText, styles.colId]}>#</Text>
                  <Text style={[styles.tableHeaderText, styles.colName]}>Name</Text>
                  <Text style={[styles.tableHeaderText, styles.colMobile]}>Mobile</Text>
                  <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
                </View>
                {filteredUsers.map((item, index) => (
                  <View
                    key={item.ID.toString()}
                    style={[
                      styles.tableRow,
                      item.CREATED_AT ? styles.tableRowValue : styles.tableRowNull,
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.colId, item.CREATED_AT ? styles.tableCellValue : styles.tableCellNull]}>#{item.ID}</Text>
                    <Text style={[styles.tableCell, styles.colName, item.CREATED_AT ? styles.tableCellValue : styles.tableCellNull]} numberOfLines={1}>{item.USERNAME}</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.MOBILE_NUMBER}`)}>
                      <Text style={[styles.tableCell, styles.colMobile, item.CREATED_AT ? styles.tableCellValue : styles.tableCellNull, styles.callText]}>{item.MOBILE_NUMBER}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.tableCell, styles.colDate, item.CREATED_AT ? styles.tableCellValue : styles.tableCellNull]}>{item.CREATED_AT || '—'}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default LoginCheckScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  scroll: {
    padding: SIZES.padding.lg,
    paddingBottom: moderateScale(40),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.blackOpacity50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xxl,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.margin.lg,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.md,
    borderRadius: SIZES.radius.button,
    alignItems: 'center',
    marginTop: SIZES.sm,
    ...SHADOWS.blue,
  },
  modalBtnText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.white,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.card,
    padding: SIZES.padding.lg,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin.lg,
  },
  headerBar: {
    width: moderateScale(4),
    height: moderateScale(20),
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius.full,
    marginRight: SIZES.sm,
  },
  cardTitle: {
    fontFamily: FONTS.family.bold,
    fontSize: SIZES.font.xl,
    color: COLORS.primary,
  },

  // Filter
  label: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  label1: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
    paddingRight: SIZES.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    marginBottom: SIZES.margin.md,
    justifyContent: 'space-between',
  },
  datePickerBtn: {
    justifyContent: 'center',
    marginBottom: 0,
  },
  dateText: {
    fontFamily: FONTS.family.medium,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
  },
  fetchBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding.lg,
    height: SIZES.input.height,
    borderRadius: SIZES.radius.button,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.blue,
  },
  fetchBtnText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.md,
    color: COLORS.white,
  },

  // Input
  input: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: SIZES.radius.input,
    paddingHorizontal: SIZES.padding.md,
    height: SIZES.input.height,
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.inputBackground,
    marginBottom: SIZES.margin.sm,
  },

  // Table
  loader: {
    marginTop: SIZES.margin.lg,
  },
  emptyText: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.md,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SIZES.margin.lg,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.md,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.padding.sm,
    paddingHorizontal: SIZES.padding.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: COLORS.primaryPale,
  },
  tableRowNull: {
    backgroundColor: COLORS.primaryLighter,
  },
  tableRowValue: {
    backgroundColor: COLORS.secondaryLighter,
  },
  tableHeader: {
    backgroundColor: COLORS.primary,
  },
  tableHeaderText: {
    fontFamily: FONTS.family.semiBold,
    fontSize: SIZES.font.sm,
    color: COLORS.white,
  },
  tableCell: {
    fontFamily: FONTS.family.regular,
    fontSize: SIZES.font.sm,
    color: COLORS.textPrimary,
  },
  tableCellNull: {
    color: COLORS.white,
    fontFamily: FONTS.family.semiBold,
  },
  tableCellValue: {
    color: COLORS.gray800,
    fontFamily: FONTS.family.semiBold,
  },
  callText: {
    fontWeight: 'bold',
  },
  colName:   { flex: 1, paddingHorizontal: SIZES.xs },
  colMobile: { width: moderateScale(100) },
  colDate:   { width: moderateScale(80) },
});
