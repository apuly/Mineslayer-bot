const mineflayer = require('mineflayer')
const vec3 = require('vec3')
const wait = require('wait.for-es6')
//const scaffold = require('mineflayer-scaffold')

const miner = require('./mineflayer-miner')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const tool_tools = require("./tool_tools")
const bot = mineflayer.createBot({
  host: '127.0.0.1',
  port: '25565',
  username: 'yeet',
  password: null
})

let mcData
let digger

bot.on('inject_allowed', () =>{
  mcData = require('minecraft-data')("1.16.2")
  bot.loadPlugin(pathfinder)
  bot.loadPlugin(miner)
  bot.defaultMovements = new Movements(bot, mcData)
})


bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'dig':
        dig()
        break
    case 'furnace':
      digFurnace()
      break 
    case 'region':
      digRegion()
      break
  }
})

function digFurnace()
{
  var furnaceBlock = bot.findBlock({
    matching: [mcData.blocksByName["furnace"].id],
    maxDistance: 20
  })
  if (furnaceBlock != null){
    bot.digBlock(furnaceBlock)
  } else {bot.chat("no furnace found")}
}

function dig()
{
  const start_pos = bot.entity.position
  var level = bot.entity.position.y-1
  for(var x_offset=-1; x_offset<=1; x_offset++){
    for(var z_offset=-1; z_offset<=1; z_offset++){
      pos = vec3(start_pos.x+x_offset, level, start_pos.z+z_offset)
      var block = bot.blockAt(pos)
      if (block == mcData.findItemOrBlockByName("air")){
        //continue
      } else {
        bot.digBlock(block)
      }
    }
  }
}

function digRegion()
{
  var anchors = bot.findBlocks({
    matching: [mcData.blocksByName["emerald_block"].id],
    maxDistance: 40,
    count: 2
  })
  if (anchors == undefined || anchors.length < 2){
    bot.chat("couldn't find anchors (emerald blocks)")
  } else {
    bot.digRegion(anchors[0], anchors[1])
  }
}