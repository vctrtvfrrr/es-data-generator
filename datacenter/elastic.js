import { Client } from "@elastic/elasticsearch";

export const esclient = new Client({
  node: "http://localhost:9200",
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true,
});

export async function checkElasticConnection() {
  console.log("Verificando conexão com o ElasticSearch...");
  let isConnected = false;
  while (!isConnected) {
    await esclient.cluster.health({});
    console.log("Conectado com sucesso ao ElasticSearch");
    isConnected = true;
  }
}
