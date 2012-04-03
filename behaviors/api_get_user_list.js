
// Variables
var result              = null;

// Grab all connections from current channel
result = channel.findall("connections");

// Send them back to the calling connection
connection.reply("get_user_list:ok " + result.join(";"));