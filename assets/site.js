/* ============================================================
   CONFIGURACIÓN — edita aquí
   ============================================================ */
const CONFIG = {
  whatsapp: "17279991429",      // número con código de país, solo dígitos
  instagram: "https://www.instagram.com/arraigo.ve/",  // @arraigo.ve
  rif: "J-508703294",
  currency: "USD",
  payments: ["Pago Móvil", "Zelle", "USDT (Binance)", "Efectivo USD"],
  bsPayments: ["Pago Móvil"],   // estos métodos usan el precio en bolívares (tasa BCV)
  bcvRateUrl: "https://andresfok.github.io/bcv-rate-pull/rate.json",  // tasa BCV diaria (proyecto bcv-rate-pull)
  bcvMaxAgeDays: 3,             // si la tasa tiene más días, no se muestran montos en Bs
  shipping: ["Delivery La Guaira", "Delivery Caracas", "Retiro en Punta de Mulatos"],
  // Integración futura con importador-venezuela:
  cristofueAudio: "media/cristofue.mp3",  // Grabación XC1183815 de Paola Facundo (xeno-canto), usada con su permiso para uso comercial. null oculta el botón.
  ordersEndpoint: null,         // ej: "https://api.tudominio.com/orders"  (POST del pedido)
  inventoryEndpoint: null       // ej: "https://api.tudominio.com/inventory?brand=arraigo" (GET stock por SKU)
};

/* price = precio en divisas (efectivo, Zelle, USDT). priceBs = precio en bolívares, en USD a tasa BCV del día. Ambos con IVA.
   price: null = aún sin precio publicado (se confirma por WhatsApp)
   stock: null = no se muestra · 0 = agotado · n = unidades disponibles */
const PRODUCTS = [
  { id:"tote-marea", name:["Tote","Marea"], kind:"Tote Marea", line:"El bolso que agarras sin pensarlo: le cabe todo, se para solo y se lava con agua.", price:null,
    /* Tamaños: precio y peso por tamaño. Para vender el pequeño (450 g), quita las // de su línea. */
    sizes:[
      /* dims: ancho × alto × fondo en cm */
      { id:"grande",  code:"G", name:"Grande",  weight:1300, dims:[48,34,23], fits:"Cabe una laptop de 15\", el mercado de la semana o todo lo de un día de playa.", price:33, priceBs:40 },
      { id:"mediano", code:"M", name:"Mediano", weight:820,  dims:[38,31,13], fits:"Cabe una laptop de 13\", un cuaderno y tu termo. Ideal para clases, la oficina o hacer diligencias en el banco.", price:28, priceBs:35 },
      // { id:"pequeno", code:"P", name:"Pequeño", weight:450, dims:[28,21,11], fits:"Para lo básico: cartera, teléfono, llaves y lentes.", price:null },
    ],
    variants:[
      { id:"verde-palma", sku:"ARR-MAREA-VP", name:"Verde Palma", hex:"#1E9A5E", img:"img2/p-verde.webp", note:"La sombra del cocotero al mediodía", stock:null },
      { id:"coral",       sku:"ARR-MAREA-CO", name:"Coral",       hex:"#EF5A49", img:"img2/p-coral.webp", note:"Las flores de la costa", stock:null },
      { id:"cielo",       sku:"ARR-MAREA-CI", name:"Cielo",       hex:"#2D9CEA", img:"img2/p-cielo.webp", note:"La mañana antes del sol", stock:null }
    ]},
  { id:"hydro-jug", name:["Termo","Ávila"], kind:"Con asa · 890 ml", line:"Para el que sale temprano y vuelve tarde. Lo cuelgas de la mano y te acompaña todo el día.", price:19, priceBs:23,
    variants:[ { id:"avila", sku:"ARR-TERMO-AV", name:"Ávila", hex:"#2F4A3F", img:"img2/p-jug.webp", note:"El mediodía en la montaña", stock:null } ],
    /* Colección "Un día en la montaña": colores que vienen. Al llegar, muévelos a variants con su foto y SKU. */
    soon:[ { name:"Neblina", hex:"#7D8896" }, { name:"Atardecer", hex:"#C8643C" }, { name:"Anochecer", hex:"#1F2B57" } ]},
  { id:"tropical-wings", name:["Sombrero","Cristofué"], kind:"Tejido natural · Ala ancha", line:"Sombra de verdad para los días de sol fuerte, con el cristofué escondido bajo el ala.", price:23, priceBs:28,
    variants:[ { id:"cristofue", sku:"ARR-SOMB-CR", name:"Tejido natural", hex:"#C9A46A", img:"img2/p-hat.webp", note:"Con parche bordado y estampado bajo el ala", stock:null } ]}
];

