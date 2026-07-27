SIGSEGV: Segfault
base.apk            0x7db8bd5b68 null
base.apk            0x7db8bd588c null
base.apk            0x7db8add4b0 null
base.apk            0x7db8add044 null
base.apk            0x7db8ac2818 null
base.apk            0x7db8b2eb60 null
base.apk            0x7db894c4a4 null
base.apk            0x7dd8e77d14 facebook::react::RuntimeScheduler_Modern::performMicrotaskCheckpoint
base.apk            0x7dd8e77b80 facebook::react::RuntimeScheduler_Modern::runEventLoopTick
base.apk            0x7dd8e778ec facebook::react::RuntimeScheduler_Modern::runEventLoop
base.apk            0x7dd8e7de60 null
base.apk            0x7dd8e7de30 null
base.apk            0x7dd8e7dde0 null
base.apk            0x7dd8e7ddb4 null
base.apk            0x7dd8e7cea4 null
base.apk            0x7dd8816990 null
base.apk            0x7dd881683c null
base.apk            0x7dd8816580 null
base.apk            0x7dd88164e8 null
base.apk            0x7dd88164a0 null
base.apk            0x7dd881647c null
base.apk            0x7dd8815514 null
base.apk            0x7dd89a18d0 null
base.apk            0x7dd89a1894 null
base.apk            0x7dd8f873b4 null
base.apk            0x7dd8f87354 null
base.apk            0x7dd8f8730c null
base.apk            0x7dd8f872e8 null
base.apk            0x7dd8f86454 null
base.apk            0x7e315d7dd0 facebook::jni::detail::MethodWrapper<T>::dispatch
base.apk            0x7e315d7d10 facebook::jni::detail::FunctionWrapper<T>::call
libart              0x7e5cec23a0 null
0x003ef9ca30 null# facebook::react::MountingCoordinator::pullTransaction

**Issue ID:** 7629970697
**Short ID:** REACT-NATIVE-2
**Project:** react-native
**Date:** Jul 24, 2026 1:15:53 AM WAT

## Tags

- **device:** 2201117TG
- **device.class:** medium
- **device.family:** 2201117TG
- **environment:** development
- **event.environment:** native
- **event.origin:** android
- **handled:** no
- **interface_type:** exception
- **isSideLoaded:** true
- **level:** fatal
- **mechanism:** signalhandler
- **os:** Android 13
- **os.build:** TKQ1.221114.001 test-keys
- **os.name:** Android
- **os.rooted:** no
- **release:** com.lyon32.lyxo@1.0.0+1
- **user:** id:84cd6f30409541e0b2403c93a422346c

## Exception

### Exception 1

**Type:** SIGSEGV
**Handled:** No
**Value:** Segfault

#### Stacktrace

```


 Unknown function in unknown file [Line null] (Not in app)
 facebook::react::MountingCoordinator::pullTransaction in unknown file [Line null] (Not in app)
 facebook::react::FabricUIManagerBinding::schedulerDidFinishTransaction in unknown file [Line null] (Not in app)
 facebook::react::Scheduler::uiManagerDidFinishTransaction in unknown file [Line null] (Not in app)
 facebook::react::UIManager::shadowTreeDidFinishTransaction in unknown file [Line null] (Not in app)
 facebook::react::ShadowTree::mount in unknown file [Line null] (Not in app)
 facebook::react::ShadowTree::tryCommit in unknown file [Line null] (Not in app)
 facebook::react::ShadowTree::commit in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 facebook::react::ShadowTreeRegistry::visit in unknown file [Line null] (Not in app)
```

