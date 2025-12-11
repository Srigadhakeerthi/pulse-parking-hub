import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

interface UpiPaymentSimulatorProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const UpiPaymentSimulator: React.FC<UpiPaymentSimulatorProps> = ({
  amount,
  onSuccess,
  onCancel
}) => {
  const [step, setStep] = useState<'qr' | 'processing' | 'success'>('qr');
  const [countdown, setCountdown] = useState(15);

  // Simulate payment verification countdown
  useEffect(() => {
    if (step === 'qr' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 'qr') {
      handlePaymentDetected();
    }
  }, [countdown, step]);

  const handlePaymentDetected = () => {
    setStep('processing');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  const handleManualConfirm = () => {
    handlePaymentDetected();
  };

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment...</h3>
            <p className="text-muted-foreground">Please wait while we confirm your transaction</p>
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
            <h3 className="text-lg font-semibold mb-2 text-green-600">Payment Received!</h3>
            <p className="text-muted-foreground">₹{amount} paid successfully via UPI</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate consistent QR pattern based on amount
  const generateQrPattern = () => {
    const seed = amount;
    return Array.from({ length: 64 }).map((_, i) => {
      const value = ((seed * (i + 1) * 7) % 100);
      return value > 45;
    });
  };

  const qrPattern = generateQrPattern();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-primary/20">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10 relative">
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
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-2">
            Demo Mode
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl border-2 border-primary/20 shadow-lg">
              <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated QR Pattern */}
                <div className="absolute inset-4 grid grid-cols-8 gap-1">
                  {qrPattern.map((filled, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${filled ? 'bg-foreground' : 'bg-transparent'}`}
                    />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-lg shadow">
                    <QrCode className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-primary">₹{amount}</p>
              <p className="text-sm text-muted-foreground">SmartPulse Parking</p>
            </div>
          </div>

          {/* Payment Instructions */}
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <Smartphone className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">How to pay:</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open any UPI app (PhonePe, GPay, Paytm)</li>
                  <li>Scan this QR code</li>
                  <li>Verify amount and complete payment</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Auto-detection indicator */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for payment... ({countdown}s)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              (Demo: Payment will auto-confirm)
            </p>
          </div>

          {/* Manual confirm button */}
          <Button 
            onClick={handleManualConfirm}
            className="w-full royal-gradient hover:opacity-90"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            I've Completed Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpiPaymentSimulator;
