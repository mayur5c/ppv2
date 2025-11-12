// Mobile nav toggle
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('.nav');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = nav.style.display === 'flex';
    nav.style.display = open ? 'none' : 'flex';
    hamburger.setAttribute('aria-expanded', String(!open));
  });
}

// Form validation and local “submission”
const form = document.getElementById('applyForm');
const statusEl = document.getElementById('formStatus');

const validators = {
  name: v => v.trim().length >= 3,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  affiliation: v => v.trim().length >= 2,
  cohort: v => v.trim().length > 0,
  stage: v => v.trim().length > 0,
  trl: v => v.trim().length > 0,
  fundingLane: v => v.trim().length > 0,
  consent: v => v === true
};

function setError(field, msg) {
  const err = document.querySelector(`.err[data-for="${field}"]`);
  if (err) err.textContent = msg || '';
}

function collect() {
  return {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    affiliation: document.getElementById('affiliation').value,
    cohort: document.getElementById('cohort').value,
    stage: document.getElementById('stage').value,
    trl: document.getElementById('trl').value,
    problem: document.getElementById('problem').value,
    solution: document.getElementById('solution').value,
    ip: document.getElementById('ip').value,
    reg: document.getElementById('reg').value,
    fundingLane: document.getElementById('fundingLane').value,
    ask: document.getElementById('ask').value,
    consent: document.getElementById('consent').checked,
  };
}

function validate(payload) {
  let ok = true;
  for (const [k, fn] of Object.entries(validators)) {
    const valid = fn(payload[k] ?? '');
    setError(k, valid ? '' : 'Required or invalid');
    if (!valid) ok = false;
  }
  return ok;
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = collect();
  if (!validate(data)) {
    statusEl.textContent = 'Please fix the highlighted fields and try again.';
    statusEl.style.color = '#ff7b7b';
    return;
  }
  // Demo persistence: localStorage
  const submissions = JSON.parse(localStorage.getItem('ffl_submissions') || '[]');
  submissions.push({...data, ts: new Date().toISOString()});
  localStorage.setItem('ffl_submissions', JSON.stringify(submissions));
  form.reset();
  statusEl.textContent = 'Application submitted. A confirmation email will be sent after review.';
  statusEl.style.color = '#00d68f';
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });
});

// Patent modal behavior
class PatentInfo {
  constructor({title = '', abstract = '', image = '', number = 'N/A', inventor = 'N/A', filingDate = 'N/A', status = 'N/A'} = {}){
    this.title = title;
    this.abstract = abstract;
    this.image = image;
    this.number = number;
    this.inventor = inventor;
    this.filingDate = filingDate;
    this.status = status;
  }
}

const modal = document.getElementById('patentModal');
if (modal) {
  const modalImage = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalAbstract = document.getElementById('modalAbstract');
  const modalNumber = document.getElementById('modalNumber');
  const modalInventor = document.getElementById('modalInventor');
  const modalFiling = document.getElementById('modalFiling');
  const modalStatus = document.getElementById('modalStatus');
  const modalClose = modal.querySelector('.modal-close');

  function openModal(info){
    modalTitle.textContent = info.title || 'Untitled Patent';
    modalAbstract.textContent = info.abstract || 'No description available.';
    modalImage.src = info.image || './Patent Partners_Logo.png';
    modalImage.alt = info.title || 'Patent image';
    modalNumber.textContent = info.number || 'N/A';
    modalInventor.textContent = info.inventor || 'N/A';
    modalFiling.textContent = info.filingDate || 'N/A';
    modalStatus.textContent = info.status || 'N/A';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    // prevent background scroll
    document.body.style.overflow = 'hidden';
    // focus the close button for accessibility
    modalClose?.focus();
  }

  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.details-button').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      const card = btn.closest('.patent-card');
      if (!card) return;
      // prefer structured data attributes, fallback to DOM content
      const ds = card.dataset || {};
      const title = card.querySelector('.patent-info p')?.textContent.trim() || ds.abstract || '';
      const image = ds.image || card.querySelector('.patent-logo img')?.getAttribute('src') || './Patent Partners_Logo.png';
      const info = new PatentInfo({
        title,
        abstract: ds.abstract || title,
        image,
        number: ds.number || 'N/A',
        inventor: ds.inventor || 'N/A',
        filingDate: ds.filing || 'N/A',
        status: ds.status || 'N/A'
      });
      openModal(info);
    });
  });

  // close on overlay click
  modal.addEventListener('click', (e)=>{
    if (e.target === modal) closeModal();
  });

  // close button
  modalClose?.addEventListener('click', closeModal);

  // ESC to close
  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}
