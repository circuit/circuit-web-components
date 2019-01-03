const template = document.createElement('template');
template.innerHTML = `
<style>
* {
  box-sizing: border-box
}

:host {
  display: inline-block;
  cursor: pointer;
  border-radius: 5px;
  background:#88c541;
  color: white;
  padding: 5px 10px;
}
:host([inprogress]) {
  background:#c22026;
}

:host([disabled]) button {
  cursor: not-allowed;
}

button {
  cursor: pointer;
  outline: none;
  background: inherit;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  border: inherit;
  border-radius: inherit;
}

</style>

<button></button>
<audio id="ringback" autoplay></audio>
<audio id="audio" autoplay></audio>
`;

export class CircuitCallButton extends HTMLElement {
  // Attributes we care about getting values from.
  static get observedAttributes() {
    return ['video', 'target'];
  }

  get connected() {
    return this.hasAttribute('connected');
  }

  set _connected(isConnected) {
    if (isConnected) {
      this.setAttribute('connected', '');
    } else {
      this.removeAttribute('connected');
    }
  }

  set target(value) {
    this._target = value;
    // Reflect to attribute
    this.setAttribute('target', value);
  }

  get target() {
    return this._target;
  }

  constructor() {
    super();
    this._client = null;

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(template.content.cloneNode(true));

    this._btn = this.root.querySelector('button');
    this._defaultText = this.textContent && this.textContent.replace(/^\s+|\s+$/g, '') || 'Call';
    this._btn.textContent = this._defaultText;
    this._btn.addEventListener('click', this._click.bind(this));
  }

  // Delay Circuit initialization to speed up page load. This way the SDK
  // can be loaded with 'async'
  async _init() {
    Circuit.logger.setLevel(1);
    this._client = Circuit.Client({
      domain: this._domain,
      client_id: this._clientId
    });

    this._client.addEventListener('connectionStateChanged', e => {
      console.log('connectionStateChanged event', e);
      this._connected = e.state === 'Connected';
    });

    this._client.addEventListener('callStatus', e => {
      this.call = e.call;

      // Update 'inprogress' attribute and button text
      if (e.call.state === 'Initiated') {
        this.removeAttribute('inprogress');
        this._btn.textContent = this._callingText;
      } else {
        this.setAttribute('inprogress', '');
        this._btn.textContent = this._hangupText;
        this.removeAttribute('disabled', '');
      }

      // Set/clear ringback tone
      const ringbackEl = this.root.querySelector('#ringback');
      if (e.call.state === 'Delivered') {
        ringbackEl.src = this._ringbackTone;
      } else {
        ringbackEl.removeAttribute('src');
        ringbackEl.load();
      }

      // Set remote audio stream
      this.root.querySelector('#audio').srcObject = e.call.remoteAudioStream;

      this.dispatchEvent(new CustomEvent('callchange', { detail: e.call }));
    });

    this._client.addEventListener('callEnded', e => {
      console.log('callEnded event', e);
      this.call = null;
      this.removeAttribute('inprogress');
      this._btn.textContent = this._defaultText;

      const ringbackEl = this.root.querySelector('#ringback');
      ringbackEl.removeAttribute('src');
      ringbackEl.load();

      // Raise without a call object as parameter
      this.dispatchEvent(new CustomEvent('callchange'));

      // Wait a bit to ensure call is successfully terminated, then logout
      // Comment out for now due to a presence bug.
      //setTimeout(this._client.logout, 200);
    });
  }

  async _getCredentials() {
    let res = await fetch(`${this._poolUrl}?clientId=${this._clientId}&domain=${this._domain}`);
    res = await res.json();
    if (!res || !res.token) {
      throw Error('No pool users found');
    }
    const cred = atob(res.token).split(':');
    this._client.setOauthConfig({client_id: cred[2]});
    return {
      username: cred[0],
      password: cred[1]
    };
  }

  async _connect() {
    if (!Circuit) {
      throw Error('circuit-sdk is not loaded');
    }
    !this._client && this._init();

    try {
      if (this._client.connectionState === 'Connected') {
        return;
      } else if (this._client.connectionState === 'Disconnected') {
        if (this._poolUrl) {
          const cred = await this._getCredentials();
          await this._client.logon(cred);
        } else {
          await this._client.logon();
        }
      } else {
        await this._waitForConnected(5000);
      }
    } catch (err) {
      console.error('Error connecting to Circuit', err);
      throw new Error('Error connecting to Circuit');
    }
  }

  async _waitForConnected(timeoutms) {
    return new Promise((resolve, reject) => {
      const check = () => {
        if (this._client.connectionState === 'Connected') {
          resolve();
        } else if ((timeoutms -= 100) < 0) {
          reject('timed out');
        } else {
          setTimeout(check, 100);
        }
      }
      setTimeout(check, 100);
    });
  }

  async _click() {
    if (this.getAttribute('disabled') !== null) {
      return;
    }
    if (!this.call) {
      this._makeCall();
    } else {
      this._hangup();
    }
  }

  async _makeCall() {
    // For better user feedback change call to inprogress before call
    // state is 'Initiated'
    const origText = this._btn.textContent;
    this._btn.textContent = this._callingText;
    this.setAttribute('disabled', '');
    try {
      await this._connect();
      this.call = await this._client.makeCall(this._target, {audio: true, video: this._sendVideo}, true);
    } catch (err) {
      this.removeAttribute('disabled');
      this._btn.textContent = origText;
    }
  }

  async _hangup() {
    await this._client.endCall(this.call.callId);
  }

  // Lifecycle hooks
  connectedCallback() {
    // Non-watched attributes
    this._clientId = this.getAttribute('clientId');
    this._domain = this.getAttribute('domain') || 'circuitsandbox.net';
    this._poolUrl = this.getAttribute('poolUrl');
    this._target = this.getAttribute('target');
    this._sendVideo = this.getAttribute('video') !== null;
    this._callingText = this.getAttribute('callingText') || 'Calling...';
    this._hangupText = this.getAttribute('hangupText') || 'Hangup';
    this._ringbackTone = this.getAttribute('ringbackTone') || 'https://upload.wikimedia.org/wikipedia/commons/c/cd/US_ringback_tone.ogg';
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    switch (attrName) {
      case 'video':
      // Send video if attribute is present
      newValue = newValue !== null;
      if (this._sendVideo !== !!newValue) {
        this._sendVideo = !!newValue;
        this._client && this._client.toggleVideo(this.call.callId)
          .catch(err => {
            console.log(err)
          });

      }
      break;

      case 'target':
      this._target = newValue;
      break;
    }
  }
}

customElements.define('circuit-call-button', CircuitCallButton);