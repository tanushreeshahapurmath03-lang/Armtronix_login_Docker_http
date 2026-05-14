const Payment = require('../models/Payment');
const Claim = require('../models/Claim');

// exports.createPayment = async (req, res) => {
//   const { claimNumber,employeeName, paymentType, utrNumber, amount } = req.body;
  
//   if (!claimNumber || !amount || (paymentType === "upi" && !utrNumber)) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }
  
//   try {
//     const newPayment = new Payment({
//       claimNumber,
//       employeeName,
//       paymentType, 
//       utrNumber,
//       amount,
//       status: 'Completed',
//       paymentDate: new Date()
//     });
    
//     await newPayment.save();
    
//     const updatedClaim = await Claim.findOneAndUpdate(
//       { claimNumber: claimNumber },
//       { $set: { paymentStatus: 'Paid' } },
//       { new: true }
//     );
    
//     if (!updatedClaim) {
//       return res.status(404).json({ message: "Claim not found" });
//     }
    
//     res.status(201).json({ 
//       message: "Payment saved successfully and claim status updated!",
//       payment: newPayment,
//       claim: updatedClaim
//     });
//   } catch (error) {
//     console.error("Error processing payment:", error);
//     res.status(500).json({ message: "Error processing payment", error });
//   }
// };


exports.createPayment = async (req, res) => {
  const { claimNumber, employeeName, paymentType, utrNumber, amount, paymentDate } = req.body;

  if (!claimNumber || !amount || (paymentType === "online" && !utrNumber) || !paymentDate) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    const newPayment = new Payment({
      claimNumber,
      employeeName,
      paymentType,
      utrNumber,
      amount,
      status: 'Completed',
      paymentDate: new Date(paymentDate) // Use client-sent date
    });

    await newPayment.save();

    const updatedClaim = await Claim.findOneAndUpdate(
      { claimNumber: claimNumber },
      { $set: { paymentStatus: 'Paid' } },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    res.status(201).json({
      message: "Payment saved successfully and claim status updated!",
      payment: newPayment,
      claim: updatedClaim
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Error processing payment", error });
  }
};


exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({});
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
};

exports.getPaymentsWithClaims = async (req, res) => {
  try {
    const payments = await Payment.find({});
    
    const paymentPromises = payments.map(async (payment) => {
      const claim = await Claim.findOne({ claimNumber: payment.claimNumber });
      
      return {
        payment: payment.toObject(),
        claim: claim ? claim.toObject() : null
      };
    });
    
    const paymentDetails = await Promise.all(paymentPromises);
    
    res.status(200).json(paymentDetails);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment details", error });
  }
};