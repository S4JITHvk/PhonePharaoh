const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');

module.exports = {
    generateInvoice: async (orderDetails) => {
        try {
            // Convert OrderDate to local format
            const orderDate = new Date(orderDetails[0].OrderDate);
            const localOrderDate = orderDate.toLocaleDateString();

            var data = {
                "customize": {},
                "images": {
                    "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'Company logo.png'), 'base64'),
                },
                "sender": {
                    "company": "Phone Pharaoh",
                    "address": "Mannarkad",
                    "zip": "673001",
                    "city": "Palakad",
                    "country": "Kerala"
                },
                "client": {
                    "company": orderDetails[0].Address[0].Name,
                    "address": orderDetails[0].Address[0].AddressLane,
                    "zip": orderDetails[0].Address[0].Pincode,
                    "city": orderDetails[0].Address[0].City,
                    "country": orderDetails[0].Address[0].State,
                    "mob no": orderDetails[0].Address[0].Mobile  
                },
                "information": {
                    "Order ID": orderDetails[0]._id,
                    "date": localOrderDate,  // Use the converted local date
                    "invoice date": localOrderDate,
                },
                "products": (orderDetails[0].Items && orderDetails[0].Items.length > 0) ? orderDetails[0].Items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productId.name, 
                    "tax-rate": 2,
                    "price": product.productId.descountedPrice
                })) : [],
                "total": orderDetails[0].totalPrice,   
                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "INR",
                    "tax-notation": "GST",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },
            };

            console.log(data, "========>");
            const result = await easyinvoice.createInvoice(data);

            const filePath = path.join(__dirname, '..', 'public', 'pdf', `${orderDetails[0]._id}.pdf`);
            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};
