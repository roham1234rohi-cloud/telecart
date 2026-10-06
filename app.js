(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  var fa = function (n) { try { return Number(n).toLocaleString("fa-IR"); } catch (e) { return String(n); } };
  var log = function (e) { console.log("TELECART V2 SAFE MODE", e); };
  var ST = [["Noir Hacker", "سایبر تاریک", "#0b5d2a,#020402"], ["Neon Glass", "لوکس شیشه‌ای", "#7c3aed,#0e7490"], ["Ice Core", "هویت یخی", "#7dd3fc,#06213f"], ["Cyber AI", "رابط آینده", "#0891b2,#031018"], ["Shadow Elite", "VIP سیاه", "#d4af37,#0b0905"], ["Game Profile", "نقش‌آفرین", "#7c3aed,#1e1b4b"], ["Identity Mask", "ناشناس سینمایی", "#6b7280,#101016"], ["GFX Studio", "پوستر موشن", "#ff2d55,#ffd60a"]];
  var EF = [["blur", "نرم"], ["glow", "درخشش"], ["vig", "وینیت"], ["neon", "نئون"]];
  var RAR = ["معمولی", "کمیاب", "حماسی", "افسانه‌ای"];
  var KEY = "telecart_v2", mem = {};
  var store = {
    get: function () { try { var r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (e) { } return mem[KEY] || null; },
    set: function (v) { mem[KEY] = v; try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { } }
  };
  var tg = null, user = {}, hasImg = false, made = false, tt;
  var S = { used: 0, refs: 0, refBy: "", style: 0, bio: "", fx: ["glow", "vig"], fit: "cover", z: 1 };

  function toast(m) { try { var t = $("toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove("show"); }, 2400); } catch (e) { } }
  function hap(k) { try { tg && tg.HapticFeedback && tg.HapticFeedback.impactOccurred(k || "light"); } catch (e) { } }
  function save() { store.set(S); }
  function left() { return Math.max(0, 2 + S.refs - S.used); }
  function locked(i) { return i >= 6 && S.refs < 1; }
  function link() { return $("ref").value; }

  function init() {
    try {
      tg = window.Telegram && window.Telegram.WebApp || null;
      try { tg && tg.ready(); tg && tg.expand(); } catch (e) { }
      user = (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) || {};
    } catch (e) { log(e); }
    try { var s = store.get(); if (s) for (var k in s) if (k in S) S[k] = s[k]; } catch (e) { }
    S.used = Math.max(0, +S.used || 0); S.refs = Math.max(0, +S.refs || 0);
    try { referral(); profile(); build(); bind(); } catch (e) { log(e); }
    $("bio").value = S.bio; $("zoom").value = S.z;
    render();
  }

  function referral() {
    var p = new URLSearchParams(location.search).get("ref");
    var sp = tg && tg.initDataUnsafe && tg.initDataUnsafe.start_param;
    var ref = String(p || sp || "").replace(/[^\w]/g, "").slice(0, 32);
    var me = String(user.username || "").toLowerCase();
    if (ref && ref.toLowerCase() !== me && !S.refBy) { S.refBy = ref; S.refs += 1; save(); toast("خوش آمدید! یک کارت هدیه از @" + ref); }
  }

  function profile() {
    var first = String(user.first_name || "").trim(), full = (first + " " + String(user.last_name || "")).trim();
    $("nm").textContent = full || "کاربر تلگرام";
    $("un").textContent = user.username ? "@" + user.username : "بدون نام کاربری";
    $("uid").textContent = "ID " + (user.id || "—");
    $("ini").textContent = (full || "T").charAt(0).toUpperCase();
    var id = Number(user.id) || 7;
    $("lv").textContent = "سطح " + fa(id % 50 + 1); $("xpb").style.width = (25 + id % 7 * 10) + "%";
    $("ref").value = location.origin + location.pathname + "?ref=" + encodeURIComponent(user.username || "friend");
    if (user.photo_url) setImg(user.photo_url, true);
  }

  function setImg(src, remote) {
    var a = $("ph"), b = $("bgi");
    if (remote) { a.crossOrigin = b.crossOrigin = "anonymous"; a.onerror = function () { a.removeAttribute("src"); b.removeAttribute("src"); hasImg = false; $("ini").style.display = ""; }; }
    else { a.crossOrigin = b.crossOrigin = null; a.onerror = null; }
    a.src = b.src = src; hasImg = true; $("ini").style.display = "none";
  }

  function upload(f) {
    if (!f || !/^image\//.test(f.type)) { toast("لطفاً یک تصویر انتخاب کنید"); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        try {
          var m = 1000, k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement("canvas");
          c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
          setImg(c.toDataURL("image/jpeg", .9)); hap();
        } catch (e) { setImg(fr.result); }
      };
      im.onerror = function () { toast("تصویر قابل خواندن نیست"); };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  }

  function build() {
    var car = $("car"), fx = $("fx");
    ST.forEach(function (s, i) {
      var b = document.createElement("button"); b.type = "button"; b.className = "tile"; b.dataset.i = i;
      b.style.background = "linear-gradient(150deg," + s[2] + ")";
      b.innerHTML = "<b>" + s[0] + "</b><small>" + s[1] + "</small><i></i>";
      car.appendChild(b);
    });
    EF.forEach(function (e) {
      var b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.dataset.e = e[0]; b.textContent = e[1]; fx.appendChild(b);
    });
  }

  function rarity() {
    var h = (((Number(user.id) || 7) * 2654435761 + S.style * 40503 + S.bio.length * 97 + (hasImg ? 13 : 0)) >>> 0) % 100;
    return { r: h < 55 ? 0 : h < 80 ? 1 : h < 94 ? 2 : 3, s: 60 + h % 40 };
  }

  function render() {
    try {
      var c = $("card");
      c.className = "card s" + S.style + S.fx.map(function (x) { return " e-" + x; }).join("") + (made && c.classList.contains("reveal") ? " reveal" : "");
      c.style.setProperty("--fit", S.fit); c.style.setProperty("--z", S.z);
      [].forEach.call($("car").children, function (t, i) {
        t.classList.toggle("on", i === S.style); t.classList.toggle("lk", locked(i));
        t.querySelector("i").textContent = locked(i) ? "قفل شده" : ""; t.querySelector("i").style.display = locked(i) ? "" : "none";
      });
      [].forEach.call($("fx").children, function (b) { b.classList.toggle("on", S.fx.indexOf(b.dataset.e) > -1); });
      $("fit").textContent = S.fit === "cover" ? "حالت: پر کردن" : "حالت: متناسب";
      $("bioOut").textContent = S.bio.trim() || "هویت دیجیتال شما، با سبک خودتان.";
      var r = rarity(); $("rar").textContent = RAR[r.r]; $("rar").dataset.r = r.r; $("score").textContent = "SCORE " + r.s;
      $("pill").textContent = fa(left()) + " کارت باقی‌مانده"; $("rc").textContent = fa(S.refs);
      $("after").classList.toggle("on", made);
    } catch (e) { log(e); }
  }

  function bind() {
    $("car").addEventListener("click", function (e) {
      var t = e.target.closest(".tile"); if (!t) return; var i = +t.dataset.i;
      if (locked(i)) { hap("rigid"); toast("این سبک با دعوت یک دوست باز می‌شود"); return; }
      S.style = i; save(); hap(); t.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); render();
    });
    $("fx").addEventListener("click", function (e) {
      var k = e.target.dataset && e.target.dataset.e; if (!k) return;
      var j = S.fx.indexOf(k); j > -1 ? S.fx.splice(j, 1) : S.fx.push(k); save(); render();
    });
    $("file").addEventListener("change", function (e) { upload(e.target.files && e.target.files[0]); e.target.value = ""; });
    $("fit").addEventListener("click", function () { S.fit = S.fit === "cover" ? "contain" : "cover"; save(); render(); });
    $("zoom").addEventListener("input", function (e) { S.z = +e.target.value; $("card").style.setProperty("--z", S.z); });
    $("zoom").addEventListener("change", save);
    $("bio").addEventListener("input", function (e) {
      var v = e.target.value.split("\n").slice(0, 3).join("\n").slice(0, 120);
      if (v !== e.target.value) e.target.value = v; S.bio = v; save(); render();
    });
    $("make").addEventListener("click", make);
    $("dl").addEventListener("click", exportPng);
    $("sh").addEventListener("click", share); $("lsh").addEventListener("click", share);
    $("cp").addEventListener("click", copy); $("lcp").addEventListener("click", copy);
    $("lx").addEventListener("click", function () { $("lock").hidden = true; });
    tilt();
  }

  function make() {
    try {
      if (left() < 1) { $("lock").hidden = false; hap("rigid"); return; }
      S.used += 1; save(); made = true;
      var c = $("card"); c.classList.remove("reveal"); void c.offsetWidth; c.classList.add("reveal");
      render(); confetti(); hap("heavy"); toast("هویت شما آماده است");
    } catch (e) { log(e); }
  }

  function confetti() {
    var b = $("burst"), f = document.createDocumentFragment(), cs = ["#22d3ee", "#a855f7", "#f5c76b", "#fff"];
    for (var i = 0; i < 26; i++) {
      var s = document.createElement("i"), a = Math.random() * 6.28, d = 90 + Math.random() * 150;
      s.style.cssText = "--x:" + Math.cos(a) * d + "px;--y:" + (Math.sin(a) * d + 60) + "px;--k:" + cs[i % 4];
      f.appendChild(s);
    }
    b.appendChild(f); setTimeout(function () { b.textContent = ""; }, 1800);
  }

  function tilt() {
    var st = $("stage"), tl = $("tilt"), cd = $("card"), raf = 0, px = 0, py = 0;
    function apply() {
      raf = 0;
      tl.style.setProperty("--ry", (px - .5) * 22 + "deg"); tl.style.setProperty("--rx", (.5 - py) * 18 + "deg");
      cd.style.setProperty("--mx", px * 100 + "%"); cd.style.setProperty("--my", py * 100 + "%");
      document.body.style.setProperty("--ox", px - .5); document.body.style.setProperty("--oy", py - .5);
    }
    st.addEventListener("pointermove", function (e) {
      var r = st.getBoundingClientRect(); px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
      tl.classList.add("act"); if (!raf) raf = requestAnimationFrame(apply);
    });
    function off() { tl.classList.remove("act"); tl.style.removeProperty("--rx"); tl.style.removeProperty("--ry"); }
    st.addEventListener("pointerleave", off); st.addEventListener("pointerup", off); st.addEventListener("pointercancel", off);
  }

  async function exportPng() {
    var b = $("dl"), tl = $("tilt"), c = $("card");
    try {
      if (!made) { toast("ابتدا کارت را بسازید"); return; }
      if (typeof window.html2canvas !== "function") { toast("خروجی در حالت آفلاین ممکن نیست"); return; }
      b.disabled = true; b.textContent = "در حال ساخت...";
      tl.classList.add("still"); c.classList.remove("reveal");
      await document.fonts.ready;
      var imgs = [$("ph"), $("bgi")];
      await Promise.all(imgs.map(function (i) { return i.complete ? 0 : new Promise(function (r) { i.onload = i.onerror = r; }); }));
      await new Promise(function (r) { setTimeout(r, 400); });
      var cv = await window.html2canvas(c, { backgroundColor: null, scale: 2, useCORS: true, logging: false });
      var u = cv.toDataURL("image/png"), a = document.createElement("a");
      a.href = u; a.download = "telecart-" + (user.username || "card") + ".png";
      document.body.appendChild(a); a.click(); a.remove();
      if (tg && tg.platform && tg.platform !== "unknown") window.open(u, "_blank");
      toast("کارت ذخیره شد");
    } catch (e) { log(e); toast("خروجی ناموفق بود؛ دوباره تلاش کنید"); }
    finally { tl.classList.remove("still"); b.disabled = false; b.textContent = "دانلود PNG"; }
  }

  function share() {
    try {
      var u = "https://t.me/share/url?url=" + encodeURIComponent(link()) + "&text=" + encodeURIComponent("کارت هویت دیجیتال خودت رو با TELECART بساز");
      if (tg && tg.openTelegramLink) tg.openTelegramLink(u); else window.open(u, "_blank", "noopener");
    } catch (e) { toast("اشتراک‌گذاری ممکن نشد"); }
  }

  function copy() {
    var v = link();
    function fb() { try { $("ref").select(); document.execCommand("copy"); toast("لینک کپی شد"); } catch (e) { toast("لینک را دستی کپی کنید"); } }
    try { navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(v).then(function () { toast("لینک کپی شد"); }, fb) : fb(); } catch (e) { fb(); }
  }

  try { document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init(); } catch (e) { log(e); }
})();
