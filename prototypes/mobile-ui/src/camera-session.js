export function parseCardQr(value, config) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.username || url.password || url.hash) return null;
  const base = new URL(config.publicUrl);
  if (url.origin === base.origin && url.pathname === base.pathname) {
    const keys = [...url.searchParams.keys()];
    if (keys.length !== 1) return null;
    if (keys[0] === 'scenario' && url.searchParams.get('scenario') === 'registered' && config.apiMode === 'mock') return { kind: 'sample' };
    const id = url.searchParams.get('cardId');
    return keys[0] === 'cardId' && /^[A-Za-z0-9_-]{1,64}$/.test(id ?? '') ? { kind: 'card', id } : null;
  }
  if (config.apiBaseUrl && url.origin === new URL(config.apiBaseUrl).origin && !url.search) {
    const match = /^\/api\/v1\/cards\/([A-Za-z0-9_-]{1,64})$/.exec(url.pathname);
    if (match) return { kind: 'card', id: match[1] };
  }
  return null;
}

export function createCameraSession({ createVideo, scannerFactory, imageEngine, scanImage, parse, changed, detected }) {
  let video = createVideo();
  let state = { kind: 'stopped' }, generation = 0, scanner = null, engine = null, accepted = false;
  const emit = next => { if (JSON.stringify(state) === JSON.stringify(next)) return; state = next; changed({ ...state }); };
  function release() {
    scanner?.destroy(); scanner = null;
    for (const track of video.srcObject?.getTracks() ?? []) track.stop();
    video.srcObject = null;
    engine?.terminate?.(); engine = null;
  }
  function stop(kind = 'stopped') { generation++; release(); emit({ kind }); }
  function accept(value, token) {
    if (token !== generation || accepted) return;
    const result = parse(value);
    if (!result) {
      if (['scanning', 'starting'].includes(state.kind)) emit({ ...state, error: 'invalidQr' });
      else { release(); emit({ kind: 'error', error: 'invalidQr' }); }
      return;
    }
    accepted = true; stop(); detected(result);
  }
  async function start() {
    stop(); accepted = false;
    const token = generation;
    video = createVideo();
    emit({ kind: 'starting' });
    try {
      const session = scannerFactory(video, value => accept(value.data ?? value, token), () => {
        if (token !== generation) return;
        generation++; release(); emit({ kind: 'error', error: 'cameraError' });
      });
      scanner = session;
      await session.start();
      if (token !== generation) return;
      const torch = await session.hasFlash();
      if (token !== generation) return;
      emit({ kind: 'scanning', torch, light: false, ...(state.error ? { error: state.error } : {}) });
    } catch {
      if (token !== generation) return;
      generation++; release(); emit({ kind: 'error', error: 'cameraError' });
    }
  }
  async function photo(file) {
    if (!file) return;
    stop(); accepted = false;
    const token = generation;
    emit({ kind: 'photo' });
    try {
      const decoder = await imageEngine();
      if (token !== generation) { decoder.terminate?.(); return; }
      engine = decoder;
      const result = await scanImage(file, { qrEngine: decoder, returnDetailedScanResult: true });
      accept(result.data ?? result, token);
    } catch {
      if (token !== generation) return;
      release(); emit({ kind: 'error', error: 'photoError' });
    }
  }
  async function toggleLight() {
    if (state.kind !== 'scanning' || !state.torch) return;
    const token = generation, session = scanner;
    try {
      await session.toggleFlash();
      if (token === generation) emit({ ...state, light: session.isFlashOn() });
    } catch { if (token === generation) emit({ ...state, error: 'lightError' }); }
  }
  return { getVideo: () => video, start, photo, stop, pause: () => stop('paused'), toggleLight, snapshot: () => ({ ...state }) };
}
