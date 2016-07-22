/* global $ */

module.exports = function() {
	var SuperClass = require('../pagesCommon/PageCommon.js');
	var Super = SuperClass();
	
	var util = require('../utils/Util.js');	
	var loginController = require('../controller/LoginController');
	$(loginController).on('myInfoResult', myInfoResultHandler);
	var loginDataModel = require('../model/LoginModel');
	var loginData;
	
	var pageId;

	var eventManager = require('../events/EventManager'),
	events = require('../events/events'),
	COLORBOX_EVENT = events.COLOR_BOX,
	MEMBERINFO_EVENT = events.MEMBER_INFO,
	INFOSLIDER_EVENT = events.INFO_SLIDER,
	WINDOWOPENER_EVENT = events.WINDOW_OPENER,
	CARD_LIST_EVENT = events.CARD_LIST;

	var memberInfoController = require('../controller/MemberInfoController');
	$(memberInfoController).on('verifyMemberResult', verifyMemberResultHandler);

	$(document).on('verifyMember', requestVerifyMember);
	
	var callerObj = {
		/**
		 * SuperClass 연결
		 */
		Super: Super,
		/**
		 * 초기화
		 */
		init: init
	};
	
	return callerObj;

	
	function init(_pageId) {
		pageId = _pageId;
		if (pageId == undefined) pageId = $('body').data('pageId');
		Super.init(_pageId, 'm');

		initGnb();

		initHorizontalScroll();	//horizontal scroll wrap width

		// Colorbox Complete 시점
		eventManager.on(COLORBOX_EVENT.REFRESH, onColorboxRefreshListener)
					.on(COLORBOX_EVENT.DESTROY, onColorboxDestoryListener);


		initAddressPopupButton();	// 주소록 팝업버튼

		$('.btnToggle').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('open');
			$(this).siblings('.slideCon').slideToggle();
		});
		$('.searchToggle').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('searchOpen');
			$(this).siblings('.searchCon').slideToggle();
		});

		$('.btnMore').on('click', function(e) { // common slideToggle
			e.preventDefault();
			$(this).toggleClass('opened');
			$(this).parent().parent().find('.slideMore').slideToggle();
		});

		$('#mobileScrap li').each(function() { // scrap fadeToggle
			$(this).find('.scrapMore').on('click', function() {
				$(this).toggleClass('opened');
				$(this).parent().find('.scrapMoreList, .dim').fadeToggle();
			})
		});

		$(".periodSearch > a").on('click', function(e) { //mypage order
			e.preventDefault();
			var tg = $(this);
			if( !$(".searchArea").is(":visible") ) {
				$(".searchArea").css("display","block");
				tg.find("> em").addClass("up")
			}else{
				$(".searchArea").css("display","none");
				tg.find("> em").removeClass("up")
			}
		});

		$('.optList > li').each(function() { // 상품 list option 삭제 버튼
			$(this).find('.btnDel').click(function() {
				$(this).parent().parent().hide();
			})
			$(this).find('.option').eq(0).find('.btnDel').click(function() {
				$(this).parent().parent().next().css('border-top','0');
			})
		});

		$(".portfolioArea > ul").bxSlider({ // 전문가 상세 이미지 인덱스 체크
			pager : false,
			onSliderLoad  : function() {
				var max = $(this).find('li').filter(':not(.bx-clone)').size();
				$(".portfolioArea .count").find("em").text( max );
				$(".portfolioArea .count").find("i").text( (max-max) + 1 );
			},
			onSlideAfter : function($slideElement, oldIndex, newIndex){
				$(".portfolioArea .count").find("i").text( newIndex + 1 );
			}
		});

		$(".optList > li").each(function(){ // 마이페이지-주문상세
			$(this).find(".hiddenArea").parent("li").next().css({
				border:0,
				paddingTop : 0
			})
		});

		$.fn.showArea = function(){ // 마이페이지-주문상세
			return this.each(function(){
				var tg = $(this);
				tg.on("click", function(e){
					e.preventDefault();
					if( !tg.hasClass("active") ){
						tg.addClass("active").text("접기");
						tg.next().stop().slideDown();
					}else{
						tg.removeClass("active").text("더보기")
						tg.next().stop().slideUp();
					}
				})
			})
		}
		$(".hiddenArea > a").showArea();

		$('.mSlide').bxSlider({ //magazine slide
			controls:false
		});

		$('.spSlide').bxSlider({ //magazine slide
			controls:true
		});
	}

	function initHorizontalScroll() {
		$('.scrollWrap').each(function() {//horizontal scroll wrap width
			var totalWidth = 0;
			var margin = 0;
			$(this).find('li').each(function(index) {
				totalWidth += parseInt($(this).width(), 10);
				margin += parseInt($(this).css('margin-right'), 10);
			});
			$(this).find('ul').css('width',totalWidth+margin);
		})
	}

	/**
	 * 휴대폰 수정(=실명인증) 진행
	 */
	function requestVerifyMember(e) {
		e.preventDefault();

		Super.htmlPopup('../_popup/popCheckId.html', '100%', 'popEdge', {
			onOpen:function() {
				$('#requestVerifyMemberForm').submit(function(e){
					e.preventDefault();
					var id = $('#verifyPhoneNumber').val();
					if (util.checkValidMobileNumber(id)) {
						memberInfoController.verifyMemberByPhone(id);
					} else {
						alert('휴대폰 번호를 정확하게 입력해주세요.');
					}
					e.stopPropagation();
				});
			}
		});
		
		e.stopPropagation();
	};

	/**
	 * 휴대폰 실명인증 결과 핸들링
	 */
	function verifyMemberResultHandler(e, status, authData) {
		switch(Number(status)) {
			case 200:
				Super.alertPopup('본인확인이 완료되었습니다.', authData.message, '확인');
				memberInfoController.getMyInfo();
				break;
			default:
				Super.alertPopup('본인확인에 실패하였습니다.', authData.message, '확인');
				break;
		}
	};
	

	/**
	 * 내 정보 갱신 반영
	 */
	function myInfoResultHandler(e) {
		var loginData = loginDataModel.loginData();

		if (loginData != null) {
			var email = loginData.email == null ? '' : loginData.email;

			// 로그인 상태일 때
			$('body').addClass('login');
			$('#buttonLogInTop').remove();
			// #topMemberInfoAlarm - ?
			$('#topMemberInfo').show();
			$('#settingButton').show();

			if (loginData.imageUrl != null) {
				$('#topMemberInfoPic').attr('src', loginData.imageUrl);
			} else {
				$('#topMemberInfoPic').attr('src', '/images/profile.png');
			}
			$('#topMemberInfoName').attr('href', '/myPage/').text(loginData.memberName+' 님');

			if (loginData.imageUrl != null) {
				$('#profileImage').attr('href', '/myPage/').attr('src', loginData.imageUrl);
			} else {
				$('#profileImage').attr('href', '/myPage/').attr('src', '/images/profile.png');
			}
			$('#profileName').html('<span>'+loginData.memberName+' 님</span><br>'+email);
			$('#myMenuButtonList').removeClass('log');
			$('#btnJoinMyPage').attr('href', '/myPage/').addClass('btnMypage').find('span').text('마이커먼');
			$('#menuToggle').show();
			$('#buttonLogInOut').attr('href', '/member/logout.html').text('로그아웃');

			$('#menuCountOrderGoods').text(loginData.myMenu.orderCount);
			$('#menuCountCancelGoods').text(loginData.myMenu.claimCount);
			$('#menuCountRecentViewItem').text(loginData.myMenu.recentCount);
			$('#menuCountOrderNewform').text(loginData.myMenu.contractorCount);
			if (loginData.myActivity.cartCount == 0) {
				$('#menuCountCart').hide();
			} else {
				$('#menuCountCart').text(loginData.myActivity.cartCount);
			}

			$('.profileEditButton').click(function(e){
				e.preventDefault();
				closeLnbHandler();
				if (loginData.joinSectionCode == "BM_JOIN_SECTION_02") {
					confirmPasswordResultHandler(null, 200);
				} else {
					Super.htmlPopup('../../_popup/popCheckPw.html', 590, 'popEdge', {
						onOpen: function() {
							$('#checkPwForm').submit(function(e){
								e.preventDefault();
								loginController.confirmPassword($('#checkPw').val());
							});
						},
						onSubmit: function() {
							loginController.confirmPassword($('#checkPw').val());
						}
					});
				}
			});
		} else {
			// 로그인 상태가 아닐 때
			$('#topMemberInfo').remove();
			$('#settingButton').remove();
			$('#myMenuButtonList li a').attr('href', '#').css('pointer-events', 'none');

			$('#menuCountCart').hide();
			
			// $('#profileImage').attr('src', '/images/profile.png');
			// $('#profileName').html('<span>로그인 해주세요</span>');
			$('#myMenuButtonList').addClass('log');
			//$('#btnJoinMyPage').attr('href', '/member/login.html').addClass('btnMypage').text('로그인 / 회원가입');
			$('#menuToggle').hide();
			//$('#buttonLogInOut').attr('href', '/member/login.html').text('로그인');
		}
	};

	/**
	 * GNB 초기화
	 */
	function initGnb() {
		$('#searchOpen').on('click', function(e) {
			e.preventDefault();
		});

		$("#gnbBtn").on("click", function(e) {
			e.preventDefault();
			openSideMenu();
		});

		$("#closeGnbBtn").on("click", function(e) {
			e.preventDefault();
			closeSideMenu();
		});

		$("body").on("click", ".dimBg", function() {
			closeSideMenu();
		});

		$("#menuToggle").on("click", function(e) {
			e.preventDefault();
			if( !$(".hiddenMenu").is( ":visible" ) ) {
				$(".hiddenMenu").addClass("active");
				$(".gnb").css({
					minHeight : $(window).height() + 480
				});
			} else {
				$(".hiddenMenu").removeClass("active");
				$(".gnb").css({
					minHeight : $(".gnb").height() - 330
				});
			}
		});
	};

	/**
	 * 주소록 시스템팝업 버튼 초기화
	 * 시스텝 팝업 설정
	 */
	function initAddressPopupButton() {
		$('.openAddressPopup, .openWindowPopup').on('click', onWindowPopupHandler);
		eventManager.on(WINDOWOPENER_EVENT.OPEN, onWindowPopupHandler);
	}

	/**
	 * onWindowPopupHandler
	 * @example
	 <a href="/popup/popMessage.html" class="btnSizeM btnColor03 openWindowPopup"
		data-winpop-opts='{
		"name" : "messagePopup",
		"height" : 900
		}'>1:1 메세지</a>
	 */
	function onWindowPopupHandler(e, href, opts) {
		e.preventDefault();

		var opts = {
			name : 'addressPopup',
			left : null,
			top : null,
			width : 770,
			height : 730,
			menubar : 'no',
			status : 'no',
			resizable : 'no',
			fullscreen : 'no'
		},
		target = $(e.currentTarget),
		href = href || target.attr('href'),
		optStr = '',
		winPopup;
		
		if (target.data('winpop-opts') != undefined) opts = $.extend({}, opts, target.data('winpop-opts'));

		opts.left 	= opts.left || (window.screen.width/2 - opts.width/2);
		opts.top 	= opts.top || (window.screen.height/2 - opts.height/2);

		$.map(opts, function(value, key) {
			optStr += key + '=' + value + ',';
		});

		winPopup = window.open(href, opts.name, optStr);
		// window.open($(this).attr('href'), 'addressPopup', 'width=770,height=730,menubar=no,status=no,toolbar=no,resizable=no,fullscreen=no');

		if (!winPopup) {
			window.alert('팝업 차단기능 혹은 팝업차단 프로그램이 동작중입니다.\n팝업 차단 기능을 해제한 후 다시 시도하세요.');
			return;
		}

		e.stopPropagation();
	}

	/**
	 * GNB open
	 */
	function openSideMenu() {
		$(".gnb").addClass("acitve").css({minHeight: $(window).height() + 150 }).stop().animate({left:0}, 400, function() {
			$(".container").addClass("fix");
			$(".header").addClass("fix");
		});
		if( $(".hiddenMenu").hasClass( "active" ) ){
			$(".gnb").css({
				minHeight : $(window).height() + 480
			});
		}
		$("body").append("<div class='dimBg'><div>");
	};

	/**
	 * GNB close
	 */
	function closeSideMenu() {
		$(".gnb").stop().animate({left:-300}, 400, function() {
			$(this).removeClass("acitve");
			$(".container").removeClass("fix");
			$(".header").removeClass("fix");
		});
		$(".dimBg").remove();
	};


	// Colorbox Complete 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxRefreshListener(e) {
		initHorizontalScroll();
	}

	// Colorbox Cleanup 시점
	// @see EventManager.js#onColorBoxListener
	// @see Events.js#Events.COLOR_BOX
	function onColorboxDestoryListener(e) {
	}
}