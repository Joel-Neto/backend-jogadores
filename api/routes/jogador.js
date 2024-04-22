import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from "express-validator";

const router = express.Router();
const { db, ObjectId } = await connectToDatabase();
const nomeCollection = "jogadores";

const validaJogador = [
  check("nome")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o nome")
    .isLength({ min: 1, max: 50 }),
  check("numero_camisa")
    .not()
    .isEmpty()
    .trim()
    .withMessage("O número da camisa é obrigatória")
    .isLength({ min: 1 })
    .isAlphanumeric("pt-BR", { ignore: "/. " })
    .withMessage("O número da  camisa  não pode conter caracteres especiais"),
  check("posicao")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar a posição"),
  check("time")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o time"),
  check("cep")
    .not()
    .isEmpty()
    .trim()
    .withMessage("É obrigatório informar o CEP")
    .isNumeric()
    .withMessage("O CEP deve ter apenas números")
    .isLength({ min: 8, max: 8 })
    .withMessage("O CEP informado é inválido"),
  check("endereco.logradouro")
    .notEmpty()
    .withMessage("O logradouro é obrigatório"),
  check("endereco.bairro").notEmpty().withMessage("O bairro é obrigatório"),
  check("endereco.localidade")
    .notEmpty()
    .withMessage("Localidade é obrigatória"),
  check("endereco.uf").isLength({ min: 2, max: 2 }).withMessage("UF inválida"),
  check("data_inicio_atividade")
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage("O formato de data é inválido. Informe yyyy-mm-dd"),
];

/**
 * GET /api/jogadores
 * Lista todos os jogadores
 * Parâmetros: limit, skip e order
 */
router.get("/", async (req, res) => {
  const { limit, skip, order } = req.query; //Obter da URL
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find()
      .limit(parseInt(limit) || 10)
      .skip(parseInt(skip) || 0)
      .sort({ order: 1 })
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      message: "Erro ao obter a listagem dos jogadores",
      error: `${err.message}`,
    });
  }
});

/**
 * GET /api/jogadores/id/:id
 * Lista o jogador pelo id
 * Parâmetros: id
 */
router.get("/id/:id", async (req, res) => {
  try {
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({ _id: { $eq: new ObjectId(req.params.id) } }, {})
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: "Erro ao obter o jogador pelo ID",
          param: "/id/:id",
        },
      ],
    });
  }
});

/**
 * GET /api/jogadores/razao/:filtor
 * Lista o prestador de serviço pela razão social
 * Parâmetros: filtro
 */
router.get("/nome/:nome/:numero_camisa", async (req, res) => {
  try {
    const nome = req.params.nome;
    const numeroCamisa = req.params.numero_camisa;
    const docs = [];
    await db
      .collection(nomeCollection)
      .find({
        $or: [{ nome: nome }, { numero_camisa: { $eq: Number(numeroCamisa) } }],
      })
      .forEach((doc) => {
        docs.push(doc);
      });
    res.status(200).json(docs);
  } catch (err) {
    res.status(500).json({
      errors: [
        {
          value: `${err.message}`,
          msg: "Erro ao obter o jogador pelo nome e número.",
          param: "/nome/:filtro",
        },
      ],
    });
  }
});

/**
 * DELETE /api/jogadores/:id
 * Remove o jogador pelo id
 * Parâmetros: id
 */
router.delete("/:id", async (req, res) => {
  const result = await db.collection(nomeCollection).deleteOne({
    _id: { $eq: new ObjectId(req.params.id) },
  });
  if (result.deletedCount === 0) {
    res.status(404).json({
      errors: [
        {
          value: `Não há nenhum jogador com o id ${req.params.id}`,
          msg: "Erro ao excluir o jogador",
          param: "/:id",
        },
      ],
    });
  } else {
    res.status(200).send(result);
  }
});

/**
 * POST /api/jogadores
 * Insere um novo prestador de serviço
 * Parâmetros: Objeto prestador
 */
router.post("/", validaJogador, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.data_criacao = new Date();
    req.body.ultima_atualizacao = null;

    const jogador = await db.collection(nomeCollection).insertOne(req.body);
    res.status(201).json(jogador); //201 é o status created
  } catch (err) {
    res.status(500).json({ message: `${err.message} Erro no Server` });
  }
});

/**
 * PUT /api/prestadores
 * Altera um prestador de serviço pelo _id
 * Parâmetros: Objeto prestador
 */
router.put("/", validaJogador, async (req, res) => {
  let idDocumento = req.body._id; //armazenamos o _id do documento
  delete req.body._id; //removemos o _id do body que foi recebido na req.
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    req.body.ultima_atualizacao = new Date();

    const jogador = await db
      .collection(nomeCollection)
      .updateOne(
        { _id: { $eq: new ObjectId(idDocumento) } },
        { $set: req.body }
      );
    res.status(202).json(jogador); //Accepted
  } catch (err) {
    res.status(500).json({ errors: err.message });
  }
});

export default router;
