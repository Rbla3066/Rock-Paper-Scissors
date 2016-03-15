jQuery(document).ready(function(){
		var ref = new Firebase("https://playgoround.firebaseio.com/");
		var playerState = "watcher";
		var playerName;
		var leaving = false;
		localStorage.setItem("confirmed", "false")
		var rpsButtons = "<div>Your Turn!</div><br><span><button class='btn btn-primary'><img src='images/rock.jpg' data-type='rock' style='height: 50px' class='rpsimg'></button><button class='btn btn-primary'><img src='images/paper.jpg' data-type='paper' style='height: 50px' class='rpsimg'></button><button class='btn btn-primary'><img src='images/scissors.jpg' data-type='scissors' style='height: 50px' class='rpsimg'></button></span>";
		ref.child('"Both"').on("child_added", function(snap){
			if(snap.val().status == "none" && playerState == "watcher"){
				$("#"+snap.val().div).html("<div>Waiting for a player</div><button class='join btn btn-primary' data-player='"+snap.val().div+"'>Join</button>");
			} else {
				$("#"+snap.val().div).html("<h2>"+snap.val().status+"</h2>")
			}
		}, function(error){
			console.log(error)
		});
		ref.child('"Both"').on("child_changed", function(snap){
			if(snap.val().status == "none"){
				$("#wins1").html("0");
				$("#wins2").html("0");
				$("#"+snap.val().div).html("<div>Waiting for a player</div><button class='join btn btn-primary' data-player='"+snap.val().div+"'>Join</button>");
			} else {
				$("#"+snap.val().div).html("<h2>"+snap.val().status+"</h2>");
			}
			if(playerState != "watcher"){
				$(".join").attr("style", "display: none");
			}
		}, function(error){
			console.log(error)
		});
		function startGame(){
			ref.child("Player1").update({"screen1": rpsButtons, "screen2": ""});
			ref.child("Player2").update({"screen2": "<div>Waiting for opponent to choose</div>", "screen1": ""});
		};
		$("body").on("click", ".rpsimg", function(){
			var type = $(this).data("type");
			if(playerState == "Player1"){
				ref.child('"Both"').child("choices").update({"p1": type});
				ref.child("Player1").update({"screen1": "<div>Waiting for opponent to choose</div>"});
				ref.child("Player2").update({"screen2": rpsButtons});
			} else {
				ref.child('"Both"').child("choices").update({"p2": type});
			}
		});
		ref.child('"Both"').child("choices").on("value", function(snap){
			if(snap.val().p1 != "" && snap.val().p2 != ""){
				var one = snap.val().p1;
				var two = snap.val().p2;
				var s1 = "<img src='images/"+one+".jpg'>";
				var s2 = "<img src='images/"+two+".jpg'>";
				ref.child("Player1").update({"screen1": s1, "screen2": s2});
				ref.child("Player2").update({"screen1": s1, "screen2": s2});
				if((one == "rock" && two == "scissors") || (one == "scissors" && two == "paper") || (one == "paper" && two== "rock")){
					$("#winInfo").html("Player 1 Wins!!");
					$("#wins1").html(parseInt($("#wins1").html())+1);
				} else if(one == two){
					$("#winInfo").html("It's a draw!");
				} else {
					$("#winInfo").html("Player 2 Wins!!");
					$("#wins2").html(parseInt($("#wins2").html())+1);
				}
				ref.child('"Both"').child("choices").update({"p1": "", "p2": ""});
				setTimeout(function(){
					$("#winInfo").html("");
					startGame();
				}, 3000);
			};
		}, function(error){
			console.log(error)
		});
		ref.child("Player1").on("value", function(snap){
			if(playerState == "Player1"){
				$("#screen1").html(snap.val().screen1);
				$("#screen2").html(snap.val().screen2);
				if(snap.val().opponent != "none" && snap.val().status == "waiting" && !leaving){
					ref.child("Player1").update({"status": "playing"});
					ref.child("Player2").update({"status": "playing"});
					startGame();
				};
			};
		}, function(error){
			console.log(error);
		});
		ref.child("Player2").on("value", function(snap){
			if(playerState == "Player2"){
				$("#screen1").html(snap.val().screen1);
				$("#screen2").html(snap.val().screen2);
				if(snap.val().opponent != "none" && snap.val().status == "waiting" && !leaving){
					ref.child("Player2").update({"status": "playing"});
					ref.child("Player1").update({"status": "playing"});
					startGame();
				};
			}
		}, function(error){
			console.log(error);
		});
		$("body").on("click", ".join", function(){
			if(localStorage.getItem("name") != null && localStorage.getItem("confirmed") == "true"){
				playerName = localStorage.getItem("name");
			} else {
				alert("Please confirm your name first");
				return;
			}
			if($(this).data("player") == "player1-div"){
				playerState = "Player1";
				ref.child('"Both"').child("p1").update({"status": playerName});
				ref.child("Player2").update({"opponent": playerName});
			} else {
				playerState = "Player2";
				ref.child('"Both"').child("p2").update({"status": playerName});
				ref.child("Player1").update({"opponent": playerName});
			}
			$(".join").attr("style", "display: none");
		});
		$( window ).unload(function() {
			leaving = true;
			if(playerState == "Player2"){
				ref.child("Player2").update({"screen1": " ", "screen2": " ", "status": "waiting"});
				ref.child("Player1").update({"screen1": " ", "screen2": " ", "opponent": "none", "status": "waiting"});
				ref.child('"Both"').child("p2").update({"status": "none"});
				ref.child('"Both"').child("choices").update({"p1": "", "p2": ""});
			};
			if(playerState == "Player1"){
				ref.child("Player2").update({"screen1": " ", "screen2": " ", "opponent": "none", "status": "waiting"});
				ref.child('"Both"').child("p1").update({"status": "none"});
				ref.child("Player1").update({"screen1": " ", "screen2": " ", "status": "waiting"});
				ref.child('"Both"').child("choices").update({"p1": "", "p2": ""});
			};
		});
		var fireData = new Firebase("https://flickering-inferno-6716.firebaseio.com/");
		if(localStorage.getItem("name") == null){
			$("#nameEntry").attr("style", "display: initial");
		} else {
			$("#winInfo").html("<div style='text-align: center'><span>Are you "+localStorage.getItem("name")+"? </span><br><span><button class='btn btn-primary' id='confirm'>Yes</button></span> <span><button class='btn btn-primary' id='deny'>No</button></span></div>");
			console.log(localStorage.getItem("name"));
		};
		$(window).keydown(function(event){
			if(event.keyCode == 13){
				if($("#messageInput").attr("style") == "display: initial"){
					sendMessage();
				} else if($("#nameEntry").attr("style") == "display: initial")	{
					submitName();
				};
			};
		});
		$("body").on("click", "#confirm", function(){
			$("#chatRoom").attr("style", "display: initial");
			$("#messageInput").attr("style", "display: initial");
			$("#winInfo").html("");
			$("#messageBoard").addClass("thumbnail");
			$("#messageBoard").animate({'scrollTop': '2000'}, 1);
			$("#message").focus();
			$("#message").select();
			localStorage.setItem("confirmed", "true");
			getChatroom();
		});
		$("body").on("click", "#deny", function(){
			$("#nameEntry").attr("style", "display: initial");
			$("#winInfo").html("");
			$("#nameInput").focus();
			$("#nameInput").select();
		});
		function submitName(){
			if($("#nameInput").val() != ""){
				localStorage.setItem("name", $("#nameInput").val());
				$("#nameEntry").attr("style", "display: none");
				$("#chatRoom").attr("style", "display: initial");
				$("#messageInput").attr("style", "display: initial");
				$("#messageBoard").addClass("thumbnail");
				$("#messageBoard").animate({'scrollTop': '2000'}, 1);
				$("#message").focus();
				$("#message").select();
				getChatroom();
				localStorage.setItem("confirmed", "true");
			};
		};
		function sendMessage(){
			var message = $("#message").val();
			var name = localStorage.getItem("name");
			fireData.push({
				Name: name,
				Message: message
			});
			$("#message").val("");
		}
		$("#submit").click(submitName);
		$("#send").click(sendMessage);
		function getChatroom(){
			fireData.on("child_added", function(snap){
			if(snap.val().Name == localStorage.getItem("name")){
				$("#chatRoom").append("<div style='margin-top: 1px; background-color: #66CCFF; border-radius: 5px; border-color: transparent'><b>"+snap.val().Name+":</b> "+snap.val().Message+"</div>");
			} else {
				$("#chatRoom").append("<div style='margin-top: 1px; background-color: #66FF66; border-radius: 5px; border-color: transparent'><b>"+snap.val().Name+": </b>"+snap.val().Message+"</div>");
			}
			$("#messageBoard").animate({'scrollTop': '1000'}, 1);
		}, function (errorObject) {
  			console.log("The read failed: " + errorObject.code);
		});
		}
	});