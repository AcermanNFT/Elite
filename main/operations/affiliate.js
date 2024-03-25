const Express = require('express');
const express = Express();

express.get('/affiliate/api/public/affiliates/slug/:slug', async (req, res) => {
    res.json({
			id: '97320508149273650928461029384017',
			slug: req.params.affiliateName,
			displayName: req.params.affiliateName,
			status: 'ACTIVE',
			verified: true
		})
})

module.exports = express;