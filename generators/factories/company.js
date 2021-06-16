import faker from "faker";

function companyFactory(eventDate, attributes = {}) {
  const domainWord = faker.internet.domainWord();
  const domain = `${domainWord}.com`;

  const data = {
    name: faker.company.companyName(),
    logo: faker.system.commonFileName("jpg"),
    type: faker.random.arrayElement([
      "Cliente",
      "Fornecedor",
      "Concorrente",
      "Parceiro",
      "Outro",
    ]),
    industry: faker.random.arrayElement([
      "Tecnologia da Informação",
      "Telecomunicações",
      "Fábricação",
      "Instituição Bancária",
      "Consultoria",
      "Instituição Financeira",
      "Instituição Governamental",
      "Logística/Entrega",
      "Lazer",
      "Organização Não Governamental",
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
    email: faker.internet.email(null, null, domain).toLowerCase(),
    website: `https://www.${domain}`,
    messenger: `@${domainWord}`,
    contact: faker.name.findName(),
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
    employees: faker.random.arrayElement([
      "1-10",
      "10-50",
      "50-250",
      "250-500",
      "500+",
    ]),
    comment: faker.lorem.sentence(),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default companyFactory;
