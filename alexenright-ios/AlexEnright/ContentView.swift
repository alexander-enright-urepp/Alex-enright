import SwiftUI
import WebKit
import SafariServices
import UserNotifications
import StoreKit

struct ContentView: View {
    @State private var showSafari = false
    @State private var safariURL: URL?
    @State private var showImagePicker = false
    @State private var imagePickerSource: UIImagePickerController.SourceType = .photoLibrary
    @State private var showCommunitySheet = false
    @State private var selectedImage: UIImage?
    @State private var showImagePreview = false

    // IAP States
    @StateObject private var purchaseVM = PurchaseViewModel()
    @State private var showPurchaseSheet = false

    var body: some View {
        NavigationStack {
            ZStack {
                WebView(
                    url: URL(string: "https://alexenright.com")!,
                    onExternalLink: { url in
                        // Ensure URL is valid and properly formatted
                        guard url.absoluteString.hasPrefix("http") else {
                            print("Invalid external link URL: \(url.absoluteString)")
                            return
                        }
                        // Small delay to ensure UI is ready
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            safariURL = url
                            showSafari = true
                        }
                    },
                    onCommunityPageDetected: { isCommunity in
                        // Could use this to conditionally show + button
                    }
                )
            }
            .navigationTitle("Alex Enright")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: {
                            NotificationCenter.default.post(name: .reloadWebView, object: nil)
                        }) {
                            Label("Refresh", systemImage: "arrow.clockwise")
                        }

                        Button(action: {
                            safariURL = URL(string: "https://alexenright.com")
                            showSafari = true
                        }) {
                            Label("Open in Safari", systemImage: "safari")
                        }

                        Divider()

                        Button(action: {
                            NotificationCenter.default.post(name: .goHome, object: nil)
                        }) {
                            Label("Go Home", systemImage: "house")
                        }

                        Divider()
                        
                        if !purchaseVM.isPurchased {
                            Button(action: {
                                showPurchaseSheet = true
                            }) {
                                Label("Unlock Games ($2.99)", systemImage: "lock.open")
                            }
                        } else {
                            Button(action: {}) {
                                Label("Games Unlocked", systemImage: "checkmark.seal.fill")
                            }
                            .disabled(true)
                        }
                        
                        Divider()

                        Button(action: {
                            requestNotificationPermissions()
                        }) {
                            Label("Enable Notifications", systemImage: "bell.badge")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
        }
            .sheet(isPresented: $showSafari) {
            // Only show SafariView if we have a valid URL
            if let url = safariURL, url.absoluteString.hasPrefix("http") {
                SafariView(url: url)
            }
        }
        .sheet(isPresented: $showPurchaseSheet) {
            PurchaseSheet(viewModel: purchaseVM)
        }
        .onAppear {
            setupNotifications()
            purchaseVM.checkPurchaseStatus()
            setupIAPNotifications()
        }
    }
    
    func setupIAPNotifications() {
        NotificationCenter.default.addObserver(forName: .showIAPPurchase, object: nil, queue: .main) { _ in
            showPurchaseSheet = true
        }
        NotificationCenter.default.addObserver(forName: .showIAPRestore, object: nil, queue: .main) { _ in
            purchaseVM.restorePurchases()
        }
    }

    func setupNotifications() {
        UNUserNotificationCenter.current().delegate = NotificationDelegate.shared
    }

    func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }

    func uploadPost(image: UIImage, description: String) {
        // Convert image to data
        guard let imageData = image.jpegData(compressionQuality: 0.8) else { return }

        // Create multipart form data request
        let url = URL(string: "https://alexenright.com/api/community/post")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"

        let boundary = UUID().uuidString
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        var body = Data()

        // Add description field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"description\"\r\n\r\n".data(using: .utf8)!)
        body.append("\(description)\r\n".data(using: .utf8)!)

        // Add image field
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"image\"; filename=\"post.jpg\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: image/jpeg\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n".data(using: .utf8)!)

        body.append("--\(boundary)--\r\n".data(using: .utf8)!)

        request.httpBody = body

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    print("Upload error: \(error)")
                    // Show error alert
                } else {
                    // Refresh webview to show new post
                    NotificationCenter.default.post(name: .reloadWebView, object: nil)
                }
            }
        }.resume()
    }
}

// MARK: - WebView with External Link Handling
struct WebView: UIViewRepresentable {
    let url: URL
    let onExternalLink: (URL) -> Void
    let onCommunityPageDetected: (Bool) -> Void

