#!/usr/bin/env node

'use strict';

/*

Initialization

*/

// Modules
const fs = require('fs');
const yaml = require('js-yaml');
const SVGO = require('svgo');

// Arguments
const paths = {
	source: process.argv[2] || '.',
	design: process.argv[3] || './Design',
	production: process.argv[4] || './Production',
	config: process.argv[5] || './config.yml'
};

// Parse config
let config = {};

try {
	config = yaml.safeLoad(fs.readFileSync(paths.config));
}
catch (error) {
	console.log(paths.config + " is not a valid YAML file. Using defaults.");
}

// SVGO
const svgo = new SVGO(config);


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

	// Create output directories

	if (!fs.existsSync(paths.design)) {
		fs.mkdirSync(paths.design);
	}

	if (!fs.existsSync(paths.production)) {
		fs.mkdirSync(paths.production);
	}

	// Get SVG files from source

	const svgList = getSVGs(paths.source);

	// Create design set

	const svgoPromises = [];

	for (let svg of svgList) {

		const svgData = fs.readFileSync(svg, 'utf8');

		const promise = svgo.optimize(svgData).then(function(result) {
			fs.writeFileSync(paths.design + '/' + svg, result.data);
		});

		svgoPromises.push(promise);

	}

	// Create production set

	Promise.all(svgoPromises).then(function(value) {
		
		for (let svg of svgList) {

			let svgData = fs.readFileSync(paths.design + '/' + svg, 'utf8');

			// Remove any <path> with fill="none"
			svgData = svgData.replace(/<path [^>]*fill="none"[^>]*>/gi, '');

			// Remove any remaining fill attributes
			svgData = svgData.replace(/fill="[^"]*"/gi, '');

			fs.writeFileSync(paths.production + '/' + svg, svgData);

		}

	});

}

groom();
