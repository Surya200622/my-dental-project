/* =========================================
   1. GLOBAL HELPERS & UTILS
   ========================================= */

const API_BASE = ""; // Base URL for API calls

// Helper to show/hide elements with accessibility attributes
function show(el) {
  if (el) {
    el.style.display = "block";
    el.classList.remove("hidden");
    el.setAttribute("aria-hidden", "false");
  }
}

function hide(el) {
  if (el) {
    el.style.display = "none";
    el.classList.add("hidden");
    el.setAttribute("aria-hidden", "true");
  }
}

function $id(id) {
  return document.getElementById(id);
}

/* =========================================
   2. AUTH STATE & UI MANAGEMENT
   ========================================= */

function showMainForUser(name) {
  const authSection = $id("auth-section");
  const mainSite = $id("main-site");
  const userWelcome = $id("userWelcome");
  const logoutBtn = $id("logoutBtn");
  const loader = $id("loaderOverlay");

  hide(authSection);
  show(mainSite);

  if (userWelcome) {
    userWelcome.style.display = "inline-block";
    userWelcome.textContent = `Welcome, ${name} 👋`;
  }

  if (logoutBtn) {
    logoutBtn.style.display = "inline-block";
  }

  // Update nav active state
  document
    .querySelectorAll(".nav a")
    .forEach((a) => a.classList.remove("active"));
  const homeAnchor = document.querySelector('.nav a[href="#home"]');
  if (homeAnchor) homeAnchor.classList.add("active");

  // Show Dashboard Section via switchView logic later, kept hidden by default

  // Ensure landing page is visible
  const landing = $id("landing-page-content");
  if (landing) show(landing);

  // Show User Dropdown
  const userDropdown = $id("userDropdownContainer");
  if (userDropdown) {
    show(userDropdown);
  }

  // Ensure footer is visible on main site
  const footer = $id("mainFooter");
  if (footer) show(footer);

  // Update Profile Pic Immediately
  const storedProfilePic = localStorage.getItem("userProfilePic");
  const headerProfilePic = $id("headerProfilePic");
  if (headerProfilePic && storedProfilePic) {
    headerProfilePic.src = storedProfilePic;
    headerProfilePic.style.display = "inline-block";
  } else if (headerProfilePic) {
    // Default avatar
    headerProfilePic.src =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300b8b8"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
    headerProfilePic.style.display = "inline-block";
  }

  // Load Dashboard Data
  loadDashboard(name);

  // Reload Ratings to show Edit/Delete buttons
  if (window.loadRatings) {
    window.loadRatings();
  }
}

function switchView(view) {
  const landing = $id("landing-page-content");
  const dashboard = $id("dashboard");
  const menu = $id("userDropdownMenu");
  const footer = $id("mainFooter");

  // Close dropdown if open
  if (menu) menu.classList.remove("active");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (view === "dashboard") {
    if (landing) hide(landing);
    if (dashboard) show(dashboard);
    if (footer) hide(footer); // Hide footer on dashboard
  } else {
    if (dashboard) hide(dashboard);
    if (landing) show(landing);
    if (footer) show(footer); // Show footer on landing page
  }
}

function showAuth() {
  const authSection = $id("auth-section");
  const mainSite = $id("main-site");

  show(authSection);
  hide(mainSite);

  // Reset welcome text if needed (optional)
  const welcomeSpan = $id("userWelcome");
  if (welcomeSpan) welcomeSpan.textContent = "Welcome, User";
}

// Check Login Status on Load
// Check Login Status on Load
// Check Login Status on Load
window.addEventListener("load", function () {
  const loader = $id("loaderOverlay");

  // Safety: Force hide loader after 5s max if logic fails elsewhere
  setTimeout(() => {
    if (loader && loader.style.display !== "none") {
      console.warn("Loader forced hide due to timeout");
      loader.style.display = "none";
    }
  }, 5000);

  // Simulate loader delay for smooth UX
  setTimeout(() => {
    if (loader) loader.style.opacity = "0";
  }, 1100);

  setTimeout(() => {
    if (loader) loader.style.display = "none";

    try {
      // Safely access localStorage
      let isAdmin = false;
      let isUser = false;
      let storedName = "User";
      let storedProfilePic = "";

      try {
        isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";
        isUser = localStorage.getItem("isLoggedIn") === "true";
        storedName = localStorage.getItem("userName") || "User";
        storedProfilePic = localStorage.getItem("userProfilePic") || "";
      } catch (e) {
        console.warn("LocalStorage access failed:", e);
        // Fallback to Guest
      }

      const mainSite = $id("main-site");
      const authSection = $id("auth-section");
      const adminDash = $id("admin-dashboard");

      if (isAdmin) {
        // 1. Admin Logic
        hide(authSection);
        show(mainSite); // Parent container

        hide($id("landing-page-content"));
        hide($id("mainFooter"));

        // Explicitly hide Header
        const header = document.querySelector(".header");
        if (header) header.style.display = "none";

        show(adminDash);
        if (window.loadAdminDashboard) loadAdminDashboard();

        // Accessibility
        if (mainSite) mainSite.setAttribute("aria-hidden", "false");
        if (authSection) authSection.setAttribute("aria-hidden", "true");
      } else if (isUser) {
        // 2. User Logic - Show main website with user profile

        // Ensure Header is visible
        const header = document.querySelector(".header");
        if (header) header.style.display = "";

        // Set user welcome text
        const userWelcome = $id("userWelcome");
        if (userWelcome) {
          userWelcome.style.display = "inline-block";
          userWelcome.textContent = `Welcome, ${storedName} 👋`;
        }

        // Set user profile picture if available
        const headerProfilePic = $id("headerProfilePic");
        if (headerProfilePic && storedProfilePic) {
          headerProfilePic.src = storedProfilePic;
          headerProfilePic.style.display = "inline-block";
        } else if (headerProfilePic) {
          // Use default avatar if no picture
          headerProfilePic.src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2300b8b8"%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
          headerProfilePic.style.display = "inline-block";
        }

        // Show User Dropdown Container
        const userDropdown = $id("userDropdownContainer");
        if (userDropdown) {
          userDropdown.style.display = "block";
        }

        // Show main site elements
        hide(authSection);
        show(mainSite);

        const landing = $id("landing-page-content");
        if (landing) show(landing);
        const footer = $id("mainFooter");
        if (footer) show(footer);

        // Update nav active state
        document
          .querySelectorAll(".nav a")
          .forEach((a) => a.classList.remove("active"));
        const homeAnchor = document.querySelector('.nav a[href="#home"]');
        if (homeAnchor) homeAnchor.classList.add("active");

        // Load Dashboard Data (silently)
        if (window.loadDashboard) loadDashboard(storedName);

        if (mainSite) mainSite.setAttribute("aria-hidden", "false");
        if (authSection) authSection.setAttribute("aria-hidden", "true");
      } else {
        // 3. Guest Logic
        showAuth();

        if (mainSite) mainSite.setAttribute("aria-hidden", "true");
        if (authSection) authSection.setAttribute("aria-hidden", "false");
      }
    } catch (error) {
      console.error("Main initialization error:", error);
      // Fallback: Show Auth
      showAuth();
    }
  }, 1700);
});

