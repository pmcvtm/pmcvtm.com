(function ($) {

    $(document).ready(function(){
    	initializeHoverBackgroundColorChange('.main-link', 'main', 'blog list and whatnot');
    	initializeHoverBackgroundColorChange('.projects-link', 'projects', 'code, games, ideas');
    	initializeHoverBackgroundColorChange('.arts-link', 'arts', 'pictures, words, sounds');
    	initializeHoverBackgroundColorChange('.nerds-link', 'nerds');
    	initializeHoverBackgroundColorChange('.business-link', 'business', 'about me, digital resume, market synergy');
      initializeHoverBackgroundColorChange('.subscribe-link', 'subscribe');
    });

    function initializeHoverBackgroundColorChange(selector, keyword, description) {
      var colorClass = keyword+'Color';
      var backgroundClass = keyword+'Background';
      var defaultDescription = 'the online blogfolio of Patrick McVeety-Mill';
      $(selector).hover(
        function(e){ $('.site-head').addClass(backgroundClass); },
        function(e){ $('.site-head').removeClass(backgroundClass); }
      );
    }
}(jQuery));
