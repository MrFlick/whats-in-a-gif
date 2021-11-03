<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>3MF Project: What's In A GIF - Online GIF Encoder</title>
	<style type="text/css">
	body {box-sizing: border-box;}
	.byte {font-family: Courier, fixed;
		padding: .2em}
	.gif_header {background-color: #f9E89D}
	.gif_screen {background-color: #C8DBD9}
	.gif_color {background-color: #E1E1E1}
	.gif_graphic {background-color: #F9EB9D}
	.gif_imgdesc {background-color: #C2D1DC}
	.gif_imgdata {background-color: #D0C4C4}
	.gif_trailer {background-color: #f9E89D}
	.gif_ext {background-color: #D0CFAE}
	.alg_steps {margin: 0 auto; border: 1px solid black;
    	border-collapse: collapse;}
	.alg_steps th, .alg_steps td {border: 1px solid black; padding: 2px}
	.alg_steps .index {padding: 0 .3em}
	.alg_steps .processed {color: #CCC}
	.alg_steps .buffer {background: #C8DBD9 url(images/highlight_green.gif) repeat-x center left;
		border-top: 1px solid #AAA2A2; border-bottom: 1px solid #AAA2A2;}
	.alg_steps .current {background: #D0C4C4 url(images/highlight_purple.gif) repeat-x center left;
		border-top: 1px solid #98A5A4; border-bottom: 1px solid #98A5A4;}
	/* tab css inspired by https://codepen.io/schalkjoubert/pen/rLPoaL */
	#draw-box {display: flex; justify-content: center;}
	*, *:before, *:after {
		margin: 0;
  		padding: 0;
  		box-sizing: border-box;
	}
	html, body {height: 100%;}
	.tab-box h1 {
		padding: 50px 0;
		font-weight: 400;
		text-align: center;
	}
	.tab-box p {
		margin: 0 0 20px;
		line-height: 1.5;
	}
	.tab-box main {
		min-width: 320px;
		padding: 50px;
		margin: 0 auto;
		background: #fff;
	}

	.tab-box section {
		display: none;
		padding: 20px 0 0;
		border-top: 1px solid #ddd;
	}

	.tab-box input {
		display: none;
	}

	.tab-box label {
		display: inline-block;
		margin: 0 0 -1px;
		padding: 15px 25px;
		font-weight: 600;
		text-align: center;
		color: #bbb;
		border: 1px solid transparent;
	}

	.tab-box label:hover {
		color: #888;
		cursor: pointer;
	}

	.tab-box input:checked + label {
		color: #555;
		border: 1px solid #ddd;
		border-top: 2px solid orange;
		border-bottom: 1px solid #fff;
	}

	.tab-box #tab1:checked ~ #content1,
	.tab-box #tab2:checked ~ #content2,
	.tab-box #tab3:checked ~ #content3 {
		display: block;
	}
	.color-picker {
		display: flex;
		flex-direction: column;
		background: #888;
		text-align: center;
		margin: 0 3px;
		padding: 2px;
		color: #eee;
	}
	#draw-mode {text-align: center; margin: 10px}
	#draw-mode label {
		padding: 15px 25px 15px 4px;
	}
	</style>
	<link rel="stylesheet" href="proj.css" />
	<script language="javascript">
		window.onload = () => {
			const pageCont = new PageController();
		};
	</script>
</head>
<body>

<div id="nav"><a href="../index.html">back to main lab page</a></div>
<div id="body">


<h1>Project: <span class="projname">What's In A GIF - GIF Encoder</span></h1>
<nav><a href="animation_and_transparency.asp" class="prev">Prev</a> - <a class="index" href="./">Index</a> - <a class="next" href="./">Next</a></nav>
<p>
	This page will allow you to to see how the color values
    in an GIF images are encoded into bytes. You may interact with
	a simple drawing tool that lets you create a 10x10 pixel image.
	Below, the image you draw is compressed and encoded into bytes.
	Each step of the conversion process is listed to help make it
	easier to see all the steps. Click on the color palette on the
	right to choose a color, then click in the grid to change the color
	of the pixels.
</p>

<div id="draw-mode"></div>
<div id="draw-box">
	<div><canvas width="400" height="400" style="border: 1px solid #4B4B4B"></canvas></div>
</div>

<p>
	Below is a table containing a summary of all the steps involved in turning
	the image you created into bytes. You can see how values are added into
	the color index buffer. When a sequence is found that does not have an
	entry in the code table, the last known code is sent
	to the code stream and a new entry is created in the code table. Recall that
	the last color value remains in the index buffer when reading the next color.
	You can also see the bit buffer. Once the buffer grows to over 8 bits,
	the last 8 bits are popped off and turned into a byte. These bits are removed
	in the following step in the table. The "Image Data Bytes" tab includes
	the additional bytes indicatint the LZW code sites and the block length
	markers. Note that minimum LZW code size in the example
	is set to the match the color table size.
	Be sure to refer to the <a href="lzw_image_data.asp">LZW image data</a>
	section for more complete details on how this process works.
</p>
<div id="explain-results" class="tab-box"></div>

<div style="text-align:center; margin-top: 10px; padding-top: 10px; border-top: #cecece 1px solid">
    <a href="../../index.html">home</a> -
    <a href="https://github.com/MrFlick/whats-in-a-gif">github</a> -
    <a href="mailto:me@matthewflickinger.com">me@matthewflickinger.com</a>
 </div>
<script src="scripts/gif_encoder.js"></script>
</div>    
</body>
    
</html>