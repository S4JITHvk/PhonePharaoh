
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




// MSG

var err = document.getElementById("err");
  function hideErrorDiv() {
    if (err) {
      err.style.display = "none";
    }
  }

  setTimeout(hideErrorDiv, 3000);


  
//vlaidate form
function validateForm() {
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var confirm = document.getElementById('confirm-password').value;
  var nameError = document.getElementById('nameError');
  var emailError = document.getElementById('emailError');
  var passwordError = document.getElementById('passwordError');
  var confirmError = document.getElementById('confirmError');


  // Reset previous errors
  nameError.innerHTML = "";
  emailError.innerHTML = "";
  passwordError.innerHTML = "";
  confirmError.innerHTML = "";

  // Validate Name
  if (name.trim() === "") {
    nameError.innerHTML = "Name must not be empty or contain only spaces";
    return false; // Prevent form submission
  }

  // Validate Email
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    emailError.innerHTML = "Enter a valid email address";
    return false; // Prevent form submission
  }

  // Validate Password
  if (password.trim().length < 6) {
    passwordError.innerHTML = "Password must be atleast 6 characters";
    return false; // Prevent form submission
  }
  if(password!==confirm){
    confirmError.innerHTML = "Password doesn't match!"
    return false
  }


  return true; // Allow form submission
}