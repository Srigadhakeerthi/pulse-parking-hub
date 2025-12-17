
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car, Navigation, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ParkingLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  availableSlots: number;
  price: number;
  rating: number;
}

const NearbyParking = () => {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);

  const parkingLocations: ParkingLocation[] = [
    { id: 1, name: 'Phoenix MarketCity Mall', lat: 17.4435, lng: 78.3772, availableSlots: 45, price: 60, rating: 4.5 },
    { id: 2, name: 'Cyber Towers Tech Park', lat: 17.4504, lng: 78.3810, availableSlots: 23, price: 40, rating: 4.2 },
    { id: 3, name: 'Forum Value Mall', lat: 17.4260, lng: 78.3488, availableSlots: 67, price: 55, rating: 4.7 },
    { id: 4, name: 'Hitech City Metro Station', lat: 17.4489, lng: 78.3814, availableSlots: 12, price: 45, rating: 4.0 },
  ];

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDistanceAndTime = (location: ParkingLocation) => {
    if (!userLocation) return { distance: '--', walkTime: '--', driveTime: '--' };
    
    const distanceKm = calculateDistance(userLocation.lat, userLocation.lng, location.lat, location.lng);
    const walkTimeMin = Math.round(distanceKm / 0.083); // ~5 km/h walking speed
    const driveTimeMin = Math.round(distanceKm / 0.5); // ~30 km/h avg city driving
    
    return {
      distance: distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`,
      walkTime: `${walkTimeMin} min`,
      driveTime: `${driveTimeMin} min`
    };
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoading(false);
        },
        () => {
          setLocationError(true);
          setLoading(false);
        }
      );
    } else {
      setLocationError(true);
      setLoading(false);
    }
  }, []);

  const handleGetDirections = (location: ParkingLocation) => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${location.lat},${location.lng}`,
        '_blank'
      );
    } else {
      // Request location permission when clicking directions
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLoading(false);
          setLocationError(false);
          window.open(
            `https://www.google.com/maps/dir/${position.coords.latitude},${position.coords.longitude}/${location.lat},${location.lng}`,
            '_blank'
          );
        },
        () => {
          // Fallback to destination only if permission denied
          window.open(`https://www.google.com/maps/dir//${location.lat},${location.lng}`, '_blank');
        }
      );
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
        {loading ? (
          <div className="flex items-center justify-center py-8 gap-2 text-purple-700">
            <Loader2 className="h-5 w-5 animate-spin" />
            Getting your location...
          </div>
        ) : locationError ? (
          <div className="text-center py-4 text-purple-700">
            <p className="mb-2">Enable location to see distances</p>
          </div>
        ) : null}
        
        <div className="space-y-4">
          {parkingLocations.map((location) => {
            const { distance, walkTime, driveTime } = getDistanceAndTime(location);
            return (
              <div key={location.id} className="border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-purple-900">{location.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-purple-700 mt-1">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        🚶 {walkTime} · 🚗 {driveTime}
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyParking;
