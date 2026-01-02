
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, CreditCard, Wallet, QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PinVerification from '@/components/booking/PinVerification';
import UpiPaymentSimulator from '@/components/wallet/UpiPaymentSimulator';

const ExtendBooking = () => {
  const { user, updateWalletBalance } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [extensionHours, setExtensionHours] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'summary' | 'pin' | 'upi' | 'processing' | 'success'>('summary');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi'>('wallet');

  React.useEffect(() => {
    if (!user?.id) return;
    const userBookingsKey = `smartpulse_bookings_${user.id}`;
    const savedBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
    const activeBookings = savedBookings.filter((booking: any) => {
      const bookingDate = new Date(booking.date + ' ' + booking.time);
      const now = new Date();
      const endTime = new Date(bookingDate.getTime() + (booking.duration * 60 * 60 * 1000));
      return endTime > now;
    });
    setBookings(activeBookings);
  }, [user?.id]);

  const getExtensionCost = () => {
    if (!selectedBooking) return 0;
    return Math.round((selectedBooking.amount / selectedBooking.duration) * extensionHours);
  };

  const hasEnoughBalance = (user?.walletBalance || 0) >= getExtensionCost();

  const handleProceedToPayment = () => {
    if (!selectedBooking) return;
    setShowPayment(true);
    setPaymentStep('summary');
  };

  const handlePaymentConfirm = () => {
    setPaymentStep('pin');
  };

  const handlePinVerified = () => {
    if (paymentMethod === 'wallet' && hasEnoughBalance) {
      processWalletPayment();
    } else {
      setPaymentStep('upi');
    }
  };

  const processWalletPayment = () => {
    setPaymentStep('processing');
    const extensionCost = getExtensionCost();
    
    // Deduct from wallet
    updateWalletBalance(-extensionCost);
    
    // Save payment transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'payment',
      amount: -extensionCost,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'Completed',
      description: `Extension for Slot ${selectedBooking.slotNumber} - ${selectedBooking.location}`,
      slotNumber: selectedBooking.slotNumber,
      location: selectedBooking.location,
      complex: selectedBooking.complex,
      duration: extensionHours,
      paymentMethod: 'Wallet'
    };
    
    const userTransactionsKey = `smartpulse_transactions_${user?.id}`;
    const existingTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem(userTransactionsKey, JSON.stringify(existingTransactions));
    
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        completeExtension();
      }, 2000);
    }, 1500);
  };

  const handleUpiSuccess = () => {
    setPaymentStep('processing');
    const extensionCost = getExtensionCost();
    
    // Save payment transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'payment',
      amount: -extensionCost,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'Completed',
      description: `Extension for Slot ${selectedBooking.slotNumber} - ${selectedBooking.location}`,
      slotNumber: selectedBooking.slotNumber,
      location: selectedBooking.location,
      complex: selectedBooking.complex,
      duration: extensionHours,
      paymentMethod: 'UPI'
    };
    
    const userTransactionsKey = `smartpulse_transactions_${user?.id}`;
    const existingTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem(userTransactionsKey, JSON.stringify(existingTransactions));
    
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        completeExtension();
      }, 2000);
    }, 1500);
  };

  const completeExtension = () => {
    if (!selectedBooking || !user?.id) return;

    const userBookingsKey = `smartpulse_bookings_${user.id}`;
    const updatedBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
    const bookingIndex = updatedBookings.findIndex((b: any) => b.id === selectedBooking.id);
    
    if (bookingIndex !== -1) {
      updatedBookings[bookingIndex].duration += extensionHours;
      updatedBookings[bookingIndex].amount += getExtensionCost();
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));
      
      toast({
        title: "Booking Extended!",
        description: `Your booking has been extended by ${extensionHours} hour(s).`,
      });
      
      // Refresh bookings
      const activeBookings = updatedBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date + ' ' + booking.time);
        const now = new Date();
        const endTime = new Date(bookingDate.getTime() + (booking.duration * 60 * 60 * 1000));
        return endTime > now;
      });
      setBookings(activeBookings);
    }
    
    // Reset state
    setShowPayment(false);
    setPaymentStep('summary');
    setSelectedBooking(null);
    setExtensionHours(1);
    setPaymentMethod('wallet');
  };

  const handleCancelPayment = () => {
    setShowPayment(false);
    setPaymentStep('summary');
    setPaymentMethod('wallet');
  };

  // Payment Modal Rendering
  if (showPayment && selectedBooking) {
    if (paymentStep === 'pin') {
      return (
        <PinVerification
          onVerified={handlePinVerified}
          onCancel={() => setPaymentStep('summary')}
          bookingAmount={getExtensionCost()}
        />
      );
    }

    if (paymentStep === 'upi') {
      return (
        <UpiPaymentSimulator
          amount={getExtensionCost()}
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
              <p className="text-muted-foreground">
                {paymentMethod === 'wallet' ? 'Deducting from wallet' : 'Verifying your UPI transaction'}
              </p>
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
              <p className="text-muted-foreground">Your booking has been extended successfully</p>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Payment Summary Modal
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Wallet className="h-5 w-5" />
              Complete Extension Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-yellow-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold mb-3 text-purple-900">Extension Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Slot:</span>
                  <span>{selectedBooking.slotNumber} ({selectedBooking.location})</span>
                </div>
                <div className="flex justify-between">
                  <span>Complex:</span>
                  <span>{selectedBooking.complex}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Duration:</span>
                  <span>{selectedBooking.duration} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Extension:</span>
                  <span>+{extensionHours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>₹{Math.round(selectedBooking.amount / selectedBooking.duration)}/hour</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Extension Amount:</span>
                  <span className="text-purple-700">₹{getExtensionCost()}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-900">Select Payment Method</h4>
              
              {/* Wallet Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                } ${!hasEnoughBalance ? 'opacity-60' : ''}`}
                onClick={() => hasEnoughBalance && setPaymentMethod('wallet')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${paymentMethod === 'wallet' ? 'bg-purple-200' : 'bg-gray-100'}`}>
                      <Wallet className={`h-5 w-5 ${paymentMethod === 'wallet' ? 'text-purple-700' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Pay from Wallet</p>
                      <p className="text-sm text-muted-foreground">
                        Balance: ₹{user?.walletBalance || 0}
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'wallet' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'wallet' && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                </div>
                
                {!hasEnoughBalance && (
                  <div className="mt-2 flex items-center gap-2 text-amber-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Insufficient balance. Need ₹{getExtensionCost() - (user?.walletBalance || 0)} more.</span>
                  </div>
                )}
              </div>

              {/* UPI Option */}
              <div 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === 'upi' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${paymentMethod === 'upi' ? 'bg-purple-200' : 'bg-gray-100'}`}>
                      <QrCode className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-purple-700' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium">Pay via UPI</p>
                      <p className="text-sm text-muted-foreground">
                        PhonePe, GPay, Paytm, BHIM
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'upi' ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'upi' && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleCancelPayment} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentConfirm} 
                className="flex-1 royal-gradient hover:opacity-90"
                disabled={paymentMethod === 'wallet' && !hasEnoughBalance}
              >
                {paymentMethod === 'wallet' ? (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Pay ₹{getExtensionCost()}
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Pay via UPI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Clock className="h-5 w-5" />
            Extend Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-purple-400 mb-4" />
            <p className="text-purple-600">No active bookings to extend</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Clock className="h-5 w-5" />
          Extend Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={() => setSelectedBooking(booking)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedBooking?.id === booking.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-purple-200 hover:border-purple-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-purple-900">Slot {booking.slotNumber}</h4>
                  <p className="text-sm text-purple-700">{booking.location}</p>
                  <p className="text-xs text-purple-600">{booking.date} at {booking.time}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          ))}
        </div>

        {selectedBooking && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="hours" className="text-purple-900 font-medium">Extension Hours</Label>
              <Input
                id="hours"
                type="number"
                min="1"
                max="8"
                value={extensionHours}
                onChange={(e) => setExtensionHours(parseInt(e.target.value) || 1)}
                className="border-purple-200"
              />
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-yellow-50 rounded border border-purple-200">
              <p className="text-sm text-purple-700">
                Additional cost: ₹{getExtensionCost()}
              </p>
            </div>
            <Button 
              onClick={handleProceedToPayment}
              className="w-full royal-gradient hover:opacity-90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtendBooking;
