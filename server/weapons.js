////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-04-07
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Server weapons base 'class'
/////////////////////////////////////////////////////////////
function Weapon() {
    this.max_dmg = 0;
    this.min_dmg = 0;
    this.min_power = 0;
    this.max_power = 0;
    this.reload_time = 0;
    this.explode_area = 0;

    Weapon.prototype.GetDamage = function(level) {
        var x = this.min_dmg+Math.random(level*this.bonus_multiplier+this.max_dmg);
        console.log("EXTRA DAMAGE: "+x);
        var dmg = Math.round(Math.min(this.max_dmg, this.min_dmg+x)); //this.min_dmg+Math.random(level*this.bonus_multiplier+this.max_dmg)));
        console.log("DAMAGE: "+dmg);
        return dmg;
    };

}

function Destroyer() {
    Weapon.call(this);
    this.type = "destroyer";
    this.max_dmg = 20;
    this.min_dmg = 10;
    this.min_power = 10;
    this.max_power = 15;
    this.reload_time = 2;
    this.explode_area = 50;
    this.bonus_multiplier = 2;
}
Destroyer.prototype = new Weapon();
Destroyer.prototype.constructor = Destroyer;

function Nuclear() {
    Weapon.call(this);
    this.type = "nuclear";
    this.max_dmg = 200;
    this.min_dmg = 50;
    this.min_power = 5;
    this.max_power = 20;
    this.reload_time = 3;
    this.explode_area = 100;
    this.bonus_multiplier = 2;
}
Nuclear.prototype = new Weapon();
Nuclear.prototype.constructor = Nuclear;

function Devastator() {
    Weapon.call(this);
    this.type = "devastator";
    this.max_dmg = 50;
    this.min_dmg = 20;
    this.min_power = 5;
    this.max_power = 15;
    this.reload_time = 1;
    this.explode_area = 50;
    this.bonus_multiplier = 2;
}
Devastator.prototype = new Weapon();
Devastator.prototype.constructor = Devastator;


module.exports = { 
    Weapon: Weapon, 
    Devastator: Devastator,
    Nuclear: Nuclear,
    Destroyer: Destroyer
};
