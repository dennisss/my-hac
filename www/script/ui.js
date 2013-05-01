/**
 * Copyright (c) 2013 Dennis Shtatnov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
	User Interface Functions
*/


Element.prototype.fill = function(specs){
	var made = make(specs);
	for(var b = 0; b < made.length; b++)
		this.appendChild(made[b]);
};
Element.prototype.destroy = function(){
	this.parentNode.removeChild(this);
};


var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}

var entity_decode = function(str){
	var div = document.createElement('div');
	div.innerHTML = str;
	return div.firstChild.nodeValue;	
	
}

//Revision 2 of this function; do not backwards compatibility it
//Any call to innerHTML of a parentNode destroys the event listeners of its children(recursive)
/*
	Proper Specs Syntax: (JSON Element Descriptor)
	
	[
		"TAGNAME",
		{		
			exampleAttribute: "exampleValue",
			style: {
				color : "#000",
				...
				...
				..	
			},
			
			//You add child nodes like attributes except you provide an Array Value [] instead of a Object {}
			//This part is recursive meaning that the value of the "anyname" is passed back to the make() function 
			anyname: [["DIV", { ...}], ["A", { ...}], ...]
		}
	]


*/
//Returns an array of all root elements created
function make(specs)
{
	var elements = new Array();
	if(specs[0] instanceof Array)
	{	
		for(var i = 0; i < specs.length; i++)
			elements[i] = make(specs[i]);
	}
	else
	{
		var parent = document.createElement(specs[0]);
		for(var key in specs[1])
		{
			if(specs[1][key] == null)
				continue;
			if(specs[1][key] instanceof Object && !(specs[1][key] instanceof Function))
			{
				//Children declaration dropeed to specs[2]
				/*if(specs[1][key] instanceof Array)
				{
					//Recursion at its finest
					var inner = make(specs[1][key]);
					for(var b = 0; b < inner.length; b++)
						parent.appendChild(inner[b]);
				}
				else
				{*/
					for(var x in specs[1][key])
						parent[key][x] = specs[1][key][x];
				/*}*/
			}
			else
				parent[key] = specs[1][key];
		}
		if(specs.length > 2){
			for(var i = 0; i < specs[2].length; i++)
			{
				var inner = make(specs[2][i]);
				for(var b = 0; b < inner.length; b++)
					parent.appendChild(inner[b]);
				
			}
		}
		
		
		elements[0] = parent;
	}
	return elements;
}


var suppressScroll = false;
document.addEventListener(
  	'touchmove',
  	function(e) {
		if(suppressScroll){
    		e.preventDefault();
		}
  	},
  	false
);

function color_darken(c, p){
	var a = c - c*p;
	if(a < 0){
		a = 0;
	}
		
	return Math.floor(a);	
}


var eStyle = null;
function colorize(){
//ADD MORE BROWSER SUPPORT

	var alterc = function(c, percent){
		var n = c + (c*percent)
		if(n > 255){
			n = 255	
		}
		if(n < 0){
			n = 0	
		}
		return Math.floor(n)
	}

	var c_main = "rgba(" + SETTINGS.DATA.color[0] + "," + SETTINGS.DATA.color[1] + "," + SETTINGS.DATA.color[2] + ",1)"
	var c_1 = "rgba(" + alterc(SETTINGS.DATA.color[0], 0.059) + "," + alterc(SETTINGS.DATA.color[1], -0.01) + "," + alterc(SETTINGS.DATA.color[2], -0.056) + ",1)"
	var c_2 = "rgba(" + alterc(SETTINGS.DATA.color[0], -0.176) + "," + alterc(SETTINGS.DATA.color[1], -0.078) + "," + alterc(SETTINGS.DATA.color[2], -0.035) + ",1)"

//rgb(136,191,232) main
//rgb(144,189,219) c1
//rgb(112,176,224) c2
	
	if(eStyle != null){
		document.body.removeChild(eStyle);	
	}
	
	
	eStyle = document.createElement("style")
	eStyle.innerHTML = "#header, #footer{\
background: "+c_main+";\
background: -moz-linear-gradient(top, "+c_main+" 0%, "+c_1+" 50%, "+c_2+" 100%);\
background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,"+c_main+"), color-stop(50%,"+c_1+"), color-stop(100%,"+c_2+"));\
background: -webkit-linear-gradient(top, "+c_main+" 0%,"+c_1+" 50%,"+c_2+" 100%);\
background: -o-linear-gradient(top, "+c_main+" 0%,"+c_1+" 50%,"+c_2+" 100%);\
background: -ms-linear-gradient(top, "+c_main+" 0%,"+c_1+" 50%,"+c_2+" 100%);\
background: linear-gradient(to bottom, "+c_main+" 0%,"+c_1+" 50%,"+c_2+" 100%);\
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#88bfe8', endColorstr='#70b0e0',GradientType=0 );\
\
}";
	document.body.appendChild(eStyle)
	//document.getElementById("footer").setAttribute("style", style);
	//document.getElementById("header").setAttribute("style", style);
	
}


