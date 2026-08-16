/* ==========================================================================
   TERMINAL.JS - Interactive CLI Terminal Emulator
   ========================================================================== */

(function () {
  const terminalBody = document.getElementById('terminal-body');
  const terminalInput = document.getElementById('terminal-input');
  const shortcutButtons = document.querySelectorAll('.shortcut-btn');

  if (!terminalBody || !terminalInput) return;

  const COMMANDS = {
    help: `Available commands:
  • <span class="term-cmd">about</span>       : Overview of Esuru Dhanaraj
  • <span class="term-cmd">projects</span>    : Flagship GenAI & LLM projects
  • <span class="term-cmd">nexusgraph</span>  : Deep-dive into GraphRAG & Multi-Agent engine
  • <span class="term-cmd">skills</span>      : Core tech stack & frameworks
  • <span class="term-cmd">evals</span>       : Ragas benchmark scores & evaluation metrics
  • <span class="term-cmd">education</span>   : Academic background & degrees
  • <span class="term-cmd">contact</span>     : Email, LinkedIn, and GitHub coordinates
  • <span class="term-cmd">sudo hire</span>   : Recruitment verdict & suitability
  • <span class="term-cmd">clear</span>       : Clear terminal screen`,

    about: `<b>Esuru Dhanaraj</b>
• Role: Generative AI Engineer & AI Researcher
• Education: Master of Computer Applications in Gen AI (MCA), SRM University (CGPA: 8.76)
• Focus: Autonomous Multi-Agent Workflows (LangGraph), Hybrid GraphRAG (Neo4j + Qdrant), Corrective RAG (CRAG), and LLMOps Evaluation (Ragas).`,

    skills: `<b>Core Competencies:</b>
• <b>Agentic & RAG:</b> LangGraph, Neo4j GraphRAG, Qdrant, Milvus, Corrective RAG (CRAG), BGE-M3, Cohere Rerank
• <b>LLMs & DL:</b> PyTorch, Transformers, Gemini API, OpenAI API, Prompt Engineering, Fine-Tuning
• <b>Backends:</b> Python, FastAPI (Async), Node.js, Express, SQLite WAL, Redis, REST APIs
• <b>Cloud & LLMOps:</b> AWS Cloud Services, Docker, Ragas Evals, LangSmith, Cyber Security & AES-256`,

    projects: `<b>Flagship Projects:</b>
1. <b>NexusGraph:</b> Enterprise Corrective GraphRAG & Multi-Agent Due-Diligence Engine (LangGraph + Neo4j + Qdrant + Ragas)
2. <b>Agro AI-suite:</b> AI-Powered Smart Farming Platform (PyTorch CV + Gemini RAG + FastAPI + SQLite WAL)
3. <b>Aura Mind:</b> Mental Health Companion with Dual-Layer Safety Guardrails (Node.js + TF-IDF RAG + Gemini API)
<i>Type <span class="term-cmd">nexusgraph</span> for deep technical details.</i>`,

    nexusgraph: `<b>NexusGraph Architecture Blueprint:</b>
• <b>Problem:</b> Naive RAG fails at multi-hop reasoning and table parsing across 10-K SEC filings.
• <b>Solution:</b> Hybrid Vector + Dynamic Neo4j Cypher Traversal + LangGraph Self-Correction (CRAG).
• <b>Ragas Metrics:</b> Faithfulness: <b>96.1%</b> | Context Recall: <b>91.8%</b> | Multi-Hop Accuracy: <b>88.5%</b>.
• <b>Guardrail:</b> Automated Hallucination Grader node rejecting ungrounded claims.`,

    evals: `<b>Ragas Production Benchmark Scorecard:</b>
┌─────────────────────────┬───────────┬────────────┬─────────────┐
│ Metric                  │ Baseline  │ NexusGraph │ Improvement │
├─────────────────────────┼───────────┼────────────┼─────────────┤
│ Faithfulness            │ 72.4%     │ <b>96.1%</b>     │ +23.7%      │
│ Context Recall          │ 64.0%     │ <b>91.8%</b>     │ +27.8%      │
│ Multi-Hop Query Acc.    │ 41.2%     │ <b>88.5%</b>     │ +47.3%      │
│ Hallucination Rate      │ 18.3%     │ <b>&lt; 3.9%</b>     │ -14.4%      │
└─────────────────────────┴───────────┴────────────┴─────────────┘`,

    education: `<b>Academic Credentials:</b>
• <b>Master of Computer Applications in Gen AI (MCA)</b> (2025 - 2027)
  SRM University, Kattankulathur | CGPA: <b>8.76 / 10.0</b>
• <b>Bachelor of Computer Applications (BCA)</b> (2022 - 2025)
  Aditya Degree College, Visakhapatnam | CGPA: <b>8.33 / 10.0</b>`,

    contact: `<b>Direct Contact Details:</b>
• Email: <a href="mailto:dhanarajesuru@gmail.com" style="color:#00f2fe">dhanarajesuru@gmail.com</a>
• Phone: <a href="tel:+917815809310" style="color:#00f2fe">+91-7815809310</a>
• LinkedIn: <a href="https://www.linkedin.com/in/dhanaraj-esuru" target="_blank" style="color:#00f2fe">linkedin.com/in/dhanaraj-esuru</a>
• GitHub: <a href="https://github.com/dhanarajesuru-png" target="_blank" style="color:#00f2fe">github.com/dhanarajesuru-png</a>`,

    'sudo hire': `<span style="color:#10b981"><b>[ACCESS GRANTED] Match Score: 99.4%</b></span>
Candidate possesses production-grade expertise in GraphRAG, Multi-Agent orchestration, async FastAPI backends, and rigorous LLM evaluation frameworks. Ready for GenAI Engineer & LLM Developer roles!`
  };

  function printOutput(cmd, outputHtml) {
    const cmdLine = document.createElement('div');
    cmdLine.className = 'term-line';
    cmdLine.innerHTML = `<span class="term-prompt">visitor@dhanaraj:~$</span> <span class="term-cmd">${escapeHtml(cmd)}</span>`;
    terminalBody.appendChild(cmdLine);

    if (outputHtml) {
      const outLine = document.createElement('div');
      outLine.className = 'term-output';
      outLine.innerHTML = outputHtml;
      terminalBody.appendChild(outLine);
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function handleCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      terminalBody.innerHTML = '';
      return;
    }

    if (COMMANDS[cmd]) {
      printOutput(cmd, COMMANDS[cmd]);
    } else {
      printOutput(cmd, `<span style="color:#f43f5e">command not found: ${escapeHtml(cmd)}</span>. Type <span class="term-cmd">help</span> for a list of commands.`);
    }
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      handleCommand(val);
    }
  });

  shortcutButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        handleCommand(cmd);
      }
    });
  });

  // Initial welcome message
  printOutput('welcome', `🚀 <b>NexusOS AI Terminal v2.4 initialized.</b><br>Type <span class="term-cmd">help</span> or click the quick shortcut buttons below.`);
})();
