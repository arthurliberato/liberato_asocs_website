/* =========================================================
   Ingenieros Liberato & Asociados — main.js
   Sin dependencias externas.
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     Portafolio de obras.
     Para agregar un proyecto basta con añadir un objeto aquí:
       cat: una o más de 'residencial' | 'comercial' | 'turistica' | 'publica'
       icon: 'vivienda' | 'edificio' | 'salud' | 'comercio' | 'educacion'
             | 'patrimonio' | 'vial' | 'deporte'
     --------------------------------------------------------- */
  var PROJECTS = [
    {
      name: 'Villa Los Mangos 5',
      loc: 'Casa de Campo, La Romana',
      desc: 'Vivienda unifamiliar de alta gama dentro del complejo turístico Casa de Campo.',
      cat: ['residencial', 'turistica'],
      icon: 'vivienda'
    },
    {
      name: 'Villas Las Cañas 117 y 18',
      loc: 'Casa de Campo, La Romana',
      desc: 'Dos villas residenciales ejecutadas bajo los estándares constructivos del complejo.',
      cat: ['residencial', 'turistica'],
      icon: 'vivienda'
    },
    {
      name: 'Residencial Beriozka I',
      loc: 'Miramar, Distrito Nacional',
      desc: 'Edificio residencial de 12 apartamentos en una de las zonas costeras de la capital.',
      cat: ['residencial'],
      icon: 'edificio'
    },
    {
      name: 'RIGALEMI',
      loc: 'Bávaro, La Altagracia',
      desc: 'Complejo residencial de 32 apartamentos en el polo turístico del este.',
      cat: ['residencial', 'turistica'],
      icon: 'edificio'
    },
    {
      name: 'Residencial ALMILAM',
      loc: 'Bávaro, La Altagracia',
      desc: 'Edificio de 16 apartamentos concebido para renta vacacional y residencia permanente.',
      cat: ['residencial', 'turistica'],
      icon: 'edificio'
    },
    {
      name: 'Residencial Alexei',
      loc: 'Bávaro, La Altagracia',
      desc: 'Proyecto habitacional multifamiliar en la zona de mayor crecimiento del país.',
      cat: ['residencial', 'turistica'],
      icon: 'edificio'
    },
    {
      name: 'Residencial Gina Alexandra VII',
      loc: 'Las Praderas, Distrito Nacional',
      desc: 'Conjunto de viviendas dúplex en un sector residencial consolidado de Santo Domingo.',
      cat: ['residencial'],
      icon: 'vivienda'
    },
    {
      name: 'Centro Universitario Regional UASD',
      loc: 'Mao, Valverde',
      desc: 'Terminación del centro universitario regional: obra educativa de alta capacidad.',
      cat: ['publica'],
      icon: 'educacion'
    },
    {
      name: 'Centro Médico Internacional INCE',
      loc: 'Naco, Distrito Nacional',
      desc: 'Infraestructura de salud con las exigencias técnicas propias de un centro médico.',
      cat: ['comercial'],
      icon: 'salud'
    },
    {
      name: 'Butcher Shop Enriquillo',
      loc: 'Los Cacicazgos, Distrito Nacional',
      desc: 'Local comercial gastronómico ejecutado en un sector premium de la capital.',
      cat: ['comercial'],
      icon: 'comercio'
    },
    {
      name: 'Plaza PIMALBA',
      loc: 'Carretera Punta Cana, La Altagracia',
      desc: 'Plaza comercial sobre uno de los corredores de mayor tránsito turístico del este.',
      cat: ['comercial', 'turistica'],
      icon: 'comercio'
    },
    {
      name: 'Consultorios MedicalNet',
      loc: 'Piantini, Distrito Nacional',
      desc: 'Remodelación integral de consultorios médicos en operación.',
      cat: ['comercial'],
      icon: 'salud'
    },
    {
      name: 'Catedral de Barahona',
      loc: 'Barahona',
      desc: 'Reparación de un inmueble patrimonial, con el cuidado que exige una obra histórica.',
      cat: ['publica'],
      icon: 'patrimonio'
    },
    {
      name: 'Carretera San Juan – Juan Herrera',
      loc: 'San Juan de la Maguana',
      desc: 'Reconstrucción vial que conecta comunidades de la región suroeste.',
      cat: ['publica'],
      icon: 'vial'
    },
    {
      name: 'Estadio de béisbol',
      loc: 'Villa Tapia, Hermanas Mirabal',
      desc: 'Infraestructura deportiva municipal para uso comunitario y competitivo.',
      cat: ['publica'],
      icon: 'deporte'
    }
  ];

  var CAT_LABELS = {
    residencial: 'Residencial',
    comercial: 'Comercial e institucional',
    turistica: 'Turística',
    publica: 'Obra pública'
  };

  var ICONS = {
    vivienda: '<path d="M3 12 16 3l13 9v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M12 29V18h8v11"/>',
    edificio: '<path d="M6 29V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v24"/><path d="M20 13h6a1 1 0 0 1 1 1v15"/><path d="M10 9h6M10 14h6M10 19h6M23 18h1M23 23h1M3 29h26"/>',
    salud: '<rect x="4" y="7" width="24" height="21" rx="2"/><path d="M11 7V4h10v3M16 13v9M11.5 17.5h9"/>',
    comercio: '<path d="M4 11h24l-1.5 17a1 1 0 0 1-1 1h-19a1 1 0 0 1-1-1z"/><path d="M11 14V8a5 5 0 0 1 10 0v6"/>',
    educacion: '<path d="M16 5 2 12l14 7 14-7z"/><path d="M7 15v8c0 2 4 4 9 4s9-2 9-4v-8M28 12v8"/>',
    patrimonio: '<path d="M16 3l10 7H6z"/><path d="M9 10v14M15 10v14M23 10v14M4 24h24M3 29h26"/>',
    vial: '<path d="M11 3 5 29M21 3l6 26"/><path d="M16 4v4M16 13v4M16 22v4"/>',
    deporte: '<circle cx="16" cy="16" r="13"/><path d="M6 7c5 4 6 14 3 19M26 7c-5 4-6 14-3 19"/>'
  };

  var PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- render del portafolio ---------- */
  var grid = document.getElementById('projects');
  if (grid) {
    grid.innerHTML = PROJECTS.map(function (p, i) {
      var tags = p.cat.map(function (c) {
        return '<span class="tag">' + esc(CAT_LABELS[c] || c) + '</span>';
      }).join('');

      return '' +
        '<li class="project reveal" data-cat="' + esc(p.cat.join(' ')) + '">' +
          '<div class="project-visual">' +
            '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" ' +
              'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              (ICONS[p.icon] || ICONS.edificio) +
            '</svg>' +
            '<span class="project-index" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
          '</div>' +
          '<div class="project-body">' +
            '<p class="project-loc">' + PIN + esc(p.loc) + '</p>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p class="project-desc">' + esc(p.desc) + '</p>' +
            '<div class="project-tags">' + tags + '</div>' +
          '</div>' +
        '</li>';
    }).join('');
  }

  /* ---------- filtros ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var emptyMsg = document.getElementById('projects-empty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var want = btn.dataset.filter;

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });

      var shown = 0;
      document.querySelectorAll('.project').forEach(function (card) {
        var match = want === 'all' || card.dataset.cat.split(' ').indexOf(want) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });

      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- menú móvil ---------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('nav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menú');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- header con sombra al hacer scroll ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- revelado al entrar en pantalla ---------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll() {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (reduced || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    // Red de seguridad: si el observer nunca dispara, nada debe quedar oculto.
    window.addEventListener('load', function () { setTimeout(revealAll, 2500); });
  }

  /* ---------- contador de estadísticas ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countObs.unobserve(el);

        var target = parseInt(el.dataset.count, 10);
        var suffix = el.dataset.suffix || '';
        if (isNaN(target)) return;

        var start = null;
        var dur = 1100;
        function step(ts) {
          if (start === null) start = ts;
          var t = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (t < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-num').forEach(function (el) { countObs.observe(el); });
  }

  /* ---------- resaltado del enlace activo ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- formulario de contacto ----------
     Sin backend: valida y compone un mailto listo para enviar.
     Para recibir los mensajes por HTTP, ver README (Formspree u otro).
     --------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var note = document.getElementById('form-note');

  if (form) {
    var RULES = [
      { id: 'f-nombre', msg: 'Indíquenos su nombre.' },
      { id: 'f-email', msg: 'Necesitamos un correo válido para responderle.' },
      { id: 'f-mensaje', msg: 'Cuéntenos brevemente qué necesita.' }
    ];

    var clearError = function (input) {
      input.classList.remove('is-invalid');
      var slot = form.querySelector('[data-error-for="' + input.id + '"]');
      if (slot) slot.textContent = '';
    };

    RULES.forEach(function (rule) {
      var input = document.getElementById(rule.id);
      if (input) input.addEventListener('input', function () { clearError(input); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      RULES.forEach(function (rule) {
        var input = document.getElementById(rule.id);
        if (!input) return;
        var valid = input.value.trim() !== '' && input.checkValidity();
        input.classList.toggle('is-invalid', !valid);
        var slot = form.querySelector('[data-error-for="' + rule.id + '"]');
        if (slot) slot.textContent = valid ? '' : rule.msg;
        if (!valid && ok) { input.focus(); ok = false; }
      });

      if (!ok) return;

      var data = new FormData(form);
      var get = function (k) { return (data.get(k) || '').toString().trim(); };

      var subject = 'Solicitud de ' + (get('servicio') || 'servicio') + ' — ' + get('nombre');
      var body = [
        'Nombre: ' + get('nombre'),
        'Correo: ' + get('email'),
        'Teléfono: ' + (get('telefono') || 'No indicado'),
        'Servicio de interés: ' + (get('servicio') || 'No indicado'),
        'Ubicación de la obra: ' + (get('ubicacion') || 'No indicada'),
        '',
        'Proyecto:',
        get('mensaje'),
        '',
        '— Enviado desde ingsliberato.com'
      ].join('\n');

      window.location.href = 'mailto:arthur@ingsliberato.com' +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      if (note) {
        note.textContent = 'Abrimos su cliente de correo con el mensaje listo. Si no se abrió, escríbanos a arthur@ingsliberato.com.';
        note.classList.add('is-ok');
      }
    });
  }

  /* ---------- año en el pie ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
