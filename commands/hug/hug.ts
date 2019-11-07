import * as discord from 'discord.js';
export const command = (g: any,msg: discord.Message,args: string[]):string=>{
    return `\\*hugs <@${msg.author.id}>\\*`
}
export const data = {
    name:'hug',
    description:'Receive a hug from Cosmobot',
    usage:'`!hug`'
}