const Categories=require("../models/category")
const { ObjectId } = require("mongodb");



// CATEGRIES

const category_list = async (req, res) => {
  const limit= parseInt(req.query.limit) || 8; 
  const page = parseInt(req.query.page) || 1; 

  try {
    const totalCategories = await Categories.countDocuments();
    const totalPages = Math.ceil(totalCategories / limit);

    const categories = await Categories.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("./admin/categories", {
      category: categories,
       page,
      totalPages: totalPages,
      limit
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).send("Internal Server Error");
  }
};

  // ADD CATEGORY
  const category_add_get = (req, res) => {
      res.render("./admin/add-category",{error:""});
  };
  const category_add = async (req, res) => {
    try {
      const main = req.files["main"][0];
      const { Category_name } = req.body;
      const normalizedCategoryName = Category_name.toUpperCase();
      const existingCategory = await Categories.findOne({ name:{ $regex: new RegExp('^' + normalizedCategoryName + '$', 'i') } });
  
      if (existingCategory) {
       
        return res.render('./admin/add-category',{error:"Category Already Exist!!"})
      }
  
      const data = {
        name: normalizedCategoryName,
        images: {
          mainimage: main.filename,
        },
        timeStamp: Date.now(),
      };
  
      const insert = await Categories.insertMany([data]);
      res.redirect("/admin/categories");
    } catch (err) {
      console.log("error found: " + err);
    }
  };
  
  const category_edit_get=async(req,res)=>{
    try {
      const id = req.params.id;
      const category = await Categories.findOne({ _id: id });
     
      res.render("./admin/edit-category", {
        category: category,
      });
    } catch (err) {
      throw err;
    }
  }
  const category_edit = async (req, res) => {
    try {
      const id = req.params.id;
      
      const { Category_name } = req.body;
      const name = Category_name.toUpperCase();
  
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
  
      await Categories.updateOne({ _id: id }, { $set: data });
      res.redirect("/admin/categories");
    } catch (err) {
      throw err;
    }
  };
  
  const category_delete=async (req,res)=>{
    try {
      const id = req.params.id;
      let deleted = await Categories.deleteOne({ _id:id });
      res.redirect("/admin/categories");
    } catch (err) {
      throw err;
    }
  }
  const category_search=async (req,res)=>{
    try {
      const form_data = req.body;
      let category = await Categories.find({
        name: { $regex: "^" + form_data.search, $options: "i" },
      });
      console.log(`Search Data ${category}`);
      res.render("./admin/categories", { category: category });
    } catch (err) {
      throw err;
    }
  }



  module.exports={
    category_add,
    category_edit_get,
    category_edit,
    category_delete,
    category_search,
    category_add_get,
    category_list,
  }