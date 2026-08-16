/* ==========================================================================
   GRAPH-SIM.JS - Interactive LangGraph & Corrective GraphRAG Visualizer
   ========================================================================== */

(function () {
  const querySelect = document.getElementById('sim-query-select');
  const runBtn = document.getElementById('sim-run-btn');
  const logViewer = document.getElementById('sim-log-viewer');
  
  const nodes = {
    router: document.getElementById('sim-node-router'),
    retriever: document.getElementById('sim-node-retriever'),
    crag: document.getElementById('sim-node-crag'),
    hallucination: document.getElementById('sim-node-hallucination'),
    generator: document.getElementById('sim-node-generator')
  };

  if (!querySelect || !runBtn || !logViewer) return;

  const SCENARIOS = {
    'multi-hop': {
      query: "Which subsidiaries of Company A are exposed to the same regulatory sanctions as Supplier B?",
      steps: [
        {
          node: 'router',
          title: "Router Agent",
          status: "Route -> Multi-Hop Knowledge Graph (Neo4j)",
          log: "[Router] Query identified as high multi-hop entity dependency. Dispatching Cypher generator + dense vector hybrid pipeline.",
          type: 'active'
        },
        {
          node: 'retriever',
          title: "Hybrid Retrieval Engine",
          status: "Neo4j Cypher Traversal (Depth=2) + Qdrant BGE-M3 (Top-k=15)",
          log: "[Retriever] Executing Cypher: MATCH (c:Company {name:'Company A'})-[:OWNS*1..2]->(s:Subsidiary)-[:EXPOSED_TO]->(r:Regulation)<-[:EXPOSED_TO]-(b:Supplier {name:'Supplier B'}) RETURN s, r\nFound 4 interconnected entities across 2 SEC 10-K filings.",
          type: 'active'
        },
        {
          node: 'crag',
          title: "CRAG Confidence Evaluator",
          status: "Confidence Score: 0.94 (High) - No Web Fallback Needed",
          log: "[CRAG Evaluator] Context relevance score = 0.94 >= 0.70 threshold. Graph relations verified. Proceeding directly to generation.",
          type: 'success'
        },
        {
          node: 'generator',
          title: "Synthesis & Reasoning Agent",
          status: "Synthesizing answer with strict Markdown table & citations",
          log: "[Generator] Drafting multi-hop dependency synthesis with 4 verified node citations: [Doc-10K-Sec4, Doc-10K-Sec9].",
          type: 'active'
        },
        {
          node: 'hallucination',
          title: "Hallucination Grader Node",
          status: "Hallucination Check: PASSED (Grounding Score 0.98)",
          log: "[Hallucination Grader] 100% of claims are semantically grounded in retrieved triplets. Output certified valid.",
          type: 'success'
        }
      ],
      finalResponse: `<b>NexusGraph Multi-Hop Synthesis:</b><br>
      • <b>Identified Subsidiaries:</b> <code>Apex Mobility Ltd.</code> and <code>Helios Logistics B.V.</code><br>
      • <b>Shared Regulatory Sanction:</b> <i>EU Cross-Border Carbon Compliance Directives (EU-CBAM Article 7)</i>.<br>
      • <b>Grounding:</b> 2 Knowledge Graph hops mapped across FY25 Form 10-K & Subsidiary Exhibit 21.1.`
    },
    'ambiguous': {
      query: "Analyze ungrounded rumors regarding Q4 CFO transition timeline",
      steps: [
        {
          node: 'router',
          title: "Router Agent",
          status: "Route -> Dense Vector Retriever (Qdrant)",
          log: "[Router] Query classified as unstructured text search. Querying internal SEC filings vector index.",
          type: 'active'
        },
        {
          node: 'retriever',
          title: "Hybrid Retrieval Engine",
          status: "Qdrant Dense Search (BGE-M3, Cosine Sim)",
          log: "[Retriever] Top-k chunks returned. Highest cosine similarity = 0.46 (Low relevance).",
          type: 'warning'
        },
        {
          node: 'crag',
          title: "CRAG Confidence Evaluator",
          status: "Confidence 0.46 < 0.70 -> Triggering Tavily Web Fallback",
          log: "[CRAG Evaluator] Low internal confidence detected! Executing Self-Correction: Query rewriting -> Executing Tavily Live Web Search API.",
          type: 'warning'
        },
        {
          node: 'generator',
          title: "Synthesis & Reasoning Agent",
          status: "Drafting verified answer from official PR wire & SEC 8-K filings",
          log: "[Generator] Merging web facts with official Form 8-K press release.",
          type: 'active'
        },
        {
          node: 'hallucination',
          title: "Hallucination Grader Node",
          status: "Hallucination Check: PASSED (Ungrounded claims filtered)",
          log: "[Hallucination Grader] Unverified market rumors flagged and discarded. Only certified dates included in final output.",
          type: 'success'
        }
      ],
      finalResponse: `<b>Self-Corrected Synthesis (via CRAG):</b><br>
      • <b>Official SEC 8-K Status:</b> CFO transition was formally filed on Oct 14, 2025 with effective date Jan 1, 2026.<br>
      • <b>CRAG Resolution:</b> Internal docs lacked recent press coverage; Tavily agent retrieved the official disclosure, preventing hallucination.`
    }
  };

  let isRunning = false;

  function resetNodes() {
    Object.values(nodes).forEach(node => {
      if (node) {
        node.className = 'sim-node';
        const statusEl = node.querySelector('.sim-node-status');
        if (statusEl) statusEl.textContent = 'Idle';
      }
    });
  }

  function appendLog(text, isHeader = false) {
    const entry = document.createElement('div');
    entry.className = 'sim-log-entry';
    const now = new Date().toTimeString().split(' ')[0];
    entry.innerHTML = `<span class="timestamp">[${now}]</span> ${text.replace(/\n/g, '<br>')}`;
    logViewer.appendChild(entry);
    logViewer.scrollTop = logViewer.scrollHeight;
  }

  async function runSimulation() {
    if (isRunning) return;
    isRunning = true;
    runBtn.disabled = true;
    runBtn.innerHTML = `<span class="radar-spinner"></span> Running Pipeline...`;

    logViewer.innerHTML = `<div class="sim-log-title">🚀 Execution Log & Trace Stream</div>`;
    resetNodes();

    const scenarioKey = querySelect.value || 'multi-hop';
    const scenario = SCENARIOS[scenarioKey];

    appendLog(`<b>Initiating query:</b> "${scenario.query}"`);

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      const nodeEl = nodes[step.node];

      if (nodeEl) {
        resetNodes();
        nodeEl.className = `sim-node ${step.type}`;
        const statusEl = nodeEl.querySelector('.sim-node-status');
        if (statusEl) statusEl.textContent = step.status;
      }

      appendLog(step.log);
      await new Promise(resolve => setTimeout(resolve, 1100));
    }

    appendLog(`<hr style="border-color: rgba(255,255,255,0.1); margin: 0.5rem 0;"><div style="background: rgba(0, 242, 254, 0.08); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(0, 242, 254, 0.3);">${scenario.finalResponse}</div>`);

    // Reset run button
    runBtn.disabled = false;
    runBtn.innerHTML = `<span>▶ Run Pipeline Trace</span>`;
    isRunning = false;
  }

  runBtn.addEventListener('click', runSimulation);
})();
