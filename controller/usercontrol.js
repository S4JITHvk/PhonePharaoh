const user =  require("../models/user")
const bcrypt = require("bcrypt");
const sendOTP = require("./otpcontrol");
const OTP = require("../models/otp");
const validation=require("../auth/mailvalidation")
const Products=require("../models/product")
const Brands=require("../models/brand")
const category=require("../models/category")
const Order=require("../models/orders");
const { updateOne } = require("../models/Cart");
const Banner=require("../models/banner")
const wallet =require("../models/wallet")
// Guest View Product
const guest_viewProduct=async(req,res)=>{
    try{   
      const productId = req.params.productId;
      const product= await Products.find({_id:productId});
      res.render('./user/guestviewproduct', { product});
     }catch(error){
      res.status(500).send('internal server error')
     }
  }
//   VIEW ALL PRODUCTS
const guest_shop = async (req, res) => {
  try {
  
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const query = req.query.q || ''; 
    const header=''

    const productQuery = {
      name: { $regex: `^${query}`, $options: 'i' }, 
     
    }; 
    const totalProducts = await Products.countDocuments(productQuery);
    const products = await Products.find(productQuery)
      .skip((page - 1) * limit)
      .limit(limit);
      const totalPages = Math.ceil(totalProducts / limit);
    const categories = await category.find();
    const brands = await Brands.find();
    res.render('./user/guestshop', { viewallProducts: products,  categories, brands, page, limit, totalProducts ,totalPages,header});

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


// VIEW PRODUCT

const viewProduct=async(req,res)=>{
    try{
      const productId = req.params.productId;
      const username =req.session.name;
      const product= await Products.find({_id:productId});
      res.render('./user/viewproducts', { product,username});
     }catch(error){
      res.status(500).send('internal server error')
     }
  }

//   VIEW ALL PRODUCTS
const ShopProduct = async (req, res) => {
  try {
    
    const username = req.session.name;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const query = req.query.q || ''; 
    const header=''

    const productQuery = {
      name: { $regex: `^${query}`, $options: 'i' }, 
     
    }; 
    const totalProducts = await Products.countDocuments(productQuery);
    const products = await Products.find(productQuery)
      .skip((page - 1) * limit)
      .limit(limit);
      const totalPages = Math.ceil(totalProducts / limit);
    const categories = await category.find();
    const brands = await Brands.find();
    res.render('./user/shop', { viewallProducts: products, username, categories, brands, page, limit, totalProducts ,totalPages,header});

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

//   Guest Home
const guest_get=async (req,res)=>{
    try{
    
    const product=await Products.find({})
    const brand=await Brands.find({})
    const banners=await Banner.find({}).limit(3)
    res.render("./user/index",{title:"Guest Home",product,brand,banners})
    }catch(error){
        console.log(error.message);
    }
}

// USER HOME
const userhome_get=async (req,res)=>{
    if(req.session.logged){
        const username = req.session.name;
        const product=await Products.find({})
        const brand=await Brands.find({})
        const banners=await Banner.find({}).limit(3)
        res.render("./user/userhome",{title:"Home",product,username,brand,banners})
    }else{
        res.redirect("/login")
    }
}

// USER SIGNUP
const usersignup_get=(req,res)=>{
    res.render("./user/Signup",{title:"Signup",errmsg:req.flash("errmsg")})
}

const userSignup = async (req,res) => {
    try {
        const checkuserexist = await user.find({ email: req.body.email })
        if (checkuserexist.length == 0) {
            const pass = await bcrypt.hash(req.body.password, 10);
            const data = {
                userName: req.body.name,
                email: req.body.email,
                password: pass,
            }
            req.session.data = data;
            req.session.email = data.email
            req.session.signotp=true;
            req.session.errmsg = null
            res.redirect("/user/otp-senting");
        } else {
            req.flash("errmsg","*User with this email Already exist")
            req.session.errmsg = "user already exist"
            res.redirect('/user/signup')
        }
    } catch (e) {
        console.log(e);
        console.log("signup error");
        req.flash("errmsg","Sorry!!Something went wrong please try again after some times!!")
        console.log("user already exist");
    }
}



// FORGET PASSWORD

const forgotPass = async (req, res) => {
    try{
      
        const checkuserexist=await user.findOne({email:req.body.email})
       
        if(checkuserexist){
            
            const userdata={
                email:checkuserexist.email,
                userName:checkuserexist.userName,
                _id:checkuserexist._id,
            }
            const email=req.body.email
   
            req.session.userdata=userdata;
            req.session.email=email.toString();
           res.redirect("/user/otp-senting") 
        }
        else{
            req.session.errmsg="no email found"
            req.flash("errmsg","*No Email Found")
            res.redirect("/user/forgot-pass");
        }
    }catch(err){
        console.log(err);
        req.session.errmsg="no email found"
       
    }

}

// USER LOGIN
const userlogin_get=(req,res)=>{ 
    try{
    if(req.session.logged){
        res.redirect("/")
    }else{
     res.render("./user/login",{title:"Login",errmsg:req.flash("errmsg"),successmsg:req.flash("successmsg")});
    }
}catch(error){
    console.log(error.message)
}
}

const userLogin = async (req, res) => {
    try {
            
        const checkuserexist = await user.findOne({ email: req.body.email })
        console.log( checkuserexist);
        if( checkuserexist){
        console.log(req.body);
        let isMatch = await bcrypt.compare(
            req.body.password,
            checkuserexist.password
        );
        console.log(isMatch)
        if (isMatch && checkuserexist.ISactive &&!checkuserexist.ISbanned) {
            req.session.name =  checkuserexist.userName;
            req.session.email =  checkuserexist.email;
            req.session.logged = true;
            console.log("Login success");
            res.redirect("/");
        }
        else if(checkuserexist.ISbanned) {
            req.flash("errmsg","Your Account is Disabled By Admin!")
        
            res.render("./user/login",{title:"Login",errmsg:req.flash("errmsg"),successmsg:req.flash("successmsg")});
            console.log("USER BANNED");
        }
        else if(!isMatch){
            req.flash("errmsg","Invalid password")
            res.render("./user/login",{title:"Login",errmsg:req.flash("errmsg"),successmsg:req.flash("successmsg")});
            req.session.errmsg = "Invalid password"
            console.log("password err");
        }}else{
            req.flash("errmsg","User not found ! Register first")
            res.render("./user/login",{title:"Login",errmsg:req.flash("errmsg"),successmsg:req.flash("successmsg")});
            req.session.errmsg = "User not found"
            console.log("User not found");
  }  }catch {
        req.flash("errmsg","*invalid user name or password")
        req.session.errmsg = "invalid user name or password"
        console.log("user not found");
    }
}



// PASS RESET
const forgetpass_get=(req,res)=>{
    req.session.forgot=true
    res.render("./user/forgot-pass",{title:"Forget-pass",errmsg:req.flash("errmsg")})
}
const resetpass=async (req,res)=>{
    try{
       const reset=req.body.reset
    const newpass = await bcrypt.hash(req.body.password, 10);
    const check=await user.findOneAndUpdate({email:reset},{$set:{password:newpass}})
    if(check){
        console.log("password updated")
        req.flash("successmsg", "Successfully Updated Password")
        res.redirect('/login')
    }else{
        res.redirect('/user/forgot-pass')
    }
    }
    catch(e){
        console.log(e)
    }
}


// USER LOGOUT
const logout = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error');
        }
    })
    res.redirect("/")
}
// User Profile

