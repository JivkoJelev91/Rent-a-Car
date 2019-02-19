const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const rentingSchema = new mongoose.Schema({
    user: { type: ObjectId, ref: 'User', required: true },
    car: { type: ObjectId, ref: 'Car' , required: true},
    rentedOn: { type: Date, default: Date.now() },
    days: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
});

const Renting = mongoose.model('Renting', rentingSchema);

module.exports = Renting;