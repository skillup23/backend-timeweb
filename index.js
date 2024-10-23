const dotenv = require('dotenv');
const express = require('express');
var fs = require('fs');

dotenv.config({ path: './.env' });

const app = express();

app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  next();
});

// Добавление данных в БД
function addFlowersBD(arr) {
  var flowers = JSON.stringify(arr);

  fs.writeFile('./db.json', flowers, function (error) {
    if (error) {
      return console.log(error);
    }
    console.log('База данных успешна обновлена');
  });
}

// Проверка работы Express
app.get('/', (req, res) => {
  res.send('Express is work');
});

var content = fs.readFileSync('db.json', 'utf8');
var flowers = JSON.parse(content);

// Получение данных для фронтенда
app.get('/api/flowers', function (req, res) {
  res.json(flowers);
});

// Получение пагинации
app.get('/api/flowers/paginate', paginatedResults(flowers), (req, res) => {
  res.json(res.paginatedResults);
});

function paginatedResults(model) {
  // middleware function
  return (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    // вычисление начального и конечного индекса
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (endIndex < model.length) {
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

    results.results = model.slice(startIndex, endIndex);

    res.paginatedResults = results;
    next();
  };
}

// Возврат промиса с ошибкой
function returnPromiseError() {
  return Promise.reject(new Error('Ошибка. Что-то пошло не так...'));
}

// Функция для вызова API
const getFlowers = async () => {
  const api = process.env.URL_SVA;
  const user = process.env.USER;
  const password = process.env.PASSWORD;

  const token = 'Basic ' + btoa(user + ':' + password);

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

    return console.log('Данные из 1С получены');
  } catch (error) {
    console.log(
      `При выполнении кода произошла ошибка ${error.name} c текстом ${error.message}, но мы её обработали`
    );
  }
  console.log('Работа сервера продолжена');
};

//Запрашивать API 1С каждые 4 часа
setInterval(getFlowers, 14400000);

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
