/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'shop/Detail.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass(),
	cartController = require('../../controller/OrderController.js'),
	productController = require('../../controller/ProductController.js'),
	eventManager = require('../../events/EventManager'),
	events = require('../../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	CART_EVENT = events.CART,
	PRODUCTMOCK_EVENT = events.PRODUCT_MOCK;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		templates : {
			wrap : '.container',
			template : '#shop-detail-templates'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		}
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		
		debug.log(fileName, 'init');

		self = callerObj;
		self.opts = opts;
		self.productNumber = util.getUrlVar().productNumber;
		self.reviewNumber = util.getUrlVar().reviewNumber;

		if (debug.isDebugMode()) {
			if (!self.productNumber) {
				var productNumber = win.prompt('queryString not Found!\n\nproductNumber 를 입력하세요', '');
				location.href += '?productNumber=' + productNumber;
				return;
			}
			if (!self.reviewNumber) {
				var reviewNumber = win.prompt('queryString not Found!\n\nreviewNumber 를 입력하세요', '');
				location.href += '&reviewNumber=' + reviewNumber;
				return;
			}
		}
		
		setElements();
		setBindEvents();

		productController.evals(self.productNumber);
		productController.info(self.productNumber);
		productController.partnerInfo(self.productNumber);
		productController.preview(self.productNumber);
		productController.related(self.productNumber);
		productController.reviews(self.productNumber, self.reviewNumber);

		$('.container a, .container button').on('click', function(e) {
			e.preventDefault();

			var target = $(e.currentTarget);

			if (target.hasClass('js-add-card')) {
				var data = [
					{
						"myCartAddCompositions": [
							{
								"addCompositionProductNumber": 0,
								"addCompositionProductQuantity": 0,
								"orderOptionNumber": 0
							}
						],
						"optionQuantity": 0,
						"orderOptionNumber": 0,
						"productNumber": parseInt(self.productNumber, 10),
						"productQuantity": 0
					}
				];
				$('.js-ajax-data').html('ajax 전송 data : ' + JSON.stringify(data));
				cartController.addMyCartList(data);
			} else {
				win.alert('"마이카트" / "구매하기" 버튼을 클릭하세요.');
			}
		});
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
		self.selPopBtnInfo = {};
	}

	function setBindEvents() {
		$(cartController).on(CART_EVENT.WILD_CARD, onControllerListener);
		$(productController).on(PRODUCTMOCK_EVENT.WILD_CARD, onControllerListener);
		eventManager.on(COLORBOX_EVENT.WILD_CARD, onColorBoxAreaListener);
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(data));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);
								eventManager.triggerHandler(COLORBOX_EVENT.REFRESH);
							});
	}

	function onControllerListener(e, status, response, elements) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			// default:
			// 	dummyData = [];

			// 	/*
			// 	401	Unauthorized
			// 	403	Forbidden
			// 	404	Not Found
			// 	 */
			// 	switch(status) {
			// 		case 200:
			// 			break;
			// 		default:
			// 			win.alert('HTTP Status Code ' + status + ' - DummyData 구조 설정');
			// 			result = dummyData;
			// 			break;
			// 	}

			// 	debug.log(fileName, 'onControllerListener', eventType, status, response);
			// 	displayData(result);
			// 	break;

			// [S] CART - 장바구니
				case CART_EVENT.ADD:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
			// [E] CART - 장바구니

			// [S] PRODUCT_MOCK - 상품
				case PRODUCTMOCK_EVENT.EVALS:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCTMOCK_EVENT.INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCTMOCK_EVENT.PARTNER_INFO:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCTMOCK_EVENT.PREVIEW:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCTMOCK_EVENT.RELATED:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
				case PRODUCTMOCK_EVENT.REVIEWS:
					debug.log(fileName, 'onControllerListener', eventType, status, response);
					$('.' + eventType).html(JSON.stringify(response));
					break;
			// [E] PRODUCT_MOCK - 상품
		}
	}

	function onColorBoxAreaListener(e) {
		switch(e.type) {
			case COLORBOX_EVENT.COMPLETE:
				break;
			case COLORBOX_EVENT.CLEANUP:
				break;
		}
	}
};