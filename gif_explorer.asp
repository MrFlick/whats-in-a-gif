<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>3MF Project: What's In A GIF - Bit by Byte</title>
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
	#global_color_size {margin-left: auto; margin-right:auto; border:1px solid black;}
	#global_color_size td {text-align:center;}
	.choose-input {
    	display: grid;
		grid-template-columns: 300px 1fr;
	}
	.choose-input .label {
		font-weight: bold;
    	grid-column: 1 / 2;
	}
	.choose-input .input {
    	grid-column: 2 / 3;
		vertical-align: middle;
	}
	.choose-input .sample-images {
		display: flex;
		align-items: center;
	}
	.choose-input .sample-images a:hover {
		background-color: #D0C4C4;
		border: 1px solid #999;
	}
	.choose-input .sample-images a img {
		padding: 10px;
	}
	.choose-input .sample-images a:hover img {
		margin: -1px;
	}
	#gif_view {
		max-width: 800px;
		margin: 0 auto;
	}
	#gif_view canvas {
		display: block;
		margin: 0 auto;
	}
	.gif_section {
		margin: 1em 0;
	}
	.block_header {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr;
		text-align: left;
		font-size: 1.5em;
	}
	.block_header .value:first-child .label {
		display: none;
	}
	.block_header .value:first-child {
		font-weight: bold;
		padding: 10px;
		font-size: 1.25em;
	}
	.block_header .value .label {
		font-size: .5em;
	}
	.block_header .value:not(:first-child) {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	dl {
		display: flex;
		flex-flow: row wrap;
		border: 1px #333;
		border-style: solid none;
	}
	dt {
		flex-basis: 31%;
		padding: 2px 4px;
		text-align: right;
		font-weight: bold;
	}
	dd {
		flex-basis: 15%;
		padding: 2px 4px;
		flex-grow: 1;
		margin: 0;
		margin-inline-start: 0;
		text-align: left;
	}
	canvas.image_frame {
		max-width: 100%
	}
	.byte_view table {
		width: 100%;
		text-align: center;
		cursor: default;
	}
	.byte_view table td.hover {
		background: #FFFFFFaa;
	}
	.code_view table {
		width: 100%;
		text-align: center;
		cursor: default;
	}
	.code_view table td.hover {
		background: #FFFFFFaa;
	}
	table td.offset {
		color: #999999;
	}
	.tooltip {
		padding: 3px;
		background-color: #ffffff;
		background-color: #ffffffee;
		display: none;
        position: absolute;
		border: 1px solid #666;
	}
	table.code_table {
		width: 100%;
	}
	table.code_table th {
		text-align: left;
	}
	table.code_table .col_code{
		width: 3.5em;
	}
	#gif_view .nav {
		display: flex;
	}
	#gif_view .nav>*:nth-child(1) {
		flex-grow: 1;
	}
	#gif_view .nav>* {
		margin: 5px;
	}
	.block-body {
		margin-left: 20px;
	}
	.expander .header {
		padding: 2px 0;
		text-align: center;
	}
	.expander .collapsed { 
		display: none;
	}
	.modal {
		display: none;
		position: fixed;
		z-index: 1;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgb(0,0,0);
		background-color: rgba(0,0,0,0.4);
	}

	.modal-content {
		background-color: #fefefe;
		margin: 15% auto;
		padding: 20px;
		border: 1px solid #888;
		width: 80%;
	}

	.modal .close-icon {
		color: #aaa;
		float: right;
		font-size: 28px;
		font-weight: bold;
	}

	.modal .close-icon:hover,
	.modal .close-icon:focus {
		color: black;
		text-decoration: none;
		cursor: pointer;
	}
	</style>
	<link rel="stylesheet" href="proj.css" />
	
</head>
<body>

<div id="nav"><a href="../index.html">back to main lab page</a></div>
<div id="body">


<h1>Project: <span class="projname">What's In A GIF - GIF Explorer</span></h1>
<nav><a href="animation_and_transparency.asp" class="prev">Prev</a> - <a class="index" href="./">Index</a> - <a class="next" href="./">Next</a></nav>
<p>
	This page will allow you to explore the different parts
	of an existing GIF file. You will be able to explore the 
	different blocks and can view both the decoded content 
	as well as the raw bytes for each section.
</p>
<p>
	This particular decoder was written in pure, vanilla javascript.
	All decoding happens locally within your browser. This means
	you will need a relatively modern browser to run this code.
</p>

