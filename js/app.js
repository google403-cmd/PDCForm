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
  const config = window.PDC_CONFIG;

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
        : (step.isCommunityStep ? "Community" : (step.dimension ? step.dimension.toUpperCase() : `Part ${idx}`));

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
        : (currentStepConfig.isCommunityStep ? "WhatsApp Community" : (currentStepConfig.category || currentStepConfig.title));
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
      const isPreCommunity = currentStepConfig.dimension === "sq" || currentStepConfig.dimension === "eq";
      const btnText = nextBtn.querySelector(".btn-text");
      if (btnText && !isSubmitting) {
        if (isLastStep) {
          btnText.textContent = "Submit Assessment";
        } else if (isPreCommunity) {
          btnText.textContent = "Next: WhatsApp Community →";
        } else {
          btnText.textContent = "Continue";
        }
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
      } else if (step.isCommunityStep) {
        const communityUrl = config.whatsappLinks?.COMMUNITY_URL || "https://chat.whatsapp.com/CaX5fQOrSBFFQ45CrtNoRl";
        bodyHtml = `
          <div class="community-step-container">
            <!-- PDC Community Invitation Card -->
            <div class="community-invite-card">
              <div class="community-card-glow"></div>
              
              <div class="community-card-top">
                <div class="community-badge-pill">
                  <span class="live-pulse-dot"></span>
                  <span>Official PDC Community • VIT Pune</span>
                </div>
                <h3 class="community-heading">Join the Official PDC WhatsApp Community</h3>
                <p class="community-lead">
                  Connect with experienced senior mentors, club coordinators, and proactive engineering peers. Get direct notifications for high-impact workshops, 1-on-1 mentor circles, and adventure outings.
                </p>
              </div>

              <!-- Community Benefit Grid -->
              <div class="community-perks-list">
                <div class="community-perk-item">
                  <span class="perk-icon">🎓</span>
                  <div class="perk-text">
                    <strong>Software Training Workshops (STWs)</strong>
                    <span>Direct updates on IIT Bombay technical workshops & tracks</span>
                  </div>
                </div>
                <div class="community-perk-item">
                  <span class="perk-icon">⚡</span>
                  <div class="perk-text">
                    <strong>Personality Development (PDWs)</strong>
                    <span>Stage presence, public speaking drills & group discussion practice</span>
                  </div>
                </div>
                <div class="community-perk-item">
                  <span class="perk-icon">🌿</span>
                  <div class="perk-text">
                    <strong>Personalized Mentor Meets</strong>
                    <span>Confidential 1-on-1 guidance for academics, habits & stress relief</span>
                  </div>
                </div>
                <div class="community-perk-item">
                  <span class="perk-icon">⛺</span>
                  <div class="perk-text">
                    <strong>Edutainment Outings & Camps</strong>
                    <span>Leadership treks, bonfire dialogues & collaborative problem solving</span>
                  </div>
                </div>
              </div>

              <!-- Big Clickable CTA Button -->
              <div class="community-cta-box">
                <a href="${communityUrl}" target="_blank" rel="noopener noreferrer" class="whatsapp-btn community-main-btn" id="communityStepJoinBtn">
                  <svg class="whatsapp-icon" viewBox="0 0 24 24" width="22" height="22">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Click to Join WhatsApp Community</span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </a>
                <span class="community-hint">Opens in a new tab • No spam, strictly official PDC communication</span>
              </div>
            </div>

            <!-- Verification Question & Checkbox Section -->
            <div class="community-verify-box" id="communityVerifyBox">
              <h4 class="verify-title">
                <span>💬</span> Have you joined the PDC WhatsApp Community?
              </h4>
              <p class="verify-desc">
                Select your response below. Either choice allows you to submit your assessment and view your personalized evaluation report.
              </p>

              <div class="community-choice-grid" role="radiogroup" aria-label="WhatsApp Community Join Status">
                <!-- Option Yes -->
                <label class="community-choice-card" id="cardJoinedYes" data-value="yes" tabindex="0" role="radio" aria-checked="false">
                  <input type="radio" name="joinedCommunityChoice" value="yes" id="radioJoinedYes">
                  <div class="choice-indicator">
                    <span class="choice-check">✓</span>
                  </div>
                  <div class="choice-details">
                    <div class="choice-header-row">
                      <strong class="choice-title">Yes, I have joined the Community</strong>
                      <span class="choice-badge badge-yes">Joined ✅</span>
                    </div>
                    <span class="choice-subtext">I joined the group or clicked the link above to connect with PDC mentors.</span>
                  </div>
                </label>

                <!-- Option No -->
                <label class="community-choice-card" id="cardJoinedNo" data-value="no" tabindex="0" role="radio" aria-checked="false">
                  <input type="radio" name="joinedCommunityChoice" value="no" id="radioJoinedNo">
                  <div class="choice-indicator">
                    <span class="choice-check">✓</span>
                  </div>
                  <div class="choice-details">
                    <div class="choice-header-row">
                      <strong class="choice-title">No, I haven't joined yet</strong>
                      <span class="choice-badge badge-no">Will join later</span>
                    </div>
                    <span class="choice-subtext">I will join later or proceed directly to view my score and personalized report.</span>
                  </div>
                </label>
              </div>

              <!-- Confirmation Checkbox -->
              <div class="community-checkbox-container">
                <label class="custom-checkbox-row" for="joinedCommunityCheckbox">
                  <input type="checkbox" id="joinedCommunityCheckbox" name="joinedCommunityCheckbox">
                  <span class="checkbox-visual"></span>
                  <span class="checkbox-label-text">
                    I confirm my response and am ready to submit my assessment
                  </span>
                </label>
              </div>

              <div class="verify-error-msg" id="error-communityChoice" style="display: none;">
                ⚠️ Please select whether you have joined or will join later to submit your assessment.
              </div>
            </div>
          </div>
        `;
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

    // Community Step: WhatsApp Join Button click auto-selection
    const communityJoinBtn = document.getElementById("communityStepJoinBtn");
    if (communityJoinBtn) {
      communityJoinBtn.addEventListener("click", () => {
        selectCommunityChoice("yes");
      });
    }

    // Community Step: Choice Cards (Yes / No)
    const choiceCards = document.querySelectorAll(".community-choice-card");
    choiceCards.forEach(card => {
      const val = card.dataset.value;
      const selectCard = () => {
        selectCommunityChoice(val);
      };
      card.addEventListener("click", selectCard);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectCard();
        }
      });
    });

    // Community Step: Confirmation Checkbox
    const chk = document.getElementById("joinedCommunityCheckbox");
    if (chk) {
      chk.addEventListener("change", () => {
        if (chk.checked) {
          const selectedRadio = document.querySelector('input[name="joinedCommunityChoice"]:checked');
          if (!selectedRadio) {
            selectCommunityChoice("yes");
          }
        }
        const err = document.getElementById("error-communityChoice");
        if (err) err.style.display = "none";
        saveDraft();
      });
    }

    function selectCommunityChoice(val) {
      choiceCards.forEach(c => {
        const isMatch = c.dataset.value === val;
        c.classList.toggle("selected", isMatch);
        c.setAttribute("aria-checked", isMatch ? "true" : "false");
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = isMatch;
      });
      const confirmChk = document.getElementById("joinedCommunityCheckbox");
      if (confirmChk) confirmChk.checked = true;

      formData.joinedCommunity = val;
      const err = document.getElementById("error-communityChoice");
      if (err) err.style.display = "none";
      saveDraft();
    }
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
    } else if (currentStepConfig.isCommunityStep) {
      const selectedRadio = document.querySelector('input[name="joinedCommunityChoice"]:checked');
      const checkbox = document.getElementById("joinedCommunityCheckbox");
      const err = document.getElementById("error-communityChoice");

      if (!selectedRadio && (!checkbox || !checkbox.checked)) {
        if (err) {
          err.style.display = "block";
          err.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        showToast("Please confirm whether you have joined or select No to continue.", "info");
        return false;
      }

      if (err) err.style.display = "none";
      formData.joinedCommunity = selectedRadio ? selectedRadio.value : (checkbox && checkbox.checked ? "yes" : "no");
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
    if (window.PDCAssessmentEngine && typeof window.PDCAssessmentEngine.evaluateAssessment === "function") {
      const evaluation = window.PDCAssessmentEngine.evaluateAssessment(formData.answers);
      return {
        ...evaluation.scores,
        total: evaluation.totalScore,
        evaluation
      };
    }

    // Fallback if engine is not initialized
    let pqEarned = 0;
    let iqEarned = 0;
    let sqEarned = 0;

    (config.steps || []).forEach(step => {
      if (!step.questions || !step.questions.length) return;
      const dim = (step.dimension || (step.id.includes("iq") ? "iq" : "pq")).toLowerCase();

      step.questions.forEach(q => {
        const userSelectedOptId = formData.answers[q.id];
        if (!userSelectedOptId) return;

        const selectedOpt = q.options.find(o => o.id === userSelectedOptId);
        const marks = selectedOpt ? (selectedOpt.marks || 0) : 0;

        if (dim === "pq") {
          pqEarned += marks;
        } else if (dim === "iq") {
          iqEarned += marks;
        } else if (dim === "sq") {
          sqEarned += marks;
        }
      });
    });

    const roundScore = (val) => Math.round(val * 10) / 10;
    const pq = roundScore(pqEarned);
    const iq = roundScore(iqEarned);
    const sq = roundScore(sqEarned);
    const total = roundScore(pq + iq + sq);

    return { pq, iq, sq, eq: sq, total };
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

    // Run complete evaluation engine
    const evaluation = window.PDCAssessmentEngine
      ? window.PDCAssessmentEngine.evaluateAssessment(formData.answers)
      : null;

    const computedScores = evaluation
      ? evaluation.scores
      : calculateScores();
    const totalScore = evaluation
      ? evaluation.totalScore
      : (computedScores.total || Math.round(computedScores.pq + computedScores.iq + computedScores.sq));

    // Payload strictly conforms to Firestore schema while saving all required evaluation data
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
      answersByQuestion: { ...formData.answers },
      questionIds: Object.keys(formData.answers || {}),
      selectedOptionIds: { ...formData.answers },
      scores: {
        pq: computedScores.pq,
        iq: computedScores.iq,
        sq: computedScores.sq,
        eq: computedScores.sq,
        // Nested evaluation fields guarantee preservation even if Firestore rules restrict top-level keys
        personalityDimensions: evaluation ? evaluation.personalityDimensions : {},
        primaryProfile: evaluation ? evaluation.primaryProfile.name : "",
        secondaryProfile: evaluation ? evaluation.secondaryProfile.name : "",
        cognitiveScore: evaluation ? evaluation.cognitiveProfile.correctAnswers : 0,
        cognitiveProfile: evaluation ? evaluation.cognitiveProfile.label : "",
        spiritualDimensions: evaluation ? evaluation.spiritualProfile.dimensions : {},
        spiritualProfile: evaluation ? evaluation.spiritualProfile.name : "",
        report: evaluation ? evaluation.report : {}
      },
      totalScore: totalScore,
      timestamp: submissionTimestamp,
      submittedAt: submissionTimestamp,
      userAgent: (navigator.userAgent || "Unknown Browser").substring(0, 500),
      // Top-level fields when supported by Firestore rules
      personalityDimensions: evaluation ? evaluation.personalityDimensions : {},
      primaryProfile: evaluation ? evaluation.primaryProfile.name : "",
      secondaryProfile: evaluation ? evaluation.secondaryProfile.name : "",
      cognitiveScore: evaluation ? evaluation.cognitiveProfile.correctAnswers : 0,
      cognitiveProfile: evaluation ? evaluation.cognitiveProfile.label : "",
      spiritualDimensions: evaluation ? evaluation.spiritualProfile.dimensions : {},
      spiritualProfile: evaluation ? evaluation.spiritualProfile.name : "",
      report: evaluation ? evaluation.report : {}
    };

    console.log("Submitting PDC assessment payload:", payload);

    try {
      const backend = window.PDCBackend;
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
        joinedCommunity: formData.joinedCommunity || "yes",
        campus: selectedCampus,
        scores: {
          pq: computedScores.pq,
          iq: computedScores.iq,
          sq: computedScores.sq,
          eq: computedScores.sq
        },
        totalScore: totalScore,
        answers: { ...formData.answers },
        evaluation: evaluation || null,
        personalityDimensions: evaluation ? evaluation.personalityDimensions : {},
        primaryProfile: evaluation ? evaluation.primaryProfile : null,
        secondaryProfile: evaluation ? evaluation.secondaryProfile : null,
        cognitiveProfile: evaluation ? evaluation.cognitiveProfile : null,
        spiritualProfile: evaluation ? evaluation.spiritualProfile : null,
        report: evaluation ? evaluation.report : null,
        percentages: {
          pq: Math.round((computedScores.pq / 35) * 100),
          iq: Math.round((computedScores.iq / 30) * 100),
          sq: Math.round((computedScores.sq / 35) * 100),
          eq: Math.round((computedScores.sq / 35) * 100),
          total: Math.round((totalScore / 100) * 100)
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

      const security = window.PDCSecurity;
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
        joinedCommunity: formData.joinedCommunity || "",
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
    } catch (e) { }
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

      // Restore Community Choice
      if (draft.joinedCommunity) {
        formData.joinedCommunity = draft.joinedCommunity;
        const matchingChoice = document.querySelector(`.community-choice-card[data-value="${draft.joinedCommunity}"]`);
        if (matchingChoice) {
          const radio = matchingChoice.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
          document.querySelectorAll(".community-choice-card").forEach(c => {
            c.classList.remove("selected");
            c.setAttribute("aria-checked", "false");
          });
          matchingChoice.classList.add("selected");
          matchingChoice.setAttribute("aria-checked", "true");
          restoredCount++;
        }
        const chk = document.getElementById("joinedCommunityCheckbox");
        if (chk) chk.checked = true;
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
