/**
 * posenet的姿态匹配功能
 */

var baseLine = new Array();//只包括进行距离计算的点
var currentLine = new Array();
var basePoints = new Array();
var currentPoints = new Array();//包括所有骨骼点，没有值的元素设置为undefined；
var setCurrentFrameBase = true;
function saveBase(){
	setCurrentFrameBase = true;
	console.log('saveBase setCurrentFrameBase='+setCurrentFrameBase);
	
}

var dataCanvas = document.createElement("canvas");
dataCanvas.width=600;
dataCanvas.height=500;
dataCtx = dataCanvas.getContext("2d");

var matchCanvas = document.getElementById("matchCanvas");
matchCanvas.width = 600;
matchCanvas.height= 500;
var matchCtx = matchCanvas.getContext("2d");
function proccessMatch(keypoints){
	var outputCanvas = document.getElementById("output");
	var outputCtx = outputCanvas.getContext("2d");
	canvasDrawLinePostnet(outputCtx,basePoints,"#ff0000");
	
	if(setCurrentFrameBase === true){
		console.log(JSON.stringify(keypoints));
		
		var baseCanvas = document.getElementById("baseCanvas");
		baseCanvas.width = 600;
		baseCanvas.height= 500;
		var baseCtx = baseCanvas.getContext("2d");
		baseCtx.drawImage(outputCanvas, 0, 0);
		canvasFillText(baseCtx,"基准图");
		
		setCurrentFrameBase = false;
		baseLine.length=0;
		basePoints.length=0;
		var checkboxs = document.getElementsByName('checkPoints');
		for(var i = 0; i < checkboxs.length; i++){
			if(checkboxs[i].checked){
				baseLine.push([keypoints[checkboxs[i].value].position.x,keypoints[checkboxs[i].value].position.y]);
				basePoints.push([keypoints[checkboxs[i].value].position.x,keypoints[checkboxs[i].value].position.y]);
			}else{
				basePoints.push(undefined);
			}
		}
		console.log(JSON.stringify(baseLine));
		canvasDrawLinePostnet(baseCtx,basePoints,"#00ff00");
	}else{
		currentLine.length=0;
		currentPoints.length=0;
		var checkboxs = document.getElementsByName('checkPoints');
		for(var i = 0; i < checkboxs.length; i++){
			if(checkboxs[i].checked){
				currentLine.push([keypoints[checkboxs[i].value].position.x,keypoints[checkboxs[i].value].position.y]);
				currentPoints.push([keypoints[checkboxs[i].value].position.x,keypoints[checkboxs[i].value].position.y]);
			}else{
				currentPoints.push(undefined);
			}
		}
		
		let distance = frechetDistance(standardize(baseLine),standardize(currentLine));
		console.log('baseLine: '+JSON.stringify(baseLine));
		console.log('currentLine: '+JSON.stringify(currentLine));
		console.log('distance: '+distance);
		
		dataCtx.clearRect(0,0,600,500);
		dataCtx.font="30px Verdana";
		dataCtx.fillStyle="#00ff00";
		dataCtx.fillText("距离: "+distance,300,30);
		if(0<distance && distance<=document.getElementById('deviation').value){
//			console.log(keypoints);
			dataCtx.fillText("匹配成功! ",400,60);
			
			matchCtx.drawImage(outputCanvas, 0, 0);
			canvasFillText(matchCtx,"匹配图");
			canvasDrawLinePostnet(matchCtx,currentPoints,"#00ff00");
		}else{
			dataCtx.fillText("匹配失败! ",400,60);
		}
		outputCtx.drawImage(dataCanvas, 0, 0);
	}
}

function canvasFillText(ctx,text){
	ctx.font="30px Verdana";
	ctx.fillStyle="#00ff00";
	ctx.fillText(text,10,30);
}

/**
 * 按照postnet的骨骼数据绘制骨架，增加了双眼中心到鼻子和鼻子到双肩中心两条线，以便形成一个连通的骨架
 */
