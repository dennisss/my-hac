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
	Grades Page class
*/

PAGESPACE.grades = function(page){
	page.setup(this, "Grades", true);
	
	this.list = this._page.makeScreenRegion(null);
	this.details = this._page.makeScreenRegion(this.list)
	
	this.refresh = function(){
		this._page.setFocus(this.list);
		hac.getAssignments(function(sucess){
			if(sucess)
			{	
				if(!hac.offlineMode && SETTINGS.DATA.boolNotifications){
					MyHacBackend.setup(hac.baseUrl, hac.data.reportCardRun.latest, SETTINGS.DATA.intNotifInterval);
				}
				
				var items = [];
				for(i = 0; i < hac.data.classes.length; i++)
				{	
					var run = hac.data.classes[i].runs[hac.data.reportCardRun.latest]
					var percent = 0;
					
					var total = {};
					for(c = 0; c < run.categories.length; c++)
					{
						if(run.categories[c].name == "Totals:"){
							total = run.categories[c];
							break;
						}
					}
					if(normlower(total.percent) != null){
						percent = total.percent
					}
					else{
						percent = ((total.catPoints / total.catWeight)*100).toFixed(2);
					}
					
					
					items.push(["LI", {
						innerText: hac.data.classes[i].name,
						name: i,
						onclick : function() {
							if(this.down)
								navigation.pages.grades.viewClass(this.name);
							},
						ontouchstart : li.ontouchstart,
						ontouchmove : li.ontouchmove
		
					},
					[
						["DIV", {
							style : {
								//display: (hac.data.classes[i].newInfo ? "" : "none"),
							},
							className: hac.data.classes[i]['new'] ? "grades_newNotifier" : "grades_assignment",
							innerText: percent + "%",
							//name: "newNotif"
						}]
					]
					]);
					
					if(!hac.offlineMode && SETTINGS.DATA.boolNotifications){
						MyHacBackend.addSubject(hac.data.classes[i].sectionId, hac.data.classes[i].courseSession, hac.data.classes[i].name);
					}
				}

				if(!hac.offlineMode && SETTINGS.DATA.boolNotifications)
					MyHacBackend.startNotif();
				
				window.requestAnimFrame(function(){
					navigation.pages.grades._page.clearRegion(navigation.pages.grades.list)
					navigation.pages.grades._page.clearRegion(navigation.pages.grades.details)
					if(items.length > 0)
						navigation.pages.grades.list.fill(["UL", {}, items]);
					else
						navigation.pages.grades.list.fill(["DIV", {
							style: { textAlign : "center", color: "#aaa", margin: "10px" },
							innerText : "No complete grades entered for this student."
							
						}])
				});
				
			}
						
					
		}, (SETTINGS.DATA.run == -1? undefined : SETTINGS.DATA.run));
	};
	
	this.refresh();
	

	this.activeClass = 0;
	this.viewClass = function(num){
		this.activeClass = num
		this._page.clearRegion(this.details)

		var categories = {};
		var run = hac.data.classes[num].runs[hac.data.reportCardRun.latest];
		for(i = 0; i < run.assignments.length; i++)
		{
			var assignment = run.assignments[i];
			
			if(categories[assignment.category] == null)
				categories[assignment.category] = [];
			
			var percent = ((assignment.score / assignment.totalPoints)*100).toFixed(2)
			
			
			categories[assignment.category].push(["LI", {
				innerText: assignment.name,
				name: i,

				onclick : function() {
					if(this.down)
						navigation.pages.grades.showAssignment(this.name);
				},
				
				ontouchstart : li.ontouchstart,
				ontouchmove : li.ontouchmove

			},
			[
				/*["DIV", {
					innerText : assignment.name,
					
					
				}],*/
				["DIV", {
					className: (assignment['changed'] === true? "grades_newNotifier" : "grades_assignment"),
					innerText: isNaN(percent) ? "None" : percent + "%",
					
				}]
			
			
			]
			]);
		}
		
		var items = [];
		for(key in categories)
		{
			var invalidC = isNaN(parseInt(key,10))
			items.push(["LI", {
				innerText: invalidC? key : run.categories[key].name,
				style: {
					paddingBottom: 0,
					paddingTop : 0,
					paddingLeft: "10px",
					fontWeight: "bold",
					borderColor: "black"
				},
				className : "catHead"
				
			},
			[
				["DIV",{
					innerText: (invalidC? "" : (run.categories[key].percent.toFixed(2) + "%" + ((run.categories[key].catWeight == undefined)? "" : (" (" + run.categories[key].catPoints.toFixed(2) + "/" + run.categories[key].catWeight.toFixed(2) + ")" ) ))),
					style : { float: "right", color: "#CCC", fontSize : "11px", paddingTop : "2px", marginRight : "-14px" }
				
				}
				]
			
			
			]
			
			]);
			items = items.concat(categories[key])
		}

		
		var self = this;
		
		window.requestAnimFrame(function(){
			self.details.fill(["UL", {}, items]);
			self._page.setFocus(self.details);
		});
	}
	
	this.showAssignment = function(num) {
		var assignment = hac.data.classes[this.activeClass].runs[hac.data.reportCardRun.latest].assignments[num]
		
		navigator.notification.alert("Assigned: " + assignment.dateAssigned + "\r\nDue: " + assignment.dateDue + "\r\nScore: " + (isNaN(assignment.score) ? "None" : assignment.score) + " of " + (isNaN(assignment.totalPoints) ? "Any" : assignment.totalPoints) + " points", null, assignment.name); 
		
		//var div = ui.overlay(300,150);
		//div.innerHTML = "<h3>" + assignment.name + "</h3><br/>Assigned: " + assignment.dateAssigned + "<br />Due: " + assignment.dateDue + "</div><br />Score: " + assignment.score + " of " + assignment.totalPoints + " points";
	}
	
	
	this.update = function(params){
		if(params == null)
			return;
		
		if(params.length > 0)
		{
			this.viewClass(params[0]);
		
		}
		else
			this._page.setFocus(this.list);
		
	}	


	

	this.navigate = function(params){
		
	}
	
	
};