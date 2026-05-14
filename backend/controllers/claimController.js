// const Claim = require('../models/Claim');
// const Payment = require('../models/Payment');
// const multer = require("multer");
// const { sendClaimNotificationToAdmin } = require("./mailer"); // adjust path if needed

// // Multer setup for memory storage (can be swapped with diskStorage)
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Export multer middleware to use in routes
// exports.upload = upload.array("bills"); // "bill" is the form field name

// exports.createClaim = async (req, res) => {
//   console.log("📦 File received:", req.file);

//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth() + 1;

//     let financialYearCode = currentMonth >= 4
//       ? `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`
//       : `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;

//     const lastClaim = await Claim.findOne({ claimNumber: { $regex: `^${financialYearCode}/` } }).sort({ claimNumber: -1 });

//     let newClaimNumber;
//     if (lastClaim) {
//       const lastNumber = parseInt(lastClaim.claimNumber.split("/").pop(), 10);
//       const newNumber = (lastNumber + 1).toString().padStart(2, '0');
//       newClaimNumber = `${financialYearCode}/${newNumber}`;
//     } else {
//       newClaimNumber = `${financialYearCode}/01`;
//     }

//     // ✅ Safely parse expenses
//     let parsedExpenses = [];
//     try {
//       parsedExpenses = JSON.parse(req.body.expenses);
//     } catch (err) {
//       console.error("Invalid JSON in expenses:", req.body.expenses);
//       return res.status(400).json({ message: "Invalid format for expenses" });
//     }

//     const claimData = {
//       ...req.body,
//       expenses: parsedExpenses,
//       claimNumber: newClaimNumber,
//       paymentStatus: 'Pending',
//     };

//     if (req.files && req.files.length > 0) {
//       claimData.bills = req.files.map(file => ({
//         data: file.buffer,
//         contentType: file.mimetype,
//         originalName: file.originalname
//       }));
//     }


//     const newClaim = new Claim(claimData);
//     await newClaim.save();

//     // ✅ Add totalExpense for email
//     const totalExpense = claimData.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
//     newClaim.totalExpense = totalExpense;

//     // ✅ Send email to admin
//     await sendClaimNotificationToAdmin(newClaim);

//     res.status(201).json({ message: "Claim with bill saved successfully!", claimNumber: newClaimNumber });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ message: "Error saving claim", error });
//   }
// };


// exports.getNewClaimNumber = async (req, res) => {
//   try {
//     const currentDate = new Date(); // Ensure this is set correctly
//     // const currentDate = new Date("2025-04-01T00:00:00Z"); // Uncomment this for testing
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth() + 1; // JS months are 0-indexed

//     // Determine the financial year dynamically
//     let financialYearCode;
//     if (currentMonth >= 4) {
//       financialYearCode = `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
//     } else {
//       financialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
//     }

//     console.log("🚀 Current Date:", currentDate.toISOString());
//     console.log("📆 Current Year:", currentYear);
//     console.log("📅 Current Month:", currentMonth);
//     console.log("🔢 Calculated Financial Year Code:", financialYearCode);

//     // Fetch the latest claim for the current financial year
//     const lastClaim = await Claim.findOne({ claimNumber: { $regex: `^${financialYearCode}/` } })
//       .sort({ claimNumber: -1 });

//     let newClaimNumber;

//     if (lastClaim) {
//       const lastNumber = parseInt(lastClaim.claimNumber.split("/").pop(), 10);
//       const newNumber = (lastNumber + 1).toString().padStart(2, '0'); // Ensure two-digit format
//       newClaimNumber = `${financialYearCode}/${newNumber}`;
//     } else {
//       newClaimNumber = `${financialYearCode}/01`;
//     }

//     res.status(200).json({ claimNumber: newClaimNumber });
//   } catch (error) {
//     res.status(500).json({ message: "Error generating claim number", error });
//   }
// };


