const tool_tools = require("./tool_tools")
const queue = require("queue")
const vec3 = require('vec3')
const { GoalNear, GoalBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals

module.exports = inject


function inject (bot, enableMovement = true) {
    var jobQueue = queue()
    var outOfReachMove = enableMovement
    var currentJob = null
    var currentBlock = null
    mcData = require('minecraft-data')("1.16.2")

    function cancelDigging()
    {
        //clears the digging queue, effectively stopping mining when the next block is broken
        blockQueue.splice()
    }

    //takes 2 vectors and autoamtically mines out the region between these 2 vectors
    //blocks are mined from top to bottom, closest side first side first
    
    //be aware, this system is rather stupid. it won't block lava or avoid heights.
    //It can be killed by flowing lava.
    function digRegion(vec1, vec2)
    {
        jobQueue.push(regionGenerator(vec1, vec2))
        if (!currentBlock){ //find different way of showing bot doesn't have target
            currentBlock = nextBlock()
            blockdig()
        }
    }

    function digBlock(block)
    {
        //if bot is not digging, start digging.
        //otherwise, add block to dig queue
        if (bot.targetDigBlock == null){
            currentBlock = block
            blockdig()
        } else {
            jobQueue.push(blockGenerator(block))
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
        if (jobQueue.length != 0 || currentJob != null)
        {
            try{
                currentBlock = nextBlock()
            } catch (err) {return}
            blockdig()
        }
    }
    function blockdig()
    {
        if (!blockInRange(currentBlock)){ //assume block is out of range
            if (outOfReachMove){
                var p = currentBlock.position
                bot.pathfinder.setMovements(bot.defaultMovements)
                bot.pathfinder.setGoal(new GoalNear(p.x, p.y, p.z, 3))
                bot.once('goal_reached', (goal) => {
                    blockdig()
                })
            } else {
                throw "block out of reach"
            }
        } else {
            equipBestDigTool(currentBlock)
            bot.once('diggingCompleted', (block) =>{
                blockDigEvent()
            })
            bot.dig(currentBlock, (err) =>{if (err) {console.log(err)}})
        }
    }

    function blockInRange(block)
    {
        return block.position.offset(0.5, 0.5, 0.5).distanceTo(bot.entity.position) < 6
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

    function nextBlock()
    {           
        if (currentJob == null && jobQueue.length != 0){
            currentJob = jobQueue.pop()
            return nextBlock()
        } else if (currentJob != null){
            res = currentJob.next()
            if (res.done){
                currentJob = null
                return nextBlock()
            }
            return res.value
        } else {
            currentBlock = undefined
            throw "no jobs available"
        }
    }
    
    function* blockGenerator(block)
    {
        yield block
    }
    
    function *regionGenerator(vec1, vec2)
    {
        function rebuildVectors()
        {   
            //rebuilds vectors so that bot can work from vec1 to vec2
            var newvec1 = vec3()
            var newvec2 = vec3()

            var botPos = bot.entity.position
            if (Math.abs(vec1.x-botPos.x) < Math.abs(vec2.x-botPos.x)){
                newvec1.x = vec1.x
                newvec2.x = vec2.x
            } else  {
                newvec1.x = vec2.x
                newvec2.x = vec1.x
            } 

            if (Math.abs(vec1.z-botPos.z) < Math.abs(vec2.z-botPos.z)){
                newvec1.z = vec1.z
                newvec2.z = vec2.z
            } else  {
                newvec1.z = vec2.z
                newvec2.z = vec1.z
            } 

            newvec1.y = Math.max(vec1.y, vec2.y)
            newvec2.y = Math.min(vec1.y, vec2.y)

            vec1 = newvec1
            vec2 = newvec2
        }

        function rebuildAndReturnClosest()
        {
            rebuildVectors()
            return bot.blockAt(vec1) //return the 
        }

        //start rebuilding the vectors when the function is called for the first time
        //this allows an infinite amount of time between registering and running the generator
        //which is nice seeing as multiple jobs can be queued up ahead of time
        yield rebuildAndReturnClosest()


        //be aware, the following code is a bunch of spaghetti
        //this is because I don't know how to nest yields in a way that only the last yield returns data
        //the more readable version of the code (although not functional) can be found underneath.
        //it's exactly the same, exept for some variable renaming and the use of functions

        var target_x, current_x, target_z, current_z

        var x_forward = true 
        console.log(vec1.y, vec2.y)
        for (var y = vec1.y; y >= vec2.y; y--){
    
            if (x_forward == true){
                target_x = vec2.x
                current_x = vec1.x
            } else {
                target_x = vec1.x
                current_x = vec2.x
            }
            x_direction = (target_x < current_x) ? -1 : 1
            var z_forward = true
            
            for(var x = current_x; x != target_x+x_direction; x += x_direction){

                if (z_forward){
                    target_z = vec2.z
                    current_z = vec1.z
                } else {
                    target_z = vec1.z
                    current_z = vec2.z
                }
                z_direction = (target_z < current_z) ? -1 : 1
    
                for(var z = current_z; current_z != target_z+z_direction; current_z += z_direction){

                    pos = vec3(x, y, current_z)
                    var block = bot.blockAt(pos)
                    if (block.type != mcData.blocksByName['air'].id){
                        yield block
                    } 
                }
                z_forward = !z_forward
            }
            x_forward = !x_forward
        }


        //harvest(vec1, vec2)


        // function harvest(vec1, vec2){

        //     var current_y = vec1.y
        //     var x_forward = true
            
        //     for (var current_y = vec1.y; current_y >= vec2.y; current_y--){
        //         harvestX(vec1, vec2, x_forward, current_y)
        //         x_forward = !x_forward
        //     }

        // }

        // function harvestX(vec1, vec2, direction_foward, y)
        // {
        //     var z_forward = true

        //     if (direction_foward){
        //         target = vec2.x
        //         current = vec1.x
        //     } else {
        //         target = vec1.x
        //         current = vec2.x
        //     }
        //     x_direction = (target < current) ? -1 : 1

        //     for(var current_x = current; current_x != target; current_x += x_direction){
        //         harvestZ(vec1, vec2, z_forward, y, current_x)
        //         z_forward = !z_forward
        //     }
        // }

        // function harvestZ(vec1, vec2, direction_foward, y, x)
        // {

        //     if (direction_foward){
        //         target = vec2.z
        //         current = vec1.z
        //     } else {
        //         target = vec1.z
        //         current = vec2.z
        //     }
        //     z_direction = (target < current) ? -1 : 1

        //     for(var current_z = current; current_z != target; current_z += z_direction){
        //         pos = vec3(x, y, current_z)
        //         var block = bot.blockAt(pos)
        //         if (block.type != mcData.blocksByName['air'].id){
        //             yield block
        //         } 
        //     }
        // }
    }
    

    bot.digBlock = digBlock
    bot.digRegion = digRegion
    bot.diggerMovementEnable = enableMove
    bot.diggerMovementDisable = disableMove
    bot.cancelDingging = cancelDigging


    console.log("miner loaded succesfully")
}
