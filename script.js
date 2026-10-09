(function(){
  var IG_CHAT = 'https://ig.me/m/_.jmb.r';

  /* =====================================================
     VÍDEOS DOS PACOTES
     Cole o link do player entre aspas.
     Para vídeo em pé (vertical), use: { url:'LINK', vertical:true }
     Deixe '' (vazio) para o pacote ficar sem vídeo.
     ===================================================== */
  var VIDEOS = {
    'foto-essencial': 'https://www.youtube.com/embed/qbkj1ZG38Js',
    'foto-completo': 'https://www.youtube.com/embed/XHiwF2DHyRk',
    'vid-simples': 'COLE_AQUI_O_LINK_DO_VIDEO',
    'vid-padrao': 'https://www.youtube.com/embed/fasuw7Wn3fU'
    /* 'vid-essencial': '',
       'vid-duplo': '', */
  };

  /* ---- Player do YouTube: sem controles + volume mínimo 50% ---- */
  var VOLUME_MINIMO = 50;
  var ytAtual = null;
  var ytFila = [];

  function carregarYT(cb){
    if (window.YT && window.YT.Player) { cb(); return; }
    ytFila.push(cb);
    if (document.getElementById('yt-api')) { return; }
    window.onYouTubeIframeAPIReady = function(){
      var f = ytFila; ytFila = [];
      for (var i = 0; i < f.length; i++) { f[i](); }
    };
    var s = document.createElement('script');
    s.id = 'yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  function semLegenda(p){
    try { p.unloadModule('captions'); } catch (err) {}
    try { p.unloadModule('cc'); } catch (err) {}
  }

  function garantirVolume(p){
    semLegenda(p);
    try {
      if (p.isMuted()) { p.unMute(); }
      if (p.getVolume() < VOLUME_MINIMO) { p.setVolume(VOLUME_MINIMO); }
    } catch (err) {}
  }

  function iniciarYT(){
    if (!document.getElementById('pkg-yt')) { return; }
    if (!/^https?:$/.test(location.protocol)) { return; }
    carregarYT(function(){
      if (!document.getElementById('pkg-yt')) { return; }
      ytAtual = new YT.Player('pkg-yt', {
        events: {
          onError: function(){ falhaYT(); },
          onReady: function(e){ garantirVolume(e.target); e.target.playVideo(); },
          onStateChange: function(e){ if (e.data === 1) { garantirVolume(e.target); } }
        }
      });
    });
  }

  function pararYT(){
    if (ytAtual && ytAtual.destroy) { try { ytAtual.destroy(); } catch (err) {} }
    ytAtual = null;
  }

  var ytLink = '';
  function botaoYT(link){
    return '<a href="' + link + '" target="_blank" rel="noopener" '
      + 'style="color:#fff;text-decoration:none;border:1px solid #fff;padding:12px 20px;font-size:13px;">'
      + '&#9654; Assistir o v\u00eddeo no YouTube</a>';
  }
  function falhaYT(){
    var box = document.querySelector('#pkg-modal .pkg-video');
    if (!box || !ytLink) { return; }
    box.style.display = 'flex'; box.style.alignItems = 'center'; box.style.justifyContent = 'center';
    box.innerHTML = botaoYT(ytLink);
  }

  function montarVideo(k){
    var v = VIDEOS[k];
    if (!v || v.indexOf('COLE_AQUI') === 0) { return ''; }
    var vertical = false;
    if (typeof v === 'object') { vertical = !!v.vertical; v = v.url; }
    /* Arquivo de video proprio (ex.: 'videos/essencial.mp4'): toca dentro do site em qualquer situacao */
    if (/\.(mp4|webm|mov)(\?.*)?$/i.test(v)) {
      return '<div class="pkg-video' + (vertical ? ' vertical' : '') + '">'
        + '<video src="' + v + '" controls autoplay playsinline preload="metadata" '
        + 'style="position:absolute;top:0;left:0;width:100%;height:100%;background:#000;"></video></div>';
    }
    var ehYT = /youtube\.com\/embed|youtube-nocookie\.com\/embed/.test(v);
    var online = /^https?:$/.test(location.protocol);

    /* Aberto direto do computador (file://): o YouTube bloqueia o player (erro 153).
       Mostramos um botao para assistir no YouTube. Online (GitHub Pages) o player funciona. */
    if (ehYT && !online) {
      var idm = v.match(/embed\/([\w-]{6,})/);
      var link = idm ? 'https://www.youtube.com/watch?v=' + idm[1] : v;
      return '<div class="pkg-video" style="display:flex;align-items:center;justify-content:center;">' + botaoYT(link) + '</div>';
    }

    if (ehYT) {
      var idv = v.match(/embed\/([\w-]{6,})/);
      ytLink = idv ? 'https://www.youtube.com/watch?v=' + idv[1] : v;
      v += (v.indexOf('?') === -1 ? '?' : '&')
        + 'controls=0&autoplay=1&rel=0&playsinline=1&cc_load_policy=0&iv_load_policy=3&enablejsapi=1'
        + (location.origin && location.origin !== 'null' ? '&origin=' + encodeURIComponent(location.origin) : '');
    }
    return '<div class="pkg-video' + (vertical ? ' vertical' : '') + '">'
      + '<iframe' + (ehYT ? ' id="pkg-yt"' : '') + ' src="' + v + '" title="YouTube video player"'
      + ' allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"'
      + ' referrerpolicy="strict-origin-when-cross-origin" allowfullscreen="true" frameborder="0"></iframe></div>';
  }

  var NOTA_FOTOS = '<b>Sobre os pacotes</b>Todos os pacotes são fotos mobile, com alta qualidade. '
    + 'Fora da cidade, cobra-se uma taxa de R$2,00 por km. '
    + 'Para um trabalho de excelência, informe com antecedência onde, quando e qual pacote.';

  var NOTA_VIDEOS = '<b>Sobre os pacotes</b>'
    + 'Todos os pacotes são profissionais, com alta qualidade: vídeos profissionais + drone profissional.<br/><br/>'
    + 'Fora da cidade, cobra-se uma taxa de R$2,00 por km.<br/><br/>'
    + 'Extras: hora extra R$200,00 | drone avulso R$250,00 | vídeo extra para Instagram R$100,00.<br/><br/>'
    + 'Pagamento facilitado: 30% para reservar. O restante pode ser pago até 3 dias antes do evento, no Pix ou dinheiro.<br/><br/>'
    + 'Para um trabalho de excelência, informe com antecedência onde, quando e qual pacote.';

  var P = {
    'foto-mini': { cat:'fotos', nome:'Pacote Mini', preco:'R$150,00', itens:[
      '10 fotos editadas (à escolha do cliente)',
      '2 looks à escolha do cliente',
      'Entrega em galeria online privada (AirDrop ou arquivo)',
      'Prazo de entrega de todos os materiais: até 48h' ] },
    'foto-essencial': { cat:'fotos', nome:'Pacote Essencial', preco:'R$250,00', itens:[
      '15 fotos tratadas (à escolha do cliente)',
      'StoryMaker de 50seg',
      '3 looks à escolha do cliente',
      'Entrega em galeria online privada (AirDrop ou arquivo)',
      'Prazo de entrega de todos os materiais: até 72h' ] },
    'foto-completo': { cat:'fotos', nome:'Pacote Completo', preco:'R$365,00', itens:[
      'Fotos limitadas (à escolha do cliente)',
      'Trocas à escolha do cliente',
      'Fotos + vídeos com câmeras profissionais + drone profissional',
      'Entrega em galeria online privada (AirDrop ou arquivo)',
      'Prazo de entrega de todos os materiais: até 72h' ] },
    'vid-simples': { cat:'vídeos', nome:'Pacote Simples', preco:'R$950,00', itens:[
      '4 horas de cobertura com 2 videomakers',
      'Ideal para aniversário pequeno, festa simples e casamento civil',
      'Entrega de 1 vídeo de 3 a 5 minutos editado, com música e melhores momentos',
      'Entrega via AirDrop/WhatsApp',
      'Prazo: até 10 dias úteis' ] },
    'vid-padrao': { cat:'vídeos', nome:'Pacote Padrão', preco:'R$1.800,00', itens:[
      '6 horas de cobertura com 2 videomakers + drone incluso',
      'Ideal para 15 anos, bodas e casamento',
      'Making of de 40 segundos para reels + filme de 6 a 10 minutos com cerimônia/aniversário completo',
      'Entrega via AirDrop/WhatsApp',
      'Prazo: 15 dias úteis' ] },
    'vid-essencial': { cat:'vídeos', nome:'Pacote Essencial', preco:'R$2.600,00', itens:[
      '9 horas de cobertura com 2 videomakers e drone incluso',
      'Making of vertical + filme de 3 a 5 minutos + vídeo da cerimônia ou festa na íntegra',
      'Entrega via AirDrop/WhatsApp',
      'Prazo: até 15 dias para entrega dos materiais' ] },
    'vid-duplo': { cat:'vídeos', nome:'Pacote Duplo', preco:'R$3.650,00', itens:[
      'Videomaker + storymaker + making of da noiva',
      'Uma trend (a que o casal escolher)',
      '2 videomakers + 2 storymakers',
      'Cobertura total do evento (recepção + cerimônia)',
      'Incluso 2 drones + equipamentos profissionais',
      'Entrega dos storys em tempo real (storys limitados)',
      'Entrega do vídeo do evento em até 20 dias',
      'Ideal para casamentos, aniversários e eventos corporativos' ] }
  };

  /* Textos curtos que aparecem nos cartões */
  var EXTRA = {
    'foto-mini': { sub:'Para registrar o essencial', res:['10 fotos editadas','2 looks à escolha','Galeria online privada','Entrega em até 48h'], ideal:'Ideal para ensaios rápidos e registros do dia a dia.' },
    'foto-essencial': { sub:'Fotos e um toque de movimento', res:['15 fotos tratadas','StoryMaker de 50 seg','3 looks à escolha','Entrega em até 72h'], ideal:'Ideal para ensaios completos e conteúdo para redes.' },
    'foto-completo': { sub:'Fotos e vídeos com drone', res:['Fotos à escolha do cliente','Câmeras profissionais','Drone profissional','Entrega em até 72h'], ideal:'Ideal para quem quer foto e vídeo juntos.' },
    'vid-simples': { sub:'O essencial do seu momento', res:['4 horas de cobertura','2 videomakers','Vídeo de 3 a 5 min','Até 10 dias úteis'], ideal:'Ideal para aniversário pequeno, festa simples e casamento civil.' },
    'vid-padrao': { sub:'Uma festa com mais detalhes', res:['6 horas + drone','2 videomakers','Making of + filme de 6 a 10 min','15 dias úteis'], ideal:'Ideal para 15 anos, bodas e casamento.' },
    'vid-essencial': { sub:'Para viver cada capítulo', res:['9 horas + drone','2 videomakers','Making of, filme e vídeo na íntegra','Até 15 dias'], ideal:'Making of vertical, filme e vídeo da cerimônia ou festa na íntegra.' },
    'vid-duplo': { sub:'O evento por completo', res:['2 videomakers + 2 storymakers','2 drones','Storys em tempo real','Vídeo em até 20 dias'], ideal:'Ideal para casamentos, aniversários e eventos corporativos.' }
  };

  function cardPacote(k){
    var p = P[k], e = EXTRA[k];
    var foto = p.cat === 'fotos';
    var nome = p.nome.replace('Pacote ', '');
    var lis = '';
    for (var i = 0; i < e.res.length; i++) { lis += '<li>' + e.res[i] + '</li>'; }
    return '<div class="pk"><div class="pk-top"><div class="row"><span>Coleção de ' + (foto ? 'foto' : 'vídeo') + '</span>'
      + '<i class="fa-solid ' + (foto ? 'fa-camera' : 'fa-video') + '"></i></div>'
      + '<h3><a data-pkg="' + k + '" href="javascript:void(0)">' + nome + '</a></h3><small>' + e.sub + '</small></div>'
      + '<div class="pk-body"><div class="pk-inv">Investimento</div><div class="pk-price">' + p.preco + '</div>'
      + '<ul>' + lis + '</ul><p class="pk-ideal">' + e.ideal + '</p>'
      + '<button class="read-more" data-pkg="' + k + '" type="button">Saiba mais <i class="fa-solid fa-arrow-right"></i></button></div></div>';
  }

  /* ---- Monta os cartões nas abas ---- */
  var abas = document.querySelectorAll('.pkg-tab');
  var paineis = document.querySelectorAll('.pkg-panel');
  var pFotos = document.querySelector('.pkg-panel[data-panel="fotos"]');
  var pVideos = document.querySelector('.pkg-panel[data-panel="videos"]');
  if (pFotos && pVideos) {
    var hf = '', hv = '';
    for (var kk in P) {
      if (!P.hasOwnProperty(kk)) { continue; }
      if (P[kk].cat === 'fotos') { hf += cardPacote(kk); } else { hv += cardPacote(kk); }
    }
    pFotos.innerHTML = hf;
    pVideos.innerHTML = hv;
  }

  /* ---- Abas Fotos / Vídeos ---- */
  function trocarAba(nome){
    var i;
    for (i = 0; i < abas.length; i++) {
      var ativa = abas[i].getAttribute('data-tab') === nome;
      abas[i].className = ativa ? 'pkg-tab active' : 'pkg-tab';
      abas[i].setAttribute('aria-selected', ativa ? 'true' : 'false');
    }
    for (i = 0; i < paineis.length; i++) {
      var mostrar = paineis[i].getAttribute('data-panel') === nome;
      paineis[i].className = 'pkg-panel' + (mostrar ? '' : ' pkg-hide');
    }
  }

  /* ---- Janela Saiba mais ---- */
  var modal = document.getElementById('pkg-modal');
  var corpo = document.getElementById('pkg-modal-body');
  if (!modal || !corpo) { return; }

  var msgAtual = '';

  function copiar(texto){
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).catch(function(){});
    } else {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta);
    }
  }

  function abrir(k){
    var p = P[k]; if (!p) { return; }
    pararYT();
    var lis = '';
    for (var i = 0; i < p.itens.length; i++) { lis += '<li>' + p.itens[i] + '</li>'; }
    var nota = (p.cat === 'vídeos') ? NOTA_VIDEOS : NOTA_FOTOS;
    msgAtual = 'Olá! Gostaria de agendar o ' + p.nome + ' de ' + p.cat + '.';
    corpo.innerHTML = '<h3>' + p.nome + '</h3><span class="pkg-price">' + p.preco + '</span>'
      + montarVideo(k)
      + '<ul>' + lis + '</ul><div class="pkg-note">' + nota + '</div>'
      + '<a class="pkg-cta" target="_blank" rel="noopener" href="' + IG_CHAT + '">Pedir este pacote</a>'
      + '<p class="pkg-hint" id="pkg-hint">Ao clicar, a mensagem é copiada e o chat do Instagram abre. É só colar e enviar.</p>';
    modal.className = 'pkg-modal open';
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    iniciarYT();
  }

  function fechar(){
    pararYT();
    corpo.innerHTML = '';
    modal.className = 'pkg-modal';
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  /* ---- Busca de pacotes ---- */
  var formBusca = document.querySelector('.header-search .search-form');
  var campoBusca = formBusca ? formBusca.querySelector('.search-input') : null;
  var resultados = document.getElementById('pkg-results');
  var msgBusca = document.getElementById('pkg-empty');
  var caixaAbas = document.querySelector('.pkg-tabs');

  function norm(s){
    s = String(s).toLowerCase();
    if (s.normalize) { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    return s;
  }

  function limparBusca(){
    resultados.innerHTML = '';
    resultados.className = 'pkg-results pkg-hide';
    msgBusca.className = 'pkg-empty pkg-hide';
    caixaAbas.style.display = '';
    var atual = 'fotos';
    for (var i = 0; i < abas.length; i++) {
      if (abas[i].className.indexOf('active') !== -1) { atual = abas[i].getAttribute('data-tab'); }
    }
    trocarAba(atual);
  }

  function buscar(q){
    var termos = norm(q).split(/\s+/).filter(function(x){ return x; });
    if (!termos.length) { limparBusca(); return; }
    var html = '', n = 0;
    for (var k in P) {
      if (!P.hasOwnProperty(k)) { continue; }
      var p = P[k], e = EXTRA[k];
      var texto = norm([p.nome, p.cat, p.preco, e.sub, e.ideal, e.res.join(' '), p.itens.join(' ')].join(' '));
      var ok = true;
      for (var j = 0; j < termos.length; j++) {
        if (texto.indexOf(termos[j]) === -1) { ok = false; break; }
      }
      if (ok) { n++; html += cardPacote(k); }
    }
    resultados.innerHTML = html;
    resultados.className = n ? 'pkg-results' : 'pkg-results pkg-hide';
    msgBusca.textContent = n
      ? n + (n === 1 ? ' pacote encontrado' : ' pacotes encontrados') + ' para "' + q + '"'
      : 'Nenhum pacote encontrado para "' + q + '".';
    msgBusca.className = 'pkg-empty';
    caixaAbas.style.display = 'none';
    for (var i = 0; i < paineis.length; i++) { paineis[i].className = 'pkg-panel pkg-hide'; }
  }

  if (formBusca && campoBusca && resultados && msgBusca && caixaAbas) {
    campoBusca.addEventListener('input', function(){ buscar(campoBusca.value); });
    formBusca.addEventListener('submit', function(ev){
      ev.preventDefault();
      buscar(campoBusca.value);
      campoBusca.blur();
      var topo = document.getElementById('pacotes');
      if (topo && topo.scrollIntoView) { topo.scrollIntoView({ behavior:'smooth', block:'start' }); }
    });
  }

  document.addEventListener('click', function(e){
    var t = e.target;
    if (!t || !t.closest) { return; }

    var cta = t.closest('.pkg-cta');
    if (cta) {
      copiar(msgAtual);
      var hint = document.getElementById('pkg-hint');
      if (hint) { hint.innerHTML = '<b>✓ Mensagem copiada!</b> Cole no chat do Instagram e envie.'; }
      return;
    }

    var aba = t.closest('[data-tab]');
    if (aba) { trocarAba(aba.getAttribute('data-tab')); return; }
    var alvo = t.closest('[data-pkg]');
    if (alvo) { abrir(alvo.getAttribute('data-pkg')); return; }
    if (t.getAttribute('data-close')) { fechar(); }
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') { fechar(); } });
})();

(function(){
  var sel = document.getElementById('jmb-lang-select');
  if (!sel) { return; }

  function lerCookie(){
    var m = document.cookie.match(/(?:^|; )googtrans=([^;]*)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function gravarCookie(v){
    document.cookie = 'googtrans=' + v + '; path=/';
    document.cookie = 'googtrans=' + v + '; path=/; domain=' + location.hostname;
  }
  function apagarCookie(){
    var passado = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'googtrans=; path=/; ' + passado;
    document.cookie = 'googtrans=; path=/; domain=' + location.hostname + '; ' + passado;
    document.cookie = 'googtrans=; path=/; domain=.' + location.hostname + '; ' + passado;
  }

  window.googleTranslateElementInit = function(){
    new google.translate.TranslateElement({ pageLanguage:'pt', autoDisplay:false }, 'google_translate_element');
  };
  function carregarTradutor(){
    var s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
  }

  var m = lerCookie().match(/^\/[^\/]+\/([^\/]+)$/);
  if (m && m[1] !== 'pt') {
    sel.value = m[1];
    carregarTradutor();
  }

  sel.addEventListener('change', function(){
    if (sel.value === 'pt') { apagarCookie(); } else { gravarCookie('/pt/' + sel.value); }
    location.reload();
  });
})();
