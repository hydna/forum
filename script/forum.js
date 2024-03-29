(function(exports) {

  exports.joinLobby       = joinLobby;
  exports.createRoom      = createRoom;
  exports.getRoomList     = getRoomList;
  exports.joinRoom        = joinRoom;
  exports.getUserList     = getUserList;
  exports.postMessage     = postMessage;
  exports.postTyping      = postTyping;
  exports.currentChannel  = currentChannel;
  exports.onnotif         = null;
  exports.onmessage       = null;

  // Constants
  var ROOT_URL            = "forum.hydna.net";
  var LOBBY_CHANNEL       = 1;

  // variables
  var lobbyChannel        = null;
  var connid              = null;
  var userNick            = null;
  var userHash            = null;
  var roomChannel         = null;
  var lobbyCallbacks      = {};


  function joinLobby(nick, hash, callback) {
    var href

    userNick = nick;
    userHash = hash;

    href = ROOT_URL + "/" + LOBBY_CHANNEL + "?" + [userNick, userHash].join(",");
    lobbyChannel = new HydnaChannel(href, "emit");

    function cleanup(err) {
      lobbyChannel.onerror = null;
      lobbyChannel.onclose = null;
      if (err) {
        lobbyChannel = null;
      }
    }

    lobbyChannel.onopen = function(event) {
      cleanup();
      connid = event.message;
      return callback(null, connid);
    };

    lobbyChannel.onerror = function(event) {
      cleanup(true);
      return callback(event.message);
    };

    lobbyChannel.onclose = function(event) {
      cleanup(true);
      return callback(event.message);
    };

    lobbyChannel.onsignal = function(event) {
      var message = event.message;
      var graph = message.split(" ");
      var header = graph[0].split(":");
      var method = header[0];
      var code = header[1];
      var message = graph.slice(1).join(" ");

      if (method == "notif") {
          if (exports.onnotif) {
              exports.onnotif(code, message);
          }
          return;
      }

      if (lobbyCallbacks[method]) {
        lobbyCallbacks[method](code, message);
        delete lobbyCallbacks[method];
      }
    };

  }


  function createRoom(title, callback) {

    if (!lobbyChannel) {
      return callback(new Error("Not connected"));
    }

    callRemote("create_room", [title], function(code, message) {

      if (code == "error") {
        return callback(new Error(message));
      }

      return callback(null, parseInt(message));
    });
  }


  function getRoomList(callback) {

    if (!lobbyChannel) {
      return callback(new Error("Not connected"));
    }

    callRemote("get_rooms", [], function(code, message) {
      var result;
      var graph;
      var room;

      if (code == "error") {
        return callback(new Error(message));
      }

      if (message.length == 0) {
        return callback(null, []);
      }

      result = [];
      graph = message.split(";");

      for (var i = 0, l = graph.length; i < l; i++) {
        room = graph[i].split(",");
        result.push({
          channel: parseInt(room[0]),
          title: room[1],
          count: parseInt(room[2])
        });
      }

      return callback(null, result);
    });
  }


  function joinRoom(chanid, callback) {

    if (!lobbyChannel) {
      return callback(new Error("Not connected"));
    }

    if (roomChannel && chanid == roomChannel.id) {
      return callback();
    }

    if (roomChannel) {
      roomChannel.close();
    }

    createRoomChannel(chanid, function(err, channel) {
      if (err) {
        return callback(err);
      }

      roomChannel = channel;

      getUserList(function( err, list ) {
        return callback(err, list);
      });

    });
  }

  function currentChannel(){

      return roomChannel && roomChannel.id;

  }

  function getUserList(callback) {

    if (!lobbyChannel || !roomChannel) {
      return callback(new Error("Not connected"));
    }

    roomChannel.userlistCallback = function(err, list) {
      return callback(null, list);
    };

    roomChannel.emit("get_user_list");
  }


  function createRoomChannel(chanid, callback) {
    var url = ROOT_URL + "/" + chanid;
    var chan = new HydnaChannel(url, "rwe");

    function cleanup() {
      chan.onopen = null;
      chan.onerror = null;
      chan.onclose = null;
    }

    chan.users = {};

    chan.onopen = function() {
      chan.users[connid] = {
        id: chanid,
        nick: userNick,
        hash: userHash
      };
      cleanup();
      callback(null, chan);
    };

    chan.onerror = function(event) {
      cleanup();
      callback(new Error(event.message));
    };

    chan.onclose = function(event) {
      cleanup();
      callback(new Error(event.message || "disconnected"));
    };

    chan.onsignal = function(event) {
      var message = event.message;
      var graph = message.split(" ");
      var header = graph[0].split(":");
      var method = header[0];
      var code = header[1];
      var message = graph.slice(1).join(" ");
      var list;
      var details;

      switch (method) {
        case "get_user_list":
          list = message.split(";");
          for (var i = 0, l = list.length; i < l; i++) {
            details = getUserDetails(list[i]);
            chan.users[details.id] = details;
          }
          if (chan.userlistCallback) {
            chan.userlistCallback(null, chan.users);
            chan.userlistCallback = null;
          }
          break;
        case "notif":
          switch (code) {
            case "user-join":
              details = getUserDetails(message);
              details.channel = chan.id;
              chan.users[details.id] = details;
              invokeNotif("user-join", details);
              break;
            case "user-leave":
              details = chan.users[message];
              if (details) {
                delete chan.users[message];
                invokeNotif("user-leave", details);
              }
              break;
          }
          break;
      }
    };

    chan.onmessage = function(event) {
      var graph;

      try {
        graph = JSON.parse(event.data);
      } catch (e) {
        return;
      }

      var usr = graph.user.split("-");
      var id = usr[0];
      var time = usr[1];

      if (!chan.users[id]) {
        return;
      }

      if (exports.onmessage) {


          var msg = {
              time: time,
              message: ""
          };

          if( graph.message ){
              msg.message = graph.message;
          }

        exports.onmessage({
            user: chan.users[id],
            time: msg.time,
            message: msg.message
        });

      }
    }
  }

  function postTyping(){
      var graph;

      if (!roomChannel) {
        return;
      }

      graph = {
        user: connid
      };

      roomChannel.send(JSON.stringify(graph));
  }

  function postMessage(message, timestamp) {
    var graph;
    var time = 0;

    if(timestamp){
       time = timestamp;
    }

    if (!roomChannel) {
      return;
    }

    var usr = [ connid, "-", time ].join("");

    graph = {
      user: usr,
      message: message
    };

    roomChannel.send(JSON.stringify(graph));
  }

  function invokeNotif(name, graph) {
    if (exports.onnotif) {
      exports.onnotif(name, graph);
    }
  }

  function getUserDetails(data) {
    var graph = data.split(",");
    return {
      id: graph[0],
      nick: graph[1],
      hash: graph[2]
    };
  }

  function callRemote(id, args, callback) {
    lobbyChannel.emit(id + (args.length ? " " + args.join(",") : ""));
    lobbyCallbacks[id] = callback;
  }

})(window.forum || (window.forum = {}));