var ui = {
	ol : null,	
	overlay : function(width, height, onclose){
		ui.ol = make(["DIV", {
			style: {
				height: "100%",
				width: "100%",
				position: "fixed",
				top: "0",
				left: "0",
				zIndex : 16,
				backgroundColor: "rgba(0,0,0,0.5)"
			},
			onclick : function(){
				document.body.removeChild(this)
				ui.ol = null
				if(onclose != undefined){
					onclose();
				}
			}
		},
		[
			["DIV",{
				style : {
					position: "fixed",
					left: "50%",
					top:"50%",
					
					width:  width + "px",
					marginLeft : "-" + (width / 2) + "px",
					
					height: height + "px",
					marginTop: "-" + (height / 2) + "px",
					
					backgroundColor: "#fff",
					/*margin: "0 auto",*/
					
					padding: "20px",
					borderRadius : "0px",
					border: "1px #444 solid"
					
				},
				className : "borderBox"
			}
			
			]
		]
		])[0];
		
		document.body.appendChild(ui.ol);
		return ui.ol.children[0];
	},
	
	
	loadingBegin : function(){
	
		if(loadingDiv == null)
		{
			loadingDiv = make(["DIV", {
				style: {
					height: "100%",
					width: "100%",
					position: "fixed",
					top: "0",
					left: "0",
					zIndex : 16,
					backgroundColor: "rgba(0,0,0,0.5)"
				}
			},
			[
				["DIV",{
					innerHTML: "<center><h3>Loading</h3><br /><img src='img/spinner2.gif' /></center>",
					style : {
						position: "fixed",
						left: "50%",
						top:"50%",
						width: "130px",
						height: "80px",
						backgroundColor: "#fff",
						/*margin: "0 auto",*/
						marginTop: "-50px",
						marginLeft : "-75px",
						borderRadius : "0px",
						border: "1px #444 solid",
						padding:"10px"
						
					}
				}
				
				]
			]
			])[0];
		}
		document.body.appendChild(loadingDiv);
	},
	loadingEnd : function(){
		document.body.removeChild(loadingDiv)
	}
	
	
};


var loadingDiv = null;


window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

function elementInViewport(el) {
    var rect = el.getBoundingClientRect()

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth 
        )
}


var li = {};
li.ontouchstart = function(){
	for(i = 0; i < this.parentNode.children.length; i++)
		this.parentNode.children[i].style.backgroundColor = "";
				
		this.style.backgroundColor = "rgb(" + color_darken(SETTINGS.DATA.color[0],0.05) + "," + color_darken(SETTINGS.DATA.color[1],0.05) + "," + color_darken(SETTINGS.DATA.color[2],0.05) + ")" //"#74a7f2";
		this.down = true;
								
};
li.ontouchmove = function(){
	if(this.down)
	{
		this.style.backgroundColor = "";
		this.down = false;
	}
								
};

