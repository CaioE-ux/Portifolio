/* =========================
   Config / Data
   ========================= */
   const PROJECTS = [
    {
      id: "p1",
      title: "IA de Atendimento ao Cliente",
      desc: "Sistema automatizado para atendimentos, integrando n8n, APIs e roteamentos por intents. Logs estruturados e fallback robusto — redução do tempo médio de atendimento.",
      img: "IMAGENS/what-is-n8n.webp",
      tags: ["n8n", "API", "Automação"],
      links: [{label:"Demo", href:"#", external:false}, {label:"Repo", href:"#", external:false}]
    },
    {
      id: "p2",
      title: "Automação TOTVS (Contas a Receber)",
      desc: "Automação com Python + Selenium para Protheus (TOTVS): localizar títulos, alterar campos, validar erros e salvar baixas automaticamente com tratamento de exceções e logs.",
      img: "IMAGENS/projeto-totvs.jpg",
      tags: ["Python", "Selenium", "ERP"],
      links: [{label:"Detalhes", href:"#", external:false}]
    },
    {
      id: "p3",
      title: "Dashboard & ETL",
      desc: "Pipeline de ETL para consolidar métricas operacionais e dashboard em Power BI para monitoramento. Rotinas agendadas e KPIs configuráveis.",
      img: "IMAGENS/projeto-dashboard.jpg",
      tags: ["ETL", "Power BI", "KPI"],
      links: [{label:"Relatório", href:"#", external:false}]
    }
  ];
  
  /* =========================
     Init: DOM populate projects
     ========================= */
  function buildProjects() {
    const grid = document.getElementById('projetos-grid');
    grid.innerHTML = '';
    PROJECTS.forEach((p, idx) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-4';
      col.innerHTML = `
        <article class="card-projeto reveal" tabindex="0" role="button" aria-pressed="false" data-id="${p.id}">
          <img src="${p.img}" alt="${p.title}" class="card-img">
          <div>
            <h4 class="card-title">${p.title}</h4>
            <p class="card-sub">${p.tags.join(' • ')}</p>
          </div>
        </article>
      `;
      grid.appendChild(col);
    });
    attachProjectListeners();
  }
  
  /* =========================
     Modal control (enhanced)
     ========================= */
  function attachProjectListeners(){
    const cards = document.querySelectorAll('.card-projeto');
    const modal = document.getElementById('modal-projeto');
    const overlay = document.getElementById('modal-overlay');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalDescricao = document.getElementById('modal-descricao');
    const fechar = document.getElementById('fechar-modal');
    const modalLinks = document.getElementById('modal-links');
  
    function openModal(project){
      modalTitulo.textContent = project.title;
      modalDescricao.textContent = project.desc;
      modalLinks.innerHTML = project.links.map(l=>`<a class="btn btn-sm btn-outline-light me-2" href="${l.href}" ${l.external ? 'target="_blank" rel="noopener"':''}>${l.label}</a>`).join('');
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      fechar.focus();
    }
    function closeModal(){
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  
    cards.forEach(card=>{
      const id = card.getAttribute('data-id');
      const proj = PROJECTS.find(p=>p.id===id);
      if(!proj) return;
      card.addEventListener('click', ()=> openModal(proj));
      card.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); openModal(proj);} });
    });
  
    fechar.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e)=> { if(e.key==='Escape') closeModal(); });
  }
  
  /* =========================
     Typing effect for name
     ========================= */
  function typeEffect(elSelector, text, speed = 80){
    const el = document.querySelector(elSelector);
    if(!el) return;
    el.textContent = '';
    let i = 0;
    const timer = setInterval(()=>{
      el.textContent = text.slice(0, i+1);
      i++;
      if(i>=text.length){ clearInterval(timer); }
    }, speed);
  }
  
  /* =========================
     Reveal on scroll (IntersectionObserver)
     ========================= */
  function setupRevealOnScroll(){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  }
  
  /* =========================
     Scroll spy (active menu)
     ========================= */
  function setupScrollSpy(){
    const sections = document.querySelectorAll('main section, header');
    const menuLinks = document.querySelectorAll('.menu-link');
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const id = entry.target.id;
          menuLinks.forEach(a=> a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
        }
      });
    }, {threshold: 0.45});
    sections.forEach(s=>obs.observe(s));
  }
  
  /* =========================
     Theme toggle (dark/light) using localStorage
     ========================= */
  function setupThemeToggle(){
    const btn = document.getElementById('theme-toggle');
    const root = document.body;
    const saved = localStorage.getItem('theme');
    if(saved === 'light') root.classList.add('light');
  
    function updateButton(){
      btn.textContent = root.classList.contains('light') ? '☀️' : '🌙';
      btn.setAttribute('aria-pressed', root.classList.contains('light'));
    }
    updateButton();
  
    btn.addEventListener('click', ()=>{
      root.classList.toggle('light');
      localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
      updateButton();
    });
  }
  
  /* =========================
     Form: validation + async submit
     ========================= */
  function setupForm(){
    const form = document.getElementById('formulario');
    const status = document.getElementById('status-msg');
    const btn = document.getElementById('btn-enviar');
  
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      // native validation
      if(!form.checkValidity()){
        form.classList.add('was-validated');
        status.textContent = 'Verifique os campos indicados.';
        return;
      }
      // gather
      const name = document.getElementById('nome').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('mensagem').value.trim();
  
      // ui lock
      btn.disabled = true;
      status.textContent = 'Enviando...';
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ name, email, message })
        });
        if(res.ok){
          status.textContent = 'Mensagem enviada com sucesso. Obrigado!';
          form.reset();
          form.classList.remove('was-validated');
        } else {
          status.textContent = 'Erro no envio. Tente novamente mais tarde.';
        }
      } catch(err){
        console.error(err);
        status.textContent = 'Erro de conexão. Verifique sua internet.';
      } finally { btn.disabled = false; }
    });
  }
  
  /* =========================
     Smooth highlight on menu click (extra)
     ========================= */
  function setupMenuSmooth(){
    document.querySelectorAll('.menu-link').forEach(a=>{
      const href = a.getAttribute('href');
      if(!href || !href.startsWith('#')) return;
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }
  
  /* =========================
     Init App
     ========================= */
  function init(){
    buildProjects();
    typeEffect('#typed-name', 'Caio Enrique', 70);
    setupRevealOnScroll();
    setupScrollSpy();
    setupThemeToggle();
    setupForm();
    setupMenuSmooth();
    // small delay to ensure reveal elements present
    setTimeout(()=>document.querySelectorAll('.reveal').forEach(el=>el.classList.add('reveal')), 50);
  }
  
  document.addEventListener('DOMContentLoaded', init);
  