// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.30;

contract OwnershipRegistry {
    struct Card { bool exists; address allowedWallet; address owner; string nickname; }
    mapping(bytes32 => Card) private cards;
    address public immutable issuer;
    error UnauthorizedIssuer();
    error InvalidCardId();
    error InvalidWallet();
    error CardAlreadyIssued();
    error CardNotFound();
    error AlreadyRegistered();
    error WalletNotAllowed();
    error InvalidNicknameLength();
    event CardIssued(bytes32 indexed cardKey, string cardId, address indexed allowedWallet);
    event CardRegistered(bytes32 indexed cardKey, string cardId, address indexed owner, string nickname);

    constructor(address issuer_) {
        if (issuer_ == address(0)) revert InvalidWallet();
        issuer = issuer_;
    }
    function schemaVersion() external pure returns (uint256) { return 1; }
    function issue(string calldata cardId, address allowedWallet) external {
        if (msg.sender != issuer) revert UnauthorizedIssuer();
        bytes calldata id = bytes(cardId);
        if (id.length == 0 || id.length > 64) revert InvalidCardId();
        for (uint256 i; i < id.length; ++i) {
            bytes1 c = id[i];
            if (!((c >= 0x30 && c <= 0x39) || (c >= 0x41 && c <= 0x5a) ||
                (c >= 0x61 && c <= 0x7a) || c == 0x5f || c == 0x2d)) revert InvalidCardId();
        }
        bytes32 key = keccak256(id);
        if (cards[key].exists) revert CardAlreadyIssued();
        cards[key] = Card(true, allowedWallet, address(0), "");
        emit CardIssued(key, cardId, allowedWallet);
    }
    function register(string calldata cardId, string calldata nickname) external {
        bytes32 key = keccak256(bytes(cardId));
        Card storage card = cards[key];
        if (!card.exists) revert CardNotFound();
        if (card.owner != address(0)) revert AlreadyRegistered();
        if (card.allowedWallet != address(0) && msg.sender != card.allowedWallet) revert WalletNotAllowed();
        if (bytes(nickname).length == 0 || bytes(nickname).length > 96) revert InvalidNicknameLength();
        card.owner = msg.sender;
        card.nickname = nickname;
        emit CardRegistered(key, cardId, msg.sender, nickname);
    }
    function getCard(string calldata cardId) external view returns (
        bool exists, address allowedWallet, bool registered, address owner, string memory nickname
    ) {
        Card storage card = cards[keccak256(bytes(cardId))];
        return (card.exists, card.allowedWallet, card.owner != address(0), card.owner, card.nickname);
    }
}
