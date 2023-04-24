const jwt = require('jsonwebtoken');
const consolelog = require('../Tools/consolelog');
const { query } = require('../services/database.service');
const config = require('../config/config');
const bcrypt = require('bcrypt');

async function handleRefreshToken(req, res) {
  consolelog("// Appel de la fonction refreshToken");
  consolelog("test de req.cookies?.refreshToken",req.cookies?.refreshToken)
  if (req.cookies?.refreshToken) {
    consolelog("Réception du cookie suivant :", req.cookies?.refreshToken);
    // Destructuring refreshToken from cookie
    const refreshToken = req.cookies.refreshToken;

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
        );
        consolelog("yo le decoded refreshToken is :",decoded)
        if (!decoded.id_account) {
        // TODO si la verif est KO il faut un return avec msg d'erreur.
        throw new Error("Refresh token invalide !");
      }
      const sql = `SELECT * FROM account WHERE id = ?`;
      const [user] = await query(sql, [decoded.id_account]);
      if (!user) {
        // TODO return ici pas error
        throw new Error("User not found");
      }
      consolelog("++ L'utilisateur trouvé est :", user);
      const sql2 = `SELECT * FROM customer WHERE id_account = ?`;
      const [customer] = await query(sql2, [user.id]);
      consolelog("++ Customer trouvé est :", customer);

      // Generate new access token
      const data = { ...user, ...customer };
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });
      consolelog(
        "__ Génération d'un nouveau token d'access grace au token refresh sécurisé !"
      );

      // Generate new refresh token
      const newRefreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "10d",
      });

      //TODO a supprimer.
      // Update refresh token in database
      // const sql3 = `UPDATE account SET refresh_token = ? WHERE id = ?`;
      // await query(sql3, [newRefreshToken, user.id]);

      // Set new refresh token cookie in response

      //TODO var maxAge
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000,
      });

      // Send new token in response
      res.status(200).json({
        result: true,
        message: "Token refreshed",
        accessToken,
      });
    } catch (error) {
      console.error(`Error in refreshToken: ${error}`);
      res.status(406).json({ message: "Unauthorized 1 " });
    }
  } else {
    return res.json({ message: "No refresh token found, you need to login" });
  }
}

module.exports = { handleRefreshToken };
