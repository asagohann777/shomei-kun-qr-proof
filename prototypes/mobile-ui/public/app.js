import { messages } from './messages.js';

const root = document.querySelector('#app');
const sessionKey = 'shomei.mobile-mock.v1';
const localeKey = 'shomei.mobile-mock.locale';
const scenarios = ['registered', 'unregistered', 'not-found', 'wrong-wallet', 'wrong-chain', 'rejected', 'failed', 'unknown', 'evidence-pending', 'unavailable'];
const scenarioKeys = ['registered', 'unregistered', 'notFound', 'wrongWallet', 'wrongChain', 'rejected', 'failed', 'unknown', 'evidencePending', 'unavailable'];
const views = ['scan', 'card', 'register', 'approval', 'sent', 'confirming', 'success', 'rejected', 'failed', 'unknown'];
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
  return entry ? fixture(entry, entry) : { ...fixture(), view: 'scan' };
}

function persist() { write('sessionStorage', sessionKey, JSON.stringify(state)); }
function update(next, preserveDialog = false) { state = { ...state, ...next }; persist(); render(preserveDialog); }
function choose(scenario) {
  const url = new URL(location.href);
  if (scenario === 'scan') url.search = '';
  else url.searchParams.set('scenario', scenario);
  history.pushState(null, '', url);
  state = scenario === 'scan' ? { ...fixture(), view: 'scan' } : fixture(scenario, scenario);
  scanning = false;
  cameraOpen = false;
  persist();
  render();
  window.scrollTo(0, 0);
}
function ready() { return state.nickname.trim().length > 0 && state.wallet === 'valid' && state.consent; }

