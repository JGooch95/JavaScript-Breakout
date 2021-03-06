var canvas = document.getElementById("breakout");
var ctx = canvas.getContext("2d");

//Key press detection
var keysDown = {}; 
window.addEventListener("keydown",function(e){ keysDown[e.keyCode] = true; }); //Pressing a key down
window.addEventListener("keyup",function(e){ delete keysDown[e.keyCode]; }); //Removing the key press of the key

function vec2f(x,y)
{
	this.x = x;
	this.y = y;
}

var Screens = {
	StartScreen: 0,
	GameOver:1,
	LevelScreen:2,
	Game: 3
}

var Game = {
	Screen: Screens.StartScreen, //Current Displayed Screen
	Level: 1 //Current level
}

var Player = {
	Lives: 3, //Lives the player currently has.
	Score: 0 //Score the player currently has.
}

var BlockGroup = {
	Rows: [], 			//Holds the rows of blocks.
	BlocksDestroyed: 0,	//States how many blocks have been destroyed.
	AmountOfBlocks: 0
}

var ball = {
	position: new vec2f(canvas.width / 2, canvas.height - 80),
	direction: new vec2f(0,1),
	speed: 200,   		 //Speed in the x direction in pixels per second
	radius: 10,            //Radius of the ball in pixels
	released: false,		 //Determines whether the ball has started moving.
}

var paddle = {
	size: new vec2f(100,20),
	position: new vec2f((canvas.width / 2) - (this.width / 2), canvas.height - 50),
	speed: 800             //Speed of the paddle in pixels per second
}

function block(x, y, width, height, hits) 
{
	this.position = new vec2f(x,y),
	this.size = new vec2f(width, height),
	this.hits = hits	   //The amount of hits until the block is destroyed.
}

function ResetBlocks()
{	
	BlockGroup.Rows = []; //Empties the multiple row array.
	var LevelBlocks = ["--------",
					   "--------"];
	var X = 20;			  //The X position the group of blocks starts.
	var Y = 50;			  //The Y position the group of blocks starts.
	var XGap = 40;		  //The Gap between the blocks in the x axis.
	var YGap = 10; 		  //The Gap between the blocks in the y axis.
	var BlockWidth = 60;  //The default width of the blocks
	var BlockHeight = 30; //The default height of the blocks
	
	BlockGroup.AmountOfBlocks = 0; //Resets the amount of blocks variable.
	
	//Block Positions change dependant on the level.
	switch(Game.Level)
	{
		case 1:
			LevelBlocks = ["========",
					   	   "--------"];
			break;

		case 2:
			LevelBlocks = ["-=-=-=-=",
					       "=-=-=-=-"];
			break;

		case 3:
			LevelBlocks = ["--====--",
					       "==----=="];
			break;

		case 4:
			LevelBlocks = ["--====--",
					       "==-==-=="];
			break;

		case 5:
			LevelBlocks = ["========",
						   "========"];
			break;

		default:
			LevelBlocks = ["========",
						   "========"];
			break;
	};

	//For the amount of rows needed.
	for(b = 0; b < LevelBlocks.length; ++b)
	{
		var Row = []; //Empties the single row array.

		//For each block in a row.
		for(i = 0; i < LevelBlocks[b].length; ++i)
		{
			var valid = false;
			switch(LevelBlocks[b][i])
			{
				case "-": //Single hit blocks
					Row.push(new block((i*(BlockWidth + XGap)) + X, (b* (BlockHeight + YGap)) + Y, BlockWidth, BlockHeight, 1)); //Add the block to the array
					valid = true;
					break;

				case "=": //Multi hit blocks
					Row.push(new block((i*(BlockWidth + XGap)) + X, (b* (BlockHeight + YGap)) + Y, BlockWidth, BlockHeight, 2)); //Add the block to the array
					valid = true;
					break;
			}

			if(valid)
			{
				BlockGroup.AmountOfBlocks += 1; //Amount of blocks is incremented.
			}
		}
		BlockGroup.Rows.push(Row); //Add the row to the list of rows.
	}
}

function RenderStartScreen()
{		
	//Sets the font to arial and the colour to white.
	ctx.fillStyle = "white";
	ctx.font="50px Arial";

	ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas

	//Draws the breakout title to the screen.
	var Start_txt = "Breakout";
	ctx.fillText(Start_txt, (canvas.width / 2) - (ctx.measureText(Start_txt).width / 2) ,canvas.height / 2 - 100);
		
	//Draws the start prompt to the screen.
	Start_txt = "Press Enter to Start";
	ctx.fillText(Start_txt, (canvas.width / 2) - (ctx.measureText(Start_txt).width / 2) ,canvas.height / 2);
}

