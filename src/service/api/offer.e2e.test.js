'use strict';

const express = require(`express`);
const request = require(`supertest`);
const {Sequelize} = require(`sequelize`);

const initDb = require(`../lib/init-db`);
const offerApi = require(`./offer`);
const OfferService = require(`../data-service/offer`);
const CommentService = require(`../data-service/comment`);
const {HttpCode} = require(`../../constants`);

const mockCategories = [
  `Животные`,
  `Журналы`,
  `Игры`
];

const mockUsers = [
  {
    email: `ivanov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Иван`,
    lastName: `Иванов`,
    avatar: `avatar1.jpg`
  },
  {
    email: `petrov@example.com`,
    passwordHash: `5f4dcc3b5aa765d61d8327deb882cf99`,
    firstName: `Пётр`,
    lastName: `Петров`,
    avatar: `avatar2.jpg`
  }
];

const mockOffers = [
  {
    "title": `Куплю детские санки 1.`,
    "picture": `item14.jpg`,
    "description": `Кому нужен этот новый телефон, если тут такое... Это настоящая находка для коллекционера! Продаю с болью в сердце... Если найдёте дешевле — сброшу цену.`,
    "type": `OFFER`,
    "price": 96004,
    "categories": [
      `Игры`,
      `Журналы`
    ],
    "comments": [
      {
        "text": `С чем связана продажа? Почему так дешёво? А сколько игр в комплекте?`
      }
    ]
  },
  {
    "title": `Куплю породистого кота 1.`,
    "picture": `item16.jpg`,
    "description": `Мой дед не мог её сломать. Кажется, что это хрупкая вещь. Две страницы заляпаны свежим кофе. Товар в отличном состоянии.`,
    "type": `OFFER`,
    "price": 50937,
    "categories": [
      `Игры`
    ],
    "comments": [
      {
        "text": `Почему в таком ужасном состоянии?`
      },
      {
        "text": `А сколько игр в комплекте? Оплата наличными или перевод на карту? Почему в таком ужасном состоянии?`
      },
      {
        "text": `С чем связана продажа? Почему так дешёво? Почему в таком ужасном состоянии? Вы что?! В магазине дешевле.`
      }
    ]
  },
  {
    "title": `Куплю детские санки 2.`,
    "picture": `item12.jpg`,
    "description": `Не пытайтесь торговаться. Цену вещам я знаю. Пользовались бережно и только по большим праздникам. Если найдёте дешевле — сброшу цену. Даю недельную гарантию.`,
    "type": `OFFER`,
    "price": 5005,
    "categories": [
      `Журналы`,
      `Животные`
    ],
    "comments": [
      {
        "text": `Оплата наличными или перевод на карту? С чем связана продажа? Почему так дешёво?`
      }
    ]
  },
  {
    "title": `Продам советскую посуду. Почти не разбита.`,
    "picture": `item08.jpg`,
    "description": `Даю недельную гарантию. Таких предложений больше нет! Это настоящая находка для коллекционера! Две страницы заляпаны свежим кофе.`,
    "type": `OFFER`,
    "price": 24537,
    "categories": [
      `Игры`
    ],
    "comments": [
      {
        "text": `С чем связана продажа? Почему так дешёво?`
      }
    ]
  },
  {
    "title": `Продам коллекцию журналов «Огонёк».`,
    "picture": `item02.jpg`,
    "description": `Если найдёте дешевле — сброшу цену. Продаю с болью в сердце... Бонусом отдам все аксессуары. Даю недельную гарантию.`,
    "type": `OFFER`,
    "price": 81996,
    "categories": [
      `Животные`
    ],
    "comments": [
      {
        "text": `Совсем немного...`
      }
    ]
  }
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDb(mockDB, {categories: mockCategories, offers: mockOffers, users: mockUsers});
  const app = express();
  app.use(express.json());
  offerApi(app, new OfferService(mockDB), new CommentService(mockDB));
  return app;
};

describe(`API returns a list of all offers`, () => {
  let response;
  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/offers`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns a list of 5 offers`, () => expect(response.body.length).toBe(5));
});

describe(`API returns an offer with given id`, () => {
  let response;
  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app).get(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer's title is "Куплю детские санки 1."`, () => expect(response.body.title).toBe(`Куплю детские санки 1.`));
});

