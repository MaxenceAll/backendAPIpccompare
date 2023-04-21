const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');


router.get('/', async (req, res) => {
  await accountController.selectAll(req, res);
});

module.exports = router;
