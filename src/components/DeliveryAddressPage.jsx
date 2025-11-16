import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { mapService } from '../services/mapService';
import { MapPin, Navigation, ArrowLeft, CheckCircle } from 'lucide-react';

const DeliveryAddressPage = () => {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const { dispatch, actionTypes, state } = useApp();

  useEffect(() => {
    // Simple initialization for demo mode
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const mapInitialized = await mapService.initializeMap();
      if (mapInitialized) {
        setIsMapLoaded(true);
        console.log('Map service initialized in demo mode');
      }
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setError('Map loading failed. You can still enter address manually.');
      setIsMapLoaded(true); // Allow manual address entry
    }
  };

  const updateMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      draggable: true,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff'
      }
    });

    // Add drag listener to marker
    markerRef.current.addListener('dragend', (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setCoordinates({ lat, lng });
      reverseGeocodeLocation(lat, lng);
    });

    mapInstanceRef.current.panTo({ lat, lng });
  };

  const reverseGeocodeLocation = async (lat, lng) => {
    try {
      const result = await mapService.reverseGeocode(lat, lng);
      setAddress(result.address);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const location = await mapService.getCurrentLocation();
      setCoordinates(location);
      updateMarker(location.lat, location.lng);
      reverseGeocodeLocation(location.lat, location.lng);
    } catch (error) {
      setError('Unable to get current location. Please enter address manually.');
    }

    setLoading(false);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleGeocodeAddress = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await mapService.geocodeAddress(address);
      setCoordinates({ lat: result.lat, lng: result.lng });
      setAddress(result.formattedAddress);
      updateMarker(result.lat, result.lng);
    } catch (error) {
      setError('Unable to find the address. Please check and try again.');
    }

    setLoading(false);
  };

  const handleConfirmAddress = async () => {
    if (!address.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    // Check if coordinates exist, if not try to geocode
    let finalCoordinates = coordinates;
    if (!finalCoordinates && address) {
      try {
        const result = await mapService.geocodeAddress(address);
        finalCoordinates = { lat: result.lat, lng: result.lng };
      } catch (error) {
        setError('Unable to validate address. Please check and try again.');
        return;
      }
    }

    // Check if address is within delivery area
    if (finalCoordinates && !mapService.isWithinDeliveryArea(finalCoordinates)) {
      setError('Sorry, we do not deliver to this area. Please choose a different address.');
      return;
    }

    dispatch({ type: actionTypes.SET_DELIVERY_ADDRESS, payload: address });
    dispatch({ type: actionTypes.SET_DELIVERY_COORDINATES, payload: finalCoordinates });
    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'menu' });
  };

  const handleBack = () => {
    dispatch({ type: actionTypes.SET_CURRENT_PAGE, payload: 'orderType' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Order Type
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-orange-500 mb-2">Delivery Address</h2>
            <p className="text-gray-600">Select your delivery location on the map or enter manually</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Map Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Select on Map</h3>
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  {loading ? 'Getting Location...' : 'Current Location'}
                </button>
              </div>

              <div className="relative">
                <div
                  ref={mapRef}
                  className="w-full h-64 bg-gray-200 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                >
                  {!isMapLoaded ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading map...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Demo Mode - Interactive Map</p>
                      <p className="text-sm text-gray-500">Click "Current Location" for demo coordinates</p>
                    </div>
                  )}
                </div>
                {isMapLoaded && (
                  <div className="absolute top-2 left-2 bg-white/90 rounded-lg p-2 text-xs text-gray-600">
                    Demo Mode: Use "Current Location" or enter address manually
                  </div>
                )}
              </div>
            </div>

            {/* Address Form Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Delivery Address
                </label>
                <textarea
                  value={address}
                  onChange={handleAddressChange}
                  placeholder="Enter your full delivery address including street, city, and postal code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200"
                  rows={4}
                />
              </div>

              {!coordinates && address && (
                <button
                  onClick={handleGeocodeAddress}
                  disabled={loading}
                  className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Finding Address...' : 'Find on Map'}
                </button>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {coordinates && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Location confirmed on map
                </div>
              )}

              <div className="pt-4 space-y-3">
                <button
                  onClick={handleConfirmAddress}
                  disabled={loading || !address.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors transform hover:scale-[1.02]"
                >
                  Confirm Delivery Address
                </button>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-50 p-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Delivery Area: Within 10km radius</span>
              <span>Estimated Delivery: 30-45 minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressPage;
