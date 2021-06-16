import faker from "faker";

function serviceFactory(eventDate, attributes = {}) {
  const data = {
    name: `${faker.commerce.department()} service`,
    description: faker.lorem.sentence(),
    price: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      faker.datatype.number({
        min: 100,
        max: 15000,
        precision: 0.01,
      })
    ),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default serviceFactory;
