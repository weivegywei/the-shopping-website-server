import request from 'request-promise';
import { Cart } from '../cart/schema';
//import { GuestCart } from '../guest/schema'
import { Payment } from './paymentSchema';
//import { GuestPayment } from './paymentSchema';
import { User } from '../register/schema';
import { sendEmail } from '../notification/email'
require("dotenv").config();

const clientId = 'AZxNMuwqAKbWvLmuSpYo4Crw2E_eCKH_U1ufS5UL7vObX38rYdJqgyOHIvzmqDHLVnv0Yz67EJFhOE9R';
const secret = process.env.PAYPAL_SECRET;
const paypalApi = 'https://api-m.sandbox.paypal.com';

// Set up the payment:
  // 1. Set up a URL to handle requests from the PayPal button
export const paypalRoute = (app) => app.post('/api/create-payment', async (req, res) => {
    // 2. Call /v1/payments/payment to set up the payment
    try {
      const data = await request.post(paypalApi + '/v1/payments/payment', {
        auth:{
            user: clientId,
            pass: secret
        },
        body: {
            intent: 'sale',
            payer: {
                payment_method: 'paypal'
            },
            transactions: [{
                amount: {
                    total: `${req.body.totalAmount}`,
                    currency: 'EUR'
                }
            }],
            redirect_urls: {
                return_url: 'https://example.com',
                cancel_url: 'https://example.com'
            }
        }, 
        json: true
    });
      res.json({
          id: data.id
      })
    } catch(e) {
      console.log('paypal req error', e);
    }  
})
// Execute the payment:
// 1. Set up a URL to handle requests from the PayPal button.
.post('/api/execute-payment', (req, res) => {
  const paymentID = req.body.paymentID;
  const payerID = req.body.payerID;
  const totalAmount = req.body.totalAmount;
  request.post(paypalApi + '/v1/payments/payment/' + paymentID + '/execute', {
    auth:{
      user: clientId,
      pass: secret
    },
    body: {
      payer_id: payerID,
      transactions:[{
        amount: {
          total: totalAmount,
          currency: 'EUR'
        }
      }]
    },
    json: true
  },(err, response) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500);
    }
    // 4. Return a success response to the client
    res.json({
        status: 'success',
        paymentID,
        payerID,
        totalAmount,
        currency: 'EUR'
      });
  });
});

const saveNewPayment = ({userId, cartId, orderId, payerId, paymentId, amount, currency, status}) => {
  const newPayment = new Payment({
    userId,
    cartId,
    orderId,
    payerId,
    paymentId,
    amount,
    currency,
    status
  });
  return newPayment.save()
};

/* const saveNewGuestPayment = ({guestId, cartId, orderId, payerId, paymentId, amount, currency, status}) => {
  const newGuestPayment = new GuestPayment({
    guestId,
    cartId,
    orderId,
    payerId,
    paymentId,
    amount,
    currency,
    status
  });
  return newGuestPayment.save()
}; */

export const storePaymentRoute = (app) => app.post('/api/store-payment', async(req, res) => {
  const {userId, orderId, payerId, paymentId, amount, currency} = req.body;
  const cartPaid = await Cart.findOne({userId, status: 'active'});
  const user = await User.findOne({_id: userId});
  const emailAddress = user.email;
  const emailSubject = `Your payment for the order${orderId}`
  const emailMessage = `We have recorded your request for the payment of ${amount} euros for your order ${orderId} in My Wei Shop. Payment detail: Order Id: ${orderId} Payment Id: ${paymentId} Amount: ${amount}${currency}`
  const emailHTML = `We have recorded your request for the payment of ${amount} euros for your order ${orderId} in My Wei Shop.<br/> Payment detail: <br/> Order Id: ${orderId}<br/> Payment Id: ${paymentId}<br/> Amount: ${amount}${currency}`
  const paymentObject = await saveNewPayment({userId, cartId: cartPaid._id, orderId, payerId, paymentId, amount, currency, status: 'paid'});
  const newEventObject = {'status': 'paid', 'time': paymentObject.createdAt};
  paymentObject.events.push(newEventObject);
  paymentObject.save();
  sendEmail(emailAddress, emailSubject, emailMessage, emailHTML);
  return res.send(paymentObject);
})

/* export const storeGuestPaymentRoute = (app) => app.post('/api/store-guest-payment', async(req, res) => {
  const {guestId, orderId, payerId, paymentId, amount, currency} = req.body;
  const cartPaid = await GuestCart.findOne({guestId, status: 'active'});
  const paymentObject = await saveNewGuestPayment({guestId, cartId: cartPaid._id, orderId, payerId, paymentId, amount, currency, status: 'paid'});
  const newEventObject = {'status': 'paid', 'time': paymentObject.createdAt};
  paymentObject.events.push(newEventObject);
  paymentObject.save();
  return res.send(paymentObject);
}) */