// Logout Handler
// Logout Handler
window.logout = function () {
  localStorage.clear();

  // Reset forms
  const loginForm = $id("loginForm");
  const signupForm = $id("signupForm");
  if (loginForm) loginForm.reset();
  if (signupForm) signupForm.reset();

  // Reset UI
  showAuth();
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Explicitly hide admin dashboard if open
  const adminDash = $id("admin-dashboard");
  if (adminDash) hide(adminDash);

  // Show Navbar again
  const header = document.querySelector(".header");
  if (header) header.style.display = "flex"; // or block/flex based on css. Default for header is usually block but checks css. Assuming flex due to row.
  // Check style.css: header is usually block, row is flex.
  // Safest is remove inline style: header.style.display = '';
  if (header) header.style.display = "";

  // Reset admin toggle
  const toggle = $id("adminLoginToggle");
  if (toggle) {
    toggle.checked = false;
    // Trigger change event to reset placeholders
    const event = new Event("change");
    toggle.dispatchEvent(event);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = $id("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  }

  // Dashboard Link Handler
  const dashLink = $id("dashLink");
  if (dashLink) {
    dashLink.addEventListener("click", (e) => {
      e.preventDefault();
      switchView("dashboard");
    });
  }

  // Home Link / Logo Handlers (to return from Dashboard)
  const logo = document.querySelector(".logo");
  const homeLink = document.querySelector('.nav a[href="#home"]');

  if (logo) {
    logo.addEventListener("click", (e) => {
      // e.preventDefault(); // allow default hash check but ensure view switches
      switchView("landing");
    });
  }
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      // Let smooth scroll happen if already on landing, but ensure view is landing
      switchView("landing");
    });
  }
});

/* =========================================
   3. FORM TOGGLING (Login <-> Signup)
   ========================================= */

function setupToggle() {
  // We attach listener to the container so we can catch dynamic updates if needed,
  // but here we just re-attach to the specific link ID.
  const toggleLink = $id("toggleLink");
  if (toggleLink) {
    // Clone to remove old listeners if re-running
    const newBtn = toggleLink.cloneNode(true);
    toggleLink.parentNode.replaceChild(newBtn, toggleLink);

    newBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const loginForm = $id("loginForm");
      const signupForm = $id("signupForm");
      const formTitle = $id("form-title");
      const toggleText = document.querySelector(".toggle-text");
      const msg = $id("loginMessage") || $id("message");
      const sMsg = $id("signupMessage");

      if (loginForm.style.display === "none") {
        // Show Login
        loginForm.style.display = "block";
        signupForm.style.display = "none";
        formTitle.textContent = "Login";
        toggleText.innerHTML =
          'Don\'t have an account? <a href="#" id="toggleLink">Sign Up</a>';
      } else {
        // Show Signup
        loginForm.style.display = "none";
        signupForm.style.display = "block";
        formTitle.textContent = "Sign Up";
        toggleText.innerHTML =
          'Already have an account? <a href="#" id="toggleLink">Login</a>';
      }

      // Clear messages
      if (msg) msg.textContent = "";
      if (sMsg) sMsg.textContent = "";

      setupToggle(); // Re-attach listener to the newly created HTML string link
    });
  }

  // Admin Login Toggle Logic
  const adminToggle = $id("adminLoginToggle");
  if (adminToggle) {
    adminToggle.addEventListener("change", function () {
      const loginEmail = $id("loginEmail");
      const loginPassword = $id("loginPassword");
      const formTitle = $id("form-title");

      if (this.checked) {
        loginEmail.placeholder = "Username";
        loginEmail.type = "text";
        if (formTitle) formTitle.textContent = "Admin Login";
      } else {
        loginEmail.placeholder = "Email";
        loginEmail.type = "email";
        if (formTitle) formTitle.textContent = "Login";
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", setupToggle);

/* =========================================
   4. INTERACTIVE UI (Password, Menu, Scroll)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Password Toggle
  document.querySelectorAll(".pwd-toggle").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const targetId = this.getAttribute("data-target");
      const input = $id(targetId);
      if (!input) return;

      if (input.type === "password") {
        input.type = "text";
        this.innerHTML = '<i class="fas fa-unlock"></i>';
        this.setAttribute("aria-pressed", "true");
      } else {
        input.type = "password";
        this.innerHTML = '<i class="fas fa-lock"></i>';
        this.setAttribute("aria-pressed", "false");
      }
    });
  });

  // Mobile Menu
  const btnMenu = $id("menu-btn");
  const navbar = document.querySelector(".header .nav");
  const header = document.querySelector(".header");

  if (btnMenu && navbar) {
    btnMenu.addEventListener("click", function () {
      btnMenu.classList.toggle("fa-times");
      navbar.classList.toggle("active");
    });
  }

  if (header) {
    window.addEventListener("scroll", function () {
      if (btnMenu) btnMenu.classList.remove("fa-times");
      if (navbar) navbar.classList.remove("active");

      if (window.scrollY > 30) header.classList.add("active");
      else header.classList.remove("active");
    });
  }

  // Smooth Scroll Active State
  document.querySelectorAll(".nav a").forEach((a) => {
    a.addEventListener("click", function () {
      document
        .querySelectorAll(".nav a")
        .forEach((x) => x.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Read More Buttons - Each blog card expands independently
  document.querySelectorAll(".read-more-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      // Find the blog-text within the same parent box
      const parentBox = this.closest(".box");
      const blogText = parentBox.querySelector(".blog-text");

      if (blogText) {
        blogText.classList.toggle("expanded");
        this.textContent = blogText.classList.contains("expanded")
          ? "Read Less"
          : "Read More";
      }
    });
  });
});

// About Section Read More Toggle (Global function)
function toggleAboutContent() {
  console.log("toggleAboutContent called");
  const moreContent = document.getElementById("aboutMoreContent");
  const btn = document.getElementById("aboutReadMoreBtn");

  console.log("moreContent:", moreContent);
  console.log("btn:", btn);
  console.log(
    "current display:",
    moreContent ? moreContent.style.display : "element not found"
  );

  if (!moreContent || !btn) {
    console.error("Elements not found!");
    return;
  }

  if (
    moreContent.style.display === "none" ||
    moreContent.style.display === ""
  ) {
    moreContent.style.display = "block";
    btn.textContent = "Read Less";
    console.log("Expanded content");
  } else {
    moreContent.style.display = "none";
    btn.textContent = "Read More";
    console.log("Collapsed content");
  }
}

/* =========================================
   5. SERVER API CALLS (Login, Signup, etc.)
   ========================================= */

// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const CURRENCY = "₹";
console.log(`[DEBUG] Script loaded. API_BASE is: ${API_BASE}`);
// --------------------------------------------------

// --- LOGIN ---
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = $id("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Try different possible IDs for message and inputs
      const message = $id("loginMessage") || $id("message");
      const emailInput = $id("loginEmail");
      const passwordInput = $id("loginPassword");

      if (!emailInput || !passwordInput) return;

      if (message) {
        message.textContent = "Logging in...";
        message.style.color = "blue";
      }

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        if (message) {
          message.textContent = "Please enter email and password";
          message.style.color = "red";
        }
        return;
      }

      try {
        // Check if Admin Login
        const isAdmin =
          $id("adminLoginToggle") && $id("adminLoginToggle").checked;
        const payload = isAdmin
          ? { username: email, password: password, type: "admin" }
          : { email: email, password: password, type: "user" };

        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (message) {
          message.textContent = result.message;
          message.style.color = result.status === "success" ? "green" : "red";
        }

        if (result.status === "success") {
          if (result.role === "admin") {
            // Admin Login Success
            localStorage.setItem("isAdminLoggedIn", "true");
            localStorage.setItem("adminUsername", result.user.name);

            // Redirect/Show Admin Dashboard
            hide($id("auth-section"));

            // Ensure parent container is visible but landing page is hidden
            const mainSite = $id("main-site");
            if (mainSite) {
              show(mainSite);
              // Hide User Specifics
              const landing = $id("landing-page-content");
              if (landing) hide(landing);
              const footer = $id("mainFooter");
              if (footer) hide(footer);
              // Hide Navbar as well
              const header = document.querySelector(".header");
              if (header) header.style.display = "none";
            }

            show($id("admin-dashboard"));
            loadAdminDashboard();
          } else {
            // User Login Success
            localStorage.setItem("userEmail", result.user.email);
            localStorage.setItem("userName", result.user.name);
            // Store profile picture if available
            if (result.user.profile_pic) {
              localStorage.setItem("userProfilePic", result.user.profile_pic);
            }
            localStorage.setItem("userId", result.user.id);
            localStorage.setItem("isLoggedIn", "true");

            setTimeout(() => showMainForUser(result.user.name), 1000);
          }
        }
      } catch (error) {
        if (message) {
          message.textContent = "Error: " + error.message;
          message.style.color = "red";
        }
      }
    });
  }
});