// // exports.getNewClaimNumber = async (req, res) => {
// //   try {
// //     const currentDate = new Date();
// //     const currentYear = currentDate.getFullYear();
// //     const currentMonth = currentDate.getMonth() + 1;

// //     // Determine the financial year dynamically
// //     let financialYearCode;
// //     if (currentMonth >= 4) {
// //       financialYearCode = `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
// //     } else {
// //       financialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
// //     }

// //     console.log("🚀 Current Date:", currentDate.toISOString());
// //     console.log("📆 Current Year:", currentYear);
// //     console.log("📅 Current Month:", currentMonth);
// //     console.log("🔢 Calculated Financial Year Code:", financialYearCode);

// //     // Fetch ALL claims for the current financial year
// //     const claims = await Claim.find({ 
// //       claimNumber: { $regex: `^${financialYearCode}/` } 
// //     }).select('claimNumber');

// //     let newClaimNumber;

// //     if (claims && claims.length > 0) {
// //       // Extract all numeric parts and find the maximum
// //       const numbers = claims.map(claim => {
// //         const parts = claim.claimNumber.split("/");
// //         return parseInt(parts[parts.length - 1], 10);
// //       });
      
// //       const maxNumber = Math.max(...numbers);
// //       const newNumber = (maxNumber + 1).toString().padStart(2, '0');
// //       newClaimNumber = `${financialYearCode}/${newNumber}`;
// //     } else {
// //       newClaimNumber = `${financialYearCode}/01`;
// //     }

// //     console.log("✅ Generated Claim Number:", newClaimNumber);
// //     res.status(200).json({ claimNumber: newClaimNumber });
// //   } catch (error) {
// //     console.error("❌ Error generating claim number:", error);
// //     res.status(500).json({ message: "Error generating claim number", error });
// //   }
// // };



// exports.getAllClaims = async (req, res) => {
//   try {
//     const claims = await Claim.find({});
//     res.status(200).json(claims);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching claims", error });
//   }
// };

// exports.getClaimByNumber = async (req, res) => {
//   try {
//     const claim = await Claim.findOne({ claimNumber: req.params.claimNumber });

//     if (!claim) {
//       return res.status(404).json({ message: "Claim not found" });
//     }

//     res.status(200).json(claim);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching claim", error });
//   }
// };

// exports.getClaimsWithStatus = async (req, res) => {
//   try {
//     const claims = await Claim.find({});

//     const processedClaims = claims.map(claim => {
//       const totalExpense = claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

//       return {
//         ...claim.toObject(),
//         totalExpense,
//         paymentStatus: claim.paymentStatus || 'Pending'
//       };
//     });

//     res.status(200).json(processedClaims);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching claims with status", error });
//   }
// };


// exports.getCombinedReport = async (req, res) => {
//   try {
//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth() + 1;

//     let previousFinancialYearCode, currentFinancialYearCode;

//     if (currentMonth >= 4) {
//       previousFinancialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
//       currentFinancialYearCode = `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
//     } else {
//       previousFinancialYearCode = `CF/${(currentYear - 2).toString().slice(-2)}-${(currentYear - 1).toString().slice(-2)}`;
//       currentFinancialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
//     }

//     console.log("Fetching data for:", currentFinancialYearCode, previousFinancialYearCode);

//     // Fetch claims separately
//     const currentYearClaims = await Claim.find({
//       claimNumber: { $regex: `^${currentFinancialYearCode}/` }
//     });

//     const previousYearClaims = await Claim.find({
//       claimNumber: { $regex: `^${previousFinancialYearCode}/` }
//     });

//     console.log("Current Year Claims:", currentYearClaims.length);
//     console.log("Previous Year Claims:", previousYearClaims.length);

//     // Fetch all payments
//     const payments = await Payment.find({});
//     const paymentLookup = {};
//     payments.forEach(payment => {
//       paymentLookup[payment.claimNumber] = payment;
//     });

