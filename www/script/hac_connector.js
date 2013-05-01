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
	All methods needed to do raw requests and parsing to the hac server
	Easily the  
*/

/*
	'done' in many of the method calls refers to a provided function
		of form function(errorMsg)
			where errorMsg is blank if no error

*/

function trim(str){
	return str.replace(/^\s+|\s+$/g,"");
	//return str.replace(new RegExp(/^\s\s*/), "").replace(new RegExp(/\s\s*$/), "");
}


function hash(str){
	return (new jsSHA(str,  "TEXT")).getHash("SHA-1", "HEX");	
	
}

/* Makes all lower values null */
function normlower(obj){
	return (obj == null)? null : ((isNaN(obj)? null : ((obj == undefined)? null : obj))); 
}

var MONTHS = {"January": 0, "February":1, "March":2, "April":3, "May":4, "June":5, "July":6, "August":7, "September":8, "October":9, "November":10, "December":11};

var HAC_DATA_REVISION = 7
var hac = {
	data : {},
	TEMPLATE : {
		revision: HAC_DATA_REVISION,
		
		/* Used for offline (Don't worry it is hashed with SHA1) */
		password: "",
		reportCardRun: {
			available : [],
			latest : []	
		},
		
		currentStudent : -1,
		students : [
			/*
			{
				id:
				name:
				building:
				grade:	
			}
			*/
		
		],
		
		classes : [
		/*
			{
				name: name,
				sectionId : sectionID,
				courseSession : session (usually 1),
				
				
				runs : [
					1 : {
						grades: []
						categories: {}
					}
					.
					.
					.
				
				],
				new: newChange,
				categories : cats,
			
			},
			.
			.
			.
		*/
		],
		
		daily : {
			name: "",
			building : "",
			district: "",
			date: null,
			
			schedule: [
				/*
				{
					period: 1,
					tStart : 0, //Time
					tStop : 0,
					course : "1234-1"
					description : "",
					teacher : "",
					room : ""	
					
				}
				
				
				
				*/
			
			
			],
			
		},
		
		attendance : {
			month: "",
			cmd : "",
			legend : {},
			months : {
				/*
				yearNumber : {
					monthNumber : {
						cmd: null or "",
						days: "",
						backCmd : "",
						forwardCmd : ""
					},
					.
					.
				},
				
				*/
			},
			days : []	
		}
		
	},
	stateVariables : {
		"__EVENTTARGET" : "",
		"__EVENTARGUMENT" : "",
		"__VIEWSTATE": "",
		"__EVENTVALIDATION" : ""
	},
	baseUrl : "",
	doc : null,
	elem : null,
	title : "",
	parser : new DOMParser(),
	loggedIn : false,
	offlineMode: false,
	
	currentDistrict: -1,
	districts: [
	/*
	{
		name: "",
		id: "100"	
	}
	
	*/
	
	],
	
	init : function(url, done){
		
		url = url.replace("/(#|?).*/","");
		url += "/"
		
		hac.baseUrl = url;
		hac.elem = document.getElementById("parserPlace");
		
		if(hac.username == demo.username){
			done("Demo account: Press 'Ok' and then 'View'");
			return;
		}		

		hac.request(url, "GET", function(sucess) {
			if(!sucess)
				done("Could not connect to HAC.");
			else if(hac.title != "HomeAccess")
				done("Invalid or Unsupported HAC Server.");
			else
			{
				/* Need to add support for weird stuff like multiple/test school districts */
				for(i in hac.elem.getElementsByTagName("input"))
				{
					
				}
				
				hac.districts = [];
				
				var sel = document.getElementsByTagName("select")
				for(i in sel)
				{
					if(sel[i].id == "ctl00_plnMain_ddlDistrict"){

						for(var o in sel[i].children){
							if(sel[i].children[o].value != undefined){
								hac.districts.push({
									id: sel[i].children[o].value,
									name: sel[i].children[o].innerText
								});
							}
						}
					}
				}
				
				done("");
			}
		});
	},
	
	
	canGoOffline: function(username){
		return hac.caching.cacheAvailable(username);
	},
	
	/* Username used as key in local storage */
	caching : {
		cacheData : function(){
			if(hac.username == demo.username){
				return;	
			}
			
			window.localStorage.setItem(hac.username, JSON.stringify(RJSON.pack(hac.data))); //RJSON.pack(hac.data));

		},
		getCache : function(){
			if(hac.username == demo.username){
				return RJSON.unpack(demo.data);	
			}
			
			try{
				return RJSON.unpack(JSON.parse(window.localStorage.getItem(hac.username)))
			}
			catch(e){
				return {};
			}
		},
		loadFromCache : function(){
			hac.data = hac.caching.getCache();
		},
		cacheAvailable : function(username){
			
			if(username === undefined)
				username = hac.username
			else
				hac.username = username
			
			if(hac.username == demo.username){
				return true;
			}
			
			if(window.localStorage.getItem(username) !== undefined)
			{
				try{
					if(hac.caching.getCache().revision == HAC_DATA_REVISION)
						return true;
				}
				catch(e){
					
				}
			}
			
			return false
			//return (localStorage.getItem(username) !== undefined && )
		},
		
		
	},
	
	
	request : function(url, method, callback, data) {
		ui.loadingBegin();
	
		if(method == "POST" && data != null)
		{
			for (var key in hac.stateVariables)
				data[key] = hac.stateVariables[key];
		}
		
		var timeout = setTimeout(function(){
			ajax.xmlhttp.abort();
			
			//Alerts done by calling function
			//alert("Network Unavailable: Could not connect to HAC")
			
			ui.loadingEnd();
			
			callback(false);
		
		}, 10000)
		
		var f = function(text) {
			/*Eventually Remove This for better speed and performance*/
			//hac.doc = hac.parser.parseFromString(ajax.xmlhttp.responseText, "text/xml");
			
			//alert(hac.doc.title)
			
			try{
				hac.elem.innerHTML = ajax.xmlhttp.responseText;
				hac.title =  trim(ajax.xmlhttp.responseText.match(/<title>((.|\n|\r)*)<\/title>/)[1]);
				clearTimeout(timeout);
			
			}
			catch(e){
				/* Retry to send */
				ajax.xmlhttp.abort()
				ajax.send(url, method, f, data);
			}
			
			if(document.getElementById("ctl00_plnMain_trReferenceNumber") != null){
				ui.loadingEnd();
				console.log("OHHH NOOO!!!");
				callback(false);
				return;	
			}
			
			for (var key in hac.stateVariables)
			{
				try{
											/* Can be used because hac.elem is on the page */
					hac.stateVariables[key] = document.getElementById(key).value;
				}
				catch(e){}
			}
			
			ui.loadingEnd();
			
			callback(true);
		};
		
		ajax.send(url, method, f, data);
		
	},
	
	/* Active user variable */
	username: null,
	
	
	login : function(username, password, done, studentId, district) {
		if(hac.data.revision != hac.TEMPLATE.revision)
			hac.data = hac.TEMPLATE;
		
		hac.username = username
		
		if(district != undefined){
			hac.currentDistrict = district
		}
		else{
			hac.currentDistrict = -1;	
		}
		
		if(hac.offlineMode)
		{
			if(hac.caching.cacheAvailable(username))
			{
				hac.caching.loadFromCache();
				if(hac.data.password == hash(password))
				{
					hac.loggedIn = true;
					done("");
				}
				else
					done("Invalid password");
				
			}
			else
				done("No offline data for the provided username");
				
			return;
		}
		
		var postData = {
			"ctl00$plnMain$txtLogin" : username,
			"ctl00$plnMain$txtPassword" : password,
			"ctl00$plnMain$Submit1" : "Log In"
		}
		
		//There has to be at least one so we only count up to one instead of getting the exact length
		if(hac.districts.length > 0){
			var goodId = false;
			for(var key in hac.districts){
				if(hac.districts[key].id === district){
					goodId = true
					break;
				}
			}
			
			if(!goodId){
				done("Please select a district");
				return
			}
			else
				postData['ctl00$plnMain$ddlDistrict'] = district
		}
		
		
		var func = function() {
			if(hac.title == "My Students"){
				var list = document.getElementById("ctl00_plnMain_dgStudents");
				
				var sNum = -1
				
				hac.data.students = [];
				var trs = list.getElementsByTagName("tr")
				console.log(trs.length);
				for(var x = 1; x < trs.length; x++)
				{
					
					var Cmd = trs[x].children[0].children[0].getAttribute("href");
					var regex = new RegExp(/([0-9]+)/);
					
					var matches = Cmd.match(regex);
					
					var sid = parseInt(matches[1], 10);
					
					console.log(matches[1]);
					var s = {
						id : sid,
						name : trim(trs[x].children[0].innerText),
						building : trim(trs[x].children[1].innerText),
						grade : trim(trs[x].children[2].innerText)
					}
					
					if(sid == studentId)
						sNum = hac.data.students.length;
					
					hac.data.students.push(s);
				}
				
				if(sNum == -1){
					done("Please select a student");
				}
				else{
					hac.setStudent(hac.data.students[sNum].id, func);	
				}
				
				
			}
			else if(hac.title != "HomeAccess"){
				hac.loggedIn = true;
						
				//if(hac.caching.cacheAvailable())
				//	hac.caching.loadFromCache();
				
				hac.data.password = hash(password);
				
				done("");
			}
			else
				done("Invalid Username or Password.");
		}
		
		hac.request(hac.baseUrl + "Default.aspx", "POST",func, postData);
	},
	
	logout : function(done){
		hac.data = {};
		
		if(!hac.loggedIn)
		{
			done();
			return;	
		}
		
		if(hac.offlineMode)
		{
			hac.loggedIn = false
			hac.offlineMode = false;
			done();
			return;
		}
		
		hac.request(hac.baseUrl + "Logout.aspx", "GET", function(sucess) {
			hac.loggedIn = false
			done();
		});
		
	},
	
	setStudent : function(sid, done){
		hac.data.currentStudent = sid;
		hac.request(hac.baseUrl + "Student/DailySummary.aspx?student_id=" + sid, "GET",done);	
	},
	
	getAssignments : function(done, run){
		
		if(hac.offlineMode)
		{
			if(hac.data.classes.length > 0)
				done(true);
			else
				done(false);
			return;	
		}
		
		var success = function(sucess){
				if(!sucess)
				{
					alert("Error retrieving data over network.");
					done(false);
					return;	
				}
				
				var selects = hac.elem.getElementsByTagName("select");
				hac.data.reportCardRun.available = [];
				for(i=0; i < selects.length; i++)
				{
					if(selects[i].getAttribute("name") == "ctl00$plnMain$ddlReportCardRuns")
					{
						for(x = 0; x < selects[i].children.length; x++)
						{
							if(selects[i].children[x].getAttribute("value") == "ALL")
								continue
							
							var value = parseInt(selects[i].children[x].getAttribute("value"),10)
							
							hac.data.reportCardRun.available.push(value);
							if(selects[i].children[x].getAttribute("selected") == "selected")
								hac.data.reportCardRun.latest = value;
						}
						
						break;	
					}
					
				}
				
				if(run == null)
					run = hac.data.reportCardRun.latest;

				
				
				var old = null
				
				if(hac.caching.cacheAvailable())
					old = hac.caching.getCache();
				
				var classes = [];
				var divs = hac.elem.getElementsByClassName('AssignmentClass');
				for(i=0; i < divs.length; i++)
				{
					try{
						var name = divs[i].getElementsByTagName("h4")[0].children[0].innerHTML;
						name = trim(name.replace(new RegExp(/[0-9]{4}\s-\s[0-9]+\s/), ""));
								
						var btnCmd = divs[i].getElementsByTagName("button")[0].getAttribute("onclick");
						var regex = new RegExp(/['"]([0-9]+)['"]/);
						
						var matches = btnCmd.match(regex);
						var sectionID = parseInt(matches[1], 10);
						
						var btnCmd2 = btnCmd.substring(matches.index + matches[1].length + 2, btnCmd.length - 1);
						matches = btnCmd2.match(regex);
						var course_session = parseInt(matches[1]);
						
						/*  ---------------------------------------------------------- */
						var cats = [];
						var categories = divs[i].getElementsByClassName("DetailList")[1];
						
						var weighted = categories.getElementsByClassName("TableHeader")[0].children.length > 4
						var rows = categories.getElementsByTagName("TR")
						for(a = 1; a < rows.length; a++)
						{
							var name2 = rows[a].children[0].innerText;
							var obj = {
								"name" : name2,
								"points" : parseFloat(rows[a].children[1].innerText),
								"maxPoints" : parseFloat(rows[a].children[2].innerText),
								"percent" :  parseFloat(rows[a].children[3].innerText)
							};
							
							//Check for category weights
							if(weighted)
							{
								obj.catWeight = parseFloat(rows[a].children[4].innerText)
								obj.catPoints = parseFloat(rows[a].children[5].innerText)
							}	
							cats.push(obj);
							
						}
						
						/*------------------------------------------------------------*/
						
						
						var runs = {};

						var newChange = false

						/*Tests for old data*/
						var oldClass = null
						var oldRun = null
						if(old != null)
						{
							for(x = 0; x < old.classes.length; x++)
							{
								if(old.classes[x].sectionId == sectionID && old.classes[x].courseSession == course_session)
								{
									oldClass = old.classes[x]
									for(r in oldClass.runs)
									{
										if(r == run)
										{
											oldRun = oldClass.runs[r]
										}
										else
										{
											/* Make sure old data that is not in current run is copied over to new data */
											runs[r] = oldClass.runs[r]
										}
									}
									
									break;
								}
							}
							if(oldClass == null)
								newChange = true;
						}
						
						/*End Caching*/
						
						
						var assignments = [];
						
						
						var assigTable = divs[i].getElementsByClassName("DetailList")[0];
						var trs = assigTable.getElementsByTagName("TR");
						for(a = 1; a < trs.length; a++)
						{
							var jcat = trs[a].children[3].innerText
							for(c=0;c<cats.length;c++)
							{
								if(jcat == cats[c].name)
								{
									jcat = c;
									break;	
								}
							}
							
							var j = {
								"dateDue" : trs[a].children[0].innerText,
								"dateAssigned" : trs[a].children[1].innerText,		
								"name" : trim(trs[a].children[2].children[0].innerText),
								"category" : jcat,
								"score" : parseFloat(trs[a].children[4].innerText),
								"weight" : parseFloat(trs[a].children[5].innerText),
								"totalPoints" : parseFloat(trs[a].children[7].innerText),
								"changed" : false
							};
							if(oldRun != null)
							{
								var oldL = oldRun.assignments.length;
								for(x = 0; x < oldRun.assignments.length; x++)
								{
									if(oldRun.assignments[x].name == j.name)
									{
										if(normlower(oldRun.assignments[x].score) != normlower(j.score) || normlower(oldRun.assignments[x].totalPoints) != normlower(j.totalPoints)){
											j.changed = true
											newChange = true
										}
										oldRun.assignments.splice(x, 1)
										break	
									}
								}
								
								/* Means that this assignment didn't show up before */
								if(oldRun.assignments.length == oldL){
									j.changed = true;
									newChange = true;
								}
								
								/* Check for new grades*/
							}
							assignments.push(j);
						}
						
						if(oldRun != null){
						if(oldRun.length > 0)
							newChange = true;
						}
	
	

						
						runs[run] = {"assignments" : assignments, "categories" : cats}
						
						classes.push({
							"name": name,
							"sectionId" : sectionID,
							"courseSession" : course_session,
							
							/* Depreciate this */
							//"assignments" : assignments,
							//"categories" : cats,
							/* End Depreciation */
							
							
							"runs" : runs,
							"new": newChange,
							
						});
						
					}catch(e){}
					
				}

				hac.data.classes = classes;
				hac.caching.cacheData();

				done(true);
		};


												/* Check this */
		if(run === null || run === undefined || run == -1)
			hac.request(hac.baseUrl + "Student/Assignments.aspx", "GET", success);
		else {
			hac.request(hac.baseUrl + "Student/Assignments.aspx", "GET", function(s){
				if(!s){
					alert("Error retrieving data over network.");
					done(false)
					return;	
				}
				hac.request(hac.baseUrl + "Student/Assignments.aspx", "POST", success, {
						"ctl00$plnMain$ddlReportCardRuns" : run,
						"ctl00$plnMain$hdnddlClasses" : "(All Classes)",
						"ctl00$plnMain$hdnddlReportCardRuns1" : "(All Runs)",
						"ctl00$plnMain$hdnddlReportCardRuns2" : "(All Terms)",
						"ctl00$plnMain$ddlOrderBy" : "Class",
						"ctl00$plnMain$btnRefreshView" : "Refresh View",
						"ctl00$plnMain$ddlClasses" : "ALL",
						"ctl00$plnMain$ddlCompetencies" : "ALL",
						"ctl00$plnMain$hdnTitle": "Classwork",
						"ctl00$plnMain$hdnbtnShowAverage" : "Show All Averages",
					
					});
			});
		}
	},
	
	//returns the [year, month] access identifier for the located month or else null on failure
	getAttendance: function(done, cmd){
		if(hac.offlineMode)
		{
			lastYear = -1
			for(year in hac.data.attendance.months)
				lastYear = parseInt(year,10)>lastYear?parseInt(year,10):lastYear;
			lastMonth = -1
			for(month in hac.data.attendance.months[lastYear])
				lastMonth = parseInt(month,10)>lastMonth?parseInt(month,10):lastMonth;
			
			if(lastYear == -1 || lastMonth == -1){
				done(null);
			}
			else{
				done([lastYear, lastMonth]);
			}
			
			return;	
		}
		
		var func = function(sucess){
			if(!sucess)
			{
				done(null);
				return;	
			}
				
			
			var legend = hac.elem.getElementsByClassName("AbsColorLegend")[0];
			var rows = legend.getElementsByTagName("tr");
			for(i = 1; i < rows.length; i++)
			{
				var keys = rows[i].getElementsByTagName("td");
				for(k = 0; k < keys.length; k++)
				{
					hac.data.attendance.legend[keys[k].style.backgroundColor] = keys[k+1].innerText; 
					k +=1;
				}
				
			}
			
			
			
			var calendar = hac.elem.getElementsByClassName("Calendar")[0];
			
			
			/* Header stuff like Title Month and Forward/Back Month Commands */
			var header = calendar.getElementsByClassName("CalendarHeader")[0];
			var hData = header.getElementsByTagName("td");
			
			
			var monthName = hData[1].innerText.split(" ");
			var numM = MONTHS[monthName[0]];
			var year = parseInt(monthName[1], 10);
			
			
			
			var backL = hData[0].firstChild.getAttribute("href");
			var forwardL = hData[2].firstChild.getAttribute("href");
			
			var reg = new RegExp(/'([A-Z][0-9]*)'/);
			
			
			
			var data = {
				"cmd" : cmd,
				"days" : [],
				"backCmd" : reg.exec(backL)[1],
				"forwardCmd" : reg.exec(forwardL)[1]
			};
			
			
			
			
			/* End Header Stuff */
			
			
			
			
			var weeks = calendar.getElementsByTagName("tr");
			
			/* First few rows are just headers */
			for(i = 2; i < weeks.length; i++)
			{
				var days = weeks[i].getElementsByTagName("td");
				var w = [];
				var valid = false;
				
				for(d = 0; d < days.length; d++)
				{
					if(days[d].innerText == "")
						w.push("?")
					else
					{
						valid = true
						w.push([days[d].style.backgroundColor, days[d].getAttribute("title")]);
					}
				}
				
				if(valid)
					data.days = data.days.concat(w);
				else
					continue
				
			}
			
			
			if(hac.data.attendance.months[year] == null)
				hac.data.attendance.months[year] = {}
			hac.data.attendance.months[year][numM] = data; 
			
			hac.caching.cacheData();
			done([year, numM])
			
		};
		
		
		if(cmd == null)
			hac.request(hac.baseUrl + "Student/Attendance.aspx", "GET", func);
		else
			hac.request(hac.baseUrl + "Student/Attendance.aspx", "POST", func, { "ctl00$plnMain$cldAttendance" : cmd });
		
	},
	
	parseDailySummary : function(done, parseNow){
		
		parseNow = false
		if(hac.offlineMode)
		{
			done(hac.data.daily.name !== "")
			return
		}
		
		var f = function(success){
			
			var info = document.getElementById("ctl00_BannerTitle").getAttribute("title").split("\n");
			var kv = {}
			for(x in info){
				var a = info[x].split(":")
				kv[trim(a[0])] = trim(a[1])
			}
			
			if(kv["Student Name"] != undefined){
				hac.data.daily.name = kv["Student Name"];	
			}
			if(kv["Building"] != undefined){
				hac.data.daily.building = kv["Building"];	
			}
			if(kv["District"] != undefined){
				hac.data.daily.district = kv["District"];
			}
			
			
			var dateString = document.getElementById("ctl00_strPageTitle").innerText;
			//Daily Summary for Friday, April 19, 2013
			hac.data.daily.date = dateString.substring(18)
			
			hac.data.daily.schedule = [];
			
			var schedule = document.getElementById("ctl00_plnMain_dgSchedule");
			var rows = schedule.getElementsByTagName("TR");
			
			var reg = new RegExp(/'(([0-1][0-9]):([0-5][0-9]) (AM|PM))'/);
			
			for(x = 1; x < rows.length; x++){
				var c = {
					period: rows[x].children[0].innerText.split(" ")[0],
					tStart : 0, //Time
					tStop : 0,
					course : trim(rows[x].children[1].innerText),
					description : rows[x].children[2].innerText,
					teacher : rows[x].children[3].innerText,
					room : rows[x].children[4].innerText
				}
				
				hac.data.daily.schedule.push(c);
			}
			
			done(true)
		};
		
		if(parseNow){
			f(true);
		}
		else{
			hac.request(hac.baseUrl + "Student/DailySummary.aspx", "GET", f);	
		}
		
		
	}
	
	
	
	
}