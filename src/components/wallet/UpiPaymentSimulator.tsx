import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, Smartphone, QrCode, Clock } from 'lucide-react';
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
  const [step, setStep] = useState<'qr' | 'waiting' | 'processing' | 'success'>('qr');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [waitingTime, setWaitingTime] = useState(0);

  useEffect(() => {
    // Generate UPI payment URL and QR code
    const transactionId = `WR${Date.now()}`;
    const upiUrl = generateUpiPaymentUrl(amount, transactionId);
    generateQRCode(upiUrl).then(setQrCodeData);
  }, [amount]);

  useEffect(() => {
    if (step === 'qr' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      onCancel();
    }
  }, [step, countdown, onCancel]);

  // Simulate automatic payment detection when in waiting mode
  useEffect(() => {
    if (step === 'waiting') {
      const timer = setInterval(() => {
        setWaitingTime((prev) => prev + 1);
      }, 1000);

      // Simulate payment detection after 5-8 seconds (random for realism)
      const detectionTime = 5000 + Math.random() * 3000;
      const detectionTimer = setTimeout(() => {
        setStep('processing');
        // Process payment
        setTimeout(() => {
          setStep('success');
          setTimeout(onSuccess, 1500);
        }, 2000);
      }, detectionTime);

      return () => {
        clearInterval(timer);
        clearTimeout(detectionTimer);
      };
    }
  }, [step, onSuccess]);

  const handleScanStarted = () => {
    setStep('waiting');
  };

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
            Confirming your payment with your bank...
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

  if (step === 'waiting') {
    return (
      <Card className="w-full max-w-md mx-auto border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-primary animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Waiting for Payment</h3>
          <p className="text-muted-foreground mb-4">
            Complete the payment in your UPI app
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-2xl font-bold text-primary">₹{amount}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Waiting for {waitingTime}s...
          </p>
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
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
                <li>Confirm the amount and pay</li>
                <li>Payment will be auto-detected</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={handleScanStarted}
          >
            <QrCode className="w-4 h-4 mr-2" />
            I've Scanned the QR Code
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpiPaymentSimulator;
