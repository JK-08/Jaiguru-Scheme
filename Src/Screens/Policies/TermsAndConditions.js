// AdvanceJewelleryPlanTerms.js
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../../Utills/AppTheme";
import CommonHeader from '../../Components/CommonHeader/CommonHeader';

const TermsAndConditions = ({ navigation }) => {
  const [language, setLanguage] = useState("english"); // Default to English

  const {
    COLORS,
    SIZES,
    FONTS,
    SHADOWS,
    COMMON_STYLES,
    moderateScale,
  } = theme;

  const termsData = {
    english: {
      title: "Advance Jewellery Purchase Plan (15 Months)",
      sections: [
        {
          title: "Payment Terms",
          points: [
            "The monthly advance against jewellery purchase must be equal and paid continuously for 15 months.",
            "This is an 'Advance Purchase Weight Accumulation Plan.'",
          ]
        },
        {
          title: "Plan Benefits",
          points: [
            "Plain Gold Jewellery – 50% off on wastage charges.",
            "Antique, Heritage & Seasonal Festive Jewellery – 50% off on wastage charges.",
          ]
        },
        {
          title: "Payment Details",
          points: [
            "Advance amount can be paid in multiples of ₹1000 (₹1000, ₹2000, ₹3000, etc.).",
            "Gold weight will be calculated on each monthly installment paid over the 15-month period.",
            "Monthly advance must be paid on or before the 10th of every month; delayed payments will not earn any interest.",
          ]
        },
        {
          title: "Redemption Process",
          points: [
            "Customer will be provided with a receipt book for payment and redemption.",
            "KYC is compulsory for enrollment, loss of card, and redemption.",
            "Members can redeem the plan only after completing 15 months of payment.",
          ]
        },
        {
          title: "Accepted Payment Methods",
          points: [
            "Cash",
            "Credit Card",
            "Debit Card",
            "NEFT",
            "RTGS",
            "GPay",
          ]
        },
        {
          title: "Jewellery Specifications",
          points: [
            "The plan applies to Antique, Ruby, and Emerald jewellery with 50% wastage charges.",
            "Semi-precious and precious stone charges are applicable separately.",
            "Jewellery can be selected only from available ready-made stock.",
          ]
        },
        {
          title: "Important Terms",
          points: [
            "The plan is unique and non-transferable.",
            "Other discounts and seasonal offers cannot be combined with this plan.",
            "Cash refund will not be provided under any circumstances.",
          ]
        },
        {
          title: "Gold Weight Redemption",
          points: [
            "Accumulated weight can be redeemed to purchase gold jewellery equal to or higher in weight.",
            "Applicable wastage, making charges, stone charges, and 3% GST will be borne by the customer.",
            "Any increase or decrease in gold price will be calculated only at the time of redemption after completion of 15 months.",
          ]
        },
        {
          title: "Company Policies",
          points: [
            "The company's decision regarding plan rules, jewellery redemption, and related matters shall be final.",
            "GST, hallmarking, and any other government taxes must be borne by the customer.",
            "The company reserves the right to alter, amend, modify, or delete any terms and conditions at its discretion.",
          ]
        }
      ]
    },
    tamil: {
      title: "Advance Jewellery Purchase Plan (15 மாதங்கள்)",
      sections: [
        {
          title: "கட்டண விதிமுறைகள்",
          points: [
            "நகை வாங்குவதற்கான மாதாந்திர முன்பணம் 15 மாதங்கள் தொடர்ந்து சமமாக செலுத்தப்பட வேண்டும்.",
            "இது 'Advance Purchase Weight Accumulation Plan' ஆகும்.",
          ]
        },
        {
          title: "திட்ட நன்மைகள்",
          points: [
            "Plain Gold Jewellery – வீஸ்டேஜ் கட்டணத்தில் 50% தள்ளுபடி.",
            "Antique / Heritage / Seasonal Festive Jewellery – வீஸ்டேஜ் கட்டணத்தில் 50% தள்ளுபடி.",
          ]
        },
        {
          title: "கட்டண விவரங்கள்",
          points: [
            "முன்பணம் ₹1000ன் பலவாக (₹1000, ₹2000, ₹3000 போன்றவை) செலுத்தலாம்.",
            "15 மாத காலத்தில் ஒவ்வொரு மாதமும் செலுத்தப்படும் தொகையின் அடிப்படையில் தங்க எடை கணக்கிடப்படும்.",
            "ஒவ்வொரு மாதமும் 10ஆம் தேதிக்குள் அல்லது அதற்கு முன் முன்பணம் செலுத்த வேண்டும்; தாமதமானால் வட்டி வழங்கப்படாது.",
          ]
        },
        {
          title: "மீட்பு செயல்முறை",
          points: [
            "கட்டணம் செலுத்தவும், மீட்பு செய்யவும் வாடிக்கையாளருக்கு ரிசீப்ட் புத்தகம் வழங்கப்படும்.",
            "சேர்க்கை, கார்டு இழப்பு அல்லது மீட்பிற்கு KYC கட்டாயம்.",
            "15 மாதங்கள் முடிந்த பின் மட்டுமே திட்டத்தை மீட்பு செய்யலாம்.",
          ]
        },
        {
          title: "ஏற்றுக்கொள்ளப்பட்ட கட்டண முறைகள்",
          points: [
            "Cash",
            "Credit Card",
            "Debit Card",
            "NEFT",
            "RTGS",
            "GPay",
          ]
        },
        {
          title: "நகை விவரக்குறிப்புகள்",
          points: [
            "Antique, Ruby, Emerald நகைகளுக்கு 50% வீஸ்டேஜ் தள்ளுபடி பொருந்தும்.",
            "விலைமதிப்புள்ள கற்களின் (Precious Stones) கட்டணங்கள் தனியாக வசூலிக்கப்படும்.",
            "நகை விநியோகம் கிடைக்கப்பெறும் தயாரான ஸ்டாக்கை அடிப்படையாகக் கொண்டது.",
          ]
        },
        {
          title: "முக்கிய விதிமுறைகள்",
          points: [
            "இந்த திட்டம் தனிப்பட்டது; மாற்ற முடியாது.",
            "வேறு எந்த தள்ளுபடிகளும் / சலுகைகளும் இந்த திட்டத்துடன் இணைக்க முடியாது.",
            "எந்த சூழலிலும் பணம் திருப்பி வழங்கப்படாது.",
          ]
        },
        {
          title: "தங்க எடை மீட்பு",
          points: [
            "முன்பணம் மூலம் சேர்க்கப்பட்ட எடையை அதற்கு சமமான அல்லது அதிக எடையுள்ள நகை வாங்க மட்டுமே பயன்படுத்தலாம்.",
            "வீஸ்டேஜ், மேக்கிங் சார்ஜ், கற்கள் கட்டணம் மற்றும் 3% GST கூடுதலாக வசூலிக்கப்படும்.",
            "தங்க விலை உயர்வு அல்லது தாழ்வு ஏற்பட்டாலும், 15 மாதங்கள் முடிந்து மீட்பு செய்யும் நேரத்தில் உள்ள தங்க விலையே கணக்கில் கொள்ளப்படும்.",
          ]
        },
        {
          title: "நிறுவன கொள்கைகள்",
          points: [
            "திட்டம் தொடர்பான விதிமுறைகள், நிபந்தனைகள் மற்றும் நகை மீட்பு குறித்து நிறுவனத்தின் முடிவே இறுதி.",
            "GST / முத்திரை / பிற அரசு வரிகள் வாடிக்கையாளரால் செலுத்தப்பட வேண்டும்.",
            "நிறுவனத்திற்கு எந்த நேரத்திலும் விதிமுறைகளை மாற்ற / திருத்த / புதுப்பிக்கும் உரிமை உண்டு.",
          ]
        }
      ]
    }
  };

  const currentTerms = termsData[language];

  const LanguageToggle = () => (
    <View style={styles.languageToggleContainer}>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'english' && styles.activeLanguageButton
        ]}
        onPress={() => setLanguage('english')}
      >
        <Text style={[
          styles.languageButtonText,
          language === 'english' && styles.activeLanguageButtonText
        ]}>
          English
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.languageButton,
          language === 'tamil' && styles.activeLanguageButton
        ]}
        onPress={() => setLanguage('tamil')}
      >
        <Text style={[
          styles.languageButtonText,
          language === 'tamil' && styles.activeLanguageButtonText
        ]}>
          தமிழ்
        </Text>
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    scrollContent: {
      padding: SIZES.padding.container,
      paddingBottom: SIZES.padding.xxxl,
    },
    languageToggleContainer: {
      flexDirection: 'row',
      backgroundColor: COLORS.gray100,
      borderRadius: SIZES.radius.lg,
      padding: SIZES.padding.xs,
      marginBottom: SIZES.padding.xl,
      ...SHADOWS.xs,
    },
    languageButton: {
      flex: 1,
      paddingVertical: SIZES.padding.sm,
      borderRadius: SIZES.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeLanguageButton: {
      backgroundColor: COLORS.primary,
      ...SHADOWS.sm,
    },
    languageButtonText: {
      ...FONTS.bodyMedium,
      color: COLORS.textSecondary,
    },
    activeLanguageButtonText: {
      color: COLORS.white,
      fontWeight: '600',
    },
    planHeader: {
      alignItems: "center",
      marginBottom: SIZES.padding.xl,
      padding: SIZES.padding.lg,
      backgroundColor: COLORS.primaryPale,
      borderRadius: SIZES.radius.lg,
      ...SHADOWS.sm,
    },
    logoContainer: {
      width: moderateScale(70),
      height: moderateScale(70),
      borderRadius: SIZES.radius.lg,
      backgroundColor: COLORS.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SIZES.padding.md,
      ...SHADOWS.md,
    },
    logoText: {
      fontSize: SIZES.font.xxxl,
      color: COLORS.goldPrimary,
      fontWeight: "bold",
    },
    planTitle: {
      ...FONTS.h4,
      color: COLORS.primary,
      textAlign: "center",
      marginBottom: SIZES.padding.xs,
    },
    planSubtitle: {
      ...FONTS.bodyMedium,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: SIZES.padding.sm,
    },
    lastUpdated: {
      ...FONTS.caption,
      color: COLORS.textTertiary,
      textAlign: "center",
    },
    sectionCard: {
      ...COMMON_STYLES.card.elevated,
      marginBottom: SIZES.padding.lg,
      borderWidth: 1,
      borderColor: COLORS.borderLight,
    },
    sectionHeader: {
      padding: SIZES.padding.md,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.borderLight,
      backgroundColor: COLORS.primaryPale,
      borderTopLeftRadius: SIZES.radius.md,
      borderTopRightRadius: SIZES.radius.md,
    },
    sectionTitle: {
      ...FONTS.h5,
      color: COLORS.primary,
    },
    sectionContent: {
      padding: SIZES.padding.md,
    },
    bulletItem: {
      flexDirection: "row",
      marginBottom: SIZES.padding.sm,
      alignItems: "flex-start",
    },
    bullet: {
      ...FONTS.body,
      color: COLORS.primary,
      marginRight: SIZES.padding.sm,
      marginTop: 2,
    },
    bulletText: {
      ...FONTS.body,
      color: COLORS.textSecondary,
      flex: 1,
      lineHeight: SIZES.font.body * 1.4,
    },
    disclaimerCard: {
      ...COMMON_STYLES.card.default,
      backgroundColor: COLORS.goldLight,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.goldPrimary,
      marginTop: SIZES.padding.xl,
      marginBottom: SIZES.padding.xl,
    },
    disclaimerTitle: {
      ...FONTS.bodyBold,
      color: COLORS.primary,
      marginBottom: SIZES.padding.sm,
    },
    disclaimerText: {
      ...FONTS.body,
      color: COLORS.textSecondary,
      fontStyle: "italic",
      lineHeight: SIZES.font.body * 1.4,
    },
    contactSection: {
      ...COMMON_STYLES.card.default,
      backgroundColor: COLORS.primaryPale,
      borderWidth: 1,
      borderColor: COLORS.primary + "20",
      alignItems: "center",
      padding: SIZES.padding.lg,
    },
    contactTitle: {
      ...FONTS.h5,
      color: COLORS.primary,
      textAlign: "center",
      marginBottom: SIZES.padding.lg,
    },
    contactText: {
      ...FONTS.body,
      color: COLORS.textSecondary,
      textAlign: "center",
      marginBottom: SIZES.padding.md,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader
        title="Terms & Conditions"
        onBack={() => navigation.goBack()}
        backgroundColor={COLORS.background}
        titleColor={COLORS.primary}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Toggle */}
        <LanguageToggle />

        {/* Plan Header */}
        <View style={styles.planHeader}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>SF</Text>
          </View>
          <Text style={styles.planTitle}>{currentTerms.title}</Text>
          <Text style={styles.planSubtitle}>
            {language === 'english' ? 'Terms & Conditions' : 'விதிமுறைகள் மற்றும் நிபந்தனைகள்'}
          </Text>
          <Text style={styles.lastUpdated}>
            {language === 'english' ? 'Effective Date: ' : 'செயல்படு தேதி: '}
            {new Date().toLocaleDateString("en-IN", {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </Text>
        </View>

        {/* Terms Sections */}
        {currentTerms.sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionContent}>
              {section.points.map((point, pointIndex) => (
                <View key={pointIndex} style={styles.bulletItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>
            {language === 'english' ? 'Important Note' : 'முக்கிய குறிப்பு'}
          </Text>
          <Text style={styles.disclaimerText}>
            {language === 'english' 
              ? 'Please read these terms carefully. By participating in this plan, you agree to be bound by all the terms and conditions mentioned above.'
              : 'இந்த விதிமுறைகளை கவனமாக படியுங்கள். இந்த திட்டத்தில் பங்கேற்பதன் மூலம், மேலே குறிப்பிடப்பட்ட அனைத்து விதிமுறைகளுக்கும் நீங்கள் உட்பட்டவராகிறீர்கள்.'
            }
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>
            {language === 'english' ? 'For More Information' : 'மேலும் தகவலுக்கு'}
          </Text>
          <Text style={styles.contactText}>
            {language === 'english' 
              ? 'Visit our store or contact customer support for clarification on any terms.'
              : 'எந்தவொரு விதிமுறைகள் குறித்த தெளிவுக்கும் எங்கள் கடையை பார்வையிடவும் அல்லது வாடிக்கையாளர் ஆதரவைத் தொடர்பு கொள்ளவும்.'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditions;