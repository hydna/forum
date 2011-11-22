$(document).ready(function() {
    console.log('in business');
    
    // serveral rooms
    
    // several users
    
    // rooms in different channels returned with signals
    
    // create rooms 
    
    // get active rooms
    
    // enter room
    
    // get users in room
    
    // change nick
    

    forum.onmessage = function(graph) {
      console.log(graph);
    };


    $(".create-btn").click(function(event) {

      event.preventDefault();

      forum.createRoom("bajskorv", function(err, channel) {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Room created with channel #%s", channel);
      });
    });


    $(".send-btn").click(function(event) {

      event.preventDefault();

      forum.postMessage("hello world");
    });

    $(".join-btn").click(function(event) {

      event.preventDefault();

      forum.joinRoom(3, function(err, channel) {
        if (err) {
          console.error(err);
          return;
        }
        forum.getUserList(function(err, list) {
          console.log("here!");
          if (err) {
            console.error(err);
            return;
          }

          for (var k in list) {
            console.log(list[k]);
          }

          forum.postMessage("Hello world!");
        });
        console.log("Joined room #%s", channel);
      });
    });


    $(".login button").click(function() {
      var nick = $(".login #nick").val();
      var email = $(".login #email").val();
      var hash = MD5(email);

      $(".login button").attr("disabled", "disabled");

      forum.joinLobby(nick, hash, function(err) {

        if (err) {
          alert(err);
          return;
        }

        forum.getRoomList(function(err, rooms) {

          if (err) {
            console.error(err);
            return;
          }

          console.log(rooms);

        });
        $(".login button").attr("disabled", "");


        $(".login").hide();
      });
    });
});
    /*
    var nick = nickgen();
    var chat = $('#chat');

    // open a stream to hydna in read/write mode
    var stream = new HydnaStream('demo.hydna.net/2222', 'rw');

    // draw figure when data is received over stream
    stream.onmessage = function(message) {
        var packet = JSON.parse(message);
        switch(packet.type) {
        case 'join':
            chat.infoMessage(packet.nick + ' has entered the chat!');
            break;
        case 'msg':
            chat.chatMessage(packet.nick, packet.message);
            break;
        }
        // scroll to bottom of chat. this could be disabled when the user
        // has manually scrolled.
        chat.attr('scrollTop', chat.attr('scrollHeight'));
    };

    stream.onerror = function(err) {
        chat.errorMessage('An error has occured. ' + err.error);
    };
    stream.onclose = function(err) {
        chat.infoMessage('Connection closed. Please reload page.');
    }

    // initiate paint when stream is ready.
    stream.onopen = function() {
        chat.infoMessage('You are now connected and will henceforth be known as "' + nick + '".');
        stream.send(JSON.stringify({
            nick: nick,
            type: 'join'
        }));
    };

    $('#input input').focus();

    $('form').submit(function(event) {
        event.preventDefault();
        var input = $('input', this);
        if (input.val()) {
            stream.send(JSON.stringify({
                nick: nick,
                type: 'msg',
                message: input.val()
            }));
            input.val('');
        }
    });
});

function nickgen() {
    var consonants = 'bcddfghklmmnnprssttv';
    var vocals = 'aaeeiioouuy';
    var length = 4 + Math.floor(Math.random() * 4);
    var nick = [];
    var pool;
    for (var i = 0; i < length; i++) {
        pool = (i % 2?vocals:consonants);
        nick.push(pool.charAt(Math.floor(Math.random() * pool.length)));
    }
    return nick.join('');
}

function time() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 12?'0' + h:h) + ':' + (m < 10?'0' + m:m);
}

$.fn.chatMessage = function(nick, message) {
    nick = nick.replace(/<([^>]+)>/g,'');
    message = message.replace(/<([^>]+)>/g,'');
    $(this).append([
        '<p class="message">',
        '<span class="time">[',
        time(),
        ']</span>',
        '<span class="nick">',
        nick,
        ':</span>',
        message,
        '</p>'
    ].join(''));
};

$.fn.infoMessage = function(message) {
    $(this).append([
        '<p class="info">',
        '<span class="prefix">â‰¡</span>',
        message,
        '</p>'
    ].join(''));
};

$.fn.errorMessage = function(message) {
    $(this).append([
        '<p class="error">',
        '<span class="prefix">â‰¡</span>',
        message,
        '</p>'
    ].join(''));
};*/
