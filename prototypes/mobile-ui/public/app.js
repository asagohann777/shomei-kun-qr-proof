import { messages } from './messages.js';

const root = document.querySelector('#app');
const sessionKey = 'shomei.mobile-mock.v1';
const localeKey = 'shomei.mobile-mock.locale';
const scenarios = ['registered', 'unregistered', 'not-found', 'wrong-wallet', 'wrong-chain', 'rejected', 'failed', 'unknown', 'evidence-pending', 'unavailable'];
const scenarioKeys = ['registered', 'unregistered', 'notFound', 'wrongWallet', 'wrongChain', 'rejected', 'failed', 'unknown', 'evidencePending', 'unavailable'];
const views = ['scan', 'card', 'register', 'review', 'approval', 'sent', 'confirming', 'success', 'rejected', 'failed', 'unknown'];
const cardStates = ['registered', 'unregistered', 'not-found', 'evidence-pending', 'unavailable'];
const walletStates = ['disconnected', 'valid', 'wrong-wallet', 'wrong-chain'];
const icons = {
  check: '<path d="m5 12 4 4L19 6"/>',
  qr: '<path d="M3 3h6v6H3zm12 0h6v6h-6zM3 15h6v6H3zm12 0h2v2h-2zm4 0h2v6h-6v-2"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  wallet: '<path d="M20 8H4V5l14-2v5M4 8v12h16V8m-5 5h5v4h-5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  card: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 7h8m-8 4h8m-8 5h4"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const read = (storage, key) => { try { return window[storage].getItem(key); } catch { return null; } };
const write = (storage, key, value) => { try { window[storage].setItem(key, value); } catch { return; } };
const savedLocale = read('localStorage', localeKey);
let locale = ['ja', 'en'].includes(savedLocale) ? savedLocale : navigator.languages.map((item) => item.split('-')[0]).find((item) => ['ja', 'en'].includes(item)) || 'en';
const t = (key) => messages[locale][key];
const lines = (key) => escape(t(key)).replace(/\n/g, '<br>');
let timer;
let scanning = false;
let cameraOpen = false;
let state = restore();

function fixture(scenario = 'registered', entry = null) {
  const card = cardStates.includes(scenario) ? scenario : 'unregistered';
  const view = ['wrong-wallet', 'wrong-chain'].includes(scenario) ? 'register' : ['rejected', 'failed', 'unknown'].includes(scenario) ? scenario : 'card';
  return { version: 1, entry, scenario, view, card, wallet: ['wrong-wallet', 'wrong-chain'].includes(scenario) ? scenario : 'disconnected', nickname: 'おじいちゃんコンビニ', consent: false, attempt: ['failed', 'unknown'].includes(scenario) ? 'sample-attempt' : null, submittedAt: null };
}

function restore() {
  const query = new URL(location.href).searchParams.get('scenario');
  const entry = scenarios.includes(query) ? query : null;
  try {
    const saved = JSON.parse(read('sessionStorage', sessionKey));
    if (saved?.version === 1 && saved.entry === entry && scenarios.includes(saved.scenario) && views.includes(saved.view) && cardStates.includes(saved.card) && walletStates.includes(saved.wallet) && typeof saved.nickname === 'string' && typeof saved.consent === 'boolean' && (saved.attempt === null || typeof saved.attempt === 'string') && (saved.submittedAt === null || Number.isFinite(saved.submittedAt))) {
      if (['sent', 'confirming'].includes(saved.view) && (!saved.attempt || saved.submittedAt === null)) throw new Error('Incomplete submitted state');
      return saved;
    }
  } catch {}
  return entry ? fixture(entry, entry) : { ...fixture('unregistered'), view: 'scan' };
}

function persist() { write('sessionStorage', sessionKey, JSON.stringify(state)); }
function update(next, preserveDialog = false) { state = { ...state, ...next }; persist(); render(preserveDialog); }
function choose(scenario) {
  const url = new URL(location.href);
  if (scenario === 'scan') url.search = '';
  else url.searchParams.set('scenario', scenario);
  history.pushState(null, '', url);
  state = scenario === 'scan' ? { ...fixture('unregistered'), view: 'scan' } : fixture(scenario, scenario);
  scanning = false;
  cameraOpen = false;
  persist();
  render();
  window.scrollTo(0, 0);
}
function ready() { return state.nickname.trim().length > 0 && state.wallet === 'valid'; }

function tradingCard() {
  return `<div class="trading-card"><img src="./player.svg" alt="${t('cardAlt')}" width="240" height="336"><img class="card-qr" src="./card-qr.svg" alt="${t('qrAlt')}"></div>`;
}
function footer(action, label, extra = '', disabled = false, secondary = false) {
  return `<footer class="bottom-actions"><button type="button" class="btn ${secondary ? 'btn-outline' : 'btn-primary'}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>${extra}</footer>`;
}
function scanView() {
  if (!cameraOpen) return `<section class="page entry-page"><h1 class="page-title">${lines('scanTitle')}</h1><div class="scan-intro">${tradingCard()}</div></section>${footer('open-camera', `${icon('qr')}${t('openCamera')}`)}`;
  return `<section class="page camera-page"><button class="flash-button" data-action="flash">${icon('info')}${t('flash')}</button><div class="scanner" aria-label="${t('scanHint')}"><div class="scan-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div><img class="scan-center" src="./card-qr.svg" alt="${t('qrAlt')}"></div><h1 class="scan-status">${icon('qr')}${t('cameraTitle')}</h1><div class="scan-tools"><button class="round-tool" data-action="photos">${icon('card')}<span>${t('fromPhotos')}</span></button><button class="round-tool" data-action="help">${icon('info')}<span>${t('help')}</span></button></div></section>${footer('scan', `${scanning ? '<span class="loading loading-spinner loading-xs"></span>' : ''}${t(scanning ? 'scanLoading' : 'scanButton')}`, '', scanning)}`;
}
function detailTable(includeOwner = true) {
  const rows = includeOwner ? [['cardName', `${t('player')} / ${t('cardType')}`], ['cardId', 'TC-001'], ['ownerLabel', state.nickname], ['wallet', t('simulatedAddress')], ['registeredAt', state.submittedAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(state.submittedAt) : t('sampleDate')]] : [['nickname', state.nickname], ['wallet', t('simulatedAddress')], ['cardId', 'TC-001']];
  return `<dl class="record-table">${rows.map(([key, value]) => `<div><dt>${t(key)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;
}
function registeredView(completed = false) {
  return `<section class="page result-page"><div class="status-symbol success">${icon('check')}</div><h1 class="page-title">${t(completed ? 'successTitle' : 'registered')}</h1>${tradingCard()}<div class="info-panel">${detailTable()}<div class="recorded-note">${icon('check')}<div><strong>${t('recorded')}</strong><p>${t('recordedNote')}</p></div></div>${state.card === 'evidence-pending' ? `<div class="alert alert-warning"><div>${t('evidenceTitle')}<button class="btn btn-ghost" data-action="refresh-evidence">${t('refreshEvidence')}</button></div></div>` : ''}<div class="result-actions"><button class="btn btn-outline" data-action="details">${t('detailsButton')}</button><button class="btn btn-primary" data-action="home">${t('home')}</button></div></div></section>`;
}
function cardView() {
  if (['not-found', 'unavailable'].includes(state.card)) {
    const absent = state.card === 'not-found';
    return `<section class="page"><div class="status-symbol warning">${icon('info')}</div><h1 class="page-title">${t(absent ? 'notFoundTitle' : 'unavailableTitle')}</h1><p class="process-copy">${lines(absent ? 'notFoundCopy' : 'unavailableCopy')}</p></section>${footer(absent ? 'scan-again' : 'retry-read', t(absent ? 'scanAnother' : 'retry'))}`;
  }
  if (['registered', 'evidence-pending'].includes(state.card)) return registeredView();
  return `<section class="page read-page"><div class="status-symbol">${icon('check')}</div><h1 class="page-title">${t('readTitle')}</h1>${tradingCard()}<div class="info-panel card-summary"><h2>${t('player')}</h2><p>${t('cardType')}</p><p>ID: TC-001</p><span class="registration-badge">${t('unregistered')}</span></div></section>${footer('start-register', `${t('next')}${icon('arrow')}`)}`;
}
function registerView() {
  const wrong = ['wrong-wallet', 'wrong-chain'].includes(state.wallet);
  const walletKey = state.wallet === 'wrong-wallet' ? 'wrongWallet' : 'wrongChain';
  return `<section class="page register-page">${tradingCard()}<div class="info-panel"><h1 class="page-title">${t('registerTitle')}</h1><div class="form-field"><label class="form-label" for="nickname">${t('nickname')}</label><div class="nickname-input"><input class="input input-bordered" id="nickname" name="nickname" autocomplete="off" value="${escape(state.nickname)}"><button type="button" data-action="clear-nickname" aria-label="${t('clearNickname')}">${icon('close')}</button></div></div><div class="form-field"><p class="form-label">${t('wallet')}</p>${state.wallet === 'disconnected' ? `<button class="btn btn-outline connect-button" data-action="connect">${icon('wallet')}${t('connect')}</button>` : `<div class="wallet-value">${t(state.wallet === 'wrong-wallet' ? 'wrongAddress' : 'simulatedAddress')}${icon('wallet')}</div>`}</div>${wrong ? `<div class="alert alert-error"><div><p>${t(walletKey + 'Title')}</p><button class="btn btn-ghost" data-action="fix-wallet">${t(state.wallet === 'wrong-wallet' ? 'switchWallet' : 'switchChain')}</button></div></div>` : ''}</div></section>${footer('confirm', `${t('next')}${icon('arrow')}`, '', !ready())}`;
}
function reviewView() {
  return `<section class="page review-page"><h1 class="page-title">${t('confirmTitle')}</h1>${tradingCard()}<div class="info-panel"><h2 class="panel-title">${t('confirmHeading')}</h2>${detailTable(false)}<label class="consent-label"><input type="checkbox" class="consent-checkbox" id="consent" ${state.consent ? 'checked' : ''}><span>${t('consent')}</span></label><button class="btn btn-primary panel-primary" data-action="register-reviewed" ${state.consent && ready() ? '' : 'disabled'}>${t('registerNow')}${icon('arrow')}</button><button class="btn btn-outline edit-button" data-action="edit-review">${icon('back')}${t('edit')}</button></div></section>`;
}
function processView() {
  const view = state.view;
  if (view === 'success') return registeredView(true);
  const active = ['sent', 'confirming'].includes(view);
  if (active) return `<section class="page processing-page">${tradingCard()}<div class="status-symbol progress-symbol"><span class="loading loading-spinner loading-lg"></span></div><h1 class="page-title" aria-live="polite">${t(view + 'Title')}</h1><p class="process-copy">${t(view + 'Copy')}</p></section>`;
  const config = { approval: ['wallet', '', 'approvalTitle', 'approvalCopy'], rejected: ['close', '', 'rejectedTitle', 'rejectedCopy'], failed: ['close', 'error', 'failedTitle', 'failedCopy'], unknown: ['info', 'warning', 'unknownTitle', 'unknownCopy'] }[view];
  return `<section class="page"><div class="status-symbol ${config[1]}">${icon(config[0])}</div><h1 class="page-title">${t(config[2])}</h1><p class="process-copy">${t(config[3])}</p>${view === 'approval' ? `<div class="info-panel">${detailTable(false)}</div><button class="btn btn-ghost home-link" data-action="reject">${t('reject')}</button>` : ''}</section>${footer(view === 'approval' ? 'approve' : view === 'unknown' ? 'recheck' : 'edit-again', t(view === 'approval' ? 'approve' : view === 'unknown' ? 'recheck' : 'editAgain'))}`;
}
function dialogs() {
  const row = (label, value) => `<div><dt>${t(label)}</dt><dd>${escape(value)}</dd></div>`;
  return `<dialog id="help-dialog" class="modal modal-bottom" aria-labelledby="help-title"><div class="modal-box"><h2 id="help-title">${t('help')}</h2><p id="help-copy" class="process-copy">${t('helpCopy')}</p><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="wallet-dialog" class="modal modal-bottom" aria-labelledby="wallet-title"><div class="modal-box"><h2 id="wallet-title" class="text-xl font-bold">${t('connectTitle')}</h2><p class="text-sm text-[#61718b] leading-7 mt-3">${t('connectDescription')}</p><button class="btn btn-primary w-full mt-6" data-action="connect-sample">${t('simulateConnect')}</button><form method="dialog"><button class="btn btn-ghost w-full mt-2">${t('cancel')}</button></form></div></dialog><dialog id="details-dialog" class="modal modal-bottom" aria-labelledby="details-title"><div class="modal-box"><h2 id="details-title" class="text-xl font-bold">${t('detailsTitle')}</h2><p class="process-copy">${t('physicalNote')}</p><dl class="data-list">${row('owner', state.nickname)}${row('wallet', t('simulatedAddress'))}${row('cardId', 'TC-001')}${row('issuer', t('collection'))}${row('network', 'Polygon Amoy · 80002')}${row('contract', t('contractValue'))}${row('transaction', state.card === 'evidence-pending' ? t('evidenceTitle') : t('sampleTransactionValue'))}</dl><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="scenarios-dialog" class="modal modal-bottom" aria-labelledby="scenarios-title"><div class="modal-box"><div class="flex justify-between items-start gap-3"><h2 id="scenarios-title" class="text-lg font-bold">${t('scenariosTitle')}</h2><form method="dialog"><button class="btn btn-ghost btn-square btn-sm" aria-label="${t('close')}">${icon('close')}</button></form></div><button class="btn btn-outline w-full mt-5" data-action="language">${icon('globe')}${locale === 'ja' ? 'English' : '日本語'}</button><div class="scenario-grid"><button class="btn btn-outline border-base-300" data-scenario="scan">${icon('qr')}${t('startScan')}</button>${scenarios.map((id, i) => `<button class="btn ${state.scenario === id && state.view !== 'scan' ? 'btn-soft btn-primary' : 'btn-ghost bg-base-200'}" data-scenario="${id}">${t('scenario_' + scenarioKeys[i])}</button>`).join('')}</div><button class="btn btn-outline border-base-300 w-full mt-5" data-action="share">${t('shareView')}</button><p class="text-[11px] leading-6 text-[#738199] mt-2">${t('shareHelp')}</p><p id="share-status" class="text-xs text-primary mt-2" aria-live="polite"></p></div></dialog>`;
}

function render(preserveDialog = false) {
  clearTimeout(timer);
  const openDialog = preserveDialog && root.querySelector('dialog[open]')?.id;
  document.documentElement.lang = locale;
  document.title = t('title');
  const content = state.view === 'scan' ? scanView() : state.view === 'card' ? cardView() : state.view === 'register' ? registerView() : state.view === 'review' ? reviewView() : processView();
  root.innerHTML = `<div class="phone"><header class="app-header"><button class="round-button" data-action="${state.view === 'scan' && cameraOpen ? 'close-camera' : 'back-screen'}" aria-label="${t('backScreen')}" ${['sent', 'confirming', 'unknown'].includes(state.view) ? 'disabled' : ''}>${icon('back')}</button><a class="brand" href="./" data-action="home"><span class="brand-name">${t('brand')}</span><span class="brand-subtitle">QR Proof</span></a><button class="round-button" data-action="scenarios" aria-label="${t('menu')}"><span aria-hidden="true">•••</span></button></header><p class="demo-label">${t('demo')} · ${t('noTransaction')}</p><main>${content}</main></div>${dialogs()}`;
  if (openDialog) document.getElementById(openDialog).showModal();
  if (['sent', 'confirming'].includes(state.view)) {
    const attempt = state.attempt;
    timer = setTimeout(() => {
      if (state.attempt !== attempt || !['sent', 'confirming'].includes(state.view)) return;
      const elapsed = Date.now() - state.submittedAt;
      if (elapsed >= 2400) update({ view: 'success', card: 'registered' }, true);
      else if (elapsed >= 900 && state.view === 'sent') update({ view: 'confirming' }, true);
    }, Math.max(0, (state.view === 'sent' ? 900 : 2400) - (Date.now() - state.submittedAt)));
  }
}

root.addEventListener('input', (event) => {
  if (event.target.id === 'nickname') { state.nickname = event.target.value; persist(); }
  if (event.target.id === 'consent') { state.consent = event.target.checked; persist(); }
  const confirm = root.querySelector('[data-action="confirm"]');
  if (confirm) confirm.disabled = !ready();
  const reviewed = root.querySelector('[data-action="register-reviewed"]');
  if (reviewed) reviewed.disabled = !(ready() && state.consent);
});
root.addEventListener('click', async (event) => {
  const scenarioButton = event.target.closest('[data-scenario]');
  if (scenarioButton) { choose(scenarioButton.dataset.scenario); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const action = button.dataset.action;
  if (action === 'clear-nickname') { state.nickname = ''; persist(); render(); document.querySelector('#nickname').focus(); return; }
  if (['help', 'photos', 'flash'].includes(action)) { document.querySelector('#help-copy').textContent = t(action === 'photos' ? 'photoHelp' : action === 'flash' ? 'flashHelp' : 'helpCopy'); document.querySelector('#help-dialog').showModal(); return; }
  if (action === 'back-screen') {
    if (state.view === 'register') update({ view: 'card' });
    else if (state.view === 'review') update({ view: 'register' });
    else if (state.view === 'approval') update({ view: 'review' });
    else if (!['sent', 'confirming', 'unknown'].includes(state.view)) choose('scan');
    window.scrollTo(0, 0); return;
  }
  if (action === 'edit-review' && state.view === 'review') { update({ view: 'register', consent: false }); window.scrollTo(0, 0); return; }
  if (action === 'register-reviewed' && state.view === 'review' && ready() && state.consent) { update({ view: 'approval' }); window.scrollTo(0, 0); return; }
  if (action === 'home') { choose('scan'); return; }
  if (action === 'language') { locale = locale === 'ja' ? 'en' : 'ja'; write('localStorage', localeKey, locale); render(true); return; }
  if (action === 'scenarios') { document.querySelector('#scenarios-dialog').showModal(); return; }
  if (action === 'details') { document.querySelector('#details-dialog').showModal(); return; }
  if (action === 'share') {
    const url = new URL(location.href);
    url.search = state.view === 'scan' ? '' : `?scenario=${state.view === 'success' || state.card === 'registered' ? 'registered' : state.scenario}`;
    try { await navigator.clipboard.writeText(url.href); document.querySelector('#share-status').textContent = t('copied'); }
    catch { history.replaceState(null, '', url); state.entry = url.searchParams.get('scenario'); persist(); document.querySelector('#share-status').textContent = t('copyFailed'); }
    return;
  }
  if (action === 'open-camera') { cameraOpen = true; render(); window.scrollTo(0, 0); return; }
  if (action === 'close-camera') { cameraOpen = false; scanning = false; render(); window.scrollTo(0, 0); return; }
  if (action === 'scan' && cameraOpen && !scanning && state.view === 'scan') {
    scanning = true;
    render();
    setTimeout(() => { if (!scanning || state.view !== 'scan') return; scanning = false; update({ view: 'card' }); }, 450);
    return;
  }
  if (action === 'scan-again') { cameraOpen = false; update({ view: 'scan' }); window.scrollTo(0, 0); return; }
  if (action === 'start-register' && state.card === 'unregistered') { update({ view: 'register' }); window.scrollTo(0, 0); return; }
  if (action === 'back-card') { update({ view: 'card' }); window.scrollTo(0, 0); return; }
  if (action === 'connect') { document.querySelector('#wallet-dialog').showModal(); return; }
  if (action === 'connect-sample' || action === 'fix-wallet') { update({ wallet: 'valid' }); return; }
  if (action === 'confirm' && state.view === 'register' && ready()) { update({ view: 'review', consent: false, nickname: state.nickname.trim(), attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'approve' && state.view === 'approval' && ready() && state.consent) { update({ view: 'sent', attempt: crypto.randomUUID(), submittedAt: Date.now() }); window.scrollTo(0, 0); return; }
  if (action === 'reject' && state.view === 'approval') { update({ view: 'rejected', attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'edit-again' && ['rejected', 'failed'].includes(state.view)) { update({ view: 'register', consent: false, attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'recheck' && state.view === 'unknown') { update({ view: 'confirming', submittedAt: Date.now() - 900 }); return; }
  if (action === 'refresh-evidence') { update({ card: 'registered', scenario: 'registered' }); return; }
  if (action === 'retry-read') { update({ card: 'registered', scenario: 'registered' }); return; }
});
window.addEventListener('popstate', () => { state = restore(); scanning = false; cameraOpen = false; render(); });
persist();
render();
