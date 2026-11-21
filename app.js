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
  function hash(pw, saltB64) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (key) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: unb64(saltB64), iterations: 150000, hash: "SHA-256" }, key, 256);
    }).then(b64);
  }
  var Auth = {
    users: function () { return load("cad_users", []); },
    current: function () { return load("cad_session", null); },
    signup: function (username, email, pw) {
      var users = Auth.users();
      var u = username.toLowerCase(), e = email.toLowerCase();
      if (users.some(function (x) { return x.username.toLowerCase() === u; })) return Promise.reject("That username is taken.");
      if (users.some(function (x) { return x.email === e; })) return Promise.reject("An account with that email already exists.");
      var salt = b64(crypto.getRandomValues(new Uint8Array(16)));
      return hash(pw, salt).then(function (h) {
        users.push({ username: username, email: e, salt: salt, hash: h });
        if (!save("cad_users", users)) throw "Your browser blocked saving. Check privacy settings.";
        save("cad_session", { username: username });
        return username;
      });
    },
    login: function (id, pw) {
      var key = id.trim().toLowerCase();
      var user = Auth.users().filter(function (x) { return x.username.toLowerCase() === key || x.email === key; })[0];
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
  var cryptoOk = !!(window.crypto && crypto.subtle);

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
      slot.appendChild(el("span", { class: "who" }, [el("span", {}, ["Hi, ", el("b", { text: s.username })]), out]));
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
    if (!cryptoOk) { err.textContent = "Accounts need a secure (https) connection."; return; }
    Auth.login(id, pw).then(done, function (m) { err.textContent = String(m); });
  });
  $("#signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#suErr"); err.textContent = "";
    var u = $("#suUser").value.trim(), em = $("#suEmail").value.trim(), p = $("#suPw").value, p2 = $("#suPw2").value;
    if (!/^[A-Za-z0-9_.-]{3,20}$/.test(u)) { err.textContent = "Username must be 3 to 20 letters, numbers, dots, dashes or underscores."; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { err.textContent = "Enter a valid email address."; return; }
    if (p.length < 8) { err.textContent = "Password must be at least 8 characters."; return; }
    if (p !== p2) { err.textContent = "Passwords don't match."; return; }
    if (!cryptoOk) { err.textContent = "Accounts need a secure (https) connection."; return; }
    Auth.signup(u, em, p).then(done, function (m) { err.textContent = String(m); });
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
        el("span", { class: "cat", text: d.category || "" }),
        el("h3", { text: d.name }),
        el("p", { text: d.blurb || "" }),
        el("span", { class: "more" }, [el("span", { text: "Read more →" }), el("span", { text: saved.indexOf(d.id) >= 0 ? "★ Saved" : "" })])
      ]);
      t.onclick = function () { location.hash = "#/d/" + d.id; };
      box.appendChild(t);
    });
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

  /* ---------- routing ---------- */
  function route() {
    var m = /^#\/d\/([\w-]+)/.exec(location.hash);
    var d = m && D.filter(function (x) { return x.id === m[1]; })[0];
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
