// theme.js — Shared light/dark mode toggle (default: system preference)
(function(){
  const key='postcheck-theme';
  function getPreferred(){
    const saved=localStorage.getItem(key);
    if(saved)return saved;
    return window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  }
  function apply(theme){
    document.documentElement.setAttribute('data-theme',theme);
    localStorage.setItem(key,theme);
    const btn=document.getElementById('theme-toggle');
    if(btn)btn.textContent=theme==='dark'?'☀️':'🌙';
  }
  window.toggleTheme=function(){
    const current=document.documentElement.getAttribute('data-theme')||getPreferred();
    apply(current==='dark'?'light':'dark');
  };
  // Apply on load
  document.addEventListener('DOMContentLoaded',()=>apply(getPreferred()));
  // Listen for system changes
  window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',e=>{
    if(!localStorage.getItem(key))apply(e.matches?'dark':'light');
  });
})();
