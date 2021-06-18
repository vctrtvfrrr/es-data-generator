function odds(mode = "services") {
  if (mode) {
    return {
      saleInStore: 0.001,
      sale: 0.9,
      telephony: 0.03,
      newContact: 0.3,
      newCompanyContact: 0.0009,
      newProduct: 0.00003,
    };
  }

  return {
    saleInStore: 0.08,
    sale: 0.4,
    telephony: 0.0003,
    newContact: 0.0005,
    newCompanyContact: 0.0001,
    newProduct: 0.001,
  };
}

export default odds;
