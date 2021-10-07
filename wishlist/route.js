import { Wishlist } from "./schema";
//const { Wishlist } = require('./schema');

/* type ListItemType = {
    productId: string,
    specificationValue: string
} */

const saveNewWishlist = async(ownerId) => {
    const wishlist = new Wishlist({
        ownerId,
        listItems: []
    })
    return await wishlist.save()
}

const getOrCreateWishlist = async(ownerId) => {
    const wishlist = await Wishlist.findOne({ownerId});
    if (wishlist) {
        return wishlist;
    } else {
        console.log(wishlist, 'did we find wl?')
        const newWishlist = await saveNewWishlist(ownerId);
        console.log(newWishlist)
        return newWishlist
    }
}

export const addWishlistItem = (app) => app.post('/api/wishlist/add', async(req, res) => {
    const { ownerId, productId, specificationValue } = req.body;
    const wishlist = await getOrCreateWishlist(ownerId);
    const newItem = { productId, specificationValue };
    let listItemExist = null;
    if (!wishlist.listItems.length) {
        wishlist.listItems.push(newItem)
    } else {
        listItemExist = wishlist.listItems.find((item) => item.productId === productId && item.specificationValue === specificationValue);
    }
    wishlist.save();
    if (listItemExist) {
        return res.send("This item is already in the list")
    } else {
        wishlist.listItems.push(newItem)
        return res.json(wishlist)
    }    
})

export const getWishlistItemNumber = (app) => app.post('/api/wishlist/number', async(req, res) => {
    try {
        const wishlist = await getOrCreateWishlist(req.body.ownerId);
        return res.json(wishlist.listItems.length)
    } catch (error) {
        console.log(error, 'error in getting wishlist number')
    }
})

export const getWishlistRoute = (app) => app.post('/api/wishlist/get', async(req, res) => {
    try {
        const listItemsObj = await Wishlist.aggregate([
            {
                $addFields: {
                    "listItems.prodId": {
                        $map: {
                            input: "$listItems",
                            as: "r",
                            in: { $toObjectId: "$$r.productId" }
                        }
                    },
                }
            },
            { $match : { ownerId : req.body.ownerId } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'listItems.prodId',
                    foreignField: '_id',
                    as: 'items'
                }
            }
        ]).exec();
        const listItemsUserSpecArr = listItemsObj[0].listItems;
        const listItemsFullInfoArr = listItemsObj[0].items;
        const listItemsArr = listItemsUserSpecArr.map(item => 
            ({...listItemsFullInfoArr.find(it => it._id.toString() === item.productId.toString()), ...item})
        );
    return res.json(listItemsArr)
    } catch (error) {
        console.log(error, 'error in getting wishlist')
    }
})

export const deleteListItem = (app) => app.post('/api/wishlist/delete', async(req, res) => {
    const wishlist = await Wishlist.updateOne(
        { ownerId: req.body.ownerId },
        { $pull: { listItems: { _id: req.body.listItemId } } }
      );
    return res.send('Item deleted')
});
