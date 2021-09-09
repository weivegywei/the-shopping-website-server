import { GuestCart } from "./schema";

const saveNewGuestCart = async (guestId) => {
    const guestCart = new GuestCart({
        guestId, 
        status: 'active',
        cartItems:[],
        coupons: []
    })
    return await guestCart.save();
};

const getOrCreateGuestCart = async(guestId) => {
    const guestCart = await GuestCart.findOne({guestId, status: 'active'});
    if (guestCart) {
        return guestCart;
    } else if (!guestCart) {
        const newGuestCart = await saveNewGuestCart(guestId);
        return newGuestCart;
    }
}

export const addGuestCartItem = (app) => app.post('/api/guestcart/add', async(req, res) => {
    const {guestId, productId, specificationValue, quantity} = req.body;
    const guestCart = await getOrCreateGuestCart(guestId);
    const newItem = {productId, specificationValue, quantity};
    if (!guestCart.cartItems.length) {
        guestCart.cartItems.push(newItem);
    }
    else {
        const guestCartItemExist = guestCart.cartItems.find(item => item.productId === productId && item.specificationValue === specificationValue);
        guestCartItemExist ? guestCartItemExist.quantity += Number(quantity) : guestCart.cartItems.push(newItem);
    }
    guestCart.save();
    return res.json(guestCart);
});

export const getGuestCartItemNumberRoute = (app) => app.post('/api/guestcart/number', async(req, res) => {
    try {
        const guestCart = await getOrCreateGuestCart(req.body.guestId);
        const guestCartItemNum = guestCart.cartItems.reduce((a,b) => a + b.quantity, 0);
        return res.json(guestCartItemNum)
    } catch (error) {
        res.status(400)
        return res.json({error})
    }
    
});

export const getGuestCartRoute = (app) => app.post('/api/guestcart/get', async(req, res) => {
    const guestCartObj = await GuestCart.aggregate([
//add one new field, map through cartItems to extract all productIds, then put in this new field
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
//find matching cart with userId and 'active' status
    { $match : { $and: [ { guestId : req.body.guestId }, { status: 'active' } ] } },
    {
//lookup from products collection according to productIds from new field, add all info of products found
        $lookup: {
            from: 'products',
            localField: 'cartItems.prodId',
            foreignField: '_id',
            as: 'items'
        }
    }
]).exec();
    const cartItemsUserSpecArr = guestCartObj[0].cartItems;
    const cartItemsFullInfoArr = guestCartObj[0].items;
    const guestCartItemsArr = cartItemsUserSpecArr.map(item => 
        ({...cartItemsFullInfoArr.find(it => it._id.toString() === item.productId.toString()), ...item})
    );
    return res.json(guestCartItemsArr)
});

export const deleteGuestCartItem = (app) => app.post('/api/guestcart/delete', async(req, res) => {
    const guestCart = await GuestCart.updateOne(
        { guestId: req.body.guestId, status: 'active' },
        { $pull: { cartItems: { _id: req.body.cartItemId } } }
      );
    return res.send('Item deleted')
});

export const changeGuestCartItemNumber = (app) => app.post('/api/guestcart/change', async(req, res) => {
    const {guestId, cartItemId, quantity} = req.body;
    const guestCart = await GuestCart.updateOne(
        { guestId, status: 'active', 'cartItems._id': cartItemId },
        { $set: { 'cartItems.$.quantity': quantity } });
    return res.send('Item quantity changed')
});

export const changeGuestCartStatus = (app) => app.post('/api/guestcart/status', async(req, res) => {
    const guestCart = await GuestCart.updateOne(
        { guestId: req.body.guestId, status: 'active' }, 
        { $set: { 'status': 'closed'} }
    );
    return res.send('Cart status changed')
});

