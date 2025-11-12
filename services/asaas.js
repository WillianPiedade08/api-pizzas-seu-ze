// services/asaas.js
const axios = require("axios");

const asaas = axios.create({
  baseURL: process.env.ASAAS_BASE_URL || "https://sandbox.asaas.com/api/v3",
  headers: {
    Authorization: `Bearer ${process.env.ASAAS_API_KEY}`,
    "Content-Type": "application/json",
  },
});

module.exports = asaas;