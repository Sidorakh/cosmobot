import * as discord from 'discord.js';
export const command = async (g: any,msg: discord.Message,args: string[]):Promise<string>=>{
    if (msg.guild) {
        const role_list_stmt = await g.dbh.all('SELECT * FROM AvailableRoles ORDER BY RoleID');
        const role_id_list = [];
        const role_list = [];
        for (let i=0;i<role_list_stmt.length;i++) {
            const role = g.get_role(role_list_stmt[i].RoleID);
            role_list.push(role);
            role_id_list.push(role.id);
        }
        if (args.length == 0) {
            let msg = 'Select a role by typing `!role <name>` or `!role <number>`\n';
            for (let i=0;i<role_list.length;i++) {
                const role = role_list[i];
                if (role) {
                    msg += `${i+1}. ${role.name}\n`;
                }
            }
            return msg;
        } else {
            const role_arg = args.join(' ');
            const role_num = parseInt(role_arg);
            let role;
            let role_id: string = undefined;
            if (isNaN(role_num)) {
                role = role_list.find(r=>r.name.toLowerCase() == role_arg.toLowerCase().trim());
                role_id = role.id;
            } else {
                if (role_num-1 < role_list.length && role_num > 0) {
                    role = role_list[role_num-1];
                    role_id = role.id;
                }
            }
            if (role_id == undefined) {
                return `Invalid name or ID provided: \`\`${role_arg}\`\``
            } else {
                for (const id of role_id_list) {
                    await msg.member.removeRole(id);
                }
                await msg.member.addRole(role_id);
                return `Role ${role.name} added successfully`;
            }

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