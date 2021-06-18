import faker from "faker";
import moment from 'moment'
import { Random } from "random-js";
import odds from "./odds";
import API from "./services/api";
import Data from "./services/data";
import arrayRandom from "./utils/arrayRandom";
import forEachMinute from "./utils/forEachMinute";

import callFactory from "./factories/call";
import companyFactory from "./factories/company";
import contactFactory from "./factories/contact";
import dealFactory from "./factories/deal";
import productFactory from "./factories/product";
import saleFactory from "./factories/sale";
import serviceFactory from "./factories/service";

const random = new Random();

const foundationDate = new Date("1993-06-01 16:32:00");

async function generateBasicInformation() {
  // Initial company registration
  const company = companyFactory(foundationDate, { type: "Matriz" });
  await API.save("companies", company);
  Data.companies = company;

  // Initial company's products
  let numProducts = faker.datatype.number({ min: 5, max: 30 });
  if (company.category === "goodies") numProducts *= 10;
  for (let i = 0; i < numProducts; i++) {
    if (company.category === "services") {
      const service = serviceFactory(foundationDate);
      await API.save("services", service);
      Data.services = service;
    } else {
      const product = productFactory(foundationDate);
      await API.save("products", product);
      Data.products = product;
    }
  }

  // Initial company's contacts
  let numContacts = faker.datatype.number({ min: 10, max: 70 });
  for (let i = 0; i < numContacts; i++) {
    const contact = contactFactory(foundationDate, {
      type: faker.random.arrayElement(["Cliente", "Fornecedor", "Parceiro"]),
    });
    await API.save("contacts", contact);
    Data.contacts = contact;
  }

  // Initial company's companies
  Data.contacts.forEach(async (c) => {
    if (["Fornecedor", "Parceiro"].includes(c.type)) {
      await API.save(
        "companies",
        companyFactory(foundationDate, {
          type: c.type,
          phone: c.phone,
          email: c.email,
          website: c.website,
          messenger: c.messenger,
          address: c.address,
          contact: c.name,
        })
      );
    }
  });
}

async function newSaleInStore({ mode, index, today }) {
  const modeSwitch = {
    services: {
      c: "deals",
      f: dealFactory,
      a: "services",
      t: `Projeto #${index}`,
      l: "Novo projeto fechado",
    },
    goodies: {
      c: "sales",
      f: saleFactory,
      a: "products",
      t: `Venda #${index}`,
      l: "Nova venda realizada",
    },
  };

  let numCartItems = Data[modeSwitch[mode].a].length;
  if (mode === "goodies") numCartItems /= 10;

  const item = modeSwitch[mode].f(
    today,
    arrayRandom(
      Data[modeSwitch[mode].a],
      faker.datatype.number({ min: 1, max: numCartItems })
    ),
    { name: modeSwitch[mode].t }
  );
  await API.save(modeSwitch[mode].c, item);
  Data[modeSwitch[mode].c] = item;
  console.log(today, modeSwitch[mode].l);
}

async function newPhoneCall({ mode, index, today, p }) {
  const call = callFactory(today);
  console.log(today, "Nova ligação telefônica");

  // Outgoing call or not answered
  if (call.type !== "in" || call.status !== "Atendida") {
    await API.save("calls", call);
    Data.calls = call;
    return;
  }

  let contact = {};

  // Possibility of being an existing customer
  if (!random.bool(p.newContact)) {
    contact = faker.random.arrayElement(Data.contacts);
    console.log(today, "-- Ligação de um cliente existente");
  } else {
    contact = contactFactory(today, { type: "Cliente" });
    await API.save("contacts", contact);
    Data.contacts = contact;
    console.log(today, "-- Ligação de um novo cliente");

    // Possibility of the client being a legal entity
    if (p.newCompanyContact) {
      const item = companyFactory(today, {
        type: contact.type,
        phone: contact.phone,
        email: contact.email,
        website: contact.website,
        messenger: contact.messenger,
        address: contact.address,
        contact: contact.name,
      });
      await API.save("companies", item);
      Data.companies = item;
      console.log(today, "---- O novo cliente é pessoa jurídica");
    }
  }

  call.phone = "+550" + contact.phone.replace(/[^\d]/g, "");
  await API.save("calls", call);

  // Possibility of purchase by phone call
  if (random.bool(p.sale)) {
    newSaleInStore({
      mode,
      index,
      today: moment(today).add(call.duration, 'seconds').toDate(),
      attrs: {
        client: contact.name,
        source: "Telefone",
      },
    });
  }
}

async function newProductOrServiceInCatalog({ mode, today }) {
  const modeSwitch = {
    services: {
      c: "services",
      f: serviceFactory,
      l: "Novo serviço adicionado ao catálogo",
    },
    goodies: {
      c: "products",
      f: productFactory,
      l: "Novo produto adicionado ao catálogo",
    },
  };

  const item = modeSwitch[mode].f(today);
  await API.save(modeSwitch[mode].c, item);
  Data[modeSwitch[mode].c] = item;
  console.log(today, modeSwitch[mode].l);
}

(async function main() {
  console.log("Cadastro inicial dos dados da empresa");
  await generateBasicInformation();

  const myCompany = Data.myCompany();

  // Probability of events happening
  const p = odds(myCompany.category);
  const ctx = { mode: myCompany.category, p };

  // For every minute since the company's founding
  console.log("Iniciando as atividades da empresa");
  await forEachMinute(foundationDate, async (currentDate, index) => {
    ctx.index = index + 1;
    ctx.today = currentDate;

    // Possibility of sale in the physical store
    if (random.bool(p.saleInStore) && random.bool(p.sale)) {
      await newSaleInStore(ctx);
    }

    // Possibility of making a phone call
    if (random.bool(p.telephony)) {
      await newPhoneCall(ctx);
    }

    // Possibility of a new product/service entering the catalog
    if (random.bool(p.newProduct)) {
      await newProductOrServiceInCatalog(ctx);
    }
  });
})();
