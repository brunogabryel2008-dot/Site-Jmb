(function(){
  /* ---------- Pisca-pisca no cabeçalho ---------- */
  var head = document.getElementById('header-wrap');
  if (head) {
    var box = document.createElement('div');
    box.className = 'nat-lights';
    var cores = ['#ff4b4b','#ffd45c','#4be08a','#58b4ff'];
    var n = Math.max(14, Math.round(window.innerWidth / 70));
    for (var i = 0; i < n; i++) {
      var x = (i + .5) / n;
      var b = document.createElement('i');
      b.style.left = (x * 100) + '%';
      b.style.top = (Math.sin(x * Math.PI) * 6 + 2) + 'px';
      b.style.background = cores[i % 4];
      b.style.color = cores[i % 4];
      b.style.animationDelay = ((i % 4) * .6) + 's';
      box.appendChild(b);
    }
    head.appendChild(box);
  }

  /* ---------- Neve ---------- */
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduz) {
    var cv = document.createElement('canvas');
    cv.id = 'nat-snow';
    document.body.appendChild(cv);
    var cx = cv.getContext('2d'), W = 0, H = 0, flocos = [];
    function ajusta(){
      var d = window.devicePixelRatio || 1;
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * d; cv.height = H * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    }
    ajusta();
    window.addEventListener('resize', ajusta);
    var total = W < 760 ? 35 : 70;
    for (var k = 0; k < total; k++) {
      flocos.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.2 + .8, v: Math.random() * .7 + .3, o: Math.random() * Math.PI * 2 });
    }
    (function quadro(){
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = 'rgba(255,255,255,.85)';
      for (var j = 0; j < flocos.length; j++) {
        var f = flocos[j];
        f.y += f.v; f.o += .01; f.x += Math.sin(f.o) * .4;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        cx.beginPath(); cx.arc(f.x, f.y, f.r, 0, Math.PI * 2); cx.fill();
      }
      requestAnimationFrame(quadro);
    })();
  }

  /* ---------- Musiquinha de Natal (gerada no navegador, sem arquivo de áudio) ---------- */
  var VOLUME = 0.035;   /* bem baixinho. Aumente aqui se quiser (ex.: 0.06) */
  var NOTAS = { C:261.63, D:293.66, E:329.63, F:349.23, G:392.00, A:440.00, B:493.88, C5:523.25, D5:587.33, E5:659.25, F5:698.46 };
  /* Jingle Bells (tempo em batidas) */
  var JINGLE = [
    ['E',1],['E',1],['E',2], ['E',1],['E',1],['E',2], ['E',1],['G',1],['C',1.5],['D',.5],['E',4],
    ['F',1],['F',1],['F',1.5],['F',.5], ['F',1],['E',1],['E',1],['E',.5],['E',.5], ['E',1],['D',1],['D',1],['E',1],['D',2],['G',2],
    ['E',1],['E',1],['E',2], ['E',1],['E',1],['E',2], ['E',1],['G',1],['C',1.5],['D',.5],['E',4],
    ['F',1],['F',1],['F',1.5],['F',.5], ['F',1],['E',1],['E',1],['E',.5],['E',.5], ['G',1],['G',1],['F',1],['D',1],['C',4]
  ];
  /* Noite Feliz (tempo em colcheias, convertido abaixo) */
  var NOITE = [
    ['G',3],['A',1],['G',2],['E',6], ['G',3],['A',1],['G',2],['E',6],
    ['D5',4],['D5',2],['B',6], ['C5',4],['C5',2],['G',6],
    ['A',4],['A',2],['C5',3],['B',1],['A',2], ['G',3],['A',1],['G',2],['E',6],
    ['A',4],['A',2],['C5',3],['B',1],['A',2], ['G',3],['A',1],['G',2],['E',6],
    ['D5',4],['D5',2],['F5',3],['D5',1],['B',2], ['C5',6],['G',3],['E',1],['G',2],['F',3],['D',3],['C',6]
  ];

  var ctx = null, master = null, iniciada = false, ligada = true, pausaVideo = false, timer = null;
  try { if (localStorage.getItem('jmb-natal-musica') === 'off') { ligada = false; } } catch (e) {}

  function nota(freq, t, dur){
    var o1 = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain();
    o1.type = 'sine'; o2.type = 'triangle';
    o1.frequency.value = freq; o2.frequency.value = freq * 2;
    var g2 = ctx.createGain(); g2.gain.value = .18;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + .02);
    g.gain.exponentialRampToValueAtTime(.001, t + Math.max(dur, .5) * 1.5);
    o1.start(t); o2.start(t);
    o1.stop(t + dur * 1.5 + .1); o2.stop(t + dur * 1.5 + .1);
  }
  function toca(lista, t0, seg){
    var t = t0;
    for (var i = 0; i < lista.length; i++) {
      nota(NOTAS[lista[i][0]], t, lista[i][1] * seg);
      t += lista[i][1] * seg;
    }
    return t;
  }
  function ciclo(){
    var t = ctx.currentTime + .3;
    t = toca(JINGLE, t, .36) + 1.5;
    t = toca(NOITE, t, .3) + 3;
    timer = setTimeout(ciclo, (t - ctx.currentTime) * 1000);
  }
  function inicia(){
    if (iniciada) { return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = VOLUME;
    var filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 2400;
    var eco = ctx.createDelay(); eco.delayTime.value = .28;
    var fb = ctx.createGain(); fb.gain.value = .3;
    master.connect(filtro); filtro.connect(ctx.destination);
    filtro.connect(eco); eco.connect(fb); fb.connect(eco); eco.connect(ctx.destination);
    iniciada = true;
    ciclo();
    atualiza();
  }
  function atualiza(){
    if (!ctx) { return; }
    var deve = ligada && !pausaVideo && !document.hidden;
    if (deve && ctx.state === 'suspended') { ctx.resume(); }
    if (!deve && ctx.state === 'running') { ctx.suspend(); }
  }

  /* Botão */
  var btn = document.createElement('button');
  btn.id = 'nat-music'; btn.type = 'button';
  var dica = document.createElement('div');
  dica.id = 'nat-music-dica'; dica.textContent = 'Toque para ouvir a música de Natal';
  function visual(){
    var tocando = iniciada && ligada;
    btn.className = (tocando ? '' : 'off') + (!iniciada && ligada ? ' convite' : '');
    btn.innerHTML = '<i class="fa-solid ' + (tocando ? 'fa-music' : 'fa-volume-xmark') + '"></i>';
    btn.setAttribute('aria-label', tocando ? 'Desligar música de Natal' : 'Ligar música de Natal');
    btn.title = btn.getAttribute('aria-label');
  }
  btn.addEventListener('click', function(){
    if (!iniciada) { ligada = true; inicia(); }
    else { ligada = !ligada; }
    try { localStorage.setItem('jmb-natal-musica', ligada ? 'on' : 'off'); } catch (e) {}
    dica.classList.remove('on');
    atualiza(); visual();
  });
  document.body.appendChild(btn);
  document.body.appendChild(dica);
  visual();
  if (ligada) {
    setTimeout(function(){ if (!iniciada) { dica.classList.add('on'); } }, 1500);
    setTimeout(function(){ dica.classList.remove('on'); }, 8000);
  }

  /* Navegadores só liberam som depois de um toque/clique: começa no primeiro */
  function primeiroToque(e){
    if (e.target && e.target.closest && e.target.closest('#nat-music')) { return; }
    if (ligada && !iniciada) { inicia(); visual(); dica.classList.remove('on'); }
    ['pointerdown','keydown','touchend'].forEach(function(ev){ document.removeEventListener(ev, primeiroToque); });
  }
  ['pointerdown','keydown','touchend'].forEach(function(ev){ document.addEventListener(ev, primeiroToque); });

  /* Pausa ao trocar de aba e enquanto a janela "Saiba mais" (com vídeo) está aberta */
  document.addEventListener('visibilitychange', atualiza);
  var modal = document.getElementById('pkg-modal');
  if (modal && window.MutationObserver) {
    new MutationObserver(function(){
      pausaVideo = /\bopen\b/.test(modal.className);
      atualiza();
    }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  }
})();