import { Payment } from "../paypal/paymentSchema";
import { Cart } from '../cart/schema';
import { sendEmail } from '../notification/email'

const mongoose = require('mongoose');

export const listOrderRoute = (app) => app.get('/api/admin/order/list', async(req, res) => {
    const allPaymentsWithUserInfo = await Payment.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'userInfo'
            }
        }
    ]).exec();
    return res.json(allPaymentsWithUserInfo);
});

export const getOrderInfoRoute = (app) => app.post('/api/admin/order/info', async(req, res) => {
    const order = await Cart.findOne({_id: req.body.cartId});
    const orderWithProductInfo = await Cart.aggregate([
        { $match: { _id : mongoose.Types.ObjectId(req.body.cartId) } },
        {
            $addFields: {
                "cartItems.prodId": {
                    $map: {
                        input: "$cartItems",
                        as: "r",
                        in: { $toObjectId: "$$r.productId" }
                    }
                },
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: 'cartItems.prodId',
                foreignField: '_id',
                as: 'items'
            }
        }
    ]).exec();
    
    const orderItems = order.cartItems;
    const orderItemsInfo = orderWithProductInfo[0].items;
    const orderInfo = orderItems.map(item => (
        {...orderItemsInfo.find(it => it._id.toString() === item.productId.toString()), ...item}
        ));
    return res.json(orderInfo);
})

export const editOrderStatusRoute = (app) => app.post('/api/admin/order/edit', async(req, res) => {
    const newEventObject = {status: req.body.status, time: new Date()};
    const paymentUpdated = await Payment.updateOne(
        { _id: req.body.id },
        { $set: { 'status': req.body.status } }
        );
    const paymentObject = await Payment.findOne({_id: req.body.id});
    paymentObject.events.push(newEventObject);
    console.log(paymentObject.email, 'email')
    paymentObject.save();
    const emailAddress = paymentObject.email;
    const orderId = paymentObject.orderId
    const emailSubject = `Your order${orderId} has been ${req.body.status}`;
    const emailMessage = `Your order${orderId} has been ${req.body.status}`;
    const emailHTML = `<p>Your order${orderId} has been <b>${req.body.status}</b></p>`
    sendEmail(emailAddress, emailSubject, emailMessage, emailHTML)
    return res.send(paymentObject);
});


