// SPDX-License-Identifier: MIT
export function createWalletPrimaryName(api, changed) {
  let address = null, name = null, revision = 0;
  return {
    snapshot: () => ({ address, name }),
    async setAddress(next) {
      const normalized = next?.toLowerCase() ?? null;
      if (normalized === address) return;
      address = normalized; name = null;
      const attempt = ++revision;
      changed();
      if (!address) return;
      try {
        const result = await api.primaryName(address);
        if (attempt !== revision || result.address.toLowerCase() !== address) return;
        name = result.name;
      } catch { if (attempt !== revision) return; name = null; }
      changed();
    },
  };
}
