import faker from "faker";

function productFactory(eventDate, attributes = {}) {
  const data = {
    name: faker.fake("{{commerce.department}}: {{commerce.productName}}"),
    description: faker.fake(
      "{{commerce.productAdjective}} {{commerce.productMaterial}} {{commerce.product}}"
    ),
    price: new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(
      faker.datatype.number({
        min: 1,
        max: 200,
        precision: 0.01,
      })
    ),
    created_at: eventDate,
  };

  return Object.assign(data, attributes);
}

export default productFactory;
