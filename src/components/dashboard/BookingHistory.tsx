
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, QrCode, Phone, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { generateQRCode, generateBookingQRCode } from '@/utils/qrCodeGenerator';

const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>('');

  useEffect(() => {
    if (!user?.id) return;
    const userBookingsKey = `smartpulse_bookings_${user.id}`;
    const savedBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
    setBookings(savedBookings);
  }, [user?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-purple-100 text-purple-800 border-purple-300';
    }
  };

  const handleShowQR = async (booking: any) => {
    const bookingData = generateBookingQRCode(booking.id);
    const qrCode = await generateQRCode(bookingData);
    setQrCodeData(qrCode);
    setShowQR(booking.id);
  };

  if (showQR && qrCodeData) {
    const booking = bookings.find(b => b.id === showQR);
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 border-purple-200">
          <CardHeader className="text-center bg-gradient-to-r from-purple-50 to-yellow-50">
            <CardTitle className="text-purple-900">Parking QR Code</CardTitle>
            <p className="text-sm text-purple-700">Booking #{booking?.id}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="w-64 h-64 mx-auto bg-white rounded-lg border-2 border-purple-200 shadow-lg p-4">
              <img src={qrCodeData} alt="Parking QR Code" className="w-full h-full object-contain" />
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-purple-900">Slot {booking?.slotNumber}</p>
              <p className="text-sm text-purple-700">{booking?.location}</p>
              <p className="text-xs text-purple-600">{booking?.complex}</p>
              <p className="text-sm font-medium text-purple-900">
                {booking?.date} at {booking?.time}
              </p>
            </div>
            <Button 
              onClick={() => {setShowQR(null); setQrCodeData('');}}
              className="w-full royal-gradient hover:opacity-90"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
          <CardTitle className="text-purple-900">Booking History - {user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-purple-400 mb-4" />
            <p className="text-purple-600">No bookings found</p>
            <p className="text-sm text-purple-500">Your booking history will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
        <CardTitle className="text-purple-900">Booking History - {user?.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-purple-900">Booking #{booking.id}</h3>
                  <p className="text-sm text-purple-700">Slot {booking.slotNumber} - {booking.location}</p>
                  {booking.complex && (
                    <p className="text-xs text-purple-600 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {booking.complex}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor('active')}>
                  Active
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">{booking.time} ({booking.duration}h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">{booking.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-purple-600" />
                  <span className="text-purple-700">₹{booking.amount}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleShowQR(booking)}
                  className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <QrCode className="h-4 w-4" />
                  Show QR Code
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingHistory;
