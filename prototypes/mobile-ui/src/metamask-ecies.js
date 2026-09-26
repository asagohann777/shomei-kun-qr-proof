// SPDX-License-Identifier: MIT
import ecies from '../node_modules/eciesjs/dist/index.js';

export const decrypt = ecies.decrypt;
export const encrypt = ecies.encrypt;
export const PrivateKey = ecies.PrivateKey;
export const PublicKey = ecies.PublicKey;
