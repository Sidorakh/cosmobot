
module.exports.description = {
    name:"write-bio",
    description:"Allows users to write their bio for the Friendly Cosmic Station",
    usage:"!write-bio FIELD VALUE",
    parameters:[
        {
            name:"field",
            description:"What part of the bio to write to - valid fields are `name`, `description, `quote`, `job`"
        },
        {
            name:"value",
            description:"What to write into the field"
        }
    ]
}
module.exports.call = async (client,global,msg,field, ...value) => {
    if (!global.bio_fields.includes(field)) return `${field} is not a valid bio field`;
    if (Array.isArray(value)) {
        value = value.join(' ');
    }
    let id = msg.author.id;
    if (global.bio[id] === undefined) {
        global.bio[id] = {
            description:"",
            quote:"",
            job:""
        };
    }
    global.bio[id][field] = value;
    global.bio_save();
    return "";
}