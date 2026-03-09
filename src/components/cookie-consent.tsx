'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Cookie Consent</h2>
            <p className="text-sm text-gray-600">
              We use cookies to improve your experience and analyze our traffic.
            </p>
          </div>
          <button
            onClick={declineCookies}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            By clicking "Accept All", you agree to the storing of cookies on your device to enhance site navigation, 
            analyze site usage, and assist in our marketing efforts. You can manage your cookie settings by clicking "Manage Settings".
          </p>
        </div>
        <div className="flex justify-end space-x-2 p-4 border-t">
          <button
            onClick={declineCookies}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Decline
          </button>
          <button
            onClick={() => {
              // Open cookie settings modal or redirect to privacy policy
              window.open('/privacy', '_blank');
            }}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Manage Settings
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}