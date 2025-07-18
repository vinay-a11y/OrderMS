// document.addEventListener("DOMContentLoaded", () => {
//     const registerForm = document.getElementById("registerForm");
  
//     registerForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
  
//       const phoneInput = document.getElementById("phone");
//       const passwordInput = document.getElementById("password");
  
//       // Simple front-end validation
//       if (!/^\d{10}$/.test(phoneInput.value)) {
//         alert("Please enter a valid 10-digit phone number.");
//         return;
//       }
  
//       if (passwordInput.value.length < 4) {
//         alert("Password must be at least 4 characters long.");
//         return;
//       }
  
//       // Proceed to submit the form data
//       const formData = new FormData(registerForm);
  
//       const response = await fetch("/register", {
//         method: "POST",
//         body: formData
//       });
  
//       const result = await response.json();
  
//       if (response.ok) {
//         document.getElementById("registerForm").classList.add("hidden");
//         document.getElementById("otpSection").classList.remove("hidden");
//         document.querySelector("#phoneDisplay span").textContent = `+91 ${phoneInput.value}`;
//       } else {
//         alert(result.message || "Registration failed.");
//       }
//     });
//   });
 

// document.addEventListener("DOMContentLoaded", () => {
//   const registerForm = document.getElementById("registerForm");
//   const otpSection = document.getElementById("otpSection");
//   const otpForm = document.getElementById("otpForm");
//   const phoneInput = document.getElementById("phone");
//   const passwordInput = document.getElementById("password");

//   // Handle Register -> Store user + Send OTP
//   registerForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const phone = phoneInput.value.trim();
//     const password = passwordInput.value.trim();

//     // Validate phone and password
//     if (!/^\d{10}$/.test(phone)) {
//       alert("Please enter a valid 10-digit phone number.");
//       return;
//     }

//     if (password.length < 4) {
//       alert("Password must be at least 4 characters long.");
//       return;
//     }

//     const formData = new FormData(registerForm);

//     try {
//       // // Register user
//       // const registerRes = await fetch("/register", {
//       //   method: "POST",
//       //   body: formData
//       // });
//       // const registerResult = await registerRes.json();

//       // if (!registerRes.ok) {
//       //   alert(registerResult.detail || "Registration failed.");
//       //   return;
//       // }

//       // Send OTP
//       const otpRes = await fetch("/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: `+91${phone}` })
//       });

//       const otpResult = await otpRes.json();

//       if (otpRes.ok && otpResult.status === "pending") {
//         registerForm.classList.add("hidden");
//         otpSection.classList.remove("hidden");
//         document.querySelector("#phoneDisplay span").textContent = `+91 ${phone}`;
//       } else {
//         alert(otpResult.detail || "Failed to send OTP.");
//       }
//     } catch (error) {
//       alert("Error: " + error.message);
//     }
//   });

//   // Handle OTP Verification
//   otpForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const code = document.getElementById("otp").value.trim();
//     const phone = `+91${phoneInput.value.trim()}`;

//     if (code.length === 0) {
//       alert("Please enter the OTP.");
//       return;
//     }

//     try {
//       const verifyRes = await fetch("/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone, code })
//       });

//       const verifyResult = await verifyRes.json();

//       if (verifyRes.ok && verifyResult.status === "verified") {
//         alert("OTP verified successfully. You are registered.");
//         // Redirect or show success message
//       } else {
//         alert("Invalid OTP. Please try again.");
//       }
//     } catch (error) {
//       alert("Error verifying OTP: " + error.message);
//     }
//   });
// });
// let formData = null;

// document.addEventListener("DOMContentLoaded", () => {
//   const registerForm = document.getElementById("registerForm");
//   const otpSection = document.getElementById("otpSection");
//   const otpForm = document.getElementById("otpForm");
//   const phoneInput = document.getElementById("phone");
//   const passwordInput = document.getElementById("password");

//   const otpErrorText = document.getElementById("otpErrorText");
//   const otpSuccessText = document.getElementById("otpSuccessText");

//   // === Register Form Submit ===
//   registerForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const phone = phoneInput.value.trim();
//     const password = passwordInput.value.trim();

//     if (!/^\d{10}$/.test(phone)) {
//       alert("Please enter a valid 10-digit phone number.");
//       return;
//     }

//     if (password.length < 4) {
//       alert("Password must be at least 4 characters long.");
//       return;
//     }

//     formData = new FormData(registerForm);
    

//     try {
//       // 
//       const otpRes = await fetch("/send-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: `+91${phone}` })
//       });
//       const otpResult = await otpRes.json();

