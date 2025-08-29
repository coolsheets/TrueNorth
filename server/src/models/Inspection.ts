const { Schema, model } = require('mongoose');


const ItemSchema = new Schema({
id: String,
label: String,
status: { type: String, enum: ['ok','warn','fail','na'], default: 'ok' },
notes: String,
photos: [String]
}, { _id: false });


const SectionSchema = new Schema({
name: String,
items: [ItemSchema]
}, { _id: false });


const InspectionSchema = new Schema({
userId: String,
vehicle: {
vin: String,
year: Number,
make: String,
model: String,
trim: String,
odo: Number,
province: String
},
sections: [SectionSchema],
attachments: [String],
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});


module.exports = model('Inspection', InspectionSchema);
