////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-02-17
// Menu for the page
/////////////////////////////////////////////////////////////
"use strict";

function selectMenu(item) {
    $('.menu_item').each( function() {
	$(this).removeClass('pure-menu-selected');
    });
    $('#'+item).addClass('pure-menu-selected');
}

function viewNews() {
   $('#main_window').html($('#news').html());
    selectMenu("m_news");
}

function viewLogin() {
   $('#main_window').html($('#login').html());
    selectMenu("m_login");
}

function viewCreate() {
   $('#main_window').html($('#create').html());
    selectMenu("m_create");
}

function viewRankings() {
   $('#main_window').html($('#rankings').html());
    selectMenu("m_rankings");
    net.send_GetGlobalRanking();
}

function viewAbout() {
   $('#main_window').html($('#about').html());
    selectMenu("m_about");
}

