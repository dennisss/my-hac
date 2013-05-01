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
	Login Page class
*/

PAGESPACE["login"] = function(page){
	page.setup(this, "Login", false);
	this.container = page.makeScreenRegion(null);
	
	var username = window.localStorage.getItem("u");
	
	var password = window.localStorage.getItem("p");
	var addr = window.localStorage.getItem("a");
	
	var districts = null
	if(window.localStorage.getItem("d") !== null){
		districts = JSON.parse(window.localStorage.getItem("d"))
	}
	
	//index
	var selectedDist = window.localStorage.getItem("ds");
	
	//var dist = window.localStorage.getItem("d");
	//var distId = window.localStorage.getItem("dId");
	
	var stud = window.localStorage.getItem("s");
	//var studId = window.localStorage.getItem("sId");
	
	var students = JSON.parse(window.localStorage.getItem("studs"));
	
	
	
	this.container.innerHTML = '\
<table>\
    			<tr>\
    				<td>Username:</td>\
    				<td colspan="2"><input onchange="navigation.pages.login.onchangecredentials()" autocapitalize="off" autocorrect="off" type="text" '+ (username === null ? '':'value="'+username+'" ') +'id="user" /></td>\
    			</tr>\
    			<tr>\
    				<td>Password:</td>\
    				<td colspan="2"><input onchange="navigation.pages.login.onchangecredentials()" type="password" '+ (password === null ? '':'value="'+password+'" ') +'id="pass" /></td>\
    			</tr>\
    			<tr>\
    				<td>Address:</td>\
    				<td><input autocapitalize="off" autocorrect="off" onchange="navigation.pages.login.onchangeaddress()" type="url" id="addr" placeholder="https://hac.site.org/homeaccess/" '+(addr === null ? '':'value="'+addr+'" ')+' /></td>\
					<td style="vertical-align:middle;width:40px;"><button id="gpsBtn" onClick="navigation.pages.login.gpsClick();" style="padding:0;width:40px;height:40px"><img src="img/icons/location.png" style="width:inherit; height:inherit; float:right" /></button></td>\
    			</tr>\
				<tr>\
    				<td><div><!--<img src="img/icons/trash.png" style="position:relative; bottom:2px;float:left;height:20px;" onclick="this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);" /></div>&nbsp;-->District:</td>\
    				<td colspan="2"><select id="selDistrict"></select></td>\
    			</tr>' + '\
				<tr>\
    				<td><div><!--<img src="img/icons/trash.png" style="position:relative; bottom:2px;float:left;height:20px;" onclick="this.parentNode.parentNode.parentNode.style.display = \'none\';" />--></div>Student:</td>\
    				<td colspan="2"><select id="selStudent"></select></td>\
    			</tr>' + '\
    		</table>\
    		<table>\
    			<tr>\
    				<td style="vertical-align:middle;">Remember Information:</td>\
    				<td style="text-align:right; vertical-align:middle;"><div id="remember" '+(username === null ? '':'checked="checked" ')+' class="checkbox" onclick="checkbox(this)">&nbsp;</div></td>\
    				\
    			</tr>\
    			<tr>\
\
    				<td></td>\
    				<td style="text-align:right"><input type="submit" onClick="navigation.pages.login.loginClick();" value="Login" /></td>\
    			</tr>\
    		</table>';

	this._page.setFocus(this.container);
	//alert("test");


	//combine this with showStudents()
	if(stud !== null && students.length > 0){
		for(x in students){
			document.getElementById("selStudent").fill([
			"OPTION", {
				innerText: students[x].name,
				id : students[x].id,
					
			}
			
			]);
			if(stud == students[x].id)
				document.getElementById("selStudent").selectedIndex = x;
			
		}
	}
	else{
		document.getElementById("selStudent").parentNode.parentNode.style.display = "none";	
	}
	
	
	
	//Combine with showDistricts()
	if(selectedDist != null && districts.length > 0){
		for(x in districts){
			document.getElementById("selDistrict").fill([
			"OPTION", {
				innerText : districts[x].name,
				id: districts[x].id
				
			}
			
			]);	
			if(selectedDist == districts[x].id)
				document.getElementById("selDistrict").selectedIndex = x;
			
		}
		
	}
	else{
		document.getElementById("selDistrict").parentNode.parentNode.style.display = "none";
	}
	
	/*else{
		document.getElementById("selStudent").fill(["OPTION", {
			value: studId,
			innerText: stud
		}]);
	}*/
	
	this.showStudents = function(){
		var selStud = document.getElementById("selStudent");
		if(hac.data.students.length > 0){
							
			selStud.innerHTML = "";
			for(var x = 0; x < hac.data.students.length; x++){
				selStud.fill(["OPTION", {
					value: x,
					innerText: hac.data.students[x].name,
					id: hac.data.students[x].id,
				}]);
				
				if(hac.data.currentStudent == hac.data.students[x].id)
					selStud.selectedIndex = x;
			}
			selStud.parentNode.parentNode.style.display = "";
		}	
		
	}
	
	this.showDistricts = function(){
		var selDist = document.getElementById("selDistrict");
		if(hac.districts.length > 0){
							
			selDist.innerHTML = "";
			for(var x = 0; x < hac.districts.length; x++){
				selDist.fill(["OPTION", {
					value: x,
					innerText: hac.districts[x].name,
					id: hac.districts[x].id,
				}]);
				
				if(hac.data.currentDistrict == hac.districts[x].id)
					selDist.selectedIndex = x;
			}
			selDist.parentNode.parentNode.style.display = "";
		}	
		
	}

	
	this.onchangecredentials = function(){
		document.getElementById("selStudent").parentNode.parentNode.style.display = "none";
		document.getElementById("selStudent").innerHTML = "";
	}
	
	this.onchangeaddress = function(){
		document.getElementById("selDistrict").parentNode.parentNode.style.display = "none";
		document.getElementById("selDistrict").innerHTML = "";
	}
	
	/*if(dist == null){
		document.getElementById("selDistrict").parentNode.parentNode.style.display = "none";
	}*/

	checkInit("remember");
	
	this.loginClick = function(){
		
		//Important if there are multiple districts
		MyHacBackend.clearCookies();
		
		var username = document.getElementById("user").value;
		var password = document.getElementById("pass").value;
		var addr = document.getElementById("addr").value;
		
		if(username === ""){
			navigator.notification.alert("Please enter a username.");
			return;
		}
		
		if(password === ""){
			navigator.notification.alert("Please enter a password.");
			return;
		}
		
		if(addr === ""){
			navigator.notification.alert("Please enter a school HAC site address. This is usually provided by your school in the following form: https://hac.example.org/homeaccess/");
			return;
		}
		
		if(document.getElementById("remember").getAttribute("checked") == "checked")
		{
			//TODO: Encrypt this stuff.
			//Possibly with server-side encryption keys
			window.localStorage.setItem("u", username);
			window.localStorage.setItem("p", password);
			window.localStorage.setItem("a", addr);
		}
		else
		{
			/* TODO: Add multi-user support */
			window.localStorage.removeItem("u");
			window.localStorage.removeItem("p");
		}
	
		//To check at "hac.init" whether or not to go into demo mode
		hac.username = username;
		
		hac.init(document.getElementById("addr").value, function(msg1){
			
			if(msg1 == "")
			{
				var selStud = document.getElementById("selStudent");
				var studentId = null;

				if(selStud.children.length > 0){
					//studentId = hac.data.students[selStud.children[selStud.selectedIndex].value].id;
					studentId = selStud.children[selStud.selectedIndex].id;
				}
				
				var selDist = document.getElementById("selDistrict");
				var districtId = null;

				if(selDist.children.length > 0){
					//studentId = hac.data.students[selStud.children[selStud.selectedIndex].value].id;
					districtId = selDist.children[selDist.selectedIndex].id;
				}
				
				hac.login(username, password, function(msg2){
					if(msg2 != "")
					{
						navigator.notification.alert(msg2);
						console.log(msg2);
						navigation.pages.login.showStudents();						
						navigation.pages.login.showDistricts();
						
					}
					else {
						if(hac.data.students.length > 0){
							window.localStorage.setItem("s", hac.data.currentStudent);
							window.localStorage.setItem("studs", JSON.stringify(hac.data.students));
						}
						else{
							window.localStorage.removeItem("s");
							window.localStorage.removeItem("studs");
							
						}
						
						if(hac.districts.length > 0){
							window.localStorage.setItem("ds", hac.currentDistrict);
							window.localStorage.setItem("d", JSON.stringify(hac.districts));
						}
						else{
							window.localStorage.removeItem("ds");
							window.localStorage.removeItem("d");
						}
						
						navigation.navigate.call(navigation.pages.login,"grades", [])
					}
					
				}, studentId, districtId);
			
			}
			else
			{
				navigator.notification.alert(msg1, function(){
					if(hac.canGoOffline(username))
					{
						navigator.notification.confirm("Luckily you can still use a saved copy of your data.", function(index){
							if(index == 1)
							{
								hac.offlineMode = true;
								
								hac.login(username, password, function(msg3){
									if(msg3 == "")
										navigation.navigate.call(navigation.pages.login,"grades", [])
									else
										navigator.notification.alert(msg3);
								});
								
								
								return;
							}
						}, "Offline Mode", "View,Cancel");
						

					}
				});
				
				
			}
		});
	}
	
	this.gpsClick = function(check){
		document.getElementById("gpsBtn").setAttribute("disabled","disabled");
		document.getElementById("gpsBtn").firstChild.setAttribute("src", "img/icons/64_refresh.png");
		document.getElementById("gpsBtn").firstChild.className = "spinner"
		
		navigator.geolocation.getCurrentPosition(function(position){
			ajax.send(SERVER + "/geo_locate?x=find&la=" + position.coords.latitude + "&lo=" + position.coords.longitude, "GET", function(text){
				document.getElementById("gpsBtn").removeAttribute("disabled");
				document.getElementById("gpsBtn").firstChild.setAttribute("src", "img/icons/location.png");
				document.getElementById("gpsBtn").firstChild.className = "";
				
				if(text !== null){
					alert(text);
					var schools = JSON.parse(text).schools
					alert(schools.length)
					
					if(schools.length === 0){
						navigator.notification.alert('Sorry no schools are currently registered in your area. Please ask a school administrator to contact us. But, you can still enter your Home Access Center address from your computer\'s address bar by hand');	
					}
					else{
						
						var f = function(n){
							if(n === 1){
								navigator.notification.alert("Please ask a school administrator to contact us in order to get your school listed. Remember that you can still enter your Home Access Center address from your computer\'s address bar by hand.", null, "Sorry that your school was not found.");	
							}
							else{
								document.getElementById("addr").value = schools[n-2].addr
								if(schools[n-2].dist != -1){
									hac.districts = []
									hac.districts.push({id: schools[n-2].distId, name: schools[n-2].dist});
									navigation.pages.login.showDistricts();
								}
								else{
									navigation.pages.login.onchangeaddress();
								}
							}
							
						}
						
						if(schools.length === 1){
							navigator.notification.confirm(schools[0].name, f, "Is this your school?", "No,Yes");
						}
						else{
							var str = "None,";
							for(var x = 0; x < schools.length; x++){
								str = str.concat(schools[x].name);
								if(x != schools.length - 1){
									str = str.concat(",");	
								}
							}
							
							navigator.notification.confirm("", f, "Choose your school.", str);
						}
					}
				
				}
				else{
					navigator.notification.alert("Your school could not be found from your location because of a connection error. Please try again later.", null, "Network Error");	
				}
			})
		},
		function(error){
			navigator.notification.alert('Could not get your location.');
		}, { maximumAge: 3000, timeOut: 5000, enableHighAccuracy: true});
		
	}

	this.logout = function(){
		if(!hac.offlineMode)
			MyHacBackend.stopNotif();
		
		hac.logout(function(){
			/* Move this destruction function to navigation class */
			for(k in navigation.pages)
				navigation.delocatePage(k)
			navigation.pages = {}
			navigation.navigate("login");
		});
	}

	this.update = function(){
		
		
	};
	this.navigate = function(params){
		//if(hac.loggedIn)
		//	this.logout();
	}
	
	
};