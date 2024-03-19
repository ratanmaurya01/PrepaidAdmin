import { database } from '../firebase';
import firebase from 'firebase/compat/app'; // Import the Firebase app (latest version)
import 'firebase/compat/database';

const allSerialNo = [];

class IsDeleteTransferToken {
    constructor() {


    }

    async getAllTokenSerial(phoneNumber) {
        try {
            const newAdminDetailsPath = database.ref(`adminRootReference/adminDetails/${phoneNumber}/meterList`);
            const snapshot = await newAdminDetailsPath.once('value');
            const serialData = snapshot.val();
            // Check if serialData is not null or undefined
            if (serialData) {
                const keys = Object.keys(serialData);
                const isDuplicate = keys.some(key => allSerialNo.includes(key));

                allSerialNo.push(...keys);
               //  this.deletePendingToken();

               const pendingTokensDeleted = await this.deletePendingToken();

               return { serialNumbers: allSerialNo, pendingTokensDeleted };
                 
              //  console.log('seiufhef');
                 // return allSerialNo;
            } else {
                  
                return { serialNumbers: [], pendingTokensDeleted: false };
                //return []; // or handle this case as per your requirement
            }
        } catch (error) {
             
            console.error("Error fetching serial data:", error.message);
            return { serialNumbers: [], pendingTokensDeleted: false };
            
            //console.error("Error fetching serial data:", error.message);
           // return []; // or handle this case as per your requirement
        }
    }


    
    // async deletePendingToken() {
         
    //     let tokenRemoved = false;

    //     for (let i = 0; i < allSerialNo.length; i++) {
    //         try {
    //             const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${allSerialNo[i]}/reConfigToken`);
    //             const snapshot = await meterDetailsPath.once('value');
    //             const newData = snapshot.val();
    //             const isTransfer = newData.isTransfer;
    //             const tokenData = newData.token;  
    //             if (newData && isTransfer === "true" &&  tokenData!== "null") {
    //                 //console.log("data token ",  isTransfer);
    //                // console.log("data token ", tokenData );
    //                 // Remove reConfigToken field
    //                 await meterDetailsPath.remove();
    //                 tokenRemoved = true;
                 
                  
    //             }

    //         } catch (error) {
    //             console.error("Error fetching meter details:", error.message);
    //         }
    //     }
        
    //     if (tokenRemoved) {
    //         alert("reConfigToken removed successfully!");
    //     }

    // }
    


    // async deletePendingToken() {
    //      // Flag to track if the message has been logged already
    //     let count = 0;
    //   //  let tokensRemoved = false; // Flag to track if any tokens were removed successfully
  
    //   // console.log('seiufhef', allSerialNo);
    //     for (let i = 0; i < allSerialNo.length; i++) {
    //         try {
    //             const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${allSerialNo[i]}`);
    //             const snapshot = await meterDetailsPath.once('value');
    //             const newData = snapshot.val();

    //             console.log("not ", newData);

    //             if(newData.reConfigToken !== undefined){
    //                 const isTransfer = newData.reConfigToken.isTransfer;
    //                 const tokenData = newData.reConfigToken.token;  
    //                 if (isTransfer === "true" && tokenData !== "null") {
    //                     let deletePath = meterDetailsPath.child("/reConfigToken")
    //                     await deletePath.remove();

    //                   //  tokensRemoved = true;
                      
    //                     console.log("reConfigToken removed successfully!");

    //                 }else if (isTransfer === "false" && tokenData === "null"){
    //                     count++;
    //                 }
    //                 else if (isTransfer === "false" && tokenData !== "null"){
                             
    //                     count++;

    //                 }else if (isTransfer === "true" && tokenData === "null"){
                             
    //                     count++;
                        
    //                 }
    //                 else {
    //                     console.log("rgrgrgregrggeregrg");
                   
    //                 }
    //             }else{
    //                 console.log("not available");
    //                 count++;
    //             }
        
    //         } catch (error) {
    //             console.error("Error fetching meter details:", error.message);
    //         }
    //     }
        
    //     if (count ==allSerialNo.length) {
    //         alert("No Pending Transfer Token ");
    //     }

    //     // if (tokensRemoved) {
    //     //     alert("All reConfigTokens removed successfully!");
    //     // } else if (count === allSerialNo.length) {
    //     //     alert("No Pending Transfer Token");
    //     // }
    // }



    // 2nd time correct 
  


    //   original code 
    async deletePendingToken() {
        let pendingTokenFound = false;
        try {
            for (let i = 0; i < allSerialNo.length; i++) {
                let sr = allSerialNo[i];
                const meterDetailsPath = firebase.database().ref(`adminRootReference/meterDetails/${sr}`);
                const snapshot = await meterDetailsPath.once('value');
                const newData = snapshot.val();
                if (newData !== null) {
                  //  console.log("serial new ");
                    if (newData.reConfigToken !== undefined) {
                        const isTransfer = newData.reConfigToken.isTransfer;
                        const token = newData.reConfigToken.token;
                        if (isTransfer === "true" && token !== "null") {
                            // Remove token if it meets conditions
                            await meterDetailsPath.child('reConfigToken').remove();
                            //   console.log("data deleted successfully");

                            pendingTokenFound = true;
                        } else {
                            pendingTokenFound = false;
                        }
                    } else {
                        pendingTokenFound = false;
                    }
                } else {
                    pendingTokenFound = false;
                }
            }
    
            if (!pendingTokenFound) {
               // console.log("No pending token. ");
            }

            return pendingTokenFound; // Indicate whether any pending tokens were found and deleted

    
        } catch (e) {
            console.log('Error Fetching:', e);
        }
    };
    

   
   
    

}

export default IsDeleteTransferToken;
