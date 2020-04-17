const clipboardy = require('clipboardy');
const prettier = require('prettier');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const packagePath = path.join(__dirname, '..', 'package.json');

const packageInfo = JSON.parse(fs.readFileSync(packagePath), 'utf8');

const languages = _.uniq(_.flatMap(prettier.getSupportInfo().languages.map(it => it.parsers)));

const args = process.argv;

function printInfo(i, prefix = '', spacing = '') {
    console.log(_.startCase(prefix));
    Object.keys(i).forEach(key => {
        const v = i[key];
        if (typeof v === 'object') {
            printInfo(v, key + ':', ' - ')
        } else {
            console.log(`${spacing}${_.startCase(key)}: ${v}`)
        }
    })
}


if (args.length >= 3) {
    const lang = args[2];

    if (lang.toLocaleLowerCase() === 'ls') {
        console.log('Supported languages: ')
        languages.forEach(l => console.log(l))
        return;
    }

    if (lang.toLocaleLowerCase() === 'info') {
        printInfo(packageInfo);
        return;
    }
    

    if (!lang) {
        console.error('Invalid language');
        return;
    }

    const language = lang.toLowerCase();
    if (!languages.includes(language)) {
        console.log('Unsupported language: ' + language);
        return;
    }

    const content = clipboardy.readSync();
    if (!content) {
        console.log('No clipboard');
        return;
    }

    try {
        const formatted = prettier.format(content, {
            parser: language,
        });

        clipboardy.writeSync(formatted);
        console.info('Copied to the clipboard\n');
        console.log(formatted);
    } catch(e) {
        console.error('Unknown error occured or maybe incorrect specified language');
    }
} else {
    console.error('Missing language');
    console.error('try `pp json`');
}
