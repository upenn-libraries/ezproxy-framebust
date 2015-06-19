var conditionalRedirect = function conditionalRedirect(backendHost) {
  if (self === top) {
    var antiClickjack = document.getElementById("antiClickjack");
    antiClickjack.parentNode.removeChild(antiClickjack);
  } else if (backendHost === undefined || backendHost === null) {
    top.location = self.location;
  } else {
    top.location = constructRedirect(top.location.href, self.location.href, backendHost);
  }
};

var constructRedirect = function constructRedirect(topHref, selfHref, backendHost) {
  var pruned = pruneEZProxyURLQueryParam(selfHref);
  if (pruned === null) {
    return selfHref;
  } else {
    return pruned + backendHost + encodeURIComponent(topHref);
  }
};

var KEY = 'url=';

var pruneEZProxyURLQueryParam = function pruneEZProxyURLQueryParam(href) {
  var qIndex = href.indexOf('?');
  if (qIndex < 0 || qIndex + KEY.length >= href.length) {
    return null;
  } else if (href.substr(qIndex + 1, KEY.length) === KEY) {
    return href.substr(0, qIndex + 1 + KEY.length);
  } else {
    var limit = href.indexOf('#', qIndex + 1);
    var appendKey = '&' + KEY;
    var keyIndex = href.indexOf(appendKey, qIndex + 1);
    if (keyIndex < 0 || (limit >= 0 && keyIndex > limit)) {
      return null;
    } else {
      return href.substr(0, keyIndex + appendKey.length);
    }
  }
};

module.exports = {
  conditionalRedirect: conditionalRedirect,
  constructRedirect: constructRedirect,
  pruneEZProxyURLQueryParam: pruneEZProxyURLQueryParam
};
