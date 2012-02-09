#Simple chat forum with hydna#

A chat forum with rooms. Uses [gravatar](http://gravatar.com/) for profile images.

##Setup##

1. Create an account on: [hydna.com](http://hydna.com/).
2. Enter your resulting details in **forum.js** (**ROOT_URL**).
3. Upload the behavior files and start chatting.


##Forum##

###What is it?###
Forum is an HTML and Javascript chat app with rooms. It uses Gravatar to provide users with a friendly avatar. It’s all static assets and some hydna [hydna.com/documentation/behaviors/introduction/](behaviors), just create a [https://www.hydna.com/account/signup/](hydna account), upload the behavior files and you are in business. It also works on IOS devices. 

[hydna.github.com/forum](Try it out)  

###Highlights###

I am not going to go through all the details building the application, but rather a few key areas that might be unfamiliar territory. 

###Room creation###

What makes the forum app more than just the most basic chat app, is the feature to create rooms. To do this we use behaviors. You can find ours in the behaviors folder.

####behaviors####
- setup.be
- onhandshake.js
- onjoinroom.js
- onleaveroom.js
- api_get_user_list.js
- api_get_rooms.js
- api_create_rooms.js

In **setup.be** we create a cache to hold our rooms and for each room we also create a cache to hold each rooms users. In this demo we have a maximum of 20 rooms with 20 users each, this can of course be changed with the appropriate hydna account settings.

	namespace = "forum"
		cache = "rooms"
	    	max = MAX_ROOMS
	    	size = 100
	  	end

	  	/*
	    Cache contains the following information:

	      - connection id
	      - alias
	      - md5 for gravatar image
  
	  	*/
	  	for (var ROOM = 0; ROOM < MAX_ROOMS; ROOM++) {
	   		cache = "room" + ROOM
	    		max = MAX_USERS_PER_ROOM
	    		size = 60
	  		end
	} 


In this application we have lobby channel and a channel for each room. If the user connects on the lobby channel they are only allowed to emit signals, see the lobby channel as a kind of entry point to create rooms or get a list of available rooms.

On the emit directive we look at the user provided token to see what they want to happen, in this case we have two options, **create_room** and **get_rooms** , this invoke **api_create_room.js** and **api_get_rooms.js** scripts respectively.

	directive = "emit"
		channel = LOBBY_CHANNEL

	    	token = match("^create_room")
	      		run("forum:api_create_room")
	    	end

	    	token = match("^get_rooms")
	      		run("forum:api_get_rooms")
	    	end
	end  


On open on the lobby channel we invoke **onhandshake.js** where we get the **connectionid** for the user and allow the connection. If the user is connecting to a room channel we try to allocate a place for them in the room cache. If the allocation is successful we notify all the other users in that room of their new friend, and allow the connection.

	directive = "open"

	  channel = LOBBY_CHANNEL
	    mode = "e"
	      run("forum:onhandshake")
	    end
	    deny("CHANNEL_MUST_BE_OPENED_WITH_EMIT_ONLY")
	  end


	  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
	  channel = (ROOM + ROOM_OFFSET)
	    mode = "rwe"
	      run("forum:onjoinroom")
	    end
	    deny("CHANNEL_MUST_BE_OPENED_IN_RWE_MODE")
	  end
	  }

	end  


On close we remove the user from the room and also checks if this was the last user in this room we remove the room and notify on the lobby channel what happened, if this is not the last user we notify the other users in the room what user just left.

	directive = "close"
	  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
	  channel = (ROOM + ROOM_OFFSET)
	    run("forum:onleaveroom")
	  end
	  }
	end  

**onleaveroom.js**

	// Find the slotid of connection
	slotid = room.find(new RegExp("^" + connid));


	// Free the slot
	room.dealloc(slotid);


	// Check if current connection was the last user in the room
	if (room.count() == 0) {

	  rooms = resource.load("forum:rooms");

	  // Free the room id slot
	  rooms.dealloc(roomid);

	  // Tell every user that room has been destroyed.
	  message = "notif:room-destroyed " + channel;
	  signal.emitChannel(LOBBY_CHANNEL, message);

	} else {

	  // Tell other users in room that current connection leaved.
	  message = "notif:user-leave " + connid;
	  signal.emitChannel(channel, message);

	  // Tell lobby that room details have changed
	  message = "notif:room-info " + [channel, room.count()].join(",");
	  signal.emitChannel(LOBBY_CHANNEL, message);
	}    

As you can see signals play a large part in notifying users of changes and also invoking functionality in behaviors, like returning a list of users. This way you can achieve quite a alot without needing to have your own server setup.   

In the app

 

###Gravatar###

For avatars we use gravatar, just have “http://www.gravatar.com/avatar/youremail?s=40.jpg”, simple, not very secure but for this demo it’s a nice touch.

###Mobile enabled###

Some final touches with [http://cubiq.org/iscroll-4](iScroll) and [http://cubiq.org/add-to-home-screen](add2home) and we are setup to support IOS devices.

###Benifits###

* All client side, no server functionality needed beyond serving the files.
* Mobile ready, works as it is on an array of mobiles devices as a web app, deploy through [http://phonegap.com/](PhoneGap) to make it into a native app.
* Scale your app as needed, follow usage on your [hydna account page](https://www.hydna.com/account/login/).

We hope this gives a nice introduction to hydna and the power of behaviors, you don't need to use behaviors but as you can see they can be quite powerful. You can of course use our behaviors as a base for you next project, a multiplayer game with room-division perhaps?