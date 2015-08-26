// Constants
var CELL_SIZE = 7;
var GRID_WIDTH = 75;
var GRID_HEIGHT = 75;


// Functions
function Node(x, y, role){
	this.x = x;
	this.y = y;
	this.id = -1;
	
	this.roles = {
		0: "BLANK",
		1: "START",
		2: "END",
		3: "WALL"
	};
	
	this.role = this.roles[role];
		
	this.neighbours = {};
}

Node.prototype.addNeighbour = function(node, distance){
	this.neighbours[[node.x, node.y]] = {node: node, distance: distance};
}

function Graph(isDirected){
	this.isDirected = isDirected;
	
	this.nodes = {};
	this.nodeCount = 0;
	
	this.heuristics = {
		dijkstra: [""],
		astar: ["euclidean", "manhattan"]
	};
}

Graph.prototype.addNode = function(node){
	node.id = this.nodeCount++;
	this.nodes[[node.x, node.y]] = node;
}

Graph.prototype.connect = function(node1, node2, distance){
	node1.addNeighbour(node2, distance);
	if(!this.isDirected){
		node2.addNeighbour(node1, distance);
	}
}

Graph.prototype.getNode = function(x, y){
	if([x,y] in this.nodes){
		return this.nodes[[x, y]];
	}
	return -1;
}

Graph.prototype.search = function(start_node, end_node, algorithm, heuristic){
	if(heuristic == ""){
		return this[algorithm](start_node, end_node);
	}
	return this[algorithm](start_node, end_node, this[heuristic]);
}

Graph.prototype.euclidean = function(node, target_node){
	var x1 = node.x;
	var y1 = node.y;
	var x2 = target_node.x;
	var y2 = target_node.y;
	
	return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}

Graph.prototype.manhattan = function(node, target_node){
	var x1 = node.x;
	var y1 = node.y;
	var x2 = target_node.x;
	var y2 = target_node.y;
	
	return Math.abs(x2-x1) + Math.abs(y2-y1);
}

