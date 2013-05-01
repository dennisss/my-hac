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
	Settings Page class
*/

var SETTINGS = {
	DATA : {
		boolNotifications : false,
		intNotifInterval : 10, //NO SMALLER THAN 10 MINUTES
		run : -1,
		boolCache : true,
		
		//color at 50%, interpolate 0 and 100
		color : [136,191,232]
	},
	cacheData : function(){
		localStorage.setItem("SETTINGS", JSON.stringify(RJSON.pack(SETTINGS.DATA)));
	},
	
	_t : null,
	//Calls to this will ensure that it caches data before writing it into longterm storage
	queueCache : function(){
		if(SETTINGS._t == null){
			SETTINGS._t = setTimeout(function(){
				SETTINGS.cacheData();
				SETTINGS._t=null;
			}, 5000);
		}
	},
	
	onDeviceReady : function(){
		if(localStorage.getItem("SETTINGS") !== null){
			SETTINGS.DATA = RJSON.unpack(JSON.parse(localStorage.getItem("SETTINGS")))
			console.log("SETTINGS LOADED")
		}
		
		colorize()
	},
	IDS : {
		BOOLNOTIF : 0,
		INTNOTIF : 1,
		RUN : 2,
		BOOLCACHE : 3,
		STUDENT : 4,
		COLOR : 5
	}
	
};

//document.addEventListener("load", SETTINGS.onDeviceReady, false);
//SETTINGS.onDeviceReady()

function dotheCache(){
	var fail = function(evt){
		alert(evt.target.error.code);
	}
	
	var onFileSystemSuccess = function(fileSystem){
		var gotFileEntry = function(fileEntry) {
			var gotFileWriter = function(writer){
				writer.write(JSON.stringify(RJSON.pack(hac.data)))
				alert("good")
			}			
			fileEntry.createWriter(gotFileWriter, fail);
		}
		fileSystem.root.getFile("/sdcard/Download/cache3.txt", {create: true, exclusive: false}, gotFileEntry, fail);
	}
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);	
	
}

