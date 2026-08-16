/* ==========================================================================
   AI-ASSISTANT.JS - Interactive AI Twin Portfolio Chatbot Widget
   ========================================================================== */

(function () {
  const toggleBtn = document.getElementById('ai-widget-toggle');
  const chatDrawer = document.getElementById('ai-chat-drawer');
  const closeBtn = document.getElementById('chat-close-btn');
  const messagesContainer = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const quickPromptsContainer = document.getElementById('chat-quick-prompts');

  if (!toggleBtn || !chatDrawer) return;

  const KNOWLEDGE_BASE = [
    {
      keywords: ['hire', 'why', 'recruiter', 'strengths', 'fit', 'role'],
      response: `<b>Why hire Esuru Dhanaraj?</b><br>
      1. <b>Full-Stack AI Specialization:</b> Builds end-to-end applications bridging PyTorch deep learning models with Google Gemini RAG pipelines and asynchronous backends.<br>
      2. <b>Production Architecture:</b> Implements high-throughput FastAPI REST APIs with SQLite WAL caching and client-side AES-256 encryption.<br>
      3. <b>Academic Excellence:</b> Pursuing Master's in Gen AI at SRM University with a top-tier <b>8.76 CGPA</b>.<br>
      4. <b>Industry Validated:</b> Completed 4 competitive internships across Gen AI, Cyber Security, AWS Cloud, and AIML.`
    },
    {
      keywords: ['agro', 'farming', 'pytorch', 'plants', 'deep learning', 'disease'],
      response: `<b>Agro AI-suite:</b><br>
      An AI-powered smart farming platform featuring:<br>
      • <b>Deep Learning Diagnostics:</b> Fine-tuned neural models classifying 14 crop diseases with real-time inference latency under 48ms.<br>
      • <b>Advisory RAG:</b> Google Gemini-based agronomy recommendation engine with localized treatment guidelines and soil data integration.<br>
      • <b>Backend:</b> Asynchronous FastAPI with rate limiting, SQLite WAL caching, and offline-capable PWA support.`
    },
    {
      keywords: ['aura', 'mind', 'mental', 'cbt', 'companion', 'guardrails'],
      response: `<b>Aura Mind:</b><br>
      An AI Mental Health Companion PWA featuring:<br>
      • Dual-layer safety guardrails intercepting crisis triggers.<br>
      • TF-IDF RAG engine for offline CBT/DBT clinical exercise retrieval.<br>
      • Speech-to-Text journaling, mood analytics, and AES-256 client data encryption.`
    },
    {
      keywords: ['education', 'srm', 'degree', 'cgpa', 'university', 'college'],
      response: `<b>Education:</b><br>
      • <b>MCA in Generative AI</b> (2025 - 2027) - SRM University, Kattankulathur (CGPA: <b>8.76 / 10.0</b>)<br>
      • <b>BCA</b> (2022 - 2025) - Aditya Degree College, Visakhapatnam (CGPA: <b>8.33 / 10.0</b>)`
    },
    {
      keywords: ['contact', 'email', 'phone', 'reach', 'linkedin', 'github'],
      response: `<b>Contact Dhanaraj:</b><br>
      • <b>Email:</b> <a href="mailto:dhanarajesuru@gmail.com" class="chat-link">dhanarajesuru@gmail.com</a><br>
      • <b>Phone:</b> <a href="tel:+917815809310" class="chat-link">+91-7815809310</a><br>
      • <b>LinkedIn:</b> <a href="https://www.linkedin.com/in/dhanaraj-esuru" target="_blank" class="chat-link">linkedin.com/in/dhanaraj-esuru</a><br>
      • <b>GitHub:</b> <a href="https://github.com/dhanarajesuru-png" target="_blank" class="chat-link">github.com/dhanarajesuru-png</a>`
    },
    {
      keywords: ['intern', 'internship', 'internships', 'experience', 'work', 'eduskills', 'adhoc', 'ulearn', 'career'],
      response: `<b>Industry Internships (4 Completed):</b><br>
      1. <b>Gen AI Virtual Internship</b> — EduSkills Foundation (Supported by AICTE & AWS Academy): AWS Bedrock, LLM fine-tuning, prompt engineering pipelines, and cloud-native AI deployments.<br>
      2. <b>Cyber Security Virtual Internship</b> — EduSkills Foundation (Supported by AICTE & Palo Alto Networks): Enterprise network security, cloud threat detection, zero-trust architectures, and application encryption.<br>
      3. <b>AWS Cloud Computing Intern</b> — Adhoc Network Tech Company: Cloud infrastructure engineering, AWS EC2, S3, IAM policies, and asynchronous serverless workflows.<br>
      4. <b>AIML Developer Internship</b> — Ulearn (Supported by University of Colorado Denver): Supervised & unsupervised ML models, Python, Scikit-learn, and neural networks.`
    },
    {
      keywords: ['skills', 'stack', 'technologies', 'tools', 'python', 'aws'],
      response: `<b>Technical Arsenal:</b><br>
      • <b>AI & LLM Systems:</b> Google Gemini API, Prompt Engineering, RAG Pipelines, Transformers, PyTorch.<br>
      • <b>Backend & Full Stack:</b> Python, FastAPI (Async), Node.js, Express, React, SQLite (WAL mode), REST APIs.<br>
      • <b>Cloud & Security:</b> AWS Bedrock, AWS Cloud, Cyber Security, AES-256 Encryption, PWA.`
    }
  ];

  function toggleChat() {
    chatDrawer.classList.toggle('open');
    if (chatDrawer.classList.contains('open')) {
      chatInput.focus();
    }
  }

  function appendMessage(text, sender = 'bot') {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;
    bubble.innerHTML = text;
    messagesContainer.appendChild(bubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function findAnswer(query) {
    const q = query.toLowerCase();
    
    for (const item of KNOWLEDGE_BASE) {
      if (item.keywords.some(kw => q.includes(kw))) {
        return item.response;
      }
    }

    return `I can provide details regarding Dhanaraj's <b>4 Industry Internships</b>, <b>Agro AI-suite</b> or <b>Aura Mind</b> projects, <b>skills & tech stack</b>, <b>academic background at SRM University</b>, or <b>contact details</b>. What would you like to explore?`;
  }

  function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(escapeHtml(text), 'user');
    chatInput.value = '';

    // Simulate AI thinking delay
    setTimeout(() => {
      const answer = findAnswer(text);
      appendMessage(answer, 'bot');
    }, 450);
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  toggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  if (quickPromptsContainer) {
    quickPromptsContainer.addEventListener('click', (e) => {
      const target = e.target.closest('.shortcut-btn');
      if (target) {
        const query = target.getAttribute('data-prompt');
        if (query) {
          chatInput.value = query;
          handleSend();
        }
      }
    });
  }
})();
