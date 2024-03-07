import React, { useState, useEffect } from 'react';
import { auth } from '../adminLogin/firebase';

function  Createtime() {
    const [creationTime, setCreationTime] = useState(null); // State to hold account creation time

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                // User is logged in
                const creationTimestamp = authUser.metadata.creationTime;
               // const creationTimestamp = authUser.metadata.creationTime;
                const date = new Date(creationTimestamp);
                const formattedDate = `${(date.getDate() < 10 ? '0' : '') + date.getDate()}-${(date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1)}-${(date.getFullYear() % 100)}`;
                const formattedTime = `${(date.getHours() < 10 ? '0' : '') + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}:00`;
                setCreationTime(`${formattedDate}, ${formattedTime}`); 
               // setCreationTime(new Date(creationTimestamp).toLocaleString()); // Convert timestamp to readable date and time
            } else {
                setCreationTime(null);
                window.location.href = '/'; // Redirect to your login page
            }
        });
        return () => unsubscribe(); // Cleanup function for unmounting
    }, []);

    return (
        <div>
            {creationTime && (
                <div>
                    Account Created On : {creationTime}
                </div>
            )}
        </div>
    );
}

export default Createtime;
