import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3319/",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default {
  save(collection, data) {
    try {
      API.post("/log", { index: collection, body: data });
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
      console.log(error.config);
    }
  },
};
