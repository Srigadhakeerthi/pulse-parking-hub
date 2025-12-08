import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, Loader2 } from 'lucide-react';

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
  const [step, setStep] = useState<'select' | 'processing' | 'success'>('select');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const upiApps = [
    { id: 'phonepe', name: 'PhonePe', color: 'bg-purple-600' },
    { id: 'gpay', name: 'Google Pay', color: 'bg-blue-600' },
    { id: 'paytm', name: 'Paytm', color: 'bg-cyan-600' },
    { id: 'bhim', name: 'BHIM UPI', color: 'bg-green-600' },
  ];

  const handleAppSelect = (appId: string) => {
    setSelectedApp(appId);
  };

  const handleProceed = () => {
    if (!selectedApp) return;
    setStep('processing');
  };

  useEffect(() => {
    if (step === 'processing') {
      // Simulate payment processing (3 seconds)
      const timer = setTimeout(() => {
        setStep('success');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, onSuccess]);

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 border-primary/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Processing UPI Payment...</h3>
            <p className="text-muted-foreground mb-4">
              Complete the payment in your {upiApps.find(a => a.id === selectedApp)?.name} app
            </p>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Demo Mode - Auto-approving in 3 seconds
            </Badge>
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
            <p className="text-muted-foreground">₹{amount} received via UPI</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-primary/20">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex justify-center mb-2">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-foreground">Pay via UPI</CardTitle>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 mt-2">
            Demo Mode - No real payment
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">₹{amount}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Select UPI App</h4>
            <div className="grid grid-cols-2 gap-3">
              {upiApps.map((app) => (
                <Button
                  key={app.id}
                  variant={selectedApp === app.id ? 'default' : 'outline'}
                  className={`h-16 flex flex-col gap-1 ${
                    selectedApp === app.id 
                      ? 'royal-gradient' 
                      : 'border-primary/20 hover:bg-primary/5'
                  }`}
                  onClick={() => handleAppSelect(app.id)}
                >
                  <div className={`w-6 h-6 rounded-full ${app.color}`}></div>
                  <span className="text-xs">{app.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleProceed} 
              disabled={!selectedApp}
              className="flex-1 royal-gradient hover:opacity-90"
            >
              Proceed to Pay
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpiPaymentSimulator;
