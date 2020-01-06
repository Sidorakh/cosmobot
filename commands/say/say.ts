import * as discord from 'discord.js';
export const command = (g: any,msg: discord.Message,args: string[]):string=>{
    
    return args.join(' ');
}
export const data = {
    name:'say',
    description:'Repeats a user-given string',
    usage:'`!say <WORDS>`',
    parameters:[
        {
            name:'text',
            description:'The text the bot should say'
        }
    ]
}