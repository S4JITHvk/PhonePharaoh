const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");
const User = require("../models/user");
const session=require("express-session")
const Categories=require("../models/category")
const Brands=require("../models/brand")
const multer = require("multer");
const Products=require("../models/product")
const Superadmin=require("../models/superadmin")
const Order=require("../models/orders")
const moment=require('moment')



// ADMIN LOGIN 

const admin_log= (req,res)=>{
   res.render("./admin/admin-login",{title:"Adminlogin",errmsg:req.flash("errmsg")})
    
}



const admin_validation = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Superadmin.findOne({ email: email });

    if (admin) {
     
      bcrypt.compare(password, admin.password, (err, isMatch) => {
        if (err) {
          console.log(err);
          req.flash("errmsg", "An error occurred during password validation.");
        } else if (!isMatch) {
          req.flash("errmsg", "Wrong Password!");
          res.redirect("/admin/login")
        } else {
          req.session.admin = true;
          res.redirect("/admin/dashboard");
          console.log("ADMIN LOGIN SUCCESSFUL");
        }
      });
    } else {
      
      req.flash("errmsg", "Wrong Email!");
      res.redirect("/admin/login")
    }
  } catch (e) {
    console.log(e);
    req.flash("errmsg", "An error occurred during login.");
  }
};


// ADMIN DASHBOARD
const admin_dash = (req, res) => {
  if(req.session.admin){
    res.render("./admin/admindash");
  }else{
    res.redirect("/admin/login")
  }
      
    
  };
// USER MANAGEMENT
const customers_list = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10 
  const page = parseInt(req.query.page) || 1; 

  try {
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.render("./admin/customers", {
      user: users,
       page,
       totalPages,
       limit
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).send("Internal Server Error");
  }
};

// USER BAN
const customers_block=async(req,res)=>{
  try{
  const id = req.params.id;
  await User.updateOne({ _id: id }, { $set: {"ISbanned":true} });
  res.redirect("/admin/customers");


  }catch(err){
    throw err;
  }
}
// USER UNBAN
const customers_unblock=async(req,res)=>{
  try{
  const id = req.params.id;
  await User.updateOne({ _id: id }, { $set: {"ISbanned":false} });
  res.redirect("/admin/customers");

  }catch(err){
    throw err;
  }
}

// USER SEARCH
const customers_search= async(req,res)=>{
 
 try{
    const data=req.body
  const user = await User.find({userName: { $regex: "^" + data.search, $options: 'i' }});
  res.render("./admin/customers",{user})
}catch(e){
  console.log(e)
}

}

// LOGOUT
  const logout = (req,res) => {
    req.session.destroy((err)=>{
        if(err){
            console.log(err);
            res.send('Error');
        }
    })
  
    res.redirect("/admin/login")
}


// ADMIN DASHBOARD
const getCount=async(req,res)=>{
  try {
    const orders = await Order.find({
      Status: {
        $nin:["returned","Cancelled","Rejected"]
      }
    });

    const orderCountsByDay = {};
    const totalAmountByDay = {};
    const orderCountsByMonthYear = {};
    const totalAmountByMonthYear = {};
    const orderCountsByYear = {};
    const totalAmountByYear = {};
    let labelsByCount;
    let labelsByAmount;
  
    orders.forEach((order) => {

      const orderDate = new Date(order.OrderDate);
      const dayMonthYear = orderDate.toISOString().split('T')[0];
      const monthYear = orderDate.toISOString().split('T')[0].slice(0, 7);
      const year = orderDate.getFullYear();
      
      
      if (req.url === "/count-orders-by-day") {
       
        if (!orderCountsByDay[dayMonthYear]) {
          orderCountsByDay[dayMonthYear] = 1;
          totalAmountByDay[dayMonthYear] = order.TotalPrice
         
         
        } else {
          orderCountsByDay[dayMonthYear]++;
          totalAmountByDay[dayMonthYear] += order.TotalPrice
        }

        const ordersByDay = Object.keys(orderCountsByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            count: orderCountsByDay[dayMonthYear],
          })
        );
     

        const amountsByDay = Object.keys(totalAmountByDay).map(
          (dayMonthYear) => ({
            _id: dayMonthYear,
            total: totalAmountByDay[dayMonthYear],
          })
        );

        

        amountsByDay.sort((a,b)=> (a._id < b._id ? -1 : 1));
        ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

       

        labelsByCount = ordersByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        labelsByAmount = amountsByDay.map((entry) =>
          moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
        );

        dataByCount = ordersByDay.map((entry) => entry.count);
        dataByAmount = amountsByDay.map((entry) => entry.total);
              

      } else if (req.url === "/count-orders-by-month") {
        if (!orderCountsByMonthYear[monthYear]) {
          orderCountsByMonthYear[monthYear] = 1;
          totalAmountByMonthYear[monthYear] = order.TotalPrice;
        } else {
          orderCountsByMonthYear[monthYear]++;
          totalAmountByMonthYear[monthYear] += order.TotalPrice;
        }
      
        const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            count: orderCountsByMonthYear[monthYear],
          })
        );
        const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
          (monthYear) => ({
            _id: monthYear,
            total: totalAmountByMonthYear[monthYear],
          })
        );
       
      
        ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
        labelsByAmount = amountsByMonth.map((entry) =>
          moment(entry._id, "YYYY-MM").format("MMM YYYY")
        );
       
        dataByCount = ordersByMonth.map((entry) => entry.count);
        dataByAmount = amountsByMonth.map((entry) => entry.total);
       
       
      } else if (req.url === "/count-orders-by-year") {
        // Count orders by year
        if (!orderCountsByYear[year]) {
          orderCountsByYear[year] = 1;
          totalAmountByYear[year] = order.TotalPrice;
        } else {
          orderCountsByYear[year]++;
          totalAmountByYear[year] += order.TotalPrice;
        }
      
        const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
          _id: year,
          count: orderCountsByYear[year],
        }));
        const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
          _id: year,
          total: totalAmountByYear[year],
        }));
      
        ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
        amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
      
        labelsByCount = ordersByYear.map((entry) => entry._id);
        labelsByAmount = amountsByYear.map((entry) => entry._id);
        dataByCount = ordersByYear.map((entry) => entry.count);
        dataByAmount = amountsByYear.map((entry) => entry.total);
      }
    });
    
    res.json({ labelsByCount,labelsByAmount, dataByCount, dataByAmount });
    

  } catch (error) {
    console.error("error while chart loading :",error)
  }
}




const getOrdersAndSellers=async(req,res)=>{
try {
  const latestOrders = await Order.find().sort({ _id: -1 }).limit(6);
  const bestSeller = await Order.aggregate([
    {
      $unwind: "$Items",
    },
    {
      $group: {
        _id: "$Items.productId",
        totalCount: { $sum: "$Items.quantity" },
      },
    },
    {
      $sort: {
        totalCount: -1,
      },
    },
    {
      $limit: 6,
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $unwind: "$productDetails",
    },
  ]);
  
  if (!latestOrders || !bestSeller) throw new Error("No Data Found");

  res.json({ latestOrders, bestSeller });


 
} catch (error) {
  console.log("error while fetching the order details in the dashboard",error);
}
}





module.exports={
    admin_log,
    admin_validation,
    admin_dash,
    logout,
    customers_list,
    customers_block,
    customers_unblock,
    customers_search, 
    getOrdersAndSellers,
    getCount,
}