PAGESPACE.settings = function(page){
	page.setup(this, "Settings", true);
	
	this.cont = page.makeScreenRegion(null);
	
	
	this.cont.innerHTML = "<table>\
		<tr><td colspan='2' style='vertical-align:middle;'>Grade Notifications:<div style='vertical-align:middle' id='notifCheck'"+ (SETTINGS.DATA.boolNotifications?"checked='checked'":"") +" class='checkbox' onclick='checkbox(this)'>&nbsp;</div></td><tr>\
		<tr><td colspan='2' style='vertical-align:middle;text-align:right'>Check interval: <input type='number' min='10' max='30' disabled='disabled' id='intNotif' onchange='navigation.pages.settings.valueChange(1)' size='3' style='width:50px' value='"+SETTINGS.DATA.intNotifInterval+"' /> minutes</td></tr>\
		<tr><td colspan='2'><!--<hr />--></td></tr></table>\
		\
		<table><tr><td style='vertical-align:middle;'>Student:</td><td style='vertical-align:middle;text-align:right;width:200px'><select id='selectStudent' onchange='navigation.pages.settings.valueChange(4)'></select></td></tr>\
		<tr><td style='vertical-align:middle;'>Marking Period:</td><td style='vertical-align:middle;text-align:right;width:200px'><select id='selectRun' onchange='navigation.pages.settings.valueChange(2)'></select></td></tr>\
		<hr />\
		<tr><td style='vertical-align:middle;'>Theme Color</td><td id='td_cp' style='vertical-align:middle;text-align:right'></td></tr>\
		<tr><td colspan='2'><br /><center><input style='padding:14px; font-size:14px;' type='submit' onclick='navigation.pages.settings.clear()' value='Delete App Data and Passwords' /><!--<button onclick='dotheCache()'>Cache Stuff in Flash</button>--></center></td></tr>\
	\
	\
	\
	</table>\
	";
	
	
	var color = colorpicker("cp",SETTINGS.DATA.color);
	color.onchange = function(newc){
		navigation.pages.settings.valueChange(5)
		
		
		
	};
	
	
	
	document.getElementById("td_cp").appendChild(color)
	
	
	
	if(hac.data.students.length > 0){
		var selectStudent = document.getElementById("selectStudent");
		
		for(var x = 0; x < hac.data.students.length; x++){
			selectStudent.fill(["OPTION",{
				innerText : hac.data.students[x].name,
				value : x	
			}
			
			])
			
			if(hac.data.students[x].id == hac.data.currentStudent){
				selectStudent.selectedIndex = x;	
			}
		}
		
	}
	
	//this.intNotif = document.getElementById("intNotif");
	var selectRun = document.getElementById("selectRun");
	
	
	var def = make(["OPTION", {innerText : "Default", value : -1} ])[0];
	if(-1 == SETTINGS.DATA.run)
		def.setAttribute("selected", "selected");
	selectRun.appendChild(def);
	
	for(var x = 0; x < hac.data.reportCardRun.available.length; x++)
	{
		var option = make(["OPTION", {innerText : hac.data.reportCardRun.available[x], value : hac.data.reportCardRun.available[x]} ])[0];
		if(hac.data.reportCardRun.available[x] == SETTINGS.DATA.run)
			option.setAttribute("selected", "selected");
		selectRun.appendChild(option);
	}
	
	this._page.setFocus(this.cont);

	document.getElementById("notifCheck").onchange = function(){
		navigation.pages.settings.valueChange(0)
	};

	checkInit("notifCheck");
	
	if(SETTINGS.DATA.boolNotifications){
		document.getElementById("intNotif").removeAttribute("disabled");	
	}
	
	this.valueChange = function(id){
		switch(id){
			case SETTINGS.IDS.BOOLNOTIF:
				var that = document.getElementById("notifCheck")
				if(that.getAttribute("checked") == "checked"){
					SETTINGS.DATA.boolNotifications = true;
					document.getElementById("intNotif").removeAttribute("disabled");
					navigator.notification.alert("Notifications will be effected when the grades page is refreshed.");
				}
				else{
					SETTINGS.DATA.boolNotifications = false;
					MyHacBackend.stopNotif();
					document.getElementById("intNotif").setAttribute("disabled","disabled");
					navigator.notification.alert("Notifications have been disabled.");
				}
				
				break;
			case SETTINGS.IDS.INTNOTIF:
				var that = document.getElementById("intNotif");
				var value = parseInt(that.value,10);
				if(isNaN(value)){
					navigator.notification.alert("Please enter a valid number between 5 and 30 minutes");
					return;	
				}
				else{
					if(value < 5 || value > 30){
						navigator.notification.alert("Please enter a valid number between 5 and 30 minutes")
						return;
					}
				}
				
				SETTINGS.DATA.intNotifInterval = value;
				break;
			case SETTINGS.IDS.RUN:
				var that = document.getElementById("selectRun");
				var selIndex = that.selectedIndex;
				var value = parseInt(that.options[selIndex].value,10);
				SETTINGS.DATA.run = value;
				if(value == -1){
					navigator.notification.alert("Grades will return to the latest marking period after the next login.");	
				}
				break;
			case SETTINGS.IDS.STUDENT:
			
				var that = document.getElementById("selectStudent")
				var selIndex = that.selectedIndex;
				var value = parseInt(that.options[selIndex].value,10);
				
				console.log(hac.data.students[value].id)
				hac.setStudent(hac.data.students[value].id, function(){
					
				});
				
				MyHacBackend.stopNotif()
				break;		
		}
		
		SETTINGS.cacheData();
	};
	
	this.clear = function(){
		navigator.notification.confirm("Are you sure you want to delete all HAC data? This includes saved passwords and offline viewing data. You will be logged off if yes.", function(index){
			if(index == 1)
			{
				window.localStorage.clear();
				navigator.notification.alert("All saved app data has been cleared.")
				navigation.pages.login.logout()
			}
		}, "Clear all data", "Yes,No");
	}

	this.update = function(){
		
		
	};
	this.navigate = function(params){
		
	}
	
	
};