const discord = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const rp = require('request-promise');
const client = new discord.Client();
let global = {};        // to preserve state between functions

global.config = config;
global.commands = [];
let files = fs.readdirSync('./modules/');
for (let i=0;i<files.length;i++) {
    let file = files[i].replace('.js','');
    global.commands[file] = require(`./modules/${file}`)
}
global.bio_fields = ["description","quote","job"];
global.bio = {};
if (fs.existsSync('./bio.json')) {
    let bio_str = fs.readFileSync('./bio.json');
    global.bio = JSON.parse(bio_str);
}

global.bio_save = () => {
    fs.writeFile('./bio.json',JSON.stringify(global.bio,null,4),(err)=>{
        if (err) {
            console.error(err);
        }
    })
}

const express = require('express');
const body_parser = require('body-parser');
const app = express();


app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:false}));

client.on('error',console.error);
client.on('message',async (msg)=>{
    if (msg.content[0] != config.prefix) return;      // return if not a command
    if (msg.author.bot) return;         // return if a bot sent this messsage
    let str = msg.content.substr(1);
    let [cmd, ...args] = str.split(' ');
    cmd = cmd.toLowerCase();
    if (global.commands[cmd] == undefined) {
        msg.channel.send(`${cmd} is not a valid command!`);
        return;
    }
    if (msg.deletable) {
        await msg.delete();
    }
    let result = await global.commands[cmd].call(client,global,msg,...args);
    if (result != "" && result != undefined) {          // if `result` is undefined/blank, don't send anything (it would have been handled)
        msg.channel.send(result);
    }


});

client.on('ready',()=>{
    console.log('Ret-2-Go!');
    lounge_channel = client.guilds.array()[0].channels.find((ch)=>ch.name==='☕lounge_terminal');
});



// Is Live
let is_live = false;
let lounge_channel = undefined;
setInterval(async()=>{
    try {
        //is cosmo live
        var result = await rp({
            url:'https://script.google.com/macros/s/AKfycbzb8RCjC75TxNlIwoKAtbOdJ17ufswwIf-r5BiidCPES8xJPsK9/exec',
            method:'get'
        });
        if(typeof result != 'object') {
            result = JSON.parse(result);
        }
        // if result returns a livestream
        // post the livestream into #general
        // else
        // do nothing
        if (result.items.length > 0 && is_live == false) {
            is_live = true;
            lounge_channel.send(`FriendlyCosmonaut just started streaming, @here! Here's the link:  https://www.youtube.com/watch?v=${result.items[0].id.videoId}`);
        } else if (result.items.length == 0 && is_live == true) {
            is_live = false;
            lounge_channel.send('Thanks for sticking around for the livestream everyone!');
        }
    } catch(e) {
            console.error(e);
    }
},1000*10);

client.login(config.token);
