const CronJob = require('cron').CronJob;
const mongoose = require('mongoose');
import { GuestCart } from "./guest/schema";

const getTargetDate = () => {
    let currentDate = new Date();
    console.log(currentDate, 'today', currentDate.getDay().toString(), 'dayyy')
    return new Date().getMonth().toString();
}
//currentDate.setMonth(new Date().getMonth() - 1)
const objectIdWithTimestamp = (timestamp) => {
    /* Convert date object to hex seconds since Unix epoch */
    var hexSeconds = Math.floor(timestamp/1000).toString(16);
    console.log(hexSeconds, 'hexSeconds')

    /* Create an ObjectId with that hex timestamp */
    var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");
    return constructedObjectId
}

const clearOutdatedGuestCart = async() => {
    try {
        const tgDate = getTargetDate();
        console.log(tgDate, 'targetDate')
        const outdatedCart = await GuestCart.find({status: 'active', createdAt: { $lte: new Date(tgDate)}});
        const clearGuestCart = await GuestCart.deleteMany({status: 'active', _id: {"$lt": objectIdWithTimestamp(targetDate)}});
        return console.log(outdatedCart, 'outdatedCart');
    } catch (error) {
        console.log('error', error)
    }
    
}

export const cleanGuestCartCron = new CronJob('0 6 1,16 * *', function() {
    console.log('---------------------');
    console.log('Clean older than one month active guest carts in database every two weeks.');
    clearOutdatedGuestCart();
}, null, true);

