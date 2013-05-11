/**
 * Copyright (c) 2013 Dennis Shtatnov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


//TODO: The Updater code should be done by the next release


//document.addEventListener("deviceready", onDeviceReady, false);

var isMobile = {
    Android: function() {return navigator.userAgent.match(/Android/i);},
    BlackBerry: function() {return navigator.userAgent.match(/BlackBerry/i);},
    iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
    Opera: function() {return navigator.userAgent.match(/Opera Mini/i);},
    Windows: function() {return navigator.userAgent.match(/IEMobile/i);},
    any: function() {return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());}
};


function getLocalStorageKey(url, version){
	return url + "::" + version;
}

//This function will dynamically pick between memory and local sources for the given url
//If version 1, forced local
function include(url, version, done){
	
	var ext = url.split(".").reverse()[0].toLowerCase();
		
	var data = null;
	if(version !== 1){
		data = localStorage.getItem(getLocalStorageKey(url, version));
		if(data === null){
			//The version is not available
			return false;
		}
	}
	
	//TODO: Make this also validate the existence of local files
	
	var scr = null;
	if(ext === "js"){
		scr = document.createElement("script");
		scr.setAttribute("type", "text/javascript");
		scr.setAttribute("src", url);
	}
	
	if(ext === "css"){
		if(data !== null){
			scr = document.createElement("style");
		}
		else{
			scr = document.createElement("link");
			scr.setAttribute("rel", "stylesheet");
			scr.setAttribute("href", url);
		}
		
		scr.setAttribute("type", "text/css");
	}
	
	if(data !== null){	
		scr.innerHTML = data;
	}
	
	
	if(done != undefined){
		var loaded = false;
		
		scr.onreadystatechange= function () {
			if(this.readyState == 4 && !loaded){
				loaded = true
				done();
			}
		}
		
		scr.onload = function(){
			if(!loaded){
				loaded = true
				done();
			}
		}
	}
	
	document.getElementsByTagName("head")[0].appendChild(scr);
	
	return true; 	
}

/*
var SRC_VERSION = {
	//App version: this will change if a complete app update through the appstore is required
	v : 1.0,
	
	//Unique to this specific update (will keep incrementing regardless of the app version or the src versions
	id : 1,
	
	src : [
		//Format: ["Local code name/id", Code_version (relative to where you got the SRC_VERSION data), "path to download code (for updating)"]
		//Large files such as libraries should not be included here
		["script/native.js", 1, ""],
		["script/navigation.js", 1, ""],
		["script/ui.js", 1, ""],
		["script/home.page.js", 1, ""],
		["script/grades.page.js", 1, ""],
		["script/attendance.page.js", 1, ""],
		["script/settings.page.js", 1, ""],
		["script/login.page.js", 1, ""],
		["script/demo.js", 1, ""],
		["script/hac_connector.js", 1, ""],
		
		["css/reset.css", 1, ""],
		["css/stlye.css", 1, ""],
		["css/ui.css", 1, ""]
		
	]
};


*/


SRC_VERSION = _VERSION;
if(window.localStorage.getItem("src_version") !== null){
	var saved = json.parse(window.localStorage.getItem("src_version"));
	if(saved.v === SRC_VERSION.v){
		SRC_VERSION = saved;
	}
	else{
		//CLEAR ALL THE OLD UPDATES
		//BECAUSE THEY WILL NOT WORK WITH THIS VERSION OF THE APP
	
		for(var x = 0; x < saved.src.length; x++){
			localStorage.removeItem(getLocalStorageKey(saved.src[0][0], saved.src[0][1]));
		}
		
	}
}

var SERVER = "http://my-hac.appspot.com";
var VER_SERVER = "https://raw.github.com/dennisss/my-hac/master/version.js";


//This is the class for dealing with pending updates
function update(descriptor){
	return {
		version : descriptor,
		
		//What needs to be deleted/cleaned up
		deprecated : [],
		old_ver : SRC_VERSION,
		
		apply : function(){
			//Save as new localStorage SRC_VERSION and restart the app
			//OR go to app store if new???
			
			localStorage.setItem("src_version", JSON.stringify(this.version));
			
			//AND delete the deprecated files
			
			//delete the unneeded remaining ver_old from memory (if they are in memory)
			for(var x in this.old_ver){
				if(localStorage.getItem(getLocalStorageKey(this.old_ver[x][0], this.old_ver[x][1])) !== null){
					localStorage.removeItem(getLocalStorageKey(this.old_ver[x][0], this.old_ver[x][1]));
				}
			}
			
			localStorage.removeItem("pending_update");
			
		},
		
		pend: function(){
			localStorage.setItem("pending_update", JSON.stringify(this.version));
		},
		
		onready : function(){},
		
		/*ready : function(){
			
		},*/
		
		download : function(){
			
			if(this.version.v !== this.old_ver.v){
				/* A full update is required */
			}
			else{
				/* Make this check the filename or use an id system*/
				
				var self = this;
				
				//for(var x in this.version.src){
				var f = function(x){
				
					var old_x = -1;
					var nutd = false; //Not up to date
					
					for(var y in self.old_ver.src){
						if(self.version.src[x][0] === self.old_ver.src[y][0]){
							
							old_x = y;
							
							if(self.version.src[x][1] != self.old_ver.src[y][1]){
								nutd = true;
								//Update the source file	
								break;
							}
						
							self.old_ver.splice(y, 1);
							break;
						}
						
					}
					
					//If there is no old file, create a new one (or was deemed out of date)
					if(old_x === -1 || nutd){
						ajax.send(self.version[x][2], "GET", function(t){
							//THIS FUNCTION AJAX CANNOT FAIL!!!!!!
							localStorage.setItem(getLocalStorageKey(self.version[x][0], self.version[x][1]), t);
							
							if(x + 1 < self.version.src.length){ f(x+1); }
							else{ self.onready(); }
						});
					}
					else{
						if(x + 1 < self.version.src.length){ f(x+1); }
						else{ self.onready(); }	
					}
				}
				
				if(this.version.src.length > 0){
					f(0);
				}
				else{
					self.onready();	
				}
			}
			
		}
		
	};
	
}

function appReady() {
	document.addEventListener("deviceready", function(e){
		
		navigation.onDeviceReady();

		MyHacBackend.onDeviceReady();
	
		SETTINGS.onDeviceReady();

		navigator.splashscreen.hide();
		
	}, false);
	
	
	//Now include all the files
	/*for(x in SRC_VERSION.src){
		include(SRC_VERSION.src[x][0], SRC_VERSION.src[x][1]);
	}*/
	
	return
	
	ajax.send(SERVER + "/version", "GET", function(v){
		if(v != null){
			v = v.substring(v.indexOf("{"), v.length - 1);
			var ver = version(JSON.parse(v));
			ver.pend();
			ver.download();
			
		}
		
	});
}



if(isMobile.Android()){ include("cordova.android.2.7.0.js", 1, appReady); console.log("ANDROID"); }
if(isMobile.iOS()){ include("cordova.ios.2.6.0.js", 1, appReady); console.log("iOS"); }
