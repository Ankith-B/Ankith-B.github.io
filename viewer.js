(function () {
  "use strict";
  if (!window.THREE) { document.querySelectorAll(".vmsg").forEach(function (m) { m.textContent = "The 3D viewer could not load."; }); return; }
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function stage(host) {
    var w = host.clientWidth, h = host.clientHeight;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, w / h, 0.01, 50);
    scene.add(new THREE.AmbientLight(0x6f8fd0, 0.9));
    var k = new THREE.DirectionalLight(0xffffff, 0.9); k.position.set(2, 3, 4); scene.add(k);
    var r = new THREE.DirectionalLight(0x4fd1cf, 0.6); r.position.set(-3, 1, -2); scene.add(r);
    var group = new THREE.Group(); scene.add(group);
    var st = { rx: 0.15, ry: 0.5, dist: 1, auto: !reduce, drag: false, lx: 0, ly: 0 };
    host.appendChild(renderer.domElement);
    var msg = host.querySelector(".vmsg"); if (msg) msg.remove();
    host.addEventListener("pointerdown", function (e) { st.drag = true; st.auto = false; st.lx = e.clientX; st.ly = e.clientY; host.setPointerCapture(e.pointerId); });
    host.addEventListener("pointerup", function () { st.drag = false; });
    host.addEventListener("pointermove", function (e) {
      if (!st.drag) return;
      st.ry += (e.clientX - st.lx) * 0.008; st.rx += (e.clientY - st.ly) * 0.008;
      st.rx = Math.max(-1.4, Math.min(1.4, st.rx)); st.lx = e.clientX; st.ly = e.clientY;
    });
    host.addEventListener("wheel", function (e) { e.preventDefault(); st.dist = Math.max(0.5, Math.min(2.2, st.dist * (1 + e.deltaY * 0.001))); }, { passive: false });
    window.addEventListener("resize", function () {
      var W = host.clientWidth, H = host.clientHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix();
    });
    var base = 1;
    function loop() {
      if (st.auto) st.ry += 0.004;
      group.rotation.set(st.rx, st.ry, 0);
      camera.position.set(0, 0, base * st.dist); camera.lookAt(0, 0, 0);
      renderer.render(scene, camera); requestAnimationFrame(loop);
    }
    return { group: group, state: st, setBase: function (b) { base = b; }, start: loop };
  }

  /* Urinary tract from BodyParts3D (CC BY 4.0) via ashemag/human-atlas */
  var v1 = document.getElementById("v1");
  if (v1) {
    fetch("urinary.json").then(function (r) { return r.json(); }).then(function (data) {
      var s = stage(v1), colors = { "Left kidney": 0x2f6ff0, "Right kidney": 0x2f6ff0, "Urinary bladder": 0x4fd1cf, "Left ureter": 0x9fd0ff, "Right ureter": 0x9fd0ff };
      var box = new THREE.Box3(), meshes = {};
      data.parts.forEach(function (p) {
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p.positions, 3));
        g.setIndex(p.indices); g.computeVertexNormals();
        var m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: colors[p.name] || 0x4fa3ff, transparent: true, opacity: 0.9, shininess: 70, specular: 0x9fd0ff, side: THREE.DoubleSide }));
        s.group.add(m); meshes[p.name] = m; box.expandByObject(m);
      });
      var c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
      s.group.children.forEach(function (m) { m.position.sub(c); });
      s.setBase(Math.max(sz.y, sz.x) * 2.4); s.state.rx = 0.05; s.start();
      var ctl = document.getElementById("v1ctl");
      [["Kidneys", ["Left kidney", "Right kidney"], "#2f6ff0"], ["Ureters", ["Left ureter", "Right ureter"], "#9fd0ff"], ["Bladder", ["Urinary bladder"], "#4fd1cf"]].forEach(function (it) {
        var l = document.createElement("label"), cb = document.createElement("input"), sw = document.createElement("i");
        cb.type = "checkbox"; cb.checked = true; sw.style.background = it[2];
        cb.onchange = function () { it[1].forEach(function (n) { if (meshes[n]) meshes[n].visible = cb.checked; }); };
        l.appendChild(cb); l.appendChild(sw); l.appendChild(document.createTextNode(it[0])); ctl.appendChild(l);
      });
    }).catch(function () { v1.innerHTML = '<p class="vmsg">The 3D model could not load.</p>'; });
  }

  /* Schematic crystal: stacked hexagonal layers with inhibitor markers at step edges */
  var v2 = document.getElementById("v2");
  if (v2) {
    var s2 = stage(v2), layers = 9, i;
    var mat = new THREE.MeshPhongMaterial({ color: 0x5aaeff, transparent: true, opacity: 0.55, shininess: 90, specular: 0xffffff });
    var edge = new THREE.LineBasicMaterial({ color: 0xcfeaff });
    var pin = new THREE.MeshBasicMaterial({ color: 0x4fd1cf });
    for (i = 0; i < layers; i++) {
      var rad = 1 - i * 0.085, geo = new THREE.CylinderGeometry(rad, rad, 0.13, 6);
      var m = new THREE.Mesh(geo, mat); m.position.y = i * 0.15 - 0.6; s2.group.add(m);
      var ln = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edge); ln.position.copy(m.position); s2.group.add(ln);
      for (var k = 0; k < 6; k++) {
        if ((k + i) % 2) continue;
        var a = (k / 6) * Math.PI * 2 + Math.PI / 6, mk = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), pin);
        mk.position.set(Math.cos(a) * (rad - 0.02), m.position.y + 0.09, Math.sin(a) * (rad - 0.02)); s2.group.add(mk);
      }
    }
    s2.setBase(5.2); s2.state.rx = 0.55; s2.start();
  }

  /* Liver, gallbladder and bile ducts from BodyParts3D (CC BY 4.0) via ashemag/human-atlas */
  var v3 = document.getElementById("v3");
  if (v3) {
    fetch("liver.json").then(function (r) { return r.json(); }).then(function (data) {
      var s = stage(v3), colors = { "Liver": 0x2f6ff0, "Gallbladder": 0x4fd1cf, "Bile duct": 0x7fe6c8, "Portal vein": 0x9fd0ff };
      var box = new THREE.Box3(), meshes = {};
      data.parts.forEach(function (p) {
        var g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p.positions, 3));
        g.setIndex(p.indices); g.computeVertexNormals();
        var m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: colors[p.name] || 0x4fa3ff, transparent: true, opacity: p.name === "Liver" ? 0.62 : 0.95, shininess: 70, specular: 0x9fd0ff, side: THREE.DoubleSide }));
        s.group.add(m); (meshes[p.name] = meshes[p.name] || []).push(m); if (p.name === "Liver") box.expandByObject(m);
      });
      var c = box.getCenter(new THREE.Vector3()), sz = box.getSize(new THREE.Vector3());
      s.group.children.forEach(function (m) { m.position.sub(c); });
      s.setBase(Math.max(sz.y, sz.x) * 2.6); s.state.rx = 0.1; s.start();
      var ctl = document.getElementById("v3ctl");
      [["Liver", ["Liver"], "#2f6ff0"], ["Portal vein", ["Portal vein"], "#9fd0ff"], ["Bile ducts", ["Bile duct"], "#7fe6c8"], ["Gallbladder", ["Gallbladder"], "#4fd1cf"]].forEach(function (it) {
        var l = document.createElement("label"), cb = document.createElement("input"), sw = document.createElement("i");
        cb.type = "checkbox"; cb.checked = true; sw.style.background = it[2];
        cb.onchange = function () { it[1].forEach(function (n) { (meshes[n] || []).forEach(function (m) { m.visible = cb.checked; }); }); };
        l.appendChild(cb); l.appendChild(sw); l.appendChild(document.createTextNode(it[0])); ctl.appendChild(l);
      });
    }).catch(function () { v3.innerHTML = '<p class="vmsg">The 3D model could not load.</p>'; });
  }
})();
