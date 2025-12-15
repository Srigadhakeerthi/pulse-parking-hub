import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Smartphone, Clock, QrCode } from 'lucide-react';
import { generateQRCode } from '@/utils/qrCodeGenerator';
import { ADMIN_PAYMENT_CONFIG, generateUpiPaymentUrl } from '@/config/payment';

interface UpiPaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const UpiPaymentSimulator: React.FC<UpiPaymentSimulatorProps> = ({
  amount,
  onSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<'scanning' | 'processing' | 'success'>('scanning');
  const [countdown, setCountdown] = useState(300); // 5 minutes timeout
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');

  useEffect(() => {
    // Generate UPI payment URL and QR code
    const txnId = `WR${Date.now()}`;
    setTransactionId(txnId);
    const upiUrl = generateUpiPaymentUrl(amount, txnId);
    generateQRCode(upiUrl).then(setQrCodeData);
  }, [amount]);

  // Countdown timer
  useEffect(() => {
    if (step === 'scanning' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      onCancel();
    }
  }, [step, countdown, onCancel]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle payment confirmation - user clicks after paying
  const handlePaymentDone = useCallback(() => {
    setStep('processing');
    // Quick verification simulation
    setTimeout(() => {
      setStep('success');
      setTimeout(onSuccess, 800);
    }, 1200);
  }, [onSuccess]);

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
          <p className="text-muted-foreground">
            Confirming your payment to {ADMIN_PAYMENT_CONFIG.upiId}...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto border-green-500/20">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-semibold mb-2 text-green-600">
            Payment Successful!
          </h3>
          <p className="text-muted-foreground">
            ₹{amount} has been added to your wallet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-primary/20">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Pay ₹{amount}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-xl shadow-inner mx-auto w-fit">
          {qrCodeData ? (
            <img
              src={qrCodeData}
              alt="UPI QR Code"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* UPI ID */}
        <div className="text-center bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Pay to UPI ID</p>
          <p className="font-mono font-bold text-lg">{ADMIN_PAYMENT_CONFIG.upiId}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Expires in {formatTime(countdown)}
          </span>
        </div>

        {/* Instructions */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Steps:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 mt-1">
                <li>Open GPay/PhonePe/Paytm</li>
                <li>Scan this QR code</li>
                <li>Pay ₹{amount} to {ADMIN_PAYMENT_CONFIG.upiId}</li>
                <li>After payment, tap button below</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Payment Done Button */}
        <Button 
          onClick={handlePaymentDone} 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          I've Paid ₹{amount}
        </Button>

        {/* Cancel Button */}
        <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpiPaymentSimulator;
