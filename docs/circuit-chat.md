# circuit-chat

## Usage

```html
<<<<<<< HEAD
// Render text messages of conversation with an input field to post messages.
=======
// Circuit Conversation. Renders the conversation feed of a given conversation Id.
>>>>>>> d2a57de75175d58f2d7858e425ce7481bfaa9311
<circuit-chat
  domain="circuitsandbox.net"
  clientId="f06c51a30f0d4eb6acc05829c3e86266"
  convId="161e974d-8531-45fe-b951-26cd40fee8fd"
  initNumOfItems="40"
  sendOnEnter
  showTitle></circuit-chat>
```

## API

### Attributes

| Name        | Required | Default            | Description
| ---         | ---      | ---                | ---
<<<<<<< HEAD
| client   | no<sup>[*](#myfootnote1)</sup>     |                    | Initialized on client instance
| clientId    | no<sup>[*](#myfootnote1)</sup>      |                    | client_id of your app <sup>[2](#myfootnote1)</sup>
=======
| client   | no<sup>[*](#myfootnote1)</sup>     |                    | initialized on client instance
| clientId    | no<sup>[*](#myfootnote1)</sup>      |                    | client_id of your app <sup>[2](#myfootnote1)</sup>
| target      | yes      |                    | Email of Circuit user to call
>>>>>>> d2a57de75175d58f2d7858e425ce7481bfaa9311
| domain      | no       | circuitsandbox.<span></span>net | Url of Circuit system
| inprogress  | no       | omitted (false)    | Attribute set by the web component to allow easy CSS attribute styling
| connected   | no       | omitted (false)    | Attribute set by the web component to indicate if component if connected to the Circuit servers. Can be used to change the button style via CSS if connection is lost.
| convId       | yes       |     | String attribute. The conversation Id of the conversation to be rendered.
| sendOnEnter       | no       |   false  | Non-value attribute. When present messages will be sent to the conversations on an enter press.
| showTitle       | no       |   false  | Non-value attribute. When present the title of the conversation will be displayed above.
<<<<<<< HEAD
| reverse       | no       |   false  | Non-value attribute. When present new items will appear at the top of the feed rather than the bottom.
=======
| showNewItemsTop       | no       |   false  | Non-value attribute. When present new items will appear at the top of the feed rather than the bottom.
>>>>>>> d2a57de75175d58f2d7858e425ce7481bfaa9311
| initNumOfItems       | no       |   25  | Number attribute. Sets the inital number of items to retrieve.

<a name="myfootnote1">*</a>: Either a client Id or a initialized client instance must be passed.

<a name="myfootnote2">2</a>: See [dev portal](https://circuit.github.io) for instructions on how to get your own sandbox tenant and how to register an app to get the credentials (client_id).



### Properties

| Name        |  Type            |  Read/Write      | Description
| ---         |  ---             |  ---             | ---
| client        | [Client](https://circuitsandbox.net/sdk/classes/Client.html) | read | Circuit Client object as defined in the Circuit JS SDK.
<<<<<<< HEAD
| conversation        | [Conversation](https://circuitsandbox.net/sdk/classes/Conversation.html) | read | Object containing the conversation.
| feed        | [Item[]](https://circuitsandbox.net/sdk/classes/Item.html) | read | Array of Items from the conversation.
| users        | [User[]](https://circuitsandbox.net/sdk/classes/User.html) | read | Array of User objects from the conversation feed.
=======
>>>>>>> d2a57de75175d58f2d7858e425ce7481bfaa9311


### Events

| Name        |  Arguments          | Description
| ---         |  ---                | ---
<<<<<<< HEAD
| loaded  |  [Client](https://circuitsandbox.net/sdk/classes/Client.html)                 | Raised when the component has retrieved the conversation feed.
| initialized  |  ---                 | Raised when Circuit.Client is initialized.
| itemAdded  |  [Item](https://circuitsandbox.net/sdk/classes/Item.html)                | Raised when a new item in the conversation is added.
| itemUpdated  |  [Item](https://circuitsandbox.net/sdk/classes/Item.html)                | Raised when a new item in the conversation feed is updated.
| conversationUpdated  |  [Conversation](https://circuitsandbox.net/sdk/classes/Conversation.html)                | Raised when the conversation is updated.
=======
| loaded  |  ---                | Raised when the component has retrieved the conversation feed.
| initialized  |  [Client](https://circuitsandbox.net/sdk/classes/Client.html)                   | Raised when Circuit.Client is initialized.
| itemAdded  |  [Client](https://circuitsandbox.net/sdk/classes/Item.html)                | Raised when a new item in the conversation is added.
| itemUpdated  |  [Client](https://circuitsandbox.net/sdk/classes/Item.html)                | Raised when a new item in the conversation feed is updated.
| conversationUpdated  |  [Client](https://circuitsandbox.net/sdk/classes/Conversation.html)                | Raised when the conversation is updated.
>>>>>>> d2a57de75175d58f2d7858e425ce7481bfaa9311

### Exposed Methods
| Name        |  parameters          | Description
| ---         |  ---                | ---
| scrollTo  |      `direction`            | Scrolls the feed to the top or bottom depending on the parameter passed. If `bottom` is passed it will scroll to the bottom, similarly `top` will scroll to the top.

### Styling (CSS)

Styling can be done using css variables. Using css variables the height, width, and the style of each individual item in the conversation can be changed.

Here are some example CSS rules:
```css
      circuit-chat {
        padding-left: 30px;
        --width: 500px;
        --chat-height: 250px;
        --item-padding: 5px 0;
        --title-font: Monospace;
        --title-font-size: 24px;
        --title-padding: 0 0 10px 0;
        --item-font: sans-serif;
        --item-font-size: 13px;
        --item-border: 1px solid #dadada;
        --input-margin: 15px 0 0 0;
        --input-float: right;
      }
```


## Referenced in examples

* [Circuit Chat](../examples/chat.html)