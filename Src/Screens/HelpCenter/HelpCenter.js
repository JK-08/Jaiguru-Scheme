import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCompanyDetails } from '../../Services/CompanyDetailsService';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../Config/BaseUrl';
import CommonHeader from '../../Components/CommonHeader/CommonHeader';
import BottomTab from "../../Components/BottomTab/BottomTab"

// ─── Helpers ────────────────────────────────────────────────────────────────

const trimObject = (obj) =>
  Object.entries(obj).reduce((acc, [k, v]) => {
    acc[k] = typeof v === 'string' ? v.trim() : v;
    return acc;
  }, {});

const resolveLogoUrl = (c) => {
  if (c.CompanyLogoUrl?.startsWith('http')) return c.CompanyLogoUrl;
  if (c.LOGO?.startsWith('http')) return c.LOGO;
  if (c.BASEURL && c.LOGO) {
    const base = c.BASEURL.replace(/\/$/, '');
    const path = c.LOGO.startsWith('/') ? c.LOGO : `/${c.LOGO}`;
    return `${base}${path}`;
  }
  if (c.LOGO) {
    const path = c.LOGO.startsWith('/') ? c.LOGO : `/${c.LOGO}`;
    return `${IMAGE_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/uploads/companyLogo/default-logo.png`;
};

const openUrl = (url) => url?.trim() && Linking.openURL(url);
const openPhone = (phone) => Linking.openURL(`tel:${phone}`);
const openEmail = (email) => Linking.openURL(`mailto:${email}`);
const openMaps = (addr) =>
  Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);

// ─── Sub-components ─────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value, onPress, isLink, multiline }) => {
  if (!value) return null;
  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.65 : 1}
    >
      <View style={styles.iconBox}>
        <Icon name={icon} size={20} color="#6366F1" />
      </View>
      <View style={[styles.infoContent, multiline && { paddingVertical: 2 }]}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text
          style={[styles.infoValue, isLink && styles.linkText]}
          numberOfLines={multiline ? 3 : 1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      </View>
      {onPress && <Icon name="chevron-right" size={18} color="#C4B5FD" />}
    </TouchableOpacity>
  );
};

