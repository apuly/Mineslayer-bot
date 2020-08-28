const tool_tools = require("./tool_tools")
const queue = require("queue")
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals

module.exports = inject

function inject (bot, enableMovement = true) {
    var blockQueue = queue()
    var outOfReachMove = enableMovement

    bot.on('diggingCompleted', (block) =>{
        blockDigEvent()
    })

    bot.on('goal_reached', (goal) => {
        blockdig()
    })

    function cancelDigging()
    {
        blockQueue.splice()
    }

    function digBlock(block)
    {
        //if bot is not digging, start digging.
        //otherwise, add block to dig queue
        if (bot.targetDigBlock == null){
            currentBlock = block
            blockdig()
        } else {
            blockQueue.push(block)
        }
    }

    function enableMove()
    {
        outOfReachMove = true
    }

    function disableMove()
    {
        outOfReachMove = false
    }

    function blockDigEvent(bot)
    {
        if(blockQueue.length != 0){
            currentBlock = blockQueue.pop()
            blockdig()
        }
    }

    function blockdig()
    {
        if (!bot.canDigBlock(currentBlock)){ //assume block is out of range
            if (outOfReachMove){
                var p = currentBlock.position
                bot.pathfinder.setMovements(bot.defaultMovements)
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 3))
            } else {
                throw "block out of reach"
            }
        } else {
            equipBestDigTool(currentBlock)
            bot.dig(currentBlock, (err) =>{if (err) {console.log(err)}})
        }
    }

    function equipBestDigTool(block)
    {
        var tools = tool_tools.getDigTools(block)
        if (tools == [0] || tools == []){
        return true
        } else {
        var succes
        for (var tool in tools){
            var resp = bot.equip(tools[tool], 'hand', (err) => {
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

    bot.digBlock = digBlock
    bot.diggerMovementEnable = enableMove
    bot.diggerMovementDisable = disableMove
    bot.cancelDingging = cancelDigging


    console.log("miner loaded succesfully")
}
