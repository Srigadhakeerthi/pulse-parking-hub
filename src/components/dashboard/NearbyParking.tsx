
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Navigation, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NearbyParking = () => {
  const { user } = useAuth();

  const nearbyLocations = [
    {
      id: 1,
      name: 'Phoenix MarketCity Mall',
      distance: '0.8 km',
      availableSlots: 45,
      walkTime: '10 min',
      price: 60,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Cyber Towers Tech Park',
      distance: '1.2 km',
      availableSlots: 23,
      walkTime: '15 min',
      price: 40,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Forum Value Mall',
      distance: '2.1 km',
      availableSlots: 67,
      walkTime: '25 min',
      price: 55,
      rating: 4.7
    },
    {
      id: 4,
      name: 'Hitech City Metro Station',
      distance: '1.5 km',
      availableSlots: 12,
      walkTime: '18 min',
      price: 45,
      rating: 4.0
    }
  ];

  const handleGetDirections = (location: any) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          window.open(
            `https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(location.name + ' parking')}`,
            '_blank'
          );
        },
        (error) => {
          // Fallback to search if location denied
          window.open(`https://www.google.com/maps/search/${encodeURIComponent(location.name + ' parking')}`, '_blank');
        }
      );
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(location.name + ' parking')}`, '_blank');
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-yellow-50">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <MapPin className="h-5 w-5" />
          Nearby Parking - Hello {user?.name}!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {nearbyLocations.map((location) => (
            <div key={location.id} className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-purple-900">{location.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-purple-700 mt-1">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {location.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {location.walkTime} walk
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-900">₹{location.price}/hr</div>
                  <div className="text-xs text-yellow-600">★ {location.rating}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-700">{location.availableSlots} slots available</span>
                  <Badge 
                    variant="outline" 
                    className={location.availableSlots > 30 ? 'bg-green-100 text-green-800' : 
                               location.availableSlots > 10 ? 'bg-yellow-100 text-yellow-800' : 
                               'bg-red-100 text-red-800'}
                  >
                    {location.availableSlots > 30 ? 'High' : location.availableSlots > 10 ? 'Medium' : 'Low'} Availability
                  </Badge>
                </div>
                <Button 
                  onClick={() => handleGetDirections(location)}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyParking;
