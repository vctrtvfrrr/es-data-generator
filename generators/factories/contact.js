import faker from "faker";

function contactFactory(eventDate, attributes = {}) {
  const domainWord = faker.internet.domainWord();
  const domain = `${domainWord}.com`;

  const data = {
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber("(#1) 3###-####"),
    type: faker.random.arrayElement([
      "Cliente",
      "Fornecedor",
      "Concorrente",
      "Parceiro",
      "Outro",
    ]),
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
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default contactFactory;
