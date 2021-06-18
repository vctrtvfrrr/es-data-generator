import faker from "faker";

function companyFactory(eventDate, attributes = {}) {
  const domainWord = faker.internet.domainWord();
  const domain = `${domainWord}.com`;

  const data = {
    name: faker.company.companyName(),
    type: faker.random.arrayElement([
      "Cliente",
      "Fornecedor",
      "Concorrente",
      "Parceiro",
      "Outro",
    ]),
    category: Math.random() > 0.7 ? "services" : "goodies",
    anual_revenue: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      faker.datatype.number({
        min: 45000,
        max: 16000000,
        precision: 0.01,
      })
    ),
    phone: faker.phone.phoneNumber("(#1) 3###-####"),
    contact: faker.name.findName(),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default companyFactory;
