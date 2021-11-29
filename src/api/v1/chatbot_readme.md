## Chatbot Route

- we have to send a post request to
`/v1/chatbot/get-reponse` 
with the string we want to get response of. There that string acts a a parameter in the function that get response.

- Response will be in format of array -> `["Response_string","Response_intent"]`

- If `"Response_intent"` begins with `"/"` then we have to attach a hyperlink to our `"Response_string"`,
else we can show response string directly

- _eg. 
"show magazine" -> post req -> /get-reponse
["here are magazines","/magazine"]
actual response -> here are magazines. hyperlink