const userProfile = async (req, res) => {
    const email = req.session.email; 
    const username=req.session.name
    try {
        const data = await user.find({ email: email });
     
  
        res.render('./user/profile', { profile: data[0], username });
    } catch (error) {
      console.log('profile error');
       res.render('./error/404')
    }
  };
  
  //view ordered product
  const vieworderedProduct=async(req,res)=>{
  try {
    const username=req.session.name
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate({
      path: 'Items.productId', 
      model: Products,
    });
    if (!order) {
        return res.render('./error/404'); 
    }
    res.render('./user/productDetails', { orderedProducts: order.Items,username });
  
  } catch (error) {
    console.error('Error viewing ordered products:', error);
    res.render('./error/404');
  }
  }
  
  
  //cancel order 

  const cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId);
  
      if (!order) {
        console.log('Order not found');
        return res.render('./error/404');
      }
  
      if (order.Status === "Order Placed" || order.Status === "Shipped") {
        const productsToUpdate = order.Items;
        for (const product of productsToUpdate) {
          const cancelProduct = await Products.findById(product.productId);
       
          if (cancelProduct) {
            cancelProduct.stock += product.quantity;
            await cancelProduct.save();
          }
        }
        if(order.PaymentStatus==="Paid"){
          const userid=order.UserId
          const userExist=await wallet.findOne(
          {userId:userid})
          if (userExist) {
            await wallet.updateOne(
              { userId: userid },
              {
                $inc: { Amount: order.TotalPrice },
                $push: {
                  transactions: {
                    amount: order.TotalPrice,
                    timestamp: Date.now(),
                    type: 'credit',
                  },
                },
              }
            );
          } else {
            const newWallet = new wallet({
              userId: userid,
              Amount: order.TotalPrice,
              transactions: [{
                amount: order.TotalPrice,
                timestamp: Date.now(),
                type: 'credit',
              }],
            });
    
            await newWallet.save();
            console.log("Wallet updated");
            
          }
    
        }
        order.Status = "Cancelled";
        order.PaymentStatus="Refund Completed"
        await order.save();
        return res.redirect("/trackOrder");
      } else {
        console.log("Order cannot be cancelled");
       
      }
    } catch (error) {
      console.error("Error cancelling the order:", error);
      res.render('./error/404');
    }
  };
  
