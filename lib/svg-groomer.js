//'use strict';

// 1. Copy all SVG files in current (or specified) folder to ./Design/
// 2. Clean files in ./Design/ with SVGO
// 3. Copy all files in ./Design/ to ./Production/
// 4. Clean files with regex

/*

Initialization

*/

// Arguments
const paths = {
	source: process.argv[2] || '.',
	design: process.argv[3] || './Design',
	production: process.argv[4] || './Production'
};

// Modules
const fs = require('fs');
const yaml = require('js-yaml');
const SVGO = require('svgo');

// SVGO
const svgoConfig = yaml.safeLoad(fs.readFileSync('./.svgo.yml'));
const svgo = new SVGO(svgoConfig);


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

Main script

*/

function runit() {

	if (!fs.existsSync(paths.design)) {
		fs.mkdirSync(paths.design);
	}

	if (!fs.existsSync(paths.production)) {
		fs.mkdirSync(paths.production);
	}

	const svgList = getSVGs(paths.source);
	const svgoPromises = [];

	for (let svg of svgList) {

		const designPath = paths.design + '/' + svg;

		fs.copyFileSync(svg, designPath);

		const designData = fs.readFileSync(designPath);

		const promise = svgo.optimize(designData).then(function(result) {
			fs.writeFileSync(designPath, result.data);
		});

		svgoPromises.push(promise);

	}

	Promise.all(svgoPromises).then(function(value) {
		
		// Now that they're all optimized, copy them to production
		for (let svg of svgList) {

			const designPath = paths.design + '/' + svg;
			const productionPath = paths.production + '/' + svg;

			fs.copyFileSync(designPath, productionPath);
		}

	});

}

runit();