// --- SIGNUP ---
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = $id("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const signupMessage = $id("signupMessage");
      if (signupMessage) {
        signupMessage.textContent = "Creating account...";
        signupMessage.style.color = "blue";
      }

      const name = $id("signupName") ? $id("signupName").value.trim() : "";
      const email = $id("signupEmail") ? $id("signupEmail").value.trim() : "";
      const password = $id("signupPassword") ? $id("signupPassword").value : "";
      const passwordConfirm = $id("confirmPassword")
        ? $id("confirmPassword").value
        : "";

      if (!name || !email || !password || !passwordConfirm) {
        if (signupMessage) {
          signupMessage.textContent = "All fields are required";
          signupMessage.style.color = "red";
        }
        return;
      }

      if (password !== passwordConfirm) {
        if (signupMessage) {
          signupMessage.textContent = "Passwords do not match";
          signupMessage.style.color = "red";
        }
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("passwordConfirm", passwordConfirm);

      // Add new profile fields (optional)
      const age = $id("signupAge") ? $id("signupAge").value : "";
      const bloodGroup = $id("signupBloodGroup")
        ? $id("signupBloodGroup").value
        : "";
      const gender = $id("signupGender") ? $id("signupGender").value : "";

      if (age) formData.append("age", age);
      if (bloodGroup) formData.append("bloodGroup", bloodGroup);
      if (gender) formData.append("gender", gender);

      const fileInput = $id("signupPic");
      if (fileInput && fileInput.files[0]) {
        formData.append("profilePic", fileInput.files[0]);
      }

      try {
        const res = await fetch(`${API_BASE}/signup`, {
          method: "POST",
          // headers: { "Content-Type": "application/json" }, // Remove Content-Type for FormData
          body: formData,
        });

        const result = await res.json();
        if (signupMessage) {
          signupMessage.textContent = result.message;
          signupMessage.style.color =
            result.status === "success" ? "green" : "red";
        }

        if (result.status === "success") {
          signupForm.reset();
          // Switch to login
          setTimeout(() => {
            const loginForm = $id("loginForm");
            if (loginForm) loginForm.style.display = "block";
            signupForm.style.display = "none";
            $id("form-title").textContent = "Login";
            document.querySelector(".toggle-text").innerHTML =
              'Don\'t have an account? <a href="#" id="toggleLink">Sign Up</a>';
            const lMsg = $id("loginMessage");
            if (lMsg) {
              lMsg.textContent = "Account created! Please login.";
              lMsg.style.color = "green";
            }
            setupToggle();
          }, 2000);
        }
      } catch (error) {
        if (signupMessage) {
          signupMessage.textContent = "Error: " + error.message;
          signupMessage.style.color = "red";
        }
      }
    });
  }
});

// --- APPOINTMENT ---
document.addEventListener("DOMContentLoaded", () => {
  const appointmentForm = $id("sheetForm");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formMessage = $id("form-message");
      if (formMessage) {
        formMessage.textContent = "Booking appointment...";
        formMessage.style.color = "blue";
      }

      const formData = new FormData(appointmentForm);
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        number: formData.get("number"),
        doctor: formData.get("doctor"),
        appointmentDate: formData.get("date"),
      };

      try {
        const res = await fetch(`${API_BASE}/appointment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await res.json();
        if (formMessage) {
          formMessage.textContent = result.message;
          formMessage.style.color =
            result.status === "success" ? "green" : "red";
        }

        if (result.status === "success") {
          appointmentForm.reset();
        }
      } catch (error) {
        if (formMessage) {
          formMessage.textContent = "Error: " + error.message;
          formMessage.style.color = "red";
        }
      }
    });
  }
});

// --- CONTACT ---
window.sendEmail = async function () {
  // This function is called by the button onclick in HTML potentially,
  // or we can attach listener if we fix HTML.
  // For safety, we keep global scope.
  const name = $id("contactName").value.trim();
  const email = $id("contactEmail").value.trim();
  const number = $id("contactNumber").value.trim();
  const message = $id("contactMessage").value.trim();
  const msgBox = $id("callback-message");

  if (!name || !email || !number || !message) {
    msgBox.innerHTML = '<span style="color:red">All fields are required</span>';
    return;
  }

  msgBox.innerHTML = '<span style="color:blue">Sending...</span>';

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactName: name,
        contactEmail: email,
        contactNumber: number,
        contactMessage: message,
      }),
    });

    const result = await res.json();
    msgBox.innerHTML = `<span style="color:${
      result.status === "success" ? "green" : "red"
    }">${result.message}</span>`;

    if (result.status === "success") {
      $id("contactForm").reset();
    }
  } catch (error) {
    msgBox.innerHTML =
      '<span style="color:red">Error: ' + error.message + "</span>";
  }
};

/* =========================================
   6. DASHBOARD LOGIC
   ========================================= */

async function loadDashboard(currentName) {
  const email = localStorage.getItem("userEmail");
  if (!email) return;

  // 1. Get Profile
  try {
    console.log(`Fetching profile for: ${email}`);
    const res = await fetch(
      `${API_BASE}/user-profile?email=${encodeURIComponent(
        email
      )}&t=${Date.now()}`
    );
    console.log(`Response status: ${res.status}`);

    if (!res.ok) {
      console.error("Server returned error:", res.status);
      return;
    }

    const data = await res.json();
    console.log("Profile Data:", data);

    if (data.status === "success") {
      $id("dashName").textContent = data.user.name;
      $id("dashEmail").textContent = data.user.email;
      $id("dashAge").textContent = data.user.age || "Not set";
      $id("dashBloodGroup").textContent = data.user.blood_group || "Not set";
      $id("dashGender").textContent = data.user.gender || "Not set";

      if (data.user.profile_pic) {
        $id("dashAvatar").src = `${API_BASE}${data.user.profile_pic}`;
      }
    } else {
      // If failed (e.g. db error), fallback to local
      $id("dashName").textContent = currentName || "User";
    }
  } catch (e) {
    console.error("Profile load error", e);
  }

  // 2. Get Appointments
  try {
    const res = await fetch(`${API_BASE}/my-appointments?email=${email}`);
    const data = await res.json();

    const list = $id("appointmentsList");
    if (data.status === "success" && data.appointments.length > 0) {
      list.innerHTML = data.appointments
        .map((appt) => {
          const st = appt.status || "Scheduled";
          let stColor = "#00b8b8"; // Default Teal (Scheduled, etc)

          if (st === "Confirmed" || st === "Completed")
            stColor = "#28a745"; // Green
          else if (st === "Pending Payment" || st === "Rescheduled")
            stColor = "#00b8b8"; // Yellow/Orange
          else if (
            st.includes("Cancelled") ||
            st === "Rejected" ||
            st === "No Show"
          )
            stColor = "#dc3545"; // Red

          return `
                <div style="background:#f9f9f9; padding:1.5rem; margin-bottom:1rem; border-left:4px solid ${stColor}; border-radius:4px;">
                    <h4 style="font-size:1.6rem; color:#333;">${
                      appt.doctor || "Specialist"
                    }</h4>
                    <p style="font-size:1.3rem; color:#555;">Date: ${new Date(
                      appt.appointment_date
                    ).toLocaleString()}</p>
                    <p style="font-size:1.3rem; color:#777;">Phone: ${
                      appt.phone
                    }</p>
                    <p style="font-size:1.3rem; color:${stColor}; font-weight:bold;">Status: ${st}</p>
                </div>
            `;
        })
        .join("");
    } else {
      list.innerHTML =
        '<p style="font-size:1.4rem; padding:1rem; background:#f9f9f9;">No appointments found.</p>';
    }
  } catch (e) {
    console.error("Appointments load error", e);
  }

  // 3. Load Reports (Immediately)
  if (window.loadUserReports) {
    window.loadUserReports(email);
  }
}

