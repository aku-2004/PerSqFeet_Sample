/* ---------- Ticker content (signature element) ---------- */
const tickerData = [
  ['Golf Course Rd, Gurgaon','₹42,000/sq.ft','up'],
  ['Sohna Road, Gurgaon','₹18,500/sq.ft','up'],
  ['Kasauli, HP','₹9,800/sq.ft','up'],
  ['Mussoorie, UK','₹11,200/sq.ft','up'],
  ['Chattarpur, Delhi','₹26,400/sq.ft','up'],
  ['Rishikesh, UK','₹8,400/sq.ft','up'],
  ['Neemrana, RJ','₹6,900/sq.ft','up'],
  ['Chandigarh Sector 5','₹21,000/sq.ft','up'],
];
function buildTicker(){
  const track = document.getElementById('tickerTrack');
  const set = tickerData.map(([loc,rate])=>`<span>${loc} <b>${rate}</b> <span class="up">▲</span></span>`).join('');
  track.innerHTML = set + set; // duplicate for seamless loop
}
buildTicker();

/* ---------- Nav scroll state ---------- */
const mainNav = document.getElementById('mainNav');
const tickerBar = document.querySelector('.ticker-bar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) mainNav.classList.add('solid');
  else mainNav.classList.remove('solid');
});

/* ---------- Mobile menu ---------- */
const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

/* ---------- Location tile backgrounds ---------- */
document.querySelectorAll('.loc-item[data-bg]').forEach(el=>{
  const bg = el.getAttribute('data-bg');
  const before = document.createElement('div');
  before.style.cssText = `position:absolute;inset:0;background:url('${bg}') center/cover;opacity:0;transition:opacity .5s ease;`;
  el.style.position='relative';
  el.prepend(before);
  el.addEventListener('mouseenter', ()=> before.style.opacity='0.35');
  el.addEventListener('mouseleave', ()=> before.style.opacity='0');
});

/* ---------- Carousel controls ---------- */
const carousel = document.getElementById('estateCarousel');
document.getElementById('carLeft').addEventListener('click', () => carousel.scrollBy({ left: -360, behavior: 'smooth' }));
document.getElementById('carRight').addEventListener('click', () => carousel.scrollBy({ left: 360, behavior: 'smooth' }));

