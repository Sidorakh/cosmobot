const rp = require('request-promise');
module.exports.description = {
    name:"!",
    description:"BIRB",
    usage:"`!!`",
    parameters:[
        {
            name:"!",
            description:"BIRB"
        }
    ]
}
module.exports.call = async (client,global,msg,...args) => {
    let result = await rp({
        url:'https://some-random-api.ml/facts/bird',
        method:'get'
    }).catch((e)=>{msg.channel.send('Error accessing BIRB api');});
    result = JSON.parse(result);
    return result.fact;
    
}