// Edit Profile Handlers
document.addEventListener("DOMContentLoaded", () => {
  const editBtn = $id("editProfileBtn");
  const saveBtn = $id("saveProfileBtn");
  const cancelBtn = $id("cancelProfileBtn");
  const nameEl = $id("dashName");
  const ageEl = $id("dashAge");
  const bloodGroupEl = $id("dashBloodGroup");
  const genderEl = $id("dashGender");
  const ageInput = $id("editAgeInput");
  const bloodGroupInput = $id("editBloodGroupInput");
  const genderInput = $id("editGenderInput");
  const picInput = $id("editProfilePicInput");
  const picHint = $id("editPicHint");
  const avatar = $id("dashAvatar");

  let originalName = "";
  let originalAge = "";
  let originalBloodGroup = "";
  let originalGender = "";
  let originalPicSrc = "";

  // Trigger file input
  if (avatar) {
    // Check if avatar exists
    avatar.addEventListener("click", () => {
      if (saveBtn.style.display !== "none") picInput.click();
    });
  }
  if (picHint) {
    picHint.addEventListener("click", () => picInput.click());
  }

  // Preview Image
  if (picInput) {
    // Check if picInput exists
    picInput.addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          avatar.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
    });
  }

  if (editBtn) {
    // Check if editBtn exists
    editBtn.addEventListener("click", () => {
      originalName = nameEl.textContent;
      originalAge = ageEl.textContent;
      originalBloodGroup = bloodGroupEl.textContent;
      originalGender = genderEl.textContent;
      originalPicSrc = avatar.src;

      // Replace Name with Input
      const currentName = nameEl.textContent;
      nameEl.innerHTML = `<input type="text" id="editNameInput" value="${currentName}" style="font-size:2rem; text-align:center; border:1px solid #ddd; padding:0.5rem; border-radius:0.5rem; width:80%;">`;

      // Show input fields and hide display fields
      ageInput.style.display = "block";
      ageInput.value = ageEl.textContent === "Not set" ? "" : ageEl.textContent;
      ageEl.style.display = "none";

      bloodGroupInput.style.display = "block";
      bloodGroupInput.value =
        bloodGroupEl.textContent === "Not set" ? "" : bloodGroupEl.textContent;
      bloodGroupEl.style.display = "none";

      genderInput.style.display = "block";
      genderInput.value =
        genderEl.textContent === "Not set" ? "" : genderEl.textContent;
      genderEl.style.display = "none";

      // Show Hint & Cursor
      if (picHint) picHint.style.display = "block";
      avatar.style.cursor = "pointer";
      avatar.style.border = "3px dashed #00b8b8";

      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
      cancelBtn.style.display = "inline-block";
    });
  }

  if (cancelBtn) {
    // Check if cancelBtn exists
    cancelBtn.addEventListener("click", () => {
      // Revert Name
      nameEl.textContent = originalName;

      // Revert all fields
      ageEl.style.display = "block";
      ageInput.style.display = "none";

      bloodGroupEl.style.display = "block";
      bloodGroupInput.style.display = "none";

      genderEl.style.display = "block";
      genderInput.style.display = "none";

      // Revert Pic
      avatar.src = originalPicSrc;
      if (picHint) picHint.style.display = "none";
      avatar.style.cursor = "default";
      avatar.style.border = "3px solid #00b8b8";
      picInput.value = ""; // Clear input

      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
    });
  }

  if (saveBtn) {
    // Check if saveBtn exists
    saveBtn.addEventListener("click", async () => {
      const nameInput = $id("editNameInput");
      const newName = nameInput.value;
      const newAge = ageInput.value;
      const newBloodGroup = bloodGroupInput.value;
      const newGender = genderInput.value;
      const email = $id("dashEmail").textContent;

      // Optimistic Update
      nameEl.textContent = newName;
      ageEl.textContent = newAge || "Not set";
      ageEl.style.display = "block";
      ageInput.style.display = "none";

      bloodGroupEl.textContent = newBloodGroup || "Not set";
      bloodGroupEl.style.display = "block";
      bloodGroupInput.style.display = "none";

      genderEl.textContent = newGender || "Not set";
      genderEl.style.display = "block";
      genderInput.style.display = "none";

      // Hide Edit Controls
      editBtn.style.display = "inline-block";
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";
      if (picHint) picHint.style.display = "none";
      avatar.style.cursor = "default";
      avatar.style.border = "3px solid #00b8b8";

      // Prepare Data
      const formData = new FormData();
      formData.append("email", email);
      formData.append("name", newName);
      formData.append("age", newAge);
      formData.append("bloodGroup", newBloodGroup);
      formData.append("gender", newGender);
      if (picInput.files[0]) {
        formData.append("profilePic", picInput.files[0]);
      }

      // Call API
      try {
        const res = await fetch(`${API_BASE}/update-profile`, {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (result.status !== "success") {
          alert("Failed to save changes: " + result.message);
          // Revert on error?
        } else {
          // Update local storage name if changed
          localStorage.setItem("userName", newName);
          $id("userWelcome").textContent = `Welcome, ${newName} 👋`;
          if (result.newPic) {
            avatar.src = `${API_BASE}${result.newPic}`;
          }
        }
      } catch (e) {
        alert("Error saving profile");
      }
    });
  }
});

/* =========================================
   7. DROPDOWN INTERACTION
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = $id("userMenuBtn");
  const menu = $id("userDropdownMenu");

  if (menuBtn && menu) {
    // Toggle
    menuBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      menu.classList.toggle("active");

      // Toggle arrow
      const icon = menuBtn.querySelector(".fa-chevron-down");
      if (icon) {
        icon.style.transform = menu.classList.contains("active")
          ? "rotate(180deg)"
          : "rotate(0deg)";
      }
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove("active");
        const icon = menuBtn.querySelector(".fa-chevron-down");
        if (icon) icon.style.transform = "rotate(0deg)";
      }
    });

    // Close when clicking an item
    menu.querySelectorAll(".dropdown-item").forEach((item) => {
      item.addEventListener("click", () => {
        menu.classList.remove("active");
        const icon = menuBtn.querySelector(".fa-chevron-down");
        if (icon) icon.style.transform = "rotate(0deg)";
      });
    });
  }
});

/* =========================================
   8. ADMIN DASHBOARD LOGIC
   ========================================= */

window.showAdminTab = function (tabName) {
  // Hide all contents
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((el) => (el.style.display = "none"));

  // Show selected
  const selected = $id(`admin-content-${tabName}`);
  if (selected) selected.style.display = "block";

  // Update buttons
  document
    .querySelectorAll(".admin-tabs .link-btn")
    .forEach((btn) => btn.classList.remove("active-tab"));
  // Ideally add active class to clicked button, but simple logic for now
  event.target.classList.add("active-tab");
};

