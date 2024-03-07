import React, {useEffect, useState} from 'react'
import Maintest from './function'
import Generatetoken from '../reconfigtoken/generatetokenkey';
import CommonFuctions from '../commonfunction';



function Function1() {

  const time = new Generatetoken(); 
  const sessionTime = new CommonFuctions();
 

const severTime =  async()=>
{
    
  updateSessionTime();
  // Assuming GenerateToken is the correct class name
  const timestamp = await sessionTime.fireabseServerTimestamp()
  console.log("firebase111 ",timestamp);
   
}


let number ='9509717149'


   const updateSessionTime =()=>{

    

    sessionTime.updateSessionTime(number);

   }




    

  return (
    <>
      
       <div>
        <h1>Welomce </h1>

        <button   onClick={severTime} > Check DAta </button>
       </div>


       {/* <div>
        <h1>Welcome</h1>

        <label>
          Enter Number 1:
          <input
            type="number"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
          />
        </label>

        <label>
          Enter Number 2:
          <input
            type="number"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
          />
        </label>

        <button onClick={onAdd}>Add</button>
        <button onClick={onSub}>Sub</button>
        <button onClick={onUpdate}>Update</button>

        {result !== null && (
          <p>
            Result: {result}
          </p>
        )}
      </div> */}
    
    </>
  )
}

export default Function1