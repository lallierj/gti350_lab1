$( document ).ready(function() {
    var $radios = $("input:radio[name=mode]");
    $radios.filter('[value=dessiner]').prop('checked', true);
    $("#clearBtn").on("click", clearButtonHandler)

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
   //On crée un tableau qui contiendra les index des lignes sélectionnées
   var selectedStrokeIndexes = [];
   //On crée un tableau qui contiend les lignes sélectionnées avec coordonnées d'origine
   var tempArrayOfSelectedStrokes = [];

   //On se fait un array selectedStrokes
   var selectedStrokes = [];
   var initialSelectMoveX = 0;
   var initialSelectMoveY = 0;

   document.onkeydown = keyDownHandler;

   var canvas = document.getElementById("myCanvas");
   var canvas_context = canvas.getContext("2d");
   var canvas_rectangle = canvas.getBoundingClientRect();

   //On va chercher le checkbox de symétrie pour pouvoir le vérifier plus tard
   
   $("#symetrie").on("click", chkSymHandler);

   //Valeur de la moitié de la largeur du canvas
   var canvas_middle = canvas.width / 2;
   //On se crée un array contenant les coordonnées pour la ligne de symetrie
   var middleLine = [];

   var buttonIsDown = false;

   // this is the set of strokes already drawn
   var arrayOfStrokes = [];
   var selectedStrokes = [];

   // this is the stroke currently being drawn
   var stroke = []; // each stroke is an array of points
   var symetricStroke = [];

   //Fonction appelée quand le bouton de la souris est pressé dans le canvas
   function mouseDownHandler(e) {
      //On met la variable booléenne à true
      buttonIsDown = true;
      //On enregistre le x et le y de l'événement
      var event_x = e.clientX - canvas_rectangle.left;
      var event_y = e.clientY - canvas_rectangle.top;
      //On vide le tableau de ligne et de ligne symétrique
      stroke = [];
      symetricStroke = [];
      //Si on est en mode "Sélectionner" ou "Dessiner"
      if($("input:radio[value=selectionner]").is(":checked") || $("input:radio[value=dessiner]").is(":checked")){
         //On vide le tableau de lignes sélectionnées et le tableau d'index de lignes sélectionnées
         selectedStrokes = [];
         selectedStrokeIndexes = [];
         tempArrayOfSelectedStrokes = [];
      }
      //Si on est en mode "Sélectionner" ou "Déplacer", on doit aussi garder en mémoire les coordonnées x et y du départ de la sélection ou du déplacement
      if($("input:radio[value=selectionner]").is(":checked") || $("input:radio[value=deplacer]").is(":checked")){
         initialSelectMoveX = event_x;
         initialSelectMoveY = event_y;
      }
   }

   //Fonction appelée quand le bouton de la souris est relâché
   function mouseUpHandler(e) {
      //On remet la variable booléenne à false
      buttonIsDown = false;
      //On enregistre le x et le y de l'événement
      var event_x = e.clientX - canvas_rectangle.left;
      var event_y = e.clientY - canvas_rectangle.top;
      //Si on a plus de deux éléments dans le tableau de la ligne, on ajoute le tableau au tableau de lignes
      if ( stroke.length > 2 ) {
         arrayOfStrokes.push( stroke );
      }
      //Si on a plus de deux éléments dans le tableau de la ligne créée par symétrie, on ajoute le tableau au tableau de lignes
      if ( symetricStroke.length > 2 ) {
         arrayOfStrokes.push( symetricStroke );
      }
      //On vide le tableau de la ligne et celui de la ligne créée par symétrie
      stroke = [];
      symetricStroke = [];
      //Si on est en mode "Sélectionner"
      if($("input:radio[value=selectionner]").is(":checked")){
         //On passe dans toutes les lignes présentes dans le canvas
         for(var i = 0; i < arrayOfStrokes.length; i++){
            var curStroke = arrayOfStrokes[i];
            //On passe dans tous les points de la ligne courante
            if(curStroke !== undefined){
               for(var j = 0; j < curStroke.length; j++){
                  var curX = curStroke[j].x;
                  var curY = curStroke[j].y;
                  //Si la coordonnées y courante est dans le range de sélection
                  if(curY < initialSelectMoveY && curY > event_y || curY > initialSelectMoveY && curY < event_y){
                     //Si la coordonnées x courante est dans le range de sélection
                     if(curX < initialSelectMoveX && curX > event_x || curX > initialSelectMoveX && curX < event_x){
                        //On ajoute l'index correspondant à la ligne courante du tableau de lignes dans le tableau d'index sélectionnés
                        selectedStrokeIndexes.push(i);
                        //On ne veut pas ajouter la même ligne plusieurs fois si elle a plus d'un point dans le range de sélection
                        //On passe donc à la prochaine ligne avec un break
                        break;
                     }
                  }
               }
            }
            
         }
         //Pour tous les index contenus dans le tableau d'index
         //On arrête un index avant le dernier élément parce qu'il y a un élément undefined à la fin du tableau pour une raison obscure
         for(var k = 0; k < selectedStrokeIndexes.length; k ++){
            //On va récupérer l'index
            var index = selectedStrokeIndexes[k];
            //On copie les lignes sélectionnées dans le tableau de lignes sélectionnées
            //Ces lignes serviront à dessiner le contour des lignes sélectionnées
            selectedStrokes.push(arrayOfStrokes[index]);
            tempArrayOfSelectedStrokes.push(arrayOfStrokes[index]);
         }
      }
      //Si on est en mode déplacer
      if($("input:radio[value=deplacer]").is(":checked")){
         //On remplace les lignes sélectionnées d'origine par les nouvelles lignes sélectionnées
         tempArrayOfSelectedStrokes = [];
         for(var l = 0; l < selectedStrokes.length; l++){
            tempArrayOfSelectedStrokes.push(selectedStrokes[l]);
         }
      }
      //On réinitialise les variables de X et Y initiaux et on vide le tableau qui contient les informations du rectangle de sélection
      initialSelectMoveX = 0;
      initialSelectMoveY = 0;
      selectionRectangle = [];
      //On redessine le canvas
      redraw();
   }

   //Fonction appelée quand la souris est bougée dans le canvas
   function mouseMoveHandler(e) {
      //Si le bouton de la souris est pesé (on ne veut rien faire de particulier si le bouton de la souris n'est pas enclenché)
      if(buttonIsDown){
         //On enregistre le x et le y de l'événement
         var event_x = e.clientX - canvas_rectangle.left;
         var event_y = e.clientY - canvas_rectangle.top;

         //Si on est en mode "Dessiner"
         if ($("input:radio[value=dessiner]").is(":checked")) {
            //On ajooute la coordonnée courante à la ligne 
            stroke.push( { x : event_x, y : event_y } );
            //Si le mode symétrie est engagé
            if($("#symetrie").is(":checked")){
               //On calcule la coordonnée x de la ligne obtenue par symétrie
               //On n'a pas besoin de calculer un autre y parce que ce sera le même y que la ligne originale
               var second_x = canvas_middle + (canvas_middle - event_x);
               //On ajoute la coordonnée de symétrie au tableau de la ligne de symétrie
               symetricStroke.push( { x : second_x , y : event_y} );
            }         
         }//Si on est en mode "Sélectionner"
         else if($("input:radio[value=selectionner]").is(":checked")){
            //On remplace les coordonnées du rectangle de sélection par les coordonnées de l'événement
            selectionRectangle = [{x : event_x , y : event_y}];
         }//Si on est en mode "déplacer"
         else if($("input:radio[value=deplacer]").is(":checked")){
            //On calcule la différence entre la coordonnée de départ du déplacement et la coordonnée présente (en x et en y)
            var diffX = event_x - initialSelectMoveX;
            var diffY = event_y - initialSelectMoveY;
            //Pour tous les index contenus dans le tableau d'index sélectionnés
            //On arrête un index avant le dernier élément parce qu'il y a un élément undefined à la fin du tableau pour une raison obscure
            for(var j = 0; j < selectedStrokeIndexes.length; j++){
               //On crée un tableau qui contiendra toutes les nouvelles coordonnées pour la ligne courante
               var newCoordinatesArray = [];
               //On récupère la ligne d'origine correspondant à l'index dans le tableau de lignes sélectionnées
               var originalStroke = tempArrayOfSelectedStrokes[j];
               var index = selectedStrokeIndexes[j];

               if(originalStroke !== undefined){
                  //Pour toutes les coordonnées 
                  for(var k = 0; k < originalStroke.length; k++){
                     //On calcule le nouveau x et le nouveau y avec les coordonnées d'origine et la différence calculée au début du if
                     var originalx = originalStroke[k].x;
                     var originaly = originalStroke[k].y;
                     var newX = originalx + diffX;
                     var newY = originaly + diffY;
                     //On ajoute la nouvelle coordonnée au tableau de coordonnées
                     newCoordinatesArray.push({x : newX , y : newY});
                  }
                  //On change la ligne contenue dans le tableau de ligne du canvas par la nouvelle ligne créée avec les nouvelles coordonnées
                  arrayOfStrokes[index] = newCoordinatesArray;
                  //On change la ligne contenue dans le tableau de ligne sélectionnée par la nouvelle ligne créée avec les nouvelles coordonnées
                  selectedStrokes[j] = newCoordinatesArray;
               }
               
            }
         }
               
         //On redessine le canvas
         redraw();
      }
   }
   //On ajoute les listeners sur les événements de souris pour appeler les fonctions précédentes
   canvas.addEventListener('mousedown',mouseDownHandler);
   canvas.addEventListener('mouseup',mouseUpHandler);
   canvas.addEventListener('mousemove',mouseMoveHandler);

   //Fonction appelée pour dessiner une ligne qui prend en paramètre une ligne
   function drawStroke( s ) {
      if(s !== undefined){
         //On indique au canvas qu'on veut créer un nouveau chemin
         canvas_context.beginPath();
         //Pour toues les coordonnées contenues dans la ligne
         for ( var i = 0; i < s.length; ++i ) {
            //On récupère le x et le y pour alléger le code 
            var x = s[i].x;
            var y = s[i].y;
            //Si c'est la première coordonnée, on indique au canvas de se déplacer vers la coordonnée sans rien dessiner
            if ( i === 0 ) {
               canvas_context.moveTo(x,y);
            }
            //Si c'est une autre coordonnée que la première, on enregistre le chemin reliant la dernière coordonnée et celle présente
            else {
               canvas_context.lineTo(x,y);
            }
         }
         //On dessine le chemin enregistré
         canvas_context.stroke();
      }
   }

   //Fonction appelée pour dessiner le contour d'une ligne sélectionnée
   function drawBound( str ) {
      //On initialise les x min et max et les y min et max à 0
      var hx = 0;
      var hy = 0;
      var lx = 0;
      var ly = 0;
      // Pour toutes les coordonnées de la ligne sélectionnée
      for ( var i = 0; i < str.length; ++i ){
         // On récupère le x et le y
         var x = str[i].x;
         var y = str[i].y;

         // Si c'est la première coordonnée, on instancie les min et max de x et de y avec x et y
         // Si c'est une autre coordonnée, on change les valeurs mins et max au besoin
         if ( i === 0 ) {
            hx = lx = x;
            hy = ly = y;
         }else{
            if(x > hx){
               hx = x;
            }else if(x < lx){
               lx = x;
            }
            if(y > hy){
               hy = y;
            }else if(y < ly){
               ly = y;
            }
         }
      }
      // On dessine le contour de la ligne sélectionnée
      canvas_context.moveTo(hx,hy);
      canvas_context.lineTo(hx,ly);
      canvas_context.lineTo(lx,ly);
      canvas_context.lineTo(lx,hy);
      canvas_context.lineTo(hx,hy);
      canvas_context.stroke();
   }

   //Fonction appelée pour dessiner le rectangle de sélection créé quand on veut sélectionner des lignes
   function drawSelectionRectangle( sr ){
      //On déplace le curseur de canvas vers la coordonnée de départ sans rien dessiner
      canvas_context.moveTo(initialSelectMoveX,initialSelectMoveY);
      //On passe par les 3 autres points créés par les x et y min et max pour revenir au point de départ
      canvas_context.lineTo(initialSelectMoveX,sr.y);
      canvas_context.lineTo(sr.x,sr.y);
      canvas_context.lineTo(sr.x,initialSelectMoveY);
      canvas_context.lineTo(initialSelectMoveX,initialSelectMoveY);
      //On dessine le rectangle créé
      canvas_context.stroke();
   }

   //Variable contenant la fonction qui s'occupe de redessiner le canvas
   var redraw = function() {
      //On commence par vider le canvas au complet
      canvas_context.clearRect(0, 0, canvas.width, canvas.height);
     
      //On change la couleur des lignes qui seront dessinées pour noir
      canvas_context.strokeStyle = "#000000"; 
      //On appelle la fonction qui dessine les lignes pour toutes les lignes contenues dans le tableau de lignes
      for ( var i = 0; i < arrayOfStrokes.length; i++ ) {
         drawStroke( arrayOfStrokes[i] );
      }

      //On change la couleur des lignes qui seront dessinées pour bleu
      canvas_context.strokeStyle = "#0000ff";
      //On appelle la fonction qui dessine les contours de lignes sur les lignes du tableau de lignes sélectionnées
      for (var j=0; j < selectedStrokes.length; j++) {
         drawBound(selectedStrokes[j]);
      }

      //On change la couleur des lignes qui seront dessinées pour noir
      canvas_context.strokeStyle = "#000000";
      //On appelle la fonction qui dessine le rectangle de sélection
      for (var k=0; k < selectionRectangle.length; k++){
         drawSelectionRectangle(selectionRectangle[k]);
      }

      //On change la couleur des lignes qui seront dessinées pour gris
      canvas_context.strokeStyle = "#dfdfdf";
      //On dessine la ligne de symétrie centrale
      drawStroke( middleLine );

      //Si on est en train de dessiner une ligne
      if ( buttonIsDown && $("input:radio[value=dessiner]").is(":checked")) {
         //On change la couleur des lignes qui seront dessinées pour rouge
         canvas_context.strokeStyle = "#ff0000";
         //On dessine la ligne courante
         drawStroke( stroke );
         //S'il y a lieu on dessine la ligne créée par symétrie
         drawStroke( symetricStroke );
      }
      
   }

   //Au départ, on redessine le canvas
   redraw();

   //Fonction appelée par le bouton "clear"
   function clearButtonHandler() {
      //On vide les tableaux de lignes, de contour et de lignes sélectionnées
      arrayOfStrokes = [];
      arrayOfBounds = [];
      selectedStrokes = [];
      tempArrayOfSelectedStrokes = [];
      //On redessine le canvas
      redraw();
   }

   //Fonction appelée quand le checkbox de symétrie est cliqué
   function chkSymHandler(){
      //Si le checkbox est coché
      if($("#symetrie").is(":checked")){
         //On ajoute les coordonnées de la ligne de symétrie
         middleLine = [{x : canvas_middle, y : 0}, {x : canvas_middle, y : canvas.height}];
      }//Sinon
      else{
         //On vide le tableau de la ligne de symétrie centrale
         middleLine = [];
      }
      //On redessine le canvas
      redraw();
   }
});