async function loadAdminDashboard() {
  try {
    const res = await fetch(`${API_BASE}/admin-dashboard-data?t=${Date.now()}`);
    const data = await res.json();

    if (data.status === "success") {
      // Stats
      $id("stat-total-users").textContent = data.stats.users;
      $id("stat-total-appointments").textContent = data.stats.appointments;
      $id("stat-total-doctors").textContent = data.stats.doctors;

      // Users Table
      const usersTbody = $id("users-table-body");
      if (data.users.length > 0) {
        usersTbody.innerHTML = data.users
          .map((u) => {
            // Backend sends relative path (e.g. profile_pics/img.jpg)
            let picSrc =
              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            if (u.profile_pic) {
              picSrc =
                u.profile_pic.startsWith("http") ||
                u.profile_pic.startsWith("/uploads")
                  ? u.profile_pic
                  : `/uploads/${u.profile_pic}`;
            }

            return `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 1rem;">
                            <img src="${picSrc}" alt="User" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px; vertical-align: middle;">
                            ${u.name}
                        </td>
                        <td style="padding: 1rem;">${u.email}</td>
                        <td style="padding: 1rem;">${u.age || "-"}</td>
                        <td style="padding: 1rem;">${u.gender || "-"}</td>
                        <td style="padding: 1rem;">${u.blood_type || "-"}</td>
                    </tr>
                `;
          })
          .join("");
      } else {
        usersTbody.innerHTML =
          '<tr><td colspan="5" style="padding:1rem;">No users found.</td></tr>';
      }

      // Appointments Table
      const apptTbody = $id("appointments-table-body");
      if (data.appointments.length > 0) {
        const statusOptions = [
          "Scheduled",
          "Confirmed",
          "Rescheduled",
          "Completed",
          "Cancelled by Admin",
          "Cancelled by Patient",
          "No Show",
          "Pending Payment",
          "Rejected",
        ];
        apptTbody.innerHTML = data.appointments
          .map((a) => {
            const rawStatus = a.status ? a.status.trim() : "";
            console.log(
              `ID: ${a.id}, RawStatus: '${a.status}', Parsed: '${rawStatus}'`
            ); // Debug Log
            const currentStatus =
              rawStatus.length > 0 ? rawStatus : "Scheduled";

            let statusColor = "#00b8b8"; // Default Teal
            if (currentStatus.toLowerCase() === "rescheduled")
              statusColor = "red";

            // Debug
            if (currentStatus === "Rescheduled")
              console.log(`Rendering Rescheduled for ID ${a.id}`);

            return `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 1rem;">${a.name}</td>
                        <td style="padding: 1rem;">${a.doctor}</td>
                        <td style="padding: 1rem;">${new Date(
                          a.appointment_date
                        ).toLocaleString()}</td>
                         <td style="padding: 1rem;">${a.phone}</td>
                         <td style="padding: 1rem;">
                             <span style="margin-right:1rem; font-weight:bold; color:${statusColor};">${currentStatus}</span>
                             <button class="link-btn" onclick="openEditApptModal(${
                               a.id
                             })" style="padding:0.5rem 1rem; font-size:1.2rem;">Edit</button>
                         </td>
                    </tr>
                `;
          })
          .join("");
      } else {
        apptTbody.innerHTML =
          '<tr><td colspan="5" style="padding:1rem;">No appointments found.</td></tr>';
      }

      // Store doctors and appointments for modal access
      window.adminData = {
        doctors: data.doctors,
        appointments: data.appointments,
      };

      // Doctors List
      renderDoctorsList(data.doctors);
    }
  } catch (e) {
    console.error("Failed to load admin dashboard", e);
  }
}

function renderDoctorsList(doctors) {
  const list = $id("doctors-list");
  if (!list) return;

  if (doctors.length > 0) {
    list.innerHTML = doctors
      .map(
        (d) => `
            <li style="background: #f9f9f9; padding: 1rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid #eee;">
                <div>
                    <strong>${d.name}</strong> <br> <span style="color: #666; font-size: 1.2rem;">${d.specialization}</span>
                </div>
                <button onclick="deleteDoctor(${d.id})" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px;">Delete</button>
            </li>
        `
      )
      .join("");
  } else {
    list.innerHTML = '<li style="padding:1rem;">No doctors added yet.</li>';
  }
}

// Add Doctor Handler
document.addEventListener("DOMContentLoaded", () => {
  const addDocForm = $id("addDoctorForm");
  if (addDocForm) {
    addDocForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $id("newDocName").value;
      const spec = $id("newDocSpec").value;

      const formData = new FormData();
      formData.append("name", name);
      formData.append("specialization", spec);

      try {
        const res = await fetch(`${API_BASE}/api/manage-doctor`, {
          method: "POST",
          body: formData,
        });
        const result = await res.json();
        if (result.status === "success") {
          alert("Doctor added!");
          addDocForm.reset();
          loadAdminDashboard(); // Refresh
        } else {
          alert("Error: " + result.message);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  // Admin Settings Handler
  const settingsForm = $id("adminSettingsForm");
  if (settingsForm) {
    $id("adminCurrentUsername").value =
      localStorage.getItem("adminUsername") || "dentalexperts";

    settingsForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newUsername = $id("adminNewUsername").value;
      const newPassword = $id("adminNewPassword").value;
      const currentUsername = localStorage.getItem("adminUsername"); // Use stored

      try {
        const res = await fetch(`${API_BASE}/api/update-admin-credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: newUsername,
            password: newPassword,
            current_username: currentUsername,
          }),
        });
        const result = await res.json();
        $id("adminSettingsMsg").textContent = result.message;
        if (result.status === "success") {
          $id("adminSettingsMsg").style.color = "green";
          setTimeout(() => {
            localStorage.clear();
            location.reload();
          }, 2000);
        } else {
          $id("adminSettingsMsg").style.color = "red";
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
});

window.deleteDoctor = async function (id) {
  if (!confirm("Are you sure you want to delete this doctor?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/manage-doctor?action=delete`, {
      method: "POST",
      body: JSON.stringify({ id: id }),
    });
    const result = await res.json();
    if (result.status === "success") {
      loadAdminDashboard(); // Refresh
    } else {
      alert("Failed to delete");
    }
  } catch (e) {
    console.error(e);
  }
};

// Edit Appointment Modal Logic
window.openEditApptModal = function (id) {
  const appt = window.adminData.appointments.find((a) => a.id === id);
  if (!appt) return;

  $id("editApptId").value = appt.id;

  // Populate Doctors
  // If the current doctor is not in the managed list, add them as an option
  const doctors = window.adminData.doctors || [];
  let docOptions = doctors
    .map(
      (d) =>
        `<option value="${d.name}" ${
          d.name === appt.doctor ? "selected" : ""
        }>${d.name}</option>`
    )
    .join("");

  // Check if current doctor is in the list
  const doctorExists = doctors.some((d) => d.name === appt.doctor);
  if (appt.doctor && !doctorExists) {
    docOptions =
      `<option value="${appt.doctor}" selected>${appt.doctor} (Not in managed list)</option>` +
      docOptions;
  }

  const docSelect = $id("editApptDoctor");
  docSelect.innerHTML = docOptions;

  // Date (Needs ISO format for input type=datetime-local: YYYY-MM-DDTHH:mm)
  let dateStr = appt.appointment_date;
  if (dateStr) {
    // Ensure "T" separator
    dateStr = dateStr.replace(" ", "T");
    // Trim to minutes
    if (dateStr.length > 16) dateStr = dateStr.substring(0, 16);
  }
  $id("editApptDate").value = dateStr;

  $id("editApptStatus").value = appt.status || "Scheduled";

  $id("editApptModal").style.display = "flex";
};

window.closeEditApptModal = function () {
  $id("editApptModal").style.display = "none";
};

$id("editApptForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const id = $id("editApptId").value;
  const doctor = $id("editApptDoctor").value;
  const date = $id("editApptDate").value;
  const status = $id("editApptStatus").value;

  // Debug: verify what we are sending
  // alert(`Sending Status: [${status}]`);

  try {
    const res = await fetch(`${API_BASE}/api/update-appointment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, doctor, date, status }),
    });
    const result = await res.json();

    if (result.status === "success") {
      closeEditApptModal();
      // Force reload to bypass cache
      loadAdminDashboard();
      alert(`Status Updated to: ${result.updated_data.status}`);
    } else {
      alert("Update failed: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred: " + err);
  }
});

/* =========================================
   9. GLOBAL INIT (Doctors Load)
   ========================================= */
document.addEventListener("DOMContentLoaded", async () => {
  // Load Doctors into Appointment Form
  try {
    const res = await fetch(`${API_BASE}/api/get-doctors`);
    const data = await res.json();

    if (data.status === "success" && data.doctors.length > 0) {
      const select = document.querySelector('select[name="doctor"]');
      if (select) {
        const options = data.doctors
          .map(
            (d) =>
              `<option value="${d.name}">${d.name} (${d.specialization})</option>`
          )
          .join("");
        select.innerHTML =
          '<option value="" disabled selected>Choose a Doctor</option>' +
          options;
      }
    }
  } catch (e) {
    console.error("Failed to load doctors for dropdown", e);
  }
});

// (Admin load check removed - consolidated above)

/* =========================================
   9. DOCTOR RATING SYSTEM
   ========================================= */

// Star Rating Interaction
document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll(".rating-star");
  const selectedRating = $id("selectedRating");

  stars.forEach((star) => {
    star.addEventListener("click", function () {
      const rating = parseInt(this.getAttribute("data-rating"));
      selectedRating.value = rating;

      // Update star display
      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.remove("far");
          s.classList.add("fas");
          s.style.color = "#00b8b8"; // Teal color (website theme)
        } else {
          s.classList.remove("fas");
          s.classList.add("far");
          s.style.color = "#ddd";
        }
      });
    });

    // Hover effect
    star.addEventListener("mouseenter", function () {
      const rating = parseInt(this.getAttribute("data-rating"));
      stars.forEach((s, index) => {
        if (index < rating) {
          s.style.color = "#00b8b8"; // Teal color
        }
      });
    });

    star.addEventListener("mouseleave", function () {
      const currentRating = parseInt(selectedRating.value);
      stars.forEach((s, index) => {
        if (index < currentRating) {
          s.style.color = "#00b8b8"; // Teal color
        } else {
          s.style.color = "#ddd";
        }
      });
    });
  });
});

// Rating Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const ratingForm = $id("ratingForm");
  if (ratingForm) {
    ratingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const messageDiv = $id("rating-message");
      const doctor = $id("ratingDoctor").value;
      const rating = $id("selectedRating").value;
      const reviewText = $id("reviewText").value.trim();

      // Validation
      if (!doctor) {
        messageDiv.innerHTML =
          '<span style="color:red;">Please select a doctor</span>';
        return;
      }

      if (!rating || rating === "0") {
        messageDiv.innerHTML =
          '<span style="color:red;">Please select a star rating</span>';
        return;
      }

      if (!reviewText) {
        messageDiv.innerHTML =
          '<span style="color:red;">Please write a review</span>';
        return;
      }

      // Check if user is logged in
      const userEmail = localStorage.getItem("userEmail");
      const userName = localStorage.getItem("userName");

      if (!userEmail || !userName) {
        messageDiv.innerHTML =
          '<span style="color:red;">Please login to submit a rating</span>';
        return;
      }

      messageDiv.innerHTML =
        '<span style="color:blue;">Submitting rating...</span>';

      try {
        const res = await fetch(`${API_BASE}/api/submit-rating/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_name: doctor,
            user_email: userEmail,
            user_name: userName,
            rating: parseInt(rating),
            review_text: reviewText,
          }),
        });

        const result = await res.json();

        if (result.status === "success") {
          messageDiv.innerHTML =
            '<span style="color:green;">' + result.message + "</span>";

          // Reset form
          ratingForm.reset();
          $id("selectedRating").value = "0";

          // Reset stars
          document.querySelectorAll(".rating-star").forEach((s) => {
            s.classList.remove("fas");
            s.classList.add("far");
            s.style.color = "#ddd";
          });

          // Reload ratings display
          loadRatings();

          // Clear message after 3 seconds
          setTimeout(() => {
            messageDiv.innerHTML = "";
          }, 3000);
        } else {
          messageDiv.innerHTML =
            '<span style="color:red;">' + result.message + "</span>";
        }
      } catch (error) {
        messageDiv.innerHTML =
          '<span style="color:red;">Error: ' + error.message + "</span>";
      }
    });
  }
});

