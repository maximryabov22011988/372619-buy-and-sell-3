'use strict';

const {Router} = require(`express`);
const {HttpCode} = require(`../../constants`);

module.exports = (app, searchService) => {
  const route = new Router();
  app.use(`/search`, route);

  route.get(`/`, async (req, res) => {
    const {query = ``} = req.query;
    if (!query) {
      res.status(HttpCode.BAD_REQUEST).send([]);
      return;
    }

    const searchResults = await searchService.findAll(query);
    const searchStatus = searchResults.length ? HttpCode.OK : HttpCode.NOT_FOUND;

    res.status(searchStatus).json(searchResults);
  });
};
