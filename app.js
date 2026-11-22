(function () {
  "use strict";
  var D = window.DISEASES;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };

  /* ---------- one-time reset ----------
     Bump RESET_VERSION to wipe all locally stored accounts, sessions and saved lists
     the next time each visitor opens the site. */
  var RESET_VERSION = "2026-11-21-reset";
  try {
    if (localStorage.getItem("cad_reset") !== RESET_VERSION) {
      Object.keys(localStorage).forEach(function (k) { if (k.indexOf("cad_") === 0) localStorage.removeItem(k); });
      sessionStorage.clear();
      localStorage.setItem("cad_reset", RESET_VERSION);
    }
  } catch (e) {}

  /* ---------- storage (every access guarded) ---------- */
  function load(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  /* ---------- accounts ----------
     NOTE: this is a static site, so accounts live in this browser only (localStorage).
     Passwords are salted and hashed with PBKDF2, never stored in plain text.
     To get real, cross-device accounts, swap the four functions in `Auth` for a backend
     such as Supabase or Firebase. The UI does not need to change. */
  function b64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
  function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  /* Pure-JS SHA-256 so hashing works on http as well as https. */
  var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  function sha256(m) {
    var l = m.length, n = ((l + 9 + 63) >> 6) << 6, p = new Uint8Array(n), i, j;
    p.set(m); p[l] = 0x80;
    var bits = l * 8; p[n - 4] = bits >>> 24; p[n - 3] = bits >>> 16; p[n - 2] = bits >>> 8; p[n - 1] = bits;
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], w = new Array(64);
    for (var o = 0; o < n; o += 64) {
      for (i = 0; i < 16; i++) w[i] = (p[o+4*i] << 24) | (p[o+4*i+1] << 16) | (p[o+4*i+2] << 8) | p[o+4*i+3];
      for (i = 16; i < 64; i++) {
        var a0 = w[i-15], a1 = w[i-2];
        var s0 = ((a0>>>7)|(a0<<25)) ^ ((a0>>>18)|(a0<<14)) ^ (a0>>>3);
        var s1 = ((a1>>>17)|(a1<<15)) ^ ((a1>>>19)|(a1<<13)) ^ (a1>>>10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }
      var v = H.slice();
      for (i = 0; i < 64; i++) {
        var e = v[4], a = v[0];
        var S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
        var t1 = (v[7] + S1 + ((e & v[5]) ^ (~e & v[6])) + K[i] + w[i]) | 0;
        var S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
        var t2 = (S0 + ((a & v[1]) ^ (a & v[2]) ^ (v[1] & v[2]))) | 0;
        v = [(t1 + t2) | 0, v[0], v[1], v[2], (v[3] + t1) | 0, v[4], v[5], v[6]];
      }
      for (j = 0; j < 8; j++) H[j] = (H[j] + v[j]) | 0;
    }
    var out = new Uint8Array(32);
    for (j = 0; j < 8; j++) { out[4*j] = H[j] >>> 24; out[4*j+1] = H[j] >>> 16; out[4*j+2] = H[j] >>> 8; out[4*j+3] = H[j]; }
    return out;
  }
  function cat(a, b) { var r = new Uint8Array(a.length + b.length); r.set(a); r.set(b, a.length); return r; }
  function hash(pw, saltB64) {
    var pwb = new TextEncoder().encode(pw), h = sha256(cat(unb64(saltB64), pwb));
    for (var i = 0; i < 20000; i++) h = sha256(cat(h, pwb));
    return Promise.resolve(b64(h));
  }
  function randomSalt() {
    var a = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a);
    else for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256);
    return b64(a);
  }
  var Auth = {
    users: function () { return load("cad_users", []); },
    current: function () { return load("cad_session", null); },
    signup: function (username, email, pw) {
      var users = Auth.users();
      var u = username.toLowerCase(), e = (email || "").toLowerCase();
      if (users.some(function (x) { return x.username.toLowerCase() === u; })) return Promise.reject("That username is taken.");
      if (e && users.some(function (x) { return x.email === e; })) return Promise.reject("An account with that email already exists.");
      var salt = randomSalt();
      return hash(pw, salt).then(function (h) {
        users.push({ username: username, email: e, salt: salt, hash: h });
        if (!save("cad_users", users)) throw "Your browser blocked saving. Check privacy settings.";
        save("cad_session", { username: username });
        return username;
      });
    },
    login: function (id, pw) {
      var key = id.trim().toLowerCase();
      var user = Auth.users().filter(function (x) { return x.username.toLowerCase() === key || (x.email && x.email === key); })[0];
      var bad = "Incorrect email, username or password.";
      if (!user) return Promise.reject(bad);
      return hash(pw, user.salt).then(function (h) {
        if (h !== user.hash) throw bad;
        save("cad_session", { username: user.username });
        return user.username;
      });
    },
    logout: function () { try { localStorage.removeItem("cad_session"); } catch (e) {} }
  };

  function savedKey() { var s = Auth.current(); return s ? "cad_saved_" + s.username.toLowerCase() : null; }
  function savedList() { var k = savedKey(); return k ? load(k, []) : []; }
  function toggleSaved(id) {
    var k = savedKey(); if (!k) return;
    var l = savedList(), i = l.indexOf(id);
    if (i >= 0) l.splice(i, 1); else l.push(id);
    save(k, l);
  }

  /* ---------- auth UI ---------- */
  var dlg = $("#authDlg");
  function renderAuthSlot() {
    var slot = $("#authSlot"); slot.textContent = "";
    var s = Auth.current();
    if (s) {
      var out = el("button", { class: "btn line", type: "button", text: "Log out" });
      out.onclick = function () { Auth.logout(); renderAuthSlot(); route(); };
      var kids = [el("span", {}, ["Hi, ", el("b", { text: s.username })])];
      if (s.username.toLowerCase() === "owner") { var ib = el("a", { class: "btn line", href: "#/inbox", text: "Inbox" }); kids.push(ib); }
      kids.push(out);
      slot.appendChild(el("span", { class: "who" }, kids));
    } else {
      var li = el("button", { class: "btn line", type: "button", text: "Log in" });
      var su = el("button", { class: "btn solid", type: "button", text: "Sign up" });
      li.onclick = function () { openAuth("login"); };
      su.onclick = function () { openAuth("signup"); };
      slot.appendChild(el("span", { class: "who" }, [li, su]));
    }
  }
  function tab(which) {
    var login = which === "login";
    $("#tabLogin").setAttribute("aria-selected", login);
    $("#tabSignup").setAttribute("aria-selected", !login);
    $("#loginForm").hidden = !login;
    $("#signupForm").hidden = login;
    $("#liErr").textContent = $("#suErr").textContent = "";
    $("#authTitle").textContent = login ? "Welcome back" : "Create your account";
  }
  var afterAuth = null;
  function openAuth(which, cb) {
    afterAuth = cb || null; tab(which);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(function () { $(which === "login" ? "#liId" : "#suUser").focus(); }, 30);
  }
  function done() {
    dlg.close(); renderAuthSlot(); $("#loginForm").reset(); $("#signupForm").reset();
    var cb = afterAuth; afterAuth = null; route(); if (cb) cb();
  }
  $("#tabLogin").onclick = function () { tab("login"); };
  $("#tabSignup").onclick = function () { tab("signup"); };
  $("#authClose").onclick = function () { dlg.close(); };
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#liErr"); err.textContent = "";
    var id = $("#liId").value, pw = $("#liPw").value;
    if (!id.trim() || !pw) { err.textContent = "Enter your email or username and your password."; return; }
    Auth.login(id, pw).then(done, function (m) { err.textContent = String(m); });
  });
  $("#signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#suErr"); err.textContent = "";
    var u = $("#suUser").value.trim(), em = $("#suEmail").value.trim(), p = $("#suPw").value, p2 = $("#suPw2").value;
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(u)) { err.textContent = "Username must be 3 to 20 letters, numbers, dots, dashes or underscores."; return; }
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = "Enter a valid email address."; return; }
    if (p.length < 8) { err.textContent = "Password must be at least 8 characters."; return; }
    if (p !== p2) { err.textContent = "Passwords don't match."; return; }
    Auth.signup(u, em, p).then(function (n) { if (sbOn) rpc("bump_stat", { stat: "accounts" }).then(function () { return rpc("get_stats"); }).then(function (r) { var x = $("#nAccounts"); if (x) x.textContent = fmt(r.accounts); }, function () {}); return n; }).then(done, function (m) { err.textContent = String(m); });
  });

  /* ---------- research grid ---------- */
  function renderTiles() {
    var box = $("#tiles"); box.textContent = "";
    if (!D.length) {
      for (var i = 0; i < 3; i++) box.appendChild(el("div", { class: "slot", "aria-hidden": "true" }));
      return;
    }
    var saved = savedList();
    D.forEach(function (d) {
      var t = el("button", { class: "tile", type: "button", "aria-label": d.name + ", open full breakdown" }, [
        el("h3", { text: d.name })
      ]);
      t.onclick = function () { if (d.href) location.href = d.href; else location.hash = "#/d/" + d.id; };
      box.appendChild(t);
    });
    for (var j = D.length % 3 ? 3 - (D.length % 3) : 0; j > 0; j--) box.appendChild(el("div", { class: "slot", "aria-hidden": "true" }));
  }

  /* ---------- detail view ---------- */
  function renderDetail(d) {
    var root = $("#detailInner"); root.textContent = "";
    var back = el("button", { class: "back", type: "button", text: "← Back" });
    back.onclick = function () { location.hash = "#/"; };
    var isSaved = savedList().indexOf(d.id) >= 0;
    var saveBtn = el("button", { class: "btn solid", type: "button", text: isSaved ? "★ Saved" : "☆ Save" });
    saveBtn.onclick = function () {
      if (!Auth.current()) { openAuth("signup", function () { toggleSaved(d.id); renderDetail(d); }); return; }
      toggleSaved(d.id); renderDetail(d);
    };
    var head = el("div", { class: "d-head" }, [
      el("div", { class: "cat", text: d.category || "" }), el("h1", { text: d.name }), saveBtn
    ]);
    var body = el("div", { class: "body" });
    (d.sections || []).forEach(function (s) {
      var sec = el("section", {}, [el("h2", { text: s.title })]);
      (s.body || []).forEach(function (p) { sec.appendChild(el("p", { text: p })); });
      body.appendChild(sec);
    });
    root.appendChild(back); root.appendChild(head); root.appendChild(body);
    document.title = d.name + " | Cure A Disease";
  }


  /* ---------- contact + owner inbox (Supabase REST, no SDK) ---------- */
  var CFG = window.CAD_CONFIG || {};
  var sbOn = !!(CFG.supabaseUrl && CFG.supabaseKey);
  function sb(path, opts, token) {
    opts = opts || {};
    var headers = { apikey: CFG.supabaseKey, Authorization: "Bearer " + (token || CFG.supabaseKey), "Content-Type": "application/json" };
    Object.keys(opts.headers || {}).forEach(function (k) { headers[k] = opts.headers[k]; });
    return fetch(CFG.supabaseUrl.replace(/\/$/, "") + path, { method: opts.method || "GET", headers: headers, body: opts.body })
      .then(function (r) {
        if (!r.ok) return r.text().then(function (t) { var e = new Error(t || r.status); e.status = r.status; throw e; });
        return r.status === 204 ? null : r.text().then(function (t) { return t ? JSON.parse(t) : null; });
      });
  }
  function isOwner() { var s = Auth.current(); return !!s && s.username.toLowerCase() === "owner"; }

  if (sbOn) {
    $("#contact").hidden = false; $("#navContact").hidden = false;
    var kinds = document.getElementsByName("kind");
    Array.prototype.forEach.call(kinds, function (r) {
      r.addEventListener("change", function () { $("#diseaseRow").hidden = document.querySelector("input[name=kind]:checked").value !== "disease_request"; });
    });
    $("#contactForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var err = $("#cErr"); err.textContent = "";
      if ($("#cTrap").value) return;
      var kind = document.querySelector("input[name=kind]:checked").value;
      var body = $("#cMsg").value.trim(), disease = $("#cDisease").value.trim(), email = $("#cEmail").value.trim();
      if (kind === "disease_request" && !disease) { err.textContent = "Tell us which disease."; return; }
      if (!body) { err.textContent = "Please write a message."; return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = "That email address doesn't look right."; return; }
      var last = load("cad_last_msg", 0);
      if (Date.now() - last < 30000) { err.textContent = "Please wait a moment before sending another message."; return; }
      var btn = $("#cSend"); btn.disabled = true; btn.textContent = "Sending\u2026";
      var cur = Auth.current();
      var row = { kind: kind, body: body, disease: kind === "disease_request" ? disease : null,
                  name: $("#cName").value.trim() || null, email: email || null, username: cur ? cur.username : null };
      sb("/rest/v1/messages", { method: "POST", body: JSON.stringify(row), headers: { Prefer: "return=minimal" } }).then(function () {
        save("cad_last_msg", Date.now());
        var f = $("#contactForm"); f.parentNode.replaceChild(el("div", { class: "ok", role: "status", text: "Thank you. Your message has been sent to our team." }), f);
      }, function () {
        err.textContent = "Sorry, that didn't send. Please try again in a moment.";
        btn.disabled = false; btn.textContent = "Send message";
      });
    });
  }


  /* ---------- header counters (visits, accounts) via Supabase RPC ---------- */
  function rpc(fn, args) { return sb("/rest/v1/rpc/" + fn, { method: "POST", body: JSON.stringify(args || {}) }); }
  function fmt(n) { return Number(n).toLocaleString(); }
  if (sbOn && $("#stats")) {
    var seen = false; try { seen = sessionStorage.getItem("cad_seen") === "1"; } catch (e) {}
    var p = seen ? rpc("get_stats") : rpc("bump_stat", { stat: "visits" }).then(function () { try { sessionStorage.setItem("cad_seen", "1"); } catch (e) {} return rpc("get_stats"); });
    p.then(function (r) {
      $("#nVisits").textContent = fmt(r.visits); $("#nAccounts").textContent = fmt(r.accounts); $("#stats").hidden = false;
    }, function () {});
  }

  function owner() { try { return JSON.parse(sessionStorage.getItem("cad_owner") || "null"); } catch (e) { return null; } }
  function setOwner(v) { try { if (v) sessionStorage.setItem("cad_owner", JSON.stringify(v)); else sessionStorage.removeItem("cad_owner"); } catch (e) {} }

  function renderInbox() {
    var root = $("#inboxInner"); root.textContent = "";
    var back = el("button", { class: "back", type: "button", text: "\u2190 Back to site" });
    back.onclick = function () { location.hash = "#/"; };
    root.appendChild(back);
    root.appendChild(el("div", { class: "d-head" }, [el("div", { class: "cat", text: "Owner only" }), el("h1", { text: "Inbox" })]));
    if (!sbOn) { root.appendChild(el("p", { text: "The inbox isn't connected yet. Add your Supabase details to config.js." })); return; }
    if (!isOwner()) { root.appendChild(el("p", { text: "Log in to the Owner account to view this page." })); return; }
    var o = owner();
    if (!o) {
      var f = el("form", { class: "ib-login", novalidate: "novalidate" }, [
        el("label", { for: "ibE", text: "Owner email" }), el("input", { id: "ibE", type: "email", autocomplete: "username" }),
        el("label", { for: "ibP", text: "Password" }), el("input", { id: "ibP", type: "password", autocomplete: "current-password" }),
        el("p", { class: "err", id: "ibErr", role: "alert" }),
        el("button", { class: "btn solid", type: "submit", text: "Open inbox" })
      ]);
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        sb("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email: $("#ibE").value.trim(), password: $("#ibP").value }) })
          .then(function (r) { setOwner({ token: r.access_token }); renderInbox(); },
                function () { $("#ibErr").textContent = "Those details didn't work."; });
      });
      root.appendChild(f); return;
    }
    var out = el("button", { class: "btn line", type: "button", text: "Sign out of inbox", style: "color:var(--ink);border-color:var(--line);margin-bottom:20px" });
    out.onclick = function () { setOwner(null); renderInbox(); };
    var list = el("div", {}, [el("p", { text: "Loading\u2026" })]);
    root.appendChild(out); root.appendChild(list);
    sb("/rest/v1/messages?select=*&order=created_at.desc", {}, o.token).then(function (rows) {
      list.textContent = "";
      if (!rows.length) { list.appendChild(el("p", { text: "No messages yet." })); return; }
      rows.forEach(function (m) {
        var meta = el("div", { class: "meta" }, [
          el("span", { class: "tag", text: m.kind === "disease_request" ? "Disease request" : "Message" }),
          el("span", { text: new Date(m.created_at).toLocaleString() })
        ]);
        if (m.disease) meta.appendChild(el("span", {}, ["Disease: ", el("b", { text: m.disease })]));
        if (m.name) meta.appendChild(el("span", { text: "From: " + m.name }));
        if (m.email) meta.appendChild(el("span", {}, ["Reply: ", el("a", { href: "mailto:" + encodeURIComponent(m.email).replace("%40", "@"), text: m.email })]));
        if (m.username) meta.appendChild(el("span", { text: "Account: " + m.username }));
        var del = el("button", { class: "del", type: "button", text: "Delete" });
        del.onclick = function () {
          if (!confirm("Delete this message?")) return;
          sb("/rest/v1/messages?id=eq." + m.id, { method: "DELETE" }, o.token).then(renderInbox);
        };
        list.appendChild(el("div", { class: "msg" }, [meta, el("p", { text: m.body }), del]));
      });
    }, function (e) {
      if (e.status === 401) { setOwner(null); renderInbox(); }
      else list.textContent = "Couldn't load messages.";
    });
  }

  /* ---------- routing ---------- */
  function route() {
    var m = /^#\/d\/([\w-]+)/.exec(location.hash);
    var d = m && D.filter(function (x) { return x.id === m[1]; })[0];
    if (location.hash === "#/inbox") {
      $("#home").hidden = true; $("#detail").hidden = true; $("#inbox").hidden = false;
      renderInbox(); window.scrollTo(0, 0); document.title = "Inbox | Cure A Disease"; return;
    }
    $("#inbox").hidden = true;
    if (d) {
      $("#home").hidden = true; $("#detail").hidden = false;
      renderDetail(d); window.scrollTo(0, 0);
    } else {
      $("#detail").hidden = true; $("#home").hidden = false;
      renderTiles(); document.title = "Cure A Disease | Nonprofit research organization";
    }
  }
  window.addEventListener("hashchange", route);

  document.querySelectorAll("[data-go]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("data-go");
      if (location.hash === "#/" || location.hash === "") {
        e.preventDefault(); var t = document.getElementById(id); if (t) t.scrollIntoView({ behavior: "smooth" });
      } else {
        setTimeout(function () { var t = document.getElementById(id); if (t) t.scrollIntoView(); }, 30);
      }
    });
  });

  var cta = $("#heroCta");
  if (cta) cta.onclick = function () { openAuth("signup"); };
  renderAuthSlot();
  route();
})();
