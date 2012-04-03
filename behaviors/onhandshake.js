
var ALIAS_MAX_LENGTH    = 20;
var IMAGE_LENGTH        = 32;


var token               = script.env.TOKEN.split(",");
var alias               = token[0];
var image               = token[1];


// Check if we already are authenticated, if so, exit with an error.
if (connection.get("authenticated") == "yes") {
  exit(1, "ALREADY_AUTHENTICATED");
}


// Validate the 'alias' length and that user has typed an alias
// with letters and digits only.
if (alias.length > ALIAS_MAX_LENGTH || alias.length < 2 ||
    /^[A-Za-z0-9\_\-\s]+$/.test(alias) == false) {
  exit(1, "BAD_ALIAS_FORMAT");
}


// Validate that a valid md5-value was passed for image.
if (image.length != IMAGE_LENGTH) {
  exit(1, "BAD_IMAGE_FORMAT");
}


// Store the alias and image in the connections 
// local storage.
connection.set("alias", alias);
connection.set("image", image);
connection.set("authenticated", "yes");


// We are sending back the connection id. Client
// application uses this to sign it owns messages.
exit(0, connection.id.toString(16));