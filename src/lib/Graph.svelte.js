class Graph {
    constructor() {
        this.nodes = [];
        this.links = [];
    }

    list_nodes(curr_index, arr = []) {
        if (arr.length == 0) {
            arr.push(this.nodes[curr_index]);
            this.nodes[curr_index].visited = true;
        }

        for (let i = 0; i < this.nodes[curr_index].neighbours.length; i++) {
            if (
                this.nodes[this.nodes[curr_index].neighbours[i]].type == "C" &&
                !this.nodes[this.nodes[curr_index].neighbours[i]].visited
            ) {
                this.nodes[this.nodes[curr_index].neighbours[i]].visited = true;
                arr.push(this.nodes[this.nodes[curr_index].neighbours[i]]);
                this.list_nodes(this.nodes[curr_index].neighbours[i], arr);
            }
        }

        return arr;
    }

    assign_oxidation_numbers() {
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].type == "C") {
                this.nodes[i].hydrogens = 4;
                for (let l = 0; l < this.links.length; l++)
                    if (this.links[l].x == i || this.links[l].y == i)
                    this.nodes[i].hydrogens -= this.links[l].z;

                this.nodes[i].oxidation_n = -this.nodes[i].hydrogens;

                for (let j = 0; j < this.nodes[i].neighbours.length; j++) {
                    if (
                    this.nodes[this.nodes[i].neighbours[j]].group == "F" ||
                    this.nodes[this.nodes[i].neighbours[j]].group == "Cl" ||
                    this.nodes[this.nodes[i].neighbours[j]].group == "Br" ||
                    this.nodes[this.nodes[i].neighbours[j]].group == "I" ||
                    this.nodes[this.nodes[i].neighbours[j]].group == "OH" ||
                    this.nodes[this.nodes[i].neighbours[j]].group == "O"
                    ) {
                    this.nodes[i].oxidation_n++;
                    } else if (
                    this.nodes[this.nodes[i].neighbours[j]].group == "CO" &&
                    this.nodes[this.nodes[i].neighbours[j]].type == "O"
                    ) {
                    this.nodes[i].oxidation_n += 2;
                    }
                }
            }
        }
    }

    find_main_chain(nodes) {
        let path = []
        for (let i = 0; i < nodes.length; i++)
            if (nodes[i].type == "C")
                path = [nodes[i].index]

        this.find_longest_chain(nodes)

        let max_subsitutes = -1
        for (let i = 0; i < this.paths.length; i++) {
            if (this.count_substituents(this.paths[i]) > max_subsitutes) {
                max_subsitutes = this.count_substituents(this.paths[i])
                path = this.paths[i]
            }
        }

        return path
    }

    find_longest_chain(nodes) {
        this.find_one_link_nodes(nodes)

        this.max_len = 1
        this.end_to_end = []
        for (let i = 0; i < this.one_link_nodes.length; i++)
            this.find_path_endpoints(i, nodes)

        for (let i = 0; i < this.end_to_end.length; i++) {
            for (let j = i + 1; j < this.end_to_end.length; j++) {
                if (this.end_to_end[i].x == this.end_to_end[j].y && this.end_to_end[i].y == this.end_to_end[j].x) {
                    this.end_to_end.splice(j, 1)
                    j--
                }
            }
        }

        this.paths = []
        for (let i = 0; i < this.end_to_end.length; i++)
            this.path_finder(i, this.end_to_end[i].x, this.end_to_end[i].y)
    }

    find_one_link_nodes(nodes) {
        this.one_link_nodes = []
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].type == "C") {
                let adj_chn = 0
                for (let j = 0; j < this.nodes[nodes[i].index].neighbours.length; j++)
                    if (this.nodes[this.nodes[nodes[i].index].neighbours[j]].type == "C")
                    adj_chn++

                if (adj_chn == 1)
                    this.one_link_nodes.push(nodes[i].index)
            }
        }
    }

    find_path_endpoints(index, nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (this.nodes[nodes[i].index].type == "C")
                this.nodes[nodes[i].index].visited = false
            else
                this.nodes[nodes[i].index].visited = true
        }

        this.nodes[this.one_link_nodes[index]].visited = true

        this.start_index = this.one_link_nodes[index]
        let len = 1

        this.next_step(this.start_index, len)
        }

        next_step(curr_index, len) {
        if (len >= this.max_len) {
            this.max_len = len
            this.end_index = curr_index
        }

        for (let j = 0; j < this.nodes[curr_index].neighbours.length; j++) {
            if (
                !this.nodes[this.nodes[curr_index].neighbours[j]].visited &&
                this.nodes[this.nodes[curr_index].neighbours[j]].type == "C"
            ) {
                this.nodes[this.nodes[curr_index].neighbours[j]].visited = true
                this.next_step(this.nodes[curr_index].neighbours[j], len + 1)
            } else {
                if (len == this.max_len) {
                    if (this.end_to_end.length > 0 && this.max_len > this.end_to_end[this.end_to_end.length - 1].z)
                    this.end_to_end = []

                    this.end_to_end.push(c.createVector(this.start_index, this.end_index, this.max_len))
                }
            }
        }
    }

    path_finder(index, start, end) {
        this.open_set = [start]
        this.closed_set = []
        let found = false

        let current_index = start
        this.nodes[current_index].g_cost = 0
        this.nodes[current_index].f_cost = 99

        while (!found) {
            let f = 100
            let best_index
            for (let i = 0; i < this.open_set.length; i++) {
                if (this.nodes[this.open_set[i]].f_cost < f ||
                    (
                    this.nodes[nodes[this.open_set[i]].index].f_cost == f &&
                    this.nodes[nodes[this.open_set[i]].index].h_cost < best.h_cost
                    )
                ) {
                    best_index = this.open_set[i]
                }
            }

            current_index = best_index

            this.open_set.splice(this.open_set.indexOf(current_index), 1)
            this.closed_set.push(current_index)

            if (current_index == end) {
                found = true

                let path = []
                while (current_index != start) {
                    path.push(current_index)
                    current_index = this.nodes[current_index].parent
                }
                path.push(start)

                this.paths.push(path)
            }

            else {
                for (let i = 0; i < this.nodes[current_index].neighbours.length; i++) {
                    if (
                    this.nodes[this.nodes[current_index].neighbours[i]].type == "C" &&
                    !this.closed_set.includes(this.nodes[current_index].neighbours[i]) &&
                    (
                        !this.open_set.includes(this.nodes[current_index].neighbours[i]) ||
                        this.nodes[this.nodes[current_index].neighbours[i]].g_cost > this.nodes[current_index].g_cost + c.dist(
                            this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.x,
                            this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.y,
                            this.nodes[current_index].grid_pos.x,
                            this.nodes[current_index].grid_pos.y
                        )
                    )
                    ) {
                    this.nodes[this.nodes[current_index].neighbours[i]].g_cost = this.nodes[current_index].g_cost + c.dist(
                        this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.x,
                        this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.y,
                        this.nodes[current_index].grid_pos.x,
                        this.nodes[current_index].grid_pos.y
                    )
                    this.nodes[this.nodes[current_index].neighbours[i]].h_cost = c.dist(
                        this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.x,
                        this.nodes[this.nodes[current_index].neighbours[i]].grid_pos.y,
                        this.nodes[end].grid_pos.x,
                        this.nodes[end].grid_pos.y,
                    )
                    this.nodes[this.nodes[current_index].neighbours[i]].f_cost = (
                        this.nodes[this.nodes[current_index].neighbours[i]].g_cost +
                        this.nodes[this.nodes[current_index].neighbours[i]].h_cost
                    )

                    this.nodes[this.nodes[current_index].neighbours[i]].parent = current_index

                    if (!this.open_set.includes(this.nodes[current_index].neighbours[i]))
                        this.open_set.push(this.nodes[current_index].neighbours[i])
                    }
                }
            }
        }
    }

    count_substituents(path) {
        let sub = 0;

        for (let i = 0; i < path.length; i++)
            for (let j = 0; j < this.nodes[path[i]].neighbours.length; j++)
                if (!path.includes(this.nodes[path[i]].neighbours[j]))
                    sub++;

        return sub;
    }

    assign_numbers(nodes, chain) {
        for (let i = 0; i < nodes.length; i++)
            this.nodes[nodes[i].index].carbon_n = null

        let not_alkane = false
        for (let i = 0; i < chain.length; i++) {
            if (
                this.nodes[chain[i]].group == "CH2" ||
                this.nodes[chain[i]].group == "CH"
            ) {
                not_alkane = true
            }
        }

        let first_from_start = 0
        let from_start_sum = 0
        let first_from_end = 0
        let from_end_sum = 0

        if (not_alkane) {
            for (let i = 0; i < chain.length; i++) {
                if (
                    (
                    i != chain.length - 1 &&
                    this.nodes[chain[i]].group == "CH2" &&
                    this.nodes[chain[i + 1]].group == "CH2"
                    ) || (
                    i != chain.length - 1 &&
                    this.nodes[chain[i]].group == "CH" &&
                    this.nodes[chain[i + 1]].group == "CH"
                    )
                ) {
                    if (first_from_start == 0) {
                    first_from_start = i + 1
                    }
                    if (i == 0) {
                    from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 1)
                    } else {
                    from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 2)
                    }
                }
            }

            for (let i = chain.length - 1; i >= 0; i--) {
                if (
                    (
                    i != 0 &&
                    this.nodes[chain[i]].group == "CH2" &&
                    this.nodes[chain[i - 1]].group == "CH2"
                    ) || (
                    i != 0 &&
                    this.nodes[chain[i]].group == "CH" &&
                    this.nodes[chain[i - 1]].group == "CH"
                    )
                ) {
                    if (first_from_end == 0)
                    first_from_end = chain.length - i
                    
                    if (i == chain.length - 1)
                    from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 1)
                    else
                    from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 2)
                }
            }

            if (first_from_start < first_from_end)
                for (let i = 0; i < chain.length; i++)
                    this.nodes[chain[i]].carbon_n = i + 1

            else if (first_from_end < first_from_start)
                for (let i = chain.length - 1; i >= 0; i--)
                    this.nodes[chain[i]].carbon_n = chain.length - i

            else {
                for (let i = 0; i < chain.length; i++) {
                    if (
                    (
                        (i == 0 || i == chain.length - 1) && (
                            this.nodes[chain[i]].neighbours.length > 1 &&
                            this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                            this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O"
                        )
                    ) || (
                        i != 0 && i != chain.length - 1 &&
                        this.nodes[chain[i]].neighbours.length > 2 &&
                        this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[2]].group != "O"
                    )
                    ) {
                    if (first_from_start == 0)
                        first_from_start = i + 1

                    if (i == 0) {
                        from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 1)
                    } else {
                        from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 2)
                    }
                    }
                }

                for (let i = chain.length - 1; i >= 0; i--) {
                    if (
                    (
                        (i == 0 || i == chain.length - 1) && (
                            this.nodes[chain[i]].neighbours.length > 1 &&
                            this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                            this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O"
                        )
                    ) || (
                        i != 0 && i != chain.length - 1 &&
                        this.nodes[chain[i]].neighbours.length > 2 &&
                        this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[2]].group != "O"
                    )
                    ) {
                    if (first_from_end == 0) {
                        first_from_end = chain.length - i
                    }
                    if (i == chain.length - 1) {
                        from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 1)
                    } else {
                        from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 2)
                    }
                    }
                }

                if (first_from_start < first_from_end ||
                    (first_from_start == first_from_end && from_start_sum <= from_end_sum)
                ) {
                    for (let i = 0; i < chain.length; i++) {
                    this.nodes[chain[i]].carbon_n = i + 1
                    }
                }
                else if (first_from_end < first_from_start ||
                    (first_from_start == first_from_end && from_end_sum <= from_start_sum)
                ) {
                    for (let i = chain.length - 1; i >= 0; i--) {
                    this.nodes[chain[i]].carbon_n = chain.length - i
                    }
                }
            }
        }
        else {
            for (let i = 0; i < chain.length; i++) {
                if (
                    (
                    (i == 0 || i == chain.length - 1) && (
                        this.nodes[chain[i]].neighbours.length > 1 &&
                        this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O"
                    )
                    ) || (
                    i != 0 && i != chain.length - 1 &&
                    this.nodes[chain[i]].neighbours.length > 2 &&
                    this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                    this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O" &&
                    this.nodes[this.nodes[chain[i]].neighbours[2]].group != "O"
                    )
                ) {
                    if (first_from_start == 0)
                    first_from_start = i + 1
                    
                    if (i == 0)
                    from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 1)
                    else
                    from_start_sum += (i + 1) * (this.nodes[chain[i]].neighbours.length - 2)
                }
            }

            for (let i = chain.length - 1; i >= 0; i--) {
                if (
                    (
                    (i == 0 || i == chain.length - 1) && (
                        this.nodes[chain[i]].neighbours.length > 1 &&
                        this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                        this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O"
                    )
                    ) || (
                    i != 0 && i != chain.length - 1 &&
                    this.nodes[chain[i]].neighbours.length > 2 &&
                    this.nodes[this.nodes[chain[i]].neighbours[0]].group != "O" &&
                    this.nodes[this.nodes[chain[i]].neighbours[1]].group != "O" &&
                    this.nodes[this.nodes[chain[i]].neighbours[2]].group != "O"
                    )
                ) {
                    if (first_from_end == 0)
                    first_from_end = chain.length - i
                    
                    if (i == chain.length - 1)
                    from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 1)
                    else
                    from_end_sum += (chain.length - i) * (this.nodes[chain[i]].neighbours.length - 2)
                }
            }

            if (first_from_start < first_from_end ||
                (first_from_start == first_from_end && from_start_sum <= from_end_sum)
            ) {
                for (let i = 0; i < chain.length; i++) {
                    this.nodes[chain[i]].carbon_n = i + 1
                }
            }
            else if (first_from_end < first_from_start ||
                (first_from_start == first_from_end && from_end_sum <= from_start_sum)
            ) {
                for (let i = chain.length - 1; i >= 0; i--) {
                    this.nodes[chain[i]].carbon_n = chain.length - i
                }
            }
        }
    }

    name_molecule(main_chain = null, other_chain = null, side) {
        this.name = ""

        if (!main_chain && !other_chain) {
            this.substituents = this.list_substituents(this.nodes, this.main_chain)
            this.compose_name(this.substituents, this.main_chain)
        } else {
            for (let i = 0; i < main_chain.length; i++)
                for (let j = 0; j < this.nodes[main_chain[i].index].neighbours.length; j++)
                    if (this.nodes[this.nodes[main_chain[i].index].neighbours[j]].group == "O")
                    this.name += this.nodes[main_chain[i].index].carbon_n + "-"

            switch (other_chain.length) {
                case 1:
                    this.name += "metossi "
                    break;
                case 2:
                    this.name += "etossi "
                    break;
                case 3:
                    this.name += "propossi "
                    break;
                case 4:
                    this.name += "butossi "
                    break;
                case 5:
                    this.name += "pentossi "
                    break;
                case 6:
                    this.name += "esossi "
                    break;
                case 7:
                    this.name += "eptossi "
                    break;
                case 8:
                    this.name += "ottossi "
                    break;
            }

            if (side == "sx")
                this.compose_name(this.left_substituents, this.left_chain)
            else 
                this.compose_name(this.right_substituents, this.right_chain)
        }

        if (document.getElementById("show_name").checked) {
            document.getElementById("molecule_name").innerHTML = graph.name
            document.getElementById("molecule_name").href = "https://it.wikipedia.org/wiki/" + graph.name
        } else {
            document.getElementById("molecule_name").innerHTML = "? ? ? ? ?"
            document.getElementById("molecule_name").href = "https://it.wikipedia.org/wiki/idrocarburi"
        }
    }

    list_substituents(nodes, chain) {
        let subs = []
        for (let i = 0; i < nodes.length; i++)
            nodes[i].visited = chain.includes(nodes[i].index)

        subs = {
            methyl: {
                norm: []
            },
            ethyl: {
                norm: []
            },
            propyl: {
                norm: [],
                sec: []
            },
            butyl: {
                norm: [],
                sec: [],
                terz: []
            },
            pentyl: {
                norm: [],
                sec: [],
                terz: []
            },
            fluorine: [],
            chlorine: [],
            bromine: [],
            iodine: [],
            hydroxy: [],
            carbonyl: [],
            alkenyls: [],
            alkynyls: []
        }

        for (let i = 0; i < chain.length; i++) {
            if (
                i != chain.length - 1 &&
                this.nodes[chain[i]].group == "CH2" &&
                this.nodes[chain[i + 1]].group == "CH2"
            ) {
                subs.alkenyls.push(min(this.nodes[chain[i]].carbon_n, this.nodes[chain[i + 1]].carbon_n))
            } else if (
                i != chain.length - 1 &&
                this.nodes[chain[i]].group == "CH" &&
                this.nodes[chain[i + 1]].group == "CH"
            ) {
                subs.alkynyls.push(min(this.nodes[chain[i]].carbon_n, this.nodes[chain[i + 1]].carbon_n))
            }

            if (
                ((i == 0 || i == chain.length - 1) && this.nodes[chain[i]].neighbours.length >= 2) ||
                ((i != 0 && i != chain.length - 1) && this.nodes[chain[i]].neighbours.length >= 3) ||
                (chain.length == 1 && this.nodes[chain[i]].neighbours.length >= 1)
            ) {
                for (let j = 0; j < this.nodes[chain[i]].neighbours.length; j++) {
                    if (!this.nodes[this.nodes[chain[i]].neighbours[j]].visited) {
                    if (this.nodes[this.nodes[chain[i]].neighbours[j]].type == "C") {
                        let this_sub = []
                        this.explore_substituent(this_sub, 1, this.nodes[chain[i]].neighbours[j])

                        let sec, terz;
                        switch (this_sub.length) {
                            case 1:
                                subs.methyl.norm.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case 2:
                                subs.ethyl.norm.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case 3:
                                sec = false
                                for (let s = 0; s < this_sub.length; s++)
                                if (this.nodes[this_sub[s]].neighbours.length == 3)
                                    sec = true

                                if (sec)
                                subs.propyl.sec.push(this.nodes[chain[i]].carbon_n)
                                else
                                subs.propyl.norm.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case 4:
                                sec = false;
                                terz = false;
                                for (let s = 0; s < this_sub.length; s++) {
                                if (this.nodes[this_sub[s]].neighbours.length == 3)
                                    sec = true
                                else if (this.nodes[this_sub[s]].neighbours.length == 4)
                                    terz = true
                                }

                                if (sec)
                                subs.butyl.sec.push(this.nodes[chain[i]].carbon_n)
                                else if (terz)
                                subs.butyl.terz.push(this.nodes[chain[i]].carbon_n)
                                else
                                subs.butyl.norm.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case 5:
                                sec = false
                                terz = false
                                for (let s = 0; s < this_sub.length; s++) {
                                if (
                                    this.nodes[this_sub[s]].neighbours.length == 3 &&
                                    (
                                        this.main_chain.includes(this.nodes[this_sub[s]].neighbours[0]) ||
                                        this.main_chain.includes(this.nodes[this_sub[s]].neighbours[1]) ||
                                        this.main_chain.includes(this.nodes[this_sub[s]].neighbours[2])
                                    )
                                )
                                    sec = true
                                else if (this.nodes[this_sub[s]].neighbours.length == 4)
                                    terz = true
                                }

                                if (sec)
                                subs.pentyl.sec.push(this.nodes[chain[i]].carbon_n)
                                else if (terz)
                                subs.pentyl.terz.push(this.nodes[chain[i]].carbon_n)
                                else
                                subs.pentyl.norm.push(this.nodes[chain[i]].carbon_n)
                                break;
                        }
                    } else {
                        switch (this.nodes[this.nodes[chain[i]].neighbours[j]].group) {
                            case "F":
                                subs.fluorine.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case "Cl":
                                subs.chlorine.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case "Br":
                                subs.bromine.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case "I":
                                subs.iodine.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case "OH":
                                subs.hydroxy.push(this.nodes[chain[i]].carbon_n)
                                break;
                            case "CO":
                                subs.carbonyl.push(this.nodes[chain[i]].carbon_n)
                                break;
                        }
                    }
                    }
                }
            }
        }

        return subs
    }

    explore_substituent(this_sub, size, current_index) {
        this_sub.push(current_index)
        this.nodes[current_index].visited = true
        for (let i = 0; i < this.nodes[current_index].neighbours.length; i++) {
            if (!this.nodes[this.nodes[current_index].neighbours[i]].visited) {
                size++
                this.explore_substituent(this_sub, size + 1, this.nodes[current_index].neighbours[i])
            }
        }

        return this_sub
    }

    compose_name(subs_list, main_chain) {
        bubble_sort(subs_list.bromine)
        for (let i = 0; i < subs_list.bromine.length; i++) {
            if (i != 0 && main_chain.length != 1)
                this.name += ","

            if (main_chain.length != 1)
                this.name += (subs_list.bromine[i])

            if (i == subs_list.bromine.length - 1)
                this.name += this.prefix(subs_list.bromine, main_chain.length > 1) + "bromo"
        }


        bubble_sort(subs_list.butyl.norm)
        for (let i = 0; i < subs_list.butyl.norm.length; i++) {
            if (i != 0)
                this.name += ","
            
            this.name += subs_list.butyl.norm[i]
            if (i == subs_list.butyl.norm.length - 1)
                this.name += this.prefix(subs_list.butyl.norm) + "butil"
        }

        bubble_sort(subs_list.butyl.sec)
        for (let i = 0; i < subs_list.butyl.sec.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0)
                this.name += ","
            
            this.name += subs_list.butyl.sec[i]
            if (i == subs_list.butyl.sec.length - 1)
                this.name += this.prefix(subs_list.butyl.sec) + "sec-butil"
        }

        bubble_sort(subs_list.butyl.terz)
        for (let i = 0; i < subs_list.butyl.terz.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "
            
            if (i != 0)
                this.name += ","

            this.name += subs_list.butyl.terz[i]
            if (i == subs_list.butyl.terz.length - 1)
                this.name += this.prefix(subs_list.butyl.terz) + "terz-butil"
        }

        bubble_sort(subs_list.chlorine)
        for (let i = 0; i < subs_list.chlorine.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0 && main_chain.length != 1)
                this.name += ","

            if (main_chain.length != 1)
                this.name += subs_list.chlorine[i]

            if (i == subs_list.chlorine.length - 1)
                this.name += this.prefix(subs_list.chlorine, main_chain.length > 1) + "cloro"
        }

        bubble_sort(subs_list.ethyl.norm)
        for (let i = 0; i < subs_list.ethyl.norm.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0)
                this.name += ","
            
            this.name += subs_list.ethyl.norm[i]
            if (i == subs_list.ethyl.norm.length - 1)
                this.name += this.prefix(subs_list.ethyl.norm) + "etil"
        }

        bubble_sort(subs_list.fluorine)
        for (let i = 0; i < subs_list.fluorine.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "
            
            if (i != 0 && main_chain.length != 1)
                this.name += ","
            
            if (main_chain.length != 1)
                this.name += subs_list.fluorine[i]

            if (i == subs_list.fluorine.length - 1)
                this.name += this.prefix(subs_list.fluorine, main_chain.length > 1) + "fluoro"
        }

        bubble_sort(subs_list.iodine)
        for (let i = 0; i < subs_list.iodine.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0 && main_chain.length != 1)
                this.name += ","

            if (main_chain.length != 1)
                this.name += subs_list.iodine[i]

            if (i == subs_list.iodine.length - 1)
                this.name += this.prefix(subs_list.iodine, main_chain.length > 1) + "iodio"
        }

        bubble_sort(subs_list.methyl.norm)
        for (let i = 0; i < subs_list.methyl.norm.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0)
                this.name += ","
            
            this.name += subs_list.methyl.norm[i]
            if (i == subs_list.methyl.norm.length - 1)
                this.name += this.prefix(subs_list.methyl.norm) + "metil"
        }

        bubble_sort(subs_list.pentyl.norm)
        for (let i = 0; i < subs_list.pentyl.norm.length; i++) {
            if (i != 0)
                this.name += ","
            
            this.name += subs_list.pentyl.norm[i]
            if (i == subs_list.pentyl.norm.length - 1)
                this.name += this.prefix(subs_list.pentyl.norm) + "pentil"
        }

        bubble_sort(subs_list.pentyl.sec)
        for (let i = 0; i < subs_list.pentyl.sec.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0)
                this.name += ","

            this.name += subs_list.pentyl.sec[i]
            if (i == subs_list.pentyl.sec.length - 1)
                this.name += this.prefix(subs_list.pentyl.sec) + "sec-pentil"
        }

        bubble_sort(subs_list.pentyl.terz)
        for (let i = 0; i < subs_list.pentyl.terz.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o"))
                this.name += " "

            if (i != 0)
                this.name += ","

            this.name += subs_list.pentyl.terz[i]
            if (i == subs_list.pentyl.terz.length - 1)
                this.name += this.prefix(subs_list.pentyl.terz) + "terz-pentil"
        }

        bubble_sort(subs_list.propyl.norm)
        for (let i = 0; i < subs_list.propyl.norm.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                this.name += " "
            }
            if (i != 0) {
                this.name += ","
            }
            this.name += subs_list.propyl.norm[i]
            if (i == subs_list.propyl.norm.length - 1) {
                this.name += this.prefix(subs_list.propyl.norm) + "propil"
            }
        }

        bubble_sort(subs_list.propyl.sec)
        for (let i = 0; i < subs_list.propyl.sec.length; i++) {
            if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                this.name += " "
            }
            if (i != 0) {
                this.name += ","
            }
            this.name += subs_list.propyl.sec[i]
            if (i == subs_list.propyl.sec.length - 1) {
                this.name += this.prefix(subs_list.propyl.sec) + "sec-propil"
            }
        }

        bubble_sort(subs_list.hydroxy)
        for (let i = 0; i < subs_list.hydroxy.length; i++) {
            if (subs_list.hydroxy.length > 0) {
                if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                    this.name += " "
                }
                if (i != 0 && main_chain.length != 1) {
                    this.name += ","
                }
                if (main_chain.length != 1) {
                    this.name += subs_list.hydroxy[i]
                }
                if (i == subs_list.hydroxy.length - 1 && main_chain.length != 1) {
                    this.name += "-"
                }
                if (subs_list.carbonyl.length != 0 && i == subs_list.hydroxy.length - 1) {
                    this.name += this.prefix(subs_list.hydroxy, false) + "idrossi "
                }
            }
        }

        bubble_sort(subs_list.carbonyl)
        for (let i = 0; i < subs_list.carbonyl.length; i++) {
            if (subs_list.carbonyl.length > 0) {
                if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                    this.name += " "
                }
                if (i != 0 && main_chain.length != 1) {
                    this.name += ","
                }
                if (main_chain.length != 1) {
                    this.name += subs_list.carbonyl[i]
                }
                if (i == subs_list.carbonyl.length - 1 && main_chain.length != 1) {
                    this.name += "-"
                }
            }
        }

        bubble_sort(subs_list.alkynyls)
        for (let i = 0; i < subs_list.alkynyls.length; i++) {
            if (subs_list.alkynyls.length > 0) {
                if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                    this.name += " "
                }
                if (i != 0 && main_chain.length != 1) {
                    this.name += ","
                }
                if (main_chain.length != 1) {
                    this.name += subs_list.alkynyls[i]
                }
                if (i == subs_list.alkynyls.length - 1 && main_chain.length != 1) {
                    this.name += "-"
                }
            }
        }

        bubble_sort(subs_list.alkenyls)
        for (let i = 0; i < subs_list.alkenyls.length; i++) {
            if (subs_list.alkenyls.length > 0) {
                if (i == 0 && (this.name[this.name.length - 1] == "l" || this.name[this.name.length - 1] == "o")) {
                    this.name += " "
                }
                if (i != 0 && main_chain.length != 1) {
                    this.name += ","
                }
                if (main_chain.length != 1) {
                    this.name += subs_list.alkenyls[i]
                }
                if (i == subs_list.alkenyls.length - 1 && main_chain.length != 1) {
                    this.name += "-"
                }
            }
        }

        switch (main_chain.length) {
            case 1:
                this.name += "met"
                break;
            case 2:
                this.name += "et"
                break;
            case 3:
                this.name += "prop"
                break;
            case 4:
                this.name += "but"
                break;
            case 5:
                this.name += "pent"
                break;
            case 6:
                this.name += "es"
                break;
            case 7:
                this.name += "ept"
                break;
            case 8:
                this.name += "ott"
                break;
            case 9:
                this.name += "enn"
                break;
            case 10:
                this.name += "dec"
                break;
            case 11:
                this.name += "undec"
                break;
            case 12:
                this.name += "dodec"
                break;
            case 13:
                this.name += "tridec"
                break;
            case 14:
                this.name += "tetradec"
                break;
            case 15:
                this.name += "pentadec"
                break;
            case 16:
                this.name += "esadec"
                break;
            default:
                this.name += "nonsocomesichiama-"
                break;
        }

        if (subs_list.alkynyls.length > 0) {
            this.name += "in"
        }
        else if (subs_list.alkenyls.length > 0) {
            this.name += "en"
        }
        else {
            this.name += "an"
        }

        if (subs_list.carbonyl.length > 0) {
            this.name += this.prefix(subs_list.carbonyl, false)
            if (subs_list.carbonyl[0] == 1 || subs_list.carbonyl["length"] == this.main_chain.length) {
                this.name += "ale"
            } else {
                this.name += "one"
            }
        }

        if (subs_list.hydroxy.length > 0 && subs_list.carbonyl.length == 0) {
            this.name += this.prefix(subs_list.hydroxy, false) + "olo"
        }

        if (
            subs_list.hydroxy.length == 0 &&
            subs_list.carbonyl.length == 0
        ) {
            if (subs_list.alkenyls.length > 0) {
                this.name += "e"
            } else {
                this.name += "o"
            }
        }
    }

    prefix(arr, dash = true) {
        switch (arr.length) {
            case 1:
                if (dash) {
                    return "-"
                } else {
                    return ""
                }
            case 2:
                if (dash) {
                    return "-di"
                } else {
                    return "di"
                }
            case 3:
                if (dash) {
                    return "-tri"
                } else {
                    return "tri"
                }
            case 4:
                if (dash) {
                    return "-tetra"
                } else {
                    return "tetra"
                }
            case 5:
                if (dash) {
                    return "-penta"
                } else {
                    return "penta"
                }
            case 6:
                if (dash) {
                    return "-esa"
                } else {
                    return "esa"
                }
            case 7:
                if (dash) {
                    return "-epta"
                } else {
                    return "epta"
                }
            case 8:
                if (dash) {
                    return "-ottan"
                } else {
                    return "otta"
                }
            case 9:
                if (dash) {
                    return "-enna"
                } else {
                    return "enna"
                }
            case 10:
                if (dash) {
                    return "-deca"
                } else {
                    return "deca"
                }
            case 11:
                if (dash) {
                    return "-undeca"
                } else {
                    return "undeca"
                }
            case 12:
                if (dash) {
                    return "-dodeca"
                } else {
                    return "dodeca"
                }
        }
    }
}