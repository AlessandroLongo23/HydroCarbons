/*
   CRONOLOGIA DELLE VERSIONI v2.0
   (+1.0) griglia e grafo: struttura del programma
   (+0.1) alogeni
   (+0.1) nome della molecola
   (+0.1) struttura html e css
   (+0.1) evidenziazione della catena carboniosa e numerazione
   (+0.05) tasto di fullscreen e di reset
   (+0.05) gruppo ossidrile
   (+0.05) numeri di ossidazione
   (+0.05) gruppo etere
   (+0.05) gruppo carbonile
   (+0.1) alcheni e alchini: legami doppi e tripli
   (+0.25) aggiunta visualizzazione 3D
   (+0.05) aggiunta legami multipli 3D
*/

function draw() {
   if (frameCount > 1) {
      noCanvas()
      var container = document.getElementById("center")

      var cnv = document.getElementById("defaultCanvas1")
      cnv.id = "cnv_2D"

      container.appendChild(cnv)

      cnv = document.getElementById("defaultCanvas2")
      cnv.id = "cnv_3D"

      container.appendChild(cnv)

      visual_2D.onclick()
      noLoop()
   }
}

visual_3D = document.getElementById("label_3D")
visual_3D.onclick = function() {
   document.getElementById("cnv_2D").style.display = "none"
   document.getElementById("cnv_2D").style.position = "absolute"
   document.getElementById("cnv_2D").style.left = "2000px"

   document.getElementById("cnv_3D").style.display = "block"
   document.getElementById("cnv_3D").style.position = "relative"
   document.getElementById("cnv_3D").style.left = "0px"
}

visual_2D = document.getElementById("label_2D")
visual_2D.onclick = function() {
   document.getElementById("cnv_3D").style.display = "none"
   document.getElementById("cnv_3D").style.position = "absolute"
   document.getElementById("cnv_3D").style.left = "2000px"

   document.getElementById("cnv_2D").style.display = "block"
   document.getElementById("cnv_2D").style.position = "relative"
   document.getElementById("cnv_2D").style.left = "0px"
}

var ch3 = document.getElementById("CH3")
var ch2 = document.getElementById("CH2")
var ch = document.getElementById("CH")
var oh = document.getElementById("OH")
var o = document.getElementById("O")
var co = document.getElementById("CO")
var cooh = document.getElementById("COOH")
var coo = document.getElementById("COO")
var con = document.getElementById("CON")
var nh2 = document.getElementById("NH2")

var flscr = document.getElementById("flscr_btn")

var reset = document.getElementById("reset_btn")

var fluorine = document.getElementById("fluorine")
var chlorine = document.getElementById("chlorine")
var bromine = document.getElementById("bromine")
var iodine = document.getElementById("iodine")

var up_arrow = document.getElementById("up_arrow")
var left_arrow = document.getElementById("left_arrow")
var down_arrow = document.getElementById("down_arrow")
var right_arrow = document.getElementById("right_arrow")

ch3.onclick = function() {
   if (!selection) 
      selection = {};
   
   selection.group = "CH3"
   selection.box = createVector(side * 2 / 3, side / 2 + 1)
   selection.ch3_substitute = false
}

ch2.onclick = function() {
   selection.group = "CH2"
   selection.box = createVector(side * 2 / 3, side / 2 + 1)
   selection.ch3_substitute = false
}

ch.onclick = function() {
   selection.group = "CH"
   selection.box = createVector(side * 2 / 3, side / 2 + 1)
   selection.ch3_substitute = false
}

oh.onclick = function() {
   selection.group = "OH"
   selection.box = createVector(side * 2 / 3, side / 2 + 1)
   selection.ch3_substitute = false
}

o.onclick = function() {
   selection.group = "O"
   selection.box = createVector(side / 2 + 1, side / 2 + 1)
   selection.ch3_substitute = true
}

co.onclick = function() {
   selection.group = "CO"
   selection.box = createVector(side / 2 + 1, side / 2 + 1)
   selection.ch3_substitute = true
}