const IG_POSTS = ["img/ig-marea.jpg","img/ig-esenciales.jpg","img/ig-coral.jpg"];

/* ============================================================ */
const $ = s => document.querySelector(s);
/* Páginas en subcarpetas (/tote-marea/ …) declaran data-base="../" en <html> para encontrar imágenes y audio */
const BASE = document.documentElement.dataset.base || "";
PRODUCTS.forEach(p => p.variants.forEach(v => { v.img = BASE + v.img; }));
const fmt = n => "$" + (Math.round(n*100)/100).toFixed(2).replace(/\.00$/,"");
const bloomSvg = '<svg viewBox="0 0 1152 925" fill="var(--sun)"><use href="#bloom"/></svg>';
const findP = id => PRODUCTS.find(p => p.id === id);
const findV = (p, vid) => p.variants.find(v => v.id === vid);
const waBase = () => CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : "https://wa.me/";
const waLink = text => `${waBase()}?text=${encodeURIComponent(text)}`;

let changed = null;
let cart = [];
try { cart = JSON.parse(localStorage.getItem("arraigo-cart") || "[]"); } catch(e) { cart = []; }
const save = () => { try { localStorage.setItem("arraigo-cart", JSON.stringify(cart)); } catch(e) {} };
const selected = {}; PRODUCTS.forEach(p => selected[p.id] = p.variants[0].id);
const selSize = {}; PRODUCTS.forEach(p => { if (p.sizes) selSize[p.id] = p.sizes[0].id; });
const findS = (p, sid) => p.sizes ? (p.sizes.find(z => z.id === sid) || p.sizes[0]) : null;
const unitPrice = (p, z) => (z && z.price != null) ? z.price : p.price;
const unitPriceBs = (p, z) => (z && z.priceBs != null) ? z.priceBs : p.priceBs;
const isBsPay = pay => (CONFIG.bsPayments||[]).includes(pay);
let payChoice = CONFIG.payments[0];
const priceOf = (p, z, pay) => isBsPay(pay) ? unitPriceBs(p, z) : unitPrice(p, z);
/* Tasa BCV del día (se carga al abrir la página; si falla, se muestran los precios en USD a tasa BCV) */
let BCV = null; // { rate: Number, date: "AAAA-MM-DD" }
const fmtBs = (n, dec=0) => "Bs " + n.toLocaleString("es-VE", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtDate = iso => { const [y,m,d] = iso.split("-"); return `${d}/${m}/${y}`; };
const bcvLine = () => BCV ? `Tasa BCV: ${BCV.rate.toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2})} Bs/$ · ${fmtDate(BCV.date)}` : "";
async function loadBcv(){
  if(!CONFIG.bcvRateUrl) return;
  try{
    const r = await fetch(CONFIG.bcvRateUrl, { cache: "no-store" }); if(!r.ok) return;
    const d = await r.json(); const rate = parseFloat(d.rate); const date = String(d.date_ve||"");
    if(!(rate > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    const age = (Date.now() - Date.parse(date + "T00:00:00-04:00")) / 864e5;
    if(age > CONFIG.bcvMaxAgeDays + 1) return;
    BCV = { rate, date };
    document.querySelectorAll("[data-bcv-line]").forEach(el => { el.textContent = bcvLine(); el.hidden = false; });
    renderMarea(); renderJug(); renderHat(); renderDay(); renderCart();
  }catch(e){}
}
function priceBlock(p, z){
  const d=unitPrice(p,z), b=unitPriceBs(p,z);
  if(d==null) return `<span class="price tbd">Precio al confirmar<br>por WhatsApp</span>`;
  const bs = b==null ? "" : (BCV
    ? `<span class="pp alt"><span class="price">${fmtBs(b*BCV.rate)}</span><small>en bolívares · ${fmt(b)} a tasa BCV</small></span>`
    : `<span class="pp alt"><span class="price">${fmt(b)}</span><small>en bolívares, tasa BCV</small></span>`);
  return `<span class="pp"><span class="price">${fmt(d)}</span><small>en divisas</small></span>${bs}`;
}
const skuOf = (v, z) => z ? `${v.sku}-${z.code}` : v.sku;
const dimsTxt = z => z && z.dims ? `${z.dims.join(" × ")} cm` : "";
const kg = g => (g/1000).toLocaleString("es-VE",{minimumFractionDigits:g%1000?2:0,maximumFractionDigits:2}).replace(/0$/,"") + " kg";

function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("on"); clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("on"),2200); }

function stockLabel(v){
  if (v.stock === null || v.stock === undefined) return "";
  if (v.stock <= 0) return '<span class="stock out">Agotado</span>';
  if (v.stock <= 5) return `<span class="stock">Quedan ${v.stock}</span>`;
  return '<span class="stock">Disponible</span>';
}

function renderGrid(){
  if(!$("#grid")) return;
  $("#grid").innerHTML = PRODUCTS.map(p => {
    const v = findV(p, selected[p.id]);
    const sw = p.variants.length > 1 ? `<div class="swatches" role="group" aria-label="Color">${p.variants.map(x=>`<button class="sw" style="--c:${x.hex}" aria-label="${x.name}" aria-pressed="${x.id===v.id}" data-sw="${p.id}:${x.id}"></button>`).join("")}<span class="sw-name">${v.name}</span></div>`
      : `<div class="swatches"><span class="sw" style="--c:${v.hex}" aria-hidden="true"></span><span class="sw-name">${v.name}</span></div>`;
    const out = v.stock !== null && v.stock !== undefined && v.stock <= 0;
    const z = findS(p, selSize[p.id]);
    const sizes = p.sizes ? `<div class="sizes" role="group" aria-label="Tamaño">${p.sizes.map(x=>`<button class="sz" aria-pressed="${x.id===z.id}" data-sz="${p.id}:${x.id}">${x.name}<small>${dimsTxt(x)}</small><small>${x.weight.toLocaleString("es-VE")} g</small></button>`).join("")}</div>` : "";
    const price = unitPrice(p, z);
    return `<article class="card" id="card-${p.id}">
      <div class="ph"><img class="${changed===p.id?"swap":""}" src="${v.img}" alt="${p.name.join(" ")} color ${v.name}" loading="lazy" width="900" height="900"><span class="kind">${p.kind}</span></div>
      <div class="body">
        <h3><span class="lock"><b>${p.name[0]}</b> <i>${p.name[1]}</i></span></h3>
        <p class="line" style="margin:0">${p.line}</p>
        ${sw}
        ${sizes}
        <div class="buy">
          <div class="prices">${priceBlock(p,z)}${stockLabel(v)}</div>
          <button class="btn btn-ink" data-add="${p.id}:${v.id}" ${out?"disabled":""}>${out?"Agotado":"Agregar"}</button>
        </div>
      </div></article>`;
  }).join("");
}

function renderMarea(){
  if(!$("#mareaPicker")) return;
  const p = findP("tote-marea");
  const v = findV(p, selected[p.id]); const z = findS(p, selSize[p.id]); const price = unitPrice(p, z);
  const out = v.stock !== null && v.stock !== undefined && v.stock <= 0;
  $("#mareaPicker").innerHTML = `
    <div class="pk-stage"><img class="${changed===p.id?"swap":""}" src="${v.img}" alt="Tote Marea color ${v.name}" width="1000" height="1000"></div>
    <div class="pk-name"><b>${v.name}</b><small>${v.note}</small></div>
    <div class="pk-row"><span>Color</span><div class="pk-colors" role="group" aria-label="Color">${p.variants.map(x=>`<button class="sw" style="--c:${x.hex}" aria-label="${x.name}" aria-pressed="${x.id===v.id}" data-sw="${p.id}:${x.id}"></button>`).join("")}</div></div>
    <div class="pk-row"><span>Tamaño</span><div class="sizes" role="group" aria-label="Tamaño">${p.sizes.map(x=>`<button class="sz" aria-pressed="${x.id===z.id}" data-sz="${p.id}:${x.id}">${x.name}<small>${dimsTxt(x)}</small><small>${x.weight.toLocaleString("es-VE")} g</small></button>`).join("")}</div>
      <p class="pk-fit"><b>${z.name}: ${dimsTxt(z)}</b> <span>(ancho × alto × fondo)</span><br>${z.fits}</p></div>
    <div class="pk-buy"><div class="prices">${priceBlock(p,z)}${stockLabel(v)}</div>
      <button class="btn btn-sun" data-add="${p.id}:${v.id}" ${out?"disabled":""}>${out?"Agotado":"Agregar al carrito"}</button></div>`;
}

/* Pesos de referencia del fabricante (gramos): nuestro modelo vs. rango típico del mercado */
const MARKET_WEIGHTS = { grande:[960,1150], mediano:[600,750], pequeno:[380,410] };
function renderSizeBar(){
  const p = findP("tote-marea"); const el = $("#sizeBars"); if(!el) return;
  const max = Math.max(...p.sizes.map(z=>Math.max(z.weight, (MARKET_WEIGHTS[z.id]||[0,0])[1])));
  el.innerHTML = p.sizes.map(z=>{ const m=MARKET_WEIGHTS[z.id]; if(!m) return "";
    const pct=v=>(v/max*100).toFixed(1)+"%";
    return `<div class="bar-group"><h4>Tamaño ${z.name.toLowerCase()} <em>+${(z.weight-m[1]).toLocaleString("es-VE")} g de material</em></h4>
      <div class="bar ours"><b>Tote Marea</b><div class="track"><div class="fill" style="width:${pct(z.weight)}"></div></div><span class="v">${z.weight.toLocaleString("es-VE")} g</span></div>
      <div class="bar them"><span>Otros bolsos</span><div class="track"><div class="fill" style="width:${pct(m[1])}"></div></div><span class="v">${m[0]}–${m[1].toLocaleString("es-VE")} g</span></div></div>`; }).join("")
    + `<span class="src">Pesos de referencia del fabricante. La barra gris llega hasta el peso del más pesado entre otros bolsos de este tipo del mismo tamaño.</span>`;
}

function renderJug(){
  if(!$("#jugPicker")) return;
  const p = findP("hydro-jug"); const v = findV(p, selected[p.id]);
  const out = v.stock !== null && v.stock !== undefined && v.stock <= 0;
  $("#jugPicker").innerHTML = `
    <div class="pk-stage light"><img src="${v.img}" alt="Termo Ávila color ${v.name}" width="1000" height="1000"></div>
    <div class="pk-name"><b>${v.name}</b><small>${v.note}</small></div>
    <div class="pk-row"><span>Color</span><div class="pk-colors" role="group" aria-label="Color">${p.variants.map(x=>`<button class="sw" style="--c:${x.hex}" aria-label="${x.name}" aria-pressed="true"></button>`).join("")}</div>
      <div class="pk-soon"><span>Próximamente</span>${(p.soon||[]).map(x=>`<a href="${waLink(`¡Hola Arraigo! Avísenme cuando llegue el Termo Ávila color ${x.name}.`)}" target="_blank" rel="noopener"><i style="--c:${x.hex}"></i>${x.name}<small>Avísame</small></a>`).join("")}</div></div>
    <div class="pk-row"><span>Capacidad</span><p class="pk-capt">890 ml <small>· 30 oz</small></p></div>
    <div class="pk-buy"><div class="prices">${priceBlock(p,null)}${stockLabel(v)}</div>
      <button class="btn btn-sun" data-add="${p.id}:${v.id}" ${out?"disabled":""}>${out?"Agotado":"Agregar al carrito"}</button></div>`;
}
/* Unboxing video: plays only while visible, never with reduced motion */
(function(){ const vid=document.getElementById("jugVideo"); if(!vid) return;
  const calm=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(calm){ vid.controls=true; return; }
  if("IntersectionObserver" in window){ new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ vid.play().catch(()=>{ vid.controls=true; }); } else vid.pause(); }),{threshold:.35}).observe(vid); }
  else { vid.controls=true; }
})();

