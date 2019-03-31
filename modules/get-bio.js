module.exports.description = {
    name:"write-bio",
    description:"Allows users to write their bio for the Friendly Cosmic Station",
    usage:"!get-bio USER",
    parameters:[
        {
            name:"USER",
            description:"Which bio to obtain, specify none to get your own"
        }
    ]
}
module.exports.call = async (client,global,msg,user) => {
    let member;
    if (user) {
        user = user.replace(/[<!@>]+/g,'');
        try {
            member = await msg.guild.fetchMember(user);
        } catch(e) {
            return "The member you specified wasn't found"
        }
    } else {
        user = msg.author.id;
        member = msg.member;
    }


    if (global.bio[user] === undefined) {
        return "The member you specified wasn't found"
    }

    let name = member.displayName;
    let description = global.bio[user].description;
    let quote = global.bio[user].quote;
    let job = global.bio[user].job;
    let avatar = member.user.displayAvatarURL;
    let timestamp = new Date(Date.now());
    
    return {
        embed: {
            title: "--",
            description: `Name: ${name}\nDescription: ${description}\nQuote: ${quote}\nJob: ${job}`,
            color: 8387666,
            timestamp: timestamp.toISOString(),
            thumbnail: {
                url: avatar
            },
            author: {
                name: `${name}'s Bio`,
                icon_url: avatar
            }
        }
    }
}