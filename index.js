const dotenv = require("dotenv");
const express = require("express");
var fs = require("fs");

dotenv.config({ path: "./.env" });

const app = express();

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  next();
});

let content = fs.readFileSync("db.json", "utf8");
let flowersData = JSON.parse(content);

// Добавление данных в БД
function addFlowersBD(arr) {
  var flowers = JSON.stringify(arr);

  fs.writeFile("./db.json", flowers, function (error) {
    if (error) {
      return console.log(error);
    }
    console.log("База данных успешна обновлена");
  });
}

function newFlowers() {
  content = fs.readFileSync("db.json", "utf8");
  flowersData = JSON.parse(content);
  return console.log("Массив для запрсов API обновлен");
}

// Проверка работы Express
app.get("/", (req, res) => {
  res.send("Express is work");
});

// Получение данных для фронтенда
app.get("/api/flowers", function (req, res) {
  // var content2 = fs.readFileSync("db.json", "utf8");
  // var flowers2 = JSON.parse(content2);
  res.json(flowersData);
});

// Получение пагинации
app.get("/api/flowers/paginate", paginatedResults(), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults() {
  // middleware function
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    // вычисление начального и конечного индекса
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < flowersData.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.results = flowersData.slice(startIndex, endIndex);

    res.paginatedResults = results;
    next();
  };
}

// Возврат промиса с ошибкой
function returnPromiseError() {
  return Promise.reject(new Error("Ошибка. Что-то пошло не так..."));
}

// Функция для вызова API
const getFlowers = async () => {
  const api = process.env.URL_SVA;
  const user = "web_user";
  const password = "1cJ7k8-c>^CsN+Yw";

  const token = "Basic " + btoa(user + ":" + password);
  // console.log(token);

  try {
    const response = await fetch(api, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      await returnPromiseError();
    }

    const result = await response.json();
    addFlowersBD(result);

    return console.log("Данные из 1С получены");
  } catch (error) {
    console.log(
      `При выполнении кода произошла ошибка ${error.name} c текстом ${error.message}, но мы её обработали`
    );
  }
  console.log("Работа сервера продолжена");
};

// getFlowers();

//Запрашивать API 1С каждые полчаса
setInterval(getFlowers, 1800000);
setInterval(newFlowers, 1860000);

const port = 3456;

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);

// app.get('/sva', async (_req, res) => {
//   const api = process.env.URL_SVA;
//   const user = process.env.USER;
//   const password = process.env.PASSWORD;

//   const token = 'Basic ' + btoa(user + ':' + password);

//   try {
//     const response = await fetch(api, {
//       headers: {
//         Authorization: token,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`Error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     addFlowersBD(result);
//     return res.json(result);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: 'An error occurred' });
//   }
// });
