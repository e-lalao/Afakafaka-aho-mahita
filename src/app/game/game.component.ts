import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService } from '../services/audio.service';
import { LangService } from '../services/lang.service';

const ALL_IDS = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25];

const NAMES: Record<'mg' | 'fr' | 'en', Record<number, string>> = {
  mg: {
    1:'Omby', 2:'Gana', 3:'Akoho', 4:'Vilia', 5:'Vilany',
    6:'Sotro rovitra', 7:'Sotro', 8:'Antsy', 9:'Frezy', 10:'Akondro',
    12:'Paoma', 13:'Laisoa', 14:'Voatavo', 15:'Voamanga', 16:'Ronono',
    17:'Voaloboka', 18:'Tongolo lay', 19:'Tongolo vodiny', 20:'Karaoty',
    21:'Voatabia', 22:'Trano', 23:'Fiara', 24:'Saka', 25:'Aliaka',
  },
  fr: {
    1:'Vache', 2:'Canard', 3:'Poule', 4:'Assiette', 5:'Marmite',
    6:'Fourchette', 7:'Cuillère', 8:'Couteau', 9:'Fraise', 10:'Banane',
    12:'Pomme', 13:'Chou', 14:'Courge', 15:'Patate douce', 16:'Lait',
    17:'Raisin', 18:'Ail', 19:'Ognon', 20:'Carotte',
    21:'Tomate', 22:'Maison', 23:'Voiture', 24:'Chat', 25:'Chien',
  },
  en: {
    1:'Cow', 2:'Duck', 3:'Hen', 4:'Plate', 5:'Pot',
    6:'Fork', 7:'Spoon', 8:'Knife', 9:'Strawberry', 10:'Banana',
    12:'Apple', 13:'Cabbage', 14:'Gourd', 15:'Sweet potato', 16:'Milk',
    17:'Grape', 18:'Garlic', 19:'Onion', 20:'Carrot',
    21:'Tomato', 22:'House', 23:'Car', 24:'Cat', 25:'Dog',
  },
};

const GAME_T = {
  mg: {
    wrongMsg:    'Tsy izy io, jereo tsara!',
    afapoBtn:    '🔍 Afapo',
    revealedMsg: 'Ny valiny dia ny',
    starsLabel:  'kintana',
    playAgain:   '▶ Hiverina hilalao',
    goHome:      '🏠 Pejy fandraisana',
  },
  fr: {
    wrongMsg:    'Ce n\'est pas ça, regarde bien !',
    afapoBtn:    '🔍 Révéler',
    revealedMsg: 'La réponse était',
    starsLabel:  'étoiles',
    playAgain:   '▶ Rejouer',
    goHome:      '🏠 Accueil',
  },
  en: {
    wrongMsg:    'That\'s not it, look carefully!',
    afapoBtn:    '🔍 Reveal',
    revealedMsg: 'The answer was',
    starsLabel:  'stars',
    playAgain:   '▶ Play again',
    goHome:      '🏠 Home',
  },
} as const;

interface Card {
  uid: number;
  imageId: number;
  isTarget: boolean;
}

type Phase = 'playing' | 'found' | 'revealed';

function buildRound(targetId: number): Card[] {
  const others = ALL_IDS.filter(id => id !== targetId);
  const targetPos = Math.floor(Math.random() * 16);
  return Array.from({ length: 16 }, (_, i) => {
    if (i === targetPos) return { uid: i, imageId: targetId, isTarget: true };
    const r = others[Math.floor(Math.random() * others.length)];
    return { uid: i, imageId: r, isTarget: false };
  });
}

