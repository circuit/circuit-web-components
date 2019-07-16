# circuit-conversations-list

## Usage

```html
// Renders a list of recent Circuit conversations.
<circuit-conversations-list
  domain="circuitsandbox.net"
  clientId="f06c51a30f0d4eb6acc05829c3e86266"
  numberOfConversations="10"></circuit-conversations-list>
```

## API

### Attributes

| Name        | Required | Default            | Description
| ---         | ---      | ---                | ---
| client   | no<sup>[*](#myfootnote1)</sup>     |                    | Initialized on client instance
| clientId    |  no<sup>[*](#myfootnote1)</sup>      |                    | client_id of your app <sup>[1](#myfootnote1)</sup>
| domain      | no       | circuitsandbox.<span></span>net | Url of Circuit system
| connected   | no       | omitted (false)    | Attribute set by the web component to indicate if component if connected to the Circuit servers. Can be used to change the button style via CSS if connection is lost.
| numberOfConversations       | no       | 25    | Number attribute. Sets number of conversation to retrieve.

<a name="myfootnote1">1</a>: Either a client Id or a initialized client instance must be passed.

<a name="myfootnote2">2</a>: See [dev portal](https://circuit.github.io) for instructions on how to get your own sandbox tenant and how to register an app to get the credentials (client_id).


### Properties

| Name        |  Type            |  Read/Write      | Description
| ---         |  ---             |  ---             | ---
| client        | [Client](https://circuitsandbox.net/sdk/classes/Client.html) | read | Circuit Client object as defined in the Circuit JS SDK.
| users        | [User[]](https://circuitsandbox.net/sdk/classes/User.html) | read | Array of User objects from direct conversations.
| conversation        | [Conversation[]](https://circuitsandbox.net/sdk/classes/Conversation.html) | read | Array of Conversation objects.


### Events

| Name        |  Arguments          | Description
| ---         |  ---                | ---
| loaded  |  [Client](https://circuitsandbox.net/sdk/classes/Client.html)                | Raised when the component has retrieved the list of conversations.
| initialized  |  ---                   | Raised when Circuit.Client is initialized.
| conversationCreated  |  [Conversation](https://circuitsandbox.net/sdk/classes/Conversation.html)                | Raised when a new conversation is created.
| conversationUpdated  |  [Conversation](https://circuitsandbox.net/sdk/classes/Conversation.html)            | Raised when a conversation in the list is updated.
| selected  |  [Client](https://circuitsandbox.net/sdk/classes/Client.html) and [Client](https://circuitsandbox.net/sdk/classes/Conversation.html)                | Raised when a conversation is selected.

### Exposed Methods
| Name        |  parameters          | Description
| ---         |  ---                | ---
| fetchConversations  |      ---            | Fetches the most recent conversations.

### Styling (CSS)

Styling can be done using css variables. Using css variables the height, width, and the style of each individual conversation can be changed.

Here are some example CSS rules:
```css
  circuit-conversations-list {
    --min-width: 200px;
    --max-height: 500px;
    --conversation-height: 25px;
    --conversation-border: 1px solid #dadada;
    --conversation-padding: 2px 0;
    --conversation-font: sans-serif;
    --conversation-font-size: 13px;
  }
```


## Referenced in examples

* [Circuit Chat](../examples/chat.html)