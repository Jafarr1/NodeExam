function ensureLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}


export default ensureLoggedIn;