const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');


router.get('/', async (req, res) => {
  await accountController.selectAllAccount(req, res);
});

module.exports = router;
