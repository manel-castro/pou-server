import mongoose from "mongoose";
import { app } from "./app";

process.env.JWT_KEY = "JSON_WEB_TOKEN_KEY";

const start = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://cluster0.bzo9wnv.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority",
      {
        ssl: true,
        sslValidate: true,
        // For example, see https://medium.com/@rajanmaharjan/secure-your-mongodb-connections-ssl-tls-92e2addb3c89
        // for where the `rootCA.pem` file comes from.
        // Please note that, in Mongoose >= 5.8.3, `sslCA` needs to be
        // the **path to** the CA file, **not** the contents of the CA file
        // sslCA: `${__dirname}/mongo-cert.cer`,
        sslKey: `${__dirname}/assets/mongo-cert.cer`,
        sslCert: `${__dirname}/assets/mongo-cert.cer`,
      }
    );
    console.log("Connected to mongodb");
  } catch (e) {
    console.log("error: ", e);
  }
  app.listen(3000, () => {
    console.log("listening to 3000. http://localhost:3000");
  });
};

start();
