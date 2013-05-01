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
	Attendance Page class
*/


PAGESPACE.attendance = function(page){
	page.setup(this, "Attendance", true);
	
	this.cont = page.makeScreenRegion(null);
	

	//this.child = page.makeScreenRegion(this.cont)
	//this.child.innerHTML = "<div style='background-color:light-blue; height:1000px;'>hello<br/><br/><br/>world</div><div>test2</div>"
	//this._page.setFocus(this.child);


	this.refresh = function(){
		hac.getAttendance(function(sucess){
			if(sucess == null)
				return;
			
			var calendar = make(["TABLE",{
				style:{
					height:"100%",
					width:"100%",
					
				},
				id : "calendar"
			},
			[
				["TR", { innerHTML: "<td>Sun</td><td>Mon</td><td>Tue</td><td>Wed</td><td>Thu</td><td>Fri</td><td>Sat</td>" }]
			]
			])[0];
			
			var date = 1;
			
			var days = hac.data.attendance.months[sucess[0]][sucess[1]].days;
			for(r = 0; r < days.length; r++)
			{
				var row = make(["TR", {}])[0]
				for(d = r; d < r + 7; d++)
				{
					var val = days[d]
					if(val[0] == "?")
						row.fill(["TD", {}])
					else
					{
						row.fill(["TD",{
							innerText : date,
							style: { backgroundColor : val[0],
								"border-width": (date == ((new Date).getDate())? "3px" : "1px")
							 },
							 title : val[1] == null ? "": val[1],
							 onclick : function(){
								if(this.color != "")
									navigator.notification.alert(this.title, null, hac.data.attendance.legend[this.color]); 
							 },
							 color : val[0]
						}]);
						date += 1
					}
				}
				calendar.appendChild(row)
				r += 6
			}
			
			window.requestAnimFrame(function(){
				navigation.title(getKeys(MONTHS)[parseInt(sucess[1])] + " " + sucess[0]);
				navigation.pages.attendance._page.clearRegion(navigation.pages.attendance.cont)
				navigation.pages.attendance.cont.appendChild(calendar);
				navigation.pages.attendance._page.setFocus(navigation.pages.attendance.cont);
			});
		
		});		
		
	};
	this.refresh();
	
	
	this.navigate = function(params){
		
	}
	
	
};