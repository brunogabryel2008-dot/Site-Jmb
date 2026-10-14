(function(){
  var IG_CHAT = 'https://ig.me/m/_.jmb.r';
  /* WhatsApp: número com DDI + DDD, só dígitos */
  var WHATS = '5561998328852';
  function linkWhats(msg){ return 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg); }

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

  var NOTA_STORIES = '<b>Sobre os pacotes</b>'
    + 'Stories editados e estratégicos para o seu evento.<br/><br/>'
    + 'Fora da cidade, cobra-se uma taxa de R$2,00 por km.<br/><br/>'
    + 'Pagamento facilitado: 30% para reservar. O restante pode ser pago até 3 dias antes do evento, no Pix ou dinheiro.<br/><br/>'
    + 'Orçamento válido por 7 dias.<br/><br/>'
    + 'Para um trabalho de excelência, informe com antecedência onde, quando e qual pacote.';

  /* Aviso que aparece em todos os pacotes (cartão e "Saiba mais") */
  var AVISO_DIAS = 'Entregas em dias úteis';

  /* Grupos da aba StoryMakers (na ordem em que aparecem) */
  var GRUPOS = [
    { id:'qualquer', titulo:'Qualquer tipo de evento' },
    { id:'civil', titulo:'Casamento civil' },
    { id:'eventos', titulo:'Eventos' },
    { id:'infantil', titulo:'Infantil' }
  ];
  function tituloGrupo(id){
    for (var i = 0; i < GRUPOS.length; i++) { if (GRUPOS[i].id === id) { return GRUPOS[i].titulo; } }
    return '';
  }

  var P = {
    'foto-mini': { cat:'fotos', nome:'Pacote Mini', preco:'R$150,00', itens:[
      '10 fotos editadas (à escolha do cliente)',
      '2 looks à escolha do cliente',
      'Entrega em galeria online privada (AirDrop ou arquivo)',
      'Prazo de entrega de todos os materiais: até 48h' ] },
    'foto-essencial': { cat:'fotos', nome:'Pacote Essencial', preco:'R$250,00', itens:[
      '15 fotos tratadas (à escolha do cliente)',
      'Filmaker de 50seg',
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
      'Ideal para casamentos, aniversários e eventos corporativos' ] },

    /* ---- StoryMakers: qualquer tipo de evento ---- */
    'st-qualquer-inicial': { cat:'stories', grupo:'qualquer', nome:'Pacote Inicial', preco:'R$380,00', itens:[
      'Duração: até 3 horas',
      'Entregas: stories em tempo real do seu evento no Instagram',
      'Incluso: até 5 stories editados e estratégicos para o seu evento, postados pós-evento',
      'Prazo de entrega: 1 dia útil' ] },
    'st-qualquer-classico': { cat:'stories', grupo:'qualquer', nome:'Pacote Clássico', preco:'R$530,00', itens:[
      'Duração: a combinar',
      'Entregas: stories postados pós-evento',
      'Incluso: até 9 stories editados e estratégicos para o seu evento',
      'Fora da cidade: taxa de R$2,00 por km',
      'Prazo de entrega: 1 dia útil' ] },
    'st-qualquer-premium': { cat:'stories', grupo:'qualquer', nome:'Pacote Premium', preco:'R$690,00', itens:[
      'Duração: a combinar',
      'Entregas: stories em tempo real em múltiplos locais (making of | cerimônia | recepção)',
      'Incluso: 12 stories pós-evento',
      'Fora da cidade: taxa de R$2,00 por km',
      'Prazo de entrega: 1 dia útil' ] },

    /* ---- StoryMakers: casamento civil ---- */
    'st-civil-inicial': { cat:'stories', grupo:'civil', nome:'Pacote Inicial', preco:'R$390,00', itens:[
      'Duração: 1 hora',
      'Entregas: stories em tempo real',
      'Incluso: até 5 stories editados e estratégicos para o seu evento em tempo real',
      'Locação: externa ou em estúdio',
      'Fora da cidade: taxa de R$2,00 por km',
      'Prazo de entrega: stories em tempo real, vídeo final em 2 dias úteis' ] },
    'st-civil-classico': { cat:'stories', grupo:'civil', nome:'Pacote Clássico', preco:'R$580,00', itens:[
      'Duração: a combinar',
      'Entregas: stories em tempo real + 2 vídeos editados com os melhores momentos (cerimônia | recepção)',
      'Incluso: até 8 stories editados e estratégicos para o seu evento',
      'Fora da cidade: taxa de R$2,00 por km',
      'Prazo de entrega: stories em tempo real' ] },
    'st-civil-premium': { cat:'stories', grupo:'civil', nome:'Pacote Premium', preco:'R$730,00', itens:[
      'Duração: a combinar',
      'Entregas: stories em tempo real + 3 vídeos editados com os melhores momentos (making of | cerimônia | recepção)',
      'Incluso: até 14 stories editados e estratégicos para o seu evento',
      'Fora da cidade: taxa de R$2,00 por km',
      'Prazo de entrega: 3 dias úteis' ] },

    /* ---- StoryMakers: eventos ---- */
    'st-eventos-video': { cat:'stories', grupo:'eventos', nome:'Videomaker Mobile', preco:'R$500,00', itens:[
      '1 vídeo editado com os melhores momentos',
      'Duração: até 5 horas' ] },
    'st-eventos-story': { cat:'stories', grupo:'eventos', nome:'Storymaker', preco:'R$600,00', itens:[
      'Até 7 stories do evento em tempo real',
      'Horário a combinar' ] },
    'st-eventos-combo': { cat:'stories', grupo:'eventos', nome:'Combo Completo', preco:'R$900,00', itens:[
      '1 vídeo com os melhores momentos',
      'Stories em tempo real',
      'Horário a combinar' ] },

    /* ---- StoryMakers: infantil ---- */
    'st-infantil-video': { cat:'stories', grupo:'infantil', nome:'Videomaker Mobile', preco:'R$400,00', itens:[
      '1 vídeo editado com os melhores momentos' ] },
    'st-infantil-story': { cat:'stories', grupo:'infantil', nome:'Storymaker', preco:'R$430,00', itens:[
      'Até 6 stories do evento' ] },
    'st-infantil-kids': { cat:'stories', grupo:'infantil', nome:'Pacote Kids', preco:'R$600,00', itens:[
      '1 vídeo com os melhores momentos',
      'Stories em tempo real' ] }
  };

  /* Textos curtos que aparecem nos cartões */
  var EXTRA = {
    'foto-mini': { sub:'Para registrar o essencial', res:['10 fotos editadas','2 looks à escolha','Galeria online privada','Entrega em até 48h'], ideal:'Ideal para ensaios rápidos e registros do dia a dia.' },
    'foto-essencial': { sub:'Fotos e um toque de movimento', res:['15 fotos tratadas','StoryMaker de 50 seg','3 looks à escolha','Entrega em até 72h'], ideal:'Ideal para ensaios completos e conteúdo para redes.' },
    'foto-completo': { sub:'Fotos e vídeos com drone', res:['Fotos à escolha do cliente','Câmeras profissionais','Drone profissional','Entrega em até 72h'], ideal:'Ideal para quem quer foto e vídeo juntos.' },
    'vid-simples': { sub:'O essencial do seu momento', res:['4 horas de cobertura','2 videomakers','Vídeo de 3 a 5 min','Até 10 dias úteis'], ideal:'Ideal para aniversário pequeno, festa simples e casamento civil.' },
    'vid-padrao': { sub:'Uma festa com mais detalhes', res:['6 horas + drone','2 videomakers','Making of + filme de 6 a 10 min','15 dias úteis'], ideal:'Ideal para 15 anos, bodas e casamento.' },
    'vid-essencial': { sub:'Para viver cada capítulo', res:['9 horas + drone','2 videomakers','Making of, filme e vídeo na íntegra','Até 15 dias'], ideal:'Making of vertical, filme e vídeo da cerimônia ou festa na íntegra.' },
    'vid-duplo': { sub:'O evento por completo', res:['2 videomakers + 2 storymakers','2 drones','Storys em tempo real','Vídeo em até 20 dias'], ideal:'Ideal para casamentos, aniversários e eventos corporativos.' },

    'st-qualquer-inicial': { sub:'Stories em tempo real', res:['Até 3 horas','Stories em tempo real','Até 5 stories editados','Entrega em 1 dia útil'], ideal:'Para qualquer tipo de evento.' },
    'st-qualquer-classico': { sub:'Stories pós-evento', res:['Duração a combinar','Stories pós-evento','Até 9 stories editados','Entrega em 1 dia útil'], ideal:'Para qualquer tipo de evento.' },
    'st-qualquer-premium': { sub:'Tempo real em vários locais', res:['Duração a combinar','Making of | cerimônia | recepção','12 stories pós-evento','Entrega em 1 dia útil'], ideal:'Para qualquer tipo de evento.' },
    'st-civil-inicial': { sub:'O essencial do seu "sim"', res:['1 hora','Stories em tempo real','Até 5 stories editados','Externa ou em estúdio'], ideal:'Vídeo final em 2 dias úteis.' },
    'st-civil-classico': { sub:'Stories + melhores momentos', res:['Duração a combinar','Stories em tempo real','2 vídeos editados','Até 8 stories editados'], ideal:'Cerimônia e recepção.' },
    'st-civil-premium': { sub:'Do making of à recepção', res:['Duração a combinar','Stories em tempo real','3 vídeos editados','Até 14 stories editados'], ideal:'Making of, cerimônia e recepção. Entrega em 3 dias úteis.' },
    'st-eventos-video': { sub:'Vídeo pelo celular', res:['1 vídeo editado','Melhores momentos','Até 5 horas'], ideal:'Ideal para eventos em geral.' },
    'st-eventos-story': { sub:'Seu evento ao vivo no Instagram', res:['Até 7 stories','Em tempo real','Horário a combinar'], ideal:'Ideal para eventos em geral.' },
    'st-eventos-combo': { sub:'Vídeo + stories', res:['1 vídeo melhores momentos','Stories em tempo real','Horário a combinar'], ideal:'Ideal para eventos em geral.' },
    'st-infantil-video': { sub:'Vídeo pelo celular', res:['1 vídeo editado','Melhores momentos'], ideal:'Ideal para festas infantis.' },
    'st-infantil-story': { sub:'A festa nos stories', res:['Até 6 stories do evento'], ideal:'Ideal para festas infantis.' },
    'st-infantil-kids': { sub:'Vídeo + stories', res:['1 vídeo melhores momentos','Stories em tempo real'], ideal:'Ideal para festas infantis.' }
  };

  function cardPacote(k){
    var p = P[k], e = EXTRA[k];
    var foto = p.cat === 'fotos', story = p.cat === 'stories';
    var nome = p.nome.replace('Pacote ', '');
    var lis = '';
    for (var i = 0; i < e.res.length; i++) { lis += '<li>' + e.res[i] + '</li>'; }
    lis += '<li>' + AVISO_DIAS + '</li>';
    var rotulo = story ? 'StoryMaker &#8226; ' + tituloGrupo(p.grupo) : 'Coleção de ' + (foto ? 'foto' : 'vídeo');
    var icone = story ? 'fa-mobile-screen-button' : (foto ? 'fa-camera' : 'fa-video');
    return '<div class="pk"><div class="pk-top"><div class="row"><span>' + rotulo + '</span>'
      + '<i class="fa-solid ' + icone + '"></i></div>'
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
  var pStories = document.querySelector('.pkg-panel[data-panel="stories"]');
  if (pFotos && pVideos) {
    var hf = '', hv = '';
    for (var kk in P) {
      if (!P.hasOwnProperty(kk)) { continue; }
      if (P[kk].cat === 'fotos') { hf += cardPacote(kk); }
      else if (P[kk].cat === 'vídeos') { hv += cardPacote(kk); }
    }
    pFotos.innerHTML = hf;
    pVideos.innerHTML = hv;
  }
  if (pStories) {
    var hs = '';
    for (var g = 0; g < GRUPOS.length; g++) {
      var cards = '';
      for (var ks in P) {
        if (P.hasOwnProperty(ks) && P[ks].cat === 'stories' && P[ks].grupo === GRUPOS[g].id) { cards += cardPacote(ks); }
      }
      hs += '<div class="pkg-group"><div class="pkg-group-head"><h3>' + GRUPOS[g].titulo + '</h3>'
        + '<span>Orçamento válido por 7 dias</span></div>'
        + '<div class="pkg-group-grid">' + cards + '</div></div>';
    }
    pStories.innerHTML = hs;
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
    lis += '<li>' + AVISO_DIAS + '</li>';
    var story = p.cat === 'stories';
    var nota = story ? NOTA_STORIES : (p.cat === 'vídeos') ? NOTA_VIDEOS : NOTA_FOTOS;
    msgAtual = story
      ? 'Olá! Gostaria de agendar o StoryMaker: ' + p.nome + ' (' + tituloGrupo(p.grupo) + ').'
      : 'Olá! Gostaria de agendar o ' + p.nome + ' de ' + p.cat + '.';
    corpo.innerHTML = (story ? '<p class="pkg-sub">StoryMaker &#8226; ' + tituloGrupo(p.grupo) + '</p>' : '')
      + '<h3>' + p.nome + '</h3><span class="pkg-price">' + p.preco + '</span>'
      + montarVideo(k)
      + '<ul>' + lis + '</ul><div class="pkg-note">' + nota + '</div>'
      + '<a class="pkg-cta" target="_blank" rel="noopener" href="' + linkWhats(msgAtual) + '">'
      + '<i class="fa-brands fa-whatsapp"></i> Pedir pelo WhatsApp</a>'
      + '<p class="pkg-hint" id="pkg-hint">A mensagem já vai escrita com o nome do pacote. É só enviar.</p>'
      + '<a class="pkg-ig" target="_blank" rel="noopener" href="' + IG_CHAT + '">Prefere o Instagram? Fale por lá</a>';
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
      var texto = norm([p.nome, p.cat, p.cat === 'stories' ? 'storymaker storymakers ' + tituloGrupo(p.grupo) : '', p.preco, e.sub, e.ideal, e.res.join(' '), p.itens.join(' ')].join(' '));
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

    if (t.closest('.pkg-cta')) { return; }
    var ig = t.closest('.pkg-ig');
    if (ig) {
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

/* ---- Animações leves: elementos aparecem ao rolar a página ---- */
(function(){
  if (!('IntersectionObserver' in window)) { return; }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return; }

  /* [seletor, atraso] — atraso 1 ou 2 deixa os itens entrando em sequência */
  var ALVOS = [
    ['.hero .eyebrow', 0], ['.hero-top h2', 0], ['.hero-side', 1], ['.hero-img', 2], ['.hero-cap', 2],
    ['.sobre-grid > div:first-child', 0], ['.sobre-grid > div:last-child', 1],
    ['.pac-head > div', 0], ['.pac-head p', 1], ['.pac-tools', 1], ['.pac-foot', 0],
    ['.port-head > div:first-child', 0], ['.port-head > div:last-child', 1],
    ['.port-grid > div:first-child', 0], ['.port-side > div:first-child', 1], ['.port-side > div:last-child', 2],
    ['.port-ig', 0],
    ['.contato-grid > div:first-child', 0], ['.contato-grid > div:last-child', 1],
    ['.foot', 0]
  ];

  var obs = new IntersectionObserver(function(entradas){
    for (var i = 0; i < entradas.length; i++) {
      if (entradas[i].isIntersecting) {
        entradas[i].target.className += ' visivel';
        obs.unobserve(entradas[i].target);
      }
    }
  }, { threshold:0.12, rootMargin:'0px 0px -40px 0px' });

  for (var a = 0; a < ALVOS.length; a++) {
    var els = document.querySelectorAll(ALVOS[a][0]);
    for (var e = 0; e < els.length; e++) {
      els[e].className += ' reveal' + (ALVOS[a][1] ? ' d' + ALVOS[a][1] : '');
      obs.observe(els[e]);
    }
  }
  document.documentElement.className += ' anim-on';
})();