function RenderGameOver()
{		
	//Sets the font to arial and the colour to white.
	ctx.fillStyle = "white";
	ctx.font="50px Arial";

	ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas

	//Draws the Game Over text to the screen.
	var GameOver_txt = "Game Over";
	ctx.fillText(GameOver_txt, (canvas.width / 2) - (ctx.measureText(GameOver_txt).width / 2) ,canvas.height / 2 - 100);
	
	//Draws the final score to the screen.
	GameOver_txt = "Score: " + Player.Score;
	ctx.fillText(GameOver_txt, (canvas.width / 2) - (ctx.measureText(GameOver_txt).width / 2) ,canvas.height / 2);
	
	//Draws the return prompt to the screen.
	GameOver_txt = "Press Enter to restart";
	ctx.fillText(GameOver_txt, (canvas.width / 2) - (ctx.measureText(GameOver_txt).width / 2) ,canvas.height / 2 + 100);
}

function RenderLevelScreen()
{		
	//Sets the font to arial and the colour to white.
	ctx.fillStyle = "white";
	ctx.font="50px Arial";

	ctx.clearRect(0, 0, canvas.width, canvas.height); //Clear the canvas
	
	//Draws the Level to the screen.
	var Level_txt = "Level: " + Game.Level;
	ctx.fillText(Level_txt, (canvas.width / 2) - (ctx.measureText(Level_txt).width / 2) ,canvas.height / 2);
}

function RenderInGame()
{	
	//Clear the canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//Ball and paddle colour
	ctx.fillStyle = "white";

	//Ball
	ctx.beginPath();
	ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
	ctx.fill();

	//Paddle
	ctx.beginPath();
	ctx.fillRect(paddle.position.x + (paddle.size.y/2), paddle.position.y, paddle.size.x - paddle.size.y, paddle.size.y);
	ctx.arc(paddle.position.x + (paddle.size.y / 2), paddle.position.y + (paddle.size.y / 2), paddle.size.y / 2, 0.5 * Math.PI, 1.5 * Math.PI);
	ctx.arc(paddle.position.x + (paddle.size.y / 2) + paddle.size.x - paddle.size.y, paddle.position.y + (paddle.size.y / 2), paddle.size.y / 2, 1.5 * Math.PI, 0.5 * Math.PI);
	ctx.fill();

	//Blocks
	//For each row of blocks
	for(b = 0; b < BlockGroup.Rows.length; ++b)
	{
		//For each block in the row.
		for(i=0; i < BlockGroup.Rows[b].length; ++i)
		{
			//Block colour changes dependant on number of hits
			switch(BlockGroup.Rows[b][i].hits)
			{
				case 1:
					ctx.fillStyle = "red";
					break;
				case 2:
					ctx.fillStyle = "green";
					break;
			}
			
			ctx.beginPath();
			ctx.fillRect(BlockGroup.Rows[b][i].position.x, BlockGroup.Rows[b][i].position.y, BlockGroup.Rows[b][i].size.x, BlockGroup.Rows[b][i].size.y);
			ctx.fill();
		}
	}

	//HUD
	//HUD colour and font.
	ctx.fillStyle = "white";
	ctx.font="20px Arial";

	//Lives
	var HUD_txt = "Lives: " + Player.Lives;
	ctx.fillText(HUD_txt,10 ,canvas.height - 10);

	//Score
	HUD_txt = "Score: " + Player.Score;
	ctx.fillText(HUD_txt,100 ,canvas.height - 10);

	//Level
	HUD_txt = "Level " + Game.Level;
	ctx.fillText(HUD_txt, (canvas.width / 2) - (ctx.measureText(HUD_txt).width / 2) ,canvas.height - 10);
	
	//If the ball hasn't been released.
	if (ball.released == false)
	{
		//Enter prompt colour and font.
		ctx.fillStyle = "white";
		ctx.font="20px Arial";
		
		//Enter prompt.
		HUD_txt = "Press Enter to release the ball";
		ctx.fillText(HUD_txt, (canvas.width / 2) - (ctx.measureText(HUD_txt).width / 2) ,canvas.height/2);
	}
}

function UpdateStartScreen()
{
	//If the enter key is pressed.
	if(13 in keysDown) 
	{
		BlockGroup.BlocksDestroyed = 0; //Blocks destroyed are reset.
		Player.Lives = 3; //Lives are reset
		Player.Score = 0; //Score is reset
		Game.Level = 1; //The level is reset.
		ball.speed = 200; //Ball xSpeed is reset.
		paddle.position.x = (canvas.width / 2) - (paddle.size.x / 2); //The paddle's position is reset.
		ResetBlocks(); //The blocks are reset.
		delete keysDown[13]; //Removes the enter key from the stack.
		Game.Screen = Screens.LevelScreen;
	}
}

