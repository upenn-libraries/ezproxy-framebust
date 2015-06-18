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
  var url = require('url');
  var keysIn = require('lodash.keysin');
  var topURL = url.parse(topHref);
  var selfURL = url.parse(selfHref, true);
  selfURL.search = null;
  delete selfURL.query['url'];
  var append;
  if (keysIn(selfURL.query) < 1) {
    append = '?';
  } else {
    append = '&';
  }
  return url.format(selfURL) + append + 'url=' + backendHost + topURL.path + topURL.hash;
};

module.exports = {
  conditionalRedirect: conditionalRedirect,
  constructRedirect: constructRedirect
};
