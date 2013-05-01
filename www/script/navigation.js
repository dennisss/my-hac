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
Defines the class 'navigation' to manage all events
relating to changing pages and transitioning
*/


/* CHECK THIS FUNCTION NAMESPACE NAME */
//navigator.splashscreen.show();

/*NameSpace*/
PAGESPACE = {};

var pages = {};


var TABLET_LIMIT = 600

/* Extremely Important: Funnels all page rendering so that layout can handle it correctly */
var PAGE = function(){
	this._cont = make(["DIV", { className: "page" }])[0];
	this._regions = [];
	this._focus = " ";
	
	this.clear = function(){
		this._cont.innerHTML = "";	
	};
	
	/* Sets global data in self(this) */
	this.setup = function(self, name, showNav){
		this._super = self;
		self._page = this
		self._name = name
		self._showNav = showNav
	};
	this.setFocus = function(region){
		if(region == this._focus)
			return;
		
		/* Changing Region/Scene Effects go in here */
		
		/* TODO: Add Back Navigation */
												/* Indicates that they should be side by side*/
		if(document.body.offsetWidth < TABLET_LIMIT || (region._parent != this._focus)){
			for(x = 0; x < this._regions.length; x++){
				this._regions[x].style.display = "none"
			}
			region.style.width = "100%";
			this._focus = region
			
			
			
		}
		else{
			this._focus = region
			/* Already on Screen */
			if(region._parent.style.display != "none")
			{
					
			}
			region._parent.style.display = ""
			/* Parent must already be before child */
			region._parent.style.width = "35%"
			region.style.width = "65%"
		}
		
		/*Back Button */
		this.update()
		
		region.style.display = "";
	};
	
	/* Changes the backbutton apropriately */
	this.update = function(){
		if(this._focus != " ")
		{
			if(this._focus._parent != null && this._focus._parent.style.display == "none")
				navigation._leftB.style.display = ""
			else
				navigation._leftB.style.display = "none"
		}
		else
			navigation._leftB.style.display = "none"
		
		/* Refresh Button */
		if(navigation._leftB.style.display == "none" && this._super.refresh != null)
			navigation._refreshB.style.display = ""
		else
			navigation._refreshB.style.display = "none"
	}
	
	this.back = function(){
		this.setFocus(this._focus._parent)
		
	};
	
	/* Quick reference to active region/drawing space */
	/*this._ = function(){
		return this._regions[this._focus]
	};*/
	
	/* In order for a PAGESPACE.* instance to draw. It must register a region here for each column or space.
		If "parent" is specified then side-side mode will work in tablets (on phones a back button will be used) */
	this.makeScreenRegion = function(parent){
		obj = make(["DIV", { className: "region", style: {display: "none"} }])[0];
		obj._parent = parent;		

		this._regions.push(obj);
		this._cont.appendChild(obj)
		
		return obj;
	}
	this.clearRegion = function(region){
		while (region.hasChildNodes()) {
			region.removeChild(region.lastChild);
		}
		/*region.innerHTML = ""	*/
		
	}
	this.removeRegion = function(region){
		this._cont.removeChild(region)
		for(x = 0; x < this._regions.length; x++)
		{
			if(this._regions[x] == region)
			{
				this._regions.splice(x, 1);
				return;	
			}
		}
	}
	
	this.selfDestruct = function(){
		navigation._body.removeChild(this._cont);	
	}
};


var navigation = {
	pages : {},
	goto : function(location) {
		window.location.hash = location;
	},	
	activePage : "",
	
	_header : null,
	_body : null,
	_footer : null,
	_rightB : null,
	_leftB : null,
	_refreshB : null,
	
	back : function(){
		navigation.pages[navigation.activePage]._page.back()	
	},
	refresh : function(){
		if(hac.offlineMode)
		{
			navigator.notification.alert("Resfreshing not allowed in offline mode. Please log out and log back in online.")
			return;	
		}
		if(navigation.pages[navigation.activePage].refresh != null)
			navigation.pages[navigation.activePage].refresh()
	},
	
	title: function( name){
		navigation._header.getElementsByTagName("h1")[0].innerText = name
		navigation.pages[navigation.activePage]._name = name
	},
	navigate : function(name, params){
		if(!hac.loggedIn && name != "login")
			return;
		
		window.requestAnimFrame(function(){
		
			try{
				if(navigation.activePage != "")
					navigation.pages[navigation.activePage]._page._cont.style.display = "none";
			} catch(e){alert("Bad old page: " + e)}
			
			var old = navigation.activePage;
			navigation.activePage = name;
			
			if(navigation.pages[name] == null)
			{
				page = new PAGE()
				
				navigation._body.appendChild(page._cont)
				//page._cont.style.opacity = 0.0
				try{
					navigation.pages[name] = new PAGESPACE[name](page)
				}
				catch(e){
					navigation._body.removeChild(page._cont);
					navigation.activePage = old;
					name = old;
					alert("Error loading page: " + e);
				}
			}
			
			navigation.pages[name]._page._cont.style.display = "";
			
			if(hac.loggedIn)
				navigation._rightB.style.display = ""
			else
				navigation._rightB.style.display = "none"


			navigation._header.getElementsByTagName("h1")[0].innerText = navigation.pages[name]._name
			if(navigation.pages[name]._showNav)
			{
				navigation._footer.style.display = "";
				navigation._body.style.bottom = "50px"
			}
			else
			{
				navigation._footer.style.display = "none";
				navigation._body.style.bottom = "0px"
			}
			
			//Back Button
			navigation.pages[name]._page.update();
		
		
		});
	},
	
	delocatePage : function(name){
		if(name == navigation.activePage)
			navigation.activePage = ""
		navigation.pages[name]._page.selfDestruct()
		delete navigation.pages[name];
		
	},
	
	
	
	initialized: false,
	onDeviceReady : function() {
		if(navigation.initialized)
			return;
		
		navigation.initialized = true;
		navigation._header = document.getElementById("header");
		navigation._body = document.getElementById("body");
		navigation._footer = document.getElementById("footer");
		navigation._rightB = navigation._header.getElementsByClassName("rightb")[0]
		navigation._leftB = navigation._header.getElementsByClassName("leftb")[0]
		navigation._refreshB = navigation._header.getElementsByClassName("refreshb")[0]
		navigation.navigate("login", null)
		
		
		/* CHECK THIS FUNCTION NAMESPACE NAME */
		//navigator.splashscreen.hide();
	}
}

document.addEventListener("deviceready", navigation.onDeviceReady, false);

window.onhashchange = function(e){
	
	if(window.location.hash == "" || window.location.hash == "#")
		return;
	
	var hash = 	window.location.hash.substring(1);
	var params = hash.split("|");
	var name = params[0];
	params.shift();
	
	navigation.navigate(name, params);
	
	window.location = "#";
}