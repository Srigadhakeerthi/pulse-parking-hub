import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, QrCode } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PinVerification from './PinVerification';
import UpiPaymentSimulator from '../wallet/UpiPaymentSimulator';

interface PaymentModalProps {
  selectedSlot: any;
  duration: number;
  selectedDate: string;
  selectedTime: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  selectedSlot,
  duration,
  selectedDate,
  selectedTime,
  onPaymentSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [paymentStep, setPaymentStep] = useState<'summary' | 'pin' | 'upi' | 'processing' | 'success'>('summary');

  const totalAmount = selectedSlot.price * duration;

  const handlePaymentConfirm = () => {
    setPaymentStep('pin');
  };

  const handlePinVerified = () => {
    setPaymentStep('upi');
  };

  const handleUpiSuccess = () => {
    setPaymentStep('processing');
    
    // Save payment transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'payment',
      amount: -totalAmount,
      date: selectedDate,
      time: selectedTime,
      status: 'Completed',
      description: `Parking Slot ${selectedSlot.number} - ${selectedSlot.location}`,
      slotNumber: selectedSlot.number,
      location: selectedSlot.location,
      complex: selectedSlot.complex,
      duration: duration,
      paymentMethod: 'UPI'
    };
    
    const existingTransactions = JSON.parse(localStorage.getItem('smartpulse_transactions') || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem('smartpulse_transactions', JSON.stringify(existingTransactions));
    
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        onPaymentSuccess();
      }, 2000);
    }, 1500);
  };

  if (paymentStep === 'pin') {
    return (
      <PinVerification
        onVerified={handlePinVerified}
        onCancel={() => setPaymentStep('summary')}
        bookingAmount={totalAmount}
      />
    );
  }

  if (paymentStep === 'upi') {
    return (
      <UpiPaymentSimulator
        amount={totalAmount}
        onSuccess={handleUpiSuccess}
        onCancel={() => setPaymentStep('summary')}
      />
    );
  }

  if (paymentStep === 'processing') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Processing Payment...</h3>
            <p className="text-muted-foreground">Verifying your UPI transaction</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-green-600">Payment Successful!</h3>
            <p className="text-muted-foreground">Your parking slot has been booked successfully</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <QrCode className="h-5 w-5" />
            UPI Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-4 rounded-lg border border-purple-200">
            <h3 className="font-semibold mb-3 text-purple-900">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Slot:</span>
                <span>{selectedSlot.number} ({selectedSlot.location})</span>
              </div>
              <div className="flex justify-between">
                <span>Complex:</span>
                <span>{selectedSlot.complex}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{selectedTime} ({duration} hours)</span>
              </div>
              <div className="flex justify-between">
                <span>Rate:</span>
                <span>₹{selectedSlot.price}/hour</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
                <span>Total Amount:</span>
                <span className="text-purple-700">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handlePaymentConfirm} 
              className="flex-1 royal-gradient hover:opacity-90"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Pay via UPI
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentModal;
