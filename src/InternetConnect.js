import React, { useState, useEffect } from 'react';

import CommonFuctions from './commonfunction';



function InternetConnect() {
  const [onlineStatus, setOnlineStatus] = useState(null);
  const [loading, setLoading] = useState(true); // Assuming you have a loading state
    
  const Internet = new CommonFuctions();

  useEffect(() => {



    const checkInter = async () => {
      try {
        const result = await Internet.isCheckInterNet(); // Assuming isCheckInterNet is the function to check internet
        setOnlineStatus(result);
        // If no internet and already loading, automatically switch to show no internet after 5 seconds
        if (!result && loading) {
          setTimeout(() => {
            setLoading(false);
          }, 5000); // 5 seconds
        }
      } catch (error) {
        console.error('Error checking internet status:', error);
      }
    };

    // Call checkInter function initially
    checkInter();

    // Set up an interval to check internet status periodically
    const interval = setInterval(checkInter, 5000); // Check every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [loading]); // Include loading in dependencies array to listen for its changes

  return (
    <>
      {onlineStatus !== null && onlineStatus === false ? (
        <div style={{ textAlign: 'center', marginTop: '20%' }}>
          {/* No Internet Connection */}
          <h3>No Internet Connection</h3>
        </div>
      ) : (
        // Your main content when there is internet connection
        <div>
          <h1>Internet is connected!</h1>
          {/* Add your content here */}
        </div>
      )}
    </>
  );
}

export default InternetConnect;
