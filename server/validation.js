const Joi = require("joi");

const registerValidation = (data) => {
  const Schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().min(6).max(50).required(),
    password: Joi.string().min(6).max(255).required(),
    role: Joi.string().required().valid("student", "instructor"),
  });

  return Schema.validate(data);
};

const loginValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().min(6).max(50).required(),
    password: Joi.string().min(6).max(255).required(),
  });

  return Schema.validate(data);
};

const courseValidation = (data) => {
  const Schema = Joi.object({
    title: Joi.string().min(6).max(50).required(),
    description: Joi.string().min(6).max(255).required(),
    price: Joi.number().min(4).max(9999).required(),
  });

  return Schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.courseValidation = courseValidation;
