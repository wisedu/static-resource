define(function(require, exports, module) {

	var config = {

		/*
		 * 前端部门开发模式
		 */
		"FE_DEBUG_MODE": true,

		/*
			业务线开发模式，转测时置false
		 */
		"DEBUG_MODE": true,

		/*
			资源服务器地址
		 */
		"RESOURCE_SERVER": "http://res.wisedu.com",

		/*
		 * 主题 blue purple
		 */
		"THEME": "purple",

		/*
			服务器端生成配置API(API_BASE_PATH目录下)
			@example "/config.do" ./mock/serverconfig.json
		 */
		"SERVER_CONFIG_API": "",

		/*
			APP默认路由
		 */
		'APP_ENTRY': "",

		/*
		 	APP标题
		 */
		"APP_TITLE": "APP标题",

		/*
			应用底部说明文本
		 */
		"FOOTER_TEXT": "",

		/*
			需要展示的模块
		 */
		"MODULES": [{
			title: "职称评审设置",
			route: "demo"
		}],

		/*
			头部配置
		 */
		"HEADER": {
			"dropMenu": [{
				"text": "就业资讯师",
				"active": true
			}, {
				"text": "就业管理人员"
			}],
			"logo": "./public/images/logo.png",
			"icons": ["icon-apps"],
			"userImage": "./public/images/user.png",
			"userInfo": {
				"image": "http://res.wisedu.com/scenes/public/images/demo/user1.png",
				"info": [
					"01118888",
					"张晓明  男",
					"南京理工大学  信息化办公室",
					"zhangxm@wisedu.com",
					"18888888888"
				],
				"logoutHref": "javascript:void(0);"
			}
		}
	};

	return config;

});