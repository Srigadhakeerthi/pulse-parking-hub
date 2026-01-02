import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Car, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PaymentModal from './PaymentModal';
import BookingConfirmation from './BookingConfirmation';

interface ParkingSlot {
  id: string;
  number: string;
  type: 'regular' | 'premium' | 'disabled';
  price: number;
  available: boolean;
  location: string;
  complex: string;
}

const BookingPage = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(2);
  const [selectedComplex, setSelectedComplex] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  const complexes = [
    { id: 'phoenix', name: 'Phoenix MarketCity Mall', type: 'Shopping Mall' },
    { id: 'forum', name: 'Forum Value Mall', type: 'Shopping Mall' },
    { id: 'tech-park', name: 'Cyber Towers Tech Park', type: 'Office Complex' },
    { id: 'metro-station', name: 'Hitech City Metro Station', type: 'Transport Hub' },
    { id: 'central', name: 'Central Square Complex', type: 'Mixed Use' },
    { id: 'brigade', name: 'Brigade Gateway', type: 'Office Complex' }
  ];

  const generateMockSlots = (): ParkingSlot[] => {
    const slots: ParkingSlot[] = [];
    const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];
    const sectionPrefixes = ['A', 'B', 'C', 'D', 'E'];
    
    complexes.forEach((complex) => {
      floors.forEach((floor, floorIndex) => {
        sectionPrefixes.forEach((prefix) => {
          for (let i = 1; i <= 12; i++) {
            const slotNumber = `${prefix}${i.toString().padStart(2, '0')}`;
            const types: ('regular' | 'premium' | 'disabled')[] = ['regular', 'premium', 'disabled'];
            const type = i <= 8 ? 'regular' : i <= 10 ? 'premium' : 'disabled';
            const basePrice = complex.type === 'Shopping Mall' ? 60 : complex.type === 'Office Complex' ? 40 : 50;
            const price = type === 'premium' ? basePrice + 30 : type === 'disabled' ? basePrice - 10 : basePrice;
            
            slots.push({
              id: `${complex.id}-${floor.replace(' ', '').toLowerCase()}-${slotNumber}`,
              number: slotNumber,
              type,
              price,
              available: Math.random() > 0.3, // 70% availability
              location: floor,
              complex: complex.name
            });
          }
        });
      });
    });
    
    return slots;
  };

  const allSlots = generateMockSlots();
  const filteredSlots = selectedComplex 
    ? allSlots.filter(slot => slot.complex === complexes.find(c => c.id === selectedComplex)?.name)
    : allSlots;
  const availableSlots = filteredSlots.filter(slot => slot.available);

  const getSlotColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800';
      case 'disabled': return 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-300 text-blue-800';
      default: return 'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-300 text-purple-800';
    }
  };

  const handleSlotSelect = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = () => {
    if (!selectedSlot) {
      toast({
        title: "No Slot Selected",
        description: "Please select a parking slot to continue.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedComplex) {
      toast({
        title: "No Location Selected",
        description: "Please select a location/complex to continue.",
        variant: "destructive",
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    const bookingId = `SP${Date.now().toString().slice(-6)}`;
    const entryCode = `ENTRY_${bookingId}_${Date.now()}`;
    const exitCode = `EXIT_${bookingId}_${Date.now()}`;
    
    const booking = {
      id: bookingId,
      slotNumber: selectedSlot!.number,
      location: selectedSlot!.location,
      complex: selectedSlot!.complex,
      date: selectedDate,
      time: selectedTime,
      duration: duration,
      amount: selectedSlot!.price * duration,
      entryCode,
      exitCode,
      userName: user?.name || 'User'
    };

    setCurrentBooking(booking);
    setShowPayment(false);
    setShowConfirmation(true);
    
    const userBookingsKey = `smartpulse_bookings_${user?.id}`;
    const existingBookings = JSON.parse(localStorage.getItem(userBookingsKey) || '[]');
    existingBookings.push(booking);
    localStorage.setItem(userBookingsKey, JSON.stringify(existingBookings));

    toast({
      title: "Booking Confirmed!",
      description: `Your slot ${selectedSlot!.number} has been booked successfully.`,
    });
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedSlot(null);
    setCurrentBooking(null);
    setSelectedComplex('');
  };

  return (
    <div className="space-y-6">
      <div className="royal-gradient p-6 rounded-lg text-white">
        <h1 className="text-3xl font-bold">Welcome {user?.name}! Book Your Parking Slot</h1>
        <p className="mt-2 opacity-90">Select your preferred location, date, time, and parking slot</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Calendar className="h-5 w-5" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="complex" className="text-purple-900 font-medium">Location/Complex</Label>
              <Select value={selectedComplex} onValueChange={setSelectedComplex}>
                <SelectTrigger className="border-purple-200">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {complexes.map((complex) => (
                    <SelectItem key={complex.id} value={complex.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{complex.name}</div>
                          <div className="text-xs text-gray-500">{complex.type}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-purple-900 font-medium">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="border-purple-200"
              />
            </div>
            
            <div>
              <Label htmlFor="time" className="text-purple-900 font-medium">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="border-purple-200"
              />
            </div>
            
            <div>
              <Label htmlFor="duration" className="text-purple-900 font-medium">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="border-purple-200"
              />
            </div>

            {selectedSlot && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-yellow-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900">Selected Slot</h4>
                <p className="text-sm text-purple-700">
                  {selectedSlot.number} - {selectedSlot.location}
                </p>
                <p className="text-sm text-purple-700">
                  {selectedSlot.complex}
                </p>
                <p className="text-sm font-medium text-purple-900">
                  Total: ₹{selectedSlot.price * duration}
                </p>
              </div>
            )}

            <Button 
              onClick={handleBooking} 
              className="w-full royal-gradient hover:opacity-90"
              disabled={!selectedSlot || !selectedComplex}
            >
              {selectedSlot && selectedComplex ? 'Proceed to Payment' : 'Select Location & Slot'}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Car className="h-5 w-5" />
              Available Slots
            </CardTitle>
            <CardDescription className="text-purple-700">
              {availableSlots.length} slots available
              {selectedComplex && ` at ${complexes.find(c => c.id === selectedComplex)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedComplex ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                <p className="text-purple-600">Please select a location to view available slots</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotSelect(slot)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedSlot?.id === slot.id 
                        ? 'border-purple-500 bg-purple-50 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="bg-white p-2 rounded border shadow-sm">
                        <Car className="h-6 w-6 mx-auto text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-purple-900">{slot.number}</p>
                        <p className="text-xs text-purple-600">{slot.location}</p>
                      </div>
                      <Badge variant="outline" className={getSlotColor(slot.type)}>
                        {slot.type}
                      </Badge>
                      <p className="text-sm font-medium text-purple-900">₹{slot.price}/hr</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedComplex && availableSlots.length === 0 && (
              <div className="text-center py-8">
                <Car className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                <p className="text-purple-600">No slots available at this location for the selected date and time.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showPayment && selectedSlot && (
        <PaymentModal
          selectedSlot={selectedSlot}
          duration={duration}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onPaymentSuccess={handlePaymentSuccess}
          onCancel={() => setShowPayment(false)}
        />
      )}

      {showConfirmation && currentBooking && (
        <BookingConfirmation
          booking={currentBooking}
          onClose={handleConfirmationClose}
        />
      )}
    </div>
  );
};

export default BookingPage;