// Cancel order when multiple product
const cancelproduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      const orderId = req.params.orderId;

      const order = await Order.findById(orderId);
      const product = order.Items.find(item => item.productId == productId);
      const productQuantity = product.quantity;
      const products = await Products.findById(productId);
      const newStock = products.stock + productQuantity;
     await Products.findByIdAndUpdate(productId, { stock: newStock });
    
      const originalPrice = products.descountedPrice;
      const percentageToAdd = 2;
      const Price = originalPrice * (1 + percentageToAdd / 100);
      const newPrice=parseInt(Price)
      const result = await Order.updateOne(
        { _id: orderId },
        {
          $pull: { Items: { productId: productId } },
          $inc: { TotalPrice: -newPrice } 
        }
      );

        return res.redirect("/trackOrder");
      
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
//Filter 


const filterProducts = async (req, res) => {
  try {
    const categoryid = req.query.category;
    const brandid = req.query.brand;
    const priceSort = req.query.price;
    const username = req.session.name;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const query = req.query.q || '';
    let header=''
    const productQuery = {};

    if (categoryid) {
      productQuery.categoryId = categoryid;
      const categorys=await category.findById(categoryid)
      header+=categorys.name
    }

    if (brandid) {
      productQuery.brandId = brandid;
      const brand=await Brands.findById(brandid)
      header+=brand.name
    }

    // Sorting by price
    const sortOptions = {};
    if (priceSort === 'a-z') {
      sortOptions.descountedPrice = 1; // Ascending
    } else if (priceSort === 'z-a') {
      sortOptions.descountedPrice = -1; // Descending
    }

    const totalProducts = await Products.countDocuments(productQuery);
    const products = await Products.find(productQuery)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);
    const categories = await category.find();
    const brands = await Brands.find();

    res.render('./user/shop', { viewallProducts: products, username, categories, brands, page, limit, totalProducts, totalPages,header });
  } catch (error) {
    console.log(error);
  }
};


//  Edit address
const edituserAddress=async(req,res)=>{
  try {
    const addressId = req.params.addressId;
    const User = await user.findOne({ email: req.session.email });
    if (!User) {
      return res.render('./error/404'); 
    }
    const addressToEdit = User.Address.id(addressId);

    if (!addressToEdit) {
      return res.render('./error/404'); 
    }
    res.render('./user/editAddress', { address: addressToEdit, username: req.session.name,addressId: addressId });

  } catch (error) {
    console.error('%c Error innedirt address:',error, 'color: red; font-weight: bold;');

  }
}
 //delete address
const deleteAddress = async (req, res) => {
  try {
      const userEmail = req.session.email;
      const User = await user.findOne({ email: userEmail });
      if (!User) {
          return res.status(404).send('User not found');
      }
      const addressId = req.params.addressId; 
      
      const userId = User._id;
      console.log(userId)
      await user.findByIdAndUpdate(userId, { $pull: { Address: { _id: addressId } } });
      console.log("deleted succesfully")
      res.json({success:true})
  } catch (err) {
      console.error('Error deleting address:', err);
     res.render('./error/404')
  }
};

