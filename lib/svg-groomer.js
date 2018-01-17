#!/usr/bin/env node

'use strict';

/*

Initialization

*/

// Modules

const fs = require('fs');
const yaml = require('js-yaml');
const SVGO = require('svgo');


// Initialize some variables

let args = [];
let paths = {};
let config = {};
let configPath = './config.yml';


/*

Helpers

*/

// Get file extension as string
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// Get list of SVG files in folder
function getSVGs(folder) {

    const result = [];

    const files = fs.readdirSync(paths.source);

    for (let filename of files) {
        if (getFileExtension(filename) === "svg") {
            result.push(filename);
        }
    }

    return result;

}


/*

Groom it

*/

function groom() {

    // Move arguments that aren't a .yml path to the args array.
    // If a .yml path is provided (in any order), use it for config.
    for (let i = 2; i < process.argv.length; i++) {

        let a = process.argv[i];

        if (a.indexOf('yml') !== -1) {
            configPath = a;
        } else {
            args.push(a);
        }

    }

    // Parse the config file, if it exists
    try {
        config = yaml.safeLoad(fs.readFileSync(configPath));
    } catch (error) {
        console.log('Using default config.');
    }

    // Order of priority for source & destination paths:
    //
    // 1. Command line arguments
    // 2. Paths defined in the config file
    // 3. Defaults
    //
    paths.source = args[0] || (config.svgGroomer && config.svgGroomer.source) || '.';
    paths.design = args[1] || (config.svgGroomer && config.svgGroomer.design) || './Design';
    paths.production = args[2] || (config.svgGroomer && config.svgGroomer.production) || './Production';

    // For tidiness sake, delete svgGroomer from config object before we pass it to SVGO
    delete config.svgGroomer;

    // SVGO
    const svgo = new SVGO(config);

    // Create output directories

    console.log('Creating output directories...');

    if (!fs.existsSync(paths.design)) {
        fs.mkdirSync(paths.design);
    }

    if (!fs.existsSync(paths.production)) {
        fs.mkdirSync(paths.production);
    }

    // Get SVG files from source

    const svgList = getSVGs(paths.source);

    // Create design set

    console.log('Optimizing design files...');

    const svgoPromises = [];

    for (let svg of svgList) {

        let svgData = fs.readFileSync(paths.source + '/' + svg, 'utf8');

        // Remove fill attributes except fill="none", to preserve
        // unfilled elements for alignment of placed SVGs
        svgData = svgData.replace(/\s?fill="(?!none)[^"]*"/gi, '');

        const promise = svgo.optimize(svgData).then(function(result) {
            fs.writeFileSync(paths.design + '/' + svg, result.data);
        });

        svgoPromises.push(promise);

    }

    // Create production set

    console.log('Optimizing production files...');

    Promise.all(svgoPromises).then(function(value) {

        for (let svg of svgList) {

            let svgData = fs.readFileSync(paths.design + '/' + svg, 'utf8');

            // Remove elements with fill="none", as we don't want alignment
            // rectangles in our production files
            svgData = svgData.replace(/<[^>]*fill="none"[^>]*>/gi, '');

            fs.writeFileSync(paths.production + '/' + svg, svgData);

        }

    });

    console.log('All done!');

}

groom();