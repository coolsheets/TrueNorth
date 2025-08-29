const { Router } = require('express');
const router = Router();

router.get('/', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

module.exports = router;
