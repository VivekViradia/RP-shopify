$("#monthly1").click(function() {
  $("#sub-val-n").trigger("click");
  $("#sub-val-n").prop('checked', false);
  $("#oneTime1").prop('checked', false);
  $(this).prop('checked', true);
  $(".oneTime").removeClass("selected1");
  $(this).parent().addClass("selected1");
  $(".form__selectors").hide();
  $(".product-form__input.selector-wrapper").hide();
});
$("#oneTime1").click(function() {
  $("#otp-val-n").trigger("click");
  $("#otp-val-n").prop('checked', false);
  $(this).prop('checked', true);
  $(".label-subval").removeClass("selected1");
  $(this).parent().addClass("selected1");
});
$("#sel1").change(function() {
  var st = $(this).val();
  $("." + st).trigger("click");
  if (st == "day1") {
    $(".day").text("1/2 Capsule daily");
    $(".delivery").text("1 bottle every 3 month");    
  } else if (st == "day2") {
    $(".day").text("1 Capsule daily");
    $(".delivery").text("1 bottle every 2 months");
  } else if (st == "day3") {
    $(".day").text("1 Capsule daily");
    $(".delivery").text("1 bottle every 1 month");
  } else if (st == "day4") {
    $(".day").text("3 Capsules daily");
    $(".delivery").text("1 bottle every 20 days");
  } else if (st == "day5") {
    $(".day").text("1/2 Capsule daily");
    $(".delivery").text("1 bottle every 3 months");
  }
});
$("#otp-val-n").click(function() {
  $(".dot").removeClass("check1");
  $(this).next().addClass("check1");
  $(".pre_price").text("");
  $(".curr_price").text("$49.99");
  $(".final_otpval_price").show();
  $(".final_subval_price").hide();
  $(".save").hide();
  $(".max_save").hide();
  $(".discount_product p span").css("top", "0px");
  $("#sub-val-n").parent().removeClass("selected1");
  $(".onetime-purchase").addClass("active-opt");
  $(".subscription-purchase").removeClass("active-opt");
  $(this).parent().addClass("selected1");
  $(".v-frequency").hide();
  $(".form__selectors").show();
  $(".product-form__input.selector-wrapper").show();
  $(".sub_discount_product").hide();
  $("#sub-val-btn").hide();
  $("#otp-val-btn").show();
});
$("#sub-val-n").click(function() {
  $(".dot").removeClass("check1");
  $(this).next().addClass("check1");
  $(".pre_price").text("$49.99");
  $(".curr_price").text("$39.99");
  $(".final_otpval_price").hide();
  $(".final_subval_price").show();
  $(".save").show();
  $(".max_save").show();
  $(".discount_product p span").css("top", "63px");
  $(".savePercent").text("20%");
  $(".saveValue").text("$10");
  $("#otp-val-n").parent().removeClass("selected1");
  $(this).parent().addClass("selected1");
  $(".onetime-purchase").removeClass("active-opt");
  $(".subscription-purchase").addClass("active-opt");
  $(".v-frequency").show();
  $(".form__selectors").hide();
  $(".product-form__input.selector-wrapper").hide();
  $(".sub_discount_product").show();
  $("#sub-val-btn").show();
  $("#otp-val-btn").hide();
});
$(".mth").click(function() {
  $(".dot").removeClass("active1");
  $(this).addClass("active1");
  $("#sub-val-n").trigger("click");
});
$(".onet").click(function() {
  $(".dot").removeClass("active1");
  $(this).addClass("active1");
  $("#otp-val-n").trigger("click");
});
$(".variant1").click(function() {
  var val1 = $(this).children("input").val();
  if (val1.includes("1 Bottle")) {
    $(".pre_price").text("");
    $(".curr_price").text("$49.99");
    $(".discount_product p span").css("top", "0px");
  } else if (val1.includes("2 Bottles")) {
    $(".pre_price").text("$49.99");
    $(".curr_price").text("$94.98");
    $(".discount_product p span").css("top", "63px");
    $(".savePercent").text("5%");
    $(".saveValue").text("$4.99");
    $(".pre_price").text("$99.98");
  } else if (val1.includes("3 Bottles")) {
    $(".pre_price").text("$49.99");
    $(".curr_price").text("$134.97");
    $(".discount_product p span").css("top", "63px");
    $(".savePercent").text("10%");
    $(".saveValue").text("$15");
    $(".pre_price").text("$149.97");
  } else if (val1.includes("4 Bottles")) {
    $(".pre_price").text("$49.99");
    $(".curr_price").text("$169.97");
    $(".discount_product p span").css("top", "63px");
    $(".savePercent").text("15%");
    $(".saveValue").text("$30");
    $(".pre_price").text("$199.96");
  } else if (val1.includes("Pawed Pal Member")) {
    $(this).parent().hide();
    $(".pre_price").text("$49.99");
    $(".curr_price").text("$39.99");
    $(".discount_product p span").css("top", "63px");
    $(".savePercent").text("20%");
    $(".pre_price").text("$49.99");
    $(".saveValue").text("$10");
  }
});

$(".variant1 label").click(function() {
  $(".variant1 label").parent().removeClass("active");
  $(this).parent().addClass("active");
});