//     // Process claims for current year
//     const currentYearData = currentYearClaims.map(claim => {
//       const claimObj = claim.toObject();
//       const payment = paymentLookup[claim.claimNumber];

//       return {
//         ...claimObj,
//         totalExpense: claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
//         paymentStatus: payment ? 'Paid' : 'Pending',
//         paymentType: payment ? payment.paymentType : null,
//         utrNumber: payment ? payment.utrNumber : null,
//         paymentDate: payment ? payment.paymentDate : null
//       };
//     });

//     // Process claims for previous year
//     const previousYearData = previousYearClaims.map(claim => {
//       const claimObj = claim.toObject();
//       const payment = paymentLookup[claim.claimNumber];

//       return {
//         ...claimObj,
//         totalExpense: claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
//         paymentStatus: payment ? 'Paid' : 'Pending',
//         paymentType: payment ? payment.paymentType : null,
//         utrNumber: payment ? payment.utrNumber : null,
//         paymentDate: payment ? payment.paymentDate : null
//       };
//     });

//     res.status(200).json({ currentYearData, previousYearData });
//   } catch (error) {
//     console.error("Error generating combined report:", error);
//     res.status(500).json({ message: "Error generating report", error: error.message });
//   }
// };

// exports.getBill = async (req, res) => {
//   try {
//     const claim = await Claim.findOne({ claimNumber: req.params.claimNumber });
//     if (!claim) return res.status(404).json({ message: "Claim not found" });

//     const billIndex = req.params.billIndex || 0;

//     if (!claim.bills || !claim.bills[billIndex]) {
//       return res.status(404).json({ message: "Bill not found" });
//     }

//     const bill = claim.bills[billIndex];
//     res.contentType(bill.contentType);
//     res.send(bill.data);
//   } catch (error) {
//     console.error("Error fetching bill:", error);
//     res.status(500).json({ message: "Error retrieving bill", error: error.message });
//   }
// };


// // exports.deleteClaim= async (req, res) => {
// //     const { claimNumber } = req.params;
// //     try {
// //       // Log claim number to check it's being received correctly
// //       console.log(`Received claim number: ${claimNumber}`);
  
// //       // Handle deletion logic, e.g., with a MongoDB model
// //       const result = await Claim.deleteOne({ claimNumber });
      
// //       if (result.deletedCount === 1) {
// //         return res.json({ success: true });
// //       } else {
// //         return res.status(404).json({ success: false, message: 'Claim not found.' });
// //       }
// //     } catch (error) {
// //       console.error('Error during claim deletion:', error);
// //       return res.status(500).json({ success: false, message: 'Server error' });
// //     }
// // };


// exports.deleteClaim = async (req, res) => {
//   const { claimNumber } = req.params;

//   try {
//     console.log(`Received claim number: ${claimNumber}`);

//     // Find the claim by claimNumber
//     const claim = await Claim.findOne({ claimNumber });

//     if (!claim) {
//       return res.status(404).json({ success: false, message: 'Claim not found.' });
//     }

//     // Check if the claim is pending
//     if (claim.paymentStatus !== 'Pending') {
//       return res.status(400).json({ success: false, message: 'Only pending claims can be deleted.' });
//     }

//     // Proceed to delete
//     const result = await Claim.deleteOne({ claimNumber });

//     if (result.deletedCount === 1) {
//       return res.json({ success: true });
//     } else {
//       return res.status(500).json({ success: false, message: 'Failed to delete the claim.' });
//     }

//   } catch (error) {
//     console.error('Error during claim deletion:', error);
//     return res.status(500).json({ success: false, message: 'Server error' });
//   }
// };




const Claim = require('../models/Claim');
const Payment = require('../models/Payment');
const multer = require("multer");
const { sendClaimNotificationToAdmin } = require("./mailer");

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export multer middleware to use in routes
exports.upload = upload.array("bills");