// --- Rating Helper Functions ---

window.editRatingPrompt = function (
  ratingId,
  currentRating,
  currentReview,
  doctorName
) {
  const newReview = prompt(
    `Edit your review for ${doctorName}:`,
    currentReview
  );
  if (newReview === null || newReview.trim() === "") return;

  const newRating = prompt(`Edit rating (1-5 stars):`, currentRating);
  if (newRating === null) return;

  const ratingNum = parseInt(newRating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    alert("Rating must be between 1 and 5");
    return;
  }

  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("Please login to edit ratings");
    return;
  }

  fetch("/api/update-rating/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating_id: ratingId,
      user_email: userEmail,
      rating: ratingNum,
      review_text: newReview.trim(),
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      alert(result.message);
      if (result.status === "success" && window.loadRatings) {
        window.loadRatings();
      }
    })
    .catch((e) => alert("Error: " + e.message));
};

window.deleteRatingConfirm = function (ratingId, isAdmin) {
  if (!confirm("Are you sure you want to delete this rating?")) return;

  const userEmail = localStorage.getItem("userEmail");

  fetch("/api/delete-rating/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating_id: ratingId,
      user_email: userEmail,
      is_admin: isAdmin,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      alert(result.message);
      if (result.status === "success") {
        if (isAdmin && window.loadAdminRatingsTab) {
          window.loadAdminRatingsTab();
          window.loadAdminRatingsCount();
        } else if (window.loadRatings) {
          window.loadRatings();
        }
      }
    })
    .catch((e) => alert("Error: " + e.message));
};

window.loadAdminRatingsTab = async function () {
  try {
    const res = await fetch("/api/get-ratings/");
    const data = await res.json();
    const tableBody = document.getElementById("ratings-table-body");
    if (!tableBody) return;

    if (data.status === "success" && data.ratings.length > 0) {
      tableBody.innerHTML = data.ratings
        .map((rating) => {
          const starsHTML = "⭐".repeat(rating.rating);
          const date = new Date(rating.created_at).toLocaleDateString();
          const truncatedReview =
            rating.review_text.length > 100
              ? rating.review_text.substring(0, 100) + "..."
              : rating.review_text;

          return `<tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 1rem;">${rating.user_name}</td>
                    <td style="padding: 1rem;">${rating.doctor_name}</td>
                    <td style="padding: 1rem;">${starsHTML} (${rating.rating}/5)</td>
                    <td style="padding: 1rem;">${truncatedReview}</td>
                    <td style="padding: 1rem;">${date}</td>
                    <td style="padding: 1rem;">
                        <button onclick="deleteRatingConfirm(${rating.id}, true)" 
                            style="padding:0.5rem 1rem; background:#dc3545; color:#fff; border:none; border-radius:0.3rem; cursor:pointer;">
                            Delete
                        </button>
                    </td>
                </tr>`;
        })
        .join("");

      // Update count as well
      if (window.loadAdminRatingsCount) window.loadAdminRatingsCount();
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding:2rem;">No ratings yet</td></tr>';
    }
  } catch (error) {
    console.error("Error loading admin ratings:", error);
  }
};

window.loadAdminRatingsCount = async function () {
  try {
    const res = await fetch("/api/get-ratings/");
    const data = await res.json();

    if (data.status === "success") {
      const statElement = document.getElementById("stat-total-ratings");
      if (statElement) {
        statElement.textContent = data.ratings.length;
      }
    }
  } catch (error) {
    console.error("Error loading ratings count:", error);
  }
};