function canvasDrawLinePostnet(ctx,line,color){
	ctx.strokeStyle = color; 
	ctx.lineWidth = 4;
	if(line){
		for(let i=0;i<line.length;i++){
			if(line[i]){
				ctx.beginPath();
				ctx.arc(line[i][0],line[i][1], 4, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fill();//画实心圆
				ctx.stroke();
			}
		}
	}
	if(line[3] && line[1]){//左耳到左眼
		ctx.moveTo(line[3][0],line[3][1]);
		ctx.lineTo(line[1][0],line[1][1]);
		ctx.stroke();
	}
	if(line[1] && line[2]){//左眼到右眼
		ctx.moveTo(line[1][0],line[1][1]);
		ctx.lineTo(line[2][0],line[2][1]);
		ctx.stroke();
	}
	if(line[2] && line[4]){//右眼到右耳
		ctx.moveTo(line[2][0],line[2][1]);
		ctx.lineTo(line[4][0],line[4][1]);
		ctx.stroke();
	}
	if(line[1] && line[2] && line[0]){//双眼中心到鼻子
		ctx.moveTo((line[1][0]+line[2][0])/2,(line[1][1]+line[2][1])/2);
		ctx.lineTo(line[0][0],line[0][1]);
		ctx.stroke();
	}
	if(line[0] && line[5] && line[6]){//鼻子到双肩中心
		ctx.moveTo(line[0][0],line[0][1]);
		ctx.lineTo((line[5][0]+line[6][0])/2,(line[5][1]+line[6][1])/2);
		ctx.stroke();
	}
	if(line[5] && line[6]){//左肩到右肩
		ctx.moveTo(line[5][0],line[5][1]);
		ctx.lineTo(line[6][0],line[6][1]);
		ctx.stroke();
	}
	if(line[7] && line[5]){//左肘到左肩
		ctx.moveTo(line[7][0],line[7][1]);
		ctx.lineTo(line[5][0],line[5][1]);
		ctx.stroke();
	}
	if(line[8] && line[6]){//右肘到右肩
		ctx.moveTo(line[8][0],line[8][1]);
		ctx.lineTo(line[6][0],line[6][1]);
		ctx.stroke();
	}
	if(line[9] && line[7]){//左手腕到左肘
		ctx.moveTo(line[9][0],line[9][1]);
		ctx.lineTo(line[7][0],line[7][1]);
		ctx.stroke();
	}
	if(line[10] && line[8]){//右手腕到右肘
		ctx.moveTo(line[10][0],line[10][1]);
		ctx.lineTo(line[8][0],line[8][1]);
		ctx.stroke();
	}
	if(line[5] && line[11]){//左肩到左臀
		ctx.moveTo(line[5][0],line[5][1]);
		ctx.lineTo(line[11][0],line[11][1]);
		ctx.stroke();
	}
	if(line[6] && line[12]){//右肩到右臀
		ctx.moveTo(line[6][0],line[6][1]);
		ctx.lineTo(line[12][0],line[12][1]);
		ctx.stroke();
	}
	if(line[11] && line[12]){//左臀到右臀
		ctx.moveTo(line[11][0],line[11][1]);
		ctx.lineTo(line[12][0],line[12][1]);
		ctx.stroke();
	}
	if(line[11] && line[13]){//左臀到左膝
		ctx.moveTo(line[11][0],line[11][1]);
		ctx.lineTo(line[13][0],line[13][1]);
		ctx.stroke();
	}
	if(line[12] && line[14]){//右臀到右膝
		ctx.moveTo(line[12][0],line[12][1]);
		ctx.lineTo(line[14][0],line[14][1]);
		ctx.stroke();
	}
	if(line[13] && line[15]){//左膝到左脚踝
		ctx.moveTo(line[13][0],line[13][1]);
		ctx.lineTo(line[15][0],line[15][1]);
		ctx.stroke();
	}
	if(line[14] && line[16]){//右膝到右脚踝
		ctx.moveTo(line[14][0],line[14][1]);
		ctx.lineTo(line[16][0],line[16][1]);
		ctx.stroke();
	}
}
