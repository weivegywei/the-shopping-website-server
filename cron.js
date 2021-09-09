const CronJob = require('cron').CronJob;
const mongoose = require('mongoose');
import { GuestCart } from "./guest/schema";

const currentDate = new Date();
const targetDate = currentDate.setMonth(new Date().getMonth() - 1);

const objectIdWithTimestamp = (timestamp) => {
    /* Convert date object to hex seconds since Unix epoch */
    var hexSeconds = Math.floor(timestamp/1000).toString(16);
    console.log(hexSeconds, 'hexSeconds')

    /* Create an ObjectId with that hex timestamp */
    var constructedObjectId = mongoose.Types.ObjectId(hexSeconds + "0000000000000000");
    return constructedObjectId
}

const clearOutdatedGuestCart = async() => {
    const outdatedCart = await GuestCart.find({status: 'active', _id: {"$lt": objectIdWithTimestamp(targetDate)}});
    const clearGuestCart = await GuestCart.deleteMany({status: 'active', _id: {"$lt": objectIdWithTimestamp(targetDate)}});
    console.log(outdatedCart, 'outdatedCart');
    return res.json(clearGuestCart)
}

export const cleanGuestCartCron = new CronJob('* * 1,16 * *', function() {
    console.log('---------------------');
    console.log('Clean older than one month active guest carts in database every two weeks.');
    clearOutdatedGuestCart();
}, null, true);

