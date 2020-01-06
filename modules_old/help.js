module.exports.description = {
    name:"help",
    description:"Displays help text for the specified command, or a list of all commands if none is specified",
    usage:"`!help [command]` or `!help`",
    parameters:[
        {
            name:"command",
            description:"(Optional) Which command information will be shown for"
        }
    ]
}
module.exports.call = async (client,global,msg,command) => {
    let timestamp = new Date(Date.now());
    if (command) {
        command = command.toLowerCase();
        if (global.commands[command]) {
            let cmd = global.commands[command].description;
            let f = [];
            if (cmd.parameters) {
                for (let i=0;i<cmd.parameters.length;i++) {
                    f[i] = {
                        name:cmd.parameters[i].name,
                        value:cmd.parameters[i].description
                    };
                }
            }
            let data =  {
                embed:{
                    author:{
                        name:`${global.config.prefix}${command}`
                    },
                    description:`**${cmd.name}:** ${cmd.description}\n**Usage:** ${cmd.usage}`,
                    color: 8387666,
                    timestamp: timestamp.toISOString(),
                    fields:f
                }
            }
            msg.author.send(data);
            return "";
        } else {
            msg.author.send(`Command ${command} was not found. Type \`!help\` for a lsit of commands`)
            return "";
        }
    } else {
        let command_list = Object.keys(global.commands);
        let f = [];
        for (let i=0;i<command_list.length;i++) {
            f[i] = {name:`\`${command_list[i]}\``,value:global.commands[command_list[i]].description.description};
        }
        let data =  {
            embed:{
                author:{
                    name:`Available commands are as follows: `
                },
                color: 8387666,
                timestamp: timestamp.toISOString(),
                fields:f
            }
        }
        //console.log(JSON.stringify(data,null,4));
        msg.author.send(data);
        return "";
    }
}