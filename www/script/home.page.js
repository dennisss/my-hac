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
	Home Page class
*/


PAGESPACE.home = function(page){
	page.setup(this, "Home", true);
	
	this.cont = page.makeScreenRegion(null);
	
	this._page.setFocus(this.cont);
	
	var self = this
	
	
	this.refresh = function(){
		hac.parseDailySummary(function(success){	
			
			//self.cont.style.boxSizing = "border-box";
			self.cont.style.padding = "10px";
			
			self.cont.innerHTML = "<h3>Hi " +hac.data.daily.name+ "!</h3><hr /><br /><p>Here is your schedule for " + hac.data.daily.date + "</p><br />";		
			
			var table = make(["TABLE",
			{
				//class : "borderBox",
				style: {
					border: "1px black solid",
					marginTop : "20px"
					}
			}
			
			])[0];
			table.fill(["TR",
			{ 
				style: {
					border: "1px black solid",
					fontWeight: "bold"
					}
			},
			[
				["TD", {innerText: "Period"}],
				["TD", {innerText: "Class"}],
				["TD", {innerText: "Room"}]
			]
			]);	
			
			
			for(var x in hac.data.daily.schedule){
				table.fill(["TR",
				{
					style : {
						backgroundColor : x%2==0?"rgba(0,0,0,0)":"rgba(0,0,0,0.1)"	
					}
					
				},
				[
					["TD", {innerText: hac.data.daily.schedule[x].period}],
					["TD", {innerText: hac.data.daily.schedule[x].description}],
					["TD", {innerText: hac.data.daily.schedule[x].room}]
				]
				]);
				
			}
			
			self.cont.appendChild(table);	
		
		});
	}
	
	this.refresh();
	
	
	//this.child = page.makeScreenRegion(this.cont)
	//this.child.innerHTML = "<div style='background-color:light-blue; height:1000px;'>hello<br/><br/><br/>world</div><div>test2</div>"
	//this._page.setFocus(this.child);


	this.update = function(){
		
		
	};
	this.navigate = function(params){
		
	}
	
	
};