import React, { useEffect, useState } from 'react';
import Navbar from '../adminLogin/navbar';
import { auth } from '../adminLogin/firebase';
import { database } from '../firebase';


function Serialwithmeter() {
    // Assuming phoneNumber is a state variable
    const [phoneNumber, setPhoneNumber] = useState('');
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                setUser(authUser);
                const emailParts = authUser.email.split('@');
                if (emailParts.length === 2) {
                    const numberPart = emailParts[0];

                    console.log('Admin User ',numberPart);

                    setPhoneNumber(numberPart);
                    handlePhoneSerialList(numberPart);
                    handleMeterList(numberPart);
                }
            } else {
                setUser(null);
                // Instead of redirecting, you can handle this case in your UI
                window.location.href = '/';
            }
        });

        return () => unsubscribe();
    }, []);





    const handlePhoneSerialList = async (numberPart) => {
        try {
            const newAdinDetialspath = database.ref(`adminRootReference/adminDetails/${numberPart}/meterList`);
            const snapshot = await newAdinDetialspath.once('value');
            const serialData = snapshot.val();
            //   console.log('phone related serial  ', Object.keys(serialData));
            const keys = Object.keys(serialData);
            //  console.log('phone related serial  ', keys);
            return keys;
        } catch (error) {
            console.error("Error fetching serial data:", error.message);
        }
    }



    const handleMeterList = async (numberPart) => {
        const result = await handlePhoneSerialList(numberPart);
        // console.log('Filter Serail Number ',result);
        try {
            const dataPath = database.ref(`/common/meterList/`);
            const snapshot = await dataPath.once('value');
            const serialData = snapshot.val();
            const filteredSerialData = Object.keys(serialData)
                .filter(serial => result.includes(serial))
                .reduce((acc, serial) => {
                    acc[serial] = serialData[serial];
                    return acc;

                }, {});

            console.log('Serial Numbe data ', filteredSerialData);

            // for (const serial in filteredSerialData) {
            //     const meterPath = database.ref(`/common/meterList/${serial}`);
            //     await meterPath.update({ phoneNo: '7619021238' }); // Replace 'NEW_PHONE_NUMBER' with the actual phone number you want to set
            // }

            console.log('Phone numbers updated successfully.');

        } catch (error) {
            console.error("Error updating phone numbers:", error.message);
        }


    };





    return (
        <>

        </>
    );
}

export default Serialwithmeter;
