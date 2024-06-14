(function() {
  console.log("Recharge working");

  // Keep your scripts inside this IIFE function call to avoid leaking your
  // variables into the global scope.

  // Slider
  if (window.location.pathname == '/products/restore-m3') {
    window.location.href = 'https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2';
  }

  if (window.location.pathname == '/products/restore-m3-d2' && window.location.search.length > 5) {
    // window.location.href = 'https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2'
  }

  if (window.location.pathname == '/products/monthly-subscription') {
    var atc = document.querySelector(".product__submit__add");

    var goToCart = () => {
      setTimeout(() => {
        document.location.href = '/checkout';
      }, 1000);
    };

    atc.addEventListener("click", goToCart);

    $(document).ready(function() {
      var checkExist = setInterval(function() {
        if (document.querySelector('.rc-widget').classList.contains('v-b-active-important')) {
          clearInterval(checkExist);
        } else {
          document.querySelector('.rc-widget').classList.toggle('v-b-active-important');
          alert("Hi");
          document.querySelector('.onetime-radio').addEventListener('click', function() {
            window.location.pathname = '/products/restore-m3-d2';
          });
        }
      }, 100);
    });
  }
  console.log("Recharge Load")
  if (document.querySelector(".product__text.inline-richtext.custom-field-text") != null) {
    console.log("Recharge Start")
    var atc = document.querySelector(".product__submit__add");

    var goToCart = () => {
      setTimeout(() => {
        document.location.href = '/checkout';
      }, 1000);
    };

    atc.addEventListener("click", goToCart);
    document.querySelector(".product__form__wrapper").classList.add("v-newdlp-formwrapper");

    let priceEl = document.querySelector(".product__price__wrap");
    let priceElDuplicate = priceEl.cloneNode(true);
    document.querySelector(".product__headline").append(priceElDuplicate);
    document.getElementsByClassName("product__price")[0].classList.add("pr1");
    document.getElementsByClassName("product__price")[1].classList.add("pr2");

    var pElem = document.createElement('p');
    var divElem = document.createElement('div');
    divElem.appendChild(pElem);
    document.querySelector(".product__headline").insertBefore(divElem, document.getElementsByClassName("product__price__wrap")[0]);

    const eraserVal = () => {
      var sib = document.getElementsByClassName("v-monthly-text");
      sib[0].nextSibling.remove();
      const subSelector = document.querySelector(".sealsubs-target-element");
      var newDiv = document.createElement('div');
      subSelector.appendChild(newDiv);
      newDiv.classList.add("v-sub-undertext");
      newDiv.innerHTML = `<p><strong>Ready to enhance your pet's longevity?</strong> Join our no-questions-asked risk-free Membership Subscription service to receive 15% off Restore M3® and to benefit from free shipping each month. 
    <a href="https://ruffandpurrpets.com/pages/benefits-of-subscription-page" class="v-find-sub-page">Find Out More ►</a></p>`;
    };

    const time = () => setTimeout(eraserVal, 2500);
    $(document).ready(time);

    var selectMonthly = () => {
      console.log("Recharge Monthly Called")
      var dataBaseVal = [7215454748827, 5894425641115, 7268775788699, 7280703635611, 7282377031835, 41846483222683];
      var currProductID = ShopifyAnalytics.meta.product.id;
      console.log("currProductID", ShopifyAnalytics.meta);

      var weNeedCode = dataBaseVal.includes(currProductID);
      if (weNeedCode == true) {
        console.log("Code activated. Valentino Subscription Script is Running");
        var variantsV = document.getElementsByClassName("v-variant");
        if (ShopifyAnalytics.meta.product.id !== 7268775788699) {
          variantsV[0].innerHTML = "1 Bottle";
          variantsV[1].innerHTML = "2 Bottles";
          variantsV[2].innerHTML = "3 Bottles";
          variantsV[3].innerHTML = "4 Bottles";
          variantsV[4].innerHTML = "Pawed Pal Membership";
        } else {
          variantsV[0].innerHTML = "1 Bottle<br>Save 20%<br>$35.99";
          variantsV[1].innerHTML = "2 Bottles<br>Save 20%<br>$71.99";
          variantsV[2].innerHTML = "3 Bottles<br>Save 20%<br>$107.99";
          variantsV[3].innerHTML = "4 Bottles<br>Save 20%<br>$143.99";
          variantsV[4].innerHTML = "Pawed Pal Membership<br>Save 20%<br>$39.99";
        }

        var buttons = document.getElementsByClassName("radio__button");
        var subV = document.querySelector("#sub-val-n");
        var oneV = document.querySelector("#otp-val-n");
        var underSubText = document.querySelector(".v-sub-undertext");

        if (subV.checked == true) {
          console.log("Checked")
          buttons[4].lastElementChild.style.display = "block";
          buttons[4].lastElementChild.click();
          underSubText.style.display = "block";
          buttons[0].lastElementChild.style.display = "none";
          buttons[1].lastElementChild.style.display = "none";
          buttons[2].lastElementChild.style.display = "none";
          buttons[3].lastElementChild.style.display = "none";
          document.querySelector(".v-monthly-text").style.color = "#74ba46";
          document.querySelector(".v-otp-t").style.color = "black";

          if (document.querySelector('.subscription-radio')) {
            document.querySelector('.subscription-radio').click();
            document.querySelector('.v-frequency').style.display = "block";
            document.querySelector('.v-freq-1').click();
            document.querySelector('.v-frequency').style.display = "block";
          }
        } else {
          console.log("not Checked")
          buttons[4].lastElementChild.style.display = "none";
          underSubText.style.display = "none";
          buttons[0].lastElementChild.style.display = "block";
          buttons[1].lastElementChild.style.display = "block";
          buttons[2].lastElementChild.style.display = "block";
          buttons[3].lastElementChild.style.display = "block";
          document.querySelector(".v-monthly-text").style.color = "black";
          document.querySelector(".v-otp-t").style.color = "#74ba46";
          buttons[0].lastElementChild.click();

          if (document.querySelector('.onetime-radio')) {
            document.querySelector('.onetime-radio').click();
            document.querySelector('.v-frequency').style.display = "none";
          }
        }
      } else {
        console.log("Well...Else activated");
        if ("7220628947099".includes(currProductID)) {
          console.log("This is the SLP");
          var radioL = document.querySelector(".radio__legend__label");
          var subSel = document.querySelector(".v-sub-sel-appstle");
          var readyEText = document.getElementsByClassName("v-quan-text");
          var variantsV = document.getElementsByClassName("v-variant");
          var buttons = document.getElementsByClassName("radio__button");
          var fieldSetV = document.getElementsByClassName("radio__fieldset");
          radioL.style.display = "none";
          subSel.style.display = "none";
          readyEText[0].style.display = "none";
          readyEText[1].style.display = "none";
          variantsV[0].innerHTML = "Pawed Pal Member Price<br>Save 20%<br>$35.99 Monthly";
          buttons[0].style.marginTop = "10px";
        } else {
          console.log("Well...This is not SLP");
        }
      }
    };

    var dLp = () => {
      if (ShopifyAnalytics.meta.product.id == 7227771158683) {
        console.log("This is the DLP");
        var variantsV = document.getElementsByClassName("v-variant");
        var buttons = document.getElementsByClassName("radio__button");
        var fieldSetV = document.getElementsByClassName("radio__fieldset");
        var radioLeg = document.getElementsByClassName("radio__legend")[0];
        radioLeg.style.display = "none";
        variantsV[0].innerHTML = "$49.99";
        buttons[0].style.marginTop = "0px";
        fieldSetV[0].style.gridTemplateColumns = "1fr";
        document.getElementsByClassName("form__selectors")[0].style.display = "none";
        $('.v-prp-subl-h1').css('text-align', 'center');
        $('.v-prp-subl-h1').css('margin-bottom', '20px');
        $('.v-prp-subl-h1').css('font-size', '18px');
        $('.product__headline').css('justify-content', 'center');
        $('.header__desktop__lower').css('display', 'none');
        $('.header__mobile__hamburger').css('display', 'none');
        var atc = document.querySelector(".product__submit__add");
        var prodVariantButton = document.querySelector(".radio__button");
        var goToCart = () => {
          setTimeout(() => {
            document.location.href = '/checkout';
          }, 1000);
        };
        var productVariantClickedOnDLP = () => {
          atc.click();
        };
        atc.addEventListener("click", goToCart);
        prodVariantButton.addEventListener("click", productVariantClickedOnDLP);
      } else {
        console.log("this isn't dlp");
      }
    };

    var subV = document.querySelector("#sub-val-n");
    var oneV = document.querySelector("#otp-val-n");

    $(function() {
      if (ShopifyAnalytics.meta.page.pageType == "product") {
        var checkExist = setInterval(function() {
          if ($('#sub-val-n').length) {
            console.log("Exists!");
            console.log("upper")
            selectMonthly();
            console.log("lower")
            $(document).ready(function() {
              document.querySelector('.v-frequency').style.display = "block";

              function removeActiveFreqClass() {
                var currentFreqActive = document.getElementsByClassName('v-freq-active');
                console.log("Frev Active",currentFreqActive)
                for (let i = 0; i < currentFreqActive.length; i++) {
                  currentFreqActive[i].classList.remove('v-freq-active');
                }
              }

              function triggerRecChange() {
                document.querySelector(".rc-selling-plans-dropdown__select").dispatchEvent(new Event("change"));
              }
              document.querySelector('.v-freq-1').addEventListener('click', function() {
                removeActiveFreqClass();
                this.classList.toggle('v-freq-active');
                $(".rc-selling-plans-dropdown__select option:nth-child(1)").prop('selected', 'selected');
                triggerRecChange();
              });
              document.querySelector('.v-freq-2').addEventListener('click', function() {
                removeActiveFreqClass();
                this.classList.toggle('v-freq-active');
                $(".rc-selling-plans-dropdown__select option:nth-child(2)").prop('selected', 'selected');
                triggerRecChange();
              });
              document.querySelector('.v-freq-3').addEventListener('click', function() {
                removeActiveFreqClass();
                this.classList.toggle('v-freq-active');
                $(".rc-selling-plans-dropdown__select option:nth-child(3)").prop('selected', 'selected');
                triggerRecChange();
              });
              document.querySelector('.v-freq-4').addEventListener('click', function() {
                removeActiveFreqClass();
                this.classList.toggle('v-freq-active');
                $(".rc-selling-plans-dropdown__select option:nth-child(4)").prop('selected', 'selected');
                triggerRecChange();
              });
              document.querySelector('.v-freq-5').addEventListener('click', function() {
                removeActiveFreqClass();
                this.classList.toggle('v-freq-active');
                $(".rc-selling-plans-dropdown__select option:nth-child(5)").prop('selected', 'selected');
                triggerRecChange();
              });
              setTimeout(() => {
                document.querySelector('.v-freq-2').click()
                document.querySelector('.v-freq-1').click();
              }, 500)
            });
            clearInterval(checkExist);
          } else {
            console.log("I can't see it! Checking Dlp");
            dLp();
            clearInterval(checkExist);
          }
        }, 100); // check every 100ms
      }
    });

    var atc = document.querySelector(".product__submit__add");
    var atc2 = document.querySelector(".product__submit__buttons");
    var goToCart = () => {
      setTimeout(() => {
        document.location.href = '/cart';
      }, 1000);
    };

    subV.addEventListener("click", selectMonthly);
    oneV.addEventListener("click", selectMonthly);
    atc.addEventListener("click", goToCart);
    atc2.addEventListener("click", goToCart);

    if (ShopifyAnalytics.meta.product.id == 7268775788699 || ShopifyAnalytics.meta.product.id == 7280703635611 || ShopifyAnalytics.meta.product.id == 7282377031835) {
      goToCheckoutDLP2();

      $(document).ready(function() {
        setTimeout(function() {
          if (ShopifyAnalytics.meta.product.id == 7282377031835 || ShopifyAnalytics.meta.product.id == 7268775788699) {
            var dropdownsVe = document.getElementsByClassName("v-faq-accordion");
            for (let i = 0; i < dropdownsVe.length; i++) {
              dropdownsVe[i].click();
            }
            var atcButton = document.querySelector(".product__submit");
            var myNewDiv = document.createElement("div");
            myNewDiv.classList.add("v-linkers");
            var newPara = document.createElement("a");
            newPara.classList.add("v-quan-text");
            newPara.classList.add("v-sub-undertext");
            var prFactsId = "#" + document.querySelector('.v-ingredients-accordion').parentElement.parentElement.parentElement.parentElement.id;
            newPara.href = prFactsId;
            myNewDiv.appendChild(newPara);
            atcButton.appendChild(myNewDiv);
            newPara.innerHTML = "Supplement Facts";
          }
        }, 1000);
      });

      function myFunction(x) {
        if (x.matches) {
          document.querySelector(".v-sub-undertext").innerHTML = `\n <p><strong>Ready to enhance your pet's logevity?</strong></br> Join our no-questions-asked risk-free Membership Subscription service to receive 20% off Restore M3®. <a href="https://ruffandpurrpets.com/pages/benefits-of-subscription-page" class="v-find-sub-page">Find Out More&nbsp;►</a></p> \n  `;
        } else {
          console.log("xVno");
        }
      }
      var xV = window.matchMedia("(max-width: 500px)");
      myFunction(xV);
      xV.addListener(myFunction);
    } else {
      console.log("this is not DLP2");
    }

    if (window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?customer_posted=true#contact_form" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483255451" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483255451" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483124379" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483157147" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483189915" ||
      window.location.href == "https://hsw3qkrq342mdm7h-50526093467.shopifypreview.com/products/restore-m3-d2?contact%5Baccepts_marketing%5D=true&form_type=customer&variant=41846483222683"
    ) {
      // window.location.href = 'https://ruffandpurrpets.com/products/restore-m3-d2-n';
    }
  }
})();
