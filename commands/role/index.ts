import * as discord from 'discord.js';
import {firestore} from '../../firebase';

let role_collection = 'cosmobot-roles';

export const command = async (msg: discord.Message,args: string[]):Promise<string>=>{
    if (msg.guild!.id == '441976514289074197') {
        role_collection = 'cosmobot-dev-roles';
    }
    if (msg.guild) {
        const role_query = (await firestore.collection(role_collection).where('assignable','==',true).get()).docs;
        const role_list = [];
        for (const doc of role_query) {
            const data = {id:doc.id,assignable: doc.data().assignable, color: doc.data().color, name: doc.data().name};
            role_list.push(data);
        }
        if (args.length == 0) {
            let i = 1;
            return 'Select a role by typing `!role <name>` or `!role <number>` (without the `<` and `>`)\n' + role_list.map(r=>{return `${i++}. ${r.name}`}).join('\n');
        }
        if (isNaN(parseInt(args.join('')))) {
            
            const role = role_list.find(r=>r.name.toLowerCase().trim() == args.join(' ').toLowerCase().trim());
            if (role == undefined) {
                return `Error: role \`${args.join(' ').toLowerCase()}\` not found`;
            }
            for (const r of role_list) {
                await msg.member!.roles.remove(r.id);
            }
            msg.member!.roles.add(role.id);
            return `Applied role ${role.name} successfully`;

        } else {
            const role = role_list[parseInt(args[0])-1];
            if (role == undefined) {
                return `Error: role \`${args.join(' ').toLowerCase()}\` not found`;
            }
            for (const r of role_list) {
                await msg.member!.roles.remove(r.id);
            }
            msg.member!.roles.add(role.id);
            return `Applied role ${role.name} successfully`;

        }

    } else {
        return "Must use the `!role` command in the FCS server";
    }
    
}
export const data = {
    name:'role',
    description:'Assigns a role to the user or lists available roles',
    usage:'`!role [number|name]`',
    parameters:[
        {
            name:'role',
            description:'(Optional) Either a role name or number'
        }
    ]
}