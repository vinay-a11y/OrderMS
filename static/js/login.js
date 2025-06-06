console.log("Login JS loaded");

const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const errorText = document.getElementById("errorText");
const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");

async function handleLogin(event) {
  event.preventDefault();

  const formData = new FormData(loginForm);

  try {
    const response = await fetch("/login", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);

    // if (response.ok) {
    //   successText.textContent = result.message || "Login successful!";
    //   successMessage.style.display = "block";

    //   setTimeout(() => {
    //     window.location.href = "/";
    //   }, 1000);
    // } else {
    //   errorText.textContent = result.detail || "Invalid login credentials.";
    //   errorMessage.style.display = "block";
    // }

    if (response.ok) {
      // ✅ Save user info to localStorage
      if (result.user && result.user.first_name) {
        localStorage.setItem("user", JSON.stringify(result.user));
        successText.textContent = result.message || "Login successful!";
        successMessage.style.display = "block";
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        errorText.textContent = "Invalid user data received";
        errorMessage.style.display = "block";
      }
    } else {
      errorText.textContent = result.detail || "Invalid credentials";
      errorMessage.style.display = "block";
    }
    
  } catch (err) {
    errorText.textContent = "Something went wrong!";
    errorMessage.style.display = "block";
    console.error(err);
  }
}

// ✅ Bind login form submission
loginForm.addEventListener("submit", handleLogin);