let hatView="frente", hatSwap=false;
function renderHat(){
  if(!$("#hatPicker")) return;
  const p = findP("tropical-wings"); const v = findV(p, selected[p.id]);
  const out = v.stock !== null && v.stock !== undefined && v.stock <= 0;
  $("#hatPicker").innerHTML = `
    <div class="pk-stage light"><img class="${hatSwap?"swap":""}" src="${hatView==="ala"?BASE+"img2/p-hat-under.webp":v.img}" alt="${hatView==="ala"?"Interior del ala del Sombrero Cristofué, con estampado tropical":"Sombrero Cristofué tejido, con el parche del cristofué"}" width="1000" height="1000"></div>
    <div class="pk-row"><span>Ver</span><div class="sizes" role="group" aria-label="Vista">${[["frente","Frente","El parche bordado"],["ala","Bajo el ala","El estampado"]].map(([id,n,d])=>`<button class="sz" aria-pressed="${hatView===id}" data-hatview="${id}">${n}<small>${d}</small></button>`).join("")}</div></div>
    <div class="pk-name"><b>${v.name}</b><small>${v.note}</small></div>
    <div class="pk-row"><span>Talla</span><p class="pk-capt">Única <small>· 56–58 cm</small></p>
      <p class="pk-fit">¿Te queda? Mide con una cinta métrica alrededor de la cabeza, justo encima de las cejas y las orejas. Si da entre 56 y 58 cm, es tu talla.</p></div>
    <div class="pk-buy"><div class="prices">${priceBlock(p,null)}${stockLabel(v)}</div>
      <button class="btn btn-sun" data-add="${p.id}:${v.id}" ${out?"disabled":""}>${out?"Agotado":"Agregar al carrito"}</button></div>`;
}
/* Canto del cristofué: el botón aparece solo cuando CONFIG.cristofueAudio tiene un archivo */
(function(){ const slot=document.getElementById("birdPlay"); if(!slot||!CONFIG.cristofueAudio) return;
  const a=new Audio(BASE+CONFIG.cristofueAudio); a.preload="none";
  slot.innerHTML='<button class="play" type="button" aria-pressed="false"><i></i>Escúchalo cantar</button>';
  const b=slot.querySelector("button");
  b.addEventListener("click",()=>{ if(a.paused){ a.currentTime=0; a.play().then(()=>b.setAttribute("aria-pressed","true")).catch(()=>{}); } else { a.pause(); b.setAttribute("aria-pressed","false"); } });
  a.addEventListener("ended",()=>b.setAttribute("aria-pressed","false"));
})();

