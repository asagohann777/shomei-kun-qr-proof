import { messages } from './messages.js';
import { walletMessages } from './wallet-messages.js';
import { liveMessages } from './live-messages.js';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import { createCameraSession, parseCardQr } from '../src/camera-session.js';
import { cameraMessages } from './camera-messages.js';

const config = __UI_CONFIG__;
const cameraEnabled = config.cameraMode === 'live';
const liveEnabled = config.apiMode === 'live';
let live = null;
let liveSnapshot = null;
let currentCardId = new URL(location.href).searchParams.get('cardId');
let qrSource = './card-qr.svg';
let qrIdentity = null;
let liveError = null;
let preparingWallet = false;

const root = document.querySelector('#app');
const sessionKey = 'shomei.mobile-mock.v1';
const localeKey = 'shomei.mobile-mock.locale';
const scenarios = ['registered', 'unregistered', 'not-found', 'wrong-wallet', 'wrong-chain', 'rejected', 'failed', 'unknown', 'evidence-pending', 'unavailable', 'registering', 'wallet-connect', 'wallet-add', 'wallet-switch', 'wallet-paused', 'wallet-rejected', 'wallet-ready'];
const scenarioKeys = ['registered', 'unregistered', 'notFound', 'wrongWallet', 'wrongChain', 'rejected', 'failed', 'unknown', 'evidencePending', 'unavailable', 'registering', 'walletConnectScenario', 'walletAddScenario', 'walletSwitchScenario', 'walletPausedScenario', 'walletRejectedScenario', 'walletReadyScenario'];
const views = ['scan', 'card', 'register', 'review', 'approval', 'sent', 'confirming', 'success', 'rejected', 'failed', 'unknown', 'processing-preview'];
const cardStates = ['registered', 'unregistered', 'not-found', 'evidence-pending', 'unavailable'];
const walletStates = ['disconnected', 'valid', 'wrong-wallet', 'wrong-chain'];
const icons = {
  person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2z"/>',
  tag: '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1"/>',
  flash: '<path d="m13.5 2-9 12h6L9.5 22l10-13h-6z" fill="currentColor" stroke-width="1"/>',
  photo: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="15.5" cy="8.5" r="1.5"/><path d="m3 17 6-6 5 5 3-3 4 4"/>',
  cube: '<path d="m12 2 9 5v10l-9 5-9-5V7zm0 10 9-5M12 12 3 7m9 5v10m-4-17 9 5v6"/>',
  link: '<path d="m10 14 4-4m-5 6-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 5 0m0 8a4 4 0 0 0 5 0l5-5a4 4 0 0 0-5-5l-2 2"/>',
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
const t = (key) => walletMessages[locale][key] ?? cameraMessages[locale][key] ?? (liveEnabled ? liveMessages[locale][key] : undefined) ?? messages[locale][key];
const lines = (key) => escape(t(key)).replace(/\n/g, '<br>');
let timer;
let scanning = false;
let cameraOpen = false;
let state = liveEnabled ? { ...fixture('unregistered'), nickname: '', view: currentCardId ? 'card' : 'scan' } : restore();

let cameraState = { kind: 'stopped' };
function createCameraVideo() {
  const video = document.createElement('video');
  video.id = 'camera-video'; video.className = 'camera-video'; video.muted = true; video.playsInline = true;
  return video;
}
const photoInput = document.createElement('input');
photoInput.type = 'file'; photoInput.accept = 'image/*'; photoInput.hidden = true; photoInput.id = 'camera-photo';
document.body.append(photoInput);
const camera = createCameraSession({
  createVideo: createCameraVideo,
  scannerFactory: (element, decoded, failed) => new QrScanner(element, decoded, { onDecodeError: error => { if (error !== QrScanner.NO_QR_CODE_FOUND) failed(error); }, preferredCamera: 'environment', returnDetailedScanResult: true, highlightScanRegion: false, maxScansPerSecond: 8 }),
  imageEngine: () => QrScanner.createQrEngine(),
  scanImage: (file, options) => QrScanner.scanImage(file, options),
  parse: value => parseCardQr(value, config),
  changed: next => { cameraState = next; if (cameraOpen && state.view === 'scan') render(true); },
  detected: result => {
    cameraOpen = false;
    if (result.kind === 'sample') { choose('registered'); return; }
    const url = new URL(location.href); url.search = new URLSearchParams({ cardId: result.id });
    history.pushState(null, '', url);
    if (liveEnabled) { void openLiveCard(result.id); return; }
    state = { ...fixture('unregistered'), scannedCardId: result.id };
    setCardQr(result.id); persist(); render(); window.scrollTo(0, 0);
  },
});
photoInput.addEventListener('change', () => { const file = photoInput.files[0]; photoInput.value = ''; if (cameraOpen && state.view === 'scan') void camera.photo(file); });
document.addEventListener('visibilitychange', () => { if (document.hidden && cameraOpen && cameraEnabled) camera.pause(); });
window.addEventListener('pagehide', () => { if (cameraEnabled) camera.pause(); });

function setCardQr(id) {
  qrIdentity = id; qrSource = null;
  const url = new URL(config.publicUrl); url.search = new URLSearchParams({ cardId: id });
  QRCode.toDataURL(url.href, { margin: 1, color: { dark: '#172b4d', light: '#ffffff' } }).then(source => {
    if (qrIdentity !== id) return;
    qrSource = source;
    for (const image of root.querySelectorAll('.card-qr')) image.src = source;
  });
}
function liveCameraView() {
  const active = cameraState.kind === 'scanning';
  const paused = ['paused', 'stopped'].includes(cameraState.kind);
  const busy = ['starting', 'photo'].includes(cameraState.kind);
  const label = cameraState.error ?? ({ starting: 'cameraStarting', photo: 'photoReading', paused: 'cameraPaused', stopped: 'cameraPaused' }[cameraState.kind] ?? 'cameraTitle');
  const status = label === 'cameraError'
    ? `<div class="scan-status camera-error" role="status"><h1>${escape(t(label))}</h1><p>${escape(t('cameraErrorHelp'))}</p></div>`
    : `<h1 class="scan-status" role="status">${escape(t(label))}</h1>`;
  return `<section class="page camera-page live-camera-page">${active && cameraState.torch ? `<button class="flash-button" data-action="flash" aria-pressed="${cameraState.light}">${icon('flash')}<span>${t('flash')}</span></button>` : ''}<div class="scanner live-scanner" aria-label="${t('scanHint')}"><span id="camera-slot"></span>${paused ? `<div class="camera-resume"><button type="button" class="btn btn-primary" data-action="resume-camera">${icon('qr')}${t('cameraResume')}</button></div>` : ''}<div class="scan-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div>${active ? '<div class="scan-light-track" aria-hidden="true"><div class="scan-sweep"></div></div>' : ''}</div>${status}<div class="scan-tools"><button class="round-tool" data-action="photos" ${cameraState.kind === 'photo' ? 'disabled' : ''}>${icon('photo')}<span>${t('fromPhotos')}</span></button><button class="round-tool" data-action="help">${icon('info')}<span>${t('help')}</span></button></div></section>${!active && !paused ? footer('resume-camera', t('cameraRetry'), '', busy) : ''}`;
}
async function handleCameraAction(action) {
  if (action === 'open-camera' || action === 'resume-camera') { cameraOpen = true; render(); window.scrollTo(0, 0); await camera.start(); return true; }
  if (action === 'close-camera') { cameraOpen = false; camera.stop(); render(); return true; }
  if (action === 'photos') { photoInput.click(); return true; }
  if (action === 'flash') { await camera.toggleLight(); return true; }
  if (action === 'scan') return true;
  if (action === 'help') { document.querySelector('#help-copy').textContent = t('cameraHelp'); document.querySelector('#help-dialog').showModal(); return true; }
  return false;
}


function fixture(scenario = 'registered', entry = null) {
  const card = cardStates.includes(scenario) ? scenario : 'unregistered';
  const view = scenario.startsWith('wallet-') ? 'register' : scenario === 'registering' ? 'processing-preview' : ['wrong-wallet', 'wrong-chain'].includes(scenario) ? 'register' : ['rejected', 'failed', 'unknown'].includes(scenario) ? scenario : 'card';
  return { version: 1, entry, scenario, view, card, wallet: scenario === 'wallet-ready' ? 'valid' : ['wallet-add', 'wallet-switch', 'wallet-paused'].includes(scenario) ? 'wrong-chain' : ['wrong-wallet', 'wrong-chain'].includes(scenario) ? scenario : 'disconnected', nickname: 'おじいちゃんコンビニ', consent: false, attempt: ['failed', 'unknown'].includes(scenario) ? 'sample-attempt' : null, submittedAt: null };
}

function restore() {
  const linked = parseCardQr(new URL(location.href).href, { ...config, publicUrl: new URL(location.pathname, location.origin).href });
  const linkedId = linked?.kind === 'card' ? linked.id : undefined;
  const query = new URL(location.href).searchParams.get('scenario');
  const entry = scenarios.includes(query) ? query : null;
  try {
    const saved = JSON.parse(read('sessionStorage', sessionKey));
    if (saved?.version === 1 && saved.scannedCardId === linkedId && saved.entry === entry && scenarios.includes(saved.scenario) && views.includes(saved.view) && cardStates.includes(saved.card) && walletStates.includes(saved.wallet) && typeof saved.nickname === 'string' && typeof saved.consent === 'boolean' && (saved.attempt === null || typeof saved.attempt === 'string') && (saved.submittedAt === null || Number.isFinite(saved.submittedAt))) {
      if (['sent', 'confirming'].includes(saved.view) && (!saved.attempt || saved.submittedAt === null)) throw new Error('Incomplete submitted state');
      if (saved.scannedCardId && !/^[A-Za-z0-9_-]{1,64}$/.test(saved.scannedCardId)) throw new Error('Invalid saved ID');
      return saved;
    }
  } catch {}
  if (linkedId) return { ...fixture('unregistered'), scannedCardId: linkedId };
  return entry ? fixture(entry, entry) : { ...fixture('unregistered'), view: 'scan' };
}

function liveDraftKey() { return `shomei.wallet-draft:${config.apiBaseUrl}:${currentCardId}`; }
function persist() {
  if (!liveEnabled) write('sessionStorage', sessionKey, JSON.stringify(state));
  else if (currentCardId) write('sessionStorage', liveDraftKey(), JSON.stringify({ nickname: state.nickname, preparingWallet, view: state.view }));
}
function update(next, preserveDialog = false) { state = { ...state, ...next }; persist(); render(preserveDialog); }
function choose(scenario) {
  currentCardId = null; qrIdentity = null; qrSource = './card-qr.svg';
  const url = new URL(location.href);
  url.search = '';
  if (scenario !== 'scan') url.searchParams.set('scenario', scenario);
  history.pushState(null, '', url);
  state = scenario === 'scan' ? { ...fixture('unregistered'), view: 'scan' } : fixture(scenario, scenario);
  scanning = false;
  cameraOpen = false;
  persist();
  render();
  window.scrollTo(0, 0);
}
function ready() { return liveEnabled ? Boolean(liveSnapshot?.canRegister && state.wallet === 'valid' && state.nickname.isWellFormed() && new TextEncoder().encode(state.nickname).length >= 1 && new TextEncoder().encode(state.nickname).length <= 96) : state.nickname.trim().length > 0 && state.wallet === 'valid'; }
function walletLabel() { return liveEnabled ? (liveSnapshot?.wallet.address ?? '') : t(state.wallet === 'wrong-wallet' ? 'wrongAddress' : 'simulatedAddress'); }
function cardLabel() { return liveEnabled ? currentCardId ?? '' : state.scannedCardId ?? 'TC-001'; }

function tradingCard() {
  return `<div class="trading-card"><div class="card-art"><img src="./assets/trading-card.jpg" alt="${t('cardAlt')}" width="1180" height="1333"><img class="card-qr" src="${liveEnabled || state.scannedCardId ? (qrSource ?? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E') : './card-qr.svg'}" alt="${t('qrAlt')}"></div></div>`;
}
function footer(action, label, extra = '', disabled = false, secondary = false) {
  return `<footer class="bottom-actions"><button type="button" class="btn ${secondary ? 'btn-outline' : 'btn-primary'}" data-action="${action}" ${disabled ? 'disabled' : ''}>${label}</button>${extra}</footer>`;
}
function scanView() {
  if (!cameraOpen) return `<section class="page entry-page"><h1 class="page-title">${lines('scanTitle')}</h1><div class="scan-intro"><img class="intro-qr" src="./assets/qr-scan.jpg" alt="${t('qrAlt')}" width="1241" height="1268"></div></section>${footer('open-camera', `${icon('qr')}${t('openCamera')}`)}`;
  if (cameraEnabled) return liveCameraView();
  return `<section class="page camera-page"><button class="flash-button" data-action="flash">${icon('flash')}<span>${t('flash')}</span></button><div class="scanner" aria-label="${t('scanHint')}"><div class="scan-corners" aria-hidden="true"><span></span><span></span><span></span><span></span></div><img class="scan-center" src="${liveEnabled || state.scannedCardId ? (qrSource ?? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221%22 height=%221%22/%3E') : './card-qr.svg'}" alt="${t('qrAlt')}"><div class="scan-light-track" aria-hidden="true"><div class="scan-sweep"></div></div></div><h1 class="scan-status"><span class="scan-status-ring" aria-hidden="true"></span>${t('cameraTitle')}</h1><div class="scan-tools"><button class="round-tool" data-action="photos">${icon('photo')}<span>${t('fromPhotos')}</span></button><button class="round-tool" data-action="help">${icon('info')}<span>${t('help')}</span></button></div></section>${footer('scan', `${scanning ? '<span class="loading loading-spinner loading-xs"></span>' : ''}${t(scanning ? 'scanLoading' : 'scanButton')}`, '', scanning)}`;
}
function detailTable(includeOwner = true, showIcons = false) {
  const rows = liveEnabled
    ? includeOwner ? [['cardName', `${t('player')} / ${t('cardType')}`], ['cardId', cardLabel()], ['ownerLabel', liveSnapshot?.read.card?.owner?.nickname ?? ''], ['wallet', liveSnapshot?.read.card?.owner?.address ?? '']]
      : [['nickname', state.nickname], ['wallet', walletLabel()], ['cardId', cardLabel()]]
    : includeOwner ? [['cardName', `${t('player')} / ${t('cardType')}`], ['cardId', cardLabel()], ['ownerLabel', state.nickname], ['wallet', t('simulatedAddress')], ['registeredAt', state.submittedAt ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(state.submittedAt) : t('sampleDate')]] : [['nickname', state.nickname], ['wallet', t('simulatedAddress')], ['cardId', cardLabel()]];
  const fieldIcons = { nickname: 'person', wallet: 'wallet', cardId: 'tag' };
  return `<dl class="record-table${showIcons ? ' review-record-table' : ''}">${rows.map(([key, value]) => `<div><dt>${showIcons ? `<span class="field-icon">${icon(fieldIcons[key])}</span>` : ''}<span>${t(key)}</span></dt><dd>${escape(value)}</dd></div>`).join('')}</dl>`;
}

function evidenceStatus() {
  const checking = liveSnapshot?.refresh.kind === 'checking';
  const failed = liveSnapshot?.refresh.kind === 'failed';
  const pending = state.card === 'evidence-pending';
  return `<div class="recorded-note ${checking || pending || failed ? 'evidence-status-pending' : ''}">${checking ? '<span class="evidence-spinner" aria-hidden="true"></span>' : icon(pending || failed ? 'info' : 'check')}<div><strong>${t(checking ? 'checkingEvidence' : failed ? 'refreshFailed' : pending ? 'evidenceTitle' : 'recorded')}</strong><p>${t(pending || failed ? 'evidenceCopy' : 'recordedNote')}</p></div></div>${pending || failed || checking ? `<button class="btn btn-ghost evidence-refresh" data-action="refresh-evidence" ${checking ? 'disabled' : ''}>${t('refreshEvidence')}</button>` : ''}`;
}
function registeredView(completed = false) {
  return `<section class="page result-page"><div class="status-symbol success">${icon('check')}</div><h1 class="page-title">${t(completed ? 'successTitle' : 'registered')}</h1>${tradingCard()}<div class="info-panel">${detailTable()}<div id="evidence-status" role="status" aria-live="polite" aria-busy="${liveSnapshot?.refresh.kind === 'checking'}">${evidenceStatus()}</div><div class="result-actions"><button class="btn btn-outline" data-action="details">${t('detailsButton')}</button></div></div></section>`;
}
function cardView() {
  if (liveEnabled && (!liveSnapshot || liveSnapshot.read.kind === 'loading')) return `<section class="page"><h1 class="page-title" role="status">${t('loading')}</h1></section>`;
  if (['not-found', 'unavailable'].includes(state.card)) {
    const absent = state.card === 'not-found';
    return `<section class="page"><div class="status-symbol warning">${icon('info')}</div><h1 class="page-title">${t(absent ? 'notFoundTitle' : 'unavailableTitle')}</h1><p class="process-copy">${lines(absent ? 'notFoundCopy' : 'unavailableCopy')}</p></section>${footer(absent ? 'scan-again' : 'retry-read', t(absent ? 'scanAnother' : 'retry'))}`;
  }
  if (['registered', 'evidence-pending'].includes(state.card)) return registeredView();
  return `<section class="page read-page"><div class="status-symbol">${icon('check')}</div><h1 class="page-title">${t('readTitle')}</h1>${tradingCard()}<div class="info-panel card-summary"><h2>${t('player')}</h2><p>${t('cardType')}</p><p>ID: ${escape(cardLabel())}</p><span class="registration-badge">${t('unregistered')}</span></div></section>${(liveEnabled && config.walletMode === 'mock' ? '' : footer('start-register', `${t('next')}${icon('arrow')}`))}`;
}
function walletSetup() {
  if (liveEnabled) return liveSnapshot?.preparation ?? { kind: 'idle' };
  if (state.wallet === 'valid') return { kind: 'ready' };
  const step = state.scenario.slice('wallet-'.length);
  if (['connect', 'add', 'switch'].includes(step)) return { kind: 'pending', step };
  if (['paused', 'rejected'].includes(step)) return { kind: step, step: 'switch' };
  return { kind: state.wallet === 'wrong-chain' ? 'paused' : 'idle', step: 'switch' };
}
function walletPreparationView() {
  const setup = walletSetup();
  const network = liveSnapshot?.read.connection?.network;
  const name = network?.name ?? 'Curvegrid Testnet';
  const pending = setup.kind === 'pending';
  const status = setup.kind === 'ready' ? 'walletReady' : setup.kind === 'idle' ? 'preparationCopy' : pending ? setup.slow ? 'setupSlow' : { check: 'setupCheck', connect: 'setupConnect', add: 'setupAdd', switch: 'setupSwitch' }[setup.step] : { paused: 'setupPaused', rejected: 'setupRejected', failed: 'setupFailed', blocked: 'setupBlocked' }[setup.kind];
  const action = pending || setup.kind === 'blocked' ? 'check-wallet' : 'prepare-wallet';
  return `<div class="wallet-preparation" id="wallet-preparation"><p class="form-label">${t('walletPreparationTitle')}</p><p class="wallet-network">${escape(name)}</p><div class="wallet-status ${setup.kind === 'ready' ? 'wallet-ready' : ''}" role="status" aria-live="polite">${pending && !setup.slow ? '<span class="loading loading-spinner loading-xs" aria-hidden="true"></span>' : setup.kind === 'ready' ? icon('check') : ''}<span>${t(status)}</span></div>${state.wallet !== 'disconnected' ? `<p class="wallet-address">${escape(walletLabel())}</p>` : ''}${setup.kind !== 'ready' ? `<p class="wallet-return">${t('returnToBrowser')}</p><button class="btn btn-primary wallet-prepare-button" data-action="${action}">${t(pending || setup.kind === 'blocked' ? 'checkWallet' : setup.kind === 'idle' ? 'prepareWallet' : 'continueWallet')}</button>` : ''}<button class="btn btn-ghost wallet-help-button" data-action="wallet-help">${t('walletHelp')}</button>${['failed', 'blocked'].includes(setup.kind) || setup.slow ? diagnosticControls() : ''}</div>`;
}
function registerView() {
  return `<section class="page register-page">${tradingCard()}<div class="info-panel"><h1 class="page-title">${t('registerTitle')}</h1><div class="form-field"><label class="form-label" for="nickname">${t('nickname')}</label><div class="nickname-input"><input class="input input-bordered" id="nickname" name="nickname" autocomplete="off" value="${escape(state.nickname)}"><button type="button" data-action="clear-nickname" aria-label="${t('clearNickname')}">${icon('close')}</button></div></div>${walletPreparationView()}${state.wallet === 'wrong-wallet' ? `<p role="alert">${t('wrongWalletTitle')}</p><button class="btn btn-outline" data-action="fix-wallet">${t('switchWallet')}</button>` : ''}</div></section>${footer('confirm', `${t('next')}${icon('arrow')}`, '', !ready())}`;
}
function walletHelpDialog() {
  const network = liveSnapshot?.read.connection?.network;
  const url = new URL(config.publicUrl);
  if (currentCardId) url.search = new URLSearchParams({ cardId: currentCardId });
  const link = `https://link.metamask.io/dapp/${url.href.replace(/^https?:\/\//, '')}`;
  return `<dialog id="wallet-help-dialog" class="modal modal-bottom" aria-labelledby="wallet-help-title"><div class="modal-box"><h2 id="wallet-help-title">${t('walletHelp')}</h2><p class="wallet-return">${t('walletHelpCopy')}</p>${liveEnabled ? `<a class="btn btn-primary wallet-prepare-button" href="${escape(link)}">${t('openInMetaMask')}</a>` : ''}${network ? `<details class="network-settings"><summary>${t('manualNetwork')}</summary><p>${t('manualNetworkCopy')}</p><dl class="data-list">${[['networkName', network.name], ['chainIdLabel', network.chainId], ['currencyLabel', network.nativeCurrency.symbol], ['rpcLabel', network.rpcUrls[0]]].map(([label, value]) => `<div><dt>${t(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><button class="btn btn-outline wallet-prepare-button" data-action="copy-network">${t('networkSettings')}</button><p id="network-copy-status" role="status"></p></details>` : ''}<form method="dialog"><button class="btn btn-outline wallet-prepare-button">${t('close')}</button></form></div></dialog>`;
}
function reviewView() {
  return `<section class="page review-page"><h1 class="page-title">${t('confirmTitle')}</h1>${tradingCard()}<div class="info-panel"><h2 class="panel-title">${t('confirmHeading')}</h2>${detailTable(false, true)}<label class="consent-label"><input type="checkbox" class="consent-checkbox" id="consent" ${state.consent ? 'checked' : ''}><span><strong>${t('consent')}</strong><small>${t('consentNote')}</small></span></label><button class="btn btn-primary panel-primary" data-action="register-reviewed" ${state.consent && ready() ? '' : 'disabled'}>${t('registerNow')}${icon('arrow')}</button><button class="btn btn-outline edit-button" data-action="edit-review">${icon('back')}${t('edit')}</button></div></section>`;
}
function registrationScene() {
  return `<div class="registration-scene" aria-hidden="true"><div class="network-orbit"><span class="orbit-tracer"></span></div><div class="network-cube cube-top">${icon('cube')}</div><div class="network-cube cube-left">${icon('cube')}</div><div class="network-cube cube-right">${icon('cube')}</div><div class="registration-card">${tradingCard()}</div><div class="connection-beam"></div><div class="scene-platform"><span></span><span></span><span></span></div><div class="scene-terminal terminal-qr">${icon('qr')}</div><div class="scene-terminal terminal-wallet">${icon('wallet')}</div></div><div class="registration-indicator" aria-hidden="true"><div class="indicator-orbit"></div><div class="indicator-center">${icon('link')}</div></div>`;
}
function processView() {
  const view = state.view;
  if (liveEnabled && view === 'approval') return `<section class="page approval-page" aria-busy="true"><div class="status-symbol">${icon('wallet')}</div><h1 class="page-title" role="status">${t('approvalTitle')}</h1><p class="process-copy">${t('approvalCopy')}</p><div class="info-panel">${detailTable(false)}</div></section>`;
  if (liveEnabled && view === 'unknown') return `<section class="page"><div class="status-symbol warning">${icon('info')}</div><h1 class="page-title">${t('unknownTitle')}</h1><p class="process-copy">${t(liveSnapshot?.registration.hash ? 'unknownCopy' : 'unknownNoHash')}</p>${liveSnapshot?.registration.hash ? `<p class="process-copy">${escape(liveSnapshot.registration.hash)}</p>` : `<label class="form-label" for="transaction-hash">${t('hashLabel')}</label><input class="input input-bordered" id="transaction-hash" placeholder="${t('hashPlaceholder')}" autocomplete="off">`}${liveError ? `<p class="alert alert-error">${escape(t(liveError))}</p>${diagnosticControls()}` : ''}</section>${footer('recheck', t('recheck'))}`;
  if (view === 'success') return registeredView(true);
  const active = ['sent', 'confirming', 'processing-preview'].includes(view);
  if (active) return `<section class="page processing-page" aria-busy="true">${registrationScene()}<h1 class="page-title" role="status">${t('confirmingTitle')}</h1><p class="process-copy">${t(view === 'sent' ? 'sentCopy' : 'confirmingCopy')}</p></section>`;
  const config = { approval: ['wallet', '', 'approvalTitle', 'approvalCopy'], rejected: ['close', '', 'rejectedTitle', 'rejectedCopy'], failed: ['close', 'error', 'failedTitle', 'failedCopy'], unknown: ['info', 'warning', 'unknownTitle', 'unknownCopy'] }[view];
  return `<section class="page ${view === 'approval' ? 'approval-page' : ''}"><div class="status-symbol ${config[1]}">${icon(config[0])}</div><h1 class="page-title">${t(config[2])}</h1><p class="process-copy">${t(config[3])}</p>${liveEnabled && liveError ? `<p class="alert alert-error" role="alert">${escape(t(liveError))}</p>${diagnosticControls()}` : ''}${view === 'approval' ? `<div class="info-panel">${detailTable(false)}</div><button class="btn btn-outline decline-button" data-action="reject">${t('reject')}</button>` : ''}</section>${footer(view === 'approval' ? 'approve' : view === 'unknown' ? 'recheck' : 'edit-again', t(view === 'approval' ? 'approve' : view === 'unknown' ? 'recheck' : 'editAgain'))}`;
}
function dialogs() {
  if (liveEnabled) return liveDialogs();
  const row = (label, value) => `<div><dt>${t(label)}</dt><dd>${escape(value)}</dd></div>`;
  return `<dialog id="help-dialog" class="modal modal-bottom" aria-labelledby="help-title"><div class="modal-box"><h2 id="help-title">${t('help')}</h2><p id="help-copy" class="process-copy">${t('helpCopy')}</p><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="wallet-dialog" class="modal modal-bottom" aria-labelledby="wallet-title"><div class="modal-box"><h2 id="wallet-title" class="text-xl font-bold">${t('connectTitle')}</h2><p class="text-sm text-[#61718b] leading-7 mt-3">${t('connectDescription')}</p><button class="btn btn-primary w-full mt-6" data-action="connect-sample">${t('simulateConnect')}</button><form method="dialog"><button class="btn btn-ghost w-full mt-2">${t('cancel')}</button></form></div></dialog><dialog id="details-dialog" class="modal modal-bottom" aria-labelledby="details-title"><div class="modal-box"><h2 id="details-title" class="text-xl font-bold">${t('detailsTitle')}</h2><p class="process-copy">${t('physicalNote')}</p><dl class="data-list">${row('owner', state.nickname)}${row('wallet', t('simulatedAddress'))}${row('cardId', cardLabel())}${row('issuer', t('collection'))}${row('network', 'Polygon Amoy · 80002')}${row('contract', t('contractValue'))}${row('transaction', state.card === 'evidence-pending' ? t('evidenceTitle') : t('sampleTransactionValue'))}</dl><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="scenarios-dialog" class="modal modal-bottom" aria-labelledby="scenarios-title"><div class="modal-box"><div class="flex justify-between items-start gap-3"><h2 id="scenarios-title" class="text-lg font-bold">${t('scenariosTitle')}</h2><form method="dialog"><button class="btn btn-ghost btn-square btn-sm" aria-label="${t('close')}">${icon('close')}</button></form></div><button class="btn btn-outline w-full mt-5" data-action="language">${icon('globe')}${locale === 'ja' ? 'English' : '日本語'}</button><div class="scenario-grid"><button class="btn btn-outline border-base-300" data-scenario="scan">${icon('qr')}${t('startScan')}</button>${scenarios.map((id, i) => `<button class="btn ${state.scenario === id && state.view !== 'scan' ? 'btn-soft btn-primary' : 'btn-ghost bg-base-200'}" data-scenario="${id}">${t('scenario_' + scenarioKeys[i])}</button>`).join('')}</div><button class="btn btn-outline border-base-300 w-full mt-5" data-action="share">${t('shareView')}</button><p class="text-[11px] leading-6 text-[#738199] mt-2">${t('shareHelp')}</p><p id="share-status" class="text-xs text-primary mt-2" aria-live="polite"></p></div></dialog>`;
}

function render(preserveDialog = false) {
  if (cameraEnabled && (!cameraOpen || state.view !== 'scan') && cameraState.kind !== 'stopped') camera.stop();
  const heldVideo = cameraEnabled && cameraOpen && state.view === 'scan' ? root.querySelector('#camera-video') : null;
  heldVideo?.remove();
  clearTimeout(timer);
  const openDialog = preserveDialog && root.querySelector('dialog[open]')?.id;
  document.documentElement.lang = locale;
  document.title = t('title');
  const content = state.view === 'scan' ? scanView() : state.view === 'card' ? cardView() : state.view === 'register' ? registerView() : state.view === 'review' ? reviewView() : processView();
  root.innerHTML = walletHelpDialog() + `<div class="phone ${state.view === 'scan' && !cameraOpen ? 'home-scene' : 'flow-scene'}"><header class="app-header"><button class="round-button" data-action="${state.view === 'scan' && cameraOpen ? 'close-camera' : 'back-screen'}" aria-label="${t('backScreen')}" ${(['sent', 'confirming', 'unknown'].includes(state.view) || (liveEnabled && state.view === 'approval')) ? 'disabled' : ''}>${icon('back')}</button><a class="brand" href="./" data-action="home"><span class="brand-art"><img src="./assets/logo-ja.jpg" alt="${t('brand')} QR Proof" width="1236" height="1272"></span></a><button class="round-button" data-action="scenarios" aria-label="${t('menu')}"><span aria-hidden="true">•••</span></button></header><p class="demo-label">${liveEnabled ? t(config.walletMode === 'mock' ? 'readonly' : 'demo') : `${t('demo')} · ${t('noTransaction')}`}</p><main>${content}</main></div>${dialogs()}`;
  if (cameraEnabled && cameraOpen && state.view === 'scan') root.querySelector('#camera-slot').replaceWith(camera.getVideo());
  if (openDialog) document.getElementById(openDialog)?.showModal();
  if (!liveEnabled && ['sent', 'confirming'].includes(state.view)) {
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
  if (scenarioButton && !liveEnabled) { choose(scenarioButton.dataset.scenario); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  event.preventDefault();
  const action = button.dataset.action;
  if (cameraEnabled && await handleCameraAction(action)) return;
  if (action === 'wallet-help') { root.querySelector('#wallet-help-dialog').showModal(); return; }
  if (!liveEnabled && action === 'prepare-wallet') { if (walletSetup().kind === 'idle') root.querySelector('#wallet-dialog').showModal(); else update({ wallet: 'valid' }); return; }
  if (!liveEnabled && action === 'check-wallet') { update({ scenario: 'wallet-paused', wallet: 'wrong-chain' }); return; }
  if (liveEnabled && await handleLiveAction(action)) return;
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
    url.search = state.view === 'scan' ? '' : state.scannedCardId ? new URLSearchParams({ cardId: state.scannedCardId }).toString() : `?scenario=${state.view === 'success' || state.card === 'registered' ? 'registered' : state.scenario}`;
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
window.addEventListener('popstate', () => { if (liveEnabled) { openLiveCard(new URL(location.href).searchParams.get('cardId')); return; } state = restore(); scanning = false; cameraOpen = false; if (state.scannedCardId) setCardQr(state.scannedCardId); render(); });
if (!liveEnabled) persist();
render();
if (liveEnabled && currentCardId) void openLiveCard(currentCardId);
if (!liveEnabled && state.scannedCardId) setCardQr(state.scannedCardId);

function liveDialogs() {
  const card = liveSnapshot?.read.card;
  const connection = liveSnapshot?.read.connection;
  const rows = [['owner', card?.owner?.nickname ?? ''], ['wallet', card?.owner?.address ?? ''], ['cardId', cardLabel()], ['issuer', connection?.registry.issuer ?? ''], ['network', connection ? `${connection.network.name} · ${connection.network.chainId}` : ''], ['contract', connection?.registry.contractAddress ?? ''], ['transaction', card?.evidence.transactionHash ?? t('noEvidence')]];
  const details = rows.map(([label, value]) => `<div><dt>${t(label)}</dt><dd>${escape(value)}</dd></div>`).join('');
  const evidence = card?.evidence.transactionHash ? `<a class="btn btn-outline w-full mt-5" target="_blank" rel="noopener noreferrer" href="${escape(`${config.apiBaseUrl}/api/v1/cards/${encodeURIComponent(cardLabel())}/transactions/${card.evidence.transactionHash}`)}">${t('recordDetails')}${icon('link')}</a>` : '';
  return `<dialog id="help-dialog" class="modal modal-bottom" aria-labelledby="help-title"><div class="modal-box"><h2 id="help-title">${t('help')}</h2><p id="help-copy" class="process-copy">${t('helpCopy')}</p><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="details-dialog" class="modal modal-bottom" aria-labelledby="details-title"><div class="modal-box"><h2 id="details-title">${t('detailsTitle')}</h2><p class="process-copy">${t('physicalNote')}</p><dl class="data-list">${details}</dl>${evidence}<form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog><dialog id="scenarios-dialog" class="modal modal-bottom" aria-labelledby="settings-title"><div class="modal-box"><h2 id="settings-title">${t('liveMenu')}</h2><button class="btn btn-outline w-full mt-5" data-action="language">${icon('globe')}${locale === 'ja' ? 'English' : '日本語'}</button>${liveSnapshot?.wallet.kind === 'connected' ? `<button class="btn btn-outline w-full mt-5" data-action="disconnect">${t('disconnect')}</button>` : ''}<button class="btn btn-outline w-full mt-5" data-action="share">${t('shareView')}</button><p id="share-status" aria-live="polite"></p><form method="dialog"><button class="btn btn-primary w-full mt-5">${t('close')}</button></form></div></dialog>`;
}
function diagnosticControls() {
  return `<button class="btn btn-outline w-full mt-5" data-action="copy-diagnostics">${t('copyDiagnostics')}</button><pre id="diagnostic-output" class="process-copy" aria-live="polite"></pre>`;
}
function liveNotice(code) {
  if (code === 'INSUFFICIENT_FUNDS') return 'insufficientFunds';
  if (code === 'WALLET_4001') return 'rejectedCopy';
  if (code === 'WALLET_CHANGED' || code === 'WALLET_DISCONNECTED') return 'networkChanged';
  if (code === 'LOCKS_UNAVAILABLE') return 'unsupported';
  if (code === 'REGISTRATION_IN_PROGRESS') return 'otherTab';
  if (code === 'WALLET_NOT_ALLOWED') return 'walletNotAllowedHelp';
  if (code === 'CHAIN_MISMATCH') return 'wrongChainTitle';
  if (code === 'INVALID_NICKNAME' || code === 'INVALID_INPUT') return 'nicknameInvalid';
  if (code?.includes('STORAGE')) return 'storageFailed';
  if (code?.includes('LOCK')) return 'otherTab';
  if (code?.includes('UNSUPPORTED')) return 'unsupported';
  return 'apiFailed';
}
function receiveLive(snapshot) {
  const statusOnly = liveSnapshot && (snapshot.refresh.kind === 'checking' || liveSnapshot.refresh.kind === 'checking') && root.querySelector('#evidence-status');
  const walletOnly = state.view === 'register' && liveSnapshot && snapshot.registration.kind === 'idle' && liveSnapshot.registration.kind === 'idle' && JSON.stringify(snapshot.read) === JSON.stringify(liveSnapshot.read) && root.querySelector('#wallet-preparation');
  const changedWallet = liveSnapshot && snapshot.walletRevision !== liveSnapshot.walletRevision;
  liveSnapshot = snapshot;
  if (changedWallet) { state.consent = false; if (state.view === 'review') state.view = 'register'; }
  const readState = snapshot.read;
  if (readState.kind === 'ready') {
    state.card = readState.card.status === 'registered' ? (readState.card.evidence.status === 'pending' ? 'evidence-pending' : 'registered') : 'unregistered';
    if (readState.card.owner) {
      state.nickname = readState.card.owner.nickname;
      if (snapshot.registration.kind === 'idle' && ['register', 'review'].includes(state.view)) state.view = 'card';
    }
  } else if (readState.kind === 'not-found') state.card = 'not-found';
  else if (readState.kind === 'unavailable') state.card = 'unavailable';
  state.wallet = snapshot.wallet.kind !== 'connected' ? 'disconnected' : snapshot.wallet.chainId !== readState.connection?.network.chainId ? 'wrong-chain' : 'valid';
  const stage = snapshot.registration.kind;
  const mapped = { preparing: 'approval', approval: 'approval', pending: 'confirming', unknown: 'unknown', rejected: 'rejected', reverted: 'failed', confirmed: 'success', failed: 'failed' }[stage];
  if (mapped && currentCardId) state.view = mapped;
  liveError = snapshot.registration.errorCode ? liveNotice(snapshot.registration.errorCode) : null;
  if (statusOnly) {
    statusOnly.setAttribute('aria-busy', String(snapshot.refresh.kind === 'checking'));
    statusOnly.innerHTML = evidenceStatus();
  } else if (walletOnly) {
    walletOnly.outerHTML = walletPreparationView();
    const next = root.querySelector('[data-action="confirm"]');
    if (next) next.disabled = !ready();
  } else render(true);
}
async function openLiveCard(cardId) {
  currentCardId = cardId;
  liveError = null;
  state = { ...fixture('unregistered'), nickname: '', view: cardId ? 'card' : 'scan' };
  preparingWallet = false;
  let restoreForm = false;
  try {
    const draft = JSON.parse(read('sessionStorage', liveDraftKey()));
    if (typeof draft?.nickname === 'string') state.nickname = draft.nickname;
    preparingWallet = config.walletMode === 'metamask' && draft?.preparingWallet === true;
    restoreForm = preparingWallet && ['register', 'review'].includes(draft.view);
  } catch {}
  cameraOpen = false;
  scanning = false;
  if (cardId) {
    const url = new URL(config.publicUrl); url.search = new URLSearchParams({ cardId });
    qrIdentity = cardId; qrSource = null;
    QRCode.toDataURL(url.href, { margin: 1, color: { dark: '#172b4d', light: '#ffffff' } }).then(source => { if (qrIdentity === cardId) { qrSource = source; const img = root.querySelector('.card-qr'); if (img) img.src = source; } });
    render();
    if (live) {
      await live.open(cardId);
      if (preparingWallet && state.card === 'unregistered' && liveSnapshot?.registration.kind === 'idle') {
        if (restoreForm) { state.view = 'register'; render(); }
        await live.resumeSetup();
      }
    }
  } else { qrIdentity = null; qrSource = './card-qr.svg'; render(); }
}
async function handleLiveAction(action) {
  if (action === 'copy-diagnostics') {
    const { diagnostics } = await import('../src/live-api.js');
    const report = JSON.stringify({ cardId: currentCardId, walletAddress: liveSnapshot?.wallet.address ?? null, chainId: liveSnapshot?.wallet.chainId ?? null, preparation: liveSnapshot?.preparation, code: liveSnapshot?.preparation.errorCode ?? liveSnapshot?.registration.errorCode ?? null, errors: diagnostics() }, null, 2);
    const output = root.querySelector('#diagnostic-output');
    try { await navigator.clipboard.writeText(report); output.textContent = t('diagnosticsCopied'); }
    catch { output.textContent = report; }
    return true;
  }
  if (['approve', 'reject', 'connect-sample'].includes(action)) return true;
  if (action === 'home' || action === 'scan-again') {
    if (['approval', 'sent', 'confirming', 'unknown'].includes(state.view)) return true;
    const url = new URL(location.href); url.search = ''; history.pushState(null, '', url); await openLiveCard(null); return true;
  }
  if (action === 'scan') {
    if (!cameraOpen || scanning) return true;
    const url = new URL(location.href); url.search = new URLSearchParams({ cardId: config.cardId }); history.pushState(null, '', url);
    await openLiveCard(config.cardId); return true;
  }
  if (action === 'back-screen' && ['approval', 'sent', 'confirming', 'unknown'].includes(state.view)) return true;
  if (action === 'back-screen' && !['register', 'review'].includes(state.view)) return handleLiveAction('home');
  if (action === 'share') {
    const url = new URL(config.publicUrl); if (currentCardId) url.search = new URLSearchParams({ cardId: currentCardId });
    try { await navigator.clipboard.writeText(url.href); document.querySelector('#share-status').textContent = t('copied'); }
    catch { document.querySelector('#share-status').textContent = url.href; }
    return true;
  }
  if (action === 'copy-network') {
    const network = liveSnapshot.read.connection.network;
    const text = `${network.name}\nChain ID: ${network.chainId}\n${network.nativeCurrency.symbol}\n${network.rpcUrls[0]}`;
    const output = root.querySelector('#network-copy-status');
    try { await navigator.clipboard.writeText(text); output.textContent = t('copied'); }
    catch { output.textContent = text; }
    return true;
  }
  if (action === 'check-wallet') { await live?.resumeSetup(); return true; }
  if (action === 'prepare-wallet' || action === 'connect' || action === 'fix-wallet') {
    if (!live || config.walletMode !== 'metamask') return true;
    preparingWallet = true; persist();
    try { await live.connect(); }
    catch { liveError = 'connectFailed'; render(); }
    return true;
  }
  if (action === 'disconnect') { preparingWallet = false; persist(); await live?.disconnect(); state.consent = false; render(); return true; }
  if (action === 'start-register' && config.walletMode !== 'metamask') return true;
  if (action === 'confirm') { if (ready()) update({ view: 'review', consent: false }); return true; }
  if (action === 'register-reviewed') {
    if (state.view === 'review' && state.consent && ready()) { state.consent = false; await live.register(state.nickname); }
    return true;
  }
  if (action === 'recheck') {
    const hash = root.querySelector('#transaction-hash')?.value;
    try { await live?.recheck(hash || undefined); } catch { liveError = 'apiFailed'; render(); }
    return true;
  }
  if (action === 'details') render(true);
  if (action === 'refresh-evidence') { await live?.refresh(); return true; }
  if (action === 'retry-read') { if (currentCardId) await live?.open(currentCardId); return true; }
  return false;
}
if (liveEnabled) {
  import('../src/live-registration.js').then(({ createLiveRegistration }) => {
    live = createLiveRegistration(config, receiveLive);
    if (currentCardId) return live.open(currentCardId);
  }).catch(() => { liveSnapshot = { read: { kind: 'unavailable' }, wallet: { kind: 'disconnected' }, registration: { kind: 'idle' } }; state.card = 'unavailable'; render(); });
  const resume = () => {
    live?.setVisible(!document.hidden);
    if (!document.hidden && live && currentCardId) {
      if (preparingWallet) live.resumeSetup().catch(() => {});
      live.recheck().catch(() => {});
    }
  };
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', resume);
}
