const consolelog = require('../Tools/consolelog');
const { logEvents } = require('./logEvents');

const errorHandler = async(err, req, res, next) => {

  let messageDeRetour;
  if (res.messageRetour){
    messageDeRetour = res.messageRetour;
  } else {
    messageDeRetour = `Erreur interne. (Contactez un administrateur)`
  }
  
  await logEvents(`${err.name}: ${err.message} \n${err.stack}`, 'errLog.txt');
  
  if (err.name === 'RateLimitError') {
    return res.status(429).json({message: "Erreur interne. (Contactez un administrateur)", error: 'Stop le spam!'});
  } else {
    return res.status(500).json({message: messageDeRetour, error: err.message});
  }
};

module.exports = errorHandler;
