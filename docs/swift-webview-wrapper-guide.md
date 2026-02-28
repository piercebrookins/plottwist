# PlotTwist iOS WebView Wrapper Guide

This guide explains how to adapt the live web app:

- **Production URL:** `https://plottwist-nine.vercel.app`

into a lightweight Swift iOS app that is basically an in-app browser shell.

---

## 1) What this approach is

You build a native iOS app with a single `WKWebView` that loads your Vercel app.

### Pros
- Fastest path to iPhone delivery
- Reuses your existing React app
- One frontend to maintain

### Cons
- Limited native feel
- App Store review may reject if it feels like “just a website” with no native value
- Offline support is limited unless your web app is designed for it

---

## 2) Recommended architecture

```text
iOS App (SwiftUI shell)
  -> WKWebView
      -> https://plottwist-nine.vercel.app
```

Optional native additions (recommended for App Store acceptance):
- splash/loading state
- native share sheet
- haptics on key actions
- camera/mic permissions (if ever needed)
- push notifications (future)

---

## 3) SwiftUI implementation (minimal)

Create `WebView.swift`:

```swift
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.customUserAgent = "PlotTwist-iOS/1.0"

        let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData)
        webView.load(request)

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("✅ PlotTwist loaded")
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("❌ Navigation failed: \(error.localizedDescription)")
        }
    }
}
```

Then `ContentView.swift`:

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://plottwist-nine.vercel.app")!)
            .ignoresSafeArea()
    }
}
```

---

## 4) App Transport Security (ATS)

Your site is HTTPS, so ATS is fine by default.
No insecure HTTP exceptions should be needed.

---

## 5) Handle external links

If users tap external URLs (privacy policy, docs, etc), open Safari instead of trapping inside your app.

Inside `WKNavigationDelegate`:

```swift
func webView(_ webView: WKWebView,
             decidePolicyFor navigationAction: WKNavigationAction,
             decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
    guard let url = navigationAction.request.url else {
        decisionHandler(.allow)
        return
    }

    let host = url.host ?? ""
    if host.contains("plottwist-nine.vercel.app") {
        decisionHandler(.allow)
    } else {
        UIApplication.shared.open(url)
        decisionHandler(.cancel)
    }
}
```

---

## 6) Improve reliability for game sessions

For party-game usage, add:

1. **Pull-to-refresh disabled** (avoid accidental reload)
2. **Connection banner** when offline
3. **Reopen to same URL** after app background/foreground
4. **Screen awake** during gameplay:

```swift
UIApplication.shared.isIdleTimerDisabled = true
```

Set back to false when leaving game flow.

---

## 7) Recommended web app tweaks for WebView mode

In your React app, detect iOS wrapper UA and adjust behavior:
- larger tap targets
- avoid `window.open` where possible
- reduce heavy animations on low-power devices

Example:

```js
const isIOSWrapper = navigator.userAgent.includes("PlotTwist-iOS/1.0");
```

---

## 8) Build & test checklist

- [ ] Loads `https://plottwist-nine.vercel.app`
- [ ] Works on real iPhone (not only simulator)
- [ ] Room join works across devices
- [ ] Keyboard input on submit screen is smooth
- [ ] Video playback works in WebView
- [ ] Network loss/reconnect behaves gracefully

---

## 9) App Store review risk notes

Apple may reject apps that are only a thin website wrapper.
To improve approval odds, add native value:

- native onboarding screen
- haptic feedback
- native share/invite flow
- app-level settings
- better offline/error states than Safari

If internal/TestFlight only, this is less of a concern.

---

## 10) Future path (if you outgrow pure WebView)

- Keep this WebView shell for quick iteration now.
- Later migrate critical player screens to native SwiftUI views while embedding only host/admin flows via web.

Best hybrid route:
1. Native shell + auth/session
2. Native submit/vote screens
3. Web host display and experiments

---

## 11) Quick summary

You can ship a working iPhone app quickly by wrapping:

`https://plottwist-nine.vercel.app`

with `WKWebView` in SwiftUI.

It’s the fastest route for testing and internal demos, and can be upgraded later into a fuller native app if needed.
