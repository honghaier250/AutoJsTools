function killApp(packageName) {
	var name = getPackageName(packageName);

	if (!name) {
		if (getAppName(packageName)) {
			name = packageName;
		} else {
			return false;
		}
	}

	app.openAppSetting(name);
	text(app.getAppName(name)).waitFor();
	let stop = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne();
	if (stop.enabled()) {
		textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*)/).findOne().click();
		buttons = textMatches(/(.*强.*|.*停.*|.*结.*|.*行.*|确定|是)/).find()
		if (buttons.length > 0) {
			buttons[buttons.length - 1].click()
		}

		log(app.getAppName(name) + "应用已被关闭");
		sleep(1000);
		back();
	} else {
		log(app.getAppName(name) + "应用不能被正常关闭或不在后台运行");
		back();
	}
}

const celebrate = () => {
	const music = '/storage/emulated/0/Download/Burning.m4a'
	if (files.exists(music)) {
		media.playMusic(music);
		sleep(media.getMusicDuration());
	}
}

const toMaicai = () => {
	maicai = className('android.view.View').desc('美团买菜').findOne()

	if (maicai) {
		maicai.click()
		toast('已进入美团买菜')
	} else {
		toast('未找到美团买菜，退出')
		exit;
	}
}

const toShoppingCart = () => {
	shopping = id('img_shopping_cart').findOne()

	if (shopping) {
		shopping.parent().click()
		toast('已进入购物车')
	} else {
		toast('未找到购物车按钮，退出')
		exit;
	}
}

const payMoney = () => {

	if (className("android.widget.TextView").text('极速支付').exists()) {
		className("android.widget.TextView").text('极速支付').findOne().parent().click()
		sleep(100)
	}

	if (className("android.widget.TextView").text('确认并支付').exists()) {
		className("android.widget.TextView").text('确认并支付').findOne().parent().click()
	}

	celebrate()
}

const submitOrder = () => {

	let count = 1;
	let pickupTime = null;

	if (className("EditText").text("请输入姓名").exists()) {
		className("EditText").text("请输入姓名").findOne().setText("");
	}

	do {

		//选择送达时间
		if (textStartsWith('自提时间').exists()) {
			textStartsWith('自提时间').findOne().parent().click()
		}

		if (textStartsWith('今天').exists()) {
			textStartsWith('今天').findOne().parent().click()

			var timeList = ['6:', '7:', '8:', '9:', '10:', '11:', '12:', '13:', '14:', '15:', '16:', '17:', '18:', '19:', '20:', '21:', '22:', '23:'];
			for (i = 6; i <= 23; i++) {
				dayTime = textContains(timeList[i]).find()
				time = dayTime.filter(item => item.clickable && item.checkable && enabled)

				if (time.length > 0) {
					pickupTime = time[0]
					break;
				}
			}
		}

		if (pickupTime != null) {
			pickupTime.parent().click()
			sleep(100)
			payMoney()
			sleep(2000)
			break
		} else {
			count = count + 1;
		}
	} while (count)
}

const settling = () => {

	let count = 1;
	let shouldWait = true;

	do {

		if (count % 10 == 0) {
			toast('抢菜第' + count + '次尝试')
		}

		submit = textStartsWith('结算').findOne()
		if (submit) {
			submit.parent().click()
			sleep(1000)
		} else {
			//等待弹出框
			sleep(100)
		}

		if (textStartsWith('我知道了').exists()) {
			textStartsWith('我知道了').findOne().parent().click()
			shouldWait = true
		} else {
			shouldWait = false
		}

		if (!shouldWait && textStartsWith('返回购物车').exists()) {
			textStartsWith('返回购物车').findOne().parent().click()
			shouldWait = true
		}

		if (shouldWait == false) {
			sleep(10000)

			if (textStartsWith('我知道了').exists()) {
				textStartsWith('我知道了').findOne().parent().click()
			}

			if (textStartsWith('返回购物车').exists()) {
				textStartsWith('返回购物车').findOne().parent().click()
			}
		}

		if (textStartsWith('放弃机会').exists()) {
			textStartsWith('放弃机会').findOne().parent().click()
		}

		if (className("EditText").text("请输入姓名").exists()) {
			submitOrder()
			break
		} else {
			count = count + 1;
		}
	} while (count)

}

const start = () => {
	killApp('美团')

	const appName = "美团";
	launchApp(appName);

	//进入美团买菜
	sleep(1000);
	toMaicai()

	//进入购物车
	sleep(5000);
	toShoppingCart()

	//结算
	sleep(5000)
	settling()
}

start()
