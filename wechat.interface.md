# 获取接口调用凭据

接口应在服务器端调用，不可在前端（小程序、网页、APP等）直接调用，具体可参考接口调用指南

接口英文名：getStableAccessToken

本接口用于获取获取全局唯一后台接口调用凭据（Access Token），token 有效期为 7200 秒，开发者需要进行妥善保存，使用注意事项请参考此文档。

有两种调用模式:

普通模式，access_token 有效期内重复调用该接口不会更新 access_token，绝大部分场景下使用该模式；
强制刷新模式，会导致上次获取的 access_token 失效，并返回新的 access_token；
此接口和 getAccessToken 互相隔离，且比其更加稳定，推荐使用此接口替代。

如使用云开发，可通过云调用免维护 access_token 调用；
如使用云托管，也可以通过微信令牌/开放接口服务免维护 access_token 调用；

1. 调用方式
   HTTPS 调用
   POST https://api.weixin.qq.com/cgi-bin/stable_token
   云调用
   本接口不支持云调用
   第三方调用
   本接口不支持第三方平台调用。

2. 请求参数
   查询参数 Query String parameters
   无

请求体 Request Payload
参数名 类型 必填 说明
grant_type string 是 填写 client_credential
appid string 是 账号的唯一凭证，即 AppID，点此查看如何获取Appid
secret string 是 唯一凭证密钥，即 AppSecret，点此查看如何获取AppSecret
force_refresh boolean 否 默认使用 false。1. force_refresh = false 时为普通调用模式，access_token 有效期内重复调用该接口不会更新 access_token；2. 当force_refresh = true 时为强制刷新模式，会导致上次获取的 access_token 失效，并返回新的 access_token

3. 返回参数
   返回体 Response Payload
   参数名 类型 说明
   access_token string 获取到的凭证
   expires_in number 凭证有效时间，单位：秒。目前是7200秒之内的值。

4. 注意事项
   与 getAccessToken 获取的调用凭证完全隔离，互不影响。
   该接口仅支持 POST 形式的调用。
   该接口调用频率限制为 1 万次 每分钟，每天限制调用 50 万次。
   access_token 存储空间至少保留 512 字符。
   强制刷新模式每天限用 20 次且需间隔 30 秒。
   普通模式下平台会提前 5 分钟更新 access_token。

5. 代码示例
   5.1 不强制刷新获取Token（不传递force_refresh，默认值为false）
   请求示例

POST https://api.weixin.qq.com/cgi-bin/stable_token
{
"grant_type": "client_credential",
"appid": "APPID",
"secret": "APPSECRET"
}
返回示例

{
"access_token":"ACCESS_TOKEN",
"expires_in":7200
}
5.2 不强制刷新获取Token（设置force_refresh为false）:
请求示例

{
"grant_type": "client_credential",
"appid": "APPID",
"secret": "APPSECRET",
"force_refresh": false
}
返回示例

{
"access_token":"ACCESS_TOKEN",
"expires_in":345 // 如果仍然有效，会返回上次的 token，并给出所剩有效时间
}
5.3 强制刷新模式，慎用，连续使用需要至少间隔30s
请求示例

POST https://api.weixin.qq.com/cgi-bin/stable_token
{
"grant_type": "client_credential",
"appid": "APPID",
"secret": "APPSECRET",
"force_refresh": true
}
返回示例

{
"access_token":"ACCESS_TOKEN",
"expires_in":7200
}

6. 错误码
   以下是本接口的错误码列表，其他错误码可参考 通用错误码

错误码 错误描述 解决方案
-1 system error 系统繁忙，此时请开发者稍候再试
0 ok ok
40002 invalid grant_type 不合法的凭证类型
40013 invalid appid 不合法的 AppID ，请开发者检查 AppID 的正确性，避免异常字符，注意大小写
40125 invalid appsecret 无效的appsecret，请检查appsecret的正确性
40164 invalid ip not in whitelist 将ip添加到ip白名单列表即可
41002 appid missing 缺少 appid 参数
41004 appsecret missing 缺少 secret 参数
43002 require POST method 需要 POST 请求
45009 reach max api daily quota limit 调用超过天级别频率限制。可调用clear_quota接口恢复调用额度。
45011 api minute-quota reach limit mustslower retry next minute API 调用太频繁，请稍候再试
89503 此次调用需要管理员确认，请耐心等候
89506 该IP调用求请求已被公众号管理员拒绝，请24小时后再试，建议调用前与管理员沟通确认
89507 该IP调用求请求已被公众号管理员拒绝，请1小时后再试，建议调用前与管理员沟通确认

# 上传永久素材

接口应在服务器端调用，不可在前端（小程序、网页、APP等）直接调用，具体可参考接口调用指南

接口英文名：addMaterial

本接口用于新增图片/语音/视频等类型的永久素材。

