$(document).ready(function() {
  $('.rd-slickslider-1').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: 300,
    prevArrow: '<div class="slick-prev"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 12.158 11.85"><path d="M6.985,13.7l-.6.6a.649.649,0,0,1-.92,0L.188,9.034a.649.649,0,0,1,0-.92L5.463,2.839a.649.649,0,0,1,.92,0l.6.6a.652.652,0,0,1-.011.931L3.7,7.487h7.8a.65.65,0,0,1,.651.651v.868a.65.65,0,0,1-.651.651H3.7l3.27,3.115A.647.647,0,0,1,6.985,13.7Z" transform="translate(0.004 -2.647)" fill="#212121"/></svg></div>',
    nextArrow: '<div class="slick-next"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 4.443 4.257"><path id="Next-icon-lkjn7" d="M6.052,3.941a.244.244,0,0,1,.34.35L4.9,5.743H8.147a.244.244,0,0,1,0,.488H4.892l1.5,1.48a.244.244,0,0,1-.171.418.241.241,0,0,1-.171-.07l-2.1-2.073Z" transform="translate(8.391 8.129) rotate(180)"/></svg></div>',
    dots: false,
    responsive: [{
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }]
  });
  $('.rd-slickslider-2').slick({
    infinite: true,
    slidesToShow: 2,
    slidesToScroll: 1,
    speed: 300,
    prevArrow: '<div class="slick-prev"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 12.158 11.85"><path d="M6.985,13.7l-.6.6a.649.649,0,0,1-.92,0L.188,9.034a.649.649,0,0,1,0-.92L5.463,2.839a.649.649,0,0,1,.92,0l.6.6a.652.652,0,0,1-.011.931L3.7,7.487h7.8a.65.65,0,0,1,.651.651v.868a.65.65,0,0,1-.651.651H3.7l3.27,3.115A.647.647,0,0,1,6.985,13.7Z" transform="translate(0.004 -2.647)" fill="#212121"/></svg></div>',
    nextArrow: '<div class="slick-next"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 4.443 4.257"><path id="Next-icon-lkjn7" d="M6.052,3.941a.244.244,0,0,1,.34.35L4.9,5.743H8.147a.244.244,0,0,1,0,.488H4.892l1.5,1.48a.244.244,0,0,1-.171.418.241.241,0,0,1-.171-.07l-2.1-2.073Z" transform="translate(8.391 8.129) rotate(180)"/></svg></div>',
    dots: false,
    responsive: [{
      breakpoint: 767,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }]
  });
  $('.rd-slickslider-3').slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 300,
    dots: false,
    prevArrow: '<div class="slick-prev"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 12.158 11.85"><path d="M6.985,13.7l-.6.6a.649.649,0,0,1-.92,0L.188,9.034a.649.649,0,0,1,0-.92L5.463,2.839a.649.649,0,0,1,.92,0l.6.6a.652.652,0,0,1-.011.931L3.7,7.487h7.8a.65.65,0,0,1,.651.651v.868a.65.65,0,0,1-.651.651H3.7l3.27,3.115A.647.647,0,0,1,6.985,13.7Z" transform="translate(0.004 -2.647)" fill="#212121"/></svg></div>',
    nextArrow: '<div class="slick-next"><svg xmlns="http://www.w3.org/2000/svg" width="12.158" height="11.85" viewBox="0 0 4.443 4.257"><path id="Next-icon-lkjn7" d="M6.052,3.941a.244.244,0,0,1,.34.35L4.9,5.743H8.147a.244.244,0,0,1,0,.488H4.892l1.5,1.48a.244.244,0,0,1-.171.418.241.241,0,0,1-.171-.07l-2.1-2.073Z" transform="translate(8.391 8.129) rotate(180)"/></svg></div>',
    responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
  $('.rd-slickslider-4').slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    speed: 300,
    dots: false,
    responsive: [{
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
});
$(window).on("load resize", function() {
  if ($(window).width() > 1199) {
    $('.rd-fixslickslider-main').slick('unslick');
  } else {
    $('.rd-fixslickslider-main').slick({
      arrows: false,
      dots: false,
      infinite: true,
      speed: 300,
      slidesToShow: 4,
      slidesToScroll: 1,
      prevArrow: "<button type='button' class='slick-prev slick-arrow absolute right-[40px] top-[-49px] md:top-[-53px] w-[45px] h-[25px] flex justify-center items-center'><svg width='20.757' height='12.304' viewBox='0 0 20.757 12.304'><path id='Path_363' data-name='Path 363' d='M.242,5.677,6.617.169a.7.7,0,0,1,.914,1.059L2.644,5.45H20.058a.7.7,0,0,1,0,1.4H2.469L5.254,9.334l2.176,1.721A.7.7,0,0,1,7,12.3H7a.7.7,0,0,1-.434-.151L4.355,10.4.234,6.728A.7.7,0,0,1,.242,5.677' transform='translate(0 0)'/></svg></button>",
      nextArrow: "<button type='button' class='slick-next slick-arrow absolute right-[0px]  top-[-49px] md:top-[-53px] w-[45px] h-[25px] flex justify-center items-center'><svg width='20.757' height='12.304' viewBox='0 0 20.757 12.304' class='rotate-180'><path id='Path_363' data-name='Path 363' d='M.242,5.677,6.617.169a.7.7,0,0,1,.914,1.059L2.644,5.45H20.058a.7.7,0,0,1,0,1.4H2.469L5.254,9.334l2.176,1.721A.7.7,0,0,1,7,12.3H7a.7.7,0,0,1-.434-.151L4.355,10.4.234,6.728A.7.7,0,0,1,.242,5.677' transform='translate(0 0)'/></svg></button>",
      variableWidth: true,
      centerMode: false,
      centerPadding: '140px',
      responsive: [{
        breakpoint: 991,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 767,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      }, {
        breakpoint: 560,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
    });
  }
});

// Get the button:
let mybutton = document.getElementById("my_TopBtn");
// When the user scrolls down 50px from the top of the document, show the button
window.onscroll = function() {
  scrollFunction()
};

function scrollFunction() {
  if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
    mybutton.style.display = "flex";
  } else {
    mybutton.style.display = "none";
  }
}
// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}