const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: inline-block;
}

#container {
  display: inline-flex;
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
    return ['overlay'];
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
    this._overlay = 'bottom-right';

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

      // Position and size local video
      this._localVideoEl.style.width = Math.floor(this._containerEl.offsetWidth / 4) + 'px';
      if (this._overlay === 'hide') {
        this._localVideoEl.srcObject = null;
      } else {
        this._localVideoEl.style.top = this._overlay.startsWith('top-') ? '5px' : 'unset';
        this._localVideoEl.style.bottom = this._overlay.startsWith('bottom-') ? '5px' : 'unset';
        this._localVideoEl.style.left = this._overlay.endsWith('-left') ? '5px' : 'unset';
        this._localVideoEl.style.right = this._overlay.endsWith('-right') ? '5px' : 'unset';
      }

    } catch (err) {
      console.error('Error rendering video streams', err);
      throw new Error('Error rendering video streams');
    }
  }

    // Lifecycle hooks
    attributeChangedCallback(attrName, oldValue, newValue) {
      switch (attrName) {
        case 'overlay':
        /* Values: bottom-right (default), top-right, bottom-left, top-left, hide */
        this._overlay = newValue || 'bottom-right';
        this._render();
        break;
      }
    }
}

customElements.define('circuit-call-stage', CircuitCallStage);