1. 调用方式
   HTTPS 调用
   POST https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=video
   云调用
   调用方法：officialAccount.material.addMaterial

出入参和 HTTPS 调用相同，调用方式可查看 云调用 说明文档

第三方调用
本接口支持第三方平台代商家调用。

该接口所属的权限集 id 为：11、100

服务商获得其中之一权限集授权后，可通过使用 authorizer_access_token 代商家进行调用，具体可查看 第三方调用 说明文档。

2. 请求参数
   查询参数 Query String parameters
   参数名 类型 必填 示例 说明
   access_token string 是 ACCESS_TOKEN 接口调用凭证，可使用 access_token、authorizer_access_token
   type string 是 video 媒体类型，图片（image）、语音（voice）、视频（video）和缩略图（thumb）
   请求体 Request Payload
   参数名 类型 必填 说明
   media formdata 是 媒体文件标识
   description object 否 素材描述信息，上传视频素材时需要

Body.description Object Payload
素材描述信息，上传视频素材时需要

参数名 类型 必填 示例 说明
title string 否 视频标题 视频素材描述标题
introduction string 否 视频简介 视频素材描述简介

3. 返回参数
   返回体 Response Payload
   参数名 类型 说明
   media_id string 新增的永久素材media_id
   url string 图片素材URL(仅图片返回)

4. 注意事项
   永久图片素材新增后，将带有URL返回给开发者，开发者可以在腾讯系域名内使用（腾讯系域名外使用，图片将被屏蔽）。
   公众号的素材库保存总数量有上限：图文消息素材、图片素材上限为100000，其他类型为1000。
   素材的格式大小等要求与公众平台官网一致：
   图片（image）: 10M，支持bmp/png/jpeg/jpg/gif格式
   语音（voice）：2M，播放长度不超过60s，mp3/wma/wav/amr格式
   视频（video）：10MB，支持MP4格式
   缩略图（thumb）：64KB，支持JPG格式
   图文消息的具体内容中，微信后台将过滤外部的图片链接，图片url需通过上传图文消息图片接口上传图片获取。
   上传图文消息图片接口所上传的图片，不占用公众号的素材库中图片数量的100000个的限制，图片仅支持jpg/png格式，大小必须在1MB以下。
   图文消息支持正文中插入自己账号和其他公众号/服务号已群发文章链接的能力。

5. 代码示例
   5.1 新增视频示例
   请求示例

curl "https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE" -F media=@media.file -F description='{"title":VIDEO_TITLE, "introduction":INTRODUCTION}'
返回示例

{
"media_id": "MEDIA_ID_123456",
"url": ""
}
5.2 新增图片示例
请求示例

curl "https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE" -F media=@media.file
返回示例

{
"media_id": "MEDIA_ID_654321",
"url": "https://example.com/image.jpg"
}

6. 错误码
   以下是本接口的错误码列表，其他错误码可参考 通用错误码

错误码 错误描述 解决方案
40007 invalid media_id 无效媒体ID

# 新增草稿

接口应在服务器端调用，不可在前端（小程序、网页、APP等）直接调用，具体可参考接口调用指南

接口英文名：draft_add

本接口用于新增常用的素材到草稿箱。

1.上传到草稿箱中的素材被群发或发布后，该素材将从草稿箱中移除 2.新增草稿也可在公众平台官网-草稿箱中查看和管理

1. 调用方式
   HTTPS 调用
   POST https://api.weixin.qq.com/cgi-bin/draft/add?access_token=ACCESS_TOKEN
   云调用
   本接口不支持云调用
   第三方调用
   本接口支持第三方平台代商家调用。

该接口所属的权限集 id 为：11、100

服务商获得其中之一权限集授权后，可通过使用 authorizer_access_token 代商家进行调用，具体可查看 第三方调用 说明文档。

2. 请求参数
   查询参数 Query String parameters
   参数名 类型 必填 说明
   access_token string 是 接口调用凭证，可使用 access_token、authorizer_access_token
   请求体 Request Payload
   参数名 类型 必填 说明
   articles objarray 是 图文素材集合

Body.articles(Array) Object Payload
图文素材集合

