English | [日本語](DEMO.ja.md)

# Demo instructions

## URLs

| Purpose | URL |
| --- | --- |
| Real registration and camera scanning | https://shomei-kun-integration.dptr.workers.dev/ui/ |
| UI review mock | https://shomei-kun-ui-mock.dptr.workers.dev/ |

## Cards for filming

Previous gallery of five QR cards: https://shomei-video-cards.dptr.workers.dev/g/gvPyRGJ6r3Q80h8WQ070Irl11lg0UXC0/

Open a card from the gallery, scan its QR code, and view its registration information. Check each card's state in the app. View registered cards or continue to registration for unregistered cards.

The unrestricted card successfully registered in this session: https://shomei-kun-integration.dptr.workers.dev/ui/?cardId=demo-open-20260926-02

This card is already registered and can be used to film viewing. It is separate from the previous five and is not in the gallery above. Use another unregistered card to film registration again.

## Try ENS/address search

1. On the live app, select **Find by ENS or address**, shown as **ENS名・アドレスで探す** in Japanese.
2. Search `shomeikun.eth`. Check the registered cards' images, IDs, and nicknames.
3. Select **View registration** to open card details. Viewing requires neither MetaMask connection nor gas.
4. Enter `0xc22D961e56b70a73f6dCB1EC0a47b7Da1Fe38FDd` and check that the same list appears.

Connecting this wallet on the registration screen shows `shomeikun.eth` above the address after matching Sepolia reverse and forward resolution. An unset name leaves the address alone. Registration still uses Curvegrid Testnet. ENS lookup does not require switching the wallet to Sepolia.

## Try real registration

Prepare MetaMask and fund the registration wallet with Curvegrid Testnet test ETH. Use an issued, unregistered card. Existing card QR codes or URLs can be used.

1. Open the real registration URL, select **Scan QR code**, and allow the camera. You can also read a photo or open the card URL directly.
2. Check the card ID and unregistered state.
3. On iPhone/iPad, select **Open in MetaMask**. Continue to registration when the same card opens inside MetaMask.
4. Enter `おじいちゃんコンビニ` as the nickname.
5. Select **Prepare with MetaMask** and approve the connection and any necessary network addition/switch. The target is Curvegrid Testnet, chain ID `2017072401`.
6. Review the public information and registration details, then approve the transaction in MetaMask.
7. Wait for record verification and check the displayed owner and nickname.
8. Open the same QR on another device. The same registration information is readable without connecting a wallet.

Registration is one-time. A registered card cannot be registered again. Use an unregistered card for another attempt.

## If the flow stops

| State | Action |
| --- | --- |
| Camera unavailable | Choose the QR image through **From photo** |
| MetaMask opens without the page | Copy the URL from the page-opening help and paste it into MetaMask's browser address bar |
| Wrong network | Follow connection preparation and approve the addition/switch |
| Insufficient balance | Fund the registration wallet with test ETH |
| Approval rejected | Review the input and try again |
| Unknown result after submission | Recheck the saved transaction. Do not submit another transaction on top of it |
| Evidence not yet indexed | Select **Refresh**. Owner information remains visible during the update |

If errors persist, copy the on-screen diagnostics. Do not send private keys or seed phrases.

## Try the UI mock

The mock URL does not make real registrations. Use the menu to switch language and scenarios such as unregistered, registered, processing, or failure. Try input, review, and completion with a sample wallet. It calls neither the real API nor MetaMask.

## Issuance and verification

Follow the [CLI instructions](../contracts/README.md) to issue cards and the [runbook](CURVEGRID_INTEGRATION_RUNBOOK.md) to configure the environment. Issue new cards without restrictions and never reuse an ID. Do not use the current CLI's `--recipient-ens` or `--wallet` options. ENS registration/configuration is unnecessary.

Use the public screen's chain, contract, card ID, and transaction hash to verify card state and the registration receipt through RPC. No MultiBaas admin key or issuer key is needed.

This demo establishes the association between a card ID and its registered wallet. It does not establish physical possession or authenticity.
