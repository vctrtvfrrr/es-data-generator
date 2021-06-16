import server from "./server";
import { checkConnection } from "./elastic";

(function main() {
  if (checkConnection()) server.start();
})();
