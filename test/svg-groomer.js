#!/usr/bin/env node

'use strict';



// -----------------------------------------------------------------------------

// Initialization

// -----------------------------------------------------------------------------


// Modules

const fs = require('fs');
const yaml = require('js-yaml');
const SVGO = require('svgo');
const argv = require('yargs').argv



// -----------------------------------------------------------------------------

// Helpers

// -----------------------------------------------------------------------------


// Get file extension as string
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}


// Get list of SVG files in folder
function getSVGs(folder) {

    const result = [];

    const files = fs.readdirSync(folder);

    for (let filename of files) {
        if (getFileExtension(filename) === "svg") {
            result.push(filename);
        }
    }

    return result;

}


// Get config values
function getConfig() {

    let configPath = argv.config || './config.yml';
    let configFile = {};

    // Parse the config file, if it exists
    try {
        configFile = yaml.safeLoad(fs.readFileSync(configPath));
    }
    catch (error) {
    }

    // Set config
    let config = {
      source: argv.source || (configFile.svgGroomer && configFile.svgGroomer.source) || '.',
      design: argv.design || (configFile.svgGroomer && configFile.svgGroomer.design) || './Design',
      production: argv.production || (configFile.svgGroomer && configFile.svgGroomer.production) || './Production',
      fill: argv.fill || (configFile.svgGroomer && configFile.svgGroomer.fill) || 'remove',
      svgo: configFile
    }

    // We're done with this, so delete it so we can pass the rest to SVGO
    delete configFile.svgGroomer;
    config.svgo = configFile;

    return config;

}



// -----------------------------------------------------------------------------

// Groom it

// -----------------------------------------------------------------------------



function groom() {

    // Get config
    let config = getConfig();


    // SVGO
    const svgo = new SVGO(config.svgo);


    // Create output directories

    console.log('Creating output directories...');

    if (!fs.existsSync(config.design)) {
        fs.mkdirSync(config.design);
    }

    if (!fs.existsSync(config.production)) {
        fs.mkdirSync(config.production);
    }


    // Get SVG files from source

    const svgList = getSVGs(config.source);


    // Create design set

    console.log('Optimizing design files...');

    const svgoPromises = [];

    for (let svg of svgList) {

        let svgData = fs.readFileSync(config.source + '/' + svg, 'utf8');

        // If config.fill is 'remove' we remove all fills except fill="none",
        // as that usually indicates it's there for alignment purposes
        if (config.fill === 'remove') {
            svgData = svgData.replace(/\s?fill="(?!none)[^"]*"/gi, '');
        }
        else {
            svgData = svgData.replace(/\s?fill="(?!none)[^"]*"/gi, ' fill="' + config.fill + '"');
        }

        const promise = svgo.optimize(svgData).then(function(result) {
            fs.writeFileSync(config.design + '/' + svg, result.data);
        });

        svgoPromises.push(promise);

    }


    // Create production set

    console.log('Optimizing production files...');

    Promise.all(svgoPromises).then(function(value) {

        for (let svg of svgList) {

            let svgData = fs.readFileSync(config.design + '/' + svg, 'utf8');

            // Remove elements with fill="none", as we don't want alignment
            // rectangles in our production files
            svgData = svgData.replace(/<[^>]*fill="none"[^>]*>/gi, '');

            fs.writeFileSync(config.production + '/' + svg, svgData);

        }

    });

    console.log('All done!');

}

groom();