"use strict";var B=Object.create;var I=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var z=Object.getOwnPropertyNames;var D=Object.getPrototypeOf,Q=Object.prototype.hasOwnProperty;var F=(a,o)=>{for(var e in o)I(a,e,{get:o[e],enumerable:!0})},E=(a,o,e,s)=>{if(o&&typeof o=="object"||typeof o=="function")for(let t of z(o))!Q.call(a,t)&&t!==e&&I(a,t,{get:()=>o[t],enumerable:!(s=q(o,t))||s.enumerable});return a};var w=(a,o,e)=>(e=a!=null?B(D(a)):{},E(o||!a||!a.__esModule?I(e,"default",{value:a,enumerable:!0}):e,a)),H=a=>E(I({},"__esModule",{value:!0}),a);var V={};F(V,{activate:()=>K,deactivate:()=>W});module.exports=H(V);var p=w(require("vscode"));var P=w(require("vscode")),M=w(require("http")),R=w(require("https")),N=w(require("os")),T=w(require("path")),$=w(require("fs")),U=w(require("crypto")),b=class a{static instance;static getInstance(){return a.instance||(a.instance=new a),a.instance}getJwtToken(){try{let o=T.join(N.homedir(),".9router","jwt-secret");if(!$.existsSync(o))return null;let e=$.readFileSync(o,"utf8").trim(),s=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url"),t=Buffer.from(JSON.stringify({authenticated:!0,iat:Math.floor(Date.now()/1e3),exp:Math.floor(Date.now()/1e3)+86400})).toString("base64url"),i=U.createHmac("sha256",e).update(`${s}.${t}`).digest("base64url");return`${s}.${t}.${i}`}catch{return null}}async fetchQuotas(){let e=P.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),s=this.getJwtToken();try{let t=await this.httpGet(`${e}/api/providers`,s);if(!t||!t.connections)throw new Error("Failed to fetch providers");let i=t.connections,r=[];return await Promise.all(i.map(async n=>{let l=[],u=n.provider,f=n.isActive?"online":"idle",m="";try{let g=await this.httpGet(`${e}/api/usage/${n.id}`,s);g&&(g.plan&&(u=g.plan),l=this.parseAndCurateQuotas(n.provider,g))}catch(g){m=g.message||"Failed to fetch usage"}r.push({id:n.id,provider:n.provider,name:n.name||n.email||n.provider,email:n.email||(n.name?.includes("@")?n.name:void 0),priority:n.priority||1,isActive:!!n.isActive,status:n.isActive?"active":"idle",plan:u,quotas:l,lastRefresh:new Date().toLocaleTimeString(),error:m||void 0})})),r.sort((n,l)=>n.isActive&&!l.isActive?-1:!n.isActive&&l.isActive?1:n.priority-l.priority),{online:!0,serverUrl:e,lastUpdated:new Date().toLocaleTimeString(),connections:r}}catch(t){return console.warn("[9Router] Error fetching quotas from API:",t),{online:!1,serverUrl:e,lastUpdated:new Date().toLocaleTimeString(),connections:[]}}}parseAndCurateQuotas(o,e){if(!e||!e.quotas||typeof e.quotas!="object")return[];let s=(o||"").toLowerCase(),t=e.quotas,i=[];if(s==="antigravity"){let r=Object.entries(t),n=new Set(["gemini_weekly","claude_gpt_weekly"]),l=r.filter(([c])=>c.startsWith("gemini-")&&!c.includes("image")),u=r.filter(([c])=>c.startsWith("claude-")),f=r.filter(([c])=>c.includes("image")),m=r.filter(([c])=>n.has(c)),g=r.filter(([c])=>!c.startsWith("gemini-")&&!c.startsWith("claude-")&&!c.includes("image")&&!n.has(c));if(l.length>0){let c=l.reduce((d,k)=>(k[1].remainingPercentage??100)<(d[1].remainingPercentage??100)?k:d)[1];i.push({id:"gemini",displayName:"Gemini (Flash / Pro)",used:c.used||0,total:c.total||1e3,resetAt:c.resetAt||null,remainingPercentage:c.remainingPercentage??100-(c.used||0)/(c.total||1e3)*100})}if(u.length>0){let c=u.reduce((d,k)=>(k[1].remainingPercentage??100)<(d[1].remainingPercentage??100)?k:d)[1];i.push({id:"claude",displayName:"Claude (Sonnet / Opus)",used:c.used||0,total:c.total||1e3,resetAt:c.resetAt||null,remainingPercentage:c.remainingPercentage??100-(c.used||0)/(c.total||1e3)*100})}return g.forEach(([c,d])=>{i.push({id:c,displayName:d.displayName||c,used:d.used||0,total:d.total||1e3,resetAt:d.resetAt||null,remainingPercentage:d.remainingPercentage??100-(d.used||0)/(d.total||1e3)*100})}),f.forEach(([c,d])=>{i.push({id:c,displayName:d.displayName||c,used:d.used||0,total:d.total||1e3,resetAt:d.resetAt||null,remainingPercentage:d.remainingPercentage??100-(d.used||0)/(d.total||1e3)*100})}),m.forEach(([c,d])=>{i.push({id:c,displayName:d.displayName||c,used:d.used||0,total:d.total||1e3,resetAt:d.resetAt||null,remainingPercentage:d.remainingPercentage??100-(d.used||0)/(d.total||1e3)*100})}),i}if(s==="claude"){let r={"session (5h)":0,"weekly (7d)":1,"weekly fable (7d)":2,"weekly opus (7d)":3,"weekly sonnet (7d)":4};for(let[n,l]of Object.entries(t))i.push({id:n,displayName:n,used:l.used||0,total:l.total||100,resetAt:l.resetAt||null,remainingPercentage:l.remainingPercentage??100-(l.used||0)/(l.total||100)*100});return i.sort((n,l)=>(r[n.displayName]??99)-(r[l.displayName]??99)),i}if(Array.isArray(t))return t.map(r=>({id:r.name||r.id||"quota",displayName:r.displayName||r.name||"Quota",used:r.used||0,total:r.total||1e3,resetAt:r.resetAt||null,remainingPercentage:r.remainingPercentage??100-(r.used||0)/(r.total||1e3)*100,unlimited:!!r.unlimited}));for(let[r,n]of Object.entries(t))i.push({id:r,displayName:n.displayName||r,used:n.used??0,total:n.total??1e3,resetAt:n.resetAt||null,remainingPercentage:n.remainingPercentage??100-(n.used||0)/(n.total||1e3)*100,unlimited:!!n.unlimited});return i}async testConnection(o){let s=P.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),t=this.getJwtToken();try{let i=await this.httpPost(`${s}/api/providers/${o}/test`,{},t);return{valid:!!i?.valid,error:i?.error}}catch(i){return{valid:!1,error:i.message}}}async toggleConnection(o,e){let t=P.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),i=this.getJwtToken();try{return!!await this.httpPut(`${t}/api/providers/${o}`,{isActive:e},i)}catch{return!1}}httpGet(o,e){return new Promise((s,t)=>{try{let r=new URL(o).protocol==="https:"?R:M,n={};e&&(n.Cookie=`auth_token=${e}`);let l=r.get(o,{headers:n,timeout:4e3},u=>{let f="";u.on("data",m=>f+=m),u.on("end",()=>{if(u.statusCode&&u.statusCode>=200&&u.statusCode<300)try{s(JSON.parse(f))}catch{s(f)}else t(new Error(`HTTP ${u.statusCode}: ${f}`))})});l.on("error",t),l.on("timeout",()=>{l.destroy(),t(new Error("Request timeout"))})}catch(i){t(i)}})}httpPost(o,e,s){return new Promise((t,i)=>{try{let n=new URL(o).protocol==="https:"?R:M,l=JSON.stringify(e),u={"Content-Type":"application/json","Content-Length":String(Buffer.byteLength(l))};s&&(u.Cookie=`auth_token=${s}`);let f=n.request(o,{method:"POST",headers:u,timeout:6e3},m=>{let g="";m.on("data",c=>g+=c),m.on("end",()=>{try{t(JSON.parse(g))}catch{t(g)}})});f.on("error",i),f.write(l),f.end()}catch(r){i(r)}})}httpPut(o,e,s){return new Promise((t,i)=>{try{let n=new URL(o).protocol==="https:"?R:M,l=JSON.stringify(e),u={"Content-Type":"application/json","Content-Length":String(Buffer.byteLength(l))};s&&(u.Cookie=`auth_token=${s}`);let f=n.request(o,{method:"PUT",headers:u,timeout:6e3},m=>{let g="";m.on("data",c=>g+=c),m.on("end",()=>{try{t(JSON.parse(g))}catch{t(g)}})});f.on("error",i),f.write(l),f.end()}catch(r){i(r)}})}};var v=w(require("vscode")),S=w(require("fs")),y=w(require("path"));function L(a,o,e){let s=JSON.stringify(a.connections),t=JSON.stringify(o);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9Router</title>
  <link rel="stylesheet" href="${e}">
  <style>
    :root {
      /* 100% Dynamic VS Code Theme Tokens */
      --bg: var(--vscode-sideBar-background);
      --fg: var(--vscode-sideBar-foreground);
      --hover-bg: var(--vscode-list-hoverBackground);
      --btn-hover-bg: var(--vscode-toolbar-hoverBackground, var(--vscode-list-hoverBackground));
      --active-bg: var(--vscode-list-activeSelectionBackground);
      --active-fg: var(--vscode-list-activeSelectionForeground);
      --text-muted: var(--vscode-descriptionForeground);
      --border: var(--vscode-tree-indentGuidesStroke, rgba(128, 128, 128, 0.22));
      --sec-header-bg: var(--vscode-sideBarSectionHeader-background, transparent);
      --sec-header-fg: var(--vscode-sideBarSectionHeader-foreground, var(--fg));
      --sec-border: var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.18));
      --dropdown-bg: var(--vscode-dropdown-background);
      --dropdown-fg: var(--vscode-dropdown-foreground);
      --dropdown-border: var(--vscode-dropdown-border, rgba(128, 128, 128, 0.3));
      --menu-bg: var(--vscode-menu-background, var(--vscode-dropdown-background, #252526));
      --menu-border: var(--vscode-menu-border, var(--vscode-dropdown-border, rgba(128, 128, 128, 0.25)));
      --menu-hover: var(--vscode-menu-selectionBackground, var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.08)));
      --focus-border: var(--vscode-focusBorder, #007fd4);
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
      padding: 0;
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Section Container */
    .section-box {
      margin-bottom: 0;
      position: relative;
    }

    /* Native Explorer Section Header */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 3px 6px 3px 8px;
      background: var(--sec-header-bg);
      border-bottom: 1px solid var(--sec-border);
      border-top: 1px solid var(--sec-border);
      cursor: pointer;
      min-height: 24px;
      position: relative;
    }

    .section-box:first-child .section-header {
      border-top: none;
    }

    .section-header:hover {
      background: var(--hover-bg);
    }

    .section-left {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--sec-header-fg);
    }

    .section-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Custom VS Code Native Debug-Style Dropdown Menu */
    .custom-dropdown-wrap {
      position: relative;
      display: inline-block;
    }

    .custom-dropdown-trigger {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--dropdown-bg);
      color: var(--dropdown-fg);
      border: 1px solid var(--dropdown-border);
      border-radius: 3px;
      height: 22px;
      padding: 0 6px;
      font-family: var(--font);
      font-size: 11px;
      cursor: pointer;
      transition: border-color 0.1s ease, background 0.1s ease;
      outline: none;
    }

    .custom-dropdown-trigger:hover {
      background: var(--hover-bg);
      border-color: var(--focus-border);
    }

    .custom-dropdown-trigger:focus-visible {
      border-color: var(--focus-border);
      outline: 1px solid var(--focus-border);
      outline-offset: -1px;
    }

    .filter-trigger-label {
      font-weight: 500;
      white-space: nowrap;
    }

    .filter-trigger-arrow {
      font-size: 11px;
      color: var(--text-muted);
      transition: transform 0.15s ease;
      margin-left: 2px;
    }

    .custom-dropdown-wrap.open .filter-trigger-arrow {
      transform: rotate(180deg);
    }

    /* Floating Popup Menu (Anchored to Right Edge so it NEVER clips) */
    .custom-dropdown-menu {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      left: auto;
      min-width: 155px;
      max-width: 200px;
      background: var(--menu-bg);
      color: var(--dropdown-fg);
      border: 1px solid var(--menu-border);
      border-radius: 5px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      padding: 3px;
      z-index: 99999;
      animation: menuFadeIn 0.1s ease-out;
    }

    .custom-dropdown-wrap.open .custom-dropdown-menu {
      display: flex;
      flex-direction: column;
    }

    @keyframes menuFadeIn {
      from { opacity: 0; transform: translateY(-3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-menu-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 11.5px;
      cursor: pointer;
      color: var(--fg);
      text-align: left;
      transition: background 0.08s ease;
    }

    .dropdown-menu-item:hover {
      background: var(--menu-hover);
      color: #ffffff;
    }

    .item-check {
      width: 14px;
      height: 14px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--fg);
      opacity: 0;
      flex-shrink: 0;
    }

    .dropdown-menu-item.selected .item-check {
      opacity: 1;
    }

    .item-label {
      font-weight: 500;
      flex: 1;
      white-space: nowrap;
      text-align: left;
    }

    /* Native Explorer Action Button */
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      width: 22px;
      height: 22px;
      border-radius: 4px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.08s, color 0.08s;
      font-size: 14px;
    }

    .icon-btn:hover {
      background: var(--btn-hover-bg);
      color: var(--fg);
    }

    .section-body {
      padding: 4px 0 6px 0;
    }

    .section-body.collapsed {
      display: none;
    }

    /* ================= LEVEL 1: PROVIDER GROUP ================= */
    .provider-group {
      display: flex;
      flex-direction: column;
      margin-bottom: 3px;
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

    /* ================= LEVEL 2: ACCOUNT ROW ================= */
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

    /* ================= LEVEL 3: MODEL QUOTA ROWS ================= */
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
      padding: 4px 10px 4px 20px;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Usage Placeholder */
    .usage-placeholder {
      padding: 16px 14px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
    }

    .placeholder-icon {
      font-size: 20px;
      color: var(--text-muted);
      margin-bottom: 2px;
    }

    .placeholder-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--fg);
    }

    .placeholder-sub {
      font-size: 11px;
      max-width: 240px;
      line-height: 1.35;
    }

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <!-- SECTION 1: QUOTA TRACKER -->
  <div class="section-box">
    <div class="section-header" onclick="toggleSection('quota')">
      <div class="section-left">
        <i class="codicon codicon-chevron-down" id="chevron-quota"></i>
        <span class="section-title">Quota Tracker</span>
      </div>
      <div class="section-actions" onclick="event.stopPropagation()">
        <!-- Custom Dropdown Menu (Anchored Right so it stays 100% on-screen) -->
        <div class="custom-dropdown-wrap" id="filter-dropdown-wrap">
          <button type="button" class="custom-dropdown-trigger" id="filter-dropdown-btn" title="Filter Accounts">
            <span class="filter-trigger-label" id="filter-current-label">Active</span>
            <i class="codicon codicon-chevron-down filter-trigger-arrow"></i>
          </button>

          <!-- Floating Popup Menu (Right anchored, Left aligned text) -->
          <div class="custom-dropdown-menu" id="filter-dropdown-menu">
            <div class="dropdown-menu-item selected" data-value="active" onclick="selectFilter('active', 'Active')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">Active</span>
            </div>
            <div class="dropdown-menu-item" data-value="all" onclick="selectFilter('all', 'All')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">All</span>
            </div>
            <div class="dropdown-menu-item" data-value="idle" onclick="selectFilter('idle', 'Inactive / Turn Off')">
              <span class="item-check"><i class="codicon codicon-check"></i></span>
              <span class="item-label">Inactive / Turn Off</span>
            </div>
          </div>
        </div>

        <!-- Official VS Code Refresh Codicon -->
        <button class="icon-btn" id="btn-refresh-quota" title="Refresh Quotas">
          <i class="codicon codicon-refresh"></i>
        </button>
      </div>
    </div>

    <div class="section-body" id="body-quota">
      <div id="tree-root"></div>
    </div>
  </div>

  <!-- SECTION 2: USAGE (Placeholder) -->
  <div class="section-box">
    <div class="section-header" onclick="toggleSection('usage')">
      <div class="section-left">
        <i class="codicon codicon-chevron-right" id="chevron-usage"></i>
        <span class="section-title">Usage</span>
      </div>
      <div class="section-actions" onclick="event.stopPropagation()">
        <span style="font-size: 9.5px; color: var(--text-muted); opacity: 0.8;">Phase 2</span>
      </div>
    </div>

    <div class="section-body collapsed" id="body-usage">
      <div class="usage-placeholder">
        <i class="codicon codicon-graph placeholder-icon"></i>
        <div class="placeholder-title">Usage Analytics & Metrics</div>
        <div class="placeholder-sub">Request logs, token breakdown by model/account, and live throughput will appear here.</div>
      </div>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const connections = ${s};
    const iconMap = ${t};
    
    let currentFilter = 'active'; // Default active
    const groupCollapseMap = {};
    const accountCollapseMap = {};
    const sectionCollapseMap = { quota: false, usage: true };

    // Dropdown toggle & close-outside handler
    const dropdownWrap = document.getElementById('filter-dropdown-wrap');
    const triggerBtn = document.getElementById('filter-dropdown-btn');
    const currentLabelEl = document.getElementById('filter-current-label');

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownWrap.classList.toggle('open');
    });

    window.addEventListener('click', () => {
      dropdownWrap.classList.remove('open');
    });

    function selectFilter(val, label) {
      currentFilter = val;
      currentLabelEl.textContent = label;
      document.querySelectorAll('.dropdown-menu-item').forEach(item => {
        item.classList.toggle('selected', item.getAttribute('data-value') === val);
      });
      dropdownWrap.classList.remove('open');
      renderGroupedTree();
    }

    connections.forEach(c => {
      if (accountCollapseMap[c.id] === undefined) {
        accountCollapseMap[c.id] = !c.isActive;
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
      if (p === 'mimo') return 'MiMo';
      if (p === 'opencode') return 'OpenCode';
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

      // Filter connections based on dropdown
      let filteredConns = connections;
      if (currentFilter === 'active') {
        filteredConns = connections.filter(c => c.isActive);
      } else if (currentFilter === 'idle') {
        filteredConns = connections.filter(c => !c.isActive);
      }

      if (!filteredConns || filteredConns.length === 0) {
        root.innerHTML = '<div class="empty-msg">No accounts found for selected filter.</div>';
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
                  <!-- Manual Refresh (Official Codicon) -->
                  <button class="icon-btn" onclick="refreshSingle('\${c.id}', '\${profileName}')" title="Refresh Quota for \${profileName}">
                    <i class="codicon codicon-refresh"></i>
                  </button>

                  <!-- Test Connection (Official Zap Codicon) -->
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

    function toggleSection(secId) {
      sectionCollapseMap[secId] = !sectionCollapseMap[secId];
      const body = document.getElementById('body-' + secId);
      const chevron = document.getElementById('chevron-' + secId);
      if (body) {
        body.classList.toggle('collapsed', sectionCollapseMap[secId]);
      }
      if (chevron) {
        chevron.className = 'codicon ' + (sectionCollapseMap[secId] ? 'codicon-chevron-right' : 'codicon-chevron-down');
      }
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

    document.getElementById('btn-refresh-quota').addEventListener('click', () => {
      vscode.postMessage({ command: 'refresh' });
    });

    // Initial render
    renderGroupedTree();
  </script>
</body>
</html>`}var C=class{constructor(o){this._extensionUri=o}static viewType="9router.quotaTrackerView";_view;resolveWebviewView(o,e,s){this._view=o,o.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},this.refresh(),o.webview.onDidReceiveMessage(async t=>{switch(t.command){case"refresh":await this.refresh(),v.window.showInformationMessage("9Router: Quotas refreshed");break;case"refreshSingle":await this.refresh(),v.window.showInformationMessage(`9Router: Quota refreshed for ${t.name||"account"}`);break;case"test":await v.window.withProgress({location:v.ProgressLocation.Notification,title:`9Router: Testing ${t.name||"connection"}...`},async()=>{let r=await b.getInstance().testConnection(t.connectionId);r.valid?v.window.showInformationMessage(`9Router: ${t.name||"Account"} is VALID and active!`):v.window.showErrorMessage(`9Router: Test failed: ${r.error||"Connection invalid"}`),await this.refresh()});break;case"toggleActive":await b.getInstance().toggleConnection(t.connectionId,t.nextActive)?(v.window.showInformationMessage(`9Router: Account status set to ${t.nextActive?"Active":"Idle"}`),await this.refresh()):v.window.showErrorMessage("9Router: Failed to update status");break;case"openSettings":v.commands.executeCommand("9router.configureSettings");break;case"openWeb":v.commands.executeCommand("9router.openWebDashboard");break}})}async refresh(){if(this._view){let o=await b.getInstance().fetchQuotas(),e=this.getProviderIconMap(this._view.webview),s=this._view.webview.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","codicons","codicon.css")).toString();this._view.webview.html=L(o,e,s)}}getProviderIconMap(o){let e={},s=y.join(this._extensionUri.fsPath,"media","providers");if(S.existsSync(s))try{S.readdirSync(s).forEach(i=>{let r=y.basename(i,y.extname(i)).toLowerCase(),n=o.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","providers",i));e[r]=n.toString()})}catch(t){console.warn("[9Router] Error scanning media/providers:",t)}return e.claude&&!e["claude-code"]&&(e["claude-code"]=e.claude),e.azure&&!e["azure-openai"]&&(e["azure-openai"]=e.azure),e.gemini&&!e["gemini-cli"]&&(e["gemini-cli"]=e.gemini),e["mimo-free"]&&!e.mimo&&(e.mimo=e["mimo-free"]),e}};var h,x;function K(a){console.log("[9Router Monitor] Extension activated");let o=new C(a.extensionUri);a.subscriptions.push(p.window.registerWebviewViewProvider(C.viewType,o)),h=p.window.createStatusBarItem(p.StatusBarAlignment.Right,100),h.command="9router.refreshStats",h.tooltip="Click to refresh 9Router Quotas",a.subscriptions.push(h),h.show(),a.subscriptions.push(p.commands.registerCommand("9router.refreshStats",async()=>{await o.refresh(),await A(),p.window.showInformationMessage("9Router: Quotas refreshed")})),a.subscriptions.push(p.commands.registerCommand("9router.configureSettings",async()=>{let e=p.workspace.getConfiguration("9router"),s=e.get("baseUrl","http://localhost:20128"),t=e.get("refreshInterval",900),i=await p.window.showQuickPick([{label:"$(globe) Configure 9Router Base URL / IP",description:s,action:"url"},{label:"$(clock) Change Auto-Sync Interval",description:`${Math.round(t/60)} minutes`,action:"interval"},{label:"$(key) Set API Key (Remote access)",description:"Configure Bearer token for remote 9router access",action:"key"},{label:"$(settings-gear) Open in VS Code Settings GUI",description:"View all 9Router extension preferences",action:"gui"}],{placeHolder:"9Router Settings & Server Configuration"});if(i)if(i.action==="url"){let r=await p.window.showInputBox({prompt:"Enter 9Router instance base URL or IP",value:s,placeHolder:"http://localhost:20128 or http://10.1.8.108:20128"});r&&(await e.update("baseUrl",r.trim(),p.ConfigurationTarget.Global),p.window.showInformationMessage(`9Router: Base URL updated to ${r.trim()}`),await o.refresh(),await A())}else if(i.action==="interval"){let r=await p.window.showQuickPick([{label:"5 Minutes",value:300},{label:"15 Minutes (Default)",value:900},{label:"30 Minutes",value:1800},{label:"1 Hour",value:3600}],{placeHolder:"Select auto-refresh sync interval"});r&&(await e.update("refreshInterval",r.value,p.ConfigurationTarget.Global),p.window.showInformationMessage(`9Router: Sync interval updated to ${r.label}`))}else if(i.action==="key"){let r=await p.window.showInputBox({prompt:"Enter 9Router API Key (Optional for local, required for remote)",password:!0,placeHolder:"sk_..."});r!==void 0&&(await e.update("apiKey",r.trim(),p.ConfigurationTarget.Global),p.window.showInformationMessage("9Router: API Key updated"),await o.refresh())}else i.action==="gui"&&p.commands.executeCommand("workbench.action.openSettings","9router")})),A(),O(a,o),a.subscriptions.push(p.workspace.onDidChangeConfiguration(e=>{e.affectsConfiguration("9router")&&(O(a,o),A())}))}function O(a,o){x&&clearInterval(x);let s=p.workspace.getConfiguration("9router").get("refreshInterval",900),t=Math.max(10,s)*1e3;x=setInterval(async()=>{await o.refresh(),await A()},t),a.subscriptions.push({dispose:()=>{x&&clearInterval(x)}})}async function A(){try{let a=await b.getInstance().fetchQuotas();if(!a.online){h.text="$(circle-slash) 9Router: Offline",h.backgroundColor=new p.ThemeColor("statusBarItem.warningBackground"),h.tooltip=`9Router is unreachable at ${a.serverUrl}`;return}let o=a.connections.filter(t=>t.isActive),e=o[0]?o[0].name.split("@")[0]:"Ready";h.text=`$(pulse) 9Router: ${e} (${o.length} active)`,h.backgroundColor=void 0;let s=[`9Router Quota Monitor (${a.serverUrl})`,"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"];a.connections.forEach(t=>{s.push(`\u2022 ${t.name} (#Prio ${t.priority}) - ${t.quotas.length} quotas`)}),s.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"),s.push("Click to refresh quotas"),h.tooltip=s.join(`
`)}catch{h.text="$(alert) 9Router: Error"}}function W(){x&&clearInterval(x)}0&&(module.exports={activate,deactivate});
