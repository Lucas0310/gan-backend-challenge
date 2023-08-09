function verifyToken(req, res, next) {
    const authorizationHeader = req.headers.authorization
    if (authorizationHeader && authorizationHeader.toLowerCase().startsWith('bearer ')) {
        const token = authorizationHeader.slice(7)
        try {
            // This is only for this exercise purposes, don't try this at home
            if (token != 'dGhlc2VjcmV0dG9rZW4=') {
                throw new Error('Invalid Token')
            }
            next();
        } catch (error) {
            res.status(401).json({ error: 'Token invalid or expired' })
        }
    } else {
        res.status(401).json({ error: 'Bearer token missing or invalid' })
    }
}

module.exports = verifyToken;