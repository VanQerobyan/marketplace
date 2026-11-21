const express = require('express');
const controller = require('../controllers/payment.controller');
const authenticate = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { checkoutValidator, confirmPaymentValidator, purchasesValidator } = require('../validators/payment.validator');

const router = express.Router();
router.use(authenticate);
router.get('/config', controller.getConfig);
router.post('/checkout', checkoutValidator, validateRequest, controller.createCheckout);
router.post('/confirm', confirmPaymentValidator, validateRequest, controller.confirmPayment);
router.get('/mine', purchasesValidator, validateRequest, controller.getMyPurchases);

module.exports = router;
