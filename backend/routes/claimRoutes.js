const express = require('express');
const claimController = require('../controllers/claimController');

const router = express.Router();

// router.post('/api/claims', claimController.createClaim);
router.get('/api/claims', claimController.getAllClaims);
router.get('/api/claims/:claimNumber(*)', claimController.getClaimByNumber);
router.get('/api/claim-details', claimController.getClaimByNumberQuery);
router.get('/api/claims-with-status', claimController.getClaimsWithStatus);
router.get('/api/new-claim-number', claimController.getNewClaimNumber);
router.get('/api/combined-report', claimController.getCombinedReport);
// router.get('/api/claims/current-year', claimController.getCurrentYearClaims);
// router.get('/api/claims/previous-year-report', claimController.getPreviousYearReport);
router.post("/api/claims", claimController.upload, claimController.createClaim);
router.get("/claims/:claimNumber(*)/bill/:billIndex?", claimController.getBill);
router.delete("/api/claims/:claimNumber(*)", claimController.deleteClaim);

module.exports = router;