SIGSEGV: Segfault
0x7cefc7a288 null
base.apk            0x7dd8920c74 facebook::react::MountingCoordinator::pullTransaction
base.apk            0x7dd8442c1c facebook::react::FabricUIManagerBinding::schedulerDidFinishTransaction
base.apk            0x7dd89a9a84 facebook::react::Scheduler::uiManagerDidFinishTransaction
base.apk            0x7dd8a02bb0 facebook::react::UIManager::shadowTreeDidFinishTransaction
base.apk            0x7dd892947c facebook::react::ShadowTree::mount
base.apk            0x7dd8929e34 facebook::react::ShadowTree::tryCommit
base.apk            0x7dd8929784 facebook::react::ShadowTree::commit
base.apk            0x7dd8a09b84 null
base.apk            0x7dd8a09b28 null
base.apk            0x7dd8a09ad8 null
base.apk            0x7dd8a09aac null
base.apk            0x7dd8a08b7c null
base.apk            0x7dd893bf10 null
base.apk            0x7dd8939908 null
base.apk            0x7dd8939878 facebook::react::ShadowTreeRegistry::visit
base.apk            0x7dd8a009cc facebook::react::UIManager::completeSurface
base.apk            0x7dd8a3a8a4 null
base.apk            0x7dd8a3a7ec null
base.apk            0x7dd8a3a778 null
base.apk            0x7dd8a3a72c null
base.apk            0x7dd8a39814 null
base.apk            0x7db8525e70 null
base.apk            0x7db86a4eb8 null
base.apk            0x7db86ac240 null
base.apk            0x7db86a5044 null
base.apk            0x7db868a818 null
base.apk            0x7db868993c null
base.apk            0x7db851a728 null
base.apk            0x7dd8355594 facebook::jsi::Function::call
base.apk            0x7dd83554e0 facebook::jsi::Function::call
base.apk            0x7dd89a6444 facebook::react::Task::execute
base.apk            0x7dd899f1ec facebook::react::RuntimeScheduler_Modern::executeTask
base.apk            0x7dd899fb70 facebook::react::RuntimeScheduler_Modern::runEventLoopTick
base.apk            0x7dd899f8ec facebook::react::RuntimeScheduler_Modern::runEventLoop
base.apk            0x7dd89a5e60 null
base.apk            0x7dd89a5e30 null
base.apk            0x7dd89a5de0 null
base.apk            0x7dd89a5db4 null
base.apk            0x7dd89a4ea4 null
base.apk            0x7dd833e990 null
base.apk            0x7dd833e83c null
base.apk            0x7dd833e580 null
base.apk            0x7dd833e4e8 null
base.apk            0x7dd833e4a0 null
base.apk            0x7dd833e47c null
base.apk            0x7dd833d514 null
base.apk            0x7dd84c98d0 null
base.apk            0x7dd84c9894 null
base.apk            0x7dd8aaf3b4 null
base.apk            0x7dd8aaf354 null
base.apk            0x7dd8aaf30c null
base.apk            0x7dd8aaf2e8 null
base.apk            0x7dd8aae454 null
base.apk            0x7e315d8dd0 facebook::jni::detail::MethodWrapper<T>::dispatch
base.apk            0x7e315d8d10 facebook::jni::detail::FunctionWrapper<T>::call
libart              0x7e5cec23a0 null
0x003ef9b810 null

# facebook::react::RuntimeScheduler_Modern::performMicrotaskCheckpoint

**Issue ID:** 7629929096
**Short ID:** REACT-NATIVE-1
**Project:** react-native
**Date:** Jul 24, 2026 12:41:09 AM WAT

## Tags

- **device:** 2201117TG
- **device.class:** medium
- **device.family:** 2201117TG
- **environment:** development
- **event.environment:** native
- **event.origin:** android
- **handled:** no
- **interface_type:** exception
- **isSideLoaded:** true
- **level:** fatal
- **mechanism:** signalhandler
- **os:** Android 13
- **os.build:** TKQ1.221114.001 test-keys
- **os.name:** Android
- **os.rooted:** no
- **release:** com.lyon32.lyxo@1.0.0+1
- **user:** id:84cd6f30409541e0b2403c93a422346c

## Exception

### Exception 1

