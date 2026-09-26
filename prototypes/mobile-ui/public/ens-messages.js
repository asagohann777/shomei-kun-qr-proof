// SPDX-License-Identifier: MIT
export const ensMessages = {
  ja: {
    ensIntro: '名前やアドレスから、登録カードを確認。', ensSample: 'サンプルの検索結果を表示します', ensViewRecord: '登録記録を見る', ensAbout: 'ENS検索について', ensMockHelp: 'サンプルの操作方法',
    ensMockNote: '画面確認用のサンプルです。shomeikun.ethで一覧、empty.ethで0件、error.ethで接続エラーを確認できます。実際のENS・登録記録には接続しません。',
    ensOpen: 'ENS名・アドレスで探す', ensTitle: 'ウォレットに登録されているカード',
    ensName: 'ENS名またはウォレットアドレス', ensSearch: '検索', ensSearching: '検索しています…', ensMore: '続きを検索',
    ensEmpty: 'このウォレットに登録されているカードはありません。',
    ensPartial: 'まだ検索していない範囲があります。続きを検索できます。',
    ensNote: 'SepoliaのENS名を解決し、Curvegrid Testnetの登録記録を検索します。ENSの参照先が変わっても、既存カードの登録先は変わりません。',
    ENS_INVALID_NAME: 'ENS名または0xで始まるアドレスを入力してください。', INVALID_INPUT: 'ウォレットアドレスを確認してください。', ENS_NOT_CONFIGURED: 'ENS検索はまだ設定されていません。QRスキャンは利用できます。',
    ENS_NOT_FOUND: 'このENS名にウォレットアドレスが設定されていません。', ENS_UNAVAILABLE: 'ENSに接続できません。時間をおいて検索してください。',
    ENS_ADDRESS_CHANGED: 'ENSの参照先が変わりました。もう一度検索してください。', SEARCH_RESTART_REQUIRED: '登録記録が更新されました。もう一度検索してください。',
    ensFailed: '検索を完了できませんでした。もう一度お試しください。',
  },
  en: {
    ensIntro: 'Find registered cards by ENS name or wallet address.', ensSample: 'This preview uses sample results', ensViewRecord: 'View registration', ensAbout: 'About ENS search', ensMockHelp: 'Try other sample states',
    ensMockNote: 'UI sample only. Use shomeikun.eth for cards, empty.eth for no results, or error.eth for a connection error. No live ENS or registration lookup is performed.',
    ensOpen: 'Find by ENS or address', ensTitle: 'Cards registered to this wallet',
    ensName: 'ENS name or wallet address', ensSearch: 'Search', ensSearching: 'Searching…', ensMore: 'Search further',
    ensEmpty: 'No cards are registered to this wallet.', ensPartial: 'Some blocks remain unsearched. Continue to check them.',
    ensNote: 'Resolves a Sepolia ENS name and searches registration records on Curvegrid Testnet. Changing the ENS address does not change existing card registrations.',
    ENS_INVALID_NAME: 'Enter an ENS name or a wallet address starting with 0x.', INVALID_INPUT: 'Check the wallet address.', ENS_NOT_CONFIGURED: 'ENS search is not configured yet. QR scanning is available.',
    ENS_NOT_FOUND: 'This ENS name has no wallet address set.', ENS_UNAVAILABLE: 'Cannot reach ENS. Try again later.',
    ENS_ADDRESS_CHANGED: 'The ENS address changed. Start a new search.', SEARCH_RESTART_REQUIRED: 'The registration records changed. Start a new search.',
    ensFailed: 'Could not complete the search. Please try again.',
  },
};
