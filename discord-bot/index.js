const Discord = require("discord.js");
const config = require("./config.json");
const bot = new Discord.Client();

const ytdl = require("ytdl-core");

const PREFIX = "-";

var servers = {};

bot.on('message', message => {
    let args = message.content.substring(PREFIX.length).split(" ");

    switch (args[0]) {
        case 'play':
            function play(connection, message) {
                var server = servers[message.guild.id];

                if (!server.queue[1]) {
                    server.dispatcher = connection.play(ytdl(server.queue[0], { filter: "audioonly" }));

                    server.dispatcher.on("finish", function() {
                        server.queue.shift();
                        if (server.queue[0]) {
                            play(connection, message);
                        } else {
                            server.queue.push(args[1]);
                        }
                    });
                }
            }

            if (!args[1]) {
                message.channel.send("You need to provide a link!");
                return;
            }

            if (!message.member.voice.channel) {
                message.channel.send("You must be in a channel to play the bot.");
                return;
            }

            if (!servers[message.guild.id]) servers[message.guild.id] = {
                queue: []
            }

            var server = servers[message.guild.id];

            server.queue.push(args[1]);

            if (!message.guild.voiceConnection) message.member.voice.channel.join().then(function(connection) {
                play(connection, message);
            })
            break;

        case 'skip':
            var server = servers[message.guild.id];
            if (server.dispatcher) server.dispatcher.end();
            message.channel.send("Skipping song")
            break;

        case 'stop':
            var server = servers[message.guild.id];
            if (message.guild.voice.connection) {
                for (var i = server.queue.length - 1; i >= 0; i--) {
                    server.queue.splice(i, 2);
                }

                server.dispatcher.end();
                message.channel.send("Stopping song")
            }

    }

    if (message.guild.connection) message.guild.voice.connection.disconnect();
})


bot.login(config.BOT_TOKEN);