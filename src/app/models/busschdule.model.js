const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const busScheduleSchema = new Schema(
    {
        startpoint: {type: String},
        endpoint: {type: String},
        triptimestart: {type: String},
        triptimeend: {type: String},
        startstation: {type: String},
        endstation: {type: String},
        tripdate: {type: String},
        cartype: {
            type: Schema.Types.ObjectId, 
            ref: 'Car'
        },
        customers: [{
            type: Schema.Types.ObjectId,
            ref: 'Customer'
        }], 
        customerpickedseats: {type: Array}
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('BusSchedule', busScheduleSchema);