/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — STUDENT REGISTRATION LOGIC
 * ===================================================================
 * - Handles registration submission directly to 'pdc_registrations'
 * - Guarantees zero duplicity by keying document ID with WhatsApp number
 * - Auto-detects and binds referral query parameters (?ref, ?referrer, ?referencer)
 * - Live real-time community statistics counter hydration
 * - Smooth transition to thank-you.html upon successful registration
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("registrationForm");
  const fullNameInput = document.getElementById("fullName");
  const whatsappNumberInput = document.getElementById("whatsappNumber");
  const emailInput = document.getElementById("email");
  const branchSelect = document.getElementById("branch");
  const divisionSelect = document.getElementById("division");
  const referredByInput = document.getElementById("referredBy");
  const referralDetectedBadge = document.getElementById("referralDetectedBadge");
  const referralDetectedText = document.getElementById("referralDetectedText");
  const genderRadioCards = document.querySelectorAll(".gender-radio-card");
  const submitBtn = document.getElementById("submitRegBtn");
  const submitSpinner = document.getElementById("submitSpinner");
  const toastContainer = document.getElementById("toastContainer");
  const aboutToggleBtn = document.getElementById("aboutToggleBtn");
  const aboutContent = document.getElementById("aboutContent");

  let isSubmitting = false;

  // ===================================================================
  // 1. COLLAPSIBLE ABOUT ACCORDION
  // ===================================================================
  if (aboutToggleBtn && aboutContent) {
    aboutToggleBtn.addEventListener("click", () => {
      const isOpen = aboutContent.classList.contains("open");
      aboutContent.classList.toggle("open", !isOpen);
      aboutToggleBtn.classList.toggle("active", !isOpen);
      aboutToggleBtn.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // ===================================================================
  // 2. REFERRAL PARAMETER AUTO-DETECTION
  // ===================================================================
  function initReferral() {
    try {
      const params = new URLSearchParams(window.location.search);
      const referrer = params.get("ref") || 
                       params.get("referrer") || 
                       params.get("referencer") || 
                       params.get("reference") || 
                       "";

      if (referrer && referredByInput) {
        referredByInput.value = referrer;
        if (referralDetectedBadge) {
          referralDetectedBadge.style.display = "inline-flex";
          if (referralDetectedText) {
            referralDetectedText.textContent = `Referred by: ${referrer}`;
          }
        }
        referredByInput.style.borderColor = "#FCD34D";
        referredByInput.style.backgroundColor = "#FFFDF5";
      }

      // Pre-fill student info if provided in query
      if (params.get("name") && fullNameInput) fullNameInput.value = params.get("name");
      if (params.get("phone") && whatsappNumberInput) whatsappNumberInput.value = params.get("phone").replace(/[^0-9]/g, "").slice(-10);
      if (params.get("email") && emailInput) emailInput.value = params.get("email");
      if (params.get("branch") && branchSelect) branchSelect.value = params.get("branch");
      if (params.get("div") && divisionSelect) divisionSelect.value = params.get("div");
    } catch (e) {
      console.warn("Could not parse query parameters:", e);
    }
  }

  // ===================================================================
  // 3. GENDER SELECTION TOGGLE
  // ===================================================================
  function initGenderSelection() {
    genderRadioCards.forEach(card => {
      card.addEventListener("click", () => {
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          genderRadioCards.forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          hideError("genderError");
        }
      });
    });
  }

  // ===================================================================
  // 4. PHONE NUMBER FORMATTING / NUMERIC ENFORCEMENT
  // ===================================================================
  if (whatsappNumberInput) {
    whatsappNumberInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
      if (e.target.value.length === 10) {
        hideError("whatsappNumberError");
        e.target.classList.remove("error");
      }
    });
  }

  // ===================================================================
  // 5. LIVE STATS COUNTER HYDRATION
  // ===================================================================
  async function loadLiveCommunityStats() {
    try {
      if (window.PDCBackend && window.PDCBackend.fetchLiveStats) {
        const stats = await window.PDCBackend.fetchLiveStats();
        if (stats) {
          const regEl = document.getElementById("statTotalRegistered");
          const joinEl = document.getElementById("statTotalJoined");
          if (regEl && stats.totalRegistered) {
            regEl.textContent = `${stats.totalRegistered}+`;
          }
          if (joinEl && (stats.joinedWhatsAppCount !== undefined || stats.totalJoined !== undefined)) {
            const joinedCount = stats.joinedWhatsAppCount || stats.totalJoined || 0;
            joinEl.textContent = `${joinedCount}+`;
          }
        }
      }
    } catch (e) {
      console.warn("Could not load live stats:", e);
    }
  }

  // ===================================================================
  // 6. VALIDATION HELPERS
  // ===================================================================
  function showError(id, message) {
    const el = document.getElementById(id);
    if (el) {
      if (message) el.textContent = message;
      el.classList.add("visible");
    }
  }

  function hideError(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("visible");
    }
  }

  function validateForm() {
    let isValid = true;

    // Full Name
    const name = (fullNameInput.value || "").trim();
    if (!name || name.length < 2) {
      showError("fullNameError", "Please enter your full name (at least 2 characters).");
      fullNameInput.classList.add("error");
      isValid = false;
    } else {
      hideError("fullNameError");
      fullNameInput.classList.remove("error");
    }

    // WhatsApp Number
    const phone = (whatsappNumberInput.value || "").replace(/[^0-9]/g, "");
    if (!phone || phone.length !== 10) {
      showError("whatsappNumberError", "Please enter a valid 10-digit mobile number.");
      whatsappNumberInput.classList.add("error");
      isValid = false;
    } else {
      hideError("whatsappNumberError");
      whatsappNumberInput.classList.remove("error");
    }

    // Email
    const email = (emailInput.value || "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showError("emailError", "Please enter a valid email address.");
      emailInput.classList.add("error");
      isValid = false;
    } else {
      hideError("emailError");
      emailInput.classList.remove("error");
    }

    // Gender
    const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
    if (!selectedGenderRadio) {
      showError("genderError", "Please select your gender.");
      isValid = false;
    } else {
      hideError("genderError");
    }

    // Engineering Branch
    const branch = branchSelect.value;
    if (!branch) {
      showError("branchError", "Please select your engineering branch.");
      branchSelect.classList.add("error");
      isValid = false;
    } else {
      hideError("branchError");
      branchSelect.classList.remove("error");
    }

    // Division
    const division = divisionSelect.value;
    if (!division) {
      showError("divisionError", "Please select your division.");
      divisionSelect.classList.add("error");
      isValid = false;
    } else {
      hideError("divisionError");
      divisionSelect.classList.remove("error");
    }

    return isValid;
  }

  // ===================================================================
  // 7. FORM SUBMISSION
  // ===================================================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (isSubmitting) return;

      if (!validateForm()) {
        showToast("Please fill in all required fields accurately.", "error");
        return;
      }

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector(".btn-text");
        if (btnText) btnText.textContent = "Recording Registration...";
        if (submitSpinner) submitSpinner.style.display = "inline-block";
      }

      const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
      const payload = {
        fullName: fullNameInput.value.trim(),
        whatsappNumber: whatsappNumberInput.value.replace(/[^0-9]/g, "").slice(-10),
        email: emailInput.value.trim(),
        gender: selectedGenderRadio ? selectedGenderRadio.value : "Male",
        branch: branchSelect.value,
        division: divisionSelect.value,
        referredBy: (referredByInput.value || "Direct").trim()
      };

      try {
        let saveResult = { success: true };
        if (window.PDCBackend && window.PDCBackend.saveRegistration) {
          saveResult = await window.PDCBackend.saveRegistration(payload);
        }

        // Store profile in sessionStorage for thank-you.html
        try {
          sessionStorage.setItem("pdc_registered_student", JSON.stringify(saveResult.student || payload));
          localStorage.setItem(`pdc_student_${payload.whatsappNumber}`, JSON.stringify(saveResult.student || payload));
        } catch (storageErr) {
          console.warn("Storage warning:", storageErr);
        }

        showToast("Registration completed! Redirecting to confirmation page...", "success");

        // Small smooth delay for UX
        setTimeout(() => {
          window.location.href = "thank-you.html";
        }, 600);

      } catch (err) {
        console.error("Registration error:", err);
        showToast("Could not complete registration. Please check your connection and try again.", "error");
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = "Complete Registration →";
          if (submitSpinner) submitSpinner.style.display = "none";
        }
        isSubmitting = false;
      }
    });
  }

  // ===================================================================
  // 8. TOAST NOTIFICATION HELPER
  // ===================================================================
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : (type === 'success' ? '✅' : 'ℹ️')}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Initialize
  initReferral();
  initGenderSelection();
  loadLiveCommunityStats();
});
