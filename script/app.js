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
      
      $('.content').chatMessage( graph.nick, graph.message );
      
    };


    $(".create-btn").click(function(event) {

      event.preventDefault();
      
      $('.cover').show();
      $('.create-room').show();
      $('.create-room #name').focus();
      
    });
    
    $(".create-room .create-btn").click( function(event){
        
        event.preventDefault();
        
        var roomname = $('.create-room #name').val();
        
        forum.createRoom( roomname, function(err, channel) {
            if (err) {
              console.error(err);
              return;
            }

        });
        
    });
    
    $(".create-room .cancel-btn").click( function(event){
        
        event.preventDefault();
        
        $('.cover').hide();
        $('.create-room').hide();
        
        $('.create-room #name').val('');
        
    } );


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
          
          console.log('rooms opening');

          for (var k in list) {
            console.log(list[k]);
        
            
          }

         // forum.postMessage("Hello world!");
        });
        console.log("Joined room");
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
          
          for( var i = 0, l = rooms.length; i < l; i++ ){
              
              var roomitem = $('<li><a href="#" data-channel="'+rooms[i].channel+'"><span class="title">'+rooms[i].title+'</span><span class="count">'+rooms[i].count+'</span></a></li>');
              
              roomitem.hide(0);
              roomitem.fadeIn();

              $('.menu ul').append(roomitem);
          }

        });
        
        var src = 'http://www.gravatar.com/avatar/'+hash+'?s=40.jpg';
        var profileimg = new Image();
        
        profileimg.onload = function(){
            
            var profile = $('<li><img src="'+src+'" /><span>'+nick+'</span></li>');
            
            profile.hide(0);
            profile.fadeIn();
            
            $('.avatar ul').append( profile );
            
        }
        
        profileimg.src = src;
        
        
        $(".login button").attr("disabled", "");


        $(".login").hide();
        $(".cover").hide();
        
      });
    });

    $('#message-form').submit(function(event) {
        event.preventDefault();
        var input = $('input', this);
    
        if (input.val()) {
            console.log( input.val() );
            
            //forum.postMessage( input.val() );
            
            $('.content').chatMessage( "john", input.val(), ""  );
            
            input.val('');
        }
    });
    
    
    $(".menu ul li a").live( 'click', function(event){
        
        event.preventDefault();
        
        $(".menu ul li").removeClass("active");
        
        $(this).parent().addClass("active");
        
       // $('.content').chatMessage( "john", "mr loooooooooooool", "" );
        
        
        console.log( $(this).attr('data-channel') );
        
    } );
});

function time() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return (h < 12?'0' + h:h) + ':' + (m < 10?'0' + m:m)  + ':' +(s < 10?'0' + s:s);
}

$.fn.chatMessage = function(nick, message, profile) {
    
    nick = nick.replace(/<([^>]+)>/g,'');
    message = message.replace(/<([^>]+)>/g,'');
    
    var msg = $('<li><div class="profile"><img src="'+profile+'" width="40" height="40"/></div><div class="msg"><div class="body"><h5>'+nick+' at '+time()+'</h5><p>'+message+'</p></div><span class="arrow"></span></div></li>');
    
    msg.hide();
    msg.fadeIn('fast');
	
	$('ul', $(this)).append( msg );
	
	$(this).animate( { scrollTop: $(this).prop("scrollHeight") }, 100);
	
	// scroll to bottom
};
/*
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