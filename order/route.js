import { Payment } from "../paypal/paymentSchema";
import { Cart } from '../cart/schema';
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
    //console.log(order, 'order');
    const a = await Cart.aggregate([
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
    //console.log(orderItems, '111111111111');
    const orderItemsInfo = a[0].items;
    //console.log(orderItemsInfo, '22222222222');
    const orderInfo = orderItems.map(item => (
        {...orderItemsInfo.find(it => it._id.toString() === item.productId.toString()), ...item}
        ));
    //console.log('orderInfo', orderInfo);
    return res.json(orderInfo);
})

export const editOrderStatusRoute = (app) => app.post('/api/admin/order/edit', async(req, res) => {
    const paymentUpdated = await Payment.updateOne(
        { _id: req.body.id },
        { $set: { 'status': req.body.status } }
        );
    const paymentObject = await Payment.findOne({_id: req.body.id});
    const newEventObject = {'status': req.body.status, 'time': new Date()};
    paymentObject.events.push(newEventObject);
    paymentObject.save();
    return res.send(paymentObject);
});
