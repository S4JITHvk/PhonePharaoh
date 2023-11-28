
const verifyadmin=(req,res,next)=>{
   if((req.session.admin )){
       next()
   }else{
       res.redirect('/admin/login'); 
   }
}

const adminExist=(req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard')
    }else{
     next()
    }
}


module.exports={
   verifyadmin,
   adminExist
}