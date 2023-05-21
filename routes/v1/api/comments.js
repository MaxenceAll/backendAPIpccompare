const express = require('express');
const router = express.Router();
const config = require("../../../config/config")
const commentsControllerPath = require.resolve(`../../../controllers/${config.API.VERSION}/api/commentsController`);
const commentsController = require(commentsControllerPath);

// From :root/comments to :
router.get('/:Id_customer_to_find', async (req, res) => {
    await commentsController.getAllCommentsByIdCustomer(req, res);
  });
router.put('/', async (req, res) => {
  await commentsController.addComment(req, res);
});
router.delete('/:Id_comment_to_find', async (req, res) => {
  await commentsController.deleteComment(req, res);
});
router.patch('/:Id_comment_to_find', async (req, res) => {
  await commentsController.modifyComment(req, res);
});

module.exports = router;