function UpdateGameOver()
{
	//If the enter key is pressed.
	if(13 in keysDown)
	{
		Game.Screen = Screens.StartScreen;
		delete keysDown[13]; //Removes the enter key from the stack.
	}
}

function UpdateLevelScreen()
{
	var timer = setTimeout(function DisableLevelScreen(){Game.Screen = Screens.Game;}, 2000); //Disables the level transfer screen after 2 seconds.
}

function Magnitude(vector)
{
	return(Math.sqrt(Math.pow(vector.x,2) + Math.pow(vector.y,2)));
}

function BoxCircleCollision(box, circle)
{
	//Box box collision
	if(circle.position.x + circle.radius >= box.position.x && 
	   circle.position.x - circle.radius <= box.position.x + box.size.x && 
	   circle.position.y + circle.radius >= box.position.y && 
	   circle.position.y - circle.radius <= box.position.y + box.size.y)
	{
		//Difference between 2 centers
		var diff = new vec2f(circle.position.x - (box.position.x + box.size.x/2) ,  circle.position.y - (box.position.y + box.size.y/2));
		var clamp = new vec2f(0,0);

		//If the clamps the location of the circle to the rect
		if(diff.x >= 0)
		{
			clamp.x = Math.min(diff.x, (box.size.x/2));
		}
		else
		{
			clamp.x = Math.max(diff.x, -(box.size.x/2));
		}

		if(diff.y >= 0)
		{
			clamp.y = Math.min(diff.y, (box.size.y/2));
		}
		else
		{
			clamp.y = Math.max(diff.y, -(box.size.y/2));
		}

		//Caclulates the distance between the objects
		var dist = new vec2f(diff.x - clamp.x, diff.y - clamp.y);

		var difference = Magnitude(dist) - circle.radius;

		//If colliding
		if(difference <= 0)
		{
			//Position the circle
			var unitClamp = new vec2f(clamp.x/ Magnitude(clamp), clamp.y/ Magnitude(clamp));
			unitClamp.x *= circle.radius;
			unitClamp.y *= circle.radius;

			circle.position.x = box.position.x + (box.size.x/2) + clamp.x + unitClamp.x;
			circle.position.y = box.position.y + (box.size.y/2) + clamp.y + unitClamp.y;

			//If hitting top side
			if(circle.position.y >= box.position.y + box.size.y)
			{
				circle.direction.y = 1;
			}
			//If hitting bottom side
			else if(circle.position.y <= box.position.y)
			{
				circle.direction.y = -1;
			}

			//If hitting right side
			if(circle.position.x >= box.position.x + box.size.x)
			{
				circle.direction.x = 1;
			}
			//If hitting left side
			else if(circle.position.x <= box.position.x)
			{
				circle.direction.x = -1;
			}

			return true;
		}
	}
	return false;
}