exports.createClaim = async (req, res) => {
  console.log("📦 File received:", req.body);

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let financialYearCode = currentMonth >= 4
      ? `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`
      : `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;

    // ✅ FIX: Fetch ALL claims for current financial year and find max number
    const claims = await Claim.find({ 
      claimNumber: { $regex: `^${financialYearCode}/` } 
    }).select('claimNumber');

    let newClaimNumber;
    
    if (claims && claims.length > 0) {
      // Extract all numeric parts and find the maximum
      const numbers = claims.map(claim => {
        const parts = claim.claimNumber.split("/");
        return parseInt(parts[parts.length - 1], 10);
      });
      
      const maxNumber = Math.max(...numbers);
      const newNumber = (maxNumber + 1).toString().padStart(3, '0'); // Changed to 3 digits padding
      newClaimNumber = `${financialYearCode}/${newNumber}`;
      
      console.log("📊 Found claims:", claims.length);
      console.log("🔢 Max number:", maxNumber);
      console.log("✅ New claim number:", newClaimNumber);
    } else {
      newClaimNumber = `${financialYearCode}/001`; // Changed to 001 for consistency
      console.log("✅ First claim for this year:", newClaimNumber);
    }

    // ✅ Safely parse expenses
    let parsedExpenses = [];
    try {
      parsedExpenses = JSON.parse(req.body.expenses);
    } catch (err) {
      console.error("Invalid JSON in expenses:", req.body.expenses);
      return res.status(400).json({ message: "Invalid format for expenses" });
    }

    const claimData = {
      ...req.body,
      expenses: parsedExpenses,
      claimNumber: newClaimNumber,
      paymentStatus: 'Pending',
    };

    if (req.files && req.files.length > 0) {
      claimData.bills = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
        originalName: file.originalname
      }));
    }

    const newClaim = new Claim(claimData);
    await newClaim.save();

    // ✅ Add totalExpense for email
    const totalExpense = claimData.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
    newClaim.totalExpense = totalExpense;

    // ✅ Send email to admin
    await sendClaimNotificationToAdmin(newClaim);

    res.status(201).json({ 
      message: "Claim with bill saved successfully!", 
      claimNumber: newClaimNumber 
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Error saving claim", error });
  }
};

exports.getNewClaimNumber = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Determine the financial year dynamically
    let financialYearCode;
    if (currentMonth >= 4) {
      financialYearCode = `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
      financialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
    }

    console.log("🚀 Current Date:", currentDate.toISOString());
    console.log("📆 Current Year:", currentYear);
    console.log("📅 Current Month:", currentMonth);
    console.log("🔢 Calculated Financial Year Code:", financialYearCode);

    // Fetch ALL claims for the current financial year
    const claims = await Claim.find({ 
      claimNumber: { $regex: `^${financialYearCode}/` } 
    }).select('claimNumber');

    let newClaimNumber;

    if (claims && claims.length > 0) {
      // Extract all numeric parts and find the maximum
      const numbers = claims.map(claim => {
        const parts = claim.claimNumber.split("/");
        return parseInt(parts[parts.length - 1], 10);
      });
      
      const maxNumber = Math.max(...numbers);
      const newNumber = (maxNumber + 1).toString().padStart(3, '0'); // Changed to 3 digits
      newClaimNumber = `${financialYearCode}/${newNumber}`;
    } else {
      newClaimNumber = `${financialYearCode}/001`; // Changed to 001
    }

    console.log("✅ Generated Claim Number:", newClaimNumber);
    res.status(200).json({ claimNumber: newClaimNumber });
  } catch (error) {
    console.error("❌ Error generating claim number:", error);
    res.status(500).json({ message: "Error generating claim number", error });
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find({});
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claims", error });
  }
};

exports.getClaimByNumber = async (req, res) => {
  try {
    const claim = await Claim.findOne({ claimNumber: req.params.claimNumber });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(200).json(claim);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claim", error });
  }
};

