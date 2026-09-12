"use strict";var Q=Object.create;var A=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var J=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,V=Object.prototype.hasOwnProperty;var G=(a,t)=>{for(var e in t)A(a,e,{get:t[e],enumerable:!0})},I=(a,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of J(t))!V.call(a,r)&&r!==e&&A(a,r,{get:()=>t[r],enumerable:!(n=H(t,r))||n.enumerable});return a};var v=(a,t,e)=>(e=a!=null?Q(j(a)):{},I(t||!a||!a.__esModule?A(e,"default",{value:a,enumerable:!0}):e,a)),K=a=>I(A({},"__esModule",{value:!0}),a);var ee={};G(ee,{activate:()=>Y,deactivate:()=>Z});module.exports=K(ee);var u=v(require("vscode")),w=v(require("fs")),q=v(require("path")),B=v(require("os"));var h=v(require("vscode")),M=v(require("fs")),C=v(require("path"));var x=v(require("vscode")),D=v(require("http")),E=v(require("https")),N=v(require("os")),L=v(require("path")),$=v(require("fs")),O=v(require("crypto")),y=class a{static instance;constructor(){}static getInstance(){return a.instance||(a.instance=new a),a.instance}getJwtToken(){let t=x.workspace.getConfiguration("9router").get("apiKey");if(t&&t.trim().length>0)return t.trim();let e=L.join(N.homedir(),".9router","jwt-secret");if(!$.existsSync(e))return null;try{let n=$.readFileSync(e,"utf8").trim();if(!n)return null;let r=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url"),i=Buffer.from(JSON.stringify({authenticated:!0,iat:Math.floor(Date.now()/1e3),exp:Math.floor(Date.now()/1e3)+86400*30})).toString("base64url"),s=`${r}.${i}`,c=O.createHmac("sha256",n).update(s).digest("base64url");return`${s}.${c}`}catch(n){return console.warn("[9Router] Error generating JWT token:",n),null}}async fetchChartData(t="today"){let n=x.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken();try{let i=await this.httpRequest(`${n}/api/usage/chart?period=${t}`,r);return i.ok&&Array.isArray(i.data)?i.data:[]}catch{return[]}}async fetchQuotas(){let e=x.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),n=this.getJwtToken();try{let r=`${e}/api/providers`,i=await this.httpRequest(r,n);if(!i.ok||!i.data||!Array.isArray(i.data.connections))return{online:!1,serverUrl:e,connections:[],topologyProviders:[],initialChartData:[]};let s=i.data.connections,c=[],d=new Set,g=[];await Promise.all(s.map(async o=>{let m=[],S={};try{let b=await this.httpRequest(`${e}/api/usage/${o.id}`,n);b.ok&&b.data&&(m=this.parseAndCurateQuotas(o.provider,b.data),S=b.data.quotas||{})}catch{}c.push({id:o.id,name:o.name||o.email||"Default",provider:o.provider||"unknown",email:o.email||(o.name&&o.name.includes("@")?o.name:void 0),priority:o.priority??1,isActive:o.isActive!==!1,status:o.status||(o.isActive?"active":"idle"),quotas:m,rawQuotas:S}),o.isActive!==!1&&!d.has(o.provider)&&(d.add(o.provider),g.push({provider:o.provider,name:this.formatProviderName(o.provider)}))})),[{provider:"opencode",name:"OpenCode Free"},{provider:"mimo",name:"MiMo Code Free"}].forEach(o=>{d.has(o.provider)||(d.add(o.provider),g.push(o))}),c.sort((o,m)=>o.priority-m.priority);let p,f=[];try{let[o,m]=await Promise.all([this.httpRequest(`${e}/api/usage/stats?period=today`,n),this.httpRequest(`${e}/api/usage/chart?period=today`,n)]);o.ok&&o.data&&(p={totalRequests:o.data.totalRequests||0,totalPromptTokens:o.data.totalPromptTokens||0,totalCompletionTokens:o.data.totalCompletionTokens||0,activeRequests:o.data.activeRequests||[],recentRequests:o.data.recentRequests||[],byProvider:o.data.byProvider||{},lastUpdated:new Date().toLocaleTimeString()}),m.ok&&Array.isArray(m.data)&&(f=m.data)}catch{}return{online:!0,serverUrl:e,connections:c,initialUsage:p,topologyProviders:g,initialChartData:f}}catch(r){return console.warn("[9Router] Error fetching quotas from API:",r.message),{online:!1,serverUrl:e,connections:[],topologyProviders:[],initialChartData:[]}}}async toggleConnection(t,e){let r=x.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),i=this.getJwtToken();try{let s=`${r}/api/providers/${t}`;return(await this.httpRequest(s,i,"PATCH",{isActive:e})).ok}catch{return!1}}async testConnection(t){let n=x.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken();try{let i=`${n}/api/providers/${t}/test`,s=await this.httpRequest(i,r,"POST",{});return s.ok&&s.data?{valid:s.data.valid!==!1,error:s.data.error}:{valid:!1,error:s.error||"Test failed"}}catch(i){return{valid:!1,error:i.message}}}listenUsageStream(t){let n=x.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken(),i=!1,s=null;try{let c=new URL(`${n}/api/usage/stream`),d=c.protocol==="https:"?E:D,g={Accept:"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"};r&&(g.Cookie=`auth_token=${r}`),s=d.get(c.toString(),{headers:g,timeout:0},l=>{let p="";l.on("data",f=>{if(i)return;p+=f.toString();let o=p.split(`
`);p=o.pop()||"";for(let m of o){let S=m.trim();if(S.startsWith("data: "))try{let b=JSON.parse(S.slice(6));t({totalRequests:b.totalRequests||0,totalPromptTokens:b.totalPromptTokens||0,totalCompletionTokens:b.totalCompletionTokens||0,activeRequests:b.activeRequests||[],recentRequests:b.recentRequests||[],byProvider:b.byProvider||{},lastUpdated:new Date().toLocaleTimeString()})}catch{}}}),l.on("end",()=>{i||setTimeout(()=>this.listenUsageStream(t),5e3)})}),s.on("error",l=>{i||console.warn("[9Router] SSE stream connection error:",l.message)})}catch(c){console.warn("[9Router] Error starting SSE stream listener:",c.message)}return()=>{i=!0,s&&s.destroy()}}parseAndCurateQuotas(t,e){if(!e||!e.quotas||typeof e.quotas!="object")return[];let n=(t||"").toLowerCase(),r=e.quotas,i=[];if(n==="antigravity"){let s=Object.entries(r),c=new Set(["gemini_weekly","claude_gpt_weekly"]),d=s.filter(([o])=>o.startsWith("gemini-")&&!o.includes("image")),g=s.filter(([o])=>o.startsWith("claude-")),l=s.filter(([o])=>o.includes("image")),p=s.filter(([o])=>c.has(o)),f=s.filter(([o])=>!o.startsWith("gemini-")&&!o.startsWith("claude-")&&!o.includes("image")&&!c.has(o));return d.length>0&&i.push(this.aggregateBucket("gemini_flash_pro","Gemini (Flash / Pro)",d.map(([,o])=>o))),g.length>0&&i.push(this.aggregateBucket("claude_sonnet_opus","Claude (Sonnet / Opus)",g.map(([,o])=>o))),f.forEach(([o,m])=>{i.push(this.formatSingleQuota(o,m))}),l.length>0&&i.push(this.aggregateBucket("gemini_image","Gemini 3.1 Flash Image",l.map(([,o])=>o))),p.forEach(([o,m])=>{i.push(this.formatSingleQuota(o,m))}),i}for(let[s,c]of Object.entries(r))i.push(this.formatSingleQuota(s,c));return i}aggregateBucket(t,e,n){if(!n||n.length===0)return{name:t,displayName:e,used:0,total:1e3,unlimited:!1,remainingPercentage:100};let r=0,i=0,s=100,c;n.forEach(l=>{let p=typeof l.used=="number"?l.used:0,f=typeof l.total=="number"?l.total:typeof l.limit=="number"?l.limit:1e3,o=typeof l.remainingPercentage=="number"?l.remainingPercentage:f>0?(f-p)/f*100:100;r+=p,i+=f,o<s&&(s=o);let m=l.resetAt||l.resetsAt;m&&(!c||new Date(m)<new Date(c))&&(c=m)});let d=Math.round(r/n.length),g=Math.round(i/n.length)||1e3;return{name:t,displayName:e,used:d,total:g,unlimited:!1,remainingPercentage:s,resetAt:c}}formatSingleQuota(t,e){let n=typeof e.used=="number"?e.used:typeof e.count=="number"?e.count:0,r=typeof e.total=="number"?e.total:typeof e.limit=="number"?e.limit:1e3,i=!!e.unlimited||r>=999999,s=typeof e.remainingPercentage=="number"?e.remainingPercentage:r>0?Math.max(0,(r-n)/r*100):100,c=t;return t==="gemini_weekly"?c="Gemini (Weekly)":t==="claude_gpt_weekly"?c="Claude & GPT (Weekly)":t.includes("120b")?c="GPT-OSS 120B":t.includes("flash-image")?c="Gemini 3.1 Flash Image":c=t.replace(/[_-]/g," ").replace(/\b\w/g,d=>d.toUpperCase()),{name:t,displayName:c,used:n,total:r,unlimited:i,remainingPercentage:s,resetAt:e.resetAt||e.resetsAt}}formatProviderName(t){let e=(t||"").toLowerCase();return e==="antigravity"?"Antigravity":e==="claude"?"Claude Code":e==="deepseek"?"DeepSeek":e==="azure"?"Azure OpenAI":e==="kiro"?"Kiro AI":e==="codex"?"Codex":e==="mimo"?"MiMo Code Free":e==="opencode"?"OpenCode Free":t?t.charAt(0).toUpperCase()+t.slice(1):"Provider"}httpRequest(t,e,n="GET",r){return new Promise(i=>{try{let s=new URL(t),c=s.protocol==="https:"?E:D,d={Accept:"application/json","User-Agent":"9Router-VSCode-Monitor"};e&&(d.Cookie=`auth_token=${e}`,d.Authorization=`Bearer ${e}`);let g="";r!==void 0&&(g=JSON.stringify(r),d["Content-Type"]="application/json",d["Content-Length"]=String(Buffer.byteLength(g)));let l=c.request(s.toString(),{method:n,headers:d,timeout:8e3},p=>{let f="";p.on("data",o=>f+=o),p.on("end",()=>{try{let o=f?JSON.parse(f):null;i({ok:(p.statusCode||0)>=200&&(p.statusCode||0)<300,status:p.statusCode||0,data:o})}catch{i({ok:(p.statusCode||0)>=200&&(p.statusCode||0)<300,status:p.statusCode||0,data:f})}})});l.on("error",p=>{i({ok:!1,status:0,error:p.message})}),l.on("timeout",()=>{l.destroy(),i({ok:!1,status:408,error:"Request timed out"})}),g&&l.write(g),l.end()}catch(s){i({ok:!1,status:0,error:s.message})}})}};function F(a,t,e,n="active"){let r=JSON.stringify(a.connections),i=JSON.stringify(t);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quota Tracker</title>
  <link rel="stylesheet" href="${e}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --btn-hover-bg: var(--vscode-toolbar-hoverBackground, var(--vscode-list-hoverBackground));
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --dropdown-bg: var(--vscode-dropdown-background);
      --dropdown-fg: var(--vscode-dropdown-foreground);
      --green: var(--vscode-charts-green, #388a34);
      --orange: var(--vscode-charts-orange, #d18616);
      --red: var(--vscode-charts-red, #f14c4c);
      --blue: #38bdf8;
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
      --font-size: var(--vscode-font-size, 13px);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--font-size);
      line-height: 1.4;
      padding: 4px 0 10px 0;
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Action Buttons */
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 20px;
      height: 20px;
      border-radius: 3px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.08s, color 0.08s;
      font-size: 13px;
    }

    .icon-btn:hover {
      background: var(--btn-hover-bg);
      color: var(--fg);
    }

    /* LEVEL 1: PROVIDER GROUP */
    .provider-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 2px;
    }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px;
      cursor: pointer;
      border-radius: 3px;
      margin: 0 4px;
      font-weight: 600;
      min-height: 22px;
      transition: background 0.08s;
    }

    .provider-header:hover {
      background: var(--hover-bg);
    }

    .provider-left {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .provider-logo-img {
      width: 16px;
      height: 16px;
      object-fit: contain;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .provider-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--fg);
      letter-spacing: 0.2px;
    }

    .provider-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .count-badge {
      font-size: 10px;
      padding: 1px 5px;
      border-radius: 9999px;
      background: rgba(128, 128, 128, 0.15);
      color: var(--text-muted);
      font-weight: normal;
    }

    .accounts-container {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 8px;
    }

    .accounts-container.collapsed {
      display: none;
    }

    .accounts-container::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--border);
    }

    /* LEVEL 2: ACCOUNT ROW */
    .account-item {
      display: flex;
      flex-direction: column;
      margin-top: 1px;
    }

    .account-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px 3px 10px;
      cursor: pointer;
      border-radius: 3px;
      margin: 0 4px;
      min-height: 22px;
      transition: background 0.08s;
    }

    .account-row:hover {
      background: var(--hover-bg);
    }

    .account-left {
      display: flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    .account-name {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--fg);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .account-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      margin-left: 6px;
    }

    .pill-tag {
      font-size: 9.5px;
      font-weight: 500;
      padding: 1px 4px;
      border-radius: 3px;
      background: rgba(128, 128, 128, 0.15);
      color: var(--text-muted);
    }

    .account-actions {
      display: flex;
      align-items: center;
      gap: 2px;
      opacity: 0.85;
    }

    .account-row:hover .account-actions {
      opacity: 1;
    }

    /* Minimalist Toggle Switch */
    .toggle-switch-box {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      padding: 2px;
      margin-left: 2px;
    }

    .toggle-track {
      width: 24px;
      height: 13px;
      border-radius: 7px;
      background-color: rgba(128, 128, 128, 0.35);
      position: relative;
      transition: background-color 0.15s ease;
    }

    .toggle-track.active {
      background-color: var(--green);
    }

    .toggle-thumb {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background-color: #ffffff;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.15s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }

    .toggle-track.active .toggle-thumb {
      transform: translateX(11px);
    }

    /* LEVEL 3: MODEL QUOTA ROWS */
    .models-list {
      display: flex;
      flex-direction: column;
      position: relative;
      padding-left: 12px;
    }

    .models-list::before {
      content: '';
      position: absolute;
      left: 18px;
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: var(--border);
    }

    .models-list.collapsed {
      display: none;
    }

    .model-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2.5px 6px 2.5px 16px;
      margin: 0 4px;
      border-radius: 3px;
      font-size: 11.5px;
      min-height: 20px;
      transition: background 0.08s;
    }

    .model-row:hover {
      background: var(--hover-bg);
    }

    .model-left {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
      padding-right: 8px;
    }

    .status-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      font-size: 13px;
    }
    .status-icon.green { color: var(--green); }
    .status-icon.orange { color: var(--orange); }
    .status-icon.red { color: var(--red); }

    .model-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--fg);
    }

    .model-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
      text-align: right;
    }

    .model-pct {
      font-weight: 600;
      min-width: 28px;
      text-align: right;
    }
    .model-pct.green { color: var(--green); }
    .model-pct.orange { color: var(--orange); }
    .model-pct.red { color: var(--red); }

    .model-ratio {
      color: var(--text-muted);
      font-size: 10.5px;
    }

    .v-divider {
      width: 1px;
      height: 9px;
      background-color: var(--border);
      opacity: 0.9;
      margin: 0 2px;
      flex-shrink: 0;
    }

    .model-time {
      color: var(--blue);
      font-size: 10.5px;
      min-width: 50px;
      text-align: right;
    }

    .empty-msg {
      padding: 10px 14px;
      font-size: 11.5px;
      color: var(--text-muted);
      font-style: italic;
      text-align: center;
    }

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <!-- Pure Tree Root (No Fake Headers) -->
  <div id="tree-root"></div>

  <script>
    const vscode = acquireVsCodeApi();
    const connections = ${r};
    const iconMap = ${i};
    
    let currentFilter = '${n}';
    const groupCollapseMap = {};
    const accountCollapseMap = {};

    connections.forEach(c => {
      if (accountCollapseMap[c.id] === undefined) {
        accountCollapseMap[c.id] = !c.isActive;
      }
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'setFilter') {
        currentFilter = msg.filter || 'active';
        renderGroupedTree();
      }
    });

    function formatProviderName(provider) {
      const p = (provider || '').toLowerCase();
      if (p === 'antigravity') return 'Antigravity';
      if (p === 'claude') return 'Claude Code';
      if (p === 'deepseek') return 'DeepSeek';
      if (p === 'azure') return 'Azure OpenAI';
      if (p === 'kiro') return 'Kiro AI';
      if (p === 'codex') return 'Codex';
      if (p === 'mimo') return 'MiMo Code Free';
      if (p === 'opencode') return 'OpenCode Free';
      return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider';
    }

    function formatCountdown(resetAtStr) {
      if (!resetAtStr) return 'Rolling';
      const resetTime = new Date(resetAtStr).getTime();
      const now = Date.now();
      const diff = resetTime - now;

      if (diff <= 0) return 'in 0m';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return \`in \${days}d \${hours}h\`;
      if (hours > 0) return \`in \${hours}h \${mins}m\`;
      return \`in \${mins}m\`;
    }

    function getProviderIconHtml(provKey) {
      const src = iconMap[provKey] || iconMap[provKey.toLowerCase()];
      if (src) {
        return \`<img class="provider-logo-img" src="\${src}" alt="\${provKey}" />\`;
      }
      return '<i class="codicon codicon-hubot"></i>';
    }

    function getStatusIconHtml(pct) {
      if (pct < 20) {
        return '<i class="codicon codicon-error status-icon red"></i>';
      }
      if (pct < 50) {
        return '<i class="codicon codicon-warning status-icon orange"></i>';
      }
      return '<i class="codicon codicon-pass-filled status-icon green"></i>';
    }

    function renderGroupedTree() {
      const root = document.getElementById('tree-root');
      root.innerHTML = '';

      let filteredConns = connections;
      if (currentFilter === 'active') {
        filteredConns = connections.filter(c => c.isActive);
      } else if (currentFilter === 'idle') {
        filteredConns = connections.filter(c => !c.isActive);
      }

      if (!filteredConns || filteredConns.length === 0) {
        root.innerHTML = '<div class="empty-msg">No accounts found for selected filter (' + currentFilter + ').</div>';
        return;
      }

      const groups = {};
      filteredConns.forEach(c => {
        const provKey = (c.provider || 'other').toLowerCase();
        if (!groups[provKey]) {
          groups[provKey] = [];
        }
        groups[provKey].push(c);
      });

      Object.keys(groups).forEach(provKey => {
        const groupConns = groups[provKey];
        const provName = formatProviderName(provKey);
        const provIconHtml = getProviderIconHtml(provKey);
        const isGroupCollapsed = !!groupCollapseMap[provKey];
        const activeCount = groupConns.filter(c => c.isActive).length;

        const groupEl = document.createElement('div');
        groupEl.className = 'provider-group';

        groupEl.innerHTML = \`
          <!-- LEVEL 1: PROVIDER HEADER -->
          <div class="provider-header" onclick="toggleGroup('\${provKey}')">
            <div class="provider-left">
              <i class="codicon \${isGroupCollapsed ? 'codicon-chevron-right' : 'codicon-chevron-down'}"></i>
              \${provIconHtml}
              <span class="provider-title">\${provName}</span>
            </div>
            <div class="provider-right">
              <span class="count-badge">\${groupConns.length} accounts \${activeCount > 0 ? '\u2022 ' + activeCount + ' active' : ''}</span>
            </div>
          </div>

          <!-- LEVEL 2: ACCOUNTS CONTAINER -->
          <div class="accounts-container \${isGroupCollapsed ? 'collapsed' : ''}" id="group-\${provKey}">
            \${renderAccounts(groupConns)}
          </div>
        \`;

        root.appendChild(groupEl);
      });
    }

    function renderAccounts(conns) {
      let html = '';
      conns.forEach(c => {
        const isAccCollapsed = accountCollapseMap[c.id] !== false;
        const profileName = c.email || c.name || 'Default Account';

        html += \`
          <div class="account-item">
            <!-- LEVEL 2: ACCOUNT ROW -->
            <div class="account-row" onclick="toggleAccount('\${c.id}')">
              <div class="account-left">
                <i class="codicon \${isAccCollapsed ? 'codicon-chevron-right' : 'codicon-chevron-down'}"></i>
                <span class="account-name" title="\${profileName}">\${profileName}</span>
              </div>

              <div class="account-right" onclick="event.stopPropagation()">
                <span class="pill-tag">#\${c.priority}</span>

                <div class="account-actions">
                  <!-- Manual Refresh -->
                  <button class="icon-btn" onclick="refreshSingle('\${c.id}', '\${profileName}')" title="Refresh Quota for \${profileName}">
                    <i class="codicon codicon-refresh"></i>
                  </button>

                  <!-- Test Connection -->
                  <button class="icon-btn" onclick="testConn('\${c.id}', '\${profileName}')" title="Test Connection">
                    <i class="codicon codicon-zap"></i>
                  </button>

                  <!-- Native-style ON/OFF Toggle Switch -->
                  <div class="toggle-switch-box" onclick="toggleActive('\${c.id}', \${!c.isActive})" title="\${c.isActive ? 'Active (Click to Turn OFF)' : 'Idle (Click to Turn ON)'}">
                    <div class="toggle-track \${c.isActive ? 'active' : ''}">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- LEVEL 3: MODEL QUOTA ROWS -->
            <div class="models-list \${isAccCollapsed ? 'collapsed' : ''}" id="models-\${c.id}">
              \${renderModels(c.quotas)}
            </div>
          </div>
        \`;
      });
      return html;
    }

    function renderModels(quotas) {
      if (!quotas || quotas.length === 0) {
        return '<div class="empty-msg">No quotas returned for this account.</div>';
      }

      let html = '';
      quotas.forEach(q => {
        const pct = Math.min(100, Math.max(0, Math.round(q.remainingPercentage)));
        const countdownStr = formatCountdown(q.resetAt);
        const usedStr = q.unlimited ? 'Unlimited' : \`\${q.used}/\${q.total}\`;
        const statusIconHtml = getStatusIconHtml(pct);

        let colorClass = 'green';
        if (pct < 20) colorClass = 'red';
        else if (pct < 50) colorClass = 'orange';

        html += \`
          <div class="model-row">
            <div class="model-left">
              \${statusIconHtml}
              <span class="model-name" title="\${q.displayName}">\${q.displayName}</span>
            </div>
            <div class="model-right">
              <span class="model-pct \${colorClass}">\${pct}%</span>
              <span class="model-ratio">(\${usedStr})</span>
              <span class="v-divider"></span>
              <span class="model-time">\${countdownStr}</span>
            </div>
          </div>
        \`;
      });
      return html;
    }

    function toggleGroup(provKey) {
      groupCollapseMap[provKey] = !groupCollapseMap[provKey];
      renderGroupedTree();
    }

    function toggleAccount(accId) {
      accountCollapseMap[accId] = !accountCollapseMap[accId];
      renderGroupedTree();
    }

    function refreshSingle(id, name) {
      vscode.postMessage({ command: 'refreshSingle', connectionId: id, name });
    }

    function testConn(id, name) {
      vscode.postMessage({ command: 'test', connectionId: id, name });
    }

    function toggleActive(id, nextActive) {
      vscode.postMessage({ command: 'toggleActive', connectionId: id, nextActive });
    }

    renderGroupedTree();
  </script>
</body>
</html>`}var T=class{constructor(t){this._extensionUri=t}static viewType="9router.quotaTrackerView";_view;_currentFilter="active";resolveWebviewView(t,e,n){this._view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},this.refresh(),t.webview.onDidReceiveMessage(async r=>{switch(r.command){case"refresh":await this.refresh(),h.window.showInformationMessage("9Router: Quotas refreshed");break;case"refreshSingle":await this.refresh(),h.window.showInformationMessage(`9Router: Quota refreshed for ${r.name||"account"}`);break;case"test":await h.window.withProgress({location:h.ProgressLocation.Notification,title:`9Router: Testing ${r.name||"connection"}...`},async()=>{let s=await y.getInstance().testConnection(r.connectionId);s.valid?h.window.showInformationMessage(`9Router: ${r.name||"Account"} is VALID and active!`):h.window.showErrorMessage(`9Router: Test failed: ${s.error||"Connection invalid"}`),await this.refresh()});break;case"toggleActive":await y.getInstance().toggleConnection(r.connectionId,r.nextActive)?(h.window.showInformationMessage(`9Router: Account status set to ${r.nextActive?"Active":"Idle"}`),await this.refresh()):h.window.showErrorMessage("9Router: Failed to update status");break;case"openSettings":h.commands.executeCommand("9router.configureSettings");break;case"openWeb":h.commands.executeCommand("9router.openWebDashboard");break}})}setFilter(t){this._currentFilter=t,this._view&&this._view.webview.postMessage({type:"setFilter",filter:t})}async refresh(){if(this._view){let t=await y.getInstance().fetchQuotas(),e=this.getProviderIconMap(this._view.webview),n=this._view.webview.asWebviewUri(h.Uri.joinPath(this._extensionUri,"media","codicons","codicon.css")).toString();this._view.webview.html=F(t,e,n,this._currentFilter)}}getProviderIconMap(t){let e={},n=C.join(this._extensionUri.fsPath,"media","providers");if(M.existsSync(n))try{M.readdirSync(n).forEach(i=>{let s=C.basename(i,C.extname(i)).toLowerCase(),c=t.asWebviewUri(h.Uri.joinPath(this._extensionUri,"media","providers",i));e[s]=c.toString()})}catch(r){console.warn("[9Router] Error scanning media/providers:",r)}return e.claude&&!e["claude-code"]&&(e["claude-code"]=e.claude),e.azure&&!e["azure-openai"]&&(e["azure-openai"]=e.azure),e.gemini&&!e["gemini-cli"]&&(e["gemini-cli"]=e.gemini),e["mimo-free"]&&!e.mimo&&(e.mimo=e["mimo-free"]),e}};var P=v(require("vscode")),_=v(require("fs")),R=v(require("path"));function W(a,t,e,n,r,i,s){let c=JSON.stringify(a||{recentRequests:[],activeRequests:[],byProvider:{}}),d=JSON.stringify(t),g=JSON.stringify(i||[]),l=JSON.stringify(s||[]);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Usage</title>
  <link rel="stylesheet" href="${e}">
  <link rel="stylesheet" href="${r}">
  <style>
    :root {
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --tab-active-border: var(--vscode-panelTitle-activeBorder, var(--vscode-charts-orange, #f97316));
      --green: var(--vscode-charts-green, #388a34);
      --orange: var(--vscode-charts-orange, #d18616);
      --blue: #38bdf8;
      --font: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
      --font-size: var(--vscode-font-size, 13px);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--font-size);
      line-height: 1.4;
      padding: 0;
      overflow: hidden;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    /* Sub-Tabs Header */
    .usage-tabs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
      border-bottom: 1px solid var(--border);
      background: transparent;
      flex-shrink: 0;
      height: 26px;
    }

    .tabs-left {
      display: flex;
      gap: 2px;
      height: 100%;
    }

    .usage-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 7px;
      font-family: var(--font);
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.1s ease, border-color 0.1s ease;
      outline: none;
      height: 100%;
    }

    .usage-tab-btn:hover {
      color: var(--fg);
    }

    .usage-tab-btn.active {
      color: var(--fg);
      font-weight: 600;
      border-bottom-color: var(--tab-active-border);
    }

    .live-status {
      font-size: 9.5px;
      color: var(--green);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding-right: 4px;
    }

    .live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 4px var(--green);
    }

    /* Tab Panes */
    .tab-content-area {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    .usage-tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }

    .usage-tab-pane.active {
      display: block;
    }

    /* React Flow & Chart Container */
    #xyflow-root, #chart-root {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .react-flow__attribution {
      display: none !important;
    }

    /* Recent Requests Table */
    .recent-table-wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg);
    }

    .recent-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: var(--vscode-sideBarSectionHeader-background, transparent);
      border-bottom: 1px solid var(--border);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .col-model { flex: 1; min-width: 0; }
    .col-tokens { width: 100px; text-align: right; }
    .col-time { width: 60px; text-align: right; }

    .recent-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .recent-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      border-bottom: 1px solid rgba(128, 128, 128, 0.08);
      font-size: 11px;
      font-variant-numeric: tabular-nums;
      transition: background 0.08s ease;
    }

    .recent-row:hover {
      background: var(--hover-bg);
    }

    .model-cell {
      display: flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      flex: 1;
    }

    .provider-logo-img {
      width: 14px;
      height: 14px;
      object-fit: contain;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .recent-model-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--fg);
      font-size: 11px;
    }

    .tokens-cell {
      width: 100px;
      text-align: right;
      color: var(--text-muted);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .tokens-in { color: var(--fg); font-weight: 500; }
    .tokens-out { color: var(--text-muted); }

    .time-cell {
      width: 60px;
      text-align: right;
      color: var(--blue);
      font-size: 10.5px;
      white-space: nowrap;
    }

    .empty-msg {
      padding: 10px 14px;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
      text-align: center;
    }

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <!-- Sub-Tabs Header -->
  <div class="usage-tabs-header">
    <div class="tabs-left">
      <button type="button" class="usage-tab-btn active" id="tab-btn-graph" onclick="switchUsageTab('graph')">
        <i class="codicon codicon-graph"></i>
        <span>Topology</span>
      </button>
      <button type="button" class="usage-tab-btn" id="tab-btn-chart" onclick="switchUsageTab('chart')">
        <i class="codicon codicon-pulse"></i>
        <span>Activity</span>
      </button>
      <button type="button" class="usage-tab-btn" id="tab-btn-recent" onclick="switchUsageTab('recent')">
        <i class="codicon codicon-history"></i>
        <span>Recent Requests</span>
      </button>
    </div>
    <div class="live-status">
      <span class="live-dot"></span>
      Live
    </div>
  </div>

  <!-- Content Area -->
  <div class="tab-content-area">
    <!-- TAB 1: 1:1 React Flow Topology Canvas -->
    <div class="usage-tab-pane active" id="pane-graph">
      <div id="xyflow-root"></div>
    </div>

    <!-- TAB 2: 1:1 Recharts Usage Area Chart (Activity) -->
    <div class="usage-tab-pane" id="pane-chart">
      <div id="chart-root"></div>
    </div>

    <!-- TAB 3: Recent Requests Table -->
    <div class="usage-tab-pane" id="pane-recent">
      <div class="recent-table-wrap">
        <div class="recent-table-header">
          <span class="col-model">Model</span>
          <span class="col-tokens">In / Out</span>
          <span class="col-time">When</span>
        </div>
        <div class="recent-list" id="recent-requests-list"></div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__ICON_MAP__ = ${d};
    window.__INITIAL_USAGE__ = ${c};
    window.__TOPOLOGY_PROVIDERS__ = ${g};
    window.__INITIAL_CHART_DATA__ = ${l};
  </script>

  <!-- Load 1:1 @xyflow/react & Recharts Bundle -->
  <script src="${n}"></script>

  <script>
    const iconMap = ${d};
    let initialUsage = ${c};
    let currentUsageTab = 'graph';

    function switchUsageTab(tabName) {
      currentUsageTab = tabName;
      document.getElementById('tab-btn-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('tab-btn-chart').classList.toggle('active', tabName === 'chart');
      document.getElementById('tab-btn-recent').classList.toggle('active', tabName === 'recent');

      document.getElementById('pane-graph').classList.toggle('active', tabName === 'graph');
      document.getElementById('pane-chart').classList.toggle('active', tabName === 'chart');
      document.getElementById('pane-recent').classList.toggle('active', tabName === 'recent');

      if (tabName === 'chart') {
        window.dispatchEvent(new Event('resize'));
      }
    }

    function formatRelativeTime(timestamp) {
      if (!timestamp) return '-';
      const time = new Date(timestamp).getTime();
      const diffSec = Math.floor((Date.now() - time) / 1000);
      if (diffSec < 15) return 'Just now';
      if (diffSec < 60) return \`\${diffSec}s ago\`;
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return \`\${mins}m ago\`;
      const hours = Math.floor(mins / 60);
      return \`\${hours}h ago\`;
    }

    function formatTokensNumber(num) {
      if (!num || num === 0) return '0';
      if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'm';
      if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
      return String(num);
    }

    function getProviderIconHtml(provKey) {
      const src = iconMap[provKey] || iconMap[provKey.toLowerCase()];
      if (src) {
        return \`<img class="provider-logo-img" src="\${src}" alt="\${provKey}" />\`;
      }
      return '<i class="codicon codicon-hubot"></i>';
    }

    function renderRecentRequests(requests) {
      const list = document.getElementById('recent-requests-list');
      if (!list) return;

      if (!requests || requests.length === 0) {
        list.innerHTML = '<div class="empty-msg">No recent request logs.</div>';
        return;
      }

      let html = '';
      requests.slice(0, 30).forEach(r => {
        const provKey = (r.provider || 'ai').toLowerCase();
        const logo = getProviderIconHtml(provKey);
        const inTok = formatTokensNumber(r.promptTokens);
        const outTok = formatTokensNumber(r.completionTokens);
        const when = formatRelativeTime(r.timestamp);

        html += \`
          <div class="recent-row">
            <div class="model-cell">
              \${logo}
              <span class="recent-model-name" title="\${r.model}">\${r.model}</span>
            </div>
            <div class="tokens-cell">
              <span class="tokens-in">\${inTok}</span>
              <span style="opacity: 0.5;"> / </span>
              <span class="tokens-out">\${outTok}</span>
            </div>
            <div class="time-cell">\${when}</div>
          </div>
        \`;
      });

      list.innerHTML = html;
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'usageStream' && msg.data) {
        const streamData = msg.data;
        if (streamData.recentRequests && streamData.recentRequests.length > 0) {
          renderRecentRequests(streamData.recentRequests);
        }
      }
    });

    if (initialUsage && initialUsage.recentRequests) {
      renderRecentRequests(initialUsage.recentRequests);
    }

    setInterval(() => {
      if (initialUsage && initialUsage.recentRequests) {
        renderRecentRequests(initialUsage.recentRequests);
      }
    }, 10000);
  </script>
</body>
</html>`}var U=class{constructor(t){this._extensionUri=t}static viewType="9router.usageView";_view;_streamDisposer;resolveWebviewView(t,e,n){this._view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},this.render(),this.startLiveStream(),t.onDidDispose(()=>{this._streamDisposer&&this._streamDisposer()}),t.webview.onDidReceiveMessage(async r=>{switch(r.command){case"fetchChart":let i=await y.getInstance().fetchChartData(r.period||"today");t.webview.postMessage({type:"chartData",data:i});break}})}startLiveStream(){this._streamDisposer&&this._streamDisposer(),this._streamDisposer=y.getInstance().listenUsageStream(t=>{this._view&&this._view.webview.postMessage({type:"usageStream",data:t})})}async render(){if(this._view){let t=await y.getInstance().fetchQuotas(),e=t.initialUsage||{totalRequests:0,totalPromptTokens:0,totalCompletionTokens:0,recentRequests:[],activeRequests:[],byProvider:{}},n=this.getProviderIconMap(this._view.webview),r=this._view.webview.asWebviewUri(P.Uri.joinPath(this._extensionUri,"media","codicons","codicon.css")).toString(),i=this._view.webview.asWebviewUri(P.Uri.joinPath(this._extensionUri,"media","topologyFlow.js")).toString(),s=this._view.webview.asWebviewUri(P.Uri.joinPath(this._extensionUri,"media","topologyFlow.css")).toString();this._view.webview.html=W(e,n,r,i,s,t.topologyProviders||[],t.initialChartData||[])}}getProviderIconMap(t){let e={},n=R.join(this._extensionUri.fsPath,"media","providers");if(_.existsSync(n))try{_.readdirSync(n).forEach(i=>{let s=R.basename(i,R.extname(i)).toLowerCase(),c=t.asWebviewUri(P.Uri.joinPath(this._extensionUri,"media","providers",i));e[s]=c.toString()})}catch(r){console.warn("[9Router] Error scanning media/providers:",r)}return e.claude&&!e["claude-code"]&&(e["claude-code"]=e.claude),e.azure&&!e["azure-openai"]&&(e["azure-openai"]=e.azure),e.gemini&&!e["gemini-cli"]&&(e["gemini-cli"]=e.gemini),e["mimo-free"]&&!e.mimo&&(e.mimo=e["mimo-free"]),e}};var k;function Y(a){console.log("[9Router Monitor] Extension activated");let t=new T(a.extensionUri);a.subscriptions.push(u.window.registerWebviewViewProvider(T.viewType,t));let e=new U(a.extensionUri);a.subscriptions.push(u.window.registerWebviewViewProvider(U.viewType,e)),a.subscriptions.push(u.commands.registerCommand("9router.filterActive",()=>{t.setFilter("active")}),u.commands.registerCommand("9router.filterAll",()=>{t.setFilter("all")}),u.commands.registerCommand("9router.filterIdle",()=>{t.setFilter("idle")})),a.subscriptions.push(u.commands.registerCommand("9router.refreshStats",async()=>{await t.refresh(),await e.render(),u.window.showInformationMessage("9Router: Quotas refreshed")})),a.subscriptions.push(u.commands.registerCommand("9router.configureSettings",()=>{u.commands.executeCommand("workbench.action.openSettings","9router")})),a.subscriptions.push(u.commands.registerCommand("9router.openWebDashboard",async()=>{let r=u.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128");u.env.openExternal(u.Uri.parse(r))})),X(a),z(a,t,e),a.subscriptions.push(u.workspace.onDidChangeConfiguration(n=>{n.affectsConfiguration("9router")&&z(a,t,e)}))}function X(a){let t=q.join(B.homedir(),".9router"),e=q.join(t,"reload-trigger");try{w.existsSync(t)||w.mkdirSync(t,{recursive:!0}),w.existsSync(e)||w.writeFileSync(e,String(Date.now())),w.watchFile(e,{interval:300},()=>{console.log("[9Router Monitor] Auto-reload triggered"),u.commands.executeCommand("workbench.action.reloadWindow")}),a.subscriptions.push({dispose:()=>{w.unwatchFile(e)}})}catch(n){console.warn("[9Router] Could not setup reload trigger watcher:",n)}}function z(a,t,e){k&&clearInterval(k);let r=u.workspace.getConfiguration("9router").get("refreshInterval",900),i=Math.max(10,r)*1e3;k=setInterval(async()=>{await t.refresh(),await e.render()},i),a.subscriptions.push({dispose:()=>{k&&clearInterval(k)}})}function Z(){k&&clearInterval(k)}0&&(module.exports={activate,deactivate});
