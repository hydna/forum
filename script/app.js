(function() {
    
var NICK_MAX_LENGTH         = 20;
var NICK_MIN_LENGTH         = 2;
var ROOM_MIN_LENGTH         = 3;
var ROOM_MAX_LENGTH         = 20;
var MIN_NORMAL_WIDTH        = 720;
var MIN_CONTRACTED_WIDTH    = 480;
var GRAVATAR_URL            = "http://www.gravatar.com/avatar/%s?s=40.jpg";

var displayMode             = "normal"; // normal, contracted, mobile
var typingsent              = false;
var currentOverlay          = null;
    
$(document).ready(function() {
    
    forum.onmessage = function(graph) {
        
      if( graph.message ){
          $(".content").chatMessage( graph.user.nick, graph.message, graph.user.hash );
      }else{
          $(".avatars").typing( graph.user.id );
      }
      
    };
    
    forum.onnotif = function(code, message){
        
        switch( code ){
            
            case "user-join": // user joins any channel
                
                if( message.channel == forum.currentChannel() ){
                    
                    $(".content").statusMessage( ["<strong>",message.nick,"</strong> just joined this room."].join("") );
                    
                    var user = {};
                    user[message.id] = message;
                    
                    $('.avatars').updateUserList( user );
                    
                }
                
            break;
            
            case "user-leave": // we know it is our channel?
                
                $(".content").statusMessage( ["<strong>",message.nick,"</strong> just left this room."].join("") );
                
                var user = {};
                user[message.id] = message;
                
                $(".avatars").updateUserList( user, true );
                
            break;
            
            case "room-created":
            
                var info = message.split(',');
                var channel = info[0];
                var title = info[1];
                
                $(".menu").addRoom( channel, title, 0 );
            
            break;
            
            case "room-info":
            
                var info = message.split(',');
                var channel = info[0];
                var count = info[1];
                
                $(".menu ul li a").each( function(){
                    
                    if( $(this).attr("data-channel") == channel ){
                        
                        $( ".count", $(this)).html( count );
                        
                        return;
                    }
                    
                });
            
            break;
            
            case "room-destroyed":
            
                var channel = message;
                
                $(".menu ul li a").each( function(){
                    
                    if( $(this).attr("data-channel") == channel ){
                        
                        $(this).attr("data-channel", "-1");
                        
                        $(this).slideUp( function(){
                            $(this).remove();
                        });
                        
                        return;
                    }
                    
                });
            
            break;
        }
        
    }
    
    $(".create-btn").click(function(event) {
        event.preventDefault();
        
        $(".cover").show();
        $(".create-room").show();
        $(".create-room #name").focus();
        
        currentOverlay = ".create-room";
      
    });
    
    $(".message .ok").click( function(event){
        
        event.preventDefault();
        
        $(".message").hide();
        $(".cover").hide();
        
        currentOverlay = null;
        
    } );
    
    $(".create-room .create").click( function(event){
        
        event.preventDefault();
        
        var roomname = $(".create-room #name").val();
        
        if( roomname.length < ROOM_MIN_LENGTH || roomname.length > ROOM_MAX_LENGTH ){
            
            $(".create-room").errorMessage( ["Room name needs to be between", ROOM_MIN_LENGTH, "and", ROOM_MAX_LENGTH, "characters long."].join(" "), $(".create-room #name") );
            
            
            return;
        }
        
        
        forum.createRoom( roomname, function(err, channel) {
            if (err) {
                messagePrompt( "Error", err );
                return;
            }
            
            $(".cover").hide();
            $(".create-room").hide();
            $(".create-room #name").val("");
            
            joinRoom( channel, function(err, userlist){
                if( err ){
                    messagePrompt( "Error", err );
                    return;
                }
                
                $(".content .info").remove();
                
                if( userlist ){
                    
                    $(".content ul").html("");
                    $(".content").statusMessage(["You joined the room <strong>",roomname,"</strong>."].join("") );
                    
                }
                
                $("#message-form input").focus();
                
            });
            
        });
    });
    
    $(".create-room .cancel").click( function(event){
        
        event.preventDefault();
        
        $(".cover").hide();
        $(".create-room").hide();
        
        $(".create-room #name").val("");
        
    } );
    
    
    $(".login #login-form").submit(function(event) {
    
        event.preventDefault();
        
        var nick = $(".login #nick").val();
        var email = $(".login #email").val();
        var hash = MD5(email);
        
        if( nick.length > NICK_MAX_LENGTH || nick.length < NICK_MIN_LENGTH  ){
            
            $(".login").errorMessage(["Nickname needs to be between", NICK_MIN_LENGTH, "and", NICK_MAX_LENGTH,"characters long."].join(" "), $(".login #nick") );
          
            return;
        }
        
        forum.joinLobby(nick, hash, function(err) {
            
            if (err) {
                messagePrompt( "Error", err );
                return;
            }
            
            $(".profile").updateProfile( nick, hash );
            
            forum.getRoomList(function(err, rooms) {
                
                if (err) {
                    messagePrompt( "Error", err );
                    return;
                }
                
                for( var i = 0, l = rooms.length; i < l; i++ ){
                    
                    $(".menu").addRoom( rooms[i].channel, rooms[i].title, rooms[i].count );
                }
            
            });
            
            $(".login").hide();
            $(".cover").hide();
        
        });
    });
    
    $('#message-form').submit(function(event) {
        event.preventDefault();
        var input = $("input", this);
        
        if (input.val()) {
            
            if( forum.currentChannel() ){
            
                forum.postMessage( input.val() );
            
                input.val("");
                
            }else{
                messagePrompt( "Message", "You need to enter a room before you can start sending messages." );
            }
        }
    });
    
    $("#message-form input").keydown( function(){
        
        if( !typingsent ){
            
            typingsent = true;
            
            forum.postTyping();
            
            setTimeout( function(){
                typingsent = false;
            }, 1000 );
            
        }
        
    });
    
    
    $(".menu ul li a").live( "click", function(event){
        
        event.preventDefault();
        
        $(".menu ul li").removeClass("active");
        
        $(this).parent().addClass("active");
        
        var channel = $(this).attr("data-channel");
        var roomname = $(this).attr("data-title");
        
        joinRoom( channel, function(err, userlist){
            
            if( err ){
                messagePrompt( "Error", err );
                return;
            }
            
            $(".content .info").remove();
            
            if( userlist ){
                
                $(".content ul").html("");
                $(".content").statusMessage(["You joined the room <strong>",roomname,"</strong>."].join("") );
                
            }
            
            $("#message-form input").focus();
            
        } );
        
    } );
    
    $(".cover").click( function(event){
        event.preventDefault();
        
        if( currentOverlay ){
            $(currentOverlay).hide();
            currentOverlay = null;
            $(this).hide();
        }
        
    } );
    
    $(".header .rooms-btn").click( function( event ){
        event.preventDefault();
        
        if(!$(".menu:visible").length > 0 ){
           $(".header .rooms-btn").html("Back");
        }else{
            $(".header .rooms-btn").html("Rooms");
        }
        
        $(".menu").toggle();
        
        
    });
    
    
    $(".login #nick").focus();
    
    $(window).resize( updateSize );
    
    updateSize();
    
});

function joinRoom( id, callback ){
    
    forum.joinRoom(id, function( err, userlist ) {
        if (err) {
          callback( err );
          return;
        }
        
        $(".menu ul li").removeClass("active");
        
        $(".menu ul li a").each( function(){
            
            if( $(this).attr("data-channel") == forum.currentChannel() ){
                
                $(this).parent().addClass("active");
                
                return;
            }
            
        });
        
        if( userlist ){
            $(".avatars ul li").remove();
            $(".avatars").updateUserList( userlist );
        }
        
        callback( null, userlist );
    });
}

function updateSize(){
    
    var w = $(window).width();
    
    if( w < MIN_NORMAL_WIDTH && w > MIN_CONTRACTED_WIDTH ){ // contracted mode
        
        if( displayMode != "contracted" ){
            displayMode = "contracted";
            
            $("body").removeClass( "normal mobile" );
            $("body").addClass( "contracted" );
            $(".menu").show();
            $(".header .rooms-btn").html("Rooms");

        }
    }else if( w <= MIN_CONTRACTED_WIDTH ){ // mobile mode
        if( displayMode != "mobile" ){
            displayMode = "mobile";
            
            $("body").removeClass( "contracted normal" );
            $("body").addClass( "mobile" );
            $(".menu").hide();
      
        }
    }else{ // normal mode
        if( displayMode != "normal" ){
            displayMode = "normal";
            
            $("body").removeClass( "contracted mobile" );
            $("body").addClass( "normal" );
            $(".menu").show();
            $(".header .rooms-btn").html("Rooms");
            
        }
    }
}

function messagePrompt( title, message, callback ){
    
    $(".message h4").html( title );
    $(".message p").html( message );
    
    $(".message").show();
    
    $(".cover").show();
    
    currentOverlay = ".message";
    
}

function time() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return (h < 10?'0' + h:h) + ':' + (m < 10?'0' + m:m)  + ':' +(s < 10?'0' + s:s);
}

$.fn.typing = function( user ){
    
    $( "li", $(this) ).each( function(){
        var id = $(this).attr("data-id");
        if( user == id ){
            if( $( ".typing", $(this)).length == 0 ){
                var typewriter = $("<span class='typing'></span>");
                typewriter.hide();
                typewriter.fadeIn("fast").delay(1000).fadeOut( "fast", function(){
                    $(this).remove();
                });
            
                $(this).append(typewriter);
            }
        }
    });
}

$.fn.updateProfile = function( name, hash ){
    
    $("img", $(this)).attr("src", GRAVATAR_URL.replace("%s", hash) );
    $(".alias", $(this)).html( name );
    
    $(this).fadeIn();
    
}

$.fn.updateUserList = function( list, remove ){
    
    var match = false;
    
    $("li",$(this)).each( function(){
        
        var id = $(this).attr("data-id");
        var name = $(this).attr("data-name");
        
        for( var k in list ){
            
            if( list[k].id == id ){
                
                match = true;
                
                if( remove ){
                    $(this).attr("data-id", "-1");
                    $(this).slideUp( function(){
                        $(this).remove();
                    });
                    
                }
                
                return;
            }
        }
        
    });
    
    if( !match ){
        
        for( var k in list ){
            
            var id = list[k].id;
            var nick = list[k].nick;
            var hash = list[k].hash;
            
            var item = $(["<li data-id='",id,"' data-name='",nick,"'><img src='",GRAVATAR_URL.replace('%s', hash),"' /><span>",nick,"</span></li>"].join(""));
            
            item.hide();
            item.fadeIn("fast");
            
            $("ul",$(this)).append( item );
            
        }
   }
}

$.fn.statusMessage = function( message ){
    
    message = message.replace(/<([^>]+)>/g,"");
    
    var msg = $(["<li>",time()," - ",message,"</li>"].join(""));
    
    msg.hide();
    msg.fadeIn("fast");
    
    $("ul", $(this)).append( msg );
    
    $(this).animate( { scrollTop: $(this).prop("scrollHeight") }, 100);
}

$.fn.chatMessage = function(nick, message, profile) {
    
    nick = nick.replace(/<([^>]+)>/g,"");
    message = message.replace(/<([^>]+)>/g,"");
    
    var msg = $(["<li><div class='profile'><img src='",GRAVATAR_URL.replace('%s', profile),"' width='40' height='40'/></div><div class='msg'><div class='body'><h5>",nick," at ",time(),"</h5><p>",message,"</p></div><span class='arrow'></span></div></li>"].join(""));
    
    msg.hide();
    msg.fadeIn("fast");
    
    $("ul", $(this)).append( msg );
    
    $(this).animate( { scrollTop: $(this).prop("scrollHeight") }, 100);
    
};

$.fn.addRoom = function( channel, title, count ) {
    
    var code = ["<li><a href='#' data-channel='",channel,"' data-title='",title,"'><span class='title'>",title,"</span><span class='count'>",count,"</span></a></li>" ].join('');
    
    var roomitem = $(code);
      
    roomitem.hide();
    roomitem.fadeIn("fast");
    
    $("ul", $(this)).append( roomitem );

}

$.fn.errorMessage = function( msg, input ) {
    
    var code = "<div class='error-message'><p></p></div>";
    
    if( $(".error-message", $(this)).length == 0 ){
        $(this).append( code );
    }
    
    $(".error-message p", $(this)).html( msg );
    
    var input_w = input.outerWidth();
    var input_pos = input.position();
    var message_w = $(".error-message", $(this)).outerWidth();
    var message_h = $(".error-message", $(this)).outerHeight();
    
    var x = Math.round( (input_w * .5) - (message_w * .5) ) + input_pos.left;
    var y = Math.round( input_pos.top - (message_h) );
    
    $(".error-message", $(this)).css("left", x );
    $(".error-message", $(this)).css("top", y );
    
    $(".error-message", $(this)).fadeIn("fast").delay(2000).fadeOut("slow");

}


})();