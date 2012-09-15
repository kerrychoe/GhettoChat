$(document).ready(function(){
	
	var socket;
	var pubnub_settings;
	var roomName;
	var roomUrlStr;
	var userData = { name: "(anonymous)" };
	var ROOMNAME_PARAM = "roomname";
	var ENTER_KEY = 13;

	// Clear text fields upon gaining focus
	$('input#messagebox').focus(function(){
		$('input#messagebox').val('');
	});
	
	// Connect to socket
	$('button#button_connect').click(function(){	
		roomName = $('input#text_roomname').val();
		roomUrlStr = url.attr('source') + '?' + ROOMNAME_PARAM + '=' + roomName;
		connect();
	});
	
	function connect() {
			
		// PubNub messaging settings
		pubnub_settings = {
		    channel       : roomName,
		    publish_key   : 'demo',
		    subscribe_key : 'demo',
		    user  	      : userData
		};
		
		// Create socket.io connection on top of pubnub message bus
		socket = io.connect( 'http://pubsub.pubnub.com/events', pubnub_settings );
		
		// OnConnect handler: Update UI with room info and wait for messages
		socket.on('connect', function() {
		    console.log('Connected to room: ' + pubnub_settings.channel);
			$('input#text_roomname').val(roomName);
		    $('div#room_url_val').text(roomUrlStr);
		    $('#button_connect').attr("disabled", "disabled");
		});
		
		// OnDisconnect handler:  Log disconnect
		socket.on('disconnect', function() {
			console.log('Disonnected from room: ' + pubnub_settings.channel);
		});
		
		// OnLeave handler:  User left
		socket.on( 'leave', function(user) {
		    console.log( 'User left room: ', user.data.name );
		} );
		
		// OnJoin handler:  User joined
		socket.on( 'join', function(user) {
		    console.log( 'User joined room: ', user.data.name );
		} );
		
		// OnMessage handler: Show received message in chat box
		socket.on('message', function(obj) {
			var chatbox = $('#chatBox');
			var msg;
			
			// If the message is from current user, left justify.  Otherwise, right justify.
			msg = obj.userData.name + ": " + obj.message;
			chatbox.append("<li>" + msg + "</li><br>");				
			
/*
			if (obj.userData.name == userData.name) {
				msg = obj.userData.name + ": " + obj.message;
				chatbox.append("<li>" + msg + "</li><br>");				
			}
			else {
				msg = obj.message + " :" + obj.userData.name;
				chatbox.append("<li style=\"text-align:right\">" + msg + "</li>");
			}
			
			chatbox.append("<li></li>");
*/
			
			// Scroll chat window to most recent/bottom line
		    chatbox.scrollTop(chatbox.prop('scrollHeight'));
		});		
		
	}
	
	// For users who are invited to chat via parameterized URL, use the purl jQuery plugin to 
	// extract 'roomName' URL parameter (if any) and then connect to that chat room.
	var url = $.url(window.location);
	if(url.attr('query') != undefined && url.param(ROOMNAME_PARAM) != undefined) {
		roomName = url.param(ROOMNAME_PARAM);
		roomUrlStr = url.attr('source');
		connect();
	} 
	
	// Broadcast chat message
	function sendChatMessage() {
	
		// Get the sender's username, if none exists, use "Anonymous".
		userData.name = $('input#text_username').val();
		if ( userData.name == "" ) {
			userData.name = "Anonymous";
		}
			
		var obj = {};
		obj.message = $('input#messagebox').val();
		obj.userData = userData;
		
		if (socket) {
			if (obj.message) {
				socket.send(obj);
			}
		}
		else {
			alert("Whoops!  You're not connected to a room yet!")
		}
		
		// Clear message box contents
		$('input#messagebox').val('');
	}
	
	// Send new message object upon clicking "Send Message" button
	$('button#button_send').click(function(){
		sendChatMessage()
	});	
	
	// Send new message object upon pressing ENTER key
	$(document).keypress(function(e) {
	    if(e.which == ENTER_KEY) {
	        sendChatMessage();
	    }
	});	
		
	
/*
	// Disconnect from channel
	$('button#button_disconnect').click(function(){
		socket.disconnect(userData);
	});	
*/

});
