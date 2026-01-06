
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Calendar, MapPin, Receipt, Plus, Minus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import WalletRecharge from '../wallet/WalletRecharge';

const PaymentHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [showRecharge, setShowRecharge] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    
    const userTransactionsKey = `smartpulse_transactions_${user.id}`;
    const savedTransactions = JSON.parse(localStorage.getItem(userTransactionsKey) || '[]');
    
    // Sort transactions by date (newest first)
    const sortedTransactions = savedTransactions.sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setTransactions(sortedTransactions);
    
    // Calculate total spent from payment transactions only
    const spent = savedTransactions.reduce((sum: number, transaction: any) => {
      if (transaction.type === 'payment') {
        return sum + Math.abs(transaction.amount);
      }
      return sum;
    }, 0);
    setTotalSpent(spent);
  }, [showRecharge, user?.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'recharge': return <Plus className="h-4 w-4 text-green-600" />;
      case 'payment': return <Minus className="h-4 w-4 text-red-600" />;
      default: return <Receipt className="h-4 w-4 text-purple-600" />;
    }
  };

  if (showRecharge) {
    return <WalletRecharge onClose={() => setShowRecharge(false)} />;
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Wallet className="h-5 w-5" />
            Wallet & Payment History - {user?.name}
          </CardTitle>
          <Button 
            onClick={() => setShowRecharge(true)}
            className="royal-gradient hover:opacity-90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Recharge
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-gradient-to-r from-purple-100 to-yellow-100 rounded border border-purple-200">
            <p className="text-sm text-purple-700">Current Balance</p>
            <p className="font-bold text-lg text-purple-900">₹{user?.walletBalance}</p>
          </div>
          <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded border border-green-200">
            <p className="text-sm text-green-700">Total Recharged</p>
            <p className="font-bold text-lg text-green-900">
              ₹{transactions.filter(t => t.type === 'recharge').reduce((sum, t) => sum + t.amount, 0)}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded border border-red-200">
            <p className="text-sm text-red-700">Total Spent</p>
            <p className="font-bold text-lg text-red-900">₹{totalSpent}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 mx-auto text-purple-400 mb-4" />
            <p className="text-purple-600">No transactions found</p>
            <p className="text-sm text-purple-500">Your wallet transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <h3 className="font-semibold text-purple-900">
                        {transaction.type === 'recharge' ? 'Wallet Recharge' : transaction.description}
                      </h3>
                      {transaction.slotNumber && (
                        <p className="text-sm text-purple-700">
                          Slot {transaction.slotNumber} - {transaction.location}
                        </p>
                      )}
                      {transaction.complex && (
                        <p className="text-xs text-purple-600">{transaction.complex}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      transaction.type === 'recharge' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'recharge' ? '+' : ''}₹{Math.abs(transaction.amount)}
                    </div>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-700">{transaction.date} at {transaction.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-600" />
                    <span className="text-purple-700">
                      {transaction.type === 'recharge' ? 'Wallet Recharge' : 'Parking Payment'}
                    </span>
                  </div>
                  {transaction.duration && (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-700">Duration: {transaction.duration}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-purple-600" />
                        <span className="text-purple-700">Rate: ₹{(Math.abs(transaction.amount) / transaction.duration).toFixed(0)}/hr</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
