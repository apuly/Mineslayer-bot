const tool_tools = require("./tool_tools")
const queue = require("queue")

class miner
{
    constructor(bot){
        this.bot = bot;
        this.blockQueue = queue();
    }

    dig(block)
    {
        //if bot is not digging, start digging.
        //otherwise, add block to dig queue
        if (this.bot.targetDigBlock == null){
            this._digblock(block)
        } else {
            this.blockQueue.push(block)
        }

    }

    blockDigEvent(bot){
        if(this.blockQueue.length != 0){
            var next_block = this.blockQueue.pop()
            this._digblock(next_block)
        }
    }

    _digblock(block)
    {
        this.equipBestDigTool(block)
        this.bot.dig(block, (err) =>{console.log(err)})
    }

    /*function that finds the best digging tool in your inventory for a specific block
    returns true and puts item in hand if tool is found
    returns false if no tool was found
    */
    equipBestDigTool(block)
    {
        var tools = tool_tools.getDigTools(block)
        if (tools == [0] || tools == []){
        return true
        } else {
        var succes
        for (var tool in tools){
            var resp = this.bot.equip(tools[tool], 'hand', (err) => {
            if (err){
                return err
            }
            })
            if (resp == undefined){ //no error was returnedm, function was succes
            return true
            }
        }
        return false
        }
    }
}


exports.miner = miner

