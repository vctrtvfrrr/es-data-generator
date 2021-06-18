import faker from "faker";

function callFactory(eventDate, attributes = {}) {
  const status = faker.random.arrayElement([
    "Atendida",
    "Ocupado",
    "Não atendida",
  ]);

  const type = faker.random.arrayElement(["in", "out"]);

  const duration =
    status === "Atendida" ? faker.datatype.number({ min: 3, max: 3000 }) : 0;

  const callPrice = faker.datatype.number({
    min: 0.15,
    max: 0.79,
    precision: 0.01,
  });

  const cost = type === "in" ? 0 : callPrice * (duration / 60);

  const data = {
    phone: faker.phone.phoneNumber("+550#13#######"),
    type: faker.random.arrayElement(["in", "out"]),
    status,
    duration,
    date: eventDate,
    cost: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cost),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default callFactory;
