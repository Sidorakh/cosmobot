let global = {};        // to preserve state between functions
const config = require('./config.json');
global.config = config;
const discord = require('discord.js');
const client = new discord.Client();

const fs = require('fs');
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

client.login(config.token,()=>{
    console.log('Ret-2-Go!');
});