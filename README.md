# svg-groomer

This is a simple module that takes your raw SVG files from Illustrator/Sketch and pipes them into a Design folder and a Production folder, with some specific clean-up for each set.


## But why?

1. Automatically remove fills, or replace with `currentColor`, so you can set colors dynamically – in Framer's Design mode for example 🎨.

2. Have any fill-less alignment paths (needed for preserving the icon's artboard position when dropping into Sketch) automatically removed for production

3. Manually duplicating files and running them through SVG optimizers every time you re-export sucks.

All in all, it just saves you a lot of tedious labor. Just export, run `svg-groomer` in Terminal and be done with it. SVG Groomer uses SVGO for general SVG optimization.



## OK, so what does it do?

Consider the following typical output from Illustrator:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <title>checkmark</title>
  <g id="Bounds">
    <rect width="16" height="16" fill="none"/>
  </g>
  <g id="Icons">
    <path d="..." fill="#fff"/>
  </g>
</svg>
```

We include the `<rect>` with `fill="none"` so that when we drop it into Sketch for example, it gives us a 16 x 16 group with the path correctly positioned inside it. Without it we would just get the shape itself – and manually positioning each icon inside a 16 x 16 symbol, sometimes on sub-pixel values, is a pain.

But we need to:

1. Optimize it (svg-groomer uses SVGO)
2. Remove any specific fill colors (like `fill="#fff"` ) so we can set it to anything we want in CSS/Framer/etc.

Like this, but without spaces or line breaks (just included here for readability):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="none" d="M0 0h16v16H0z"/>
  <path d="..."/>
</svg>
```

You can also swap your fills for `currentColor` or any other string instead of removing them, if you prefer. This gets saved to our "Design" folder. 

Then we simply remove the `fill="none"` paths used for alignment and save those files to our "Production" folder.

Crucially, this last step lets you drop them into Framer's Design mode and have them behave exactly like the ones in the Icons menu, allowing you to change their color in Framer.

That's cause what we have now is pretty close to the Design and Production versions you'll find in Google's Material Icons set, which Framer uses.


## Neat, how do I install it?

1. [Install NPM](https://docs.npmjs.com/getting-started/installing-node) if you haven't already
2. Fire up Terminal, paste this and hit Enter: `npm install -g svg-groomer`


## Then what?

In Terminal, go to the folder you export your SVG icons to (protip: [add it to the right-click menu in Finder](https://lifehacker.com/launch-an-os-x-terminal-window-from-a-specific-folder-1466745514)). Then, simply run it like so:

`svg-groomer`

*Arguments*

`svg-groomer --source="Source folder" --design="Design folder" --production="Production folder" --fill=currentColor --config=myConfig.yml`

All arguments are optional. If you specify a `--fill`, fills are not removed but instead substituted for whatever string you give it.

So you might not want the output folders to be inside your export folder, in which case you'd just go to the parent folder instead, and do:

`svg-groomer 'Source folder'`

*Config*

The config file is passed on to SVGO, but can also include an svgGroomer object so you don't have to pass your arguments from the command line every time. Just duplicate [config.yml](./lib/config.yml) to get you started.

If there is a `config.yml` in the same folder you run svg-groomer in you don't need to specify a path. Otherwise, use the `--config` flag as shown above.

_Note: Feel free to tweak the SVGO config, but note the two disabled plugins. I can only guarantee that it works with these default SVGO settings. For an updated reference, see the [SVGO config](https://github.com/svg/svgo/blob/master/.svgo.yml) in their repo._
