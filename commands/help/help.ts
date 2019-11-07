import * as discord from 'discord.js';

export const command = (g: any,msg: discord.Message,args: string[]):any=>{
    const time = new Date().toISOString();
    let fields = [];
    
    if (args[0]) {
        if (g.commands[args[0]]) {
            const command = g.commands[args[0]].data;
            const embed = {
                embed: {
                    description: command.description,
                    url: "https://cosmobot.redshirt.dev",
                    color: 8038216,
                    timestamp: time,
                    footer: {
                      icon_url: "https://i.imgur.com/evyOso1.png",
                      text: "made with ❤ by Sidorakh"
                    },
                    thumbnail: {
                      url: "https://i.imgur.com/evyOso1.png"
                    },
                    author: {
                      name: args[0],
                      url: "https://cosmobot.redshirt.dev",
                      icon_url: "https://i.imgur.com/evyOso1.png"
                    },
                    fields:[]
                }
            }
            if (command.parameters) {
                for (const param of command.parameters) {
                    fields.push({
                        name:param.name,
                        value:param.description
                    })
                }
            }
            embed.embed.fields = fields;
            msg.author.send(embed);
        }
    } else {
        const embed = {
            embed: {
                url: "https://cosmobot.redshirt.dev",
                color: 8038216,
                timestamp: time,
                footer: {
                  icon_url: "https://i.imgur.com/evyOso1.png",
                  text: "made with ❤ by Sidorakh"
                },
                thumbnail: {
                  url: "https://i.imgur.com/evyOso1.png"
                },
                author: {
                  name: "List of Cosmbot commands",
                  url: "https://cosmobot.redshirt.dev",
                  icon_url: "https://i.imgur.com/evyOso1.png"
                },
                fields:[]
            }
        }
        const keys =  Object.keys(g.commands);
        for (let i=0;i<keys.length;i++) {
            const command = g.commands[keys[i]].data;
            fields.push({name:`\`${command.name}\``,value:command.description});
        }
        embed.embed.fields = fields;
        msg.author.send(embed);
    }
    return "";
}
export const data = {
    name:'help',
    description:'Shows help: either a list of all commands, or help for a specific command',
    usage:'`!help [command]`',
    parameters:[
        {
            name:'command',
            description:'(Optional) Command to look up help for'
        }
    ]
}