function renderDay(){
  document.querySelectorAll("[data-from]").forEach(el=>{
    const p=findP(el.dataset.from); if(!p) return;
    const zs=p.sizes||[null];
    const d=zs.map(z=>unitPrice(p,z)).filter(x=>x!=null), b=zs.map(z=>unitPriceBs(p,z)).filter(x=>x!=null);
    if(!d.length){ el.textContent=""; return; }
    const from=(p.sizes&&d.length>1)?"Desde ":"";
    const mb=b.length?Math.min(...b):null;
    el.innerHTML=`${from}${fmt(Math.min(...d))}<small>${mb==null?"":(BCV?`${from}${fmtBs(mb*BCV.rate)} en bolívares`:`${fmt(mb)} en Bs (BCV)`)}</small>`;
  });
}

function count(){ return cart.reduce((a,i)=>a+i.qty,0); }

function add(pid, vid, qty=1){
  const p=findP(pid), v=p && findV(p,vid); if(!v) return;
  if (v.stock !== null && v.stock !== undefined && v.stock <= 0) { toast(`${p.name.join(" ")} ${v.name} está agotado`); return; }
  const z = findS(p, selSize[pid]); const sid = z ? z.id : null;
  const it = cart.find(i=>i.pid===pid && i.vid===vid && (i.sid||null)===sid);
  if (it) it.qty += qty; else cart.push({pid,vid,sid,qty});
  save(); renderCart(); toast(`Agregado: ${p.name.join(" ")} · ${v.name}${z?` · ${z.name}`:""}`);
}

