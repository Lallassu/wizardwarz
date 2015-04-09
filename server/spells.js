////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-05-06
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Server spell base 'class'
/////////////////////////////////////////////////////////////
function Spell() {
    this.max_dmg = 0;
    this.min_dmg = 0;
    this.min_power = 0;
    this.max_power = 0;
    this.reload_time = 0;
    this.explode_area = 0;

    Spell.prototype.NewSpell = function(level) {
        // TBD: TEST
        //	return new Blizzard();

        switch(Math.round(Math.random()*4)) {
            case 0:
                return new Fireball();
            break;
            case 1:
                return new Explosion();
            break;
            case 2:
                return new FireRing();
            break;
            case 3:
                return new Immolation();
            break;
            case 4:
                return new Blizzard();
            break;
        }

        // TBD: Generate spells based on level
        /*	switch(1+Math.round(Math.random()*(level))) {
            case 1:
        //	    return new Fireball();
        //	    break;
        //	case 2:
        return new Explosion();
        break;
        //	case 2:
        //	    break;

        case 2:
        //	    return new Immolation();
        return new FireRing();
        break;
        }*/
    };

    Spell.prototype.GetDamage = function(level) {
        var x = this.min_dmg+Math.random(level*this.bonus_multiplier+this.max_dmg);
        console.log("EXTRA DAMAGE: "+x);
        var dmg = Math.round(Math.min(this.max_dmg, this.min_dmg+x)); //this.min_dmg+Math.random(level*this.bonus_multiplier+this.max_dmg)));
        console.log("DAMAGE: "+dmg);
        return dmg;
    };

}

/////////////////////////////////////////////////////////////
// Fireball
/////////////////////////////////////////////////////////////
function Fireball() {
    Spell.call(this);
    this.type = "Fireball";
    this.max_dmg = 50;
    this.min_dmg = 10;
    this.min_power = 5;
    this.max_power = 20;
    this.reload_time = 0.5;
    this.explode_area = 50;
    this.bonus_multiplier = 2;
}
Fireball.prototype = new Spell();
Fireball.prototype.constructor = Fireball;

/////////////////////////////////////////////////////////////
// FireRing
/////////////////////////////////////////////////////////////
function FireRing() {
    Spell.call(this);
    this.type = "FireRing";
    this.max_dmg = 30;
    this.min_dmg = 10;
    this.min_power = 2;
    this.max_power = 10;
    this.reload_time = 2;
    this.explode_area = 10;
    this.bonus_multiplier = 2;
}
FireRing.prototype = new Spell();
FireRing.prototype.constructor = FireRing;


/////////////////////////////////////////////////////////////
// Explosion
/////////////////////////////////////////////////////////////
function Explosion() {
    Spell.call(this);
    this.type = "Explosion";
    this.max_dmg = 50;
    this.min_dmg = 20;
    this.min_power = 30;
    this.max_power = 200;
    this.reload_time = 2;
    this.explode_area = 50;
    this.bonus_multiplier = 2;
}
Explosion.prototype = new Spell();
Explosion.prototype.constructor = Explosion;

/////////////////////////////////////////////////////////////
// Immolation
/////////////////////////////////////////////////////////////
function Immolation() {
    Spell.call(this);
    this.type = "Immolation";
    this.max_dmg = 500;
    this.min_dmg = 100;
    this.min_power = 30;
    this.max_power = 30;
    this.reload_time = 1;
    this.explode_area = 150;
    this.bonus_multiplier = 2;
}
Immolation.prototype = new Spell();
Immolation.prototype.constructor = Immolation;

/////////////////////////////////////////////////////////////
// Blizzard
/////////////////////////////////////////////////////////////
function Blizzard() {
    Spell.call(this);
    this.type = "Blizzard";
    this.max_dmg = 50;
    this.min_dmg = 10;
    this.min_power = 30;
    this.max_power = 30;
    this.reload_time = 1;
    this.explode_area = 100;
    this.bonus_multiplier = 2;
}
Blizzard.prototype = new Spell();
Blizzard.prototype.constructor = Blizzard;


// Exports
module.exports = { 
    Spell: Spell
};