describe(`API creates an offer if data is valid`, () => {
  const newOffer = {
    categories: [1],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    price: 100500
  };

  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).post(`/offers`).send(newOffer);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Offers count is changed`, () => request(app)
    .get(`/offers`)
    .expect((res) => expect(res.body.length).toBe(6))
  );
});

describe(`API refuses to create an offer if data is invalid`, () => {
  const newOffer = {
    categories: `Котики`,
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    price: 100500
  };

  let app;
  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    for (const key of Object.keys(newOffer)) {
      const badOffer = {...newOffer};
      delete badOffer[key];
      await request(app).post(`/offers`).send(badOffer).expect(HttpCode.BAD_REQUEST);
    }
  });
});

describe(`API changes existent offer`, () => {
  const newOffer = {
    categories: [2],
    title: `Дам погладить котика`,
    description: `Дам погладить котика. Дорого. Не гербалайф`,
    picture: `cat.jpg`,
    type: `OFFER`,
    price: 100500
  };

  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).put(`/offers/2`).send(newOffer);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer is really changed`, () => request(app).get(`/offers/2`).expect((res) => expect(res.body.title).toBe(`Дам погладить котика`))
  );
});

test(`API returns status code 404 when trying to change non-existent offer`, async () => {
  const app = await createAPI();

  const validOffer = {
    categories: [3],
    title: `валидный`,
    description: `объект`,
    picture: `объявления`,
    type: `однако`,
    price: 404
  };

  return request(app).put(`/offers/100`).send(validOffer).expect(HttpCode.NOT_FOUND);
});

test(`API returns status code 400 when trying to change an offer with invalid data`, async () => {
  const app = await createAPI();

  const invalidOffer = {
    categories: [1, 2],
    title: `невалидный`,
    description: `объект`,
    picture: `объявления`,
    type: `нет поля price`
  };

  return request(app).put(`/offers/2`).send(invalidOffer).expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes an offer`, () => {
  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).delete(`/offers/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Offer count is 4 now`, () => request(app).get(`/offers`).expect((res) => expect(res.body.length).toBe(4)));
});

test(`API refuses to delete non-existent offer`, async () => {
  const app = await createAPI();
  return request(app).delete(`/offers/100`).expect(HttpCode.NOT_FOUND);
});

test(`API refuses to create a comment to non-existent offer and returns status code 404`, async () => {
  const app = await createAPI();
  return request(app).post(`/offers/100/comments`).send({text: `Неважно`}).expect(HttpCode.NOT_FOUND);
});

test(`API refuses to delete non-existent comment`, async () => {
  const app = await createAPI();
  return request(app).delete(`/offers/1/comments/155`).expect(HttpCode.NOT_FOUND);
});

describe(`API returns a list of comments to given offer`, () => {
  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).get(`/offers/2/comments`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Returns list of 3 comments`, () => expect(response.body.length).toBe(3));
  test(`First comment's title is "Почему в таком ужасном состоянии?"`, () => expect(response.body[0].text).toBe(`Почему в таком ужасном состоянии?`));
});

describe(`API creates a comment if data is valid`, () => {
  const newComment = {
    text: `Валидному комментарию достаточно этого поля`
  };

  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app)
      .post(`/offers/2/comments`)
      .send(newComment);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));
  test(`Comments count is changed`, () => request(app).get(`/offers/2/comments`).expect((res) => expect(res.body.length).toBe(4))
  );
});

test(`API refuses to create a comment when data is invalid, and returns status code 400`, async () => {
  const app = await createAPI();
  return request(app).post(`/offers/1/comments`).send({}).expect(HttpCode.BAD_REQUEST);
});

describe(`API correctly deletes a comment`, () => {
  let app;
  let response;
  beforeAll(async () => {
    app = await createAPI();
    response = await request(app).delete(`/offers/1/comments/1`);
  });

  test(`Status code 200`, () => expect(response.statusCode).toBe(HttpCode.OK));
  test(`Comments count is 0 now`, () => request(app).get(`/offers/1/comments`).expect((res) => expect(res.body.length).toBe(0)));
});

test(`API refuses to delete a comment to non-existent offer`, async () => {
  const app = await createAPI();
  return request(app).delete(`/offers/100/comments/1`).expect(HttpCode.NOT_FOUND);
});
