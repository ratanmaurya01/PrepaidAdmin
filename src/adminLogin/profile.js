// AnotherPage.js or AnotherComponent.js
import React from 'react';
import { useUser } from './usercontext'; // Import useUser hook

function Profile() {
  const { userNumber } = useUser(); // Access userNumber from the context

  return (
    <div>
      <h1>User Number: {userNumber}</h1>
      {/* Use userNumber or perform actions based on its value */}
    </div>
  );
}

export default Profile;