function tradingCard() {
  return `<div class="trading-card"><img src="./player.svg" alt="${t('cardAlt')}" width="240" height="336"><img class="card-qr" src="./card-qr.svg" alt="${t('qrAlt')}"></div>`;
}
function objectRow() {
  return `<div class="object-row">${tradingCard()}<div class="min-w-0"><p class="object-title">${t('player')}</p><p class="text-[11px] text-[#738199]">${t('cardId')}</p><p class="mt-1 text-xs font-semibold tracking-wide">SK-2026-001</p></div></div>`;
}
function footer(action, label, extra = '', disabled = false, secondary = false) {
  return `<footer class="bottom-actions"><button type="button" class="btn ${secondary ? 'btn-outline border-base-300' : 'btn-primary'}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>${extra}</footer>`;
}
function scanView() {
  if (!cameraOpen) {
    return `<section class="page"><h1 class="page-title">${lines('scanTitle')}</h1><div class="scan-intro">${tradingCard()}<div class="scan-intro-label">${icon('qr')}<span>${t('entryHint')}</span></div></div></section>${footer('open-camera', `${icon('qr')}${t('openCamera')}`, `<p class="footer-note">${t('viewWithoutWallet')}</p>`)}`;
  }
  return `<section class="page"><button class="back-button" data-action="close-camera">${icon('back')}${t('backToScan')}</button><h1 class="page-title">${t('cameraTitle')}</h1><p class="page-description">${t('scanHint')}</p><div class="scanner" aria-label="${t('scanHint')}"><div class="scan-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div><img class="scan-center" src="./card-qr.svg" alt=""><span class="scanner-caption">${t('noCamera')}</span></div></section>${footer('scan', `${scanning ? '<span class="loading loading-spinner loading-xs"></span>' : icon('qr')}${t(scanning ? 'scanLoading' : 'scanButton')}`, '', scanning)}`;
}
function cardView() {
  if (['not-found', 'unavailable'].includes(state.card)) {
    const absent = state.card === 'not-found';
    return `<section class="page"><div class="status-symbol ${absent ? '' : 'warning'}">${icon(absent ? 'card' : 'info')}</div><h1 class="process-title">${t(absent ? 'notFoundTitle' : 'unavailableTitle')}</h1><p class="process-copy">${lines(absent ? 'notFoundCopy' : 'unavailableCopy')}</p><div class="sample-record"><span class="text-xs text-[#61718b]">${t('cardId')}</span><p class="mt-2 font-semibold">${absent ? 'SK-UNKNOWN' : 'SK-2026-001'}</p></div></section>${footer(absent ? 'scan-again' : 'retry-read', t(absent ? 'scanAnother' : 'retry'))}`;
  }
  const registered = ['registered', 'evidence-pending'].includes(state.card);
  return `<section class="page"><div class="owner-section"><div class="flex items-center justify-between gap-3"><p class="eyebrow mb-0">${t(registered ? 'ownerLabel' : 'cardLabel')}</p><span class="badge ${registered ? 'badge-success' : 'badge-ghost'} text-[11px] font-semibold px-3 h-7">${registered ? icon('check') : ''}${t(registered ? 'registered' : 'unregistered')}</span></div>${registered ? `<h1 class="owner-name">${escape(state.nickname)}</h1><p class="owner-wallet">${t('simulatedAddress')}</p>` : `<h1 class="page-title mt-6">${lines('noOwnerTitle')}</h1><p class="page-description">${lines('noOwnerText')}</p>`}</div>${objectRow()}${registered ? `<button class="detail-row" data-action="details"><span>${t('recordDetails')}</span>${icon('arrow')}</button>` : ''}${state.card === 'evidence-pending' ? `<div class="alert alert-warning"><div><p class="font-bold">${t('evidenceTitle')}</p><p>${t('evidenceCopy')}</p><button class="btn btn-ghost mt-1 px-0 min-h-11" data-action="refresh-evidence">${t('refreshEvidence')}</button></div></div>` : ''}<p class="privacy-note">${icon('info')}<span>${t('physicalNote')}</span></p></section>${footer(registered ? 'scan-again' : 'start-register', `${icon(registered ? 'qr' : 'wallet')}${t(registered ? 'scanAnother' : 'registerButton')}`, '', false, registered)}`;
}
function registerView() {
  const wrong = ['wrong-wallet', 'wrong-chain'].includes(state.wallet);
  const walletKey = state.wallet === 'wrong-wallet' ? 'wrongWallet' : 'wrongChain';
  return `<section class="page"><button class="back-button" data-action="back-card">${icon('back')}${t('back')}</button><h1 class="page-title">${t('registerTitle')}</h1><div class="mt-7"><label class="form-label" for="nickname">${t('nickname')}</label><input class="input input-bordered" id="nickname" name="nickname" autocomplete="off" value="${escape(state.nickname)}" aria-describedby="nickname-hint"><p id="nickname-hint" class="text-[11px] leading-6 text-[#738199] mt-2">${t('nicknameHint')}</p></div><div class="wallet-box"><p class="form-label flex items-center gap-2">${icon('wallet')}${t('wallet')}</p>${state.wallet === 'disconnected' ? `<button class="btn btn-outline border-base-300 w-full min-h-12 text-sm" data-action="connect">${t('connect')}</button>` : `<div class="flex items-center justify-between gap-2"><span class="text-xs font-semibold">${t(state.wallet === 'wrong-wallet' ? 'wrongAddress' : 'simulatedAddress')}</span><span class="badge ${wrong ? 'badge-warning' : 'badge-success'} text-[10px]">${t(wrong ? 'switchRequired' : 'connected')}</span></div><p class="text-[11px] text-[#738199] mt-3">${t('network')} <span class="font-semibold">${state.wallet === 'wrong-chain' ? 'Ethereum Sepolia' : 'Polygon Amoy'}</span></p>`}</div>${wrong ? `<div class="alert alert-error"><div><p class="font-bold">${t(walletKey + 'Title')}</p><p class="mt-1">${t(walletKey + 'Text')}</p><button class="btn btn-ghost px-0 mt-1 min-h-11" data-action="fix-wallet">${t(state.wallet === 'wrong-wallet' ? 'switchWallet' : 'switchChain')}</button></div></div>` : ''}<div class="notice-box"><p class="font-bold">${t('publicTitle')}</p><p class="mt-2 font-semibold">${t('publicItems')}</p><p class="mt-2 text-[#63758b]">${t('irreversible')}</p></div><label class="consent-label"><input type="checkbox" class="consent-checkbox" id="consent" ${state.consent ? 'checked' : ''}><span>${t('consent')}</span></label></section>${footer('confirm', t('confirmRegister'), '', !ready())}`;
}
function processView() {
  const view = state.view;
  const config = { approval: ['wallet', '', 'approvalTitle', 'approvalCopy'], sent: ['clock', '', 'sentTitle', 'sentCopy'], confirming: ['clock', '', 'confirmingTitle', 'confirmingCopy'], success: ['check', 'success', 'successTitle', 'successCopy'], rejected: ['close', '', 'rejectedTitle', 'rejectedCopy'], failed: ['close', 'error', 'failedTitle', 'failedCopy'], unknown: ['info', 'warning', 'unknownTitle', 'unknownCopy'] }[view];
  const active = ['sent', 'confirming'].includes(view);
  const step = view === 'approval' || view === 'rejected' ? 0 : view === 'sent' ? 1 : 2;
  let action = 'edit-again';
  let label = t('editAgain');
  if (view === 'approval') { action = 'approve'; label = t('approve'); }
  if (view === 'success') { action = 'view-public'; label = t('viewPublic'); }
  if (view === 'unknown') { action = 'recheck'; label = t('recheck'); }
  if (active) { label = `<span class="loading loading-spinner loading-xs"></span>${t('statePending')}`; }
  return `<section class="page"><ul class="steps"><li class="step step-primary">${t('stepApprove')}</li><li class="step ${step >= 1 ? 'step-primary' : ''}">${t('stepSend')}</li><li class="step ${step >= 2 ? 'step-primary' : ''}">${t('stepCheck')}</li></ul><div class="status-symbol ${config[1]}">${active ? '<span class="loading loading-spinner loading-lg"></span>' : icon(config[0])}</div><h1 class="process-title" aria-live="polite">${lines(config[2])}</h1><p class="process-copy">${lines(config[3])}</p>${view === 'approval' ? `<div class="sample-record"><p class="text-[11px] text-[#61718b]">${t('nickname')}</p><p class="font-bold text-lg mt-2">${escape(state.nickname)}</p><div class="border-t border-base-300 mt-4 pt-4"><p class="text-[11px] text-[#61718b]">${t('wallet')}</p><p class="text-xs font-semibold mt-1">${t('simulatedAddress')}</p><p class="text-xs mt-1">Polygon Amoy</p></div></div><button class="btn btn-ghost w-full mt-3 min-h-11" data-action="reject">${t('reject')}</button>` : view === 'success' ? `<div class="sample-record text-center"><p class="text-xs text-[#61718b]">${t('ownerLabel')}</p><p class="text-xl font-bold mt-2">${escape(state.nickname)}</p><p class="text-xs mt-3">SK-2026-001</p></div>` : state.attempt ? `<div class="sample-record"><p class="text-[11px] text-[#61718b]">${t('sampleTransaction')}</p><p class="text-xs mt-2">${t('sampleTransactionValue')}</p></div>` : ''}</section>${footer(action, label, '', active)}`;
}
function dialogs() {
  const row = (label, value) => `<div><dt>${t(label)}</dt><dd>${escape(value)}</dd></div>`;
  return `<dialog id="wallet-dialog" class="modal modal-bottom" aria-labelledby="wallet-title"><div class="modal-box"><h2 id="wallet-title" class="text-xl font-bold">${t('connectTitle')}</h2><p class="text-sm text-[#61718b] leading-7 mt-3">${t('connectDescription')}</p><button class="btn btn-primary w-full mt-6" data-action="connect-sample">${t('simulateConnect')}</button><form method="dialog"><button class="btn btn-ghost w-full mt-2">${t('cancel')}</button></form></div></dialog><dialog id="details-dialog" class="modal modal-bottom" aria-labelledby="details-title"><div class="modal-box"><h2 id="details-title" class="text-xl font-bold">${t('detailsTitle')}</h2><dl class="data-list">${row('owner', state.nickname)}${row('wallet', t('simulatedAddress'))}${row('cardId', 'SK-2026-001')}${row('issuer', t('collection'))}${row('network', 'Polygon Amoy · 80002')}${row('contract', t('contractValue'))}${row('transaction', state.card === 'evidence-pending' ? t('evidenceTitle') : t('sampleTransactionValue'))}</dl><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="scenarios-dialog" class="modal modal-bottom" aria-labelledby="scenarios-title"><div class="modal-box"><div class="flex justify-between items-start gap-3"><h2 id="scenarios-title" class="text-lg font-bold">${t('scenariosTitle')}</h2><form method="dialog"><button class="btn btn-ghost btn-square btn-sm" aria-label="${t('close')}">${icon('close')}</button></form></div><div class="scenario-grid"><button class="btn btn-outline border-base-300" data-scenario="scan">${icon('qr')}${t('startScan')}</button>${scenarios.map((id, i) => `<button class="btn ${state.scenario === id && state.view !== 'scan' ? 'btn-soft btn-primary' : 'btn-ghost bg-base-200'}" data-scenario="${id}">${t('scenario_' + scenarioKeys[i])}</button>`).join('')}</div><button class="btn btn-outline border-base-300 w-full mt-5" data-action="share">${t('shareView')}</button><p class="text-[11px] leading-6 text-[#738199] mt-2">${t('shareHelp')}</p><p id="share-status" class="text-xs text-primary mt-2" aria-live="polite"></p></div></dialog>`;
}

