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
var sendTimeout             = 100;
var msgBuffer               = "";
var currentTimeStamp        = null;
var scroller                = null;

$(window).load( function(){
    
    scroller = new iScroll('content_id', { hScrollbar: false, vScrollbar: true } );
    
});


$(document).ready(function() {

    
    forum.onmessage = function(graph) {
        
        var msgid = [graph.user.id, "-", graph.time].join("");
        
        $("#content_id").chatMessage( msgid, graph.user.nick, graph.message, graph.user.hash );
        
        $("#avatars_id").typing( graph.user.id );
        
        scroller.refresh();
        
    };
    
    forum.onnotif = function(code, message){
        
        switch( code ){
            
            case "user-join": // user joins any channel
                
                if( message.channel == forum.currentChannel() ){
                    
                    $("#content_id").statusMessage( ["<strong>",message.nick,"</strong> just joined this room."].join("") );
                    
                    var user = {};
                    user[message.id] = message;
                    
                    $('#avatars_id').updateUserList( user );
                    
                    scroller.refresh();
                    
                }
                
            break;
            
            case "user-leave": // we know it is our channel?
                
                $("#content_id").statusMessage( ["<strong>",message.nick,"</strong> just left this room."].join("") );
                
                var user = {};
                user[message.id] = message;
                
                $("#avatars_id").updateUserList( user, true );
                
                scroller.refresh(); 
                
            break;
            
            case "room-created":
            
                var info = message.split(',');
                var channel = info[0];
                var title = info[1];
                
                $("#menu_id").addRoom( channel, title, 0 );
            
            break;
            
            case "room-info":
            
                var info = message.split(',');
                var channel = info[0];
                var count = info[1];
                
                $("#menu_id ul li a").each( function(){
                    
                    if( $(this).attr("data-channel") == channel ){
                        
                        $( ".count", $(this)).html( count );
                        
                        return;
                    }
                    
                });
            
            break;
            
            case "room-destroyed":
            
                var channel = message;
                
                $("#menu_id ul li a").each( function(){
                    
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
        
        $("#cover_id").show();
        $("#create_room_id").show();
        $("#create_room_name_id").focus();
        
        currentOverlay = "#create_room_id";
      
    });
    
    $("#message_id .ok").click( function(event){
        
        event.preventDefault();
        
        $("#message_id").hide();
        $("#cover_id").hide();
        
        currentOverlay = null;
        
    } );
    
    $("#create_room_submit_id").click( function(event){
        
        event.preventDefault();
        
        var roomname = $("#create_room_name_id").val();
        
        if( roomname.length < ROOM_MIN_LENGTH || roomname.length > ROOM_MAX_LENGTH ){
            
            $("#create_room_id").errorMessage( ["Room name needs to be between", ROOM_MIN_LENGTH, "and", ROOM_MAX_LENGTH, "characters long."].join(" "), $("#create_room_name_id") );
            
            
            return;
        }
       
        
        forum.createRoom( roomname, function(err, channel) {
            if (err) {
                messagePrompt( "Error", err );
                return;
            }
            
            $("#cover_id").hide();
            $("#create_room_id").hide();
            $("#create_room_name_id").val("");
            
            joinRoom( channel, function(err, userlist){
                if( err ){
                    messagePrompt( "Error", err );
                    return;
                }
                
                $("#content_id .info").remove();
                
                if( userlist ){
                    
                    $("#content_id ul").html("");
                    $("#content_id").statusMessage(["You joined the room <strong>",roomname,"</strong>."].join("") );
                    
                    if( displayMode == "mobile" ){
                        $("#header_id .rooms-btn").html("Rooms");
                        $("#menu_id").hide();
                    }
                    
                    scroller.refresh();
                }
                
                $("#message-form input").focus();
                
            });
            
        });
    });
    
    $("#create_room_cancel_id").click( function(event){
        
        event.preventDefault();
        
        $("#cover_id").hide();
        $("#create_room_id").hide();
        
        $("#create_room_name_id").val("");
        
    } );
    
    
    $("#login_form_id").submit(function(event) {
    
        event.preventDefault();
        
        var nick = $("#login_nick_id").val();
        var email = $("#login_email_id").val().toLowerCase();
        var hash = MD5(email);
        
        if( nick.length > NICK_MAX_LENGTH || nick.length < NICK_MIN_LENGTH  ){
            
            $("#login_id").errorMessage(["Nickname needs to be between", NICK_MIN_LENGTH, "and", NICK_MAX_LENGTH,"characters long."].join(" "), $("#login_nick_id") );
          
            return;
        }
        
        $("#login_loader_id").show();
        
        forum.joinLobby(nick, hash, function(err) {
            
            if (err) {
                messagePrompt( "Error", err );
                $("#login_loader_id").hide();
                return;
            }
            
            $("#profile_id").updateProfile( nick, hash );
            
            forum.getRoomList(function(err, rooms){
                
                if (err) {
                    messagePrompt( "Error", err );
                    return;
                }
                
                for( var i = 0, l = rooms.length; i < l; i++ ){
                    
                    $("#menu_id").addRoom( rooms[i].channel, rooms[i].title, rooms[i].count );
                }
            
            });
            
            $("#login_loader_id").hide();
            
            $("#login_id").hide();
            $("#cover_id").hide();
        
        });
    });
    
    $('#message_form_id').submit(function(event) {
        event.preventDefault();
        var input = $("#message_input_id");
        
        if (input.val()) {
            
            if( forum.currentChannel() ) {
            
                forum.postMessage( input.val(), currentTimeStamp );
                
                currentTimeStamp = null;
                msgBuffer = "";
            
                input.val("");
                
                input.blur();
                
            }else{
                messagePrompt( "Just so you know", "You need to enter a room before you can start sending messages." );
            }
        }
    });
    
    $("#message_form_id input").keyup( function(){
        
        var input = $("#message_form_id input").val();
        
        if( forum.currentChannel() ){
            if( msgBuffer != input ){
                
                if( currentTimeStamp == null ){
                
                    currentTimeStamp = new Date().getTime();
                }

                forum.postMessage( input, currentTimeStamp );
                
                msgBuffer = input;
            }
        }
        
    });
    
    
    $("#menu_id ul li a").live( "click", function(event){
        
        event.preventDefault();
        
        $("#menu_id ul li").removeClass("active");
        
        $(this).parent().addClass("active");
        
        var channel = $(this).attr("data-channel");
        var roomname = $(this).attr("data-title");
        
        joinRoom( channel, function(err, userlist){
            
            if( err ){
                messagePrompt( "Error", err );
                return;
            }
            
            $("#content_id .info").remove();
            
            if( userlist ){
                
                $("#content_id ul").html("");
                $("#content_id").statusMessage(["You joined the room <strong>",roomname,"</strong>."].join("") );
                
                scroller.refresh();
                
            }
            
            if( displayMode == "mobile" ){
                
                $("#header_id .rooms-btn").html("Rooms");
                $("#menu_id").hide();
                
            }else{
            
                $("#message-form input").focus();
            }
            
        } );
        
    } );
    
    $("#cover_id").click( function(event){
        event.preventDefault();
        
        if( currentOverlay ){
            $(currentOverlay).hide();
            currentOverlay = null;
            $(this).hide();
        }
        
    } );
    
    $("a.rooms-btn").click( function( event ){
        event.preventDefault();
        
        if( displayMode == "mobile" ){
        
            if(!$("#menu_id:visible").length > 0 ){
               $("#header_id .rooms-btn").html("Back");
            }else{
               $("#header_id .rooms-btn").html("Rooms");
            }
        
            $("#menu_id").toggle();  
        }
        
        
    });
    
    
    $("#login_nick_id").focus();
    
    $(window).resize( updateSize );
    
    updateSize();
    
});

function joinRoom( id, callback ){
    
    forum.joinRoom(id, function( err, userlist ) {
        if (err) {
          callback( err );
          return;
        }
        
        $("#menu_id ul li").removeClass("active");
        
        $("#menu_id ul li a").each( function(){
            
            if( $(this).attr("data-channel") == forum.currentChannel() ){
                
                $(this).parent().addClass("active");
                
                return;
            }
            
        });
        
        if( userlist ){
            $("#avatars_id ul li").remove();
            $("#avatars_id").updateUserList( userlist );
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
            
            $("#menu_id").show();
            $("#header_id .rooms-btn").html("Rooms");

        }
    }else if( w <= MIN_CONTRACTED_WIDTH ){ // mobile mode
        if( displayMode != "mobile" ){
            displayMode = "mobile";
            
            $("body").removeClass( "contracted normal" );
            $("body").addClass( "mobile" );
            
            $("#menu_id").hide();
      
        }
    }else{ // normal mode
        if( displayMode != "normal" ){
            displayMode = "normal";
            
            $("body").removeClass( "contracted mobile" );
            $("body").addClass( "normal" );
            
            $("#menu_id").show();
            $("#header_id .rooms-btn").html("Rooms");
            
        }
    }
}

function messagePrompt( title, message, callback ){
    
    var msgcontainer = $("#message_id");
    
    $("h4", msgcontainer ).html( title );
    $("p", msgcontainer ).html( message );
    
    msgcontainer.show();
    
    $("#cover_id").show();
    
    currentOverlay = "#message_id";
    
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
}

$.fn.chatMessage = function( id, nick, message, profile) {
    
    if( $(("#"+id), $(this)).length > 0 ){
        
        var target = $("#"+id, $(this));
        
        if( message.length > 0 ){
        
            $("p", target).html( message );
            $("h5", target).html( [nick," at ",time()].join("") );
            
        }else{
            target.fadeOut( "fast", function(){
                target.remove();
            });
        }
        
    }else{
    
        nick = nick.replace(/<([^>]+)>/g,"");
        message = message.replace(/<([^>]+)>/g,"");
    
        var msg = $(["<li id='",id,"'><div class='profile'><img src='",GRAVATAR_URL.replace('%s', profile),"' width='40' height='40'/></div><div class='msg'><div class='body'><h5>",nick," at ",time(),"</h5><p>",message,"</p></div><span class='arrow'></span></div></li>"].join(""));
    
        msg.hide();
        msg.fadeIn("fast");
    
        $("ul", $(this)).append( msg );
    
    }
    
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
    
    var error_msg = $(".error-message", $(this)); 
    
    if( error_msg.length == 0 ){
        $(this).append( code );
    }
    
    $(".error-message p", $(this)).html( msg );
    
    var input_w = input.outerWidth();
    var input_pos = input.position();
    var message_w = error_msg.outerWidth();
    var message_h = error_msg.outerHeight();
    
    var x = Math.round( (input_w * .5) - (message_w * .5) ) + input_pos.left;
    var y = Math.round( input_pos.top - (message_h) );
    
    error_msg.css("left", x );
    error_msg.css("top", y );
    
    error_msg.fadeIn("fast").delay(2000).fadeOut("slow");

}


})();