function UpdateInGame(elapsed)
{
	//If the player dies
	if (Player.Lives <= 0)
	{
		Game.Screen = Screens.GameOver; //The Game Over screen is enabled
		return; //The game screen is left
	}
	
	//If the ball has been released.
	if(ball.released == true)
	{
		//update the ball position according to the elapsed time
		ball.position.y += ball.direction.y * ball.speed * elapsed;
		ball.position.x += ball.direction.x * ball.speed * elapsed;

		//Key detection
		//If the left key is pressed the paddle moves left.
		if(37 in keysDown) { paddle.position.x -= paddle.speed * elapsed; }

		//If the right key is pressed the paddle moves right.
		if(39 in keysDown) { paddle.position.x += paddle.speed * elapsed; }
	}

	//Key detection
	//If enter is pressed
	if(13 in keysDown) 
	{ 
		//If the ball is not released
		if(ball.released ==false)
		{
			ball.released = true; //The ball is released.
		}
	}

	if(BoxCircleCollision(paddle, ball))
	{
		//If heading directly downwards
		if( ball.direction.x == 0 && ball.direction.y == -1)
		{
			//Randomise a direction to head towards
			var randomDir = (Math.random() * 2) - 1;
			if(randomDir <= 0)
			{
				ball.direction.x = -1;
			}
			else
			{
				ball.direction.x = 1;
			}
		}
		ball.speed += 1; //Ball's speed is increased
		paddle.speed += 1; //The paddle speed is increased.
	}

	for(b = 0; b < BlockGroup.Rows.length; ++b)
	{
		//For each block in the row.
		for(i=0; i < BlockGroup.Rows[b].length; ++i)
		{
			if(BoxCircleCollision(BlockGroup.Rows[b][i], ball))
			{
				Player.Score += 100 * Game.Level; // Score increases dependant on the level.
				BlockGroup.Rows[b][i].hits -= 1;
						
				//If the block has taken all of its hits.
				if (BlockGroup.Rows[b][i].hits <= 0)
				{
					BlockGroup.Rows[b].splice(i,1); 	// The block is removed from the list of blocks.
					BlockGroup.BlocksDestroyed += 1; 	// The blocks destroyed is increased by 1.
				}
			}
		}
	}

	//Collision (Paddle : Window edges)
	//Left Window side
	if(paddle.position.x <=0)
	{
		paddle.position.x = 0; //Paddle is moved to the left side of the window.
	}

	//Right Window side
	if(paddle.position.x + paddle.size.x   >= canvas.width)
	{
		paddle.position.x = canvas.width - paddle.size.x ; //Paddle is moved to the right side of the window.
	}

	//Collision (Ball : Window edges)
	//Horizontal
	if(ball.position.x <= 0 || ball.position.x >= canvas.width) 
	{
		//Left window side
		if(ball.position.x <=0)
		{
			ball.position.x = 0 + ball.radius; //Ball is moved to the left side of the screen.
		}

		//Right window side
		if(ball.position.x >= canvas.width)
		{
			ball.position.x = canvas.width - ball.radius; //Ball is moved to the right side of the screen.
		}

		ball.direction.x *= -1;      //Ball's direction on the x axis is flipped.
	}

	//Vertical
	if(ball.position.y <= 0 || ball.position.y >= canvas.height) 
	{
		//Top window side
		if(ball.position.y <=0)
		{
			ball.position.y = 0 + ball.radius; //Ball is moved to the top side of the screen.
		}

		//Bottom window side
		if(ball.position.y >= canvas.height)
		{
			//The ball's position is reset.
			ball.position.x = canvas.width / 2;	
			ball.position.y = canvas.height - 80;	

			ball.bounces = 0;	//The amount of times the ball has bounced is reset.
			Player.Lives -= 1;  //Player lives are decreased.
			
			//If the ball's direction is up
			if (ball.direction.y < 0)
			{
				ball.direction.y *= -1; //The ball's direction in the y axis is flipped.
			}
			
			ball.released = false; //The ball is set to not released.
			paddle.position.x = (canvas.width / 2) - (paddle.size.x / 2); //Paddle's position is reset.
		}

		ball.direction.y *= -1; 	   //Ball's direction on the y axis is flipped.
	}

	
	
	//If the amount of blocks destroyed is more than or equal to all the blocks on the canvas.
	if (BlockGroup.BlocksDestroyed >= BlockGroup.AmountOfBlocks)
	{
		Game.Level += 1; //The level is increased.

		Game.Screen = Screens.LevelScreen;
		BlockGroup.BlocksDestroyed = 0; //The amount of blocks destroyed is reset.

		//The ball's position is reset.
		ball.position.y = canvas.height - 80;
		ball.position.x = canvas.width / 2;
		
		//If the ball's direction is down
		if (ball.direction.y < 0)
		{
			ball.direction.y *= -1; //The ball's direction in the y axis is flipped.
		}

		paddle.position.x = (canvas.width / 2) - (paddle.size.x / 2); //The paddle's position is reset.
		ResetBlocks(); //Resets the blocks to appear.

		ball.released = false; //The ball is set to not released.
	}
}

function update(elapsed) 
{
	switch(Game.Screen)
	{
		case Screens.StartScreen:
			UpdateStartScreen();
			break;

		case Screens.GameOver:
			UpdateGameOver();
			break;

		case Screens.LevelScreen:
			UpdateLevelScreen();
			break;

		case Screens.Game:
			UpdateInGame(elapsed);
			break;

		default:
			Game.Screen = Screens.StartScreen;
	};
}

function render() 
{	
	switch(Game.Screen)
	{
		case Screens.StartScreen:
			RenderStartScreen();
			break;

		case Screens.GameOver:
			RenderGameOver();
			break;

		case Screens.LevelScreen:
			RenderLevelScreen();
			break;

		case Screens.Game:
			RenderInGame();
			break;

		default:
			Game.Screen = Screens.StartScreen;
	};
}

var previous;
function run(timestamp) 
{
	if (!previous) previous = timestamp;          //start with no elapsed time
	var elapsed = (timestamp - previous) / 1000;  //work out the elapsed time
	update(elapsed);                              //update the game with the elapsed time
	render();                                     //render the scene
	previous = timestamp;                         //set the (globally defined) previous timestamp ready for next time
	window.requestAnimationFrame(run);            //ask browser to call this function again, when it's ready
}

//trigger the game loop
window.requestAnimationFrame(run);