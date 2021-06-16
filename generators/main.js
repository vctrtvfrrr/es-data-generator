import faker from "faker";
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

const foundationDate = new Date("2021-06-01 16:32:00");

function generateBasicInformation() {
  // Initial company registration
  const company = companyFactory(foundationDate, { type: "Matriz" });
  API.save("companies", company);
  Data.companies = company;

  // Initial company's products
  let numProducts = faker.datatype.number({ min: 5, max: 30 });
  if (company.category === "goodies") numProducts *= 10;
  for (let i = 0; i < numProducts; i++) {
    if (company.category === "services") {
      const service = serviceFactory(foundationDate);
      API.save("services", service);
      Data.services = service;
    } else {
      const product = productFactory(foundationDate);
      API.save("products", product);
      Data.products = product;
    }
  }

  // Initial company's contacts
  let numContacts = faker.datatype.number({ min: 10, max: 70 });
  for (let i = 0; i < numContacts; i++) {
    const contact = contactFactory(foundationDate, {
      type: faker.random.arrayElement(["Cliente", "Fornecedor", "Parceiro"]),
    });
    API.save("contacts", contact);
    Data.contacts = contact;
  }

  // Initial company's companies
  Data.contacts.forEach((c) => {
    if (["Fornecedor", "Parceiro"].includes(c.type)) {
      API.save(
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

function newSaleInStore({ mode, index, today }) {
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

  API.save(
    modeSwitch[mode].c,
    modeSwitch[mode].f(
      today,
      arrayRandom(
        Data[modeSwitch[mode].a],
        faker.datatype.number({ min: 1, max: numCartItems })
      ),
      { name: modeSwitch[mode].t }
    )
  );
  console.log(today, modeSwitch[mode].l);
}

function newPhoneCall({ mode, index, today, p }) {
  const call = callFactory(today);
  API.save("calls", call);
  console.log(today, "Nova ligação telefônica");

  // Possibility of being a new customer
  if (
    call.type !== "Entrante" ||
    call.status !== "Atendida" ||
    !random.bool(p.newContact)
  ) {
    console.log(today, "-- Ligação de um cliente existente");

    // Purchase by phone call
    if (random.bool(p.sale)) newSaleInStore({ mode, index, today });

    return;
  }

  const contact = contactFactory(today, { type: "Cliente" });
  API.save("contacts", contact);
  console.log(today, "-- Ligação de um novo cliente");

  // Possibility of the client being a legal entity
  if (p.newCompanyContact) {
    API.save(
      "companies",
      companyFactory(today, {
        type: contact.type,
        phone: contact.phone,
        email: contact.email,
        website: contact.website,
        messenger: contact.messenger,
        address: contact.address,
        contact: contact.name,
      })
    );
    console.log(today, "---- O novo cliente é pessoa jurídica");

    // Purchase by phone call
    newSaleInStore({ mode, index, today });
  }
}

function newProductOrServiceInCatalog({ mode, today }) {
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

  API.save(modeSwitch[mode].c, modeSwitch[mode].f(today));
  console.log(today, modeSwitch[mode].l);
}

(function main() {
  console.log("Cadastro inicial dos dados da empresa");
  generateBasicInformation();

  const myCompany = Data.myCompany();

  // Probability of events happening
  const p = odds(myCompany.category);
  const ctx = { mode: myCompany.category, p };

  // For every minute since the company's founding
  console.log("Iniciando as atividades da empresa");
  forEachMinute(foundationDate, (currentDate, index) => {
    ctx.index = index + 1;
    ctx.today = currentDate;

    // Possibility of sale in the physical store
    if (random.bool(p.saleInStore) && random.bool(p.sale)) {
      newSaleInStore(ctx);
    }

    // Possibility of making a phone call
    if (random.bool(p.telephony)) {
      newPhoneCall(ctx);
    }

    // Possibility of a new product/service entering the catalog
    if (random.bool(p.newProduct)) {
      newProductOrServiceInCatalog(ctx);
    }

    // Possibility of a product/service leaving the catalog
    if (random.bool(p.removeProduct)) {
      if (myCompany.category === "services") {
        API.save("services", serviceFactory(currentDate));
        console.log(currentDate, "Serviço removido do catálogo");
      } else {
        API.save("products", productFactory(currentDate));
        console.log(currentDate, "Produto removido do catálogo");
      }
    }
  });
})();
