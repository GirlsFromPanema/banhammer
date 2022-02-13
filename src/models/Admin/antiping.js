const { Schema, Types, model } = require("mongoose");

const antiSchema = new Schema({
    id:
    {
        type: String,
    },
    option: { 
        type: Boolean,
        default: false 
    },
}, { timestamps: true });

const Ping = model("antiping", antiSchema);


module.exports = Ping;