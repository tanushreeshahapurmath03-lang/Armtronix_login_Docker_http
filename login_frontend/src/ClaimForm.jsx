import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Employee.css';
import HeaderSidebar from "./HeaderSidebar.jsx";
import axios from "axios";
import { PDFDocument } from "pdf-lib"; // You'll need to install this in frontend too: npm install pdf-lib
import { Eye, Trash2 } from "lucide-react";
import './Git.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const ClaimForm = () => {
  const [submittedClaims, setSubmittedClaims] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);

  const [formData, setFormData] = useState({
    claimNumber: "CF/24-25/",
    date: new Date().toISOString().split("T")[0], // 👈 system date in YYYY-MM-DD
    employeeName: "",
    employeeID: "",
    location: "Hubli",
    approverName: "Naren Nayak", // 👈 Default approver name
    // expenses: [{ purpose: "", quantity: 1, unitPrice: 0, amount: 0 }],
    expenses: Array(10).fill().map(() => ({ purpose: "", quantity: "", unitPrice: "", amount: "" })),
    advanceReceived: 0,
    adjustments: 0,
    cashReturned: 0,
  });

  const mainContentRef = useRef(null);

  useEffect(() => {
    const fetchNewClaimNumber = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/new-claim-number`); // Fix duplicate port issue
        if (!response.ok) {
          throw new Error("Failed to fetch claim number");
        }
        const data = await response.json();
        setFormData((prevFormData) => ({ ...prevFormData, claimNumber: data.claimNumber }));
      } catch (error) {
        console.error("Error fetching new claim number:", error);
      }
    };

    fetchNewClaimNumber();
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const loggedInEmail = sessionStorage.getItem("loggedInUserEmail");

    if (loggedInEmail && loggedInEmail !== storedEmail) {
      localStorage.setItem("userEmail", loggedInEmail);
      setFormData(prev => ({ ...prev, email: loggedInEmail }));
    } else if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }

    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token"); // Ensure token is stored in localStorage or sessionStorage

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true
        });

        if (response.data) {
          setFormData(prev => ({
            ...prev,
            employeeName: response.data.name,
            employeeID: response.data.empId,
          }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };


    fetchUserProfile();
  }, []);


  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    if (index !== null && field) {
      const updatedExpenses = [...formData.expenses];
      updatedExpenses[index][field] = value;

      // Update amount based on quantity and unit price
      const qty = parseFloat(updatedExpenses[index].quantity) || 0;
      const unit = parseFloat(updatedExpenses[index].unitPrice) || 0;
      updatedExpenses[index].amount = qty * unit;

      setFormData({ ...formData, expenses: updatedExpenses });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addExpense = () => {
    if (formData.expenses.length < 10) {
      setFormData({
        ...formData,
        expenses: [...formData.expenses, { purpose: "", quantity: 1, unitPrice: 0, amount: 0 }],
      });
    } else {
      alert("You can only add up to 10 expenses.");
    }
  };

  const removeExpense = (index) => {
    const updatedExpenses = formData.expenses.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      expenses: updatedExpenses,
    });
  };

  const calculateTotalExpense = () =>
    formData.expenses.reduce((total, item) => total + item.amount, 0);

  const totalToReceive =
    calculateTotalExpense() - formData.advanceReceived - formData.adjustments - formData.cashReturned;



  // const downloadPDF = async () => {
  //   const element = mainContentRef.current;

  //   // Hide UI buttons
  //   const elementsToHide = [
  //     ".add-expense-btn", ".download-btn", ".submit-btn",
  //     ".reset-btn", ".upload-section"
  //   ];

  //   // Store original display values to restore later
  //   const originalDisplays = {};
  //   elementsToHide.forEach(selector => {
  //     const el = document.querySelector(selector);
  //     if (el) {
  //       originalDisplays[selector] = el.style.display;
  //       el.style.display = "none";
  //     }
  //   });

  //   const logo = new Image();
  //   logo.src = "/Images/Logo.png";

  //   logo.onload = async function () {
  //     setIsPdfMode(true);
  //     console.log("PDF Mode Enabled");

  //     // Increased wait time for DOM update
  //     await new Promise((resolve) => setTimeout(resolve, 300));

  //     const canvas = await html2canvas(element, {
  //       scale: 2, // Higher scale for better quality
  //       backgroundColor: "#FFFFFF",
  //       logging: false,
  //       useCORS: true,
  //       allowTaint: true
  //     });

  //     const imgData = canvas.toDataURL("image/png", 1.0);

  //     // Create A5-sized PDF
  //     const pdf = new jsPDF("p", "mm", "a5");
  //     const pageWidth = 148;
  //     const pageHeight = 210;
  //     const marginLeft = 10;
  //     const marginTop = 20; // Reduced from 30 to decrease space

  //     const contentWidth = pageWidth - marginLeft * 2;
  //     const contentHeight = pageHeight - marginTop - 10;

  //     const scale = Math.min(
  //       contentWidth / canvas.width,
  //       contentHeight / canvas.height
  //     );

  //     const imgWidth = canvas.width * scale;
  //     const imgHeight = canvas.height * scale;

  //     const x = (pageWidth - imgWidth) / 2;
  //     const y = marginTop;

  //     // Reduced height of logo to create less space
  //     pdf.addImage(logo, "PNG", (pageWidth - 60) / 2, 5, 60, 12);
  //     pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

  //     // Load current page into pdf-lib
  //     const basePdfBytes = pdf.output("arraybuffer");
  //     const finalDoc = await PDFDocument.load(basePdfBytes);

  //     // Process any attached bills
  //     for (let bill of bills) {
  //       const arrayBuffer = await bill.arrayBuffer();
  //       const fileType = bill.type;

  //       if (fileType === "application/pdf") {
  //         const billPdf = await PDFDocument.load(arrayBuffer);
  //         const copiedPages = await finalDoc.copyPages(billPdf, billPdf.getPageIndices());
  //         copiedPages.forEach((page) => finalDoc.addPage(page));
  //       } else if (fileType.startsWith("image/")) {
  //         const imageData = await new Promise((resolve) => {
  //           const reader = new FileReader();
  //           reader.onload = () => resolve(reader.result);
  //           reader.readAsDataURL(bill);
  //         });

  //         const img = new Image();
  //         img.src = imageData;
  //         await new Promise((res) => (img.onload = res));

  //         const page = finalDoc.addPage([419.53, 595.28]); // A5 in pt
  //         const pngImage = await finalDoc.embedPng(imageData);
  //         const scale = Math.min(
  //           page.getWidth() / img.width,
  //           page.getHeight() / img.height
  //         );

  //         const imgWidth = img.width * scale;
  //         const imgHeight = img.height * scale;
  //         const x = (page.getWidth() - imgWidth) / 2;
  //         const y = (page.getHeight() - imgHeight) / 2;

  //         page.drawImage(pngImage, {
  //           x,
  //           y,
  //           width: imgWidth,
  //           height: imgHeight,
  //         });
  //       }
  //     }

  //     const finalBytes = await finalDoc.save();
  //     const blob = new Blob([finalBytes], { type: "application/pdf" });

  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = "Claim_Form_A5_with_Bills.pdf";
  //     link.click();

  //     // Restore UI elements with original display values
  //     elementsToHide.forEach(selector => {
  //       const el = document.querySelector(selector);
  //       if (el) {
  //         el.style.display = originalDisplays[selector] || "block";
  //       }
  //     });

  //     setIsPdfMode(false);
  //   };

  //   logo.onerror = () => {
  //     alert("Failed to load logo. Please try again.");
  //   };
  // };

  const generatePDFBlob = async () => {
    const element = mainContentRef.current;
    const elementsToHide = [".add-expense-btn", ".download-btn", ".submit-btn", ".reset-btn", ".upload-section"];
    const originalDisplays = {};

    elementsToHide.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        originalDisplays[selector] = el.style.display;
        el.style.display = "none";
      }
    });

    const logo = new Image();
    logo.src = "/Images/Logo.png";

    return new Promise((resolve, reject) => {
      logo.onload = async () => {
        setIsPdfMode(true);
        await new Promise(res => setTimeout(res, 300));

        const canvas = await html2canvas(element, {
          scale: 2,
          backgroundColor: "#FFFFFF",
          useCORS: true,
          allowTaint: true
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const pdf = new jsPDF("p", "mm", "a5");
        const pageWidth = 148, pageHeight = 210;
        const marginLeft = 10, marginTop = 20;
        const contentWidth = pageWidth - marginLeft * 2;
        const contentHeight = pageHeight - marginTop - 10;

        const scale = Math.min(contentWidth / canvas.width, contentHeight / canvas.height);
        const imgWidth = canvas.width * scale;
        const imgHeight = canvas.height * scale;
        const x = (pageWidth - imgWidth) / 2;
        const y = marginTop;

        pdf.addImage(logo, "PNG", (pageWidth - 60) / 2, 5, 60, 12);
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

        const basePdfBytes = pdf.output("arraybuffer");
        const finalDoc = await PDFDocument.load(basePdfBytes);

        for (let bill of bills) {
          const arrayBuffer = await bill.arrayBuffer();
          if (bill.type === "application/pdf") {
            const billPdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await finalDoc.copyPages(billPdf, billPdf.getPageIndices());
            copiedPages.forEach(page => finalDoc.addPage(page));
          } else if (bill.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = async () => {
              const imageData = reader.result;
              const img = new Image();
              img.src = imageData;

              img.onload = async () => {
                const page = finalDoc.addPage([419.53, 595.28]);
                const pngImage = await finalDoc.embedPng(imageData);
                const scale = Math.min(page.getWidth() / img.width, page.getHeight() / img.height);
                const imgWidth = img.width * scale;
                const imgHeight = img.height * scale;
                const x = (page.getWidth() - imgWidth) / 2;
                const y = (page.getHeight() - imgHeight) / 2;

                page.drawImage(pngImage, {
                  x, y, width: imgWidth, height: imgHeight,
                });

                const finalBytes = await finalDoc.save();
                const blob = new Blob([finalBytes], { type: "application/pdf" });

                // Restore UI
                elementsToHide.forEach(selector => {
                  const el = document.querySelector(selector);
                  if (el) el.style.display = originalDisplays[selector] || "block";
                });

                setIsPdfMode(false);
                resolve(blob);
              };
            };
            reader.readAsDataURL(bill);
          }
        }

        const finalBytes = await finalDoc.save();
        const blob = new Blob([finalBytes], { type: "application/pdf" });

        // Restore UI
        elementsToHide.forEach(selector => {
          const el = document.querySelector(selector);
          if (el) el.style.display = originalDisplays[selector] || "block";
        });

        setIsPdfMode(false);
        resolve(blob);
      };

      logo.onerror = () => reject("Logo failed to load");
    });
  };


  // const handleSubmitClaim = async () => {
  //   if (isSubmitting) return; // avoid double submission

  //   // ✅ Begin submission state
  //   setIsSubmitting(true);
  //   // ✅ Proper validation: allow unitPrice = 0, but disallow empty or NaN
  //   const hasInvalidExpense = formData.expenses.some(
  //     (expense) =>
  //       !expense.purpose ||
  //       expense.unitPrice === "" ||
  //       isNaN(parseFloat(expense.unitPrice))
  //   );

  //   if (!formData.date || !formData.employeeName ) {
  //     alert("Please fill all required fields before submitting the form.");
  //     return;
  //   }

  //   try {
  //     const submitData = new FormData();

  //     // ✅ Append uploaded bills
  //     if (bills.length > 0) {
  //       bills.forEach((file) => {
  //         submitData.append("bills", file); // must match backend: upload.array("bills")
  //       });
  //       console.log("📦 Files being uploaded:", bills);
  //     }

  //     // ✅ Add basic fields
  //     submitData.append("date", formData.date);
  //     submitData.append("employeeName", formData.employeeName);

  //     submitData.append("employeeID", formData.employeeID);
  //     if (formData.location) submitData.append("location", formData.location);
  //     if (formData.advanceReceived) submitData.append("advanceReceived", formData.advanceReceived);
  //     if (formData.adjustments) submitData.append("adjustments", formData.adjustments);
  //     if (formData.cashReturned) submitData.append("cashReturned", formData.cashReturned);

  //     // ✅ Append expenses array as JSON
  //     submitData.append("expenses", JSON.stringify(formData.expenses));

  //     // ✅ Submit to backend
  //     const response = await fetch(`${BACKEND_URL}/api/claims`, {
  //       method: "POST",
  //       body: submitData,
  //     });

  //     const data = await response.json();
  //     alert(data.message);

  //     if (data.claimNumber) {
  //       // ✅ Update claim number after submission
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         claimNumber: data.claimNumber,
  //         // location: data.location,
  //       }));

  //       // ✅ Reset form fields
  //       setFormData({
  //         claimNumber: "", // Temporarily empty until fetched
  //         date: new Date().toISOString().split("T")[0],
  //         employeeName: formData.employeeName,
  //         employeeID: formData.employeeID,
  //         location: "Hubli",
  //         advanceReceived: 0,
  //         adjustments: 0,
  //         cashReturned: 0,
  //         expenses: Array(10).fill().map(() => ({ purpose: "", quantity: "", unitPrice: "", amount: "" })),
  //       });


  //       setBills([]);
  //       if (fileInputRef.current) {
  //         fileInputRef.current.value = null;
  //       }

  //       // ✅ Fetch new claim number
  //       try {
  //         const res = await fetch(`${BACKEND_URL}/api/new-claim-number`);
  //         const freshData = await res.json();
  //         if (freshData.claimNumber) {
  //           setFormData((prev) => ({
  //             ...prev,
  //             claimNumber: freshData.claimNumber,
  //           }));
  //         }
  //       } catch (error) {
  //         console.error("Error fetching new claim number:", error);
  //         alert("Error fetching new claim number!");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error submitting claim:", error);
  //     alert("Error submitting claim!");
  //   } finally {
  //     setIsSubmitting(false); // ✅ End submission state
  //   }
  // };


  const handleSubmitClaim = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Step 1: Generate and trigger download
      const pdfBlob = await generatePDFBlob();
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Claim_Form_A5_with_Bills.pdf";
      link.click();

      // Step 2: Prepare submission data
      const submitData = new FormData();
      if (bills.length > 0) {
        bills.forEach((file) => submitData.append("bills", file));
      }

      submitData.append("date", formData.date);
      submitData.append("employeeName", formData.employeeName);
      submitData.append("employeeID", formData.employeeID);
      if (formData.location) submitData.append("location", formData.location);
      submitData.append("advanceReceived", formData.advanceReceived);
      submitData.append("adjustments", formData.adjustments);
      submitData.append("cashReturned", formData.cashReturned);
      submitData.append("expenses", JSON.stringify(formData.expenses));

      const response = await fetch(`${BACKEND_URL}/api/claims`, {
        method: "POST",
        body: submitData,
      });

      const data = await response.json();
      alert(data.message);

      if (data.claimNumber) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          claimNumber: "", // Temporarily clear before refetch
          date: new Date().toISOString().split("T")[0],
          employeeName: formData.employeeName,
          employeeID: formData.employeeID,
          location: "Hubli",
          advanceReceived: 0,
          adjustments: 0,
          cashReturned: 0,
          expenses: Array(10).fill().map(() => ({ purpose: "", quantity: "", unitPrice: "", amount: "" })),
        }));
        setBills([]);
        if (fileInputRef.current) fileInputRef.current.value = null;

        const res = await fetch(`${BACKEND_URL}/api/new-claim-number`);
        const freshData = await res.json();
        if (freshData.claimNumber) {
          setFormData((prev) => ({
            ...prev,
            claimNumber: freshData.claimNumber,
          }));
        }
      }
    } catch (error) {
      alert("An error occurred during submission or PDF generation.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };


  const [bills, setBills] = useState([]);

  const handleBillUpload = (event) => {
    const files = Array.from(event.target.files);
    setBills(prevBills => [...prevBills, ...files]);
  };

  const handleViewBill = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL, '_blank');
  };

  const handleDeleteBill = (indexToDelete) => {
    setBills((prevBills) => prevBills.filter((_, index) => index !== indexToDelete));
  };


  const handleReset = () => {
    setFormData(prev => ({
      ...prev,
      employeeID: "",
      location: "Hubli",
      approverName: "Naren Nayak",
      advanceReceived: 0,
      adjustments: 0,
      cashReturned: 0,
      expenses: Array(10).fill().map(() => ({ purpose: "", quantity: "", unitPrice: "", amount: "" })),
    }));

    setBills([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // 👈 this clears the file input
    }
  };


  return (
    <div className="dashboard-container">
      <HeaderSidebar />

      <style>
        {`
        .pdf-mode {
          font-size: 16px;
        }

        .pdf-mode .delete-column {
          display: none !important;
        }

.expense-table td:nth-child(2),
.expense-table th:nth-child(2) {
  width: 40%;
  text-align: left;
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.expense-table td:nth-child(2) input {
  width: 100%;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

    .expense-table th,
    .expense-table td {
      text-align: center;
      padding: 4px;
    }

    .expense-table th:not(:nth-child(2)),
    .expense-table td:not(:nth-child(2)) {
      width: 10%;
    }

        .pdf-mode .expense-table th:nth-child(2),
    .pdf-mode .expense-table td:nth-child(2) {
      width: 40% !important;
    }

    .pdf-mode .expense-table th:not(:nth-child(2)),
    .pdf-mode .expense-table td:not(:nth-child(2)) {
      width: 12% !important;
    }
      `}
      </style>

      <main
        className={`main-content ${isPdfMode ? "pdf-mode" : ""}`}
        ref={mainContentRef}
      >
        <h1 className="form-title">Expense Claim Form </h1>

        <div className="form-header">
          <div>
            <label>Claim #</label>
            <input type="text" name="claimNumber" value={formData.claimNumber} readOnly />
          </div>
          {/* <div>
            <label>Date <span className='req'>*</span></label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div> */}

          <div>
            <label>Date <span className='req'>*</span></label>
            {isPdfMode ? (
              <div style={{ padding: '6px 0' }}>
                {new Date(formData.date).toLocaleDateString("en-GB")}
              </div>
            ) : (
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            )}
          </div>

        </div>


        {/* Employee Details */}
        <div className="employee-details">
          <div>
            <label>Employee Name <span className='req'>*</span></label>
            <input type="text" name="employeeName" placeholder="Name" value={formData.employeeName} onChange={handleChange} required />
          </div>
          <div>
            <label>Employee ID </label>
            <input type="text" name="employeeID" placeholder="ID" value={formData.employeeID} onChange={handleChange} />
          </div>
          <div>
            <label>Location</label>
            <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
          </div>
        </div>

        <table className="expense-table">
          <thead>
            <tr>
              <th>Sl. No.</th>
              <th>Purpose </th>
              <th>Qty</th>
              <th>Unit Price </th>
              <th>Amount</th>
              {/* <th className="delete-column">Delete</th> */}

            </tr>
          </thead>
          <tbody>
            {formData.expenses.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                {/* <td>
                  <input
                    type="text"
                    value={item.purpose}
                    onChange={(e) => handleChange(e, index, "purpose")}
                    required
                  />
                </td> */}

                <td>
                  {isPdfMode ? (
                    <div style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                      {item.purpose}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={item.purpose}
                      onChange={(e) => handleChange(e, index, "purpose")}

                      style={{ width: "100%" }}
                    />
                  )}
                </td>

                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleChange(e, index, "quantity")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.unitPrice}
                    onChange={(e) => handleChange(e, index, "unitPrice")}

                  />
                </td>
                {/* <td>{Number(item.amount || 0).toFixed(2)}</td> */}

                <td>
                  {item.quantity !== "" && item.unitPrice !== "" && !isNaN(item.amount)
                    ? Number(item.amount).toFixed(2)
                    : ""}
                </td>

                {/* <td className="delete-column">
                  <button className='Delete-expense' onClick={() => removeExpense(index)} style={{ color: "red" }}>
                    -
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>

        </table>

        {/* <div className="add-expense-container">
          <button onClick={addExpense} className="add-expense-btn no-print">+ Add Expense</button>
        </div> */}

        {/* Totals Section (Fixed Position) */}
        <div className="totals">
          <div>
            <label>Advance Received (INR)</label>
            <input type="number" min="0" name="advanceReceived" value={formData.advanceReceived} onChange={handleChange} />
          </div>
          <div>
            <label>Adjustments with Advance (INR)</label>
            <input type="number" min="0" name="adjustments" value={formData.adjustments} onChange={handleChange} />
          </div>
          <div>
            <label>Cash to be Returned to Office (INR)</label>
            <input type="number" min="0" name="cashReturned" value={formData.cashReturned} onChange={handleChange} />
          </div>
        </div>


        {/* Total Expense and Total to be Received - Moved Below */}
        <div className="final-totals">
          <div>
            <strong>Total Expense (INR):</strong> {calculateTotalExpense()}
          </div>
          <div className='final-totals1'>
            <strong>Total to be Received (INR):</strong> {isNaN(totalToReceive) ? "NaN" : totalToReceive.toFixed(2)}
          </div>
        </div>


        <div className="approval-section">

          <div className="approval-field">
            <label>Submitted By:</label>
            <input type="text" name="employeeName" placeholder="Name" value={formData.employeeName} onChange={handleChange} required />
          </div>

          <div className="approval-field">
            <label>Approved By:</label>
            <input
              type="text"
              value={formData.approverName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  approverName: e.target.value,
                }))
              }
            />
          </div>


        </div>

        <div className="approval-section">
          <div className="approval-field">
            <label>Receiver Signature:</label>
            <input type="text" placeholder="" />
          </div>

          <div className="approval-field">
            <label>Approver Signature:</label>
            <input type="text" placeholder="" />
          </div>
        </div>



        <div className='Bills'>
          <div className="upload-section no-print">
            <label className="upload-label">Upload Bills</label>
            <input
              type="file"
              accept="application/pdf,image/*"
              multiple
              onChange={handleBillUpload}
              ref={fileInputRef}
              className="upload-input"
            />
          </div>

          {bills.length > 0 && (
            <div className="uploaded-bills">
              <h3 className="uploaded-title">Uploaded Bills</h3>
              {bills.map((bill, index) => (
                <div key={index} className="bill-item">
                  <span className="bill-name">{bill.name}</span>
                  <div className="bill-item1">
                    <button
                      type="button"
                      onClick={() => handleViewBill(bill)}
                      className="view-button"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBill(index)}
                      className="delete-button"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>

        <div className="add-expense-container">
          {/* <button onClick={downloadPDF} className="download-btn no-print">Download PDF</button> */}
          <button
            className="submit-btn no-print"
            onClick={handleSubmitClaim}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          <button type="button" className="reset-btn no-print" onClick={handleReset}>Reset</button>
        </div>
      </main>
    </div>

  );
};

export default ClaimForm;
