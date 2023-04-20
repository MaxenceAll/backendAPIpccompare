const consolelog = require("../Tools/consolelog");
const config = require("../config/config");
const { query } = require("../services/database.service");
const mailer = require("../services/mailer.service");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function selectAll(req, res) {
  consolelog("// Appel de la method selectAll //");
  const sql = `SELECT * FROM account WHERE deletedBy = ?`;
  try {
    const data = await query(sql, [0]);
    consolelog("---> Sortie de la method selectAll de database.service. //");
    res.status(200).json({
      data,
      result: true,
      message: `All rows of table account have been selected`,
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

async function sendVerifMail(req, res) {
  // Get user data from request body
  const { email, password, pseudo, firstname, lastname } = req.body;
  // Hash the password
//   const hashedPassword = await bcrypt.hash(password, 10);
  const hash = bcrypt.hashSync(password, 10);
  const hashedPassword = hash.replace(config.hash.prefix, "");
  // Generate JWT with payload
  const payload = { email, hashedPassword, pseudo, firstname, lastname };
  const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // Send email to verify user's email
  const emailOptions = {
    to: email,
    subject: "Vérifiez votre compte PCCompare",
    html: `Cliquez ici pour valider votre compte : <a href="${config.FRONTEND.URL}/account/register/verify?${jwtToken}">Verifier Email</a>`,
  };
  try {
    const retourMailer = await mailer.send(emailOptions);
    consolelog(`Verification email sent to ${email}`);
    consolelog("le retourMailer est = à:", retourMailer);
    res.status(200).json({ message: "Verification email sent." });
  } catch (error) {
    consolelog(`Error sending verification email to ${email}: ${error}`);
    res.status(500).json({ message: "Error sending verification email." });
  }
}

async function verifySentMail(req, res) {
    const token = req.url.split("?")[1];
    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Decode the token using the JWT_SECRET
      const { email, hashedPassword, pseudo, firstname, lastname } = decodedToken; // Extract the user data from the decoded token
      const password = hashedPassword;
  
      // Validate user data
      if (!email || !password || !pseudo || !firstname || !lastname) {
        consolelog("User data in token is invalid");
        return res.status(400).json({ message: "Invalid user data in token" });
      }
  
      // Insert new user into the database
      const sql = "INSERT INTO account (email, password, createdBy) VALUES (?, ?, ?)";
      const params = [email, password, "site"];
      const result = await query(sql, params);
      const insertId = result.insertId;
      consolelog(`User ${email} added to database account`);
  
      // Insert new user into customer database
      const sql2 = "INSERT INTO customer (pseudo, firstname, lastname, id_role, id_account) VALUES (?, ?, ?, ?, ?)";
      const params2 = [pseudo, firstname, lastname, "0", insertId];
      await query(sql2, params2);
      consolelog(`Customer ${pseudo} added to database customer`);
  
      // Return a success message
      res.status(200).json({
        message: `Verification email for ${email} has been successfully processed and account of ${pseudo} created successfully.`,
      });
    } catch (error) {
      consolelog(`Error while inserting user data: ${error}`);
      res.status(500).json({
        message: "An error occurred while processing your request.",
        error: error.message,
      });
    }
  }
  



module.exports = { selectAll, sendVerifMail, verifySentMail };
