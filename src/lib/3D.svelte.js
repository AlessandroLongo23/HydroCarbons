/*
   TO DO LIST:
   
   1. sensibilità mouse
   2. coppia di elettroni dell'ossigeno
   3. sistemare l'angolazione dei legami doppi/tripli
*/

cnv2 = (c) => {
   c.setup = function() {
      c.createCanvas(595, 595, WEBGL);
      camera = c.createCamera();
      c.noStroke();
      dt = 0.0001;

      c.load_molecule();
   }

   c.draw = function() {
      c.background(204, 255, 252);

      c.axis_grid_3D();

      molecule.update();
      molecule.show();

      c.orbitControl();
   }

   c.load_molecule = function() {
      molecule = new Molecule();
   }

   class Molecule {
      constructor() {
         this.load_atoms();
         this.load_hydrogens();
         this.load_links();
         this.find_children(0);
      }

      load_atoms() {
         this.atoms = [];

         for (var i = 0; i < graph.nodes.length; i++) {
            var pos = createVector(
               (graph.nodes[i].grid_pos.x - 4) * 60,
               random(-1, 1),
               (graph.nodes[i].grid_pos.y - 4) * 60,
            );

            if (graph.nodes[i].type == "OH")
               this.atoms.push(new Atom(pos, "O"));
            else
               this.atoms.push(new Atom(pos, graph.nodes[i].type));
         }
      }

      load_hydrogens() {
         for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].type == "C") {
               for (var j = 0; j < graph.nodes[i].hydrogens; j++) {
                  var teta = j / graph.nodes[i].hydrogens * TWO_PI + random(-PI / 18, PI / 18)
                  var phi = random(-PI / 4, PI / 4) + random(-PI / 18, PI / 18)
                  var pos = createVector(
                     (graph.nodes[i].grid_pos.x - 4) * 60 + 40 * cos(phi) * cos(teta),
                     40 * sin(phi),
                     (graph.nodes[i].grid_pos.y - 4) * 60 + 40 * cos(phi) * sin(teta),
                  )
                  this.atoms.push(new Atom(pos, "H"))
                  this.atoms[i].links.push(createVector(this.atoms.length - 1, 1))
               }
            } else if (graph.nodes[i].type == "OH") {
               var teta = random(TWO_PI)
               var phi = random(-PI / 4, PI / 4)
               var pos = createVector(
                  (graph.nodes[i].grid_pos.x - 4) * 60 + 40 * cos(phi) * cos(teta),
                  40 * sin(phi),
                  (graph.nodes[i].grid_pos.y - 4) * 60 + 40 * cos(phi) * sin(teta),
               )
               this.atoms.push(new Atom(pos, "H"))
               this.atoms[i].links.push(createVector(this.atoms.length - 1, 1))
            }
         }
      }

      load_links() {
         for (var i = 0; i < graph.links.length; i++)
            this.atoms[min(graph.links[i].x, graph.links[i].y)].links.push(createVector(max(graph.links[i].x, graph.links[i].y), graph.links[i].z))
      }

      find_children(index) {
         for (var i = 0; i < this.atoms[index].links.length; i++) {
            this.atoms[index].children.push(this.atoms[index].links[i].x)
            this.atoms[this.atoms[index].links[i].x].parent = index
            this.find_children(this.atoms[index].links[i].x)
         }
      }

      update() {
         for (var i = 0; i < this.atoms.length; i++)
            this.atoms[i].update()
      }

      show() {
         c.ambientLight(100)
         c.pointLight(255, 255, 255, c.mouseX - c.width / 2, c.mouseY - c.height / 2, 200)

         for (var i = 0; i < this.atoms.length; i++)
            this.atoms[i].show()
      }
   }

   class Atom {
      constructor(pos, type) {
         this.pos = pos
         this.vel = createVector()
         this.acc = createVector()
         this.force = createVector()

         this.children = []
         this.links = []
         this.parent = null;

         this.type = type
         switch (this.type) {
            case "C":
               this.rad = 20
               this.mass = 12
               this.color = color(51)
               break
            case "H":
               this.rad = 12
               this.mass = 6
               this.color = color(200)
               break
            case "O":
               this.rad = 25
               this.mass = 16
               this.color = color(200, 0, 0)
               break
            case "N":
               this.rad = 25
               this.mass = 12
               this.color = color(51, 51, 51)
               break
            case "F":
               this.rad = 25
               this.mass = 12
               this.color = color(51, 51, 51)
               break
            case "Cl":
               this.rad = 25
               this.mass = 12
               this.color = color(51, 51, 51)
               break
            case "Br":
               this.rad = 25
               this.mass = 12
               this.color = color(51, 51, 51)
               break
            case "I":
               this.rad = 25
               this.mass = 12
               this.color = color(51, 51, 51)
               break
         }
      }

      update() {
         for (var i = 0; i < this.children.length; i++) {
            var a = molecule.atoms[this.children[i]]
            a.force = createVector()
            for (var j = 0; j < this.children.length; j++) {
               if (i != j) {
                  var b = molecule.atoms[this.children[j]]
                  var d = dist(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z)
                  var teta = atan2(b.pos.z - a.pos.z, b.pos.x - a.pos.x)
                  var phi = atan((b.pos.y - a.pos.y) / sqrt(sq(b.pos.x - a.pos.x) + sq(b.pos.z - a.pos.z)))
                  a.force.add(createVector(
                     -cos(phi) * cos(teta),
                     -sin(phi),
                     -cos(phi) * sin(teta)
                  ))
               }
            }
            if (this.parent) {
               var b = molecule.atoms[this.parent]
               var d = dist(a.pos.x, a.pos.y, a.pos.z, b.pos.x, b.pos.y, b.pos.z)
               var teta = atan2(b.pos.z - a.pos.z, b.pos.x - a.pos.x)
               var phi = atan((b.pos.y - a.pos.y) / sqrt(sq(b.pos.x - a.pos.x) + sq(b.pos.z - a.pos.z)))
               a.force.add(createVector(
                  -cos(phi) * cos(teta),
                  -sin(phi),
                  -cos(phi) * sin(teta)
               ))
            }

            a.force.normalize().mult(pow(10, 9))
            var centripetal_force = a.force.copy().reflect(createVector(a.pos.x - this.pos.x, a.pos.y - this.pos.y, a.pos.z - this.pos.z))
            a.force.add(centripetal_force).div(2)

            a.acc = a.force.div(a.mass)
            a.vel.add(a.acc.mult(dt))
            a.pos.add(a.vel.mult(dt))

            a.move_children(a, a.vel)
         }
      }

      move_children(atom, vel) {
         for (var i = 0; i < atom.children.length; i++) {
            molecule.atoms[atom.children[i]].pos.add(vel)
            molecule.atoms[atom.children[i]].move_children(molecule.atoms[atom.children[i]], vel)
         }
      }

      show() {
         c.push()
         c.translate(this.pos.x, this.pos.y, this.pos.z)
         c.ambientMaterial(this.color)
         c.sphere(this.rad)
         c.pop()

         for (var i = 0; i < this.links.length; i++) {
            switch (this.type) {
               case "C":
                  switch (molecule.atoms[this.links[i].x].type) {
                     case "C":
                        var len = 60
                        break
                     case "H":
                        var len = 40
                        break
                     default:
                        var len = 50
                        break
                  }
                  break
               case "O":
                  switch (molecule.atoms[this.links[i].x].type) {
                     case "C":
                        var len = 60
                        break
                     case "H":
                        var len = 40
                        break
                     default:
                        var len = 50
                        break
                  }
                  break
            }

            var teta = atan2(molecule.atoms[this.links[i].x].pos.z - this.pos.z, molecule.atoms[this.links[i].x].pos.x - this.pos.x)
            var phi = atan((molecule.atoms[this.links[i].x].pos.y - this.pos.y) / sqrt(sq(molecule.atoms[this.links[i].x].pos.x - this.pos.x) + sq(molecule.atoms[this.links[i].x].pos.z - this.pos.z)))
            var midpoint = createVector(
               (this.pos.x + molecule.atoms[this.links[i].x].pos.x) / 2,
               (this.pos.y + molecule.atoms[this.links[i].x].pos.y) / 2,
               (this.pos.z + molecule.atoms[this.links[i].x].pos.z) / 2
            )

            switch (this.links[i].y) {
               case 1:
                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()
                  break
               case 2:
                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.translate(-7, 0, 0)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()

                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.translate(7, 0, 0)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()
                  break
               case 3:
                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.translate(-14, 0, 0)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()

                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()

                  c.push()
                  c.translate(midpoint.x, midpoint.y, midpoint.z)
                  this.follow_camera(teta, phi, midpoint)
                  c.translate(14, 0, 0)
                  c.ambientMaterial(molecule.atoms[this.links[i].x].color)
                  c.cylinder(5, len)
                  c.pop()
                  break
            }
         }
      }

      follow_camera(teta, phi, midpoint) {
         var vec = createVector(
            cos(phi) * cos(teta),
            sin(phi),
            cos(phi) * sin(teta)
         )
         var k = (vec.x * camera.eyeX + vec.y * camera.eyeY + vec.z * camera.eyeZ - midpoint.x * vec.x - midpoint.y * vec.y - midpoint.z * vec.z) / (sq(vec.x) + sq(vec.y) + sq(vec.z))
         var pt = createVector(
            midpoint.x + vec.x * k,
            midpoint.y + vec.y * k,
            midpoint.z + vec.z * k
         )
         var phi_cam = atan((camera.eyeY - pt.y) / sqrt(sq(camera.eyeX - pt.x) + sq(camera.eyeZ - pt.z)))
         var teta_cam = atan2(camera.eyeZ - midpoint.z, camera.eyeX - midpoint.x)
         if (teta < 0) {
            if (teta_cam < teta || teta_cam > teta + PI) {
               var left_right = -1
            } else {
               var left_right = 1
            }
         } else {
            if (teta_cam > teta - PI && teta_cam < teta) {
               var left_right = -1
            } else {
               var left_right = 1
            }
         }

         c.rotateY(-teta)
         c.rotateZ(phi + PI / 2)
         c.rotateY(left_right * phi_cam)
      }
   }

   c.axis_grid_3D = function(range = 3000, step = 100, h = 300) {
      c.push()

      c.stroke(51, 100)
      for (var x = -range / 2; x < range / 2; x += step)
         c.line(x, h, -range / 2, x, h, range / 2)

      for (var z = -range / 2; z < range / 2; z += step)
         c.line(-range / 2, h, z, range / 2, h, z)

      c.stroke(255, 0, 0)
      c.line(-range / 2, 0, 0, range / 2, 0, 0)

      c.stroke(0, 255, 0)
      c.line(0, 0, -range / 2, 0, 0, range / 2)

      c.stroke(0, 0, 255)
      c.line(0, -range / 2, 0, 0, range / 2, 0)
      c.pop()
   }
}
cnv_3D = new p5(cnv2)
