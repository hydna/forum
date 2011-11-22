LOBBY_CHANNEL = 1
ROOM_OFFSET = 2;
MAX_ROOMS = 20
MAX_USERS_PER_ROOM = 20

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


  script = "onhandshake"
    path = "./onhandshake.js"
  end


  script = "onjoinroom"
    path = "./onjoinroom.js"
  end


  script = "onleaveroom"
    path = "./onleaveroom.js"
  end


  script = "api_create_room"
    path = "./api_create_room.js"
  end


  script = "api_get_rooms"
    path = "./api_get_rooms.js"
  end


  script = "api_get_user_list"
    path = "./api_get_user_list.js"
  end


end


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


directive = "emit"

  channel = LOBBY_CHANNEL

    token = match("^create_room")
      run("forum:api_create_room")
    end

    token = match("^get_rooms")
      run("forum:api_get_rooms")
    end

  end

  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
  channel = (ROOM + ROOM_OFFSET)
    token = "get_user_list"
      run("forum:api_get_user_list")
    end
  end
  }
end


directive = "close"
  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
  channel = (ROOM + ROOM_OFFSET)
    run("forum:onleaveroom")
  end
  }
end