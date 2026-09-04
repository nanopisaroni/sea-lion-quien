/* Sea Lion dossier v2 — render editorial + charts + mapa */
(function(){
  "use strict";
  var D = window.SL;

  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function fmtUSD(v){ return v.toLocaleString("es-AR").replace(/,/g,"."); }

  /* ---------- stats row ---------- */
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
      h += '<div class="phase"><span class="phase-tag '+(p.on?'on':'')+'">'+p.tag+'</span><h3>'+p.name+'</h3><p>'+p.p+'</p><div class="pm"><b>'+p.meta+'</b></div></div>';
    });
    g.innerHTML = h;
  }

  /* ---------- charts ---------- */
  function donutSvg(parts, colors){
    // parts: [{v,color}] suma 100; anillo de 60 de radio
    var R = 54, C = 2*Math.PI*R;
    var off = 0, segs = "";
    parts.forEach(function(p){
      var frac = p.v/100;
      segs += '<circle r="'+R+'" cx="75" cy="75" fill="none" stroke="'+p.color+'" stroke-width="26" stroke-dasharray="'+(frac*C)+' '+(C-(frac*C))+'" stroke-dashoffset="'+(-off*C)+'" transform="rotate(-90 75 75)"></circle>';
      off += frac;
    });
    return '<svg class="donut" viewBox="0 0 150 150">'+segs+'<text x="75" y="70" text-anchor="middle" fill="#e9e5db" font-family="JetBrains Mono,monospace" font-size="15" font-weight="700">100%</text><text x="75" y="87" text-anchor="middle" fill="#8b97a4" font-family="JetBrains Mono,monospace" font-size="8.5">del JV</text></svg>';
  }
  function renderJv(){
    var box = el("jvChart");
    var colors = { il:"#58c6d0", uk:"#7d93c7" };
    var parts = D.jvSplit.map(function(x,i){ return { v:x.v, color: i===0?colors.il:colors.uk }; });
    var leg = "";
    D.jvSplit.forEach(function(x,i){
      leg += '<div class="dl-row"><span class="sw" style="background:'+(i===0?colors.il:colors.uk)+'"></span>'+esc(x.l)+'<b>'+x.v+'%</b></div>';
    });
    box.innerHTML = donutSvg(parts) + '<div class="donut-legend">'+leg+'</div>';
  }
  function renderCapex(){
    var c = el("capexChart"), max = 3000, h = "";
    D.capex.forEach(function(x){
      var hgt = Math.round(x.v/max*100);
      h += '<div class="vbar"><span class="vval">'+fmtUSD(x.v)+'</span><div class="vcol" style="height:'+hgt+'%"></div><span class="vlab">'+esc(x.fase)+'</span></div>';
    });
    c.innerHTML = h;
  }
  function renderHoldersNav(){
    var c = el("holdersNavChart"), max = 12, h = "";
    D.holdersNav.forEach(function(x){
      var w = Math.min(100, Math.round(x.pct/max*100));
      h += '<div class="hrow"><div class="hname">'+esc(x.name)+'<small>'+esc(x.note)+'</small></div><div class="htrack"><i style="width:'+w+'%"></i></div><div class="hval">'+x.pct+'%</div></div>';
    });
    c.innerHTML = h;
    el("holdersNavNote").textContent = D.holdersNavNote;
  }
  function renderHoldersRkh(){
    var c = el("holdersRkhChart"), max = 12, h = "";
    D.holdersRkh.forEach(function(x){
      var w = Math.min(100, Math.round(x.pct/max*100));
      h += '<div class="hrow uk"><div class="hname">'+esc(x.name)+'<small>'+esc(x.note)+'</small></div><div class="htrack"><i style="width:'+w+'%"></i></div><div class="hval">'+x.pct+'%</div></div>';
    });
    c.innerHTML = h;
    el("holdersRkhNote").textContent = D.holdersRkhNote;
  }

  /* ---------- timeline ---------- */
  var tlCat = "todas";
  function tlCatLabel(c){ return {proyecto:"Proyecto",corporativo:"Corporativo",argentina:"Argentina",legal:"Legal"}[c]||c; }
  function renderTlFilters(){
    var cats = ["todas","proyecto","corporativo","argentina","legal"], h = "";
    cats.forEach(function(c){ h += '<button class="pill'+(c===tlCat?' active':'')+'" data-cat="'+c+'">'+(c==="todas"?"Todas":tlCatLabel(c))+'</button>'; });
    el("tlFilters").innerHTML = h;
  }
  function renderTl(){
    var c = el("tl"), h = "";
    D.timeline.forEach(function(ev){
      if(tlCat !== "todas" && ev.c !== tlCat) return;
      h += '<div class="tl-item t-'+ev.c+'"><div class="tl-date">'+ev.d+'</div>'
         + '<div class="tl-tags"><span class="tag c-'+ev.c+'">'+tlCatLabel(ev.c)+'</span></div>'
         + '<div class="tl-title" role="button" tabindex="0">'+ev.t+'</div>'
         + '<div class="tl-detail">'+ev.x+'</div></div>';
    });
    c.innerHTML = h || '<p style="color:var(--dim)">Sin eventos para este filtro.</p>';
    Array.prototype.forEach.call(c.querySelectorAll(".tl-item"), function(it){
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
  function flagBadge(f){ return f ? '<span class="flag '+f+'">'+f.toUpperCase()+'</span>' : ""; }
  function confBadge(c){ return c ? '<span class="conf'+(c==="rpt"?" rpt":"")+'">'+(c==="rpt"?"reportado":"confirmado")+'</span>' : ""; }
  function pctCell(p){
    if(p == null) return '<span class="pct">—</span>';
    return '<span class="bar '+(p>20?"rem":"")+'"><i style="width:'+Math.min(100,p)+'%"></i></span><span class="pct">'+p+'%</span>';
  }
  function nodeHtml(n){
    var kids = (n.kids && n.kids.length) ? n.kids : null;
    var h = '<div class="node'+(kids?' open':'')+'">';
    if(kids){
      h += '<button type="button" aria-expanded="true">';
      h += '<span class="arrow">▶</span><span class="nk">';
      h += '<span class="nm">'+esc(n.name)+(n.sub?'<small>'+esc(n.sub)+'</small>':'')+'</span>';
      h += flagBadge(n.flag); h += confBadge(n.conf); h += pctCell(n.pct);
      h += '</span></button><div class="kids">';
      kids.forEach(function(k){ h += nodeHtml(k); });
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
  function renderOwn(){
    var host = el("own");
    function col(title, sub, rootPct, nodes){
      var h = '<div class="own-col"><div class="own-head"><h3>'+title+'</h3><div class="oh-sub">'+sub+'</div></div>';
      h += '<div class="own-root"><span style="font-size:14px;font-weight:600">Participación en el JV</span><span class="pct">'+rootPct+'</span></div>';
      nodes.forEach(function(n){ h += nodeHtml(n); });
      h += '</div>';
      return h;
    }
    var left = col("Navitas Petroleum LP", "Israel · TASE: NVPT · operador 65% vía NPDP (UK)", "65%", D.own.navitas);
    var right = col("Rockhopper Exploration plc", "Reino Unido · AIM: RKH · descubridora 2010 · sin controlante", "35%", D.own.rockhopper);
    host.innerHTML = '<div class="own-root" style="grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;border:1px solid var(--line2)"><span style="font-family:Fraunces,serif;font-size:1.35rem">'+esc(D.own.seaLion.n)+'</span><span class="pct" style="color:var(--amber);font-size:13px">JV al 100%</span></div>'
      + left + right
      + '<p class="own-note">Fuentes: ESG 2024 de Navitas (revela al general partner FLR Oil &amp; Gas Management y a sus holders de control); página oficial de accionistas de Rockhopper al 2-sep-2026; consolidaciones de notificaciones a TASE. Porcentajes a la fecha indicada.</p>';
    host.addEventListener("click", function(e){
      var b = e.target.closest(".node > button"); if(!b) return;
      var node = b.parentElement, kids = node.querySelector(":scope > .kids");
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
    ents.forEach(function(en){ h += '<button class="pill'+(en===perFilter?' active':'')+'" data-ent="'+en+'">'+en+'</button>'; });
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

  /* ---------- causa ---------- */
  function renderCausa(){
    var u = el("causaList"), h = "";
    D.causa.forEach(function(c){ h += '<li><b>'+esc(c.t)+'</b><span>'+esc(c.d)+'</span></li>'; });
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

  /* ---------- mapa ---------- */
  function renderMap(){
    if(typeof L === "undefined" || !el("map")) return;
    var map = L.map("map", { center:[-50.8,-60.5], zoom:6, scrollWheelZoom:false });
    // base OpenStreetMap oscurecida por CSS (sin API key)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:'&copy; OpenStreetMap contributors', maxZoom:12
    }).addTo(map);
    // pane propio para la capa oficial del IGN (queda sin el filtro oscuro)
    map.createPane("ign"); map.getPane("ign").style.zIndex = 420;
    L.tileLayer.wms("https://wms.ign.gob.ar/geoserver/ows", {
      layers:"plataforma_continental", format:"image/png", transparent:true,
      attribution:"Límite plataforma: IGN Argentina · COPLA", opacity:.8, pane:"ign"
    }).addTo(map);

    var m = D.map;
    var ic = function(cls){ return L.divIcon({ className:"", html:'<div class="'+cls+'"></div>', iconSize:[16,16], iconAnchor:[8,8] }); };

    // círculo 200 millas reclamadas por el Reino Unido alrededor de las islas
    L.circle(m.malvinas, { radius:370400, color:"#e9e5db", weight:1.4, dashArray:"4 6", fillColor:"#e9e5db", fillOpacity:0.05 })
      .bindPopup("<b>Zona de 200 millas</b><br>La que el Reino Unido reclama alrededor de las islas ocupadas. La Argentina no la reconoce.").addTo(map);

    // línea de distancia
    L.polyline([m.malvinas, m.sealion], { color:"#e8a33d", weight:1, opacity:.65, dashArray:"3 7" })
      .bindTooltip("≈ 220 km al norte de las islas", { permanent:false }).addTo(map);

    L.marker(m.sealion, { icon: ic("marker-sea") }).addTo(map)
      .bindPopup("<b>Sea Lion</b><br>Proyecto petrolero a ~220 km al norte de las Islas Malvinas, en la plataforma continental argentina. FID: 10-dic-2025. Primer petróleo previsto: marzo 2028.");
    L.marker(m.malvinas, { icon: ic("marker-fi") }).addTo(map)
      .bindPopup("<b>Islas Malvinas</b><br>Territorio argentino ocupado por el Reino Unido desde 1833. Puerto Argentino (al que llaman Stanley) está acá.");
    L.marker(m.tierraFuego, { icon: ic("marker-ar") }).addTo(map)
      .bindPopup("<b>Tierra del Fuego</b><br>Provincia argentina. La base del reclamo — y el lugar elegido para la base naval anunciada el 3 de septiembre de 2026.");

    var legend = el("mapLegend");
    legend.innerHTML =
      '<span class="lg"><span class="sw" style="background:#e8a33d"></span>Proyecto Sea Lion</span>' +
      '<span class="lg"><span class="sw" style="background:#a9c9ea"></span>Islas Malvinas (argentinas, ocupadas)</span>' +
      '<span class="lg"><span class="sw" style="background:#75aadb"></span>Tierra del Fuego</span>' +
      '<span class="lg"><span class="sw" style="background:transparent;border:1px dashed #e9e5db"></span>200 millas reclamadas por el Reino Unido</span>' +
      '<span class="lg"><span class="sw" style="background:rgba(117,170,219,.35);border:1px solid #75aadb"></span>Plataforma continental argentina (capa oficial IGN)</span>';
    setTimeout(function(){ map.invalidateSize(); }, 200);
  }

  /* ---------- init ---------- */
  function init(){
    renderStats(); renderFacts(); renderPhases();
    renderJv(); renderCapex(); renderHoldersNav(); renderHoldersRkh();
    renderTlFilters(); renderTl(); bindTlFilters();
    renderOwn();
    renderPerFilters(); renderPeople(); bindPerFilters();
    renderCausa(); renderDocs(); renderMap();
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
