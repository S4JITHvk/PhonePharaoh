const Wishlist = require('../models/wishlist')
const Product = require('../models/product')
const User=require('../models/user')


//add to wishlist
const addtoWishList = async (req, res) => {
  try {
      const userEmail = req.session.email;
      const user = await User.findOne({ email: userEmail });

      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }

      const userId = user._id;
      const productId = req.params.productId;

      const existingItem = await Wishlist.findOne({ userId: userId });

      if (!existingItem) {
          await Wishlist.create({
              userId: userId,
              products: [{ productId: productId }],
          });
          return res.json({ added: true });
      }
      const isProductAlreadyInWishlist = existingItem.products.some(product => product.productId.equals(productId));
      if (!isProductAlreadyInWishlist) {
          await Wishlist.findOneAndUpdate(
              { userId: userId },
              {
                  $addToSet: {
                      products: { productId: productId },
                  },
              }
          );
          return res.json({ added: true });
      } else {
          return res.json({ added: false, message: "Product already in wishlist" });
      }
  } catch (error) {
      console.error("Error in add to wishlist:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


  


//wishlist
const wishList=async(req,res)=>{
    try {
        const username=req.session.name
     const userEmail = req.session.email;
    const user = await User.findOne({ email: userEmail });
    const userId = user._id;
    console.log(userId)
    let wishdata=null
    const user1=await Wishlist.find({ userId: userId })
    if(user1.length>0){
    const wishlist = await Wishlist.find({ userId: userId }).populate('products.productId');
    wishdata=wishlist[0].products
   console.log(wishdata)
  }
    res.render('./user/wishlist', {
        wishdata,
        username
      });
    } catch (error) {
console.log(error)
    }
 }


 const deletefromWishlist=async(req,res)=>{
    try {

        const userEmail=req.session.email;
        const user = await User.findOne({ email: userEmail });
        const userId = user._id;
        const productId= req.params.productId;
        console.log(productId,"=====>id")
          await Wishlist.updateOne(
            { userId:userId },
            {
              $pull: {
                products: {
                  productId: [productId]
                },
              },
            }
          );
        res.json({ success:true});

    } catch (error) {
        console.log(error)
    }
 }
 

 module.exports={
    addtoWishList,
    wishList,
    deletefromWishlist
 }