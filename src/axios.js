import axios from "axios";

const instance = axios.create({
  baseURL: "https://whatsapp-backend-1zc2.vercel.app/",
});

export default instance;
