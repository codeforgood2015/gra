// Author: Jamar Brooks
var mongoose = require("mongoose");
//var request = require("request");

var standardSchema = mongoose.Schema({
    category: { type: String, required: true },
    item: { type: String },
    question: { type: String, required: true },
    optionList: [{ text: { type: String }, points: { type: Number } }],
    room: { type: String },
    percentagePossible: { type: Boolean },
    ecofacts: { message: { type: String, default: "None currently available" } },
    legislation: { message: { type: String, default: "None currently available" }, zipCodes: [{ type: Number }] },
    rebateincentives: { message: { type: String, default: "None currently available" }, zipCodes: [{ type: Number }] },
    solutions: { message: { type: String, default: "None currently available" } },
    filters: [{ type: String }]
});

// statics
standardSchema.statics.register = function(category, item, question, options, room, callback) {
    var standard = new Standard({
        category: category,
        item: item,
        question: question,
        options: options,
        room: room
    });
    standard.save(callback);
};

var Standard = mongoose.model("Standard", standardSchema);

// validation
var checkType = function (optionsList) {
    console.log(optionsList);
    var valid = optionsList.length > 1;
    if (valid)
    {
        for (var i = 0; i < optionsList.length; i++) {
            if(optionsList[i].points <= 0) {
                valid = false;
                break;
            }
        }
    }
    return valid;
}

//Standard.schema.path("optionList").validate(checkType, "Must have at least two options and all options must have points values >= 0.");

exports.Standard = Standard;