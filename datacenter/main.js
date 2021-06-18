import express from "express";
import cors from "cors";
// import mariadb from "./mariadb";
import { checkElasticConnection, esclient } from "./elastic";

const app = express();
const port = process.env.PORT || 3319;

async function dataController(req, res) {
  try {
    // await saveOnMariaDB(req.body);
    // await saveOnElasticsearchOneIndex("empresa_xyz", req.body);
    await saveOnElasticsearchMultipleIndexes(req.body);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Ocorreu um erro." });
    console.log(err);
  }
}

async function saveOnMariaDB(payload) {
  return await mariadb.save(payload);
}

async function saveOnElasticsearchOneIndex(index, payload) {
  const body = {};
  Object.keys(payload.body).forEach((key) => {
    let value = payload.body[key];

    if (Array.isArray(value)) {
      const newValue = [];
      value.forEach((item) => {
        const newItem = {};
        Object.keys(item).forEach((k) => (newItem[`${key}_${k}`] = item[k]));
        newValue.push(newItem);
      });
      value = newValue;
    }

    body[`${payload.index}_${key}`] = value;
  });

  return await esclient.index({ index, body });
}

async function saveOnElasticsearchMultipleIndexes(payload) {
  await esclient.index({
    index: `empresa_xyz_${payload.index}`,
    body: payload.body,
  });
}

function startServer() {
  return app
    .use(cors())
    .use(express.json({ extended: false }))
    .use(express.urlencoded({ extended: true }))
    .post("/log", dataController)
    .listen(port, () => console.log(`Servidor iniciado na porta: ${port}`));
}

(function main() {
  if (!checkElasticConnection()) process.exit(1);
  startServer();
})();
