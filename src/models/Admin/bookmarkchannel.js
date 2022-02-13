const { Schema, Types, model } = require("mongoose");

const bchannelSchema = new Schema({
    id:
    {
        type: String,
    },
    channel: { 
        type: String, 
    },
}, { timestamps: true });

const Channel = model("bookmarkchannel", bchannelSchema);


module.exports = Channel;