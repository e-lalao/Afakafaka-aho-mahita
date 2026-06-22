import { Injectable, signal } from '@angular/core';

export type Lang = 'mg' | 'fr' | 'en';

function savedLang(): Lang {
  try {
    const v = localStorage.getItem('afakafaka-lang') as Lang;
    if (v === 'mg' || v === 'fr' || v === 'en') return v;
  } catch { /* private browsing */ }
  return 'mg';
}

@Injectable({ providedIn: 'root' })
export class LangService {
  lang = signal<Lang>(savedLang());

  set(l: Lang) {
    this.lang.set(l);
    try { localStorage.setItem('afakafaka-lang', l); } catch { }
  }
}