function lines(){
  return cart.map(i=>{ const p=findP(i.pid), v=p&&findV(p,i.vid); if(!p||!v) return null; const z=findS(p,i.sid); return {...i,p,v,z,price:priceOf(p,z,payChoice),sku:skuOf(v,z),label:v.name+(z?` · ${z.name} (${dimsTxt(z)})`:"")}; }).filter(Boolean);
}

function renderCart(){
  $("#cartCount").textContent = count();
  const L = lines();
  if (!L.length){
    $("#cartBody").innerHTML = `<div class="empty">${bloomSvg}<b>Tu carrito está vacío</b><span>Elige un color y toca Agregar.</span><a class="btn btn-ink" href="#tienda" id="goShop">Ir a la tienda</a></div>`;
    $("#cartFoot").innerHTML = "";
    $("#goShop").onclick = closeCart;
    return;
  }
  const allPriced = L.every(l=>l.price!=null);
  const inBs = isBsPay(payChoice) && !!BCV;
  const money = n => inBs ? fmtBs(n*BCV.rate, 2) : fmt(n);
  const total = L.reduce((a,l)=>a+(l.price||0)*l.qty,0);
  const keep = readForm();
  if(keep) keep.pay = payChoice;
  $("#cartBody").innerHTML = L.map((l,ix)=>`
    <div class="item">
      <img src="${l.v.img}" alt="">
      <div><b>${l.p.name.join(" ")}</b><small>${l.label} · ${l.sku}</small><br>
        <span class="qty"><button aria-label="Quitar uno" data-q="${ix}:-1">−</button><span>${l.qty}</span><button aria-label="Agregar uno" data-q="${ix}:1">+</button></span></div>
      <div><div class="lp">${l.price!=null?money(l.price*l.qty):"—"}</div><button class="rm" data-rm="${ix}">Quitar</button></div>
    </div>`).join("") + `
    <div class="totals"><span>Subtotal <small>· ${count()} ${count()===1?"artículo":"artículos"}</small></span>${allPriced?`<b>${money(total)}</b>`:`<small>Se confirma por WhatsApp</small>`}</div>
    <p class="paynote">${isBsPay(payChoice)?(inBs?`Total en bolívares (${fmt(total)} a tasa BCV). ${bcvLine()}. El monto final se ajusta a la tasa BCV del día del pago. Pagando en divisas el total es menor.`:`Precio en bolívares: pagas el equivalente en Bs a la tasa BCV del día. Pagando en divisas el total es menor.`):`Precio en divisas (efectivo, Zelle o USDT).`} Precios con IVA incluido. Al mayor: te enviamos los precios por WhatsApp.</p>
    <form class="checkout" id="checkout" novalidate>
      <h4>Tus datos</h4>
      <div class="field"><label for="f-name">Nombre y apellido</label><input id="f-name" name="name" autocomplete="name" required></div>
      <div class="row2">
        <div class="field"><label for="f-phone">Teléfono</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" placeholder="0412 123 4567" required></div>
        <div class="field"><label for="f-city">Zona o sector</label><input id="f-city" name="city" placeholder="Ej: Catia La Mar, La Guaira" required></div>
      </div>
      <div class="row2">
        <div class="field"><label for="f-ship">Entrega</label><select id="f-ship" name="ship">${CONFIG.shipping.map(s=>`<option>${s}</option>`).join("")}</select></div>
        <div class="field"><label for="f-pay">Pago</label><select id="f-pay" name="pay">${CONFIG.payments.map(s=>`<option>${s}</option>`).join("")}</select></div>
      </div>
      <div class="field"><label for="f-notes">Nota (opcional)</label><input id="f-notes" name="notes" placeholder="Ej: es para regalo"></div>
      <label class="check"><input type="checkbox" id="f-mayor" name="mayor"> Es una compra al mayor</label>
    </form>`;
  writeForm(keep);
  if(!keep && $("#checkout")) $("#checkout").pay.value = payChoice;
  $("#cartFoot").innerHTML = `
    <div class="err" id="err"></div>
    <a class="btn btn-sun" id="sendWa" href="#" target="_blank" rel="noopener">Enviar pedido por WhatsApp</a>
    <button class="btn btn-ghost" id="copyMsg" type="button">Copiar pedido</button>
    <div class="msg-preview" id="msgPrev"></div>`;
  wireCheckout();
}