**Type:** SIGSEGV
**Handled:** No
**Value:** Segfault

#### Stacktrace

```
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 facebook::react::RuntimeScheduler_Modern::performMicrotaskCheckpoint in unknown file [Line null] (Not in app)
 facebook::react::RuntimeScheduler_Modern::runEventLoopTick in unknown file [Line null] (Not in app)
 facebook::react::RuntimeScheduler_Modern::runEventLoop in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
 Unknown function in unknown file [Line null] (Not in app)
```

## Breadcrumbs

- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: View
  {"data":"{\"path\":[{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\":\"ScrollView\"},{\"name\":\"CssInterop.ScrollView\"},{\"name\":\"OnboardingDetailsScreen(./onboarding/onboarding-details.tsx)\"},{\"name\":\"RouteNode\"},{\"name\":\"Route(onboarding-details)\"},{\"name\":\"HeaderBackContext\"},{\"name\":\"HeaderShownContext\"},{\"name\":\"HeaderHeightContext\"},{\"name\":\"DebugContainer\"},{\"name\":\"Animated(Anonymous)\"},{\"name\":\"Screen\"},{\...
- **user** `touch` [info]
  Touch event within element: Text
  {"data":"{\"path\":[{\"name\":\"Text\"},{\"name\":\"CssInterop.Text\"},{\"name\":\"View\"},{\"name\":\"CssInterop.View\"},{\"name\"
  ... (breadcrumbs truncated to first 5,000 characters)

Error: Node.js 20 detected without native WebSocket support.

# Error: Node.js 20 detected without native WebSocket support.

**Issue ID:** 7629097425
**Short ID:** NODE-EXPRESS-1
**Project:** node-express
**Date:** Jul 23, 2026 3:59:10 PM WAT

## Tags

- **browser:** curl 8.18.0
- **browser.name:** curl
- **environment:** development
- **handled:** yes
- **interface_type:** exception
- **level:** error
- **mechanism:** generic
- **os:** Windows 10.0.26200
- **os.name:** Windows
- **runtime:** node v20.20.2
- **runtime.name:** node
- **server_name:** LYON
- **transaction:** PATCH /v1/profiles/me/billing-region
- **url:** http://localhost:3000/v1/profiles/me/billing-region

## Exception

### Exception 1

**Type:** Error
**Handled:** Yes
**Value:** Node.js 20 detected without native WebSocket support.

Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })

#### Stacktrace

