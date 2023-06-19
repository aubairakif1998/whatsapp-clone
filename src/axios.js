import axios from "axios";

const instance = axios.create({
  baseURL: "https://whatsapp-backend-five.vercel.app",
});

export default instance;
