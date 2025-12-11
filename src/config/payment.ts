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
  
  // UPI deep link format
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&tn=${encodeURIComponent(transactionNote + ' - ' + transactionId)}&cu=INR`;
  
  return upiUrl;
};
