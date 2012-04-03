LOBBY_CHANNEL = 1
ROOM_OFFSET = 2;
MAX_ROOMS = 20
MAX_USERS_PER_ROOM = 20


SCRIPT_ENV = {
  LOBBY_CHANNEL: LOBBY_CHANNEL
  ROOM_OFFSET: ROOM_OFFSET,
  MAX_ROOMS: MAX_ROOMS,
  MAX_USERS_PER_ROOM: MAX_USERS_PER_ROOM
}


open

  channel = LOBBY_CHANNEL
    mode = "e"
      run("./onhandshake.js")
      when = $CODE
        deny($MESSAGE)
      end
      allow($MESSAGE)
    end
    deny("CHANNEL_MUST_BE_OPENED_WITH_EMIT_ONLY")
  end


  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
  channel = (ROOM + ROOM_OFFSET)
    mode = "rwe"
      run("./onjoinroom.js", SCRIPT_ENV)
      when = $CODE
        deny($MESSAGE)
      end
      allow()
    end
    deny("CHANNEL_MUST_BE_OPENED_IN_RWE_MODE")
  end
  }

end


emit

  channel = LOBBY_CHANNEL

    token = match("^create_room")
      run("./api_create_room.js", SCRIPT_ENV)
    end

    token = match("^get_rooms")
      run("./api_get_rooms.js", SCRIPT_ENV)
    end

  end

  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
  channel = (ROOM + ROOM_OFFSET)
    token = "get_user_list"
      run("./api_get_user_list.js", SCRIPT_ENV)
    end
  end
  }
end


close

  for (var ROOM = 1; ROOM <= MAX_ROOMS; ROOM++) {
  channel = (ROOM + ROOM_OFFSET)
    run("./onleaveroom.js")
  end
  }

end