const SocialButton = ({ iconName, link, label }) => {
  if (!link) return null;
  return (
    <TouchableOpacity style={styles.socialBtn} onPress={() => openUrl(link)}>
      <MaterialCommunityIcons name={iconName} size={22} color="#6366F1" />
      <Text style={styles.socialBtnLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const AppStoreButton = ({ iconName, link, label }) => {
  if (!link) return null;
  return (
    <TouchableOpacity style={styles.appButton} onPress={() => openUrl(link)}>
      <MaterialCommunityIcons name={iconName} size={20} color="#6366F1" />
      <Text style={styles.appButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const SectionWrapper = ({ title, children }) => {
  const hasContent = React.Children.toArray(children).some((c) => c !== null && c !== false && c !== undefined);
  if (!hasContent) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

const HelpCentreScreen = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompanyDetails = useCallback(async () => {
    try {
      const data = await getCompanyDetails();
      if (!Array.isArray(data) || data.length === 0) throw new Error('No company data found');

      const cleaned = trimObject(data[0]);
      setCompany({ ...cleaned, CompanyLogoUrl: resolveLogoUrl(cleaned) });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch company details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCompanyDetails(); }, [fetchCompanyDetails]);

  const onRefresh = () => { setRefreshing(true); fetchCompanyDetails(); };

  // ── Loading ──
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading company details…</Text>
      </View>
    );
  }

  // ── Error ──
  if (error || !company) {
    return (
      <View style={styles.center}>
        <Icon name="error-outline" size={52} color="#EF4444" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMsg}>{error || 'Company details not found'}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchCompanyDetails}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Derived values ──
  const fullAddress = [company.ADDRESS1, company.ADDRESS2, company.ADDRESS3]
    .filter(Boolean).join(', ');
  const cityStateZip = [company.ADDRESS4, company.AREACODE]
    .filter(Boolean).join(' – ');
  const addressDisplay = [fullAddress, cityStateZip].filter(Boolean).join('\n');

  const isActive = company.ACTIVE === 'Y';

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader title="Help Center" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* ── Hero Banner ── */}
        <View style={styles.heroBanner}>
        </View>

        {/* ── Company Card ── */}
        <View style={styles.companyCard}>
          {company.CompanyLogoUrl ? (
            <Image
              source={{ uri: company.CompanyLogoUrl }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Icon name="business" size={44} color="#A5B4FC" />
            </View>
          )}

          {company.COMPANYNAME ? (
            <Text style={styles.companyName}>{company.COMPANYNAME}</Text>
          ) : null}

          <View style={styles.metaRow}>
            {company.COMPANYID ? <Text style={styles.metaText}>ID: {company.COMPANYID}</Text> : null}
            {company.COMPANYID && company.COSTID ? <Text style={styles.metaDivider}>·</Text> : null}
            {company.COSTID ? <Text style={styles.metaText}>{company.COSTID}</Text> : null}
          </View>

          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
            <View style={[styles.badgeDot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.badgeText}>{isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>

        {/* ── Contact ── */}
        <SectionWrapper title="📞 Contact Information">
          <InfoRow
            icon="phone"
            label="Phone"
            value={company.PHONE}
            onPress={company.PHONE ? () => openPhone(company.PHONE) : null}
            isLink
          />
          <InfoRow
            icon="email"
            label="Email"
            value={company.EMAIL}
            onPress={company.EMAIL ? () => openEmail(company.EMAIL) : null}
            isLink
          />
          <InfoRow
            icon="location-on"
            label="Address"
            value={addressDisplay}
            onPress={addressDisplay ? () => openMaps(addressDisplay) : null}
            isLink
            multiline
          />
        </SectionWrapper>

        {/* ── Tax ── */}
        <SectionWrapper title="💰 Tax Information">
          <InfoRow icon="qr-code"              label="GST No"       value={company.GSTNO} />
          <InfoRow icon="assignment"           label="PAN No"       value={company.PANNO} />
          <InfoRow icon="local-offer"          label="TIN No"       value={company.TINNO} />
          <InfoRow icon="receipt"              label="TAN No"       value={company.TANNO} />
          <InfoRow icon="local-atm"            label="TDS No"       value={company.TDSNO} />
          <InfoRow icon="confirmation-number"  label="CST No"       value={company.CSTNO} />
          <InfoRow icon="local-taxi"           label="Local Tax No" value={company.LOCALTAXNO} />
        </SectionWrapper>

        {/* ── Digital Presence ── */}
        <SectionWrapper title="🌐 Digital Presence">
          <InfoRow
            icon="language"
            label="Website"
            value={company.BASEURL ? company.BASEURL.replace(/^https?:\/\//, '') : null}
            onPress={company.BASEURL ? () => openUrl(company.BASEURL) : null}
            isLink
          />

          {/* Social Media – only render row if at least one link exists */}
          {(company.FACEBOOKLINK || company.TWITTERLINK || company.INSTALINK ||
            company.YOUTUBELINK || company.WHATSAPPLINK) && (
            <View style={styles.socialSection}>
              <Text style={styles.subSectionLabel}>Social Media</Text>
              <View style={styles.socialGrid}>
                <SocialButton iconName="facebook"  link={company.FACEBOOKLINK}  label="Facebook" />
                <SocialButton iconName="twitter"   link={company.TWITTERLINK}   label="Twitter" />
                <SocialButton iconName="instagram" link={company.INSTALINK}     label="Instagram" />
                <SocialButton iconName="youtube"   link={company.YOUTUBELINK}   label="YouTube" />
                <SocialButton iconName="whatsapp"  link={company.WHATSAPPLINK}  label="WhatsApp" />
              </View>
            </View>
          )}

          {/* App Store Links */}
          {(company.ANDROIDLINK || company.APPSTORELINK) && (
            <View style={styles.appSection}>
              <Text style={styles.subSectionLabel}>Mobile Apps</Text>
              <View style={styles.appRow}>
                <AppStoreButton iconName="google-play" link={company.ANDROIDLINK}  label="Android App" />
                <AppStoreButton iconName="apple"       link={company.APPSTORELINK} label="iOS App" />
              </View>
            </View>
          )}

          <InfoRow
            icon="business-center"
            label="Google Business"
            value={company.GOOGLEBUSINESSLINK ? 'View on Google Maps' : null}
            onPress={company.GOOGLEBUSINESSLINK ? () => openUrl(company.GOOGLEBUSINESSLINK) : null}
            isLink
          />
        </SectionWrapper>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Icon name="support-agent" size={28} color="#6366F1" />
          <Text style={styles.footerTitle}>Need more help?</Text>
          <Text style={styles.footerSub}>Contact us through any of the channels above</Text>
        </View>
      </ScrollView>
      <BottomTab activeScreen={"SUPPORT"} />
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const INDIGO = '#6366F1';
const INDIGO_LIGHT = '#EEF2FF';
const SURFACE = '#FFFFFF';
const BG = '#F5F5F9';
const TEXT_PRIMARY = '#1E1B4B';
const TEXT_SECONDARY = '#6B7280';
const BORDER = '#E5E7EB';

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: BG },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG, padding: 24 },

  // Loading / Error
  loadingText:  { marginTop: 12, fontSize: 15, color: TEXT_SECONDARY },
  errorTitle:   { marginTop: 16, fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY },
  errorMsg:     { marginTop: 8, fontSize: 14, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 20 },
  retryBtn:     { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, backgroundColor: INDIGO, borderRadius: 10 },
  retryBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  // Hero
  heroBanner:   { backgroundColor: INDIGO, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32 },
  heroTitle:    { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 14, color: '#C7D2FE', marginTop: 4 },

  // Company Card
  companyCard:  {
    backgroundColor: SURFACE,
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 12,
  },
  logo:            { width: 100, height: 100, borderRadius: 50, backgroundColor: INDIGO_LIGHT },
  logoPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: INDIGO_LIGHT, justifyContent: 'center', alignItems: 'center' },
  companyName:     { fontSize: 20, fontWeight: '700', color: TEXT_PRIMARY, marginTop: 12, textAlign: 'center' },
  metaRow:         { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText:        { fontSize: 13, color: TEXT_SECONDARY },
  metaDivider:     { fontSize: 13, color: TEXT_SECONDARY, marginHorizontal: 6 },
  badge:           { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeActive:     { backgroundColor: '#ECFDF5' },
  badgeInactive:   { backgroundColor: '#FEF2F2' },
  badgeDot:        { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  badgeText:       { fontSize: 12, color: TEXT_SECONDARY, fontWeight: '500' },

  // Section
  section:      { backgroundColor: SURFACE, marginBottom: 10, paddingBottom: 4 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    letterSpacing: 0.1,
  },

  // InfoRow
  infoRow:     {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  iconBox:     {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: INDIGO_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel:   { fontSize: 11, color: TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue:   { fontSize: 15, color: TEXT_PRIMARY, fontWeight: '500' },
  linkText:    { color: INDIGO },

  // Social
  socialSection:     { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  subSectionLabel:   { fontSize: 13, fontWeight: '600', color: TEXT_SECONDARY, marginBottom: 10 },
  socialGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  socialBtn:         {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: INDIGO_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  socialBtnLabel:    { fontSize: 13, color: INDIGO, fontWeight: '500' },

  // App buttons
  appSection:    { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 14 },
  appRow:        { flexDirection: 'row', gap: 10 },
  appButton:     {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: INDIGO_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  appButtonText: { color: INDIGO, fontSize: 14, fontWeight: '500' },

  // Footer
  footer:     {
    backgroundColor: SURFACE,
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  footerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY },
  footerSub:   { fontSize: 13, color: TEXT_SECONDARY },
});

export default HelpCentreScreen;