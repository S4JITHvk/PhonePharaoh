require('../config/DBconnection')
const Offer=require('../models/offer')
const Category=require('../models/category')
const products=require('../models/product')


const categoryOffer=async(req,res)=>{
    try {
        const offer=await Offer.find()
        const date = new Date()
        const categories= await Category.find()
        res.render('admin/categoryoffer',{offer,date,categories})
    } catch (error) {
        console.error('error while rendering the offerlist page:',error)
    }
}


//add category offer
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryName, offerPercentage, expiryDate } = req.body;
        const newOffer = new Offer({
            categoryName,
            offerPercentage,
            expiryDate,
            status: 'Active',
        });
        await newOffer.save();
        const fetchCategoryId = await Category.findOne({ name: categoryName });
        const categoryId = fetchCategoryId._id;
        const productsBeforeOffer = await products.find({ categoryId: categoryId });
        const discountPrices = productsBeforeOffer.map(product => product.descountedPrice);
        const bulkOps = productsBeforeOffer.map((product, index) => {
            const discountPrice = discountPrices [index];
            const offerMultiplier = 1 - offerPercentage / 100;
            const updatedBeforeOffer = discountPrice;
            const updatedDescountedPrice = parseInt(discountPrice * offerMultiplier);
            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            beforeOffer: updatedBeforeOffer,
                            descountedPrice: updatedDescountedPrice,
                        },
                    },
                },
            };
        });
        await products.bulkWrite(bulkOps);
        res.status(201).json({ success: true, message: 'Category offer added successfully' });
    } catch (error) {
        console.error('Error while adding the category offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



//delete offer
const deleteOffer = async (req, res) => {
    try {
        const offerId = req.params.offerId;
        const deletedOffer = await Offer.findById(offerId);
        if (!deletedOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        const { categoryName } = deletedOffer;
        const fetchCategoryId = await Category.findOne({ name: categoryName });
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const categoryId = fetchCategoryId._id;
        const productsBeforeOffer = await products.find({ categoryId });
        const bulkOperations = productsBeforeOffer.map(product => {
            const oldPrice = product.beforeOffer || product.descountedPrice || 0;
            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            descountedPrice: oldPrice,
                        },
                        $unset: { beforeOffer: 1 },
                    },
                },
            };
        });

        await products.bulkWrite(bulkOperations);
        await Offer.findByIdAndDelete(offerId);
        res.json({ success: true, message: 'Offer deleted successfully' });
    } catch (error) {
        console.error('Error deleting offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const EditOffer=async(req,res)=>{
    try {
        const categoryId= req.params.categoryId;
        const offer= await Offer.findOne({_id: categoryId})
        res.render('./admin/editoffer',{offer})
    } catch (error) {
        console.error('error while editing category offer:',error)
    }
 }



 // Update offer
 const updateOffer = async (req, res) => {
    try {
        const { offerPercentage, expiryDate } = req.body;
        let categoryId = req.params.offerId;
        const existingOffer = await Offer.findById(categoryId);
        if (!existingOffer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        existingOffer.offerPercentage = offerPercentage;
        existingOffer.expiryDate = expiryDate;
        await existingOffer.save();
        const fetchCategoryId = await Category.findOne({ name: existingOffer.categoryName });
        if (!fetchCategoryId) {
            return res.status(404).json({ error: 'Category not found' });
        }

        categoryId = fetchCategoryId._id;
        const productsBeforeOffer = await products.find({ categoryId });
        const bulkOperations = productsBeforeOffer.map(product => {
            const discountPrice = product.beforeOffer  || 0;
            const offerMultiplier = 1 - offerPercentage / 100;
            const newDiscountedPrice = Math.floor(offerMultiplier * discountPrice);
            return {
                updateOne: {
                    filter: { _id: product._id },
                    update: {
                        $set: {
                            descountedPrice: newDiscountedPrice,
                        },
                    },
                },
            };
        });

        await products.bulkWrite(bulkOperations);
        res.redirect('/admin/offers');
    } catch (error) {
        console.error('Error while updating the category offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const checkOfferExists = async (req, res) => {
    try {
      const categoryName = req.params.categoryName;
      const existingOffer = await Offer.findOne({ categoryName: categoryName });
      if(existingOffer){
        res.json({ exists: true });
      }else{
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking offer existence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

module.exports={
    categoryOffer,
    addCategoryOffer,
    deleteOffer,
    updateOffer,
    EditOffer,
    checkOfferExists
}