function readForm(){
  const f = $("#checkout"); if(!f) return null;
  return {name:f.name.value.trim(), phone:f.phone.value.trim(), city:f.city.value.trim(), ship:f.ship.value, pay:f.pay.value, notes:f.notes.value.trim(), mayor:f.mayor.checked};
}
function writeForm(d){ if(!d) return; const f=$("#checkout"); f.name.value=d.name; f.phone.value=d.phone; f.city.value=d.city; f.ship.value=d.ship; f.pay.value=d.pay; f.notes.value=d.notes; f.mayor.checked=d.mayor; }

/* Pedido estructurado: este mismo objeto se enviará a importador-venezuela */
function buildOrder(){
  const d = readForm() || {};
  const L = lines();
  const now = new Date();
  const id = "ARR-" + now.toISOString().slice(2,10).replace(/-/g,"") + "-" + Math.random().toString(36).slice(2,6).toUpperCase();
  return {
    id, brand:"arraigo", channel:"web", createdAt: now.toISOString(),
    type: d.mayor ? "mayor" : "detal",
    customer:{ name:d.name, phone:d.phone, city:d.city },
    shipping:d.ship, payment:d.pay, notes:d.notes || "",
    items: L.map(l=>({ sku:l.sku, product:l.p.name.join(" "), color:l.v.name, size:l.z?l.z.name:null, qty:l.qty, unitPrice:l.price })),
    currency: CONFIG.currency,
    priceList: isBsPay(d.pay) ? "bolivares_bcv" : "divisas",
    bcvRate: BCV ? BCV.rate : null, bcvDate: BCV ? BCV.date : null,
    subtotal: L.every(l=>l.price!=null) ? L.reduce((a,l)=>a+l.price*l.qty,0) : null
  };
}
function orderText(o){
  const bsMsg = o.priceList==="bolivares_bcv" && o.bcvRate;
  const m = n => bsMsg ? fmtBs(n*o.bcvRate, 2) : fmt(n);
  const items = o.items.map(i=>`• ${i.qty} × ${i.product} — ${i.color}${i.size?` (${i.size})`:""}${i.unitPrice!=null?` (${m(i.unitPrice*i.qty)})`:""}`).join("\n");
  return `¡Hola Arraigo! Quiero hacer este pedido${o.type==="mayor"?" al mayor":""}:\n\n${items}\n\n${o.type==="mayor"?`Precio al mayor: por favor envíenme la lista.\n`:(o.subtotal!=null?(bsMsg?`Subtotal en bolívares: ${m(o.subtotal)} (${fmt(o.subtotal)} a tasa BCV ${o.bcvRate.toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2})} del ${fmtDate(o.bcvDate)}). Monto a confirmar con la tasa del día del pago.\n`:`Subtotal ${o.priceList==="divisas"?"en divisas":"en Bs a tasa BCV"}: ${fmt(o.subtotal)}\n`):"")}Nombre: ${o.customer.name}\nTeléfono: ${o.customer.phone}\nZona: ${o.customer.city}\nEntrega: ${o.shipping}\nPago: ${o.payment}${o.notes?`\nNota: ${o.notes}`:""}\n\nPedido ${o.id}`;
}
function validate(){
  const d=readForm(); const miss=[];
  if(!d.name) miss.push("nombre"); if(!d.phone) miss.push("teléfono"); if(!d.city) miss.push("zona");
  return miss;
}
function wireCheckout(){
  const a=$("#sendWa"), err=$("#err");
  const refresh=()=>{ const o=buildOrder(); a.href=waLink(orderText(o)); };
  $("#checkout").addEventListener("input",()=>{ err.textContent=""; refresh(); });
  $("#checkout").addEventListener("submit",e=>e.preventDefault());
  $("#f-pay").addEventListener("change",e=>{ payChoice=e.target.value; renderCart(); });
  refresh();
  a.addEventListener("click",e=>{
    const miss=validate();
    if(miss.length){ e.preventDefault(); err.textContent=`Completa tu ${miss.join(", ")} para enviar el pedido.`; return; }
    const o=buildOrder(); a.href=waLink(orderText(o));
    $("#msgPrev").textContent=orderText(o); $("#msgPrev").classList.add("on");
    if (CONFIG.ordersEndpoint) { fetch(CONFIG.ordersEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)}).catch(()=>{}); }
  });
  $("#copyMsg").addEventListener("click",()=>{
    const miss=validate(); if(miss.length){ err.textContent=`Completa tu ${miss.join(", ")} para copiar el pedido.`; return; }
    const t=orderText(buildOrder()); const prev=$("#msgPrev"); prev.textContent=t; prev.classList.add("on");
    navigator.clipboard.writeText(t).then(()=>toast("Pedido copiado")).catch(()=>{ const r=document.createRange(); r.selectNodeContents(prev); const s=getSelection(); s.removeAllRanges(); s.addRange(r); toast("Pedido seleccionado, cópialo"); });
  });
}

