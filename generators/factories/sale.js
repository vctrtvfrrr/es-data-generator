import faker from "faker";
import productFactory from "./product";

function saleFactory(eventDate, products = [], attributes = {}) {
  if (products.length === 0) {
    const numProducts = faker.datatype.number({ min: 1, max: 3 });
    for (let i = 0; i < numProducts; i++) {
      products.push(productFactory(eventDate));
    }
  }

  let amount = 0;
  products.forEach(
    (p) =>
      (amount += Number(p.price.replace(/[^0-9,-]+/g, "").replace(",", ".")))
  );

  const data = {
    name: `Venda #${faker.datatype.number()}`,
    amount: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount),
    client: faker.name.findName(),
    source: faker.random.arrayElement([
      "Telefone",
      "E-mail",
      "Site",
      "Publicidade",
      "Indicação",
      "Cliente existente",
      "Recomendação",
      "Loja física",
      "Outro",
    ]),
    products,
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default saleFactory;
