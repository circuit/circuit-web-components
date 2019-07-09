# Circuit Web Components

[![NPM Version](https://img.shields.io/npm/v/@unify/circuit-web-components.svg?style=flat)](https://www.npmjs.com/package/@unify/circuit-web-components)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Enhance your website with Circuit features such as making video calls without any code. Just include the desired web component module and the Circuit JS SDK and use the element.

Based on the latest Web Components standard. No dependency on any Web Components framework.

```html
<html>
  <head>
    <script type="module" src="//unpkg.com/@unify/circuit-web-components/circuit-call-button.js" defer></script>
    <script src="//unpkg.com/circuit-sdk" async></script>
    <style>
      circuit-call-button[inprogress] { background: firebrick; }
    </style>
  </head>
  <body>
    <circuit-call-button
      clientId="f06c51a30f0d4eb6acc05829c3e86266"
      target="helpdesk@company.com">Call Helpdesk</circuit-call-button>
  </body>
</html>
```

## Components

### [circuit-call-button](docs/circuit-call-button.md)
Renders a button to start a Circuit call, either as guest (via pool of authenticated users), or a regular user via OAuth authentication. For video calls the [circuit-call-stage](circuit-call-stage.md) component can be used to display the local and remote video streams. `call` object is exposed in the event `callchange`.


### [circuit-call-stage](docs/circuit-call-stage.md)
Renders local and remote video streams of a call. `convId` is passed as property to the web component to determine which conversation is rendered.


### [circuit-conversations-list](docs/circuit-conversations-list.md)
Renders a list of the most recent circuit conversations. 


### [circuit-chat](docs/circuit-chat.md)
Renders a circuit conversation feed and allows the user to participate in the chat. `call` is passed as property to the web component. `overlay` attribute can be used to define the position on the local video, or to hide it.


### [circuit-conversations-list](docs/circuit-conversations-list.md)
Renders a list of the most recent circuit conversations. `convId` is passed as property to the web component to determine which conversation is rendered.


### [circuit-chat](docs/circuit-chat.md)
Renders a circuit conversation feed and allows the user to participate in the chat.

## Usage and Documentation
See [docs/README.md](docs/README.md)

## Live examples
* [Audio call](https://raw.githack.com/circuit/circuit-web-components/master/examples/audioCall.html) (circuit-call-button)
* [Circuit Chat](https://raw.githack.com/circuit/circuit-web-components/master/examples/chat.html) (circuit-conversations-list and circuit-chat)
* [Video call](https://raw.githack.com/circuit/circuit-web-components/master/examples/videoCall.html) (circuit-call-button and circuit-call-stage)
* [Guest video call](https://raw.githack.com/circuit/circuit-web-components/master/examples/guestCall.html) (circuit-call-button and circuit-call-stage)
* [Vue.js app](https://raw.githack.com/circuit/circuit-web-components/master/examples/vue.html) (circuit-call-button)
* [Circuit Chat](https://raw.githack.com/circuit/circuit-web-components/master/examples/chat.html) (circuit-conversations-list and circuit-chat)




## Run examples locally
```bash
git clone https://github.com/circuit/circuit-web-components.git
cd circuit-web-components
npm i -g local-web-server
ws -p 8443 --https -o
```