@Component({
  selector: 'app-game',
  standalone: true,
  styles: [`
    :host { display: block; }

    /* ═══ BASE ═══ */
    .game-page {
      min-height: 100dvh;
      background:
        radial-gradient(ellipse 70% 50% at 10% 0%, #fef9c3 0%, transparent 55%),
        radial-gradient(ellipse 60% 45% at 90% 100%, #fde68a 0%, transparent 50%),
        linear-gradient(160deg, #fffde7 0%, #fef3c7 40%, #fde68a 80%, #fbbf24 100%);
      display: flex; flex-direction: column; align-items: center;
      padding: 0 clamp(.6rem,3vw,1.5rem) 2rem;
      box-sizing: border-box; gap: clamp(.5rem,1.5vw,.9rem);
      position: relative; overflow-x: clip;
      font-family: 'Nunito', sans-serif;
    }

    /* ═══ STICKY TOP ═══ */
    .sticky-top {
      position: sticky; top: 0; z-index: 50;
      align-self: stretch;
      display: flex; flex-direction: column; align-items: center;
      gap: clamp(.4rem,1.2vw,.7rem);
      padding: clamp(.5rem,1.5vw,.9rem) clamp(.6rem,3vw,1.5rem) clamp(.4rem,1vw,.6rem);
      background: rgba(255,252,220,.97);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      box-shadow: 0 3px 18px rgba(217,119,6,.13);
    }

    /* ═══ HEADER ═══ */
    .game-header {
      width: 100%; max-width: 660px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .score-badge {
      font-family: 'Fredoka One', cursive;
      font-size: clamp(1.1rem,3.5vw,1.5rem); color: #92400e;
      background: rgba(255,255,255,.7); border: 2px solid #fde68a;
      border-radius: 2rem; padding: .3rem 1rem;
      box-shadow: 0 2px 8px rgba(217,119,6,.12);
      backdrop-filter: blur(4px);
    }
    .header-btns { display: flex; gap: .5rem; align-items: center; }

    /* compact lang toggle in header */
    .lang-mini {
      display: flex; gap: 2px;
      background: rgba(255,255,255,.55); border: 1.5px solid #fde68a;
      border-radius: 1.8rem; padding: 3px;
    }
    .lang-mini-btn {
      font-family: 'Fredoka One', cursive; font-size: .75rem; letter-spacing: .05em;
      color: #b45309; background: transparent; border: none;
      border-radius: 1.4rem; padding: .22rem .58rem; cursor: pointer; transition: all .15s;
    }
    .lang-mini-btn.active { background: #d97706; color: #fff; }
    .lang-mini-btn:not(.active):hover { background: rgba(217,119,6,.12); }

    .mute-btn {
      font-size: 1.2rem; background: rgba(255,255,255,.55);
      border: 1.5px solid rgba(255,255,255,.7); border-radius: 50%;
      width: 38px; height: 38px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    .mute-btn:hover { background: rgba(255,255,255,.85); }

    /* ═══ QUESTION BANNER ═══ */
    .question-banner {
      width: 100%; max-width: 660px;
      background: rgba(255,255,255,.75); border: 3px solid rgba(217,119,6,.25);
      border-radius: 1.5rem; padding: clamp(.7rem,2vw,1.1rem) clamp(1rem,3vw,2rem);
      text-align: center; backdrop-filter: blur(6px);
      box-shadow: 0 6px 0 rgba(217,119,6,.2), 0 10px 28px rgba(0,0,0,.08);
    }
    .question-label {
      margin: 0; font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(.75rem,2.5vw,1rem); color: #b45309;
      text-transform: uppercase; letter-spacing: .08em; opacity: .85;
    }
    .question-target {
      margin: 0; font-family: 'Fredoka One', cursive;
      font-size: clamp(1.8rem,7vw,3.2rem); line-height: 1.1;
      background: linear-gradient(135deg, #78350f, #d97706);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,.1));
    }

    /* ═══ CARDS GRID ═══ */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: clamp(5px,1.8vw,11px);
      width: 100%; max-width: 660px;
    }

    /* ═══ INDIVIDUAL CARD ═══ */
    .img-card {
      position: relative; background: rgba(255,255,255,.88);
      border: 2.5px solid #fde68a; border-radius: clamp(8px,2vw,14px);
      padding: clamp(4px,1.2vw,7px); cursor: pointer;
      box-shadow: 0 3px 10px rgba(217,119,6,.1);
      transition: transform .15s ease, border-color .15s, box-shadow .15s;
      animation: float-bob 2.5s ease-in-out infinite;
      backdrop-filter: blur(2px); overflow: hidden;
    }
    .img-card:nth-child(2n)  { animation-duration: 3s;   animation-delay: .35s; }
    .img-card:nth-child(3n)  { animation-duration: 2.8s; animation-delay: .7s; }
    .img-card:nth-child(4n)  { animation-duration: 3.3s; animation-delay: 1.1s; }
    .img-card:nth-child(5n)  { animation-duration: 2.6s; animation-delay: 1.5s; }
    .img-card:nth-child(7n)  { animation-duration: 3.1s; animation-delay: .55s; }
    .img-card:nth-child(11n) { animation-duration: 2.9s; animation-delay: 1.9s; }

    .img-card:hover {
      transform: scale(1.07) translateY(-3px);
      border-color: #fbbf24;
      box-shadow: 0 8px 22px rgba(217,119,6,.28);
      z-index: 2;
    }
    .img-card:active { transform: scale(0.95); }

    .img-card.wrong-shake {
      animation: wrong-shake .45s ease forwards;
      border-color: #ef4444;
      background: rgba(254,226,226,.92);
    }
    .img-card.target-revealed {
      animation: target-pulse .9s ease-in-out infinite;
      border-color: #f59e0b;
      background: rgba(254,243,199,.6);
    }

    .card-img {
      width: 100%; aspect-ratio: 1;
      object-fit: contain; border-radius: calc(clamp(8px,2vw,14px) - 3px);
      display: block; pointer-events: none;
    }

    /* ═══ AFAPO BUTTON ═══ */
    .afapo-btn {
      display: inline-flex; align-items: center; gap: .6rem;
      font-family: 'Fredoka One', cursive;
      font-size: clamp(1rem,3.5vw,1.4rem); color: #92400e;
      background: rgba(255,255,255,.75); border: 2.5px solid #fde68a;
      border-radius: 2rem; padding: .65rem 1.8rem;
      cursor: pointer; transition: all .2s ease;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 0 rgba(217,119,6,.22), 0 6px 16px rgba(0,0,0,.06);
    }
    .afapo-btn:hover {
      background: rgba(255,255,255,.95); border-color: #fbbf24;
      transform: translateY(-2px);
      box-shadow: 0 6px 0 rgba(217,119,6,.22), 0 12px 22px rgba(217,119,6,.15);
    }
    .afapo-btn:active { transform: translateY(1px); }

    /* ═══ WRONG TOAST ═══ */
    .wrong-toast {
      position: fixed; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #fff; border: 3px solid #ef4444;
      border-radius: 1.8rem; padding: 1.2rem 2.2rem;
      font-family: 'Fredoka One', cursive;
      font-size: clamp(1.1rem,4.5vw,1.7rem); color: #dc2626;
      text-align: center; z-index: 200;
      box-shadow: 0 12px 48px rgba(239,68,68,.35);
      animation: toast-pop .25s cubic-bezier(.34,1.56,.64,1);
      pointer-events: none;
    }
    .toast-emoji { font-size: 1.8rem; display: block; margin-bottom: .3rem; }

    /* ═══ FOUND OVERLAY ═══ */
    .found-overlay {
      position: fixed; inset: 0;
      background: rgba(255,253,235,.88); backdrop-filter: blur(8px);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 300; gap: clamp(.8rem,2vw,1.2rem); padding: 2rem;
      animation: overlay-in .3s ease;
    }
    .found-img {
      width: clamp(140px,45vw,300px);
      animation: found-bounce .55s cubic-bezier(.34,1.56,.64,1);
      filter: drop-shadow(0 8px 24px rgba(217,119,6,.3));
    }
    .found-plus {
      font-family: 'Fredoka One', cursive;
      font-size: clamp(2rem,7vw,3.5rem); color: #d97706; margin: 0;
      text-shadow: 0 3px 0 rgba(0,0,0,.08);
      animation: score-pop .4s cubic-bezier(.34,1.56,.64,1) .2s both;
    }
    .found-total {
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(1rem,3.5vw,1.5rem); color: #78350f; margin: 0;
    }

    /* ═══ REVEALED END PANEL ═══ */
    .revealed-panel {
      background: rgba(255,255,255,.8); border: 2.5px solid #fde68a;
      border-radius: 1.5rem; padding: 1rem 1.5rem;
      text-align: center; backdrop-filter: blur(6px);
      width: 100%; max-width: 660px;
      box-shadow: 0 4px 18px rgba(217,119,6,.1);
    }
    .revealed-msg {
      font-family: 'Fredoka One', cursive;
      font-size: clamp(1rem,3.5vw,1.4rem); color: #b45309; margin: 0 0 .8rem;
    }
    .revealed-total {
      font-family: 'Nunito', sans-serif; font-weight: 800;
      font-size: clamp(1rem,3vw,1.3rem); color: #78350f; margin: 0 0 1rem;
    }

    /* ═══ ROUND BUTTONS ═══ */
    .round-btns { display: flex; gap: .8rem; justify-content: center; flex-wrap: wrap; }
    .btn-play-again {
      display: inline-flex; align-items: center; gap: .5rem;
      font-family: 'Fredoka One', cursive; font-size: clamp(1rem,3.5vw,1.25rem);
      color: #fff; background: linear-gradient(135deg, #fbbf24, #d97706);
      border: none; border-radius: 2rem; padding: .7rem 1.6rem;
      cursor: pointer; box-shadow: 0 4px 0 #b45309, 0 6px 16px rgba(217,119,6,.3);
      transition: all .15s ease;
    }
    .btn-play-again:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #b45309, 0 10px 20px rgba(217,119,6,.35); }
    .btn-play-again:active { transform: translateY(1px); box-shadow: 0 2px 0 #b45309; }
    .btn-home {
      display: inline-flex; align-items: center; gap: .5rem;
      font-family: 'Fredoka One', cursive; font-size: clamp(1rem,3.5vw,1.25rem);
      color: #92400e; background: rgba(255,255,255,.85); border: 2px solid #fde68a;
      border-radius: 2rem; padding: .7rem 1.6rem; cursor: pointer;
      transition: all .15s ease;
    }
    .btn-home:hover { background: #fff; border-color: #fbbf24; transform: translateY(-1px); }

    /* ═══ KEYFRAMES ═══ */
    @keyframes float-bob {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50%       { transform: translateY(-9px) rotate(1deg); }
    }
    @keyframes wrong-shake {
      0%   { transform: translateX(0); }
      18%  { transform: translateX(-9px) rotate(-2deg); }
      36%  { transform: translateX(9px)  rotate(2deg); }
      54%  { transform: translateX(-6px) rotate(-1deg); }
      72%  { transform: translateX(6px)  rotate(1deg); }
      100% { transform: translateX(0); }
    }
    @keyframes target-pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(245,158,11,.6), 0 0 20px rgba(245,158,11,.25); transform: scale(1); }
      50%       { box-shadow: 0 0 0 8px rgba(245,158,11,.3), 0 0 32px rgba(245,158,11,.45); transform: scale(1.04); }
    }
    @keyframes found-bounce {
      0%   { transform: scale(.4) rotate(-12deg); opacity: 0; }
      65%  { transform: scale(1.12) rotate(6deg);  opacity: 1; }
      100% { transform: scale(1)   rotate(0deg); }
    }
    @keyframes score-pop {
      0%   { transform: scale(.5); opacity: 0; }
      100% { transform: scale(1);  opacity: 1; }
    }
    @keyframes toast-pop {
      0%   { transform: translate(-50%,-60%) scale(.8); opacity: 0; }
      100% { transform: translate(-50%,-50%) scale(1);  opacity: 1; }
    }
    @keyframes overlay-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ═══ RESPONSIVE ═══ */
    @media (max-width: 440px) {
      .cards-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 280px) {
      .cards-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `],
  template: `
    <div class="game-page">

      <!-- Sticky header + question -->
      <div class="sticky-top">
        <div class="game-header">
          <div class="score-badge">⭐ {{ score() }}</div>
          <div class="header-btns">
            <div class="lang-mini">
              <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'mg'" (click)="langSvc.set('mg')">MG</button>
              <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'fr'" (click)="langSvc.set('fr')">FR</button>
              <button class="lang-mini-btn" [class.active]="langSvc.lang() === 'en'" (click)="langSvc.set('en')">EN</button>
            </div>
            <button class="mute-btn" (click)="audio.toggleMute()">
              {{ audio.muted() ? '🔇' : '🔊' }}
            </button>
          </div>
        </div>

        <div class="question-banner">
          <p class="question-label">Afakafaka aho mahita</p>
          <p class="question-target">{{ targetName() }}</p>
        </div>
      </div>

      <!-- Cards grid -->
      <div class="cards-grid">
        @for (card of cards(); track card.uid) {
          <div
            class="img-card"
            [class.wrong-shake]="wrongCardUid() === card.uid"
            [class.target-revealed]="phase() === 'revealed' && card.isTarget"
            (click)="onCardClick(card)">
            <img [src]="card.imageId + '.png'" [alt]="imageName(card.imageId)" class="card-img" />
          </div>
        }
      </div>

      <!-- Afapo button -->
      @if (phase() === 'playing') {
        <button class="afapo-btn" (click)="onAfapo()">{{ gt().afapoBtn }}</button>
      }

      <!-- Revealed end panel -->
      @if (phase() === 'revealed') {
        <div class="revealed-panel">
          <p class="revealed-msg">{{ gt().revealedMsg }} <strong>{{ targetName() }}</strong> !</p>
          <p class="revealed-total">⭐ {{ score() }} {{ gt().starsLabel }}</p>
          <div class="round-btns">
            <button class="btn-play-again" (click)="newRound()">{{ gt().playAgain }}</button>
            <button class="btn-home" (click)="goHome()">{{ gt().goHome }}</button>
          </div>
        </div>
      }

      <!-- Wrong toast -->
      @if (showWrong()) {
        <div class="wrong-toast">
          <span class="toast-emoji">🙈</span>
          {{ gt().wrongMsg }}
        </div>
      }

      <!-- Found overlay -->
      @if (phase() === 'found') {
        <div class="found-overlay">
          <img src="found-it.png" alt="Found!" class="found-img" />
          <p class="found-plus">+ 1 ⭐</p>
          <p class="found-total">{{ gt().starsLabel }} : {{ score() }} ⭐</p>
          <div class="round-btns">
            <button class="btn-play-again" (click)="newRound()">{{ gt().playAgain }}</button>
            <button class="btn-home" (click)="goHome()">{{ gt().goHome }}</button>
          </div>
        </div>
      }

    </div>
  `,
})
export class GameComponent implements OnInit, OnDestroy {
  private router   = inject(Router);
  readonly audio   = inject(AudioService);
  readonly langSvc = inject(LangService);

