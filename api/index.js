import express from "express";
import cors from "cors";
import { config } from "dotenv";
config(); // Carega as variáveis do .env

const app = express();
const { PORT } = process.env;

//Import das rotas da aplicação
import RotasJogadores from "./routes/jogador.js";

app.use(express.json()); //Habilita o parse do JSON
app.use(cors());

// Rota de conteúdo público
app.use("/", express.static("public"));

// Removendo o X-powered by por segurança
app.disable("x-powered-by");

// Configurando o favicon
app.use(
  "/favicon.ico",
  express.static(
    "public/images/png-transparent-technology-computer-icons-technology-electronics-text-logo-thumbnail.png"
  )
);

//rotas da api
app.use("/api/jogadores", RotasJogadores);

// Rota default
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "API Fatec 100% funcional 👨‍💻",
    version: "1.0.0",
  });
});

// Listen
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
