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

	Class Wrapper for Native Functions: Primarily being used for for polling for new notifications
	NOT EVEN CLOSE TO BEING COMPLETE
*/

/*
	Native Functions:
	
	org.dennis.myhac.MyHacBackend{
		- setup(baseUrl, run, intNotifInterval)
		
		- addSubject(sectionId, courseSession, name)
		//- gradeUpdater(checkInterval) //Set to 0 for never
		
		- startNotif()
		- stopNotif()
		
		- volumeControl(offTime, onTime) //For one day
		
		- clearCookies() //For annoying situations		
	}



*/

var MyHacBackend = {
	notifRunning : false,
	setup : function(baseUrl, run, notifInterval, onReady){
		cordova.exec(onReady,
		function(err){alert(err)},
		 "MyHacBackend", "setup", [baseUrl, "" +run, notifInterval]);
	},
	
	
	
	/*gradeUpdater : function(checkInterval){
		cordova.exec(function(){ },
		function(err){},
		 "MyHacBackend", "gradeUpdater", [checkInterval]);
	},*/
	addSubject : function(sectionId, courseSession, name){
		cordova.exec(function(){ },
		function(err){},
		 "MyHacBackend", "addSubject", [""+sectionId, ""+courseSession, name]);
	},
	
	startNotif : function(checkInterval){
		if(MyHacBackend.notifRunning){
			return;
		}
		
		navigator.geolocation.getCurrentPosition(function(position){
			cordova.exec(function(){ },
			function(err){},
			 "MyHacBackend", "startNotif", [checkInterval]);
			MyHacBackend.notifRunning = true;
		},
		function(error){
			alert('Could not get a GPS location for enabling notifications');
		}, { maximumAge: 3000, timeOut: 5000, enableHighAccuracy: true});
		
	},
	stopNotif : function(){
		if(!MyHacBackend.notifRunning){
			return;
		}
		
		cordova.exec(function(){ },
		function(err){},
		 "MyHacBackend", "stopNotif", []);
		 MyHacBackend.notifRunning = false;
	},

	clearCookies : function(){
		cordova.exec(function(){ },
		function(err){},
		 "MyHacBackend", "clearCookies", []);
	},

	onDeviceReady : function(){
		console.log("INITing");
		cordova.exec(function(){ },
		function(err){},
		 "MyHacBackend", "initial", []);
		
	}	
};


/* DEPRECATE THIS CLASS */
var HACNotifications = {
	startNotifications : function(whichNotifications, classIds, callback){
		
		var params = [];
		params.push(0);
		params.push(0);
		params.push(hac.baseUrl);
	
		for(i = 0; i < hac.data.classes.length; i++)
			params.push(hac.data.classes[i].sectionId + "," + hac.data.classes[i].name)
		
	},
	
	
	notificationTypes : {
		grades : 1,
		attendance : 2
		
	},
	

};

document.addEventListener("deviceready", MyHacBackend.onDeviceReady, false);