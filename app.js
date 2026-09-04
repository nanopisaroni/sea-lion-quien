/* Sea Lion dossier — render interactivo */
(function(){
  "use strict";
  var D = window.SL;

  function el(id){ return document.getElementById(id); }

  /* ---------- stats ---------- */
  function renderStats(){
    var g = el("statsGrid"), h = "";
    D.stats.forEach(function(s){ h += '<div class="stat"><span class="stat-num">'+s.n+'</span><span class="stat-label">'+s.l+'</span></div>'; });
    g.innerHTML = h;
  }

  /* ---------- facts + phases ---------- */
  function renderFacts(){
    var u = el("factList"), h = "";
    D.facts.forEach(function(f){ h += '<li><b>'+f.k+'</b><span>'+f.v+'</span></li>'; });
    u.innerHTML = h;
  }
  function renderPhases(){
    var g = el("phaseGrid"), h = "";
    D.phases.forEach(function(p){
      h += '<div class="phase"><span class="phase-tag '+(p.on?'on':'')+'">'+p.tag+'</span><h3>'+p.name+'</h3><p>'+p.p+'</p><div class="pm">'+p.meta+'</div></div>';
    });
    g.innerHTML = h;
  }

  /* ---------- timeline ---------- */
  var tlCat = "todas";
  function tlCatLabel(c){
    return {proyecto:"Proyecto",corporativo:"Corporativo",argentina:"Argentina",legal:"Legal"}[c]||c;
  }
  function renderTlFilters(){
    var cats = ["todas","proyecto","corporativo","argentina","legal"];
    var h = "";
    cats.forEach(function(c){
      h += '<button class="pill'+(c===tlCat?' active':'')+'" data-cat="'+c+'">'+(c==="todas"?"Todas":tlCatLabel(c))+'</button>';
    });
    el("tlFilters").innerHTML = h;
  }
  function renderTl(){
    var c = el("tl"), h = "", shown = 0;
    D.timeline.forEach(function(ev){
      if(tlCat !== "todas" && ev.c !== tlCat) return;
      shown++;
      h += '<div class="tl-item t-'+ev.c+'"><div class="tl-date">'+ev.d+'</div>'
         + '<div class="tl-tags"><span class="tag c-'+ev.c+'">'+tlCatLabel(ev.c)+'</span></div>'
         + '<div class="tl-title" role="button" tabindex="0">'+ev.t+'</div>'
         + '<div class="tl-detail">'+ev.x+'</div></div>';
    });
    c.innerHTML = h || '<p style="color:var(--dim)">Sin eventos para este filtro.</p>';
    var items = c.querySelectorAll(".tl-item");
    Array.prototype.forEach.call(items, function(it){
      var t = it.querySelector(".tl-title");
      t.addEventListener("click", function(){ it.classList.toggle("open"); });
      t.addEventListener("keydown", function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); it.classList.toggle("open"); } });
    });
  }
  function bindTlFilters(){
    el("tlFilters").addEventListener("click", function(e){
      var b = e.target.closest(".pill"); if(!b) return;
      tlCat = b.getAttribute("data-cat");
      renderTlFilters(); renderTl();
    });
  }

  /* ---------- ownership ---------- */
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function flagBadge(f){ return f ? '<span class="flag '+f+'">'+f.toUpperCase()+'</span>' : ""; }
  function confBadge(c){ return c ? '<span class="conf'+(c==="rpt"?" rpt":"")+'">'+(c==="rpt"?"reportado":"confirmado")+'</span>' : ""; }
  function pctCell(p){
    if(p == null) return '<span class="pct">—</span>';
    return '<span class="bar"><i style="width:'+Math.min(100,p)+'%"></i></span><span class="pct">'+p+'%</span>';
  }
  function nodeHtml(n, depth){
    var kids = (n.kids && n.kids.length) ? n.kids : null;
    var openCls = "";
    var h = '<div class="node'+(kids?' open':'')+'">';
    if(kids){
      h += '<button type="button" aria-expanded="true">';
      h += '<span class="arrow">▶</span><span class="nk">';
      h += '<span class="nm">'+esc(n.name)+(n.sub?'<small>'+esc(n.sub)+'</small>':'')+'</span>';
      h += flagBadge(n.flag); h += confBadge(n.conf); h += pctCell(n.pct);
      h += '</span></button>';
      h += '<div class="kids">';
      kids.forEach(function(k){ h += nodeHtml(k, depth+1); });
      h += '</div>';
    } else {
      h += '<div class="nk" style="padding:7px 0 7px 30px">';
      h += '<span class="nm">'+esc(n.name)+(n.sub?'<small>'+esc(n.sub)+'</small>':'')+'</span>';
      h += flagBadge(n.flag); h += confBadge(n.conf); h += pctCell(n.pct);
      h += '</div>';
    }
    h += '</div>';
    return h;
  }
  function colHtml(title, sub, rootLabel, rootSub, rootPct, nodes){
    var h = '<div class="own-col"><div class="own-head"><h3>'+title+'</h3><div class="oh-sub">'+sub+'</div></div>';
    h += '<div class="own-root"><span><strong>'+esc(rootLabel)+'</strong><br><small style="color:var(--dim);font-size:11px">'+esc(rootSub)+'</small></span><span class="pct">'+rootPct+'</span></div>';
    nodes.forEach(function(n){ h += nodeHtml(n, 0); });
    h += '</div>';
    return h;
  }
  function renderOwn(){
    var host = el("own");
    var left = colHtml("Navitas Petroleum LP", "Israel · TASE: NVPT · operador 65% vía NPDP (UK)",
      "Navitas — 65% · operador", "Control de gestión: socio gestor privado (general partner)", "65%", D.own.navitas);
    var right = colHtml("Rockhopper Exploration plc", "Reino Unido · AIM: RKH · descubridora 2010",
      "Rockhopper — 35%", "Sin accionista controlante · ~40% del capital en manos israelíes", "35%", D.own.rockhopper);
    host.innerHTML = '<div class="own-root" style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;background:var(--panel2);border:1px solid var(--line2)"><span style="font-family:Fraunces,serif;font-size:1.3rem">'+esc(D.own.seaLion.n)+'</span><span class="pct" style="color:var(--amber);font-size:13px">100% del JV</span></div>'
      + left + right
      + '<p class="own-note">Fuentes: ESG 2024 de Navitas (revela al general partner FLR Oil &amp; Gas Management y a sus holders de control); página oficial de accionistas de Rockhopper al 2-sep-2026; consolidaciones de notificaciones a TASE. Porcentajes aproximados y a la fecha indicada.</p>';
    host.addEventListener("click", function(e){
      var b = e.target.closest(".node > button"); if(!b) return;
      var node = b.parentElement;
      var kids = node.querySelector(":scope > .kids");
      if(!kids) return;
      var open = kids.style.display !== "none";
      kids.style.display = open ? "none" : "block";
      node.classList.toggle("open", !open);
      b.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ---------- personas ---------- */
  var perFilter = "todas";
  function renderPerFilters(){
    var ents = ["todas"], seen = {};
    D.people.forEach(function(p){ if(!seen[p.ent]){ seen[p.ent]=1; ents.push(p.ent); } });
    var h = "";
    ents.forEach(function(en){
      h += '<button class="pill'+(en===perFilter?' active':'')+'" data-ent="'+en+'">'+en+'</button>';
    });
    el("perFilters").innerHTML = h;
  }
  function renderPeople(){
    var g = el("perGrid"), h = "";
    D.people.forEach(function(p){
      if(perFilter !== "todas" && p.ent !== perFilter) return;
      h += '<div class="pcard"><div class="phead"><div><div class="pname">'+esc(p.name)+'</div>'
         + '<div class="pent">'+esc(p.ent)+'</div></div>'+flagBadge(p.flag)+'</div>'
         + '<div class="prol">'+esc(p.rol)+'</div>'
         + '<div class="pnote">'+esc(p.note)+'</div>'
         + '<div class="pmeta">'+confBadge(p.conf)+'</div></div>';
    });
    g.innerHTML = h || '<p style="color:var(--dim)">Sin resultados.</p>';
  }
  function bindPerFilters(){
    el("perFilters").addEventListener("click", function(e){
      var b = e.target.closest(".pill"); if(!b) return;
      perFilter = b.getAttribute("data-ent");
      renderPerFilters(); renderPeople();
    });
  }

  /* ---------- argentina ---------- */
  function renderArg(){
    var u = el("argList"), h = "";
    D.argentina.forEach(function(a){ h += '<li><b>'+a.k+'</b><span>'+a.v+'</span></li>'; });
    u.innerHTML = h;
    var s = el("argStrip"), h2 = "";
    D.argStrip.forEach(function(a){ h2 += '<div class="argcard"><div class="ah">'+a.h+'</div><div class="ab">'+a.b+'</div></div>'; });
    s.innerHTML = h2;
  }

  /* ---------- docs ---------- */
  function renderDocs(){
    var c = el("docs"), h = "";
    D.docs.forEach(function(dc, i){
      var link = dc.local
        ? '<a class="dlink" href="'+dc.local+'" download>Descargar PDF</a>'
        : '<a class="dlink" href="'+dc.url+'" target="_blank" rel="noopener">Abrir fuente</a>';
      h += '<div class="docrow"><span class="dnum">'+(i+1)+'</span><div class="dbody">'
         + '<div class="dtitle">'+esc(dc.t)+'</div><div class="ddesc">'+esc(dc.d)+'</div>'
         + '<div class="dsrc">'+esc(dc.s)+'</div></div>'+link+'</div>';
    });
    c.innerHTML = h;
  }

  /* ---------- init ---------- */
  function init(){
    renderStats(); renderFacts(); renderPhases();
    renderTlFilters(); renderTl(); bindTlFilters();
    renderOwn();
    renderPerFilters(); renderPeople(); bindPerFilters();
    renderArg(); renderDocs();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
