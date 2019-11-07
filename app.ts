require('dotenv').config();

import * as discord from 'discord.js';
import * as Axios from 'axios';
import * as sqlite3_i from 'sqlite3';
import {DatabaseHelper} from './database-helper';
import {ServerHandler} from './server';
import * as commands from './commands';

const sqlite3 = sqlite3_i.verbose();
const db = new sqlite3.Database('cosmobot.db');
const dbh = new DatabaseHelper(db);

db.serialize(async ()=>{
    await dbh.run(`CREATE TABLE IF NOT EXISTS Bio (
        DiscordID TEXT NOT NULL PRIMARY KEY,
        Description TEXT,
        Quote TEXT,
        Job TEXT
    )`);
    await dbh.run(`CREATE TABLE IF NOT EXISTS AvailableRoles (
        RoleID TEXT NOT NULL PRIMARY KEY
    )`);
    await dbh.run(`CREATE TABLE IF NOT EXISTS Sessions (
        UserID TEXT NOT NULL,
        SessionData TEXT NOT NULL
    )`);
});

const axios = Axios.default;

const client = new discord.Client();

client.on('message',async (msg)=>{
    
    // Throw out message if it doens't start with the prefix
    if (msg.content[0] !== process.env.PREFIX) {
        return;
    }


    const content = msg.content.slice(1);
    const [cmd, ...args] = content.split(' ');
    let msg_delete = false;
    if (commands[cmd]) {

        const g = {
            dbh:dbh,
            commands:commands,
            get_role:get_role,
            get_roles:get_roles,
            is_mod:is_mod,
            get_user:get_user
        }

        msg_delete = true;
        const response: string | discord.RichEmbed = await commands[cmd].command(g,msg,args);
        if (response != "") {
            msg.channel.send(response);
        }
    }
    if (msg.deletable && msg_delete === true) {
        await msg.delete();
    }

});

client.login(process.env.TOKEN);

const get_roles = () => {
    const guild = client.guilds.first();
    const roles = guild.roles.array();
    const role_list = [];
    for (const role of roles) {
        role_list.push({id:role.id, name:role.name, color: (role.hexColor == '#000000' ? undefined : role.hexColor)});  // undefined replaces no color
    }
    //console.log(role_list);
    return role_list;
}
const get_role = (role_id: string) => {
    const guild = client.guilds.first();
    const role = guild.roles.find(r => r.id == role_id);
    if (role != null) {
        return {id:role.id, name:role.name, color: (role.hexColor == '#000000' ? undefined : role.hexColor)};
    } else {
        return null;
    }
}

const is_mod = async (user_id:string) => {
    const guild = client.guilds.first();
    const user = await guild.fetchMember(user_id);
    if (user.roles.find(r=>r.id == process.env.MOD_ROLE_ID)) {
        return true;
    } else {
        return false;
    }
}

const get_user = async (user_id:string) =>{
    const guild = client.guilds.first();
    try {
        const user = await guild.fetchMember(user_id);
        return {username:(user.nickname ? user.nickname : user.user.username), avatar:user.user.displayAvatarURL};
    } catch(e) {
        return null;
    }
    
}



const server = new ServerHandler(dbh,{
    get_roles:get_roles,
    get_role:get_role,
    is_mod:is_mod,
    get_user:get_user
});


