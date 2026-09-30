/**
 * ===================================================================
 * PDC (PERSONALITY DEVELOPMENT CLUB) — MULTI-STEP ASSESSMENT LOGIC (PQ-IQ-EQ)
 * ===================================================================
 * - 20 Questions: 7 PQ (Max 35) + 6 IQ (Max 30) + 7 EQ (Max 35) = Max 100
 * - Sequential global numbering (Q1 to Q20) with Section context
 * - Single-document Firestore submission to pdc_test_submissions
 * - Strict duplicate submission prevention
 * - Non-silent error handling with retry capability
 * - Tamper-resistant session token generation for result.html
 * ===================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.PDC_CONFIG || window.DHRUVA_CONFIG;

  if (!config) {
    console.error("Configuration not loaded from content.js!");
    return;
  }

  // Application State
  let currentStepIndex = 0;
  const totalSteps = config.steps.length;
  let isSubmitting = false;

  const formData = {
    personal: {},
    answers: {}
  };

  // DOM Elements
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
    const percent = Math.round((currentStepIndex / (totalSteps - 1)) * 100);
    const currentStepConfig = config.steps[currentStepIndex];

    if (stepCountLabel) {
      const stepName = currentStepConfig.isPersonalDetails
        ? "Profile Registration"
        : (currentStepConfig.category || currentStepConfig.title);
      stepCountLabel.textContent = `Step ${currentStepIndex + 1} of ${totalSteps}: ${stepName}`;
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
      if (btnText && !isSubmitting) {
        btnText.textContent = isLastStep ? "Submit Assessment" : "Continue";
      }
    }
  }

  // ===================================================================
  // 3. RENDER FORM STEPS
  // ===================================================================
  function renderStepViews() {
    stepsContainer.innerHTML = "";
    let globalQuestionCounter = 0;

    config.steps.forEach((step, stepIndex) => {
      const stepView = document.createElement("div");
      stepView.className = `step-view ${stepIndex === 0 ? "active" : ""}`;
      stepView.id = `step-view-${stepIndex}`;

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
          const isFullWidth = field.name === "fullName" || field.name === "email";
          const fieldClass = isFullWidth ? "grid-full-width" : "";

          if (field.type === "radio" && field.name === "gender") {
            bodyHtml += `
              <div class="form-group ${fieldClass}">
                <label class="form-label">${field.label} ${field.required ? '<span class="req-star">*</span>' : ''}</label>
                <div class="gender-radio-group" role="radiogroup" aria-label="Gender selection">
                  ${field.options.map(opt => `
                    <label class="gender-radio-card" data-gender="${opt}" tabindex="0" role="radio" aria-checked="false">
                      <input type="radio" name="gender" value="${opt}" ${field.required ? 'required' : ''}>
                      <span>${opt === 'Male' ? ' Male' : (opt === 'Female' ? 'Female' : ' Other')}</span>
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
                <label class="form-label-sub" for="${field.name}_other">Specify ${field.label}:</label>
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
        // Render MCQ Questions with global sequential numbering (Q1 to Q20)
        bodyHtml = `<div class="questions-list">`;
        step.questions.forEach((q) => {
          globalQuestionCounter++;
          const currentQNum = globalQuestionCounter;

          let imageHtml = "";
          if (q.image) {
            imageHtml = `
              <div class="question-media">
                <img src="${q.image}" class="question-img" alt="Question illustration" loading="lazy">
              </div>
            `;
          }

          bodyHtml += `
            <div class="question-block" id="block-${q.id}" data-qid="${q.id}">
              <div class="question-header">
                <span class="question-num-badge" title="Question ${currentQNum} of 20">Q${currentQNum}</span>
                <div style="flex:1;">
                  <span class="question-qid-tag" style="font-size:0.75rem;font-weight:700;color:var(--text-muted);display:inline-block;margin-bottom:4px;">${q.id}</span>
                  <p class="question-text">${q.question}</p>
                </div>
              </div>
              ${imageHtml}
              <div class="options-grid" role="radiogroup" aria-label="Question ${currentQNum} options">
                ${q.options.map((opt) => `
                  <label class="option-card" data-qid="${q.id}" data-optid="${opt.id}" data-marks="${opt.marks}" tabindex="0" role="radio" aria-checked="false">
                    <input type="radio" name="${q.id}" value="${opt.id}" required>
                    <div class="option-indicator" aria-hidden="true">${opt.id}</div>
                    <span class="option-label-text">
                      <strong class="opt-prefix">${opt.id}.</strong> ${opt.text}
                    </span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        });
        bodyHtml += `</div>`;
      }

      // Add a submission error alert placeholder on the last step
      if (stepIndex === totalSteps - 1) {
        bodyHtml += `
          <div id="submissionAlertBox" class="submission-alert-box" style="display:none;margin-top:24px;padding:16px 20px;border-radius:12px;background:var(--status-error-bg);border:1px solid #fecaca;color:var(--status-error);" role="alert">
            <div style="display:flex;align-items:flex-start;gap:12px;">
              <span style="font-size:1.5rem;line-height:1;">⚠️</span>
              <div>
                <strong style="display:block;font-size:0.95rem;margin-bottom:4px;">Submission Unsuccessful</strong>
                <p id="submissionAlertMsg" style="font-size:0.875rem;line-height:1.5;margin:0;">
                  We couldn't save your assessment right now. Please check your internet connection and try submitting again.
                </p>
              </div>
            </div>
          </div>
        `;
      }

      stepView.innerHTML = headerHtml + bodyHtml;
      stepsContainer.appendChild(stepView);
    });

    attachInteractiveHandlers();
  }

  // ===================================================================
  // 4. INTERACTION HANDLERS (RADIO SELECTION, KEYBOARD & OTHER DROPDOWN)
  // ===================================================================
  function attachInteractiveHandlers() {
    // Gender Radio Card selection
    const genderCards = document.querySelectorAll(".gender-radio-card");
    genderCards.forEach(card => {
      const selectGender = () => {
        genderCards.forEach(c => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
        clearFieldError("gender");
        saveDraft();
      };

      card.addEventListener("click", selectGender);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectGender();
        }
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

        // Campus Kondhwa notice handler
        if (select.name === "campus") {
          let kondhwaNotice = document.getElementById("kondhwa-campus-notice");
          if (select.value === "Kondhwa") {
            if (!kondhwaNotice) {
              kondhwaNotice = document.createElement("div");
              kondhwaNotice.id = "kondhwa-campus-notice";
              kondhwaNotice.style.cssText = "margin-top:10px;padding:12px 14px;background:#FFF6F3;border:1px solid #FFBEAD;border-radius:10px;color:#C2410C;font-size:0.86rem;line-height:1.5;";
              kondhwaNotice.innerHTML = `
                <strong>📍 Kondhwa Campus Route:</strong> Students from Kondhwa campus can take their official assessment directly here:
                <a href="https://bit.ly/3Qs-personality-assessment-pdc" target="_blank" rel="noopener noreferrer" style="color:#F96340;font-weight:700;text-decoration:underline;display:block;margin-top:4px;">
                  👉 Open Kondhwa Campus Assessment (https://bit.ly/3Qs-personality-assessment-pdc)
                </a>
              `;
              select.parentElement.appendChild(kondhwaNotice);
            }
          } else if (kondhwaNotice) {
            kondhwaNotice.remove();
          }
        }
        clearFieldError(select.name);
        saveDraft();
      });
    });

    // MCQ Option Card selection & keyboard navigation
    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach(card => {
      const selectOption = () => {
        const qid = card.dataset.qid;
        const optid = card.dataset.optid;
        const siblingCards = document.querySelectorAll(`.option-card[data-qid="${qid}"]`);
        siblingCards.forEach(c => {
          c.classList.remove("selected");
          c.setAttribute("aria-checked", "false");
        });
        card.classList.add("selected");
        card.setAttribute("aria-checked", "true");
        const radio = card.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          formData.answers[qid] = optid;
        }
        // Remove error alert on question block
        const block = document.getElementById(`block-${qid}`);
        if (block) block.classList.remove("unanswered-highlight");
        saveDraft();
      };

      card.addEventListener("click", selectOption);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption();
        }
      });
    });

    // Input blur / input change clearing errors & saving draft
    const inputs = document.querySelectorAll(".form-input, .form-select");
    inputs.forEach(input => {
      input.addEventListener("input", () => {
        input.classList.remove("error");
        const err = document.getElementById(`error-${input.name}`);
        if (err) err.classList.remove("visible");
        saveDraft();
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
            isValid = false;
            showFieldError(field.name, `Please enter a valid email address`);
            if (!firstErrorElement) firstErrorElement = el;
          } else if (val && field.name === "whatsappNumber" && !/^[0-9]{10}$/.test(val.replace(/[^0-9]/g, ''))) {
            isValid = false;
            showFieldError(field.name, `Please enter a valid 10-digit mobile number`);
            if (!firstErrorElement) firstErrorElement = el;
          } else if (val) {
            formData.personal[field.name] = val;
          }
        }
      });

      if (!isValid) {
        showToast("Please complete all required profile fields accurately.", "error");
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
  // 6. NAVIGATION
  // ===================================================================
  function goToStep(newIndex) {
    if (newIndex < 0 || newIndex >= totalSteps) return;

    const views = document.querySelectorAll(".step-view");
    views.forEach(v => v.classList.remove("active"));

    const targetView = document.getElementById(`step-view-${newIndex}`);
    if (targetView) targetView.classList.add("active");

    currentStepIndex = newIndex;
    updateProgressUI();
    saveDraft();

    const formCard = document.getElementById("formCard");
    if (formCard) {
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===================================================================
  // 7. SCORE CALCULATION ENGINE (PQ, IQ, SQ)
  // ===================================================================
  // PQ: 7 questions × max 5 marks = 35
  // IQ: 6 questions × max 5 marks = 30
  // SQ: 7 questions × max 5 marks = 35 (Spiritual Quotient)
  // Total = 35 + 30 + 35 = 100
  // ===================================================================
  function calculateScores() {
    let pqEarned = 0;
    let iqEarned = 0;
    let sqEarned = 0;

    (config.steps || []).forEach(step => {
      if (!step.questions || !step.questions.length) return;

      const dim = (step.dimension || (step.id.includes("iq") ? "iq" : (step.id.includes("sq") || step.id.includes("eq") ? "sq" : "pq"))).toLowerCase();

      step.questions.forEach(q => {
        const userSelectedOptId = formData.answers[q.id];
        if (!userSelectedOptId) return;

        const selectedOpt = q.options.find(o => o.id === userSelectedOptId);
        const marks = selectedOpt ? selectedOpt.marks : 0;

        if (dim === "pq") {
          pqEarned += marks;
        } else if (dim === "iq") {
          iqEarned += marks;
        } else if (dim === "sq" || dim === "eq") {
          sqEarned += marks;
        }
      });
    });

    const roundScore = (val) => Math.round(val * 10) / 10;

    const pq = roundScore(pqEarned);
    const iq = roundScore(iqEarned);
    const sq = roundScore(sqEarned);
    const total = roundScore(pq + iq + sq);

    return {
      pq,
      iq,
      sq,
      eq: sq, // backwards compatibility
      total
    };
  }

  // ===================================================================
  // 8. SUBMISSION & REDIRECTION (RELIABLE & ERROR-PROTECTED)
  // ===================================================================
  async function handleFormSubmit() {
    if (isSubmitting) {
      console.warn("Submission already in progress. Ignoring duplicate click.");
      return;
    }

    if (!validateCurrentStep()) return;

    // Hide any previous error banner
    const alertBox = document.getElementById("submissionAlertBox");
    if (alertBox) alertBox.style.display = "none";

    // Lock submission state
    isSubmitting = true;
    nextBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.classList.add("submitting");
    const btnText = nextBtn.querySelector(".btn-text");
    if (btnText) btnText.textContent = "Submitting Assessment...";

    const userGender = (formData.personal.gender || "male").toLowerCase();
    const studentName = formData.personal.fullName || "Student";
    const computedScores = calculateScores();
    const selectedCampus = String(formData.personal.campus || "").trim();
    const selectedDivision = String(formData.personal.division || "").trim();

    if (selectedCampus === "Kondhwa") {
      const blockedMessage = "Kondhwa campus registrations are handled through a dedicated Kondhwa assessment route. Redirecting you to the Kondhwa page...";
      showToast(blockedMessage, "info");
      setTimeout(() => {
        window.location.href = "kondhwa.html";
      }, 1000);
      return;
    }

    // Payload strictly conforms to Firestore schema
    const submissionTimestamp = new Date().toISOString();
    const payload = {
      fullName: String(formData.personal.fullName || "").trim(),
      email: String(formData.personal.email || "").trim(),
      whatsappNumber: String(formData.personal.whatsappNumber || "").replace(/[^0-9]/g, ""),
      gender: String(formData.personal.gender || "").trim(),
      homeTown: String(formData.personal.homeTown || "").trim(),
      campus: selectedCampus,
      branch: String(formData.personal.branch || "").trim(),
      division: selectedDivision,
      year: String(formData.personal.year || "").trim(),
      answers: { ...formData.answers },
      scores: {
        pq: computedScores.pq,
        iq: computedScores.iq,
        sq: computedScores.sq,
        eq: computedScores.sq
      },
      totalScore: computedScores.total,
      timestamp: submissionTimestamp,
      submittedAt: submissionTimestamp,
      userAgent: (navigator.userAgent || "Unknown Browser").substring(0, 500)
    };

    console.log("Submitting PDC assessment payload:", payload);

    try {
      const backend = window.PDCBackend || window.DhruvaBackend;
      const result = await backend.saveTestSubmission(payload);

      // NEVER redirect if submission explicitly failed with an error
      if (!result || (!result.success && !result.id)) {
        console.error("Submission failed:", result ? result.error : "Unknown error");

        const userMessage = (result && result.error)
          ? result.error
          : "We couldn't save your assessment right now. Please check your internet connection and click Submit Assessment again.";

        const alertMsg = document.getElementById("submissionAlertMsg");
        if (alertMsg) alertMsg.textContent = userMessage;
        if (alertBox) {
          alertBox.style.display = "block";
          alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        showToast(userMessage, "error");

        isSubmitting = false;
        nextBtn.disabled = false;
        prevBtn.disabled = false;
        nextBtn.classList.remove("submitting");
        if (btnText) btnText.textContent = "Submit Assessment";
        return;
      }

      // Submission Succeeded: prepare encrypted session data for result.html
      const sessionData = {
        gender: userGender,
        fullName: studentName,
        scores: {
          pq: computedScores.pq,
          iq: computedScores.iq,
          sq: computedScores.sq,
          eq: computedScores.sq
        },
        totalScore: computedScores.total,
        percentages: {
          pq: Math.round((computedScores.pq / 35) * 100),
          iq: Math.round((computedScores.iq / 30) * 100),
          sq: Math.round((computedScores.sq / 35) * 100),
          eq: Math.round((computedScores.sq / 35) * 100),
          total: Math.round((computedScores.total / 100) * 100)
        },
        maxScores: {
          pq: 35,
          iq: 30,
          sq: 35,
          eq: 35,
          total: 100
        }
      };

      // Clear draft since submission succeeded
      clearDraft();

      const security = window.PDCSecurity || window.DhruvaSecurity;
      const authToken = security
        ? security.encryptSessionPayload(sessionData)
        : btoa(JSON.stringify(sessionData));

      if (authToken) {
        sessionStorage.setItem("pdc_auth_token", authToken);
      }

      // Redirect directly to results
      window.location.href = "result.html";

    } catch (err) {
      console.error("Unexpected error during submission:", err);

      const catchMessage = "An unexpected error occurred while saving your assessment. Please check your internet connection and try again.";

      const alertMsg = document.getElementById("submissionAlertMsg");
      if (alertMsg) alertMsg.textContent = catchMessage;
      if (alertBox) {
        alertBox.style.display = "block";
        alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      showToast("Submission encountered an error. Please try again.", "error");

      isSubmitting = false;
      nextBtn.disabled = false;
      prevBtn.disabled = false;
      nextBtn.classList.remove("submitting");
      if (btnText) btnText.textContent = "Submit Assessment";
    }
  }

  // Next / Continue button click
  nextBtn.addEventListener("click", () => {
    if (currentStepIndex === totalSteps - 1) {
      handleFormSubmit();
    } else {
      if (validateCurrentStep()) {
        if (currentStepIndex === 0 && (formData.personal.campus || "").trim() === "Kondhwa") {
          window.location.href = "kondhwa.html";
          return;
        }
        goToStep(currentStepIndex + 1);
      }
    }
  });

  // Previous button click
  prevBtn.addEventListener("click", () => {
    if (isSubmitting) return;
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  });

  // ===================================================================
  // 9. TOAST NOTIFICATIONS
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

  // ===================================================================
  // 10. REAL-TIME FORM PROGRESS AUTOSAVE (HIGH-TRAFFIC & RELIABILITY)
  // ===================================================================
  const DRAFT_KEY = "pdc_assessment_draft";

  function saveDraft() {
    try {
      // Capture personal details fields
      const pInputs = document.querySelectorAll("#step-view-0 input, #step-view-0 select");
      pInputs.forEach(inp => {
        if (inp.type === "radio") {
          if (inp.checked) formData.personal[inp.name] = inp.value;
        } else if (inp.name && !inp.name.endsWith("_other")) {
          formData.personal[inp.name] = inp.value;
        }
      });

      const draft = {
        currentStepIndex,
        personal: formData.personal,
        answers: formData.answers,
        updatedAt: Date.now()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      // Ignore quota or private-browsing restrictions silently
    }
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (e) {}
  }

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;

      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== "object") return;

      // Expire draft if older than 5 days
      if (draft.updatedAt && Date.now() - draft.updatedAt > 5 * 24 * 60 * 60 * 1000) {
        clearDraft();
        return;
      }

      let restoredCount = 0;

      // Restore Personal Details
      if (draft.personal && typeof draft.personal === "object") {
        formData.personal = { ...draft.personal };
        Object.entries(draft.personal).forEach(([fieldName, val]) => {
          if (!val) return;
          const input = document.querySelector(`[name="${fieldName}"]`);
          if (!input) return;

          if (input.type === "radio") {
            const matchingRadio = document.querySelector(`input[name="${fieldName}"][value="${val}"]`);
            if (matchingRadio) {
              matchingRadio.checked = true;
              const card = matchingRadio.closest(".gender-radio-card");
              if (card) {
                document.querySelectorAll(".gender-radio-card").forEach(c => {
                  c.classList.remove("selected");
                  c.setAttribute("aria-checked", "false");
                });
                card.classList.add("selected");
                card.setAttribute("aria-checked", "true");
              }
              restoredCount++;
            }
          } else {
            input.value = val;
            restoredCount++;
            if (val === "Other") {
              const otherWrap = document.getElementById(`${fieldName}_other_wrap`);
              if (otherWrap) otherWrap.style.display = "block";
            }
          }
        });
      }

      // Restore MCQ Answers
      if (draft.answers && typeof draft.answers === "object") {
        formData.answers = { ...draft.answers };
        Object.entries(draft.answers).forEach(([qid, optid]) => {
          if (!optid) return;
          const card = document.querySelector(`.option-card[data-qid="${qid}"][data-optid="${optid}"]`);
          if (card) {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;
            card.classList.add("selected");
            card.setAttribute("aria-checked", "true");
            restoredCount++;
          }
        });
      }

      // Show friendly restoration notification if data was restored
      if (restoredCount > 0) {
        showDraftRestoredBanner(draft.currentStepIndex || 0);
      }
    } catch (e) {
      console.warn("Could not restore draft:", e);
    }
  }

  function showDraftRestoredBanner(savedStep) {
    const existing = document.getElementById("draft-restored-banner");
    if (existing) existing.remove();

    const banner = document.createElement("div");
    banner.id = "draft-restored-banner";
    banner.style.cssText = "margin-bottom:16px;padding:12px 16px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;color:#166534;font-size:0.875rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;";
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:1.15rem;">✨</span>
        <span><strong>Progress Restored:</strong> Your previous inputs and answers were safely recovered.</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        ${savedStep > 0 ? `<button type="button" id="resumeStepBtn" style="background:#166534;color:#fff;border:none;padding:5px 12px;border-radius:6px;font-size:0.8rem;font-weight:700;cursor:pointer;">Resume Step ${savedStep + 1} →</button>` : ""}
        <button type="button" id="clearDraftBtn" style="background:transparent;color:#DC2626;border:none;font-size:0.8rem;font-weight:700;text-decoration:underline;cursor:pointer;">Clear & Start Fresh</button>
      </div>
    `;

    const formCard = document.getElementById("formCard");
    if (formCard) {
      formCard.insertBefore(banner, formCard.firstChild);
    }

    document.getElementById("clearDraftBtn")?.addEventListener("click", () => {
      clearDraft();
      window.location.reload();
    });

    document.getElementById("resumeStepBtn")?.addEventListener("click", () => {
      goToStep(savedStep);
      banner.remove();
    });
  }

  // Initialize Application
  initBranding();
  initStepper();
  renderStepViews();
  restoreDraft();
});