<div class="choose-input">
	<div class="label">Choose File From Your Computer</div>
	<div class="input"><input type="file" id="files" name="files"/></div>
	<div class="label">Or Choose A Sample Image...</div>
	<div class="input"><div class="sample-images">
		<a class="choose-img" href="#"><img src="images/sample_1.gif"/></a>
		<a class="choose-img" href="#"><img src="images/sample_2_animation.gif"/></a>
		<a class="choose-img" href="#"><img src="images/Dancing.gif" width=100/></a>
	</div></div>
</div>

<div id="gif_view"></div>

<template id="gif_view_template">
	<div class="block_header" data-bindex={{_bidx}}>
		<span class="value"><span class="label">Type</span> {{description}}</span>
		<span class="value"><span class="label">Offset</span><span>{{offset>pnum}}</span></span>
		<span class="value"><span class="label">Length</span><span>{{length>pnum}}</span></span>
	</div>
	<div class="HDR gif_header gif_section">
		<div class="decoded_values"><dl>
			<dt>Signature</dt><dd>{{signature}}</dd>
			<dt>Version</dt><dd>{{version}}</dd>
		</dl></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>

	</div>
	<div class="LSD gif_screen gif_section">
		<div class="decoded_values"><dl>
			<dt class="short">Width</dt><dd>{{width}}</dd>
			<dt class="short">Height</dt><dd>{{height}}</dd>
			<dt>Background Index</dt><dd>{{backgroundIndex}}</dd>
			<dt>Global Color Table?</dt><dd>{{hasColorTable}}</dd>
			<dt>Color Table Size</dt><dd>{{colorTableSize}}</dd>
			<dt>Color Resolution</dt><dd>{{colorResolution}}</dd>
			<dt>Sorted Colors?</dt><dd>{{colorSorted}}</dd>
		</dl></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="CT gif_color gif_section">
		<div class="decoded_values"><dl>
			<dt>Color Count</dt><dd>{{colorCount}}</dd>
		</dl></div>
		<div class="color_table_view" data-block="{{_bidx}}"></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="GCX gif_graphic gif_section">
		<div class="decoded_values"><dl>
			<dt>Disposal</dt><dd>{{disposal}}</dd>	
			<dt>User Input?</dt><dd>{{userInput}}</dd>
			<dt>Transparent?</dt><dd>{{transparentFlag}}</dd>
			<dt>Delay Time</dt><dd>{{delayTime}}</dd>
			<dt>Transparent Index</dt><dd>{{transparentIndex}}</dd>
		</dl></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="DSC gif_imgdesc gif_section" data-bindex={{_bidx}}>
		<div class="decoded_values"><dl>
			<dt>Left</dt><dd>{{left}}</dd>
			<dt>Top</dt><dd>{{top}}</dd>
			<dt>Width</dt><dd>{{width}}</dd>
			<dt>Height</dt><dd>{{height}}</dd>
			<dt>Local Color Table? </dt><dd>{{hasColorTable}}</dd>
			<dt>Color Table Size</dt><dd>{{colorTableSize}}</dd>
			<dt>Interlaced?</dt><dd>{{interlaced}}</dd>
			<dt>Color Sorted?</dt><dd>{{colorSorted}}</dd>
			<dt>Reserved</dt><dd>{{reserved}}</dd>
		</dl></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="IMG gif_imgdata gif_section">
		<div class="decoded_values"><dl>
			<dt>LZW Min Code Size</dt><dd>{{lzwmin}}</dd>
			<dt>(Code Unit Count)</dt><dd>{{codeUnitCount}}</dd>
			<dt>(Clear Code)</dt><dd>{{clearCode}}</dd>
			<dt>(End of Info Code)</dt><dd>{{eoiCode}}</dd>
			<dt>(Block Count)</dt><dd>{{blockCount}}</dd>
		</dl></div>
		<div class="image_frame_view" data-block="{{_bidx}}"></div>
		<div class="code_unit_view" data-block="{{_bidx}}"></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<span class="code">{{_idx}}: #{{.}} </span>
	<div class="AX gif_ext gif_section">
		<div class="decoded_values"><dl>
			<dt>Identifier</dt><dd>{{identifier}}</dd>
			<dt>Code</dt><dd>{{code}}</dd>
			<dt>Decoded</dt><dd>{{decode}}</dd>
		</dl></div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="CX gif_ext gif_section">
		<div class="decoded_values">{{message}}</div>
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="END gif_trailer gif_section">
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
	<div class="TRL gif_trailing_trivia gif_section">
		<div class="byte_view" data-block="{{_bidx}}"></div>
	</div>