const address=async(req,res)=>{
  try {
    const email=req.session.email;
    const username=req.session.name
    const User = await user.findOne({ email: email });

     if (User) {
      res.render('./user/address', {username, User });
    } else {
      console.log("User not found");
      res.render('error/404');
    }
  } catch (error) {
    console.log(error);
    res.render('error/404')
  }
}
const addaddressProfile=async(req,res)=>{
  try {
    const addressData = {
      Name:req.body.name,
      AddressLane: req.body.Address,
      City: req.body.City,
      Pincode: req.body.Pincode,
      State: req.body.State,
      Mobile: req.body.Mobile,
  };
  const userEmail = req.session.email;
  
  const User = await user.findOne({ email: userEmail });
  if (!User) {
    return res.render('./error/404');
}
  User.Address.push(addressData);
        await User.save();
        return res.redirect('/address');
  
 
  } catch (error) {
    res.render('./error/404')
  }
}

//updateediteduserAddress
const updateediteduserAddress=async(req,res)=>{
try {
  const addressId = req.params.addressId;
    const User = await user.findOne({ email: req.session.email });
    if (!User) {
      return res.render('./error/404'); 
    }
    const addressToEdit = User.Address.id(addressId);

    if (!addressToEdit) {
      return res.render('./error/404'); 
    }
    addressToEdit.Name = req.body.name;
    addressToEdit.AddressLane = req.body.Address;
    addressToEdit.City = req.body.City;
    addressToEdit.Pincode = req.body.Pincode;
    addressToEdit.State = req.body.State;
    addressToEdit.Mobile = req.body.Mobile;

    await User.save();

    res.redirect('/address');

} catch (error) {
  console.error('Error updating user address:', error);
  res.render('error/404');
}
}
// Guest filter
const guestfilterProducts = async (req, res) => {
  try {
    const categoryid = req.query.category;
    const brandid = req.query.brand;
    const priceSort = req.query.price;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const query = req.query.q || '';
   let header=''
    const productQuery = {};

    if (categoryid) {
      productQuery.categoryId = categoryid;
      const categorys=await category.findById(categoryid)
      header+=categorys.name
    }

    if (brandid) {
      productQuery.brandId = brandid;
      const brand=await Brands.findById(brandid)
      header+=brand.name
    }

    // Sorting by price
    const sortOptions = {};
    if (priceSort === 'a-z') {
      sortOptions.descountedPrice = 1; // Ascending
    } else if (priceSort === 'z-a') {
      sortOptions.descountedPrice = -1; // Descending
    }

    const totalProducts = await Products.countDocuments(productQuery);
    const products = await Products.find(productQuery)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);
    const categories = await category.find();
    const brands = await Brands.find();

    res.render('./user/guestshop', { viewallProducts: products, categories, brands, page, limit, totalProducts, totalPages, header });
  } catch (error) {
    console.log(error);
  }
};


const editProfile=async(req,res)=>{
  try {
    const userEmail = req.session.email;
    const newName = req.body.name;
    const newEmail = req.body.email;
    console.log(newName,newEmail)


    const User = await user.findOne({ email: userEmail });
    console.log(User)
    User.userName = newName;
    User.email = newEmail;
    await User.save();
    req.session.name=newName
    if (!User) {
      return res.render('./error/404');
    }

    
    res.json({success:true})
  } catch (error) {
    console.log('Error updating user profile:', error);
    res.json({ success: false, error: 'Failed to update profile' });
  }
}


module.exports = {
    userLogin,
    userSignup,
    forgotPass,
    logout,
    resetpass,
    usersignup_get,
    forgetpass_get,
    userhome_get,
    userlogin_get,
    viewProduct,
    ShopProduct,
    guest_get,
    guest_viewProduct,
    userProfile,
    cancelOrder,
    vieworderedProduct,
    cancelproduct,
    deleteAddress,
    address,
    edituserAddress,
    updateediteduserAddress,
    addaddressProfile,
    guest_shop,
    filterProducts,
    guestfilterProducts,
    editProfile

}