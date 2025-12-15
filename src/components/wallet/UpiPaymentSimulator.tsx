import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Smartphone, Clock } from 'lucide-react';
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
  const [countdown, setCountdown] = useState(120); // 2 minutes timeout
  const [qrCodeData, setQrCodeData] = useState<string>('');

  useEffect(() => {
    // Generate UPI payment URL and QR code
    const transactionId = `WR${Date.now()}`;
    const upiUrl = generateUpiPaymentUrl(amount, transactionId);
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

  // Auto-detect payment after QR is shown (simulates webhook callback)
  // In real apps, this would be a webhook from payment gateway
  useEffect(() => {
    if (step === 'scanning' && qrCodeData) {
      // Simulate payment detection after 8-12 seconds (gives time to scan & pay)
      const detectionTime = 8000 + Math.random() * 4000;
      const detectionTimer = setTimeout(() => {
        setStep('processing');
        // Verify payment
        setTimeout(() => {
          setStep('success');
          setTimeout(onSuccess, 1000);
        }, 1500);
      }, detectionTime);

      return () => clearTimeout(detectionTimer);
    }
  }, [step, qrCodeData, onSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
          <p className="text-muted-foreground">
            Confirming your payment...
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
        <CardTitle className="text-lg">Scan & Pay ₹{amount}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-xl shadow-inner mx-auto w-fit relative">
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

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-primary font-medium">Waiting for payment</span>
        </div>

        {/* UPI ID */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">UPI ID</p>
          <p className="font-mono font-medium">{ADMIN_PAYMENT_CONFIG.upiId}</p>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            Expires in {formatTime(countdown)}
          </span>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">How to pay:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1 mt-1">
                <li>Open any UPI app (GPay, PhonePe, Paytm)</li>
                <li>Scan this QR code</li>
                <li>Confirm amount and complete payment</li>
                <li>Payment auto-detects - no action needed</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <Button variant="outline" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpiPaymentSimulator;
