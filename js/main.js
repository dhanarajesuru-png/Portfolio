/* ==========================================================================
   MAIN.JS - UI Controller, Modals, Filters, Scrollspy & Interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 0. Theme Settings (Light / Dark Mode Controller)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    if (themeIcon) {
      themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('title', `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`);
    }
  }

  // Initialize theme
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
    });
  }

  // 1. Header scroll effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // 2. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = navMenu.style.display === 'flex';
      navMenu.style.display = isExpanded ? 'none' : 'flex';
      if (!isExpanded) {
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = 'rgba(10, 13, 20, 0.95)';
        navMenu.style.backdropFilter = 'blur(16px)';
        navMenu.style.flexDirection = 'column';
        navMenu.style.padding = '1.5rem';
        navMenu.style.gap = '1.25rem';
        navMenu.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
        }
      });
    });
  }

  // 3. Skills Category Filter Tabs
  const skillTabs = document.querySelectorAll('.skill-tab-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');

      skillCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; }, 10);
        } else {
          card.style.opacity = '0';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    });
  });

  // 4. Technical Architecture Modals
  const modalBackdrop = document.getElementById('tech-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const MODAL_DATA = {
    agro: {
      title: "🌾 Agro AI-suite: Architecture & Technical Blueprint",
      content: `
        <div style="display:flex; flex-direction:column; gap: 1.25rem;">
          <p><b style="color:var(--accent-cyan);">Agro AI-suite</b> provides an end-to-end intelligent agricultural management and plant pathology diagnostic ecosystem.</p>
          
          <div class="modal-detail-card" style="border-color: rgba(0,242,254,0.35);">
            <h4 style="color:var(--accent-cyan);">⚡ Technical Highlights</h4>
            <ul>
              <li><b>Deep Learning Diagnostics:</b> Neural network classifiers fine-tuned on multi-class pathology datasets with real-time inference latency under 48ms.</li>
              <li><b>Gemini RAG Advisory:</b> Contextual agronomy recommendations with prompt guardrails and regional crop guidelines.</li>
              <li><b>Asynchronous Backend:</b> FastAPI architecture featuring rate limiting, background worker tasks, and high-concurrency SQLite WAL (Write-Ahead Logging) caching.</li>
              <li><b>Client PWA:</b> Offline-capable Progressive Web Application with client-side caching.</li>
            </ul>
          </div>

          <div style="display:flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;">
            <a href="https://github.com/dhanarajesuru-png" target="_blank" class="btn btn-primary btn-sm">GitHub Repository</a>
          </div>
        </div>
      `
    },
    aura: {
      title: "🧠 Aura Mind: Architecture & Security Guardrails",
      content: `
        <div style="display:flex; flex-direction:column; gap: 1.25rem;">
          <p><b style="color:var(--accent-violet);">Aura Mind</b> is an AI-powered mental wellness companion engineered with clinical containment guardrails and offline psychological tooling.</p>
          
          <div class="modal-detail-card" style="border-color: rgba(139,92,246,0.35);">
            <h4 style="color:var(--accent-violet);">⚡ Security & Clinical Guardrails</h4>
            <ul>
              <li><b>Dual-Layer Safety Guardrails:</b> Real-time sentiment analysis and crisis regex scanners that intercept self-harm intents and immediately display emergency hotline resources.</li>
              <li><b>TF-IDF CBT/DBT Retrieval:</b> Offline clinical psychological exercise retrieval matching mood states to proven therapeutic frameworks.</li>
              <li><b>Privacy-First Encryption:</b> Client-side AES-256 encryption ensuring user journals and mood logs remain strictly private.</li>
              <li><b>Multi-Modal Interaction:</b> Web Speech API integration for hands-free voice journaling with automated PDF clinical progress reports.</li>
            </ul>
          </div>

          <div style="display:flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem;">
            <a href="https://github.com/dhanarajesuru-png" target="_blank" class="btn btn-primary btn-sm">GitHub Repository</a>
          </div>
        </div>
      `
    },
    rag: {
      title: "📑 Research Breakdown: High-Throughput Gemini & FastAPI RAG",
      content: `
        <div style="display:flex; flex-direction:column; gap: 1.25rem;">
          <p><b>Abstract:</b> Constructing an asynchronous agronomy recommendation pipeline with prompt guardrails and SQLite WAL caching.</p>
          <div class="modal-detail-card" style="border-color: rgba(16,185,129,0.35);">
            <h4 style="color:var(--accent-emerald);">💡 Pipeline Architecture</h4>
            <ul>
              <li><b>Async Non-Blocking Endpoints:</b> FastAPI async handlers paired with connection pooling for concurrent inference requests.</li>
              <li><b>Write-Ahead Logging (WAL):</b> SQLite high-concurrency caching layer preventing redundant LLM API calls on identical crop queries.</li>
              <li><b>Structured Outputs:</b> Pydantic validation schemas enforcing strict agronomy recommendations (chemical treatments, organic sprays, pruning steps).</li>
            </ul>
          </div>
        </div>
      `
    },
    safety: {
      title: "📑 Research Breakdown: Dual-Layer Safety & AES-256 in Healthcare AI",
      content: `
        <div style="display:flex; flex-direction:column; gap: 1.25rem;">
          <p><b>Abstract:</b> Prioritizing user safety, instant crisis intervention, and client-side data sovereignty in clinical conversational systems.</p>
          <div class="modal-detail-card" style="border-color: rgba(139,92,246,0.35);">
            <h4 style="color:var(--accent-violet);">💡 Safety Architecture</h4>
            <ul>
              <li><b>Crisis Interception Layer:</b> Regex and heuristic sentiment filters operating prior to model inference to intercept self-harm intents immediately.</li>
              <li><b>Offline TF-IDF Matching:</b> Pre-indexed CBT/DBT therapeutic exercises retrieved purely client-side without external network calls.</li>
              <li><b>Client-Side AES-256:</b> User journals and mood logs are encrypted locally in the browser with passkeys before saving.</li>
            </ul>
          </div>
        </div>
      `
    }
  };

  // Open modal buttons (Architecture & Articles)
  document.querySelectorAll('.open-modal-btn, .open-article-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modalKey = btn.getAttribute('data-modal') || btn.getAttribute('data-article');
      const data = MODAL_DATA[modalKey];
      if (data && modalBackdrop) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.content;
        modalBackdrop.classList.add('open');
      }
    });
  });

  if (modalCloseBtn && modalBackdrop) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('open');
    });

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('open');
      }
    });
  }

  // 5. Resume Modal Controls
  const resumeModal = document.getElementById('resume-modal');
  const resumeCloseBtn = document.getElementById('resume-close-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');

  document.querySelectorAll('.open-resume-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (resumeModal) resumeModal.classList.add('open');
    });
  });

  if (resumeCloseBtn && resumeModal) {
    resumeCloseBtn.addEventListener('click', () => {
      resumeModal.classList.remove('open');
    });
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        resumeModal.classList.remove('open');
      }
    });
  }

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 6. Interactive RAG Comparison Tabs
  const ragQueryTabs = document.querySelectorAll('.rag-query-tab');
  const ragNaiveText = document.getElementById('rag-naive-text');
  const ragNexusText = document.getElementById('rag-nexus-text');

  const RAG_DATA = {
    multihop: {
      naive: '"Subsidiary relationship could not be found across disconnected text chunks. Returned generic parent company risk factors."',
      nexus: '"Traversed 2 Neo4j hops: Linked Apex Mobility Ltd. & Helios Logistics to EU-CBAM sanctions cited in Form 10-K Exhibit 21.1."'
    },
    table: {
      naive: '"Truncated row chunks; lost column alignment on multi-line footnotes. Output missing quarterly revenue numbers."',
      nexus: '"Parsed layout with Docling; converted table into clean knowledge graph entity triplets with 100% cell accuracy."'
    }
  };

  ragQueryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      ragQueryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const queryKey = tab.getAttribute('data-query');
      if (RAG_DATA[queryKey]) {
        if (ragNaiveText) ragNaiveText.textContent = RAG_DATA[queryKey].naive;
        if (ragNexusText) ragNexusText.textContent = RAG_DATA[queryKey].nexus;
      }
    });
  });

  // 7. Agro AI-suite Interactive Leaf Classifier
  const leafSampleBtns = document.querySelectorAll('.leaf-sample-btn');
  const leafDiseaseName = document.getElementById('leaf-disease-name');
  const leafConfidence = document.getElementById('leaf-confidence');
  const leafAdvisory = document.getElementById('leaf-advisory');

  const LEAF_DATA = {
    apple: {
      name: 'Apple Scab (Venturia inaequalis)',
      confidence: '96.4% Match',
      advisory: '<b>Gemini Advisory:</b> Apply targeted captan or myclobutanil fungicide spray at pre-bloom stage. Ensure canopy pruning for airflow.'
    },
    tomato: {
      name: 'Tomato Early Blight (Alternaria solani)',
      confidence: '94.8% Match',
      advisory: '<b>Gemini Advisory:</b> Remove infected lower foliage. Apply copper octanoate spray and avoid overhead sprinkler watering.'
    },
    corn: {
      name: 'Healthy Corn Foliage (Zea mays)',
      confidence: '99.1% Confidence',
      advisory: '<b>Gemini Advisory:</b> Crop tissue is optimal. Nitrogen index and chlorophyll absorption levels are within ideal ranges.'
    }
  };

  leafSampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      leafSampleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sampleKey = btn.getAttribute('data-sample');
      if (LEAF_DATA[sampleKey]) {
        if (leafDiseaseName) leafDiseaseName.textContent = LEAF_DATA[sampleKey].name;
        if (leafConfidence) leafConfidence.textContent = LEAF_DATA[sampleKey].confidence;
        if (leafAdvisory) leafAdvisory.innerHTML = LEAF_DATA[sampleKey].advisory;
      }
    });
  });

  // 8. Copy-to-Clipboard Helper
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalText = btn.innerHTML;
          btn.innerHTML = `<span style="color:#10b981">✓ Copied!</span>`;
          setTimeout(() => {
            btn.innerHTML = originalText;
          }, 2000);
        });
      }
    });
  });

  // 9. Real Email Delivery Form Handler (FormSubmit.co)
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('contact-submit-btn') || contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '<span>Send Message</span>';

      const nameVal = document.getElementById('form-name')?.value.trim();
      const emailVal = document.getElementById('form-email')?.value.trim();
      const subjectVal = document.getElementById('form-subject')?.value.trim() || 'New Inquiry';
      const messageVal = document.getElementById('form-message')?.value.trim();

      if (!nameVal || !emailVal || !messageVal) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="radar-spinner"></span> <span>Transmitting...</span>`;
      }

      if (formSuccess) formSuccess.style.display = 'none';
      if (formError) formError.style.display = 'none';

      try {
        const response = await fetch('https://formsubmit.co/ajax/dhanarajesuru@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            Name: nameVal,
            Email: emailVal,
            Subject: subjectVal,
            Message: messageVal,
            _subject: `⚡ Portfolio Contact: [${subjectVal}] from ${nameVal}`,
            _template: 'table',
            _captcha: 'false'
          })
        });

        const result = await response.json();

        if (response.ok || result.success === "true" || result.success === true) {
          contactForm.reset();
          if (formSuccess) {
            formSuccess.style.display = 'block';
            setTimeout(() => { formSuccess.style.display = 'none'; }, 7000);
          }
        } else {
          throw new Error('Email gateway returned an error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        if (formError) {
          formError.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // 10. Scroll Reveal Animation & Active Nav ScrollSpy
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.08 });

  revealElements.forEach(el => observer.observe(el));

  // 11. Active Navigation ScrollSpy
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
});


