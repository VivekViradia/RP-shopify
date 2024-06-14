
/*
* @license
* Story Theme (c) Groupthought Themes
*
* Modified versions of the theme code
* are not supported by Groupthought.
*
*/

(function (bodyScrollLock, themeCurrency, themeAddresses, Sqrl, axios, Flickity, Rellax, ellipsed, MicroModal, FlickityFade, FlickitySync, AOS) {
  'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () {
              return e[k];
            }
          });
        }
      });
    }
    n['default'] = e;
    return Object.freeze(n);
  }

  var Sqrl__namespace = /*#__PURE__*/_interopNamespaceDefault(Sqrl);

  window.theme = window.theme || {};

  window.theme.sizes = {
    small: 480,
    medium: 768,
    large: 990,
    widescreen: 1400,
  };

  window.theme.keyboardKeys = {
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    LEFTARROW: 37,
    RIGHTARROW: 39,
  };

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  let lastWidth = window.innerWidth;

  function dispatch$1() {
    document.dispatchEvent(
      new CustomEvent('theme:resize', {
        bubbles: true,
      })
    );

    if (window.innerWidth != lastWidth) {
      document.dispatchEvent(
        new CustomEvent('theme:resize:width', {
          bubbles: true,
        })
      );
      lastWidth = window.innerWidth;
    }
  }

  function resizeListener() {
    window.addEventListener(
      'resize',
      debounce(function () {
        dispatch$1();
      }, 50)
    );
  }

  let prev = window.pageYOffset;
  let up = null;
  let down = null;
  let wasUp = null;
  let wasDown = null;
  let scrollLockTimeout = 0;

  function dispatch() {
    const position = window.pageYOffset;
    if (position > prev) {
      down = true;
      up = false;
    } else if (position < prev) {
      down = false;
      up = true;
    } else {
      up = null;
      down = null;
    }
    prev = position;
    document.dispatchEvent(
      new CustomEvent('theme:scroll', {
        detail: {
          up,
          down,
          position,
        },
        bubbles: false,
      })
    );
    if (up && !wasUp) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:up', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    if (down && !wasDown) {
      document.dispatchEvent(
        new CustomEvent('theme:scroll:down', {
          detail: {position},
          bubbles: false,
        })
      );
    }
    wasDown = down;
    wasUp = up;
  }

  function lock(e) {
    let element = e.target;
    if (e.detail && e.detail instanceof Element) {
      element = e.detail;
    }
    bodyScrollLock.disableBodyScroll(element);
    document.documentElement.setAttribute('data-scroll-locked', '');
  }

  function unlock() {
    // Prevent body scroll lock race conditions
    scrollLockTimeout = setTimeout(() => {
      document.body.removeAttribute('data-drawer-closing');
    }, 20);

    if (document.body.hasAttribute('data-drawer-closing')) {
      document.body.removeAttribute('data-drawer-closing');

      if (scrollLockTimeout) {
        clearTimeout(scrollLockTimeout);
      }

      return;
    } else {
      document.body.setAttribute('data-drawer-closing', '');
    }

    document.documentElement.removeAttribute('data-scroll-locked');
    bodyScrollLock.clearAllBodyScrollLocks();
  }

  function scrollListener() {
    let timeout;
    window.addEventListener(
      'scroll',
      function () {
        if (timeout) {
          window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(function () {
          dispatch();
        });
      },
      {passive: true}
    );

    window.addEventListener('theme:scroll:lock', lock);
    window.addEventListener('theme:scroll:unlock', unlock);
  }

  function moveModals(container) {
    const modals = container.querySelectorAll('[data-modal]');
    const modalBin = document.querySelector('[data-modal-container]');
    modals.forEach((element) => {
      const alreadyAdded = modalBin.querySelector(`[id="${element.id}"]`);
      if (!alreadyAdded) {
        modalBin.appendChild(element);
      }
    });
  }

  const classes$j = ['neighbor--white', 'neighbor--light', 'neighbor--dark', 'neighbor--black'];

  function moveTags(container) {
    container.querySelectorAll('shopify-section').forEach((element) => {
      element.classList.remove(classes$j);
    });
    container.querySelectorAll('.bg--neutral').forEach((element) => {
      element.parentElement.classList.add('neighbor--white');
    });
    container.querySelectorAll('.bg--accent').forEach((element) => {
      element.parentElement.classList.add('neighbor--light');
    });
    container.querySelectorAll('.bg--invert').forEach((element) => {
      element.parentElement.classList.add('neighbor--dark');
    });
    container.querySelectorAll('.bg--invert--accent').forEach((element) => {
      element.parentElement.classList.add('neighbor--black');
    });
  }

  function floatLabels(container) {
    const floats = container.querySelectorAll('.form__field');
    floats.forEach((element) => {
      const label = element.querySelector('label');
      const input = element.querySelector('input, textarea');
      if (label && input) {
        input.addEventListener('keyup', (event) => {
          if (event.target.value !== '') {
            label.classList.add('label--float');
          } else {
            label.classList.remove('label--float');
          }
        });
      }
      if (input && input.value && input.value.length) {
        label.classList.add('label--float');
      }
    });
  }

  function errorTabIndex(container) {
    const errata = container.querySelectorAll('.errors');
    errata.forEach((element) => {
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-live', 'assertive');
      element.setAttribute('role', 'alert');
    });
  }

  function readHeights() {
    const h = {};
    h.windowHeight = window.innerHeight;
    h.announcementHeight = getHeight('#shopify-section-announcement');
    h.footerHeight = getHeight('[data-section-type*="footer"]');
    h.menuHeight = getHeight('[data-header-height]');
    h.headerHeight = h.menuHeight + h.announcementHeight;
    h.logoHeight = getFooterLogoWithPadding();
    return h;
  }

  function setVarsOnResize() {
    document.addEventListener('theme:resize', resizeVars);
    setVars();
  }

  function setVars() {
    const {windowHeight, announcementHeight, headerHeight, logoHeight, menuHeight, footerHeight} = readHeights();
    document.documentElement.style.setProperty('--full-screen', `${windowHeight}px`);
    document.documentElement.style.setProperty('--three-quarters', `${windowHeight * 0.75}px`);
    document.documentElement.style.setProperty('--two-thirds', `${windowHeight * 0.66}px`);
    document.documentElement.style.setProperty('--one-half', `${windowHeight * 0.5}px`);
    document.documentElement.style.setProperty('--one-third', `${windowHeight * 0.33}px`);
    document.documentElement.style.setProperty('--one-fifth', `${windowHeight * 0.2}px`);
    document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
    document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
    document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);

    document.documentElement.style.setProperty('--scrollbar-width', `${window.innerWidth - document.documentElement.clientWidth}px`);
  }

  function resizeVars() {
    // restrict the heights that are changed on resize to avoid iOS jump when URL bar is shown and hidden
    const {windowHeight, announcementHeight, headerHeight, logoHeight, menuHeight, footerHeight} = readHeights();
    document.documentElement.style.setProperty('--menu-height', `${menuHeight}px`);
    document.documentElement.style.setProperty('--announcement-height', `${announcementHeight}px`);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

    document.documentElement.style.setProperty('--footer-height', `${footerHeight}px`);
    document.documentElement.style.setProperty('--content-full', `${windowHeight - headerHeight - logoHeight / 2}px`);
    document.documentElement.style.setProperty('--content-min', `${windowHeight - headerHeight - footerHeight}px`);
  }

  function getHeight(selector) {
    const el = document.querySelector(selector);
    if (el) {
      return el.clientHeight;
    } else {
      return 0;
    }
  }

  function getFooterLogoWithPadding() {
    const height = getHeight('[data-footer-logo]');
    if (height > 0) {
      return height + 20;
    } else {
      return 0;
    }
  }

  function singles(frame, wrappers) {
    // sets the height of any frame passed in with the
    // tallest js-overflow-content as well as any image in that frame
    let padding = 64;
    let tallest = 0;

    wrappers.forEach((wrap) => {
      if (wrap.offsetHeight > tallest) {
        const getMarginTop = parseInt(window.getComputedStyle(wrap).marginTop);
        const getMarginBottom = parseInt(window.getComputedStyle(wrap).marginBottom);
        const getMargin = getMarginTop + getMarginBottom;
        if (getMargin > padding) {
          padding = getMargin;
        }

        tallest = wrap.offsetHeight;
      }
    });
    const images = frame.querySelectorAll('[data-overflow-background]');
    const frames = [frame, ...images];
    frames.forEach((el) => {
      el.style.setProperty('min-height', `calc(${tallest + padding}px + var(--menu-height)`);
    });
  }

  function doubles(section) {
    if (window.innerWidth < window.theme.sizes.medium) {
      // if we are below the small breakpoint, the double section acts like two independent
      // single frames
      let singleFrames = section.querySelectorAll('[data-overflow-frame]');
      singleFrames.forEach((singleframe) => {
        const wrappers = singleframe.querySelectorAll('[data-overflow-content]');
        singles(singleframe, wrappers);
      });
      return;
    }

    const padding = parseInt(getComputedStyle(section).getPropertyValue('--outer')) * 2;
    let tallest = 0;

    const frames = section.querySelectorAll('[data-overflow-frame]');
    const contentWrappers = section.querySelectorAll('[data-overflow-content]');
    contentWrappers.forEach((content) => {
      if (content.offsetHeight > tallest) {
        tallest = content.offsetHeight;
      }
    });
    const images = section.querySelectorAll('[data-overflow-background]');
    let applySizes = [...frames, ...images];
    applySizes.forEach((el) => {
      el.style.setProperty('min-height', `${tallest + padding}px`);
    });
    section.style.setProperty('min-height', `${tallest + padding + 2}px`);
  }

  function preventOverflow(container) {
    const singleFrames = container.querySelectorAll('.js-overflow-container');
    if (singleFrames) {
      singleFrames.forEach((frame) => {
        const wrappers = frame.querySelectorAll('.js-overflow-content');
        singles(frame, wrappers);
        document.addEventListener('theme:resize', () => {
          singles(frame, wrappers);
        });
      });
    }

    const doubleSections = container.querySelectorAll('[data-overflow-wrapper]');
    if (doubleSections) {
      doubleSections.forEach((section) => {
        doubles(section);
        document.addEventListener('theme:resize', () => {
          doubles(section);
        });
      });
    }
  }

  resizeListener();
  scrollListener();

  window.addEventListener('load', () => {
    setVarsOnResize();
    floatLabels(document);
    errorTabIndex(document);
    moveModals(document);
    moveTags(document);
    preventOverflow(document);
  });

  document.addEventListener('shopify:section:load', (e) => {
    const container = e.target;
    floatLabels(container);
    errorTabIndex(container);
    moveModals(container);
    moveTags(container);
    preventOverflow(container);
  });

  document.addEventListener('shopify:section:reorder', () => {
    document.dispatchEvent(new CustomEvent('header:check', {bubbles: false}));
  });

  const selectors$I = {
    templateAddresses: '.template-addresses',
    addressNewForm: '#AddressNewForm',
    btnNew: '[data-btn-address-toggle]',
    btnEdit: '[data-btn-address-edit-toggle]',
    btnDelete: '[data-btn-address-delete]',
    addressCountrySelect: '[data-country-select]',
    defaultConfirmMessage: 'Are you sure you wish to delete this address?',
    editAddress: '#EditAddress',
    dataFormId: 'data-form-id',
    addressCountryNew: 'AddressCountryNew',
    addressProvinceNew: 'AddressProvinceNew',
    addressProvinceContainerNew: 'AddressProvinceContainerNew',
    addressCountry: 'AddressCountry',
    addressProvince: 'AddressProvince',
    addressProvinceContainer: 'AddressProvinceContainer',
  };

  const classes$i = {
    hide: 'hide',
  };

  class Addresses {
    constructor(section) {
      this.section = section;
      this.addressNewForm = this.section.querySelector(selectors$I.addressNewForm);
      this.newButtons = this.section.querySelectorAll(selectors$I.btnNew);
      this.editButtons = this.section.querySelectorAll(selectors$I.btnEdit);
      this.deleteButtons = this.section.querySelectorAll(selectors$I.btnDelete);
      this.countrySelects = this.section.querySelectorAll(selectors$I.addressCountrySelect);

      if (this.addressNewForm) {
        this.customerAddresses();
        this.events();
      }
    }

    events() {
      if (this.newButtons.length) {
        this.newButtons.forEach((element) => {
          element.addEventListener('click', () => {
            this.addressNewForm.classList.toggle(classes$i.hide);
          });
        });
      }

      if (this.editButtons.length) {
        this.editButtons.forEach((element) => {
          element.addEventListener('click', () => {
            const formId = element.getAttribute(selectors$I.dataFormId);
            this.section.querySelector(`${selectors$I.editAddress}_${formId}`).classList.toggle(classes$i.hide);
          });
        });
      }

      if (this.deleteButtons.length) {
        this.deleteButtons.forEach((element) => {
          element.addEventListener('click', () => {
            const formId = element.getAttribute(selectors$I.dataFormId);
            const confirmMessage = element.getAttribute(selectors$I.dataConfirmMessage);
            if (confirm(confirmMessage || selectors$I.defaultConfirmMessage)) {
              Shopify.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
          });
        });
      }
    }

    customerAddresses() {
      // Initialize observers on address selectors, defined in shopify_common.js
      if (Shopify.CountryProvinceSelector) {
        new Shopify.CountryProvinceSelector(selectors$I.addressCountryNew, selectors$I.addressProvinceNew, {
          hideElement: selectors$I.addressProvinceContainerNew,
        });
      }

      this.countrySelects.forEach((element) => {
        const formId = element.getAttribute(selectors$I.dataFormId);
        const countrySelector = `${selectors$I.addressCountry}_${formId}`;
        const provinceSelector = `${selectors$I.addressProvince}_${formId}`;
        const containerSelector = `${selectors$I.addressProvinceContainer}_${formId}`;

        new Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
          hideElement: containerSelector,
        });
      });
    }
  }

  const accountAddressTemplate = document.querySelector(selectors$I.templateAddresses);

  if (accountAddressTemplate) {
    new Addresses(accountAddressTemplate);
  }

  const selectors$H = {
    form: '[data-account-form]',
    showReset: '[data-show-reset]',
    hideReset: '[data-hide-reset]',
    recover: '[data-recover-password]',
    login: '[data-login-form]',
    recoverHash: '#recover',
    hideClass: 'hide',
  };

  class Login {
    constructor(form) {
      this.showButton = form.querySelector(selectors$H.showReset);
      this.hideButton = form.querySelector(selectors$H.hideReset);
      this.recover = form.querySelector(selectors$H.recover);
      this.login = form.querySelector(selectors$H.login);

      this.init();
    }

    init() {
      if (window.location.hash == selectors$H.recoverHash) {
        this.showRecoverPasswordForm();
      } else {
        this.hideRecoverPasswordForm();
      }

      this.showButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRecoverPasswordForm();
      });

      this.hideButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.hideRecoverPasswordForm();
      });
    }

    showRecoverPasswordForm() {
      this.login.classList.add(selectors$H.hideClass);
      this.recover.classList.remove(selectors$H.hideClass);
      window.location.hash = selectors$H.recoverHash;
      return false;
    }

    hideRecoverPasswordForm() {
      this.recover.classList.add(selectors$H.hideClass);
      this.login.classList.remove(selectors$H.hideClass);
      window.location.hash = '';
      return false;
    }
  }

  const loginForm = document.querySelector(selectors$H.form);

  if (loginForm) {
    new Login(loginForm);
  }

  window.Shopify = window.Shopify || {};
  window.Shopify.theme = window.Shopify.theme || {};
  window.Shopify.theme.sections = window.Shopify.theme.sections || {};

  window.Shopify.theme.sections.registered = window.Shopify.theme.sections.registered || {};
  window.Shopify.theme.sections.instances = window.Shopify.theme.sections.instances || [];
  const registered = window.Shopify.theme.sections.registered;
  const instances = window.Shopify.theme.sections.instances;

  const selectors$G = {
    id: 'data-section-id',
    type: 'data-section-type',
  };

  class Registration {
    constructor(type = null, components = []) {
      this.type = type;
      this.components = validateComponentsArray(components);
      this.callStack = {
        onLoad: [],
        onUnload: [],
        onSelect: [],
        onDeselect: [],
        onBlockSelect: [],
        onBlockDeselect: [],
        onReorder: [],
      };
      components.forEach((comp) => {
        for (const [key, value] of Object.entries(comp)) {
          const arr = this.callStack[key];
          if (Array.isArray(arr) && typeof value === 'function') {
            arr.push(value);
          } else {
            console.warn(`Unregisted function: '${key}' in component: '${this.type}'`);
            console.warn(value);
          }
        }
      });
    }

    getStack() {
      return this.callStack;
    }
  }

  class Section {
    constructor(container, registration) {
      this.container = validateContainerElement(container);
      this.id = container.getAttribute(selectors$G.id);
      this.type = registration.type;
      this.callStack = registration.getStack();

      try {
        this.onLoad();
      } catch (e) {
        console.warn(`Error in section: ${this.id}`);
        console.warn(this);
        console.warn(e);
      }
    }

    callFunctions(key, e = null) {
      this.callStack[key].forEach((func) => {
        const props = {
          id: this.id,
          type: this.type,
          container: this.container,
        };
        if (e) {
          func.call(props, e);
        } else {
          func.call(props);
        }
      });
    }

    onLoad() {
      this.callFunctions('onLoad');
    }

    onUnload() {
      this.callFunctions('onUnload');
    }

    onSelect(e) {
      this.callFunctions('onSelect', e);
    }

    onDeselect(e) {
      this.callFunctions('onDeselect', e);
    }

    onBlockSelect(e) {
      this.callFunctions('onBlockSelect', e);
    }

    onBlockDeselect(e) {
      this.callFunctions('onBlockDeselect', e);
    }

    onReorder(e) {
      this.callFunctions('onReorder', e);
    }
  }

  function validateContainerElement(container) {
    if (!(container instanceof Element)) {
      throw new TypeError('Theme Sections: Attempted to load section. The section container provided is not a DOM element.');
    }
    if (container.getAttribute(selectors$G.id) === null) {
      throw new Error('Theme Sections: The section container provided does not have an id assigned to the ' + selectors$G.id + ' attribute.');
    }

    return container;
  }

  function validateComponentsArray(value) {
    if ((typeof value !== 'undefined' && typeof value !== 'object') || value === null) {
      throw new TypeError('Theme Sections: The components object provided is not a valid');
    }

    return value;
  }

  /*
   * @shopify/theme-sections
   * -----------------------------------------------------------------------------
   *
   * A framework to provide structure to your Shopify sections and a load and unload
   * lifecycle. The lifecycle is automatically connected to theme editor events so
   * that your sections load and unload as the editor changes the content and
   * settings of your sections.
   */

  function register(type, components) {
    if (typeof type !== 'string') {
      throw new TypeError('Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered');
    }

    if (typeof registered[type] !== 'undefined') {
      throw new Error('Theme Sections: A section of type "' + type + '" has already been registered. You cannot register the same section type twice');
    }

    if (!Array.isArray(components)) {
      components = [components];
    }

    const section = new Registration(type, components);
    registered[type] = section;

    return registered;
  }

  function load(types, containers) {
    types = normalizeType(types);

    if (typeof containers === 'undefined') {
      containers = document.querySelectorAll('[' + selectors$G.type + ']');
    }

    containers = normalizeContainers(containers);

    types.forEach(function (type) {
      const registration = registered[type];

      if (typeof registration === 'undefined') {
        return;
      }

      containers = containers.filter(function (container) {
        // Filter from list of containers because container already has an instance loaded
        if (isInstance(container)) {
          return false;
        }

        // Filter from list of containers because container doesn't have data-section-type attribute
        if (container.getAttribute(selectors$G.type) === null) {
          return false;
        }

        // Keep in list of containers because current type doesn't match
        if (container.getAttribute(selectors$G.type) !== type) {
          return true;
        }

        instances.push(new Section(container, registration));

        // Filter from list of containers because container now has an instance loaded
        return false;
      });
    });
  }

  function unload(selector) {
    var instancesToUnload = getInstances(selector);

    instancesToUnload.forEach(function (instance) {
      var index = instances
        .map(function (e) {
          return e.id;
        })
        .indexOf(instance.id);
      instances.splice(index, 1);
      instance.onUnload();
    });
  }

  function getInstances(selector) {
    var filteredInstances = [];

    // Fetch first element if its an array
    if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
      var firstElement = selector[0];
    }

    // If selector element is DOM element
    if (selector instanceof Element || firstElement instanceof Element) {
      var containers = normalizeContainers(selector);

      containers.forEach(function (container) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.container === container;
          })
        );
      });

      // If select is type string
    } else if (typeof selector === 'string' || typeof firstElement === 'string') {
      var types = normalizeType(selector);

      types.forEach(function (type) {
        filteredInstances = filteredInstances.concat(
          instances.filter(function (instance) {
            return instance.type === type;
          })
        );
      });
    }

    return filteredInstances;
  }

  function getInstanceById(id) {
    var instance;

    for (var i = 0; i < instances.length; i++) {
      if (instances[i].id === id) {
        instance = instances[i];
        break;
      }
    }
    return instance;
  }

  function isInstance(selector) {
    return getInstances(selector).length > 0;
  }

  function normalizeType(types) {
    // If '*' then fetch all registered section types
    if (types === '*') {
      types = Object.keys(registered);

      // If a single section type string is passed, put it in an array
    } else if (typeof types === 'string') {
      types = [types];

      // If single section constructor is passed, transform to array with section
      // type string
    } else if (types.constructor === Section) {
      types = [types.prototype.type];

      // If array of typed section constructors is passed, transform the array to
      // type strings
    } else if (Array.isArray(types) && types[0].constructor === Section) {
      types = types.map(function (Section) {
        return Section.type;
      });
    }

    types = types.map(function (type) {
      return type.toLowerCase();
    });

    return types;
  }

  function normalizeContainers(containers) {
    // Nodelist with entries
    if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
      containers = Array.prototype.slice.call(containers);

      // Empty Nodelist
    } else if (NodeList.prototype.isPrototypeOf(containers) && containers.length === 0) {
      containers = [];

      // Handle null (document.querySelector() returns null with no match)
    } else if (containers === null) {
      containers = [];

      // Single DOM element
    } else if (!Array.isArray(containers) && containers instanceof Element) {
      containers = [containers];
    }

    return containers;
  }

  if (window.Shopify.designMode) {
    document.addEventListener('shopify:section:load', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$G.id + '="' + id + '"]');

      if (container !== null) {
        load(container.getAttribute(selectors$G.type), container);
      }
    });

    document.addEventListener('shopify:section:reorder', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$G.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        unload(container);
      }

      if (container !== null) {
        load(container.getAttribute(selectors$G.type), container);
      }
    });

    document.addEventListener('shopify:section:unload', function (event) {
      var id = event.detail.sectionId;
      var container = event.target.querySelector('[' + selectors$G.id + '="' + id + '"]');
      var instance = getInstances(container)[0];

      if (typeof instance === 'object') {
        unload(container);
      }
    });

    document.addEventListener('shopify:section:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onSelect(event);
      }
    });

    document.addEventListener('shopify:section:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onDeselect(event);
      }
    });

    document.addEventListener('shopify:block:select', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockSelect(event);
      }
    });

    document.addEventListener('shopify:block:deselect', function (event) {
      var instance = getInstanceById(event.detail.sectionId);

      if (typeof instance === 'object') {
        instance.onBlockDeselect(event);
      }
    });
  }

  /**
   * A11y Helpers
   * -----------------------------------------------------------------------------
   * A collection of useful functions that help make your theme more accessible
   */

  /**
   * Moves focus to an HTML element
   * eg for In-page links, after scroll, focus shifts to content area so that
   * next `tab` is where user expects. Used in bindInPageLinks()
   * eg move focus to a modal that is opened. Used in trapFocus()
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */
  function forceFocus(element, options) {
    options = options || {};

    element.focus();
    if (typeof options.className !== 'undefined') {
      element.classList.add(options.className);
    }
    element.addEventListener('blur', callback);

    function callback(event) {
      event.target.removeEventListener(event.type, callback);

      if (typeof options.className !== 'undefined') {
        element.classList.remove(options.className);
      }
    }
  }

  /**
   * If there's a hash in the url, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - Selector for elements to not include.
   */

  function focusHash(options) {
    options = options || {};
    var hash = window.location.hash;
    var element = document.getElementById(hash.slice(1));

    // if we are to ignore this element, early return
    if (element && options.ignore && element.matches(options.ignore)) {
      return false;
    }

    if (hash && element) {
      forceFocus(element, options);
    }
  }

  /**
   * When an in-page (url w/hash) link is clicked, focus the appropriate element
   * This compensates for older browsers that do not move keyboard focus to anchor links.
   * Recommendation: To be called once the page in loaded.
   *
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   * @param {string} options.ignore - CSS selector for elements to not include.
   */

  function bindInPageLinks(options) {
    options = options || {};
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

    function queryCheck(selector) {
      return document.getElementById(selector) !== null;
    }

    return links.filter(function (link) {
      if (link.hash === '#' || link.hash === '') {
        return false;
      }

      if (options.ignore && link.matches(options.ignore)) {
        return false;
      }

      if (!queryCheck(link.hash.substr(1))) {
        return false;
      }

      var element = document.querySelector(link.hash);

      if (!element) {
        return false;
      }

      link.addEventListener('click', function () {
        forceFocus(element, options);
      });

      return true;
    });
  }

  function focusable(container) {
    var elements = Array.prototype.slice.call(
      container.querySelectorAll(
        '[tabindex],' + '[draggable],' + 'a[href],' + 'area,' + 'button:enabled,' + 'input:not([type=hidden]):enabled,' + 'object,' + 'select:enabled,' + 'textarea:enabled' + '[data-focus-element]'
      )
    );

    // Filter out elements that are not visible.
    // Copied from jQuery https://github.com/jquery/jquery/blob/2d4f53416e5f74fa98e0c1d66b6f3c285a12f0ce/src/css/hiddenVisibleSelectors.js
    return elements.filter(function (element) {
      return Boolean(element.offsetWidth || element.offsetHeight || element.getClientRects().length);
    });
  }

  /**
   * Traps the focus in a particular container
   *
   * @param {Element} container - Container DOM element to trap focus inside of
   * @param {Element} elementToFocus - Element to be focused on first
   * @param {Object} options - Settings unique to your theme
   * @param {string} options.className - Class name to apply to element on focus.
   */

  var trapFocusHandlers = {};

  function trapFocus(container, options) {
    options = options || {};
    var elements = focusable(container);
    var elementToFocus = options.elementToFocus || container;
    var first = elements[0];
    var last = elements[elements.length - 1];

    removeTrapFocus();

    trapFocusHandlers.focusin = function (event) {
      if (container !== event.target && !container.contains(event.target) && first) {
        first.focus();
      }

      if (event.target !== container && event.target !== last && event.target !== first) return;
      document.addEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.focusout = function () {
      document.removeEventListener('keydown', trapFocusHandlers.keydown);
    };

    trapFocusHandlers.keydown = function (event) {
      if (event.keyCode !== 9) return; // If not TAB key

      // On the last focusable element and tab forward, focus the first element.
      if (event.target === last && !event.shiftKey) {
        event.preventDefault();
        first.focus();
      }

      //  On the first focusable element and tab backward, focus the last element.
      if ((event.target === container || event.target === first) && event.shiftKey) {
        event.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('focusout', trapFocusHandlers.focusout);
    document.addEventListener('focusin', trapFocusHandlers.focusin);

    forceFocus(elementToFocus, options);
  }

  /**
   * Removes the trap of focus from the page
   */
  function removeTrapFocus() {
    document.removeEventListener('focusin', trapFocusHandlers.focusin);
    document.removeEventListener('focusout', trapFocusHandlers.focusout);
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  }

  var selectors$F = {
    drawerWrappper: 'data-drawer',
    drawerScrolls: '[data-drawer-scrolls]',
    underlay: '[data-drawer-underlay]',
    stagger: '[data-stagger-animation]',
    outer: '[data-header-wrapper]',
    drawerToggle: 'data-drawer-toggle',
    focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  };

  var classes$h = {
    isOpenOuter: 'has-drawer-open',
    isVisible: 'drawer--visible',
    displayNone: 'display-none',
  };

  var sections$l = {};

  class Drawer {
    constructor(el) {
      this.drawer = el;
      this.drawerScrolls = this.drawer.querySelector(selectors$F.drawerScrolls);
      this.underlay = this.drawer.querySelector(selectors$F.underlay);
      this.key = this.drawer.dataset.drawer;
      const btnSelector = `[${selectors$F.drawerToggle}='${this.key}']`;
      this.buttons = document.querySelectorAll(btnSelector);
      this.staggers = this.drawer.querySelectorAll(selectors$F.stagger);
      this.outer = this.drawer.closest(selectors$F.outer);

      this.connectToggle();
      this.connectDrawer();
      this.closers();
      this.staggerChildAnimations();
    }

    unload() {
      // wipe listeners
    }

    connectToggle() {
      this.buttons.forEach((btn) => {
        btn.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            this.drawer.dispatchEvent(
              new CustomEvent('theme:drawer:toggle', {
                bubbles: false,
              })
            );
          }.bind(this)
        );
      });
    }

    connectDrawer() {
      this.drawer.addEventListener(
        'theme:drawer:toggle',
        function () {
          if (this.drawer.classList.contains(classes$h.isVisible)) {
            this.drawer.dispatchEvent(
              new CustomEvent('theme:drawer:close', {
                bubbles: false,
              })
            );
          } else {
            this.drawer.dispatchEvent(
              new CustomEvent('theme:drawer:open', {
                bubbles: false,
              })
            );
          }
        }.bind(this)
      );
      this.drawer.addEventListener('theme:drawer:close', this.hideDrawer.bind(this));
      this.drawer.addEventListener('theme:drawer:open', this.showDrawer.bind(this));
    }

    staggerChildAnimations() {
      this.staggers.forEach((el) => {
        const children = el.querySelectorAll(':scope > * > [data-animates]');
        children.forEach((child, index) => {
          child.style.transitionDelay = `${index * 50 + 10}ms`;
        });
      });
    }

    closers() {
      this.drawer.addEventListener(
        'keyup',
        function (evt) {
          if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
            return;
          }
          this.hideDrawer();
          this.buttons[0].focus();
        }.bind(this)
      );

      this.underlay.addEventListener(
        'click',
        function () {
          this.hideDrawer();
        }.bind(this)
      );
    }

    showDrawer() {
      this.drawer.classList.remove(classes$h.displayNone);
      // animates after display none is removed
      setTimeout(() => {
        this.buttons.forEach((el) => el.setAttribute('aria-expanded', true));
        this.drawer.classList.add(classes$h.isVisible);
        this.drawerScrolls.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        const firstFocus = this.drawer.querySelector(selectors$F.focusable);
        trapFocus(this.drawer, {elementToFocus: firstFocus});
      }, 1);

      if (this.key === 'hamburger') {
        document.querySelector(`[${selectors$F.drawerWrappper}="drawer-cart"]`).classList.remove(classes$h.isVisible);
        this.outer.classList.add(classes$h.isOpenOuter);
      }

      if (this.key === 'drawer-cart') {
        document.querySelector(`[${selectors$F.drawerWrappper}="hamburger"]`).classList.remove(classes$h.isVisible);
        document.querySelector(`[${selectors$F.drawerWrappper}="hamburger"]`).closest(selectors$F.outer).classList.remove(classes$h.isOpenOuter);
      }
    }

    hideDrawer() {
      this.buttons.forEach((el) => el.setAttribute('aria-expanded', true));
      this.drawer.classList.remove(classes$h.isVisible);
      this.drawerScrolls.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));

      document.dispatchEvent(new CustomEvent('theme:sliderule:close', {bubbles: false}));
      removeTrapFocus();

      // adds display none after animations
      setTimeout(() => {
        if (!this.drawer.classList.contains(classes$h.isVisible)) {
          this.drawer.classList.add(classes$h.displayNone);
        }
      }, 800);
      if (this.key === 'hamburger') {
        this.outer.classList.remove(classes$h.isOpenOuter);
      }
    }
  }

  const drawer = {
    onLoad() {
      sections$l[this.id] = [];
      const els = this.container.querySelectorAll(`[${selectors$F.drawerWrappper}]`);
      els.forEach((el) => {
        sections$l[this.id].push(new Drawer(el));
      });
    },
    onUnload: function () {
      sections$l[this.id].forEach((el) => {
        if (typeof el.unload === 'function') {
          el.unload();
        }
      });
    },
  };

  const selectors$E = {
    announcement: '[data-announcement-wrapper]',
    transparent: 'data-header-transparent',
    header: '[data-header-wrapper] header',
    headerIsNotFixed: '[data-header-sticky="static"]',
  };

  const classes$g = {
    stuck: 'js__header__stuck',
    stuckAnimated: 'js__header__stuck--animated',
    triggerAnimation: 'js__header__stuck--trigger-animation',
    stuckBackdrop: 'js__header__stuck__backdrop',
    headerIsNotVisible: 'is-not-visible',
    hasStickyHeader: 'has-sticky-header',
  };

  let sections$k = {};

  class Sticky {
    constructor(el) {
      this.wrapper = el;
      this.type = this.wrapper.dataset.headerSticky;
      this.sticks = this.type === 'sticky';
      this.static = this.type === 'static';
      this.win = window;
      this.animated = this.type === 'directional';
      this.currentlyStuck = false;
      this.cls = this.wrapper.classList;
      const announcementEl = document.querySelector(selectors$E.announcement);
      const announcementHeight = announcementEl ? announcementEl.clientHeight : 0;
      this.headerHeight = document.querySelector(selectors$E.header).clientHeight;
      this.blur = this.headerHeight + announcementHeight;
      this.stickDown = this.headerHeight + announcementHeight;
      this.stickUp = announcementHeight;
      this.scrollEventStatic = () => this.checkIsVisible();
      this.scrollEventListen = (e) => this.listenScroll(e);
      this.scrollEventUpListen = () => this.scrollUpDirectional();
      this.scrollEventDownListen = () => this.scrollDownDirectional();
      if (this.wrapper.getAttribute(selectors$E.transparent) !== 'false') {
        this.blur = announcementHeight;
      }
      if (this.sticks) {
        this.stickDown = announcementHeight;
        this.scrollDownInit();
        document.body.classList.add(classes$g.hasStickyHeader);
      } else {
        document.body.classList.remove(classes$g.hasStickyHeader);
      }

      if (this.static) {
        document.addEventListener('theme:scroll', this.scrollEventStatic);
      }

      this.listen();
    }

    unload() {
      if (this.sticks || this.animated) {
        document.removeEventListener('theme:scroll', this.scrollEventListen);
      }

      if (this.animated) {
        document.removeEventListener('theme:scroll:up', this.scrollEventUpListen);
        document.removeEventListener('theme:scroll:down', this.scrollEventDownListen);
      }

      if (this.static) {
        document.removeEventListener('theme:scroll', this.scrollEventStatic);
      }
    }

    listen() {
      if (this.sticks || this.animated) {
        document.addEventListener('theme:scroll', this.scrollEventListen);
      }

      if (this.animated) {
        document.addEventListener('theme:scroll:up', this.scrollEventUpListen);
        document.addEventListener('theme:scroll:down', this.scrollEventDownListen);
      }
    }

    listenScroll(e) {
      if (e.detail.down) {
        if (!this.currentlyStuck && e.detail.position > this.stickDown) {
          this.stickSimple();
        }
        if (!this.currentlyBlurred && e.detail.position > this.blur) {
          this.addBlur();
        }
      } else {
        if (e.detail.position <= this.stickUp) {
          this.unstickSimple();
        }
        if (e.detail.position <= this.blur) {
          this.removeBlur();
        }
      }
    }

    stickSimple() {
      if (this.animated) {
        this.cls.add(classes$g.stuckAnimated);
      }
      this.cls.add(classes$g.stuck);
      this.wrapper.setAttribute(selectors$E.transparent, false);
      this.currentlyStuck = true;
    }

    unstickSimple() {
      if (!document.documentElement.hasAttribute('data-scroll-locked')) {
        // check for scroll lock
        this.cls.remove(classes$g.stuck);
        this.wrapper.setAttribute(selectors$E.transparent, theme.transparentHeader);
        if (this.animated) {
          this.cls.remove(classes$g.stuckAnimated);
        }
        this.currentlyStuck = false;
      }
    }

    scrollDownInit() {
      if (window.scrollY > this.stickDown) {
        this.stickSimple();
      }
      if (window.scrollY > this.blur) {
        this.addBlur();
      }
    }

    stickDirectional() {
      this.cls.add(classes$g.triggerAnimation);
    }

    unstickDirectional() {
      this.cls.remove(classes$g.triggerAnimation);
    }

    scrollDownDirectional() {
      this.unstickDirectional();
    }

    scrollUpDirectional() {
      if (window.scrollY <= this.stickDown) {
        this.unstickDirectional();
      } else {
        this.stickDirectional();
      }
    }

    addBlur() {
      this.cls.add(classes$g.stuckBackdrop);
      this.currentlyBlurred = true;
    }

    removeBlur() {
      this.cls.remove(classes$g.stuckBackdrop);
      this.currentlyBlurred = false;
    }

    checkIsVisible() {
      const header = document.querySelector(selectors$E.headerIsNotFixed);
      const currentScroll = this.win.pageYOffset;

      if (header) {
        header.classList.toggle(classes$g.headerIsNotVisible, currentScroll >= this.headerHeight);
      }
    }
  }

  const stickyHeader = {
    onLoad() {
      sections$k = new Sticky(this.container);
    },
    onUnload: function () {
      if (typeof sections$k.unload === 'function') {
        sections$k.unload();
      }
    },
  };

  const selectors$D = {
    disclosureToggle: 'data-hover-disclosure-toggle',
    disclosureWrappper: '[data-hover-disclosure]',
    link: '[data-top-link]',
    wrapper: '[data-header-wrapper]',
    stagger: '[data-stagger]',
    staggerPair: '[data-stagger-first]',
    staggerAfter: '[data-stagger-second]',
    focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  };

  const classes$f = {
    isVisible: 'is-visible',
    meganavVisible: 'meganav--visible',
    meganavIsTransitioning: 'meganav--is-transitioning',
  };

  let sections$j = {};
  let disclosures = {};
  class HoverDisclosure {
    constructor(el) {
      this.disclosure = el;
      this.wrapper = el.closest(selectors$D.wrapper);
      this.key = this.disclosure.id;
      this.trigger = document.querySelector(`[${selectors$D.disclosureToggle}='${this.key}']`);
      this.link = this.trigger.querySelector(selectors$D.link);
      this.grandparent = this.trigger.classList.contains('grandparent');
      this.transitionTimeout = 0;

      this.trigger.setAttribute('aria-haspopup', true);
      this.trigger.setAttribute('aria-expanded', false);
      this.trigger.setAttribute('aria-controls', this.key);

      this.connectHoverToggle();
      this.handleTablets();
      this.staggerChildAnimations();
    }

    onBlockSelect(evt) {
      if (this.disclosure.contains(evt.target)) {
        this.showDisclosure(evt);
      }
    }

    onBlockDeselect(evt) {
      if (this.disclosure.contains(evt.target)) {
        this.hideDisclosure();
      }
    }

    showDisclosure(e) {
      if (e && e.type && e.type === 'mouseenter') {
        this.wrapper.classList.add(classes$f.meganavIsTransitioning);
      }

      if (this.grandparent) {
        this.wrapper.classList.add(classes$f.meganavVisible);
      } else {
        this.wrapper.classList.remove(classes$f.meganavVisible);
      }
      this.trigger.setAttribute('aria-expanded', true);
      this.trigger.classList.add(classes$f.isVisible);
      this.disclosure.classList.add(classes$f.isVisible);

      if (this.transitionTimeout) {
        clearTimeout(this.transitionTimeout);
      }

      this.transitionTimeout = setTimeout(() => {
        this.wrapper.classList.remove(classes$f.meganavIsTransitioning);
      }, 200);
    }

    hideDisclosure() {
      this.disclosure.classList.remove(classes$f.isVisible);
      this.trigger.classList.remove(classes$f.isVisible);
      this.trigger.setAttribute('aria-expanded', false);
      this.wrapper.classList.remove(classes$f.meganavVisible, classes$f.meganavIsTransitioning);
    }

    staggerChildAnimations() {
      const simple = this.disclosure.querySelectorAll(selectors$D.stagger);
      simple.forEach((el, index) => {
        el.style.transitionDelay = `${index * 50 + 10}ms`;
      });

      const pairs = this.disclosure.querySelectorAll(selectors$D.staggerPair);
      pairs.forEach((child, i) => {
        const d1 = i * 150;
        child.style.transitionDelay = `${d1}ms`;
        child.parentElement.querySelectorAll(selectors$D.staggerAfter).forEach((grandchild, i2) => {
          const di1 = i2 + 1;
          const d2 = di1 * 20;
          grandchild.style.transitionDelay = `${d1 + d2}ms`;
        });
      });
    }

    handleTablets() {
      // first click opens the popup, second click opens the link
      this.trigger.addEventListener(
        'touchstart',
        function (e) {
          const isOpen = this.disclosure.classList.contains(classes$f.isVisible);
          if (!isOpen) {
            e.preventDefault();
            this.showDisclosure(e);
          }
        }.bind(this),
        {passive: true}
      );
    }

    connectHoverToggle() {
      this.trigger.addEventListener('mouseenter', (e) => this.showDisclosure(e));
      this.link.addEventListener('focus', (e) => this.showDisclosure(e));

      this.trigger.addEventListener('mouseleave', () => this.hideDisclosure());
      this.trigger.addEventListener('focusout', (e) => {
        const inMenu = this.trigger.contains(e.relatedTarget);
        if (!inMenu) {
          this.hideDisclosure();
        }
      });
      this.disclosure.addEventListener('keyup', (evt) => {
        if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
          return;
        }
        this.hideDisclosure();
      });
    }
  }

  const hoverDisclosure = {
    onLoad() {
      sections$j[this.id] = [];
      disclosures = this.container.querySelectorAll(selectors$D.disclosureWrappper);
      disclosures.forEach((el) => {
        sections$j[this.id].push(new HoverDisclosure(el));
      });
    },
    onBlockSelect(evt) {
      sections$j[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(evt);
        }
      });
    },
    onBlockDeselect(evt) {
      sections$j[this.id].forEach((el) => {
        if (typeof el.onBlockDeselect === 'function') {
          el.onBlockDeselect(evt);
        }
      });
    },
  };

  const selectors$C = {
    count: 'data-cart-count',
  };

  class Totals {
    constructor(el) {
      this.section = el;
      this.counts = this.section.querySelectorAll(`[${selectors$C.count}]`);
      this.cart = null;
      this.listen();
    }

    listen() {
      document.addEventListener(
        'theme:cart:change',
        function (event) {
          this.cart = event.detail.cart;
          this.update();
        }.bind(this)
      );
    }

    update() {
      if (this.cart) {
        this.counts.forEach((count) => {
          count.setAttribute(selectors$C.count, this.cart.item_count);
          count.innerHTML = `${this.cart.item_count}`;
        });
      }
    }
  }
  const headerTotals = {
    onLoad() {
      new Totals(this.container);
    },
  };

  function FetchError(object) {
    this.status = object.status || null;
    this.headers = object.headers || null;
    this.json = object.json || null;
    this.body = object.body || null;
  }
  FetchError.prototype = Error.prototype;

  const slideDown = (target, duration = 500, checkHidden = true) => {
    let display = window.getComputedStyle(target).display;
    if (checkHidden && display !== 'none') {
      return;
    }
    target.style.removeProperty('display');
    if (display === 'none') display = 'block';
    target.style.display = display;
    let height = target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.boxSizing = 'border-box';
    target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionDuration = duration + 'ms';
    target.style.height = height + 'px';
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    window.setTimeout(() => {
      target.style.removeProperty('height');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('transition-timing-function');
    }, duration);
  };

  const slideUp = (target, duration = 500) => {
    target.style.transitionProperty = 'height, margin, padding';
    target.style.transitionTimingFunction = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
    target.style.transitionDuration = duration + 'ms';
    target.style.boxSizing = 'border-box';
    target.style.height = target.offsetHeight + 'px';
    target.offsetHeight;
    target.style.overflow = 'hidden';
    target.style.height = 0;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.style.display = 'none';
      target.style.removeProperty('height');
      target.style.removeProperty('padding-top');
      target.style.removeProperty('padding-bottom');
      target.style.removeProperty('margin-top');
      target.style.removeProperty('margin-bottom');
      target.style.removeProperty('overflow');
      target.style.removeProperty('transition-duration');
      target.style.removeProperty('transition-property');
      target.style.removeProperty('transition-timing-function');
    }, duration);
  };

  class CartNotes {
    constructor(element) {
      this.inputs = element.querySelectorAll('[data-cart-note]');
      this.initInputs();
    }

    initInputs() {
      this.inputs.forEach((input) => {
        input.addEventListener(
          'change',
          function (e) {
            const note = e.target.value.toString() || '';
            this.saveNotes(note);
          }.bind(this)
        );
      });
    }

    saveNotes(newNote) {
      window
        .fetch(`${window.theme.routes.cart}/update.js`, {
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({note: newNote}),
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  const getUrlString = (params, keys = [], isArray = false) => {
    const p = Object.keys(params)
      .map((key) => {
        let val = params[key];

        if (Object.prototype.toString.call(val) === '[object Object]' || Array.isArray(val)) {
          if (Array.isArray(params)) {
            keys.push('');
          } else {
            keys.push(key);
          }
          return getUrlString(val, keys, Array.isArray(val));
        } else {
          let tKey = key;

          if (keys.length > 0) {
            const tKeys = isArray ? keys : [...keys, key];
            tKey = tKeys.reduce((str, k) => {
              return str === '' ? k : `${str}[${k}]`;
            }, '');
          }
          if (isArray) {
            return `${tKey}[]=${val}`;
          } else {
            return `${tKey}=${val}`;
          }
        }
      })
      .join('&');

    keys.pop();
    return p;
  };

  /**
   * Module to add a shipping rates calculator to cart page.
   *
   */

  const selectors$B = {
    submitButton: '[data-submit-shipping]',
    form: '[data-shipping-estimate-form]',
    template: '[data-response-template]',
    country: '#estimate_address_country',
    province: '#estimate_address_province',
    zip: '#estimate_address_zip',
    wrapper: '[data-response-wrapper]',
    defaultData: 'data-default-fullname',
  };

  const classes$e = {
    success: 'shipping--success',
    error: 'errors',
  };

  class ShippingCalculator {
    constructor(section) {
      this.button = section.container.querySelector(selectors$B.submitButton);
      this.template = section.container.querySelector(selectors$B.template).innerHTML;
      this.ratesWrapper = section.container.querySelector(selectors$B.wrapper);
      this.form = section.container.querySelector(selectors$B.form);
      this.country = section.container.querySelector(selectors$B.country);
      this.province = section.container.querySelector(selectors$B.province);
      this.zip = section.container.querySelector(selectors$B.zip);
      this.init();
    }

    enableButtons() {
      this.button.removeAttribute('disabled');
      this.button.classList.remove('disabled');
    }

    disableButtons() {
      this.button.setAttribute('disabled', 'disabled');
      this.button.classList.add('disabled');
    }

    render(rates) {
      if (this.template && this.ratesWrapper) {
        const rendered = Sqrl__namespace.render(this.template, rates);
        this.ratesWrapper.innerHTML = rendered;
      }
      this.enableButtons();
      this.ratesWrapper.style.removeProperty('display');
    }

    estimate(shipping_address) {
      const encodedShippingAddressData = encodeURI(
        getUrlString({
          shipping_address: shipping_address,
        })
      );
      const url = `${window.theme.routes.cart}/shipping_rates.json?${encodedShippingAddressData}`;
      const instance = this;
      axios
        .get(url)
        .then(function (response) {
          // handle success
          const items = instance.sanitize(response);
          instance.render(items);
          instance.enableButtons();
          instance.ratesWrapper.style.removeProperty('display');
        })
        .catch(function (error) {
          // handle errors
          const errors = instance.sanitizeErrors(error);
          instance.render(errors);
        });
    }

    sanitize(response) {
      const sanitized = {};
      sanitized.class = classes$e.success;
      sanitized.items = [];
      if (response.data.shipping_rates && response.data.shipping_rates.length > 0) {
        const rates = response.data.shipping_rates;
        rates.forEach((r) => {
          let item = {};
          item.title = r.presentment_name;
          item.value = themeCurrency.formatMoney(r.price, theme.moneyFormat);
          sanitized.items.push(item);
        });
      } else {
        sanitized.items[0] = {value: theme.strings.noShippingAvailable};
      }
      return sanitized;
    }

    sanitizeErrors(response) {
      const errors = {};
      errors.class = classes$e.error;
      errors.items = [];
      if (typeof response.data === 'object') {
        for (const [key, value] of Object.entries(response.data)) {
          let item = {};
          item.title = key.toString();
          item.value = value.toString();
          errors.items.push(item);
        }
      } else {
        errors.items[0] = {value: theme.strings.noShippingAvailable};
      }
      return errors;
    }

    init() {
      const htmlEl = document.querySelector('html');
      let locale = 'en';
      if (htmlEl.hasAttribute('lang') && htmlEl.getAttribute('lang') !== '') {
        locale = htmlEl.getAttribute('lang');
      }

      if (this.form) {
        themeAddresses.AddressForm(this.form, locale, {
          shippingCountriesOnly: true,
        });
      }

      if (this.country && this.country.hasAttribute('data-default') && this.province && this.province.hasAttribute('data-default')) {
        this.country.addEventListener('change', function () {
          this.country.removeAttribute('data-default');
          this.province.removeAttribute('data-default');
        });
      }

      if (this.button) {
        this.button.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            this.disableButtons();
            while (this.ratesWrapper.firstChild) this.ratesWrapper.removeChild(this.ratesWrapper.firstChild);
            this.ratesWrapper.style.display = 'none';
            const shippingAddress = {};
            let elemCountryVal = this.country.value;
            let elemProvinceVal = this.province.value;
            const elemCountryData = this.country.getAttribute(selectors$B.defaultData);
            if (elemCountryVal === '' && elemCountryData && elemCountryData !== '') {
              elemCountryVal = elemCountryData;
            }
            const elemProvinceData = this.province.getAttribute(selectors$B.defaultData);
            if (elemProvinceVal === '' && elemProvinceData && elemProvinceData !== '') {
              elemProvinceVal = elemProvinceData;
            }
            shippingAddress.zip = this.zip.value || '';
            shippingAddress.country = elemCountryVal || '';
            shippingAddress.province = elemProvinceVal || '';
            this.estimate(shippingAddress);
          }.bind(this)
        );
      }
    }
  }

  const selectors$A = {
    cartMessage: '[data-cart-message]',
    cartMessageValue: 'data-cart-message',
    leftToSpend: '[data-left-to-spend]',
    cartProgress: '[data-cart-progress]',
  };

  const classes$d = {
    isHidden: 'is-hidden',
    isSuccess: 'is-success',
  };

  class CartShippingMessage {
    constructor(section) {
      this.container = section;
      this.cartMessage = this.container.querySelectorAll(selectors$A.cartMessage);
      if (this.cartMessage.length > 0) {
        this.init();
      }
    }

    init() {
      this.cartFreeLimitShipping = Number(this.cartMessage[0].getAttribute('data-limit')) * 100;
      this.shippingAmount = 0;

      this.cartBarProgress();
      this.listen();
    }

    listen() {
      document.addEventListener(
        'theme:cart:change',
        function (event) {
          this.cart = event.detail.cart;
          this.render();
        }.bind(this)
      );
    }

    render() {
      if (this.cart && this.cart.total_price) {
        const totalPrice = this.cart.total_price;
        this.freeShippingMessageHandle(totalPrice);

        // Build cart again if the quantity of the changed product is 0 or cart discounts are changed
        if (this.cartMessage.length > 0) {
          this.shippingAmount = totalPrice;
          this.updateProgress();
        }
      }
    }

    freeShippingMessageHandle(total) {
      if (this.cartMessage.length > 0) {
        this.container.querySelectorAll(selectors$A.cartMessage).forEach((message) => {
          const hasFreeShipping = message.hasAttribute(selectors$A.cartMessageValue) && message.getAttribute(selectors$A.cartMessageValue) === 'true' && total !== 0;
          const cartMessageClass = hasFreeShipping ? classes$d.isSuccess : classes$d.isHidden;

          message.classList.toggle(cartMessageClass, total >= this.cartFreeLimitShipping);
        });
      }
    }

    cartBarProgress(progress = null) {
      this.container.querySelectorAll(selectors$A.cartProgress).forEach((element) => {
        this.setProgress(element, progress === null ? element.getAttribute('data-percent') : progress);
      });
    }

    setProgress(holder, percent) {
      holder.style.setProperty('--bar-progress', `${percent}%`);
    }

    updateProgress() {
      const newPercentValue = (this.shippingAmount / this.cartFreeLimitShipping) * 100;
      const leftToSpend = themeCurrency.formatMoney(this.cartFreeLimitShipping - this.shippingAmount, theme.moneyFormat);

      this.container.querySelectorAll(selectors$A.leftToSpend).forEach((element) => {
        element.innerHTML = leftToSpend.replace('.00', '');
      });

      this.cartBarProgress(newPercentValue > 100 ? 100 : newPercentValue);
    }
  }

  let sections$i = {};

  const selectors$z = {
    wrapper: '[data-add-action-wrapper]',
    addButton: '[data-add-to-cart]',
    errors: '[data-add-action-errors]',
    addVariantDetached: 'data-add-to-cart-variant',
    drawer: '[data-drawer="drawer-cart"]',
    cartPage: '[data-ajax-disable]',
  };

  const classes$c = {
    loading: 'loading',
    success: 'has-success',
  };

  class ProductAddButton {
    constructor(wrapper, isCartItem) {
      this.wrapper = wrapper;
      this.button = wrapper.querySelector(selectors$z.addButton);
      this.errors = wrapper.querySelector(selectors$z.errors);
      this.drawer = document.querySelector(selectors$z.drawer);

      // cart upsell item
      this.isCartItem = isCartItem ? isCartItem : false;
      if (document.querySelector(selectors$z.cartPage)) {
        // featured product on cart page
        this.isCartItem = true;
      }

      if (this.button) {
        const isDetached = this.button.hasAttribute(selectors$z.addVariantDetached);
        if (isDetached) {
          this.initDetached();
        } else {
          this.initWithForm();
        }
      }
    }

    initWithForm() {
      this.button.addEventListener(
        'click',
        function (evt) {
          const outerForm = evt.target.closest('form');
          if (outerForm.querySelector('[type="file"]')) {
            return;
          }
          evt.preventDefault();

          this.button.setAttribute('disabled', true);
          this.button.classList.add(classes$c.loading);

          const formData = new FormData(outerForm);
          const formString = new URLSearchParams(formData).toString();
          this.addToCartAction(formString);
        }.bind(this)
      );
    }

    initDetached() {
      this.button.addEventListener(
        'click',
        function (evt) {
          evt.preventDefault();

          this.button.setAttribute('disabled', true);
          this.button.classList.add(classes$c.loading);

          const variant = this.button.getAttribute(selectors$z.addVariantDetached);
          const formString = `form_type=product&id=${variant}`;

          this.addToCartAction(formString);
        }.bind(this)
      );
    }

    addToCartAction(formData) {
      const url = `${window.theme.routes.cart}/add.js`;
      const instance = this;
      axios
        .post(url, formData, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .then(function (response) {
          instance.onSuccess(response.data);
        })
        .catch(function (error) {
          console.warn(error);
          instance.onError(error.data);
        });
    }

    onSuccess(variant) {
      this.updateHeaderTotal();
      this.button.classList.remove(classes$c.loading);
      this.button.classList.add(classes$c.success);
      setTimeout(() => {
        this.button.classList.remove(classes$c.success);
        this.button.removeAttribute('disabled');
      }, 3500);

      if (this.isCartItem) {
        document.dispatchEvent(new CustomEvent('theme:cart:reload', {bubbles: true}));
      } else if (this.drawer) {
        this.drawer.dispatchEvent(
          new CustomEvent('theme:drawer:open', {
            detail: {
              variant: variant,
              reinit: true,
            },
            bubbles: true,
          })
        );
      }
    }

    onError(data) {
      let text = 'Network error: please try again';
      if (data && data.description) {
        text = data.description;
      }
      const errorsHTML = `<div class="errors">${text}</div>`;

      this.button.classList.remove(classes$c.loading);
      this.button.removeAttribute('disabled');
      this.errors.innerHTML = errorsHTML;
      slideDown(this.errors);
      setTimeout(() => {
        slideUp(this.errors);
      }, 5000);
    }

    updateHeaderTotal() {
      axios
        .get(`${window.theme.routes.cart}.js`)
        .then((response) => {
          document.dispatchEvent(
            new CustomEvent('theme:cart:change', {
              detail: {
                cart: response.data,
              },
              bubbles: true,
            })
          );
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  const productAddSection = {
    onLoad() {
      sections$i[this.id] = [];
      const els = this.container.querySelectorAll(selectors$z.wrapper);
      els.forEach((el) => {
        sections$i[this.id].push(new ProductAddButton(el));
      });
    },
    onUnload: function () {
      sections$i[this.id].forEach((el) => {
        if (typeof el.unload === 'function') {
          el.unload();
        }
      });
    },
  };

  const selectors$y = {
    wrapper: '[data-quantity-selector]',
    increase: '[data-increase-quantity]',
    decrease: '[data-decrease-quantity]',
    input: '[data-quantity-input]',
  };

  class Quantity {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.increase = this.wrapper.querySelector(selectors$y.increase);
      this.decrease = this.wrapper.querySelector(selectors$y.decrease);
      this.input = this.wrapper.querySelector(selectors$y.input);
      this.min = parseInt(this.input.getAttribute('min'), 10);
      this.initButtons();
    }

    initButtons() {
      this.increase.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          let v = parseInt(this.input.value, 10);
          v = isNaN(v) ? 0 : v;
          v++;
          this.input.value = v;
          this.input.dispatchEvent(new Event('change'));
        }.bind(this)
      );
      this.decrease.addEventListener(
        'click',
        function (e) {
          e.preventDefault();
          let v = parseInt(this.input.value, 10);
          v = isNaN(v) ? 0 : v;
          v--;
          v = Math.max(this.min, v);
          this.input.value = v;
          this.input.dispatchEvent(new Event('change'));
        }.bind(this)
      );
    }
  }

  function initQtySection(container) {
    const quantityWrappers = container.querySelectorAll(selectors$y.wrapper);
    quantityWrappers.forEach((qty) => {
      new Quantity(qty);
    });
  }

  const selectors$x = {
    drawer: '[data-drawer="drawer-cart"]',
    shipping: '[data-shipping-estimate-form]',
    loader: '[data-cart-loading]',
    form: '[data-cart-form]',
    emptystate: '[data-cart-empty]',
    progress: '[data-cart-progress]',
    items: '[data-line-items]',
    subtotal: '[data-cart-subtotal]',
    bottom: '[data-cart-bottom]',
    quantity: '[data-quantity-selector]',
    errors: '[data-form-errors]',
    item: '[data-cart-item]',
    finalPrice: '[data-cart-final]',
    key: 'data-update-cart',
    remove: 'data-remove-key',
    upsellProduct: '[data-upsell-holder]',
    cartPage: '[data-section-type="cart"]',
  };

  const classes$b = {
    hidden: 'cart--hidden',
    loading: 'cart--loading',
  };

  class CartItems {
    constructor(section) {
      this.container = section.container;
      this.drawer = this.container.querySelector(selectors$x.drawer);
      this.form = this.container.querySelector(selectors$x.form);
      this.loader = this.container.querySelector(selectors$x.loader);
      this.bottom = this.container.querySelector(selectors$x.bottom);
      this.items = this.container.querySelector(selectors$x.items);
      this.subtotal = this.container.querySelector(selectors$x.subtotal);
      this.errors = this.container.querySelector(selectors$x.errors);
      this.finalPrice = this.container.querySelector(selectors$x.finalPrice);
      this.emptystate = this.container.querySelector(selectors$x.emptystate);
      this.progress = this.container.querySelector(selectors$x.progress);
      this.latestClick = null;
      this.cart = null;
      this.stale = true;
      this.cartPage = document.querySelector(selectors$x.cartPage);
      this.listen();
    }

    listen() {
      document.addEventListener(
        'theme:cart:change',
        function (event) {
          this.cart = event.detail.cart;
          this.stale = true;
        }.bind(this)
      );

      document.addEventListener(
        'theme:cart:init',
        function () {
          this.init();
        }.bind(this)
      );

      document.addEventListener(
        'theme:cart:reload',
        function () {
          this.stale = true;
          if (this.cart) {
            this.loadHTML();
          } else {
            this.init().then(() => this.loadHTML());
          }
        }.bind(this)
      );

      if (this.drawer) {
        this.drawer.addEventListener(
          'theme:drawer:open',
          function (event) {
            const reinit = event.detail === null ? false : event.detail.reinit;

            if (this.cart && !reinit) {
              this.loadHTML();
            } else {
              this.init().then(() => this.loadHTML());
            }
          }.bind(this)
        );
      }

      new CartNotes(this.container);
      new CartShippingMessage(this.container);
    }

    init() {
      return window
        .fetch(`${window.theme.routes.cart}.js`)
        .then(this.handleErrors)
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          this.cart = response;
          this.fireChange(response);
          return response;
        })
        .catch((e) => {
          console.error(e);
        });
    }

    loadHTML() {
      if (this.stale) {
        if (this.cart && this.cart.item_count > 0) {
          this.loadForm();
        } else {
          this.showEmpty();
        }
      }
      this.stale = false;
    }

    initInputs() {
      this.inputs = this.container.querySelectorAll(`[${selectors$x.key}]`);
      this.inputs.forEach((input) => {
        const key = input.getAttribute(selectors$x.key);
        input.addEventListener(
          'change',
          function (e) {
            const quantity = parseInt(e.target.value, 10);
            this.latestClick = e.target.closest(selectors$x.item);
            this.lockState();
            this.updateCart(key, quantity);
          }.bind(this)
        );
      });
    }

    initRemove() {
      this.removers = this.container.querySelectorAll(`[${selectors$x.remove}]`);
      this.removers.forEach((remover) => {
        const key = remover.getAttribute(selectors$x.remove);
        remover.addEventListener(
          'click',
          function (e) {
            e.preventDefault();
            this.latestClick = e.target.closest(selectors$x.item);
            this.lockState();
            this.updateCart(key, 0);
          }.bind(this)
        );
      });
    }

    lockState() {
      this.latestClick.querySelector('.item--loadbar').style.display = 'block';
      this.loader.classList.add(classes$b.loading);
    }

    updateCart(clickedKey, newQuantity) {
      let oldCount = null;
      let newCount = null;
      let newItem = null;
      window
        .fetch(`${window.theme.routes.cart}.js`)
        .then(this.handleErrors)
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          const matchKeys = (item) => item.key === clickedKey;
          const index = response.items.findIndex(matchKeys);
          oldCount = response.item_count;
          newItem = response.items[index].title;
          const data = {
            line: `${index + 1}`,
            quantity: newQuantity,
          };
          return window.fetch(`${window.theme.routes.cart}/change.js`, {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
          });
        })
        .then(this.handleErrors)
        .then((response) => {
          return response.json();
        })
        .then((response) => {
          this.cart = response;
          newCount = response.item_count;
          if (oldCount === newCount) {
            this.stockoutError(newItem);
            this.stale = true;
          } else {
            slideUp(this.errors);
            this.fireChange(response);
            this.stale = true;
          }

          this.loadHTML();
        })
        .catch((e) => {
          console.error(e);
          let heading = '';
          if (typeof e.status !== 'undefined') {
            heading = `<p>${e.status}</p>`;
          }
          let paragraph = e.json.description || '';
          this.showError(`${heading + paragraph}`);
          this.loadHTML();
        });
    }

    fireChange(newCart) {
      document.dispatchEvent(
        new CustomEvent('theme:cart:change', {
          detail: {
            cart: newCart,
          },
          bubbles: true,
        })
      );
    }

    updateTotal() {
      if (this.cart && this.cart.total_price) {
        const price = themeCurrency.formatMoney(this.cart.total_price, theme.moneyFormat);
        this.finalPrice.innerHTML = price;
      }
      if (this.subtotal && this.cart) {
        window
          .fetch(`${window.theme.routes.root_url}?section_id=api-cart-subtotal`)
          .then(this.handleErrors)
          .then((response) => {
            return response.text();
          })
          .then((response) => {
            const fresh = document.createElement('div');
            fresh.innerHTML = response;
            this.subtotal.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;
          });
      }
    }

    showError(message) {
      slideUp(this.errors);
      this.errors.innerHTML = message;
      window.setTimeout(() => {
        slideDown(this.errors);
      }, 600);
    }

    stockoutError(itemTitle) {
      let heading = `<p><strong>${window.theme.strings.stockout}</strong></p>`;
      let paragraph = `<p>${itemTitle}</p>`;
      this.showError(`${heading + paragraph}`);
    }

    loadForm() {
      window
        .fetch(`${window.theme.routes.root_url}?section_id=api-cart-items`)
        .then(this.handleErrors)
        .then((response) => {
          return response.text();
        })
        .then((response) => {
          const fresh = document.createElement('div');
          fresh.innerHTML = response;
          this.items.innerHTML = fresh.querySelector('[data-api-content]').innerHTML;

          this.showForm();
          this.initQuantity();
          this.initUpsell();
          this.updateTotal();
        });
    }

    initUpsell() {
      const upsellProduct = this.items.querySelector(selectors$x.upsellProduct);
      const oldUpsellProduct = this.bottom.querySelector(selectors$x.upsellProduct);
      const upsellButton = this.items.querySelector('[data-add-action-wrapper]');

      if (oldUpsellProduct) {
        oldUpsellProduct.remove();
      }

      if (this.cartPage && upsellProduct) {
        this.bottom.insertBefore(upsellProduct, this.bottom.firstChild);
      }

      if (upsellProduct && upsellButton) {
        // isCartItem tells add button to refresh the cart
        // instead of loading a popdown notification
        const isCartItem = true;
        new ProductAddButton(upsellButton, isCartItem);
      }
    }

    initQuantity() {
      initQtySection(this.container);
      this.initInputs();
      this.initRemove();
    }

    showForm() {
      this.form.classList.remove(classes$b.hidden);
      this.bottom.classList.remove(classes$b.hidden);
      this.progress?.classList.remove(classes$b.hidden);
      this.loader.classList.remove(classes$b.loading);
      this.emptystate.classList.add(classes$b.hidden);
    }

    showEmpty() {
      this.emptystate.classList.remove(classes$b.hidden);
      this.loader.classList.remove(classes$b.loading);
      this.form.classList.add(classes$b.hidden);
      this.bottom.classList.add(classes$b.hidden);
      this.progress?.classList.add(classes$b.hidden);
    }

    handleErrors(response) {
      if (!response.ok) {
        return response.json().then(function (json) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            json: json,
          });
          throw e;
        });
      }
      return response;
    }
  }

  const cartDrawer = {
    onLoad() {
      const isDrawerCart = this.container.querySelector(selectors$x.drawer);
      if (isDrawerCart) {
        this.cart = new CartItems(this);
      }

      const hasShipping = this.container.querySelector(selectors$x.shipping);
      if (hasShipping) {
        new ShippingCalculator(this);
      }
    },
    onUnload: function () {
      if (this.cart && typeof this.cart.unload === 'function') {
        this.cart.unload();
      }
    },
  };

  const selectors$w = {
    wrapper: '[data-search-popdown-wrap]',
    popdownTrigger: 'data-popdown-toggle',
    close: '[data-close-popdown]',
    input: '[data-predictive-search-input]',
    underlay: '[data-search-underlay]',
  };

  const classes$a = {
    underlayVisible: 'underlay--visible',
    isVisible: 'is-visible',
  };

  let sections$h = {};

  class SearchPopdownTriggers {
    constructor(trigger) {
      this.trigger = trigger;
      this.key = this.trigger.getAttribute(selectors$w.popdownTrigger);

      const popdownSelector = `[id='${this.key}']`;
      this.popdown = document.querySelector(popdownSelector);
      this.input = this.popdown.querySelector(selectors$w.input);
      this.close = this.popdown.querySelector(selectors$w.close);
      this.wrapper = this.popdown.closest(selectors$w.wrapper);
      this.underlay = this.wrapper.querySelector(selectors$w.underlay);

      this.initTriggerEvents();
      this.initPopdownEvents();
    }

    initTriggerEvents() {
      this.trigger.setAttribute('aria-haspopup', true);
      this.trigger.setAttribute('aria-expanded', false);
      this.trigger.setAttribute('aria-controls', this.key);
      this.trigger.addEventListener(
        'click',
        function (evt) {
          evt.preventDefault();
          this.showPopdown();
        }.bind(this)
      );
      this.trigger.addEventListener(
        'keyup',
        function (evt) {
          if (evt.which !== window.theme.keyboardKeys.SPACE) {
            return;
          }
          this.showPopdown();
        }.bind(this)
      );
    }

    initPopdownEvents() {
      this.popdown.addEventListener(
        'keyup',
        function (evt) {
          if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
            return;
          }
          this.hidePopdown();
        }.bind(this)
      );
      this.close.addEventListener(
        'click',
        function () {
          this.hidePopdown();
        }.bind(this)
      );
      this.underlay.addEventListener(
        'click',
        function () {
          this.hidePopdown();
        }.bind(this)
      );
    }

    hidePopdown() {
      this.popdown.classList.remove(classes$a.isVisible);
      this.underlay.classList.remove(classes$a.underlayVisible);
      this.trigger.focus();
      this.input.value = '';
      removeTrapFocus();
      this.input.dispatchEvent(new CustomEvent('clear', {bubbles: false}));
      this.popdown.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
    }

    showPopdown() {
      this.input.value = '';
      this.popdown.classList.add(classes$a.isVisible);
      this.underlay.classList.add(classes$a.underlayVisible);
      trapFocus(this.popdown, {elementToFocus: this.input});
      this.popdown.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
    }
  }

  const searchPopdown = {
    onLoad() {
      sections$h[this.id] = {};
      const triggers = this.container.querySelectorAll(`[${selectors$w.popdownTrigger}]`);
      triggers.forEach((trigger) => {
        sections$h[this.id] = new SearchPopdownTriggers(trigger);
      });
    },
  };

  /**
   * Image Helper Functions
   * -----------------------------------------------------------------------------
   * https://github.com/Shopify/slate.git.
   *
   */

  /**
   * Adds a Shopify size attribute to a URL
   *
   * @param src
   * @param size
   * @returns {*}
   */
  function getSizedImageUrl(src, size) {
    if (size === null) {
      return src;
    }

    if (typeof src === 'undefined' || src === null) {
      src = window.theme.assets.noImage;
    }

    if (size === 'master') {
      return removeProtocol(src);
    }

    const match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

    if (match) {
      const prefix = src.split(match[0]);
      const suffix = match[0];

      return removeProtocol(`${prefix[0]}_${size}${suffix}`);
    } else {
      return null;
    }
  }

  function removeProtocol(path) {
    return path.replace(/http(s)?:/, '');
  }

  const selectors$v = {
    saleClass: 'on-sale',
    soldClass: 'sold-out',
  };

  function formatPrices(product) {
    // Apprend classes for on sale and sold out
    const on_sale = product.price < product.compare_at_price_min;
    let classes = on_sale ? selectors$v.saleClass : '';
    classes += product.available ? '' : selectors$v.soldClass;
    // Add 'from' before min prive if price varies
    product.price = themeCurrency.formatMoney(product.price, theme.moneyFormat);
    if (product.prive_varies) {
      let min = themeCurrency.formatMoney(product.price_min, theme.moneyFormat);
      product.price = `${window.theme.strings.from} ${min}`;
    }

    const formatted = {
      ...product,
      classes,
      on_sale,
      sold_out: !product.available,
      sold_out_translation: window.theme.strings.soldOut,
      compare_at_price: themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat),
      compare_at_price_max: themeCurrency.formatMoney(product.compare_at_price_max, theme.moneyFormat),
      compare_at_price_min: themeCurrency.formatMoney(product.compare_at_price_min, theme.moneyFormat),
      price_max: themeCurrency.formatMoney(product.price_max, theme.moneyFormat),
      price_min: themeCurrency.formatMoney(product.price_min, theme.moneyFormat),
    };
    return formatted;
  }

  const selectors$u = {
    wrapper: '[data-search-popdown-wrap]',
    results: '[data-predictive-search-results]',
    input: '[data-predictive-search-input]',
    productTemplate: '[data-search-product-template]',
    otherTemplate: '[data-search-other-template]',
    titleTemplate: '[data-predictive-search-title-template]',
    ariaTemplate: '[data-predictive-search-aria-template]',
    productTitleWrapper: '[data-product-title-wrap]',
    productWrapper: '[data-product-wrap]',
    collectionWrapper: '[data-collection-wrap]',
    articleWrapper: '[data-article-wrap]',
    pageWrapper: '[data-page-wrap]',
    ariaWrapper: '[data-predictive-search-aria]',
    outerWrapper: '[data-popdown-outer]',
    loader: '[data-loading-indicator]',
    dirtyClass: 'dirty',
    noResults: 'search--empty',
  };

  let sections$g = {};

  Sqrl__namespace.filters.define('animationDelay', function (index) {
    return index * 90 + 10;
  });

  class SearchPredictive {
    constructor(wrapper) {
      this.wrapper = wrapper;
      this.input = this.wrapper.querySelector(selectors$u.input);
      this.loader = this.wrapper.querySelector(selectors$u.loader);
      this.results = this.wrapper.querySelector(selectors$u.results);
      this.outer = this.input.closest(selectors$u.outerWrapper);

      this.productTemplate = this.wrapper.querySelector(selectors$u.productTemplate).innerHTML;
      this.otherTemplate = this.wrapper.querySelector(selectors$u.otherTemplate).innerHTML;
      this.titleTemplate = this.wrapper.querySelector(selectors$u.titleTemplate).innerHTML;
      this.ariaTemplate = this.wrapper.querySelector(selectors$u.ariaTemplate).innerHTML;

      this.productTitleWrapper = this.results.querySelector(selectors$u.productTitleWrapper);
      this.productWrapper = this.results.querySelector(selectors$u.productWrapper);
      this.collectionWrapper = this.results.querySelector(selectors$u.collectionWrapper);
      this.articleWrapper = this.results.querySelector(selectors$u.articleWrapper);
      this.pageWrapper = this.results.querySelector(selectors$u.pageWrapper);
      this.ariaWrapper = this.results.querySelector(selectors$u.ariaWrapper);

      this.initSearch();
    }

    initSearch() {
      this.input.addEventListener(
        'input',
        debounce(
          function (event) {
            const val = event.target.value;
            if (val && val.length > 1) {
              this.loader.style.display = 'block';
              this.render(val);
            } else {
              this.resetTemplates();
              this.outer.classList.remove(selectors$u.dirtyClass);
            }
          }.bind(this),
          300
        )
      );
      this.input.addEventListener('clear', this.reset.bind(this));
    }

    render(terms) {
      let resources = '';
      resources += window.theme.settings.search_products ? 'product,' : '';
      resources += window.theme.settings.search_collections ? 'collection,' : '';
      resources += window.theme.settings.search_articles ? 'article,' : '';
      resources += window.theme.settings.search_pages ? 'page,' : '';
      resources = resources.slice(0, -1);
      const serialized = `/search/suggest.json?q=${terms}&resources[type]=${resources}&resources[options][unavailable_products]=last`;
      fetch(serialized)
        .then(this.handleErrors)
        .then((response) => response.json())
        .then((response) => {
          this.resetTemplates();
          this.outer.classList.add(selectors$u.dirtyClass);
          const results = response.resources.results;
          const combined = [];
          for (const key in results) {
            if ({}.hasOwnProperty.call(results, key)) {
              combined.push(...results[key]);
            }
          }
          if (combined.length) {
            this.outer.classList.remove(selectors$u.noResults);
            this.injectOther(results);
            this.injectProduct(results.products);
          } else {
            this.noResults(terms);
          }
          this.injectAria(terms, combined);
          trapFocus(this.outer, {elementToFocus: this.input});
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.loader.style.display = 'none';
        });
    }

    injectAria(terms, combined) {
      let title = window.theme.strings.noResultsFor;
      let count = null;
      if (combined.length) {
        count = combined.length;
        title = window.theme.strings.resultsFor;
      }
      this.ariaWrapper.innerHTML = Sqrl__namespace.render(this.ariaTemplate, {
        count: count,
        title: title,
        query: terms,
      });
    }

    noResults() {
      this.resetTemplates();
      this.outer.classList.add(selectors$u.dirtyClass);
      this.outer.classList.add(selectors$u.noResults);
    }

    resetTemplates() {
      this.productTitleWrapper.innerHTML = '';
      this.collectionWrapper.innerHTML = '';
      this.articleWrapper.innerHTML = '';
      this.productWrapper.innerHTML = '';
      this.pageWrapper.innerHTML = '';
      this.ariaWrapper.innerHTML = '';
    }

    reset() {
      this.resetTemplates();
      this.outer.classList.remove(selectors$u.dirtyClass);
      this.outer.classList.remove(selectors$u.noResults);
      this.input.val = '';
    }

    injectOther(results) {
      this.productTitleWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
        title: window.theme.strings.products,
        count: results.products.length,
      });
      if (results.collections && results.collections.length) {
        this.collectionWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
          title: window.theme.strings.collections,
          count: results.collections.length,
        });
        this.collectionWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, results.collections);
      }
      if (results.pages && results.pages.length) {
        this.pageWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
          title: window.theme.strings.pages,
          count: results.pages.length,
        });
        this.pageWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, results.pages);
      }
      if (results.articles && results.articles.length) {
        this.articleWrapper.innerHTML += Sqrl__namespace.render(this.titleTemplate, {
          title: window.theme.strings.articles,
          count: results.articles.length,
        });
        this.articleWrapper.innerHTML += Sqrl__namespace.render(this.otherTemplate, results.articles);
      }
    }

    injectProduct(products) {
      let formatted = [];
      products.forEach((p) => {
        let product = p;
        product = formatPrices(product);
        product.image = null;
        if (product.featured_image && product.featured_image.url) {
          product.thumb = getSizedImageUrl(product.featured_image.url, '360x360');
        }
        formatted.push(product);
      });
      const productHTML = Sqrl__namespace.render(this.productTemplate, formatted);
      this.productWrapper.innerHTML += productHTML;
    }

    handleErrors(response) {
      if (!response.ok) {
        return response.json().then(function (json) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            json: json,
          });
          throw e;
        });
      }
      return response;
    }
  }

  const searchResultsGlobal = {
    onLoad() {
      sections$g[this.id] = [];
      const els = document.querySelectorAll(selectors$u.wrapper);
      els.forEach((el) => {
        sections$g[this.id].push(new SearchPredictive(el));
      });
    },
    onUnload: function () {
      sections$g[this.id].forEach((el) => {
        if (typeof el.unload === 'function') {
          el.unload();
        }
      });
    },
  };

  const selectors$t = {
    popoutWrapper: '[data-popout]',
    popoutList: '[data-popout-list]',
    popoutToggle: '[data-popout-toggle]',
    popoutInput: '[data-popout-input]',
    popoutOptions: '[data-popout-option]',
    popoutPrevent: 'data-popout-prevent',
    popoutQuantity: 'data-quantity-field',
    dataValue: 'data-value',
    ariaExpanded: 'aria-expanded',
    ariaCurrent: 'aria-current',
  };

  const classes$9 = {
    listVisible: 'popout-list--visible',
    currentSuffix: '--current',
  };

  let sections$f = {};

  class Popout {
    constructor(popout) {
      this.container = popout;
      this.popoutList = this.container.querySelector(selectors$t.popoutList);
      this.popoutToggle = this.container.querySelector(selectors$t.popoutToggle);
      this.popoutInput = this.container.querySelector(selectors$t.popoutInput);
      this.popoutOptions = this.container.querySelectorAll(selectors$t.popoutOptions);
      this.popoutPrevent = this.container.getAttribute(selectors$t.popoutPrevent) === 'true';

      this._connectOptions();
      this._connectToggle();
      this._onFocusOut();

      if (this.popoutInput && this.popoutInput.hasAttribute(selectors$t.popoutQuantity)) {
        document.addEventListener('popout:updateValue', this.updatePopout.bind(this));
      }
    }

    unload() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.removeEventListener('clickDetails', this.popupOptionsClick.bind(this));
          element.removeEventListener('click', this._connectOptionsDispatch.bind(this));
        });
      }

      this.popoutToggle.removeEventListener('click', this.popupToggleClick.bind(this));

      this.popoutToggle.removeEventListener('focusout', this.popupToggleFocusout.bind(this));

      this.popoutList.removeEventListener('focusout', this.popupListFocusout.bind(this));

      this.container.removeEventListener('keyup', this.containerKeyup.bind(this));
    }

    popupToggleClick(evt) {
      const ariaExpanded = evt.currentTarget.getAttribute(selectors$t.ariaExpanded) === 'true';
      evt.currentTarget.setAttribute(selectors$t.ariaExpanded, !ariaExpanded);
      this.popoutList.classList.toggle(classes$9.listVisible);
    }

    popupToggleFocusout(evt) {
      const popoutLostFocus = this.container.contains(evt.relatedTarget);

      if (!popoutLostFocus) {
        this._hideList();
      }
    }

    popupListFocusout(evt) {
      const childInFocus = evt.currentTarget.contains(evt.relatedTarget);
      const isVisible = this.popoutList.classList.contains(classes$9.listVisible);

      if (isVisible && !childInFocus) {
        this._hideList();
      }
    }

    popupOptionsClick(evt) {
      const link = evt.target.closest(selectors$t.popoutOptions);
      if (link.attributes.href.value === '#') {
        evt.preventDefault();

        let attrValue = '';

        if (evt.currentTarget.getAttribute(selectors$t.dataValue)) {
          attrValue = evt.currentTarget.getAttribute(selectors$t.dataValue);
        }

        this.popoutInput.value = attrValue;

        if (this.popoutPrevent) {
          this.popoutInput.dispatchEvent(new Event('change'));

          if (!evt.detail.preventTrigger && this.popoutInput.hasAttribute(selectors$t.popoutQuantity)) {
            this.popoutInput.dispatchEvent(new Event('input'));
          }

          const currentElement = this.popoutList.querySelector(`[class*="${classes$9.currentSuffix}"]`);
          let targetClass = classes$9.currentSuffix;

          if (currentElement && currentElement.classList.length) {
            for (const currentElementClass of currentElement.classList) {
              if (currentElementClass.includes(classes$9.currentSuffix)) {
                targetClass = currentElementClass;
                break;
              }
            }
          }

          const listTargetElement = this.popoutList.querySelector(`.${targetClass}`);

          if (listTargetElement) {
            listTargetElement.classList.remove(`${targetClass}`);
            evt.currentTarget.parentElement.classList.add(`${targetClass}`);
          }

          const targetAttribute = this.popoutList.querySelector(`[${selectors$t.ariaCurrent}]`);

          if (targetAttribute && targetAttribute.hasAttribute(`${selectors$t.ariaCurrent}`)) {
            targetAttribute.removeAttribute(`${selectors$t.ariaCurrent}`);
            evt.currentTarget.setAttribute(`${selectors$t.ariaCurrent}`, 'true');
          }

          if (attrValue !== '') {
            this.popoutToggle.textContent = attrValue;
          }

          this.popupToggleFocusout(evt);
          this.popupListFocusout(evt);
        } else {
          this._submitForm(attrValue);
        }
      }
    }

    updatePopout(evt) {
      const targetElement = this.popoutList.querySelector(`[${selectors$t.dataValue}="${this.popoutInput.value}"]`);
      if (targetElement) {
        targetElement.dispatchEvent(
          new CustomEvent('clickDetails', {
            cancelable: true,
            bubbles: true,
            detail: {
              preventTrigger: true,
            },
          })
        );
      }
    }

    containerKeyup(evt) {
      if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
        return;
      }
      this._hideList();
      this.popoutToggle.focus();
    }

    bodyClick(evt) {
      const isOption = this.container.contains(evt.target);
      const isVisible = this.popoutList.classList.contains(classes$9.listVisible);

      if (isVisible && !isOption) {
        this._hideList();
      }
    }

    _connectToggle() {
      this.popoutToggle.addEventListener('click', this.popupToggleClick.bind(this));
    }

    _connectOptions() {
      if (this.popoutOptions.length) {
        this.popoutOptions.forEach((element) => {
          element.addEventListener('clickDetails', this.popupOptionsClick.bind(this));
          element.addEventListener('click', this._connectOptionsDispatch.bind(this));
        });
      }
    }

    _connectOptionsDispatch(evt) {
      const event = new CustomEvent('clickDetails', {
        cancelable: true,
        bubbles: true,
        detail: {
          preventTrigger: false,
        },
      });

      if (!evt.target.dispatchEvent(event)) {
        evt.preventDefault();
      }
    }

    _onFocusOut() {
      this.popoutToggle.addEventListener('focusout', this.popupToggleFocusout.bind(this));

      this.popoutList.addEventListener('focusout', this.popupListFocusout.bind(this));

      this.container.addEventListener('keyup', this.containerKeyup.bind(this));

      document.body.addEventListener('click', this.bodyClick.bind(this));
    }

    _submitForm(value) {
      const form = this.container.closest('form');
      if (form) {
        form.submit();
      }
    }

    _hideList() {
      this.popoutList.classList.remove(classes$9.listVisible);
      this.popoutToggle.setAttribute(selectors$t.ariaExpanded, false);
    }
  }

  const popoutSection = {
    onLoad() {
      sections$f[this.id] = [];
      const wrappers = this.container.querySelectorAll(selectors$t.popoutWrapper);
      wrappers.forEach((wrapper) => {
        sections$f[this.id].push(new Popout(wrapper));
      });
    },
    onUnload() {
      sections$f[this.id].forEach((popout) => {
        if (typeof popout.unload === 'function') {
          popout.unload();
        }
      });
    },
  };

  const selectors$s = {
    slideruleOpen: 'data-sliderule-open',
    slideruleClose: 'data-sliderule-close',
    sliderulePane: 'data-sliderule-pane',
    slideruleWrappper: '[data-sliderule]',
    focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    children: `:scope > [data-animates], 
             :scope > * > [data-animates], 
             :scope > * > * >[data-animates],
             :scope > * > .sliderule-grid  > *`,
  };

  const classes$8 = {
    isVisible: 'is-visible',
  };

  let sections$e = {};

  class HeaderMobileSliderule {
    constructor(el) {
      this.sliderule = el;
      this.wrapper = el.closest(selectors$s.wrapper);
      this.key = this.sliderule.id;
      const btnSelector = `[${selectors$s.slideruleOpen}='${this.key}']`;
      const exitSelector = `[${selectors$s.slideruleClose}='${this.key}']`;
      this.trigger = document.querySelector(btnSelector);
      this.exit = document.querySelector(exitSelector);
      this.pane = document.querySelector(`[${selectors$s.sliderulePane}]`);
      this.children = this.sliderule.querySelectorAll(selectors$s.children);

      this.trigger.setAttribute('aria-haspopup', true);
      this.trigger.setAttribute('aria-expanded', false);
      this.trigger.setAttribute('aria-controls', this.key);

      this.clickEvents();
      this.staggerChildAnimations();

      document.addEventListener('theme:sliderule:close', this.closeSliderule.bind(this));
    }

    clickEvents() {
      this.trigger.addEventListener(
        'click',
        function () {
          this.showSliderule();
        }.bind(this)
      );
      this.exit.addEventListener(
        'click',
        function () {
          this.hideSliderule();
        }.bind(this)
      );
    }

    keyboardEvents() {
      this.trigger.addEventListener(
        'keyup',
        function (evt) {
          if (evt.which !== window.theme.keyboardKeys.SPACE) {
            return;
          }
          this.showSliderule();
        }.bind(this)
      );
      this.sliderule.addEventListener(
        'keyup',
        function (evt) {
          if (evt.which !== window.theme.keyboardKeys.ESCAPE) {
            return;
          }
          this.hideSliderule();
          this.buttons[0].focus();
        }.bind(this)
      );
    }

    staggerChildAnimations() {
      this.children.forEach((child, index) => {
        child.style.transitionDelay = `${index * 50 + 10}ms`;
      });
    }

    hideSliderule() {
      this.pane.style.setProperty('--sliderule-height', 'auto');
      this.sliderule.classList.remove(classes$8.isVisible);
      this.children.forEach((el) => {
        el.classList.remove(classes$8.isVisible);
      });
      const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) - 1;
      this.pane.setAttribute(selectors$s.sliderulePane, newPosition);
    }

    showSliderule() {
      this.pane.style.setProperty('--sliderule-height', 'auto');
      this.sliderule.classList.add(classes$8.isVisible);
      this.children.forEach((el) => {
        el.classList.add(classes$8.isVisible);
      });
      const newPosition = parseInt(this.pane.dataset.sliderulePane, 10) + 1;
      this.pane.setAttribute(selectors$s.sliderulePane, newPosition);

      const newHeight = parseInt(this.trigger.nextElementSibling.offsetHeight);
      this.pane.style.setProperty('--sliderule-height', `${newHeight}px`);
    }

    closeSliderule() {
      if (this.pane && this.pane.hasAttribute(selectors$s.sliderulePane) && parseInt(this.pane.getAttribute(selectors$s.sliderulePane)) > 0) {
        this.hideSliderule();
        if (parseInt(this.pane.getAttribute(selectors$s.sliderulePane)) > 0) {
          this.pane.setAttribute(selectors$s.sliderulePane, 0);
        }
      }
    }
  }

  const headerMobileSliderule = {
    onLoad() {
      sections$e[this.id] = [];
      const els = this.container.querySelectorAll(selectors$s.slideruleWrappper);
      els.forEach((el) => {
        sections$e[this.id].push(new HeaderMobileSliderule(el));
      });
    },
  };

  const showElement = (elem, removeProp = false, prop = 'block') => {
    if (elem) {
      if (removeProp) {
        elem.style.removeProperty('display');
      } else {
        elem.style.display = prop;
      }
    }
  };

  const selectors$r = {
    accordionGroup: '[data-accordion-group]',
    accordionToggle: 'data-accordion-trigger',
    accordionBody: '[data-accordion-body]',
    accordionBodyMobile: 'data-accordion-body-mobile',
    rangeSlider: 'data-range-holder',
    section: '[data-section-id]',
  };

  const classes$7 = {
    open: 'accordion-is-open',
  };

  let sections$d = {};

  class Accordion {
    constructor(el) {
      this.body = el;
      this.key = this.body.id;
      const btnSelector = `[${selectors$r.accordionToggle}='${this.key}']`;
      this.trigger = document.querySelector(btnSelector);

      this.toggleEvent = (e) => this.clickEvents(e);
      this.keyboardEvent = (e) => this.keyboardEvents(e);
      this.hideEvent = () => this.hideEvents();

      this.syncBodies = this.getSiblings();

      if (this.body.hasAttribute(selectors$r.accordionBodyMobile)) {
        this.mobileAccordions();
      } else {
        this.init();
      }
    }

    mobileAccordions() {
      if (window.innerWidth < window.theme.sizes.medium) {
        this.init();
        this.setDefaultState();
      } else {
        this.resetMobileAccordions();
        this.body.removeAttribute('style');
      }

      document.addEventListener('theme:resize', () => {
        if (window.innerWidth < window.theme.sizes.medium) {
          this.init();
          this.setDefaultState();
        } else {
          this.resetMobileAccordions();
          this.body.removeAttribute('style');
        }
      });
    }

    init() {
      this.trigger.setAttribute('aria-haspopup', true);
      this.trigger.setAttribute('aria-expanded', false);
      this.trigger.setAttribute('aria-controls', this.key);

      this.setDefaultState();

      this.trigger.addEventListener('click', this.toggleEvent);
      this.body.addEventListener('keyup', this.keyboardEvent);
      this.body.addEventListener('theme:accordion:close', this.hideEvent);
    }

    hideEvents() {
      this.hideAccordion();
    }

    clickEvents(e) {
      e.preventDefault();
      this.toggleState();
    }

    keyboardEvents(e) {
      if (e.which !== window.theme.keyboardKeys.ESCAPE) {
        return;
      }
      this.hideAccordion();
      this.trigger.focus();
    }

    resetMobileAccordions() {
      this.trigger.removeEventListener('click', this.toggleEvent);
      this.body.removeEventListener('keyup', this.keyboardEvent);
      this.body.removeEventListener('theme:accordion:close', this.hideEvent);
    }

    setDefaultState() {
      if (this.trigger.classList.contains(classes$7.open)) {
        showElement(this.body);
      } else {
        this.hideAccordion();
      }
    }

    getSiblings() {
      const section = this.body.closest(selectors$r.section);
      const groupsArray = [...section.querySelectorAll(selectors$r.accordionGroup)];
      const syncWrapper = groupsArray.filter((el) => el.contains(this.body)).shift();
      if (syncWrapper) {
        const allChilden = [...syncWrapper.querySelectorAll(selectors$r.accordionBody)];
        const onlySiblings = allChilden.filter((el) => !el.contains(this.body));
        return onlySiblings;
      } else return [];
    }

    closeSiblings() {
      this.syncBodies.forEach((accordionBody) => {
        accordionBody.dispatchEvent(new CustomEvent('theme:accordion:close', {bubbles: false}));
      });
    }

    toggleState() {
      if (this.trigger.classList.contains(classes$7.open)) {
        this.hideAccordion();
      } else {
        this.showAccordion();
        this.closeSiblings();

        // Collection filters
        // Accordion with range slider custom event to reload
        if (this.body.hasAttribute(selectors$r.rangeSlider)) {
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('theme:reset-price-range', {bubbles: false}));
          }, 400);
        }
      }
    }

    hideAccordion() {
      this.trigger.classList.remove(classes$7.open);
      slideUp(this.body);
    }

    showAccordion() {
      this.trigger.classList.add(classes$7.open);
      slideDown(this.body);
    }

    onBlockSelect(evt) {
      if (this.body.contains(evt.target)) {
        this.showAccordion();
      }
    }

    onBlockDeselect(evt) {
      if (this.body.contains(evt.target)) {
        this.hideAccordion();
      }
    }
  }

  const accordion = {
    onLoad() {
      sections$d[this.id] = [];
      const els = this.container.querySelectorAll(selectors$r.accordionBody);
      els.forEach((el) => {
        sections$d[this.id].push(new Accordion(el));
      });
    },
    onUnload: function () {
      sections$d[this.id].forEach((el) => {
        if (typeof el.unload === 'function') {
          el.unload();
        }
      });
    },
    onSelect: function () {
      if (this.type === 'accordion-single') {
        this.container.querySelector(`[${selectors$r.accordionToggle}]`).click();
      }
    },
    onDeselect: function () {
      if (this.type === 'accordion-single') {
        this.container.querySelector(`[${selectors$r.accordionToggle}]`).click();
      }
    },
    onBlockSelect(evt) {
      sections$d[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(evt);
        }
      });
    },
    onBlockDeselect(evt) {
      sections$d[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockDeselect(evt);
        }
      });
    },
  };

  const selectors$q = {
    wrapper: '[data-header-wrapper]',
    html: 'html',
    style: 'data-header-style',
    widthContentWrapper: '[data-takes-space-wrapper]',
    widthContent: '[data-child-takes-space]',
    desktop: '[data-header-desktop]',
    cloneClass: 'js__header__clone',
    showMobileClass: 'js__show__mobile',
    backfill: '[data-header-backfill]',
    transparent: 'data-header-transparent',
    overrideBorder: 'header-override-border',
    firstSectionHasImage: '.main-content > .shopify-section:first-child [data-overlay-header]',
    preventTransparentHeader: '.main-content > .shopify-section:first-child [data-prevent-transparent-header]',
    deadLink: '.navlink[href="#"]',
  };

  let sections$c = {};

  class Header {
    constructor(el) {
      this.wrapper = el;
      this.html = document.querySelector(selectors$q.html);
      this.style = this.wrapper.dataset.style;
      this.desktop = this.wrapper.querySelector(selectors$q.desktop);
      this.isTransparentHeader = this.wrapper.getAttribute(selectors$q.transparent) !== 'false';
      this.overlayedImages = document.querySelectorAll(selectors$q.firstSectionHasImage);
      this.deadLinks = document.querySelectorAll(selectors$q.deadLink);
      this.resizeEventWidth = () => this.checkWidth();
      this.resizeEventOverlay = () => this.subtractAnnouncementHeight();

      this.killDeadLinks();
      if (this.style !== 'drawer' && this.desktop) {
        this.minWidth = this.getMinWidth();
        this.listenWidth();
      }
      this.checkForImage();

      document.addEventListener('header:check', this.checkForImage.bind(this));
      this.html.style.setProperty('--scrollbar-width', `${window.innerWidth - this.html.clientWidth}px`);
    }

    unload() {
      document.removeEventListener('theme:resize:width', this.resizeEventWidth);
      document.removeEventListener('theme:resize:width', this.resizeEventOverlay);
    }

    checkForImage() {
      // check again for overlayed images
      this.overlayedImages = document.querySelectorAll(selectors$q.firstSectionHasImage);
      let preventTransparentHeader = document.querySelectorAll(selectors$q.preventTransparentHeader).length;

      if (this.overlayedImages.length && !preventTransparentHeader && this.isTransparentHeader) {
        // is transparent and has image, overlay the image
        this.listenOverlay();
        this.wrapper.setAttribute(selectors$q.transparent, true);
        document.querySelector(selectors$q.backfill).style.display = 'none';
        theme.transparentHeader = true;
      } else {
        this.wrapper.setAttribute(selectors$q.transparent, false);
        document.querySelector(selectors$q.backfill).style.display = 'block';
        theme.transparentHeader = false;
      }

      if (this.overlayedImages.length && !preventTransparentHeader && !this.isTransparentHeader) {
        // Have image but not transparent, remove border bottom
        this.wrapper.classList.add(selectors$q.overrideBorder);
        this.subtractHeaderHeight();
      }
    }

    listenOverlay() {
      document.addEventListener('theme:resize:width', this.resizeEventOverlay);
      this.subtractAnnouncementHeight();
    }

    listenWidth() {
      document.addEventListener('theme:resize:width', this.resizeEventWidth);
      this.checkWidth();
    }

    killDeadLinks() {
      this.deadLinks.forEach((el) => {
        el.onclick = (e) => {
          e.preventDefault();
        };
      });
    }

    subtractAnnouncementHeight() {
      const {windowHeight, announcementHeight, headerHeight} = readHeights();
      this.overlayedImages.forEach((el) => {
        el.style.setProperty('--full-screen', `${windowHeight - announcementHeight}px`);
        el.style.setProperty('--header-padding', `${headerHeight}px`);
        el.classList.add('has-overlay');
      });
    }

    subtractHeaderHeight() {
      const {windowHeight, headerHeight} = readHeights();
      this.overlayedImages.forEach((el) => {
        el.style.setProperty('--full-screen', `${windowHeight - headerHeight}px`);
      });
    }

    checkWidth() {
      if (document.body.clientWidth < this.minWidth) {
        this.wrapper.classList.add(selectors$q.showMobileClass);
      } else {
        this.wrapper.classList.remove(selectors$q.showMobileClass);
      }
    }

    getMinWidth() {
      const comparitor = this.wrapper.cloneNode(true);
      comparitor.classList.add(selectors$q.cloneClass);
      document.body.appendChild(comparitor);
      const widthWrappers = comparitor.querySelectorAll(selectors$q.widthContentWrapper);
      let minWidth = 0;
      let spaced = 0;

      widthWrappers.forEach((context) => {
        const wideElements = context.querySelectorAll(selectors$q.widthContent);
        let thisWidth = 0;
        if (wideElements.length === 3) {
          thisWidth = _sumSplitWidths(wideElements);
        } else {
          thisWidth = _sumWidths(wideElements);
        }
        if (thisWidth > minWidth) {
          minWidth = thisWidth;
          spaced = wideElements.length * 20;
        }
      });

      document.body.removeChild(comparitor);
      return minWidth + spaced;
    }
  }

  function _sumSplitWidths(nodes) {
    let arr = [];
    nodes.forEach((el) => {
      if (el.firstElementChild) {
        arr.push(el.firstElementChild.clientWidth);
      }
    });
    if (arr[0] > arr[2]) {
      arr[2] = arr[0];
    } else {
      arr[0] = arr[2];
    }
    const width = arr.reduce((a, b) => a + b);
    return width;
  }
  function _sumWidths(nodes) {
    let width = 0;
    nodes.forEach((el) => {
      width += el.clientWidth;
    });
    return width;
  }

  const header = {
    onLoad() {
      sections$c = new Header(this.container);

      setVarsOnResize();
    },
    onUnload() {
      if (typeof sections$c.unload === 'function') {
        sections$c.unload();
      }
    },
  };

  register('header', [header, drawer, popoutSection, headerMobileSliderule, cartDrawer, stickyHeader, hoverDisclosure, headerTotals, searchPopdown, searchResultsGlobal, accordion]);

  register('accordion', accordion);

  const hideElement = (elem) => {
    if (elem) {
      elem.style.display = 'none';
    }
  };

  function Listeners() {
    this.entries = [];
  }

  Listeners.prototype.add = function (element, event, fn) {
    this.entries.push({element: element, event: event, fn: fn});
    element.addEventListener(event, fn);
  };

  Listeners.prototype.removeAll = function () {
    this.entries = this.entries.filter(function (listener) {
      listener.element.removeEventListener(listener.event, listener.fn);
      return false;
    });
  };

  /**
   * Find a match in the project JSON (using a ID number) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Number} value Accepts Number (e.g. 6908023078973)
   * @returns {Object} The variant object once a match has been successful. Otherwise null will be return
   */

  /**
   * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromSerializedArray(product, collection) {
    _validateProductStructure(product);

    // If value is an array of options
    var optionArray = _createOptionArrayFromOptionCollection(product, collection);
    return getVariantFromOptionArray(product, optionArray);
  }

  /**
   * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
   * @param {Object} product Product JSON object
   * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
   * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
   */
  function getVariantFromOptionArray(product, options) {
    _validateProductStructure(product);
    _validateOptionsArray(options);

    var result = product.variants.filter(function (variant) {
      return options.every(function (option, index) {
        return variant.options[index] === option;
      });
    });

    return result[0] || null;
  }

  /**
   * Creates an array of selected options from the object
   * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
   * @param {Object} product Product JSON object
   * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
   * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
   */
  function _createOptionArrayFromOptionCollection(product, collection) {
    _validateProductStructure(product);
    _validateSerializedArray(collection);

    var optionArray = [];

    collection.forEach(function (option) {
      for (var i = 0; i < product.options.length; i++) {
        var name = product.options[i].name || product.options[i];
        if (name.toLowerCase() === option.name.toLowerCase()) {
          optionArray[i] = option.value;
          break;
        }
      }
    });

    return optionArray;
  }

  /**
   * Check if the product data is a valid JS object
   * Error will be thrown if type is invalid
   * @param {object} product Product JSON object
   */
  function _validateProductStructure(product) {
    if (typeof product !== 'object') {
      throw new TypeError(product + ' is not an object.');
    }

    if (Object.keys(product).length === 0 && product.constructor === Object) {
      throw new Error(product + ' is empty.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted like jQuery's serializeArray()
   * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
   */
  function _validateSerializedArray(collection) {
    if (!Array.isArray(collection)) {
      throw new TypeError(collection + ' is not an array.');
    }

    if (collection.length === 0) {
      throw new Error(collection + ' is empty.');
    }

    if (collection[0].hasOwnProperty('name')) {
      if (typeof collection[0].name !== 'string') {
        throw new TypeError('Invalid value type passed for name of option ' + collection[0].name + '. Value should be string.');
      }
    } else {
      throw new Error(collection[0] + 'does not contain name key.');
    }
  }

  /**
   * Validate the structure of the array
   * It must be formatted as list of values
   * @param {Array} collection Array of object (e.g. ['36', 'Black'])
   */
  function _validateOptionsArray(options) {
    if (Array.isArray(options) && typeof options[0] === 'object') {
      throw new Error(options + 'is not a valid array of options.');
    }
  }

  var selectors$p = {
    idInput: '[name="id"]',
    planInput: '[name="selling_plan"]',
    optionInput: '[name^="options"]',
    quantityInput: '[name="quantity"]',
    propertyInput: '[name^="properties"]',
  };

  // Public Methods
  // -----------------------------------------------------------------------------

  /**
   * Returns a URL with a variant ID query parameter. Useful for updating window.history
   * with a new URL based on the currently select product variant.
   * @param {string} url - The URL you wish to append the variant ID to
   * @param {number} id  - The variant ID you wish to append to the URL
   * @returns {string} - The new url which includes the variant ID query parameter
   */

  function getUrlWithVariant(url, id) {
    if (/variant=/.test(url)) {
      return url.replace(/(variant=)[^&]+/, '$1' + id);
    } else if (/\?/.test(url)) {
      return url.concat('&variant=').concat(id);
    }

    return url.concat('?variant=').concat(id);
  }

  /**
   * Constructor class that creates a new instance of a product form controller.
   *
   * @param {Element} element - DOM element which is equal to the <form> node wrapping product form inputs
   * @param {Object} product - A product object
   * @param {Object} options - Optional options object
   * @param {Function} options.onOptionChange - Callback for whenever an option input changes
   * @param {Function} options.onPlanChange - Callback for changes to name=selling_plan
   * @param {Function} options.onQuantityChange - Callback for whenever an quantity input changes
   * @param {Function} options.onPropertyChange - Callback for whenever a property input changes
   * @param {Function} options.onFormSubmit - Callback for whenever the product form is submitted
   */
  class ProductForm {
    constructor(element, product, options) {
      this.element = element;
      this.form = this.element.tagName == 'FORM' ? this.element : this.element.querySelector('form');
      this.product = this._validateProductObject(product);
      this.variantElement = this.element.querySelector(selectors$p.idInput);

      options = options || {};

      this._listeners = new Listeners();
      this._listeners.add(this.element, 'submit', this._onSubmit.bind(this, options));

      this.optionInputs = this._initInputs(selectors$p.optionInput, options.onOptionChange);

      this.planInputs = this._initInputs(selectors$p.planInput, options.onPlanChange);

      this.quantityInputs = this._initInputs(selectors$p.quantityInput, options.onQuantityChange);

      this.propertyInputs = this._initInputs(selectors$p.propertyInput, options.onPropertyChange);
    }

    /**
     * Cleans up all event handlers that were assigned when the Product Form was constructed.
     * Useful for use when a section needs to be reloaded in the theme editor.
     */
    destroy() {
      this._listeners.removeAll();
    }

    /**
     * Getter method which returns the array of currently selected option values
     *
     * @returns {Array} An array of option values
     */
    options() {
      return this._serializeInputValues(this.optionInputs, function (item) {
        var regex = /(?:^(options\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'
        return item;
      });
    }

    /**
     * Getter method which returns the currently selected variant, or `null` if variant
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */
    variant() {
      const opts = this.options();
      if (opts.length) {
        return getVariantFromSerializedArray(this.product, opts);
      } else {
        return this.product.variants[0];
      }
    }

    /**
     * Getter method which returns the current selling plan, or `null` if plan
     * doesn't exist.
     *
     * @returns {Object|null} Variant object
     */
    plan(variant) {
      let plan = {
        allocation: null,
        group: null,
        detail: null,
      };
      const formData = new FormData(this.form);
      const id = formData.get('selling_plan');

      if (id && variant) {
        plan.allocation = variant.selling_plan_allocations.find(function (item) {
          return item.selling_plan_id.toString() === id.toString();
        });
      }
      if (plan.allocation) {
        plan.group = this.product.selling_plan_groups.find(function (item) {
          return item.id.toString() === plan.allocation.selling_plan_group_id.toString();
        });
      }
      if (plan.group) {
        plan.detail = plan.group.selling_plans.find(function (item) {
          return item.id.toString() === id.toString();
        });
      }

      if (plan && plan.allocation && plan.detail && plan.allocation) {
        return plan;
      } else return null;
    }

    /**
     * Getter method which returns a collection of objects containing name and values
     * of property inputs
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    properties() {
      return this._serializeInputValues(this.propertyInputs, function (item) {
        var regex = /(?:^(properties\[))(.*?)(?:\])/;
        item.name = regex.exec(item.name)[2]; // Use just the value between 'properties[' and ']'
        return item;
      });
    }

    /**
     * Getter method which returns the current quantity or 1 if no quantity input is
     * included in the form
     *
     * @returns {Array} Collection of objects with name and value keys
     */
    quantity() {
      return this.quantityInputs[0] ? Number.parseInt(this.quantityInputs[0].value, 10) : 1;
    }

    getFormState() {
      const variant = this.variant();
      return {
        options: this.options(),
        variant: variant,
        properties: this.properties(),
        quantity: this.quantity(),
        plan: this.plan(variant),
      };
    }

    // Private Methods
    // -----------------------------------------------------------------------------
    _setIdInputValue(variant) {
      if (variant && variant.id) {
        this.variantElement.value = variant.id.toString();
      } else {
        this.variantElement.value = '';
      }
      this.variantElement.dispatchEvent(new Event('change'));
    }

    _onSubmit(options, event) {
      event.dataset = this.getFormState();
      if (options.onFormSubmit) {
        options.onFormSubmit(event);
      }
    }

    _onOptionChange(event) {
      this._setIdInputValue(event.dataset.variant);
    }

    _onFormEvent(cb) {
      if (typeof cb === 'undefined') {
        return Function.prototype;
      }

      return function (event) {
        event.dataset = this.getFormState();
        this._setIdInputValue(event.dataset.variant);
        cb(event);
      }.bind(this);
    }

    _initInputs(selector, cb) {
      var elements = Array.prototype.slice.call(this.element.querySelectorAll(selector));

      return elements.map(
        function (element) {
          this._listeners.add(element, 'change', this._onFormEvent(cb));
          return element;
        }.bind(this)
      );
    }

    _serializeInputValues(inputs, transform) {
      return inputs.reduce(function (options, input) {
        if (
          input.checked || // If input is a checked (means type radio or checkbox)
          (input.type !== 'radio' && input.type !== 'checkbox') // Or if its any other type of input
        ) {
          options.push(transform({name: input.name, value: input.value}));
        }

        return options;
      }, []);
    }

    _validateProductObject(product) {
      if (typeof product !== 'object') {
        throw new TypeError(product + ' is not an object.');
      }

      if (typeof product.variants[0].options === 'undefined') {
        throw new TypeError('Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route');
      }
      return product;
    }
  }

  function getProductJson(handle) {
    const requestRoute = `${window.theme.routes.root_url}products/${handle}.js`;
    return window
      .fetch(requestRoute)
      .then((response) => {
        return response.json();
      })
      .catch((e) => {
        console.error(e);
      });
  }

  function getScript(url, callback, callbackError) {
    let head = document.getElementsByTagName('head')[0];
    let done = false;
    let script = document.createElement('script');
    script.src = url;

    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function () {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        callback();
      } else {
        callbackError();
      }
    };

    head.appendChild(script);
  }

  const loaders$1 = {};

  function loadScript$1(options = {}) {
    if (!options.type) {
      options.type = 'json';
    }

    if (options.url) {
      if (loaders$1[options.url]) {
        return loaders$1[options.url];
      } else {
        return getScriptWithPromise$1(options.url, options.type);
      }
    } else if (options.json) {
      if (loaders$1[options.json]) {
        return Promise.resolve(loaders$1[options.json]);
      } else {
        return window
          .fetch(options.json)
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            loaders$1[options.json] = response;
            return response;
          });
      }
    } else if (options.name) {
      const key = ''.concat(options.name, options.version);
      if (loaders$1[key]) {
        return loaders$1[key];
      } else {
        return loadShopifyWithPromise$1(options);
      }
    } else {
      return Promise.reject();
    }
  }

  function getScriptWithPromise$1(url, type) {
    const loader = new Promise((resolve, reject) => {
      if (type === 'text') {
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        getScript(
          url,
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      }
    });

    loaders$1[url] = loader;
    return loader;
  }

  function loadShopifyWithPromise$1(options) {
    const key = ''.concat(options.name, options.version);
    const loader = new Promise((resolve, reject) => {
      try {
        window.Shopify.loadFeatures([
          {
            name: options.name,
            version: options.version,
            onLoad: (err) => {
              onLoadFromShopify$1(resolve, reject, err);
            },
          },
        ]);
      } catch (err) {
        reject(err);
      }
    });
    loaders$1[key] = loader;
    return loader;
  }

  function onLoadFromShopify$1(resolve, reject, err) {
    if (err) {
      return reject(err);
    } else {
      return resolve();
    }
  }

  const defaults = {
    color: 'ash',
  };

  const selectors$o = {
    swatch: 'data-swatch',
    outerGrid: '[data-grid-item]',
    slide: '[data-grid-slide',
    image: 'data-swatch-image',
    variant: 'data-swatch-variant',
    button: '[data-swatch-button]',
    link: '[data-grid-link]',
    wrapper: '[data-grid-swatches]',
    template: '[data-swatch-template]',
    handle: 'data-swatch-handle',
    label: 'data-swatch-label',
  };

  class ColorMatch {
    constructor(options = {}) {
      this.settings = {
        ...defaults,
        ...options,
      };

      this.match = this.init();
    }

    getColor() {
      return this.match;
    }

    init() {
      const getColors = loadScript$1({json: window.theme.assets.swatches});
      return getColors
        .then((colors) => {
          return this.matchColors(colors, this.settings.color);
        })
        .catch((e) => {
          console.log('failed to load swatch colors script');
          console.log(e);
        });
    }

    matchColors(colors, name) {
      let bg = '#E5E5E5';
      let img = null;
      const path = window.theme.assets.base || '/';
      const comparisonName = name.toLowerCase().replace(/\s/g, '');
      const array = colors.colors;
      if (array) {
        const variantNameMatch = (nameObject) => {
          const indexName = Object.keys(nameObject).toString();
          const neatName = indexName.toLowerCase().replace(/\s/g, '');
          return neatName === comparisonName;
        };
        const position = array.findIndex(variantNameMatch);
        if (position > -1) {
          const value = Object.values(array[position])[0];
          if (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.svg')) {
            img = `${path}${value}`;
            bg = '#888888';
          } else {
            bg = value;
          }
        }
      }
      return {
        color: this.settings.color,
        path: img,
        hex: bg,
      };
    }
  }

  class Swatch {
    constructor(element) {
      this.element = element;
      this.colorString = element.getAttribute(selectors$o.swatch);
      this.image = element.getAttribute(selectors$o.image);
      this.variant = element.getAttribute(selectors$o.variant);
      const matcher = new ColorMatch({color: this.colorString});
      matcher.getColor().then((result) => {
        this.colorMatch = result;
        this.init();
      });
    }

    init() {
      this.setStyles();
      if (this.variant) {
        this.handleClicks();
      }
    }

    setStyles() {
      if (this.colorMatch.hex) {
        this.element.style.setProperty('--swatch', `${this.colorMatch.hex}`);
      }
      if (this.colorMatch.path) {
        this.element.style.setProperty('background-image', `url(${this.colorMatch.path})`);
        this.element.style.setProperty('background-size', 'cover');
      }
    }

    handleClicks() {
      this.outer = this.element.closest(selectors$o.outerGrid);
      this.slide = this.outer.querySelector(selectors$o.slide);
      this.linkElement = this.outer.querySelector(selectors$o.link);
      this.linkDestination = getUrlWithVariant(this.linkElement.getAttribute('href'), this.variant);
      this.button = this.element.closest(selectors$o.button);
      this.button.addEventListener(
        'click',
        function () {
          this.linkElement.setAttribute('href', this.linkDestination);
          this.slide.setAttribute('src', this.linkDestination);
          if (this.image) {
            // container width rounded to the nearest 180 pixels
            // increses likelihood that the image will be cached
            let ratio = window.devicePixelRatio || 1;
            let pixels = this.slide.offsetWidth * ratio;
            let widthRounded = Math.ceil(pixels / 180) * 180;
            let sizedImage = getSizedImageUrl(this.image, `${widthRounded}x`);
            window
              .fetch(sizedImage)
              .then((response) => {
                return response.blob();
              })
              .then((blob) => {
                var objectURL = URL.createObjectURL(blob);
                this.slide.style.setProperty('background-color', '#fff');
                this.slide.style.setProperty('background-image', `url("${objectURL}")`);
              })
              .catch((error) => {
                console.log(`Error: ${error}`);
              });
          }
        }.bind(this)
      );
    }
  }

  class GridSwatch {
    constructor(wrap) {
      this.template = document.querySelector(selectors$o.template).innerHTML;
      this.wrap = wrap;
      this.handle = wrap.getAttribute(selectors$o.handle);
      const label = wrap.getAttribute(selectors$o.label).trim().toLowerCase();
      getProductJson(this.handle).then((product) => {
        this.product = product;
        this.colorOption = product.options.find(function (element) {
          return element.name.toLowerCase() === label || null;
        });
        if (this.colorOption) {
          this.swatches = this.colorOption.values;
          this.init();
        }
      });
    }

    init() {
      this.wrap.innerHTML = '';
      this.swatches.forEach((swatch) => {
        let variant = this.product.variants.find((variant) => {
          return variant.options.includes(swatch);
        });
        const image = variant.featured_media ? variant.featured_media.preview_image.src : '';

        const rand = Math.floor(Math.random() * 9999);

        this.wrap.innerHTML += Sqrl__namespace.render(this.template, {
          color: swatch,
          uniq: `${this.product.id}-${variant.id}-${rand}`,
          variant: variant.id,
          image,
        });
      });
      this.swatchElements = this.wrap.querySelectorAll(`[${selectors$o.swatch}]`);
      this.swatchElements.forEach((el) => {
        new Swatch(el);
      });
    }
  }

  function makeGridSwatches(container) {
    const gridSwatchWrappers = container.querySelectorAll(selectors$o.wrapper);
    gridSwatchWrappers.forEach((wrap) => {
      new GridSwatch(wrap);
    });
  }

  const swatchSection = {
    onLoad() {
      this.swatches = [];
      const els = this.container.querySelectorAll(`[${selectors$o.swatch}]`);
      els.forEach((el) => {
        this.swatches.push(new Swatch(el));
      });
    },
  };

  const swatchGridSection = {
    onLoad() {
      makeGridSwatches(this.container);
    },
  };

  const throttle = (fn, wait) => {
    let prev, next;
    return function invokeFn(...args) {
      const now = Date.now();
      next = clearTimeout(next);
      if (!prev || now - prev >= wait) {
        // eslint-disable-next-line prefer-spread
        fn.apply(null, args);
        prev = now;
      } else {
        next = setTimeout(invokeFn.bind(null, ...args), wait - (now - prev));
      }
    };
  };

  const selectors$n = {
    filtersWrappper: 'data-filters',
    form: 'data-sidebar-filter-form',
    filtersHideDesktop: 'data-default-hide',
    filtersToggle: 'data-filters-toggle',
    focusable: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    groupHeading: 'data-group-heading',
    showMore: 'data-show-more',
    swatch: 'data-swatch',
  };

  const classes$6 = {
    show: 'drawer--visible',
    defaultVisible: 'filters--default-visible',
    hide: 'hidden',
    expand: 'is-expanded',
    hidden: 'is-hidden',
  };

  const sections$b = {};

  class Filters {
    constructor(filters) {
      this.container = filters;
      this.groupHeadings = this.container.querySelectorAll(`[${selectors$n.groupHeading}]`);
      this.showMoreButtons = this.container.querySelectorAll(`[${selectors$n.showMore}]`);
      this.form = this.container.querySelector(`[${selectors$n.form}]`);
      this.swatches = this.container.querySelectorAll(`[${selectors$n.swatch}]`);

      const triggerKey = this.form.getAttribute(selectors$n.form);
      const selector = `[${selectors$n.filtersToggle}='${triggerKey}']`;
      this.filtersToggleButtons = document.querySelectorAll(selector);

      this.connectToggleMemory = (evt) => this.connectToggleFunction(evt);
      this.connectShowHiddenOptions = (evt) => this.showHiddenOptions(evt);

      this.connectToggle();
      this.expandingEvents();

      // Init Swatches
      if (this.swatches) {
        this.swatches.forEach((swatch) => {
          new Swatch(swatch);
        });
      }
    }

    unload() {
      if (this.filtersToggleButtons.length) {
        this.filtersToggleButtons.forEach((element) => {
          element.removeEventListener('click', this.connectToggleMemory);
        });
      }

      if (this.showMoreButtons.length) {
        this.showMoreButtons.forEach((button) => {
          button.addEventListener('click', this.connectShowHiddenOptions);
        });
      }
    }

    expandingEvents() {
      if (this.showMoreButtons.length) {
        this.showMoreButtons.forEach((button) => {
          button.addEventListener('click', throttle(this.connectShowHiddenOptions, 500));
        });
      }
    }

    showHiddenOptions(evt) {
      const element = evt.target.hasAttribute(selectors$n.showMore) ? evt.target : evt.target.closest(`[${selectors$n.showMore}]`);

      element.classList.add(classes$6.hidden);

      element.previousElementSibling.querySelectorAll(`.${classes$6.hidden}`).forEach((option) => {
        option.classList.remove(classes$6.hidden);
      });
    }

    connectToggle() {
      this.filtersToggleButtons.forEach((button) => {
        button.addEventListener('click', this.connectToggleMemory.bind(this));
      });
    }

    connectToggleFunction(evt) {
      if (window.innerWidth < window.theme.sizes.medium) {
        const ariaExpanded = evt.currentTarget.getAttribute('aria-expanded') === 'true';
        if (ariaExpanded) {
          this.hideFilters();
        } else {
          this.showFilters();
        }
      }
    }

    showFilters() {
      // animates after display none is removed
      setTimeout(() => {
        this.filtersToggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', true));
        this.filtersToggleButtons.forEach((btn) => btn.classList.add(classes$6.show));
        this.form.classList.add(classes$6.show);
        this.form.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
        this.form.querySelector(selectors$n.focusable).focus();
      }, 10);
    }

    hideFilters() {
      this.filtersToggleButtons.forEach((btn) => btn.setAttribute('aria-expanded', false));
      this.filtersToggleButtons.forEach((btn) => btn.classList.remove(classes$6.show));
      this.filtersToggleButtons.forEach((btn) => btn.classList.remove(classes$6.defaultVisible));
      this.form.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      this.form.classList.remove(classes$6.show);
    }
  }

  const collectionFiltersSidebar = {
    onLoad() {
      sections$b[this.id] = [];
      const wrappers = this.container.querySelectorAll(`[${selectors$n.filtersWrappper}]`);
      wrappers.forEach((wrapper) => {
        sections$b[this.id].push(new Filters(wrapper));
      });
    },
    onUnload: function () {
      sections$b[this.id].forEach((filters) => {
        if (typeof filters.unload === 'function') {
          filters.unload();
        }
      });
    },
  };

  const selectors$m = {
    rangeSlider: '[data-range-slider]',
    rangeDotLeft: '[data-range-left]',
    rangeDotRight: '[data-range-right]',
    rangeLine: '[data-range-line]',
    rangeHolder: '[data-range-holder]',
    dataMin: 'data-se-min',
    dataMax: 'data-se-max',
    dataMinValue: 'data-se-min-value',
    dataMaxValue: 'data-se-max-value',
    dataStep: 'data-se-step',
    dataFilterUpdate: 'data-range-filter-update',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
  };

  const classes$5 = {
    classInitialized: 'is-initialized',
  };

  class RangeSlider {
    constructor(section) {
      this.container = section.container;
      this.slider = section.querySelector(selectors$m.rangeSlider);

      if (this.slider) {
        this.onMoveEvent = (event) => this.onMove(event);
        this.onStopEvent = (event) => this.onStop(event);
        this.onStartEvent = (event) => this.onStart(event);
        this.onResize = () => this.setDefaultValues();
        this.startX = 0;
        this.x = 0;

        // retrieve touch button
        this.touchLeft = this.slider.querySelector(selectors$m.rangeDotLeft);
        this.touchRight = this.slider.querySelector(selectors$m.rangeDotRight);
        this.lineSpan = this.slider.querySelector(selectors$m.rangeLine);

        // get some properties
        this.min = parseFloat(this.slider.getAttribute(selectors$m.dataMin));
        this.max = parseFloat(this.slider.getAttribute(selectors$m.dataMax));

        this.step = 0.0;

        // normalize flag
        this.normalizeFact = 26;

        this.init();

        document.addEventListener('theme:reset-price-range', () => {
          this.setDefaultValues();
        });

        window.addEventListener('resize', this.onResize);
      }
    }

    init() {
      this.setDefaultValues();

      // link events
      this.touchLeft.addEventListener('mousedown', this.onStartEvent);
      this.touchRight.addEventListener('mousedown', this.onStartEvent);
      this.touchLeft.addEventListener('touchstart', this.onStartEvent);
      this.touchRight.addEventListener('touchstart', this.onStartEvent);

      // initialize
      this.slider.classList.add(classes$5.classInitialized);
    }

    setDefaultValues() {
      // retrieve default values
      let defaultMinValue = this.min;
      if (this.slider.hasAttribute(selectors$m.dataMinValue)) {
        defaultMinValue = parseFloat(this.slider.getAttribute(selectors$m.dataMinValue));
      }
      let defaultMaxValue = this.max;

      if (this.slider.hasAttribute(selectors$m.dataMaxValue)) {
        defaultMaxValue = parseFloat(this.slider.getAttribute(selectors$m.dataMaxValue));
      }

      // check values are correct
      if (defaultMinValue < this.min) {
        defaultMinValue = this.min;
      }

      if (defaultMaxValue > this.max) {
        defaultMaxValue = this.max;
      }

      if (defaultMinValue > defaultMaxValue) {
        defaultMinValue = defaultMaxValue;
      }

      if (this.slider.getAttribute(selectors$m.dataStep)) {
        this.step = Math.abs(parseFloat(this.slider.getAttribute(selectors$m.dataStep)));
      }

      // initial reset
      this.reset();

      // usefull values, min, max, normalize fact is the width of both touch buttons
      this.maxX = this.slider.offsetWidth - this.touchRight.offsetWidth;
      this.selectedTouch = null;
      this.initialValue = this.lineSpan.offsetWidth - this.normalizeFact;

      // set defualt values
      this.setMinValue(defaultMinValue);
      this.setMaxValue(defaultMaxValue);
    }

    reset() {
      this.touchLeft.style.left = '0px';
      this.touchRight.style.left = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.lineSpan.style.marginLeft = '0px';
      this.lineSpan.style.width = this.slider.offsetWidth - this.touchLeft.offsetWidth + 'px';
      this.startX = 0;
      this.x = 0;
    }

    setMinValue(minValue) {
      const ratio = (minValue - this.min) / (this.max - this.min);
      this.touchLeft.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact))) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$m.dataMinValue, minValue);
    }

    setMaxValue(maxValue) {
      const ratio = (maxValue - this.min) / (this.max - this.min);
      this.touchRight.style.left = Math.ceil(ratio * (this.slider.offsetWidth - (this.touchLeft.offsetWidth + this.normalizeFact)) + this.normalizeFact) + 'px';
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';
      this.slider.setAttribute(selectors$m.dataMaxValue, maxValue);
    }

    onStart(event) {
      // Prevent default dragging of selected content
      event.preventDefault();
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      if (event.currentTarget === this.touchLeft) {
        this.x = this.touchLeft.offsetLeft;
      } else {
        this.x = this.touchRight.offsetLeft;
      }

      this.startX = eventTouch.pageX - this.x;
      this.selectedTouch = event.currentTarget;
      this.slider.addEventListener('mousemove', this.onMoveEvent);
      this.slider.addEventListener('mouseup', this.onStopEvent);
      this.slider.addEventListener('touchmove', this.onMoveEvent);
      this.slider.addEventListener('touchend', this.onStopEvent);
    }

    onMove(event) {
      let eventTouch = event;

      if (event.touches) {
        eventTouch = event.touches[0];
      }

      this.x = eventTouch.pageX - this.startX;

      if (this.selectedTouch === this.touchLeft) {
        if (this.x > this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10) {
          this.x = this.touchRight.offsetLeft - this.selectedTouch.offsetWidth + 10;
        } else if (this.x < 0) {
          this.x = 0;
        }

        this.selectedTouch.style.left = this.x + 'px';
      } else if (this.selectedTouch === this.touchRight) {
        if (this.x < this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10) {
          this.x = this.touchLeft.offsetLeft + this.touchLeft.offsetWidth - 10;
        } else if (this.x > this.maxX) {
          this.x = this.maxX;
        }
        this.selectedTouch.style.left = this.x + 'px';
      }

      // update line span
      this.lineSpan.style.marginLeft = this.touchLeft.offsetLeft + 'px';
      this.lineSpan.style.width = this.touchRight.offsetLeft - this.touchLeft.offsetLeft + 'px';

      // write new value
      this.calculateValue();

      // call on change
      if (this.slider.getAttribute('on-change')) {
        const fn = new Function('min, max', this.slider.getAttribute('on-change'));
        fn(this.slider.getAttribute(selectors$m.dataMinValue), this.slider.getAttribute(selectors$m.dataMaxValue));
      }

      this.onChange(this.slider.getAttribute(selectors$m.dataMinValue), this.slider.getAttribute(selectors$m.dataMaxValue));
    }

    onStop(event) {
      this.slider.removeEventListener('mousemove', this.onMoveEvent);
      this.slider.removeEventListener('mouseup', this.onStopEvent);
      this.slider.removeEventListener('touchmove', this.onMoveEvent);
      this.slider.removeEventListener('touchend', this.onStopEvent);

      this.selectedTouch = null;

      // write new value
      this.calculateValue();

      // call did changed
      this.onChanged(this.slider.getAttribute(selectors$m.dataMinValue), this.slider.getAttribute(selectors$m.dataMaxValue));
    }

    onChange(min, max) {
      const rangeHolder = this.slider.closest(selectors$m.rangeHolder);
      if (rangeHolder) {
        const priceMin = rangeHolder.querySelector(selectors$m.priceMin);
        const priceMax = rangeHolder.querySelector(selectors$m.priceMax);

        if (priceMin && priceMax) {
          priceMin.value = min;
          priceMax.value = max;
        }
      }
    }

    onChanged(min, max) {
      if (this.slider.hasAttribute(selectors$m.dataFilterUpdate)) {
        this.slider.dispatchEvent(new CustomEvent('range:filter:update', {bubbles: true}));
      }
    }

    calculateValue() {
      const newValue = (this.lineSpan.offsetWidth - this.normalizeFact) / this.initialValue;
      let minValue = this.lineSpan.offsetLeft / this.initialValue;
      let maxValue = minValue + newValue;

      minValue = minValue * (this.max - this.min) + this.min;
      maxValue = maxValue * (this.max - this.min) + this.min;

      if (this.step !== 0.0) {
        let multi = Math.floor(minValue / this.step);
        minValue = this.step * multi;

        multi = Math.floor(maxValue / this.step);
        maxValue = this.step * multi;
      }

      if (this.selectedTouch === this.touchLeft) {
        this.slider.setAttribute(selectors$m.dataMinValue, minValue);
      }

      if (this.selectedTouch === this.touchRight) {
        this.slider.setAttribute(selectors$m.dataMaxValue, maxValue);
      }
    }

    unload() {
      window.removeEventListener('resize', this.onResize);
      this.touchLeft.removeEventListener('mousedown', this.onStartEvent);
      this.touchRight.removeEventListener('mousedown', this.onStartEvent);
      this.touchLeft.removeEventListener('touchstart', this.onStartEvent);
      this.touchRight.removeEventListener('touchstart', this.onStartEvent);
    }
  }

  const selectors$l = {
    form: '[data-sidebar-filter-form]',
    inputs: 'input, select, label, textarea',
    priceMin: '[data-field-price-min]',
    priceMax: '[data-field-price-max]',
    priceMinValue: 'data-field-price-min',
    priceMaxValue: 'data-field-price-max',
    rangeMin: '[data-se-min-value]',
    rangeMax: '[data-se-max-value]',
    rangeMinValue: 'data-se-min-value',
    rangeMaxValue: 'data-se-max-value',
  };

  class FiltersForm {
    constructor(section) {
      this.form = section.container.querySelector(selectors$l.form);
      this.filtersInputs = [];

      if (this.form) {
        new RangeSlider(this.form);
        this.filtersInputs = this.form.querySelectorAll(selectors$l.inputs);
        this.priceMin = this.form.querySelector(selectors$l.priceMin);
        this.priceMax = this.form.querySelector(selectors$l.priceMax);

        this.init();
      }
    }

    init() {
      if (this.filtersInputs.length) {
        this.filtersInputs.forEach((el) => {
          el.addEventListener(
            'input',
            debounce(() => {
              if (this.form && typeof this.form.submit === 'function') {
                if (this.priceMin && el.hasAttribute(selectors$l.priceMinValue) && !this.priceMax.value) {
                  this.priceMax.value = this.priceMax.placeholder;
                }

                if (this.priceMax && el.hasAttribute(selectors$l.priceMaxValue) && !this.priceMin.value) {
                  this.priceMin.value = this.priceMin.placeholder;
                }

                this.form.submit();
              }
            }, 500)
          );
        });
      }

      this.form.addEventListener('range:filter:update', () => this.updateRange());
    }

    updateRange() {
      if (this.form && typeof this.form.submit === 'function') {
        const rangeMin = this.form.querySelector(selectors$l.rangeMin);
        const rangeMax = this.form.querySelector(selectors$l.rangeMax);
        const priceMin = this.form.querySelector(selectors$l.priceMin);
        const priceMax = this.form.querySelector(selectors$l.priceMax);
        const checkElements = rangeMin && rangeMax && priceMin && priceMax;

        if (checkElements && rangeMin.hasAttribute(selectors$l.rangeMinValue) && rangeMax.hasAttribute(selectors$l.rangeMaxValue)) {
          const priceMinValue = parseInt(priceMin.placeholder);
          const priceMaxValue = parseInt(priceMax.placeholder);
          const rangeMinValue = parseInt(rangeMin.getAttribute(selectors$l.rangeMinValue));
          const rangeMaxValue = parseInt(rangeMax.getAttribute(selectors$l.rangeMaxValue));

          if (priceMinValue !== rangeMinValue || priceMaxValue !== rangeMaxValue) {
            priceMin.value = rangeMinValue;
            priceMax.value = rangeMaxValue;

            this.form.submit();
          }
        }
      }
    }
  }

  const collectionFiltersForm = {
    onLoad() {
      this.filterForm = new FiltersForm(this);
    },
    onUnload: function () {
      if (this.filterForm && typeof this.filterForm.unload === 'function') {
        this.filterForm.unload();
      }
    },
  };

  var selectors$k = {
    sort: '[data-sort-enabled]',
    sortLinks: '[data-sort-link]',
    sortValue: 'data-value',
    collectionNavGrouped: '.collection-nav--grouped',
    collectionSidebarHeading: '.collection__sidebar__heading',
    linkAdd: '.link--add',
    linkRemove: '.link--remove',
  };

  class Collection {
    constructor(section) {
      this.container = section.container;
      this.sort = this.container.querySelector(selectors$k.sort);
      this.sortLinks = this.container.querySelectorAll(selectors$k.sortLinks);
      this.init();
    }

    init() {
      if (this.sort) {
        this.initClick();
      }
      this.removeUnusableFilters();
    }

    onClick(e) {
      e.preventDefault();
      const sort = e.currentTarget.getAttribute(selectors$k.sortValue);
      const url = new window.URL(window.location.href);
      const params = url.searchParams;
      // params.set('sort_by', sort);
      url.search = params.toString();
      window.location.replace(url.toString());
    }

    initClick() {
      this.sortLinks.forEach((link) => {
        link.addEventListener(
          'click',
          function (e) {
            this.onClick(e);
          }.bind(this)
        );
      });
    }

    removeUnusableFilters() {
      const collectionNavGrouped = this.container.querySelectorAll(selectors$k.collectionNavGrouped);
      if (collectionNavGrouped.length > 0) {
        collectionNavGrouped.forEach((element) => {
          const linkAdd = element.querySelector(selectors$k.linkAdd);
          const linkRemove = element.querySelector(selectors$k.linkRemove);

          if (!linkAdd && !linkRemove) {
            hideElement(element);
            hideElement(element.parentElement.querySelector(selectors$k.collectionSidebarHeading));
          }
        });
      }
    }
  }

  const collectionSection = {
    onLoad() {
      this.collection = new Collection(this);
    },
  };

  register('collection', [collectionSection, popoutSection, swatchGridSection, collectionFiltersSidebar, collectionFiltersForm, accordion]);

  const selectors$j = {
    holderItems: '[data-custom-scrollbar-items]',
    scrollbar: '[data-custom-scrollbar]',
    scrollbarTrack: '[data-custom-scrollbar-track]',
    widthTrackInPercentage: '96',
  };

  class CustomScrollbar {
    constructor(holder) {
      this.holderItems = holder.querySelector(selectors$j.holderItems);
      this.scrollbar = holder.querySelector(selectors$j.scrollbar);
      this.scrollbarTrack = holder.querySelector(selectors$j.scrollbarTrack);
      this.trackWidth = 0;

      if (this.scrollbar && this.holderItems) {
        this.events();
        this.calculateTrackWidth();
      }
    }

    events() {
      this.holderItems.addEventListener('scroll', this.calculatePosition.bind(this));
      document.addEventListener('theme:resize', this.calculateTrackWidth.bind(this));
    }

    calculateTrackWidth() {
      setTimeout(() => {
        this.trackWidth = selectors$j.widthTrackInPercentage / this.holderItems.children.length;
        this.trackWidth = this.trackWidth < 5 ? 5 : this.trackWidth;
        this.scrollbar.style.setProperty('--track-width', `${this.trackWidth}%`);
      }, 100);
    }

    calculatePosition() {
      let position = this.holderItems.scrollLeft / (this.holderItems.scrollWidth - this.holderItems.clientWidth);
      position *= this.scrollbar.clientWidth;
      position -= this.scrollbarTrack.clientWidth;
      position = position < 0 ? 0 : position;

      this.scrollbar.style.setProperty('--position', `${Math.round(position)}px`);

      document.dispatchEvent(
        new CustomEvent('theme:scrollbar:scroll', {
          bubbles: true,
          detail: {
            holder: this.holderItems,
          },
        })
      );
    }
  }

  const selectors$i = {
    slider: 'data-slideshow',
    slide: 'data-slide',
    slideIndex: 'data-slide-index',
    prevArrow: '[data-prev-arrow]',
    nextArrow: '[data-next-arrow]',
    sliderActions: '[data-slider-actions]',
    flickitySlider: '.flickity-slider',
    flickityDisableClass: 'flickity-disabled-mobile',
  };

  const config$1 = {
    minimumVisibleSlidesDesktop: 4,
    minimumVisibleSlidesTablet: 2,
    minimumVisibleSlidesSmallMobile: 1,
  };

  const classes$4 = {
    hide: 'hide',
  };

  const sections$a = {};

  class DefaultSlider {
    constructor(container, newConfig) {
      this.container = container;
      this.slideshow = this.container.querySelector(`[${selectors$i.slider}]`);
      this.sliderActions = this.container.querySelector(selectors$i.sliderActions);
      this.prevArrow = this.container.querySelector(selectors$i.prevArrow);
      this.nextArrow = this.container.querySelector(selectors$i.nextArrow);
      config$1.minimumVisibleSlidesDesktop = Number(this.slideshow.getAttribute(selectors$i.slider)) ? Number(this.slideshow.getAttribute(selectors$i.slider)) : config$1.minimumVisibleSlidesDesktop;
      this.config = {...config$1, ...newConfig};

      this.init();
    }

    init() {
      this.flkty = new Flickity(this.slideshow, {
        cellAlign: 'left',
        groupCells: true,
        pageDots: false,
        freeScroll: true,
        contain: true,
        prevNextButtons: false,
        watchCSS: true,
      });

      if (this.prevArrow) {
        this.prevArrow.addEventListener('click', (e) => {
          e.preventDefault();

          this.flkty.previous();
        });
      }

      if (this.nextArrow) {
        this.nextArrow.addEventListener('click', (e) => {
          e.preventDefault();

          this.flkty.next();
        });
      }

      this.flkty.on('change', this.setButtonStatus.bind(this));

      this.sliderHolder = this.slideshow.querySelector(selectors$i.flickitySlider);

      if (this.sliderHolder) {
        this.slidesCount = this.sliderHolder.children.length;

        if (this.sliderActions) {
          this.showSliderActions();

          window.addEventListener('resize', () => {
            this.showSliderActions();
          });
        }
      }

      this.stopSlider();

      document.addEventListener('theme:resize', () => {
        this.stopSlider();
      });
    }

    setButtonStatus() {
      const slides = this.flkty.slides;
      const selectedIndex = this.flkty.selectedIndex;

      if (selectedIndex == slides.length - 1) {
        this.nextArrow.setAttribute('disabled', '');
      } else {
        this.nextArrow.removeAttribute('disabled');
      }
      if (selectedIndex === 0) {
        this.prevArrow.setAttribute('disabled', '');
      } else {
        this.prevArrow.removeAttribute('disabled');
      }
    }

    showSliderActions() {
      const showActionsForDesktop = this.slidesCount > this.config.minimumVisibleSlidesDesktop && window.innerWidth >= window.theme.sizes.large;
      const showActionsForTablet = this.slidesCount > this.config.minimumVisibleSlidesTablet && window.innerWidth < window.theme.sizes.large;
      const showActionsForSmallMobile = this.slidesCount > this.config.minimumVisibleSlidesSmallMobile && window.innerWidth < window.theme.sizes.small;

      if (showActionsForDesktop || showActionsForTablet || showActionsForSmallMobile) {
        this.sliderActions.classList.remove(classes$4.hide);
      } else {
        this.sliderActions.classList.add(classes$4.hide);
      }
    }

    stopSlider() {
      if (window.innerWidth < window.theme.sizes.medium && this.slideshow?.classList.contains(selectors$i.flickityDisableClass)) {
        new CustomScrollbar(this.container);
      }
    }

    unload() {
      this.flkty.destroy();
    }

    onBlockSelect(evt) {
      const currentSlide = document.querySelector(`[${selectors$i.slide}="${evt.detail.blockId}"]`);

      if (currentSlide) {
        const slideIndex = parseInt(currentSlide.getAttribute(selectors$i.slideIndex));

        this.flkty.select(slideIndex);
      }
    }
  }

  const slider = {
    onLoad() {
      sections$a[this.id] = new DefaultSlider(this.container);
    },
    onBlockSelect(evt) {
      sections$a[this.id].blockSelect(evt);
    },
    onUnload() {
      if (typeof sections$a[this.id].unload === 'function') {
        sections$a[this.id].unload();
      }
    },
  };

  register('section-collection', slider);

  var sections$9 = {};

  const parallaxImage = {
    onLoad() {
      sections$9[this.id] = [];
      const frames = this.container.querySelectorAll('[data-parallax-wrapper]');
      frames.forEach((frame) => {
        const inner = frame.querySelector('[data-parallax-img]');
        sections$9[this.id].push(
          new Rellax(inner, {
            center: true,
            round: true,
            frame: frame,
          })
        );
      });
    },
    onUnload: function () {
      sections$9[this.id].forEach((image) => {
        if (typeof image.destroy === 'function') {
          image.destroy();
        }
      });
    },
  };

  const sections$8 = {};

  const selectors$h = {
    slideshow: '[data-section-timeline-slideshow]',
    firstText: '[data-timeline-text-height]',
    overlay: '[data-has-image]',
    flickityDisableClass: 'flickity-disabled-mobile',
  };

  class IndexTimeline {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.slides = this.container.querySelector(selectors$h.slideshow);

      this.firstText = this.container.querySelector(selectors$h.firstText);
      this.overlay = this.container.querySelector(selectors$h.overlay);

      if (this.overlay && this.firstText) {
        const upper = `-${this.firstText.clientHeight}px`;
        this.container.style.setProperty('--timeshow-offset', upper);
      }

      this.init();
    }

    init() {
      this.flkty = new Flickity(this.slides, {
        cellAlign: 'left',
        adaptiveHeight: false,
        groupCells: true,
        pageDots: false,
        freeScroll: true,
        contain: true,
        watchCSS: true,
      });

      this.stopSlider();

      document.addEventListener('theme:resize', () => {
        this.stopSlider();
      });
    }

    stopSlider() {
      if (window.innerWidth < window.theme.sizes.medium && this.slides?.classList.contains(selectors$h.flickityDisableClass)) {
        new CustomScrollbar(this.container);
      }
    }

    onBlockSelect(evt) {
      const indexEl = evt.target.closest('[data-slideshow-index]');
      const slideIndex = indexEl.getAttribute('data-slideshow-index');
      const select = parseInt(slideIndex, 10);
      this.flkty.selectCell(select);
      this.flkty.pausePlayer();
    }

    unload() {
      if (this.flickity) {
        this.flkty.destroy();
      }
    }
  }

  const timelineSection = {
    onLoad() {
      sections$8[this.id] = new IndexTimeline(this);
    },
    onUnload() {
      if (typeof sections$8[this.id].unload === 'function') {
        sections$8[this.id].unload();
      }
    },
    onBlockSelect(evt) {
      if (typeof sections$8[this.id].onBlockSelect === 'function') {
        sections$8[this.id].onBlockSelect(evt);
      }
    },
  };

  register('section-timeline', [timelineSection, parallaxImage]);

  const footerSection = {
    onLoad() {
      // Lighthouse fires security warning for the Shopify link.
      var shopifyLink = document.querySelector('[data-powered-link] a');
      if (shopifyLink) {
        shopifyLink.setAttribute('rel', 'noopener');
      }
    },
  };

  register('footer', [popoutSection, footerSection]);

  const selectors$g = {
    focusable: 'button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
  };

  function modal(unique) {
    const uniqueID = `data-popup-${unique}`;
    MicroModal.init({
      openTrigger: uniqueID,
      disableScroll: true,
      onShow: (modal, el, event) => {
        event.preventDefault();
        const firstFocus = modal.querySelector(selectors$g.focusable);
        trapFocus(modal, {elementToFocus: firstFocus});
      },
      onClose: (modal, el, event) => {
        event.preventDefault();
        removeTrapFocus();
        el.focus();
      },
    });
  }

  var touched = false;

  function isTouch() {
    return touched;
  }

  function wasTouched() {
    touched = true;
    document.removeEventListener('touchstart', wasTouched, {passive: true});
    document.querySelector('body').classList.add('supports-touch');
    document.dispatchEvent(
      new CustomEvent('theme:touch', {
        bubbles: true,
      })
    );
  }

  document.addEventListener('touchstart', wasTouched, {passive: true});

  var modelJsonSections = {};
  var models = {};
  var xrButtons = {};

  const selectors$f = {
    productMediaWrapper: '[data-product-single-media-wrapper]',
    productSlideshow: '[data-product-slideshow]',
    productScrollbar: 'data-custom-scrollbar-items',
    productXr: '[data-shopify-xr]',
    dataMediaId: 'data-media-id',
    dataModelId: 'data-model-id',
    modelViewer: 'model-viewer',
    dataModel3d: 'data-shopify-model3d-id',
    modelJson: '#ModelJson-',
  };

  function initSectionModels(modelViewerContainer, sectionId) {
    modelJsonSections[sectionId] = {
      loaded: false,
    };

    const mediaId = modelViewerContainer.getAttribute(selectors$f.dataMediaId);
    const modelViewerElement = modelViewerContainer.querySelector(selectors$f.modelViewer);
    const modelId = modelViewerElement.getAttribute(selectors$f.dataModelId);
    const xrButton = modelViewerContainer.closest(selectors$f.productSlideshow).parentElement.querySelector(selectors$f.productXr);
    xrButtons[sectionId] = {
      $element: xrButton,
      defaultId: modelId,
    };

    models[mediaId] = {
      modelId: modelId,
      mediaId: mediaId,
      sectionId: sectionId,
      $container: modelViewerContainer,
      $element: modelViewerElement,
    };

    window.Shopify.loadFeatures([
      {
        name: 'shopify-xr',
        version: '1.0',
        onLoad: setupShopifyXr,
      },
      {
        name: 'model-viewer-ui',
        version: '1.0',
        onLoad: setupModelViewerUi,
      },
    ]);
  }

  function setupShopifyXr(errors) {
    if (errors) {
      console.warn(errors);
      return;
    }
    if (!window.ShopifyXR) {
      document.addEventListener('shopify_xr_initialized', function () {
        setupShopifyXr();
      });
      return;
    }

    for (const sectionId in modelJsonSections) {
      if (modelJsonSections.hasOwnProperty(sectionId)) {
        const modelSection = modelJsonSections[sectionId];
        if (modelSection.loaded) continue;

        const modelJson = document.querySelector(`${selectors$f.modelJson}${sectionId}`);
        if (modelJson) {
          window.ShopifyXR.addModels(JSON.parse(modelJson.innerHTML));
          modelSection.loaded = true;
        }
      }
    }
    window.ShopifyXR.setupXRElements();
  }

  function setupModelViewerUi(errors) {
    if (errors) {
      console.warn(errors);
      return;
    }

    for (const key in models) {
      if (models.hasOwnProperty(key)) {
        const model = models[key];
        if (!model.modelViewerUi) {
          model.modelViewerUi = new Shopify.ModelViewerUI(model.$element);
        }
        setupModelViewerListeners(model);
      }
    }
  }

  function observeModel(model) {
    const xrButton = xrButtons[model.sectionId];

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          const insideOfViewport = entry.intersectionRatio > 0.5;

          if (entry.target.hasAttribute(selectors$f.dataMediaId) && insideOfViewport) {
            xrButton.$element.setAttribute(selectors$f.dataModel3d, entry.target.getAttribute(selectors$f.dataMediaId));
          }
        });
      },
      {threshold: 1}
    );

    observer.observe(model.$container);
  }

  function setupModelViewerListeners(model) {
    const xrButton = xrButtons[model.sectionId];

    model.$container.addEventListener('pause', function () {
      if (model.modelViewerUi.pause) {
        model.modelViewerUi.pause();
      }
    });
    model.$container.addEventListener('play-desktop', function () {
      if (model.modelViewerUi.play && !isTouch()) {
        model.modelViewerUi.play();
      }
      if (xrButton && xrButton.$element && model && model.modelId && selectors$f.dataModel3d) {
        xrButton.$element.setAttribute(selectors$f.dataModel3d, model.modelId);
      }
    });
    model.$container.addEventListener('play', function () {
      if (model.modelViewerUi.play) {
        model.modelViewerUi.play();
      }
    });
    model.$container.addEventListener('click', function () {
      if (xrButton && xrButton.$element && model && model.modelId && selectors$f.dataModel3d) {
        xrButton.$element.setAttribute(selectors$f.dataModel3d, model.modelId);
      }
    });
    document.addEventListener('theme:scrollbar:scroll', function (event) {
      if (event.detail.holder === model.$container.parentElement) {
        observeModel(model);
      }
    });
  }

  async function productNativeVideo(uniqueKey) {
    const playerElement = document.querySelector(`[data-player="${uniqueKey}"]`);
    const videoElement = playerElement.querySelector('video');
    const videoLoad = {
      name: 'video-ui',
      version: '1.0',
    };
    await loadScript$1(videoLoad);

    const player = new window.Shopify.Plyr(videoElement);
    playerElement.addEventListener('pause', function () {
      if (player.pause) {
        player.pause();
      }
    });
    playerElement.addEventListener('play-desktop', function () {
      if (player.play && !isTouch()) {
        playerElement.dispatchEvent(new CustomEvent('play'));
      }
    });
    playerElement.addEventListener('play', function () {
      try {
        if (player.play) {
          player.play();
        } else {
          player.addEventListener('onReady', function (event) {
            event.target.play();
          });
        }
      } catch (e) {
        console.warn(e);
      }
    });
    playerElement.addEventListener('destroy', function () {
      try {
        if (player.destroy) {
          player.destroy();
        }
      } catch (e) {
        console.warn(e);
      }
    });
    return player;
  }

  const defaultOptions$1 = {
    cc_load_policy: 1,
    iv_load_policy: 3,
    modestbranding: 1,
    playsinline: 1,
    controls: 1,
    showinfo: 0,
    ecver: 2,
    fs: 1,
    rel: 0,
  };

  function embedYoutube(uniqueKey, options) {
    const playerOptions = {
      ...defaultOptions$1,
      ...options,
    };
    const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
    const playerElement = playerWrapper.querySelector('iframe, [data-replace]');
    const youtubeKey = playerWrapper.querySelector('[data-video-id]').getAttribute('data-video-id');
    loadScript$1({url: 'https://www.youtube.com/iframe_api'});
    const playerPromise = window.youtubeLoaderPromise
      .then(function () {
        let player = new window.YT.Player(playerElement, {
          videoId: youtubeKey,
          playerVars: {
            ...playerOptions,
          },
        });
        playerWrapper.addEventListener('pause', function () {
          try {
            if (player.pauseVideo) {
              player.pauseVideo();
            }
          } catch (e) {
            console.warn(e);
          }
        });
        playerWrapper.addEventListener('play-desktop', function () {
          if (!isTouch()) {
            playerWrapper.dispatchEvent(new Event('play'));
          }
        });
        playerWrapper.addEventListener('play', function () {
          try {
            if (player.playVideo) {
              player.playVideo();
            } else {
              player.addEventListener('onReady', function (event) {
                event.target.playVideo();
              });
            }
          } catch (e) {
            console.warn(e);
          }
        });
        playerWrapper.addEventListener('destroy', function () {
          try {
            if (player.destroy) {
              player.destroy();
            }
          } catch (e) {
            console.warn(e);
          }
        });
        return player;
      })
      .catch(function (err) {
        console.error(err);
      });
    return playerPromise;
  }

  window.youtubeLoaderPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = function () {
      resolve();
    };
  });

  var selectors$e = {
    productSlideshow: '[data-product-slideshow]',
    productThumbs: '[data-product-thumbs]',
    thumbImage: '[data-slideshow-thumbnail]',
    productImage: '[data-product-image]',
    mediaSlide: '[data-media-slide]',
    dataMediaId: 'data-media-id',
    mediaType: 'data-type',
    videoPlayerExternal: '[data-type="external_video"]',
    videoPlayerNative: '[data-type="video"]',
    modelViewer: '[data-type="model"]',
    allPlayers: '[data-player]',
    xrButton: '[data-shopify-xr]',
    xrButtonId: 'data-shopify-model3d-id',
    loopVideo: 'data-enable-video-looping',
    flickitylockHeight: 'flickity-lock-height',
    alignment: 'data-thumbs-align',
    flickityDisableClass: 'flickity-disabled-mobile',
  };

  class Media {
    constructor(section) {
      this.section = section;
      this.container = section.container;
      this.slideshow = this.container.querySelector(selectors$e.productSlideshow);
      this.thumbWrapper = this.container.querySelector(selectors$e.productThumbs);
      this.thumbImages = this.container.querySelectorAll(selectors$e.thumbImage);
      this.loopVideo = this.container.getAttribute(selectors$e.loopVideo) === 'true';
      this.centerAlign = this.container.getAttribute(selectors$e.alignment) === 'center';

      this.flkty = null;
      this.flktyThumbs = null;
      this.currentSlide = null;

      this.init();
    }

    init() {
      this.createSlider();
      this.detectVideo();
      this.detectYouTube();
      this.detect3d();
      this.stopSlider();

      document.addEventListener('theme:resize', () => {
        this.stopSlider();
      });
    }

    createSlider() {
      if (!this.slideshow) {
        return;
      }

      const instance = this;
      let flickityOptions = {
        autoPlay: false,
        prevNextButtons: false,
        contain: true,
        pageDots: false,
        adaptiveHeight: true,
        accessibility: true,
        wrapAround: true,
        fade: true,
        watchCSS: true,
        on: {
          ready: function () {
            instance.sliderThumbs();
          },
        },
      };

      this.flkty = new FlickityFade(this.slideshow, flickityOptions);
      this.flkty.resize();

      this.currentSlide = this.slideshow.querySelectorAll(selectors$e.mediaSlide)[0];
      this.setDraggable();

      this.flkty.on(
        'change',
        function (index) {
          this.currentSlide.dispatchEvent(new CustomEvent('pause'));
          this.currentSlide = this.flkty.cells[index].element;
          this.slideshow.classList.remove(selectors$e.flickitylockHeight);
        }.bind(this)
      );

      this.flkty.on(
        'settle',
        function (index) {
          this.currentSlide = this.flkty.cells[index].element;
          this.setDraggable();
          this.currentSlide.dispatchEvent(new CustomEvent('play-desktop'));
          const isFocusEnabled = document.body.classList.contains(selectors$e.focusEnabled);
          if (isFocusEnabled) this.currentSlide.dispatchEvent(new Event('focus'));
          this.confirmSync();
        }.bind(this)
      );

      this.eventListeners();
    }

    stopSlider() {
      if (window.innerWidth < window.theme.sizes.medium && this.slideshow?.classList.contains(selectors$e.flickityDisableClass)) {
        new CustomScrollbar(this.container);
      }
    }

    eventListeners() {
      this.slideshow.addEventListener(
        'theme:image:change',
        function (event) {
          var mediaId = event.detail.id;
          const mediaIdString = `[${selectors$e.dataMediaId}="${mediaId}"]`;
          if (window.innerWidth >= window.theme.sizes.medium) {
            const matchesMedia = (cell) => {
              return cell.element.matches(mediaIdString);
            };
            const index = this.flkty.cells.findIndex(matchesMedia);
            this.flkty.select(index);
          } else {
            const currentCell = this.slideshow.querySelector(mediaIdString);
            this.slideshow.scrollTo({
              left: currentCell.offsetLeft,
              behavior: 'smooth',
            });
          }
        }.bind(this)
      );

      this.thumbImages.forEach((thumb) => {
        thumb.addEventListener(
          'click',
          function (event) {
            const id = event.currentTarget.getAttribute('data-media-select');
            this.slideshow.dispatchEvent(
              new CustomEvent('theme:image:change', {
                detail: {
                  id: id,
                },
              })
            );
          }.bind(this)
        );
      });
    }

    sliderThumbs() {
      let opts = {
        freeScroll: true,
        contain: true,
        prevNextButtons: false,
        pageDots: false,
        accessibility: true,
        watchCSS: true,
        cellAlign: this.centerAlign ? 'center' : 'left',
        sync: this.slideshow,
      };
      this.flktyThumbs = new FlickitySync(this.thumbWrapper, opts);
    }

    confirmSync() {
      if (this.flkty.selectedIndex !== this.flktyThumbs.selectedIndex) {
        this.flkty.resize();
      }
    }

    setDraggable() {
      if (this.currentSlide) {
        const mediaType = this.currentSlide.getAttribute(selectors$e.mediaType);

        if (mediaType === 'model' || mediaType === 'video' || mediaType === 'external_video') {
          // fisrt boolean sets value, second option false to prevent refresh
          this.flkty.options.draggable = false;
          this.flkty.updateDraggable();
        } else {
          this.flkty.options.draggable = true;
          this.flkty.updateDraggable();
        }
      }
    }

    detect3d() {
      const modelViewerElements = this.container.querySelectorAll(selectors$e.modelViewer);
      if (modelViewerElements) {
        modelViewerElements.forEach((element) => {
          initSectionModels(element, this.section.id);
        });
        document.addEventListener(
          'shopify_xr_launch',
          function () {
            this.container.querySelectorAll(selectors$e.allPlayers).forEach((player) => {
              player.dispatchEvent(new CustomEvent('pause'));
            });
          }.bind(this)
        );
      }
    }

    detectVideo() {
      const playerElements = this.section.container.querySelectorAll(selectors$e.videoPlayerNative);
      for (var player of playerElements) {
        const uniqueKey = player.dataset.player;
        const nativePlayerPromise = productNativeVideo(uniqueKey);
        if (this.loopVideo === true) {
          nativePlayerPromise
            .then((nativePlayer) => {
              nativePlayer.loop = true;
              return nativePlayer;
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
    }

    detectYouTube() {
      const playerElements = this.section.container.querySelectorAll(selectors$e.videoPlayerExternal);
      for (var player of playerElements) {
        const uniqueKey = player.dataset.player;
        const youtubePlayerPromise = embedYoutube(uniqueKey);
        if (this.loopVideo === true) {
          youtubePlayerPromise
            .then((youtubePlayer) => {
              return _setToLoop(youtubePlayer);
            })
            .catch((err) => {
              console.error(err);
            });
        }
      }
    }

    pauseAllMedia() {
      const all = this.container.querySelector(`[data-media-slide]`);
      all.dispatchEvent(new CustomEvent('pause'));
    }

    pauseOtherMedia(uniqueKey) {
      const otherMedia = this.container.querySelector(`[data-media-slide]:not([data-player="${uniqueKey}"])`);
      otherMedia.dispatchEvent(new CustomEvent('pause'));
    }

    destroy() {
      this.container.querySelectorAll(selectors$e.allPlayers).forEach((player) => {
        player.dispatchEvent(new CustomEvent('destroy'));
      });
    }
  }

  function _setToLoop(youtubePlayer) {
    youtubePlayer.addEventListener('onStateChange', function (event) {
      if (event.data === 0) {
        // video is over, replay
        event.target.playVideo();
      }
    });
    return youtubePlayer;
  }

  const selectors$d = {
    pickupContainer: '[data-store-availability-container]',
    shopifySection: '[data-api-content]',
    drawer: '[data-pickup-drawer]',
    drawerOpen: '[data-pickup-drawer-open]',
    drawerClose: '[data-pickup-drawer-close]',
    drawerBody: '[data-pickup-body]',
  };

  const classes$3 = {
    isVisible: 'drawer--visible',
  };

  let sections$7 = {};

  class PickupAvailability {
    constructor(section) {
      this.container = section.container;
      this.drawer = null;
      this.buttonDrawerOpen = null;
      this.buttonDrawerClose = null;
      this.drawerBody = null;

      this.container.addEventListener('theme:variant:change', (event) => this.fetchPickupAvailability(event));
    }

    fetchPickupAvailability(event) {
      const container = this.container.querySelector(selectors$d.pickupContainer);
      const variant = event.detail.variant;

      if (container && variant) {
        fetch(`${window.theme.routes.root_url}variants/${variant.id}/?section_id=api-pickup-availability`)
          .then((response) => response.text())
          .then((text) => {
            const pickupAvailabilityHTML = new DOMParser().parseFromString(text, 'text/html').querySelector(selectors$d.shopifySection).innerHTML;
            container.innerHTML = pickupAvailabilityHTML;

            this.drawer = this.container.querySelector(selectors$d.drawer);
            this.buttonDrawerOpen = this.container.querySelector(selectors$d.drawerOpen);
            this.buttonDrawerClose = this.container.querySelectorAll(selectors$d.drawerClose);
            this.drawerBody = this.container.querySelector(selectors$d.drawerBody);

            if (this.buttonDrawerOpen) {
              this.buttonDrawerOpen.addEventListener('click', () => this.openDrawer());
            }

            if (this.buttonDrawerClose.length) {
              this.buttonDrawerClose.forEach((element) => {
                element.addEventListener('click', () => this.closeDrawer());
              });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }

    openDrawer() {
      if (this.drawer) {
        this.drawer.classList.add(classes$3.isVisible);
        this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
      }
    }

    closeDrawer() {
      if (this.drawer) {
        this.drawer.classList.remove(classes$3.isVisible);
        this.drawerBody.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
      }
    }
  }

  const pickupAvailability = {
    onLoad() {
      sections$7[this.id] = new PickupAvailability(this);
    },
  };

  const cookieDefaultValues = {
    expires: 7,
    path: '/',
    domain: window.location.hostname,
  };

  class Cookies {
    constructor(options = {}) {
      this.options = {
        ...cookieDefaultValues,
        ...options,
      };
    }

    /**
     * Write cookie
     * @param value - String
     */
    write(value) {
      document.cookie = `${this.options.name}=${value}; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
    }

    /**
     * Read cookies and returns an array of values
     * @returns Array
     */
    read() {
      let cookieValuesArr = [];
      const hasCookieWithThisName = document.cookie.split('; ').find((row) => row.startsWith(this.options.name));

      if (document.cookie.indexOf('; ') !== -1 && hasCookieWithThisName) {
        const cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith(this.options.name))
          .split('=')[1];

        if (cookieValue !== null) {
          cookieValuesArr = cookieValue.split(',');
        }
      }

      return cookieValuesArr;
    }

    destroy() {
      document.cookie = `${this.options.name}=null; expires=${this.options.expires}; path=${this.options.path}; domain=${this.options.domain}`;
    }

    remove(removedValue) {
      const cookieValue = this.read();
      const position = cookieValue.indexOf(removedValue);

      if (position !== -1) {
        cookieValue.splice(position, 1);
        this.write(cookieValue);
      }
    }
  }

  const config = {
    howManyToShow: 4,
    howManyToStoreInMemory: 10,
    minimumVisibleSlidesDesktop: 4,
    minimumVisibleSlidesTablet: 3,
    minimumVisibleSlidesMobile: 2,
    minimumVisibleSlidesSmallMobile: 1,
    wrapper: '[data-recently-viewed-products]',
    limit: 'data-limit',
    recentWrapper: '[data-recent-wrapper]',
    apiContent: '[data-api-content]',
    recentSlideshow: '[data-recent-slideshow]',
    sliderActions: '[data-slider-actions]',
    prevArrow: '[data-prev-arrow]',
    nextArrow: '[data-next-arrow]',
    productClasses: 'data-product-class',
    dataMinimum: 'data-minimum',
    hideClass: 'hide',
    flickityDisableClass: 'flickity-disabled-mobile',
  };

  const cookieConfig = {
    expires: 90,
    name: 'shopify_recently_viewed',
  };

  const sections$6 = [];
  const excludedHandles = [];

  class RecentProducts {
    constructor(section) {
      this.container = section.container;
      this.cookie = new Cookies(cookieConfig);
      this.wrapper = this.container.querySelector(config.wrapper);
      this.slideshow = this.container.querySelector(config.recentSlideshow);
      this.sliderActions = this.container.querySelector(config.sliderActions);
      this.sliderPrev = this.container.querySelector(config.prevArrow);
      this.sliderNext = this.container.querySelector(config.nextArrow);

      if (this.wrapper === null) {
        return;
      }

      this.howManyToShow = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.limit)) || config.howManyToShow;
      this.minimum = parseInt(this.container.querySelector(config.recentWrapper).getAttribute(config.dataMinimum));
      this.classes = this.container.querySelector(config.recentWrapper).getAttribute(config.productClasses).split(' ');

      this.renderProducts();
    }

    renderProducts() {
      const recentlyViewedHandlesArray = this.cookie.read();
      const arrayURLs = [];
      let counter = 0;

      if (recentlyViewedHandlesArray.length > 0) {
        for (let index = 0; index < recentlyViewedHandlesArray.length; index++) {
          const handle = recentlyViewedHandlesArray[index];

          if (excludedHandles.includes(handle)) {
            continue;
          }

          const url = `${window.theme.routes.root_url}products/${handle}?section_id=api-product-grid-item`;

          arrayURLs.push(url);

          counter++;

          if (counter === this.howManyToShow || counter === recentlyViewedHandlesArray.length - 1) {
            break;
          }
        }

        if (arrayURLs.length > 0 && arrayURLs.length >= this.minimum) {
          this.container.classList.remove(config.hideClass);

          const fecthRequests = arrayURLs.map((url) => fetch(url, {mode: 'no-cors'}).then(this.handleErrors));
          this.productMarkups = [];

          Promise.allSettled(fecthRequests)
            .then((responses) => {
              return Promise.all(
                responses.map(async (response) => {
                  if (response.status === 'fulfilled') {
                    this.productMarkups.push(await response.value.text());
                  }
                })
              );
            })
            .then(() => {
              this.productMarkups.forEach((markup) => {
                const buffer = document.createElement('div');

                buffer.innerHTML = markup;

                this.wrapper.innerHTML += buffer.querySelector(config.apiContent).innerHTML;
              });
            })
            .then(() => {
              showElement(this.wrapper, true);

              this.flkty = new Flickity(this.slideshow, {
                cellAlign: 'left',
                groupCells: true,
                pageDots: false,
                prevNextButtons: false,
                freeScroll: true,
                contain: true,
                watchCSS: true,
              });

              if (this.sliderPrev) {
                this.sliderPrev.addEventListener('click', (e) => {
                  e.preventDefault();

                  this.flkty.previous();
                });
              }

              if (this.sliderNext) {
                this.sliderNext.addEventListener('click', (e) => {
                  e.preventDefault();

                  this.flkty.next();
                });
              }

              this.showSliderActions();

              window.addEventListener('resize', () => {
                this.showSliderActions();
              });

              this.stopSlider();

              document.addEventListener('theme:resize', () => {
                this.stopSlider();
              });
            });
        }
      }
    }

    stopSlider() {
      if (window.innerWidth < window.theme.sizes.medium && this.slideshow?.classList.contains(config.flickityDisableClass)) {
        new CustomScrollbar(this.container);
      }
    }

    showSliderActions() {
      const showActionsForDesktop = this.productMarkups.length > config.minimumVisibleSlidesDesktop && window.innerWidth >= window.theme.sizes.large;
      const showActionsForTablet = this.productMarkups.length > config.minimumVisibleSlidesTablet && window.innerWidth < window.theme.sizes.large;
      const showActionsForMobile = this.productMarkups.length > config.minimumVisibleSlidesMobile && window.innerWidth < window.theme.sizes.medium;
      const showActionsForSmallMobile = this.productMarkups.length > config.minimumVisibleSlidesSmallMobile && window.innerWidth < window.theme.sizes.small;

      if (showActionsForDesktop || showActionsForTablet || showActionsForMobile || showActionsForSmallMobile) {
        this.sliderActions.classList.remove(config.hideClass);
      } else {
        this.sliderActions.classList.add(config.hideClass);
      }
    }

    handleErrors(response) {
      if (!response.ok) {
        return response.text().then(function (text) {
          const e = new FetchError({
            status: response.statusText,
            headers: response.headers,
            text: text,
          });
          throw e;
        });
      }
      return response;
    }

    unload() {
      this.flkty.destroy();
    }
  }

  class RecordRecentlyViewed {
    constructor(handle) {
      this.handle = handle;
      this.cookie = new Cookies(cookieConfig);

      if (typeof this.handle === 'undefined') {
        return;
      }

      excludedHandles.push(this.handle);

      this.updateCookie();
    }

    updateCookie() {
      let recentlyViewed = this.cookie.read();

      // In what position is that product in memory.
      const position = recentlyViewed.indexOf(this.handle);

      // If not in memory.
      if (position === -1) {
        // Add product at the start of the list.
        recentlyViewed.unshift(this.handle);
        // Only keep what we need.
        recentlyViewed = recentlyViewed.splice(0, config.howManyToStoreInMemory);
      } else {
        // Remove the product and place it at start of list.
        recentlyViewed.splice(position, 1);
        recentlyViewed.unshift(this.handle);
      }

      // Update cookie.
      this.cookie.write(recentlyViewed);
    }
  }

  const recentProducts = {
    onLoad() {
      sections$6[this.id] = new RecentProducts(this);
    },
    onUnload() {
      if (typeof sections$6[this.id].unload === 'function') {
        sections$6[this.id].unload();
      }
    },
  };

  const selectors$c = {
    productForm: '[data-product-form]',
    productSlideshow: '[data-product-slideshow]',
    addToCart: '[data-add-to-cart]',
    addToCartText: '[data-add-to-cart-text]',
    comparePrice: '[data-compare-price]',
    comparePriceText: '[data-compare-text]',
    buttonsWrapper: '[data-buttons-wrapper]',
    originalSelectorId: '[data-product-select]',
    priceWrapper: '[data-price-wrapper]',
    priceButton: '[data-button-price]',
    productJson: '[data-product-json]',
    productPrice: '[data-product-price]',
    unitPrice: '[data-product-unit-price]',
    unitBase: '[data-product-base]',
    unitWrapper: '[data-product-unit]',
    dataEnableHistoryState: 'data-enable-history-state',
    optionPosition: 'data-option-position',
    optionValue: '[data-option-value]',
    subPrices: '[data-subscription-watch-price]',
    subSelectors: '[data-subscription-selectors]',
    priceOffWrap: '[data-price-off]',
    priceOffType: '[data-price-off-type]',
    priceOffAmount: '[data-price-off-amount]',
    subsToggle: '[data-toggles-group]',
    subsChild: 'data-group-toggle',
    subDescription: '[data-plan-description]',
    remainingCount: '[data-remaining-count]',
    remainingMax: '[data-remaining-max]',
    remainingMaxAttr: 'data-remaining-max',
    remainingWrapper: '[data-remaining-wrapper]',
    remainingJSON: '[data-product-remaining-json]',
    isPreOrder: '[data-product-preorder]',
    idInput: '[name="id"]',
  };

  const classes$2 = {
    hide: 'hide',
    variantSoldOut: 'variant--soldout',
    variantUnavailable: 'variant--unavailable',
    productPriceSale: 'product__price--sale',
    remainingLow: 'count-is-low',
    remainingIn: 'count-is-in',
    remainingOut: 'count-is-out',
    remainingUnavailable: 'count-is-unavailable',
  };

  class ProductAddForm {
    constructor(section) {
      this.section = section;
      this.container = section.container;

      this.productForm = this.container.querySelector(selectors$c.productForm);
      this.slideshow = this.container.querySelector(selectors$c.productSlideshow);
      this.enableHistoryState = this.container.getAttribute(selectors$c.dataEnableHistoryState) === 'true';
      this.hasUnitPricing = this.container.querySelectorAll(selectors$c.unitWrapper);
      this.subSelectors = this.container.querySelector(selectors$c.subSelectors);
      this.subPrices = this.container.querySelector(selectors$c.subPrices);

      this.priceOffWrap = this.container.querySelectorAll(selectors$c.priceOffWrap);
      this.priceOffAmount = this.container.querySelectorAll(selectors$c.priceOffAmount);
      this.planDecription = this.container.querySelectorAll(selectors$c.subDescription);
      this.priceOffType = this.container.querySelectorAll(selectors$c.priceOffType);

      this.isPreOrder = this.container.querySelector(selectors$c.isPreOrder);

      this.remainingWrapper = this.container.querySelector(selectors$c.remainingWrapper);
      if (this.remainingWrapper) {
        const remainingMaxWrap = this.container.querySelector(selectors$c.remainingMax);
        this.remainingMaxInt = parseInt(remainingMaxWrap.getAttribute(selectors$c.remainingMaxAttr), 10);
        this.remainingCount = this.container.querySelector(selectors$c.remainingCount);
        this.remainingJSONWrapper = this.container.querySelector(selectors$c.remainingJSON);
        this.remainingJSON = null;
        if (this.remainingJSONWrapper && this.remainingJSONWrapper.innerHTML !== '') {
          this.remainingJSON = JSON.parse(this.remainingJSONWrapper.innerHTML);
        } else {
          console.warn('Missing product quantity JSON');
        }
      }

      initQtySection(this.container);

      this.init();
    }

    init() {
      let productJSONText = null;
      this.productJSON = null;
      const productElemJSON = this.container.querySelector(selectors$c.productJson);

      if (productElemJSON) {
        productJSONText = productElemJSON.innerHTML;
      }
      if (productJSONText && this.productForm) {
        this.productJSON = JSON.parse(productJSONText);
        this.linkForm();
      } else {
        console.warn('Missing product form or product JSON');
      }

      // Add cookie for recent products
      if (this.productJSON) {
        new RecordRecentlyViewed(this.productJSON.handle);
      }
    }

    destroy() {
      this.productForm.destroy();
    }

    linkForm() {
      this.productForm = new ProductForm(this.productForm, this.productJSON, {
        onOptionChange: this.onOptionChange.bind(this),
        onPlanChange: this.onPlanChange.bind(this),
        onQuantityChange: this.onQuantityChange.bind(this),
      });
      this.pushState(this.productForm.getFormState());
      this.subsToggleListeners();
    }

    onOptionChange(evt) {
      this.pushState(evt.dataset);
    }

    onPlanChange(evt) {
      if (this.subPrices) {
        this.pushState(evt.dataset);
      }
    }

    onQuantityChange(evt) {
      const formState = evt.dataset;
      this.productState = this.setProductState(formState);
      this.updateButtonPrices(formState);
    }

    pushState(formState) {
      this.productState = this.setProductState(formState);
      this.updateProductImage(formState);
      this.updateAddToCartState(formState);
      this.updateProductPrices(formState);
      this.updateSaleText(formState);
      this.updateSubscriptionText(formState);
      this.updateLegend(formState);
      this.updateRemaining(formState);
      this.fireHookEvent(formState);
      if (this.enableHistoryState) {
        this.updateHistoryState(formState);
      }
    }

    updateAddToCartState(formState) {
      const variant = formState.variant;
      let addText = theme.strings.addToCart;
      const priceWrapper = this.container.querySelectorAll(selectors$c.priceWrapper);
      const buttonsWrapper = this.container.querySelector(selectors$c.buttonsWrapper);
      const addToCart = buttonsWrapper.querySelectorAll(selectors$c.addToCart);
      const addToCartText = buttonsWrapper.querySelectorAll(selectors$c.addToCartText);

      if (this.isPreOrder) {
        addText = theme.strings.preOrder;
      }

      if (priceWrapper.length && variant) {
        priceWrapper.forEach((element) => {
          element.classList.remove(classes$2.hide);
        });
      }

      if (addToCart.length) {
        addToCart.forEach((element) => {
          if (variant) {
            if (variant.available) {
              element.disabled = false;
            } else {
              element.disabled = true;
            }
          } else {
            element.disabled = true;
          }
        });
      }

      if (addToCartText.length) {
        addToCartText.forEach((element) => {
          if (variant) {
            if (variant.available) {
              element.innerHTML = addText;
            } else {
              element.innerHTML = theme.strings.soldOut;
            }
          } else {
            element.innerHTML = theme.strings.unavailable;
          }
        });
      }

      if (buttonsWrapper) {
        if (variant) {
          if (variant.available) {
            buttonsWrapper.classList.remove(classes$2.variantSoldOut, classes$2.variantUnavailable);
          } else {
            buttonsWrapper.classList.add(classes$2.variantSoldOut);
            buttonsWrapper.classList.remove(classes$2.variantUnavailable);
          }
          const formSelect = buttonsWrapper.querySelector(selectors$c.originalSelectorId);
          if (formSelect) {
            formSelect.value = variant.id;
          }
        } else {
          buttonsWrapper.classList.add(classes$2.variantUnavailable);
          buttonsWrapper.classList.remove(classes$2.variantSoldOut);
        }
      }
    }

    updateLegend(formState) {
      const variant = formState.variant;
      if (variant) {
        const vals = this.container.querySelectorAll(selectors$c.optionValue);
        vals.forEach((val) => {
          const wrapper = val.closest(`[${selectors$c.optionPosition}]`);
          if (wrapper) {
            const position = wrapper.getAttribute(selectors$c.optionPosition);
            const index = parseInt(position, 10) - 1;
            const newValue = variant.options[index];
            val.innerHTML = newValue;
          }
        });
      }
    }

    updateHistoryState(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      const location = window.location.href;
      if (variant && location.includes('/product')) {
        const url = new window.URL(location);
        const params = url.searchParams;
        // params.set('variant', variant.id);
        if (plan && plan.detail && plan.detail.id && this.productState.hasPlan) {
          // params.set('selling_plan', plan.detail.id);
        } else {
          params.delete('selling_plan');
        }
        url.search = params.toString();
        const urlString = url.toString();
        window.history.replaceState({path: urlString}, '', urlString);
      }
    }

    updateRemaining(formState) {
      const variant = formState.variant;
      if (variant && this.remainingWrapper && this.remainingJSON && this.remainingCount) {
        const newQuantity = this.remainingJSON[variant.id];
        if (newQuantity && newQuantity <= this.remainingMaxInt && newQuantity > 0) {
          this.remainingWrapper.classList.remove(classes$2.remainingIn, classes$2.remainingOut, classes$2.remainingUnavailable);
          this.remainingWrapper.classList.add(classes$2.remainingLow);
          this.remainingCount.innerHTML = newQuantity;
        } else if (this.productState.soldOut) {
          this.remainingWrapper.classList.remove(classes$2.remainingLow, classes$2.remainingIn, classes$2.remainingUnavailable);
          this.remainingWrapper.classList.add(classes$2.remainingOut);
        } else if (this.productState.available) {
          this.remainingWrapper.classList.remove(classes$2.remainingLow, classes$2.remainingOut, classes$2.remainingUnavailable);
          this.remainingWrapper.classList.add(classes$2.remainingIn);
        }
      } else if (this.remainingWrapper) {
        this.remainingWrapper.classList.remove(classes$2.remainingIn, classes$2.remainingOut, classes$2.remainingLow);
        this.remainingWrapper.classList.add(classes$2.remainingUnavailable);
      }
    }

    getBaseUnit(variant) {
      return variant.unit_price_measurement.reference_value === 1
        ? variant.unit_price_measurement.reference_unit
        : variant.unit_price_measurement.reference_value + variant.unit_price_measurement.reference_unit;
    }

    subsToggleListeners() {
      const toggles = this.container.querySelectorAll(selectors$c.subsToggle);

      toggles.forEach((toggle) => {
        toggle.addEventListener(
          'change',
          function (e) {
            const val = e.target.value.toString();
            const selected = this.container.querySelector(`[${selectors$c.subsChild}="${val}"]`);
            const groups = this.container.querySelectorAll(`[${selectors$c.subsChild}]`);
            if (selected) {
              selected.classList.remove(classes$2.hide);
              const first = selected.querySelector(`[name="selling_plan"]`);
              first.checked = true;
              first.dispatchEvent(new Event('change'));
            }
            groups.forEach((group) => {
              if (group !== selected) {
                group.classList.add(classes$2.hide);
                const plans = group.querySelectorAll(`[name="selling_plan"]`);
                plans.forEach((plan) => {
                  plan.checked = false;
                  plan.dispatchEvent(new Event('change'));
                });
              }
            });
          }.bind(this)
        );
      });
    }

    updateSaleText(formState) {
      if (this.productState.planSale) {
        this.updateSaleTextSubscription(formState);
      } else if (this.productState.onSale) {
        this.updateSaleTextStandard(formState);
      } else {
        this.priceOffWrap.forEach((element) => {
          element.classList.add(classes$2.hide);
        });
      }
    }

    updateSaleTextStandard(formState) {
      if (this.priceOffType.length === 0) return;
      this.priceOffType.innerHTML = window.theme.strings.sale || 'sale';
      const variant = formState.variant;
      if (window.theme.settings.badge_sale_type && window.theme.settings.badge_sale_type === 'percentage') {
        const discountFloat = (variant.compare_at_price - variant.price) / variant.compare_at_price;
        const discountInt = Math.floor(discountFloat * 100);
        this.priceOffAmount.forEach((element) => {
          element.innerHTML = `${discountInt}%`;
        });
      } else {
        const discount = variant.compare_at_price - variant.price;
        this.priceOffAmount.forEach((element) => {
          element.innerHTML = themeCurrency.formatMoney(discount, theme.moneyFormat);
        });
      }
      this.priceOffWrap.forEach((element) => {
        element.classList.remove(classes$2.hide);
      });
    }

    updateSaleTextSubscription(formState) {
      this.priceOffType.forEach((element) => {
        element.innerHTML = window.theme.strings.subscription || 'subscripton';
      });
      const adjustment = formState.plan.detail.price_adjustments[0];
      const discount = adjustment.value;
      if (adjustment && adjustment.value_type === 'percentage') {
        this.priceOffAmount.forEach((element) => {
          element.innerHTML = `${discount}%`;
        });
      } else {
        this.priceOffAmount.forEach((element) => {
          element.innerHTML = themeCurrency.formatMoney(discount, theme.moneyFormat);
        });
      }
      this.priceOffWrap.forEach((element) => {
        element.classList.remove(classes$2.hide);
      });
    }

    updateSubscriptionText(formState) {
      if (formState.plan && this.planDecription.length > 0) {
        this.planDecription.forEach((element) => {
          element.innerHTML = formState.plan.detail.description;
          element.classList.remove(classes$2.hide);
        });
      } else if (this.planDecription.length > 0) {
        this.planDecription.forEach((element) => {
          element.classList.add(classes$2.hide);
        });
      }
    }

    getPrices(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      let comparePrice = '';
      let price = '';

      if (this.productState.available) {
        comparePrice = variant.compare_at_price;
        price = variant.price;
      }

      if (this.productState.hasPlan) {
        price = plan.allocation.price;
      }

      if (this.productState.planSale) {
        comparePrice = plan.allocation.compare_at_price;
        price = plan.allocation.price;
      }
      return {
        price: price,
        comparePrice: comparePrice,
      };
    }

    updateButtonPrices(formState) {
      const priceButtons = this.container.querySelectorAll(selectors$c.priceButton);
      const {price} = this.getPrices(formState);

      if (priceButtons.length) {
        priceButtons.forEach((btn) => {
          const btnPrice = formState.quantity * price;
          btn.innerHTML = themeCurrency.formatMoney(btnPrice, theme.moneyFormat);
        });
      }
    }

    updateProductPrices(formState) {
      const variant = formState.variant;
      const priceWrappers = this.container.querySelectorAll(selectors$c.priceWrapper);
      const priceButtons = this.container.querySelectorAll(selectors$c.priceButton);

      const {price, comparePrice} = this.getPrices(formState);

      priceWrappers.forEach((wrap) => {
        const comparePriceEl = wrap.querySelector(selectors$c.comparePrice);
        const productPriceEl = wrap.querySelector(selectors$c.productPrice);
        const comparePriceText = wrap.querySelector(selectors$c.comparePriceText);

        if (comparePriceEl) {
          if (this.productState.onSale || this.productState.planSale) {
            comparePriceEl.classList.remove(classes$2.hide);
            comparePriceText.classList.remove(classes$2.hide);
            productPriceEl.classList.add(classes$2.productPriceSale);
          } else {
            comparePriceEl.classList.add(classes$2.hide);
            comparePriceText.classList.add(classes$2.hide);
            productPriceEl.classList.remove(classes$2.productPriceSale);
          }
          comparePriceEl.innerHTML = themeCurrency.formatMoney(comparePrice, theme.moneyFormat);
        }
        if (productPriceEl) {
          if (variant) {
            productPriceEl.innerHTML = themeCurrency.formatMoney(price, theme.moneyFormat);
          } else {
            productPriceEl.innerHTML = '&nbsp;';
          }
        }
      });

      if (priceButtons.length) {
        priceButtons.forEach((btn) => {
          const btnPrice = formState.quantity * price;
          btn.innerHTML = themeCurrency.formatMoney(btnPrice, theme.moneyFormat);
        });
      }

      if (this.hasUnitPricing.length > 0) {
        this.updateProductUnits(formState);
      }
    }

    updateProductUnits(formState) {
      const variant = formState.variant;
      const plan = formState.plan;
      let unitPrice = null;

      if (variant && variant.unit_price) {
        unitPrice = variant.unit_price;
      }
      if (plan && plan.allocation && plan.allocation.unit_price) {
        unitPrice = plan.allocation.unit_price;
      }

      if (unitPrice) {
        const base = this.getBaseUnit(variant);
        const formattedPrice = themeCurrency.formatMoney(unitPrice, theme.moneyFormat);
        this.container.querySelectorAll(selectors$c.unitPrice).forEach((element) => {
          element.innerHTML = formattedPrice;
        });

        this.container.querySelectorAll(selectors$c.unitBase).forEach((element) => {
          element.innerHTML = base;
        });

        this.container.querySelectorAll(selectors$c.unitWrapper).forEach((element) => {
          showElement(element);
        });
      } else {
        this.container.querySelectorAll(selectors$c.unitWrapper).forEach((element) => {
          hideElement(element);
        });
      }
    }

    fireHookEvent(formState) {
      const variant = formState.variant;
      this.container.dispatchEvent(
        new CustomEvent('theme:variant:change', {
          detail: {
            variant: variant,
          },
          bubbles: true,
        })
      );
    }

    /**
     * Tracks aspects of the product state that are relevant to UI updates
     * @param {object} evt - variant change event
     * @return {object} productState - represents state of variant + plans
     *  productState.available - current variant and selling plan options result in valid offer
     *  productState.soldOut - variant is sold out
     *  productState.onSale - variant is on sale
     *  productState.showUnitPrice - variant has unit price
     *  productState.requiresPlan - all the product variants requires a selling plan
     *  productState.hasPlan - there is a valid selling plan
     *  productState.planSale - plan has a discount to show next to price
     *  productState.planPerDelivery - plan price does not equal per_delivery_price - a prepaid subscribtion
     */
    setProductState(dataset) {
      const variant = dataset.variant;
      const plan = dataset.plan;

      const productState = {
        available: true,
        soldOut: false,
        onSale: false,
        showUnitPrice: false,
        requiresPlan: false,
        hasPlan: false,
        planPerDelivery: false,
        planSale: false,
      };

      if (!variant || (variant.requires_selling_plan && !plan)) {
        productState.available = false;
      } else {
        if (!variant.available) {
          productState.soldOut = true;
        }

        if (variant.compare_at_price > variant.price) {
          productState.onSale = true;
        }

        if (variant.unit_price) {
          productState.showUnitPrice = true;
        }

        if (this.productJSON && this.productJSON.requires_selling_plan) {
          productState.requiresPlan = true;
        }

        if (plan && this.subPrices) {
          productState.hasPlan = true;
          if (plan.allocation.per_delivery_price !== plan.allocation.price) {
            productState.planPerDelivery = true;
          }
          if (variant.price > plan.allocation.price) {
            productState.planSale = true;
          }
        }
      }
      return productState;
    }

    updateProductImage(formState) {
      const variant = formState.variant;
      if (this.slideshow && variant && variant.featured_media && variant.featured_media.id) {
        // Update variant image, if one is set
        this.slideshow.dispatchEvent(
          new CustomEvent('theme:image:change', {
            detail: {
              id: variant.featured_media.id,
            },
          })
        );
      }
    }
  }

  const productFormSection = {
    onLoad() {
      this.section = new ProductAddForm(this);
    },
  };

  const selectors$b = {
    slideshow: '[data-product-slideshow]',
    singeImage: '[data-product-image]',
    zoomButton: '[data-zoom-button]',
    zoomWrapper: '[data-zoom-wrapper]',
    mediaId: '[data-media-id]',
    mediaIdAttr: 'data-media-id',
  };

  function productPhotoswipeZoom(container, json) {
    const loadedPromise = loadScript$1({url: window.theme.assets.photoswipe});
    const returnZoom = loadedPromise
      .then(() => {
        const PhotoSwipe = window.themePhotoswipe.PhotoSwipe.default;
        const PhotoSwipeUI = window.themePhotoswipe.PhotoSwipeUI.default;

        const triggers = container.querySelectorAll(selectors$b.zoomButton);
        triggers.forEach((trigger) => {
          trigger.addEventListener('click', (event) => {
            const el = container.querySelector(selectors$b.zoomWrapper);
            const dataId = event.target.closest(selectors$b.mediaId).getAttribute(selectors$b.mediaIdAttr).toString();
            const items = [];
            for (let i = 0; i < json.media.length; i++) {
              if (json.media[i].media_type === 'image') {
                items[items.length] = {
                  src: json.media[i].src,
                  w: json.media[i].width,
                  h: json.media[i].height,
                  id: json.media[i].id,
                };
              }
            }
            const findImage = (element) => element.id.toString() === dataId;
            const index = items.findIndex(findImage);
            const options = {
              index,
              showHideOpacity: true,
              showAnimationDuration: 150,
              hideAnimationDuration: 250,
              bgOpacity: 1,
              spacing: 0,
              allowPanToNext: false,
              maxSpreadZoom: 3,
              history: false,
              loop: true,
              pinchToClose: false,
              modal: false,
              closeOnScroll: false,
              closeOnVerticalDrag: true,
              getDoubleTapZoom: function getDoubleTapZoom(isMouseClick, item) {
                if (isMouseClick) {
                  return 1.67;
                } else {
                  return item.initialZoomLevel < 0.7 ? 1 : 1.3;
                }
              },
              getThumbBoundsFn: function getThumbBoundsFn() {
                let imageLocation = container.querySelector(selectors$b.slideshow);
                if (!imageLocation) {
                  imageLocation = container.querySelector(selectors$b.singeImage);
                }
                const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                const rect = imageLocation.getBoundingClientRect();
                return {x: rect.left, y: rect.top + pageYScroll, w: rect.width};
              },
            };
            el.dispatchEvent(new CustomEvent('theme:scroll:lock', {bubbles: true}));
            // Initializes and opens PhotoSwipe
            let windowWidth = null;
            const gallery = new PhotoSwipe(el, PhotoSwipeUI, items, options);
            gallery.updateSize = new Proxy(gallery.updateSize, {
              apply: (target) => windowWidth !== window.innerWidth && (target(options), (windowWidth = window.innerWidth)),
            });
            gallery.init();
            gallery.listen('close', function () {
              document.dispatchEvent(new CustomEvent('theme:scroll:unlock', {bubbles: true}));
            });
          });
        });
      })
      .catch((e) => console.error(e));
    return returnZoom;
  }

  const selectors$a = {
    elements: {
      scrollbar: 'data-scrollbar-slider',
      scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
      scrollbarArrowNext: '[data-scrollbar-arrow-next]',
    },
    classes: {
      hide: 'is-hidden',
    },
    times: {
      delay: 200,
    },
  };

  class NativeScrollbar {
    constructor(scrollbar) {
      this.scrollbar = scrollbar;

      this.arrowNext = this.scrollbar.parentNode.querySelector(selectors$a.elements.scrollbarArrowNext);
      this.arrowPrev = this.scrollbar.parentNode.querySelector(selectors$a.elements.scrollbarArrowPrev);

      this.init();
      this.resize();

      if (this.scrollbar.hasAttribute(selectors$a.elements.scrollbar)) {
        this.scrollToVisibleElement();
      }
    }

    init() {
      if (this.arrowNext && this.arrowPrev) {
        this.toggleNextArrow();

        this.events();
      }
    }

    resize() {
      document.addEventListener('theme:resize', () => {
        this.toggleNextArrow();
      });
    }

    events() {
      this.arrowNext.addEventListener('click', (event) => {
        event.preventDefault();

        this.goToNext();
      });

      this.arrowPrev.addEventListener('click', (event) => {
        event.preventDefault();

        this.goToPrev();
      });

      this.scrollbar.addEventListener('scroll', () => {
        this.togglePrevArrow();
        this.toggleNextArrow();
      });
    }

    goToNext() {
      const position = this.scrollbar.getBoundingClientRect().width / 2 + this.scrollbar.scrollLeft;

      this.move(position);

      this.arrowPrev.classList.remove(selectors$a.classes.hide);

      this.toggleNextArrow();
    }

    goToPrev() {
      const position = this.scrollbar.scrollLeft - this.scrollbar.getBoundingClientRect().width / 2;

      this.move(position);

      this.arrowNext.classList.remove(selectors$a.classes.hide);

      this.togglePrevArrow();
    }

    toggleNextArrow() {
      setTimeout(() => {
        this.arrowNext.classList.toggle(selectors$a.classes.hide, Math.round(this.scrollbar.scrollLeft + this.scrollbar.getBoundingClientRect().width + 1) >= this.scrollbar.scrollWidth);
      }, selectors$a.times.delay);
    }

    togglePrevArrow() {
      setTimeout(() => {
        this.arrowPrev.classList.toggle(selectors$a.classes.hide, this.scrollbar.scrollLeft <= 0);
      }, selectors$a.times.delay);
    }

    scrollToVisibleElement() {
      [].forEach.call(this.scrollbar.children, (element) => {
        element.addEventListener('click', (event) => {
          event.preventDefault();

          this.move(element.offsetLeft - element.clientWidth);
        });
      });
    }

    move(offsetLeft) {
      this.scrollbar.scrollTo({
        top: 0,
        left: offsetLeft,
        behavior: 'smooth',
      });
    }
  }

  const selectors$9 = {
    body: 'body',
    dataRelatedSectionElem: '[data-related-section]',
    dataTabsHolder: '[data-tabs-holder]',
    dataTab: 'data-tab',
    dataTabIndex: 'data-tab-index',
    blockId: 'data-block-id',
    tabsLi: '.tabs > button',
    tabLink: '.tab-link',
    tabLinkRecent: '.tab-link__recent',
    tabContent: '.tab-content',
    scrollbarHolder: '[data-scrollbar]',
    scrollbarArrowPrev: '[data-scrollbar-arrow-prev]',
    scrollbarArrowNext: '[data-scrollbar-arrow-next]',
  };

  const classes$1 = {
    classCurrent: 'current',
    classHide: 'hide',
    classAlt: 'alt',
  };

  const sections$5 = {};

  class GlobalTabs {
    constructor(holder) {
      this.container = holder;
      this.body = document.querySelector(selectors$9.body);
      this.accessibility = window.accessibility;

      if (this.container) {
        this.scrollbarHolder = this.container.querySelectorAll(selectors$9.scrollbarHolder);

        this.init();

        // Init native scrollbar
        this.initNativeScrollbar();
      }
    }

    init() {
      const ctx = this.container;
      const tabsNavList = ctx.querySelectorAll(selectors$9.tabsLi);
      const firstTabLink = ctx.querySelector(`${selectors$9.tabLink}-0`);
      const firstTabContent = ctx.querySelector(`${selectors$9.tabContent}-0`);

      if (firstTabContent) {
        firstTabContent.classList.add(classes$1.classCurrent);
      }

      if (firstTabLink) {
        firstTabLink.classList.add(classes$1.classCurrent);
      }

      this.checkVisibleTabLinks();
      this.container.addEventListener('tabs:checkRecentTab', () => this.checkRecentTab());
      this.container.addEventListener('tabs:hideRelatedTab', () => this.hideRelatedTab());

      if (tabsNavList.length) {
        tabsNavList.forEach((element) => {
          const tabId = parseInt(element.getAttribute(selectors$9.dataTab));
          const tab = ctx.querySelector(`${selectors$9.tabContent}-${tabId}`);

          element.addEventListener('click', () => {
            this.tabChange(element, tab);
          });

          element.addEventListener('keyup', (event) => {
            if ((event.which === window.theme.keyboardKeys.SPACE || event.which === window.theme.keyboardKeys.ENTER) && this.body.classList.contains('is-focused')) {
              this.tabChange(element, tab);

              if (tab.querySelector('a, input')) {
                this.accessibility.lastFocused = element;

                this.accessibility.a11y.trapFocus(tab, {
                  elementToFocus: tab.querySelector('a:first-child, input:first-child'),
                });
              }
            }
          });
        });
      }
    }

    tabChange(element, tab) {
      this.container.querySelector(`${selectors$9.tabsLi}.${classes$1.classCurrent}`).classList.remove(classes$1.classCurrent);
      this.container.querySelector(`${selectors$9.tabContent}.${classes$1.classCurrent}`).classList.remove(classes$1.classCurrent);

      element.classList.add(classes$1.classCurrent);
      tab.classList.add(classes$1.classCurrent);

      if (element.classList.contains(classes$1.classHide)) {
        tab.classList.add(classes$1.classHide);
      }

      this.checkVisibleTabLinks();

      this.container.dispatchEvent(new CustomEvent('theme:tab:change'));
    }

    initNativeScrollbar() {
      if (this.scrollbarHolder.length) {
        this.scrollbarHolder.forEach((scrollbar) => {
          new NativeScrollbar(scrollbar);
        });
      }
    }

    checkVisibleTabLinks() {
      const tabsNavList = this.container.querySelectorAll(selectors$9.tabsLi);
      const tabsNavListHided = this.container.querySelectorAll(`${selectors$9.tabLink}.${classes$1.classHide}`);
      const difference = tabsNavList.length - tabsNavListHided.length;

      if (difference < 2) {
        this.container.classList.add(classes$1.classAlt);
      } else {
        this.container.classList.remove(classes$1.classAlt);
      }
    }

    checkRecentTab() {
      const tabLink = this.container.querySelector(selectors$9.tabLinkRecent);

      if (tabLink) {
        tabLink.classList.remove(classes$1.classHide);
        const tabLinkIdx = parseInt(tabLink.getAttribute(selectors$9.dataTab));
        const tabContent = this.container.querySelector(`${selectors$9.tabContent}[${selectors$9.dataTabIndex}="${tabLinkIdx}"]`);

        if (tabContent) {
          tabContent.classList.remove(classes$1.classHide);
        }

        this.checkVisibleTabLinks();

        this.initNativeScrollbar();
      }
    }

    hideRelatedTab() {
      const relatedSection = this.container.querySelector(selectors$9.dataRelatedSectionElem);
      if (!relatedSection) {
        return;
      }

      const parentTabContent = relatedSection.closest(`${selectors$9.tabContent}.${classes$1.classCurrent}`);
      if (!parentTabContent) {
        return;
      }
      const parentTabContentIdx = parseInt(parentTabContent.getAttribute(selectors$9.dataTabIndex));
      const tabsNavList = this.container.querySelectorAll(selectors$9.tabsLi);

      if (tabsNavList.length > parentTabContentIdx) {
        const nextTabsNavLink = tabsNavList[parentTabContentIdx].nextSibling;

        if (nextTabsNavLink) {
          tabsNavList[parentTabContentIdx].classList.add(classes$1.classHide);
          nextTabsNavLink.dispatchEvent(new Event('click'));
          this.initNativeScrollbar();
        }
      }
    }

    onBlockSelect(evt) {
      const element = this.container.querySelector(`${selectors$9.tabLink}[${selectors$9.blockId}="${evt.detail.blockId}"]`);
      if (element) {
        element.dispatchEvent(new Event('click'));

        element.parentNode.scrollTo({
          top: 0,
          left: element.offsetLeft - element.clientWidth,
          behavior: 'smooth',
        });
      }
    }
  }

  const tabs = {
    onLoad() {
      sections$5[this.id] = [];
      const tabHolders = this.container.querySelectorAll(selectors$9.dataTabsHolder);

      tabHolders.forEach((holder) => {
        sections$5[this.id].push(new GlobalTabs(holder));
      });
    },
    onBlockSelect(e) {
      sections$5[this.id].forEach((el) => {
        if (typeof el.onBlockSelect === 'function') {
          el.onBlockSelect(e);
        }
      });
    },
  };

  const selectors$8 = {
    productForm: '[data-product-form]',
    productJson: '[data-product-json]',
    popupButton: '[data-toggle-product-modal]',
    zoomButton: '[data-zoom-button]',
    toggleTruncateHolder: '[data-truncated-holder]',
    toggleTruncateButton: '[data-truncated-button]',
    toggleTruncateContent: '[data-truncated-content]',
    toggleTruncateContentAttr: 'data-truncated-content',
  };

  const classes = {
    classExpanded: 'is-expanded',
    classVisible: 'is-visible',
  };

  const sections$4 = [];

  class ProductTemplate {
    constructor(section) {
      this.section = section;
      this.id = section.id;
      this.container = section.container;
      this.settings = section.settings;
      this.productFormElement = this.container.querySelector(selectors$8.productForm);

      modal(this.id);
      this.media = new Media(section);

      const productJSON = this.container.querySelector(selectors$8.productJson);
      if (productJSON && productJSON.innerHTML !== '') {
        this.product = JSON.parse(productJSON.innerHTML);
      } else {
        console.error('Missing product JSON');
        return;
      }

      this.truncateElementHolder = this.container.querySelector(selectors$8.toggleTruncateHolder);
      this.truncateElement = this.container.querySelector(selectors$8.toggleTruncateContent);
      this.resizeEventTruncate = () => this.truncateText();

      this.init();
    }

    init() {
      this.zoomEnabled = this.container.querySelector(selectors$8.zoomButton) !== null;
      if (this.zoomEnabled) {
        productPhotoswipeZoom(this.container, this.product);
      }

      if (this.truncateElementHolder && this.truncateElement) {
        setTimeout(this.resizeEventTruncate, 50);
        document.addEventListener('theme:resize', this.resizeEventTruncate);
      }
    }

    truncateText() {
      if (this.truncateElementHolder.classList.contains(classes.classVisible)) return;
      const truncateRows = 5;
      const truncateElementCloned = this.truncateElement.cloneNode(true);
      const truncateElementClass = this.truncateElement.getAttribute(selectors$8.toggleTruncateContentAttr);
      const truncateNextElement = this.truncateElement.nextElementSibling;
      if (truncateNextElement) {
        truncateNextElement.remove();
      }

      this.truncateElement.parentElement.append(truncateElementCloned);

      const truncateAppendedElement = this.truncateElement.nextElementSibling;
      truncateAppendedElement.classList.add(truncateElementClass);
      truncateAppendedElement.removeAttribute(selectors$8.toggleTruncateContentAttr);

      showElement(truncateAppendedElement);

      ellipsed.ellipsis(truncateAppendedElement, truncateRows, {
        replaceStr: '',
      });

      hideElement(truncateAppendedElement);

      if (this.truncateElement.innerHTML !== truncateAppendedElement.innerHTML) {
        this.truncateElementHolder.classList.add(classes.classExpanded);
      } else {
        truncateAppendedElement.remove();
        this.truncateElementHolder.classList.remove(classes.classExpanded);
      }

      this.toggleTruncatedContent(this.truncateElementHolder);
    }

    toggleTruncatedContent(holder) {
      const toggleButton = holder.querySelector(selectors$8.toggleTruncateButton);
      if (toggleButton) {
        toggleButton.addEventListener('click', (e) => {
          e.preventDefault();
          holder.classList.remove(classes.classExpanded);
          holder.classList.add(classes.classVisible);
        });
      }
    }

    onBlockSelect(event) {
      const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
      if (block) {
        block.dispatchEvent(new Event('click'));
      }
    }

    onBlockDeselect(event) {
      const block = this.container.querySelector(`[data-block-id="${event.detail.blockId}"]`);
      if (block) {
        block.dispatchEvent(new Event('click'));
      }
    }

    onUnload() {
      this.media.destroy();
      if (this.truncateElementHolder && this.truncateElement) {
        document.removeEventListener('theme:resize', this.resizeEventTruncate);
      }
    }
  }

  const productSection = {
    onLoad() {
      sections$4[this.id] = new ProductTemplate(this);
    },
    onUnload() {
      if (typeof sections$4[this.id].unload === 'function') {
        sections$4[this.id].unload();
      }
    },
    onBlockSelect(evt) {
      if (typeof sections$4[this.id].onBlockSelect === 'function') {
        sections$4[this.id].onBlockSelect(evt);
      }
    },
    onBlockDeselect(evt) {
      if (typeof sections$4[this.id].onBlockDeselect === 'function') {
        sections$4[this.id].onBlockDeselect(evt);
      }
    },
  };

  register('product', [productSection, pickupAvailability, productFormSection, swatchSection, productAddSection, accordion, tabs, popoutSection]);

  const relatedSection = {
    onLoad: function () {
      const relatedSection = this.container;
      const parent = relatedSection.parentElement;
      const productId = this.container.getAttribute('data-product-id');
      const limit = this.container.getAttribute('data-limit');
      const route = window.theme.routes.product_recommendations_url || '/recommendations/products/';
      const requestUrl = `${route}?section_id=related&limit=${limit}&product_id=${productId}`;
      parent.style.display = 'none';
      axios
        .get(requestUrl)
        .then(function (response) {
          const fresh = document.createElement('div');
          fresh.innerHTML = response.data;
          parent.innerHTML = fresh.querySelector('[data-related-section]').innerHTML;
          parent.innerHTML = fresh.querySelector('[data-related-section]').innerHTML;
          makeGridSwatches(relatedSection);
          slideDown(parent);
          setTimeout(() => {
            new DefaultSlider(parent);
          }, 600);
        })
        .catch(function (error) {
          console.warn(error);
        });
    },
  };

  register('related', relatedSection);

  register('reviews', slider);

  const selectors$7 = {
    button: '[data-scroll-down]',
  };

  class ScrollButton {
    constructor(el) {
      this.wrapper = el;
      this.init();
    }

    init() {
      const buttons = this.wrapper.querySelectorAll(selectors$7.button);
      if (buttons) {
        buttons.forEach((btn) => {
          btn.addEventListener('click', this.scroll.bind(this));
        });
      }
    }

    scroll() {
      const bottom = this.wrapper.offsetTop + this.wrapper.clientHeight;
      window.scroll({
        top: bottom,
        left: 0,
        behavior: 'smooth',
      });
    }
  }

  const scrollButton = {
    onLoad() {
      this.scrollButton = new ScrollButton(this.container);
    },
    onUnload: function () {
      delete this.scrollButton;
    },
  };

  const sections$3 = [];
  const selectors$6 = {
    wrapper: '[data-slideshow-wrapper]',
    speed: 'data-slideshow-speed',
    autoplay: 'data-slideshow-autoplay',
    slideCount: 'data-slideshow-slides',
    prevButton: '[slide-custom-prev]',
    nextButton: '[slide-custom-next]',
    flickityDisableClass: 'flickity-disabled-mobile',
  };

  class Slideshow {
    constructor(section) {
      this.container = section.container;
      this.wrapper = this.container.querySelector(selectors$6.wrapper);
      this.speed = this.wrapper.getAttribute(selectors$6.speed);
      this.autoplay = this.wrapper.getAttribute(selectors$6.autoplay) === 'true';
      this.slideCount = parseInt(this.wrapper.getAttribute(selectors$6.slideCount), 10);
      this.prevButtons = this.wrapper.querySelectorAll(selectors$6.prevButton);
      this.nextButtons = this.wrapper.querySelectorAll(selectors$6.nextButton);
      this.flkty = null;
      this.init();
    }

    init() {
      const settings = {
        autoPlay: this.autoplay && this.speed ? parseInt(this.speed) : false,
        contain: false,
        pageDots: true,
        adaptiveHeight: true,
        accessibility: true,
        wrapAround: this.slideCount !== 2,
        prevNextButtons: false,
        draggable: true,
        fade: true,
        watchCSS: true,
      };
      this.flkty = new FlickityFade(this.wrapper, settings);

      if (this.prevButtons.length) {
        this.prevButtons.forEach((e) => {
          e.onclick = () => {
            this.flkty.previous(true, false);
          };
        });
      }
      if (this.nextButtons.length) {
        this.nextButtons.forEach((e) => {
          e.onclick = () => {
            this.flkty.next(true, false);
          };
        });
      }

      this.stopSlider();

      document.addEventListener('theme:resize', () => {
        this.stopSlider();
      });
    }

    stopSlider() {
      if (window.innerWidth < window.theme.sizes.medium && this.wrapper?.classList.contains(selectors$6.flickityDisableClass)) {
        new CustomScrollbar(this.container);
      }
    }

    unload() {
      this.flkty.destroy();
    }

    onBlockSelect(evt) {
      const indexEl = evt.target.closest('[data-slideshow-index]');
      const slideIndex = indexEl.getAttribute('data-slideshow-index');
      const select = parseInt(slideIndex, 10);
      this.flkty.selectCell(select);
      this.flkty.pausePlayer();
    }

    onBlockDeselect() {
      if (this.autoplay) {
        this.flkty.unpausePlayer();
      }
    }
  }

  const slideshowSection = {
    onLoad() {
      sections$3[this.id] = new Slideshow(this);
    },
    onUnload() {
      if (typeof sections$3[this.id].unload === 'function') {
        sections$3[this.id].unload();
      }
    },
    onBlockSelect(evt) {
      if (typeof sections$3[this.id].onBlockSelect === 'function') {
        sections$3[this.id].onBlockSelect(evt);
      }
    },
    onBlockDeselect(evt) {
      if (typeof sections$3[this.id].onBlockSelect === 'function') {
        sections$3[this.id].onBlockDeselect(evt);
      }
    },
  };

  register('slideshow', [slideshowSection, scrollButton]);

  register('team', slider);

  var styles = {};
  styles.basic = [];
  /* eslint-disable */
  styles.light = [
    {featureType: 'administrative', elementType: 'labels', stylers: [{visibility: 'on'}, {lightness: '64'}, {hue: '#ff0000'}]},
    {featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{color: '#bdbdbd'}]},
    {featureType: 'administrative', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'landscape', elementType: 'all', stylers: [{color: '#f0f0f0'}, {visibility: 'simplified'}]},
    {featureType: 'landscape.natural.landcover', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'landscape.natural.terrain', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'geometry.fill', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'labels', stylers: [{lightness: '100'}]},
    {featureType: 'poi.park', elementType: 'all', stylers: [{visibility: 'on'}]},
    {featureType: 'poi.park', elementType: 'geometry', stylers: [{saturation: '-41'}, {color: '#e8ede7'}]},
    {featureType: 'poi.park', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road', elementType: 'all', stylers: [{saturation: '-100'}]},
    {featureType: 'road', elementType: 'labels', stylers: [{lightness: '25'}, {gamma: '1.06'}, {saturation: '-100'}]},
    {featureType: 'road.highway', elementType: 'all', stylers: [{visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{gamma: '10.00'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}, {visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{weight: '0.01'}]},
    {featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'road.local', elementType: 'geometry.fill', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{gamma: '10.00'}, {lightness: '100'}, {weight: '0.4'}]},
    {featureType: 'road.local', elementType: 'labels', stylers: [{visibility: 'simplified'}, {weight: '0.01'}, {lightness: '39'}]},
    {featureType: 'road.local', elementType: 'labels.text.stroke', stylers: [{weight: '0.50'}, {gamma: '10.00'}, {lightness: '100'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'water', elementType: 'all', stylers: [{color: '#cfe5ee'}, {visibility: 'on'}]},
  ];

  styles.light_blank = [
    {featureType: 'all', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'administrative', elementType: 'labels', stylers: [{visibility: 'off'}, {lightness: '64'}, {hue: '#ff0000'}]},
    {featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{color: '#bdbdbd'}]},
    {featureType: 'administrative', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'landscape', elementType: 'all', stylers: [{color: '#f0f0f0'}, {visibility: 'simplified'}]},
    {featureType: 'landscape.natural.landcover', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'landscape.natural.terrain', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'geometry.fill', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'labels', stylers: [{lightness: '100'}]},
    {featureType: 'poi.park', elementType: 'all', stylers: [{visibility: 'on'}]},
    {featureType: 'poi.park', elementType: 'geometry', stylers: [{saturation: '-41'}, {color: '#e8ede7'}]},
    {featureType: 'poi.park', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road', elementType: 'all', stylers: [{saturation: '-100'}]},
    {featureType: 'road', elementType: 'labels', stylers: [{lightness: '25'}, {gamma: '1.06'}, {saturation: '-100'}, {visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'all', stylers: [{visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{gamma: '10.00'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}, {visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{weight: '0.01'}]},
    {featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'road.local', elementType: 'geometry.fill', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{gamma: '10.00'}, {lightness: '100'}, {weight: '0.4'}]},
    {featureType: 'road.local', elementType: 'labels', stylers: [{visibility: 'off'}, {weight: '0.01'}, {lightness: '39'}]},
    {featureType: 'road.local', elementType: 'labels.text.stroke', stylers: [{weight: '0.50'}, {gamma: '10.00'}, {lightness: '100'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'water', elementType: 'all', stylers: [{color: '#cfe5ee'}, {visibility: 'on'}]},
  ];

  styles.white_blank = [
    {featureType: 'all', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{color: '#444444'}]},
    {featureType: 'landscape', elementType: 'all', stylers: [{color: '#f2f2f2'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'road', elementType: 'all', stylers: [{saturation: -100}, {lightness: 45}]},
    {featureType: 'road.highway', elementType: 'all', stylers: [{visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0'}]},
    {featureType: 'road.arterial', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'water', elementType: 'all', stylers: [{color: '#e4e4e4'}, {visibility: 'on'}]},
  ];

  styles.white_label = [
    {featureType: 'all', elementType: 'all', stylers: [{visibility: 'simplified'}]},
    {featureType: 'all', elementType: 'labels', stylers: [{visibility: 'simplified'}]},
    {featureType: 'administrative', elementType: 'labels', stylers: [{gamma: '3.86'}, {lightness: '100'}]},
    {featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{color: '#cccccc'}]},
    {featureType: 'landscape', elementType: 'all', stylers: [{color: '#f2f2f2'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'road', elementType: 'all', stylers: [{saturation: -100}, {lightness: 45}]},
    {featureType: 'road.highway', elementType: 'all', stylers: [{visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'labels.text.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0'}]},
    {featureType: 'road.arterial', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'labels.text', stylers: [{visibility: 'off'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'water', elementType: 'all', stylers: [{color: '#e4e4e4'}, {visibility: 'on'}]},
  ];

  styles.dark_blank = [
    {featureType: 'all', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'all', elementType: 'labels.text.fill', stylers: [{saturation: 36}, {color: '#000000'}, {lightness: 40}]},
    {featureType: 'all', elementType: 'labels.text.stroke', stylers: [{visibility: 'on'}, {color: '#000000'}, {lightness: 16}]},
    {featureType: 'all', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'administrative', elementType: 'geometry.fill', stylers: [{color: '#000000'}, {lightness: 20}]},
    {featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{color: '#000000'}, {lightness: 17}, {weight: 1.2}]},
    {featureType: 'administrative', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'landscape', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 20}]},
    {featureType: 'landscape', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 21}]},
    {featureType: 'road', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{color: '#000000'}, {lightness: 17}, {weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{color: '#000000'}, {lightness: 29}, {weight: '0.01'}]},
    {featureType: 'road.arterial', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 18}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 16}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'transit', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 19}]},
    {featureType: 'water', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 17}]},
  ];

  styles.dark_label = [
    {featureType: 'all', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'all', elementType: 'labels.text.fill', stylers: [{saturation: 36}, {color: '#000000'}, {lightness: 40}]},
    {featureType: 'all', elementType: 'labels.text.stroke', stylers: [{visibility: 'on'}, {color: '#000000'}, {lightness: 16}]},
    {featureType: 'all', elementType: 'labels.icon', stylers: [{visibility: 'off'}]},
    {featureType: 'administrative', elementType: 'geometry.fill', stylers: [{color: '#000000'}, {lightness: 20}]},
    {featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{color: '#000000'}, {lightness: 17}, {weight: 1.2}]},
    {featureType: 'administrative', elementType: 'labels', stylers: [{visibility: 'simplified'}, {lightness: '-82'}]},
    {featureType: 'administrative', elementType: 'labels.text.stroke', stylers: [{invert_lightness: true}, {weight: '7.15'}]},
    {featureType: 'landscape', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 20}]},
    {featureType: 'landscape', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'poi', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 21}]},
    {featureType: 'road', elementType: 'labels', stylers: [{visibility: 'simplified'}]},
    {featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{color: '#000000'}, {lightness: 17}, {weight: '0.8'}]},
    {featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{color: '#000000'}, {lightness: 29}, {weight: '0.01'}]},
    {featureType: 'road.highway', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'road.arterial', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 18}]},
    {featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 16}]},
    {featureType: 'road.local', elementType: 'geometry.stroke', stylers: [{weight: '0.01'}]},
    {featureType: 'road.local', elementType: 'labels', stylers: [{visibility: 'off'}]},
    {featureType: 'transit', elementType: 'all', stylers: [{visibility: 'off'}]},
    {featureType: 'transit', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 19}]},
    {featureType: 'water', elementType: 'geometry', stylers: [{color: '#000000'}, {lightness: 17}]},
  ];
  /* eslint-enable */

  function mapStyle(key) {
    return styles[key];
  }

  window.theme.allMaps = window.theme.allMaps || {};
  let allMaps = window.theme.allMaps;

  class Map {
    constructor(section) {
      this.container = section.container;
      this.mapWrap = this.container.querySelector('[data-map-container]');
      this.styleString = this.container.getAttribute('data-style') || '';
      this.key = this.container.getAttribute('data-api-key');
      this.zoomString = this.container.getAttribute('data-zoom') || 14;
      this.address = this.container.getAttribute('data-address');
      this.enableCorrection = this.container.getAttribute('data-latlong-correction');
      this.lat = this.container.getAttribute('data-lat');
      this.long = this.container.getAttribute('data-long');
      if (this.key) {
        this.initMaps();
      }
    }

    initMaps() {
      const urlKey = `https://maps.googleapis.com/maps/api/js?key=${this.key}`;
      loadScript$1({url: urlKey})
        .then(() => {
          return this.enableCorrection === 'true' && this.lat !== '' && this.long !== '' ? new window.google.maps.LatLng(this.lat, this.long) : geocodeAddressPromise(this.address);
        })
        .then((center) => {
          var zoom = parseInt(this.zoomString, 10);
          const styles = mapStyle(this.styleString);
          var mapOptions = {
            zoom,
            styles,
            center,
            draggable: true,
            clickableIcons: false,
            scrollwheel: false,
            zoomControl: false,
            disableDefaultUI: true,
          };
          const map = createMap(this.mapWrap, mapOptions);
          return map;
        })
        .then((map) => {
          this.map = map;
          allMaps[this.id] = map;
        })
        .catch((e) => {
          console.log('Failed to load Google Map');
          console.log(e);
        });
    }

    onUnload() {
      if (typeof window.google !== 'undefined') {
        window.google.maps.event.clearListeners(this.map, 'resize');
      }
    }
  }

  function createMap(container, options) {
    var map = new window.google.maps.Map(container, options);
    var center = map.getCenter();

    new window.google.maps.Marker({
      map: map,
      position: center,
    });

    window.google.maps.event.addDomListener(window, 'resize', function () {
      window.google.maps.event.trigger(map, 'resize');
      map.setCenter(center);
    });
    return map;
  }

  function geocodeAddressPromise(address) {
    return new Promise((resolve, reject) => {
      var geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({address: address}, function (results, status) {
        if (status == 'OK') {
          var latLong = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          resolve(latLong);
        } else {
          reject(status);
        }
      });
    });
  }

  const mapSection = {
    onLoad() {
      allMaps[this.id] = new Map(this);
    },
    onUnload() {
      if (typeof allMaps[this.id].unload === 'function') {
        allMaps[this.id].unload();
      }
    },
  };

  register('section-map', mapSection);

  register('banner', [parallaxImage, scrollButton]);

  const defaultOptions = {
    autoplay: true,
    loop: true,
    controls: true,
    muted: false,
    playsinline: true,
  };

  function embedVimeo(uniqueKey, options) {
    const playerOptions = {
      ...defaultOptions,
      ...options,
    };
    const playerWrapper = document.querySelector(`[data-player="${uniqueKey}"]`);
    const playerElement = playerWrapper.querySelector('iframe, [data-replace]');
    const vimeoKey = playerWrapper.querySelector('[data-video-id]').getAttribute('data-video-id');
    const loadedPromise = loadScript$1({url: 'https://player.vimeo.com/api/player.js'});
    const vimeoSelector = `select-${uniqueKey}`;
    playerElement.setAttribute('id', vimeoSelector);
    const returnPlayer = loadedPromise
      .then(function () {
        const player = new window.Vimeo.Player(vimeoSelector, {
          ...playerOptions,
          id: vimeoKey,
        });
        playerWrapper.addEventListener('pause', function () {
          try {
            if (player.pause) {
              player.pause();
            }
          } catch (e) {
            console.warn(e);
          }
        });
        playerWrapper.addEventListener('play-desktop', function () {
          if (!isTouch()) {
            playerWrapper.dispatchEvent(new Event('play'));
          }
        });
        playerWrapper.addEventListener('play', function () {
          if (player.play) {
            player.play();
          }
        });
        playerWrapper.addEventListener('destroy', function () {
          try {
            if (player.destroy) {
              player.destroy();
            }
          } catch (e) {
            console.log(e);
          }
        });
        return player;
      })
      .catch(function (err) {
        console.error(err);
      });
    return returnPlayer;
  }

  const selectors$5 = {
    videoPopup: '[data-video-popup]',
    videoAutoplay: '[data-video-autoplay]',
    dataUnique: 'data-unique',
    dataVideoID: 'data-video-id',
    dataVideoType: 'data-video-type',
    player: 'data-player',
  };

  /**
   * Finds the modal body, which has been moved to the document root
   * and appends a unique ID for youtube and vimeo to init players.
   * Modal Event Logic:
   * When a modal opens it creates and plays the video
   * When a modal opens it pauses background videos in this section
   * --
   * When a modal closes it destroys the player
   * When a modal closes it plays background videos anywhere on the page
   */
  class VideoModal {
    constructor(holder) {
      this.popup = holder.querySelector(selectors$5.videoPopup);
      this.backgroundVideo = holder.querySelector(selectors$5.videoAutoplay);

      if (this.popup) {
        this.unique = this.popup.getAttribute(selectors$5.dataUnique);
        this.video = this.popup.getAttribute(selectors$5.dataVideoID);
        this.type = this.popup.getAttribute(selectors$5.dataVideoType);
        this.uniqueKey = `${this.video}-${this.unique}`;
        this.player = document.querySelector(`[${selectors$5.player}="${this.uniqueKey}"]`);

        this.init();
      }
    }

    init() {
      MicroModal.init({
        onShow: () => {
          let playerPromise = {};

          if (this.backgroundVideo) {
            this.backgroundVideo.dispatchEvent(new Event('pause'));
          }

          if (this.type === 'youtube') {
            playerPromise = embedYoutube(this.uniqueKey);
          }

          if (this.type === 'vimeo') {
            playerPromise = embedVimeo(this.uniqueKey);
          }

          playerPromise.then(() => {
            this.player.dispatchEvent(new Event('play'));
          });
        },
        onClose: (modal, el, event) => {
          event.preventDefault();
          this.player.dispatchEvent(new Event('destroy'));

          if (this.backgroundVideo) {
            this.backgroundVideo.dispatchEvent(new Event('play'));
          }
        },
        openTrigger: `data-trigger-${this.uniqueKey}`,
      });
    }
  }

  const videoModalSection = {
    onLoad() {
      new VideoModal(this.container);
    },
  };

  const selectors$4 = {
    autoplay: '[data-video-autoplay]',
    videoType: 'data-video-type',
    player: 'data-player',
  };

  const vimeoOptions = {
    autoplay: false,
    loop: true,
    controls: false,
    muted: true,
    playsinline: true,
  };

  const youtubeOptions = {
    autoplay: 1,
    cc_load_policy: 0,
    iv_load_policy: 0,
    modestbranding: 1,
    playsinline: 1,
    fs: 0,
    controls: 0,
  };

  let sections$2 = {};

  class VideoAPIPlayer {
    constructor(container) {
      this.autoplayVideo = container.querySelector(selectors$4.autoplay);

      if (this.autoplayVideo) {
        this.videoType = this.autoplayVideo.getAttribute(selectors$4.videoType);
        this.uniqueKey = this.autoplayVideo.getAttribute(selectors$4.player);

        this.init();
      }
    }

    init() {
      if (this.videoType === 'vimeo') {
        this.player = embedVimeo(this.uniqueKey, vimeoOptions);
      }

      if (this.videoType === 'youtube') {
        this.player = embedYoutube(this.uniqueKey, youtubeOptions);
      }

      this.initPlayer();
    }

    initPlayer() {
      this.player
        .then((player) => {
          if (this.videoType === 'vimeo') {
            return this.vimeoBackground(player);
          }

          if (this.videoType === 'youtube') {
            return this.youtubeBackground(player);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }

    youtubeBackground(player) {
      player.addEventListener('onReady', (event) => {
        event.target.mute();
        event.target.playVideo();
      });

      player.addEventListener('onStateChange', (event) => {
        switch (event.data) {
          case -1:
            // unstarted
            event.target.mute();
            break;
          case 0:
            // video is over, replay
            event.target.playVideo();
            break;
          case 1:
            // video is playing, set wrapepr opecity to 1

            event.target.getIframe().closest(`[${selectors$4.player}]`).style.opacity = '1';
            break;
        }
      });

      return player;
    }

    vimeoBackground(player) {
      player
        .play()
        .then(() => {
          // The video is playing
          player.element.closest(`[${selectors$4.autoplay}]`).style.opacity = '1';
        })
        .catch((e) => {
          console.log(e);
        });

      player.setLoop(true);

      return player;
    }

    unload() {
      if (this.videoType === 'vimeo') {
        this.player.unload();
      }

      if (this.videoType === 'youtube') {
        this.player.destroy();
      }
    }
  }

  const videoSection = {
    onLoad() {
      sections$2[this.id] = new VideoAPIPlayer(this.container);
      new VideoModal(this.container);
    },
    onUnload() {
      if (typeof sections$2[this.id].unload === 'function') {
        sections$2[this.id].unload();
      }
    },
  };

  register('video', [videoSection, parallaxImage, scrollButton]);

  const selectors$3 = {
    trigger: '[data-toggle-password-modal]',
    errors: '.storefront-password-form .errors',
  };

  const sections$1 = {};

  class PasswordPage {
    constructor(section) {
      this.container = section.container;

      this.trigger = this.container.querySelector(selectors$3.trigger);
      this.errors = this.container.querySelector(selectors$3.errors);

      this.init();
    }

    init() {
      modal('password');
      if (this.errors) {
        this.trigger.click();
      }
    }
  }

  const passwordSection = {
    onLoad() {
      sections$1[this.id] = new PasswordPage(this);
    },
  };

  register('password', passwordSection);

  const selectors$2 = {
    zoomImage: '[data-image-zoom]',
    attrUnique: 'data-unique',
  };

  class GalleryZoom {
    constructor(container) {
      this.triggers = container.querySelectorAll(selectors$2.zoomImage);
      this.init();
    }

    init() {
      this.triggers.forEach((trigger) => {
        const unique = trigger.getAttribute(selectors$2.attrUnique);

        MicroModal.init({
          disableScroll: true,
          openTrigger: `data-popup-${unique}`,
          onShow: (modal) => {
            var images = modal.querySelectorAll('[data-src]', modal);
            images.forEach((image) => {
              if (image.getAttribute('src') === null) {
                const bigImage = image.getAttribute('data-src');
                image.setAttribute('src', bigImage);
              }
            });
          },
          onClose: (modal, el, event) => {
            event.preventDefault();
          },
        });
      });
    }
  }

  const galleryZoomSection = {
    onLoad() {
      new GalleryZoom(this.container);
    },
  };

  register('gallery', [galleryZoomSection, videoModalSection]);

  register('recent-products', recentProducts);

  const selectors$1 = {
    ajaxDisable: 'data-ajax-disable',
    shipping: '[data-shipping-estimate-form]',
    input: '[data-update-cart]',
    update: '[data-update-button]',
    bottom: '[data-cart-bottom]',
    upsellProduct: '[data-upsell-holder]',
    upsellButton: '[data-add-action-wrapper]',
  };

  const cartSection = {
    onLoad() {
      this.disabled = this.container.getAttribute(selectors$1.ajaxDisable) == 'true';
      if (this.disabled) {
        this.cart = new DiabledCart(this);
        return;
      }

      this.cart = new CartItems(this);
      const initPromise = this.cart.init();
      initPromise.then(() => {
        this.cart.loadHTML();
      });

      const hasShipping = this.container.querySelector(selectors$1.shipping);
      if (hasShipping) {
        new ShippingCalculator(this);
      }
    },
};

  class DiabledCart {
    constructor(section) {
      this.container = section.container;
      this.inputs = this.container.querySelectorAll(selectors$1.input);
      this.quantityWrappers = this.container.querySelectorAll(selectors$1.qty);
      this.updateBtn = this.container.querySelector(selectors$1.update);
      this.upsellProduct = this.container.querySelector(selectors$1.upsellProduct);

      this.initQuantity();
      this.initInputs();
      if (this.upsellProduct) {
        this.moveUpsell();
      }
    }

    initQuantity() {
      initQtySection(this.container);
    }

    moveUpsell() {
      const bottom = this.container.querySelector(selectors$1.bottom);
      bottom.insertBefore(this.upsellProduct, bottom.firstChild);

      const upsellButton = this.container.querySelector(selectors$1.upsellButton);
      new ProductAddButton(upsellButton);
    }

    initInputs() {
      this.inputs.forEach((input) => {
        input.addEventListener(
          'change',
          function () {
            this.updateBtn.classList.add('cart--dirty');
            this.updateBtn.classList.add('heartBeat');
            setTimeout(
              function () {
                this.updateBtn.classList.remove('heartBeat');
              }.bind(this),
              1300
            );
          }.bind(this)
        );
      });
    }
  }

  register('cart', [cartSection, accordion]);

  register('search-page', [collectionFiltersSidebar, collectionFiltersForm, swatchGridSection, accordion]);

  const selectors = {
    minimumAttribute: 'data-minimum',
  };

  const sections = {};

  const section = {
    onLoad() {
      const minimumVisibleSlidesDesktop = Number(this.container.getAttribute(selectors.minimumAttribute));
      const newConfig = {minimumVisibleSlidesDesktop};

      sections[this.id] = new DefaultSlider(this.container, newConfig);
    },
    onUnload() {
      if (typeof sections[this.id].unload === 'function') {
        sections[this.id].unload();
      }
    },
  };

  register('section-collection-grid', section);

  register('tabs', tabs);

  register('section-blog', slider);

  register('columns', slider);

  const wrap = (toWrap, wrapperClass = '', wrapper) => {
    wrapper = wrapper || document.createElement('div');
    wrapper.classList.add(wrapperClass);
    toWrap.parentNode.insertBefore(wrapper, toWrap);
    return wrapper.appendChild(toWrap);
  };

  const loaders = {};

  function loadScript(options = {}) {
    if (!options.type) {
      options.type = 'json';
    }

    if (options.url) {
      if (loaders[options.url]) {
        return loaders[options.url];
      } else {
        return getScriptWithPromise(options.url, options.type);
      }
    } else if (options.json) {
      if (loaders[options.json]) {
        return Promise.resolve(loaders[options.json]);
      } else {
        return window
          .fetch(options.json)
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            loaders[options.json] = response;
            return response;
          });
      }
    } else if (options.name) {
      const key = ''.concat(options.name, options.version);
      if (loaders[key]) {
        return loaders[key];
      } else {
        return loadShopifyWithPromise(options);
      }
    } else {
      return Promise.reject();
    }
  }

  function getScriptWithPromise(url, type) {
    const loader = new Promise((resolve, reject) => {
      if (type === 'text') {
        fetch(url)
          .then((response) => response.text())
          .then((data) => {
            resolve(data);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        getScript(
          url,
          function () {
            resolve();
          },
          function () {
            reject();
          }
        );
      }
    });

    loaders[url] = loader;
    return loader;
  }

  function loadShopifyWithPromise(options) {
    const key = ''.concat(options.name, options.version);
    const loader = new Promise((resolve, reject) => {
      try {
        window.Shopify.loadFeatures([
          {
            name: options.name,
            version: options.version,
            onLoad: (err) => {
              onLoadFromShopify(resolve, reject, err);
            },
          },
        ]);
      } catch (err) {
        reject(err);
      }
    });
    loaders[key] = loader;
    return loader;
  }

  function onLoadFromShopify(resolve, reject, err) {
    if (err) {
      return reject(err);
    } else {
      return resolve();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Load all registered sections on the page.
    load('*');

    // Animate on scroll
    if (window.theme && window.theme.animations) {
      AOS.init({once: true});
      document.body.classList.add('aos-initialized');
    }

    // When images load, clear the background color
    document.addEventListener('lazyloaded', function (event) {
      const lazyImage = event.target.parentNode;
      if (lazyImage.classList.contains('lazy-image')) {
        lazyImage.style.backgroundImage = 'none';
      }
    });

    // Target tables to make them scrollable
    const tableSelectors = '.rte table';
    const tables = document.querySelectorAll(tableSelectors);
    tables.forEach((table) => {
      wrap(table, 'rte__table-wrapper');
    });

    // Target iframes to make them responsive
    const iframeSelectors = '.rte iframe[src*="youtube.com/embed"], .rte iframe[src*="player.vimeo"], .rte iframe#admin_bar_iframe';
    const frames = document.querySelectorAll(iframeSelectors);
    frames.forEach((frame) => {
      wrap(frame, 'rte__video-wrapper');
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('focus-enabled');
    });
    document.addEventListener('keyup', (event) => {
      if (event.keyCode === 9) {
        document.body.classList.add('focus-enabled');
      }
    });

    // Apply a specific class to the html element for browser support of cookies.
    if (window.navigator.cookieEnabled) {
      document.documentElement.className = document.documentElement.className.replace('supports-no-cookies', 'supports-cookies');
    }

    // Common a11y fixes
    focusHash();
    bindInPageLinks();

    let hasNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;
    if (!hasNativeSmoothScroll) {
      loadScript({url: window.theme.assets.smoothscroll});
    }
  });

}(themeVendor.BodyScrollLock, themeVendor.themeCurrency, themeVendor.themeAddresses, themeVendor.Sqrl, themeVendor.axios, themeVendor.Flickity, themeVendor.Rellax, themeVendor.ellipsis, themeVendor.MicroModal, themeVendor.FlickityFade, themeVendor.FlickitySync, themeVendor.AOS));
//# sourceMappingURL=theme.js.map