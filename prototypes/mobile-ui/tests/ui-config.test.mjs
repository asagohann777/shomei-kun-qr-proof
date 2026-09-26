import assert from 'node:assert/strict';
import { test } from 'node:test';
import { uiConfig } from '../scripts/ui-config.mjs';
test('default UI remains fully mocked and configuration contains no secrets', () => {
  const config = uiConfig({ MULTIBAAS_API_KEY: 'private' });
  assert.equal(config.apiMode, 'mock'); assert.equal(config.walletMode, 'mock');
  assert.equal(JSON.stringify(config).includes('private'), false);
});
test('live preview and signing are explicit and invalid modes stop the build', () => {
  const input = { UI_API_MODE: 'live', UI_API_BASE_URL: 'https://api.example', UI_WALLET_MODE: 'mock' };
  assert.equal(uiConfig(input).walletMode, 'mock');
  assert.equal(uiConfig({ ...input, UI_WALLET_MODE: 'metamask', UI_RPC_ORIGIN: 'https://rpc.example' }).walletMode, 'metamask');
  for (const env of [{ ...input, UI_WALLET_MODE: 'metamask' }, { ...input, UI_WALLET_MODE: 'metamask', UI_RPC_ORIGIN: 'https://rpc.example/private-key' }, { UI_WALLET_MODE: 'metamask' }, { UI_API_MODE: 'live' }, { UI_API_MODE: 'typo' }, { ...input, UI_API_BASE_URL: 'https://api.example/api' }, { ...input, UI_API_BASE_URL: 'https://key@api.example' }]) assert.throws(() => uiConfig(env));
});

test('camera configuration is independent, defaults to mock, rejects invalid values', () => {
  assert.equal(uiConfig({}).cameraMode, 'mock');
  for (const apiMode of ['mock', 'live']) for (const cameraMode of ['mock', 'live']) {
    const config = uiConfig({ UI_API_MODE: apiMode, UI_CAMERA_MODE: cameraMode, UI_API_BASE_URL: 'https://api.example' });
    assert.equal(config.cameraMode, cameraMode); assert.equal(config.apiBaseUrl, 'https://api.example');
  }
  assert.equal(uiConfig({ UI_CAMERA_MODE: 'live', UI_API_MODE: 'live', UI_API_BASE_URL: 'https://api.example', UI_WALLET_MODE: 'metamask', UI_RPC_ORIGIN: 'https://rpc.example' }).cameraMode, 'live');
  assert.throws(() => uiConfig({ UI_CAMERA_MODE: 'typo' }), /UI_CAMERA_MODE/);
});
