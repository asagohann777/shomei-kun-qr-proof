// SPDX-License-Identifier: MIT
export function createEnsSearch(api, onChange) {
  let generation = 0;
  let state = { name: '', busy: false, result: null, error: null };
  function publish(patch) { state = { ...state, ...patch }; onChange(state); }
  return {
    snapshot: () => state,
    cancel() { generation++; publish({ busy: false }); },
    async search(name, more = false) {
      if (state.busy || (more && !state.result?.nextCursor)) return;
      const attempt = ++generation;
      const previous = more ? state.result : null;
      publish({ name, busy: true, error: null, result: previous });
      try {
        const result = await api.ensCards(name, previous?.nextCursor);
        if (attempt !== generation) return;
        if (previous && (previous.address.toLowerCase() !== result.address.toLowerCase() || previous.snapshot.hash !== result.snapshot.hash)) {
          publish({ busy: false, result: null, error: 'SEARCH_RESTART_REQUIRED' }); return;
        }
        const cards = [...(previous?.cards ?? []), ...result.cards];
        publish({ busy: false, result: { ...result, cards: [...new Map(cards.map(card => [card.cardId, card])).values()] } });
      } catch (error) {
        if (attempt !== generation) return;
        const restart = ['ENS_ADDRESS_CHANGED', 'SEARCH_RESTART_REQUIRED'].includes(error.code);
        publish({ busy: false, result: restart ? null : previous, error: error.code ?? 'UPSTREAM_UNAVAILABLE' });
      }
    },
  };
}
