# Circuit Web Components

## Components

### [circuit-call-button](docs/circuit-call-button.md)
Renders a button to start a Circuit call, either as guest (via pool of authenticated users), or a regular user via OAuth authentication. For video calls the [circuit-call-stage](circuit-call-stage.md) component can be used to display the local and remote video streams. `call` object is exposed in the event `callchange`.


### [circuit-call-stage](docs/circuit-call-stage.md)
Renders local and remote video streams of a call. `overlay` attribute can be used to define the position on the local video, or to hide it.

## Usage and Documentation
See [docs/README.md](docs/README.md)

## Live examples
* [Audio call](https://cdn.staticaly.com/gh/circuit/circuit-web-components/master/examples/audioCall.html) (circuit-call-button)
* [Video call](https://cdn.staticaly.com/gh/circuit/circuit-web-components/master/examples/videoCall.html) (circuit-call-button and circuit-call-stage)
* [Guest video call](https://cdn.staticaly.com/gh/circuit/circuit-web-components/master/examples/guestCall.html) (circuit-call-button and circuit-call-stage)
* [Vue.js app](https://cdn.staticaly.com/gh/circuit/circuit-web-components/master/examples/vue.html) (circuit-call-button)




## Run examples locally
```bash
git clone https://github.com/circuit/circuit-web-components.git
cd circuit-web-components
npm i -g local-web-server
ws -p 8443 --https -o
```