```
 WebSocketFactory.getWebSocketConstructor in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\lib\websocket-factory.js [Line 103] (Not in app)
        if (env.wsConstructor) {
            return env.wsConstructor;
        }
        let errorMessage = env.error || 'WebSocket not supported in this environment.';
        if (env.workaround) {
            errorMessage += `\n\nSuggested solution: ${env.workaround}`;
        }
        throw new Error(errorMessage);  <-- SUSPECT LINE
    }
    /**
     * Detects whether the runtime can establish WebSocket connections.
     *
     * @category Realtime
     *
     * @example Example in a Node.js script
 RealtimeClient._initializeOptions in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js [Line 642] (Not in app)
        const result = {};
        result.timeout = (_c = options === null || options === void 0 ? void 0 : options.timeout) !== null && _c !== void 0 ? _c : constants {snip}
        result.heartbeatIntervalMs =
            (_d = options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs) !== null && _d !== void 0 ? _d : CONNECTION {snip}
        this._disconnectOnEmptyChannelsAfterMs =
            (_e = options === null || options === void 0 ? void 0 : options.disconnectOnEmptyChannelsAfterMs) !== null && _e !== void 0 ? _e {snip}
        // @ts-ignore - mismatch between phoenix and supabase
        result.transport = (_g = options === null || options === void 0 ? void 0 : options.transport) !== null && _g !== void 0 ? _g : webso {snip}  <-- SUSPECT LINE
        result.params = options === null || options === void 0 ? void 0 : options.params;
        result.logger = options === null || options === void 0 ? void 0 : options.logger;
        result.heartbeatCallback = this._wrapHeartbeatCallback(options === null || options === void 0 ? void 0 : options.heartbeatCallback);
        result.sessionStorage = (_h = options === null || options === void 0 ? void 0 : options.sessionStorage) !== null && _h !== void 0 ?  {snip}
        result.reconnectAfterMs =
            (_j = options === null || options === void 0 ? void 0 : options.reconnectAfterMs) !== null && _j !== void 0 ? _j : ((tries) => {
                return RECONNECT_INTERVALS[tries - 1] || DEFAULT_RECONNECT_FALLBACK;
 new RealtimeClient in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js [Line 185] (Not in app)
            return (...args) => fetch(...args);
        };
        // Validate required parameters
        if (!((_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.apikey)) {
            throw new Error('API key is required to connect to Realtime');
        }
        this.apiKey = options.params.apikey;
        const socketAdapterOptions = this._initializeOptions(options);  <-- SUSPECT LINE
        this.socketAdapter = new socketAdapter_1.default(endPoint, socketAdapterOptions);
        this.httpEndpoint = (0, transformers_1.httpEndpointURL)(endPoint);
        this.fetch = this._resolveFetch(options === null || options === void 0 ? void 0 : options.fetch);
    }
    /**
     * Connects the socket, unless already connected.
     *
 SupabaseClient._initRealtimeClient in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs [Line 1429] (Not in app)
			fetch: fetch$1,
			lockAcquireTimeout,
			skipAutoInitialize,
			hasCustomAuthorizationHeader: Object.keys(this.headers).some((key) => key.toLowerCase() === "authorization")
		});
	}
	_initRealtimeClient(options) {
		return new _supabase_realtime_js.RealtimeClient(this.realtimeUrl.href, _objectSpread2(_objectSpread2({}, options), {}, { params: _objectSp {snip}  <-- SUSPECT LINE
	}
	_listenForAuthEvents() {
		return this.auth.onAuthStateChange((event, session) => {
			this._handleTokenChanged(event, "CLIENT", session === null || session === void 0 ? void 0 : session.access_token);
		});
	}
	_handleTokenChanged(event, source, token) {
 new SupabaseClient in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs [Line 1264] (Not in app)
		} else {
			this.accessToken = settings.accessToken;
			this.auth = new Proxy({}, { get: (_, prop) => {
				throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(prop {snip}
			} });
		}
		this.fetch = fetchWithAuth(supabaseKey, supabaseUrl, this._getAccessToken.bind(this), settings.global.fetch, settings.tracePropagation);
		this.realtime = this._initRealtimeClient(_objectSpread2({  <-- SUSPECT LINE
			headers: this.headers,
			accessToken: this._getAccessToken.bind(this),
			fetch: this.fetch
		}, settings.realtime));
		if (this.accessToken) Promise.resolve(this.accessToken()).then((token) => this.realtime.setAuth(token)).catch((e) => console.warn("Failed  {snip}
		this.rest = new _supabase_postgrest_js.PostgrestClient(new URL("rest/v1", baseUrl).href, {
			headers: this.headers,
 createClient in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs [Line 1462] (Not in app)
* import { createClient } from '@supabase/supabase-js'
*
* const supabase = createClient('https://xyzcompany.supabase.co', 'your-publishable-key')
* const { data, error } = await supabase.from('profiles').select('*')
* ```
*/
const createClient = (supabaseUrl, supabaseKey, options) => {
	return new SupabaseClient(supabaseUrl, supabaseKey, options);  <-- SUSPECT LINE
};
function shouldShowDeprecationWarning() {
	if (typeof window !== "undefined") return false;
	const _process = globalThis["process"];
	if (!_process) return false;
	const processVersion = _process["version"];
	if (processVersion === void 0 || processVersion === null) return false;
 getSupabaseAdmin in C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\supabase-admin.js [Line 19] (In app)
    if (client)
        return client;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured.');
    }
    client = (0, supabase_js_1.createClient)(url, key, {  <-- SUSPECT LINE
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return client;
}
exports.getSupabaseAdmin = getSupabaseAdmin;
//# sourceMappingURL=supabase-admin.js.map
 Unknown function in C:\Users\DELL\Desktop\lyxo-app\backend\dist\routes\profiles.js [Line 157] (In app)
        return;
    }
    const ipCountry = (0, geo_ip_1.lookupCountryFromIp)(req.ip ?? '');
    const { billingRegion, conflict } = (0, billing_region_1.computeBillingRegion)(declared_country ?? null, ipCountry);
    if (conflict) {
        logger_1.logger.warn({ userId: req.auth.userId, declaredCountry: declared_country, ipCountry }, 'billing_region conflict: declared c {snip}
    }
    const { data, error } = await (0, supabase_admin_1.getSupabaseAdmin)()  <-- SUSPECT LINE
        .from('profiles')
        .update({
        billing_region: billingRegion,
        ...(declared_country ? { country: declared_country } : {}),
    })
        .eq('id', req.auth.userId)
        .select('id, billing_region, country')
 Unknown function in C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\async-handler.js [Line 10] (In app)
exports.asyncHandler = void 0;
// Express 4 ne relaie pas automatiquement les rejets de promesse d'un
// handler async vers le middleware d'erreur — sans ce wrapper une
// exception async serait silencieuse (requête qui pend) plutôt que de
// tomber dans error-handler.ts.
function asyncHandler(fn) {
    return (req, res, next) => {
        fn(req, res, next).catch(next);  <-- SUSPECT LINE
    };
}
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=async-handler.js.map
 Layer.handle [as handle_request] in C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\express\lib\router\layer.js [Line 95] (Not in app)

  if (fn.length > 3) {
    // not a standard request handler
    return next();
  }

  try {
    fn(req, res, next);  <-- SUSPECT LINE
  } catch (err) {
    next(err);
  }
};

