/* jshint node: true, strict: true */

module.exports = function() {
	'use strict';

	var win = window,
	$ = win.jQuery,
	debug = require('../../utils/Console.js'),
	util = require('../../utils/Util.js'),
	fileName = 'manager/Index.js';

	var SuperClass = require('../Page.js'),
	Super = SuperClass();

	var CardList = require('../../components/CardList.js');
	var cardList;

	var controller = require('../../controller/ExpertsController.js');
	$(controller).on('expertsNameResult', expertListHandler);

	var searchName = '';
	var orderCode = 'newest';
	
	var callerObj = {
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;
	
	function init() {
		Super.init();
		debug.log(fileName, $, util);

		cardList = CardList();
		cardList.init();	// 카드 리스트

		var slider = $('#managerSlider').bxSlider({
			pager:false,
			nextSelector: '#sliderNext',
  			prevSelector: '#sliderPrev',
			onSlideAfter: function (currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {
				$('#slideCon0'+(currentSlideHtmlObject)).fadeIn().css('display','block').siblings().hide();
				switch(currentSlideHtmlObject) {
					case 0:
						$('.bx-prev').css('background-position','-348px 0');
						$('.bx-next').css('background-position','-174px 0');
						break;
					case 1:
						$('.bx-prev').css('background-position','-0 0');
						$('.bx-next').css('background-position','-348px 0');
						break;
					case 2:
						$('.bx-prev').css('background-position','-174px 0');
						$('.bx-next').css('background-position','0 0');
						break;
				}
			}
		});
		
		$('#searchButton').click(refreshList);

		window.onhashchange = hashChangeHandler;
		hashChangeHandler();
	}

	function hashChangeHandler() {
		//$('html, body').scrollTop(0);
		orderCode = location.hash.substr(1);
		switch(orderCode) {
			default:
				orderCode = 'newest';
			case 'newest':
				$('#orderTab1').addClass('on');
				$('#orderTab2').removeClass('on');
				break;
			case 'like':
				$('#orderTab1').removeClass('on');
				$('#orderTab2').addClass('on');
				break;
		}
		refreshList();
	};

	function refreshList(e) {
		if (e != undefined) e.preventDefault();
		cardList.removeAllData();
		controller.name(orderCode, $('#searchField').val());
		if (e != undefined) e.stopPropagation();
	}

	function expertListHandler(e, status, result) {
		console.log(result.data.experts);
		$('#expertCount').text(result.data.experts.length);
		cardList.appendData(result.data.experts);
	};
}