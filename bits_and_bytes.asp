
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title>3MF Project: What's In A GIF - Bit by Byte</title>
	<script type="text/javascript"></script>
	<link rel="stylesheet" href="../proj.css" />
	<style type="text/css">
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
	</style>
</head>
<body>
<!--Also See: http://www.async.caltech.edu/~kp/Misc/gifEx.html-->

<div id="nav"><a href="../index.html">back to main lab page</a></div>
<div id="body">


<h1>Project: <span class="projname">What's In A GIF - Bit by Byte</span></h1>

<div class="projdesc">
	<p>
	We sill start off by walking though the different parts of a GIF file.
	(The information on this page is primarily drawn from the
	<a href="http://www.w3.org/Graphics/GIF/spec-gif89a.txt">W3C GIF89a specification</a>.)
	A GIF file is made up of a bunch of different &quot;blocks&quot; of data. The following diagram
	shows all of the different types of blocks and where they belong in the file. The file starts
	at the left and works it's way right. At each branch you may go one way or the other. The
	large &quot;middle&quot; section can be repeated as many times as needed. (Technically, it may
	also be omitted completely but i can't imagine what good a GIF file with no image data
	would be.)
	</p>
	<p style="text-align:center"><img src="images/gif_file_stream.gif" alt="GIF file stream diagram" style="border: 1px solid black" / WIDTH="700" HEIGHT="220"></p>
	<p>
	I'll show you what these blocks looks like by walking through a sample
	GIF file. You can see the sample file and its corresponding bytes below.
	</p>
	<table>
	<tr>
	<td style="text-align:center; vertical-align: top; padding: 5px; width:20%"><h3>Actual Size</h3><img src="images/sample_1.gif" alt="sample gif, actual size" title="Actual Size" style="padding: 20px" / WIDTH="10" HEIGHT="10"><br/>(10x10)</td>
	<td style="text-align:center; vertical-align: top; padding: 5px;; width:20%"><h3>Enlarged</h3><img src="images/sample_1_enlarged.gif" alt="sample gif, enlarged" title="Enlarged" / WIDTH="100" HEIGHT="100"><br/>(100x100)</td>
	<td style="vertical-align: top; padding: 5px; width:60%"><h3>Bytes</h3>
	<span class="byte gif_header"> 47 </span><span class="byte gif_header"> 49 </span><span class="byte gif_header"> 46 </span><span class="byte gif_header"> 38 </span><span class="byte gif_header"> 39 </span><span class="byte gif_header"> 61 </span>
	<span class="byte gif_screen"> 0A </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 0A </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 91 </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 00 </span>
	<span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span>
	<span class="byte gif_graphic"> 21 </span><span class="byte gif_graphic"> F9 </span><span class="byte gif_graphic"> 04 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span>
	<span class="byte gif_imgdesc"> 2C </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 0A </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 0A </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span>
	<span class="byte gif_imgdata"> 02 </span><span class="byte gif_imgdata"> 16 </span><span class="byte gif_imgdata"> 8C </span><span class="byte gif_imgdata"> 2D </span><span class="byte gif_imgdata"> 99 </span><span class="byte gif_imgdata"> 87 </span><span class="byte gif_imgdata"> 2A </span><span class="byte gif_imgdata"> 1C </span><span class="byte gif_imgdata"> DC </span><span class="byte gif_imgdata"> 33 </span><span class="byte gif_imgdata"> A0 </span><span class="byte gif_imgdata"> 02 </span><span class="byte gif_imgdata"> 75 </span><span class="byte gif_imgdata"> EC </span><span class="byte gif_imgdata"> 95 </span><span class="byte gif_imgdata"> FA </span><span class="byte gif_imgdata"> A8 </span><span class="byte gif_imgdata"> DE </span><span class="byte gif_imgdata"> 60 </span><span class="byte gif_imgdata"> 8C </span><span class="byte gif_imgdata"> 04 </span><span class="byte gif_imgdata"> 91 </span><span class="byte gif_imgdata"> 4C </span><span class="byte gif_imgdata"> 01 </span><span class="byte gif_imgdata"> 00 </span><span class="byte gif_trailer"> 3B </span>
	</td>
	</tr>
	</table>

	<p>
	Note that not all blocks are represented in this sample file. I will provide samples of missing
	blocks where appropriate.
	The different types of blocks include:
		<a href="#header_block">header</a>,
		<a href="#logical_screen_descriptor_block">logical screen descriptor</a>,
		<a href="#global_color_table_block">global color table</a>,
		<a href="#graphics_control_extension_block">graphics control extension</a>,
		<a href="#image_descriptor_block">image descriptor</a>,
		<a href="#local_color_table_block">local color table</a>,
		<a href="#image_data_block">image data</a>,
		<a href="#plain_text_extension_block">plain text extension</a>,
		<a href="#application_extension_block">application extension</a>,
		<a href="#comment_extension_block">comment extension</a>,
		and <a href="#trailer_block">trailer</a>.
	Let's get started with the first block!
	</p>

	<h2><a name="header_block">Header Block</a></h2>
	<p>From Sample File: <span class="byte gif_header"> 47 </span><span class="byte gif_header"> 49 </span><span class="byte gif_header"> 46 </span><span class="byte gif_header"> 38 </span><span class="byte gif_header"> 39 </span><span class="byte gif_header"> 61 </span></p>
	<p>
	All GIF files must start with a header block. The header takes up the first
	six bytes of the file. These bytes should all correspond to
	<a href="http://www.ascii.cl/">ASCII character codes</a>. We actually have two pieces
	of information here. The first three bytes are called the <strong>signature</strong>.
	These should always be &quot;GIF&quot; (ie 47=&quot;G&quot;, 49=&quot;I&quot;, 46=&quot;F&quot;). The next three specify the
	<strong>version</strong> of the specification that was used to encode the image. We'll only be working
	with &quot;89a&quot; (ie 38=&quot;8&quot;, 39=&quot;9&quot;, 61=&quot;a&quot;). The only other recognized version string
	is &quot;87a&quot; but i doubt most people will run into those anymore.
	</p>
	<p style="text-align:center"><img src="images/header_block.gif" alt="GIF header block layout" style="border: 1px solid black" /></p>

	<h2><a name="logical_screen_descriptor_block">Logical Screen Descriptor</a></h2>
	<p>From Sample File: <span class="byte gif_screen"> 0A </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 0A </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 91 </span><span class="byte gif_screen"> 00 </span><span class="byte gif_screen"> 00 </span></p>
	<p>
	The logical screen descriptor always immediately follows the header. This block
	tells the decoder how much room this image will take up. It is exactly
	seven bytes long. It starts with the <strong>canvas width</strong>. This value
	can be found in the first two bytes. It's saved in a format called the spec
	simply calls <em>unsigned</em>. Basically we're looking at a 16-bit, nonnegative
	integer (0-65,535). As with all the other multi-byte values in the GIF format, the least
	significant byte is stored first (little-endian format). This means where we would read
	<span class="byte"> 0A </span><span class="byte"> 00 </span>
	from the byte stream, we would normally write it as <span class="byte">000A</span> which is
	the same as 10. Thus the width of our sample image is 10 pixels. As a further example
	255 would be stored as <span class="byte"> FF </span><span class="byte"> 00 </span> but 256 would be <span class="byte"> 00 </span><span class="byte"> 01 </span>.
	As you might expect, the <strong>canvas height</strong> follows. Again, in this sample we
	can see this value is <span class="byte"> 0A </span><span class="byte"> 00 </span> which is 10.
	</p>
	<p>
	Next we have a <em>packed byte</em>. That means that this byte actually has multiple values
	stored in its bits. In this case, the byte <span class="byte"> 91 </span> can be represented
	as the binary number <span class="byte">10010001</span>. (The built in Windows calculator
	is actually very useful when converting numbers into hexadecimal and binary formats. Be sure
	it's in &quot;scientific&quot; or &quot;programmer&quot; mode, depending on the version of
	windows you have.) The first (most-significant) bit is the <strong>global color
	table flag</strong>. If it's 0, then there is none. If it's 1, then a global color table will
	follow. In our sample image, we can see that we will have a global color table (as will usually
	be the case).  The next three bits represent the <strong>color resolution</strong>. The spec
	says this value &quot; is the number of bits per primary color available to the original image,
	minus 1&quot; and &quot;...represents the size of the entire palette from which the colors in the
	graphic were selected.&quot; Because i don't much about what this one does, I'll point you to
	a more knowledgeable article on <a href="http://www.devx.com/projectcool/Article/19997/0/page/7">bit and color depth</a>.
	For now 1 seems to work. Note that <span class="byte">001</span> represents 2 bits/pixel;
	<span class="byte">111</span> would represent 8 bits/pixel.
	The next single bit is the <strong>sort flag</strong>. If the values is 1, then the
	colors in the global color table are sorted in order of &quot;decreasing importance,&quot; which
	typically means &quot;decreasing frequency&quot; in the image. This can help the image decoder but
	is not required. Our value has been left at 0. The last three bits are the <strong>
	size of global color table</strong>. Well, that's a lie; it's not the actual size of the
	table. If this value is N, then the actual table size is 2^(N+1). From our sample
	file, we get the three bits <span class="byte">001</span> which is the binary version of 1.
	Our actual table size would be 2^(1+1) = 2^2 = 4. (We've mentioned the global color table
	several times with this byte, we will be talking about what it is in the next section.)
	</p>
	<p>
	The next byte gives us the <strong>background color index</strong>. This byte is only meaningful
	if the global color table flag is 1. It represents which color in the global color table
	(by specifying its index) should be used for pixels whose value is not specified in the
	image data. If, by some chance, there is no global color table, this byte should be 0.
	</p>
	<p>
	The last byte of the logical screen descriptor is the <strong>pixel aspect ratio</strong>.
	I'm not exactly sure what this value does. Most of the images I've seen have this value
	set to 0. The spec says that if there was a value specified in this byte, N, the actual
	ratio used would be (N + 15) / 64 for all N&lt;&gt;0.
	</p>
	<p style="text-align:center"><img src="images/logical_screen_desc_block.gif" alt="GIF logical screen descriptor block layout" style="border: 1px solid black" /></p>





	<h2><a name="global_color_table_block">Global Color Table</a></h2>
	<p>From Sample File: <span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> FF </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span><span class="byte gif_color"> 00 </span></p>
	<p>
	We've mentioned the <strong>global color table</strong> a few times already now lets talk
	about what it actually is. As you are probably already aware, each GIF has its own color
	palette. That is, it has a list of all the colors that can be in the image and cannot
	contain colors that are not in that list. The global color table is where that list
	of colors is stored. Each color is stored in three bytes. Each of the bytes represents
	an RGB color value. The first byte is the value for red (0-255), next green, then blue.
	The size of the global color table is determined by the value in the packed byte of the
	logical screen descriptor. As we mentioned before, if the value from that byte is N, then
	the actual number of colors stored is 2^(N+1). This means that the global color table will
	take up 3*2^(N+1) bytes in the stream.
	</p>

	<div style="text-align:center">
	<table id="global_color_size">
	<tr><th>Size In Logical<br/>Screen Desc</th><th>Number Of<br/>Colors</th><th>Byte<br/>Length</th></tr>
	<tr><td>0</td><td>2</td><td>6</td></tr>
	<tr><td>1</td><td>4</td><td>12</td></tr>
	<tr><td>2</td><td>8</td><td>24</td></tr>
	<tr><td>3</td><td>16</td><td>48</td></tr>
	<tr><td>4</td><td>32</td><td>96</td></tr>
	<tr><td>5</td><td>64</td><td>192</td></tr>
	<tr><td>6</td><td>128</td><td>384</td></tr>
	<tr><td>7</td><td>256</td><td>768</td></tr>
	</table>
	</div>

	<p>
	Or sample file has a global color table size of 1. This means it holds 2^(1+1)=2^2=4 colors.
	We can see that it takes up 12, (3*4), bytes as expected. We read the bytes three at a time to get
	each of the colors. The first color is #FFFFFF (white). This value is given an index of 0.
	The second color is #FF0000 (red). The color with an index value of 2 is #0000FF (blue).
	The last color is #000000 (black). The index numbers will be important when we decode
	the actual image data.
	</p>
	<p>
	Note that this block is labeled as &quot;optional.&quot; Not every GIF has to specify a global
	color table. However, if the global color table flag is set to 1 in the logical
	screen descriptor block, the color table is then required to immediately follow that
	block.
	</p>
	<p style="text-align:center"><img src="images/global_color_table.gif" alt="GIF global color table block layout" style="border: 1px solid black" /></p>



	<h2><a name="graphics_control_extension_block">Graphics Control Extension</a></h2>
	<p>From Sample File: <span class="byte gif_graphic"> 21 </span><span class="byte gif_graphic"> F9 </span><span class="byte gif_graphic"> 04 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span><span class="byte gif_graphic"> 00 </span></p>
	<p>
	Graphic control extension blocks are used frequently to
	specify transparency settings and control animations. They are completely optional.
	Since transparency and animations are bit complicated, I will hold off on many of
	the details of this block until a later section
	(see <a href="animation_and_transparency.asp">Transparency and Animation</a>).
	In the interest of this page being complete, I will at least tell you what
	the bytes represent.
	</p>
	<p>
	The first byte is the <strong>extension introducer</strong>. All <em>extension</em>
	blocks begin with <span class="byte">21</span>. Next is the <strong>graphic
	control label</strong>, <span class="byte">F9</span>, which is the value that
	says this is a graphic control extension. Third up is the total <strong>block
	size</strong> in bytes. Next is a packed field. Bits 1-3 are reserved for future
	use. Bits 4-6 indicate <strong>disposal method</strong>. The penult bit is
	the <strong>user input flag</strong> and the last is the <strong>transparent color
	flag</strong>. The <strong>delay time</strong> value follows in the next two bytes
	stored in the unsigned format. After that we have the <strong>transparent color
	index</strong> byte. Finally we have the <strong>block terminator</strong> which
	is always <span class="byte">00</span>.
	</p>
	<p style="text-align:center"><img src="images/graphic_control_ext.gif" alt="GIF graphic control extension block layout" style="border: 1px solid black" /></p>




	<h2><a name="image_descriptor_block">Image Descriptor</a></h2>
	<p>From Sample File: <span class="byte gif_imgdesc"> 2C </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 0A </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 0A </span><span class="byte gif_imgdesc"> 00 </span><span class="byte gif_imgdesc"> 00 </span></p>
	<p>
	A single GIF file may contain multiple images (useful when creating animated
	images). Each image begins with an image descriptor block. This block is exactly
	10 bytes long.
	</p>
	<p>
	The first byte is the <strong>image separator</strong>. Every image
	descriptor begins with the value <span class="byte">2C</span>. The next 8 bytes
	represent the location and size of the following image. An image in
	the stream may not necessarily take up the entire canvas size defined by
	the logical screen descriptor. Therefore, the image descriptor specifies
	the <strong>image left position</strong> and <strong>image top position</strong> of
	where the image should begin on the canvas. Next it specifies the
	<strong>image width</strong> and <strong>image height</strong>. Each of these
	values is in the two-byte, unsigned format. Our sample image indicates that
	the image starts at (0,0) and is 10 pixels wide by 10 pixels tall. (This image
	does take up the whole canvas size.)
	</p>
	<p>
	The last byte is another packed field. In our sample file this byte is 0 so
	all of the sub-values will be zero. The first (most significant) bit in
	the byte is the <strong>local color table flag</strong>. Setting this flag
	to 1 allows you to specify that the image data that follows uses a different
	color table than the global color table. (More information on the local
	color table follows.) The second bit is the <strong>interlace flag</strong>.
	</p>
	<p style="text-align:center"><img src="images/image_descriptor_block.gif" alt="GIF image descriptor block layout" style="border: 1px solid black" /></p>





	<h2><a name="local_color_table_block">Local Color Table</a></h2>
	<p>
	The local color table looks identical to the global color table. The local
	color table would always immediately follow an image descriptor but will only
	be there if the local color table flag is set to 1. It is effective only for the
	block of image data that immediately follows it. If no local color table
	is specified, the global color table is used for the following image data.
	</p>
	<p>
	The size of the local color table can be calculated by the value given in the
	image descriptor. Just like with the global color table, if the image descriptor
	specifies a size of N, the color table will contain 2^(N+1) colors and will take
	up 3*2^(N+1) bytes. The colors are specified in RGB value triplets.
	</p>





	<h2><a name="image_data_block">Image Data</a></h2>
	<p>From Sample File: <span class="byte gif_imgdata"> 02 </span><span class="byte gif_imgdata"> 16 </span><span class="byte gif_imgdata"> 8C </span><span class="byte gif_imgdata"> 2D </span><span class="byte gif_imgdata"> 99 </span><span class="byte gif_imgdata"> 87 </span><span class="byte gif_imgdata"> 2A </span><span class="byte gif_imgdata"> 1C </span><span class="byte gif_imgdata"> DC </span><span class="byte gif_imgdata"> 33 </span><span class="byte gif_imgdata"> A0 </span><span class="byte gif_imgdata"> 02 </span><span class="byte gif_imgdata"> 75 </span><span class="byte gif_imgdata"> EC </span><span class="byte gif_imgdata"> 95 </span><span class="byte gif_imgdata"> FA </span><span class="byte gif_imgdata"> A8 </span><span class="byte gif_imgdata"> DE </span><span class="byte gif_imgdata"> 60 </span><span class="byte gif_imgdata"> 8C </span><span class="byte gif_imgdata"> 04 </span><span class="byte gif_imgdata"> 91 </span><span class="byte gif_imgdata"> 4C </span><span class="byte gif_imgdata"> 01 </span><span class="byte gif_imgdata"> 00 </span></p>
	<p>
	Finally we get to the actual image data. The image data is composed of
	a series of output codes which tell the decoder which colors to spit
	out to the canvas. These codes are combined into the bytes that make up
	the block. I've set an whole other section on decoding these output
	code into an image (see <a href="lzw_image_data.asp">LZW Image Data</a>).
	On this page i'm just going to tell you how to determine how long the block will be.
	</p>
	<p>
	The first byte of this block is the <strong>LZW minimum code size</strong>.
	This value is used to decode the compressed output codes. (Again, see the
	section on <a href="lzw_image_data.asp">LZW compression</a> to see how this works.)
	The rest of the bytes represent <em>data sub-blocks</em>. Data sub-blocks are
	are groups of 1 - 256 bytes. The first byte in the sub-block tells you how many
	bytes of actual data follow. This can be a value from 0 (<span class="byte">00</span>)
	it 255 (<span class="byte">FF</span>). After you've read those bytes,
	the next byte you read will tell you now many more bytes of data follow that
	one. You continue to read until you reach a sub-block that says that
	zero bytes follow.
	</p>
	<p>
	You can see our sample file has a LZW minimum code size of 2. The next byte
	tells us that 22 bytes of data follow it (<span class="byte">16</span> hex = 22).
	After we've read those 22 bytes, we see the next value is 0. This means that
	no bytes follow and we have read all the data in this block.
	</p>
	<p style="text-align:center"><img src="images/image_data_block.gif" alt="GIF image data block layout" style="border: 1px solid black" /></p>





	<h2><a name="plain_text_extension_block">Plain Text Extension</a></h2>
	<p>Example (Not in Sample File): <span class="byte gif_ext"> 21 </span><span class="byte gif_ext"> 01 </span><span class="byte gif_ext"> 0C </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 64 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 64 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 14 </span><span class="byte gif_ext"> 14 </span><span class="byte gif_ext"> 01 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 0B </span><span class="byte gif_ext"> 68 </span><span class="byte gif_ext"> 65 </span><span class="byte gif_ext"> 6C </span><span class="byte gif_ext"> 6C </span><span class="byte gif_ext"> 6F </span><span class="byte gif_ext"> 20 </span><span class="byte gif_ext"> 77 </span><span class="byte gif_ext"> 6F </span><span class="byte gif_ext"> 72 </span><span class="byte gif_ext"> 6C </span><span class="byte gif_ext"> 64 </span><span class="byte gif_ext"> 00 </span></p>
	<p>
	Oddly enough the spec allows you to specify text which you wish to
	have rendered on the image. I followed the spec to see if any application
	would understand this command; but IE, FireFox, and Photoshop all failed
	to render the text. Rather than explaining all the bytes, I'll tell you
	how to recognize this block and skip over it
	</p>
	<p>
	The block begins with an <strong>extension introducer</strong> as all
	extension block types do. This value is always <span class="byte">21</span>.
	The next byte is the <strong>plain text label</strong>. This value of
	<span class="byte">01</span> is used to distinguish plain text extensions
	from all other extensions. The next byte is the <strong>block size</strong>.
	This tells you how many bytes there are until the actual text data begins, or
	in other words, how many bytes you can now skip. The byte value will probably be
	<span class="byte">0C</span> which means you should jump down 12 bytes. The
	text that follows is encoded in data sub-blocks
	(see <a href="#image_data_block">Image Data</a> to see how
	these sub-blocks are formed). The block ends when you reach a sub-block of
	length 0.
	</p>




	<h2><a name="application_extension_block">Application Extension</a></h2>
	<p>Example (Not in Sample File): <span class="byte gif_ext"> 21 </span><span class="byte gif_ext"> FF </span><span class="byte gif_ext"> 0B </span><span class="byte gif_ext"> 4E </span><span class="byte gif_ext"> 45 </span><span class="byte gif_ext"> 54 </span><span class="byte gif_ext"> 53 </span><span class="byte gif_ext"> 43 </span><span class="byte gif_ext"> 41 </span><span class="byte gif_ext"> 50 </span><span class="byte gif_ext"> 45 </span><span class="byte gif_ext"> 32 </span><span class="byte gif_ext"> 2E </span><span class="byte gif_ext"> 30 </span><span class="byte gif_ext"> 03 </span><span class="byte gif_ext"> 01 </span><span class="byte gif_ext"> 05 </span><span class="byte gif_ext"> 00 </span><span class="byte gif_ext"> 00 </span></p>
	<p>
	The spec allows for application specific information to be embedded in
	the GIF file itself. The only reference to could find to application
	extensions was the <a href="http://odur.let.rug.nl/~kleiweg/gif/netscape.html">NETSCAPE2.0</a>
	extension which is used to loop an animated GIF file. I'll go into more detail
	on looping in when we talk about <a href="animation_and_transparency.asp">animation</a>.
	</p>
	<p>
	Like with all extensions, we start with <span class="byte">21</span> which is the
	<strong>extension introducer</strong>. Next is the <strong>extension label</strong>
	which for application extensions is <span class="byte">FF</span>. The next
	value is the <strong>block size</strong> which tells you how many bytes there
	are before the actual application data begins. This byte value should be
	<span class="byte">0B</span> which indicates 11 bytes. These 11 bytes hold
	two pieces of information. First is the <strong>application identifier</strong>
	which takes up the first 8 bytes. These bytes should contain ASCII character codes
	that identify to which application the extension belongs. In the case of the
	example above, the application identifier is &quot;NETSCAPE&quot; which is conveniently 8
	characters long. The next three bytes are the <strong>application authentication
	code</strong>. The spec says these bytes can be used to &quot;authenticate the
	application identifier.&quot; With the NETSCAPE2.0 extension, this value is simply
	a version number, &quot;2.0&quot;, hence the extensions name. What follows is the
	application data broken into data sub-blocks. Like with the other extensions,
	the block terminates when you read a sub-block that has zero bytes of data.
	</p>




	<h2><a name="comment_extension_block">Comment Extension</a></h2>
	<p>Example (Not in Sample File): <span class="byte gif_ext"> 21 </span><span class="byte gif_ext"> FE </span><span class="byte gif_ext"> 09 </span><span class="byte gif_ext"> 62 </span><span class="byte gif_ext"> 6C </span><span class="byte gif_ext"> 75 </span><span class="byte gif_ext"> 65 </span><span class="byte gif_ext"> 62 </span><span class="byte gif_ext"> 65 </span><span class="byte gif_ext"> 72 </span><span class="byte gif_ext"> 72 </span><span class="byte gif_ext"> 79 </span><span class="byte gif_ext"> 00 </span></p>
	<p>
	One last extension type is the comment extension. Yes, you can actually
	embed comments with in a GIF file. Why you would want to increase the file
	size with unprintable data, i'm not sure. Perhaps it would be a fun way to
	pass secret messages.
	</p>
	<p>
	It's probably no surprise by now that the first byte is the <strong>extension
	introducer</strong> which is <span class="byte">21</span>. The next byte
	is always <span class="byte">FE</span> which is the <strong>comment label</strong>.
	Then we jump right to data sub-blocks containing ASCII character codes
	for your comment. As you can see from the example we have one data sub-block
	that is 9 bytes long. If you translate the character codes you see that the comment
	is &quot;blueberry.&quot; The final byte, <span class="byte">00</span>, indicates a sub-block
	with zero bytes that follow which let's us know we have reached the end of the block.
	</p>
	<p style="text-align:center"><img src="images/comment_ext.gif" alt="GIF comment extension block layout" style="border: 1px solid black" /></p>


	<h2><a name="trailer_block">Trailer</a></h2>
	<p>From sample file: <span class="byte gif_trailer"> 3B </span></p>
	<p>The trailer block indicates when you've hit the end of the file.
	It is always a byte with a value of <span class="byte">3B</span>.
	</p>
	<p style="text-align:center"><img src="images/trailer_block.gif" alt="GIF trailer block layout" style="border: 1px solid black" /></p>

	<h2>Next: LZW Image Data</h2>
	<p>Now that you know what the basic parts of a GIF file are, let's next
	focus our attention on how the actual image data is stored and compressed.
	<a href="lzw_image_data.asp">Continue...</a></p>
</div>


<div style="text-align:center; margin-top: 10px; padding-top: 10px; border-top: #cecece 1px solid">
<a href="../../index.html">home</a> -
<a href="../../blog/index.html">blog</a> -
<a href="mailto:me@matthewflickinger.com">me@matthewflickinger.com</a>
</div>

</div>


</body>

</html>

<!-- Localized -->
