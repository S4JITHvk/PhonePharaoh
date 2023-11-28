// Toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  }

  
  function validateForm() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var emailError = document.getElementById('emailError');
    var passwordError = document.getElementById('passwordError');
  
    // Reset previous errors
    emailError.innerHTML = "";
    passwordError.innerHTML = "";
  
    // Validate Email
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      emailError.innerHTML = "Enter a valid email address";
      return false; // Prevent form submission
    }
  
//     // Validate Password
//     if (password.trim()=" ") {
//         passwordError.innerHTML = "";
//         passwordError.style.display = "block";
//         passwordError.innerHTML = "Password must be some characters";
//         return false; // Prevent form submission
//     }
  else{
    return true;
   } // Allow form submission
}







// MSG
var err = document.getElementById("err");
function hideErrorDiv() {
  if (err) {
    err.style.display = "none";
  }
}
setTimeout(hideErrorDiv, 3000);