// Load and Display Ratings
async function loadRatings() {
  const ratingsDisplay = $id("ratingsDisplay");
  if (!ratingsDisplay) return;

  try {
    const res = await fetch(`${API_BASE}/api/get-ratings/`);
    const data = await res.json();

    if (data.status === "success" && data.ratings.length > 0) {
      ratingsDisplay.innerHTML = data.ratings
        .map((rating) => {
          // Generate stars HTML
          const starsHTML = Array.from({ length: 5 }, (_, i) => {
            if (i < rating.rating) {
              return '<i class="fas fa-star" style="color:#00b8b8;"></i>';
            } else {
              return '<i class="far fa-star" style="color:#ddd;"></i>';
            }
          }).join("");

          // Format date
          const date = new Date(rating.created_at);
          const formattedDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          // Normalize emails for comparison
          const currentUserEmail = localStorage.getItem("userEmail");
          const currentEmailNormalized = currentUserEmail
            ? currentUserEmail.trim().toLowerCase()
            : "";
          const ratingEmailNormalized = rating.user_email
            ? rating.user_email.trim().toLowerCase()
            : "";

          const isOwnReview =
            currentEmailNormalized &&
            ratingEmailNormalized === currentEmailNormalized;
          console.log(
            `Review ${rating.id}: user=${rating.user_email}, current=${currentUserEmail}, isOwn=${isOwnReview}`
          );

          const reviewEscaped = (rating.review_text || "")
            .replace(/'/g, "\\'")
            .replace(/"/g, "&quot;");
          const doctorEscaped = (rating.doctor_name || "").replace(/'/g, "\\'");

          const actionButtons = isOwnReview
            ? `
                    <div style="margin-top:1rem; display:flex; gap:1rem;">
                        <button onclick="editRatingPrompt(${rating.id}, ${rating.rating}, '${reviewEscaped}', '${doctorEscaped}')" 
                            style="padding:0.5rem 1rem; background:#00b8b8; color:#fff; border:none; border-radius:0.5rem; cursor:pointer; font-size:1.2rem;">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button onclick="deleteRatingConfirm(${rating.id}, false)" 
                            style="padding:0.5rem 1rem; background:#dc3545; color:#fff; border:none; border-radius:0.5rem; cursor:pointer; font-size:1.2rem;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `
            : "";

          return `
                    <div style="background:#fff; padding:2rem; border-radius:1rem; box-shadow:0 0.5rem 1rem rgba(0,0,0,0.1);">
                        <div style="margin-bottom:1rem;">
                            <h3 style="font-size:1.8rem; color:#333; margin-bottom:0.5rem;">${rating.user_name}</h3>
                            <p style="font-size:1.3rem; color:#666;">rated <strong>${rating.doctor_name}</strong></p>
                        </div>
                        <div style="margin-bottom:1rem; font-size:1.8rem;">
                            ${starsHTML}
                        </div>
                        <p style="font-size:1.4rem; color:#555; line-height:1.6; margin-bottom:1rem;">${rating.review_text}</p>
                        <p style="font-size:1.2rem; color:#999;">${formattedDate}</p>
                        ${actionButtons}
                    </div>
                `;
        })
        .join("");
    } else {
      ratingsDisplay.innerHTML =
        '<p style="text-align:center; color:#666; font-size:1.5rem; grid-column:1/-1;">No reviews yet. Be the first to rate our doctors!</p>';
    }
  } catch (error) {
    console.error("Error loading ratings:", error);
    ratingsDisplay.innerHTML =
      '<p style="text-align:center; color:red; font-size:1.5rem; grid-column:1/-1;">Failed to load reviews</p>';
  }
}

// Load ratings on page load
document.addEventListener("DOMContentLoaded", () => {
  loadRatings();

  // Carousel Navigation
  const prevBtn = document.getElementById("reviewsPrevBtn");
  const nextBtn = document.getElementById("reviewsNextBtn");
  const container = document.getElementById("ratingsDisplay");

  if (prevBtn && nextBtn && container) {
    prevBtn.addEventListener("click", () => {
      container.scrollBy({ left: -360, behavior: "smooth" }); // 35rem + gap approx
    });

    nextBtn.addEventListener("click", () => {
        container.scrollBy({ left: 360, behavior: "smooth" });
    });
  }
});

// --- Admin Dashboard Overrides ---

window.showAdminTab = function (tabName) {
  // Hide all contents
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((el) => (el.style.display = "none"));

  // Show selected
  const selected = document.getElementById(`admin-content-${tabName}`);
  if (selected) selected.style.display = "block";

  // Update buttons
  document
    .querySelectorAll(".admin-tabs .link-btn")
    .forEach((btn) => btn.classList.remove("active-tab"));

  // Highlight button if event exists or find by tabName
  if (
    window.event &&
    window.event.target &&
    window.event.target.classList.contains("link-btn")
  ) {
    window.event.target.classList.add("active-tab");
  }

  // Trigger Loads for Ratings
  if (tabName === "ratings" && window.loadAdminRatingsTab) {
    window.loadAdminRatingsTab();
  } else if (tabName === "overview" && window.loadAdminRatingsCount) {
    window.loadAdminRatingsCount();
  }
};

window.loadAdminDashboard = async function () {
  try {
    const res = await fetch(
      `${API_BASE}/api/admin-dashboard-data?t=${Date.now()}`
    );
    const data = await res.json();
    console.log("Admin Dashboard Data:", data);

    if (data.status === "success") {
      // Stats
      document.getElementById("stat-total-users").textContent =
        data.stats.users;
      document.getElementById("stat-total-appointments").textContent =
        data.stats.appointments;
      document.getElementById("stat-total-doctors").textContent =
        data.stats.doctors;

      // Load Ratings Count specifically
      if (window.loadAdminRatingsCount) {
        window.loadAdminRatingsCount();
      }

      // Users Table
      const usersTbody = document.getElementById("users-table-body");
      if (data.users.length > 0) {
        usersTbody.innerHTML = data.users
          .map((u) => {
            let picSrc =
              "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            if (u.profile_pic) {
              picSrc =
                u.profile_pic.startsWith("http") ||
                u.profile_pic.startsWith("/uploads")
                  ? u.profile_pic
                  : `/uploads/${u.profile_pic}`;
            }
            return `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 1rem;">
                            <img src="${picSrc}" alt="User" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-right: 10px; vertical-align: middle;">
                            ${u.name}
                        </td>
                        <td style="padding: 1rem;">${u.email}</td>
                        <td style="padding: 1rem;">${u.age || "-"}</td>
                        <td style="padding: 1rem;">${u.gender || "-"}</td>
                        <td style="padding: 1rem;">${u.blood_type || "-"}</td>
                    </tr>
                `;
          })
          .join("");
      } else {
        usersTbody.innerHTML =
          '<tr><td colspan="5" style="padding:1rem;">No users found.</td></tr>';
      }

      // Appointments Table
      const apptTbody = document.getElementById("appointments-table-body");
      if (data.appointments.length > 0) {
        apptTbody.innerHTML = data.appointments
          .map((a) => {
            const rawStatus = a.status ? a.status.trim() : "";
            const currentStatus =
              rawStatus.length > 0 ? rawStatus : "Scheduled";
            let statusColor = "#00b8b8";
            if (currentStatus.toLowerCase() === "rescheduled")
              statusColor = "red";

            return `
                    <tr style="border-bottom: 1px solid #ddd;">
                        <td style="padding: 1rem;">${a.name}</td>
                        <td style="padding: 1rem;">${a.doctor}</td>
                        <td style="padding: 1rem;">${new Date(
                          a.appointment_date
                        ).toLocaleString()}</td>
                         <td style="padding: 1rem;">${a.phone}</td>
                         <td style="padding: 1rem;">
                             <span style="margin-right:1rem; font-weight:bold; color:${statusColor};">${currentStatus}</span>
                             <button class="link-btn" onclick="openEditApptModal(${
                               a.id
                             })" style="padding:0.5rem 1rem; font-size:1.2rem;">Edit</button>
                         </td>
                    </tr>
                `;
          })
          .join("");
      } else {
        apptTbody.innerHTML =
          '<tr><td colspan="5" style="padding:1rem;">No appointments found.</td></tr>';
      }

      // Review Dashboard Data
      window.adminData = {
        doctors: data.doctors,
        appointments: data.appointments,
      };

      // Doctors List
      if (window.renderDoctorsList) renderDoctorsList(data.doctors);
    }
  } catch (e) {
    console.error("Failed to load admin dashboard", e);
  }
};

// Initialize Ratings Count on Dash Load
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";
    const adminDash = document.getElementById("admin-dashboard");
    if (isAdmin && adminDash) {
      if (
        adminDash.style.display !== "none" ||
        window.getComputedStyle(adminDash).display !== "none"
      ) {
        if (window.loadAdminRatingsCount) window.loadAdminRatingsCount();
      }
    }
  }, 1500);
});

/* =========================================
   10. REPORTS MANAGEMENT (Admin & User)
   ========================================= */

// --- Admin Logic ---

