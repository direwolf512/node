/**
 * @fileOverview
 * @author jywang
 */
var http = require('http'); //内置的http模块提供HTTP服务器和客户端功能
var fs = require('fs'); //内置的fs模块提供了与文件系统相关的功能
var path = require('path'); //内置的path模块提供了与文件系统路径相关的功能
var mime = require('mime');//附加的mime模块有根据文件扩展名得出MIME类型的能力
var cache = {}; //cache是用来缓存文件内容的对象

/* 所请求的文件不存在是发送404错误 */
function send404 (response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found.');
  response.end();
}

/* 提供文件数据服务 */
function sendFile (response, filePath, fileContents) {
  response.writeHead(200, {'Content-Type': mime.lookup(path.basename(filePath))});
  response.end(fileContents);
}

/* 提供静态文件服务 */
function serveStatic(response, cache, absPath) {
  //检查文件是否缓存在内存中
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]); //从内存中返回文件
  } else {
    //检查文件是否存在
    fs.exists(absPath, function (exists) {
      if (exists) {
        //从硬盘中读取文件
        fs.readFile (absPath, function (err, data) {
          if (err) {
            send404(response)
          } else {
            //从硬盘中读取文件并返回
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        })
      } else {
        send404(response);
      }
    })
  }
}

/* 创建HTTP服务器，用匿名函数定义对每一个请求的处理行为 */
var server = http.createServer(function (request, response) {
  var filePath = false;
  if (request.url === '/') {
    filePath = 'public/index.html'; //默认HTML文件
  } else {
    filePath = 'public' + request.url; //url路径转换成相对路径
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath); //返回静态文件
});

/* 启动HTTP服务器 */
server.listen(3000, function () {
  console.log("Server listening on port 3000.")
});

/* 提供基于Socket.IO的处理逻辑 */
var chatServer = require('./lib/chat_server'); //加载一个定制的Node模块
chatServer.listen(server); //启动
















