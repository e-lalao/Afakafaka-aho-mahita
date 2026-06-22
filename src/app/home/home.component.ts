import { Component, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../services/audio.service';
import { LangService } from '../services/lang.service';

const T = {
  mg: {
    splashTap:    'Tsindrio eto raha hanomboka',
    navRules:     'Fitsipi-dalao',
    playLabel:    'Hilalao',
    rulesBtn:     'Fitsipi-dalao',
    rulesTitle:   'Ity kilalao ity',
    rulesSub:     'Kilalao entina ampahafantarana ny ankizy ny anaran-javatra iray',
    r1q: 'Inona moa ity kilalao ity?',
    r1a: 'Kilalao natao ikarohan\'ny ankizy zavatra iray. Hisy sary maromaro hipoitra eo, arahana toromarika hoe "Afakafaka aho mahita..." Anjaran\'ny ankizy no mitady sy manindry ny sary marina!',
    r2q: 'Ahoana no filalaovana azy?',
    r2a: 'Tsindrio ny sary mifanaraka amin\'ny toromarika azo. Raha diso dia haharay hafatra ianao hoe "Tsy izy io, jereo tsara!" Raha tsy hitanao mihitsy ilay izy, tsindrio ny bokotra "Afapo" ary haseho anao ny sary marina.',
    r3q: 'Kintana?',
    r3a: 'Raha mahamarina ianao dia mahazo kintana iray. Mitombo hatrany ny isan\' ny kintana rehefa mahamarina ianao. Miezaha tsara raha te hahazo kintana betsaka!',
    aboutTitle:   'Momba ny e-lalao',
    aboutText:    'Ny e-lalao dia tetikasa iezahana hanandratana ny fiteny sy ny kolontsaina malagasy amin\'ny alalan\'ny teknolojia avo lenta. Misokatra amin\'ny fiaraha-miasa sy torohevitra ary ny famatsiana rehetra izahay. Ny hevitrao dia sarobidy aminay.',
    contactBtn:   'Te hifandray aminay',
    visitBtn:     'Hitsidika ny tranokala e-lalao',
    contactLabel: 'Alefaso ny hevitrao',
    footerLine:   'Natao am-pitiavana hanandratana ny kolontsaina malagasy',
  },
  fr: {
    splashTap:    'Appuie ici pour commencer',
    navRules:     'Les règles',
    playLabel:    'Jouer',
    rulesBtn:     'Les règles',
    rulesTitle:   'Le jeu',
    rulesSub:     'Jeu de reconnaissance d\'images pour enfants',
    r1q: 'C\'est quoi ce jeu ?',
    r1a: 'C\'est un jeu de reconnaissance d\'images pour les enfants. Des images flottent à l\'écran et le jeu demande "Afakafaka aho mahita..." (Qui peut trouver...). L\'enfant doit trouver et cliquer sur la bonne image !',
    r2q: 'Comment jouer ?',
    r2a: 'Clique sur la bonne image quand tu la trouves. Si c\'est faux, continue à chercher — un message "Tsy izy io, jereo tsara!" (Ce n\'est pas ça !) apparaît. Si tu ne trouves pas, clique sur "Afapo" pour voir la réponse.',
    r3q: 'Les étoiles ?',
    r3a: 'Chaque bonne réponse rapporte 1 étoile. Le score total s\'affiche à la fin de chaque manche. Essaie d\'accumuler le plus d\'étoiles possible !',
    aboutTitle:   'À propos d\'e-lalao',
    aboutText:    'e-lalao est un projet dédié à la valorisation de la langue et de la culture malgaches à travers la technologie moderne. Nous sommes ouverts à toute collaboration, conseil ou soutien. Vos idées nous sont précieuses.',
    contactBtn:   'Nous contacter',
    visitBtn:     'Visiter le site e-lalao',
    contactLabel: 'Envoyez-nous vos idées',
    footerLine:   'Fait avec amour pour la culture malgache',
  },
  en: {
    splashTap:    'Tap here to start',
    navRules:     'Rules',
    playLabel:    'Play',
    rulesBtn:     'Rules',
    rulesTitle:   'The game',
    rulesSub:     'Picture recognition game for children',
    r1q: 'What is this game?',
    r1a: 'It\'s a picture recognition game for children. Images float across the screen and the game asks "Afakafaka aho mahita..." (Who can find...). The child must find and click the correct image!',
    r2q: 'How to play?',
    r2a: 'Click on the correct image when you find it. If wrong, keep searching — a message "Tsy izy io, jereo tsara!" (That\'s not it, look carefully!) appears. If you can\'t find it, click "Afapo" to reveal the answer.',
    r3q: 'Stars?',
    r3a: 'Each correct answer earns 1 star. The total score is shown at the end of each round. Try to collect as many stars as possible!',
    aboutTitle:   'About e-lalao',
    aboutText:    'e-lalao is a project dedicated to promoting the Malagasy language and culture through modern technology. We are open to all collaboration, advice and support. Your ideas matter to us.',
    contactBtn:   'Contact us',
    visitBtn:     'Visit the e-lalao website',
    contactLabel: 'Send us your ideas',
    footerLine:   'Made with love for Malagasy culture',
  },
} as const;

@Component({
  selector: 'app-home',
  standalone: true,
  styles: [`
    :host { display: block; }

    /* ═══════════════════════════════ SPLASH ═══════════════════════════════ */
    .splash-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, #fef9c3 0%, transparent 60%),
        linear-gradient(170deg, #fffde7 0%, #fef3c7 30%, #fbbf24 60%, #d97706 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 1.2rem; cursor: pointer; user-select: none;
    }
    .splash-logo {
      width: clamp(100px, 30vw, 160px); height: clamp(100px, 30vw, 160px);
      border-radius: 50%; object-fit: cover;
      box-shadow: 0 12px 40px rgba(0,0,0,.18);
      animation: splashPulse 2s ease-in-out infinite;
    }
    .splash-title {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(1.6rem, 6vw, 2.8rem); color: #fff;
      text-shadow: 0 4px 16px rgba(0,0,0,.15); text-align: center; padding: 0 1rem;
    }
    .splash-tap {
      margin: 0; font-family: 'Nunito', sans-serif; font-weight: 700;
      font-size: clamp(.95rem, 3vw, 1.2rem); color: rgba(255,255,255,.85);
      animation: splashBlink 1.4s ease-in-out infinite;
    }
    .splash-lang {
      display: flex; gap: .4rem; margin-top: .4rem;
    }
    .splash-lang-btn {
      font-family: 'Fredoka One', cursive; font-size: .85rem;
      color: rgba(255,255,255,.75); background: rgba(255,255,255,.15);
      border: 1.5px solid rgba(255,255,255,.3); border-radius: 1.5rem;
      padding: .25rem .7rem; cursor: pointer; transition: all .15s;
    }
    .splash-lang-btn.active { background: rgba(255,255,255,.35); color: #fff; border-color: rgba(255,255,255,.6); }
    .splash-lang-btn:not(.active):hover { background: rgba(255,255,255,.22); color: #fff; }
    @keyframes splashPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.05);} }
    @keyframes splashBlink { 0%,100%{opacity:1;} 50%{opacity:.4;} }

    /* ═══════════════════════════════ WRAPPER ══════════════════════════════ */
    .home-wrapper { display: flex; flex-direction: column; }
    .home-wrapper.hidden { display: none; }

    /* ═══════════════════════════════ HERO ═════════════════════════════════ */
    .home {
      min-height: 100dvh;
      background:
        radial-gradient(ellipse 80% 60% at 20% -10%, #fef9c3 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 110%, #fde68a 0%, transparent 55%),
        linear-gradient(170deg, #fffde7 0%, #fef3c7 30%, #fbbf24 60%, #d97706 100%);
      position: relative; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      padding: 7rem clamp(1rem, 5vw, 3rem) 2rem; box-sizing: border-box;
    }

    /* Nav */
    .top-nav {
      position: absolute; top: 1rem;
      left: clamp(1rem,4vw,2.5rem); right: clamp(1rem,4vw,2.5rem);
      display: flex; align-items: center; gap: .5rem; z-index: 30;
    }
    .lang-mini {
      display: flex; gap: 2px;
      background: rgba(255,255,255,.15); border: 1.5px solid rgba(255,255,255,.3);
      border-radius: 1.8rem; padding: 3px;
    }
    .lang-mini-btn {
      font-family: 'Fredoka One', cursive; font-size: .78rem; letter-spacing: .05em;
      color: rgba(255,255,255,.8); background: transparent; border: none;
      border-radius: 1.4rem; padding: .22rem .6rem; cursor: pointer; transition: all .15s;
    }
    .lang-mini-btn.active { background: rgba(255,255,255,.32); color: #fff; }
    .lang-mini-btn:not(.active):hover { background: rgba(255,255,255,.18); color: #fff; }
    .nav-logo { height: 36px; width: auto; object-fit: contain; position: absolute; left: 50%; transform: translateX(-50%); }
    .nav-right { display: flex; gap: .5rem; margin-left: auto; }
    .nav-link {
      font-family: 'Nunito', sans-serif; font-weight: 700; font-size: .85rem;
      color: rgba(255,255,255,.9); background: rgba(255,255,255,.15);
      border: 1.5px solid rgba(255,255,255,.3); border-radius: 2rem;
      padding: .35rem .85rem; cursor: pointer; transition: all .2s ease; white-space: nowrap;
    }
    .nav-link:hover { background: rgba(255,255,255,.28); color: #fff; border-color: rgba(255,255,255,.5); }

    /* Clouds */
    .cloud { position:absolute; background:rgba(255,255,255,.5); border-radius:50px; filter:blur(1px); }
    .cloud::before,.cloud::after { content:''; position:absolute; background:inherit; border-radius:50%; }
    .cloud-1 { width:180px;height:50px;top:8%;left:-20px;animation:drift 18s linear infinite; }
    .cloud-1::before{width:90px;height:70px;top:-35px;left:20px;}
    .cloud-1::after{width:60px;height:55px;top:-25px;left:80px;}
    .cloud-2 { width:140px;height:40px;top:18%;right:-30px;animation:drift 24s linear infinite reverse;opacity:.45; }
    .cloud-2::before{width:70px;height:60px;top:-30px;left:15px;}
    .cloud-2::after{width:50px;height:45px;top:-20px;left:65px;}
    .cloud-3 { width:220px;height:55px;bottom:12%;left:5%;animation:drift 30s linear infinite;opacity:.35; }
    .cloud-3::before{width:110px;height:80px;top:-42px;left:25px;}
    .cloud-3::after{width:75px;height:65px;top:-32px;left:110px;}

    /* Confetti */
    .confetti{position:absolute;pointer-events:none;animation:floatIcon var(--dur,5s) ease-in-out var(--delay,0s) infinite;font-size:var(--size,1.4rem);opacity:.75;}
    .c1{--dur:6s;--delay:0s;--size:1.8rem;top:10%;left:8%;color:#fbbf24;}
    .c2{--dur:8s;--delay:1s;--size:1.5rem;top:6%;left:30%;color:#d97706;}
    .c3{--dur:5s;--delay:2s;--size:1.2rem;top:12%;right:25%;color:#fbbf24;}
    .c4{--dur:7s;--delay:.5s;--size:1.6rem;top:5%;right:10%;color:#f59e0b;}
    .c5{--dur:9s;--delay:3s;--size:1rem;bottom:30%;left:12%;color:#fbbf24;}
    .c6{--dur:6s;--delay:1.5s;--size:1.3rem;bottom:22%;right:8%;color:#d97706;}
    .c7{--dur:7s;--delay:4s;--size:1.1rem;bottom:35%;left:40%;color:#f59e0b;}
    .c8{--dur:5s;--delay:2.5s;--size:1.4rem;top:55%;right:18%;color:#fbbf24;}

    /* Layout */
    .page-layout { position:relative;z-index:10;display:flex;align-items:center;gap:clamp(2rem,6vw,5rem);max-width:1100px;width:100%; }
    .left-col { flex:1;display:flex;flex-direction:column;align-items:flex-start;gap:1.6rem;min-width:0; }
    .right-col { flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;gap:.8rem; }

    /* Title */
    .game-title {
      margin:0;line-height:1.1;font-family:'Fredoka One',cursive;
      font-size:clamp(1.6rem,4.5vw,3rem);letter-spacing:.02em;
      background:linear-gradient(90deg,#fff 0%,#fef9c3 50%,#fde68a 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      filter:drop-shadow(0 3px 6px rgba(0,0,0,.15));
    }

    /* Speech bubble */
    .speech-bubble {
      position:relative;background:#fff;border-radius:1.5rem;padding:1.2rem 2rem;
      box-shadow:0 8px 0 rgba(217,119,6,.3),0 12px 32px rgba(0,0,0,.12);
      border:3px solid rgba(217,119,6,.2);
    }
    .bubble-tail {
      position:absolute;bottom:-22px;left:36px;
      border-left:18px solid transparent;border-right:8px solid transparent;
      border-top:22px solid #fff;filter:drop-shadow(0 4px 2px rgba(0,0,0,.08));
    }
    .question-text {
      margin:0;font-family:'Fredoka One',cursive;
      font-size:clamp(1.3rem,4vw,2.2rem);color:#92400e;line-height:1.25;
    }
    .question-highlight { color:#d97706; }

    /* Play buttons */
    .play-btns { display:flex;flex-direction:column;gap:.7rem;align-items:flex-start; }
    .play-btn {
      display:inline-flex;align-items:center;gap:.8rem;
      background:none;border:none;cursor:pointer;padding:0;margin-top:.5rem;
      transition:transform .15s ease;
    }
    .play-btn:hover { transform:translateY(-4px); }
    .play-btn:hover .play-circle { box-shadow:0 0 24px #d97706,0 0 48px rgba(217,119,6,.4); }
    .play-btn:active { transform:translateY(1px); }
    .play-circle {
      width:56px;height:56px;background:linear-gradient(135deg,#fbbf24,#d97706);
      border-radius:50%;display:flex;align-items:center;justify-content:center;
      font-size:1.2rem;color:#fff;
      box-shadow:0 4px 0 #b45309,0 6px 18px rgba(251,191,36,.5);
      flex-shrink:0;transition:box-shadow .15s ease;
    }
    .play-label {
      font-family:'Fredoka One',cursive;font-size:clamp(1.8rem,5vw,3rem);
      color:#fff;letter-spacing:.04em;text-shadow:0 3px 0 rgba(0,0,0,.15);
    }
    .multi-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);
      border-radius:2rem;padding:.5rem 1.4rem .5rem .8rem;cursor:pointer;
      transition:all .15s ease;
    }
    .multi-btn:hover { background:rgba(255,255,255,.3);transform:translateY(-2px); }
    .multi-icon { font-size:1.3rem; }
    .multi-label {
      font-family:'Fredoka One',cursive;font-size:clamp(1rem,3vw,1.3rem);
      color:rgba(255,255,255,.9);letter-spacing:.03em;
    }

    /* Mute */
    .mute-home-btn {
      font-size:1.3rem;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.35);
      border-radius:50%;width:40px;height:40px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      transition:background .2s;margin-top:-.4rem;
    }
    .mute-home-btn:hover { background:rgba(255,255,255,.35); }

    /* Dots */
    .dots { display:flex;gap:.5rem; }
    .dot { width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.35);border:2px solid rgba(255,255,255,.5); }
    .dot.active { background:#fbbf24;border-color:#fbbf24;box-shadow:0 0 8px #fbbf24; }

    /* Image frame */
    .image-frame { position:relative;animation:bob 4s ease-in-out infinite; }
    .frame-glow { position:absolute;inset:-20px;background:radial-gradient(ellipse,rgba(251,191,36,.6) 0%,transparent 70%);border-radius:50%;z-index:0;animation:glowPulse 3s ease-in-out infinite; }
    .illustration { position:relative;z-index:1;width:clamp(180px,38vw,440px);height:auto;border-radius:2rem;box-shadow:0 20px 60px rgba(0,0,0,.2),0 0 0 6px rgba(255,255,255,.3),0 0 0 12px rgba(255,255,255,.1);display:block; }
    .frame-badge { position:absolute;top:-16px;right:-16px;z-index:2;width:52px;height:52px;background:linear-gradient(135deg,#fef9c3,#fbbf24);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;box-shadow:0 4px 12px rgba(251,191,36,.5);animation:spin 8s linear infinite; }
    @keyframes hilalaoJump {
      0%{transform:scale(1) rotate(0deg);filter:brightness(1);}
      20%{transform:scale(1.12) rotate(-4deg);filter:brightness(1.3);}
      45%{transform:scale(1.18) rotate(3deg);filter:brightness(1.5) drop-shadow(0 0 30px #fbbf24);}
      70%{transform:scale(1.1) rotate(-2deg);filter:brightness(1.2);}
      100%{transform:scale(1) rotate(0deg);filter:brightness(1);}
    }
    .illustration.jump-anim { animation:hilalaoJump .75s ease forwards; }

    /* Scroll hint */
    .scroll-hint {
      position:absolute;bottom:1.4rem;left:50%;transform:translateX(-50%);
      background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.35);
      border-radius:50%;width:44px;height:44px;display:flex;align-items:center;
      justify-content:center;cursor:pointer;animation:bounceDown 2s ease-in-out infinite;
      z-index:20;transition:background .2s;
    }
    .scroll-hint:hover { background:rgba(255,255,255,.3); }
    .scroll-arrow { font-size:1.3rem;color:#fff;line-height:1; }

    /* Keyframes */
    @keyframes drift{from{transform:translateX(-120px);}to{transform:translateX(calc(100vw + 120px));}}
    @keyframes floatIcon{0%,100%{transform:translateY(0) rotate(0deg);}33%{transform:translateY(-14px) rotate(5deg);}66%{transform:translateY(6px) rotate(-3deg);}}
    @keyframes bob{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
    @keyframes glowPulse{0%,100%{opacity:.6;transform:scale(1);}50%{opacity:1;transform:scale(1.08);}}
    @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes bounceDown{0%,100%{transform:translateX(-50%) translateY(0);}50%{transform:translateX(-50%) translateY(6px);}}

    /* ═══════════════════════════════ RULES ════════════════════════════════ */
    .rules-section {
      background: linear-gradient(180deg, #fffbeb 0%, #fff 100%);
      padding: clamp(3rem,8vw,5rem) clamp(1rem,5vw,3rem);
      display: flex; flex-direction: column; align-items: center; gap: 2.5rem;
    }
    .rules-header { text-align: center; display: flex; flex-direction: column; gap: .5rem; align-items: center; }
    .rules-title {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(1.8rem, 5vw, 2.8rem); color: #92400e; line-height: 1.1;
    }
    .rules-sub {
      margin: 0; font-family: 'Nunito', sans-serif; font-size: clamp(.9rem,2vw,1.1rem);
      color: #b45309; font-style: italic;
    }
    .lang-toggle {
      display:flex;gap:.5rem;background:rgba(217,119,6,.08);
      border:1.5px solid rgba(217,119,6,.2);border-radius:3rem;padding:.3rem;
    }
    .lang-btn {
      font-family:'Fredoka One',cursive;font-size:.95rem;letter-spacing:.08em;
      color:#92400e;background:transparent;border:none;
      border-radius:2rem;padding:.35rem .9rem;cursor:pointer;transition:all .2s ease;
    }
    .lang-btn.active { color:#fff;background:#d97706;box-shadow:0 2px 8px rgba(217,119,6,.4); }
    .lang-btn:not(.active):hover { color:#d97706; }
    .rules-cards { display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px; width: 100%; }
    .rule-card {
      background: #fff; border: 2px solid #fde68a; border-radius: 1.5rem;
      padding: clamp(1.2rem,3vw,1.8rem); display: flex; gap: 1.2rem; align-items: flex-start;
      box-shadow: 0 4px 18px rgba(217,119,6,.08); transition: border-color .2s, box-shadow .2s;
    }
    .rule-card:hover { border-color: #fbbf24; box-shadow: 0 8px 28px rgba(217,119,6,.15); }
    .rule-num {
      flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #fbbf24, #d97706);
      display: flex; align-items: center; justify-content: center;
      font-family: 'Fredoka One', cursive; font-size: 1.3rem; color: #fff;
      box-shadow: 0 3px 0 #b45309;
    }
    .rule-content { display: flex; flex-direction: column; gap: .5rem; flex: 1; min-width: 0; }
    .rule-q { margin: 0; font-family: 'Fredoka One', cursive; font-size: clamp(1rem, 2.5vw, 1.2rem); color: #92400e; }
    .rule-a { margin: 0; font-family: 'Nunito', sans-serif; font-size: clamp(.88rem, 2vw, 1rem); color: #374151; line-height: 1.7; }

    /* ═══════════════════════════════ ABOUT ════════════════════════════════ */
    .about-section {
      background:linear-gradient(180deg,#1c1000 0%,#0d0800 100%);
      padding:clamp(3rem,8vw,5rem) clamp(1rem,5vw,3rem);
      display:flex;flex-direction:column;align-items:center;gap:2.5rem;
    }
    .about-card {
      background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);
      border-radius:2rem;padding:clamp(1.4rem,4vw,2.2rem);
      display:flex;flex-direction:column;gap:1rem;max-width:560px;width:100%;
      transition:border-color .3s,background .3s;
    }
    .about-card:hover { background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22); }
    .card-icon { font-size:2.4rem;line-height:1; }
    .card-title { margin:0;font-family:'Fredoka One',cursive;font-size:clamp(1.3rem,3vw,1.8rem);color:#fbbf24;line-height:1.2; }
    .card-text { margin:0;font-family:'Nunito',sans-serif;font-size:clamp(.9rem,2vw,1.05rem);color:rgba(255,255,255,.8);line-height:1.7; }
    .contact-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      font-family:'Fredoka One',cursive;font-size:1.1rem;color:#1c1000;
      background:#fbbf24;text-decoration:none;border-radius:2rem;padding:.65rem 1.5rem;
      box-shadow:0 4px 0 #d97706,0 6px 18px rgba(251,191,36,.3);
      transition:transform .15s ease,box-shadow .15s ease;align-self:flex-start;margin-top:.3rem;
    }
    .contact-btn:hover { transform:translateY(-2px);box-shadow:0 6px 0 #d97706,0 10px 22px rgba(251,191,36,.4); }
    .contact-hint { margin:0;font-family:'Nunito',sans-serif;font-size:.82rem;color:rgba(255,255,255,.45);font-style:italic; }
    .visit-btn {
      display:inline-flex;align-items:center;gap:.6rem;
      font-family:'Fredoka One',cursive;font-size:1.05rem;color:#fbbf24;
      background:rgba(251,191,36,.1);border:1.5px solid rgba(251,191,36,.35);
      text-decoration:none;border-radius:2rem;padding:.6rem 1.4rem;
      transition:all .15s ease;align-self:flex-start;
    }
    .visit-btn:hover { background:rgba(251,191,36,.2);border-color:rgba(251,191,36,.6);color:#fde68a;transform:translateY(-1px); }

    /* ═══════════════════════════════ FOOTER ═══════════════════════════════ */
    .site-footer {
      background:#080500;padding:2rem 1.5rem;
      display:flex;flex-direction:column;align-items:center;gap:.6rem;
    }
    .footer-icon { font-size:2rem; }
    .footer-line { margin:0;font-family:'Nunito',sans-serif;font-size:.9rem;color:rgba(255,255,255,.45);text-align:center;font-style:italic; }
    .footer-copy { margin:0;font-family:'Fredoka One',cursive;font-size:.85rem;color:rgba(255,255,255,.25);letter-spacing:.06em; }

    /* ═══════════════════════════════ RESPONSIVE ═══════════════════════════ */
    @media(max-width:750px){
      .home{padding:5.5rem 1rem 1.5rem;align-items:flex-start;}
      .page-layout{flex-direction:column;align-items:center;gap:1.2rem;}
      .left-col{align-items:center;gap:1rem;order:1;}
      .right-col{order:2;}
      .bubble-tail{left:50%;transform:translateX(-50%);}
      .speech-bubble{width:100%;box-sizing:border-box;padding:.8rem 1.2rem;text-align:center;}
      .cloud-1,.cloud-2,.cloud-3{display:none;}
      .nav-right .nav-link{font-size:.72rem;padding:.28rem .6rem;}
      .play-btns{align-items:center;}
    }
    @media(max-width:480px){
      .home{padding:5rem .8rem 1rem;}
      .game-title{font-size:clamp(1.4rem,7vw,2rem);}
      .question-text{font-size:clamp(1.1rem,5.5vw,1.7rem);}
      .speech-bubble{padding:.7rem 1rem;border-radius:1rem;}
      .play-circle{width:44px;height:44px;font-size:1rem;}
      .play-label{font-size:clamp(1.4rem,8vw,2rem);}
      .illustration{width:min(80vw,280px);}
      .frame-badge{width:38px;height:38px;font-size:1.1rem;top:-10px;right:-10px;}
      .confetti{display:none;}
      .left-col{gap:.8rem;}
      .lang-mini-btn{font-size:.7rem;padding:.18rem .5rem;}
    }
  `],
  template: `
    <!-- ═══════════════ SPLASH ═══════════════ -->
    @if (!started()) {
      <div class="splash-overlay" (click)="onStart()">
        <img src="accueil-afakafaka-aho-mahita.png" alt="Afakafaka aho mahita" class="splash-logo" />
        <p class="splash-title">Afakafaka aho mahita</p>
        <p class="splash-tap">▶ {{ t().splashTap }}</p>
        <div class="splash-lang" (click)="$event.stopPropagation()">
          <button class="splash-lang-btn" [class.active]="langSvc.lang() === 'mg'" (click)="langSvc.set('mg')">MG</button>
          <button class="splash-lang-btn" [class.active]="langSvc.lang() === 'fr'" (click)="langSvc.set('fr')">FR</button>
          <button class="splash-lang-btn" [class.active]="langSvc.lang() === 'en'" (click)="langSvc.set('en')">EN</button>
        </div>
      </div>
    }

    <div class="home-wrapper" [class.hidden]="!started()">

      <!-- ═══════════════ HERO ═══════════════ -->
      <main class="home">

        <nav class="top-nav">
          <div class="lang-mini">
            <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'mg'" (click)="langSvc.set('mg')">MG</button>
            <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'fr'" (click)="langSvc.set('fr')">FR</button>
            <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'en'" (click)="langSvc.set('en')">EN</button>
          </div>
          <img src="logo-de-e-lalao.png" alt="e-lalao" class="nav-logo" />
          <div class="nav-right">
            <button class="nav-link" (click)="scrollToRules()">⭐ {{ t().navRules }}</button>
            <button class="nav-link" (click)="scrollToAbout()">⭐ e-lalao</button>
          </div>
        </nav>

        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>
        <div class="cloud cloud-3"></div>

        <div class="confetti c1">⭐</div>
        <div class="confetti c2">★</div>
        <div class="confetti c3">✦</div>
        <div class="confetti c4">✨</div>
        <div class="confetti c5">⭐</div>
        <div class="confetti c6">★</div>
        <div class="confetti c7">✦</div>
        <div class="confetti c8">✨</div>

        <div class="page-layout">
          <div class="left-col">
            <h1 class="game-title">Afakafaka aho mahita</h1>

            <div class="speech-bubble">
              <p class="question-text">
                Afakafaka<br>
                aho mahita<br>
                <span class="question-highlight">Omby?</span>
              </p>
              <div class="bubble-tail"></div>
            </div>

            <div class="play-btns">
              <button class="play-btn" (click)="onHilalao()">
                <span class="play-circle">▶</span>
                <span class="play-label">{{ t().playLabel }}</span>
              </button>
              <button class="multi-btn" (click)="scrollToRules()">
                <span class="multi-icon">📖</span>
                <span class="multi-label">{{ t().rulesBtn }}</span>
              </button>
            </div>

            <button class="mute-home-btn" (click)="audio.toggleMute()">
              {{ audio.muted() ? '🔇' : '🔊' }}
            </button>

            <div class="dots">
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>

          <div class="right-col">
            <div class="image-frame">
              <div class="frame-glow"></div>
              <img
                src="accueil-afakafaka-aho-mahita.png"
                alt="Afakafaka aho mahita"
                class="illustration"
                [class.jump-anim]="imageAnim()"
              />
              <div class="frame-badge">⭐</div>
            </div>
          </div>
        </div>

        <button class="scroll-hint" (click)="scrollToRules()">
          <span class="scroll-arrow">↓</span>
        </button>
      </main>

      <!-- ═══════════════ RULES ═══════════════ -->
      <section class="rules-section" id="fitsipika">
        <div class="rules-header">
          <div class="lang-toggle">
            <button class="lang-btn" [class.active]="langSvc.lang() === 'mg'" (click)="langSvc.set('mg')">MG</button>
            <button class="lang-btn" [class.active]="langSvc.lang() === 'fr'" (click)="langSvc.set('fr')">FR</button>
            <button class="lang-btn" [class.active]="langSvc.lang() === 'en'" (click)="langSvc.set('en')">EN</button>
          </div>
          <h2 class="rules-title">⭐ {{ t().rulesTitle }}</h2>
          <p class="rules-sub">{{ t().rulesSub }}</p>
        </div>

        <div class="rules-cards">
          <div class="rule-card">
            <div class="rule-num">1</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r1q }}</p>
              <p class="rule-a">{{ t().r1a }}</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-num">2</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r2q }}</p>
              <p class="rule-a">{{ t().r2a }}</p>
            </div>
          </div>
          <div class="rule-card">
            <div class="rule-num">3</div>
            <div class="rule-content">
              <p class="rule-q">{{ t().r3q }}</p>
              <p class="rule-a">{{ t().r3a }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════ ABOUT ═══════════════ -->
      <section class="about-section" id="apropos">
        <div class="about-card">
          <div class="card-icon">⭐</div>
          <h2 class="card-title">{{ t().aboutTitle }}</h2>
          <p class="card-text">{{ t().aboutText }}</p>
          <a class="contact-btn" href="mailto:fanomezanasarobidy2003@gmail.com" target="_blank" rel="noopener">
            <span>✉️</span>
            <span>{{ t().contactBtn }}</span>
          </a>
          <a class="visit-btn" href="https://e-lalao.mg" target="_blank" rel="noopener">
            <span>🌐</span>
            <span>{{ t().visitBtn }}</span>
          </a>
          <p class="contact-hint">{{ t().contactLabel }}</p>
        </div>
      </section>

      <!-- ═══════════════ FOOTER ═══════════════ -->
      <footer class="site-footer">
        <div class="footer-icon">⭐</div>
        <p class="footer-line">{{ t().footerLine }}</p>
        <p class="footer-copy">© {{ year }} e-lalao</p>
      </footer>

    </div>
  `,
})
export class HomeComponent {
  private router  = inject(Router);
  readonly audio  = inject(AudioService);
  readonly langSvc = inject(LangService);

  started   = signal(false);
  imageAnim = signal(false);
  t         = computed(() => T[this.langSvc.lang()]);
  readonly year = new Date().getFullYear();

  onStart() {
    this.started.set(true);
    this.audio.startBackground();
  }

  onHilalao() {
    this.audio.play('woueh');
    this.imageAnim.set(true);
    setTimeout(() => this.router.navigate(['/game']), 750);
  }

  scrollToRules() {
    document.getElementById('fitsipika')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToAbout() {
    document.getElementById('apropos')?.scrollIntoView({ behavior: 'smooth' });
  }

}
