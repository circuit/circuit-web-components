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
  <div part="conversation-title" id="conversation-title"></div>
  <div part="conversation-container">
    <div id="conversation-feed"></div>
  </div>
  <input part="inp" type="text">
  <button part="btn">Send</button>
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

  set convId(value) {
    // If no value given or if the conversation is the same as before
    if (!value || value === this._convId) {
        return;
    }
    this._loadFeed();
  }

  get sendOnEnter() {
    return this._sendOnEnter;
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
    this._conversationFeed = this.root.getElementById('conversation-feed'); // Conversation Feed
    this._conversationTitle = this.root.getElementById('conversation-title'); //  Title of the conversation
    this._input = this.root.querySelector('input');
    this._btn = this.root.querySelector('button');
  }

  // Delay Circuit initialization to speed up page load. This way the SDK
  // can be loaded with 'async'
  async _init() {
    this._client = Circuit.Client({
      domain: this._domain,
      client_id: this._clientId
    });

    // Event listeners

    // Send a message
    this._btn.addEventListener('click', () => this._sendTextItem());
    this._input.addEventListener('keyup', evt => {
      // Key Code 13 is ENTER
      if (this._sendOnEnter && evt.keyCode === 13) {
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
      this._conversationFeed.appendChild(this._createItemHtml(item));
      this._focusFeed();
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
        this._focusFeed();
      }
    });

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

  async _getItems() {
    try {
        await this._connect();
        this._conversation = await this._client.getConversationById(this._convId);
        let feed = await this._client.getConversationItems(this._conversation.convId, { numberOfItems: this._initNumOfItems });
        feed = feed.filter(f => f.type === Circuit.Enums.ConversationItemType.TEXT).reverse();
        this._feed = feed.reverse();
        this._renderFeed();
    } catch (err) {
        console.error(err);
    }
  }

  _loadFeed(tries) {
    // If component is loaded before Circuit is loaded on the page 
    // Will try 5 times to load the component
    tries = tries++ || 1;
    if (tries > 5) {
      return;
    }
    if (typeof Circuit === 'undefined') {
      setTimeout(() => this._loadFeed(tries), 1000);
      return;
    }
    this._resetValues();
    this._conversationFeed.display = 'none';
    this._input.display = 'none';
    this._getItems();
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
      this._conversationTitle.innerHTML = this._conversation.topic && this._conversation.topic.length ? this._conversation.topic : this._conversation.topicPlaceholder;
      this._conversationFeed.display = 'block';
      this._input.display = 'block';
      // Emit event that conversation feed is loaded
      this.dispatchEvent(new CustomEvent('loaded', { detail: { 
        conv: this._conversation, 
        focus: () =>  this._focusFeed()
        } 
      }));
  }

  // Takes in an item and returns the inner html for the conversation feed
  _createItemHtml(item) {
    let node = document.createElement('div');
    node.part = 'conversation-item';
    node.id = item.itemId;
    node.innerHTML = `<div class="name">${this._usersHashMap[item.creatorId].displayName}:</div><div class="item-content">${item.text.content}</div>`;
    return node;
  }

  // Send text item to circuit conversation
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

  _focusFeed() {
    this.root.getElementById(this._feed[this._feed.length -1].itemId).scrollIntoView();
  }

  // Reset values if conversation changes
  _resetValues() {
    this._conversation = null;
    this._conversationFeed.innerHTML = '';
    this._conversationTitle.innerHTML = '';
    this._feed = null;
  }

  // Lifecycle hooks
  connectedCallback() {
    // Non-watched attributes
    this._clientId = this.getAttribute('clientId');
    this._domain = this.getAttribute('domain') || 'circuitsandbox.net';
    this._convId = this.getAttribute('convId');
    this._sendOnEnter = this.getAttribute('sendOnEnter') !== null;
    this._initNumOfItems = !!this.getAttribute('initNumOfItems') && Number(this.getAttribute('initNumOfItems'));
    this._convId && this._loadFeed();
  }
}

customElements.define('circuit-chat', CircuitConversation);