/**
 * Check if this route matches `path`, if so
```

## Request

PATCH http://localhost:3000/v1/profiles/me/billing-region

Body:

```
{
  "declared_country": "CM"
}
```


Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })
at WebSocketFactory.getWebSocketConstructor (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\lib\websocket-factory.js:103:15)
at RealtimeClient._initializeOptions (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js:642:164)
at new RealtimeClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js:185:43)
at SupabaseClient._initRealtimeClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1429:10)
at new SupabaseClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1264:24)
at createClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1462:9)
at getSupabaseAdmin (C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\supabase-admin.js:19:45)
at ? (C:\Users\DELL\Desktop\lyxo-app\backend\dist\routes\profiles.js:157:73)
at ? (C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\async-handler.js:10:9)
at Layer.handle [as handle_request] (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\express\lib\router\layer.js:95:5)

Error: Node.js 20 detected without native WebSocket support.

Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })
at WebSocketFactory.getWebSocketConstructor (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\lib\websocket-factory.js:103:15)
at RealtimeClient._initializeOptions (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js:642:164)
at new RealtimeClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\realtime-js\dist\main\RealtimeClient.js:185:43)
at SupabaseClient._initRealtimeClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1429:10)
at new SupabaseClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1264:24)
at createClient (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\@supabase\supabase-js\dist\index.cjs:1462:9)
at getSupabaseAdmin (C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\supabase-admin.js:19:45)
at ? (C:\Users\DELL\Desktop\lyxo-app\backend\dist\routes\profiles.js:157:73)
at ? (C:\Users\DELL\Desktop\lyxo-app\backend\dist\lib\async-handler.js:10:9)
at Layer.handle [as handle_request] (C:\Users\DELL\Desktop\lyxo-app\backend\node_modules\express\lib\router\layer.js:95:5)
