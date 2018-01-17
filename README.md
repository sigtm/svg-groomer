# svg-groomer

This is a simple module that takes your raw SVG files from Illustrator/Sketch and pipes them into a Design folder and a Production folder, with some specific clean-up for each set.


## But why?

Because if your workflow is anything like mine, even the excellent SVGO and SVG Cleaner leave some manual work if you need to keep both design and production versions of your SVG icons.


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

We include the `<rect>` with `fill="none"` so that when we drop it into Sketch or whatever, it gives us a 16 x 16 group with the path correctly positioned inside it. Without it we would just get the shape itself, and manually positioning each icon inside a 16 x 16 symbol is a pain.

But we need to:

1. Optimize it (svg-groomer uses SVGO)
1. Remove any specific fill colors (like `fill="#fff"` ) so we can set it to anything we want in CSS

Like this, but without spaces or line breaks (just included here for readability):

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
  <path fill="none" d="M0 0h16v16H0z"/>
  <path d="..."/>
</svg>
```

This gets saved to our "Design" folder. 

And for production we simply remove the fill-less elements used for alignment and save those files to our "Production" folder.

What we have now is pretty close to the Design and Production folders you'll find in Google's Material Icons repo – with none of the manual copy/pasting between folders, optimizing, then copy/pasting again, then removing unnecessary elements from production.


## Neat, how do I install it?

1. [Install NPM](https://docs.npmjs.com/getting-started/installing-node) if you haven't already
2. Fire up Terminal, paste this and hit Enter: `npm install -g svg-groomer`


## Then what?

In Terminal, go to the folder you export your SVG icons to (protip: [add it to the right-click menu in Finder](https://lifehacker.com/launch-an-os-x-terminal-window-from-a-specific-folder-1466745514)). Then, simply run it like so:

`svg-groomer`

*Arguments*

`svg-groomer [source folder] [design folder] [production folder] [config.yml]`

They're all optional, but the three folders have to be entered in that order.

So you might not want the output folders to be inside your export folder, in which case you'd just go to the parent folder instead, and do:

`svg-groomer 'My Export Folder'`

*Config*

You probably don't want to enter your own folders manually every time. Instead, you might duplicate [config.yml](./lib/config.yml) and add them there. If there is a `config.yml` in the same folder you run svg-groomer in you don't need to specify a path. Otherwise, just pass it as an argument:

`svg-groomer myConfig.yml`

_Note: The rest of config.yml is [SVGO config](https://github.com/svg/svgo/blob/master/.svgo.yml). Feel free to tweak it, but note the two disabled plugins. I can only guarantee that it works with these default SVGO settings._
