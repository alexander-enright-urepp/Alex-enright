import SwiftUI
import WebKit
import SafariServices
import UserNotifications

struct ContentView: View {
    @State private var showSafari = false
    @State private var safariURL: URL?
    @State private var showImagePicker = false
    @State private var imagePickerSource: UIImagePickerController.SourceType = .photoLibrary
    @State private var showCommunitySheet = false
    @State private var selectedImage: UIImage?
    @State private var showImagePreview = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                WebView(
                    url: URL(string: "https://alexenright.com")!,
                    onExternalLink: { url in
                        safariURL = url
                        showSafari = true
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
            if let url = safariURL {
                SafariView(url: url)
            }
        }
        .onAppear {
            setupNotifications()
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
        
        // Add message handler for detecting page changes
        config.userContentController.add(context.coordinator, name: "pageObserver")
        
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
        
        NotificationCenter.default.addObserver(
            context.coordinator,
            selector: #selector(Coordinator.navigateToURL(_:)),
            name: .navigateToURL,
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
            }
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let url = navigationAction.request.url {
                // Handle external links - open in-app instead of externally
                if let host = url.host, !host.contains("alexenright.com") {
                    // Open external links in-app sheet instead of external Safari
                    parent.onExternalLink(url)
                    decisionHandler(.cancel)
                    return
                }
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
    
    func makeUIViewController(context: Context) -> SFSafariViewController {
        let config = SFSafariViewController.Configuration()
        config.entersReaderIfAvailable = false
        let safariVC = SFSafariViewController(url: url, configuration: config)
        safariVC.preferredControlTintColor = .systemBlue
        return safariVC
    }
    
    func updateUIViewController(_ uiViewController: SFSafariViewController, context: Context) {}
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

#Preview {
    ContentView()
}