function openCart(){ $("#cart").classList.add("on"); $("#scrim").classList.add("on"); $("#cart").setAttribute("aria-hidden","false"); $("#closeCart").focus(); }
function closeCart(){ $("#cart").classList.remove("on"); $("#scrim").classList.remove("on"); $("#cart").setAttribute("aria-hidden","true"); }

document.addEventListener("click",e=>{
  const op=e.target.closest("[data-open]"); if(op){ const d=document.getElementById(op.dataset.open); if(d){ e.preventDefault(); d.open=true; const t=document.querySelector(op.getAttribute("href"))||d; t.scrollIntoView({behavior:"smooth",block:"start"}); } return; }
  const hv=e.target.closest("[data-hatview]"); if(hv){ hatView=hv.dataset.hatview; hatSwap=true; renderHat(); hatSwap=false; document.querySelector(`[data-hatview="${hatView}"]`)?.focus(); return; }
  const sz=e.target.closest("[data-sz]"); if(sz){ const [p,z]=sz.dataset.sz.split(":"); selSize[p]=z; renderGrid(); renderMarea(); renderSizeBar(); (sz.closest(".picker")?document.querySelector(`.picker [data-sz="${p}:${z}"]`):document.querySelector(`.grid [data-sz="${p}:${z}"]`))?.focus(); return; }
  const sw=e.target.closest("[data-sw]"); if(sw){ const inPicker=!!sw.closest(".picker"); const [p,v]=sw.dataset.sw.split(":"); selected[p]=v; changed=p; renderGrid(); renderMarea(); changed=null; if(inPicker){ document.querySelector(`.picker [data-sw="${p}:${v}"]`)?.focus(); return; } document.querySelector(`[data-sw="${p}:${v}"]`)?.focus(); return; }
  const ad=e.target.closest("[data-add]"); if(ad){ const [p,v]=ad.dataset.add.split(":"); add(p,v); return; }
  const pk=e.target.closest("[data-pick]"); if(pk){ const [p,v]=pk.dataset.pick.split(":"); selected[p]=v; renderGrid(); return; }
  const q=e.target.closest("[data-q]"); if(q){ const [ix,d]=q.dataset.q.split(":").map(Number); cart[ix].qty+=d; if(cart[ix].qty<=0) cart.splice(ix,1); save(); renderCart(); return; }
  const rm=e.target.closest("[data-rm]"); if(rm){ cart.splice(+rm.dataset.rm,1); save(); renderCart(); return; }
});
$("#openCart").onclick=openCart; $("#closeCart").onclick=closeCart; $("#scrim").onclick=closeCart;
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeCart(); });

