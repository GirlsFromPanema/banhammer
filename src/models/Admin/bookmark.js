const { Schema, Types, model } = require("mongoose");

const bookmarkSchema = new Schema({
    userID:
    {
        type: String,
    },
    reason: { 
        type: String, 
    },
}, { timestamps: true });

const Bookmark = model("bookmarked", bookmarkSchema);


module.exports = Bookmark;