  phase        = signal<Phase>('playing');
  targetId     = signal(0);
  cards        = signal<Card[]>([]);
  score        = signal(0);
  showWrong    = signal(false);
  wrongCardUid = signal(-1);

  targetName = computed(() => NAMES[this.langSvc.lang()][this.targetId()] ?? '');
  gt         = computed(() => GAME_T[this.langSvc.lang()]);

  private wrongTimer: ReturnType<typeof setTimeout> | null = null;
  private shakeTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.audio.startBackground();
    this.startRound();
  }

  ngOnDestroy() {
    if (this.wrongTimer !== null) clearTimeout(this.wrongTimer);
    if (this.shakeTimer !== null) clearTimeout(this.shakeTimer);
  }

  imageName(id: number): string { return NAMES[this.langSvc.lang()][id] ?? ''; }

  startRound() {
    const target = ALL_IDS[Math.floor(Math.random() * ALL_IDS.length)];
    this.targetId.set(target);
    this.cards.set(buildRound(target));
    this.phase.set('playing');
    this.showWrong.set(false);
    this.wrongCardUid.set(-1);
  }

  onCardClick(card: Card) {
    if (this.phase() !== 'playing') return;
    this.audio.play('click');
    if (card.isTarget) {
      this.phase.set('found');
      this.score.update(s => s + 1);
      this.audio.play('woueh');
    } else {
      this.audio.play('wrong');
      this.wrongCardUid.set(card.uid);
      if (this.shakeTimer !== null) clearTimeout(this.shakeTimer);
      this.shakeTimer = setTimeout(() => this.wrongCardUid.set(-1), 500);
      this.showWrong.set(true);
      if (this.wrongTimer !== null) clearTimeout(this.wrongTimer);
      this.wrongTimer = setTimeout(() => this.showWrong.set(false), 2000);
    }
  }

  onAfapo() {
    this.audio.play('click');
    this.phase.set('revealed');
    this.showWrong.set(false);
  }

  newRound() {
    this.audio.play('click');
    this.startRound();
  }

  goHome() {
    this.audio.play('click');
    this.router.navigate(['/']);
  }
}
