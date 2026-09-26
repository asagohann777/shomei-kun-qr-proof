// SPDX-License-Identifier: MIT
// Generated from specs/openapi.yaml. Run npm run generate.
export interface paths {
    "/api/v1/ens/primary-name": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Read a forward-verified Sepolia primary name for display */
        get: operations["getEnsPrimaryName"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/ens/cards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Find cards registered to a wallet by ENS name or address */
        get: operations["getEnsCards"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cards/{cardId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get card registration information */
        get: operations["getCard"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cards/{cardId}/registration/prepare": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Prepare an unsigned transaction */
        post: operations["prepareRegistration"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/cards/{cardId}/transactions/{txHash}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check a card registration transaction */
        get: operations["getRegistrationTransaction"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/connection": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check the configured MultiBaas and RPC connections */
        get: operations["getConnection"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        PrimaryNameResponse: {
            meta: components["schemas"]["Meta"];
            data: {
                address: string;
                name: string | null;
                /** @constant */
                ensChainId: 11155111;
            };
        };
        EnsCardItem: {
            cardId: components["schemas"]["CardId"];
            owner: components["schemas"]["Owner"];
            transactionHash: components["schemas"]["TransactionHash"];
            blockNumber: number;
        };
        EnsCardsResponse: {
            meta: components["schemas"]["Meta"];
            data: {
                name: string;
                address: components["schemas"]["Address"];
                /** @enum {integer|null} */
                ensChainId: 11155111 | null;
                registry: components["schemas"]["Registry"];
                snapshot: {
                    number: number;
                    hash: components["schemas"]["TransactionHash"];
                };
                cards: components["schemas"]["EnsCardItem"][];
                complete: boolean;
                nextCursor: string | null;
            };
        };
        EnsSearchCursor: {
            /** @constant */
            version: 1;
            name: string;
            address: components["schemas"]["Address"];
            chainId: number;
            contract: components["schemas"]["Address"];
            snapshot: number;
            snapshotHash: components["schemas"]["TransactionHash"];
            block: number;
            index: number;
        };
        Address: string;
        TransactionHash: string;
        CardId: string;
        /** @description Mock mode simulates operations; live mode reads actual records on the configured chain. Mock transactions must not be submitted. */
        Meta: {
            /** @enum {string} */
            mode: "mock" | "live";
        };
        Owner: {
            address: components["schemas"]["Address"];
            nickname: string;
        };
        Registry: {
            chainId: number;
            contractAddress: components["schemas"]["Address"];
            issuer: components["schemas"]["Address"];
        };
        EvidenceAvailable: {
            /** @enum {string} */
            status: "available";
            transactionHash: components["schemas"]["TransactionHash"];
            blockNumber: number;
        };
        EvidencePending: {
            /** @enum {string} */
            status: "pending";
        };
        EvidenceNone: {
            /** @enum {string} */
            status: "none";
        };
        UnregisteredCard: {
            cardId: components["schemas"]["CardId"];
            registry: components["schemas"]["Registry"];
            playerName: string;
            /** @enum {string} */
            status: "unregistered";
            owner: null;
            evidence: components["schemas"]["EvidenceNone"];
        };
        RegisteredCard: {
            cardId: components["schemas"]["CardId"];
            registry: components["schemas"]["Registry"];
            playerName: string;
            /** @enum {string} */
            status: "registered";
            owner: components["schemas"]["Owner"];
            evidence: components["schemas"]["EvidenceAvailable"] | components["schemas"]["EvidencePending"];
        };
        PrepareRequest: {
            walletAddress: components["schemas"]["Address"];
            chainId: number;
            /** @description Live mode accepts 1 to 96 UTF-8 bytes and rejects invalid Unicode without trimming or normalization. Mock mode accepts only the fixed sample. */
            nickname: string;
        };
        /** @description Shared transport format. Value is a decimal string in wei; this operation transfers no funds. Mock data=0x is a placeholder for an undefined ABI and must not be submitted. Nonce, gas, and fee fields are omitted. */
        UnsignedTransaction: {
            chainId: number;
            from: components["schemas"]["Address"];
            to: components["schemas"]["Address"];
            data: string;
            /** @constant */
            value: "0";
        };
        PreparedRegistration: {
            cardId: components["schemas"]["CardId"];
            nickname: string;
            transaction: components["schemas"]["UnsignedTransaction"];
        };
        PendingTransaction: {
            cardId: components["schemas"]["CardId"];
            transactionHash: components["schemas"]["TransactionHash"];
            /** @enum {string} */
            status: "pending";
        };
        ConfirmedTransaction: {
            cardId: components["schemas"]["CardId"];
            transactionHash: components["schemas"]["TransactionHash"];
            /** @enum {string} */
            status: "confirmed";
            owner: components["schemas"]["Owner"];
            blockNumber: number;
        };
        RevertedTransaction: {
            cardId: components["schemas"]["CardId"];
            transactionHash: components["schemas"]["TransactionHash"];
            /** @enum {string} */
            status: "reverted";
        };
        UnknownTransaction: {
            cardId: components["schemas"]["CardId"];
            transactionHash: components["schemas"]["TransactionHash"];
            /** @enum {string} */
            status: "unknown";
            /** @enum {string} */
            reason: "TRANSACTION_NOT_SEEN" | "RECORD_MISMATCH";
        };
        CardResponse: {
            meta: components["schemas"]["Meta"];
            data: components["schemas"]["UnregisteredCard"] | components["schemas"]["RegisteredCard"];
        };
        PrepareResponse: {
            meta: components["schemas"]["Meta"];
            data: components["schemas"]["PreparedRegistration"];
        };
        TransactionResponse: {
            meta: components["schemas"]["Meta"];
            data: components["schemas"]["PendingTransaction"] | components["schemas"]["ConfirmedTransaction"] | components["schemas"]["RevertedTransaction"] | components["schemas"]["UnknownTransaction"];
        };
        ErrorResponse: {
            meta: components["schemas"]["Meta"];
            error: {
                /** @enum {string} */
                code: "INVALID_INPUT" | "INVALID_MOCK_SCENARIO" | "CARD_NOT_FOUND" | "ALREADY_REGISTERED" | "INSUFFICIENT_FUNDS" | "WALLET_NOT_ALLOWED" | "CHAIN_MISMATCH" | "MOCK_SAMPLE_UNSUPPORTED" | "UPSTREAM_UNAVAILABLE" | "INTERNAL_ERROR" | "ENS_INVALID_NAME" | "ENS_NOT_CONFIGURED" | "ENS_NOT_FOUND" | "ENS_UNAVAILABLE" | "ENS_ADDRESS_CHANGED" | "SEARCH_RESTART_REQUIRED" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE" | "ORIGIN_NOT_ALLOWED" | "CONNECTION_MISMATCH" | "MULTIBAAS_AUTH_FAILED" | "UPSTREAM_TIMEOUT";
                message: string;
            } | {
                /** @constant */
                code: "CONFIGURATION_MISSING";
                message: string;
                details: {
                    missingSettings: string[];
                };
            };
        };
        ConnectionResponse: {
            meta: components["schemas"]["Meta"];
            data: {
                /** @constant */
                status: "mock";
                registry: components["schemas"]["Registry"];
            } | {
                /** @constant */
                status: "ready";
                network: {
                    /** @constant */
                    name: "Curvegrid Testnet";
                    chainId: number;
                    nativeCurrency: {
                        /** @constant */
                        name: "Ether";
                        /** @constant */
                        symbol: "ETH";
                        /** @constant */
                        decimals: 18;
                    };
                    rpcUrls: string[];
                };
                registry: components["schemas"]["Registry"];
                latestBlock: {
                    number: number;
                    hash: components["schemas"]["TransactionHash"];
                };
                /** @constant */
                nicknameMaxUtf8Bytes: 96;
            };
        };
    };
    responses: never;
    parameters: {
        /** @example SK-2026-001 */
        CardId: components["schemas"]["CardId"];
        /** @example 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa */
        TransactionHash: components["schemas"]["TransactionHash"];
        /** @description Mock only. Defaults to default when omitted. Allowed values per operation are defined in x-mock-scenarios. Unsupported combinations return 400. Live mode rejects this header with 400. */
        MockScenario: "default" | "registered" | "unregistered" | "not-found" | "pending" | "reverted" | "unknown" | "evidence-pending" | "unavailable" | "mismatch";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getEnsPrimaryName: {
        parameters: {
            query: {
                address: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Verified primary name or null; display address when null. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrimaryNameResponse"];
                };
            };
            /** @description Invalid request or origin. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Invalid request or origin. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Invalid request or origin. */
            500: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getEnsCards: {
        parameters: {
            query: {
                name: string;
                cursor?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Paginated verified registrations. complete=false requires continued search. */
            200: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EnsCardsResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            400: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            403: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            404: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            409: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            500: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description Search error; never interpret as no registrations. */
            503: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getCard: {
        parameters: {
            query?: never;
            header?: {
                /** @description Mock only. Defaults to default when omitted. Allowed values per operation are defined in x-mock-scenarios. Unsupported combinations return 400. Live mode rejects this header with 400. */
                "X-Mock-Scenario"?: components["parameters"]["MockScenario"];
            };
            path: {
                /** @example SK-2026-001 */
                cardId: components["parameters"]["CardId"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieval or preparation succeeded. Only a confirmed transaction-query result establishes registration confirmation. */
            200: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CardResponse"];
                };
            };
            /** @description INVALID_INPUT, INVALID_MOCK_SCENARIO */
            400: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            403: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description CARD_NOT_FOUND */
            404: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description INTERNAL_ERROR */
            500: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UPSTREAM_UNAVAILABLE */
            503: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    prepareRegistration: {
        parameters: {
            query?: never;
            header?: {
                /** @description Mock only. Defaults to default when omitted. Allowed values per operation are defined in x-mock-scenarios. Unsupported combinations return 400. Live mode rejects this header with 400. */
                "X-Mock-Scenario"?: components["parameters"]["MockScenario"];
            };
            path: {
                /** @example SK-2026-001 */
                cardId: components["parameters"]["CardId"];
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                /**
                 * @example {
                 *       "walletAddress": "0x7a31000000000000000000000000000000008f42",
                 *       "chainId": 80002,
                 *       "nickname": "おじいちゃんコンビニ"
                 *     }
                 */
                "application/json": components["schemas"]["PrepareRequest"];
            };
        };
        responses: {
            /** @description Retrieval or preparation succeeded. Only a confirmed transaction-query result establishes registration confirmation. */
            200: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PrepareResponse"];
                };
            };
            /** @description INVALID_INPUT, INVALID_MOCK_SCENARIO */
            400: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            403: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description CARD_NOT_FOUND */
            404: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description ALREADY_REGISTERED */
            409: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description PAYLOAD_TOO_LARGE */
            413: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UNSUPPORTED_MEDIA_TYPE */
            415: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description CHAIN_MISMATCH, WALLET_NOT_ALLOWED, MOCK_SAMPLE_UNSUPPORTED, INSUFFICIENT_FUNDS */
            422: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description INTERNAL_ERROR */
            500: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UPSTREAM_UNAVAILABLE */
            503: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getRegistrationTransaction: {
        parameters: {
            query?: never;
            header?: {
                /** @description Mock only. Defaults to default when omitted. Allowed values per operation are defined in x-mock-scenarios. Unsupported combinations return 400. Live mode rejects this header with 400. */
                "X-Mock-Scenario"?: components["parameters"]["MockScenario"];
            };
            path: {
                /** @example SK-2026-001 */
                cardId: components["parameters"]["CardId"];
                /** @example 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa */
                txHash: components["parameters"]["TransactionHash"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Retrieval or preparation succeeded. Only a confirmed transaction-query result establishes registration confirmation. */
            200: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TransactionResponse"];
                };
            };
            /** @description INVALID_INPUT, INVALID_MOCK_SCENARIO */
            400: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            403: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description CARD_NOT_FOUND */
            404: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description INTERNAL_ERROR */
            500: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description UPSTREAM_UNAVAILABLE */
            503: {
                headers: {
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
    getConnection: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description API response */
            200: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConnectionResponse"];
                };
            };
            /** @description API response */
            400: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            403: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            500: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
            /** @description API response */
            503: {
                headers: {
                    /** @description Responses must not be stored. */
                    "Cache-Control"?: string;
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ErrorResponse"];
                };
            };
        };
    };
}
