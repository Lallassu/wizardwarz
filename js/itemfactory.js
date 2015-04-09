/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-03-18
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Item factory base class
/////////////////////////////////////////////////////////////
function Factory() {

    Factory.prototype.NewItem = function(player, data) {
        switch(data.item.type) {
            case "health":
                player.AddHealth(data.item.amount);
            return;
            break;
            case "power":
                player.AddPower(data.item.amount);
            return;
            break;
        }

        // Check if already have spell
        for(var i = 0; i < player.spells.length; i++) {
            if(player.spells[i].name == data.item.type) {
                return 0;
            }
        }

        var spell = new window[data.item.type]();
        spell.Create(data);

        // Doesn't exists, add spell to player
        if(player.spell != undefined) {
            player.spell.Hide(player);
        }
        player.spell = spell;
        player.spells.push(spell);
        player.spell.Show(player);
        if(player.id == net.player.id) {
            ConsoleMsg("Found "+data.item.type, "FF00FF");
            soundLoader.PlaySound("found", player.mesh.localToWorld(new THREE.Vector3(0,0,0)).position, 300);
            $('#itemimg'+player.spells.length).attr('src', spell.image);
        }

    };
}
