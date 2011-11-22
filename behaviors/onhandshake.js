
// Imports
var connection          = require("connection");


// Variables
var connid              = connection.getID().toString(16);


// We are sending back the connection id. Client
// application uses this to sign it owns messages.
connection.allow(connid);