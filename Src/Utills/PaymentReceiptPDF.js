// PaymentReceiptPDF.js - Updated for Expo SDK 54 with new FileSystem API
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import { Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { getCompanyDetails } from "../Services/CompanyDetailsService";
// import * as FileSystem from 'expo-file-system';

class PaymentReceiptPDF {
  // Constants
  static STORAGE_KEYS = {
    DOWNLOAD_DIR: "JAIGURU_DOWNLOAD_DIR",
  };

  static ASSETS = {
    BACKGROUND: require("../../assets/icon.png"),
    LOGO: require("../../assets/icon.png"),
  };

  // ---------------------------------------------------------------------------
  // COMPANY DATA MANAGEMENT - FETCH FROM SERVICE
  // ---------------------------------------------------------------------------
  static async getCompanyData() {
    try {
      console.log("🔄 Fetching company data from service...");
      
      const data = await getCompanyDetails();
      
      if (Array.isArray(data) && data.length > 0) {
        const companyData = data[0];
        
        // Clean the data (trim strings)
        const cleanedCompany = Object.keys(companyData).reduce((acc, key) => {
          const value = companyData[key];
          if (value === null || value === undefined) {
            acc[key] = value;
          } else if (typeof value === "string") {
            acc[key] = value.trim();
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});

        console.log("✅ Company data fetched successfully:", {
          name: cleanedCompany.COMPANYNAME,
          gst: cleanedCompany.GSTNO,
          id: cleanedCompany.COMPANYID
        });

        return {
          cname: cleanedCompany.COMPANYNAME || "JAIGURU JEWELLERS",
          companyId: cleanedCompany.COMPANYID || "JGJ",
          costId: cleanedCompany.COSTID || "",
          cAddress1: cleanedCompany.ADDRESS1 || "",
          cAddress2: cleanedCompany.ADDRESS2 || "",
          cAddress3: cleanedCompany.ADDRESS3 || "",
          cAddress4: cleanedCompany.ADDRESS4 || "",
          cPincode: cleanedCompany.AREACODE || "",
          cPhone: cleanedCompany.PHONE || "",
          cEmail: cleanedCompany.EMAIL || "",
          gstNo: cleanedCompany.GSTNO || "",
          stateId: cleanedCompany.STATEID || 0,
          baseUrl: cleanedCompany.BASEURL?.replace(/\s+/g, '') || "",
          logo: cleanedCompany.LOGO || "",
        };
      } else {
        console.warn("⚠️ No company data found, using defaults");
        return this.getDefaultCompanyData();
      }
    } catch (error) {
      console.error("❌ Error fetching company data:", error);
      return this.getDefaultCompanyData();
    }
  }

  static getDefaultCompanyData() {
    console.log("📄 Using default Jaiguru Jewellers company data");
    return {
      cname: "JAIGURU JEWELLERS",
      companyId: "JGJ",
      costId: "JGL",
      cAddress1: "No. 123, Main Road",
      cAddress2: "Jewellery Complex",
      cAddress3: "Chennai",
      cAddress4: "Tamil Nadu",
      cPincode: "600001",
      cPhone: "9876543210",
      cEmail: "contact@jaigurujewellers.com",
      gstNo: "33ABCDE1234F1Z5",
      stateId: 33,
      baseUrl: "https://jaigurujewellers.com",
      logo: "",
    };
  }

  // ---------------------------------------------------------------------------
  // ASSET TO BASE64 CONVERSION - UPDATED FOR NEW API
  // ---------------------------------------------------------------------------
static async assetToBase64(moduleAsset) {
  try {
    const asset = Asset.fromModule(moduleAsset);
    await asset.downloadAsync();

    const uri = asset.localUri || asset.uri;
    if (!uri) throw new Error("Asset URI not available");

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return base64;
  } catch (error) {
    console.error("assetToBase64 Error:", error);
    return "";
  }
}

  // ---------------------------------------------------------------------------
  // FORMATTING FUNCTIONS - EXACTLY MATCHING FIRST CODE
  // ---------------------------------------------------------------------------
  static formatDate(dateString) {
    if (!dateString || dateString === "1900-01-01 00:00:00.0") return "N/A";
    try {
      const dateStringFormatted = dateString.includes(" ")
        ? dateString.replace(" ", "T").replace(/\.\d+$/, "")
        : dateString;
      const date = new Date(dateStringFormatted);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }

  static formatCurrency(amount) {
    const numAmount = parseFloat(amount) || 0;
    return `₹${numAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  static numberToWords(num) {
    if (num === 0) return "Zero Rupees Only";
    
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const toWords = (n) => {
      if (n < 20) return ones[n];
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      }
      if (n < 1000) {
        return (
          ones[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + toWords(n % 100) : "")
        );
      }
      if (n < 100000) {
        return (
          toWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + toWords(n % 1000) : "")
        );
      }
      if (n < 10000000) {
        return (
          toWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + toWords(n % 100000) : "")
        );
      }
      return (
        toWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + toWords(n % 10000000) : "")
      );
    };

    const amount = Math.floor(num);
    const paise = Math.round((num - amount) * 100);
    
    let words = toWords(amount) + " Rupees";
    if (paise > 0) {
      words += " and " + toWords(paise) + " Paise";
    }
    return words + " Only";
  }

  // ---------------------------------------------------------------------------
  // DATA EXTRACTION - MATCHING FIRST CODE STRUCTURE
  // ---------------------------------------------------------------------------
  static extractDataFromResponse(responseData) {
    try {
      const schemeData = responseData?.schemeData || {};
      const payment = responseData?.payment || {};
      const customerInfo = responseData?.customerInfo || {};
      const schemeInfo = responseData?.schemeInfo || {};

      return {
        payment: {
          amount: payment.amount || "0",
          weight: payment.weight || "0.0",
          receiptNo: payment.receiptNo || `RCP${Date.now()}`,
          updateTime: payment.updateTime || new Date().toISOString(),
          chqBank: payment.chqBank || "N/A",
          chqBranch: payment.chqBranch || "N/A",
          chq_CardNo: payment.chq_CardNo || "N/A",
          installment: payment.installment || "1",
        },
        customerInfo: {
          customerName: customerInfo.customerName || schemeData?.pName || "N/A",
          mobile: customerInfo.mobile || schemeData?.personalInfo?.mobile || "N/A",
          address1: customerInfo.address1 || 
                    `${schemeData?.personalInfo?.doorNo || ""}, ${schemeData?.personalInfo?.address1 || ""}`.replace(/^,\s*|,\s*$/g, '') || 
                    "N/A",
          address2: customerInfo.address2 || 
                    `${schemeData?.personalInfo?.city || ""}, ${schemeData?.personalInfo?.state || ""} ${schemeData?.personalInfo?.pinCode || ""}`.replace(/^,\s*|,\s*$/g, '') || 
                    "N/A",
        },
        schemeInfo: {
          schemeName: schemeInfo.schemeName || schemeData?.schemeSummary?.schemeName || "Jaiguru Scheme",
          hsnCode: schemeInfo.hsnCode || schemeData?.schemeSummary?.hsnCode || "",
          regNo: schemeData?.regNo || schemeData?.regno || "N/A",
          groupCode: schemeData?.groupCode || schemeData?.groupcode || "N/A",
          pName: schemeData?.pName || "",
        },
      };
    } catch (error) {
      console.error("Error extracting data:", error);
      throw new Error("Invalid response structure");
    }
  }

  // ---------------------------------------------------------------------------
  // HTML GENERATION - MATCHING FIRST CODE STYLES
  // ---------------------------------------------------------------------------
  static generateReceiptHTML({
    payment,
    customerInfo,
    schemeInfo,
    companyData,
    logoBase64,
  }) {
    // Build company address
    const getCompanyAddress = () => {
      return [
        companyData.cAddress1,
        companyData.cAddress2,
        companyData.cAddress3,
        companyData.cAddress4,
        companyData.cPincode ? `PIN: ${companyData.cPincode}` : "",
      ]
        .filter(Boolean)
        .join(", ");
    };

    const companyAddress = getCompanyAddress();

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment Receipt - ${payment.receiptNo}</title>
<style>
  * { 
    margin: 0; 
    padding: 0; 
    box-sizing: border-box; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  body { 
    background-color: #f5f5f5;
    padding: 20px;
  }
  @page { 
    size: A4; 
    margin: 20mm;
  }
  .receipt-container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 0 auto;
  }
  .header {
    margin-bottom: 16px;
  }
  .header-content {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .logo {
    width: 60px;
    height: 60px;
    margin-right: 12px;
    border-radius: 30px;
  }
  .logo-placeholder {
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background-color: #4C0B0B;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
    display: flex;
  }
  .logo-placeholder-text {
    font-size: 20px;
    font-weight: bold;
    color: #ffffff;
  }
  .company-info {
    flex: 1;
  }
  .company-name {
    color: #4C0B0B;
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
  .contact-section {
    background-color: #FFF9F0;
    padding: 12px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  .contact-text {
    color: #333;
    font-size: 11px;
    line-height: 18px;
    margin-bottom: 2px;
  }
  .divider {
    height: 2px;
    background-color: #4C0B0B;
    margin: 16px 0;
  }
  .receipt-title {
    font-size: 20px;
    font-weight: bold;
    color: #4C0B0B;
    text-align: center;
    margin-bottom: 20px;
    letter-spacing: 1px;
  }
  .info-section {
    background-color: #F8F9FA;
    padding: 14px;
    border-radius: 6px;
    margin-bottom: 16px;
    border-left: 4px solid #4C0B0B;
  }
  .info-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 12px;
  }
  .info-item {
    flex: 1;
  }
  .info-label {
    font-size: 11px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 600;
    text-transform: uppercase;
  }
  .info-value {
    font-size: 13px;
    color: #000;
    font-weight: bold;
  }
  .receipt-to-section {
    margin-bottom: 16px;
  }
  .section-title {
    font-size: 13px;
    font-weight: bold;
    color: #4C0B0B;
    margin-bottom: 10px;
    text-transform: uppercase;
  }
  .customer-box {
    border: 1px solid #DDD;
    border-radius: 6px;
    padding: 12px;
    background-color: #FAFAFA;
  }
  .customer-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;
    gap: 12px;
  }
  .customer-item {
    flex: 1;
  }
  .customer-label {
    font-size: 11px;
    font-weight: 600;
    color: #555;
    margin-bottom: 4px;
  }
  .customer-value {
    font-size: 12px;
    color: #000;
    font-weight: 500;
  }
  .table-container {
    border: 1px solid #DDD;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .table-header {
    display: flex;
    flex-direction: row;
    background-color: #4C0B0B;
    padding: 10px 8px;
  }
  .th {
    color: #ffffff;
    text-align: center;
    font-weight: bold;
    font-size: 11px;
    text-transform: uppercase;
  }
  .table-row {
    display: flex;
    flex-direction: row;
    background-color: #ffffff;
    padding: 12px 8px;
    border-top: 1px solid #E0E0E0;
  }
  .td {
    text-align: center;
    color: #333;
    font-size: 12px;
    font-weight: 500;
  }
  .total-section {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    background-color: #FFF9F0;
    padding: 14px;
    border-radius: 6px;
    margin-bottom: 20px;
    border: 1px solid #FFD700;
  }
  .total-label {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-right: 12px;
  }
  .total-amount {
    font-size: 18px;
    font-weight: bold;
    color: #4C0B0B;
  }
  .payment-mode-section {
    background-color: #F8F9FA;
    padding: 14px;
    border-radius: 6px;
    margin-bottom: 16px;
  }
  .payment-mode-title {
    font-size: 12px;
    font-weight: bold;
    color: #4C0B0B;
    margin-bottom: 8px;
  }
  .payment-mode-row {
    display: flex;
    flex-direction: row;
    margin-bottom: 4px;
  }
  .payment-mode-label {
    font-size: 11px;
    font-weight: 600;
    color: #666;
    width: 70px;
  }
  .payment-mode-value {
    font-size: 11px;
    color: #333;
    flex: 1;
  }
  .footer {
    margin-top: 30px;
    padding-top: 16px;
    border-top: 1px solid #E0E0E0;
    text-align: center;
  }
  .footer-text {
    font-size: 12px;
    color: #555;
    font-weight: 600;
    margin-bottom: 6px;
  }
  .footer-sub-text {
    font-size: 10px;
    color: #999;
    font-style: italic;
  }
</style>
</head>
<body>
<div class="receipt-container">
  <!-- Company Header -->
  <div class="header">
    <div class="header-content">
      ${logoBase64 ? 
        `<img class="logo" src="data:image/jpeg;base64,${logoBase64}" alt="Company Logo" />` : 
        `<div class="logo-placeholder"><span class="logo-placeholder-text">Jaiguru</span></div>`
      }
      <div class="company-info">
        <div class="company-name">${companyData.cname || "Jaiguru jewellers"}</div>
      </div>
    </div>
  </div>

  <!-- Contact Information -->
  <div class="contact-section">
    <div class="contact-text">📞 ${companyData.cPhone || "+91-95143 33601, +91-95143 33609"}</div>
    <div class="contact-text">✉ ${companyData.cEmail}</div>
    <div class="contact-text">📍 ${companyAddress || "160, Melamasi St, Madurai-625001"}</div>
  </div>

  <!-- Divider -->
  <div class="divider"></div>

  <!-- Receipt Title -->
  <div class="receipt-title">PAYMENT RECEIPT</div>

  <!-- Scheme and Transaction Info -->
  <div class="info-section">
    <div class="info-row">
      <div class="info-item">
        <div class="info-label">Scheme Name</div>
        <div class="info-value">${schemeInfo.schemeName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Transaction Date</div>
        <div class="info-value">${this.formatDate(payment.updateTime)}</div>
      </div>
    </div>
  </div>

  <!-- Receipt To Section -->
  <div class="receipt-to-section">
    <div class="section-title">RECEIPT TO:</div>
    <div class="customer-box">
      <div class="customer-row">
        <div class="customer-item">
          <div class="customer-label">Name:</div>
          <div class="customer-value">${customerInfo.customerName}</div>
        </div>
        <div class="customer-item">
          <div class="customer-label">Transaction No:</div>
          <div class="customer-value">${payment.receiptNo}</div>
        </div>
      </div>
      <div class="customer-row">
        <div class="customer-item">
          <div class="customer-label">Mobile:</div>
          <div class="customer-value">${customerInfo.mobile}</div>
        </div>
        <div class="customer-item">
          <div class="customer-label">Group Code:</div>
          <div class="customer-value">${schemeInfo.groupCode}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Table -->
  <div class="table-container">
    <div class="table-header">
      <span class="th" style="flex: 0.5;">S.No</span>
      <span class="th" style="flex: 1.8;">Group Code - Reg No</span>
      <span class="th" style="flex: 1;">Installment</span>
      ${parseFloat(payment.weight) > 0 ? `<span class="th" style="flex: 1;">Weight (g)</span>` : ''}
      <span class="th" style="flex: 1.2;">Amount (₹)</span>
    </div>

    <div class="table-row">
      <span class="td" style="flex: 0.5;">1</span>
      <span class="td" style="flex: 1.8;">${schemeInfo.groupCode}-${schemeInfo.regNo}</span>
      <span class="td" style="flex: 1;">${payment.installment}</span>
      ${parseFloat(payment.weight) > 0 ? 
        `<span class="td" style="flex: 1;">${parseFloat(payment.weight).toFixed(3)}</span>` : ''}
      <span class="td" style="flex: 1.2;">${this.formatCurrency(payment.amount)}</span>
    </div>
  </div>

  <!-- Total Amount -->
  <div class="total-section">
    <span class="total-label">Total Amount Paid:</span>
    <span class="total-amount">${this.formatCurrency(payment.amount)}</span>
  </div>

  <!-- Payment Mode Details -->
  ${(payment.chqBank && payment.chqBank !== "N/A") || payment.chq_CardNo ? `
  <div class="payment-mode-section">
    <div class="payment-mode-title">Payment Details:</div>
    ${payment.chqBank && payment.chqBank !== "N/A" ? `
    <div class="payment-mode-row">
      <span class="payment-mode-label">Mode:</span>
      <span class="payment-mode-value">${payment.chqBank}</span>
    </div>` : ''}
    ${payment.chqBranch && payment.chqBranch !== "N/A" ? `
    <div class="payment-mode-row">
      <span class="payment-mode-label">Branch:</span>
      <span class="payment-mode-value">${payment.chqBranch}</span>
    </div>` : ''}
    ${payment.chq_CardNo && payment.chq_CardNo !== "N/A" ? `
    <div class="payment-mode-row">
      <span class="payment-mode-label">Ref No:</span>
      <span class="payment-mode-value">${payment.chq_CardNo}</span>
    </div>` : ''}
  </div>` : ''}

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">Thank you for being our valued customer</div>
    <div class="footer-sub-text">This is a computer generated receipt</div>
  </div>
</div>
</body>
</html>`;
  }

  // ---------------------------------------------------------------------------
  // PDF GENERATION - UPDATED FOR NEW API
  // ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// PDF GENERATION - STABLE VERSION (SDK 54 SAFE)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// PDF GENERATION - ANDROID DOWNLOAD FOLDER (LIKE OLD WORKING CODE)
// ---------------------------------------------------------------------------
static async generatePDF(responseData) {
  try {
    console.log("🔄 Starting PDF generation...");

    // 1️⃣ Extract data
    const { payment, customerInfo, schemeInfo } =
      this.extractDataFromResponse(responseData);

    // 2️⃣ Load logo + company data
    const [logoBase64, companyData] = await Promise.all([
      this.assetToBase64(this.ASSETS.LOGO).catch(() => ""),
      this.getCompanyData(),
    ]);

    // 3️⃣ Generate HTML
    const html = this.generateReceiptHTML({
      payment,
      customerInfo,
      schemeInfo,
      companyData,
      logoBase64,
    });

    // 4️⃣ Generate temporary PDF
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595,
      height: 842,
    });

    if (!uri) throw new Error("PDF generation failed");

    const fileName = `Receipt_${payment.receiptNo}_${Date.now()}.pdf`;

    // ============================
    // ANDROID → SAVE TO DOWNLOADS
    // ============================
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert("Permission Needed", "Please allow storage access.");
        throw new Error("Storage permission not granted");
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const newUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          "application/pdf"
        );

      await FileSystem.writeAsStringAsync(newUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("✅ PDF saved to:", newUri);

      Alert.alert("Success ✓", `Receipt saved successfully!\n\n${fileName}`);

      return {
        success: true,
        fileName,
        uri: newUri,
      };
    }

    // ============================
    // IOS → SAVE TO APP FOLDER
    // ============================
    else {
      const newPath = FileSystem.documentDirectory + fileName;

      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      Alert.alert("Success ✓", `Receipt saved successfully!`);

      return {
        success: true,
        fileName,
        uri: newPath,
      };
    }
  } catch (error) {
    console.error("❌ PDF Generation Error:", error);

    Alert.alert("Error", error.message || "Failed to generate receipt");

    return {
      success: false,
      error: error.message,
    };
  }
}

  // ---------------------------------------------------------------------------
  // SHARE PDF
  // ---------------------------------------------------------------------------
  static async sharePDF(responseData) {
    try {
      const result = await this.generatePDF(responseData);
      
      if (result.success && result.uri) {
        // Check if sharing is available
        const isSharingAvailable = await Sharing.isAvailableAsync();
        
        if (isSharingAvailable) {
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Share Payment Receipt',
            UTI: 'com.adobe.pdf'
          });
        } else {
          Alert.alert("Sharing not available", "Sharing is not available on this device");
        }
      }
      
      return result;
    } catch (error) {
      console.error("❌ Share PDF Error:", error);
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------------------------
  // PREVIEW PDF (returns HTML for preview)
  // ---------------------------------------------------------------------------
  static async getReceiptHTML(responseData) {
    try {
      const { payment, customerInfo, schemeInfo } =
        this.extractDataFromResponse(responseData);

      const [logoBase64, companyData] = await Promise.all([
        this.assetToBase64(this.ASSETS.LOGO).catch(() => ""),
        this.getCompanyData(),
      ]);

      return this.generateReceiptHTML({
        payment,
        customerInfo,
        schemeInfo,
        companyData,
        logoBase64,
      });
    } catch (error) {
      console.error("Error generating receipt HTML:", error);
      throw error;
    }
  }
}

export default PaymentReceiptPDF;