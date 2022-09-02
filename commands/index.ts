import * as discord from 'discord.js';
import * as say from './say';
import * as yt from './yt';
import * as role from './role';
import * as help from './help';
import * as hug from './hug';

interface Command {
    command: (msg: discord.Message,args: string[])=> any | Promise<any>;
    data: {
        name: string,
        description: string,
        usage: string,
        parameters: ({
            name:string,
            description: string
        })[];
    }

}

export const commands: ({[key: string]: Command}) = {
    say,
    yt,
    role,
    help,
    //hug
}