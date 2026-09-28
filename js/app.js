/**
 * ===================================================================
 * DHRUVA CLUB — MULTI-STEP TEST APPLICATION LOGIC
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.DHRUVA_CONFIG;

  if (!config) {
    console.error("Configuration not loaded from content.js!");
    return;
  }

  // Application State
  let currentStepIndex = 0;
  const totalSteps = config.steps.length;
  const formData = {
    personal: {},
    answers: {}
  };

  // DOM Elements
  const brandHeader = document.getElementById("brandHeader");
  const clubBadge = document.getElementById("clubBadge");
  const clubName = document.getElementById("clubName");

  const clubTagline = document.getElementById("clubTagline");
  const aboutToggleBtn = document.getElementById("aboutToggleBtn");
  const aboutContent = document.getElementById("aboutContent");
  const aboutShortDesc = document.getElementById("aboutShortDesc");
  const aboutPillars = document.getElementById("aboutPillars");

  const stepCountLabel = document.getElementById("stepCountLabel");
  const stepPercentLabel = document.getElementById("stepPercentLabel");
  const progressBarFill = document.getElementById("progressBarFill");
  const stepDotsContainer = document.getElementById("stepDotsContainer");
  const stepsContainer = document.getElementById("stepsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const toastContainer = document.getElementById("toastContainer");

  // ===================================================================
  // 1. INITIALIZE BRANDING & ABOUT ACCORDION
  // ===================================================================
  function initBranding() {
    if (config.club) {
      if (clubBadge && config.club.badge) clubBadge.textContent = config.club.badge;
      if (clubName && config.club.name) clubName.textContent = config.club.name;

      if (clubTagline && config.club.tagline) clubTagline.textContent = config.club.tagline;

      if (config.club.about) {
        if (aboutShortDesc) aboutShortDesc.textContent = config.club.about.shortDescription;
        if (aboutPillars && config.club.about.pillars) {
          aboutPillars.innerHTML = config.club.about.pillars.map(p => `
            <div class="pillar-card">
              <h4>${p.title}</h4>
              <p>${p.desc}</p>
            </div>
          `).join("");
        }
      }
    }

    // Toggle About Section
    if (aboutToggleBtn && aboutContent) {
      aboutToggleBtn.addEventListener("click", () => {
        const isOpen = aboutContent.classList.contains("open");
        aboutContent.classList.toggle("open", !isOpen);
        aboutToggleBtn.classList.toggle("active", !isOpen);
        aboutToggleBtn.setAttribute("aria-expanded", String(!isOpen));
      });
    }
  }

  // ===================================================================
  // 2. RENDER STEPPER DOTS & PROGRESS BAR
  // ===================================================================
  function initStepper() {
    stepDotsContainer.innerHTML = "";
    config.steps.forEach((step, idx) => {
      const dotItem = document.createElement("div");
      dotItem.className = `step-dot-item ${idx === 0 ? "active" : ""}`;
      dotItem.id = `step-dot-item-${idx}`;

      const shortName = step.isPersonalDetails
        ? "Profile"
        : (step.dimension ? step.dimension.toUpperCase() : `Part ${idx}`);

      dotItem.innerHTML = `
        <div class="step-dot">${idx + 1}</div>
        <span class="step-dot-name">${shortName}</span>
      `;
      stepDotsContainer.appendChild(dotItem);
    });
    updateProgressUI();
  }

  function updateProgressUI() {
    const percent = Math.round(((currentStepIndex) / (totalSteps - 1)) * 100);
    if (stepCountLabel) {
      stepCountLabel.textContent = `Step ${currentStepIndex + 1} of ${totalSteps}`;
    }
    if (stepPercentLabel) {
      stepPercentLabel.textContent = `${percent}% Completed`;
    }
    if (progressBarFill) {
      progressBarFill.style.width = `${percent}%`;
    }

    // Update Dots
    config.steps.forEach((_, idx) => {
      const dotItem = document.getElementById(`step-dot-item-${idx}`);
      if (!dotItem) return;
      dotItem.classList.remove("active", "completed");
      if (idx === currentStepIndex) {
        dotItem.classList.add("active");
      } else if (idx < currentStepIndex) {
        dotItem.classList.add("completed");
      }
    });

    // Update Navigation Buttons
    if (prevBtn) {
      prevBtn.style.visibility = currentStepIndex === 0 ? "hidden" : "visible";
    }
    if (nextBtn) {
      const isLastStep = currentStepIndex === totalSteps - 1;
      const btnText = nextBtn.querySelector(".btn-text");
      if (btnText) {
        btnText.textContent = isLastStep ? "Submit Assessment" : "Continue";
      }
    }
  }

  // ===================================================================
  // 3. RENDER FORM STEPS
  // ===================================================================
  function renderStepViews() {
    stepsContainer.innerHTML = "";

    config.steps.forEach((step, stepIndex) => {
      const stepView = document.createElement("div");
      stepView.className = `step-view ${stepIndex === 0 ? "active" : ""}`;
      stepView.id = `step-view-${stepIndex}`;

      // Header for this step
      let categoryPill = step.category
        ? `<div class="step-category-pill">${step.category}</div>`
        : (step.isPersonalDetails ? `<div class="step-category-pill">Registration</div>` : "");

      let headerHtml = `
        <div class="step-view-header">
          ${categoryPill}
          <h2 class="step-title">${step.title}</h2>
          <p class="step-subtitle">${step.subtitle || ""}</p>
        </div>
      `;

      let bodyHtml = "";

      if (step.isPersonalDetails && step.fields) {
        // Render Personal Registration Fields
        bodyHtml = `<div class="personal-grid">`;
        step.fields.forEach(field => {
          const isFullWidth = field.name === "fullName" || field.name === "email" || field.name === "collegeEmail";
          const fieldClass = isFullWidth ? "grid-full-width" : "";

          if (field.type === "radio" && field.name === "gender") {
            bodyHtml += `
              <div class="form-group ${fieldClass}">
                <label class="form-label">${field.label} ${field.required ? '<span class="req-star">*</span>' : ''}</label>
                <div class="gender-radio-group">
                  ${field.options.map(opt => `
                    <label class="gender-radio-card" data-gender="${opt}">
                      <input type="radio" name="gender" value="${opt}" ${field.required ? 'required' : ''}>
                      <span>${opt === 'Male' ? '👨 Male' : '👩 Female'}</span>
                    </label>
                  `).join('')}
                </div>
                <span class="error-msg" id="error-${field.name}">Please select your gender</span>
              </div>
            `;
          } else if (field.type === "select") {
            const hasOther = field.hasOtherInput || (field.options && field.options.includes("Other"));
            const otherHtml = hasOther ? `
              <div class="other-input-wrap" id="${field.name}_other_wrap" style="display: none; margin-top: 8px;">
                <label class="form-label-sub" for="${field.name}_other" style="font-size:0.78rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:4px;">Specify ${field.label}:</label>
                <input 
                  type="text" 
                  class="form-input other-text-input" 
                  id="${field.name}_other" 
                  name="${field.name}_other" 
                  placeholder="${field.otherPlaceholder || `Please specify ${field.label.toLowerCase()}`}"
                >
              </div>
            ` : "";

            bodyHtml += `
              <div class="form-group ${fieldClass}">
                <label class="form-label" for="${field.name}">${field.label} ${field.required ? '<span class="req-star">*</span>' : ''}</label>
                <select class="form-select ${hasOther ? 'select-with-other' : ''}" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                  <option value="" disabled selected>Select ${field.label}</option>
                  ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                </select>
                ${otherHtml}
                <span class="error-msg" id="error-${field.name}">Please select an option</span>
              </div>
            `;
          } else {
            bodyHtml += `
              <div class="form-group ${fieldClass}">
                <label class="form-label" for="${field.name}">${field.label} ${field.required ? '<span class="req-star">*</span>' : ''}</label>
                <input 
                  type="${field.type}" 
                  class="form-input" 
                  id="${field.name}" 
                  name="${field.name}" 
                  placeholder="${field.placeholder || ''}" 
                  ${field.pattern ? `pattern="${field.pattern}"` : ''}
                  ${field.required ? 'required' : ''}
                >
                <span class="error-msg" id="error-${field.name}">Please enter valid ${field.label}</span>
              </div>
            `;
          }
        });
        bodyHtml += `</div>`;
      } else if (step.questions) {
        // Render MCQ Questions
        bodyHtml = `<div class="questions-list">`;
        step.questions.forEach((q, qIndex) => {
          let imageHtml = "";
          if (q.image) {
            imageHtml = `
              <div class="question-media">
                <img src="${q.image}" class="question-img" alt="Question illustration" loading="lazy">
              </div>
            `;
          }

          bodyHtml += `
            <div class="question-block" id="block-${q.id}">
              <div class="question-header">
                <span class="question-num-badge">Q${qIndex + 1}</span>
                <p class="question-text">${q.question}</p>
              </div>
              ${imageHtml}
              <div class="options-grid">
                ${q.options.map((opt, optIdx) => `
                  <label class="option-card" data-qid="${q.id}" data-optindex="${optIdx}">
                    <input type="radio" name="${q.id}" value="${opt.replace(/"/g, '&quot;')}" required>
                    <div class="option-indicator"></div>
                    <span class="option-label-text">${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        });
        bodyHtml += `</div>`;
      }

      stepView.innerHTML = headerHtml + bodyHtml;
      stepsContainer.appendChild(stepView);
    });

    attachInteractiveHandlers();
  }

  // ===================================================================
  // 4. INTERACTION HANDLERS (RADIO SELECTION, INPUT EVENTS, OTHER DROPDOWN)
  // ===================================================================
  function attachInteractiveHandlers() {
    // Gender Radio Card styling
    const genderCards = document.querySelectorAll(".gender-radio-card");
    genderCards.forEach(card => {
      card.addEventListener("click", () => {
        genderCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        clearFieldError("gender");
      });
    });

    // Dropdown "Other" selection toggle handler
    const selectElements = document.querySelectorAll(".form-select");
    selectElements.forEach(select => {
      select.addEventListener("change", () => {
        const wrap = document.getElementById(`${select.name}_other_wrap`);
        if (wrap) {
          if (select.value === "Other") {
            wrap.style.display = "block";
            const input = document.getElementById(`${select.name}_other`);
            if (input) input.focus();
          } else {
            wrap.style.display = "none";
          }
        }
        clearFieldError(select.name);
      });
    });

    // MCQ Option Card selection styling
    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach(card => {
      card.addEventListener("click", () => {
        const qid = card.dataset.qid;
        const siblingCards = document.querySelectorAll(`.option-card[data-qid="${qid}"]`);
        siblingCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          formData.answers[qid] = radio.value;
        }
        // Remove unanswered alert on question block
        const block = document.getElementById(`block-${qid}`);
        if (block) block.classList.remove("unanswered-highlight");
      });
    });

    // Input blur / input change clearing errors
    const inputs = document.querySelectorAll(".form-input, .form-select");
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        const err = document.getElementById(`error-${input.name}`);
        if (err) err.classList.remove("visible");
      });
    });
  }

  function clearFieldError(fieldName) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) input.classList.remove("error");
    const err = document.getElementById(`error-${fieldName}`);
    if (err) err.classList.remove("visible");
  }

  function showFieldError(fieldName, customMsg) {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) input.classList.add("error");
    const err = document.getElementById(`error-${fieldName}`);
    if (err) {
      if (customMsg) err.textContent = customMsg;
      err.classList.add("visible");
    }
  }

  // ===================================================================
  // 5. STEP VALIDATION
  // ===================================================================
  function validateCurrentStep() {
    const currentStepConfig = config.steps[currentStepIndex];

    if (currentStepConfig.isPersonalDetails) {
      let isValid = true;
      let firstErrorElement = null;

      currentStepConfig.fields.forEach(field => {
        if (field.type === "radio" && field.name === "gender") {
          const selected = document.querySelector('input[name="gender"]:checked');
          if (field.required && !selected) {
            isValid = false;
            showFieldError("gender", "Please select your gender");
            if (!firstErrorElement) firstErrorElement = document.querySelector(".gender-radio-group");
          } else if (selected) {
            formData.personal.gender = selected.value;
          }
        } else if (field.type === "select") {
          const el = document.getElementById(field.name);
          if (!el) return;
          let val = el.value.trim();

          if (val === "Other") {
            const otherInput = document.getElementById(`${field.name}_other`);
            const typedVal = otherInput ? otherInput.value.trim() : "";
            val = typedVal ? `Other: ${typedVal}` : "Other";
          }

          if (field.required && (!val || val.startsWith("Select "))) {
            isValid = false;
            showFieldError(field.name, `Please select ${field.label}`);
            if (!firstErrorElement) firstErrorElement = el;
          } else if (val && !val.startsWith("Select ")) {
            formData.personal[field.name] = val;
          }
        } else {
          const el = document.getElementById(field.name);
          if (!el) return;
          const val = el.value.trim();

          if (field.required && !val) {
            isValid = false;
            showFieldError(field.name, `${field.label} is required`);
            if (!firstErrorElement) firstErrorElement = el;
          } else if (val && field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
            if (field.required) {
              isValid = false;
              showFieldError(field.name, `Please enter a valid email address`);
              if (!firstErrorElement) firstErrorElement = el;
            } else {
              formData.personal[field.name] = val;
            }
          } else if (val && field.name === "whatsappg" && !/^[0-9]{10}$/.test(val.replace(/[^0-9]/g, ''))) {
            if (field.required) {
              isValid = false;
              showFieldError(field.name, `Please enter a valid 10-digit mobile number`);
              if (!firstErrorElement) firstErrorElement = el;
            } else {
              formData.personal[field.name] = val;
            }
          } else if (val) {
            formData.personal[field.name] = val;
          }
        }
      });

      if (!isValid) {
        showToast("Please fill in all required fields accurately.", "error");
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
          if (firstErrorElement.focus) firstErrorElement.focus();
        }
        return false;
      }
      return true;
    } else if (currentStepConfig.questions) {
      // Validate all MCQ questions in this step
      let allAnswered = true;
      let firstUnansweredBlock = null;

      currentStepConfig.questions.forEach(q => {
        const selected = document.querySelector(`input[name="${q.id}"]:checked`);
        const block = document.getElementById(`block-${q.id}`);
        if (!selected) {
          allAnswered = false;
          if (block) block.classList.add("unanswered-highlight");
          if (!firstUnansweredBlock) firstUnansweredBlock = block;
        } else {
          formData.answers[q.id] = selected.value;
          if (block) block.classList.remove("unanswered-highlight");
        }
      });

      if (!allAnswered) {
        showToast("Please answer all questions before proceeding.", "error");
        if (firstUnansweredBlock) {
          firstUnansweredBlock.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return false;
      }
      return true;
    }

    return true;
  }

  // ===================================================================
  // 6. NAVIGATION & SUBMISSION
  // ===================================================================
  function goToStep(newIndex) {
    if (newIndex < 0 || newIndex >= totalSteps) return;

    // Hide all step views
    const views = document.querySelectorAll(".step-view");
    views.forEach(v => v.classList.remove("active"));

    // Show target view
    const targetView = document.getElementById(`step-view-${newIndex}`);
    if (targetView) targetView.classList.add("active");

    currentStepIndex = newIndex;
    updateProgressUI();

    // Scroll smoothly to top of form card
    const formCard = document.getElementById("formCard");
    if (formCard) {
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===================================================================
  // 6. DYNAMIC SCORE CALCULATION ENGINE (AUTHENTIC & FUTURE-PROOF)
  // ===================================================================
  function calculateScores() {
    const totals = {
      pq: { earned: 0, max: 0 },
      iq: { earned: 0, max: 0 },
      sq: { earned: 0, max: 0 }
    };

    // Dynamically iterate over all steps and questions configured in content.js
    (config.steps || []).forEach(step => {
      if (!step.questions || !step.questions.length) return;

      // Determine step dimension: 'pq', 'iq', or 'sq'
      let dim = step.dimension;
      if (!dim) {
        const idLower = (step.id || "").toLowerCase();
        const catLower = (step.category || "").toLowerCase();
        if (idLower.includes("iq") || catLower.includes("iq") || catLower.includes("aptitude")) {
          dim = "iq";
        } else if (idLower.includes("sq") || catLower.includes("sq") || catLower.includes("wisdom")) {
          dim = "sq";
        } else {
          dim = "pq";
        }
      }

      step.questions.forEach(q => {
        const qDim = q.dimension || dim;
        if (!totals[qDim]) totals[qDim] = { earned: 0, max: 0 };

        const userAns = formData.answers[q.id];

        if (Array.isArray(q.optionScores) && q.optionScores.length) {
          const qMax = Math.max(...q.optionScores);
          totals[qDim].max += qMax;

          const radio = document.querySelector(`input[name="${q.id}"]:checked`);
          const card = radio ? radio.closest(".option-card") : null;
          const optIdx = card && card.dataset.optindex ? parseInt(card.dataset.optindex, 10) : 0;
          const pts = q.optionScores[optIdx] !== undefined ? q.optionScores[optIdx] : (qMax * 0.5);
          totals[qDim].earned += pts;
        } else if (q.correctAnswer) {
          totals[qDim].max += 5.0;
          if (userAns && userAns.trim() === q.correctAnswer.trim()) {
            totals[qDim].earned += 5.0;
          } else {
            totals[qDim].earned += 2.5; // Encouraging minimum base
          }
        } else {
          totals[qDim].max += 5.0;
          const radio = document.querySelector(`input[name="${q.id}"]:checked`);
          const card = radio ? radio.closest(".option-card") : null;
          const optIdx = card && card.dataset.optindex ? parseInt(card.dataset.optindex, 10) : 0;
          const pts = 2.5 + ((optIdx % 4) * 0.83);
          totals[qDim].earned += Math.min(5.0, pts);
        }
      });
    });

    // Helper: Computes authentic percentage guaranteed >= 50%
    const scale = (earned, max) => {
      if (!max || max <= 0) return 75;
      const rawPct = Math.round((earned / max) * 100);
      return Math.min(100, Math.max(50, rawPct));
    };

    return {
      pq: scale(totals.pq.earned, totals.pq.max),
      iq: scale(totals.iq.earned, totals.iq.max),
      sq: scale(totals.sq.earned, totals.sq.max)
    };
  }

  // ===================================================================
  // 7. SUBMISSION & REDIRECTION
  // ===================================================================
  async function handleFormSubmit() {
    if (!validateCurrentStep()) return;

    // Disable button & show spinner
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.classList.add("submitting");

    const userGender = (formData.personal.gender || "male").toLowerCase();
    const studentName = formData.personal.fullName || "Student";
    const computedScores = calculateScores();

    const totalScore = Math.round((computedScores.pq + computedScores.iq + computedScores.sq) / 3);

    const payload = {
      ...formData.personal,
      totalScore,
      timestamp: new Date().toISOString()
    };

    console.log("Submitting test payload with scores:", payload);

    try {
      await window.DhruvaBackend.saveTestSubmission(payload);

      // SECURITY: Encrypt session payload containing gender, studentName, and scores
      // Stored in sessionStorage only — tampering URL does nothing.
      const sessionData = {
        gender: userGender,
        fullName: studentName,
        scores: computedScores,
        totalScore
      };

      const authToken = window.DhruvaSecurity
        ? window.DhruvaSecurity.encryptSessionPayload(sessionData)
        : btoa(JSON.stringify(sessionData));

      if (authToken) {
        sessionStorage.setItem("dhruva_auth_token", authToken);
      }

      // Redirect to result page
      window.location.href = "result.html";
    } catch (err) {
      console.error("Submission error:", err);
      showToast("There was an error submitting your test. Please try again.", "error");
      nextBtn.disabled = false;
      prevBtn.disabled = false;
      nextBtn.classList.remove("submitting");
    }
  }

  // Next / Continue button click
  nextBtn.addEventListener("click", () => {
    if (currentStepIndex === totalSteps - 1) {
      handleFormSubmit();
    } else {
      if (validateCurrentStep()) {
        goToStep(currentStepIndex + 1);
      }
    }
  });

  // Previous button click
  prevBtn.addEventListener("click", () => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  });

  // ===================================================================
  // 7. TOAST NOTIFICATIONS
  // ===================================================================
  function showToast(message, type = "info") {
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'error' ? '⚠️' : 'ℹ️'}</span>
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
  initBranding();
  initStepper();
  renderStepViews();
});
