import { Cart } from "./schema";

const saveNewCart = async (userId) => {
    const cart = new Cart({
        userId, 
        status: 'active',
        cartItems:[],
        coupons: []
    })
    return await cart.save();
};

export const getCartRoute = (app) => app.post('/api/cart/get', async(req, res) => {
    //const data = await getOrCreateCart(req.body.userId);
    const a = await Cart.aggregate([
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
    { $match : { $and: [ { userId : req.body.userId }, { status: 'active' } ] } },
    {
        $lookup: {
            from: 'products',
            localField: 'cartItems.prodId',
            foreignField: '_id',
            as: 'items'
        }
    }
]).exec();
    const cartItemsUserSpecArr = a[0].cartItems;
    const cartItemsFullInfoArr = a[0].items;
    const cartItemsArr = cartItemsUserSpecArr.map(item => ({...cartItemsFullInfoArr.find(it => it._id.toString() === item.productId.toString()), ...item}));
    return res.json(cartItemsArr)
});

export const addCartItem = (app) => app.post('/api/cart/add', async(req, res) => {
    const {userId, productId, specificationValue, quantity} = req.body;
    const userCart = await getOrCreateCart(userId);
    const newItem = {productId, specificationValue, quantity};
    if (!userCart.cartItems.length) {
        userCart.cartItems.push(newItem);
    }
    else {
        const cartItemExist = userCart.cartItems.find(item => item.productId === productId && item.specificationValue === specificationValue);
        cartItemExist ? cartItemExist.quantity += Number(quantity) : userCart.cartItems.push(newItem);
    }
    userCart.save();
    return res.json(userCart);
});

export const deleteCartItem = (app) => app.post('/api/cart/delete', async(req, res) => {
    const userCart = await Cart.updateOne(
        { userId: req.body.userId, status: 'active' },
        { $pull: { cartItems: { _id: req.body.cartItemId } } }
      );
    return res.send('Item deleted')
});

export const getCartItemNumberRoute = (app) => app.post('/api/cart/number', async(req, res) => {
    const userCart = await getOrCreateCart(req.body.userId);
    const cartItemNum = userCart.cartItems.reduce((a,b) => a + b.quantity, 0);
    return res.json(cartItemNum)
});

export const changeItemNumber = (app) => app.post('/api/cart/change', async(req, res) => {
    const {userId, cartItemId, quantity} = req.body;
    const userCart = await Cart.updateOne(
        { userId, status: 'active', 'cartItems._id': cartItemId },
        { $set: { 'cartItems.$.quantity': quantity } });
    return res.send('Qty changed')
});

export const changeCartStatus = (app) => app.post('/api/cart/status', async(req, res) => {
    const userCart = await Cart.updateOne(
        { userId: req.body.userId, status: 'active' }, 
        { $set: { 'status': 'closed'} }
    );
    return res.send('Cart status changed')
});

const getOrCreateCart = async(userId) => {
    const userCart = await Cart.findOne({userId, status: 'active'});
    if (userCart) {
        return userCart;
    } else if (!userCart) {
        const newCart = await saveNewCart(userId);
        return newCart;
    }
}
