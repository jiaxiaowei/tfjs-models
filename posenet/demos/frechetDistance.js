/**
 * 曲线距离计算(不是曲线相似度)，Frechet距离算法
 */
var ca = [];
var frechetDistance = function(line1, line2) {
	var fval = 0;
	for (var i = 0; i < line1.length; i++) {
		ca.push([]);
		for (var j = 0; j < line2.length; j++) {
			ca[i][j] = -1;
		}
	}
	fval = CalDistance(line1, line2, ca, line1.length - 1,
			line2.length - 1);
	return fval;
};
var CalDistance = function(line1, line2, arr, i, j) {
	if(line1 && line2 && line1.length>0 && line2.length>0){
		if (arr[i][j] > -1) {
			return arr[i][j];
		} else if (i == 0 && j == 0) {
			arr[i][j] = DisP(line1[0], line2[0], i, j);
		} else if (i > 0 && j == 0) {
			arr[i][j] = Math.max( CalDistance(line1, line2, arr, i - 1, 0),
					DisP(line1[i], line2[0], i, j));
		} else if (i == 0 && j > 0) {
			arr[i][j] = Math.max( CalDistance(line1, line2, arr, 0, j - 1),
					DisP(line1[0], line2[j], i, j));
		} else if (i > 0 && j > 0) {
			arr[i][j] = Math.max(Math.min( CalDistance(line1, line2, arr,
					i - 1, j),  CalDistance(line1, line2, arr, i - 1, j - 1),
				 	CalDistance(line1, line2, arr, i, j - 1)), DisP(line1[i], line2[j], i, j));
		} else {
			arr[i][j] = Number.MAX_VALUE;
		}
	// 	console.log('CalDistance: arr['+i+"]["+j+']: '+arr[i][j]);
		return arr[i][j];
	}else{
		return Number.MAX_VALUE;
	}
};

/*
 * 两点的距离,i, j只是为了测试时输出log
 */
var DisP = function(point1,point2, i, j){
	dx = Math.abs(point2[0] - point1[0]);
	dy = Math.abs(point2[1] - point1[1]);
	let distance = Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
// 	console.log('DisP:'+i+"-"+j+': '+distance);
	return distance;
};

/**
 * 求某一个分量的平均值
 */
var average = function(line, x){
	let sum = 0
	for(var i=0;i<line.length;i++){
		sum += line[i][x];
	}
	return sum/line.length;
}

/**
 * 求某一个分量的标准差
 */
var standardDeviation = function(line,x){
	let averageValue = average(line,x);
	let temp = 0;
	for(var i=0;i<line.length;i++){
		temp += Math.pow((line[i][x] - averageValue),2);
	}
	return  temp/line.length;
}

/**
 * 标准化处理
 */
var standardize = function(line){
	let tempLine = copyArray(line);
	if(tempLine && tempLine.length>0){
		for(let i=0;i<2;i++){
			let standardDeviationValue = standardDeviation(tempLine,i);
			let averageValue = average(tempLine,i);
			for(let j=0;j<tempLine.length;j++){
				tempLine[j][i] = (tempLine[j][i]-averageValue)/standardDeviationValue;
			}
		}
	}
	return tempLine;
}

//复制二维数组
var copyArray = function(arr1){
	let arr2 = new Array();
	if(arr1){
		for(let i=0;i<arr1.length;i++){
			arr2.push([arr1[i][0],arr1[i][1]]);
		}
	}
	return arr2;
}

function test(){
	var line1 = new Array();
	var line2 = new Array();
	line1.push([1,1]);
	line1.push([2,2]);
	line1.push([3,3]);
	line1.push([4,4]);

	line2.push([11,1]);
	line2.push([12,2]);
	line2.push([13,3]);
	line2.push([14,4]);

	let distance = frechetDistance(standardize(line1),standardize(line2));
	console.log(distance);
}
