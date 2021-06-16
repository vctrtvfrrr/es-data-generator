import faker from "faker";
import serviceFactory from "./product";

function dealFactory(eventDate, services = [], attributes = {}) {
  if (services.length === 0) {
    const numServices = faker.datatype.number({ min: 1, max: 5 });
    for (let i = 0; i < numServices; i++) {
      services.push(serviceFactory(eventDate));
    }
  }

  let amount = 0;
  services.forEach(
    (p) =>
      (amount += Number(p.price.replace(/[^0-9,-]+/g, "").replace(",", ".")))
  );

  const stage = faker.random.arrayElement([
    "Requisitos",
    "Análise",
    "Em Desenvolvimento",
    "Finalizado",
  ]);
  const startDate = faker.date.between(new Date(2020, 0, 1), new Date());

  const data = {
    name: `Projeto #${faker.datatype.number()}`,
    stage,
    services,
    start_date: startDate,
    end_date:
      stage === "Finalizado" ? faker.date.between(startDate, new Date()) : null,
    amount: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount),
    client: faker.company.companyName(),
    responsible: faker.name.findName(),
    recurring: faker.random.arrayElement([
      "Não se repete",
      "Mensal",
      "Bimestral",
      "Trimestral",
      "Semestral",
      "Anual",
    ]),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default dealFactory;