exports.getClaimsWithStatus = async (req, res) => {
  try {
    const claims = await Claim.find({});

    const processedClaims = claims.map(claim => {
      const totalExpense = claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      return {
        ...claim.toObject(),
        totalExpense,
        paymentStatus: claim.paymentStatus || 'Pending'
      };
    });

    res.status(200).json(processedClaims);
  } catch (error) {
    res.status(500).json({ message: "Error fetching claims with status", error });
  }
};

exports.getCombinedReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    let previousFinancialYearCode, currentFinancialYearCode;

    if (currentMonth >= 4) {
      previousFinancialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
      currentFinancialYearCode = `CF/${currentYear.toString().slice(-2)}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
      previousFinancialYearCode = `CF/${(currentYear - 2).toString().slice(-2)}-${(currentYear - 1).toString().slice(-2)}`;
      currentFinancialYearCode = `CF/${(currentYear - 1).toString().slice(-2)}-${currentYear.toString().slice(-2)}`;
    }

    console.log("Fetching data for:", currentFinancialYearCode, previousFinancialYearCode);

    // Fetch claims separately
    const currentYearClaims = await Claim.find({
      claimNumber: { $regex: `^${currentFinancialYearCode}/` }
    });

    const previousYearClaims = await Claim.find({
      claimNumber: { $regex: `^${previousFinancialYearCode}/` }
    });

    console.log("Current Year Claims:", currentYearClaims.length);
    console.log("Previous Year Claims:", previousYearClaims.length);

    // Fetch all payments
    const payments = await Payment.find({});
    const paymentLookup = {};
    payments.forEach(payment => {
      paymentLookup[payment.claimNumber] = payment;
    });

    // Process claims for current year
    const currentYearData = currentYearClaims.map(claim => {
      const claimObj = claim.toObject();
      const payment = paymentLookup[claim.claimNumber];

      return {
        ...claimObj,
        totalExpense: claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        paymentStatus: payment ? 'Paid' : 'Pending',
        paymentType: payment ? payment.paymentType : null,
        utrNumber: payment ? payment.utrNumber : null,
        paymentDate: payment ? payment.paymentDate : null
      };
    });

    // Process claims for previous year
    const previousYearData = previousYearClaims.map(claim => {
      const claimObj = claim.toObject();
      const payment = paymentLookup[claim.claimNumber];

      return {
        ...claimObj,
        totalExpense: claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
        paymentStatus: payment ? 'Paid' : 'Pending',
        paymentType: payment ? payment.paymentType : null,
        utrNumber: payment ? payment.utrNumber : null,
        paymentDate: payment ? payment.paymentDate : null
      };
    });

    res.status(200).json({ currentYearData, previousYearData });
  } catch (error) {
    console.error("Error generating combined report:", error);
    res.status(500).json({ message: "Error generating report", error: error.message });
  }
};

exports.getBill = async (req, res) => {
  try {
    const claim = await Claim.findOne({ claimNumber: req.params.claimNumber });
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const billIndex = req.params.billIndex || 0;

    if (!claim.bills || !claim.bills[billIndex]) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const bill = claim.bills[billIndex];
    res.contentType(bill.contentType);
    res.send(bill.data);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ message: "Error retrieving bill", error: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  const { claimNumber } = req.params;

  try {
    console.log(`Received claim number: ${claimNumber}`);

    // Find the claim by claimNumber
    const claim = await Claim.findOne({ claimNumber });

    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    // Check if the claim is pending
    if (claim.paymentStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Only pending claims can be deleted.' });
    }

    // Proceed to delete
    const result = await Claim.deleteOne({ claimNumber });

    if (result.deletedCount === 1) {
      return res.json({ success: true });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to delete the claim.' });
    }

  } catch (error) {
    console.error('Error during claim deletion:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
