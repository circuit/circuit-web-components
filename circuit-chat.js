const template = document.createElement('template');
const initHtml = `
<style>

.conversation-item {
  padding: 10px 5px;
  border-top: 1px solid #dadada;
  display: flex;
  align-items: center;
  word-wrap: break-word
}
.name {
  align-self: flex-start;
  min-width: 80px;
}
.item-content {
  width: 570px;
  padding-left: 20px;
  align-self: flex-start;
}
</style>
<div class="conversation-container">
  <div id="conversation-feed"></div>
  <input type="text">
  <button>Send</button>
</div>`;
template.innerHTML = initHtml;
export class CircuitConversation extends HTMLElement {
  // Attributes we care about getting values from.
  static get observedAttributes() {
    return ['convId'];
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

  // Get the conversation here
  set convId(value) {
    // If no value given or if the conversation is the same as before
    if (!value || !value.length || value === this._convId) {
        return;
    }
    this._resetValues();
    this._convId = value;
    // Reflect to attribute
    this._conversationFeed.display = 'none';
    this._input.display = 'none';
    this.setAttribute('convId', value);
    this._getConversation();
  }

  set size(value) {
    // Max size of conversations to show at once, defaults to 15
    this._size = value ? value : 15;
  }

  set maxItems(value) {
    // Max size of conversations store at once, defaults to 100
    this._maxItems = value ? value : 100;
  }

  set initNumOfItems(value) {
    // Initial number of items to retrieve, defaults to 20
    this._initNumOfItems = value ? value : 20;
  }

  get convId() {
    return this._convId;
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
    this._conversationFeed = this.root.getElementById('conversation-feed');
    this._input = this.root.querySelector('input');
    this._btn = this.root.querySelector('button');
  }

  // Delay Circuit initialization to speed up page load. This way the SDK
  // can be loaded with 'async'
  async _init() {
    this._conversationFeed.style.maxHeight = `${35 * this._size}px`;
    this._conversationFeed.style.overflowY = 'auto';
    this._client = Circuit.Client({
      domain: this._domain,
      client_id: this._clientId
    });

    // Replacing hr from circuit items to br
    Circuit.Injectors.itemInjector = function (item) {
      if (item.type === Circuit.Enums.ConversationItemType.TEXT) {
        // Replacing br and hr tags with a space
        item.text.content = item.text.content.replace(/<(\/li|hr[\/]?)>/gi, '<br>');
      }
    };
    // Event listeners

    // Send a message
    this._btn.addEventListener('click', () => this._sendTextItem());
    this._input.addEventListener('keyup', evt => {
      if (evt.keyCode === 13) {
        this._sendTextItem();
      }
    });

    // New text item added to the conversation
    this._client.addEventListener('itemAdded', async evt => {
      const item = evt.item;
      if (item.convId !== this._conversation.convId || item.type !== Circuit.Enums.ConversationItemType.TEXT) {
        return;
      }
      // If user isn't stored in cache get user data
      if (!this._usersHashMap[item.creatorId]) {
        this._usersHashMap[item.creatorId] = await this._client.getUserById(item.creatorId);
      }
      this._feed.push(item);
      if (this._feed.length > this._maxItems) {
        const itemId = this._feed[0].itemId;
        this._feed.splice(0,1);
        let child = this.root.getElementById(itemId);
        this._conversationFeed.removeChild(child);
      }
      this._conversationFeed.appendChild(this._createItemHtml(item));
      this.root.getElementById(item.itemId).scrollIntoView();
    });

    // An item in the feed was updated
    this._client.addEventListener('itemUpdated', evt => {
      const item = evt.item;
      if (item.convId !== this._conversation.convId || item.type !== Circuit.Enums.ConversationItemType.TEXT) {
        return;
      }
      let oldItem = this.root.getElementById(item.itemId);
      if (oldItem) {
        oldItem.innerHTML = this._createItemHtml(item).innerHTML;
      }
    });

    this.dispatchEvent(new CustomEvent('initialized', { detail: this.client }));
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

  async _getConversation() {
    try {
        await this._connect();
        this._conversation = await this._client.getConversationById(this._convId);
        let feed = await this._client.getConversationItems(this._conversation.convId, { numberOfItems: this._initNumOfItems > this._maxItems ? this._maxItems : this._initNumOfItems });
        feed = feed.filter(f => f.type === Circuit.Enums.ConversationItemType.TEXT).reverse();
        this._feed = feed.reverse();
        this._renderFeed();
    } catch (err) {
        console.error(err);
    }
  }

  async _renderFeed() {
      const newUserIds = []; // Get New users for hashmap
      this._feed.forEach(item => {
          if (!this._usersHashMap[item.creatorId]) {
            newUserIds.push(item.creatorId);
          }
      });
      // If there are new users not stored in the hash retrieve before adding to the feed
      if (newUserIds.length) {
        const newUsers = await this._client.getUsersById(newUserIds);
        newUsers.forEach(u => this._usersHashMap[u.userId] = u);
      }
      this._feed.forEach(item => this._conversationFeed.appendChild(this._createItemHtml(item)));
      this._conversationFeed.display = 'block';
      this._input.display = 'block';
      this.root.getElementById(this._feed[this._feed.length -1].itemId).scrollIntoView();
  }

  // Takes in an item and returns the inner html for the conversation feed
  _createItemHtml(item) {
    let node = document.createElement('div');
    node.className = 'conversation-item';
    node.id = item.itemId;
    node.innerHTML = `<div class="name">${this._usersHashMap[item.creatorId].displayName}:</div><div class="item-content">${item.text.content}</div>`;
    return node;
  }

  async _sendTextItem() {
    const text = this._input && this._input.value;
    if (!this._client.loggedOnUser || !this._conversation || !text.length) {
      return;
    }
    try {
      await this._client.addTextItem(this._convId, text);
      this._input.value = '';
    } catch (err) {
      console.error(err);
    }
  }

  _resetValues() {
    this._conversation = null;
    this._conversationFeed.innerHTML = '';
    this._feed = null;
  }

  // Lifecycle hooks
  connectedCallback() {
    // Non-watched attributes
    this._clientId = this.getAttribute('clientId');
    this._domain = this.getAttribute('domain') || 'circuitsandbox.net';
    this._poolUrl = this.getAttribute('poolUrl');
    this._convId = this.getAttribute('convId');
    this._size = this.getAttribute('size');
    this._maxItems = this.getAttribute('maxItems');
    this._initNumOfItems = this.getAttribute('initNumOfItems');
  }
}

customElements.define('circuit-chat', CircuitConversation);
