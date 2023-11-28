const Product = require("../models/product");
const Offer = require("../models/offer");
const cron = require("node-cron");
const Category = require('../models/category');

const checkCategoryOffers = async () => {
    console.log("running cron.............!!!");
    try {
        const currentDate = new Date();
        const offers = await Offer.find({ expiryDate: { $lte: currentDate } });

        if (offers.length > 0) {
            const bulkOperations = [];

            for (const offer of offers) {
                const category = await Category.findOne({ name: offer.categoryName });
                const categoryId = category._id;

                const productsToUpdate = await Product.find({ categoryId: categoryId });
                for (const product of productsToUpdate) {
                    bulkOperations.push({
                        updateOne: {
                            filter: { _id: product._id },
                            update: {
                                $set: { descountedPrice: product.beforeOffer },
                                $unset: { beforeOffer: 1 }
                            }
                        }
                    });
                }
                bulkOperations.push({
                    deleteOne: { filter: { _id: offer._id } }
                });
            }
            await Product.bulkWrite(bulkOperations);
        }
    } catch (error) {
        console.error("Error in the cron job:", error);
        throw error;
    }
}

cron.schedule("*/10 * * * *", async () => {
    try {
        console.log("Cron job started...");
        await checkCategoryOffers();
        console.log("Cron job finished.");
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});
