
export const validateSerialNumber = (serialNumber) => {
    if (serialNumber.length === 0) {
        return ''; // No validation error if the field is empty
      }else if (serialNumber.length < 6) {
       return '';
      }
     
      return '';
  };

 
  
  
  export const validateCodeNumber = (codeNumber) => {
    if (codeNumber.length ===0 ) {
      return '';
    }
  };

  // validation.js


// export const validateEmail = (input) => {
//     if (!input.trim()) {
//         return '';
//     } 
//     else if (!/^[A-Za-z0-9+_.-]+@(.+)$/.test(input.trim())) {
//         return 'Invalid email address';
//     }
//     return '';
// };


export const validateEmail = (input) => {
    let expression = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$");
    if (!input.trim()) {
        return 'Enter a valid email';
    } 
    else if (!expression.test(input.trim())) {
        return 'Enter a valid email';
    }
    return '';
};









export const validatePassword = (input) => {
    if (!input.trim()) {
        return '';
    } else if (input.trim().length < 8) {
        return 'Minimum 8 characters';
    } else if (input.trim().length > 16) {
        return 'Maximum 16 characters';
    }
    return '';
};







  
  