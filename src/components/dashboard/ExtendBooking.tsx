
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Car, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ExtendBooking = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [extensionHours, setExtensionHours] = useState(1);

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

  const handleExtendBooking = () => {
    if (!selectedBooking || !user?.id) return;

    const userBookingsKey = `smartpulse_bookings_${user.id}`;
    const updatedBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
    const bookingIndex = updatedBookings.findIndex((b: any) => b.id === selectedBooking.id);
    
    if (bookingIndex !== -1) {
      updatedBookings[bookingIndex].duration += extensionHours;
      updatedBookings[bookingIndex].amount += (selectedBooking.amount / selectedBooking.duration) * extensionHours;
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedBookings));
      
      toast({
        title: "Booking Extended!",
        description: `Your booking has been extended by ${extensionHours} hour(s).`,
      });
      
      setSelectedBooking(null);
      setExtensionHours(1);
      
      // Refresh bookings
      const activeBookings = updatedBookings.filter((booking: any) => {
        const bookingDate = new Date(booking.date + ' ' + booking.time);
        const now = new Date();
        const endTime = new Date(bookingDate.getTime() + (booking.duration * 60 * 60 * 1000));
        return endTime > now;
      });
      setBookings(activeBookings);
    }
  };

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
                onChange={(e) => setExtensionHours(parseInt(e.target.value))}
                className="border-purple-200"
              />
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-yellow-50 rounded border border-purple-200">
              <p className="text-sm text-purple-700">
                Additional cost: ₹{((selectedBooking.amount / selectedBooking.duration) * extensionHours).toFixed(0)}
              </p>
            </div>
            <Button 
              onClick={handleExtendBooking}
              className="w-full royal-gradient hover:opacity-90"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Extend Booking
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtendBooking;