    @ObservedObject private var webViewState = WebViewState.shared

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        // Enable web storage for offline support
        config.websiteDataStore = .default()
        
        // Add message handlers for IAP and page observation
        config.userContentController.add(context.coordinator, name: "pageObserver")
        config.userContentController.add(context.coordinator, name: "iapHandler")
        
        // Inject JavaScript to expose IAP status to web app
        let iapScript = """
            window.iapBridge = {
                isPurchased: () => {
                    return window.webkit.messageHandlers.iapHandler.postMessage('checkStatus');
                },
                purchase: () => {
                    return window.webkit.messageHandlers.iapHandler.postMessage('purchase');
                },
                restore: () => {
                    return window.webkit.messageHandlers.iapHandler.postMessage('restore');
                }
            };
            // Notify web app that bridge is ready
            window.dispatchEvent(new Event('iapBridgeReady'));
        """
        let userScript = WKUserScript(source: iapScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic

        // Add pull to refresh
        let refreshControl = UIRefreshControl()
        refreshControl.addTarget(context.coordinator, action: #selector(Coordinator.handleRefresh(_:)), for: .valueChanged)
        webView.scrollView.refreshControl = refreshControl

        // Load initial URL
        let request = URLRequest(url: url)
        webView.load(request)

        // Store reference for external access
        context.coordinator.webView = webView
        WebViewState.shared.webView = webView

        // Listen for notification-based actions
        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(Coordinator.reloadFromNotification),
            name: .reloadWebView,
            object: nil
        )

        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(Coordinator.goHome),
            name: .goHome,
            object: nil
        )

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var parent: WebView
        var webView: WKWebView?

        init(_ parent: WebView) {
            self.parent = parent
        }

        @objc func handleRefresh(_ sender: UIRefreshControl) {
            webView?.reload()
            sender.endRefreshing()
        }

        @objc func reloadFromNotification() {
            webView?.reload()
        }

        @objc func goHome() {
            if let url = URL(string: "https://alexenright.com") {
                webView?.load(URLRequest(url: url))
            }
        }

        @objc func navigateToURL(_ notification: Notification) {
            if let urlString = notification.object as? String,
               let url = URL(string: urlString) {
                webView?.load(URLRequest(url: url))
            }
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if message.name == "pageObserver" {
                if let body = message.body as? String {
                    parent.onCommunityPageDetected(body.contains("community"))
                }
            } else if message.name == "iapHandler" {
                if let action = message.body as? String {
                    handleIAPAction(action)
                }
            }
        }
        
        func handleIAPAction(_ action: String) {
            let iapManager = IAPManager.shared
            
            switch action {
            case "checkStatus":
                let isPurchased = iapManager.isPurchased(productID: "com.alexenright")
                let status = isPurchased ? "purchased" : "not_purchased"
                let script = "window.dispatchEvent(new CustomEvent('iapStatusChanged', { detail: { status: '\(status)' }}));"
                webView?.evaluateJavaScript(script, completionHandler: nil)
                
            case "purchase":
                NotificationCenter.default.post(name: .showIAPPurchase, object: nil)
                
            case "restore":
                NotificationCenter.default.post(name: .showIAPRestore, object: nil)
                
            default:
                break
            }
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            
            let urlString = url.absoluteString

            // Allow Spotify embeds to load in webview
            if urlString.contains("spotify.com/embed") || urlString.contains("open.spotify.com") {
                decisionHandler(.allow)
                return
            }

            // Handle external links - open in-app sheet
            if let host = url.host, !host.contains("alexenright.com") {
                // Ensure we're not already showing a sheet
                DispatchQueue.main.async {
                    self.parent.onExternalLink(url)
                }
                decisionHandler(.cancel)
                return
            }
            
            decisionHandler(.allow)
        }
    }
}

// MARK: - State Management
class WebViewState: ObservableObject {
    static let shared = WebViewState()
    weak var webView: WKWebView?
}

// MARK: - Notifications
extension Notification.Name {
    static let reloadWebView = Notification.Name("reloadWebView")
    static let goHome = Notification.Name("goHome")
    static let navigateToURLNotification = Notification.Name("navigateToURL")
    static let showIAPPurchase = Notification.Name("showIAPPurchase")
    static let showIAPRestore = Notification.Name("showIAPRestore")
}

