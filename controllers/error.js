exports.error404 = (req, res, next) => {
    res.status(404).render("errors/error404", {
      pageTitle: "Page Not Found",
      path: "/404"
    });
  };
  
  exports.error500 = (req,res,next) => {
    res.status(500).render('errors/error500', {
      pageTitle: 'ERROR!!',
      path: '/500'
    });
  }

exports.forbiddenError = (req,res,next) => {
  res.status(401).render('errors/error-forbidden',{
    pageTitle: 'Unauthorized Access',
    path:'/401'
  })
}