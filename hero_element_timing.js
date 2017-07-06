(function () {
  'use strict';
  const heroElements = new WeakSet();
  const elementPreviousStyleStrings = new WeakMap();
  const pendingDisplayedHeroElements = [];

  function updateHeroElements(now) {
    window.requestAnimationFrame(updateHeroElements);

    while (pendingDisplayedHeroElements.length > 0) {
      const displayedElement = pendingDisplayedHeroElements.pop();
      console.log("DISPLAYED");
      console.log(displayedElement);
    }

    for (let element of document.querySelectorAll('*')) {
      const name = element.getAttribute('elementtiming');
      if (!name)
        continue;
      if (heroElements.has(element))
        continue;

      heroElements.add(element);

      const scriptNode = document.createElement('script');
      scriptNode.onload = () => {
        pendingDisplayedHeroElements.push(element);
      };
      scriptNode.src = "data:text/javascript;,";
      element.parentNode.insertBefore(scriptNode, element.nextSibling);
    }
  }
  window.requestAnimationFrame(updateHeroElements);
})();
