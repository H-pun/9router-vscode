"use strict";var O=Object.create;var T=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var Q=Object.getPrototypeOf,W=Object.prototype.hasOwnProperty;var G=(s,t)=>{for(var e in t)T(s,e,{get:t[e],enumerable:!0})},q=(s,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of H(t))!W.call(s,r)&&r!==e&&T(s,r,{get:()=>t[r],enumerable:!(a=F(t,r))||a.enumerable});return s};var h=(s,t,e)=>(e=s!=null?O(Q(s)):{},q(t||!s||!s.__esModule?T(e,"default",{value:s,enumerable:!0}):e,s)),J=s=>q(T({},"__esModule",{value:!0}),s);var Y={};G(Y,{activate:()=>j,deactivate:()=>V});module.exports=J(Y);var l=h(require("vscode")),x=h(require("fs")),U=h(require("path")),z=h(require("os"));var k=h(require("vscode")),E=h(require("http")),M=h(require("https")),D=h(require("os")),B=h(require("path")),$=h(require("fs")),L=h(require("crypto")),y=class s{static instance;constructor(){}static getInstance(){return s.instance||(s.instance=new s),s.instance}getJwtToken(){let t=k.workspace.getConfiguration("9router").get("apiKey");if(t&&t.trim().length>0)return t.trim();let e=B.join(D.homedir(),".9router","jwt-secret");if(!$.existsSync(e))return null;try{let a=$.readFileSync(e,"utf8").trim();if(!a)return null;let r=Buffer.from(JSON.stringify({alg:"HS256",typ:"JWT"})).toString("base64url"),n=Buffer.from(JSON.stringify({authenticated:!0,iat:Math.floor(Date.now()/1e3),exp:Math.floor(Date.now()/1e3)+86400*30})).toString("base64url"),i=`${r}.${n}`,c=L.createHmac("sha256",a).update(i).digest("base64url");return`${i}.${c}`}catch(a){return console.warn("[9Router] Error generating JWT token:",a),null}}async fetchChartData(t="today"){let a=k.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken();try{let n=await this.httpRequest(`${a}/api/usage/chart?period=${t}`,r);return n.ok&&Array.isArray(n.data)?n.data:[]}catch{return[]}}async fetchQuotas(){let e=k.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),a=this.getJwtToken();try{let r=`${e}/api/providers`,n=await this.httpRequest(r,a);if(!n.ok||!n.data||!Array.isArray(n.data.connections))return{online:!1,serverUrl:e,connections:[],topologyProviders:[],initialChartData:[]};let i=n.data.connections,c=[],u=new Set,g=[];await Promise.all(i.map(async o=>{let m=[],S={};try{let b=await this.httpRequest(`${e}/api/usage/${o.id}`,a);b.ok&&b.data&&(m=this.parseAndCurateQuotas(o.provider,b.data),S=b.data.quotas||{})}catch{}c.push({id:o.id,name:o.name||o.email||"Default",provider:o.provider||"unknown",email:o.email||(o.name&&o.name.includes("@")?o.name:void 0),priority:o.priority??1,isActive:o.isActive!==!1,status:o.status||(o.isActive?"active":"idle"),quotas:m,rawQuotas:S}),o.isActive!==!1&&!u.has(o.provider)&&(u.add(o.provider),g.push({provider:o.provider,name:this.formatProviderName(o.provider)}))})),[{provider:"opencode",name:"OpenCode Free"},{provider:"mimo",name:"MiMo Code Free"}].forEach(o=>{u.has(o.provider)||(u.add(o.provider),g.push(o))}),c.sort((o,m)=>o.priority-m.priority);let p,f=[];try{let[o,m]=await Promise.all([this.httpRequest(`${e}/api/usage/stats?period=today`,a),this.httpRequest(`${e}/api/usage/chart?period=today`,a)]);o.ok&&o.data&&(p={totalRequests:o.data.totalRequests||0,totalPromptTokens:o.data.totalPromptTokens||0,totalCompletionTokens:o.data.totalCompletionTokens||0,activeRequests:o.data.activeRequests||[],recentRequests:o.data.recentRequests||[],byProvider:o.data.byProvider||{},lastUpdated:new Date().toLocaleTimeString()}),m.ok&&Array.isArray(m.data)&&(f=m.data)}catch{}return{online:!0,serverUrl:e,connections:c,initialUsage:p,topologyProviders:g,initialChartData:f}}catch(r){return console.warn("[9Router] Error fetching quotas from API:",r.message),{online:!1,serverUrl:e,connections:[],topologyProviders:[],initialChartData:[]}}}async toggleConnection(t,e){let r=k.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),n=this.getJwtToken();try{let i=`${r}/api/providers/${t}`;return(await this.httpRequest(i,n,"PATCH",{isActive:e})).ok}catch{return!1}}async testConnection(t){let a=k.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken();try{let n=`${a}/api/providers/${t}/test`,i=await this.httpRequest(n,r,"POST",{});return i.ok&&i.data?{valid:i.data.valid!==!1,error:i.data.error}:{valid:!1,error:i.error||"Test failed"}}catch(n){return{valid:!1,error:n.message}}}listenUsageStream(t){let a=k.workspace.getConfiguration("9router").get("baseUrl","http://localhost:20128").replace(/\/+$/,""),r=this.getJwtToken(),n=!1,i=null;try{let c=new URL(`${a}/api/usage/stream`),u=c.protocol==="https:"?M:E,g={Accept:"text/event-stream","Cache-Control":"no-cache",Connection:"keep-alive"};r&&(g.Cookie=`auth_token=${r}`),i=u.get(c.toString(),{headers:g,timeout:0},d=>{let p="";d.on("data",f=>{if(n)return;p+=f.toString();let o=p.split(`
`);p=o.pop()||"";for(let m of o){let S=m.trim();if(S.startsWith("data: "))try{let b=JSON.parse(S.slice(6));t({totalRequests:b.totalRequests||0,totalPromptTokens:b.totalPromptTokens||0,totalCompletionTokens:b.totalCompletionTokens||0,activeRequests:b.activeRequests||[],recentRequests:b.recentRequests||[],byProvider:b.byProvider||{},lastUpdated:new Date().toLocaleTimeString()})}catch{}}}),d.on("end",()=>{n||setTimeout(()=>this.listenUsageStream(t),5e3)})}),i.on("error",d=>{n||console.warn("[9Router] SSE stream connection error:",d.message)})}catch(c){console.warn("[9Router] Error starting SSE stream listener:",c.message)}return()=>{n=!0,i&&i.destroy()}}parseAndCurateQuotas(t,e){if(!e||!e.quotas||typeof e.quotas!="object")return[];let a=(t||"").toLowerCase(),r=e.quotas,n=[];if(a==="antigravity"){let i=Object.entries(r),c=new Set(["gemini_weekly","claude_gpt_weekly"]),u=i.filter(([o])=>o.startsWith("gemini-")&&!o.includes("image")),g=i.filter(([o])=>o.startsWith("claude-")),d=i.filter(([o])=>o.includes("image")),p=i.filter(([o])=>c.has(o)),f=i.filter(([o])=>!o.startsWith("gemini-")&&!o.startsWith("claude-")&&!o.includes("image")&&!c.has(o));return u.length>0&&n.push(this.aggregateBucket("gemini_flash_pro","Gemini (Flash / Pro)",u.map(([,o])=>o))),g.length>0&&n.push(this.aggregateBucket("claude_sonnet_opus","Claude (Sonnet / Opus)",g.map(([,o])=>o))),f.forEach(([o,m])=>{n.push(this.formatSingleQuota(o,m))}),d.length>0&&n.push(this.aggregateBucket("gemini_image","Gemini 3.1 Flash Image",d.map(([,o])=>o))),p.forEach(([o,m])=>{n.push(this.formatSingleQuota(o,m))}),n}for(let[i,c]of Object.entries(r))n.push(this.formatSingleQuota(i,c));return n}aggregateBucket(t,e,a){if(!a||a.length===0)return{name:t,displayName:e,used:0,total:1e3,unlimited:!1,remainingPercentage:100};let r=0,n=0,i=100,c;a.forEach(d=>{let p=typeof d.used=="number"?d.used:0,f=typeof d.total=="number"?d.total:typeof d.limit=="number"?d.limit:1e3,o=typeof d.remainingPercentage=="number"?d.remainingPercentage:f>0?(f-p)/f*100:100;r+=p,n+=f,o<i&&(i=o);let m=d.resetAt||d.resetsAt;m&&(!c||new Date(m)<new Date(c))&&(c=m)});let u=Math.round(r/a.length),g=Math.round(n/a.length)||1e3;return{name:t,displayName:e,used:u,total:g,unlimited:!1,remainingPercentage:i,resetAt:c}}formatSingleQuota(t,e){let a=typeof e.used=="number"?e.used:typeof e.count=="number"?e.count:0,r=typeof e.total=="number"?e.total:typeof e.limit=="number"?e.limit:1e3,n=!!e.unlimited||r>=999999,i=typeof e.remainingPercentage=="number"?e.remainingPercentage:r>0?Math.max(0,(r-a)/r*100):100,c=t;return t==="gemini_weekly"?c="Gemini (Weekly)":t==="claude_gpt_weekly"?c="Claude & GPT (Weekly)":t.includes("120b")?c="GPT-OSS 120B":t.includes("flash-image")?c="Gemini 3.1 Flash Image":c=t.replace(/[_-]/g," ").replace(/\b\w/g,u=>u.toUpperCase()),{name:t,displayName:c,used:a,total:r,unlimited:n,remainingPercentage:i,resetAt:e.resetAt||e.resetsAt}}formatProviderName(t){let e=(t||"").toLowerCase();return e==="antigravity"?"Antigravity":e==="claude"?"Claude Code":e==="deepseek"?"DeepSeek":e==="azure"?"Azure OpenAI":e==="kiro"?"Kiro AI":e==="codex"?"Codex":e==="mimo"?"MiMo Code Free":e==="opencode"?"OpenCode Free":t?t.charAt(0).toUpperCase()+t.slice(1):"Provider"}httpRequest(t,e,a="GET",r){return new Promise(n=>{try{let i=new URL(t),c=i.protocol==="https:"?M:E,u={Accept:"application/json","User-Agent":"9Router-VSCode-Monitor"};e&&(u.Cookie=`auth_token=${e}`,u.Authorization=`Bearer ${e}`);let g="";r!==void 0&&(g=JSON.stringify(r),u["Content-Type"]="application/json",u["Content-Length"]=String(Buffer.byteLength(g)));let d=c.request(i.toString(),{method:a,headers:u,timeout:8e3},p=>{let f="";p.on("data",o=>f+=o),p.on("end",()=>{try{let o=f?JSON.parse(f):null;n({ok:(p.statusCode||0)>=200&&(p.statusCode||0)<300,status:p.statusCode||0,data:o})}catch{n({ok:(p.statusCode||0)>=200&&(p.statusCode||0)<300,status:p.statusCode||0,data:f})}})});d.on("error",p=>{n({ok:!1,status:0,error:p.message})}),d.on("timeout",()=>{d.destroy(),n({ok:!1,status:408,error:"Request timed out"})}),g&&d.write(g),d.end()}catch(i){n({ok:!1,status:0,error:i.message})}})}};var v=h(require("vscode")),P=h(require("fs")),R=h(require("path"));function _(s,t,e,a,r){let n=JSON.stringify(s.connections),i=JSON.stringify(t),c=JSON.stringify(s.initialUsage||{recentRequests:[],activeRequests:[],byProvider:{}}),u=JSON.stringify(s.topologyProviders||[]),g=JSON.stringify(s.initialChartData||[]);return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>9Router</title>
  <link rel="stylesheet" href="${e}">
  <link rel="stylesheet" href="${r}">
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
      --tab-active-border: var(--vscode-panelTitle-activeBorder, var(--vscode-charts-orange, #f97316));
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

    html, body {
      height: 100%;
      overflow: hidden;
    }

    body {
      background-color: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--font-size);
      line-height: 1.4;
      display: flex;
      flex-direction: column;
    }

    /* Resizable Container Splitter Layout */
    .split-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
      position: relative;
    }

    /* Section Panels */
    .section-panel {
      display: flex;
      flex-direction: column;
      min-height: 28px;
      overflow: hidden;
      position: relative;
    }

    .section-panel.panel-quota {
      flex: 1 1 50%;
      min-height: 60px;
    }

    .section-panel.panel-usage {
      flex: 1 1 50%;
      min-height: 60px;
    }

    .section-panel.collapsed {
      flex: 0 0 26px !important;
      min-height: 26px !important;
      max-height: 26px !important;
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
      flex-shrink: 0;
    }

    .panel-quota .section-header {
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
      gap: 3px;
    }

    /* Section Content (Independent Scrollable Container) */
    .section-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
    }

    .section-panel.collapsed .section-content {
      display: none;
    }

    /* Native Splitter Resizer Bar */
    .splitter-bar {
      height: 4px;
      margin: -2px 0;
      cursor: row-resize;
      background: transparent;
      z-index: 50;
      position: relative;
      transition: background 0.15s ease;
    }

    .splitter-bar:hover, .splitter-bar.dragging {
      background: var(--focus-border);
      height: 4px;
    }

    /* Custom VS Code Native Dropdown Menu */
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

    /* Floating Popup Menu */
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

    /* Native Action Button */
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
      padding: 6px 10px 6px 16px;
      font-size: 11px;
      color: var(--text-muted);
      font-style: italic;
    }

    /* ================= USAGE SECTION (NATIVE 3 SUB-TABS) ================= */
    .usage-tabs-header {
      display: flex;
      gap: 2px;
      padding: 2px 4px 0 4px;
      border-bottom: 1px solid var(--sec-border);
      background: transparent;
      flex-shrink: 0;
    }

    .usage-tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 7px 5px 7px;
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
    }

    .usage-tab-btn:hover {
      color: var(--fg);
    }

    .usage-tab-btn.active {
      color: var(--fg);
      font-weight: 600;
      border-bottom-color: var(--tab-active-border);
    }

    .usage-tab-pane {
      display: none;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .usage-tab-pane.active {
      display: block;
    }

    /* React Flow Container */
    #xyflow-root, #chart-root {
      width: 100%;
      height: 100%;
      min-height: 220px;
      position: relative;
    }

    .react-flow__attribution {
      display: none !important;
    }

    /* Recent Requests Table */
    .recent-table-card {
      background: var(--bg);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .recent-table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: var(--sec-header-bg);
      border-bottom: 1px solid var(--sec-border);
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

    .codicon {
      font-size: 14px;
      line-height: 1;
    }
  </style>
</head>
<body>

  <div class="split-container" id="split-container">
    
    <!-- PANEL 1: QUOTA TRACKER -->
    <div class="section-panel panel-quota" id="panel-quota">
      <div class="section-header" onclick="toggleSection('quota')">
        <div class="section-left">
          <i class="codicon codicon-chevron-down" id="chevron-quota"></i>
          <span class="section-title">Quota Tracker</span>
        </div>
        <div class="section-actions" onclick="event.stopPropagation()">
          <!-- Filter Dropdown -->
          <div class="custom-dropdown-wrap" id="filter-dropdown-wrap">
            <button type="button" class="custom-dropdown-trigger" id="filter-dropdown-btn" title="Filter Accounts">
              <span class="filter-trigger-label" id="filter-current-label">Active</span>
              <i class="codicon codicon-chevron-down filter-trigger-arrow"></i>
            </button>

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

          <!-- Section Quota Refresh Button -->
          <button class="icon-btn" id="btn-refresh-quota" title="Refresh Quotas">
            <i class="codicon codicon-refresh"></i>
          </button>
        </div>
      </div>

      <div class="section-content" id="content-quota">
        <div id="tree-root"></div>
      </div>
    </div>

    <!-- NATIVE SPLITTER BAR (DRAGGABLE RESIZER) -->
    <div class="splitter-bar" id="splitter-bar" title="Drag to resize panels"></div>

    <!-- PANEL 2: USAGE (3 SUB-TABS: Topology | Activity | Recent Requests) -->
    <div class="section-panel panel-usage" id="panel-usage">
      <div class="section-header" onclick="toggleSection('usage')">
        <div class="section-left">
          <i class="codicon codicon-chevron-down" id="chevron-usage"></i>
          <span class="section-title">Usage</span>
        </div>
        <div class="section-actions" onclick="event.stopPropagation()">
          <span style="font-size: 9.5px; color: var(--green); display: inline-flex; align-items: center; gap: 3px;">
            <span style="width: 5px; height: 5px; border-radius: 50%; background: var(--green); box-shadow: 0 0 4px var(--green);"></span>
            Live
          </span>
        </div>
      </div>

      <!-- Sub-Tabs Header (3 Sub-Tabs) -->
      <div class="usage-tabs-header">
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

      <div class="section-content" id="content-usage">
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
          <div class="recent-table-card">
            <div class="recent-table-header">
              <span class="col-model">Model</span>
              <span class="col-tokens">In / Out</span>
              <span class="col-time">When</span>
            </div>
            <div class="recent-list" id="recent-requests-list"></div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    const vscode = acquireVsCodeApi();
    window.__VSCODE__ = vscode;
    window.__ICON_MAP__ = ${i};
    window.__INITIAL_USAGE__ = ${c};
    window.__TOPOLOGY_PROVIDERS__ = ${u};
    window.__INITIAL_CHART_DATA__ = ${g};
  </script>

  <!-- Load 1:1 @xyflow/react & Recharts Bundle -->
  <script src="${a}"></script>

  <script>
    const connections = ${n};
    const iconMap = ${i};
    let initialUsage = ${c};
    
    let currentFilter = 'active';
    let currentUsageTab = 'graph';
    const groupCollapseMap = {};
    const accountCollapseMap = {};
    const sectionCollapseMap = { quota: false, usage: false };

    // ================= SPLITTER RESIZER LOGIC =================
    const splitter = document.getElementById('splitter-bar');
    const panelQuota = document.getElementById('panel-quota');
    const panelUsage = document.getElementById('panel-usage');
    const splitContainer = document.getElementById('split-container');
    let isDragging = false;

    splitter.addEventListener('mousedown', (e) => {
      isDragging = true;
      splitter.classList.add('dragging');
      document.body.style.cursor = 'row-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const containerRect = splitContainer.getBoundingClientRect();
      const relativeY = e.clientY - containerRect.top;
      const totalH = containerRect.height;
      
      const quotaH = Math.max(60, Math.min(relativeY, totalH - 60));
      const usageH = totalH - quotaH - 4;

      panelQuota.style.flex = \`0 0 \${quotaH}px\`;
      panelUsage.style.flex = \`0 0 \${usageH}px\`;
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        splitter.classList.remove('dragging');
        document.body.style.cursor = '';
      }
    });

    // Dropdown toggle
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
            <div class="account-row" onclick="toggleAccount('\${c.id}')">
              <div class="account-left">
                <i class="codicon \${isAccCollapsed ? 'codicon-chevron-right' : 'codicon-chevron-down'}"></i>
                <span class="account-name" title="\${profileName}">\${profileName}</span>
              </div>

              <div class="account-right" onclick="event.stopPropagation()">
                <span class="pill-tag">#\${c.priority}</span>

                <div class="account-actions">
                  <button class="icon-btn" onclick="refreshSingle('\${c.id}', '\${profileName}')" title="Refresh Quota for \${profileName}">
                    <i class="codicon codicon-refresh"></i>
                  </button>

                  <button class="icon-btn" onclick="testConn('\${c.id}', '\${profileName}')" title="Test Connection">
                    <i class="codicon codicon-zap"></i>
                  </button>

                  <div class="toggle-switch-box" onclick="toggleActive('\${c.id}', \${!c.isActive})" title="\${c.isActive ? 'Active (Click to Turn OFF)' : 'Idle (Click to Turn ON)'}">
                    <div class="toggle-track \${c.isActive ? 'active' : ''}">
                      <div class="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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

    /* ================= RECENT REQUESTS TABLE ================= */
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

    // Forward SSE stream events to the React Flow window
    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg && msg.type === 'usageStream' && msg.data) {
        const streamData = msg.data;
        if (streamData.recentRequests && streamData.recentRequests.length > 0) {
          renderRecentRequests(streamData.recentRequests);
        }
      }
    });

    function toggleSection(secId) {
      sectionCollapseMap[secId] = !sectionCollapseMap[secId];
      const panel = document.getElementById('panel-' + secId);
      const chevron = document.getElementById('chevron-' + secId);
      if (panel) {
        panel.classList.toggle('collapsed', sectionCollapseMap[secId]);
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

    document.getElementById('btn-refresh-quota').addEventListener('click', (e) => {
      e.stopPropagation();
      vscode.postMessage({ command: 'refresh' });
    });

    // Initial renders
    renderGroupedTree();
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
</html>`}var I=class{constructor(t){this._extensionUri=t}static viewType="9router.quotaTrackerView";_view;_streamDisposer;resolveWebviewView(t,e,a){this._view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},this.refresh(),this.startLiveStream(),t.onDidDispose(()=>{this._streamDisposer&&this._streamDisposer()}),t.webview.onDidReceiveMessage(async r=>{switch(r.command){case"refresh":await this.refresh(),v.window.showInformationMessage("9Router: Refreshed");break;case"refreshSingle":await this.refresh(),v.window.showInformationMessage(`9Router: Quota refreshed for ${r.name||"account"}`);break;case"fetchChart":let n=await y.getInstance().fetchChartData(r.period||"today");t.webview.postMessage({type:"chartData",data:n});break;case"test":await v.window.withProgress({location:v.ProgressLocation.Notification,title:`9Router: Testing ${r.name||"connection"}...`},async()=>{let c=await y.getInstance().testConnection(r.connectionId);c.valid?v.window.showInformationMessage(`9Router: ${r.name||"Account"} is VALID and active!`):v.window.showErrorMessage(`9Router: Test failed: ${c.error||"Connection invalid"}`),await this.refresh()});break;case"toggleActive":await y.getInstance().toggleConnection(r.connectionId,r.nextActive)?(v.window.showInformationMessage(`9Router: Account status set to ${r.nextActive?"Active":"Idle"}`),await this.refresh()):v.window.showErrorMessage("9Router: Failed to update status");break;case"openSettings":v.commands.executeCommand("9router.configureSettings");break;case"openWeb":v.commands.executeCommand("9router.openWebDashboard");break}})}startLiveStream(){this._streamDisposer&&this._streamDisposer(),this._streamDisposer=y.getInstance().listenUsageStream(t=>{this._view&&this._view.webview.postMessage({type:"usageStream",data:t})})}async refresh(){if(this._view){let t=await y.getInstance().fetchQuotas(),e=this.getProviderIconMap(this._view.webview),a=this._view.webview.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","codicons","codicon.css")).toString(),r=this._view.webview.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","topologyFlow.js")).toString(),n=this._view.webview.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","topologyFlow.css")).toString();this._view.webview.html=_(t,e,a,r,n)}}getProviderIconMap(t){let e={},a=R.join(this._extensionUri.fsPath,"media","providers");if(P.existsSync(a))try{P.readdirSync(a).forEach(n=>{let i=R.basename(n,R.extname(n)).toLowerCase(),c=t.asWebviewUri(v.Uri.joinPath(this._extensionUri,"media","providers",n));e[i]=c.toString()})}catch(r){console.warn("[9Router] Error scanning media/providers:",r)}return e.claude&&!e["claude-code"]&&(e["claude-code"]=e.claude),e.azure&&!e["azure-openai"]&&(e["azure-openai"]=e.azure),e.gemini&&!e["gemini-cli"]&&(e["gemini-cli"]=e.gemini),e["mimo-free"]&&!e.mimo&&(e.mimo=e["mimo-free"]),e}};var w,C;function j(s){console.log("[9Router Monitor] Extension activated");let t=new I(s.extensionUri);s.subscriptions.push(l.window.registerWebviewViewProvider(I.viewType,t)),w=l.window.createStatusBarItem(l.StatusBarAlignment.Right,100),w.command="9router.refreshStats",w.tooltip="Click to refresh 9Router Quotas",s.subscriptions.push(w),w.show(),s.subscriptions.push(l.commands.registerCommand("9router.refreshStats",async()=>{await t.refresh(),await A(),l.window.showInformationMessage("9Router: Refreshed")})),s.subscriptions.push(l.commands.registerCommand("9router.configureSettings",async()=>{let e=l.workspace.getConfiguration("9router"),a=e.get("baseUrl","http://localhost:20128"),r=e.get("refreshInterval",900),n=await l.window.showQuickPick([{label:"$(globe) Configure 9Router Base URL / IP",description:a,action:"url"},{label:"$(clock) Change Auto-Sync Interval",description:`${Math.round(r/60)} minutes`,action:"interval"},{label:"$(key) Set API Key (Remote access)",description:"Configure Bearer token for remote 9router access",action:"key"},{label:"$(settings-gear) Open in VS Code Settings GUI",description:"View all 9Router extension preferences",action:"gui"}],{placeHolder:"9Router Settings & Server Configuration"});if(n)if(n.action==="url"){let i=await l.window.showInputBox({prompt:"Enter 9Router instance base URL or IP",value:a,placeHolder:"http://localhost:20128 or http://10.1.8.108:20128"});i&&(await e.update("baseUrl",i.trim(),l.ConfigurationTarget.Global),l.window.showInformationMessage(`9Router: Base URL updated to ${i.trim()}`),await t.refresh(),await A())}else if(n.action==="interval"){let i=await l.window.showQuickPick([{label:"5 Minutes",value:300},{label:"15 Minutes (Default)",value:900},{label:"30 Minutes",value:1800},{label:"1 Hour",value:3600}],{placeHolder:"Select auto-refresh sync interval"});i&&(await e.update("refreshInterval",i.value,l.ConfigurationTarget.Global),l.window.showInformationMessage(`9Router: Sync interval updated to ${i.label}`))}else if(n.action==="key"){let i=await l.window.showInputBox({prompt:"Enter 9Router API Key (Optional for local, required for remote)",password:!0,placeHolder:"sk_..."});i!==void 0&&(await e.update("apiKey",i.trim(),l.ConfigurationTarget.Global),l.window.showInformationMessage("9Router: API Key updated"),await t.refresh())}else n.action==="gui"&&l.commands.executeCommand("workbench.action.openSettings","9router")})),K(s),A(),N(s,t),s.subscriptions.push(l.workspace.onDidChangeConfiguration(e=>{e.affectsConfiguration("9router")&&(N(s,t),A())}))}function K(s){let t=U.join(z.homedir(),".9router"),e=U.join(t,"reload-trigger");try{x.existsSync(t)||x.mkdirSync(t,{recursive:!0}),x.existsSync(e)||x.writeFileSync(e,String(Date.now())),x.watchFile(e,{interval:300},()=>{console.log("[9Router Monitor] Auto-reload triggered"),l.commands.executeCommand("workbench.action.reloadWindow")}),s.subscriptions.push({dispose:()=>{x.unwatchFile(e)}})}catch(a){console.warn("[9Router] Could not setup reload trigger watcher:",a)}}function N(s,t){C&&clearInterval(C);let a=l.workspace.getConfiguration("9router").get("refreshInterval",900),r=Math.max(10,a)*1e3;C=setInterval(async()=>{await t.refresh(),await A()},r),s.subscriptions.push({dispose:()=>{C&&clearInterval(C)}})}async function A(){try{let s=await y.getInstance().fetchQuotas();if(!s.online){w.text="$(circle-slash) 9Router: Offline",w.backgroundColor=new l.ThemeColor("statusBarItem.warningBackground"),w.tooltip=`9Router is unreachable at ${s.serverUrl}`;return}let t=s.connections.filter(r=>r.isActive),e=t[0]?t[0].name.split("@")[0]:"Ready";w.text=`$(pulse) 9Router: ${e} (${t.length} active)`,w.backgroundColor=void 0;let a=[`9Router Quota Monitor (${s.serverUrl})`,"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"];s.connections.forEach(r=>{a.push(`\u2022 ${r.name} (#Prio ${r.priority}) - ${r.quotas.length} quotas`)}),a.push("\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501"),a.push("Click to refresh quotas"),w.tooltip=a.join(`
`)}catch{w.text="$(alert) 9Router: Error"}}function V(){C&&clearInterval(C)}0&&(module.exports={activate,deactivate});