/* Inventario en vivo (cuando importador-venezuela exponga el endpoint) */
async function loadInventory(){
  if(!CONFIG.inventoryEndpoint) return;
  try{
    const r = await fetch(CONFIG.inventoryEndpoint); const data = await r.json(); // [{sku, stock, price?}]
    data.forEach(row=>PRODUCTS.forEach(p=>p.variants.forEach(v=>{ if(v.sku===row.sku){ v.stock=row.stock; if(row.price!=null) p.price=row.price; } })));
    renderGrid(); renderMarea(); renderJug(); renderHat(); renderCart();
  }catch(e){}
}

/* static bits (cada página tiene solo algunas de estas piezas) */
const setEl=(sel,f)=>{ const el=$(sel); if(el) f(el); };
setEl("#payChips", el=>el.innerHTML = CONFIG.payments.map(s=>`<span>${s}</span>`).join(""));
setEl("#shipChips", el=>el.innerHTML = CONFIG.shipping.map(s=>`<span>${s}</span>`).join(""));
setEl("#igRow", el=>el.innerHTML = IG_POSTS.map(src=>`<a href="${CONFIG.instagram}" target="_blank" rel="noopener"><img src="${BASE+src}" alt="Publicación de Arraigo en Instagram" loading="lazy" width="700" height="875"></a>`).join(""));
["#igLink","#igFoot"].forEach(s=>setEl(s, el=>el.href=CONFIG.instagram));
setEl("#waFoot", el=>el.href = waBase());
setEl("#mayorLink", el=>el.href = waLink("¡Hola Arraigo! Me interesa comprar al mayor. ¿Me envían la lista de precios por volumen?"));
setEl("#yr", el=>el.textContent = new Date().getFullYear());
setEl("#rif", el=>el.textContent = CONFIG.rif);

renderGrid(); renderMarea(); renderJug(); renderHat(); renderDay(); renderSizeBar(); renderCart(); loadInventory(); loadBcv();