function render(preserveDialog = false) {
  clearTimeout(timer);
  const openDialog = preserveDialog && root.querySelector('dialog[open]')?.id;
  document.documentElement.lang = locale;
  document.title = t('title');
  const content = state.view === 'scan' ? scanView() : state.view === 'card' ? cardView() : state.view === 'register' ? registerView() : processView();
  root.innerHTML = `<div class="phone"><header class="app-header"><a href="./" class="flex items-center gap-2.5" data-action="home" aria-label="${t('brand')}"><img class="brand-mark" src="./favicon.svg" alt=""><span><span class="brand-name block">${t('brand')}</span></span></a><button class="btn btn-ghost btn-sm min-h-11 px-2 text-xs" data-action="language" aria-label="${locale === 'ja' ? 'Switch to English' : '日本語に切り替える'}">${icon('globe')}<span>${locale === 'ja' ? 'EN' : '日本語'}</span></button></header><div class="demo-strip"><p class="demo-label"><strong>${t('demo')}</strong><span class="block">${t('noTransaction')}</span></p><button class="btn btn-ghost" data-action="scenarios">${t('changeView')}${icon('arrow')}</button></div><main>${content}</main></div>${dialogs()}`;
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
});
root.addEventListener('click', async (event) => {
  const scenarioButton = event.target.closest('[data-scenario]');
  if (scenarioButton) { choose(scenarioButton.dataset.scenario); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const action = button.dataset.action;
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
  if (action === 'confirm' && state.view === 'register' && ready()) { update({ view: 'approval', nickname: state.nickname.trim(), attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'approve' && state.view === 'approval') { update({ view: 'sent', attempt: crypto.randomUUID(), submittedAt: Date.now() }); window.scrollTo(0, 0); return; }
  if (action === 'reject' && state.view === 'approval') { update({ view: 'rejected', attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'edit-again' && ['rejected', 'failed'].includes(state.view)) { update({ view: 'register', consent: false, attempt: null, submittedAt: null }); window.scrollTo(0, 0); return; }
  if (action === 'recheck' && state.view === 'unknown') { update({ view: 'confirming', submittedAt: Date.now() - 900 }); return; }
  if (action === 'view-public' && state.view === 'success') { update({ view: 'card', card: 'registered', scenario: 'registered' }); window.scrollTo(0, 0); return; }
  if (action === 'refresh-evidence') { update({ card: 'registered', scenario: 'registered' }); return; }
  if (action === 'retry-read') { update({ card: 'registered', scenario: 'registered' }); return; }
});
window.addEventListener('popstate', () => { state = restore(); scanning = false; cameraOpen = false; render(); });
persist();
render();