function checkbox(obj){
	if(obj.getAttribute("checked") == "checked") {
		obj.innerText = " "
		obj.removeAttribute("checked");
		obj.setAttribute("value", "true");
	}
	else {
		obj.innerText = "✓"
		obj.setAttribute("checked", "checked");
		obj.setAttribute("value", "false");
	}
	try{
		if(typeof obj.onchange == "function") {
			obj.onchange.apply(obj);
		}
	} catch(e){}
}
function checkInit(id){
	var check = document.getElementById(id);
	//Invert value
	check.setAttribute("checked", check.getAttribute("checked") ? "" : "checked");
	checkbox(check);	
}










//ABSTRACT THE COLOR PICKER FOR NOT JUST THE THEME COLOR



//Currently this code is obviously extremely messy
function colorpicker(id, color){
	
	var elem = make([
	"DIV", {
		onclick : function(){
			var max_size = Math.min(document.body.offsetWidth, document.body.offsetHeight);
			var size = 400;
			
			if(max_size < 420){
				size = max_size - 20;	
			}
			
			var picker = ui.overlay(size, size);
			
			size -= 40;
			
			var scale = (size) / 256.0;
			
			if(!this.helpShown){
				navigator.notification.alert("Use the touchscreen to move around and pinch the color field to find the color you like best. The currently selected color is shown in the very middle of the screen.", null, "How to pick a color.");
				this.helpShown = true
			}
			//Call self.onchange(newColor)
			var self = this
			
			picker.fill([
			"CANVAS",{
				id: "myCanvas",
				height: "" + (size),
				width: "" + (size),
					
			}]);
		
			
			var c=document.getElementById("myCanvas");
			var ctx=c.getContext("2d");
			
			var imgDat=ctx.createImageData(256,256);
			/*for (var i=0; i < imgData.data.length; i+=4 ){
				imgData.data[i+0] = (i/4)%256;
				imgData.data[i+1] = (i/4)/256;
				imgData.data[i+2] = 0;
				imgData.data[i+3] = 255;
			}*/
			
			
			
			
			var c2 = document.createElement("canvas")
			c2.setAttribute("height", "256")
			c2.setAttribute("width", "256")
			
			var ctx2 = c2.getContext("2d");
			ctx2.putImageData(imgDat,0,0);
			
			
			var getX = function(e) {
				if(e.targetTouches != undefined){
					return e.targetTouches[0].pageX;
    			}
    			else {
        			return e.pageX;
    			}
			}
			
			var getY = function(e) {
				if(e.targetTouches != undefined){
					return e.targetTouches[0].pageY;
    			}
    			else {
        			return e.pageY;
    			}
			}
		
			var gradientf = function(x){
				return (Math.abs(255*Math.sin(x * Math.PI / 512)))%256
			}
			var arcgradientf = function(x){
				return Math.floor(Math.asin(x / 255.0) * (512.0/Math.PI))
			}
		
		
			var sX = 0;
			var sY = 0;
			var rX = -arcgradientf(this.r) + 128;
			var rY = -arcgradientf(this.g) + 128;
			
			var blue = this.b;
			var d = 0;
			
			var moving = false
			var pinching = false
			
			var multitouch = function(e){
				if(e.targetTouches != undefined){
					if(e.targetTouches.length > 1){
						d = Math.sqrt(Math.pow(e.targetTouches[0].pageX - e.targetTouches[1].pageX, 2) + Math.pow(e.targetTouches[0].pageY - e.targetTouches[1].pageY, 2))		
						return true
					}
					else
						return false
    			}
				return false
			}
			
			var start = function(e){
				sX = getX(e)
				sY = getY(e)
				
				pinching = multitouch(e)
				
				moving = true;
			}
			var sstop = function(e){
				moving = false;
				pinching = false;
			}
		
			
			var draw = function(e){
				if(pinching){
					var old_d = d;
					if(multitouch(e)){
						var delD = d - old_d
						
						blue += delD;
						if(blue > 255){
							blue = 255;	
						}
						if(blue < 0){
							blue = 	0;
						}
						
						return
												
					}
					else{
						pinching = false;
					}
				}
				
				if(!moving)
					return
				
				
				rX += -(sX - getX(e));
				rY += -(sY - getY(e));
				

				sX = getX(e)
				sY = getY(e)				
			};
			
			
			//Preload most of the constant stuff to accelerate rendering
			var imgData=ctx2.createImageData(256,256);
			for (var i = 0; i < imgData.data.length; i+=4 ){
				imgData.data[i+2] = blue;
				imgData.data[i+3] = 255;
			}
			
			var f = function(){
					
					
					var x = -rX;
					var y = -rY;
					
					
					if(imgData.data[2] !== Math.floor(blue)){
						for (var i = 0; i < imgData.data.length; i+=4 ){
							imgData.data[i+2] = Math.floor(blue);
						}	
					}
					else{
					
						//To save on operations, the values are only calculated absolutely necessary
						var yVal = gradientf(y);
						for (var i = 0; i < imgData.data.length; i+=4 ){
							
							// //Do the entire column while we have the gradient value calculated
							if(y == -rY){
								var xVal = gradientf(x);
								//for(var j = i; j < imgData.data.length; j+=1024 /* 4*256 */){
								//	imgData.data[j] = xVal;
								//}
								
								imgData.data[i] = xVal;
							}
							else{
								imgData.data[i] = imgData.data[i - 1024];
							}
							
							imgData.data[i+1] = yVal;
						
							x++;
							
							if(((i+4)/4) % 256 == 0){
								x = -rX;
								y += 1;
								yVal = gradientf(y);
								
							}
						}	
					
					}
					
					//TODO: SCALE THE IMAGE FASTER
					
					//var scale = 1;
					
					//if(scale > 1.1){
						ctx2.putImageData(imgData,0,0);
						ctx.setTransform(scale, 0, 0, scale, 0, 0)
						ctx.drawImage(c2, 0, 0)
					//}
					//else{
					//	ctx.putImageData(imgData,0,0);
					//}
					
					
					ctx.setTransform(1, 0, 0, 1, 0, 0)
					ctx.fillStyle = "#ffffff";
					ctx.fillRect((size - 64)/2, (size - 64)/2, 64, 64);
			
					ctx.fillStyle = "rgb(" + imgData.data[128*4*256 + 128*4 + 0] + "," + imgData.data[128*4*256 + 128*4 + 1] + "," + imgData.data[128*4*256 + 128*4 + 2] + ")";
					
					self.newcolor.apply(self,[imgData.data[128*4*256 + 128*4 + 0], imgData.data[128*4*256 + 128*4 + 1], imgData.data[128*4*256 + 128*4 + 2]])
					
					ctx.fillRect((size - 60)/2, (size - 60)/2, 60, 60);
			
					colorize()
					
					if(ui.ol != null){
						window.requestAnimFrame(f);
					}
					else {
						suppressScroll = false;
						self.style.backgroundColor = "rgb("+self.r+","+self.g+","+self.b+")";
						SETTINGS.cacheData();
					}
			};
		
			window.requestAnimFrame(f);
		
		
			c.addEventListener("touchstart",start,false);
    		c.addEventListener("touchmove",draw,false);
    		c.addEventListener("touchend",sstop,false);
    		
			suppressScroll = true;
			
			//c.addEventListener("mousedown",start,false);
    		//c.addEventListener("mousemove",draw,false);
    		//c.addEventListener("mouseup",stop,false);
    		//c.addEventListener("mouseout",stop,false);
			
			
			
			ctx.transform(scale, 0, 0, scale, 0, 0)
			
			ctx.drawImage(c2, 0, 0)
		},
		
		newcolor : function(r, g, b){
			//this.style.backgroundColor = "rgb("+r+","+g+","+b+")";
			this.r = r
			this.g = g
			this.b = b
			SETTINGS.DATA.color = [r,g,b]
			//SETTINGS.queueCache();
		},
		
		style:{
			backgroundColor : "rgb("+color[0]+","+color[1]+","+color[2]+")",
			width: "40px",
			height: "40px",
			border : "1px solid black"	
		},
		
		r: color[0],
		g: color[1],
		b: color[2],
		helpShown : false,
		
		
		
		
		
	}
	
	])[0]
	
	return elem
	
	
}