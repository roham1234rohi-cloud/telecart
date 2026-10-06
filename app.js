(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var STYLES = ["Noir Hacker", "Neon Glass", "Ice Core", "Cyber AI", "Shadow Elite", "Game Profile", "Identity Mask", "GFX Studio"];
  var KEY = "telecart_v1";

  // ---- Safe storage (localStorage may throw; fall back to memory) ----
  var mem = {};
  var store = {
    get: function () {
      try { var r = window.localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) { }
      return mem[KEY] || null;
    },
    set: function (v) {
      mem[KEY] = v;
      try { window.localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { }
    }
  };

  var tg = null, user = { first_name: "Demo User", username: "demo_user", photo_url: "", id: 0 };
  var state = { used: 0, refs: 0, style: 0, bio: "", refBy: "" };
  var toastT;

  function toast(msg) {
    try {
      var t = $("toast"); t.textContent = msg; t.classList.add("show");
      clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 2200);
    } catch (e) { }
  }
  function save() { store.set(state); }
  function left() { return Math.max(0, 2 + state.refs - state.used); }

  function init() {
    try {
      tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
      try { tg && tg.ready(); tg && tg.expand(); } catch (e) { }
      var u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
      if (u) user = u;
    } catch (e) { console.log("TELECART SAFE MODE", e); }

    try { var s = store.get(); if (s) for (var k in s) state[k] = s[k]; } catch (e) { }

    handleReferral();
    buildChips();
    $("bio").value = state.bio;
    renderProfile();
    renderCard();
    bind();
  }

  // ---- Referrals: ?ref=username or Telegram start_param ----
  // Note: static hosting has no server, so credits are counted on the device
  // that opens the link. Add a backend later for cross-device crediting.
  function handleReferral() {
    try {
      var p = new URLSearchParams(location.search).get("ref");
      var sp = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
      var ref = String(p || sp || "").replace(/[^\w]/g, "").slice(0, 32);
      var me = String(user.username || "").toLowerCase();
      if (ref && ref.toLowerCase() !== me && !state.refBy) {
        state.refBy = ref; state.refs += 1; save();
        toast("Welcome! +1 bonus card from @" + ref);
      }
    } catch (e) { }
  }

  function buildChips() {
    var box = $("chips"), frag = document.createDocumentFragment();
    STYLES.forEach(function (n, i) {
      var b = document.createElement("button");
      b.className = "chip"; b.type = "button"; b.textContent = n; b.dataset.i = i;
      frag.appendChild(b);
    });
    box.appendChild(frag);
  }

  function renderProfile() {
    try {
      var name = user.first_name || "User";
      var handle = user.username ? "@" + user.username : "no username";
      $("name").textContent = (name + " " + (user.last_name || "")).trim();
      $("user").textContent = handle;
      $("uid").textContent = "ID " + (user.id || 0);
      $("avaFb").textContent = name.charAt(0).toUpperCase();
      var img = $("ava");
      img.onerror = function () { img.style.display = "none"; };
      if (user.photo_url) { img.style.display = ""; img.src = user.photo_url; } else img.style.display = "none";
      var id = Number(user.id) || 0, lvl = (id % 50) + 1;
      $("lvl").textContent = lvl; $("xp").style.width = (20 + (id % 7) * 11) + "%";
      var uname = user.username || "demo_user";
      $("ref").value = location.origin + location.pathname + "?ref=" + encodeURIComponent(uname);
    } catch (e) { console.log("TELECART SAFE MODE", e); }
  }

  function renderCard() {
    try {
      $("card").className = "card t" + state.style;
      var chips = $("chips").children;
      for (var i = 0; i < chips.length; i++) {
        chips[i].classList.toggle("on", i === state.style);
        chips[i].setAttribute("aria-selected", i === state.style);
      }
      $("bioOut").textContent = state.bio.trim() || "Your bio shows here.";
      $("credits").textContent = left();
    } catch (e) { }
  }

  function limitBio(v) { return v.split("\n").slice(0, 3).join("\n").slice(0, 120); }

  function bind() {
    $("chips").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".chip") : null;
      if (!b) return;
      state.style = +b.dataset.i; save(); requestAnimationFrame(renderCard);
    });
    $("bio").addEventListener("input", function (e) {
      var v = limitBio(e.target.value);
      if (v !== e.target.value) e.target.value = v;
      state.bio = v; save(); requestAnimationFrame(renderCard);
    });
    $("save").addEventListener("click", exportCard);
    $("share").addEventListener("click", share);
    $("copy").addEventListener("click", copyRef);
  }

  async function exportCard() {
    var btn = $("save");
    try {
      if (left() < 1) { toast("No cards left. Invite friends for more."); return; }
      if (typeof window.html2canvas !== "function") { toast("Export unavailable offline."); return; }
      btn.disabled = true; btn.textContent = "Rendering...";
      await document.fonts.ready;
      await new Promise(function (r) { setTimeout(r, 300); });
      var canvas = await window.html2canvas($("card"), { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      var url = canvas.toDataURL("image/png");
      var a = document.createElement("a");
      a.href = url; a.download = "telecart-" + (user.username || "card") + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      if (tg && tg.platform && tg.platform !== "unknown") window.open(url, "_blank");
      state.used += 1; save(); renderCard(); toast("Card saved");
    } catch (e) {
      console.log("TELECART SAFE MODE", e); toast("Export failed. Try another style.");
    } finally { btn.disabled = false; btn.textContent = "Save PNG"; }
  }

  function share() {
    try {
      var link = $("ref").value;
      var url = "https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent("Make your TELECART identity card");
      if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank", "noopener");
    } catch (e) { toast("Could not open share."); }
  }

  function copyRef() {
    var v = $("ref").value;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(v).then(function () { toast("Link copied"); }, fallbackCopy);
      } else fallbackCopy();
    } catch (e) { fallbackCopy(); }
    function fallbackCopy() {
      try { $("ref").select(); document.execCommand("copy"); toast("Link copied"); } catch (e) { toast("Copy the link manually."); }
    }
  }

  try {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  } catch (e) { console.log("TELECART SAFE MODE", e); }
})();
