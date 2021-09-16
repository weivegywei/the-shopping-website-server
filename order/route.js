import { Payment } from "../paypal/paymentSchema";
import { GuestPayment } from '../paypal/paymentSchema';
import { Cart } from '../cart/schema';
import { GuestCart } from '../guest/schema'

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

export const listGuestOrderRoute = (app) => app.get('/api/admin/guestorder/list', async(req, res) => {
    const allGuestPayments = await GuestPayment.find();
    return res.json(allGuestPayments);
});

export const getOrderInfoRoute = (app) => app.post('/api/admin/order/info', async(req, res) => {
    let order, orderWithProductInfo;
    if (req.body.guestId) {
        order = await GuestCart.findOne({_id: req.body.cartId});
        orderWithProductInfo = await GuestCart.aggregate([
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
    } else {
        order = await Cart.findOne({_id: req.body.cartId});
        orderWithProductInfo = await Cart.aggregate([
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
    }
    const orderItems = order.cartItems;
    const orderItemsInfo = orderWithProductInfo[0].items;
    const orderInfo = orderItems.map(item => (
        {...orderItemsInfo.find(it => it._id.toString() === item.productId.toString()), ...item}
        ));
    return res.json(orderInfo);
})

export const editOrderStatusRoute = (app) => app.post('/api/admin/order/edit', async(req, res) => {
    const newEventObject = {'status': req.body.status, 'time': new Date()};
    if (req.body.guestId) {
        const guestPaymentUpdate = await GuestPayment.updateOne(
            { _id: req.body.id },
            { $set: { 'status': req.body.status } }
        );
        const guestPaymentObject = await GuestPayment.findOne({_id: req.body.id});
        guestPaymentObject.events.push(newEventObject);
        guestPaymentObject.save();
        return res.send(guestPaymentObject)
    } else {
        const paymentUpdated = await Payment.updateOne(
            { _id: req.body.id },
            { $set: { 'status': req.body.status } }
            );
        const paymentObject = await Payment.findOne({_id: req.body.id});
        paymentObject.events.push(newEventObject);
        paymentObject.save();
        return res.send(paymentObject);
    }
});


