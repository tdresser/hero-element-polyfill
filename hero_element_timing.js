(function () {
  'use strict';
  // Contains all performance observers listenening to custom entries.
  const customObservers = new Set();
  // Map from EVERY performance observer to its listener.
  const observerListeners = new WeakMap();

  const originalObserve = PerformanceObserver.prototype.observe;

  // TODO - what if we observe multiple times?
  // TODO - implement disconnect.
  PerformanceObserver.prototype.observe = function(args) {
    let nonCustomTypes = [];
    for (const type of args.entryTypes) {
      if (type == "heroelementtiming") {
        customObservers.add(this);
        // TODO - don't expose this.
        this.selector = args.selector;
        console.log(this.selector);
      } else {
        nonCustomTypes.push(type);
      }
    }

    if (nonCustomTypes.length > 0) {
      args.entryTypes = nonCustomTypes;
      originalObserve.call(this, args);
    }
  }

  const originalProto = PerformanceObserver.prototype;
  PerformanceObserver = function(listener) {
    const result = new originalProto.constructor(listener);
    observerListeners.set(result, listener);
    return result;
  }
  PerformanceObserver.prototype = originalProto;

  function queueHeroElementTimingEntry(selector, startTime, duration, data) {
    const performanceEntry = {};
    performanceEntry.prototype = PerformanceEntry;
    performanceEntry.entryType = "heroelementtiming";
    performanceEntry.name = selector;
    performanceEntry.startTime = startTime;
    performanceEntry.duration = duration;
    performanceEntry.data = data;

    for (const observer of customObservers) {
      if (observer.selector != selector)
        continue;
      const listener = observerListeners.get(observer);
      const list = {};
      list.prototype = PerformanceObserverEntryList;
      // TODO - override other methods.
      list.getEntries = function() {
        return [performanceEntry];
      }

      listener.call(this, list);
    };
  }

  function observeForIntersection(node, selector) {
    const config = {
      threshold: 1.0
    }

    var observer = new IntersectionObserver((entries, observer) => {
      // TODO - should we try to reuse observers?
      let earliestTime = Infinity;
      let target = null;
      entries.forEach(entry => {
        if (entry.intersectionRatio < 1)
          return;
        console.log(entries);
        earliestTime = Math.min(earliestTime, entry.time);
        target = entry.target;
      });

      if (earliestTime === Infinity)
        return;

      if (selector != target.firstObservingSelector)
        return;

      console.log("QUEUEENTRY");
      queueHeroElementTimingEntry(selector, earliestTime, 0);
      observer.disconnect();
    }, config);
    observer.observe(node)
  }

  const observer = new MutationObserver((mutations) => {
    // TODO - be more clever about when to re-execute selectors.
    customObservers.forEach(observer => {
      if (observer.selector) {
        let matchingElements = document.querySelectorAll(observer.selector);
        matchingElements.forEach(matchingElement => {
          if (matchingElement.firstObservingSelector)
            return;
          matchingElement.firstObservingSelector = observer.selector;
          observeForIntersection(matchingElement, observer.selector);
        });
      }
    });
  });

  const config = {attributes: true, childList: true, subtree:true};
  observer.observe(document.documentElement, config);
})();