//       if (otpRes.ok && otpResult.status === "pending") {
//         registerForm.classList.add("hidden");
//         otpSection.classList.remove("hidden");
//         document.querySelector("#phoneDisplay span").textContent = `+91 ${phone}`;
//       } else {
//         alert(otpResult.detail || "Failed to send OTP.");
//       }
//     } catch (error) {
//       alert("Error: " + (error?.message || JSON.stringify(error)));
//     }
//   });

//   // === OTP Form Submit ===
//   otpForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const code = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]
//       .map(id => document.getElementById(id).value.trim())
//       .join("");

//     const phone = `+91${phoneInput.value.trim()}`;

//     if (code.length !== 6 || !/^\d{6}$/.test(code)) {
//       otpErrorText.textContent = "Please enter a valid 6-digit OTP.";
//       otpSuccessText.textContent = "";
//       return;
//     }

//     try {
//       const verifyRes = await fetch("/verify-otp", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone, code })
//       });

//       const verifyResult = await verifyRes.json();

//       if (verifyRes.ok && verifyResult.status === "verified") {
//         const response = await fetch("/register", {
//                   method: "POST",
//                   body: formData

//                 });
            
//                 const result = await response.json();
//                 if(response.ok){
//                   otpSuccessText.textContent = "OTP verified successfully. You are registered.";
//                   otpErrorText.textContent = "";
//                 }
//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 10); // Redirect after 1s
//       } else {
//         otpErrorText.textContent = "Invalid OTP. Please try again.";
//         otpSuccessText.textContent = "";
//       }
//     } catch (error) {
//       otpErrorText.textContent = "Error verifying OTP: " + (error?.message || JSON.stringify(error));
//       otpSuccessText.textContent = "";
//     }
//   });

//   // === Auto-focus to next input for OTP fields ===
//   document.querySelectorAll(".otp-input").forEach((input, index, allInputs) => {
//     input.addEventListener("input", () => {
//       if (input.value.length === 1 && index < allInputs.length - 1) {
//         allInputs[index + 1].focus();
//       }
//     });

//     input.addEventListener("keydown", (e) => {
//       if (e.key === "Backspace" && !input.value && index > 0) {
//         allInputs[index - 1].focus();
//       }
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  const otpSection = document.getElementById("otpSection");
  const otpForm = document.getElementById("otpForm");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");

  const otpErrorText = document.getElementById("otpErrorText");
  const otpSuccessText = document.getElementById("otpSuccessText");

  // ✅ Define formData in outer scope
  let formData = null;

  // === Register Form Submit ===
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password.length < 4) {
      alert("Password must be at least 4 characters long.");
      return;
    }

    formData = new FormData(registerForm); // ✅ Store formData for reuse

    try {
      const otpRes = await fetch("/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` })
      });

      const otpResult = await otpRes.json();

      if (otpRes.ok && otpResult.status === "pending") {
        registerForm.classList.add("hidden");
        otpSection.classList.remove("hidden");
        document.querySelector("#phoneDisplay span").textContent = `+91 ${phone}`;
      } else {
        alert(otpResult.detail || "Failed to send OTP.");
      }
    } catch (error) {
      alert("Error: " + (error?.message || JSON.stringify(error)));
    }
  });

  // === OTP Form Submit ===
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const code = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"]
      .map(id => document.getElementById(id).value.trim())
      .join("");

    const phone = `+91${phoneInput.value.trim()}`;

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      otpErrorText.textContent = "Please enter a valid 6-digit OTP.";
      otpSuccessText.textContent = "";
      return;
    }

    try {
      const verifyRes = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code })
      });

      const verifyResult = await verifyRes.json();

      if (verifyRes.ok && verifyResult.status === "verified") {
        // ✅ Send stored formData to register now
        console.log('Sending registration data...');
        const response = await fetch("/register", {
          method: "POST",
          body: formData,
          redirect: 'follow' // This is important for following redirects
        });

        console.log('Registration response:', response);

        if (response.redirected) {
          // If we got redirected, follow the redirect
          window.location.href = response.url;
        } else if (response.ok) {
          otpSuccessText.textContent = "OTP verified successfully. You are registered.";
          otpErrorText.textContent = "";
          // Manual redirect as fallback
          window.location.href = '/login';
        } else {
          const result = await response.json();
          otpErrorText.textContent = result.message || "Registration failed.";
          otpSuccessText.textContent = "";
        }
      } else {
        otpErrorText.textContent = "Invalid OTP. Please try again.";
        otpSuccessText.textContent = "";
      }
    } catch (error) {
      otpErrorText.textContent = "Error verifying OTP: " + (error?.message || JSON.stringify(error));
      otpSuccessText.textContent = "";
    }
  });

  // === Auto-focus to next input for OTP fields ===
  document.querySelectorAll(".otp-input").forEach((input, index, allInputs) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < allInputs.length - 1) {
        allInputs[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && index > 0) {
        allInputs[index - 1].focus();
      }
    });
  });
});
