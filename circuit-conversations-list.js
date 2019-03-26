const template = document.createElement('template');
const initHtml = `
<style>
hr {
  border: 0;
  margin: 0;
  padding-top: 3px;
}
.name {
  align-self: flex-start;
  min-width: var(--name-width);
}
.item-content {
  padding: var(--item-padding);
  align-self: flex-start;
}
</style>
<div part="main-container">
  <div>Conversations List</div>
  <div id="conversations-list"></div>
</div>`;
template.innerHTML = initHtml;
export class CircuitConversationsList extends HTMLElement {
  // Attributes we care about getting values from.
  static get observedAttributes() {
    return ['active'];
  }

  set active(value) {
    this._active = value;
    if (!this._active) {
      this._resetValues();
    }
  }

  get active() {
    return this._active;
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

  get client() {
    return this._client;
  }

  constructor() {
    super();
    this._client = null;

    this.root = this.attachShadow({ mode: 'open' });
    this.root.appendChild(template.content.cloneNode(true));

    this._usersHashMap = {}; // Hashmap to store users names for the conversation feed
    this._conversationsListElement = this.root.getElementById('conversations-list'); // Conversation List Container
  }

  // Delay Circuit initialization to speed up page load. This way the SDK
  // can be loaded with 'async'
  async _init() {
    this._client = Circuit.Client({
      domain: this._domain,
      client_id: this._clientId
    });

    // Event listeners

    // this._btn.addEventListener('click', () => this._sendTextItem());
    // this._input.addEventListener('keyup', evt => {
    //   // Key Code 13 is ENTER
    //   if (this._sendOnEnter && evt.keyCode === 13) {
    //     this._sendTextItem();
    //   }
    // });

    this.dispatchEvent(new CustomEvent('initialized', { detail: this.client }));
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
          await this._client.logon();
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

  async _getConversations() {
    try {
        await this._connect();
        this._conversationsList = await this._client.getConversations();
        this._renderConversations();
    } catch (err) {
        console.error(err);
    }
  }

  async _renderConversations() {
    debugger;
      this._conversationsList.forEach(conversation => this._conversationsListElement.appendChild(this._createConversationHtml(conversation)));
      // Emit event that conversations list is loaded
      this.dispatchEvent(new CustomEvent('loaded'));
  }

  // Takes in an item and returns the inner html for the conversation feed
  _createConversationHtml(conversation) {
    debugger;
    let node = document.createElement('div');
    node.part = 'conversation';
    node.id = conversation.convId;
    node.innerHTML = `<div class="conversation" id="${conversation.convId}">${conversation.topic}</div>`;
    return node;
  }

  _loadConversations(tries) {
    // If component is loaded before Circuit is loaded on the page 
    // Will try 5 times to load the component
    tries = tries++ || 1;
    if (tries > 5) {
      return;
    }
    if (typeof Circuit === 'undefined') {
      setTimeout(() => this._loadConversations(tries), 1000);
      return;
    }
    this._resetValues();
    this._getConversations();
  }

  // Reset values if conversation changes
  _resetValues() {
  }

  // Lifecycle hooks
  connectedCallback() {
    // Non-watched attributes
    this._clientId = this.getAttribute('clientId');
    this._domain = this.getAttribute('domain') || 'circuitsandbox.net';
    this._active = this.getAttribute('active') !== null;
    this._active && this._loadConversations();
  }
}

customElements.define('circuit-conversations-list', CircuitConversationsList);
