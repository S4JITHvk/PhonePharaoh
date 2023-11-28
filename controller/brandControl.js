const Brands=require("../models/brand")
const { ObjectId } = require("mongodb");



// Brands
const brand_list = async (req, res) => {
  const limit = parseInt(req.query.limit) || 8
  const page = parseInt(req.query.page) || 1; 

  try {
    const totalBrands = await Brands.countDocuments();
    const totalPages = Math.ceil(totalBrands / limit );

    const brands = await Brands.find()
      .skip((page - 1) * limit )
      .limit(limit);

    res.render("./admin/Brand", {
      brand: brands,
       page,
      totalPages: totalPages,
      limit 
    });
  } catch (err) {
    console.error("Error fetching brands:", err);
    res.status(500).send("Internal Server Error");
  }
};

  const brand_add_get = (req, res) => {
      res.render("./admin/add-brand",{error:" "});
  };
  
  const brand_add=async(req,res)=>{
    try {
      const main = req.files["main"][0];
      const {
        Brand_name
      } = req.body;
      const normalizedBrandName=Brand_name.toUpperCase()
  const brandexist=await Brands.find({name:{ $regex: new RegExp('^' + normalizedBrandName + '$', 'i') } })
  if(brandexist.length > 0){
   return res.render("./admin/add-brand",{error:"Brand already Exist!!"})
  }else{
      const data = {
        name: normalizedBrandName,
        images: {
          mainimage: main.filename,
        },
        timeStamp:Date.now(),
      };
      const insert = await Brands.insertMany([data]);
      res.redirect("/admin/brand");
    }
    } catch (err) {
      console.log("error found" + err);
    }
  }

  const brand_edit_get=async(req,res)=>{
    try {
      const id = req.params.id;
      const brand = await Brands.findOne({ _id:id});
      res.render("./admin/edit-brand", {
        brand: brand,
      });
    } catch (err) {
      throw err;
    }
  }
  const brand_edit=async(req,res)=>{
    try {
      const id = req.params.id;
      const {
        Brand_name,
      } = req.body;
    const name=Brand_name.toUpperCase()
      const data = {
        name: name,
        timeStamp: Date.now(),
      };
      if (req.files['main']) {
        const main = req.files["main"][0];
        data.images = {
          mainimage: main.filename,
        };
      }
      await Brands.updateOne({ _id:id }, { $set: data });
      res.redirect("/admin/brand");
    } catch (err) {
      throw err;
    }
  };
  const brand_search=async (req,res)=>{
    try {
      const form_data = req.body;
     
      let brand = await Brands.find({
        name: { $regex: "^" + form_data.search, $options: "i" },
      });
    
      res.render("./admin/Brand", { brand: brand });
    } catch (err) {
      throw err;
    }
  }
  const brand_delete=async (req,res)=>{
    try {
      const id = req.params.id;
      let deleted = await Brands.deleteOne({ _id:id });
      res.redirect("/admin/Brand");
    } catch (err) {
      throw err;
    }
  }



  module.exports={
    brand_list,
    brand_add,
    brand_edit_get,
    brand_edit,
    brand_search,
    brand_delete,
    brand_add_get
  }