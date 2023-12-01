require("../config/DBconnection");
const Cart = require("../models/Cart");
const User = require("../models/user");
const { ObjectId } = require("mongodb");
const product = require("../models/product");

//view cart
const viewCart = async (req, res) => {
  try {
    const email = req.session.email;
    const username = req.session.name;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).render("./error/404");
    }
    const userId = user._id;
    const cart = await Cart.findOne({ userId: userId }).populate(
      "products.productId"
    );
    if (!cart || cart.products.length === 0) {
      return res.render("./user/cart", {
        username: username,
        product: [],
        subtotal: 0,
        total: 0,
        coupon: 0,
        gstAmount: 0,
        totalQuantity: 0,
      });
    }
    const product = cart.products;
    let subtotal = 0;
    let totalQuantity = 0;
    cart.products.forEach((item) => {
      subtotal += item.quantity * item.productId.descountedPrice;
      totalQuantity += item.quantity;
    });
    const gstRate = 0.02;
    const gstAmount = subtotal * gstRate;
    const coupon = "";
    const total = subtotal + gstAmount;
    req.session.totalPrice = total;
    if (coupon) {
      const couponValue = 50;
      total -= couponValue;
    }
    res.render("/user/cart", {
      username: username,
      product: cart.products,
      cart,
      subtotal: subtotal,
      gstAmount: gstAmount.toFixed(2),
      totalQuantity: totalQuantity,
      coupon: coupon,
      total: total,
    });
  } catch (error) {
    console.log("error in view cart", error);
    res.render("./error/404");
  }
};

const addToCart = async (req, res) => {
  try {
    const userEmail = req.session.email;
    const user = await User.findOne({ email: userEmail });
    const userId = user._id;
    const productId = req.params.productId;

    // Fetch product details (name and price)
    const products = await product.findById(productId);
    const productName = products.name;
    const productPrice = products.descountedPrice;

    const check = await Cart.findOne({ userId: userId });

    if (check !== null) {
      const existingCart = check.products.find((item) =>
        item.productId.equals(productId)
      );

      if (existingCart) {
        existingCart.quantity += 1;
      } else {
        const newItem = {
          productId: productId,
          productname: productName,
          productprice: productPrice,
          quantity: 1,
        }
      
      if (products.beforeOffer) {
        const discountPercent = ((products.beforeOffer - products.descountedPrice) / products.beforeOffer) * 100;
        console.log(discountPercent);
        newItem.discountPercent = Math.floor(discountPercent);
      }
  
      check.products.push(newItem);
    }
      await check.save();
      req.flash("msg", "Item added to the cart");
      res.json({ success: true, message: "Item added to the cart" });
    } else {
      const newCart = new Cart({
        userId: userId,
        products: [
          {
            productId: productId,
            productname: productName,
            productprice: productPrice,
            quantity: 1,
            discountPercent: products.beforeOffer ? ((products.beforeOffer - products.descountedPrice) / products.beforeOffer) * 100 : 0,
          },
        ],
      });
    
      await newCart.save();
      res.json({ success: true, message: "Item added to the cart" });
      req.flash("msg", "Item added to the cart");
    }
  } catch (err) {
    console.log(err, "cart error");
    res.status(500).json({
      success: false,
      error: "Failed to add product to the cart",
    });
    req.flash("errmsg", "Sorry, at this moment we can't reach");
    res.render("./error/404");
  }
};


//update quantity
const updateQuantity = async (req, res) => {
  const { productId, quantity, cartId } = req.body;
  try {
    const cart = await Cart.findOne({ _id: cartId }).populate(
      "products.productId"
    );
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    const productInCart = cart.products.find((item) =>
      item.productId.equals(productId)
    );
    if (!productInCart) {
      return res
        .status(404)
        .json({ success: false, error: "Product not found in the cart" });
    }
    productInCart.quantity = quantity;
    await cart.save();
    let subtotal = 0;
    let totalQuantity = 0;
    cart.products.forEach((item) => {
      subtotal += item.quantity * item.productId.descountedPrice;
      totalQuantity += item.quantity;
    });
    console.log(subtotal);
    const gstRate = 0.02;
    const gstAmount = subtotal * gstRate;
    const coupon = "";
    let total = subtotal + gstAmount;
    if (coupon) {
      const couponValue = 50;
      total -= couponValue;
    }
    res.json({
      success: true,
      subtotal: subtotal,
      gstAmount: gstAmount,
      totalQuantity: totalQuantity,
      coupon: coupon,
      total: total,
    });
  } catch (error) {
    console.error("Error updating stock quantity:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to  update stock quantity" });
  }
};

//remove cart
const removeFromCart = async (req, res) => {
  try {
    const { productId, cartId } = req.body;
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    cart.products = cart.products.filter(
      (item) => !item.productId.equals(productId)
    );
    await cart.save();
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing product from the cart:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to remove product from the cart",
      });
  }
};

//get quantity for the add to cart
const getQuantity = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const userId = user._id;
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.json({ success: true, quantity: 0 });
      const totalQuantity = cart.calculateTotalQuantity();
      res.json({ success: true, quantity: totalQuantity });
    }
  } catch (error) {
    console.error("Error fetching cart quantity:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch cart quantity" });
  }
};

module.exports = {
  addToCart,
  viewCart,
  updateQuantity,
  removeFromCart,
  getQuantity,
};