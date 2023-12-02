const PDFDocument = require("pdfkit");
const moment = require("moment");

// Table Row with Bottom Line
function generateTableRow(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 50, y)
    .text(c2, 90, y)
    .text(c3, 240, y)
    .text(c4, 400, y)
    .text(c5, 0, y, { align: "right" })
    .moveTo(50, y + 15)
    .lineTo(560, y + 15)
    .lineWidth(0.5)
    .strokeColor("#ccc")
    .stroke();
}

// Table row without bottom line
function generateTableRowNoLine(doc, y, c1, c2, c3, c4, c5) {
  doc
    .fontSize(10)
    .text(c1, 100, y)
    .text(c2, 100, y)
    .text(c3, 300, y, { width: 90, align: "right" })
    .text(c4, 600, y, { width: 90, align: "right" })
    .text(c5, 0, y, { align: "right" });
}

// Generating Invoice for customers
const downloadReport = async (orders, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    try {
      const startDateformat = new Date(startDate);
      const doc = new PDFDocument({ margin: 50 });

      const buffers = [];
      doc.on("data", (buffer) => buffers.push(buffer));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (error) => reject(error));

      // Products
      // Footer for the PDF
      doc
        .fontSize(15)
        .text(
            `Sales Report ${
              startDateformat.toLocaleDateString() 
              } to ${
                endDate.toLocaleDateString() 
              }`
              ,
          50,
          50,
          {
            align: "center",
            width: 500,
          }
        );

      const invoiceTableTop = 100;

      // Table Header
      generateTableRow(
        doc,
        invoiceTableTop,
        "SL No",
        "Order ID",
        "User ID",
        "Order Date",
        "Amount"
      );

      let i = 0;
      let sum = 0;
      orders.forEach((x) => {
        var position = invoiceTableTop + (i + 1) * 30;
        sum += x.TotalPrice;
        generateTableRow(
          doc,
          position,
          i + 1,
          x._id,
          x.UserId,
          x.OrderDate.toLocaleDateString(),
          x.TotalPrice
        );
        i++;
      });

      // Summary rows
      const subtotalPosition = invoiceTableTop + orders.length * 30;

      const paidToDatePosition = subtotalPosition + 30;

      const duePosition = paidToDatePosition + 30;
      generateTableRowNoLine(doc, duePosition, "", "", "Total", "", sum);

      // End the document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  downloadReport,
};