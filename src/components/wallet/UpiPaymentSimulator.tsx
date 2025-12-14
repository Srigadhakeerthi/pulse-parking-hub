import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Smartphone, CheckCircle, ArrowLeft, Loader2, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { generateUpiPaymentUrl, ADMIN_PAYMENT_CONFIG } from '@/config/payment';
import { toast } from '@/hooks/use-toast';

interface UpiPaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  requireVerification?: boolean; // For wallet recharge, require UTR verification
}

const UpiPaymentSimulator: React.FC<UpiPaymentSimulatorProps> = ({
  amount,
  onSuccess,
  onCancel,
  requireVerification = false
}) => {
  const [step, setStep] = useState<'qr' | 'verify' | 'processing' | 'success'>('qr');
  const [countdown, setCountdown] = useState(300); // 5 minutes for real payment
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [transactionId] = useState(() => `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
  const [upiPaymentUrl, setUpiPaymentUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  // Generate real UPI QR code on mount
  useEffect(() => {
    const upiUrl = generateUpiPaymentUrl(amount, transactionId);
    setUpiPaymentUrl(upiUrl);
    
    QRCode.toDataURL(upiUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    }).then(dataUrl => {
      setQrCodeDataUrl(dataUrl);
    }).catch(err => {
      console.error('QR generation error:', err);
    });
  }, [amount, transactionId]);

  // Countdown timer
  useEffect(() => {
    if ((step === 'qr' || step === 'verify') && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && (step === 'qr' || step === 'verify')) {
      toast({
        title: "Payment Timeout",
        description: "Please try again if payment wasn't completed.",
        variant: "destructive"
      });
      onCancel();
    }
  }, [countdown, step, onCancel]);

  const handlePaymentConfirm = () => {
    if (requireVerification) {
      setStep('verify');
    } else {
      processPayment();
    }
  };

  const handleVerifyUTR = () => {
    // Validate UTR number (12-digit number typically)
    if (!utrNumber.trim()) {
      setUtrError('Please enter the UTR/Reference number');
      return;
    }
    
    if (utrNumber.length < 10) {
      setUtrError('UTR number should be at least 10 characters');
      return;
    }

    setUtrError('');
    processPayment();
  };

  const processPayment = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(ADMIN_PAYMENT_CONFIG.upiId);
    toast({
      title: "UPI ID Copied!",
      description: ADMIN_PAYMENT_CONFIG.upiId,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground">Please wait while we confirm your transaction</p>
            <p className="text-xs text-muted-foreground mt-2">Transaction ID: {transactionId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">₹{amount} paid successfully via UPI</p>
            <p className="text-xs text-muted-foreground mt-2">Transaction ID: {transactionId}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setStep('qr')}
              className="absolute left-4 top-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <CardTitle className="text-foreground flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Verify Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Payment Verification Required</p>
                  <p className="text-yellow-700">
                    Enter the UTR/Reference number from your UPI payment confirmation to verify your transaction.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-primary">₹{amount}</p>
              <p className="text-sm text-muted-foreground mt-1">Amount to verify</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utr">UTR/Reference Number</Label>
              <Input
                id="utr"
                placeholder="Enter 12-digit UTR number"
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                  setUtrError('');
                }}
                className={utrError ? 'border-red-500' : ''}
              />
              {utrError && (
                <p className="text-sm text-red-500">{utrError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                You can find UTR number in your UPI app's payment success message or bank SMS.
              </p>
            </div>

            {/* Timer */}
            <div className="text-center">
              <span className={`text-sm font-medium ${countdown < 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                Time remaining: {formatTime(countdown)}
              </span>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyUTR}
                className="flex-1 royal-gradient hover:opacity-90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify & Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-primary/20 max-h-[90vh] overflow-y-auto">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10 relative sticky top-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="absolute left-4 top-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <CardTitle className="text-foreground flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan & Pay
          </CardTitle>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-2">
            Secure UPI Payment
          </Badge>
        </CardHeader>
        <CardContent className="space-y-5 p-6">
          {/* Amount Display */}
          <div className="text-center">
            <p className="text-4xl font-bold text-primary">₹{amount}</p>
            <p className="text-sm text-muted-foreground mt-1">{ADMIN_PAYMENT_CONFIG.merchantName}</p>
          </div>

          {/* Real QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl border-2 border-primary/20 shadow-lg">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="UPI Payment QR Code" 
                  className="w-56 h-56 rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-muted rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* UPI ID Display */}
          <div className="bg-muted/50 p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground text-center mb-1">Pay to UPI ID</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-medium text-foreground bg-background px-3 py-1 rounded">
                {ADMIN_PAYMENT_CONFIG.upiId}
              </code>
              <Button variant="ghost" size="sm" onClick={copyUpiId}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-2">How to pay:</p>
                <ol className="text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Open any UPI app (PhonePe, GPay, Paytm, BHIM)</li>
                  <li>Scan this QR code or enter UPI ID</li>
                  <li>Verify amount: <strong className="text-foreground">₹{amount}</strong></li>
                  <li>Complete payment & click confirm below</li>
                  {requireVerification && (
                    <li><strong className="text-foreground">Note down UTR number</strong> from payment confirmation</li>
                  )}
                </ol>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className={`font-medium ${countdown < 60 ? 'text-red-500' : 'text-muted-foreground'}`}>
                Time remaining: {formatTime(countdown)}
              </span>
            </div>
          </div>

          {/* Transaction ID */}
          <p className="text-xs text-center text-muted-foreground">
            Transaction ID: {transactionId}
          </p>

          {/* Confirm Payment Button */}
          <Button 
            onClick={handlePaymentConfirm}
            className="w-full royal-gradient hover:opacity-90"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I've Completed Payment
          </Button>

          {/* Open in UPI App Button */}
          {upiPaymentUrl && (
            <a 
              href={upiPaymentUrl}
              className="block"
            >
              <Button 
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in UPI App
              </Button>
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpiPaymentSimulator;
