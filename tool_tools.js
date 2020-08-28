/*returns the best item in the inventory for mining a certain block
does this based

if tool is irrelevent returns [0]


tool still in development*/

function getDigTools(block)
{
    console.log(block)
    var tools;
    //get the possible tools based on the block material
    if(block.material != undefined) {
        switch(block.material){
            case 'rock':
                tools = [610, 605, 600, 595, 590, 585]
                break
            case 'dirt':
                tools = [609, 604, 599, 594, 589, 584]
                break
            case 'wood':
                tools = [611, 606, 601, 596, 591, 586]
                break
            case 'plant':
                return [0]
                break
            case 'web':
                return [608, 603, 598, 593, 588, 583]
                break
            default:
                return [0]
                break
        }

        //remove tools that the material supports but the specific block doesn't
        //like obsidian, which material is rock, but can't be mined with wooden pickaxe
        //console.log(block)

        if (!block.harvestTools == undefined){
            for(var i=0; i<tools.length; i++){
                if (!(tools[i] in block.harvestTools)){
                    tools.splice(i, 1)
                }
            }
        }
        return tools
    }
}


exports.getDigTools = getDigTools
