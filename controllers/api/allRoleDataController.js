const consolelog = require("../../Tools/consolelog");
const config = require("../../config/config");
const { query } = require("../../services/database.service");

async function selectAll(req, res) {
  consolelog("// Appel de la method selectAll de allRoleDataController //");
  const sql = `SELECT *  FROM role`;
  try {
    const data = await query(sql);
    consolelog(
      "---> Sortie de la method selectAll de allRoleDataController. //"
    );
    // consolelog("yo la data trouvée est :",data)
    res.status(200).json({
      data,
      result: true,
      message: `All rows of table account+customer have been selected`,
    });
  } catch (err) {
    consolelog(`++ !!!! Erreur attrapée : (voir le retour).`);
    res.status(500).json({
      data: null,
      result: false,
      message: err.message,
    });
  }
}

module.exports = { selectAll };
