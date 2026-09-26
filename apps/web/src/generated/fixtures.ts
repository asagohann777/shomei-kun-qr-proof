// SPDX-License-Identifier: MIT
// Generated from specs/openapi.yaml. Run npm run generate.
export const sample = {
  "cardId": "SK-2026-001",
  "playerName": "証明一郎",
  "walletAddress": "0x7a31000000000000000000000000000000008f42",
  "nickname": "おじいちゃんコンビニ",
  "chainId": 80002,
  "contractAddress": "0x3333333333333333333333333333333333333333",
  "issuer": "0x4444444444444444444444444444444444444444",
  "transactionHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "blockNumber": 100
} as const;

export const scenarios = {
  "getCard": {
    "default": {
      "status": 200,
      "example": "registered"
    },
    "registered": {
      "status": 200,
      "example": "registered"
    },
    "unregistered": {
      "status": 200,
      "example": "unregistered"
    },
    "not-found": {
      "status": 404,
      "example": "CARD_NOT_FOUND"
    },
    "evidence-pending": {
      "status": 200,
      "example": "evidence-pending"
    },
    "unavailable": {
      "status": 503,
      "example": "UPSTREAM_UNAVAILABLE"
    }
  },
  "prepareRegistration": {
    "default": {
      "status": 200,
      "example": "prepared"
    },
    "unregistered": {
      "status": 200,
      "example": "prepared"
    },
    "registered": {
      "status": 409,
      "example": "ALREADY_REGISTERED"
    },
    "not-found": {
      "status": 404,
      "example": "CARD_NOT_FOUND"
    },
    "unavailable": {
      "status": 503,
      "example": "UPSTREAM_UNAVAILABLE"
    }
  },
  "getRegistrationTransaction": {
    "default": {
      "status": 200,
      "example": "confirmed"
    },
    "registered": {
      "status": 200,
      "example": "confirmed"
    },
    "pending": {
      "status": 200,
      "example": "pending"
    },
    "reverted": {
      "status": 200,
      "example": "reverted"
    },
    "unknown": {
      "status": 200,
      "example": "unknown"
    },
    "mismatch": {
      "status": 200,
      "example": "mismatch"
    },
    "not-found": {
      "status": 404,
      "example": "CARD_NOT_FOUND"
    },
    "unavailable": {
      "status": 503,
      "example": "UPSTREAM_UNAVAILABLE"
    }
  }
} as const;
