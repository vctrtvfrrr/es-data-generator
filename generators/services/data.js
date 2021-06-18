const state = {};

state.methods = {
  myCompany() {
    return state.companies ? state.companies.find((i) => i.id === 1) : null;
  },
};

export default new Proxy(state, {
  get: (target, prop) => {
    if (target.methods[prop] !== undefined) return target.methods[prop];
    return target[prop] !== undefined ? target[prop] : [];
  },
  set: (target, prop, value) => {
    if (!Array.isArray(target[prop])) target[prop] = [];
    value.id = target[prop].length + 1;
    target[prop].push(value);
    return true;
  },
});