参数名 类型 必填 说明
article*type string 否 文章类型，分别有图文消息（news）、图片消息（newspic），不填默认为图文消息（news）
title string 是 标题
author string 否 作者
digest string 否 图文消息的摘要，仅有单图文消息才有摘要，多图文此处为空。如果本字段为没有填写，则默认抓取正文前54个字。
content string 是 图文消息的具体内容，支持HTML标签，必须少于2万字符，小于1M，且此处会去除JS,涉及图片url必须来源 "上传图文消息内的图片获取URL"接口获取。外部图片url将被过滤。 图片消息则仅支持纯文本和部分特殊功能标签如商品，商品个数不可超过50个
content_source_url string 否 图文消息的原文地址，即点击“阅读原文”后的URL
thumb_media_id string 否 article_type为图文消息（news）时必填，图文消息的封面图片素材id（必须是永久MediaID）
need_open_comment number 否 是否打开评论，0不打开(默认)，1打开
only_fans_can_comment number 否 是否粉丝才可评论，0所有人可评论(默认)，1粉丝才可评论
pic_crop_235_1 string 否 图文消息封面裁剪为2.35:1规格的坐标字段。以原始图片（thumb_media_id）左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其左上角所在的坐标即为（X1,Y1）,右下角所在的坐标则为（X2,Y2），用分隔符*拼接为X1_Y1_X2_Y2，每个坐标值的精度为不超过小数点后6位数字。示例见下图，图中(X1,Y1) 等于（0.1945,0）,(X2,Y2)等于（1,0.5236），所以请求参数值为0.1945_0_1_0.5236。
pic_crop_1_1 string 否 图文消息封面裁剪为1:1规格的坐标字段，裁剪原理同pic_crop_235_1，裁剪后的图片必须符合规格要求。
image_info object 是 图片消息里的图片相关信息，图片数量最多为20张，首张图片即为封面图
cover_info object 否 图片消息的封面信息
product_info object 否 商品信息

Body.articles(Array).image_info Object Payload
图片消息里的图片相关信息，图片数量最多为20张，首张图片即为封面图

参数名 类型 必填 说明
image_list objarray 是 图片列表

Body.articles(Array).image_info.image_listObject Payload
图片列表

参数名 类型 必填 说明
image_media_id string 是 图片消息里的图片素材id（必须是永久MediaID）

Body.articles(Array).cover_info Object Payload
图片消息的封面信息

参数名 类型 必填 说明
crop_percent_list objarray 否 封面裁剪信息，。以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其左上角所在的坐标填入x1，y1参数，右下角所在的坐标填入x2，y2参数

Body.articles(Array).cover_info.crop_percent_listObject Payload
封面裁剪信息，。以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其左上角所在的坐标填入x1，y1参数，右下角所在的坐标填入x2，y2参数

参数名 类型 必填 说明
ratio string 否 裁剪比例，支持：“1_1”，“16_9”,“2.35_1”
x1 string 否 以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其左上角所在的坐标填入x1，y1参数
y1 string 否 以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其左上角所在的坐标填入x1，y1参数
x2 string 否 以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其右下角所在的坐标填入x2，y2参数
y2 string 否 以图片左上角（0,0），右下角（1,1）建立平面坐标系，经过裁剪后的图片，其右下角所在的坐标填入x2，y2参数

Body.articles(Array).product_info Object Payload
商品信息

参数名 类型 必填 说明
footer_product_info object 否 文末插入商品相关信息

Body.articles(Array).product_info.footer_product_info Object Payload
文末插入商品相关信息

参数名 类型 必填 说明
product_key string 否 商品key

3. 返回参数
   返回体 Response Payload
   参数名 类型 说明
   media_id string 上传后的获取标志(不超过128字符)

4. 注意事项
   本接口无特殊注意事项

5. 代码示例
   请求示例

{
"articles": [
// 图文消息结构
{
"article_type":"news",
"title":TITLE,
"author":AUTHOR,
"digest":DIGEST,
"content":CONTENT,
"content_source_url":CONTENT_SOURCE_URL,
"thumb_media_id":THUMB_MEDIA_ID,
"need_open_comment":0,
"only_fans_can_comment":0,
"pic_crop_235_1":X1_Y1_X2_Y2,
"pic_crop_1_1":X1_Y1_X2_Y2
},
// 图片消息结构
{
"article_type":"newspic",
"title":TITLE,
"content":CONTENT,
"need_open_comment":0,
"only_fans_can_comment":0,
"image_info":{
"image_list":[
{
"image_media_id":IMAGE_MEDIA_ID
}
]
},
"cover_info":{
"crop_percent_list":[
{
"ratio": "1_1",
"x1":"0.166454",
"y1":"0",
"x2":"0.833545",
"y2":"1"
}
// 如有其他比例的裁剪需求，可继续在此处填写
]
},
"product_info": {
"footer_product_info": {
"product_key":PRODUCT_KEY
}
}
}
]
}
返回示例

{
"media_id": "MEDIA_ID"
}

6. 错误码
   以下是本接口的错误码列表，其他错误码可参考 通用错误码

错误码 错误描述 解决方案
53404 账号已被限制带货能力 请删除商品后重试
53405 插入商品信息有误 检查参数及商品状态
53406 请先开通带货能力

# 发布草稿

接口应在服务器端调用，不可在前端（小程序、网页、APP等）直接调用，具体可参考接口调用指南

接口英文名：freepublish_submit

本接口用于将图文草稿提交发布。

