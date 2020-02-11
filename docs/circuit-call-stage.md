# circuit-call-stage

Defines the location in the HTML where the call stage (i.e. local and remove video streams) will be shown. `call` property is passed in JavaScript, or via property binding if using a JS framework like vue or angular.

`overlay` attribute can be used to define the position on the local video, or to hide the local video. Note that setting `overlay` to `hide` will not stop streaming the local video. To stop streaming the local video, remove the `video` attribute from the `circuit-call-button` element.

## Usage

```html
<style>
  circuit-call-stage:not([streaming]) { display: none; }
</style>
<body>
  <circuit-call-button video clientId="..." target="..."></circuit-call-button>
  <circuit-call-stage overlay="top-left"></circuit-call-stage>
</body>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Pass updated call object to call stage web component using Vanilla JS
    const btnEl = document.querySelector('circuit-call-button');
    const stageEl = document.querySelector('circuit-call-stage');
    btnEl.addEventListener('callchange', e => stageEl.call = e.detail);
  });
</script>
```


## API

### Attributes

| Name        | Required | Default            | Description
| ---         | ---      | ---                | ---
| overlay     | no       | bottom-right       | Position of local video overlay. Values are: `bottom-right`, `top-right`, `top-left`, `bottom-left`, `hide`, `full`
| streaming   | no       | omitted (false)    | Attribute set by the web component to indicate if video is being streamed by the local user or the remove user. Can be used to hide the call stage via CSS when no video is being streamed.


### Properties

| Name        |  Type            |  Read/Write      | Description
| ---         |  ---             |  ---             | ---
| call        | [Call](https://circuitsandbox.net/sdk/classes/Call.html) | write | Call object as defined in the Circuit JS SDK and raise in `callchange` by `circuit-call-button`.
| localVideo        | video DOM element | read | DOM video element used in call state for local video
| remoteVideo        | video DOM element | read | DOM video element used in call state for remote video


### Events

n/a

### Styling (CSS)

Styling can be done as with any regular element. The attribute `streaming` is added while video is streamed by either party. This can be used to hide the call stage if no video is being streamed.

Here are some example CSS rules:
```css
/* Hide button until defined to prevent flash rendering */
circuit-call-stage:not([streaming]) {
  display: none;
}
circuit-call-stage {
  width: 400px;
  height: 300px;
  display: block;
}
```
