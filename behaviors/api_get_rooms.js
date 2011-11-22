
// Imports
var connection          = require("connection");
var resource            = require("resource");
var signal              = require("signal");


// Constants
var ROOM_OFFSET         = 2;


// Variables
var connid              = connection.getID().toString(16);
var channel             = script.env.CHANNEL;
var roomid              = channel - ROOM_OFFSET;
var rooms               = resource.load("forum:rooms");
var room                = null;
var slotid              = null;
var all                 = null;
var title               = null;
var result              = [];


result = [];
all = rooms.findall();

for (var i = 0, l = all.length; i < l; i++) {
  slotid = all[i];
  title = rooms.find(slotid);
  room = resource.load("forum:room" + slotid);
  result.push([ROOM_OFFSET + slotid, title, room.count()].join(","))
}


signal.reply("get_rooms:ok " + result.join(";"));