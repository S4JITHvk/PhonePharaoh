const express=require("express")
const admin=express.Router();
const adminControl = require("../controller/admincontrol");
const brandControl=require("../controller/brandControl")
const categoryControl=require("../controller/categoryControl")
const productControl=require("../controller/productControl")
const multer=require("multer")
const crypto=require("crypto");
const adminAuth=require("../middlewares/adminAuth")
const UserAuth=require("../middlewares/userAuth")
const ordercontrol=require('../controller/ordercontrol')
const couponcontrol=require('../controller/couponcontrol')
const bannerControl=require('../controller/bannerControl')
const uploadBanner=require('../middlewares/banner')
const offerControl=require("../controller/offerControl")
// FILE UPLOADS

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/product-images/");
    },
    filename: function (req, file, cb) {
      const randomeString = crypto.randomBytes(3).toString("hex");
      const timestamp = Date.now();
      const uniqueFile = `${timestamp}-${randomeString}`;
      cb(null, uniqueFile + ".png");
    },
  });
  const upload = multer({ storage: storage });
  const uploadFields = [
    { name: "main", maxCount: 1 },
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
  ];
  const categoryFields=[
    { name: "main", maxCount: 1 },
  ]
  


// ADMIN DASHBOARD AND USERS MANAGEMENT
admin.get("/login",UserAuth.userexist,adminAuth.adminExist,adminControl.admin_log)
admin.post("/login",UserAuth.userexist,adminAuth.adminExist,adminControl.admin_validation)
admin.get("/dashboard",adminAuth.verifyadmin,adminControl.admin_dash)
admin.get("/customers",adminAuth.verifyadmin,adminControl.customers_list)
admin.get("/customers/block/:id",adminAuth.verifyadmin,adminControl.customers_block)
admin.get("/customers/unblock/:id",adminAuth.verifyadmin,adminControl.customers_unblock)
admin.post("/customers/search",adminAuth.verifyadmin,adminControl.customers_search)
admin.get("/logout",adminControl.logout)

// ADMIN Categories Management
admin.get('/categories',adminAuth.verifyadmin,categoryControl.category_list)
admin.get("/add-category",adminAuth.verifyadmin,categoryControl.category_add_get)
admin.post("/add-category",adminAuth.verifyadmin,upload.fields(categoryFields),categoryControl.category_add)
admin.get("/category/edit/:id",adminAuth.verifyadmin,categoryControl.category_edit_get)
admin.post("/category/edit/:id",adminAuth.verifyadmin,upload.fields(categoryFields),categoryControl.category_edit)
admin.get("/category/delete/:id",adminAuth.verifyadmin,categoryControl.category_delete);
admin.post("/category/search",adminAuth.verifyadmin,categoryControl.category_search)

// ADMIN Brands Management

admin.get('/brand',adminAuth.verifyadmin,brandControl.brand_list)
admin.get("/add-brand",adminAuth.verifyadmin,brandControl.brand_add_get)
admin.post("/add-brand",adminAuth.verifyadmin,upload.fields(categoryFields),brandControl.brand_add);
admin.get("/brand/edit/:id",adminAuth.verifyadmin,brandControl.brand_edit_get)
admin.post("/brand/edit/:id",adminAuth.verifyadmin,upload.fields(categoryFields),brandControl.brand_edit)
admin.get("/brand/delete/:id",adminAuth.verifyadmin,brandControl.brand_delete);
admin.post("/brand/search",adminAuth.verifyadmin,brandControl.brand_search)

// ADMIN PRODUCTS MANAGEMENT
admin.get("/products",adminAuth.verifyadmin,productControl.product_list)
admin.get("/add-product",adminAuth.verifyadmin,productControl.add_product_get)
admin.post("/products/add-products",adminAuth.verifyadmin, upload.fields(uploadFields), productControl.add_product);
admin.get("/product/edit/:id",adminAuth.verifyadmin,productControl.edit_product)
admin.post("/product_edit/:id", adminAuth.verifyadmin, upload.fields(uploadFields), productControl.edit);
admin.get("/product/delete/:id",adminAuth.verifyadmin,productControl.product_delete);
admin.post("/product/search",adminAuth.verifyadmin,productControl.product_search)
admin.delete('/delete-image/:id/:index',adminAuth.verifyadmin, productControl.deletesingleImage)
// ADMIN ORDERS MANAGEMENT
admin.get('/orders',adminAuth.verifyadmin,ordercontrol.OrderList)
admin.put('/updateOrderStatus/:orderId',adminAuth.verifyadmin,ordercontrol.updateOrderStatus)
admin.get('/orders/details/:orderId',adminAuth.verifyadmin,ordercontrol.viewOrderDetails)
admin.put('/acceptReturnRequest/:orderId',adminAuth.verifyadmin,ordercontrol.returnaccept)
// ADMIN COUPENS MANAGMENT
admin.get('/coupon',adminAuth.verifyadmin,couponcontrol.add_coupon_get)
admin.post('/addCoupon',adminAuth.verifyadmin,couponcontrol.add_coupon)
admin.get('/Couponedit/:couponId',adminAuth.verifyadmin,couponcontrol.edit_coupon_get)
admin.put('/editCoupon',adminAuth.verifyadmin,couponcontrol.edit_coupon)
admin.delete('/deletecoupon/:couponId',adminAuth.verifyadmin,couponcontrol.deletecoupon)
// ADMIN DASHBOARD


admin.get('/count-orders-by-day',adminAuth.verifyadmin, adminControl.getCount)
admin.get('/count-orders-by-month',adminAuth.verifyadmin, adminControl.getCount)
admin.get('/count-orders-by-year',adminAuth.verifyadmin, adminControl.getCount)
admin.get('/latestOrders',adminAuth.verifyadmin, adminControl.getOrdersAndSellers)
admin.post('/download-sales-report',adminAuth.verifyadmin, productControl.genereatesalesReport)
//bannner managemet
admin.get('/bannerManagement',adminAuth.verifyadmin, bannerControl.bannerManagement)
admin.post('/uploadBanner',adminAuth.verifyadmin, uploadBanner.single('image'), bannerControl.uploadBanner)
admin.get('/deleteBanner/:bannerId',adminAuth.verifyadmin, bannerControl.deleteBanner)

// Offers
admin.get('/offers',adminAuth.verifyadmin, offerControl.categoryOffer)
admin.post('/addOffer',adminAuth.verifyadmin, offerControl.addCategoryOffer)
admin.delete('/deleteOffer/:offerId',adminAuth.verifyadmin, offerControl.deleteOffer)
admin.get('/editoffer/:categoryId',adminAuth.verifyadmin, offerControl.EditOffer)
admin.post('/edit-offer/:offerId',adminAuth.verifyadmin, offerControl.updateOffer)
admin.get('/checkOfferExists/:categoryName',adminAuth.verifyadmin, offerControl.checkOfferExists)

module.exports=admin;