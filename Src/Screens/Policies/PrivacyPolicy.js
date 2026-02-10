// PrivacyPolicy.js
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../../Utills/AppTheme";
import CommonHeader from '../../Components/CommonHeader/CommonHeader'

const PrivacyPolicy = ({ navigation }) => {
  const {
    COLORS,
    SIZES,
    FONTS,
    SHADOWS,
    COMMON_STYLES,
    moderateScale,
  } = theme;

  const openEmail = () => {
    Linking.openURL("mailto:privacy@sandiyafoundations.com");
  };

  const openWebsite = () => {
    Linking.openURL("https://www.sandiyafoundations.com");
  };

  const PolicySection = ({ title, children, isLast = false }) => (
    <View style={{ marginBottom: isLast ? 0 : SIZES.padding.xl }}>
      <Text
        style={{
          ...FONTS.h4,
          color: COLORS.primary,
          marginBottom: SIZES.padding.md,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );

  const BulletPoint = ({ text, style = {} }) => (
    <View style={{ flexDirection: "row", marginBottom: SIZES.padding.sm }}>
      <Text
        style={{
          ...FONTS.body,
          color: COLORS.textSecondary,
          marginRight: SIZES.padding.sm,
        }}
      >
        •
      </Text>
      <Text
        style={{
          ...FONTS.body,
          color: COLORS.textSecondary,
          flex: 1,
          ...style,
        }}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={COMMON_STYLES.container}>
      <CommonHeader
        title="Privacy Policy"
        onBack={() => navigation.goBack()}
        backgroundColor={COLORS.background}
        titleColor={COLORS.primary}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: SIZES.padding.container,
          paddingBottom: SIZES.padding.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Company Header */}
        <View
          style={{
            alignItems: "center",
            marginBottom: SIZES.padding.xl,
            padding: SIZES.padding.lg,
            backgroundColor: COLORS.primaryPale,
            borderRadius: SIZES.radius.lg,
            ...SHADOWS.sm,
          }}
        >
          <View
            style={{
              width: moderateScale(60),
              height: moderateScale(60),
              borderRadius: SIZES.radius.lg,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: SIZES.padding.md,
            }}
          >
            <Text
              style={{
                fontSize: SIZES.font.xxl,
                color: COLORS.white,
                fontWeight: "bold",
              }}
            >
              SF
            </Text>
          </View>
          <Text style={{ ...FONTS.h4, color: COLORS.primary, textAlign: "center" }}>
            SANDIYA FOUNDATIONS CHENNAI LLP
          </Text>
          <Text
            style={{
              ...FONTS.bodySmall,
              color: COLORS.textSecondary,
              textAlign: "center",
              marginTop: SIZES.padding.xs,
            }}
          >
            Last Updated: {new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* Introduction */}
        <PolicySection title="1. Introduction">
          <Text
            style={{
              ...FONTS.body,
              color: COLORS.textSecondary,
              marginBottom: SIZES.padding.sm,
            }}
          >
            At SANDIYA FOUNDATIONS CHENNAI LLP, we prioritize your privacy. This policy details how we collect, use, and protect your information when you engage with our services.
          </Text>
        </PolicySection>

        {/* Data Collected */}
        <PolicySection title="2. Data Collected">
          <Text
            style={{
              ...FONTS.body,
              color: COLORS.textSecondary,
              marginBottom: SIZES.padding.md,
            }}
          >
            We collect essential information to deliver our services effectively:
          </Text>
          
          <BulletPoint text="Name and contact information" />
          <BulletPoint text="Email address and phone number" />
          <BulletPoint text="Service address and location details" />
          <BulletPoint text="Payment information (securely processed via trusted gateways)" />
          <BulletPoint text="Technical data (cookies and browser information)" />
        </PolicySection>

        {/* How We Use Your Data */}
        <PolicySection title="3. How We Use Your Data">
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SIZES.padding.sm }}>
            <Text style={{ ...FONTS.body, color: COLORS.success, marginRight: SIZES.padding.sm }}>✓</Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary, flex: 1 }}>
              To process service requests and transactions
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SIZES.padding.sm }}>
            <Text style={{ ...FONTS.body, color: COLORS.success, marginRight: SIZES.padding.sm }}>✓</Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary, flex: 1 }}>
              For client communication and support
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SIZES.padding.sm }}>
            <Text style={{ ...FONTS.body, color: COLORS.success, marginRight: SIZES.padding.sm }}>✓</Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary, flex: 1 }}>
              To enhance service delivery and user experience
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: SIZES.padding.sm }}>
            <Text style={{ ...FONTS.body, color: COLORS.success, marginRight: SIZES.padding.sm }}>✓</Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary, flex: 1 }}>
              For business analytics and operational improvement
            </Text>
          </View>
          
          <View style={{ marginTop: SIZES.padding.md }}>
            <Text
              style={{
                ...FONTS.body,
                color: COLORS.primary,
                fontStyle: "italic",
              }}
            >
              We process only data essential for service provision.
            </Text>
          </View>
        </PolicySection>

        {/* Data Sharing */}
        <PolicySection title="4. Data Sharing">
          <Text
            style={{
              ...FONTS.body,
              color: COLORS.textSecondary,
              marginBottom: SIZES.padding.md,
            }}
          >
            We Do Not
          </Text>
          
          <View
            style={{
              backgroundColor: COLORS.error + "20",
              padding: SIZES.padding.md,
              borderRadius: SIZES.radius.md,
              marginBottom: SIZES.padding.lg,
            }}
          >
            <BulletPoint text="Sell or rent personal data" />
            <BulletPoint text="Share with unauthorized third parties" />
          </View>

          <Text
            style={{
              ...FONTS.body,
              color: COLORS.textSecondary,
              marginBottom: SIZES.padding.md,
            }}
          >
            We May Share With
          </Text>
          
          <View
            style={{
              backgroundColor: COLORS.success + "20",
              padding: SIZES.padding.md,
              borderRadius: SIZES.radius.md,
            }}
          >
            <BulletPoint text="Service providers for operational needs" />
            <BulletPoint text="Payment processing partners" />
            <BulletPoint text="Legal entities when required" />
          </View>

          <Text
            style={{
              ...FONTS.bodySmall,
              color: COLORS.textTertiary,
              marginTop: SIZES.padding.md,
              fontStyle: "italic",
            }}
          >
            All partners are contractually bound to protect your data.
          </Text>
        </PolicySection>

        {/* Security Measures */}
        <PolicySection title="5. Security Measures">
          <View
            style={{
              ...COMMON_STYLES.card.blueLight,
              marginBottom: SIZES.padding.lg,
            }}
          >
            <Text
              style={{
                ...FONTS.label,
                color: COLORS.primary,
                marginBottom: SIZES.padding.sm,
              }}
            >
              Encryption
            </Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary }}>
              All data transmissions use SSL encryption
            </Text>
          </View>

          <View
            style={{
              ...COMMON_STYLES.card.blueLight,
              marginBottom: SIZES.padding.lg,
            }}
          >
            <Text
              style={{
                ...FONTS.label,
                color: COLORS.primary,
                marginBottom: SIZES.padding.sm,
              }}
            >
              Data Storage
            </Text>
            <Text style={{ ...FONTS.body, color: COLORS.textSecondary }}>
              Information stored on secured servers with monitoring
            </Text>
          </View>

          <View
            style={{
              backgroundColor: COLORS.warning + "10",
              padding: SIZES.padding.md,
              borderRadius: SIZES.radius.md,
              borderLeftWidth: 4,
              borderLeftColor: COLORS.warning,
            }}
          >
            <Text
              style={{
                ...FONTS.bodySmall,
                color: COLORS.textSecondary,
                fontStyle: "italic",
              }}
            >
              While we implement robust security, no internet transmission is entirely risk-free.
            </Text>
          </View>
        </PolicySection>

        {/* Cookies */}
        <PolicySection title="6. Cookies" isLast={true}>
          <Text
            style={{
              ...FONTS.body,
              color: COLORS.textSecondary,
              marginBottom: SIZES.padding.md,
            }}
          >
            Our website utilizes cookies for:
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: SIZES.padding.lg,
            }}
          >
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                Performance
              </Text>
            </View>
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                Site functionality
              </Text>
            </View>
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                Analytics
              </Text>
            </View>
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                Visitor insights
              </Text>
            </View>
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                Personalization
              </Text>
            </View>
            <View
              style={{
                ...COMMON_STYLES.chip.blue,
                marginRight: SIZES.padding.sm,
                marginBottom: SIZES.padding.sm,
              }}
            >
              <Text style={{ ...FONTS.bodySmall, color: COLORS.primary }}>
                User preferences
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: COLORS.info + "10",
              padding: SIZES.padding.md,
              borderRadius: SIZES.radius.md,
              marginBottom: SIZES.padding.lg,
            }}
          >
            <Text
              style={{
                ...FONTS.body,
                color: COLORS.textSecondary,
                marginBottom: SIZES.padding.sm,
              }}
            >
              You may disable cookies in browser settings, though some features may be limited.
            </Text>
          </View>
        </PolicySection>

        {/* Contact Information */}
        <View
          style={{
            ...COMMON_STYLES.card.default,
            backgroundColor: COLORS.primaryPale,
            alignItems: "center",
            marginTop: SIZES.padding.xl,
            marginBottom: SIZES.padding.xl,
          }}
        >
          <Text
            style={{
              ...FONTS.h5,
              color: COLORS.primary,
              marginBottom: SIZES.padding.lg,
              textAlign: "center",
            }}
          >
            Contact Information
          </Text>
          
          <Text
            style={{
              ...FONTS.bodyMedium,
              color: COLORS.primary,
              marginBottom: SIZES.padding.sm,
              textAlign: "center",
            }}
          >
            For privacy-related inquiries:
          </Text>
          <TouchableOpacity onPress={openEmail}>
            <Text
              style={{
                ...FONTS.body,
                color: COLORS.primary,
                textDecorationLine: "underline",
                marginBottom: SIZES.padding.md,
              }}
            >
              privacy@sandiyafoundations.com
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openWebsite}>
            <Text
              style={{
                ...FONTS.bodySmall,
                color: COLORS.textSecondary,
                textDecorationLine: "underline",
              }}
            >
              www.sandiyafoundations.com
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;