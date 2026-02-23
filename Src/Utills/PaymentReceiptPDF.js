import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";
import { getCompanyDetails } from "../Services/CompanyDetailsService";

class PaymentReceiptPDF {
  // Constants
  static STORAGE_KEYS = {
    DOWNLOAD_DIR: "BMG_DOWNLOAD_DIR",
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

        // Map to expected format for the receipt
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
  // FILE SYSTEM HELPERS
  // ---------------------------------------------------------------------------
  static async getDirectoryUri() {
    try {
      const savedUri = await AsyncStorage.getItem(
        this.STORAGE_KEYS.DOWNLOAD_DIR
      );
      if (savedUri) return savedUri;

      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        await AsyncStorage.setItem(
          this.STORAGE_KEYS.DOWNLOAD_DIR,
          permissions.directoryUri
        );
        return permissions.directoryUri;
      } else {
        Alert.alert("Permission Needed", "Please allow access to save files.");
        throw new Error("Storage permission not granted");
      }
    } catch (error) {
      console.error("getDirectoryUri Error:", error);
      throw error;
    }
  }

  static async resetDownloadFolder() {
    await AsyncStorage.removeItem(this.STORAGE_KEYS.DOWNLOAD_DIR);
    Alert.alert("Reset", "Download folder permission has been reset.");
  }

