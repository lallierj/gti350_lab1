$( document ).ready(function() {
    var $radios = $("input:radio[name=mode]");
    $radios.filter('[value=dessiner]').prop('checked', true);
});

function keyDownHandler(e) {
   // e = e || window.event;

   if (e.keyCode == '38') {
      console.log("Up Arrow");
   }
   else if (e.keyCode == '40') {
      console.log("Down Arrow");
   }
   else if (e.keyCode == '37') {
      console.log("Left Arrow");
   }
   else if (e.keyCode == '39') {
      console.log("Right Arrow");
   }
}
//Pour la sélection
//On se fait un array rectangle selection
var selectionRectangle = [];
//On se fait un array selectedStrokes
var selectedStrokes = [];
//Quand c'est mouse moving et button down
//On vide le array rectangle selection
//On vide le array selectedStrokes
//On ajoute les 4 traits du rectangle selon les coordonnées de début et de fin (dans une autre couleur)
//quand on relache
//on check dans l'array de strokes, si un stroke a un pixel dans la zone de sélection 
   //on ajoute le stroke au array selectedStrokes
   //on garde l'index à enlever
   //On skip au prochain stroke
//À la fin de la boucle, on enlève les strokes du array original
//Pour tous les strokes sélectionnés, on ajoute un rectangle autour en
   //Trouvant le x le plus bas et le plus haut et le y le plus bas et le plus haut et en utilisant ces coordonnées pour faire un rectangle

//Quand on a des strokes sélectionnés et qu'on est en mode déplacement
//Quand on est mouse down et moving
//On change les coordonnées de tous les points des strokes sélectionnés selon le mouvement effectué




document.onkeydown = keyDownHandler;

var canvas = document.getElementById("myCanvas");
var canvas_context = canvas.getContext("2d");
var canvas_rectangle = canvas.getBoundingClientRect();

//On va chercher le checkbox de symétrie pour pouvoir le vérifier plus tard
var chkSym = document.getElementById("symetrie");
chkSym.onclick = chkSymHandler;

//Valeur de la moitié de la largeur du canvas
var canvas_middle = canvas.width / 2;
//On se crée un array contenant les coordonnées pour la ligne de symetrie
var middleLine = [];

var buttonIsDown = false;

// this is the set of strokes already drawn
var arrayOfStrokes = [];
var secondArrayOfStrokes = [];

// this is the stroke currently being drawn
var stroke = []; // each stroke is an array of points
var symetricStroke = [];

function mouseDownHandler(e) {
   buttonIsDown = true;
   var event_x = e.clientX - canvas_rectangle.left;
   var event_y = e.clientY - canvas_rectangle.top;
   console.log("mouse down");
   console.log("   " + event_x + "," + event_y);
   stroke = [];
   symetricStroke = [];
}
function mouseUpHandler(e) {
   buttonIsDown = false;
   var event_x = e.clientX - canvas_rectangle.left;
   var event_y = e.clientY - canvas_rectangle.top;
   console.log("mouse up");

   if ( stroke.length > 2 ) {
      arrayOfStrokes.push( stroke );
   }
   if ( symetricStroke.length > 2 ) {
      arrayOfStrokes.push( symetricStroke );
   }
   stroke = [];
   symetricStroke = [];
}
function mouseMoveHandler(e) {
   var event_x = e.clientX - canvas_rectangle.left;
   var event_y = e.clientY - canvas_rectangle.top;
   console.log("mouse move");

   if ( buttonIsDown ) {
      stroke.push( { x : event_x, y : event_y } );
      if(chkSym.checked){
         var second_x = canvas_middle + (canvas_middle - event_x);
         symetricStroke.push( { x : second_x, y : event_y} );
      }
      
   }
   redraw();
}

canvas.addEventListener('mousedown',mouseDownHandler);
canvas.addEventListener('mouseup',mouseUpHandler);
canvas.addEventListener('mousemove',mouseMoveHandler);

function drawStroke( s ) {
   canvas_context.beginPath();
   for ( var i = 0; i < s.length; ++i ) {
      var x = s[i].x;
      var y = s[i].y;
      if ( i === 0 ) {
         canvas_context.moveTo(x,y);
      }
      else {
         canvas_context.lineTo(x,y);
      }
   }
   canvas_context.stroke();
}

var redraw = function() {
   canvas_context.clearRect(0, 0, canvas.width, canvas.height);

   canvas_context.strokeStyle = "#000000";
   
   for ( var i = 0; i < arrayOfStrokes.length; ++i ) {
      drawStroke( arrayOfStrokes[i] );
   }

   canvas_context.strokeStyle = "#dfdfdf";
   drawStroke( middleLine );

   if ( buttonIsDown ) {
      canvas_context.strokeStyle = "#ff0000";
      drawStroke( stroke );
      drawStroke( symetricStroke );
   }
   
}

redraw();

function clearButtonHandler() {
   arrayOfStrokes = [];
   redraw();
}

function chkSymHandler(){
   if(chkSym.checked){
      middleLine = [{x : canvas_middle, y : 0}, {x : canvas_middle, y : canvas.height}];
   }else{
      middleLine = [];
   }
   redraw();
}