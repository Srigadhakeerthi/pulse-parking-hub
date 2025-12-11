// Admin UPI Payment Configuration
// Edit these credentials after deployment to set your real UPI ID

export const ADMIN_PAYMENT_CONFIG = {
  // Admin UPI ID where all payments will be received
  upiId: "admin@paytm", // Change this to your real UPI ID (e.g., "yourname@paytm", "9876543210@ybl")
  
  // Display name shown on UPI payment screen
  merchantName: "ParkEase Parking",
  
  // Transaction note/description
  transactionNote: "Parking Slot Booking",
};

// Generate UPI payment URL for QR code
export const generateUpiPaymentUrl = (amount: number, transactionId: string): string => {
  const { upiId, merchantName, transactionNote } = ADMIN_PAYMENT_CONFIG;
  
  // Build URL parameters manually to ensure proper formatting
  // UPI apps expect specific format: upi://pay?pa=upiid&pn=name&am=amount&cu=INR
  const params = new URLSearchParams();
  params.append('pa', upiId); // Payee address (UPI ID) - must be valid format like name@bank
  params.append('pn', merchantName); // Payee name
  params.append('am', amount.toFixed(2)); // Amount with 2 decimal places
  params.append('cu', 'INR'); // Currency
  params.append('tn', `${transactionNote} ${transactionId}`); // Transaction note
  
  // UPI deep link format
  const upiUrl = `upi://pay?${params.toString()}`;
  
  console.log('Generated UPI URL:', upiUrl); // Debug log
  
  return upiUrl;
};
