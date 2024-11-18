/*
   TO DO LIST:

   1. possibilità di modificare il numero di legami dalla griglia
   2. sistemare i nomi quando sono presenti più gruppi diversi contemporaneamente
   3. reazioni omolitiche ed eterolitiche (+0.05)
   4. effetto induttivo (+0.05)
   5. cicloalcani (+0.1)
   6. COOH, COO, CON, NH2 (+0.05 each)
*/

let selection;

cnv1 = (c) => {
   c.preload = function() {
	  varela = loadFont("../../../Fonts/Varela/varela.ttf");
	  background_img = loadImage("background.jpg");
   }

   c.setup = function() {
	  c.createCanvas(595, 595);

	  grid_size = 9;

	  side = (c.width - 1) / grid_size;

	  ch3.onclick();

	  chn_box = createVector((side + 6) * 3 / 4, side / 2 + 1);
	  ch_box = createVector((side - 2) * 3 / 4, side / 2 + 1);
	  c_box = createVector(side / 2 + 1, side / 2 + 1);

	  delete_timer = 60;
	  add_timer = 60;

	  node_index = 0;

	  c.create_grid();
	  c.create_graph();

	  c.textAlign(c.CENTER, c.CENTER);
	  c.textFont(varela);
	  c.rectMode(c.CENTER);

	  hue = 177;
	  document.documentElement.style.setProperty('--dark', 'hsl(' + hue + ', 100%, 30%)');
	  document.documentElement.style.setProperty('--light', 'hsl(' + hue + ', 100%, 90%)');
	  document.documentElement.style.setProperty('--opposite-dark', 'hsl(' + (hue + 180) % 360 + ', 100%, 30%)');
	  document.documentElement.style.setProperty('--opposite-light', 'hsl(' + (hue + 180) % 360 + ', 100%, 90%)');
   }

   c.draw = function() {
	  background_pos = createVector(
		 -c.drawingContext.canvas.offsetLeft - 220,
		 -c.drawingContext.canvas.offsetTop - 365
	  );
	  c.image(background_img, background_pos.x, background_pos.y);
	  c.background(255, 200);

	  c.visualize_grid();
	  c.add_or_cancel();

	  add_timer++;
	  delete_timer++;
   }

   c.create_grid = function() {
	  grid = matrix(grid_size, grid_size);

	  for (let i = 0; i < grid_size; i++)
		 for (let j = 0; j < grid_size; j++)
			grid[i][j] = {
			   state: -1,
			   index: -1
			};

	  grid[(grid_size - 1) / 2][(grid_size - 1) / 2] = {
		 state: 1,
		 index: node_index
	  };
   }

   c.create_graph = function() {
	  graph = new Graph();

	  graph.nodes.push({
		 group: "CH3",
		 type: "C",
		 index: node_index,
		 grid_pos: c.createVector((grid_size - 1) / 2, (grid_size - 1) / 2),
		 neighbours: []
	  });

	  node_index++;

	  c.process_molecule();
   }

   c.visualize_grid = function() {
	  let main_color;
	  let ether = graph.nodes.some(node => node.group == "O");

	  if (document.getElementById("highlight").checked) {
		 c.noStroke();

		 if (ether) {
			let left_length = graph.left_chain.length;
			let right_length = graph.right_chain.length;
			let left_substituents = graph.count_substituents(graph.left_chain);
			let right_substituents = graph.count_substituents(graph.right_chain);

			let is_left_longer = left_length > right_length;
			let is_right_longer = right_length > left_length;
			let is_same_length_with_more_left_substituents = left_length == right_length && left_substituents >= right_substituents;
			let is_same_length_with_more_right_substituents = left_length == right_length && right_substituents >= left_substituents;
 
			if (is_left_longer || is_same_length_with_more_left_substituents) {
			   main_color = "sx";
			   c.fill(255, 255, 100);
			   for (let i = 0; i < graph.left_chain.length; i++) {
				  c.rect(
					 graph.nodes[graph.left_chain[i]].grid_pos.x * side + side / 2,
					 graph.nodes[graph.left_chain[i]].grid_pos.y * side + side / 2,
					 side, side
				  );
			   }

			   c.fill(100, 255, 100);
			   for (let i = 0; i < graph.right_chain.length; i++) {
				  c.rect(
					 graph.nodes[graph.right_chain[i]].grid_pos.x * side + side / 2,
					 graph.nodes[graph.right_chain[i]].grid_pos.y * side + side / 2,
					 side, side
				  );
			   }
			} else if (is_right_longer || is_same_length_with_more_right_substituents) {
			   main_color = "dx";
			   c.fill(100, 255, 100);
			   for (let i = 0; i < graph.left_chain.length; i++) {
				  c.rect(
					 graph.nodes[graph.left_chain[i]].grid_pos.x * side + side / 2,
					 graph.nodes[graph.left_chain[i]].grid_pos.y * side + side / 2,
					 side, side
				  );
			   }

			   c.fill(255, 255, 100);
			   for (let i = 0; i < graph.right_chain.length; i++) {
				  c.rect(
					 graph.nodes[graph.right_chain[i]].grid_pos.x * side + side / 2,
					 graph.nodes[graph.right_chain[i]].grid_pos.y * side + side / 2,
					 side, side
				  );
			   }
			}
		 } else {
			c.fill(255, 255, 100);
			for (let i = 0; i < graph.main_chain.length; i++) {
			   c.rect(
				  graph.nodes[graph.main_chain[i]].grid_pos.x * side + side / 2,
				  graph.nodes[graph.main_chain[i]].grid_pos.y * side + side / 2,
				  side, side
			   );
			}
		 }
	  }

	  c.stroke(128);
	  c.strokeWeight(1);
	  for (let i = 0; i <= grid_size; i++) {
		 c.line(i * side, 0, i * side, c.height);
		 c.line(0, i * side, c.width, i * side);
	  }

	  c.stroke(255, 0, 0);
	  c.strokeWeight(2);
	  mouse_action = false;
	  for (let i = 0; i < grid_size; i++) {
		 for (let j = 0; j < grid_size; j++) {
			if (
			   c.mouseX >= i * side &&
			   c.mouseX <= (i + 1) * side &&
			   c.mouseY >= j * side &&
			   c.mouseY <= (j + 1) * side &&
			   grid[i][j].state == -1
			) {
			   c.new_group_preview(i, j);
			}
		 }
	  }

	  c.stroke(0);
	  c.strokeWeight(2);
	  for (let i = 0; i < graph.links.length; i++) {
		 switch (graph.links[i].z) {
			case 1:
			   c.line(
				  graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
				  graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
				  graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
				  graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
			   )
			   break;
			case 2:
			   if (graph.nodes[graph.links[i].x].grid_pos.x - graph.nodes[graph.links[i].y].grid_pos.x == 0) {
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2 - 5,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2 - 5,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2 + 5,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2 + 5,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
			   } else {
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2 - 5,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2 - 5
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2 + 5,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2 + 5
				  )
			   }
			   break;
			case 3:
			   if (graph.nodes[graph.links[i].x].grid_pos.x - graph.nodes[graph.links[i].y].grid_pos.x == 0) {
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2 - 7,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2 - 7,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2 + 7,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2 + 7,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
			   } else {
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2 - 7,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2 - 7
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2
				  )
				  c.line(
					 graph.nodes[graph.links[i].x].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].x].grid_pos.y * side + side / 2 + 7,
					 graph.nodes[graph.links[i].y].grid_pos.x * side + side / 2,
					 graph.nodes[graph.links[i].y].grid_pos.y * side + side / 2 + 7
				  )
			   }
			   break;
		 }
	  }

	  for (let i = 0; i < grid_size; i++) {
		 for (let j = 0; j < grid_size; j++) {
			if (grid[i][j].state == 1) {
			   c.textSize(25)
			   c.noStroke()
			   if (graph.nodes[grid[i][j].index].hydrogens == 0) {
				  if (
					 (
						graph.main_chain.includes(grid[i][j].index) ||
						graph.left_chain.includes(grid[i][j].index) ||
						graph.right_chain.includes(grid[i][j].index)
					 ) &&
					 document.getElementById("highlight").checked
				  ) {
					 if (
						graph.main_chain.includes(grid[i][j].index) ||
						(graph.left_chain.includes(grid[i][j].index) && main_color == "sx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "dx")
					 ) {
						c.fill(255, 255, 100)
					 } else if (
						(graph.left_chain.includes(grid[i][j].index) && main_color == "dx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "sx")
					 ) {
						c.fill(100, 255, 100)
					 }
					 c.rect(i * side + side / 2, j * side + side / 2, side / 2, side / 2)
				  } else {
					 c.image(
						background_img,
						i * side + side / 2 - c_box.x / 2,
						j * side + side / 2 - c_box.y / 2,
						c_box.x,
						c_box.y,
						-background_pos.x + i * side + side / 2 - c_box.x / 2,
						-background_pos.y + j * side + side / 2 - c_box.y / 2,
						c_box.x,
						c_box.y,
					 )
					 c.fill(255, 200)
					 c.rect(i * side + side / 2, j * side + side / 2, c_box.x, c_box.y)
				  }
				  c.fill(0)
				  c.text("C", i * side + side / 2, j * side + side / 2 - 2)
			   } else if (graph.nodes[grid[i][j].index].hydrogens == 1) {
				  if (
					 (
						graph.main_chain.includes(grid[i][j].index) ||
						graph.left_chain.includes(grid[i][j].index) ||
						graph.right_chain.includes(grid[i][j].index)
					 ) &&
					 document.getElementById("highlight").checked
				  ) {
					 if (
						graph.main_chain.includes(grid[i][j].index) ||
						(graph.left_chain.includes(grid[i][j].index) && main_color == "sx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "dx")
					 ) {
						c.fill(255, 255, 100)
					 } else if (
						(graph.left_chain.includes(grid[i][j].index) && main_color == "dx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "sx")
					 ) {
						c.fill(100, 255, 100)
					 }
					 c.rect(i * side + side / 2, j * side + side / 2, side * 7 / 10, side / 2)
				  } else {
					 c.image(
						background_img,
						i * side + side / 2 - ch_box.x / 2,
						j * side + side / 2 - ch_box.y / 2,
						ch_box.x,
						ch_box.y,
						-background_pos.x + i * side + side / 2 - ch_box.x / 2,
						-background_pos.y + j * side + side / 2 - ch_box.y / 2,
						ch_box.x,
						ch_box.y,
					 )
					 c.fill(255, 200)
					 c.rect(i * side + side / 2, j * side + side / 2, ch_box.x, ch_box.y)
				  }
				  c.fill(0)
				  c.text("CH", i * side + side / 2, (j + 1 / 2) * side - 2)
			   } else {
				  if (
					 (
						graph.main_chain.includes(grid[i][j].index) ||
						graph.left_chain.includes(grid[i][j].index) ||
						graph.right_chain.includes(grid[i][j].index)
					 ) &&
					 document.getElementById("highlight").checked
				  ) {
					 if (
						graph.main_chain.includes(grid[i][j].index) ||
						(graph.left_chain.includes(grid[i][j].index) && main_color == "sx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "dx")
					 ) {
						c.fill(255, 255, 100)
					 } else if (
						(graph.left_chain.includes(grid[i][j].index) && main_color == "dx") ||
						(graph.right_chain.includes(grid[i][j].index) && main_color == "sx")
					 ) {
						c.fill(100, 255, 100)
					 }
					 c.rect(i * side + side / 2, j * side + side / 2, side * 4 / 5, side / 2)
				  } else {
					 c.image(
						background_img,
						i * side + side / 2 - chn_box.x / 2,
						j * side + side / 2 - chn_box.y / 2,
						chn_box.x,
						chn_box.y,
						-background_pos.x + i * side + side / 2 - chn_box.x / 2,
						-background_pos.y + j * side + side / 2 - chn_box.y / 2,
						chn_box.x,
						chn_box.y,
					 )
					 c.fill(255, 200)
					 c.rect(i * side + side / 2, j * side + side / 2, chn_box.x, chn_box.y)
				  }
				  c.fill(0)
				  c.text("CH", i * side + side / 2 - 3, (j + 1 / 2) * side - 2)
				  c.textSize(15)
				  c.stroke(0)
				  c.strokeWeight(0.5)
				  c.text(graph.nodes[grid[i][j].index].hydrogens, i * side + side / 2 + 20, (j + 1 / 2) * side + 5)
			   }

			   c.strokeWeight(1)
			   if (
				  graph.nodes[grid[i][j].index].carbon_n &&
				  document.getElementById("numbers").checked
			   ) {
				  c.stroke(255, 0, 0)
				  c.fill(255, 0, 0)
				  c.textSize(15)
				  c.text(graph.nodes[grid[i][j].index].carbon_n, i * side + side * 4 / 5, j * side + side * 1 / 4)
			   }

			   if (
				  grid[i][j].state == 1 &&
				  document.getElementById("oxidation_n").checked
			   ) {
				  c.stroke(0, 0, 255)
				  c.fill(0, 0, 255)
				  c.textSize(15)
				  if (graph.nodes[grid[i][j].index].oxidation_n <= 0) {
					 c.text(graph.nodes[grid[i][j].index].oxidation_n, i * side + side * 1 / 5, j * side + side * 1 / 4)
				  } else {
					 c.text("+" + graph.nodes[grid[i][j].index].oxidation_n, i * side + side * 1 / 5, j * side + side * 1 / 4)
				  }
			   }
			} else if (grid[i][j].state == 0) {
			   c.textSize(25)
			   c.noStroke()
			   c.fill(255)
			   c.image(
				  background_img,
				  i * side + side / 2 - graph.nodes[grid[i][j].index].box.x / 2,
				  j * side + side / 2 - graph.nodes[grid[i][j].index].box.y / 2,
				  graph.nodes[grid[i][j].index].box.x,
				  graph.nodes[grid[i][j].index].box.y,
				  -background_pos.x + i * side + side / 2 - graph.nodes[grid[i][j].index].box.x / 2,
				  -background_pos.y + j * side + side / 2 - graph.nodes[grid[i][j].index].box.y / 2,
				  graph.nodes[grid[i][j].index].box.x,
				  graph.nodes[grid[i][j].index].box.y
			   )
			   c.fill(255, 200)
			   c.rect(
				  i * side + side / 2,
				  j * side + side / 2,
				  graph.nodes[grid[i][j].index].box.x,
				  graph.nodes[grid[i][j].index].box.y
			   )

			   switch (graph.nodes[grid[i][j].index].type) {
				  case "F":
					 c.stroke(200, 180, 0)
					 c.fill(255, 220, 0)
					 break;
				  case "Cl":
					 c.stroke(0, 80, 0)
					 c.fill(0, 138, 37)
					 break;
				  case "Br":
					 c.stroke(0, 0, 0)
					 c.fill(69, 69, 69)
					 break;
				  case "I":
					 c.stroke(0, 0, 60)
					 c.fill(48, 7, 122)
					 break;
				  default:
					 c.fill(0)
					 break;
			   }
			   c.strokeWeight(1)
			   c.text(graph.nodes[grid[i][j].index].type, i * side + 34, (j + 1 / 2) * side - 2)
			}
		 }
	  }

	  c.stroke(255, 0, 0)
	  c.strokeWeight(2)
	  for (let i = 0; i < grid_size; i++) {
		 for (let j = 0; j < grid_size; j++) {
			if (
			   c.mouseX >= i * side &&
			   c.mouseX <= (i + 1) * side &&
			   c.mouseY >= j * side &&
			   c.mouseY <= (j + 1) * side
			) {
			   if (
				  grid[i][j].state != -1 &&
				  graph.nodes.length > 1 &&
				  graph.nodes[grid[i][j].index].neighbours.length == 1 &&
				  !selection.ch3_substitute &&
				  !(graph.nodes[grid[i][j].index].neighbours.length == 1 && graph.nodes[graph.nodes[grid[i][j].index].neighbours[0]].type != "C") &&
				  ((delete_timer > 60 && grid[i][j].index == node_index - 1) || (grid[i][j].index != node_index - 1)) &&
				  !(graph.nodes[grid[i][j].index].group == "CO" && graph.nodes[grid[i][j].index].type == "O")
			   ) {
				  mouse_action = "delete"
				  c.stroke(255, 0, 0)
				  c.strokeWeight(3)
				  c.line(i * side + side / 4, j * side + side / 4, i * side + side * 3 / 4, j * side + side * 3 / 4)
				  c.line(i * side + side * 3 / 4, j * side + side / 4, i * side + side / 4, j * side + side * 3 / 4)
			   } else if (
				  delete_timer > 60 &&
				  grid[i][j].state != -1 &&
				  graph.nodes.length > 1 &&
				  graph.nodes[grid[i][j].index].group != selection.group && (
					 (
						selection.group == "CH3" && (
						   (
							  grid[i][j].state == 0 &&
							  !(
								 graph.nodes[grid[i][j].index].group == "CO" &&
								 graph.nodes[grid[i][j].index].type == "O"
							  ) || (
								 grid[i][j].state == 1 &&
								 graph.nodes[grid[i][j].index].group == "CO" &&
								 graph.nodes[grid[i][j].index].type == "C"
							  )
						   )
						)
					 ) ||
					 (
						selection.group == "O" &&
						graph.nodes[grid[i][j].index].neighbours.length == 2 &&
						!ether
					 ) ||
					 (
						selection.group == "CO" &&
						(
						   graph.nodes[grid[i][j].index].neighbours.length == 1 ||
						   graph.nodes[grid[i][j].index].neighbours.length == 2
						)
					 )
				  )
			   ) {
				  mouse_action = "switch"
				  c.stroke(255, 0, 0)
				  c.strokeWeight(3)
				  c.triangle(
					 i * side + side / 2 + (side / 8 * 3) * cos(PI / 2 + PI / 9),
					 j * side + side / 2 + (side / 8 * 3) * sin(PI / 2 + PI / 9),
					 i * side + side / 2 + (side / 8 * 3) * cos(PI / 2 + PI / 9) - 5,
					 j * side + side / 2 + (side / 8 * 3) * sin(PI / 2 + PI / 9),
					 i * side + side / 2 + (side / 8 * 3) * cos(PI / 2 + PI / 9),
					 j * side + side / 2 + (side / 8 * 3) * sin(PI / 2 + PI / 9) - 5,
				  )
				  c.triangle(
					 i * side + side / 2 + (side / 8 * 3) * cos(-PI / 2 + PI / 9),
					 j * side + side / 2 + (side / 8 * 3) * sin(-PI / 2 + PI / 9),
					 i * side + side / 2 + (side / 8 * 3) * cos(-PI / 2 + PI / 9) + 5,
					 j * side + side / 2 + (side / 8 * 3) * sin(-PI / 2 + PI / 9),
					 i * side + side / 2 + (side / 8 * 3) * cos(-PI / 2 + PI / 9),
					 j * side + side / 2 + (side / 8 * 3) * sin(-PI / 2 + PI / 9) + 5,
				  )
				  c.noFill()
				  c.arc(
					 i * side + side / 2,
					 j * side + side / 2,
					 side / 4 * 3, side / 4 * 3,
					 PI / 2 + PI / 9,
					 PI / 2 * 3 - PI / 9, OPEN
				  )
				  c.arc(
					 i * side + side / 2,
					 j * side + side / 2,
					 side / 4 * 3, side / 4 * 3,
					 -PI / 2 + PI / 9,
					 PI / 2 - PI / 9, OPEN
				  )
			   }
			}
		 }
	  }
   }

   c.new_group_preview = function(i, j) {
	  let adjacents = []
	  if (j > 0 && grid[i][j - 1].state == 1) {
		 adjacents[0] = 1
	  } else {
		 adjacents[0] = 0
	  }

	  if (i < grid_size - 1 && grid[i + 1][j].state == 1) {
		 adjacents[1] = 1
	  } else {
		 adjacents[1] = 0
	  }

	  if (j < grid_size - 1 && grid[i][j + 1].state == 1) {
		 adjacents[2] = 1
	  } else {
		 adjacents[2] = 0
	  }

	  if (i > 0 && grid[i - 1][j].state == 1) {
		 adjacents[3] = 1
	  } else {
		 adjacents[3] = 0
	  }

	  let sum = 0
	  for (let a = 0; a < 4; a++) {
		 sum += adjacents[a]
	  }

	  x = (c.mouseX - i * side)
	  y = (c.mouseY - j * side)

	  c.strokeWeight(2)
	  c.stroke(0, 150)

	  if (
		 grid[i][j].state == -1 &&
		 adjacents[0] == 1 && (
			(
			   graph.nodes[grid[i][j - 1].index].hydrogens > 0 &&
			   selection.group != "CH2" && selection.group != "CH"
			) || (
			   graph.nodes[grid[i][j - 1].index].hydrogens > 1 &&
			   selection.group == "CH2"
			) || (
			   graph.nodes[grid[i][j - 1].index].hydrogens > 2 &&
			   selection.group == "CH"
			)
		 ) &&
		 !selection.ch3_substitute &&
		 ((sum >= 2 && x > y && side - x > y) || (sum == 1))
	  ) {
		 switch (selection.group) {
			case "CH":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side / 2,
				  j * side - side / 2
			   )
			   c.line(
				  i * side + side / 2 - 7,
				  j * side + side / 2,
				  i * side + side / 2 - 7,
				  j * side - side / 2
			   )
			   c.line(
				  i * side + side / 2 + 7,
				  j * side + side / 2,
				  i * side + side / 2 + 7,
				  j * side - side / 2
			   )
			   break;
			case "CH2":
			   c.line(
				  i * side + side / 2 - 5,
				  j * side + side / 2,
				  i * side + side / 2 - 5,
				  j * side - side / 2
			   )
			   c.line(
				  i * side + side / 2 + 5,
				  j * side + side / 2,
				  i * side + side / 2 + 5,
				  j * side - side / 2
			   )
			   break;
			default:
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side / 2,
				  j * side - side / 2
			   )
			   break;
		 }
		 mouse_action = "up"
	  }
	  else if (
		 grid[i][j].state == -1 &&
		 adjacents[1] == 1 && (
			(
			   graph.nodes[grid[i + 1][j].index].hydrogens > 0 &&
			   selection.group != "CH2" && selection.group != "CH"
			) || (
			   graph.nodes[grid[i + 1][j].index].hydrogens > 1 &&
			   selection.group == "CH2"
			) || (
			   graph.nodes[grid[i + 1][j].index].hydrogens > 2 &&
			   selection.group == "CH"
			)
		 ) &&
		 graph.nodes[grid[i + 1][j].index].hydrogens > 0 &&
		 !selection.ch3_substitute &&
		 ((sum >= 2 && x > y && side - x < y) || (sum == 1))
	  ) {
		 switch (selection.group) {
			case "CH":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side * 3 / 2,
				  j * side + side / 2
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 - 7,
				  i * side + side * 3 / 2,
				  j * side + side / 2 - 7
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 + 7,
				  i * side + side * 3 / 2,
				  j * side + side / 2 + 7
			   )
			   break;
			case "CH2":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 - 5,
				  i * side + side * 3 / 2,
				  j * side + side / 2 - 5
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 + 5,
				  i * side + side * 3 / 2,
				  j * side + side / 2 + 5
			   )
			   break;
			default:
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side * 3 / 2,
				  j * side + side / 2
			   )
			   break;
		 }
		 mouse_action = "dx"
	  }
	  else if (
		 grid[i][j].state == -1 &&
		 adjacents[2] == 1 && (
			(
			   graph.nodes[grid[i][j + 1].index].hydrogens > 0 &&
			   selection.group != "CH2" && selection.group != "CH"
			) || (
			   graph.nodes[grid[i][j + 1].index].hydrogens > 1 &&
			   selection.group == "CH2"
			) || (
			   graph.nodes[grid[i][j + 1].index].hydrogens > 2 &&
			   selection.group == "CH"
			)
		 ) &&
		 graph.nodes[grid[i][j + 1].index].hydrogens > 0 &&
		 !selection.ch3_substitute &&
		 ((sum >= 2 && y > x && side - y < x) || (sum == 1))
	  ) {
		 switch (selection.group) {
			case "CH":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side / 2,
				  j * side + side * 3 / 2
			   )
			   c.line(
				  i * side + side / 2 - 7,
				  j * side + side / 2,
				  i * side + side / 2 - 7,
				  j * side + side * 3 / 2
			   )
			   c.line(
				  i * side + side / 2 + 7,
				  j * side + side / 2,
				  i * side + side / 2 + 7,
				  j * side + side * 3 / 2
			   )
			   break;
			case "CH2":
			   c.line(
				  i * side + side / 2 - 5,
				  j * side + side / 2,
				  i * side + side / 2 - 5,
				  j * side + side * 3 / 2
			   )
			   c.line(
				  i * side + side / 2 + 5,
				  j * side + side / 2,
				  i * side + side / 2 + 5,
				  j * side + side * 3 / 2
			   )
			   break;
			default:
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side + side / 2,
				  j * side + side * 3 / 2
			   )
			   break;
		 }
		 mouse_action = "down"
	  }
	  else if (
		 grid[i][j].state == -1 &&
		 adjacents[3] == 1 && (
			(
			   graph.nodes[grid[i - 1][j].index].hydrogens > 0 &&
			   selection.group != "CH2" && selection.group != "CH"
			) || (
			   graph.nodes[grid[i - 1][j].index].hydrogens > 1 &&
			   selection.group == "CH2"
			) || (
			   graph.nodes[grid[i - 1][j].index].hydrogens > 2 &&
			   selection.group == "CH"
			)
		 ) &&
		 graph.nodes[grid[i - 1][j].index].hydrogens > 0 &&
		 !selection.ch3_substitute &&
		 ((sum >= 2 && y > x && side - y > x) || (sum == 1))
	  ) {
		 switch (selection.group) {
			case "CH":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side - side / 2,
				  j * side + side / 2
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 - 7,
				  i * side - side / 2,
				  j * side + side / 2 - 7
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 + 7,
				  i * side - side / 2,
				  j * side + side / 2 + 7
			   )
			   break;
			case "CH2":
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 - 5,
				  i * side - side / 2,
				  j * side + side / 2 - 5
			   )
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2 + 5,
				  i * side - side / 2,
				  j * side + side / 2 + 5
			   )
			   break;
			default:
			   c.line(
				  i * side + side / 2,
				  j * side + side / 2,
				  i * side - side / 2,
				  j * side + side / 2
			   )
			   break;
		 }
		 mouse_action = "sx"
	  }

	  if (mouse_action != false) {
		 switch (selection.group) {
			case "CH3":
			   c.noStroke()
			   c.image(
				  background_img,
				  i * side + side / 2 - chn_box.x / 2,
				  j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
				  -background_pos.x + i * side + side / 2 - chn_box.x / 2,
				  -background_pos.y + j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
			   )
			   c.fill(255, 200)
			   c.rect(
				  i * side + side / 2,
				  j * side + side / 2,
				  chn_box.x,
				  chn_box.y
			   )

			   c.textSize(25)
			   c.fill(0, 100)
			   c.text("CH", i * side + 30, (j + 1 / 2) * side - 2)
			   c.textSize(15)
			   c.stroke(0, 100)
			   c.strokeWeight(0.5)
			   c.text("3", i * side + 53, (j + 1 / 2) * side + 5)
			   break;
			case "CH2":
			   c.noStroke()
			   c.image(
				  background_img,
				  i * side + side / 2 - chn_box.x / 2,
				  j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
				  -background_pos.x + i * side + side / 2 - chn_box.x / 2,
				  -background_pos.y + j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
			   )
			   c.fill(255, 200)
			   c.rect(
				  i * side + side / 2,
				  j * side + side / 2,
				  chn_box.x,
				  chn_box.y
			   )

			   c.textSize(25)
			   c.fill(0, 100)
			   c.text("CH", i * side + 30, (j + 1 / 2) * side - 2)
			   c.textSize(15)
			   c.stroke(0, 100)
			   c.strokeWeight(0.5)
			   c.text("2", i * side + 53, (j + 1 / 2) * side + 5)
			   break;
			case "CH":
			   c.noStroke()
			   c.image(
				  background_img,
				  i * side + side / 2 - chn_box.x / 2,
				  j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
				  -background_pos.x + i * side + side / 2 - chn_box.x / 2,
				  -background_pos.y + j * side + side / 2 - chn_box.y / 2,
				  chn_box.x,
				  chn_box.y,
			   )
			   c.fill(255, 200)
			   c.rect(
				  i * side + side / 2,
				  j * side + side / 2,
				  chn_box.x,
				  chn_box.y
			   )

			   c.textSize(25)
			   c.fill(0, 100)
			   c.text("CH", i * side + side / 2, (j + 1 / 2) * side - 2)
			   break;
			case "OH":
			case "F":
			case "Cl":
			case "Br":
			case "I":
			   c.noStroke()
			   c.image(
				  background_img,
				  i * side + side / 2 - selection.box.x / 2,
				  j * side + side / 2 - selection.box.y / 2,
				  selection.box.x,
				  selection.box.y,
				  -background_pos.x + i * side + side / 2 - selection.box.x / 2,
				  -background_pos.y + j * side + side / 2 - selection.box.y / 2,
				  selection.box.x,
				  selection.box.y,
			   )
			   c.fill(255, 200)
			   c.rect(
				  i * side + side / 2,
				  j * side + side / 2,
				  selection.box.x,
				  selection.box.y
			   )

			   c.textSize(25)
			   c.fill(0, 100)
			   c.text(selection.group, i * side + side / 2, (j + 1 / 2) * side - 2)
			   break;
		 }
	  }
   }

   c.add_or_cancel = function() {
	  if (mouseIsPressed) {
		 for (let i = 0; i < grid_size; i++) {
			for (let j = 0; j < grid_size; j++) {
			   if (
				  c.mouseX > i * side &&
				  c.mouseX < (i + 1) * side &&
				  c.mouseY > j * side &&
				  c.mouseY < (j + 1) * side
			   ) {
				  if (
					 grid[i][j].state == -1 &&
					 mouse_action &&
					 !selection.ch3_substitute &&
					 add_timer > 60
				  ) {
					 delete_timer = 0

					 if (
						selection.group == "CH3" ||
						selection.group == "CH2" ||
						selection.group == "CH"
					 ) {
						grid[i][j].state = 1
						graph.nodes.push({
						   group: selection.group,
						   type: "C",
						   index: node_index,
						   grid_pos: c.createVector(i, j),
						   neighbours: []
						})
					 } else {
						grid[i][j].state = 0
						graph.nodes.push({
						   group: selection.group,
						   type: selection.group,
						   index: node_index,
						   box: selection.box,
						   grid_pos: c.createVector(i, j),
						   neighbours: []
						})
					 }

					 grid[i][j].index = node_index

					 switch (mouse_action) {
						case "up":
						   nbr = createVector(i, j - 1)
						   break;
						case "dx":
						   nbr = createVector(i + 1, j)
						   break;
						case "down":
						   nbr = createVector(i, j + 1)
						   break;
						case "sx":
						   nbr = createVector(i - 1, j)
						   break;
					 }

					 switch (selection.group) {
						case "CH":
						   graph.links.push(c.createVector(node_index, grid[nbr.x][nbr.y].index, 3))
						   break;
						case "CH2":
						   graph.links.push(c.createVector(node_index, grid[nbr.x][nbr.y].index, 2))
						   break;
						default:
						   graph.links.push(c.createVector(node_index, grid[nbr.x][nbr.y].index, 1))
						   break;
					 }
					 graph.nodes[node_index].neighbours.push(grid[nbr.x][nbr.y].index)
					 graph.nodes[grid[nbr.x][nbr.y].index].neighbours.push(node_index)

					 if (
						graph.nodes[grid[nbr.x][nbr.y].index].group == "CH3" &&
						(
						   selection.group == "CH2" ||
						   selection.group == "CH"
						)
					 ) {
						graph.nodes[grid[nbr.x][nbr.y].index].group = selection.group
					 }
					 node_index++

					 c.process_molecule()
				  }

				  else if (
					 grid[i][j].state != -1 &&
					 graph.nodes.length > 1 &&
					 mouse_action == "delete"
				  ) {
					 add_timer = 0

					 if (
						graph.nodes[grid[i][j].index].group == "CH2" ||
						graph.nodes[grid[i][j].index].group == "CH"
					 ) {
						for (let l = 0; l < graph.nodes[grid[i][j].index].neighbours.length; l++) {
						   if (
							  graph.nodes[graph.nodes[grid[i][j].index].neighbours[l]].group == "CH2" ||
							  graph.nodes[graph.nodes[grid[i][j].index].neighbours[l]].group == "CH"
						   ) {
							  graph.nodes[graph.nodes[grid[i][j].index].neighbours[l]].group = "CH3"
						   }
						}
					 }

					 for (let l = 0; l < graph.links.length; l++) {
						if (graph.links[l].x == grid[i][j].index) {
						   graph.nodes[graph.links[l].y].neighbours.splice(graph.nodes[graph.links[l].y].neighbours.indexOf(graph.links[l].x), 1)
						   graph.links.splice(l, 1)
						} else if (graph.links[l].y == grid[i][j].index) {
						   graph.nodes[graph.links[l].x].neighbours.splice(graph.nodes[graph.links[l].x].neighbours.indexOf(graph.links[l].y), 1)
						   graph.links.splice(l, 1)
						}
					 }

					 for (let l = grid[i][j].index + 1; l < graph.nodes.length; l++) {
						graph.nodes[l].index--
					 }

					 for (let m = 0; m < graph.nodes.length; m++) {
						for (let l = 0; l < graph.nodes[m].neighbours.length; l++) {
						   if (graph.nodes[m].neighbours[l] > grid[i][j].index) {
							  graph.nodes[m].neighbours[l]--
						   }
						}
					 }

					 for (let l = 0; l < graph.links.length; l++) {
						if (graph.links[l].x > grid[i][j].index) {
						   graph.links[l].x--
						}
						if (graph.links[l].y > grid[i][j].index) {
						   graph.links[l].y--
						}
					 }

					 for (let x = 0; x < grid_size; x++) {
						for (let y = 0; y < grid_size; y++) {
						   if (grid[x][y].state != -1 && grid[x][y].index > grid[i][j].index) {
							  grid[x][y].index--
						   }
						}
					 }
					 node_index--

					 graph.nodes.splice(grid[i][j].index, 1)

					 grid[i][j].state = -1
					 grid[i][j].index = -1

					 c.process_molecule()
				  } else if (
					 graph.nodes.length > 1 &&
					 mouse_action == "switch"
				  ) {
					 delete_timer = 0
					 switch (graph.nodes[grid[i][j].index].group) {
						case "CH3":
						   switch (selection.group) {
							  case "O":
								 grid[i][j].state = 0

								 graph.nodes[grid[i][j].index].group = selection.group
								 graph.nodes[grid[i][j].index].type = selection.group
								 graph.nodes[grid[i][j].index].box = selection.box
								 break;
							  case "CO":
								 graph.nodes[grid[i][j].index].group = selection.group
								 graph.nodes[grid[i][j].index].type = "C"
								 graph.nodes[grid[i][j].index].box = selection.box

								 for (let x = i - 1; x <= i + 1; x++) {
									for (let y = j - 1; y <= j + 1; y++) {
									   if (
										  dist(i, j, x, y) == 1 && x >= 0 && x < grid_size && y >= 0 && y < grid_size &&
										  grid[x][y].state == -1
									   ) {
										  graph.nodes[grid[i][j].index].neighbours.push(node_index)

										  grid[x][y].state = 0
										  grid[x][y].index = node_index

										  graph.nodes.push({
											 group: selection.group,
											 type: "O",
											 box: selection.box,
											 index: node_index,
											 grid_pos: c.createVector(x, y),
											 neighbours: [grid[i][j].index]
										  })
										  node_index++

										  graph.links.push(c.createVector(node_index - 1, grid[i][j].index, 2))

										  x = i + 2
										  y = j + 2
									   }
									}
								 }
								 break;
						   }
						   break;
						case "O":
						   switch (selection.group) {
							  case "CH3":
								 grid[i][j].state = 1

								 graph.nodes[grid[i][j].index].group = "CH3"
								 graph.nodes[grid[i][j].index].type = "C"
								 break;
							  case "CO":
								 graph.nodes[grid[i][j].index].group = "CO"
								 graph.nodes[grid[i][j].index].type = "C"

								 for (let x = i - 1; x <= i + 1; x++) {
									for (let y = j - 1; y <= j + 1; y++) {
									   if (
										  dist(i, j, x, y) == 1 && x >= 0 && x < grid_size && y >= 0 && y < grid_size &&
										  grid[x][y].state == -1
									   ) {
										  graph.nodes[grid[i][j].index].neighbours.push(node_index)

										  grid[x][y].state = 0
										  grid[x][y].index = node_index

										  graph.nodes.push({
											 group: "CO",
											 type: "O",
											 index: node_index,
											 grid_pos: c.createVector(x, y),
											 neighbours: [grid[i][j].index]
										  })
										  node_index++

										  graph.links.push(c.createVector(node_index - 1, grid[i][j].index, 2))

										  x = i + 2
										  y = j + 2
									   }
									}
								 }
								 break;
						   }
						   break;
						case "CO":
						   switch (selection.group) {
							  case "CH3":
								 grid[i][j].state = 1

								 graph.nodes[grid[i][j].index].group = "CH3"
								 graph.nodes[grid[i][j].index].type = "C"

								 for (let k = 0; k < graph.nodes[grid[i][j].index].neighbours.length; k++) {
									if (
									   graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].group == "CO" &&
									   graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].type == "O"
									) {
									   grid[graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.x][graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.y].index = -1
									   grid[graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.x][graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.y].state = -1

									   for (let l = 0; l < graph.links.length; l++) {
										  if (
											 graph.links[l].x == graph.nodes[grid[i][j].index].neighbours[k] ||
											 graph.links[l].y == graph.nodes[grid[i][j].index].neighbours[k]
										  ) {
											 graph.links.splice(l, 1)
										  }
									   }

									   graph.nodes.splice(graph.nodes[grid[i][j].index].neighbours[k], 1)

									   index_deleted = graph.nodes[grid[i][j].index].neighbours[k]
									   graph.nodes[grid[i][j].index].neighbours.splice(k, 1)
									   node_index--

									   for (let l = 0; l < graph.nodes.length; l++) {
										  if (graph.nodes[l].index > index_deleted) {
											 graph.nodes[l].index--
											 grid[graph.nodes[l].grid_pos.x][graph.nodes[l].grid_pos.y].index--
										  }

										  for (let m = 0; m < graph.nodes[l].neighbours.length; m++)
											 if (graph.nodes[l].neighbours[m] > index_deleted)
												graph.nodes[l].neighbours[m]--
									   }

									   for (let l = 0; l < graph.links.length; l++) {
										  if (graph.links[l].x > index_deleted)
											 graph.links[l].x--

										  if (graph.links[l].y > index_deleted)
											 graph.links[l].y--
									   }
									}
								 }
								 break;
							  case "O":
								 grid[i][j].state = 0

								 graph.nodes[grid[i][j].index].group = "O"
								 graph.nodes[grid[i][j].index].type = "O"

								 for (let k = 0; k < graph.nodes[grid[i][j].index].neighbours.length; k++) {
									if (
									   graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].group == "CO" &&
									   graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].type == "O"
									) {
									   grid[graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.x][graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.y].index = -1
									   grid[graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.x][graph.nodes[graph.nodes[grid[i][j].index].neighbours[k]].grid_pos.y].state = -1

									   for (let l = 0; l < graph.links.length; l++) {
										  if (
											 graph.links[l].x == graph.nodes[grid[i][j].index].neighbours[k] ||
											 graph.links[l].y == graph.nodes[grid[i][j].index].neighbours[k]
										  ) {
											 graph.links.splice(l, 1)
										  }
									   }

									   graph.nodes[grid[i][j].index].neighbours.splice(graph.nodes[grid[i][j].index].neighbours.indexOf(graph.nodes[grid[i][j].index].neighbours[k]), 1)
									}
								 }
								 break;
						   }
						   break;
					 }

					 c.process_molecule();
				  }
			   }
			}
		 }
	  }
   }

   c.process_molecule = function() {
	  graph.assign_oxidation_numbers();

	  let ether_index = graph.nodes.findIndex(node => node.group === "O");
	  let ether = ether_index != -1;

	  graph.nodes.forEach(node => node.visited = false);

	  if (ether) {
		 if (graph.main_chain)
			graph.main_chain.delete();

		 graph.left_side = graph.list_nodes(graph.nodes[ether_index].neighbours[0]);
		 graph.left_chain = graph.find_main_chain(graph.left_side);
		 graph.assign_numbers(graph.left_side, graph.left_chain);

		 graph.right_side = graph.list_nodes(graph.nodes[ether_index].neighbours[1]);
		 graph.right_chain = graph.find_main_chain(graph.right_side);
		 graph.assign_numbers(graph.right_side, graph.right_chain);

		 if (
			graph.left_chain.length > graph.right_chain.length ||
			(
			   graph.left_chain.length == graph.right_chain.length &&
			   graph.count_substituents(graph.left_chain) >= graph.count_substituents(graph.right_chain)
			)
		 ) {
			graph.left_substituents = graph.list_substituents(graph.left_side, graph.left_chain)
			graph.name_molecule(graph.left_side, graph.right_side, "sx")
		 } else if (
			graph.right_chain.length > graph.left_chain.length ||
			(
			   graph.right_chain.length == graph.left_chain.length &&
			   graph.count_substituents(graph.right_chain) > graph.count_substituents(graph.left_chain)
			)
		 ) {
			graph.right_substituents = graph.list_substituents(graph.right_side, graph.right_chain)
			graph.name_molecule(graph.right_side, graph.left_side, "dx")
		 }
	  } else {
		 if (graph.left_chain)
			graph.left_chain.delete();

		 if (graph.right_chain)
			graph.right_chain.delete();

		 graph.main_chain = graph.find_main_chain(graph.nodes);
		 graph.assign_numbers(graph.nodes, graph.main_chain);
		 graph.name_molecule();
	  }

	  cnv_3D.load_molecule();
   }

   c.mouseReleased = function() {
	  add_timer = 60;
   }
}

cnv_2D = new p5(cnv1)
