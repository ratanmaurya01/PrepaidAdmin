// import React, { useEffect, useState } from 'react';
// import Navbar from '../adminLogin/navbar';
// import { auth } from '../adminLogin/firebase';
// import { database } from '../firebase';


// function Updatetennet() {
//   const [phoneNumber, setPhoneNumber] = useState('');
//   const [user, setUser] = useState(null);


//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((authUser) => {
//         if (authUser) {
//             setUser(authUser);
//             const emailParts = authUser.email.split('@');
//             if (emailParts.length === 2) {
//                 const numberPart = emailParts[0];

//                 console.log('Admin User ',numberPart);

//                 setPhoneNumber(numberPart);
//                 handleUpdatetennent(numberPart);
//             }
//         } else {
//             setUser(null);
//             // Instead of redirecting, you can handle this case in your UI
//             window.location.href = '/';
//         }
//     });

//     return () => unsubscribe();
// }, []);
  
  
  
//  let newPhoneNumber= '9509717149';
 
//  const handleUpdatetennent = (numberPart) =>{
   
//      console.log('Admin phone Number ', numberPart)

//     const oldDataRef = database.ref(`adminRootReference/tenantDetails/${numberPart}`);
//     const newDataRef = database.ref(`adminRootReference/tenantDetails/${newPhoneNumber}`);

//     oldDataRef.once('value')
//       .then(snapshot => {
//         const data = snapshot.val();

//         // Step 2: Write data to the new key
//         return newDataRef.set(data);
//       })
//       .then(() => {
//         // Step 3: Remove data from the old key
//         return oldDataRef.remove();
//       })
//       .then(() => {
//         console.log('Key updated successfully11');
//       })
//       .catch(error => {
//         console.error('Error updating key:', error);
//       });



//  }




//   return (
//     <>
//        <div> Tannent Detials </div>
//     </>
//   )
// }

// export default Updatetennet