flscr.onclick = function() {
   if (!document.fullscreen) {
      document.documentElement.requestFullscreen()
      flscr.src = "../../../Icons/compress.png"
   } else {
      document.exitFullscreen();
      flscr.src = "../../../Icons/expand.png"
   }
}

reset.onclick = function() {
   node_index = 0
   selection.group = "CH3"
   selection.ch3_substitute = false
   cnv_2D.create_grid()
   cnv_2D.create_graph()
}

document.getElementById("show_name").onclick = function() {
   if (this.checked) {
      document.getElementById("molecule_name").innerHTML = graph.name
      document.getElementById("molecule_name").href = "https://it.wikipedia.org/wiki/" + graph.name
   } else {
      document.getElementById("molecule_name").innerHTML = "? ? ? ? ?"
      document.getElementById("molecule_name").href = "https://it.wikipedia.org/wiki/idrocarburi"
   }
}

fluorine.onclick = function() {
   selection.group = "F"
   selection.box = createVector(side / 2 + 1, side / 2 + 1)
   selection.ch3_substitute = false
}

chlorine.onclick = function() {
   selection.group = "Cl"
   selection.box = createVector(side / 2 + 1, side / 2 + 1)
   selection.ch3_substitute = false
}

bromine.onclick = function() {
   selection.group = "Br"
   selection.box = createVector(side * 2 / 3, side / 2 + 1)
   selection.ch3_substitute = false
}

iodine.onclick = function() {
   selection.group = "I"
   selection.box = createVector(side / 2 + 1, side / 2 + 1)
   selection.ch3_substitute = false
}

up_arrow.onclick = function() {
   up_wall = grid.some(row => row[0].state != -1);

   if (!up_wall) {
      for (var i = 0; i < grid_size; i++) {
         for (var j = 0; j < grid_size; j++) {
            if (j != grid_size - 1) {
               grid[i][j].index = grid[i][j + 1].index
               grid[i][j].state = grid[i][j + 1].state
            } else {
               grid[i][j].index = -1
               grid[i][j].state = -1
            }
         }
      }

      for (var m = 0; m < graph.nodes.length; m++)
         graph.nodes[m].grid_pos.y--
   }
}

left_arrow.onclick = function() {
   left_wall = grid[0].some(cell => cell.state != -1);

   if (!left_wall) {
      for (var i = 0; i < grid_size; i++) {
         for (var j = 0; j < grid_size; j++) {
            if (i != grid_size - 1) {
               grid[i][j].index = grid[i + 1][j].index
               grid[i][j].state = grid[i + 1][j].state
            } else {
               grid[i][j].index = -1
               grid[i][j].state = -1
            }
         }
      }

      for (var m = 0; m < graph.nodes.length; m++)
         graph.nodes[m].grid_pos.x--
   }
}

down_arrow.onclick = function() {
   bottom_wall = grid.some(row => row[grid_size - 1].state != -1);

   if (!bottom_wall) {
      for (var i = 0; i < grid_size; i++) {
         for (var j = grid_size - 1; j >= 0; j--) {
            if (j != 0) {
               grid[i][j].index = grid[i][j - 1].index
               grid[i][j].state = grid[i][j - 1].state
            } else {
               grid[i][j].index = -1
               grid[i][j].state = -1
            }
         }
      }

      for (var m = 0; m < graph.nodes.length; m++)
         graph.nodes[m].grid_pos.y++
   }
}

right_arrow.onclick = function() {
   right_wall = grid[grid_size - 1].some(cell => cell.state != -1);

   if (!right_wall) {
      for (var i = grid_size - 1; i >= 0; i--) {
         for (var j = 0; j < grid_size; j++) {
            if (i != 0) {
               grid[i][j].index = grid[i - 1][j].index
               grid[i][j].state = grid[i - 1][j].state
            } else {
               grid[i][j].index = -1
               grid[i][j].state = -1
            }
         }
      }

      for (var m = 0; m < graph.nodes.length; m++)
         graph.nodes[m].grid_pos.x++
   }
}
