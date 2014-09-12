 -----------
   **Weemo-extension currently has some main functions**
   
 - Store weemo credentials
 - Authenticate with weemo cloud
 - Provide video call service by attaching video call button in user popup, connections, suggestion...
 - Provide utitily to help other extensions implement video call in themselves 
 
 
  -----------
  **By reusing weemo-extension utility, you also can put video call button to other place in your own extensions.**

   Just do some following steps:
   1. Put html markup of weemo call button into the place you want.
      - The button can be put to template file (*.gtmpl)
      - You can use javascript to insert the button dynamically
      - 3 type of buttons you should notice: one-one call button, creating conference button, joining conference button
   2. Provide information to make call such as:
      - User Id to call one-one
      - Host Id to make a conference call or to join a created conference call
      - Display Name of User Id or Host Id
   3. Reuse weemo-extension javascript utility to make a call.
   4. Additionally, You can enable/disable/set invisible call button which depends on permission or something like that


 -----------
**Example:** 
- A simple extension example demo how to put video call button on itself can be found at https://github.com/exo-addons/weemo-extension/tree/master/weemo-example
- *Chat Extension* which attachs video call button into chat room https://github.com/exo-addons/chat-application