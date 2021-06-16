import faker from "faker";

function arrayRandom(array, numElements = 1) {
  const result = [];

  for (let n = 0; n < numElements; n++) {
    result.push(faker.random.arrayElement(array));
  }

  return result;
}

export default arrayRandom;