// MARK: - Notification Delegate
class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    static let shared = NotificationDelegate()

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }

    func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse, withCompletionHandler completionHandler: @escaping () -> Void) {
        // Handle notification tap - could navigate to specific post
        NotificationCenter.default.post(name: .reloadWebView, object: nil)
        completionHandler()
    }
}

// MARK: - Safari View
struct SafariView: UIViewControllerRepresentable {
    let url: URL
    @Environment(\.dismiss) var dismiss
    
    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        let safariVC = SFSafariViewController(url: url, configuration: config)
        safariVC.preferredControlTintColor = .systemBlue
        safariVC.delegate = context.coordinator
        return safariVC
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(dismiss: dismiss)
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
    
    class Coordinator: NSObject, SFSafariViewControllerDelegate {
        let dismiss: DismissAction
        
        init(dismiss: DismissAction) {
            self.dismiss = dismiss
        }
        
        func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
            dismiss()
        }
    }
}

// MARK: - Community Post View
struct CommunityPostView: View {
    let onCameraTap: () -> Void
    let onPhotoLibraryTap: () -> Void
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Text("Create a Post")
                    .font(.title)
                    .fontWeight(.bold)

                VStack(spacing: 20) {
                    Button(action: onCameraTap) {
                        HStack {
                            Image(systemName: "camera.fill")
                                .font(.title2)
                            Text("Take a Photo")
                                .font(.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(12)
                    }

                    Button(action: onPhotoLibraryTap) {
                        HStack {
                            Image(systemName: "photo.on.rectangle.angled")
                                .font(.title2)
                            Text("Choose from Library")
                                .font(.headline)
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.gray.opacity(0.2))
                        .foregroundColor(.primary)
                        .cornerRadius(12)
                    }
                }
                .padding(.horizontal, 40)

                Spacer()
            }
            .padding(.top, 40)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Image Picker
struct ImagePicker: UIViewControllerRepresentable {
    let sourceType: UIImagePickerController.SourceType
    @Binding var selectedImage: UIImage?
    let onDismiss: () -> Void

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = sourceType
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker

        init(_ parent: ImagePicker) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            picker.dismiss(animated: true) {
                self.parent.onDismiss()
            }
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            picker.dismiss(animated: true) {
                self.parent.onDismiss()
            }
        }
    }
}

// MARK: - Image Preview View
struct ImagePreviewView: View {
    let image: UIImage
    let onPost: (String) -> Void
    let onCancel: () -> Void

    @State private var description = ""

    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit ()                    .cornerRadius(12)
                    .padding()

                TextField("Add a description...", text: $description, axis: .vertical)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                    .frame(minHeight: 60)

                Spacer()
            }
            .navigationTitle("Preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        onCancel()
                    }
                }

                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Post") {
                        onPost(description)
                    }
                    .fontWeight(.bold)
                }
            }
        }
    }
}

// MARK: - Purchase Sheet
struct PurchaseSheet: View {
    @ObservedObject var viewModel: PurchaseViewModel
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                Spacer()
                
                // Icon
                Image(systemName: "gamecontroller.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                    .symbolEffect(.bounce)
                
                VStack(spacing: 16) {
                    Text("Unlock All Games")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Get unlimited access to all mini games and future updates.")
                        .font(.body)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                VStack(spacing: 12) {
                    // Features
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Coin Flip, Dice, Rock Paper Scissors")
                            .font(.subheadline)
                        Spacer()
                    }
                    
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Tic Tac Toe & Snake")
                            .font(.subheadline)
                        Spacer()
                    }
                    
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.green)
                        Text("Future games included")
                            .font(.subheadline)
                        Spacer()
                    }
                }
                .padding(.horizontal, 40)
                
                Spacer()
                
                // Purchase Button
                Button(action: {
                    viewModel.purchaseGames()
                }) {
                    if viewModel.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Unlock for $2.99")
                            .font(.headline)
                            .fontWeight(.bold)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(16)
                .padding(.horizontal)
                .disabled(viewModel.isLoading)
                
                // Restore Button
                Button(action: {
                    viewModel.restorePurchases()
                }) {
                    Text("Restore Purchases")
                        .font(.subheadline)
                        .foregroundColor(.blue)
                }
                .disabled(viewModel.isLoading)
                
                // Error Message
                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.red)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }
                
                Spacer().frame(height: 20)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
