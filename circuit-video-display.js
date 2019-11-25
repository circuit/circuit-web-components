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

#video {
  position: absolute;
}

</style>

<div id="container">
  <video id="video" autoplay playsinline></video>
</div>
`;

export class CircuitVideoDisplay extends HTMLElement {
  set stream(stream) {
    this._stream = stream;
    this._render();
  }

  get stream() {
    return this._stream;
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
    this._stream = null;

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(template.content.cloneNode(true));

    this._videoEl = this.root.querySelector('#video');
    this._containerEl = this.root.querySelector('#container');
  }

  _render() {
    try {
      if (!this._stream) {
        this._videoEl.srcObject = null;
      } else {
        this._videoEl.srcObject = this._stream;
      }

      // Reflect 'streaming' attribute
      this._streaming = !!this._videoEl.srcObject;
    } catch (err) {
      console.error('Error rendering video stream', err);
      throw new Error('Error rendering video stream');
    }
  }

  stop() {
    if (this._stream) {
      this._stream.getTracks().forEach(track => track.stop());
      this._stream = null;
      this._render();
    }
  }

  // Lifecycle hooks
  attributeChangedCallback(attrName, oldValue, newValue) {
  }
}

customElements.define('circuit-video-display', CircuitVideoDisplay);