</template>
<template id="byte_view_template">
	<h4>Byte View</h4>
	<div class="block-body">
		<table>
			<tr x-for-each="rows" data-byte-row="{{_idx}}">
				<td class="offset">{{offset}}</td><td x-for-each="bytes" class="byte" data-byte-col="{{_idx}}">{{.}}</td>
			</tr>
		</table>
		<div class="nav" x-partial="nav">
			<span class="size">Byte Count: {{byteLength>pnum}} (Page {{page}} of {{pageCount}})</span>
			<span class="jump">Jump to Page: <input type="text" size="15" value="{{page}}" class="goto"/></span>
			<button class="prev">Previous</button>
			<button class="next">Next</button>
		</div>
	</div>
	<span class="info tooltip" x-partial="tooltip"><table>
		<tr><td>Hex</td><td>{{hex}}</td></tr>
		<tr><td>Decimal</td><td>{{dec}}</td></tr>
		<tr><td>Block Offset</td><td>{{relOffset>pnum}}</td></tr>
		<tr><td>File Offset</td><td>{{fileOffset>pnum}}</td></tr>
	</table></span>
</template>
<template id="image_frame_template">
	<canvas></canvas>
</template>
<template id="color_table_template">
	<canvas></canvas>
	<span class="info tooltip" x-partial="tooltip"><table>
		<tr><td>Index</td><td>{{index}}</td></tr>
		<tr><td>Hex</td><td>{{hexColor}}</td></tr>
		<tr><td>RGB</td><td>{{rgbColor}}</td></tr>
	</table></span>
</template>
<template id="code_unit_template">
	<h4>Code Units</h4>
	<div class="block-body">
		<div class="decoded_values"><dl>
			<dt>Unit</dt><dd>{{codeUnit}}</dd>
			<dt>Byte/Bit Offset </dt><dd>{{byteOffset>pnum}}/{{bitOffset}}</dd>
		</dl></div>
		<div class="nav">
			<span class="size">Unit code count: {{codeUnitCount>pnum}}</span>
			<span class="jump">Jump to Unit: <input type="text" size="15" value="{{codeUnit}}" class="goto"/></span>
			<button class="prev">Previous</button>
			<button class="next">Next</button>
		</div>

		<div class="code_view code_stream_view"></div>
		<div class="code_table_view"></div>
	</div>
</template>
<template id="code_view_template">
	<h4>Code Stream</h4>
	<div class="block-body">
		<table>
			<tr x-for-each="rows"  data-code-row="{{_idx}}">
				<td class="offset">{{offset}}</td><td x-for-each="codes" class="code" data-code-col="{{_idx}}">{{.}}</td>
			</tr>
		</table>
		<div class="nav">
			<span class="size">Unit code stream count: {{codeLength>pnum}} (Page {{page}} of {{pageCount}})</span>
			<span class="jump">Jump to Page: <input type="text" size="15" value="{{page}}" class="goto"/></span>
			<button class="prev">Previous</button>
			<button class="next">Next</button>
		</div>
	</div>
	<span class="info tooltip" x-partial="tooltip"><table>
		<tr><td>Code</td><td>{{code}}</td></tr>
		<tr><td>Code Offset</td><td>{{codeOffset>pnum}}</td></tr>
	</table></span>
</template>
<template id="code_table_template">
	<h4>Code Table</h4>
	<div class="block-body">
		<table class="code_table">
			<thead>
			<tr>
				<th class="col_code">Code</th><th class="col_index">Index Sequence</th>
			</tr>
			</thead>
			<tbody>
			<tr x-for-each="rows" data-code-row="{{_idx}}">
				<td class="code">{{code}}</td><td class="colors" data-code-col="{{_idx}}">{{colors}}</td>
			</tr>
			</tbody>
		</table>
		<div class="nav">
			<span class="size">Unit code table length: {{tableLength}}</span>
			<span class="jump">Jump to code: <input type="text" size="15" value="{{codeOffset}}" class="goto"/></span>
			<button class="prev">Previous</button>
			<button class="next">Next</button>
		</div>
	</div>
</template>
<template id="expander"><div class="expander">
	<div class="header"><a href="#" class="expand">{{message}}</a></div>
	<div class="content collapsed"></div>
</div></template>
<template id="modal"><div id="myModal" class="modal">
	<div class="modal-content">
	  <span class="close close-icon">&times;</span>
	  <h4>{{header}}</h4>
	  <p>{{message}}</p>
	  <p>{{moreInfo}}</p>
	  <p><button class="close">close</button></p>
	</div>  
</div></template>
<div style="text-align:center; margin-top: 10px; padding-top: 10px; border-top: #cecece 1px solid">
    <a href="../../index.html">home</a> -
    <a href="https://github.com/MrFlick/whats-in-a-gif">github</a> -
    <a href="mailto:me@matthewflickinger.com">me@matthewflickinger.com</a>
 </div>
<script src="scripts/gif_explorer_client.js"></script>
</div>    
</body>
    
</html>