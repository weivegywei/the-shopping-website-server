const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const mongodbUrl = 'mongodb+srv://user_001:userPasswordForUser001@cluster0.cpgej.mongodb.net/ShoppingWebsite?retryWrites=true&w=majority';
const { registerRoute } = require('./register/route');
const { createProductRoute, adjustProductInventory} = require('./product/create/route');
const { listProductRoute, deleteProductRoute } = require('./product/list/route');
const { homepageProductRoute } = require('./homepage/route');
const { loginAuthenticationRoute } = require('./login/auth');
const { getUserRoute } = require('./store/route');
const { getCartRoute, addCartItem, deleteCartItem, getCartItemNumberRoute, changeItemNumber, changeCartStatus } = require('./cart/route');
const { createManufacturerRoute } = require('./manufacturer/route');
const { homepageProductSearchRoute } = require('./homepage/searchRoute');
const { listFilteredProductRoute, getFiltersRoute, listMenuFilteredProductRoute } = require('./product/filter/route');
const { paypalRoute, storePaymentRoute } = require('./paypal/route');
const { listOrderRoute, editOrderStatusRoute, getOrderInfoRoute } = require('./order/route');
const { editProductRoute } = require('./product/edit/route');
const { fetchManufacturerNameRoute } = require('./product/page/route');

app.use(cors())

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 80, () => {console.log('running my server on ', process.env.PORT)});

mongoose.connect(mongodbUrl, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("mongodb connected")
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

createProductRoute(app);

listProductRoute(app);

homepageProductRoute(app);

registerRoute(app);

loginAuthenticationRoute(app);

getUserRoute(app);

getCartRoute(app);

addCartItem(app);

deleteCartItem(app);

deleteProductRoute(app);

createManufacturerRoute(app);

homepageProductSearchRoute(app);

listFilteredProductRoute(app);

getFiltersRoute(app);

paypalRoute(app);

storePaymentRoute(app);

getCartItemNumberRoute(app);

changeItemNumber(app);

changeCartStatus(app);

adjustProductInventory(app);

listOrderRoute(app);

editOrderStatusRoute(app);

getOrderInfoRoute(app);

editProductRoute(app);

listMenuFilteredProductRoute(app);

fetchManufacturerNameRoute(app);
