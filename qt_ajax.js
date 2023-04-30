var userAgent = window.navigator.userAgent.toLowerCase();
$.support.msie8 = $.support.msie && /msie 8\.0/i.test(userAgent);
var center_x,center_y;
var home_titel="";
var url="https://api.nlsc.gov.tw/MapSearch/ContentSearch";
//var url="./json/lucene.jsp";

function LuceneSearch(str) {
	var	post_url="https://api.nlsc.gov.tw/MapSearch/QuerySearch";
//	var	post_url="./json/QuerySearch.jsp";

	$.ajax( {
		type : "POST",
		url : post_url,
		dataType: "xml",timeout: 300000,
		data: { word:encodeURI(str),feedback: "XML",center: center_x+","+center_y },
		success: function(xml) {
			if ($(xml).find("ITEM").length>0){
//			$(xml).find('ITEM').each(function(){
				var name = $(xml).find("ITEM").last().find('CONTENT').text();
				var xy = $(xml).find("ITEM").last().find('LOCATION').text();
				var remark_txt = $(xml).find("ITEM").last().find('REMARK').text();
				var key = $(xml).find("ITEM").last().find('KEY').text();
				var Ary_str = key.split(","); 
				var Ary_xy = xy.split(",");

				if (Ary_str[1]=="DISTRICT" || Ary_str[1]=="VILLAGE" || Ary_str[1]=="SECTION"){
					
					if (Ary_str[1]=="DISTRICT"){
						 //行政區, 定位坐標 :東經=120-36-53秒 北緯=24-08-24秒 
						catchMultifly(Ary_str[0],Ary_str[1],key.replace(Ary_str[0]+","+Ary_str[1]+",",''),xy,name );
						flytopos('town',Ary_xy[0],Ary_xy[1],'qry_addr.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					}
					else if (Ary_str[1]=="VILLAGE"){
						 //村里, 定位坐標 :東經=120-40-15秒 北緯=24-08-51秒 
						catchMultifly(Ary_str[0],Ary_str[1],key.replace(Ary_str[0]+","+Ary_str[1]+",",''),xy,name );
						flytopos('village',Ary_xy[0],Ary_xy[1],'qry_addr.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					}
					else {
						catchMultifly(Ary_str[0],Ary_str[1],key.replace(Ary_str[0]+","+Ary_str[1]+",",''),xy,name );
						flytopos('section',Ary_xy[0],Ary_xy[1],'qry_addr.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					}
				}
				else{
					  if (Ary_str[1]=="LANDGOAL"){
						// 地標,台中縣和平鄉, 定位坐標 :東經=121-18-36秒 北緯=24-15-31秒 
						flytopos('landmark',Ary_xy[0],Ary_xy[1],'qry_landmark.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					  }
					  else if (Ary_str[1]=="LANDMARK"){
						// 地標,台中縣和平鄉, 定位坐標 :東經=121-18-36秒 北緯=24-15-31秒 
						flytopos('landmark',Ary_xy[0],Ary_xy[1],'qry_landmark.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					  }
					  else if (Ary_str[1]=="ADDRESS"||Ary_str[1]=="HOUSEHOLD"){
						//戶政門牌, 定位坐標 :東經=120-18-43秒 北緯=22-35-18秒
						flytopos('door',Ary_xy[0],Ary_xy[1],'qry_addr.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					  }
					  else {
						flytopos('road',Ary_xy[0],Ary_xy[1],'qry_cross.png',name,'','',key.replace(Ary_str[0]+","+Ary_str[1]+",",''));
					  }

				}


//			});
			}

		}
	}); 

}



//抓取目前視中心點填入坐標定位
function centerPosVal(){
	var croodnowcenter = ol.proj.transform([parseFloat(map.getView().getCenter()[0]),parseFloat(map.getView().getCenter()[1])], toProjection, fromProjection);
	center_x = croodnowcenter[0].toFixed(6) ;
	center_y = croodnowcenter[1].toFixed(6) ;
}


function isObj(obj){
	return (!((obj==null)||(obj==undefined)||(obj=="undefined")));
}
function trim(stringToTrim){ return stringToTrim.replace(/^\s+|\s+$/g,"");}
function getRemoteData(uri,q,asyn)  {

	var x ;
		
	if(window.XMLHttpRequest){
	    x = new XMLHttpRequest();
	} else {
	   x = new ActiveXObject("Microsoft.XMLHTTP"); 
	}

	if (isObj(asyn) && asyn != null && asyn == true) {
		x.open('Post', uri, true);
		
	}
	else {
		x.open('Post', uri, false);
	}
	x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	x.setRequestHeader( "If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT" );
	x.send(encodeURI(q));
	return x.responseText;
}


function sentWriteLog(url,XMinYMax,XMaxYMin,id){
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax({
		url:url,
		type: "POST",
	data : {XMinYMax:XMinYMax,XMaxYMin:XMaxYMin,Qry_id:id},
	error: function(xhr) {
		
	},
	beforeSend:function(){
		
	},
	success: function(response) {
		
	    }
	});
}



var tmp_imgid="img_normal_crossroads";
//加入子選單
function addSubMenu(targetdiv, url, imgid, imgurl) {
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url :url,
		type : "POST",
		success : function(response) {
			if (tmp_imgid != imgid) {
				if (tmp_imgid == "img_normal_numbers"){ // 門牌
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_roads"){ // 道路
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_landmark"){ // 地標
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_coord") {// 坐標
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_village"){// 村里
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_crossroads"){// 地號
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_imgid == "img_normal_markpos"){// 周邊
					$("#" + tmp_imgid).css("background-image", "url(./images/tab_off.png)");}

				$("#" + tmp_imgid).css("color", "black");
			}

		
			croodPosQryVal();
			$(targetdiv).empty();
			$("#" + imgid).css("background-image", "url(./images/"+imgurl+")");
			$("#" + imgid).css("color", "#FFF");
			$(targetdiv).html(response);
			tmp_imgid = imgid;

		}
	});
}
var tmp_imgMenuid="img_normal_numbers";

function addMenu(targetdiv, url, imgid, imgurl) {
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url :url,
		type : "POST",
		success : function(response) {
			if (tmp_imgMenuid != imgid) {
				if (tmp_imgMenuid == "img_sysinfo") // 系統簡介
					$("#" + tmp_imgMenuid).attr("src", "./images/s_intro_o.gif");
				if (tmp_imgMenuid == "img_mapsend") // 圖資發布區
					$("#" + tmp_imgMenuid).attr("src", "./images/pic_re_o.gif");
				if (tmp_imgMenuid == "img_download") // 下載專區
					$("#" + tmp_imgMenuid).attr("src", "./images/download_o.gif");
				if (tmp_imgMenuid == "img_faq") // 常見問答集
					$("#" + tmp_imgMenuid).attr("src", "./images/faq_o.gif");
				if (tmp_imgMenuid == "img_reaction") // 問題反應區
					$("#" + tmp_imgMenuid).attr("src", "./images/reaction_o.gif");
			}
			$(targetdiv).empty();
			$("#" + imgid).attr("src", "./images/"+imgurl);
			$(targetdiv).html(response);
			tmp_imgMenuid = imgid;

		}
	});
}

var tmp_apiimgid="img_static_map";

function addApiMenu(targetdiv, url, imgid, imgurl) {
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url :url,
		type : "POST",
		success : function(response) {
			if (tmp_apiimgid != imgid) {
				if (tmp_apiimgid == "img_static_map"){ // static map
					$("#" + tmp_apiimgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_apiimgid == "img_java_script"){ // javascript
					$("#" + tmp_apiimgid).css("background-image", "url(./images/tab_off.png)");}
				if (tmp_apiimgid == "img_help_doc"){ // help doc
					$("#" + tmp_apiimgid).css("background-image", "url(./images/tab_off.png)");}
				
				$("#" + tmp_apiimgid).css("color", "black");
			}
			$(targetdiv).empty();
			$("#" + imgid).css("background-image", "url(./images/"+imgurl+")");
			$("#" + imgid).css("color", "#FFF");
			$(targetdiv).html(response);
			tmp_apiimgid = imgid;
		}
	});
}



function addIndexPage(targetid,url,ismobile){
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url : url,
		type : "POST",
		success : function(response) {
			$("#" + targetid).empty();
			$("#" + targetid).html(response);
			if (isObj(ismobile)){
			  $("#layerall").remove();
			  $("#kml_layer").remove();
			}
		}
	});
}

function addMapsPage(type,targetid,url,ismobile){
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url : url,
		type : "POST",
		success : function(response) {
			$("#" + targetid).empty();
			$("#" + targetid).html(response);
			if (isObj(ismobile)){
			  $("#layerall").remove();
			  $("#kml_layer").remove();
			  
			}
			addselectLayer(type);

		}
	});
}

function addMapsPage2(type,targetid,url){
	if(url.indexOf("./") < 0 ){
		url =home_titel+ url;
	}
	$.ajax( {
		url : url,
		type : "POST",
		success : function(response) {
			$("#" + targetid).empty();
			$("#" + targetid).html(response);
			addselectLayer2(type);

		}
	});
}



var place = "";// 預設縣市
function getCountry(area){
	$.ajax({
		type: "POST",
		url: "./pro/setCountry.jsp",
		dataType: "xml",
		error: function(xhr) {
			showMessage("縣市讀取失敗","msg_panel",3000);
	    },
	    beforeSend:function(){
			$("#Qry_city").empty();
			$("#Qry_city").append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#area_office').empty();
			$('#area_office').append($("<option></option>").attr("value","").text("鄉鎮市區"));
			$('#'+area).empty();
			$('#'+area).append($("<option></option>").attr("value","").text("縣市"));
			$(xml).find('Code').each(function(){
				var id = $(this).find('id').text();
				var name = $(this).find('name').text();
				$("#Qry_city").append($("<option></option>").attr("value",id).text(name)); 
			});
		}
	});
}
function changeCountry(area){
	$.ajax({
		type: "POST",
		url: "./pro/setCountry.jsp",
		dataType: "xml",
		error: function(xhr) {
			showMessage("縣市讀取失敗","msg_panel",3000);
	    },
	    beforeSend:function(){
			$('#'+area).empty();
			$('#'+area).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#area_office').empty();
			$('#area_office').append($("<option></option>").attr("value","").text("鄉鎮市區"));
			$('#'+area).empty();
			$('#'+area).append($("<option></option>").attr("value","").text("縣市"));
			$(xml).find('Code').each(function(){
				var id = $(this).find('id').text();
				var name = $(this).find('name').text();
				if(name!=""){
					$("#"+area).append($("<option></option>").attr("value",id).text(name)); 
				}
			});
		}
	});
}



//取得路網某縣市鄉鎮地區
function changeArea(area, target){
	var area_select=$("#"+area).find('option:selected').val();
	if(area_select=="")//代表沒選縣市
		return;
	$('#'+target).empty();
	$.ajax({
		type: "POST",
		url: "./pro/setArea.jsp",
		dataType: "xml",
	    data:{'city':$("#"+area).find('option:selected').val()},
		error: function(xhr) {
			showMessage("鄉鎮市區讀取失敗","msg_panel",3000);
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("鄉鎮市區"));
			$(xml).find('Code').each(function(){
				var id = $(this).find('id').text();
				var name = $(this).find('name').text();
				if(name!=""){
					$("#"+target).append($("<option></option>").attr("value",id).text(name)); 
				}
			});
		}
	});
}

//取得某鄉鎮地區道路
function changeTownRoad(city,area, target){
	var area_select=$("#"+area).find('option:selected').text();
	if(area_select=="")//代表沒選鄉鎮
		return;
	$('#'+target).empty();
	$('#tunnel_doorname').empty();
	$('#tunnel_doorname').append($("<option></option>").attr("value","").text("巷"));
	$('#alley_doorname').empty();
	$('#alley_doorname').append($("<option></option>").attr("value","").text("弄"));
	if(document.getElementById(area) != null){
		$.ajax({
			type: "POST",
			url: "./pro/setRoad.jsp",
			dataType: "xml",
			data:{'city':$("#"+city).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').text()},
			error: function(xhr) {
				showMessage("道路讀取失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
			},
			success: function(xml) {

				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("路名"));
				$(xml).find('road').each(function(){
	//				var id = $(this).find('id').text();
					var name = $(this).find('name').text();
					if(name!=""){
						$('#'+target).append($("<option></option>").attr("value",name).text(name)); 
					}
				});
			}
		});
	}
}


//取得路網某縣市的巷
function changeLane(city,area, road, target){
	
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區", "msg_panel","3000");
		return;
	}
	if($("#"+road).find('option:selected').text() == "路名"){
		showMessage("請先選擇路名", "msg_panel","3000");
		return;
	}
	$('#alley_doorname').empty();
	$('#alley_doorname').append($("<option></option>").attr("value","").text("弄"));
	$('#'+target).empty();
	$.ajax({
		type: "POST",
		url: "./pro/setLane.jsp",
		dataType: "xml",
		data:{'city':$("#"+city).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').text(),road:$("#"+road).find('option:selected').text()},
		error: function(xhr) {
			showMessage("巷讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中..."));
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("巷"));
			$('#'+road+"_text").val($("#"+road).find('option:selected').text());
			$(xml).find('lane').each(function(){
				var name = $(this).find('name').text();
				if(name!=""){
					$('#'+target).append($("<option></option>").attr("value",name).text(name+"巷")); 
				}
			});
		}
	});
}

//取得路網某縣市的弄
function changeAlley(city,area, road, lane, target){
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區", "msg_panel","3000");
		return;
	}
	if($("#"+road).find('option:selected').text() == "路名"){
		showMessage("請先選擇路名", "msg_panel","3000");
		return;
	}
	var v_city= $("#"+city).find('option:selected').val().substr(0,1);
	var v_area= $("#"+area).find('option:selected').text();
	var v_road= $("#"+road).find('option:selected').text();
	var v_lane=$("#"+lane).find('option:selected').val();
	$('#'+target).empty();
	$.ajax({
		type: "POST",
		url: "./pro/setAlley.jsp",
		dataType: "xml",
		data:{'city':v_city,area:v_area,road:v_road,lane:v_lane},
		error: function(xhr) {
			showMessage("弄讀取失敗","msg_panel",3000);
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("弄"));
			$(xml).find('alley').each(function(){
				var name = $(this).find('name').text();
				if(name != ""){
//					var option = jQuery("new option");
					$('#'+target).append($("<option></option>").attr("value",name).text(name+"弄")); 
				}
			});
		}
	});
}

//取得第一個交叉路段道路
function changeMainCross(city,area, target){
	$('#'+target).empty();
	$.ajax({
		type: "POST",
		url: "./pro/maincross.action",
		dataType: "xml",
		data:{'city':$("#"+city).find('option:selected').val(),area:$("#"+area).find('option:selected').text(),type:'N'},
		error: function(xhr) {
			showMessage("道路讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			var option = jQuery("new option");
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("　　道路名稱　　"));
			$(xml).find('Code').each(function(){
				var name = $(this).find('name').text();
				if(name!=""){
					$('#'+target).append($("<option></option>").attr("value",name).text(name)); 
				}
			});
		}
	});
}

