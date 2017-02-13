var WINDOWS_WIDTH = 1024;
var WINDOWS_HEIGHT = 768;
var RADIUS = 8;
var MARGIN_TOP = 60;
var MARGIN_LEFT = 30;

const setTime = new Date(2017,1,7,0,0,0); //设置时间
var distanceTime = 0;

var balls = [];
const colors = ["#33B5E5","#0099CC","#AA66CC","#9933CC","#99CC00","#669900","#FFBB33","#FF8800","#FF4444","#CC0000"]//声明颜色数组

//入口
window.onload=function(){
	var canvas = document.getElementById('myCanvas');
	var context = canvas.getContext("2d");

	canvas.width = WINDOWS_WIDTH;
	canvas.height = WINDOWS_HEIGHT;

	distanceTime = getDistanceTime();
	setInterval(
	function () {
   	     render(context);
   	     update();
    	},
    	50
	)

};

//时间的计算
function getDistanceTime(){
var curTime = new Date();
var ret = Math.round((curTime.getTime() - setTime.getTime())/1000);
return ret >=0 ? ret : 0;
}


//时间的比较，确定时间有发生变化
function update(){
	var nextTime = getDistanceTime();

	var nextHours = parseInt(nextTime/3600);
	var nextMinutes = parseInt((nextTime - (nextHours*3600))/60);
	var nextSeconds = nextTime%60;

	var curHours = parseInt(distanceTime/3600);
	var curMinutes = parseInt((distanceTime-curHours*3600)/60);
	var curSeconds = distanceTime%60

	if(nextSeconds != curSeconds){
	     if( parseInt(curHours/10) != parseInt(nextHours/10) ){
            ballsDraw( MARGIN_LEFT + 0 , MARGIN_TOP , parseInt(curHours/10) );
        }
        if( parseInt(curHours%10) != parseInt(nextHours%10) ){
            ballsDraw( MARGIN_LEFT + 15*(RADIUS+1) , MARGIN_TOP , parseInt(curHours/10) );
        }

        if( parseInt(curMinutes/10) != parseInt(nextMinutes/10) ){
            ballsDraw( MARGIN_LEFT + 39*(RADIUS+1) , MARGIN_TOP , parseInt(curMinutes/10) );
        }
        if( parseInt(curMinutes%10) != parseInt(nextMinutes%10) ){
            ballsDraw( MARGIN_LEFT + 54*(RADIUS+1) , MARGIN_TOP , parseInt(curMinutes%10) );
        }

        if( parseInt(curSeconds/10) != parseInt(nextSeconds/10) ){
            ballsDraw( MARGIN_LEFT + 78*(RADIUS+1) , MARGIN_TOP , parseInt(curSeconds/10) );
        }
        if( parseInt(curSeconds%10) != parseInt(nextSeconds%10) ){
            ballsDraw( MARGIN_LEFT + 93*(RADIUS+1) , MARGIN_TOP , parseInt(nextSeconds%10) );
        }
		
		
		distanceTime = nextTime;
	}
	updateBalls();
}

//描绘小球
function ballsDraw(x,y,num) {
	for (var i = 0;i<digit[num].length;i++) {
		for (var j=0;j<digit[num][i].length;j++) {
			if (digit[num][i][j] ==1 ) {
				var aBall  = {
					x:x+j*2*(RADIUS+1)+(RADIUS+1),
					y:y+i*2*(RADIUS+1)+(RADIUS+1),
					g:1.5+Math.random(),
					vx:Math.pow(-1,Math.ceil(Math.random()*1000))*4,
					vy:-4,
					color: colors[ Math.floor( Math.random()*colors.length ) ]				
				};	
				balls.push(aBall);		
			}
		
		}
	
}
}

function updateBalls(){
	for (var i=0;i<balls.length;i++) {
		balls[i].x += balls[i].vx;
		balls[i].y += balls[i].vy;
		balls[i].vy += balls[i].g; 
		
		if (balls[i].y >= WINDOWS_HEIGHT-RADIUS ) {
	
			balls[i].y = WINDOWS_HEIGHT-RADIUS;
			balls[i].vy = -balls[i].vy*0.75;
		}
	}

}
//时间的管理
function render(ctx){

ctx.clearRect(0,0,WINDOWS_WIDTH,WINDOWS_HEIGHT);//刷新页面

var hours = parseInt(distanceTime/3600);
var minutes = parseInt((distanceTime - (hours*3600))/60);
var seconds = distanceTime%60; 

renderDigit( MARGIN_LEFT , MARGIN_TOP , parseInt(hours/10) , ctx );
renderDigit( MARGIN_LEFT + 15*(RADIUS+1) , MARGIN_TOP , parseInt(hours%10) , ctx ); //小时
renderDigit( MARGIN_LEFT + 30*(RADIUS+1) , MARGIN_TOP , 10,ctx); // 冒号
renderDigit( MARGIN_LEFT + 39*(RADIUS+1), MARGIN_TOP , parseInt(minutes/10) , ctx )
renderDigit( MARGIN_LEFT + 54*(RADIUS+1) , MARGIN_TOP , parseInt(minutes%10) , ctx ) //分钟
renderDigit( MARGIN_LEFT + 69*(RADIUS+1) , MARGIN_TOP , 10,ctx); //冒号
renderDigit( MARGIN_LEFT + 78*(RADIUS+1), MARGIN_TOP , parseInt(seconds/10) , ctx )
renderDigit( MARGIN_LEFT + 93*(RADIUS+1) , MARGIN_TOP , parseInt(seconds%10) , ctx ) //秒

    for( var i = 0 ; i < balls.length ; i ++ ){
        ctx.fillStyle=balls[i].color;

        ctx.beginPath();
        ctx.arc( balls[i].x , balls[i].y , RADIUS , 0 , 2*Math.PI , true );
        ctx.closePath();

        ctx.fill();
    }
}

//打印时间
function renderDigit(x,y,num,ctx){
ctx.fillStyle = "rgb(0,102,153)";

for (var i = 0; i < digit[num].length; i++) {
	for (var j = 0; j < digit[num][i].length; j++) {
		if(digit[num][i][j] == 1){
			ctx.beginPath();
			ctx.arc(x+j*2*(RADIUS+1)+(RADIUS+1),y+i*2*(RADIUS+1)+(RADIUS+1),RADIUS,0,2*Math.PI);
			ctx.closePath();

			ctx.fill();
			}
		}
	}
}