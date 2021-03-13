import * as discord from 'discord.js';
import {default as axios} from 'axios';


export const command = async(msg: discord.Message,args: string[]):Promise<string> => {
        const results = await axios.get(`${process.env.YOUTUBE_SEARCH}?query=${encodeURIComponent(args.join(' '))}&max_results=1`);
        if (results.data.items && results.data.items.length > 0) {  
            return `https://youtube.com/watch?v=${results.data.items[0].id.videoId}`;
        } else {
            return `No video found for query \`\`${args.join(' ')}\`\``
        }
    };

export const data = {
    name:'yt',
    description:'Searches youtube for a video',
    usage:'`!yt <query>`',
    parameters:[
        {
            name:'query',
            description:'Search terms'
        }
    ]
}