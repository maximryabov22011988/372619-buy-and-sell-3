'use strict';

const {Model} = require(`sequelize`);
const defineCategory = require(`./category`);
const defineComment = require(`./comment`);
const defineOffer = require(`./offer`);
const defineUser = require(`./user`);
const Aliase = require(`./aliase`);

class OfferCategory extends Model {}

const define = (sequelize) => {
  const Category = defineCategory(sequelize);
  const Comment = defineComment(sequelize);
  const Offer = defineOffer(sequelize);
  const User = defineUser(sequelize);

  Offer.hasMany(Comment, {
    as: Aliase.COMMENTS,
    foreignKey: `offerId`,
    onDelete: `cascade`
  });
  Comment.belongsTo(Offer, {
    foreignKey: `offerId`
  });

  OfferCategory.init({}, {sequelize});
  Offer.belongsToMany(Category, {
    as: Aliase.CATEGORIES,
    through: OfferCategory
  });
  Category.belongsToMany(Offer, {
    as: Aliase.OFFERS,
    through: OfferCategory
  });
  Category.hasMany(OfferCategory, {as: Aliase.OFFER_CATEGORIES});

  User.hasMany(Offer, {
    as: Aliase.OFFERS,
    foreignKey: `userId`
  });
  Offer.belongsTo(User, {
    as: Aliase.USERS,
    foreignKey: `userId`
  });

  User.hasMany(Comment, {
    as: Aliase.COMMENTS,
    foreignKey: `userId`
  });
  Comment.belongsTo(User, {
    as: Aliase.USERS,
    foreignKey: `userId`
  });

  return {Category, Comment, Offer, OfferCategory, User};
};

module.exports = define;
