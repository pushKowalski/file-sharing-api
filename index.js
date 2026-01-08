import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT ?? 7000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`💻💻 Server is up and running on port: ${PORT}`);
});
