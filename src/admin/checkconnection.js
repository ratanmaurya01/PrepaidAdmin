import React, { useEffect, useState } from 'react';

const CheckNetwork = ({ isInternetAvailable }) => {
  const [result, setResult] = useState('');

  useEffect(() => {
    const checkInternet = async () => {
      try {
        const response = await fetch('https://clients3.google.com/generate_204', { method: 'HEAD' });
        if (response.status === 204 && response.headers.get('content-length') === '0') {
          setResult('success');
          isInternetAvailable(true);
        } else {
          setResult('failed');
          isInternetAvailable(false);
        }
      } catch (error) {
        console.error('Error checking internet connection:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (result === '') {
        setResult('failed');
        isInternetAvailable(false);
      }
    }, 5000);

    checkInternet();

    return () => clearTimeout(timeoutId);
  }, [result, isInternetAvailable]);

  return null; // You can render something here if needed
};


export default CheckNetwork ;
