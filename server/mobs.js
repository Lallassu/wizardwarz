/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-01-31
/////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Mob class
/////////////////////////////////////////////////////////////
function Mob() {
    this.scale = 1.0;
    this.health = 50;
    this.max_damage = 10;
    this.min_damage = 1;
    this.max_speed = 50;
    this.boundary_minx = -1300;
    this.boundary_maxx = -100;
    this.boundary_miny = 100;
    this.boundary_maxy = 300;
    this.boundary_minz = -1300;
    this.boundary_maxz = -100;
    this.px = 0;
    this.py = 0;
    this.pz = 0;
    this.rx = 0;
    this.ry = 0;
    this.rz = 0;
    this.offset_y = 0;
    this.type;

    Mob.prototype.Create = function(args) {
        this.scale = args.scale;
        this.health = args.health;
        this.id = args.id;
        this.max_damage = args.max_damage;
        this.min_damage = args.min_damage;
        this.max_speed = args.max_speed;
        this.boundary_minx = args.boundary_minx; 
        this.boundary_maxx = args.boundary_maxx;
        this.boundary_miny = args.boundary_miny; 
        this.boundary_maxy = args.boundary_maxy;
        this.boundary_minz = args.boundary_minz; 
        this.boundary_maxz = args.boundary_maxz;
        this.type = "goomba";
        this.offset_y = args.offset_y;
        this.GenerateSpawnPoint(args.noise);
    };

    Mob.prototype.GenerateSpawnPoint = function(noise) {
        while(this.px < this.boundary_miny) {
            this.px = this.boundary_minx+Math.random()*(this.boundary_maxx-this.boundary_minx);
            this.pz = this.boundary_minz+Math.random()*(this.boundary_maxz-this.boundary_minz);
            var w_x = Math.round(this.px/10)+noise.length/2;
            var w_z = Math.round(this.pz/10)+noise.length/2;
            this.py = world[w_x][w_z]*200+this.offset_y;
        }
    };    

    Mob.prototype.UpdatePos = function() {

    };
}
module.exports = Mob;
