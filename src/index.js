const express = require("express");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//base de dados para armazenar os usuarios
const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "Usuario não existe!" });
  }

  request.user = user;

  return next();
}

//Cadastrar Usuario
app.post("/users", (request, response) => {
  const { username, name } = request.body;

  //verificando se já existe um usuario com o mesmo nome cadastrado
  const userAlreadyExists = users.find((user) => user.username === username);

  if (userAlreadyExists) {
    return response
      .status(400)
      .json({ error: "Nome de usuário já cadastrado!" });
  }
  //////////////////////////////////////////////////////////////////////////

  //salvando dados no array users
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  //retornando os dados
  return response.status(201).json(user);
});

//LISTAR AS TAREFAS DO USUARIO
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

//CADASTRAR NOVA TAREFA
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

//ALTERAR DADOS DA TAREFA
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const checkTodo = user.todos.find((todo) => todo.id === id);

  if (!checkTodo) {
    return response.status(404).json({ error: "Tarefa não existe" });
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline);

  return response.json(checkTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const checkTodo = user.todos.fin((todo) => todo.id === id);

  if (!checkTodo) {
    return response.status(404).json({ error: "Tarefa não existe" });
  }

  checkTodo.done = true;

  return response.json(checkTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Tarefa não existe" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
