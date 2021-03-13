require('dotenv').config();
import * as discord from 'discord.js';
import * as express from 'express';
import {urlencoded, json} from 'express';


import commands from './commands';
import {firestore} from './firebase';

let ready = false;





let role_collection = 'cosmobot-roles';

const client = new discord.Client();
client.login(process.env.TOKEN);

client.on('ready',async ()=>{
    const guild = client.guilds.cache.first();
    
    if (guild.id == '441976514289074197') {
        role_collection = 'cosmobot-dev-roles';
    }

    guild.roles.cache.array().forEach(async role=>{
        try {
            await firestore.collection(role_collection).doc(role.id).create({
                assignable: false,
                name: role.name,
                color: role.hexColor,
            });
        } catch(e) {
            
        }
    });
    ready = true;
    /*.forEach(async role=>{
        
    });*/
})

client.on('roleCreate',async role=>{
    await firestore.collection(role_collection).doc(role.id).set({
        assignable: false,
        name: role.name,
        color: role.hexColor,
    });

});

client.on('roleUpdate',async role=>{
    await firestore.collection(role_collection).doc(role.id).update({
        name: role.name,
        color: role.hexColor,
    });
});

client.on('roleDelete', async role=>{
    await firestore.collection(role_collection).doc(role.id).delete();
});

client.on('message',async msg=>{
    if (!msg.content.startsWith(process.env.PREFIX)) return;

    const data = msg.content.slice(1).split(' ');
    const cmd = data[0].toLowerCase();
    const args = data.slice(1);

    if (commands[cmd] != undefined) {
        if (msg.deletable) {
            await msg.delete()
        }
        const response = await commands[cmd].command(msg,args);
        if (!!response) {
            msg.channel.send(response);
        }
    }
});


const app = express();
app.listen(process.env.PORT);
app.use(json());
app.use(urlencoded({extended:false}));

app.get('/is-admin/:id',async(req,res)=>{
    if (ready == false) {
        return res.json({
            status:'error',
            reason: 'not ready',
        });
    }
    const guild = client.guilds.cache.first();
    const member = await guild.members.fetch(req.params.id);
    const is_admin = member.roles.cache.some(role=>role.name=='moderator');
    res.json({
        status:'success',
        is_admin,
    });
});