/**
 * Модуль зарубежного скаутинга и трансферных предложений для «Вирт РПЛ».
 * Если игрок хорошо играет (высокий рейтинг, MOTM, голы, ассисты, отличная форма),
 * зарубежные клубы присылают предложение о покупке или аренде.
 * Нейросеть (Gemini) определяет клуб, стоимость, тип сделки, зарплату и скаутский отчёт.
 */

import { GoogleGenAI } from '@google/genai';

export interface ForeignClub {
  id: string;
  name: string;
  country: string;
  flag: string;
  league: string;
  tier: 1 | 2 | 3;
  primaryColor: string;
  secondaryColor: string;
}

export const FOREIGN_CLUBS: ForeignClub[] = [
  // Tier 1: Топ-клубы мира (для звезд и игроков с рейтингом 80+)
  { id: 'real_madrid', name: 'Реал Мадрид', country: 'Испания', flag: '🇪🇸', league: 'Ла Лига', tier: 1, primaryColor: '#ffffff', secondaryColor: '#00529f' },
  { id: 'barcelona', name: 'Барселона', country: 'Испания', flag: '🇪🇸', league: 'Ла Лига', tier: 1, primaryColor: '#004d98', secondaryColor: '#a50044' },
  { id: 'mancity', name: 'Манчестер Сити', country: 'Англия', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', league: 'Премьер-лига', tier: 1, primaryColor: '#6cabdd', secondaryColor: '#1c2c5b' },
  { id: 'arsenal', name: 'Арсенал', country: 'Англия', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', league: 'Премьер-лига', tier: 1, primaryColor: '#ef0107', secondaryColor: '#063672' },
  { id: 'liverpool', name: 'Ливерпуль', country: 'Англия', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', league: 'Премьер-лига', tier: 1, primaryColor: '#c8102e', secondaryColor: '#00b2a9' },
  { id: 'chelsea', name: 'Челси', country: 'Англия', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', league: 'Премьер-лига', tier: 1, primaryColor: '#034694', secondaryColor: '#dba111' },
  { id: 'psg', name: 'ПСЖ', country: 'Франция', flag: '🇫🇷', league: 'Лига 1', tier: 1, primaryColor: '#004170', secondaryColor: '#da291c' },
  { id: 'bayern', name: 'Бавария Мюнхен', country: 'Германия', flag: '🇩🇪', league: 'Бундеслига', tier: 1, primaryColor: '#dc052d', secondaryColor: '#0066b2' },
  { id: 'inter', name: 'Интер Милан', country: 'Италия', flag: '🇮🇹', league: 'Серия А', tier: 1, primaryColor: '#001489', secondaryColor: '#000000' },

  // Tier 2: Крепкие европейские клубы (рейтинг 74–82)
  { id: 'atalanta', name: 'Аталанта', country: 'Италия', flag: '🇮🇹', league: 'Серия А', tier: 2, primaryColor: '#1e73be', secondaryColor: '#000000' },
  { id: 'leverkusen', name: 'Байер 04', country: 'Германия', flag: '🇩🇪', league: 'Бундеслига', tier: 2, primaryColor: '#e32221', secondaryColor: '#000000' },
  { id: 'dortmund', name: 'Боруссия Дортмунд', country: 'Германия', flag: '🇩🇪', league: 'Бундеслига', tier: 2, primaryColor: '#fde100', secondaryColor: '#000000' },
  { id: 'roma', name: 'Рома', country: 'Италия', flag: '🇮🇹', league: 'Серия А', tier: 2, primaryColor: '#8e1f2f', secondaryColor: '#f0bc42' },
  { id: 'lazio', name: 'Лацио', country: 'Италия', flag: '🇮🇹', league: 'Серия А', tier: 2, primaryColor: '#87d8f7', secondaryColor: '#ffffff' },
  { id: 'fiorentina', name: 'Фиорентина', country: 'Италия', flag: '🇮🇹', league: 'Серия А', tier: 2, primaryColor: '#4f2d7f', secondaryColor: '#ffffff' },
  { id: 'sociedad', name: 'Реал Сосьедад', country: 'Испания', flag: '🇪🇸', league: 'Ла Лига', tier: 2, primaryColor: '#0067b1', secondaryColor: '#ffffff' },
  { id: 'villarreal', name: 'Вильярреал', country: 'Испания', flag: '🇪🇸', league: 'Ла Лига', tier: 2, primaryColor: '#ffe500', secondaryColor: '#0055a5' },
  { id: 'monaco', name: 'Монако', country: 'Франция', flag: '🇫🇷', league: 'Лига 1', tier: 2, primaryColor: '#e2001a', secondaryColor: '#ffffff' },
  { id: 'marseille', name: 'Марсель', country: 'Франция', flag: '🇫🇷', league: 'Лига 1', tier: 2, primaryColor: '#2fa5dc', secondaryColor: '#ffffff' },
  { id: 'benfica', name: 'Бенфика', country: 'Португалия', flag: '🇵🇹', league: 'Примейра', tier: 2, primaryColor: '#e30613', secondaryColor: '#ffffff' },
  { id: 'sporting', name: 'Спортинг Лиссабон', country: 'Португалия', flag: '🇵🇹', league: 'Примейра', tier: 2, primaryColor: '#008057', secondaryColor: '#ffffff' },
  { id: 'porto', name: 'Порту', country: 'Португалия', flag: '🇵🇹', league: 'Примейра', tier: 2, primaryColor: '#003882', secondaryColor: '#ffffff' },

  // Tier 3: Высокобюджетные и амбициозные лиги (Турция, Саудовская Аравия, Нидерланды)
  { id: 'galatasaray', name: 'Галатасарай', country: 'Турция', flag: '🇹🇷', league: 'Суперлига', tier: 3, primaryColor: '#a90432', secondaryColor: '#fdb912' },
  { id: 'fenerbahce', name: 'Фенербахче', country: 'Турция', flag: '🇹🇷', league: 'Суперлига', tier: 3, primaryColor: '#002d72', secondaryColor: '#fff000' },
  { id: 'besiktas', name: 'Бешикташ', country: 'Турция', flag: '🇹🇷', league: 'Суперлига', tier: 3, primaryColor: '#000000', secondaryColor: '#ffffff' },
  { id: 'alhilal', name: 'Аль-Хиляль', country: 'Саудовская Аравия', flag: '🇸🇦', league: 'Saudi Pro League', tier: 3, primaryColor: '#0055a5', secondaryColor: '#ffffff' },
  { id: 'alnassr', name: 'Аль-Наср', country: 'Саудовская Аравия', flag: '🇸🇦', league: 'Saudi Pro League', tier: 3, primaryColor: '#fcee21', secondaryColor: '#003a70' },
  { id: 'ajax', name: 'Аякс', country: 'Нидерланды', flag: '🇳🇱', league: 'Эредивизи', tier: 3, primaryColor: '#d2122e', secondaryColor: '#ffffff' },
  { id: 'psv', name: 'ПСВ Эйндховен', country: 'Нидерланды', flag: '🇳🇱', league: 'Эредивизи', tier: 3, primaryColor: '#ed1c24', secondaryColor: '#ffffff' },
  { id: 'feyenoord', name: 'Фейеноорд', country: 'Нидерланды', flag: '🇳🇱', league: 'Эредивизи', tier: 3, primaryColor: '#e30613', secondaryColor: '#000000' },
  { id: 'celtic', name: 'Селтик', country: 'Шотландия', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', league: 'Премьершип', tier: 3, primaryColor: '#008542', secondaryColor: '#ffffff' },
  { id: 'flamengo', name: 'Фламенго', country: 'Бразилия', flag: '🇧🇷', league: 'Серия А', tier: 3, primaryColor: '#c3281e', secondaryColor: '#000000' },
];

export interface ForeignOffer {
  id: string;
  pid: string;
  playerName: string;
  pos: string;
  playerRating: number;
  clubId: string;
  clubName: string;
  buyerClub: string;
  buyerCountry: string;
  buyerLeague: string;
  buyerFlag: string;
  buyerLogo: string;
  type: 'sale' | 'loan';
  fee: string;
  feeAmount: number; // в миллионах евро
  wage: string;
  durationYears?: number;
  loanTerm?: string;
  scoutReport: string;
  triggerReason: string;
  matchId?: string;
  date: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

/** Генератор стилизованного SVG герба для зарубежного клуба */
export function getForeignClubBadgeSvg(club: ForeignClub): string {
  const p = club.primaryColor || '#1e3a8a';
  const s = club.secondaryColor || '#ffffff';
  const initials = club.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${club.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p}"/>
        <stop offset="100%" stop-color="${s}"/>
      </linearGradient>
    </defs>
    <path d="M50 5 L88 20 C88 60 50 95 50 95 C50 95 12 60 12 20 Z" fill="url(#g_${club.id})" stroke="#1f2937" stroke-width="3"/>
    <path d="M50 15 L78 27 C78 55 50 82 50 82 C50 82 22 55 22 27 Z" fill="${p}" opacity="0.85"/>
    <circle cx="50" cy="45" r="20" fill="${s}" opacity="0.25"/>
    <text x="50" y="52" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>
    <text x="50" y="72" font-family="system-ui, sans-serif" font-weight="700" font-size="8" fill="#facc15" text-anchor="middle">${club.country.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

/**
 * ИИ оценивает выступление игрока и генерирует реалистичный оффер от зарубежного клуба.
 */
export async function createForeignOfferWithAI(params: {
  player: any;
  club: any;
  performanceReason: string;
  matchRating?: number;
  matchId?: string;
}): Promise<ForeignOffer> {
  const { player, club, performanceReason, matchRating, matchId } = params;
  const rating = Number(player.rating || matchRating || 72);
  const now = new Date().toISOString();

  // Отбираем кандидатов зарубежных клубов по уровню игрока
  let candidates = FOREIGN_CLUBS;
  if (rating >= 80) {
    candidates = FOREIGN_CLUBS.filter(c => c.tier === 1 || c.tier === 2);
  } else if (rating >= 75) {
    candidates = FOREIGN_CLUBS.filter(c => c.tier === 2 || c.tier === 3);
  } else {
    candidates = FOREIGN_CLUBS.filter(c => c.tier === 3 || c.tier === 2);
  }
  if (!candidates.length) candidates = FOREIGN_CLUBS;
  const targetClub = candidates[Math.floor(Math.random() * candidates.length)];

  // Попытка использовать Gemini 3.8 Flash
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `Ты — международный футбольный скаут и спортивный директор ведущих европейских и мировых клубов.
Футболист из чемпионата России продемонстрировал впечатляющую игру и попал на радары зарубежных скаутов:
- Имя игрока: ${player.name}
- Текущий российский клуб: ${club.name}
- Амплуа: ${player.pos}
- Базовый рейтинг: ${rating}
- Повод для интереса скаутов: ${performanceReason} (оценка в матче: ${matchRating || rating})
- Потенциальный зарубежный покупатель: ${targetClub.name} (${targetClub.country}, ${targetClub.league})

Сгенерируй строго в формате JSON трансферное предложение:
{
  "type": "sale" или "loan",
  "feeAmount": число в миллионах евро (например, 8.5 для покупки или 1.5 для аренды),
  "feeDescription": "строка с форматированием суммы, например '€8.5 млн' или '€1.2 млн за аренду с правом выкупа за €7 млн'",
  "wage": "зарплата игрока, например '€1.6 млн в год'",
  "durationYears": число от 1 до 5,
  "scoutReport": "развернутый скаутский комментарий (2-3 предложения) на русском языке: почему клуб готов заплатить такие деньги, какие сильные стороны подметили скауты и в какую тактическую схему планируют встроить футболиста"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'Отвечай только валидным JSON без markdown оберток.'
        }
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      if (parsed && parsed.feeAmount) {
        const feeNum = parseFloat(parsed.feeAmount) || (rating * 0.15);
        return {
          id: 'fo_' + Math.random().toString(36).substring(2, 9),
          pid: player.id,
          playerName: player.name,
          pos: player.pos,
          playerRating: rating,
          clubId: club.id,
          clubName: club.name,
          buyerClub: targetClub.name,
          buyerCountry: targetClub.country,
          buyerLeague: targetClub.league,
          buyerFlag: targetClub.flag,
          buyerLogo: getForeignClubBadgeSvg(targetClub),
          type: parsed.type === 'loan' ? 'loan' : 'sale',
          fee: parsed.feeDescription || `€${feeNum.toFixed(1)} млн`,
          feeAmount: feeNum,
          wage: parsed.wage || `€${(feeNum * 0.2).toFixed(1)} млн/год`,
          durationYears: parsed.durationYears || (parsed.type === 'loan' ? 1 : 4),
          loanTerm: parsed.type === 'loan' ? 'Аренда на 1 сезон' : undefined,
          scoutReport: parsed.scoutReport || `Скауты «${targetClub.name}» высоко оценили игру футболиста и видят в нем усиление основного состава.`,
          triggerReason: performanceReason,
          matchId,
          date: now,
          status: 'pending'
        };
      }
    } catch (err) {
      console.warn('[AI Studio] Gemini foreign scout generation fallback:', err);
    }
  }

  // Эвристический умный генератор (fallback)
  const isLoan = Math.random() < 0.35;
  let baseFee = (rating - 60) * 0.65 + (Math.random() * 4);
  if (targetClub.tier === 1) baseFee *= 1.8;
  if (targetClub.tier === 3) baseFee *= 0.85;
  baseFee = Math.max(1.2, Math.round(baseFee * 10) / 10);

  const feeAmount = isLoan ? Math.max(0.6, Math.round(baseFee * 0.2 * 10) / 10) : baseFee;
  const feeStr = isLoan
    ? `€${feeAmount.toFixed(1)} млн (аренда с опцией выкупа за €${(feeAmount * 5).toFixed(1)} млн)`
    : `€${feeAmount.toFixed(1)} млн`;

  const scoutComments = [
    `Аналитический департамент «${targetClub.name}» отметил выдающийся тайминг, хладнокровие и влияние на результат в недавних матчах. Клуб готов к немедленному оформлению сделки.`,
    `Главный тренер «${targetClub.name}» лично запросил усиление на позицию ${player.pos}. Футболист идеально подходит под высокий прессинг и быстрый переход в атаку.`,
    `Скауты зафиксировали высокую интенсивность единоборств и тактическую зрелость. «${targetClub.name}» видит в игроке прямую замену уходящему лидеру команды.`,
    `Впечатляющее выступление привлекло внимание европейских клубов: «${targetClub.name}» опережает конкурентов и делает официальное предложение.`
  ];
  const scoutReport = scoutComments[Math.floor(Math.random() * scoutComments.length)];

  return {
    id: 'fo_' + Math.random().toString(36).substring(2, 9),
    pid: player.id,
    playerName: player.name,
    pos: player.pos,
    playerRating: rating,
    clubId: club.id,
    clubName: club.name,
    buyerClub: targetClub.name,
    buyerCountry: targetClub.country,
    buyerLeague: targetClub.league,
    buyerFlag: targetClub.flag,
    buyerLogo: getForeignClubBadgeSvg(targetClub),
    type: isLoan ? 'loan' : 'sale',
    fee: feeStr,
    feeAmount,
    wage: `€${Math.max(0.4, (feeAmount * 0.18)).toFixed(1)} млн/год`,
    durationYears: isLoan ? 1 : 4,
    loanTerm: isLoan ? 'Аренда на 1 сезон' : undefined,
    scoutReport,
    triggerReason: performanceReason,
    matchId,
    date: now,
    status: 'pending'
  };
}

/**
 * Проверка матча на яркие выступления игроков и генерация офферов от зарубежных клубов.
 */
export async function checkForeignInterestAfterMatch(
  db: any,
  match: any,
  fixture: any
): Promise<ForeignOffer[]> {
  if (!db || !match || !fixture) return [];
  if (!db.foreignOffers) db.foreignOffers = [];
  if (!db.transfers) db.transfers = [];

  const createdOffers: ForeignOffer[] = [];
  const ratings = match.ratings || {};
  const motm = match.motm;

  // Ищем лучших игроков матча (оценка >= 7.2 или MOTM или забившие голы)
  const candidatePids: { pid: string; rating: number; reason: string }[] = [];

  if (motm && motm.pid) {
    candidatePids.push({
      pid: motm.pid,
      rating: motm.rating || 8.0,
      reason: `Признан лучшим игроком матча (MOTM) с рейтингом ${motm.rating || 8.0}`
    });
  }

  for (const [pid, rate] of Object.entries<any>(ratings)) {
    const numRate = typeof rate === 'number' ? rate : (rate?.rating || 0);
    if (numRate >= 7.4 && !candidatePids.some(c => c.pid === pid)) {
      candidatePids.push({
        pid,
        rating: numRate,
        reason: `Выдающийся индивидуальный перформанс с оценкой ${numRate.toFixed(1)}`
      });
    }
  }

  // Также проверяем авторов голов и ассистов
  for (const ev of (match.events || [])) {
    if (ev.type === 'goal' && ev.pids?.[0]) {
      const pid = ev.pids[0];
      if (!candidatePids.some(c => c.pid === pid)) {
        candidatePids.push({
          pid,
          rating: 7.2,
          reason: `Автор забитого гола в матче ${fixture.round ? fixture.round + '-го тура' : ''}`
        });
      }
    }
  }

  for (const candidate of candidatePids.slice(0, 2)) {
    const p = (db.players || []).find((x: any) => x.id === candidate.pid);
    if (!p || !p.teamId) continue;
    const clb = (db.teams || []).find((t: any) => t.id === p.teamId);
    if (!clb) continue;

    // Не спамим: если уже есть активное ожидающее предложение по этому игроку, пропускаем
    const alreadyPending = db.foreignOffers.some((o: any) => o.pid === p.id && o.status === 'pending');
    if (alreadyPending) continue;

    // Шанс генерации предложения: 70% для MOTM / топ-рейтинга
    if (Math.random() < 0.75) {
      try {
        const offer = await createForeignOfferWithAI({
          player: p,
          club: clb,
          performanceReason: candidate.reason,
          matchRating: candidate.rating,
          matchId: fixture.id
        });
        db.foreignOffers.push(offer);
        createdOffers.push(offer);

        // Также синхронизируем с db.transfers
        db.transfers.push({
          id: 'tr_' + offer.id,
          pid: offer.pid,
          playerName: offer.playerName,
          pos: offer.pos,
          from: clb.id,
          fromName: clb.name,
          to: null,
          toName: offer.buyerClub,
          isForeign: true,
          buyerCountry: offer.buyerCountry,
          buyerFlag: offer.buyerFlag,
          type: offer.type,
          fee: offer.fee,
          feeAmount: offer.feeAmount,
          date: offer.date.slice(0, 10),
          status: 'pending',
          clubApproval: 'pending',
          adminApproval: 'approved',
          note: offer.scoutReport,
          foreignOfferId: offer.id
        });
      } catch (err) {
        console.error('Ошибка создания зарубежного трансферного оффера:', err);
      }
    }
  }

  return createdOffers;
}

/**
 * Обработка ответа владельца клуба на зарубежное предложение (принять / отклонить).
 */
export function respondToForeignOffer(
  db: any,
  offerId: string,
  action: 'accept' | 'reject',
  clubId: string,
  comment?: string
) {
  if (!db.foreignOffers) db.foreignOffers = [];
  const offer = db.foreignOffers.find((o: any) => o.id === offerId);
  if (!offer || offer.status !== 'pending') {
    throw new Error('Предложение не найдено или уже обработано');
  }
  if (offer.clubId !== clubId) {
    throw new Error('Это предложение адресовано другому клубу');
  }

  const p = (db.players || []).find((x: any) => x.id === offer.pid);
  const seller = (db.teams || []).find((t: any) => t.id === clubId);

  const tr = (db.transfers || []).find((x: any) => x.foreignOfferId === offerId || x.id === 'tr_' + offerId);

  if (action === 'accept') {
    offer.status = 'accepted';
    if (tr) {
      tr.status = 'approved';
      tr.clubApproval = 'approved';
    }

    // Удаляем игрока из текущего состава
    if (db.squads && db.squads[clubId]) {
      db.squads[clubId] = db.squads[clubId].filter((id: string) => id !== offer.pid);
    }
    if (p) {
      p.teamId = null;
      if (offer.type === 'loan') {
        p.loanTo = offer.buyerClub;
        p.loanTerm = offer.loanTerm || 'Аренда на 1 сезон';
      } else {
        p.realClub = offer.buyerClub;
        p.foreignClub = offer.buyerClub;
        p.status = 'sold_abroad';
      }
    }

    // Зачисляем денежные средства в бюджет клуба
    const feeEuros = Math.round((offer.feeAmount || 1) * 1_000_000);
    if (seller) {
      const prevBudget = seller.budget || 0;
      seller.budget = prevBudget + feeEuros;

      if (!Array.isArray(db.budgetHistory)) db.budgetHistory = [];
      db.budgetHistory.push({
        id: 'bh_' + Math.random().toString(36).substring(2, 9),
        teamId: seller.id,
        teamName: seller.name,
        amount: feeEuros,
        prevBudget,
        newBudget: seller.budget,
        type: offer.type === 'loan' ? 'foreign_loan_income' : 'foreign_sale_income',
        typeLabel: offer.type === 'loan' ? 'Аренда за рубеж' : 'Продажа за рубеж',
        description: `${offer.type === 'loan' ? 'Аренда' : 'Продажа'}: ${offer.playerName} в «${offer.buyerClub}» (${offer.buyerCountry}) (+€${feeEuros.toLocaleString('ru-RU')})`,
        date: new Date().toISOString()
      });
    }

    return {
      success: true,
      action: 'accepted',
      offer,
      newBudget: seller?.budget,
      message: `Трансфер оформлен! ${offer.playerName} переходит в «${offer.buyerClub}» (${offer.buyerCountry}). В бюджет клуба поступило €${feeEuros.toLocaleString('ru-RU')}.`
    };
  } else {
    offer.status = 'rejected';
    if (tr) {
      tr.status = 'rejected';
      tr.clubApproval = 'rejected';
      tr.rejectReason = comment || 'Отклонено владельцем клуба';
    }
    return {
      success: true,
      action: 'rejected',
      offer,
      message: `Вы отклонили предложение «${offer.buyerClub}» по игроку ${offer.playerName}.`
    };
  }
}
