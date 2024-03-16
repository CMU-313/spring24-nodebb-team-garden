'use strict';

module.exports = {
    reporter: async (res) => {
        const len = res.length;
        let str = '';

        res.forEach(async (r) => {
            const { file } = r.file;
            const err = r.error;

            str += `${file}: line ${err.line}, col ${err.character}, ${err.reason}\n`;
        });

        if (str) {
            process.stdout.write(`${str}\n${len} error${len === 1 ? '' : 's'}\n`);
        }
    },
};
