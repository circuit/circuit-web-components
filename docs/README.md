# Circuit Web Components Documentation

Circuit Web Components allow for
Circuit Web Components have no dependency on any JavaScript framework, they are pure JavaScript [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) according to the latest standard.

The components use the [Circuit JS SDK](https://github.com/circuit/circuit-sdk). To get your own Circuit sandbox and register an application, see step 1 at https://circuit.github.io/


## API Documentation

* [circuit-call-button](circuit-call-button.md)
* [circuit-call-stage](circuit-call-stage.md)


## Usage

Since the circuit-sdk requires the latest evergreen browsers, there should be no issue with browser support of Web Components. But if for some reason your browser does not support Web Components, the [official polyfill](https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-bundle.js) can be included in the HTML page.

Web Components are included as ES6 modules which is [supported by most browsers](https://caniuse.com/#feat=es6-module). The simplest way is to include the components using `type="module"` in your html.

To prevent loading the circuit-sdk for each component, include it on the main html page. Loading the [circuit-sdk](https://github.com/circuit/circuit-sdk) using `async` improves page load, but the user will not be able to inteact with the elements until the SDK is loaded.

Example:
```html
<html>
  <head>
    <!-- Load polyfill for browsers not supporting Custom Elements -->
    <script src="//unpkg.com/@webcomponents/webcomponentsjs/webcomponents-bundle.js" defer></script>
    <script type="module" src="//unpkg.com/@unify/circuit-web-components/circuit-call-button.js" defer></script>
    <script src="//unpkg.com/circuit-sdk" async></script>
    <style>
      /* Hide button until defined to prevent flash rendering */
      circuit-call-button:not(:defined) {
        opacity: 0;
      }
      circuit-call-button[inprogress] {
        background: firebrick;
      }
    </style>
  </head>
  <body>
    <circuit-call-button
      clientId="f76ea1b2789946c9b88b008c682c132a"
      target="helpdesk@company.com">Call Helpdesk</circuit-call-button>
  </body>
</html>
```