# svg-groomer

This is a simple module that takes your raw SVG files from Illustrator/Sketch and pipes them into a Design folder and a Production folder, with some specific clean-up for each set.

## But why?

Because if your workflow is anything like mine, even the excellent SVGO and SVG Cleaner leave some manual work if you need to keep both design and production versions of your SVG icons.

## OK, so what does it do?

Consider the following typical output from Illustrator:

    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
     <title>checkmark</title>
     <g id="Bounds">
     <rect width="16" height="16" fill="none"/>
     </g>
     <g id="Icons">
     <path d="..." fill="#fff"/>
     </g>
    </svg>

We include the `<rect>` with `fill="none"` so that when we drop it into Sketch or whatever, it gives us a 16 x 16 group with the path correctly positioned inside it. Without it we would just get the shape itself, and manually positioning each icon inside a 16 x 16 symbol is a pain.

But we need to:

1. Optimize it (svg-groomer uses SVGO)
1. Remove any specific fill colors (like `fill="#fff"` ) so we can set it to anything we want in CSS

Like this, but without spaces or line breaks (just included here for readability):

    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
    	<path fill="none" d="M0 0h16v16H0z"/>
    	<path d="..."/>
    </svg>

This gets saved to our "Design" folder. 

And for production we simply remove the fill-less elements used for alignment and save those files to our "Production" folder.

What we have now is pretty close to the Design and Production folders you'll find in Google's Material Icons repo – with none of the manual copy/pasting between folders, optimizing, then copy/pasting again, then removing unnecessary elements from production.