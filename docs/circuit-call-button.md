# circuit-call-button

## Usage

```html
// Video call. Shows OAuth popup if not authenticated. Defines custom calling & hangup texts, and ringback sound.
<circuit-call-button
  video
  domain="circuitsandbox.net"
  clientId="<client_id>"
  target="circuitsdk01@gmail.com"
  callingText="Calling Helpdesk..."
  ringbackTone="https://upload.wikimedia.org/wikipedia/commons/e/ea/UK_ringback_tone.ogg"
  hangupText="End call">Call Helpdesk</circuit-call-button>
```

```html
// Audio call. Only required attributes defined. Defaults to an audio call on circuitsandbox.net system with default calling text, hangup text and ringback tone.
<circuit-call-button
  clientId="<client_id>"
  target="support@mycompany.com">Call Support</circuit-call-button>
```

```html
// Video conference on EU production system. Start conference, or join if conference has already started.
<circuit-call-button
  video
  clientId="<client_id>"
  domain="eu.yourcircuit.com"
  target="<conv_id>"
  callingText="Starting..."
  joinText="Join conference">Start conference</circuit-call-button>
```

```html
// Guest video conference. No user authentication required since a guest token is provided.
<circuit-call-button
  video
  clientId="<client_id>"
  guestToken="<guest token>"
  firstName="John"
  lastName="Doe">Join All-hands call</circuit-call-button>
```

## API

### Attributes

| Name        | Required | Default            | Description
| ---         | ---      | ---                | ---
| clientId    | yes      |                    | client_id of your app <sup>[1](#myfootnote1)</sup>
| target      | *yes      |                   | Email of Circuit user to call, or conversation ID for conferences. Not required for guest calls.
| guestToken  | *yes      |                   | Token part of Guest url. Only required for guest calls.
| firstName   | *yes      |                   | Firstname of guest user. Only required for guest calls.
| lastName    | *yes      |                   | Lasttname of guest user. Only required for guest calls.
| domain      | no       | circuitsandbox.<span></span>net | Url of Circuit system
| poolUrl     | no       |                    | Url of endpoint returning tokens of a pool of users. If not defined user will be asked to login via OAuth. If defined, the endpoint must return a json object with a token attribute. <sup>[2](#myfootnote2)</sup>
| video       | no       | omitted (false)    | Boolean attribute. If present, local video is streamed.
| callingText | no       | "Calling..."       | Text shown on button during the alerting phase
| joinText | no       | "Join"       | Text shown on button when a conference has started that is not joined yet. This is only applicable if user has already logged in.
| hangupText  | no       | "Hangup"           | Text shown on button while in "Delievered" state or established call
| ringbackTone| no       | US ringback tone   | Ringback tone played to user when call is delivered, prior to called party answering
| inprogress  | no       | omitted (false)    | Attribute set by the web component to allow easy CSS attribute styling
| connected   | no       | omitted (false)    | Attribute set by the web component to indicate if component if connected to the Circuit servers. Can be used to change the button style via CSS if connection is lost.


<a name="myfootnote1">1</a>: See [dev portal](https://circuit.github.io) for instructions on how to get your own sandbox tenant and how to register an app to get the credentials (client_id).

<a name="myfootnote2">2</a>: This attribute is in alpha and will likely be replaced with a permanent guest solution in the near future. An example app hosting the endpoint can be found [here](https://github.com/circuit/guest-pool).


### Properties

| Name        |  Type            |  Read/Write      | Description
| ---         |  ---             |  ---             | ---
| call        | [Call](https://circuitsandbox.net/sdk/classes/Call.html) | read | Call object as defined in the Circuit JS SDK.
| client        | [Client](https://circuitsandbox.net/sdk/classes/Client.html) | read | Circuit Client object as defined in the Circuit JS SDK.


### Events

| Name        |  Arguments          | Description
| ---         |  ---                | ---
| callchange  |  [Call](https://circuitsandbox.net/sdk/classes/Call.html)                   | Raised on any call related change such as a call state change, remote steam added/removed. `call` argument is `null` when call ended.
| initialized  |  [Client](https://circuitsandbox.net/sdk/classes/Client.html)                   | Raised when Circuit.Client is initialized.
| waitingchange  |                     | Raised when call started while waiting in guest waiting room

### Styling (CSS)

Styling can be done as with any regular element. The attribute `inprogress` is added while the call is in progress (i.e. in DELIVERED or ACTIVE state). To prevent flash rendering prior to the element being rendered completely, use the pseudo attribute `defined`.

Here are some example CSS rules:
```css
/* Hide button until defined to prevent flash rendering */
circuit-call-button:not(:defined) {
  opacity: 0;
}

/* Overwrite Circuit default colors for button */
circuit-call-button {
  color: snow;
  background: steelblue;
  font-size: 14px;
}

/* Use 'inprogress' attribute to style button when call can be cancelled. This is in delieverd and active states */
circuit-call-button[inprogress] {
  color: snow;
  background: firebrick;
}
```
