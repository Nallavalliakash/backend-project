import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./env",
});

connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`SERVER IS RUNNING AT ${process.env.PORT}`);
  });
});
app
  .on("error", (error) => {
    console.log("error:", error);
    throw error;
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION FAIL:", ERROR);
  });

/*
const app = express()(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`app is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("ERROR:", error);
    throw err;
  }
})();*/
