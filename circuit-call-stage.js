const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
}

#container {
  height: inherit;
  width: inherit;
  position: relative;
  background: black;
}

#remoteVideo {
  height: inherit;
  width: inherit;
}

#localVideo {
  position: absolute;
  bottom: 5px;
  right: 5px;
}

</style>

<div id="container">
  <video id="remoteVideo" autoplay></video>
  <video id="localVideo" autoplay></video>
</div>
`;

export class CircuitCallStage extends HTMLElement {
  // Attributes we care about getting values from.
  static get observedAttributes() {
    return ['mode', 'overlay'];
  }

  get call() {
    return this._call;
  }

  set call(call) {
    this._call = call;
    this._render();
  }

  set _streaming(streaming) {
    if (streaming) {
      this.setAttribute('streaming', '');
    } else {
      this.removeAttribute('streaming');
    }
  }

  constructor() {
    super();
    this._call = null;

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(template.content.cloneNode(true));

    this._remoteVideoEl = this.root.querySelector('#remoteVideo');
    this._localVideoEl = this.root.querySelector('#localVideo');
    this._containerEl = this.root.querySelector('#container');
  }

  _render() {
    try {
      if (!this._call || !this._call.remoteVideoStreams.length) {
        this._remoteVideoEl.srcObject = null;
      } else {
        this._remoteVideoEl.srcObject = this._call.remoteVideoStreams[0].stream;
      }

      if (!this._call) {
        this._localVideoEl.srcObject = null;
      } else {
        this._localVideoEl.srcObject = this._call.localStreams.video || this._call.localStreams.desktop;
      }

      // Reflect 'streaming' attribute
      this._streaming = !!this._remoteVideoEl.srcObject || !!this._localVideoEl.srcObject;

      this._localVideoEl.style.width = Math.floor(this._containerEl.offsetWidth / 4) + 'px';
      this._localVideoEl.style.height = Math.floor(this._containerEl.offsetHeight / 4) + 'px';
    } catch (err) {
      console.error('Error rendering video streams', err);
      throw new Error('Error rendering video streams');
    }
  }

    // Lifecycle hooks
    attributeChangedCallback(attrName, oldValue, newValue) {
      switch (attrName) {
        case 'mode':
        this._mode = newValue;
        this._render();
        break;
        case 'overlay-position':
        break;
      }
    }

    connectedCallback() {

    }
}

customElements.define('circuit-call-stage', CircuitCallStage);