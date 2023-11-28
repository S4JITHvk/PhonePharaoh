const verifyUser = (req, res, next) => {
  if (req.session.logged) {
    console.log("Middleware Checking!!!!")
    next();
  } else {
    res.redirect("/guest");
  }
};
  const userexist=(req,res,next)=>{
    if(req.session.logged){
      res.redirect("/")
    }else{
      next()
    }
  }


module.exports = { 
    verifyUser ,
    userexist
};