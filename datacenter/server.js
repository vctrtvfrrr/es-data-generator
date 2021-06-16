import express from "express";
import cors from "cors";
import mariadb from "./mariadb";
import { esclient } from "./elastic";

const app = express();
const port = process.env.PORT || 3319;

function requestHandler() {
  const router = express.Router();

  router.post("/log", async (req, res) => {
    try {
      await esclient.index(req.body);
      await mariadb.save(req.body);
      res.status(204);
    } catch (err) {
      res.status(500).json({ error: "Ocorreu um erro." });
      console.log(err);
    }
  });

  return router;
}

function start() {
  return app
    .use(cors())
    .use(express.json({ extended: false }))
    .use(express.urlencoded({ extended: true }))
    .use("/", requestHandler())
    .listen(port, () => console.log(`Servidor iniciado na porta: ${port}`));
}

export default { start };