/* ---------- Nivas AI Concierge (client-side NLP simulation) ---------- */
const estateDB = [
  { name:'The Ridge Residences', loc:'Kasauli, Himachal Pradesh', price:6.2, tags:['mountain','hill','pool:false','pine'], img:'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=300&auto=format&fit=crop', city:'kasauli' },
  { name:'Aravali Greens', loc:'Sohna, Gurgaon', price:8.5, tags:['golf','pool','gurgaon'], img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=300&auto=format&fit=crop', city:'sohna gurgaon gurugram' },
  { name:'Riverfront Estate', loc:'Rishikesh, Uttarakhand', price:11, tags:['river','riverfront'], img:'https://images.unsplash.com/photo-1502005229766-a3d75d451d34?q=80&w=300&auto=format&fit=crop', city:'rishikesh' },
  { name:'The Manor', loc:'Chattarpur, New Delhi', price:15, tags:['farmhouse','pool'], img:'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=300&auto=format&fit=crop', city:'delhi chattarpur' },
  { name:'Pine Crest', loc:'Mussoorie, Uttarakhand', price:7.4, tags:['mountain','hill','valley'], img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=300&auto=format&fit=crop', city:'mussoorie dehradun' },
  { name:'Neemrana Vantage', loc:'Neemrana, Rajasthan', price:9, tags:['heritage','courtyard'], img:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=300&auto=format&fit=crop', city:'neemrana' },
];

const nivasInput = document.getElementById('nivasInput');
const nivasOutput = document.getElementById('nivasOutput');
const nivasAskBtn = document.getElementById('nivasAsk');

function parseQuery(q){
  const lower = q.toLowerCase();
  const budgetMatch = lower.match(/(\d+(\.\d+)?)\s*(cr|crore)/);
  const budget = budgetMatch ? parseFloat(budgetMatch[1]) : null;
  const wantsPool = /pool/.test(lower);
  const wantsGolf = /golf/.test(lower);
  const wantsRiver = /river/.test(lower);
  const wantsMountain = /mountain|hill|valley/.test(lower);
  const cities = ['gurgaon','sohna','kasauli','mussoorie','dehradun','rishikesh','neemrana','delhi','chandigarh','shimla'];
  const foundCity = cities.find(c => lower.includes(c));
  return { budget, wantsPool, wantsGolf, wantsRiver, wantsMountain, foundCity };
}

function runNivas(){
  const q = nivasInput.value.trim();
  if (!q) return;
  nivasOutput.innerHTML = '';
  const think = document.createElement('div');
  think.className = 'co-line dim';
  think.textContent = 'Nivas is reviewing 32 curated addresses...';
  nivasOutput.appendChild(think);

  setTimeout(() => {
    const parsed = parseQuery(q);
    let matches = estateDB.filter(e => {
      let ok = true;
      if (parsed.budget) ok = ok && Math.abs(e.price - parsed.budget) <= 3;
      if (parsed.wantsPool) ok = ok && e.tags.includes('pool');
      if (parsed.wantsGolf) ok = ok && e.tags.includes('golf');
      if (parsed.wantsRiver) ok = ok && (e.tags.includes('river') || e.tags.includes('riverfront'));
      if (parsed.wantsMountain) ok = ok && (e.tags.includes('mountain') || e.tags.includes('hill') || e.tags.includes('valley'));
      if (parsed.foundCity) ok = ok && e.city.includes(parsed.foundCity);
      return ok;
    });

    if (matches.length === 0) {
      matches = estateDB.slice(0, 2);
    }

    const summary = document.createElement('div');
    summary.className = 'co-line';
    const budgetTxt = parsed.budget ? `near ₹${parsed.budget} Cr` : 'across our portfolio';
    const cityTxt = parsed.foundCity ? ` in ${parsed.foundCity[0].toUpperCase()+parsed.foundCity.slice(1)}` : '';
    summary.textContent = matches.length && (parsed.budget||parsed.foundCity||parsed.wantsPool||parsed.wantsGolf||parsed.wantsRiver||parsed.wantsMountain)
      ? `Found ${matches.length} address${matches.length>1?'es':''} ${budgetTxt}${cityTxt}.`
      : `Here are a couple of addresses to start with — try adding a budget or city for a tighter match.`;
    nivasOutput.innerHTML = '';
    nivasOutput.appendChild(summary);

    const grid = document.createElement('div');
    grid.className = 'result-grid';
    matches.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = (i*0.12)+'s';
      card.innerHTML = `<img src="${m.img}" alt="${m.name}"><div><div class="rc-name">${m.name}</div><div class="rc-meta">${m.loc} · ₹${m.price} Cr onwards</div></div>`;
      grid.appendChild(card);
    });
    nivasOutput.appendChild(grid);
  }, 900);
}

nivasAskBtn.addEventListener('click', runNivas);
nivasInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runNivas(); });
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    nivasInput.value = chip.getAttribute('data-q');
    runNivas();
  });
});

/* ---------- Hero video: respect reduced motion / autoplay fallback ---------- */
const heroVideo = document.getElementById('heroVideo');
if (heroVideo) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    heroVideo.pause();
    heroVideo.style.display = 'none';
    const fallback = document.getElementById('heroFallback');
    if (fallback) fallback.style.display = 'block';
  } else {
    heroVideo.play().catch(() => {
      const fallback = document.getElementById('heroFallback');
      if (fallback) fallback.style.display = 'block';
    });
  }
}

/* ---------- Gallery lightbox ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCap = document.getElementById('lightboxCap');
document.querySelectorAll('.g-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    lightboxImg.src = img.src.replace(/w=\d+/, 'w=1800');
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = img.alt;
    lightbox.classList.add('open');
  });
});
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

/* ---------- CTA form ---------- */
document.getElementById('ctaForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.getElementById('formNote').textContent = "Thank you — a relationship manager will call you shortly.";
  this.reset();
});
