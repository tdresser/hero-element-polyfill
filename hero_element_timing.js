(function () {
  'use strict';

  function observeForIntersection(node, name) {
    const config = {
      threshold: 1.0
    }

    var observer = new IntersectionObserver((entries, observer) => {
      // TODO - should we try to reuse observers?
      let earliestTime = Infinity;
      entries.forEach(entry => {
        if (entry.intersectionRatio < 1)
          return;
        console.log(entries);
        earliestTime = Math.min(earliestTime, entry.time);
      });
      if (earliestTime === Infinity)
        return;

      performance.queueEntry('hero-element-timing', earliestTime, 0, {name});
      observer.disconnect();
    }, config);
    observer.observe(node)
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(node => {
        if (!node.attributes)
          return;
        const nameAttr = node.attributes.getNamedItem('elementtiming');
        if (!nameAttr)
          return;
        const name = nameAttr.value;
        if (!name)
          return;
        observeForIntersection(node, name);
      });

      if(mutation.type == 'attributes') {
        // TODO - check what happens if you remove an attribute.
        observeForIntersection(mutation.target, mutation.target.getAttribute('elementTiming'));
      }
    });
  });

  const config = { attributes: true, childList: true, subtree:true, attributeFilter: ['elementtiming']};
  observer.observe(document.documentElement, config);
})();
