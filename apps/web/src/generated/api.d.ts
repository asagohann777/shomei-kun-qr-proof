// Generated from specs/openapi.yaml. Run npm run generate.
export interface paths {
    "/api/v1/cards/{cardId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** カードの登録情報を取得する */
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
        /** 未署名取引を準備する */
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
        /** 対象カードの登録取引を確認する */
        get: operations["getRegistrationTransaction"];
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
        Address: string;
        TransactionHash: string;
        CardId: string;
        /** @description 今回はmockのみ返す。liveは将来の実接続用。mockの場合、実ウォレットへの引渡しと外部取引リンクを禁止する。 */
        Meta: {
            /** @enum {string} */
            mode: "mock" | "live";
        };
        Owner: {
            address: components["schemas"]["Address"];
            nickname: string;
        };
        Registry: {
            /** @constant */
            chainId: 80002;
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
            nickname: string;
        };
        /** @description 共通転送形式。valueはweiの10進文字列。この操作は送金しない。モックのdata=0xはABI未確定のプレースホルダーで、実送信不可。nonce・gas・手数料は含めない。 */
        UnsignedTransaction: {
            /** @constant */
            chainId: 80002;
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
                code: "INVALID_INPUT" | "INVALID_MOCK_SCENARIO" | "CARD_NOT_FOUND" | "ALREADY_REGISTERED" | "WALLET_NOT_ALLOWED" | "CHAIN_MISMATCH" | "MOCK_SAMPLE_UNSUPPORTED" | "UPSTREAM_UNAVAILABLE" | "INTERNAL_ERROR" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE";
                message: string;
            };
        };
    };
    responses: never;
    parameters: {
        /** @example SK-2026-001 */
        CardId: components["schemas"]["CardId"];
        /** @example 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa */
        TransactionHash: components["schemas"]["TransactionHash"];
        /** @description モック専用。省略時はdefault。操作別の許可値はx-mock-scenariosに定義。非対応の組合せは400。liveモードでは指定自体を400にする。 */
        MockScenario: "default" | "registered" | "unregistered" | "not-found" | "pending" | "reverted" | "unknown" | "evidence-pending" | "unavailable" | "mismatch";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getCard: {
        parameters: {
            query?: never;
            header?: {
                /** @description モック専用。省略時はdefault。操作別の許可値はx-mock-scenariosに定義。非対応の組合せは400。liveモードでは指定自体を400にする。 */
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
            /** @description 取得または準備に成功。登録確定を意味するのは取引照会のconfirmedのみ。 */
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
                /** @description モック専用。省略時はdefault。操作別の許可値はx-mock-scenariosに定義。非対応の組合せは400。liveモードでは指定自体を400にする。 */
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
            /** @description 取得または準備に成功。登録確定を意味するのは取引照会のconfirmedのみ。 */
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
            /** @description CHAIN_MISMATCH, WALLET_NOT_ALLOWED, MOCK_SAMPLE_UNSUPPORTED */
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
                /** @description モック専用。省略時はdefault。操作別の許可値はx-mock-scenariosに定義。非対応の組合せは400。liveモードでは指定自体を400にする。 */
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
            /** @description 取得または準備に成功。登録確定を意味するのは取引照会のconfirmedのみ。 */
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
}
