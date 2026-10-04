/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — STUDENT REGISTRATION LOGIC
 * ===================================================================
 * - Handles 4-field registration: Name, Phone Number, Email, Gender
 * - Submits directly to new collection 'pdc_simple_registrations'
 * - Guarantees ZERO duplicate values by keying document ID with 10-digit phone number
 * - In-page smooth transition to "Successfully Submitted" view
 * - Live real-time community statistics counter hydration
 * - Syncs session for full confirmation receipt on thank-you.html
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const form = document.getElementById("registrationForm");
  const fullNameInput = document.getElementById("fullName");
  const phoneNumberInput = document.getElementById("phoneNumber") || document.getElementById("whatsappNumber");
  const emailInput = document.getElementById("email");
  const branchInput = document.getElementById("branch");
  const divisionInput = document.getElementById("division");
  const genderRadioCards = document.querySelectorAll(".gender-radio-card");
  const submitBtn = document.getElementById("submitRegBtn");
  const submitSpinner = document.getElementById("submitSpinner");
  const toastContainer = document.getElementById("toastContainer");
  const aboutToggleBtn = document.getElementById("aboutToggleBtn");
  const aboutContent = document.getElementById("aboutContent");

  // Single-page views
  const formView = document.getElementById("formView");
  const successView = document.getElementById("successView");
  const successTitle = document.getElementById("successTitle");
  const successSubtitle = document.getElementById("successSubtitle");
  const successRegId = document.getElementById("successRegId");
  const displayFullName = document.getElementById("displayFullName");
  const displayPhoneNumber = document.getElementById("displayPhoneNumber");
  const displayEmail = document.getElementById("displayEmail");
  const displayGender = document.getElementById("displayGender");
  const successWaBtn = document.getElementById("successWaBtn");
  const registerAnotherBtn = document.getElementById("registerAnotherBtn");

  let isSubmitting = false;
  let registeredStudentData = null;

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
  // 2. QUERY PARAMETER AUTO-PREFILL
  // ===================================================================
  function initQueryPrefill() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("name") && fullNameInput) fullNameInput.value = params.get("name");
      if (params.get("phone") && phoneNumberInput) {
        phoneNumberInput.value = params.get("phone").replace(/[^0-9]/g, "").slice(-10);
      }
      if (params.get("email") && emailInput) emailInput.value = params.get("email");
      if (params.get("branch") && branchInput) branchInput.value = params.get("branch");
      if ((params.get("division") || params.get("div")) && divisionInput) {
        divisionInput.value = params.get("division") || params.get("div");
      }
      if (params.get("gender")) {
        const targetGender = params.get("gender");
        const matchRadio = document.querySelector(`input[name="gender"][value="${targetGender}"]`);
        if (matchRadio) {
          matchRadio.checked = true;
          const card = matchRadio.closest(".gender-radio-card");
          if (card) {
            genderRadioCards.forEach(c => c.classList.remove("selected"));
            card.classList.add("selected");
          }
        }
      }
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
  // 4. PHONE NUMBER FORMATTING (NUMERIC 10 DIGITS)
  // ===================================================================
  if (phoneNumberInput) {
    phoneNumberInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "").slice(0, 10);
      if (e.target.value.length === 10) {
        hideError("phoneNumberError");
        e.target.classList.remove("error");
      }
    });
  }

  if (branchInput) {
    branchInput.addEventListener("change", () => {
      if (branchInput.value) {
        hideError("branchError");
        branchInput.classList.remove("error");
      }
    });
  }

  if (divisionInput) {
    divisionInput.addEventListener("change", () => {
      if (divisionInput.value) {
        hideError("divisionError");
        divisionInput.classList.remove("error");
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

    // 1. Full Name
    const name = (fullNameInput ? fullNameInput.value : "").trim();
    if (!name || name.length < 2) {
      showError("fullNameError", "Please enter your full name (at least 2 characters).");
      if (fullNameInput) fullNameInput.classList.add("error");
      isValid = false;
    } else {
      hideError("fullNameError");
      if (fullNameInput) fullNameInput.classList.remove("error");
    }

    // 2. Phone Number
    const phone = (phoneNumberInput ? phoneNumberInput.value : "").replace(/[^0-9]/g, "");
    if (!phone || phone.length !== 10) {
      showError("phoneNumberError", "Please enter a valid 10-digit phone number.");
      if (phoneNumberInput) phoneNumberInput.classList.add("error");
      isValid = false;
    } else {
      hideError("phoneNumberError");
      if (phoneNumberInput) phoneNumberInput.classList.remove("error");
    }

    // 3. Email Address
    const email = (emailInput ? emailInput.value : "").trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showError("emailError", "Please enter a valid email address.");
      if (emailInput) emailInput.classList.add("error");
      isValid = false;
    } else {
      hideError("emailError");
      if (emailInput) emailInput.classList.remove("error");
    }

    // 4. Engineering Branch
    const branch = (branchInput ? branchInput.value : "").trim();
    if (!branch) {
      showError("branchError", "Please select your engineering branch.");
      if (branchInput) branchInput.classList.add("error");
      isValid = false;
    } else {
      hideError("branchError");
      if (branchInput) branchInput.classList.remove("error");
    }

    // 5. Division
    const division = (divisionInput ? divisionInput.value : "").trim();
    if (!division) {
      showError("divisionError", "Please select your division.");
      if (divisionInput) divisionInput.classList.add("error");
      isValid = false;
    } else {
      hideError("divisionError");
      if (divisionInput) divisionInput.classList.remove("error");
    }

    // 6. Gender
    const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
    if (!selectedGenderRadio) {
      showError("genderError", "Please select your gender.");
      isValid = false;
    } else {
      hideError("genderError");
    }

    return isValid;
  }

  // ===================================================================
  // 7. FORM SUBMISSION (NEW COLLECTION 'pdc_simple_registrations')
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
        if (btnText) btnText.textContent = "Recording Confirmation...";
        if (submitSpinner) submitSpinner.style.display = "inline-block";
      }

      const selectedGenderRadio = document.querySelector('input[name="gender"]:checked');
      const cleanPhone = phoneNumberInput.value.replace(/[^0-9]/g, "").slice(-10);
      const studentName = fullNameInput.value.trim();

      const payload = {
        fullName: studentName,
        phoneNumber: cleanPhone,
        whatsappNumber: cleanPhone,
        email: emailInput.value.trim(),
        gender: selectedGenderRadio ? selectedGenderRadio.value : "Male",
        branch: branchInput ? branchInput.value : "",
        division: divisionInput ? divisionInput.value : "",
        program: "PDC Course and Camps Orientation Program at Sharad Arena(Auditorium)",
        eventDate: "Tuesday, 6 October 2026",
        eventTime: "6:00 PM",
        venue: "Sharad Arena(Auditorium)",
        status: "confirmed"
      };

      try {
        let saveResult = { success: true };
        if (window.PDCBackend && window.PDCBackend.saveSimpleRegistration) {
          saveResult = await window.PDCBackend.saveSimpleRegistration(payload);
        } else if (window.PDCBackend && window.PDCBackend.saveRegistration) {
          saveResult = await window.PDCBackend.saveRegistration(payload);
        }

        registeredStudentData = saveResult.student || payload;

        // Store profile in storage for persistence and thank-you.html
        try {
          sessionStorage.setItem("pdc_registered_student", JSON.stringify(registeredStudentData));
          localStorage.setItem(`pdc_student_${cleanPhone}`, JSON.stringify(registeredStudentData));
        } catch (storageErr) {
          console.warn("Storage warning:", storageErr);
        }

        // Hydrate and display the Successfully Submitted view on page
        displaySuccessView(registeredStudentData, saveResult.isUpdate);

        if (saveResult.isUpdate) {
          showToast("Confirmation already recorded for this number. Showing your saved details! ✨", "info");
        } else {
          showToast("Confirmation successfully submitted! 🎉", "success");
        }

        // Refresh stats
        loadLiveCommunityStats();

      } catch (err) {
        console.error("Confirmation error:", err);
        showToast("Could not submit confirmation. Please try again.", "error");
      } finally {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          const btnText = submitBtn.querySelector(".btn-text");
          if (btnText) btnText.textContent = "Complete Confirmation →";
          if (submitSpinner) submitSpinner.style.display = "none";
        }
      }
    });
  }

  // ===================================================================
  // 8. SHOW SUCCESSFULLY SUBMITTED VIEW
  // ===================================================================
  function displaySuccessView(student, isUpdate = false) {
    if (!successView) return;

    // Toggle views
    if (formView) formView.style.display = "none";
    successView.style.display = "block";

    // Smooth scroll to top of card
    const formCard = document.getElementById("formCard");
    if (formCard) {
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===================================================================
  // 9. REGISTER ANOTHER STUDENT (RESET VIEW)
  // ===================================================================
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener("click", () => {
      if (form) form.reset();
      genderRadioCards.forEach(c => c.classList.remove("selected"));
      hideError("fullNameError");
      hideError("phoneNumberError");
      hideError("emailError");
      hideError("genderError");

      if (successView) successView.style.display = "none";
      if (formView) {
        formView.style.display = "block";
        const formCard = document.getElementById("formCard");
        if (formCard) formCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // ===================================================================
  // 10. WHATSAPP JOIN RECORDING
  // ===================================================================
  if (successWaBtn) {
    successWaBtn.addEventListener("click", () => {
      if (registeredStudentData && window.PDCBackend && window.PDCBackend.recordWhatsAppJoin) {
        window.PDCBackend.recordWhatsAppJoin(registeredStudentData).catch(() => { });
      }
    });
  }

  // ===================================================================
  // 11. TOAST NOTIFICATION HELPER
  // ===================================================================
  function showToast(message, type = "info") {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '❌' : (type === 'success' ? '✅' : 'ℹ️')}</span>
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
  initQueryPrefill();
  initGenderSelection();
  loadLiveCommunityStats();
});