// Load Reports
window.loadAdminReports = async function () {
  try {
    const res = await fetch(`${API_BASE}/api/get-all-reports`);
    const data = await res.json();
    const tbody = document.getElementById("reports-table-body");
    if (!tbody) return;

    if (data.status === "success" && data.reports.length > 0) {
      tbody.innerHTML = data.reports
        .map(
          (r) => `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 1rem;">
                        <strong>${r.user__name}</strong><br>
                        <small style="color:#777">${r.report_date} | ${
            r.title
          }</small>
                    </td>
                    <td style="padding: 1rem; text-align:right;">
                        <button onclick='editReport(${JSON.stringify(r).replace(
                          /'/g,
                          "&#39;"
                        )})' style="padding:0.5rem 1rem; background:#ffc107; color:#000; border:none; border-radius:3px; cursor:pointer; font-weight:bold; margin-right:5px;">Edit</button>
                        <button onclick="deleteReport(${
                          r.id
                        })" style="padding:0.5rem 1rem; background:#dc3545; color:#fff; border:none; border-radius:3px; cursor:pointer;">Del</button>
                    </td>
                </tr>
            `
        )
        .join("");
    } else {
      tbody.innerHTML =
        '<tr><td colspan="2" style="padding:1rem; text-align:center;">No reports found.</td></tr>';
    }
  } catch (e) {
    console.error("Error loading reports", e);
  }
};

// Create/Update Report Form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("createReportForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("reportMsg");
      msg.textContent = "Saving...";
      msg.style.color = "blue";

      const payload = {
        id: document.getElementById("reportId").value || null,
        user_email: document.getElementById("reportUserEmail").value,
        doctor_name: document.getElementById("reportDoctorName").value,
        title: document.getElementById("reportTitle").value,
        report_date: document.getElementById("reportDate").value,

        chief_complaint: document.getElementById("reportChiefComplaint").value,
        clinical_findings: document.getElementById("reportClinicalFindings")
          .value,
        oral_hygiene: document.getElementById("reportOralHygiene").value,
        teeth_condition: document.getElementById("reportTeethCondition").value,
        gums: document.getElementById("reportGums").value,
        diagnosis: document.getElementById("reportDiagnosis").value,
        treatment_plan: document.getElementById("reportTreatmentPlan").value,
        medications: document.getElementById("reportMedications").value,
        advice: document.getElementById("reportAdvice").value,
      };

      try {
        const res = await fetch(`${API_BASE}/api/manage-report`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (result.status === "success") {
          msg.textContent = result.message;
          msg.style.color = "green";
          setTimeout(() => {
            msg.textContent = "";
          }, 3000);
          window.resetReportForm();
          window.loadAdminReports();
        } else {
          msg.textContent = "Error: " + result.message;
          msg.style.color = "red";
        }
      } catch (err) {
        console.error(err);
        msg.textContent = "Request failed";
        msg.style.color = "red";
      }
    });
  }
});

window.editReport = function (r) {
  document.getElementById("reportId").value = r.id;
  document.getElementById("reportUserEmail").value = r.user__email || "";
  document.getElementById("reportDoctorName").value = r.doctor_name || "";
  document.getElementById("reportTitle").value = r.title || "";
  if (r.report_date)
    document.getElementById("reportDate").value = r.report_date;

  document.getElementById("reportChiefComplaint").value =
    r.chief_complaint || "";
  document.getElementById("reportClinicalFindings").value =
    r.clinical_findings || "";
  document.getElementById("reportOralHygiene").value = r.oral_hygiene || "";
  document.getElementById("reportTeethCondition").value =
    r.teeth_condition || "";
  document.getElementById("reportGums").value = r.gums || "";
  document.getElementById("reportDiagnosis").value = r.diagnosis || "";
  document.getElementById("reportTreatmentPlan").value = r.treatment_plan || "";
  document.getElementById("reportMedications").value = r.medications || "";
  document.getElementById("reportAdvice").value = r.advice || "";

  document.querySelector("#createReportForm button[type=submit]").textContent =
    "Update Report";
  document.getElementById("cancelReportEdit").style.display = "inline-block";

  // Smooth scroll to form
  document
    .getElementById("createReportForm")
    .scrollIntoView({ behavior: "smooth" });
};

window.resetReportForm = function () {
  document.getElementById("createReportForm").reset();
  document.getElementById("reportId").value = "";
  document.querySelector("#createReportForm button[type=submit]").textContent =
    "Save Report";
  document.getElementById("cancelReportEdit").style.display = "none";
};

window.deleteReport = async function (id) {
  if (!confirm("Delete this report?")) return;
  try {
    const res = await fetch(`${API_BASE}/api/manage-report?action=delete`, {
      method: "POST",
      body: JSON.stringify({ id: id }),
    });
    const result = await res.json();
    if (result.status === "success") {
      window.loadAdminReports();
    } else {
      alert(result.message);
    }
  } catch (e) {
    alert("Error deleting report");
  }
};

// --- User Logic ---

window.loadUserReports = async function (email) {
  const list = document.getElementById("userReportsList");
  if (!list) return;

  try {
    // Find email if not provided (from localStorage)
    if (!email) email = localStorage.getItem("userEmail");
    if (!email) {
      list.innerHTML = "<p>Please login to view reports.</p>";
      return;
    }

    const res = await fetch(`${API_BASE}/api/get-user-reports?email=${email}`);
    const data = await res.json();

    if (data.status === "success" && data.reports.length > 0) {
      list.innerHTML = data.reports
        .map(
          (r) => `
                <div style="background:#f9f9f9; padding:1.5rem; margin-bottom:1rem; border-left:4px solid #00b8b8; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="font-size:1.6rem; color:#333;">${r.title}</h4>
                        <p style="font-size:1.3rem; color:#555;">${r.doctor_name} | ${r.report_date}</p>
                    </div>
                    <a href="/download-report/${r.id}/" target="_blank" class="link-btn" style="padding:0.8rem 1.5rem; text-decoration:none; font-size:1.3rem;">
                        <i class="fas fa-file-pdf"></i> Download
                    </a>
                </div>
            `
        )
        .join("");
    } else {
      list.innerHTML =
        '<p style="font-size:1.4rem; padding:1rem; background:#f9f9f9;">No reports available.</p>';
    }
  } catch (e) {
    console.error("Error loading user reports", e);
    list.innerHTML = '<p style="color:red;">Failed to load reports.</p>';
  }
};

// Populate Report Dropdowns
window.populateReportDropdowns = async function () {
  // Patients
  try {
    const res = await fetch(`${API_BASE}/api/get-all-users`);
    const data = await res.json();
    const select = document.getElementById("reportUserEmail");
    if (select && data.status === "success") {
      const currentVal = select.value;
      select.innerHTML =
        '<option value="">Select Patient...</option>' +
        data.users
          .map(
            (u) => `<option value="${u.email}">${u.name} (${u.email})</option>`
          )
          .join("");
      if (currentVal) select.value = currentVal;
    }
  } catch (e) {
    console.error("Error loading users", e);
  }

  // Doctors
  try {
    const res = await fetch(`${API_BASE}/api/get-all-doctors`);
    const data = await res.json();
    const select = document.getElementById("reportDoctorName");
    if (select && data.status === "success") {
      const currentVal = select.value;
      select.innerHTML =
        '<option value="">Select Doctor...</option>' +
        data.doctors
          .map((d) => `<option value="${d.name}">${d.name}</option>`)
          .join("");
      if (currentVal) select.value = currentVal;
    }
  } catch (e) {
    console.error("Error loading doctors", e);
  }
};

// Hook into Admin Tab Switch
const originalShowAdminTab = window.showAdminTab;
window.showAdminTab = function (tabName) {
  originalShowAdminTab(tabName);
  if (tabName === "reports") {
    window.loadAdminReports();
    window.populateReportDropdowns();
  }
};

// Auto-call for user if on dashboard
// Auto-call for user if on dashboard - Removed delayed call as it is now in loadDashboard
/*
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const isUser = localStorage.getItem("isLoggedIn") === "true";
        if (isUser) {
            window.loadUserReports();
        }
    }, 2000);
});
*/
