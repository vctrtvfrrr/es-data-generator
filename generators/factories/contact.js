import faker from "faker";

function contactFactory(eventDate, attributes = {}) {
  const domainWord = faker.internet.domainWord();
  const domain = `${domainWord}.com`;

  const name = faker.name.findName();

  const data = {
    name,
    surname: name.split(" ")[0],
    photo: faker.system.commonFileName("jpg"),
    birth: faker.date.between(new Date(1970, 0, 1), new Date(1990, 11, 31)),
    phone: faker.phone.phoneNumber("(#1) 3###-####"),
    email: faker.internet.email(null, null, domain).toLowerCase(),
    website: `https://www.${domain}`,
    messenger: `@${domainWord}`,
    address:
      faker.address.streetName() +
      ", " +
      faker.datatype.number({ min: 5, max: 10000 }) +
      ", " +
      faker.address.city() +
      " - " +
      faker.address.stateAbbr() +
      ", " +
      faker.address.zipCode("#####-###"),
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
