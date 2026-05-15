import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Employee.css';
import './Git.css'
import HeaderSidebar_admin from "./HeaderSidebar_admin.jsx";
import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import axios from "axios";
import { PDFDocument } from "pdf-lib"; // You'll need to install this in frontend too: npm install pdf-lib
import { Eye, Trash2, Download, FileText } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5002';

const ClaimForm = () => {
  const [view, setView] = useState('claimForm');
  const mainContentRef = useRef(null);
  const [submittedClaims, setSubmittedClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [combinedReportData, setCombinedReportData] = useState([]);
  const [previousYearReportData, setPreviousYearReportData] = useState([]);
  const fileInputRef = useRef(null);
  const paymentFormRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);

  const [formData, setFormData] = useState({
    claimNumber: "+",
    date: new Date().toISOString().split("T")[0], // 👈 system date in YYYY-MM-DD
    employeeName: "",
    employeeID: "",
    location: "Hubli",
    approverName: "Naren Nayak", // 👈 Default approver name

    // expenses: [{ purpose: "", quantity: 1, unitPrice: 0, amount: 0 }],
    // expenses: [{ purpose: "", quantity: 1, unitPrice: 0, amount: 0 }],
    expenses: Array(10).fill().map(() => ({ purpose: "", quantity: "", unitPrice: "", amount: "" })),
    advanceReceived: 0,
    adjustments: 0,
    cashReturned: 0,

  });

  const [paymentData, setPaymentData] = useState({
    claimNumber: "",
    paymentType: "cash",
    utrNumber: "",
    amount: "",
    paymentDate: ''
  });


  useEffect(() => {
    if (view === 'paymentDetails') {
      fetchSubmittedClaims();
    }
  }, [view]);

  useEffect(() => {
    if (view === 'reportsView') {
      fetchCombinedReportData();
    }
  }, [view]);

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

  const fetchCombinedReportData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/combined-report`);

      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const data = await response.json();

      console.log("Fetched Data:", data);

      setCombinedReportData(data.currentYearData || []);
      setPreviousYearReportData(data.previousYearData || []);

      console.log("Current Year Data:", data.currentYearData);
      console.log("Previous Year Data:", data.previousYearData);

    } catch (error) {
      console.error("Error fetching combined report data:", error);
      alert("Error fetching report data!");
    }
  };


  const downloadExcelReport = async () => {
    if (!previousYearReportData || previousYearReportData.length === 0) {
      alert("No previous year data available for download!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Previous Year Claims Report');

    const baseColumns = [
      { header: 'Claim Number', key: 'claimNumber', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Employee Name', key: 'employeeName', width: 15 },
      { header: 'Employee ID', key: 'employeeID', width: 12 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Expense Purpose', key: 'purpose', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Total Expense', key: 'totalExpense', width: 15 },
      { header: 'Advance Received', key: 'advanceReceived', width: 15 },
      { header: 'Adjustments', key: 'adjustments', width: 12 },
      { header: 'Cash Returned', key: 'cashReturned', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Type', key: 'paymentType', width: 12 },
      { header: 'UTR Number', key: 'utrNumber', width: 15 },
      { header: 'Payment Amount', key: 'paymentAmount', width: 15 },
      { header: 'Payment Date', key: 'paymentDate', width: 15 },
    ];

    // Determine max number of bills
    let maxBills = 0;
    previousYearReportData.forEach(claim => {
      if (claim.bills && claim.bills.length > maxBills) {
        maxBills = claim.bills.length;
      }
    });

    const billColumns = [];
    for (let i = 0; i < maxBills; i++) {
      billColumns.push({ header: `Bill-${i + 1}`, key: `bill${i + 1}`, width: 30 });
    }

    worksheet.columns = [...baseColumns, ...billColumns];
    worksheet.getRow(1).font = { bold: true };

    previousYearReportData.forEach(claim => {
      const expenses = claim.expenses.length > 0 ? claim.expenses : [{ purpose: 'N/A', quantity: '', unitPrice: '', amount: '' }];
      const firstRowOfClaim = worksheet.rowCount + 1;

      expenses.forEach(expense => {
        const row = worksheet.addRow({
          claimNumber: claim.claimNumber,
          date: claim.date,
          employeeName: claim.employeeName,
          employeeID: claim.employeeID,
          location: claim.location,
          purpose: expense.purpose || 'N/A',
          quantity: expense.quantity || '',
          unitPrice: expense.unitPrice ? expense.unitPrice : '',
          amount: expense.amount ? expense.amount : '',
          totalExpense: claim.totalExpense ? claim.totalExpense : 0,
          advanceReceived: claim.advanceReceived || 0,
          adjustments: claim.adjustments || 0,
          cashReturned: claim.cashReturned || 0,
          paymentStatus: claim.paymentStatus,
          paymentType: claim.paymentType || 'N/A',
          utrNumber: claim.utrNumber || 'N/A',
          paymentAmount: claim.paymentAmount || 0,
          paymentDate: claim.paymentDate,
        });

        // Insert bill hyperlinks
        const bills = claim.bills || [];
        for (let i = 0; i < maxBills; i++) {
          const cell = row.getCell(baseColumns.length + i + 1);
          if (bills[i]) {
            const filename = bills[i].originalname || bills[i].filename || `Bill-${i + 1}`;
            const url = `${BACKEND_URL}/claims/${encodeURIComponent(claim.claimNumber)}/bill/${i}`;
            cell.value = { text: filename, hyperlink: url };
            cell.font = { color: { argb: 'FF0000FF' }, underline: true };
          } else {
            cell.value = '';
          }
        }
      });

      if (expenses.length > 1) {
        const columnsToMerge = [
          1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18
        ];
        columnsToMerge.forEach(col => {
          worksheet.mergeCells(firstRowOfClaim, col, worksheet.rowCount, col);
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Previous_Year_Claims_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const fetchNewClaimNumber = async () => {
      try {
        const backendResponse = await fetch(`${BACKEND_URL}/api/new-claim-number`);
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          console.log("Fetched Claim Number:", data.claimNumber);
          setFormData((prevFormData) => ({
            ...prevFormData,
            claimNumber: data.claimNumber,
          }));
          return;
        }
      } catch (backendError) {
        console.warn("Backend new-claim-number failed, falling back to local emulator:", backendError);
      }

      try {
        const localResponse = await fetch(`/api/new-claim-number`);
        if (!localResponse.ok) {
          throw new Error("Failed to fetch new claim number from local emulator");
        }
        const localData = await localResponse.json();
        console.log("Fetched local Claim Number:", localData.claimNumber);
        setFormData((prevFormData) => ({
          ...prevFormData,
          claimNumber: localData.claimNumber,
        }));
      } catch (localError) {
        console.error("Error fetching new claim number:", localError);
      }
    };

    fetchNewClaimNumber();
  }, []);


  const fetchSubmittedClaims = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/claims`);
      const data = await response.json();

      const paymentsResponse = await fetch(`${BACKEND_URL}/api/payments`);
      const paymentsData = await paymentsResponse.json();

      const paymentMap = {};
      paymentsData.forEach(payment => {
        paymentMap[payment.claimNumber] = payment;
      });

      const processedClaims = data.map(claim => {
        const totalExpense = claim.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

        const isPaid = paymentMap[claim.claimNumber] !== undefined;

        return {
          ...claim,
          totalExpense,
          paymentStatus: isPaid ? 'Paid' : 'Pending'
        };
      });

      setSubmittedClaims(processedClaims);
    } catch (error) {
      console.error("Error fetching submitted claims:", error);
      alert("Error fetching submitted claims!");
    }
  };

  const handleFormChange = (e, index = null, field = null) => {
    if (index !== null) {
      const newExpenses = [...formData.expenses];
      newExpenses[index][field] = field === "purpose" ? e.target.value : parseFloat(e.target.value) || 0;
      newExpenses[index].amount = newExpenses[index].quantity * newExpenses[index].unitPrice;
      setFormData({ ...formData, expenses: newExpenses });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleChange = (e, index = null, field = null) => {
    const { name, value } = e.target;

    if (index !== null && field) {
      const updatedExpenses = [...formData.expenses];
      updatedExpenses[index][field] = value;

      // Update amount based on quantity and unit price
      const qty = parseFloat(updatedExpenses[index].quantity);
      const unit = parseFloat(updatedExpenses[index].unitPrice);
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
        expenses: [...formData.expenses, { purpose: "", quantity: "", unitPrice: "", amount: "" }],
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

  //   if (!formData.date || !formData.employeeName) {
  //     alert("Please fill all required fields before submitting the form.");
  //     setIsSubmitting(false);
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




  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim);
    setPaymentData({
      claimNumber: claim.claimNumber,
      paymentType: "cash",
      utrNumber: "",
      amount: claim.totalExpense
    });

    setTimeout(() => {
      paymentFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // slight delay ensures the section is rendered
  };


  // const handleSubmitPayment = async () => {
  //   if (!paymentData.claimNumber || !paymentData.amount || (paymentData.paymentType === "online" && !paymentData.utrNumber)) {
  //     alert("All fields are required!");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${BACKEND_URL}/api/payments`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(paymentData),
  //     });
  //     const data = await response.json();
  //     alert(data.message);
  //     setPaymentData({ claimNumber: "", paymentType: "cash", utrNumber: "", amount: "" });
  //     setSelectedClaim(null);
  //     fetchSubmittedClaims();
  //   } catch (error) {
  //     alert("Error submitting payment!");
  //   }
  // };

  const handleSubmitPayment = async () => {
    // if (
    //   !selectedClaim.claimNumber ||
    //   !selectedClaim.totalExpense ||
    //   !paymentData.paymentDate ||
    //   (paymentData.paymentType === "online" && !paymentData.utrNumber)
    // ) {
    //   alert("All fields are required!");
    //   return;
    // }

    const requestBody = {
      claimNumber: selectedClaim.claimNumber,
      employeeName: selectedClaim.employeeName,
      paymentType: paymentData.paymentType,
      utrNumber: paymentData.utrNumber,
      amount: selectedClaim.totalExpense,
      paymentDate: paymentData.paymentDate,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      alert(data.message);

      setPaymentData({
        paymentType: "cash",
        utrNumber: "",
        paymentDate: "", // Reset paymentDate too
      });
      setSelectedClaim(null);
      fetchSubmittedClaims();
    } catch (error) {
      console.error("Error submitting payment:", error);
      alert("Error submitting payment!");
    }
  };


  const downloadExcel = async () => {
    if (!combinedReportData || combinedReportData.length === 0) {
      alert("No current year data available for download!");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Current Year Claims Report');

    // Basic columns
    const baseColumns = [
      { header: 'Claim Number', key: 'claimNumber', width: 15 },
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Employee Name', key: 'employeeName', width: 15 },
      { header: 'Employee ID', key: 'employeeID', width: 12 },
      { header: 'Location', key: 'location', width: 15 },
      { header: 'Expense Purpose', key: 'purpose', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 10 },
      { header: 'Unit Price', key: 'unitPrice', width: 12 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Total Expense', key: 'totalExpense', width: 15 },
      { header: 'Advance Received', key: 'advanceReceived', width: 15 },
      { header: 'Adjustments', key: 'adjustments', width: 12 },
      { header: 'Cash Returned', key: 'cashReturned', width: 15 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Type', key: 'paymentType', width: 12 },
      { header: 'UTR Number', key: 'utrNumber', width: 15 },
      { header: 'Payment Amount', key: 'paymentAmount', width: 15 },
      { header: 'Payment Date', key: 'paymentDate', width: 15 },
    ];

    // Determine max number of bills
    let maxBills = 0;
    combinedReportData.forEach(claim => {
      if (claim.bills && claim.bills.length > maxBills) {
        maxBills = claim.bills.length;
      }
    });

    // Add dynamic columns for Bill-1, Bill-2, ...
    const billColumns = [];
    for (let i = 0; i < maxBills; i++) {
      billColumns.push({ header: `Bill-${i + 1}`, key: `bill${i + 1}`, width: 30 });
    }

    worksheet.columns = [...baseColumns, ...billColumns];
    worksheet.getRow(1).font = { bold: true };

    combinedReportData.forEach(claim => {
      const expenses = claim.expenses && claim.expenses.length > 0
        ? claim.expenses
        : [{ purpose: 'N/A', quantity: '', unitPrice: '', amount: '' }];

      const firstRowOfClaim = worksheet.rowCount + 1;

      expenses.forEach((expense, expIndex) => {
        const row = worksheet.addRow({
          claimNumber: claim.claimNumber,
          date: claim.date,
          employeeName: claim.employeeName,
          employeeID: claim.employeeID,
          location: claim.location || 'N/A',
          purpose: expense.purpose || 'N/A',
          quantity: expense.quantity || '',
          // unitPrice: expense.unitPrice ? expense.unitPrice.toFixed(2) : '',
          // amount: expense.amount ? expense.amount.toFixed(2) : '',
          unitPrice: isNaN(Number(expense.unitPrice)) ? '' : Number(expense.unitPrice),
          amount: isNaN(Number(expense.amount)) ? '' : Number(expense.amount),
          totalExpense: claim.totalExpense ? claim.totalExpense : 0,
          advanceReceived: claim.advanceReceived || 0,
          adjustments: claim.adjustments || 0,
          cashReturned: claim.cashReturned || 0,
          paymentStatus: claim.paymentStatus || 'Pending',
          paymentType: claim.paymentType || 'N/A',
          utrNumber: claim.utrNumber || 'N/A',
          paymentAmount: claim.paymentAmount || claim.totalExpense || 0,
          paymentDate: claim.paymentDate || 'N/A',
        });

        // Add bill hyperlinks to extra columns
        const bills = claim.bills || [];
        for (let i = 0; i < maxBills; i++) {
          const cell = row.getCell(baseColumns.length + i + 1);
          if (bills[i]) {
            const filename = bills[i].originalname || bills[i].filename || `Bill-${i + 1}`;
            const url = `${BACKEND_URL}/claims/${encodeURIComponent(claim.claimNumber)}/bill/${i}`;
            cell.value = {
              text: filename,
              hyperlink: url
            };
            cell.font = { color: { argb: 'FF0000FF' }, underline: true };
          } else {
            cell.value = '';
          }
        }
      });

      // Merge shared fields for claims with multiple expenses
      if (expenses.length > 1) {
        const columnsToMerge = [
          1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18
        ];
        columnsToMerge.forEach(col => {
          worksheet.mergeCells(firstRowOfClaim, col, worksheet.rowCount, col);
        });
      }
    });

    // Export to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Current_Year_Claims_Report.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const [currentPage, setCurrentPage] = useState(0);
  const claimsPerPage = 10;

  // Replace the current sorting logic with this code
  const sortedClaims = [...submittedClaims].sort((a, b) => {
    // Extract parts from claim numbers (e.g., "CF/25-26/09")
    const parseClaimNumber = (claimNum) => {
      const parts = claimNum.split('/');
      if (parts.length !== 3) return { year: 0, sequence: 0 };

      const yearPart = parts[1]; // e.g., "25-26"
      const sequencePart = parts[2]; // e.g., "09"

      // Convert year part to comparable number
      const yearDigits = yearPart.split('-');
      const yearValue = parseInt(yearDigits[0]) * 100 + parseInt(yearDigits[1]); // Creates a sortable number

      // Convert sequence to number
      const sequenceValue = parseInt(sequencePart);

      return { year: yearValue, sequence: sequenceValue };
    };

    const aInfo = parseClaimNumber(a.claimNumber);
    const bInfo = parseClaimNumber(b.claimNumber);

    // First compare by year (descending)
    if (bInfo.year !== aInfo.year) {
      return bInfo.year - aInfo.year;
    }

    // Then compare by sequence number (descending)
    return bInfo.sequence - aInfo.sequence;
  });

  // Calculate pagination
  const startIndex = currentPage * claimsPerPage;
  // const displayedClaims = sortedClaims.slice(startIndex, startIndex + claimsPerPage);
  const displayedClaims = sortedClaims.slice(startIndex, startIndex + claimsPerPage);
  const totalPages = Math.ceil(sortedClaims.length / claimsPerPage);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages - 1);
    }
    if (currentPage < 0) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);
  
  console.log("Sorted Claims:", sortedClaims);
console.log("Total Pages:", totalPages);
console.log("Displayed Claims:", displayedClaims);


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


  // Function to view bill from server
  const handleViewServerBill = (claimNumber, billIndex = 0) => {
    // Add validation to prevent undefined claim numbers
    if (!claimNumber) {
      console.error("Cannot view bill: claimNumber is undefined");
      alert("Error: Claim number is missing");
      return;
    }
    window.open(`${BACKEND_URL}/claims/${encodeURIComponent(claimNumber)}/bill/${billIndex}`, '_blank');
  };

  const handleDownloadServerBill = (claimNumber, billIndex = 0) => {
    if (!claimNumber) {
      console.error("Cannot download bill: claimNumber is undefined");
      alert("Error: Claim number is missing");
      return;
    }

    fetch(`${BACKEND_URL}/claims/${encodeURIComponent(claimNumber)}/bill/${billIndex}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        const extension = getExtensionFromMime(contentType) || 'bin'; // fallback
        const filename = `bill-${claimNumber}-${billIndex}.${extension}`;

        return response.blob().then(blob => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error downloading bill:", error);
        alert(`Failed to download bill: ${error.message}`);
      });
  };

  // Helper to map MIME type to file extension
  const getExtensionFromMime = (mimeType) => {
    const map = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
      // add more if needed
    };
    return map[mimeType];
  };


  const handleDeleteClaim = async (claimNumber) => {
    const confirmation = window.confirm(`Are you sure you want to delete Claim #${claimNumber}?`);
    if (!confirmation) return;

    try {
      // Send DELETE request to the backend to remove the claim
      const response = await fetch(`${BACKEND_URL}/api/claims/${encodeURIComponent(claimNumber)}`, {
        method: "DELETE",
      });

      const data = await response.json();

      // if (data.success) {
      //   // Update the state to remove the claim from the UI
      //   setSubmittedClaims((prevClaims) =>
      //     prevClaims.filter((claim) => claim.claimNumber !== claimNumber)
      //   );
      //   alert(`Claim #${claimNumber} has been deleted.`);
      // } else {
      //   alert("Failed to delete the claim.");
      // }


      if (data.success) {
        setSubmittedClaims((prevClaims) =>
          prevClaims.filter((claim) => claim.claimNumber !== claimNumber)
        );
        alert(`Claim #${claimNumber} has been deleted.`);
      } else {
        alert(data.message || "Failed to delete the claim.");
      }

    } catch (error) {
      console.error("Error deleting claim:", error);
      alert("An error occurred while deleting the claim.");
    }
  };

  return (
    <div className="dashboard-container">
      <HeaderSidebar_admin />
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
        <h1 className="portal-title">Expense Claim Management</h1>
        <div className="button-container">
          <button className="claimform" onClick={() => setView('claimForm')}>Claim Form</button>
          <button className="pay-details" onClick={() => setView('paymentDetails')}>Payment Details</button>
          <button className="reports" onClick={() => setView('reportsView')}>Reports</button>
        </div>

        {view === 'claimForm' && (
          <div className="ccccffff" ref={mainContentRef}>
            <h2 className="form-title">Expense Claim Form</h2>
            <div className="form-header">
              <div >
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

            <div className="employee-details">
              <div>
                <label>Employee Name <span className='req'>*</span></label>
                <input type="text" name="employeeName" placeholder="Name" value={formData.employeeName} onChange={handleChange} required />
              </div>
              <div>
                <label>Employee ID</label>
                <input type="text" name="employeeID" placeholder="ID" value={formData.employeeID || ""} onChange={handleChange} />
              </div>
              <div>
                <label>Location</label>
                <input type="text" name="location" placeholder="Location" value={formData.location || ""} onChange={handleChange} />
              </div>
            </div>

            <div style={{ overflowX: "auto", width: "100%" }}>
              <table className="expense-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Sl. No.</th>
                    <th>Purpose</th>
                    <th>Qty</th>
                    <th>Unit Price </th>
                    <th>Amount</th>
                    {/* <th className="delete-column">Delete</th> */}

                  </tr>
                </thead>
                <tbody>
                  {(formData.expenses ?? []).map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {/* <td>
                        <input
                          type="text"
                          value={item.purpose ?? ''}
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
                          value={item.quantity ?? 0}
                          onChange={(e) => handleChange(e, index, "quantity")}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.unitPrice ?? ''}
                          onChange={(e) => handleChange(e, index, "unitPrice")}

                        />
                      </td>
                      {/* <td>{Number(item.amount )}</td> */}


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
            </div>

            {/* <div className="add-expense-container">
              <button onClick={addExpense} className="add-expense-btn no-print">+ Add Expense</button>
            </div> */}

            <div className="totals">
              <div>
                <label>Advance Received (INR)</label>
                <input type="number" min="0" name="advanceReceived" value={formData.advanceReceived ?? 0} onChange={handleChange} />
              </div>
              <div>
                <label>Adjustments with Advance (INR)</label>
                <input type="number" min="0" name="adjustments" value={formData.adjustments ?? 0} onChange={handleChange} />
              </div>
              <div>
                <label>Cash to be Returned to Office (INR)</label>
                <input type="number" min="0" name="cashReturned" value={formData.cashReturned ?? 0} onChange={handleChange} />
              </div>
            </div>

            <div className="final-totals">
              <div >
                <strong>Total Expense (INR):</strong> {calculateTotalExpense()}
              </div>
              <div className='final-totals1'>
                <strong>Total to be Received (INR):</strong> {isNaN(totalToReceive) ? "0.00" : totalToReceive.toFixed(2)}
              </div>
            </div>

            <div className="approval-section">
              <div className="approval-field">
                <label>Submitted By:</label>
                {/* <input type="text" value="" /> */}
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
          </div>
        )}

        {view === 'paymentDetails' && (
          <div className="claims-payment-container">
            <h2 className="form-title">Submitted Claims</h2>

            <div className="claims-list">
              {submittedClaims.length > 0 ? (
                <div className="table-container1">
                  <table className="claims-table">
                    <thead>
                      <tr className="tr1">
                        <th>Claim #</th>
                        <th>Employee Name</th>
                        <th>Total Expense</th>
                        <th>Date</th>
                        <th>Payment Status</th>
                        <th>Action</th>
                        <th>Bills</th>
                        <th>Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedClaims.map((claim, index) => (
                        <tr key={index} className={claim.paymentStatus === "Paid" ? "paid-claim" : ""}>
                          <td>{claim.claimNumber}</td>
                          <td>{claim.employeeName}</td>
                          <td>{typeof claim.totalExpense === "number" ? claim.totalExpense.toFixed(2) : "0.00"}</td>
                          <td>{claim.date}</td>
                          <td>{claim.paymentStatus || "Pending"}</td>
                          <td>
                            {claim.paymentStatus === "Paid" ? (
                              <span>✔</span>
                            ) : (
                              <button className="pay-btn" onClick={() => handleSelectClaim(claim)}>
                                Process Payment
                              </button>
                            )}
                          </td>


                          <td>
                            {claim.bills && claim.bills.length > 0 ? (
                              <div className="bill-actions">
                                {claim.bills.map((bill, billIndex) => (
                                  <div key={billIndex} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      onClick={() => handleViewServerBill(claim.claimNumber, billIndex)}
                                      className="view-bill-btn"
                                      title={`View Bill ${billIndex + 1}`}
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadServerBill(claim.claimNumber, billIndex)}
                                      className="download-bill-btn"
                                      title={`Download Bill ${billIndex + 1}`}
                                    >
                                      <Download size={16} />
                                    </button>
                                    <span style={{ fontSize: '0.8rem' }}>#{billIndex + 1}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'No bills'
                            )}
                          </td>


                          <td>
                            <button
                              onClick={() => {
                                if (claim.paymentStatus === "Pending") {
                                  handleDeleteClaim(claim.claimNumber);
                                } else {
                                  alert("Only pending claims can be deleted.");
                                }
                              }}
                              className={`delete-btn
                                  ${claim.paymentStatus !== "Pending"
                                  ? "cursor-not-allowed text-gray-400"
                                  : "text-red-500 hover:text-red-700"}
                                  `}
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>


                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-claims">
                  <p>No submitted claims found.</p>
                </div>
              )}
            </div>


            {selectedClaim && (
              <div className="payment-form" ref={paymentFormRef}>
                <h3>Process Payment for Claim #{selectedClaim.claimNumber}</h3>
                <div className="payment-details">
                  <div>
                    <label>Employee:</label>
                    <span>{selectedClaim.employeeName}</span>
                  </div>
                  <div>
                    <label>Total Amount:</label>
                    <span>{typeof selectedClaim.totalExpense === 'number' ? selectedClaim.totalExpense.toFixed(2) : '0.00'}</span>
                  </div>
                  <div>
                    <label>Payment Type</label>
                    <select name="paymentType" value={paymentData.paymentType} onChange={handlePaymentChange}>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {paymentData.paymentType === 'online' && (
                    <div>
                      <label>UTR Number</label>
                      <input
                        type="text"
                        name="utrNumber"
                        value={paymentData.utrNumber}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label>Payment Date</label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={paymentData.paymentDate}
                      onChange={handlePaymentChange}
                      required
                    />
                  </div>
                </div>
                <div className="payment-actions">
                  <button className="submit-payment-btn" onClick={handleSubmitPayment}>
                    Submit Payment
                  </button>
                  <button className="cancel-btn" onClick={() => setSelectedClaim(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}


            {/* {totalPages > 0 && (
              <div className="pagination-controls">
                <button
                  className="prev-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                >
                  &lt;
                </button>
                <span>Page {currentPage + 1} of {totalPages}</span>
                <button
                  className="next-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  &gt;
                </button>
              </div>
            )} */}

{totalPages > 0 && (
  <div className="pagination-controls">
    <button
      className="prev-btn"
      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
      disabled={currentPage === 0}
    >
      &lt;
    </button>
    <span>Page {currentPage + 1} of {totalPages}</span>
    <button
      className="next-btn"
      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
      disabled={currentPage === totalPages - 1}
    >
      &gt;
    </button>
  </div>
)}

          </div>
        )}

        {view === 'reportsView' && (
          <div className="reports-container">
            <h2 className="form-title">Claims and Payments Report</h2>

            <div className="report-actions">
              <button className="download-report-btn" onClick={downloadExcelReport}>
                Previous Year Report ⬇️
              </button>
            </div>

            <div className="report-table-container">
              <div className="report-table-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', paddingBottom: '10px' }}>
                <h3 className='cfy'>Current Financial Year Claim Details</h3>
                <button onClick={downloadExcel} style={{ marginLeft: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', background: 'unset', border: 'unset' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>

              {combinedReportData && combinedReportData.length > 0 ? (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Claim#</th>
                        <th>Date</th>
                        <th>Employee</th>
                        <th>ID</th>
                        <th>Total Expense</th>
                        <th>Payment Status</th>
                        <th>Payment Type</th>
                        <th>Payment Date</th>
                        <th>Bills</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinedReportData.map((item, index) => (
                        <tr key={index} className={item.paymentStatus === 'Paid' ? 'paid-claim' : ''}>
                          <td>{item.claimNumber}</td>
                          <td>{item.date}</td>
                          <td>{item.employeeName}</td>
                          <td>{item.employeeID}</td>
                          <td>{item.totalExpense.toFixed(2)}</td>
                          <td>{item.paymentStatus}</td>
                          <td>{item.paymentType || 'N/A'}</td>
                          <td>{item.paymentDate ? new Date(item.paymentDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            {item.bills && item.bills.length > 0 ? (
                              <div className="bill-actions">
                                {item.bills.map((bill, billIndex) => (
                                  <div key={billIndex} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      onClick={() => handleViewServerBill(item.claimNumber, billIndex)}
                                      className="view-bill-btn"
                                      title={`View Bill ${billIndex + 1}`}
                                    >
                                      <Eye size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDownloadServerBill(item.claimNumber, billIndex)}
                                      className="download-bill-btn"
                                      title={`Download Bill ${billIndex + 1}`}
                                    >
                                      <Download size={16} />
                                    </button>
                                    <span style={{ fontSize: '0.8rem' }}>#{billIndex + 1}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              'No bills'
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No current year data available.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClaimForm;