import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import UpiPaymentSimulator from './UpiPaymentSimulator';

interface WalletRechargeProps {
  onClose: () => void;
}

const WalletRecharge: React.FC<WalletRechargeProps> = ({ onClose }) => {
  const { user, updateWalletBalance } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showUpiPayment, setShowUpiPayment] = useState(false);

  const rechargeAmounts = [100, 250, 500, 1000, 2000, 5000];

  const handleRecharge = () => {
    if (!selectedAmount) return;
    setShowUpiPayment(true);
  };

  const handleUpiSuccess = () => {
    if (!selectedAmount) return;
    
    updateWalletBalance(selectedAmount);
    
    // Save recharge transaction
    const transaction = {
      id: Date.now().toString(),
      type: 'recharge',
      amount: selectedAmount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      status: 'Completed',
      description: 'Wallet Recharge via UPI',
      paymentMethod: 'UPI'
    };
    
    const existingTransactions = JSON.parse(localStorage.getItem('smartpulse_transactions') || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem('smartpulse_transactions', JSON.stringify(existingTransactions));
    
    toast({
      title: "Wallet Recharged!",
      description: `₹${selectedAmount} has been added to your wallet after verification.`,
    });
    
    setShowUpiPayment(false);
    onClose();
  };

  if (showUpiPayment && selectedAmount) {
    return (
      <UpiPaymentSimulator
        amount={selectedAmount}
        onSuccess={handleUpiSuccess}
        onCancel={() => setShowUpiPayment(false)}
        requireVerification={true} // Require UTR verification for wallet recharge
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 border-purple-200">
        <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-yellow-50">
          <div className="flex justify-center mb-2">
            <Wallet className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-purple-900">Recharge Wallet</CardTitle>
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
            Current Balance: ₹{user?.walletBalance}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-3 text-purple-900">Select Recharge Amount</h4>
            <div className="grid grid-cols-2 gap-3">
              {rechargeAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? 'default' : 'outline'}
                  className={selectedAmount === amount 
                    ? 'royal-gradient' 
                    : 'border-purple-200 text-purple-700 hover:bg-purple-50'
                  }
                  onClick={() => setSelectedAmount(amount)}
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> After UPI payment, you'll need to enter the UTR/Reference number to verify your payment before the wallet is credited.
            </p>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleRecharge} 
              disabled={!selectedAmount}
              className="flex-1 royal-gradient hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Recharge
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletRecharge;