Graph.prototype.astar = function(start_node, end_node, heuristic){
	var nodes_info = {};
	var explored = [];
	
	for(var key in this.nodes){
		var node = this.nodes[key];
		
		var distance = -1;
		var distance_h = heuristic(node, end_node);
		
		if(node.role == start_node.role){
			distance = 0;
		}
		
		nodes_info[node.id] = {
			node: node,
			distance: distance,
			distance_h: distance_h,
			predecessor: -1,
			visited: false
		};
	}
		
	var current_node = start_node;
	var frontier = [current_node];
		
	while(current_node != end_node){
		var current_neighbours = current_node.neighbours;
		
		for(var key in current_neighbours){
			var node = current_neighbours[key].node;
			if(nodes_info[node.id].visited == false && nodes_info[node.id].node.role != "WALL"){
				if(frontier.indexOf(node) == -1){
					frontier.push(node);
				}

				if(nodes_info[node.id].visited == false){
					if(nodes_info[node.id].distance == -1){
						nodes_info[node.id].distance = nodes_info[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance;
						nodes_info[node.id].predecessor = current_node;
					}else if(nodes_info[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance + nodes_info[current_node.id].distance_h < nodes_info[node.id].distance + nodes_info[node.id].distance_h){
						nodes_info[node.id].distance = nodes_info[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance;
						nodes_info[node.id].predecessor = current_node;
					}
				}
			}
		}
		
		nodes_info[current_node.id].visited = true;
		frontier.splice(frontier.indexOf(current_node), 1);
		
		
		//select best next node
		var best_distance = -1;
		var best_node = -1;

		for(var i = 0; i < frontier.length; i++){
			var node = frontier[i];
			var node_info = nodes_info[node.id];
			
			if(best_distance == -1){
				best_distance = node_info.distance + node_info.distance_h;
				best_node = node_info.node;
			}else if(node_info.distance + node_info.distance_h < best_distance){
				best_distance = node_info.distance + node_info.distance_h;
				best_node = node_info.node;
			}
		}
		//impossible path
		if(best_node == -1){
			return {
				path: [],
				explored: explored
			}
		}
		
		current_node = best_node;
		explored.push(current_node);
	}
	
	var path = [];
	var aux = nodes_info[end_node.id];
	if(aux.predecessor != -1){
		path.push(aux.node);
		while(aux.node != start_node){
			aux = nodes_info[aux.predecessor.id];
			path.push(aux.node);
		}
	}
	
	return {
		path: path,
		explored: explored
	};
}

Graph.prototype.dijkstra = function(start_node, end_node){
	var nodes_aux = {};
	var explored = [];
	
	for(var key in this.nodes){
		var node = this.nodes[key];
		var is_visited = false;
		var distance = -1;
		
		if(this.nodes[key].role == start_node.role){
			is_visited = true;
			distance = 0;
		}
		
		nodes_aux[node.id] = {
			node: node,
			visited: is_visited,
			distance: distance,
			predecessor: -1
		}
	}
		
	var current_node = start_node;
	var frontier = [current_node];
		
	while(current_node != end_node){
		var current_neighbours = current_node.neighbours;
		
		for(var key in current_neighbours){
			var node = current_neighbours[key].node;
			if(nodes_aux[node.id].visited == false && nodes_aux[node.id].node.role != "WALL"){
				if(frontier.indexOf(node) == -1){
					frontier.push(node);
				}

				if(nodes_aux[node.id].visited == false){
					if(nodes_aux[node.id].distance == -1){
						nodes_aux[node.id].distance = nodes_aux[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance;
						nodes_aux[node.id].predecessor = current_node;
					}else if(nodes_aux[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance < nodes_aux[node.id].distance){
						nodes_aux[node.id].distance = nodes_aux[current_node.id].distance + current_node.neighbours[[node.x, node.y]].distance;
						nodes_aux[node.id].predecessor = current_node;
					}
				}
			}
		}
		
		nodes_aux[current_node.id].visited = true;
		frontier.splice(frontier.indexOf(current_node), 1);
		
		
		//select best next node
		var best_distance = -1;
		var best_node = -1;

		for(var i = 0; i < frontier.length; i++){
			var node = frontier[i];
			var node_info = nodes_aux[node.id];
			
			if(best_distance == -1){
				best_distance = node_info.distance;
				best_node = node_info.node;
			}else if(node_info.distance < best_distance){
				best_distance = node_info.distance;
				best_node = node_info.node;
			}
		}
		//impossible path
		if(best_node == -1){
			return {
				path: [],
				explored: explored
			};
		}
		
		current_node = best_node;
		explored.push(current_node);
	}
	
	var path = [];
	var aux = nodes_aux[end_node.id];
	if(aux.predecessor != -1){
		path.push(aux.node);
		while(aux.node != start_node){
			aux = nodes_aux[aux.predecessor.id];
			path.push(aux.node);
		}
	}
	
	return {
		path: path,
		explored: explored
	};
}

function PathHelper(){
	this.grid = this.buildGrid();
	this.screen_width = GRID_WIDTH * CELL_SIZE;
	this.screen_height = GRID_HEIGHT * CELL_SIZE;
	this.graph = new Graph(false);
	
	this.states = {
		0: "PLACING_START", 
		1: "PLACING_END", 
		2: "PLACING_WALLS", 
		3: "DONE"
	}
	
	this.current_state = 0;
}

PathHelper.prototype.click = function(x, y){
	if(x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT){
		if(this.grid[y][x] == 0){
			switch(this.current_state){
				case 0:
					this.current_state += 1;
					this.grid[y][x] = 1;
					break;
				case 1:
					this.current_state += 1;
					this.grid[y][x] = 2;
					break;
				case 2:
					this.grid[y][x] = 3;
					break;
			}
		}
	}
}

PathHelper.prototype.buildGrid = function(){
	var grid = [];
	for(var i = 0; i < GRID_HEIGHT; i++){
		var grid_line = [];
		for(var j = 0; j < GRID_WIDTH; j++){
			grid_line.push(0);
		}
		grid.push(grid_line);
	}
	return grid;
}

PathHelper.prototype.ready = function(){
	return this.current_state == 3;
}

PathHelper.prototype.setReady = function(){
	if(this.current_state >= 2){
		this.current_state = 3
		this.buildGraph();
		
		var start_node = this.findStartNode();
		var end_node = this.findEndNode();
		
		var dropdown_alg = document.getElementById("dropdown-alg");
		var alg = dropdown_alg.options[dropdown_alg.selectedIndex].value;
		var dropdown_h = document.getElementById("dropdown-heuristic");
		var h = dropdown_h.options[dropdown_h.selectedIndex].value;
		var aux = this.graph.search(start_node, end_node, alg, h);
		this.path = aux.path;
		this.explored = aux.explored;
	}
}

PathHelper.prototype.findStartNode = function(){
	for(var i = 0; i < this.grid.length; i++){
		for(var j = 0; j < this.grid[i].length; j++){
			if(this.grid[i][j] == 1){
				return this.graph.getNode(j,i);
			}
		}
	}
}

PathHelper.prototype.findEndNode = function(){
	for(var i = 0; i < this.grid.length; i++){
		for(var j = 0; j < this.grid[i].length; j++){
			if(this.grid[i][j] == 2){
				return this.graph.getNode(j,i);
			}
		}
	}
}

PathHelper.prototype.buildGraph = function(){
	var node;
	
	// Add nodes
	for(var i = 0; i < this.grid.length; i++){
		for(var j = 0; j < this.grid[i].length; j++){
			node = new Node(j, i, this.grid[i][j]);
			this.graph.addNode(node);
		}
	}
		
	// Add neighbours
	for(var i = 0; i < this.grid.length; i++){
		for(var j = 0; j < this.grid[i].length; j++){
			var x = j;
			var y = i;
			
			node = this.graph.getNode(x, y);
			
			if(this.graph.getNode(x-1, y) == -1){
				this.graph.addNode(new Node(x-1, y, 3));
			}
			if(this.graph.getNode(x+1, y) == -1){
				this.graph.addNode(new Node(x+1, y, 3));
			}
			if(this.graph.getNode(x, y-1) == -1){
				this.graph.addNode(new Node(x, y-1, 3));
			}
			if(this.graph.getNode(x, y+1) == -1){
				this.graph.addNode(new Node(x, y+1, 3));
			}
			
			if(this.graph.getNode(x-1, y-1) == -1){
				this.graph.addNode(new Node(x-1, y-1, 3));
			}
			if(this.graph.getNode(x-1, y+1) == -1){
				this.graph.addNode(new Node(x-1, y+1, 3));
			}
			if(this.graph.getNode(x+1, y-1) == -1){
				this.graph.addNode(new Node(x+1, y-1, 3));
			}
			if(this.graph.getNode(x+1, y+1) == -1){
				this.graph.addNode(new Node(x+1, y+1, 3));
			}
			
			this.graph.connect(node, this.graph.getNode(x-1, y), 1);
			this.graph.connect(node, this.graph.getNode(x+1, y), 1);
			this.graph.connect(node, this.graph.getNode(x, y-1), 1);
			this.graph.connect(node, this.graph.getNode(x, y+1), 1);
			
			// Diagonal
			this.graph.connect(node, this.graph.getNode(x-1, y-1), 1.4);
			this.graph.connect(node, this.graph.getNode(x-1, y+1), 1.4);
			this.graph.connect(node, this.graph.getNode(x+1, y-1), 1.4);
			this.graph.connect(node, this.graph.getNode(x+1, y+1), 1.4);
		}
	}
}

function Renderer(pathHelper){
	this.pathHelper = pathHelper;
	
	this.canvas = document.getElementById("canvas");
	this.ctx = canvas.getContext("2d");

	this.canvas.width = GRID_WIDTH * CELL_SIZE;
	this.canvas.height = GRID_HEIGHT * CELL_SIZE;
	
	this.exploredRenderCount = 0;
	this.pathRenderCount = 0;

	this.bg_rendered = false;
}

Renderer.prototype.reset = function(){
	this.exploredRenderCount = 0;
	this.bg_rendered = false;
}

Renderer.prototype.drawLine = function(startx, starty, endx, endy, color, line_width, line_cap){
	this.ctx.lineCap = line_cap || 'square';
	this.ctx.strokeStyle = color;
	this.ctx.lineWidth = line_width;
	this.ctx.beginPath();
	this.ctx.moveTo(startx, starty);
	this.ctx.lineTo(endx, endy);
	this.ctx.stroke();
}

Renderer.prototype.render = function(){
	if(!this.bg_rendered){
		this.ctx.fillStyle = "#BDBDBD";
		this.ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		for(var i = 0; i <= GRID_HEIGHT; i++){
			this.drawLine(0, CELL_SIZE*i, canvas.width, CELL_SIZE*i, "#919191", 1);
		}	
		for(var i = 0; i <= GRID_WIDTH; i++){
			this.drawLine(CELL_SIZE*i, 0, CELL_SIZE*i, canvas.height, "#919191", 1);
		}

		this.bg_rendered = true;
	}
	
	
	// Draw path
	if(this.pathHelper.ready()){
		if(this.exploredRenderCount < this.pathHelper.explored.length){
			var node = this.pathHelper.explored[this.exploredRenderCount]

			if(this.exploredRenderCount == this.pathHelper.explored.length-1){
				this.ctx.fillStyle = "#468EA6";
			}else{
				this.ctx.fillStyle = "blue";
			}
			this.ctx.fillRect(CELL_SIZE*node.x, CELL_SIZE*node.y, CELL_SIZE, CELL_SIZE);

			if(this.exploredRenderCount > 0){
				node = this.pathHelper.explored[this.exploredRenderCount-1];

				this.ctx.fillStyle = "#468EA6";
				this.ctx.fillRect(CELL_SIZE*node.x, CELL_SIZE*node.y, CELL_SIZE, CELL_SIZE);					
			}

			this.exploredRenderCount++;
		}else{
			for(var i = 0; i < this.pathHelper.path.length; i++){
				var node = this.pathHelper.path[i];
				
				this.ctx.fillStyle = "#1C1C1C";
				this.ctx.fillRect(CELL_SIZE*node.x, CELL_SIZE*node.y, CELL_SIZE, CELL_SIZE);
			}
		}
		
	}
	
	
	var grid = this.pathHelper.grid;
	for(var i = 0; i < grid.length; i++){
		for(var j = 0; j < grid[i].length; j++){
			if(grid[i][j] != 0){
				switch(grid[i][j]){
					case 1:
						this.ctx.fillStyle = "#5EA646";
						break;
					case 2:
						this.ctx.fillStyle = "#A65E46";
						break;
					case 3:
						this.ctx.fillStyle = "#696969";
						break;
				}
				this.ctx.fillRect(CELL_SIZE*j, CELL_SIZE*i, CELL_SIZE, CELL_SIZE);
			}
		}
	}
}



// Stuff
var pathHelper = new PathHelper();
var renderer = new Renderer(pathHelper);

var mouseDown = false;

document.addEventListener('mousedown', function(e){
	mouseDown = true;
	var cell_x = Math.floor((e.pageX - renderer.canvas.offsetLeft) / CELL_SIZE);
	var cell_y = Math.floor((e.pageY - renderer.canvas.offsetTop) / CELL_SIZE);

	pathHelper.click(cell_x, cell_y);
}, false);

document.addEventListener('mouseup', function(e){
	mouseDown = false;
}, false);

document.addEventListener('mousemove', function(e){
	if(mouseDown){
		var cell_x = Math.floor((e.pageX - renderer.canvas.offsetLeft) / CELL_SIZE);
		var cell_y = Math.floor((e.pageY - renderer.canvas.offsetTop) / CELL_SIZE);

		pathHelper.click(cell_x, cell_y);
	}
}, false);

document.getElementById("ready").addEventListener('click', function(){
	renderer.reset();
	pathHelper.setReady();
}, false);

document.getElementById("reset").addEventListener('click', function(){
	//pathHelper.reset();
	pathHelper = new PathHelper();
	renderer = new Renderer(pathHelper);
}, false);

document.getElementById("dropdown-alg").addEventListener('change', function(){
	var dropdown = document.getElementById("dropdown-alg");
	var dropdown_h = document.getElementById("dropdown-heuristic");
	var alg = dropdown.options[dropdown.selectedIndex].value;
	
	dropdown_h.innerHTML = "";
	
	var h = pathHelper.graph.heuristics[alg];
	for(var i = 0; i < h.length; i++){
		var opt = document.createElement('option');
		opt.innerHTML = h[i];
		opt.value = h[i];
		dropdown_h.appendChild(opt);
	}
});

setInterval(function(){
	renderer.render();
}, 1);














