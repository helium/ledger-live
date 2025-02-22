<img src="https://user-images.githubusercontent.com/4631227/191834116-59cf590e-25cc-4956-ae5c-812ea464f324.png" height="100" />

[GitHub](https://github.com/LedgerHQ/ledger-live/),
[Ledger Devs Discord](https://developers.ledger.com/discord-pro),
[Developer Portal](https://developers.ledger.com/)

## @ledgerhq/hw-transport-u2f

Allows to communicate with Ledger Hardware Wallets.

**\[React Native]** **(HID)** *Android* – Ledger's native implementation.

***

## Are you adding Ledger support to your software wallet?

You may be using this package to open a USB connection between your mobile application and the device.

For a smooth and quick integration:

*   See the developers’ documentation on the [Developer Portal](https://developers.ledger.com/docs/transport/overview/) and
*   Go on [Discord](https://developers.ledger.com/discord-pro/) to chat with developer support and the developer community.

***

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [HIDTransport](#hidtransport)
    *   [Parameters](#parameters)
    *   [Examples](#examples)
    *   [exchange](#exchange)
        *   [Parameters](#parameters-1)
    *   [close](#close)
    *   [isSupported](#issupported)
    *   [list](#list)
    *   [listen](#listen)
        *   [Parameters](#parameters-2)
    *   [open](#open)
        *   [Parameters](#parameters-3)

### HIDTransport

**Extends Transport**

Ledger's React Native HID Transport implementation

#### Parameters

*   `nativeId` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
*   `productId` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

#### Examples

```javascript
import TransportHID from "@ledgerhq/react-native-hid";
...
TransportHID.create().then(transport => ...)
```

#### exchange

##### Parameters

*   `apdu` **any** input value

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<any>** Promise of apdu response

#### close

Close the transport

Returns **any** Promise

#### isSupported

Check if the transport is supported (basically true on Android)

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)>** 

#### list

List currently connected devices.

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)<[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)\<any>>** Promise of devices

#### listen

Listen to ledger devices events

##### Parameters

*   `observer` **any** 

Returns **any** 

#### open

Open a the transport with a Ledger device

##### Parameters

*   `deviceObj` **DeviceObj** 
