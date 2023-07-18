const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {
    res.render(
        `projects/index.pug`,
    )
});

router.get('/minesweeper', (req, res) => {
    res.send(
        fs.readFileSync(
            `${process.cwd()}/projects/minesweeper.html`,
            'utf8'
        )
    );
});

router.get('/minesweeperbuilder', (req, res) => {
    res.send(
        fs.readFileSync(
            `${process.cwd()}/projects/minesweeper_builder.html`,
            'utf8'
        )
    );
});

module.exports = router;