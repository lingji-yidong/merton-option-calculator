/**
 * Cloudflare Worker - Option Pricing Calculator (Ocean/Glacial Theme)
 * Features: Fresh UI, Responsive Layout, Multi-language, Merton Model.
 */

export default {
  async fetch(request) {
    const html = getHtmlPage();
    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
};

function getHtmlPage() {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Merton.Calc</title>
      
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  
      <style>
          :root {
              /* --- Theme: Ocean / Glacial --- */
              
              /* Glass Base */
              --glass-bg: rgba(255, 255, 255, 0.65);
              --glass-border: rgba(255, 255, 255, 0.6);
              --glass-highlight: rgba(255, 255, 255, 0.9);
              --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
              
              /* Text Colors */
              --text-main: #0f172a;   /* Slate 900 */
              --text-muted: #475569;  /* Slate 600 */
              
              /* Accents (Cooler Tones) */
              --accent: #06b6d4;      /* Cyan 500 */
              --accent-hover: #0891b2; /* Cyan 600 */
              --accent-glow: rgba(6, 182, 212, 0.4);
              
              /* Result Colors */
              --call-color: #059669;  /* Emerald 600 - Fresh Green */
              --call-bg: rgba(167, 243, 208, 0.4);
              --put-color: #e11d48;   /* Rose 600 - Cleaner Red */
              --put-bg: rgba(254, 205, 211, 0.4);

              /* Background Gradient Colors */
              --bg-grad-1: #e0f2fe;   /* Light Sky */
              --bg-grad-2: #f0f9ff;   /* Alice Blue */
              --orb-1: rgba(6, 182, 212, 0.3);  /* Cyan Orb */
              --orb-2: rgba(59, 130, 246, 0.3); /* Blue Orb */
          }
  
          * { box-sizing: border-box; outline: none; -webkit-tap-highlight-color: transparent; }
  
          body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              margin: 0;
              min-height: 100vh;
              /* Fix for mobile browser url bar */
              min-height: 100dvh; 
              display: flex;
              justify-content: center;
              align-items: center;
              color: var(--text-main);
              overflow-x: hidden;
              
              /* Fresh Background */
              background: linear-gradient(135deg, var(--bg-grad-2) 0%, var(--bg-grad-1) 100%);
              position: relative;
          }
  
          /* Animated Background Orbs (Cooler Colors) */
          body::before, body::after {
              content: '';
              position: absolute;
              width: 60vw;
              height: 60vw;
              max-width: 600px;
              max-height: 600px;
              border-radius: 50%;
              filter: blur(80px);
              z-index: -1;
              animation: float 12s infinite ease-in-out alternate;
          }
          body::before {
              background: var(--orb-1);
              top: -10%; left: -10%;
          }
          body::after {
              background: var(--orb-2);
              bottom: -10%; right: -10%;
              animation-delay: -6s;
          }
          
          @keyframes float {
              0% { transform: translate(0, 0) scale(1); }
              100% { transform: translate(40px, 60px) scale(1.05); }
          }
  
          /* Main Layout Container */
          .glass-panel {
              width: 90%;
              max-width: 1000px;
              /* Auto height, margin for spacing */
              margin: 2rem auto; 
              
              background: var(--glass-bg);
              backdrop-filter: blur(20px) saturate(180%);
              -webkit-backdrop-filter: blur(20px) saturate(180%);
              border: 1px solid var(--glass-border);
              border-radius: 32px;
              box-shadow: var(--glass-shadow);
              
              display: grid;
              grid-template-columns: 350px 1fr; /* Fixed sidebar, fluid content */
              overflow: hidden;
              position: relative;
              transition: all 0.3s ease;
          }
  
          /* --- Sidebar (Inputs) --- */
          .sidebar {
              padding: 2.5rem;
              background: rgba(255, 255, 255, 0.4);
              border-right: 1px solid var(--glass-border);
              display: flex;
              flex-direction: column;
              gap: 1.25rem;
              position: relative;
              z-index: 2;
          }
  
          .header-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 0.5rem;
          }
  
          .logo {
              font-size: 1.4rem;
              font-weight: 800;
              /* Cool Gradient Text */
              background: linear-gradient(135deg, #0e7490 0%, #2563eb 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              letter-spacing: -0.03em;
          }
  
          /* Language Selector */
          .lang-pill {
              display: flex;
              background: rgba(255,255,255,0.6);
              border-radius: 20px;
              padding: 3px;
              border: 1px solid rgba(255,255,255,0.8);
          }
          .lang-btn {
              border: none;
              background: transparent;
              font-size: 0.75rem;
              font-weight: 600;
              padding: 4px 10px;
              cursor: pointer;
              border-radius: 14px;
              color: var(--text-muted);
              transition: all 0.2s;
          }
          .lang-btn.active {
              background: #fff;
              color: var(--accent-hover);
              box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }
  
          /* Form Inputs */
          .input-group { display: flex; flex-direction: column; gap: 6px; }
          .input-group label {
              font-size: 0.8rem;
              font-weight: 600;
              color: var(--text-muted);
              margin-left: 4px;
          }
  
          .input-wrapper {
              position: relative;
              display: flex;
              align-items: center;
          }
  
          .input-icon {
              position: absolute;
              left: 14px;
              width: 18px;
              height: 18px;
              color: #94a3b8;
              pointer-events: none;
              transition: color 0.3s;
          }
  
          input {
              width: 100%;
              padding: 12px 12px 12px 42px; /* Space for icon */
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 16px;
              background: rgba(255, 255, 255, 0.6);
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.95rem;
              color: var(--text-main);
              transition: all 0.2s ease;
          }
  
          input:hover { background: rgba(255, 255, 255, 0.8); }
          input:focus {
              background: #fff;
              border-color: var(--accent);
              box-shadow: 0 0 0 3px var(--accent-glow);
          }
          input:focus + .input-icon { color: var(--accent); }
  
          .split-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  
          /* Calculate Button */
          .btn-calc {
              margin-top: 0.5rem;
              padding: 16px;
              /* Ocean Gradient */
              background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
              color: white;
              border: none;
              border-radius: 16px;
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 600;
              font-size: 1rem;
              cursor: pointer;
              box-shadow: 0 8px 20px -6px rgba(14, 165, 233, 0.5);
              transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn-calc:hover {
              transform: translateY(-2px);
              box-shadow: 0 12px 25px -6px rgba(14, 165, 233, 0.6);
          }
          .btn-calc:active { transform: scale(0.98); }
  
          /* --- Content (Results) --- */
          .content {
              padding: 2.5rem;
              display: flex;
              flex-direction: column;
              gap: 2rem;
              overflow-y: auto; /* Allow scroll if height is small */
          }
  
          /* Result Cards */
          .cards-container {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 1.5rem;
          }
  
          .glass-card {
              background: rgba(255, 255, 255, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.8);
              border-radius: 24px;
              padding: 1.5rem;
              display: flex;
              flex-direction: column;
              position: relative;
              transition: transform 0.3s ease;
          }
  
          .glass-card:hover { transform: translateY(-3px); background: rgba(255,255,255,0.8); }
  
          .card-title {
              font-size: 0.75rem;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 4px;
          }
  
          .call-theme { color: var(--call-color); }
          .call-theme.glass-card { background: linear-gradient(145deg, rgba(255,255,255,0.7), var(--call-bg)); }
          
          .put-theme { color: var(--put-color); }
          .put-theme.glass-card { background: linear-gradient(145deg, rgba(255,255,255,0.7), var(--put-bg)); }
  
          .price-val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 2.25rem;
              font-weight: 700;
              letter-spacing: -0.04em;
              line-height: 1.1;
          }
  
          /* Table Styles */
          .greeks-table-container {
              background: rgba(255, 255, 255, 0.5);
              border-radius: 24px;
              overflow: hidden; /* Important for rounded corners */
              border: 1px solid rgba(255,255,255,0.6);
          }
  
          table { width: 100%; border-collapse: collapse; }
  
          th {
              text-align: right;
              font-size: 0.7rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: var(--text-muted);
              padding: 1rem 1.5rem;
              background: rgba(255,255,255,0.4);
              border-bottom: 1px solid rgba(255,255,255,0.5);
          }
          th:first-child { text-align: left; }
  
          td {
              padding: 0.85rem 1.5rem;
              text-align: right;
              font-family: 'JetBrains Mono', monospace;
              font-size: 0.9rem;
              color: var(--text-main);
              border-bottom: 1px solid rgba(255,255,255,0.3);
          }
          tr:last-child td { border-bottom: none; }
          tr:hover td { background: rgba(255,255,255,0.3); }
  
          .metric-name { display: block; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; text-align: left; }
          .metric-desc { display: block; text-align: left; font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
  
          .val-call { color: var(--call-color); }
          .val-put { color: var(--put-color); }
          .val-neutral { color: var(--text-muted); opacity: 0.8; }
  
          /* --- RESPONSIVE DESIGN (CRITICAL) --- */
          
          /* Tablet Breakpoint */
          @media (max-width: 900px) {
              .glass-panel {
                  grid-template-columns: 1fr; /* Stack vertically */
                  width: 92%;
                  margin: 1rem auto;
              }
              .sidebar {
                  border-right: none;
                  border-bottom: 1px solid var(--glass-border);
                  padding: 2rem;
              }
              .content { padding: 2rem; }
          }
  
          /* Mobile Breakpoint */
          @media (max-width: 600px) {
              body {
                  align-items: flex-start; /* Start from top on mobile */
                  background: #f0f9ff; /* Simplified background for performance */
              }
              .glass-panel {
                  width: 100%;
                  margin: 0;
                  border-radius: 0; /* Full width, no corners */
                  border: none;
                  box-shadow: none;
                  min-height: 100dvh;
                  display: flex;
                  flex-direction: column;
              }
              
              .sidebar {
                  padding: 1.5rem;
                  gap: 1rem;
                  background: rgba(255,255,255,0.5);
              }
  
              .content {
                  padding: 1.5rem;
                  gap: 1.5rem;
              }
  
              .cards-container {
                  grid-template-columns: 1fr 1fr; /* Keep side-by-side unless very small */
                  gap: 1rem;
              }
  
              .price-val { font-size: 1.75rem; }
  
              /* Table specific for mobile */
              .greeks-table-container {
                  overflow-x: auto; /* Horizontal scroll if needed */
              }
              td, th { padding: 0.75rem 1rem; }
          }
  
          /* Very Small Screen (iPhone SE, etc) */
          @media (max-width: 380px) {
               .cards-container { grid-template-columns: 1fr; } /* Stack cards */
          }
      </style>
  </head>
  <body>
  
      <div class="glass-panel">
          <div class="sidebar">
              <div class="header-row">
                  <div class="logo">Merton.Calc</div>
                  <div class="lang-pill">
                      <button class="lang-btn active" onclick="setLang('en')" id="btn-en">EN</button>
                      <button class="lang-btn" onclick="setLang('zh')" id="btn-zh">中</button>
                      <button class="lang-btn" onclick="setLang('de')" id="btn-de">DE</button>
                  </div>
              </div>
  
              <form id="calc-form">
                  <div class="input-group">
                      <label data-i18n="spot">Spot Price (S)</label>
                      <div class="input-wrapper">
                          <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <input type="number" id="S" value="100" step="0.01">
                      </div>
                  </div>
  
                  <div class="input-group">
                      <label data-i18n="strike">Strike Price (K)</label>
                      <div class="input-wrapper">
                           <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                          <input type="number" id="K" value="105" step="0.01">
                      </div>
                  </div>
  
                  <div class="input-group">
                      <label data-i18n="time">Days to Expiry</label>
                      <div class="input-wrapper">
                           <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <input type="number" id="T" value="30" step="1">
                      </div>
                  </div>
  
                  <div class="input-group">
                      <label data-i18n="vol">Volatility (%)</label>
                      <div class="input-wrapper">
                           <svg class="input-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                          <input type="number" id="v" value="25" step="0.1">
                      </div>
                  </div>
  
                  <div class="split-row">
                      <div class="input-group">
                          <label data-i18n="rate">Risk-Free (%)</label>
                          <input type="number" id="r" value="3.5" step="0.01">
                      </div>
                      <div class="input-group">
                          <label data-i18n="yield">Div. Yield (%)</label>
                          <input type="number" id="q" value="0" step="0.01">
                      </div>
                  </div>
  
                  <button type="submit" class="btn-calc" data-i18n="btn_calc">Calculate Pricing</button>
              </form>
          </div>
  
          <div class="content">
              <div class="cards-container">
                  <div class="glass-card call-theme">
                      <div class="card-title">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                          <span data-i18n="res_call">Call Option</span>
                      </div>
                      <div class="price-val" id="call-price">--</div>
                  </div>
                  <div class="glass-card put-theme">
                      <div class="card-title">
                          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                          <span data-i18n="res_put">Put Option</span>
                      </div>
                      <div class="price-val" id="put-price">--</div>
                  </div>
              </div>
  
              <div class="greeks-table-container">
                  <table>
                      <thead>
                          <tr>
                              <th data-i18n="header_metric">Metric</th>
                              <th data-i18n="header_call">Call</th>
                              <th data-i18n="header_put">Put</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><span class="metric-name">Delta</span><span class="metric-desc" data-i18n="desc_delta">Price Sensitivity</span></td>
                              <td id="call-delta" class="val-call">--</td>
                              <td id="put-delta" class="val-put">--</td>
                          </tr>
                          <tr>
                              <td><span class="metric-name">Gamma</span><span class="metric-desc" data-i18n="desc_gamma">Convexity</span></td>
                              <td id="gamma" colspan="2" style="text-align: center" class="val-neutral">--</td>
                          </tr>
                          <tr>
                              <td><span class="metric-name">Theta</span><span class="metric-desc" data-i18n="desc_theta">Time Decay (1D)</span></td>
                              <td id="call-theta" class="val-call">--</td>
                              <td id="put-theta" class="val-put">--</td>
                          </tr>
                          <tr>
                              <td><span class="metric-name">Vega</span><span class="metric-desc" data-i18n="desc_vega">Vol Sensitivity</span></td>
                              <td id="vega" colspan="2" style="text-align: center" class="val-neutral">--</td>
                          </tr>
                           <tr>
                              <td><span class="metric-name">Rho</span><span class="metric-desc" data-i18n="desc_rho">Rate Sensitivity</span></td>
                              <td id="call-rho" class="val-call">--</td>
                              <td id="put-rho" class="val-put">--</td>
                          </tr>
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  
      <script>
          // --- I18N Data ---
          const dictionary = {
              en: {
                  spot: "Spot Price (S)",
                  strike: "Strike Price (K)",
                  time: "Days to Expiry",
                  vol: "Volatility (%, σ)",
                  rate: "Risk-Free (%)",
                  yield: "Div. Yield (%)",
                  btn_calc: "Calculate Pricing",
                  res_call: "Call Option",
                  res_put: "Put Option",
                  header_metric: "Metric",
                  header_call: "Call",
                  header_put: "Put",
                  desc_delta: "Price Sensitivity",
                  desc_gamma: "Convexity",
                  desc_theta: "Time Decay (1D)",
                  desc_vega: "Vol Sensitivity",
                  desc_rho: "Rate Sensitivity"
              },
              zh: {
                  spot: "标的现价 (S)",
                  strike: "行权价格 (K)",
                  time: "距到期日 (天)",
                  vol: "波动率 (%, σ)",
                  rate: "无风险利率 (%)",
                  yield: "股息率 (%)",
                  btn_calc: "计算期权价格",
                  res_call: "看涨期权 (Call)",
                  res_put: "看跌期权 (Put)",
                  header_metric: "风险指标",
                  header_call: "看涨",
                  header_put: "看跌",
                  desc_delta: "价格敏感度",
                  desc_gamma: "Delta加速度",
                  desc_theta: "时间损耗 (每日)",
                  desc_vega: "波动率敏感度",
                  desc_rho: "利率敏感度"
              },
              de: {
                  spot: "Aktienkurs (S)",
                  strike: "Basispreis (K)",
                  time: "Restlaufzeit (Tage)",
                  vol: "Volatilität (%, σ)",
                  rate: "Zinssatz (%)",
                  yield: "Dividenden (%)",
                  btn_calc: "Berechnen",
                  res_call: "Call Option",
                  res_put: "Put Option",
                  header_metric: "Kennzahl",
                  header_call: "Call",
                  header_put: "Put",
                  desc_delta: "Preissensitivität",
                  desc_gamma: "Konvexität",
                  desc_theta: "Zeitwertverfall",
                  desc_vega: "Vola-Sensitivität",
                  desc_rho: "Zinssensitivität"
              }
          };
  
          function setLang(lang) {
              // Update buttons
              document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
              document.getElementById('btn-' + lang).classList.add('active');
  
              // Update Text
              const data = dictionary[lang];
              document.querySelectorAll('[data-i18n]').forEach(el => {
                  const key = el.getAttribute('data-i18n');
                  if (data[key]) el.textContent = data[key];
              });
              
              // Re-calc to keep things fresh
              calculate();
          }
  
          // --- Math & Logic (Merton Model) ---
          function n(x) { return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x); }
          function N(x) {
              // --- safety clamp for extreme tails ---
              if (x > 8.0) return 1.0;
              if (x < -8.0) return 0.0;
              
              const b1=0.319381530, b2=-0.356563782, b3=1.781477937, b4=-1.821255978, b5=1.330274429;
              const p=0.2316419, c=0.39894228;
              if (x >= 0.0) {
                  let t = 1.0 / (1.0 + p * x);
                  return (1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
              } else {
                  let t = 1.0 / (1.0 - p * x);
                  return (c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
              }
          }
  
          function calculate() {
              const S = parseFloat(document.getElementById('S').value);
              const K = parseFloat(document.getElementById('K').value);
              const T_days = parseFloat(document.getElementById('T').value);
              const r_percent = parseFloat(document.getElementById('r').value);
              const v_percent = parseFloat(document.getElementById('v').value);
              const q_percent = parseFloat(document.getElementById('q').value || 0);
  
              if (isNaN(S) || isNaN(K) || isNaN(T_days)) return;
  
              const T = T_days / 365.0;
              const r = r_percent / 100.0;
              const v = v_percent / 100.0;
              const q = q_percent / 100.0;
  
              const d1 = (Math.log(S / K) + (r - q + (v * v) / 2) * T) / (v * Math.sqrt(T));
              const d2 = d1 - v * Math.sqrt(T);
              const eqT = Math.exp(-q * T);
              const erT = Math.exp(-r * T);
  
              let call=0, put=0;
              if (T <= 0.001) {
                  call = Math.max(0, S - K);
                  put = Math.max(0, K - S);
              } else {
                  call = S * eqT * N(d1) - K * erT * N(d2);
                  put = K * erT * N(-d2) - S * eqT * N(-d1);
              }
  
              const callDelta = eqT * N(d1);
              const putDelta = eqT * (N(d1) - 1);
              const gamma = (eqT * n(d1)) / (S * v * Math.sqrt(T));
              const vega = (S * eqT * n(d1) * Math.sqrt(T)) * 0.01;
              
              const term1 = -(S * eqT * n(d1) * v) / (2 * Math.sqrt(T));
              const callTheta = (term1 + q * S * eqT * N(d1) - r * K * erT * N(d2)) / 365.0;
              const putTheta = (term1 - q * S * eqT * N(-d1) + r * K * erT * N(-d2)) / 365.0;
              
              const callRho = (K * T * erT * N(d2)) * 0.01;
              const putRho = (-K * T * erT * N(-d2)) * 0.01;
  
              const fmt = (num) => num.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  
              document.getElementById('call-price').innerText = fmt(call);
              document.getElementById('put-price').innerText = fmt(put);
              
              document.getElementById('call-delta').innerText = fmt(callDelta);
              document.getElementById('put-delta').innerText = fmt(putDelta);
              document.getElementById('gamma').innerText = fmt(gamma);
              document.getElementById('vega').innerText = fmt(vega);
              document.getElementById('call-theta').innerText = fmt(callTheta);
              document.getElementById('put-theta').innerText = fmt(putTheta);
              document.getElementById('call-rho').innerText = fmt(callRho);
              document.getElementById('put-rho').innerText = fmt(putRho);
          }
  
          // Init
          document.querySelectorAll('input').forEach(i => i.addEventListener('input', calculate));
          document.getElementById('calc-form').addEventListener('submit', (e) => { e.preventDefault(); calculate(); });
          
          // Auto detect lang or default to EN
          const userLang = navigator.language || navigator.userLanguage;
          if(userLang.includes('zh')) setLang('zh');
          else if(userLang.includes('de')) setLang('de');
          else setLang('en');
          
          calculate();
      </script>
  </body>
  </html>
    `;
}
