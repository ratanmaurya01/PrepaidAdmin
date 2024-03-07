// Validation for  Generate Recharge Token for Single Meter
import validator from 'validator';

export const validateAmount = (value) => {
  //  const amount = parseInt(value, 10);

    const amount = value.toString().trim();
   
  
    if (amount.charAt(0) === ' ') {
      return 'Leading with space'; // Error message for name starting with a space
  }
    


    // Check if the value is a valid integer
    if (isNaN(amount)) {
        return false;
    } 
    
    // Check if the value is within the range of 1 to 50,000
    if (amount < 1 || amount > 50000) { 
        return false;
    }

    // Check if there are any decimal digits
    if (/\./.test(value)) {
        return false;
    }

    return true;
};



///   remove white space .replace(/\s/g, '')

export const validateEmail1 = (input) => {
  let expression = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$");
  if (!input.trim()) {
      return 'Email address cannot be empty';
  } 
  else if (!expression.test(input.trim())) {
      return 'Invalid email address';
  }
  return '';
};



export function validatePhoneNumber(phoneNumber) {
  const value = phoneNumber.replace(/\D/g, ''); // Remove non-digits

  // Check if the first character is '0'
  if (value.charAt(0) === '0') {
    return "Can't start with Zero";
  }else if (value.charAt(0) === ' ') {
    return ' '; // Error message for name starting with a space
}
  
  return null; // Validation passed, no error message
}



  export function validateAddress(address) {
    const specialCharRegex = /[^a-zA-Z0-9  \-\/()]/;
    if (specialCharRegex.test(address)) {
      return 'Special characters not allowed';
    } else if (address.charAt(0) === ' ') {
      return ''; // Error message for name starting with a space
  }
    return null; // Validation passed, no error message
  }


  

export const validateName = (name) => {
    const alphaNumericRegex = /^[a-zA-Z0-9 ]*$/;
  
    if (!alphaNumericRegex.test(name)) {
      return 'Special Charactor not allowed.';
    }  else if (name.length > 40) {
      return ' '; // Allow names to be up to 20 characters long
    } else if (name.charAt(0) === ' ') {
      return ' '; // Error message for name starting with a space
  }

    return null; // Validation passed, no error message
  };

  

  export function validateEmail(email) {
    if (email && !validator.isEmail(email)) {
      return 'Invalid Email Address.';
    } else if (email.charAt(0) === ' ') {
      return ' '; // Error message for name starting with a space
  }
    return null; // Validation passed, no error message
  }






  export function validateGroupName (groupname ){

    
  }