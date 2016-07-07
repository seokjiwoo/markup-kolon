/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'myPage/Message.js';

	var MyPageClass = require('./MyPage.js'),
	MyPage = MyPageClass(),
	controller = require('../../controller/MyPageController.js'),
	events = require('../../events/events'),
	TIMELINE_EVENT = events.TIMELINE;
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	},
	self;

	var opts = {
		timelineWrap : '.js-timeline-wrap',
		fromNow : '.js-fromNow',
		templates : {
			wrap : '.timeCard',
			template : '#me-timeline-templates'
		},
		dateFormat : {
			recordDate : 'YYYY년 M월',
			fromDate : 'YYYY.MM.DD',
			fromNow : 'YYYY-MM-DD HH:mm:ss'
		},
		colorbox : '#colorbox',
		cssClass : {
			isLoading : 'is-loading',
			hasAnimate : 'has-animate'
		},
		dataAttr : {
			timelineInfo : '[data-timeline-info]'
		},
		updateTime : 1000 * 60,
	};
	
	return callerObj;
	
	function init() {
		MyPage.init();
		
		debug.log(fileName, $, util);

		self = callerObj;
		self.opts = opts;

		setElements();
		setBindEvents();
		
		// controller.myTimeLine();
		onControllerListener({type:TIMELINE_EVENT.LIST});
	}

	function setElements() {
		self.templatesWrap = $(self.opts.templates.wrap);
		self.template = $(self.opts.templates.template);

		self.colorbox = $(self.opts.colorbox);
	}

	function setBindEvents() {
		$(controller).on(TIMELINE_EVENT.WILD_CARD, onControllerListener);
	}

	function getFromNow(registerDateTime) {
		return win.moment(registerDateTime, self.opts.dateFormat.fromNow).fromNow().split(' ').join('');
	}

	function setFromNowUpdate() {
		var timelines = self.templatesWrap.find(self.opts.dataAttr.timelineInfo),
		info = {},
		fromNow;

		$.each(timelines, function() {
			info = $(this).data('timeline-info');
			fromNow = $(this).find(self.opts.fromNow);
			fromNow.html(getFromNow(info.registerDateTime));
		});

		setTimeout(setFromNowUpdate, self.opts.updateTime);

		debug.log(fileName, 'setFromNowUpdate', 'self.opts.updateTime > ', self.opts.updateTime);
	}

	// Handlebars 마크업 템플릿 구성
	function displayData(data) {
		var myCommons = data.data.myCommons,
		exRecordDate = '',
		recordDate = '',
		list = [],
		listIdx;
		
		// 최신기록부터..
		myCommons.reverse();

		$.map(myCommons, function(value) {
			recordDate = win.moment(value.registerDateTime).format(self.opts.dateFormat.recordDate);

			if (exRecordDate !== recordDate) {
				list.push({
					'recordDate' : recordDate,
					'records' : []
				});
				listIdx = list.length - 1;
				exRecordDate = recordDate;
			}

			switch(value.myPageTypeCode) {
				case 'BM_MYPAGE_TYPE_11':
					value.recordType = 'recordType';
					break;
				case 'BM_MYPAGE_TYPE_10':
					value.recordType = 'recordType01';
					break;
				default:
					value.recordType = 'recordType01';
					break;
			}

			value.fromDate = win.moment(value.registerDateTime).format(self.opts.dateFormat.fromDate);
			value.fromNow = getFromNow(value.registerDateTime);

			list[listIdx].records.push(value);
		});

		list[listIdx].records[list[listIdx].records.length - 1].isJoin = true;

		var source = self.template.html(),
		template = win.Handlebars.compile(source),
		insertElements = $(template(list));

		self.templatesWrap.empty()
							.addClass(self.opts.cssClass.isLoading)
							.append(insertElements);

		self.templatesWrap.imagesLoaded()
							.always(function() {
								self.templatesWrap.removeClass(self.opts.cssClass.isLoading);

								var timelines = self.templatesWrap.find(self.opts.dataAttr.timelineInfo);
								$.each(timelines, function(index) {
									;(function(target, delay) {
										win.setTimeout(function() {
											target.addClass(self.opts.cssClass.hasAnimate);
										}, delay);
										target.closest(self.opts.timelineWrap).addClass(self.opts.cssClass.hasAnimate);
									})($(this),index * 200);
								});
							});
	}

	function onControllerListener(e, status, response) {
		var eventType = e.type,
		dummyData = {},
		result = response;

		switch(eventType) {
			case TIMELINE_EVENT.LIST:
				dummyData = {"status":"200","message":"ok","data":{"myCommons":[{"myPageTypeCode":"BM_MYPAGE_TYPE_11","myPageTypeName":"가입 인사","myPageContents":"커먼에 가입하신걸 환영합니다.","registerDateTime":"2014-06-28 00:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2015-06-29 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-01-29 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-01-30 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-02-01 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-02-15 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-02-21 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-05-01 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-06-29 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-01 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-02 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-05 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-06 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-06 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-07 10:00:00.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-07 10:35:10.0"},{"myPageTypeCode":"BM_MYPAGE_TYPE_15","myPageTypeName":"마이카트","myPageContents":"다이닝 스페이스 상품을 장바구니에 추가하셨습니다.","registerDateTime":"2016-07-07 11:42:10.0"}]}};

				/*
				401	Unauthorized
				403	Forbidden
				404	Not Found
				 */
				switch(status) {
					// case 200:
					// 	break;
					default:
						result = dummyData;
						break;
				}
				debug.log(fileName, 'onControllerListener', eventType, status, response, result);
				displayData(result);
				setFromNowUpdate();
				break;
		}
	}

};