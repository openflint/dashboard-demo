var fling = window.fling || {};

(function () {
    'use strict';

    // namespace which should be equal to sender's.
    DashBoard.NAMESPACE = 'urn:flint:tv.matchstick.demo.dashboard';

    function DashBoard() {
        var self = this;

        // all users
        self.users = {};

        // all user colors
        self.userColors = {};

        // all info colors
        self.infoColors = {};

        // message box total height
        self.textContainerHeight = 0;

        // message item height
        self.textItemHeight = 0;

        // set default message container's height
	    self.setTextMessageBoxHeight();

        // create Recerver manager object which can be used to send messages through messagebus.
        self.dashBoardManager = new ReceiverManagerWrapper('~dashboard');

        // create messagebus which can send/recv namespace related messages
        self.messageBus = self.dashBoardManager.createMessageBus(DashBoard.NAMESPACE);

        // called when receiving messages in the specfic namespace
        self.messageBus.on("message", function (senderId, message) {
            var data = JSON.parse(message);
            ("onMessage" in self) && self.onMessage(senderId, data);
        });

        // callback function, which is called when user entered the game
        self.messageBus.onsenderConnected = self.onSenderConnected.bind(this);

        // called when user left
        self.messageBus.onsenderDisconnected = self.onSenderDisconnected.bind(this);

        // ready to work
        self.dashBoardManager.open();
    }

    // Adds event listening functions to DashBoard.prototype.
    DashBoard.prototype = {

        /**
         * Message received event; determines event message and command, and
         * choose function to call based on them.
         * @param {event} event the event to be processed.
         */
        onMessage: function (senderId, message) {
            console.log('onMessage: ' + message + " senderId:" + senderId);

            if (message.command == 'show') {
                this.onShow(senderId, message);
            } else if (message.command == 'leave') {
                this.onLeave(senderId, message);
            } else if (message.command == 'join') {
                this.onJoin(senderId, message);
            } else {
                console.log('Invalid message command: ' + message.command);
            }
        },

        /**
         * Sender Connected event
         * @param {event} event the sender connected event.
         */
        onSenderConnected: function (event) {
            console.log('onSenderConnected. Total number of senders: ' + Object.keys(this.dashBoardManager.getSenderList()).length);
        },

        /**
         * Sender disconnected event; if all senders are disconnected,
         * closes the application.
         * @param {event} event the sender disconnected event.
         */
        onSenderDisconnected: function (event) {
            console.log('onSenderDisconnected. Total number of senders: ' + Object.keys(this.dashBoardManager.getSenderList()).length);
            if (Object.keys(this.dashBoardManager.getSenderList()).length == 0) {
                window.close();
            }
        },

        /**
         * Show user's message
         *
         * @param {string} senderId
         * @param {string} message
         */
        onShow: function (senderId, message) {
            console.log('****onShow****');

            this.users[senderId] = message.user;

            this.showMessage('say', message.user, message.info);

            this.broadcast('say', message.user, message.info);
        },

        /**
         * Called when user left
         *
         * @param {string} senderId
         * @param {string} message
         */
        onLeave: function (senderId, message) {
            console.log('****OnLeave****');

            delete this.users[senderId];

            this.showMessage('leave', message.user, 'left!');

            this.broadcast('leave', message.user, 'left!');
        },

        /**
         * Called when user entered the room
         *
         * @param {string} senderId
         * @param {string} message
         */
        onJoin: function (senderId, message) {
            console.log('****onJoin****');

            this.users[senderId] = message.user;

            this.showMessage('join', message.user, 'joined!');

            this.broadcast('join', message.user, 'joined!');
        },

        /**
         * broadcast a message to all users on dashboard message bus.
         *
         * @param {string} type message type
         * @param {string} user the user whos send the message.
         * @param {string} message the message to send.
         */
        broadcast: function (type, user, message) {
            this.messageBus.send('{type:' + type + ',user:' + user + ', message:' + message + '}', '*:*');
        },

        /**
         * Get colored info
         *
         * @param {string} info user's message
         * @param {string} color the specified color
         */
        getInfoWithColor: function (info, color) {
            console.log('<font color="' + color + '">' + info + '</font>');
            return '<font color="' + color + '">' + info + '</font>';
        },

        /**
         * Get the specific user color
         *
         * @param {string} user the specific user
         */
        getUserColor: function(user) {
           var color = this.userColors[user];
           if (color == null || typeof(color) == "undefined") {
              this.userColors[user] = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6); // random color
           }

	       return this.userColors[user];
        },

        /**
         * Get the specific info color
         *
         * @param {string} user the specific user
         */
        getInfoColor: function(user) {
           var color = this.infoColors[user];
           if (color == null || typeof(color) == "undefined") {
              this.infoColors[user] = '#'+('00000'+(Math.random()*0x1000000<<0).toString(16)).slice(-6); // random color
           }

	       return this.infoColors[user];
        },

        /**
         * Update user list according to current senders
         *
         * @param {string} activeUser user who is talking now
         */
        updateUsers: function (activeUser) {
            var senderIds = this.dashBoardManager.getSenderList();
            var userNames = null;
            for (var senderId in senderIds) {
                var user = this.users[senderId];
                if (user == activeUser) {
                    user = this.getInfoWithColor(user, 'red');
                }
                if (userNames == null) {
                    userNames = user;
                } else {
                    userNames = user + ', ' + userNames;
                }
            }

            if (userNames != null) {
                $("#users").html(userNames);
            }
        },

        /**
         * Show messages
         *
         * @param {string} type the message type
         * @param {string} user user's name
         * @param {string} info user's message
         */
        showMessage: function (type, user, info) {
            var myDate = new Date();

            if (type == 'say') {
                $('#system_info').html(this.getInfoWithColor(user, 'red') + ' ' + this.getInfoWithColor('is talking', 'blue') + ' on ' + myDate.toLocaleString());

                // ready to insert one li item?
		        var item_num = $("#text_message li").length;
                if (item_num * self.textItemHeight >= self.textContainerHeight) { // all item's height > totoal height?
                    this.doScroll();
                }

		        var li = $("<li>" + this.getInfoWithColor(user, this.getUserColor(user)) + ': ' + this.getInfoWithColor(info, this.getInfoColor(user)) + "</li>");
                $("#text_message").append(li);
            } else if (type == 'join' || type == 'leave') {
                $('#system_info').html(this.getInfoWithColor(user, 'red') + ' ' + this.getInfoWithColor(info, 'blue') + ' on ' + myDate.toLocaleString());

                // ready to insert one li item?
		        var item_num = $("#text_message li").length;
                if (item_num * self.textItemHeight >= self.textContainerHeight) { // all item's height > totoal height?
                    this.doScroll();
                }

		        var li = $("<li>" + this.getInfoWithColor(user, 'red') + ' ' + this.getInfoWithColor(info, 'blue') + "</li>");
                $("#text_message").append(li);
            }

            // update current user's status.
            this.updateUsers(user);
        },

        /**
         * do scroll to remove the first item.
         */
	    doScroll: function (obj) {
	    $("#text_container").find("#text_message").animate({
                marginTop : "-" + self.textItemHeight + "px"   // item height
              },500,function(){
                $(this).css({marginTop : "0px"}).find("li:first").remove();
            });
        },

        /**
         * set message box's height
         */
        setTextMessageBoxHeight: function() {
            self.textItemHeight = $("#text_message").outerHeight();
            self.textContainerHeight = parseInt((($(window).height() - $("#user_list_id").outerHeight() - $("#system_info").outerHeight() - $("#top_split_line").outerHeight() - $("#bottom_split_line").outerHeight() - ($(window).height()*0.03))/$("#text_message").outerHeight()))*$("#text_message").outerHeight();
            console.log("messagebox:" + self.textContainerHeight);
            $("#text_container").height(self.textContainerHeight);
        }
    };

    // Exposes public functions and APIs
    fling.DashBoard = DashBoard;
})();
