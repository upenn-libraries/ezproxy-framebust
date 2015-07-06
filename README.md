# ezproxy-framebust
Enables transparent framebusting from framed ezproxy login page 

## Motivation
A search/discovery UI seeks to enhance and provide context for protected 
resources by wrapping the protected resources in iframes. If the client 
is not authenticated, the EZProxy authentication service (widely used in 
libraries to authenticate users and proxy requests for access to IP-restricted
resources) prompts for authentication credentials. This is bad for two reasons: 

1. Security: users are prompted for institutional authentication credentials 
within the context on an insecure third-party page. It is *really* bad to
ask users to do this.
2. Accessibility: increasingly, many clients (browsers) are configured to
not allow third-party sites (including iframed sites) to set cookies. A client
configured in this way would be unable to login from an iframe, even if
they attempted to do so irrespective of the security concern mentioned above.

## Installation
1. Bundle this script, e.g., `browserify -r ezproxy-framebust > bundle.js`
2. Call script from the `<head/>` element of your login page (for EZProxy, this 
is most likely the `login.htm` page, whose source is located in the `docs` 
directory):

```html
<style id="antiClickjack">body{display:none !important;}</style>
<script type="text/javascript" src="bundle.js"></script>
<script type="text/javascript">
  require('ezproxy-framebust').conditionalRedirect([backendHost]);
</script>
```

This is analogous to vanilla OWASP example mentioned in the next 
section, but here we provide a `[backendHost]` argument (e.g., `var backendHost =
'http://127.0.0.1:8082/?redirect='`).  The backend host should be a special 
cooperating "redirect" server, whose sole purpose is as a proxy-authenticated 
transient element of the login workflow, invoked transparently, and only for 
unauthenticated users making an initial resource access attempt from a frame 
within an enclosing page.

For security reasons, you only want to allow this workflow to be initiated 
from (and permit backend redirects to) specific whitelisted hosts. For instance,
if your enclosing page is http://metasearch.library.college.edu, you will need
to:

1. Configure EZProxy to proxy your redirect server (password required), but to not 
proxy the redirect `Location` HTTP header, using a `NeverProxy` resource configuration 
directive, e.g.:

```
TITLE   Redirect Server
URL     http://127.0.0.1:8082
NeverProxy metasearch.library.college.edu
```

2. Whitelist redirects to http://metasearch.library.college.edu in the configuration
of the backend server. For example, using [this simple redirect server](https://github.com/upenn-libraries/redirect-server)
you would add http://metasearch.library.college.edu to the `validHosts.txt` file.

## Explanation
Implements a variant of the approach suggested in the [OWASP 
Clickjacking Defense Cheat Sheet](https://www.owasp.org/index.php/Clickjacking_Defense_Cheat_Sheet#Best-for-now_Legacy_Browser_Frame_Breaking_Script)

The desired process is for the framebuster to redirect the client to a top-level 
authentication page which, instead of proxying the originally requested 
protected resource, proxies to a cooperating redirect backend server, 
which will redirect the user to the originally-requested *top*-level page, 
from which the newly-authenticated client will be able to successfully load 
the protected resource within an iframe, without being prompted for authentication
credentials. 

This solution works around the security concern mentioned above. But it *also*
addresses the accessibility concern (by invoking the login page as a
top-level page). To put that another way: despite the comparative complexity of 
the request sequence, from the user's perspective the system should intuitively 
"just work" in the way that one would expect it to. 

### Custom EZProxy-specific query string manipulation
EZProxy doesn't handle "url" query param values in a standard way, and in fact 
can't handle properly escaped values in this field. So we need to accommodate 
this and parse what's there, with a custom query string parser/pruner. 

