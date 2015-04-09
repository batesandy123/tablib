(function($){
	
	$.fn.serializeObject = function()
	{
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	
	$.fn.filterable = function( initObj ){
		
		var colsToAdd;
		var jQueryTableObj;
		var master = new Array([]); //Javascript 2d array
		var unique = new Array([]); //Javascript 2d array
		var rowHeaders;
		var cols;
		var tableID;
		var multiSelectorsDivArr = [];
		
		function onlyUnique(value, index, self) { 
			return self.indexOf(value) === index;
		}
		
		function doFilterSort(selections){
			if(typeof selections == "undefined")//Just in case
				selections = {};
				
			for(i=0; i<master[0].length; i++){
				var child = $(jQueryTableObj).children('tbody').children('tr:nth-child('+ (i+1) +')');
				child.css('display',"table-row");
			}
			if(! $.isEmptyObject(selections))
				$.each(selections, function(key, value){
					var currentColumn = Number(key.replace("col-",""));
					hideTheSelected(currentColumn, value);
				});
			placeMultiSelectors();
		}
		
		function placeMultiSelectors(){
			var pos = {top: 0, left: 0};
			for(index in multiSelectorsDivArr){
					for(var i=1; i <= master[0].length; i++){
						pos = $(jQueryTableObj).children("tbody").children("tr:nth-child("+i+")").children("td:nth-child("+(multiSelectorsDivArr[index].col+1)+")").position();
						if(pos["left"] != 0)
							break;
					}
				
				if(pos["left"] == 0){//This means no rows are currently displayed
					return;
				}
				else	
					$("#"+multiSelectorsDivArr[index].divID).css({
						top: pos["top"],
						left: pos["left"]
					});
			}
		}
		
		function getUrlParameter(sParam)
		{
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) 
			{
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) 
				{
					return sParameterName[1];
				}
			}
		}
		
		function uncheckAllMultiSelects(){
			for(index in multiSelectorsDivArr){
				$("#" + multiSelectorsDivArr[index].divID + " input[type='checkbox']").prop('checked', false);
			}
		}
		
		function hideTheSelected(currentColumn, selected){
			for(i=0; i<master[currentColumn].length; i++){
				var child = $(jQueryTableObj).children('tbody').children('tr:nth-child('+ (i+1) +')');
				//If the column is not selected get rid of it
				if(selected.indexOf(master[currentColumn][i]) == -1)
					child.css('display', "none");
			}
		}
		
		function hideAllMultiSelectors(exceptionID){
			if (typeof exceptionID == "undefined")
				exceptionID = ""
			for(index in multiSelectorsDivArr){
				if(multiSelectorsDivArr[index].divID != exceptionID){
					$("#"+multiSelectorsDivArr[index].divID).hide();
				}
			}
		}
		
		function addFilterButton(col, divID){
			var button = document.createElement('input');
			button.setAttribute("type", "image");
			button.setAttribute("class", "filter-picture");
			button.setAttribute("src", "js/filter-images/filter.png");
			//<input type="image" src="logg.png" name="saveForm" class="btTxt submit" id="saveForm" />
			$(rowHeaders[col]).append(button);
			
			var pos = $(jQueryTableObj).children("tbody").children("tr:nth-child(1)").children("td:nth-child("+(col+1)+")").position();
			//console.log(pos);
			$("#"+divID).css({
				position: "absolute",
				top: pos["top"],
				left: pos["left"]
			});
			$("#"+divID).hide();
			
			$(button).click(function(){
				hideAllMultiSelectors(divID);
				if($("#"+divID).css("display") == "none"){
					$("#"+divID).show();
				}else{
					$("#"+divID).hide();
				}
			});
		}
		
		function addColumn(identifer){
			if(typeof colsToAdd != "object"){//If you have no objects (arrays) to compare against. Than you must add it
				return true
			}
			if(colsToAdd.length == 0){//If you don't specify anything you want, then add it all 
				return true;
			}
			if(colsToAdd.indexOf(identifer) > -1){//If you found an index than add it
				return true;
			}
			//Consider adding names here
			return false;//If passed everything than don't add it
		}
		
		function buildForm(id){
			
			for(var col=0; col < unique.length; col++){
				if( addColumn(col)){//If not a ignorableColumn
					var form = document.createElement("form");
					form.setAttribute('id',"filterStatsForm");
					form.setAttribute('class','doFilterSort');
					
					for(title=0; title<unique[col].length; title++){
						var i = document.createElement("input"); //input element, text
						i.setAttribute('type',"checkbox");
						i.setAttribute('name',"col-"+col);
						i.setAttribute('data-col', col);
						i.setAttribute('value',unique[col][title]);
						form.appendChild(i);
						var p = document.createElement("p");
						p.setAttribute('class',"checkbox-descript");
						p.innerHTML = unique[col][title];
						form.appendChild(p);
						var br = document.createElement('br');
						form.appendChild(br);
					}
					var divID = "div"+tableID+"-"+col;
					var s = document.createElement("input"); //input element, Submit button
					s.setAttribute('type',"submit");
					s.setAttribute('value',"Submit");
					s.setAttribute('class', 'filter-button')
					form.appendChild(s);
					var reset = document.createElement("button");
					reset.setAttribute("class", "reset-button");
					reset.innerHTML = "Reset";
					form.appendChild(reset);
					
					var div = document.createElement('div');
					div.setAttribute('id',divID);
					div.setAttribute('class', "mult-selector");
					div.appendChild(form);
					document.getElementsByTagName('body')[0].appendChild(div);
					
					multiSelectorsDivArr.push({divID:divID, col: col});
					
					addFilterButton(col,divID);//Adding the button to trigger filter
				}
			}	
			
			$('.doFilterSort').submit(function(event){//Stops the form from being submited
				event.preventDefault();
				return false;
			});
			$('.filter-button').click(function(){//Cause the form to be submitted
				doFilterSort($(".doFilterSort").serializeObject());
				hideAllMultiSelectors();
			});
			$('.reset-button').click(function(){
				doFilterSort({});//Empty object causes nothing to be reset
				uncheckAllMultiSelects();
				hideAllMultiSelectors();
			});
		}
		
		colsToAdd = initObj["cols"];
		
		jQueryTableObj = this;
		rowHeaders = $(this).children('thead').children('tr').children('th'); 
		var tableID = $(this).attr('id');
		if (typeof tableID === "undefined"){
			throw "Table must have an id";
		}
		cols = document.getElementById(tableID).rows[0].cells.length;
		
		for(var i=0; i<cols; i++){
			var table = "td:nth-child(" + (i + 1) + ")";
			 
			master[i] = $(this).children('tbody').children('tr').children(table);
			
			master[i] = $(master[i]).map(function(){
				return $.trim($(this).text());
			}).get();
			
			unique[i] = master[i].slice();
			unique[i] = unique[i].filter( onlyUnique );
		}
		
		//Do sort the arrays for good flow
		for(index in unique){
			unique[index].sort();
		}
		buildForm(tableID);
		//console.log(master);
		//console.log(unique);
		return this;
	
	};

}(jQuery));