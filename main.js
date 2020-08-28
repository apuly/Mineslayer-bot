
const mineflayer = require('mineflayer')
const vec3 = require('vec3')
const wait = require('wait.for-es6')
const miner = require('./mineflayer-miner')
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
  digger = new miner.miner(bot)
})

bot.on('diggingCompleted', (block) =>{
  digger.blockDigEvent()
})

bot.on('chat', (username, message) => {
  if (username === bot.username) return
  switch (message) {
    case 'dig':
        dig()
        break
  }
})


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
        digger.dig(block)
      }
    }
  }
}



