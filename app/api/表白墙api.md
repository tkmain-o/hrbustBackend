------------------------------------------------------------
地址：  /v2/configs             请求： get

获得验证

---------------------------------------------------------
参数-------说明--------------------------返回值-------------

无         用来验证是否是                isInTest: false   防止非法请求

-----------------------------------------------------------
地址：  /v2/user/wxlogin            请求方式: post

------------------------------------------------------------
所有参数藏在headers里

 info customers/router: {
  "time": "2017-05-10T14:05:03.527Z",
  "hostname": "DESKTOP-LKKBRRJ",
  "pid": 10808,
  "level": "info",
  "name": "customers/router",
  "host": "127.0.0.1:4001",
  "connection": "keep-alive",
  "pragma": "no-cache",
  "cache-control": "no-cache",
  "x-wechat-session": "VH909xv6jZL3O6LpGYpMgw==",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 appservice webview/100000",
  "content-type": "application/x-www-form-urlencoded",
  "accept": "*/*",
  "referer": "https://servicewechat.com/wxb608c8252225731b/devtools/page-frame.html",
  "accept-encoding": "gzip, deflate, sdch"
}

---------------------------------------------------------
参数-------说明--------------------------返回值-------------

无         用来用户信息                  userinfo     返回用户信息

-----------------------------------------------------------
地址： /v2/blog/like                    请求方式： patch

点赞

---------------------------------------------------------
参数---------------------说明--------------------------返回值-------------
Boolean:  like        默认值是false 

String:    id         该主题的id号

string:   openId      点赞用户的openId

--------------------------------------------------------------
地址: /v2/blog/delete/:id               请求方式: delete

删除条目

---------------------------------------------------------
参数---------------------说明--------------------------返回值-------------
_id                    条目的id号                     

--------------------------------------------------------------
地址: /v2/blogs                         请求方式: post

发表内容

---------------------------------------------------------
参数---------------------说明--------------------------返回值-------------
content                  内容             String

isAnonymous              匿名标志         Boolean

isFixed                  置顶标志         Boolean

images                   图片             Array

device                   设备信息         String

location                 地点             String

latitude                 纬度             Number

longitude                经度             Number

openid                   用户的openid     String

nickName                 用户的昵称       String

avatar                   用户的头像地址   String

--------------------------------------------------------------
地址: /v2/blog/image                        请求方式: post

图片上传

---------------------------------------------------------
参数---------------------说明--------------------------返回值-------------



