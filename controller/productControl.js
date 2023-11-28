const Products=require("../models/product")
const { ObjectId } = require("mongodb");
const Categories=require("../models/category")
const Brands=require("../models/brand")
const Order=require("../models/orders")
const pdf = require("../util/salespdf");
// PRODUCTS

const product_list = async (req, res) => {
  const limit= parseInt(req.query.limit) ||8
  const page = parseInt(req.query.page) || 1; 

  try {
    const totalProducts = await Products.countDocuments();
    const totalPages = Math.ceil(totalProducts /limit);

    const products = await Products.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("./admin/admin-product", {
       products,
       page,
       totalPages,
      limit
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal Server Error");
  }
};

  const add_product_get = async (req, res) => {
      const category = await Categories.find();
      const brand = await Brands.find();
      res.render("./admin/add-products", { brand, category });
  };
  
  const add_product = async (req, res) => {
    try {
      const main = req.files["main"][0];
      const img2 = req.files["image1"][0];
      const img3 = req.files["image2"][0];
  
      const {
        Product_Name,
        basePrice,
        descountedPrice,
        brand,
        category,
        Description,
        stock,
        spec1,
        spec2,
        spec3,
      } = req.body;
  

      let CategoryId = (await Categories.findOne({ name: category }))._id;
      let BrandId = (await Brands.findOne({ name: brand }))._id;
      
     
      const data = {
        name: Product_Name,
        images: {
          mainimage: main.filename,
          image1: img2.filename,
          image2: img3.filename,
        },
        description: Description,
        spec1:spec1,
        spec2:spec2,
        spec3:spec3,
        stock: stock,
        basePrice: basePrice,
        descountedPrice: descountedPrice,
        timeStamp: Date.now(),
        brandId:BrandId,
        categoryId:CategoryId,
      };
      const insert = await Products.insertMany([data]);
      res.redirect("/admin/products");
    } catch (err) {
      console.log("error found" + err);
    }
  };
  const edit_product = async (req, res) => {
    try {
      const id = req.params.id;
      const product = await Products.findOne({ _id:id});
   
      const category = await Categories.find(); 
      const brand = await Brands.find();
      res.render("./admin/edit-product", {
        product,
        brand,
        category,
      });
    } catch (err) {
      throw err;
    }
  };

  const edit = async (req, res) => {
    try {
  
      const {
        Product_Name,
        basePrice,
        descountedPrice,
        brand,
        category,
        Description,
        spec1,
        spec2,
        spec3,
        stock,
      } = req.body;
  
      const { main, image1, image2 } = req.files;
    
      
      let categoryId = await Categories.findOne({ name: category });
      let brandId = await Brands.findOne({ name: brand });
  
      const id = req.params.id;
      const existingProduct = await Products.findById({ _id: id });
      const existingImages = existingProduct.images[0];
  
      const updatedImages = {
        mainimage: (main && main[0]) ? main[0].filename : existingImages.mainimage,
        image1: (image1 && image1[0]) ? image1[0].filename : existingImages.image1,
        image2: (image2 && image2[0]) ? image2[0].filename : existingImages.image2,
      };
  
      const data = {
        name: Product_Name,
        description: Description,
        spec1: spec1,
        spec2: spec2,
        spec3: spec3,
        stock: stock,
        basePrice: basePrice,
        descountedPrice: descountedPrice,
        timeStamp: Date.now(),
        brandId: brandId._id,
        categoryId: categoryId._id,
        images: [updatedImages], 
      };
  
      const updated = await Products.updateOne({ _id: id }, { $set: data });
  
  
      res.redirect("/admin/products");
    } catch (err) {
      throw err;
    }
  };
  
  const deletesingleImage = async (req, res) => {
    try {
      const productId = req.params.id;
      const imageIndex = req.params.index;
      const product = await Products.findById(productId);
  
      if (!product) {
        return res.status(404).send('Product not found');
      }
  
      let imageField = '';
      let deletedImage = '';
  
      if (imageIndex === '0') {
        imageField = 'images.0.mainimage';
        deletedImage = product.images[0].mainimage;
      } else if (imageIndex === '1') {
        imageField = 'images.0.image1';
        deletedImage = product.images[0].image1;
      } else if (imageIndex === '2') {
        imageField = 'images.0.image2';
        deletedImage = product.images[0].image2;
      }  else {
        return res.status(404).send('Image not found');
      }
  
      await Products.updateOne({ _id: productId }, { $unset: { [imageField]: 1 } });
  
      return res.status(200).send(`Image '${deletedImage}' deleted successfully`);
    } catch (error) {
      console.error('Error while deleting the product image:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
  const product_delete = async (req, res) => {
    try {
      const id = req.params.id;
      let deleted = await Products.deleteOne({ _id:id });
    
      res.redirect("/admin/products");
    } catch (err) {
      throw err;
    }
  };
  const product_search = async (req, res) => {
    try {
      const form_data = req.body;
    
      let product = await Products.find({
        name: { $regex: "^" + form_data.search, $options: "i" },
      });
      console.log(`Search Data ${product}`);
      res.render("./admin/admin-product", { products: product });
    } catch (err) {
      throw err;
    }
  };

 
  const genereatesalesReport = async (req, res) => {
    try {
      console.log(req.body)
        const startDate = req.body.startDate;
        const format = req.body.downloadFormat;
        const endDate = new Date(req.body.endDate);
        endDate.setHours(23, 59, 59, 999);
        console.log(startDate,format,endDate )
        const orders = await Order.find({
            PaymentStatus: "Paid",
            OrderDate: {
                $gte: startDate,
                $lte: endDate,
            },
        }).populate("Items.productId");

        let totalSales = 0;

        orders.forEach((order) => {
            totalSales += order.TotalPrice || 0;
        });

        pdf.downloadReport(
            req,
            res,
            orders,
            startDate,
            endDate,
            totalSales.toFixed(2),
            format
        );
       
    } catch (error) {
        console.log("Error while generating sales report pdf:", error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};
;
  
  
  
  
  
  

  module.exports={
    add_product,
    edit_product,
    edit,
    product_delete,
    product_search,
    product_list,
    add_product_get ,
    deletesingleImage,
    genereatesalesReport 
  }