//取得某路的交叉路段
function changeCross(city,area, road, target){
	$('#'+target).empty();
	$.ajax({
		type: "POST",
		url: "./pro/cross.action",
		dataType: "xml",
		data:{'city':$("#"+area).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').text(),road:$("#"+road).find('option:selected').text(),type:'N'},
		error: function(xhr) {
			showMessage("道路讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			var option = jQuery("new option");
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("　　交叉路口　　"));
			$(xml).find('Code').each(function(){
				var name = $(this).find('name').text();
				if(name!=""){
					$('#'+target).append($("<option></option>").attr("value",name).text(name)); 
				}
			});
		}
	});
}


//取得路網某縣市鄉鎮地區村里
function changeVillage(city,area, target){
	var area_select=$("#"+area).find('option:selected').val();
	if(area_select=="")//代表沒選鄉鎮
		return;
	$('#'+target).empty();
	if(document.getElementById(area) != null){
		$.ajax({
			type: "POST",
			url: "./pro/setVillage.jsp",
			dataType: "xml",
			data:{'city':$("#"+area).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').val().substr(1,2)},

			error: function(xhr) {
				showMessage("村里讀取失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
			},
			success: function(xml) {

				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("村里"));
				$(xml).find('village').each(function(){
	//				var id = $(this).find('id').text();
					var name = $(this).find('name').text();
					if(name!=""){
						$('#'+target).append($("<option></option>").attr("value",name).text(name)); 
					}
				});
			}
		});
	}
}



//取得門牌號碼
function catchDoorInfo(city,area, road, lane, alley, number, target){
	var rowno = 0; 
//	if(posvectors.getVisibility()==false){
//		showMessage("請先開啟定位結果圖層，才能檢視定位結果","msg_panel",5000);
//		return;
//	}
	if($("#"+city).find('option:selected').text() == "縣市"){
		showMessage("請先選擇縣市，再點選檢索", "msg_panel","5000");
		return;
	}
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區，再點選檢索", "msg_panel","5000");
		return;
	}
	if($("#"+road).find('option:selected').text() == "路名"){
		showMessage("請先選擇路名，再點選檢索", "msg_panel","5000");
		return;
	}
	var	post_url="https://api.nlsc.gov.tw/MapSearch/QuerySearch";
//	var	post_url="./json/Door.XML";

	var v_text = $("#"+city).find('option:selected').text()+$("#"+area).find('option:selected').text();
	var query_lane = "";
	var query_alley = "";
	var query_number = "";
	
	if($("#"+lane).find('option:selected').text() == "巷")
	{
		query_lane = "";
	}else{
		query_lane = $("#"+lane).find('option:selected').text();
	}
	if($("#"+alley).find('option:selected').text() == "弄")
	{
		query_alley = "";
	}else{
		query_alley = $("#"+alley).find('option:selected').text();	
	}
	if($("#"+number).val() == "")
	{
		query_number = "";
	}else{
		query_number = $("#"+number).val();	
	}
//	$.ajax({
//		url: "./pro/doorname.action",
//		type: "POST",
//		data:{'city':$("#"+city).find('option:selected').val(),area:$("#"+area).find('option:selected').val().substr(1,2),road:$("#"+road).find('option:selected').text(),lane:query_lane,alley:query_alley,number:query_number},
//		error: function(xhr) {
//			showMessage("門牌讀取失敗", "msg_panel","3000");
//	    },
//	    beforeSend:function(){
//	    	showProcessMsg("檢索中", "msg_panel","show");
//	    	$("#"+target).show('slow');
//		},
//		success: function(response) {
//			showProcessMsg("", "msg_panel","hide");	
//			$('#CollapsiblePanel2').show('slow');
//			$("#"+target).html(response);	
//		}
//	});


	v_text = v_text+$("#"+road).find('option:selected').text()+query_lane+query_alley+query_number;
	$.ajax({
		url: post_url,
		type: "POST",
		dataType: "xml",
		data:{ word:encodeURI(v_text),City:$("#"+city).find('option:selected').val(),IndexDB:'ADDRESS',feedback: "XML" ,mode:'exact'},


		error: function(xhr) {
			showMessage("門牌讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
	    	showProcessMsg("檢索中", "msg_panel","show");
	    	$("#"+target).show('slow');
		},
		success: function(xml) {
			$('#'+target).empty();
			var str_h = "<ul class=\"nav\">";
			var str_b = "";
			var str_f = "</ul>";

				$(xml).find('ITEM').each(function(){
					rowno = rowno+1;
					var name = $(this).find('CONTENT').text();
					var xy = $(this).find('LOCATION').text();
					var remark_txt = $(this).find('REMARK').text();
					var key = $(this).find('KEY').text();
					var Ary_str = key.split(","); 
					var Ary_xy = xy.split(",");
					 //str_b = "<li><a href=\"#\" onClick=\" flytopos('door','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;
					 str_b = "<li><a href=\"#\" onClick=\" flytopos('door','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');\">"+name+"</a></li>"+str_b;
				});
				
			showProcessMsg("", "msg_panel","hide");	
			$('#rc_remark').show();
			$('#CollapsiblePanel2').show('slow');
			$("#"+target).html(str_h+str_b+str_f);	
		}
		
	});

}


//取得交叉道路查詢坐標
function catchCrossPos(city,area, road1, road2){
	var select_road2= "";
	if($("#"+city).find('option:selected').val() == ""){
		showMessage("請先選擇縣市，再點選定位", "msg_panel","5000");
		return;
	}
	if($("#"+area).find('option:selected').val() == ""){
		showMessage("請先選擇鄉鎮市區，再點選定位", "msg_panel","5000");
		return;
	}
	if($("#"+road1).find('option:selected').val() == ""){
		showMessage("請先選擇道路名稱，再點選定位", "msg_panel","5000");
		return;
	}
	if ($("#"+road2).find('option:selected').val() == "")
	{
		select_road2 = $("#"+road2+" option:eq(1)").text();
	}
	else{
		select_road2 = $("#"+road2).find('option:selected').text();
	}

	$.ajax({
		url: "./pro/crosscoordination.action",
		type: "POST",
		data:{'city':$("#"+city).find('option:selected').val(),area:$("#"+area).find('option:selected').text(),road1:$("#"+road1).find('option:selected').text(),road2:select_road2},
		error: function(xhr) {
			showMessage("道路交叉路口查詢失敗", "msg_panel","3000");
	    },
		success: function(xml) {
			var x,y;
			$(xml).find('Code').each(function(){
				x = $(this).find('posX').text();
				y = $(this).find('posY').text();
			});
			if ($("#"+road2).find('option:selected').val() == "")
			{
				catchCoordfly("road", x, y, "qry_cross.png", "道路-"
						+ $("#" + road1).find('option:selected').text() ,$("#"+city).find('option:selected').val());
			}
			else{
				catchCoordfly("cross", x, y, "qry_cross.png", "路口-"
					+ $("#" + road1).find('option:selected').text() + "與"
					+ $("#" + road2).find('option:selected').text(),$("#"+city).find('option:selected').val());
			}

	    }
	});
}


//取得地物設施分類
function catchMarkItem(){
	$.ajax({
		url: "./pro/setLandMarkClass.jsp",
		type: "POST",
		dataType: "xml",
		error: function(xhr) {
			showMessage("地標類別讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
			$('#class1').empty();
			$('#class1').append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
			$('#class1').empty();
			$('#class1').append($("<option></option>").attr("value","").text("類別"));
			$(xml).find('class').each(function(){
				var name = $(this).find('name').text();	
				$('#class1').append($("<option></option>").attr("value",name).text(name)); 
			});
		}
	});
}

//取得地物設施類別資料
function catchMarkClass(city,basic, target){	

	if($("#"+city).find('option:selected').val() == ""){
		return;
	}
	if($("#"+basic).find('option:selected').text() == "類別"){
		return;
	}

	$.ajax({
		type: "POST",
		url: "./pro/markClass.action",
		dataType: "xml",
		data:{type:$("#"+basic).find('option:selected').text(),'country':$("#"+city).find('option:selected').val()},
		error: function(xhr) {
			showMessage("地標類別讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
	    	$('#'+target).append("讀取中");
		},
		success: function(xml) {
			$('#'+target).empty();
			$('#'+target).append($("<option></option>").attr("value","").text("請選擇"));
			$(xml).find('Code').each(function(){
				var id = $(this).find('id').text();
				var name = $(this).find('name').text();
				var option = jQuery("new option");
				$('#'+target).append($("<option></option>").attr("value",id).text(name)); 
			});
		}
	});
}
//取得地物設施資料
function catchLandhMark(city,class2, target){	
//	if(posvectors.getVisibility()==false){
//		showMessage("請先開啟定位結果圖層，才能檢視定位結果","msg_panel",5000);
//		return;
//	}
	if($("#class1").find('option:selected').text() == "類別" || $("#class2").find('option:selected').text() == "請選擇"){
		showMessage("請先選擇地標類別，再點選檢索", "msg_panel","5000");
		return;
	}	
	$.ajax({
		type: "POST",
		url: "./pro/landmarkquery.action",
		data:{type:$("#"+class2).find('option:selected').val(),'country':$("#"+city).find('option:selected').val()},
		error: function(xhr) {
			showMessage("地標查詢失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
	    	showProcessMsg("檢索中", "msg_panel","show");
	    	$("#"+target).show('slow');
		},
		success: function(response) {
			showProcessMsg("", "msg_panel","hide");	
			$('#rc_remark').hide();
			$('#CollapsiblePanel2').show('slow');
			$("#"+target).html(response);
		}
	});
}
//取得地物設施資料
//function catchLandhMark(city,class2, target){	
//	if(posvectors.getVisibility()==false){
//		showMessage("請先開啟定位結果圖層，才能檢視定位結果","msg_panel",5000);
//		return;
//	}
//	if($("#class1").find('option:selected').text() == "類別" || $("#class2").find('option:selected').text() == "請選擇"){
//		showMessage("請先選擇地標類別，再點選檢索", "msg_panel","5000");
//		return;
//	}	
//	$.ajax({
//		type: "POST",
//		url: "./pro/landmarkquery.action",
//		data:{type:$("#"+class2).find('option:selected').val(),'country':$("#"+city).find('option:selected').val()},
//		error: function(xhr) {
//			showMessage("地標查詢失敗", "msg_panel","3000");
//	    },
//	    beforeSend:function(){
//	    	showProcessMsg("檢索中", "msg_panel","show");
//		},
//		success: function(response) {
//			showProcessMsg("", "msg_panel","hide");
//			$('#class3').html(response);
//		}
//	});
//}
//地物設施資料定位
function catchLandhMarkPoint(type,target){	
	if( $("#"+target).find('option:selected').val() == ""){
		showMessage("請先選擇地標，再點選定位", "msg_panel","5000");
		return;
	}	
	  var Landmark =  $("#"+target).find('option:selected').text();
	  var xy =  $("#"+target).find('option:selected').val();
	  var Ary_str = xy.split(",");
	  catchCoordfly('landmark',Ary_str[0],Ary_str[1],'qry_landmark.png',"地標-"+Landmark );
}

//取得村里資料
function catchvVillageMark(city,area, village, target){	
	var	post_url="https://api.nlsc.gov.tw/MapSearch/QuerySearch";
//	var	post_url="./json/VILLAGE.XML";

	if($("#"+city).find('option:selected').text() == "縣市"){
		showMessage("請先選擇縣市，再點選定位", "msg_panel","5000");
		return;
	}
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區，再點選定位", "msg_panel","5000");
		return;
	}
	if($("#"+village).find('option:selected').text() == "村里"){
		catchTownMark(city,area,target);
	}
	else{
	    var v_text = $("#"+city).find('option:selected').text()+$("#"+area).find('option:selected').text()+$("#"+village).find('option:selected').text();
		$.ajax( {
			type : "POST",
			url : post_url,
			dataType: "xml",
			data: { word:encodeURI(v_text),City:$("#"+city).find('option:selected').val(),IndexDB:'VILLAGE',feedback: "XML" },
			error : function(xhr) {
				showMessage("資料查詢失敗", "msg_panel", "3000");
			},
			beforeSend : function() {
				showProcessMsg("資料查詢中", "msg_panel", "show");
			},
			success: function(xml) {
				showProcessMsg("", "msg_panel","hide");

				$(xml).find('ITEM').each(function(){
					var xy = $(this).find('LOCATION').text();
					var key = $(this).find('KEY').text();
					var Ary_str = key.split(","); 
					var Ary_xy = xy.split(",");
					catchMultifly($("#"+city).find('option:selected').val(),'VILLAGE',key.replace(Ary_str[0]+","+Ary_str[1]+",",''),xy);
					flytopos('village',Ary_xy[0],Ary_xy[1],'qry_addr.png',v_text ,'','',key.replace(Ary_str[0]+","+Ary_str[1]+","));
				}); 
			}
		}); 
//舊的kml查詢
//		$.ajax({
//			type: "POST",
//			url: "./pro/village.action",
//			data:{'type':'cname','city':$("#"+area).find('option:selected').val().substr(0,1),'area':$("#"+area).find('option:selected').text(),'lee':$("#"+village).find('option:selected').text()},
//			error: function(xhr) {
//				showMessage("村里查詢失敗", "msg_panel","3000");
//			},
//			beforeSend:function(){
//				showProcessMsg("資料檢索中", "msg_panel","show");
//				$("#"+target).show('slow');
//			},
//			success: function(response) {
//				showProcessMsg("", "msg_panel","hide");	
//				$("#"+target).html(response);
//			}
//		});
	}
}

//取得鄉鎮市區資料
function catchTownMark(city,area, target){
	var	post_url="https://api.nlsc.gov.tw/MapSearch/QuerySearch";
//	var	post_url="./json/DISTRICT.XML";
	var v_text = $("#"+city).find('option:selected').text()+$("#"+area).find('option:selected').text();
	$.ajax( {
		type : "POST",
		url : post_url,
		dataType: "xml",
		data: { word:encodeURI(v_text),City:$("#"+city).find('option:selected').val(),IndexDB:'DISTRICT',feedback: "XML" },
		error : function(xhr) {
			showMessage("資料查詢失敗", "msg_panel", "3000");
		},
		beforeSend : function() {
//			showProcessMsg("資料查詢中", "msg_panel", "show");
		},
		success: function(xml) {
			$(xml).find('ITEM').each(function(){
				var xy = $(this).find('LOCATION').text();
				var key = $(this).find('KEY').text();
				var Ary_str = key.split(","); 
				var Ary_xy = xy.split(",");
				catchMultifly($("#"+city).find('option:selected').val(),'DISTRICT',key.replace(Ary_str[0]+","+Ary_str[1]+",",''),xy);
				flytopos('town',Ary_xy[0],Ary_xy[1],'qry_addr.png',v_text ,'','',key.replace(Ary_str[0]+","+Ary_str[1]+","));
			}); 
		}
	}); 


//舊的kml查詢
//	$.ajax({
//		type: "POST",
//		url: "./pro/town.action",
//		data:{'city':$("#"+area).find('option:selected').val().substr(0,1),'area':$("#"+area).find('option:selected').text(),'country':$("#"+city).find('option:selected').text()},
//		error: function(xhr) {
//			showMessage("鄉鎮市區查詢失敗", "msg_panel","3000");
//	    },
//	    beforeSend:function(){
//	    	showProcessMsg("資料檢索中", "msg_panel","show");
//	    	$("#"+target).show('slow');
//		},
//		success: function(response) {
//			showProcessMsg("", "msg_panel","hide");	
//			$("#"+target).html(response);
//		}
//	});
}

//將97坐標轉換為WGS84定位
function catchCoord84fly(point_type, x97, y97, point_img, point_txt,radius,id){
	var v_city =$("#city").find('option:selected').val();
	$.ajax({
		type: "POST",
		url: "./pro/transcoord.action",
		dataType: "xml",
		data:{type : 84,x:x97,y:y97,city:v_city},
		error: function(xhr) {
			showMessage("坐標查詢失敗", "msg_panel","3000");
	    },
		success: function(xml) {
			var x84, y84;
			$(xml).find('Code').each(function(){
				x84 = $(this).find('coordX').text();
				y84 = $(this).find('coordY').text();
			});

				flytopos(point_type,x84,y84,point_img,point_txt,'',radius,id);

		}
	});
}


function catchCoordfly(point_type, x97, y97, point_img, point_txt) {
		catchCoord84fly(point_type, x97, y97, point_img, point_txt);
}

function pointCatchData(ctlName,sectno) {

	$.ajax( {
		type : "POST",
		url : "./pro/pointquery.action",
		data : {
			type : 1,
			ctlName : ctlName,
			sectno : sectno
		},
		error : function(xhr) {
			showMessage("控制點查詢失敗", "msg_panel", "3000");
		},
		beforeSend : function() {
			showProcessMsg("檢索中", "msg_panel", "show");
			$("#rc_info_content").show('slow');
		},
		success : function(response) {
			showProcessMsg("", "msg_panel", "hide");
//			changeSelectLineView();
			$("#rc_info_content").html(response);
			sentWriteLog('writelog.action', nowuser, "B");
		}
	});
}

function setPosCoord(cenx,ceny) {
	if((cenx==null)&&(ceny==null))
	return;	
	$.ajax({
		type: "POST",
		url: "./pro/transcoord.action",
		dataType: "xml",
		data:{type : 84,x:cenx,y:ceny},
		error: function(xhr) {
			//showMessage("坐標查詢失敗", "msg_panel","3000");
	    },
		success: function(xml) {
			var x84, y84;
			$(xml).find('area').each(function(){
				x84 = $(this).find('coordX').text();
				y84 = $(this).find('coordY').text();
				$("#longitude").val(fromatNum(x84,4));
				$("#latitude").val(fromatNum(y84,4));
			});	
		}
	});
}

//jason 新增


//取得代碼轉html
function catchCodeItem(codename,getcoed,target){
	$.ajax({
		type: "POST",
		url: "./pro/codeClass.action",
		dataType: "xml",
		data:{type:codename},
		error: function(xhr) {
			showMessage("地標類別讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
	    	$('#'+target).append("讀取中");
		},
		success: function(xml) {
			$('#'+target).empty();
			if (getcoed=='check')
			{
				$(xml).find('Code').each(function(){
					var id = $(this).find('id').text();
					var name = $(this).find('name').text();
					$('#'+target).append($("<input type='checkbox'  name='Chkb_Qry_paytype' onclick=checkBox2hidden_value('Chkb_Qry_paytype','Qry_paytype');  onkeypress=checkBox2hidden_value('Chkb_Qry_paytype','Qry_paytype');  />").attr("value",id)); 
					
					$('#'+target).append(name); 
				});
			}
			else{
				$('#'+target).append($("<option></option>").attr("value","").text("請選擇"));
				$(xml).find('Code').each(function(){
					var id = $(this).find('id').text();
					var name = $(this).find('name').text();
					var option = jQuery("new option");
					$('#'+target).append($("<option></option>").attr("value",id).text(name)); 
				});
			}
		}
	});
}
//綁定查詢
function setSearch_on(){

	$('#search').css({opacity:1});
	$("#lucene_search").bind('click', function() {
		Search_Data("lucene","rc_model_list");
	});
}

//查詢資料
function Search_Data(id,target) {
	var rowno = 0; 
//	var	post_url="./json/LuceneDebug_20120821192605.XML";
	var	post_url="https://api.nlsc.gov.tw/MapSearch/QuerySearch";
	if($("#"+id).val() == ""){
		showMessage("請輸入查詢條件", "msg_panel","5000");
		return;
	}
	$('#rc_remark').show();
	folder('adg','CollapsiblePanel2');
	$('#'+target).empty();
	$('#'+target).html("<ul class=\"nav\"><li>資料查詢中</li></ul>");

	$.ajax( {
		type : "POST",
		url : post_url,
		dataType: "xml",timeout: 300000,
		data: { word:encodeURI($("#"+id).val()),feedback: "XML",center: center_x+","+center_y },
		error : function(xhr) {
			//showMessage("資料查詢失敗", "msg_panel", "3000");
		},
		beforeSend:function(){
			showMessage("資料查詢中", "msg_panel", "3000");
		
		},
		success: function(xml) {
			$('#'+target).empty();
			var str_h = "<ul class=\"nav\">";
			var str_b = "";
			var str_f = "</ul>";

				$(xml).find('ITEM').each(function(){
					rowno = rowno+1;
					var name = $(this).find('CONTENT').text();
					var xy = $(this).find('LOCATION').text();
					var remark_txt = $(this).find('REMARK').text();
					var key = $(this).find('KEY').text();
					var Ary_str = key.split(","); 
					var Ary_xy = xy.split(",");


					if (Ary_str[1]=="DISTRICT" || Ary_str[1]=="VILLAGE" || Ary_str[1]=="SECTION"){
						
						if (Ary_str[1]=="DISTRICT"){
							 //行政區, 定位坐標 :東經=120-36-53秒 北緯=24-08-24秒 
							 str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' );flytopos('town','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');\">"+name+"</a></li>"+str_b;
							 
							// str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' );flytopos('town','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;							 


						}
						else if (Ary_str[1]=="VILLAGE"){
							 //村里, 定位坐標 :東經=120-40-15秒 北緯=24-08-51秒 
							 str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' );flytopos('village','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');\">"+name+"</a></li>"+str_b;
							 //str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' );flytopos('village','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;							 

						}
						else {
							 str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' ); flytopos('section','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');\">"+name+"</a></li>"+str_b;
							 //str_b = "<li><a href=\"#\" onClick=\"catchMultifly('"+Ary_str[0]+"','"+Ary_str[1]+"','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"','"+xy+"','"+name+"' ); flytopos('section','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",")+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;
						}
					}
					else{
						  
						  if (Ary_str[1]=="LANDGOAL"){
							// 地標,台中縣和平鄉, 定位坐標 :東經=121-18-36秒 北緯=24-15-31秒 
							 str_b = "<li><a href=\"#\" onClick=\"flytopos('landmark','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_landmark.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');\">"+name+"</a></li>"+str_b;
							 // = "<li><a href=\"#\" onClick=\"flytopos('landmark','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_landmark.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;
							 
						  }
						  else if (Ary_str[1]=="LANDMARK"){
							// 地標,台中縣和平鄉, 定位坐標 :東經=121-18-36秒 北緯=24-15-31秒 
							 str_b = "<li><a href=\"#\" onClick=\"flytopos('landmark','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_landmark.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');\">"+name+"</a></li>"+str_b;
							 //str_b = "<li><a href=\"#\" onClick=\"flytopos('landmark','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_landmark.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;							 
						  }
						  else if (Ary_str[1]=="ADDRESS"||Ary_str[1]=="HOUSEHOLD"){
							 //戶政門牌, 定位坐標 :東經=120-18-43秒 北緯=22-35-18秒
							 str_b = "<li><a href=\"#\" onClick=\" flytopos('door','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');\">"+name+"</a></li>"+str_b;
							 //str_b = "<li><a href=\"#\" onClick=\" flytopos('door','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_addr.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;							 

						  }
						  else {
							 str_b ="<li><a href=\"#\" onClick=\"flytopos('road','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_cross.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');\">"+name+"</a></li>"+str_b;
							 //str_b ="<li><a href=\"#\" onClick=\"flytopos('road','"+Ary_xy[0]+"','"+Ary_xy[1]+"','qry_cross.png','"+name+"' ,'','','"+key.replace(Ary_str[0]+","+Ary_str[1]+",",'')+"');$('#list"+rowno+"').show('slow');\">"+name+"</a><div id = \"list"+rowno+"\" class= \"list\"  style=\"display:none\" >"+remark_txt+"</div></li>"+str_b;							 

						  }
					}

				});
				
				showProcessMsg("", "msg_panel", "hide");
				var contentheight = document.documentElement.clientHeight ;
				var mainmapheight = contentheight - 110;
				$('#rc_model_list').css('height',mainmapheight);
				$('#rc_model_list').css('overflow','auto');
				$('#'+target).html(str_h+str_b+str_f);
		}
	}); 

}
//資料定位
function payCoord(point_type, x84, y84, point_img, point_txt,radius,id) {

		flytopos(point_type,x84,y84,point_img,point_txt,'',radius,id);
}
//取得某鄉鎮地區村里 
function changeLee(city,area, target){
	var area_select=$("#"+area).find('option:selected').val();
	if(area_select=="")//代表沒選鄉鎮
		return;
	$('#'+target).empty();
	if(document.getElementById(area) != null){
		$.ajax({
			type: "POST",
			url: "./pro/setVillage.jsp",
			dataType: "xml",
			data:{'city':$("#"+area).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').val()},
			error: function(xhr) {
				showMessage("村里讀取失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
			},
			success: function(xml) {

				$('#'+target).empty();
				$('#'+target).append($("<option></option>").attr("value","").text("村里"));
				$(xml).find('village').each(function(){
					var id = $(this).find('id').text();
					var name = $(this).find('name').text();
					if(name!=""){
						$('#'+target).append($("<option></option>").attr("value",id).text(name)); 
					}
				});
			}
		});
	}
}


function getMessage(url,type,target_div,rownum){//取得公告訊息 rownum = 0 為全部顯示  rownum = 10 顯示10筆
	$.ajax({
		url: home_titel+url,
		type: "POST",
	data : {type:type,rownum:rownum},
	error: function(xhr) {
		
	},
	beforeSend:function(){
	
	},
	success: function(response) {
		$("#"+target_div).empty();
		$("#"+target_div).html(response);
	    }
	});
}

function getMessageData(url,target_div){//取得資料
	$.ajax({
		url: home_titel+url,
		type: "POST",
	data : {action:'qry'},
	error: function(xhr) {
		
	},
	beforeSend:function(){
	
	},
	success: function(response) {
		$("#"+target_div).empty();
		$("#"+target_div).html(response);
	    }
	});
}

function catchMultifly(cityCode, folderName, key ,center ) {
	if (folderName=="DISTRICT"||folderName=="VILLAGE"||folderName=="SECTION")
	{
 	var Getimp_url = "https://api.nlsc.gov.tw/MapSearch/GetGppImg";
		$.ajax({
			type: "POST",
			url: Getimp_url,
			dataType: "xml",
			data:{'city':cityCode,IndexDB:folderName,key:key},
			error: function(xhr) {
		    },
		    beforeSend:function(){
			},
			success: function(xml) {

				$(xml).find('DATA').each(function(){
					var scope = $(this).find('SCOPE').text();
					if(scope!=""){
						 catchResultImg(folderName,center,key,scope);
					}
				});
			}
		});

//     var v_xml = getRemoteData(Getimp_url,'city='+cityCode+"&IndexDB="+folderName+"&key="+key);
//     var Ary_box = v_xml.split("<SCOPE>")[1].replace("</SCOPE>", "").replace("</DATA>", "");
//	 catchResultImg(folderName,center,key,Ary_box);
	}
}

//程式更新至server端暫存目錄
function uploadSoft(target, targetButton) {
	var filename = $('#' + target).val();
	if (typeof (filename) == undefined || filename == "") {
		alert("請挑選上傳檔案");
		return;
	}
	 var file = document.getElementById(target).files[0]; 
	 var fis = file.name.toUpperCase().split('.');
	if(fis.length!=2 || fis[fis.length-1] !='KML'){
		alert('請挑選KML文件上傳！');
		return ;
    }
	 if( file.size >1048576){
		alert('檔案大小超過1MB！');
		return ;
	 }
	
	$('#' + targetButton).val('上傳中，請稍候!').attr('disable',false);
	$.ajaxFileUpload({
		secureuri: false,
		url: "/fileaction.action",
		fileElementId: target,
		dataType: "xml",
		error: function (xhr) {
			conflag = confirm("上傳失敗!!");
		},
		success: function (xml) {
			$(xml).find('msgs').each(function () {
				var msg = $(this).find('msg').text();
				var filemane = $(this).find('filemane').text();
				var sourceName = $(this).find('sourceName').text();
				$('#CollapsiblePanel6').show('slow');
				$('#rc_kml_list').append("<li>"+sourceName+"</li>");
				showUploadkml(filemane);
				alert(msg);
			})
		}
	});
	$('#' + targetButton).val("上傳").attr('disable',true);
}

function catchPointQuery(x,y) {
 	var GetPoint_url = "https://api.nlsc.gov.tw/MapSearch/LocationQuery";
	var v_xml="";
	$.ajax({
		type: "POST",
		url: GetPoint_url,
		data:{center:x+','+y},
		async: false,
		timeout: 300000,
	    beforeSend:function(){
			
		},
		error: function(xhr) {
			hideSendMsg();
	        showMessage("點位查詢失敗", "msg_panel","3000");
	    },
		success: function(response) {
		   hideSendMsg();
		   v_xml =response.replace("土地利用現況調查", "國土利用現況調查").replace("經緯度", "經緯度WGS84");
		   var city_s =v_xml.split("@")[0];
		   if (city_s==""){
			  v_xml = "@<br>"+v_xml.split("@")[1]
		   }		   
		}
	});	
//	v_xml = "B@行政區:臺中市西屯區何福里<br>經緯度:120.662397,24.167142   (度)<br>經緯度:120-39-44.6 24-10-01.7 (度分秒)<br>國土利用現況調查:一般道路 (2019年11月)";


//	 if (!checkVal(v_xml.substring(0,1))){
//		 return "";
//	 }

	 return v_xml;
}

function getPosCoord(type,cenx,ceny) {
	 var crs = cenx.split(".")[0];
	 var city = "";
	 if (crs<120)
	 {
		city = "X";
	 }
	 else{
		  city = "A";
	 }


	var x = getRemoteData('./transcoord.action','type='+type+'&x='+cenx+'&y='+ceny+'&city='+city);
	var text="";
	$(x).find('Code').each(function(){
		var x, y;
		x = $(this).find('coordX').text();
		y = $(this).find('coordY').text();
		 if(type=='97'){
			text =  'TWD97坐標  E:'+fromatNum(x,3)+'  N:'+fromatNum(y,3);
		 }
	});
	return text;
}

function cleanMapQA(){
	$("#qa_class").children().each(function(){
    if ($(this).text()=="請選擇"){
        $(this).attr("selected","true"); 
    }
    });
	$("#qa_contents").val("");
	$("#qa_addr").val("");
	$("#qa_imgstr").val("");
	$("#qa_geojson").val("");

}

function getToken(target) {
	$.ajax({
		url: home_titel+"/pro/setToken.jsp",
		async: false,
		type: "POST",
	    beforeSend:function(){
		},
		success: function(data) {
		  $('#'+target).html(data);
		}
	});
	
}

//取得圖層設定
function getMaps_layers( target,lang){	
	$("#"+target).empty();
	$.ajax({
		type: "POST",
		url: home_titel+"/pro/map_layer.html",
		success: function(response) {
			$("#"+target).html(response);
				if(lang!="ZH-TW")
				{
					$('#map_type_3').attr('checked',true); 
				}
		}
	});
}

//取得圖層資訊
function getMaps_layerinfo( target){	
	//target= target.replace("_B",'');
	$("#ex_plain").empty();
	$("#ex_plain").html($("#"+target).val());
	$('#Mapsinfo').dialog('open');

}

function setMaps_layerinfo( target){	
	$.ajax({
		type: "POST",
		url: home_titel+"/pro/map_layerInfo.html",
		success: function(response) {
			$("#"+target).html(response);
		}
	});

}

var idle ;

function setSysinfo( target){	

	$.ajax({
		type: "POST",
		url: home_titel+"/pro/mapuseinfo.html",
		success: function(response) {
			if (response!=""){
//				 $.idleTimeout('body', 'div[aria-describedby="SysInfo"] .ui-dialog-titlebar-close', {
////					warningLength: 5,
//					idleAfter: 600,
//					onTimeout: function(){
//				//		window.location = "timeout.htm";
//					},
//					onIdle: function(){
//						$( "#SysInfo" ).dialog("open");
//					}
//				});
				$("#"+target).html(response);
				$("#"+target+ " .transition").remove();
				initSysinfo();
			}
		}
	});

}

//取得地段
function changeSection(city,area, sectioncode, target){
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區", "msg_panel","3000");
		return;
	}

	$("#"+target).empty();
	$("#"+sectioncode).val("");
	$.ajax({
		url: "./pro/setSection.jsp",
		type: "POST",
		dataType: "xml",
		data:{city:$("#"+city).find('option:selected').val().substr(0,1),area:$("#"+area).find('option:selected').val()},
		error: function(xhr) {
	        showMessage("地段讀取失敗", "msg_panel","3000");
	    },
	    beforeSend:function(){
			$('#'+target).empty();
			var option = jQuery("new option");
			$('#'+target).append($("<option></option>").attr("value","").text("讀取中...")); 
		},
		success: function(xml) {
	    	$('#'+target).empty();
	    	$('#'+target).append($("<option></option>").attr("value","").text("----------"));
			$(xml).find('landsec').each(function(){
				var id = $(this).find('id').text();
				var name = $(this).find('name').text();
				var office = $(this).find('office').text();
	    		if((id.indexOf($('#'+sectioncode).val()) > -1) && ($('#'+sectioncode).val() != "")){
					$('#'+target).append($("<option></option>").attr({"value":office+"_"+id, "selected":"true"}).text(name)); 
				}
				else{
					$('#'+target).append($("<option></option>").attr("value",office+"_"+id).text(name)); 	
				}
			});

//	    	var jsonContent = JSON.parse(response);
//	    	for(var i=0; i<jsonContent.country.length; i++){
//	    		if((jsonContent.country[i].id.indexOf($('#'+sectioncode).val()) > -1) && ($('#'+sectioncode).val() != "")){
//					$('#'+target).append($("<option></option>").attr({"value":jsonContent.country[i].office+"_"+jsonContent.country[i].id, "selected":"true"}).text(jsonContent.country[i].name)); 
//				}
//				else{
//					$('#'+target).append($("<option></option>").attr("value",jsonContent.country[i].office+"_"+jsonContent.country[i].id).text(jsonContent.country[i].name)); 	
//				}
//	    	}
	    	if($("#" + target + "option:selected").val() == ""){
	    		$('#'+area).append($("<option></option>").attr("value","").text("未查到該段號")); 
		    	$('#'+target).append($("<option></option>").attr("value","").text("未查到該段號")); 
		    	return;
	    	}
		}
	});
}


//輸入所代碼顯示縣市與所資料
function keySection(city,area, section, sectionid){
	var sectioncode = $("#"+sectionid).val();

	if(!checkNum($("#"+sectionid).val())){
		$("#"+sectionid).val("代碼");
		return;
	}

	if(sectioncode == ""){
		$('#'+area).empty();
		$('#'+area).append($("<option></option>").attr("value","").text("行政區"));
		$('#'+section).empty();
		$('#'+section).append($("<option></option>").attr("value","").text("地段"));
		changeArea(area);
		return;
	}
	if(sectioncode != ""){
		$.ajax({
			url: "./pro/setSectionCode.jsp",
			type: "POST",
			error: function(xhr) {
				showMessage("地段讀取失敗", "msg_panel","3000");
		    },
			data:{city:$("#"+city).val(),section:sectioncode},
		    beforeSend:function(){
				showProcessMsg("地段資料檢索中", "msg_panel","show");
			},
			success: function(response) {
				if(response.toString().indexOf("not found")!=-1) {
					showMessage("查無此段代碼", "msg_panel","3000");
					return;
				}
				showProcessMsg("", "msg_panel","hide");
		    	var jsonContent = JSON.parse(response);

				if(jsonContent.count>1){
					var str = "縣市內有相同的段號，需先指定鄉鎮市區，再選擇段名來取得該地段";
					for(var i=0; i<jsonContent.count; i++){
						str +="\n\r";
						str += jsonContent.selected[i].area_selected_title+"　"+jsonContent.selected[i].sect_selected_val+"　"+jsonContent.selected[i].sect_selected_title;
					}
					alert(str);
					$("#"+sectionid).val("代碼");
					return;
				}
				else{
					$('#'+area).empty();
					$('#'+section).empty();
					$('#'+area).append($("<option></option>").attr("value","").text("鄉鎮市區"));
					for(var i=0; i<jsonContent.area[1].area_val.length; i++){
						$('#'+area).append($("<option></option>").attr("value",jsonContent.area[1].area_val[i]).text(jsonContent.area[1].area_title[i]));
					}
					$('#'+section).append($("<option></option>").attr("value","").text("地段"));
					for(var i=0; i<jsonContent.section.sect_val.length; i++){
						$('#'+section).append($("<option></option>").attr("value",jsonContent.section.sect_val[i]).text(jsonContent.section.sect_title[i]));
					}
					$("#"+area).children().each(function(){
						if ($(this).text() == jsonContent.area[0].area_selected_title){
							$(this).attr("selected","true");
						}
					});
					$('#'+section).val(jsonContent.section.sect_selected_val);
				}
		    }
		});
	}
}


//轉地建號格式
function getlandno(name,hname) {
	if ($('#' + name).val() != '請輸入地建號') {
	  $('#' + name).val(parselandno($('#' + name).val(), 'Land'));
   } 
}
//取得地籍圖
function catchProperty(city,area, section,sect,landno,target){
	if($("#"+city).find('option:selected').text() == "縣市"){
		showMessage("請先選擇縣市", "msg_panel","3000");
		return;
	}
	if($("#"+area).find('option:selected').text() == "鄉鎮市區"){
		showMessage("請先選擇鄉鎮市區", "msg_panel","3000");
		return;
	}

	if($("#"+section).find('option:selected').text() == "----------"){
		showMessage("請先選擇地段", "msg_panel","3000");
		return;
	}
	if($("#"+landno).val() == ""){
		showMessage("請先輸入地號", "msg_panel","3000");
		return;
	}
//	 var v_xml = jQuery.parseJSON(getRemoteData("qryTileMapIndex (5).json",'FLAG=2&OFFICE=BC&SECT=0369&LANDNO=05330000&ALPAH=0.5f').trim());
	var office_str=$("#"+section).find('option:selected').val();
	var type = "2";
	if($.support.msie8){//檢查是不是ie8
		type = "1";
	}

	if(office_str=="")//代表沒選段
		return;
		office_str =office_str.split("_")[0];

	
	var landcolor = $("#SelectColorByLand").text();
	if(!isObj(landcolor)){				 
		landcolor = "#F70101";
	}

	var mydata = {
		type:type,flag:'2',office:office_str,sect:$("#"+sect).val(),landno:parseLandNo8($("#"+landno).val()),alpah:'0.5f'
	};
	if(isObj(landcolor)){	
		if (landcolor != "#F70101"){
			var colordata = {
				color:landcolor
			};	
			mydata = $.extend(mydata, colordata);
		}
	}

		
		$.jsonp({
//			type: "post",
//			url: "qryTileMapIndex (5).json",
//			url: "./json/land.jsp",
			url: "https://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex",
			callbackParameter: "callback",
			timeout: 300000,
			dataType: "jsonp",
			data:mydata,
//			data:{flag:'2',office:'BC',sect:'0369',landno:'05330000',alpah:'0.5f'},
			error: function(xhr) {
				showMessage("地籍圖讀取失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				showProcessMsg("資料查詢中", "msg_panel", "show");
			},
			success: function(json) {
				showProcessMsg("", "msg_panel", "hide");
				var s =0;
				if(isObj(json[0][0].msg)){
				    landstr = json[0][0].msg;
					alert(landstr);
					return;
				}
				else{
					var jsondata = json[0];
					var sectNO = jsondata[0].office+jsondata[0].sect;
					if (jsondata[0].extend!=""){
						sectNO +="-"+jsondata[0].extend;
					}

					flytopos('section',jsondata[0].cx,jsondata[0].cy,'qry_land.png',$.base64.atob(jsondata[0].officeStr,true)+"所 ("+sectNO+")"+$("#"+section).find('option:selected').text()+" "+$("#"+landno).val()+"地號" ,'','','');
					$('#rc_land').show();
					var landtext =$.base64.atob(jsondata[0].officeStr,true)+"所 ("+sectNO+")"+$("#"+section).find('option:selected').text()+" "+$("#"+landno).val()+"地號";
					$('#'+target).append("<tr><td>"+$.base64.atob(jsondata[0].officeStr,true)+"所 ("+sectNO+")"+$("#"+section).find('option:selected').text()+" "+$("#"+landno).val()+"地號"+"<span id=\"div_cross\" >"+
					"<input type=\"button\"  value=\"詳細..\" onclick=\"showLandData('"+jsondata[0].cx+"','"+jsondata[0].cy+"','"+jsondata[0].office.substr(0,1)+"','"+jsondata[0].sect+"-"+jsondata[0].extend+"', '"+jsondata[0].landno+"','qryLand_tab2_"+jsondata[0].office+jsondata[0].sect+jsondata[0].landno+"','"+landtext+"');\">"+
					"&nbsp;&nbsp;<input type=\"button\" id=\"qryLand_tab2_"+jsondata[0].office+jsondata[0].sect+jsondata[0].landno+"_color\"   value=\"著色\" onclick=\"colorAtion('"+jsondata[0].cx+"','"+jsondata[0].cy+"','"+jsondata[0].office+"','"+jsondata[0].sect+"', '"+jsondata[0].landno+"','Y','LandListColor_"+jsondata[0].landno+"');\">"+ 
					"</span><div id ='ColorPosLand_"+jsondata[0].landno+"' ><span  style='display: inline-block;  right: 41px;  margin-top: 1px;'><span id='LandListColor_"+jsondata[0].landno+"' style='margin-left: 12px;'></span><span id='LandListColor_"+jsondata[0].landno+"_set' style='display: none;'></span></span></div></td></tr>"); 
					$('#LandListColor_'+jsondata[0].landno)
					var color_no = ary_color[$("#land_color").val()];
					$('#LandListColor_'+jsondata[0].landno).colorPicker({
						
						color: [ '#F70101','#FF7F27', '#FFF200', '#22B14C', '#007EE8', '#9600FF', '#8C8C8C'],
						columns:7,     // number of columns 
						click:function(c){
							if (initmaps){
							  color_no = ary_color[c];
							  $('#LandListColor_'+jsondata[0].landno+'_set').text(c);
							  $('#EditorColorByLand>.jColorSelect div').eq(color_no).trigger('click');
							}
						}
					 });
				}
				changeToolImg('none');
				toggleControl('none');
				var dmaps_yn =false;
				var sectmaps_yn=false;
				map.getLayers().forEach(function (lyr) {
					if (lyr.get('type')!="base"){
						if ("DMAPS"==lyr.get('name')){
							dmaps_yn = lyr.getVisible();
						}
						if ("LANDSECT"==lyr.get('name')){
							sectmaps_yn =  lyr.getVisible();
						}
					}
				});	
				if (!sectmaps_yn)
				{
					setOverlay_layer('LANDSECT');
				}				
				if (!dmaps_yn)
				{
					if ($("#land_layer").val()=="N" ){
						chkqryLand('land_layer');
					}
					else{
						setOverlay_layer('DMAPS');
					}
//					chk_layertype('土地圖資',DMAPS,'DMAPS');
				}
				if ($("#land_layer").val()=="Y" && $("#land_qry").val()=="N" ){
					chkqryLand('land_qry');
				}
			}
		});
//		$.ajax({
//			type: "post",
////			url: "qryTileMapIndex (5).json",
////			url: "./json/land.jsp",
//			url: "https://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex",
//			timeout: 300000,
//			dataType: "jsonp",
//			data:{type:type,flag:'2',office:office_str,sect:$("#"+sect).val(),landno:parseLandNo8($("#"+landno).val()),alpah:'0.5f'},
//
////			data:{flag:'2',office:'BC',sect:'0369',landno:'05330000',alpah:'0.5f'},
//			error: function(xhr) {
//				showMessage("地籍圖讀取失敗","msg_panel",3000);
//		    },
//		    beforeSend:function(){
//				showProcessMsg("資料查詢中", "msg_panel", "show");
//			},
//			success: function(json) {
//				showProcessMsg("", "msg_panel", "hide");
//				var s =0;
//				if(isObj(json[0][0].msg)){
//					landstr = json[0][0].msg;
//					alert(landstr);
//					return;
//				}
//				
//				else{
//					var jsondata = json[0];
//
//					flytopos('section',jsondata[0].cx,jsondata[0].cy,'qry_land.png',$.base64.atob(jsondata[0].officeStr,true)+"所 ("+jsondata[0].office+jsondata[0].sect+")"+$("#"+section).find('option:selected').text()+" "+$("#"+landno).val()+"地號" ,'','','');
//					$('#rc_land').show();
//					$('#'+target).append("<tr><td class=\"rc_form_float_left\">"+$.base64.atob(jsondata[0].officeStr,true)+"所 ("+jsondata[0].office+jsondata[0].sect+")"+$("#"+section).find('option:selected').text()+" "+$("#"+landno).val()+"地號"+"</td><td class=\"rc_form_float_left\"><div id=\"div_cross\" >"+
//					"<input type=\"button\" id=\"div_"+jsondata[0].landno+"\"  value=\"著色\" onclick=\"colorAtion('"+jsondata[0].cx+"','"+jsondata[0].cy+"','"+jsondata[0].office+"','"+jsondata[0].sect+"', '"+jsondata[0].landno+"','Y');\">"+
//					"&nbsp;&nbsp;<input type=\"button\"  value=\"詳細..\" onclick=\"showLandData('"+jsondata[0].cx+"','"+jsondata[0].cy+"','"+jsondata[0].office.substr(0,1)+"','"+jsondata[0].sect+"', '"+jsondata[0].landno+"','qryLand_tab2_"+jsondata[0].office+jsondata[0].sect+jsondata[0].landno+"');\">"+ 
//					"</div></td></tr>");	
//				}
//				changeToolImg('none');
//				toggleControl('none');
//				map.getLayers().forEach(function (lyr) {
//					if (lyr.get('type')!="base"){
//						if (lyr.get('name')=="DMAPS"){
//							 if ( lyr.getVisible()){
//								setOverlay_layer('DMAPS');
//							 }
//						}
//					}
//				});
//
//			}
//		});
}



//秀土地標示部
function showLandData(pos_x84,pos_y84,city,sect,landno,target,landtext){
    var pops = map.popups;
	var chk = false;
	var landid= target.split("_")[2];
	
	if(isObj(pops)){
		for(var a = 0; a < pops.length; a++){
			if (pops[a].id=="Popup_"+target){
			  chk = true;
			  pops[a].show();
			  break;
			}
		}
	}
	var strs = catchPointQuery(pos_x84,pos_y84);
//	var strs = "B@行政區:臺中市西區平和里<br>經緯度:120.670569,24.138834   (度)<br>經緯度:120-40-14.0 24-08-19.8 (度分秒)<br>國土利用現況調查:純住宅 (2019年11月)";
	if (!chk){
	var sid = strs_id;

	var showtext ="";

		showtext="<div class='tab-qryLand'><ul class='tabs'><li ><a href='#qryLand_tab1'  >基本資訊</a></li>"
		+"<li id = 'qryland_"+strs_id+"'  ><a href='#qryLand_tab2_"+strs_id+"' id ='qryland_"+strs_id+"'  >土地資訊</a></li>"
		+"<li id = 'qryland2_"+strs_id+"' ><a href='#qryLand_tab5_"+strs_id+"' id ='qryland2_"+strs_id+"'  >地段資訊 </a></li>"
		+"<li id = 'qrybulid_"+strs_id+"' style='display:none;' ><a href='#qrybulid_tab3_"+strs_id+"' id ='qrybulid_"+strs_id+"'  >建號列表</a></li>"
		+"<li id = 'qrypubland_"+strs_id+"' style='display:none;' ><a href='#qrypubland_tab4_"+strs_id+"' id ='qrypubland_"+strs_id+"'  >公有土地</a></li>"
		+"</ul>"
		+"<div class='tab_container'>"
		+"<div id='qryLand_tab1' class='tab_content'>";
		if (strs!="")
		{
			var city_s =strs.split("@")[0];
			var as =strs.split("@")[1].split(":")[4];
				showtext +="<table width=\"370\"><tr><td>"+strs.split("@")[1]+"&nbsp;&nbsp;&nbsp;<input type=\"button\" id=\"qryhistory_"+strs_id+"\" value=\"歷年\" >"; 
				
			if(city_s!="" && as!=""){
				var tmd = croodTMD(pos_x84);
				var xy =coord.toTwd97(pos_y84,pos_x84,tmd);
				showtext +="<br>TWD97坐標  E:"+fromatNum(xy[0],3)+'  N:'+fromatNum(xy[1],3);
			}

			showtext +="<br><span id= 'strs_land_"+strs_id+"'>"+landtext+"</span></td><tr>"; 
			showtext +="<tr><td align='right'><a href='http://maps.google.com/maps?q=&layer=c&cbll="+pos_y84+","+pos_x84
					+"&cbp=12,270&hl=zh-TW'  target='_blank'><img src='./images/streetscape.png'   title= 'Google 街景' ></a>&nbsp;&nbsp;"
					+"<a  href='javascript:void(0);' onclick=open_3dmaps();><img src='./images/map_ico.png'   title= '3D地圖' ></td></tr></table></div>";

			showtext+="<div id='qryLand_tab2_"+strs_id+"' class='tab_content'>"
			+"</div>"
			showtext+="<div id='qryLand_tab5_"+strs_id+"' class='tab_content scrollit'>"
			+"</div>"
			showtext+="<div id='qrybulid_tab3_"+strs_id+"' class='tab_content scrollit'>"
			+"</div>"
			showtext+="<div id='qrypubland_tab4_"+strs_id+"' class='tab_content scrollit'>"
			+"</div>"
			+"</div>"
			+"</div></div></div>";
		}
		else{
			showtext ="<table width=\"350\" ><tr><td>經緯度WGS84:"+pos_x84+","+pos_y84+" (度)"; 
			showtext +="<br>經緯度WGS84:"+decToDeg(pos_x84.toFixed(6),'lon')+" "+decToDeg(pos_y84.toFixed(6),'lat')+" (度分秒)</td><tr><td>"; 
			showtext +="<br><span id= 'strs_land_"+strs_id+"'>"+landtext+"</span></td><tr></table>"; 
			showtext +="<div  align='right'><a href='http://maps.google.com/maps?q=&layer=c&cbll="+pos_x84.toFixed(6)+","+pos_y84.toFixed(6)
					+"&cbp=12,270&hl=zh-TW'  target='_blank'><img src='./images/streetscape.png'   title= 'Google 街景' ></a>&nbsp;&nbsp;"
					+"<a  href='javascript:void(0);' onclick=open_3dmaps();><img src='./images/map_ico.png'   title= '3D地圖' ></td></tr></table></div>";
		}



		var target_id= "qryLand_tab2_"+strs_id;	
		var histarget_id= "qryhistory_list";	
		var lonlat =ol.proj.transform([parseFloat(pos_x84), parseFloat(pos_y84)], fromProjection, toProjection)
		$( ".ol-popup" ).css("bottom", "24px");
//		addMapPopup("Popup_"+target,lonlat,showtext);
		map.getView().setCenter(lonlat);
		addMapPopupDialog("Popup_"+target, lonlat,showtext);
		land_marker.setPosition(lonlat);
		map.addOverlay(land_marker);
		

		setTimeout(function () {	
			$( ".tab-qryLand" ).tabs();
			$(".tab-qryLand").tabs('option','active',0);
			$("#qryhistory_" + strs_id).on("click", function(event) {
				historyAtion(pos_x84,pos_y84,histarget_id);
			});
			catchLandFlag(city,sect,landno,target_id);	

			//$("#qryland2_" + strs_id).on("click", function(event) {
				
				
				if ($("#qryLand_tab5_" + strs_id).html()=="")
				{
					GetLandSecInfoNlsc(city,sect,'qryLand_tab5_'+strs_id); 
				}
			//});
			strs_id++;
		}, 500);		


		

	}
}

//取得地段資訊
function GetLandSecInfoNlsc( city,sect,target){
	if(city=="")//代表沒縣市
		return;
	if(sect=="")//代表沒段
		return;
	var url = "https://api.nlsc.gov.tw/other/GetLandSecInfoNlsc/"+city+"/"+sect.substr(0,4);
	if (sect.indexOf("-")>-1){
		var sno = sect.split("-")[1];
		if(sno !=""){
			url = "https://api.nlsc.gov.tw/other/GetLandSecInfoNlsc/"+city+"/"+sect.substr(0,4)+"/"+sno;
		}
	}
	$("#" + target).empty();

		$.ajax({
			type: "GET",
//			url: "./json/LandSecInfo.jsp",
			url: url,
			//timeout: 300000,
			dataType: "xml",
			error: function(xhr) {
				console.log(xhr.responseText);
				hideSendMsg();
				showMessage("地段資訊 查詢失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				showSendMsg("地段資訊查詢中");
			},
			success: function(xml) {
				hideSendMsg();
				var s =0;
				if(!isObj(xml)){
					return;
				}
				else{
					$(xml).find('SysdatSecBean').each(function(){
						var city = $(this).find('city').text();
						var ldcode = $(this).find('ldcode').text();
						var scNoExt = $(this).find('scNoExt').text();
						if (scNoExt=="Z"){ //把Z  轉成  "無"
							scNoExt = "無";
						}

						var str ="<table border='1' cellpadding='0' cellspacing='0' width='300' bordercolor='#FFFFFF'>"
						+"	<tbody>"
						+"		<tr>"
						+"			<th colspan='2'><center>"
						+"				<font color='#FFFFFF'><b></b>段籍屬性</font>"
						+"			</center></th>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left' width='42%'>縣市</td>"
						+"			<td class='right' >"+$(this).find('city').text()+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>地政事務所</td>"
						+"			<td class='right' >"+$(this).find('ldcode').text()+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left' >段代碼</td>"
						+"			<td class='right' >"+$(this).find('scNo').text()+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>段延伸碼</td>"
						+"			<td class='right' >"+scNoExt+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>鄉鎮市區代碼</td>"
						+"			<td class='right' >"+$(this).find('town').text()+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>測量方法</td>"
						+"			<td class='right'>"+getMeasurText($(this).find('svway').text())+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>測量類別</td>"
						+"			<td class='right'>"+getMeasurTypeText($(this).find('svType').text())+"</td>"
						+"		</tr>"
//						+"		<tr>"
//						+"			<td class='left'>成圖方式</td>"
//						+"			<td class='right'>"+$(this).find('mapok').text()+"</td>"
//						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>成圖年月</td>"
						+"			<td class='right'>"+$(this).find('mYear').text()+"-"+$(this).find('mMonth').text()+"</td>"
						+"		</tr>"
						+"		<tr>"
						+"			<td class='left'>坐標系統</td>"
						+"			<td class='right'>"+getCoorSysText($(this).find('coor').text())+"</td>"
						+"		</tr>";
//						if ($(this).find('wornst').text()!="0"){
//							str +="		<tr>"
//							+"			<td class='left'>破損情形</td>"
//							+"			<td class='right'>"+getWornstText($(this).find('wornst').text())+"</td>"
//							+"		</tr>";
//						}
//						if ($(this).find('errst').text()!="0"){
//							str +="		<tr>"
//							+"			<td class='left'>誤謬情形</td>"
//							+"			<td class='right'>"+getErrstText($(this).find('errst').text())+"</td>"
//							+"		</tr>";
//						}
						if ($(this).find('slprt').text()!="0.0"){
							str +="		<tr>"
							+"			<td class='left'>山坡地佔比例</td>"
							+"			<td class='right'>"+$(this).find('slprt').text()+"</td>"
							+"		</tr>";
						}
						if ($(this).find('urbnrt').text()!="0.0"){
							str +="		<tr>"
							+"			<td class='left'>都市計畫區比例</td>"
							+"			<td class='right'>"+$(this).find('urbnrt').text()+"</td>"
							+"		</tr>";
						}
						if ($(this).find('rplrt').text()!="0.0"){
							str +="		<tr>"
							+"			<td class='left'>重劃保留地比例</td>"
							+"			<td class='right'>"+$(this).find('rplrt').text()+"</td>"
							+"		</tr>";
						}
//						str +="	<tr>"
//						+"			<td class='left'>總圖幅數</td>"
//						+"			<td class='right'>"+$(this).find('amount').text()+"</td>"
//						+"		</tr>";
						str +="	<tr>"
						+"			<td class='left'>比例尺</td>"
						+"			<td class='right'>"+$(this).find('scale').text()+"</td>"
						+"		</tr>";
//						str +="	<tr>"
//						+"			<td class='left'>面積</td>"
//						+"			<td class='right'>"+$(this).find('area').text()+"公頃</td>"
//						+"		</tr>";
//						str +="	<tr>"
//						+"			<td class='left'>筆數</td>"
//						+"			<td class='right'>"+$(this).find('recnt').text()+"</td>"
//						+"		</tr>";
						if ($(this).find('dDate').text()!="0"){
							str +="	<tr>"
							+"			<td class='left'>數化日期</td>"
							+"			<td class='right'>"+$(this).find('dDate').text()+"</td>"
							+"		</tr>";
						}
						else{
							str +="	<tr>"
							+"			<td class='left'>數化日期</td>"
							+"			<td class='right'>-</td>"
							+"		</tr>";
						}

						if ($(this).find('rYear').text()!="0"){
							str +="		<tr>"
							+"			<td class='left'>預計重測年度</td>"
							+"			<td class='right'>"+$(this).find('rYear').text()+"</td>"
							+"		</tr>";
						}
//						str +="		<tr>"
//						+"			<td class='left'>左下角縱坐標</td>"
//						+"			<td class='right'>"+$(this).find('xMin').text()+"</td>"
//						+"		</tr>"
//						+"		<tr>"
//						+"			<td class='left'>左下角橫坐標</td>"
//						+"			<td class='right'>"+$(this).find('yMin').text()+"</td>"
//						+"		</tr>"
//						+"		<tr>"
//						+"			<td class='left'>右上角縱坐標</td>"
//						+"			<td class='right'>"+$(this).find('xMax').text()+"</td>"
//						+"		</tr>"
//						+"		<tr>"
//						+"			<td class='left'>右上角橫坐標</td>"
//						+"			<td class='right'>"+$(this).find('yMax').text()+"</td>"
//						+"		</tr>";
						str +="	</tbody>"
						+"</table>";
						$("#" + target).html(str);
					});
				}
			}
		});
}



//分頁顯示
function get_selected_data(t){
	$(function(){
		var initPagination = function() {
			var num_entries = $("#hiddenresult div.result").length;
			 var num =  parseInt(t);
			$("#Pagination").pagination(num_entries, {
				num_edge_entries: 1, //邊緣頁數
				num_display_entries: 4, //主體頁數
				current_page:num, //每頁幾筆
				callback: pageselectCallback,
				items_per_page:1 
			});
		 }();
		 
		function pageselectCallback(page_index, jq){
			var new_content = $("#hiddenresult div.result:eq("+page_index+")").clone();
			$("#Searchresult").empty().append(new_content); 
			set_abc(page_index);
			chk_alllayer();
			return false;
		}
	}
	);

}

//地號著色
function colorAtion(x,y,office,sect,landno,panYN,colorset){

   if($("#"+colorset).css("display") == "none"){
	   $("#"+colorset).show();
//	   return;
   }


	if(office==""||sect==""||landno=="")
		return;
	var type = "2";
	if($.support.msie8){//檢查是不是ie8
		type = "1";
	}
	var landcolor =  $('#'+colorset+'_set').text();

	if(!isObj(landcolor)){				 
		landcolor = "#F70101";
	}

	var mydata = {
		type:type,flag:'2',office:office,sect:sect,landno:landno,alpah:'0.5f',imgflag:'1'
	};

	if(isObj(landcolor)){	
		if (landcolor != "#F70101"){
			var colordata = {
				color:landcolor
			};	
			mydata = $.extend(mydata, colordata);
		}
	}

	$.ajax({
		type: "post",
		url: "https://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex",
//		url: "./json/landcolor.jsp",
		timeout: 300000,
		dataType: "jsonp",
		data:mydata,
		error: function(xhr) {
			showMessage("地籍圖著色失敗","msg_panel",3000);
		},
		beforeSend:function(){
			showProcessMsg("資料著色中", "msg_panel", "show");
		},
		success: function(json) {
			showProcessMsg("", "msg_panel", "hide");
			var s =0;
			if(isObj(json[0].msg)){
				landstr = json[0].msg;
				alert(landstr);
				return;
			}

			for(var i=0; i<json.length; i++){
				var jsondata = json[i];
				for(var s=0; s<json[i].length; s++){
					var jsondata = json[i][s];							

					if(isObj(jsondata.landno)){
					}
					else{
						var imp_lonlat_1 = ol.proj.transform([parseFloat(jsondata.lx), parseFloat(jsondata.ly)], fromProjection, toProjection);
//								console.log( imp_lonlat_1);
						var imp_lonlat_2 = ol.proj.transform([parseFloat(jsondata.rx), parseFloat(jsondata.ry)], fromProjection, toProjection);
						var extent = [imp_lonlat_1[0], imp_lonlat_1[1], imp_lonlat_2[0], imp_lonlat_2[1]];
				

						var projection = new ol.proj.Projection({
						  code: 'hResultImg',
						  units: 'pixels',
						  extent: extent
						});

						var uri = 'data:image/png;base64,'+jsondata.image;


						var graphic =	new ol.layer.Image({
							  source: new ol.source.ImageStatic({
								url:uri,
								//projection: projection,
								imageExtent: extent
							  })
						});
						graphic.setVisible(true);
						map.addLayer(graphic);
						
						if($.support.msie8){//檢查是不是ie8
							 urls = 'https://landmaps.nlsc.gov.tw/S_Maps/'+$.base64.decode(jsondata.image);
						}

					}

				}
			}
//			$("#"+colorset).hide();
		}
	});
	if(panYN=="Y"){
		var xy = ol.proj.transform([parseFloat(x), parseFloat(y)], fromProjection, toProjection);
		map.getView().setCenter(xy);
	}
}

//取得所有圖層

function get_layer_html(type,title){
	$('#layerlist_dialog').dialog('close');
	if(trim($("#layer_list").text())== ""){
		$.ajax({
			type: "POST",
			url: home_titel+"/pro/extra_layer.html",
			success: function(response) {
				$("#layer_list").html(response);
			}
		});
	}
	$("#Mapslayer").dialog('option', 'title', title);
	if(type=="3dlayer"){
	 $("#Mapslayer" ).dialog( "option", "buttons",
			 {
				"開啟Google Earth": function() {
					 right_point('Earth');
				}
			}
		);
	}
	else{
	 $("#Mapslayer" ).dialog( "option", "buttons",{});
	 setTimeout(function () {addselectLayer("ALL");}, 300)
	}

	$('#Mapslayer').dialog({height: $('#content_map').height()});
	$('#Mapslayer').dialog('open');

}
var in3D_type;
function get_3dlayer_html(type,title,ontype){
	in3D_type = ontype;
		$.ajax({
			type: "POST",
			url: "./pro/3d_layer.jsp",
			success: function(response) {
				$("#3d_list").html(response);

			}
		});

	$("#Maps3dlayer").dialog('option', 'title', title);
	$('#Maps3dlayer').dialog('open');
}

//開啟3D地圖list
function show3dMap(){
	var tmpcroodnowcenter = map.getView().getCenter();
	var croodnowcenter =  ol.proj.transform([tmpcroodnowcenter[0], tmpcroodnowcenter[1]],toProjection, fromProjection);
	window.open("http://gee3d.nlsc.gov.tw/nlscgee/?x="+croodnowcenter[1].toFixed(6)+"&y="+croodnowcenter[0].toFixed(6)+"&layer=1&lod=16&angle=60");
}
//開啟3D地圖
function open_3d(type){
	if (in3D_type=='icon')
	{
		var tmpcroodnowcenter = map.getView().getCenter();
		click_lonlat =  ol.proj.transform([tmpcroodnowcenter[0], tmpcroodnowcenter[1]],toProjection, fromProjection); 
	}
	var cbxVehicle = new Array();
	var  txt = "";
	$('input:checkbox:checked[name="'+type+'"]').each(function(i) { cbxVehicle[i] = this.value; });
	txt = cbxVehicle.join(",");
	if(txt == ""){
		alert("您未勾選任何圖層！");
		return false;
	}
	$( "#Maps3dlayer" ).dialog("close");
	var url ="http://gee3d.nlsc.gov.tw/nlscgee/?x="+click_lonlat[1].toFixed(6)+"&y="+click_lonlat[0].toFixed(6)
							+"&layer="+txt+"&lod=16&angle=60";
	window.open(url);

}


function removeHighlighting(highlightedElements){
    highlightedElements.each(function(){
        var element = $(this);
        element.replaceWith(element.html());
    })
}


function search_layer(type,target){
	var value ="";
	if (type=="search")
	{
		 value = $("#search_layer").val().toUpperCase();
	}
	else{
		$("#search_layer").val('');
	}
	
	removeHighlighting($("#layer_list .allextra tr em"));

	$("#layer_list .allextra tr").each(function(index) {
			$row = $(this);
			
			var $tdElement = $row.find("td:eq(1)");
			var id = $tdElement.text().toUpperCase();
			var matchedIndex = id.indexOf(value);

			if (matchedIndex <=-1) {
				$row.hide();
			}
			else {
				$row.show();
			}
	});
}


function search_mylayer(type,target){
	var value ="";
	if (type=="search")
	{
		 value = $("#search_mylayer").val().toUpperCase();
	}
	else{
		$("#search_mylayer").val('');
	}
	
	removeHighlighting($("#mylayerlist .allextra tr em"));

	$("#mylayerlist .allextra tr").each(function(index) {
			$row = $(this);
			
			var $tdElement = $row.find("td:eq(1)");
			var id = $tdElement.text().toUpperCase();
			
			var matchedIndex = id.indexOf(value);

			if (matchedIndex <=-1) {
				$row.hide();
			}
			else {
				$row.show();
			}
	});
}


//取得地籍資料
function catchLandFlag( city,sect,landno,target){

	if(city=="")//代表沒縣市
		return;
	if(sect=="")//代表沒段
		return;
	if(landno=="")//代表沒地號
		return;
	$("#" + target).empty();

		$.ajax({
			type: "post",
//			url: "./json/landdata.jsp",
			url: "https://api.nlsc.gov.tw/S09_Ralid/getLandInfo",
			//timeout: 300000,
			dataType: "json",
			data:{city:city,sect:sect.substr(0,4),landno:parseLandNo8(landno)},

//			data:{flag:'2',office:'BC',sect:'0369',landno:'05330000',alpah:'0.5f'},
			error: function(xhr) {
			alert(xhr.responseText);
				hideSendMsg();
				showMessage("土地資訊 查詢失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				showSendMsg("土地資訊查詢中");
			},
			success: function(json) {
				hideSendMsg();
				var s =0;
				if(!isObj(json)){
					return;
				}
				else{
					var aa10 = "";
					var aa11 = "(空白)";
					var aa12 = "(空白)";
					var aa27 = "--";
					var aa16 = "--";
					var aa05 = "--";
					if(isObj(json.ralid.AA10)){
						
						aa10 = json.ralid.AA10+" 平方公尺";
					}
					if(isObj(json.ralid.AA11)){
						
						aa11 = $.base64.atob(json.ralid.AA11,true);
					}
					if(isObj(json.ralid.AA12)){
						
						aa12 = $.base64.atob(json.ralid.AA12,true);
					}
					if(isObj(json.ralid.AA27)){
						aa27 ="民國"+json.ralid.AA27.toString().substr(0,3)+"年"+json.ralid.AA27.toString().substr(3,2)+"月" ;
					}
					if(isObj(json.ralid.AA16)){
						aa16 =json.ralid.AA16+" 元/平方公尺"; 
					}
					if(isObj(json.ralid.AA05)){
						aa05 ="民國"+json.ralid.AA05.toString().substr(0,3)+"年"+json.ralid.AA05.toString().substr(3,2)+"月"+json.ralid.AA05.toString().substr(5,2)+"日" ;
					}
					var str ="<table border='1' cellpadding='0' cellspacing='0' width='300' bordercolor='#FFFFFF'>"
					+"	<tbody>"
					+"		<tr>"
					+"			<th colspan='2'><center>"
					+"				<font color='#FFFFFF'><b></b>土地資訊</font>"
					+"			</center></th>"
					+"		</tr>"
					+"		<tr>"
					+"			<td class='left' width='35%'>面積</td>"
					+"			<td class='right' >"+aa10+"</td>"
					+"		</tr>"
					+"		<tr>"
					+"			<td class='left'>使用分區</td>"
					+"			<td class='right' colspan='3'>"+aa11+"</td>"
					+"		</tr>"
					+"		<tr>"
					+"			<td class='left' >使用地類別</td>"
					+"			<td class='right' colspan='3'>"+aa12+"</td>"
					+"		</tr>"
//					+"		<tr>"
//					+"			<td class='left'>公告現值年月</td>"
//					+"			<td class='right' >"+aa27+"</td>"
//					+"		</tr>"
					+"		<tr>"
					+"			<td class='left'>登記日期</td>"
					+"			<td class='right' >"+aa05+"</td>"
					+"		</tr>"
					+"		<tr>"
					+"			<td class='left'>公告土地現值</td>"
					+"			<td class='right'>"+aa16+"</td>"
					+"		</tr>"
					+"		<tr>"
					+"			<td class='left'>權利人類別</td>"
					+"			<td class='right'>"+getLcdetypeFlag(json.lcdetype)+"</td>"
					+"		</tr>"
//					+"		<tr>"
//					+"			<td colspan='2'><center><a href='javascript:void(0);' class='css_btn_class' onclick=catchBuildFlag('"+json.buildList+"','BuildInfo')><FONT COLOR='#FFFFFF'>建號查詢</FONT></a></center></td>"
//					+"		</tr>"
					+"		<tr>"
					+"			<td colspan='2'><font size='2' color='red'><b>本查詢資料有時間落差，實際應以地政事務所地籍資料庫記載為準。</b></font></td>"
					+"		</tr>"
					+"	</tbody>"
					+"</table>";
					$("#" + target).html(str);
					var landid= target.split("_")[2];
					if(isObj(json.buildList) && json.buildList.length >0 ){
						$("#qrybulid_" + landid).show(); 
						getBuildFlag(json.buildList,'qrybulid_tab3_'+landid);
					}
					
					if(!isObj(json.land)){
						$("#qrypubland_" + landid).hide();
					}
					else{
						$("#qrypubland_" + landid).show();
						getPublicFlag(json.land,'qrypubland_tab4_'+landid);
					}

					
				}
			}
		});
}
				


function getbase_layer(){
	
	if(trim($("#QmapID").text())== ""){
		$.ajax({
			type: "POST",
			url: home_titel+"/pro/001_layer.html",
			dataType: "html",
			success: function(response) {
				$(response).find("tr").find("td:eq( 1 )").find("a").each(function(i){
					var text = '<li><input  type="radio" name="Qmap_type"  id="Qmap_type"  value="'+$(this).text()+'" onclick='+$(this).attr('onclick')+' >'+$(this).text()+'</li>';
					if (i==0)
					{
						text = '<li><input  type="radio" name="Qmap_type"  id="Qmap_type"  value="'+$(this).text()+'" onclick='+$(this).attr('onclick')+' checked>'+$(this).text()+'</li>';
					}
					$("#QmapID").append(text);
				});

			}
		});
	}
	if(trim($("#QmapID2").text())== ""){
		$.ajax({
			type: "POST",
			url: home_titel+"/pro/001_layer2.html",
			dataType: "html",
			success: function(response) {
				$(response).find("tr").find("td:eq( 1 )").find("a").each(function(i){
					var text = '<li><input  type="radio" name="Qmap2_type"  id="Qmap2_type"  value="'+$(this).text()+'" onclick='+$(this).attr('onclick')+' >'+$(this).text()+'</li>';
					if (i==0)
					{
						text = '<li><input  type="radio" name="Qmap2_type"  id="Qmap2_type"  value="'+$(this).text()+'" onclick='+$(this).attr('onclick')+' checked>'+$(this).text()+'</li>';
					}
					$("#QmapID2").append(text);
				});

			}
		});
	}
}

//取得建物資料
function getBuildFlag(json,target){
	if(!isObj(json)){
		$("#" + target).html("查無建號資料");
	}
	else{

		var buildstr ="";
		
		if(isObj(json) && json.length >0 ){
//			buildstr ="<table >";
			for (var i=0;i<json.length;i++){
				  var buildno = json[i].substring(0, 5)+ "-" + json[i].substring(5, 8);
				   buildstr +="<tr  height='20'>"
					+"			<td class='center' >"+buildno+"</td>"
					+"		   </tr>";
			}
//			buildstr +="</table>";

			var str ="<table border='1' cellpadding='0' cellspacing='0' width='250'  style='overflow-y:scroll; min-height:40px' bordercolor='#FFFFFF'>"
			+"	<tbody>"
			+"		<tr  height='20'>"
			+"			<th ><center><font color='#FFFFFF'><b>建號筆數："+json.length+"</b> </font></center></th>"
	//		+"			<td class='right' >"+buildstr+"</td>"
			+"		</tr>"
			+"		"+buildstr
			+"	</tbody>"
			+"</table>";

			$("#" + target).html(str);
		}
		else{
			var str ="<table border='1' cellpadding='0' cellspacing='0' width='250'  bordercolor='#FFFFFF'>"
			+"	<tbody>"
			+"		<tr height='20'>"
			+"			<td ><center><b>查無建號資料</b> </center></td>"
			+"		</tr>"
			+"	</tbody>"
			+"</table>";

			$("#" + target).html(str);
		}
	}
//$("#" + target).dialog('open');
}

// 權利人類別名稱
var Lcdetypename = {
		"lcde_1" : "本國人",
		"lcde_2" : "外國人",
		"lcde_3" : "國有",
		"lcde_4" : "省市",
		"lcde_5" : "縣市",
		"lcde_6" : "鄉鎮市",
		"lcde_7" : "本國私法人",
		"lcde_8" : "外國法人",
		"lcde_9" : "祭祀公業",
		"lcde_a" : "其他",
		"lcde_b" : "銀行法人",
		"lcde_c" : "大陸地區自然人",
		"lcde_d" : "大陸地區法人"
};
//取得權利人資料
function getLcdetypeFlag(json){
	var str = "";

	if(!isObj(json)){
		str ="查無權利人資料";
	}
	else{

		var lcdetstr ="";
		var s1 = 0;
        $.each(json , function(applier, a_val){
			if (applier.indexOf("lcde_1")>-1){
				if (parseFloat(a_val)>0)
				{	
					s1 =s1+parseFloat(a_val);
				}
			}
        }); 
		if (s1>0)
		{
			if (s1<=1){
				str +=Lcdetypename["lcde_1"]+":"+(s1*100).toFixed(2)+"%";
			}else{
				str +=Lcdetypename["lcde_1"]+":100%";
			}
		}
        $.each(json , function(applier, a_val){
			if (applier.indexOf("lcde_")>-1){
				var s = parseFloat(a_val);
				if (applier.indexOf("lcde_1")==-1){
					if (parseFloat(a_val)>0)
					{	
						if (a_val<=1){
							if (str!=""){
								str+="<br>";
							}
							str +=Lcdetypename[applier]+":"+(a_val*100).toFixed(2)+"%" ;
						}else{
							if (str!=""){
								str+="<br>";
							}
							str +=Lcdetypename[applier]+":100%" ;
						}
					}
				}
			}
        });
	}
	return str;
}

//取得公有土地資料
function getPublicFlag(json,target){
	if(!isObj(json)){
		$("#" + target).html("查無公有土地資料");
	}
	else{

		var buildstr ="";
		if(isObj(json) ){

			var aa05 = "(空白)"; //登記日期
			var aa06 = "(空白)"; //登記原因
			var aa08 = "(空白)"; //地目
			var aa16 = "--"; //公告現值
			var aa17 = "--";
			if(isObj(json.AA05)){
				aa05 = json.AA05.toString().substr(0,3)+"/"+json.AA05.toString().substr(3,2)+"/"+json.AA05.toString().substr(5,2);
			}
			if(isObj(json.AA06)){
				
				aa06 = json.AA06;
			}
			if(isObj(json.AA08)){
				
				aa08 =json.AA08;
			}
			if(isObj(json.AA16)){
				aa16 =json.AA16+" 元/平方公尺"; 
			}
			if(isObj(json.AA17)){
				aa17 =json.AA17+" 元/平方公尺"; 
			}
			var str ="<table border='1' cellpadding='0' cellspacing='0' width='300' bordercolor='#FFFFFF'>"
			+"	<tbody>"
			+"		<tr>"
			+"			<td class='left' width='120'>登記日期</td>"
			+"			<td class='right' width='180'>"+aa05+"</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<td class='left'>登記原因</td>"
			+"			<td class='right' >"+aa06+"</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<td class='left' >地目</td>"
			+"			<td class='right'>"+aa08+"</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<td class='left'>公告現值</td>"
			+"			<td class='right' >"+aa16+"</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<td class='left'>公告地價</td>"
			+"			<td class='right'>"+aa17+"</td>"
			+"		</tr>"
			+"		<tr>"
			+"			<th colspan='2'><center>"
			+"				<font color='#FFFFFF'><b></b>公有土地所有權人資料</font>"
			+"			</center></th>"
			+"		</tr>"
			+"		<tr>"
			+"			<td colspan='2'>"+getPublicPeoFlag(json.userList)+"</td>"
			+"		</tr>"
			+"	</tbody>"
			+"</table>";


			$("#" + target).html(str);
		}
		else{
			var str ="<table border='1' cellpadding='0' cellspacing='0' width='250'  bordercolor='#FFFFFF'>"
			+"	<tbody>"
			+"		<tr height='20'>"
			+"			<td ><center><b>查無公有土地資料</b> </center></td>"
			+"		</tr>"
			+"	</tbody>"
			+"</table>";

			$("#" + target).html(str);
		}
	}
}

//取得公有土地所有權人資料
function getPublicPeoFlag(json){
	var str = "";
	if(!isObj(json)){
		str ="查無所有權人資料";
	}
	else{
	 str ="<table  cellpadding='0' cellspacing='0'  bordercolor='#FFFFFF'>"
		+"	<tbody>"
        $.each(json , function(x, i){
			var vdate = ""; //登記日期
			var vcause = "(空白)"; //登記原因
			var vname = "(空白)"; //所有權人
			var vprice = "--"; //申報地價

			if(isObj(i.date)){
				vdate = i.date.toString().substr(0,3)+"/"+i.date.toString().substr(3,2)+"/"+i.date.toString().substr(5,2);
			}
			if(isObj(i.cause)){
				
				vcause = i.cause;
			}
			if(isObj(i.name)){
				
				vname =i.name;
			}
			if(isObj(i.price)){
				vprice =i.price+" 元/平方公尺"; 
			}


//			 str +="		<tr>";
//			 str +="			<td class='left' width='120'>登記次序</td>";
//			 str +="			<td class='right'width='180' >"+i.seq+"</td>";
//			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' width='120'>登記日期</td>";
			 str +="			<td class='right'width='180' >"+vdate+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >登記原因</td>";
			 str +="			<td class='right' >"+vcause+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >所有權人</td>";
			 str +="			<td class='right' >"+vname+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >統一編號</td>";
			 str +="			<td class='right' >"+i.id+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >所有權人類別</td>";
			 str +="			<td class='right' >"+i.type+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >權利範圍類別</td>";
			 str +="			<td class='right' >"+i.scope+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >權利範圍持分<br>分母</td>";
			 str +="			<td class='right' >"+i.denominator+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >權利範圍持分<br>分子</td>";
			 str +="			<td class='right' >"+i.numerator+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >申報地價</td>";
			 str +="			<td class='right' >"+vprice+"</td>";
			 str +="		</tr>";
			 str +="		<tr>";
			 str +="			<td class='left' >管理者名稱</td>";
			 str +="			<td class='right' >"+i.manage+"</td>";
			 str +="		</tr>";
 			 str +="		<tr>";
			 str +="			<td  colspan='2' ><hr></td>";
			 str +="		</tr>";
        });

	 str +="	<tbody>";
	 str +="</table>";
	}

	return str;
}

function setOverlay_layer(overlay){
	if(trim($("#layer_list").text())== ""){
		$.ajax({
			type: "POST",
			url: home_titel+"/pro/extra_layer.html",
			success: function(response) {
				$("#layer_list").html(response);
				$.ajax({
					type: "POST",
					url: home_titel+"/pro/geojson_layer.html",
					success: function(response) {
						$("#layer_list #hor-list").append("<tr><td colspan='3'><font color='#005BE7' size='3'><b>向量圖層</b></font></td></tr>");
						$("#layer_list #hor-list").append($(response).find("tr"));
					}
				});
				$("#layer_list").find("tr").find("td:eq(0)").find("span").each(function(i){
					if (overlay==$(this).attr('class').replace("s_",'').replace(" square_purple",''))
					{
						$("#layer_list").find("tr").find("td:eq( 1 )").find("a").each(function(s){
							if(i==s){
								if ("DMAPS" ==overlay){								
									$("#land_layer").val("Y");//初次 使用 地籍圖  時加入  圖資說明的 Dialog(判斷之前有開所以設 Y )
								}
								$(this).trigger( "click" );
								
							}
						});
					}

				});
			}
		});
	}
	else{
		$("#layer_list").find("tr").find("td:eq(0)").find("span").each(function(i){
			if (overlay==$(this).attr('class').replace("s_",'').replace(" square_purple",''))
			{
				$("#layer_list").find("tr").find("td:eq( 1 )").find("a").each(function(s){
					if(i==s){
						if ("DMAPS" ==overlay){								
							$("#land_layer").val("Y");//初次 使用 地籍圖  時加入  圖資說明的 Dialog(判斷之前有開所以設 Y )
						}
						$(this).trigger( "click" );

					}
				});
			}
		});
	}

}


//取得地籍圖
function catchLandQry(county,parno){
	clearLayer(posvectors);
	var type = "2";
	var landcolor = $("#SelectColorByLand").text();
	if(!isObj(landcolor)){				 
		landcolor = "#F70101";
	}

	var mydata = {
		type:type,flag:'3',county:county,parno:parno,alpah:'0.5f',imgflag:1
	};
	if(isObj(landcolor)){	
		if (landcolor != "#F70101"){
			var colordata = {
				color:landcolor
			};	
			mydata = $.extend(mydata, colordata);
		}
	}


		$.ajax({
			type: "post",
//			url: "qryTileMapIndex (5).json",
//			url: "./json/landcolorlist.jsp",
			url: "https://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex",
			timeout: 300000,
			dataType: "jsonp",
			data:mydata,
			error: function(xhr) {
				showMessage("地籍圖讀取失敗","msg_panel",3000);
		    },
		    beforeSend:function(){
				showProcessMsg("資料查詢中", "msg_panel", "show");
			},
			success: function(json) {
				showProcessMsg("", "msg_panel", "hide");
				var s =0;
				if(isObj(json[0][0].msg)){
					landstr = json[0][0].msg;
					alert(landstr);
					return;
				}
				else{
					var centerextent =[];
					for(var i=0; i<json.length; i++){
						var jsondata = json[i];
						for(var s=0; s<json[i].length; s++){
							var jsondata = json[i][s];							

							if(isObj(jsondata.landno)){
							}
							else{
								var imp_lonlat_1 = ol.proj.transform([parseFloat(jsondata.lx), parseFloat(jsondata.ly)], fromProjection, toProjection);
//								console.log( imp_lonlat_1);
								var imp_lonlat_2 = ol.proj.transform([parseFloat(jsondata.rx), parseFloat(jsondata.ry)], fromProjection, toProjection);
								var extent = [imp_lonlat_1[0], imp_lonlat_1[1], imp_lonlat_2[0], imp_lonlat_2[1]];
								if (s==1)
								{
									centerextent = [imp_lonlat_1[0], imp_lonlat_1[1], imp_lonlat_2[0], imp_lonlat_2[1]];
//									console.log(centerextent);
								}
								
	
								var projection = new ol.proj.Projection({
								  code: 'hResultImg',
								  units: 'pixels',
								  extent: extent
								});
	
								var uri = 'data:image/png;base64,'+jsondata.image;


								var graphic =	new ol.layer.Image({
									  source: new ol.source.ImageStatic({
										url:uri,
										projection: projection,
										imageExtent: extent
									  })
								});
								graphic.setVisible(true);
								map.addLayer(graphic);
								
								if($.support.msie8){//檢查是不是ie8
									 urls = 'https://landmaps.nlsc.gov.tw/S_Maps/'+$.base64.decode(jsondata.image);
								}
								map.getView().fit(centerextent, map.getSize());
								var sectNO = json[i][0].office+json[i][0].sect;
								if (json[i][0].extend!=""){
									sectNO +="-"+json[i][0].extend;
								}
								var lonlat = ol.proj.transform([parseFloat(map.getView().getCenter()[0]),parseFloat(map.getView().getCenter()[1])], toProjection, fromProjection);
								flytopos('section',lonlat[0],lonlat[1],'qry_land.png',
										$.base64.atob(json[i][0].officeStr,true)+
										"所 ("+sectNO+")"+
										$.base64.atob(json[i][0].sectStr,true)+" "+parseLandNoBrief(json[i][0].landno)+"地號" 
										,'','','');
								}
	
							}
						}
						map.getView().fit(vectors_posvectors.getExtent(), map.getSize());


				}
				changeToolImg('none');
				toggleControl('none');
			}
		});
}


//周邊檢索
function catchMarkpos(){	

	var v_class_mark =$("#class_mark").val();
	var v_cfgmark =$("#cfgmark").val();

	if(v_cfgmark===""){
		showMessage("請先勾選地標類別，再點選檢索", "msg_panel","5000");
		return;
	}	
	var polygonBox ;
	var btm_left = $("#btm_left").val().split(",");
	var top_right = $("#top_right").val().split(",");
	if($("#markpos_type").val()=="drawrange"){
		if ((parseFloat($("#markpos_area").val())/1000000)>100){
			showMessage("查詢範圍超出 100 平方公里，請重新框選", "msg_panel","50000");
			return;
		}
		polygonBox =  btm_left[0] + "," + btm_left[1] + ';'+ btm_left[0] + "," + top_right[1] + ';'+top_right[0] + "," + top_right[1] + ';'+top_right[0] + "," + btm_left[1] ;
	}else{				
		polygonBox =  $("#markpos_center").val();
	}
	var v_radius = 500 ;

	if (isObj($("#markpos_radius").find('option:selected').val()) ){
		v_radius =$("#markpos_radius").find('option:selected').val();
	}
	else{
		if (isObj($("#markpos_radius").val()) ){
			v_radius =$("#markpos_radius").val();
		}
	}
	if (!$.isNumeric(v_radius)) {
		showMessage("「半徑」輸入值不是數值", "msg_panel", "5000");
		return;
	}
	else{
		if(v_radius <= 0 ) {
			showMessage("「半徑」請輸入大於「0」的數字", "msg_panel", "5000");
			$("#markpos_radius").focus();
			return;
		}
		if(v_radius > 3000 ) {
			showMessage("「半徑」輸入限於「3000」公尺以內", "msg_panel", "5000");
			$("#markpos_radius").focus();
			return;
		}
		if(v_radius <= 10 ) {
			showMessage("「半徑」輸入需大於「10」公尺", "msg_panel", "5000");
			$("#markpos_radius").focus();
			return;
		}
	}


	$.ajax({
		type: "POST",
		url: "./pro/MarkCluster_markpos.action",
		data:{'marktype':$("#markpos_type").val(),'markclass':v_class_mark,'mark':v_cfgmark,'radius':v_radius,'polygonBox':polygonBox},
		error: function(xhr) {
			showMessage("地標查詢失敗", "msg_panel","3000");
		},
		beforeSend:function(){
				showProcessMsg("檢索中", "msg_panel","show");
//						$("#"+target).show('slow');
		},
		success: function(json) {
			showProcessMsg("", "msg_panel","hide");	
			$("#markpos_type").val("Circle");
			if (isObj(selectCluster))
				 map.removeInteraction(selectCluster);
			removeMarkPos();//移出之前的定位點
			if (isObj(json.code)){
				alert(json.message);
				return
			}
			$( '#markposMapList' ).dialog('open');
			folder_view('adg','CollapsiblePanel1');
			var tabselect="";
			var cet = $("#markpos_center").val().split(",");
			var cet_lonlat = ol.proj.transform([parseFloat(cet[0]),parseFloat(cet[1])], fromProjection, toProjection);
			flytomarker('markpos',cet[0],cet[1],'map_pin-32.png',"查詢中心位置");
			if (isObj(json.Qrygroup1)){
				tabselect = "0";
				$("#markpos_li_1").show();
				if (json.Qrygroup1.length>0){
					var showtext ="";
							showtext+="<li ><font SIZE='4' COLOR='red' >資料筆數:"+json.Qrygroup1_count+"</font>";
							if (json.Qrygroup1_count > 300 ){
								showtext+="<font SIZE='2' COLOR='#0033CC' >&nbsp;&nbsp;(只顯示300筆)</font>";
							}
							showtext+="<font class='neighDistance'>距離(公尺)</font></li>";
					var cls = "";
					for (var i = 0, len = json.Qrygroup1.length; i < len; i++) {
							cls = "";
							if ((i%2)==0)
								cls = "odd";
							var lonlat = ol.proj.transform([parseFloat(json.Qrygroup1[i].lon),parseFloat(json.Qrygroup1[i].lat)], fromProjection, toProjection);
							var str = [[cet_lonlat[0],cet_lonlat[1]] ,[lonlat[0],lonlat[1]]];
							var trnsStr = new ol.geom.LineString(str);
							if (cls===""){
								showtext+="<li class='hate'>";
							}									
							showtext+="<li class = 'markpos_li "+cls+"' id= '"+json.Qrygroup1[i].id+"' markgroup = '0'  li_class='"+cls+"' xy='"+json.Qrygroup1[i].lon+","+json.Qrygroup1[i].lat+"' name= '"+json.Qrygroup1[i].name+"'  distance ='"+json.Qrygroup1[i].distance+"' ><sapn>"+json.Qrygroup1[i].name+"</sapn><font class='neighDistance'><strong class='neighNum'>"+json.Qrygroup1[i].distance+"</strong></font>";
							
							showtext+="<div class='marklist'>";
							
							if (json.Qrygroup1[i].addr!=""){
								showtext+="地址："+json.Qrygroup1[i].addr+"<br>";							
							}
							
							if (json.Qrygroup1[i].tel!=""){
								showtext+="電話："+json.Qrygroup1[i].tel+"<br>";									
							}
							showtext+="</div></li>";

							if (cls===""){
								showtext+="</li>";
							}	
							
					}
					addFeaturesCluster(json.Qrygroup1,clusterSource);//
					$("#markpos_li_1_list").html(showtext);
				}
				else{
						$("#markpos_li_1_list").html("<li >查無資料</li>");
				}
			}
			else{
				$("#markpos_li_1_list").empty();
				$("#markpos_li_1").hide();
			}

			if (isObj(json.Qrygroup2)){
				$("#markpos_li_2").show();
				if (tabselect==="")
					tabselect = "1";
				if (json.Qrygroup2.length>0){
					var showtext ="";
							showtext+="<li ><font SIZE='4' COLOR='red' >資料筆數:"+json.Qrygroup2_count+"</font>";
							if (json.Qrygroup2_count > 300 ){
								showtext+="<font SIZE='2' COLOR='#0033CC' >&nbsp;&nbsp;(只顯示300筆)</font>";
							}
							showtext+="<font class='neighDistance'>距離(公尺)</font>";

					var cls = "";
					for (var i = 0, len = json.Qrygroup2.length; i < len; i++) {
							cls = "";
							if ((i%2)==0)
								cls = "odd";
							var lonlat = ol.proj.transform([parseFloat(json.Qrygroup2[i].lon),parseFloat(json.Qrygroup2[i].lat)], fromProjection, toProjection);
							var str = [[cet_lonlat[0],cet_lonlat[1]] ,[lonlat[0],lonlat[1]]];
							var trnsStr = new ol.geom.LineString(str);

							if (cls===""){
								showtext+="<li class='hate'>";
							}									
							showtext+="<li class = 'markpos_li "+cls+"' id= '"+json.Qrygroup2[i].id+"' markgroup = '1' li_class='"+cls+"' xy='"+json.Qrygroup2[i].lon+","+json.Qrygroup2[i].lat+"'  name= '"+json.Qrygroup2[i].name+"' distance ='"+json.Qrygroup2[i].distance+"' ><sapn>"+json.Qrygroup2[i].name+"</sapn><font class='neighDistance'><strong class='neighNum'>"+json.Qrygroup2[i].distance+"</strong></font>";
							
							showtext+="<div class='marklist'>";
							
							if (json.Qrygroup2[i].addr!=""){
								showtext+="地址："+json.Qrygroup2[i].addr+"<br>";							
							}
							
							if (json.Qrygroup2[i].tel!=""){
								showtext+="電話："+json.Qrygroup2[i].tel+"<br>";									
							}
							showtext+="</div></li>";									

							if (cls===""){
								showtext+="</li>";
							}	
							cls="";
					}
					addFeaturesCluster(json.Qrygroup2,clusterSource2);
					$("#markpos_li_2_list").html(showtext);
				}
				else{
						$("#markpos_li_2_list").html("<li >查無資料</li>");
				}

			}
			else{
				$("#markpos_li_2_list").empty();
				$("#markpos_li_2").hide();
			}

			if (isObj(json.Qrygroup3)){
				if (tabselect==="")
					tabselect = "2";
				$("#markpos_li_3").show();
				if (json.Qrygroup3.length>0){
					var showtext ="";
							showtext+="<li ><font SIZE='4' COLOR='red' >資料筆數:"+json.Qrygroup3_count+"</font>";
							if (json.Qrygroup3_count > 300 ){
								showtext+="<font SIZE='2' COLOR='#0033CC' >&nbsp;&nbsp;(只顯示300筆)</font>";
							}
							showtext+="<font class='neighDistance'>距離(公尺)</font>";

					var cls = "";
					for (var i = 0, len = json.Qrygroup3.length; i < len; i++) {
							cls = "";
							if ((i%2)==0)
								cls = "odd";
							var lonlat = ol.proj.transform([parseFloat(json.Qrygroup3[i].lon),parseFloat(json.Qrygroup3[i].lat)], fromProjection, toProjection);
							var str = [[cet_lonlat[0],cet_lonlat[1]] ,[lonlat[0],lonlat[1]]];
							var trnsStr = new ol.geom.LineString(str);

							if (cls===""){
								showtext+="<li class='hate'>";
							}									
							showtext+="<li class = 'markpos_li "+cls+"' id= '"+json.Qrygroup3[i].id+"' markgroup = '2' li_class='"+cls+"' xy='"+json.Qrygroup3[i].lon+","+json.Qrygroup3[i].lat+"'  name= '"+json.Qrygroup3[i].name+"' distance ='"+json.Qrygroup3[i].distance+"' ><sapn>"+json.Qrygroup3[i].name+"</sapn><font class='neighDistance'><strong class='neighNum'>"+json.Qrygroup3[i].distance+"</strong></font>";
						
							showtext+="<div class='addrlist'>";
							
							if (json.Qrygroup3[i].addr!=""){
								showtext+=""+json.Qrygroup3[i].addr+"<br>";							
							}
							
							if (json.Qrygroup3[i].tel!=""){
								showtext+="電話："+json.Qrygroup3[i].tel+"<br>";									
							}
							showtext+="</div></li>";										


							if (cls===""){
								showtext+="</li>";
							}	
							cls="";
					}
					addFeaturesCluster(json.Qrygroup3,clusterSource3);
					$("#markpos_li_3_list").html(showtext);
				}
				else{
						$("#markpos_li_3_list").html("<li >查無資料</li>");
				}

			}
			else{
				$("#markpos_li_3_list").empty();
				$("#markpos_li_3").hide();
			}

//					if (isObj(json.Qrygroup4)){
//						if (tabselect==="")
//							tabselect = "3";
//						$("#markpos_li_4").show();
//						if (json.Qrygroup4.length>0){
//							var showtext ="";
//									showtext+="<li ><font SIZE='4' COLOR='red' >資料筆數:"+json.Qrygroup4_count+"</font>";
//									if (json.Qrygroup4_count > 300 ){
//										showtext+="<font SIZE='2' COLOR='#0033CC' >&nbsp;&nbsp;(只顯示300筆)</font>";
//									}
//									showtext+="<font class='neighDistance'>距離(公尺)</font>";
//									
//
//							var cls = "";
//							for (var i = 0, len = json.Qrygroup4.length; i < len; i++) {
//									cls = "";
//								  if ((i%2)==0)
//										cls = "odd";
//									var lonlat = ol.proj.transform([parseFloat(json.Qrygroup4[i].lon),parseFloat(json.Qrygroup4[i].lat)], fromProjection, toProjection);
//									var str = [[cet_lonlat[0],cet_lonlat[1]] ,[lonlat[0],lonlat[1]]];
//									var trnsStr = new ol.geom.LineString(str);
//									if (cls===""){
//										showtext+="<li class='hate'>";
//									}									
//									showtext+="<li class = 'markpos_li "+cls+"' id= '"+json.Qrygroup4[i].id+"' markgroup = '3'  xy='"+json.Qrygroup4[i].lon+","+json.Qrygroup4[i].lat+"' name= '"+json.Qrygroup4[i].name+"' ><font>"+json.Qrygroup4[i].name+"</font><font class='neighDistance'><strong class='neighNum'>"+json.Qrygroup4[i].distance+"</strong></font>";
//									
//									showtext+="<div class='marklist'>";
//									
//									if (json.Qrygroup4[i].addr!=""){
//										showtext+="地址："+json.Qrygroup4[i].addr+"<br>";							
//									}
//									
//									if (json.Qrygroup4[i].tel!=""){
//										showtext+="電話："+json.Qrygroup4[i].tel+"<br>";									
//									}
//									showtext+="</div></li>";			
//
//									if (cls===""){
//										showtext+="</li>";
//									}	
//									cls="";
//							}
//							addFeaturesCluster(json.Qrygroup4,clusterSource4);
//							$("#markpos_li_4_list").html(showtext);
//						}
//						else{
//								$("#markpos_li_4_list").html("<li >查無資料</li>");
//						}
//
//					}
//					else{
//				$("#markpos_li_4_list").empty();
//				$("#markpos_li_4").hide();
//					}
			$('#markpos_ui li').each(function(i) {						
				$(this).removeClass("TabbedPanels3TabSelected");
				if (parseInt(tabselect)==i)
				 $(this).trigger("click");
			});
			$(".markpos_li").on("click", function(event) {
				$('#markpos_li_'+(selectMarkGroup+1)+'_list .markpos_li').each(function(i) {
					$(this).removeClass("selectli");
					$(this).addClass($(this).attr("li_class"));
				});
				var xy = $(this).attr("xy").split(",");
				var strs_id=  $(this).attr("id");
				var showtext=  $(this).attr("name");
				var lonlat = ol.proj.transform([parseFloat(xy[0]),parseFloat(xy[1])], fromProjection, toProjection);
				selectMarkGroup =parseInt($( '#'+strs_id ).attr("markgroup"));
				$( '#'+strs_id ).removeClass("odd").removeClass("selectli");
				$( '#'+strs_id ).addClass("selectli");	
				addMapPopup("Popup_"+strs_id, lonlat,$(this).html());
				setTimeout(function () {
					$("#popup-content .neighNum").append("公尺");
					map.getView().setCenter(lonlat);
				}, 600);						
			}).css("cursor", "pointer");
		clusterCtrlTool();
		}
	});
}
//歷年成果
function historyAtion(x84,y84,target){

	if(x84==""||y84=="")
		return;

	$.ajax({
		type: "GET",
		url: "https://api.nlsc.gov.tw/other/LandUsePointYears/0/"+x84+"/"+y84+"/4326",
//		url: "./json/historylist.jsp",
		timeout: 300000,
		dataType: "xml",
		error: function(xhr) {
			showMessage("歷年成果查詢失敗","msg_panel",3000);
		},
		beforeSend:function(){
			showProcessMsg("歷年成果查詢中", "msg_panel", "show");
			$("#" + target).empty();
		},
		success: function(xml) {
			showProcessMsg("", "msg_panel", "hide");
			var html = "";
				var s =0;
				if(!isObj(xml)){
					html ="<table border='1' cellpadding='0' cellspacing='0' width='300' bordercolor='#FFFFFF'>"
					+"	<tbody>";
					html +="<tr>"
					+"			<td class='center'>查無資料</td>"
					+"		</tr>";
					html +="</tbody></table>";
				}
				else{
					html ="<table border='1' cellpadding='0' cellspacing='0' width='360' bordercolor='#FFFFFF'>"
					+"	<tbody>";
					html +="<tr>"
					+"			<th  colspan = '3'><center><font color='#FFFFFF'><b></b>國土利用現況調查歷年成果</font></center></th>"
					+"		</tr>";

					$(xml).find('ITEM').each(function(){
						var year = $(this).find('YEAR').text();
						var month = $(this).find('LMONTH').text();
						var lusecode = $(this).find('LCODE').text();
						var lusename = $(this).find('NAME').text();

						var isopenlayer ="開啟圖層";
						var str ="";
						if (year!=""){
							str += year+"年";
						}
						if (month!=""){
							str += month+"月";
						}					
						if ( chkLUIMAP ("LUIMAP"+year)){
							 isopenlayer ="關閉圖層";
						}
						html +="<tr>"
						+"			<td class='left'   width='100'><center>"+str+"</center></td>"
						+"			<td class='center' width='150' >"+lusecode+"-"+lusename+"</td>"
						+"			<td class='center' ><button id = 'history_LUIMAP"+year+"'  onclick=openLUIMAP('LUIMAP"+year+"');>"+isopenlayer+"</button></td>"
						+"		</tr>";
					});
				}
			$("#" + target).html(html);
			$("#History_dialog").dialog("open");
		}
	});

}

//檢查開啟 國土利用現況調查歷年圖層
function chkLUIMAP (layername) {
			
	var isopen =false
	map.getLayers().forEach(function (lyr) {
		if (lyr.get('type')!="base"){
			if (layername==lyr.get('name')){
				isopen = true;
			}
		}
	});	
	return isopen;
}


//開啟3D地圖
function open_3dmaps(){ 
	var ext = map.getView().calculateExtent();
	var lonlat =  ol.proj.transform([ext[0], ext[1]],toProjection, fromProjection); 
	var lonlat2 =  ol.proj.transform([ext[2], ext[3]],toProjection, fromProjection); 
	
	var url ="https://3dmaps.nlsc.gov.tw/WakeMap/bjump/"+lonlat2[1].toFixed(6)+"/"+ lonlat[0].toFixed(6)+"/"+ lonlat2[1].toFixed(6)+"/"+ lonlat2[0].toFixed(6)+"/"+ lonlat2[1].toFixed(6)+"/"+lonlat2[0].toFixed(6)+"/"+ lonlat2[1].toFixed(6)+"/"+ lonlat[0].toFixed(6)+"/";
	//console.log("url:"+url );
	window.open(url);
}