开发者需要先将图文素材以草稿的形式保存，选择要发布的草稿 media_id 进行发布。

1. 调用方式
   HTTPS 调用
   POST https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=ACCESS_TOKEN
   云调用
   本接口不支持云调用
   第三方调用
   本接口支持第三方平台代商家调用。

该接口所属的权限集 id 为：7

服务商获得其中之一权限集授权后，可通过使用 authorizer_access_token 代商家进行调用，具体可查看 第三方调用 说明文档。

2. 请求参数
   查询参数 Query String parameters
   参数名 类型 必填 说明
   access_token string 是 接口调用凭证，可使用 access_token、authorizer_access_token
   请求体 Request Payload
   参数名 类型 必填 示例 说明
   media_id string 是 MEDIA_ID 要发布的草稿的media_id

3. 返回参数
   返回体 Response Payload
   参数名 类型 说明
   errcode number 错误码
   errmsg string 错误信息
   publish_id string 发布任务的id
   msg_data_id string 消息的数据ID

4. 注意事项
   请注意：正常情况下调用成功时，errcode将为0，此时只意味着发布任务提交成功，并不意味着此时发布已经完成，所以，仍有可能在后续的发布过程中出现异常情况导致发布失败，如原创声明失败、平台审核不通过等。

发布结果的事件推送
由于发布任务提交后，发布任务可能在一定时间后才完成，因此，发布接口调用时，仅会给出发布任务是否提交成功的提示，若发布任务提交成功，则在发布任务结束时，会向开发者在公众平台填写的开发者URL（callback URL）推送事件。

推送的XML结构成功时示例：

<xml>
  <ToUserName><![CDATA[gh_4d00ed8d6399]]></ToUserName>
  <FromUserName><![CDATA[oV5CrjpxgaGXNHIQigzNlgLTnwic]]></FromUserName>
  <CreateTime>1481013459</CreateTime>
  <MsgType><![CDATA[event]]></MsgType>
  <Event><![CDATA[PUBLISHJOBFINISH]]></Event>
  <PublishEventInfo>
    <publish_id>2247503051</publish_id>
    <publish_status>0</publish_status>
    <article_id><![CDATA[b5O2OUs25HBxRceL7hfReg-U9QGeq9zQjiDvy
WP4Hq4]]></article_id>
    <article_detail>
      <count>1</count>
      <item>
        <idx>1</idx>
        <article_url><![CDATA[ARTICLE_URL]]></article_url>
      </item>
    </article_detail>
  </PublishEventInfo>
</xml>
原创审核不通过时示例：

<xml>
  <ToUserName><![CDATA[gh_4d00ed8d6399]]></ToUserName>
  <FromUserName><![CDATA[oV5CrjpxgaGXNHIQigzNlgLTnwic]]></FromUserName>
  <CreateTime>1481013459</CreateTime>
  <MsgType><![CDATA[event]]></MsgType>
  <Event><![CDATA[PUBLISHJOBFINISH]]></Event>
  <PublishEventInfo>
    <publish_id>2247503051</publish_id>
    <publish_status>2</publish_status>
    <fail_idx>1</fail_idx>
    <fail_idx>2</fail_idx>
  </PublishEventInfo>
</xml>
返回参数说明

参数 说明
ToUserName 公众号的ghid
FromUserName 公众号群发助手的openid，为mphelper
CreateTime 创建时间的时间戳
MsgType 消息类型，此处为event
Event 事件信息，此处为PUBLISHJOBFINISH
publish_id 发布任务id
publish_status 发布状态，0:成功, 1:发布中，2:原创失败, 3: 常规失败, 4:平台审核不通过, 5:成功后用户删除所有文章, 6: 成功后系统封禁所有文章
article_id 当发布状态为0时（即成功）时，返回图文的 article_id，可用于“客服消息”场景
count 当发布状态为0时（即成功）时，返回文章数量
idx 当发布状态为0时（即成功）时，返回文章对应的编号
article_url 当发布状态为0时（即成功）时，返回图文的永久链接
fail_idx 当发布状态为2或4时，返回不通过的文章编号，第一篇为 1；其他发布状态则为空

5. 代码示例
   请求示例

{
"media_id": "MEDIA_ID"
}
返回示例

{
"errcode": 0,
"errmsg": "ok",
"publish_id": "100000001"
}

6. 错误码
   以下是本接口的错误码列表，其他错误码可参考 通用错误码

错误码 错误描述 解决方案
0 ok 成功
48001 api unauthorized api 功能未授权，请确认公众号/服务号已获得该接口，可以在「公众平台官网 - 开发者中心页」中查看接口权限
53503 该草稿未通过发布检查 检查下草稿信息
53504 需前往公众平台官网使用草稿 需前往公众平台官网使用草稿
53505 请手动保存成功后再发表 请前往公众平台官网手动保存成功后再发表