  // ---------------------------------------------------------------------------
  // ASSET TO BASE64 CONVERSION
  // ---------------------------------------------------------------------------
  static async assetToBase64(moduleAsset) {
    const asset = Asset.fromModule(moduleAsset);

    try {
      await asset.downloadAsync();
    } catch (e) {
      // Asset might already be available
    }

    const sourceUri = asset.localUri || asset.uri;
    if (!sourceUri) throw new Error("Asset URI not available");

    if (sourceUri.startsWith("data:")) {
      return sourceUri.substring(sourceUri.indexOf(",") + 1);
    }

    try {
      return await FileSystem.readAsStringAsync(sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (readErr) {
      return await this.handleAssetFallback(sourceUri, asset);
    }
  }

  static async handleAssetFallback(sourceUri, asset) {
    try {
      const fileName = asset.name || `tmp_asset_${Date.now()}`;
      const dest = FileSystem.cacheDirectory + fileName;

      await FileSystem.copyAsync({ from: sourceUri, to: dest });
      return await FileSystem.readAsStringAsync(dest, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (copyErr) {
      try {
        const response = await fetch(sourceUri);
        const buffer = await response.arrayBuffer();
        return this.arrayBufferToBase64(buffer);
      } catch (fetchErr) {
        console.error("assetToBase64: all fallbacks failed", {
          copyErr,
          fetchErr,
        });
        throw new Error("Unable to convert asset to base64");
      }
    }
  }

  static arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // ---------------------------------------------------------------------------
  // FORMATTING FUNCTIONS
  // ---------------------------------------------------------------------------
  static formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  }

  static formatShortDate(dateString) {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  }

  static formatAmount(amount) {
    return parseFloat(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
  // DATA EXTRACTION
  // ---------------------------------------------------------------------------
  static extractDataFromResponse(responseData) {
    try {
      const schemeData = responseData?.schemeData || {};
      const personalInfo = schemeData?.personalInfo || {};
      const payment = responseData?.payment || {};
      const customerInfo = responseData?.customerInfo || {};
      const schemeInfo = responseData?.schemeInfo || {};

      return {
        payment: {
          amount: payment.amount || "0",
          weight: payment.weight || "0.0",
          receiptNo: payment.receiptNo || `RCP${Date.now()}`,
          updateTime: payment.updateTime || new Date().toISOString(),
          paymentMode: payment.chqBank || "CASH",
          paymentSubMode: payment.chqBranch || "",
          transactionId: payment.chq_CardNo || "",
          installment: payment.installment || "1",
        },
        customerInfo: {
          customerName: customerInfo.customerName || personalInfo?.pName || schemeData?.pName || "N/A",
          mobile: customerInfo.mobile || personalInfo?.mobile || schemeData?.personalInfo?.mobile || "N/A",
          address1: customerInfo.address1 || 
                    `${personalInfo?.doorNo || ""}, ${personalInfo?.address1 || ""}`.replace(/^,\s*|,\s*$/g, '') || 
                    "N/A",
          address2: customerInfo.address2 || 
                    `${personalInfo?.city || ""}, ${personalInfo?.state || ""} ${personalInfo?.pinCode || ""}`.replace(/^,\s*|,\s*$/g, '') || 
                    "N/A",
        },
        schemeInfo: {
          schemeName: schemeInfo.schemeName || schemeData?.schemeSummary?.schemeName || "Savings Scheme",
          hsnCode: schemeInfo.hsnCode || "",
          regNo: schemeData?.regNo || "",
          groupCode: schemeData?.groupCode || "",
        },
      };
    } catch (error) {
      console.error("Error extracting data:", error);
      throw new Error("Invalid response structure");
    }
  }

  // ---------------------------------------------------------------------------
  // HTML GENERATION
  // ---------------------------------------------------------------------------
  static generateReceiptHTML({
    payment,
    customerInfo,
    schemeInfo,
    companyData,
    bgBase64,
    logoBase64,
  }) {
    // Build company address dynamically
    const companyAddress = [
      companyData.cAddress1,
      companyData.cAddress2,
      companyData.cAddress3,
      companyData.cAddress4,
    ]
      .filter(Boolean)
      .join(", ");
    
    const companyAddressWithPin = companyAddress + (companyData.cPincode ? ` - ${companyData.cPincode}` : "");

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
    font-family: 'Arial', 'Helvetica', sans-serif;
  }
  body { 
    color: #333;
    margin: 0; 
    padding: 0; 
    line-height: 1.4;
  }
  @page { 
    size: A4; 
    margin: 0; 
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 15mm 15mm;
    background-image: url('data:image/jpeg;base64,${bgBase64}');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
  }
  .receipt-container {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 25px 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    border: 1px solid #d4af37;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 2px solid #d4af37;
  }
  .logo-container {
    width: 120px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  .logo-placeholder {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d4af37 0%, #996515 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    font-weight: bold;
  }
  .title-section {
    text-align: right;
  }
  .receipt-title {
    font-size: 32px;
    font-weight: bold;
    color: #996515;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }
  .receipt-subtitle {
    font-size: 14px;
    color: #666;
  }
  .company-details {
    text-align: center;
    margin-bottom: 25px;
    padding: 15px;
    background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
    border-radius: 8px;
    border-left: 4px solid #d4af37;
  }
  .company-name {
    font-size: 22px;
    font-weight: bold;
    color: #996515;
    margin-bottom: 5px;
  }
  .company-address {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
  .company-contact {
    font-size: 13px;
    color: #666;
    margin-top: 5px;
  }
  .company-gst {
    font-size: 13px;
    color: #996515;
    font-weight: bold;
    margin-top: 5px;
  }
  .info-grid {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
    padding: 15px;
    background: #f8f8f8;
    border-radius: 8px;
  }
  .info-box {
    flex: 1;
  }
  .info-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 3px;
  }
  .info-value {
    font-size: 16px;
    font-weight: bold;
    color: #333;
  }
  .info-value-small {
    font-size: 14px;
    color: #333;
  }
  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #996515;
    margin: 20px 0 10px 0;
    padding-bottom: 5px;
    border-bottom: 1px solid #d4af37;
  }
  .customer-details {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f8f8;
    border-radius: 8px;
  }
  .customer-row {
    display: flex;
    margin-bottom: 8px;
  }
  .customer-label {
    width: 100px;
    font-size: 14px;
    color: #666;
  }
  .customer-value {
    flex: 1;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
  .payment-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  .payment-table th {
    background: #996515;
    color: white;
    padding: 12px 10px;
    font-size: 14px;
    text-align: left;
  }
  .payment-table td {
    padding: 12px 10px;
    font-size: 14px;
    border-bottom: 1px solid #eee;
  }
  .payment-table tr:last-child td {
    border-bottom: none;
  }
  .amount-words {
    margin: 20px 0;
    padding: 15px;
    background: #fff9e6;
    border-radius: 8px;
    font-size: 14px;
    color: #666;
    font-style: italic;
    border-left: 4px solid #d4af37;
  }
  .amount-words strong {
    color: #996515;
    font-style: normal;
  }
  .total-section {
    margin-top: 25px;
    padding: 20px;
    background: linear-gradient(135deg, #996515 0%, #d4af37 100%);
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }
  .total-label {
    font-size: 18px;
    font-weight: bold;
  }
  .total-value {
    font-size: 24px;
    font-weight: bold;
  }
  .footer {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px dashed #d4af37;
    text-align: center;
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
  .payment-mode-box {
    margin-top: 15px;
    padding: 12px;
    background: #f0f0f0;
    border-radius: 6px;
    font-size: 13px;
  }
  .payment-mode-label {
    color: #666;
    margin-right: 10px;
  }
  .payment-mode-value {
    color: #333;
    font-weight: bold;
  }
  .jaiguru-brand {
    color: #996515;
    font-weight: bold;
  }
</style>
</head>
<body>
<div class="page">
  <div class="receipt-container">
    <!-- Header with Logo -->
    <div class="header">
      <div class="logo-container">
        ${logoBase64 ? 
          `<img class="logo" src="data:image/jpeg;base64,${logoBase64}" alt="Jaiguru Jewellers Logo" />` : 
          `<div class="logo-placeholder">JGJ</div>`
        }
      </div>
      <div class="title-section">
        <div class="receipt-title">PAYMENT RECEIPT</div>
        <div class="receipt-subtitle">Tax Invoice / Bill of Supply</div>
      </div>
    </div>

    <!-- Company Details -->
    <div class="company-details">
      <div class="company-name">${companyData.cname}</div>
      <div class="company-address">${companyAddressWithPin}</div>
      <div class="company-contact">
        <span>📞 ${companyData.cPhone}</span> | 
        <span>✉️ ${companyData.cEmail}</span>
      </div>
      ${companyData.gstNo ? `<div class="company-gst">GSTIN: ${companyData.gstNo}</div>` : ''}
    </div>

    <!-- Receipt Info Grid -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Receipt Number</div>
        <div class="info-value">${payment.receiptNo}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Receipt Date</div>
        <div class="info-value">${this.formatShortDate(payment.updateTime)}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Installment</div>
        <div class="info-value">#${payment.installment}</div>
      </div>
    </div>

    <!-- Customer Details -->
    <div class="section-title">Customer Details</div>
    <div class="customer-details">
      <div class="customer-row">
        <div class="customer-label">Name</div>
        <div class="customer-value">${customerInfo.customerName}</div>
      </div>
      <div class="customer-row">
        <div class="customer-label">Mobile</div>
        <div class="customer-value">${customerInfo.mobile}</div>
      </div>
      <div class="customer-row">
        <div class="customer-label">Scheme</div>
        <div class="customer-value">${schemeInfo.schemeName}</div>
      </div>
      ${schemeInfo.regNo ? `
      <div class="customer-row">
        <div class="customer-label">Reg No</div>
        <div class="customer-value">${schemeInfo.regNo}</div>
      </div>
      ` : ''}
      <div class="customer-row">
        <div class="customer-label">Address</div>
        <div class="customer-value">
          ${customerInfo.address1}<br/>
          ${customerInfo.address2}
        </div>
      </div>
    </div>

    <!-- Payment Details Table -->
    <div class="section-title">Payment Details</div>
    <table class="payment-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>HSN/SAC</th>
          <th>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${schemeInfo.schemeName} - Installment #${payment.installment}</td>
          <td>${schemeInfo.hsnCode || '9973'}</td>
          <td><strong>₹ ${this.formatAmount(payment.amount)}</strong></td>
        </tr>
      </tbody>
    </table>

    <!-- Payment Mode -->
    <div class="payment-mode-box">
      <span class="payment-mode-label">Payment Mode:</span>
      <span class="payment-mode-value">${payment.paymentMode} ${payment.paymentSubMode ? `- ${payment.paymentSubMode}` : ''}</span>
      ${payment.transactionId ? `<br/><span class="payment-mode-label">Transaction ID:</span> <span class="payment-mode-value">${payment.transactionId}</span>` : ''}
    </div>

    <!-- Amount in Words -->
    <div class="amount-words">
      <strong>Amount in words:</strong> ${this.numberToWords(Number(payment.amount))}
    </div>

    <!-- Total Amount -->
    <div class="total-section">
      <span class="total-label">Total Amount Paid</span>
      <span class="total-value">₹ ${this.formatAmount(payment.amount)}</span>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div>✨ This is a computer generated receipt - valid without signature ✨</div>
      <div style="margin-top: 8px; color: #996515;">JAIGURU JEWELLERS - Trust Since 1995</div>
    </div>
  </div>
</div>
</body>
</html>`;
  }

  // ---------------------------------------------------------------------------
  // PDF GENERATION
  // ---------------------------------------------------------------------------
  static async generatePDF(responseData) {
    try {
      console.log("🔄 Starting PDF generation for Jaiguru Jewellers...");
      
      // Extract data from response
      const { payment, customerInfo, schemeInfo } =
        this.extractDataFromResponse(responseData);

      console.log("📥 Extracted data:", {
        receiptNo: payment.receiptNo,
        amount: payment.amount,
        customerName: customerInfo.customerName,
      });

      // Load assets and company data in parallel
      console.log("🖼️ Loading assets and company data...");
      const [bgBase64, logoBase64, companyData] = await Promise.all([
        this.assetToBase64(this.ASSETS.BACKGROUND).catch(() => ""),
        this.assetToBase64(this.ASSETS.LOGO).catch(() => ""),
        this.getCompanyData(),
      ]);

      console.log("✅ Data loaded successfully");

      const html = this.generateReceiptHTML({
        payment,
        customerInfo,
        schemeInfo,
        companyData,
        bgBase64,
        logoBase64,
      });

      console.log("📄 Generating PDF from HTML...");
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
        base64: false,
      });

      const fileName = `Jaiguru_Receipt_${payment.receiptNo}_${Date.now()}.pdf`;
      console.log("💾 PDF generated, saving as:", fileName);

      if (Platform.OS === "android") {
        try {
          const directoryUri = await this.getDirectoryUri();
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri,
            fileName,
            "application/pdf"
          );

          await FileSystem.writeAsStringAsync(newUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log("✅ PDF saved to:", newUri);
          Alert.alert(
            "Success ✓",
            `Receipt saved successfully!\n\nFile: ${fileName}`,
            [{ text: "OK", style: "default" }]
          );

          return { success: true, fileName, uri: newUri };
        } catch (saveError) {
          console.error("Error saving to selected directory:", saveError);
          
          // Fallback to cache directory
          const fallbackUri = FileSystem.cacheDirectory + fileName;
          await FileSystem.copyAsync({ from: uri, to: fallbackUri });
          
          Alert.alert(
            "Success ✓",
            `Receipt saved to cache!\n\nFile: ${fileName}`,
            [{ text: "OK", style: "default" }]
          );
          
          return { success: true, fileName, uri: fallbackUri };
        }
      } else {
        // iOS
        const newUri = FileSystem.documentDirectory + fileName;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        console.log("✅ PDF saved to:", newUri);
        
        Alert.alert(
          "Success ✓",
          `Receipt saved successfully!\n\nFile: ${fileName}`,
          [{ text: "OK", style: "default" }]
        );
        
        return { success: true, fileName, uri: newUri };
      }
    } catch (error) {
      console.error("❌ PDF Generation Error:", {
        message: error.message,
        stack: error.stack,
      });
      Alert.alert("Error", `Failed to generate PDF: ${error.message}`, [
        { text: "OK", style: "cancel" },
      ]);
      return { success: false, error: error.message };
    }
  }

  // ---------------------------------------------------------------------------
  // SHARE PDF
  // ---------------------------------------------------------------------------
  static async sharePDF(responseData) {
    try {
      const result = await this.generatePDF(responseData);
      
      if (result.success && result.uri) {
        // Share the PDF
        await Share.share({
          url: result.uri,
          title: "Payment Receipt",
          message: `Payment Receipt - ${responseData?.payment?.receiptNo || ''}`,
        });
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

      const [bgBase64, logoBase64, companyData] = await Promise.all([
        this.assetToBase64(this.ASSETS.BACKGROUND).catch(() => ""),
        this.assetToBase64(this.ASSETS.LOGO).catch(() => ""),
        this.getCompanyData(),
      ]);

      return this.generateReceiptHTML({
        payment,
        customerInfo,
        schemeInfo,
        companyData,
        bgBase64,
        logoBase64,
      });
    } catch (error) {
      console.error("Error generating receipt HTML:", error);
      throw error;
    }
  }
}

export default PaymentReceiptPDF;