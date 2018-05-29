var error404 = function(err, req, res, next) {
  var errors = new error();
  res.locals.message = "cette page n'existe pas ou n'existe plus plus. Nous vous prions de nous nous excuser pour le gêne occasionnée";
  errors.status = 404;
  next();
}
module.exports = error404;
